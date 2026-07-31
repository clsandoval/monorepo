#!/usr/bin/env node
/**
 * check-spec-legal-text.mjs — pins the four passages of primary law that
 * `.planning/research/LEGAL-CONFORMANCE.md` section 2b found misstated in the
 * specs, so they stay corrected.
 *
 *   node scripts/check-spec-legal-text.mjs
 *   node scripts/check-spec-legal-text.mjs --root <dir>
 *
 * A wrong spec is worse than a wrong line of code: the spec is what a lawyer
 * reads to sign off, and it is what a later agent diffs code against. A wrong
 * passage will eventually cause a correct code fix to be reverted, or a wrong
 * rule to be re-implemented from the document.
 *
 * The four corrections:
 *
 *   C1 — Art. 992 is stated post-*Aquino v. Aquino* (2021) in the direct line,
 *        with the collateral question recorded as open (LAWYER-04), not decided.
 *   C2 — Art. 900 ¶2 states the statutory three-month window, and the resulting
 *        spec-to-code divergence is recorded under a KNOWN DIVERGENCE marker.
 *   C3 — Art. 972 ¶1's prohibition on representation in the ascending line is
 *        stated, and points at its committed vector.
 *   C4 — the vanishing-deduction reduction ratio includes 5F Transfers for
 *        Public Use (corrected in Phase 8 under LAW-09; pinned here).
 *
 * This script NEVER evaluates whether a legal reading is correct. It checks that
 * specific literal strings are present at specific places and that specific
 * superseded strings are absent. Nothing else.
 *
 * All matching is literal `String.prototype.includes` / `indexOf`, never a
 * regular expression, because the searched strings contain `*`, `(`, `)`, `.`,
 * `¶` and `|`, every one of which is a regex metacharacter.
 *
 * Two behaviours worth knowing before you read a failure:
 *
 *   1. An anchor must occur EXACTLY ONCE in its file. An anchor that matches two
 *      places does not identify a location, so it is reported as a defect rather
 *      than resolved to the first hit.
 *   2. For C3 the required literals sit on the line ABOVE the anchor. The window
 *      therefore spans `before` lines preceding the anchor as well as `window`
 *      lines after it. This is deliberate, not a bug: the Art. 972 ¶1 bullet is
 *      placed immediately above the pre-existing Art. 972 ¶2 bullet that anchors
 *      it, because that is the reading order a lawyer expects.
 *
 * Violations, each with its own literal marker:
 *
 *   SPEC ANCHOR MISSING   — an anchor is absent from its file, or occurs more than once
 *   CORRECTION MISSING    — a required literal is absent from the anchor's window
 *   MISSTATEMENT PRESENT  — a superseded literal is still present anywhere in the file
 *   SPEC SCAN UNREADABLE  — a named file is missing or unreadable; exits 1 immediately
 *
 * Reads repo files only. No database, no socket, no subprocess. It writes nothing
 * and has no repair, rewrite, self-update, acceptance or waiver flag of any kind;
 * `--root` is a read-only path override (a directory, or a single stand-in file)
 * so the committed fixtures can drive each failure path. (That sentence deliberately avoids spelling those flag names
 * literally, so a grep for them over this file returns zero.)
 *
 * Dependency-free: node: builtins only. Exit 0 on zero violations, 1 otherwise.
 * There is no other exit code.
 */

import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const SCRIPT_DIR = path.dirname(new URL(import.meta.url).pathname);
const APP_DIR = path.resolve(SCRIPT_DIR, '..');

const ENGINE_SPEC = 'specs/inheritance-engine-spec.md';
const V2_SPEC = 'specs/inheritance-v2-spec.md';
const TAX_SPEC = 'specs/estate-tax-engine-spec.md';
const NCC = 'frontend/src/data/ncc-articles.ts';

/** The four C1 prose literals, quoted from
 *  .planning/research/LEGAL-CONFORMANCE.md section 2b and from
 *  .planning/lawyer-decisions.json. Transcribed here so the expected text is
 *  auditable in this script rather than inferred from whichever file is scanned. */
