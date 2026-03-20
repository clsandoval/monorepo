/**
 * Tests for Amnesty Computation — spec §14
 */

import { describe, it, expect } from 'vitest';
import { computeAmnesty, computeDualPathComparison } from '../amnesty';
import type { EstateFlags } from '../types';
import { AMNESTY_MINIMUM, PRE_TRAIN_CROSSOVER_NTE } from '../constants';

function makeFlags(overrides: Partial<EstateFlags> = {}): EstateFlags {
  return {
    hasConjugalAssets: false,
    hasFamilyHome: false,
    hasNRAAssets: false,
    hasForeignAssets: false,
    priorReturnFiled: false,
    previouslyDeclaredNetEstate: null,
    ...overrides,
  };
}

// ── §14.1 Amnesty Tax Computation ─────────────────────────────────────────

describe('computeAmnesty', () => {
  describe('Track A (no prior return)', () => {
    it('basic Track A: tax = NTE × 6%', () => {
      const flags = makeFlags({ priorReturnFiled: false });
      const result = computeAmnesty(500_000_000, flags); // ₱5M NTE
      // 5M * 6% = 300K = 30_000_000 centavos
      expect(result.amnestyTrack).toBe('TRACK_A');
      expect(result.amnestyTaxBase).toBe(500_000_000);
      expect(result.computedAmnestyTax).toBe(30_000_000);
      expect(result.estateTaxDue).toBe(30_000_000);
      expect(result.minimumApplied).toBe(false);
      expect(result.netEstateTaxDue).toBe(30_000_000);
      expect(result.foreignTaxCredit).toBe(0);
    });

    it('Track A: zero NTE → minimum applies', () => {
      const flags = makeFlags({ priorReturnFiled: false });
      const result = computeAmnesty(0, flags);
      expect(result.amnestyTaxBase).toBe(0);
      expect(result.computedAmnestyTax).toBe(0);
      expect(result.minimumApplied).toBe(true);
      expect(result.estateTaxDue).toBe(AMNESTY_MINIMUM); // ₱5,000 = 500,000 centavos
      expect(result.netEstateTaxDue).toBe(AMNESTY_MINIMUM);
    });

    it('TV-09b: NTE = ₱60K → computed = ₱3,600 → minimum ₱5,000 applies', () => {
      const flags = makeFlags({ priorReturnFiled: false });
      const result = computeAmnesty(6_000_000, flags); // ₱60K = 6M centavos
      // computed = 6M * 0.06 = 360_000 centavos = ₱3,600
      expect(result.computedAmnestyTax).toBe(360_000);
      expect(result.minimumApplied).toBe(true);
      expect(result.estateTaxDue).toBe(AMNESTY_MINIMUM); // 500_000 centavos = ₱5,000
    });
  });

  describe('Track B (prior return filed)', () => {
    it('Track B: base = max(0, NTE - previouslyDeclared)', () => {
      const flags = makeFlags({
        priorReturnFiled: true,
        previouslyDeclaredNetEstate: 200_000_000, // ₱2M
      });
      const result = computeAmnesty(500_000_000, flags); // NTE ₱5M
      // base = 5M - 2M = 3M = 300M centavos; tax = 300M * 0.06 = 18M centavos = ₱180K
      expect(result.amnestyTrack).toBe('TRACK_B');
      expect(result.previouslyDeclaredNet).toBe(200_000_000);
      expect(result.amnestyTaxBase).toBe(300_000_000);
      expect(result.computedAmnestyTax).toBe(18_000_000);
      expect(result.estateTaxDue).toBe(18_000_000);
      expect(result.minimumApplied).toBe(false);
    });

    it('Track B: previouslyDeclared > NTE → base = 0, minimum applies', () => {
      const flags = makeFlags({
        priorReturnFiled: true,
        previouslyDeclaredNetEstate: 600_000_000, // ₱6M > ₱5M NTE
      });
      const result = computeAmnesty(500_000_000, flags);
      expect(result.amnestyTaxBase).toBe(0);
      expect(result.minimumApplied).toBe(true);
      expect(result.estateTaxDue).toBe(AMNESTY_MINIMUM);
    });

    it('Track B: previouslyDeclared = 0 → same as Track A', () => {
      const flags = makeFlags({
        priorReturnFiled: true,
        previouslyDeclaredNetEstate: 0,
      });
      const result = computeAmnesty(500_000_000, flags);
      expect(result.amnestyTaxBase).toBe(500_000_000);
    });
  });

  it('minimum ₱5,000 always enforced even for large estates (computed > minimum)', () => {
    const flags = makeFlags({ priorReturnFiled: false });
    const result = computeAmnesty(1_000_000_000, flags); // ₱10M; tax = ₱600K >> ₱5K
    expect(result.minimumApplied).toBe(false);
    expect(result.estateTaxDue).toBe(60_000_000); // ₱600K
  });

  it('amnesty result has no foreign tax credit', () => {
    const flags = makeFlags({ priorReturnFiled: false });
    const result = computeAmnesty(500_000_000, flags);
    expect(result.foreignTaxCredit).toBe(0);
    expect(result.graduatedBracket).toBeNull();
    expect(result.amnestyTrack).toBe('TRACK_A');
  });
});

