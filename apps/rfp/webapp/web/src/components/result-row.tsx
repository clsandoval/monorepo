// One result row — dense grid on md+, stacked card on mobile. Grayscale only.
import type { ResultRow } from "@/lib/search-types";

// Deep-link to the real PhilGEPS notice (the two systems have different detail pages).
function noticeUrl(r: ResultRow): string {
  return r.source === "legacy"
    ? `https://notices.philgeps.gov.ph/GEPSNONPILOT/Tender/SplashBidNoticeAbstractUI.aspx?refID=${r.id}`
    : `https://philgeps.gov.ph/Indexes/viewLiveTenderDetails/${r.id}`;
}

function peso(n: number | null): string {
  if (n == null) return "ABC —";
  if (n >= 1e9) return `₱${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `₱${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `₱${Math.round(n / 1e3)}K`;
  return `₱${n}`;
}

// "3d 12h" style; urgent = closing within 4 days (filled neutral chip).
function closesIn(r: ResultRow): { label: string; urgent: boolean } {
  if (r.closing_at) {
    const ms = new Date(r.closing_at).getTime() - Date.now();
    if (ms < 0) return { label: "closed", urgent: false };
    const d = Math.floor(ms / 86_400_000);
    const h = Math.floor((ms % 86_400_000) / 3_600_000);
    return { label: d > 0 ? `${d}d ${h}h` : `${h}h`, urgent: d <= 4 };
  }
  if (r.days != null) {
    if (r.days < 0) return { label: "closed", urgent: false };
    return { label: `${r.days}d`, urgent: r.days <= 4 };
  }
  return { label: "—", urgent: false };
}

export function ResultRowItem({ row }: { row: ResultRow }) {
  const c = closesIn(row);
  return (
    <a href={noticeUrl(row)} target="_blank" rel="noopener noreferrer" data-testid="result-row"
      aria-label={`Open notice ${row.id} on PhilGEPS: ${row.title}`}
      className="group block border-b border-border px-3 py-3 transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring md:grid md:grid-cols-[5.5rem_minmax(0,1fr)_7rem_5.5rem] md:items-center md:gap-4 md:px-4">
      <span className="font-mono text-xs text-muted-foreground tabular-nums">{row.id}</span>
      <span className="mt-1 block min-w-0 md:mt-0">
        <span className="line-clamp-2 text-sm font-medium leading-snug group-hover:underline">{row.title}</span>
        <span className="mt-0.5 line-clamp-1 block text-xs text-muted-foreground">{row.agency}</span>
      </span>
      {/* md:contents lifts ABC + chip into their own grid cells on desktop */}
      <span className="mt-2 flex items-center justify-between gap-3 md:contents">
        <span className="font-mono text-sm font-bold tabular-nums md:text-right">{peso(row.abc)}</span>
        <span className={`inline-flex justify-center whitespace-nowrap rounded px-2 py-0.5 font-mono text-xs tabular-nums md:justify-self-end ${
          c.urgent ? "border border-primary/50 bg-primary/10 font-medium text-primary" : "border border-border text-muted-foreground"}`}>
          {c.label}
        </span>
      </span>
    </a>
  );
}
