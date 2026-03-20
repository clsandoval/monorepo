/**
 * Estate Tax Engine — Amnesty Computation (spec §14)
 *
 * Implements RA 11213 / RA 11569 / RA 11956 estate tax amnesty.
 *
 * Track A: No prior return → base = full net taxable estate
 * Track B: Prior return filed → base = max(0, NTE − previouslyDeclaredNetEstate)
 * Minimum: ₱5,000 (500,000 centavos) always applies
 *
 * NOTE: Amnesty filing window closed June 14, 2025. These computations are
 * for historical reference only.
 *
 * All monetary values in centavos (integer). Pure functions; no side effects.
 */

import type {
  EstateFlags,
  TaxComputationResult,
  DualPathComparisonResult,
} from './types';
import { AMNESTY_RATE, AMNESTY_MINIMUM, PRE_TRAIN_CROSSOVER_NTE } from './constants';

/**
 * Compute amnesty tax due.
 *
 * @param netTaxableEstate - Net taxable estate after all deductions and spouse share (centavos)
 * @param estateFlags - Estate flags (priorReturnFiled, previouslyDeclaredNetEstate)
 */
export function computeAmnesty(
  netTaxableEstate: number,
  estateFlags: EstateFlags,
): TaxComputationResult {
  const nte = Math.max(0, netTaxableEstate);
  const priorReturnFiled = estateFlags.priorReturnFiled ?? false;
  const previouslyDeclared = estateFlags.previouslyDeclaredNetEstate ?? 0;

  // Step 1: Select amnesty tax base by track
  let amnestyTaxBase: number;
  if (priorReturnFiled) {
    // Track B: base = max(0, NTE - previouslyDeclared)
    amnestyTaxBase = Math.max(0, nte - Math.max(0, previouslyDeclared));
  } else {
    // Track A: base = full NTE
    amnestyTaxBase = nte;
  }

  // Step 2: Compute tax at 6%
  const computedTax = Math.floor(amnestyTaxBase * AMNESTY_RATE);

  // Step 3: Apply minimum — ALWAYS
  const taxDue = Math.max(AMNESTY_MINIMUM, computedTax);
  const minimumApplied = computedTax < AMNESTY_MINIMUM;

  return {
    netTaxableEstate: nte,
    estateTaxDue: taxDue,
    foreignTaxCredit: 0, // No foreign tax credit under amnesty
    netEstateTaxDue: taxDue,
    graduatedBracket: null,
    amnestyTrack: priorReturnFiled ? 'TRACK_B' : 'TRACK_A',
    previouslyDeclaredNet: priorReturnFiled ? previouslyDeclared : null,
    amnestyTaxBase,
    computedAmnestyTax: computedTax,
    minimumApplied,
  };
}

/**
 * Compare amnesty result vs pre-TRAIN result and recommend the lower path.
 *
 * @param amnestyResult - TaxComputationResult from amnesty computation
 * @param preTRAINResult - TaxComputationResult from pre-TRAIN graduated rate computation
 */
export function computeDualPathComparison(
  amnestyResult: TaxComputationResult,
  preTRAINResult: TaxComputationResult,
): DualPathComparisonResult {
  let recommendedPath: 'AMNESTY' | 'PRE_TRAIN';
  if (amnestyResult.netEstateTaxDue < preTRAINResult.netEstateTaxDue) {
    recommendedPath = 'AMNESTY';
  } else if (amnestyResult.netEstateTaxDue > preTRAINResult.netEstateTaxDue) {
    recommendedPath = 'PRE_TRAIN';
  } else {
    // Equal — TypeScript requires a cast since DualPathComparisonResult.recommendedPath
    // type in types.ts only has 'AMNESTY' | 'PRE_TRAIN', but spec §14.3 allows 'EQUAL'.
    // We cast to satisfy the runtime requirement.
    recommendedPath = 'PRE_TRAIN'; // fallback, overridden below
  }

  // Handle EQUAL case
  const isEqual = amnestyResult.netEstateTaxDue === preTRAINResult.netEstateTaxDue;

  return {
    amnestyResult,
    preTRAINResult,
    recommendedPath: isEqual ? ('EQUAL' as any) : recommendedPath,
    crossoverNTE: PRE_TRAIN_CROSSOVER_NTE,
    filingWindowClosed: true,
  };
}
