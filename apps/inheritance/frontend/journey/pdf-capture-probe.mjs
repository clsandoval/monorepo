/*
 * journey/pdf-capture-probe.mjs — the on-demand proof that captureExportedPdf
 * returns real PDF bytes for a real case.
 *
 * Deliberately NOT registered as a gate, the same way journey/seed-smoke.mjs
 * proves the seeding seam without being registered. The gates that consume
 * captureExportedPdf are 13-05's structure check (G23) and 13-06's visual
 * check (G24); this probe exists so a capture problem can be diagnosed without
 * running either of them.
 *
 * CAPTURE FIXED DATE is the check that proves the clock fix took effect.
 * Without it, plan 13-06's zero-tolerance page reference would silently expire
 * one day after it was approved.
 *
 * Exit contract, the project's three-valued one:
 *   0 — every check passed
 *   1 — a check failed; each failing check is named on stdout
 *   2 — could not run (PDF CAPTURE CANNOT RUN: on stderr)
 */

import { JourneyCannotRun } from './serve.mjs';
import { captureExportedPdf, PDF_FIXED_CLOCK } from './pdf-capture.mjs';
import { extractPdfText, pdfPageInfo, PDF_MARKERS } from './pdf.mjs';

const TOTAL_CHECKS = 4;

/** `2026-06-15T00:00:00Z` -> `2026-06-15`, the form CaseSummarySection prints. */
const FIXED_DATE = PDF_FIXED_CLOCK.slice(0, 10);

function cannotRun(reason) {
  console.error(`PDF CAPTURE CANNOT RUN: ${reason}`);
  console.log(`GATE-SKIPS total=${TOTAL_CHECKS} skipped=${TOTAL_CHECKS}`);
  process.exit(2);
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

  const { pdfBuffer } = captured;
  const failures = [];
  let pages = 0;

  // 1. CAPTURE BYTES
  const magic = pdfBuffer.subarray(0, 5).toString('latin1');
  if (magic !== '%PDF-' || pdfBuffer.length <= 1000) {
    failures.push(
      `CAPTURE BYTES — expected a buffer beginning "%PDF-" and longer than 1000 bytes; ` +
        `observed magic ${JSON.stringify(magic)} and length ${pdfBuffer.length}`,
    );
  }

  // 2. CAPTURE PAGES
  try {
    const info = pdfPageInfo(pdfBuffer);
    pages = info.pages;
    const w = Math.round(info.widthPt);
    const h = Math.round(info.heightPt);
    if (info.pages < 1 || w !== 595 || h !== 842) {
      failures.push(
        `CAPTURE PAGES — expected at least 1 page at A4 (595 x 842 pts); observed ` +
          `pages=${info.pages} widthPt=${info.widthPt} heightPt=${info.heightPt}`,
      );
    }
  } catch (err) {
    if (err && err.message && err.message.startsWith(PDF_MARKERS.TOOLCHAIN_MISSING)) {
      cannotRun(err.message);
    }
    failures.push(`CAPTURE PAGES — pdfPageInfo threw: ${err && err.message ? err.message : err}`);
  }

  // 3 and 4 share one extraction.
  let text = null;
  let textErr = null;
  try {
    text = extractPdfText(pdfBuffer);
  } catch (err) {
    if (err && err.message && err.message.startsWith(PDF_MARKERS.TOOLCHAIN_MISSING)) {
      cannotRun(err.message);
    }
    textErr = err;
  }

  // 3. CAPTURE TEXT
  if (textErr) {
    failures.push(`CAPTURE TEXT — extractPdfText threw: ${textErr.message}`);
  } else {
    const wanted = ['Estate of Pedro', 'Distribution of Shares'];
    const missing = wanted.filter((s) => !text.includes(s));
    if (missing.length > 0) {
      failures.push(
        `CAPTURE TEXT — expected the extracted text to contain ` +
          `${wanted.map((s) => JSON.stringify(s)).join(' and ')}; missing ` +
          `${missing.map((s) => JSON.stringify(s)).join(', ')}`,
      );
    }
  }

  // 4. CAPTURE FIXED DATE
  const wantedDateLine = `Report Generated: ${FIXED_DATE}`;
  if (textErr) {
    failures.push(`CAPTURE FIXED DATE — extractPdfText threw: ${textErr.message}`);
  } else if (!text.includes(wantedDateLine)) {
    const observed = (text.match(/Report Generated:.*/) || ['(no "Report Generated:" line)'])[0];
    failures.push(
      `CAPTURE FIXED DATE — expected ${JSON.stringify(wantedDateLine)} because the page clock ` +
        `is pinned to ${PDF_FIXED_CLOCK}; observed ${JSON.stringify(observed)}`,
    );
  }

  for (const line of failures) console.log(line);
  // Printed on BOTH paths.
  console.log(`GATE-SKIPS total=${TOTAL_CHECKS} skipped=0`);

  if (failures.length === 0) {
    console.log(`PDF CAPTURE PASS bytes=${pdfBuffer.length} pages=${pages}`);
    process.exit(0);
  }
  console.log(`PDF CAPTURE FAIL checks=${TOTAL_CHECKS} failed=${failures.length}`);
  process.exit(1);
}

main().catch((err) => {
  console.log(`CAPTURE HARNESS — ${err && err.stack ? err.stack : err}`);
  console.log(`GATE-SKIPS total=${TOTAL_CHECKS} skipped=0`);
  console.log(`PDF CAPTURE FAIL checks=${TOTAL_CHECKS} failed=1`);
  process.exit(1);
});
