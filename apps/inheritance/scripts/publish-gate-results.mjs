#!/usr/bin/env node
/**
 * publish-gate-results.mjs — join the manifest, the run record and the skip logs
 * into one committed, machine-readable results file (GATE-08).
 *
 *   node scripts/publish-gate-results.mjs
 *   node scripts/publish-gate-results.mjs --run <path> --out <path>
 *
 * `.gate-runs/latest.json` already exists, but it is gitignored runner-internal
 * detail: it carries no gate name, no `proves` text and no requirement mapping.
 * `scripts/loop-status.mjs` already records the missing gate name as a known
 * limitation. This script is the join that produces the artifact a status page
 * can actually render, and `gate-results.json` is committed while `.gate-runs/`
 * stays ignored.
 *
 * Reads `scripts/gate-coverage.mjs` as its sibling: that script performs the same
 * manifest-versus-run-record join for a different purpose.
 *
 * THE LOAD-BEARING RULE. The four run-record statuses are copied VERBATIM:
 *
 *     pass   fail   cannot-run   not-run
 *
 * Nothing is mapped, normalised, coalesced or defaulted. A gate absent from the
 * run record entirely is `not-run`, matching what scripts/ci-gates.sh already
 * writes for gates that never started. Collapsing `not-run` or `cannot-run` into
 * anything a reader could mistake for a pass is the exact failure GATE-09 exists
 * to prevent, and a published format is where that collapse would otherwise
 * happen unnoticed.
 *
 * This script must never change the runner's exit code. scripts/ci-gates.sh
 * wraps every call to it in the same set +e / capture / warn structure it already
 * uses for the run-record writer: a status writer that can turn a red run green
 * is a defect.
 *
 * Dependency-free: node: builtins only. No subprocess, no network.
 */

