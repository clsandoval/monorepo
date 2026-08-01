#!/usr/bin/env node
/**
 * check-blocked-requirements.mjs — keeps `.planning/BLOCKED-REQUIREMENTS.md`
 * honest about the three requirements no agent may implement.
 *
 *   node scripts/check-blocked-requirements.mjs
 *   node scripts/check-blocked-requirements.mjs --ledger <path>
 *   node scripts/check-blocked-requirements.mjs --decisions <path>
 *   node scripts/check-blocked-requirements.mjs --requirements <path>
 *
 * LAW-06, LAW-07 and LAW-12 are hard-blocked on LAWYER-06, LAWYER-04 and
 * LAWYER-08. `.planning/PLAN-STANDARD.md` section 3 forbids an agent from
 * adopting a reading in the meantime, so the deliverable for those three
 * requirements is a record, not an implementation. A record with nothing
 * checking it rots.
 *
 * This check fails in BOTH directions, which is the point:
 *
 *   - it goes red when the record drifts from `.planning/lawyer-decisions.json`,
 *     so the ledger cannot quietly become fiction;
 *   - it goes red when an ANSWER HAS ARRIVED while the requirement is still
 *     open. That is a deliberate red on good news. The answer arriving is
 *     exactly the moment the work must start, and a silent pass would let a
 *     month-long unattended loop walk straight past it.
 *
 * Violations, each with its own literal marker:
 *
 *   BLOCKED ENTRY MISSING       — a required requirement has no '## LAW-NN — blocked on LAWYER-NN' heading
 *   WRONG BLOCKING DECISION     — a heading names a decision whose `blocks` array omits that requirement
 *   MISSING FIELD               — an entry lacks one of the seven bold field lines
 *   STATUS DRIFT                — an entry's **Registry status:** differs from the registry's `status`
 *   REQUIREMENT CLAIMED COMPLETE— REQUIREMENTS.md marks a blocked requirement [x] while its decision is open
 *   ANSWER ARRIVED              — a blocking decision is no longer awaiting-answer while its requirement is open
 *   BLOCKED LEDGER UNREADABLE   — an input is missing or unparseable; exits 1 immediately
 *
 * This script NEVER evaluates whether a legal reading is correct, and never
 * states one. It checks structural agreement and nothing else.
 *
 * Reads repo files only. No database, no socket, no subprocess. It writes no
 * file, and it has no repair, rewrite, self-update, acceptance or waiver flag of
 * any kind; the three flags it does have are read-only path overrides so
 * committed fixtures can drive each failure path. (That sentence deliberately
 * avoids spelling those flag names literally, so a grep for them over this file
 * returns zero — the audit for "can this check rewrite its own input" is a grep,
 * and a prose mention would be a false positive.)
 *
 * Dependency-free: node: builtins only. Exit 0 on zero violations, 1 otherwise.
 * There is no other exit code.
 */

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const SCRIPT_DIR = path.dirname(new URL(import.meta.url).pathname);
const APP_DIR = path.resolve(SCRIPT_DIR, '..');

const DEFAULT_LEDGER = path.join(APP_DIR, '.planning', 'BLOCKED-REQUIREMENTS.md');
const DEFAULT_DECISIONS = path.join(APP_DIR, '.planning', 'lawyer-decisions.json');
const DEFAULT_REQUIREMENTS = path.join(APP_DIR, '.planning', 'REQUIREMENTS.md');

/** The expected set, hardcoded so it is auditable HERE rather than inferred from
 *  whichever file is being checked — the same decision check-observability.mjs
 *  made for its ten flag codes. LAW-06, LAW-07, LAW-12. */
const BLOCKED_REQUIREMENTS = [
  'LAW-06', 'LAW-07', 'LAW-12',
  // Added by Phase 20: the three estate-tax penalty lines. Each waits on a
  // recorded question rather than on effort — no rate, base or accrual rule
  // for NIRC Sec. 248 or Sec. 249 is stated in any spec in this repository.
  'PEN-01', 'PEN-02', 'PEN-03',
];

