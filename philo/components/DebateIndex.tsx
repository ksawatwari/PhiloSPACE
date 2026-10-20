"use client";
// components/DebateIndex.tsx — ค้นหาและกรองข้อโต้แย้ง/การทดลองทางความคิดตามประเภท
import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { Debate } from "@/lib/debates";
import { DEBATE_KINDS } from "@/lib/debates";

export function DebateIndex({ debates }: { debates: Debate[] }) {
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<string | null>(null);
  const hits = useMemo(() => {
    const n = q.trim().toLowerCase();
    return debates.filter((d) => (!kind || d.kind === kind) && (!n || [d.title, d.original_name, d.summary, ...d.branch].join(" ").toLowerCase().includes(n)));
  }, [debates, q, kind]);
  return (
    <div>
      <label className="glass flex items-center gap-3 rounded-xl border border-line px-4 py-3">
        <Search size={20} className="text-muted" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ค้นหาชื่อข้อโต้แย้ง สาขา หรือคำอธิบาย" className="w-full bg-transparent outline-none placeholder:text-muted" />
      </label>
      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="กรองตามประเภท">
        {(Object.keys(DEBATE_KINDS) as (keyof typeof DEBATE_KINDS)[]).map((k) => (
          <button key={k} aria-pressed={kind === k} onClick={() => setKind((v) => (v === k ? null : k))}
            className={`rounded-full border px-3 py-0.5 text-sm ${kind === k ? "border-verdigris bg-verdigris text-paper" : "border-line hover:border-verdigris"}`}>{DEBATE_KINDS[k]}</button>
        ))}
      </div>
      <p className="mt-6 text-sm text-muted">พบ {hits.length} รายการ</p>
      <ul className="mt-3 grid gap-4 sm:grid-cols-2">
        {hits.map((d) => (
          <li key={d.slug}>
            <Link href={`/debates/${d.slug}`} className="block h-full rounded-xl border border-line bg-surface p-5 hover:border-verdigris">
              <p className="text-xs text-muted">{DEBATE_KINDS[d.kind]} · {d.originator}</p>
              <h2 className="mt-1 text-xl font-bold">{d.title}</h2>
              <p className="text-sm italic text-muted">{d.original_name}</p>
              <p className="mt-3 text-[15px]">{d.summary}</p>
            </Link>
          </li>
        ))}
      </ul>
      {hits.length === 0 && <p className="mt-10 text-center text-muted">ไม่พบรายการที่ตรงกัน</p>}
    </div>
  );
}
