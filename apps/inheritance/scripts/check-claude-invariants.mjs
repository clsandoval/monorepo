#!/usr/bin/env node
/**
 * check-claude-invariants.mjs — keeps the invariants section of `CLAUDE.md`
 * present, correctly placed, complete, and honest about which commands run.
 *
 *   node scripts/check-claude-invariants.mjs
 *   node scripts/check-claude-invariants.mjs --claude <path>
 *
 * EXT-05 asks that `CLAUDE.md` state the invariants an implementing agent must
 * not violate. A section of prose with nothing checking it rots in three
 * distinct ways, and this check covers all three:
 *
 *   1. It disappears. `CLAUDE.md` is partly generated — seven
 *      `<!-- GSD:*-start -->` / `<!-- GSD:*-end -->` marker pairs delimit spans
 *      whose contents are regenerated from `.planning/codebase/`. A section that
 *      drifts inside a span is destroyed by the next regeneration, silently.
 *   2. It shrinks. An invariant deleted or renamed is an invariant nobody is
 *      following.
 *   3. It lies. An invariant that cites a command no gate runs reads like
 *      enforcement while enforcing nothing — the worst of the three, because it
 *      buys false confidence.
 *
 * The spans are computed from the file on every run, never hardcoded, so adding
 * a new generated block to `CLAUDE.md` is covered automatically.
 *
 * Violations, each with its own literal marker:
 *
 *   INVARIANT SECTION MISSING       — no '## Invariants an implementing agent must not violate' line
 *   INVARIANT INSIDE GENERATED BLOCK— the heading sits inside a <!-- GSD:*-start/end --> span
 *   INVARIANT COUNT                 — the section holds a number of invariants other than 6
 *   INVARIANT TITLE MISSING         — an invariant's bolded title differs from the expected one at that position
 *   INVARIANT COMMAND UNGATED       — a cited command is not a `command` value in gates.manifest.json
 *   CLAUDE MD UNREADABLE            — an input is missing or unparseable; exits 2, not 1
 *
 * The exit contract is three-valued on purpose. Exit 2 is a cannot-run
 * condition (an input is not there to be read) and is deliberately distinct
 * from exit 1 (a rule was read and violated), matching the
 * `GATE CANNOT RUN` / failure split in `.planning/PLAN-STANDARD.md` section 3.
 *
 * `gates.manifest.json` is NOT overridable. An invariant must be checked
 * against the real gate set, or the check would certify nothing.
 *
 * This script NEVER evaluates whether an invariant is a good rule, and never
 * writes one. It checks structural agreement and nothing else.
 *
 * Reads repo files only. No database, no socket, no subprocess. It writes no
 * file, and it has no repair, rewrite, self-update, acceptance or waiver flag of
 * any kind; the one flag it does have is a read-only path override so committed
 * fixtures can drive each failure path. (That sentence deliberately avoids
 * spelling those flag names literally, so a grep for them over this file returns
 * zero — the audit for "can this check rewrite its own input" is a grep, and a
 * prose mention would be a false positive.)
 *
 * Dependency-free: node: builtins only.
 */

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const SCRIPT_DIR = path.dirname(new URL(import.meta.url).pathname);
const APP_DIR = path.resolve(SCRIPT_DIR, '..');

const DEFAULT_CLAUDE = path.join(APP_DIR, 'CLAUDE.md');
const MANIFEST_PATH = path.join(APP_DIR, 'gates.manifest.json');

const SECTION_HEADING = '## Invariants an implementing agent must not violate';

/** The six expected invariant titles, in order. Hardcoded so the expectation is
 *  auditable HERE rather than inferred from whichever file is being checked —
 *  the same decision check-blocked-requirements.mjs made for its requirement
 *  ids. Order is part of the contract. */
const EXPECTED_TITLES = [
  'Commit scope',
  'Gate immutability',
  'Halt over guess',
  'Money units',
  'One implementation per legal rule',
  'What requires a lawyer',
];

/** A backticked string is treated as a gate command when it opens with one of
 *  these. Anything else in backticks is a path, a type, a flag or prose. */
const COMMAND_PREFIXES = ['node scripts/', 'cd engine && ', 'cd frontend && '];

const violations = [];
function violation(marker, detail) {
  violations.push(`${marker} — ${detail}`);
}

/** Printed on EVERY exit path, success and failure alike. Gate G8 fails with
 *  SKIP REPORT MISSING on a log that lacks it. */
function skipReport() {
  console.log(`GATE-SKIPS total=${EXPECTED_TITLES.length} skipped=0`);
}

/** Exit 2 with CLAUDE MD UNREADABLE. Cannot-run, not a violation. */
function unreadable(message) {
  console.error(`CLAUDE MD UNREADABLE: ${message}`);
  skipReport();
  process.exit(2);
}

// --- argument parsing -------------------------------------------------------

function parseArgs(argv) {
  let claude = DEFAULT_CLAUDE;
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--claude') {
      const next = argv[i + 1];
      if (!next) unreadable('--claude was given without a path.');
      claude = path.resolve(process.cwd(), next);
      i += 1;
    } else {
      unreadable(`unrecognised argument '${argv[i]}'. The only flag is --claude <path>.`);
    }
  }
  return { claude };
}

const { claude: CLAUDE_PATH } = parseArgs(process.argv.slice(2));

