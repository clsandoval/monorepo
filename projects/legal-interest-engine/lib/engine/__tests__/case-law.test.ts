/**
 * Case law integration tests.
 *
 * These tests verify that the engine produces results consistent with
 * landmark Supreme Court decisions on interest computation:
 *
 *   - Nacar v. Gallery Frames, G.R. No. 189871 (August 13, 2013)
 *   - Isla v. Estorga, G.R. No. 233974 (July 2, 2018)
 *
 * Amounts are in centavos (1 PHP = 100 centavos).
 */

import { describe, it, expect } from 'vitest';
import { compute } from '../compute';
import type { ComputationInput } from '../types';

// ---------------------------------------------------------------------------
// Nacar v. Gallery Frames — G.R. No. 189871 (August 13, 2013)
// ---------------------------------------------------------------------------
// Facts:
//   - Employee illegally dismissed: November 1997
//   - LA Decision (backwages + separation pay): October 1998 — ₱158,919.20
//   - SC Resolution became final: May 27, 2008
//   - Obligation type: labor award (non_loan), unliquidated
//   - Pre-finality: 6% (non_loan, pre-BSP) from judgment date to finality
//   - Post-finality: 12% from finality until June 30, 2013;
//                    6% from July 1, 2013 until satisfaction
//
// NOTE (implementation concern): The current post-finality engine does NOT split
// the post-finality period at the BSP 799 transition. It uses getPostFinalityRate()
// which returns a single rate based on the finality date. Since finality is
// 2008-05-27 (pre-BSP), it applies 12% for the entire post-finality period
// — including the portion after July 1, 2013. This means the engine does NOT
// implement the Nacar ruling's explicit directive that "thereafter, 6% p.a."
// applies after BSP Circular 799 takes effect.
//
// See: flag below in the post-finality tests.
// ---------------------------------------------------------------------------

describe('Case law: Nacar v. Gallery Frames', () => {
  const input: ComputationInput = {
    obligationType: 'non_loan',
    claimType: 'unliquidated',
    principalAmount: 15_891_920, // ₱158,919.20 in centavos
    demandDate: '1997-11-01',
    filingDate: '1997-11-01',
    judgmentDate: '1998-10-15',
    judgmentFinalityDate: '2008-05-27',
    targetDate: '2013-10-15',
  };

  it('echoes input back', () => {
    const result = compute(input);
    expect(result.input).toEqual(input);
  });

  it('interest starts from judgment date (unliquidated claim)', () => {
    const result = compute(input);
    // Unliquidated → Art. 2213 → interest begins at judgment date
    expect(result.periods[0].startDate).toBe('1998-10-15');
  });

  it('pre-finality period uses 6% (non_loan, pre-BSP 799)', () => {
    const result = compute(input);
    // Entire pre-finality period (1998-10-15 to 2008-05-27) is pre-BSP 799
    // non_loan pre-BSP rate = 6% = 600 bps
    for (const period of result.periods) {
      expect(period.rateBps).toBe(600);
    }
  });

  it('pre-finality ends at finality date', () => {
    const result = compute(input);
    const lastPreFinality = result.periods[result.periods.length - 1];
    expect(lastPreFinality.endDate).toBe('2008-05-27');
  });

  it('no Art. 2212 layer (no stipulated interest)', () => {
    const result = compute(input);
    expect(result.art2212).toBeUndefined();
  });

  it('no additional awards (none provided)', () => {
    const result = compute(input);
    expect(result.additionalAwards).toBeUndefined();
  });

  it('has post-finality interest', () => {
    const result = compute(input);
    expect(result.postFinality).toBeDefined();
    expect(result.postFinality!.length).toBeGreaterThanOrEqual(1);
  });

  it('post-finality starts at finality date', () => {
    const result = compute(input);
    expect(result.postFinality![0].startDate).toBe('2008-05-27');
  });

  it('post-finality base includes principal + pre-finality interest', () => {
    const result = compute(input);
    const preFinalityInterest = result.periods.reduce((sum, p) => sum + p.interest, 0);
    const expectedBase = input.principalAmount + preFinalityInterest;
    expect(result.postFinality![0].baseAmount).toBe(expectedBase);
  });

  it('totalPrincipal equals input principal', () => {
    const result = compute(input);
    expect(result.totalPrincipal).toBe(15_891_920);
  });

  it('grandTotal > principal (interest accrued over 15+ years)', () => {
    const result = compute(input);
    expect(result.grandTotal).toBeGreaterThan(input.principalAmount);
  });

  it('grandTotal = principal + total interest', () => {
    const result = compute(input);
    expect(result.grandTotal).toBe(result.totalPrincipal + result.totalInterest);
  });

  it('pre-finality interest amount is reasonable (~₱91,746 over ~9.6 years at 6%)', () => {
    const result = compute(input);
    const preFinality = result.periods.reduce((sum, p) => sum + p.interest, 0);
    // Expected: ~9,174,644 centavos (₱91,746.44)
    expect(preFinality).toBe(9_174_644);
  });

  /**
   * SPEC COMPLIANCE CONCERN — Post-Finality BSP Transition Split:
   *
   * Nacar v. Gallery Frames explicitly rules that once BSP Circular 799 takes
   * effect on July 1, 2013, ALL monetary obligations earn only 6% p.a. —
   * including those whose judgment finality predates BSP 799.
   *
   * The current post-finality implementation does NOT split at July 1, 2013.
   * It calls getPostFinalityRate(judgmentFinalityDate) which returns 12% for
   * pre-BSP finality dates and applies that single rate for the ENTIRE
   * post-finality period, even the portion after July 1, 2013.
   *
   * This test documents the CURRENT (non-conforming) behavior. It should be
   * updated when the engine is fixed to split post-finality at BSP transition.
   */
  it('[KNOWN ISSUE] post-finality uses single 12% rate (should split at 2013-07-01)', () => {
    const result = compute(input);
    // Current behavior: single period at 12% (finality pre-BSP)
    // Correct behavior per Nacar: 12% until 2013-06-30, 6% from 2013-07-01
    expect(result.postFinality!.length).toBe(1);
    expect(result.postFinality![0].rateBps).toBe(1200); // 12% — documents current bug
  });
});

