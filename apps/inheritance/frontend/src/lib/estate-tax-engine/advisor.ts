/**
 * Estate Tax Engine — Deduction Advisor (Task 16)
 *
 * Analyses the current wizard state and suggests deductions / optimisations
 * that would reduce the estate tax due. For each suggestion it:
 *   1. Builds a patch (partial wizard state)
 *   2. Deep-merges the patch with the current state
 *   3. Re-runs computeEstateTax()
 *   4. Computes savings = currentTax - patchedTax
 *   5. Includes the suggestion only when savings > 0
 *
 * Results are sorted by estimatedSavings descending.
 *
 * All monetary values in centavos (integer).
 */

import type { EstateTaxWizardState } from '@/types/estate-tax';
import type { EstateTaxFullOutput } from './types';
import { computeEstateTax } from './pipeline';
import { AMNESTY_COVERAGE_CUTOFF, MEDICAL_EXPENSE_CAP, TRAIN_RATE } from './constants';

// ── Suggestion shape ──────────────────────────────────────────────────────────

export interface Suggestion {
  id: string;
  title: string;
  description: string;
  estimatedSavings: number; // centavos
  patch: Partial<EstateTaxWizardState>;
  affectedTab: number; // TabIndex (0-7)
}

// ── Deep merge helper ─────────────────────────────────────────────────────────

/**
 * Deep-merge `patch` into `target`. Arrays in `patch` replace arrays in
 * `target` entirely (element-level merging would require item IDs and is
 * out of scope here). Returns a new object; never mutates inputs.
 */
export function deepMerge<T extends object>(target: T, patch: Partial<T>): T {
  const result: Record<string, unknown> = { ...target };

  for (const key of Object.keys(patch) as Array<keyof T>) {
    const patchVal = patch[key];
    const targetVal = target[key];

    if (
      patchVal !== null &&
      typeof patchVal === 'object' &&
      !Array.isArray(patchVal) &&
      targetVal !== null &&
      typeof targetVal === 'object' &&
      !Array.isArray(targetVal)
    ) {
      // Both sides are plain objects — recurse
      result[key as string] = deepMerge(
        targetVal as object,
        patchVal as Partial<typeof targetVal>,
      );
    } else {
      result[key as string] = patchVal;
    }
  }

  return result as T;
}

// ── Internal helpers ──────────────────────────────────────────────────────────

/**
 * Apply `patch` to `state`, re-run the pipeline, and return the tax delta.
 * Positive delta = savings (patch reduces tax).
 * Negative delta = patch makes things worse (suppress this suggestion).
 */
function computeSavings(
  state: EstateTaxWizardState,
  patch: Partial<EstateTaxWizardState>,
  currentTax: number,
): number {
  const patchedState = deepMerge(state, patch);
  const patchedOutput = computeEstateTax(patchedState);
  return currentTax - patchedOutput.taxComputation.netEstateTaxDue;
}

// ── Rule implementations ──────────────────────────────────────────────────────

/**
 * Rule 1 — unclaimed-family-home
 * A residential real property exists but none is flagged isFamilyHome.
 * Patch: set the first residential property's isFamilyHome + hasBarangayCert to true.
 */
function ruleUnclaimedFamilyHome(
  state: EstateTaxWizardState,
  currentTax: number,
): Suggestion | null {
  const hasExistingFamilyHome = state.realProperties.some((p) => p.isFamilyHome);
  if (hasExistingFamilyHome) return null;

  const firstResidentialIdx = state.realProperties.findIndex(
    (p) => p.classification === 'residential',
  );
  if (firstResidentialIdx === -1) return null;

  // Build patched real properties array with first residential flagged
  const patchedRealProperties = state.realProperties.map((p, idx) =>
    idx === firstResidentialIdx
      ? { ...p, isFamilyHome: true, hasBarangayCert: true }
      : p,
  );

  const patch: Partial<EstateTaxWizardState> = { realProperties: patchedRealProperties };
  const savings = computeSavings(state, patch, currentTax);

  if (savings <= 0) return null;

  return {
    id: 'unclaimed-family-home',
    title: 'Claim Family Home Deduction',
    description:
      'A residential property exists in the estate but no family home has been designated. ' +
      'Designating the primary residence as the family home can reduce the net taxable estate ' +
      'by up to ₱10,000,000 (TRAIN) or ₱1,000,000 (pre-TRAIN).',
    estimatedSavings: savings,
    patch,
    affectedTab: 2, // Real Props
  };
}

