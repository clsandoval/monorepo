#!/usr/bin/env node
/**
 * check-gate-skips.mjs — per-gate skip accounting (GATE-09).
 *
 *   node scripts/check-gate-skips.mjs
 *   node scripts/check-gate-skips.mjs --logs <dir> --lock <path> --manifest <path>
 *
 * GATE-09 requires every gate's output to distinguish "skipped" from "passed", so
 * a partially-loaded suite can never be misread as a clean pass. A gate that ran
 * half its assertions and exited 0 is indistinguishable, from an exit code alone,
 * from a gate that ran all of them. This script closes that gap.
 *
 * It never infers. Every gate's skip count comes from one fixed source:
 *
 *   G2, G3, G5, G6, G7   the `GATE-SKIPS total=<n> skipped=<n>` line the script
 *                        behind that gate prints on every one of its exit paths,
 *                        captured by scripts/ci-gates.sh into
 *                        .gate-runs/logs/<GATE_ID>.log
 *   G1                   derived from cargo's own `test result:` lines: the
 *                        `N ignored` and `N filtered out` fields are the skips,
 *                        the `N passed` fields are the total. cargo is an
 *                        external tool and cannot be asked to emit our line.
 *   G4                   static. tsc is likewise external. skipLibCheck and
 *                        skipDefaultLibCheck in frontend/tsconfig.json each
 *                        suppress checking, as does every @ts-ignore,
 *                        @ts-nocheck or @ts-expect-error under frontend/src.
 *   G8 and later         this gate itself, and any gate ordered after it. Their
 *                        logs are still being written while this check runs, so
 *                        absence is expected rather than suspicious — and only
 *                        absence is excused, never a present-but-empty report.
 *
 * Five verdicts, each with its own literal marker:
 *
 *   1. SKIP REPORT MISSING     — a gate produced no usable skip report, or its
 *                                log belongs to a different run. Absence is a
 *                                FAILURE, never a silent zero; otherwise
 *                                deleting a log would be a way to look clean.
 *   2. UNDECLARED SKIP         — an observed skip that gate-skips.lock does not
 *                                declare.
 *   3. STALE SKIP DECLARATION  — a declared skip that was not observed. This is
 *                                the direction that forces the ledger DOWN: the
 *                                day a skip is removed, its declaration must go
 *                                with it or this gate turns red.
 *   4. SKIP COUNT MISMATCH     — an emitted `skipped=<n>` that disagrees with the
 *                                skip ids collectable for that gate. A count and
 *                                a list that disagree mean one is fabricated.
 *   5. SKIP SCAN UNREADABLE    — an input is missing or unparseable. Never exit 0
 *                                on an internal error.
 *
 * gate-skips.lock may ONLY SHRINK. This script has no flag of any kind that
 * writes it, repairs it, or regenerates it, by design: a check that can rewrite
 * its own baseline is not a check. The only three flags are --logs, --lock and
 * --manifest, all read-only path overrides.
 *
 * Dependency-free: node: builtins only. Exit 0 on zero violations, 1 otherwise.
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const SCRIPT_DIR = path.dirname(new URL(import.meta.url).pathname);
const APP_DIR = path.resolve(SCRIPT_DIR, '..');

const DEFAULT_MANIFEST = path.join(APP_DIR, 'gates.manifest.json');
const DEFAULT_LOCK = path.join(APP_DIR, 'gate-skips.lock');
const DEFAULT_LOGS = path.join(APP_DIR, '.gate-runs', 'logs');

const TSCONFIG = path.join(APP_DIR, 'frontend', 'tsconfig.json');
const FRONTEND_SRC = path.join(APP_DIR, 'frontend', 'src');

/** The gate this script itself backs. Its log, and every later gate's, is still
 *  unwritten while this check runs. */
const SELF_GATE_ID = 'G8';

/** Fixed observation source per gate id. Anything not listed emits the line. */
const OBSERVATION_SOURCE = {
  G1: 'cargo',
  G4: 'tsc',
};

const SUPPRESSION_MARKERS = ['@ts-ignore', '@ts-nocheck', '@ts-expect-error'];
const SCANNED_EXTENSIONS = ['.ts', '.tsx'];

