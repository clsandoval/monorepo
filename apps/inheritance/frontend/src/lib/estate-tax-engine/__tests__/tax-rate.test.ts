/**
 * Tests for Tax Rate Application — spec §12
 */

import { describe, it, expect } from 'vitest';
import { computeTax } from '../tax-rate';

// ── §12.1 TRAIN Rate ──────────────────────────────────────────────────────────

describe('computeTax - TRAIN', () => {
  it('zero NTE → zero tax', () => {
    const result = computeTax(0, 'TRAIN');
    expect(result.estateTaxDue).toBe(0);
    expect(result.graduatedBracket).toBeNull();
  });

  it('TRAIN: ₱1M NTE → ₱60,000 tax', () => {
    const result = computeTax(100_000_000, 'TRAIN'); // ₱1M
    expect(result.estateTaxDue).toBe(6_000_000); // ₱60K
  });

  it('TRAIN: ₱4M NTE → ₱240,000 (TV-01)', () => {
    const result = computeTax(400_000_000, 'TRAIN');
    expect(result.estateTaxDue).toBe(24_000_000); // ₱240K
  });

  it('TRAIN: large estate ₱50M → ₱3M tax', () => {
    const result = computeTax(5_000_000_000, 'TRAIN'); // ₱50M
    expect(result.estateTaxDue).toBe(300_000_000); // ₱3M
  });

  it('TRAIN: no graduated bracket', () => {
    const result = computeTax(100_000_000, 'TRAIN');
    expect(result.graduatedBracket).toBeNull();
  });
});

// ── §12.2 Pre-TRAIN Graduated Rate ─────────────────────────────────────────

