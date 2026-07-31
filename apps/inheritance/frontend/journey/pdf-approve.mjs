#!/usr/bin/env node
/*
 * journey/pdf-approve.mjs — the ONLY thing that writes a PDF page reference.
 *
 * This command exists so that approving a page image is a deliberate, separately
 * invoked act. NO GATE MAY CALL IT. journey/pdf-visual.mjs has no write path
 * into journey/pdf-references/ at all, precisely so that a red gate can never
 * make itself green by rewriting its own expectation.
 *
 * It can only promote images a real run actually produced: it reads
 * `.journey-runs/<newest>/pdf/page-<n>.png` and REFUSES when no run has produced
 * any. A reference can never be conjured from a hand-placed file outside the
 * artifact tree.
 *
 * APPROVAL IS WHOLE-DOCUMENT, NOT PER-PAGE. It takes no step id, because
 * approving page 2 of a two-page document while leaving page 1 at an older
 * revision would leave the reference set describing a document that never
 * existed. Extra references beyond the page count just approved are deleted, so
 * a document that lost a page cannot leave a stale image behind.
 *
 * Usage, from `frontend/`:
 *   node journey/pdf-approve.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FRONTEND_ROOT = path.resolve(HERE, '..');
const RUNS_ROOT = path.join(FRONTEND_ROOT, '.journey-runs');
const REFERENCES_DIR = path.join(HERE, 'pdf-references');

function refuse(message) {
  console.error(message);
  process.exit(1);
}

/**
 * Newest `.journey-runs/<stamp>/pdf/` holding at least one `page-<n>.png`.
 * Run stamps are ISO-like, so descending name order is newest-first.
 */
function newestPdfRunDir() {
  if (!fs.existsSync(RUNS_ROOT)) return null;
  const stamps = fs
    .readdirSync(RUNS_ROOT, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort()
    .reverse();
  for (const stamp of stamps) {
    const dir = path.join(RUNS_ROOT, stamp, 'pdf');
    if (!fs.existsSync(dir)) continue;
    const pageFiles = fs.readdirSync(dir).filter((n) => /^page-\d+\.png$/.test(n));
    if (pageFiles.length > 0) return { stamp, dir, pageFiles };
  }
  return null;
}

function main() {
  if (process.argv.length > 2) {
    refuse(
      `PDF APPROVE REFUSED: this command takes no arguments; approval is whole-document ` +
        `(got '${process.argv.slice(2).join(' ')}')`,
    );
  }

  const newest = newestPdfRunDir();
  if (newest === null) {
    refuse(
      'PDF APPROVE REFUSED: no run has produced page images; run node journey/pdf-visual.mjs first',
    );
  }

  const pageNumbers = newest.pageFiles
    .map((n) => Number.parseInt(n.match(/^page-(\d+)\.png$/)[1], 10))
    .sort((a, b) => a - b);

  fs.mkdirSync(REFERENCES_DIR, { recursive: true });

  for (const n of pageNumbers) {
    fs.copyFileSync(
      path.join(newest.dir, `page-${n}.png`),
      path.join(REFERENCES_DIR, `page-${n}.png`),
    );
    fs.writeFileSync(
      path.join(REFERENCES_DIR, `page-${n}.json`),
      `${JSON.stringify({ maxDiffPixels: 0 }, null, 2)}\n`,
      'utf8',
    );
  }

  // A shrunk document must not leave a stale extra reference behind.
  const highest = pageNumbers[pageNumbers.length - 1];
  for (const name of fs.readdirSync(REFERENCES_DIR)) {
    const match = name.match(/^page-(\d+)\.(png|json)$/);
    if (!match) continue;
    if (Number.parseInt(match[1], 10) > highest) {
      fs.rmSync(path.join(REFERENCES_DIR, name), { force: true });
    }
  }

  console.log(`PDF APPROVE OK pages=${pageNumbers.length} from=${newest.stamp}`);
}

main();
