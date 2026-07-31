#!/usr/bin/env node
/**
 * gate-coverage.mjs — coverage of the frozen manifest by the latest run.
 *
 *   node scripts/gate-coverage.mjs
 *   node scripts/gate-coverage.mjs --run <path> [--manifest <path>] [--json]
 *
 * This closes the one failure mode that survives every other check in this phase:
 * a run that legitimately passes everything it EXECUTED, while quietly executing
 * less than the manifest requires. From the outside that looks exactly like
 * success — exit 0, "ALL GATES PASSED".
 *
 * The only defense is to compute coverage from TWO INDEPENDENT SOURCES:
 *
 *   - gates.manifest.json  is the EXPECTATION (frozen, growth-only, gate G5)
 *   - .gate-runs/latest.json is the OBSERVATION (written by the runner)
 *
 * Narrowing the run alone cannot satisfy this check, and narrowing the manifest
 * is rejected by GATE REMOVED. That is what makes coverage the one check that
 * cannot be cleared by editing the thing being measured.
 *
 * Enforcement, in order:
 *   1. outcome is `pass` AND a blocking gate is `not-run`  -> SCOPE NARROWED, exit 1
 *   2. a run-record gate id absent from the manifest       -> UNKNOWN GATE IN RECORD, exit 1
 *   3. the run record is missing or unparseable            -> RUN RECORD UNREADABLE, exit 1
 *   4. otherwise                                           -> exit 0
 *
 * Rule 4 deliberately covers `fail` and `cannot-run` outcomes. A halted run
 * reached fewer gates BY DESIGN; reporting that as a narrowing would punish the
 * halt behavior the runner exists to provide, and operators would disable this
 * check within a week.
 *
 * Requirement coverage is reported as INFORMATION and never fails the build.
 * Most v1 requirements are legitimately ungated until their phases land; failing
 * on that would make the loop unable to move at all.
 *
 * Dependency-free: node: builtins only. This script never writes any file.
 */

import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const SCRIPT_DIR = path.dirname(new URL(import.meta.url).pathname);
const APP_DIR = path.resolve(SCRIPT_DIR, '..');
const DEFAULT_MANIFEST = path.join(APP_DIR, 'gates.manifest.json');
const DEFAULT_RUN = path.join(APP_DIR, '.gate-runs', 'latest.json');
const REQUIREMENTS_PATH = path.join(APP_DIR, '.planning', 'REQUIREMENTS.md');

/** Any unreadable input is a hard failure. Never exit 0 on an internal error. */
function unreadable(message) {
  console.error('RUN RECORD UNREADABLE: ' + message);
  process.exit(1);
}

function readJson(filePath, label) {
  if (!existsSync(filePath)) {
    unreadable('no such ' + label + ' file: ' + filePath);
  }
  try {
    return JSON.parse(readFileSync(filePath, 'utf8'));
  } catch (err) {
    unreadable(label + ' at ' + filePath + ' is not valid JSON: ' + err.message);
  }
  return undefined;
}

// --- arguments --------------------------------------------------------------

const argv = process.argv.slice(2);
let runPath = DEFAULT_RUN;
let manifestPath = DEFAULT_MANIFEST;
let asJson = false;

for (let i = 0; i < argv.length; i += 1) {
  const arg = argv[i];
  if (arg === '--run') {
    const v = argv[i + 1];
    if (!v) unreadable('--run requires a path argument');
    runPath = path.resolve(process.cwd(), v);
    i += 1;
  } else if (arg === '--manifest') {
    const v = argv[i + 1];
    if (!v) unreadable('--manifest requires a path argument');
    manifestPath = path.resolve(process.cwd(), v);
    i += 1;
  } else if (arg === '--json') {
    asJson = true;
  } else {
    unreadable('unknown argument: ' + arg + ' (only --run, --manifest and --json exist)');
  }
}

const manifest = readJson(manifestPath, 'manifest');
const run = readJson(runPath, 'run record');

if (!Array.isArray(manifest.gates)) unreadable('manifest has no gates array');
if (!Array.isArray(run.gates)) unreadable('run record has no gates array');

const gatesInOrder = manifest.gates.slice().sort((a, b) => a.order - b.order);
const recordById = new Map();
for (const g of run.gates) {
  if (g && typeof g.id === 'string') recordById.set(g.id, g);
}
const manifestIds = new Set(gatesInOrder.map((g) => g.id));

const MISSING = 'MISSING FROM RECORD';
const REACHED = new Set(['pass', 'fail', 'cannot-run']);

// --- report 1: gate execution coverage --------------------------------------

