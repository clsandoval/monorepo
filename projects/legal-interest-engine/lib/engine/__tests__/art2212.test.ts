import { describe, it, expect } from 'vitest';
import { computeArt2212 } from '../art2212';
import { CITATIONS } from '../constants';

describe('computeArt2212', () => {
  it('returns null when no stipulatedRate provided', () => {
    const result = computeArt2212(
      50_000_000,
      undefined,
      '2010-01-01',
      '2010-06-01',
      '2015-01-01',
    );
    expect(result).toBeNull();
  });

  it('returns null when stipulatedRate is 0', () => {
    const result = computeArt2212(50_000_000, 0, '2010-01-01', '2010-06-01', '2015-01-01');
    expect(result).toBeNull();
  });

  it('computes accrued stipulated interest from demand to filing date', () => {
    // ₱500,000 principal (50_000_000 centavos) at 12% stipulated
    // Demand: 2010-01-01, Filing: 2010-07-01 (181 days)
    // Accrued stipulated interest = (50_000_000 * 1200 * 181) / (10000 * 365)
    // = 10_860_000_000_000 / 3_650_000 = 2,975,342 centavos (truncated)
    const result = computeArt2212(
      50_000_000,
      0.12,
      '2010-01-01',
      '2010-07-01',
      '2015-01-01',
    );
    expect(result).not.toBeNull();
    // accruedStipulatedInterest should be > 0
    expect(result!.accruedStipulatedInterest).toBeGreaterThan(0);
  });

  it('uses legal rate (not stipulated) for interest on accrued interest — pre-BSP loan uses 12%', () => {
    // Pre-2013 loan case: legal rate should be 12%
    const result = computeArt2212(
      50_000_000,
      0.18, // high stipulated rate
      '2010-01-01',
      '2010-07-01',
      '2012-01-01',
      undefined,
      'loan_forbearance',
    );
    expect(result).not.toBeNull();
    // Rate should be legal rate (1200 for pre-BSP loan)
    expect(result!.rateBps).toBe(1200);
  });

  it('pre-BSP non-loan uses 6% (not 12%) for Art.2212 layer', () => {
    // Pre-2013 non-loan case: legal rate should be 6%, not 12%
    const result = computeArt2212(
      50_000_000,
      0.18,
      '2010-01-01',
      '2010-07-01',
      '2012-01-01',
      undefined,
      'non_loan',
    );
    expect(result).not.toBeNull();
    // Rate should be 600 bps (6%) for pre-BSP non-loan, not 1200 (12%)
    expect(result!.rateBps).toBe(600);
  });

  it('cites Art. 2212', () => {
    const result = computeArt2212(
      50_000_000,
      0.12,
      '2010-01-01',
      '2010-07-01',
      '2015-01-01',
    );
    expect(result!.legalCitation).toContain('2212');
  });

  it('uses filing date as startDate of Art.2212 layer', () => {
    const result = computeArt2212(
      50_000_000,
      0.12,
      '2010-01-01',
      '2010-07-01',
      '2015-01-01',
    );
    expect(result!.startDate).toBe('2010-07-01');
  });

  it('uses targetDate as endDate of Art.2212 layer', () => {
    const result = computeArt2212(
      50_000_000,
      0.12,
      '2010-01-01',
      '2010-07-01',
      '2015-01-01',
    );
    expect(result!.endDate).toBe('2015-01-01');
  });

  it('handles post-BSP case with 6% legal rate', () => {
    // All dates post-2013 → legal rate should be 600 bps
    const result = computeArt2212(
      50_000_000,
      0.12,
      '2014-01-01',
      '2014-06-01',
      '2020-01-01',
    );
    expect(result).not.toBeNull();
    expect(result!.rateBps).toBe(600);
  });

  it('computes days correctly from filing to target', () => {
    const result = computeArt2212(
      50_000_000,
      0.12,
      '2020-01-01',
      '2020-07-01',
      '2021-01-01',
    );
    expect(result).not.toBeNull();
    // 2020-07-01 to 2021-01-01 = 184 days (Jul: 31, Aug: 31, Sep: 30, Oct: 31, Nov: 30, Dec: 31 = 184)
    expect(result!.days).toBe(184);
  });

  it('returns 0 interest when filing equals target date', () => {
    const result = computeArt2212(
      50_000_000,
      0.12,
      '2020-01-01',
      '2020-07-01',
      '2020-07-01',
    );
    expect(result).not.toBeNull();
    expect(result!.interest).toBe(0);
    expect(result!.days).toBe(0);
  });
});
