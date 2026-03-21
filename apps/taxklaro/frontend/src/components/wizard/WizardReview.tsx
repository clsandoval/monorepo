import { Button } from '@/components/ui/button';
import type { WizardFormData } from '@/types/wizard';

interface Props {
  data: Partial<WizardFormData>;
  onSubmit?: () => void;
  onBack?: () => void;
}

function labelPeriod(fp: string | undefined): string {
  if (!fp) return '—';
  const map: Record<string, string> = {
    ANNUAL: 'Annual (Full Year)',
    Q1: 'Q1 (Jan–Mar)',
    Q2: 'Q2 (Jan–Jun)',
    Q3: 'Q3 (Jan–Sep)',
  };
  return map[fp] ?? fp;
}

function labelTaxpayer(t: string | undefined): string {
  if (!t) return '—';
  const map: Record<string, string> = {
    PURELY_SE: 'Purely Self-Employed / Freelancer',
    MIXED_INCOME: 'Mixed Income (Employment + Business)',
    COMPENSATION_ONLY: 'Compensation Only',
  };
  return map[t] ?? t;
}

function labelRegime(r: string | null | undefined): string {
  if (!r) return 'Optimizer Mode (auto-recommend)';
  const map: Record<string, string> = {
    ELECT_EIGHT_PCT: '8% Flat Rate',
    ELECT_OSD: 'Graduated + 40% OSD',
    ELECT_ITEMIZED: 'Graduated + Itemized Deductions',
  };
  return map[r] ?? r;
}

export function WizardReview({ data, onSubmit, onBack }: Props) {
  const rows: { label: string; value: string }[] = [
    { label: 'Tax Year', value: String(data.taxYear ?? '—') },
    { label: 'Filing Period', value: labelPeriod(data.filingPeriod) },
    { label: 'Taxpayer Type', value: labelTaxpayer(data.taxpayerType) },
    { label: 'Gross Receipts', value: data.grossReceipts ? `₱${Number(data.grossReceipts).toLocaleString('en-PH', { minimumFractionDigits: 2 })}` : '—' },
    { label: 'Tax Method Election', value: labelRegime(data.electedRegime) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-zinc-100 text-2xl font-normal">Review your inputs</h2>
        <p className="text-sm text-zinc-400 mt-1.5">
          Please confirm the details below before computing.
        </p>
      </div>

      <div className="rounded-xl border border-zinc-700 bg-zinc-800 divide-y divide-zinc-700">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between px-5 py-3.5">
            <span className="text-sm text-zinc-400">{row.label}</span>
            <span className="text-sm font-medium text-zinc-100">{row.value}</span>
          </div>
        ))}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} className="h-11 px-5">Back</Button>
        <Button onClick={onSubmit} className="h-11 px-6">Compute Tax</Button>
      </div>
    </div>
  );
}

export default WizardReview;
