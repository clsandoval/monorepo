---
phase: 20
plan: 20-06
created: 2026-08-01
---

# Phase 20 — Gate observations for `check-penalty-refusal.ts` (to be registered as G36)

> A gate nobody has seen fail is not known to be a gate. Every run below is pasted verbatim,
> exit code included. Nothing here is a summary of a run.

Command, for every section: `cd frontend && npx tsx scripts/check-penalty-refusal.ts`

---

## 0. Baseline — the gate is RED on the unmodified tree, and the reason is a pre-existing defect

**This section does not say what plan 20-06 predicted it would say.** The plan expected a green
baseline. The real baseline is **exit 1**, on one violation, and that violation is NOT caused by
anything Phase 20 wrote:

```
WALL CLOCK IN ENGINE validation.ts contains new Date()
```

`frontend/src/lib/estate-tax-engine/validation.ts:11` holds
`const TODAY = new Date().toISOString().slice(0, 10);`, read once at line 37 for the
`ERR_DATE_FUTURE` check. It predates this phase:

```
$ git grep -c "new Date()" dde8df4fd -- apps/inheritance/frontend/src/lib/estate-tax-engine/
dde8df4fd:apps/inheritance/frontend/src/lib/estate-tax-engine/pipeline.ts:1
dde8df4fd:apps/inheritance/frontend/src/lib/estate-tax-engine/validation.ts:1
```

`20-RESEARCH.md` §2 measured **one** wall-clock read in the engine. There were **two**. Plan 20-03
removed the one the research found (`pipeline.ts`, the filing date) and reported the second rather
than silently expanding its own scope. See the `feat(20-03)` commit body.

**Why it is not fixed here.** `validation.ts` is not in 20-03's or 20-06's `files_modified`, and
every available fix is one of two prohibited moves: delete the `ERR_DATE_FUTURE` check (weakening a
real assertion), or invent a reference date for "future" (a decision neither plan contains). Under
`CLAUDE.md` invariant 3 the correct output is a BLOCKED report with the pasted evidence, which is
this section.

**Consequence, stated plainly: `check-penalty-refusal.ts` cannot be registered green today, so
plan 20-07 does NOT register it.** The check is left at full strength. Scoping check 2 to exclude
`validation.ts` would be writing an exception list into a gate whose own header promises it has
none, and the entry would be invisible in every green run that followed.

The five other checks are green, and the four injections below prove each of them fires.

Working tree at the time of this run — nothing modified, so the run is against committed source:

```
$ git status --porcelain -- apps/inheritance/frontend/src apps/inheritance/.planning/lawyer-decisions.json
(no output)
```

```
## Check 1 — SILENT ZERO SURVIVES
  ok — "surcharges: 0" absent from pipeline.ts
  ok — "interest: 0" absent from pipeline.ts
  ok — "compromise_penalty: 0" absent from pipeline.ts
  ok — "total_amount_due: taxComputation.estateTaxDue" absent from pipeline.ts
## Check 2 — WALL CLOCK IN ENGINE
  WALL CLOCK IN ENGINE  validation.ts contains new Date()
  19 engine module(s) walked
## Check 3 — RATE INVENTED
  literal set found: {0, 1, 2, 6, 10, 12, 86400000}
  whitelist:         {0, 1, 2, 6, 10, 12, 86400000}
## Check 4 — TOTAL CLAIMS COMPLETENESS
  case A deadline 2021-06-15, daysLate 1461
  case B deadline 2015-09-30, daysLate 3546
  case C lateness undetermined
## Check 5 — LINE MISSING ITS SECTION
  surcharge            authority "NIRC Sec. 248"
  interest             authority "NIRC Sec. 249"
  compromise_penalty   authority "specs/estate-tax-engine-spec.md §2 Out of Scope"
## Check 6 — DECLINED LINE UNRECORDED
  registry ids matched by the declined lines: LAWYER-10, LAWYER-11, LAWYER-12

=========================================================
PENALTY REFUSAL CHECK — 35 item(s) examined
  SILENT ZERO SURVIVES         ok
  WALL CLOCK IN ENGINE         1 violation(s)
  TOTAL CLAIMS COMPLETENESS    ok
  LINE MISSING ITS SECTION     ok
  RATE INVENTED                ok
  DECLINED LINE UNRECORDED     ok
=========================================================
WALL CLOCK IN ENGINE validation.ts contains new Date()
PENALTY REFUSAL CHECK FAILED — 1 violation(s)
GATE-SKIPS total=35 skipped=0
BASE_EXIT=1
```

---

## 1. Injection 1 — the total is assigned from the base tax again

