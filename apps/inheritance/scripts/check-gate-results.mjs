#!/usr/bin/env node
/**
 * check-gate-results.mjs — validate the published gate results (GATE-08).
 *
 *   node scripts/check-gate-results.mjs
 *   node scripts/check-gate-results.mjs --results <path> --run <path>
 *
 * gate-results.json is the committed, machine-readable join of the frozen
 * manifest, the run record and the per-gate skip logs. A published file that is
 * out of date, incomplete, or carrying a status this project does not use is
 * worse than no published file at all, because it looks current. This gate is
 * what makes it not look current.
 *
 * Verdicts, each with its own literal marker, all collected before exiting once:
 *
 *   1. RESULTS MISSING            — gate-results.json does not exist
 *   2. RESULTS UNREADABLE         — it is not parseable JSON, or schema is not 1
 *   3. RESULTS STALE              — its run.started_at differs from the run record's
 *   4. RESULTS INCOMPLETE         — a manifest gate is absent from `gates`, a gate
 *                                   entry is missing one of the thirteen required
 *                                   keys, or a gate other than G9 is `not-run`
 *   5. RESULTS STATUS INVALID     — a gate status outside pass / fail / cannot-run /
 *                                   not-run, or a requirement status outside
 *                                   pass / fail / incomplete
 *   6. RESULTS REQUIREMENT DRIFT  — a requirement id in a manifest gate with no
 *                                   entry in the results roll-up, or the reverse
 *
 * G9 is exempt from the `not-run` condition of check 4, and from that condition
 * only, because this check IS gate G9: its own run-record entry is still being
 * written while it runs.
 *
 * The value `skipped` is deliberately named in check 5's rejection set. It is the
 * plausible-looking status this project does not use, and accepting it would be
 * exactly the collapse of "skipped" into "passed" that GATE-09 exists to prevent.
 *
 * This script NEVER writes gate-results.json. Only scripts/publish-gate-results.mjs
 * writes it, and this script has no flag of any kind that repairs or regenerates
 * anything. Its only two flags are --results and --run, both read-only path
 * overrides.
 *
 * Dependency-free: node: builtins only. Exit 0 on zero violations, 1 otherwise.
 */

import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const SCRIPT_DIR = path.dirname(new URL(import.meta.url).pathname);
const APP_DIR = path.resolve(SCRIPT_DIR, '..');

const DEFAULT_MANIFEST = path.join(APP_DIR, 'gates.manifest.json');
const DEFAULT_RESULTS = path.join(APP_DIR, 'gate-results.json');
const DEFAULT_RUN = path.join(APP_DIR, '.gate-runs', 'latest.json');

/** The gate this script itself backs. Exempt from the not-run condition only. */
const SELF_GATE_ID = 'G9';

const LEGAL_GATE_STATUSES = ['pass', 'fail', 'cannot-run', 'not-run'];
const LEGAL_REQUIREMENT_STATUSES = ['pass', 'fail', 'incomplete'];

const REQUIRED_GATE_KEYS = [
  'id',
  'name',
  'order',
  'blocking',
  'proves',
  'requirements',
  'status',
  'exit_code',
  'started_at',
  'ended_at',
  'duration_seconds',
  'assertions_total',
  'assertions_skipped',
];

const violations = [];

function readJsonOrNull(filePath) {
  if (!existsSync(filePath)) return { ok: false, reason: 'missing' };
  try {
    return { ok: true, value: JSON.parse(readFileSync(filePath, 'utf8')) };
  } catch (err) {
    return { ok: false, reason: err.message };
  }
}

// --- arguments --------------------------------------------------------------

const argv = process.argv.slice(2);
let resultsPath = DEFAULT_RESULTS;
let runPath = DEFAULT_RUN;

for (let i = 0; i < argv.length; i += 1) {
  const arg = argv[i];
  if (arg === '--results') {
    const v = argv[i + 1];
    if (!v) {
      console.error('RESULTS UNREADABLE: --results requires a path argument');
      process.exit(1);
    }
    resultsPath = path.resolve(process.cwd(), v);
    i += 1;
  } else if (arg === '--run') {
    const v = argv[i + 1];
    if (!v) {
      console.error('RESULTS UNREADABLE: --run requires a path argument');
      process.exit(1);
    }
    runPath = path.resolve(process.cwd(), v);
    i += 1;
  } else {
    console.error('RESULTS UNREADABLE: unknown argument ' + arg + ', only --results and --run exist');
    process.exit(1);
  }
}

// --- manifest ---------------------------------------------------------------

const manifestRead = readJsonOrNull(DEFAULT_MANIFEST);
if (!manifestRead.ok) {
  console.error('RESULTS UNREADABLE: manifest at ' + DEFAULT_MANIFEST + ': ' + manifestRead.reason);
  process.exit(1);
}
const manifest = manifestRead.value;
if (!Array.isArray(manifest.gates)) {
  console.error('RESULTS UNREADABLE: manifest has no gates array');
  process.exit(1);
}

// --- check 1 and 2 ----------------------------------------------------------

const resultsRead = readJsonOrNull(resultsPath);

if (!resultsRead.ok && resultsRead.reason === 'missing') {
  console.error('');
  console.error('RESULTS MISSING: no published results at ' + resultsPath);
  console.error('Run bash scripts/ci-gates.sh, which publishes on every exit path.');
  emitAccounting();
  process.exit(1);
}

if (!resultsRead.ok) {
  console.error('');
  console.error('RESULTS UNREADABLE: ' + resultsPath + ' is not valid JSON: ' + resultsRead.reason);
  emitAccounting();
  process.exit(1);
}

