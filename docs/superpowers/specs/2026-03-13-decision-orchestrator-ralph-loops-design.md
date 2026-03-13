# Decision Orchestrator — Ralph Loop Infrastructure

**Date**: 2026-03-13
**Status**: Approved
**Scope**: Port the monorepo's ralph loop system into the decision-orchestrator repo as a self-contained, permanent dev workflow

## Context

The monorepo has a battle-tested autonomous loop system ("ralph loops") that runs Claude Code repeatedly until convergence. Two types:

- **Reverse loops**: Analyze, research, and spec out features (produce documentation)
- **Forward loops**: Build, test, and verify implementations stage-by-stage (produce code)

The decision-orchestrator already has one converged reverse loop (`dec-oc-ssr-tools-reverse`) but lacks the full infrastructure: no registry, no CI workflow, and templates are generic (fullstack-rust-wasm) rather than project-specific.

## Goal

Make ralph loops a first-class dev workflow in the decision-orchestrator repo. Every new feature or tool can be specced via a reverse loop and implemented via a forward loop, with all hard-won lessons from the monorepo baked in from day one.

## Approach

Mirror the monorepo's proven infrastructure with project-specific adaptations. Manual-dispatch CI only (no cron). One template tailored to the decision-orchestrator's patterns (FCIS architecture, tool system, pytest, Supabase).

## Deliverables

### 1. `loops/_registry.yaml` — Loop Registry

Central source of truth for all loops. Same schema as the monorepo registry.

```yaml
# Ralph Loop Registry
# CI reads this to discover which loops to run.
# Status: active | paused | converged

loops:
  dec-oc-ssr-tools-reverse:
    description: "Spec SSR consumer panel tools for Daimon — simulated focus groups via Discord"
    type: reverse
    max_iterations: 40
    timeout_minutes: 30
    status: converged
    created: 2026-03-01
    converged_at: 2026-03-01
```

Fields per loop:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `description` | string | yes | What the loop does |
| `type` | `reverse` \| `forward` | yes | Analysis or implementation |
| `max_iterations` | int | yes | Safety cap |
| `timeout_minutes` | int | yes | Per-iteration timeout |
| `status` | `active` \| `paused` \| `converged` | yes | Current state |
| `created` | date | yes | When the loop was created |
| `converged_at` | date | no | When convergence was reached |
| `paused_at` | date | no | When paused |
| `paused_reason` | string | no | Why paused |

### 2. `loops/loop.sh` — Standardized Runner

Based on the monorepo's latest runner (`loops/daimon-saas-reverse/loop.sh`) with one bug fix: the timeout warning message says "1800s" but the actual timeout is 21600s — fix the message to match. Each loop directory gets a copy of this file (not a symlink, to avoid shallow-checkout issues in CI).

Key parameters:
- **Per-iteration timeout**: 21600s (6 hours)
- **Max iterations**: Configurable via argument (default 40)
- **Failure tolerance**: 3 consecutive failures → stop
- **Sleep between iterations**: 5s
- **Convergence detection**: Checks for `status/converged.txt` after each iteration
- **Pause detection**: Checks for `status/paused.txt` before starting

The runner is project-agnostic. It pipes `PROMPT.md` into `claude --print --dangerously-skip-permissions` and commits after each iteration.

### 3. `.github/workflows/ralph-loops.yml` — CI Workflow

Manual-dispatch only. No cron schedule.

**Trigger:**
```yaml
on:
  workflow_dispatch:
    inputs:
      loop:
        description: "Run a specific loop name, or 'all' for all active loops"
        required: false
        default: "all"
```

**Jobs:**

**discover** — Parse `loops/_registry.yaml`, emit matrix of active loops (or specific loop if named). When `loop=all`, only **reverse** loops with `status: active` are discovered — forward loops must be dispatched by name (e.g., `gh workflow run ralph-loops.yml -f loop=my-forward-loop`). When a specific loop name is provided, it runs regardless of type or status (manual override).

**run-loop** — Per-loop matrix job:

