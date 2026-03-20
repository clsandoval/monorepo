/**
 * Tests for Pipeline Orchestrator — spec §16
 */

import { describe, it, expect } from 'vitest';
import { computeEstateTax, wizardStateToEngineInput } from '../pipeline';
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

// ── Test 1: Simple TRAIN citizen ────────────────────────────────────────────

describe('computeEstateTax - Simple TRAIN citizen', () => {
  it('₱15M exclusive property → NTE = ₱10M, tax = ₱600K', () => {
    const state = makeWizardState({
      realProperties: [
        {
          id: 'rp1',
          titleNumber: 'T-12345',
          taxDecNumber: 'TD-001',
          location: 'Metro Manila',
          lotArea: 200,
          improvementArea: null,
          classification: 'residential',
          fmvTaxDec: 1_500_000_000, // ₱15M in centavos
          fmvBirZonal: 1_400_000_000,
          ownership: 'exclusive',
          isFamilyHome: false,
          hasBarangayCert: false,
        },
      ],
    });

    const result = computeEstateTax(state);

    // Gross estate = ₱15M (max of fmvTaxDec, fmvBirZonal)
    expect(result.grossEstate.total.total).toBe(1_500_000_000);

    // NTE = ₱15M - ₱5M standard deduction = ₱10M
    expect(result.taxComputation.netTaxableEstate).toBe(1_000_000_000);

    // Tax = ₱10M × 6% = ₱600K
    expect(result.taxComputation.estateTaxDue).toBe(60_000_000);

    // Regime
    expect(result.regimeDetection.regime).toBe('TRAIN');
  });
});

// ── Test 2: wizardStateToEngineInput ────────────────────────────────────────

describe('wizardStateToEngineInput', () => {
  it('maps a default wizard state to a valid EngineInput', () => {
    const state = makeWizardState();
    const input = wizardStateToEngineInput(state);

    expect(input.decedent.name).toBe('Test Decedent');
    expect(input.decedent.dateOfDeath).toBe('2020-06-15');
    expect(input.decedent.isFilipino).toBe(true);
    expect(input.decedent.isNRA).toBe(false);
    expect(input.decedent.isResident).toBe(true);
    expect(input.decedent.isMarried).toBe(false);
    expect(input.estateFlags).toBeDefined();
    expect(input.realProperties).toEqual([]);
    expect(input.filing).toBeDefined();
  });

  it('maps real properties correctly', () => {
    const state = makeWizardState({
      realProperties: [
        {
          id: 'rp1',
          titleNumber: 'T-001',
          taxDecNumber: 'TD-001',
          location: 'QC',
          lotArea: 100,
          improvementArea: null,
          classification: 'residential',
          fmvTaxDec: 500_000_000,
          fmvBirZonal: 600_000_000,
          ownership: 'exclusive',
          isFamilyHome: true,
          hasBarangayCert: true,
        },
      ],
    });
    const input = wizardStateToEngineInput(state);

    expect(input.realProperties).toHaveLength(1);
    expect(input.realProperties[0].fmvTaxDeclaration).toBe(500_000_000);
    expect(input.realProperties[0].fmvBir).toBe(600_000_000);
    expect(input.realProperties[0].ownershipType).toBe('exclusive');
    expect(input.realProperties[0].isDesignatedFamilyHome).toBe(true);
  });

  it('maps filing flags to estateFlags', () => {
    const state = makeWizardState({
      filing: {
        ...createDefaultEstateTaxState().filing,
        userElectsAmnesty: true,
        hasPcggViolation: true,
        priorReturnFiled: true,
        previouslyDeclaredNetEstate: 100_000_000,
      },
    });
    const input = wizardStateToEngineInput(state);

    expect(input.userElectsAmnesty).toBe(true);
    expect(input.estateFlags.subjectToPCGGJurisdiction).toBe(true);
    expect(input.estateFlags.priorReturnFiled).toBe(true);
    expect(input.estateFlags.previouslyDeclaredNetEstate).toBe(100_000_000);
  });

  it('maps exempt assets to sec87ExemptAssets', () => {
    const state = makeWizardState({
      otherAssets: {
        taxableTransfers: [],
        businessInterests: [],
        exemptAssets: [
          { id: 'ex1', description: 'Usufruct', fmv: 100_000_000, legalBasis: 'Sec. 87(a)' },
        ],
      },
    });
    const input = wizardStateToEngineInput(state);

    expect(input.sec87ExemptAssets).toHaveLength(1);
    expect(input.sec87ExemptAssets[0].exemptionType).toBe('Sec. 87(a)');
    expect(input.sec87ExemptAssets[0].fmv).toBe(100_000_000);
  });

  it('maps claimsAgainstInsolvent to claimsVsInsolvent', () => {
    const state = makeWizardState({
      ordinaryDeductions: {
        ...createDefaultEstateTaxState().ordinaryDeductions,
        claimsAgainstInsolvent: [
          { id: 'ci1', description: 'Receivable from X', amount: 50_000_000 },
        ],
      },
    });
    const input = wizardStateToEngineInput(state);

    expect(input.claimsVsInsolvent).toHaveLength(1);
    expect(input.claimsVsInsolvent[0].amount).toBe(50_000_000);
  });
});

