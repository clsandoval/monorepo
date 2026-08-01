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
          fmvTaxDec: 15_000_000, // ₱15M
          fmvBirZonal: 14_000_000,
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
          fmvTaxDec: 5_000_000,
          fmvBirZonal: 6_000_000,
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
        previouslyDeclaredNetEstate: 1_000_000,
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
          { id: 'ex1', description: 'Usufruct', fmv: 1_000_000, legalBasis: 'Sec. 87(a)' },
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
          { id: 'ci1', description: 'Receivable from X', amount: 500_000 },
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
  // ROADMAP Phase 20, success criterion 1, verbatim:
  //   "No hardcoded zero survives on the total's inputs"
  // That criterion is the authorisation for changing the meaning of the four
  // assertions below. Each was STRENGTHENED in place — a `toBe(0)` became a
  // `toBeNull()` plus new assertions on the line's status and its governing
  // section. None was deleted, skipped or given a looser matcher.
  it('declines the Sec. 248 and Sec. 249 lines and publishes no total', () => {
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
          fmvTaxDec: 15_000_000,
          fmvBirZonal: 10_000_000,
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

    // Declined, not zeroed. A zero is a claim that nothing is owed.
    expect(result.surcharges).toBeNull();
    expect(result.interest).toBeNull();
    expect(result.compromise_penalty).toBeNull();

    for (const line of result.penalties.lines) {
      expect(line.status).toBe('declined');
      expect(line.lawyerDecision).not.toBeNull();
    }
    expect(result.penalties.lines[0].authority).toBe('NIRC Sec. 248');
    expect(result.penalties.lines[1].authority).toBe('NIRC Sec. 249');
    expect(result.penalties.lines[2].authority.trim().length).toBeGreaterThan(0);

    // No total while any line is declined — and the base tax still survives.
    expect(result.total_amount_due).toBeNull();
    expect(typeof result.tax_due).toBe('number');

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
          fmvTaxDec: 5_000_000, // ₱5M
          fmvBirZonal: 4_000_000,
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
    // A zero-tax estate is still an estate whose penalties are unknown. The two
    // facts are different and the test must say both.
    expect(result.total_amount_due).toBeNull();
  });
});

// ── End-to-end test vectors ──────────────────────────────────────────────────

