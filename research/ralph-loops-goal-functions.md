# Ralph Loops with Goal Functions: ML-Inspired Convergence for Agent Iteration

> Applying machine learning training principles to Ralph loops: goal functions as loss functions, convergence detection, and principled stopping criteria.

**Status**: Research / Prototyping
**Created**: 2026-02-02
**Related**: [[knowledge-expansion-loop]], [[ingestion-pipeline-plan]]
**Origin**: Geoffrey Huntley's Ralph Wiggum Technique
**Source**: [The Ralph Playbook](https://github.com/ghuntley/how-to-ralph-wiggum)

---

## Table of Contents

1. [The Huntley Playbook Foundation](#the-huntley-playbook-foundation)
2. [The Core Insight: ML Meets Ralph](#the-core-insight-ml-meets-ralph)
3. [Goal Functions: Plain English Loss Functions](#goal-functions-plain-english-loss-functions)
4. [Convergence Detection](#convergence-detection)
5. [Steering & Backpressure](#steering--backpressure)
6. [Subagent Patterns](#subagent-patterns)
7. [The Goal Skill Format](#the-goal-skill-format)
8. [Test Case: Email Automation User Stories](#test-case-email-automation-user-stories)
9. [Failure Modes & Vectors](#failure-modes--vectors)
10. [Implementation: Loop Scripts & File Structure](#implementation-loop-scripts--file-structure)
11. [Enhancements from the Playbook](#enhancements-from-the-playbook)

---

## The Huntley Playbook Foundation

### 3 Phases, 2 Prompts, 1 Loop

The canonical Ralph pattern from Geoffrey Huntley:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    THE RALPH WORKFLOW                                        │
│                                                                              │
│  PHASE 1: REQUIREMENTS                                                      │
│  ├── Human + LLM conversation                                               │
│  ├── Identify Jobs-to-be-Done (JTBD)                                        │
│  ├── Break into Topics of Concern                                           │
│  └── Output: specs/*.md (one per topic)                                     │
│                                                                              │
│  PHASE 2: PLANNING (same loop, different prompt)                            │
│  ├── Gap analysis: specs vs existing code                                   │
│  ├── Generate prioritized task list                                         │
│  ├── NO implementation                                                       │
│  └── Output: IMPLEMENTATION_PLAN.md                                         │
│                                                                              │
│  PHASE 3: BUILDING (same loop, different prompt)                            │
│  ├── Pick highest-priority task from plan                                   │
│  ├── Implement with test validation                                         │
│  ├── Update plan, commit changes                                            │
│  └── Output: Working code + updated plan                                    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### The Elegantly Simple Loop

```bash
while :; do cat PROMPT.md | claude ; done
```

That's it. The magic is in:
- **Disk-resident state**: `IMPLEMENTATION_PLAN.md` persists between iterations
- **Fresh context each loop**: Agent reads updated plan from disk
- **File-based coordination**: No sophisticated orchestration needed

### Core File Structure

```
project-root/
├── loop.sh                    # Orchestration script
├── PROMPT_plan.md             # Planning mode instructions
├── PROMPT_build.md            # Building mode instructions
├── AGENTS.md                  # Operational how-to guide (~60 lines)
├── IMPLEMENTATION_PLAN.md     # Prioritized tasks (shared state)
├── specs/                     # Requirements (one per topic)
│   ├── authentication.md
│   ├── campaign-management.md
│   └── analytics.md
└── src/                       # Application code
```

### The AGENTS.md File

Single canonical operational guide - concise (~60 lines):
- How to build/run the project
- Test commands (targeted + full suite)
- Typecheck/lint commands
- Codebase patterns to discover

**NOT** a changelog or progress diary. Status belongs in `IMPLEMENTATION_PLAN.md`.

```markdown
# AGENTS.md - Operational Guide

## Build & Run
npm install
npm run dev

## Test Commands
npm test                    # Full suite
npm test -- --grep "auth"   # Targeted

## Typecheck & Lint
npm run typecheck
npm run lint

## Codebase Patterns
- Controllers in src/controllers/
- Services handle business logic
- Use existing error patterns in src/lib/errors.ts
```

### Key Language Patterns

| Pattern | Purpose |
|---------|---------|
| "study" (not "read") | Deep contextual analysis, not just file reading |
| "don't assume not implemented" | Prevent hallucinating new code when it exists |
| "using parallel subagents" | Spawn subagents for expensive exploration |
| "only 1 subagent for build/tests" | Control backpressure at validation |
| "capture the why" | Emphasize tests and implementation purpose |

---

## The Core Insight: ML Meets Ralph

### The Analogy

| ML Training | Ralph Loops |
|-------------|-------------|
| Loss function | Goal function (plain English) |
| Gradient descent | Iterative agent execution |
| Loss plateau detection | "No meaningful progress" detection |
| Early stopping | Convergence criteria |
| Batch size / epochs | Loop iterations |
| Learning rate | Scope per iteration |
| Convergence to minimum | Convergence to "goal satisfied" |

### Why This Matters

Ralph loops lack formal convergence theory. The original pattern is:

```bash
while :; do cat PROMPT.md | claude-code; done
```

This works but has problems:
- **No principled stopping** - Runs forever or until manual intervention
- **No progress signal** - Can't tell if loops are productive
- **No goal clarity** - Each loop interprets the task differently
- **No convergence detection** - Can't tell when "done"

By applying ML training intuitions, we get:
- **Explicit goal** - What are we optimizing toward?
- **Progress measurement** - Is each loop making meaningful progress?
- **Convergence signal** - When to stop (K loops with no delta)
- **Failure detection** - When the loop is stuck

---

## Goal Functions: Plain English Loss Functions

### What is a Goal Function?

In ML, the loss function defines what you're minimizing. In Ralph loops, the **goal function** defines what you're trying to achieve - expressed in plain English so the LLM can reason about it.

### Properties of a Good Goal Function

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      GOAL FUNCTION REQUIREMENTS                              │
│                                                                              │
│  1. MEASURABLE (by LLM reasoning)                                           │
│     ├── Can the LLM assess "did I make progress toward this?"               │
│     └── Can the LLM judge "is this goal satisfied?"                         │
│                                                                              │
│  2. BOUNDED                                                                  │
│     ├── Has a natural completion state                                      │
│     └── Not infinitely expandable                                           │
│                                                                              │
│  3. DECOMPOSABLE                                                             │
│     ├── Can be broken into smaller sub-goals                                │
│     └── Progress on sub-goals = progress on main goal                       │
│                                                                              │
│  4. SPECIFIC                                                                 │
│     ├── Clear enough that two loops would agree on progress                 │
│     └── Not so vague that anything counts as progress                       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Goal Function Examples

**Good Goal Functions:**
```
"Generate a comprehensive list of user stories for the email automation system,
covering all user types, all features, and all edge cases discoverable from
the codebase and documentation."

"Find all unhandled error cases in the authentication flow."

"Document every API endpoint with request/response schemas and examples."

"Identify all places where the codebase violates the style guide."
```

**Bad Goal Functions:**
```
"Make the code better."              # Not measurable, not bounded
"Find bugs."                         # Too vague, infinitely expandable
"Improve documentation."             # No completion criteria
"Optimize performance."              # No specific target
```

---

## Convergence Detection

### The Signal: Meaningful Progress

After each loop iteration, the LLM self-assesses:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        PROGRESS ASSESSMENT                                   │
│                                                                              │
│  At the end of each iteration, the agent answers:                           │
│                                                                              │
│  1. "Did I make meaningful progress toward the goal?"                       │
│     ├── YES: Describe what was added/discovered/fixed                       │
│     ├── PARTIAL: Made progress but hit a blocker                            │
│     └── NO: Could not find anything new to contribute                       │
│                                                                              │
│  2. "What remains to be done?"                                              │
│     ├── Specific remaining work                                             │
│     ├── Unknown gaps (things to explore)                                    │
│     └── Nothing - goal appears satisfied                                    │
│                                                                              │
│  3. "Confidence in completion" (0-100%)                                     │
│     └── How close are we to the goal being fully satisfied?                │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Convergence Criteria

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      CONVERGENCE DETECTION                                   │
│                                                                              │
│  The loop has CONVERGED when ANY of:                                        │
│                                                                              │
│  1. GOAL SATISFIED                                                          │
│     └── Agent reports confidence >= 95%                                     │
│     └── Agent explicitly states "goal is complete"                          │
│                                                                              │
│  2. PROGRESS PLATEAU                                                        │
│     └── Last K iterations (e.g., K=3) report "NO" progress                 │
│     └── Signal: we've exhausted what we can find                           │
│                                                                              │
│  3. DIMINISHING RETURNS                                                     │
│     └── Progress per iteration drops below threshold                        │
│     └── E.g., last 5 iterations each added < 2% to completion              │
│                                                                              │
│  4. MAX ITERATIONS                                                          │
│     └── Safety cap (e.g., 50 iterations)                                   │
│     └── Prevents runaway loops                                              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Visualizing Convergence

```
Progress per Iteration (conceptual)

     │
  5% │  ●
     │   ●  ●
  4% │       ●
     │        ●
  3% │         ●  ●
     │              ●
  2% │               ●  ●  ●
     │                       ●
  1% │                        ●  ●  ●
     │                                 ●  ●
  0% │─────────────────────────────────────●──●──●  ← CONVERGED
     └────────────────────────────────────────────────
       1  2  3  4  5  6  7  8  9  10 11 12 13 14 15 16  iterations

When 3 consecutive iterations show ~0% new progress, stop.
```

---

## Steering & Backpressure

### Two Directions of Control

From the Huntley Playbook: Ralph is steered in two directions.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      STEERING RALPH                                          │
│                                                                              │
│  UPSTREAM (Deterministic Setup)                                             │
│  ├── First ~5,000 tokens: specs, consistent file loading                   │
│  ├── Existing code patterns guide generation                                │
│  ├── AGENTS.md operational learnings                                        │
│  └── "Signs" Ralph discovers in the codebase                               │
│                                                                              │
│  DOWNSTREAM (Backpressure)                                                  │
│  ├── Tests reject invalid work                                              │
│  ├── Lints catch style violations                                          │
│  ├── Build failures block progress                                         │
│  └── LLM-as-judge for subjective criteria                                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Observational Tuning

> "Tune it like a guitar—instead of prescribing everything upfront, observe and adjust."

When Ralph fails a specific way:
1. **Don't rewrite the agent**
2. **Refine the signals**: adjust prompts, add utility functions
3. **Update AGENTS.md** with operational patterns
4. **Regenerate the plan** if needed (cheap: one planning loop)

The plan is disposable. If it's wrong, throw it out and start over.

### Backpressure Mechanisms

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      BACKPRESSURE TYPES                                      │
│                                                                              │
│  1. DETERMINISTIC BACKPRESSURE                                              │
│     ├── Tests: must pass before commit                                      │
│     ├── Types: typecheck must succeed                                       │
│     ├── Lints: style rules enforced                                         │
│     └── Build: compilation must work                                        │
│                                                                              │
│  2. NON-DETERMINISTIC BACKPRESSURE (LLM-as-Judge)                          │
│     ├── Tone: "warm, conversational, professional"                         │
│     ├── Aesthetics: "clear visual hierarchy"                               │
│     ├── UX feel: "intuitive primary action"                                │
│     └── Quality: subjective criteria as binary pass/fail                   │
│                                                                              │
│  3. CONVERGENCE BACKPRESSURE (Our Addition)                                 │
│     ├── Progress plateau: K iterations with no meaningful delta            │
│     ├── Confidence threshold: agent reports goal satisfied                 │
│     └── Diminishing returns: progress per iteration dropping               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### LLM-as-Judge Pattern

For subjective criteria that resist programmatic checks:

```typescript
// src/lib/llm-review.ts
interface ReviewResult {
  pass: boolean;
  feedback?: string;
}

function createReview(config: {
  criteria: string;        // What to evaluate
  artifact: string;        // Text content OR screenshot path
  intelligence?: "fast" | "smart";
}): Promise<ReviewResult>;
```

Example usage in tests:

```typescript
// Text evaluation
test("welcome tone", async () => {
  const result = await createReview({
    criteria: "warm, conversational, appropriate for professionals",
    artifact: welcomeMessage,
  });
  expect(result.pass).toBe(true);
});

// Vision evaluation
test("visual hierarchy", async () => {
  await page.screenshot({ path: "./tmp/dashboard.png" });
  const result = await createReview({
    criteria: "clear hierarchy with obvious primary action",
    artifact: "./tmp/dashboard.png",
  });
  expect(result.pass).toBe(true);
});
```

Ralph discovers these patterns in test examples during codebase exploration.

---

## Subagent Patterns

### Context Efficiency

With ~176K usable tokens from a 200K budget:
- **Tight tasks + 1 task per loop = 100% smart zone utilization**
- **Spawn subagents for expensive work** rather than polluting main context
- Each subagent gets ~156KB that's garbage-collected after use

### The Pattern: Parallel Reads, Sequential Writes

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      SUBAGENT SPAWNING                                       │
│                                                                              │
│  EXPLORATION (Parallel)                                                     │
│  ├── "Spawn up to 250 Sonnet subagents to study specs"                     │
│  ├── "Use parallel subagents to read codebase"                             │
│  └── Context is cheap; throw it away after                                 │
│                                                                              │
│  VALIDATION (Sequential)                                                    │
│  ├── "Only 1 subagent for build/tests"                                     │
│  ├── Bottleneck prevents divergent implementations                         │
│  └── Forces correctness before proceeding                                  │
│                                                                              │
│  KEY INSIGHT                                                                │
│  └── "Use the main agent/context as a scheduler;                           │
│       spawn subagents whenever possible instead"                           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### In Prompt Language

From the Huntley playbook prompts:

**Planning mode:**
```
Phase 0a - study the specifications using up to 250 parallel Sonnet subagents
Phase 0b - study the existing IMPLEMENTATION_PLAN.md
Phase 0c - study src/lib/* for utilities
Phase 0d - understand source code location
```

**Building mode:**
```
- Use up to 500 Sonnet subagents to read specs/code in parallel
- Use only 1 subagent for build/tests (backpressure bottleneck)
```

---

## The Goal Skill Format

A **Goal Skill** is a structured template that defines:
1. What the goal is
2. How to measure progress
3. What constitutes "done"
4. How to report findings

### Goal Skill Schema

```yaml
# goal-skill.yaml

goal_skill:
  name: "descriptive-name"
  version: "1.0"

  # The goal in plain English
  goal: |
    [Clear statement of what we're trying to achieve]

  # What does "done" look like?
  completion_criteria:
    - "[Criterion 1]"
    - "[Criterion 2]"
    - "[Criterion N]"

  # How should the agent approach this?
  approach:
    scope_per_iteration: |
      [What ONE thing should each iteration do?]

    exploration_strategy: |
      [How should the agent search for things to do?]

    output_format: |
      [How should findings be recorded?]

  # Progress tracking
  progress:
    tracking_file: "[path to progress file]"

    progress_question: |
      [The question the agent asks itself after each iteration]

    completion_threshold: 95  # percentage confidence to stop
    plateau_threshold: 3       # consecutive no-progress iterations to stop
    max_iterations: 50         # safety cap

  # Context the agent needs
  context:
    files_to_read:
      - "[path1]"
      - "[path2]"

    domain_knowledge: |
      [Any domain context the agent needs]

  # Output
  output:
    primary_file: "[path to main output]"
    format: "[markdown/yaml/json]"
```

### Example: The Prompt That Gets Fed to Each Loop

Each Ralph loop iteration receives this prompt (generated from the goal skill):

```markdown
# Goal

[goal from skill]

# Completion Criteria

[completion_criteria from skill]

# Your Task This Iteration

You are one iteration in a Ralph loop. Your job is to make ONE meaningful
contribution toward the goal above.

Scope: [scope_per_iteration from skill]

Strategy: [exploration_strategy from skill]

# Progress So Far

[Contents of tracking_file - what previous iterations have done]

# Instructions

1. Review what has been done
2. Identify ONE thing you can contribute
3. Do that thing
4. Update the progress file
5. Self-assess your progress

# Progress Report (required at end of iteration)

After completing your work, answer:

1. Did you make meaningful progress? (YES/PARTIAL/NO)
2. What did you add/discover/fix?
3. What remains to be done?
4. Confidence that goal is satisfied: __%

If you cannot find anything new to contribute, say so explicitly.
This is how we detect convergence.
```

---

## Test Case: Email Automation User Stories

### The Goal

Generate a completely exhaustive list of user stories and user journeys for an email automation software project.

### Goal Skill: Email Automation User Stories

```yaml
goal_skill:
  name: "email-automation-user-stories"
  version: "1.0"

  goal: |
    Generate a comprehensive, exhaustive list of user stories and user journeys
    for the email automation software. This should cover:

    - All user types (admin, marketer, developer, end recipient, etc.)
    - All features (campaign creation, scheduling, analytics, integrations, etc.)
    - All edge cases (errors, rate limits, bounces, unsubscribes, etc.)
    - All workflows (onboarding, daily use, troubleshooting, etc.)

    The goal is to have a complete picture of every way a user might interact
    with the system, every problem they might encounter, and every outcome
    they might want.

  completion_criteria:
    - "All user types identified and have stories"
    - "All major features covered from each relevant user's perspective"
    - "Edge cases and error scenarios documented"
    - "User journeys show end-to-end flows, not just isolated actions"
    - "Stories follow standard format: As a [user], I want [action], so that [benefit]"
    - "No obvious gaps when reviewing against codebase/docs"

  approach:
    scope_per_iteration: |
      Each iteration should focus on ONE of:
      - A new user type not yet covered
      - A new feature area not yet covered
      - Edge cases for a feature already covered
      - Connecting existing stories into journeys
      - Reviewing for gaps and adding missing stories

      Do NOT try to cover everything. Do ONE focused thing well.

    exploration_strategy: |
      1. First iterations: Identify user types from codebase (roles, permissions)
      2. Next: Map features from routes, controllers, UI components
      3. Then: For each (user type, feature) pair, generate stories
      4. Then: Look at error handling code to find edge cases
      5. Then: Connect stories into journeys
      6. Finally: Review for gaps, compare against any existing docs

    output_format: |
      Add stories to the output file in this format:

      ## [User Type]: [Persona Name]

      ### [Feature Area]

      - **US-XXX**: As a [user], I want [action], so that [benefit]
        - Acceptance criteria: [list]
        - Edge cases: [list]

      ### User Journey: [Journey Name]

      1. [Step 1 - links to US-XXX]
      2. [Step 2 - links to US-YYY]
      ...

  progress:
    tracking_file: "research/email-automation-user-stories-progress.md"

    progress_question: |
      After this iteration:
      1. What user type or feature area did you cover?
      2. How many new user stories did you add?
      3. What areas are still unexplored?
      4. Confidence that we have exhaustive coverage: __%

    completion_threshold: 95
    plateau_threshold: 5  # need more iterations before giving up (large scope)
    max_iterations: 100   # this is a big task

  context:
    files_to_read:
      - "src/routes/**/*.ts"
      - "src/controllers/**/*.ts"
      - "src/models/**/*.ts"
      - "docs/**/*.md"
      - "README.md"

    domain_knowledge: |
      Email automation systems typically handle:
      - Campaign management (create, schedule, send, track)
      - Contact/list management (import, segment, clean)
      - Template management (design, personalize, test)
      - Analytics (opens, clicks, conversions, bounces)
      - Integrations (CRM, e-commerce, webhooks)
      - Compliance (unsubscribe, GDPR, CAN-SPAM)
      - Deliverability (reputation, authentication, warming)

      Common user types:
      - Marketing manager (strategy, oversight)
      - Campaign operator (day-to-day execution)
      - Developer (integrations, custom logic)
      - Admin (settings, users, billing)
      - Email recipient (the actual person receiving emails)

  output:
    primary_file: "docs/user-stories/email-automation-complete.md"
    format: "markdown"
```

### What the Loop Execution Looks Like

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    RALPH LOOP: EMAIL AUTOMATION USER STORIES                 │
└─────────────────────────────────────────────────────────────────────────────┘

ITERATION 1:
├── Focus: Identify all user types from codebase
├── Action: Scanned src/models/User.ts, found roles: admin, marketer, viewer
├── Action: Scanned permissions system, found: campaign_create, list_manage, etc.
├── Output: Added "User Types" section with 5 personas
├── Progress: YES - foundational work
├── Confidence: 10%
└── Commit: "user-stories: identify user types from codebase"

ITERATION 2:
├── Focus: Map feature areas from routes
├── Action: Scanned src/routes/, found: campaigns, lists, templates, analytics
├── Output: Added feature area skeleton with placeholder sections
├── Progress: YES - mapped 8 feature areas
├── Confidence: 15%
└── Commit: "user-stories: map feature areas"

ITERATION 3:
├── Focus: User stories for Marketing Manager + Campaigns
├── Action: Read campaign controller, identified key actions
├── Output: Added 12 user stories for marketer campaign management
├── Progress: YES - substantial content
├── Confidence: 25%
└── Commit: "user-stories: marketer campaign stories"

ITERATION 4:
├── Focus: User stories for Developer + API/Integrations
├── Action: Read API routes, webhook handlers
├── Output: Added 15 user stories for developer integration work
├── Progress: YES - substantial content
├── Confidence: 35%
└── Commit: "user-stories: developer integration stories"

... iterations 5-20 cover remaining (user type, feature) pairs ...

ITERATION 21:
├── Focus: Edge cases for campaign sending
├── Action: Read error handlers, retry logic
├── Output: Added 8 edge case stories (bounces, rate limits, failures)
├── Progress: YES - important coverage
├── Confidence: 70%
└── Commit: "user-stories: campaign sending edge cases"

... iterations 22-30 cover remaining edge cases ...

ITERATION 31:
├── Focus: User journey - First Campaign
├── Action: Connected existing stories into onboarding flow
├── Output: Added journey: "First Campaign" (12 steps)
├── Progress: YES - valuable synthesis
├── Confidence: 80%
└── Commit: "user-stories: first campaign journey"

... iterations 32-35 add more journeys ...

ITERATION 36:
├── Focus: Gap review - compare against docs
├── Action: Compared story list against README, found 2 missing features
├── Output: Added 4 stories for missing features
├── Progress: YES - caught gaps
├── Confidence: 90%
└── Commit: "user-stories: gap review additions"

ITERATION 37:
├── Focus: Gap review - re-scan codebase
├── Action: Searched for untouched controllers, found nothing new
├── Progress: NO - nothing new found
├── Confidence: 92%
└── No commit

ITERATION 38:
├── Focus: Gap review - error handling patterns
├── Action: Searched for error patterns, all covered
├── Progress: NO - nothing new found
├── Confidence: 93%
└── No commit

ITERATION 39:
├── Focus: Final review - read full output for gaps
├── Action: Read all stories, found 1 minor gap in analytics
├── Output: Added 2 stories for analytics export
├── Progress: PARTIAL - minor addition
├── Confidence: 95%
└── Commit: "user-stories: analytics export stories"

ITERATION 40:
├── Focus: Attempt to find any remaining gaps
├── Action: Exhaustive search, nothing found
├── Progress: NO - nothing new
├── Confidence: 96%
└── No commit

ITERATION 41:
├── Focus: Attempt to find any remaining gaps
├── Progress: NO - nothing new
├── Confidence: 96%
└── No commit

ITERATION 42:
├── Focus: Attempt to find any remaining gaps
├── Progress: NO - nothing new
├── Confidence: 96%
└── CONVERGED: 3 consecutive NO progress iterations

FINAL STATE:
├── Total iterations: 42
├── User stories generated: 156
├── User journeys documented: 8
├── User types covered: 5
├── Feature areas covered: 12
├── Edge cases documented: 34
└── Coverage confidence: 96%
```

---

## Failure Modes & Vectors

### What Can Go Wrong

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FAILURE MODES                                        │
│                                                                              │
│  1. PREMATURE CONVERGENCE                                                   │
│     ├── Symptom: Loop stops before goal is truly satisfied                  │
│     ├── Cause: Agent too easily says "NO progress"                          │
│     ├── Fix: Require higher confidence, lower plateau threshold             │
│     └── Detect: Output clearly missing obvious items                        │
│                                                                              │
│  2. INFINITE LOOP (Never Converges)                                         │
│     ├── Symptom: Keeps running, always finds "something"                    │
│     ├── Cause: Goal unbounded, agent too creative                           │
│     ├── Fix: Tighten goal, add max iterations                               │
│     └── Detect: Iteration count >> expected                                 │
│                                                                              │
│  3. CIRCULAR ADDITIONS                                                      │
│     ├── Symptom: Loop keeps "adding" same things with slight variations     │
│     ├── Cause: Not tracking what's been done, no deduplication              │
│     ├── Fix: Better progress tracking, explicit "already covered" checks    │
│     └── Detect: Output has near-duplicates                                  │
│                                                                              │
│  4. SHALLOW COVERAGE                                                        │
│     ├── Symptom: Many items but all surface-level                          │
│     ├── Cause: Agent optimizing for quantity over quality                   │
│     ├── Fix: Explicit depth requirements in goal                            │
│     └── Detect: Edge cases missing, journeys don't connect                  │
│                                                                              │
│  5. DRIFT FROM GOAL                                                         │
│     ├── Symptom: Later iterations produce irrelevant content               │
│     ├── Cause: Agent loses sight of original goal                          │
│     ├── Fix: Re-inject goal statement each iteration                       │
│     └── Detect: Human review shows tangential content                       │
│                                                                              │
│  6. CONTEXT EXHAUSTION                                                      │
│     ├── Symptom: Agent "forgets" earlier work, redoes it                   │
│     ├── Cause: Progress file too large for context                         │
│     ├── Fix: Summarize progress file, use structured format                │
│     └── Detect: Duplicate work in output                                    │
│                                                                              │
│  7. FALSE COMPLETION                                                        │
│     ├── Symptom: Agent claims 95%+ but obvious gaps exist                  │
│     ├── Cause: Agent overconfident or didn't explore properly              │
│     ├── Fix: Require explicit coverage checklist                           │
│     └── Detect: Human spot-check finds gaps                                │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Mitigation Strategies

| Failure Mode | Primary Mitigation | Secondary Mitigation |
|--------------|-------------------|---------------------|
| Premature convergence | Higher plateau threshold (5-10) | Explicit coverage checklist |
| Infinite loop | Max iterations cap | Diminishing returns detection |
| Circular additions | Structured progress tracking | Deduplication check each iteration |
| Shallow coverage | Depth requirements in goal | Edge case exploration phase |
| Goal drift | Re-inject goal every iteration | Periodic alignment check |
| Context exhaustion | Summarized progress format | Chunked progress files |
| False completion | Coverage checklist | Human validation trigger |

---

## Implementation: Loop Scripts & File Structure

### The Huntley loop.sh

Enhanced loop script from the playbook:

```bash
#!/bin/bash
# loop.sh - Ralph Loop Orchestrator

set -e

MODE=${1:-build}  # "plan" or "build" (default: build)
MAX_ITERATIONS=${2:-999}

# Select prompt based on mode
case $MODE in
  plan)
    PROMPT_FILE="PROMPT_plan.md"
    ;;
  build|*)
    PROMPT_FILE="PROMPT_build.md"
    ;;
esac

iteration=0

while [ $iteration -lt $MAX_ITERATIONS ]; do
    echo "=== Iteration $iteration (mode: $MODE) ==="

    # Run Claude with full autonomy (requires sandbox!)
    cat "$PROMPT_FILE" | claude \
        -p \
        --dangerously-skip-permissions \
        --output-format=stream-json \
        --model opus

    # Git push after each iteration
    git push origin HEAD 2>/dev/null || true

    ((iteration++))
done

echo "Completed $iteration iterations"
```

**Critical flags:**
- `-p` (headless mode)
- `--dangerously-skip-permissions` (full autonomy - REQUIRES SANDBOX)
- `--model opus` (complex reasoning)

### Sandbox Requirements

> "It's not if it gets popped, it's when. What's the blast radius?"

Running with `--dangerously-skip-permissions` requires isolation:
- **Local**: Docker container
- **Production**: Fly Sprites, E2B, or similar
- **Credentials**: Minimum viable set only
- **Network**: Restricted access

### The Orchestration Layer (Goal Skill Integration)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    RALPH LOOP ORCHESTRATOR                                   │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  1. LOAD GOAL SKILL                                                  │   │
│   │     - Parse goal-skill.yaml                                         │   │
│   │     - Initialize progress file                                      │   │
│   │     - Set iteration counter = 0                                     │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                     │                                        │
│                                     ▼                                        │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  2. CHECK CONVERGENCE                                                │   │
│   │     - Read progress file                                            │   │
│   │     - Check: iterations >= max? → STOP                              │   │
│   │     - Check: confidence >= threshold? → STOP                        │   │
│   │     - Check: last K iterations all NO progress? → STOP              │   │
│   │     - Else: continue                                                │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                     │                                        │
│                                     ▼                                        │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  3. BUILD PROMPT                                                     │   │
│   │     - Inject goal, criteria, approach from skill                    │   │
│   │     - Inject progress so far from tracking file                     │   │
│   │     - Inject context files                                          │   │
│   │     - Add progress report template                                  │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                     │                                        │
│                                     ▼                                        │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  4. EXECUTE ITERATION                                                │   │
│   │     - cat PROMPT.md | claude-code                                   │   │
│   │     - Agent does work, updates output file                          │   │
│   │     - Agent writes progress report                                  │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                     │                                        │
│                                     ▼                                        │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  5. PARSE PROGRESS REPORT                                            │   │
│   │     - Extract: progress (YES/PARTIAL/NO)                            │   │
│   │     - Extract: confidence percentage                                │   │
│   │     - Extract: what was done                                        │   │
│   │     - Append to progress tracking file                              │   │
│   │     - Increment iteration counter                                   │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                     │                                        │
│                                     ▼                                        │
│                              [Loop back to 2]                               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Progress File Format

```markdown
# Progress Tracking: [Goal Skill Name]

## Metadata
- Started: 2026-02-02 10:00
- Iterations: 15
- Current confidence: 65%
- Last progress: YES

## Iteration Log

### Iteration 15 - 2026-02-02 10:45
- **Focus**: Edge cases for list management
- **Progress**: YES
- **Added**: 6 user stories for list import errors
- **Confidence**: 65%
- **Remaining**: Analytics edge cases, user journeys

### Iteration 14 - 2026-02-02 10:42
- **Focus**: Developer API stories
- **Progress**: YES
- **Added**: 12 user stories for webhook integration
- **Confidence**: 58%
- **Remaining**: Edge cases, journeys

[... earlier iterations ...]

## Coverage Summary

### User Types
- [x] Marketing Manager (15 stories)
- [x] Campaign Operator (22 stories)
- [x] Developer (18 stories)
- [x] Admin (12 stories)
- [ ] Email Recipient (0 stories) ← GAP

### Feature Areas
- [x] Campaigns (25 stories)
- [x] Lists (18 stories)
- [x] Templates (12 stories)
- [ ] Analytics (5 stories) ← NEEDS MORE
- [ ] Integrations (8 stories) ← NEEDS MORE
```

### Simple Bash Orchestrator

```bash
#!/bin/bash
# ralph-with-goal.sh

GOAL_SKILL=$1
MAX_ITERATIONS=50
PLATEAU_THRESHOLD=3

iteration=0
no_progress_count=0

while [ $iteration -lt $MAX_ITERATIONS ]; do
    echo "=== Iteration $iteration ==="

    # Build and run prompt
    ./build-prompt.sh "$GOAL_SKILL" > /tmp/prompt.md
    cat /tmp/prompt.md | claude-code 2>&1 | tee /tmp/iteration-output.txt

    # Parse progress from output
    progress=$(grep "Progress:" /tmp/iteration-output.txt | tail -1)
    confidence=$(grep "Confidence:" /tmp/iteration-output.txt | tail -1 | grep -oP '\d+')

    # Update tracking
    echo "Iteration $iteration: $progress (confidence: $confidence%)" >> progress.log

    # Check convergence
    if [ "$confidence" -ge 95 ]; then
        echo "CONVERGED: confidence threshold reached"
        break
    fi

    if echo "$progress" | grep -q "NO"; then
        ((no_progress_count++))
        if [ $no_progress_count -ge $PLATEAU_THRESHOLD ]; then
            echo "CONVERGED: plateau threshold reached"
            break
        fi
    else
        no_progress_count=0
    fi

    ((iteration++))
    sleep 5
done

echo "Completed after $iteration iterations"
```

---

## Enhancements from the Playbook

### 1. Acceptance-Driven Backpressure

Connect acceptance criteria (in specs) directly to test requirements (in plan):

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ACCEPTANCE → TEST FLOW                                    │
│                                                                              │
│  SPECS (acceptance criteria)                                                │
│  └── "User can reset password via email"                                   │
│                     ↓                                                        │
│  PLANNING (derive required tests)                                           │
│  └── "Task: Implement password reset"                                       │
│      └── Required tests: reset_email_sent, reset_link_works, ...           │
│                     ↓                                                        │
│  BUILDING (implement + test)                                                │
│  └── All required tests must pass before commit                            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

Criteria should specify WHAT to verify (behavioral outcomes), not HOW to implement.

### 2. Ralph-Friendly Work Branches

Scope planning at branch creation, not task selection:

```bash
# Create scoped plan on work branch
./loop.sh plan-work "user authentication with OAuth"

# Build from already-scoped plan
./loop.sh 20
```

Each branch gets one `IMPLEMENTATION_PLAN.md`. Ralph picks "most important" with zero filtering.

**Why this works**: Scoping at plan creation (deterministic) vs task selection (probabilistic).

### 3. JTBD → Story Map → SLC Release

Ground activities in audience context:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    JTBD → SLC FLOW                                           │
│                                                                              │
│  1. DEFINE AUDIENCE & JTBD                                                  │
│     └── AUDIENCE_JTBD.md: WHO and their desired OUTCOMES                   │
│                                                                              │
│  2. DEFINE ACTIVITIES                                                       │
│     └── specs/*: WHAT users do, capability depths                          │
│                                                                              │
│  3. SEQUENCE INTO JOURNEY MAP                                               │
│     └── Visualize activities flowing into each other                       │
│                                                                              │
│  4. DETERMINE SLC SLICE                                                     │
│     ├── Simple: Narrow, achievable                                         │
│     ├── Lovable: People want to use it                                     │
│     └── Complete: Fully accomplishes a job (not broken preview)            │
│                                                                              │
│  5. CREATE RELEASE PLAN                                                     │
│     └── IMPLEMENTATION_PLAN.md scoped to SLC slice                         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4. AskUserQuestionTool for Requirements

During Phase 1, use Claude's built-in questioning:

```
"Interview me using AskUserQuestion to understand [topic/acceptance criteria]"
```

Claude asks targeted questions until clear, then writes specs. No code changes needed.

### 5. Goal Functions + Convergence (Our Addition)

This document's contribution: applying ML training intuitions to Ralph:

| ML Concept | Ralph Application |
|------------|-------------------|
| Loss function | Goal function (plain English) |
| Gradient descent | Iterative agent execution |
| Early stopping | Convergence detection |
| Learning rate | Scope per iteration |
| Batch training | Multiple loops with shared state |

**Key addition**: Explicit convergence criteria based on:
- Progress plateau (K consecutive NO-progress iterations)
- Confidence threshold (agent self-reports goal satisfied)
- Diminishing returns (progress per iteration declining)

---

## Terminology Reference

| Term | Definition |
|------|-----------|
| **JTBD** | Job to be Done - high-level user outcome |
| **Topic of Concern** | Distinct aspect within a JTBD |
| **Spec** | Requirements for one topic (`specs/FILENAME.md`) |
| **Task** | Unit of work from specs-vs-code gap analysis |
| **Goal Function** | Plain English "loss function" for non-code Ralph |
| **Goal Skill** | Structured template defining goal + approach + convergence |
| **Backpressure** | Forces that reject invalid work (tests, lints, LLM-judge) |
| **Convergence** | State where further iterations yield no meaningful progress |

**Scope Test**: Describe a topic in one sentence without "and". If you need "and", it's multiple topics.

---

## Next Steps

1. **Test the goal skill format** - Run email automation user stories on a real codebase
2. **Tune convergence parameters** - Find right plateau_threshold and confidence_threshold
3. **Build progress parser** - Extract structured data from agent output
4. **Create skill library** - Common goal skills for documentation, bug finding, etc.
5. **Integrate with Huntley loop.sh** - Combine goal skills with standard Ralph prompts
6. **Add LLM-as-judge backpressure** - For subjective quality criteria

---

## References

- [The Ralph Playbook - github.com/ghuntley](https://github.com/ghuntley/how-to-ralph-wiggum)
- [Everything is a Ralph Loop - ghuntley.com](https://ghuntley.com/loop/)
- [Ralph Wiggum Technique - ghuntley.com](https://ghuntley.com/ralph/)
- [Inventing the Ralph Wiggum Loop - Dev Interrupted](https://linearb.io/dev-interrupted/podcast/inventing-the-ralph-wiggum-loop)
- [[knowledge-expansion-loop]] - Related fixed-point iteration concept
- ML Concepts: Gradient Descent, Early Stopping, Loss Plateaus, Convergence
