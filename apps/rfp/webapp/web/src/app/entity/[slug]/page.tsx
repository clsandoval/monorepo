// /entity/[slug] — M5 W-C entity dossier + contestability v0. SSR over LIVE awards + corpus
// (the awards backfill grows every minute — force-dynamic). EVIDENCE ONLY: every signal is a
// computable market statistic shown WITH its evidence line; descriptors describe the MARKET
// (concentrated / mixed / open), never any named party. slug = corpus agency string.
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { ResultRowItem } from "@/components/result-row";
import { roundOf, type ResultRow } from "@/lib/search-types";
import { getEntity, type EntityOpenNotice } from "@/lib/map";

export const dynamic = "force-dynamic";

function slugOf(raw: string): string {
  try { return decodeURIComponent(raw); } catch { return raw; }
}
const load = cache(async (raw: string) => getEntity(slugOf(raw)));

export async function generateMetadata({ params }: PageProps<"/entity/[slug]">): Promise<Metadata> {
  const ent = await load((await params).slug);
  if (!ent) return { title: "Entity not found — bidkita" };
  return {
    title: `${ent.agency} — procuring entity — bidkita`,
    description: `${ent.agency}${ent.province ? ` (${ent.province})` : ""}: who wins its government contracts, awarded value, open notices, and market statistics from PhilGEPS.`,
  };
}

