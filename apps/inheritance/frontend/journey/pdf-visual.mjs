/*
 * journey/pdf-visual.mjs — gate G24. Every page of the generated PDF, diffed
 * pixel for pixel against an approved reference image (PDF-04).
 *
 * THIS FILE NEVER WRITES INTO journey/pdf-references/. There is no flag, no
 * environment variable and no argument that makes it. Only
 * journey/pdf-approve.mjs writes there, and no gate invokes that command. The
 * separation is the whole point: a gate that could approve its own reference
 * would turn any failure green by rewriting its own expectation, and nobody
 * would ever see the change. Approval has to be a deliberate, separately
 * invoked act whose result lands in git as a reviewable diff.
 *
 * THE PAGE COUNT IS CHECKED FIRST, BEFORE ANY PIXEL COMPARISON. A page that
 * appears or disappears is a structural change to the document. Reporting it as
 * a pile of per-page diffs — page 2 now looks like page 3, page 3 like page 4,
 * and a missing reference at the end — would bury the one fact that matters.
 *
 * THE RASTERISATION PARAMETERS ARE PART OF THE REFERENCE CONTRACT: pdftoppm
 * -png at 100 dots per inch, through rasterizePdfPages in journey/pdf.mjs.
 * Changing either invalidates every approved image, exactly as
 * journey/browser.mjs states for its viewport.
 *
 * Nothing about the comparison is rebuilt here. compareToReference in
 * journey/diff.mjs already takes referencesDir as its third parameter, writes
 * nothing anywhere, and returns the five markers Phase 10 froze.
 *
 * Exit contract, the project's three-valued one: 0 passed, 1 failed, 2 could not
 * run (`PDF VISUAL CANNOT RUN:` on stderr). A MISSING REFERENCE IS EXIT 1, NOT
 * EXIT 2 — an unapproved page is a real failure, not an environment problem.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { JourneyCannotRun } from './serve.mjs';
import { captureExportedPdf } from './pdf-capture.mjs';
import { rasterizePdfPages, PDF_MARKERS } from './pdf.mjs';
import { compareToReference } from './diff.mjs';
import { ARTIFACT_ROOT, newRunStamp, writeStepArtifacts } from './artifacts.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));

/** Read-only. This module has no write path into this directory. */
const REFERENCES_DIR = path.join(HERE, 'pdf-references');

/** Part of the reference contract. Changing this invalidates every image. */
const RASTER_DPI = 100;

function cannotRun(reason) {
  console.error(`PDF VISUAL CANNOT RUN: ${reason}`);
  console.log('GATE-SKIPS total=0 skipped=0');
  process.exit(2);
}

/** How many `page-<n>.png` files the approved reference set holds. */
function approvedPageCount() {
  if (!fs.existsSync(REFERENCES_DIR)) return 0;
  return fs.readdirSync(REFERENCES_DIR).filter((name) => /^page-\d+\.png$/.test(name)).length;
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

  let pages;
  try {
    pages = rasterizePdfPages(captured.pdfBuffer, RASTER_DPI);
  } catch (err) {
    if (err && err.message && err.message.startsWith(PDF_MARKERS.TOOLCHAIN_MISSING)) {
      cannotRun(err.message);
    }
    cannotRun(`the captured document could not be rasterised: ${err.message}`);
  }

  // Durable, inspectable copy of every page, and the source pdf-approve.mjs
  // promotes from. Everything written here is under .journey-runs/.
  const runStamp = newRunStamp();
  const runPdfDir = path.join(ARTIFACT_ROOT, runStamp, 'pdf');
  fs.mkdirSync(runPdfDir, { recursive: true });
  pages.forEach((png, i) => {
    fs.writeFileSync(path.join(runPdfDir, `page-${i + 1}.png`), png);
  });

  const approved = approvedPageCount();

  // ---- page count first ----
  if (pages.length !== approved) {
    console.error(
      `PDF PAGE COUNT — the document rasterised to ${pages.length} page(s) but the approved ` +
        `reference set holds ${approved}. No pixel comparison was attempted; a page appearing or ` +
        `disappearing is a structural change. Page images for this run: ${runPdfDir}`,
    );
    console.log(`GATE-SKIPS total=${pages.length} skipped=0`);
    console.error(`PDF VISUAL FAIL pages=${pages.length} failed=1`);
    process.exit(1);
  }

  const failures = [];
  let totalDiffPixels = 0;

  for (let i = 0; i < pages.length; i += 1) {
    const stepId = `page-${i + 1}`;
    const result = compareToReference(pages[i], stepId, REFERENCES_DIR);
    if (result.status === 'pass') {
      totalDiffPixels += result.diffPixels ?? 0;
      continue;
    }

    failures.push(
      `${result.markers.join(' ')} — page ${i + 1}, ${result.diffPixels === null ? 'no' : result.diffPixels} ` +
        `differing pixels against a tolerance of ${result.maxDiffPixels === null ? 'n/a (no approved reference)' : result.maxDiffPixels}`,
    );

    const referencePngPath = path.join(REFERENCES_DIR, `${stepId}.png`);
    writeStepArtifacts({
      runStamp,
      stepId: path.join('pdf', stepId),
      actualPng: pages[i],
      referencePng: fs.existsSync(referencePngPath) ? fs.readFileSync(referencePngPath) : null,
      rubricResult: null,
      diffResult: result,
    });
  }

  for (const line of failures) console.error(line);

  // Printed on BOTH the pass and the fail path.
  console.log(`GATE-SKIPS total=${pages.length} skipped=0`);

  if (failures.length > 0) {
    console.error(`PDF VISUAL FAIL pages=${pages.length} failed=${failures.length}`);
    console.error(`Artifacts: ${path.join(ARTIFACT_ROOT, runStamp, 'pdf')}`);
    process.exit(1);
  }

  console.log(`PDF VISUAL PASS pages=${pages.length} diffPixels=${totalDiffPixels}`);
  process.exit(0);
}

main().catch((err) => {
  console.error(`PDF VISUAL FAIL pages=? failed=? : ${err && err.stack ? err.stack : err}`);
  console.log('GATE-SKIPS total=0 skipped=0');
  process.exit(1);
});
