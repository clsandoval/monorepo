#!/usr/bin/env node
/**
 * check-citation-integrity.mjs — the table, the narrative, the citation pill and the PDF must agree
 * about the governing article for the same heir.
 *
 *   node scripts/check-citation-integrity.mjs
 *   node scripts/check-citation-integrity.mjs --corpus <dir> --articles <path>
 *
 * WHAT THIS GATE PROVES. In a citation-first product, contradicting your own citation on screen is
 * not a defect, it is a refutation: the whole claim is that every line carries the article that
 * governs it. Phase 17 made the engine the single attribution authority — it emits the article, and
 * no other layer derives one. This gate is what keeps that true after Phase 17 stops watching.
 *
 * Five assertions, each with its own literal marker so a failure says WHICH rule broke:
 *
 *   NARRATIVE DISAGREES     — narrative.legal_basis differs from that heir's share.legal_basis
 *   PROSE CITES ARTICLE     — narrative.text contains the literal "of the Civil Code"
 *   CITATION UNRESOLVED     — an article the engine emits resolves to no description
 *   LAYER DERIVES ARTICLE   — a display layer source file hardcodes an article literal
 *   DUPLICATE RULE PRESENT  — predictScenario or computeMock reappeared in the WASM bridge
 *
 * Plus two error markers, both exiting 1:
 *
 *   CORPUS EMPTY              — zero heir rows examined
 *   CITATION SCAN UNREADABLE  — an input is missing or unparseable
 *
 * NO EXCEPTION LIST, NO MUTATING FLAG. This script holds no exception list, no tolerated-disagreement
 * table and no baseline file, and it has no flag that writes, repairs, regenerates, accepts,
 * updates or waives anything. Its only two flags are read-only path overrides that exist so the
 * committed fixtures can drive the failure paths. A gate that carries a list of tolerated
 * disagreements acquires an entry the first time it is inconvenient, and that entry is invisible in
 * every green run that follows. A gate that can rewrite its own baseline encodes today's failures
 * as tomorrow's expectation.
 *
 * A GREEN RUN ON ZERO ROWS IS A FAILURE BY CONSTRUCTION. The single most dangerous outcome
 * available to this design is passing because it measured nothing — an empty corpus directory, or a
 * WASM artifact that failed to load. `scripts/citation-corpus.mjs` throws with `ENGINE MISSING: `
 * rather than returning empty, and a run that examines zero heir rows exits 1 with `CORPUS EMPTY`.
 *
 * THE CORRECT RESPONSE TO A RED RUN IS A BLOCKED REPORT WITH THE PASTED OUTPUT — never an edit to
 * this script, and never an edit to a baseline. If one of the five assertions cannot legitimately
 * pass, that is a finding, not an obstacle.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { computeCorpus, articleKeys } from './citation-corpus.mjs';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const APP_DIR = path.resolve(SCRIPT_DIR, '..');
const DEFAULT_ARTICLES = path.join(APP_DIR, 'frontend', 'src', 'data', 'ncc-articles.ts');
const BRIDGE_PATH = path.join(APP_DIR, 'frontend', 'src', 'wasm', 'bridge.ts');

/**
 * The display layers that must never state an article of their own.
 *
 * Kept as one auditable const array, in the same style as the phrase lists in
 * `scripts/check-plan-closed-world.mjs`. Adding a display layer means adding it here.
 */
const DISPLAY_LAYERS = [
  'frontend/src/components/results/DistributionSection.tsx',
  'frontend/src/components/results/NarrativePanel.tsx',
  'frontend/src/components/results/StatuteCitationsSection.tsx',
  'frontend/src/components/pdf/PerHeirBreakdownSection.tsx',
];

/** An article literal appearing in a display layer's source. */
const HARDCODED_ARTICLE_RE = /Art\.\s*\d/;

/** The phrase that made the engine's prose a second authority. */
const PROSE_AUTHORITY_PHRASE = 'of the Civil Code';

/** The duplicate-rule symbols deleted by plan 17-04. */
const DUPLICATE_RULE_SYMBOLS = ['predictScenario', 'computeMock'];

const violations = [];
function violation(marker, detail) {
  violations.push(`${marker} — ${detail}`);
}

function skipReport(total) {
  console.log(`GATE-SKIPS total=${total} skipped=0`);
}

function unreadable(message) {
  console.error(`CITATION SCAN UNREADABLE: ${message}`);
  skipReport(0);
  process.exit(1);
}

// --- argument parsing -------------------------------------------------------