const C1_PROSE = [
  'Aquino v. Aquino, G.R. Nos. 208912 and 209018, En Banc, 7 December 2021',
  'qualified to inherit from their direct ascendants such as their grandparent by their right of representation',
  'It is silent on collateral relatives',
  'LAWYER-04',
];

const CORRECTIONS = [
  {
    id: 'C1',
    statement:
      'Art. 992 is stated post-Aquino v. Aquino (2021) in the direct line, with the collateral-line question recorded as the open decision LAWYER-04 rather than answered.',
    locations: [
      { file: ENGINE_SPEC, anchor: '### 7.4 Iron Curtain Rule (Art. 992)', window: 20, required: C1_PROSE, forbidden: [] },
      { file: V2_SPEC, anchor: '### §7.3 Iron Curtain Rule (Art. 992)', window: 20, required: C1_PROSE, forbidden: [] },
      { file: ENGINE_SPEC, anchor: '| 992 | Iron Curtain Rule', window: 1, required: ['Aquino'], forbidden: [] },
      { file: ENGINE_SPEC, anchor: '| **Iron Curtain** (Art. 992) |', window: 1, required: ['Aquino'], forbidden: [] },
      { file: V2_SPEC, anchor: '| Art. 992 | Iron Curtain |', window: 1, required: ['Aquino'], forbidden: [] },
      { file: V2_SPEC, anchor: '| **Iron Curtain Rule** |', window: 1, required: ['Aquino'], forbidden: [] },
      { file: NCC, anchor: '"Art.992":', window: 1, required: ['Aquino', 'Iron Curtain'], forbidden: [] },
    ],
  },
  {
    id: 'C2',
    statement:
      "Art. 900 ¶2 states the statutory three-month window and the five-year cohabitation defeater, and the engine's divergent predicate is recorded rather than hidden.",
    locations: [
      {
        file: ENGINE_SPEC,
        // The plan's Reference A anchor `**Articulo mortis** (Art. 900 ¶2)` occurs
        // TWICE in this file (the rule block and a later summary-table row), so it
        // is extended with the words that follow it on the same line to identify a
        // single location. Same place, unambiguous.
        anchor: "**Articulo mortis** (Art. 900 ¶2): the spouse's legitime is reduced",
        window: 14,
        required: [
          'died within three months',
          'more than five years',
          'KNOWN DIVERGENCE: engine/src/step5_legitimes.rs',
        ],
        forbidden: [
          'Marriage contracted during the illness that caused death',
          'Decedent did not recover',
          '3-condition check',
        ],
      },
    ],
  },
  {
    id: 'C3',
    statement:
      "Art. 972 ¶1's prohibition on representation in the ascending line is stated, and names the committed vector that proves it.",
    locations: [
      {
        file: ENGINE_SPEC,
        anchor: '- **Collateral limit** (Art. 972)',
        window: 3,
        before: 3,
        required: [
          'Art. 972 ¶1',
          'never in the ascending',
          'test_law04_no_representation_in_the_ascending_line',
        ],
        forbidden: [],
      },
    ],
  },
  {
    id: 'C4',
    statement:
      'The vanishing-deduction reduction ratio includes 5F Transfers for Public Use (corrected in Phase 8 under LAW-09).',
    locations: [
      {
        file: TAX_SPEC,
        anchor: '### 9.6 Vanishing Deduction (5E)',
        window: 12,
        required: ['5F Transfers for Public Use'],
        forbidden: ['elitTotal = sum of 5A + 5B + 5C + 5D'],
      },
      {
        file: TAX_SPEC,
        // `**Ordering constraint**` alone occurs twice in this file; extended to
        // the words that follow it on the same line so it names one location.
        anchor: '**Ordering constraint**: Gross estate (Item 34)',
        window: 3,
        required: ['5F Transfers for Public Use'],
        forbidden: [],
      },
    ],
  },
];

const violations = [];
function violation(marker, detail) {
  violations.push(`${marker} — ${detail}`);
}

/** Printed on EVERY exit path, success and failure alike. */
function skipReport(total) {
  console.log(`GATE-SKIPS total=${total} skipped=0`);
}

