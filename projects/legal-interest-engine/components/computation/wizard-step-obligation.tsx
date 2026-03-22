'use client';

import React from 'react';
import { ObligationType, ClaimType } from '@/lib/engine/types';

interface WizardStepObligationProps {
  obligationType: ObligationType;
  claimType: ClaimType;
  onObligationTypeChange: (v: ObligationType) => void;
  onClaimTypeChange: (v: ClaimType) => void;
}

const OBLIGATION_OPTIONS: Array<{
  value: ObligationType;
  title: string;
  description: string;
}> = [
  {
    value: 'loan_forbearance',
    title: 'Loan or Credit Obligation',
    description:
      'Money lent, credit extended, or any forbearance of money. Typical in promissory notes, credit agreements, and bank loans.',
  },
  {
    value: 'non_loan',
    title: 'Other Obligation (Damages, Labor, etc.)',
    description:
      'Court-awarded damages, unpaid wages, civil liability, breach of contract, or any obligation not arising from a loan or credit.',
  },
];

const CLAIM_OPTIONS: Array<{
  value: ClaimType;
  title: string;
  description: string;
}> = [
  {
    value: 'liquidated',
    title: 'Yes — the amount is certain',
    description:
      'The exact peso amount is already fixed (e.g., unpaid loan balance, invoice amount). No court determination needed.',
  },
  {
    value: 'unliquidated',
    title: 'No — the amount must be determined by the court',
    description:
      'Damages are estimated and must be assessed by the court (e.g., moral damages, loss of income). The judgment date matters for interest.',
  },
];

export function WizardStepObligation({
  obligationType,
  claimType,
  onObligationTypeChange,
  onClaimTypeChange,
}: WizardStepObligationProps) {
  return (
    <div className="space-y-8">
      {/* Obligation type */}
      <div>
        <h2 className="font-heading font-semibold text-primary text-[22px] leading-snug mb-1">
          What type of obligation is this?
        </h2>
        <p className="text-muted text-[13px] font-body mb-4">
          This determines which Bangko Sentral ng Pilipinas or Supreme Court rate applies.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {OBLIGATION_OPTIONS.map(({ value, title, description }) => (
            <button
              key={value}
              type="button"
              onClick={() => onObligationTypeChange(value)}
              className={[
                'text-left px-5 py-4 rounded-lg border-2 transition-all duration-150',
                obligationType === value
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-surface hover:border-primary/40 hover:bg-primary/[0.02]',
              ].join(' ')}
            >
              <div className="flex items-start gap-3">
                <div
                  className={[
                    'mt-0.5 w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors duration-150',
                    obligationType === value
                      ? 'border-primary bg-primary'
                      : 'border-border bg-surface',
                  ].join(' ')}
                  aria-hidden="true"
                >
                  {obligationType === value && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </div>
                <div>
                  <p className="font-body font-semibold text-primary text-[14px] leading-snug">
                    {title}
                  </p>
                  <p className="text-muted text-[12px] font-body mt-1 leading-relaxed">
                    {description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Claim type */}
      <div>
        <h3 className="font-heading font-semibold text-primary text-[17px] mb-1">
          Is the amount certain?
        </h3>
        <p className="text-muted text-[13px] font-body mb-4">
          This affects when interest starts running and which rate applies.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CLAIM_OPTIONS.map(({ value, title, description }) => (
            <button
              key={value}
              type="button"
              onClick={() => onClaimTypeChange(value)}
              className={[
                'text-left px-5 py-4 rounded-lg border-2 transition-all duration-150',
                claimType === value
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-surface hover:border-primary/40 hover:bg-primary/[0.02]',
              ].join(' ')}
            >
              <div className="flex items-start gap-3">
                <div
                  className={[
                    'mt-0.5 w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors duration-150',
                    claimType === value
                      ? 'border-primary bg-primary'
                      : 'border-border bg-surface',
                  ].join(' ')}
                  aria-hidden="true"
                >
                  {claimType === value && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </div>
                <div>
                  <p className="font-body font-semibold text-primary text-[14px] leading-snug">
                    {title}
                  </p>
                  <p className="text-muted text-[12px] font-body mt-1 leading-relaxed">
                    {description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
