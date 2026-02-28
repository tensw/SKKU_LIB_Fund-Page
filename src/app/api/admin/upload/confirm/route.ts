import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface ConfirmRequest {
  batchId: string;
  deleteSeedData?: boolean;
  decisions?: Record<number, "skip" | "overwrite">; // stagingId -> decision
}

export async function POST(request: NextRequest) {
  try {
    const body: ConfirmRequest = await request.json();
    const { batchId, deleteSeedData, decisions = {} } = body;

    if (!batchId) {
      return NextResponse.json(
        { error: "batchId가 필요합니다." },
        { status: 400 }
      );
    }

    const staged = await prisma.stagingDonation.findMany({
      where: { batchId },
      orderBy: { id: "asc" },
    });

    if (staged.length === 0) {
      return NextResponse.json(
        { error: "해당 배치를 찾을 수 없습니다. 만료되었을 수 있습니다." },
        { status: 404 }
      );
    }

    let added = 0;
    let updated = 0;
    let skipped = 0;
    let seedDeleted = 0;

    await prisma.$transaction(async (tx) => {
      // Delete seed data if requested
      if (deleteSeedData) {
        const result = await tx.donation.deleteMany({
          where: { source: "seed" },
        });
        seedDeleted = result.count;
      }

      for (const row of staged) {
        if (row.status === "duplicate") {
          skipped++;
          continue;
        }

        if (row.status === "new") {
          await tx.donation.create({
            data: {
              name: row.name,
              donorType: row.donorType,
              amount: row.amount,
              donatedAt: row.donatedAt,
              purpose: row.purpose,
              note: row.note,
              source: "excel",
            },
          });
          added++;
          continue;
        }

        if (row.status === "conflict") {
          const decision = decisions[row.id] ?? "skip";

          if (decision === "overwrite" && row.existingId) {
            await tx.donation.update({
              where: { id: row.existingId },
              data: {
                name: row.name,
                donorType: row.donorType,
                amount: row.amount,
                donatedAt: row.donatedAt,
                purpose: row.purpose,
                note: row.note,
                source: "excel",
              },
            });
            updated++;
          } else {
            skipped++;
          }
        }
      }

      // Clean up staging
      await tx.stagingDonation.deleteMany({ where: { batchId } });
    });

    return NextResponse.json({
      success: true,
      summary: { added, updated, skipped, seedDeleted },
    });
  } catch (error) {
    console.error("POST /api/admin/upload/confirm error:", error);
    return NextResponse.json(
      { error: "확정 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
