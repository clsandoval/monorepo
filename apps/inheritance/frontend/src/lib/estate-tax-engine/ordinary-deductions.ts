/**
 * Estate Tax Engine — Ordinary Deductions (spec §9)
 *
 * Computes Schedule 5 ordinary deductions (Items 5A–5H and total Item 35).
 *
 * Field mapping for OrdinaryDeductionsResult (types.ts):
 *   item5a_standard_deduction   → funeral expenses (5G, PRE_TRAIN only)
 *   item5b_claims_against_estate → judicial/admin expenses (5H, PRE_TRAIN only)
 *     ... wait, this needs to match downstream usage. See below.
 *
 * Actual mapping to types.ts fields:
 *   item5a_standard_deduction       → funeral expenses (pre-TRAIN 5G)
 *   item5b_claims_against_estate    → claims against estate (spec 5A)
 *   item5c_claims_vs_insolvent      → claims vs insolvent (spec 5B)
 *   item5d_unpaid_mortgages         → unpaid mortgages (spec 5C mortgages)
 *   item5e_unpaid_taxes             → unpaid taxes (spec 5C taxes)
 *   item5f_casualty_losses          → casualty losses (spec 5D)
 *   item5g_vanishing_deduction      → vanishing deduction (spec 5E)
 *   item5h_transfers_for_public_use → public use transfers (spec 5F)
 *   (judicial admin expenses not in OrdinaryDeductionsResult fields — goes to item5b or total)
 *
 * NOTE: Given the types.ts field structure, we map:
 *   - Funeral (5G) → item5a_standard_deduction (pre-TRAIN only; 0 for TRAIN)
 *   - Judicial (5H) → item5b_claims_against_estate is already used for claims
 *   Therefore we must carefully integrate funeral/judicial into the result.
 *   After reviewing the types, the cleanest approach is:
 *   - item5a_standard_deduction = funeral expenses (they share the "5a" slot)
 *   - item5b_claims_against_estate = claims against estate
 *   - Judicial admin is folded into item5b (or treated as part of overall total)
 *   ACTUALLY: we need to store judicial separately. Given the type has exactly 8 fields,
 *   the most natural mapping given the types.ts naming is to use item5a for funeral
 *   and include judicial in item5b_claims_against_estate? No, that conflates unrelated items.
 *
 * FINAL DECISION: Map types.ts fields as follows (consistent with how downstream uses them
 * in spouse-share where we need to access the conjugal ELIT obligations):
 *   item5a_standard_deduction       → funeral expenses (5G)
 *   item5b_claims_against_estate    → claims against estate (5A) + judicial admin (5H)
 *     No — this breaks spouse share which reads item5b separately.
 *
 * The only truly clean solution given the 8-field OrdinaryDeductionsResult is:
 *   5a → funeral (since it's the "extra" PRE_TRAIN-only item that doesn't map to spec 5A-5F)
 *   5b → claims against estate
 *   5c → claims vs insolvent
 *   5d → unpaid mortgages
 *   5e → unpaid taxes
 *   5f → casualty losses
 *   5g → vanishing deduction
 *   5h → public use transfers
 * And judicial admin expenses are NOT stored in a dedicated field in OrdinaryDeductionsResult.
 * Instead, they are folded into the total. The spec says spouse share reads ELIT 5A-5D (conjugal),
 * plus funeral/judicial for PRE_TRAIN. We can include judicial in item5a (renamed to funeral+judicial)
 * or store it elsewhere.
 *
 * For spouse-share to work correctly we need to access:
 *   - item5b.conjugal (claims)
 *   - item5c.conjugal (insolvent)
 *   - item5d.conjugal (mortgages)
 *   - item5e.conjugal (taxes)
 *   - item5f.conjugal (casualties)
 *   - item5a.conjugal (funeral, pre-TRAIN)
 *   - judicial.conjugal (pre-TRAIN) — needs a field
 *
 * Given the constraint of the types.ts structure, we'll store judicial admin in item5b
 * as a combined "claims + judicial" for simplicity, or we accept that judicial admin's
 * conjugal portion must be looked up elsewhere.
 *
 * SIMPLEST SOLUTION that fits the type: put funeral in item5a, judicial admin folded
 * into item5b_claims_against_estate (combined). This is acceptable because:
 * - The spouse share module only needs the total conjugal obligations
 * - The downstream pipeline can be aware of this convention
 *
 * All monetary values in centavos (integer). Pure functions; no side effects.
 */

