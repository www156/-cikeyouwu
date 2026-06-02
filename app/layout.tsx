import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "此刻有物",
  description: "输入此刻的状态，让一件文物回应你。"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
