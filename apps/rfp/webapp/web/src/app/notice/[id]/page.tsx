// /notice/[id] — server-rendered detail page (SEO wedge: full HTML, real title/description).
import { cache } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BackLink } from "@/components/notice-back";
import { NoticeEnrich } from "@/components/notice-enrich";
import { roundOf } from "@/lib/search-types";
import { stripExtracted, titleCaseIfShouty } from "@/lib/text";
import {
  getNotice, getSimilarAwards, parseBoq, philgepsUrl, requirementsFor, winPct, type NoticeDetail,
} from "@/lib/notice";

export const dynamic = "force-dynamic"; // countdown + enrich state must be request-fresh

const load = cache(async (idStr: string) => {
  const id = /^\d{1,12}$/.test(idStr) ? Number(idStr) : NaN;
  return Number.isSafeInteger(id) ? getNotice(id) : null;
});

export async function generateMetadata({ params }: PageProps<"/notice/[id]">): Promise<Metadata> {
  const nt = await load((await params).id);
  if (!nt) return { title: "Notice not found — bidkita" };
  return {
    title: `${nt.title} — bidkita`,
    description: nt.scope ?? nt.description?.slice(0, 160) ?? `${nt.agency} government tender on PhilGEPS`,
  };
}

// Full-precision peso — contractors care about the exact ABC.
const peso = (v: number) =>
  `₱${v.toLocaleString("en-PH", { minimumFractionDigits: v % 1 ? 2 : 0, maximumFractionDigits: 2 })}`;

