#!/usr/bin/env node
/**
 * check-planning-truth.mjs — re-derives every count the planning directory
 * states from the filesystem, and fails when a document disagrees.
 *
 *   node scripts/check-planning-truth.mjs
 *   node scripts/check-planning-truth.mjs --roadmap <path>
 *   node scripts/check-planning-truth.mjs --state <path>
 *   node scripts/check-planning-truth.mjs --orientation <path>
 *   node scripts/check-planning-truth.mjs --resume <path>
 *
 * EXT-08 asks that a returning owner can determine current state, what is
 * verified and what is next from the planning directory alone. The reason they
 * could not is measurable rather than impressionistic: every number in that
 * directory is written by hand at a phase boundary and then never touched again,
 * so `RESUME.md` went stale within four days of being written and the ROADMAP
 * Progress table drifted on seven of its fifteen rows.
 *
 * A hand-written orientation page therefore cannot be the fix on its own. This
 * check is the other half: it counts `*-PLAN.md` and `*-SUMMARY.md` files under
 * `.planning/phases/`, reads the length of `gates.manifest.json`'s `gates`
 * array, and compares those derived values against the four documents a
 * returning owner actually reads. Nothing is hardcoded — not the phase count,
 * not the plan count, not the gate count.
 *
 * A phase's STATUS IS DERIVED BY COUNTING FILES, never judged:
 *
 *   plans == 0 && summaries == 0            -> Not started
 *   plans  > 0 && summaries == 0            -> Planned
 *   plans  > 0 && summaries == plans        -> Complete
 *   plans  > 0 && summaries != plans        -> Executed
 *
 * THE ONE EXEMPTION, and why it is asymmetric. The phase currently under
 * execution — identified from `.planning/STATE.md`'s `Phase: <N>` line, never
 * guessed — necessarily moves its own row while it runs: each landing summary
 * changes the numerator. Demanding exact equality there would paint the build
 * red at every plan boundary for a bookkeeping reason and stall an unattended
 * loop. So the in-flight phase's NUMERATOR may under-report. It may never
 * over-report: a row claiming work that does not exist is the exact failure this
 * check exists to catch, and `ROADMAP OVER CLAIMS` is never relaxed. The
 * denominator is checked exactly for every phase including the in-flight one.
 * The exemption is PRINTED ON EVERY RUN, pass or fail, so it is never silent.
 *
 * Violations, each with its own literal marker:
 *
 *   ROADMAP PLAN COUNT        — a Progress-table row's counts differ from its phase directory
 *   ROADMAP OVER CLAIMS       — the in-flight row reports more completed plans than there are summaries
 *   ROADMAP STATUS DISAGREES  — a row's status or checkbox differs from the derived status
 *   STATE PLAN COUNT          — a `progress:` counter differs from the derived value
 *   STATE PERCENT DRIFT       — `percent` or the body's progress-bar percentage disagrees
 *   ORIENTATION POINTER BROKEN— a named path does not resolve, or a required path is absent
 *   ORIENTATION GATE COUNT    — a stated gate count differs from gates.manifest.json
 *   PLANNING TRUTH UNREADABLE — an input is missing or unparseable; exits 2, not 1
 *
 * The exit contract is three-valued on purpose. Exit 2 is a cannot-run condition
 * and is deliberately distinct from exit 1, matching the `GATE CANNOT RUN` /
 * failure split in `.planning/PLAN-STANDARD.md` section 3.
 *
 * This check NEVER decides whether a phase went well. It counts files. A phase
 * whose requirements are blocked on the lawyer still has one summary per plan,
 * and the nuance lives in the phase's prose description, which this check does
 * not read and does not touch.
 *
 * Reads repo files only. No database, no socket, no subprocess. It writes no
 * file, and it has no repair, rewrite, self-update, acceptance or waiver flag of
 * any kind; its four flags are read-only path overrides so committed fixtures can
 * drive each failure path. (That sentence deliberately avoids spelling those flag
 * names literally, so a grep for them over this file returns zero — the audit for
 * "can this check rewrite its own input" is a grep, and a prose mention would be
 * a false positive.)
 *
 * Dependency-free: node: builtins only.
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const SCRIPT_DIR = path.dirname(new URL(import.meta.url).pathname);
const APP_DIR = path.resolve(SCRIPT_DIR, '..');

const PHASES_DIR = path.join(APP_DIR, '.planning', 'phases');
const MANIFEST_PATH = path.join(APP_DIR, 'gates.manifest.json');

const DEFAULTS = {
  roadmap: path.join(APP_DIR, '.planning', 'ROADMAP.md'),
  state: path.join(APP_DIR, '.planning', 'STATE.md'),
  orientation: path.join(APP_DIR, '.planning', 'ORIENTATION.md'),
  resume: path.join(APP_DIR, 'RESUME.md'),
};

/** Every path `.planning/ORIENTATION.md` must name, by section. */
const REQUIRED_POINTERS = [
  '.planning/STATE.md',
  '.planning/ROADMAP.md',
  'gate-results.json',
  'LOOP-STATUS.md',
  'GATES.md',
  'gates.manifest.json',
  '.planning/REQUIREMENTS.md',
  '.planning/BLOCKED-REQUIREMENTS.md',
  '.planning/DOC-DEBT.md',
  'engine/BUGS.md',
  'CLAUDE.md',
  '.planning/PLAN-STANDARD.md',
  '.planning/LEGAL-CORRECTION-WORKFLOW.md',
  '.planning/NEW-LEGAL-RULE.md',
];