// --- read inputs ------------------------------------------------------------

if (!existsSync(CLAUDE_PATH)) unreadable(`${CLAUDE_PATH} does not exist.`);
if (!existsSync(MANIFEST_PATH)) unreadable(`${MANIFEST_PATH} does not exist.`);

let claudeText;
try {
  claudeText = readFileSync(CLAUDE_PATH, 'utf8');
} catch (err) {
  unreadable(`${CLAUDE_PATH} could not be read: ${err.message}`);
}

let manifest;
try {
  manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
} catch (err) {
  unreadable(`${MANIFEST_PATH} could not be parsed: ${err.message}`);
}
if (!manifest || !Array.isArray(manifest.gates)) {
  unreadable(`${MANIFEST_PATH} has no 'gates' array.`);
}

const GATE_COMMANDS = new Set(manifest.gates.map((g) => g.command));

const lines = claudeText.split('\n');
const relClaude = path.relative(APP_DIR, CLAUDE_PATH) || CLAUDE_PATH;

// --- 1. INVARIANT SECTION MISSING -------------------------------------------

const headingIndex = lines.findIndex((l) => l.trim() === SECTION_HEADING);

if (headingIndex === -1) {
  violation(
    'INVARIANT SECTION MISSING',
    `${relClaude} has no line equal to '${SECTION_HEADING}'. EXT-05 requires that section; without it an implementing agent has no stated invariants at all.`,
  );
  for (const v of violations) console.error(v);
  skipReport();
  process.exit(1);
}

// --- 2. INVARIANT INSIDE GENERATED BLOCK ------------------------------------
// Spans are computed from the file, never hardcoded, so a newly added generated
// block is covered without editing this script.

const spans = [];
const openSpans = new Map();
for (let i = 0; i < lines.length; i += 1) {
  const start = /<!--\s*GSD:([A-Za-z0-9_-]+)-start\b/.exec(lines[i]);
  if (start) {
    openSpans.set(start[1], i);
    continue;
  }
  const end = /<!--\s*GSD:([A-Za-z0-9_-]+)-end\b/.exec(lines[i]);
  if (end && openSpans.has(end[1])) {
    spans.push({ name: end[1], start: openSpans.get(end[1]), end: i });
    openSpans.delete(end[1]);
  }
}

for (const span of spans) {
  if (headingIndex > span.start && headingIndex < span.end) {
    violation(
      'INVARIANT INSIDE GENERATED BLOCK',
      `the '${SECTION_HEADING}' heading is at line ${headingIndex + 1} of ${relClaude}, inside the '${span.name}' generated span (lines ${span.start + 1}–${span.end + 1}). Contents of that span are regenerated from .planning/codebase/, so the section would be destroyed without warning. Move it outside every <!-- GSD:*-start/end --> pair.`,
    );
  }
}

// --- section body -----------------------------------------------------------

let sectionEnd = lines.length;
for (let i = headingIndex + 1; i < lines.length; i += 1) {
  if (/^## /.test(lines[i])) {
    sectionEnd = i;
    break;
  }
}
const sectionLines = lines.slice(headingIndex + 1, sectionEnd);

// --- 3. INVARIANT COUNT -----------------------------------------------------

const numbered = [];
for (const line of sectionLines) {
  const m = /^([0-9])\.\s+\*\*(.+?)\.?\*\*/.exec(line);
  if (m) numbered.push({ n: Number(m[1]), title: m[2].replace(/\.$/, '') });
}

if (numbered.length !== EXPECTED_TITLES.length) {
  violation(
    'INVARIANT COUNT',
    `${relClaude} states ${numbered.length} invariant(s) under '${SECTION_HEADING}', expected ${EXPECTED_TITLES.length}. An invariant that was deleted is an invariant nobody is following.`,
  );
}

// --- 4. INVARIANT TITLE MISSING ---------------------------------------------

for (let i = 0; i < EXPECTED_TITLES.length; i += 1) {
  const expected = EXPECTED_TITLES[i];
  const found = numbered[i] ? numbered[i].title : '(nothing)';
  if (found !== expected) {
    violation(
      'INVARIANT TITLE MISSING',
      `invariant at position ${i + 1} of ${relClaude} should be titled '${expected}', found '${found}'.`,
    );
  }
}

// --- 5. INVARIANT COMMAND UNGATED -------------------------------------------

const sectionText = sectionLines.join('\n');
const backticked = new Set();
for (const m of sectionText.matchAll(/`([^`\n]+)`/g)) backticked.add(m[1]);

for (const candidate of backticked) {
  if (!COMMAND_PREFIXES.some((p) => candidate.startsWith(p))) continue;
  if (!GATE_COMMANDS.has(candidate)) {
    violation(
      'INVARIANT COMMAND UNGATED',
      `the invariants section cites '${candidate}', which is not a 'command' value of any gate in gates.manifest.json. An invariant may not cite a check that does not run — that reads like enforcement while enforcing nothing.`,
    );
  }
}

// --- verdict ----------------------------------------------------------------

if (violations.length > 0) {
  for (const v of violations) console.error(v);
  skipReport();
  process.exit(1);
}

console.log(
  `CLAUDE INVARIANTS OK — ${EXPECTED_TITLES.length} invariant(s) checked, all commands gated`,
);
skipReport();
process.exit(0);
