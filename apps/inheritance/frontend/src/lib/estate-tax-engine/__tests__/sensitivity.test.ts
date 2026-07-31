/**
 * Tests for Sensitivity Analysis — Task 17
 */

import { describe, it, expect } from 'vitest';
import { runSensitivity } from '../sensitivity';
import { computeEstateTax } from '../pipeline';
import { createDefaultEstateTaxState } from '@/types/estate-tax';
import type { EstateTaxWizardState } from '@/types/estate-tax';

// ── Helper: build a minimal valid wizard state ──────────────────────────────

function makeWizardState(overrides: Partial<EstateTaxWizardState> = {}): EstateTaxWizardState {
  const base = createDefaultEstateTaxState();
  return {
    ...base,
    decedent: {
      ...base.decedent,
      name: 'Test Decedent',
      dateOfDeath: '2022-06-15',
      address: '123 Test St',
      ...overrides.decedent,
    },
    executor: {
      ...base.executor,
      name: 'Test Executor',
      ...overrides.executor,
    },
    realProperties: overrides.realProperties ?? base.realProperties,
    personalProperties: overrides.personalProperties ?? base.personalProperties,
    otherAssets: overrides.otherAssets ?? base.otherAssets,
    ordinaryDeductions: overrides.ordinaryDeductions ?? base.ordinaryDeductions,
    specialDeductions: overrides.specialDeductions ?? base.specialDeductions,
    filing: overrides.filing ?? base.filing,
  };
}

// Standard ₱20M estate (single, TRAIN era)
function makeLargeEstate(): EstateTaxWizardState {
  return makeWizardState({
    realProperties: [
      {
        id: 'rp1',
        titleNumber: 'T-001',
        taxDecNumber: 'TD-001',
        location: 'Metro Manila',
        lotArea: 300,
        improvementArea: null,
        classification: 'residential',
        fmvTaxDec: 2_000_000_000, // ₱20M
        fmvBirZonal: 1_800_000_000,
        ownership: 'exclusive',
        isFamilyHome: false,
        hasBarangayCert: false,
      },
    ],
  });
}

// ── Test 1: family home toggle ────────────────────────────────────────────────

describe('sensitivity: family home toggle', () => {
  it('toggling isFamilyHome on first residential property produces expected delta', () => {
    // State with family home already claimed — toggling off increases tax
    const state = makeWizardState({
      realProperties: [
        {
          id: 'rp1',
          titleNumber: 'T-001',
          taxDecNumber: 'TD-001',
          location: 'Metro Manila',
          lotArea: 300,
          improvementArea: null,
          classification: 'residential',
          fmvTaxDec: 2_000_000_000, // ₱20M
          fmvBirZonal: 1_800_000_000,
          ownership: 'exclusive',
          isFamilyHome: true, // currently claimed
          hasBarangayCert: true,
        },
      ],
    });

    const output = computeEstateTax(state);
    const results = runSensitivity(state, output);

    const familyHomeLever = results.find((r) => r.inputName === 'family-home');
    expect(familyHomeLever).toBeDefined();
    // Removing family home → more tax → positive delta (delta > 0 means worse)
    expect(familyHomeLever!.taxDelta).not.toBe(0);
  });

  it('toggling isFamilyHome when no residential property → no family-home lever', () => {
    const state = makeWizardState({
      realProperties: [
        {
          id: 'rp1',
          titleNumber: 'T-001',
          taxDecNumber: 'TD-001',
          location: 'Cebu',
          lotArea: 500,
          improvementArea: null,
          classification: 'commercial', // not residential
          fmvTaxDec: 1_000_000_000,
          fmvBirZonal: 900_000_000,
          ownership: 'exclusive',
          isFamilyHome: false,
          hasBarangayCert: false,
        },
      ],
    });

    const output = computeEstateTax(state);
    const results = runSensitivity(state, output);

    const familyHomeLever = results.find((r) => r.inputName === 'family-home');
    expect(familyHomeLever).toBeUndefined();
  });
});

// ── Test 2: results sorted by absolute delta descending ──────────────────────

describe('sensitivity: sorting', () => {
  it('results are sorted by absolute delta descending', () => {
    const state = makeLargeEstate();
    const output = computeEstateTax(state);
    const results = runSensitivity(state, output);

    for (let i = 0; i < results.length - 1; i++) {
      expect(Math.abs(results[i].taxDelta)).toBeGreaterThanOrEqual(
        Math.abs(results[i + 1].taxDelta),
      );
    }
  });
});

// ── Test 3: zero-impact levers excluded ──────────────────────────────────────

describe('sensitivity: zero-impact exclusion', () => {
  it('zero-impact levers are excluded from results', () => {
    const state = makeLargeEstate();
    const output = computeEstateTax(state);
    const results = runSensitivity(state, output);

    for (const result of results) {
      expect(result.taxDelta).not.toBe(0);
    }
  });
});

// ── Test 4: at least one result for non-trivial estate ───────────────────────

describe('sensitivity: non-trivial estate', () => {
  it('at least one result for a non-trivial estate', () => {
    const state = makeLargeEstate();
    const output = computeEstateTax(state);
    const results = runSensitivity(state, output);

    expect(results.length).toBeGreaterThan(0);
  });
});

// ── Test 5: amnesty lever ────────────────────────────────────────────────────

