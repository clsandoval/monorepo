import { useState } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { WizardFormData } from '@/types/wizard';

export type WizardMode = 'ANNUAL' | 'QUARTERLY' | 'PENALTY';

interface Props {
  data: Partial<WizardFormData>;
  onChange: (updates: Partial<WizardFormData>) => void;
}

const MODE_OPTIONS: { value: WizardMode; title: string; description: string }[] = [
  {
    value: 'ANNUAL',
    title: 'Annual Income Tax Return',
    description:
      'Compute your full-year income tax and decide which tax method saves you the most. Filing deadline: April 15. Forms: 1701 or 1701A.',
  },
  {
    value: 'QUARTERLY',
    title: 'Quarterly Income Tax Return',
    description:
      'Pay your income tax for Q1, Q2, or Q3. Uses the cumulative method — earlier quarters are credited. Forms: 1701Q.',
  },
  {
    value: 'PENALTY',
    title: 'Penalty and Late Filing',
    description:
      'Missed a deadline? Compute the exact surcharge, interest, and compromise penalty owed for a late return.',
  },
];

export function WS00ModeSelection({ data, onChange }: Props) {
  const [selected, setSelected] = useState<WizardMode | null>(
    (data.filingPeriod === 'Q1' || data.filingPeriod === 'Q2' || data.filingPeriod === 'Q3')
      ? 'QUARTERLY'
      : data.filingPeriod === 'ANNUAL'
      ? 'ANNUAL'
      : null
  );

  function handleSelect(value: WizardMode) {
    setSelected(value);
    if (value === 'ANNUAL') {
      onChange({ filingPeriod: 'ANNUAL' });
    } else if (value === 'QUARTERLY') {
      onChange({ filingPeriod: 'Q1' });
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-normal">What would you like to compute?</h2>
        <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">Choose the type of computation to get started.</p>
      </div>

      <RadioGroup
        value={selected ?? ''}
        onValueChange={(v) => handleSelect(v as WizardMode)}
        className="gap-3"
      >
        {MODE_OPTIONS.map((opt) => (
          <div key={opt.value}>
            <RadioGroupItem value={opt.value} id={`mode-${opt.value}`} className="sr-only" />
            <Label htmlFor={`mode-${opt.value}`} className="cursor-pointer block">
              <Card
                className={cn(
                  'transition-all duration-200',
                  selected === opt.value
                    ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                    : 'hover:border-gray-400'
                )}
              >
                <CardContent className="p-5">
                  <div className="font-medium text-[0.9375rem]">{opt.title}</div>
                  <div className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{opt.description}</div>
                </CardContent>
              </Card>
            </Label>
          </div>
        ))}
      </RadioGroup>

    </div>
  );
}

export default WS00ModeSelection;
