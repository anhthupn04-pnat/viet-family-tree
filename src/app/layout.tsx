import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gia Phả Việt — VietFamilyTree | Quản Lý Gia Phả & Dòng Họ Trực Tuyến",
  description:
    "Hệ thống quản lý gia phả dòng họ toàn diện: Cây gia phả tương tác, tra cứu quan hệ xưng hô họ hàng, lịch âm & ngày giỗ, quỹ khuyến học và thư viện số hóa văn bia.",
  keywords: ["gia phả việt", "vietfamilytree", "quản lý dòng họ", "cây gia phả", "xưng hô họ hàng", "lịch âm ngày giỗ"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-[#FDFBF7] text-[#2C2420] antialiased selection:bg-[#8B1E1E] selection:text-white">
        {children}
      </body>
    </html>
  );
}
