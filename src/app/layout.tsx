import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CyPass Link Service",
  description: "株式会社CyPassにて進行中の受託案件および提携プロジェクトにおける、テスト環境へのアクセスツールです。",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
