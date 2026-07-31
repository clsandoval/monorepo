---
phase: 11-account-org-case-journey-gates
plan: 03
subsystem: verification
tags: [journey, playwright, runner, registry, references]
requires: ["11-01", "11-02"]
provides:
  - "frontend/journey/run.mjs — the single entry point every journey gate invokes"
  - "The journey/steps/ registry directory, read as data"
  - "serve.mjs build+preview lifecycle, session.mjs, actions.mjs, resets.mjs"
  - "The first approved reference pair, auth-signin, at zero pixel tolerance"
affects:
  - frontend/journey/serve.mjs
  - frontend/journey/session.mjs
  - frontend/journey/actions.mjs
  - frontend/journey/resets.mjs
  - frontend/journey/run.mjs
  - frontend/journey/run-probe.mjs
  - frontend/journey/steps/account.json
  - frontend/journey/rubrics/auth-signin.json
  - frontend/journey/references/auth-signin.png
  - frontend/journey/references/auth-signin.json
tech-stack:
  added: []
  patterns:
    - "A step is a committed JSON record, never a script; adding a screen to the gate set is adding a record"
    - "Three-valued exit contract with a fail-closed injection hook that can only force a cannot-run"
key-files:
  created:
    - frontend/journey/serve.mjs
    - frontend/journey/session.mjs
    - frontend/journey/actions.mjs
    - frontend/journey/resets.mjs
    - frontend/journey/run.mjs
    - frontend/journey/run-probe.mjs
    - frontend/journey/steps/account.json
    - frontend/journey/rubrics/auth-signin.json
    - frontend/journey/references/auth-signin.png
    - frontend/journey/references/auth-signin.json
  modified: []
key-decisions:
  - "The runner contains no reference-promotion path; the literal substring naming that command is absent from run.mjs so the property is grep-checkable"
  - "The reference was approved only after the rubric had already passed 7/7 on a real capture, and the PNG was looked at before promotion"
requirements-completed: [JRNY-02]
duration: 26 min
completed: 2026-07-31
---

# Phase 11 Plan 03: The Live Journey Runner Summary

One command now builds the application, serves it on a fixed port, drives headless chromium through
a step declared as data in a committed registry, evaluates a rubric, perceptually diffs against an
approved reference, writes artifacts, and returns a three-valued verdict.

- Tasks: 7 · Files: 10 created · One commit: `459ef75f8`

## What was built

`serve.mjs` (`buildApp`, `startPreview`, `JourneyCannotRun`) rebuilds before every run so a gate can
never screenshot a stale bundle, and holds port 4173 with `--strictPort` so a busy port is a loud
startup failure rather than a silent move to another server. `stop()` kills the whole process group.

`session.mjs` obtains **real** password-grant sessions for `alpha`, `beta` and `orphan`; an unknown
identity throws `SESSION UNKNOWN:` rather than returning null. `resets.mjs` exports a frozen `RESETS`
with the single `noop` entry; `run.mjs` rejects a reset name it does not contain.

`actions.mjs` closes the action set at four kinds and throws `ACTION INVALID: unknown kind` on
anything else. `steps/account.json` holds one record; `run.mjs` validates the whole registry before
starting anything — unknown field, out-of-set `requirement`/`session`/`reset`/action `kind`,
duplicate id, id failing `^[a-z0-9-]+$`, missing or invalid rubric, bad `settleMs` — each raising
`STEPS INVALID:` reported as a cannot-run.

`run-probe.mjs` asserts the cannot-run contract in three configurations.

## Verification (real output)

