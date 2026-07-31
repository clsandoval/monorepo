#!/usr/bin/env node
/**
 * loop-status.mjs — the visible signal that a loop has stopped making progress.
 *
 *   node scripts/loop-status.mjs record --run .gate-runs/latest.json
 *   node scripts/loop-status.mjs check
 *
 * PROJECT.md is explicit: a month of slow autonomous implementation is
 * acceptable, a stalled loop is not, and the owner's attention is scarce and
 * non-recurring. The realistic failure is not a crash — it is a loop that keeps
 * running, keeps producing output, and keeps hitting the same wall for days.
 *
 * So every gate run appends one line to a bounded, committed history, and a
 * committed one-screen status file is regenerated from it with a state banner
 * the owner reads without polling anything.
 *
 * THE STALL RULE is fixed, not discovered:
 *
 *   STALLED when the most recent 3 records are all non-`pass` AND share an
 *   identical failure_signature; or when the most recent 5 records are all
 *   non-`pass` regardless of signature.
 *
 * State precedence: STALLED > BLOCKED > RED > GREEN > UNKNOWN. One consequence
 * is intended: a single passing run after a failing streak yields GREEN
 * immediately, because the rule requires the MOST RECENT records to be non-pass.
 * A banner that stayed red after recovery would train the owner to ignore it.
 *
 * `check` exits 1 on STALLED and is deliberately NOT invoked by
 * scripts/ci-gates.sh: a stall detector that fails the gate run would make the
 * stall self-perpetuating, since the next run would then also be non-pass.
 *
 * NO NOTIFICATION CHANNEL IS INVENTED HERE. None is configured in this
 * repository, and inventing one would be an ungrounded decision. The signal is
 * the committed file plus the CI check that already fails on any nonzero runner
 * exit — which GitHub pushes to the owner without polling.
 *
 * Dependency-free: node: builtins only. No subprocess, no network.
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const SCRIPT_DIR = path.dirname(new URL(import.meta.url).pathname);
const APP_DIR = path.resolve(SCRIPT_DIR, '..');
const DEFAULT_HISTORY = path.join(APP_DIR, 'loop-history.jsonl');
const DEFAULT_STATUS = path.join(APP_DIR, 'LOOP-STATUS.md');

/** Bounded history: one line per run, oldest lines dropped beyond this. */
const HISTORY_CAP = 200;

/** The two windows of the stall rule. Fixed; not configurable. */
const IDENTICAL_SIGNATURE_WINDOW = 3;
const ANY_SIGNATURE_WINDOW = 5;

const REACHED = new Set(['pass', 'fail', 'cannot-run']);

function fatal(message) {
  console.error(message);
  process.exit(1);
}

function readHistory(historyPath) {
  if (!existsSync(historyPath)) return [];
  let raw;
  try {
    raw = readFileSync(historyPath, 'utf8');
  } catch (err) {
    fatal('LOOP HISTORY UNREADABLE: ' + historyPath + ': ' + err.message);
  }
  const entries = [];
  let lineNo = 0;
  for (const line of raw.split('\n')) {
    lineNo += 1;
    if (line.trim() === '') continue;
    try {
      entries.push(JSON.parse(line));
    } catch (err) {
      fatal(
        'LOOP HISTORY UNREADABLE: ' + historyPath + ':' + lineNo +
          ' is not valid JSON: ' + err.message,
      );
    }
  }
  return entries;
}

/** Length of the trailing run of non-pass entries. */
function streakLength(entries) {
  let n = 0;
  for (let i = entries.length - 1; i >= 0; i -= 1) {
    if (entries[i].outcome === 'pass') break;
    n += 1;
  }
  return n;
}

