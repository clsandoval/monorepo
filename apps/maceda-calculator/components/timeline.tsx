import type { MacedaResult } from "@/lib/engine/types";

export function Timeline({ result }: { result: MacedaResult }) {
  if (!result.eligible || result.timeline.length === 0) return null;

  const basePct = 50;
  const bonusPct = (result.csvPercentage - 0.5) * 100;
  const remainingPct = Math.max(0, 90 - basePct - bonusPct);

  return (
    <div className="mt-4 rounded-xl border border-border-subtle bg-bg-elevated p-7">
      <div className="mb-5 font-heading text-[13px] font-semibold uppercase tracking-wider text-text-tertiary">
        CSV Buildup Over Time
      </div>
      <div className="mb-2.5 flex h-9 overflow-hidden rounded-lg">
        <div
          className="flex items-center justify-center bg-accent text-[11px] font-semibold text-white"
          style={{ flex: basePct }}
        >
          Base 50%
        </div>
        {bonusPct > 0 && (
          <div
            className="flex items-center justify-center text-[11px] font-semibold text-white"
            style={{ flex: bonusPct, backgroundColor: "#D88A5C" }}
          >
            +{bonusPct.toFixed(1)}%
          </div>
        )}
        <div
          className="flex items-center justify-center bg-border text-[11px] font-normal text-text-tertiary"
          style={{ flex: remainingPct }}
        >
          {remainingPct > 10 ? "remaining" : ""}
        </div>
      </div>
      <div className="mb-4 flex justify-between text-[11px] text-text-tertiary">
        <span>Year 1</span>
        <span className="font-semibold text-accent">2-yr threshold</span>
        {result.yearsPaid >= 5 && <span>Year 5</span>}
        <span>Year {result.yearsPaid} (now)</span>
      </div>
      <div className="border-t border-border-subtle pt-3.5 text-[13px] font-light leading-relaxed text-text-secondary">
        After 2 years of payments, you unlock a 50% base refund. Each additional
        year beyond year 5 adds 5%, capped at 90% of total payments made.
      </div>
    </div>
  );
}
