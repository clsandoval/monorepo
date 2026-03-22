import type { Art2212Layer, ObligationType } from './types';
import { BSP_799_EFFECTIVE, CITATIONS } from './constants';
import { daysBetween } from './dates';
import { computeInterest } from './interest';
import { getLegalRate } from './rates';

/**
 * Converts a decimal rate (e.g. 0.12) to basis points (1200).
 */
function rateToBps(rate: number): number {
  return Math.round(rate * 10000);
}

/**
 * Computes the Art. 2212 layer: interest on accrued stipulated interest.
 *
 * Under Civil Code Art. 2212, when a loan carries a stipulated interest rate,
 * the interest that has accrued from demand to judicial demand (filing) itself
 * earns legal interest from the date of judicial demand.
 *
 * Steps:
 * 1. Compute accrued stipulated interest from demandDate → filingDate
 * 2. That accrued amount earns LEGAL interest from filingDate → targetDate
 *
 * Note: Uses legal rate (not stipulated) for the Art.2212 layer interest.
 * Pre-BSP: 12% (treating the accrued interest as a monetary obligation akin to loan)
 * Post-BSP: 6%
 *
 * @returns Art2212Layer or null if no stipulated rate
 */
export function computeArt2212(
  principalCentavos: number,
  stipulatedRate: number | undefined,
  demandDate: string,
  filingDate: string,
  targetDate: string,
  judgmentFinalityDate?: string,
  obligationType: ObligationType = 'loan_forbearance',
): Art2212Layer | null {
  if (!stipulatedRate) {
    return null;
  }

  // Step 1: Compute accrued stipulated interest from demand → filing
  const demandToFilingDays = daysBetween(demandDate, filingDate);
  const stipulatedRateBps = rateToBps(stipulatedRate);
  const accruedStipulatedInterest = computeInterest(
    principalCentavos,
    stipulatedRateBps,
    demandToFilingDays,
  );

  // Step 2: The accrued interest earns legal interest from filing → target
  const filingToTargetDays = daysBetween(filingDate, targetDate);

  // Determine legal rate based on filing date regime and obligation type
  // Post-BSP: 6% regardless of obligation type
  // Pre-BSP: depends on obligationType (loan = 12%, non-loan = 6%)
  const legalRateBps = getLegalRate(obligationType, filingDate, false);

  const art2212Interest = computeInterest(accruedStipulatedInterest, legalRateBps, filingToTargetDays);

  const citation = `${CITATIONS.ART_2212}; ${filingDate >= BSP_799_EFFECTIVE ? CITATIONS.NACAR : CITATIONS.EASTERN_SHIPPING}`;

  return {
    accruedStipulatedInterest,
    startDate: filingDate,
    endDate: targetDate,
    days: filingToTargetDays,
    rateBps: legalRateBps,
    interest: art2212Interest,
    legalCitation: citation,
  };
}
