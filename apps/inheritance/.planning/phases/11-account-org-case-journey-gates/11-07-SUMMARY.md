---
phase: 11-account-org-case-journey-gates
plan: 07
subsystem: verification
tags: [journey, intake, localstorage, draft-recovery]
requires: ["11-02", "11-03"]
provides:
  - "Eight JRNY-04 journey steps covering all seven guided-intake steps plus draft recovery"
  - "Eight complete IntakeFormState draft fixtures"
  - "Eight approved references at zero pixel tolerance"
affects:
  - frontend/journey/steps/intake.json
  - frontend/journey/fixtures/
  - frontend/journey/rubrics/
  - frontend/journey/references/
tech-stack:
  added: []
  patterns:
    - "@file: expansion so a step record references a committed fixture instead of embedding one"
    - "A no-crash assertion on every rubric whose screen has a measured error-boundary failure mode"
key-files:
  created:
    - frontend/journey/steps/intake.json
    - frontend/journey/fixtures/intake-draft-step-0.json
    - frontend/journey/fixtures/intake-draft-step-1.json
    - frontend/journey/fixtures/intake-draft-step-2.json
    - frontend/journey/fixtures/intake-draft-step-3.json
    - frontend/journey/fixtures/intake-draft-step-4.json
    - frontend/journey/fixtures/intake-draft-step-5.json
    - frontend/journey/fixtures/intake-draft-step-6.json
    - frontend/journey/fixtures/intake-draft-recovered.json
  modified: []
key-decisions:
  - "The client name selector is #client-name, read from ClientDetailsStep.tsx:59, not the #client-full-name the plan's table guessed"
  - "intake-step-2's step-name expectation is 'Step 3: About the Decedent', the h2 the source renders, not the 'Decedent Info' stepper label"
requirements-completed: [JRNY-04]
duration: 24 min
completed: 2026-07-31
---

# Phase 11 Plan 07: Guided-Intake Journey Gates Summary

All seven guided-intake steps plus the `localStorage` draft-recovery path are verified, each reached
directly by seeding a complete draft before first paint rather than by clicking through the steps
before it.

- Tasks: 6 · Files: 33 created · One commit: `22f7e240d`
- Registry: **15** steps green (5 account + 2 org + 8 intake).

## The two selector values, read from source (task 1)

| What | Plan's table | **Source (the fact)** |
|---|---|---|
| Intake form container testid | `guided-intake-form` | `guided-intake-form` — `GuidedIntakeForm.tsx:182`. Match. |
| Client full-name input id | `client-full-name` | **`client-name`** — `ClientDetailsStep.tsx:59`. **Substituted.** |

`INTAKE_STEPS` confirmed as the seven names in runtime order: Conflict Check, Client Details,
Decedent Info, Family Composition, Asset Summary, Settlement Track, Review & Save. No file under
`frontend/src/` was modified.

## Verification (real output)

```
$ for n in 0..6; do …; done
0 0 assetSummary,clientDetails,conflictCheck,currentStep,decedentInfo,familyComposition,settlementTrack
1 1 (same key set)   2 2   3 3   4 4   5 5   6 6
$ node -e "…recovered…"
recovered 1 Recovered Client recovered@example.test
$ node -e "…step-0 vs step-6 minus currentStep…"
IDENTICAL_EXCEPT_STEP true

$ node journey/run.mjs --list        (15 ids)
auth-signin auth-signup auth-verify-nocode auth-verify-badcode auth-session-persisted
intake-step-0 … intake-step-6 intake-draft-recovered
org-invite-accepted org-invite-rejected
$ node -e "…intake.json…"   -> INTAKE 8
$ node -e "…validateRubric intake-*…"  -> OK ×8
```

Rubric-before-reference — every step reached `passed=true failed=0` with `REFERENCE MISSING` as its
only marker before anything was approved:

```
intake-step-0 passed=true failed=0     REFERENCE MISSING
intake-step-1 passed=true failed=0     REFERENCE MISSING
intake-step-2 passed=true failed=0     REFERENCE MISSING
intake-step-3 passed=true failed=0     REFERENCE MISSING
intake-step-4 passed=true failed=0     REFERENCE MISSING
intake-step-5 passed=true failed=0     REFERENCE MISSING
intake-step-6 passed=true failed=0     REFERENCE MISSING
intake-draft-recovered passed=true failed=0   REFERENCE MISSING

$ docker exec … "select count(*) from cases;"    -> 2
```

Captures were inspected before approval. `intake-draft-recovered` shows Step 2 of 7 with
`Recovered Client` in Full Name, `recovered@example.test` in Email and `09171234567` in Phone — the
seeded draft was read on first paint, with no reload, which is the only honest way to test a recovery
path. `intake-step-6` shows the full Review & Save summary with its `Create Case` control **not**
clicked.

