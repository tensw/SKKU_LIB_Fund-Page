import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [totalCount, totalAmountResult, groupedByPurpose] = await Promise.all(
      [
        prisma.donation.count(),
        prisma.donation.aggregate({
          _sum: { amount: true },
        }),
        prisma.donation.groupBy({
          by: ["purpose"],
          _count: { id: true },
          _sum: { amount: true },
        }),
      ]
    );

    const totalAmount = Number(totalAmountResult._sum.amount ?? 0);

    const projects = groupedByPurpose.map((group) => ({
      purpose: group.purpose,
      count: group._count.id,
      amount: Number(group._sum.amount ?? 0),
    }));

    return NextResponse.json({
      totalCount,
      totalAmount,
      projects,
    });
  } catch (error) {
    console.error("GET /api/donations/summary error:", error);
    return NextResponse.json(
      { error: "Failed to fetch summary" },
      { status: 500 }
    );
  }
}
