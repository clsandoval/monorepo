import { describe, it, expect } from 'vitest';
import { computeGrossEstate } from '../gross-estate';
import type { DecedentInfo } from '../types';
import type { GrossEstateAssets } from '../gross-estate';

// ── Fixture builders ──────────────────────────────────────────────────────────

function makeDecedent(isNRA = false): DecedentInfo {
  return {
    name: 'Test',
    tin: '000',
    dateOfDeath: '2023-01-01',
    isResident: true,
    isFilipino: !isNRA,
    isNRA,
    isMarried: false,
  };
}

function emptyAssets(): GrossEstateAssets {
  return {
    realProperties: [],
    personalPropertiesFinancial: [],
    personalPropertiesTangible: [],
    taxableTransfers: [],
    businessInterests: [],
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('computeGrossEstate', () => {
  it('returns all zeros for empty asset arrays', () => {
    const result = computeGrossEstate(makeDecedent(), emptyAssets());
    expect(result.realProperty).toEqual({ exclusive: 0, conjugal: 0, total: 0 });
    expect(result.familyHome).toEqual({ exclusive: 0, conjugal: 0, total: 0 });
    expect(result.personalProperty).toEqual({ exclusive: 0, conjugal: 0, total: 0 });
    expect(result.taxableTransfers).toEqual({ exclusive: 0, conjugal: 0, total: 0 });
    expect(result.businessInterest).toEqual({ exclusive: 0, conjugal: 0, total: 0 });
    expect(result.total).toEqual({ exclusive: 0, conjugal: 0, total: 0 });
  });

  describe('Item 29: Real properties (excluding family home)', () => {
    it('single exclusive real property goes to Col A only', () => {
      const assets: GrossEstateAssets = {
        ...emptyAssets(),
        realProperties: [
          {
            description: 'Lot A',
            location: 'Manila',
            ownershipType: 'exclusive',
            fmvTaxDeclaration: 100_000_000, // ₱1M in centavos
            fmvBir: 120_000_000,            // ₱1.2M — higher, so engine uses this
            isDesignatedFamilyHome: false,
          },
        ],
      };
      const result = computeGrossEstate(makeDecedent(), assets);
      expect(result.realProperty.exclusive).toBe(120_000_000);
      expect(result.realProperty.conjugal).toBe(0);
      expect(result.realProperty.total).toBe(120_000_000);
    });

    it('applies max(fmvTaxDeclaration, fmvBir) rule', () => {
      const assets: GrossEstateAssets = {
        ...emptyAssets(),
        realProperties: [
          {
            description: 'Lot B',
            location: 'Quezon City',
            ownershipType: 'exclusive',
            fmvTaxDeclaration: 200_000_000,
            fmvBir: 150_000_000, // lower — tax dec wins
            isDesignatedFamilyHome: false,
          },
        ],
      };
      const result = computeGrossEstate(makeDecedent(), assets);
      expect(result.realProperty.exclusive).toBe(200_000_000);
    });

    it('mixed exclusive + conjugal real properties split into correct columns', () => {
      const assets: GrossEstateAssets = {
        ...emptyAssets(),
        realProperties: [
          {
            description: 'Exclusive Lot',
            location: 'Manila',
            ownershipType: 'exclusive',
            fmvTaxDeclaration: 100_000_000,
            fmvBir: 100_000_000,
            isDesignatedFamilyHome: false,
          },
          {
            description: 'Conjugal Lot',
            location: 'Makati',
            ownershipType: 'conjugal',
            fmvTaxDeclaration: 200_000_000,
            fmvBir: 200_000_000,
            isDesignatedFamilyHome: false,
          },
        ],
      };
      const result = computeGrossEstate(makeDecedent(), assets);
      expect(result.realProperty.exclusive).toBe(100_000_000);
      expect(result.realProperty.conjugal).toBe(200_000_000);
      expect(result.realProperty.total).toBe(300_000_000);
    });
  });

  describe('Item 30: Family home', () => {
    it('family home separated into its own item', () => {
      const assets: GrossEstateAssets = {
        ...emptyAssets(),
        realProperties: [
          {
            description: 'Family Home',
            location: 'Manila',
            ownershipType: 'exclusive',
            fmvTaxDeclaration: 500_000_000,
            fmvBir: 600_000_000,
            isDesignatedFamilyHome: true,
          },
          {
            description: 'Other Lot',
            location: 'Manila',
            ownershipType: 'exclusive',
            fmvTaxDeclaration: 100_000_000,
            fmvBir: 100_000_000,
            isDesignatedFamilyHome: false,
          },
        ],
      };
      const result = computeGrossEstate(makeDecedent(), assets);
      // Family home goes to Item 30, NOT Item 29
      expect(result.familyHome.exclusive).toBe(600_000_000);
      expect(result.realProperty.exclusive).toBe(100_000_000);
      expect(result.realProperty.total).toBe(100_000_000);
    });

    it('NRA decedent: Item 30 = 0, but family home property appears in Item 29', () => {
      const assets: GrossEstateAssets = {
        ...emptyAssets(),
        realProperties: [
          {
            description: 'Family Home',
            location: 'Manila',
            ownershipType: 'exclusive',
            fmvTaxDeclaration: 500_000_000,
            fmvBir: 600_000_000,
            isDesignatedFamilyHome: true,
          },
        ],
      };
      const result = computeGrossEstate(makeDecedent(true /* isNRA */), assets);
      // Item 30 = 0 for NRA (no family home deduction available)
      expect(result.familyHome).toEqual({ exclusive: 0, conjugal: 0, total: 0 });
      // But the property itself goes into Item 29 — it's still part of gross estate
      expect(result.realProperty.exclusive).toBe(600_000_000);
      expect(result.total.total).toBe(600_000_000);
    });
  });

  describe('Item 31: Personal properties', () => {
    it('sums financial + tangible personal properties', () => {
      const assets: GrossEstateAssets = {
        ...emptyAssets(),
        personalPropertiesFinancial: [
          { description: 'Cash', ownershipType: 'exclusive', fmv: 100_000_000 },
          { description: 'Shares', ownershipType: 'conjugal', fmv: 200_000_000 },
        ],
        personalPropertiesTangible: [
          { description: 'Car', ownershipType: 'exclusive', fmv: 50_000_000 },
        ],
      };
      const result = computeGrossEstate(makeDecedent(), assets);
      expect(result.personalProperty.exclusive).toBe(150_000_000); // 100M + 50M
      expect(result.personalProperty.conjugal).toBe(200_000_000);
      expect(result.personalProperty.total).toBe(350_000_000);
    });
  });

  describe('Item 32: Taxable transfers', () => {
    it('taxable amount = max(0, fmvAtDeath - considerationReceived)', () => {
      const assets: GrossEstateAssets = {
        ...emptyAssets(),
        taxableTransfers: [
          {
            description: 'Transfer A',
            transferType: 'CONTEMPLATION_OF_DEATH',
            fmvAtDeath: 300_000_000,
            considerationReceived: 100_000_000,
            ownershipType: 'exclusive',
          },
        ],
      };
      const result = computeGrossEstate(makeDecedent(), assets);
      expect(result.taxableTransfers.exclusive).toBe(200_000_000); // 300M - 100M
    });

    it('floors taxable amount at 0 when consideration exceeds fmv', () => {
      const assets: GrossEstateAssets = {
        ...emptyAssets(),
        taxableTransfers: [
          {
            description: 'Transfer B',
            transferType: 'INSUFFICIENT_CONSIDERATION',
            fmvAtDeath: 50_000_000,
            considerationReceived: 80_000_000, // more than fmv
            ownershipType: 'exclusive',
          },
        ],
      };
      const result = computeGrossEstate(makeDecedent(), assets);
      expect(result.taxableTransfers.exclusive).toBe(0);
    });

    it('defaults to exclusive when ownershipType not provided', () => {
      const assets: GrossEstateAssets = {
        ...emptyAssets(),
        taxableTransfers: [
          {
            description: 'Transfer C',
            transferType: 'REVOCABLE',
            fmvAtDeath: 100_000_000,
            considerationReceived: 0,
            // ownershipType omitted → defaults to exclusive
          },
        ],
      };
      const result = computeGrossEstate(makeDecedent(), assets);
      expect(result.taxableTransfers.exclusive).toBe(100_000_000);
      expect(result.taxableTransfers.conjugal).toBe(0);
    });
  });

  describe('Item 33: Business interests', () => {
    it('includes netEquity in the correct ownership column', () => {
      const assets: GrossEstateAssets = {
        ...emptyAssets(),
        businessInterests: [
          { description: 'ABC Corp', ownershipType: 'exclusive', netEquity: 500_000_000 },
          { description: 'XYZ Partnership', ownershipType: 'conjugal', netEquity: 200_000_000 },
        ],
      };
      const result = computeGrossEstate(makeDecedent(), assets);
      expect(result.businessInterest.exclusive).toBe(500_000_000);
      expect(result.businessInterest.conjugal).toBe(200_000_000);
    });

    it('floors negative netEquity at 0', () => {
      const assets: GrossEstateAssets = {
        ...emptyAssets(),
        businessInterests: [
          { description: 'Insolvent Co', ownershipType: 'exclusive', netEquity: -100_000_000 },
        ],
      };
      const result = computeGrossEstate(makeDecedent(), assets);
      expect(result.businessInterest.exclusive).toBe(0);
      expect(result.businessInterest.total).toBe(0);
    });
  });

  describe('Item 34: Total', () => {
    it('total equals sum of items 29-33 per column', () => {
      const assets: GrossEstateAssets = {
        ...emptyAssets(),
        realProperties: [
          {
            description: 'Lot',
            location: 'Manila',
            ownershipType: 'exclusive',
            fmvTaxDeclaration: 100_000_000,
            fmvBir: 100_000_000,
            isDesignatedFamilyHome: false,
          },
        ],
        personalPropertiesFinancial: [
          { description: 'Cash', ownershipType: 'conjugal', fmv: 50_000_000 },
        ],
        businessInterests: [
          { description: 'Corp', ownershipType: 'exclusive', netEquity: 200_000_000 },
        ],
      };
      const result = computeGrossEstate(makeDecedent(), assets);
      expect(result.total.exclusive).toBe(300_000_000); // 100M real + 200M biz
      expect(result.total.conjugal).toBe(50_000_000);
      expect(result.total.total).toBe(350_000_000);
    });
  });
});
