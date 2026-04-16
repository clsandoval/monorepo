# The Managed Agents API: How One API Powers Three Very Different Systems

**An Investigative Podcast Script**

*Runtime: ~30 minutes*
*Format: Single host, investigative deep-dive*
*Audience: Developers and AI engineers*

---

## [SEGMENT 1] Cold Open
**[0:00–2:00]**

---

**[HOST]**

There's a Claude agent running right now on Anthropic's infrastructure. It's been working for forty minutes. It has read a codebase, identified three possible approaches to a problem, written them up — and then it did something unexpected.

It called a tool called `ask_user`.

And then… it stopped. The entire session went idle. No crash. No timeout. Just — stopped. Waiting.

Three hours later, a developer opens their terminal, types `/autopilot status`, and sees this:

> **Status:** Blocked — waiting for your input.
> **Question:** "Which approach should we take for the webhook handler?"
> **Options:** A, B, or C.

They type "B." The answer gets sent back to Anthropic's servers. The agent picks up exactly where it left off and starts writing code.

*[beat]*

That interaction — an AI agent that can pause itself, wait for a human, and resume — that's not built into the model. It's not a feature of Claude. It's an architectural pattern that emerges from one very specific API.

On April 8th, 2026, Anthropic launched the public beta of something called **Claude Managed Agents**. It's a REST API that bundles the agent loop, tool execution, sandbox containers, and state persistence into a handful of endpoints. The pitch is straightforward: stop building agent infrastructure, start building agents.

But here's the thing. When you hand your runtime to someone else, the API doesn't just *enable* your architecture — it *shapes* it. The abstractions Anthropic chose — what's a session, what's an agent, what's an event — those decisions ripple through every system built on top.

Today, I'm going to walk through three real systems that use this API. Or will use it. I've read the actual codebases. I've traced the curl calls. I'm not speculating — I'm reporting what I found.

The three systems are:

**First**, Autopilot — a CLI tool that dispatches autonomous coding agents you can walk away from.

**Second**, Podplay Ops Chat — a full-stack web application that puts a React frontend in front of Managed Agents sessions.

**Third**, Daimon — a Discord bot with ninety-five tools and a five-layer architecture that's planning a clean-room rewrite on top of this API.

Three very different products. Three very different teams. One API.

Let's find out what happens.

---

## [SEGMENT 2] The API Itself
**[2:00–7:00]**

---

**[HOST]**

Before we get into the case studies, let's talk about what this API actually *is*. Because if you haven't used it, the mental model might be wrong.

This is not a chat completion endpoint. You don't send messages and get responses. You send messages and kick off an autonomous agent that runs in a container on Anthropic's infrastructure, potentially for hours, making its own decisions about which tools to call, which files to read, which commands to run.

The API is built around four core abstractions. And the design of these abstractions is, frankly, the most interesting part.

**[beat]**

**Number one: Agents.**

An agent is a *definition*. Not a running thing — a blueprint. You create it once with a POST to `/v1/agents`, and you get back an ID and a version number.

The definition includes the model — say, `claude-opus-4-6` — the system prompt, the tools the agent can use, any MCP servers it should connect to, and any skills it should follow.

There's a built-in toolset called `agent_toolset_20260401` that gives Claude file operations — read, write, edit, glob, grep — plus bash, web search, and web fetch. That's your baseline. On top of that, you can add MCP toolsets and — this is important — *custom tools*.

A custom tool is a tool that the API doesn't execute. When the agent calls it, the session goes idle, and *you* provide the result. That `ask_user` tool from the cold open? That's a custom tool. The agent calls it, the session pauses with a stop reason of `requires_action`, and your orchestrator is responsible for collecting the answer and sending it back.

We'll see this pattern in every single system we look at today.

*[beat]*

**Number two: Environments.**

An environment is a container template. You configure it with a POST to `/v1/environments`. You choose cloud as the type. You set networking — unrestricted or restricted. You can pre-install packages, mount files.

The key thing about environments is that they're *reusable*. You create one and reference it by ID every time you start a session. In practice, most of the systems I looked at create exactly one environment and never touch it again.

**Number three: Sessions.**

This is where execution happens. A session references an agent definition and an environment. When you create a session with a POST to `/v1/sessions`, you can also mount resources — like a GitHub repository — and attach credential vaults.