import type {
  ColumnValues,
  OrdinaryDeductionsResult,
  DeductionRules,
  ClaimAgainstEstate,
  ClaimVsInsolvent,
  UnpaidMortgage,
  UnpaidTax,
  CasualtyLoss,
  VanishingDeductionProperty,
  PublicUseTransfer,
  FuneralExpense,
  JudicialAdminExpense,
} from './types';
import { FUNERAL_RATE, VD_PCT } from './constants';

// ── Helpers ───────────────────────────────────────────────────────────────────

function zeroCV(): ColumnValues {
  return { exclusive: 0, conjugal: 0, total: 0 };
}

/**
 * Compute fractional elapsed years between two ISO date strings.
 * Uses (milliseconds / ms_per_year) as a decimal — NOT floored.
 * The spec pseudocode uses `yearsBetween` and compares with `<= 1`, `<= 2`, etc.
 * which means the comparison is on the fractional value (e.g., 1.75 years → > 1 → 80% tier).
 */
function elapsedYears(fromDate: string, toDate: string): number {
  const from = new Date(fromDate);
  const to = new Date(toDate);
  const msPerYear = 365.25 * 24 * 60 * 60 * 1000;
  return (to.getTime() - from.getTime()) / msPerYear;
}

/**
 * Vanishing deduction percentage by elapsed years (fractional).
 * Returns 0 if > 5 years.
 * Spec: elapsed <= 1 → 100%, <= 2 → 80%, <= 3 → 60%, <= 4 → 40%, <= 5 → 20%, > 5 → 0%.
 */
function vanishingPct(elapsed: number): number {
  if (elapsed <= 1) return VD_PCT[1];
  if (elapsed <= 2) return VD_PCT[2];
  if (elapsed <= 3) return VD_PCT[3];
  if (elapsed <= 4) return VD_PCT[4];
  if (elapsed <= 5) return VD_PCT[5];
  return 0;
}

// ── Public sub-functions ──────────────────────────────────────────────────────

/**
 * §9.2 Claims Against Estate (spec 5A).
 * Sums by ownership column.
 */
export function computeClaimsAgainstEstate(claims: ClaimAgainstEstate[]): ColumnValues {
  const result = zeroCV();
  for (const claim of claims) {
    if (claim.ownershipType === 'exclusive') {
      result.exclusive += claim.amount;
    } else {
      result.conjugal += claim.amount;
    }
  }
  result.total = result.exclusive + result.conjugal;
  return result;
}

/**
 * §9.3 Claims vs Insolvent Persons (spec 5B).
 * The ClaimVsInsolvent type in types.ts has no ownershipType; treated as exclusive.
 */
export function computeClaimsVsInsolvent(claims: ClaimVsInsolvent[]): ColumnValues {
  const result = zeroCV();
  for (const claim of claims) {
    result.exclusive += claim.amount;
  }
  result.total = result.exclusive + result.conjugal;
  return result;
}

/**
 * §9.4 Unpaid Mortgages and Taxes (spec 5C, combined).
 * Returns combined ColumnValues from both mortgages and taxes.
 * UnpaidTax type has no ownershipType → treated as exclusive.
 */
export function computeUnpaidMortgagesAndTaxes(
  mortgages: UnpaidMortgage[],
  taxes: UnpaidTax[],
): ColumnValues {
  const result = zeroCV();
  for (const mortgage of mortgages) {
    if (mortgage.ownershipType === 'exclusive') {
      result.exclusive += mortgage.amount;
    } else {
      result.conjugal += mortgage.amount;
    }
  }
  for (const tax of taxes) {
    // UnpaidTax has no ownershipType; default to exclusive
    result.exclusive += tax.amount;
  }
  result.total = result.exclusive + result.conjugal;
  return result;
}

/**
 * §9.5 Casualty Losses (spec 5D).
 * CasualtyLoss in types.ts only has description + amount (no ownershipType or insuranceRecovery).
 * The amount is treated as the net deductible (gross - insurance pre-applied by user).
 * All treated as exclusive since no ownershipType on the type.
 */
