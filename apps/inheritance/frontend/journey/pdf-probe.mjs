/*
 * journey/pdf-probe.mjs — gate G22. Proves the PDF-reading seam still works.
 *
 * Modelled on journey/selftest.mjs: seven named checks, every one evaluated even
 * after an earlier one fails, because a check that stops at its first failure
 * tells you one thing when it could have told you seven.
 *
 * The document under test is GENERATED AT RUN TIME with @react-pdf/renderer and
 * React.createElement — no JSX, because a .mjs file is not transformed by Vite.
 * No binary fixture is committed, so nothing can go stale against the renderer.
 *
 * Boundary, deliberate: no Docker, no Supabase, no browser, no application build.
 * A toolchain problem is therefore reported in seconds rather than after a
 * four-minute gate run.
 *
 * Two of the seven checks exist because of a defect measured live during
 * planning (13-RESEARCH.md section 2): the peso sign U+20B1 is unrepresentable in
 * the PDF's non-embedded WinAnsi base-14 fonts, is written as the byte 0xB1,
 * extracts as U+00B1, and splits the figure across lines. PROBE TEXT CONTIGUOUS
 * and PROBE NO CORRUPT GLYPH are what make that defect detectable rather than
 * merely described.
 *
 * Exit contract:
 *   0 — every check passed
 *   1 — a check failed; each failing check is named on stdout
 *   2 — could not run: the PDF toolchain is missing
 */

import crypto from 'node:crypto';

import React from 'react';
import { pdf, Document, Page, View, Text } from '@react-pdf/renderer';

import { extractPdfText, pdfPageInfo, rasterizePdfPages, PDF_MARKERS } from './pdf.mjs';

const e = React.createElement;

/** The four literal strings page one carries. */
const PAGE_ONE_STRINGS = [
  'Estate of Probe Decedent',
  'Distribution of Shares',
  'PHP 1,234,567.89',
  'Art. 996: Probe citation',
];

/** The single literal string page two carries. */
const PAGE_TWO_STRING = 'Probe page two';

/** The amount whose contiguity under text extraction is the point of the probe. */
const CONTIGUOUS_AMOUNT = 'PHP 1,234,567.89';

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function buildProbeDocument() {
  return e(
    Document,
    null,
    e(
      Page,
      { size: 'A4' },
      e(
        View,
        null,
        ...PAGE_ONE_STRINGS.map((s, i) => e(Text, { key: `p1-${i}` }, s)),
      ),
    ),
    e(Page, { size: 'A4' }, e(View, null, e(Text, null, PAGE_TWO_STRING))),
  );
}

/**
 * @react-pdf/renderer's toBuffer() resolves to a Buffer in some environments and
 * to a readable stream in others. Accept both.
 */
async function toBuffer(instance) {
  const out = await instance.toBuffer();
  if (Buffer.isBuffer(out)) return out;
  const chunks = [];
  for await (const chunk of out) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks);
}

