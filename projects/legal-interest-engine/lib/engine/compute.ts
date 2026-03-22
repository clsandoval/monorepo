import type { ComputationInput, ComputationPeriod, ComputationResult } from './types';
import { CITATIONS } from './constants';
import { getInterestStartDate, splitPeriodsAtTransition, daysBetween } from './dates';
import { getLegalRate, getRateCitation } from './rates';
import { computeInterest } from './interest';
import { computeArt2212 } from './art2212';
import { computePostFinality } from './post-finality';
import { computeAdditionalAwards } from './additional-awards';

/**
 * Converts a decimal rate (e.g. 0.12) to basis points (1200).
 */
function rateToBps(rate: number): number {
  return Math.round(rate * 10000);
}

/**
 * Formats a basis-point rate as a human-readable label.
 */
function formatRateLabel(rateBps: number, isStipulated = false): string {
  const pct = rateBps / 100;
  const suffix = isStipulated ? ' per annum (stipulated)' : ' per annum';
  return `${pct}%${suffix}`;
}

/**
 * Orchestrates the full interest computation following Nacar v. Gallery Frames.
 *
 * Steps:
 * 1. Determine interest start date (demand date for liquidated, judgment date for unliquidated)
 * 2. Split pre-finality period at BSP 799 transition (July 1, 2013)
 * 3. Compute interest per sub-period using applicable rate
 *    - If stipulated rate: use stipulated rate for pre-finality periods
 *    - If no stipulated rate: use legal rate
 * 4. Compute Art. 2212 layer (interest on accrued stipulated interest) if applicable
 * 5. Compute post-finality interest if judgment final date provided
 * 6. Compute additional award interest (moral, exemplary, attorney's fees) if applicable
 * 7. Sum all components into grandTotal
 */
export function compute(input: ComputationInput): ComputationResult {
  const {
    obligationType,
    claimType,
    principalAmount,
    demandDate,
    filingDate,
    judgmentDate,
    judgmentFinalityDate,
    stipulatedRate,
    targetDate,
    additionalAwards: awardsInput,
  } = input;

  // Step 1: Determine interest start date
  const interestStart = getInterestStartDate(claimType, demandDate, filingDate, judgmentDate);

  // Step 2 & 3: Build pre-finality periods
  // End date for pre-finality interest is either finality date or target date
  const preFinalityEnd = judgmentFinalityDate ?? targetDate;
  const subPeriods = splitPeriodsAtTransition(interestStart, preFinalityEnd);

  const periods: ComputationPeriod[] = subPeriods
    .filter(sp => daysBetween(sp.start, sp.end) > 0)
    .map((sp, idx) => {
      const days = daysBetween(sp.start, sp.end);

      let rateBps: number;
      let rateLabel: string;
      let citation: string;

      if (stipulatedRate) {
        // Use stipulated rate for pre-finality
        rateBps = rateToBps(stipulatedRate);
        rateLabel = formatRateLabel(rateBps, true);
        citation = CITATIONS.ART_2209;
      } else {
        // Use legal rate
        rateBps = getLegalRate(obligationType, sp.start, false);
        rateLabel = formatRateLabel(rateBps);
        citation = getRateCitation(sp.start, false);
      }

      const interest = computeInterest(principalAmount, rateBps, days);

      return {
        label: `Pre-Finality Interest${subPeriods.length > 1 ? ` (${sp.regime === 'pre' ? 'Pre-BSP 799' : 'Post-BSP 799'})` : ''}`,
        startDate: sp.start,
        endDate: sp.end,
        days,
        rateBps,
        rateLabel,
        baseAmount: principalAmount,
        interest,
        legalCitation: citation,
      };
    });

  // Step 4: Art. 2212 layer (if stipulated rate)
  const art2212 = stipulatedRate
    ? computeArt2212(
        principalAmount,
        stipulatedRate,
        demandDate,
        filingDate,
        preFinalityEnd,
        judgmentFinalityDate,
        obligationType,
      ) ?? undefined
    : undefined;

  // Step 5: Post-finality interest
  // totalJudgment for post-finality base = principal + pre-finality interest + art2212 interest
  const preFinalityInterestTotal = periods.reduce((sum, p) => sum + p.interest, 0);
  const art2212InterestTotal = art2212?.interest ?? 0;
  const totalJudgmentAtFinality =
    principalAmount + preFinalityInterestTotal + art2212InterestTotal;

  const postFinalityResult = computePostFinality(
    totalJudgmentAtFinality,
    principalAmount,
    stipulatedRate,
    judgmentFinalityDate,
    targetDate,
  );

  // Normalize postFinality — always store as array
  let postFinality: ComputationPeriod[] | undefined;
  let postFinalityInterestTotal = 0;

  if (postFinalityResult !== null) {
    if (Array.isArray(postFinalityResult)) {
      // Multiple post-finality periods (stipulated case)
      postFinality = postFinalityResult;
      postFinalityInterestTotal = postFinalityResult.reduce((sum, p) => sum + p.interest, 0);
    } else {
      postFinality = [postFinalityResult];
      postFinalityInterestTotal = postFinalityResult.interest;
    }
  }

  // Step 6: Additional awards
  const additionalAwards =
    awardsInput && judgmentDate
      ? computeAdditionalAwards(awardsInput, judgmentDate, targetDate, judgmentFinalityDate)
      : [];

  // Step 7: Sum totals
  const totalPrincipal = principalAmount;
  const totalInterest = preFinalityInterestTotal + (art2212?.interest ?? 0) + postFinalityInterestTotal;

  const totalAdditionalAwards = additionalAwards.reduce((sum, a) => sum + a.amount, 0);
  const totalAdditionalAwardsInterest = additionalAwards.reduce((sum, a) => sum + a.interest, 0);

  const grandTotal =
    totalPrincipal + totalInterest + totalAdditionalAwards + totalAdditionalAwardsInterest;

  return {
    input,
    periods,
    art2212,
    postFinality,
    additionalAwards: additionalAwards.length > 0 ? additionalAwards : undefined,
    totalPrincipal,
    totalInterest,
    totalAdditionalAwards,
    totalAdditionalAwardsInterest,
    grandTotal,
  };
}
