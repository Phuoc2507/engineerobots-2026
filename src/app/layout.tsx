import type { Metadata } from "next";
import { Anton, Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import { getContent } from "@/lib/content-server";
import { themeCss } from "@/lib/content";

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

// Tiêu đề, mô tả, ảnh chia sẻ và biểu tượng tab do BTC đặt ở /admin/content → Logo & ấn phẩm nhận diện
export async function generateMetadata(): Promise<Metadata> {
  const { brand } = await getContent();
  return {
    title: brand.metaTitle,
    description: brand.metaDescription,
    openGraph: { title: brand.metaTitle, description: brand.metaDescription, images: brand.shareImage ? [brand.shareImage] : undefined },
    icons: brand.favicon ? { icon: brand.favicon } : undefined,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Màu BTC đã đổi ở /admin/content (rỗng = dùng mặc định trong globals.css)
  const css = themeCss((await getContent()).theme);
  return (
    <html lang="vi">
      <head>{css ? <style id="theme-colors" dangerouslySetInnerHTML={{ __html: css }} /> : null}</head>
      <body className={`${display.variable} ${sans.variable}`}>{children}</body>
    </html>
  );
}
