import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "social-scheduler — チャンネル課金を撲滅するSNS予約投稿SaaS",
  description:
    "X、Instagram、LinkedIn など複数のSNSへ予約投稿。Bufferの代替。チャンネル数に関係なくフラット料金$15/月。AIコンテンツ生成・承認フロー・アナリティクス搭載。オープンソース（AGPL）。",
  openGraph: {
    title: "social-scheduler",
    description: "チャンネル課金を撲滅するSNS予約投稿SaaS",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
