import type { TaxComputationResult } from '@/types/engine-output';

interface QuarterlyBreakdownViewProps {
  result: TaxComputationResult;
  taxYear: number;
}

export function QuarterlyBreakdownView({ result, taxYear }: QuarterlyBreakdownViewProps) {
  const pathKey = result.selectedPath ?? result.recommendedRegime;
  const path = result.comparison.find((c) => c.path === pathKey);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-zinc-100 text-xl font-normal">
          Quarterly Breakdown — {taxYear}
        </h2>
        <p className="text-sm text-zinc-400 mt-1">
          Cumulative method: each quarterly payment credits toward the annual total.
        </p>
      </div>

      <div className="rounded-xl border border-zinc-700 bg-zinc-800 p-5 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-400">Tax Path</span>
          <span className="text-zinc-100 font-medium">{path?.label ?? result.recommendedRegime}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-400">Total Tax Burden</span>
          <span className="text-zinc-100 font-medium tabular-nums">
            ₱{Number(path?.totalTaxBurden ?? 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  );
}

export default QuarterlyBreakdownView;
