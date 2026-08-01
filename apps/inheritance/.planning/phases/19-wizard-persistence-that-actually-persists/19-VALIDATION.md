---
phase: 19
slug: wizard-persistence-that-actually-persists
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-08-01
---

# Phase 19 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

Phase 19 changes **no arithmetic anywhere**. It edits no Rust file, no legitime, no fraction, no
deduction, no rate table and no citation. What it changes is *whether a keystroke reaches Postgres*.
That confines the regression surface to one hook, one container component, one route component and
one new browser gate — and it means the whole engine test suite is available as a null control: if
`cargo test` moves at all during this phase, something is wrong that this phase did not intend.

The defect being repaired has a specific and instructive shape: **`useAutoSave` has seven passing
unit tests and is unreachable from the application.** The unit tests drive the hook directly with
changing props; the application never changes those props. Validation that samples only at the unit
level would have certified this defect for as long as it existed — and did. Every property in this
phase is therefore sampled at two levels wherever two levels exist: in-process with fake timers, and
end-to-end in a real browser against a real Postgres row.

Three results in this phase may legitimately end red or withheld. They are named here so a red result
is not mistaken for an execution failure:

1. `bash scripts/ci-gates.sh` (whole suite) is **not claimed to reach exit 0**. `G20` and `G21`
   remain registered blocking gates whose scripts commit `4ccf06270` deleted; retiring a gate is
   owner action under CLAUDE.md invariant 2, enforced by `G5`. This phase does not own that and does
   not touch the manifest except to append one gate.
2. `G3` currently fails with `TEST COUNT DROPPED: ran 2109 tests, floor is 2119`. This phase adds
   tests and may clear it as a side effect. That outcome is **measured in 19-06, never predicted**,
   and no baseline is edited either way.
3. Journey steps `results-view`, `results-family-tree` and `tax-tab-0` remain withheld from Phases
   16, 17 and 18. This phase does not touch them and approves nothing.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4 (frontend unit/component), `tsc -b` (typecheck), `cargo test` (engine null control), Playwright via `journey/browser.mjs` (browser gate) |
| **Config files** | `gates.manifest.json` / `gates.manifest.lock`; `frontend/tsconfig.json`; `frontend/vitest.config.ts` |
| **Typecheck command** | `cd frontend && npx tsc -b --force` |
| **Scoped unit run** | `cd frontend && npx vitest run src/hooks/__tests__/useAutoSave.test.tsx src/components/wizard/__tests__/WizardContainer.test.tsx src/routes/__tests__/caseId-autosave.test.tsx` |
| **Engine null control** | `cd engine && cargo test` — expected byte-identical at 546 passed / 0 failed |
| **New gate command** | `cd frontend && node journey/persistence.mjs` |
| **Test-count gate** | `cd frontend && npm run test:gate` |
| **Full suite command** | `bash scripts/ci-gates.sh` |

## Sampling plan — what is measured, how often, against what prior

| Signal | Command | Prior it is read against | Plans |
|---|---|---|---|
| Call sites of `setAutoSaveInput` outside the load effect | `grep -n setAutoSaveInput -r src/` | 0 today (`19-RESEARCH.md` §1) → at least 1 after 19-04 | 19-01, 19-04, 19-06 |
| Saves performed when a case is merely opened | `useAutoSave` unit test | 1 today (the redundant load-time write-back) → 0 after 19-02 | 19-01, 19-02 |
| Saves performed on an in-place object mutation | `useAutoSave` unit test re-passing the same object reference | 0 today → 1 after 19-02 | 19-02 |
| Saves performed on unmount inside the debounce window | `useAutoSave` unit test | 0 today → 1 after 19-02 | 19-02 |
| Frontend total test count | `cd frontend && npm run test:gate` | `2109`, floor `2119` (measured 2026-08-01) | 19-01, 19-06 |
| Engine regression (null control) | `cd engine && cargo test` | `546 passed; 0 failed` | 19-06 |
| Nine heirs surviving a reload against live Postgres | `cd frontend && node journey/persistence.mjs` | no prior — new gate, observed red on three injected regressions first | 19-05, 19-06 |

## Nyquist compliance — why each property is sampled at the rate it is

| Property | Levels sampled | Why one level is not enough |
|---|---|---|
| An edit reaches the hook (SAVE-01) | unit (`WizardContainer` onChange spy) **and** browser (`persistence.mjs` check 1) | The unit level is exactly what passed while the feature was dead. A browser sample is the only one that exercises the real prop wiring in `$caseId.tsx`. |
| The debounce fires on a changed value (SAVE-02) | unit only, three input shapes: new object, same object mutated in place, deep array mutation | The property is a pure function of two serialized values. A browser sample would add latency, not information. The three shapes are the sampling rate: reference equality passes the first and fails the other two. |
| Unmount flushes (SAVE-03) | unit (fake timers, `unmount()` at 1400 ms) **and** browser (`persistence.mjs` check 6, client-side navigation away mid-debounce) | Fake timers cannot prove React's real cleanup ordering under a router transition. Real timers cannot prove the boundary at 1400 ms. |
| Status is visible and failure is never success (SAVE-04) | unit (forced rejection, asserts error copy present **and** success copy absent from the document) **and** browser (`persistence.mjs` check 5) | Asserting only that the error copy appears would pass a component that rendered both. The absence assertion is the second sample. |
| Nine heirs survive a reload (SAVE-05) | browser only | A unit test cannot reload a page. This is the one property with a single level, by construction, and it is compensated by asserting the same fact twice within the run — once in the database and once in the reloaded DOM. |

## Every failure path is observed before it is trusted

No gate in this project is registered until it has been seen failing. `19-05` observes
`journey/persistence.mjs` exit 1 on **three separately injected regressions**, restoring the source
between each and confirming the gate returns to exit 0:

1. Remove the `onChange` prop from `<WizardContainer>` in `$caseId.tsx` → expect `NOT PERSISTED`.
2. Remove the unmount flush from `useAutoSave.ts` → expect `UNMOUNT LOST`.
3. Restore `prevInputRef.current === input` reference equality in `useAutoSave.ts` → expect
   `NOT PERSISTED`.

A gate nobody has seen fail is not known to be a gate. `19-06` registers `G35` only after `19-05`
records those three observations with pasted output.

## Null controls

| Control | Expectation | Owner |
|---|---|---|
| `cd engine && cargo test` | byte-identical count, `0 failed` — this phase edits no Rust | 19-06 |
| `frontend/test-baseline.json`, `assertion-baseline.json`, `gate-skips.lock` | unmodified by every commit in this phase, proven by `git log --name-only` | 19-06 |
| `frontend/journey/references/` | zero files touched, proven by `git log --name-only ... | grep -c` returning 0 | 19-06 |
| Seeded Alpha case `input_json` | unchanged after `journey/persistence.mjs` runs, asserted inside the gate itself | 19-05 |

## What a BLOCKED report looks like in this phase

Per `.planning/PLAN-STANDARD.md`: stop, paste the real command output, change nothing to make it
green. The three situations most likely to produce one here:

- Docker or the local Supabase stack is not running → `journey/persistence.mjs` exits 2 with
  `PERSISTENCE CANNOT RUN: local Supabase stack is not running`. Report BLOCKED with that line. Do
  not weaken the gate to skip the database.
- Chromium is absent → exit 2 with `PERSISTENCE CANNOT RUN: chromium is not installed`. Same
  treatment.
- `npm run test:gate` still reports below 2119 after all plans land → report `G3` as red with the
  pasted `TEST COUNT DROPPED` line. Do **not** edit `min_total_tests`; that is owner action with
  precedent `4ccf06270`.
