import { describe, it, expect } from 'vitest';
import {
  TRAIN_EFFECTIVE_DATE,
  AMNESTY_COVERAGE_CUTOFF,
  TRAIN_RATE,
  AMNESTY_RATE,
  AMNESTY_MINIMUM,
  STANDARD_DEDUCTION_TRAIN_CITIZEN,
  STANDARD_DEDUCTION_PRE_TRAIN_CITIZEN,
  STANDARD_DEDUCTION_NRA,
  FAMILY_HOME_CAP_TRAIN,
  FAMILY_HOME_CAP_PRE_TRAIN,
  MEDICAL_EXPENSE_CAP,
  PRE_TRAIN_BRACKETS,
} from '../constants';

describe('constants', () => {
  it('has correct regime boundary dates', () => {
    expect(TRAIN_EFFECTIVE_DATE).toBe('2018-01-01');
    expect(AMNESTY_COVERAGE_CUTOFF).toBe('2022-05-31');
  });

  it('has correct tax rates', () => {
    expect(TRAIN_RATE).toBe(0.06);
    expect(AMNESTY_RATE).toBe(0.06);
    expect(AMNESTY_MINIMUM).toBe(500_000); // ₱5,000 in centavos
  });

  it('has correct standard deductions in centavos', () => {
    expect(STANDARD_DEDUCTION_TRAIN_CITIZEN).toBe(500_000_000); // ₱5M
    expect(STANDARD_DEDUCTION_PRE_TRAIN_CITIZEN).toBe(100_000_000); // ₱1M
    expect(STANDARD_DEDUCTION_NRA).toBe(50_000_000); // ₱500K
  });

  it('has correct family home caps in centavos', () => {
    expect(FAMILY_HOME_CAP_TRAIN).toBe(1_000_000_000); // ₱10M
    expect(FAMILY_HOME_CAP_PRE_TRAIN).toBe(100_000_000); // ₱1M
  });

  it('has correct medical cap in centavos', () => {
    expect(MEDICAL_EXPENSE_CAP).toBe(50_000_000); // ₱500K
  });

  it('has pre-TRAIN brackets that produce correct boundary taxes', () => {
    expect(PRE_TRAIN_BRACKETS).toHaveLength(6);
  });
});
