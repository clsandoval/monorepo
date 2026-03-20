/**
 * Estate Tax Engine — Surviving Spouse Share (spec §11, Schedule 6A)
 *
 * Computes Item 39 (surviving spouse's share of net conjugal/community estate).
 *
 * Legal basis: NIRC Sec. 86(C) — unchanged across all three regimes.
 *
 * Schedule 6A:
 *   a. Total community/conjugal assets = gross estate Column B (Item 34B)
 *   b. Community obligations = ELIT conjugal amounts (5B–5F Col B)
 *      + funeral (5A Col B) and judicial (5B Col B) for PRE_TRAIN
 *      NOTE: Vanishing deduction (5G) and public transfers (5H) are policy
 *            deductions — NOT financial obligations — excluded from pool.
 *   c. Net community property = max(0, a − b)
 *   d. Spouse's share = c × 0.50
 *
 * Field mapping in OrdinaryDeductionsResult (as implemented in ordinary-deductions.ts):
 *   item5a_standard_deduction       → funeral expenses (pre-TRAIN 5G)
 *   item5b_claims_against_estate    → claims against estate (5A) + judicial/admin (5H)
 *   item5c_claims_vs_insolvent      → claims vs insolvent (5B)
 *   item5d_unpaid_mortgages         → unpaid mortgages
 *   item5e_unpaid_taxes             → unpaid taxes
 *   item5f_casualty_losses          → casualty losses (5D)
 *   item5g_vanishing_deduction      → vanishing deduction (5E) — EXCLUDED from obligations
 *   item5h_transfers_for_public_use → public use transfers (5F) — EXCLUDED from obligations
 *
 * All monetary values in centavos (integer). Pure function; no side effects.
 */

import type {
  DecedentInfo,
  GrossEstateResult,
  OrdinaryDeductionsResult,
  SpouseShareResult,
  DeductionRules,
} from './types';

/** Property regime for spouse share computation. */
export type PropertyRegime = 'ACP' | 'CPG' | 'SEPARATION';

/**
 * Compute the surviving spouse's share of the community/conjugal estate (Schedule 6A).
 *
 * @param decedent - Decedent info (marital status)
 * @param grossEstate - Gross estate result (Column B = conjugal assets)
 * @param ordinaryDeductions - Ordinary deductions result (conjugal amounts per line)
 * @param deductionRules - TRAIN or PRE_TRAIN (affects which obligations reduce the pool)
 * @param propertyRegime - ACP | CPG | SEPARATION (optional; defaults to ACP for married)
 */
export function computeSpouseShare(
  decedent: DecedentInfo,
  grossEstate: GrossEstateResult,
  ordinaryDeductions: OrdinaryDeductionsResult,
  deductionRules: DeductionRules,
  propertyRegime?: PropertyRegime,
): SpouseShareResult {
  // No surviving spouse → share = 0
  if (!decedent.isMarried) {
    return { totalConjugalAssets: 0, conjugalObligations: 0, netConjugalProperty: 0, spouseShare: 0 };
  }

  // Separation of property → no community pool
  if (propertyRegime === 'SEPARATION') {
    return { totalConjugalAssets: 0, conjugalObligations: 0, netConjugalProperty: 0, spouseShare: 0 };
  }

  // Step 1: Total community/conjugal assets = gross estate Column B (Item 34B)
  const totalConjugalAssets = grossEstate.total.conjugal;

  // Step 2: Community obligations = ELIT lines Col B only
  //   TRAIN: 5B(claims+judicial) + 5C(insolvent) + 5D(mortgages) + 5E(taxes) + 5F(casualties)
  //   PRE_TRAIN: same as TRAIN + 5A(funeral)
  //   EXCLUDED always: 5G(vanishing) + 5H(public transfers)
  const o = ordinaryDeductions;

  let conjugalObligations =
    o.item5b_claims_against_estate.conjugal +
    o.item5c_claims_vs_insolvent.conjugal +
    o.item5d_unpaid_mortgages.conjugal +
    o.item5e_unpaid_taxes.conjugal +
    o.item5f_casualty_losses.conjugal;

  // PRE_TRAIN: add funeral (item5a) and judicial (already in item5b via combined field)
  if (deductionRules === 'PRE_TRAIN') {
    conjugalObligations += o.item5a_standard_deduction.conjugal;
  }

  // Step 3: Net community property = max(0, total - obligations)
  const netConjugalProperty = Math.max(0, totalConjugalAssets - conjugalObligations);

  // Step 4: Spouse's share = 50%
  const spouseShare = Math.floor(netConjugalProperty * 0.5);

  return { totalConjugalAssets, conjugalObligations, netConjugalProperty, spouseShare };
}
