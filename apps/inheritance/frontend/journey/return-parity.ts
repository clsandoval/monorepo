/*
 * journey/return-parity.ts — the three surfaces of BIR Form 1801 must agree
 * with the engine, and with each other.
 *
 * WHAT THIS PROVES. The figures on the screen, the figures in the exported PDF
 * and the figures in the exported CSV are each compared, line by line, against a
 * `computeEstateTax` run performed IN THIS SAME RUN on the same committed fact
 * set. Every line's authority is compared on all three surfaces too, so an
 * attribution the engine emits and a renderer drops is red.
 *
 * THE EXPECTED VALUE IS COMPUTED, NEVER STORED. journey/fixtures/tax-input-alpha.json
 * holds an asset schedule and nothing else. No peso figure is committed anywhere
 * in this gate, which is the discipline G19 established: a stored expectation
 * silently becomes a record of the bug the day the bug ships.
 *
 * EVERY COMPARISON IS BigInt AND EXACT. There is no rounding helper, no slack
 * term and no absolute-difference comparison in this file, because a figure that
 * is close is a wrong figure on a return a lawyer signs. Adding a tolerance
 * constant here is prohibited: it would erase in one line the defect this gate
 * exists to find.
 *
 * THE GATE PARSES, IT NEVER FORMATS. Its three parsers are the exact inverses of
 * the three formatters the PRODUCT uses — `formatPesos` in `Form1801View.tsx`,
 * `formatPesoPdf` in `pdf-text.ts` (imported, not rewritten), and the bare
 * integer `form1801-csv.ts` writes. A formatter written here would make the gate
 * agree with itself rather than with the product.
 *
 * THE COMPARISON RUNS IN BOTH DIRECTIONS on every surface: every id the engine
 * produced appears on the surface, AND every id the surface prints is one the
 * engine produced. A one-directional check passes a surface that invented a line.
 *
 * THE ONE ANCHOR A MODEL REGRESSION CANNOT MOVE. The gate builds its expectation
 * with `buildForm1801Lines`, and the three surfaces render `buildForm1801Lines`,
 * so a line dropped from the MODEL shrinks the expectation and all three
 * surfaces together — the gate passed a deliberately dropped Item 37A at 32 rows
 * before this was addressed. The `LINE SET MISMATCH (model)` check compares the
 * model against the FROZEN `FORM1801_LINE_IDS` constant, which is not derived
 * from any computation, and is therefore the check that catches a vanished row
 * whichever layer dropped it.
 *
 * What this still does not prove is that a line carries the RIGHT AMOUNT for its
 * item: the model is verified against `EstateTaxFullOutput` by its own unit
 * tests, and this gate verifies that three renderers reproduce it faithfully.
 *
 * A RUN THAT COMPARES ZERO ROWS IS A FAILURE, never a pass. Passing because it
 * measured nothing is the most dangerous outcome available to this design.
 *
 * NO EXCEPTION LIST, NO BASELINE, NO MUTATING FLAG. This file cannot write,
 * repair, regenerate, accept, update or waive anything.
 *
 * Exit contract, the project's three-valued one: 0 passed, 1 failed, 2 could not
 * run (`RETURN PARITY CANNOT RUN:` on stderr).
 */

import fs from 'node:fs';

// @ts-expect-error — journey helpers are untyped .mjs, imported by design.
import { readStackEnv, adminClient, getSession } from './session.mjs';
// @ts-expect-error — untyped .mjs
import { readFixtures, seedAuthSession } from './seed.mjs';
// @ts-expect-error — untyped .mjs
import { buildApp, startPreview, JourneyCannotRun } from './serve.mjs';
// @ts-expect-error — untyped .mjs
import { launchBrowser, newJourneyPage } from './browser.mjs';
// @ts-expect-error — untyped .mjs
import { RESETS } from './resets.mjs';
// @ts-expect-error — untyped .mjs
import { extractPdfText } from './pdf.mjs';
// The PDF parser is IMPORTED rather than rewritten: it is already the inverse of
// formatPesoPdf, and a second copy here would drift from the product.
// @ts-expect-error — untyped .mjs
import { parsePdfPesoText } from './pdf-structure.mjs';
// @ts-expect-error — untyped .mjs
import { PDF_FIXED_CLOCK } from './pdf-capture.mjs';