// ---------------------------------------------------------------------------
// Isla v. Estorga — G.R. No. 233974 (July 2, 2018)
// ---------------------------------------------------------------------------
// Facts:
//   - Principal: ₱100,000 loan
//   - Stipulated interest: 12% p.a.
//   - Default / extrajudicial demand: ~January 15, 2008
//   - Judicial filing: June 1, 2008
//   - Judgment finality: July 2, 2016
//
// Expected layers:
//   1. Pre-finality: stipulated 12% on ₱100,000 from demand to finality
//      (engine uses stipulated rate, not legal rate, for pre-finality)
//   2. Art. 2212: legal rate on accrued stipulated interest (demand→filing)
//      running from filing date → finality
//   3. Post-finality (finality post-BSP → 6%):
//      a. Stipulated 12% continues on principal
//      b. 6% legal rate on total judgment
// ---------------------------------------------------------------------------

describe('Case law: Isla v. Estorga', () => {
  const input: ComputationInput = {
    obligationType: 'loan_forbearance',
    claimType: 'liquidated',
    principalAmount: 10_000_000, // ₱100,000 in centavos
    demandDate: '2008-01-15',
    filingDate: '2008-06-01',
    judgmentFinalityDate: '2016-07-02',
    stipulatedRate: 0.12,
    targetDate: '2018-07-02',
  };

  it('echoes input back', () => {
    const result = compute(input);
    expect(result.input).toEqual(input);
  });

  it('interest starts from demand date (liquidated claim)', () => {
    const result = compute(input);
    expect(result.periods[0].startDate).toBe('2008-01-15');
  });

  it('pre-finality periods use stipulated rate (1200 bps = 12%)', () => {
    const result = compute(input);
    // compute.ts uses stipulated rate for ALL pre-finality periods when stipulatedRate is set
    for (const period of result.periods) {
      expect(period.rateBps).toBe(1200);
    }
  });

  it('pre-finality spans BSP transition but uses stipulated rate throughout', () => {
    const result = compute(input);
    // Period spans 2008 to 2016, crossing 2013-07-01
    // With stipulated rate, both sub-periods use 12% stipulated (not legal rate)
    expect(result.periods.length).toBeGreaterThanOrEqual(1);
    for (const period of result.periods) {
      expect(period.rateBps).toBe(1200); // stipulated 12%, not 6% legal post-BSP
    }
  });

  it('has Art. 2212 layer (stipulated interest exists)', () => {
    const result = compute(input);
    expect(result.art2212).toBeDefined();
  });

  it('Art. 2212 accrued interest is based on demand→filing period', () => {
    const result = compute(input);
    const art = result.art2212!;
    // demand (2008-01-15) to filing (2008-06-01) = 138 days
    // Accrued = (10_000_000 * 1200 * 138) / (10000 * 365) = 453,698 centavos
    expect(art.accruedStipulatedInterest).toBe(453_698);
  });

  it('Art. 2212 layer uses legal rate (12% pre-BSP loan, filing date 2008-06-01)', () => {
    const result = compute(input);
    // Filing date is pre-BSP, obligation is loan_forbearance → legal rate = 12%
    expect(result.art2212!.rateBps).toBe(1200);
  });

  it('Art. 2212 runs from filing date to pre-finality end', () => {
    const result = compute(input);
    expect(result.art2212!.startDate).toBe('2008-06-01');
  });

  it('has post-finality interest (finality date provided)', () => {
    const result = compute(input);
    expect(result.postFinality).toBeDefined();
  });

  it('post-finality has two periods (stipulated on principal + legal on total judgment)', () => {
    const result = compute(input);
    // With stipulated rate + post-BSP finality → computePostFinality returns two periods
    expect(result.postFinality!.length).toBe(2);
  });

  it('first post-finality period: stipulated 12% on principal', () => {
    const result = compute(input);
    const stipPeriod = result.postFinality![0];
    expect(stipPeriod.rateBps).toBe(1200); // 12% stipulated
    expect(stipPeriod.baseAmount).toBe(10_000_000); // principal only
  });

  it('second post-finality period: 6% legal rate on total judgment', () => {
    const result = compute(input);
    const legalPeriod = result.postFinality![1];
    expect(legalPeriod.rateBps).toBe(600); // 6% post-BSP
  });

  it('post-finality base (legal period) equals principal + all pre-finality interest', () => {
    const result = compute(input);
    const preFinalityInterest = result.periods.reduce((sum, p) => sum + p.interest, 0);
    const art2212Interest = result.art2212!.interest;
    const expectedTotalJudgment = input.principalAmount + preFinalityInterest + art2212Interest;
    expect(result.postFinality![1].baseAmount).toBe(expectedTotalJudgment);
  });

  it('totalPrincipal equals input principal', () => {
    const result = compute(input);
    expect(result.totalPrincipal).toBe(10_000_000);
  });

  it('grandTotal = principal + total interest (no additional awards)', () => {
    const result = compute(input);
    expect(result.grandTotal).toBe(result.totalPrincipal + result.totalInterest);
  });

  it('grandTotal > principal (interest accrued over 10+ years)', () => {
    const result = compute(input);
    expect(result.grandTotal).toBeGreaterThan(input.principalAmount);
  });

  it('pre-finality split into two sub-periods at BSP transition', () => {
    const result = compute(input);
    // 2008-01-15 to 2016-07-02 spans 2013-07-01 → two sub-periods
    expect(result.periods.length).toBe(2);
    expect(result.periods[0].startDate).toBe('2008-01-15');
    expect(result.periods[0].endDate).toBe('2013-06-30');
    expect(result.periods[1].startDate).toBe('2013-07-01');
    expect(result.periods[1].endDate).toBe('2016-07-02');
  });

  it('pre-finality total interest matches expected amounts', () => {
    const result = compute(input);
    // Sub-period 1: 2008-01-15 to 2013-06-30 = 1993 days @ 12% stipulated
    // Expected: (10_000_000 * 1200 * 1993) / (10000 * 365) = 6,552,328
    expect(result.periods[0].interest).toBe(6_552_328);
    // Sub-period 2: 2013-07-01 to 2016-07-02 = 1097 days @ 12% stipulated
    // Expected: (10_000_000 * 1200 * 1097) / (10000 * 365) = 3,606,575
    expect(result.periods[1].interest).toBe(3_606_575);
  });
});
