'use client';

import React from 'react';
import { format, parseISO } from 'date-fns';
import { ObligationType, ClaimType } from '@/lib/engine/types';
import { Button } from '@/components/ui/button';

interface WizardData {
  obligationType: ObligationType;
  claimType: ClaimType;
  principalAmount: string;
  stipulatedRate: string;
  demandDate: string;
  filingDate: string;
  judgmentDate: string;
  judgmentFinalityDate: string;
  targetDate: string;
  moralDamages: string;
  exemplaryDamages: string;
  attorneysFees: string;
}

interface WizardStepReviewProps {
  data: WizardData;
  loading?: boolean;
  error?: string | null;
  onEdit: (step: number) => void;
  onCompute: () => void;
}

function formatDateSafe(dateStr: string): string {
  if (!dateStr) return '—';
  try {
    return format(parseISO(dateStr), 'MMMM d, yyyy');
  } catch {
    return dateStr;
  }
}

function formatPesoParsed(val: string): string {
  const n = parseFloat(val || '0');
  if (!n) return '—';
  return `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

interface ReviewRowProps {
  label: string;
  value: string;
  mono?: boolean;
}

function ReviewRow({ label, value, mono = false }: ReviewRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-border last:border-0">
      <span className="text-[12px] font-body text-muted uppercase tracking-[0.8px] shrink-0">
        {label}
      </span>
      <span className={`text-[14px] text-primary text-right ${mono ? 'font-mono' : 'font-body'}`}>
        {value}
      </span>
    </div>
  );
}

interface ReviewSectionProps {
  title: string;
  step: number;
  onEdit: (step: number) => void;
  children: React.ReactNode;
}

function ReviewSection({ title, step, onEdit, children }: ReviewSectionProps) {
  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-background">
        <h3 className="font-heading font-semibold text-primary text-[14px]">{title}</h3>
        <button
          type="button"
          onClick={() => onEdit(step)}
          className="text-[12px] font-body text-secondary hover:text-primary transition-colors duration-150 underline underline-offset-2"
        >
          Edit
        </button>
      </div>
      <div className="px-5">{children}</div>
    </div>
  );
}

export function WizardStepReview({
  data,
  loading = false,
  error,
  onEdit,
  onCompute,
}: WizardStepReviewProps) {
  const hasAdditionalAwards = !!(
    data.moralDamages || data.exemplaryDamages || data.attorneysFees
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading font-semibold text-primary text-[22px] leading-snug mb-1">
          Review your inputs
        </h2>
        <p className="text-muted text-[13px] font-body mb-4">
          Confirm everything looks correct before computing.
        </p>
      </div>

      <div className="space-y-4">
        {/* Step 1: Obligation */}
        <ReviewSection title="Obligation Type" step={1} onEdit={onEdit}>
          <ReviewRow
            label="Type"
            value={
              data.obligationType === 'loan_forbearance'
                ? 'Loan / Forbearance of Money'
                : 'Non-Loan (Damages, Labor, etc.)'
            }
          />
          <ReviewRow
            label="Claim"
            value={
              data.claimType === 'liquidated'
                ? 'Liquidated (amount certain)'
                : 'Unliquidated (amount determined by court)'
            }
          />
        </ReviewSection>

        {/* Step 2: Dates */}
        <ReviewSection title="Key Dates" step={2} onEdit={onEdit}>
          <ReviewRow label="Demand Date" value={formatDateSafe(data.demandDate)} mono />
          <ReviewRow label="Filing Date" value={formatDateSafe(data.filingDate)} mono />
          <ReviewRow label="Judgment Date" value={formatDateSafe(data.judgmentDate)} mono />
          <ReviewRow label="Judgment Finality" value={formatDateSafe(data.judgmentFinalityDate)} mono />
          <ReviewRow label="Compute As Of" value={formatDateSafe(data.targetDate)} mono />
        </ReviewSection>

        {/* Step 3: Amounts */}
        <ReviewSection title="Amounts" step={3} onEdit={onEdit}>
          <ReviewRow label="Principal" value={formatPesoParsed(data.principalAmount)} mono />
          <ReviewRow
            label="Stipulated Rate"
            value={data.stipulatedRate ? `${data.stipulatedRate}% p.a.` : 'None (statutory rate applies)'}
            mono={!!data.stipulatedRate}
          />
          {hasAdditionalAwards && (
            <>
              {data.moralDamages && (
                <ReviewRow label="Moral Damages" value={formatPesoParsed(data.moralDamages)} mono />
              )}
              {data.exemplaryDamages && (
                <ReviewRow label="Exemplary Damages" value={formatPesoParsed(data.exemplaryDamages)} mono />
              )}
              {data.attorneysFees && (
                <ReviewRow label="Attorney's Fees" value={formatPesoParsed(data.attorneysFees)} mono />
              )}
            </>
          )}
        </ReviewSection>
      </div>

      {error && (
        <p className="text-sm text-red-500 font-body bg-red-50 border border-red-200 rounded-md px-4 py-3">
          {error}
        </p>
      )}

      <Button
        type="button"
        variant="primary"
        size="lg"
        loading={loading}
        onClick={onCompute}
        className="w-full"
      >
        Compute Interest
      </Button>
    </div>
  );
}