function parseArgs(argv) {
  const out = { corpus: null, articles: DEFAULT_ARTICLES };
  const map = { '--corpus': 'corpus', '--articles': 'articles' };
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

// --- resolution -------------------------------------------------------------

/**
 * Normalise a legal_basis string to a description-map key.
 *
 * SOURCE OF TRUTH: `frontend/src/data/ncc-articles.ts` `parseArticleKey`. The three branches below
 * are the same three that function applies, INCLUDING the paragraph suffix, and they are restated
 * here rather than imported because `scripts/` runs plain Node with no TypeScript loader. A
 * divergence between the two is therefore visible in a diff of this file.
 */
function parseArticleKeyLike(legalBasis) {
  if (!legalBasis) return null;

  const fcArt = legalBasis.match(/^FC\s*Art\.\s*(\d+)$/);
  if (fcArt) return `FC Art.${fcArt[1]}`;

  const fc = legalBasis.match(/^FC\s*(\d+)$/);
  if (fc) return `FC${fc[1]}`;

  const art = legalBasis.match(/^Art\.\s*(\d+)\s*(?:¶\s*\d+)?$/);
  if (art) return `Art.${art[1]}`;

  return null;
}

// --- gather the corpus ------------------------------------------------------

let results;
if (args.corpus === null) {
  try {
    const corpus = await computeCorpus();
    results = corpus.results;
  } catch (err) {
    unreadable(String(err && err.message ? err.message : err));
  }
} else {
  // Fixture branch: read each .json as an already-formed EngineOutput document, with no engine
  // call. This is what lets a committed fixture drive a failure path without an engine input.
  if (!fs.existsSync(args.corpus)) unreadable(`corpus path ${args.corpus} does not exist`);
  results = [];
  const names = fs
    .readdirSync(args.corpus)
    .filter((n) => n.endsWith('.json'))
    .sort();
  for (const name of names) {
    try {
      results.push({
        file: name,
        output: JSON.parse(fs.readFileSync(path.join(args.corpus, name), 'utf8')),
      });
    } catch (err) {
      unreadable(`${name} is not parseable JSON: ${String(err)}`);
    }
  }
}

let keys;
try {
  if (!fs.existsSync(args.articles)) unreadable(`articles path ${args.articles} does not exist`);
  keys = articleKeys(args.articles);
} catch (err) {
  unreadable(String(err && err.message ? err.message : err));
}

// --- assertions over the corpus --------------------------------------------

let rows = 0;
const distinctArticles = new Set();

for (const { file, output } of results) {
  const shares = output.per_heir_shares || [];
  const narratives = output.narratives || [];
  const byHeir = new Map(shares.map((s) => [s.heir_id, s.legal_basis || []]));

  for (const s of shares) {
    for (const b of s.legal_basis || []) {
      distinctArticles.add(b);
      const key = parseArticleKeyLike(b);
      if (key === null || !keys.has(key)) {
        violation(
          'CITATION UNRESOLVED',
          `${file} heir ${s.heir_id}: legal_basis ${JSON.stringify(b)} resolves to no description`,
        );
      }
    }
  }

  for (const n of narratives) {
    rows += 1;
    const share = byHeir.get(n.heir_id) || [];
    const narrativeBasis = n.legal_basis || [];

    if (JSON.stringify(narrativeBasis) !== JSON.stringify(share)) {
      violation(
        'NARRATIVE DISAGREES',
        `${file} heir ${n.heir_id}: narrative ${JSON.stringify(narrativeBasis)} vs table ${JSON.stringify(share)}`,
      );
    }

    if (typeof n.text === 'string' && n.text.includes(PROSE_AUTHORITY_PHRASE)) {
      violation(
        'PROSE CITES ARTICLE',
        `${file} heir ${n.heir_id}: narrative prose contains ${JSON.stringify(PROSE_AUTHORITY_PHRASE)}`,
      );
    }
  }
}

if (rows === 0) {
  console.error('CORPUS EMPTY — examined zero heir rows; a gate that measures nothing cannot pass');
  skipReport(0);
  process.exit(1);
}

// --- assertions over the source tree ---------------------------------------

for (const rel of DISPLAY_LAYERS) {
  const abs = path.join(APP_DIR, rel);
  if (!fs.existsSync(abs)) unreadable(`display layer ${rel} does not exist`);
  const src = fs.readFileSync(abs, 'utf8');
  const lines = src.split('\n');
  for (let i = 0; i < lines.length; i += 1) {
    if (HARDCODED_ARTICLE_RE.test(lines[i])) {
      violation(
        'LAYER DERIVES ARTICLE',
        `${rel}:${i + 1} states an article literal: ${lines[i].trim()}`,
      );
    }
  }
}

if (!fs.existsSync(BRIDGE_PATH)) unreadable(`bridge ${BRIDGE_PATH} does not exist`);
const bridgeSrc = fs.readFileSync(BRIDGE_PATH, 'utf8');
for (const symbol of DUPLICATE_RULE_SYMBOLS) {
  if (bridgeSrc.includes(symbol)) {
    violation(
      'DUPLICATE RULE PRESENT',
      `frontend/src/wasm/bridge.ts contains ${symbol} — a second implementation of a legal rule (CLAUDE.md invariant 5)`,
    );
  }
}

// --- verdict ----------------------------------------------------------------

if (violations.length > 0) {
  for (const v of violations) console.error(v);
  console.error(`CITATION INTEGRITY FAILED — ${violations.length} violation(s)`);
  skipReport(rows);
  process.exit(1);
}

console.log(
  `CITATION INTEGRITY OK — ${rows} heir rows across ${results.length} corpus files, ${distinctArticles.size} distinct articles, all resolving`,
);
skipReport(rows);
process.exit(0);
