---
phase: 11-account-org-case-journey-gates
plan: 06
subsystem: verification
tags: [journey, organization, invitations, resets]
requires: ["11-02", "11-03"]
provides:
  - "Two JRNY-03 journey steps: invite acceptance and invite refusal"
  - "Two named database resets, orphan-no-org and orphan-invitation-pending"
  - "The measured record of two product defects found by driving onboarding"
affects:
  - frontend/journey/steps/org.json
  - frontend/journey/resets.mjs
  - frontend/journey/rubrics/
  - frontend/journey/references/
  - frontend/journey/JOURNEY.md
tech-stack:
  added: []
  patterns:
    - "A mutating step declares a named reset in its record; the runner throws on a name RESETS does not export"
key-files:
  created:
    - frontend/journey/steps/org.json
    - frontend/journey/rubrics/org-onboarding-firm.json
    - frontend/journey/rubrics/org-onboarding-profile.json
    - frontend/journey/rubrics/org-onboarding-done.json
    - frontend/journey/rubrics/org-invite-accepted.json
    - frontend/journey/rubrics/org-invite-rejected.json
    - frontend/journey/references/org-invite-accepted.png
    - frontend/journey/references/org-invite-accepted.json
    - frontend/journey/references/org-invite-rejected.png
    - frontend/journey/references/org-invite-rejected.json
  modified:
    - frontend/journey/resets.mjs
    - frontend/journey/JOURNEY.md
key-decisions:
  - "The three onboarding steps were withheld rather than passed by setting allowConsoleErrors, because the console errors are two real product defects and that flag exists only for correct behaviour"
  - "orphan-no-org deletes organizations by exclusion, since the onboarding journey creates one whose id the runner cannot know"
requirements-completed: []
duration: 27 min
completed: 2026-07-31
---

# Phase 11 Plan 06: Organization Journey Gates Summary

Invite acceptance and invite refusal are registered and green at zero pixel tolerance, each with a
named database reset. The three onboarding steps are **BLOCKED** — driving them found two real
product defects, one of which silently discards data.

- Tasks: 5 (task 3 partially blocked) · One commit: `b7201ce7d`
- Registry: **7** steps green (5 account + 2 org), not the planned 11.

## Status: PARTIAL — three steps BLOCKED

```text
BLOCKED
Requirement: JRNY-03 (the "org creation" clause of Phase 11 success criterion 2)
Task: 11-06 Task 3: org-onboarding-firm, org-onboarding-profile, org-onboarding-done
What was attempted: Drove all three onboarding screens as the seeded org-less Orphan user through
real form submissions, and read each step's rubric result.
Real command output:
org-onboarding-firm passed=false failed=1
   FAIL clean-console 0 actual=1
   FAILURE.txt: RUBRIC FAILURE REFERENCE MISSING
org-onboarding-profile passed=false failed=1
   FAIL clean-console 0 actual=1
   FAILURE.txt: RUBRIC FAILURE REFERENCE MISSING
org-onboarding-done passed=false failed=1
   FAIL clean-console 0 actual=2
   FAILURE.txt: RUBRIC FAILURE REFERENCE MISSING

The two console errors, captured with response interception:
HTTP>=400: [
 "406 http://127.0.0.1:55321/rest/v1/organization_members?select=org_id&user_id=eq.c0000000-0000-4000-8000-000000000002&limit=1",
 "400 http://127.0.0.1:55321/rest/v1/user_profiles"
]
CONSOLE ERRORS: [
 "Failed to load resource: the server responded with a status of 406 (Not Acceptable)",
 "Failed to load resource: the server responded with a status of 400 (Bad Request)"
]

Defect 2 reproduced directly against the same table:
UPSERT ERROR: {
 "code": "23502",
 "message": "null value in column \"email\" of relation \"user_profiles\" violates not-null constraint"
}

And its consequence, after the user completed the profile step and saw "You're all set!":
select id, counsel_name from user_profiles where id='c0000000-0000-4000-8000-000000000002';
c0000000-0000-4000-8000-000000000002|
```

**Defect 1 — 406 on every `/onboarding` load.** `getUserOrganization`
(`src/lib/organizations.ts:32`) calls `.single()` on a query that legitimately matches zero rows for
a user with no organization; PostgREST answers 406. The caller handles it, so the screen is correct,
but the browser logs an error on every load. `.maybeSingle()` is the query that expresses "zero or
one row".

**Defect 2 — the attorney profile is silently discarded.** `saveFirmProfile`
(`src/lib/firm-profile.ts:97`) builds its upsert payload from supplied fields only and never includes
`email`, but `user_profiles.email` is `NOT NULL` with no default. Postgres evaluates the proposed
INSERT before the `ON CONFLICT` clause, so the upsert fails **for every user**.
`src/routes/onboarding.tsx:72` catches it with an empty `catch` commented "Non-fatal — profile can be
updated later in Settings" and advances to the done screen anyway. The user sees success; nothing was
saved. That is silent data loss on a screen reporting success — the failure mode this project ranks
as strictly worse than a loud one.

