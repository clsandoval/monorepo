import type { TaxComputationResult } from '@/types/engine-output';
import { WarningsBanner } from '@/components/results/WarningsBanner';
import { TaxBreakdownPanel } from '@/components/results/TaxBreakdownPanel';
import { BalancePayableSection } from '@/components/results/BalancePayableSection';
import { InstallmentSection } from '@/components/results/InstallmentSection';
import { PercentageTaxSummary } from '@/components/results/PercentageTaxSummary';
import { BirFormRecommendation } from '@/components/results/BirFormRecommendation';
import { PenaltySummary } from '@/components/results/PenaltySummary';
import { ManualReviewFlags } from '@/components/results/ManualReviewFlags';
import { PathDetailAccordion } from '@/components/results/PathDetailAccordion';
import { HeroNumber } from '@/components/results/HeroNumber';
import { RecommendationPill } from '@/components/results/RecommendationPill';
import { RegimeComparison } from '@/components/results/RegimeComparison';
import { CollapsibleResultSection } from '@/components/results/CollapsibleResultSection';
import { ResultsActions } from '@/components/results/ResultsActions';

interface ResultsViewProps {
  result: TaxComputationResult;
  readOnly?: boolean;
}

export function ResultsView({ result }: ResultsViewProps) {
  const comparisonOptions = result.comparison.map((opt) => ({
    name: opt.label,
    amount: parseFloat(opt.totalTaxBurden),
    effectiveRate: (parseFloat(opt.effectiveRate) * 100).toFixed(2) + '%',
    isRecommended: opt.path === result.recommendedRegime,
  }));

  const selectedOption = result.comparison.find((opt) => opt.path === result.selectedPath);
  const recommendedOption = result.comparison.find((opt) => opt.path === result.recommendedRegime);

  const hasPenalties = result.penalties !== null && result.penalties.applies;
  const hasManualReviewFlags = result.manualReviewFlags.length > 0;

  return (
    <div className="space-y-2">
      {result.warnings.length > 0 && (
        <div className="mb-6">
          <WarningsBanner warnings={result.warnings} />
        </div>
      )}

      <HeroNumber
        label="Total Tax Due"
        amount={parseFloat(result.selectedTotalTax)}
      />

      {!result.usingLockedRegime && recommendedOption && (
        <RecommendationPill
          regimeName={recommendedOption.label}
          savings={parseFloat(result.savingsVsNextBest)}
        />
      )}

      <RegimeComparison options={comparisonOptions} />

      <CollapsibleResultSection title="Tax Breakdown">
        <TaxBreakdownPanel
          selectedPath={result.selectedPath}
          selectedIncomeTaxDue={result.selectedIncomeTaxDue}
          selectedPercentageTaxDue={result.selectedPercentageTaxDue}
          selectedTotalTax={result.selectedTotalTax}
        />
        {result.ptResult.ptApplies && (
          <PercentageTaxSummary ptResult={result.ptResult} />
        )}
      </CollapsibleResultSection>

      {result.installmentEligible && (
        <CollapsibleResultSection title="Quarterly Installments">
          <InstallmentSection
            installmentEligible={result.installmentEligible}
            installmentFirstDue={result.installmentFirstDue}
            installmentSecondDue={result.installmentSecondDue}
          />
        </CollapsibleResultSection>
      )}

      <CollapsibleResultSection title="Balance Payable">
        <BalancePayableSection
          balance={result.balance}
          disposition={result.disposition}
          overpayment={result.overpayment}
          overpaymentDisposition={result.overpaymentDisposition}
          totalItCredits={result.totalItCredits}
          cwtCredits={result.cwtCredits}
          quarterlyPayments={result.quarterlyPayments}
          priorYearExcess={result.priorYearExcess}
        />
      </CollapsibleResultSection>

      {hasPenalties && (
        <CollapsibleResultSection title="Penalties">
          <PenaltySummary penalties={result.penalties!} />
        </CollapsibleResultSection>
      )}

      <CollapsibleResultSection title="BIR Form">
        <BirFormRecommendation
          formType={result.formType}
          formOutput={result.formOutput}
          requiredAttachments={result.requiredAttachments}
        />
      </CollapsibleResultSection>

      {hasManualReviewFlags && (
        <CollapsibleResultSection
          title="Manual Review Flags"
          className="bg-amber-500/5 border border-amber-500/10"
        >
          <ManualReviewFlags manualReviewFlags={result.manualReviewFlags} />
        </CollapsibleResultSection>
      )}

      <CollapsibleResultSection title="Regime Detail">
        <PathDetailAccordion
          pathADetails={result.pathADetails}
          pathBDetails={result.pathBDetails}
          pathCDetails={result.pathCDetails}
        />
      </CollapsibleResultSection>

      <ResultsActions
        onDownloadPdf={() => {}}
        onShareLink={() => {}}
      />
    </div>
  );
}

export default ResultsView;
