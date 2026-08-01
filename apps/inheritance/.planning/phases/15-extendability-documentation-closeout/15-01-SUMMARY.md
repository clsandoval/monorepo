---
phase: 15-extendability-documentation-closeout
plan: 01
subsystem: docs
tags: [claude-md, invariants, gate, ext-05]
requires: []
provides:
  - "CLAUDE.md '## Invariants an implementing agent must not violate' — six rules, each naming its enforcing command and gate id"
  - "scripts/check-claude-invariants.mjs — gate G30's command (registered by 15-05)"
affects: []
tech-stack:
  added: []
  patterns:
    - "Generated-span detection computed from the file on every run, never hardcoded, so a newly added <!-- GSD:*-start/end --> block is covered automatically"
    - "Three-valued exit contract: 0 pass, 1 rule violated, 2 input unreadable (cannot-run), matching PLAN-STANDARD.md section 3"
key-files:
  created:
    - scripts/check-claude-invariants.mjs
    - scripts/fixtures/claude-invariants-missing.md
    - scripts/fixtures/claude-invariants-short.md
    - scripts/fixtures/claude-invariants-ungated.md
    - scripts/fixtures/claude-invariants-swallowed.md
    - scripts/fixtures/claude-invariants-untitled.md
  modified:
    - CLAUDE.md
key-decisions:
  - "gates.manifest.json is NOT overridable by a flag. An invariant must be checked against the real gate set or the check certifies nothing; only the CLAUDE.md path is overridable, read-only, so the fixtures can drive each failure path."
  - "Invariant 5 states the single-implementation rule and names the surviving duplicate (predictScenario/computeMock in frontend/src/wasm/bridge.ts) as recorded debt owned by EXT-02, rather than claiming it is gone."
  - "Invariant 6 names where a legal question goes and answers none. No point of Philippine law was decided."
requirements-completed: [EXT-05]
duration: 25 min
completed: 2026-08-01
---

# Phase 15 Plan 01: Six Agent Invariants in CLAUDE.md, Behind a Gate

`CLAUDE.md`'s hand-written `## Loop invariants` section grew from three rules to six and became
`## Invariants an implementing agent must not violate`, adding the three subjects EXT-05 named and
the file was silent on: **unit conventions**, **single-source-of-truth**, and **what requires a
lawyer**. Each of the six names the command and gate id that enforces it.

## What Was Built

**Task 1 — measured, edited nothing.** `grep -n "<!-- GSD:" CLAUDE.md` printed 14 marker lines;
`## Loop invariants` sat at line 311, between `GSD:skills-end` (309) and `GSD:workflow-start` (330),
so the section was already outside every generated span. All six cited command strings printed
`FOUND` against `gates.manifest.json`:

```
FOUND node scripts/check-commit-discipline.mjs
FOUND node scripts/check-gate-manifest.mjs
FOUND node scripts/check-plan-closed-world.mjs
FOUND cd frontend && npx tsc -b --force
FOUND node scripts/check-legal-traceability.mjs
FOUND node scripts/check-lawyer-agenda.mjs
```

**Task 2 — the section.** Six invariants in the order fixed by the plan's Reference A:
`Commit scope` (G7), `Gate immutability` (G5), `Halt over guess` (G6), `Money units` (G4),
`One implementation per legal rule` (G28), `What requires a lawyer` (G10). Post-edit measurements:
`grep -cE "^[0-9]\. \*\*"` = **6**, `grep -c "<!-- GSD:"` = **14** (unchanged, no marker touched),
`grep -c "^## Loop invariants"` = **0**.

**Task 3 — the check.** `scripts/check-claude-invariants.mjs`, dependency-free Node ESM,
`node:` builtins only, one read-only path override flag. Against the committed tree:

```
CLAUDE INVARIANTS OK — 6 invariant(s) checked, all commands gated
GATE-SKIPS total=6 skipped=0
REAL=0
```

`grep -cE '\-\-fix|\-\-update|\-\-accept|\-\-regenerate|writeFileSync|appendFileSync|mkdirSync'`
prints **0** — the check provably writes nothing and has no waiver.

**Task 4 — every failure path observed firing** against a committed fixture:

| Fixture | Marker observed | Exit |
|---|---|---|
| `claude-invariants-missing.md` | `INVARIANT SECTION MISSING` | 1 |
| `claude-invariants-short.md` | `INVARIANT COUNT` (names 5) | 1 |
| `claude-invariants-ungated.md` | `INVARIANT COMMAND UNGATED` (names `node scripts/check-nothing-at-all.mjs`) | 1 |
| `claude-invariants-swallowed.md` | `INVARIANT INSIDE GENERATED BLOCK` (names the `stack` span, lines 25–142) | 1 |
| `claude-invariants-untitled.md` | `INVARIANT TITLE MISSING` (position 4, `Money units` vs `Numbers`) | 1 |
| `scripts/fixtures/nope.md` | `CLAUDE MD UNREADABLE` | **2** |

Every run printed exactly one `GATE-SKIPS total=6 skipped=0` line, and the real `CLAUDE.md` still
exits 0 after all five fixtures exist.

**Task 5 — one commit**, `c5d3f8b39`, exactly the seven paths in `files_modified`, staged
explicitly through `bash scripts/safe-commit.sh`.

## Verification

```
node scripts/check-claude-invariants.mjs   → CLAUDE INVARIANTS OK — 6 invariant(s) checked, all commands gated   (exit 0)
node scripts/check-commit-discipline.mjs   → COMMIT DISCIPLINE OK — 216 commit(s) audited, 187 touching apps/inheritance/, 0 mixed
node scripts/check-plan-closed-world.mjs   → PLANS OK — 91 plan file(s), 363 task(s) checked
node scripts/check-gate-manifest.mjs       → MANIFEST OK — 28 gates, 28 locked
git status --porcelain CLAUDE.md scripts/  → (empty)
```

The gate set is still 28 — this plan registered nothing. Registration as **G30** is plan `15-05`'s
work.

## Notes

Nothing under `engine/`, `frontend/src/`, `specs/` or `.planning/` was edited. No test, assertion or
gate was weakened, skipped or deleted. No point of Philippine law arose or was decided.
