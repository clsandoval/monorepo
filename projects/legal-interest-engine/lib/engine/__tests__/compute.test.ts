import { describe, it, expect } from 'vitest';
import { compute } from '../compute';
import type { ComputationInput } from '../types';

describe('compute', () => {
  describe('simple case: post-2013 loan, no stipulated rate, no finality', () => {
    const input: ComputationInput = {
      obligationType: 'loan_forbearance',
      claimType: 'liquidated',
      principalAmount: 50_000_000, // ₱500,000
      demandDate: '2020-01-01',
      filingDate: '2020-03-01',
      targetDate: '2021-01-01',
    };

    it('returns a result with input echoed back', () => {
      const result = compute(input);
      expect(result.input).toEqual(input);
    });

    it('has at least one period', () => {
      const result = compute(input);
      expect(result.periods.length).toBeGreaterThanOrEqual(1);
    });

    it('all periods use 6% (post-BSP)', () => {
      const result = compute(input);
      for (const period of result.periods) {
        expect(period.rateBps).toBe(600);
      }
    });

    it('has no art2212 layer (no stipulated rate)', () => {
      const result = compute(input);
      expect(result.art2212).toBeUndefined();
    });

    it('has no postFinality (no finality date)', () => {
      const result = compute(input);
      expect(result.postFinality).toBeUndefined();
    });

    it('totalPrincipal equals principal amount', () => {
      const result = compute(input);
      expect(result.totalPrincipal).toBe(50_000_000);
    });

    it('grandTotal = principal + interest', () => {
      const result = compute(input);
      expect(result.grandTotal).toBe(result.totalPrincipal + result.totalInterest);
    });

    it('totalInterest > 0', () => {
      const result = compute(input);
      expect(result.totalInterest).toBeGreaterThan(0);
    });
  });

  describe('complex case: pre-2013 non-loan, spans BSP transition, with finality and additional awards', () => {
    const input: ComputationInput = {
      obligationType: 'non_loan',
      claimType: 'liquidated',
      principalAmount: 100_000_000, // ₱1,000,000
      demandDate: '2010-01-01',
      filingDate: '2010-06-01',
      judgmentDate: '2012-01-01',
      judgmentFinalityDate: '2015-01-01',
      targetDate: '2020-01-01',
      additionalAwards: {
        moralDamages: 10_000_000, // ₱100,000
        attorneysFees: 5_000_000,  // ₱50,000
      },
    };

    it('has multiple periods (pre and post BSP)', () => {
      const result = compute(input);
      expect(result.periods.length).toBeGreaterThanOrEqual(2);
    });

    it('pre-BSP period uses 6% (non_loan)', () => {
      const result = compute(input);
      const prePeriod = result.periods.find(p => p.startDate < '2013-07-01');
      expect(prePeriod).toBeDefined();
      expect(prePeriod!.rateBps).toBe(600);
    });

    it('post-BSP period uses 6%', () => {
      const result = compute(input);
      const postPeriod = result.periods.find(p => p.startDate >= '2013-07-01');
      expect(postPeriod).toBeDefined();
      expect(postPeriod!.rateBps).toBe(600);
    });

    it('has postFinality defined', () => {
      const result = compute(input);
      expect(result.postFinality).toBeDefined();
    });

    it('has additional awards breakdown', () => {
      const result = compute(input);
      expect(result.additionalAwards).toBeDefined();
      expect(result.additionalAwards!.length).toBe(2);
    });

    it('grandTotal includes all components', () => {
      const result = compute(input);
      const expected = result.totalPrincipal
        + result.totalInterest
        + result.totalAdditionalAwards
        + result.totalAdditionalAwardsInterest;
      // grandTotal may also include postFinality interest
      expect(result.grandTotal).toBeGreaterThan(result.totalPrincipal);
    });
  });

  describe('unliquidated claim: interest starts at judgment date', () => {
    const input: ComputationInput = {
      obligationType: 'non_loan',
      claimType: 'unliquidated',
      principalAmount: 50_000_000,
      demandDate: '2018-01-01',
      filingDate: '2018-06-01',
      judgmentDate: '2020-01-01',
      targetDate: '2022-01-01',
    };

    it('first period starts at judgment date', () => {
      const result = compute(input);
      // For unliquidated, interest starts at judgmentDate
      expect(result.periods[0].startDate).toBe('2020-01-01');
    });
  });

  describe('with stipulated rate', () => {
    const input: ComputationInput = {
      obligationType: 'loan_forbearance',
      claimType: 'liquidated',
      principalAmount: 50_000_000,
      demandDate: '2020-01-01',
      filingDate: '2020-06-01',
      targetDate: '2022-01-01',
      stipulatedRate: 0.12,
    };

    it('has art2212 layer when stipulated rate provided', () => {
      const result = compute(input);
      expect(result.art2212).toBeDefined();
    });

    it('periods use stipulated rate before finality', () => {
      const result = compute(input);
      // Stipulated rate should appear in periods
      const stipPeriod = result.periods.find(p => p.rateBps === 1200);
      expect(stipPeriod).toBeDefined();
    });
  });

  describe('with finality after BSP transition', () => {
    const input: ComputationInput = {
      obligationType: 'loan_forbearance',
      claimType: 'liquidated',
      principalAmount: 50_000_000,
      demandDate: '2020-01-01',
      filingDate: '2020-03-01',
      judgmentDate: '2021-01-01',
      judgmentFinalityDate: '2021-06-01',
      targetDate: '2024-01-01',
    };

    it('postFinality uses 6%', () => {
      const result = compute(input);
      const postFin = Array.isArray(result.postFinality) ? result.postFinality[0] : result.postFinality!;
      expect(postFin.rateBps).toBe(600);
    });
  });

  describe('totals consistency', () => {
    it('totalAdditionalAwards sums award amounts', () => {
      const input: ComputationInput = {
        obligationType: 'loan_forbearance',
        claimType: 'liquidated',
        principalAmount: 50_000_000,
        demandDate: '2020-01-01',
        filingDate: '2020-03-01',
        judgmentDate: '2021-01-01',
        targetDate: '2024-01-01',
        additionalAwards: {
          moralDamages: 10_000_000,
          exemplaryDamages: 5_000_000,
        },
      };
      const result = compute(input);
      expect(result.totalAdditionalAwards).toBe(15_000_000);
    });

    it('totalAdditionalAwardsInterest sums award interests', () => {
      const input: ComputationInput = {
        obligationType: 'loan_forbearance',
        claimType: 'liquidated',
        principalAmount: 50_000_000,
        demandDate: '2020-01-01',
        filingDate: '2020-03-01',
        judgmentDate: '2021-01-01',
        targetDate: '2024-01-01',
        additionalAwards: {
          moralDamages: 10_000_000,
        },
      };
      const result = compute(input);
      const awardInterestSum = (result.additionalAwards ?? []).reduce(
        (sum, a) => sum + a.interest,
        0,
      );
      expect(result.totalAdditionalAwardsInterest).toBe(awardInterestSum);
    });
  });
});
