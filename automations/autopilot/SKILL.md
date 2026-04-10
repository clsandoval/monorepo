---
name: autopilot
description: Use when the user wants to dispatch autonomous background work that runs without their laptop open — kicks off a Claude Managed Agent that brainstorms, specs, plans, and implements from a brief, with async Q&A via polling
---

# Autopilot — Managed Agent Command Center

Dispatch fully autonomous work to Claude Managed Agents. All design decisions are made locally with the user, then a fully-formed brief is dispatched to run on Anthropic's infrastructure.

**Announce at start:** "I'm using the autopilot skill to [dispatch new work / check status / list sessions]."

## Key Principle: All Questions Answered Locally

The Managed Agent will NOT ask the user questions. All brainstorming, approach selection, ambiguity resolution, and agent configuration happens in the local session before dispatch. The agent receives a complete brief and executes without deliberation.

## Subcommands

| Invocation | Action |
|---|---|
| `/autopilot` | New job — brainstorm locally, configure agent, dispatch |
| `/autopilot status` | Check progress on an active session |
| `/autopilot list` | Show all tracked sessions |

## Routing

**On `/autopilot` (no args or with a brief):**
1. Read `setup.md` — ensure one-time environment setup is complete (environment_id in config)
2. Read `intake.md` — run the full intake flow:
   - Phase 1: Brainstorm the brief locally with the user (use superpowers brainstorming patterns)
   - Phase 2: Configure the agent — repo, branch, skills, constraints
   - Phase 3: Create agent tailored to this job (with selected skills)
   - Phase 4: Create session and dispatch the brief
3. The agent is created fresh per-job with the right skills for that task

**On `/autopilot status`:**
1. Read `status.md` — follow the status check flow

**On `/autopilot list`:**
1. Read `.superpowers/autopilot-sessions.json`
2. For each session, fetch current status via `GET /v1/sessions/{id}`
3. Display table:

```
| # | Brief                          | Repo          | Status   | Started    |
|---|--------------------------------|---------------|----------|------------|
| 1 | Stripe webhook handler         | clsandoval/m… | running  | 2h ago     |
| 2 | Research: PH LLM infra options | clsandoval/m… | idle     | 45m ago    |
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

For skills upload, use the skills beta header:
```bash
-H "anthropic-beta: skills-2025-10-02"
```

The `ANTHROPIC_API_KEY` environment variable must be set (source from `.env` if needed).

## Local State Files

- `.superpowers/autopilot-config.json` — one-time setup results (environment ID, vault ID)
- `.superpowers/autopilot-sessions.json` — active/historical session tracking

Both files live in the project root's `.superpowers/` directory. These files should be in `.gitignore`.

## Key Principles

- **Agent created per-job** — Each dispatch creates a fresh agent with skills tailored to the task. No global reusable agent.
- **All decisions made locally** — The agent executes, it doesn't deliberate. The brief must be complete.
- **Skills are the agent's expertise** — Upload relevant skills (custom or Anthropic pre-built) based on the task.
- **Git is the persistence layer** — the agent commits to `autopilot/<slug>` branches as it works.
- **No MCP servers** — Use bash tools only. MCP causes silent session failures.
