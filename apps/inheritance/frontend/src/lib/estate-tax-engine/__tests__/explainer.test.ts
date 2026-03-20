/**
 * Tests for Explainer Generation — spec §18
 */

import { describe, it, expect } from 'vitest';
import { generateExplainer, formatPeso } from '../explainer';
import type {
  RegimeDetectionResult,
  GrossEstateResult,
  OrdinaryDeductionsResult,
  SpecialDeductionsResult,
  SpouseShareResult,
  TaxComputationResult,
  ColumnValues,
} from '../types';

// ── Helpers ──────────────────────────────────────────────────────────────────

function zeroCV(): ColumnValues {
  return { exclusive: 0, conjugal: 0, total: 0 };
}

function makeGrossEstate(totalCentavos: number): GrossEstateResult {
  return {
    realProperty: { exclusive: totalCentavos, conjugal: 0, total: totalCentavos },
    familyHome: zeroCV(),
    personalProperty: zeroCV(),
    taxableTransfers: zeroCV(),
    businessInterest: zeroCV(),
    total: { exclusive: totalCentavos, conjugal: 0, total: totalCentavos },
  };
}

function makeOrdinaryDeductions(): OrdinaryDeductionsResult {
  return {
    item5a_standard_deduction: zeroCV(),
    item5b_claims_against_estate: zeroCV(),
    item5c_claims_vs_insolvent: zeroCV(),
    item5d_unpaid_mortgages: zeroCV(),
    item5e_unpaid_taxes: zeroCV(),
    item5f_casualty_losses: zeroCV(),
    item5g_vanishing_deduction: zeroCV(),
    item5h_transfers_for_public_use: zeroCV(),
    total: zeroCV(),
  };
}

function makeSpecialDeductions(total: number = 0): SpecialDeductionsResult {
  return {
    item37a_family_home: 0,
    item37b_funeral_expenses: 0,
    item37c_judicial_admin_expenses: 0,
    item37d_medical_expenses: 0,
    total,
  };
}

function makeSpouseShare(): SpouseShareResult {
  return { totalConjugalAssets: 0, conjugalObligations: 0, netConjugalProperty: 0, spouseShare: 0 };
}

function makeTaxComputation(overrides: Partial<TaxComputationResult> = {}): TaxComputationResult {
  return {
    netTaxableEstate: 0,
    estateTaxDue: 0,
    foreignTaxCredit: 0,
    netEstateTaxDue: 0,
    graduatedBracket: null,
    amnestyTrack: null,
    previouslyDeclaredNet: null,
    amnestyTaxBase: null,
    computedAmnestyTax: null,
    minimumApplied: false,
    ...overrides,
  };
}

// ── formatPeso ───────────────────────────────────────────────────────────────

describe('formatPeso', () => {
  it('formats zero', () => {
    expect(formatPeso(0)).toBe('₱0.00');
  });

  it('formats centavos → pesos with two decimal places', () => {
    expect(formatPeso(500_000_000)).toBe('₱5,000,000.00');
  });

  it('formats small amounts', () => {
    expect(formatPeso(150)).toBe('₱1.50');
  });

  it('formats amounts with centavos remainder', () => {
    expect(formatPeso(24_000_099)).toBe('₱240,000.99');
  });
});

// ── TRAIN regime intro ──────────────────────────────────────────────────────

describe('generateExplainer - TRAIN', () => {
  it('intro mentions "flat rate of 6%"', () => {
    const result = generateExplainer({
      decedentName: 'Juan Cruz',
      dateOfDeath: '2020-03-15',
      regimeDetection: {
        regime: 'TRAIN',
        deductionRules: 'TRAIN',
        track: null,
        displayDualPath: false,
        amnestyEligible: false,
        ineligibilityReason: null,
        warnings: [],
      },
      grossEstate: makeGrossEstate(900_000_000),
      ordinaryDeductions: makeOrdinaryDeductions(),
      specialDeductions: makeSpecialDeductions(500_000_000),
      spouseShare: makeSpouseShare(),
      taxComputation: makeTaxComputation({
        netTaxableEstate: 400_000_000,
        estateTaxDue: 24_000_000,
        netEstateTaxDue: 24_000_000,
      }),
      nraProportionalFactor: null,
      isNRA: false,
    });

    const intro = result.sections.find((s) => s.title.toLowerCase().includes('regime'));
    expect(intro).toBeDefined();
    expect(intro!.body).toContain('flat rate of 6%');
    expect(intro!.body).toContain('Juan Cruz');
    expect(intro!.body).toContain('2020-03-15');
  });

  it('has gross estate section with amounts', () => {
    const result = generateExplainer({
      decedentName: 'Juan Cruz',
      dateOfDeath: '2020-03-15',
      regimeDetection: {
        regime: 'TRAIN',
        deductionRules: 'TRAIN',
        track: null,
        displayDualPath: false,
        amnestyEligible: false,
        ineligibilityReason: null,
        warnings: [],
      },
      grossEstate: makeGrossEstate(900_000_000),
      ordinaryDeductions: makeOrdinaryDeductions(),
      specialDeductions: makeSpecialDeductions(500_000_000),
      spouseShare: makeSpouseShare(),
      taxComputation: makeTaxComputation({
        netTaxableEstate: 400_000_000,
        estateTaxDue: 24_000_000,
        netEstateTaxDue: 24_000_000,
      }),
      nraProportionalFactor: null,
      isNRA: false,
    });

    const grossSection = result.sections.find((s) => s.title.toLowerCase().includes('gross estate'));
    expect(grossSection).toBeDefined();
    expect(grossSection!.body).toContain('₱9,000,000.00');
  });
});

