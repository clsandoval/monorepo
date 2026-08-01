/**
 * Subject: `frontend/src/lib/fact-set.ts` — the single implementation of the
 * one-fact-set rule.
 *
 * These cases exist because the module decides whether a computation proceeds.
 * A verdict that wrongly returns `ok` would let a Form 1801 be produced from a
 * date the succession schedule does not share, which is the silent wrongness
 * this product exists to prevent. The three malformed-blob cases and the
 * whitespace pair are therefore not incidental coverage: each is a shape in
 * which a broken reader would report agreement it never established.
 */
import { describe, it, expect } from 'vitest';
import type { CaseRow } from '@/types';
import { createDefaultEstateTaxState } from '@/types/estate-tax';
import {
  FACT_SET_MISSING_DATE_MESSAGE,
  applyFactSet,
  assertOneFactSet,
  factSetFromCaseRow,
  storedTaxDateOfDeath,
} from '../fact-set';

function makeRow(overrides: Partial<CaseRow> = {}): CaseRow {
  return {
    id: 'case-1',
    org_id: 'org-1',
    user_id: 'user-1',
    client_id: null,
    title: 'Test Case',
    status: 'draft',
    input_json: null,
    output_json: null,
    tax_input_json: null,
    tax_output_json: null,
    comparison_input_json: null,
    comparison_output_json: null,
    comparison_ran_at: null,
    decedent_name: null,
    date_of_death: null,
    gross_estate: null,
    share_token: 'tok',
    share_enabled: false,
    notes_count: 0,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  } as CaseRow;
}

/** Build an `input_json`-shaped blob carrying only the fields under test. */
function spine(name: unknown, dateOfDeath: unknown): CaseRow['input_json'] {
  return { decedent: { name, date_of_death: dateOfDeath } } as CaseRow['input_json'];
}

describe('factSetFromCaseRow', () => {
  it('(1) reads the decedent name and date of death from a populated input_json', () => {
    const row = makeRow({ input_json: spine('Juan dela Cruz', '2020-03-15') });
    expect(factSetFromCaseRow(row)).toEqual({
      decedentName: 'Juan dela Cruz',
      dateOfDeath: '2020-03-15',
    });
  });

  it('(2) returns empty strings for both fields when input_json is null', () => {
    expect(factSetFromCaseRow(makeRow({ input_json: null }))).toEqual({
      decedentName: '',
      dateOfDeath: '',
    });
  });

  it('(3) trims surrounding whitespace off both fields', () => {
    const row = makeRow({ input_json: spine('  Juan dela Cruz  ', '  2020-03-15  ') });
    expect(factSetFromCaseRow(row)).toEqual({
      decedentName: 'Juan dela Cruz',
      dateOfDeath: '2020-03-15',
    });
  });
});

describe('storedTaxDateOfDeath', () => {
  it('(4) reads the date of death from a populated tax_input_json', () => {
    const row = makeRow({ tax_input_json: { decedent: { dateOfDeath: '2020-03-15' } } });
    expect(storedTaxDateOfDeath(row)).toBe('2020-03-15');
  });

  it('(5) returns an empty string when tax_input_json is null', () => {
    expect(storedTaxDateOfDeath(makeRow({ tax_input_json: null }))).toBe('');
  });

  it('(6) returns an empty string for an empty tax_input_json object', () => {
    expect(storedTaxDateOfDeath(makeRow({ tax_input_json: {} }))).toBe('');
  });

  it('(7) returns an empty string when decedent is null, and does not throw', () => {
    expect(() => storedTaxDateOfDeath(makeRow({ tax_input_json: { decedent: null } }))).not.toThrow();
    expect(storedTaxDateOfDeath(makeRow({ tax_input_json: { decedent: null } }))).toBe('');
  });

  it('(8) returns an empty string when the stored value is a number rather than a string', () => {
    expect(storedTaxDateOfDeath(makeRow({ tax_input_json: { decedent: { dateOfDeath: 5 } } }))).toBe('');
  });
});

describe('assertOneFactSet', () => {
  it('(9) refuses with missing-date when the succession date is absent', () => {
    const verdict = assertOneFactSet(makeRow({ input_json: spine('Juan', '') }));
    expect(verdict.kind).toBe('missing-date');
    expect(verdict).toMatchObject({ message: FACT_SET_MISSING_DATE_MESSAGE });
  });

  it('(10) prefers missing-date over disagreement when only the tax side has a date', () => {
    const verdict = assertOneFactSet(
      makeRow({
        input_json: spine('Juan', ''),
        tax_input_json: { decedent: { dateOfDeath: '2020-01-01' } },
      }),
    );
    expect(verdict.kind).toBe('missing-date');
  });

  it('(11) returns ok when the tax side has no date — absence is not disagreement', () => {
    const verdict = assertOneFactSet(
      makeRow({ input_json: spine('Juan', '2020-01-01'), tax_input_json: null }),
    );
    expect(verdict).toEqual({
      kind: 'ok',
      factSet: { decedentName: 'Juan', dateOfDeath: '2020-01-01' },
    });
  });

  it('(12) returns ok when both dates are equal', () => {
    const verdict = assertOneFactSet(
      makeRow({
        input_json: spine('Juan', '2020-01-01'),
        tax_input_json: { decedent: { dateOfDeath: '2020-01-01' } },
      }),
    );
    expect(verdict.kind).toBe('ok');
  });

  it('(13) returns ok when the two dates differ only by surrounding whitespace', () => {
    const verdict = assertOneFactSet(
      makeRow({
        input_json: spine('Juan', ' 2020-01-01 '),
        tax_input_json: { decedent: { dateOfDeath: '2020-01-01' } },
      }),
    );
    expect(verdict.kind).toBe('ok');
  });

  it('(14) refuses with disagreement carrying both values, and a message printing both', () => {
    const verdict = assertOneFactSet(
      makeRow({
        input_json: spine('Juan', '2020-01-01'),
        tax_input_json: { decedent: { dateOfDeath: '2017-12-31' } },
      }),
    );
    expect(verdict.kind).toBe('disagreement');
    if (verdict.kind !== 'disagreement') throw new Error('expected disagreement');
    expect(verdict.succession).toBe('2020-01-01');
    expect(verdict.tax).toBe('2017-12-31');
    expect(verdict.message).toContain('2020-01-01');
    expect(verdict.message).toContain('2017-12-31');
  });
});

describe('applyFactSet', () => {
  it('(15) writes the shared date of death onto the tax wizard state', () => {
    const state = createDefaultEstateTaxState();
    const next = applyFactSet(state, { decedentName: 'Juan', dateOfDeath: '2020-01-01' });
    expect(next.decedent.dateOfDeath).toBe('2020-01-01');
  });

  it('(16) leaves name, address, citizenship and maritalStatus byte-identical', () => {
    const state = createDefaultEstateTaxState();
    state.decedent.name = 'Tax Form Name';
    state.decedent.address = 'Quezon City';
    state.decedent.citizenship = 'Filipino';
    state.decedent.maritalStatus = 'married';

    const next = applyFactSet(state, { decedentName: 'Different Name', dateOfDeath: '2020-01-01' });

    expect(next.decedent.name).toBe('Tax Form Name');
    expect(next.decedent.address).toBe('Quezon City');
    expect(next.decedent.citizenship).toBe('Filipino');
    expect(next.decedent.maritalStatus).toBe('married');
  });

  it('(17) does not mutate the input state', () => {
    const state = createDefaultEstateTaxState();
    applyFactSet(state, { decedentName: 'Juan', dateOfDeath: '2020-01-01' });
    expect(state.decedent.dateOfDeath).toBe('');
  });
});