const LEGAL_STATUSES = ['Not started', 'Planned', 'Complete', 'Executed'];

/** The derived-status rule, in ONE place so it cannot drift between call sites. */
function derivedStatus(plans, summaries) {
  if (plans === 0 && summaries === 0) return 'Not started';
  if (plans > 0 && summaries === 0) return 'Planned';
  if (plans > 0 && summaries === plans) return 'Complete';
  return 'Executed';
}

const violations = [];
function violation(marker, detail) {
  violations.push(`${marker} — ${detail}`);
}

/** Printed on EVERY exit path, success and failure alike. Gate G8 fails with
 *  SKIP REPORT MISSING on a log that lacks it. */
const MARKER_COUNT = 8;
function skipReport() {
  console.log(`GATE-SKIPS total=${MARKER_COUNT} skipped=0`);
}

function unreadable(message) {
  console.error(`PLANNING TRUTH UNREADABLE: ${message}`);
  skipReport();
  process.exit(2);
}

// --- argument parsing -------------------------------------------------------

function parseArgs(argv) {
  const out = { ...DEFAULTS };
  const flags = {
    '--roadmap': 'roadmap',
    '--state': 'state',
    '--orientation': 'orientation',
    '--resume': 'resume',
  };
  for (let i = 0; i < argv.length; i += 1) {
    const key = flags[argv[i]];
    if (!key) unreadable(`unrecognised argument '${argv[i]}'.`);
    const next = argv[i + 1];
    if (!next) unreadable(`${argv[i]} was given without a path.`);
    out[key] = path.resolve(process.cwd(), next);
    i += 1;
  }
  return out;
}

const PATHS = parseArgs(process.argv.slice(2));

// --- read inputs ------------------------------------------------------------

function read(label, p) {
  if (!existsSync(p)) unreadable(`${label} path ${p} does not exist.`);
  try {
    return readFileSync(p, 'utf8');
  } catch (err) {
    unreadable(`${label} path ${p} could not be read: ${err.message}`);
  }
  return '';
}

if (!existsSync(PHASES_DIR)) unreadable(`${PHASES_DIR} does not exist.`);
if (!existsSync(MANIFEST_PATH)) unreadable(`${MANIFEST_PATH} does not exist.`);

let manifest;
try {
  manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
} catch (err) {
  unreadable(`${MANIFEST_PATH} could not be parsed: ${err.message}`);
}
if (!manifest || !Array.isArray(manifest.gates)) {
  unreadable(`${MANIFEST_PATH} has no 'gates' array.`);
}
const GATE_COUNT = manifest.gates.length;

const roadmapText = read('roadmap', PATHS.roadmap);
const stateText = read('state', PATHS.state);
const orientationText = read('orientation', PATHS.orientation);
const resumeText = read('resume', PATHS.resume);

// --- derive from the filesystem ---------------------------------------------

const phases = new Map(); // phase number -> { dir, plans, summaries, status }
for (const entry of readdirSync(PHASES_DIR).sort()) {
  const abs = path.join(PHASES_DIR, entry);
  if (!statSync(abs).isDirectory()) continue;
  const m = /^(\d+)/.exec(entry);
  if (!m) continue;
  const n = Number(m[1]);
  const files = readdirSync(abs);
  const plans = files.filter((f) => /-PLAN\.md$/.test(f)).length;
  const summaries = files.filter((f) => /-SUMMARY\.md$/.test(f)).length;
  phases.set(n, { dir: entry, plans, summaries, status: derivedStatus(plans, summaries) });
}

if (phases.size === 0) unreadable(`${PHASES_DIR} holds no phase directory.`);

const totalPhases = phases.size;
const completePhases = [...phases.values()].filter((p) => p.status === 'Complete').length;
const totalPlans = [...phases.values()].reduce((a, p) => a + p.plans, 0);
const totalSummaries = [...phases.values()].reduce((a, p) => a + p.summaries, 0);

// --- the in-flight phase, read from STATE.md, never guessed ------------------

