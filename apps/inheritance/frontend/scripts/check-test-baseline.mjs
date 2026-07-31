#!/usr/bin/env node
/**
 * check-test-baseline.mjs — the frontend regression gate.
 *
 *   node scripts/check-test-baseline.mjs                  # run the suite, then judge it
 *   node scripts/check-test-baseline.mjs --from-json <p>  # judge an existing report
 *
 * Why this exists instead of plain `npm test`:
 *
 * 46 genuine test-vs-product failures currently stand in this suite. They are
 * heterogeneous, several need a product decision, and "fixing" them by rewriting
 * test queries is exactly the test-weakening this project forbids. But a check
 * that is red from day one detects nothing — by the time a real regression lands,
 * nobody can tell it apart from the standing 46.
 *
 * So this gate runs the COMPLETE, UNMODIFIED suite and diffs the result against a
 * committed ledger (test-baseline.json). It fails on:
 *
 *   1. UNKNOWN FAILURE        — a failing test that is not in the ledger
 *   2. STALE BASELINE         — a ledgered test that now passes (forces the ledger to shrink)
 *   3. SKIPPED TESTS          — any pending / skipped / todo test
 *   4. TEST COUNT DROPPED     — the total fell below the ledger's min_total_tests floor
 *
 * Checks 3 and 4 make this gate strictly STRONGER than `npm test`: plain vitest
 * reports a skipped test as green, and deleting tests until green is undetectable.
 *
 * The ledger is a record of known failures, NOT permission to fail. It may only
 * shrink. This script therefore never writes test-baseline.json under any
 * circumstance — a gate that can edit its own baseline is not a gate.
 */

