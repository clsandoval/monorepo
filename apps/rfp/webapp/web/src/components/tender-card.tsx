// Tender card — money is the anchor (large & heavy), per design asset 09. Grayscale only.
export type Notice = {
  id: number; title: string; agency: string; location: string | null;
  abc: number | null; abc_lot_min: number | null; abc_lot_max: number | null;
  mode_norm: string | null; closing_day: string | null; closing_at: string | null;
  work_type: string | null; needs_pcab: number | null;
};

function peso(n: number | null): string {
  if (n == null) return "ABC —";
  if (n >= 1e9) return `₱${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `₱${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `₱${Math.round(n / 1e3)}K`;
  return `₱${n}`;
}
function daysLeft(closingAt: string | null): string {
  if (!closingAt) return "";
  const d = Math.ceil((new Date(closingAt).getTime() - Date.now()) / 86_400_000);
  return d < 0 ? "closed" : d === 0 ? "today" : `${d}d`;
}

export function TenderCard({ n }: { n: Notice }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 text-card-foreground">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-mono text-2xl font-bold tabular-nums tracking-tight">{peso(n.abc)}</span>
        <span className="font-mono text-xs text-muted-foreground tabular-nums">{daysLeft(n.closing_at)}</span>
      </div>
      <p className="mt-2 line-clamp-2 text-sm font-medium leading-snug">{n.title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{n.agency}</p>
      <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] text-muted-foreground">
        {n.location && <span className="rounded border border-border px-1.5 py-0.5">{n.location}</span>}
        {n.work_type && <span className="rounded border border-border px-1.5 py-0.5">{n.work_type}</span>}
        {n.mode_norm && <span className="rounded border border-border px-1.5 py-0.5">{n.mode_norm}</span>}
        {n.needs_pcab === 1 && <span className="rounded border border-border px-1.5 py-0.5">PCAB</span>}
        <span className="ml-auto font-mono tabular-nums">#{n.id}</span>
      </div>
    </div>
  );
}
