#!/usr/bin/env node
/**
 * check-bugs-ledger.mjs — the structural half of the `engine/BUGS.md` check.
 *
 *   node scripts/check-bugs-ledger.mjs
 *   node scripts/check-bugs-ledger.mjs --file <path>
 *
 * `engine/tests/bugs_ledger.rs` catches the NUMBERS drifting: it re-runs each entry's committed
 * reproduction and compares against the recorded figures. This script catches the DOCUMENT
 * drifting: an entry with no reproduction anybody can run, a status somebody invented so a stale
 * entry could sit quietly, a closed entry with no stated reason, or a legal claim written without
 * an attribution.
 *
 * The two halves are deliberately independent, the same split this project already uses for
 * observability (`engine/tests/observability.rs` + `scripts/check-observability.mjs`). Either one
 * alone can be satisfied by a document that lies in the other's direction.
 *
 * Violations, each with its own literal marker:
 *
 *   ENTRY HEADING MALFORMED — a '## BUG-' heading is not '## BUG-<three digits>: <title>'
 *   DUPLICATE ENTRY ID      — the same BUG id appears twice
 *   MISSING HEADING         — an entry lacks a heading (or bold field) its status requires
 *   UNKNOWN STATUS          — a '**Status:**' value outside the two allowed strings
 *   OPEN WITHOUT REPRODUCTION — an Open entry has no fenced json block under '### Reproduction'
 *   CLOSED WITHOUT REASON   — a closed entry has no '### Why it was closed' section
 *   UNATTRIBUTED LEGAL CLAIM — an '### Expected' section without the required attribution phrase
 *   BUGS LEDGER UNREADABLE  — the input is missing or unreadable; exits 1 immediately
 *
 * This script NEVER evaluates whether a legal statement is correct, and never states one. It checks
 * document structure and nothing else.
 *
 * Reads repo files only. No database, no socket, no subprocess. It writes nothing, and it has no
 * repair, rewrite, self-update, acceptance or waiver flag of any kind; `--file` is a read-only path
 * override so the committed fixtures can drive each failure path. (That sentence deliberately avoids
 * spelling those flag names literally, so a grep for them over this file returns zero.)
 *
 * Dependency-free: node: builtins only. Exit 0 on zero violations, 1 otherwise. There is no other
 * exit code.
 */

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const SCRIPT_DIR = path.dirname(new URL(import.meta.url).pathname);
const APP_DIR = path.resolve(SCRIPT_DIR, '..');

const DEFAULT_FILE = path.join(APP_DIR, 'engine', 'BUGS.md');

const STATUS_OPEN = 'Open';
const STATUS_CLOSED = 'Closed — does not reproduce';

/** The bold field lines every entry carries, whatever its status. */
const REQUIRED_FIELDS = ['**Severity:**', '**Status:**', '**Found:**', '**Location:**'];
/** A closed entry carries this one as well. */
const CLOSED_ONLY_FIELDS = ['**Closed:**'];

/** `### ` headings required per status. Transcribed from 14-02 Reference B so the expected
 *  shape is auditable here rather than inferred from whichever file is being checked. */
const REQUIRED_HEADINGS = {
  [STATUS_OPEN]: ['Description', 'Reproduction', 'Expected', 'Actual', 'Owning requirement'],
  [STATUS_CLOSED]: ['Description', 'Reproduction', 'Actual', 'Why it was closed'],
};

/** Every legal proposition in the ledger must carry this attribution verbatim. */
const ATTRIBUTION = 'Quoted from .planning/research/LEGAL-CONFORMANCE.md';

const violations = [];
function violation(marker, detail) {
  violations.push(`${marker} — ${detail}`);
}

/** Printed on EVERY exit path, success and failure alike. */
function skipReport(total) {
  console.log(`GATE-SKIPS total=${total} skipped=0`);
}

function unreadable(message) {
  console.error(`BUGS LEDGER UNREADABLE: ${message}`);
  skipReport(0);
  process.exit(1);
}

// --- argument parsing -------------------------------------------------------

function parseArgs(argv) {
  const out = { file: DEFAULT_FILE };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--file') {
      const value = argv[i + 1];
      if (!value) unreadable('--file needs a path');
      out.file = path.resolve(process.cwd(), value);
      i += 1;
    } else {
      unreadable(`unknown option ${argv[i]}`);
    }
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));

if (!existsSync(args.file)) unreadable(`${args.file} does not exist`);

let text;
try {
  text = readFileSync(args.file, 'utf8');
} catch (err) {
  unreadable(`could not read ${args.file}: ${err && err.message}`);
}

