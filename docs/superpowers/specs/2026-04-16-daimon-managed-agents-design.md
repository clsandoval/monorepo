# Daimon Managed Agents — Design Spec

**Date:** 2026-04-16
**Status:** Draft

## Overview

A new repo (`daimon-managed`) that follows the daimon pattern — a platform-agnostic AI agent orchestrator with FastMCP tools — but replaces E2B sandboxes and the Claude Agent SDK with **Claude Managed Agents**. The agent runs on Anthropic's infrastructure. No sandbox lifecycle, no stream parsing, no health checks.

## Goals

- Platform-agnostic core that adapters (Discord, Slack, web) import as a library
- FastMCP tool server for external integrations, same pattern as daimon
- Skills as versioned `.md` files in the repo, uploaded via the Skills API
- No database — Managed Agents handles session state
- Clean scaffold with one example tool, easy to extend per-deployment

## Architecture

```
Adapter (Discord/Slack/Web)
    ↓ imports
Core (Managed Agents API client)
    ↓ creates agent, sessions, streams events
Anthropic Infrastructure
    ↓ agent connects to
FastMCP Server (hosted alongside adapter or standalone)
```

Each adapter is its own deployable process. Adapters share the core library and can share or run their own MCP server depending on whether tools differ per-platform.

## Core — Managed Agents API Client

Thin async wrapper over the Managed Agents HTTP API using `httpx`. Three concerns:

### Environment Setup (one-time)

```python
env = await client.create_environment(name="daimon")
```

Creates a cloud environment with unrestricted networking. Done once, ID persisted in config.

### Agent Lifecycle (create once, reuse)

```python
skill_ids = await client.upload_skills(["brainstorming"])

agent = await client.create_agent(
    name="kosmas",
    model="claude-opus-4-6",
    system=system_prompt,
    skills=skill_ids,
    tools=[
        {"type": "agent_toolset_20260401"},
        {"type": "mcp", "url": "https://mcp-server.fly.dev/mcp", "auth": ...},
        ask_user_tool,
    ],
)
```

Agents are reusable across sessions. Skills are uploaded from `src/daimon/skills/*.md` and cached by ID. Tools include the built-in agent toolset, a remote MCP server URL, and optional custom tools like `ask_user`.

### Session & Event Streaming

```python
session = await client.create_session(
    agent_id=agent.id,
    environment_id=env.id,
    resources=[{"type": "github_repository", ...}],
)

# Open SSE stream BEFORE sending message to avoid race conditions
async with client.stream_events(session.id) as stream:
    await client.send_message(session.id, text="...")
    async for event in stream:
        # Typed: AgentMessage, ToolUse, ToolResult, StatusIdle, etc.
        ...
```

**Streaming:** `GET /v1/sessions/{id}/events/stream` (SSE). Open the stream before sending the user message.

**Polling fallback:** `GET /v1/sessions/{id}/events` for reconnection — fetch full history, track seen event IDs, then tail the live stream.

**ask_user handling:** When the session goes idle with `stop_reason: requires_action`, the adapter surfaces the question to the user. On response:

```python
await client.send_tool_result(session.id, tool_use_id=event_id, content="user's answer")
```

### Event Types

| Event | Meaning |
|-------|---------|
| `agent.message` | Assistant text output |
| `agent.thinking` | Extended thinking content |
| `agent.tool_use` | Built-in tool invocation |
| `agent.tool_result` | Built-in tool result |
| `agent.mcp_tool_use` | MCP tool invocation |
| `agent.mcp_tool_result` | MCP tool result |
| `agent.custom_tool_use` | Custom tool (e.g., `ask_user`) |
| `session.status_running` | Agent is actively working |
| `session.status_idle` | Agent paused — check `stop_reason` |
| `session.status_terminated` | Session ended |
| `session.error` | Error occurred |

### API Headers (all calls)

```
x-api-key: $ANTHROPIC_API_KEY
anthropic-version: 2023-06-01
anthropic-beta: managed-agents-2026-04-01
```

Skills upload uses: `anthropic-beta: skills-2025-10-02`

## Skills

Markdown files in `src/daimon/skills/`, versioned in the repo. Uploaded via the Skills API on agent creation.

