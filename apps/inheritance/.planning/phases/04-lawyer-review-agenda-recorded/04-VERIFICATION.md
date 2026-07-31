---
status: passed
phase: 04-lawyer-review-agenda-recorded
verified: 2026-07-31
requirements: [LAWYER-01, LAWYER-02, LAWYER-03, LAWYER-04, LAWYER-05, LAWYER-06, LAWYER-07, LAWYER-08, LAWYER-09, LAWYER-10]
plans: 5/5
---

# Verification — Phase 4: Lawyer Review Agenda Recorded

Every claim below was re-run independently of the executing plans' own reported output.

## Phase goal

> The eight interpretive choices already made by the engine are written down as recorded decisions
> the lawyer can confirm or overturn — sent out now, since the lawyer is sitting the bar exam.

**Achieved.** Eight entries exist, all `awaiting-answer`, all machine-readable, all anchored to the
rule they govern, all gate-enforced.

## Success criteria

### 1. Each of the eight interpretive choices in `LEGAL-CONFORMANCE.md` §3 has a recorded-decision entry stating the engine's current reading and the exact question posed — **MET**

```
grep -c "^## LAWYER-"                 .planning/LAWYER-AGENDA.md → 8
grep -c "^\*\*Engine implements:\*\*" .planning/LAWYER-AGENDA.md → 8
grep -c "### What I need from you"    .planning/LAWYER-AGENDA.md → 8
grep -c "^\*\*Status:\*\*"            .planning/LAWYER-AGENDA.md → 8
```

Fifteen structural markers each occur exactly 8 times, so the set is uniform and machine-parsable.

### 2. Each recorded decision is machine-readable and linked from the code location or rule it governs — **MET**

```
node scripts/check-lawyer-agenda.mjs
  AGENDA OK — 8 decisions, 10 anchors, 8 awaiting-answer     (exit 0)

grep -rc "LAWYER-DECISION" engine/src frontend/src/lib/estate-tax-engine specs/estate-tax-engine-spec.md
  → 10 markers
```

The link is bidirectional: `.planning/lawyer-decisions.json` names ten `{file, pattern}` anchors,
each verified to resolve to exactly one match, and each anchored file carries a
`LAWYER-DECISION: <id>` comment. Gate G10 fails on either half rotting.

### 3. The three highest-stakes blocking questions are phrased for a one-sitting answer — **MET**

`## Answer these three first` precedes every entry and names `LAWYER-04`→`LAW-07`,
`LAWYER-06`→`LAW-06`, `LAWYER-08`→`LAW-12`, each with a one-line ask. All eight entries carry a
three-checkbox Answer block; `LAWYER-04` and `LAWYER-08` carry an extra sub-question line.

```
grep -c "### Answer"  .planning/LAWYER-AGENDA.md → 8
grep -c "\[x\]"       .planning/LAWYER-AGENDA.md → 0
```

### 4. A written workflow turns a lawyer's "this is wrong" into a named test vector, a failing gate, and a fix — **MET**

```
grep -c "^### Step " .planning/LEGAL-CORRECTION-WORKFLOW.md → 5
grep -c "TV-L"                                             → 8
```

Five fixed steps, with the vector named (step 2) and observed failing (step 3) **before** the fix
(step 4). The `TV-L<NN>` convention is fixed in the document. Step 5 names
`node scripts/check-lawyer-agenda.mjs` and `bash scripts/ci-gates.sh` as the closing commands.

## Gate state (re-run independently)

```
bash scripts/ci-gates.sh                 → ALL GATES PASSED (10/10), RUNNER_EXIT=0
  MANIFEST OK — 10 gates, 10 locked
  PLANS OK — 20 plan file(s), 83 task(s) checked
  AGENDA OK — 8 decisions, 10 anchors, 8 awaiting-answer
  SKIPS OK — 10 gates accounted, 1 declared skip, 0 undeclared
  RESULTS OK — 10 gates, 9 requirements
  GATE COVERAGE 10/10
  LEDGER SIZE (debt) : 46          ← unchanged from the Phase 1 baseline

cd engine && cargo test  → 411 + 0 + 1 + 30 + 0 = 442 passed, 0 failed, exit 0
cd frontend && npx tsc -b --force → zero output, exit 0
node scripts/check-commit-discipline.mjs → 74 commits audited, 0 mixed, exit 0
```

Gate count grew 9 → 10; requirement coverage grew 8/94 → 9/94 (LAWYER-09 → G10). The gate set only
grew: `gates.manifest.lock` gained one entry and no locked `command` or `blocking` value changed.

## No test or assertion was weakened

Every source line added across the phase is a comment. The complete source diff over
`7345925..HEAD` is nine `// LAWYER-DECISION:` lines plus one replaced spec hedge:

```
-// Note: Some commentary uses full FMV for conjugal; this engine implements the NIRC text (½ for conjugal)
+// LAWYER-DECISION: LAWYER-07 — recorded interpretive choice, see .planning/LAWYER-AGENDA.md. …
+// Engine implements Reading A, ½ for conjugal, per RR 12-2018 §7.2.3 ("whichever is lower"). Status: awaiting-answer. Reading B, full FMV to the cap, is recorded in the agenda and has not been ruled out.
```

No test file, `frontend/test-baseline.json`, or `gate-skips.lock` was touched. The known-failure
ledger still stands at 46, so nothing was added to it to go green.

## The load-bearing control, re-proved

```
node scripts/check-lawyer-agenda.mjs --registry scripts/fixtures/lawyer-status-invalid.json
  exit=1
  DECISION STATUS INVALID — LAWYER-04 has status 'confirmed' but no answer attached:
  answered_by, answered_on, answer are absent. …
```

That fixture is exactly the one-word edit a future agent would make to unblock itself on `LAW-07`.
It fails the build. All seven verdicts have a committed fixture and were observed exiting 1.

## No law was decided

All eight statuses are `awaiting-answer`, with `answered_by`, `answered_on` and `answer` all `null`.
`grep -c "\[x\]"` over the agenda returns `0`. The one edit that could have decided law — the Q7
spec hedge — was replaced by a pointer that explicitly records Reading B as "not ruled out", never
deleted into a bare assertion.

`LAW-06`, `LAW-07` and `LAW-12` remain blocked pending the lawyer's reply, which is the intended
outcome of this phase, not a shortfall.

## Human verification

None required. Every criterion is evidenced by command output.
