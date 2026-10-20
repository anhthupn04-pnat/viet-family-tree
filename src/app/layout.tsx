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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,600&family=Playfair+Display:ital,wght@0,600;0,700;0,900;1,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#FDFBF7] text-[#1E293B] font-sans antialiased selection:bg-[#C62828] selection:text-white">
        {children}
      </body>
    </html>
  );
}