function sha256(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

function isToolchainMissing(err) {
  return Boolean(err && err.message && err.message.startsWith(PDF_MARKERS.TOOLCHAIN_MISSING));
}

async function main() {
  const failures = [];
  const CHECK_COUNT = 7;
  let pages = 0;

  const record = (name, message) => failures.push([name, message]);

  const buf = await toBuffer(pdf(buildProbeDocument()));

  // 1. PROBE PDF BYTES
  const magic = buf.subarray(0, 5).toString('latin1');
  if (magic !== '%PDF-' || buf.length <= 1000) {
    record(
      'PROBE PDF BYTES',
      `expected a buffer starting with "%PDF-" and longer than 1000 bytes; observed magic ` +
        `"${magic}" and length ${buf.length}`,
    );
  }

  // Each reader is invoked exactly once and its result reused, so a toolchain
  // failure surfaces once rather than seven times.
  let text = null;
  let textErr = null;
  try {
    text = extractPdfText(buf);
  } catch (err) {
    if (isToolchainMissing(err)) {
      console.error(`PDF PROBE CANNOT RUN: ${err.message}`);
      console.log(`GATE-SKIPS total=${CHECK_COUNT} skipped=${CHECK_COUNT}`);
      process.exit(2);
    }
    textErr = err;
  }

  // 2. PROBE TEXT
  if (textErr) {
    record('PROBE TEXT', `extractPdfText threw: ${textErr.message}`);
  } else {
    const missing = [...PAGE_ONE_STRINGS, PAGE_TWO_STRING].filter((s) => !text.includes(s));
    if (missing.length > 0) {
      record(
        'PROBE TEXT',
        `expected the extracted text to contain all five probe strings; missing: ` +
          `${missing.map((s) => JSON.stringify(s)).join(', ')}`,
      );
    }
  }

  // 3. PROBE TEXT CONTIGUOUS
  if (textErr) {
    record('PROBE TEXT CONTIGUOUS', `extractPdfText threw: ${textErr.message}`);
  } else if (!text.includes(CONTIGUOUS_AMOUNT)) {
    record(
      'PROBE TEXT CONTIGUOUS',
      `expected ${JSON.stringify(CONTIGUOUS_AMOUNT)} to survive extraction as one ` +
        `uninterrupted substring; it did not. This is the failure mode 13-RESEARCH.md ` +
        `section 2.4 measured, where an unrepresentable currency mark splits the figure ` +
        `onto its own line.`,
    );
  }

  // 4. PROBE NO CORRUPT GLYPH
  if (textErr) {
    record('PROBE NO CORRUPT GLYPH', `extractPdfText threw: ${textErr.message}`);
  } else {
    const found = ['±', '₱'].filter((c) => text.includes(c));
    if (found.length > 0) {
      record(
        'PROBE NO CORRUPT GLYPH',
        `expected the extracted text to contain neither U+00B1 nor U+20B1; observed ` +
          `${found.map((c) => `U+${c.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')}`).join(' and ')}`,
      );
    }
  }

  // 5. PROBE PAGE INFO
  try {
    const info = pdfPageInfo(buf);
    pages = info.pages;
    const w = Math.round(info.widthPt);
    const h = Math.round(info.heightPt);
    if (info.pages !== 2 || w !== 595 || h !== 842) {
      record(
        'PROBE PAGE INFO',
        `expected pages=2 widthPt~595 heightPt~842 (A4); observed pages=${info.pages} ` +
          `widthPt=${info.widthPt} heightPt=${info.heightPt}`,
      );
    }
  } catch (err) {
    if (isToolchainMissing(err)) {
      console.error(`PDF PROBE CANNOT RUN: ${err.message}`);
      console.log(`GATE-SKIPS total=${CHECK_COUNT} skipped=${CHECK_COUNT}`);
      process.exit(2);
    }
    record('PROBE PAGE INFO', `pdfPageInfo threw: ${err.message}`);
  }

  // 6. PROBE RASTER COUNT and 7. PROBE RASTER DETERMINISTIC
  let firstRun = null;
  try {
    firstRun = rasterizePdfPages(buf, 100);
    const bad = firstRun
      .map((png, i) => [i, png])
      .filter(([, png]) => !png.subarray(0, 8).equals(PNG_SIGNATURE));
    if (firstRun.length !== 2 || bad.length > 0) {
      record(
        'PROBE RASTER COUNT',
        `expected exactly 2 buffers each starting with the 8-byte PNG signature; observed ` +
          `${firstRun.length} buffer(s), ${bad.length} without a PNG signature`,
      );
    }
  } catch (err) {
    if (isToolchainMissing(err)) {
      console.error(`PDF PROBE CANNOT RUN: ${err.message}`);
      console.log(`GATE-SKIPS total=${CHECK_COUNT} skipped=${CHECK_COUNT}`);
      process.exit(2);
    }
    record('PROBE RASTER COUNT', `rasterizePdfPages threw: ${err.message}`);
  }

  if (firstRun === null) {
    record('PROBE RASTER DETERMINISTIC', 'the first rasterisation did not produce any pages');
  } else {
    try {
      const secondRun = rasterizePdfPages(buf, 100);
      const a = firstRun.map(sha256);
      const b = secondRun.map(sha256);
      const mismatched = a
        .map((digest, i) => [i, digest, b[i]])
        .filter(([, first, second]) => first !== second);
      if (a.length !== b.length || mismatched.length > 0) {
        record(
          'PROBE RASTER DETERMINISTIC',
          `expected two rasterisations of the same document to be byte-identical page for ` +
            `page; observed ${a.length} vs ${b.length} pages and ${mismatched.length} ` +
            `differing digest(s)${
              mismatched.length
                ? `: ${mismatched.map(([i, f, s]) => `page ${i + 1} ${f.slice(0, 12)} != ${String(s).slice(0, 12)}`).join('; ')}`
                : ''
            }`,
        );
      }
    } catch (err) {
      record('PROBE RASTER DETERMINISTIC', `the second rasterisation threw: ${err.message}`);
    }
  }

  for (const [name, message] of failures) {
    console.log(`${name} — ${message}`);
  }
  // Printed on BOTH paths — gate G8 reads this line from the gate's log
  // regardless of outcome, and treats a missing line as a failure.
  console.log(`GATE-SKIPS total=${CHECK_COUNT} skipped=0`);

  if (failures.length === 0) {
    console.log(`PDF PROBE PASS checks=${CHECK_COUNT} pages=${pages}`);
    process.exit(0);
  }
  console.log(`PDF PROBE FAIL checks=${CHECK_COUNT} failed=${failures.length}`);
  process.exit(1);
}

main().catch((err) => {
  const message = err && err.message ? err.message : String(err);
  if (message.startsWith(PDF_MARKERS.TOOLCHAIN_MISSING)) {
    console.error(`PDF PROBE CANNOT RUN: ${message}`);
    console.log('GATE-SKIPS total=7 skipped=7');
    process.exit(2);
  }
  console.log(`PROBE HARNESS — ${message}`);
  console.log('GATE-SKIPS total=7 skipped=0');
  console.log('PDF PROBE FAIL checks=7 failed=1');
  process.exit(1);
});
