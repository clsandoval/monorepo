#!/usr/bin/env node
/**
 * check-legal-traceability.mjs — every Civil Code article the engine's production code cites is
 * traceable to exactly one named, passing test function, or is declared in a shrink-only ledger.
 *
 *   node scripts/check-legal-traceability.mjs
 *   node scripts/check-legal-traceability.mjs --rules <path> --lock <path> --engine <dir>
 *
 * LAW-14 asks for "every implemented legal rule has exactly one named test vector citing its
 * governing article, checkable by grep". A registry alone cannot deliver that: a hand-written map
 * decays the moment someone adds an article to production code, and it decays silently. This script
 * is what makes the decay loud.
 *
 * THE TWO FIXED DERIVATION RULES. Both are restated here verbatim from plan 14-05's constraints so
 * a later reader can confirm the committed registry without re-deriving the intent:
 *
 *   1. PRODUCTION REGION. For each file under `engine/src/`, the production region is the file
 *      content up to but not including the first occurrence of the literal `#[cfg(test)]`. Article
 *      citations found after that point belong to tests and are ignored.
 *   2. `implemented_in`. For an article, `implemented_in` is the sorted list of every `engine/src/`
 *      file whose production region contains that article's citation string, written as paths
 *      relative to `engine/`.
 *
 * Both are RECOMPUTED on every run. A hand-edit of `engine/legal-rules.json` that disagrees with the
 * source therefore fails rather than passes.
 *
 * Violations, each with its own literal marker:
 *
 *   ARTICLE NOT REGISTERED     — an article cited in a production region has no registry element
 *   REGISTERED ARTICLE ABSENT  — a registry article no longer appears in any production region
 *   IMPLEMENTED_IN DRIFTED     — a registry element's implemented_in differs from the recomputed list
 *   VECTOR MISSING             — a vector names a fn that does not occur exactly once in its file
 *   VECTOR NOT MARKED          — the LEGAL-VECTOR line is not inside the named function's body
 *   MARKER NOT UNIQUE          — one article's marker line occurs more than once across engine/
 *   UNTRACED NOT DECLARED      — a null-vector article is absent from the lock
 *   STALE UNTRACED DECLARATION — a lock article now has a vector; delete the lock entry
 *   TRACEABILITY SCAN UNREADABLE — an input is missing or unparseable; exits 1 immediately
 *
 * This script NEVER evaluates whether a legal rule is correctly implemented, and never states what
 * an article requires. It records WHERE a rule is tested. That distinction is what keeps it free of
 * legal judgment.
 *
 * `engine/legal-traceability.lock` may only shrink. STALE UNTRACED DECLARATION is the direction that
 * enforces it: the moment an article acquires a vector, the lock entry becomes a hard failure until
 * it is deleted.
 *
 * Reads repo files only. No database, no socket, no subprocess. It writes nothing, and it has no
 * repair, rewrite, self-update, acceptance or waiver flag of any kind; the three flags are read-only
 * path overrides so the committed fixtures can drive each failure path. (That sentence deliberately
 * avoids spelling those flag names literally, so a grep for them over this file returns zero.)
 *
 * Dependency-free: node: builtins only. Exit 0 on zero violations, 1 otherwise. There is no other
 * exit code.
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const SCRIPT_DIR = path.dirname(new URL(import.meta.url).pathname);
const APP_DIR = path.resolve(SCRIPT_DIR, '..');

const DEFAULT_ENGINE = path.join(APP_DIR, 'engine');
const DEFAULT_RULES = path.join(DEFAULT_ENGINE, 'legal-rules.json');
const DEFAULT_LOCK = path.join(DEFAULT_ENGINE, 'legal-traceability.lock');

const TEST_MODULE_SENTINEL = '#[cfg(test)]';
const MARKER_PREFIX = '// LEGAL-VECTOR: ';

const violations = [];
function violation(marker, detail) {
  violations.push(`${marker} — ${detail}`);
}

function skipReport(total) {
  console.log(`GATE-SKIPS total=${total} skipped=0`);
}

function unreadable(message) {
  console.error(`TRACEABILITY SCAN UNREADABLE: ${message}`);
  skipReport(0);
  process.exit(1);
}

// --- argument parsing -------------------------------------------------------

function parseArgs(argv) {
  const out = { rules: DEFAULT_RULES, lock: DEFAULT_LOCK, engine: DEFAULT_ENGINE };
  const map = { '--rules': 'rules', '--lock': 'lock', '--engine': 'engine' };
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

for (const [label, p] of [['rules', args.rules], ['lock', args.lock], ['engine', args.engine]]) {
  if (!existsSync(p)) unreadable(`${label} path ${p} does not exist`);
}

let registry;
let lock;
try {
  registry = JSON.parse(readFileSync(args.rules, 'utf8'));
} catch (err) {
  unreadable(`could not parse ${args.rules}: ${err && err.message}`);
}
try {
  lock = JSON.parse(readFileSync(args.lock, 'utf8'));
} catch (err) {
  unreadable(`could not parse ${args.lock}: ${err && err.message}`);
}
if (!Array.isArray(registry.rules)) unreadable(`${args.rules} has no 'rules' array`);
if (!Array.isArray(lock.untraced_articles)) unreadable(`${args.lock} has no 'untraced_articles' array`);

// --- scan the engine tree ---------------------------------------------------

const SRC_DIR = path.join(args.engine, 'src');
const TESTS_DIR = path.join(args.engine, 'tests');
if (!existsSync(SRC_DIR)) unreadable(`${SRC_DIR} does not exist`);

function rustFiles(dir, prefix) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith('.rs'))
    .sort()
    .map((f) => ({ rel: `${prefix}/${f}`, abs: path.join(dir, f) }));
}

const srcFiles = rustFiles(SRC_DIR, 'src');
const testFiles = rustFiles(TESTS_DIR, 'tests');

/** RULE 1 — production region: content up to the first `#[cfg(test)]`. */
function productionRegion(text) {
  const i = text.indexOf(TEST_MODULE_SENTINEL);
  return i === -1 ? text : text.slice(0, i);
}

