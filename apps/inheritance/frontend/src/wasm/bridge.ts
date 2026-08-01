/**
 * WASM Bridge — real WASM engine integration.
 *
 * Uses the Rust inheritance engine compiled to WASM via wasm-pack.
 * There is no fallback. compute() delegates to the compiled engine and nothing else: a second
 * implementation of a succession rule is prohibited by CLAUDE.md invariant 5.
 *
 * Source of truth:
 *   - engine-output.md (EngineOutput shape)
 */

import type { EngineInput, EngineOutput } from "../types";
import initAsync, { compute_json, initSync } from "./pkg/inheritance_engine";

let wasmInitialized = false;

/**
 * Initialize the WASM module.
 * In Node.js/tests: uses initSync with fs.readFileSync.
 * In browser: uses async init() which fetches the .wasm file.
 */
async function ensureWasmInitialized(): Promise<void> {
  if (wasmInitialized) return;

  if (typeof process !== "undefined" && process.versions?.node) {
    // Node.js (vitest) — load synchronously
    const { readFileSync } = await import("node:fs");
    const { resolve, dirname } = await import("node:path");
    const { fileURLToPath } = await import("node:url");
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const wasmPath = resolve(__dirname, "pkg/inheritance_engine_bg.wasm");
    const wasmBytes = readFileSync(wasmPath);
    initSync({ module: wasmBytes });
  } else {
    // Browser — async fetch
    await initAsync();
  }
  wasmInitialized = true;
}

/**
 * The three failure kinds `engine/src/wasm.rs` can reject with, plus `unknown`
 * for anything else (a WASM trap, or a future payload change). The `unknown`
 * arm is what guarantees no boundary failure ends as an untyped value.
 */
export type EngineErrorKind =
  | "invalid_input"
  | "output_check"
  | "serialize"
  | "unknown";

const ENGINE_ERROR_KINDS: readonly string[] = [
  "invalid_input",
  "output_check",
  "serialize",
];

/**
 * A typed failure from the WASM boundary.
 *
 * `message` is fixed text a user can read; `detail` carries the engine's own
 * diagnostic. Callers switch on `kind` rather than matching substrings.
 */
export class EngineError extends Error {
  readonly kind: EngineErrorKind;
  readonly detail: string;

  constructor(kind: EngineErrorKind, message: string, detail: string) {
    super(message);
    this.name = "EngineError";
    this.kind = kind;
    this.detail = detail;
    // Required so `instanceof` survives the TypeScript down-level emit for a
    // class extending a built-in.
    Object.setPrototypeOf(this, EngineError.prototype);
  }
}

/**
 * Convert whatever `compute_json` rejected with into an `EngineError`.
 *
 * Always returns an `EngineError` — an unrecognised value becomes kind
 * `"unknown"` carrying the original text as `detail`.
 */
export function parseEngineError(thrown: unknown): EngineError {
  const candidate =
    typeof thrown === "string"
      ? thrown
      : thrown instanceof Error
        ? thrown.message
        : String(thrown);

  try {
    const parsed: unknown = JSON.parse(candidate);
    if (parsed !== null && typeof parsed === "object" && "error" in parsed) {
      const err = (parsed as { error: unknown }).error;
      if (err !== null && typeof err === "object") {
        const { kind, message, detail } = err as {
          kind?: unknown;
          message?: unknown;
          detail?: unknown;
        };
        if (typeof kind === "string" && ENGINE_ERROR_KINDS.includes(kind)) {
          return new EngineError(
            kind as EngineErrorKind,
            typeof message === "string" ? message : "The engine failed.",
            typeof detail === "string" ? detail : "",
          );
        }
      }
    }
  } catch {
    // Not JSON — fall through to the unknown kind below.
  }

  return new EngineError("unknown", "The engine failed.", candidate);
}

/**
 * Compute using the real WASM engine.
 *
 * Throws an {@link EngineError} on any boundary failure, never a bare string.
 */
export async function computeWasm(input: EngineInput): Promise<EngineOutput> {
  await ensureWasmInitialized();
  let resultJson: string;
  try {
    resultJson = compute_json(JSON.stringify(input));
  } catch (thrown) {
    throw parseEngineError(thrown);
  }
  return JSON.parse(resultJson) as EngineOutput;
}

/**
 * Public API — delegates to real WASM engine.
 */
export async function compute(input: EngineInput): Promise<EngineOutput> {
  return computeWasm(input);
}
