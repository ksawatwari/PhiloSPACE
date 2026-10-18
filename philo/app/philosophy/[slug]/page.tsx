// app/philosophy/[slug]/page.tsx — หน้าบทความ: Bio block, TOC แบบพับได้, เนื้อหา MDX, กราฟย่อ, รายการอ้างอิง
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { CalendarDays, Landmark, BookOpen, ListTree } from "lucide-react";
import { getAllEntries, getEntry } from "@/lib/content";
import { getAllTerms } from "@/lib/glossary";
import { buildGraph } from "@/lib/graph";
import { CitePopover, QuoteCard, Trivia, TermPopover } from "@/components/mdx";
import { MiniGraph } from "@/components/MiniGraph";

export const dynamicParams = false;
export function generateStaticParams() { return getAllEntries().map((e) => ({ slug: e.slug })); }
export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const e = getEntry(params.slug);
  return e ? { title: e.meta.title, description: e.meta.summary } : {};
}

const slugify = (s: string) => s.trim().replace(/\s+/g, "-");
const headings = (md: string) => [...md.matchAll(/^##\s+(.+)$/gm)].map((m) => m[1]);

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const entry = getEntry(params.slug);
  if (!entry) notFound();
  const { meta, content } = entry;
  const all = getAllEntries();
  const terms = getAllTerms();
  const graph = buildGraph(all);
  const nameOf = (s: string) => all.find((e) => e.slug === s)?.title ?? s;
  const toc = headings(content);
  const exists = (s: string) => all.some((e) => e.slug === s); // ลิงก์เฉพาะบทความที่มีอยู่จริง

  const components = {
    Cite: ({ n }: { n: number }) => <CitePopover n={n} text={meta.citations[n - 1]} />,
    // <Term name="dasein">…</Term> → ผูกกับ content/glossary/dasein.mdx
    Term: ({ name, children }: { name: string; children: React.ReactNode }) => {
      const t = terms.find((x) => x.slug === name);
      return <TermPopover term={t && { slug: t.slug, term_th: t.term_th, term_original: t.term_original, definition: t.definition }}>{children}</TermPopover>;
    },
    QuoteCard, Trivia,
    h2: (p: React.ComponentProps<"h2">) => <h2 id={slugify(String(p.children))} className="font-serif" {...p} />,
  };
  const relatedTerms = terms.filter((t) => t.related_thinkers.includes(meta.slug)).map((t) => ({ slug: t.slug, term_th: t.term_th }));
  const link = (s: string, i: number) => (
    <span key={s}>{i > 0 && ", "}{exists(s) ? <Link className="text-lapis underline" href={`/philosophy/${s}`}>{nameOf(s)}</Link> : nameOf(s)}</span>
  );

  return (
    <article className="mx-auto max-w-3xl">
      <header className="border-b border-line pb-6">
        <p className="text-sm text-muted">{meta.era} · {meta.tradition}</p>
        <h1 className="mt-1 font-serif text-4xl font-bold">{meta.title}</h1>
        <p className="text-lg text-muted">{meta.original_name}</p>
        <dl className="mt-5 grid gap-3 rounded-xl border border-line bg-surface p-4 text-sm sm:grid-cols-2">
          <div className="flex gap-2"><CalendarDays size={16} className="mt-1 text-verdigris" /><div><dt className="text-muted">ช่วงชีวิต</dt><dd>{meta.birth_death}</dd></div></div>
          <div className="flex gap-2"><Landmark size={16} className="mt-1 text-verdigris" /><div><dt className="text-muted">สาขา</dt><dd>{meta.branch.join(", ")}</dd></div></div>
          <div className="flex gap-2 sm:col-span-2"><BookOpen size={16} className="mt-1 text-verdigris" /><div><dt className="text-muted">แนวคิดสำคัญ</dt>
            <dd className="mt-1 flex flex-wrap gap-2">{meta.key_concepts.map((k) => <span key={k} className="rounded-full border border-line px-2.5 py-0.5">{k}</span>)}</dd></div></div>
        </dl>
        {toc.length > 0 && (
          <details className="mt-4 rounded-xl border border-line px-4 py-2">
            <summary className="flex cursor-pointer items-center gap-2 text-sm"><ListTree size={16} /> สารบัญ</summary>
            <ul className="mt-2 space-y-1 pb-2 text-[15px]">{toc.map((h) => <li key={h}><a className="text-lapis hover:underline" href={`#${slugify(h)}`}>{h}</a></li>)}</ul>
          </details>
        )}
      </header>

      <div className="prose prose-lg mt-8 max-w-none text-ink prose-headings:text-ink prose-strong:text-ink prose-a:text-lapis dark:prose-invert">
        <MDXRemote source={content} components={components} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
      </div>

      <MiniGraph centerId={meta.slug} data={graph} terms={relatedTerms} />

      {meta.citations.length > 0 && (
        <section className="mt-12 border-t border-line pt-6">
          <h2 className="font-serif text-2xl font-bold">เอกสารอ้างอิง</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-6 text-[15px] text-muted">{meta.citations.map((c, i) => <li key={i} id={`ref-${i + 1}`}>{c}</li>)}</ol>
        </section>
      )}
    </article>
  );
}
