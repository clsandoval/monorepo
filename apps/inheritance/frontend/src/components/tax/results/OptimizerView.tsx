/**
 * OptimizerView — container rendering AdvisorPanel, SensitivityPanel, WhatIfPanel.
 */

import type { Suggestion, SensitivityResult, EstateTaxFullOutput } from '@/lib/estate-tax-engine';
import type { EstateTaxWizardState } from '@/types/estate-tax';
import { AdvisorPanel } from './AdvisorPanel';
import { SensitivityPanel } from './SensitivityPanel';
import { WhatIfPanel } from './WhatIfPanel';

export interface OptimizerViewProps {
  suggestions: Suggestion[];
  sensitivityResults: SensitivityResult[];
  wizardState: EstateTaxWizardState;
  currentOutput: EstateTaxFullOutput;
  onApply: (patch: Partial<EstateTaxWizardState>) => void;
  onRevert?: () => void;
  onCompute: (state: EstateTaxWizardState) => EstateTaxFullOutput;
}

export function OptimizerView({
  suggestions,
  sensitivityResults,
  wizardState,
  currentOutput,
  onApply,
  onRevert,
  onCompute,
}: OptimizerViewProps) {
  return (
    <div data-testid="optimizer-view" className="space-y-8">
      <section>
        <h3 className="font-semibold text-sm mb-3">Optimization Suggestions</h3>
        <AdvisorPanel suggestions={suggestions} onApply={onApply} onRevert={onRevert} />
      </section>

      <section>
        <h3 className="font-semibold text-sm mb-3">Sensitivity Analysis</h3>
        <SensitivityPanel results={sensitivityResults} />
      </section>

      <section>
        <h3 className="font-semibold text-sm mb-3">What-If Scenarios</h3>
        <WhatIfPanel
          wizardState={wizardState}
          currentOutput={currentOutput}
          onCompute={onCompute}
        />
      </section>
    </div>
  );
}
