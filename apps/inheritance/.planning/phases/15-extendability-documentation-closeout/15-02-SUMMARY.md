---
phase: 15-extendability-documentation-closeout
plan: 02
subsystem: docs
tags: [legal-procedure, traceability, gate, ext-06]
requires: []
provides:
  - ".planning/NEW-LEGAL-RULE.md — five-step procedure for adding a rule the engine does not yet implement"
  - "scripts/check-new-rule-procedure.mjs — gate G31's command (registered by 15-05)"
affects: []
tech-stack:
  added: []
  patterns:
    - "Worked example re-resolved against engine/legal-rules.json and the real engine source on every gate run, anchored by article + file + function NAME, never by a line number"
key-files:
  created:
    - .planning/NEW-LEGAL-RULE.md
    - scripts/check-new-rule-procedure.mjs
    - scripts/fixtures/rule-proc-step-missing.md
    - scripts/fixtures/rule-proc-step-order.md
    - scripts/fixtures/rule-proc-artifact-dropped.md
    - scripts/fixtures/rule-proc-example-broken.md
  modified: []
key-decisions:
  - "The worked example was chosen by a deterministic rule (lowest-numbered article with a non-null vector), not by taste: Art. 172 / src/step10_finalize.rs / test_filiation_description_birth_certificate."
  - "DEVIATION: the plan described the marker as sitting within three lines ABOVE the fn line. Measured, it sits INSIDE the function body (engine/src/step10_finalize.rs:1044 fn, :1045 marker). The check therefore mirrors scripts/check-legal-traceability.mjs's own association rule — a marker belongs to the nearest PRECEDING fn line — which is the authoritative implementation already in the tree. Same assertion, correct adjacency direction; nothing was loosened."
  - "Step 1 carries the authority boundary explicitly: an article no spec already states is a new legal claim, and the output is BLOCKED plus a LAWYER-<NN> entry, never a spec edit. Without that paragraph this document would be a route around .planning/PLAN-STANDARD.md section 3."
requirements-completed: [EXT-06]
duration: 30 min
completed: 2026-08-01
---

# Phase 15 Plan 02: The New-Legal-Rule Procedure, With a Gate-Held Worked Example

`.planning/LEGAL-CORRECTION-WORKFLOW.md` covers correcting a rule that already exists and explicitly
reserved the other half for EXT-06. `.planning/NEW-LEGAL-RULE.md` is now that other half: article →
vector → failing run → one-site implementation → registration, in five fixed steps.

## What Was Built

**Task 1 — measured, edited nothing.**

```
rules 79 untraced 16
EXAMPLE Art. 172 | src/step10_finalize.rs | test_filiation_description_birth_certificate
scripts/check-legal-traceability.mjs:67:const MARKER_PREFIX = '// LEGAL-VECTOR: ';
```

Both counts match what planning measured. The example was selected deterministically — the
lowest-numbered article whose `vector` is non-null — not by preference.

**Measured deviation from the plan.** Task 1 asked to confirm the `// LEGAL-VECTOR:` marker sits
within three lines *above* the `fn` line. It does not. In this tree the marker sits on the first line
of the test *body*:

```
1043:    #[test]
1044:    fn test_filiation_description_birth_certificate() {
1045:        // LEGAL-VECTOR: Art. 172
```

`scripts/check-legal-traceability.mjs` (gate G28) already resolves this correctly — it walks
*backwards* from a marker to the nearest preceding `fn` line. The new check mirrors that association
exactly rather than the plan's inverted description. This is a factual correction to an anchoring
direction, not a weakening: the assertion checked is still "this article's marker is attributed to
this named function".

**Task 2 — the document.** Five `## Step N — ` headings in the order fixed by the plan's Reference A,
each closing with an `*Artifact produced:*` line in the same shape the correction workflow uses.
Step 1 states the authority boundary as its own paragraph. Step 5 states that `implemented_in` is
recomputed from source, so hand-writing it fails rather than passes, and that
`engine/legal-traceability.lock` may only shrink. A `## What an agent may never do` list transcribes
the correction workflow's four prohibitions plus a fifth — *author a statement of law that no spec
already contains*.

**Task 3 — the check.** `scripts/check-new-rule-procedure.mjs`, dependency-free Node ESM. Against the
committed tree:

```
NEW RULE PROCEDURE OK — 5 step(s) checked, worked example resolves
GATE-SKIPS total=5 skipped=0
REAL=0
```

`grep -cE '\-\-fix|\-\-update|\-\-accept|\-\-regenerate|writeFileSync|appendFileSync|mkdirSync'`
prints **0**. `engine/legal-rules.json` and the engine trees are deliberately **not** overridable —
only the procedure path is, read-only.

**Tasks 4 and 5 — all six markers observed firing:**

| Input | Marker observed | Exit |
|---|---|---|
| `rule-proc-step-missing.md` | `STEP MISSING` (holds 4, expected 5; names step 4 `Implement at exactly one site`) | 1 |
| `rule-proc-step-order.md` | `STEP ORDER` (order `[1, 4, 3, 2, 5]`) | 1 |
| `rule-proc-artifact-dropped.md` | `ARTIFACT NOT NAMED` (names `engine/legal-traceability.lock`) | 1 |
| `rule-proc-example-broken.md` | `WORKED EXAMPLE BROKEN` (resolution 4 of 4, names `test_function_that_does_not_exist`) | 1 |
| scratch copy with the title line deleted | `PROCEDURE MISSING` | 1 |
| `scripts/fixtures/nope.md` | `PROCEDURE UNREADABLE` | **2** |

The scratch file was deleted afterwards; `ls scripts/fixtures/ | grep -c '^rule-proc-'` prints **4**,
not five.

**Commit** `b95dc566e`, exactly the six paths in `files_modified`, staged explicitly through
`bash scripts/safe-commit.sh`.

## Verification

```
node scripts/check-new-rule-procedure.mjs   → NEW RULE PROCEDURE OK — 5 step(s) checked, worked example resolves  (exit 0)
node scripts/check-legal-traceability.mjs   → LEGAL TRACEABILITY COVERAGE 63/79 articles traced, 16 declared untraced  (exit 0, unchanged)
node scripts/check-commit-discipline.mjs    → 218 commit(s) audited, 189 touching apps/inheritance/, 0 mixed
node scripts/check-plan-closed-world.mjs    → PLANS OK — 91 plan file(s), 363 task(s) checked
node scripts/check-lawyer-agenda.mjs        → AGENDA OK — 9 decisions, 11 anchors, 9 awaiting-answer
grep -c "\[x\]" .planning/LAWYER-AGENDA.md  → 0
git status --porcelain .planning/ scripts/  → (empty)
```

## Notes

Nothing under `engine/`, `frontend/` or `specs/` was edited. No `// LEGAL-VECTOR:` marker was added,
moved or removed; `engine/legal-traceability.lock` still holds its 16 entries. No point of Philippine
law was decided — the document describes a process and states no rule of law.

Registration as **G31** is plan `15-05`'s work; the gate set is still 28.

Unrelated pre-existing dirt observed and left alone: `engine/COVERAGE.md` is modified in the working
tree from a prior phase's gate run (it is a regenerated report). It is not in this plan's
`files_modified` and was not committed.
