import { describe, it, expect } from 'vitest';
import { validateInput } from '../validation';
import type { EngineInput } from '../types';

/** Minimal valid EngineInput for use as a base in each test. */
function makeValidInput(overrides: Partial<EngineInput> = {}): EngineInput {
  return {
    decedent: {
      name: 'Dela Cruz, Juan',
      tin: '123-456-789',
      dateOfDeath: '2023-06-15',
      isResident: true,
      isFilipino: true,
      isNRA: false,
      isMarried: false,
      worldwideGrossEstate: null,
    },
    executor: {
      name: 'Dela Cruz, Maria',
      tin: '987-654-321',
      address: '123 Main St, Manila',
    },
    estateFlags: {
      hasConjugalAssets: false,
      hasFamilyHome: false,
      hasNRAAssets: false,
      hasForeignAssets: false,
    },
    userElectsAmnesty: false,
    useNarrowAmnestyDeductions: false,
    realProperties: [],
    personalPropertiesFinancial: [],
    personalPropertiesTangible: [],
    taxableTransfers: [],
    businessInterests: [],
    sec87ExemptAssets: [],
    claimsAgainstEstate: [],
    claimsVsInsolvent: [],
    unpaidMortgages: [],
    unpaidTaxes: [],
    casualtyLosses: [],
    vanishingDeductionProperties: [],
    publicUseTransfers: [],
    funeralExpenses: [],
    judicialAdminExpenses: [],
    medicalExpenses: [],
    ra4917Benefits: [],
    foreignTaxCredits: [],
    filing: {
      filingDate: '2024-06-15',
      rdoCode: '39',
    },
    ...overrides,
  };
}

