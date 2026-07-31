---
phase: 05-engine-observability-restored
plan: 02
subsystem: frontend
tags: [observability, error-boundary, error-reporting]
requires: []
provides:
  - "frontend/src/lib/error-reporting.ts — bounded in-process error sink with a read API"
  - "frontend/src/components/ErrorBoundary.tsx — root React error boundary with an asserted fallback"
  - "window error and unhandledrejection capture installed at module scope in main.tsx"
affects:
  - frontend/src/main.tsx
tech-stack:
  added: []
  patterns:
    - "In-process bounded ring buffer (MAX_REPORTS = 50, oldest-first eviction) instead of a third-party error-tracking SDK"
key-files:
  created:
    - frontend/src/lib/error-reporting.ts
    - frontend/src/lib/__tests__/error-reporting.test.ts
    - frontend/src/components/ErrorBoundary.tsx
    - frontend/src/components/__tests__/ErrorBoundary.test.tsx
  modified:
    - frontend/src/main.tsx
key-decisions:
  - "No error-tracking vendor is chosen; the sink is in-process because picking one would be an ungrounded decision (LOOP-01)"
  - "Nothing captured leaves the process — no network transport of any kind, asserted by a grep returning 0"
  - "installGlobalErrorHandlers() is called at module scope in main.tsx, never inside a component, so a remount cannot duplicate listeners"
requirements-completed: [OBS-08]
duration: ~20 min
completed: 2026-07-31
---

# Phase 5 Plan 02: Frontend Error Capture Behind a Root Boundary Summary

A frontend throw is now a visible page plus a retrievable record instead of a blank white screen with
nothing logged anywhere. `grep -rln "ErrorBoundary|componentDidCatch|getDerivedStateFromError"
frontend/src` returned zero files before this plan; the boundary now wraps both render trees in
`main.tsx`, and `window` `error` / `unhandledrejection` events funnel into the same bounded sink.

- **Tasks:** 3 of 3
- **Files created:** 4 · **Files modified:** 1
- **Commit:** `87a3ae7b8` — `feat(05): capture and report frontend errors behind a root error boundary`

## Exported surface of `frontend/src/lib/error-reporting.ts`

```ts
export interface ErrorReport {
  id: number;
  at: string;
  source: 'boundary' | 'window' | 'unhandledrejection' | 'manual';
  message: string;
  stack: string | null;
}

export function reportError(value: unknown, source?: ErrorReport['source']): ErrorReport;
export function getReportedErrors(): ErrorReport[];
export function clearReportedErrors(): void;
export function installGlobalErrorHandlers(target?: Window): () => void;
```

Module state: `const MAX_REPORTS = 50`, oldest-first eviction, a monotonic `nextId` that is **not**
reset by `clearReportedErrors()`, and a `handlersInstalled` guard so a second
`installGlobalErrorHandlers()` call returns a no-op remover instead of attaching duplicates.
The module has zero project imports (`grep -n "^import"` returns nothing).

## Fallback contract — verbatim, because Phases 11 and 12 write screenshot gates against it

| Selector | Value |
|---|---|
| Container role | `role="alert"` |
| Container class | `flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center` |
| Heading text | `Something went wrong` |
| Body text | `The page could not be displayed. The error has been recorded.` |
| Message element | `data-testid="error-boundary-message"` — holds the real thrown message |
| Button text | `Reload this page` |

A custom `fallback` prop, when supplied, replaces all of the above.

## Measured results

```
npx vitest run src/lib/__tests__/error-reporting.test.ts
 ✓ src/lib/__tests__/error-reporting.test.ts (9 tests) 30ms
 Test Files  1 passed (1)
      Tests  9 passed (9)
VITEST_EXIT=0

npx vitest run src/components/__tests__/ErrorBoundary.test.tsx
 ✓ src/components/__tests__/ErrorBoundary.test.tsx (5 tests) 154ms
 Test Files  1 passed (1)
      Tests  5 passed (5)
VITEST_EXIT=0
```

`npm run test:gate` — full unmodified suite against the 46-entry known-failure ledger:

```
 Test Files  11 failed | 100 passed (111)
      Tests  46 failed | 2384 passed (2430)

=========================================================
GATE OK — test baseline matches exactly
=========================================================
  total tests run     : 2430 (floor 2416)
  passed              : 2384
  known failures met  : 46
  LEDGER SIZE (debt)  : 46   <-- this number must only go down

GATE-SKIPS total=2430 skipped=0
GATE_EXIT=0
```

The ledger is unchanged at 46 and the total rose from 2416 to 2430 (14 new tests), which the floor-style
`min_total_tests` accepts. `frontend/test-baseline.json` was not edited.

Other verification, run and observed:

- `npx tsc -b --force` → zero output, `TSC_EXIT=0`
- `grep -cE "fetch\(|XMLHttpRequest|sendBeacon" src/lib/error-reporting.ts` → **0**
- `grep -c "<ErrorBoundary" src/main.tsx` → **2**; `grep -c "installGlobalErrorHandlers();"` → **1**
- `git status --porcelain frontend/package.json frontend/package-lock.json frontend/test-baseline.json` → empty
- `git status --porcelain engine/ specs/` → empty
- `node scripts/check-plan-closed-world.mjs` → exit 0
- `git log -1 --name-only --format=""` → exactly five paths, all under `apps/inheritance/frontend/src/`

## Deviations from Plan

**[Rule 1 - bug] The module's own doc comment tripped the no-network grep** — Found during: Task 1
verification. `grep -cE "fetch\(|XMLHttpRequest|sendBeacon" src/lib/error-reporting.ts` returned `2`
because the header comment named the three forbidden transport APIs while explaining that none of them
is used. The acceptance criterion requires `0`, and a later static gate greps this exact pattern, so a
comment that names them is indistinguishable from code that uses them. Fix: reworded the comment to
describe the constraint without naming the APIs. Count is now `0`. Files modified:
`frontend/src/lib/error-reporting.ts`. Commit: `87a3ae7b8`.

**[Rule 2 - missing critical] Two extra tests beyond the seven the plan enumerates** — Found during:
Task 1. The plan lists seven cases and requires "at least 7 passing". Two additional cases were added
because a gap in the plan's list would otherwise go unasserted: (a) `console.error` mirroring actually
happens with the documented argument shape — the plan mandates the mirror in the implementation but
lists no test for it; (b) a second `installGlobalErrorHandlers()` call does not double-report — the
plan mandates the `handlersInstalled` guard and threat T-5-02d names duplicate listeners as a Medium
threat, but no listed case exercises it. Result: 9 passing rather than 7. Nothing was removed or
loosened. Commit: `87a3ae7b8`.

**Total deviations:** 2 auto-fixed (1 bug, 1 missing-critical). **Impact:** none on the plan's stated
behavior; both changes strengthen rather than weaken what is asserted.

## Issues Encountered

None.

## Next

Wave 1 complete (`05-01` + `05-02`). Ready for wave 2: `05-03` (per-heir legitime/free-portion split)
and `05-04` (ten manual-review flag codes), both of which build on the `Step10Input` shape that
`05-01` established.