const rows = [];
let executed = 0;
for (const g of gatesInOrder) {
  const rec = recordById.get(g.id);
  const status = rec === undefined ? MISSING : rec.status;
  const exitCode = rec === undefined || rec.exit_code === null || rec.exit_code === undefined
    ? '-'
    : String(rec.exit_code);
  if (REACHED.has(status)) executed += 1;
  rows.push({ id: g.id, order: g.order, blocking: g.blocking, name: g.name, status, exitCode });
}

console.log('');
console.log('GATE EXECUTION COVERAGE');
console.log('  run record : ' + runPath);
console.log('  outcome    : ' + run.outcome + '   signature: ' + JSON.stringify(run.failure_signature));
console.log('');
console.log('  ' + 'id'.padEnd(5) + 'ord'.padEnd(5) + 'blk'.padEnd(5) + 'name'.padEnd(28) + 'status'.padEnd(21) + 'exit');
console.log('  ' + '-'.repeat(5 + 5 + 5 + 28 + 21 + 4));
for (const r of rows) {
  console.log(
    '  ' + r.id.padEnd(5) + String(r.order).padEnd(5) + (r.blocking ? 'yes' : 'no').padEnd(5) +
      String(r.name).slice(0, 27).padEnd(28) + String(r.status).padEnd(21) + r.exitCode,
  );
}
console.log('');
console.log('GATE COVERAGE ' + executed + '/' + gatesInOrder.length);

// Drift in the opposite direction: the runner executed something the frozen
// manifest does not describe.
const unknownIds = [];
for (const id of recordById.keys()) {
  if (!manifestIds.has(id)) unknownIds.push(id);
}

// --- report 2: requirement coverage (informational only) --------------------

let gatedCount = 0;
let totalRequirements = 0;
const gatedPairs = [];
if (existsSync(REQUIREMENTS_PATH)) {
  const text = readFileSync(REQUIREMENTS_PATH, 'utf8');
  const ids = [...new Set(text.match(/\b[A-Z][A-Z0-9]*-[0-9]{2}\b/g) || [])].sort();
  totalRequirements = ids.length;
  for (const id of ids) {
    const covering = gatesInOrder
      .filter((g) => Array.isArray(g.requirements) && g.requirements.includes(id))
      .map((g) => g.id);
    if (covering.length > 0) {
      gatedCount += 1;
      gatedPairs.push(id + ' -> ' + covering.join(','));
    }
  }
}

console.log('');
console.log('REQUIREMENT COVERAGE (informational — never fails the build)');
for (const p of gatedPairs) console.log('  ' + p);
console.log(
  '  every other requirement id is UNGATED, which is the roadmap\'s remaining work, not a defect.',
);
console.log('');
console.log('REQUIREMENT COVERAGE ' + gatedCount + '/' + totalRequirements + ' gated');

// --- enforcement ------------------------------------------------------------

const narrowed = rows.filter(
  (r) => r.blocking === true && (r.status === 'not-run' || r.status === MISSING),
);

if (asJson) {
  console.log(
    JSON.stringify({
      schema: 1,
      outcome: run.outcome,
      gate_coverage: { executed, total: gatesInOrder.length },
      requirement_coverage: { gated: gatedCount, total: totalRequirements },
      gates: rows,
      unknown_gate_ids: unknownIds,
      narrowed_gate_ids: run.outcome === 'pass' ? narrowed.map((r) => r.id) : [],
    }),
  );
}

if (run.outcome === 'pass' && narrowed.length > 0) {
  console.error('');
  console.error('SCOPE NARROWED — this run reported `pass` but did not reach every blocking gate:');
  for (const r of narrowed) {
    console.error('  ' + r.id + ' (' + r.name + ') status=' + r.status);
  }
  console.error('');
  console.error('A run that passes everything it executed, while executing less than the frozen');
  console.error('manifest requires, is not a pass. Restore the skipped gate(s); do not remove');
  console.error('them from gates.manifest.json — that is rejected by GATE REMOVED.');
  console.error('');
  process.exit(1);
}

if (unknownIds.length > 0) {
  console.error('');
  console.error('UNKNOWN GATE IN RECORD — the runner executed gate(s) the manifest does not describe:');
  for (const id of unknownIds) console.error('  ' + id);
  console.error('');
  console.error('Either add the gate to gates.manifest.json and gates.manifest.lock, or stop');
  console.error('running it. An unfrozen gate is drift in the opposite direction.');
  console.error('');
  process.exit(1);
}

console.log('');
console.log('COVERAGE OK');
process.exit(0);