/** The seven bold field lines every entry carries, in order. */
const REQUIRED_FIELDS = [
  '**Requirement:**',
  '**Blocking decision:**',
  '**Registry status:**',
  '**Exact question awaiting an answer:**',
  '**What already exists in the tree:**',
  '**Why no agent may proceed:**',
  '**Unblock procedure:**',
];

const OPEN_STATUS = 'awaiting-answer';

const violations = [];
function violation(marker, detail) {
  violations.push(`${marker} — ${detail}`);
}

/** Printed on EVERY exit path, success and failure alike. Gate G8 fails with
 *  SKIP REPORT MISSING on a log that lacks it. */
function skipReport(total) {
  console.log(`GATE-SKIPS total=${total} skipped=0`);
}

/** Exit 1 with BLOCKED LEDGER UNREADABLE. Never exit 0 on an internal error. */
function unreadable(message) {
  console.error(`BLOCKED LEDGER UNREADABLE: ${message}`);
  skipReport(0);
  process.exit(1);
}

// --- argument parsing -------------------------------------------------------

function parseArgs(argv) {
  const out = {
    ledger: DEFAULT_LEDGER,
    decisions: DEFAULT_DECISIONS,
    requirements: DEFAULT_REQUIREMENTS,
  };
  const map = { '--ledger': 'ledger', '--decisions': 'decisions', '--requirements': 'requirements' };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (map[arg]) {
      const value = argv[i + 1];
      if (!value) unreadable(`${arg} needs a path`);
      out[map[arg]] = path.resolve(process.cwd(), value);
      i += 1;
    } else {
      unreadable(`unknown option ${arg}`);
    }
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));

// --- read inputs ------------------------------------------------------------

for (const [label, file] of [
  ['ledger', args.ledger],
  ['decisions', args.decisions],
  ['requirements', args.requirements],
]) {
  if (!existsSync(file)) unreadable(`${label} file ${file} does not exist`);
}

let registry;
let ledgerText;
let requirementsText;
try {
  registry = JSON.parse(readFileSync(args.decisions, 'utf8'));
} catch (err) {
  unreadable(`could not parse ${args.decisions}: ${err && err.message}`);
}
try {
  ledgerText = readFileSync(args.ledger, 'utf8');
} catch (err) {
  unreadable(`could not read ${args.ledger}: ${err && err.message}`);
}
try {
  requirementsText = readFileSync(args.requirements, 'utf8');
} catch (err) {
  unreadable(`could not read ${args.requirements}: ${err && err.message}`);
}

if (!Array.isArray(registry.decisions)) {
  unreadable(`${path.relative(APP_DIR, args.decisions)} has no 'decisions' array`);
}

const byId = new Map();
for (const d of registry.decisions) {
  if (d === null || typeof d !== 'object' || typeof d.id !== 'string') {
    unreadable(`${path.relative(APP_DIR, args.decisions)} holds a decision with no string 'id'`);
  }
  byId.set(d.id, d);
}

const relLedger = path.relative(APP_DIR, args.ledger);
const relDecisions = path.relative(APP_DIR, args.decisions);
const relRequirements = path.relative(APP_DIR, args.requirements);

// --- ledger parsing ---------------------------------------------------------
// Each entry is `## LAW-NN — blocked on LAWYER-NN`, running to the next `## `.

function parseLedger(text) {
  const entries = new Map();
  const lines = text.split('\n');
  let current = null;
  for (const line of lines) {
    const heading = /^##\s+((?:LAW|PEN)-\d{2})\s+—\s+blocked on\s+(LAWYER-\d{2})\s*$/.exec(line);
    if (heading) {
      current = {
        id: heading[1],
        decisionId: heading[2],
        fields: new Set(),
        registryStatus: null,
      };
      entries.set(current.id, current);
      continue;
    }
    if (/^##\s/.test(line)) {
      current = null;
      continue;
    }
    if (current === null) continue;
    for (const field of REQUIRED_FIELDS) {
      if (line.startsWith(field)) current.fields.add(field);
    }
    const statusLine = /^\*\*Registry status:\*\*\s*(.+?)\s*$/.exec(line);
    if (statusLine && current.registryStatus === null) {
      current.registryStatus = statusLine[1];
    }
  }
  return entries;
}

