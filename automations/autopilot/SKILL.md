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