/**
 * `@ts-expect-error` inside a `*.typetest.ts` file is an ASSERTION, not a
 * suppression, and is therefore not a skip.
 *
 * The difference is that it is self-verifying. If the error it expects stops
 * occurring — i.e. the type protection it guards regressed away — TypeScript
 * raises TS2578 "unused '@ts-expect-error' directive" and the typecheck gate
 * fails. A directive that goes red when the thing it protects breaks cannot
 * hide a regression, which is the entire property this gate exists to enforce.
 *
 * Deliberately narrow: this applies ONLY to `@ts-expect-error`, and ONLY in
 * `*.typetest.ts`. `@ts-ignore` and `@ts-nocheck` silently swallow whatever
 * follows them and stay skips everywhere, typetest files included.
 *
 * Exposed by EXT-03's negative type test (`src/types/money-units.typetest.ts`),
 * whose four directives were verified in both directions: erasing the Pesos /
 * Centavos brand produced exactly four TS2578 errors and exit 1; restoring it
 * gave exit 0.
 */
function isSelfVerifyingAssertion(marker, relPath) {
  return marker === '@ts-expect-error' && relPath.endsWith('.typetest.ts');
}

/** Exit 1 with SKIP SCAN UNREADABLE. Never exit 0 on an internal error. */
function unreadable(message) {
  console.error('SKIP SCAN UNREADABLE: ' + message);
  process.exit(1);
}

function readJson(filePath, label) {
  if (!existsSync(filePath)) {
    unreadable('no such ' + label + ' file: ' + filePath);
  }
  let raw;
  try {
    raw = readFileSync(filePath, 'utf8');
  } catch (err) {
    unreadable('could not read ' + label + ' at ' + filePath + ': ' + err.message);
  }
  try {
    return JSON.parse(raw);
  } catch (err) {
    unreadable(label + ' at ' + filePath + ' is not valid JSON: ' + err.message);
  }
  return undefined;
}

// --- arguments --------------------------------------------------------------

const argv = process.argv.slice(2);
let manifestPath = DEFAULT_MANIFEST;
let lockPath = DEFAULT_LOCK;
let logsDir = DEFAULT_LOGS;

for (let i = 0; i < argv.length; i += 1) {
  const arg = argv[i];
  if (arg === '--manifest') {
    const v = argv[i + 1];
    if (!v) unreadable('--manifest requires a path argument');
    manifestPath = path.resolve(process.cwd(), v);
    i += 1;
  } else if (arg === '--lock') {
    const v = argv[i + 1];
    if (!v) unreadable('--lock requires a path argument');
    lockPath = path.resolve(process.cwd(), v);
    i += 1;
  } else if (arg === '--logs') {
    const v = argv[i + 1];
    if (!v) unreadable('--logs requires a path argument');
    logsDir = path.resolve(process.cwd(), v);
    i += 1;
  } else {
    unreadable('unknown argument: ' + arg + ' (only --logs, --lock and --manifest exist)');
  }
}

// --- load -------------------------------------------------------------------

const manifest = readJson(manifestPath, 'manifest');
const lock = readJson(lockPath, 'skip ledger');

if (!Array.isArray(manifest.gates)) {
  unreadable('manifest at ' + manifestPath + ' has no gates array');
}
if (!Array.isArray(lock.declared_skips)) {
  unreadable('skip ledger at ' + lockPath + ' has no declared_skips array');
}

const violations = [];

/** The run stamp this scan is judging. Absent is not fatal on its own — it turns
 *  into SKIP REPORT MISSING below, which is the verdict that belongs to it. */
const stampFile = path.join(logsDir, 'RUN.stamp');
let expectedStamp = null;
if (existsSync(stampFile)) {
  try {
    expectedStamp = readFileSync(stampFile, 'utf8').split('\n')[0].trim();
  } catch (err) {
    unreadable('could not read run stamp at ' + stampFile + ': ' + err.message);
  }
} else {
  violations.push(
    'SKIP REPORT MISSING: no run stamp at ' + stampFile +
      ' — cannot tell which run these logs describe',
  );
}

// --- self order -------------------------------------------------------------

let selfOrder = Number.POSITIVE_INFINITY;
for (const gate of manifest.gates) {
  if (gate && gate.id === SELF_GATE_ID && typeof gate.order === 'number') {
    selfOrder = gate.order;
  }
}

// --- static observation for G4 ----------------------------------------------

