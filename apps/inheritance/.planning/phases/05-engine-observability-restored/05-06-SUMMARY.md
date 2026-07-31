---
phase: 05-engine-observability-restored
plan: 06
subsystem: wasm-boundary
tags: [observability, error-handling, wasm, typed-errors]
requires: ["05-05"]
provides:
  - "compute_json rejects with {\"error\":{\"kind\",\"message\",\"detail\"}} on all three failure paths"
  - "EngineError + parseEngineError exported from frontend/src/wasm/bridge.ts"
  - "frontend/src/wasm/__tests__/wasm-errors.test.ts"
affects:
  - engine/src/wasm.rs
  - frontend/src/wasm/bridge.ts
tech-stack:
  added: []
  patterns:
    - "Structured JSON rejection payload built with serde_json::json! so a serde message containing a quote cannot corrupt it"
key-files:
  created:
    - frontend/src/wasm/__tests__/wasm-errors.test.ts
  modified:
    - engine/src/wasm.rs
    - frontend/src/wasm/bridge.ts
key-decisions:
  - "The engine's serde deserializer stays the single validator; no Zod pre-flight was added in front of it"
  - "parseEngineError always returns an EngineError — the 'unknown' kind bounds a WASM trap or a future payload change"
  - "Object.setPrototypeOf in the constructor so instanceof survives the TypeScript down-level emit"
requirements-completed: [OBS-07]
duration: ~25 min
completed: 2026-07-31
---

# Phase 5 Plan 06: Structured Validation Error at the WASM Boundary Summary

The boundary's failure mode went from an opaque thrown sentence to a typed, inspectable error. All six
new tests pass and OBS-07 is met. The phase-level `ci-gates.sh` run still fails — **entirely on plan
05-05's blocker**, which this plan adds nothing to and cannot resolve.

- **Tasks:** 3 of 3
- **Files created:** 1 · **Files modified:** 2
- **Commit:** `434be961d` — `feat(05): reject malformed engine input with a structured error at the WASM boundary`

## The payload shape — verbatim (plan 05-07 greps for this)

```json
{"error":{"kind":"invalid_input","message":"...","detail":"..."}}
```

`"kind"` is always one of exactly three strings. `"message"` is fixed text a user can read; `"detail"`
is the engine's own diagnostic and may be any length. Built with `serde_json::json!`, never string
concatenation, so a serde message containing a quote or newline cannot produce invalid JSON.

| `kind` | `message` | `detail` |
|---|---|---|
| `invalid_input` | `The engine input could not be parsed.` | the serde error via `to_string()` |
| `output_check` | `The computed distribution failed the engine output check.` | the `OutputDefect` list via `Display`, joined by `"; "` |
| `serialize` | `The engine output could not be serialised.` | the serde error via `to_string()` |

`compute_json` keeps its exact signature —
`grep -c "compute_json(input: &str) -> Result<String, JsValue>"` returns **1** — and `JsValue::from_str`
remains the rejection mechanism, which is what makes the failure a thrown JS value rather than an
unrecoverable WASM trap.

The plain-prefix form 05-05 used (`Engine output check failed: `) is replaced by the `output_check`
kind; the joined detail text is unchanged.

## `EngineError` — the typed error `computeWasm` throws

```ts
export type EngineErrorKind = "invalid_input" | "output_check" | "serialize" | "unknown";

export class EngineError extends Error {
  readonly kind: EngineErrorKind;   // switch on this, never match substrings
  readonly detail: string;          // the engine's own diagnostic
  // .name === "EngineError", .message is the human-readable text
}

export function parseEngineError(thrown: unknown): EngineError;
```

`parseEngineError` **always** returns an `EngineError`. An unrecognised rejection — a WASM trap, a
future payload change — becomes kind `"unknown"` carrying the original text as `detail`, so no
boundary failure ends as an untyped value. The constructor calls `Object.setPrototypeOf(this,
EngineError.prototype)` so `instanceof` survives the TypeScript down-level emit.

`computeWasm` now wraps only the boundary call. `predictScenario`, `computeMock`,
`relationshipToCategory`, `categoryLabel` and `ensureWasmInitialized` are untouched, so ROADMAP Phase
9's deletion of the first two stays clean.

## Measured results

```
cd engine && cargo test
test result: ok. 442 passed; 0 failed; ... (unittests src/lib.rs)
test result: ok. 0 passed; 0 failed; ...   (unittests src/main.rs)
test result: ok. 1 passed; 0 failed; ...   (tests/fuzz_invariants.rs)
test result: ok. 35 passed; 0 failed; ...  (tests/integration.rs)
test result: ok. 0 passed; 0 failed; ...   (doc-tests)

bash engine/build-wasm.sh
WASM BUILD OK: .../frontend/src/wasm/pkg/inheritance_engine_bg.wasm (586591 bytes)
WASM_EXIT=0

npx vitest run src/wasm/__tests__/wasm-errors.test.ts
 ✓ src/wasm/__tests__/wasm-errors.test.ts (6 tests) 42ms
 Test Files  1 passed (1)
      Tests  6 passed (6)
NEW_EXIT=0

npx tsc -b --force  → zero output, TSC_EXIT=0
```