Edit: in `pipeline.ts`, `total_amount_due: penalties.totalAmountDue` reverted to
`total_amount_due: taxComputation.estateTaxDue`.
Expected markers: `SILENT ZERO SURVIVES` and `TOTAL CLAIMS COMPLETENESS`. **Both fired.**

```
## Check 1 — SILENT ZERO SURVIVES
  ok — "surcharges: 0" absent from pipeline.ts
  ok — "interest: 0" absent from pipeline.ts
  ok — "compromise_penalty: 0" absent from pipeline.ts
  SILENT ZERO SURVIVES  "total_amount_due: taxComputation.estateTaxDue" x1
## Check 2 — WALL CLOCK IN ENGINE
  WALL CLOCK IN ENGINE  validation.ts contains new Date()
  19 engine module(s) walked
## Check 3 — RATE INVENTED
  literal set found: {0, 1, 2, 6, 10, 12, 86400000}
  whitelist:         {0, 1, 2, 6, 10, 12, 86400000}
## Check 4 — TOTAL CLAIMS COMPLETENESS
  TOTAL CLAIMS COMPLETENESS  case A total_amount_due=0 with a declined line
  TOTAL CLAIMS COMPLETENESS  case B total_amount_due=0 with a declined line
  TOTAL CLAIMS COMPLETENESS  case C total_amount_due=0 with a declined line
  case A deadline 2021-06-15, daysLate 1461
  case B deadline 2015-09-30, daysLate 3546
  case C lateness undetermined
## Check 5 — LINE MISSING ITS SECTION
  surcharge            authority "NIRC Sec. 248"
  interest             authority "NIRC Sec. 249"
  compromise_penalty   authority "specs/estate-tax-engine-spec.md §2 Out of Scope"
## Check 6 — DECLINED LINE UNRECORDED
  registry ids matched by the declined lines: LAWYER-10, LAWYER-11, LAWYER-12

=========================================================
PENALTY REFUSAL CHECK — 35 item(s) examined
  SILENT ZERO SURVIVES         1 violation(s)
  WALL CLOCK IN ENGINE         1 violation(s)
  TOTAL CLAIMS COMPLETENESS    3 violation(s)
  LINE MISSING ITS SECTION     ok
  RATE INVENTED                ok
  DECLINED LINE UNRECORDED     ok
=========================================================
SILENT ZERO SURVIVES total_amount_due: taxComputation.estateTaxDue occurs 1 time(s) in pipeline.ts
WALL CLOCK IN ENGINE validation.ts contains new Date()
TOTAL CLAIMS COMPLETENESS case A publishes total_amount_due 0 while a line is declined
TOTAL CLAIMS COMPLETENESS case B publishes total_amount_due 0 while a line is declined
TOTAL CLAIMS COMPLETENESS case C publishes total_amount_due 0 while a line is declined
PENALTY REFUSAL CHECK FAILED — 5 violation(s)
GATE-SKIPS total=35 skipped=0
EXIT=1
```

Reverted with `git checkout -- apps/inheritance/frontend/src/lib/estate-tax-engine/pipeline.ts`;
the gate returned to its baseline (exit 1, the single pre-existing `WALL CLOCK IN ENGINE`
violation, no others).

---

## 2. Injection 2 — the surcharge line loses its section

Edit: in `penalties.ts`, `SURCHARGE_SECTION` set to the empty string.
Expected marker: `LINE MISSING ITS SECTION`. **Fired, on all three cases.**

