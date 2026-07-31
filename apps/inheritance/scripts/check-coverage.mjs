#!/usr/bin/env node
/**
 * check-coverage.mjs — gate G12, the assertion half of the engine coverage report.
 *
 *   node scripts/check-coverage.mjs
 *   node scripts/check-coverage.mjs --summary <path> --lock <path> --src <path>
 *
 * scripts/coverage-report.sh produces the report; this script decides whether it
 * is acceptable. The split matters: a generator that also judged its own output
 * would be a check that can rewrite its own baseline, which is not a check.
 *
 * WHAT THIS GATE DELIBERATELY DOES NOT ASSERT: a coverage percentage. Requirement
 * COV-04 asks for a report identifying, per engine module, what no test exercises.
 * It does not name a target, and nothing else in this repository grounds one.
 * Picking a number would be exactly the ungrounded decision this project forbids,
 * so no threshold appears here or in coverage-report.sh. What IS grounded, and is
 * what this gate asserts:
 *
 *   - the report can be produced at all;
 *   - every .rs file under engine/src/ appears in it (a module that silently
 *     vanishes from a coverage report is the precise failure a coverage report
 *     exists to prevent);
 *   - the set of modules at EXACTLY zero coverage matches coverage-zero.lock,
 *     in both directions.
 *
 * Violations, each with its own literal marker:
 *
 *   COVERAGE REPORT UNAVAILABLE       - the summary is missing, unparseable, or has no modules
 *   MODULE ABSENT FROM REPORT         - an engine/src/*.rs file has no entry in the report
 *   UNDECLARED ZERO COVERAGE          - a module no test enters that coverage-zero.lock omits
 *   STALE ZERO COVERAGE DECLARATION   - a declared module now has covered regions, or is gone
 *
 * The last one is the direction that forces the ledger DOWN: the day a module
 * gains its first test, its declaration must go with it or this gate turns red.
 *
 * All matching is LITERAL string comparison, never a regular expression.
 *
 * Reads repo files only. No database, no socket, no subprocess. It has no --fix,
 * --update, --accept, --regenerate or waiver flag; the three flags are read-only
 * path overrides so the committed fixtures can drive every failure path.
 *
 * Dependency-free: node: builtins only. Exit 0 on zero violations, 1 otherwise.
 * There is no other exit code.
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const SCRIPT_DIR = path.dirname(new URL(import.meta.url).pathname);
const APP_DIR = path.resolve(SCRIPT_DIR, '..');

const DEFAULTS = {
  summary: path.join(APP_DIR, '.gate-runs', 'coverage', 'summary.json'),
  lock: path.join(APP_DIR, 'coverage-zero.lock'),
  src: path.join(APP_DIR, 'engine', 'src'),
};

function parseArgs(argv) {
  const opts = { ...DEFAULTS };
  for (let i = 0; i < argv.length; i += 1) {
    const flag = argv[i];
    if (flag === '--summary' || flag === '--lock' || flag === '--src') {
      const value = argv[i + 1];
      if (value === undefined) {
        console.error(`${flag} requires a path argument`);
        report(0);
        process.exit(1);
      }
      opts[flag.slice(2)] = path.resolve(value);
      i += 1;
    } else {
      console.error(`Unknown flag: ${flag}. Only --summary, --lock and --src are accepted.`);
      report(0);
      process.exit(1);
    }
  }
  return opts;
}

/**
 * GATE-09 skip accounting. `total` is the number of engine modules examined;
 * `skipped` is always 0 because this gate examines every module it finds.
 * Printed on EVERY exit path — gate G8 fails a log lacking this line with
 * SKIP REPORT MISSING.
 */
function report(total) {
  console.log(`GATE-SKIPS total=${total} skipped=0`);
}

function finish(violations, total) {
  if (violations.length > 0) {
    for (const v of violations) console.error(v);
    console.error('');
    console.error(`COVERAGE GATE FAILED — ${violations.length} violation(s)`);
    report(total);
    process.exit(1);
  }
  report(total);
  process.exit(0);
}

const opts = parseArgs(process.argv.slice(2));
const violations = [];

// ── 1. The report must exist and be usable ──────────────────────────────────

if (!existsSync(opts.summary)) {
  violations.push(
    `COVERAGE REPORT UNAVAILABLE: no coverage summary at ${opts.summary}. ` +
      'Run: bash scripts/coverage-report.sh'
  );
  finish(violations, 0);
}

