#!/usr/bin/env node
/**
 * check-new-rule-procedure.mjs — keeps `.planning/NEW-LEGAL-RULE.md` present,
 * ordered, complete, and still resolving against the engine it describes.
 *
 *   node scripts/check-new-rule-procedure.mjs
 *   node scripts/check-new-rule-procedure.mjs --procedure <path>
 *
 * EXT-06 asks for a documented procedure for adding a NEW legal rule: article →
 * vector → implementation → gate. A document nobody runs decays, and it decays
 * quietly — the reader who needed it is the reader least able to notice it is
 * wrong.
 *
 * So this check does more than confirm five headings exist. It re-resolves the
 * document's WORKED EXAMPLE against the tree on every run: the example names one
 * real article, one real engine file and one real test function, and if that
 * function is renamed, moved, or loses its `// LEGAL-VECTOR:` marker, the
 * procedure goes red and says which of the four resolutions failed.
 *
 * The example is anchored by article, file path and function NAME — never by a
 * line number. Phases 5, 7 and 8 all rewrote the files a registry points at, so
 * a line-number anchor is a guaranteed future false alarm.
 *
 * The marker-to-function association mirrors `scripts/check-legal-traceability.mjs`
 * exactly: a `// LEGAL-VECTOR: Art. NNN` line belongs to the nearest PRECEDING
 * `fn <name>(` line. In this tree the marker conventionally sits on the first
 * line of the test body, not above the signature.
 *
 * Violations, each with its own literal marker:
 *
 *   PROCEDURE MISSING     — no '# Adding a new legal rule' heading
 *   STEP MISSING          — not exactly five '## Step N — ' headings, or a title differs
 *   STEP ORDER            — the five step headings are not in ascending numeric order
 *   ARTIFACT NOT NAMED    — one of the seven required artifact strings is absent
 *   WORKED EXAMPLE BROKEN — the example's article, file or function no longer resolves
 *   PROCEDURE UNREADABLE  — an input is missing or unparseable; exits 2, not 1
 *
 * The exit contract is three-valued on purpose. Exit 2 is a cannot-run condition
 * and is deliberately distinct from exit 1 (a rule was read and violated),
 * matching the `GATE CANNOT RUN` / failure split in
 * `.planning/PLAN-STANDARD.md` section 3.
 *
 * `engine/legal-rules.json` and the `engine/src` and `engine/tests` trees are
 * NOT overridable. The worked example must resolve against the real engine or
 * the check certifies nothing.
 *
 * This script NEVER evaluates whether a legal rule is correct, and never states
 * one. It checks structural agreement and nothing else.
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

const DEFAULT_PROCEDURE = path.join(APP_DIR, '.planning', 'NEW-LEGAL-RULE.md');
const ENGINE_DIR = path.join(APP_DIR, 'engine');
const RULES_PATH = path.join(ENGINE_DIR, 'legal-rules.json');

const TITLE_HEADING = '# Adding a new legal rule';

/** The five step titles in order. Hardcoded so the expectation is auditable HERE
 *  rather than inferred from whichever file is being checked. */
const EXPECTED_STEPS = [
  'Find the article in a spec, or stop',
  'Name the vector and mark it',
  'Watch it fail',
  'Implement at exactly one site',
  'Register and close the loop',
];

/** Every artifact the procedure must still name. A step that stops naming its
 *  file is a step nobody can follow. */
const REQUIRED_ARTIFACTS = [
  'engine/legal-rules.json',
  'engine/legal-traceability.lock',
  '// LEGAL-VECTOR: Art. ',
  'node scripts/check-legal-traceability.mjs',
  '.planning/LEGAL-CORRECTION-WORKFLOW.md',
  '.planning/LAWYER-AGENDA.md',
  '.planning/PLAN-STANDARD.md',
];

const MARKER_PREFIX = '// LEGAL-VECTOR: ';
const FN_RE = /fn (\w+)\s*\(/;

const violations = [];
function violation(marker, detail) {
  violations.push(`${marker} — ${detail}`);
}

/** Printed on EVERY exit path, success and failure alike. Gate G8 fails with
 *  SKIP REPORT MISSING on a log that lacks it. */
function skipReport() {
  console.log(`GATE-SKIPS total=${EXPECTED_STEPS.length} skipped=0`);
}

/** Exit 2 with PROCEDURE UNREADABLE. Cannot-run, not a violation. */
function unreadable(message) {
  console.error(`PROCEDURE UNREADABLE: ${message}`);
  skipReport();
  process.exit(2);
}

// --- argument parsing -------------------------------------------------------

function parseArgs(argv) {
  let procedure = DEFAULT_PROCEDURE;
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--procedure') {
      const next = argv[i + 1];
      if (!next) unreadable('--procedure was given without a path.');
      procedure = path.resolve(process.cwd(), next);
      i += 1;
    } else {
      unreadable(`unrecognised argument '${argv[i]}'. The only flag is --procedure <path>.`);
    }
  }
  return { procedure };
}

const { procedure: PROCEDURE_PATH } = parseArgs(process.argv.slice(2));

// --- read inputs ------------------------------------------------------------

if (!existsSync(PROCEDURE_PATH)) unreadable(`${PROCEDURE_PATH} does not exist.`);
if (!existsSync(RULES_PATH)) unreadable(`${RULES_PATH} does not exist.`);

let text;
try {
  text = readFileSync(PROCEDURE_PATH, 'utf8');
} catch (err) {
  unreadable(`${PROCEDURE_PATH} could not be read: ${err.message}`);
}

