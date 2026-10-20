// app/debates/[slug]/page.tsx — หน้าข้อโต้แย้ง: สรุป จุดยืนของแต่ละฝ่าย เนื้อหา MDX นักคิดและศัพท์ที่เกี่ยวข้อง
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { getAllDebates, getDebate, DEBATE_KINDS } from "@/lib/debates";
import { getAllEntries } from "@/lib/content";
import { getAllTerms } from "@/lib/glossary";
import { categoryLabel } from "@/lib/taxonomy";
import { CitePopover, QuoteCard, Trivia, TermPopover } from "@/components/mdx";

export const dynamicParams = false;
export const generateStaticParams = () => getAllDebates().map((d) => ({ slug: d.slug }));
export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const d = getDebate(params.slug);
  return d ? { title: d.meta.title, description: d.meta.summary } : {};
}

export default function DebatePage({ params }: { params: { slug: string } }) {
  const entry = getDebate(params.slug);
  if (!entry) notFound();
  const { meta, content } = entry;
  const thinkers = getAllEntries();
  const terms = getAllTerms();
  const name = (s: string) => thinkers.find((t) => t.slug === s)?.title ?? s;
  const Person = ({ s }: { s: string }) => <Link href={`/philosophy/${s}`} className="text-lapis underline">{name(s)}</Link>;

  const components = {
    Cite: ({ n }: { n: number }) => <CitePopover n={n} text={meta.citations[n - 1]} />,
    Term: ({ name: slug, children }: { name: string; children: React.ReactNode }) => {
      const t = terms.find((x) => x.slug === slug);
      return <TermPopover term={t && { slug: t.slug, term_th: t.term_th, term_original: t.term_original, definition: t.definition }}>{children}</TermPopover>;
    },
    QuoteCard, Trivia,
  };

  return (
    <article className="mx-auto max-w-3xl">
      <Link href="/debates" className="text-sm text-lapis underline">ข้อโต้แย้งและการทดลองทางความคิด</Link>
      <p className="mt-3 text-sm text-muted">{DEBATE_KINDS[meta.kind]} · {meta.originator}</p>
      <h1 className="mt-1 font-serif text-4xl font-bold">{meta.title}</h1>
      <p className="text-lg italic text-muted">{meta.original_name}</p>
      <p className="mt-3 flex flex-wrap gap-2 text-xs">{meta.categories.map((c) => <Link key={c} href={`/category/${c}`} className="rounded-full bg-line/60 px-2.5 py-0.5 text-lapis">{categoryLabel(c)}</Link>)}</p>
      <p className="mt-4 rounded-xl border border-line bg-surface p-4">{meta.summary}</p>

      <div className="prose prose-lg mt-8 max-w-none text-ink prose-headings:text-ink prose-strong:text-ink prose-a:text-lapis dark:prose-invert">
        <MDXRemote source={content} components={components} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
      </div>

      {meta.positions.length > 0 && (
        <section className="mt-10">
          <h2 className="font-serif text-2xl font-bold">จุดยืนของแต่ละฝ่าย</h2>
          <div className="mt-3 space-y-3">
            {meta.positions.map((p) => (
              <details key={p.label} className="rounded-xl border border-line bg-surface px-4 py-3" open>
                <summary className="cursor-pointer font-semibold">{p.label}</summary>
                <p className="mt-2 text-[15px]">{p.claim}</p>
                {p.holders.length > 0 && <p className="mt-2 text-sm text-muted">นักคิดที่เกี่ยวข้อง: {p.holders.map((h, i) => <span key={h}>{i > 0 && ", "}<Person s={h} /></span>)}</p>}
              </details>
            ))}
          </div>
        </section>
      )}

      <section className="mt-10 grid gap-6 sm:grid-cols-2">
        <div>
          <h2 className="font-serif text-xl font-bold">นักคิดหลัก</h2>
          <ul className="mt-2 flex flex-wrap gap-2 text-sm">{meta.key_figures.map((s) => <li key={s}><Link href={`/philosophy/${s}`} className="rounded-full border border-line px-3 py-1 text-lapis hover:border-verdigris">{name(s)}</Link></li>)}</ul>
        </div>
        <div>
          <h2 className="font-serif text-xl font-bold">ศัพท์ที่เกี่ยวข้อง</h2>
          <ul className="mt-2 flex flex-wrap gap-2 text-sm">{meta.related_terms.map((s) => { const t = terms.find((x) => x.slug === s); return t ? <li key={s}><Link href={`/glossary/${s}`} className="rounded-full border border-line px-3 py-1 text-lapis hover:border-verdigris">{t.term_th}</Link></li> : null; })}</ul>
        </div>
      </section>

      {meta.citations.length > 0 && (
        <section className="mt-12 border-t border-line pt-6">
          <h2 className="font-serif text-2xl font-bold">เอกสารอ้างอิง</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-6 text-[15px] text-muted">{meta.citations.map((c, i) => <li key={i}>{c}</li>)}</ol>
        </section>
      )}
    </article>
  );
}
