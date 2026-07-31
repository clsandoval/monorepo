---
phase: 10-journey-gate-infrastructure-seeding-rubric-artifacts
plan: 03
subsystem: journey-diff
tags: [pixelmatch, references, approval, jrny-10]
requires: ["10-01"]
provides:
  - "frontend/journey/diff.mjs — DIFF_MARKERS (frozen, five) and compareToReference, write-free"
  - "frontend/journey/approve.mjs — the only writer of references/, refuses when no run produced the image"
  - "frontend/journey/REFERENCES.md — the re-approval flow and the prohibition on raising maxDiffPixels"
  - "frontend/journey/diff-probe.mjs — all four comparator outcomes observed"
affects: []
tech-stack:
  added: []
  patterns:
    - "Comparator and approver are separate modules; the comparator contains zero write calls so a gate cannot rewrite its own expectation"
    - "Four-step classification precedence: REFERENCE MISSING → REFERENCE SIZE MISMATCH → DIFF FAILURE → pass"
    - "Probe writes only inside fs.mkdtempSync, so the real reference store stays untouched"
key-files:
  created:
    - frontend/journey/diff.mjs
    - frontend/journey/approve.mjs
    - frontend/journey/diff-probe.mjs
    - frontend/journey/REFERENCES.md
    - frontend/journey/references/.gitkeep
  modified: []
key-decisions:
  - "A reference PNG whose sidecar JSON is absent is classified REFERENCE MISSING, not pass — an image with no declared tolerance has no pass condition"
  - "approve.mjs tolerates .journey-runs/ not existing (plan 10-04 has not landed) and treats it as the refusal case rather than throwing"
requirements-completed: [JRNY-10]
requirements-blocked: []
commits: [a2c6e32ca]
duration: ~20 min
completed: 2026-07-31
---

# Phase 10 Plan 03: Perceptual Diff and Reference Re-approval Summary

A gate failure can now name which mechanism fired, and re-approving a reference is a separate command
that a gate cannot invoke and that refuses to invent an image.

## Measured results

- `EXPORTS=DIFF_MARKERS,compareToReference`;
  `MARKERS=RUBRIC FAILURE|DIFF FAILURE|REFERENCE MISSING|REFERENCE SIZE MISMATCH|STEP ERROR`;
  `Object.isFrozen(DIFF_MARKERS)` → `true`.
- `grep -c "writeFileSync\|mkdirSync\|createWriteStream" journey/diff.mjs` → 0.
- `node journey/approve.mjs no-such-step` → exit 1, `APPROVE REFUSED: no artifact found for step no-such-step`,
  with `frontend/.journey-runs/` not existing at all — refusal, not an unhandled exception.
- `node journey/diff-probe.mjs` → exit 0,
  `DIFF-PROBE ok missing=true pass=true diff=23535 sizeMismatch=true approveRefused=true`.
  The self-comparison asserted `diffPixels === 0` exactly; the DIFF FAILURE case asserted a Buffer
  `diffPng` longer than 1000 bytes; the size-mismatch case asserted `diffPixels === null`.
- `frontend/journey/references/` contains only `.gitkeep` before and after the probe and after the
  commit — no golden image of the real app was committed.
- `REFERENCES.md`: all five markers named, `node journey/approve.mjs` given literally, raising
  `maxDiffPixels` to clear a red gate stated as prohibited, "no gate invokes approve.mjs" stated,
  and §"Why Phase 10 ships no golden image" cites the unmeasured cross-platform rasterisation.
- `node scripts/check-commit-discipline.mjs` → exit 0, 0 mixed commits.

## Notes

`gates.manifest.json` untouched; no ledger file edited.
