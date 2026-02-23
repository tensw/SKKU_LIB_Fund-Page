import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/UI/Header";
import Footer from "@/components/UI/Footer/Footer";

export const metadata: Metadata = {
  title: "학술정보관 발전기금 | 1398 LibraryON - 성균관대학교",
  description:
    "성균관대학교 학술정보관 1398 LibraryON 프로젝트. 전통을 켜다, 지식을 ON하다. 체험형 지식문화공간, 미래형 첨단 도서관의 기준을 만들어갑니다.",
  openGraph: {
    title: "학술정보관 발전기금 | 1398 LibraryON - 성균관대학교",
    description:
      "성균관대학교 학술정보관 1398 LibraryON 프로젝트. 체험형 지식문화공간, 미래형 첨단 도서관.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#F8F6F2]">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
