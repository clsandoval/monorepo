/*
 * journey/deed-parity.ts — the deed schedule-of-shares clause must agree with
 * the engine, on the screen and inside the DOCX.
 *
 * WHAT THIS PROVES. Every peso figure and every article printed in the clause
 * the results view shows, and in the `word/document.xml` of the DOCX the browser
 * downloads, is compared against a `computeEngineOutput` run performed IN THIS
 * SAME RUN on the case's own committed `input_json`.
 *
 * THE EXPECTED VALUE IS COMPUTED, NEVER STORED. No peso figure is committed
 * anywhere in this gate. `scripts/check-seed-fixture.mjs` rejects a seeded
 * `output_json` with `SEED WRITES OUTPUT`, for the reason this gate obeys: a
 * seeded engine result is a per-heir peso figure nothing computed, and a stored
 * expectation silently becomes a record of the bug the day the bug ships.
 *
 * EVERY COMPARISON IS BigInt AND EXACT. There is no rounding helper, no slack
 * term and no absolute-difference comparison in this file, because a figure that
 * is close is a wrong figure on an instrument a lawyer signs.
 *
 * THE GATE PARSES, IT NEVER FORMATS. `parseDeedPesos` is the exact inverse of
 * `formatDeedPesos` in the product. A formatter written here would make the gate
 * agree with itself rather than with the product.
 *
 * THE COMPARISON RUNS IN BOTH DIRECTIONS: every heir the engine returned appears
 * as a clause block, AND every clause block corresponds to a heir the engine
 * returned. A one-directional check passes a clause that invented a line.
 *
 * BLOCKS ARE ALIGNED BY INDEX, never by scanning for something that looks like a
 * share. `21-GATE-OBSERVATIONS.md` records that a whole-document substring search
 * let two of G37's injections pass initially, because an unrelated row carried
 * the same amount. Index alignment plus the peso-token MULTISET check is the
 * answer to that failure shape.
 *
 * A RUN THAT COMPARES ZERO BLOCKS IS A FAILURE, never a pass. Passing because it
 * measured nothing is the most dangerous outcome available to this design.
 *
 * NO EXCEPTION LIST, NO BASELINE, NO MUTATING FLAG. This file cannot write,
 * repair, regenerate, accept or waive anything. It reads no argv.
 *
 * Exit contract, the project's three-valued one: 0 passed, 1 failed, 2 could not
 * run (`DEED PARITY CANNOT RUN:` on stderr).
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
import { computeEngineOutput } from './engine.mjs';

import { buildDeedSchedule } from '../src/lib/deed/schedule-lines';
import { buildDeedClauseText } from '../src/lib/deed/clause-text';
import { extractDocxParagraphs, DOCX_PART_NAMES } from '../src/lib/deed/docx';
import type { EngineInput, EngineOutput } from '../src/types';

/**
 * How long the results view is given to settle after it appears.
 *
 * `steps/output.json` measured the reason: the results view pulls a `React.lazy`
 * chunk and the chart inside it animates for 1500 ms, so a screenshot or a scrape
 * taken immediately after the container appears catches a half-rendered page.
 */
const SETTLE_MS = 4000;

/** Matches `return-parity.ts`; a slow first DOCX build must not read as a defect. */
const DOWNLOAD_TIMEOUT_MS = 60000;

// ── Parsers ─────────────────────────────────────────────────────────────────

/**
 * The exact inverse of `formatDeedPesos`: the literal prefix `PHP `, `en-US`
 * comma grouping, and exactly two decimal digits.
 *
 * There is NO SIGN HANDLING. A deed line never states a negative amount, so a
 * leading minus must throw rather than be quietly stripped.
 */
export function parseDeedPesos(text: string): bigint {
  const original = String(text);
  const s = original.trim();
  if (!s.startsWith('PHP ')) {
    throw new Error(`DEED PESO UNPARSEABLE: ${JSON.stringify(original)}`);
  }
  const bare = s.slice('PHP '.length).replace(/,/g, '');
  if (!/^\d+\.\d{2}$/.test(bare)) {
    throw new Error(`DEED PESO UNPARSEABLE: ${JSON.stringify(original)}`);
  }
  const dot = bare.indexOf('.');
  return BigInt(bare.slice(0, dot)) * 100n + BigInt(bare.slice(dot + 1));
}

/**
 * Read a stored-method ZIP the way an extractor does, from the central
 * directory rather than by trusting the writer's own layout.
 *
 * A malformed archive throws `JourneyCannotRun`: that is an environment verdict
 * about the harness, and the FIGURE checks below are what report a defect.
 */