export function computeCasualtyLosses(losses: CasualtyLoss[]): ColumnValues {
  const result = zeroCV();
  for (const loss of losses) {
    result.exclusive += loss.amount;
  }
  result.total = result.exclusive + result.conjugal;
  return result;
}

/**
 * §9.6 Vanishing Deduction (spec 5E).
 * @param properties - VD-eligible properties
 * @param grossEstateTotal - Item 34C total gross estate (centavos)
 * @param ratioDeductionsTotal - Sum of the deductions the statute names for the
 *   reduction ratio: ELIT (5A-5D) plus 5F Transfers for Public Use, plus 5G
 *   funeral and 5H judicial under the pre-TRAIN rules (centavos)
 * @param dateOfDeath - ISO date string
 */
export function computeVanishingDeduction(
  properties: VanishingDeductionProperty[],
  grossEstateTotal: number,
  ratioDeductionsTotal: number,
  dateOfDeath: string,
): ColumnValues {
  const result = zeroCV();

  if (grossEstateTotal <= 0) {
    return result;
  }

  // ratio = max(0, (GE - ratio deductions) / GE)
  const ratio = Math.max(0, (grossEstateTotal - ratioDeductionsTotal) / grossEstateTotal);

  for (const prop of properties) {
    // Eligibility: prior tax must have been paid
    if (prop.priorTaxesPaid <= 0) continue;

    const elapsed = elapsedYears(prop.priorTransferDate, dateOfDeath);

    // Disqualified if > 5 years (fractional comparison)
    if (elapsed > 5) continue;

    const pct = vanishingPct(elapsed);
    if (pct <= 0) continue;

    // iv = min(priorFMV, currentFMV)
    const iv = Math.min(prop.fmvAtPriorTransfer, prop.fmvAtDeath);
    // nv = max(0, iv - encumbrances)
    const nv = Math.max(0, iv - prop.encumbrances);

    // VD = floor(pct * nv * ratio)
    const vd = Math.floor(pct * nv * ratio);

    // All VD properties treated as exclusive (no ownershipType on VanishingDeductionProperty)
    result.exclusive += vd;
  }

  result.total = result.exclusive + result.conjugal;
  return result;
}

/**
 * §9.7 Public Use Transfers (spec 5F).
 * For citizens/residents: full amount.
 * For NRAs: pass nraFactor = PH GE / worldwide GE, and amounts are scaled.
 */
export function computePublicUseTransfers(
  transfers: PublicUseTransfer[],
  nraFactor?: number,
): ColumnValues {
  const result = zeroCV();
  const factor = nraFactor ?? 1;

  for (const transfer of transfers) {
    const amount = Math.floor(transfer.amount * factor);
    // PublicUseTransfer type has no ownershipType → exclusive
    result.exclusive += amount;
  }

  result.total = result.exclusive + result.conjugal;
  return result;
}

/**
 * §9.8 Funeral Expenses (spec 5G) — PRE_TRAIN only.
 * TRAIN: returns zero.
 * PRE_TRAIN: deductible = min(total actual, 5% × grossEstateTotal).
 * Default column: conjugal (per spec note for married estates).
 */
export function computeFuneralExpenses(
  expenses: FuneralExpense[],
  grossEstateTotal: number,
  deductionRules: DeductionRules,
): ColumnValues {
  if (deductionRules === 'TRAIN') return zeroCV();
  if (expenses.length === 0) return zeroCV();

  const actual = expenses.reduce((sum, e) => sum + e.amount, 0);
  const limit = Math.floor(grossEstateTotal * FUNERAL_RATE);
  const deductible = Math.min(actual, limit);

  return { exclusive: 0, conjugal: deductible, total: deductible };
}

/**
 * §9.9 Judicial / Administrative Expenses (spec 5H) — PRE_TRAIN only.
 * TRAIN: returns zero.
 * PRE_TRAIN: actual amounts, no cap.
 * JudicialAdminExpense type has no ownershipType → all exclusive.
 */
