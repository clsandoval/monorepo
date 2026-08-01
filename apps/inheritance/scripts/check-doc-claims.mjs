#!/usr/bin/env node
/**
 * check-doc-claims.mjs — keeps this repository's project documents from
 * contradicting the code they describe, and keeps the accepted-debt ledger
 * honest in both directions.
 *
 *   node scripts/check-doc-claims.mjs
 *   node scripts/check-doc-claims.mjs --docroot <path>
 *
 * The documents scanned are `CLAUDE.md` plus every `*.md` under
 * `.planning/codebase/`. `CLAUDE.md`'s middle is REGENERATED from those files —
 * the `<!-- GSD:stack-start source:codebase/STACK.md -->` markers say so — which
 * is why both are scanned as one corpus: fixing one without the other is undone
 * by the next regeneration.
 *
 * The load-bearing design decision: NO EXPECTED VALUE IS HARDCODED. Every claim
 * is a PAIR — a set of literal strings that must be absent (or present), and a
 * `probe` measured from the tree at run time that establishes why. A claim only
 * counts as stale while its probe says the code contradicts it. If a future
 * change makes the original claim true again — if `node_modules` is deleted,
 * say — the probe flips and this check stops demanding the correction and says
 * `PROBE FLIPPED` instead. A doc check whose expectations are frozen constants
 * is a doc check that certifies its own author's memory.
 *
 * Violations, each with its own literal marker:
 *
 *   STALE CLAIM         — a forbidden string is present while its probe is true
 *   CLAIM UNSUPPORTED   — a required string is absent while its probe is true
 *   PROBE FLIPPED       — a probe returned false: the CODE moved back, not the doc
 *   DEBT ENTRY MISSING  — one of D1…D7 has no '## D<N>' heading in the ledger
 *   DEBT ENTRY STALE    — a debt entry's claim anchor no longer appears; delete the entry
 *   DOC SCAN UNREADABLE — a scanned document or the ledger is missing or unreadable; exits 2
 *
 * The exit contract is three-valued on purpose. Exit 2 is a cannot-run
 * condition and is deliberately distinct from exit 1 (a claim was read and is
 * stale), matching the `GATE CANNOT RUN` / failure split in
 * `.planning/PLAN-STANDARD.md` section 3.
 *
 * `--docroot` overrides ONLY where the documents are read from, so committed
 * fixtures can drive each failure path. The probes always measure the real tree,
 * because a claim's truth is a property of the code and not of the fixture.
 *
 * `.planning/DOC-DEBT.md` is shrink-only. This script never writes it, and there
 * is no way to make an entry acceptable other than deleting it once its claim is
 * corrected.
 *
 * This script NEVER evaluates a point of law and never touches `specs/` legal
 * prose — gate G27, `node scripts/check-spec-legal-text.mjs`, owns that.
 *
 * Reads repo files only. No database, no socket, no subprocess. It writes no
 * file, and it has no repair, rewrite, self-update, acceptance or waiver flag of
 * any kind; the one flag it does have is a read-only path override. (That
 * sentence deliberately avoids spelling those flag names literally, so a grep
 * for them over this file returns zero — the audit for "can this check rewrite
 * its own input" is a grep, and a prose mention would be a false positive.)
 *
 * Dependency-free: node: builtins only.
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const SCRIPT_DIR = path.dirname(new URL(import.meta.url).pathname);
const APP_DIR = path.resolve(SCRIPT_DIR, '..');
const REPO_DIR = path.resolve(APP_DIR, '..', '..');

const DEFAULT_DEBT = path.join(APP_DIR, '.planning', 'DOC-DEBT.md');

// --- probe helpers (measure the REAL tree, never the docroot) ----------------

const app = (...p) => path.join(APP_DIR, ...p);
const has = (p) => existsSync(app(p));
const isDir = (p) => existsSync(app(p)) && statSync(app(p)).isDirectory();
const contains = (p, needle) => {
  try {
    return readFileSync(app(p), 'utf8').includes(needle);
  } catch {
    return false;
  }
};

function tomlValue(file, key, section) {
  let text;
  try {
    text = readFileSync(app(file), 'utf8');
  } catch {
    return null;
  }
  const lines = text.split('\n');
  let current = null;
  for (const line of lines) {
    const sec = /^\s*\[([^\]]+)\]\s*$/.exec(line);
    if (sec) {
      current = sec[1];
      continue;
    }
    const kv = new RegExp(`^\\s*${key}\\s*=\\s*(.+?)\\s*$`).exec(line);
    if (kv && (section === undefined || current === section)) {
      return kv[1].replace(/^"|"$/g, '');
    }
  }
  return null;
}

const PROJECT_ID = tomlValue('frontend/supabase/config.toml', 'project_id');
const API_PORT = tomlValue('frontend/supabase/config.toml', 'port', 'api');

/**
 * The eleven claims. `probe` true means the code contradicts the old claim, so
 * the `forbidden` strings must be gone and the `required` strings must be there.
 * `probe` false means the code moved back and PROBE FLIPPED fires instead.
 */
