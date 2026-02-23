import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function getDateRange(period: string): Date | null {
  const now = new Date();

  switch (period) {
    case "1m":
      return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    case "3m":
      return new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    case "6m":
      return new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
    case "all":
    default:
      return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const period = searchParams.get("period") || "all";

    const startDate = getDateRange(period);

    const where = startDate ? { donatedAt: { gte: startDate } } : {};

    const [totalCount, aggregateResult, latestDonation, groupedByPurpose, groupedByDonorType, allDonations] =
      await Promise.all([
        prisma.donation.count({ where }),
        prisma.donation.aggregate({
          where,
          _sum: { amount: true },
          _avg: { amount: true },
        }),
        prisma.donation.findFirst({
          where,
          orderBy: { donatedAt: "desc" },
          select: { donatedAt: true },
        }),
        prisma.donation.groupBy({
          by: ["purpose"],
          where,
          _count: { id: true },
          _sum: { amount: true },
        }),
        prisma.donation.groupBy({
          by: ["donorType"],
          where,
          _count: { id: true },
          _sum: { amount: true },
        }),
        prisma.donation.findMany({
          where,
          select: { donatedAt: true, amount: true },
          orderBy: { donatedAt: "asc" },
        }),
      ]);

    const totalAmount = Number(aggregateResult._sum.amount ?? 0);
    const avgAmount = totalCount > 0 ? Math.round(totalAmount / totalCount) : 0;

    // Build monthly trend from individual donations
    const monthlyMap = new Map<string, { count: number; amount: number }>();

    for (const donation of allDonations) {
      const date = new Date(donation.donatedAt);
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

      const existing = monthlyMap.get(month);
      if (existing) {
        existing.count += 1;
        existing.amount += Number(donation.amount);
      } else {
        monthlyMap.set(month, { count: 1, amount: Number(donation.amount) });
      }
    }

    const monthlyTrend = Array.from(monthlyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month,
        count: data.count,
        amount: data.amount,
      }));

    const byPurpose = groupedByPurpose.map((group) => ({
      purpose: group.purpose,
      count: group._count.id,
      amount: Number(group._sum.amount ?? 0),
    }));

    const byDonorType = groupedByDonorType.map((group) => ({
      donorType: group.donorType,
      count: group._count.id,
      amount: Number(group._sum.amount ?? 0),
    }));

    return NextResponse.json({
      totalCount,
      totalAmount,
      avgAmount,
      latestDonation: latestDonation
        ? latestDonation.donatedAt.toISOString()
        : null,
      monthlyTrend,
      byPurpose,
      byDonorType,
    });
  } catch (error) {
    console.error("GET /api/donations/analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
