---
phase: 10-journey-gate-infrastructure-seeding-rubric-artifacts
plan: 06
subsystem: gates
tags: [gate-registration, g15, documentation]
requires: ["10-02", "10-03", "10-04", "10-05"]
provides:
  - "Gate G15 at order 6 — cd frontend && node journey/selftest.mjs, blocking"
  - "frontend/journey/selftest.mjs — eleven cases covering all eight rubric kinds and all four diff outcomes"
  - "frontend/journey/JOURNEY.md — the seams contract Phases 11 and 12 read"
  - "GATES.md section 12 and the updated section 1 table"
affects:
  - gates.manifest.json
  - gates.manifest.lock
  - GATES.md
tech-stack:
  added: []
  patterns:
    - "Gate composes existing probes; one browser launched and reused across eleven cases"
    - "Failures collected, not short-circuited, so one run names every broken mechanism"
    - "GATE-SKIPS printed on both the pass and the fail path, because G8 reads it regardless of outcome"
key-files:
  created:
    - frontend/journey/selftest.mjs
    - frontend/journey/JOURNEY.md
  modified:
    - gates.manifest.json
    - gates.manifest.lock
    - GATES.md
key-decisions:
  - "GATES.md's 'ALL GATES PASSED (14/14) is not achievable' sentence was CORRECTED rather than left standing: the owner resolved OBS-05/OBS-06 in commit d71f9150e before this phase executed, the G3 halt is gone, and leaving a now-false statement in the owner-owned gate doc would be worse than updating it. The gate set itself was appended to only — no command edited, no blocking downgraded."
requirements-completed: [JRNY-09, JRNY-10, JRNY-12]
requirements-blocked: []
commits: [3d2bfc176]
duration: ~35 min
completed: 2026-07-31
---

# Phase 10 Plan 06: Gate G15 and the Seams Document Summary

The journey harness is now enforced by a registered blocking gate that has been observed going red on
a real regression and green again after reverting it.

## Measured results

- `node journey/selftest.mjs` → exit 0, `GATE-SKIPS total=11 skipped=0`, no `SELFTEST FAILED` line.
  `grep -c "launchBrowser(" journey/selftest.mjs` → 1 (one browser, reused).
  `grep -c "approve.mjs" journey/selftest.mjs` → 1, and that single occurrence is the child-process
  refusal case at line 266.

- **The gate was observed failing.** With `Maria Santos` changed to `Maria Santoz` in
  `fixtures/basic.html`:

  ```
  SELFTEST FAILED rubric-positive: expected 8/8, failures: [{"id":"heir-name-exact","kind":"text_equals","passed":false,"expected":"Maria Santos","actual":"Maria Santoz"}]
  GATE-SKIPS total=11 skipped=0
  INJECTED_EXIT=1
  ```

  After `git checkout -- journey/fixtures/basic.html`: `GATE-SKIPS total=11 skipped=0`,
  `REVERTED_EXIT=0`, and `git status --porcelain journey/fixtures/basic.html` empty. No case was
  weakened, skipped or deleted. `ls -a journey/references/` → only `.gitkeep`, before and after.

- Registration: manifest holds **14 gates**, lock holds **14 entries**. Order printed:
  `G5=1 G6=2 G7=3 G12=4 G13=5 G15=6 G1=7 G2=8 G3=9 G4=10 G10=11 G11=12 G8=13 G9=14` — G9 last.
  `G15_LOCKED={"id":"G15","command":"cd frontend && node journey/selftest.mjs","blocking":true}`.
  `git diff gates.manifest.lock` shows one appended object and nothing else;
  `git diff gates.manifest.json` shows the appended G15 object plus `order`-only changes on the seven
  gates below it.
  `node scripts/check-gate-manifest.mjs` → `MANIFEST OK — 14 gates, 14 locked`, exit 0.
  `node scripts/check-gate-skips.mjs` → `SKIPS OK — 14 gates accounted, 1 declared skip, 0 undeclared`.

- **Full runner, run twice, both exit 0:**

  ```
  === GATE G5 (1/14) … G15 (6/14): journey harness self-test … G9 (14/14) ===
  GATE COVERAGE 14/14
  ALL GATES PASSED (14/14)
  RUNNER_EXIT=0
  ```

  Every gate reported `pass` with exit 0, including **G15 at order 6** and **G3 at order 9**.
  Requirement coverage now maps `JRNY-01`, `JRNY-09`, `JRNY-10` and `JRNY-12` to G15;
  22/94 requirements gated.

## The deviation that must not be glossed

Every Phase 10 plan states that `ALL GATES PASSED (14/14)` is **not achievable this phase** and that a
halt at G3 is the expected outcome. **That premise was already false when this phase executed.** The
owner resolved OBS-05/OBS-06 in commit `d71f9150e` ("Owner ruled OBS-05/OBS-06: the engine rejects
inputs it cannot distribute conservatively… Unblocks the G3 halt inherited by phases 5, 7, 8 and 9"),
which landed before Phase 10 started. G3 has been green ever since.

So the runner exiting 0 with 14/14 is a **measured observation, not a claim** — it was produced twice
and its full per-gate table is pasted above. No gate, precondition, test or ledger was edited to reach
it. The plan's failure condition ("a halt at G15, or earlier than before") did not occur.

`GATES.md` was updated accordingly: the paragraph asserting the halt now records it in the past tense,
names the resolving commit, and states the measured current outcome. Leaving a false statement in the
owner-owned gate document would have been worse than correcting it.

## Notes

No point of Philippine law arose; nothing was added to the lawyer agenda.
