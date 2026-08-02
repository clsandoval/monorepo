/**
 * pdf-text.test — exact-value tests for the two PDF-local transforms.
 *
 * Source of truth: `.planning/phases/13-pdf-verification/13-01-PLAN.md` <interfaces>,
 * whose table is reproduced verbatim below. The measured reason these transforms
 * exist at all is `13-RESEARCH.md` section 2: the exported PDF's three fonts are
 * non-embedded, WinAnsi-encoded PDF base-14 fonts, and WinAnsi has no peso sign.
 */
import { describe, it, expect } from 'vitest';
import { PDF_PESO_PREFIX, formatPesoPdf, toPdfSafeText, citationLine } from '../pdf-text';
import { NCC_ARTICLE_DESCRIPTIONS } from '../../../data/ncc-articles';

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

/**
 * citationLine — the single-article citation line.
 *
 * Measured in `.planning/phases/23-.../23-RESEARCH.md` §6: the audit's literal
 * string `Art. 996: Art. 996` no longer occurs anywhere in `frontend/src/`,
 * because Phase 17 added the missing map entry and replaced the key fallback
 * with a loud `CITATION NOT RESOLVED`. What survives is the same duplication in
 * its post-Phase-17 form — fifteen of the seventy-five committed descriptions
 * end in a parenthetical naming the article the line already names.
 */
describe('citationLine', () => {
  it('removes the parenthetical the G39 fixture case exercises', () => {
    expect(
      citationLine('Art. 980', 'Children of the deceased shall always inherit from him (Art. 980 NCC)'),
    ).toBe('Art. 980: Children of the deceased shall always inherit from him');
  });

  it('removes the parenthetical the seeded Alpha case exercises', () => {
    expect(
      citationLine('Art. 996', 'Surviving spouse with legitimate children (Art. 996 NCC)'),
    ).toBe('Art. 996: Surviving spouse with legitimate children');
  });

  it('passes a description with no parenthetical through unchanged', () => {
    expect(
      citationLine('Art. 888', "Legitimate children's legitime = 1/2 of estate shared equally among all"),
    ).toBe("Art. 888: Legitimate children's legitime = 1/2 of estate shared equally among all");
  });

  it('preserves the loud unresolved marker Phase 17 installed', () => {
    expect(citationLine('Art. 9999', 'CITATION NOT RESOLVED')).toBe(
      'Art. 9999: CITATION NOT RESOLVED',
    );
  });

  it("never rewrites the engine's own raw string, not even its spacing", () => {
    expect(citationLine('Art.996', 'x').startsWith('Art.996: ')).toBe(true);
  });

  it('changes exactly fifteen of the seventy-five committed descriptions', () => {
    const entries = Object.entries(NCC_ARTICLE_DESCRIPTIONS);
    let changed = 0;
    for (const [key, description] of entries) {
      const line = citationLine(key, description);
      const rhs = line.slice(`${key}: `.length);
      if (rhs !== description) changed += 1;
    }
    expect(entries.length).toBe(75);
    expect(changed).toBe(15);
  });

  it('always emits the key, a colon and a space on the left', () => {
    for (const [key, description] of Object.entries(NCC_ARTICLE_DESCRIPTIONS)) {
      expect(citationLine(key, description).startsWith(`${key}: `)).toBe(true);
    }
  });

  it('names its article at most once, over every committed description but one', () => {
    // Declared here rather than imported: a test that counts with the same
    // expression the product strips with would agree with itself rather than
    // with the document.
    const ARTICLE_TOKEN = /Art\.\s*\d+/g;

    // MEASURED EXCEPTION, pinned by name rather than papered over.
    //
    // Exactly one of the seventy-five entries still names its article twice
    // after the strip: `FC Art.179`, whose description reads "Family Code
    // Art. 179 — property regime provisions applicable to succession". Its
    // duplication is an inline restatement, not the trailing `(Art. N NCC)`
    // parenthetical this transform removes, and widening the pattern to catch
    // it would mean editing how a Family Code citation is presented — a change
    // no INST-* requirement owns.
    //
    // It cannot reach a rendered citation line. Measured over engine/src:
    // the engine emits eighty distinct article strings into `legal_basis` and
    // NONE of them is `FC Art.179`, so `resolveArticle` is never called with
    // that key. This assertion is exact in both directions, so it turns red
    // either if the entry is fixed or if a second duplicate appears.
    const repeated: string[] = [];
    for (const [key, description] of Object.entries(NCC_ARTICLE_DESCRIPTIONS)) {
      const line = citationLine(key, description);
      const count = (line.match(ARTICLE_TOKEN) ?? []).length;
      if (count > 1) repeated.push(key);
    }
    expect(repeated).toEqual(['FC Art.179']);
  });

  it('names its article exactly once for every key the engine can actually emit', () => {
    const ARTICLE_TOKEN = /Art\.\s*\d+/g;
    for (const [key, description] of Object.entries(NCC_ARTICLE_DESCRIPTIONS)) {
      if (key === 'FC Art.179') continue;
      const line = citationLine(key, description);
      expect((line.match(ARTICLE_TOKEN) ?? []).length).toBeLessThanOrEqual(1);
    }
  });
});
