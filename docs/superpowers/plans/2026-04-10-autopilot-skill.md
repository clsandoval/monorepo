# Autopilot Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a superpowers skill that dispatches autonomous work to Claude Managed Agents, with Claude Code as the command center.

**Architecture:** A skill with 5 markdown files (SKILL.md + 4 supporting docs) that instructs Claude Code how to orchestrate the Managed Agents API. The skill uses `curl` via Bash to call the Anthropic API directly — no custom scripts or packages needed. Local state persists in `.superpowers/` JSON files.

**Tech Stack:** Bash/curl (Anthropic API calls), JSON (local state), Markdown (skill files)

**Spec:** `docs/superpowers/specs/2026-04-10-autopilot-skill-design.md`

---

## File Structure

| File | Purpose |
|------|---------|
| Create: `~/.claude/skills/autopilot/SKILL.md` | Skill entry point — frontmatter, subcommand routing, overview |
| Create: `~/.claude/skills/autopilot/system-prompt.md` | Full system prompt for the Managed Agent |
| Create: `~/.claude/skills/autopilot/intake.md` | Intake question flow and session dispatch logic |
| Create: `~/.claude/skills/autopilot/status.md` | Status display, event parsing, and question answering |
| Create: `~/.claude/skills/autopilot/setup.md` | One-time setup flow (environment, agent, vault creation) |

---

### Task 1: SKILL.md — Entry Point & Routing

**Files:**
- Create: `~/.claude/skills/autopilot/SKILL.md`

- [ ] **Step 1: Create the skill entry point**

```markdown
---
name: autopilot
description: Use when the user wants to dispatch autonomous background work that runs without their laptop open — kicks off a Claude Managed Agent that brainstorms, specs, plans, and implements from a brief, with async Q&A via polling
---

# Autopilot — Managed Agent Command Center

Dispatch fully autonomous work to Claude Managed Agents. The user provides a brief, you launch a Managed Agent session that runs the full superpowers workflow (brainstorm → spec → plan → implement/research) on Anthropic's infrastructure. The user checks in at their convenience.

**Announce at start:** "I'm using the autopilot skill to [dispatch new work / check status / list sessions]."

## Subcommands

| Invocation | Action |
|---|---|
| `/autopilot` | New job — run intake, dispatch agent |
| `/autopilot status` | Check in on an active session, answer pending questions |
| `/autopilot list` | Show all tracked sessions |

## Routing

**On `/autopilot` (no args or with a brief):**
1. Read `setup.md` — ensure one-time setup is complete
2. Read `intake.md` — run the intake flow
3. Dispatch the Managed Agent session

**On `/autopilot status`:**
1. Read `status.md` — follow the status check flow

**On `/autopilot list`:**
1. Read `.superpowers/autopilot-sessions.json`
2. For each session, fetch current status via `GET /v1/sessions/{id}`
3. Display table:

```
| # | Brief                          | Repo          | Status   | Started    |
|---|--------------------------------|---------------|----------|------------|
| 1 | Stripe webhook handler         | clsandoval/m… | waiting  | 2h ago     |
| 2 | Research: PH LLM infra options | clsandoval/m… | running  | 45m ago    |
```

## API Conventions

All Managed Agents API calls use `curl` via Bash with these headers:

```bash
curl -sS https://api.anthropic.com/v1/{endpoint} \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "anthropic-beta: managed-agents-2026-04-01" \
  -H "content-type: application/json"
```

The `ANTHROPIC_API_KEY` environment variable must be set (same one Claude Code uses).

## Local State Files

- `.superpowers/autopilot-config.json` — one-time setup results (agent ID, environment ID, vault ID)
- `.superpowers/autopilot-sessions.json` — active/historical session tracking

Both files live in the project root's `.superpowers/` directory. Create the directory if it doesn't exist. These files should be in `.gitignore`.

## Key Principles

- **Agent creates once, session creates per-job** — never call `POST /v1/agents` in the dispatch path if the agent already exists
- **Git is the persistence layer** — the agent commits to `autopilot/<slug>` branches as it works
- **Async Q&A via custom tool** — the agent calls `ask_user` when it needs input, session idles, user answers via `/autopilot status`
- **Crash recovery** — if a session terminates, the branch has all committed work; restart from the branch
```

- [ ] **Step 2: Verify the file is readable**

