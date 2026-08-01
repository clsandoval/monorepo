/**
 * Tests for Deduction Advisor — Task 16
 */

import { describe, it, expect } from 'vitest';
import { runAdvisor } from '../advisor';
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
      dateOfDeath: '2020-06-15',
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

// ── Test 1: unclaimed-family-home ────────────────────────────────────────────

describe('advisor: unclaimed-family-home', () => {
  it('residential property exists with no family home → suggestion produced with savings > 0', () => {
    const state = makeWizardState({
      realProperties: [
        {
          id: 'rp1',
          titleNumber: 'T-001',
          taxDecNumber: 'TD-001',
          location: 'Metro Manila',
          lotArea: 200,
          improvementArea: null,
          classification: 'residential',
          fmvTaxDec: 1_500_000_000, // ₱15M
          fmvBirZonal: 1_400_000_000,
          ownership: 'exclusive',
          isFamilyHome: false,
          hasBarangayCert: false,
        },
      ],
    });

    const output = computeEstateTax(state);
    const suggestions = runAdvisor(state, output);

    const familyHomeSuggestion = suggestions.find((s) => s.id === 'unclaimed-family-home');
    expect(familyHomeSuggestion).toBeDefined();
    expect(familyHomeSuggestion!.estimatedSavings).toBeGreaterThan(0);
  });

  it('family home already claimed → no unclaimed-family-home suggestion', () => {
    const state = makeWizardState({
      realProperties: [
        {
          id: 'rp1',
          titleNumber: 'T-001',
          taxDecNumber: 'TD-001',
          location: 'Metro Manila',
          lotArea: 200,
          improvementArea: null,
          classification: 'residential',
          fmvTaxDec: 1_500_000_000, // ₱15M
          fmvBirZonal: 1_400_000_000,
          ownership: 'exclusive',
          isFamilyHome: true,   // already claimed
          hasBarangayCert: true,
        },
      ],
    });

    const output = computeEstateTax(state);
    const suggestions = runAdvisor(state, output);

    const familyHomeSuggestion = suggestions.find((s) => s.id === 'unclaimed-family-home');
    expect(familyHomeSuggestion).toBeUndefined();
  });

  it('no residential property → no unclaimed-family-home suggestion', () => {
    const state = makeWizardState({
      realProperties: [
        {
          id: 'rp1',
          titleNumber: 'T-001',
          taxDecNumber: 'TD-001',
          location: 'Cebu',
          lotArea: 500,
          improvementArea: null,
          classification: 'commercial', // commercial, not residential
          fmvTaxDec: 500_000_000,
          fmvBirZonal: 400_000_000,
          ownership: 'exclusive',
          isFamilyHome: false,
          hasBarangayCert: false,
        },
      ],
    });

    const output = computeEstateTax(state);
    const suggestions = runAdvisor(state, output);

    const familyHomeSuggestion = suggestions.find((s) => s.id === 'unclaimed-family-home');
    expect(familyHomeSuggestion).toBeUndefined();
  });
});

// ── Test 2: amnesty-eligible ─────────────────────────────────────────────────