export function computeJudicialAdminExpenses(
  items: JudicialAdminExpense[],
  deductionRules: DeductionRules,
): ColumnValues {
  if (deductionRules === 'TRAIN') return zeroCV();

  const result = zeroCV();
  for (const item of items) {
    result.exclusive += item.amount;
  }
  result.total = result.exclusive + result.conjugal;
  return result;
}

// ── Input type for computeOrdinaryDeductions ─────────────────────────────────

export interface OrdinaryDeductionsInput {
  claimsAgainstEstate: ClaimAgainstEstate[];
  claimsVsInsolvent: ClaimVsInsolvent[];
  unpaidMortgages: UnpaidMortgage[];
  unpaidTaxes: UnpaidTax[];
  casualtyLosses: CasualtyLoss[];
  vanishingDeductionProperties: VanishingDeductionProperty[];
  publicUseTransfers: PublicUseTransfer[];
  funeralExpenses: FuneralExpense[];
  judicialAdminExpenses: JudicialAdminExpense[];
}

/**
 * Compute all ordinary deductions (Schedule 5, Items 5A–5H + total Item 35).
 *
 * Field mapping to OrdinaryDeductionsResult (types.ts):
 *   item5a_standard_deduction       → funeral expenses (5G, pre-TRAIN only)
 *   item5b_claims_against_estate    → claims against estate (5A) + judicial/admin (5H combined)
 *   item5c_claims_vs_insolvent      → claims vs insolvent (5B)
 *   item5d_unpaid_mortgages         → unpaid mortgages (5C mortgages)
 *   item5e_unpaid_taxes             → unpaid taxes (5C taxes)
 *   item5f_casualty_losses          → casualty losses (5D)
 *   item5g_vanishing_deduction      → vanishing deduction (5E)
 *   item5h_transfers_for_public_use → public use transfers (5F)
 *
 * @param input - deduction line items
 * @param deductionRules - TRAIN or PRE_TRAIN
 * @param grossEstateTotal - Item 34C (centavos) — needed for funeral cap and VD ratio
 * @param dateOfDeath - ISO date string — needed for VD elapsed years
 * @param nraFactor - NRA proportional factor (PH GE / worldwide GE) — optional, for NRAs
 */
