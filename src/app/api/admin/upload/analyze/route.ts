import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

function findHeader(headers: string[], candidates: string[]): number {
  for (const candidate of candidates) {
    const index = headers.findIndex(
      (h) =>
        h.replace(/\s+/g, "").toLowerCase() ===
        candidate.replace(/\s+/g, "").toLowerCase()
    );
    if (index !== -1) return index;
  }
  return -1;
}

function parseDate(value: unknown): Date {
  if (value instanceof Date) return value;

  if (typeof value === "number") {
    const excelEpoch = new Date(1899, 11, 30);
    return new Date(excelEpoch.getTime() + value * 86400000);
  }

  if (typeof value === "string") {
    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) return parsed;

    const match = value.match(/(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})/);
    if (match) {
      return new Date(
        parseInt(match[1]),
        parseInt(match[2]) - 1,
        parseInt(match[3])
      );
    }
  }

  return new Date();
}

function parseAmount(value: unknown): bigint {
  if (typeof value === "number") return BigInt(Math.round(value));
  if (typeof value === "bigint") return value;
  if (typeof value === "string") {
    const cleaned = value.replace(/[,\s원₩]/g, "");
    const num = parseInt(cleaned, 10);
    return isNaN(num) ? BigInt(0) : BigInt(num);
  }
  return BigInt(0);
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const rawData: unknown[][] = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: "",
    });

    if (rawData.length < 2) {
      return NextResponse.json(
        { error: "파일이 비어있거나 데이터 행이 없습니다." },
        { status: 400 }
      );
    }

    const headers = (rawData[0] as unknown[]).map((h) => String(h).trim());

    const nameIdx = findHeader(headers, ["기부자", "기부자명", "이름", "name"]);
    const donorTypeIdx = findHeader(headers, [
      "기부자정보", "기부자 정보", "donorType", "기부자유형", "기부자 유형", "유형",
    ]);
    const amountIdx = findHeader(headers, ["기부금액", "기부 금액", "금액", "amount"]);
    const donatedAtIdx = findHeader(headers, [
      "기부일", "기부날짜", "기부 날짜", "기부일자", "기부 일자", "donatedAt", "날짜",
    ]);
    const purposeIdx = findHeader(headers, ["기부용도", "기부 용도", "용도", "purpose"]);
    const noteIdx = findHeader(headers, ["비고", "note", "메모", "노트"]);

    if (nameIdx === -1 || amountIdx === -1) {
      return NextResponse.json(
        { error: "필수 컬럼을 찾을 수 없습니다. 최소 '기부자', '기부금액' 컬럼이 필요합니다." },
        { status: 400 }
      );
    }

    const dataRows = rawData.slice(1).filter((row) => {
      return row.some((cell) => cell !== "" && cell !== null && cell !== undefined);
    });

    const parsed = dataRows.map((row) => ({
      name: String(row[nameIdx] ?? "").trim(),
      donorType: donorTypeIdx !== -1 ? String(row[donorTypeIdx] ?? "").trim() : "개인",
      amount: parseAmount(row[amountIdx]),
      donatedAt: donatedAtIdx !== -1 ? parseDate(row[donatedAtIdx]) : new Date(),
      purpose: purposeIdx !== -1 ? String(row[purposeIdx] ?? "").trim() : "일반기부",
      note: noteIdx !== -1 ? String(row[noteIdx] ?? "").trim() || null : null,
    }));

    const validRows = parsed.filter((d) => d.name.length > 0);

    if (validRows.length === 0) {
      return NextResponse.json(
        { error: "유효한 기부 데이터 행이 없습니다." },
        { status: 400 }
      );
    }

    // Generate batch ID
    const batchId = crypto.randomUUID();

    // Clean up old staging data (older than 24h)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    await prisma.stagingDonation.deleteMany({
      where: { createdAt: { lt: oneDayAgo } },
    });

    // Fetch all existing donations for comparison
    const existingDonations = await prisma.donation.findMany({
      select: { id: true, name: true, donatedAt: true, purpose: true, amount: true, donorType: true, note: true },
    });

    // Build a lookup map: "name|date|purpose" -> existing donation
    const existingMap = new Map<string, typeof existingDonations[number]>();
    for (const d of existingDonations) {
      const key = `${d.name}|${d.donatedAt.toISOString()}|${d.purpose}`;
      existingMap.set(key, d);
    }

    // Compare each uploaded row against existing data
    const stagingData = validRows.map((row) => {
      const key = `${row.name}|${row.donatedAt.toISOString()}|${row.purpose}`;
      const existing = existingMap.get(key);

      let status = "new";
      let conflictInfo: string | null = null;
      let existingId: number | null = null;

      if (existing) {
        const amountMatch = existing.amount === row.amount;
        const donorTypeMatch = existing.donorType === row.donorType;
        const noteMatch = (existing.note ?? "") === (row.note ?? "");

        if (amountMatch && donorTypeMatch && noteMatch) {
          status = "duplicate";
        } else {
          status = "conflict";
          existingId = existing.id;
          conflictInfo = JSON.stringify({
            existingAmount: Number(existing.amount),
            existingDonorType: existing.donorType,
            existingNote: existing.note,
          });
        }
      }

      return {
        batchId,
        name: row.name,
        donorType: row.donorType,
        amount: row.amount,
        donatedAt: row.donatedAt,
        purpose: row.purpose,
        note: row.note,
        status,
        conflictInfo,
        existingId,
      };
    });

    // Insert all into staging table
    await prisma.stagingDonation.createMany({ data: stagingData });

    // Fetch back with IDs for the response
    const staged = await prisma.stagingDonation.findMany({
      where: { batchId },
      orderBy: { id: "asc" },
    });

    // Check if seed data exists
    const seedCount = await prisma.donation.count({ where: { source: "seed" } });

    // Build summary
    const summary = {
      total: staged.length,
      new: staged.filter((s) => s.status === "new").length,
      duplicate: staged.filter((s) => s.status === "duplicate").length,
      conflict: staged.filter((s) => s.status === "conflict").length,
    };

    return NextResponse.json({
      batchId,
      summary,
      hasSeedData: seedCount > 0,
      seedCount,
      rows: staged.map((s) => ({
        id: s.id,
        name: s.name,
        donorType: s.donorType,
        amount: Number(s.amount),
        donatedAt: s.donatedAt,
        purpose: s.purpose,
        note: s.note,
        status: s.status,
        conflictInfo: s.conflictInfo ? JSON.parse(s.conflictInfo) : null,
        existingId: s.existingId,
      })),
    });
  } catch (error) {
    console.error("POST /api/admin/upload/analyze error:", error);
    return NextResponse.json(
      { error: "파일 분석 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