let summary;
try {
  summary = JSON.parse(readFileSync(opts.summary, 'utf8'));
} catch (err) {
  violations.push(
    `COVERAGE REPORT UNAVAILABLE: ${opts.summary} is not parseable JSON: ${err.message}`
  );
  finish(violations, 0);
}

const modules = Array.isArray(summary.modules) ? summary.modules : [];
if (modules.length === 0) {
  violations.push(
    `COVERAGE REPORT UNAVAILABLE: ${opts.summary} declares no modules`
  );
  finish(violations, 0);
}

const byFile = new Map();
for (const m of modules) byFile.set(m.file, m);

// ── 2. Every engine module must appear in the report ────────────────────────

let sourceFiles = [];
if (!existsSync(opts.src)) {
  violations.push(
    `COVERAGE REPORT UNAVAILABLE: engine source directory not found at ${opts.src}`
  );
  finish(violations, modules.length);
}
sourceFiles = readdirSync(opts.src)
  .filter((name) => name.endsWith('.rs'))
  .map((name) => `src/${name}`)
  .sort();

/**
 * A source file is required to appear in the coverage report unless it declares
 * no function at all.
 *
 * This exemption is narrow and grounded, not a convenience: llvm-cov emits an
 * entry per file that has at least one coverage REGION, and a file with no `fn`
 * has none, so its absence is correct rather than suspicious. `engine/src/lib.rs`
 * is the only such file today — four doc-comment lines and seventeen `pub mod`
 * declarations, zero executable code.
 *
 * It cannot be used to hide a real module: every engine module that computes
 * anything declares functions, so a module that vanishes from the report still
 * fails this check. Observed firing against
 * scripts/fixtures/coverage-missing-module.json, which removes
 * src/step7_distribute.rs.
 */
function declaresAnyFunction(absPath) {
  let text;
  try {
    text = readFileSync(absPath, 'utf8');
  } catch {
    // Unreadable: assume it has code, so absence is reported rather than excused.
    return true;
  }
  return text.includes('fn ');
}

for (const file of sourceFiles) {
  if (byFile.has(file)) continue;
  const abs = path.join(opts.src, path.basename(file));
  if (!declaresAnyFunction(abs)) continue;
  violations.push(
    `MODULE ABSENT FROM REPORT: ${file} exists under ${opts.src} but has no entry in the coverage report`
  );
}

// ── 3 and 4. Zero-coverage set must match the shrink-only ledger ────────────

let lock;
try {
  lock = JSON.parse(readFileSync(opts.lock, 'utf8'));
} catch (err) {
  violations.push(
    `COVERAGE REPORT UNAVAILABLE: ${opts.lock} is missing or not parseable JSON: ${err.message}`
  );
  finish(violations, modules.length);
}

const declared = new Set(
  (lock.zero_coverage_modules ?? []).map((entry) => entry.file)
);

const observedZero = new Set(
  modules
    .filter((m) => m.regions_total > 0 && m.regions_uncovered === m.regions_total)
    .map((m) => m.file)
);

for (const file of [...observedZero].sort()) {
  if (!declared.has(file)) {
    const m = byFile.get(file);
    violations.push(
      `UNDECLARED ZERO COVERAGE: ${file} has ${m.regions_uncovered} of ${m.regions_total} regions uncovered ` +
        `and is not declared in ${path.basename(opts.lock)}. Write a test that enters it, or declare it with a reason.`
    );
  }
}

for (const file of [...declared].sort()) {
  if (!sourceFiles.includes(file)) {
    violations.push(
      `STALE ZERO COVERAGE DECLARATION: ${file} is declared in ${path.basename(opts.lock)} ` +
        'but no such module exists under engine/src/; delete that entry.'
    );
    continue;
  }
  if (!observedZero.has(file)) {
    const m = byFile.get(file);
    const covered = m ? m.regions_total - m.regions_uncovered : 'some';
    violations.push(
      `STALE ZERO COVERAGE DECLARATION: ${file} now has ${covered} covered region(s); ` +
        `delete that entry from ${path.basename(opts.lock)}.`
    );
  }
}

// ── Success ─────────────────────────────────────────────────────────────────

if (violations.length === 0) {
  console.log(
    `COVERAGE OK — ${modules.length} engine modules, ${observedZero.size} at zero coverage, all declared`
  );
}
finish(violations, modules.length);
