/**
 * WhatIfPanel — toggle switches for key levers with side-by-side comparison.
 */

import { useState } from 'react';
import type { EstateTaxWizardState } from '@/types/estate-tax';
import type { EstateTaxFullOutput } from '@/lib/estate-tax-engine';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
  getState: (state: EstateTaxWizardState, toggled: boolean) => EstateTaxWizardState;
  currentLabel: (state: EstateTaxWizardState) => string;
}

const LEVERS: Lever[] = [
  {
    id: 'amnesty',
    label: 'Estate Tax Amnesty',
    currentLabel: (state) => (state.filing.userElectsAmnesty ? 'Elected' : 'Not elected'),
    getState: (state, toggled) => ({
      ...state,
      filing: { ...state.filing, userElectsAmnesty: toggled },
    }),
  },
  {
    id: 'family-home',
    label: 'Family Home Designation',
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
        Toggle scenarios to see the tax impact side-by-side.
      </p>

      {LEVERS.map((lever) => {
        const isToggled = toggledLevers[lever.id] ?? false;
        const altOutput = alternativeOutputs[lever.id];
        const altTax = altOutput?.taxComputation.netEstateTaxDue;
        const delta = altTax !== undefined ? altTax - currentTax : null;

        return (
          <Card key={lever.id} data-testid={`what-if-lever-${lever.id}`}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">{lever.label}</CardTitle>
                <label className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">
                    {lever.currentLabel(wizardState)}
                  </span>
                  <input
                    type="checkbox"
                    data-testid={`what-if-toggle-${lever.id}`}
                    checked={isToggled}
                    onChange={() => handleToggle(lever)}
                  />
                  <span>Toggled</span>
                </label>
              </div>
            </CardHeader>

            {altOutput && (
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Current Tax</p>
                    <p className="font-mono font-semibold">₱{formatPesos(currentTax)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Alternative Tax</p>
                    <p className="font-mono font-semibold">₱{formatPesos(altTax!)}</p>
                  </div>
                </div>
                {delta !== null && (
                  <p
                    data-testid={`what-if-delta-${lever.id}`}
                    className={`text-sm font-semibold mt-2 ${delta < 0 ? 'text-green-600' : delta > 0 ? 'text-red-600' : 'text-muted-foreground'}`}
                  >
                    {delta < 0
                      ? `Save ₱${formatPesos(Math.abs(delta))}`
                      : delta > 0
                        ? `Cost +₱${formatPesos(delta)}`
                        : 'No change'}
                  </p>
                )}
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
