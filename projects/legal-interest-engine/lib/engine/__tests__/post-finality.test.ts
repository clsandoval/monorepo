import { describe, it, expect } from 'vitest';
import { computePostFinality } from '../post-finality';

describe('computePostFinality', () => {
  it('returns null when no judgmentFinalityDate', () => {
    const result = computePostFinality(
      10_000_000,
      5_000_000,
      undefined,
      undefined,
      '2024-01-01',
    );
    expect(result).toBeNull();
  });

  it('returns null when judgmentFinalityDate equals targetDate', () => {
    const result = computePostFinality(
      10_000_000,
      5_000_000,
      undefined,
      '2020-01-01',
      '2020-01-01',
    );
    expect(result).not.toBeNull();
    // Days should be 0
    const period = Array.isArray(result) ? result[0] : result!;
    expect(period.days).toBe(0);
    expect(period.interest).toBe(0);
  });

  describe('without stipulated rate', () => {
    it('computes 6% on totalJudgment from finality to target (post-BSP)', () => {
      // totalJudgment = 10_000_000 centavos (₱100,000)
      // Finality: 2020-01-01, Target: 2021-01-01 (366 days - 2020 is leap)
      // Interest = (10_000_000 * 600 * 366) / (10000 * 365)
      const result = computePostFinality(
        10_000_000,
        5_000_000,
        undefined,
        '2020-01-01',
        '2021-01-01',
      );
      expect(result).not.toBeNull();
      const period = Array.isArray(result) ? result[0] : result!;
      expect(period.rateBps).toBe(600);
      expect(period.baseAmount).toBe(10_000_000);
      expect(period.days).toBe(366);
    });

    it('uses 12% for judgment final before BSP transition', () => {
      // Finality: 2010-01-01, Target: 2011-01-01
      const result = computePostFinality(
        10_000_000,
        5_000_000,
        undefined,
        '2010-01-01',
        '2011-01-01',
      );
      expect(result).not.toBeNull();
      const period = Array.isArray(result) ? result[0] : result!;
      expect(period.rateBps).toBe(1200);
    });
  });

  describe('with stipulated rate', () => {
    it('stipulated continues on principal AND 6% on totalJudgment', () => {
      // This returns two ComputationPeriods or an array
      const result = computePostFinality(
        15_000_000,  // totalJudgment
        10_000_000,  // principal
        0.12,        // stipulated rate
        '2020-01-01',
        '2021-01-01',
      );
      expect(result).not.toBeNull();
      // Should return array with at least 2 elements: stipulated on principal + 6% on total
      const periods = Array.isArray(result) ? result : [result!];
      expect(periods.length).toBeGreaterThanOrEqual(2);

      // Find the stipulated period (on principal)
      const stipPeriod = periods.find(p => p.rateBps !== 600);
      expect(stipPeriod).toBeDefined();
      expect(stipPeriod!.baseAmount).toBe(10_000_000);

      // Find the legal rate period (on totalJudgment)
      const legalPeriod = periods.find(p => p.rateBps === 600 && p.baseAmount === 15_000_000);
      expect(legalPeriod).toBeDefined();
    });
  });

  describe('edge cases', () => {
    it('handles finality exactly at BSP transition', () => {
      const result = computePostFinality(
        10_000_000,
        5_000_000,
        undefined,
        '2013-07-01',
        '2014-01-01',
      );
      expect(result).not.toBeNull();
      const period = Array.isArray(result) ? result[0] : result!;
      expect(period.rateBps).toBe(600);
    });

    it('labels the period correctly', () => {
      const result = computePostFinality(
        10_000_000,
        5_000_000,
        undefined,
        '2020-01-01',
        '2021-01-01',
      );
      const period = Array.isArray(result) ? result[0] : result!;
      expect(period.label).toBeTruthy();
      expect(period.startDate).toBe('2020-01-01');
      expect(period.endDate).toBe('2021-01-01');
    });
  });
});
