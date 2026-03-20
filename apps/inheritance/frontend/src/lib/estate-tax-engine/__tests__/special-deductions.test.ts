/**
 * Tests for Special Deductions — spec §10
 *
 * SpecialDeductionsResult field mapping (types.ts):
 *   item37a_family_home            → family home deduction (§10.2)
 *   item37b_funeral_expenses       → funeral expenses (§9.8, pre-TRAIN only)
 *   item37c_judicial_admin_expenses → judicial/admin expenses (§9.9, pre-TRAIN only)
 *   item37d_medical_expenses        → medical expenses (§10.3)
 *   total                           → sum of all items + standard deduction
 *
 * Standard deduction (§10.1) is included in total but not a named field in SpecialDeductionsResult.
 * The computeSpecialDeductions function returns the result + makes standardDeduction accessible.
 */

import { describe, it, expect } from 'vitest';
import { computeSpecialDeductions } from '../special-deductions';
import type { DecedentInfo, MedicalExpense, FuneralExpense, JudicialAdminExpense } from '../types';
import {
  STANDARD_DEDUCTION_TRAIN_CITIZEN,
  STANDARD_DEDUCTION_PRE_TRAIN_CITIZEN,
  STANDARD_DEDUCTION_NRA,
  FAMILY_HOME_CAP_TRAIN,
  FAMILY_HOME_CAP_PRE_TRAIN,
  MEDICAL_EXPENSE_CAP,
} from '../constants';

// Helpers
function makeDecedent(overrides: Partial<DecedentInfo> = {}): DecedentInfo {
  return {
    name: 'Test Decedent',
    tin: '123-456-789',
    dateOfDeath: '2021-06-01',
    isResident: true,
    isFilipino: true,
    isNRA: false,
    isMarried: false,
    ...overrides,
  };
}

// ── §10.1 Standard Deduction ─────────────────────────────────────────────────

describe('standard deduction', () => {
  it('TRAIN citizen → ₱5,000,000', () => {
    const decedent = makeDecedent({ dateOfDeath: '2021-06-01' });
    const result = computeSpecialDeductions(decedent, 'TRAIN', 0);
    expect(result.standardDeduction).toBe(STANDARD_DEDUCTION_TRAIN_CITIZEN);
  });

  it('PRE_TRAIN citizen → ₱1,000,000', () => {
    const decedent = makeDecedent({ dateOfDeath: '2015-01-01' });
    const result = computeSpecialDeductions(decedent, 'PRE_TRAIN', 0);
    expect(result.standardDeduction).toBe(STANDARD_DEDUCTION_PRE_TRAIN_CITIZEN);
  });

  it('NRA → ₱500,000 regardless of deductionRules', () => {
    const decedent = makeDecedent({ isNRA: true, dateOfDeath: '2021-06-01' });
    const trainResult = computeSpecialDeductions(decedent, 'TRAIN', 0);
    const preTrainResult = computeSpecialDeductions(decedent, 'PRE_TRAIN', 0);
    expect(trainResult.standardDeduction).toBe(STANDARD_DEDUCTION_NRA);
    expect(preTrainResult.standardDeduction).toBe(STANDARD_DEDUCTION_NRA);
  });
});

// ── §10.2 Family Home ────────────────────────────────────────────────────────

