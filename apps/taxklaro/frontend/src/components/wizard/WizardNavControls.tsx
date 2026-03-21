import { Button } from '@/components/ui/button';

interface WizardNavControlsProps {
  onBack?: () => void;
  onNext?: () => void;
  backLabel?: string;
  nextLabel?: string;
  isLastStep?: boolean;
  isSubmitting?: boolean;
}

export function WizardNavControls({
  onBack,
  onNext,
  backLabel = 'Back',
  nextLabel = 'Continue',
  isLastStep,
  isSubmitting,
}: WizardNavControlsProps) {
  return (
    <div className="flex justify-between pt-2">
      {onBack ? (
        <Button variant="outline" onClick={onBack} className="h-11 px-5">
          {backLabel}
        </Button>
      ) : (
        <span />
      )}
      <Button
        onClick={onNext}
        disabled={isSubmitting}
        className="h-11 px-6"
      >
        {isSubmitting ? 'Saving…' : isLastStep ? 'Compute Tax' : nextLabel}
      </Button>
    </div>
  );
}

export default WizardNavControls;
