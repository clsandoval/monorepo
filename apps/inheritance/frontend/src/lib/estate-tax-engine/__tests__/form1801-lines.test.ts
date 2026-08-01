/**
 * Tests for the Form 1801 line model — spec §17.
 *
 * Source of truth: specs/estate-tax-engine-spec.md §17 Form 1801 Output
 * Contract, whose item assignment decides which engine value belongs on which
 * item cell.
 *
 * Every `output` here is produced by calling the REAL `computeEstateTax`. A
 * hand-written `EstateTaxFullOutput` literal is deliberately never used: it
 * would let this module keep passing against a shape the engine no longer
 * produces, which is the failure mode the Item-37A defect already demonstrated.
 */

import { describe, it, expect } from 'vitest';
import { computeEstateTax } from '../pipeline';
import { buildForm1801Lines, reconcileForm1801Lines, FORM1801_LINE_IDS } from '../form1801-lines';
import { createDefaultEstateTaxState } from '@/types/estate-tax';
import type { EstateTaxWizardState } from '@/types/estate-tax';

// ── Fact sets ───────────────────────────────────────────────────────────────

function baseState(dateOfDeath: string): EstateTaxWizardState {
  const base = createDefaultEstateTaxState();
  return {
    ...base,
    decedent: {
      ...base.decedent,
      name: 'Test Decedent',
      dateOfDeath,
      address: '123 Test St',
    },
    executor: { ...base.executor, name: 'Test Executor' },
    realProperties: [
      {
        id: 'rp1',
        titleNumber: 'T-123456',
        taxDecNumber: 'TD-1',
        location: 'Quezon City',
        lotArea: 250,
        improvementArea: null,
        classification: 'residential',
        fmvTaxDec: 8_000_000,
        fmvBirZonal: 9_000_000,
        ownership: 'exclusive',
        isFamilyHome: false,
        hasBarangayCert: false,
      },
    ],
  };
}

/** Fact set A — TRAIN. */
function factSetA() {
  return computeEstateTax(baseState('2020-06-15'));
}

/** Fact set B — pre-TRAIN, with funeral and judicial expenses entered. */
function factSetB() {
  const base = baseState('2015-06-15');
  return computeEstateTax({
    ...base,
    ordinaryDeductions: {
      ...base.ordinaryDeductions,
      funeralExpenses: 100_000,
      judicialAdminExpenses: 50_000,
    },
  });
}

// ── Cases ───────────────────────────────────────────────────────────────────

describe('buildForm1801Lines', () => {
  it('produces exactly the declared id set, in order', () => {
    const { lines } = buildForm1801Lines(factSetA());

    expect(lines.map((l) => l.id)).toEqual([...FORM1801_LINE_IDS]);
  });

  it('puts the ₱5,000,000 standard deduction on Item 37A', () => {
    const output = factSetA();
    const { lines } = buildForm1801Lines(output);

    // Guard: prove the engine actually applied a deduction before asserting the
    // row carries it, so this cannot pass on an empty estate.
    expect(output.specialDeductions.standardDeduction).toBe(500_000_000);

    const row = lines.find((l) => l.id === 'sp-standard-deduction');
    expect(row?.item).toBe('37A');
    expect(row?.total).toBe(500_000_000);
  });

  it('the six special rows sum to the engine total — the shortfall 21-01 measured is closed', () => {
    const output = factSetA();
    const { lines } = buildForm1801Lines(output);

    expect(output.specialDeductions.total).toBe(500_000_000);

    const specialRows = lines.filter((l) => l.id.startsWith('sp-') && l.id !== 'sp-total');
    expect(specialRows).toHaveLength(6);

    const summed = specialRows.reduce((acc, l) => acc + (l.total ?? 0), 0);
    expect(summed).toBe(output.specialDeductions.total);
  });

  it('reconciles on fact set A with no mismatches', () => {
    const output = factSetA();
    const { lines } = buildForm1801Lines(output);

    expect(reconcileForm1801Lines(lines, output)).toEqual([]);
  });

  it('reconciles the ordinary rows per column on fact set B', () => {
    const output = factSetB();
    const { lines } = buildForm1801Lines(output);

    expect(reconcileForm1801Lines(lines, output)).toEqual([]);
  });

  it('every one of the 33 lines carries a non-empty authority', () => {
    const { lines } = buildForm1801Lines(factSetA());

    expect(lines).toHaveLength(33);
    for (const line of lines) {
      expect(typeof line.authority).toBe('string');
      expect(line.authority).not.toBe('');
    }
  });

  it('reads the penalty authorities from the engine rather than constructing them', () => {
    const output = factSetA();
    const { lines } = buildForm1801Lines(output);

    const surcharge = lines.find((l) => l.id === 'penalty-surcharge');
    const interest = lines.find((l) => l.id === 'penalty-interest');

    expect(surcharge?.authority).toBe(output.penalties.lines[0].authority);
    expect(interest?.authority).toBe(output.penalties.lines[1].authority);
  });

  it('no declined line carries a figure, and no declined wording looks like a zero', () => {
    const { lines } = buildForm1801Lines(factSetA());

    const declined = lines.filter((l) => typeof l.displayTotal === 'string');
    expect(declined.length).toBeGreaterThan(0);

    for (const line of declined) {
      expect(line.total).toBeNull();
      expect(line.displayTotal).not.toContain('0.00');
    }
  });

  it('the two historically-misnamed bridge rows are gone', () => {
    const { lines } = buildForm1801Lines(factSetA());

    for (const line of lines) {
      expect(line.label).not.toContain('Total Deductions');
    }

    const item40 = lines.filter((l) => l.item === '40');
    expect(item40.length).toBeGreaterThan(0);
    for (const line of item40) {
      expect(line.label).not.toContain('Gross');
    }
  });

  it('raises the duplicate-schedule warning on fact set B and not on fact set A', () => {
    const warningsB = buildForm1801Lines(factSetB()).warnings;
    const warningsA = buildForm1801Lines(factSetA()).warnings;

    const duplicateB = warningsB.filter((w) => w.includes('SAME EXPENSE ON TWO SCHEDULES'));
    expect(duplicateB.length).toBeGreaterThan(0);
    expect(duplicateB.join(' ')).toContain('Schedule 5');
    expect(duplicateB.join(' ')).toContain('Schedule 6');

    expect(warningsA.filter((w) => w.includes('SAME EXPENSE ON TWO SCHEDULES'))).toEqual([]);
  });

  it('the reconciler can fail — removing Item 37A reports the exact gap', () => {
    const output = factSetA();
    const { lines } = buildForm1801Lines(output);

    const withoutStandardDeduction = lines.filter((l) => l.id !== 'sp-standard-deduction');
    const mismatches = reconcileForm1801Lines(withoutStandardDeduction, output);

    expect(mismatches.length).toBeGreaterThan(0);
    expect(mismatches.join(' ')).toContain('500000000');
  });
});
