import type { PercentageTaxResult } from '@/types/engine-output';

interface PercentageTaxSummaryProps {
  ptResult: PercentageTaxResult;
}

function formatPeso(value: string): string {
  const num = parseFloat(value);
  return '₱' + num.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatRate(value: string): string {
  const num = parseFloat(value) * 100;
  return num.toFixed(0) + '%';
}

export function PercentageTaxSummary({ ptResult }: PercentageTaxSummaryProps) {
  if (!ptResult.ptApplies) {
    return (
      <p className="text-sm text-muted-foreground">
        {ptResult.reason}
      </p>
    );
  }

  return (
    <div>
      <table className="w-full text-sm mb-2">
        <tbody>
          <tr className="even:bg-gray-50/50">
            <td className="py-1.5 text-muted-foreground">Tax Base (Gross Receipts)</td>
            <td className="py-1.5 text-right tabular-nums text-foreground">{formatPeso(ptResult.ptBase)}</td>
          </tr>
          <tr className="even:bg-gray-50/50">
            <td className="py-1.5 text-muted-foreground">Rate</td>
            <td className="py-1.5 text-right tabular-nums text-foreground">{formatRate(ptResult.ptRate)}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr className="border-t border-border">
            <td className="pt-2.5 text-foreground font-medium">Percentage Tax Due</td>
            <td className="pt-2.5 text-right tabular-nums text-red-600 font-semibold">{formatPeso(ptResult.ptDue)}</td>
          </tr>
        </tfoot>
      </table>
      <p className="text-xs text-muted-foreground pt-1">{ptResult.reason}</p>
      {ptResult.form2551qRequired && ptResult.filingDeadline && (
        <p className="text-xs text-muted-foreground">
          Filing deadline: {ptResult.filingDeadline}
        </p>
      )}
    </div>
  );
}

export default PercentageTaxSummary;
