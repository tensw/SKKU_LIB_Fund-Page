import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

export async function GET() {
  try {
    const donations = await prisma.donation.findMany({
      orderBy: { donatedAt: "desc" },
    });

    const rows = donations.map((donation, index) => ({
      "No.": index + 1,
      "기부자": donation.name,
      "기부자 정보": donation.donorType,
      "기부금액": Number(donation.amount),
      "기부일": donation.donatedAt.toISOString().split("T")[0],
      "기부용도": donation.purpose,
      "비고": donation.note ?? "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "기부내역");

    // Set column widths for better readability
    worksheet["!cols"] = [
      { wch: 6 },  // No.
      { wch: 15 }, // 기부자
      { wch: 15 }, // 기부자 정보
      { wch: 15 }, // 기부금액
      { wch: 12 }, // 기부일
      { wch: 20 }, // 기부용도
      { wch: 30 }, // 비고
    ];

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition":
          'attachment; filename="donations.xlsx"',
      },
    });
  } catch (error) {
    console.error("GET /api/donations/export error:", error);
    return NextResponse.json(
      { error: "Failed to export donations" },
      { status: 500 }
    );
  }
}
