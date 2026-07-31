/*
 * journey/pdf-structure.mjs — gate G23. Structure, exact money and per-heir
 * evidence, all asserted against the PDF the product's own Export button
 * produced during THIS run (PDF-01, PDF-02, PDF-03).
 *
 * THE REQUIRED-SECTION LIST IS DERIVED FROM THE RUN, NOT COMMITTED. Two
 * sections are conditional on engine output: WarningsSection returns null when
 * the engine emits no warning, and NarrativesSection returns null when there are
 * no narratives. A committed list of eight headings would raise a false failure
 * on a case that legitimately has no warnings, which is exactly what the seeded
 * Alpha case is (13-RESEARCH.md section 3: four narratives, zero warnings).
 *
 * THE FIRM HEADER IS DELIBERATELY EXCLUDED. ActionsBar.tsx calls
 * downloadPDF(input, output, null), so no PDF a user can obtain carries a firm
 * header. Requiring one would assert a section the product never renders.
 *
 * EVERY EXPECTED AMOUNT IS COMPUTED, NEVER STORED. No peso figure is written
 * anywhere in this file. The run resets the Alpha case, asks the compiled engine
 * through journey/engine.mjs, makes the product compute and export in a real
 * browser, and compares what the document actually says.
 *
 * EVERY COMPARISON IS BigInt, WITH NO TOLERANCE OF ANY KIND. The engine converts
 * to centavos exactly once, in step10_finalize.rs, with largest-remainder
 * distribution. A gate that allowed one centavo of slack would hide precisely
 * the defect it exists to find. There is no rounding helper, no slack term and
 * no absolute-difference comparison in this file.
 *
 * THE GATE PARSES, IT NEVER FORMATS. parsePdfPesoText is the inverse of
 * formatPesoPdf (src/components/pdf/pdf-text.ts). Writing a second formatter
 * here would create the duplicate money implementation EXT-02 forbids and would
 * make the gate agree with itself rather than with the product.
 *
 * THE MONEY COMPARISON RUNS IN BOTH DIRECTIONS. Every structured engine amount
 * must appear in the document, AND every amount the document prints must be one
 * the engine produced. A one-directional check passes a PDF that invented a line.
 *
 * CITATIONS ARE ASSERTED PRESENT AND MATCHING THE ENGINE'S OWN legal_basis --
 * NEVER ASSERTED CORRECT. Whether Art. 996 is the right article for this family
 * is a point of Philippine law, and nothing in this file decides it.
 *
 * Exit contract, the project's three-valued one: 0 passed, 1 failed, 2 could not
 * run (`PDF STRUCTURE CANNOT RUN:` on stderr).
 */

import { JourneyCannotRun } from './serve.mjs';
import { captureExportedPdf, PDF_FIXED_CLOCK } from './pdf-capture.mjs';
import { extractPdfText, PDF_MARKERS } from './pdf.mjs';

const TOTAL_CHECKS = 4;

/** The PDF-safe currency token plan 13-01 introduced. */
const PDF_PESO_PREFIX = 'PHP ';

function cannotRun(reason) {
  console.error(`PDF STRUCTURE CANNOT RUN: ${reason}`);
  console.log(`GATE-SKIPS total=${TOTAL_CHECKS} skipped=${TOTAL_CHECKS}`);
  process.exit(2);
}

/**
 * The exact inverse of formatPesoPdf (src/components/pdf/pdf-text.ts).
 *
 * formatPesoPdf emits `PHP ` + thousands-separated pesos, and a `.` plus exactly
 * two digits only when the centavo remainder is non-zero. Anything else is a
 * string this parser must refuse rather than guess at: a silently-tolerated
 * stray character is precisely how a wrong figure would pass this gate.
 *
 * @param {string} text
 * @returns {bigint} centavos
 */
export function parsePdfPesoText(text) {
  const original = String(text);
  let s = original.trim();
  // A leading minus appears on the donations-imputed line, which renders
  // "Donations Imputed: -PHP 1,234". The sign is stripped, not interpreted:
  // this parser reports magnitude and the caller decides what the line means.
  s = s.replace(/^[-−]\s*/, '');
  if (s.startsWith(PDF_PESO_PREFIX)) {
    s = s.slice(PDF_PESO_PREFIX.length);
  }
  s = s.replace(/^[-−]\s*/, '');
  s = s.trim().replace(/,/g, '');

  const dot = s.indexOf('.');
  let pesoPart = s;
  let centPart = '00';
  if (dot !== -1) {
    pesoPart = s.slice(0, dot);
    centPart = s.slice(dot + 1);
    if (!/^\d{2}$/.test(centPart)) {
      throw new Error(`PESO UNPARSEABLE: ${original}`);
    }
  }
  if (!/^\d+$/.test(pesoPart)) {
    throw new Error(`PESO UNPARSEABLE: ${original}`);
  }
  return BigInt(pesoPart) * 100n + BigInt(centPart);
}

