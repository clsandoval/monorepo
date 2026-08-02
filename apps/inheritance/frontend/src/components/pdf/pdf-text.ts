/**
 * pdf-text — the only money and text transforms the PDF layer uses.
 *
 * Why this exists, measured rather than assumed
 * ---------------------------------------------
 * The generated estate report carries three fonts and none of them is embedded:
 * `pdffonts` reports `Times-Roman`, `Times-Bold` and `Helvetica`, all PDF base-14,
 * all WinAnsi-encoded. WinAnsi has no code point for the peso sign, so U+20B1 is
 * written into the content stream as the single byte 0xB1. That byte extracts as
 * U+00B1 (the plus-minus sign) and rasterises at near-zero advance width,
 * overprinting the first digit of the amount it prefixes. Text extraction
 * additionally splits the figure onto its own line, which makes any deterministic
 * assertion on a peso amount impossible.
 *
 * Measurement: `.planning/phases/13-pdf-verification/13-RESEARCH.md` section 2.
 * The same probe run with the ASCII token `PHP ` extracted cleanly, one contiguous
 * line per label.
 *
 * Scope: this module is PDF-only. `formatPeso` in `src/types/index.ts` is
 * untouched — a browser renders U+20B1 correctly, so every screen keeps it.
 */

/** ISO 4217 alphabetic code for the Philippine peso, plus one space. */
export const PDF_PESO_PREFIX = 'PHP ';

/** The peso sign, U+20B1 — the single character the PDF's fonts cannot represent. */
const PESO_SIGN = '₱';

/**
 * Formats a centavo amount for the PDF using only WinAnsi-representable
 * characters. Mirrors `formatPeso`'s digit algorithm exactly: comma-grouped
 * pesos, and a `.` plus two zero-padded digits only when the centavo remainder
 * is non-zero.
 *
 * All arithmetic is BigInt. `Money.centavos` is typed `number | string`
 * precisely so an estate may exceed `Number.MAX_SAFE_INTEGER`; converting to a
 * JS number here would silently lose centavos on a large estate.
 */
export function formatPesoPdf(centavos: number | string | bigint): string {
  const c = BigInt(centavos);
  const pesos = c / 100n;
  const cents = c % 100n;
  const pesosStr = pesos.toLocaleString('en-US');
  if (cents === 0n) {
    return `${PDF_PESO_PREFIX}${pesosStr}`;
  }
  return `${PDF_PESO_PREFIX}${pesosStr}.${cents.toString().padStart(2, '0')}`;
}

/**
 * Replaces every peso sign in engine-produced narrative text with the PDF-safe
 * token. Nothing else is changed: no markdown is stripped, no whitespace is
 * trimmed, and no other code point is touched.
 */
export function toPdfSafeText(text: string): string {
  return text.split(PESO_SIGN).join(PDF_PESO_PREFIX);
}

/**
 * A trailing parenthetical of the shape `(Art. <digits> NCC)`, together with any
 * whitespace immediately preceding it.
 *
 * Why it exists, measured rather than assumed. Fifteen of the seventy-five
 * entries in `src/data/ncc-articles.ts` end with a parenthetical naming the same
 * article the citation's own left-hand side already names. The PDF prints the
 * engine's `legal_basis` string, a colon, and the description on one line, so
 * those fifteen print the article twice:
 *
 *   Art. 980: Children of the deceased shall always inherit from him (Art. 980 NCC)
 *
 * The strip happens HERE, at render time, and NOT by editing the data file.
 * `scripts/check-citation-integrity.mjs` (G14) and
 * `scripts/check-spec-legal-text.mjs` (G27) both read that file's contents, and
 * rewriting sixty descriptions to fix a rendering defect would put a
 * presentation change inside the attribution authority.
 *
 * The global flag is present so a description carrying two such parentheticals
 * loses both.
 */
const ARTICLE_PARENTHETICAL = /\s*\((?:Art)\.\s*\d+\s*NCC\)/g;

/**
 * Joins the engine's own citation key to its description on one line, naming the
 * article exactly once.
 *
 * `raw` — the engine's `legal_basis` string — survives untouched on the left of
 * the colon. This function never reformats it, never normalises its spacing and
 * never substitutes a different article for it: the engine is the single
 * attribution authority and this is a text transform, not a lookup.
 *
 * Only the right-hand side changes, and only by removing the redundant
 * parenthetical. Nothing is lowercased, no internal whitespace is collapsed and
 * no full stop is added.
 */
export function citationLine(raw: string, text: string): string {
  return `${raw}: ${text.replace(ARTICLE_PARENTHETICAL, '').trimEnd()}`;
}
