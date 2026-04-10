# Autopilot Skill — Design Spec

> **Date:** 2026-04-10
> **Status:** Draft
> **Author:** clsandoval + Claude

## Overview

Autopilot is a superpowers skill that dispatches fully autonomous work to Claude Managed Agents. The user runs `/autopilot` in Claude Code, answers 3-4 quick intake questions, and the skill launches a Managed Agent session that runs the full superpowers workflow (brainstorm → spec → plan → implement/research) without requiring the user's laptop to stay open. The agent commits artifacts to a git branch as it works. When it hits genuine ambiguity or needs a high-impact decision, it pauses and waits for input. The user checks in at their convenience via `/autopilot status`.

## Problem

The current superpowers workflow (brainstorming → spec → plan → implementation) is synchronous — it runs in a single Claude Code session on the user's laptop. Closing the laptop stalls the session. Long-running tasks (multi-file implementations, deep research, complex planning) are impractical because they require sustained attention.

## Solution

Use Claude Managed Agents as the execution backend. Claude Code becomes a "command center" — dispatching work and checking in on progress. The Managed Agent runs autonomously on Anthropic's infrastructure, committing artifacts to git as it goes. The session can run for hours without the user present.

## Architecture

```
┌─────────────────────────────┐
│  Claude Code (command center)│
│                             │
│  /autopilot       → intake + dispatch
│  /autopilot status → poll + answer questions
│  /autopilot list   → show all sessions
│                             │
│  Local state:               │
│  .superpowers/autopilot-config.json
│  .superpowers/autopilot-sessions.json
└──────────┬──────────────────┘
           │ Anthropic API (beta)
           ▼
┌─────────────────────────────┐
│  Claude Managed Agent       │
│                             │
│  Agent (persisted, versioned)
│  ├── Model: claude-opus-4-6 │
│  ├── System prompt (superpowers workflow)
│  ├── agent_toolset_20260401 │
│  ├── GitHub MCP (PRs)       │
│  └── Custom: ask_user       │
│                             │
│  Session                    │
│  ├── Environment (unrestricted networking)
│  ├── GitHub repo mounted    │
│  └── Vault (GitHub MCP auth)│
└──────────┬──────────────────┘
           │ git push
           ▼
┌─────────────────────────────┐
│  GitHub                     │
│  Branch: autopilot/<slug>   │
│  Commits: autopilot: ...    │
│  PR on completion (if code) │
└─────────────────────────────┘
```

## Subcommands

### `/autopilot` — New Job Intake

Interactive intake in Claude Code (3-4 questions):

1. **What are you trying to build/figure out?** — free text brief
2. **Which repo?** — URL or local path (skill resolves to GitHub URL)
3. **Which branch to base off?** — default: `main`
4. **Any constraints or context?** — optional free text

After intake, the skill:

1. Loads or runs one-time setup (see Credential Management)
2. Creates a session with the repo mounted + vault attached
3. Sends the brief + intake answers as the first `user.message`
4. Saves the session ID to `.superpowers/autopilot-sessions.json`
5. Tells the user the session is running and how to check back

### `/autopilot status` — Check In

1. Reads `.superpowers/autopilot-sessions.json`
2. If one active session: shows it. If multiple: asks which one.
3. Fetches session events via `sessions.events.list()`
4. Parses events to build a status summary:
   - Current phase (brainstorming / spec / planning / implementation / review)
   - Pending question (if any) from the `ask_user` custom tool
   - Decisions made so far
   - Artifacts committed
5. If there's a pending question: prompts the user for an answer, sends it as `user.custom_tool_result`, session resumes

### `/autopilot list` — All Sessions

Table of all tracked sessions:
- Brief (truncated)
- Repo
- Status (running / waiting / idle / terminated)
- Started

## Managed Agent Configuration

### Agent Definition

Created once via `client.beta.agents.create()`, updated when the skill evolves.

```python
agent = client.beta.agents.create(
    name="Autopilot",
    model="claude-opus-4-6",
    system=SYSTEM_PROMPT,  # see System Prompt section
    mcp_servers=[
        {
            "type": "url",
            "name": "github",
            "url": "https://api.githubcopilot.com/mcp/",
        },
    ],
    tools=[
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
                        "description": "The question to ask",
                    },
                    "options": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Optional multiple choice options. Prefer multiple choice when possible.",
                    },
                    "phase": {
                        "type": "string",
                        "enum": [
                            "brainstorming",
                            "spec",
                            "planning",
                            "implementation",
                            "review",
                        ],
                        "description": "Current workflow phase",
                    },
                    "context": {
                        "type": "string",
                        "description": "Brief summary of what has been done so far and why this question matters",
                    },
                },
                "required": ["question", "phase", "context"],
            },
        },
    ],
)
```

### Environment

Created once, reused across all autopilot sessions:

```python
environment = client.beta.environments.create(
    name="autopilot-env",
    config={
        "type": "cloud",
        "networking": {"type": "unrestricted"},
    },
)
```

### Session Creation

Per-job, with repo mounted and vault attached:

```python
session = client.beta.sessions.create(
    agent={"type": "agent", "id": agent_id, "version": agent_version},
    environment_id=environment_id,
    title=f"autopilot: {brief_slug}",
    resources=[
        {
            "type": "github_repository",
            "url": repo_url,
            "mount_path": "/workspace/repo",
            "authorization_token": github_pat,
            "checkout": {"type": "branch", "name": base_branch},
        },
    ],
    vault_ids=[vault_id],
)
```

## System Prompt

