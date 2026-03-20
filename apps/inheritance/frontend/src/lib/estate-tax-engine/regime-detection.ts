/**
 * Estate Tax Engine — Regime Detection (spec §6)
 *
 * Pure functions; no side effects.
 * All monetary values in centavos (integer).
 */

import type {
  DecedentInfo,
  EstateFlags,
  RegimeDetectionResult,
  AmnestyIneligibilityReason,
  AmnestyTrack,
} from './types';
import {
  TRAIN_EFFECTIVE_DATE,
  AMNESTY_COVERAGE_CUTOFF,
} from './constants';

// ── Internal result for checkAmnestyEligibility ───────────────────────────────

interface AmnestyEligibilityResult {
  eligible: boolean;
  reason: AmnestyIneligibilityReason | null;
  track: AmnestyTrack | null;
}

// ── checkAmnestyEligibility ───────────────────────────────────────────────────

/**
 * Checks all RA 11213 / RA 11569 / RA 11956 eligibility conditions.
 * Returns eligible=true with a track if all conditions pass,
 * or eligible=false with the first failing reason.
 */
export function checkAmnestyEligibility(
  decedent: DecedentInfo,
  estateFlags: EstateFlags,
): AmnestyEligibilityResult {
  // Death must be on or before the amnesty coverage cutoff (2022-05-31)
  if (decedent.dateOfDeath > AMNESTY_COVERAGE_CUTOFF) {
    return { eligible: false, reason: 'DEATH_AFTER_COVERAGE_CUTOFF', track: null };
  }

  // Estate tax must not have been fully paid before May 2022
  if (estateFlags.taxFullyPaidBeforeMay2022 === true) {
    return { eligible: false, reason: 'TAX_ALREADY_PAID', track: null };
  }

  // RA 11213 Sec. 9 exclusions
  if (estateFlags.subjectToPCGGJurisdiction === true) {
    return { eligible: false, reason: 'PCGG_EXCLUSION', track: null };
  }

  if (estateFlags.hasRA3019Violations === true) {
    return { eligible: false, reason: 'RA3019_EXCLUSION', track: null };
  }

  if (estateFlags.hasRA9160Violations === true) {
    return { eligible: false, reason: 'RA9160_EXCLUSION', track: null };
  }

  if (estateFlags.hasPendingCourtCasePreAmnestyAct === true) {
    return { eligible: false, reason: 'PENDING_COURT_CASE_EXCLUSION', track: null };
  }

  if (estateFlags.hasUnexplainedWealthCases === true) {
    return { eligible: false, reason: 'UNEXPLAINED_WEALTH_EXCLUSION', track: null };
  }

  if (estateFlags.hasPendingRPCFelonies === true) {
    return { eligible: false, reason: 'RPC_FELONY_EXCLUSION', track: null };
  }

  // Determine track: B if prior return was filed, otherwise A
  const track: AmnestyTrack = estateFlags.priorReturnFiled === true ? 'TRACK_B' : 'TRACK_A';
  return { eligible: true, reason: null, track };
}

// ── detectRegime ──────────────────────────────────────────────────────────────

/**
 * Detect the applicable tax regime from date of death and user flags.
 * Returns two independent flags: regime (for tax rate/form) and deductionRules
 * (for deduction amounts/available types). See spec §6.
 */
