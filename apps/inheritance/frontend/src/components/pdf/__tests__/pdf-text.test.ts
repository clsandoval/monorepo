/**
 * pdf-text.test — exact-value tests for the two PDF-local transforms.
 *
 * Source of truth: `.planning/phases/13-pdf-verification/13-01-PLAN.md` <interfaces>,
 * whose table is reproduced verbatim below. The measured reason these transforms
 * exist at all is `13-RESEARCH.md` section 2: the exported PDF's three fonts are
 * non-embedded, WinAnsi-encoded PDF base-14 fonts, and WinAnsi has no peso sign.
 */
import { describe, it, expect } from 'vitest';
import { PDF_PESO_PREFIX, formatPesoPdf, toPdfSafeText } from '../pdf-text';

const PESO_SIGN = '₱';

describe('PDF_PESO_PREFIX', () => {
  it('is exactly the three ASCII letters P H P followed by one space', () => {
    expect(PDF_PESO_PREFIX).toBe('PHP ');
    expect(PDF_PESO_PREFIX).toHaveLength(4);
  });
});

describe('formatPesoPdf', () => {
  it('formats zero centavos with no decimal part', () => {
    expect(formatPesoPdf(0)).toBe('PHP 0');
  });

  it('formats one centavo with a two-digit decimal part', () => {
    expect(formatPesoPdf(1)).toBe('PHP 0.01');
  });

  it('formats one peso with no decimal part', () => {
    expect(formatPesoPdf(100)).toBe('PHP 1');
  });

  it('formats 1.5 million pesos with comma grouping', () => {
    expect(formatPesoPdf(150000000)).toBe('PHP 1,500,000');
  });

  it('formats 6 million pesos with comma grouping', () => {
    expect(formatPesoPdf(600000000)).toBe('PHP 6,000,000');
  });

  it('formats a non-zero centavo remainder', () => {
    expect(formatPesoPdf(123456)).toBe('PHP 1,234.56');
  });

  it('formats a large string value, the trillion-peso row pinned by the plan', () => {
    expect(formatPesoPdf('900719925474099')).toBe('PHP 9,007,199,254,740.99');
  });

  it('formats a value ABOVE Number.MAX_SAFE_INTEGER without precision loss', () => {
    // Money.centavos is `number | string` precisely so an estate may exceed the
    // float-safe range. This centavo count genuinely does.
    const huge = '90071992547409999';
    expect(BigInt(huge)).toBeGreaterThan(BigInt(Number.MAX_SAFE_INTEGER));
    expect(formatPesoPdf(huge)).toBe('PHP 900,719,925,474,099.99');
    // A float round-trip would have silently lost the last centavos; prove the
    // BigInt path is what makes the assertion above hold.
    expect(String(Number(huge))).not.toBe(huge);
  });

  it('accepts a bigint input', () => {
    expect(formatPesoPdf(123456n)).toBe('PHP 1,234.56');
  });

  it('formats a negative amount', () => {
    expect(formatPesoPdf(-5000000)).toBe('PHP -50,000');
  });

  it('never emits the peso sign', () => {
    const values: Array<number | string> = [
      0,
      1,
      100,
      123456,
      150000000,
      600000000,
      '900719925474099',
      -5000000,
    ];
    for (const v of values) {
      expect(formatPesoPdf(v)).not.toContain(PESO_SIGN);
    }
  });
});

describe('toPdfSafeText', () => {
  it('replaces both occurrences when a string carries two peso signs', () => {
    const input = `Heir receives ${PESO_SIGN}1,000,000 of the ${PESO_SIGN}2,000,000 estate.`;
    expect(toPdfSafeText(input)).toBe(
      'Heir receives PHP 1,000,000 of the PHP 2,000,000 estate.',
    );
    expect(toPdfSafeText(input)).not.toContain(PESO_SIGN);
  });

  it('returns a string with no peso sign unchanged, including markdown asterisks', () => {
    const input = '**Juan Dela Cruz** inherits by *representation* (Art. 981).';
    expect(toPdfSafeText(input)).toBe(input);
  });

  it('changes nothing but the peso sign — whitespace and newlines survive', () => {
    const input = `  leading and trailing  \n\tsecond line ${PESO_SIGN}5.00  `;
    expect(toPdfSafeText(input)).toBe(
      '  leading and trailing  \n\tsecond line PHP 5.00  ',
    );
  });

  it('returns the empty string unchanged', () => {
    expect(toPdfSafeText('')).toBe('');
  });
});