Run: `cat ~/.claude/skills/autopilot/SKILL.md | head -5`
Expected: Shows the YAML frontmatter starting with `---`

- [ ] **Step 3: Commit**

```bash
git -C ~/.claude/skills add autopilot/SKILL.md
git -C ~/.claude/skills commit -m "autopilot: add skill entry point with subcommand routing"
```

Note: If `~/.claude/skills` is not a git repo, skip the commit — the file is saved in place.

---

### Task 2: setup.md — One-Time Setup Flow

**Files:**
- Create: `~/.claude/skills/autopilot/setup.md`

- [ ] **Step 1: Write the setup guide**

```markdown
# Autopilot Setup

One-time setup that creates the Managed Agent infrastructure. Run this before the first dispatch.

## Prerequisites Check

Before setup, verify:

1. `ANTHROPIC_API_KEY` is set in the environment
2. User has a GitHub Personal Access Token with `repo` scope

```bash
# Verify API key is set
echo "ANTHROPIC_API_KEY is $([ -n "$ANTHROPIC_API_KEY" ] && echo 'set' || echo 'NOT SET')"
```

If `ANTHROPIC_API_KEY` is not set, stop and tell the user to set it.

## Setup Flow

Ask the user these questions:

1. **Which environment variable holds your GitHub PAT?** (default: `GITHUB_TOKEN`)
   - Verify it's set: `[ -n "${!var_name}" ]`
   - If not set, tell the user to export it and try again

Then create the infrastructure:

### Step 1: Create Environment

```bash
ENV_RESPONSE=$(curl -sS https://api.anthropic.com/v1/environments \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "anthropic-beta: managed-agents-2026-04-01" \
  -H "content-type: application/json" \
  -d '{
    "name": "autopilot-env",
    "config": {
      "type": "cloud",
      "networking": {"type": "unrestricted"}
    }
  }')

ENVIRONMENT_ID=$(echo "$ENV_RESPONSE" | jq -r '.id')
echo "Environment ID: $ENVIRONMENT_ID"
```

If environment creation returns 409 (name conflict), list environments and find the existing one:

```bash
ENVIRONMENT_ID=$(curl -sS https://api.anthropic.com/v1/environments \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "anthropic-beta: managed-agents-2026-04-01" \
  | jq -r '.data[] | select(.name == "autopilot-env") | .id')
```

### Step 2: Create Agent

Read `system-prompt.md` to get the full system prompt text. Then:

```bash
SYSTEM_PROMPT=$(cat ~/.claude/skills/autopilot/system-prompt.md)

AGENT_RESPONSE=$(curl -sS https://api.anthropic.com/v1/agents \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "anthropic-beta: managed-agents-2026-04-01" \
  -H "content-type: application/json" \
  -d "$(jq -n \
    --arg system "$SYSTEM_PROMPT" \
    '{
      "name": "Autopilot",
      "model": "claude-opus-4-6",
      "system": $system,
      "mcp_servers": [
        {
          "type": "url",
          "name": "github",
          "url": "https://api.githubcopilot.com/mcp/"
        }
      ],
      "tools": [
        {"type": "agent_toolset_20260401"},
        {"type": "mcp_toolset", "mcp_server_name": "github"},
        {
          "type": "custom",
          "name": "ask_user",
          "description": "Pause and ask the user a question. Use when you need a decision, clarification, or approval before proceeding. The session will idle until the user responds. Use for genuinely ambiguous or high-impact choices — make opinionated calls on low-impact decisions yourself.",
          "input_schema": {
            "type": "object",
            "properties": {
              "question": {
                "type": "string",
                "description": "The question to ask"
              },
              "options": {
                "type": "array",
                "items": {"type": "string"},
                "description": "Optional multiple choice options. Prefer multiple choice when possible."
              },
              "phase": {
                "type": "string",
                "enum": ["brainstorming", "spec", "planning", "implementation", "review"],
                "description": "Current workflow phase"
              },
              "context": {
                "type": "string",
                "description": "Brief summary of what has been done so far and why this question matters"
              }
            },
            "required": ["question", "phase", "context"]
          }
        }
      ]
    }')")

