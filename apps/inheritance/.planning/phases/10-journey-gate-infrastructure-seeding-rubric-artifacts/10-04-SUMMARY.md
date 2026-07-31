---
phase: 10-journey-gate-infrastructure-seeding-rubric-artifacts
plan: 04
subsystem: journey-artifacts
tags: [artifacts, retention, jrny-12]
requires: ["10-02", "10-03"]
provides:
  - "frontend/journey/artifacts.mjs — ARTIFACT_ROOT, MAX_RETAINED_RUNS, newRunStamp, writeStepArtifacts"
  - "frontend/journey/artifacts-probe.mjs — a real induced double failure, five artifacts, and the approve round-trip"
  - "frontend/.gitignore — .journey-runs/ ignored"
affects: []
tech-stack:
  added: []
  patterns:
    - "One writer for journey artifacts; runStamp format chosen so lexical descending order equals newest-first, which is what approve.mjs's newest-run selection relies on"
    - "Retention capped at MAX_RETAINED_RUNS = 20 so a month-long unattended loop cannot fill the disk"
key-files:
  created:
    - frontend/journey/artifacts.mjs
    - frontend/journey/artifacts-probe.mjs
  modified:
    - frontend/.gitignore
key-decisions:
  - "assertions.json is written unconditionally, including on a pass, so a passing step still leaves a machine-readable record"
  - "The probe deletes what it approved before exiting, so journey/references/ still ships holding only .gitkeep"
requirements-completed: [JRNY-12]
requirements-blocked: []
commits: [097062a18]
duration: ~20 min
completed: 2026-07-31
---

# Phase 10 Plan 04: Durable Journey Failure Artifacts Summary

A failing journey step now leaves five inspectable files on disk, the failure record names both
mechanisms when both fired, and none of it can be committed.

## Measured results

- `node journey/artifacts-probe.mjs` → exit 0,
  `ARTIFACTS-PROBE ok files=5 markers=both failedAssertions=3 diffPixels=23535 approveRoundTrip=true`.
- `find .journey-runs -type f` listed exactly five files under one step directory:
  `actual.png`, `assertions.json`, `diff.png`, `FAILURE.txt`, `reference.png`.
- The written `FAILURE.txt`, verbatim:

  ```
  RUBRIC FAILURE DIFF FAILURE
  Step: probe-both-failed
  Run: 2026-07-31T17-08-23-677Z
  FAILED heir-share-shows-one-million kind=text_contains expected="PHP 1,000,000.00" actual="PHP 1,500,000.00"
  FAILED heir-share-not-one-point-five-million kind=text_absent expected="PHP 1,500,000.00" actual="PHP 1,500,000.00"
  FAILED warning-banner-visible kind=element_visible expected="exactly one visible element" actual="0 elements matched"
  DIFF diffPixels=23535 maxDiffPixels=0
  Artifacts: /home/clsandoval/cs/monorepo/apps/inheritance/frontend/.journey-runs/2026-07-31T17-08-23-677Z/probe-both-failed
  ```

  Line 1 carries **both** markers — the JRNY-10 distinction survived into the durable record.
- `git check-ignore -v frontend/.journey-runs/probe/x.png` → exit 0, matched by
  `apps/inheritance/frontend/.gitignore:16:.journey-runs/`. After the probe ran for real,
  `git status --porcelain frontend/` listed no path under `.journey-runs/`.
- `EXPORTS=ARTIFACT_ROOT,MAX_RETAINED_RUNS,newRunStamp,writeStepArtifacts`;
  `MAX_RETAINED_RUNS = 20` at line 33; `grep -c "references" journey/artifacts.mjs` → 0.
- Approval round-trip: `approve.mjs probe-both-failed --by probe` exited 0 printing
  `APPROVED probe-both-failed`, wrote a sidecar with `maxDiffPixels: 0`, `approvedBy: "probe"` and an
  `approvedOn` matching `^\d{4}-\d{2}-\d{2}$`, and both files were then deleted by the probe.
  `ls -a journey/references/` → only `.gitkeep`.
- `node scripts/check-commit-discipline.mjs` → exit 0, 0 mixed commits.
