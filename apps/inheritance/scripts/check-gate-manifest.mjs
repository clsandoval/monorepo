#!/usr/bin/env node
/**
 * check-gate-manifest.mjs — the gate-manifest integrity check.
 *
 *   node scripts/check-gate-manifest.mjs
 *   node scripts/check-gate-manifest.mjs --manifest <path> --lock <path>
 *
 * The test ledger (frontend/test-baseline.json) may only SHRINK. The gate set is
 * the exact inverse: it may only GROW. gates.manifest.lock records the
 * {id, command, blocking} triple of every gate at the moment the owner froze it,
 * and this script fails the build when a locked gate disappears, when its command
 * string changes, or when a blocking gate stops blocking.
 *
 * Violations, each with its own literal marker so a failure says which rule broke:
 *
 *   1. GATE REMOVED          — a locked id has no gate in the manifest
 *   2. GATE COMMAND CHANGED  — a locked id's command string differs
 *   3. GATE WEAKENED         — a locked blocking:true gate is now blocking:false
 *   4. MALFORMED GATE        — a manifest gate is structurally invalid
 *   5. UNLOCKED GATE         — a manifest gate that is not in the lock at all
 *
 * UNLOCKED GATE is a violation rather than a silent pass on purpose: a gate that
 * runs but is not frozen can be deleted next week without tripping check 1.
 *
 * This script NEVER writes either file, and has no flag of any kind that rewrites,
 * repairs, or regenerates the manifest or the lock. A check that can rewrite its
 * own baseline is not a check. Adding such a flag would defeat the lock entirely.
 * The only two flags are --manifest and --lock, both read-only path overrides.
 *
 * Dependency-free: node: builtins only. Exit 0 on zero violations, 1 otherwise.
 */

import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const SCRIPT_DIR = path.dirname(new URL(import.meta.url).pathname);
const APP_DIR = path.resolve(SCRIPT_DIR, '..');

const DEFAULT_MANIFEST = path.join(APP_DIR, 'gates.manifest.json');
const DEFAULT_LOCK = path.join(APP_DIR, 'gates.manifest.lock');

const REQUIRED_GATE_KEYS = [
  'id',
  'name',
  'order',
  'command',
  'cwd',
  'precondition',
  'blocking',
  'proves',
  'requirements',
];

/** Exit 1 with MANIFEST UNREADABLE. Never exit 0 on an internal error. */
function unreadable(message) {
  console.error('MANIFEST UNREADABLE: ' + message);
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
  } else {
    unreadable('unknown argument: ' + arg + ' (only --manifest and --lock exist)');
  }
}

// --- load -------------------------------------------------------------------

const manifest = readJson(manifestPath, 'manifest');
const lock = readJson(lockPath, 'lock');

if (!Array.isArray(manifest.gates)) {
  unreadable('manifest at ' + manifestPath + ' has no gates array');
}
if (!Array.isArray(lock.locked_gates)) {
  unreadable('lock at ' + lockPath + ' has no locked_gates array');
}

const violations = [];

const manifestById = new Map();
const duplicateIds = [];
for (const gate of manifest.gates) {
  const id = gate && typeof gate.id === 'string' ? gate.id : null;
  if (id === null) continue;
  if (manifestById.has(id)) {
    duplicateIds.push(id);
  } else {
    manifestById.set(id, gate);
  }
}

const lockById = new Map();
for (const entry of lock.locked_gates) {
  if (entry && typeof entry.id === 'string') lockById.set(entry.id, entry);
}

// Check 1 — GATE REMOVED.
for (const [id, locked] of lockById) {
  if (!manifestById.has(id)) {
    violations.push(
      'GATE REMOVED: ' + id + '\n' +
        '  Locked command: ' + JSON.stringify(locked.command) + '\n' +
        '  This gate is in gates.manifest.lock but absent from the manifest.\n' +
        '  The gate set may only grow. Restore the gate; do not edit the lock.',
    );
  }
}

// Check 2 — GATE COMMAND CHANGED.
for (const [id, locked] of lockById) {
  const gate = manifestById.get(id);
  if (gate === undefined) continue;
  if (gate.command !== locked.command) {
    violations.push(
      'GATE COMMAND CHANGED: ' + id + '\n' +
        '  Locked : ' + JSON.stringify(locked.command) + '\n' +
        '  Current: ' + JSON.stringify(gate.command) + '\n' +
        '  A locked command string is frozen. Swapping a strict command for a\n' +
        '  lenient one is the exact failure this check exists to catch.',
    );
  }
}

