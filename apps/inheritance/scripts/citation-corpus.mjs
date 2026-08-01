#!/usr/bin/env node
/**
 * citation-corpus.mjs — a MEASURING LIBRARY for the committed engine corpus. It measures; it never
 * judges, and it never ends the caller's process.
 *
 * Phase 17's requirements are all of the form "layer X and layer Y agree about the governing
 * article". Nothing can be claimed about agreement without traversing the whole corpus, so this
 * module exists once and every plan in the phase imports it rather than re-deriving the traversal.
 * A second traversal with slightly different directory list, sort order or rejection handling is a
 * second measurement, and two measurements that can disagree are exactly the defect the phase is
 * about.
 *
 * WHAT THIS MODULE DOES NOT DO. It holds no call that ends the process, no threshold, no allow-list
 * and no verdict. A library that can end the process cannot be reused by a gate that has to print a
 * full report before its own exit. The gate that DOES exit is `scripts/check-citation-integrity.mjs`;
 * this file is what that gate reads the corpus with.
 *
 * MEASURING NOTHING IS A FAILURE, NOT A PASS. `loadEngine()` throws with the `ENGINE MISSING: `
 * prefix when the compiled artifact is absent rather than returning an empty result, because a
 * traversal that silently reaches zero files reports zero disagreements and every caller inherits a
 * false green. An engine rejection for one input is recorded in `rejected` and excluded from the
 * counts; it is never coerced into an empty result.
 *
 * The engine is loaded exactly the way `frontend/journey/engine.mjs` loads it — `initSync` over
 * `frontend/src/wasm/pkg/inheritance_engine_bg.wasm` with the sibling glue file. This module adds no
 * second engine call site with different behaviour; it adds a corpus iterator around the same two
 * files.
 *
 * `node:` builtins only. Every other script in `scripts/` is dependency-free for the same reason:
 * they run under plain Node with no TypeScript loader and no install step.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.resolve(HERE, '..');
const PKG_DIR = path.resolve(APP_ROOT, 'frontend', 'src', 'wasm', 'pkg');
const GLUE_PATH = path.join(PKG_DIR, 'inheritance_engine.js');
const WASM_PATH = path.join(PKG_DIR, 'inheritance_engine_bg.wasm');
const EXAMPLES_DIR = path.resolve(APP_ROOT, 'engine', 'examples');
const ARTICLES_PATH = path.resolve(APP_ROOT, 'frontend', 'src', 'data', 'ncc-articles.ts');

/**
 * The five generated corpus directories under `engine/examples/`.
 *
 * `engine/examples/simple-intestate.json` sits at the top level and is deliberately EXCLUDED: it is
 * a hand-written example rather than a case produced by `engine/examples/generate-test-cases.sh`,
 * and these five directories are what that script produces.
 */
export const CORPUS_DIRS = ['cases', 'coverage-cases', 'testate-cases', 'defect-cases', 'fuzz-cases'];

/**
 * The token shape used when scanning narrative prose for an article citation.
 *
 * Matches the singular `Art. 887`, the range form `Arts. 1003-1008`, and tolerates the
 * paragraph suffix the engine emits as `Art. 892 ¶2`.
 */
export const ARTICLE_TOKEN_RE = /Arts?\.\s*\d+[\d\-]*(\s*¶\s*\d+)?/g;

/** Once-per-process guard, the same shape `frontend/journey/engine.mjs:32` uses. */
let wasmInitialized = false;
/** @type {null | { compute_json: (s: string) => string }} */
let glue = null;

function pathToFileUrl(p) {
  return new URL(`file://${p}`).href;
}

/**
 * Load the compiled succession engine, once per process.
 *
 * Throws (never exits) with the `ENGINE MISSING: ` prefix when the artifact is absent. The repair is
 * `bash engine/build-wasm.sh`, which is gate G2's own command and belongs to a separate decision
 * than this measurement.
 *
 * @returns {Promise<{ compute_json: (s: string) => string }>}
 */
export async function loadEngine() {
  if (wasmInitialized && glue) return glue;

  if (!fs.existsSync(WASM_PATH)) {
    throw new Error(
      `ENGINE MISSING: ${WASM_PATH} does not exist. Build it with: bash engine/build-wasm.sh`,
    );
  }

  const mod = await import(pathToFileUrl(GLUE_PATH));
  mod.initSync({ module: fs.readFileSync(WASM_PATH) });
  glue = mod;
  wasmInitialized = true;
  return glue;
}

/**
 * Compute every committed corpus input through the compiled engine.
 *
 * A directory that does not exist is skipped rather than throwing, so the module survives a corpus
 * that grows or shrinks. Files are sorted by name within each directory so the report order is
 * stable across runs and across machines.
 *
 * An input the engine rejects is recorded in `rejected` and excluded from `results`. It is counted
 * in `files` so that `computed + rejected.length === files` always holds, which is what lets a
 * caller assert the traversal was complete.
 *
 * @returns {Promise<{ files: number, computed: number, rejected: Array<{file: string, message: string}>, results: Array<{file: string, output: object}> }>}
 */
export async function computeCorpus() {
  const mod = await loadEngine();

  let files = 0;
  const rejected = [];
  const results = [];

  for (const dir of CORPUS_DIRS) {
    const abs = path.join(EXAMPLES_DIR, dir);
    if (!fs.existsSync(abs)) continue;

    const names = fs
      .readdirSync(abs)
      .filter((n) => n.endsWith('.json'))
      .sort();

    for (const name of names) {
      files += 1;
      const rel = path.join(dir, name);
      let input;
      try {
        input = JSON.parse(fs.readFileSync(path.join(abs, name), 'utf8'));
      } catch (err) {
        rejected.push({ file: rel, message: `unparseable input: ${String(err)}` });
        continue;
      }

      let outputJson;
      try {
        outputJson = mod.compute_json(JSON.stringify(input));
      } catch (err) {
        rejected.push({ file: rel, message: `ENGINE REJECTED: ${String(err)}` });
        continue;
      }

      try {
        results.push({ file: rel, output: JSON.parse(outputJson) });
      } catch (err) {
        rejected.push({ file: rel, message: `unparseable output: ${String(err)}` });
      }
    }
  }

  return { files, computed: results.length, rejected, results };
}

/**
 * The key set of `NCC_ARTICLE_DESCRIPTIONS`, read from the TypeScript source as text.
 *
 * Reading the source rather than importing the module is deliberate: `scripts/` runs plain Node with
 * no TypeScript loader, and every other script in this directory is dependency-free for the same
 * reason.
 *
 * @param {string} [articlesPath] override for the path to `ncc-articles.ts`
 * @returns {Set<string>}
 */
export function articleKeys(articlesPath = ARTICLES_PATH) {
  const src = fs.readFileSync(articlesPath, 'utf8');
  const startMarker = 'NCC_ARTICLE_DESCRIPTIONS: Record<string, string> = {';
  const startIdx = src.indexOf(startMarker);
  if (startIdx === -1) {
    throw new Error(`ARTICLE MAP NOT FOUND: ${articlesPath} has no "${startMarker}"`);
  }

  const afterStart = src.slice(startIdx + startMarker.length);
  const lines = afterStart.split('\n');
  const region = [];
  for (const line of lines) {
    if (line === '};') break;
    region.push(line);
  }

  const keys = new Set();
  const keyRe = /^\s*"([^"]+)":/gm;
  const body = region.join('\n');
  let m;
  while ((m = keyRe.exec(body)) !== null) {
    keys.add(m[1]);
  }
  return keys;
}
