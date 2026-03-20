/**
 * TaxResultsPanel — tabbed container for all tax result views.
 * Tabs: Form 1801, Explainer, Optimizer, Comparison (conditional).
 */

import type { EstateTaxFullOutput, Suggestion, SensitivityResult } from '@/lib/estate-tax-engine';
import type { EstateTaxWizardState } from '@/types/estate-tax';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WarningsBanner } from './WarningsBanner';
import { Form1801View } from './Form1801View';
import { ExplainerView } from './ExplainerView';
import { OptimizerView } from './OptimizerView';
import { ComparisonView } from './ComparisonView';

export interface TaxResultsPanelProps {
  output: EstateTaxFullOutput;
  suggestions: Suggestion[];
  sensitivityResults: SensitivityResult[];
  wizardState: EstateTaxWizardState;
  onApply: (patch: Partial<EstateTaxWizardState>) => void;
  onRevert?: () => void;
  onCompute: (state: EstateTaxWizardState) => EstateTaxFullOutput;
}

export function TaxResultsPanel({
  output,
  suggestions,
  sensitivityResults,
  wizardState,
  onApply,
  onRevert,
  onCompute,
}: TaxResultsPanelProps) {
  const hasComparison = output.dualPathComparison !== null;

  return (
    <div data-testid="tax-results-panel">
      <WarningsBanner warnings={output.warnings} />

      <Tabs defaultValue="form1801">
        <TabsList>
          <TabsTrigger value="form1801" data-testid="tab-form1801">Form 1801</TabsTrigger>
          <TabsTrigger value="explainer" data-testid="tab-explainer">Explainer</TabsTrigger>
          <TabsTrigger value="optimizer" data-testid="tab-optimizer">Optimizer</TabsTrigger>
          {hasComparison && (
            <TabsTrigger value="comparison" data-testid="tab-comparison">Comparison</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="form1801">
          <Form1801View output={output} />
        </TabsContent>

        <TabsContent value="explainer">
          <ExplainerView explainer={output.explainer} />
        </TabsContent>

        <TabsContent value="optimizer">
          <OptimizerView
            suggestions={suggestions}
            sensitivityResults={sensitivityResults}
            wizardState={wizardState}
            currentOutput={output}
            onApply={onApply}
            onRevert={onRevert}
            onCompute={onCompute}
          />
        </TabsContent>

        {hasComparison && (
          <TabsContent value="comparison">
            <ComparisonView dualPathComparison={output.dualPathComparison!} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
