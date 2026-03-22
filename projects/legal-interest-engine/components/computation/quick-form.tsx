'use client';

import React, { useState } from 'react';
import { ComputationInput, ComputationResult, ObligationType, ClaimType } from '@/lib/engine/types';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Button } from '@/components/ui/button';
import { ResultsBreakdown } from './results-breakdown';

interface QuickFormProps {
  defaultMode?: 'quick' | 'wizard';
  onSave?: (result: ComputationResult) => void;
  onSwitchToWizard?: () => void;
  tier?: 'free' | 'consumer' | 'professional';
}

interface FormState {
  obligationType: ObligationType;
  claimType: ClaimType;
  principalAmount: string;
  demandDate: string;
  filingDate: string;
  judgmentDate: string;
  judgmentFinalityDate: string;
  stipulatedRate: string;
  targetDate: string;
  moralDamages: string;
  exemplaryDamages: string;
  attorneysFees: string;
}

const today = new Date().toISOString().split('T')[0];

const initialState: FormState = {
  obligationType: 'loan_forbearance',
  claimType: 'liquidated',
  principalAmount: '',
  demandDate: '',
  filingDate: '',
  judgmentDate: '',
  judgmentFinalityDate: '',
  stipulatedRate: '',
  targetDate: today,
  moralDamages: '',
  exemplaryDamages: '',
  attorneysFees: '',
};

