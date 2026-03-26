# QA-Driven Development Skill — Design Spec

## Overview

A new superpowers skill that layers a QA-contract-first methodology on top of the existing brainstorming → planning → building flow. The core insight: separate the agent that builds from the agent that judges, and make the QA specification a first-class artifact that exists before any code is written.

Inspired by [Anthropic's harness design for long-running apps](https://www.anthropic.com/engineering/harness-design-long-running-apps) and validated by the [premature convergence problem](../../../docs/plans/2026-03-06-loop-premature-convergence.md) observed in prior forward loops.

## Problem

Current superpowers flow (brainstorming → writing-plans → subagent-driven-development) produces working code but consistently under-tests and converges prematurely:

- Builder agents exhibit self-evaluation bias — they write QA that validates what they built, not what was specified
- Convergence checks are introspective (compiles, tests pass) rather than extrospective (app actually works in a browser)
- QA is an afterthought bolted onto the review phase, not a contract that drives implementation
- Stub-first architecture creates the illusion of progress — hundreds of files, passing tests, but placeholder content everywhere

## Solution

Two new skills that compose with existing superpowers:

1. **`qa-driven-development`** — Orchestrator skill. User-facing entry point. Controls the phase flow and enforces gates.
2. **`qa-specification`** — QA agent's playbook. Invoked by the orchestrator, never directly by the user.

## Skill Structure

### qa-driven-development/SKILL.md

The orchestrator. Manages five phases:

1. Design spec (delegates to `superpowers:brainstorming`)
2. QA spec generation (delegates to `qa-specification`)
3. Implementation plan (delegates to `superpowers:writing-plans`)
4. Build loop (delegates to `superpowers:subagent-driven-development` with QA gates)
5. Final verification and convergence

### qa-specification/SKILL.md

The QA agent's dedicated skill. Contains:

- How to read a design spec and generate a QA spec
- The append-only rule (expandable, never shrinkable)
- Verification methods per item type (playwright / test-exists / static-check)
- How to handle builder proposals
- How to run independent discovery passes
- Pass/fail verdict logic

### File Outputs

- **QA spec:** `docs/superpowers/qa/YYYY-MM-DD-<feature>-qa-spec.md` — the contract, append-only
- **QA state:** `docs/superpowers/qa/YYYY-MM-DD-<feature>-qa-state.yaml` — the scoreboard, updated every run

## Phase Flow

```
USER INVOKES: qa-driven-development

PHASE 1: DESIGN SPEC
├─ Invoke superpowers:brainstorming
│   ├─ Explore context, ask questions, propose approaches
│   ├─ Present design section by section
│   ├─ Write design spec
│   ├─ Spec self-review
│   └─ User reviews spec ← GATE
│
│   (brainstorming normally invokes writing-plans here — orchestrator intercepts)

PHASE 2: QA SPEC
├─ Dispatch QA agent subagent (using qa-specification skill)
│   ├─ Reads the approved design spec
│   ├─ Generates QA spec: user-story-level flows → test-case-level items
│   ├─ Tags each item with verification method
│   ├─ Writes QA spec file (markdown)
│   ├─ Writes QA state file (YAML, all items pending)
│   └─ Returns to orchestrator
├─ Orchestrator presents QA spec to user
├─ User reviews QA spec ← GATE
│   (user can add or reword items, never remove)

PHASE 3: IMPLEMENTATION PLAN
├─ Invoke superpowers:writing-plans
│   ├─ Reads BOTH the design spec AND the QA spec
│   ├─ Plans tasks knowing each will face QA verification
│   └─ User reviews plan ← GATE
├─ QA agent updates state file:
│   Maps each QA item → testable_after: task_N

PHASE 4: BUILD LOOP
├─ Invoke superpowers:using-git-worktrees
├─ FOR EACH TASK:
│   ├─ Dispatch builder subagent (reads QA spec, cannot modify)
│   ├─ Spec compliance review (existing superpowers two-stage)
│   ├─ Code quality review (existing superpowers two-stage)
│   ├─ Dispatch QA subagent:
│   │   ├─ Evaluate all items where testable_after <= current_task
│   │   ├─ Run verification per item (playwright/test-exists/static-check)
│   │   ├─ Process builder QA_PROPOSALS (accept → append, reject → note)
│   │   ├─ Independent discovery pass
│   │   ├─ Update state file with pass/fail + evidence
│   │   └─ Verdict: all testable items pass → ✅, any fail → ❌
│   ├─ If ❌: dispatch new builder subagent with failure report → fix → re-review → QA re-evaluates
│   ├─ Escape hatch: 3 failures on same item → escalate to user
│   └─ Mark task complete

PHASE 5: FINAL VERIFICATION
├─ QA agent runs FULL spec (all items, no scoping)
├─ Discovery sweep:
│   ├─ Navigate every route
│   ├─ Try every form, button, interactive element
│   ├─ Check console for errors
│   ├─ Look for placeholder text, stubs, broken assets
│   └─ New findings → append to spec → must also pass
├─ Convergence: 100% pass + discovery sweep finds nothing new
├─ If not converged: builder fixes → QA re-runs → loop
└─ Invoke superpowers:finishing-a-development-branch
```

## QA Spec Format

### Spec File (markdown, append-only)

```markdown
# QA Spec: <Feature Name>

## Flows

### F1: <Flow Name>
> User-story level description

#### Test Cases

- **F1.1**: <test case description>
  - Verification: [playwright]
  - Steps:
    1. Navigate to /path
    2. Click "Button"
    3. Verify: element shows expected value
  - Expected: <concrete expected outcome>

- **F1.2**: <test case description>
  - Verification: [test-exists]
  - Covers: <function or endpoint name>
  - Expected: <what the test should assert>

- **F1.3**: <test case description>
  - Verification: [static-check]
  - Check: <what to look for in code>
  - Expected: <no stubs, no hardcoded values, etc.>
```

### State File (YAML, updated every run)

```yaml
last_run: 2026-03-26T14:30:00Z
current_task: 5
summary:
  total: 24
  testable_now: 18
  passed: 16
  failed: 2
  pending: 6

items:
  F1.1:
    status: passed
    testable_after: task_2
    last_verified: 2026-03-26T14:30:00Z
    evidence: "screenshot: qa/evidence/f1-1-result.png"
  F1.2:
    status: failed
    testable_after: task_3
    last_verified: 2026-03-26T14:30:00Z
    evidence: "no test found for calculateInterest()"
    failure_detail: "Expected test in __tests__/computation.test.ts, not found"
  F1.3:
    status: pending
    testable_after: task_8
```

### Spec Rules

- Items get stable IDs (F1.1, F1.2) — never renumbered
- New items appended with next available ID
- Items can never be removed or weakened, only added or made more specific
- State file records evidence so failures are actionable

## Agent Roles and Boundaries

### Builder Agent

- **Can read:** design spec, QA spec (read-only), plan, codebase
- **Cannot touch:** QA spec file, QA state file
- **Can do:** propose QA additions via structured QA_PROPOSALS block:
  ```
  QA_PROPOSALS:
  - flow: F1
    description: "Discovered 3 computation types, only pre-judgment is covered"
    suggested_cases:
      - "Post-judgment computation with different rate calculation"
      - "Contractual computation with custom rate input"
  ```
- **Prompt emphasis:** "You satisfy the QA spec. You do not judge whether the QA spec is sufficient."

### QA Agent

- **Can read:** design spec, QA spec, QA state, codebase, running app (via Playwright)
- **Can write:** QA spec (append only), QA state (update freely)
- **Cannot touch:** application source code, test files, plan
- **Prompt emphasis:** "You are a skeptic. The builder's report is a claim, not evidence. Verify everything yourself."

### Reviewers (existing superpowers)

- Spec compliance reviewer and code quality reviewer operate unchanged
- Sit between builder and QA agent in the flow
- Review code quality and plan adherence — QA agent reviews behavioral correctness

### The Hard Wall

The builder never writes QA. The QA agent never writes code. Communication between roles happens through structured artifacts (proposals, failure reports), never by crossing into the other's files.

## QA Gate Mechanics

### Per-Task Gating (Phase 4)

- QA agent determines which items are testable based on `testable_after` mapping
- The set of enforceable items monotonically grows as tasks complete
- Hard gate: ALL currently-testable items must pass before next task
- Zero tolerance — any single failure blocks progress

### Failure Loop

1. QA agent returns failure report with: item ID, evidence, reproduction steps
2. Orchestrator dispatches new builder subagent with failure report + task spec + QA spec
3. Builder fixes, commits
4. Reviewers re-check the fix
5. QA agent re-evaluates ALL testable items (a fix can break something else)
6. Loop until all testable items pass
7. Escape hatch: 3 failures on same item → escalate to user

### Convergence (Phase 5)

- Every item in the full QA spec must pass (no more testable_after scoping)
- Discovery sweep actively hunts for gaps beyond the spec
- Convergence = 100% pass rate AND discovery sweep finds zero new failing items
- QA agent declares convergence, not the builder or orchestrator

## Verification Methods

Each QA spec item declares its verification method:

### [playwright]
- QA agent launches the app, navigates, clicks, fills forms
- Takes screenshots as evidence
- Checks browser console for errors
- Used for: UI flows, form submissions, navigation, visual correctness

### [test-exists]
- QA agent inspects the test suite for coverage of the specified function/endpoint
- Verifies the test asserts the expected behavior (not just that a test file exists)
- Used for: API endpoints, business logic, data transformations, edge cases

### [static-check]
- QA agent reads source code looking for specific patterns
- Checks for: stubs, placeholders, hardcoded values, TODO comments, empty handlers
- Used for: code completeness, no Potemkin village files

## Composition with Existing Superpowers

This skill layers on top of existing superpowers skills — it does not replace or fork them:

| Phase | Existing Skill Used | What's Added |
|-------|-------------------|--------------|
| Design spec | `superpowers:brainstorming` | Orchestrator intercepts before writing-plans |
| QA spec | — | New: `qa-specification` skill |
| Plan | `superpowers:writing-plans` | Plan reads QA spec as input |
| Build | `superpowers:subagent-driven-development` | QA gate added after each task |
| Review | `superpowers:requesting-code-review` | Unchanged, runs before QA gate |
| Finish | `superpowers:finishing-a-development-branch` | Unchanged, runs after convergence |
| Worktrees | `superpowers:using-git-worktrees` | Unchanged |

## Key Design Decisions

1. **QA spec before plan, not after** — The plan is written knowing what QA will enforce. This prevents plans that are structurally sound but untestable.
2. **Append-only QA spec** — Prevents scope shrinkage under pressure. The spec can only grow.
3. **Builder proposes, QA agent decides** — Builder can flag discoveries but cannot modify the contract it's measured against.
4. **QA agent does independent discovery** — Doesn't rely solely on builder honesty. Explores the running app on its own.
5. **Tiered verification methods** — Right tool for the right check. Not everything needs Playwright.
6. **3-strike escalation** — Prevents infinite fix loops. Human judgment for genuinely hard problems.
7. **QA agent declares convergence** — The skeptic, not the builder, decides when the app is done.
