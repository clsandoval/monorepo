---
phase: 16
plan: 16-01
status: complete
requirements: [CUT-02, CUT-03]
---

# 16-01 — Measured baseline before the repair

Committed `bed03eeb9` (`16-BASELINE.md`).

## What it found

**The brief's CUT-02 premise is false and was retired by measurement, not by writing code.**
`frontend/src/test-setup.ts` has carried the `ResizeObserver` polyfill plus the `scrollIntoView` and
`hasPointerCapture` shims since commit `181ae68c5` ("test(01): add jsdom polyfills — 342 failures to
46, none skipped"). The file is untouched by this phase. The inherited claim of "~1,465 frontend
failures from one missing jsdom global" has no referent: the real figure was 342, and Phase 1 closed
it. Adding a second polyfill would have been a no-op dressed as a fix.

Measured state at baseline: `npm run test:gate` exit 0, `Tests 31 failed | 2088 passed (2119)`,
`GATE OK`, `skipped=0`. `npx tsc -b --force` exit 0.

**CUT-03 baseline:** `JOURNEY FAIL steps=28 failed=24`, splitting 22 `DIFF FAILURE` and 2
`REFERENCE SIZE MISMATCH` (`results-view`, `results-family-tree`). The 4 passing steps are all
unauthenticated — an anonymous page has no sidebar to shift, which is the first evidence for the nav
story.

## Verification

`grep -c` over `test-setup.ts` → polyfills present; `npm run test:gate` → exit 0;
`npx tsc -b --force` → exit 0; `node journey/run.mjs --all` → `failed=24`.
