---
phase: 10-journey-gate-infrastructure-seeding-rubric-artifacts
plan: 01
subsystem: journey-harness
tags: [playwright, determinism, fixtures, jrny-12]
requires: []
provides:
  - "frontend/journey/browser.mjs — the only module in the repository that imports playwright; exports launchBrowser, newJourneyPage, captureScreenshot"
  - "frontend/journey/fixtures/basic.html and mutated.html — the committed offline pair every later probe asserts against"
  - "frontend/journey/browser-probe.mjs — proof that launch, capture and byte-level determinism work"
affects:
  - frontend/package.json
  - frontend/package-lock.json
tech-stack:
  added:
    - "playwright 1.56.1 (exact pin, devDependency)"
    - "pixelmatch 7.2.0 (exact pin, devDependency)"
    - "pngjs 7.0.0 (exact pin, devDependency)"
  patterns:
    - "One launch seam; determinism options (viewport 1280x800, deviceScaleFactor 1, reducedMotion reduce, forcedColors none, animation/transition/caret suppression stylesheet, fullPage + animations:'disabled') live in exactly one file"
    - "Node ESM under frontend/journey/, deliberately outside tsconfig include so gate G4 is untouched"
    - "Probes import the shared helper, never playwright, so the probe is evidence about the path the gates use"
key-files:
  created:
    - frontend/journey/browser.mjs
    - frontend/journey/fixtures/basic.html
    - frontend/journey/fixtures/mutated.html
    - frontend/journey/browser-probe.mjs
  modified:
    - frontend/package.json
    - frontend/package-lock.json
key-decisions:
  - "The fixture's seed-readout script wraps each storage read in try/catch and substitutes 'absent' on throw, because a file:// origin can deny storage access and an uncaught SecurityError would show up as a console error and break the zero-console-error assertion"
  - "mutated.html was generated from basic.html by a two-edit sed, so the pair differs in exactly the money figure and the warning-banner element and nothing else"
requirements-completed: [JRNY-12 (partial — the capture half; artifact persistence lands in 10-04)]
requirements-blocked: []
commits: [2850b8953]
duration: ~15 min
completed: 2026-07-31
---

# Phase 10 Plan 01: Journey Browser Harness Summary

The repository can now launch a headless browser and capture a PNG offline from a committed script,
and every screenshot it will ever take goes through one launch helper whose determinism settings are
fixed in a single file.

## Measured results

- `node journey/browser-probe.mjs` → exit 0, `BROWSER-PROBE ok bytes=28314 deterministic=true consoleErrors=0`.
  Re-run: identical line, identical byte count — so two consecutive captures and two separate process
  runs all agree.
- `node -e "import('./journey/browser.mjs')..."` → `EXPORTS=captureScreenshot,launchBrowser,newJourneyPage`.
- `grep -c "playwright" journey/browser-probe.mjs` → 0.
- `grep -c "writeFileSync\|createWriteStream" journey/browser.mjs` → 0.
- `git diff frontend/package.json` → exactly three added lines, all in `devDependencies`, all exact-pinned.
- `git diff frontend/package-lock.json` → 73 insertions, 0 deletions; the only added `node_modules/` keys
  are `pixelmatch`, `playwright`, `playwright-core`, `pngjs` and the optional `fsevents` playwright pulls in.
- `npx playwright install chromium` → exit 0 (build v1194 already present in `~/.cache/ms-playwright`).
- `npx tsc -b --force` → exit 0, zero diagnostics. `frontend/tsconfig.json` was not edited.
- `npm run test:gate` → `GATE OK — test baseline matches exactly`, 2449 tests, 2403 passed,
  46 known failures met, `GATE-SKIPS total=2449 skipped=0`. Unchanged.
- `node scripts/check-commit-discipline.mjs` → exit 0, 0 mixed commits.
- `node scripts/check-plan-closed-world.mjs` → exit 0, 56 plans / 204 tasks.

## Notes

`gates.manifest.json` was not touched; no gate was registered by this plan.
