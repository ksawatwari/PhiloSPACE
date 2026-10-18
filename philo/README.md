[README.md](https://github.com/user-attachments/files/33627321/README.md)
# คลังปรัชญา (Philosophy Knowledge Platform)

    npm install
    npm run dev   # http://localhost:3000

เพิ่มบทความ: สร้างไฟล์ `content/philosophy/<slug>.mdx` ตาม schema ใน `lib/content.ts`
(slug ใน `influences` / `influenced_by` ต้องตรงกับชื่อไฟล์ของบทความอื่นเพื่อสร้างลิงก์และกราฟ)

ในเนื้อหา MDX ใช้ได้: `<Cite n={1} />`, `<QuoteCard author source>`, `<Trivia>`

## โครงสร้างหมวดหมู่และพจนานุกรม
- หมวดหมู่อยู่ที่ `lib/taxonomy.ts` (6 หมวด) ระบุในบทความด้วย `categories: ["science-language", ...]`
- คำศัพท์อยู่ที่ `content/glossary/<slug>.mdx` ใช้ในบทความด้วย `<Term name="slug">ข้อความ</Term>`
- ฟอนต์ทั้งระบบคือ Anuphan (`app/layout.tsx` + `tailwind.config.js`)
