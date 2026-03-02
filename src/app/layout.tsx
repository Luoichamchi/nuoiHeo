import { TopNav } from "@/components/ui/top-nav";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HeoVC",
  description: "Web app binh chon va tong hop cong no"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <TopNav />
        <main>{children}</main>
      </body>
    </html>
  );
}