export function computeOrdinaryDeductions(
  input: OrdinaryDeductionsInput,
  deductionRules: DeductionRules,
  grossEstateTotal: number,
  dateOfDeath: string,
  nraFactor?: number,
): OrdinaryDeductionsResult {
  // Compute each ELIT component
  const claims = computeClaimsAgainstEstate(input.claimsAgainstEstate);
  const insolvent = computeClaimsVsInsolvent(input.claimsVsInsolvent);
  const mortgages = computeUnpaidMortgagesAndTaxes(input.unpaidMortgages, input.unpaidTaxes);
  const casualties = computeCasualtyLosses(input.casualtyLosses);

  // Funeral expenses (5G) — PRE_TRAIN only
  const funeral = computeFuneralExpenses(input.funeralExpenses, grossEstateTotal, deductionRules);

  // Judicial/admin expenses (5H) — PRE_TRAIN only
  const judicial = computeJudicialAdminExpenses(input.judicialAdminExpenses, deductionRules);

  // Public use transfers (5F) — NRA gets proportional amount.
  // Computed BEFORE the vanishing deduction because it enters that deduction's
  // reduction ratio (see the comment below).
  const publicTransfers = computePublicUseTransfers(input.publicUseTransfers, nraFactor);

  // Deductions the statute names for the vanishing-deduction reduction ratio.
  //
  // NIRC Sec. 86(A)(5) as amended by RA 10963 reduces against "the amounts
  // allowed as deductions under paragraphs (2), (3), (4), and (6)", and
  // paragraph (6) is Transfers for Public Use. RR 12-2018 Sec. 6(5) restates it.
  // RA 8424 Sec. 86(A)(2) reduced against "paragraphs (1) and (3)", and
  // pre-TRAIN paragraph (3) was ALSO Transfers for Public Use. The term is
  // therefore added in both branches.
  //
  // Worked example (LEGAL-CONFORMANCE.md §2b): ₱30,000,000 gross estate,
  // ₱1,000,000 of claims, ₱5,000,000 transfer for public use. The ratio moves
  // from 29/30 to 24/30, and a ₱10,000,000 qualifying property at 100 percent
  // moves from ₱9,666,666 to ₱8,000,000.
  const elitBase = claims.total + insolvent.total + mortgages.total + casualties.total;
  const ratioDeductionsTotal =
    deductionRules === 'PRE_TRAIN'
      ? elitBase + funeral.total + judicial.total + publicTransfers.total
      : elitBase + publicTransfers.total;

  // Vanishing deduction (5E)
  const vanishing = computeVanishingDeduction(
    input.vanishingDeductionProperties,
    grossEstateTotal,
    ratioDeductionsTotal,
    dateOfDeath,
  );

  // Map to OrdinaryDeductionsResult fields:
  //   item5a = funeral (5G)
  //   item5b = claims (5A) — NOTE: judicial is folded into item5b for spouse-share purposes
  //     Actually: to keep claims separate, we store judicial in item5b as a second combined entry
  //     Since spouse-share only uses conjugal values and judicial has no ownershipType (exclusive),
  //     this doesn't affect conjugal obligations. We combine them in total but keep structure.
  //
  // After careful analysis: we'll store funeral in item5a and judicial folded into item5b
  // is BAD because they're semantically different and spouse-share reads item5b.conjugal.
  // Instead, add judicial's exclusive amount to item5e_unpaid_taxes (also exclusive-only) —
  // NO, that conflates different deductions.
  //
  // CLEANEST: item5a = funeral, item5b = claims + judicial (both are conjugal obligations
  // for married estates; judicial is mostly exclusive anyway). The total will be correct.
  // For spouse share: item5b.conjugal = claims.conjugal (judicial is 0 conjugal, 0 effect).

  // Combine claims + judicial for item5b (judicial only adds to exclusive, not conjugal)
  const claimsAndJudicial: ColumnValues = {
    exclusive: claims.exclusive + judicial.exclusive,
    conjugal: claims.conjugal + judicial.conjugal,
    total: claims.total + judicial.total,
  };

  // Re-compute mortgages and taxes separately for output fields
  const mortgagesOnly = computeMortgagesOnly(input.unpaidMortgages);
  const taxesOnly = computeTaxesOnly(input.unpaidTaxes);

  const allComponents = [
    funeral,           // 5a (item5a_standard_deduction)
    claimsAndJudicial, // 5b (item5b_claims_against_estate)
    insolvent,         // 5c (item5c_claims_vs_insolvent)
    mortgagesOnly,     // 5d (item5d_unpaid_mortgages)
    taxesOnly,         // 5e (item5e_unpaid_taxes)
    casualties,        // 5f (item5f_casualty_losses)
    vanishing,         // 5g (item5g_vanishing_deduction)
    publicTransfers,   // 5h (item5h_transfers_for_public_use)
  ];

  const totalExclusive = allComponents.reduce((s, c) => s + c.exclusive, 0);
  const totalConjugal = allComponents.reduce((s, c) => s + c.conjugal, 0);

  return {
    item5a_standard_deduction: funeral,
    item5b_claims_against_estate: claimsAndJudicial,
    item5c_claims_vs_insolvent: insolvent,
    item5d_unpaid_mortgages: mortgagesOnly,
    item5e_unpaid_taxes: taxesOnly,
    item5f_casualty_losses: casualties,
    item5g_vanishing_deduction: vanishing,
    item5h_transfers_for_public_use: publicTransfers,
    total: {
      exclusive: totalExclusive,
      conjugal: totalConjugal,
      total: totalExclusive + totalConjugal,
    },
  };
}

// ── Private helpers ───────────────────────────────────────────────────────────

function computeMortgagesOnly(mortgages: UnpaidMortgage[]): ColumnValues {
  const result = zeroCV();
  for (const m of mortgages) {
    if (m.ownershipType === 'exclusive') {
      result.exclusive += m.amount;
    } else {
      result.conjugal += m.amount;
    }
  }
  result.total = result.exclusive + result.conjugal;
  return result;
}

function computeTaxesOnly(taxes: UnpaidTax[]): ColumnValues {
  const result = zeroCV();
  for (const t of taxes) {
    result.exclusive += t.amount;
  }
  result.total = result.exclusive + result.conjugal;
  return result;
}
