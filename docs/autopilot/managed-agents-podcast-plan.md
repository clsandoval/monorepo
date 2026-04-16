# Managed Agents Investigative Podcast — Segment Plan

## Segment 1: Cold Open (~2 min, 0:00–2:00)

**Hook:** Start mid-investigation. Describe a concrete moment — an agent running autonomously on Anthropic's servers calls a custom tool called `ask_user`, and the entire session goes idle. Hours later, a developer types `/autopilot status` and the agent resumes from exactly where it stopped.

**Setup the question:** There's a new API that changes the deal. You don't own the runtime anymore. What does that actually mean when you build real things on it?

**Tease the three systems:** Three very different architectures — a CLI orchestrator, a web chat app, and a planned clean-room rewrite of a 90-tool Discord bot.

---

## Segment 2: The API Itself (~5 min, 2:00–7:00)

Walk through the four core abstractions with concrete detail:

1. **Agents** — The definition layer: model, system prompt, tools, MCP servers, skills. Created once, versioned, referenced by ID. The `ask_user` custom tool is defined here.
2. **Environments** — Container templates: cloud type, networking rules (unrestricted vs restricted). Created once, reused across sessions.
3. **Sessions** — The runtime: references an agent + environment, mounts resources (GitHub repos), attaches vaults. This is the thing that actually runs.
4. **Events** — The communication protocol: `user.message` sends input, `agent.message` streams output, `session.status_idle` with `stop_reason` tells you what happened. The SSE stream (`GET /events/stream`) is how you watch it in real time.

**Key insight to surface:** The API separates *definition* (agent) from *execution* (session). One agent definition can power thousands of sessions. This shapes everything.

**The beta header:** `managed-agents-2026-04-01` — everything goes through this. The `agent_toolset_20260401` gives Claude file ops, bash, web search, web fetch.

---

## Segment 3: Case Study — Autopilot (~6 min, 7:00–13:00)

**Narrative arc:** "What if Claude Code could dispatch work that runs while your laptop is closed?"

Key points from the codebase:
- **Architecture:** Claude Code as a "command center" — a skill that orchestrates the API via raw `curl` calls from Bash
- **One-time setup vs per-job:** Environment and vault are created once (setup.md). Agents are created *per job* with task-specific skills and the `ask_user` custom tool (intake.md)
- **The skills upload:** Custom skills uploaded via multipart form to `/v1/skills` with a separate beta header (`skills-2025-10-02`). Includes a brainstorming skill that enforces structured one-question-at-a-time exploration
- **The interactive bridge:** The `ask_user` custom tool is the key innovation. Agent calls it → session goes idle with `stop_reason: requires_action` → user checks in via `/autopilot status` → answer sent as `user.custom_tool_result` → agent resumes
- **Git as persistence:** Agent commits to `autopilot/<slug>` branches. If the session crashes, the branch has all committed work. PRs created by the local orchestrator (the `gh` CLI is blocked inside the Managed Agents container)
- **Networking constraint:** All traffic goes through an HTTP proxy inside the container — no raw TCP. This is why MCP tools default to `always_ask` and why the design avoids them

**The punchline:** Autopilot treats the Managed Agents API as a *job queue for Claude*. Fire and forget, check in later. The `ask_user` tool turns a fundamentally asynchronous system into something that can have a conversation — just very slowly.

---

## Segment 4: Case Study — Podplay Ops Chat (~6 min, 13:00–19:00)

**Narrative arc:** "What does it look like to put a web UI in front of this API?"

Key points from the codebase:
- **Current architecture:** React + TypeScript frontend, Node.js/Hono backend. Currently uses Claude Agent SDK locally with the `query()` function — runs the agent in the same process as the server
- **The Managed Agents version (described in brief):** Would replace the local agent loop with API calls. `server/src/lib/anthropic.ts` would become a thin client to `/v1/sessions` endpoints
- **Session management challenge:** The current system manages sessions via JSON files on disk (`server/src/sessions.ts`). The Managed Agents API handles session persistence server-side — this entire file could potentially be simplified
- **SSE streaming:** The API's `GET /v1/sessions/{id}/events/stream` maps naturally to the browser's EventSource. But there's a layer problem: the server needs to buffer events for browser reconnection/replay (last 200 events), support multiple browser tabs subscribing to the same session, and handle auto-reconnection with deduplication
- **Event flow:** Browser → Hono backend → Anthropic API → SSE stream back → server buffers → SSE/WebSocket to browser. The server is a *proxy* that adds reliability
- **Resource integration:** GitHub repository mounting (podplay-data repo), vault IDs for data access
- **Archive pattern:** `POST /v1/sessions/{id}/archive` for idle sessions — important for a web app where sessions accumulate

