import type { Metadata } from "next";
import "./globals.css";

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
      <body>{children}</body>
    </html>
  );
}
