"use client";
// EgoGraph — M5 W-F knowledge-graph ego view. Hand-rolled force layout (zero deps),
// settled ONCE synchronously in useMemo; seed positions come from a string hash of
// node ids (no Math.random) so SSR hydration and tests are deterministic.
// Palette: signal blue #1550D8 via --color-primary only; everything else neutral.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { titleCaseIfShouty } from "@/lib/text";

export interface EgoNode {
  id: string; // "s:<winner_norm>" | "e:<agency>"
  kind: "supplier" | "entity";
  label: string;
  slug: string;
  value: number; // total peso across visible edges
  n: number; // awards
}
export interface EgoLink {
  a: string; // supplier id
  b: string; // entity id
  value: number;
  n: number;
}
// May be {} when there is no data — callers hide the section; we also guard.
export interface EgoData {
  center?: string;
  nodes?: EgoNode[];
  links?: EgoLink[];
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

// ₱1.2B / ₱34.0M style — tooltip-local compact peso.
function pesoCompact(n: number): string {
  if (n >= 1e9) return `₱${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `₱${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `₱${Math.round(n / 1e3)}K`;
  return `₱${Math.round(n)}`;
}

const trunc = (s: string) => (s.length > 18 ? `${s.slice(0, 17)}…` : s);

// FNV-1a — deterministic seed positions per node id.
function fnv(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

type VB = { x: number; y: number; w: number; h: number };

const TICKS = 300;

export default function EgoGraph({ data, height = 420 }: { data: EgoData; height?: number }) {
  const router = useRouter();

  const lay = useMemo(() => {
    const nodes = data.nodes ?? [];
    const links = data.links ?? [];
    const center = data.center ?? "";
    if (nodes.length === 0) return null;

    const n = nodes.length;
    const idx = new Map<string, number>();
    nodes.forEach((d, i) => idx.set(d.id, i));
    const ci = idx.get(center) ?? 0;

    // node radius ∝ sqrt(value), clamped [5, 18] — BELOW the focal's fixed 24, so the
    // page's subject is always the largest mark on the canvas (judge-panel rule)
    const maxV = Math.max(1, ...nodes.map((d) => d.value));
    const r = nodes.map((d) => clamp(Math.sqrt(Math.max(0, d.value) / maxV) * 18, 5, 18));
    r[ci] = 24;
    const maxL = Math.max(1, ...links.map((l) => l.value));

    // deterministic seed ring around the center
    const px = new Float64Array(n), py = new Float64Array(n);
    const vx = new Float64Array(n), vy = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      const h = fnv(nodes[i].id);
      const a = ((h % 3600) / 3600) * Math.PI * 2;
      const rad = 60 + (((h >>> 12) % 1000) / 1000) * 160;
      px[i] = Math.cos(a) * rad;
      py[i] = Math.sin(a) * rad;
    }
    px[ci] = 0;
    py[ci] = 0;

    const edges = links
      .filter((l) => idx.has(l.a) && idx.has(l.b))
      .map((l) => {
        const i = idx.get(l.a)!, j = idx.get(l.b)!;
        return {
          l, i, j,
          w: clamp((l.value / maxL) * 3, 0.75, 3), // hairline weights — stroke ∝ value, [0.75, 3]
          rest: r[i] + r[j] + 18 + 80 * (1 - Math.sqrt(l.value / maxL)), // heavier link = shorter spring
        };
      });

    // settle once: repulsion + link springs + mild centering, damped integration
    for (let t = 0; t < TICKS; t++) {
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          let dx = px[j] - px[i], dy = py[j] - py[i];
          let d2 = dx * dx + dy * dy;
          if (d2 < 1) { dx = (((i * 31 + j) % 7) - 3) || 1; dy = 1; d2 = dx * dx + dy * dy; }
          const d = Math.sqrt(d2);
          const f = Math.min(1600 / d2, 6);
          const fx = (dx / d) * f, fy = (dy / d) * f;
          vx[i] -= fx; vy[i] -= fy;
          vx[j] += fx; vy[j] += fy;
        }
      }
      for (const e of edges) {
        const dx = px[e.j] - px[e.i], dy = py[e.j] - py[e.i];
        const d = Math.sqrt(dx * dx + dy * dy) || 1;
        const f = 0.02 * (d - e.rest);
        const fx = (dx / d) * f, fy = (dy / d) * f;
        vx[e.i] += fx; vy[e.i] += fy;
        vx[e.j] -= fx; vy[e.j] -= fy;
      }
      for (let i = 0; i < n; i++) {
        const k = i === ci ? 0.06 : 0.012; // centering — tighter cloud, less dead field
        vx[i] = clamp((vx[i] - px[i] * k) * 0.82, -14, 14);
        vy[i] = clamp((vy[i] - py[i] * k) * 0.82, -14, 14);
        px[i] += vx[i];
        py[i] += vy[i];
      }
      // hard collision pass — marks must never intersect (radius + 4 breathing room).
      // squares extend past their nominal radius at the corners: use the half-diagonal.
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          const dx = px[j] - px[i], dy = py[j] - py[i];
          const d = Math.sqrt(dx * dx + dy * dy) || 1;
          const eff = (k: number) => (nodes[k].kind === "entity" ? r[k] * 1.26 : r[k]);
          const min = eff(i) + eff(j) + 4;
          if (d < min) {
            const push = (min - d) / 2;
            const ux = dx / d, uy = dy / d;
            px[i] -= ux * push; py[i] -= uy * push;
            px[j] += ux * push; py[j] += uy * push;
          }
        }
      }
    }