// Mirror of awards.py norm_winner: one canonical key per supplier, so the display string
// "DANILYN'S ENTERPRISES, INC." links to the same /supplier/ page as "Danilyns Enterprises Inc".
// (SimilarAward doesn't carry winner_norm — normalize the display string the same way.)
const WINNER_SUFFIX = new Set(["INC", "INCORPORATED", "CORP", "CORPORATION", "CO", "COMPANY", "LTD", "LIMITED", "OPC"]);
function normWinner(name: string | null): string | null {
  if (!name) return null;
  const s = name.toUpperCase().replace(/['’.]/g, "").replace(/[^A-Z0-9 ]+/g, " ");
  const toks = s.split(/\s+/).filter(Boolean);
  while (toks.length > 1 && WINNER_SUFFIX.has(toks[toks.length - 1])) toks.pop();
  return toks.join(" ") || null;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
// corpus datetimes are naive PH-local strings — format from parts, never via Date (server TZ varies)
function fmtDay(d: string | null): string | null {
  const m = d?.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${MONTHS[+m[2] - 1]} ${+m[3]}, ${m[1]}` : null;
}
function fmtDateTime(d: string | null): string | null {
  const m = d?.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!m) return fmtDay(d);
  const h = +m[4];
  return `${MONTHS[+m[2] - 1]} ${+m[3]}, ${m[1]} · ${((h + 11) % 12) + 1}:${m[5]} ${h < 12 ? "AM" : "PM"}`;
}
function closesIn(closingAt: string | null): { label: string; urgent: boolean } | null {
  if (!closingAt) return null;
  // naive Manila wall-clock — pin +08:00 so the countdown is viewer-TZ-independent
  const ms = new Date(closingAt + "+08:00").getTime() - Date.now();
  if (Number.isNaN(ms)) return null;
  if (ms < 0) return { label: "closed", urgent: false };
  const d = Math.floor(ms / 86_400_000);
  const h = Math.floor((ms % 86_400_000) / 3_600_000);
  // final hour reads in minutes — "closes in 0h" looks like a bug at peak urgency
  const label = d > 0 ? `closes in ${d}d ${h}h`
    : h > 0 ? `closes in ${h}h`
    : `closes in ${Math.max(1, Math.floor((ms % 3_600_000) / 60_000))}m`;
  return { label, urgent: d <= 4 };
}

// "17 Day/s" and friends are PhilGEPS source debris — humanize the unit at render.
const fmtDelivery = (s: string) =>
  s.replace(/\bDay\/s\b/gi, "days").replace(/\bMonth\/s\b/gi, "months").replace(/\b1 days\b/, "1 day");

function BidCta({ nt, closed, testid }: { nt: NoticeDetail; closed?: boolean; testid: string }) {
  // a closed notice can't be bid on — the filled CTA demotes to a quiet reference link
  return (
    <a href={philgepsUrl(nt.source, nt.id)} target="_blank" rel="noopener noreferrer" data-testid={testid}
      className={`inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-md px-6 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:w-auto ${
        closed ? "border border-border text-foreground/70 hover:border-primary/50 hover:text-primary"
               : "bg-primary text-primary-foreground hover:bg-primary/90"}`}>
      {closed ? "View on PhilGEPS ↗" : "Open on PhilGEPS to bid ↗"}
    </a>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return <span className="rounded border border-border px-2 py-0.5 text-xs text-muted-foreground">{children}</span>;
}

export default async function NoticePage({ params }: PageProps<"/notice/[id]">) {
  const nt = await load((await params).id);
  if (!nt) notFound();

  const [awards] = await Promise.all([getSimilarAwards(nt.classification, nt.province, nt.abc)]);
  const boq = parseBoq(nt.description);
  const reqs = requirementsFor(nt.mode_norm, nt.classification, nt.needs_pcab);
  const cd = closesIn(nt.closing_at);
  const closed = cd?.label === "closed";
  const lotRange = nt.abc_lot_min != null && nt.abc_lot_max != null && nt.abc_lot_min !== nt.abc_lot_max
    ? `${peso(nt.abc_lot_min)} – ${peso(nt.abc_lot_max)} per lot` : null;

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <SiteHeader right={<BackLink />} />

      <main className="mx-auto max-w-5xl px-4 pt-10 pb-6" data-testid="notice-detail">
        {/* hero */}
        <p className="font-mono text-xs text-muted-foreground tabular-nums">
          Notice #{nt.id}{nt.solicitation_no ? ` · ${nt.solicitation_no}` : ""} · PhilGEPS record{nt.source === "legacy" ? " (legacy)" : ""}
        </p>
        <h1 className="mt-2 text-xl font-bold leading-snug md:text-2xl">{titleCaseIfShouty(nt.title)}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {nt.agency ? (
            <Link href={`/entity/${encodeURIComponent(nt.agency)}`} data-testid="agency-link"
              className="underline-offset-2 hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              {titleCaseIfShouty(nt.agency)}
            </Link>
          ) : nt.agency}
        </p>

        <div className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <span className="font-mono text-4xl font-bold tabular-nums tracking-tight md:text-5xl" data-testid="notice-abc">
            {/* ₱ (U+20B1) is a fallback glyph in Geist Mono — give it its own advance
                or it collides with the first numeral at hero sizes */}
            {nt.abc != null
              ? <><span className="mr-[0.09em]">₱</span>{peso(nt.abc).slice(1)}</>
              : "ABC —"}
          </span>
          {lotRange && <span className="font-mono text-sm tabular-nums text-muted-foreground">{lotRange}</span>}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground">
          {cd && (
            <span data-testid="notice-countdown" className={`inline-flex whitespace-nowrap rounded px-2 py-0.5 font-mono tabular-nums ${
              cd.urgent ? "border border-primary/50 bg-primary/10 font-medium text-primary" : "border border-border"}`}>
              {cd.label}
            </span>
          )}
          {nt.closing_at && <span className="text-muted-foreground/70">closing <span className="text-foreground/75">{fmtDateTime(nt.closing_at)}</span></span>}
          {nt.publish_day && <span className="text-muted-foreground/70">published <span className="text-foreground/75">{fmtDay(nt.publish_day)}</span></span>}
          {nt.delivery && !/^0\b/.test(nt.delivery) && <span className="text-muted-foreground/70">delivery <span className="text-foreground/75">{fmtDelivery(nt.delivery)}</span></span>}
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {roundOf(nt.title, nt.mode) !== "fresh" && (
            <span className="inline-flex items-center rounded border border-primary/50 bg-primary/5 px-2 py-0.5 font-mono text-xs font-medium text-primary">
              {roundOf(nt.title, nt.mode) === "rebid" ? "RE-BID — failed bidding, easier round" : "NEGOTIATED — two failed biddings (Sec. 53.1)"}
            </span>
          )}
          {nt.mode && <Chip>{nt.mode}</Chip>}
          {nt.classification && <Chip>{nt.classification}</Chip>}
          {/* work_type often case-duplicates classification ("Civil Works"/"civil works") */}
          {nt.work_type && nt.work_type.replace(/_/g, " ").toLowerCase() !== (nt.classification ?? "").toLowerCase()
            && <Chip>{nt.work_type.replace(/_/g, " ")}</Chip>}
          {nt.province && <Chip>{nt.province}</Chip>}
          {nt.needs_pcab === 1 && <Chip>PCAB required</Chip>}
        </div>

        <div className="mt-5"><BidCta nt={nt} closed={closed} testid="cta-top" /></div>

        <div className="mt-8 max-w-3xl space-y-8">
          {nt.scope && (
            <section aria-label="Scope">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Scope</h2>
              <p className="mt-2 text-sm leading-relaxed">{nt.scope}</p>
            </section>
          )}

          <section aria-label="Deliverables">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Deliverables</h2>
            {boq ? (
              <div className="mt-2 overflow-x-auto rounded-lg border border-border" data-testid="boq-table">
                <table className="w-full min-w-[24rem] text-sm">
                  <thead>
                    <tr className="border-b border-border text-left font-mono text-[11px] uppercase text-muted-foreground">
                      <th className="px-3 py-2 font-medium">Item</th>
                      <th className="px-3 py-2 text-right font-medium">Qty</th>
                      <th className="px-3 py-2 font-medium">Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {boq.map((r, i) => (
                      <tr key={i} className="border-b border-border last:border-0">
                        <td className="px-3 py-1.5">{r.item}</td>
                        <td className="px-3 py-1.5 text-right font-mono tabular-nums">{r.qty.toLocaleString("en-PH")}</td>
                        <td className="px-3 py-1.5 font-mono text-xs">{r.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : nt.description ? (
              // presentation only: long single-paragraph notices with inline numbered
              // clauses ("1. … 10. …") re-wrap at the clause boundaries; text unchanged
              (() => {
                // clause starts need a capital after "N. " — "ITB Clause 16." is a
                // reference, not a clause boundary
                const clauses = nt.description.split(/(?=(?:^|\s)\d{1,2}\.\s+[A-Z])/);
                return clauses.length >= 4 && !nt.description.includes("\n") ? (
                  // first clauses carry the substance; the ITB boilerplate tail folds away
                  <div className="mt-2 max-w-prose space-y-3 text-sm leading-relaxed text-foreground/80" data-testid="notice-description">
                    {clauses.slice(0, 3).map((c, i) => <p key={i}>{c.trim()}</p>)}
                    {clauses.length > 3 && (
                      <details className="group">
                        <summary className="cursor-pointer list-none text-primary underline-offset-2 hover:underline group-open:hidden">
                          show the full invitation to bid
                        </summary>
                        <div className="space-y-3">
                          {clauses.slice(3).map((c, i) => <p key={i}>{c.trim()}</p>)}
                        </div>
                      </details>
                    )}
                  </div>
                ) : (
                  <p className="mt-2 max-w-prose whitespace-pre-wrap text-sm leading-relaxed text-foreground/80" data-testid="notice-description">
                    {nt.description}
                  </p>
                );
              })()
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">No line items in the notice — open the bid documents on PhilGEPS.</p>
            )}
          </section>

          <section aria-label="Requirements">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Requirements</h2>
            <p className="mt-1 text-xs text-muted-foreground">standard requirements for this procurement mode — confirm in the bid documents</p>
            <ul className="mt-2 space-y-1.5" data-testid="requirements-list">
              {reqs.map((r, i) => (
                <li key={i} className="flex items-baseline justify-between gap-3 text-sm">
                  <span>{r.item}</span>
                  <span className="shrink-0 rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">{r.statute}</span>
                </li>
              ))}
            </ul>
            {/* footnote, not a card — and a lone generic fragment ("similar contract")
                is extraction residue, not information: suppress it */}
            {nt.eligibility.length > 0 && nt.eligibility.join(" ").length > 20 && (
              <p className="mt-3 text-xs text-muted-foreground">
                named in this notice:{" "}
                {nt.eligibility.map((e, i) => (
                  <span key={i} className="mr-1.5 inline-block rounded border border-border px-1.5 py-0.5 text-muted-foreground">{e}</span>
                ))}
              </p>
            )}
          </section>

          {awards.length > 0 && (
            <section aria-label="Similar recent awards">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Similar recent awards</h2>
              <p className="mt-1 text-xs text-muted-foreground">who wins contracts like this one, and at what price</p>
              <ul className="mt-2 space-y-3" data-testid="similar-awards">
                {awards.map((a, i) => {
                  const slug = normWinner(a.winner);
                  return (
                  <li key={i} className="text-sm">
                    <p className="font-medium">
                      {slug ? (
                        <Link href={`/supplier/${encodeURIComponent(slug)}`} data-testid="winner-link"
                          className="underline-offset-2 hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                          {a.winner}
                        </Link>
                      ) : a.winner}
                      {a.winner_province && <span className="ml-2 font-normal text-muted-foreground">({a.winner_province})</span>}
                    </p>
                    <p className="font-mono text-xs tabular-nums text-foreground/80">
                      won {peso(a.contract_amount)}
                      {a.win_ratio != null && a.abc != null &&
                        ` — ${winPct(a.win_ratio)} of the ${peso(a.abc)} budget`}
                      {a.award_date && ` · ${fmtDay(a.award_date) ?? a.award_date}`}
                    </p>
                    <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{titleCaseIfShouty(a.title)}</p>
                  </li>
                  );
                })}
              </ul>
            </section>
          )}

          {(nt.contact || nt.contact_email || nt.contact_phone) && (
            <section aria-label="Contact">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Contact</h2>
              <div className="mt-2 space-y-1 text-sm" data-testid="notice-contact">
                {nt.contact && <p className="max-w-prose leading-relaxed text-foreground/80">{stripExtracted(nt.contact, nt.contact_phone, nt.contact_email)}</p>}
                {nt.contact_phone && <p className="font-mono text-xs tabular-nums">{nt.contact_phone}</p>}
                {nt.contact_email && (
                  <a href={`mailto:${nt.contact_email}`}
                    className="inline-flex h-11 items-center font-mono text-xs text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    {nt.contact_email}
                  </a>
                )}
              </div>
            </section>
          )}

          <NoticeEnrich id={nt.id} />

          <div className="border-t border-border pt-6">
            <BidCta nt={nt} closed={closed} testid="cta-bottom" />
          </div>
        </div>
      </main>
    </div>
  );
}
