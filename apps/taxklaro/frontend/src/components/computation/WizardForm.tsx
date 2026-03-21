// WizardForm: Edit-mode accordion wrapper around AccordionWizard.
// In edit mode, all sections start open/accessible (not pending).
// Used in the Input tab of ComputationDetailPage.
import { AccordionWizard } from './AccordionWizard';
import type { WizardFormData } from '@/types/wizard';

interface WizardFormProps {
  data: Partial<WizardFormData>;
  onChange?: (updates: Partial<WizardFormData>) => void;
  onSubmit?: () => void;
  computing?: boolean;
}

export function WizardForm({ data, onChange, onSubmit, computing = false }: WizardFormProps) {
  return (
    <AccordionWizard
      data={data}
      onChange={onChange ?? (() => {})}
      onCompute={onSubmit ?? (() => {})}
      computing={computing}
    />
  );
}

export default WizardForm;
