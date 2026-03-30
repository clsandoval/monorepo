import {
  formatCentavos,
  getDaysUntilDeadline,
  type AmnestyResult,
} from "@/lib/engine";
import { BreakdownTable } from "./breakdown-table";

type Props = {
  result: AmnestyResult;
};

export function ResultsPanel({ result }: Props) {
  const daysLeft = getDaysUntilDeadline();

  return (
    <div className="rounded-lg border border-border bg-bg-panel p-6">
      <h2 className="font-heading text-xl font-bold text-text-primary mb-6">
        Your Amnesty Savings
      </h2>

      {/* Pay vs Save grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="rounded-md bg-bg p-4 border border-border-subtle">
          <p className="text-xs font-body font-medium text-text-secondary uppercase tracking-wide mb-1">
            You Pay (Amnesty)
          </p>
          <p className="font-heading text-2xl font-bold text-text-primary">
            {formatCentavos(result.principalDue)}
          </p>
          <p className="text-xs font-body text-text-secondary mt-1">
            Principal only
          </p>
        </div>
        <div className="rounded-md bg-success-soft p-4 border border-success/20">
          <p className="text-xs font-body font-medium text-success uppercase tracking-wide mb-1">
            You Save
          </p>
          <p className="font-heading text-2xl font-bold text-success">
            {formatCentavos(result.penaltiesWaived)}
          </p>
          <p className="text-xs font-body text-success mt-1">
            Penalties waived
          </p>
        </div>
      </div>

      {/* Comparison line */}
      <div className="rounded-md bg-bg px-4 py-3 border border-border-subtle mb-6">
        <div className="flex items-center justify-between text-sm font-body">
          <span className="text-text-secondary">Without amnesty:</span>
          <span className="font-semibold text-text-primary line-through decoration-accent/40">
            {formatCentavos(result.totalWithoutAmnesty)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm font-body mt-1">
          <span className="text-text-secondary">Savings rate:</span>
          <span className="font-semibold text-accent">
            {result.savingsRate.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Deadline reminder */}
      {daysLeft > 0 && (
        <p className="text-sm font-body text-text-secondary mb-6">
          <strong className="text-accent">{daysLeft} days</strong> remaining to
          avail of the amnesty. File before July 5, 2026.
        </p>
      )}

      {/* Breakdown table */}
      <div className="mb-6">
        <h3 className="font-heading text-sm font-bold text-text-primary mb-3 uppercase tracking-wide">
          Year-by-Year Breakdown
        </h3>
        <BreakdownTable breakdown={result.breakdown} />
      </div>

      {/* Print button */}
      <button
        onClick={() => window.print()}
        className="h-[44px] w-full rounded-md border-2 border-border text-text-primary font-body text-sm font-semibold hover:bg-bg transition-colors cursor-pointer"
      >
        Print Summary
      </button>
    </div>
  );
}
