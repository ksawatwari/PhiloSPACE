# คลังปรัชญา (Philosophy Knowledge Platform)

    npm install
    npm run dev   # http://localhost:3000

เพิ่มบทความ: สร้างไฟล์ `content/philosophy/<slug>.mdx` ตาม schema ใน `lib/content.ts`
(slug ใน `influences` / `influenced_by` ต้องตรงกับชื่อไฟล์ของบทความอื่นเพื่อสร้างลิงก์และกราฟ)

ในเนื้อหา MDX ใช้ได้: `<Cite n={1} />`, `<QuoteCard author source>`, `<Trivia>`
