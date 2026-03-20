/**
 * Estate Tax Engine — Input Validation (spec §6 error table)
 *
 * Returns an array of ValidationError objects. Empty array = valid input.
 * All monetary values in centavos (integer).
 */

import type { EngineInput, ValidationError } from './types';

/** Today's date as ISO string for future-date checks. */
const TODAY = new Date().toISOString().slice(0, 10);
const IMPLAUSIBLE_DATE = '1901-01-01';

/**
 * Validate the top-level engine input.
 * Returns an array of ValidationError. Empty array = valid.
 */
export function validateInput(input: EngineInput): ValidationError[] {
  const errors: ValidationError[] = [];

  const { decedent, estateFlags, realProperties } = input;
  const { dateOfDeath } = decedent;

  // ── Date of death checks ──────────────────────────────────────────────────

  // ERR_DATE_REQUIRED — dateOfDeath empty/missing
  if (!dateOfDeath || dateOfDeath.trim() === '') {
    errors.push({
      code: 'ERR_DATE_REQUIRED',
      message: 'Date of death is required.',
    });
    // Cannot proceed with date-dependent checks if missing
    return errors;
  }

  // ERR_DATE_FUTURE — dateOfDeath after today
  if (dateOfDeath > TODAY) {
    errors.push({
      code: 'ERR_DATE_FUTURE',
      message: 'Date of death cannot be in the future.',
    });
  }

  // ERR_DATE_IMPLAUSIBLE — dateOfDeath before 1901-01-01
  if (dateOfDeath < IMPLAUSIBLE_DATE) {
    errors.push({
      code: 'ERR_DATE_IMPLAUSIBLE',
      message: 'Date of death appears implausible. Please verify.',
    });
  }

  // ── Amnesty / Track B checks ──────────────────────────────────────────────

  // ERR_TRACK_B_MISSING — priorReturnFiled=true but previouslyDeclaredNetEstate missing/null
  if (estateFlags.priorReturnFiled === true) {
    const prev = estateFlags.previouslyDeclaredNetEstate;
    if (prev === undefined || prev === null) {
      errors.push({
        code: 'ERR_TRACK_B_MISSING',
        message: 'For Track B amnesty, enter the net estate from the prior return.',
      });
    }
  }

  // ERR_PRIOR_NEGATIVE — previouslyDeclaredNetEstate < 0
  if (
    estateFlags.previouslyDeclaredNetEstate !== undefined &&
    estateFlags.previouslyDeclaredNetEstate !== null &&
    estateFlags.previouslyDeclaredNetEstate < 0
  ) {
    errors.push({
      code: 'ERR_PRIOR_NEGATIVE',
      message: 'Previously declared net estate cannot be negative.',
    });
  }

  // ── Asset checks ──────────────────────────────────────────────────────────

  // ERR_MULTIPLE_FAMILY_HOMES — more than one real property with isFamilyHome=true
  const familyHomes = realProperties.filter((p) => p.isDesignatedFamilyHome);
  if (familyHomes.length > 1) {
    errors.push({
      code: 'ERR_MULTIPLE_FAMILY_HOMES',
      message: 'Only one property may be designated as the family home.',
    });
  }

  // ── NRA-specific checks ───────────────────────────────────────────────────

  if (decedent.isNRA) {
    const worldwideGrossEstate = decedent.worldwideGrossEstate;

    // ERR_WORLDWIDE_ESTATE_ZERO — NRA + worldwideGrossEstate = 0 or null
    if (worldwideGrossEstate === undefined || worldwideGrossEstate === null || worldwideGrossEstate === 0) {
      errors.push({
        code: 'ERR_WORLDWIDE_ESTATE_ZERO',
        message: 'Non-resident alien decedents must provide a worldwide gross estate greater than zero.',
      });
    } else {
      // ERR_PH_EXCEEDS_WORLDWIDE — NRA + PH gross estate > worldwideGrossEstate
      // Rough check: sum all asset FMVs in the input
      const phGrossEstimate = computeRoughPhGrossEstate(input);
      if (phGrossEstimate > worldwideGrossEstate) {
        errors.push({
          code: 'ERR_PH_EXCEEDS_WORLDWIDE',
          message: 'Philippine gross estate cannot exceed the worldwide gross estate.',
        });
      }
    }
  }

  return errors;
}

/**
 * Compute a rough sum of all PH asset FMVs in the input.
 * Used only for ERR_PH_EXCEEDS_WORLDWIDE validation — not the authoritative gross estate.
 */
function computeRoughPhGrossEstate(input: EngineInput): number {
  let total = 0;

  for (const p of input.realProperties) {
    total += Math.max(p.fmvTaxDeclaration, p.fmvBir);
  }

  for (const p of input.personalPropertiesFinancial) {
    total += p.fmv;
  }

  for (const p of input.personalPropertiesTangible) {
    total += p.fmv;
  }

  for (const t of input.taxableTransfers) {
    total += Math.max(0, t.fmvAtDeath - t.considerationReceived);
  }

  for (const b of input.businessInterests) {
    total += Math.max(0, b.netEquity);
  }

  return total;
}