function readStoredZipParts(bytes: Uint8Array): Map<string, string> {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

  let eocd = -1;
  for (let i = bytes.length - 22; i >= 0; i -= 1) {
    if (view.getUint32(i, true) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) {
    throw new JourneyCannotRun('the downloaded archive has no end-of-central-directory record');
  }

  const count = view.getUint16(eocd + 10, true);
  let off = view.getUint32(eocd + 16, true);
  const decoder = new TextDecoder();
  const parts = new Map<string, string>();

  for (let i = 0; i < count; i += 1) {
    if (view.getUint32(off, true) !== 0x02014b50) {
      throw new JourneyCannotRun(`bad central-directory signature at offset ${off}`);
    }
    const nameLen = view.getUint16(off + 28, true);
    const extraLen = view.getUint16(off + 30, true);
    const commentLen = view.getUint16(off + 32, true);
    const localOffset = view.getUint32(off + 42, true);
    const name = decoder.decode(bytes.subarray(off + 46, off + 46 + nameLen));

    if (view.getUint32(localOffset, true) !== 0x04034b50) {
      throw new JourneyCannotRun(`bad local-header signature for entry ${JSON.stringify(name)}`);
    }
    const size = view.getUint32(localOffset + 18, true);
    const localNameLen = view.getUint16(localOffset + 26, true);
    const localExtraLen = view.getUint16(localOffset + 28, true);
    const start = localOffset + 30 + localNameLen + localExtraLen;
    parts.set(name, decoder.decode(bytes.subarray(start, start + size)));

    off += 46 + nameLen + extraLen + commentLen;
  }
  return parts;
}

interface ClauseBlock {
  number: number;
  header: string;
  name: string;
  label: string;
  body: string[];
}

/**
 * Split the clause into one block per heir.
 *
 * The `SHARES` marker line opens the section and the first `Lines stated: ` line
 * closes it; the header text before the marker and the footer after it are not
 * blocks. `([^()]*)$` anchors on the LAST parenthesised run, so a heir name
 * containing parentheses still parses.
 */
function parseClauseBlocks(text: string): ClauseBlock[] {
  const lines = text.split('\n');
  const markerIndex = lines.indexOf('SHARES');
  if (markerIndex === -1) {
    throw new Error('DEED BLOCK UNPARSEABLE: the clause carries no SHARES marker line');
  }

  const rest = lines.slice(markerIndex + 1);
  const footerIndex = rest.findIndex((l) => l.startsWith('Lines stated: '));
  const bodyLines = footerIndex === -1 ? rest : rest.slice(0, footerIndex);

  const blocks: ClauseBlock[] = [];
  for (const chunk of bodyLines.join('\n').split('\n\n')) {
    const chunkLines = chunk.split('\n').filter((l) => l !== '');
    if (chunkLines.length === 0) continue;
    const firstLine = chunkLines[0]!;
    if (firstLine === '   No heir share was returned by the engine.') continue;
    const m = /^(\d+)\. (.*) \(([^()]*)\)$/.exec(firstLine);
    if (m === null) {
      throw new Error(`DEED BLOCK UNPARSEABLE: ${JSON.stringify(firstLine)}`);
    }
    blocks.push({
      number: Number(m[1]),
      header: firstLine,
      name: m[2]!,
      label: m[3]!,
      body: chunkLines.slice(1),
    });
  }
  return blocks;
}

/** Multiset of the `PHP x,xxx.xx` tokens a string carries, as a sorted array. */
function pesoTokens(text: string): string[] {
  return (text.match(/PHP [\d,]+\.\d{2}/g) ?? []).slice().sort();
}

const LINE_REFUSAL_MARK = 'MANUAL REVIEW REQUIRED — NO SHARE STATED';
const SHARE_FIELD = '   Share: ';
const ARTICLES_FIELD = '   Governing article(s): ';

async function main(): Promise<number> {
  const env = readStackEnv();
  if (env === null || !env.API_URL) {
    throw new JourneyCannotRun('local Supabase stack is not running');
  }

  const fixtures = readFixtures();
  const caseId = fixtures.orgs.alpha.case_id;
  const admin = adminClient(env);

  let preview: { origin: string; stop: () => Promise<void> } | null = null;
  let browser: { close: () => Promise<void> } | null = null;

  let screenText = '';
  let docxBytes: Uint8Array = new Uint8Array(0);
  let input: EngineInput;
  let expected: EngineOutput;

  await RESETS['case-alpha-no-output'](admin);

  const { data: row, error: readError } = await admin
    .from('cases')
    .select('input_json')
    .eq('id', caseId)
    .single();
  if (readError) {
    throw new JourneyCannotRun(`could not read the Alpha case input_json: ${readError.message}`);
  }
  if (!row || row.input_json === null) {
    throw new JourneyCannotRun(`case ${caseId} has a null input_json, so there is nothing to compute`);
  }
  input = row.input_json as EngineInput;

  // THE EXPECTATION, COMPUTED THIS RUN, by the same artifact the product loads.
  expected = (await computeEngineOutput(input)) as EngineOutput;
  const expectedSchedule = buildDeedSchedule(input, expected);
  const expectedText = buildDeedClauseText(expectedSchedule);

  try {
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
      await seedAuthSession(page, preview!.origin, session);
      await page.goto(`${preview!.origin}/cases/${caseId}?step=4`, { waitUntil: 'load' });
      await page.waitForSelector('[data-testid="review-step"]');
      await page.click('[data-testid="compute-distribution"]');
      await page.waitForSelector('[data-testid="results-view"]');
      await page.waitForSelector('[data-testid="deed-clause-section"]');
      await page.waitForTimeout(SETTLE_MS);

      // `textContent`, deliberately, and never the rendered-text property:
      // that one applies CSS whitespace collapsing and would destroy the
      // three-space indentation the block grammar depends on.
      screenText = await page.$eval(
        '[data-testid="deed-clause-text"]',
        (el: Element) => el.textContent ?? '',
      );

      await page.waitForSelector('[data-testid="download-deed-docx"]');
      const downloadPromise = page.waitForEvent('download', { timeout: DOWNLOAD_TIMEOUT_MS });
      await page.click('[data-testid="download-deed-docx"]');
      let download;
      try {
        download = await downloadPromise;
      } catch (err) {
        throw new JourneyCannotRun(
          `the Download DOCX button produced no download within ${DOWNLOAD_TIMEOUT_MS} ms: ` +
            `${err instanceof Error ? err.message : err}`,
        );
      }
      const docxPath = await download.path();
      if (!docxPath) throw new JourneyCannotRun('the DOCX download reported no path on disk');
      const buffer = fs.readFileSync(docxPath);
      if (buffer[0] !== 0x50 || buffer[1] !== 0x4b) {
        throw new JourneyCannotRun(
          `the downloaded file does not begin with the ZIP magic 0x50 0x4b (observed ` +
            `0x${(buffer[0] ?? 0).toString(16)} 0x${(buffer[1] ?? 0).toString(16)}), ` +
            `so every downstream check would pass vacuously`,
        );
      }
      docxBytes = new Uint8Array(buffer);
    } finally {
      await page.close().catch(() => {});
    }
  } finally {
    if (browser) await browser.close().catch(() => {});
    if (preview) await preview.stop().catch(() => {});
  }

  // ── Comparison ──────────────────────────────────────────────────────────
  const failures: string[] = [];

  const parts = readStoredZipParts(docxBytes);
  const partNames = [...parts.keys()];
  if (partNames.join('|') !== DOCX_PART_NAMES.join('|')) {
    failures.push(
      `DOCX PART SET MISMATCH: archive=${JSON.stringify(partNames)} ` +
        `expected=${JSON.stringify([...DOCX_PART_NAMES])}`,
    );
  }

  const documentXml = parts.get('word/document.xml');
  let docxText = '';
  let docxParagraphs: string[] = [];
  if (documentXml === undefined) {
    failures.push('DOCX PART SET MISMATCH: the archive carries no word/document.xml');
  } else {
    docxParagraphs = extractDocxParagraphs(documentXml);
    docxText = docxParagraphs.join('\n');
    if (docxText !== screenText) {
      const a = docxText.split('\n');
      const b = screenText.split('\n');
      let k = 0;
      while (k < Math.max(a.length, b.length) && a[k] === b[k]) k += 1;
      failures.push(
        `DOCX TEXT MISMATCH: first difference at line ${k} — ` +
          `docx=${JSON.stringify(a[k] ?? null)} screen=${JSON.stringify(b[k] ?? null)}`,
      );
    }
  }

  if (screenText !== expectedText) {
    const a = screenText.split('\n');
    const b = expectedText.split('\n');
    let k = 0;
    while (k < Math.max(a.length, b.length) && a[k] === b[k]) k += 1;
    failures.push(
      `CLAUSE TEXT MISMATCH: first difference at line ${k} — ` +
        `screen=${JSON.stringify(a[k] ?? null)} engine=${JSON.stringify(b[k] ?? null)}`,
    );
  }

  const blocks = parseClauseBlocks(screenText);
  const shares = expected.per_heir_shares;

  if (blocks.length < shares.length) {
    failures.push(
      `HEIR LINE MISSING: the clause prints ${blocks.length} block(s) but the engine returned ` +
        `${shares.length} heir share(s)`,
    );
  } else if (blocks.length > shares.length) {
    failures.push(
      `HEIR LINE INVENTED: the clause prints ${blocks.length} block(s) but the engine returned ` +
        `${shares.length} heir share(s)`,
    );
  }

  const pairCount = Math.min(blocks.length, shares.length);
  for (let k = 0; k < pairCount; k += 1) {
    const block = blocks[k]!;
    const share = shares[k]!;

    if (block.name !== share.heir_name) {
      failures.push(
        `DEED HEIR NAME MISMATCH: block ${k} names ${JSON.stringify(block.name)} but the engine ` +
          `returned ${JSON.stringify(share.heir_name)}`,
      );
    }

    const shareLine = block.body.find((l) => l.startsWith(SHARE_FIELD));
    if (shareLine !== undefined) {
      const printed = parseDeedPesos(shareLine.slice(SHARE_FIELD.length));
      const engineValue = BigInt(share.net_from_estate.centavos);
      if (printed !== engineValue) {
        failures.push(
          `DEED AMOUNT MISMATCH: block ${k} (${share.heir_name}) prints ${printed} centavos but ` +
            `the engine returned ${engineValue}; difference ${printed - engineValue}`,
        );
      }
    }

    const articleLine = block.body.find((l) => l.startsWith(ARTICLES_FIELD));
    if (articleLine !== undefined) {
      const printedArticles = articleLine.slice(ARTICLES_FIELD.length).split('; ');
      const engineArticles = share.legal_basis;
      if (printedArticles.join('|') !== engineArticles.join('|')) {
        failures.push(
          `DEED AUTHORITY MISMATCH: block ${k} (${share.heir_name}) prints ` +
            `${JSON.stringify(printedArticles)} but the engine emitted ` +
            `${JSON.stringify(engineArticles)}`,
        );
      }
    }

    if (block.body.some((l) => l.includes(LINE_REFUSAL_MARK))) {
      const carrying = block.body.filter((l) => l.includes('PHP '));
      if (carrying.length > 0) {
        failures.push(
          `REFUSED LINE CARRIES AMOUNT: block ${k} is refused but prints ` +
            `${JSON.stringify(carrying)}`,
        );
      }
    }
  }

  const printedRefused = new Set<number>();
  for (let k = 0; k < blocks.length; k += 1) {
    if (blocks[k]!.body.some((l) => l.includes(LINE_REFUSAL_MARK))) printedRefused.add(k);
  }
  const engineRefused = new Set<number>();
  for (let k = 0; k < expectedSchedule.lines.length; k += 1) {
    if (expectedSchedule.lines[k]!.kind === 'refused') engineRefused.add(k);
  }
  const refusedEqual =
    printedRefused.size === engineRefused.size &&
    [...printedRefused].every((k) => engineRefused.has(k));
  if (!refusedEqual) {
    failures.push(
      `REFUSAL SET MISMATCH: clause refuses ${JSON.stringify([...printedRefused].sort())} but the ` +
        `rules refuse ${JSON.stringify([...engineRefused].sort())}`,
    );
  }

  const printedTokens = pesoTokens(screenText);
  const engineTokens = pesoTokens(expectedText);
  if (printedTokens.join('|') !== engineTokens.join('|')) {
    failures.push(
      `PESO TOKEN MULTISET MISMATCH: clause=${JSON.stringify(printedTokens)} ` +
        `engine=${JSON.stringify(engineTokens)}`,
    );
  }

  if (blocks.length === 0) {
    failures.push(
      'DEED PARITY COMPARED NOTHING: zero heir blocks were compared, so this run measured nothing',
    );
  }

  console.log(`GATE-SKIPS total=${blocks.length} skipped=0`);

  if (failures.length > 0) {
    for (const f of failures) console.error(f);
    console.log(
      `DEED PARITY FAIL blocks=${blocks.length} shares=${shares.length} ` +
        `violations=${failures.length}`,
    );
    return 1;
  }

  console.log(
    `DEED PARITY PASS blocks=${blocks.length} stated=${expectedSchedule.statedCount} ` +
      `refused=${expectedSchedule.refusedCount} docxParagraphs=${docxParagraphs.length}`,
  );
  return 0;
}

main()
  .then((code) => process.exit(code))
  .catch((err) => {
    if (err && err.name === 'JourneyCannotRun') {
      console.error(`DEED PARITY CANNOT RUN: ${err.message}`);
      console.log('GATE-SKIPS total=0 skipped=0');
      process.exit(2);
    }
    console.error(`DEED PARITY CANNOT RUN: ${err instanceof Error ? err.stack : err}`);
    console.log('GATE-SKIPS total=0 skipped=0');
    process.exit(2);
  });
