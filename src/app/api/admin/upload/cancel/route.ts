import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { batchId } = await request.json();

    if (!batchId) {
      return NextResponse.json(
        { error: "batchId가 필요합니다." },
        { status: 400 }
      );
    }

    const result = await prisma.stagingDonation.deleteMany({
      where: { batchId },
    });

    return NextResponse.json({
      success: true,
      deletedCount: result.count,
    });
  } catch (error) {
    console.error("POST /api/admin/upload/cancel error:", error);
    return NextResponse.json(
      { error: "취소 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