A session is a *running instance*. It provisions a container, loads your agent definition, and waits for you to send it something.

**Number four: Events.**

Events are the communication protocol. You send events to a session and receive events from it. This is the part that looks most different from a traditional API.

To send a message, you POST to `/v1/sessions/{id}/events` with a `user.message` event. To watch what's happening, you open an SSE stream at `/v1/sessions/{id}/events/stream`. The agent sends back `agent.message` events as it works, `agent.tool_use` when it calls tools, and — crucially — `session.status_idle` when it has nothing more to do.

But "idle" doesn't mean "done." This tripped up every implementation I looked at. You have to check the `stop_reason` on the idle event. If it's `end_turn`, the agent finished naturally. If it's `requires_action`, the agent is *blocked* — it called a custom tool and is waiting for your response.

That distinction — idle because I'm done versus idle because I need something — that's the hinge point of the entire API. Get it wrong, and your agent sits there forever, waiting for a response that nobody sends.

*[beat]*

Now, there's one more design decision in this API that shapes everything, and it's easy to miss.

The API separates *definition* from *execution*. One agent definition can power a thousand sessions. You define the agent once — the model, the prompt, the tools — and then you create cheap, disposable sessions that reference it. Sessions are ephemeral. Agent definitions are durable and versioned.

This separation is the reason every system I looked at follows the same pattern: set up once, dispatch many times.

Keep that in mind.

---

## [SEGMENT 3] Case Study: Autopilot
**[7:00–13:00]**

---

**[HOST]**

Autopilot answers a simple question: *What if you could dispatch coding work from your terminal and walk away?*

The idea is this. You're in Claude Code — Anthropic's CLI coding tool. You type `/autopilot`. You describe what you want built. You answer three or four intake questions — which repo, which branch, any constraints. And then the skill dispatches an autonomous agent to Anthropic's infrastructure. You close your laptop. The agent brainstorms, writes a spec, makes a plan, implements code, commits to git. If it hits a question it can't answer, it pauses and waits. You check in later.

Now here's what makes this architecturally interesting: **the orchestrator is also an AI.** Claude Code — which is itself Claude — is using bash and curl to call the Managed Agents API. It's AI orchestrating AI. But the orchestration layer is just shell scripts embedded in markdown files.

I read the entire codebase. Five markdown files — `SKILL.md`, `setup.md`, `intake.md`, `status.md`, and `system-prompt.md` — contain the complete implementation. No JavaScript. No Python. Just markdown with embedded bash.

*[beat]*

Let's trace through how it works.

**Setup happens once.** The `setup.md` file walks Claude Code through creating an environment via `POST /v1/environments` with unrestricted networking, and optionally creating a vault via `POST /v1/vaults` for GitHub credentials. The results get saved to a local JSON file at `.superpowers/autopilot-config.json`. If that file already exists, setup is skipped.

**Agent creation happens per job.** This is a deliberate choice. Every time you dispatch work, the `intake.md` flow creates a *fresh* agent with task-specific skills. If the task involves brainstorming, the brainstorming skill gets uploaded via `POST /v1/skills` — a multipart form upload with a separate beta header, `skills-2025-10-02`. If the task is spreadsheet work, the `xlsx` Anthropic pre-built skill gets attached.

The agent definition includes `claude-opus-4-6` as the model, a system prompt read from `system-prompt.md`, the `agent_toolset_20260401` for built-in tools, and — this is the key — a custom tool definition for `ask_user`.

Here's what that custom tool definition looks like in the agent creation payload:

```json
{
  "type": "custom",
  "name": "ask_user",
  "description": "Ask the user a question. The session will pause until the user responds.",
  "input_schema": {
    "properties": {
      "question": {"type": "string"},
      "options": {"type": "array", "items": {"type": "string"}},
      "context": {"type": "string"}
    },
    "required": ["question", "context"]
  }
}
```

That's it. That's the interactive bridge. The agent knows it can call this tool. When it does, the API doesn't have an implementation for it — so the session goes idle with `stop_reason: requires_action`.

*[beat]*

**Session creation** ties everything together. A POST to `/v1/sessions` references the newly created agent by ID and version, the persistent environment by ID, mounts the GitHub repository at `/workspace/repo`, and attaches the vault for credentials. Then a second POST to `/v1/sessions/{id}/events` sends the brief as a `user.message` event.

