---
phase: 15-extendability-documentation-closeout
plan: 05
subsystem: gates
tags: [gate-registration, gates-md, requirements-closeout, ext-05, ext-06, ext-07, ext-08]
requires: ["15-01", "15-02", "15-03", "15-04"]
provides:
  - "G30 claude invariants (order 25), G31 new rule procedure (26), G32 doc claims (27), G33 planning truth (28) — all blocking"
  - "GATES.md sections 20-23 documenting all 26 markers"
  - "EXT-05..EXT-08 closed against a named gate each"
affects: []
tech-stack:
  added: []
  patterns: []
key-files:
  created: []
  modified:
    - gates.manifest.json
    - gates.manifest.lock
    - GATES.md
    - README.md
    - .planning/REQUIREMENTS.md
    - .planning/ORIENTATION.md
    - RESUME.md
key-decisions:
  - "G14 was NOT taken. It stays reserved and unregistered for Phase 9's still-blocked plan 09-06; taking its id would make that plan unlandable."
  - "G9 stays last (order 32) because scripts/check-gate-results.mjs fails with RESULTS INCOMPLETE on any gate it sees as not-run. G10, G11, G8, G9 shifted to 29-32; `order` is the only field that moved on any pre-existing gate."
  - "All four new gates are blocking:true. A non-blocking documentation gate would let the loop drift straight back into the state Phase 15 exists to end."
requirements-completed: [EXT-05, EXT-06, EXT-07, EXT-08]
duration: 40 min
completed: 2026-08-01
---

# Phase 15 Plan 05: G30-G33 Registered, EXT-05 through EXT-08 Closed

## What Was Built

**Task 1 — all four checks green standalone before any of them could stop the runner:**

```
CLAUDE INVARIANTS OK — 6 invariant(s) checked, all commands gated        EXIT=0
NEW RULE PROCEDURE OK — 5 step(s) checked, worked example resolves       EXIT=0
DOC CLAIMS OK — 11 claim(s) probed, 7 debt entr(ies) live                EXIT=0
PLANNING TRUTH OK — 15 phase(s) reconciled, 4 document(s) checked        EXIT=0
```

Each printed exactly one `GATE-SKIPS` line. `git status --porcelain gates.manifest.json
gates.manifest.lock` printed nothing, so nothing was registered in that task.

**Task 2 — the manifest and the lock:**

```
MANIFEST OK — 32 gates, 32 locked
count 32
25 G30 true node scripts/check-claude-invariants.mjs
26 G31 true node scripts/check-new-rule-procedure.mjs
27 G32 true node scripts/check-doc-claims.mjs
28 G33 true node scripts/check-planning-truth.mjs
29 G10 true node scripts/check-lawyer-agenda.mjs
30 G11 true node scripts/check-observability.mjs
31 G8  true node scripts/check-gate-skips.mjs
32 G9  true node scripts/check-gate-results.mjs
hasG14 false
```

`git diff gates.manifest.lock | grep -c '^-[^-]'` prints **0** — pure additions, four new entries,
no existing entry modified. `git diff gates.manifest.json | grep -c '^-.*"command"'` prints **0**;
the only removed lines in the manifest diff are four `"order":` values, exactly the shift.

**Task 3 — `GATES.md` sections 20 to 23.** `grep -c "^## "` went 19 → **23**. All **26** marker
strings across the four sections were grepped individually and every one is present. The three
behaviours that surprise a reader are called out explicitly: G32's `PROBE FLIPPED` (the code moved
back, not the document — re-measure before editing anything), G33's `red-on-drift` design, and G33's
single printed `IN-FLIGHT PHASE` exemption with plan `15-04`'s Reference D table transcribed.
`shrink-only` appears 7 times.

**Task 4 — README, requirements, and the two gate-count claims.** `README.md` gained a
`## Where to start reading` section pointing at `.planning/ORIENTATION.md` and `.planning/DOC-DEBT.md`,
and its legal-decisions table gained a `.planning/NEW-LEGAL-RULE.md` row beside the existing
`.planning/LEGAL-CORRECTION-WORKFLOW.md` row. `EXT-05` … `EXT-08` are `- [x]` with coverage rows
reading `Complete — proven by G30/G31/G32/G33`. `grep -cE "^- \[x\]"` went 63 → **67**, exactly four,
and `grep -cE "^- \[ \] \*\*LAW-(06|07|12)\*\*"` still prints **3** — no lawyer-blocked requirement
moved. `.planning/ORIENTATION.md` and `RESUME.md` both moved to 32 in this same commit, because G33
compares each of them to the manifest.

**Task 5 — the suite, twice.**

Run 1, before the commit:

```
REQUIREMENT COVERAGE 44/94 gated
COVERAGE OK
ALL GATES PASSED (32/32)
LOOP STATUS GREEN — recorded pass (79/200 records)
RUN1_EXIT=0
```

Run 2, against the fully committed tree — which is what proves G7 commit discipline and G6 plan lint
pass *after* this phase's commits exist:

```
REQUIREMENT COVERAGE 44/94 gated
COVERAGE OK
ALL GATES PASSED (32/32)
LOOP STATUS GREEN — recorded pass (80/200 records)
RUN2_EXIT=0
```

`git status --porcelain` over the seven paths printed nothing before run 2, so run 2 genuinely ran
against the committed tree. Requirement coverage rose 40 → **44**, exactly four.

**Commit** `02df888a9`, exactly the seven paths in `files_modified`.

## Verification

```
bash scripts/ci-gates.sh              → ALL GATES PASSED (32/32), exit 0, observed twice
node scripts/check-gate-manifest.mjs  → MANIFEST OK — 32 gates, 32 locked
grep -c "^## 2[0-3]\. " GATES.md      → 4
grep -cE "^- \[x\] \*\*EXT-0[5-8]\*\*" .planning/REQUIREMENTS.md → 4
grep -cE "^- \[ \] \*\*LAW-(06|07|12)\*\*" .planning/REQUIREMENTS.md → 3
node scripts/gate-coverage.mjs        → COVERAGE OK, REQUIREMENT COVERAGE 44/94 gated
git status --porcelain <the 5 shrink-only ledgers + legal-traceability.lock + DOC-DEBT.md> → (empty)
```

## Notes

`G14` is still reserved and unregistered. `scripts/ci-gates.sh` was not modified — it is a manifest
interpreter and needs no change to run a new gate. No ledger was appended to, no gate command string
moved, and no gate, test or assertion was weakened anywhere in this plan. No point of Philippine law
was decided; `grep -c "\[x\]" .planning/LAWYER-AGENDA.md` still prints 0 and LAWYER-04, LAWYER-06 and
LAWYER-08 remain `awaiting-answer`.

One bookkeeping commit sits between plans `15-04` and `15-05`: `4bd504a7f`, which bumped
`.planning/STATE.md`'s `completed_plans` from 89 to 90 after `15-04`'s summary landed. G33 checks that
counter against the filesystem and is not exempt from it, so it had to move before the suite could be
green. It is recorded here rather than folded silently into either plan's commit.
