import type { Config } from "tailwindcss";

// สีทั้งหมดผูกกับ CSS variables ใน globals.css เพื่อสลับ light/dark ได้โดยไม่ต้องเขียน dark: ซ้ำทุกที่
const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./content/**/*.mdx"],
  theme: {
    extend: {
      colors: {
        paper: "var(--paper)",
        surface: "var(--surface)",
        ink: "var(--ink)",
        muted: "var(--muted)",
        line: "var(--line)",
        verdigris: "var(--verdigris)", // สีเน้นหลัก: สนิมทองแดง
        lapis: "var(--lapis)",         // สีเน้นรอง: ใช้กับลิงก์อ้างอิง/โหนดกราฟ
      },
      fontFamily: {
        serif: ["var(--font-serif)", "serif"],
        sans: ["var(--font-sans)", "sans-serif"],
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
export default config;