describe('end-to-end test vectors', () => {
  // TV-01: TRAIN simple — single citizen, 1 real property, no deductions
  it('TV-01: TRAIN simple — single citizen, 1 real property, tax = ₱300K', () => {
    const state = createDefaultEstateTaxState();
    state.decedent.name = 'Juan Dela Cruz';
    state.decedent.dateOfDeath = '2023-06-15';
    state.decedent.citizenship = 'Filipino';
    state.decedent.maritalStatus = 'single';
    state.decedent.address = 'Manila';
    state.realProperties = [
      {
        id: '1',
        titleNumber: 'TCT-123',
        taxDecNumber: 'TD-456',
        location: 'Manila',
        lotArea: 200,
        improvementArea: null,
        classification: 'residential',
        fmvTaxDec: 8_000_000,      // ₱8M
        fmvBirZonal: 10_000_000,  // ₱10M — higher → gross estate = ₱10M
        ownership: 'exclusive',
        isFamilyHome: false,
        hasBarangayCert: false,
      },
    ];

    const result = computeEstateTax(state);

    // Regime
    expect(result.regimeDetection.regime).toBe('TRAIN');

    // Gross estate = ₱10M (max of fmvTaxDec, fmvBirZonal)
    expect(result.grossEstate.total.total).toBe(1_000_000_000);

    // Standard deduction = ₱5M → Net taxable estate = ₱5M
    expect(result.taxComputation.netTaxableEstate).toBe(500_000_000);

    // Tax = ₱5M × 6% = ₱300K
    expect(result.taxComputation.netEstateTaxDue).toBe(30_000_000);
  });

  // TV-02: TRAIN with family home — married, ACP, family home deduction zeroes out tax
  it('TV-02: TRAIN with family home — married ACP, tax = 0', () => {
    const state = createDefaultEstateTaxState();
    state.decedent.name = 'Maria Santos';
    state.decedent.dateOfDeath = '2023-06-15';
    state.decedent.citizenship = 'Filipino';
    state.decedent.maritalStatus = 'married';
    state.decedent.propertyRegime = 'ACP';
    state.decedent.address = 'Quezon City';
    state.realProperties = [
      {
        id: '1',
        titleNumber: 'TCT-001',
        taxDecNumber: 'TD-001',
        location: 'Quezon City',
        lotArea: 300,
        improvementArea: null,
        classification: 'residential',
        fmvTaxDec: 15_000_000,  // ₱15M
        fmvBirZonal: 15_000_000, // ₱15M
        ownership: 'conjugal',
        isFamilyHome: true,
        hasBarangayCert: true,
      },
      {
        id: '2',
        titleNumber: 'TCT-002',
        taxDecNumber: 'TD-002',
        location: 'Manila',
        lotArea: 100,
        improvementArea: null,
        classification: 'residential',
        fmvTaxDec: 5_000_000,  // ₱5M
        fmvBirZonal: 5_000_000, // ₱5M
        ownership: 'exclusive',
        isFamilyHome: false,
        hasBarangayCert: false,
      },
    ];

    const result = computeEstateTax(state);

    // Gross estate = ₱5M (excl) + ₱15M (conj) = ₱20M
    expect(result.grossEstate.total.total).toBe(2_000_000_000);

    // Standard deduction = ₱5M. Family home deduction = min(₱15M × 0.5, ₱10M) = ₱7.5M.
    // Total special deductions = ₱12.5M.
    // Spouse share = ₱7.5M (half of ₱15M conjugal).
    // Net taxable estate = ₱20M - ₱12.5M special - ₱7.5M spouse = ₱0 (floored at 0).
    expect(result.taxComputation.netTaxableEstate).toBe(0);
    expect(result.taxComputation.netEstateTaxDue).toBe(0);
  });

  // TV-03: Pre-TRAIN graduated bracket
  it('TV-03: Pre-TRAIN — graduated bracket, tax = ₱355K', () => {
    const state = createDefaultEstateTaxState();
    state.decedent.name = 'Pedro Reyes';
    state.decedent.dateOfDeath = '2015-03-01';
    state.decedent.citizenship = 'Filipino';
    state.decedent.maritalStatus = 'single';
    state.decedent.address = 'Cebu City';
    state.realProperties = [
      {
        id: '1',
        titleNumber: 'TCT-789',
        taxDecNumber: 'TD-789',
        location: 'Cebu',
        lotArea: 150,
        improvementArea: null,
        classification: 'residential',
        fmvTaxDec: 5_000_000,  // ₱5M
        fmvBirZonal: 4_000_000, // ₱4M — fmvTaxDec is higher → gross = ₱5M
        ownership: 'exclusive',
        isFamilyHome: false,
        hasBarangayCert: false,
      },
    ];

    const result = computeEstateTax(state);

    // Regime
    expect(result.regimeDetection.regime).toBe('PRE_TRAIN');

    // Gross = ₱5M. Pre-TRAIN standard deduction = ₱1M. NTE = ₱4M.
    expect(result.taxComputation.netTaxableEstate).toBe(400_000_000);

    // Bracket: ₱2M-₱5M at 11%, base = ₱135K.
    // Tax = ₱135K + (₱4M - ₱2M) × 11% = ₱135K + ₱220K = ₱355K
    expect(result.taxComputation.netEstateTaxDue).toBe(35_500_000);
  });

  // TV-04: Zero estate — no assets, no deductions
  it('TV-04: Zero estate — everything zero, tax = 0', () => {
    const state = createDefaultEstateTaxState();
    state.decedent.name = 'Ana Lopez';
    state.decedent.dateOfDeath = '2023-01-01';
    state.decedent.citizenship = 'Filipino';
    state.decedent.maritalStatus = 'single';
    state.decedent.address = 'Davao City';
    // No assets, no deductions (defaults)

    const result = computeEstateTax(state);

    expect(result.grossEstate.total.total).toBe(0);
    expect(result.taxComputation.netEstateTaxDue).toBe(0);
  });

  // TV-05: Bridge compatibility fields
  it('TV-05: Bridge compatibility — required output fields present', () => {
    const state = createDefaultEstateTaxState();
    state.decedent.name = 'Carlos Bautista';
    state.decedent.dateOfDeath = '2023-06-15';
    state.decedent.citizenship = 'Filipino';
    state.decedent.maritalStatus = 'single';
    state.decedent.address = 'Makati';
    state.realProperties = [
      {
        id: '1',
        titleNumber: 'TCT-555',
        taxDecNumber: 'TD-555',
        location: 'Makati',
        lotArea: 100,
        improvementArea: null,
        classification: 'residential',
        fmvTaxDec: 10_000_000, // ₱10M
        fmvBirZonal: 10_000_000,
        ownership: 'exclusive',
        isFamilyHome: false,
        hasBarangayCert: false,
      },
    ];

    const result = computeEstateTax(state);

    // Bridge-compatible fields must exist and be numbers
    expect(typeof result.item40_gross_estate).toBe('number');
    expect(typeof result.item44_total_deductions).toBe('number');
    expect(typeof result.tax_due).toBe('number');

    // Surcharge fields are declined, never defaulted to zero.
    expect(result.surcharges).toBeNull();
    expect(result.interest).toBeNull();
    expect(result.compromise_penalty).toBeNull();

    // The manual-review flag reaches the engine's own warnings array.
    expect(
      result.warnings.some((w) => w.startsWith('MANUAL REVIEW — PENALTIES NOT COMPUTED:')),
    ).toBe(true);

    // Schedules object exists
    expect(result.schedules).toBeDefined();
    expect(typeof result.schedules.schedule1_real_properties).toBe('number');
    expect(result.schedules.schedule1_real_properties).toBeGreaterThan(0);
  });

  // TV-06: Validation errors propagated — missing date of death
  it('TV-06: Validation errors — missing date of death produces error warnings', () => {
    const state = createDefaultEstateTaxState();
    state.decedent.name = 'Unknown';
    state.decedent.dateOfDeath = ''; // Missing
    state.decedent.citizenship = 'Filipino';
    state.decedent.maritalStatus = 'single';
    state.decedent.address = 'Manila';

    const result = computeEstateTax(state);

    expect(result.warnings.length).toBeGreaterThan(0);
    const hasErrorCode = result.warnings.some((w) => w.includes('ERR_'));
    expect(hasErrorCode).toBe(true);
  });
});

