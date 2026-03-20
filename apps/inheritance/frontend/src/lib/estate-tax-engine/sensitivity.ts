/**
 * Estate Tax Engine — Sensitivity Analysis (Task 17)
 *
 * For each lever, builds a modified wizard state, re-runs computeEstateTax(),
 * and computes delta = modifiedTax - currentTax.
 *
 * - Negative delta → modification saves money
 * - Positive delta → modification costs more tax
 *
 * Results are sorted by |delta| descending. Zero-impact levers are excluded.
 *
 * All monetary values in centavos (integer).
 */

import type { EstateTaxWizardState } from '@/types/estate-tax';
import type { EstateTaxFullOutput } from './types';
import { computeEstateTax } from './pipeline';
import { deepMerge } from './advisor';
import { AMNESTY_COVERAGE_CUTOFF } from './constants';

// ── Result shape ──────────────────────────────────────────────────────────────

export interface SensitivityResult {
  inputName: string;
  currentValue: string;
  alternativeValue: string;
  taxDelta: number; // centavos; negative = saves money
}

// ── Internal helper ────────────────────────────────────────────────────────────

/**
 * Apply `patch` to `state`, re-run the pipeline, and return
 * delta = patchedTax - currentTax.
 */
function computeDelta(
  state: EstateTaxWizardState,
  patch: Partial<EstateTaxWizardState>,
  currentTax: number,
): number {
  const patched = deepMerge(state, patch);
  const patchedOutput = computeEstateTax(patched);
  return patchedOutput.taxComputation.netEstateTaxDue - currentTax;
}

// ── Lever implementations ─────────────────────────────────────────────────────

/**
 * Lever 1 — family-home
 * Toggle isFamilyHome on the first residential property.
 * If currently claimed → toggle off. If not claimed → toggle on.
 */
function leverFamilyHome(
  state: EstateTaxWizardState,
  currentTax: number,
): SensitivityResult | null {
  const firstResidentialIdx = state.realProperties.findIndex(
    (p) => p.classification === 'residential',
  );
  if (firstResidentialIdx === -1) return null;

  const prop = state.realProperties[firstResidentialIdx];
  const currentClaimed = prop.isFamilyHome;

  const patchedRealProperties = state.realProperties.map((p, idx) =>
    idx === firstResidentialIdx
      ? { ...p, isFamilyHome: !currentClaimed, hasBarangayCert: !currentClaimed }
      : p,
  );

  const patch: Partial<EstateTaxWizardState> = { realProperties: patchedRealProperties };
  const delta = computeDelta(state, patch, currentTax);

  if (delta === 0) return null;

  return {
    inputName: 'family-home',
    currentValue: currentClaimed ? 'claimed' : 'not claimed',
    alternativeValue: currentClaimed ? 'not claimed' : 'claimed',
    taxDelta: delta,
  };
}

/**
 * Lever 2 — property-regime
 * Try ACP, CPG, and CSP. Report the one with the biggest absolute delta from current.
 * Only applies to married decedents.
 */
function leverPropertyRegime(
  state: EstateTaxWizardState,
  currentTax: number,
): SensitivityResult | null {
  if (state.decedent.maritalStatus !== 'married') return null;

  const regimes = ['ACP', 'CPG', 'CSP'] as const;
  let bestDelta = 0;
  let bestRegime: string | null = null;

  for (const regime of regimes) {
    // Skip if this is already the current regime
    if (state.decedent.propertyRegime === regime) continue;

    const patch: Partial<EstateTaxWizardState> = {
      decedent: { ...state.decedent, propertyRegime: regime },
    };
    const delta = computeDelta(state, patch, currentTax);

    if (Math.abs(delta) > Math.abs(bestDelta)) {
      bestDelta = delta;
      bestRegime = regime;
    }
  }

  if (bestDelta === 0 || bestRegime === null) return null;

  return {
    inputName: 'property-regime',
    currentValue: state.decedent.propertyRegime ?? 'none',
    alternativeValue: bestRegime,
    taxDelta: bestDelta,
  };
}

