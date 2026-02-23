import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

function findHeader(
  headers: string[],
  candidates: string[]
): number {
  for (const candidate of candidates) {
    const index = headers.findIndex(
      (h) =>
        h
          .replace(/\s+/g, "")
          .toLowerCase() === candidate.replace(/\s+/g, "").toLowerCase()
    );
    if (index !== -1) return index;
  }
  return -1;
}

function parseDate(value: unknown): Date {
  if (value instanceof Date) return value;

  if (typeof value === "number") {
    // Excel serial date number
    const excelEpoch = new Date(1899, 11, 30);
    return new Date(excelEpoch.getTime() + value * 86400000);
  }

  if (typeof value === "string") {
    // Try common date formats
    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) return parsed;

    // Try YYYY.MM.DD or YYYY-MM-DD or YYYY/MM/DD
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

    // Read as array of arrays to handle flexible headers
    const rawData: unknown[][] = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: "",
    });

    if (rawData.length < 2) {
      return NextResponse.json(
        { error: "File is empty or has no data rows" },
        { status: 400 }
      );
    }

    const headers = (rawData[0] as unknown[]).map((h) => String(h).trim());

    // Flexible header matching
    const nameIdx = findHeader(headers, ["기부자", "기부자명", "이름", "name"]);
    const donorTypeIdx = findHeader(headers, [
      "기부자정보",
      "기부자 정보",
      "donorType",
      "기부자유형",
      "기부자 유형",
      "유형",
    ]);
    const amountIdx = findHeader(headers, [
      "기부금액",
      "기부 금액",
      "금액",
      "amount",
    ]);
    const donatedAtIdx = findHeader(headers, [
      "기부일",
      "기부날짜",
      "기부 날짜",
      "기부일자",
      "기부 일자",
      "donatedAt",
      "날짜",
    ]);
    const purposeIdx = findHeader(headers, [
      "기부용도",
      "기부 용도",
      "용도",
      "purpose",
    ]);
    const noteIdx = findHeader(headers, ["비고", "note", "메모", "노트"]);

    if (nameIdx === -1 || amountIdx === -1) {
      return NextResponse.json(
        {
          error:
            "Required columns not found. Expected at least: 기부자, 기부금액",
        },
        { status: 400 }
      );
    }

    const dataRows = rawData.slice(1).filter((row) => {
      // Skip empty rows
      return row.some((cell) => cell !== "" && cell !== null && cell !== undefined);
    });

    const donations = dataRows.map((row) => ({
      name: String(row[nameIdx] ?? "").trim(),
      donorType:
        donorTypeIdx !== -1
          ? String(row[donorTypeIdx] ?? "").trim()
          : "개인",
      amount: parseAmount(row[amountIdx]),
      donatedAt: donatedAtIdx !== -1 ? parseDate(row[donatedAtIdx]) : new Date(),
      purpose:
        purposeIdx !== -1
          ? String(row[purposeIdx] ?? "").trim()
          : "일반기부",
      note:
        noteIdx !== -1
          ? String(row[noteIdx] ?? "").trim() || null
          : null,
    }));

    // Filter out rows with empty names
    const validDonations = donations.filter((d) => d.name.length > 0);

    if (validDonations.length === 0) {
      return NextResponse.json(
        { error: "No valid donation rows found" },
        { status: 400 }
      );
    }

    await prisma.donation.createMany({
      data: validDonations,
    });

    return NextResponse.json({
      success: true,
      count: validDonations.length,
    });
  } catch (error) {
    console.error("POST /api/admin/upload error:", error);
    return NextResponse.json(
      { error: "Failed to process uploaded file" },
      { status: 500 }
    );
  }
}
