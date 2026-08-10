// /supplier/[slug] — M5 W-B supplier profile. SSR over the LIVE awards db (a backfill grows it
// every minute — force-dynamic, never cache counts). EVIDENCE ONLY: verifiable award facts with
// figures; no characterization of the supplier. slug = winner_norm (awards.py normalization).
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { winPct } from "@/lib/notice";
import { getEgo, getSupplier } from "@/lib/map";
import { personCase, titleCaseIfShouty } from "@/lib/text";
import EgoGraph from "@/components/ego-graph";

export const dynamic = "force-dynamic";

// params may or may not arrive percent-decoded — decode defensively.
function slugOf(raw: string): string {
  try { return decodeURIComponent(raw); } catch { return raw; }
}
const load = cache(async (raw: string) => getSupplier(slugOf(raw)));
const loadEgo = cache(async (raw: string) => getEgo({ norm: slugOf(raw) }));

export async function generateMetadata({ params }: PageProps<"/supplier/[slug]">): Promise<Metadata> {
  const sp = await load((await params).slug);
  if (!sp) return { title: "Supplier not found — bidkita" };
  return {
    title: `${sp.winner} — supplier profile — bidkita`,
    description: `${sp.winner}${sp.province ? ` (${sp.province})` : ""}: ${sp.totals.contracts} government contract award${sp.totals.contracts === 1 ? "" : "s"} recorded on PhilGEPS, with amounts, awarding entities, and price-vs-budget history.`,
  };
}

// Full-precision peso for award amounts — always centavos, like the source ledgers
// (mixed "₱4,494,407" / "₱4,705,966.03" precision in one table reads as sloppiness).
const peso = (v: number) =>
  `₱${v.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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

function WinRow({ w, peso }: { w: import("@/lib/map").SupplierWin; peso: (v: number) => string }) {
  const noticeId = w.buyer_kind === "agency" && w.ref_id != null ? Number(w.ref_id) : null;
  // a bare contract ref ("25FK0060") in the title slot reads as a rendering bug —
  // demote it to the meta line and keep one row anatomy
  const raw = w.title?.trim() ?? "";
  const isRefCode = raw !== "" && !/\s/.test(raw) && /\d/.test(raw);
  const title = raw && !isRefCode ? titleCaseIfShouty(raw) : null;
  return (
    <li className="py-2.5 text-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-0.5">
        <p className={`min-w-0 flex-1 leading-snug ${title ? "font-medium" : "text-muted-foreground/70"}`}>
          {noticeId != null && Number.isSafeInteger(noticeId) ? (
            <Link href={`/notice/${noticeId}`} data-testid="win-notice-link"
              className="underline-offset-2 hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              {title ?? "Untitled award"}
            </Link>
          ) : (title ?? "Untitled award")}
        </p>
        {w.contract_amount != null && (
          <p className="shrink-0 font-mono text-sm font-bold tabular-nums" title={peso(w.contract_amount)}>
            {pesoCompact(w.contract_amount)}
          </p>
        )}
      </div>
      <p className="mt-0.5 font-mono text-xs tabular-nums text-foreground/80">
        {fmtDay(w.award_date_iso) ?? "date —"}
        {isRefCode && ` · ${raw}`}
        {w.contract_amount != null && ` · won ${peso(w.contract_amount)}`}
        {w.win_ratio != null && w.abc != null && ` at ${winPct(w.win_ratio)} of budget`}
      </p>
      {w.buyer && (
        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
          {w.buyer_kind === "agency" ? (
            <Link href={`/entity/${encodeURIComponent(w.buyer)}`}
              className="underline-offset-2 hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              {titleCaseIfShouty(w.buyer)}
            </Link>
          ) : (
            // created_by is the buyer-side recording officer, not the office itself
            <>recorded by {personCase(w.buyer)}</>
          )}
        </p>
      )}
    </li>
  );
}

export default async function SupplierPage({ params }: PageProps<"/supplier/[slug]">) {
  const { slug } = await params;
  const [sp, ego] = await Promise.all([load(slug), loadEgo(slug)]);
  if (!sp) notFound();

  // Buyers whose kind is "agency" join a corpus notice → safe to link to /entity/.
  // "recorded_by" buyers are buyer-side recording officers (people), never linked.
  const agencyBuyers = new Set(sp.wins.filter((w) => w.buyer_kind === "agency" && w.buyer).map((w) => w.buyer as string));

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <SiteHeader />

      <main className="mx-auto max-w-5xl px-4 pt-10 pb-12" data-testid="supplier-profile">
        {/* hero */}
        <p className="font-mono text-xs text-muted-foreground">Supplier · PhilGEPS record</p>
        <h1 className="mt-2 text-xl font-bold leading-snug md:text-2xl">{titleCaseIfShouty(sp.winner)}</h1>
        {sp.province && <p className="mt-1 text-sm uppercase tracking-wider text-muted-foreground">{sp.province}</p>}

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
              {sp.wins.slice(0, 12).map((w, i) => <WinRow key={i} w={w} peso={peso} />)}
            </ul>
            {sp.wins.length > 12 && (
              // <details>: full disclosure with zero client JS
              <details className="group border-t border-border">
                <summary className="cursor-pointer list-none py-2.5 text-sm text-primary underline-offset-2 hover:underline group-open:hidden">
                  show all {sp.totals.contracts >= sp.wins.length ? sp.wins.length : sp.totals.contracts} recorded wins
                </summary>
                <ul className="divide-y divide-border" data-testid="supplier-wins-rest">
                  {sp.wins.slice(12).map((w, i) => <WinRow key={i} w={w} peso={peso} />)}
                </ul>
              </details>
            )}
          </section>

                    {(typeof ego === "object" && (ego.nodes?.length ?? 0) >= 3) || ego === "error" ? (
            <section aria-label="Network" id="network">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Network</h2>
              <p className="mt-1 text-xs text-muted-foreground">award relationships recorded around this supplier</p>
              {typeof ego === "object" ? (
                <div className="mt-2 overflow-hidden rounded-md border border-border bg-muted/20">
                  <EgoGraph data={ego} height={380} />
                  <p className="border-t border-border px-4 py-2 font-mono text-xs text-muted-foreground">
                    suppliers ○ · procuring entities □ · line weight = awarded value — <span className="sm:hidden">tap a node to open</span><span className="hidden sm:inline">hover to trace, click to open</span>
                  </p>
                </div>
              ) : (
                <p className="mt-2 rounded-md border border-border bg-muted/20 px-4 py-6 text-sm text-muted-foreground" data-testid="ego-unavailable">
                  the network map took too long to load — refresh the page to retry
                </p>
              )}
            </section>
          ) : null}

          {sp.categories.length > 0 && (
            <section aria-label="Categories">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Categories</h2>
              <div className="mt-2 flex flex-wrap gap-1.5" data-testid="supplier-categories">
                {sp.categories.slice(0, 16).map((c) => (
                  <span key={c.name} className="rounded border border-border px-2 py-1 text-xs leading-snug text-muted-foreground">
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
                      className="rounded border border-border px-2 py-1 text-xs leading-snug text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      {titleCaseIfShouty(e.name)} <span className="font-mono tabular-nums">×{e.n}</span>
                    </Link>
                  ) : (
                    <span key={e.name} title="buyer-side recording officer"
                      className="rounded border border-border px-2 py-1 text-xs leading-snug text-muted-foreground">
                      {personCase(e.name)} <span className="font-mono tabular-nums">×{e.n}</span>
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