function listSourceFiles(dir) {
  const out = [];
  if (!existsSync(dir)) return out;
  const stack = [dir];
  while (stack.length > 0) {
    const current = stack.pop();
    let entries;
    try {
      entries = readdirSync(current);
    } catch (err) {
      unreadable('could not scan ' + current + ': ' + err.message);
      return out;
    }
    for (const name of entries) {
      const full = path.join(current, name);
      let st;
      try {
        st = statSync(full);
      } catch {
        continue;
      }
      if (st.isDirectory()) {
        stack.push(full);
      } else if (SCANNED_EXTENSIONS.includes(path.extname(full))) {
        out.push(full);
      }
    }
  }
  out.sort();
  return out;
}

function observeTypecheck() {
  const tsconfig = readJson(TSCONFIG, 'tsconfig');
  const opts = (tsconfig && tsconfig.compilerOptions) || {};
  const skips = [];
  if (opts.skipLibCheck === true) {
    skips.push({ id: 'tsconfig.skipLibCheck', source: 'frontend/tsconfig.json' });
  }
  if (opts.skipDefaultLibCheck === true) {
    skips.push({ id: 'tsconfig.skipDefaultLibCheck', source: 'frontend/tsconfig.json' });
  }

  const files = listSourceFiles(FRONTEND_SRC);
  for (const file of files) {
    let lines;
    try {
      lines = readFileSync(file, 'utf8').split('\n');
    } catch (err) {
      unreadable('could not read ' + file + ': ' + err.message);
      return null;
    }
    const rel = path.relative(APP_DIR, file);
    for (let i = 0; i < lines.length; i += 1) {
      for (const marker of SUPPRESSION_MARKERS) {
        if (lines[i].includes(marker)) {
          if (isSelfVerifyingAssertion(marker, rel)) break;
          skips.push({ id: 'suppression:' + rel + ':' + (i + 1), source: rel });
          break;
        }
      }
    }
  }

  // total = the two tsconfig switches plus every file the typecheck covers.
  return { total: 2 + files.length, skips, emitted: null };
}

// --- derived observation for G1 ---------------------------------------------

function observeCargo(logText) {
  const lines = logText.split('\n');
  const skips = [];
  let total = 0;
  let sawResult = false;

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line.startsWith('test result:')) continue;
    sawResult = true;

    const passed = /(\d+) passed/.exec(line);
    if (passed) total += Number(passed[1]);

    const ignored = /(\d+) ignored/.exec(line);
    if (ignored) {
      for (let k = 1; k <= Number(ignored[1]); k += 1) {
        skips.push({ id: 'cargo.ignored:' + i + ':' + k, source: 'engine (cargo test)' });
      }
    }

    const filtered = /(\d+) filtered out/.exec(line);
    if (filtered) {
      for (let k = 1; k <= Number(filtered[1]); k += 1) {
        skips.push({ id: 'cargo.filtered-out:' + i + ':' + k, source: 'engine (cargo test)' });
      }
    }
  }

  if (!sawResult) return null;
  return { total, skips, emitted: null };
}

// --- per-gate scan ----------------------------------------------------------

/** Observed skip ids, keyed by gate id. */
const observedByGate = new Map();
let gatesAccounted = 0;