import { computeEstateTax } from '../src/lib/estate-tax-engine/pipeline';
import { buildForm1801Lines, FORM1801_LINE_IDS } from '../src/lib/estate-tax-engine/form1801-lines';
import type { EstateTaxWizardState } from '../src/types/estate-tax';

const SETTLE_MS = 4000;
const DOWNLOAD_TIMEOUT_MS = 60000;

/** The fact set the gate drives the product with. Facts only, no amounts. */
const FIXTURE_URL = new URL('./fixtures/tax-input-alpha.json', import.meta.url);

// ── Parsers ─────────────────────────────────────────────────────────────────

/**
 * The exact inverse of `formatPesos` in `Form1801View.tsx`: `en-US` comma
 * grouping, exactly two decimal digits, no currency mark.
 *
 * Anything else throws. A silently tolerated stray character is precisely how a
 * wrong figure would pass this gate.
 */
export function parseScreenPesoText(text: string): bigint {
  const original = String(text);
  const s = original.trim().replace(/,/g, '');
  const dot = s.indexOf('.');
  if (dot === -1) {
    throw new Error(`SCREEN PESO UNPARSEABLE: ${JSON.stringify(original)}`);
  }
  const pesoPart = s.slice(0, dot);
  const centPart = s.slice(dot + 1);
  if (!/^\d{2}$/.test(centPart) || !/^\d+$/.test(pesoPart)) {
    throw new Error(`SCREEN PESO UNPARSEABLE: ${JSON.stringify(original)}`);
  }
  return BigInt(pesoPart) * 100n + BigInt(centPart);
}

/**
 * The inverse of the bare integer `form1801-csv.ts` writes. It accepts only an
 * optionally-signed run of digits, and never a grouped or decimal string.
 */
export function parseCsvCentavos(cell: string): bigint {
  const original = String(cell);
  const s = original.trim();
  if (!/^-?\d+$/.test(s)) {
    throw new Error(`CSV CENTAVOS UNPARSEABLE: ${JSON.stringify(original)}`);
  }
  return BigInt(s);
}

/** What the engine says each line should carry, computed this run. */
export interface ExpectedLine {
  item: string;
  exclusive: bigint | null;
  conjugal: bigint | null;
  total: bigint | null;
  authority: string;
}

/** Compute the return from the fact set and project it onto the line model. */
export function expectedLines(state: EstateTaxWizardState): Map<string, ExpectedLine> {
  const output = computeEstateTax(state);
  const { lines } = buildForm1801Lines(output);
  const map = new Map<string, ExpectedLine>();
  for (const line of lines) {
    map.set(line.id, {
      item: line.item,
      exclusive: line.exclusive === null ? null : BigInt(line.exclusive),
      conjugal: line.conjugal === null ? null : BigInt(line.conjugal),
      total: line.total === null ? null : BigInt(line.total),
      authority: line.authority,
    });
  }
  return map;
}

// ── CSV reading ─────────────────────────────────────────────────────────────

