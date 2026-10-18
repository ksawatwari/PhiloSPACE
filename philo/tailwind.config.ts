/** @type {import('tailwindcss').Config} */
// สีผูกกับ CSS variables ใน globals.css เพื่อสลับ light/dark; ฟอนต์ทั้งระบบคือ Anuphan
const anuphan = ["var(--font-anuphan)", "ui-sans-serif", "system-ui", "sans-serif"];

module.exports = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./content/**/*.mdx"],
  theme: {
    extend: {
      colors: {
        paper: "var(--paper)", surface: "var(--surface)", ink: "var(--ink)", muted: "var(--muted)",
        line: "var(--line)", verdigris: "var(--verdigris)", lapis: "var(--lapis)",
      },
      // sans และ serif ชี้ไป Anuphan ทั้งคู่ → คลาส font-serif เดิมที่หัวข้อใช้อยู่จึงเป็น Anuphan ด้วย
      fontFamily: { sans: anuphan, serif: anuphan },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
