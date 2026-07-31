---
phase: 14-lawyer-blocked-legal-fixes-legal-traceability
plan: 03
subsystem: planning
tags: [blocked, lawyer, legal-authority, gate]
requires: []
provides:
  - ".planning/BLOCKED-REQUIREMENTS.md — the committed record of the three unimplementable requirements"
  - "scripts/check-blocked-requirements.mjs — gate G26's command (registered by 14-06)"
affects:
  - "nothing under engine/src, frontend/src or specs/ — deliberately"
tech-stack:
  added: []
  patterns:
    - "A check that goes red on GOOD news: ANSWER ARRIVED fires the moment a blocking decision stops being awaiting-answer while its requirement is still open"
key-files:
  created:
    - .planning/BLOCKED-REQUIREMENTS.md
    - scripts/check-blocked-requirements.mjs
    - scripts/fixtures/blocked-entry-missing.md
    - scripts/fixtures/blocked-wrong-decision.md
    - scripts/fixtures/blocked-status-drift.md
    - scripts/fixtures/blocked-answered-decisions.json
  modified: []
key-decisions:
  - "LAW-06, LAW-07 and LAW-12 are reported BLOCKED-ON-LAWYER. No reading of Art. 771, Art. 911, Art. 992 or RA 11642 Sec. 41 was adopted, implemented, defaulted, stubbed or hidden behind a config switch."
  - "The header comment was reworded so it does not spell '--fix', '--update', '--accept' or '--regenerate' literally. The audit for 'can this check rewrite its own input' is a grep, and a prose mention naming the flags it does NOT have would be a false positive on that grep."
requirements-completed: []
requirements-blocked: [LAW-06, LAW-07, LAW-12]
duration: 25 min
completed: 2026-07-31
---

# Phase 14 Plan 03: Blocked-Requirements Ledger and Gate Summary

LAW-06, LAW-07 and LAW-12 were **not implemented**, because each requires a point of Philippine law
that only the lawyer may decide and none of the three questions has been answered. The deliverable is
the committed record plus a check that keeps it honest in both directions.

## The three BLOCKED reports

### BLOCKED — LAW-06

```text
BLOCKED
Requirement: LAW-06 — A donation inter vivos never causes distributed shares to exceed the estate;
             an heir's excess entitlement is modelled as a reduction claim against a named donee
             (Arts. 771, 911)
Task: 14-03 Task 1: Confirm all three decisions are still awaiting an answer
What was attempted: Queried .planning/lawyer-decisions.json for LAWYER-06, the decision LAW-06 is
             recorded as blocked on, to see whether an answer had arrived that would let the fix
             proceed. It has not. The exact question the lawyer is being asked is:
             "Confirm that modelling the heir's remedy as a claim against the donee, rather than as
             estate pesos, is the right shape — since it changes the output schema."
Real command output:
LAWYER-04 awaiting-answer ["LAW-07"] null null null
LAWYER-06 awaiting-answer ["LAW-06"] null null null
LAWYER-08 awaiting-answer ["LAW-12"] null null null
```

### BLOCKED — LAW-07

```text
BLOCKED
Requirement: LAW-07 — Art. 992's iron curtain is implemented for the collateral line, per the answer
             to LAWYER-04
Task: 14-03 Task 1: Confirm all three decisions are still awaiting an answer
What was attempted: Queried .planning/lawyer-decisions.json for LAWYER-04. Status is
             awaiting-answer and all three answer fields are null. The exact question is two points,
             stated separately so they can be answered separately:
             "1. Confirm the narrow reading (Reading A), so the collateral barrier can be
              implemented.
              2. State whether every case where the barrier is decisive should carry a
              LAWYER_REVIEW flag in the output rather than being a silent computation."
Real command output:
LAWYER-04 awaiting-answer ["LAW-07"] null null null
LAWYER-06 awaiting-answer ["LAW-06"] null null null
LAWYER-08 awaiting-answer ["LAW-12"] null null null
```

### BLOCKED — LAW-12

```text
BLOCKED
Requirement: LAW-12 — The RA 11642 adoption regime is either implemented or made to refuse
             computation, replacing the currently inert retroactive_ra_11642 flag and the repealed
             RA 8552 citations
Task: 14-03 Task 1: Confirm all three decisions are still awaiting an answer
What was attempted: Queried .planning/lawyer-decisions.json for LAWYER-08. Status is
             awaiting-answer and all three answer fields are null. The exact question is:
             "The answer becomes the default for a flag that currently does nothing.
              The audit put an explicit alternative on the table: 'I would rather not decide' is
              itself an acceptable answer. The engine is then built to refuse to compute Sec. 41
              fact patterns rather than guessing."
             Note that 'refuse to compute' being an available answer is NOT permission for an agent
             to select it: .planning/PLAN-STANDARD.md section 3 names 'silently choosing the option
             that makes the build green' as prohibited.
Real command output:
LAWYER-04 awaiting-answer ["LAW-07"] null null null
LAWYER-06 awaiting-answer ["LAW-06"] null null null
LAWYER-08 awaiting-answer ["LAW-12"] null null null
```