function computeState(entries) {
  if (entries.length === 0) return 'UNKNOWN';

  const tail = (k) => entries.slice(-k);

  if (entries.length >= IDENTICAL_SIGNATURE_WINDOW) {
    const w = tail(IDENTICAL_SIGNATURE_WINDOW);
    const allNonPass = w.every((e) => e.outcome !== 'pass');
    const sig = w[0].failure_signature;
    const sameSig = w.every((e) => e.failure_signature === sig);
    if (allNonPass && sameSig) return 'STALLED';
  }
  if (entries.length >= ANY_SIGNATURE_WINDOW) {
    const w = tail(ANY_SIGNATURE_WINDOW);
    if (w.every((e) => e.outcome !== 'pass')) return 'STALLED';
  }

  const last = entries[entries.length - 1];
  if (last.outcome === 'cannot-run') return 'BLOCKED';
  if (last.outcome === 'fail') return 'RED';
  if (last.outcome === 'pass') return 'GREEN';
  return 'UNKNOWN';
}

const WHAT_TO_DO = {
  GREEN:
    'Nothing. The most recent gate run executed the whole frozen manifest and passed.',
  RED:
    'A gate ran and failed. Read the failing gate in the table above, then see GATES.md\n' +
    'section 1 for what that gate proves. Fix the product; never weaken the gate.',
  BLOCKED:
    'A gate COULD NOT RUN (runner exit code 2). This is a halt, not a failure to route\n' +
    'around. Report BLOCKED using the five-field template in\n' +
    '`.planning/PLAN-STANDARD.md` section 3, pasting the real command output. Editing a\n' +
    'gate, a precondition, the manifest or a test to clear the halt is prohibited.',
  STALLED:
    'The loop has repeated the same failure and is no longer making progress. A HUMAN\n' +
    'DECISION IS NOW REQUIRED — further unattended runs will keep producing this same\n' +
    'result. See the repeating signature above and GATES.md section 4.',
  UNKNOWN:
    'No gate run has been recorded yet. Run `bash scripts/ci-gates.sh`.',
};

function renderStatus(state, entries, runRecord, historyPath) {
  const last = entries.length > 0 ? entries[entries.length - 1] : null;
  const streak = streakLength(entries);
  const needsAttention = state === 'STALLED' || state === 'BLOCKED';

  const out = [];
  // Line 1 is the generated-file notice and line 2 is the state banner, so the
  // state token is visible in the first two lines of any diff or preview.
  out.push('<!-- GENERATED FILE — do not hand-edit. Rewritten by `node scripts/loop-status.mjs record` on every full gate run. -->');
  out.push(
    '# LOOP STATUS: ' + state + (needsAttention ? ' — NEEDS OWNER ATTENTION' : ''),
  );
  out.push('');

  if (last === null) {
    out.push('No run has been recorded yet.');
  } else {
    out.push(
      'Last run ' + last.ts + ' — outcome `' + last.outcome + '`, signature `' +
        (last.failure_signature === '' ? '(none)' : last.failure_signature) + '`, ' +
        last.gates_run + '/' + last.gates_total + ' gates reached.',
    );
  }
  out.push('');

  if (runRecord !== null && Array.isArray(runRecord.gates)) {
    out.push('| gate | name | status | exit |');
    out.push('|---|---|---|---|');
    for (const g of runRecord.gates) {
      const code = g.exit_code === null || g.exit_code === undefined ? '-' : String(g.exit_code);
      // The run-record schema frozen by plan 02-04 carries no gate name, and this
      // script deliberately does not read the manifest, so the name is rendered
      // only when a record supplies one.
      out.push('| ' + g.id + ' | ' + (g.name || '—') + ' | ' + g.status + ' | ' + code + ' |');
    }
    out.push('');
  }

  if (streak > 0 && last !== null) {
    out.push(
      '**Consecutive non-pass runs: ' + streak + '**, most recent signature `' +
        (last.failure_signature === '' ? '(none)' : last.failure_signature) + '`.',
    );
    out.push('');
    out.push(
      'The stall rule: ' + IDENTICAL_SIGNATURE_WINDOW +
        ' consecutive non-pass runs sharing one signature, or ' + ANY_SIGNATURE_WINDOW +
        ' consecutive non-pass runs regardless of signature.',
    );
    out.push('');
  }

  out.push('## What to do');
  out.push('');
  out.push(WHAT_TO_DO[state] || WHAT_TO_DO.UNKNOWN);
  out.push('');
  out.push('---');
  out.push('');
  out.push(
    'History: `' + path.relative(APP_DIR, historyPath) + '`, ' + entries.length +
      ' of a maximum ' + HISTORY_CAP + ' records (oldest are dropped beyond the cap).',
  );
  out.push(
    'For a scripted answer: `node scripts/loop-status.mjs check` — exit 1 when the state is STALLED.',
  );
  out.push('');
  return out.join('\n');
}