And then… the skill just says "done" and tells the user to check back later.

**The status check** is where the architectural elegance shows. When the user types `/autopilot status`, the `status.md` file fetches events from `GET /v1/sessions/{id}/events` and does something clever — it scans through the event history using `jq` to reconstruct the agent's state.

Current phase? Find the last agent message that mentions "Phase."
Pending question? Find `agent.custom_tool_use` events with no matching `user.custom_tool_result`.
Decisions made? Scan for lines starting with "Decision:" in agent messages.

If the agent is blocked, the status flow surfaces the question, asks the user for an answer, and sends it back as a `user.custom_tool_result` event. The agent picks up exactly where it stopped.

*[beat]*

Now, here's the pattern that I think is most significant. **Git is the persistence layer.** The agent's system prompt says: "Commit frequently so work survives crashes or restarts." The agent works on `autopilot/<slug>` branches. Every spec, every plan, every chunk of implementation gets its own commit prefixed with `autopilot:`.

And there's a crash recovery protocol. Before starting work, the agent checks if the branch already exists. If it finds existing `autopilot:` commits, it reads the spec and plan files and picks up from the last completed phase.

This means the session itself is disposable. If Anthropic's infrastructure hiccups, if the container dies, the work is in git. You restart a new session pointed at the same branch and the agent catches up.

One more thing. There's a networking detail that drove a design decision. Inside the Managed Agents container, all outbound traffic goes through an HTTP proxy. No raw TCP. This means MCP tools — which need network access — default to an `always_ask` permission mode, which would pause the session constantly for tool approvals. The Autopilot design explicitly avoids MCP tools for this reason, using bash and the `gh` CLI instead.

**The takeaway:** Autopilot treats the Managed Agents API as a *job queue for Claude*. Fire and forget, check in later. The custom tool is the only interactive element in an otherwise fully autonomous system.

---

## [SEGMENT 4] Case Study: Podplay Ops Chat
**[13:00–19:00]**

---

**[HOST]**

If Autopilot is "fire and forget," Podplay Ops Chat is the opposite. It's a real-time conversation. You open a web browser, type a message, and watch an agent work — streaming text, tool calls, file operations — all rendered live in a React frontend.

The architecture is a full-stack application. React with TypeScript on the frontend. A Node.js server using the Hono framework on the backend. A Dockerfile for deployment. End-to-end tests in Playwright. It's a production web application, not a script.

But here's what's interesting: this system reveals the *gap* between what the Managed Agents API gives you and what a production web app actually needs.

*[beat]*

Let me walk through the architecture the brief describes for the Managed Agents integration.

The server-side code would live in something like `server/src/lib/anthropic.ts` — a module that makes direct API calls to the Managed Agents endpoints with the beta header `managed-agents-2026-04-01`. There would be a session manager — say, `server/src/lib/session-manager.ts` — that maintains an in-memory session orchestrator with SSE stream connections to the Managed Agents API.

The core operations map cleanly to API endpoints:

- `POST /v1/sessions` — create a new session
- `POST /v1/sessions/{id}/events` — send user messages, potentially with file blocks
- `GET /v1/sessions/{id}/events` — list events with pagination
- `GET /v1/sessions/{id}/events/stream` — the SSE live stream
- `POST /v1/sessions/{id}/archive` — archive idle sessions

On paper, this looks simple. But here's where reality complicates things.

**Problem one: Browser reconnection.** When a user refreshes the page or their connection drops, they need to catch up on what happened while they were gone. The Managed Agents API gives you pagination on events — you can fetch historical events. But that's a full HTTP request per page. For a smooth user experience, you want the server to *buffer* recent events — say, the last two hundred — and replay them instantly when a browser reconnects. That buffer doesn't exist in the API. You build it.

**Problem two: Multiple subscribers.** Two browser tabs open to the same session. One WebSocket connection from each tab. But you only want *one* SSE connection to the Managed Agents API. So the server needs a pub/sub layer — one upstream connection, multiple downstream subscribers. The API doesn't help here.

**Problem three: Deduplication.** If your SSE connection to Anthropic drops and you reconnect, you might get overlapping events. The server needs to deduplicate based on event IDs so the browser doesn't see the same message twice.