Neither could be addressed here: constraint 4 forbids editing application source and constraint 5
forbids deleting or loosening the `no_console_error` assertion. Setting `allowConsoleErrors` was
rejected on principle — that flag exists for a console error that is *correct* product behaviour, and
using it here would hide exactly what the gate had just found. The three step records were therefore
withheld from `journey/steps/org.json`, their rubrics are committed but orphaned, and no reference
was approved for any of them, so the registry claims no coverage it does not have. All three rubrics
are ready to register unchanged once the defects are fixed.

## What passed

```
$ node -e "…RESETS…"
RESETS noop,orphan-no-org,orphan-invitation-pending
$ node -e "…orphan-invitation-pending then read status…"
INVITE_STATUS pending
$ grep -Eo '0000-4000-8000-[0-9a-f]{12}' journey/resets.mjs | wc -l
0
$ docker exec … "select count(*) from organizations;"
2

$ node -e "…org.json…"
ORG 5 org-onboarding-firm:orphan-no-org org-onboarding-profile:orphan-no-org org-onboarding-done:orphan-no-org org-invite-accepted:orphan-invitation-pending org-invite-rejected:orphan-invitation-pending
$ node -e "…validateRubric…"
OK org-onboarding-firm / org-onboarding-profile / org-onboarding-done / org-invite-accepted / org-invite-rejected

org-invite-accepted passed=true failed=0   FAILURE.txt: REFERENCE MISSING
org-invite-rejected passed=true failed=0   FAILURE.txt: REFERENCE MISSING

$ node journey/approve.mjs org-invite-accepted / org-invite-rejected
APPROVED org-invite-accepted maxDiffPixels=0
APPROVED org-invite-rejected maxDiffPixels=0

$ node journey/run.mjs --all
GATE-SKIPS total=7 skipped=0
JOURNEY PASS steps=7 failed=0
ALL_EXIT_FIRST=0
$ node journey/run.mjs --all
JOURNEY PASS steps=7 failed=0
ALL_EXIT_SECOND=0

$ node journey/rls-isolation.mjs
GATE-SKIPS total=14 skipped=0
ISOLATION ok cases=14 surfaces=4
```

**The D-1 fix is proven in the running application**, which is the single most valuable line this
plan produced and which no unit test in this repository covers:

```
$ docker exec supabase_db_inheritance psql -U postgres -d postgres -At \
    -c "select name from organizations where id not in ('a0…001','b0…001');"
Journey Test Firm
```

Before plan 11-02's correction that row would have been named after the user's uuid, with the firm
name stored as the slug. The organization was created by a real form submission through the real
onboarding screen — the screens that host that form are the ones now blocked, but the mutation they
perform was driven end to end and asserted.

Both invite captures were inspected before approval. `org-invite-accepted` shows `/settings/team`
with `Test Firm Alpha`, `Seats: 2 / 5` and `orphan@example.test` as `Attorney` — the acceptance
really happened. `org-invite-rejected` shows `Invitation expired, revoked, or not found` and never
reaches the team page, which is the D-2 fix held in place.

## Deviations from Plan

**[Rule 3 — blocker] Three onboarding steps withheld.** Documented in full above.

**[expected consequence] Step counts differ from the plan's numbers.** The plan expects
`--list` to print eleven ids and `--all` to report `steps=11`. The real numbers are **7** and
`steps=7`: plan 11-05 registered 5 account steps rather than 6 (`auth-signed-out` blocked) and this
plan registers 2 org steps rather than 5. Every registered step is green; the shortfall is visible as
reduced coverage rather than as a false pass, which is what LOOP-04 asks for.

**Total deviations:** 1 blocker (Rule 3) plus its arithmetic consequence. **Impact:** organization
creation is unverified; invite acceptance and refusal are verified.

## Issues Encountered

A cosmetic observation not asserted by any rubric and not acted on: on `/settings/team` the Alpha
admin row displays a raw uuid where a name should be, because RLS on `user_profiles` lets a signed-in
user read only their own profile row — so the team list can never resolve another member's name. The
Orphan row resolves because it is the caller's own. This is a pre-existing product limitation, not a
regression from plan 11-02, and no rubric in this plan asserts member names.

No point of Philippine law arose; nothing was added to `.planning/LAWYER-AGENDA.md`.

## Self-Check: PASSED for the two registered steps, BLOCKED for the three onboarding steps

`node journey/run.mjs --all` exits 0 twice with `JOURNEY PASS steps=7 failed=0`, and
`node journey/rls-isolation.mjs` still exits 0 afterwards, proving the org mutations left both seeded
tenants intact. Phase 11 success criterion 2 is **half met**: invite acceptance has a passing gate;
org creation does not.

Ready for 11-07.