const CLAIMS = [
  {
    id: 'C1',
    what: 'the WASM binary is not built',
    probe: () => has('frontend/src/wasm/pkg/inheritance_engine_bg.wasm'),
    forbidden: ['**NOT built.**'],
    required: ['engine/build-wasm.sh'],
  },
  {
    id: 'C2',
    what: 'wasm-pack is not installed',
    probe: () => has('engine/build-wasm.sh'),
    forbidden: ['`wasm-pack` is **not installed**'],
    required: ['scripts/setup-env.sh'],
  },
  {
    id: 'C3',
    what: 'frontend/node_modules is absent',
    probe: () => isDir('frontend/node_modules'),
    forbidden: ['is **absent**', '**NOT runnable as-is.**'],
    required: ['npm ci'],
  },
  {
    id: 'C4',
    what: 'the local Supabase project id is "app"',
    probe: () => PROJECT_ID !== null && PROJECT_ID !== 'app',
    forbidden: ['project id `"app"`'],
    required: PROJECT_ID ? [PROJECT_ID] : [],
  },
  {
    id: 'C5',
    what: 'the local Supabase API port is 54321',
    probe: () => API_PORT !== null && API_PORT !== '54321',
    forbidden: ['54321'],
    required: API_PORT ? [API_PORT] : [],
  },
  {
    id: 'C6',
    what: 'a pinned engine test count',
    probe: () => has('engine/tests/integration.rs'),
    forbidden: ['411 tests pass', '30 tests pass'],
    required: ['cd engine && cargo test'],
  },
  {
    id: 'C7',
    what: 'there is no app-wide error boundary',
    probe: () => has('frontend/src/components/ErrorBoundary.tsx'),
    forbidden: ['No app-wide error boundary'],
    required: ['ErrorBoundary.tsx'],
  },
  {
    id: 'C8',
    what: 'the wizard step index is not addressable from the URL',
    probe: () =>
      contains('frontend/src/components/wizard/WizardContainer.tsx', 'readInitialWizardState'),
    forbidden: ['**Not URL-encoded**'],
    required: ['readInitialWizardState'],
  },
  {
    id: 'C9',
    what: 'the zz_probe / zz_sweep debug harnesses exist',
    probe: () => !has('engine/tests/zz_probe.rs') && !has('engine/tests/zz_sweep.rs'),
    forbidden: ['zz_probe.rs', 'zz_sweep.rs'],
    required: ['fuzz_invariants.rs'],
  },
  {
    id: 'C10',
    what: 'engine errors are untyped JsValue strings',
    probe: () => contains('engine/src/wasm.rs', '"kind"'),
    forbidden: ['not typed error objects'],
    required: ['parseEngineError'],
  },
  {
    id: 'C11',
    what: 'the only CI workflow is inheritance.yml',
    probe: () => existsSync(path.join(REPO_DIR, '.github/workflows/inheritance-ci.yml')),
    forbidden: [],
    required: ['inheritance-ci.yml'],
  },
];

