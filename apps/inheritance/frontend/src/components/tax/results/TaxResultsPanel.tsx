/**
 * TaxResultsPanel — tabbed container for all tax result views.
 * Tabs: Form 1801, Explainer, Optimizer, Comparison (conditional).
 */

import type { EstateTaxFullOutput, Suggestion, SensitivityResult } from '@/lib/estate-tax-engine';
import type { EstateTaxWizardState } from '@/types/estate-tax';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WarningsBanner } from './WarningsBanner';
import { Form1801View } from './Form1801View';
import { Form1801ActionsBar } from './Form1801ActionsBar';
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
  decedentName: string;
  dateOfDeath: string;
  generatedOn: string;
}

export function TaxResultsPanel({
  output,
  suggestions,
  sensitivityResults,
  wizardState,
  onApply,
  onRevert,
  onCompute,
  decedentName,
  dateOfDeath,
  generatedOn,
}: TaxResultsPanelProps) {
  const hasComparison = output.dualPathComparison !== null;

  return (
    <div data-testid="tax-results-panel" className="space-y-4">
      <WarningsBanner warnings={output.warnings} />

      <Tabs defaultValue="form1801">
        <TabsList className="w-full justify-start overflow-x-auto flex-nowrap">
          <TabsTrigger value="form1801" data-testid="tab-form1801">Form 1801</TabsTrigger>
          <TabsTrigger value="explainer" data-testid="tab-explainer">Explainer</TabsTrigger>
          <TabsTrigger value="optimizer" data-testid="tab-optimizer">Optimizer</TabsTrigger>
          {hasComparison && (
            <TabsTrigger value="comparison" data-testid="tab-comparison">Comparison</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="form1801" className="mt-4 space-y-4">
          <Form1801ActionsBar
            output={output}
            decedentName={decedentName}
            dateOfDeath={dateOfDeath}
            generatedOn={generatedOn}
          />
          <Form1801View output={output} />
        </TabsContent>

        <TabsContent value="explainer" className="mt-4">
          <ExplainerView explainer={output.explainer} />
        </TabsContent>

        <TabsContent value="optimizer" className="mt-4">
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
          <TabsContent value="comparison" className="mt-4">
            <ComparisonView dualPathComparison={output.dualPathComparison!} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
