// /notice/[id] — server-rendered detail page (SEO wedge: full HTML, real title/description).
import { cache } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BackLink } from "@/components/notice-back";
import { NoticeEnrich } from "@/components/notice-enrich";
import { roundOf } from "@/lib/search-types";
import {
  getNotice, getSimilarAwards, parseBoq, philgepsUrl, requirementsFor, type NoticeDetail,
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
  const ms = new Date(closingAt).getTime() - Date.now();
  if (Number.isNaN(ms)) return null;
  if (ms < 0) return { label: "closed", urgent: false };
  const d = Math.floor(ms / 86_400_000);
  const h = Math.floor((ms % 86_400_000) / 3_600_000);
  return { label: d > 0 ? `closes in ${d}d ${h}h` : `closes in ${h}h`, urgent: d <= 4 };
}

function BidCta({ nt, testid }: { nt: NoticeDetail; testid: string }) {
  return (
    <a href={philgepsUrl(nt.source, nt.id)} target="_blank" rel="noopener noreferrer" data-testid={testid}
      className="inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:w-auto">
      Open on PhilGEPS to bid ↗
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
  const lotRange = nt.abc_lot_min != null && nt.abc_lot_max != null && nt.abc_lot_min !== nt.abc_lot_max
    ? `${peso(nt.abc_lot_min)} – ${peso(nt.abc_lot_max)} per lot` : null;

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="border-b border-primary">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4">
          <Link href="/" className="whitespace-nowrap text-2xl font-bold lowercase tracking-tight text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">bidkita</Link>
          <BackLink />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6" data-testid="notice-detail">
        {/* hero */}
        <p className="font-mono text-xs text-muted-foreground tabular-nums">
          #{nt.id}{nt.solicitation_no ? ` · ${nt.solicitation_no}` : ""} · Source: PhilGEPS{nt.source === "legacy" ? " (legacy)" : ""}
        </p>
        <h1 className="mt-2 text-xl font-bold leading-snug md:text-2xl">{nt.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{nt.agency}</p>

        <div className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <span className="font-mono text-4xl font-bold tabular-nums tracking-tight md:text-5xl" data-testid="notice-abc">
            {nt.abc != null ? peso(nt.abc) : "ABC —"}
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
          {nt.closing_at && <span>closing {fmtDateTime(nt.closing_at)}</span>}
          {nt.publish_day && <span>published {fmtDay(nt.publish_day)}</span>}
          {nt.delivery && !/^0\b/.test(nt.delivery) && <span>delivery {nt.delivery}</span>}
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {roundOf(nt.title, nt.mode) !== "fresh" && (
            <span className="inline-flex items-center rounded border border-primary/50 bg-primary/5 px-2 py-0.5 font-mono text-xs font-medium text-primary">
              {roundOf(nt.title, nt.mode) === "rebid" ? "RE-BID — failed bidding, easier round" : "NEGOTIATED — two failed biddings (Sec. 53.1)"}
            </span>
          )}
          {nt.mode && <Chip>{nt.mode}</Chip>}
          {nt.classification && <Chip>{nt.classification}</Chip>}
          {nt.work_type && <Chip>{nt.work_type.replace(/_/g, " ")}</Chip>}
          {nt.province && <Chip>{nt.province}</Chip>}
          {nt.needs_pcab === 1 && <Chip>PCAB required</Chip>}
        </div>

        <div className="mt-5"><BidCta nt={nt} testid="cta-top" /></div>

        <div className="mt-8 space-y-8">
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
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground/80" data-testid="notice-description">
                {nt.description}
              </p>
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
            {nt.eligibility.length > 0 && (
              <div className="mt-3 rounded-lg border border-border p-3">
                <p className="text-xs font-medium text-muted-foreground">Named in this notice</p>
                <ul className="mt-1 space-y-1 text-sm">
                  {nt.eligibility.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              </div>
            )}
          </section>

          {awards.length > 0 && (
            <section aria-label="Similar recent awards">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Similar recent awards</h2>
              <p className="mt-1 text-xs text-muted-foreground">who wins contracts like this one, and at what price</p>
              <ul className="mt-2 space-y-3" data-testid="similar-awards">
                {awards.map((a, i) => (
                  <li key={i} className="text-sm">
                    <p className="font-medium">
                      {a.winner}
                      {a.winner_province && <span className="ml-2 font-normal text-muted-foreground">({a.winner_province})</span>}
                    </p>
                    <p className="font-mono text-xs tabular-nums text-foreground/80">
                      won {peso(a.contract_amount)}
                      {a.win_ratio != null && a.abc != null &&
                        // never round a sub-100% winning bid up to "100% of the budget"
                        ` — ${a.win_ratio < 1 && a.win_ratio > 0.995 ? (a.win_ratio * 100).toFixed(1) : Math.round(a.win_ratio * 100)}% of the ${peso(a.abc)} budget`}
                      {a.award_date && ` · ${fmtDay(a.award_date) ?? a.award_date}`}
                    </p>
                    <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{a.title}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {(nt.contact || nt.contact_email || nt.contact_phone) && (
            <section aria-label="Contact">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Contact</h2>
              <div className="mt-2 space-y-1 text-sm" data-testid="notice-contact">
                {nt.contact && <p className="leading-relaxed text-foreground/80">{nt.contact}</p>}
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
            <BidCta nt={nt} testid="cta-bottom" />
          </div>
        </div>
      </main>
    </div>
  );
}
