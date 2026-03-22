'use client';

import React from 'react';
import { ClaimType } from '@/lib/engine/types';
import { DatePicker } from '@/components/ui/date-picker';

interface WizardStepDatesProps {
  claimType: ClaimType;
  demandDate: string;
  filingDate: string;
  judgmentDate: string;
  judgmentFinalityDate: string;
  targetDate: string;
  onChange: (field: string, value: string) => void;
}

const today = new Date().toISOString().split('T')[0];

export function WizardStepDates({
  claimType,
  demandDate,
  filingDate,
  judgmentDate,
  judgmentFinalityDate,
  targetDate,
  onChange,
}: WizardStepDatesProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading font-semibold text-primary text-[22px] leading-snug mb-1">
          When did key events happen?
        </h2>
        <p className="text-muted text-[13px] font-body mb-6">
          Interest periods are determined by these milestone dates. Fill in as many as apply.
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <DatePicker
            label="When was the demand made?"
            value={demandDate}
            onChange={(e) => onChange('demandDate', e.target.value)}
            helperText="The date of extrajudicial demand (written demand letter). This is when interest typically begins."
          />
        </div>

        <div>
          <DatePicker
            label="When was the case filed in court?"
            value={filingDate}
            onChange={(e) => onChange('filingDate', e.target.value)}
            helperText="The date the complaint was filed. If earlier than demand, interest may run from filing."
          />
        </div>

        <div>
          <DatePicker
            label={
              claimType === 'unliquidated'
                ? 'When did the court issue its decision? *'
                : 'When did the court issue its decision? (optional)'
            }
            value={judgmentDate}
            onChange={(e) => onChange('judgmentDate', e.target.value)}
            helperText={
              claimType === 'unliquidated'
                ? 'Required for unliquidated claims — interest runs at 6% from filing to judgment, then 6% post-finality.'
                : 'Needed to compute post-finality interest if the judgment has become final.'
            }
          />
        </div>

        <div>
          <DatePicker
            label="When did the decision become final? (optional)"
            value={judgmentFinalityDate}
            onChange={(e) => onChange('judgmentFinalityDate', e.target.value)}
            helperText="The date the judgment became executory (15 days after entry, unless appealed). Post-finality interest runs from here."
          />
        </div>

        <div className="border-t border-border pt-5">
          <DatePicker
            label="Compute interest as of:"
            value={targetDate || today}
            onChange={(e) => onChange('targetDate', e.target.value)}
            helperText="The end date for this computation. Defaults to today."
          />
        </div>
      </div>
    </div>
  );
}