const entries = parseLedger(ledgerText);

// --- REQUIREMENTS.md checkbox state -----------------------------------------
// `- [ ] **LAW-06**: ...` / `- [x] **LAW-06**: ...`

function requirementChecked(text, id) {
  const re = new RegExp(`^-\\s+\\[([ xX])\\]\\s+\\*\\*${id}\\*\\*`, 'm');
  const m = re.exec(text);
  if (!m) return null;
  return m[1].toLowerCase() === 'x';
}

// --- checks -----------------------------------------------------------------

for (const reqId of BLOCKED_REQUIREMENTS) {
  const entry = entries.get(reqId);

  // 1. BLOCKED ENTRY MISSING
  if (!entry) {
    violation(
      'BLOCKED ENTRY MISSING',
      `${reqId} has no '## ${reqId} — blocked on LAWYER-NN' heading in ${relLedger}`,
    );
    continue;
  }

  const decision = byId.get(entry.decisionId);

  // 2. WRONG BLOCKING DECISION
  if (!decision) {
    violation(
      'WRONG BLOCKING DECISION',
      `${reqId} names ${entry.decisionId}, which has no entry in ${relDecisions}`,
    );
  } else if (!Array.isArray(decision.blocks) || !decision.blocks.includes(reqId)) {
    violation(
      'WRONG BLOCKING DECISION',
      `${relLedger} says ${reqId} is blocked on ${entry.decisionId}, but ${entry.decisionId}'s 'blocks' array in ${relDecisions} is ${JSON.stringify(decision.blocks)} and does not contain ${reqId}`,
    );
  }

  // 3. MISSING FIELD
  const missing = REQUIRED_FIELDS.filter((f) => !entry.fields.has(f));
  if (missing.length > 0) {
    violation('MISSING FIELD', `${reqId} lacks field line(s): ${missing.join(', ')}`);
  }

  // 4. STATUS DRIFT
  if (decision && entry.registryStatus !== null && entry.registryStatus !== decision.status) {
    violation(
      'STATUS DRIFT',
      `${reqId} records '**Registry status:** ${entry.registryStatus}' but ${relDecisions} says ${entry.decisionId} has status '${decision.status}'`,
    );
  }

  const checked = requirementChecked(requirementsText, reqId);
  const open = decision ? decision.status === OPEN_STATUS : false;

  // 5. REQUIREMENT CLAIMED COMPLETE
  if (checked === true && open) {
    violation(
      'REQUIREMENT CLAIMED COMPLETE',
      `${relRequirements} marks ${reqId} '[x]' while ${entry.decisionId} is still '${OPEN_STATUS}' in ${relDecisions}. No agent may close ${reqId} without the lawyer's answer.`,
    );
  }

  // 6. ANSWER ARRIVED — deliberate red on good news.
  if (decision && !open && checked !== true) {
    violation(
      'ANSWER ARRIVED',
      `${entry.decisionId} now has status '${decision.status}', so ${reqId} is NO LONGER BLOCKED, but ${relRequirements} still leaves ${reqId} unchecked. Start the work: run the five steps of .planning/LEGAL-CORRECTION-WORKFLOW.md (record the claim, name a TV-L<NN> vector, watch it fail, fix in exactly one place, close the loop).`,
    );
  }
}

// --- verdict ----------------------------------------------------------------

const total = BLOCKED_REQUIREMENTS.length;

if (violations.length > 0) {
  for (const v of violations) console.error(v);
  skipReport(total);
  process.exit(1);
}

console.log(`BLOCKED REQUIREMENTS OK — ${total} requirement(s) checked, all ${OPEN_STATUS}`);
skipReport(total);
process.exit(0);