**Problem four: Resource integration.** The session needs a GitHub repository mounted. The brief mentions the `podplay-data` repo. That means at session creation time, the server needs to pass repository URLs, authorization tokens, mount paths, and checkout branches — all in the `resources` array of the session creation payload.

*[beat]*

Now look at the current implementation — before Managed Agents. It's instructive.

The current server uses the `@anthropic-ai/claude-agent-sdk` package directly. There's a `runAgent` function that calls `query()` from the SDK and iterates over the returned async generator. The agent runs *in the same process* as the web server. Session persistence is handled by JSON files on the server's filesystem.

```typescript
const generator = query({
  prompt: session.stream,
  options: {
    model: 'claude-sonnet-4-6',
    cwd: WORKSPACE_DIR,
    permissionMode: 'bypassPermissions',
    allowedTools: ['Read', 'Glob', 'Grep', 'Write', 'Edit', 'Bash', 'WebSearch', 'WebFetch'],
  },
});
```

With Managed Agents, all of that execution moves to Anthropic's infrastructure. The server becomes a *proxy* — accepting messages from the browser, forwarding them to the API, and relaying the event stream back. The `sessions.ts` file that currently manages sessions via JSON files on disk could be dramatically simplified, because event history lives server-side in the API.

But the proxy isn't thin. It has to do the buffering, the multi-subscriber fan-out, the deduplication, the reconnection logic. That's where the engineering happens.

*[beat]*

There's another pattern here that's specific to web applications: **session archival.** In a web app, sessions accumulate. Users start conversations, abandon them, come back days later. The Managed Agents API provides `POST /v1/sessions/{id}/archive` for exactly this — archiving idle sessions to free up resources. The web app needs a strategy for when to archive. After an hour of inactivity? After the user explicitly closes the chat? This is UX-level decision-making driven by an API constraint.

**The takeaway:** Podplay Ops Chat reveals what I'd call the "middle layer problem." The Managed Agents API handles execution infrastructure beautifully. The browser handles rendering. But between them, you need a server that translates between two worlds — the API's event stream protocol and the browser's expectations for real-time web applications. That middle layer is not trivial.

---

## [SEGMENT 5] Case Study: Daimon
**[19:00–25:00]**

---

**[HOST]**

The Daimon story is the most dramatic of the three, because it's not about what you build on top of the API — it's about what you get to *delete*.

Let me paint the picture of what Daimon looks like *today*, without Managed Agents.

Daimon is a Discord bot. An organizational orchestration platform for a company. You @-mention it in Discord, and it can do… almost anything. Track time in Toggl. Create issues in Linear. Post to LinkedIn. Search a knowledge base. Launch and manage Fly.io sessions. Read meeting transcripts. Run GitHub CLI commands. Create short links. Query Google Analytics. Manage ad campaigns.

Ninety-five registered tools. Twelve platform integrations. The tool catalog is over a thousand lines just for the *definitions*.

The architecture has five layers. A Discord bot built with discord.py handles incoming messages. It constructs `ToolContext`, `UserContext`, and `DatabaseContext` dataclasses — frozen, immutable objects containing all the credentials and configuration for the current request. Then it calls the Claude Agent SDK, which picks tools from a `ToolRegistry` that dispatches to async handler functions. Tool results go back through Claude. Claude's response streams back to Discord.

For longer-running tasks, there's a whole second execution path. The bot launches E2B sandboxes — ephemeral virtual machines — and runs the Claude Agent SDK CLI inside them. There's a custom `stream_reader.py` that *tails files* in the sandbox to parse event streams. A custom `http_client.py` implements something called ACP — Agent Communication Protocol — for Claude-to-Claude communication via HTTP POST. There's a `lifecycle.py` that manages sandbox creation and teardown. A `routing.py` that tracks sandbox IDs.

And underneath all of this, there's Supabase. Auth, database, credential storage via Vault, real-time subscriptions. The schema has eleven migration files covering tenants, members, API keys, service connections, subscriptions, messages, and tool calls.

*[beat]*

Now here's the planned Managed Agents version.

**It's a clean-room rewrite.** Not a migration — a new thing.

The core idea: a platform-agnostic Python library, built with `uv`, that *any* chat platform can import. Discord would be an adapter. Slack would be an adapter. A web frontend would be an adapter. The core library handles everything else.

