import { describe, it, expect } from 'vitest';
import { getLegalRate, getRateCitation } from '../rates';
import {
  RATE_PRE_BSP_LOAN,
  RATE_PRE_BSP_NON_LOAN,
  RATE_POST_BSP,
  RATE_PRE_BSP_POST_FINALITY,
} from '../constants';
import { CITATIONS } from '../constants';

describe('getLegalRate', () => {
  // Pre-BSP 799 (before July 1, 2013)
  describe('pre-BSP 799 regime', () => {
    it('returns 12% for loan_forbearance before transition', () => {
      expect(getLegalRate('loan_forbearance', '2010-01-01', false)).toBe(RATE_PRE_BSP_LOAN);
    });

    it('returns 6% for non_loan before transition', () => {
      expect(getLegalRate('non_loan', '2010-01-01', false)).toBe(RATE_PRE_BSP_NON_LOAN);
    });

    it('returns 12% post-finality before transition (loan)', () => {
      expect(getLegalRate('loan_forbearance', '2010-01-01', true)).toBe(RATE_PRE_BSP_POST_FINALITY);
    });

    it('returns 12% post-finality before transition (non_loan)', () => {
      expect(getLegalRate('non_loan', '2010-01-01', true)).toBe(RATE_PRE_BSP_POST_FINALITY);
    });

    it('edge case: June 30, 2013 is still pre-BSP', () => {
      expect(getLegalRate('loan_forbearance', '2013-06-30', false)).toBe(RATE_PRE_BSP_LOAN);
      expect(getLegalRate('non_loan', '2013-06-30', false)).toBe(RATE_PRE_BSP_NON_LOAN);
    });
  });

  // Post-BSP 799 (on or after July 1, 2013)
  describe('post-BSP 799 regime', () => {
    it('returns 6% for loan_forbearance on transition date', () => {
      expect(getLegalRate('loan_forbearance', '2013-07-01', false)).toBe(RATE_POST_BSP);
    });

    it('returns 6% for non_loan on transition date', () => {
      expect(getLegalRate('non_loan', '2013-07-01', false)).toBe(RATE_POST_BSP);
    });

    it('returns 6% post-finality on transition date', () => {
      expect(getLegalRate('loan_forbearance', '2013-07-01', true)).toBe(RATE_POST_BSP);
    });

    it('returns 6% for loan_forbearance well after transition', () => {
      expect(getLegalRate('loan_forbearance', '2020-01-01', false)).toBe(RATE_POST_BSP);
    });

    it('returns 6% for non_loan well after transition', () => {
      expect(getLegalRate('non_loan', '2020-01-01', false)).toBe(RATE_POST_BSP);
    });

    it('returns 6% post-finality after transition', () => {
      expect(getLegalRate('non_loan', '2020-01-01', true)).toBe(RATE_POST_BSP);
    });

    it('edge case: July 1, 2013 is post-BSP', () => {
      expect(getLegalRate('loan_forbearance', '2013-07-01', false)).toBe(RATE_POST_BSP);
      expect(getLegalRate('non_loan', '2013-07-01', false)).toBe(RATE_POST_BSP);
    });
  });
});

describe('getRateCitation', () => {
  it('returns Eastern Shipping citation for pre-BSP non-post-finality', () => {
    const citation = getRateCitation('2010-01-01', false);
    expect(citation).toBe(CITATIONS.EASTERN_SHIPPING);
  });

  it('returns Nacar/BSP_799 citation for post-BSP', () => {
    const citation = getRateCitation('2013-07-01', false);
    expect(citation).toContain('Nacar');
  });

  it('returns Nacar citation for post-BSP post-finality', () => {
    const citation = getRateCitation('2020-01-01', true);
    expect(citation).toContain('Nacar');
  });

  it('returns Eastern Shipping citation for pre-BSP post-finality', () => {
    const citation = getRateCitation('2013-06-30', true);
    expect(citation).toBe(CITATIONS.EASTERN_SHIPPING);
  });
});