function unreadable(message) {
  console.error(`SPEC SCAN UNREADABLE: ${message}`);
  skipReport(0);
  process.exit(1);
}

// --- argument parsing -------------------------------------------------------

function parseArgs(argv) {
  const out = { root: APP_DIR };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--root') {
      const value = argv[i + 1];
      if (!value) unreadable('--root needs a path');
      out.root = path.resolve(process.cwd(), value);
      i += 1;
    } else {
      unreadable(`unknown option ${argv[i]}`);
    }
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));

/** `--root` accepts a directory OR a single file.
 *
 *  Directory: each named spec resolves to its basename inside that directory.
 *  File: EVERY named spec resolves to that one file, so a single small markdown
 *  fixture can stand in for all four documents at once and drive one failure
 *  path. The committed fixtures use the file form. Both forms are read-only. */
const FIXTURE_MODE = args.root !== APP_DIR;
let ROOT_IS_FILE = false;
if (FIXTURE_MODE) {
  if (!existsSync(args.root)) unreadable(`--root path ${args.root} does not exist`);
  ROOT_IS_FILE = !statSync(args.root).isDirectory();
}

function resolveFile(rel) {
  if (!FIXTURE_MODE) return path.join(APP_DIR, rel);
  if (ROOT_IS_FILE) return args.root;
  return path.join(args.root, path.basename(rel));
}

// --- read every named file once ---------------------------------------------

const texts = new Map();
const allFiles = [...new Set(CORRECTIONS.flatMap((c) => c.locations.map((l) => l.file)))];
for (const rel of allFiles) {
  const abs = resolveFile(rel);
  if (!existsSync(abs)) unreadable(`${rel} not found at ${abs}`);
  try {
    texts.set(rel, readFileSync(abs, 'utf8'));
  } catch (err) {
    unreadable(`could not read ${abs}: ${err && err.message}`);
  }
}

// --- literal (never regex) counting -----------------------------------------

function countLiteral(haystack, needle) {
  if (needle === '') return 0;
  return haystack.split(needle).length - 1;
}

// --- the scan ---------------------------------------------------------------

let locationCount = 0;

for (const correction of CORRECTIONS) {
  for (const loc of correction.locations) {
    locationCount += 1;
    const text = texts.get(loc.file);
    const lines = text.split('\n');

    const occurrences = countLiteral(text, loc.anchor);
    if (occurrences !== 1) {
      violation(
        'SPEC ANCHOR MISSING',
        `${correction.id}: anchor '${loc.anchor}' occurs ${occurrences} time(s) in ${loc.file}, expected exactly 1${occurrences === 0 ? ' (the passage moved or was renamed)' : ' (the anchor no longer identifies a single location)'}`,
      );
      continue;
    }

    const anchorLine = lines.findIndex((l) => l.includes(loc.anchor));
    const before = typeof loc.before === 'number' ? loc.before : 0;
    const from = Math.max(0, anchorLine - before);
    const to = Math.min(lines.length, anchorLine + loc.window + 1);
    const windowText = lines.slice(from, to).join('\n');

    for (const req of loc.required) {
      if (!windowText.includes(req)) {
        violation(
          'CORRECTION MISSING',
          `${correction.id}: ${loc.file} lacks the required text '${req}' within ${before > 0 ? `the ${before} line(s) before and ` : ''}${loc.window} line(s) after '${loc.anchor}'. ${correction.statement}`,
        );
      }
    }

    for (const bad of loc.forbidden) {
      if (text.includes(bad)) {
        violation(
          'MISSTATEMENT PRESENT',
          `${correction.id}: ${loc.file} still contains the superseded text '${bad}'. ${correction.statement}`,
        );
      }
    }
  }
}

// --- verdict ----------------------------------------------------------------

if (violations.length > 0) {
  for (const v of violations) console.error(v);
  skipReport(CORRECTIONS.length);
  process.exit(1);
}

console.log(`SPEC LEGAL TEXT OK — ${CORRECTIONS.length} correction(s), ${locationCount} location(s) checked`);
skipReport(CORRECTIONS.length);
process.exit(0);