// ── §14.3 Dual Path Comparison ───────────────────────────────────────────────

describe('computeDualPathComparison', () => {
  it('amnesty lower → recommend AMNESTY', () => {
    const amnestyResult = {
      netTaxableEstate: 500_000_000,
      estateTaxDue: 30_000_000,
      foreignTaxCredit: 0,
      netEstateTaxDue: 30_000_000,
      graduatedBracket: null,
      amnestyTrack: 'TRACK_A' as const,
      previouslyDeclaredNet: null,
      amnestyTaxBase: 500_000_000,
      computedAmnestyTax: 30_000_000,
      minimumApplied: false,
    };
    const preTRAINResult = {
      ...amnestyResult,
      netEstateTaxDue: 50_000_000,
      estateTaxDue: 50_000_000,
      amnestyTrack: null,
      amnestyTaxBase: null,
      computedAmnestyTax: null,
    };
    const comparison = computeDualPathComparison(amnestyResult, preTRAINResult);
    expect(comparison.recommendedPath).toBe('AMNESTY');
    expect(comparison.crossoverNTE).toBe(PRE_TRAIN_CROSSOVER_NTE);
    expect(comparison.filingWindowClosed).toBe(true);
  });

  it('preTRAIN lower → recommend PRE_TRAIN', () => {
    const amnestyResult = {
      netTaxableEstate: 50_000_000,
      estateTaxDue: AMNESTY_MINIMUM,
      foreignTaxCredit: 0,
      netEstateTaxDue: AMNESTY_MINIMUM,
      graduatedBracket: null,
      amnestyTrack: 'TRACK_A' as const,
      previouslyDeclaredNet: null,
      amnestyTaxBase: 50_000_000,
      computedAmnestyTax: 3_000_000,
      minimumApplied: true,
    };
    const preTRAINResult = {
      ...amnestyResult,
      netEstateTaxDue: 0, // zero tax (below ₱200K threshold)
      estateTaxDue: 0,
      amnestyTrack: null,
      amnestyTaxBase: null,
      computedAmnestyTax: null,
      minimumApplied: false,
    };
    const comparison = computeDualPathComparison(amnestyResult, preTRAINResult);
    expect(comparison.recommendedPath).toBe('PRE_TRAIN');
  });

  it('equal taxes → recommend EQUAL', () => {
    // Crossover point: NTE = ₱1,250,000 → both produce ₱75K
    const baseResult = {
      netTaxableEstate: 125_000_000,
      estateTaxDue: 7_500_000,
      foreignTaxCredit: 0,
      netEstateTaxDue: 7_500_000,
      graduatedBracket: null,
      amnestyTrack: 'TRACK_A' as const,
      previouslyDeclaredNet: null,
      amnestyTaxBase: 125_000_000,
      computedAmnestyTax: 7_500_000,
      minimumApplied: false,
    };
    const preTRAINResult = {
      ...baseResult,
      amnestyTrack: null,
      amnestyTaxBase: null,
      computedAmnestyTax: null,
    };
    const comparison = computeDualPathComparison(baseResult, preTRAINResult);
    expect(comparison.recommendedPath).toBe('EQUAL');
  });

  it('stores both results and crossover NTE', () => {
    const amnestyResult = {
      netTaxableEstate: 500_000_000,
      estateTaxDue: 30_000_000,
      foreignTaxCredit: 0,
      netEstateTaxDue: 30_000_000,
      graduatedBracket: null,
      amnestyTrack: 'TRACK_A' as const,
      previouslyDeclaredNet: null,
      amnestyTaxBase: 500_000_000,
      computedAmnestyTax: 30_000_000,
      minimumApplied: false,
    };
    const preTRAINResult = { ...amnestyResult, netEstateTaxDue: 40_000_000, estateTaxDue: 40_000_000, amnestyTrack: null, amnestyTaxBase: null, computedAmnestyTax: null };
    const comparison = computeDualPathComparison(amnestyResult, preTRAINResult);
    expect(comparison.amnestyResult).toBe(amnestyResult);
    expect(comparison.preTRAINResult).toBe(preTRAINResult);
    expect(comparison.crossoverNTE).toBe(PRE_TRAIN_CROSSOVER_NTE);
    expect(comparison.filingWindowClosed).toBe(true);
  });
});
