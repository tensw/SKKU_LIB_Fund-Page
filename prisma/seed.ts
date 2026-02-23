import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.donation.deleteMany();
  console.log("Cleared existing donations.");

  const donations = [
    // ===== Original 15 entries (도서관 발전기금) =====
    { name: "이석원", donorType: "직원", amount: BigInt(33333), donatedAt: new Date("2019-10-22"), purpose: "도서관 발전기금" },
    { name: "익명기부자", donorType: "학부", amount: BigInt(50000), donatedAt: new Date("2020-02-11"), purpose: "도서관 발전기금" },
    { name: "익명기부자", donorType: "학부", amount: BigInt(60000), donatedAt: new Date("2021-01-14"), purpose: "도서관 발전기금" },
    { name: "신숙원", donorType: "교원", amount: BigInt(30000000), donatedAt: new Date("2021-12-30"), purpose: "도서관 발전기금" },
    { name: "신숙원", donorType: "교원", amount: BigInt(20000000), donatedAt: new Date("2021-12-31"), purpose: "도서관 발전기금" },
    { name: "익명기부자", donorType: "학부", amount: BigInt(70000), donatedAt: new Date("2022-01-13"), purpose: "도서관 발전기금" },
    { name: "김달원", donorType: "직원", amount: BigInt(20000), donatedAt: new Date("2022-01-18"), purpose: "도서관 발전기금" },
    { name: "익명기부자", donorType: "학부", amount: BigInt(70000), donatedAt: new Date("2022-02-15"), purpose: "도서관 발전기금" },
    { name: "김달원", donorType: "직원", amount: BigInt(20000), donatedAt: new Date("2022-02-18"), purpose: "도서관 발전기금" },
    { name: "익명기부자", donorType: "학부", amount: BigInt(70000), donatedAt: new Date("2022-03-15"), purpose: "도서관 발전기금" },
    { name: "박지성", donorType: "동문", amount: BigInt(1000000), donatedAt: new Date("2022-04-01"), purpose: "도서관 발전기금" },
    { name: "손흥민", donorType: "동문", amount: BigInt(5000000), donatedAt: new Date("2022-04-05"), purpose: "도서관 발전기금" },
    { name: "김연아", donorType: "교원", amount: BigInt(250000), donatedAt: new Date("2022-04-10"), purpose: "도서관 발전기금" },
    { name: "아이유", donorType: "일반", amount: BigInt(10000000), donatedAt: new Date("2022-04-12"), purpose: "도서관 발전기금" },
    { name: "유재석", donorType: "일반", amount: BigInt(50000), donatedAt: new Date("2022-04-20"), purpose: "도서관 발전기금" },

    // ===== Additional 15 entries (1398 LibraryON) =====
    { name: "정하윤", donorType: "동문", amount: BigInt(500000), donatedAt: new Date("2023-01-15"), purpose: "1398 LibraryON" },
    { name: "최민준", donorType: "학부", amount: BigInt(100000), donatedAt: new Date("2023-03-20"), purpose: "1398 LibraryON" },
    { name: "이서연", donorType: "교원", amount: BigInt(5000000), donatedAt: new Date("2023-05-08"), purpose: "1398 LibraryON" },
    { name: "강도현", donorType: "직원", amount: BigInt(30000), donatedAt: new Date("2023-07-12"), purpose: "1398 LibraryON" },
    { name: "윤지호", donorType: "일반", amount: BigInt(2000000), donatedAt: new Date("2023-09-01"), purpose: "1398 LibraryON" },
    { name: "한소희", donorType: "동문", amount: BigInt(3000000), donatedAt: new Date("2023-11-25"), purpose: "1398 LibraryON" },
    { name: "익명기부자", donorType: "학부", amount: BigInt(80000), donatedAt: new Date("2024-01-10"), purpose: "1398 LibraryON" },
    { name: "오태양", donorType: "교원", amount: BigInt(15000000), donatedAt: new Date("2024-03-05"), purpose: "1398 LibraryON" },
    { name: "배수진", donorType: "직원", amount: BigInt(50000), donatedAt: new Date("2024-04-18"), purpose: "1398 LibraryON" },
    { name: "임채원", donorType: "동문", amount: BigInt(1500000), donatedAt: new Date("2024-06-22"), purpose: "1398 LibraryON" },
    { name: "장예린", donorType: "일반", amount: BigInt(200000), donatedAt: new Date("2024-08-30"), purpose: "1398 LibraryON" },
    { name: "송민서", donorType: "학부", amount: BigInt(90000), donatedAt: new Date("2024-10-14"), purpose: "1398 LibraryON" },
    { name: "권혁준", donorType: "동문", amount: BigInt(7000000), donatedAt: new Date("2025-01-07"), purpose: "1398 LibraryON" },
    { name: "문서영", donorType: "교원", amount: BigInt(400000), donatedAt: new Date("2025-03-19"), purpose: "1398 LibraryON" },
    { name: "조은비", donorType: "일반", amount: BigInt(1000000), donatedAt: new Date("2025-06-01"), purpose: "1398 LibraryON" },
  ];

  const result = await prisma.donation.createMany({
    data: donations,
  });

  console.log(`Seeded ${result.count} donations.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
