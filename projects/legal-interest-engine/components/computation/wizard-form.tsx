'use client';

import React, { useState } from 'react';
import { ComputationInput, ComputationResult, ObligationType, ClaimType } from '@/lib/engine/types';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { WizardStepObligation } from './wizard-step-obligation';
import { WizardStepDates } from './wizard-step-dates';
import { WizardStepAmounts } from './wizard-step-amounts';
import { WizardStepReview } from './wizard-step-review';
import { ResultsBreakdown } from './results-breakdown';

const today = new Date().toISOString().split('T')[0];

interface WizardFormProps {
  onSave?: (result: ComputationResult) => void;
  onSwitchToQuick?: () => void;
  tier?: 'free' | 'consumer' | 'professional';
}

interface WizardState {
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

const STEPS = [
  { label: 'Obligation' },
  { label: 'Dates' },
  { label: 'Amounts' },
  { label: 'Review' },
];

const initialState: WizardState = {
  obligationType: 'loan_forbearance',
  claimType: 'liquidated',
  principalAmount: '',
  stipulatedRate: '',
  demandDate: '',
  filingDate: '',
  judgmentDate: '',
  judgmentFinalityDate: '',
  targetDate: today,
  moralDamages: '',
  exemplaryDamages: '',
  attorneysFees: '',
};

export function WizardForm({ onSave, onSwitchToQuick, tier = 'free' }: WizardFormProps) {
  const [step, setStep] = useState(0); // 0-indexed
  const [data, setData] = useState<WizardState>(initialState);
  const [result, setResult] = useState<ComputationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update(field: string, value: string) {
    setData((prev) => ({ ...prev, [field]: value }));
  }

  function goToStep(s: number) {
    setStep(Math.max(0, Math.min(STEPS.length - 1, s)));
  }

  function handleNext() {
    if (step < STEPS.length - 1) setStep(step + 1);
  }

  function handleBack() {
    if (step > 0) setStep(step - 1);
  }

  async function handleCompute() {
    setError(null);

    const principalCentavos = Math.round(parseFloat(data.principalAmount || '0') * 100);
    if (!principalCentavos || principalCentavos <= 0) {
      setError('Principal amount is required.');
      setStep(2); // go to amounts step
      return;
    }
    if (!data.demandDate) {
      setError('Demand date is required.');
      setStep(1);
      return;
    }
    if (!data.filingDate) {
      setError('Filing date is required.');
      setStep(1);
      return;
    }

    const payload: ComputationInput = {
      obligationType: data.obligationType,
      claimType: data.claimType,
      principalAmount: principalCentavos,
      demandDate: data.demandDate,
      filingDate: data.filingDate,
      targetDate: data.targetDate || today,
    };

    if (data.judgmentDate) payload.judgmentDate = data.judgmentDate;
    if (data.judgmentFinalityDate) payload.judgmentFinalityDate = data.judgmentFinalityDate;
    if (data.stipulatedRate) {
      payload.stipulatedRate = parseFloat(data.stipulatedRate) / 100;
    }

    const moral = Math.round(parseFloat(data.moralDamages || '0') * 100);
    const exemplary = Math.round(parseFloat(data.exemplaryDamages || '0') * 100);
    const attorneys = Math.round(parseFloat(data.attorneysFees || '0') * 100);

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
        const responseData = await res.json();
        setError(responseData.error || 'Computation failed. Please check your inputs.');
        return;
      }

      const computedResult: ComputationResult = await res.json();
      setResult(computedResult);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // Show results if we have them
  if (result) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-heading font-semibold text-primary text-[20px]">
            Computation Results
          </h2>
          <button
            onClick={() => { setResult(null); setStep(0); }}
            className="text-[13px] font-body text-secondary hover:text-primary transition-colors duration-150 underline underline-offset-2"
          >
            ← New computation
          </button>
        </div>
        <ResultsBreakdown
          result={result}
          tier={tier}
          onSave={onSave ? () => onSave(result) : undefined}
        />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-semibold text-primary text-[20px]">
          Interest Calculator
        </h2>
        {onSwitchToQuick && (
          <button
            onClick={onSwitchToQuick}
            className="text-[12px] font-body text-secondary hover:text-primary transition-colors duration-150 underline underline-offset-2"
          >
            Switch to quick mode
          </button>
        )}
      </div>

      {/* Progress */}
      <Progress steps={STEPS} currentStep={step} />

      {/* Step content */}
      <div className="bg-surface border border-border rounded-lg px-6 py-6">
        {step === 0 && (
          <WizardStepObligation
            obligationType={data.obligationType}
            claimType={data.claimType}
            onObligationTypeChange={(v) => update('obligationType', v)}
            onClaimTypeChange={(v) => update('claimType', v)}
          />
        )}
        {step === 1 && (
          <WizardStepDates
            claimType={data.claimType}
            demandDate={data.demandDate}
            filingDate={data.filingDate}
            judgmentDate={data.judgmentDate}
            judgmentFinalityDate={data.judgmentFinalityDate}
            targetDate={data.targetDate}
            onChange={update}
          />
        )}
        {step === 2 && (
          <WizardStepAmounts
            principalAmount={data.principalAmount}
            stipulatedRate={data.stipulatedRate}
            moralDamages={data.moralDamages}
            exemplaryDamages={data.exemplaryDamages}
            attorneysFees={data.attorneysFees}
            onChange={update}
          />
        )}
        {step === 3 && (
          <WizardStepReview
            data={data}
            loading={loading}
            error={error}
            onEdit={goToStep}
            onCompute={handleCompute}
          />
        )}
      </div>

      {/* Navigation (not shown on review step — review has its own compute button) */}
      {step < 3 && (
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={handleBack}
            disabled={step === 0}
          >
            ← Back
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleNext}
          >
            {step === STEPS.length - 2 ? 'Review →' : 'Next →'}
          </Button>
        </div>
      )}

      {/* Back button on review step */}
      {step === 3 && (
        <div>
          <Button type="button" variant="ghost" onClick={handleBack}>
            ← Back
          </Button>
        </div>
      )}
    </div>
  );
}
