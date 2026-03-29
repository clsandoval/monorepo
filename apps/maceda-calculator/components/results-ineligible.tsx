import type { MacedaResult } from "@/lib/engine/types";

export function ResultsIneligible({ result }: { result: MacedaResult }) {
  const progressPercent = Math.min(100, (result.yearsPaid / 2) * 100);
  const monthsToThreshold = Math.max(0, 24 - result.yearsPaid * 12);

  return (
    <>
      <div className="rounded-xl border border-border-subtle bg-bg-elevated px-7 py-6">
        <div className="mb-2 font-heading text-xs font-semibold uppercase tracking-widest text-text-tertiary">
          Section 4 — Under 2 Years
        </div>
        <p className="text-sm leading-relaxed text-text-secondary">
          You have not yet reached the 2-year payment threshold for a Cash
          Surrender Value refund. However, under{" "}
          <strong className="font-semibold text-text-primary">
            Section 4 of RA 6552
          </strong>
          , you are entitled to a{" "}
          <strong className="font-semibold text-accent">
            60-day grace period
          </strong>{" "}
          from the date of default to catch up on missed payments without
          additional interest.
        </p>
      </div>
      <div className="mt-4 rounded-xl border border-border-subtle bg-bg-elevated px-7 py-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[13px] text-text-secondary">
            Progress to CSV eligibility
          </span>
          <span className="font-mono text-sm font-medium text-text-primary">
            {result.yearsPaid} of 2 years
          </span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-accent transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        {monthsToThreshold > 0 && (
          <p className="mt-2 text-xs text-text-tertiary">
            ~{monthsToThreshold} more months of payments until you qualify for a
            CSV refund under Section 3.
          </p>
        )}
      </div>
    </>
  );
}
