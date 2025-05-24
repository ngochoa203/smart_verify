import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SmartVerify App",
  description: "Xác minh nguồn gốc sản phẩm, kiểm tra hàng giả.",
  metadataBase: new URL("https://your-domain.com"), 
  openGraph: {
    title: "SmartVerify App",
    description: "Ứng dụng giúp kiểm tra và phát hiện hàng giả.",
    type: "website",
    locale: "vi_VN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="bg-white text-gray-800">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <main className="flex-1">{children}</main>
        {/* Bạn có thể thêm Footer hoặc Notification ở đây */}
      </body>
    </html>
  );
}
