# Hermes Agent — Discord Developer UX Features

**Date:** 2026-04-08
**Status:** Draft
**Project:** `projects/hermes-agent`

## Context

Hermes Agent is a mature AI agent (v0.7.0) by Nous Research with a working Discord gateway (`gateway/platforms/discord.py`, ~2,800 lines). It's deployed as a separate bot on a small-group collaborator server focused on end-to-end software development from within Discord.

Decision-orchestrator (Daimon) already solved key UX patterns for development-in-Discord — live status embeds during tool use, channel context injection on @mention, and tight GitHub integration. This spec ports those patterns into hermes-agent's existing Discord gateway using modular additions.

## Goals

1. Show live-updating status embeds during agent tool use and thinking (Daimon-style)
2. Inject last 20 channel messages as context when the bot is @mentioned
3. Ensure @-mention-only mode works correctly (already default)
4. Make GitHub CLI available by default for project work

## Non-Goals

- Sandboxed execution (E2B or similar) — use hermes's built-in host tools
- Starter repo system — out of scope
- Changes to the agent core or tool execution pipeline
- New slash commands
- Voice channel features

## Architecture

### Approach: Modular additions alongside the gateway

Three new modules added to `gateway/`, imported by the existing `DiscordAdapter`. The gateway's message handler gets surgical edits at existing hook points. The agent core stays untouched.

### New Modules

| Module | Purpose |
|--------|---------|
| `gateway/discord_status.py` | Status embed builder — create, update, finalize embeds showing tool use/thinking |
| `gateway/discord_context.py` | Channel context collector — fetch last 20 messages, format as XML context |
| `gateway/discord_hooks.py` | Lifecycle hooks — wire status embeds into the agent's tool/streaming callbacks |

### Integration Points (existing gateway)

| Hook Point | Location | Current Behavior | New Behavior |
|------------|----------|------------------|--------------|
| `on_processing_start()` | discord.py:733-739 | Adds "👀" reaction | Sends initial status embed |
| `on_processing_complete()` | discord.py:741-748 | Swaps reaction to "✅"/"❌" | Deletes status embed (success) or turns it red (error) |
| `GatewayStreamConsumer.on_delta(None)` | stream_consumer.py:84-94 | Signals tool boundary | Also triggers status embed update |
| `_handle_message()` | discord.py:~2240 | Dispatches event to agent | Fetches channel context first, prepends to message |

### Data Flow

```
User @mentions bot in #general
        │
        ▼
on_message() — mention filter passes (existing, line 552)
        │
        ▼
_handle_message() — NEW: call discord_context.collect_channel_messages()
        │              fetch last 20 messages, format as XML, prepend to event
        ▼
on_processing_start() — NEW: send initial status embed via discord_status
        │
        ▼
Agent processes message, calls tools
        │
        ├─ on tool start → discord_hooks updates status embed (active tool)
        ├─ on tool complete → discord_hooks updates status embed (completed tool)
        ├─ on text delta → discord_hooks updates text preview in embed
        │
        ▼
on_processing_complete()
        │
        ├─ success → delete status embed, final response sent by GatewayStreamConsumer
        └─ error → turn status embed red with error text
```

## Feature 1: Status Embed

### Lifecycle

1. **Initial** — Sent on `on_processing_start()`. Blue embed (`0x3498DB`), shows "Thinking..." with elapsed timer.
2. **Tool updates** — As tools fire, the embed is edited to show the current active tool and a rolling list of recently completed tools (max 5 visible).
3. **Text preview** — When the agent starts generating text, a preview field appears (max 300 chars, updates on `edit_interval`).
4. **Completion** — Status embed is deleted. The final response is delivered by the existing `GatewayStreamConsumer` as a normal message.
5. **Error** — Embed turns red (`0xE74C3C`), shows error text, stops updating.

### Embed Format

```
┌──────────────────────────────────┐
│ 🔧 Working...          ⏱ 12s    │
│                                  │
│ ▸ Reading main.py                │  ← active tool (bold)
│                                  │
│ Completed:                       │
│ ✓ Searched for "auth handler"    │
│ ✓ Read config.yaml               │
│                                  │
│ 💬 "The issue is in the auth..." │  ← text preview (optional)
└──────────────────────────────────┘
```

### State Management

`StatusEmbedState` dataclass (pure, no I/O):

```python
@dataclass
class ActiveTool:
    name: str
    formatted_args: str  # human-readable narration

@dataclass
class StatusEmbedState:
    active_tools: list[ActiveTool]
    completed_tools: tuple[str, ...]  # max 5, FIFO
    turn_started_at: float
    text_preview: str | None  # max 300 chars
    error: str | None
```

### Tool Narration

Human-readable descriptions for common hermes tools:

