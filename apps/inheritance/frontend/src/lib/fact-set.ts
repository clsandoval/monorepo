/**
 * Fact Set — the single implementation of the one-fact-set rule.
 *
 * A case has one fact set, not two. The date of death drives the succession
 * schedule and the estate-tax return alike: it selects PRE_TRAIN vs TRAIN
 * deduction rules, it decides whether the repealed medical deduction applies,
 * and it is the first line of both the Deed of Extrajudicial Settlement and
 * BIR Form 1801. A product whose whole claim is defensibility cannot hold two
 * independently-editable copies of it.
 *
 * **The spine is `cases.input_json.decedent.date_of_death`.** That is the value
 * a lawyer enters, on the Decedent step of the succession wizard. The
 * `cases.date_of_death` *column* is a projection of it, written alongside
 * `input_json` by `lib/cases.ts`; a projection is a convenience for listing
 * queries, not an authority, and nothing in this module reads it.
 *
 * **A disagreement is refused, never reconciled.** When the stored estate-tax
 * fact set carries a different date from the spine, this module returns a
 * refusal carrying *both* values. It does not overwrite one with the other:
 * an overwrite destroys the only evidence that the case ever disagreed, and
 * silently produces a return keyed on a date the schedule of shares does not
 * share. Absence, by contrast, is not disagreement — an empty tax-side date is
 * filled from the spine, because there is nothing to contradict.
 *
 * Both values are ISO-8601 `YYYY-MM-DD` strings, compared as trimmed strings.
 * There is no date parsing and no timezone handling here, matching the
 * treatment `types/estate-tax.ts`'s `getDeductionRules` and the Rust engine's
 * flag logic already give them.
 *
 * This module is the *only* place these rules live. Routes, components and the
 * gate runner import it; none of them restates any part of it. The gate that
 * enforces the rule across the codebase is
 * `frontend/scripts/check-one-fact-set.ts`.
 */
import type { CaseRow } from '@/types';
import type { EstateTaxWizardState } from '@/types/estate-tax';

// ── Types ───────────────────────────────────────────────────────────────────

/**
 * The facts that cross the boundary between the succession engine and the
 * estate-tax engine. Both fields are trimmed; `''` means absent.
 */
export interface CaseFactSet {
  decedentName: string;
  dateOfDeath: string;
}

/**
 * The verdict on whether a case may be computed from one fact set.
 *
 * `missing-date` and `disagreement` are refusals: the caller must decline to
 * compute and show the message. Only `ok` carries a fact set.
 */
export type FactSetVerdict =
  | { kind: 'ok'; factSet: CaseFactSet }
  | { kind: 'missing-date'; message: string }
  | { kind: 'disagreement'; succession: string; tax: string; message: string };

// ── Messages ────────────────────────────────────────────────────────────────

export const FACT_SET_MISSING_DATE_MESSAGE =
  'Date of death has not been entered for this case. Enter it once on the Decedent step of the succession wizard; the estate-tax return reads it from there.';

/**
 * The refusal shown when a case holds two different dates of death. Both values
 * are interpolated: a refusal that does not print what it found is not
 * actionable, and FACT-04 requires the reader to see the conflict itself.
 */
export function factSetConflictMessage(succession: string, tax: string): string {
  return `This case holds two different dates of death. The succession fact set says ${succession} and the stored estate-tax fact set says ${tax}. The estate tax will not be computed until they are the same. Correct the date on the Decedent step of the succession wizard.`;
}

// ── Reading ─────────────────────────────────────────────────────────────────

/**
 * Walk a key path through an unknown-shaped JSONB blob and return the trimmed
 * terminal string, or `''` for any absent or non-string terminal.
 *
 * This never throws. A malformed blob is absence, not an exception: a caller
 * that surfaced a `TypeError` here would show a generic error where the product
 * owes the lawyer a specific refusal.
 */
function readTrimmedString(value: unknown, ...keys: string[]): string {
  let cursor: unknown = value;
  for (const key of keys) {
    if (typeof cursor !== 'object' || cursor === null) return '';
    cursor = (cursor as Record<string, unknown>)[key];
  }
  return typeof cursor === 'string' ? cursor.trim() : '';
}

/** The case's fact set, read from the spine. */
export function factSetFromCaseRow(row: CaseRow): CaseFactSet {
  return {
    decedentName: readTrimmedString(row.input_json, 'decedent', 'name'),
    dateOfDeath: readTrimmedString(row.input_json, 'decedent', 'date_of_death'),
  };
}

/**
 * The date of death held by the *stored* estate-tax wizard state — the second
 * copy this phase exists to reconcile. `''` when absent or malformed.
 */
export function storedTaxDateOfDeath(row: CaseRow): string {
  return readTrimmedString(row.tax_input_json, 'decedent', 'dateOfDeath');
}

// ── The rule ────────────────────────────────────────────────────────────────

/**
 * Decide whether this case may be computed from one fact set.
 *
 * Evaluated in this order and no other:
 *   1. No succession date → refuse. There is no spine to read from.
 *   2. No stored tax date → ok. Absence is filled, not refused.
 *   3. Stored tax date differs → refuse, carrying both values.
 *   4. Otherwise → ok.
 */
export function assertOneFactSet(row: CaseRow): FactSetVerdict {
  const factSet = factSetFromCaseRow(row);

  if (factSet.dateOfDeath === '') {
    return { kind: 'missing-date', message: FACT_SET_MISSING_DATE_MESSAGE };
  }

  const tax = storedTaxDateOfDeath(row);
  if (tax === '') {
    return { kind: 'ok', factSet };
  }

  if (tax !== factSet.dateOfDeath) {
    return {
      kind: 'disagreement',
      succession: factSet.dateOfDeath,
      tax,
      message: factSetConflictMessage(factSet.dateOfDeath, tax),
    };
  }

  return { kind: 'ok', factSet };
}

// ── Applying ────────────────────────────────────────────────────────────────

/**
 * Adopt the shared date of death into the estate-tax wizard state.
 *
 * Writes **only** `decedent.dateOfDeath`. `name`, `address`, `citizenship`,
 * `maritalStatus` and `propertyRegime` are BIR-form fields the lawyer fills on
 * the tax tab; overwriting them at every load would discard entered work. The
 * decedent's *name* reaches the tax path as `CaseFactSet.decedentName`, for
 * display.
 *
 * Returns a new object. The input is never mutated — the caller holds it in
 * React state.
 */
export function applyFactSet(
  state: EstateTaxWizardState,
  factSet: CaseFactSet,
): EstateTaxWizardState {
  return {
    ...state,
    decedent: { ...state.decedent, dateOfDeath: factSet.dateOfDeath },
  };
}
