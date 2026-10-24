import type { Metadata } from "next";
import { Anton, Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";

const display = Anton({
  subsets: ["latin", "vietnamese"],
  weight: "400",
  variable: "--font-display",
});
const sans = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "ENGINEEROBOTS 2026 – Cuộc thi Robot Tân sinh viên HCMUTE",
  description:
    "Cuộc thi chế tạo robot dành cho tân sinh viên khóa 2026 HCM-UTE: Chặng 1 dò line tự hành, Chặng 2 tích lũy cấu kiện, Chặng 3 chiếm Cứ điểm Vinh quang.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${display.variable} ${sans.variable}`}>{children}</body>
    </html>
  );
}
