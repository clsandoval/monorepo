/**
 * IntakeReviewStep — Step 4: Review & Save (§4.18)
 *
 * Summary table of all steps. "Create Case" button creates the cases row
 * with pre-populated input_json.
 */

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { IntakeFormState } from '@/types/intake';
import { PROPERTY_REGIME_LABELS } from '@/types/intake';
import { CIVIL_STATUS_LABELS } from '@/types/client';
import { isStepComplete } from '@/lib/intake';

export interface IntakeReviewStepProps {
  state: IntakeFormState;
  onCreateCase: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}

export function IntakeReviewStep({
  state,
  onCreateCase,
  onBack,
  isSubmitting,
}: IntakeReviewStepProps) {
  const allStepsComplete = Array.from({ length: 3 }, (_, i) => isStepComplete(state, i)).every(Boolean);

  return (
    <div data-testid="intake-review-step" className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Step 4: Review & Save</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Review all the information before creating the case.
        </p>
      </div>

      {/* Decedent Info */}
      <Card className="p-4 space-y-2">
        <h3 className="text-sm font-medium">Decedent Information</h3>
        <div className="grid gap-1 text-sm">
          <Row label="Name" value={state.decedentInfo.full_name} />
          <Row label="Date of Death" value={state.decedentInfo.date_of_death} />
          {state.decedentInfo.civil_status && (
            <Row label="Civil Status" value={CIVIL_STATUS_LABELS[state.decedentInfo.civil_status]} />
          )}
          <Row label="Will" value={state.decedentInfo.has_will ? 'Testate' : 'Intestate'} />
          {state.decedentInfo.property_regime && (
            <Row label="Property Regime" value={PROPERTY_REGIME_LABELS[state.decedentInfo.property_regime]} />
          )}
          {state.decedentInfo.citizenship && <Row label="Citizenship" value={state.decedentInfo.citizenship} />}
        </div>
      </Card>

      {/* Family Composition */}
      <Card className="p-4 space-y-2">
        <h3 className="text-sm font-medium">
          Family Composition ({state.familyComposition.heirs.length} heir
          {state.familyComposition.heirs.length !== 1 ? 's' : ''})
        </h3>
        <div className="space-y-1 text-sm">
          {state.familyComposition.heirs.map((heir, i) => (
            <div key={i} className="flex items-center gap-2">
              <span>{heir.name || '(unnamed)'}</span>
              <span className="text-muted-foreground">— {heir.relationship}</span>
              {!heir.is_alive && (
                <Badge variant="outline" className="text-xs">Predeceased</Badge>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Asset Summary */}
      <Card className="p-4 space-y-2">
        <h3 className="text-sm font-medium">Asset Summary</h3>
        <div className="grid gap-1 text-sm">
          <Row
            label="Real Properties"
            value={`${state.assetSummary.real_property_count} (est. ₱${state.assetSummary.real_property_total_value.toLocaleString()})`}
          />
          <Row label="Cash/Bank Accounts" value={state.assetSummary.has_cash ? 'Yes' : 'No'} />
          <Row
            label="Vehicles"
            value={
              state.assetSummary.has_vehicles
                ? `Yes (${state.assetSummary.vehicle_count})`
                : 'No'
            }
          />
        </div>
      </Card>

      <Separator />

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack}>
          ← Back
        </Button>
        <Button
          onClick={onCreateCase}
          disabled={!allStepsComplete || isSubmitting}
        >
          {isSubmitting ? 'Creating Case...' : 'Create Case'}
        </Button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex gap-2">
      <span className="text-muted-foreground w-32 shrink-0">{label}:</span>
      <span>{value}</span>
    </div>
  );
}
