/*
 * journey/engine.mjs — the ONLY module on the harness side that loads the
 * compiled succession engine.
 *
 * Two callers need an engine answer without a browser: the `case-alpha-computed`
 * reset in resets.mjs, which drives the Alpha case to a computed state so the
 * share-populated step has something to render; and plan 12-08's money-parity
 * gate, which recomputes every peso figure the results view displays. Both
 * import this module rather than repeating the load, so exactly one engine call
 * site exists here and no second one can drift from it — which is the whole
 * defect Phase 12 spent plan 12-01 removing from the product side.
 *
 * The answer is computed at run time by the same artifact the product loads. It
 * is never written as a literal into committed SQL: `scripts/check-seed-fixture.mjs`
 * rejects a seeded output_json with `SEED WRITES OUTPUT`, because a seeded engine
 * result is a per-heir peso figure nothing computed.
 *
 * Paths resolve relative to this module's own URL, as journey/seed.mjs does, so
 * the process working directory does not matter.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PKG_DIR = path.resolve(HERE, '..', 'src', 'wasm', 'pkg');
const GLUE_PATH = path.join(PKG_DIR, 'inheritance_engine.js');
const WASM_PATH = path.join(PKG_DIR, 'inheritance_engine_bg.wasm');

/** Once-per-process guard, the same shape src/wasm/bridge.ts:313 uses. */
let wasmInitialized = false;
/** @type {null | { compute_json: (s: string) => string }} */
let glue = null;

async function ensureEngine() {
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

function pathToFileUrl(p) {
  return new URL(`file://${p}`).href;
}

/**
 * Ask the compiled engine for the output of one EngineInput.
 *
 * Never exits the process. A rejection from the engine becomes a thrown Error
 * prefixed `ENGINE REJECTED: `; the caller decides whether that is fatal.
 *
 * @param {object} input a complete EngineInput
 * @returns {Promise<object>} the parsed EngineOutput
 */
export async function computeEngineOutput(input) {
  const mod = await ensureEngine();
  let resultJson;
  try {
    resultJson = mod.compute_json(JSON.stringify(input));
  } catch (err) {
    throw new Error(`ENGINE REJECTED: ${String(err)}`);
  }
  return JSON.parse(resultJson);
}