describe('family home deduction', () => {
  it('TRAIN: exclusive family home, FMV < cap → FMV', () => {
    const decedent = makeDecedent();
    const familyHome = {
      fmv: 600_000_000, // ₱6M < ₱10M cap
      ownershipType: 'exclusive' as const,
      hasCertification: true,
    };
    const result = computeSpecialDeductions(decedent, 'TRAIN', 0, familyHome);
    expect(result.item37a_family_home).toBe(600_000_000);
  });

  it('TRAIN: exclusive family home, FMV > cap → capped at ₱10M', () => {
    const decedent = makeDecedent();
    const familyHome = {
      fmv: 1_500_000_000, // ₱15M > ₱10M cap
      ownershipType: 'exclusive' as const,
      hasCertification: true,
    };
    const result = computeSpecialDeductions(decedent, 'TRAIN', 0, familyHome);
    expect(result.item37a_family_home).toBe(FAMILY_HOME_CAP_TRAIN);
  });

  it('PRE_TRAIN: FMV > ₱1M cap → capped at ₱1M', () => {
    const decedent = makeDecedent({ dateOfDeath: '2015-01-01' });
    const familyHome = {
      fmv: 120_000_000, // ₱1.2M > ₱1M cap
      ownershipType: 'exclusive' as const,
      hasCertification: true,
    };
    const result = computeSpecialDeductions(decedent, 'PRE_TRAIN', 0, familyHome);
    expect(result.item37a_family_home).toBe(FAMILY_HOME_CAP_PRE_TRAIN);
  });

  it('conjugal family home: deduction = min(FMV * 0.5, cap)', () => {
    const decedent = makeDecedent({ isMarried: true });
    const familyHome = {
      fmv: 1_000_000_000, // ₱10M; half = ₱5M < ₱10M cap
      ownershipType: 'conjugal' as const,
      hasCertification: true,
    };
    const result = computeSpecialDeductions(decedent, 'TRAIN', 0, familyHome);
    expect(result.item37a_family_home).toBe(500_000_000); // ₱5M
  });

  it('no barangay certification → 0', () => {
    const decedent = makeDecedent();
    const familyHome = {
      fmv: 600_000_000,
      ownershipType: 'exclusive' as const,
      hasCertification: false,
    };
    const result = computeSpecialDeductions(decedent, 'TRAIN', 0, familyHome);
    expect(result.item37a_family_home).toBe(0);
  });

  it('no family home → 0', () => {
    const decedent = makeDecedent();
    const result = computeSpecialDeductions(decedent, 'TRAIN', 0);
    expect(result.item37a_family_home).toBe(0);
  });

  it('NRA → 0 regardless of family home', () => {
    const decedent = makeDecedent({ isNRA: true });
    const familyHome = {
      fmv: 600_000_000,
      ownershipType: 'exclusive' as const,
      hasCertification: true,
    };
    const result = computeSpecialDeductions(decedent, 'TRAIN', 0, familyHome);
    expect(result.item37a_family_home).toBe(0);
  });
});

// ── §9.8 Funeral Expenses (in special deductions result item37b) ────────────

describe('funeral expenses in special deductions', () => {
  it('TRAIN: funeral = 0', () => {
    const decedent = makeDecedent();
    const funeral: FuneralExpense[] = [{ description: 'Funeral', amount: 15_000_000 }];
    const result = computeSpecialDeductions(decedent, 'TRAIN', 0, undefined, funeral);
    expect(result.item37b_funeral_expenses).toBe(0);
  });

  it('PRE_TRAIN: funeral = min(actual, 5% * GE)', () => {
    const decedent = makeDecedent({ dateOfDeath: '2015-01-01' });
    const funeral: FuneralExpense[] = [{ description: 'Funeral', amount: 15_000_000 }]; // ₱150K
    const ge = 500_000_000; // ₱5M; 5% = ₱250K = 25M centavos
    const result = computeSpecialDeductions(decedent, 'PRE_TRAIN', ge, undefined, funeral);
    expect(result.item37b_funeral_expenses).toBe(15_000_000);
  });

  it('PRE_TRAIN: funeral capped at 5% of GE', () => {
    const decedent = makeDecedent({ dateOfDeath: '2015-01-01' });
    const funeral: FuneralExpense[] = [{ description: 'Funeral', amount: 50_000_000 }]; // ₱500K
    const ge = 500_000_000; // ₱5M; 5% = ₱250K = 25M centavos
    const result = computeSpecialDeductions(decedent, 'PRE_TRAIN', ge, undefined, funeral);
    expect(result.item37b_funeral_expenses).toBe(25_000_000);
  });

  it('NRA PRE_TRAIN: funeral = 0 (NRA not eligible)', () => {
    const decedent = makeDecedent({ isNRA: true, dateOfDeath: '2015-01-01' });
    const funeral: FuneralExpense[] = [{ description: 'Funeral', amount: 15_000_000 }];
    const result = computeSpecialDeductions(decedent, 'PRE_TRAIN', 500_000_000, undefined, funeral);
    // NRA is not eligible for funeral deduction in special schedule
    expect(result.item37b_funeral_expenses).toBe(0);
  });
});