## What Was Built

- `.planning/BLOCKED-REQUIREMENTS.md` — status table plus three entries in the fixed seven-field
  shape. Every question is a verbatim block quote of the matching agenda entry's
  `### What I need from you`; each was proved verbatim by `grep -cF` returning `1` against
  `.planning/LAWYER-AGENDA.md`.
- `scripts/check-blocked-requirements.mjs` — 7 violation markers, dependency-free node ESM, zero
  writes, three read-only path overrides.
- Four committed fixtures driving four of the failure paths.
- 1 commit, `858631cfb`, six explicit paths.

## Verification Results

| Command | Result |
|---|---|
| registry query (task 1) | three lines, all `awaiting-answer`, all `null null null`, `blocks` = `["LAW-07"]`, `["LAW-06"]`, `["LAW-12"]` |
| `grep -c "^## LAW-" .planning/BLOCKED-REQUIREMENTS.md` | `3` — headings at lines 23, 57, 94, in order LAW-06/LAW-07/LAW-12 |
| `grep -c "^\*\*" .planning/BLOCKED-REQUIREMENTS.md` | `21` = 7 fields × 3 entries |
| `grep -cF` on one distinctive sentence per quotation | `1`, `1`, `1` in `.planning/LAWYER-AGENDA.md` |
| `node scripts/check-blocked-requirements.mjs` | `BLOCKED REQUIREMENTS OK — 3 requirement(s) checked, all awaiting-answer`, `GATE-SKIPS total=3 skipped=0`, `REAL=0` |
| `grep -cE "--fix\|--update\|--accept\|--regenerate\|writeFileSync\|appendFileSync"` | `0` |
| `--ledger scripts/fixtures/blocked-entry-missing.md` | `BLOCKED ENTRY MISSING — LAW-12 has no '## LAW-12 — blocked on LAWYER-NN' heading …`, `F1=1` |
| `--ledger scripts/fixtures/blocked-wrong-decision.md` | `WRONG BLOCKING DECISION — … says LAW-07 is blocked on LAWYER-06, but LAWYER-06's 'blocks' array … is ["LAW-06"] and does not contain LAW-07`, `F2=1` |
| `--ledger scripts/fixtures/blocked-status-drift.md` | `STATUS DRIFT — LAW-06 records '**Registry status:** confirmed' but … says LAWYER-06 has status 'awaiting-answer'`, `F3=1` |
| `--decisions scripts/fixtures/blocked-answered-decisions.json` | `ANSWER ARRIVED — LAWYER-06 now has status 'confirmed', so LAW-06 is NO LONGER BLOCKED … Start the work: run the five steps of .planning/LEGAL-CORRECTION-WORKFLOW.md`, `F4=1` |
| `--ledger scripts/fixtures/nope.md` | `BLOCKED LEDGER UNREADABLE: ledger file … does not exist`, `F5=1` |
| `node scripts/check-lawyer-agenda.mjs` | `AGENDA OK — 9 decisions, 11 anchors, 9 awaiting-answer`, exit 0 — G10 unaffected |
| `git status --porcelain .planning/LAWYER-AGENDA.md .planning/lawyer-decisions.json` | empty — neither lawyer file moved |
| `node scripts/check-commit-discipline.mjs` | `COMMIT DISCIPLINE OK — 204 commit(s) audited … 0 mixed`, exit 0 |
| `git show --stat --name-only HEAD` | exactly the six `files_modified` paths, all under `apps/inheritance/` |

Two further markers not named in the plan's fixture list were also observed firing, using
throwaway copies in the scratchpad (deliberately **not** committed, because `files_modified` fixes
the fixture set at four):

- `MISSING FIELD — LAW-06 lacks field line(s): **Why no agent may proceed:**` (+ LAW-07, LAW-12), exit 1
- `REQUIREMENT CLAIMED COMPLETE — … marks LAW-06 '[x]' while LAWYER-06 is still 'awaiting-answer' … No agent may close LAW-06 without the lawyer's answer.`, exit 1

All 7 of the script's markers have therefore been seen firing.

## Deviations from Plan

**[Rule 1 — acceptance criterion vs. its own doc comment] The `--fix|--update|…` grep** — Found
during: Task 3 acceptance. The first draft's header comment contained the sentence "has no --fix,
--update, --accept, --regenerate or waiver flag", which made the acceptance grep print `1` even
though the script has none of them. Fix: reworded the sentence to describe the absence without
spelling the tokens, and said in the comment why. The grep now prints `0` and the claim it audits
("this check cannot rewrite its own input") is true and unchanged.

**Total deviations:** 1 (documentation wording).
**Impact:** None on behaviour.

## Issues Encountered

None beyond the three blocks, which are the plan's expected outcome, not a failure.

## Self-Check: PASSED

- Three BLOCKED reports written in the five-field template with real pasted registry output.
- No file under `engine/src/`, `frontend/src/` or `specs/` touched.
- G10 still exits 0.

## Next

`14-04` (wave 1, spec corrections).
