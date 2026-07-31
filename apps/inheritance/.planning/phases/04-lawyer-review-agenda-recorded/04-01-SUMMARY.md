---
phase: 04-lawyer-review-agenda-recorded
plan: 01
status: complete
requirements: [LAWYER-01, LAWYER-02, LAWYER-03, LAWYER-04]
commit: 949e9e15bf1756866d1f172e31a5d2997341dac3
---

# Summary — 04-01 Agenda file, answering instructions, blocking index, entries LAWYER-01…04

## What was built

`.planning/LAWYER-AGENDA.md`, 266 lines. Four parts before the entries (title + standing note,
`## How to answer`, `## Answer these three first`, `## Entry format`), then entries `LAWYER-01`
through `LAWYER-04`.

First line is exactly `# Lawyer Review Agenda`, matching what `.planning/PLAN-STANDARD.md:180-183`
tells a BLOCKED executor to create, so a future append lands in a file already in the right shape.

## The entry structure (plans 04-02, 04-03, 04-04 parse this)

Each entry is, in order:

1. `## LAWYER-0N — QN: <short title>`
2. `**Status:**` — `awaiting-answer` | `confirmed` | `changed`
3. `**Engine implements:**` — `A` | `B` | `neither`
4. `**Blocks:**` — a requirement id, or `nothing scheduled`
5. `**Governing code:**` — file plus rule site, in backticks
6. `### The question`
7. `### Reading A`
8. `### Reading B`
9. `### What the engine does today`
10. `### What I need from you`
11. `### Answer` — three unticked boxes (`Confirm Reading A` / `Change to Reading B` /
    `Neither — see notes`), then `Answered by:`, `Date:`, `Notes:`
12. A one-line italic provenance footer naming `.planning/research/LEGAL-CONFORMANCE.md` section 3
    and the question number

The four metadata lines are at column 0 so `grep -c "^\*\*Status:\*\*"` counts entries exactly.

## Verification (measured)

```
head -1                                  → # Lawyer Review Agenda
grep -c "^## LAWYER-"                    → 4
grep -c "Confirm Reading A"              → 4
grep -c "Change to Reading B"            → 4
grep -c "awaiting-answer"                → 5   (4 entries + 1 in Entry format vocabulary)
grep -c "\[x\]"                          → 0
grep -c "^\*\*Status:\*\*"               → 4
grep -c "^\*\*Engine implements:\*\*"    → 4
grep -c "^\*\*Blocks:\*\*"               → 4
grep -c "^\*\*Governing code:\*\*"       → 4
grep -c "LEGAL-CONFORMANCE"              → 5
wc -l                                    → 266
node scripts/check-plan-closed-world.mjs → PLANS OK — 20 plan file(s), 83 task(s) checked (exit 0)
bash scripts/ci-gates.sh                 → ALL GATES PASSED (9/9)
git log -1 --name-only                   → apps/inheritance/.planning/LAWYER-AGENDA.md (only)
```

## Deviations

1. **`safe-commit.sh` path form.** The plan's literal command
   (`bash scripts/safe-commit.sh -m "..." .planning/LAWYER-AGENDA.md`) is refused by the script:
   it `cd`s to the git root and allowlists only paths starting `apps/inheritance/`. Committed with
   `apps/inheritance/.planning/LAWYER-AGENDA.md` instead. Same file, same single path. Plans 04-02
   through 04-05 carry the same defect in their commit commands.

2. **Two prose rewordings to keep the plan's own grep counts exact.** The plan's task-1 text asked
   the `## How to answer` section to contain the literal strings `Confirm Reading A` and
   `Change to Reading B`, and its LAWYER-04 ask item 1 to read `Confirm Reading A, so the collateral
   barrier can be implemented` — but the plan's verification checklist requires those two greps to
   return exactly `4` (one per entry). The three occurrences outside Answer blocks were reworded to
   lowercase/paraphrase (`Ticking box 1, *confirm Reading A*, …`; `Confirm the narrow reading
   (Reading A), …`). Meaning is unchanged; only the Answer-block checkboxes now carry the literals.

## No law was decided

All four entries ship `**Status:** awaiting-answer`. `grep -c "\[x\]"` returns 0. Every legal
proposition is transcribed from `.planning/research/LEGAL-CONFORMANCE.md` section 3; no citation was
added and none was dropped. Nothing was appended to the agenda beyond the four planned entries.

## Self-Check: PASSED
