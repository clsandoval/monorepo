import type { ComputationPeriod } from './types';
import {
  BSP_799_EFFECTIVE,
  CITATIONS,
  RATE_POST_BSP,
  RATE_PRE_BSP_POST_FINALITY,
} from './constants';
import { daysBetween } from './dates';
import { computeInterest } from './interest';

/**
 * Converts a decimal rate (e.g. 0.12) to basis points (1200).
 */
function rateToBps(rate: number): number {
  return Math.round(rate * 10000);
}

/**
 * Determines the post-finality rate based on the finality date.
 * - Judgments final before BSP 799 effective date: 12%
 * - Judgments final on or after BSP 799 effective date: 6%
 */
function getPostFinalityRate(judgmentFinalityDate: string): number {
  return judgmentFinalityDate >= BSP_799_EFFECTIVE
    ? RATE_POST_BSP
    : RATE_PRE_BSP_POST_FINALITY;
}

/**
 * Computes post-finality interest.
 *
 * Under Nacar v. Gallery Frames:
 * - Without stipulated rate: 6% (or 12% if final before BSP) on totalJudgment
 * - With stipulated rate: stipulated continues on principal PLUS 6% on totalJudgment
 *
 * @returns ComputationPeriod, ComputationPeriod[], or null if no finality date
 */
export function computePostFinality(
  totalJudgment: number,
  principalCentavos: number,
  stipulatedRate: number | undefined,
  judgmentFinalityDate: string | undefined,
  targetDate: string,
): ComputationPeriod | ComputationPeriod[] | null {
  if (!judgmentFinalityDate) {
    return null;
  }

  const days = daysBetween(judgmentFinalityDate, targetDate);
  const legalRateBps = getPostFinalityRate(judgmentFinalityDate);
  const citation = `${CITATIONS.NACAR}; ${CITATIONS.BSP_799}`;

  if (!stipulatedRate) {
    // Simple case: legal rate on total judgment
    const interest = computeInterest(totalJudgment, legalRateBps, days);
    return {
      label: 'Post-Finality Interest',
      startDate: judgmentFinalityDate,
      endDate: targetDate,
      days,
      rateBps: legalRateBps,
      rateLabel: legalRateBps === RATE_POST_BSP ? '6% per annum' : '12% per annum',
      baseAmount: totalJudgment,
      interest,
      legalCitation: citation,
    };
  }

  // With stipulated rate: two components
  const stipulatedRateBps = rateToBps(stipulatedRate);
  const stipulatedInterest = computeInterest(principalCentavos, stipulatedRateBps, days);
  const legalInterest = computeInterest(totalJudgment, legalRateBps, days);

  const stipulatedPeriod: ComputationPeriod = {
    label: 'Post-Finality: Stipulated Interest on Principal',
    startDate: judgmentFinalityDate,
    endDate: targetDate,
    days,
    rateBps: stipulatedRateBps,
    rateLabel: `${stipulatedRate * 100}% per annum (stipulated)`,
    baseAmount: principalCentavos,
    interest: stipulatedInterest,
    legalCitation: citation,
  };

  const legalPeriod: ComputationPeriod = {
    label: 'Post-Finality: Legal Interest on Total Judgment',
    startDate: judgmentFinalityDate,
    endDate: targetDate,
    days,
    rateBps: legalRateBps,
    rateLabel: legalRateBps === RATE_POST_BSP ? '6% per annum' : '12% per annum',
    baseAmount: totalJudgment,
    interest: legalInterest,
    legalCitation: citation,
  };

  return [stipulatedPeriod, legalPeriod];
}