And "everything else" is… remarkably little. Because Managed Agents handles the parts that used to be hardest.

Let me trace the replacement map:

`lifecycle.py` — the file that creates and kills E2B sandboxes, manages their lifecycle, handles timeouts — becomes `POST /v1/agents` and `POST /v1/sessions`. The API creates the sandbox. The API kills it. You don't think about it.

`stream_reader.py` — the file that tails event files in the sandbox, parses the Claude Agent SDK's stream format, deserializes events — becomes `GET /v1/sessions/{id}/events/stream`. A standard SSE connection. The same protocol your browser uses.

`routing.py` — the file that tracks which sandbox belongs to which conversation — becomes session ID tracking. The API gives you a session ID when you create one. That's your routing key.

`http_client.py` — the custom HTTP client that sends messages and interrupts to sandboxes via a bespoke protocol — becomes `POST /v1/sessions/{id}/events`. A single endpoint for all input.

*[beat]*

But here's the part I find most compelling: **the tool catalog doesn't move.**

Those ninety-five tools? The Toggl integration, the LinkedIn integration, the Discord read/write tools, the Fly.io session management? None of that is handled by the Managed Agents API. The API runs Claude in a sandbox with file tools and bash. Your business logic stays in your codebase.

The planned approach is what I'd call the **empty scaffold pattern.** You build a tool registration mechanism and one example tool. That's it. You don't port the ninety-five-tool catalog. You prove the architecture works with one tool, and then you add tools incrementally.

And there's one more simplification that's almost shocking: **no database.** At least not initially. The Managed Agents API handles session persistence, conversation history, even the `ask_user` state. The Supabase dependency — auth, database, vault, real-time — is needed for the SaaS version of Daimon, but the core agent loop doesn't need any of it. The API is the database.

*[beat]*

The planned architecture would also use skills differently than Autopilot. Instead of uploading skills via the API at agent creation time, skills would live in the repo as markdown files — a `skills/` directory. The core library would handle reading them and uploading them when creating an agent. Skills as code, version-controlled alongside the library.

**The takeaway:** Daimon is the poster child for the Managed Agents value proposition. Not because of what it builds — but because of what it *deletes*. Sandbox lifecycle management. Stream parsing. Health checks. File-based event deserialization. Custom communication protocols. All of that infrastructure, written and maintained and debugged over months — replaced by a handful of REST API calls.

But the business logic? The ninety-five tools? The multi-platform integrations? Those stay. The API handles the *plumbing*. The *wiring* is still yours.

---

## [SEGMENT 6] Patterns and Close
**[25:00–30:00]**

---

**[HOST]**

So. Three systems. One API. What patterns emerge?

*[beat]*

**Pattern one: Nobody talks to the API directly.**

Every single system puts a proxy layer between the user and the Managed Agents API. Autopilot uses Claude Code itself — an AI as the orchestrator. Podplay uses a Hono backend server. Daimon would use a Python core library.

This isn't surprising when you think about it. The API is designed for machine-to-machine communication. Sessions are long-lived. Events are append-only. Status requires interpretation. You need something in between that translates this model into whatever your user interface expects — a CLI, a web app, a Discord bot.

**Pattern two: Custom tools are control flow.**

The `ask_user` pattern appears in every system. But it's not really a tool — it's a *state machine transition*. The agent decides it needs input, calls the custom tool, and the session enters a suspended state. The orchestrator detects this by checking `stop_reason.type === 'requires_action'`. The user provides input. The orchestrator sends a `user.custom_tool_result` event. The session resumes.

This is how you build interactivity on top of an inherently asynchronous system. The Managed Agents API isn't designed for chat. It's designed for *work*. But custom tools let you punch escape hatches into the work that feel like chat.

**Pattern three: Sessions are cheap. Agent definitions are precious.**

Every system creates a new session per task. Autopilot creates a session per dispatch. Podplay would create a session per conversation. Daimon would create a session per Discord message thread.

But agent definitions are treated carefully. Autopilot creates agents per-job because each job has different skills, but the environment is reused forever. The Daimon plan would create one agent definition and reference it across all sessions. This is the API nudging you toward a specific architecture: define once, execute many.

**Pattern four: Git is the persistence layer.**

