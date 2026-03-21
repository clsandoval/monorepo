// WizardForm: Flat form (all steps stacked). Used in "Input" tab of ComputationDetailPage.
// Uses the same step sub-components as AccordionWizard.
import type { WizardFormData } from '@/types/wizard';
import { computeActiveSteps } from '@/lib/wizard-routing';
import { WS00ModeSelection } from '@/components/wizard/WS00ModeSelection';
import { WS01TaxpayerProfile } from '@/components/wizard/WS01TaxpayerProfile';
import { WS02BusinessType } from '@/components/wizard/WS02BusinessType';
import { WS03TaxYear } from '@/components/wizard/WS03TaxYear';
import { WS04GrossReceipts } from '@/components/wizard/WS04GrossReceipts';
import { WS05Compensation } from '@/components/wizard/WS05Compensation';
import { WS06ExpenseMethod } from '@/components/wizard/WS06ExpenseMethod';
import { WS07AItemizedExpenses } from '@/components/wizard/WS07AItemizedExpenses';
import { WS07BFinancialItems } from '@/components/wizard/WS07BFinancialItems';
import { WS07CDepreciation } from '@/components/wizard/WS07CDepreciation';
import { WS07DNolco } from '@/components/wizard/WS07DNolco';
import { WS08CwtForm2307 } from '@/components/wizard/WS08CwtForm2307';
import { WS09PriorQuarterly } from '@/components/wizard/WS09PriorQuarterly';
import { WS10Registration } from '@/components/wizard/WS10Registration';
import { WS11RegimeElection } from '@/components/wizard/WS11RegimeElection';
import { WS12FilingDetails } from '@/components/wizard/WS12FilingDetails';
import { WS13PriorYearCredits } from '@/components/wizard/WS13PriorYearCredits';
import type { WizardStepId } from '@/types/wizard';

const STEP_MAP: Record<WizardStepId, React.ComponentType<{
  data: Partial<WizardFormData>;
  onChange: (u: Partial<WizardFormData>) => void;
  onNext?: () => void;
  onBack?: () => void;
}>> = {
  WS00: WS00ModeSelection,
  WS01: WS01TaxpayerProfile,
  WS02: WS02BusinessType,
  WS03: WS03TaxYear,
  WS04: WS04GrossReceipts,
  WS05: WS05Compensation,
  WS06: WS06ExpenseMethod,
  WS07A: WS07AItemizedExpenses,
  WS07B: WS07BFinancialItems,
  WS07C: WS07CDepreciation,
  WS07D: WS07DNolco,
  WS08: WS08CwtForm2307,
  WS09: WS09PriorQuarterly,
  WS10: WS10Registration,
  WS11: WS11RegimeElection,
  WS12: WS12FilingDetails,
  WS13: WS13PriorYearCredits,
  REVIEW: () => null,
};

interface WizardFormProps {
  data: Partial<WizardFormData>;
  onChange?: (updates: Partial<WizardFormData>) => void;
  onSubmit?: () => void;
}

export function WizardForm({ data, onChange }: WizardFormProps) {
  const activeSteps = computeActiveSteps(data as WizardFormData).filter((s) => s !== 'REVIEW');
  const noop = () => {};

  return (
    <div className="space-y-8">
      {activeSteps.map((stepId) => {
        const StepComponent = STEP_MAP[stepId];
        if (!StepComponent) return null;
        return (
          <div key={stepId} className="border rounded-lg p-4">
            <StepComponent data={data} onChange={onChange ?? noop} />
          </div>
        );
      })}
    </div>
  );
}

export default WizardForm;
