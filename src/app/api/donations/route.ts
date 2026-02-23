import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

function serializeDonation(donation: {
  id: number;
  name: string;
  donorType: string;
  amount: bigint;
  donatedAt: Date;
  purpose: string;
  note: string | null;
  createdAt: Date;
}) {
  return {
    ...donation,
    amount: Number(donation.amount),
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "10", 10));
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "";
    const purpose = searchParams.get("purpose") || "";
    const sort = searchParams.get("sort") === "asc" ? "asc" : "desc";

    const where: Prisma.DonationWhereInput = {};

    if (search) {
      where.name = { contains: search };
    }

    if (type) {
      where.donorType = type;
    }

    if (purpose) {
      where.purpose = purpose;
    }

    const [data, total] = await Promise.all([
      prisma.donation.findMany({
        where,
        orderBy: { amount: sort },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.donation.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data: data.map(serializeDonation),
      total,
      page,
      totalPages,
    });
  } catch (error) {
    console.error("GET /api/donations error:", error);
    return NextResponse.json(
      { error: "Failed to fetch donations" },
      { status: 500 }
    );
  }
}
