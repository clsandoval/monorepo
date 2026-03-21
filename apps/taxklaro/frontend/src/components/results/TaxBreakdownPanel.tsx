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
      <p className="text-xs uppercase tracking-wide text-zinc-500 mb-3">{PATH_LABELS[selectedPath]}</p>
      <table className="w-full text-sm">
        <tbody>
          <tr className="even:bg-zinc-900/30">
            <td className="py-1.5 text-zinc-400">Income Tax Due</td>
            <td className="py-1.5 text-right tabular-nums text-zinc-50">{formatPeso(selectedIncomeTaxDue)}</td>
          </tr>
          {ptDue > 0 && (
            <tr className="even:bg-zinc-900/30">
              <td className="py-1.5 text-zinc-400">Percentage Tax (3%)</td>
              <td className="py-1.5 text-right tabular-nums text-zinc-50">{formatPeso(selectedPercentageTaxDue)}</td>
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr className="border-t border-zinc-800">
            <td className="pt-2.5 text-zinc-50 font-medium">Total Tax Burden</td>
            <td className="pt-2.5 text-right tabular-nums text-red-500 font-semibold text-base">{formatPeso(selectedTotalTax)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export default TaxBreakdownPanel;