/**
 * Lever 3 — amnesty
 * Toggle amnesty election when eligible.
 * Only for deaths on/before the amnesty cutoff and no disqualifying flags.
 */
function leverAmnesty(
  state: EstateTaxWizardState,
  currentTax: number,
): SensitivityResult | null {
  const { dateOfDeath } = state.decedent;
  if (!dateOfDeath) return null;
  if (dateOfDeath > AMNESTY_COVERAGE_CUTOFF) return null;

  // Disqualifying flags
  if (
    state.filing.taxFullyPaidBeforeMay2022 ||
    state.filing.hasPcggViolation ||
    state.filing.hasRa3019Violation ||
    state.filing.hasRa9160Violation ||
    state.filing.hasPendingCourtCasePreAmnestyAct ||
    state.filing.hasUnexplainedWealthCases ||
    state.filing.hasPendingRPCFelonies
  ) {
    return null;
  }

  const currentElected = state.filing.userElectsAmnesty;
  const patch: Partial<EstateTaxWizardState> = {
    filing: { ...state.filing, userElectsAmnesty: !currentElected },
  };
  const delta = computeDelta(state, patch, currentTax);

  if (delta === 0) return null;

  return {
    inputName: 'amnesty',
    currentValue: currentElected ? 'elected' : 'not elected',
    alternativeValue: currentElected ? 'not elected' : 'elected',
    taxDelta: delta,
  };
}

/**
 * Lever 4 — standard-deduction
 * Zero out the standard deduction to show its impact.
 * (Only produces a delta if the wizard state's standardDeduction field differs from 0.)
 */
function leverStandardDeduction(
  state: EstateTaxWizardState,
  currentTax: number,
): SensitivityResult | null {
  if (state.specialDeductions.standardDeduction === 0) return null;

  // The engine computes standard deduction automatically, so zeroing the wizard field
  // shows the contribution of the standard deduction field in the wizard state.
  const currentVal = state.specialDeductions.standardDeduction;
  const patch: Partial<EstateTaxWizardState> = {
    specialDeductions: { ...state.specialDeductions, standardDeduction: 0 },
  };
  const delta = computeDelta(state, patch, currentTax);

  if (delta === 0) return null;

  const currentValPHP = (currentVal / 100).toLocaleString('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
  });

  return {
    inputName: 'standard-deduction',
    currentValue: currentValPHP,
    alternativeValue: '₱0',
    taxDelta: delta,
  };
}

/**
 * Lever 5 — medical-expenses
 * Zero out claimed medical expenses to show their impact.
 */
function leverMedicalExpenses(
  state: EstateTaxWizardState,
  currentTax: number,
): SensitivityResult | null {
  if (state.specialDeductions.medicalExpenses === 0) return null;

  const currentVal = state.specialDeductions.medicalExpenses;
  const patch: Partial<EstateTaxWizardState> = {
    specialDeductions: { ...state.specialDeductions, medicalExpenses: 0 },
  };
  const delta = computeDelta(state, patch, currentTax);

  if (delta === 0) return null;

  const currentValPHP = (currentVal / 100).toLocaleString('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
  });

  return {
    inputName: 'medical-expenses',
    currentValue: currentValPHP,
    alternativeValue: '₱0',
    taxDelta: delta,
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Run all sensitivity levers against the current wizard state and output.
 * Returns results sorted by absolute taxDelta descending, zero-impact excluded.
 */
export function runSensitivity(
  wizardState: EstateTaxWizardState,
  currentOutput: EstateTaxFullOutput,
): SensitivityResult[] {
  const currentTax = currentOutput.taxComputation.netEstateTaxDue;

  const levers = [
    leverFamilyHome,
    leverPropertyRegime,
    leverAmnesty,
    leverStandardDeduction,
    leverMedicalExpenses,
  ];

  const results: SensitivityResult[] = [];

  for (const lever of levers) {
    const result = lever(wizardState, currentTax);
    if (result !== null) {
      results.push(result);
    }
  }

  // Sort by absolute delta descending
  results.sort((a, b) => Math.abs(b.taxDelta) - Math.abs(a.taxDelta));

  return results;
}