```
## Check 1 — SILENT ZERO SURVIVES
  ok — "surcharges: 0" absent from pipeline.ts
  ok — "interest: 0" absent from pipeline.ts
  ok — "compromise_penalty: 0" absent from pipeline.ts
  ok — "total_amount_due: taxComputation.estateTaxDue" absent from pipeline.ts
## Check 2 — WALL CLOCK IN ENGINE
  WALL CLOCK IN ENGINE  validation.ts contains new Date()
  19 engine module(s) walked
## Check 3 — RATE INVENTED
  literal set found: {0, 1, 2, 6, 10, 12, 86400000}
  whitelist:         {0, 1, 2, 6, 10, 12, 86400000}
## Check 4 — TOTAL CLAIMS COMPLETENESS
  case A deadline 2021-06-15, daysLate 1461
  case B deadline 2015-09-30, daysLate 3546
  case C lateness undetermined
## Check 5 — LINE MISSING ITS SECTION
  LINE MISSING ITS SECTION  case A surcharge authority is empty
  LINE MISSING ITS SECTION  case B surcharge authority is empty
  LINE MISSING ITS SECTION  case C surcharge authority is empty
  surcharge            authority ""
  interest             authority "NIRC Sec. 249"
  compromise_penalty   authority "specs/estate-tax-engine-spec.md §2 Out of Scope"
## Check 6 — DECLINED LINE UNRECORDED
  registry ids matched by the declined lines: LAWYER-10, LAWYER-11, LAWYER-12

=========================================================
PENALTY REFUSAL CHECK — 35 item(s) examined
  SILENT ZERO SURVIVES         ok
  WALL CLOCK IN ENGINE         1 violation(s)
  TOTAL CLAIMS COMPLETENESS    ok
  LINE MISSING ITS SECTION     3 violation(s)
  RATE INVENTED                ok
  DECLINED LINE UNRECORDED     ok
=========================================================
WALL CLOCK IN ENGINE validation.ts contains new Date()
LINE MISSING ITS SECTION case A line surcharge has an empty authority
LINE MISSING ITS SECTION case B line surcharge has an empty authority
LINE MISSING ITS SECTION case C line surcharge has an empty authority
PENALTY REFUSAL CHECK FAILED — 4 violation(s)
GATE-SKIPS total=35 skipped=0
EXIT=1
```

Reverted with `git checkout -- apps/inheritance/frontend/src/lib/estate-tax-engine/penalties.ts`;
the gate returned to baseline.

---

## 3. Injection 3 — a rate nobody authorised (THE LOAD-BEARING ONE)

Edit: in `penalties.ts`, an unused exported constant
`export const INJECTED_SURCHARGE_RATE = 0.25;` added after `MILLISECONDS_PER_DAY`.
Expected marker: `RATE INVENTED`, naming the literal. **Fired, and named `0.25` explicitly.**

This is the one that matters. The other five markers catch a regression; this one catches the
decision this entire phase was arranged to prevent — an agent supplying a rate because a consumer
needed a number — at the moment it is made. Note the report line
`literal set found: {0, 0.25, 1, 2, 6, 10, 12, 86400000}`: a reader of the red run can see exactly
what appeared that should not have.

```
## Check 1 — SILENT ZERO SURVIVES
  ok — "surcharges: 0" absent from pipeline.ts
  ok — "interest: 0" absent from pipeline.ts
  ok — "compromise_penalty: 0" absent from pipeline.ts
  ok — "total_amount_due: taxComputation.estateTaxDue" absent from pipeline.ts
## Check 2 — WALL CLOCK IN ENGINE
  WALL CLOCK IN ENGINE  validation.ts contains new Date()
  19 engine module(s) walked
## Check 3 — RATE INVENTED
  RATE INVENTED  numeric literal 0.25 is outside the whitelist
  literal set found: {0, 0.25, 1, 2, 6, 10, 12, 86400000}
  whitelist:         {0, 1, 2, 6, 10, 12, 86400000}
## Check 4 — TOTAL CLAIMS COMPLETENESS
  case A deadline 2021-06-15, daysLate 1461
  case B deadline 2015-09-30, daysLate 3546
  case C lateness undetermined
## Check 5 — LINE MISSING ITS SECTION
  surcharge            authority "NIRC Sec. 248"
  interest             authority "NIRC Sec. 249"
  compromise_penalty   authority "specs/estate-tax-engine-spec.md §2 Out of Scope"
## Check 6 — DECLINED LINE UNRECORDED
  registry ids matched by the declined lines: LAWYER-10, LAWYER-11, LAWYER-12

=========================================================
PENALTY REFUSAL CHECK — 36 item(s) examined
  SILENT ZERO SURVIVES         ok
  WALL CLOCK IN ENGINE         1 violation(s)
  TOTAL CLAIMS COMPLETENESS    ok
  LINE MISSING ITS SECTION     ok
  RATE INVENTED                1 violation(s)
  DECLINED LINE UNRECORDED     ok
=========================================================
WALL CLOCK IN ENGINE validation.ts contains new Date()
RATE INVENTED penalties.ts holds the numeric literal 0.25
PENALTY REFUSAL CHECK FAILED — 2 violation(s)
GATE-SKIPS total=36 skipped=0
EXIT=1
```

Reverted with `git checkout -- apps/inheritance/frontend/src/lib/estate-tax-engine/penalties.ts`;
the gate returned to baseline.

---

## 4. Injection 4 — a declined line points at a question nobody recorded

Edit: in `penalties.ts`, `SURCHARGE_LAWYER_DECISION` changed to `'LAWYER-99'`.
Expected marker: `DECLINED LINE UNRECORDED`. **Fired, on all three cases.**

