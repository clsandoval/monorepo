import { describe, it, expect } from 'vitest';
import { computeAdditionalAwards } from '../additional-awards';

describe('computeAdditionalAwards', () => {
  it('returns empty array when no awards provided', () => {
    const result = computeAdditionalAwards(undefined, '2020-01-01', '2024-01-01');
    expect(result).toEqual([]);
  });

  it('returns empty array when awards is empty object', () => {
    const result = computeAdditionalAwards({}, '2020-01-01', '2024-01-01');
    expect(result).toEqual([]);
  });

  it('returns empty array when all award amounts are 0 or undefined', () => {
    const result = computeAdditionalAwards(
      { moralDamages: 0, exemplaryDamages: undefined },
      '2020-01-01',
      '2024-01-01',
    );
    expect(result).toEqual([]);
  });

  it('computes 6% on moral damages from judgment date', () => {
    // ₱50,000 moral damages = 5_000_000 centavos
    // Judgment: 2020-01-01, Target: 2021-01-01 (366 days, leap year)
    const result = computeAdditionalAwards(
      { moralDamages: 5_000_000 },
      '2020-01-01',
      '2021-01-01',
    );
    expect(result).toHaveLength(1);
    expect(result[0].label).toContain('Moral');
    expect(result[0].amount).toBe(5_000_000);
    expect(result[0].rateBps).toBe(600);
    expect(result[0].startDate).toBe('2020-01-01');
    expect(result[0].endDate).toBe('2021-01-01');
    expect(result[0].days).toBe(366);
    // interest = (5_000_000 * 600 * 366) / (10000 * 365) = 300_821 (truncated)
    expect(result[0].interest).toBe(300_821);
  });

  it('computes 6% on exemplary damages from judgment date', () => {
    const result = computeAdditionalAwards(
      { exemplaryDamages: 2_000_000 },
      '2020-01-01',
      '2021-01-01',
    );
    expect(result).toHaveLength(1);
    expect(result[0].label).toContain('Exemplary');
    expect(result[0].rateBps).toBe(600);
  });

  it("computes 6% on attorney's fees from judgment date", () => {
    const result = computeAdditionalAwards(
      { attorneysFees: 1_000_000 },
      '2020-01-01',
      '2021-01-01',
    );
    expect(result).toHaveLength(1);
    expect(result[0].label).toContain('Attorney');
    expect(result[0].rateBps).toBe(600);
  });

  it('handles multiple awards simultaneously', () => {
    const result = computeAdditionalAwards(
      {
        moralDamages: 5_000_000,
        exemplaryDamages: 2_000_000,
        attorneysFees: 1_000_000,
      },
      '2020-01-01',
      '2021-01-01',
    );
    expect(result).toHaveLength(3);
  });

  it('interest is 0 when judgment date equals target date', () => {
    const result = computeAdditionalAwards(
      { moralDamages: 5_000_000 },
      '2020-01-01',
      '2020-01-01',
    );
    expect(result[0].interest).toBe(0);
    expect(result[0].days).toBe(0);
  });

  it('uses 6% regardless of judgment date regime (always post-Nacar rule)', () => {
    // Even if judgment is old, Nacar says 6% from judgment date
    const result = computeAdditionalAwards(
      { moralDamages: 5_000_000 },
      '2015-06-01',
      '2020-01-01',
    );
    expect(result[0].rateBps).toBe(600);
  });

  it('ignores undefined/null award fields', () => {
    const result = computeAdditionalAwards(
      { moralDamages: 5_000_000, exemplaryDamages: undefined },
      '2020-01-01',
      '2021-01-01',
    );
    expect(result).toHaveLength(1);
  });
});
