---
phase: 02-loop-durability-commit-discipline
plan: 02
subsystem: loop-durability
tags: [plan-lint, closed-world, blocked-protocol]
requires: []
provides:
  - .planning/PLAN-STANDARD.md
  - scripts/check-plan-closed-world.mjs
affects:
  - scripts/ci-gates.sh (plan 02-04 registers this lint as gate G6)
tech-stack:
  added: []
  patterns:
    - dependency-free Node ESM lint, node: builtins only
    - line-based YAML frontmatter extraction, no YAML dependency
    - prose view that strips fenced blocks and blanks inline code spans
key-files:
  created:
    - .planning/PLAN-STANDARD.md
    - scripts/check-plan-closed-world.mjs
    - scripts/fixtures/plan-openworld.md
    - scripts/fixtures/plan-legal.md
    - scripts/fixtures/plan-thin.md
    - scripts/fixtures/plan-badreq.md
    - scripts/fixtures/plan-fenced.md
  modified: []
key-decisions:
  - "Prose rules 7 and 8 scan a prose view only: fenced code blocks removed, inline code spans blanked. plan-fenced.md is the committed regression fixture that keeps that exemption honest."
  - "No waiver, allowlist or suppression comment exists. The measured Phase 1 corpus scores zero on all 20 hedge phrases, so the blacklist is satisfiable without one."
  - "NO PLANS FOUND exits 1: a lint that silently passes on an empty set is worse than no lint."
requirements-completed: [LOOP-01, LOOP-02]
duration: ~30 min
completed: 2026-07-31
---

# Phase 2 Plan 02: Closed-World Plan Lint and the BLOCKED Protocol Summary

"Closed-world" is now nine numbered rules in `.planning/PLAN-STANDARD.md`, each with a distinct
marker string, enforced over every `.planning/phases/*/*-PLAN.md` by a dependency-free lint. The
same file specifies the BLOCKED report — three triggers, a five-field shape, and where a legal
question is recorded instead of answered.

**Tasks:** 4 of 4 · **Files:** 7 created, 0 modified · **Commit:** `c69cce9c6`

## Measured against the real corpus

`node scripts/check-plan-closed-world.mjs --list` discovers exactly **10** plan files (Phase 1's
four plus Phase 2's six). The lint passes over all of them **first try, with no plan file edited**:

```
PLANS OK — 10 plan file(s), 40 task(s) checked
```

Constraint 4 held: `git status --porcelain .planning/phases/` shows no modified `*-PLAN.md`, and no
`-PLAN.md` path appears in the commit.

## Observed results — every marker fired

| Run | Exit | Marker matched |
|---|---:|---|
| `--file scripts/fixtures/plan-openworld.md` | 1 | `OPEN WORLD PHRASE — prose contains "as appropriate"` (line 34) |
| `--file scripts/fixtures/plan-legal.md` | 1 | `LEGAL JUDGMENT IN PLAN — prose contains "decide whether art"` (line 35) |
| `--file scripts/fixtures/plan-thin.md` | 1 | `THIN ACCEPTANCE — 1 bullet line(s); at least 2 are required` |
| `--file scripts/fixtures/plan-badreq.md` | 1 | `UNKNOWN REQUIREMENT — LOOP-99 does not appear in .planning/REQUIREMENTS.md` |
| `--file scripts/fixtures/plan-fenced.md` | **0** | `PLANS OK — 1 plan file(s), 1 task(s) checked` |
| `--file /tmp/definitely-not-a-file.md` | 1 | `PLAN UNREADABLE` |
| /tmp copy of plan-thin without `must_haves` | 1 | `MISSING FRONTMATTER KEY` |
| /tmp copy of plan-thin without `<verification>` | 1 | `MISSING SECTION` |
| /tmp copy with `depends_on: ["99-42"]` | 1 | `BROKEN DEPENDENCY` |
| /tmp copy with `<done>` removed | 1 | `INCOMPLETE TASK` |
| /tmp copy with `requirements: [LAW-06]` | 1 | `UNGROUNDED LEGAL FIX — never cites LAWYER-06` |
| ad-hoc tree with an empty `.planning/phases/` | 1 | `NO PLANS FOUND` |

All nine rule markers plus both internal-error markers have been observed firing. `plan-fenced.md`
is the load-bearing one: it contains `as appropriate` twice — once fenced, once in an inline code
span — and must exit 0, so a later refactor that widens the scanning region turns the gate red
immediately.

## False positives against the real corpus

**Zero.** No rule needed narrowing. The research prediction held: `TODO` matches only
case-sensitively with word boundaries, so lowercase `.todo` / `numTodoTests` inside Phase 1's plans
(16 case-insensitive hits) score zero. All other 19 hedge phrases score zero on the corpus as
written. No phrase-list tuning is indicated for a later phase.

## Verification

- `node scripts/check-plan-closed-world.mjs` → exit 0, `PLANS OK`
- Runs from any cwd: `cd /tmp && node <abs path>` → exit 0, same output
- `grep -cE "writeFileSync|appendFileSync|--fix|--waive|eslint-disable"` → **0**
- Imports: only `node:fs` and `node:path`
- Two top-level `const` arrays hold the phrase lists (lines 48 and 73), auditable in one place
- `.planning/PLAN-STANDARD.md` is 194 lines and contains all nine markers, all three section
  headings, `GATE CANNOT RUN`, `exit code 2`, `.planning/LAWYER-AGENDA.md`, `Real command output:`
- `bash scripts/ci-gates.sh` → exit 0, `ALL GATES PASSED (4/4)` (unchanged by this plan)

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None. `.planning/LAWYER-AGENDA.md` is referenced by section 3 of the standard but deliberately not
created; Phase 4 owns its structure, and the standard documents append-and-create-if-absent.

## Next

Ready for 02-04, which registers this lint as gate `G6`.

## Self-Check: PASSED