const rel = path.relative(APP_DIR, args.file);

// --- parse ------------------------------------------------------------------

const lines = text.split('\n');
const starts = [];
lines.forEach((line, i) => {
  if (line.startsWith('## BUG-')) starts.push(i);
});

if (starts.length === 0) {
  unreadable(`${rel} contains no '## BUG-' entry`);
}

const entries = [];
for (let n = 0; n < starts.length; n += 1) {
  const start = starts[n];
  const end = n + 1 < starts.length ? starts[n + 1] : lines.length;
  const body = lines.slice(start, end);
  const heading = body[0];

  const entry = {
    heading,
    id: null,
    status: null,
    fields: new Set(),
    headings: [],
    sections: new Map(),
  };

  // `## BUG-<three digits>: <title>`
  const m = /^## (BUG-\d{3}): (\S.*)$/.exec(heading);
  if (m) {
    entry.id = m[1];
  } else {
    violation(
      'ENTRY HEADING MALFORMED',
      `${rel}: '${heading}' is not of the form '## BUG-<three digits>: <title>'`,
    );
    entry.id = heading.trim();
  }

  let section = null;
  let sectionLines = [];
  const flush = () => {
    if (section !== null) entry.sections.set(section, sectionLines.join('\n'));
  };
  for (const line of body.slice(1)) {
    for (const f of REQUIRED_FIELDS.concat(CLOSED_ONLY_FIELDS)) {
      if (line.startsWith(f)) entry.fields.add(f);
    }
    if (line.startsWith('**Status:**') && entry.status === null) {
      entry.status = line.slice('**Status:**'.length).trim();
    }
    if (line.startsWith('### ')) {
      flush();
      section = line.slice(4).trim();
      entry.headings.push(section);
      sectionLines = [];
      continue;
    }
    if (section !== null) sectionLines.push(line);
  }
  flush();

  entries.push(entry);
}

// --- checks -----------------------------------------------------------------

const seen = new Set();
for (const entry of entries) {
  if (seen.has(entry.id)) {
    violation('DUPLICATE ENTRY ID', `${rel}: ${entry.id} appears more than once`);
  }
  seen.add(entry.id);

  const statusKnown = entry.status === STATUS_OPEN || entry.status === STATUS_CLOSED;
  if (!statusKnown) {
    violation(
      'UNKNOWN STATUS',
      `${rel}: ${entry.id} has status '${entry.status}', which is neither '${STATUS_OPEN}' nor '${STATUS_CLOSED}'. A third status is how a stale entry hides.`,
    );
  }

  const requiredFields = REQUIRED_FIELDS.concat(entry.status === STATUS_CLOSED ? CLOSED_ONLY_FIELDS : []);
  for (const f of requiredFields) {
    if (!entry.fields.has(f)) {
      violation('MISSING HEADING', `${rel}: ${entry.id} lacks the field line '${f}'`);
    }
  }

  if (statusKnown) {
    for (const h of REQUIRED_HEADINGS[entry.status]) {
      if (!entry.headings.includes(h)) {
        violation(
          'MISSING HEADING',
          `${rel}: ${entry.id} (status '${entry.status}') lacks the section '### ${h}'`,
        );
      }
    }
  }

  const repro = entry.sections.get('Reproduction') || '';
  const hasJsonBlock = repro.includes('```json');
  if (entry.status === STATUS_OPEN && !hasJsonBlock) {
    violation(
      'OPEN WITHOUT REPRODUCTION',
      `${rel}: ${entry.id} is Open but has no fenced json block under '### Reproduction', so nobody can run it`,
    );
  }

  if (entry.status === STATUS_CLOSED && !entry.headings.includes('Why it was closed')) {
    violation(
      'CLOSED WITHOUT REASON',
      `${rel}: ${entry.id} is closed but has no '### Why it was closed' section`,
    );
  }

  if (entry.headings.includes('Expected')) {
    const expected = entry.sections.get('Expected') || '';
    if (!expected.includes(ATTRIBUTION)) {
      violation(
        'UNATTRIBUTED LEGAL CLAIM',
        `${rel}: ${entry.id}'s '### Expected' section does not contain '${ATTRIBUTION}'. No agent may state a point of Philippine law of its own; quote the research report and name the section.`,
      );
    }
  }
}

// --- verdict ----------------------------------------------------------------

const total = entries.length;

if (violations.length > 0) {
  for (const v of violations) console.error(v);
  skipReport(total);
  process.exit(1);
}

console.log(`BUGS LEDGER OK — ${total} ${total === 1 ? 'entry' : 'entries'} checked`);
skipReport(total);
process.exit(0);