**The punchline:** The web app reveals the API's streaming model. The API gives you SSE, but production web apps need buffering, reconnection, multi-subscriber support, and deduplication. The "middle layer" between the API and the browser is where the real engineering happens.

---

## Segment 5: Case Study — Daimon (~6 min, 19:00–25:00)

**Narrative arc:** "What happens when you take a 90-tool Discord bot with E2B sandboxes, Supabase, FastMCP, and a custom HTTP protocol... and replace it all with one API?"

Key points from the codebase:
- **Current architecture complexity:** Discord bot → E2B AsyncSandbox → Claude Agent SDK CLI → FastMCP tools → Supabase. 95 registered tools across 12 platforms (Toggl, LinkedIn, Discord, Fly.io, GitHub, etc.). Custom `ToolContext`, `UserContext`, `DatabaseContext` dataclasses. GateRegistry for message coalescing. Custom ACP (Agent Communication Protocol) for Claude-to-Claude communication
- **The files that get deleted:**
  - `lifecycle.py` (sandbox create/kill) → replaced by `/v1/agents` + `/v1/sessions`
  - `stream_reader.py` (file tailing + SDK parser) → replaced by `/v1/sessions/{id}/events/stream`
  - `routing.py` (sandbox ID tracking) → replaced by session ID tracking
  - `http_client.py` (custom /message, /interrupt) → replaced by `/v1/sessions/{id}/events`
- **The clean-room approach:** Not porting the 90+ tools. Starting with an empty scaffold — tool registration pattern + one example tool. Skills as `.md` files in the repo
- **No database initially:** Managed Agents handles session persistence, conversation history, ask_user state. No Supabase needed for the core loop
- **Platform-agnostic core:** Python library with `uv` — adapters for Discord, Slack, web import it as a library. The current version is Discord-native; the new version treats Discord as just one adapter

**The punchline:** Daimon is the most dramatic story because it shows what the API *replaces*. Sandbox lifecycle management, stream parsing, health checks, file-based event deserialization — all of that infrastructure becomes someone else's problem. But the 90+ tools don't move to the Managed Agents API. They stay as MCP tools or get reimplemented. The API handles execution infrastructure, not business logic.

---

## Segment 6: Patterns & Close (~5 min, 25:00–30:00)

**Cross-cutting patterns discovered across all three systems:**

1. **The proxy pattern:** Every system needs a layer between its users and the Managed Agents API. Autopilot uses Claude Code as the proxy. Podplay uses a Hono backend. Daimon would use a Python core library. Nobody talks to the API directly from a user-facing interface.

2. **Custom tools as control flow:** The `ask_user` custom tool appears in all three designs. It's not just a tool — it's a *control flow mechanism*. It turns the API's fire-and-forget model into something interactive. The session pauses, the orchestrator polls, the user responds, the session resumes.

3. **Git as the persistence layer:** Both Autopilot and the Managed Agents system prompt use git branches as the durable record of work. Not a database. Not a file store. Git. If the session crashes, `git log` tells you where it got to.

4. **The session-per-task pattern:** All three systems create fresh sessions for each piece of work. Sessions are cheap and disposable. The expensive thing to create is the agent definition (once) and the environment (once).

5. **What the API doesn't do:** Business logic. The Daimon case makes this clearest — 90+ tools for Toggl, LinkedIn, Discord, GitHub, etc. Those don't live in the API. They live in your codebase. The API handles *execution infrastructure*, not *domain knowledge*.

**The bigger picture:** What does it mean that Anthropic is hosting agent execution?
- You don't debug the sandbox. You don't manage container images. You don't write the agent loop.
- But you also can't customize the sandbox, can't control the networking beyond "unrestricted" vs "restricted", can't run arbitrary services alongside the agent.
- The operating system metaphor from Anthropic's engineering blog: they're virtualizing the agent the way Unix virtualized hardware. `session` is to agents what `process` is to programs.

**Close with three takeaways:**
1. The API is a *meta-harness* — it handles execution while you handle definition and orchestration
2. Custom tools are the escape hatch for interactivity in an asynchronous system
3. The biggest win isn't what the API does — it's what you get to delete from your codebase
