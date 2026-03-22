import type { ComputationPeriod } from './types';
import {
  BSP_799_EFFECTIVE,
  CITATIONS,
  RATE_POST_BSP,
  RATE_PRE_BSP_POST_FINALITY,
} from './constants';
import { daysBetween, splitPeriodsAtTransition } from './dates';
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
 * - Without stipulated rate: 6% (or 12% if final before BSP) on totalJudgment,
 *   splitting at the BSP 799 transition (July 1, 2013) when the finality date
 *   is before that transition.
 * - With stipulated rate: stipulated continues on principal (no split — the
 *   stipulated rate is the law between the parties per Lara's Gifts) PLUS
 *   6%/12% on totalJudgment, split at BSP 799 transition when applicable.
 *
 * @returns ComputationPeriod[], or null if no finality date
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

  const citation = `${CITATIONS.NACAR}; ${CITATIONS.BSP_799}`;

  if (!stipulatedRate) {
    // Legal rate on total judgment, split at BSP transition if needed
    const subPeriods = splitPeriodsAtTransition(judgmentFinalityDate, targetDate);

    if (subPeriods.length === 1) {
      const sp = subPeriods[0];
      const rateBps = sp.regime === 'post' ? RATE_POST_BSP : RATE_PRE_BSP_POST_FINALITY;
      const days = daysBetween(sp.start, sp.end);
      const interest = computeInterest(totalJudgment, rateBps, days);
      return {
        label: 'Post-Finality Interest',
        startDate: sp.start,
        endDate: sp.end,
        days,
        rateBps,
        rateLabel: rateBps === RATE_POST_BSP ? '6% per annum' : '12% per annum',
        baseAmount: totalJudgment,
        interest,
        legalCitation: citation,
      };
    }

    // Two sub-periods spanning the BSP transition
    return subPeriods.map((sp) => {
      const rateBps = sp.regime === 'post' ? RATE_POST_BSP : RATE_PRE_BSP_POST_FINALITY;
      const days = daysBetween(sp.start, sp.end);
      const interest = computeInterest(totalJudgment, rateBps, days);
      return {
        label: sp.regime === 'pre'
          ? 'Post-Finality Interest (pre-BSP 799)'
          : 'Post-Finality Interest (post-BSP 799)',
        startDate: sp.start,
        endDate: sp.end,
        days,
        rateBps,
        rateLabel: rateBps === RATE_POST_BSP ? '6% per annum' : '12% per annum',
        baseAmount: totalJudgment,
        interest,
        legalCitation: citation,
      } satisfies ComputationPeriod;
    });
  }

  // With stipulated rate: two components.
  // Stipulated rate does NOT split — it continues at the contracted rate throughout
  // (per Lara's Gifts & Decors: stipulated rate is the law between the parties).
  // Legal component (6%/12% on total judgment) DOES split at BSP transition.
  const stipulatedRateBps = rateToBps(stipulatedRate);
  const stipulatedDays = daysBetween(judgmentFinalityDate, targetDate);
  const stipulatedInterest = computeInterest(principalCentavos, stipulatedRateBps, stipulatedDays);

  const stipulatedPeriod: ComputationPeriod = {
    label: 'Post-Finality: Stipulated Interest on Principal',
    startDate: judgmentFinalityDate,
    endDate: targetDate,
    days: stipulatedDays,
    rateBps: stipulatedRateBps,
    rateLabel: `${stipulatedRate * 100}% per annum (stipulated)`,
    baseAmount: principalCentavos,
    interest: stipulatedInterest,
    legalCitation: citation,
  };

  // Legal component — split at BSP transition when needed
  const legalSubPeriods = splitPeriodsAtTransition(judgmentFinalityDate, targetDate);

  if (legalSubPeriods.length === 1) {
    const sp = legalSubPeriods[0];
    const rateBps = sp.regime === 'post' ? RATE_POST_BSP : RATE_PRE_BSP_POST_FINALITY;
    const days = daysBetween(sp.start, sp.end);
    const interest = computeInterest(totalJudgment, rateBps, days);
    const legalPeriod: ComputationPeriod = {
      label: 'Post-Finality: Legal Interest on Total Judgment',
      startDate: sp.start,
      endDate: sp.end,
      days,
      rateBps,
      rateLabel: rateBps === RATE_POST_BSP ? '6% per annum' : '12% per annum',
      baseAmount: totalJudgment,
      interest,
      legalCitation: citation,
    };
    return [stipulatedPeriod, legalPeriod];
  }

  // Two sub-periods for the legal component
  const legalPeriods: ComputationPeriod[] = legalSubPeriods.map((sp) => {
    const rateBps = sp.regime === 'post' ? RATE_POST_BSP : RATE_PRE_BSP_POST_FINALITY;
    const days = daysBetween(sp.start, sp.end);
    const interest = computeInterest(totalJudgment, rateBps, days);
    return {
      label: sp.regime === 'pre'
        ? 'Post-Finality: Legal Interest on Total Judgment (pre-BSP 799)'
        : 'Post-Finality: Legal Interest on Total Judgment (post-BSP 799)',
      startDate: sp.start,
      endDate: sp.end,
      days,
      rateBps,
      rateLabel: rateBps === RATE_POST_BSP ? '6% per annum' : '12% per annum',
      baseAmount: totalJudgment,
      interest,
      legalCitation: citation,
    } satisfies ComputationPeriod;
  });

  return [stipulatedPeriod, ...legalPeriods];
}