describe('advisor: amnesty-eligible', () => {
  it('death before 2022-06-01, amnesty not elected → suggestion produced', () => {
    // Use a PRE-TRAIN date (before 2018-01-01) so that amnesty (6% flat) beats
    // the graduated PRE_TRAIN rate for large estates.
    const state = makeWizardState({
      decedent: {
        name: 'Test Decedent',
        dateOfDeath: '2015-01-01', // pre-TRAIN AND before amnesty cutoff
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
          // ₱50M — large enough that PRE_TRAIN graduated rate exceeds amnesty 6%
          fmvTaxDec: 5_000_000_000,
          fmvBirZonal: 4_500_000_000,
          ownership: 'exclusive',
          isFamilyHome: false,
          hasBarangayCert: false,
        },
      ],
      filing: {
        assumedFilingDate: '',
        userElectsAmnesty: false, // not elected
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
    const suggestions = runAdvisor(state, output);

    const amnestySuggestion = suggestions.find((s) => s.id === 'amnesty-eligible');
    expect(amnestySuggestion).toBeDefined();
  });

  it('amnesty already elected → no amnesty suggestion', () => {
    const state = makeWizardState({
      decedent: {
        name: 'Test Decedent',
        dateOfDeath: '2020-01-01',
        address: '123 Test St',
        citizenship: 'Filipino',
        isNonResidentAlien: false,
        maritalStatus: 'single',
        propertyRegime: null,
        worldwideGrossEstate: null,
        worldwideELIT: null,
      },
      filing: {
        assumedFilingDate: '',
        userElectsAmnesty: true, // already elected
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
    const suggestions = runAdvisor(state, output);

    const amnestySuggestion = suggestions.find((s) => s.id === 'amnesty-eligible');
    expect(amnestySuggestion).toBeUndefined();
  });

  it('death after 2022-05-31 → no amnesty suggestion', () => {
    const state = makeWizardState({
      decedent: {
        name: 'Test Decedent',
        dateOfDeath: '2023-01-01', // after amnesty cutoff
        address: '123 Test St',
        citizenship: 'Filipino',
        isNonResidentAlien: false,
        maritalStatus: 'single',
        propertyRegime: null,
        worldwideGrossEstate: null,
        worldwideELIT: null,
      },
      filing: {
        assumedFilingDate: '',
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
    const suggestions = runAdvisor(state, output);

    const amnestySuggestion = suggestions.find((s) => s.id === 'amnesty-eligible');
    expect(amnestySuggestion).toBeUndefined();
  });
});

// ── Test 3: no-medical-claimed ────────────────────────────────────────────────

describe('advisor: no-medical-claimed', () => {
  it('TRAIN-era death with no medical expenses → no suggestion (deduction repealed)', () => {
    const state = makeWizardState({
      decedent: {
        name: 'Test Decedent',
        dateOfDeath: '2022-01-01',
        address: '123 Test St',
        citizenship: 'Filipino',
        isNonResidentAlien: false,
        maritalStatus: 'married',
        propertyRegime: 'ACP',
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
          fmvTaxDec: 2_000_000_000, // ₱20M — enough to owe tax
          fmvBirZonal: 1_800_000_000,
          ownership: 'exclusive',
          isFamilyHome: false,
          hasBarangayCert: false,
        },
      ],
      specialDeductions: {
        medicalExpenses: 0, // none claimed
        ra4917Benefits: 0,
        foreignTaxCreditClaims: [],
        standardDeduction: 500_000_000,
        familyHomeDeduction: 0,
      },
    });

    const output = computeEstateTax(state);
    const suggestions = runAdvisor(state, output);

    // This assertion previously expected the suggestion to be defined with
    // positive savings. RA 10963 (TRAIN) Sec. 23 repealed the medical-expense
    // deduction for deaths on or after 2018-01-01, so recommending it for a
    // 2022 death was recommending a deduction that no longer exists.
    const medSuggestion = suggestions.find((s) => s.id === 'no-medical-claimed');
    expect(medSuggestion).toBeUndefined();
  });

  it('pre-TRAIN death with no medical expenses → no-medical-claimed suggestion', () => {
    const state = makeWizardState({
      decedent: {
        name: 'Test Decedent',
        dateOfDeath: '2015-03-01',
        address: '123 Test St',
        citizenship: 'Filipino',
        isNonResidentAlien: false,
        maritalStatus: 'married',
        propertyRegime: 'ACP',
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
          fmvTaxDec: 2_000_000_000, // ₱20M — enough to owe tax
          fmvBirZonal: 1_800_000_000,
          ownership: 'exclusive',
          isFamilyHome: false,
          hasBarangayCert: false,
        },
      ],
      specialDeductions: {
        medicalExpenses: 0, // none claimed
        ra4917Benefits: 0,
        foreignTaxCreditClaims: [],
        standardDeduction: 500_000_000,
        familyHomeDeduction: 0,
      },
    });

    const output = computeEstateTax(state);
    const suggestions = runAdvisor(state, output);

    const medSuggestion = suggestions.find((s) => s.id === 'no-medical-claimed');
    expect(medSuggestion).toBeDefined();
    expect(medSuggestion!.estimatedSavings).toBeGreaterThan(0);
  });

  it('medical expenses already claimed → no no-medical-claimed suggestion', () => {
    const state = makeWizardState({
      specialDeductions: {
        medicalExpenses: 30_000_000, // already claimed
        ra4917Benefits: 0,
        foreignTaxCreditClaims: [],
        standardDeduction: 500_000_000,
        familyHomeDeduction: 0,
      },
    });

    const output = computeEstateTax(state);
    const suggestions = runAdvisor(state, output);

    const medSuggestion = suggestions.find((s) => s.id === 'no-medical-claimed');
    expect(medSuggestion).toBeUndefined();
  });
});

// ── Test 4: property-regime-optimization ─────────────────────────────────────

describe('advisor: property-regime-optimization', () => {
  it('regime already set → no property-regime-optimization suggestion', () => {
    const state = makeWizardState({
      decedent: {
        name: 'Test Decedent',
        dateOfDeath: '2022-01-01',
        address: '123 Test St',
        citizenship: 'Filipino',
        isNonResidentAlien: false,
        maritalStatus: 'married',
        propertyRegime: 'ACP', // already set — rule should not fire
        worldwideGrossEstate: null,
        worldwideELIT: null,
      },
    });

    const output = computeEstateTax(state);
    const suggestions = runAdvisor(state, output);

    const regimeSuggestion = suggestions.find((s) => s.id === 'property-regime-optimization');
    expect(regimeSuggestion).toBeUndefined();
  });

  it('single decedent → no property-regime-optimization suggestion', () => {
    const state = makeWizardState({
      decedent: {
        name: 'Test Decedent',
        dateOfDeath: '2022-01-01',
        address: '123 Test St',
        citizenship: 'Filipino',
        isNonResidentAlien: false,
        maritalStatus: 'single', // not married
        propertyRegime: null,
        worldwideGrossEstate: null,
        worldwideELIT: null,
      },
    });

    const output = computeEstateTax(state);
    const suggestions = runAdvisor(state, output);

    const regimeSuggestion = suggestions.find((s) => s.id === 'property-regime-optimization');
    expect(regimeSuggestion).toBeUndefined();
  });
});

// ── Test 5: sorting ──────────────────────────────────────────────────────────

describe('advisor: sorting', () => {
  it('suggestions are sorted by savings descending', () => {
    const state = makeWizardState({
      decedent: {
        name: 'Test Decedent',
        dateOfDeath: '2020-06-15', // amnesty eligible
        address: '123 Test St',
        citizenship: 'Filipino',
        isNonResidentAlien: false,
        maritalStatus: 'married',
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
          fmvTaxDec: 2_000_000_000,
          fmvBirZonal: 1_800_000_000,
          ownership: 'conjugal',
          isFamilyHome: false,
          hasBarangayCert: false,
        },
      ],
      specialDeductions: {
        medicalExpenses: 0,
        ra4917Benefits: 0,
        foreignTaxCreditClaims: [],
        standardDeduction: 500_000_000,
        familyHomeDeduction: 0,
      },
      filing: {
        assumedFilingDate: '',
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
    const suggestions = runAdvisor(state, output);

    // Must have at least 2 suggestions to verify sorting
    if (suggestions.length >= 2) {
      for (let i = 0; i < suggestions.length - 1; i++) {
        expect(suggestions[i].estimatedSavings).toBeGreaterThanOrEqual(
          suggestions[i + 1].estimatedSavings,
        );
      }
    }
    // Always passes — verifies at least one of our core rules fired
    expect(suggestions.length).toBeGreaterThan(0);
  });
});

// ── Test 6: empty suggestions when everything is optimal ─────────────────────

describe('advisor: empty suggestions when everything is optimal', () => {
  it('empty estate → no suggestions', () => {
    // Default state with no assets → 0 tax → no savings possible
    const state = makeWizardState();
    const output = computeEstateTax(state);
    const suggestions = runAdvisor(state, output);

    // No suggestions with actual savings when there's nothing to optimize
    const withSavings = suggestions.filter((s) => s.estimatedSavings > 0);
    expect(withSavings.length).toBe(0);
  });
});