`npx vitest run src/wasm/__tests__/` → **4 of 6 files pass; 121 of 125 tests pass**. The 4 failures are
the two OBS-05/OBS-06 conditions in `bridge.test.ts` and `wasm-real.test.ts` — 05-05's blocker, not
this plan's. All 6 new `wasm-errors.test.ts` tests pass, and `scenario-coverage.test.ts`,
`conformance.test.ts` and `wasm-live.test.ts` are fully green.

Untouched-file proofs, run and observed:

- `git diff --stat --` over all five pre-existing wasm test files → **empty**
- `git status --porcelain` on `test-baseline.json`, `package.json`, `package-lock.json`, `Cargo.toml`, `Cargo.lock` → **empty**
- `git status --porcelain frontend/src/wasm/pkg/` → **empty**. The tracked bindings
  (`inheritance_engine.js`, `inheritance_engine.d.ts`) regenerated byte-identical, so the commit is
  **three paths**, not five, and no `.wasm` artifact was staged.

## New tests — `frontend/src/wasm/__tests__/wasm-errors.test.ts` (6 passing)

| # | Test | Asserts |
|---|---|---|
| 1 | rejects an empty object with an EngineError of kind invalid_input | `toBeInstanceOf(EngineError)` and `kind` `toBe("invalid_input")` |
| 2 | carries the engine's own diagnostic through as a non-empty detail | `detail` is a string of length > 0 |
| 3 | rejects a non-numeric centavos value with kind invalid_input | `kind` `toBe("invalid_input")` |
| 4 | maps an unrecognised rejection to kind unknown | `kind` `toBe("unknown")`, `detail` is the original string |
| 5 | parses a well-formed output_check payload into its three fields | `kind`/`message`/`detail` all exact |
| 6 | leaves the success path unchanged | a real input resolves with a non-empty `per_heir_shares` |

## BLOCKED (inherited from 05-05, not introduced here)

`bash scripts/ci-gates.sh` → **`GATE FAILED: G3 (exit 1)`**, `GATES_EXIT=1`. G3 is the frontend
known-failure ledger gate. Real output:

```
 Test Files  14 failed | 98 passed (112)
      Tests  51 failed | 2385 passed (2436)

TEST BASELINE GATE FAILED — 5 violation(s)

UNKNOWN FAILURE: src/__tests__/integration.test.tsx :: integration > compute handles invalid input gracefully compute() handles duplicate person IDs
UNKNOWN FAILURE: src/wasm/__tests__/bridge.test.ts :: wasm bridge invalid input handles negative centavos without crashing
UNKNOWN FAILURE: src/wasm/__tests__/bridge.test.ts :: wasm bridge invalid input handles duplicate person IDs without crashing
UNKNOWN FAILURE: src/wasm/__tests__/wasm-real.test.ts :: wasm-real engine computeWasm() with invalid input throws/rejects handles negative estate centavos without crashing
UNKNOWN FAILURE: src/wasm/__tests__/wasm-real.test.ts :: wasm-real engine computeWasm() with invalid input throws/rejects handles duplicate person IDs without crashing

GATE-SKIPS total=2436 skipped=0
GATE FAILED: G3 (exit 1)
```

### Attribution, measured rather than assumed

To establish that this plan adds none of the five, the committed 05-05 versions of
`engine/src/wasm.rs` and `frontend/src/wasm/bridge.ts` were checked out, the WASM binary rebuilt from
them, and the gate re-run. Result: **10 violations** — the same 5 above, plus the 5 `wasm-errors.test.ts`
cases that necessarily fail without this plan's payload. Restoring this plan's files and rebuilding
returns the count to **5**.

So plan 05-06 removes 5 violations relative to its own starting point and adds **zero**. All 5
remaining are the OBS-05/OBS-06 product decision documented in `05-05-SUMMARY.md`. Nothing was done to
make G3 green: no test was edited, skipped or deleted, `test-baseline.json` was not touched, and the
structured-error work was not softened.

The plan's acceptance criterion `ALL GATES PASSED (10/10)` is also stale in a second, harmless way —
the manifest has held **10** gates since Phase 4 and plan 05-07 adds G11, so a passing run at this
point would print `(10/10)` only until 05-07 lands.

No point of Philippine law arises. **Nothing was added to `.planning/LAWYER-AGENDA.md`.**

## Deviations from Plan

**None on implementation.** All three tasks executed as written; the payload shape, the three
kind/message pairs, the `EngineError` field list and all six test cases match the plan exactly.

**[Measurement]** Task 3's `bash scripts/ci-gates.sh` → `ALL GATES PASSED (10/10)` criterion is not
met, for the inherited reason above. Reported rather than worked around.

## Issues Encountered

The inherited 05-05 blocker. This plan is otherwise complete and OBS-07 is met.

## Next

`05-07` (wave 5) adds the corpus observability test and gate G11. Its
`ALL GATES PASSED (11/11)` criterion cannot pass while G3 is red.
