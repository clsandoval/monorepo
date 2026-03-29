import type { MacedaResult } from "@/lib/engine/types";

function formatPeso(centavos: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(centavos / 100);
}

export function ResultsEligible({ result }: { result: MacedaResult }) {
  return (
    <>
      <div className="relative overflow-hidden rounded-xl border border-border-subtle bg-bg-elevated text-center shadow-sm">
        <div className="h-[3px] bg-accent" />
        <div className="px-7 py-9">
          <div className="mb-2.5 font-heading text-xs font-semibold uppercase tracking-widest text-accent">
            You are owed
          </div>
          <div className="font-mono text-[42px] font-semibold leading-none tracking-tighter text-text-primary">
            {formatPeso(result.csvAmount)}
          </div>
          <div className="mt-2 text-sm font-light text-text-secondary">
            {(result.csvPercentage * 100).toFixed(1)}% of{" "}
            {formatPeso(result.totalPayments)} in total payments
          </div>
          <span className="mt-3.5 inline-block rounded-full bg-success-soft px-3.5 py-1 text-xs font-semibold text-success">
            Eligible for CSV refund
          </span>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between rounded-xl border border-border-subtle bg-bg-elevated px-6 py-5">
        <div>
          <div className="text-[13px] text-text-secondary">Grace Period</div>
          <div className="mt-0.5 text-sm text-text-primary">
            You may delay payments for up to
          </div>
        </div>
        <div className="font-mono text-lg font-semibold text-success">
          {result.gracePeriod.months} mo
        </div>
      </div>
      {!result.gracePeriod.canExercise &&
        result.gracePeriod.nextEligibleDate && (
          <div className="mt-2 rounded-lg border border-border-subtle bg-bg-elevated px-6 py-3 text-xs text-text-secondary">
            Grace period was previously exercised. Next eligible date:{" "}
            <span className="font-semibold">
              {result.gracePeriod.nextEligibleDate}
            </span>
          </div>
        )}
    </>
  );
}