The system prompt encodes the superpowers workflow for autonomous execution. Key sections:

### Identity & Behavior

You are an autonomous development agent. You follow the superpowers workflow: brainstorm → spec → plan → implement/review. You commit artifacts to git as you work. You use `ask_user` when you hit genuine ambiguity or high-impact decisions. You make opinionated calls on low-impact choices.

### Workflow Phases

1. **Brainstorming** — Read the codebase. Explore the brief. Identify 2-3 approaches. Choose the best one (or `ask_user` if genuinely uncertain). Document your reasoning.
2. **Spec** — Write a design spec. Commit to branch. Cover: architecture, components, data flow, error handling, testing. Scale each section to its complexity.
3. **Planning** — Break the spec into bite-sized tasks (2-5 min each). Write complete code blocks — no placeholders or TBDs. Commit to branch.
4. **Implementation** — Execute the plan. For each task: implement, test, commit. For research/document tasks: write, refine, commit.
5. **Completion** — If code: run tests, open PR via GitHub MCP. If document: commit final artifact. In both cases, write a summary of what was done.

### Commit Strategy

- Work on branch `autopilot/<slugified-brief>`
- Commit frequently — each spec, plan, and implementation chunk gets its own commit
- Prefix commit messages with `autopilot:`
- Do not commit files over ~100KB or binary formats
- Do not commit secrets, credentials, or `.env` files

### Crash Recovery

Before starting work, check if the branch `autopilot/<slug>` already exists with `autopilot:` commits. If so, read the existing artifacts (spec, plan, partial implementation) and continue from where things left off rather than starting fresh.

### Self-Review

Before marking complete:
- Re-read the original brief
- Verify all spec requirements are addressed
- Run available test commands (`npm test`, `pytest`, `go test`, etc.)
- Write a summary in the PR description or as a completion note

### ask_user Guidelines

Use `ask_user` for:
- Ambiguous requirements that could go multiple ways
- High-impact architectural decisions
- Approval at major phase transitions (if confidence is below ~80%)
- Anything where guessing wrong would waste significant work

Do NOT use `ask_user` for:
- Obvious choices (e.g., which test framework when the project already uses one)
- Low-impact decisions (e.g., variable naming, file organization within established patterns)
- Things you can determine by reading the codebase

Always provide context about what you've done so far and why the question matters. Prefer multiple choice options when possible.

## Status Derivation

When `/autopilot status` fetches events, it derives the display from:

| Data point | Source |
|---|---|
| Current phase | Latest `agent.message` mentioning phase transition, or `ask_user` tool call's `phase` field |
| Pending question | `agent.custom_tool_use` event with `tool_name === "ask_user"` that has no matching `user.custom_tool_result` |
| Decisions made | `agent.message` events (agent is instructed to clearly log decisions) |
| Artifacts | `agent.tool_use` events for `write` tool, cross-referenced with commit messages in `agent.tool_result` from bash/git commands |
| Session status | Latest `session.status_*` event |

## Credential Management

### One-Time Setup

On first `/autopilot` run, the skill walks the user through setup:

1. Verify `ANTHROPIC_API_KEY` is set
2. Prompt for GitHub PAT (stored as env var reference, e.g., `GITHUB_TOKEN`)
3. Create environment → save `environment_id`
4. Create agent → save `agent_id` and `agent_version`
5. Create vault + GitHub OAuth credential → save `vault_id`

### Config File

`.superpowers/autopilot-config.json`:

```json
{
  "environment_id": "env_abc123",
  "agent_id": "agent_def456",
  "agent_version": "1772585501101368014",
  "vault_id": "vlt_ghi789",
  "github_token_env_var": "GITHUB_TOKEN",
  "setup_completed_at": "2026-04-10T14:00:00Z"
}
```

### Sessions File

`.superpowers/autopilot-sessions.json`:

```json
{
  "sessions": [
    {
      "id": "sess_abc123",
      "brief": "Build a webhook handler for Stripe events",
      "repo": "https://github.com/clsandoval/monorepo",
      "branch": "autopilot/stripe-webhook-handler",
      "base_branch": "main",
      "started_at": "2026-04-10T14:00:00Z",
      "status": "running",
      "last_checked_at": null
    }
  ]
}
```

### Agent Updates

When the skill's system prompt or tool definitions change (skill update), the skill detects a mismatch and calls `agents.update()` to bump the version. New sessions use the latest version; existing sessions continue on their pinned version.

## Skill File Structure

```
skills/autopilot/
├── SKILL.md              # Skill entry point, subcommand routing
├── system-prompt.md      # The Managed Agent's system prompt (full text)
├── intake.md             # Intake question flow
├── status.md             # Status display and question answering logic
└── setup.md              # One-time setup flow
```

## Open Questions (Resolved)

All design questions were resolved during brainstorming:

- **Output format:** Determined organically by the agent based on the brief (code → PR, research → committed doc, plan → committed plan)
- **Interaction model:** Polling-based via `/autopilot status`, no push notifications
- **Workflow:** Full superpowers workflow, mirroring current interactive skills
- **Communication:** Async Q&A via custom `ask_user` tool — agent pauses, user answers when they check in
- **Persistence:** Git branches — agent commits as it works
- **Repo scope:** User specifies repo during intake — skill handles full agent configuration

## Dependencies

- Anthropic API with `managed-agents-2026-04-01` beta
- GitHub PAT with `repo` scope (for clone, push, PR creation)
- GitHub MCP OAuth credential (for PR creation via MCP)
- Python SDK (`anthropic` package) — used by the skill to manage agents/sessions
