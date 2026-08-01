/**
 * Estate Tax Engine — Special Deductions (spec §10)
 *
 * Computes Schedule 6 special deductions (Items 37A–37D + total Item 37).
 *
 * Field mapping (types.ts SpecialDeductionsResult):
 *   item37a_family_home              → family home deduction (§10.2)
 *   item37b_funeral_expenses         → funeral expenses (§9.8, pre-TRAIN only)
 *   item37c_judicial_admin_expenses  → judicial/admin expenses (§9.9, pre-TRAIN only)
 *   item37d_medical_expenses         → medical expenses (§10.3)
 *   total                            → sum of standard deduction + 37A–37D
 *
 * Standard deduction (§10.1) is NOT a named field in SpecialDeductionsResult
 * but IS included in the total. Returned separately as `standardDeduction`.
 *
 * All monetary values in centavos (integer). Pure functions; no side effects.
 */

import type {
  DecedentInfo,
  SpecialDeductionsResult,
  DeductionRules,
  MedicalExpense,
  FuneralExpense,
  JudicialAdminExpense,
} from './types';
import {
  STANDARD_DEDUCTION_TRAIN_CITIZEN,
  STANDARD_DEDUCTION_PRE_TRAIN_CITIZEN,
  STANDARD_DEDUCTION_NRA,
  FAMILY_HOME_CAP_TRAIN,
  FAMILY_HOME_CAP_PRE_TRAIN,
  MEDICAL_EXPENSE_CAP,
  FUNERAL_RATE,
} from './constants';

// ── Family home input shape ────────────────────────────────────────────────────

export interface FamilyHomeInput {
  fmv: number; // centavos
  ownershipType: 'exclusive' | 'conjugal';
  hasCertification: boolean;
}

// ── Extended result with standardDeduction exposed ────────────────────────────

// Since `SpecialDeductionsResult` was widened to declare `standardDeduction`
// and `ra4917` (21-01), this interface is structurally IDENTICAL to its base.
// It is retained rather than deleted because its exported symbol has importers
// outside the enumeration of the plan that widened the base type.
export interface SpecialDeductionsResultExtended extends SpecialDeductionsResult {
  standardDeduction: number;
  ra4917: number;
}

// ── Internal helpers ──────────────────────────────────────────────────────────

function computeStandardDeduction(decedent: DecedentInfo, deductionRules: DeductionRules): number {
  if (decedent.isNRA) return STANDARD_DEDUCTION_NRA;
  if (deductionRules === 'TRAIN') return STANDARD_DEDUCTION_TRAIN_CITIZEN;
  return STANDARD_DEDUCTION_PRE_TRAIN_CITIZEN;
}

function computeFamilyHome(
  decedent: DecedentInfo,
  deductionRules: DeductionRules,
  familyHome?: FamilyHomeInput,
): number {
  if (decedent.isNRA) return 0;
  if (!familyHome) return 0;
  if (!familyHome.hasCertification) return 0;

  const cap = deductionRules === 'TRAIN' ? FAMILY_HOME_CAP_TRAIN : FAMILY_HOME_CAP_PRE_TRAIN;

  // LAWYER-DECISION: LAWYER-07 — recorded interpretive choice, see .planning/LAWYER-AGENDA.md. Do not change this rule without a recorded answer.
  if (familyHome.ownershipType === 'conjugal') {
    return Math.min(Math.floor(familyHome.fmv * 0.5), cap);
  }
  return Math.min(familyHome.fmv, cap);
}

function computeFuneralDeduction(
  decedent: DecedentInfo,
  deductionRules: DeductionRules,
  grossEstateTotal: number,
  funeralExpenses?: FuneralExpense[],
): number {
  // NRA: not eligible for funeral deduction in special schedule
  if (decedent.isNRA) return 0;
  if (deductionRules === 'TRAIN') return 0;
  if (!funeralExpenses || funeralExpenses.length === 0) return 0;

  const actual = funeralExpenses.reduce((sum, e) => sum + e.amount, 0);
  const limit = Math.floor(grossEstateTotal * FUNERAL_RATE);
  return Math.min(actual, limit);
}