| Tool Pattern | Narration |
|-------------|-----------|
| `read_file("src/main.py")` | "Reading src/main.py" |
| `write_file("src/main.py", ...)` | "Writing src/main.py" |
| `execute("gh pr list")` | "Running `gh pr list`" |
| `search_files("auth handler")` | "Searching for 'auth handler'" |
| `web_search("discord.py embeds")` | "Searching web for 'discord.py embeds'" |
| Unknown tool | "Running {tool_name}" |

### I/O Layer

`discord_status.py` handles all Discord API calls:

- `send_initial_status(channel) -> discord.Message` — creates and sends the embed
- `update_status(state, message)` — edits the embed message with current state
- `finalize_status_error(message, error_text)` — turns embed red
- `delete_status(message)` — deletes the embed message
- All functions are None-safe (silently skip if message/channel is None)

### Rate Limiting

Discord allows ~5 message edits per 5 seconds per message. The embed update is throttled to match:
- Minimum 1 second between edits
- State changes are buffered; only the latest state is sent on each edit tick

## Feature 2: Channel Context Injection

### Behavior

When the bot is @mentioned in a channel (not in an existing thread), fetch the last 20 messages and inject them as XML context before the user's message.

### Message Collection

`discord_context.py`:

- `collect_channel_messages(channel, limit=20) -> list[discord.Message]`
  - Calls `channel.history(limit=20, oldest_first=False)`
  - Filters out system messages (pins, joins, boosts) — keeps `MessageType.default` and `MessageType.reply`
  - Reverses to chronological order (oldest first)
  - Resolves `<@id>` mentions to display names

### XML Format

```xml
<channel_context description="Recent messages from #general for conversational context">
  <message id="123" author="alice" timestamp="2026-04-08T10:30:00+00:00">
    anyone looked at the auth bug yet?
  </message>
  <message id="124" author="bob" timestamp="2026-04-08T10:31:00+00:00" reply-to-author="alice" reply-to-id="120">
    yeah I pushed a fix, PR is up
  </message>
</channel_context>
```

**Rules:**
- Include attachment URLs as `[Attachments: url1, url2]` suffix
- Only for channel @mentions — threads already have history via hermes's existing thread tracking
- The context XML is prepended to the message content passed to the agent handler

### Integration

In `_handle_message()` at line ~2240, after mention check passes:

```python
# Only for channel messages (not threads)
if not isinstance(message.channel, discord.Thread):
    context_messages = await collect_channel_messages(message.channel, limit=20)
    channel_context_xml = format_channel_context(context_messages)
    # Prepend to event text
```

## Feature 3: @-Mention Only Mode

Already the default behavior in hermes. `DISCORD_REQUIRE_MENTION` defaults to `"true"` (line 2226). No code changes needed.

Existing thread participation tracking (`_bot_participated_threads`) means once the bot responds in a thread, it stays responsive there without re-mentioning. This is the desired behavior.

## Feature 4: GitHub CLI Default Availability

`gh` (GitHub CLI) runs via hermes's existing terminal/bash execution tools on the host. No new tool code needed.

**What's needed:**
- `gh` installed and authenticated on the host (`gh auth login`)
- A context file or system prompt addition informing the agent that GitHub CLI is available and preferred for repository operations

**Prompt addition** (injected in Discord gateway session setup):

```
GitHub CLI (`gh`) is installed and authenticated. Use it for all GitHub operations:
creating PRs, reviewing code, checking CI status, managing issues, etc.
Prefer `gh` over raw git commands for GitHub-specific operations.
```

This is injected in `discord_hooks.py` as part of the session prompt setup — prepended to the system context when a Discord message is handled.

## File Changes Summary

| File | Change Type | Description |
|------|------------|-------------|
| `gateway/discord_status.py` | **New** | Status embed state, builder, and Discord I/O |
| `gateway/discord_context.py` | **New** | Channel message collection and XML formatting |
| `gateway/discord_hooks.py` | **New** | Lifecycle hooks wiring status embeds to agent callbacks |
| `gateway/platforms/discord.py` | **Edit** | Wire hooks into `on_processing_start/complete`, add context injection in `_handle_message()` |
| `gateway/stream_consumer.py` | **Edit** | Add hook for tool boundary events to update status embed |
| `gateway/discord_hooks.py` | (included above) | GitHub CLI prompt injected in session setup |

## Testing Strategy

- **Unit tests** for `discord_status.py`: embed state transitions, tool narration formatting, FIFO completed tools
- **Unit tests** for `discord_context.py`: message filtering, XML formatting, mention resolution
- **Integration test**: mock Discord channel, verify embed lifecycle (create → update → delete)
- **Manual verification**: deploy to test server, @mention bot, confirm embed appears/updates/deletes and channel context is included