describe('computeTax - PRE_TRAIN', () => {
  it('NTE = 0 → zero tax, bracket 1', () => {
    const result = computeTax(0, 'PRE_TRAIN');
    expect(result.estateTaxDue).toBe(0);
    expect(result.graduatedBracket).not.toBeNull();
  });

  it('NTE ≤ ₱200K → zero tax (exempt bracket)', () => {
    // ₱200K = 20_000_000 centavos
    const result = computeTax(20_000_000, 'PRE_TRAIN');
    expect(result.estateTaxDue).toBe(0);
    expect(result.graduatedBracket!.bracketRate).toBe(0);
  });

  it('NTE = ₱300K → 5% bracket: (300K - 200K) × 5% = ₱5,000', () => {
    // ₱300K = 30_000_000 centavos; excess over 200K = 100K = 10_000_000 centavos
    const result = computeTax(30_000_000, 'PRE_TRAIN');
    expect(result.estateTaxDue).toBe(500_000); // ₱5K = 500,000 centavos
    expect(result.graduatedBracket!.bracketRate).toBe(0.05);
    expect(result.graduatedBracket!.baseTax).toBe(0);
    expect(result.graduatedBracket!.excessAmount).toBe(10_000_000);
  });

  it('boundary: NTE = ₱500K → ₱15,000 tax (bracket 2 top)', () => {
    // Tax at ₱500K = (300K × 0.05) = ₱15K = 1_500_000 centavos
    const result = computeTax(50_000_000, 'PRE_TRAIN');
    expect(result.estateTaxDue).toBe(1_500_000);
    expect(result.graduatedBracket!.bracketRate).toBe(0.05);
  });

  it('NTE = ₱1M → 8% bracket: ₱15K + (1M - 500K) × 8% = ₱55,000', () => {
    // ₱1M = 100_000_000 centavos; excess over 500K = 500K = 50_000_000 centavos
    // tax = 1_500_000 + 50_000_000 × 0.08 = 1_500_000 + 4_000_000 = 5_500_000 centavos = ₱55K
    const result = computeTax(100_000_000, 'PRE_TRAIN');
    expect(result.estateTaxDue).toBe(5_500_000);
    expect(result.graduatedBracket!.bracketRate).toBe(0.08);
    expect(result.graduatedBracket!.baseTax).toBe(1_500_000);
  });

  it('boundary: NTE = ₱2M → ₱135,000 (bracket 3 top)', () => {
    // ₱2M = 200_000_000 centavos
    const result = computeTax(200_000_000, 'PRE_TRAIN');
    expect(result.estateTaxDue).toBe(13_500_000); // ₱135K = 13_500_000 centavos
  });

  it('NTE = ₱2.85M (TV-07) → 11% bracket: ₱135K + 850K × 11% = ₱228,500', () => {
    // ₱2.85M = 285_000_000 centavos; excess over 2M = 850K = 85_000_000 centavos
    // tax = 13_500_000 + 85_000_000 × 0.11 = 13_500_000 + 9_350_000 = 22_850_000 centavos = ₱228.5K
    const result = computeTax(285_000_000, 'PRE_TRAIN');
    expect(result.estateTaxDue).toBe(22_850_000);
    expect(result.graduatedBracket!.bracketRate).toBe(0.11);
    expect(result.graduatedBracket!.baseTax).toBe(13_500_000);
  });

  it('boundary: NTE = ₱5M → ₱465,000 (bracket 4 top)', () => {
    const result = computeTax(500_000_000, 'PRE_TRAIN');
    expect(result.estateTaxDue).toBe(46_500_000); // ₱465K = 46_500_000 centavos
  });

  it('NTE = ₱7.5M → 15% bracket: ₱465K + 2.5M × 15% = ₱840,000', () => {
    // ₱7.5M = 750_000_000; excess over 5M = 2.5M = 250_000_000
    // tax = 46_500_000 + 250_000_000 × 0.15 = 46_500_000 + 37_500_000 = 84_000_000 = ₱840K
    const result = computeTax(750_000_000, 'PRE_TRAIN');
    expect(result.estateTaxDue).toBe(84_000_000);
    expect(result.graduatedBracket!.bracketRate).toBe(0.15);
  });

  it('boundary: NTE = ₱10M → ₱1,215,000 (bracket 5 top)', () => {
    const result = computeTax(1_000_000_000, 'PRE_TRAIN');
    expect(result.estateTaxDue).toBe(121_500_000); // ₱1.215M = 121_500_000 centavos
  });

  it('NTE > ₱10M → 20% bracket: ₱1.215M + excess × 20%', () => {
    // ₱15M = 1_500_000_000; excess over 10M = 5M = 500_000_000
    // tax = 121_500_000 + 500_000_000 × 0.20 = 121_500_000 + 100_000_000 = 221_500_000 = ₱2.215M
    const result = computeTax(1_500_000_000, 'PRE_TRAIN');
    expect(result.estateTaxDue).toBe(221_500_000);
    expect(result.graduatedBracket!.bracketRate).toBe(0.20);
    expect(result.graduatedBracket!.bracketMax).toBeNull();
    expect(result.graduatedBracket!.baseTax).toBe(121_500_000);
  });

  it('pre-TRAIN returns GraduatedBracketResult with all fields', () => {
    const result = computeTax(30_000_000, 'PRE_TRAIN');
    const b = result.graduatedBracket!;
    expect(b).toHaveProperty('bracketMin');
    expect(b).toHaveProperty('bracketMax');
    expect(b).toHaveProperty('bracketRate');
    expect(b).toHaveProperty('baseTax');
    expect(b).toHaveProperty('excessAmount');
    expect(b).toHaveProperty('taxOnExcess');
    expect(b).toHaveProperty('totalTax');
    expect(b.totalTax).toBe(result.estateTaxDue);
  });
});

// ── Crossover verification ───────────────────────────────────────────────────

describe('pre-TRAIN vs TRAIN crossover at ₱1,250,000', () => {
  it('NTE = ₱1,250,000: pre-TRAIN tax equals TRAIN tax', () => {
    // Crossover: pre-TRAIN = 15K + (1.25M - 500K) × 8% = 15K + 60K = 75K
    //            TRAIN = 1.25M × 6% = 75K ✓
    const trainResult = computeTax(125_000_000, 'TRAIN');
    const preTRAINResult = computeTax(125_000_000, 'PRE_TRAIN');
    expect(trainResult.estateTaxDue).toBe(7_500_000); // ₱75K
    expect(preTRAINResult.estateTaxDue).toBe(7_500_000); // ₱75K
  });
});
