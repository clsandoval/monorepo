/**
 * Edge case tests for the legal interest engine.
 *
 * Covers boundary conditions, overflow protection, and error handling.
 */

import { describe, it, expect } from 'vitest';
import { compute } from '../compute';
import { computeInterest } from '../interest';
import { daysBetween } from '../dates';
import type { ComputationInput } from '../types';

// ---------------------------------------------------------------------------
// Zero-duration periods
// ---------------------------------------------------------------------------

describe('same-day start and end dates → 0 interest', () => {
  it('target date equals demand date yields zero pre-finality interest', () => {
    const input: ComputationInput = {
      obligationType: 'loan_forbearance',
      claimType: 'liquidated',
      principalAmount: 10_000_000,
      demandDate: '2020-06-15',
      filingDate: '2020-06-15',
      targetDate: '2020-06-15',
    };
    const result = compute(input);
    expect(result.totalInterest).toBe(0);
    expect(result.grandTotal).toBe(input.principalAmount);
  });

  it('computeInterest with 0 days returns 0', () => {
    expect(computeInterest(10_000_000, 600, 0)).toBe(0);
  });

  it('computeInterest with 0 principal returns 0', () => {
    expect(computeInterest(0, 600, 365)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Large principal — no integer overflow
// ---------------------------------------------------------------------------

describe('very large principal → no overflow', () => {
  // ₱100M = 10_000_000_000 centavos
  const HUNDRED_MILLION_PESOS = 10_000_000_000;

  it('does not overflow for ₱100M principal at 6% for one year', () => {
    const interest = computeInterest(HUNDRED_MILLION_PESOS, 600, 365);
    // Expected: (10_000_000_000 * 600 * 365) / (10000 * 365) = 600_000_000 centavos = ₱6M
    expect(interest).toBe(600_000_000);
    expect(Number.isFinite(interest)).toBe(true);
    expect(interest).toBeLessThan(Number.MAX_SAFE_INTEGER);
  });

  it('compute() handles ₱100M principal without throwing', () => {
    const input: ComputationInput = {
      obligationType: 'loan_forbearance',
      claimType: 'liquidated',
      principalAmount: HUNDRED_MILLION_PESOS,
      demandDate: '2020-01-01',
      filingDate: '2020-06-01',
      targetDate: '2025-01-01',
    };
    expect(() => compute(input)).not.toThrow();
    const result = compute(input);
    expect(result.totalInterest).toBeGreaterThan(0);
    expect(Number.isFinite(result.grandTotal)).toBe(true);
  });

  it('grandTotal is a finite number for large principal with many years of interest', () => {
    const input: ComputationInput = {
      obligationType: 'loan_forbearance',
      claimType: 'liquidated',
      principalAmount: HUNDRED_MILLION_PESOS,
      demandDate: '2000-01-01',
      filingDate: '2000-06-01',
      judgmentDate: '2005-01-01',
      judgmentFinalityDate: '2010-01-01',
      targetDate: '2024-01-01',
    };
    const result = compute(input);
    expect(Number.isFinite(result.grandTotal)).toBe(true);
    expect(Number.isInteger(result.grandTotal)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Obligation entirely pre-2013 (no BSP transition split needed)
// ---------------------------------------------------------------------------

describe('obligation entirely pre-2013 → no transition split', () => {
  it('single period when both start and end are before BSP 799 effective date', () => {
    const input: ComputationInput = {
      obligationType: 'loan_forbearance',
      claimType: 'liquidated',
      principalAmount: 5_000_000,
      demandDate: '2005-01-01',
      filingDate: '2005-06-01',
      targetDate: '2010-01-01',
    };
    const result = compute(input);
    // No split at 2013-07-01 because entire range is pre-2013
    expect(result.periods.length).toBe(1);
    expect(result.periods[0].startDate).toBe('2005-01-01');
    expect(result.periods[0].endDate).toBe('2010-01-01');
  });

  it('pre-2013 loan uses 12% (RATE_PRE_BSP_LOAN)', () => {
    const input: ComputationInput = {
      obligationType: 'loan_forbearance',
      claimType: 'liquidated',
      principalAmount: 5_000_000,
      demandDate: '2005-01-01',
      filingDate: '2005-06-01',
      targetDate: '2010-01-01',
    };
    const result = compute(input);
    expect(result.periods[0].rateBps).toBe(1200);
  });

  it('pre-2013 non-loan uses 6% (RATE_PRE_BSP_NON_LOAN)', () => {
    const input: ComputationInput = {
      obligationType: 'non_loan',
      claimType: 'liquidated',
      principalAmount: 5_000_000,
      demandDate: '2005-01-01',
      filingDate: '2005-06-01',
      targetDate: '2010-01-01',
    };
    const result = compute(input);
    expect(result.periods[0].rateBps).toBe(600);
  });
});

// ---------------------------------------------------------------------------
// Obligation starting exactly on July 1, 2013 (BSP 799 effective date)
// ---------------------------------------------------------------------------

describe('obligation starting exactly on July 1, 2013', () => {
  it('single post-BSP period (no pre-BSP portion)', () => {
    const input: ComputationInput = {
      obligationType: 'loan_forbearance',
      claimType: 'liquidated',
      principalAmount: 10_000_000,
      demandDate: '2013-07-01',
      filingDate: '2013-07-01',
      targetDate: '2015-07-01',
    };
    const result = compute(input);
    // Start is exactly on BSP transition → entire period is post-BSP
    expect(result.periods.length).toBe(1);
    expect(result.periods[0].startDate).toBe('2013-07-01');
    expect(result.periods[0].rateBps).toBe(600); // 6% post-BSP
  });

  it('uses 6% regardless of obligation type when starting on 2013-07-01', () => {
    const loanInput: ComputationInput = {
      obligationType: 'loan_forbearance',
      claimType: 'liquidated',
      principalAmount: 10_000_000,
      demandDate: '2013-07-01',
      filingDate: '2013-07-01',
      targetDate: '2014-07-01',
    };
    const nonLoanInput: ComputationInput = {
      ...loanInput,
      obligationType: 'non_loan',
    };
    const loanResult = compute(loanInput);
    const nonLoanResult = compute(nonLoanInput);
    expect(loanResult.periods[0].rateBps).toBe(600);
    expect(nonLoanResult.periods[0].rateBps).toBe(600);
  });

  it('daysBetween returns expected days for year starting 2013-07-01', () => {
    // 2013-07-01 to 2014-07-01 = 365 days (non-leap year)
    expect(daysBetween('2013-07-01', '2014-07-01')).toBe(365);
  });
});

// ---------------------------------------------------------------------------
// Zero additional awards → empty array
// ---------------------------------------------------------------------------

describe('zero additional awards → empty array', () => {
  it('additionalAwards field is undefined when not provided', () => {
    const input: ComputationInput = {
      obligationType: 'loan_forbearance',
      claimType: 'liquidated',
      principalAmount: 5_000_000,
      demandDate: '2020-01-01',
      filingDate: '2020-06-01',
      targetDate: '2022-01-01',
    };
    const result = compute(input);
    expect(result.additionalAwards).toBeUndefined();
    expect(result.totalAdditionalAwards).toBe(0);
    expect(result.totalAdditionalAwardsInterest).toBe(0);
  });

  it('additionalAwards omitted from result when all award amounts are zero', () => {
    // When judgmentDate is missing, additional awards are skipped entirely
    const input: ComputationInput = {
      obligationType: 'loan_forbearance',
      claimType: 'liquidated',
      principalAmount: 5_000_000,
      demandDate: '2020-01-01',
      filingDate: '2020-06-01',
      targetDate: '2022-01-01',
      additionalAwards: {
        moralDamages: 0,
        exemplaryDamages: 0,
        attorneysFees: 0,
      },
    };
    // Without judgmentDate, compute() skips additional awards computation
    const result = compute(input);
    expect(result.additionalAwards).toBeUndefined();
    expect(result.totalAdditionalAwards).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Target date before demand date → error or zero
// ---------------------------------------------------------------------------

describe('target date before demand date', () => {
  it('returns negative or zero total interest when target is before demand', () => {
    // The engine does not validate date ordering — daysBetween returns negative.
    // computeInterest with negative days: BigInt division truncates toward zero
    // so interest should be negative (or potentially 0 due to truncation).
    // This test documents current behavior — the engine does not throw.
    const input: ComputationInput = {
      obligationType: 'loan_forbearance',
      claimType: 'liquidated',
      principalAmount: 10_000_000,
      demandDate: '2022-01-01',
      filingDate: '2022-06-01',
      targetDate: '2020-01-01', // target is BEFORE demand
    };
    // Should not throw (engine does not validate)
    expect(() => compute(input)).not.toThrow();
    const result = compute(input);
    // Interest should be <= 0 since target is before start
    expect(result.totalInterest).toBeLessThanOrEqual(0);
  });
});

// ---------------------------------------------------------------------------
// Future target date (valid — for projections)
// ---------------------------------------------------------------------------

describe('future target date (projection mode)', () => {
  it('accepts a target date in the future without throwing', () => {
    const input: ComputationInput = {
      obligationType: 'loan_forbearance',
      claimType: 'liquidated',
      principalAmount: 10_000_000,
      demandDate: '2023-01-01',
      filingDate: '2023-06-01',
      targetDate: '2028-01-01', // future date — projection
    };
    expect(() => compute(input)).not.toThrow();
  });

  it('produces positive interest for a future target date', () => {
    const input: ComputationInput = {
      obligationType: 'loan_forbearance',
      claimType: 'liquidated',
      principalAmount: 10_000_000,
      demandDate: '2023-01-01',
      filingDate: '2023-06-01',
      targetDate: '2028-01-01',
    };
    const result = compute(input);
    expect(result.totalInterest).toBeGreaterThan(0);
    expect(result.grandTotal).toBeGreaterThan(input.principalAmount);
  });

  it('post-finality projection accumulates interest correctly', () => {
    const input: ComputationInput = {
      obligationType: 'loan_forbearance',
      claimType: 'liquidated',
      principalAmount: 10_000_000,
      demandDate: '2023-01-01',
      filingDate: '2023-06-01',
      judgmentFinalityDate: '2025-01-01',
      targetDate: '2030-01-01', // 5 years post-finality projection
    };
    const result = compute(input);
    expect(result.postFinality).toBeDefined();
    expect(result.postFinality![0].interest).toBeGreaterThan(0);
  });
});
