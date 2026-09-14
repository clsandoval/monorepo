/**
 * ResultsView — main container for the results display.
 * Renders all sections + actions bar after engine returns EngineOutput.
 */
import { lazy, Suspense } from 'react';
import type { EngineInput, EngineOutput } from '../../types';
import { ResultsHeader } from './ResultsHeader';
import { DistributionSection } from './DistributionSection';
import { withOutputDefaults } from './normalize';
import { ShareBreakdownSection } from './ShareBreakdownSection';
import { ComparisonPanel } from './ComparisonPanel';
import { DonationsSummaryPanel } from './DonationsSummaryPanel';
import { NarrativePanel } from './NarrativePanel';
import { WarningsPanel } from './WarningsPanel';
import { ComputationLog } from './ComputationLog';
import { DeedClauseSection } from './DeedClauseSection';
import { ActionsBar } from './ActionsBar';
import { PrintHeader } from '../shared/PrintHeader';
import { Skeleton } from '../ui/skeleton';

const FamilyTreeTab = lazy(() =>
  import('./visualizer/FamilyTreeTab').then(m => ({ default: m.FamilyTreeTab }))
);

export interface ResultsViewProps {
  input: EngineInput;
  output: EngineOutput;
  onEditInput: () => void;
}

export function ResultsView({ input, output: rawOutput, onEditInput }: ResultsViewProps) {
  // A stored output_json may predate fields this view reads (narratives,
  // warnings, per-share legal_basis). Default them so a legacy case renders
  // instead of crashing the whole page. See ./normalize.
  const output = withOutputDefaults(rawOutput);
  const totalCentavos = typeof input.net_distributable_estate.centavos === 'string'
    ? parseInt(input.net_distributable_estate.centavos, 10)
    : input.net_distributable_estate.centavos;

  const hasDonations = input.donations && input.donations.length > 0;
  const isTestate = input.will !== null && input.will !== undefined;

  return (
    <div data-testid="results-view" className="practice-results space-y-8">
      <PrintHeader
        firmName=""
        caseTitle={`Estate of ${input.decedent.name}`}
      />

      <ResultsHeader
        scenarioCode={output.scenario_code}
        successionType={output.succession_type}
        netDistributableEstate={input.net_distributable_estate}
        decedentName={input.decedent.name}
        dateOfDeath={input.decedent.date_of_death}
        heirCount={output.per_heir_shares.length}
      />

      <DistributionSection
        shares={output.per_heir_shares}
        totalCentavos={totalCentavos}
        successionType={output.succession_type}
        scenarioCode={output.scenario_code}
        persons={input.family_tree}
      />

      <ShareBreakdownSection shares={output.per_heir_shares} />

      {isTestate && (
        <ComparisonPanel input={input} output={output} />
      )}

      {hasDonations && (
        <DonationsSummaryPanel
          donations={input.donations!}
          persons={input.family_tree}
        />
      )}

      <NarrativePanel
        narratives={output.narratives}
        decedentName={input.decedent.name}
        dateOfDeath={input.decedent.date_of_death}
      />

      <WarningsPanel
        warnings={output.warnings}
        shares={output.per_heir_shares}
      />

      <ComputationLog log={output.computation_log} />

      <Suspense fallback={<Skeleton className="h-[500px] w-full rounded-lg" />}>
        <FamilyTreeTab input={input} output={output} />
      </Suspense>

      <DeedClauseSection input={input} output={output} />

      <ActionsBar
        input={input}
        output={output}
        onEditInput={onEditInput}
      />
    </div>
  );
}