// ── §9.9 Judicial/Admin Expenses (item37c) ──────────────────────────────────

describe('judicial admin expenses in special deductions', () => {
  it('TRAIN: judicial = 0', () => {
    const decedent = makeDecedent();
    const judicial: JudicialAdminExpense[] = [{ description: 'Atty fees', amount: 5_000_000 }];
    const result = computeSpecialDeductions(decedent, 'TRAIN', 0, undefined, undefined, judicial);
    expect(result.item37c_judicial_admin_expenses).toBe(0);
  });

  it('PRE_TRAIN: judicial = actual, no cap', () => {
    const decedent = makeDecedent({ dateOfDeath: '2015-01-01' });
    const judicial: JudicialAdminExpense[] = [
      { description: 'Atty fees', amount: 5_000_000 },
      { description: 'Court fees', amount: 1_000_000 },
    ];
    const result = computeSpecialDeductions(decedent, 'PRE_TRAIN', 0, undefined, undefined, judicial);
    expect(result.item37c_judicial_admin_expenses).toBe(6_000_000);
  });

  it('NRA PRE_TRAIN: judicial = 0', () => {
    const decedent = makeDecedent({ isNRA: true, dateOfDeath: '2015-01-01' });
    const judicial: JudicialAdminExpense[] = [{ description: 'Atty fees', amount: 5_000_000 }];
    const result = computeSpecialDeductions(decedent, 'PRE_TRAIN', 0, undefined, undefined, judicial);
    expect(result.item37c_judicial_admin_expenses).toBe(0);
  });
});

// ── §10.3 Medical Expenses ───────────────────────────────────────────────────

describe('medical expenses', () => {
  it('qualifying within 1 year: min(total, ₱500K cap)', () => {
    const decedent = makeDecedent({ dateOfDeath: '2021-06-01' });
    const medical: MedicalExpense[] = [
      { description: 'Hospital', amount: 40_000_000 }, // ₱400K, within cap
    ];
    const result = computeSpecialDeductions(decedent, 'TRAIN', 0, undefined, undefined, undefined, medical);
    expect(result.item37d_medical_expenses).toBe(40_000_000);
  });

  it('total exceeds ₱500K cap → capped', () => {
    const decedent = makeDecedent({ dateOfDeath: '2021-06-01' });
    const medical: MedicalExpense[] = [
      { description: 'Hospital A', amount: 40_000_000 },
      { description: 'Hospital B', amount: 30_000_000 }, // total ₱700K > ₱500K cap
    ];
    const result = computeSpecialDeductions(decedent, 'TRAIN', 0, undefined, undefined, undefined, medical);
    expect(result.item37d_medical_expenses).toBe(MEDICAL_EXPENSE_CAP); // ₱500K
  });

  it('NRA → 0 medical expense deduction', () => {
    const decedent = makeDecedent({ isNRA: true });
    const medical: MedicalExpense[] = [
      { description: 'Hospital', amount: 10_000_000 },
    ];
    const result = computeSpecialDeductions(decedent, 'TRAIN', 0, undefined, undefined, undefined, medical);
    expect(result.item37d_medical_expenses).toBe(0);
  });

  it('no medical expenses → 0', () => {
    const decedent = makeDecedent();
    const result = computeSpecialDeductions(decedent, 'TRAIN', 0);
    expect(result.item37d_medical_expenses).toBe(0);
  });
});