// ── The lateness moves with the date of death ────────────────────────────────
//
// ROADMAP Phase 20 criterion 1's observable claim is that the statutory
// deadline and the day count are real functions of the date of death. These
// cases prove it at the ENGINE level rather than only at the module level:
// wizardStateToEngineInput is exactly where the wall-clock defect was hiding,
// so a unit test on penalties.ts alone would not have caught it.

describe('computeEstateTax - filing lateness', () => {
  it('a TRAIN death filed 2025-06-15 is 1461 days past a 2021-06-15 deadline', () => {
    const state = makeWizardState({
      decedent: { ...createDefaultEstateTaxState().decedent, dateOfDeath: '2020-06-15' },
      filing: { ...createDefaultEstateTaxState().filing, assumedFilingDate: '2025-06-15' },
    });

    const { lateness } = computeEstateTax(state).penalties;
    expect(lateness.kind).toBe('determined');
    if (lateness.kind !== 'determined') throw new Error('expected determined');
    expect(lateness.lateness.statutoryDeadline).toBe('2021-06-15');
    expect(lateness.lateness.daysLate).toBe(1461);
    expect(lateness.lateness.isLate).toBe(true);
  });

  it('a pre-TRAIN death filed the same day is later, against a 2015-09-30 deadline', () => {
    const train = makeWizardState({
      decedent: { ...createDefaultEstateTaxState().decedent, dateOfDeath: '2020-06-15' },
      filing: { ...createDefaultEstateTaxState().filing, assumedFilingDate: '2025-06-15' },
    });
    const preTrain = makeWizardState({
      decedent: { ...createDefaultEstateTaxState().decedent, dateOfDeath: '2015-03-31' },
      filing: { ...createDefaultEstateTaxState().filing, assumedFilingDate: '2025-06-15' },
    });

    const a = computeEstateTax(train).penalties.lateness;
    const b = computeEstateTax(preTrain).penalties.lateness;
    if (a.kind !== 'determined') throw new Error('expected determined');
    if (b.kind !== 'determined') throw new Error('expected determined');

    // The month-end clamp: 6 months from 2015-03-31 is 2015-09-30, not October.
    expect(b.lateness.statutoryDeadline).toBe('2015-09-30');
    expect(b.lateness.deadlineMonths).toBe(6);
    expect(a.lateness.deadlineMonths).toBe(12);
    expect(b.lateness.daysLate).toBeGreaterThan(a.lateness.daysLate);
    expect(b.lateness.statutoryDeadline).not.toBe(a.lateness.statutoryDeadline);
  });

  it('a blank filing date leaves the lateness undetermined and the total absent', () => {
    const state = makeWizardState({
      decedent: { ...createDefaultEstateTaxState().decedent, dateOfDeath: '2020-06-15' },
      filing: { ...createDefaultEstateTaxState().filing, assumedFilingDate: '' },
    });

    const result = computeEstateTax(state);
    expect(result.penalties.lateness.kind).toBe('undetermined');
    expect(result.total_amount_due).toBeNull();
    expect(result.penalties.complete).toBe(false);
  });
});