// --- arguments --------------------------------------------------------------

const argv = process.argv.slice(2);
const sub = argv[0];
let runPath = null;
let historyPath = DEFAULT_HISTORY;
let statusPath = DEFAULT_STATUS;

for (let i = 1; i < argv.length; i += 1) {
  const arg = argv[i];
  if (arg === '--run') {
    const v = argv[i + 1];
    if (!v) fatal('RUN RECORD UNREADABLE: --run requires a path argument');
    runPath = path.resolve(process.cwd(), v);
    i += 1;
  } else if (arg === '--history') {
    const v = argv[i + 1];
    if (!v) fatal('LOOP HISTORY UNREADABLE: --history requires a path argument');
    historyPath = path.resolve(process.cwd(), v);
    i += 1;
  } else if (arg === '--status') {
    const v = argv[i + 1];
    if (!v) fatal('LOOP STATUS UNWRITABLE: --status requires a path argument');
    statusPath = path.resolve(process.cwd(), v);
    i += 1;
  } else {
    fatal('unknown argument: ' + arg + ' (only --run, --history and --status exist)');
  }
}

if (sub !== 'record' && sub !== 'check') {
  fatal('usage: loop-status.mjs record --run <path> | loop-status.mjs check [--history <path>]');
}

if (sub === 'check') {
  if (!existsSync(historyPath)) {
    fatal('LOOP HISTORY UNREADABLE: no such file: ' + historyPath);
  }
  const entries = readHistory(historyPath);
  const state = computeState(entries);
  console.log('LOOP STATUS ' + state + ' — ' + entries.length + ' record(s), streak ' + streakLength(entries));
  process.exit(state === 'STALLED' ? 1 : 0);
}

// --- record -----------------------------------------------------------------

if (runPath === null) {
  fatal('RUN RECORD UNREADABLE: `record` requires --run <path>');
}
if (!existsSync(runPath)) {
  fatal('RUN RECORD UNREADABLE: no such file: ' + runPath);
}

let runRecord;
try {
  runRecord = JSON.parse(readFileSync(runPath, 'utf8'));
} catch (err) {
  fatal('RUN RECORD UNREADABLE: ' + runPath + ' is not valid JSON: ' + err.message);
}

const gatesRun = (runRecord.gates || []).filter((g) => REACHED.has(g.status)).length;
const entry = {
  ts: runRecord.ended_at,
  outcome: runRecord.outcome,
  failure_signature: runRecord.failure_signature,
  gates_run: gatesRun,
  gates_total: runRecord.gates_total,
  only: runRecord.only || '',
};

const entries = readHistory(historyPath);
entries.push(entry);
const bounded = entries.slice(-HISTORY_CAP);
writeFileSync(historyPath, bounded.map((e) => JSON.stringify(e)).join('\n') + '\n');

const state = computeState(bounded);
writeFileSync(statusPath, renderStatus(state, bounded, runRecord, historyPath));

console.log(
  'LOOP STATUS ' + state + ' — recorded ' + entry.outcome + ' (' + bounded.length +
    '/' + HISTORY_CAP + ' records)',
);
process.exit(0);
