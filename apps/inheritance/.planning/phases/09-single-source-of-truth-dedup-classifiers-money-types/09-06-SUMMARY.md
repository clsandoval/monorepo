---
phase: 09-single-source-of-truth-dedup-classifiers-money-types
plan: 06
subsystem: gates
tags: [registry, gate, blocked, ext-02]
requires: ["09-04", "09-05"]
provides: []
affects: []
tech-stack:
  added: []
  patterns: []
key-files:
  created: []
  modified: []
key-decisions:
  - "Not started. Three of the four rules it enforces are above their ceilings because 09-04 is BLOCKED; registering G14 at order 6 would halt the gate runner earlier than it halts today."
requirements-completed: []
requirements-blocked: [EXT-02]
commits: []
duration: 0
completed: 2026-07-31
status: blocked
---

# Phase 9 Plan 06: Single-Source Registry and Gate G14 — BLOCKED (dependency)

## BLOCKED

```text
BLOCKED
Requirement: EXT-02
Task: 09-06 Task 1: single-source.json, scripts/check-single-source.mjs, gate G14 at order 6
What was attempted: Nothing was written. The plan registers G14 as a blocking gate at order 6 —
ahead of G1, G2 and G3 — enforcing four rules whose ceilings are only reachable after 09-04 and 09-05
have deleted the duplicates. 09-05 landed; 09-04 is BLOCKED on 09-01. Three of the four rules are
therefore still above ceiling, so creating the gate would make `bash scripts/ci-gates.sh` fail at G14
(order 6), i.e. EARLIER than the G3 halt this phase inherited. Every Phase 9 plan states that halting
before G3 is itself a BLOCKED condition.
Real command output (measured after 09-03 and 09-05 landed):
$ cd frontend && grep -rlE "as\s+ScenarioCode" --include=*.ts --include=*.tsx src/
src/components/wizard/ReviewStep.tsx
$ grep -rlE "successionType\s*:\s*[\"'](Testate|Intestate)" --include=*.ts --include=*.tsx src/ | grep -v __tests__
src/wasm/bridge.ts
$ grep -rlE "function\s+predictScenario" --include=*.ts --include=*.tsx src/
src/components/wizard/ReviewStep.tsx
src/wasm/bridge.ts
$ grep -rlE "Math\.round\(.*\*\s*100" --include=*.ts --include=*.tsx src/ | grep -v __tests__
src/types/money-units.ts
src/lib/timeline.ts
src/lib/documents.ts
```

## Rule-by-rule state

| Id | Ceiling | Before Phase 9 | Now | At ceiling? |
|---|---|---|---|---|
| `SSOT-01` `as\s+ScenarioCode` | 0 files | 1 file, 12 hits | 1 file | no — needs 09-04 |
| `SSOT-02` `successionType\s*:\s*["'](Testate\|Intestate)` | 0 files | 1 file, 27 hits | 1 file | no — needs 09-04 |
| `SSOT-03` `function\s+predictScenario` | 0 files | 2 files | 2 files | no — needs 09-04 |
| `SSOT-04` `Math\.round\(.*\*\s*100` | only the 3 allowed files | 4 files | **3 files** | **yes — 09-05 closed it** |

`SSOT-04` reached its ceiling exactly as planned: the fourth file was the estate-tax pipeline's
private converter, which 09-05 deleted. The three survivors are the three the plan names as
legitimate — `src/types/money-units.ts` (the one permitted implementation),
`src/lib/documents.ts` and `src/lib/timeline.ts` (both percentage computations, not money).

## Why a partial G14 was not registered

Registering the registry and script without the gate, or registering the gate non-blocking, were both
considered and rejected. `gates.manifest.lock` freezes `{id, command, blocking}`, and loop invariant 2
in `CLAUDE.md` states that setting a blocking gate non-blocking requires owner action, never agent
action. Adding a gate now at a weaker setting than the plan specifies, intending to strengthen it
later, is precisely the "weaken a check to clear a blocker" move PLAN-STANDARD §3 prohibits.

## No point of Philippine law arose

`.planning/LAWYER-AGENDA.md` is untouched.

## Self-Check: FAILED
