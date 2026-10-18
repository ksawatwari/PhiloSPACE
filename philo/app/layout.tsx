// app/layout.tsx — โครงหลัก: ฟอนต์ไทย, ธีม, Header/Sidebar/Footer
import type { Metadata } from "next";
import { Noto_Serif_Thai, Sarabun } from "next/font/google";
import "./globals.css";
import { Shell } from "@/components/Shell";
import { getAllEntries } from "@/lib/content";

// หัวเรื่องใช้ Noto Serif Thai (บรรยากาศหนังสือวิชาการ) / เนื้อหาใช้ Sarabun (อ่านยาวสบายตา)
const serif = Noto_Serif_Thai({ subsets: ["thai", "latin"], weight: ["500", "700"], variable: "--font-serif" });
const sans = Sarabun({ subsets: ["thai", "latin"], weight: ["300", "400", "500", "600"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: { default: "คลังปรัชญา", template: "%s | คลังปรัชญา" },
  description: "สารานุกรมปรัชญาภาษาไทย ตั้งแต่โลกโบราณถึงปัจจุบัน พ.ศ. 2569",
};

// สคริปต์เล็ก ๆ ตั้งธีมก่อน React โหลด เพื่อไม่ให้หน้าจอกะพริบสว่างตอนเปิดโหมดมืด
const themeScript = `try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const nav = getAllEntries().map((e) => ({ slug: e.slug, title: e.title, era: e.era }));
  return (
    <html lang="th" suppressHydrationWarning className={`${serif.variable} ${sans.variable}`}>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body>
        <Shell nav={nav}>{children}</Shell>
      </body>
    </html>
  );
}
