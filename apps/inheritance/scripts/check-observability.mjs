#!/usr/bin/env node
/**
 * check-observability.mjs — the static half of the engine-observability guard.
 *
 *   node scripts/check-observability.mjs
 *   node scripts/check-observability.mjs --finalize <path> --flags <path>
 *
 * Phase 5 removed two hardcoded lines that made every legal defect invisible:
 * one suppressed the warning channel, the other zeroed the legitime and
 * free-portion split on every heir row. Both survived in this codebase for the
 * whole of its life, unnoticed, which is exactly why a grep-level guard is
 * warranted alongside a behavioral one.
 *
 * Two mechanisms, catching different failures:
 *   - engine/tests/observability.rs (gate G1) catches a BEHAVIORAL regression —
 *     a step changes and the fractions go empty again.
 *   - this script (gate G11) catches a SOURCE regression — the literal returns
 *     on a path no test happens to cover.
 *
 * Violations, each with its own literal marker:
 *
 *   WARNINGS SUPPRESSED          - the finalize file re-hardcodes an empty warnings vector
 *   SUBCOMPONENTS ZEROED         - the finalize file re-empties legitime_fraction, or the TODO returns
 *   FLAG CODE MISSING            - one of the ten spec flag codes is not declared
 *   FLAG CODE UNTESTED           - a declared code is exercised by nothing
 *   OUTPUT CHECK MISSING         - the runtime conservation/uniqueness check is gone
 *   BOUNDARY ERROR UNSTRUCTURED  - the WASM boundary stopped naming its failure kind
 *   OBSERVABILITY SCAN UNREADABLE - an input is missing or unreadable; exits 1 immediately
 *
 * All matching is LITERAL, never regular-expression: the searched strings contain
 * `[`, `]`, `!`, `:` and `(`, which are regex metacharacters, and treating them as
 * a pattern would silently change what is checked.
 *
 * Reads repo files only. No database, no socket, no subprocess. It has no flag
 * that rewrites, repairs or regenerates anything; the five flags are read-only
 * path overrides so fixtures can drive the failure paths.
 *
 * Dependency-free: node: builtins only. Exit 0 on zero violations, 1 otherwise.
 * There is no other exit code.
 */

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const SCRIPT_DIR = path.dirname(new URL(import.meta.url).pathname);
const APP_DIR = path.resolve(SCRIPT_DIR, '..');

const DEFAULTS = {
  finalize: path.join(APP_DIR, 'engine', 'src', 'step10_finalize.rs'),
  flags: path.join(APP_DIR, 'engine', 'src', 'flags.rs'),
  wasm: path.join(APP_DIR, 'engine', 'src', 'wasm.rs'),
  outputCheck: path.join(APP_DIR, 'engine', 'src', 'output_check.rs'),
  corpusTest: path.join(APP_DIR, 'engine', 'tests', 'observability.rs'),
};

/** The ten manual-review flag codes, in the order specs/inheritance-engine-spec.md
 *  section 13.1 tables them. Hardcoded so the expected set is auditable here
 *  rather than inferred from whichever file is being checked. */
const SPEC_FLAG_CODES = [
  'GRANDPARENT_OF_ILLEGITIMATE',
  'CROSS_CLASS_ACCRETION',
  'RESERVA_TRONCAL',
  'COLLATION_DISPUTE',
  'RA_11642_RETROACTIVITY',
  'ARTICULO_MORTIS',
  'USUFRUCT_ANNUITY_OPTION',
  'DUAL_LINE_ASCENDANT',
  'POSTHUMOUS_DISINHERITANCE',
  'CONTRADICTORY_DISPOSITIONS',
];

/** Literals whose reappearance in the finalize file re-suppresses observability.
 *  Assembled from fragments so this script's own source cannot match itself. */
const SUPPRESSED_WARNINGS_LITERAL = 'warnings: ' + 'vec![]';
const EMPTY_FRACTION_LITERAL = 'legitime_fraction: ' + 'String::new()';
const ROUND_TODO_LITERAL = 'round sub-' + 'components';

const violations = [];
let filesScanned = 0;
let suppressedLines = 0;

/** Printed on EVERY exit path, success and failure alike. Gate G8 fails with
 *  SKIP REPORT MISSING on a log that lacks it. */
function skipReport(total) {
  console.log(`GATE-SKIPS total=${total} skipped=0`);
}

/** Exit 1 with OBSERVABILITY SCAN UNREADABLE. Never exit 0 on an internal error. */
function unreadable(message) {
  console.error(`OBSERVABILITY SCAN UNREADABLE: ${message}`);
  skipReport(0);
  process.exit(1);
}

function violation(marker, detail) {
  violations.push(`${marker}: ${detail}`);
}

// --- argument parsing -------------------------------------------------------

