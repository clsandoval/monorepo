import type { PenaltyLineItem, BOPenaltyItem } from "@/engine/penalties";
import { formatCurrency } from "@/lib/utils";

interface PenaltyTableProps {
  lineItems: PenaltyLineItem[];
  boPenalties: BOPenaltyItem[];
  mc28Penalty: number;
  totalPenalty: number;
}

export function PenaltyTable({
  lineItems,
  boPenalties,
  mc28Penalty,
  totalPenalty,
}: PenaltyTableProps) {
  return (
    <div className="space-y-6">
      {/* GIS/AFS Penalty Table */}
      {lineItems.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-divider">
          <table className="w-full font-body text-sm">
            <thead>
              <tr className="border-b border-divider bg-gray-50">
                <th className="px-4 py-3 text-left font-semibold text-charcoal">
                  Year
                </th>
                <th className="px-4 py-3 text-left font-semibold text-charcoal">
                  Report
                </th>
                <th className="px-4 py-3 text-left font-semibold text-charcoal">
                  Violation
                </th>
                <th className="px-4 py-3 text-center font-semibold text-charcoal">
                  Offense #
                </th>
                <th className="px-4 py-3 text-right font-semibold text-charcoal">
                  Base Penalty
                </th>
                <th className="px-4 py-3 text-right font-semibold text-charcoal">
                  Surcharge
                </th>
                <th className="px-4 py-3 text-right font-semibold text-charcoal">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item, i) => (
                <tr
                  key={`${item.reportType}-${item.year}`}
                  className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}
                >
                  <td className="px-4 py-2.5 text-charcoal">{item.year}</td>
                  <td className="px-4 py-2.5 text-charcoal">
                    {item.reportType}
                  </td>
                  <td className="px-4 py-2.5 text-charcoal">
                    {item.violationType === "late_filing"
                      ? "Late Filing"
                      : "Non-Filing"}
                  </td>
                  <td className="px-4 py-2.5 text-center text-charcoal">
                    {item.offenseNumber}
                    {item.offenseNumber >= 5 && (
                      <span className="ml-1 text-xs text-crimson">!</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right text-crimson">
                    {formatCurrency(item.basePenalty)}
                  </td>
                  <td className="px-4 py-2.5 text-right text-crimson">
                    {item.surchargeMonths > 0
                      ? `${formatCurrency(item.surchargeRate)}/mo x ${item.surchargeMonths}`
                      : "\u2014"}
                  </td>
                  <td className="px-4 py-2.5 text-right font-semibold text-crimson">
                    {formatCurrency(item.totalPenalty)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-charcoal/20 bg-gray-50">
                <td
                  colSpan={6}
                  className="px-4 py-3 text-right font-semibold text-charcoal"
                >
                  GIS/AFS Subtotal
                </td>
                <td className="px-4 py-3 text-right font-bold text-crimson">
                  {formatCurrency(
                    lineItems.reduce((sum, i) => sum + i.totalPenalty, 0)
                  )}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* BO Penalties */}
      {boPenalties.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-divider">
          <h3 className="border-b border-divider bg-gray-50 px-4 py-3 font-body text-sm font-semibold text-charcoal">
            Beneficial Ownership (BO) Penalties
          </h3>
          <table className="w-full font-body text-sm">
            <thead>
              <tr className="border-b border-divider bg-gray-50/50">
                <th className="px-4 py-3 text-left font-semibold text-charcoal">
                  Year
                </th>
                <th className="px-4 py-3 text-right font-semibold text-charcoal">
                  Days Overdue
                </th>
                <th className="px-4 py-3 text-right font-semibold text-charcoal">
                  Total (at 1,000/day)
                </th>
              </tr>
            </thead>
            <tbody>
              {boPenalties.map((item, i) => (
                <tr
                  key={`bo-${item.year}`}
                  className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}
                >
                  <td className="px-4 py-2.5 text-charcoal">{item.year}</td>
                  <td className="px-4 py-2.5 text-right text-charcoal">
                    {item.daysOverdue.toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-right font-semibold text-crimson">
                    {formatCurrency(item.totalPenalty)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-charcoal/20 bg-gray-50">
                <td
                  colSpan={2}
                  className="px-4 py-3 text-right font-semibold text-charcoal"
                >
                  BO Subtotal
                </td>
                <td className="px-4 py-3 text-right font-bold text-crimson">
                  {formatCurrency(
                    boPenalties.reduce((sum, i) => sum + i.totalPenalty, 0)
                  )}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* MC28 Penalty */}
      {mc28Penalty > 0 && (
        <div className="rounded-lg border border-divider bg-gray-50 px-4 py-3">
          <div className="flex items-center justify-between font-body text-sm">
            <span className="font-semibold text-charcoal">
              MC28 Non-Compliance Penalty
            </span>
            <span className="font-bold text-crimson">
              {formatCurrency(mc28Penalty)}
            </span>
          </div>
        </div>
      )}

      {/* Grand Total */}
      <div className="rounded-lg border-2 border-charcoal/20 bg-charcoal/5 px-4 py-4">
        <div className="flex items-center justify-between">
          <span className="font-display text-lg font-semibold text-charcoal">
            Estimated Total Penalties
          </span>
          <span className="font-display text-2xl font-bold text-crimson">
            {formatCurrency(totalPenalty)}
          </span>
        </div>
      </div>
    </div>
  );
}
