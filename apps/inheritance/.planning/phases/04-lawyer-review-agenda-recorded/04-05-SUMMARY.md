---
phase: 04-lawyer-review-agenda-recorded
plan: 05
status: complete
requirements: [LAWYER-10]
commit: fb2c8b1e6d0251cd3977249c0e85e9d06dba0bc1
---

# Summary — 04-05 Legal correction workflow, PLAN-STANDARD closeout, phase verification

## What was built

- `.planning/LEGAL-CORRECTION-WORKFLOW.md` — 145 lines, five fixed steps, five level-two sections.
- `.planning/PLAN-STANDARD.md` section 3 "Where a legal question goes" — rewritten to point at the
  real, gate-enforced structure.
- `README.md` — a new `## Legal decisions` section with a three-row table.

## The five steps, as written

```
### Step 1 — Record the claim, change no code
### Step 2 — Name a test vector
### Step 3 — Watch it fail
### Step 4 — Fix in exactly one place
### Step 5 — Close the loop
```

The vector convention is fixed in the document, not left to an executor: **`TV-L<NN>`**, zero-padded
from `01`, allocated in order, never reused, distinguished from the spec's existing `TV-01`…`TV-23`
series in `engine/tests/integration.rs`. The failing-vector commands are named literally
(`cd engine && cargo test <vector id>` / `cd frontend && npx vitest run -t <vector id>`), and step 5
names `node scripts/check-lawyer-agenda.mjs` plus `bash scripts/ci-gates.sh` as the commands that
must pass afterwards.

`## What an agent may never do` lists exactly four prohibitions. The worked example walks `LAWYER-04`
through all five steps and is explicitly labelled illustrative, stating that **no answer to
`LAWYER-04` has been received**.

## PLAN-STANDARD closeout — confined to one subsection

```
grep -c "Phase 4 owns that file's full structure"  → 0   (dangling placeholder gone)
grep -c "LEGAL-CORRECTION-WORKFLOW"                → 1
grep -c "G10"                                      → 1
grep -c "node scripts/check-lawyer-agenda.mjs"     → 1
grep -c "OPEN WORLD PHRASE"                        → 1   (baseline 1, unchanged)
grep -c "LEGAL JUDGMENT IN PLAN"                   → 1   (baseline 1, unchanged)
git diff --stat  → 1 file changed, 13 insertions(+), 4 deletions(-)
```

The `-U1` diff shows a single hunk at line 179, inside "Where a legal question goes". The nine
closed-world rules, their marker strings, both blacklist arrays, the scanning-region paragraph, the
BLOCKED report shape and the prohibition subsection are byte-identical.

## The four ROADMAP Phase 4 success criteria — evidenced, not asserted

### Criterion 1 — each of the eight interpretive choices has a recorded-decision entry

```
grep -c "^## LAWYER-"                    .planning/LAWYER-AGENDA.md → 8
grep -c "^\*\*Engine implements:\*\*"    .planning/LAWYER-AGENDA.md → 8
grep -c "### What I need from you"       .planning/LAWYER-AGENDA.md → 8
```

**MET.** Every entry states the engine's current reading (`**Engine implements:**`) and the exact
question posed (`### What I need from you`).

### Criterion 2 — machine-readable and linked from the rule it governs

```
node scripts/check-lawyer-agenda.mjs
  AGENDA OK — 8 decisions, 10 anchors, 8 awaiting-answer
  GATE-SKIPS total=8 skipped=0
  exit=0

grep -rc "LAWYER-DECISION" engine/src frontend/src/lib/estate-tax-engine specs/estate-tax-engine-spec.md
  markers_total=10
```

**MET.** Ten anchors each resolve to exactly one match, and ten marker comments name the decision
they carry. The link is bidirectional and gate-checked in both directions.

### Criterion 3 — the three blocking questions answerable in one sitting

```
| Decision   | Question                                                         | Blocks   |
| `LAWYER-04`| Q4 — the reach of *Aquino v. Aquino* into the collateral line     | `LAW-07` |
| `LAWYER-06`| Q6 — an heir's donation-excess entitlement…                       | `LAW-06` |
| `LAWYER-08`| Q8 — RA 11642 Sec. 41 retroactivity to pre-2022 decrees           | `LAW-12` |

grep -c "### Answer"  .planning/LAWYER-AGENDA.md → 8
grep -c "\[x\]"       .planning/LAWYER-AGENDA.md → 0
```

**MET.** The three blocking questions are listed first, before any entry, each naming the `LAW-*` id
it blocks and a one-line ask. Each has a three-checkbox Answer block. Zero boxes are ticked.

### Criterion 4 — a written workflow from "this is wrong" to a vector, a gate, and a fix

```
grep -c "^### Step " .planning/LEGAL-CORRECTION-WORKFLOW.md → 5
grep -c "TV-L"                                             → 8
grep -Fc "cd engine && cargo test"                         → 2
grep -Fc "node scripts/check-lawyer-agenda.mjs"            → 4
```

**MET.** The vector is named in step 2, observed failing in step 3, and only then fixed in step 4 —
the order that prevents a silent change to a legal number.

## Gate state at phase end

```
node scripts/check-plan-closed-world.mjs → PLANS OK — 20 plan file(s), 83 task(s) checked (exit 0)
node scripts/check-lawyer-agenda.mjs     → AGENDA OK — 8 decisions, 10 anchors, 8 awaiting-answer (exit 0)
node scripts/check-gate-manifest.mjs     → MANIFEST OK — 10 gates, 10 locked (exit 0)
bash scripts/ci-gates.sh                 → ALL GATES PASSED (10/10) (exit 0)
git status --porcelain engine/ specs/ frontend/src → empty
```

## `git diff HEAD~1 --stat` for this plan's commit

```
apps/inheritance/.planning/LEGAL-CORRECTION-WORKFLOW.md | 145 ++++++++++++++++
apps/inheritance/.planning/PLAN-STANDARD.md             |  17 +++++++++----
apps/inheritance/README.md                              |  19 +++++++++++++
3 files changed, 177 insertions(+), 4 deletions(-)
```

## Deviation

`safe-commit.sh` path form — repo-root-relative paths, as in every plan this phase. The script
`cd`s to the git root and allowlists only paths beginning `apps/inheritance/`, so the plans' literal
app-relative commands are refused.

## What this phase did NOT do

No interpretive choice was answered. All eight decisions ship `status: awaiting-answer` with
`answered_by`, `answered_on` and `answer` all `null`, and `grep -c "\[x\]"` over the agenda returns
`0` — not one box was ticked by an agent.

No engine computation changed. The only source edits in the entire phase were ten comment lines
(nine markers plus a replaced spec hedge line), and `cargo test` reports the same **442 passed,
0 failed** it reported before the phase began, with `npx tsc -b --force` still silent.

`LAW-06`, `LAW-07` and `LAW-12` remain blocked, pending the lawyer's reply. Gate G10 is what keeps
them blocked: advancing any of those three statuses now requires writing a person, a date and a
sentence into the diff, and `DECISION STATUS INVALID` fails the build without them.

## Self-Check: PASSED
