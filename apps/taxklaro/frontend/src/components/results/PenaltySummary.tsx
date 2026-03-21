import type { PenaltyResult } from '@/types/engine-output';

interface PenaltySummaryProps {
  penalties: PenaltyResult;
}

function formatPeso(value: string): string {
  const num = parseFloat(value);
  return '₱' + num.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function PenaltySummary({ penalties }: PenaltySummaryProps) {
  if (!penalties.applies) {
    return (
      <p className="text-sm text-muted-foreground">
        No late filing penalties apply. Filing is on time.
      </p>
    );
  }

  const { itPenalties, ptPenalties, totalPenalties, daysLate, monthsLate } = penalties;
  const hasPtPenalties = parseFloat(ptPenalties.total) > 0;

  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground mb-3">
        {daysLate} day{daysLate !== 1 ? 's' : ''} late ({monthsLate} month{monthsLate !== 1 ? 's' : ''})
      </p>

      <table className="w-full text-sm mb-4">
        <thead>
          <tr>
            <th className="text-left pb-1.5 text-xs uppercase tracking-wide text-muted-foreground font-normal" colSpan={2}>
              Income Tax Penalties
            </th>
          </tr>
        </thead>
        <tbody>
          <tr className="even:bg-gray-50/50">
            <td className="py-1.5 text-muted-foreground">Surcharge (25%)</td>
            <td className="py-1.5 text-right tabular-nums text-foreground">{formatPeso(itPenalties.surcharge)}</td>
          </tr>
          <tr className="even:bg-gray-50/50">
            <td className="py-1.5 text-muted-foreground">Interest (12% p.a.)</td>
            <td className="py-1.5 text-right tabular-nums text-foreground">{formatPeso(itPenalties.interest)}</td>
          </tr>
          <tr className="even:bg-gray-50/50">
            <td className="py-1.5 text-muted-foreground">Compromise Penalty</td>
            <td className="py-1.5 text-right tabular-nums text-foreground">{formatPeso(itPenalties.compromise)}</td>
          </tr>
        </tbody>
      </table>

      {hasPtPenalties && (
        <table className="w-full text-sm mb-4">
          <thead>
            <tr>
              <th className="text-left pb-1.5 text-xs uppercase tracking-wide text-muted-foreground font-normal" colSpan={2}>
                Percentage Tax Penalties
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="even:bg-gray-50/50">
              <td className="py-1.5 text-muted-foreground">Surcharge</td>
              <td className="py-1.5 text-right tabular-nums text-foreground">{formatPeso(ptPenalties.surcharge)}</td>
            </tr>
            <tr className="even:bg-gray-50/50">
              <td className="py-1.5 text-muted-foreground">Interest</td>
              <td className="py-1.5 text-right tabular-nums text-foreground">{formatPeso(ptPenalties.interest)}</td>
            </tr>
            <tr className="even:bg-gray-50/50">
              <td className="py-1.5 text-muted-foreground">Compromise</td>
              <td className="py-1.5 text-right tabular-nums text-foreground">{formatPeso(ptPenalties.compromise)}</td>
            </tr>
          </tbody>
        </table>
      )}

      <div className="flex justify-between items-baseline pt-2.5 border-t border-border">
        <span className="text-sm text-amber-600 font-medium">Total Penalties</span>
        <span className="tabular-nums text-amber-600 font-semibold text-lg">{formatPeso(totalPenalties)}</span>
      </div>
    </div>
  );
}

export default PenaltySummary;