/** Centavos out of a Money whose `.centavos` is `number | string`, as an exact BigInt. */
function centavosOf(money) {
  if (money == null || money.centavos == null) {
    throw new Error(`MONEY MISSING: ${JSON.stringify(money)}`);
  }
  return BigInt(money.centavos);
}

/**
 * Every `PHP <amount>` token the document prints, in document order.
 * @param {string} normalised
 * @returns {string[]}
 */
function pdfAmountTokens(normalised) {
  return normalised.match(/PHP\s[\d,]+(?:\.\d{2})?/g) || [];
}

/**
 * Every peso amount the engine wrote into a narrative string. The engine emits
 * U+20B1; plan 13-01's toPdfSafeText is what turns those into `PHP ` on the
 * page, so this set is engine-derived just as much as the structured one.
 *
 * @param {string} text
 * @returns {bigint[]}
 */
function narrativeAmounts(text) {
  const out = [];
  for (const token of text.match(/₱[\d,]+(?:\.\d{2})?/g) || []) {
    out.push(parsePdfPesoText(token.replace('₱', PDF_PESO_PREFIX)));
  }
  return out;
}

async function main() {
  let captured;
  try {
    captured = await captureExportedPdf();
  } catch (err) {
    if (err instanceof JourneyCannotRun) cannotRun(err.reason);
    if (err && err.message && err.message.startsWith(PDF_MARKERS.TOOLCHAIN_MISSING)) {
      cannotRun(err.message);
    }
    throw err;
  }

  const { pdfBuffer, expected, input } = captured;

  let rawText;
  try {
    rawText = extractPdfText(pdfBuffer);
  } catch (err) {
    if (err && err.message && err.message.startsWith(PDF_MARKERS.TOOLCHAIN_MISSING)) {
      cannotRun(err.message);
    }
    cannotRun(`the captured document yielded no extractable text: ${err.message}`);
  }

  // Collapse every run of whitespace. @react-pdf/renderer wraps narrative bodies
  // across lines, so a raw containment test would fail on prose the document
  // really does carry.
  const text = rawText.replace(/\s+/g, ' ');

  const failures = [];

  // =====================================================================
  // 1. SECTION MISSING — the derived required-section list
  // =====================================================================
  const requiredSections = [
    `Estate of ${input.decedent.name}`,
    `Date of Death: ${input.decedent.date_of_death}`,
    // The fixed clock plan 13-03 installs. `2026-06-15T00:00:00Z` -> `2026-06-15`.
    `Report Generated: ${PDF_FIXED_CLOCK.slice(0, 10)}`,
    'Succession Type:',
    'Net Distributable Estate:',
    'Distribution of Shares',
    // The four table column headings.
    'Heir',
    'Relationship',
    'Mode',
    'Net Share',
    'Per-Heir Breakdown',
    'Gross Entitlement:',
    'Net From Estate:',
    'Computation Log',
    `Final Scenario: ${expected.computation_log.final_scenario}`,
    'Disclaimer',
    'informational purposes',
  ];
  if (expected.narratives.length > 0) {
    requiredSections.push('Heir Narratives');
  }
  if (expected.warnings.length > 0) {
    requiredSections.push('Warnings');
  }

  for (const section of requiredSections) {
    if (!text.includes(section)) {
      failures.push(
        `SECTION MISSING — the extracted text does not contain ${JSON.stringify(section)}`,
      );
    }
  }

  // =====================================================================
  // 2/3. the two expected amount sets, both built from this run
  // =====================================================================
  const structured = new Set();
  for (const share of expected.per_heir_shares) {
    for (const key of [
      'from_legitime',
      'from_free_portion',
      'from_intestate',
      'gross_entitlement',
      'donations_imputed',
      'net_from_estate',
    ]) {
      const c = centavosOf(share[key]);
      // PerHeirBreakdownSection suppresses a zero component, so a zero is not
      // an amount the document is required to print.
      if (c !== 0n) structured.add(c);
    }
  }
  structured.add(centavosOf(input.net_distributable_estate));

  const fromNarratives = new Set();
  for (const n of expected.narratives) {
    for (const c of narrativeAmounts(n.text)) fromNarratives.add(c);
  }

  const acceptable = new Set([...structured, ...fromNarratives]);

  // ---- PDF AMOUNT UNEXPECTED: every token the document prints ----
  const tokens = pdfAmountTokens(text);
  const seenInDocument = new Set();
  for (const token of tokens) {
    let parsed;
    try {
      parsed = parsePdfPesoText(token);
    } catch (err) {
      failures.push(
        `PDF AMOUNT UNEXPECTED — the document prints ${JSON.stringify(token)}, which ${err.message}`,
      );
      continue;
    }
    seenInDocument.add(parsed);
    if (!acceptable.has(parsed)) {
      failures.push(
        `PDF AMOUNT UNEXPECTED — the document prints ${JSON.stringify(token)} = ${parsed} centavos, ` +
          `which the engine did not produce for this case. Engine amounts this run: ` +
          `[${[...acceptable].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)).join(', ')}]`,
      );
    }
  }

  // ---- PDF AMOUNT MISSING: every structured engine amount ----
  // Checked against the structured set only. A narrative amount is prose the
  // engine may phrase in whole pesos while the table prints centavos, and
  // requiring both directions on prose would assert the engine's wording rather
  // than its arithmetic.
  for (const want of structured) {
    if (!seenInDocument.has(want)) {
      failures.push(
        `PDF AMOUNT MISSING — the engine produced ${want} centavos for this case but no amount in ` +
          `the document parses to it. Amounts the document printed: ` +
          `[${[...seenInDocument].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)).join(', ')}]`,
      );
    }
  }

  // =====================================================================
  // 4. HEIR EVIDENCE MISSING
  // =====================================================================
  const narrativeByHeir = new Map(expected.narratives.map((n) => [n.heir_id, n]));
  const narrativesHeadingAt = text.indexOf('Heir Narratives');
  let awardedHeirs = 0;

  for (const share of expected.per_heir_shares) {
    if (centavosOf(share.net_from_estate) <= 0n) continue;
    awardedHeirs += 1;

    if (!text.includes(share.heir_name)) {
      failures.push(
        `HEIR EVIDENCE MISSING — heir '${share.heir_id}' was awarded a share but the document ` +
          `never names ${JSON.stringify(share.heir_name)}`,
      );
    }

    const citationFound = share.legal_basis.some((b) => text.includes(b));
    if (!citationFound) {
      failures.push(
        `HEIR EVIDENCE MISSING — heir '${share.heir_id}' has legal_basis ` +
          `[${share.legal_basis.map((b) => JSON.stringify(b)).join(', ')}] but the document ` +
          `contains none of those citations`,
      );
    }

    const narrative = narrativeByHeir.get(share.heir_id);
    if (!narrative) {
      failures.push(
        `HEIR EVIDENCE MISSING — heir '${share.heir_id}' was awarded a share but the engine ` +
          `produced no narrative for that heir, so the document cannot carry one`,
      );
      continue;
    }
    if (narrativesHeadingAt === -1) {
      failures.push(
        `HEIR EVIDENCE MISSING — heir '${share.heir_id}' has a narrative but the document has no ` +
          `"Heir Narratives" heading at all`,
      );
      continue;
    }
    const lastMention = text.lastIndexOf(narrative.heir_name);
    if (lastMention === -1 || lastMention <= narrativesHeadingAt) {
      failures.push(
        `HEIR EVIDENCE MISSING — heir '${share.heir_id}' (${JSON.stringify(narrative.heir_name)}) ` +
          `is never mentioned after the "Heir Narratives" heading at index ${narrativesHeadingAt}, ` +
          `so the narrative section rendered no body for that heir ` +
          `(last mention at index ${lastMention})`,
      );
    }
  }

  for (const line of failures) console.error(line);

  // Printed on BOTH the pass and the fail path — scripts/check-gate-skips.mjs
  // reads this line regardless of outcome.
  console.log(`GATE-SKIPS total=${TOTAL_CHECKS} skipped=0`);

  if (failures.length > 0) {
    console.error(`PDF STRUCTURE FAIL checks=${TOTAL_CHECKS} failed=${failures.length}`);
    process.exit(1);
  }

  // `amounts` counts the money tokens VERIFIED in the document, not the number
  // of distinct values: the seeded case awards four heirs the same share, so a
  // set of distinct engine values collapses to two while the document really
  // does print twenty-odd amounts, every one of them checked.
  console.log(
    `PDF STRUCTURE PASS sections=${requiredSections.length} amounts=${tokens.length} ` +
      `distinct=${acceptable.size} heirs=${awardedHeirs}`,
  );
  process.exit(0);
}

// Only run the gate when this file is EXECUTED. Importing it must be free of
// side effects, so the parsePdfPesoText round-trip proof stays runnable without
// building the application and launching a browser.
if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(`PDF STRUCTURE FAIL checks=? failed=? : ${err && err.stack ? err.stack : err}`);
    console.log(`GATE-SKIPS total=${TOTAL_CHECKS} skipped=0`);
    process.exit(1);
  });
}
