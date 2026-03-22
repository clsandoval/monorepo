import { describe, it, expect } from 'vitest';
import { computeInterest } from '../interest';

describe('computeInterest', () => {
  it('returns 0 for 0 days', () => {
    expect(computeInterest(50_000_000, 600, 0)).toBe(0);
  });

  it('returns 0 for 0 principal', () => {
    expect(computeInterest(0, 600, 365)).toBe(0);
  });

  it('computes 6% on ₱500,000 for 365 days = ₱30,000', () => {
    // ₱500,000 = 50,000,000 centavos
    // interest = (50_000_000 * 600 * 365) / (10000 * 365) = 50_000_000 * 600 / 10000 = 3_000_000
    const result = computeInterest(50_000_000, 600, 365);
    expect(result).toBe(3_000_000); // ₱30,000
  });

  it('computes 12% on ₱500,000 for 1218 days', () => {
    // (50_000_000 * 1200 * 1218) / (10000 * 365)
    // = 50_000_000 * 1200 * 1218 / 3_650_000
    // = 73_080_000_000_000 / 3_650_000
    // = 20_021_917 (truncated)
    const result = computeInterest(50_000_000, 1200, 1218);
    // Verify: 20_021_917 / 100 = ₱200,219.17...
    expect(result).toBe(20_021_917);
  });

  it('truncates toward zero (does not round up)', () => {
    // 100 centavos * 600 bps * 1 day / (10000 * 365)
    // = 60_000 / 3_650_000 = 0.01643... → truncates to 0
    expect(computeInterest(100, 600, 1)).toBe(0);
  });

  it('truncates fractional centavos for larger amounts', () => {
    // 10_000 centavos (₱100) * 600 * 1 / (10000 * 365)
    // = 6_000_000 / 3_650_000 = 1.643... → truncates to 1
    expect(computeInterest(10_000, 600, 1)).toBe(1);
  });

  it('handles very large principal without overflow', () => {
    // 1 billion pesos = 100_000_000_000 centavos
    // 6% for 365 days = 6_000_000_000 centavos = ₱60,000,000
    const result = computeInterest(100_000_000_000, 600, 365);
    expect(result).toBe(6_000_000_000);
  });

  it('computes 12% on ₱100 for 365 days = ₱12', () => {
    // 10_000 * 1200 * 365 / (10000 * 365) = 10_000 * 1200 / 10000 = 1200 centavos
    expect(computeInterest(10_000, 1200, 365)).toBe(1200);
  });
});