describe('validateInput', () => {
  it('returns empty array for valid input', () => {
    const errors = validateInput(makeValidInput());
    expect(errors).toHaveLength(0);
  });

  describe('ERR_DATE_REQUIRED', () => {
    it('returns ERR_DATE_REQUIRED when dateOfDeath is empty string', () => {
      const input = makeValidInput({
        decedent: { ...makeValidInput().decedent, dateOfDeath: '' },
      });
      const errors = validateInput(input);
      expect(errors).toHaveLength(1);
      expect(errors[0].code).toBe('ERR_DATE_REQUIRED');
    });

    it('returns ERR_DATE_REQUIRED when dateOfDeath is whitespace', () => {
      const input = makeValidInput({
        decedent: { ...makeValidInput().decedent, dateOfDeath: '   ' },
      });
      const errors = validateInput(input);
      expect(errors).toHaveLength(1);
      expect(errors[0].code).toBe('ERR_DATE_REQUIRED');
    });
  });

  describe('ERR_DATE_FUTURE', () => {
    it('returns ERR_DATE_FUTURE when dateOfDeath is in the future', () => {
      const input = makeValidInput({
        decedent: { ...makeValidInput().decedent, dateOfDeath: '2099-01-01' },
      });
      const errors = validateInput(input);
      expect(errors.some((e) => e.code === 'ERR_DATE_FUTURE')).toBe(true);
    });

    it('does not return ERR_DATE_FUTURE for today or past dates', () => {
      const input = makeValidInput({
        decedent: { ...makeValidInput().decedent, dateOfDeath: '2020-01-01' },
      });
      const errors = validateInput(input);
      expect(errors.every((e) => e.code !== 'ERR_DATE_FUTURE')).toBe(true);
    });
  });

  describe('ERR_DATE_IMPLAUSIBLE', () => {
    it('returns ERR_DATE_IMPLAUSIBLE for date before 1901-01-01', () => {
      const input = makeValidInput({
        decedent: { ...makeValidInput().decedent, dateOfDeath: '1900-12-31' },
      });
      const errors = validateInput(input);
      expect(errors.some((e) => e.code === 'ERR_DATE_IMPLAUSIBLE')).toBe(true);
    });

    it('does not return ERR_DATE_IMPLAUSIBLE for exactly 1901-01-01', () => {
      const input = makeValidInput({
        decedent: { ...makeValidInput().decedent, dateOfDeath: '1901-01-01' },
      });
      const errors = validateInput(input);
      expect(errors.every((e) => e.code !== 'ERR_DATE_IMPLAUSIBLE')).toBe(true);
    });
  });

  describe('ERR_TRACK_B_MISSING', () => {
    it('returns ERR_TRACK_B_MISSING when priorReturnFiled=true and previouslyDeclaredNetEstate is null', () => {
      const input = makeValidInput({
        estateFlags: {
          ...makeValidInput().estateFlags,
          priorReturnFiled: true,
          previouslyDeclaredNetEstate: null,
        },
      });
      const errors = validateInput(input);
      expect(errors.some((e) => e.code === 'ERR_TRACK_B_MISSING')).toBe(true);
    });

    it('does not return ERR_TRACK_B_MISSING when priorReturnFiled=true and value is provided', () => {
      const input = makeValidInput({
        estateFlags: {
          ...makeValidInput().estateFlags,
          priorReturnFiled: true,
          previouslyDeclaredNetEstate: 5_000_000_00, // ₱5M in centavos
        },
      });
      const errors = validateInput(input);
      expect(errors.every((e) => e.code !== 'ERR_TRACK_B_MISSING')).toBe(true);
    });
  });

  describe('ERR_PRIOR_NEGATIVE', () => {
    it('returns ERR_PRIOR_NEGATIVE when previouslyDeclaredNetEstate < 0', () => {
      const input = makeValidInput({
        estateFlags: {
          ...makeValidInput().estateFlags,
          priorReturnFiled: true,
          previouslyDeclaredNetEstate: -1,
        },
      });
      const errors = validateInput(input);
      expect(errors.some((e) => e.code === 'ERR_PRIOR_NEGATIVE')).toBe(true);
    });

    it('does not return ERR_PRIOR_NEGATIVE for zero', () => {
      const input = makeValidInput({
        estateFlags: {
          ...makeValidInput().estateFlags,
          priorReturnFiled: true,
          previouslyDeclaredNetEstate: 0,
        },
      });
      const errors = validateInput(input);
      expect(errors.every((e) => e.code !== 'ERR_PRIOR_NEGATIVE')).toBe(true);
    });
  });

  describe('ERR_MULTIPLE_FAMILY_HOMES', () => {
    it('returns ERR_MULTIPLE_FAMILY_HOMES when more than one property is flagged as family home', () => {
      const input = makeValidInput({
        realProperties: [
          { description: 'House A', location: 'Manila', ownershipType: 'exclusive', fmvTaxDeclaration: 100_000_00, fmvBir: 120_000_00, isDesignatedFamilyHome: true },
          { description: 'House B', location: 'Quezon City', ownershipType: 'exclusive', fmvTaxDeclaration: 80_000_00, fmvBir: 90_000_00, isDesignatedFamilyHome: true },
        ],
      });
      const errors = validateInput(input);
      expect(errors.some((e) => e.code === 'ERR_MULTIPLE_FAMILY_HOMES')).toBe(true);
    });

    it('does not return ERR_MULTIPLE_FAMILY_HOMES for exactly one family home', () => {
      const input = makeValidInput({
        realProperties: [
          { description: 'House A', location: 'Manila', ownershipType: 'exclusive', fmvTaxDeclaration: 100_000_00, fmvBir: 120_000_00, isDesignatedFamilyHome: true },
          { description: 'Condo B', location: 'Makati', ownershipType: 'exclusive', fmvTaxDeclaration: 80_000_00, fmvBir: 90_000_00, isDesignatedFamilyHome: false },
        ],
      });
      const errors = validateInput(input);
      expect(errors.every((e) => e.code !== 'ERR_MULTIPLE_FAMILY_HOMES')).toBe(true);
    });
  });

  describe('ERR_WORLDWIDE_ESTATE_ZERO', () => {
    it('returns ERR_WORLDWIDE_ESTATE_ZERO when NRA and worldwideGrossEstate is null', () => {
      const input = makeValidInput({
        decedent: { ...makeValidInput().decedent, isNRA: true, worldwideGrossEstate: null },
      });
      const errors = validateInput(input);
      expect(errors.some((e) => e.code === 'ERR_WORLDWIDE_ESTATE_ZERO')).toBe(true);
    });

    it('returns ERR_WORLDWIDE_ESTATE_ZERO when NRA and worldwideGrossEstate is 0', () => {
      const input = makeValidInput({
        decedent: { ...makeValidInput().decedent, isNRA: true, worldwideGrossEstate: 0 },
      });
      const errors = validateInput(input);
      expect(errors.some((e) => e.code === 'ERR_WORLDWIDE_ESTATE_ZERO')).toBe(true);
    });

    it('does not return ERR_WORLDWIDE_ESTATE_ZERO for non-NRA', () => {
      const input = makeValidInput({
        decedent: { ...makeValidInput().decedent, isNRA: false, worldwideGrossEstate: null },
      });
      const errors = validateInput(input);
      expect(errors.every((e) => e.code !== 'ERR_WORLDWIDE_ESTATE_ZERO')).toBe(true);
    });
  });

  describe('ERR_PH_EXCEEDS_WORLDWIDE', () => {
    it('returns ERR_PH_EXCEEDS_WORLDWIDE when PH asset sum exceeds worldwideGrossEstate', () => {
      // PH assets: one property with fmv = ₱10M (1_000_000_000 centavos)
      // worldwideGrossEstate = ₱5M (500_000_000 centavos) — PH > worldwide
      const input = makeValidInput({
        decedent: {
          ...makeValidInput().decedent,
          isNRA: true,
          worldwideGrossEstate: 500_000_000, // ₱5M
        },
        realProperties: [
          {
            description: 'PH Property',
            location: 'Manila',
            ownershipType: 'exclusive',
            fmvTaxDeclaration: 1_000_000_000, // ₱10M
            fmvBir: 900_000_000,
            isDesignatedFamilyHome: false,
          },
        ],
      });
      const errors = validateInput(input);
      expect(errors.some((e) => e.code === 'ERR_PH_EXCEEDS_WORLDWIDE')).toBe(true);
    });

    it('does not return ERR_PH_EXCEEDS_WORLDWIDE when PH assets equal worldwide (100% PH)', () => {
      const input = makeValidInput({
        decedent: {
          ...makeValidInput().decedent,
          isNRA: true,
          worldwideGrossEstate: 500_000_000, // ₱5M
        },
        realProperties: [
          {
            description: 'PH Property',
            location: 'Manila',
            ownershipType: 'exclusive',
            fmvTaxDeclaration: 500_000_000, // ₱5M — equals worldwide
            fmvBir: 400_000_000,
            isDesignatedFamilyHome: false,
          },
        ],
      });
      const errors = validateInput(input);
      expect(errors.every((e) => e.code !== 'ERR_PH_EXCEEDS_WORLDWIDE')).toBe(true);
    });
  });
});
