import { describe, it, expect } from 'vitest';
import { computeNRAFactor, NRAProportionalError } from '../nra-proportional';

describe('computeNRAFactor', () => {
  describe('non-NRA decedent', () => {
    it('returns null for non-NRA decedent', () => {
      expect(computeNRAFactor(false, 500_000_000, 2_000_000_000)).toBeNull();
    });

    it('returns null for non-NRA regardless of estate values', () => {
      expect(computeNRAFactor(false, 0, 0)).toBeNull();
    });
  });

  describe('NRA decedent — valid cases', () => {
    it('returns 0.25 for NRA with PH ₱5M and worldwide ₱20M', () => {
      // ₱5M = 500_000_000 centavos; ₱20M = 2_000_000_000 centavos
      const factor = computeNRAFactor(true, 500_000_000, 2_000_000_000);
      expect(factor).toBe(0.25);
    });

    it('returns 1.0 when PH estate equals worldwide estate', () => {
      const factor = computeNRAFactor(true, 1_000_000_000, 1_000_000_000);
      expect(factor).toBe(1.0);
    });

    it('returns 0.5 for PH = half of worldwide', () => {
      const factor = computeNRAFactor(true, 1_000_000_000, 2_000_000_000);
      expect(factor).toBe(0.5);
    });

    it('returns 0 when PH estate is 0 and worldwide > 0', () => {
      const factor = computeNRAFactor(true, 0, 1_000_000_000);
      expect(factor).toBe(0);
    });
  });

  describe('NRA decedent — error cases', () => {
    it('throws NRAProportionalError with ERR_WORLDWIDE_ESTATE_ZERO when worldwide = 0', () => {
      expect(() => computeNRAFactor(true, 0, 0)).toThrow(NRAProportionalError);
      try {
        computeNRAFactor(true, 0, 0);
      } catch (e) {
        expect((e as NRAProportionalError).code).toBe('ERR_WORLDWIDE_ESTATE_ZERO');
      }
    });

    it('throws NRAProportionalError with ERR_PH_EXCEEDS_WORLDWIDE when PH > worldwide', () => {
      expect(() => computeNRAFactor(true, 2_000_000_000, 1_000_000_000)).toThrow(NRAProportionalError);
      try {
        computeNRAFactor(true, 2_000_000_000, 1_000_000_000);
      } catch (e) {
        expect((e as NRAProportionalError).code).toBe('ERR_PH_EXCEEDS_WORLDWIDE');
      }
    });

    it('error message for ERR_WORLDWIDE_ESTATE_ZERO is meaningful', () => {
      try {
        computeNRAFactor(true, 0, 0);
      } catch (e) {
        expect((e as NRAProportionalError).message).toContain('zero');
      }
    });

    it('error message for ERR_PH_EXCEEDS_WORLDWIDE is meaningful', () => {
      try {
        computeNRAFactor(true, 500, 100);
      } catch (e) {
        expect((e as NRAProportionalError).message).toContain('exceed');
      }
    });
  });
});