function parseArgs(argv) {
  const out = { ...DEFAULTS };
  const map = {
    '--finalize': 'finalize',
    '--flags': 'flags',
    '--wasm': 'wasm',
    '--output-check': 'outputCheck',
    '--corpus-test': 'corpusTest',
  };
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

const LABELS = {
  finalize: 'finalize',
  flags: 'flags',
  wasm: 'wasm',
  outputCheck: 'output-check',
  corpusTest: 'corpus-test',
};

const source = {};
for (const key of Object.keys(DEFAULTS)) {
  const file = args[key];
  if (!existsSync(file)) {
    unreadable(`${LABELS[key]} file ${file} does not exist`);
  }
  try {
    source[key] = readFileSync(file, 'utf8');
  } catch (err) {
    unreadable(`${LABELS[key]} file ${file} could not be read: ${err.message}`);
  }
  filesScanned += 1;
}

function rel(file) {
  return path.relative(APP_DIR, file) || file;
}

/** A line that is entirely a Rust line comment. Verdicts 1 and 2 ignore these,
 *  because a doc comment explaining what was removed must not re-trigger the
 *  gate that documents it. */
function isCommentLine(line) {
  return line.trim().startsWith('//');
}

// --- 1. WARNINGS SUPPRESSED -------------------------------------------------

{
  const lines = source.finalize.split('\n');
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (isCommentLine(line)) continue;
    if (line.includes(SUPPRESSED_WARNINGS_LITERAL)) {
      suppressedLines += 1;
      violation(
        'WARNINGS SUPPRESSED',
        `${rel(args.finalize)}:${i + 1} re-hardcodes an empty warnings vector. ` +
          'Every legal defect becomes invisible again the moment this line returns.',
      );
    }
  }
}

// --- 2. SUBCOMPONENTS ZEROED ------------------------------------------------

{
  const lines = source.finalize.split('\n');
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (isCommentLine(line)) continue;
    for (const literal of [EMPTY_FRACTION_LITERAL, ROUND_TODO_LITERAL]) {
      if (line.includes(literal)) {
        suppressedLines += 1;
        violation(
          'SUBCOMPONENTS ZEROED',
          `${rel(args.finalize)}:${i + 1} matched the literal "${literal}". ` +
            'The legitime / free-portion / intestate split must be reported, not blanked.',
        );
      }
    }
  }
}

// --- 3. FLAG CODE MISSING ---------------------------------------------------

const missingCodes = SPEC_FLAG_CODES.filter((code) => !source.flags.includes(code));
for (const code of missingCodes) {
  violation(
    'FLAG CODE MISSING',
    `${code} is not declared in ${rel(args.flags)}. The engine spec section 13.1 names ten manual review flag codes.`,
  );
}

// --- 4. FLAG CODE UNTESTED --------------------------------------------------

{
  const marker = '#[cfg(test)]';
  const testStart = source.flags.indexOf(marker);
  const flagsTestRegion = testStart === -1 ? '' : source.flags.slice(testStart);
  const present = SPEC_FLAG_CODES.filter((code) => source.flags.includes(code));
  for (const code of present) {
    if (!flagsTestRegion.includes(code) && !source.corpusTest.includes(code)) {
      violation(
        'FLAG CODE UNTESTED',
        `${code} is declared in ${rel(args.flags)} but appears in neither its test region nor ${rel(args.corpusTest)}. ` +
          'A declared constant that nothing exercises is a declaration, not a detector.',
      );
    }
  }
  // A code that is missing entirely is also untested — report it under this
  // verdict too, so removing a constant cannot silence one of the two markers.
  for (const code of missingCodes) {
    violation(
      'FLAG CODE UNTESTED',
      `${code} is absent from ${rel(args.flags)}, so nothing exercises it.`,
    );
  }
}

// --- 5. OUTPUT CHECK MISSING ------------------------------------------------

for (const literal of ['SumMismatch', 'DuplicateHeirId']) {
  if (!source.outputCheck.includes(literal)) {
    violation(
      'OUTPUT CHECK MISSING',
      `${literal} is absent from ${rel(args.outputCheck)}. The runtime conservation and uniqueness check must survive.`,
    );
  }
}
if (!source.wasm.includes('run_pipeline_checked')) {
  violation(
    'OUTPUT CHECK MISSING',
    `run_pipeline_checked is absent from ${rel(args.wasm)}. The browser path must go through the checked entry point.`,
  );
}

// --- 6. BOUNDARY ERROR UNSTRUCTURED -----------------------------------------

{
  const kinds = ['invalid_input', 'output_check', 'serialize'];
  const absent = kinds.filter((k) => !source.wasm.includes(k));
  if (absent.length > 0) {
    violation(
      'BOUNDARY ERROR UNSTRUCTURED',
      `${rel(args.wasm)} no longer names the failure kind${absent.length > 1 ? 's' : ''} ${absent.join(', ')}. ` +
        'A caller must be able to switch on kind rather than match substrings.',
    );
  }
}

// --- verdict ----------------------------------------------------------------

if (violations.length > 0) {
  for (const v of violations) console.error(v);
  skipReport(filesScanned);
  process.exit(1);
}

console.log(
  `OBSERVABILITY OK — ${SPEC_FLAG_CODES.length} flag codes, ${filesScanned} files scanned, ${suppressedLines} suppressed lines`,
);
skipReport(filesScanned);
process.exit(0);
