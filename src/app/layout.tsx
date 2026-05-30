import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PwaRegister } from "@/components/PwaRegister";

export const metadata: Metadata = {
  title: "BucketCloud",
  description: "내 꿈들이 둥둥 떠다니는 버킷리스트 다이어리",
  appleWebApp: {
    capable: true,
    title: "BucketCloud",
    statusBarStyle: "default"
  }
};

export const viewport: Viewport = {
  themeColor: "#fffaf3",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}
