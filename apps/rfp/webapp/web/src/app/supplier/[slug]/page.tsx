// /supplier/[slug] — M5 W-B supplier profile. SSR over the LIVE awards db (a backfill grows it
// every minute — force-dynamic, never cache counts). EVIDENCE ONLY: verifiable award facts with
// figures; no characterization of the supplier. slug = winner_norm (awards.py normalization).
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { winPct } from "@/lib/notice";
import { getSupplier } from "@/lib/map";

export const dynamic = "force-dynamic";

// params may or may not arrive percent-decoded — decode defensively.
function slugOf(raw: string): string {
  try { return decodeURIComponent(raw); } catch { return raw; }
}
const load = cache(async (raw: string) => getSupplier(slugOf(raw)));

export async function generateMetadata({ params }: PageProps<"/supplier/[slug]">): Promise<Metadata> {
  const sp = await load((await params).slug);
  if (!sp) return { title: "Supplier not found — bidkita" };
  return {
    title: `${sp.winner} — supplier profile — bidkita`,
    description: `${sp.winner}${sp.province ? ` (${sp.province})` : ""}: ${sp.totals.contracts} government contract award${sp.totals.contracts === 1 ? "" : "s"} recorded on PhilGEPS, with amounts, awarding entities, and price-vs-budget history.`,
  };
}

// Full-precision peso for award amounts (identical to the notice detail page).
const peso = (v: number) =>
  `₱${v.toLocaleString("en-PH", { minimumFractionDigits: v % 1 ? 2 : 0, maximumFractionDigits: 2 })}`;
// Compact peso for the hero stat (sums get long).
function pesoCompact(n: number): string {
  if (n >= 1e9) return `₱${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `₱${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `₱${Math.round(n / 1e3)}K`;
  return `₱${n.toLocaleString("en-PH")}`;
}
// notice-page rule: never round a sub-100% winning bid up to "100% of the budget".
const pct = winPct; // shared band-safe formatter — never renders a sub-100% win as "100%"

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
// award_date_iso is yyyy-mm-dd — format from parts, never via Date (server TZ varies).
function fmtDay(d: string | null): string | null {
  const m = d?.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${MONTHS[+m[2] - 1]} ${+m[3]}, ${m[1]}` : null;
}

function Stat({ label, value, testid }: { label: string; value: string; testid?: string }) {
  return (
    <div data-testid={testid}>
      <p className="font-mono text-2xl font-bold tabular-nums tracking-tight md:text-3xl">{value}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

export default async function SupplierPage({ params }: PageProps<"/supplier/[slug]">) {
  const sp = await load((await params).slug);
  if (!sp) notFound();

  // Buyers whose kind is "agency" join a corpus notice → safe to link to /entity/.
  // "recorded_by" buyers are buyer-side recording officers (people), never linked.
  const agencyBuyers = new Set(sp.wins.filter((w) => w.buyer_kind === "agency" && w.buyer).map((w) => w.buyer as string));

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="border-b border-primary">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4">
          <Link href="/" className="whitespace-nowrap text-2xl font-bold lowercase tracking-tight text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">bidkita</Link>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">← Results</Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6" data-testid="supplier-profile">
        {/* hero */}
        <p className="font-mono text-xs text-muted-foreground">Supplier · award record from PhilGEPS</p>
        <h1 className="mt-2 text-xl font-bold leading-snug md:text-2xl">{sp.winner}</h1>
        {sp.province && <p className="mt-1 text-sm text-muted-foreground">{sp.province}</p>}

        <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
          <Stat label="total won" value={pesoCompact(sp.totals.won_value)} testid="stat-total-won" />
          <Stat label={sp.totals.contracts === 1 ? "contract" : "contracts"} value={String(sp.totals.contracts)} testid="stat-contracts" />
          <Stat label={sp.totals.entities === 1 ? "awarding entity" : "awarding entities"} value={String(sp.totals.entities)} testid="stat-entities" />
          <Stat label="median % of budget" value={sp.totals.median_win_ratio != null ? pct(sp.totals.median_win_ratio) : "—"} testid="stat-median-ratio" />
        </div>

        <div className="mt-8 space-y-8">
          <section aria-label="Recent wins">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Recent wins</h2>
            <p className="mt-1 text-xs text-muted-foreground">contract awards recorded on PhilGEPS, newest first</p>
            <ul className="mt-2 divide-y divide-border" data-testid="supplier-wins">
              {sp.wins.map((w, i) => {
                const noticeId = w.buyer_kind === "agency" && w.ref_id != null ? Number(w.ref_id) : null;
                return (
                  <li key={i} className="py-2.5 text-sm">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
                      <p className="min-w-0 flex-1 font-medium leading-snug">
                        {noticeId != null && Number.isSafeInteger(noticeId) ? (
                          <Link href={`/notice/${noticeId}`} data-testid="win-notice-link"
                            className="underline-offset-2 hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                            {w.title ?? "Untitled award"}
                          </Link>
                        ) : (w.title ?? "Untitled award")}
                      </p>
                      {w.contract_amount != null && (
                        <p className="shrink-0 font-mono text-sm font-bold tabular-nums">{peso(w.contract_amount)}</p>
                      )}
                    </div>
                    <p className="mt-0.5 font-mono text-xs tabular-nums text-foreground/80">
                      {fmtDay(w.award_date_iso) ?? "date —"}
                      {w.win_ratio != null && w.abc != null && ` · won at ${pct(w.win_ratio)} of the ${peso(w.abc)} budget`}
                    </p>
                    {w.buyer && (
                      <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                        {w.buyer_kind === "agency" ? (
                          <Link href={`/entity/${encodeURIComponent(w.buyer)}`}
                            className="underline-offset-2 hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                            {w.buyer}
                          </Link>
                        ) : (
                          // created_by is the buyer-side recording officer, not the office itself
                          <>recorded by {w.buyer}</>
                        )}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>

          {sp.categories.length > 0 && (
            <section aria-label="Categories">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Categories</h2>
              <div className="mt-2 flex flex-wrap gap-1.5" data-testid="supplier-categories">
                {sp.categories.slice(0, 16).map((c) => (
                  <span key={c.name} className="rounded border border-border px-2 py-0.5 text-xs text-muted-foreground">
                    {c.name} <span className="font-mono tabular-nums">×{c.n}</span>
                  </span>
                ))}
              </div>
            </section>
          )}

          {sp.entities.length > 0 && (
            <section aria-label="Buyers on record">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Buyers on record</h2>
              <p className="mt-1 text-xs text-muted-foreground">procuring entities where known; otherwise the buyer-side officer who recorded the award</p>
              <div className="mt-2 flex flex-wrap gap-1.5" data-testid="supplier-entities">
                {sp.entities.slice(0, 16).map((e) =>
                  agencyBuyers.has(e.name) ? (
                    <Link key={e.name} href={`/entity/${encodeURIComponent(e.name)}`}
                      className="rounded border border-border px-2 py-0.5 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      {e.name} <span className="font-mono tabular-nums">×{e.n}</span>
                    </Link>
                  ) : (
                    <span key={e.name} title="buyer-side recording officer"
                      className="rounded border border-border px-2 py-0.5 text-xs text-muted-foreground">
                      {e.name} <span className="font-mono tabular-nums">×{e.n}</span>
                    </span>
                  ))}
              </div>
            </section>
          )}

          <p className="border-t border-border pt-4 text-xs text-muted-foreground">
            Source: PhilGEPS award notices. Figures are sums over the award records collected so far; the record may be incomplete.
          </p>
        </div>
      </main>
    </div>
  );
}