    // base viewBox from settled bounds (+room for labels)
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (let i = 0; i < n; i++) {
      minX = Math.min(minX, px[i] - r[i]);
      minY = Math.min(minY, py[i] - r[i]);
      maxX = Math.max(maxX, px[i] + r[i]);
      maxY = Math.max(maxY, py[i] + r[i]);
    }
    const pad = 24;
    const vb: VB = { x: minX - pad, y: minY - pad, w: maxX - minX + pad * 2, h: maxY - minY + pad * 2 };

    // adjacency for O(1) hover highlighting
    const adj = new Map<string, Set<string>>();
    for (const l of links) {
      if (!adj.has(l.a)) adj.set(l.a, new Set());
      if (!adj.has(l.b)) adj.set(l.b, new Set());
      adj.get(l.a)!.add(l.b);
      adj.get(l.b)!.add(l.a);
    }

    // draw order: dim second-degree first, first-degree next, focal LAST (topmost —
    // its ring must never be clipped by a neighbour)
    const firstDeg = new Set<string>();
    for (const l of links) {
      if (l.a === center) firstDeg.add(l.b);
      if (l.b === center) firstDeg.add(l.a);
    }

    // labels at rest: center + top 5 by value. A label survives only if its box clears
    // (a) every already-placed label, (b) EVERY node mark, and (c) no surviving label
    // reads identically after truncation (two "DEPARTMENT OF PUB…" = one dropped).
    // Everything else is hover-only. No overprinting, ever.
    const wanted = [
      ...(idx.has(center) ? [center] : []),
      ...[...nodes].filter((d) => d.id !== center).sort((a, b) => b.value - a.value).slice(0, 5).map((d) => d.id),
    ];
    const top = new Set<string>();
    const boxes: { x: number; y: number; w: number; h: number }[] = [];
    const texts = new Set<string>();
    // prominent marks are obstacles; faint second-ring outlines may sit under a
    // label's white halo (legible), else dense hubs render almost no labels at all
    const nodeBoxes = nodes.map((d, i) => {
      const e = d.kind === "entity" ? r[i] * 1.26 : r[i];
      const prominent = d.id === center || firstDeg.has(d.id) || r[i] >= 10;
      return prominent ? { x: px[i] - e, y: py[i] - e, w: e * 2, h: e * 2 } : null;
    });
    const labelPos = new Map<string, { x: number; y: number; anchor: "start" | "middle" }>();
    for (const id of wanted) {
      const i = idx.get(id)!;
      const txt = trunc(nodes[i].label);
      if (texts.has(txt)) continue;
      const w = txt.length * 6.2 + 8;
      // try below, above, then right of the node — dense hubs usually have one clear side
      const cands: [number, number][] = [
        [px[i] - w / 2, py[i] + r[i] + 4],
        [px[i] - w / 2, py[i] - r[i] - 18],
        [px[i] + r[i] + 6, py[i] - 7],
      ];
      for (const [bx, by] of cands) {
        const box = { x: bx, y: by, w, h: 14 };
        const overlaps = (b: { x: number; y: number; w: number; h: number }) =>
          box.x < b.x + b.w && b.x < box.x + box.w && box.y < b.y + b.h && b.y < box.y + box.h;
        if (boxes.some(overlaps) || nodeBoxes.some((b, k) => b != null && k !== i && overlaps(b))) continue;
        top.add(id); boxes.push(box); texts.add(txt);
        labelPos.set(id, { x: bx + (bx > px[i] ? 0 : w / 2), y: by + 11, anchor: bx > px[i] ? ("start" as const) : ("middle" as const) });
        break;
      }
    }

    const order = [...nodes.keys()].sort((a, b) => {
      const rank = (i: number) => (nodes[i].id === center ? 2 : firstDeg.has(nodes[i].id) ? 1 : 0);
      return rank(a) - rank(b);
    });