1. Checkout repo (uses `GITHUB_TOKEN` — no `GH_PAT` needed since this is not a submodule context)
2. Configure git (`ralph-loop[bot]`)
3. Install Claude Code (Node.js + npm)
4. Check loop status (skip if converged/paused)
5. Install project deps unconditionally (all loops in this repo target the same Python stack):
   - Python 3.13 via `actions/setup-python`
   - `uv` via `astral-sh/setup-uv`
   - `cd apps/bot && uv sync` (install bot dependencies)
   - Supabase CLI via `npx supabase`
   - psql via `apt-get install postgresql-client`
6. Run until convergence — CI **inlines the loop logic** in the workflow YAML (same as monorepo), it does NOT call `loop.sh`. The `loop.sh` file is for local runs only. Both use the same algorithm: iterate, commit, push, check convergence.
7. On convergence: create GitHub issue (uses `GITHUB_TOKEN`), update registry, push

**Secrets** passed to the loop run step (all from the repo's GitHub environment secrets):
- `ANTHROPIC_API_KEY` (always — required for Claude Code)
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (for DB-touching loops)
- `DISCORD_BOT_TOKEN` (for integration test loops)
- `OPENAI_API_KEY` (for embedding/classification loops)

**Timeout**: 360 minutes (6 hours) per loop job.

### 4. `loops/_templates/daimon-discord/` — Project-Specific Template

Replaces both `loops/_template/` (generic) and `loops/_templates/fullstack-rust-wasm/` (wrong stack).

#### Structure

```
loops/_templates/daimon-discord/
├── README.md
├── reverse/
│   ├── PROMPT.md.template
│   └── frontier/
│       ├── aspects.md.template
│       └── analysis-log.md.template
└── forward/
    ├── PROMPT.md.template
    └── frontier/
        ├── current-stage.md.template
        └── stages/
```

#### README.md

Usage guide:
1. Copy template to `loops/<name>-{reverse,forward}/`
2. Replace placeholders: `{{LOOP_NAME}}`, `{{DESCRIPTION}}`, `{{GOAL}}`, `{{SOURCES}}`
3. Customize waves/stages for the specific feature
4. Copy `loops/loop.sh` into the loop directory
5. Register in `loops/_registry.yaml`
6. Dispatch: `gh workflow run ralph-loops.yml -f loop=<name>`

Rules (lessons learned):
- Each file = its own stage, max 3 files per stage
- Target 80-150 stages for full feature implementations, not 20-30
- Every forward loop gets pytest verification at each stage
- Last 3-5 stages are discovery stages that hunt for gaps
- Convergence = pytest passes + pyright clean + catalog loads (not just "builds")

#### Reverse Template — `reverse/PROMPT.md.template`

Structured around decision-orchestrator's actual development patterns, not generic product building.

**Wave structure:**

| Wave | Purpose | What It Produces |
|------|---------|-----------------|
| 1 | Existing Patterns | Extract from codebase: tool system (`mcp/`), DB patterns (`db/`), catalog (`mcp/catalog.py`), existing similar tools, FCIS boundaries |
| 2 | Domain Research | External APIs, protocols, academic papers, competitive analysis, cost modeling |
| 3 | Tool Design | MCP tool definitions: `@tool` signatures, input/output schemas, error cases, Discord UX (embeds, buttons, progress indicators) |
| 4 | Pipeline Design | Internal logic: prompt templates, concurrency patterns (`asyncio.gather`), caching, cost model per invocation |
| 5 | Data Model | Supabase tables, migrations, Pydantic types, repository layer (`db/repositories/`), RLS policies |
| 6 | Integration | Catalog registration diffs, workflow design, config changes, `Platform` enum additions, exact codebase changes needed |
| 7 | Examples & Verification | End-to-end worked examples (Discord user sends message → tool runs → response rendered), gap audit |

**Key instructions baked into the template:**

- Output directory is `tool-spec/` (proven by SSR loop), not `final-mega-spec/`
- Litmus test: "A forward loop must be able to implement by reading ONLY this directory, with ZERO external research"
- Must extract existing patterns from the actual codebase (read `mcp/tools/`, `db/repositories/`, `mcp/catalog.py`) — not invent patterns
- Must specify exact file paths for every change needed (e.g., "add import to `mcp/catalog.py` line 47")
- Must include Discord UX spec: how results render in embeds, error messages, progress indicators
- Must include Pydantic model definitions (pyright strict) and SQLAlchemy ORM models
- No summarizing, no "etc.", no placeholders — same rigor as monorepo template
- **Print mode instruction**: "You MUST print text to stdout before and after tool calls. In `--print` mode, tool-call-only responses produce zero output and the loop appears to hang."

**Convergence check:**
- All aspects `[x]`
- Every tool has input/output schemas with field types
- Every DB table has every column with type/constraint/default
- Every Pydantic model is fully defined
- Every error case has a Discord embed rendering
- Every integration point has exact file path + diff description
- No "TODO", "TBD", "placeholder", "etc." anywhere

#### Reverse Template — `reverse/frontier/aspects.md.template`

Pre-structured with the 7 waves above, placeholder aspects per wave. The brainstorm-ralph skill fills in specific aspects when instantiating.

```markdown
# {{LOOP_NAME}} — Frontier

## Statistics

- **Total**: 0
- **Analyzed**: 0
- **Pending**: 0
- **Convergence**: 0%

## Wave 1: Existing Patterns (extract from codebase)

- [ ] 1.1 — {{placeholder}}

## Wave 2: Domain Research (external sources)

- [ ] 2.1 — {{placeholder}}

## Wave 3: Tool Design (MCP definitions)

- [ ] 3.1 — {{placeholder}}

## Wave 4: Pipeline Design (internal logic)

- [ ] 4.1 — {{placeholder}}

## Wave 5: Data Model (Supabase + Pydantic)

- [ ] 5.1 — {{placeholder}}

## Wave 6: Integration (codebase changes)

- [ ] 6.1 — {{placeholder}}

## Wave 7: Examples & Verification (gap audit)

- [ ] 7.1 — {{placeholder}}
```

#### Reverse Template — `reverse/frontier/analysis-log.md.template`

```markdown
# Analysis Log

| # | Timestamp | Aspect | Files Written | Key Findings |
|---|-----------|--------|---------------|--------------|
```

#### Forward Template — `forward/PROMPT.md.template`

Tailored to the decision-orchestrator's dev workflow.

**Priority system:**

1. **SCAFFOLD** (if stage files don't exist yet):
   - Create files following FCIS: `mcp/tools/<name>/tools.py`, `mcp/tools/<name>/models.py`, `core/<domain>.py`, `db/repositories/<name>.py`, `db/schemas/<name>.py`
   - Establish types from the spec's Pydantic model definitions — copy exactly
   - Commit: `forward({{LOOP_NAME}}): scaffold stage {N}`

2. **TESTS** (if current stage has fewer than 5 test functions):
   - Read relevant spec files from the reverse loop's `tool-spec/`
   - Write pytest tests with appropriate markers (`@pytest.mark.unit`, `@pytest.mark.integration`, `@pytest.mark.database`)
   - Create stubs so tests compile (they will fail)
   - For external API calls, set up VCR cassettes
   - Commit: `forward({{LOOP_NAME}}): stage {N} - write tests`

3. **IMPLEMENT** (if tests exist but code is stubs):
   - Translate spec to code: exact types, exact field names, exact error messages
   - Follow `@tool` decorator pattern from existing tools
   - `core/` and `services/` must remain platform-agnostic (no Discord imports)
   - Commit: `forward({{LOOP_NAME}}): stage {N} - implement {description}`

4. **TYPE CHECK** (if implementation exists but pyright hasn't been run):
   - Run `uv run pyright apps/bot/src_v2/`
   - Fix all strict-mode type errors
   - Commit: `forward({{LOOP_NAME}}): stage {N} - fix type errors`

5. **FIX FAILURES** (if tests exist and some are failing):
   - Run `cd apps/bot && uv run pytest tests_v2/ -x -q`
   - Compare failing assertions against the spec — the spec is always right
   - Fix 1-3 related failures per iteration
   - Commit: `forward({{LOOP_NAME}}): stage {N} - fix {description}`

6. **SMOKE TEST** (if tests pass but catalog registration hasn't been verified):
   - Verify tool appears in catalog: `from src_v2.mcp.catalog import get_tool_catalog; assert "{{tool_name}}" in ...`
   - Run `uv run ruff check apps/bot/ && uv run ruff format apps/bot/`
   - Run full test suite: `cd apps/bot && uv run pytest tests_v2/ -x -q`
   - Commit: `forward({{LOOP_NAME}}): stage {N} - smoke test pass`

7. **ADVANCE** (if all checks pass for this stage):
   - Write `status/stage-{N}-complete.txt`
   - Update `frontier/current-stage.md` to advance to next stage
   - If final stage: run convergence check (all tests pass + pyright clean + ruff clean + catalog loads)
   - If convergence check passes: write `status/converged.txt`

**Key instructions baked into the template:**

- Source of truth is the reverse loop's `tool-spec/` directory
- Never research, never infer, never improvise — if the spec doesn't say it, note the gap in `frontier/spec-gaps.md`
- Tests assert exact values from the spec, not approximations
- Every constant, type name, field name comes from the spec's Pydantic definitions
- `beartype` is active in production — type annotations are runtime contracts
- **Print mode instruction**: Same as reverse template
- **Discovery stages (last 3-5)**: Hunt for orphaned imports, missing catalog entries, schema mismatches, untested error paths. Can extend the stage list.
- **Convergence**: `uv run pytest tests_v2/ -m "" -v` passes AND `uv run pyright` clean AND `uv run ruff check` clean AND tool loads in catalog

#### Forward Template — `forward/frontier/current-stage.md.template`

```markdown
# {{LOOP_NAME}} — Stage Tracker

## Progress

- **Total stages**: {{TOTAL}}
- **Completed**: 0
- **Current stage**: 1

## Stage Log

| Stage | Status | Timestamp | Notes |
|-------|--------|-----------|-------|

## Latest Test Output

(updated each iteration)
```

### 5. Cleanup — Deletions

| Path | Reason |
|------|--------|
| `loops/_template/` | Superseded by `_templates/daimon-discord/`. Contains generic examples that don't match the project's patterns. |
| `loops/_templates/fullstack-rust-wasm/` | Wrong tech stack. Decision-orchestrator is Python + Discord, not Rust + WASM + React. |

### 6. `loops/dec-oc-ssr-tools-reverse/loop.sh` — Standardize

Replace the existing `loop.sh` (which has a 1800s timeout) with a copy of the standardized `loops/loop.sh` (21600s timeout). The loop is already converged so this is purely for consistency — if someone ever reopens it, it'll use the correct runner.

## Lessons Learned — Encoded

These are the hard-won lessons from the monorepo, and where each one is encoded in this design:

| Lesson | Where Encoded |
|--------|---------------|
| Print mode gotcha (tool-call-only = zero output) | Both PROMPT.md templates |
| Premature convergence (20-30 stages instead of 80-150) | README.md + forward template instructions |
| Enumerate, don't compress (each file = own stage) | README.md |
| Stub illusion (tests pass on stubs) | Forward priority 6 (SMOKE TEST) + convergence check |
| Mock gap (frontend built against wrong API) | N/A — no separate frontend, but forward template requires spec as sole source of truth |
| Discovery gap (fixed stage list misses things) | Forward template: last 3-5 stages are discovery |
| Priority system gotcha (stage doesn't match any priority) | Forward template: 7 priorities covering every stage type in this project |
| Convergence = QA-testable, not just "builds" | Forward convergence: pytest + pyright + ruff + catalog |

## Non-Goals

- No cron schedule (manual dispatch only, can add later)
- No monorepo changes (everything stays inside decision-orchestrator)
- No new loops created (just the infrastructure — loops come later via brainstorm-ralph)
- No changes to existing CI workflows (deploy, test, record-cassettes, sync-discord)