// ── PRE_TRAIN regime ────────────────────────────────────────────────────────

describe('generateExplainer - PRE_TRAIN', () => {
  it('mentions "graduated" and bracket', () => {
    const result = generateExplainer({
      decedentName: 'Maria Santos',
      dateOfDeath: '2015-07-01',
      regimeDetection: {
        regime: 'PRE_TRAIN',
        deductionRules: 'PRE_TRAIN',
        track: null,
        displayDualPath: false,
        amnestyEligible: false,
        ineligibilityReason: null,
        warnings: [],
      },
      grossEstate: makeGrossEstate(300_000_000),
      ordinaryDeductions: makeOrdinaryDeductions(),
      specialDeductions: makeSpecialDeductions(100_000_000),
      spouseShare: makeSpouseShare(),
      taxComputation: makeTaxComputation({
        netTaxableEstate: 200_000_000,
        estateTaxDue: 13_500_000,
        netEstateTaxDue: 13_500_000,
        graduatedBracket: {
          bracketMin: 200_000_000,
          bracketMax: 500_000_000,
          bracketRate: 0.11,
          baseTax: 13_500_000,
          excessAmount: 0,
          taxOnExcess: 0,
          totalTax: 13_500_000,
        },
      }),
      nraProportionalFactor: null,
      isNRA: false,
    });

    const intro = result.sections.find((s) => s.title.toLowerCase().includes('regime'));
    expect(intro).toBeDefined();
    expect(intro!.body).toContain('graduated');
    expect(intro!.body).toContain('Maria Santos');
  });
});

// ── AMNESTY regime ──────────────────────────────────────────────────────────

describe('generateExplainer - AMNESTY', () => {
  it('mentions "RA 11213" and "filing window closed June 14, 2025"', () => {
    const result = generateExplainer({
      decedentName: 'Pedro Reyes',
      dateOfDeath: '2016-01-10',
      regimeDetection: {
        regime: 'AMNESTY',
        deductionRules: 'PRE_TRAIN',
        track: 'TRACK_A',
        displayDualPath: true,
        amnestyEligible: true,
        ineligibilityReason: null,
        warnings: [],
      },
      grossEstate: makeGrossEstate(1_000_000_000),
      ordinaryDeductions: makeOrdinaryDeductions(),
      specialDeductions: makeSpecialDeductions(100_000_000),
      spouseShare: makeSpouseShare(),
      taxComputation: makeTaxComputation({
        netTaxableEstate: 900_000_000,
        estateTaxDue: 54_000_000,
        netEstateTaxDue: 54_000_000,
        amnestyTrack: 'TRACK_A',
        amnestyTaxBase: 900_000_000,
        computedAmnestyTax: 54_000_000,
        minimumApplied: false,
      }),
      nraProportionalFactor: null,
      isNRA: false,
    });

    const intro = result.sections.find((s) => s.title.toLowerCase().includes('regime'));
    expect(intro).toBeDefined();
    expect(intro!.body).toContain('RA 11213');
    expect(intro!.body).toContain('filing window closed');
    expect(intro!.body).toContain('June 14, 2025');
  });
});

// ── NRA note ─────────────────────────────────────────────────────────────────

describe('generateExplainer - NRA', () => {
  it('has NRA note section with proportional factor', () => {
    const result = generateExplainer({
      decedentName: 'John Smith',
      dateOfDeath: '2020-06-01',
      regimeDetection: {
        regime: 'TRAIN',
        deductionRules: 'TRAIN',
        track: null,
        displayDualPath: false,
        amnestyEligible: false,
        ineligibilityReason: null,
        warnings: [],
      },
      grossEstate: makeGrossEstate(500_000_000),
      ordinaryDeductions: makeOrdinaryDeductions(),
      specialDeductions: makeSpecialDeductions(50_000_000),
      spouseShare: makeSpouseShare(),
      taxComputation: makeTaxComputation({
        netTaxableEstate: 450_000_000,
        estateTaxDue: 27_000_000,
        netEstateTaxDue: 27_000_000,
      }),
      nraProportionalFactor: 0.4,
      isNRA: true,
    });

    const nraSection = result.sections.find(
      (s) => s.title.toLowerCase().includes('nra') || s.title.toLowerCase().includes('non-resident'),
    );
    expect(nraSection).toBeDefined();
    expect(nraSection!.body).toContain('proportional');
  });
});
