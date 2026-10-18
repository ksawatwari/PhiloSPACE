// app/philosophy/page.tsx — แคตตาล็อก + ไทม์ไลน์
import type { Metadata } from "next";
import { getAllEntries } from "@/lib/content";
import { Catalog } from "@/components/Catalog";
import { Timeline } from "@/components/Timeline";
import { KnowledgeGraph } from "@/components/KnowledgeGraph";
import { buildGraph } from "@/lib/graph";
import { getAllTerms } from "@/lib/glossary";

export const metadata: Metadata = { title: "แคตตาล็อกปรัชญา" };

export default function CatalogPage() {
  const entries = getAllEntries(); // อ่านตอน build → ส่งให้ไคลเอนต์ค้นหาทันทีโดยไม่ต้องมี API
  return (
    <div className="mx-auto max-w-5xl space-y-14">
      <header>
        <h1 className="font-serif text-4xl font-bold">คลังปรัชญา</h1>
        <p className="mt-2 max-w-prose text-muted">ค้นหานักคิด สำนัก และแนวคิดจากโลกโบราณถึงปัจจุบัน</p>
      </header>
      <Catalog entries={entries} />
      <KnowledgeGraph data={buildGraph(entries)} terms={getAllTerms().map((t) => ({ slug: t.slug, term_th: t.term_th, related_thinkers: t.related_thinkers }))} />
      <Timeline items={entries.map((e) => ({ slug: e.slug, title: e.title, era: e.era, year: e.timeline_year }))} />
    </div>
  );
}
