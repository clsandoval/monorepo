#!/usr/bin/env node
/**
 * check-lawyer-agenda.mjs — agreement between the lawyer review agenda, the
 * machine-readable decision registry, and the code each decision governs.
 *
 *   node scripts/check-lawyer-agenda.mjs
 *   node scripts/check-lawyer-agenda.mjs --registry <path> --agenda <path>
 *
 * LAWYER-09 requires each recorded interpretive choice to be machine-readable
 * and linked from the specific rule it governs, "so no agent re-decides it
 * later." Plan 04-03 built that link in both directions: the registry names a
 * {file, pattern} anchor, and the anchored site carries a `LAWYER-DECISION: <id>`
 * comment. A link with nothing checking it decays on the first refactor, and
 * decays silently. This script is what makes the decay loud.
 *
 * The load-bearing verdict is DECISION STATUS INVALID. Three requirements —
 * LAW-06, LAW-07 and LAW-12 — are hard-blocked on a lawyer's answer, and the
 * cheapest way for a future agent to unblock itself is to edit one word of JSON.
 * Requiring answered_by, answered_on and answer alongside any status other than
 * `awaiting-answer` means a status cannot advance without a person, a date and a
 * sentence appearing in the diff where a human sees them.
 *
 * Violations, each with its own literal marker:
 *
 *   AGENDA ENTRY MISSING    — a required id is absent from the registry or the agenda
 *   DECISION FIELD MISSING  — a registry entry lacks a required key, or carries an extra one
 *   DECISION STATUS INVALID — an unknown status, or a status advanced with no answer attached
 *   DECISION ANCHOR BROKEN  — an anchor file is gone, or its pattern matches other than once
 *   DECISION MARKER MISSING — an anchored file carries no `LAWYER-DECISION: <id>` comment
 *   AGENDA DRIFT            — the agenda and the registry disagree on ids, reading, or status
 *   AGENDA SCAN UNREADABLE  — an input is missing or unparseable; exits 1 immediately
 *
 * This script NEVER evaluates whether a legal reading is correct. It checks
 * structural agreement, anchor liveness and marker presence, and nothing else.
 *
 * Reads repo files only. No database, no socket, no subprocess. It has no flag
 * that rewrites, repairs or regenerates anything; the two flags are read-only
 * path overrides so fixtures can drive the failure paths.
 *
 * Dependency-free: node: builtins only. Exit 0 on zero violations, 1 otherwise.
 * There is no other exit code.
 */

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const SCRIPT_DIR = path.dirname(new URL(import.meta.url).pathname);
const APP_DIR = path.resolve(SCRIPT_DIR, '..');

const DEFAULT_REGISTRY = path.join(APP_DIR, '.planning', 'lawyer-decisions.json');
const DEFAULT_AGENDA = path.join(APP_DIR, '.planning', 'LAWYER-AGENDA.md');

/** The expected set, hardcoded so it is auditable here rather than inferred
 *  from whichever file is being checked. Ids 10 through 12 were added by
 *  Phase 20 and are the three penalty questions — the NIRC Sec. 248 surcharge,
 *  the NIRC Sec. 249 interest, and whether a compromise penalty may be
 *  computed by an engine at all. Listing them here makes the pair of records
 *  undeletable: dropping either half now fails with a missing-id violation
 *  instead of passing silently. */
const REQUIRED_IDS = [
  'LAWYER-01', 'LAWYER-02', 'LAWYER-03', 'LAWYER-04',
  'LAWYER-05', 'LAWYER-06', 'LAWYER-07', 'LAWYER-08',
  'LAWYER-09', 'LAWYER-10', 'LAWYER-11', 'LAWYER-12',
];

const REQUIRED_KEYS = [
  'id', 'question', 'title', 'articles', 'authority', 'reading_implemented',
  'status', 'blocks', 'agenda_section', 'anchors', 'vectors',
  'answered_by', 'answered_on', 'answer',
];

const VALID_STATUSES = ['awaiting-answer', 'confirmed', 'changed'];

/** A status other than this one requires all three answer fields. */
const OPEN_STATUS = 'awaiting-answer';

const ANSWER_FIELDS = ['answered_by', 'answered_on', 'answer'];

const MARKER_PREFIX = 'LAWYER-DECISION: ';

const violations = [];
function violation(marker, detail) {
  violations.push(`${marker} — ${detail}`);
}

/** Printed on EVERY exit path, success and failure alike. Gate G8 fails with
 *  SKIP REPORT MISSING on a log that lacks it. */