```
$ node journey/run.mjs --list
auth-signin
LIST_EXIT=0
$ ss -ltn | grep -c 4173
0

$ grep -c approve journey/run.mjs        -> 0
$ grep -c GATE-SKIPS journey/run.mjs     -> 1
$ grep -c JOURNEY_FORCE_NO_STACK journey/run.mjs -> 1

$ node -e "…buildApp(); startPreview(); fetch(origin + '/auth')…"
ORIGIN http://127.0.0.1:4173 STATUS 200
$ ss -ltn | grep -c 4173
0
INDEX_MTIME 1785521671 START 1785521654 NEWER

$ node -e "…getSession(env,'alpha')…adminClient…"
TOKEN_LEN 744
ADMIN_ROWS 2
$ grep -c "writeFileSync|appendFileSync" journey/session.mjs journey/resets.mjs
journey/session.mjs:0 journey/resets.mjs:0
$ node -e "…getSession(env,'nobody')…"
SESSION UNKNOWN: nobody

$ node -e "…steps/account.json…"            -> STEPS 1 auth-signin
$ node -e "…validateRubric(auth-signin)…"   -> RUBRIC OK
$ node -e "…runAction(null,{kind:'nope'})…" -> ACTION INVALID: unknown kind nope
```

**The comparator was proven wired before any reference existed.** The first run of the step:

```
$ node journey/run.mjs --step auth-signin
JOURNEY STEP FAILED auth-signin: REFERENCE MISSING
GATE-SKIPS total=1 skipped=0
JOURNEY FAIL steps=1 failed=1
RUN_EXIT=1
```

The rubric had nevertheless passed on that same real capture, which is what made promotion
legitimate:

```
$ node -e "…assertions.json…"
passed true failedCount 0
PASS page-present    element_visible "visible" "visible"
PASS title           text_equals     "Sign In" "Sign In"
PASS email-field     element_visible "visible" "visible"
PASS password-field  element_visible "visible" "visible"
PASS submit          text_equals     "Sign In" "Sign In"
PASS no-signup-firm  element_absent  0 0
PASS clean-console   no_console_error 0 0
```

The captured `actual.png` was opened and looked at before approving: a 1280×800 sign-in card with
the Sign In heading, email and password fields, "Forgot password?", the Sign In button and the
"Don't have an account? Sign up" footer — no signup-only firm field, no error state.

```
$ node journey/approve.mjs auth-signin
APPROVED auth-signin maxDiffPixels=0
$ cat journey/references/auth-signin.json
{ "maxDiffPixels": 0, "approvedOn": "2026-07-31", "approvedBy": "unattended-loop" }

$ node journey/run.mjs --step auth-signin
GATE-SKIPS total=1 skipped=0
JOURNEY PASS steps=1 failed=0
RUN_EXIT=0
$ node journey/run.mjs --all
GATE-SKIPS total=1 skipped=0
JOURNEY PASS steps=1 failed=0
ALL_EXIT=0

$ node journey/run-probe.mjs
RUN-PROBE ok cases=3
PROBE_EXIT=0
$ node journey/run.mjs --step does-not-exist
JOURNEY CANNOT RUN: --step 'does-not-exist' is not in the registry
EXIT=2

$ git status --porcelain apps/inheritance/frontend/.journey-runs
(empty)
$ node apps/inheritance/scripts/check-commit-discipline.mjs
COMMIT DISCIPLINE OK — 148 commit(s) audited, 120 touching apps/inheritance/, 0 mixed
```

## Deviations from Plan

**[Rule 1 — bug] `grep -c "approve" journey/run.mjs` counted comment prose** — Found during: Task 4.
The plan's acceptance criterion requires that grep to print `0`. The first draft satisfied the
substance — the runner imports no promotion module and performs no write into `journey/references/`
— but scored `3`, because the header comment explained the rule using the literal word three times.
Fix: reworded the header to state the same rule without the literal substring, and added a sentence
recording that its absence is deliberate and grep-checkable. No import and no code path changed.
Verification: `grep -c approve journey/run.mjs` = 0, and the step still reaches `REFERENCE MISSING`
rather than a false pass. Commit: `459ef75f8`.

**Total deviations:** 1 auto-fixed (1 × Rule 1). **Impact:** comment text only.

## Issues Encountered

None. No point of Philippine law arose; nothing was added to `.planning/LAWYER-AGENDA.md`.

## Self-Check: PASSED

All seven tasks' acceptance criteria re-run after the commit. Plan-level `<verification>`:
`--list` prints `auth-signin` and exits 0; `run-probe.mjs` prints `RUN-PROBE ok cases=3` and exits 0;
`--all` prints `JOURNEY PASS steps=1 failed=0` with `GATE-SKIPS total=1 skipped=0` and exits 0.

Ready for 11-04.
