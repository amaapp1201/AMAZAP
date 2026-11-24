import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/features/ui/sonner";

export const metadata: Metadata = {
  title: "健康促進アプリ",
  description: "職員の健康を促進します。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="min-h-lvh">
        {children}
        <Toaster richColors />
      </body>
    </html>
  );
}