AGENT_ID=$(echo "$AGENT_RESPONSE" | jq -r '.id')
AGENT_VERSION=$(echo "$AGENT_RESPONSE" | jq -r '.version')
echo "Agent ID: $AGENT_ID, Version: $AGENT_VERSION"
```

### Step 3: Create Vault and GitHub MCP Credential

Ask the user:

> "To create PRs via the GitHub MCP server, I need a GitHub OAuth token. Do you have one? If not, we can skip vault setup for now — the agent will still be able to commit and push, but won't be able to create PRs automatically."

If they have one:

```bash
VAULT_RESPONSE=$(curl -sS https://api.anthropic.com/v1/vaults \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "anthropic-beta: managed-agents-2026-04-01" \
  -H "content-type: application/json" \
  -d '{"name": "autopilot-github"}')

VAULT_ID=$(echo "$VAULT_RESPONSE" | jq -r '.id')

# Add credential (user provides the OAuth token)
curl -sS "https://api.anthropic.com/v1/vaults/$VAULT_ID/credentials" \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "anthropic-beta: managed-agents-2026-04-01" \
  -H "content-type: application/json" \
  -d "$(jq -n --arg token "$GITHUB_OAUTH_TOKEN" '{
    "display_name": "GitHub MCP OAuth",
    "auth": {
      "type": "mcp_oauth",
      "mcp_server_url": "https://api.githubcopilot.com/mcp/",
      "access_token": $token
    }
  }')"
```

If they don't have one, set `vault_id` to `null` in config — PRs won't be auto-created but everything else works.

### Step 4: Save Config

```bash
mkdir -p .superpowers

