---
phase: 09-single-source-of-truth-dedup-classifiers-money-types
plan: 04
subsystem: frontend
tags: [dedup, classifier, blocked, ext-01, ext-04]
requires: ["09-01", "09-03"]
provides: []
affects: []
tech-stack:
  added: []
  patterns: []
key-files:
  created: []
  modified: []
key-decisions:
  - "Not started. Its wave-1 dependency 09-01 is BLOCKED, so the symbol this plan imports does not exist."
requirements-completed: []
requirements-blocked: [EXT-01, EXT-04]
commits: []
duration: 0
completed: 2026-07-31
status: blocked
---

# Phase 9 Plan 04: Delete Both Frontend Classifiers — BLOCKED (dependency)

## BLOCKED

```text
BLOCKED
Requirement: EXT-01, EXT-04
Task: 09-04 Task 1: Strip bridge.ts to the real boundary and add classifyScenario
What was attempted: Nothing was attempted. The plan's first task requires
`import { classify_json } from "./pkg/inheritance_engine"`, and its `depends_on` frontmatter names
09-01 as the plan that produces that export. 09-01 is BLOCKED (see 09-01-SUMMARY.md), nothing from it
was committed, and the tracked bindings therefore do not contain the symbol.
Real command output:
$ grep -c "classify_json" apps/inheritance/frontend/src/wasm/pkg/inheritance_engine.js apps/inheritance/frontend/src/wasm/pkg/inheritance_engine.d.ts
apps/inheritance/frontend/src/wasm/pkg/inheritance_engine.js:0
apps/inheritance/frontend/src/wasm/pkg/inheritance_engine.d.ts:0
```

## Why the plan cannot be partially executed either

The plan's ordering is not incidental. Task 2 replaces `ReviewStep.tsx`'s `predictScenario` with a
`useEffect` that calls `classifyScenario` from `bridge.ts`, and Task 3 strengthens the three badge
tests from `/I\d/` and `/T\d/` to the exact codes `I2` and `T2`. Deleting the live classifier without
the engine-backed replacement would leave the badge with no source at all, which is strictly worse
than the wrong-by-one-code badge it has today — and the phase's whole premise (ROADMAP: "a gate that
faithfully certifies a wrong 'Predicted:' badge is worse than no gate") is that the badge must be
*backed*, not merely emptied.

One measurement from 09-01 is worth carrying forward to the replan: the engine's own
`classify_scenario`, run over the two `ReviewStep.test.tsx` fixture shapes, returned exactly
`ScenarioCode::I2` and `ScenarioCode::T2`. `09-RESEARCH.md` §1.2's finding — that the live
`ReviewStep.tsx` classifier answers `I1` and `T1` for the same two shapes, i.e. is wrong by one code
— is independently confirmed.

## No point of Philippine law arose

`.planning/LAWYER-AGENDA.md` is untouched.

## Self-Check: FAILED