This one surprised me. Both Autopilot and the Managed Agents system prompt use git branches as the durable record of work. Not session events. Not a database. Git.

And there's a reason. Sessions can be terminated. Containers can die. But if the agent was committing as it worked, the branch survives. You can start a new session, check out the branch, and the crash recovery protocol picks up where things left off.

It's clever. It's also a direct consequence of having to work within a system where you don't control the runtime. When you can't guarantee the container will stay alive, you push state to the one place that's definitely external: the git remote.

**Pattern five: The API handles infrastructure. You handle domain.**

The Daimon case makes this clearest. Ninety-five tools don't move to the API. They stay in the codebase. The API replaces `lifecycle.py` and `stream_reader.py` and `routing.py` — the *execution infrastructure*. It doesn't replace the Toggl integration or the LinkedIn posting or the Google Analytics queries.

This is by design. The API is infrastructure. Your tools, your skills, your system prompts — that's your product.

*[beat]*

**The bigger picture.**

Anthropic's engineering blog describes Managed Agents using an operating system metaphor. They say they're virtualizing the agent the way Unix virtualized hardware. Sessions are to agents what processes are to programs. The event log is to agent state what the filesystem is to process state.

And like an operating system, the API makes decisions for you. Your container runs on their infrastructure. Your networking goes through their proxy. Your tools execute in their sandbox. You trade control for reliability, customization for simplicity.

For some systems — like Daimon, drowning in five layers of infrastructure — that trade is overwhelmingly positive. Months of engineering replaced by API calls.

For others — like Podplay Ops Chat, needing real-time streaming with buffering and reconnection — the API provides the foundation, but the engineering doesn't disappear. It moves to the middle layer.

And for all of them, there's a question that doesn't have an answer yet: What happens when you need something the API doesn't support? When you need custom networking, or a specific runtime, or a tool that requires local state the container doesn't preserve?

That's the tension at the heart of managed infrastructure. It's the tension between "just use the API" and "the API shapes your architecture."

*[beat]*

**Three takeaways.**

**One:** The Managed Agents API is a *meta-harness*. It handles the agent loop, the sandbox, the tool execution, the state persistence. You handle the agent definition and the orchestration layer on top. Every production system needs that orchestration layer.

**Two:** Custom tools are the most powerful feature in the API, and they're not what you'd expect. They're not tools — they're *escape hatches*. They let you inject human interaction, external data, or custom logic into an otherwise autonomous system. The `ask_user` pattern is just the first of many.

**Three:** The biggest win of this API isn't what it lets you build. It's what it lets you *delete*. Sandbox lifecycle management. Stream parsing. Health checks. Agent loops. Context management. All the infrastructure that sits between "I have a prompt" and "I have an agent running in production." That's what the API replaces.

And that might be worth the trade.

*[beat]*

That's the investigation. Three systems, one API, and the architectural choices that connect them.

I'm [HOST]. Thanks for listening.

---

*[END]*

---

## Production Notes

**Total runtime:** ~30 minutes at standard podcast reading pace (~150 words/minute)

**Music/sound cues:**
- Subtle intro music under cold open, fade out by 0:30
- Brief transition tones between segments
- Low ambient under "bigger picture" section for gravitas
- Clean outro

**Editing notes:**
- `[beat]` markers indicate natural pauses (1–2 seconds) for pacing
- Code blocks should be read aloud selectively — describe the structure rather than reading every field
- Technical terms (SSE, MCP, REST, CLI) can be spoken as acronyms without expansion for this audience

**Source material:**
- `automations/autopilot/` — full skill implementation (SKILL.md, setup.md, intake.md, status.md, system-prompt.md)
- `docs/superpowers/specs/2026-04-10-autopilot-skill-design.md` — Autopilot design spec
- `docs/superpowers/plans/2026-04-10-autopilot-skill.md` — Autopilot implementation plan
- `projects/ops-knowledgebase-chat/server/src/` — Podplay server code (agent.ts, sessions.ts, protocol.ts)
- `loops/daimon-saas-reverse/final-mega-spec/source/` — Daimon existing architecture docs (existing-bot-architecture.md, existing-tools.md)
- Anthropic Managed Agents API documentation at platform.claude.com/docs/en/managed-agents/
- Anthropic engineering blog: "Scaling Managed Agents: Decoupling the brain from the hands"