function pesoCompact(n: number): string {
  if (n >= 1e9) return `₱${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `₱${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `₱${Math.round(n / 1e3)}K`;
  return `₱${n.toLocaleString("en-PH")}`;
}

// open_notices carry only what the dossier query returns — lift into the shared ResultRow
// shape so the board's row component (and its closing-countdown logic) is reused as-is.
function toResultRow(agency: string, n: EntityOpenNotice): ResultRow {
  return {
    id: n.id, source: n.source, title: n.title ?? `Notice ${n.id}`, agency,
    location: null, province: null, abc: n.abc, abc_lot_min: null, abc_lot_max: null,
    mode_norm: null, closing_at: n.closing_at, closing_day: null, work_type: null,
    needs_pcab: null, days: null, round: roundOf(n.title, null),
  };
}

export default async function EntityPage({ params }: PageProps<"/entity/[slug]">) {
  const ent = await load((await params).slug);
  if (!ent) notFound();

  // denominator for "14 of 23": total recorded awards behind the share bars
  const awardCount = ent.winners.reduce((s, w) => s + w.n, 0);

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="border-b border-primary">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4">
          <Link href="/" className="whitespace-nowrap text-2xl font-bold lowercase tracking-tight text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">bidkita</Link>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">← Results</Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6" data-testid="entity-dossier">
        {/* hero */}
        <p className="font-mono text-xs text-muted-foreground">Procuring entity · PhilGEPS record</p>
        <h1 className="mt-2 text-xl font-bold leading-snug md:text-2xl">{ent.agency}</h1>
        {ent.province && <p className="mt-1 text-sm text-muted-foreground">{ent.province}</p>}

        <div className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <span className="font-mono text-4xl font-bold tabular-nums tracking-tight md:text-5xl" data-testid="entity-spend">
            {ent.spend_12mo.contracts > 0 ? pesoCompact(ent.spend_12mo.value) : "—"}
          </span>
          <span className="text-sm text-muted-foreground">
            {ent.spend_12mo.contracts > 0
              ? `awarded in the last 12 months · ${ent.spend_12mo.contracts} award${ent.spend_12mo.contracts === 1 ? "" : "s"} on record`
              : "no awards recorded in the last 12 months (award records are still being collected)"}
          </span>
        </div>

        <div className="mt-8 space-y-8">
          {ent.winners.length > 0 && (
            <section aria-label="Who wins here">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Who wins here</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                suppliers by share of awarded value, across {awardCount} recorded award{awardCount === 1 ? "" : "s"} at this entity
              </p>
              <ul className="mt-2 space-y-2" data-testid="entity-top-suppliers">
                {ent.winners.map((s) => (
                  <li key={s.winner_norm} className="text-sm">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
                      <p className="min-w-0 flex-1 font-medium leading-snug">
                        <Link href={`/supplier/${encodeURIComponent(s.winner_norm)}`} data-testid="top-supplier-link"
                          className="underline-offset-2 hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                          {s.winner}
                        </Link>
                      </p>
                      <p className="shrink-0 font-mono text-xs font-bold tabular-nums">{pesoCompact(s.value)}</p>
                    </div>
                    <div className="mt-1 flex items-center gap-3">
                      <div className="h-4 min-w-0 flex-1 overflow-hidden rounded-sm bg-muted" aria-hidden>
                        <div className="h-full rounded-sm bg-primary/10" data-testid="share-bar"
                          style={{ width: `${Math.min(100, Math.max(1, Math.round(s.share * 100)))}%` }} />
                      </div>
                      <span className="shrink-0 font-mono text-xs tabular-nums text-primary" data-testid="share-label">
                        {Math.round(s.share * 100)}% · {s.n} of {awardCount}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {ent.contestability.signals.length > 0 && (
            <section aria-label="Market statistics">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">How open is this market</h2>
                <span data-testid="market-descriptor"
                  className="rounded border border-primary/50 bg-primary/5 px-2 py-0.5 font-mono text-xs font-medium text-primary">
                  {ent.contestability.descriptor}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                market statistics computed from this entity&apos;s recorded notices and awards — each figure shown with its evidence
              </p>
              <ul className="mt-2 divide-y divide-border" data-testid="contestability-panel">
                {ent.contestability.signals.map((sig) => (
                  <li key={sig.key} className="py-2.5">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 text-sm">
                      <span className="font-medium">{SIGNAL_LABELS[sig.key] ?? sig.key}</span>
                      <span className="font-mono text-sm font-bold tabular-nums">{sig.stat}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground" data-testid="signal-evidence">{sig.evidence}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {ent.open_notices.length > 0 && (
            <section aria-label="Open notices">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Open notices</h2>
              <p className="mt-1 text-xs text-muted-foreground">currently accepting bids at this entity</p>
              <div className="mt-2 rounded-lg border border-border" data-testid="entity-open-notices">
                {ent.open_notices.map((n) => <ResultRowItem key={n.id} row={toResultRow(ent.agency, n)} />)}
              </div>
            </section>
          )}

          {ent.contact && (ent.contact.raw || ent.contact.email || ent.contact.phone) && (
            <section aria-label="Contact">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Contact</h2>
              <p className="mt-1 text-xs text-muted-foreground">as listed on this entity&apos;s most recent notice</p>
              <div className="mt-2 space-y-1 text-sm" data-testid="entity-contact">
                {ent.contact.raw && <p className="leading-relaxed text-foreground/80">{ent.contact.raw}</p>}
                {ent.contact.phone && <p className="font-mono text-xs tabular-nums">{ent.contact.phone}</p>}
                {ent.contact.email && (
                  <a href={`mailto:${ent.contact.email}`}
                    className="inline-flex h-11 items-center font-mono text-xs text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    {ent.contact.email}
                  </a>
                )}
              </div>
            </section>
          )}

          <p className="border-t border-border pt-4 text-xs text-muted-foreground">
            Source: PhilGEPS notices and award records. Statistics describe the market shape in the data collected so far; the record may be incomplete.
          </p>
        </div>
      </main>
    </div>
  );
}

// Plain-English labels for the locked signal keys (unknown keys fall back to the key itself).
const SIGNAL_LABELS: Record<string, string> = {
  top_share: "Top supplier's share of awarded value",
  price_median: "Median winning price vs. approved budget",
  failed_share: "Failed biddings that became negotiated",
  limited_share: "Notices under limited-competition modes",
};