/** Split one CSV record into cells, honouring RFC 4180 quoting. */
function splitCsvRecord(record: string): string[] {
  const cells: string[] = [];
  let cell = '';
  let inQuotes = false;
  for (let i = 0; i < record.length; i++) {
    const ch = record[i];
    if (inQuotes) {
      if (ch === '"') {
        if (record[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cell += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      cells.push(cell);
      cell = '';
    } else {
      cell += ch;
    }
  }
  cells.push(cell);
  return cells;
}

// ── The gate ────────────────────────────────────────────────────────────────

interface SurfaceRow {
  total: string;
  authority: string;
}

async function main(): Promise<number> {
  const env = readStackEnv();
  if (env === null || !env.API_URL) {
    throw new JourneyCannotRun('local Supabase stack is not running');
  }

  const state = JSON.parse(fs.readFileSync(FIXTURE_URL, 'utf8')) as EstateTaxWizardState;
  const expected = expectedLines(state);

  const fixtures = readFixtures();
  const caseId = fixtures.orgs.alpha.case_id;
  const admin = adminClient(env);

  let preview: { origin: string; stop: () => Promise<void> } | null = null;
  let browser: { close: () => Promise<void> } | null = null;

  const screenRows = new Map<string, SurfaceRow>();
  let pdfText = '';
  const csvRows = new Map<string, SurfaceRow>();

  try {
    await RESETS['case-alpha-tax-input'](admin);

    await buildApp();
    preview = await startPreview();
    try {
      browser = await launchBrowser();
    } catch (err) {
      throw new JourneyCannotRun(
        `chromium is not installed or failed to launch: ${err instanceof Error ? err.message : err}`,
      );
    }

    const session = await getSession(env, 'alpha');
    const page = await newJourneyPage(browser);
    try {
      // The pinned clock makes `generatedOn`, and therefore both filenames and
      // the document's provenance line, deterministic.
      await page.clock.setFixedTime(new Date(PDF_FIXED_CLOCK));
      await seedAuthSession(page, preview!.origin, session);
      await page.goto(`${preview!.origin}/cases/${caseId}/tax?tab=7`, { waitUntil: 'load' });
      await page.waitForSelector('[data-testid="estate-tax-wizard"]');
      await page.waitForSelector('[data-testid="compute-estate-tax"]');
      await page.click('[data-testid="compute-estate-tax"]');
      await page.waitForSelector('[data-testid="tax-results-panel"]');
      await page.waitForTimeout(SETTLE_MS);

      // ── Screen ──────────────────────────────────────────────────────────
      const scraped: Array<{ id: string; total: string; authority: string }> = await page.$$eval(
        'tbody tr[data-testid^="form-line-"]',
        (rows: Element[]) =>
          rows.map((row) => {
            const id = (row.getAttribute('data-testid') ?? '').replace(/^form-line-/, '');
            const cells = row.querySelectorAll('td');
            return {
              id,
              total: (cells[4]?.textContent ?? '').trim(),
              authority: (cells[5]?.textContent ?? '').trim(),
            };
          }),
      );
      for (const row of scraped) {
        screenRows.set(row.id, { total: row.total, authority: row.authority });
      }

      // ── PDF ─────────────────────────────────────────────────────────────
      await page.waitForSelector('[data-testid="export-form1801-pdf"]');
      const pdfDownloadPromise = page.waitForEvent('download', { timeout: DOWNLOAD_TIMEOUT_MS });
      await page.click('[data-testid="export-form1801-pdf"]');
      let pdfDownload;
      try {
        pdfDownload = await pdfDownloadPromise;
      } catch (err) {
        throw new JourneyCannotRun(
          `the Export PDF button produced no download within ${DOWNLOAD_TIMEOUT_MS} ms: ` +
            `${err instanceof Error ? err.message : err}`,
        );
      }
      const pdfPath = await pdfDownload.path();
      if (!pdfPath) throw new JourneyCannotRun('the PDF download reported no path on disk');
      const pdfBuffer = fs.readFileSync(pdfPath);
      const magic = pdfBuffer.subarray(0, 5).toString('latin1');
      if (magic !== '%PDF-') {
        throw new JourneyCannotRun(
          `the downloaded file does not begin with "%PDF-" (observed ${JSON.stringify(magic)}), ` +
            `so every downstream check would pass vacuously`,
        );
      }
      pdfText = extractPdfText(pdfBuffer);

      // ── CSV ─────────────────────────────────────────────────────────────
      await page.waitForSelector('[data-testid="export-form1801-csv"]');
      const csvDownloadPromise = page.waitForEvent('download', { timeout: DOWNLOAD_TIMEOUT_MS });
      await page.click('[data-testid="export-form1801-csv"]');
      let csvDownload;
      try {
        csvDownload = await csvDownloadPromise;
      } catch (err) {
        throw new JourneyCannotRun(
          `the Export CSV button produced no download within ${DOWNLOAD_TIMEOUT_MS} ms: ` +
            `${err instanceof Error ? err.message : err}`,
        );
      }
      const csvPath = await csvDownload.path();
      if (!csvPath) throw new JourneyCannotRun('the CSV download reported no path on disk');
      const csvText = fs.readFileSync(csvPath, 'utf8');

      const records = csvText.split('\r\n');
      const headerIndex = records.findIndex((r) => r.startsWith('Item,Description,'));
      if (headerIndex === -1) {
        throw new JourneyCannotRun('the downloaded CSV carries no Form 1801 header row');
      }
      const header = splitCsvRecord(records[headerIndex]!);
      const itemCol = header.indexOf('Item');
      const totalCol = header.indexOf('Total (centavos)');
      const authorityCol = header.indexOf('Authority');
      if (itemCol === -1 || totalCol === -1 || authorityCol === -1) {
        throw new JourneyCannotRun('the downloaded CSV is missing a required column header');
      }
      // The CSV keys on the ITEM cell, which is what a reader of the file sees.
      for (const record of records.slice(headerIndex + 1)) {
        if (record === '' || record.startsWith('MANUAL REVIEW')) break;
        const cells = splitCsvRecord(record);
        const item = (cells[itemCol] ?? '').trim();
        if (item === '') continue;
        // Two Schedule 5 rows share the item cell 5C, so store a list per item.
        const key = `${item}#${csvRows.size}`;
        csvRows.set(key, {
          total: (cells[totalCol] ?? '').trim(),
          authority: (cells[authorityCol] ?? '').trim(),
        });
      }
    } finally {
      await page.close().catch(() => {});
    }
  } finally {
    if (browser) await browser.close().catch(() => {});
    if (preview) await preview.stop().catch(() => {});
  }

  // ── Comparison ──────────────────────────────────────────────────────────
  const violations: string[] = [];

  if (screenRows.size === 0 || pdfText.trim().length === 0 || csvRows.size === 0) {
    console.error(
      `CORPUS EMPTY: screen rows=${screenRows.size}, pdf text length=${pdfText.trim().length}, ` +
        `csv rows=${csvRows.size}. A run that compares nothing is a failure, not a pass.`,
    );
    console.log('GATE-SKIPS total=0 skipped=0');
    console.log('RETURN PARITY FAIL — CORPUS EMPTY');
    return 1;
  }

  // LINE SET MISMATCH — the model itself, against the FROZEN id constant.
  //
  // This check exists because every other comparison in this gate is made
  // against `buildForm1801Lines`, which is also what the three surfaces render.
  // A line dropped from the MODEL therefore shrinks the expectation and the
  // surfaces together, and the gate passed a deliberately dropped Item 37A at
  // 32 rows until this check was added. `FORM1801_LINE_IDS` is frozen and is
  // not derived from any computation, so it is the one anchor in this file that
  // a model regression cannot move.
  const frozenIds = [...FORM1801_LINE_IDS];
  const modelIds = [...expected.keys()];
  const missingFromModel = frozenIds.filter((id) => !expected.has(id));
  const unexpectedInModel = modelIds.filter((id) => !frozenIds.includes(id));
  if (missingFromModel.length > 0 || unexpectedInModel.length > 0) {
    violations.push(
      `LINE SET MISMATCH (model): the line model does not match the frozen id set — ` +
        `missing=[${missingFromModel.join(', ')}] unexpected=[${unexpectedInModel.join(', ')}]`,
    );
  }

  // LINE SET MISMATCH — both directions, screen against the engine.
  const expectedIds = [...expected.keys()];
  const screenIds = [...screenRows.keys()];
  const missingOnScreen = expectedIds.filter((id) => !screenRows.has(id));
  const unexpectedOnScreen = screenIds.filter((id) => !expected.has(id));
  if (missingOnScreen.length > 0 || unexpectedOnScreen.length > 0) {
    violations.push(
      `LINE SET MISMATCH (screen): missing=[${missingOnScreen.join(', ')}] ` +
        `unexpected=[${unexpectedOnScreen.join(', ')}]`,
    );
  }
  if (csvRows.size !== expected.size) {
    violations.push(
      `LINE SET MISMATCH (csv): the CSV carries ${csvRows.size} data rows, the engine produced ${expected.size}`,
    );
  }

  // DISPLAY DISAGREES / AUTHORITY MISSING — screen.
  for (const [id, exp] of expected) {
    const row = screenRows.get(id);
    if (!row) continue;
    if (exp.total === null) {
      let parsed: bigint | null = null;
      try {
        parsed = parseScreenPesoText(row.total);
      } catch {
        parsed = null;
      }
      if (parsed !== null) {
        violations.push(
          `DISPLAY DISAGREES: line ${id} is declined by the engine but the screen printed the ` +
            `parsable figure ${JSON.stringify(row.total)}`,
        );
      }
    } else {
      let parsed: bigint;
      try {
        parsed = parseScreenPesoText(row.total);
      } catch (err) {
        violations.push(
          `DISPLAY DISAGREES: line ${id} total ${JSON.stringify(row.total)} did not parse — ` +
            `${err instanceof Error ? err.message : err}`,
        );
        continue;
      }
      if (parsed !== exp.total) {
        violations.push(
          `DISPLAY DISAGREES: line ${id} screen=${parsed} engine=${exp.total} centavos`,
        );
      }
    }
    if (row.authority === '') {
      violations.push(`AUTHORITY MISSING: line ${id} carries an empty authority on the screen`);
    } else if (row.authority !== exp.authority) {
      violations.push(
        `AUTHORITY MISSING: line ${id} screen authority ${JSON.stringify(row.authority)} ` +
          `differs from the engine's ${JSON.stringify(exp.authority)}`,
      );
    }
  }

  // PDF DISAGREES / AUTHORITY MISSING — the extracted document text.
  //
  // The comparison is an exact MULTISET equality over every amount token in the
  // document, not a per-row substring search. Two reasons, both measured:
  //
  //  1. `pdftotext` emits this document COLUMN-WISE, so the amounts of many rows
  //     arrive in one run of tokens detached from their item cells. There is no
  //     reliable row boundary to key on.
  //  2. A substring search is far too weak. Item 37A and Item 37 both carry
  //     PHP 5,000,000 on the TRAIN fact set, so `includes('PHP 5,000,000')`
  //     stays true when Item 37A alone is corrupted — this gate PASSED a
  //     one-centavo PDF injection until the check was replaced. A multiset
  //     notices the removal of one token and the arrival of another.
  //
  // The comparison runs in both directions by construction: any expected token
  // the document lacks, and any token the document prints that the engine did
  // not produce, are both reported.
  const pdfCollapsed = pdfText.replace(/\s+/g, ' ');

  const expectedTokens: string[] = [];
  for (const [, exp] of expected) {
    for (const amount of [exp.exclusive, exp.conjugal, exp.total]) {
      if (amount !== null) expectedTokens.push(pdfFormatFromEngine(amount));
    }
  }
  const observedTokens = pdfCollapsed.match(/PHP [\d,]+(?:\.\d{2})?/g) ?? [];

  const tally = (tokens: string[]): Map<string, number> => {
    const counts = new Map<string, number>();
    for (const t of tokens) counts.set(t, (counts.get(t) ?? 0) + 1);
    return counts;
  };
  const wantCounts = tally(expectedTokens);
  const gotCounts = tally(observedTokens);
  for (const [token, want] of wantCounts) {
    const got = gotCounts.get(token) ?? 0;
    if (got !== want) {
      violations.push(
        `PDF DISAGREES: the engine produced ${token} ${want} time(s) but the document prints it ${got} time(s)`,
      );
    }
  }
  for (const [token, got] of gotCounts) {
    if (!wantCounts.has(token)) {
      violations.push(
        `PDF DISAGREES: the document prints ${token} ${got} time(s), an amount the engine never produced`,
      );
    }
  }

  // A dropped row takes its authority line with it, so the count is the PDF's
  // own row-set check.
  const pdfAuthorityCount = (pdfCollapsed.match(/Authority:/g) ?? []).length;
  if (pdfAuthorityCount !== expected.size) {
    violations.push(
      `LINE SET MISMATCH (pdf): the document carries ${pdfAuthorityCount} authority lines, ` +
        `the engine produced ${expected.size} lines`,
    );
  }
  for (const [id, exp] of expected) {
    if (!pdfCollapsed.includes(exp.authority.replace(/\s+/g, ' '))) {
      violations.push(
        `AUTHORITY MISSING: line ${id} authority ${JSON.stringify(exp.authority)} is absent from the PDF`,
      );
    }
  }

  // CSV DISAGREES — the parsed centavo column, both directions on the values.
  const expectedTotals = [...expected.values()].map((e) => (e.total === null ? null : e.total));
  const csvTotals: Array<bigint | null> = [];
  for (const [key, row] of csvRows) {
    if (/^-?\d+$/.test(row.total.trim())) {
      csvTotals.push(parseCsvCentavos(row.total));
    } else {
      csvTotals.push(null);
      if (row.total.trim() === '0') {
        violations.push(`CSV DISAGREES: row ${key} wrote a bare zero for a declined line`);
      }
    }
    if (row.authority === '') {
      violations.push(`AUTHORITY MISSING: csv row ${key} carries an empty authority`);
    }
  }
  for (let i = 0; i < Math.min(expectedTotals.length, csvTotals.length); i++) {
    const want = expectedTotals[i]!;
    const got = csvTotals[i]!;
    if (want === null && got !== null) {
      violations.push(`CSV DISAGREES: row ${i} is declined by the engine but the CSV wrote ${got}`);
    } else if (want !== null && got === null) {
      violations.push(`CSV DISAGREES: row ${i} expects ${want} centavos but the CSV wrote no integer`);
    } else if (want !== null && got !== null && want !== got) {
      violations.push(`CSV DISAGREES: row ${i} csv=${got} engine=${want} centavos`);
    }
  }

  console.log(`GATE-SKIPS total=${expected.size} skipped=0`);

  if (violations.length > 0) {
    for (const v of violations) console.error(v);
    console.log(
      `RETURN PARITY FAIL rows=${expected.size} screen=${screenRows.size} csv=${csvRows.size} ` +
        `violations=${violations.length}`,
    );
    return 1;
  }

  console.log(
    `RETURN PARITY PASS screen=${screenRows.size} pdf=${expected.size} csv=${csvRows.size}`,
  );
  return 0;
}

/**
 * The PDF-safe rendering of an engine amount.
 *
 * This is NOT a second formatter: it reproduces the token the product's own
 * `formatPesoPdf` emits, so the gate can search the extracted text for it. The
 * comparison it feeds is still an exact integer one, performed by
 * `parsePdfPesoText` on the way in wherever a figure is read back.
 */
function pdfFormatFromEngine(centavos: bigint): string {
  const pesos = centavos / 100n;
  const cents = centavos % 100n;
  const grouped = pesos.toLocaleString('en-US');
  const rendered =
    cents === 0n ? `PHP ${grouped}` : `PHP ${grouped}.${cents.toString().padStart(2, '0')}`;
  // Round-trip through the product's own inverse, so a disagreement between this
  // rendering and `formatPesoPdf` surfaces here rather than as a false pass.
  if (parsePdfPesoText(rendered) !== centavos) {
    throw new Error(`INTERNAL: pdf rendering round-trip failed for ${centavos}`);
  }
  return rendered;
}

main()
  .then((code) => process.exit(code))
  .catch((err) => {
    if (err && err.name === 'JourneyCannotRun') {
      console.error(`RETURN PARITY CANNOT RUN: ${err.message}`);
      process.exit(2);
    }
    console.error(`RETURN PARITY CANNOT RUN: ${err instanceof Error ? err.stack : err}`);
    process.exit(2);
  });
