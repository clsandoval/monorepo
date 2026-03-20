/**
 * WhatIfPanel — toggle switches for key levers with side-by-side comparison.
 */

import { useState } from 'react';
import type { EstateTaxWizardState } from '@/types/estate-tax';
import type { EstateTaxFullOutput } from '@/lib/estate-tax-engine';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';

export interface WhatIfPanelProps {
  wizardState: EstateTaxWizardState;
  currentOutput: EstateTaxFullOutput;
  onCompute: (state: EstateTaxWizardState) => EstateTaxFullOutput;
}

function formatPesos(centavos: number): string {
  return (centavos / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

interface Lever {
  id: string;
  label: string;
  description: string;
  getState: (state: EstateTaxWizardState, toggled: boolean) => EstateTaxWizardState;
  currentLabel: (state: EstateTaxWizardState) => string;
}

const LEVERS: Lever[] = [
  {
    id: 'amnesty',
    label: 'Estate Tax Amnesty',
    description: 'Toggle amnesty election to compare amnesty vs. regular rates.',
    currentLabel: (state) => (state.filing.userElectsAmnesty ? 'Elected' : 'Not elected'),
    getState: (state, toggled) => ({
      ...state,
      filing: { ...state.filing, userElectsAmnesty: toggled },
    }),
  },
  {
    id: 'family-home',
    label: 'Family Home Designation',
    description: 'Toggle family home designation on the first real property (up to ₱10M deduction).',
    currentLabel: (state) =>
      state.realProperties.some((p) => p.isFamilyHome) ? 'Claimed' : 'Not claimed',
    getState: (state, toggled) => ({
      ...state,
      realProperties: state.realProperties.map((p, i) =>
        i === 0 ? { ...p, isFamilyHome: toggled, hasBarangayCert: toggled } : p,
      ),
    }),
  },
];

export function WhatIfPanel({ wizardState, currentOutput, onCompute }: WhatIfPanelProps) {
  const [toggledLevers, setToggledLevers] = useState<Record<string, boolean>>({});
  const [alternativeOutputs, setAlternativeOutputs] = useState<
    Record<string, EstateTaxFullOutput>
  >({});

  const handleToggle = (lever: Lever) => {
    const currentToggled = toggledLevers[lever.id] ?? false;
    const newToggled = !currentToggled;
    const altState = lever.getState(wizardState, newToggled);
    const altOutput = onCompute(altState);

    setToggledLevers((prev) => ({ ...prev, [lever.id]: newToggled }));
    setAlternativeOutputs((prev) => ({ ...prev, [lever.id]: altOutput }));
  };

  const currentTax = currentOutput.taxComputation.netEstateTaxDue;

  return (
    <div data-testid="what-if-panel" className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Toggle scenarios below to see the tax impact side-by-side.
      </p>

      {LEVERS.map((lever) => {
        const isToggled = toggledLevers[lever.id] ?? false;
        const altOutput = alternativeOutputs[lever.id];
        const altTax = altOutput?.taxComputation.netEstateTaxDue;
        const delta = altTax !== undefined ? altTax - currentTax : null;

        return (
          <Card key={lever.id} data-testid={`what-if-lever-${lever.id}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-sm font-semibold">{lever.label}</CardTitle>
                  <CardDescription className="text-xs mt-1">{lever.description}</CardDescription>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-muted-foreground">
                    {lever.currentLabel(wizardState)}
                  </span>
                  <Checkbox
                    id={`what-if-toggle-${lever.id}`}
                    data-testid={`what-if-toggle-${lever.id}`}
                    checked={isToggled}
                    onCheckedChange={() => handleToggle(lever)}
                  />
                  <Label
                    htmlFor={`what-if-toggle-${lever.id}`}
                    className="text-xs cursor-pointer font-normal"
                  >
                    Toggle
                  </Label>
                </div>
              </div>
            </CardHeader>

            {altOutput && (
              <CardContent className="space-y-3">
                <Separator />
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Current Tax</p>
                    <p className="font-mono font-semibold text-[#1e3a5f]">₱{formatPesos(currentTax)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Alternative Tax</p>
                    <p className="font-mono font-semibold text-[#1e3a5f]">₱{formatPesos(altTax!)}</p>
                  </div>
                </div>
                {delta !== null && (
                  <div
                    data-testid={`what-if-delta-${lever.id}`}
                    className={`flex items-center gap-2 text-sm font-semibold ${
                      delta < 0
                        ? 'text-green-600'
                        : delta > 0
                          ? 'text-red-600'
                          : 'text-muted-foreground'
                    }`}
                  >
                    {delta < 0 ? (
                      <TrendingDown className="h-4 w-4" />
                    ) : delta > 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <Minus className="h-4 w-4" />
                    )}
                    {delta < 0
                      ? `Save ₱${formatPesos(Math.abs(delta))}`
                      : delta > 0
                        ? `Cost +₱${formatPesos(delta)}`
                        : 'No change'}
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
