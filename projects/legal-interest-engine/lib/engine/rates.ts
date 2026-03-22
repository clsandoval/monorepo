import type { ObligationType } from './types';
import {
  BSP_799_EFFECTIVE,
  RATE_PRE_BSP_LOAN,
  RATE_PRE_BSP_NON_LOAN,
  RATE_PRE_BSP_POST_FINALITY,
  RATE_POST_BSP,
  CITATIONS,
} from './constants';

/**
 * Returns whether the given ISO date is in the post-BSP 799 regime
 * (on or after July 1, 2013).
 */
function isPostBSP(date: string): boolean {
  return date >= BSP_799_EFFECTIVE;
}

/**
 * Returns the applicable legal interest rate in basis points.
 *
 * Rules (Nacar v. Gallery Frames):
 * - Post-BSP 799 (>= 2013-07-01): 6% regardless of obligation type or finality
 * - Pre-BSP 799, post-finality: 12% (Eastern Shipping)
 * - Pre-BSP 799, loan/forbearance: 12%
 * - Pre-BSP 799, non-loan: 6%
 */
export function getLegalRate(
  obligationType: ObligationType,
  date: string,
  isPostFinality: boolean,
): number {
  if (isPostBSP(date)) {
    return RATE_POST_BSP;
  }

  // Pre-BSP 799
  if (isPostFinality) {
    return RATE_PRE_BSP_POST_FINALITY;
  }

  return obligationType === 'loan_forbearance' ? RATE_PRE_BSP_LOAN : RATE_PRE_BSP_NON_LOAN;
}

/**
 * Returns the legal citation for the applicable rate regime.
 */
export function getRateCitation(date: string, isPostFinality: boolean): string {
  if (isPostBSP(date)) {
    return `${CITATIONS.NACAR}; ${CITATIONS.BSP_799}`;
  }
  return CITATIONS.EASTERN_SHIPPING;
}