for (const gate of manifest.gates) {
  if (!gate || typeof gate.id !== 'string') continue;
  const id = gate.id;
  const order = typeof gate.order === 'number' ? gate.order : Number.POSITIVE_INFINITY;
  gatesAccounted += 1;

  // This gate and every gate ordered after it have not finished writing their
  // logs while this check runs — this check IS one of them. Their reports are
  // pending rather than absent, so they are exempt from every log-derived
  // verdict. Nothing else is exempt from anything.
  if (order >= selfOrder) {
    observedByGate.set(id, []);
    continue;
  }

  const logPath = path.join(logsDir, id + '.log');

  if (!existsSync(logPath)) {
    violations.push(
      'SKIP REPORT MISSING: gate ' + id + ' has no log at ' + logPath +
        ' — an absent report is a failure, not zero skips',
    );
    observedByGate.set(id, []);
    continue;
  }

  let logText;
  try {
    logText = readFileSync(logPath, 'utf8');
  } catch (err) {
    unreadable('could not read log for gate ' + id + ' at ' + logPath + ': ' + err.message);
    continue;
  }

  const firstLine = logText.split('\n')[0].trim();
  const stampMatch = /^GSD-RUN (.+)$/.exec(firstLine);
  if (!stampMatch || expectedStamp === null || firstLine !== expectedStamp) {
    violations.push(
      'SKIP REPORT MISSING: gate ' + id + ' log at ' + logPath + ' carries stamp ' +
        JSON.stringify(firstLine) + ' which does not match the run stamp ' +
        JSON.stringify(expectedStamp) + ' — this log describes a different run',
    );
    observedByGate.set(id, []);
    continue;
  }

  const source = OBSERVATION_SOURCE[id] || 'emitted';
  let observation = null;

  if (source === 'cargo') {
    observation = observeCargo(logText);
    if (observation === null) {
      violations.push(
        'SKIP REPORT MISSING: gate ' + id + ' log at ' + logPath +
          ' contains no "test result:" line to derive ignored / filtered out counts from',
      );
      observedByGate.set(id, []);
      continue;
    }
  } else if (source === 'tsc') {
    observation = observeTypecheck();
  } else {
    const emitted = /GATE-SKIPS total=(\d+) skipped=(\d+)/.exec(logText);
    if (!emitted) {
      violations.push(
        'SKIP REPORT MISSING: gate ' + id + ' log at ' + logPath +
          ' has no GATE-SKIPS line — the gate ran without reporting its own coverage',
      );
      observedByGate.set(id, []);
      continue;
    }
    observation = { total: Number(emitted[1]), skips: [], emitted: Number(emitted[2]) };
  }

  observedByGate.set(id, observation.skips);

  if (observation.emitted !== null && observation.emitted !== observation.skips.length) {
    violations.push(
      'SKIP COUNT MISMATCH: gate ' + id + ' emitted skipped=' + observation.emitted +
        ' but ' + observation.skips.length + ' skip id(s) are collectable for it — ' +
        'a count and a list that disagree mean one of them is fabricated',
    );
  }
}

// The self gate accounts for itself: it makes one assertion per manifest gate
// and skips none of them, or it would not have reached this line.
if (!observedByGate.has(SELF_GATE_ID)) observedByGate.set(SELF_GATE_ID, []);

// --- ledger comparison ------------------------------------------------------

const declared = new Map();
for (const entry of lock.declared_skips) {
  if (!entry || typeof entry.gate !== 'string' || typeof entry.id !== 'string') {
    unreadable('a declared_skips entry in ' + lockPath + ' is missing gate or id');
    continue;
  }
  declared.set(entry.gate + '::' + entry.id, entry);
}

const observedKeys = new Set();
let undeclaredCount = 0;

for (const [gateId, skips] of observedByGate) {
  for (const skip of skips) {
    const key = gateId + '::' + skip.id;
    observedKeys.add(key);
    if (!declared.has(key)) {
      undeclaredCount += 1;
      violations.push(
        'UNDECLARED SKIP: gate ' + gateId + ' skipped ' + skip.id + ' (source: ' + skip.source +
          ') which gate-skips.lock does not declare — declare it only if it must exist, ' +
          'and prefer removing the skip',
      );
    }
  }
}

for (const [key, entry] of declared) {
  if (!observedKeys.has(key)) {
    violations.push(
      'STALE SKIP DECLARATION: gate-skips.lock declares ' + entry.gate + ' / ' + entry.id +
        ' (source: ' + entry.source + ') but it was not observed on this run — ' +
        'the ledger may only shrink, so remove the declaration',
    );
  }
}

// --- verdict ----------------------------------------------------------------

function reportSkips() {
  console.log('GATE-SKIPS total=' + gatesAccounted + ' skipped=0');
}

if (violations.length > 0) {
  console.error('');
  console.error('=========================================================');
  console.error('GATE SKIP ACCOUNTING FAILED');
  console.error('=========================================================');
  console.error('');
  for (const v of violations) {
    console.error(v);
  }
  console.error('');
  console.error('gate-skips.lock may only SHRINK. Adding an entry to turn a red');
  console.error('run green is prohibited — the fix is to remove the skip. There is');
  console.error('no flag on this script that writes the ledger, by design.');
  console.error('');
  reportSkips();
  process.exit(1);
}

console.log(
  'SKIPS OK — ' + gatesAccounted + ' gates accounted, ' + declared.size +
    ' declared skip' + (declared.size === 1 ? '' : 's') + ', ' + undeclaredCount + ' undeclared',
);
reportSkips();
process.exit(0);