export function detectRegime(
  decedent: DecedentInfo,
  estateFlags: EstateFlags,
  userElectsAmnesty: boolean,
): RegimeDetectionResult {
  const warnings: string[] = [];
  const dateOfDeath = decedent.dateOfDeath;

  // ── BRANCH A: TRAIN-era death (Jan 1, 2018 onward) ───────────────────────

  if (dateOfDeath >= TRAIN_EFFECTIVE_DATE) {

    // A1: After amnesty coverage cutoff (after 2022-05-31) → TRAIN only
    if (dateOfDeath > AMNESTY_COVERAGE_CUTOFF) {
      if (userElectsAmnesty) {
        warnings.push(
          'Estate tax amnesty is not available for decedents who died after May 31, 2022.',
        );
      }
      return {
        regime: 'TRAIN',
        deductionRules: 'TRAIN',
        track: null,
        displayDualPath: false,
        amnestyEligible: false,
        ineligibilityReason: userElectsAmnesty ? 'DEATH_AFTER_COVERAGE_CUTOFF' : null,
        warnings,
      };
    }

    // A2: 2018-01-01 ≤ dateOfDeath ≤ 2022-05-31
    if (userElectsAmnesty) {
      const eligibility = checkAmnestyEligibility(decedent, estateFlags);

      if (eligibility.eligible) {
        warnings.push(
          'For TRAIN-era deaths (2018–2022), the amnesty rate (6%) equals the regular TRAIN rate (6%) ' +
          'and deduction rules are identical. Base tax is the same under both paths. ' +
          'The amnesty benefit was surcharge/interest waiver only. ' +
          'Amnesty filing window closed June 14, 2025.',
        );
        return {
          regime: 'AMNESTY',
          deductionRules: 'TRAIN',
          track: eligibility.track,
          displayDualPath: false,
          amnestyEligible: true,
          ineligibilityReason: null,
          warnings,
        };
      } else {
        warnings.push(
          `Amnesty ineligible: ${describeIneligibility(eligibility.reason!)} Regular TRAIN rules apply.`,
        );
        return {
          regime: 'TRAIN',
          deductionRules: 'TRAIN',
          track: null,
          displayDualPath: false,
          amnestyEligible: false,
          ineligibilityReason: eligibility.reason,
          warnings,
        };
      }
    } else {
      // User did not elect amnesty for TRAIN-era death
      if (estateFlags.taxFullyPaidBeforeMay2022 !== true) {
        warnings.push(
          'NOTE: This estate may have been eligible for estate tax amnesty (RA 11956) since decedent ' +
          'died between Jan 1, 2018 and May 31, 2022. Amnesty window closed June 14, 2025. ' +
          'Base tax is identical under both paths.',
        );
      }
      return {
        regime: 'TRAIN',
        deductionRules: 'TRAIN',
        track: null,
        displayDualPath: false,
        amnestyEligible: false,
        ineligibilityReason: null,
        warnings,
      };
    }
  }

  // ── BRANCH B: Pre-TRAIN death (before Jan 1, 2018) ───────────────────────

  if (!userElectsAmnesty) {
    if (estateFlags.taxFullyPaidBeforeMay2022 !== true) {
      warnings.push(
        'NOTE: If this estate has unpaid estate tax, the amnesty (RA 11213, as amended) may have been ' +
        'available. For net taxable estates above ₱1,250,000, the 6% amnesty rate produces lower base ' +
        'tax than the graduated pre-TRAIN schedule. Amnesty window closed June 14, 2025.',
      );
    }
    return {
      regime: 'PRE_TRAIN',
      deductionRules: 'PRE_TRAIN',
      track: null,
      displayDualPath: false,
      amnestyEligible: false,
      ineligibilityReason: null,
      warnings,
    };
  }

  // User elects amnesty for pre-TRAIN death
  const eligibility = checkAmnestyEligibility(decedent, estateFlags);

  if (!eligibility.eligible) {
    warnings.push(
      `Amnesty ineligible: ${describeIneligibility(eligibility.reason!)} Regular pre-TRAIN graduated rates apply.`,
    );
    return {
      regime: 'PRE_TRAIN',
      deductionRules: 'PRE_TRAIN',
      track: null,
      displayDualPath: false,
      amnestyEligible: false,
      ineligibilityReason: eligibility.reason,
      warnings,
    };
  }

  // Eligible for amnesty (pre-TRAIN death)
  warnings.push(
    '⚠ AMNESTY FILING WINDOW CLOSED: The estate tax amnesty (RA 11213, as amended by RA 11956) had a ' +
    'deadline of June 14, 2025. This computation is for HISTORICAL REFERENCE ONLY.',
  );
  return {
    regime: 'AMNESTY',
    deductionRules: 'PRE_TRAIN',
    track: eligibility.track,
    displayDualPath: true,
    amnestyEligible: true,
    ineligibilityReason: null,
    warnings,
  };
}

// ── Helper ────────────────────────────────────────────────────────────────────

function describeIneligibility(reason: AmnestyIneligibilityReason): string {
  switch (reason) {
    case 'DEATH_AFTER_COVERAGE_CUTOFF':
      return 'Decedent died after the amnesty coverage cutoff of May 31, 2022.';
    case 'TAX_ALREADY_PAID':
      return 'Estate tax was already fully paid before May 2022.';
    case 'PCGG_EXCLUSION':
      return 'Estate is subject to PCGG jurisdiction.';
    case 'RA3019_EXCLUSION':
      return 'Estate has RA 3019 (Anti-Graft) violations.';
    case 'RA9160_EXCLUSION':
      return 'Estate has RA 9160 (AMLA) violations.';
    case 'PENDING_COURT_CASE_EXCLUSION':
      return 'There is a pending court case filed before the amnesty act (Feb 14, 2019).';
    case 'UNEXPLAINED_WEALTH_EXCLUSION':
      return 'There are unexplained wealth cases.';
    case 'RPC_FELONY_EXCLUSION':
      return 'There are pending Revised Penal Code felony cases.';
    case 'USER_NOT_ELECTED':
      return 'User did not elect amnesty.';
    default:
      return 'Unknown ineligibility reason.';
  }
}