import { readFileSync, existsSync, mkdtempSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import os from 'node:os';

const FRONTEND_DIR = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const LEDGER_PATH = path.join(FRONTEND_DIR, 'test-baseline.json');

/** Read and parse a JSON file, or exit 1 with REPORT UNREADABLE. */
function readReport(reportPath) {
  if (!existsSync(reportPath)) {
    console.error('REPORT UNREADABLE: no such file: ' + reportPath);
    process.exit(1);
  }
  try {
    return JSON.parse(readFileSync(reportPath, 'utf8'));
  } catch (err) {
    console.error('REPORT UNREADABLE: ' + reportPath + ' is not valid JSON: ' + err.message);
    process.exit(1);
  }
}

/** Run the complete suite and return the parsed JSON report. */
function runSuite() {
  const tmpDir = mkdtempSync(path.join(os.tmpdir(), 'test-baseline-'));
  const reportPath = path.join(tmpDir, 'vitest-report.json');

  // --reporter=default keeps the human-readable summary in the CI log;
  // --reporter=json writes the machine-readable report this gate parses.
  // With two reporters active the output flag is dotted: --outputFile.json=<path>.
  // No other vitest flags are passed: the gate's value comes from running everything.
  spawnSync(
    'npx',
    ['vitest', 'run', '--reporter=default', '--reporter=json', '--outputFile.json=' + reportPath],
    { cwd: FRONTEND_DIR, stdio: 'inherit' },
  );

  // vitest's own exit status is NOT the gate's verdict — it is nonzero whenever
  // any ledgered failure fails, which is the expected steady state. The verdict
  // comes solely from diffing the report against the ledger below.
  return readReport(reportPath);
}

function relFile(name) {
  return path.isAbsolute(name) ? path.relative(FRONTEND_DIR, name) : name;
}

const SEP = ' :: ';

function makeKey(file, fullName) {
  return file + SEP + fullName;
}

// --- read the report --------------------------------------------------------

const argv = process.argv.slice(2);
const fromJsonIdx = argv.indexOf('--from-json');

let report;
if (fromJsonIdx !== -1) {
  const p = argv[fromJsonIdx + 1];
  if (!p) {
    console.error('REPORT UNREADABLE: --from-json requires a path argument');
    process.exit(1);
  }
  report = readReport(path.resolve(process.cwd(), p));
} else {
  report = runSuite();
}

if (!Array.isArray(report.testResults)) {
  console.error('REPORT UNREADABLE: report has no testResults array');
  process.exit(1);
}

// --- read the ledger --------------------------------------------------------

const ledger = readReport(LEDGER_PATH);
const ledgerEntries = new Map();
for (const entry of ledger.known_failures) {
  ledgerEntries.set(makeKey(entry.file, entry.fullName), entry);
}

// --- index the report -------------------------------------------------------

const seen = new Map();
for (const fileResult of report.testResults) {
  const file = relFile(fileResult.name || '');
  for (const a of fileResult.assertionResults || []) {
    seen.set(makeKey(file, a.fullName), {
      file: file,
      fullName: a.fullName,
      status: a.status,
    });
  }
}

const violations = [];

// Check 1 — UNKNOWN FAILURE: a failing test not covered by the ledger.
for (const [k, rec] of seen) {
  if (rec.status !== 'failed') continue;
  if (!ledgerEntries.has(k)) {
    violations.push(
      'UNKNOWN FAILURE: ' + rec.file + SEP + rec.fullName + '\n' +
        '  This test is failing and is not in test-baseline.json. Fix the regression.\n' +
        '  Adding it to the ledger to make this gate pass is prohibited.',
    );
  }
}

// Check 2 — STALE BASELINE: a ledgered test that now passes. This is what forces
// the ledger to shrink instead of rotting into a permanent excuse.
// BASELINED TEST NOT FOUND: a ledgered test absent from the report entirely.
for (const [k, entry] of ledgerEntries) {
  const rec = seen.get(k);
  if (rec === undefined) {
    violations.push(
      'BASELINED TEST NOT FOUND: ' + entry.file + SEP + entry.fullName + '\n' +
        '  This ledgered test did not appear in the run at all. It may have been\n' +
        '  renamed or deleted. This is never silently ignored.',
    );
  } else if (rec.status === 'passed') {
    violations.push(
      'STALE BASELINE: ' + entry.file + SEP + entry.fullName + '\n' +
        '  This test now PASSES. Delete its entry from test-baseline.json.',
    );
  }
}

// Check 3 — SKIPPED TESTS. Plain `npm test` reports a skipped test as green.
// This project forbids skipping a test to pass a gate, so the gate treats any
// skip, pending, or todo as a hard failure.
const skippedNames = [];
for (const rec of seen.values()) {
  if (rec.status === 'pending' || rec.status === 'skipped' || rec.status === 'todo') {
    skippedNames.push(rec.file + SEP + rec.fullName + ' (' + rec.status + ')');
  }
}
const numPendingTests = report.numPendingTests || 0;
const numTodoTests = report.numTodoTests || 0;
if (numPendingTests > 0 || numTodoTests > 0 || skippedNames.length > 0) {
  violations.push(
    'SKIPPED TESTS: numPendingTests=' + numPendingTests +
      ' numTodoTests=' + numTodoTests +
      ' skippedAssertions=' + skippedNames.length + '\n' +
      skippedNames.map((n) => '  - ' + n).join('\n') +
      (skippedNames.length ? '\n' : '') +
      '  A skipped test is a hard failure here. Remove the skip and fix the test.',
  );
}

// Check 4 — TEST COUNT DROPPED. Closes the "delete tests until green" escape hatch.
const numTotalTests = report.numTotalTests || 0;
if (numTotalTests < ledger.min_total_tests) {
  violations.push(
    'TEST COUNT DROPPED: ran ' + numTotalTests + ' tests, floor is ' + ledger.min_total_tests + '\n' +
      '  Tests were removed or failed to collect. Restore them.',
  );
}

// --- verdict ----------------------------------------------------------------

if (violations.length > 0) {
  console.error('');
  console.error('=========================================================');
  console.error('TEST BASELINE GATE FAILED — ' + violations.length + ' violation(s)');
  console.error('=========================================================');
  for (const v of violations) {
    console.error('');
    console.error(v);
  }
  console.error('');
  process.exit(1);
}

let matched = 0;
for (const k of ledgerEntries.keys()) {
  const rec = seen.get(k);
  if (rec && rec.status === 'failed') matched += 1;
}

console.log('');
console.log('=========================================================');
console.log('GATE OK — test baseline matches exactly');
console.log('=========================================================');
console.log('  total tests run     : ' + numTotalTests + ' (floor ' + ledger.min_total_tests + ')');
console.log('  passed              : ' + (report.numPassedTests || 0));
console.log('  known failures met  : ' + matched);
console.log('  LEDGER SIZE (debt)  : ' + ledgerEntries.size + '   <-- this number must only go down');
console.log('');
process.exit(0);
