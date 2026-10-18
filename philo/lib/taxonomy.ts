// lib/taxonomy.ts — หมวดหมู่ระดับบน (ใช้ร่วมกันทั้งเซิร์ฟเวอร์/ไคลเอนต์)
// บทความระบุหมวดใน frontmatter ด้วย `categories: [slug, ...]` (หลายหมวดได้)
export const CATEGORIES = [
  { slug: "core", th: "ปรัชญาแกนหลักและคลาสสิก", en: "Core & Classical Philosophy", desc: "อภิปรัชญา ญาณวิทยา จริยศาสตร์ และนักคิดรากฐานของประเพณีตะวันตก" },
  { slug: "science-language", th: "ปรัชญาวิทยาศาสตร์และภาษา", en: "Philosophy of Science & Language", desc: "ตรรกศาสตร์ ความหมาย วิธีวิทยา และการเปลี่ยนแปลงของความรู้ทางวิทยาศาสตร์" },
  { slug: "mind-ai", th: "ปรัชญาจิต พุทธิปัญญา และจริยธรรมปัญญาประดิษฐ์", en: "Philosophy of Mind, Cognition & AI Ethics", desc: "จิตสำนึก ความรู้คิด เทคโนโลยี และจริยธรรมประยุกต์" },
  { slug: "political-legal-social", th: "ปรัชญาการเมือง กฎหมาย และสังคม", en: "Political, Legal & Social Philosophy", desc: "ความยุติธรรม อำนาจ รัฐ สิทธิ และชีวิตร่วมกัน" },
  { slug: "feminist-critical", th: "สตรีทัศน์และทฤษฎีวิพากษ์", en: "Feminist & Critical Theory", desc: "การวิพากษ์อุดมการณ์ อำนาจ เพศสภาวะ เทคโนโลยี และวัฒนธรรมร่วมสมัย" },
  { slug: "minor-regional", th: "สายธารความคิดย่อยและภูมิภาค", en: "Minor, Regional & Indigenous Traditions", desc: "นักคิดก่อนซอคราตีส เฮลเลนิสติก สกอลาสติก และประเพณีเอเชีย อิสลาม และโลกอื่น ๆ" },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]["slug"];
export const CATEGORY_SLUGS = CATEGORIES.map((c) => c.slug) as [CategorySlug, ...CategorySlug[]];
export const getCategory = (slug: string) => CATEGORIES.find((c) => c.slug === slug);
export const categoryLabel = (slug: string) => getCategory(slug)?.th ?? slug;