```
$ for s in …; do node journey/approve.mjs "$s"; done
APPROVED intake-step-0 … intake-draft-recovered, all maxDiffPixels=0

$ node journey/run.mjs --all
GATE-SKIPS total=15 skipped=0
JOURNEY PASS steps=15 failed=0
ALL_EXIT_FIRST=0
$ node journey/run.mjs --all
JOURNEY PASS steps=15 failed=0
ALL_EXIT_SECOND=0

$ node -e "…reference counts…"     -> PNG 15 JSON 15
$ node -e "…every sidecar zero…"   -> ALL_TOLERANCE_ZERO true
$ docker exec … "select count(*) from cases;"  -> 2

$ git show --stat --name-only HEAD | grep -c "apps/inheritance/frontend/journey"
33
$ node apps/inheritance/scripts/check-commit-discipline.mjs
COMMIT DISCIPLINE OK — 156 commit(s) audited, 128 touching apps/inheritance/, 0 mixed
```

## Deviations from Plan

**[Rule 1 — bug] `#client-full-name` does not exist; the input is `#client-name`** — Found during:
Task 1, which exists precisely to catch this. `ClientDetailsStep.tsx:59` declares `id="client-name"`.
The plan's own rule for this case is explicit ("the source is the fact, this table is the
transcription"), so `intake-draft-recovered.json`'s `attribute_equals` selector uses `#client-name`.
The kind, the attribute and the expected value are unchanged. Verification: the assertion passes and
the screenshot shows `Recovered Client` in the Full Name field. Commit: `22f7e240d`.

**[Rule 1 — bug] `intake-step-2`'s step-name expectation was mis-derived from the stepper label** —
Found during: Task 4. The rubric expected `Step 3: Decedent Info`, taken from `INTAKE_STEPS[2]`, and
failed:

```
FAIL step-name "Step 3: Decedent Info" actual="New Estate Case — Guided Intake\n\nStep 3 of 7\n\n1\nConflict Check\n2\nClient Details\n3\nDecedent Info\n…\nStep 3: About the Decedent\n…"
```

The step component's own heading is `Step 3: About the Decedent`
(`DecedentInfoStep.tsx:49`) — the plan assumed every component h2 repeats its stepper label. Before
correcting it I checked **all seven** h2 headings against source, because six passing assertions
would be worthless if they were passing by accident:

```
ConflictCheckStep.tsx:88      Step 1: Conflict Check
ClientDetailsStep.tsx:49      Step 2: Client Details
DecedentInfoStep.tsx:49       Step 3: About the Decedent   <-- the only divergence
FamilyCompositionStep.tsx:67  Step 4: Family Composition
AssetSummaryStep.tsx:33       Step 5: Asset Summary
SettlementTrackStep.tsx:52    Step 6: Settlement Track
IntakeReviewStep.tsx:38       Step 7: Review & Save
```

Six of seven genuinely match, so only one expectation was wrong. Fix: `intake-step-2`'s expectation
became `Step 3: About the Decedent`, the string the source renders. Same kind, same selector, no
assertion removed or loosened. This matters as an assertion because the stepper renders **all seven**
names on every step — it is the `Step N: ` heading prefix, not the label, that identifies which step
component actually mounted. Commit: `22f7e240d`.

**Total deviations:** 2 auto-fixed (2 × Rule 1), both transcription corrections against source.
**Impact:** none on coverage; both assertions still assert what they were written to assert.

## Issues Encountered

The plan's counts assume nineteen registered steps (`--list` prints 19, `--all` reports `steps=19`,
`PNG 19 JSON 19`). The real numbers are **15**, because plan 11-05 withheld `auth-signed-out` and
plan 11-06 withheld the three onboarding steps, both on documented blockers. All eight of *this*
plan's steps are registered and green; the shortfall is entirely inherited and is visible as reduced
coverage rather than as a false pass.

No point of Philippine law arose; nothing was added to `.planning/LAWYER-AGENDA.md`.

## Self-Check: PASSED

All six tasks' acceptance criteria re-run after the commit, with the two documented transcription
corrections and the inherited count difference. Plan-level `<verification>`: `--list` prints 15 ids,
both `--all` runs exit 0 with `JOURNEY PASS steps=15 failed=0`, and `node journey/rls-isolation.mjs`
still exits 0. Phase 11 success criterion 3 is **met**: case intake, including recovery from a
`localStorage` draft, is verified step by step.

Wave 3 complete. Ready for 11-08.
