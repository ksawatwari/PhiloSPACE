"use client";
// components/KnowledgeGraph.tsx — กราฟความรู้แบบ force-directed (d3-force คำนวณตำแหน่ง, React วาด SVG)
// - ลากโหนดได้ / คลิกหรือกด Enter เพื่อดูรายละเอียด / เส้นของโหนดที่เลือกจะถูกเน้น
// - คำนวณตำแหน่งล่วงหน้า 300 รอบก่อนแสดงผล จึงไม่มีภาพเคลื่อนไหวตอนโหลด (เหมาะกับผู้ที่ตั้งค่า reduce motion)
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide, type SimulationNodeDatum, type Simulation } from "d3-force";
import type { GraphData, GraphNode } from "@/lib/graph";

type N = GraphNode & SimulationNodeDatum;
type L = { source: string | N; target: string | N };
const W = 900, H = 640, PAD = 44;

// สีตามสายธารความคิด; โหนดที่ยังไม่มีบทความใช้สีเทา + เส้นประ
const PALETTE = ["var(--verdigris)", "var(--lapis)", "#b7791f", "#b4536a", "#6b7f3a", "#7a5ea8", "#2f8ab0"];
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

type TermRef = { slug: string; term_th: string; related_thinkers: string[] };
export function KnowledgeGraph({ data, terms = [] }: { data: GraphData; terms?: TermRef[] }) {
  const [, force] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const simRef = useRef<Simulation<N, undefined> | null>(null);
  const drag = useRef<{ id: string; moved: boolean } | null>(null);

  // สำเนาข้อมูลเพื่อให้ d3 แก้ x/y ได้โดยไม่แตะ props
  const nodes = useMemo<N[]>(() => data.nodes.map((n) => ({ ...n })), [data]);
  const links = useMemo<L[]>(() => data.links.map((l) => ({ ...l })), [data]);
  const byId = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  const colorOf = useMemo(() => {
    const traditions = [...new Set(data.nodes.filter((n) => !n.ghost).map((n) => n.tradition))];
    return (n: GraphNode) => (n.ghost ? "var(--muted)" : PALETTE[traditions.indexOf(n.tradition) % PALETTE.length]);
  }, [data]);
  const legend = useMemo(() => [...new Set(data.nodes.filter((n) => !n.ghost).map((n) => n.tradition))].map((t) => ({ t, c: colorOf({ tradition: t, ghost: false } as GraphNode) })), [data, colorOf]);

  useEffect(() => {
    const keepInside = () => nodes.forEach((n) => { n.x = clamp(n.x ?? W / 2, PAD, W - PAD); n.y = clamp(n.y ?? H / 2, PAD, H - PAD); });
    const sim = forceSimulation<N>(nodes)
      .force("link", forceLink<N, L>(links).id((d) => d.id).distance(100).strength(0.5))
      .force("charge", forceManyBody().strength(-520))
      .force("center", forceCenter(W / 2, H / 2))
      .force("collide", forceCollide(42))
      .stop();
    sim.tick(300); keepInside(); force((v) => v + 1);
    sim.on("tick", () => { keepInside(); force((v) => v + 1); });
    simRef.current = sim;
    return () => { sim.stop(); };
  }, [nodes, links]);

  const toSvg = (e: React.PointerEvent) => {
    const svg = svgRef.current!; const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
    return pt.matrixTransform(svg.getScreenCTM()!.inverse());
  };
  const onDown = (e: React.PointerEvent, n: N) => {
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    drag.current = { id: n.id, moved: false };
    n.fx = n.x; n.fy = n.y;
    simRef.current?.alphaTarget(0.25).restart();
  };
  const onMove = (e: React.PointerEvent, n: N) => {
    if (!drag.current) return;
    drag.current.moved = true;
    const p = toSvg(e); n.fx = clamp(p.x, PAD, W - PAD); n.fy = clamp(p.y, PAD, H - PAD);
  };
  const onUp = (n: N) => {
    n.fx = null; n.fy = null;
    simRef.current?.alphaTarget(0);
    if (drag.current && !drag.current.moved) setSelected((s) => (s === n.id ? null : n.id));
    drag.current = null;
  };

  const neighbors = useMemo(() => {
    const s = new Set<string>(); if (!selected) return s;
    data.links.forEach((l) => { if (l.source === selected) s.add(l.target); if (l.target === selected) s.add(l.source); });
    return s;
  }, [selected, data]);
  const sel = selected ? data.nodes.find((n) => n.id === selected) : null;
  const names = (ids: string[]) => ids.map((i) => data.nodes.find((n) => n.id === i)?.label ?? i).join(", ") || "—";
  const from = selected ? data.links.filter((l) => l.target === selected).map((l) => l.source) : [];
  const to = selected ? data.links.filter((l) => l.source === selected).map((l) => l.target) : [];

  return (
    <section id="graph" aria-label="กราฟความสัมพันธ์ทางความคิด">
      <h2 className="font-serif text-2xl font-bold">กราฟความสัมพันธ์ทางความคิด</h2>
      <p className="mt-1 text-sm text-muted">ลูกศรชี้จากผู้ให้อิทธิพลไปยังผู้รับอิทธิพล ลากโหนดเพื่อจัดตำแหน่ง คลิกเพื่อดูรายละเอียด โหนดเส้นประคือผู้ที่ถูกอ้างถึงแต่ยังไม่มีบทความ</p>

      <div className="mt-4 rounded-xl border border-line bg-surface">
        <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="h-auto w-full touch-none select-none" role="group" aria-label="กราฟความรู้">
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0 0L10 5L0 10z" fill="var(--muted)" />
            </marker>
          </defs>

          {links.map((l, i) => {
            const s = l.source as N, t = l.target as N;
            if (s.x == null || t.x == null) return null;
            const dx = t.x! - s.x!, dy = t.y! - s.y!, d = Math.hypot(dx, dy) || 1;
            const rT = t.ghost ? 13 : 19;   // หยุดเส้นก่อนถึงขอบวงกลมเพื่อให้ลูกศรไม่ถูกบัง
            const active = selected && (s.id === selected || t.id === selected);
            return (
              <line key={i} x1={s.x} y1={s.y} x2={t.x! - (dx / d) * rT} y2={t.y! - (dy / d) * rT}
                stroke={active ? "var(--verdigris)" : "var(--muted)"} strokeWidth={active ? 2 : 1}
                opacity={selected && !active ? 0.15 : 0.7} markerEnd="url(#arrow)" />
            );
          })}

          {nodes.map((n) => {
            const dim = selected && n.id !== selected && !neighbors.has(n.id);
            return (
              <g key={n.id} transform={`translate(${n.x ?? W / 2},${n.y ?? H / 2})`} opacity={dim ? 0.25 : 1}
                tabIndex={0} role="button" aria-label={`${n.label}${n.ghost ? " (ยังไม่มีบทความ)" : ""}`} aria-pressed={selected === n.id}
                className="cursor-grab outline-none focus-visible:[&>circle]:stroke-[3] active:cursor-grabbing"
                onPointerDown={(e) => onDown(e, n)} onPointerMove={(e) => onMove(e, n)} onPointerUp={() => onUp(n)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelected((s) => (s === n.id ? null : n.id)); } }}>
                <circle r={n.ghost ? 10 : 16} fill={n.ghost ? "var(--surface)" : colorOf(n)} stroke={colorOf(n)} strokeWidth={2} strokeDasharray={n.ghost ? "3 3" : undefined} />
                <text y={n.ghost ? 26 : 32} textAnchor="middle" fontSize={n.ghost ? 12 : 14} fontWeight={n.ghost ? 400 : 600}
                  fill="var(--ink)" stroke="var(--surface)" strokeWidth={3} paintOrder="stroke">{n.label}</text>
              </g>
            );
          })}
        </svg>

        <ul className="flex flex-wrap gap-x-4 gap-y-1 border-t border-line px-4 py-2 text-sm text-muted">
          {legend.map((l) => (<li key={l.t} className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full" style={{ background: l.c }} />{l.t}</li>))}
          <li className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full border border-dashed border-muted" />ยังไม่มีบทความ</li>
        </ul>
      </div>

      <div className="mt-3 min-h-[7rem] rounded-xl border border-line p-4 text-[15px]" aria-live="polite">
        {sel ? (
          <>
            <p className="font-serif text-lg font-bold">{sel.label}</p>
            {sel.era && <p className="text-sm text-muted">{sel.era} · {sel.tradition}</p>}
            <p className="mt-2"><span className="text-muted">รับอิทธิพลจาก:</span> {names(from)}</p>
            <p><span className="text-muted">ส่งอิทธิพลต่อ:</span> {names(to)}</p>
            {sel.ghost ? <p className="mt-2 text-sm text-muted">ยังไม่มีบทความของหัวข้อนี้ในคลัง</p>
              : <Link href={`/philosophy/${sel.id}`} className="mt-2 inline-block text-lapis underline">อ่านบทความ</Link>}
            {terms.some((t) => t.related_thinkers.includes(sel.id)) && (
              <p className="mt-2 text-sm"><span className="text-muted">คำศัพท์ที่เกี่ยวข้อง:</span>{" "}
                {terms.filter((t) => t.related_thinkers.includes(sel.id)).map((t, i) => (
                  <span key={t.slug}>{i > 0 && ", "}<Link href={`/glossary/${t.slug}`} className="text-lapis underline">{t.term_th}</Link></span>))}
              </p>)}
          </>
        ) : <p className="text-muted">เลือกโหนดเพื่อดูว่าใครส่งอิทธิพลต่อใคร</p>}
      </div>
    </section>
  );
}