/**
 * Rule 2 — amnesty-eligible
 * Death on or before 2022-05-31, amnesty not elected, and no disqualifying flags.
 * Patch: set filing.userElectsAmnesty = true.
 */
function ruleAmnestyEligible(
  state: EstateTaxWizardState,
  currentTax: number,
): Suggestion | null {
  const { dateOfDeath } = state.decedent;
  if (!dateOfDeath) return null;

  // Must be on/before the amnesty cutoff
  if (dateOfDeath > AMNESTY_COVERAGE_CUTOFF) return null;

  // Amnesty already elected
  if (state.filing.userElectsAmnesty) return null;

  // Tax already paid — ineligible
  if (state.filing.taxFullyPaidBeforeMay2022) return null;

  // Disqualifying flags
  if (
    state.filing.hasPcggViolation ||
    state.filing.hasRa3019Violation ||
    state.filing.hasRa9160Violation ||
    state.filing.hasPendingCourtCasePreAmnestyAct ||
    state.filing.hasUnexplainedWealthCases ||
    state.filing.hasPendingRPCFelonies
  ) {
    return null;
  }

  const patch: Partial<EstateTaxWizardState> = {
    filing: { ...state.filing, userElectsAmnesty: true },
  };
  const savings = computeSavings(state, patch, currentTax);

  if (savings <= 0) return null;

  return {
    id: 'amnesty-eligible',
    title: 'Elect Estate Tax Amnesty',
    description:
      "The decedent's date of death qualifies for the Estate Tax Amnesty (RA 11213 / RA 11569). " +
      'Electing amnesty may produce a lower tax liability, particularly for smaller estates.',
    estimatedSavings: savings,
    patch,
    affectedTab: 7, // Filing
  };
}

/**
 * Rule 3 — missing-standard-deduction
 * Standard deduction in wizard state is 0 (should normally be auto-set).
 * Patch: restore it to the appropriate value based on regime.
 */
function ruleMissingStandardDeduction(
  state: EstateTaxWizardState,
  currentTax: number,
): Suggestion | null {
  // Standard deduction is handled by the engine automatically based on regime;
  // the wizard's specialDeductions.standardDeduction field is informational.
  // We check if it was zeroed out inadvertently (it shouldn't be).
  if (state.specialDeductions.standardDeduction !== 0) return null;

  const { dateOfDeath } = state.decedent;
  const isTrain = dateOfDeath >= '2018-01-01';
  const isNRA = state.decedent.isNonResidentAlien;

  let correctValue: number;
  if (isNRA) {
    correctValue = 50_000_000; // ₱500K in centavos
  } else if (isTrain) {
    correctValue = 500_000_000; // ₱5M in centavos
  } else {
    correctValue = 100_000_000; // ₱1M in centavos
  }

  const patch: Partial<EstateTaxWizardState> = {
    specialDeductions: { ...state.specialDeductions, standardDeduction: correctValue },
  };
  const savings = computeSavings(state, patch, currentTax);

  if (savings <= 0) return null;

  return {
    id: 'missing-standard-deduction',
    title: 'Restore Standard Deduction',
    description:
      'The standard deduction appears to be set to zero. ' +
      'All estates are entitled to a standard deduction (₱5,000,000 under TRAIN, ₱1,000,000 pre-TRAIN, ₱500,000 for NRAs).',
    estimatedSavings: savings,
    patch,
    affectedTab: 6, // Spec. Ded.
  };
}