cat > .superpowers/autopilot-config.json << EOF
{
  "environment_id": "$ENVIRONMENT_ID",
  "agent_id": "$AGENT_ID",
  "agent_version": "$AGENT_VERSION",
  "vault_id": "$VAULT_ID",
  "github_token_env_var": "$GITHUB_TOKEN_VAR",
  "setup_completed_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF
```

Also ensure `.superpowers/` is in `.gitignore`:

```bash
grep -q '\.superpowers/' .gitignore 2>/dev/null || echo '.superpowers/' >> .gitignore
```

### Step 5: Initialize Sessions File

```bash
echo '{"sessions": []}' > .superpowers/autopilot-sessions.json
```

## Verifying Setup

After setup, verify by listing the agent:

```bash
curl -sS "https://api.anthropic.com/v1/agents/$AGENT_ID" \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "anthropic-beta: managed-agents-2026-04-01" \
  | jq '{id, name, model, version}'
```

Expected: JSON with the agent's ID, name "Autopilot", model "claude-opus-4-6", and version.

## Loading Existing Config

On subsequent runs, check if `.superpowers/autopilot-config.json` exists and is valid:

```bash
if [ -f .superpowers/autopilot-config.json ]; then
  AGENT_ID=$(jq -r '.agent_id' .superpowers/autopilot-config.json)
  ENVIRONMENT_ID=$(jq -r '.environment_id' .superpowers/autopilot-config.json)
  VAULT_ID=$(jq -r '.vault_id' .superpowers/autopilot-config.json)
  GITHUB_TOKEN_VAR=$(jq -r '.github_token_env_var' .superpowers/autopilot-config.json)
  # Setup already done
else
  # Run setup flow above
fi
```
```

- [ ] **Step 2: Commit**

```bash
git -C ~/.claude/skills add autopilot/setup.md
git -C ~/.claude/skills commit -m "autopilot: add one-time setup flow"
```

---

### Task 3: system-prompt.md — Managed Agent System Prompt

**Files:**
- Create: `~/.claude/skills/autopilot/system-prompt.md`

This is the actual system prompt sent to the Managed Agent via `agents.create()`. It's raw text, not a skill doc — no frontmatter.

- [ ] **Step 1: Write the system prompt**

```markdown
You are Autopilot, an autonomous development agent running on Anthropic's Managed Agents infrastructure. You execute the full development workflow — brainstorm, spec, plan, implement — without human supervision. You commit artifacts to git as you work. When you need a decision from the user, you call the `ask_user` tool and wait.

## Your Environment

- You are running in a cloud container with bash, file tools, web search, and web fetch available.
- A GitHub repository is mounted at `/workspace/repo`. This is your working directory.
- You can commit and push to the repo. You may have GitHub MCP tools available for creating PRs.
- The user is NOT watching. They will check in later via a polling interface.

## Workflow

Execute these phases in order. Commit artifacts at each phase boundary.

### Phase 1: Brainstorming

1. Read the user's brief carefully.
2. Explore the codebase — understand the structure, conventions, tech stack, existing patterns.
3. Identify 2-3 possible approaches with trade-offs.
4. Choose the best approach. If the choice is genuinely ambiguous or high-impact, call `ask_user` with your options and recommendation. Otherwise, make the call yourself and document why.
5. Log your decisions clearly in your messages so the user can review them later.

### Phase 2: Spec

1. Write a design document covering: architecture, components, data flow, error handling, testing strategy.
2. Scale each section to its complexity — a few sentences if straightforward, more if nuanced.
3. Save to `docs/autopilot/<slug>-spec.md` in the repo.
4. Commit: `autopilot: spec for <brief-slug>`
5. If your confidence in the design is below ~80%, call `ask_user` for approval before proceeding. Otherwise, proceed.

### Phase 3: Planning

1. Break the spec into bite-sized implementation tasks (each 2-5 minutes of work).
2. For each task, specify: files to create/modify, exact code, test commands, expected output.
3. No placeholders — every task must have complete, copy-pasteable content.
4. Save to `docs/autopilot/<slug>-plan.md` in the repo.
5. Commit: `autopilot: plan for <brief-slug>`

### Phase 4: Implementation

1. Create and checkout branch `autopilot/<slug>` from the base branch.
2. Execute each task from the plan in order.
3. For code tasks: write test → run to verify failure → implement → run to verify pass → commit.
4. For research/document tasks: write → refine → commit.
5. Commit after each logical chunk. Message format: `autopilot: <what was done>`
6. Push the branch periodically (at minimum after each phase and every ~5 commits).

### Phase 5: Completion

1. Run the project's test suite (if one exists): `npm test`, `pytest`, `go test ./...`, `cargo test`, etc.
2. If tests fail, fix them before proceeding.
3. Determine the output type based on what you built:
   - **Code changes:** Create a PR via GitHub MCP (if available) or push branch and note the branch name. PR title: `autopilot: <brief summary>`. PR body: summary of changes, decisions made, and test results.
   - **Research/documents:** Commit final artifact, push branch.
4. Write a completion summary as your final message.

## Commit Strategy

- Branch: `autopilot/<slugified-brief>` (e.g., `autopilot/stripe-webhook-handler`)
- All commits prefixed with `autopilot:`
- Commit frequently — each spec, plan, and implementation chunk gets its own commit
- Do NOT commit: files over ~100KB, binary files, secrets, `.env` files, `node_modules/`, `__pycache__/`
- Push after: spec commit, plan commit, every ~5 implementation commits, and completion

## Crash Recovery

Before starting work, check if branch `autopilot/<slug>` already exists:

```bash
cd /workspace/repo
git fetch origin
if git rev-parse --verify "origin/autopilot/<slug>" >/dev/null 2>&1; then
  git checkout "autopilot/<slug>"
  # Check for existing spec/plan files
  # Continue from where things left off
fi
```

If existing `autopilot:` commits are found, read the artifacts and continue from the last completed phase rather than starting over.

## Using ask_user

The `ask_user` tool pauses execution and waits for the user to respond. Use it wisely.

**DO use ask_user for:**
- Ambiguous requirements that could go multiple ways
- High-impact architectural decisions (e.g., "should this be a separate service or a module?")
- Phase transition approval when confidence is low
- Anything where guessing wrong would waste >30 minutes of work

**DO NOT use ask_user for:**
- Choices the codebase already answers (e.g., which framework — check what's installed)
- Low-impact decisions (variable names, file organization within patterns)
- Obvious next steps
- Things you can figure out by reading code or docs

**When calling ask_user:**
- Always include `context` — summarize what you've done and why this question matters
- Always include `phase` — so the user sees where you are
- Prefer multiple choice `options` when possible — easier to answer than open-ended
- Make your recommendation clear in the question text

## Message Discipline

The user will read your messages later via a status interface. Structure them for scannability:

- Start each phase with a clear header: `## Phase N: <Name>`
- Log each major decision: `**Decision:** <what> — <why>`
- Log each artifact: `**Committed:** <path> (commit: <short-hash>)`
- Keep running prose minimal — favor structured output

## Working in the Codebase

- Follow existing patterns. Match the code style, test conventions, and project structure.
- Read before writing. Understand what exists before proposing changes.
- Do not refactor unrelated code. Stay focused on the brief.
- Do not add features beyond what was asked. YAGNI.
```

- [ ] **Step 2: Verify the file is valid text (no encoding issues)**

Run: `wc -l ~/.claude/skills/autopilot/system-prompt.md`
Expected: ~100-120 lines

- [ ] **Step 3: Commit**

```bash
git -C ~/.claude/skills add autopilot/system-prompt.md
git -C ~/.claude/skills commit -m "autopilot: add managed agent system prompt"
```

---

### Task 4: intake.md — Intake Flow & Session Dispatch

**Files:**
- Create: `~/.claude/skills/autopilot/intake.md`

- [ ] **Step 1: Write the intake flow**

```markdown
# Autopilot Intake & Dispatch

## Intake Questions

Ask these questions one at a time:

### Q1: What are you trying to build or figure out?

Free text. This becomes the brief.

Example responses:
- "Build a Stripe webhook handler that stores events in Postgres"
- "Research options for PH-based LLM infrastructure and write a comparison doc"
- "Create a design spec for the new auth system"

### Q2: Which repo?

Ask: "Which repository should I work in? Provide a GitHub URL or say 'this repo' for the current one."

- If "this repo" / "." / current directory: resolve to GitHub URL via `git remote get-url origin`
- If a URL: use as-is
- If a local path: resolve to GitHub URL via `git -C <path> remote get-url origin`

Validate the URL looks like `https://github.com/<owner>/<repo>`.

### Q3: Which branch to base off?

Ask: "Which branch should I base the work off? (default: main)"

Default to `main` if the user just presses enter or says "default".

### Q4: Any constraints or context? (optional)

Ask: "Any constraints, context, or specific things I should know? (press enter to skip)"

This is optional. Examples:
- "Use the existing Prisma schema, don't create new tables"
- "Look at how the existing webhooks work in `src/webhooks/`"
- "This is a research task, no code needed"

## Slugifying the Brief

Create a branch-safe slug from the brief:

```bash
SLUG=$(echo "$BRIEF" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-//' | sed 's/-$//' | cut -c1-50)
```

## Dispatching the Session

After intake, with config loaded from `.superpowers/autopilot-config.json`:

### Step 1: Create Session

```bash
GITHUB_TOKEN="${!GITHUB_TOKEN_VAR}"

SESSION_BODY=$(jq -n \
  --arg agent_id "$AGENT_ID" \
  --arg agent_version "$AGENT_VERSION" \
  --arg env_id "$ENVIRONMENT_ID" \
  --arg repo_url "$REPO_URL" \
  --arg token "$GITHUB_TOKEN" \
  --arg branch "$BASE_BRANCH" \
  --arg title "autopilot: $SLUG" \
  --arg vault_id "$VAULT_ID" \
  '{
    "agent": {"type": "agent", "id": $agent_id, "version": ($agent_version | tonumber)},
    "environment_id": $env_id,
    "title": $title,
    "resources": [
      {
        "type": "github_repository",
        "url": $repo_url,
        "mount_path": "/workspace/repo",
        "authorization_token": $token,
        "checkout": {"type": "branch", "name": $branch}
      }
    ]
  } + (if $vault_id != "null" then {"vault_ids": [$vault_id]} else {} end)')

SESSION_RESPONSE=$(curl -sS https://api.anthropic.com/v1/sessions \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "anthropic-beta: managed-agents-2026-04-01" \
  -H "content-type: application/json" \
  -d "$SESSION_BODY")

SESSION_ID=$(echo "$SESSION_RESPONSE" | jq -r '.id')
echo "Session ID: $SESSION_ID"
```

### Step 2: Send the Brief

Compose the first message from intake answers:

```bash
MESSAGE="## Brief\n\n$BRIEF\n\n## Repository\n\n$REPO_URL (branch: $BASE_BRANCH)\n\n## Branch for Work\n\nautopilot/$SLUG"

if [ -n "$CONSTRAINTS" ]; then
  MESSAGE="$MESSAGE\n\n## Constraints & Context\n\n$CONSTRAINTS"
fi

curl -sS "https://api.anthropic.com/v1/sessions/$SESSION_ID/events" \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "anthropic-beta: managed-agents-2026-04-01" \
  -H "content-type: application/json" \
  -d "$(jq -n --arg msg "$MESSAGE" '{
    "events": [
      {
        "type": "user.message",
        "content": [{"type": "text", "text": $msg}]
      }
    ]
  }')"
```

### Step 3: Save Session to Local State

```bash
SESSIONS_FILE=".superpowers/autopilot-sessions.json"

# Add session to the array
jq --arg id "$SESSION_ID" \
   --arg brief "$BRIEF" \
   --arg repo "$REPO_URL" \
   --arg branch "autopilot/$SLUG" \
   --arg base "$BASE_BRANCH" \
   --arg started "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
   '.sessions += [{
     "id": $id,
     "brief": $brief,
     "repo": $repo,
     "branch": $branch,
     "base_branch": $base,
     "started_at": $started,
     "status": "running",
     "last_checked_at": null
   }]' "$SESSIONS_FILE" > "${SESSIONS_FILE}.tmp" && mv "${SESSIONS_FILE}.tmp" "$SESSIONS_FILE"
```

### Step 4: Confirm to User

Display:

```
Autopilot session dispatched!

  Session:  $SESSION_ID
  Brief:    $BRIEF
  Repo:     $REPO_URL
  Branch:   autopilot/$SLUG
  Base:     $BASE_BRANCH

The agent is now working autonomously. Check in anytime with:
  /autopilot status
```
```

- [ ] **Step 2: Commit**

```bash
git -C ~/.claude/skills add autopilot/intake.md
git -C ~/.claude/skills commit -m "autopilot: add intake and dispatch flow"
```

---

### Task 5: status.md — Status Display & Q&A

**Files:**
- Create: `~/.claude/skills/autopilot/status.md`

- [ ] **Step 1: Write the status flow**

```markdown
# Autopilot Status Check

## Loading Sessions

```bash
SESSIONS_FILE=".superpowers/autopilot-sessions.json"

if [ ! -f "$SESSIONS_FILE" ]; then
  echo "No autopilot sessions found. Run /autopilot to start one."
  exit 0
fi

SESSION_COUNT=$(jq '.sessions | length' "$SESSIONS_FILE")
```

If one session: use it directly.
If multiple: show the list and ask which one to check.

## Fetching Status

### Step 1: Get Session Status

```bash
SESSION_STATUS=$(curl -sS "https://api.anthropic.com/v1/sessions/$SESSION_ID" \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "anthropic-beta: managed-agents-2026-04-01" \
  | jq -r '.status')
```

### Step 2: Fetch Events

```bash
EVENTS=$(curl -sS "https://api.anthropic.com/v1/sessions/$SESSION_ID/events" \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "anthropic-beta: managed-agents-2026-04-01")
```

### Step 3: Parse Events for Display

Extract from events:

**Current phase:** Find the last `agent.message` event whose content mentions "## Phase" or the last `agent.custom_tool_use` event with `tool_name == "ask_user"` — use its `phase` field.

```bash
# Get the latest phase from ask_user calls
LATEST_PHASE=$(echo "$EVENTS" | jq -r '
  [.data[] | select(.type == "agent.custom_tool_use" and .tool_name == "ask_user") | .input.phase]
  | last // "unknown"')
```

**Pending question:** Find `agent.custom_tool_use` events with `tool_name == "ask_user"` that have no matching `user.custom_tool_result`.

```bash
# Get ask_user events without matching responses
PENDING=$(echo "$EVENTS" | jq '
  [.data[] | select(.type == "agent.custom_tool_use" and .tool_name == "ask_user")] as $asks |
  [.data[] | select(.type == "user.custom_tool_result") | .custom_tool_use_id] as $answered |
  [$asks[] | select(.id as $id | $answered | index($id) | not)]
  | last')
```

**Decisions and artifacts:** Scan `agent.message` events for lines containing "**Decision:**" and "**Committed:**".

```bash
# Extract decisions from agent messages
DECISIONS=$(echo "$EVENTS" | jq -r '
  [.data[]
   | select(.type == "agent.message")
   | .content[]
   | select(.type == "text")
   | .text
   | split("\n")[]
   | select(startswith("**Decision:**"))]')

# Extract committed artifacts
ARTIFACTS=$(echo "$EVENTS" | jq -r '
  [.data[]
   | select(.type == "agent.message")
   | .content[]
   | select(.type == "text")
   | .text
   | split("\n")[]
   | select(startswith("**Committed:**"))]')
```

## Display Format

Present the status as:

```
## Autopilot: <brief-slug>

**Phase:** <phase>
**Status:** <running | Waiting for your input | idle | terminated>
**Branch:** <branch>
**Running since:** <relative time>

### Pending Question
<question text>
Options: A) ... B) ... C) ...

### Decisions Made
1. <decision 1>
2. <decision 2>

### Artifacts
- <path> (committed)
```

## Answering a Pending Question

If there's a pending question:

1. Display the question and options to the user
2. Ask the user for their answer (use AskUserQuestion tool with the options if multiple choice)
3. Send the answer back:

```bash
curl -sS "https://api.anthropic.com/v1/sessions/$SESSION_ID/events" \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "anthropic-beta: managed-agents-2026-04-01" \
  -H "content-type: application/json" \
  -d "$(jq -n --arg id "$PENDING_EVENT_ID" --arg answer "$USER_ANSWER" '{
    "events": [
      {
        "type": "user.custom_tool_result",
        "custom_tool_use_id": $id,
        "content": [{"type": "text", "text": $answer}]
      }
    ]
  }')"
```

4. Tell the user: "Answer sent! The agent is resuming. Check back later with `/autopilot status`."

## Updating Local State

After checking status, update the local sessions file:

```bash
jq --arg id "$SESSION_ID" \
   --arg status "$SESSION_STATUS" \
   --arg checked "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
   '(.sessions[] | select(.id == $id)) |= . + {
     "status": $status,
     "last_checked_at": $checked
   }' "$SESSIONS_FILE" > "${SESSIONS_FILE}.tmp" && mv "${SESSIONS_FILE}.tmp" "$SESSIONS_FILE"
```

## Terminated Sessions

If `SESSION_STATUS == "terminated"`:

1. Check for the branch: `git ls-remote origin "autopilot/<slug>"`
2. If branch exists: "Session terminated, but work was committed to branch `autopilot/<slug>`. You can review it with `git log origin/autopilot/<slug>` or restart with `/autopilot`."
3. If no branch: "Session terminated with no committed work. Check the events above for error details. You can restart with `/autopilot`."
```

- [ ] **Step 2: Commit**

```bash
git -C ~/.claude/skills add autopilot/status.md
git -C ~/.claude/skills commit -m "autopilot: add status check and Q&A flow"
```

---

### Task 6: End-to-End Verification

No files to create — this task verifies the skill works.

- [ ] **Step 1: Verify all files exist**

Run: `ls -la ~/.claude/skills/autopilot/`
Expected: 5 files — `SKILL.md`, `system-prompt.md`, `intake.md`, `status.md`, `setup.md`

- [ ] **Step 2: Verify SKILL.md frontmatter is parseable**

Run: `head -4 ~/.claude/skills/autopilot/SKILL.md`
Expected:
```
---
name: autopilot
description: Use when the user wants to dispatch autonomous background work...
---
```

- [ ] **Step 3: Verify system prompt has no markdown frontmatter**

Run: `head -1 ~/.claude/skills/autopilot/system-prompt.md`
Expected: Starts with `You are Autopilot` — NOT `---`

- [ ] **Step 4: Test setup prerequisites check**

Run: `echo "ANTHROPIC_API_KEY is $([ -n "$ANTHROPIC_API_KEY" ] && echo 'set' || echo 'NOT SET')"`
Expected: `ANTHROPIC_API_KEY is set`

- [ ] **Step 5: Dry-run agent creation (optional — costs nothing but creates a real agent)**

If the user wants to test end-to-end, run the setup flow from `setup.md` and verify the agent is created:

```bash
curl -sS "https://api.anthropic.com/v1/agents" \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "anthropic-beta: managed-agents-2026-04-01" \
  | jq '.data[] | select(.name == "Autopilot") | {id, name, version}'
```

- [ ] **Step 6: Final commit**

```bash
git -C ~/.claude/skills add autopilot/
git -C ~/.claude/skills commit -m "autopilot: complete skill — managed agent command center"
```
