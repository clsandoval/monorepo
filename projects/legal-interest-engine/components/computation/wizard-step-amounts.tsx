'use client';

import React, { useState } from 'react';

interface WizardStepAmountsProps {
  principalAmount: string;
  stipulatedRate: string;
  moralDamages: string;
  exemplaryDamages: string;
  attorneysFees: string;
  onChange: (field: string, value: string) => void;
}

export function WizardStepAmounts({
  principalAmount,
  stipulatedRate,
  moralDamages,
  exemplaryDamages,
  attorneysFees,
  onChange,
}: WizardStepAmountsProps) {
  const [hasStipulated, setHasStipulated] = useState(!!stipulatedRate);
  const [hasAdditionalAwards, setHasAdditionalAwards] = useState(
    !!(moralDamages || exemplaryDamages || attorneysFees)
  );

  function handleStipulatedToggle(enabled: boolean) {
    setHasStipulated(enabled);
    if (!enabled) onChange('stipulatedRate', '');
  }

  function handleAdditionalAwardsToggle(enabled: boolean) {
    setHasAdditionalAwards(enabled);
    if (!enabled) {
      onChange('moralDamages', '');
      onChange('exemplaryDamages', '');
      onChange('attorneysFees', '');
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-heading font-semibold text-primary text-[22px] leading-snug mb-1">
          How much is owed?
        </h2>
        <p className="text-muted text-[13px] font-body mb-6">
          Enter the principal obligation and any contractual or court-awarded amounts.
        </p>
      </div>

      {/* Principal amount */}
      <div className="space-y-2">
        <label className="text-[11px] tracking-[1.5px] uppercase text-muted font-body font-medium select-none block">
          Principal Amount
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-mono text-lg select-none pointer-events-none">
            ₱
          </span>
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={principalAmount}
            onChange={(e) => onChange('principalAmount', e.target.value)}
            className="w-full rounded-lg border border-border px-4 py-3 pl-9 text-xl font-mono text-primary bg-surface placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-150"
          />
        </div>
        <p className="text-[12px] font-body text-muted">
          Enter the base amount in Philippine Pesos (e.g., 500000 for ₱500,000.00).
        </p>
      </div>

      {/* Stipulated rate toggle */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-body font-semibold text-primary text-[14px]">
              Was there a contractual interest rate?
            </p>
            <p className="text-muted text-[12px] font-body mt-0.5">
              A rate agreed upon in writing (e.g., 12% in a promissory note).
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleStipulatedToggle(!hasStipulated)}
            role="switch"
            aria-checked={hasStipulated}
            className={[
              'relative inline-flex h-6 w-11 items-center rounded-full border-2 transition-colors duration-150 shrink-0',
              hasStipulated
                ? 'border-primary bg-primary'
                : 'border-border bg-surface',
            ].join(' ')}
          >
            <span
              className={[
                'inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-150',
                hasStipulated ? 'translate-x-5' : 'translate-x-0.5',
              ].join(' ')}
            />
          </button>
        </div>

        {hasStipulated && (
          <div className="pl-4 border-l border-border mt-3">
            <label className="text-[11px] tracking-[1.5px] uppercase text-muted font-body font-medium select-none block mb-1.5">
              Annual Interest Rate
            </label>
            <div className="relative max-w-[180px]">
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                placeholder="e.g. 12"
                value={stipulatedRate}
                onChange={(e) => onChange('stipulatedRate', e.target.value)}
                className="w-full rounded-md border border-border px-3 py-2 pr-8 text-sm font-mono text-primary bg-surface placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-150"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted font-mono text-sm select-none pointer-events-none">
                %
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Additional awards toggle */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-body font-semibold text-primary text-[14px]">
              Are there additional court awards?
            </p>
            <p className="text-muted text-[12px] font-body mt-0.5">
              Moral damages, exemplary damages, and attorney's fees also earn interest from the judgment date.
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleAdditionalAwardsToggle(!hasAdditionalAwards)}
            role="switch"
            aria-checked={hasAdditionalAwards}
            className={[
              'relative inline-flex h-6 w-11 items-center rounded-full border-2 transition-colors duration-150 shrink-0',
              hasAdditionalAwards
                ? 'border-primary bg-primary'
                : 'border-border bg-surface',
            ].join(' ')}
          >
            <span
              className={[
                'inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-150',
                hasAdditionalAwards ? 'translate-x-5' : 'translate-x-0.5',
              ].join(' ')}
            />
          </button>
        </div>

        {hasAdditionalAwards && (
          <div className="pl-4 border-l border-border mt-3 space-y-4">
            {[
              { field: 'moralDamages', label: 'Moral Damages' },
              { field: 'exemplaryDamages', label: 'Exemplary Damages' },
              { field: 'attorneysFees', label: "Attorney's Fees" },
            ].map(({ field, label }) => (
              <div key={field} className="flex flex-col gap-1.5">
                <label className="text-[11px] tracking-[1.5px] uppercase text-muted font-body font-medium select-none">
                  {label}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted font-mono text-sm select-none pointer-events-none">
                    ₱
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={
                      field === 'moralDamages'
                        ? moralDamages
                        : field === 'exemplaryDamages'
                        ? exemplaryDamages
                        : attorneysFees
                    }
                    onChange={(e) => onChange(field, e.target.value)}
                    className="w-full rounded-md border border-border px-3 py-2 pl-7 text-sm font-mono text-primary bg-surface placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-150"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
