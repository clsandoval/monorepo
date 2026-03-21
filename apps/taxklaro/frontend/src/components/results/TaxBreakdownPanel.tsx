import type { Peso, RegimePath } from '@/types/common';

interface TaxBreakdownPanelProps {
  selectedPath: RegimePath;
  selectedIncomeTaxDue: Peso;
  selectedPercentageTaxDue: Peso;
  selectedTotalTax: Peso;
}

const PATH_LABELS: Record<RegimePath, string> = {
  PATH_A: 'Path A — Graduated + Itemized',
  PATH_B: 'Path B — Graduated + OSD (40%)',
  PATH_C: 'Path C — 8% Flat Rate',
};

function formatPeso(value: Peso): string {
  const num = parseFloat(value);
  return '₱' + num.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function TaxBreakdownPanel({
  selectedPath,
  selectedIncomeTaxDue,
  selectedPercentageTaxDue,
  selectedTotalTax,
}: TaxBreakdownPanelProps) {
  const ptDue = parseFloat(selectedPercentageTaxDue);

  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground mb-3">{PATH_LABELS[selectedPath]}</p>
      <table className="w-full text-sm">
        <tbody>
          <tr className="even:bg-gray-50/50">
            <td className="py-1.5 text-muted-foreground">Income Tax Due</td>
            <td className="py-1.5 text-right tabular-nums text-foreground">{formatPeso(selectedIncomeTaxDue)}</td>
          </tr>
          {ptDue > 0 && (
            <tr className="even:bg-gray-50/50">
              <td className="py-1.5 text-muted-foreground">Percentage Tax (3%)</td>
              <td className="py-1.5 text-right tabular-nums text-foreground">{formatPeso(selectedPercentageTaxDue)}</td>
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr className="border-t border-border">
            <td className="pt-2.5 text-foreground font-medium">Total Tax Burden</td>
            <td className="pt-2.5 text-right tabular-nums text-red-600 font-semibold text-base">{formatPeso(selectedTotalTax)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export default TaxBreakdownPanel;