```
src/daimon/skills/
├── brainstorming.md    # Example skill
└── ...                 # Add per-deployment
```

Upload:
```bash
curl -X POST "https://api.anthropic.com/v1/skills" \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "anthropic-beta: skills-2025-10-02" \
  -F "display_title=Brainstorming" \
  -F "files[]=@src/daimon/skills/brainstorming.md;filename=brainstorming.md"
```

The core client handles upload and caches skill IDs so adapters just pass skill names.

## Tools — FastMCP Server

FastMCP server hosted as an HTTP endpoint (SSE or streamable HTTP transport). The managed agent connects to it as a remote MCP server. Same tool definition pattern as daimon.

```
src/daimon/tools/
├── __init__.py         # Catalog: collects TOOLS lists, creates FastMCP server
└── example/
    └── __init__.py     # One example tool showing the pattern
```

Tool definition:
```python
from mcp import tool

@tool(description="Example tool that echoes input")
async def echo(message: str) -> str:
    return f"Echo: {message}"

TOOLS = [echo]
```

Catalog aggregates all `TOOLS` lists and creates the FastMCP server instance. Each adapter (or a standalone process) can serve it.

## Adapters

Each adapter is a module that imports core + tools. Entry points defined in `pyproject.toml`.

```
src/daimon/adapters/
├── __init__.py
├── discord.py      # discord.py bot
├── slack.py        # slack_bolt app
└── web.py          # FastAPI webhook/REST endpoint
```

```toml
[project.scripts]
daimon-discord = "daimon.adapters.discord:main"
daimon-slack = "daimon.adapters.slack:main"
daimon-web = "daimon.adapters.web:main"
```

### Adapter Responsibilities

1. Receive message from platform
2. Map platform conversation (Discord thread, Slack thread, web session) to a managed agents session
3. Stream events back and render in the platform's format
4. Handle `ask_user` blocks — surface question, send response back

### Session Mapping

In-memory registry mapping platform thread IDs to managed agent session IDs:

```python
sessions: dict[str, str]  # platform_thread_id -> managed_agent_session_id
```

Swap for a persistent backend later if needed.

### Scaffold

The scaffold ships with entry point stubs only — no adapter implementations. The pattern is clear enough to fill in per-deployment.

## Project Layout

```
daimon-managed/
├── pyproject.toml              # uv, single package "daimon"
├── .env.example                # ANTHROPIC_API_KEY, GITHUB_TOKEN, etc.
├── .gitignore
├── src/daimon/
│   ├── __init__.py
│   ├── core/
│   │   ├── __init__.py
│   │   ├── client.py           # Managed Agents API wrapper (httpx)
│   │   ├── events.py           # Typed event models (dataclasses)
│   │   └── sessions.py         # Session registry (in-memory)
│   ├── skills/
│   │   └── brainstorming.md    # Example skill
│   ├── tools/
│   │   ├── __init__.py         # Catalog + FastMCP server factory
│   │   └── example/
│   │       └── __init__.py     # One example tool
│   └── adapters/
│       ├── __init__.py
│       ├── discord.py          # Entry point stub
│       ├── slack.py            # Entry point stub
│       └── web.py              # Entry point stub
└── tests/
    └── ...
```

## What This Replaces from Daimon

| Daimon (current) | Daimon Managed |
|---|---|
| E2B sandboxes | Anthropic-hosted agent environment |
| Claude Agent SDK CLI in sandbox | Managed Agents API |
| Sandbox lifecycle (create, health check, recover) | Environment + session API |
| SDK event file tailing + stream parser | SSE streaming from API |
| FastMCP running inside sandbox | FastMCP as remote HTTP server |
| Supabase for sessions, routines, credentials | No database — API handles sessions |
| Discord-only | Platform-agnostic with adapter pattern |

## What Carries Over

- FastMCP tool definition pattern (`@tool`, `TOOLS` list, catalog)
- Skills as markdown files
- FCIS-style architecture (core is pure logic, adapters handle I/O)
- `ask_user` for interactive agent-user dialogue

## Non-Goals

- No database in the scaffold
- No specific adapter implementations (stubs only)
- No migration of daimon's 17 tool integrations — empty scaffold with example
- No scheduled routines (managed agents may support this separately)