/** The seven accepted-debt entries. Shrink-only: this array may only lose ids. */
const DEBT_IDS = ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7'];

const violations = [];
function violation(marker, detail) {
  violations.push(`${marker} — ${detail}`);
}

/** Printed on EVERY exit path, success and failure alike. Gate G8 fails with
 *  SKIP REPORT MISSING on a log that lacks it. */
function skipReport() {
  console.log(`GATE-SKIPS total=${CLAIMS.length} skipped=0`);
}

/** Exit 2 with DOC SCAN UNREADABLE. Cannot-run, not a violation. */
function unreadable(message) {
  console.error(`DOC SCAN UNREADABLE: ${message}`);
  skipReport();
  process.exit(2);
}

// --- argument parsing -------------------------------------------------------

function parseArgs(argv) {
  let docroot = APP_DIR;
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--docroot') {
      const next = argv[i + 1];
      if (!next) unreadable('--docroot was given without a path.');
      docroot = path.resolve(process.cwd(), next);
      i += 1;
    } else {
      unreadable(`unrecognised argument '${argv[i]}'. The only flag is --docroot <path>.`);
    }
  }
  return { docroot };
}

const { docroot: DOCROOT } = parseArgs(process.argv.slice(2));

// --- collect the scanned documents ------------------------------------------

if (!existsSync(DOCROOT)) unreadable(`${DOCROOT} does not exist.`);

const documents = []; // { rel, text }

function addDoc(abs) {
  let text;
  try {
    text = readFileSync(abs, 'utf8');
  } catch (err) {
    unreadable(`${abs} could not be read: ${err.message}`);
  }
  documents.push({ rel: path.relative(DOCROOT, abs) || path.basename(abs), text });
}

const rootClaude = path.join(DOCROOT, 'CLAUDE.md');
if (existsSync(rootClaude)) addDoc(rootClaude);

const codebaseDir = path.join(DOCROOT, '.planning', 'codebase');
const seen = new Set([rootClaude]);

function scanDir(dir) {
  if (!existsSync(dir) || !statSync(dir).isDirectory()) return;
  for (const f of readdirSync(dir).sort()) {
    if (!f.endsWith('.md')) continue;
    // The ledger is checked separately; it is never part of the scanned corpus,
    // or every entry would prove its own claim string still exists.
    if (f === 'DOC-DEBT.md') continue;
    const abs = path.join(dir, f);
    if (seen.has(abs)) continue;
    seen.add(abs);
    addDoc(abs);
  }
}

scanDir(codebaseDir);

// The corpus is exactly `CLAUDE.md` + `.planning/codebase/*.md`. Other root-level
// documents (README.md, GATES.md, RESUME.md) are deliberately NOT scanned: they
// discuss the corrected facts in prose — README.md says the app "deliberately
// does **not** use 54321" — and scanning them would turn a correct sentence into
// a false STALE CLAIM. A flat fixture directory holding neither layout falls
// back to its own root-level markdown so committed fixtures can drive the checks.
if (documents.length === 0) scanDir(DOCROOT);

// A docroot holding only a ledger is a legitimate ledger-only fixture, so an
// empty corpus is not a cannot-run condition. It simply means every `required`
// string is absent, which CLAIM UNSUPPORTED reports honestly rather than
// silently skipping.

// --- 1. STALE CLAIM / 2. CLAIM UNSUPPORTED / 3. PROBE FLIPPED ---------------