function skipReport(total) {
  console.log(`GATE-SKIPS total=${total} skipped=0`);
}

/** Exit 1 with AGENDA SCAN UNREADABLE. Never exit 0 on an internal error. */
function unreadable(message) {
  console.error(`AGENDA SCAN UNREADABLE: ${message}`);
  skipReport(0);
  process.exit(1);
}

// --- argument parsing -------------------------------------------------------

function parseArgs(argv) {
  const out = { registry: DEFAULT_REGISTRY, agenda: DEFAULT_AGENDA };
  const map = { '--registry': 'registry', '--agenda': 'agenda' };
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

for (const [label, file] of [['registry', args.registry], ['agenda', args.agenda]]) {
  if (!existsSync(file)) unreadable(`${label} file ${file} does not exist`);
}

let registry;
let agendaText;
try {
  registry = JSON.parse(readFileSync(args.registry, 'utf8'));
} catch (err) {
  unreadable(`could not parse ${args.registry}: ${err && err.message}`);
}
try {
  agendaText = readFileSync(args.agenda, 'utf8');
} catch (err) {
  unreadable(`could not read ${args.agenda}: ${err && err.message}`);
}

if (!Array.isArray(registry.decisions)) {
  unreadable(`${path.relative(APP_DIR, args.registry)} has no 'decisions' array`);
}

const decisions = registry.decisions;
const byId = new Map();
for (const d of decisions) {
  if (d === null || typeof d !== 'object' || typeof d.id !== 'string') {
    unreadable(`${path.relative(APP_DIR, args.registry)} holds a decision with no string 'id'`);
  }
  byId.set(d.id, d);
}

// --- literal (never regex) pattern counting ---------------------------------
// Anchor patterns contain '(', ')', '+', '*' and '.', all regex metacharacters.
// Building a RegExp from one would silently change what is matched.

function countLiteral(haystack, needle) {
  if (needle === '') return 0;
  return haystack.split(needle).length - 1;
}

// --- agenda parsing ---------------------------------------------------------
// Locate each `## <id>` heading and read the bold metadata lines that follow,
// up to the next `## ` heading.

function parseAgenda(text) {
  const entries = new Map();
  const lines = text.split('\n');
  let current = null;
  for (const line of lines) {
    const headingMatch = /^##\s+(LAWYER-\d{2})\b/.exec(line);
    if (headingMatch) {
      current = { id: headingMatch[1], engineImplements: null, status: null };
      entries.set(current.id, current);
      continue;
    }
    if (/^##\s/.test(line)) {
      current = null;
      continue;
    }
    if (current === null) continue;
    const statusMatch = /^\*\*Status:\*\*\s*(.+?)\s*$/.exec(line);
    if (statusMatch && current.status === null) {
      current.status = statusMatch[1];
      continue;
    }
    const implMatch = /^\*\*Engine implements:\*\*\s*(.+?)\s*$/.exec(line);
    if (implMatch && current.engineImplements === null) {
      current.engineImplements = implMatch[1];
    }
  }
  return entries;
}

const agendaEntries = parseAgenda(agendaText);
const relRegistry = path.relative(APP_DIR, args.registry);
const relAgenda = path.relative(APP_DIR, args.agenda);

// --- 1. AGENDA ENTRY MISSING ------------------------------------------------

for (const id of REQUIRED_IDS) {
  if (!byId.has(id)) {
    violation('AGENDA ENTRY MISSING', `${id} has no entry in ${relRegistry}`);
  }
  if (!agendaEntries.has(id)) {
    violation('AGENDA ENTRY MISSING', `${id} has no '## ${id}' heading in ${relAgenda}`);
  }
}

// --- 2. DECISION FIELD MISSING ----------------------------------------------

for (const d of decisions) {
  const keys = Object.keys(d);
  const missing = REQUIRED_KEYS.filter((k) => !keys.includes(k));
  const extra = keys.filter((k) => !REQUIRED_KEYS.includes(k));
  if (missing.length > 0) {
    violation('DECISION FIELD MISSING', `${d.id} lacks required key(s): ${missing.join(', ')}`);
  }
  if (extra.length > 0) {
    violation('DECISION FIELD MISSING', `${d.id} carries key(s) not in the schema: ${extra.join(', ')}`);
  }
}

// --- 3. DECISION STATUS INVALID ---------------------------------------------
// The block that stops an agent confirming a decision on the lawyer's behalf.

function isAbsent(value) {
  return value === null || value === undefined || value === '';
}

for (const d of decisions) {
  if (!VALID_STATUSES.includes(d.status)) {
    violation(
      'DECISION STATUS INVALID',
      `${d.id} has status '${d.status}', which is outside [${VALID_STATUSES.join(', ')}]`,
    );
    continue;
  }
  if (d.status === OPEN_STATUS) continue;
  const absent = ANSWER_FIELDS.filter((f) => isAbsent(d[f]));
  if (absent.length > 0) {
    violation(
      'DECISION STATUS INVALID',
      `${d.id} has status '${d.status}' but no answer attached: ${absent.join(', ')} ${absent.length === 1 ? 'is' : 'are'} absent. A status other than '${OPEN_STATUS}' requires a recorded answer; see .planning/LEGAL-CORRECTION-WORKFLOW.md`,
    );
  }
}

// --- 4. DECISION ANCHOR BROKEN / 5. DECISION MARKER MISSING -----------------
// Anchor `file` values always resolve against the app directory and are never
// overridable, which is what lets a fixture registry point an anchor at a
// fixture source file.

let anchorCount = 0;
for (const d of decisions) {
  // A missing or non-array `anchors` key is a schema defect, already reported by
  // DECISION FIELD MISSING above. It is not an unparseable input, so it must not
  // short-circuit the remaining checks.
  if (!Array.isArray(d.anchors)) {
    if (Object.keys(d).includes('anchors')) {
      violation('DECISION FIELD MISSING', `${d.id} has an 'anchors' key that is not an array`);
    }
    continue;
  }
  for (const a of d.anchors) {
    anchorCount += 1;
    if (a === null || typeof a !== 'object' || typeof a.file !== 'string' || typeof a.pattern !== 'string') {
      unreadable(`${d.id} has an anchor without a string 'file' and 'pattern'`);
    }
    const abs = path.resolve(APP_DIR, a.file);
    if (!existsSync(abs)) {
      violation('DECISION ANCHOR BROKEN', `${d.id} anchor file ${a.file} does not exist`);
      continue;
    }
    let text;
    try {
      text = readFileSync(abs, 'utf8');
    } catch (err) {
      violation('DECISION ANCHOR BROKEN', `${d.id} anchor file ${a.file} could not be read: ${err && err.message}`);
      continue;
    }
    const count = countLiteral(text, a.pattern);
    if (count !== 1) {
      violation(
        'DECISION ANCHOR BROKEN',
        `${d.id} anchor pattern '${a.pattern}' occurs ${count} time(s) in ${a.file}, expected exactly 1${count === 0 ? ' (the rule moved or was renamed)' : ' (the anchor no longer identifies a single location)'}`,
      );
    }
    if (!text.includes(`${MARKER_PREFIX}${d.id}`)) {
      violation(
        'DECISION MARKER MISSING',
        `${a.file} carries no '${MARKER_PREFIX}${d.id}' comment, so an agent editing it never sees the recorded decision`,
      );
    }
  }
}

// --- 6. AGENDA DRIFT --------------------------------------------------------

const registryIds = new Set(byId.keys());
const agendaIds = new Set(agendaEntries.keys());
for (const id of registryIds) {
  if (!agendaIds.has(id)) {
    violation('AGENDA DRIFT', `${id} is in ${relRegistry} but has no heading in ${relAgenda}`);
  }
}
for (const id of agendaIds) {
  if (!registryIds.has(id)) {
    violation('AGENDA DRIFT', `${id} has a heading in ${relAgenda} but no entry in ${relRegistry}`);
  }
}
for (const d of decisions) {
  const entry = agendaEntries.get(d.id);
  if (!entry) continue;
  if (entry.engineImplements !== d.reading_implemented) {
    violation(
      'AGENDA DRIFT',
      `${d.id}: agenda says '**Engine implements:** ${entry.engineImplements}' but ${relRegistry} says reading_implemented '${d.reading_implemented}'`,
    );
  }
  if (entry.status !== d.status) {
    violation(
      'AGENDA DRIFT',
      `${d.id}: agenda says '**Status:** ${entry.status}' but ${relRegistry} says status '${d.status}'`,
    );
  }
}

// --- verdict ----------------------------------------------------------------

if (violations.length > 0) {
  for (const v of violations) console.error(v);
  skipReport(decisions.length);
  process.exit(1);
}

const awaiting = decisions.filter((d) => d.status === OPEN_STATUS).length;
console.log(`AGENDA OK — ${decisions.length} decisions, ${anchorCount} anchors, ${awaiting} awaiting-answer`);
skipReport(decisions.length);
process.exit(0);
