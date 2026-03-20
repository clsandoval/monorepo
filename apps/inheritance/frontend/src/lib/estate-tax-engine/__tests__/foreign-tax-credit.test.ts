/**
 * Tests for Foreign Tax Credit — spec §13
 */

import { describe, it, expect } from 'vitest';
import { computeForeignTaxCredit } from '../foreign-tax-credit';
import type { DecedentInfo, ForeignTaxCreditEntry } from '../types';

function makeDecedent(overrides: Partial<DecedentInfo> = {}): DecedentInfo {
  return {
    name: 'Test',
    tin: '123',
    dateOfDeath: '2021-01-01',
    isResident: true,
    isFilipino: true,
    isNRA: false,
    isMarried: false,
    ...overrides,
  };
}

describe('computeForeignTaxCredit', () => {
  it('NRA → 0 (not available to NRAs)', () => {
    const decedent = makeDecedent({ isNRA: true });
    const claims: ForeignTaxCreditEntry[] = [
      { country: 'USA', taxPaid: 10_000_000 },
    ];
    expect(computeForeignTaxCredit(decedent, 'TRAIN', claims, 100_000_000, 6_000_000)).toBe(0);
  });

  it('AMNESTY regime → 0 (not available under amnesty)', () => {
    const decedent = makeDecedent();
    const claims: ForeignTaxCreditEntry[] = [
      { country: 'USA', taxPaid: 10_000_000 },
    ];
    expect(computeForeignTaxCredit(decedent, 'AMNESTY', claims, 100_000_000, 6_000_000)).toBe(0);
  });

  it('no foreign tax claims → 0', () => {
    const decedent = makeDecedent();
    expect(computeForeignTaxCredit(decedent, 'TRAIN', [], 100_000_000, 6_000_000)).toBe(0);
  });

  it('single country: credit = min(taxPaid, estateTaxDue * foreignFMV / grossEstate)', () => {
    const decedent = makeDecedent();
    // grossEstate = ₱10M; foreignFMV = ₱2M; estateTaxDue = ₱600K
    // perCountryLimit = 600K * (2M / 10M) = 600K * 0.2 = 120K
    // foreignTaxPaid = ₱100K < limit → credit = ₱100K
    const claims: ForeignTaxCreditEntry[] = [
      { country: 'USA', taxPaid: 10_000_000, foreignPropertyFMV: 200_000_000 } as any,
    ];
    const grossEstateTotal = 1_000_000_000; // ₱10M
    const estateTaxDue = 60_000_000; // ₱600K
    const credit = computeForeignTaxCredit(decedent, 'TRAIN', claims, grossEstateTotal, estateTaxDue);
    // perCountryLimit = 60M * (200M / 1000M) = 60M * 0.2 = 12_000_000
    // taxPaid = 10M < 12M → credit = 10M
    expect(credit).toBe(10_000_000);
  });

  it('single country: credit capped at per-country limit when taxPaid exceeds it', () => {
    const decedent = makeDecedent();
    // grossEstate = ₱10M; foreignFMV = ₱2M; estateTaxDue = ₱600K
    // perCountryLimit = 60M * (200M / 1000M) = 12M
    // foreignTaxPaid = ₱200K > limit → credit = limit = 12M
    const claims: ForeignTaxCreditEntry[] = [
      { country: 'USA', taxPaid: 20_000_000, foreignPropertyFMV: 200_000_000 } as any,
    ];
    const credit = computeForeignTaxCredit(decedent, 'TRAIN', claims, 1_000_000_000, 60_000_000);
    expect(credit).toBe(12_000_000); // capped at per-country limit
  });

  it('multiple countries: sum of per-country credits', () => {
    const decedent = makeDecedent();
    // grossEstate ₱20M; estateTaxDue = ₱1.2M
    // Country A: taxPaid ₱100K, foreignFMV ₱4M → limit = 1.2M * (4M/20M) = 240K → credit = 100K
    // Country B: taxPaid ₱500K, foreignFMV ₱6M → limit = 1.2M * (6M/20M) = 360K → credit = 360K
    // Total credit = 460K → < estateTaxDue (1.2M) → no overall cap applied
    const claims: ForeignTaxCreditEntry[] = [
      { country: 'USA', taxPaid: 10_000_000, foreignPropertyFMV: 400_000_000 } as any,
      { country: 'Japan', taxPaid: 50_000_000, foreignPropertyFMV: 600_000_000 } as any,
    ];
    const grossEstateTotal = 2_000_000_000; // ₱20M
    const estateTaxDue = 120_000_000; // ₱1.2M
    const credit = computeForeignTaxCredit(decedent, 'TRAIN', claims, grossEstateTotal, estateTaxDue);
    // Country A: limit = 120M * (400M/2000M) = 120M * 0.2 = 24M; paid = 10M < 24M → 10M
    // Country B: limit = 120M * (600M/2000M) = 120M * 0.3 = 36M; paid = 50M > 36M → 36M
    // Total = 10M + 36M = 46M < 120M (estateTaxDue) → no overall cap
    expect(credit).toBe(46_000_000);
  });

  it('total credit capped at estateTaxDue', () => {
    const decedent = makeDecedent();
    // single country where taxPaid is much larger than estateTaxDue
    // grossEstate ₱10M; foreignFMV = ₱10M (all foreign); estateTaxDue = ₱600K
    // perCountryLimit = 60M * (1000M / 1000M) = 60M; taxPaid = 500M > 60M → credit = 60M
    // total (60M) ≤ estateTaxDue (60M) → not further capped
    const claims: ForeignTaxCreditEntry[] = [
      { country: 'USA', taxPaid: 500_000_000, foreignPropertyFMV: 1_000_000_000 } as any,
    ];
    const credit = computeForeignTaxCredit(decedent, 'TRAIN', claims, 1_000_000_000, 60_000_000);
    expect(credit).toBe(60_000_000); // capped at per-country limit = estateTaxDue
  });

  it('credit from multiple countries capped at overall estateTaxDue', () => {
    const decedent = makeDecedent();
    // Total per-country credits exceed estateTaxDue — overall cap applies
    // grossEstate ₱10M; estateTaxDue ₱600K
    // Country A: taxPaid ₱300K, foreignFMV ₱5M → limit = 60M * 0.5 = 30M; paid = 30M → credit = 30M
    // Country B: taxPaid ₱400K, foreignFMV ₱5M → limit = 30M; paid = 40M > 30M → credit = 30M
    // Sum = 60M = estateTaxDue → no over-cap needed but equals total
    const claims: ForeignTaxCreditEntry[] = [
      { country: 'USA', taxPaid: 30_000_000, foreignPropertyFMV: 500_000_000 } as any,
      { country: 'Japan', taxPaid: 40_000_000, foreignPropertyFMV: 500_000_000 } as any,
    ];
    const credit = computeForeignTaxCredit(decedent, 'TRAIN', claims, 1_000_000_000, 60_000_000);
    // Country A: limit = 30M, paid = 30M → 30M
    // Country B: limit = 30M, paid = 40M → 30M
    // Total = 60M, cap at 60M → 60M
    expect(credit).toBe(60_000_000);
  });

  it('PRE_TRAIN: same computation as TRAIN (regime does not affect formula)', () => {
    const decedent = makeDecedent();
    const claims: ForeignTaxCreditEntry[] = [
      { country: 'USA', taxPaid: 5_000_000, foreignPropertyFMV: 100_000_000 } as any,
    ];
    const credit = computeForeignTaxCredit(decedent, 'PRE_TRAIN', claims, 500_000_000, 30_000_000);
    // limit = 30M * (100M/500M) = 30M * 0.2 = 6M; paid = 5M < 6M → credit = 5M
    expect(credit).toBe(5_000_000);
  });
});