for (const claim of CLAIMS) {
  let probeTrue;
  try {
    probeTrue = claim.probe() === true;
  } catch (err) {
    unreadable(`probe for ${claim.id} threw: ${err.message}`);
  }

  if (!probeTrue) {
    violation(
      'PROBE FLIPPED',
      `${claim.id}'s probe returned false, so the tree once again matches the old claim (${claim.what}). This is a CODE change, not a document error. Re-measure before editing any document — correcting a doc to say something false is the failure this check exists to prevent.`,
    );
    continue;
  }

  for (const forbidden of claim.forbidden) {
    for (const doc of documents) {
      if (doc.text.includes(forbidden)) {
        violation(
          'STALE CLAIM',
          `${claim.id}: ${doc.rel} still contains '${forbidden}', but the tree contradicts it (${claim.what} is no longer true).`,
        );
      }
    }
  }

  for (const required of claim.required) {
    if (!documents.some((d) => d.text.includes(required))) {
      violation(
        'CLAIM UNSUPPORTED',
        `${claim.id}: no scanned document names '${required}', so the corrected claim has nothing standing behind it.`,
      );
    }
  }
}

// --- 4. DEBT ENTRY MISSING / 5. DEBT ENTRY STALE ----------------------------

// The ledger travels with the docroot: a fixture directory holding its own
// DOC-DEBT.md drives the ledger checks, otherwise the app's real ledger is used.
const DEBT_PATH = [
  path.join(DOCROOT, 'DOC-DEBT.md'),
  path.join(DOCROOT, '.planning', 'DOC-DEBT.md'),
  DEFAULT_DEBT,
].find((p) => existsSync(p));

if (!DEBT_PATH) unreadable(`no DOC-DEBT.md found under ${DOCROOT} or at ${DEFAULT_DEBT}.`);

let debtText;
try {
  debtText = readFileSync(DEBT_PATH, 'utf8');
} catch (err) {
  unreadable(`${DEBT_PATH} could not be read: ${err.message}`);
}

const debtLines = debtText.split('\n');

for (const id of DEBT_IDS) {
  const headingIdx = debtLines.findIndex((l) => new RegExp(`^## ${id}\\b`).test(l.trim()));
  if (headingIdx === -1) {
    violation(
      'DEBT ENTRY MISSING',
      `${id} has no '## ${id}' heading in ${path.relative(APP_DIR, DEBT_PATH)}. An accepted-debt entry cannot be quietly dropped; delete it only when the claim it records has been corrected.`,
    );
    continue;
  }

  let end = debtLines.length;
  for (let i = headingIdx + 1; i < debtLines.length; i += 1) {
    if (/^## /.test(debtLines[i])) {
      end = i;
      break;
    }
  }
  const body = debtLines.slice(headingIdx, end);

  const claimLine = body.find((l) => l.startsWith('**Claim:**'));
  const whereLine = body.find((l) => l.startsWith('**Where:**'));
  if (!claimLine || !whereLine) {
    violation(
      'DEBT ENTRY MISSING',
      `${id} is missing a '**Claim:**' or '**Where:**' field line in ${path.relative(APP_DIR, DEBT_PATH)}.`,
    );
    continue;
  }

  const anchorMatch = /`([^`\n]+)`/.exec(claimLine);
  if (!anchorMatch) {
    violation(
      'DEBT ENTRY MISSING',
      `${id}'s '**Claim:**' line carries no backticked anchor string, so the entry cannot be checked against the tree.`,
    );
    continue;
  }
  const anchor = anchorMatch[1];

  const whereMatch = /`([^`\n]+)`/.exec(whereLine);
  const wherePath = whereMatch ? whereMatch[1] : null;

  let found = documents.some((d) => d.text.includes(anchor));
  if (!found && wherePath) {
    const abs = path.join(APP_DIR, wherePath);
    if (existsSync(abs) && statSync(abs).isFile()) {
      try {
        found = readFileSync(abs, 'utf8').includes(anchor);
      } catch {
        found = false;
      }
    }
  }

  if (!found) {
    violation(
      'DEBT ENTRY STALE',
      `${id}'s claim anchor '${anchor}' no longer appears in any scanned document${wherePath ? ` or in ${wherePath}` : ''}. The claim has been corrected, so this entry must be DELETED — the ledger may only shrink.`,
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
  `DOC CLAIMS OK — ${CLAIMS.length} claim(s) probed, ${DEBT_IDS.length} debt entr(ies) live`,
);
skipReport();
process.exit(0);
