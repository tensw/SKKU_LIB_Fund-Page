import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/UI/Header";
import Footer from "@/components/UI/Footer/Footer";

export const metadata: Metadata = {
  title: "학술정보관 발전기금 - 성균관대학교",
  description: "성균관대학교 학술정보관 발전기금",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
