"use client";
// components/mdx.tsx — คอมโพเนนต์ที่ใช้ภายในไฟล์ MDX: เชิงอรรถแบบ popover, การ์ดคำคม, กล่องเกร็ดความรู้
import { useState } from "react";
import { Quote, Lightbulb, Copy, Check } from "lucide-react";

/** <Cite n={1} /> — วางเมาส์/แตะ/โฟกัสเพื่ออ่านอ้างอิง; text ถูกใส่จาก frontmatter.citations ที่หน้าบทความ */
export function CitePopover({ n, text }: { n: number; text?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-block" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button type="button" aria-label={`เชิงอรรถ ${n}`} aria-expanded={open} onClick={() => setOpen((v) => !v)} onFocus={() => setOpen(true)} onBlur={() => setOpen(false)}
        className="align-super text-xs font-semibold text-lapis">[{n}]</button>
      {open && (
        <span role="tooltip" className="absolute bottom-full left-1/2 z-30 mb-2 w-72 -translate-x-1/2 rounded-lg border border-line bg-surface p-3 text-sm font-normal leading-relaxed shadow-lg">
          {text ?? "ไม่พบแหล่งอ้างอิง"}
        </span>
      )}
    </span>
  );
}

/** <QuoteCard author="..." source="...">ข้อความ</QuoteCard> — มีปุ่มคัดลอกเพื่อแชร์ */
export function QuoteCard({ author, source, children }: { author: string; source?: string; children: React.ReactNode }) {
  const [done, setDone] = useState(false);
  const copy = async (el: HTMLElement | null) => {
    const text = `${el?.innerText ?? ""}\n— ${author}${source ? `, ${source}` : ""}`;
    try { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1500); } catch {}
  };
  let ref: HTMLElement | null = null;
  return (
    <figure className="not-prose my-8 rounded-xl border-l-4 border-verdigris bg-surface p-6">
      <Quote size={22} className="text-verdigris" />
      <blockquote ref={(r) => { ref = r; }} className="mt-2 font-serif text-xl leading-relaxed">{children}</blockquote>
      <figcaption className="mt-3 flex items-center justify-between text-sm text-muted">
        <span>{author}{source && <> · <cite>{source}</cite></>}</span>
        <button onClick={() => copy(ref)} aria-label="คัดลอกคำคม" className="p-1 hover:text-ink">{done ? <Check size={16} /> : <Copy size={16} />}</button>
      </figcaption>
    </figure>
  );
}

/** <Trivia title="...">...</Trivia> */
export function Trivia({ title = "เกร็ดน่ารู้", children }: { title?: string; children: React.ReactNode }) {
  return (
    <aside className="not-prose my-8 rounded-xl border border-dashed border-lapis/50 p-5">
      <p className="flex items-center gap-2 font-semibold text-lapis"><Lightbulb size={18} /> {title}</p>
      <div className="mt-2 text-[15px]">{children}</div>
    </aside>
  );
}

/** <Term name="dasein">ดาไซน์</Term> — ไฮไลต์ศัพท์ในบทความ; hover/แตะ/โฟกัสเพื่อดูนิยามจากพจนานุกรม */
import Link from "next/link";
export type TermData = { slug: string; term_th: string; term_original: string; definition: string };
export function TermPopover({ term, children }: { term?: TermData; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  if (!term) return <span>{children}</span>; // ไม่พบคำในพจนานุกรม → แสดงข้อความปกติ ไม่ให้หน้าพัง
  return (
    <span className="relative inline-block" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button type="button" aria-expanded={open} onClick={() => setOpen((v) => !v)} onFocus={() => setOpen(true)}
        className="cursor-help border-b border-dotted border-verdigris text-inherit">{children}</button>
      {open && (
        <span className="absolute bottom-full left-1/2 z-30 block w-72 max-w-[80vw] -translate-x-1/2 pb-2">
          <span className="block rounded-lg border border-line bg-surface p-3 text-sm font-normal leading-relaxed text-ink shadow-lg">
            <strong className="font-serif">{term.term_th}</strong> <em className="text-muted">{term.term_original}</em>
            <span className="mt-1 block">{term.definition}</span>
            <Link href={`/glossary/${term.slug}`} className="mt-1 inline-block text-lapis underline">ดูรายละเอียด</Link>
          </span>
        </span>
      )}
    </span>
  );
}