function computeJudicialAdminDeduction(
  decedent: DecedentInfo,
  deductionRules: DeductionRules,
  judicialAdminExpenses?: JudicialAdminExpense[],
): number {
  if (decedent.isNRA) return 0;
  if (deductionRules === 'TRAIN') return 0;
  if (!judicialAdminExpenses || judicialAdminExpenses.length === 0) return 0;

  return judicialAdminExpenses.reduce((sum, e) => sum + e.amount, 0);
}

/**
 * Medical expense deduction — PRE-TRAIN ONLY.
 *
 * RA 10963 (TRAIN) Sec. 23 deleted NIRC Sec. 86(A)(6) effective 2018-01-01,
 * removing funeral, judicial/administrative AND medical expenses together.
 * RR 12-2018 Sec. 6 enumerates the nine deductions available under the TRAIN
 * regime and none of them is medical expenses.
 *
 * The pre-TRAIN entitlement under RA 8424 Sec. 86(A)(6) survives unchanged:
 * medical expenses incurred within one year before death, capped at
 * PHP 500,000 (`MEDICAL_EXPENSE_CAP`).
 */
function computeMedicalDeduction(
  decedent: DecedentInfo,
  deductionRules: DeductionRules,
  medicalExpenses?: MedicalExpense[],
): number {
  if (decedent.isNRA) return 0;
  if (deductionRules === 'TRAIN') return 0;
  if (!medicalExpenses || medicalExpenses.length === 0) return 0;

  const total = medicalExpenses.reduce((sum, e) => sum + e.amount, 0);
  return Math.min(total, MEDICAL_EXPENSE_CAP);
}

function computeRa4917Deduction(decedent: DecedentInfo, ra4917Amount?: number): number {
  if (decedent.isNRA) return 0;
  return ra4917Amount ?? 0;
}

// ── Public function ───────────────────────────────────────────────────────────

/**
 * Compute all special deductions (Schedule 6, Items 37A–37D + total Item 37).
 *
 * @param decedent - Decedent info (citizenship, NRA status)
 * @param deductionRules - TRAIN or PRE_TRAIN
 * @param grossEstateTotal - Item 34C total gross estate (centavos); needed for funeral 5% cap
 * @param familyHomeAsset - Optional family home details
 * @param funeralExpenses - Optional funeral expense items (pre-TRAIN only)
 * @param judicialAdminExpenses - Optional judicial/admin expense items (pre-TRAIN only)
 * @param medicalExpenses - Optional medical expense items; honoured only under PRE_TRAIN
 *   (RA 10963 Sec. 23 repealed NIRC Sec. 86(A)(6) for deaths on or after 2018-01-01)
 * @param ra4917Amount - Optional RA 4917 benefit amount (centavos)
 */
export function computeSpecialDeductions(
  decedent: DecedentInfo,
  deductionRules: DeductionRules,
  grossEstateTotal: number,
  familyHomeAsset?: FamilyHomeInput,
  funeralExpenses?: FuneralExpense[],
  judicialAdminExpenses?: JudicialAdminExpense[],
  medicalExpenses?: MedicalExpense[],
  ra4917Amount?: number,
): SpecialDeductionsResultExtended {
  const standardDeduction = computeStandardDeduction(decedent, deductionRules);
  const familyHome = computeFamilyHome(decedent, deductionRules, familyHomeAsset);
  const funeral = computeFuneralDeduction(decedent, deductionRules, grossEstateTotal, funeralExpenses);
  const judicial = computeJudicialAdminDeduction(decedent, deductionRules, judicialAdminExpenses);
  const medical = computeMedicalDeduction(decedent, deductionRules, medicalExpenses);
  const ra4917 = computeRa4917Deduction(decedent, ra4917Amount);

  const total = standardDeduction + familyHome + funeral + judicial + medical + ra4917;

  return {
    item37a_family_home: familyHome,
    item37b_funeral_expenses: funeral,
    item37c_judicial_admin_expenses: judicial,
    item37d_medical_expenses: medical,
    total,
    standardDeduction,
    ra4917,
  };
}