// Check 3 — GATE WEAKENED.
for (const [id, locked] of lockById) {
  const gate = manifestById.get(id);
  if (gate === undefined) continue;
  if (locked.blocking === true && gate.blocking !== true) {
    violations.push(
      'GATE WEAKENED: ' + id + '\n' +
        '  Locked blocking: true, current blocking: ' + JSON.stringify(gate.blocking) + '\n' +
        '  A blocking gate may not be made non-blocking. Report BLOCKED instead.',
    );
  }
}

// Check 4 — MALFORMED GATE.
for (const id of duplicateIds) {
  violations.push(
    'MALFORMED GATE: duplicate id ' + id + '\n' +
      '  Two gates share the same id. Gate ids must be unique and permanent.',
  );
}
for (let i = 0; i < manifest.gates.length; i += 1) {
  const gate = manifest.gates[i];
  const label = gate && typeof gate.id === 'string' ? gate.id : 'gates[' + i + ']';
  if (gate === null || typeof gate !== 'object' || Array.isArray(gate)) {
    violations.push('MALFORMED GATE: ' + label + '\n  Gate entry is not an object.');
    continue;
  }
  const missing = REQUIRED_GATE_KEYS.filter((k) => !Object.prototype.hasOwnProperty.call(gate, k));
  if (missing.length > 0) {
    violations.push(
      'MALFORMED GATE: ' + label + '\n' +
        '  Missing required key(s): ' + missing.join(', ') + '\n' +
        '  Every gate needs all of: ' + REQUIRED_GATE_KEYS.join(', '),
    );
  }
  if (!Number.isInteger(gate.order)) {
    violations.push(
      'MALFORMED GATE: ' + label + '\n' +
        '  order must be an integer, got ' + JSON.stringify(gate.order),
    );
  }
  if (typeof gate.command !== 'string' || gate.command.trim() === '') {
    violations.push(
      'MALFORMED GATE: ' + label + '\n' +
        '  command must be a non-empty string, got ' + JSON.stringify(gate.command),
    );
  }
}

// Check 5 — UNLOCKED GATE.
for (const [id, gate] of manifestById) {
  if (!lockById.has(id)) {
    violations.push(
      'UNLOCKED GATE: ' + id + '\n' +
        '  Command: ' + JSON.stringify(gate.command) + '\n' +
        '  This gate runs but is not frozen, so it could be deleted later without\n' +
        '  tripping GATE REMOVED. Append this entry to gates.manifest.lock:\n' +
        '    { "id": ' + JSON.stringify(id) + ', "command": ' + JSON.stringify(gate.command) +
        ', "blocking": ' + JSON.stringify(gate.blocking) + ' }',
    );
  }
}


// --- GATE-09 skip accounting ------------------------------------------------
// total  = gates in the manifest
// skipped = manifest gates not comparable against the lock (no usable id)
// Printed on EVERY exit path: a skip report that only appears on success says
// nothing about the run that needs investigating.
function reportSkips() {
  const total = Array.isArray(manifest.gates) ? manifest.gates.length : 0;
  const skipped = total - manifestById.size;
  console.log('GATE-SKIPS total=' + total + ' skipped=' + skipped);
}

// --- verdict ----------------------------------------------------------------

if (violations.length > 0) {
  console.error('');
  console.error('=========================================================');
  console.error('GATE MANIFEST CHECK FAILED — ' + violations.length + ' violation(s)');
  console.error('=========================================================');
  console.error('  manifest: ' + manifestPath);
  console.error('  lock    : ' + lockPath);
  for (const v of violations) {
    console.error('');
    console.error(v);
  }
  console.error('');
  console.error('The gate set may only grow. Never remove, rename, retarget, or');
  console.error('un-block a gate to make a run green — report BLOCKED instead.');
  console.error('');
  reportSkips();
  process.exit(1);
}

console.log(
  'MANIFEST OK — ' + manifest.gates.length + ' gates, ' + lock.locked_gates.length + ' locked',
);
reportSkips();
process.exit(0);