    const byId = new Map(nodes.map((d) => [d.id, d]));
    return { nodes, center, px, py, r, edges, vb, adj, top, byId, firstDeg, order, labelPos };
  }, [data]);

  const [hovered, setHovered] = useState<string | null>(null);
  const [vb, setVb] = useState<VB | null>(null);
  const view = vb ?? lay?.vb ?? null;

  const svgRef = useRef<SVGSVGElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const tipRef = useRef<HTMLDivElement | null>(null);
  const panRef = useRef<{ px: number; py: number; vb: VB } | null>(null);
  const lastPos = useRef({ x: 0, y: 0 });
  const viewRef = useRef(view);
  viewRef.current = view;
  const baseRef = useRef(lay?.vb ?? null);
  baseRef.current = lay?.vb ?? null;

  // wheel zoom around the pointer, clamped 0.4x–4x (non-passive so the page never scrolls)
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const v = viewRef.current, b = baseRef.current;
      if (!v || !b) return;
      const rect = svg.getBoundingClientRect();
      const f = e.deltaY > 0 ? 1.15 : 1 / 1.15;
      const w = clamp(v.w * f, b.w / 4, b.w / 0.4); // scale = b.w / w ∈ [0.4, 4]
      const fr = w / v.w;
      const h = v.h * fr;
      const s = Math.max(v.w / rect.width, v.h / rect.height); // "meet" scale
      const ox = e.clientX - rect.left, oy = e.clientY - rect.top;
      const ux = v.x + v.w / 2 + (ox - rect.width / 2) * s;
      const uy = v.y + v.h / 2 + (oy - rect.height / 2) * s;
      setVb({
        x: ux - (ox - rect.width / 2) * s * fr - w / 2,
        y: uy - (oy - rect.height / 2) * s * fr - h / 2,
        w, h,
      });
    };
    svg.addEventListener("wheel", onWheel, { passive: false });
    return () => svg.removeEventListener("wheel", onWheel);
  }, []);

  // pan on empty-svg drag
  const onPointerDown = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if ((e.target as Element).closest?.("[data-testid='ego-node']")) return;
    const v = viewRef.current;
    if (!v) return;
    panRef.current = { px: e.clientX, py: e.clientY, vb: v };
    e.currentTarget.setPointerCapture(e.pointerId);
  }, []);
  const onPointerMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    const p = panRef.current;
    if (p) {
      const rect = e.currentTarget.getBoundingClientRect();
      const s = Math.max(p.vb.w / rect.width, p.vb.h / rect.height);
      setVb({ x: p.vb.x - (e.clientX - p.px) * s, y: p.vb.y - (e.clientY - p.py) * s, w: p.vb.w, h: p.vb.h });
    }
    // tooltip tracks the pointer by direct DOM write — no per-frame React state
    const wrap = wrapRef.current;
    if (wrap) {
      const r = wrap.getBoundingClientRect();
      lastPos.current = { x: e.clientX - r.left, y: e.clientY - r.top };
      const tip = tipRef.current;
      if (tip) {
        tip.style.left = `${lastPos.current.x}px`;
        tip.style.top = `${lastPos.current.y - 10}px`;
      }
    }
  }, []);
  const onPointerUp = useCallback(() => { panRef.current = null; }, []);

  const nodeEnter = useCallback((id: string) => setHovered(id), []);
  const nodeLeave = useCallback(() => setHovered(null), []);

  // scene memoized apart from the viewBox so pan/zoom re-renders stay cheap
  const scene = useMemo(() => {
    if (!lay) return null;
    const hi = hovered != null ? new Set([hovered, ...(lay.adj.get(hovered) ?? [])]) : null;
    return (
      <>
        <g>
          {lay.edges.map((e, k) => {
            const lit = hovered != null && (e.l.a === hovered || e.l.b === hovered);
            // one hue, weighted by relevance: focal edges carry a quiet primary tint
            // at rest; second-degree edges stay neutral hairlines
            const focalEdge = e.l.a === lay.center || e.l.b === lay.center;
            return (
              <line key={k} data-testid="ego-edge"
                x1={lay.px[e.i]} y1={lay.py[e.i]} x2={lay.px[e.j]} y2={lay.py[e.j]}
                strokeWidth={e.w} strokeLinecap="round"
                stroke={lit || focalEdge ? "var(--color-primary)" : "var(--color-border)"}
                opacity={hovered != null && !lit ? 0.12 : lit ? 1 : focalEdge ? 0.3 : 0.8}
                className="transition-opacity" />
            );
          })}
        </g>
        {lay.order.map((i) => {
          const d = lay.nodes[i];
          const lit = hi?.has(d.id) ?? false;
          const dim = hi != null && !lit;
          const r = lay.r[i];
          const x = lay.px[i], y = lay.py[i];
          const isCenter = d.id === lay.center;
          // blueprint marks (style 11): white-filled outlines, one hue by relevance —
          // solid gray blobs read as game tokens, not a procurement schematic
          const first = lay.firstDeg.has(d.id);
          const fill = lit || isCenter ? "var(--color-primary)" : "var(--color-background)";
          const stroke = lit || isCenter ? "var(--color-primary)"
            : first ? "var(--color-primary)" : "var(--color-muted-foreground)";
          const strokeOpacity = lit || isCenter ? 1 : first ? 0.55 : 0.5;
          return (
            <g key={d.id} data-testid="ego-node" data-id={d.id}
              className="cursor-pointer transition-opacity"
              opacity={dim ? 0.15 : isCenter || lit || first ? 1 : 0.65}
              onPointerEnter={() => nodeEnter(d.id)}
              onPointerLeave={nodeLeave}
              onClick={() =>
                router.push(`/${d.kind === "supplier" ? "supplier" : "entity"}/${encodeURIComponent(d.slug)}`)
              }>
              <title>{`${d.label} — ${d.kind === "supplier" ? "supplier" : "procuring entity"} · ${pesoCompact(d.value)} · ${d.n} award${d.n === 1 ? "" : "s"}`}</title>
              {d.kind === "supplier" ? (
                <circle cx={x} cy={y} r={r} fill={fill} stroke={stroke} strokeOpacity={strokeOpacity} strokeWidth={1.5} />
              ) : (
                <rect x={x - r * 0.89} y={y - r * 0.89} width={r * 1.78} height={r * 1.78} rx={2}
                  fill={fill} stroke={stroke} strokeOpacity={strokeOpacity} strokeWidth={1.5} />
              )}
              {isCenter && (d.kind === "supplier" ? (
                // white under-ring = ring-offset: the focus ring reads even over edges
                <>
                  <circle cx={x} cy={y} r={r + 2} fill="none" stroke="var(--color-background)" strokeWidth={4} />
                  <circle cx={x} cy={y} r={r + 3.5} fill="none" stroke="var(--color-primary)" strokeWidth={2} />
                </>
              ) : (
                <>
                  <rect x={x - r * 0.89 - 2} y={y - r * 0.89 - 2} width={r * 1.78 + 4} height={r * 1.78 + 4}
                    fill="none" stroke="var(--color-background)" strokeWidth={4} />
                  <rect x={x - r * 0.89 - 3.5} y={y - r * 0.89 - 3.5} width={r * 1.78 + 7} height={r * 1.78 + 7}
                    fill="none" stroke="var(--color-primary)" strokeWidth={2} />
                </>
              ))}
              {(lay.top.has(d.id) || hovered === d.id) && (
                // white halo (paint-order) keeps labels legible over edges — below the
                // node, never over its neighbours (rest-state set is collision-free)
                <text x={lay.labelPos.get(d.id)?.x ?? x} y={lay.labelPos.get(d.id)?.y ?? y + r + 13}
                  textAnchor={lay.labelPos.get(d.id)?.anchor ?? "middle"} fontSize={10}
                  className="pointer-events-none select-none font-mono"
                  paintOrder="stroke" stroke="var(--color-background)" strokeWidth={3}
                  fill={lit || isCenter ? "var(--color-primary)" : "var(--color-muted-foreground)"}>
                  {trunc(titleCaseIfShouty(d.label))}
                </text>
              )}
            </g>
          );
        })}
      </>
    );
  }, [lay, hovered, router, nodeEnter, nodeLeave]);

  if (!lay || !view) return null;

  const hoverNode = hovered != null ? lay.byId.get(hovered) : undefined;
  const centerLabel = lay.byId.get(lay.center)?.label ?? "this network";

  return (
    <div ref={wrapRef} className="relative overflow-hidden" style={{ animation: "ego-fade 0.4s ease" }}>
      <style>{"@keyframes ego-fade{from{opacity:0}}"}</style>
      <svg ref={svgRef} data-testid="ego-graph" role="img"
        aria-label={`Award relationship map centered on ${centerLabel}`}
        viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`}
        width="100%" height={height}
        className="block touch-none select-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}>
        {scene}
      </svg>
      {hoverNode && (
        <div ref={tipRef} data-testid="ego-tooltip"
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded border border-border bg-background px-2 py-1 font-mono text-xs shadow-sm"
          style={{ left: lastPos.current.x, top: lastPos.current.y - 10 }}>
          <p className="font-medium text-foreground">{hoverNode.label}</p>
          <p className="text-muted-foreground">{hoverNode.kind === "supplier" ? "supplier" : "procuring entity"}</p>
          <p className="tabular-nums text-foreground">
            {pesoCompact(hoverNode.value)} · {hoverNode.n} award{hoverNode.n === 1 ? "" : "s"}
          </p>
        </div>
      )}
    </div>
  );
}
