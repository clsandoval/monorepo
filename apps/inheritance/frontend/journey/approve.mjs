#!/usr/bin/env node
/*
 * journey/approve.mjs — the ONLY thing that writes a reference image.
 *
 * This command exists so that approving a reference is a deliberate, separately
 * invoked act. NO GATE MAY CALL IT. A gate that could approve its own reference
 * would go green by rewriting its own expectation, and the change would never
 * appear in front of a human.
 *
 * It can only promote an image that a real run actually produced: it reads
 * `.journey-runs/<newest>/<stepId>/actual.png` and REFUSES when that file does not
 * exist. A reference can never be conjured from a hand-placed file outside the
 * artifact tree.
 *
 * Usage, from `frontend/`:
 *   node journey/approve.mjs <stepId> [--max-diff-pixels <int>] [--by <string>]
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FRONTEND_ROOT = path.resolve(HERE, '..');
const RUNS_ROOT = path.join(FRONTEND_ROOT, '.journey-runs');
const REFERENCES_DIR = path.join(HERE, 'references');

function refuse(message) {
  console.error(message);
  process.exit(1);
}

function parseArgs(argv) {
  const args = { stepId: null, maxDiffPixels: 0, by: 'unattended-loop' };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--max-diff-pixels') {
      const value = argv[i + 1];
      const parsed = Number.parseInt(value, 10);
      if (!Number.isInteger(parsed) || parsed < 0) {
        refuse(`APPROVE REFUSED: --max-diff-pixels requires a non-negative integer, got '${value}'`);
      }
      args.maxDiffPixels = parsed;
      i += 1;
    } else if (token === '--by') {
      const value = argv[i + 1];
      if (!value) refuse('APPROVE REFUSED: --by requires a value');
      args.by = value;
      i += 1;
    } else if (token.startsWith('--')) {
      refuse(`APPROVE REFUSED: unknown flag '${token}'`);
    } else if (args.stepId === null) {
      args.stepId = token;
    } else {
      refuse(`APPROVE REFUSED: unexpected extra argument '${token}'`);
    }
  }
  if (!args.stepId) {
    refuse('APPROVE REFUSED: usage: node journey/approve.mjs <stepId> [--max-diff-pixels <int>] [--by <string>]');
  }
  return args;
}

/**
 * Newest run directory under .journey-runs/, by descending name.
 * Plan 10-04 stamps run directories with an ISO-like timestamp, so name order is
 * time order. Returns null when the root is absent or holds no run directory.
 */
function newestRunDir() {
  if (!fs.existsSync(RUNS_ROOT)) return null;
  const entries = fs
    .readdirSync(RUNS_ROOT, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort()
    .reverse();
  if (entries.length === 0) return null;
  return path.join(RUNS_ROOT, entries[0]);
}

function utcDate() {
  return new Date().toISOString().slice(0, 10);
}

function main() {
  const { stepId, maxDiffPixels, by } = parseArgs(process.argv.slice(2));

  const runDir = newestRunDir();
  const actualPath = runDir === null ? null : path.join(runDir, stepId, 'actual.png');
  if (actualPath === null || !fs.existsSync(actualPath)) {
    refuse(`APPROVE REFUSED: no artifact found for step ${stepId}`);
  }

  fs.mkdirSync(REFERENCES_DIR, { recursive: true });
  fs.copyFileSync(actualPath, path.join(REFERENCES_DIR, `${stepId}.png`));
  fs.writeFileSync(
    path.join(REFERENCES_DIR, `${stepId}.json`),
    `${JSON.stringify({ maxDiffPixels, approvedOn: utcDate(), approvedBy: by }, null, 2)}\n`,
    'utf8',
  );

  console.log(`APPROVED ${stepId} maxDiffPixels=${maxDiffPixels}`);
}

main();