import { readFileSync, existsSync, writeFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const SCRIPT_DIR = path.dirname(new URL(import.meta.url).pathname);
const APP_DIR = path.resolve(SCRIPT_DIR, '..');

const DEFAULT_MANIFEST = path.join(APP_DIR, 'gates.manifest.json');
const DEFAULT_RUN = path.join(APP_DIR, '.gate-runs', 'latest.json');
const DEFAULT_LOGS = path.join(APP_DIR, '.gate-runs', 'logs');
const DEFAULT_OUT = path.join(APP_DIR, 'gate-results.json');

/** The four legal gate statuses. Nothing else may reach the published file. */
const LEGAL_STATUSES = ['pass', 'fail', 'cannot-run', 'not-run'];

/** Exit 1 with PUBLISH FAILED. The caller treats this as a warning, not a run failure. */
function fail(message) {
  console.error('PUBLISH FAILED: ' + message);
  process.exit(1);
}

function readJson(filePath, label) {
  if (!existsSync(filePath)) {
    fail('no such ' + label + ' file: ' + filePath);
  }
  try {
    return JSON.parse(readFileSync(filePath, 'utf8'));
  } catch (err) {
    fail(label + ' at ' + filePath + ' is not valid JSON: ' + err.message);
  }
  return undefined;
}

// --- arguments --------------------------------------------------------------

const argv = process.argv.slice(2);
let runPath = DEFAULT_RUN;
let outPath = DEFAULT_OUT;

for (let i = 0; i < argv.length; i += 1) {
  const arg = argv[i];
  if (arg === '--run') {
    const v = argv[i + 1];
    if (!v) fail('--run requires a path argument');
    runPath = path.resolve(process.cwd(), v);
    i += 1;
  } else if (arg === '--out') {
    const v = argv[i + 1];
    if (!v) fail('--out requires a path argument');
    outPath = path.resolve(process.cwd(), v);
    i += 1;
  } else {
    fail('unknown argument: ' + arg + ' (only --run and --out exist)');
  }
}

// --- load -------------------------------------------------------------------

const manifest = readJson(DEFAULT_MANIFEST, 'manifest');
const run = readJson(runPath, 'run record');

if (!Array.isArray(manifest.gates)) fail('manifest has no gates array');
if (!Array.isArray(run.gates)) fail('run record at ' + runPath + ' has no gates array');

const observed = new Map();
for (const g of run.gates) {
  if (g && typeof g.id === 'string') observed.set(g.id, g);
}

// --- per-gate skip counts from the logs plan 03-04 writes -------------------

function skipCounts(gateId) {
  const logPath = path.join(DEFAULT_LOGS, gateId + '.log');
  if (!existsSync(logPath)) return { total: null, skipped: null };
  let text;
  try {
    text = readFileSync(logPath, 'utf8');
  } catch {
    return { total: null, skipped: null };
  }
  const m = /GATE-SKIPS total=(\d+) skipped=(\d+)/.exec(text);
  if (!m) return { total: null, skipped: null };
  return { total: Number(m[1]), skipped: Number(m[2]) };
}

if (existsSync(DEFAULT_LOGS)) {
  try {
    readdirSync(DEFAULT_LOGS);
  } catch (err) {
    fail('could not scan log directory ' + DEFAULT_LOGS + ': ' + err.message);
  }
}

// --- seconds between two ISO stamps, or null --------------------------------

function durationSeconds(startedAt, endedAt) {
  if (!startedAt || !endedAt) return null;
  const a = Date.parse(startedAt);
  const b = Date.parse(endedAt);
  if (Number.isNaN(a) || Number.isNaN(b)) return null;
  return Math.round((b - a) / 1000);
}

// --- gates ------------------------------------------------------------------

const orderedGates = manifest.gates
  .filter((g) => g && typeof g.id === 'string')
  .slice()
  .sort((a, b) => (a.order || 0) - (b.order || 0));

const gates = [];
let gatesRun = 0;

for (const gate of orderedGates) {
  const seen = observed.get(gate.id);
  // Verbatim. A gate the runner never reached is not-run; nothing is defaulted
  // to anything friendlier.
  const status = seen && typeof seen.status === 'string' ? seen.status : 'not-run';
  if (status === 'pass' || status === 'fail') gatesRun += 1;

  const startedAt = seen && seen.started_at ? seen.started_at : null;
  const endedAt = seen && seen.ended_at ? seen.ended_at : null;
  const counts = skipCounts(gate.id);

  gates.push({
    id: gate.id,
    name: gate.name,
    order: gate.order,
    blocking: gate.blocking,
    proves: gate.proves,
    requirements: Array.isArray(gate.requirements) ? gate.requirements.slice() : [],
    status,
    exit_code: seen && seen.exit_code !== undefined ? seen.exit_code : null,
    started_at: startedAt,
    ended_at: endedAt,
    duration_seconds: durationSeconds(startedAt, endedAt),
    assertions_total: counts.total,
    assertions_skipped: counts.skipped,
  });
}

// --- requirements roll-up ---------------------------------------------------

const requirementOrder = [];
const requirementGates = new Map();

for (const g of gates) {
  for (const req of g.requirements) {
    if (!requirementGates.has(req)) {
      requirementGates.set(req, []);
      requirementOrder.push(req);
    }
    requirementGates.get(req).push(g.id);
  }
}

const requirements = requirementOrder.map((id) => {
  const gateIds = requirementGates.get(id);
  const statuses = gateIds.map((gid) => gates.find((g) => g.id === gid).status);
  let status;
  if (statuses.some((s) => s === 'fail')) {
    status = 'fail';
  } else if (statuses.every((s) => s === 'pass')) {
    status = 'pass';
  } else {
    // cannot-run and not-run never roll up to pass. There is no fourth value.
    status = 'incomplete';
  }
  return { id, gates: gateIds, status };
});

// --- write ------------------------------------------------------------------

const results = {
  schema: 1,
  generated_at: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
  run: {
    started_at: run.started_at !== undefined ? run.started_at : null,
    ended_at: run.ended_at !== undefined ? run.ended_at : null,
    outcome: run.outcome !== undefined ? run.outcome : null,
    failure_signature: run.failure_signature !== undefined ? run.failure_signature : null,
    manifest_version: run.manifest_version !== undefined ? run.manifest_version : null,
    gates_total: run.gates_total !== undefined ? run.gates_total : gates.length,
    gates_run: gatesRun,
  },
  gates,
  requirements,
};

for (const g of gates) {
  if (!LEGAL_STATUSES.includes(g.status)) {
    fail(
      'gate ' + g.id + ' carries status ' + JSON.stringify(g.status) +
        ' which is not one of pass, fail, cannot-run, not-run',
    );
  }
}

try {
  writeFileSync(outPath, JSON.stringify(results, null, 2) + '\n');
} catch (err) {
  fail('could not write ' + outPath + ': ' + err.message);
}

console.log(
  'RESULTS PUBLISHED — ' + gates.length + ' gates, outcome ' +
    JSON.stringify(results.run.outcome) + ', ' + requirements.length + ' requirements',
);
process.exit(0);
