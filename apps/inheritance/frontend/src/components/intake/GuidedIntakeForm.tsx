/**
 * GuidedIntakeForm — 4-step guided intake form container (§4.18)
 *
 * Multi-step guided interview that pre-populates the case wizard.
 *
 * Steps: Decedent Info → Family Composition → Asset Summary → Review & Save
 *
 * The conflict-check, client-details and settlement-track steps were removed
 * under CUT-01: all three collected facts outside (date of death, family graph,
 * asset schedule) and so had no bearing on the schedule of shares or Form 1801.
 */

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { INTAKE_STEPS, INTAKE_STEP_COUNT, type IntakeFormState } from '@/types/intake';
import { createInitialIntakeState, isStepComplete } from '@/lib/intake';
import { DecedentInfoStep } from './DecedentInfoStep';
import { FamilyCompositionStep } from './FamilyCompositionStep';
import { AssetSummaryStep } from './AssetSummaryStep';
import { IntakeReviewStep } from './IntakeReviewStep';
import { toast } from 'sonner';

const INTAKE_STORAGE_KEY = 'inheritance-intake-draft';

export interface GuidedIntakeFormProps {
  orgId: string;
  userId: string;
  onComplete: (caseId: string, clientId: string) => void;
  onCancel: () => void;
}

export function GuidedIntakeForm({
  orgId,
  userId,
  onComplete,
  onCancel,
}: GuidedIntakeFormProps) {
  const [state, setState] = useState<IntakeFormState>(() => {
    try {
      const saved = localStorage.getItem(INTAKE_STORAGE_KEY);
      if (saved) return JSON.parse(saved) as IntakeFormState;
    } catch { /* ignore parse errors */ }
    return createInitialIntakeState();
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Save to localStorage on every state change
  useEffect(() => {
    try {
      localStorage.setItem(INTAKE_STORAGE_KEY, JSON.stringify(state));
    } catch { /* ignore quota errors */ }
  }, [state]);

  const currentStep = state.currentStep;

  const goNext = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, INTAKE_STEP_COUNT - 1),
    }));
  }, []);

  const goBack = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 0),
    }));
  }, []);

  const handleCreateCase = useCallback(async () => {
    setIsSubmitting(true);
    try {
      const { mapIntakeToEngineInput } = await import('@/lib/intake');
      const { createCase } = await import('@/lib/cases');

      // Build EngineInput from intake state
      const engineInput = mapIntakeToEngineInput(state);

      // Create case using existing createCase function (uses correct DB columns)
      const { id: caseId } = await createCase(userId, orgId, engineInput, null);

      // Clear saved draft on success
      localStorage.removeItem(INTAKE_STORAGE_KEY);
      onComplete(caseId, '');
    } catch (err) {
      console.error('Intake form submission error:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to create case. Please try again.');
      setIsSubmitting(false);
    }
  }, [state, orgId, userId, onComplete]);

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <DecedentInfoStep
            state={state.decedentInfo}
            onStateChange={(decedentInfo) =>
              setState((prev) => ({ ...prev, decedentInfo }))
            }
            onNext={goNext}
            onBack={goBack}
          />
        );
      case 1:
        return (
          <FamilyCompositionStep
            state={state.familyComposition}
            onStateChange={(familyComposition) =>
              setState((prev) => ({ ...prev, familyComposition }))
            }
            onNext={goNext}
            onBack={goBack}
          />
        );
      case 2:
        return (
          <AssetSummaryStep
            state={state.assetSummary}
            onStateChange={(assetSummary) =>
              setState((prev) => ({ ...prev, assetSummary }))
            }
            onNext={goNext}
            onBack={goBack}
          />
        );
      case 3:
        return (
          <IntakeReviewStep
            state={state}
            onCreateCase={handleCreateCase}
            onBack={goBack}
            isSubmitting={isSubmitting}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div data-testid="guided-intake-form" className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">New Estate Case — Guided Intake</h1>
        <p className="text-sm text-muted-foreground">
          Step {currentStep + 1} of {INTAKE_STEP_COUNT}
        </p>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center gap-1">
        {INTAKE_STEPS.map((stepName, i) => (
          <div key={stepName} className="flex items-center gap-1">
            <button
              type="button"
              className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition-colors ${
                i === currentStep
                  ? 'bg-primary text-primary-foreground'
                  : i < currentStep && isStepComplete(state, i)
                    ? 'bg-green-100 text-green-800'
                    : 'bg-muted text-muted-foreground'
              }`}
              onClick={() => {
                if (i <= currentStep) {
                  setState((prev) => ({ ...prev, currentStep: i }));
                }
              }}
              disabled={i > currentStep}
            >
              {i < currentStep && isStepComplete(state, i) ? '✓' : i + 1}
              <span className="hidden sm:inline">{stepName}</span>
            </button>
            {i < INTAKE_STEP_COUNT - 1 && (
              <div
                className={`h-0.5 w-4 ${
                  i < currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Cancel / actions bar */}
      <div className="flex justify-end gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            localStorage.removeItem(INTAKE_STORAGE_KEY);
            setState(createInitialIntakeState());
          }}
        >
          Clear Draft
        </Button>
        <Button variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>

      {/* Current step */}
      {renderStep()}
    </div>
  );
}
