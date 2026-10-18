// lib/graph.ts — แปลง frontmatter (influences / influenced_by) เป็นข้อมูลกราฟ; ไม่ใช้ fs จึง import ฝั่งไหนก็ได้
import type { Entry } from "./content";

export type GraphNode = { id: string; label: string; era: string; tradition: string; ghost: boolean };
export type GraphLink = { source: string; target: string }; // ทิศทาง: ผู้ให้อิทธิพล → ผู้รับอิทธิพล
export type GraphData = { nodes: GraphNode[]; links: GraphLink[] };

/** ชื่อของ slug ที่ถูกอ้างถึง แต่ยังไม่มีบทความ (แสดงเป็นโหนดเส้นประ) — เพิ่มได้เรื่อย ๆ */
const GHOSTS: Record<string, { label: string; tradition: string }> = {
  socrates: { label: "ซอคราตีส", tradition: "ตะวันตก" },
  parmenides: { label: "ปาร์มีนิดีส", tradition: "ตะวันตก" },
  aristotle: { label: "อริสโตเติล", tradition: "ตะวันตก" },
  hume: { label: "ฮิวม์", tradition: "ตะวันตก" },
  rousseau: { label: "รุสโซ", tradition: "ตะวันตก" },
  leibniz: { label: "ไลบ์นิซ", tradition: "ตะวันตก" },
  hegel: { label: "เฮเกล", tradition: "ตะวันตก" },
  schopenhauer: { label: "โชเพนเฮาเออร์", tradition: "ตะวันตก" },
  marx: { label: "มาร์กซ์", tradition: "ตะวันตก" },
  lacan: { label: "ลากอง", tradition: "ตะวันตก" },
  nietzsche: { label: "นีทเชอ", tradition: "ตะวันตก" },
  heidegger: { label: "ไฮเดกเกอร์", tradition: "ตะวันตก" },
  foucault: { label: "ฟูโกต์", tradition: "ตะวันตก" },
  buddha: { label: "พระพุทธเจ้า", tradition: "อินเดีย–พุทธ" },
  candrakirti: { label: "จันทรกีรติ", tradition: "อินเดีย–พุทธ" },
  "chan-buddhism": { label: "พุทธนิกายฉาน/เซน", tradition: "จีน–เต๋า" },
  zhuangzi: { label: "จวงจื๊อ", tradition: "จีน–เต๋า" },
  husserl: { label: "ฮุสเซิร์ล", tradition: "ตะวันตก" },
  mencius: { label: "เมิ่งจื่อ", tradition: "จีน–ขงจื๊อ" },
  xunzi: { label: "ซวินจื่อ", tradition: "จีน–ขงจื๊อ" },
  gaudapada: { label: "เคาฑปาทะ", tradition: "อินเดีย–เวทานตะ" },
  aquinas: { label: "อไควนัส", tradition: "ตะวันตก" },
  suhrawardi: { label: "สุฮรอวัรดี", tradition: "อิสลาม" },
};

export function buildGraph(entries: Entry[]): GraphData {
  const nodes = new Map<string, GraphNode>();
  entries.forEach((e) => nodes.set(e.slug, { id: e.slug, label: e.title, era: e.era, tradition: e.tradition, ghost: false }));

  const seen = new Set<string>();
  const links: GraphLink[] = [];
  const add = (from: string, to: string) => {
    const key = `${from}>${to}`;
    if (seen.has(key) || from === to) return; // กันเส้นซ้ำเมื่อสองบทความอ้างถึงกันทั้งสองฝั่ง
    seen.add(key);
    for (const id of [from, to]) {
      if (!nodes.has(id)) {
        const g = GHOSTS[id];
        nodes.set(id, { id, label: g?.label ?? id, era: "", tradition: g?.tradition ?? "อื่น ๆ", ghost: true });
      }
    }
    links.push({ source: from, target: to });
  };

  for (const e of entries) {
    e.influences.forEach((t) => add(e.slug, t));
    e.influenced_by.forEach((f) => add(f, e.slug));
  }
  return { nodes: [...nodes.values()], links };
}
