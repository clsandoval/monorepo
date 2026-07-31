---
phase: 11-account-org-case-journey-gates
plan: 05
subsystem: verification
tags: [journey, account, auth, rubrics, references]
requires: ["11-02", "11-03"]
provides:
  - "Four new JRNY-02 journey steps: signup, two verification-route states, session persistence"
  - "Five approved references at zero pixel tolerance"
  - "The account-journey coverage and deferral record in journey/JOURNEY.md"
affects:
  - frontend/journey/steps/account.json
  - frontend/journey/rubrics/
  - frontend/journey/references/
  - frontend/journey/JOURNEY.md
tech-stack:
  added: []
  patterns:
    - "allowConsoleErrors set per-step, never globally, and only where the console error is correct product behaviour"
key-files:
  created:
    - frontend/journey/rubrics/auth-signup.json
    - frontend/journey/rubrics/auth-verify-nocode.json
    - frontend/journey/rubrics/auth-verify-badcode.json
    - frontend/journey/rubrics/auth-session-persisted.json
    - frontend/journey/rubrics/auth-signed-out.json
    - frontend/journey/references/auth-signup.png
    - frontend/journey/references/auth-signup.json
    - frontend/journey/references/auth-verify-nocode.png
    - frontend/journey/references/auth-verify-nocode.json
    - frontend/journey/references/auth-verify-badcode.png
    - frontend/journey/references/auth-verify-badcode.json
    - frontend/journey/references/auth-session-persisted.png
    - frontend/journey/references/auth-session-persisted.json
  modified:
    - frontend/journey/steps/account.json
    - frontend/journey/JOURNEY.md
key-decisions:
  - "auth-signed-out was withheld from the registry rather than passed by deleting its two failing assertions; whether logout should land on /auth is a product decision the plan does not contain"
  - "The signed-in-email assertion was rescoped from the dashboard-page element to body, the scope 11-RESEARCH actually measured; kind and expected string unchanged"
requirements-completed: []
duration: 31 min
completed: 2026-07-31
---

# Phase 11 Plan 05: Account Journey Gates Summary

Four of the five planned JRNY-02 steps are registered and green at zero pixel tolerance. The fifth,
logout, is **BLOCKED** on a product decision and was deliberately not registered.

- Tasks: 5 (task 3 partially blocked) · One commit: `5a52574b5`
- Registry: **5** steps green (`auth-signin` from 11-03 plus four new), not the planned 6.

## Status: PARTIAL — one step BLOCKED

```text
BLOCKED
Requirement: JRNY-02 (the "logout" clause of Phase 11 success criterion 1)
Task: 11-05 Task 2/3: auth-signed-out
What was attempted: Registered the planned `auth-signed-out` step — seed a real Alpha session, load
`/`, wait for and click `[data-testid="sign-out-desktop"]`, then wait for the URL to contain `/auth`
— and drive its rubric, which asserts `[data-testid="auth-page"]` visible and `auth-title` equal to
`Sign In`.
Real command output:
JOURNEY STEP FAILED auth-signed-out: STEP ERROR ACTION TIMEOUT: url never contained /auth
GATE-SKIPS total=1 skipped=0
JOURNEY FAIL steps=1 failed=1

Direct measurement of what the application actually does, same seeded session, same control:
URL before click: http://127.0.0.1:4173/
URL after click:  http://127.0.0.1:4173/
BODY AFTER (first 400): "Inheritance\n\nPhilippine Succession Law\n\nSign In\n\nPHILIPPINE SUCCESSION LAW\n\nEstate Distribution\nMade Simple\n\nCompute inheritance shares instantly. ..."
auth-page count: 0
dashboard-page count: 0
sign-out-desktop count: 0
console errors: []
sb- localStorage keys after signout: []
```

The sign-out itself works, and works safely: the supabase session key is **removed** from
`localStorage` (so a reload cannot restore it) and all signed-in chrome disappears, with zero console
errors. What does not happen is the navigation to `/auth` the plan assumed. The application stays on
`/` and renders the anonymous marketing landing page — the full-page capture was inspected and shows
the hero, the quick-calc widget and a "Sign In" sidebar link.

Three of the rubric's five assertions (`no-dashboard`, `no-sign-out`, `clean-console`) hold on that
page; two (`back-on-auth`, `title`) do not. Deleting those two would have made the step pass while
quietly redefining what "logout is verified" means — the exact silent weakening constraint 5 of this
plan and the project's governing principle both prohibit. `11-RESEARCH.md` records **no** measurement
of the signed-out state, so there is nothing to correct the rubric *against*.

Whether logout should redirect to the sign-in card or remain on the public landing page is a product
decision plan 11-05 does not contain. It is not a point of Philippine law, so nothing was added to
`.planning/LAWYER-AGENDA.md`.

**What was done instead of guessing:** the step record was left out of `journey/steps/account.json`
(so the registry cannot claim coverage it does not have), the rubric file is committed but orphaned
and **no reference was approved for it** (G16 flags an orphan reference, not an orphan rubric), and
the whole measurement plus the two possible resolutions are written into `journey/JOURNEY.md` under
`### BLOCKED, not registered: auth-signed-out`.

