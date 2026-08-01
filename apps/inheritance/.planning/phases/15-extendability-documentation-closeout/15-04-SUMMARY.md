---
phase: 15-extendability-documentation-closeout
plan: 04
subsystem: docs
tags: [orientation, roadmap-reconciliation, derived-status, gate, ext-08]
requires: ["15-02", "15-03"]
provides:
  - ".planning/ORIENTATION.md — the three EXT-08 questions answered by pointer, not by restatement"
  - "scripts/check-planning-truth.mjs — gate G33's command (registered by 15-05)"
  - "ROADMAP Progress table, checkbox list, STATE.md counters and RESUME.md gate count reconciled with the filesystem"
affects: []
tech-stack:
  added: []
  patterns:
    - "Phase status DERIVED by counting *-PLAN.md against *-SUMMARY.md, never judged. No agent decides whether a phase went well."
    - "In-flight-phase exemption that relaxes under-reporting only; over-claiming still fails, and the exemption prints on every run so it is never silent."
key-files:
  created:
    - .planning/ORIENTATION.md
    - scripts/check-planning-truth.mjs
    - scripts/fixtures/truth-roadmap-count.md
    - scripts/fixtures/truth-roadmap-status.md
    - scripts/fixtures/truth-state-counts.md
    - scripts/fixtures/truth-orientation-pointer.md
    - scripts/fixtures/truth-orientation-gates.md
  modified:
    - .planning/ROADMAP.md
    - .planning/STATE.md
    - RESUME.md
key-decisions:
  - "Derived status is a file count, so phases 5, 9, 10, 11 and 14 — whose prose records them as partial — now read 'Complete' in the Progress table, because every one of their plans has a committed summary. The nuance was NOT deleted: it lives in each phase's untouched prose description. The plan fixes this rule explicitly and forbids judgement."
  - "The percent check compares the document against the FILESYSTEM-derived value, not against the document's own completed_phases. A file that is internally consistent but wrong about the tree still fails."
  - "ORIENTATION.md carries exactly one number — the gate count — and the check compares it to gates.manifest.json on every run. grep -cE '[0-9]+/[0-9]+' over the page prints 0."
requirements-completed: [EXT-08]
duration: 50 min
completed: 2026-08-01
---

# Phase 15 Plan 04: The Planning Directory Reconciled With the Tree, and Gated

## What Was Built

**Task 1 — derived the truth table from the filesystem.** Fifteen phase directories; every phase 1–14
has one summary per plan; phase 15 had `plans=5 summaries=3` at the time of the pass. Totals:
**91 plans, 89 summaries**. `gates.manifest.json` holds **28** gates. Checkboxes read
`checked=9 unchecked=6`, against 14 phases whose derived status is `Complete`.

The Progress table disagreed on **seven** rows before the edit — phases 6, 7, 8 and 11 reporting
`0/N Planned`, and phases 9, 10 and 14 reporting `0/TBD Not started` against six, six and six
committed plans and summaries respectively. Phase 5's Status cell read `Blocked`, which is not one of
the four legal values at all.

**Task 2 — the table and the checkboxes.** All 15 rows now read `<summaries>/<plans>` with a derived
status; Phase 14 reads `6/6 Complete` and no row reads `0/TBD`. `grep -c "^| "` is unchanged at
**16** (15 rows plus the header separator), so no row was added or removed, and the `Completed` date
column and every prose phase description were left untouched. Checkboxes are now `checked=14
unchecked=1`, exactly matching the 14 phases derived `Complete`.

Worth stating plainly: this makes phases 5, 9, 10, 11 and 14 read `Complete` even though their prose
records blocked requirements. That is the plan's rule — status is a file count, not a verdict — and
the blocking detail survives verbatim in each phase's description text, in
`.planning/BLOCKED-REQUIREMENTS.md` and in `.planning/STATE.md`'s narrative.