const inflightMatch = /^Phase:\s*(\d+)\b/m.exec(stateText);
if (!inflightMatch) {
  unreadable(
    `${PATHS.state} carries no '^Phase: <N>' line, so the in-flight phase cannot be identified. This check refuses to guess which phase is exempt.`,
  );
}
const IN_FLIGHT = Number(inflightMatch[1]);

console.log(
  `IN-FLIGHT PHASE ${IN_FLIGHT} — numerator relaxed, denominator and over-claim still checked`,
);

// --- 1/2/3. the ROADMAP Progress table and its checkboxes -------------------

const roadmapLines = roadmapText.split('\n');

const checkboxes = new Map(); // phase number -> boolean checked
for (const line of roadmapLines) {
  const m = /^- \[([x ])\] \*\*Phase (\d+)/.exec(line);
  if (m) checkboxes.set(Number(m[2]), m[1] === 'x');
}

const seenRows = new Set();
for (const line of roadmapLines) {
  if (!line.startsWith('| ')) continue;
  const cells = line.split('|').map((c) => c.trim());
  if (cells.length < 5) continue;
  const nameMatch = /^(\d+)\.\s/.exec(cells[1]);
  if (!nameMatch) continue;
  const n = Number(nameMatch[1]);
  const cell = cells[2];
  const status = cells[3];
  seenRows.add(n);

  const p = phases.get(n);
  if (!p) {
    violation(
      'ROADMAP PLAN COUNT',
      `the Progress table has a row for phase ${n} ('${cells[1]}') but .planning/phases/ has no directory for it.`,
    );
    continue;
  }

  const ratio = /^(\d+|TBD)\/(\d+|TBD)$/.exec(cell);
  if (!ratio) {
    violation(
      'ROADMAP PLAN COUNT',
      `phase ${n}'s 'Plans Complete' cell reads '${cell}', which is not '<summaries>/<plans>'. Counted: ${p.summaries}/${p.plans}.`,
    );
  } else {
    const num = ratio[1] === 'TBD' ? null : Number(ratio[1]);
    const den = ratio[2] === 'TBD' ? null : Number(ratio[2]);

    if (den !== p.plans) {
      violation(
        'ROADMAP PLAN COUNT',
        `phase ${n}'s 'Plans Complete' cell reads '${cell}' but .planning/phases/${p.dir}/ holds ${p.plans} plan file(s). Counted: ${p.summaries}/${p.plans}.`,
      );
    } else if (n === IN_FLIGHT) {
      // Exemption: the numerator may under-report, never over-report.
      if (num === null || num > p.summaries) {
        violation(
          'ROADMAP OVER CLAIMS',
          `phase ${n} is the in-flight phase and its row claims ${num === null ? "'TBD'" : num} completed plan(s), but .planning/phases/${p.dir}/ holds only ${p.summaries} summary file(s). Under-reporting the phase you are standing in is allowed; claiming work that does not exist is not.`,
        );
      }
    } else if (num !== p.summaries) {
      violation(
        'ROADMAP PLAN COUNT',
        `phase ${n}'s 'Plans Complete' cell reads '${cell}' but .planning/phases/${p.dir}/ holds ${p.summaries} summary file(s). Counted: ${p.summaries}/${p.plans}.`,
      );
    }
  }

  const checked = checkboxes.get(n);
  if (n === IN_FLIGHT) {
    if (!LEGAL_STATUSES.includes(status)) {
      violation(
        'ROADMAP STATUS DISAGREES',
        `phase ${n}'s 'Status' cell reads '${status}', which is not one of ${LEGAL_STATUSES.map((s) => `'${s}'`).join(', ')}.`,
      );
    }
    const numEqualsDen = ratio && ratio[1] === ratio[2];
    if (checked === true && !numEqualsDen) {
      violation(
        'ROADMAP STATUS DISAGREES',
        `phase ${n} is the in-flight phase and its checkbox is '[x]', but its row reads '${cell}'. The checkbox may only be ticked once the numerator equals the denominator.`,
      );
    }
  } else {
    if (status !== p.status) {
      violation(
        'ROADMAP STATUS DISAGREES',
        `phase ${n}'s 'Status' cell reads '${status}' but the derived status from ${p.summaries} summary file(s) over ${p.plans} plan file(s) is '${p.status}'.`,
      );
    }
    if (checked === undefined) {
      violation(
        'ROADMAP STATUS DISAGREES',
        `phase ${n} has a Progress-table row but no '- [ ] **Phase ${n}' checkbox line.`,
      );
    } else if (checked !== (p.status === 'Complete')) {
      violation(
        'ROADMAP STATUS DISAGREES',
        `phase ${n}'s checkbox is '[${checked ? 'x' : ' '}]' but its derived status is '${p.status}'. '[x]' means and only means 'Complete'.`,
      );
    }
  }
}

