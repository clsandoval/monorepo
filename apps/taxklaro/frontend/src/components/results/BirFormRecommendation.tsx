import type { FormType } from '@/types/common';
import type { FormOutputUnion } from '@/types/engine-output';

interface BirFormRecommendationProps {
  formType: FormType;
  formOutput: FormOutputUnion;
  requiredAttachments: string[];
}

const FORM_LABELS: Record<FormType, { name: string; description: string }> = {
  FORM_1701: {
    name: 'BIR Form 1701',
    description: 'Annual Income Tax Return — Individuals with mixed income (business + compensation)',
  },
  FORM_1701A: {
    name: 'BIR Form 1701A',
    description: 'Annual Income Tax Return — Individuals Earning Purely from Self-Employment / Practice of Profession',
  },
  FORM_1701Q: {
    name: 'BIR Form 1701Q',
    description: 'Quarterly Income Tax Return — for quarterly filers',
  },
};

export function BirFormRecommendation({
  formType,
  formOutput,
  requiredAttachments,
}: BirFormRecommendationProps) {
  const formInfo = FORM_LABELS[formType];

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 shrink-0 text-xs border border-border text-foreground rounded px-2 py-0.5 font-semibold tabular-nums">
          {formInfo.name}
        </span>
        <p className="text-sm text-muted-foreground">{formInfo.description}</p>
      </div>

      {requiredAttachments.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Required attachments:</p>
          <ul className="space-y-1">
            {requiredAttachments.map((attachment, i) => (
              <li key={i} className="text-sm flex items-start gap-2 text-muted-foreground">
                <span className="text-muted-foreground mt-0.5">•</span>
                <span>{attachment}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default BirFormRecommendation;
