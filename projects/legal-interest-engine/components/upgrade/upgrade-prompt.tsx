'use client';

import React from 'react';
import { Dialog, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface UpgradePromptProps {
  open: boolean;
  reason: string;
  onUpgrade: () => void;
  onClose: () => void;
}

interface PlanFeature {
  label: string;
  free: boolean | string;
  consumer: boolean | string;
  professional: boolean | string;
}

const FEATURES: PlanFeature[] = [
  {
    label: 'Interest computations',
    free: '3 per month',
    consumer: 'Unlimited',
    professional: 'Unlimited',
  },
  {
    label: 'Computation history',
    free: false,
    consumer: true,
    professional: true,
  },
  {
    label: 'Worksheet PDF',
    free: false,
    consumer: true,
    professional: true,
  },
  {
    label: 'Summary memo',
    free: false,
    consumer: true,
    professional: true,
  },
  {
    label: 'Demand letter',
    free: false,
    consumer: false,
    professional: true,
  },
  {
    label: 'Court filing document',
    free: false,
    consumer: false,
    professional: true,
  },
  {
    label: 'Save & share cases',
    free: false,
    consumer: true,
    professional: true,
  },
];

function FeatureCell({ value }: { value: boolean | string }) {
  if (value === false) {
    return (
      <span className="text-muted" aria-label="Not included">
        <svg className="w-4 h-4 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </span>
    );
  }
  if (value === true) {
    return (
      <span className="text-primary" aria-label="Included">
        <svg className="w-4 h-4 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </span>
    );
  }
  return (
    <span className="text-[12px] font-body text-secondary text-center block">
      {value}
    </span>
  );
}

export function UpgradePrompt({ open, reason, onUpgrade, onClose }: UpgradePromptProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Unlock more features"
      className="max-w-lg"
    >
      <div className="space-y-5">
        {/* Reason */}
        <p className="text-[14px] font-body text-secondary leading-relaxed">
          {reason}
        </p>

        {/* Plan comparison table */}
        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-[12px] font-body border-collapse">
            <thead>
              <tr>
                <th className="text-left pb-2 text-muted font-medium w-[45%]" />
                <th className="text-center pb-2 text-muted font-medium px-2">Free</th>
                <th className="text-center pb-2 text-secondary font-semibold px-2">Consumer</th>
                <th className="text-center pb-2 text-primary font-semibold px-2">
                  <span className="inline-block bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[11px]">
                    Professional
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {FEATURES.map((feature, i) => (
                <tr
                  key={i}
                  className={i % 2 === 0 ? 'bg-background' : 'bg-surface'}
                >
                  <td className="py-2 px-2 text-secondary">{feature.label}</td>
                  <td className="py-2 px-2 text-center">
                    <FeatureCell value={feature.free} />
                  </td>
                  <td className="py-2 px-2 text-center">
                    <FeatureCell value={feature.consumer} />
                  </td>
                  <td className="py-2 px-2 text-center">
                    <FeatureCell value={feature.professional} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-[12px] font-body text-muted">
          Upgrade anytime. Cancel anytime. No contracts.
        </p>
      </div>

      <DialogFooter>
        <Button variant="ghost" onClick={onClose}>
          Not now
        </Button>
        <Button variant="primary" onClick={onUpgrade}>
          View plans
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