for (const n of phases.keys()) {
  if (!seenRows.has(n)) {
    violation(
      'ROADMAP PLAN COUNT',
      `.planning/phases/ holds a directory for phase ${n} but the Progress table has no row for it.`,
    );
  }
}

// --- 4/5. STATE.md counters and percentage ----------------------------------

function stateNumber(field) {
  const m = new RegExp(`^\\s*${field}:\\s*(\\d+)\\s*$`, 'm').exec(stateText);
  return m ? Number(m[1]) : null;
}

const stateFields = [
  ['total_phases', totalPhases],
  ['completed_phases', completePhases],
  ['total_plans', totalPlans],
  ['completed_plans', totalSummaries],
];

for (const [field, derived] of stateFields) {
  const got = stateNumber(field);
  if (got === null) {
    violation('STATE PLAN COUNT', `${PATHS.state} has no '${field}:' line in its progress block.`);
  } else if (got !== derived) {
    violation(
      'STATE PLAN COUNT',
      `${field} reads ${got} but the filesystem gives ${derived}.`,
    );
  }
}

const expectedPercent = Math.round((completePhases / totalPhases) * 100);
const percent = stateNumber('percent');
if (percent === null) {
  violation('STATE PERCENT DRIFT', `${PATHS.state} has no 'percent:' line.`);
} else if (percent !== expectedPercent) {
  violation(
    'STATE PERCENT DRIFT',
    `percent reads ${percent} but round(${completePhases}/${totalPhases} * 100) is ${expectedPercent}.`,
  );
}

const barMatch = /^Progress: \[[^\]]*\]\s*(\d+)%\s*$/m.exec(stateText);
if (!barMatch) {
  violation('STATE PERCENT DRIFT', `${PATHS.state} has no '^Progress: [...] N%' body line.`);
} else if (percent !== null && Number(barMatch[1]) !== percent) {
  violation(
    'STATE PERCENT DRIFT',
    `the body progress bar reads ${barMatch[1]}% but the frontmatter 'percent' is ${percent}. The file contradicts itself.`,
  );
}

// --- 6. ORIENTATION pointers ------------------------------------------------

const inlineCode = [...orientationText.matchAll(/`([^`\n]+)`/g)].map((m) => m[1]);

for (const token of inlineCode) {
  if (!token.includes('/')) continue; // not a path
  if (token.includes('*')) continue; // a glob, deliberately not resolved
  if (/\s/.test(token)) continue; // a command, not a path
  const abs = path.join(APP_DIR, token);
  if (!existsSync(abs)) {
    violation(
      'ORIENTATION POINTER BROKEN',
      `${path.relative(APP_DIR, PATHS.orientation)} names '${token}', which does not resolve to an existing file under ${APP_DIR}.`,
    );
  }
}

for (const required of REQUIRED_POINTERS) {
  if (!inlineCode.includes(required)) {
    violation(
      'ORIENTATION POINTER BROKEN',
      `${path.relative(APP_DIR, PATHS.orientation)} does not name '${required}' as an inline-code path, so a returning owner is not pointed at it.`,
    );
  }
}

// --- 7. stated gate counts --------------------------------------------------

const orientationGate = /The gate set holds (\d+) gates\./.exec(orientationText);
if (!orientationGate) {
  violation(
    'ORIENTATION GATE COUNT',
    `${path.relative(APP_DIR, PATHS.orientation)} carries no 'The gate set holds <N> gates.' sentence.`,
  );
} else if (Number(orientationGate[1]) !== GATE_COUNT) {
  violation(
    'ORIENTATION GATE COUNT',
    `${path.relative(APP_DIR, PATHS.orientation)} states ${orientationGate[1]} gates but gates.manifest.json holds ${GATE_COUNT}.`,
  );
}

const resumeGate = /ALL GATES PASSED \((\d+)\/(\d+)\)/.exec(resumeText);
if (!resumeGate) {
  violation(
    'ORIENTATION GATE COUNT',
    `${path.relative(APP_DIR, PATHS.resume)} carries no 'ALL GATES PASSED (n/n)' claim.`,
  );
} else if (Number(resumeGate[1]) !== GATE_COUNT || Number(resumeGate[2]) !== GATE_COUNT) {
  violation(
    'ORIENTATION GATE COUNT',
    `${path.relative(APP_DIR, PATHS.resume)} claims 'ALL GATES PASSED (${resumeGate[1]}/${resumeGate[2]})' but gates.manifest.json holds ${GATE_COUNT}.`,
  );
}

// --- verdict ----------------------------------------------------------------

if (violations.length > 0) {
  for (const v of violations) console.error(v);
  skipReport();
  process.exit(1);
}

console.log(
  `PLANNING TRUTH OK — ${totalPhases} phase(s) reconciled, ${Object.keys(DEFAULTS).length} document(s) checked`,
);
skipReport();
process.exit(0);