// ── Total ────────────────────────────────────────────────────────────────────

describe('total special deductions', () => {
  it('TRAIN citizen with family home and medical: total = SD + FH + medical', () => {
    const decedent = makeDecedent();
    const familyHome = {
      fmv: 600_000_000, // ₱6M
      ownershipType: 'exclusive' as const,
      hasCertification: true,
    };
    const medical: MedicalExpense[] = [{ description: 'Hospital', amount: 40_000_000 }];
    const result = computeSpecialDeductions(decedent, 'TRAIN', 0, familyHome, undefined, undefined, medical);
    // SD = ₱5M, FH = ₱6M, medical = ₱400K → total = ₱11.4M
    const expected = STANDARD_DEDUCTION_TRAIN_CITIZEN + 600_000_000 + 40_000_000;
    expect(result.total).toBe(expected);
  });

  it('PRE_TRAIN: total includes funeral and judicial', () => {
    const decedent = makeDecedent({ dateOfDeath: '2015-01-01' });
    const funeral: FuneralExpense[] = [{ description: 'Funeral', amount: 15_000_000 }];
    const judicial: JudicialAdminExpense[] = [{ description: 'Atty', amount: 5_000_000 }];
    const result = computeSpecialDeductions(decedent, 'PRE_TRAIN', 500_000_000, undefined, funeral, judicial);
    // SD = ₱1M, funeral = ₱150K, judicial = ₱50K → total = ₱1.2M
    const expected = STANDARD_DEDUCTION_PRE_TRAIN_CITIZEN + 15_000_000 + 5_000_000;
    expect(result.total).toBe(expected);
  });

  it('TV-02 scenario: TRAIN married, exclusive FH ₱6M, medical ₱400K', () => {
    // From spec TV-02: SD ₱5M + FH ₱6M + medical ₱400K = ₱11.4M
    const decedent = makeDecedent({ isMarried: true });
    const familyHome = {
      fmv: 600_000_000,
      ownershipType: 'exclusive' as const,
      hasCertification: true,
    };
    const medical: MedicalExpense[] = [{ description: 'Hospital', amount: 40_000_000 }];
    const result = computeSpecialDeductions(decedent, 'TRAIN', 0, familyHome, undefined, undefined, medical);
    expect(result.total).toBe(1_140_000_000); // ₱11.4M in centavos? No...
    // Wait: ₱5M = 500_000_000 centavos; ₱6M = 600_000_000; ₱400K = 40_000_000
    // Total = 500M + 600M + 40M = 1_140_000_000 centavos = ₱11,400,000
    expect(result.total).toBe(500_000_000 + 600_000_000 + 40_000_000);
  });
});

// ── RA 4917 ──────────────────────────────────────────────────────────────────

describe('RA 4917 deduction', () => {
  it('citizen: ra4917 pass-through amount included in total', () => {
    const decedent = makeDecedent();
    const result = computeSpecialDeductions(
      decedent, 'TRAIN', 0, undefined, undefined, undefined, undefined, 50_000_000,
    );
    expect(result.total).toBe(STANDARD_DEDUCTION_TRAIN_CITIZEN + 50_000_000);
  });

  it('NRA: ra4917 = 0', () => {
    const decedent = makeDecedent({ isNRA: true });
    const result = computeSpecialDeductions(
      decedent, 'TRAIN', 0, undefined, undefined, undefined, undefined, 50_000_000,
    );
    // RA 4917 not available to NRA; only SD (500K for NRA)
    expect(result.total).toBe(STANDARD_DEDUCTION_NRA);
  });

  it('no ra4917 → 0 contribution', () => {
    const decedent = makeDecedent();
    const result = computeSpecialDeductions(decedent, 'TRAIN', 0);
    // Only standard deduction
    expect(result.total).toBe(STANDARD_DEDUCTION_TRAIN_CITIZEN);
  });
});
