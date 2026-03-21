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
      <p className="text-sm text-zinc-500">
        No late filing penalties apply. Filing is on time.
      </p>
    );
  }

  const { itPenalties, ptPenalties, totalPenalties, daysLate, monthsLate } = penalties;
  const hasPtPenalties = parseFloat(ptPenalties.total) > 0;

  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-zinc-500 mb-3">
        {daysLate} day{daysLate !== 1 ? 's' : ''} late ({monthsLate} month{monthsLate !== 1 ? 's' : ''})
      </p>

      <table className="w-full text-sm mb-4">
        <thead>
          <tr>
            <th className="text-left pb-1.5 text-xs uppercase tracking-wide text-zinc-500 font-normal" colSpan={2}>
              Income Tax Penalties
            </th>
          </tr>
        </thead>
        <tbody>
          <tr className="even:bg-zinc-900/30">
            <td className="py-1.5 text-zinc-400">Surcharge (25%)</td>
            <td className="py-1.5 text-right tabular-nums text-zinc-50">{formatPeso(itPenalties.surcharge)}</td>
          </tr>
          <tr className="even:bg-zinc-900/30">
            <td className="py-1.5 text-zinc-400">Interest (12% p.a.)</td>
            <td className="py-1.5 text-right tabular-nums text-zinc-50">{formatPeso(itPenalties.interest)}</td>
          </tr>
          <tr className="even:bg-zinc-900/30">
            <td className="py-1.5 text-zinc-400">Compromise Penalty</td>
            <td className="py-1.5 text-right tabular-nums text-zinc-50">{formatPeso(itPenalties.compromise)}</td>
          </tr>
        </tbody>
      </table>

      {hasPtPenalties && (
        <table className="w-full text-sm mb-4">
          <thead>
            <tr>
              <th className="text-left pb-1.5 text-xs uppercase tracking-wide text-zinc-500 font-normal" colSpan={2}>
                Percentage Tax Penalties
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="even:bg-zinc-900/30">
              <td className="py-1.5 text-zinc-400">Surcharge</td>
              <td className="py-1.5 text-right tabular-nums text-zinc-50">{formatPeso(ptPenalties.surcharge)}</td>
            </tr>
            <tr className="even:bg-zinc-900/30">
              <td className="py-1.5 text-zinc-400">Interest</td>
              <td className="py-1.5 text-right tabular-nums text-zinc-50">{formatPeso(ptPenalties.interest)}</td>
            </tr>
            <tr className="even:bg-zinc-900/30">
              <td className="py-1.5 text-zinc-400">Compromise</td>
              <td className="py-1.5 text-right tabular-nums text-zinc-50">{formatPeso(ptPenalties.compromise)}</td>
            </tr>
          </tbody>
        </table>
      )}

      <div className="flex justify-between items-baseline pt-2.5 border-t border-zinc-800">
        <span className="text-sm text-amber-500 font-medium">Total Penalties</span>
        <span className="tabular-nums text-amber-500 font-semibold text-lg">{formatPeso(totalPenalties)}</span>
      </div>
    </div>
  );
}

export default PenaltySummary;
