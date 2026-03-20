/**
 * Tests for Surviving Spouse Share — spec §11 (Schedule 6A)
 */

import { describe, it, expect } from 'vitest';
import { computeSpouseShare } from '../spouse-share';
import type { DecedentInfo, GrossEstateResult, OrdinaryDeductionsResult } from '../types';

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeDecedent(overrides: Partial<DecedentInfo> = {}): DecedentInfo {
  return {
    name: 'Test',
    tin: '123',
    dateOfDeath: '2021-01-01',
    isResident: true,
    isFilipino: true,
    isNRA: false,
    isMarried: true,
    ...overrides,
  };
}

function makeGrossEstate(conjugal: number, exclusive = 0): GrossEstateResult {
  const zeroCV = { exclusive: 0, conjugal: 0, total: 0 };
  return {
    realProperty: zeroCV,
    familyHome: zeroCV,
    personalProperty: { exclusive, conjugal, total: exclusive + conjugal },
    taxableTransfers: zeroCV,
    businessInterest: zeroCV,
    total: { exclusive, conjugal, total: exclusive + conjugal },
  };
}

function makeOrdinaryDeductions(overrides: Partial<OrdinaryDeductionsResult> = {}): OrdinaryDeductionsResult {
  const zeroCV = { exclusive: 0, conjugal: 0, total: 0 };
  return {
    item5a_standard_deduction: zeroCV,
    item5b_claims_against_estate: zeroCV,
    item5c_claims_vs_insolvent: zeroCV,
    item5d_unpaid_mortgages: zeroCV,
    item5e_unpaid_taxes: zeroCV,
    item5f_casualty_losses: zeroCV,
    item5g_vanishing_deduction: zeroCV,
    item5h_transfers_for_public_use: zeroCV,
    total: zeroCV,
    ...overrides,
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('computeSpouseShare', () => {
  // EC-SS cases

  it('single decedent → share = 0', () => {
    const decedent = makeDecedent({ isMarried: false });
    const ge = makeGrossEstate(300_000_000);
    const od = makeOrdinaryDeductions();
    const result = computeSpouseShare(decedent, ge, od, 'TRAIN');
    expect(result.spouseShare).toBe(0);
    expect(result.totalConjugalAssets).toBe(0);
  });

  it('married ACP: basic spouse share computation', () => {
    // conjugal assets = ₱3M; ELIT conjugal = ₱500K → net conjugal = ₱2.5M → spouse share = ₱1.25M
    const decedent = makeDecedent({ isMarried: true });
    const ge = makeGrossEstate(300_000_000); // ₱3M conjugal
    const od = makeOrdinaryDeductions({
      item5b_claims_against_estate: { exclusive: 0, conjugal: 50_000_000, total: 50_000_000 },
      total: { exclusive: 0, conjugal: 50_000_000, total: 50_000_000 },
    });
    const result = computeSpouseShare(decedent, ge, od, 'TRAIN');
    expect(result.totalConjugalAssets).toBe(300_000_000);
    expect(result.conjugalObligations).toBe(50_000_000);
    expect(result.netConjugalProperty).toBe(250_000_000);
    expect(result.spouseShare).toBe(125_000_000); // 50% of 250M
  });

  it('TV-02: ACP community assets ₱3M, ELIT conjugal ₱500K, spouse share ₱1.25M', () => {
    const decedent = makeDecedent({ isMarried: true });
    const ge = makeGrossEstate(300_000_000, 1_200_000_000); // conjugal ₱3M, exclusive ₱12M
    const od = makeOrdinaryDeductions({
      item5b_claims_against_estate: { exclusive: 0, conjugal: 50_000_000, total: 50_000_000 },
      total: { exclusive: 0, conjugal: 50_000_000, total: 50_000_000 },
    });
    const result = computeSpouseShare(decedent, ge, od, 'TRAIN');
    expect(result.totalConjugalAssets).toBe(300_000_000);
    expect(result.conjugalObligations).toBe(50_000_000);
    expect(result.netConjugalProperty).toBe(250_000_000);
    expect(result.spouseShare).toBe(125_000_000);
  });

  it('separation of property → share = 0', () => {
    // isMarried = true but separation of property regime
    const decedent = makeDecedent({ isMarried: true });
    const ge = makeGrossEstate(300_000_000);
    const od = makeOrdinaryDeductions();
    const result = computeSpouseShare(decedent, ge, od, 'TRAIN', 'SEPARATION');
    expect(result.spouseShare).toBe(0);
    expect(result.totalConjugalAssets).toBe(0);
  });

  it('EC-SS-05: conjugal obligations exceed conjugal assets → netConjugalProperty = 0, spouseShare = 0', () => {
    const decedent = makeDecedent({ isMarried: true });
    const ge = makeGrossEstate(100_000_000); // ₱1M conjugal
    const od = makeOrdinaryDeductions({
      item5b_claims_against_estate: { exclusive: 0, conjugal: 200_000_000, total: 200_000_000 }, // ₱2M
      total: { exclusive: 0, conjugal: 200_000_000, total: 200_000_000 },
    });
    const result = computeSpouseShare(decedent, ge, od, 'TRAIN');
    expect(result.netConjugalProperty).toBe(0);
    expect(result.spouseShare).toBe(0);
  });

  it('EC-SS-06: vanishing deduction (5G) does NOT reduce conjugal pool', () => {
    const decedent = makeDecedent({ isMarried: true });
    const ge = makeGrossEstate(1_000_000_000); // ₱10M conjugal
    const od = makeOrdinaryDeductions({
      item5g_vanishing_deduction: { exclusive: 0, conjugal: 500_000_000, total: 500_000_000 },
      total: { exclusive: 0, conjugal: 500_000_000, total: 500_000_000 },
    });
    const result = computeSpouseShare(decedent, ge, od, 'TRAIN');
    // Vanishing deduction does NOT reduce conjugal obligations
    expect(result.conjugalObligations).toBe(0);
    expect(result.netConjugalProperty).toBe(1_000_000_000);
    expect(result.spouseShare).toBe(500_000_000);
  });

  it('public use transfers (5H) do NOT reduce conjugal pool', () => {
    const decedent = makeDecedent({ isMarried: true });
    const ge = makeGrossEstate(1_000_000_000);
    const od = makeOrdinaryDeductions({
      item5h_transfers_for_public_use: { exclusive: 0, conjugal: 500_000_000, total: 500_000_000 },
      total: { exclusive: 0, conjugal: 500_000_000, total: 500_000_000 },
    });
    const result = computeSpouseShare(decedent, ge, od, 'TRAIN');
    expect(result.conjugalObligations).toBe(0);
    expect(result.spouseShare).toBe(500_000_000);
  });

  it('TRAIN: funeral (5A) does NOT reduce conjugal pool', () => {
    // TRAIN deductionRules: funeral not included in ELIT obligations
    const decedent = makeDecedent({ isMarried: true });
    const ge = makeGrossEstate(1_000_000_000);
    const od = makeOrdinaryDeductions({
      item5a_standard_deduction: { exclusive: 0, conjugal: 50_000_000, total: 50_000_000 },
      total: { exclusive: 0, conjugal: 50_000_000, total: 50_000_000 },
    });
    const result = computeSpouseShare(decedent, ge, od, 'TRAIN');
    // TRAIN: funeral 5a is zero anyway; but even if set, should not reduce conjugal obligations for TRAIN
    expect(result.conjugalObligations).toBe(0);
  });

  it('PRE_TRAIN: funeral (item5a) included in conjugal obligations', () => {
    // PRE_TRAIN: funeral + judicial ARE included in conjugal obligations
    const decedent = makeDecedent({ isMarried: true });
    const ge = makeGrossEstate(1_000_000_000); // ₱10M conjugal
    const od = makeOrdinaryDeductions({
      item5a_standard_deduction: { exclusive: 0, conjugal: 50_000_000, total: 50_000_000 }, // funeral
      total: { exclusive: 0, conjugal: 50_000_000, total: 50_000_000 },
    });
    const result = computeSpouseShare(decedent, ge, od, 'PRE_TRAIN');
    expect(result.conjugalObligations).toBe(50_000_000);
    expect(result.netConjugalProperty).toBe(950_000_000);
    expect(result.spouseShare).toBe(475_000_000);
  });

  it('PRE_TRAIN: judicial (item5b portion) included in conjugal obligations', () => {
    // item5b contains both claims + judicial (as per ordinary-deductions implementation)
    const decedent = makeDecedent({ isMarried: true });
    const ge = makeGrossEstate(500_000_000); // ₱5M conjugal
    const od = makeOrdinaryDeductions({
      item5b_claims_against_estate: { exclusive: 0, conjugal: 30_000_000, total: 30_000_000 },
      total: { exclusive: 0, conjugal: 30_000_000, total: 30_000_000 },
    });
    const result = computeSpouseShare(decedent, ge, od, 'PRE_TRAIN');
    expect(result.conjugalObligations).toBe(30_000_000);
  });

  it('all zero conjugal assets → spouse share = 0', () => {
    const decedent = makeDecedent({ isMarried: true });
    const ge = makeGrossEstate(0, 1_000_000_000); // all exclusive, no conjugal
    const od = makeOrdinaryDeductions();
    const result = computeSpouseShare(decedent, ge, od, 'TRAIN');
    expect(result.totalConjugalAssets).toBe(0);
    expect(result.spouseShare).toBe(0);
  });

  it('ELIT from all 5B-5F columns summed for TRAIN', () => {
    // TRAIN: only 5B(claims), 5C(insolvent), 5D(mortgages), 5E(taxes), 5F(casualties) reduce pool
    const decedent = makeDecedent({ isMarried: true });
    const ge = makeGrossEstate(1_000_000_000);
    const od = makeOrdinaryDeductions({
      item5b_claims_against_estate: { exclusive: 0, conjugal: 10_000_000, total: 10_000_000 },
      item5c_claims_vs_insolvent: { exclusive: 0, conjugal: 20_000_000, total: 20_000_000 },
      item5d_unpaid_mortgages: { exclusive: 0, conjugal: 30_000_000, total: 30_000_000 },
      item5e_unpaid_taxes: { exclusive: 0, conjugal: 5_000_000, total: 5_000_000 },
      item5f_casualty_losses: { exclusive: 0, conjugal: 15_000_000, total: 15_000_000 },
      total: { exclusive: 0, conjugal: 80_000_000, total: 80_000_000 },
    });
    const result = computeSpouseShare(decedent, ge, od, 'TRAIN');
    expect(result.conjugalObligations).toBe(80_000_000);
    expect(result.netConjugalProperty).toBe(920_000_000);
    expect(result.spouseShare).toBe(460_000_000);
  });
});
