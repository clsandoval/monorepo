import { formatCentavos, type YearBreakdown } from "@/lib/engine";

type Props = {
  breakdown: YearBreakdown[];
};

export function BreakdownTable({ breakdown }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left font-heading text-[13px] text-text-primary">
        <thead>
          <tr className="border-b-2 border-border">
            <th className="pb-2 pr-4 font-bold">Year</th>
            <th className="pb-2 pr-4 font-bold text-right">Principal</th>
            <th className="pb-2 pr-4 font-bold text-right">Months</th>
            <th className="pb-2 pr-4 font-bold text-right">Penalty Rate</th>
            <th className="pb-2 font-bold text-right">Penalty Waived</th>
          </tr>
        </thead>
        <tbody>
          {breakdown.map((row) => (
            <tr key={row.calendarYear} className="border-b border-border-subtle">
              <td className="py-2 pr-4 font-semibold">{row.calendarYear}</td>
              <td className="py-2 pr-4 text-right">
                {formatCentavos(row.principal)}
              </td>
              <td className="py-2 pr-4 text-right">{row.monthsDelinquent}</td>
              <td className="py-2 pr-4 text-right">
                {row.penaltyRate}%
                {row.penaltyRate === 72 && (
                  <span className="ml-1 text-text-secondary text-[11px]">
                    (capped)
                  </span>
                )}
              </td>
              <td className="py-2 text-right text-accent font-semibold">
                {formatCentavos(row.penaltyAmount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
