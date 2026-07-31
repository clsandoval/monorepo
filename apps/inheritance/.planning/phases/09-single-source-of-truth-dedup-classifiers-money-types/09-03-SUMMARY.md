---
phase: 09-single-source-of-truth-dedup-classifiers-money-types
plan: 03
subsystem: frontend-types
tags: [money-units, type-safety, ext-03]
requires: []
provides:
  - "frontend/src/types/money-units.ts — the Pesos and Centavos flavoured types and the only peso↔centavo converters in the frontend"
  - "frontend/src/types/money-units.typetest.ts — four ts-expect-error assertions that fail the build if the units merge"
affects:
  - frontend/src/types/index.ts
  - frontend/src/components/shared/MoneyInput.tsx
tech-stack:
  added: []
  patterns:
    - "Optional-brand flavouring (`__unit?: F`), so numeric literals stay assignable to both units and no fixture churns, while the two units stay mutually unassignable"
    - "Explicit, greppable widening points (`asPesos`, `asCentavos`) instead of scattered inline casts"
    - "Negative type test at a path tsconfig.json actually compiles (`.typetest.ts`, not `.test.ts`)"
key-files:
  created:
    - frontend/src/types/money-units.ts
    - frontend/src/types/money-units.typetest.ts
  modified:
    - frontend/src/types/index.ts
    - frontend/src/components/shared/MoneyInput.tsx
key-decisions:
  - "The brand property is optional, exactly as the plan required; a required brand was never attempted"
  - "types/index.ts re-exports the converters rather than declaring them, so every existing `import { pesosToCentavos } from '../../types'` path is unchanged"
  - "No cast was added anywhere to clear a unit error, because no unit error surfaced — tsc was clean on the first run"
requirements-completed: [EXT-03]
requirements-blocked: []
commits: [2ab51eaaf]
duration: ~20 min
completed: 2026-07-31
---

# Phase 9 Plan 03: Branded Peso and Centavo Units Summary

`Pesos` and `Centavos` now exist as mutually-unassignable flavoured number types, the succession
wizard's only money control states its peso side explicitly, and the separation is proven by an
instrument that was observed failing when the property is removed.

## What was built

`frontend/src/types/money-units.ts` exports exactly the six things the plan named: `Pesos`,
`Centavos`, `pesosToCentavos`, `centavosToPesos`, `asCentavos`, `asPesos`. The module-local
`Flavor<T, F>` alias is `T & { readonly __unit?: F }` — optional brand, as required.

`frontend/src/types/index.ts` no longer declares its own converters; it re-exports them and imports
`Centavos` to type `Money.centavos`, `formatPeso`'s parameter and `serializeCentavos`'s parameter.

`frontend/src/components/shared/MoneyInput.tsx` wraps both `parseFloat(raw)` arguments in
`asPesos(...)`, and records at the two `Number(field.value)` sites that react-hook-form is where the
value arrives untyped.

## The proof was verified in both directions

With the real `Flavor` definition in place:

```
$ npx tsc -b --force
TSC_EXIT=0
```

With `type Flavor<T, F extends string> = T;` substituted (the brand erased):

```
src/types/money-units.ts(22,16): error TS6133: 'F' is declared but its value is never read.
src/types/money-units.typetest.ts(39,1): error TS2578: Unused '@ts-expect-error' directive.
src/types/money-units.typetest.ts(42,1): error TS2578: Unused '@ts-expect-error' directive.
src/types/money-units.typetest.ts(45,1): error TS2578: Unused '@ts-expect-error' directive.
src/types/money-units.typetest.ts(48,1): error TS2578: Unused '@ts-expect-error' directive.
TSC_EXIT_BRAND_REMOVED=1
```

Exactly four `TS2578`, one per negative assertion. The real definition was then restored and
`npx tsc -b --force` returned to `TSC_EXIT_RESTORED=0`. The typetest is load-bearing, not decorative.

## Gate results

| Command | Result |
|---|---|
| `cd frontend && npx tsc -b --force` | `TSC_EXIT=0` |
| `grep -c "__unit?" src/types/money-units.ts` | 4 (required: ≥1) |
| `grep -c "__unit:" src/types/money-units.ts` | 0 |
| `grep -c "@ts-expect-error" src/types/money-units.typetest.ts` | 4 |
| `tsconfig.json` contains `typetest`? | `false` — so tsc compiles the proof |
| `npx vitest run MoneyInput.test.tsx types.test.ts` | 121 passed, 0 failed (2 files) |
| `npm run test:gate` | exactly 5 `UNKNOWN FAILURE`, `GATE-SKIPS total=2449 skipped=0` |
| `node scripts/check-commit-discipline.mjs` | exit 0, 0 mixed commits |

The five `UNKNOWN FAILURE` entries are byte-identical to the five Phases 5–8 inherited; the set did
not grow.

`ALL GATES PASSED` is not claimed. `bash scripts/ci-gates.sh` still halts at `G3` on Phase 5's
unresolved OBS-05/OBS-06 product decision, so `G4` runs after the halt and was proven by running
`npx tsc -b --force` directly, as the plan instructed.

## Deviations from plan

One, cosmetic and forced by the plan's own acceptance criterion. The plan asked the file header to
say that the proof holds four `@ts-expect-error` assertions; writing that literal string in the
comment made `grep -c "@ts-expect-error"` return 5 instead of the required 4. Both header comments
now say "ts-expect-error" without the `@`, so the grep counts only real directives. No behaviour
changed.

## Self-Check: PASSED
