---
phase: 17
plan: 17-04
status: complete
requirements: [CITE-04]
---

# 17-04 — Deleted the second implementation of a legal rule

Committed `01c49023b` (`frontend/src/wasm/bridge.ts`, one path).

## What changed

`predictScenario` — a hand-written TypeScript transcription of `engine/src/step3_scenario.rs:52-235`,
as its own doc comment admitted — and `computeMock` are gone, together with the three helpers that
existed only to serve them (`zeroMoney`, `relationshipToCategory`, `categoryLabel`). This is the
surviving duplicate legal rule named by `CLAUDE.md` invariant 5 and owned by `EXT-02`.

It was worse than dead code: `computeMock` validated its input and returned a **plausible**
`EngineOutput` — real heir ids, real names, an equal split, per-heir narratives, and
`legal_basis: []`. Shaped exactly like a real answer, with an empty citation array, in a product
whose whole claim is that every line carries its article.

The file header no longer claims a fallback the code does not have, and no longer names
`scenario-field-mapping.md` as a source of truth for a prediction the file no longer performs.

## Why the deletion is provably complete

`frontend/tsconfig.json` sets `noUnusedLocals`, so a helper or import left behind after its only
caller goes is a **compile error**, not surviving dead code. No import was removed by guesswork — the
compiler named each one and exactly those were deleted. `npx tsc -b --force` exit 0 is the mechanical
proof, not a careful reading. 438 → **140 lines**.

## Verification

Measured **zero importers** outside the file across all of `frontend/src` and `frontend/journey`,
including tests — so no test was edited, deleted or skipped. `grep -c` for all five symbols → `0`.
`computeWasm`, `compute`, `parseEngineError` and `EngineError` all still present and untouched.
Frontend test count **identical at 2073 before and after** with the same 31 failures.
`git diff -- frontend/test-baseline.json` empty. `node scripts/check-claude-invariants.mjs` exit 0
(`CLAUDE INVARIANTS OK — 6 invariant(s) checked`).