/**
 * Rule 4 — no-medical-claimed
 * Married or recent death (TRAIN era), no medical expenses entered.
 * This is informational: we can't auto-patch with a real amount, so we
 * show maximum possible savings (cap × 6% for TRAIN).
 * Patch: set medicalExpenses to the cap.
 */
function ruleNoMedicalClaimed(
  state: EstateTaxWizardState,
  currentTax: number,
): Suggestion | null {
  // Only applicable under TRAIN rules (post-2018)
  const { dateOfDeath } = state.decedent;
  if (!dateOfDeath || dateOfDeath < '2018-01-01') return null;

  // Only when nothing has been claimed
  if (state.specialDeductions.medicalExpenses > 0) return null;

  // Only relevant when there's taxable estate to reduce
  if (currentTax <= 0) return null;

  // Patch: set to the cap (₱500K = 50,000,000 centavos)
  const patch: Partial<EstateTaxWizardState> = {
    specialDeductions: { ...state.specialDeductions, medicalExpenses: MEDICAL_EXPENSE_CAP },
  };
  const savings = computeSavings(state, patch, currentTax);

  if (savings <= 0) return null;

  return {
    id: 'no-medical-claimed',
    title: 'Claim Medical Expenses',
    description:
      'No medical expenses have been claimed. Under TRAIN, up to ₱500,000 of medical expenses ' +
      'incurred within one year before death are deductible. This could save up to ₱30,000 in tax.',
    estimatedSavings: savings,
    patch,
    affectedTab: 6, // Spec. Ded.
  };
}

/**
 * Rule 5 — property-regime-optimization
 * Married but no property regime set. Try ACP and CPG; recommend whichever produces lower tax.
 */
function rulePropertyRegimeOptimization(
  state: EstateTaxWizardState,
  currentTax: number,
): Suggestion | null {
  // Only applies to married decedents with no regime set
  if (state.decedent.maritalStatus !== 'married') return null;
  if (state.decedent.propertyRegime !== null) return null;

  // Try ACP
  const patchACP: Partial<EstateTaxWizardState> = {
    decedent: { ...state.decedent, propertyRegime: 'ACP' },
  };
  const savingsACP = computeSavings(state, patchACP, currentTax);

  // Try CPG
  const patchCPG: Partial<EstateTaxWizardState> = {
    decedent: { ...state.decedent, propertyRegime: 'CPG' },
  };
  const savingsCPG = computeSavings(state, patchCPG, currentTax);

  const bestSavings = Math.max(savingsACP, savingsCPG);
  if (bestSavings <= 0) return null;

  const bestRegime = savingsACP >= savingsCPG ? 'ACP' : 'CPG';
  const bestPatch = savingsACP >= savingsCPG ? patchACP : patchCPG;

  return {
    id: 'property-regime-optimization',
    title: `Set Property Regime to ${bestRegime}`,
    description:
      `No property regime has been specified for this married decedent. ` +
      `Setting the regime to ${bestRegime} (Absolute Community of Property vs. Conjugal Partnership of Gains) ` +
      `affects the surviving spouse's share deduction and could reduce the taxable estate.`,
    estimatedSavings: bestSavings,
    patch: bestPatch,
    affectedTab: 0, // Decedent
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Run all advisor rules against the current wizard state and output.
 * Returns suggestions sorted by estimatedSavings descending.
 */
export function runAdvisor(
  wizardState: EstateTaxWizardState,
  currentOutput: EstateTaxFullOutput,
): Suggestion[] {
  const currentTax = currentOutput.taxComputation.netEstateTaxDue;

  const rules = [
    ruleUnclaimedFamilyHome,
    ruleAmnestyEligible,
    ruleMissingStandardDeduction,
    ruleNoMedicalClaimed,
    rulePropertyRegimeOptimization,
  ];

  const suggestions: Suggestion[] = [];

  for (const rule of rules) {
    const suggestion = rule(wizardState, currentTax);
    if (suggestion !== null) {
      suggestions.push(suggestion);
    }
  }

  // Sort by savings descending
  suggestions.sort((a, b) => b.estimatedSavings - a.estimatedSavings);

  return suggestions;
}