// ── Test 3: Bridge output fields ────────────────────────────────────────────

describe('computeEstateTax - Bridge output fields', () => {
  it('includes item40_gross_estate (NTE), item44_total_deductions, surcharges=0, interest=0', () => {
    const state = makeWizardState({
      realProperties: [
        {
          id: 'rp1',
          titleNumber: 'T-001',
          taxDecNumber: 'TD-001',
          location: 'Manila',
          lotArea: 100,
          improvementArea: null,
          classification: 'residential',
          fmvTaxDec: 1_500_000_000,
          fmvBirZonal: 1_000_000_000,
          ownership: 'exclusive',
          isFamilyHome: false,
          hasBarangayCert: false,
        },
      ],
    });

    const result = computeEstateTax(state);

    // item40_gross_estate is the NET TAXABLE ESTATE (misleading name, backward compat)
    expect(result.item40_gross_estate).toBe(result.taxComputation.netTaxableEstate);

    // item44_total_deductions is the net estate tax due
    expect(result.item44_total_deductions).toBe(result.taxComputation.netEstateTaxDue);

    // Zero-filled surcharge fields
    expect(result.surcharges).toBe(0);
    expect(result.interest).toBe(0);
    expect(result.compromise_penalty).toBe(0);

    // total_amount_due = tax_due
    expect(result.total_amount_due).toBe(result.tax_due);

    // schedules exist
    expect(result.schedules).toBeDefined();
    expect(result.schedules.schedule1_real_properties).toBeGreaterThan(0);
  });
});

// ── Test 4: Validation errors ───────────────────────────────────────────────

describe('computeEstateTax - Validation errors', () => {
  it('returns errors for invalid input (missing date of death)', () => {
    const state = makeWizardState({
      decedent: {
        ...createDefaultEstateTaxState().decedent,
        name: 'Test',
        dateOfDeath: '',
        address: '123 St',
      },
    });

    const result = computeEstateTax(state);

    expect(result.warnings.length).toBeGreaterThan(0);
    // Should have validation-related warnings
    const hasValidationWarning = result.warnings.some(
      (w) => w.includes('ERR_') || w.includes('validation') || w.includes('required'),
    );
    expect(hasValidationWarning).toBe(true);
  });
});

// ── Test 5: Pre-TRAIN graduated bracket ─────────────────────────────────────

describe('computeEstateTax - Pre-TRAIN', () => {
  it('selects graduated bracket for pre-TRAIN death', () => {
    const state = makeWizardState({
      decedent: {
        ...createDefaultEstateTaxState().decedent,
        name: 'Pre-Train Decedent',
        dateOfDeath: '2015-01-15',
        address: '123 Old St',
      },
      realProperties: [
        {
          id: 'rp1',
          titleNumber: 'T-001',
          taxDecNumber: 'TD-001',
          location: 'Manila',
          lotArea: 100,
          improvementArea: null,
          classification: 'residential',
          fmvTaxDec: 500_000_000, // ₱5M
          fmvBirZonal: 400_000_000,
          ownership: 'exclusive',
          isFamilyHome: false,
          hasBarangayCert: false,
        },
      ],
    });

    const result = computeEstateTax(state);

    expect(result.regimeDetection.regime).toBe('PRE_TRAIN');
    expect(result.regimeDetection.deductionRules).toBe('PRE_TRAIN');
    // Pre-TRAIN standard deduction is ₱1M, so NTE = ₱5M - ₱1M = ₱4M
    expect(result.taxComputation.netTaxableEstate).toBe(400_000_000);
    // ₱4M is in the ₱2M–₱5M bracket: base ₱135K + 11% of (₱4M - ₱2M) = ₱135K + ₱220K = ₱355K
    expect(result.taxComputation.graduatedBracket).not.toBeNull();
    expect(result.taxComputation.graduatedBracket!.bracketRate).toBe(0.11);
    expect(result.taxComputation.estateTaxDue).toBe(13_500_000 + Math.floor(200_000_000 * 0.11));
  });
});

// ── Test 6: Zero estate ─────────────────────────────────────────────────────

describe('computeEstateTax - Zero estate', () => {
  it('all zeros → zero tax', () => {
    const state = makeWizardState();

    const result = computeEstateTax(state);

    expect(result.grossEstate.total.total).toBe(0);
    expect(result.taxComputation.netTaxableEstate).toBe(0);
    expect(result.taxComputation.estateTaxDue).toBe(0);
    expect(result.tax_due).toBe(0);
    expect(result.total_amount_due).toBe(0);
  });
});