export function QuickForm({ onSave, onSwitchToWizard, tier = 'free' }: QuickFormProps) {
  const [form, setForm] = useState<FormState>(initialState);
  const [result, setResult] = useState<ComputationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [awardsExpanded, setAwardsExpanded] = useState(false);

  function set(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleCompute(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Build payload
    const principalCentavos = Math.round(parseFloat(form.principalAmount || '0') * 100);
    if (!principalCentavos || principalCentavos <= 0) {
      setError('Principal amount is required.');
      return;
    }
    if (!form.demandDate) {
      setError('Demand date is required.');
      return;
    }
    if (!form.filingDate) {
      setError('Filing date is required.');
      return;
    }

    const payload: ComputationInput = {
      obligationType: form.obligationType,
      claimType: form.claimType,
      principalAmount: principalCentavos,
      demandDate: form.demandDate,
      filingDate: form.filingDate,
      targetDate: form.targetDate || today,
    };

    if (form.judgmentDate) payload.judgmentDate = form.judgmentDate;
    if (form.judgmentFinalityDate) payload.judgmentFinalityDate = form.judgmentFinalityDate;
    if (form.stipulatedRate) {
      payload.stipulatedRate = parseFloat(form.stipulatedRate) / 100;
    }

    const moral = Math.round(parseFloat(form.moralDamages || '0') * 100);
    const exemplary = Math.round(parseFloat(form.exemplaryDamages || '0') * 100);
    const attorneys = Math.round(parseFloat(form.attorneysFees || '0') * 100);

    if (moral || exemplary || attorneys) {
      payload.additionalAwards = {};
      if (moral) payload.additionalAwards.moralDamages = moral;
      if (exemplary) payload.additionalAwards.exemplaryDamages = exemplary;
      if (attorneys) payload.additionalAwards.attorneysFees = attorneys;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/compute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Computation failed. Please check your inputs.');
        return;
      }

      const data: ComputationResult = await res.json();
      setResult(data);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[480px_1fr] gap-6 items-start">
      {/* Left panel: form */}
      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-heading font-semibold text-primary text-[16px]">
            Quick Compute
          </h2>
          {onSwitchToWizard && (
            <button
              onClick={onSwitchToWizard}
              className="text-[12px] font-body text-secondary hover:text-primary transition-colors duration-150 underline underline-offset-2"
            >
              Use wizard instead
            </button>
          )}
        </div>

        <form onSubmit={handleCompute} className="px-6 py-5 space-y-5 overflow-y-auto max-h-[calc(100vh-160px)]">
          {/* Obligation type */}
          <Select
            label="Obligation Type"
            value={form.obligationType}
            onChange={(e) => set('obligationType', e.target.value)}
            options={[
              { value: 'loan_forbearance', label: 'Loan / Forbearance of Money' },
              { value: 'non_loan', label: 'Non-Loan (Damages, Labor, etc.)' },
            ]}
          />

          {/* Claim type */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] tracking-[1.5px] uppercase text-muted font-body font-medium select-none">
              Claim Type
            </span>
            <div className="grid grid-cols-2 gap-2">
              {(['liquidated', 'unliquidated'] as ClaimType[]).map((ct) => (
                <button
                  key={ct}
                  type="button"
                  onClick={() => set('claimType', ct)}
                  className={[
                    'px-3 py-2 rounded-md border text-[13px] font-body transition-colors duration-150',
                    form.claimType === ct
                      ? 'bg-primary text-white border-primary'
                      : 'bg-surface text-secondary border-border hover:border-primary/40',
                  ].join(' ')}
                >
                  {ct.charAt(0).toUpperCase() + ct.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Principal amount */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] tracking-[1.5px] uppercase text-muted font-body font-medium select-none">
              Principal Amount
            </span>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted font-mono text-sm select-none pointer-events-none">
                ₱
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.principalAmount}
                onChange={(e) => set('principalAmount', e.target.value)}
                className="w-full rounded-md border border-border px-3 py-2 pl-7 text-sm font-mono text-primary bg-surface placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-150"
              />
            </div>
          </div>

          {/* Dates */}
          <DatePicker
            label="Demand Date"
            value={form.demandDate}
            onChange={(e) => set('demandDate', e.target.value)}
          />

          <DatePicker
            label="Filing Date (Judicial Demand)"
            value={form.filingDate}
            onChange={(e) => set('filingDate', e.target.value)}
          />

          <DatePicker
            label={`Judgment Date${form.claimType === 'unliquidated' ? ' *' : ' (optional)'}`}
            value={form.judgmentDate}
            onChange={(e) => set('judgmentDate', e.target.value)}
          />

          <DatePicker
            label="Judgment Finality Date (optional)"
            value={form.judgmentFinalityDate}
            onChange={(e) => set('judgmentFinalityDate', e.target.value)}
          />

          {/* Stipulated rate */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] tracking-[1.5px] uppercase text-muted font-body font-medium select-none">
              Stipulated Interest Rate (optional)
            </span>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                placeholder="e.g. 12"
                value={form.stipulatedRate}
                onChange={(e) => set('stipulatedRate', e.target.value)}
                className="w-full rounded-md border border-border px-3 py-2 pr-8 text-sm font-mono text-primary bg-surface placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-150"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted font-mono text-sm select-none pointer-events-none">
                %
              </span>
            </div>
          </div>

          {/* Target date */}
          <DatePicker
            label="Compute Interest As Of"
            value={form.targetDate}
            onChange={(e) => set('targetDate', e.target.value)}
          />

          {/* Additional awards (expandable) */}
          <div>
            <button
              type="button"
              onClick={() => setAwardsExpanded(!awardsExpanded)}
              className="flex items-center gap-1.5 text-[12px] font-body text-secondary hover:text-primary transition-colors duration-150 select-none"
            >
              <svg
                className={`w-3.5 h-3.5 transition-transform duration-150 ${awardsExpanded ? 'rotate-90' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
              Additional Awards (optional)
            </button>

            {awardsExpanded && (
              <div className="mt-3 space-y-4 pl-4 border-l border-border">
                {[
                  { field: 'moralDamages' as const, label: 'Moral Damages' },
                  { field: 'exemplaryDamages' as const, label: 'Exemplary Damages' },
                  { field: 'attorneysFees' as const, label: "Attorney's Fees" },
                ].map(({ field, label }) => (
                  <div key={field} className="flex flex-col gap-1.5">
                    <span className="text-[11px] tracking-[1.5px] uppercase text-muted font-body font-medium select-none">
                      {label}
                    </span>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted font-mono text-sm select-none pointer-events-none">
                        ₱
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={form[field]}
                        onChange={(e) => set(field, e.target.value)}
                        className="w-full rounded-md border border-border px-3 py-2 pl-7 text-sm font-mono text-primary bg-surface placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-150"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-500 font-body bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          {/* Submit */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="w-full"
          >
            Compute Interest
          </Button>
        </form>
      </div>

      {/* Right panel: results */}
      <div>
        {result ? (
          <ResultsBreakdown
            result={result}
            tier={tier}
            onSave={onSave ? () => onSave(result) : undefined}
          />
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface/50 py-20 px-8 text-center">
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center mb-4">
              <svg
                className="w-5 h-5 text-secondary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4.992 9.16A7.5 7.5 0 1119.994 9.16M4.992 9.16L3 12m1.992-2.84V4.5M19.994 9.16L22 12m-2.006-2.84V4.5" />
              </svg>
            </div>
            <p className="font-heading text-primary text-[15px] font-semibold mb-1">
              No computation yet
            </p>
            <p className="text-muted text-[13px] font-body leading-relaxed max-w-xs">
              Fill in the form and click Compute Interest to see the breakdown.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