describe('sensitivity: amnesty lever', () => {
  it('amnesty lever appears when eligible (pre-TRAIN large estate)', () => {
    // PRE_TRAIN era, large estate → amnesty (6%) beats graduated rate
    const state = makeWizardState({
      decedent: {
        name: 'Test Decedent',
        dateOfDeath: '2015-06-15', // pre-TRAIN AND before amnesty cutoff
        address: '123 Test St',
        citizenship: 'Filipino',
        isNonResidentAlien: false,
        maritalStatus: 'single',
        propertyRegime: null,
        worldwideGrossEstate: null,
        worldwideELIT: null,
      },
      realProperties: [
        {
          id: 'rp1',
          titleNumber: 'T-001',
          taxDecNumber: 'TD-001',
          location: 'Manila',
          lotArea: 200,
          improvementArea: null,
          classification: 'residential',
          fmvTaxDec: 5_000_000_000, // ₱50M — graduated rate much higher
          fmvBirZonal: 4_500_000_000,
          ownership: 'exclusive',
          isFamilyHome: false,
          hasBarangayCert: false,
        },
      ],
      filing: {
        userElectsAmnesty: false,
        amnestyDeductionMode: 'standard',
        isAmended: false,
        hasExtension: false,
        isInstallment: false,
        isJudicialSettlement: false,
        hasPcggViolation: false,
        hasRa3019Violation: false,
        hasRa9160Violation: false,
        taxFullyPaidBeforeMay2022: false,
        priorReturnFiled: false,
        previouslyDeclaredNetEstate: null,
        hasPendingCourtCasePreAmnestyAct: false,
        hasUnexplainedWealthCases: false,
        hasPendingRPCFelonies: false,
      },
    });

    const output = computeEstateTax(state);
    const results = runSensitivity(state, output);

    const amnestyLever = results.find((r) => r.inputName === 'amnesty');
    expect(amnestyLever).toBeDefined();
    // Switching to amnesty saves money → negative delta (patched < current)
    expect(amnestyLever!.taxDelta).toBeLessThan(0);
  });
});

// ── Test 6: medical lever ────────────────────────────────────────────────────

describe('sensitivity: medical expenses lever', () => {
  it('TRAIN death: no medical-expenses lever, because the deduction is repealed', () => {
    const state = makeWizardState({
      realProperties: [
        {
          id: 'rp1',
          titleNumber: 'T-001',
          taxDecNumber: 'TD-001',
          location: 'Manila',
          lotArea: 200,
          improvementArea: null,
          classification: 'residential',
          fmvTaxDec: 2_000_000_000,
          fmvBirZonal: 1_800_000_000,
          ownership: 'exclusive',
          isFamilyHome: false,
          hasBarangayCert: false,
        },
      ],
      specialDeductions: {
        medicalExpenses: 30_000_000, // ₱300K claimed
        ra4917Benefits: 0,
        foreignTaxCreditClaims: [],
        standardDeduction: 500_000_000,
        familyHomeDeduction: 0,
      },
    });

    const output = computeEstateTax(state);
    const results = runSensitivity(state, output);

    // makeWizardState defaults dateOfDeath to '2022-06-15', a TRAIN-era death.
    // These assertions previously expected the lever to be defined with a
    // positive taxDelta. RA 10963 (TRAIN) Sec. 23 repealed the medical-expense
    // deduction, so the claimed ₱300K contributes nothing and the lever's delta
    // is 0, which leverMedicalExpenses reports as no lever at all.
    const medLever = results.find((r) => r.inputName === 'medical-expenses');
    expect(medLever).toBeUndefined();
    expect(output.specialDeductions.item37d_medical_expenses).toBe(0);
  });

  it('pre-TRAIN death: zeroing existing medical expenses produces positive delta', () => {
    const state = makeWizardState({
      decedent: { dateOfDeath: '2015-06-15' } as EstateTaxWizardState['decedent'],
      realProperties: [
        {
          id: 'rp1',
          titleNumber: 'T-001',
          taxDecNumber: 'TD-001',
          location: 'Manila',
          lotArea: 200,
          improvementArea: null,
          classification: 'residential',
          fmvTaxDec: 2_000_000_000,
          fmvBirZonal: 1_800_000_000,
          ownership: 'exclusive',
          isFamilyHome: false,
          hasBarangayCert: false,
        },
      ],
      specialDeductions: {
        medicalExpenses: 30_000_000, // ₱300K claimed
        ra4917Benefits: 0,
        foreignTaxCreditClaims: [],
        standardDeduction: 500_000_000,
        familyHomeDeduction: 0,
      },
    });

    const output = computeEstateTax(state);
    const results = runSensitivity(state, output);

    const medLever = results.find((r) => r.inputName === 'medical-expenses');
    expect(medLever).toBeDefined();
    // Zeroing medical expenses increases tax → positive delta
    expect(medLever!.taxDelta).toBeGreaterThan(0);
  });

  it('no medical expenses → no medical-expenses lever', () => {
    const state = makeWizardState({
      specialDeductions: {
        medicalExpenses: 0,
        ra4917Benefits: 0,
        foreignTaxCreditClaims: [],
        standardDeduction: 500_000_000,
        familyHomeDeduction: 0,
      },
    });

    const output = computeEstateTax(state);
    const results = runSensitivity(state, output);

    const medLever = results.find((r) => r.inputName === 'medical-expenses');
    expect(medLever).toBeUndefined();
  });
});
