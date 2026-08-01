import React, { useState, useMemo, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { Check } from 'lucide-react';
import type { EngineInput } from '../../types';
import { EstateStep } from './EstateStep';
import { DecedentStep } from './DecedentStep';
import { FamilyTreeStep } from './FamilyTreeStep';
import { WillStep } from './WillStep';
import { DonationsStep } from './DonationsStep';
import { ReviewStep } from './ReviewStep';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface WizardMeta {
  hasWill: boolean;
}

export const WIZARD_STEPS = [
  { key: 'estate', label: 'Estate Details' },
  { key: 'decedent', label: 'Decedent Details' },
  { key: 'family-tree', label: 'Family Tree' },
  { key: 'will', label: 'Will & Dispositions', conditional: true },
  { key: 'donations', label: 'Donations' },
  { key: 'review', label: 'Review & Config' },
] as const;

export const MARRIAGE_DEFAULTS = {
  date_of_marriage: null as string | null,
  years_of_cohabitation: 0,
  has_legal_separation: false,
  marriage_solemnized_in_articulo_mortis: false,
  was_ill_at_marriage: false,
  illness_caused_death: false,
};

export const ARTICULO_MORTIS_DEFAULTS = {
  was_ill_at_marriage: false,
  illness_caused_death: false,
};

export const ILLNESS_DEFAULTS = {
  illness_caused_death: false,
};

const DEFAULT_ENGINE_INPUT: EngineInput = {
  net_distributable_estate: { centavos: 0 },
  decedent: {
    id: 'd',
    name: '',
    date_of_death: '',
    is_married: false,
    date_of_marriage: null,
    marriage_solemnized_in_articulo_mortis: false,
    was_ill_at_marriage: false,
    illness_caused_death: false,
    years_of_cohabitation: 0,
    has_legal_separation: false,
    is_illegitimate: false,
  },
  family_tree: [],
  will: null,
  donations: [],
  config: {
    max_pipeline_restarts: 10,
    retroactive_ra_11642: false,
  },
};

/**
 * Read the wizard's starting position out of the URL, once, at mount.
 *
 * This seam exists so a journey gate can land directly on a step without clicking
 * through every step before it — a real browser cannot reach into a component tree,
 * it can only set a URL. It is deliberately additive: with no `step` or `hasWill`
 * search param present the result is `{ stepIndex: 0, hasWill: false }`, which is
 * byte-identical to the previous defaults, so every committed test is unaffected.
 *
 * Every value is clamped. An out-of-range index would make
 * `visibleSteps[currentStepIndex]` `undefined` and render a blank card, which a
 * screenshot gate could then approve as a reference.
 */
function readInitialWizardState(): { stepIndex: number; hasWill: boolean } {
  if (typeof window === 'undefined') return { stepIndex: 0, hasWill: false };

  const params = new URLSearchParams(window.location.search);
  const hasWill = params.get('hasWill') === '1';

  // Exactly one WIZARD_STEPS entry carries `conditional: true`, so the last visible
  // index is length-1 with a will and length-2 without one.
  const lastIndex = hasWill ? WIZARD_STEPS.length - 1 : WIZARD_STEPS.length - 2;

  const raw = params.get('step');
  const parsed = raw === null ? Number.NaN : Number.parseInt(raw, 10);
  const stepIndex =
    Number.isInteger(parsed) && parsed >= 0 && parsed <= lastIndex ? parsed : 0;

  return { stepIndex, hasWill };
}

export interface WizardContainerProps {
  onSubmit?: (data: EngineInput) => void;
  onChange?: (input: EngineInput) => void;
  defaultValues?: Partial<EngineInput>;
}

export function WizardContainer({ onSubmit, onChange, defaultValues }: WizardContainerProps) {
  const initial = readInitialWizardState();
  const [currentStepIndex, setCurrentStepIndex] = useState(initial.stepIndex);
  const [hasWill, setHasWill] = useState(initial.hasWill);

  const methods = useForm<EngineInput>({
    defaultValues: { ...DEFAULT_ENGINE_INPUT, ...defaultValues },
  });

  // This subscription is the ONLY path by which succession-wizard state reaches the database before
  // Compute is pressed. Without it `useAutoSave` observes nothing but the value the route loaded, and
  // twenty minutes of a nine-heir family tree dies on a refresh.
  //
  // `watch(callback)` in react-hook-form 7 fires on change and NOT at mount, so attaching it does not
  // resurrect the redundant load-time write-back that plan 19-02 removed.
  //
  // The prop is optional because every committed wizard test and every registered journey step renders
  // this component without one; with no `onChange` no subscription is created at all.
  useEffect(() => {
    if (!onChange) return;
    const subscription = methods.watch((value) => onChange(value as EngineInput));
    return () => subscription.unsubscribe();
  }, [methods, onChange]);

  // Visible steps: filter out conditional Will step when hasWill=false
  const visibleSteps = useMemo(
    () =>
      WIZARD_STEPS.filter(
        (step) => !('conditional' in step && step.conditional) || hasWill,
      ),
    [hasWill],
  );

  const currentStep = visibleSteps[currentStepIndex];

  const handleNext = () => {
    if (currentStepIndex < visibleSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleHasWillChange = (value: boolean) => {
    setHasWill(value);
  };

  const renderStep = () => {
    if (!currentStep) return null;

    switch (currentStep.key) {
      case 'estate':
        return (
          <EstateStep
            control={methods.control}
            setValue={methods.setValue}
            watch={methods.watch}
            hasWill={hasWill}
            onHasWillChange={handleHasWillChange}
            errors={methods.formState.errors as Record<string, { message?: string }>}
          />
        );
      case 'decedent':
        return (
          <DecedentStep
            control={methods.control}
            setValue={methods.setValue}
            watch={methods.watch}
            errors={methods.formState.errors as Record<string, { message?: string }>}
          />
        );
      case 'family-tree':
        return (
          <FamilyTreeStep
            control={methods.control}
            setValue={methods.setValue}
            watch={methods.watch}
            errors={methods.formState.errors as Record<string, { message?: string }>}
          />
        );
      case 'will':
        return (
          <WillStep
            control={methods.control}
            setValue={methods.setValue}
            watch={methods.watch}
            errors={methods.formState.errors as Record<string, { message?: string }>}
            persons={(methods.watch('family_tree') ?? []) as any}
          />
        );
      case 'donations':
        return (
          <DonationsStep
            control={methods.control}
            setValue={methods.setValue}
            watch={methods.watch}
            errors={methods.formState.errors as Record<string, { message?: string }>}
            persons={(methods.watch('family_tree') ?? []) as any}
          />
        );
      case 'review':
        return (
          <ReviewStep
            control={methods.control}
            setValue={methods.setValue}
            watch={methods.watch}
            errors={methods.formState.errors as Record<string, { message?: string }>}
            hasWill={hasWill}
            persons={(methods.watch('family_tree') ?? []) as any}
            onSubmit={methods.handleSubmit((data) => onSubmit?.(data))}
          />
        );
      default:
        return null;
    }
  };

  return (
    <FormProvider {...methods}>
      <div data-testid="wizard-container" className="max-w-2xl mx-auto">
        {/* Mobile progress bar */}
        <div className="sm:hidden mb-6">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Step {currentStepIndex + 1} of {visibleSteps.length}</span>
            <span>{currentStep?.label}</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-300"
              style={{ width: `${((currentStepIndex + 1) / visibleSteps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step indicators */}
        <nav className="hidden sm:flex items-center gap-1 mb-8 overflow-x-auto pb-2">
          {visibleSteps.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            return (
              <React.Fragment key={step.key}>
                {idx > 0 && (
                  <div
                    className={cn(
                      'hidden sm:block h-px flex-1 min-w-4 max-w-12',
                      isCompleted ? 'bg-accent' : 'bg-border',
                    )}
                  />
                )}
                <div
                  data-testid={`step-indicator-${step.key}`}
                  className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm whitespace-nowrap transition-colors',
                    isCurrent && 'bg-accent text-accent-foreground font-medium',
                    isCompleted && 'text-primary font-medium',
                    !isCurrent && !isCompleted && 'text-muted-foreground',
                  )}
                >
                  <span
                    className={cn(
                      'flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold shrink-0',
                      isCurrent && 'bg-primary text-primary-foreground',
                      isCompleted && 'bg-primary text-primary-foreground',
                      !isCurrent && !isCompleted && 'bg-muted text-muted-foreground',
                    )}
                  >
                    {isCompleted ? <Check className="h-3.5 w-3.5" /> : idx + 1}
                  </span>
                  <span className="hidden sm:inline">{step.label}</span>
                </div>
              </React.Fragment>
            );
          })}
        </nav>

        {/* Current step content */}
        <Card key={currentStep?.key}>
          <CardContent className="pt-6 animate-in fade-in slide-in-from-right-2 duration-200">
            {renderStep()}
          </CardContent>
        </Card>

        {/* Navigation buttons */}
        <div className="flex justify-between mt-6">
          {currentStepIndex > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
            >
              Back
            </Button>
          )}
          <div className="ml-auto">
            {currentStepIndex < visibleSteps.length - 1 && (
              <Button
                type="button"
                onClick={handleNext}
              >
                Next
              </Button>
            )}
          </div>
        </div>
      </div>
    </FormProvider>
  );
}