const results = resultsRead.value;

if (results.schema !== 1) {
  violations.push(
    'RESULTS UNREADABLE: ' + resultsPath + ' declares schema ' + JSON.stringify(results.schema) +
      ', expected the integer 1',
  );
}

const resultGates = Array.isArray(results.gates) ? results.gates : [];
const resultRequirements = Array.isArray(results.requirements) ? results.requirements : [];

if (!Array.isArray(results.gates)) {
  violations.push('RESULTS UNREADABLE: ' + resultsPath + ' has no gates array');
}
if (!Array.isArray(results.requirements)) {
  violations.push('RESULTS UNREADABLE: ' + resultsPath + ' has no requirements array');
}

// --- check 3: staleness -----------------------------------------------------

const runRead = readJsonOrNull(runPath);
if (!runRead.ok) {
  violations.push(
    'RESULTS UNREADABLE: run record at ' + runPath + ': ' + runRead.reason +
      ' — staleness cannot be judged without it',
  );
} else {
  const recordStarted = runRead.value.started_at;
  const publishedStarted = results.run && results.run.started_at;
  if (recordStarted !== publishedStarted) {
    violations.push(
      'RESULTS STALE: published run.started_at is ' + JSON.stringify(publishedStarted) +
        ' but the run record says ' + JSON.stringify(recordStarted) +
        ' — a results file describing an earlier run is worse than none, because it looks current',
    );
  }
}

// --- check 4 and 5: per gate ------------------------------------------------

const byId = new Map();
for (const g of resultGates) {
  if (g && typeof g.id === 'string') byId.set(g.id, g);
}

for (const gate of manifest.gates) {
  if (!gate || typeof gate.id !== 'string') continue;
  const published = byId.get(gate.id);

  if (!published) {
    violations.push(
      'RESULTS INCOMPLETE: manifest gate ' + gate.id + ' has no entry in ' + resultsPath,
    );
    continue;
  }

  for (const key of REQUIRED_GATE_KEYS) {
    if (!Object.prototype.hasOwnProperty.call(published, key)) {
      violations.push(
        'RESULTS INCOMPLETE: gate ' + gate.id + ' entry is missing the required key ' + key,
      );
    }
  }

  if (!LEGAL_GATE_STATUSES.includes(published.status)) {
    violations.push(
      'RESULTS STATUS INVALID: gate ' + gate.id + ' carries status ' +
        JSON.stringify(published.status) + ', which is not one of pass, fail, cannot-run, not-run',
    );
  } else if (published.status === 'not-run' && gate.id !== SELF_GATE_ID) {
    violations.push(
      'RESULTS INCOMPLETE: gate ' + gate.id + ' is not-run in the published results — ' +
        'a gate that never executed is not a gate that passed',
    );
  }
}

for (const g of resultGates) {
  if (!g || typeof g.id !== 'string') {
    violations.push('RESULTS INCOMPLETE: a published gate entry has no id');
  }
}

// --- check 5 and 6: requirements --------------------------------------------

const manifestRequirements = new Set();
for (const gate of manifest.gates) {
  if (!gate || !Array.isArray(gate.requirements)) continue;
  for (const req of gate.requirements) manifestRequirements.add(req);
}

const publishedRequirements = new Set();
for (const q of resultRequirements) {
  if (!q || typeof q.id !== 'string') {
    violations.push('RESULTS INCOMPLETE: a published requirement entry has no id');
    continue;
  }
  publishedRequirements.add(q.id);
  if (!LEGAL_REQUIREMENT_STATUSES.includes(q.status)) {
    violations.push(
      'RESULTS STATUS INVALID: requirement ' + q.id + ' carries status ' +
        JSON.stringify(q.status) + ', which is not one of pass, fail, incomplete',
    );
  }
  if (!Array.isArray(q.gates)) {
    violations.push('RESULTS INCOMPLETE: requirement ' + q.id + ' has no gates array');
  }
}

for (const req of manifestRequirements) {
  if (!publishedRequirements.has(req)) {
    violations.push(
      'RESULTS REQUIREMENT DRIFT: ' + req + ' is carried by a manifest gate but has no entry ' +
        'in the published requirements roll-up',
    );
  }
}
for (const req of publishedRequirements) {
  if (!manifestRequirements.has(req)) {
    violations.push(
      'RESULTS REQUIREMENT DRIFT: ' + req + ' appears in the published requirements roll-up ' +
        'but no manifest gate carries it',
    );
  }
}

// --- verdict ----------------------------------------------------------------

function emitAccounting() {
  console.log('GATE-SKIPS total=' + manifest.gates.length + ' skipped=0');
}

if (violations.length > 0) {
  console.error('');
  console.error('=========================================================');
  console.error('PUBLISHED GATE RESULTS REJECTED');
  console.error('=========================================================');
  console.error('');
  for (const v of violations) {
    console.error(v);
  }
  console.error('');
  console.error('gate-results.json is written only by scripts/publish-gate-results.mjs,');
  console.error('which scripts/ci-gates.sh calls on every exit path. Re-run the gates.');
  console.error('The four statuses pass, fail, cannot-run and not-run are copied verbatim;');
  console.error('there is no fifth value and nothing collapses into a pass.');
  console.error('');
  emitAccounting();
  process.exit(1);
}

console.log(
  'RESULTS OK — ' + resultGates.length + ' gates, ' + resultRequirements.length + ' requirements',
);
emitAccounting();
process.exit(0);