```
## Check 1 — SILENT ZERO SURVIVES
  ok — "surcharges: 0" absent from pipeline.ts
  ok — "interest: 0" absent from pipeline.ts
  ok — "compromise_penalty: 0" absent from pipeline.ts
  ok — "total_amount_due: taxComputation.estateTaxDue" absent from pipeline.ts
## Check 2 — WALL CLOCK IN ENGINE
  WALL CLOCK IN ENGINE  validation.ts contains new Date()
  19 engine module(s) walked
## Check 3 — RATE INVENTED
  literal set found: {0, 1, 2, 6, 10, 12, 86400000}
  whitelist:         {0, 1, 2, 6, 10, 12, 86400000}
## Check 4 — TOTAL CLAIMS COMPLETENESS
  case A deadline 2021-06-15, daysLate 1461
  case B deadline 2015-09-30, daysLate 3546
  case C lateness undetermined
## Check 5 — LINE MISSING ITS SECTION
  surcharge            authority "NIRC Sec. 248"
  interest             authority "NIRC Sec. 249"
  compromise_penalty   authority "specs/estate-tax-engine-spec.md §2 Out of Scope"
## Check 6 — DECLINED LINE UNRECORDED
  DECLINED LINE UNRECORDED  LAWYER-99 is not in lawyer-decisions.json
  DECLINED LINE UNRECORDED  LAWYER-99 is not in lawyer-decisions.json
  DECLINED LINE UNRECORDED  LAWYER-99 is not in lawyer-decisions.json
  registry ids matched by the declined lines: LAWYER-11, LAWYER-12

=========================================================
PENALTY REFUSAL CHECK — 35 item(s) examined
  SILENT ZERO SURVIVES         ok
  WALL CLOCK IN ENGINE         1 violation(s)
  TOTAL CLAIMS COMPLETENESS    ok
  LINE MISSING ITS SECTION     ok
  RATE INVENTED                ok
  DECLINED LINE UNRECORDED     3 violation(s)
=========================================================
WALL CLOCK IN ENGINE validation.ts contains new Date()
DECLINED LINE UNRECORDED case A line surcharge points at LAWYER-99, which is not in the registry
DECLINED LINE UNRECORDED case B line surcharge points at LAWYER-99, which is not in the registry
DECLINED LINE UNRECORDED case C line surcharge points at LAWYER-99, which is not in the registry
PENALTY REFUSAL CHECK FAILED — 4 violation(s)
GATE-SKIPS total=35 skipped=0
EXIT=1
```

Reverted with `git checkout -- apps/inheritance/frontend/src/lib/estate-tax-engine/penalties.ts`.

---

## 5. The environment path — exit 2, not a pass

Pointing the runner at a directory holding no engine must be an ENVIRONMENT verdict, never a green
run on an empty walk:

```
$ npx tsx scripts/check-penalty-refusal.ts --src /tmp
PENALTY CHECK CANNOT RUN: could not read pipeline.ts at /tmp/lib/estate-tax-engine/pipeline.ts: ENOENT: no such file or directory, open '/tmp/lib/estate-tax-engine/pipeline.ts'
GATE-SKIPS total=0 skipped=0
BADSRC_EXIT=2
```

---

## 6. Every injection was reverted

```
$ npx tsx scripts/check-penalty-refusal.ts >/dev/null 2>&1; echo $?
1        # the baseline WALL CLOCK IN ENGINE violation, and nothing else

$ git status --porcelain -- apps/inheritance/frontend/src
(no output)
```

---

## Summary

| # | Injection | Marker expected | Fired? |
|---|---|---|---|
| 1 | `total_amount_due` from the base tax | `SILENT ZERO SURVIVES` + `TOTAL CLAIMS COMPLETENESS` | yes, both |
| 2 | `SURCHARGE_SECTION` blanked | `LINE MISSING ITS SECTION` | yes, x3 |
| 3 | numeric literal `0.25` added | `RATE INVENTED` | yes, named the literal |
| 4 | `lawyerDecision` set to `LAWYER-99` | `DECLINED LINE UNRECORDED` | yes, x3 |

Four for four. The fifth and sixth markers — `WALL CLOCK IN ENGINE` and `CORPUS EMPTY` — were not
injected: `WALL CLOCK IN ENGINE` is **already firing** on the real tree (section 0), which is a
stronger demonstration than an injection, and the empty-corpus path is demonstrated by section 5's
exit 2 on `--src /tmp`.

**Registration is BLOCKED on section 0.** The gate is committed and proven; `20-07` leaves
`gates.manifest.json`, `gates.manifest.lock` and `GATES.md` untouched and reports the reason.