let registry;
try {
  registry = JSON.parse(readFileSync(RULES_PATH, 'utf8'));
} catch (err) {
  unreadable(`${RULES_PATH} could not be parsed: ${err.message}`);
}
if (!registry || !Array.isArray(registry.rules)) {
  unreadable(`${RULES_PATH} has no 'rules' array.`);
}

const lines = text.split('\n');
const rel = path.relative(APP_DIR, PROCEDURE_PATH) || PROCEDURE_PATH;

// --- 1. PROCEDURE MISSING ---------------------------------------------------

if (!lines.some((l) => l.trim() === TITLE_HEADING)) {
  violation(
    'PROCEDURE MISSING',
    `${rel} has no line equal to '${TITLE_HEADING}'. EXT-06 requires that document; without it there is no stated route from an article to an implemented rule.`,
  );
}

// --- 2. STEP MISSING / 3. STEP ORDER ----------------------------------------

const stepHeadings = [];
for (let i = 0; i < lines.length; i += 1) {
  const m = /^## Step (\d+) — (.+)$/.exec(lines[i].trim());
  if (m) stepHeadings.push({ n: Number(m[1]), title: m[2].trim(), line: i + 1 });
}

if (stepHeadings.length !== EXPECTED_STEPS.length) {
  violation(
    'STEP MISSING',
    `${rel} holds ${stepHeadings.length} '## Step N — ' heading(s), expected ${EXPECTED_STEPS.length}.`,
  );
}

for (let i = 0; i < EXPECTED_STEPS.length; i += 1) {
  const expected = EXPECTED_STEPS[i];
  const got = stepHeadings.find((s) => s.n === i + 1);
  if (!got) {
    violation(
      'STEP MISSING',
      `step ${i + 1} ('${expected}') has no '## Step ${i + 1} — ' heading in ${rel}.`,
    );
  } else if (got.title !== expected) {
    violation(
      'STEP MISSING',
      `step ${i + 1} of ${rel} should be titled '${expected}', found '${got.title}'.`,
    );
  }
}

const order = stepHeadings.map((s) => s.n);
const ascending = order.every((n, i) => i === 0 || n > order[i - 1]);
if (!ascending) {
  violation(
    'STEP ORDER',
    `the step headings of ${rel} appear in the order [${order.join(', ')}], which is not ascending. The order is fixed, not discovered: the vector comes before the implementation.`,
  );
}

// --- 4. ARTIFACT NOT NAMED --------------------------------------------------

for (const artifact of REQUIRED_ARTIFACTS) {
  if (!text.includes(artifact)) {
    violation(
      'ARTIFACT NOT NAMED',
      `${rel} no longer names '${artifact}' anywhere. A step that stops naming the file it needs is a step nobody can follow.`,
    );
  }
}

// --- 5. WORKED EXAMPLE BROKEN -----------------------------------------------

function soleValue(label) {
  const found = [];
  for (const line of lines) {
    const m = new RegExp(`^\\*\\*${label}:\\*\\*\\s*(.+?)\\s*$`).exec(line);
    if (m) found.push(m[1]);
  }
  return found;
}

const articleHits = soleValue('Article');
const fileHits = soleValue('Vector file');
const fnHits = soleValue('Vector function');

let exampleOk = true;
for (const [label, hits] of [
  ['Article', articleHits],
  ['Vector file', fileHits],
  ['Vector function', fnHits],
]) {
  if (hits.length !== 1) {
    exampleOk = false;
    violation(
      'WORKED EXAMPLE BROKEN',
      `resolution 1 of 4 failed: ${rel} holds ${hits.length} '**${label}:**' line(s), expected exactly 1.`,
    );
  }
}

if (exampleOk) {
  const article = articleHits[0];
  const vfile = fileHits[0];
  const vfn = fnHits[0];

  const rule = registry.rules.find((r) => r && r.article === article);
  if (!rule) {
    violation(
      'WORKED EXAMPLE BROKEN',
      `resolution 2 of 4 failed: the worked example names '${article}', which has no element in engine/legal-rules.json.`,
    );
  }

  const abs = path.join(ENGINE_DIR, vfile);
  if (!existsSync(abs)) {
    violation(
      'WORKED EXAMPLE BROKEN',
      `resolution 3 of 4 failed: the worked example names vector file '${vfile}', which does not exist under engine/.`,
    );
  } else {
    let src = '';
    try {
      src = readFileSync(abs, 'utf8');
    } catch (err) {
      unreadable(`${abs} could not be read: ${err.message}`);
    }
    const srcLines = src.split('\n');

    // The marker belongs to the nearest PRECEDING `fn <name>(` line — the same
    // association scripts/check-legal-traceability.mjs uses.
    let matched = false;
    srcLines.forEach((line, i) => {
      const idx = line.indexOf(MARKER_PREFIX);
      if (idx === -1) return;
      if (line.slice(idx + MARKER_PREFIX.length).trim() !== article) return;
      for (let j = i; j >= 0; j -= 1) {
        const fm = FN_RE.exec(srcLines[j]);
        if (fm) {
          if (fm[1] === vfn) matched = true;
          return;
        }
      }
    });

    if (!matched) {
      violation(
        'WORKED EXAMPLE BROKEN',
        `resolution 4 of 4 failed: engine/${vfile} has no '${MARKER_PREFIX}${article}' marker attributed to a function named '${vfn}'. The function was renamed, moved, or lost its marker — re-anchor the worked example.`,
      );
    }
  }
}

// --- verdict ----------------------------------------------------------------

if (violations.length > 0) {
  for (const v of violations) console.error(v);
  skipReport();
  process.exit(1);
}

console.log(
  `NEW RULE PROCEDURE OK — ${EXPECTED_STEPS.length} step(s) checked, worked example resolves`,
);
skipReport();
process.exit(0);