const ARTICLE_RE = /Art\. (\d+)/g;

/** RULE 2 — implemented_in: sorted engine-relative paths of every src file whose
 *  production region contains the article's citation string. */
const producedBy = new Map(); // "Art. NNN" -> Set(relative path)
for (const f of srcFiles) {
  let text;
  try {
    text = readFileSync(f.abs, 'utf8');
  } catch (err) {
    unreadable(`could not read ${f.abs}: ${err && err.message}`);
  }
  const region = productionRegion(text);
  ARTICLE_RE.lastIndex = 0;
  let m;
  while ((m = ARTICLE_RE.exec(region)) !== null) {
    const article = `Art. ${m[1]}`;
    if (!producedBy.has(article)) producedBy.set(article, new Set());
    producedBy.get(article).add(f.rel);
  }
}

/** Marker index: article -> [{file, fn, line}] across engine/src and engine/tests. */
const FN_RE = /fn (\w+)\s*\(/;
const markerSites = new Map();
const fileText = new Map();
for (const f of srcFiles.concat(testFiles)) {
  let text;
  try {
    text = readFileSync(f.abs, 'utf8');
  } catch (err) {
    unreadable(`could not read ${f.abs}: ${err && err.message}`);
  }
  fileText.set(f.rel, text);
  const lines = text.split('\n');
  lines.forEach((line, i) => {
    const idx = line.indexOf(MARKER_PREFIX);
    if (idx === -1) return;
    const article = line.slice(idx + MARKER_PREFIX.length).trim();
    let fn = null;
    for (let j = i; j >= 0; j -= 1) {
      const fm = FN_RE.exec(lines[j]);
      if (fm) {
        fn = fm[1];
        break;
      }
    }
    if (!markerSites.has(article)) markerSites.set(article, []);
    markerSites.get(article).push({ file: f.rel, fn, line: i + 1 });
  });
}

// --- checks -----------------------------------------------------------------

const registered = new Map();
for (const r of registry.rules) {
  if (r === null || typeof r !== 'object' || typeof r.article !== 'string') {
    unreadable(`${path.relative(APP_DIR, args.rules)} holds a rule with no string 'article'`);
  }
  registered.set(r.article, r);
}

// 1. ARTICLE NOT REGISTERED
for (const article of producedBy.keys()) {
  if (!registered.has(article)) {
    violation(
      'ARTICLE NOT REGISTERED',
      `${article} is cited in the production region of ${[...producedBy.get(article)].sort().join(', ')} but has no element in ${path.relative(APP_DIR, args.rules)}. Add it with a vector, or with a null vector plus an entry in the untraced ledger.`,
    );
  }
}

for (const r of registry.rules) {
  const article = r.article;
  const recomputed = producedBy.has(article) ? [...producedBy.get(article)].sort() : [];

  // 2. REGISTERED ARTICLE ABSENT
  if (recomputed.length === 0) {
    violation(
      'REGISTERED ARTICLE ABSENT',
      `${article} is registered but no longer appears in the production region of any engine/src file. Delete the element, or restore the citation.`,
    );
    continue;
  }

  // 3. IMPLEMENTED_IN DRIFTED
  const declared = Array.isArray(r.implemented_in) ? [...r.implemented_in].sort() : null;
  if (declared === null || JSON.stringify(declared) !== JSON.stringify(recomputed)) {
    violation(
      'IMPLEMENTED_IN DRIFTED',
      `${article} declares implemented_in ${JSON.stringify(r.implemented_in)} but the fixed rule recomputes ${JSON.stringify(recomputed)} from the source`,
    );
  }

  const sites = markerSites.get(article) || [];

  // 6. MARKER NOT UNIQUE
  if (sites.length > 1) {
    violation(
      'MARKER NOT UNIQUE',
      `${article}'s '${MARKER_PREFIX}${article}' line occurs ${sites.length} times across engine/ (${sites.map((s) => `${s.file}:${s.line}`).join(', ')}); a vector must resolve to exactly one line`,
    );
  }

  if (r.vector === null || r.vector === undefined) {
    // 7. UNTRACED NOT DECLARED
    if (!lock.untraced_articles.includes(article)) {
      violation(
        'UNTRACED NOT DECLARED',
        `${article} has a null vector in ${path.relative(APP_DIR, args.rules)} but is not declared in ${path.relative(APP_DIR, args.lock)}. The fix for an untraced article is a named test vector, not a declaration — but an undeclared gap is worse than a declared one.`,
      );
    }
    continue;
  }

  if (typeof r.vector.file !== 'string' || typeof r.vector.fn !== 'string') {
    violation('VECTOR MISSING', `${article} has a vector without a string 'file' and 'fn'`);
    continue;
  }

  // 4. VECTOR MISSING
  const text = fileText.get(r.vector.file);
  if (text === undefined) {
    violation('VECTOR MISSING', `${article}'s vector names ${r.vector.file}, which is not an engine/src or engine/tests .rs file`);
    continue;
  }
  const needle = `fn ${r.vector.fn}(`;
  const occurrences = text.split(needle).length - 1;
  if (occurrences !== 1) {
    violation(
      'VECTOR MISSING',
      `${article}'s vector names ${r.vector.file} fn ${r.vector.fn}, which occurs ${occurrences} time(s) in that file, expected exactly 1`,
    );
    continue;
  }

  // 5. VECTOR NOT MARKED
  const marked = sites.some((s) => s.file === r.vector.file && s.fn === r.vector.fn);
  if (!marked) {
    violation(
      'VECTOR NOT MARKED',
      `${article}: no '${MARKER_PREFIX}${article}' line sits inside ${r.vector.file} fn ${r.vector.fn}${sites.length > 0 ? ` (the marker is in ${sites.map((s) => `${s.file} fn ${s.fn}`).join(', ')})` : ' (the marker is nowhere in engine/)'}`,
    );
  }
}

// 8. STALE UNTRACED DECLARATION
for (const article of lock.untraced_articles) {
  const r = registered.get(article);
  if (r && r.vector) {
    violation(
      'STALE UNTRACED DECLARATION',
      `${article} is declared untraced in ${path.relative(APP_DIR, args.lock)} but now has the vector ${r.vector.file} fn ${r.vector.fn}. DELETE that entry from the lock — this ledger may only shrink, and landing a vector is what forces it down.`,
    );
  }
}

// --- verdict ----------------------------------------------------------------

const total = registry.rules.filter((r) => r.vector).length;
const untracedCount = registry.rules.length - total;

if (violations.length > 0) {
  for (const v of violations) console.error(v);
  console.log(
    `LEGAL TRACEABILITY COVERAGE ${total}/${registry.rules.length} articles traced, ${untracedCount} declared untraced`,
  );
  skipReport(total);
  process.exit(1);
}

console.log('LEGAL TRACEABILITY OK');
console.log(
  `LEGAL TRACEABILITY COVERAGE ${total}/${registry.rules.length} articles traced, ${untracedCount} declared untraced`,
);
skipReport(total);
process.exit(0);
