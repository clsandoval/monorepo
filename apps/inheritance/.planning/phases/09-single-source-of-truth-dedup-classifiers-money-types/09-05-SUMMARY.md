---
phase: 09-single-source-of-truth-dedup-classifiers-money-types
plan: 05
subsystem: estate-tax
tags: [money-units, type-safety, dedup, ext-03, ext-02]
requires: ["09-03"]
provides:
  - "frontend/src/types/estate-tax.ts — peso-typed wizard state (26 money fields)"
  - "frontend/src/lib/estate-tax-engine/types.ts — centavo-typed engine-input money fields (23 fields)"
  - "frontend/src/lib/estate-tax-engine/pipeline.ts — the single adapter, delegating to the shared converter"
affects:
  - frontend/src/lib/estate-tax-engine/pipeline.ts
tech-stack:
  added: []
  patterns:
    - "Both ends of a unit boundary typed, with exactly one adapter permitted to cross it"
    - "The adapter's private conversion arrow deleted and replaced by a delegation to the shared implementation"
key-files:
  created: []
  modified:
    - frontend/src/types/estate-tax.ts
    - frontend/src/lib/estate-tax-engine/types.ts
    - frontend/src/lib/estate-tax-engine/pipeline.ts
key-decisions:
  - "lotArea and improvementArea stay bare `number` — they are square metres, and typing an area as money would be a false statement in the type system"
  - "The inline `& { foreignPropertyFMV?: number }` in pipeline.ts was typed `Centavos` too; it is declared in pipeline.ts, not in types.ts, so it is inside this plan's editable set"
  - "No cast, no `as any`, no widening back to `number` was needed — tsc was clean after both tasks"
requirements-completed: [EXT-03, EXT-02]
requirements-blocked: []
commits: [b90d6a5cb]
duration: ~20 min
completed: 2026-07-31
---

# Phase 9 Plan 05: Estate-Tax Money Boundary Summary

The estate-tax wizard's state is peso-typed, the estate-tax engine's input is centavo-typed, and the
second implementation of peso→centavo conversion is deleted rather than deprecated.

## What was built

`frontend/src/types/estate-tax.ts` — 26 money fields changed from `number` to `Pesos`, each keeping
its existing nullability (`number | null` → `Pesos | null`). `lotArea` and `improvementArea` are
untouched and still `number | null`. A header comment records that this module is peso-denominated,
that `src/lib/estate-tax-engine/types.ts` is centavo-denominated, and that
`wizardStateToEngineInput` is the single adapter permitted to convert.

`frontend/src/lib/estate-tax-engine/types.ts` — the 23 engine-input money fields the adapter writes a
`toCentavos(...)` result into are now `Centavos`.

`frontend/src/lib/estate-tax-engine/pipeline.ts` — the local arrow

```ts
const toCentavos = (pesos: number | null | undefined): number => Math.round((pesos ?? 0) * 100);
```

is gone. In its place:

```ts
const toCentavos = (pesos: Pesos | null | undefined): Centavos =>
  pesosToCentavos(pesos ?? asPesos(0));
```

All 24 `toCentavos(...)` call sites survive untouched.

## Gate results

| Command | Result |
|---|---|
| `cd frontend && npx tsc -b --force` | `TSC_EXIT=0` (after task 1 and again after task 2) |
| `grep -c "Pesos" src/types/estate-tax.ts` | 27 (required: ≥24) |
| `lotArea` / `improvementArea` | still `number \| null` at lines 121–122 |
| `grep -rEn "Math\.round\(.*\*\s*100" src/lib/estate-tax-engine/pipeline.ts` | no output — the duplicate is gone |
| `grep -c "toCentavos(" src/lib/estate-tax-engine/pipeline.ts` | 24 call sites |
| `grep -c "pesosToCentavos" src/lib/estate-tax-engine/pipeline.ts` | 2 |
| casts added (`as any` / `as unknown as` / `@ts-ignore`) in the diff | 0 |
| `npx vitest run src/lib/estate-tax-engine/__tests__/` | 252 passed, 0 failed (16 files) |
| `npx vitest run estate-tax-engine + tax-bridge + useTaxBridge` | 299 passed, 0 failed (18 files) |
| `npm run test:gate` | exactly 5 `UNKNOWN FAILURE`, `GATE-SKIPS total=2449 skipped=0` |
| `node scripts/check-commit-discipline.mjs` | exit 0, 0 mixed commits |

No expected value in any estate-tax test was edited, and none moved: the suite was 252/252 before and
252/252 after, which is the distinction the plan's threat T-09-13 exists to draw between "the types
are now right" and "the arithmetic changed".

`ALL GATES PASSED` is not claimed. `bash scripts/ci-gates.sh` still halts at `G3`, so `G4` was proven
by running `npx tsc -b --force` directly.

## Deviations from plan

None.

## Self-Check: PASSED