## Verification (real output)

```
$ node journey/run.mjs --list
auth-signin
auth-signup
auth-verify-nocode
auth-verify-badcode
auth-session-persisted

$ node -e "…validateRubric over journey/rubrics…"
OK auth-session-persisted.json
OK auth-signed-out.json
OK auth-signin.json
OK auth-signup.json
OK auth-verify-badcode.json
OK auth-verify-nocode.json
OK fixture-basic.json

$ node -e "…allowConsoleErrors…"
ALLOW auth-verify-badcode
```

Rubric-before-reference, per constraint 1 — every step reached `passed=true failed=0` with
`REFERENCE MISSING` as its only marker **before** anything was approved:

```
auth-signup             passed=true failed=0    FAILURE.txt line1: REFERENCE MISSING
auth-verify-nocode      passed=true failed=0    FAILURE.txt line1: REFERENCE MISSING
auth-verify-badcode     passed=true failed=0    FAILURE.txt line1: REFERENCE MISSING
auth-session-persisted  passed=true failed=0    FAILURE.txt line1: REFERENCE MISSING
```

Each `actual.png` was opened and looked at before approval: the Create Account card with all five
fields; the GoTrue refusal reading `invalid request: both auth code and code verifier should be
non-empty` above "Your confirmation link may have expired."; and the Alpha dashboard showing
`Seeded Case Alpha  draft` with `alpha@example.test` in the sidebar footer.

```
$ for s in …; do node journey/approve.mjs "$s"; done
APPROVED auth-signup maxDiffPixels=0
APPROVED auth-verify-nocode maxDiffPixels=0
APPROVED auth-verify-badcode maxDiffPixels=0
APPROVED auth-session-persisted maxDiffPixels=0

$ node -e "…sidecar tolerances…"
auth-session-persisted.json 0
auth-signin.json 0
auth-signup.json 0
auth-verify-badcode.json 0
auth-verify-nocode.json 0

$ node journey/run.mjs --all
GATE-SKIPS total=5 skipped=0
JOURNEY PASS steps=5 failed=0
ALL_EXIT=0
$ node journey/run.mjs --all
GATE-SKIPS total=5 skipped=0
JOURNEY PASS steps=5 failed=0
ALL_EXIT_SECOND=0
```

Two consecutive `--all` runs pass at `maxDiffPixels` `0`, so the captures are deterministic on this
machine.

```
$ grep -c "enable_confirmations" journey/JOURNEY.md   -> 1
$ grep -c "code_verifier" journey/JOURNEY.md          -> 1
$ for s in <all six ids>; do grep -q "$s" journey/JOURNEY.md || echo "MISSING $s"; done
(prints nothing)

$ node apps/inheritance/scripts/check-commit-discipline.mjs
COMMIT DISCIPLINE OK — 152 commit(s) audited, 124 touching apps/inheritance/, 0 mixed
$ git status --porcelain apps/inheritance/frontend/.journey-runs
(empty)
```

## Deviations from Plan

**[Rule 3 — blocker] `auth-signed-out` withheld.** Documented in full above.

**[Rule 1 — bug] The `signed-in-email` assertion was scoped to the wrong element** — Found during:
Task 2. The rubric as planned asserts `text_contains` `alpha@example.test` inside
`[data-testid="dashboard-page"]`, and it failed:

```
FAIL signed-in-email text_contains expected="alpha@example.test" actual="Dashboard\nNew Case\nRECENT CASES\nView all →\nSeeded Case Alpha\ndraft"
```

`11-RESEARCH.md` §4.5 recorded that string in the **body** text of the page
(`… alpha@example.test Sign Out Dashboard New Case RECENT CASES …`), and the screenshot confirms why:
the email renders in the `AppLayout` sidebar footer, which is outside the dashboard container. This
is precisely the "expectation transcribed wrongly from that table" case task 2 sanctions correcting.
Fix: the selector became `body`; the `kind` (`text_contains`) and the expected string are unchanged,
and no assertion was removed — the assertion still proves the signed-in email is on the page.
Verification: `auth-session-persisted` reaches `passed=true failed=0`. Commit: `5a52574b5`.

**Total deviations:** 1 blocker (Rule 3), 1 auto-fixed (Rule 1). **Impact:** the account journey
covers five of the six planned states; logout is uncovered and loudly documented.

## Issues Encountered

The planned assertion-count check (`6,5,7,8,4,4` in alphabetical order) is not applicable as written,
since `fixture-basic.json` from Phase 10 also lives in `journey/rubrics/` and the withheld step
changes the set. Every rubric passes `validateRubric` and no assertion was deleted from any of them,
which is the property that check existed to protect.

No point of Philippine law arose; nothing was added to `.planning/LAWYER-AGENDA.md`.

## Self-Check: PASSED for the four registered steps, BLOCKED for the fifth

`node journey/run.mjs --all` exits 0 twice with `JOURNEY PASS steps=5 failed=0`. Phase 11 success
criterion 1 is **not** met: signup, email verification, login and session persistence each have a
passing gate; **logout does not**.

Ready for 11-06.