**Task 3 — `STATE.md` and `RESUME.md`.** `total_phases: 15`, `completed_phases: 14`,
`total_plans: 91`, `completed_plans: 89`, `percent: 93`, and the body bar now reads
`Progress: [█████████░] 93%` — the previous self-contradiction (frontmatter 93, body 73) is gone.
`RESUME.md` no longer sends a reader looking for a 13-gate suite; it names `ALL GATES PASSED (28/28)`
and points at `.planning/ORIENTATION.md` as the page that stays current. Its four numbered open owner
decisions survive verbatim (`grep -c` prints **4**).

**Task 4 — `.planning/ORIENTATION.md`.** Four sections in order: `## Where am I`,
`## What is verified`, `## What is next`, `## The four documents that tell an agent what it may not
do`. All 14 required pointers present as inline-code paths; every non-glob path resolves. One number
on the page, `The gate set holds 28 gates.`, and `grep -cE "[0-9]+/[0-9]+"` prints **0**.

**Task 5 — the check.** Against the committed tree:

```
IN-FLIGHT PHASE 15 — numerator relaxed, denominator and over-claim still checked
PLANNING TRUTH OK — 15 phase(s) reconciled, 4 document(s) checked
GATE-SKIPS total=8 skipped=0
```

`grep -cE '\-\-fix|\-\-update|\-\-accept|\-\-regenerate|writeFileSync|appendFileSync|mkdirSync'`
prints **0**. Nothing is hardcoded: the phase count, plan count, summary count and gate count in the
success line are all derived at run time.

**Task 6 — all eight markers observed firing:**

| Input | Marker observed | Exit |
|---|---|---|
| `truth-roadmap-count.md` | `ROADMAP PLAN COUNT` — phase 13 reads `1/7`, counted `7/7` | 1 |
| `truth-roadmap-status.md` | `ROADMAP STATUS DISAGREES` — phase 13 reads `Not started`, derived `Complete` | 1 |
| `truth-state-counts.md` | `STATE PLAN COUNT` (`total_plans` 999 vs 91; `completed_phases` 10 vs 14) **and** `STATE PERCENT DRIFT` (both sub-conditions) | 1 |
| `truth-orientation-pointer.md` | `ORIENTATION POINTER BROKEN` naming `.planning/THIS-FILE-DOES-NOT-EXIST.md` | 1 |
| `truth-orientation-gates.md` | `ORIENTATION GATE COUNT` — states 13, manifest holds 28 | 1 |
| scratch roadmap `9/7` + scratch state `Phase: 13` | `ROADMAP OVER CLAIMS` — claims 9, only 7 summaries | 1 |
| `scripts/fixtures/nope.md` | `PLANNING TRUTH UNREADABLE` | **2** |

Both scratch files were deleted; `ls scripts/fixtures/ | grep -c '^truth-'` prints **5**, not 6 or 7.
Every run printed exactly one `GATE-SKIPS` line and exactly one `IN-FLIGHT PHASE` line, and the real
run still exits 0 after all five fixtures exist.

Deviation worth recording: the plan's task-6 recipe for `STATE PERCENT DRIFT` was to change
`completed_phases` alone. That does not drive the marker under this implementation, because `percent`
is compared against the value derived from the **filesystem**, not against the document's own
`completed_phases` — which is the stricter and more honest comparison. The fixture therefore also
sets `percent: 73` while leaving the body bar at 93%, driving both halves of the marker in one run.

**Commit** `bbda35fe5`, exactly the ten paths, staged explicitly.

## Verification

```
node scripts/check-planning-truth.mjs   → PLANNING TRUTH OK — 15 phase(s) reconciled, 4 document(s) checked  (exit 0)
node scripts/check-doc-claims.mjs       → DOC CLAIMS OK — 11 claim(s) probed, 7 debt entr(ies) live
node scripts/check-plan-closed-world.mjs→ PLANS OK — 91 plan file(s), 363 task(s) checked
node scripts/check-commit-discipline.mjs→ 222 commit(s) audited, 193 touching apps/inheritance/, 0 mixed
node scripts/check-gate-manifest.mjs    → MANIFEST OK — 28 gates, 28 locked
git status --porcelain .planning/ RESUME.md scripts/ → (empty)
```

## Notes

No requirement was marked complete here, no gate was registered, and no gate, test or assertion was
weakened. Registration as **G33** is plan `15-05`'s work. No point of Philippine law arose.
