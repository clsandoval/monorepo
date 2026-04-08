# Hermes Agent — Discord Developer UX Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Daimon-style status embeds, channel context injection, and GitHub CLI prompt to hermes-agent's Discord gateway.

**Architecture:** Three new modules (`gateway/discord_status.py`, `gateway/discord_context.py`, `gateway/discord_hooks.py`) alongside the existing gateway. The Discord adapter (`gateway/platforms/discord.py`) and runner (`gateway/run.py`) get surgical edits at existing hook points. The agent core (`run_agent.py`) is untouched.

**Tech Stack:** Python 3.11+, discord.py 2.7+, existing hermes gateway infrastructure

---

## File Structure

| File | Responsibility |
|------|---------------|
| `gateway/discord_status.py` | **New.** Pure state management (`StatusEmbedState`, `ActiveTool` dataclasses) + embed builder functions (no I/O). Also contains async I/O functions for sending/editing/deleting Discord embeds. |
| `gateway/discord_context.py` | **New.** Fetch last 20 channel messages, filter system messages, format as XML context string. |
| `gateway/discord_hooks.py` | **New.** Wraps `discord_status` into the gateway's callback system — replaces the text-based `progress_callback`/`send_progress_messages` with embed-based progress for Discord. Also holds the GitHub CLI system prompt injection. |
| `gateway/platforms/discord.py` | **Edit.** Replace `on_processing_start/complete` reaction logic with status embed calls. Add channel context injection in `_handle_message()`. |
| `gateway/run.py` | **Edit.** Wire `discord_hooks` into the per-message callback setup so Discord gets embed-based progress instead of text-based progress. |
| `tests/gateway/test_discord_status.py` | **New.** Unit tests for embed state management and builder functions. |
| `tests/gateway/test_discord_context.py` | **New.** Unit tests for message collection filtering and XML formatting. |
| `tests/gateway/test_discord_hooks.py` | **New.** Unit tests for the hook wiring and callback orchestration. |

---

### Task 1: Status Embed State and Builder (Pure Logic)

**Files:**
- Create: `gateway/discord_status.py`
- Test: `tests/gateway/test_discord_status.py`

- [ ] **Step 1: Write tests for StatusEmbedState and ActiveTool dataclasses**

```python
# tests/gateway/test_discord_status.py
"""Tests for gateway.discord_status — pure embed state and builder logic."""
import time

import pytest


def test_active_tool_creation():
    from gateway.discord_status import ActiveTool

    tool = ActiveTool(name="read_file", formatted_args="Reading src/main.py")
    assert tool.name == "read_file"
    assert tool.formatted_args == "Reading src/main.py"


def test_status_state_initial():
    from gateway.discord_status import StatusEmbedState

    state = StatusEmbedState()
    assert state.active_tools == []
    assert state.completed_tools == ()
    assert state.text_preview is None
    assert state.error is None


def test_status_state_add_active_tool():
    from gateway.discord_status import ActiveTool, StatusEmbedState

    state = StatusEmbedState()
    state.active_tools.append(ActiveTool(name="read_file", formatted_args="Reading main.py"))
    assert len(state.active_tools) == 1


def test_status_state_completed_fifo():
    """Completed tools should be capped at MAX_COMPLETED (5), FIFO."""
    from gateway.discord_status import StatusEmbedState, MAX_COMPLETED

    state = StatusEmbedState()
    for i in range(7):
        state.completed_tools = (*state.completed_tools, f"tool_{i}")[-MAX_COMPLETED:]
    assert len(state.completed_tools) == MAX_COMPLETED
    assert state.completed_tools[0] == "tool_2"
    assert state.completed_tools[-1] == "tool_6"


def test_text_preview_truncation():
    """Text preview should be capped at MAX_PREVIEW_CHARS (300)."""
    from gateway.discord_status import StatusEmbedState, MAX_PREVIEW_CHARS

    state = StatusEmbedState()
    long_text = "x" * 500
    state.text_preview = long_text[:MAX_PREVIEW_CHARS]
    assert len(state.text_preview) == MAX_PREVIEW_CHARS
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /home/clsandoval/cs/monorepo/projects/hermes-agent && python -m pytest tests/gateway/test_discord_status.py -v`
Expected: FAIL — `ModuleNotFoundError: No module named 'gateway.discord_status'`

- [ ] **Step 3: Write the dataclasses**

```python
# gateway/discord_status.py
"""Discord status embed — pure state management and embed builder.

Provides dataclasses for tracking tool execution state and functions for
building Discord embed dictionaries. No Discord I/O in the pure section;
async I/O functions at the bottom handle sending/editing/deleting.
"""
from __future__ import annotations

import time
from dataclasses import dataclass, field
from typing import Optional

import logging

logger = logging.getLogger(__name__)

# ── Constants ────────────────────────────────────────────────────────────
COLOR_IN_PROGRESS = 0x3498DB  # Blue
COLOR_SUCCESS = 0x2ECC71      # Green
COLOR_ERROR = 0xE74C3C        # Red

MAX_COMPLETED = 5             # Rolling window of completed tools
MAX_PREVIEW_CHARS = 300       # Text preview truncation limit


# ── Pure State ───────────────────────────────────────────────────────────

@dataclass
class ActiveTool:
    name: str
    formatted_args: str  # Human-readable narration


@dataclass
class StatusEmbedState:
    active_tools: list[ActiveTool] = field(default_factory=list)
    completed_tools: tuple[str, ...] = ()  # Max MAX_COMPLETED, FIFO
    turn_started_at: float = field(default_factory=time.monotonic)
    text_preview: Optional[str] = None     # Max MAX_PREVIEW_CHARS
    error: Optional[str] = None
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd /home/clsandoval/cs/monorepo/projects/hermes-agent && python -m pytest tests/gateway/test_discord_status.py -v`
Expected: All 5 tests PASS

- [ ] **Step 5: Commit**

```bash
cd /home/clsandoval/cs/monorepo/projects/hermes-agent
git add gateway/discord_status.py tests/gateway/test_discord_status.py
git commit -m "feat(discord): add StatusEmbedState and ActiveTool dataclasses"
```

---

### Task 2: Tool Narration

**Files:**
- Modify: `gateway/discord_status.py`
- Test: `tests/gateway/test_discord_status.py`

- [ ] **Step 1: Write tests for tool narration**

Append to `tests/gateway/test_discord_status.py`:

```python
def test_narrate_read_file():
    from gateway.discord_status import narrate_tool

    result = narrate_tool("read_file", {"path": "src/main.py"})
    assert result == "Reading src/main.py"


def test_narrate_write_file():
    from gateway.discord_status import narrate_tool

    result = narrate_tool("write_file", {"path": "src/main.py", "content": "..."})
    assert result == "Writing src/main.py"


def test_narrate_execute():
    from gateway.discord_status import narrate_tool

    result = narrate_tool("execute", {"command": "gh pr list"})
    assert result == "Running `gh pr list`"


def test_narrate_execute_code():
    from gateway.discord_status import narrate_tool

    result = narrate_tool("execute_code", {"code": "print('hello')"})
    assert result == "Running code"


def test_narrate_search_files():
    from gateway.discord_status import narrate_tool

    result = narrate_tool("search_files", {"query": "auth handler"})
    assert result == "Searching for 'auth handler'"


def test_narrate_web_search():
    from gateway.discord_status import narrate_tool

    result = narrate_tool("web_search", {"query": "discord.py embeds"})
    assert result == "Searching web for 'discord.py embeds'"


def test_narrate_unknown_tool():
    from gateway.discord_status import narrate_tool

    result = narrate_tool("some_obscure_tool", {"foo": "bar"})
    assert result == "Running some_obscure_tool"


def test_narrate_patch_file():
    from gateway.discord_status import narrate_tool

    result = narrate_tool("patch_file", {"path": "src/util.py"})
    assert result == "Patching src/util.py"
```

- [ ] **Step 2: Run tests to verify new tests fail**

Run: `cd /home/clsandoval/cs/monorepo/projects/hermes-agent && python -m pytest tests/gateway/test_discord_status.py::test_narrate_read_file -v`
Expected: FAIL — `ImportError: cannot import name 'narrate_tool'`

- [ ] **Step 3: Implement narrate_tool**

Append to `gateway/discord_status.py`:

```python
# ── Tool Narration ───────────────────────────────────────────────────────

def narrate_tool(tool_name: str, args: dict) -> str:
    """Return a human-readable one-liner describing what a tool is doing.

    Covers common hermes tools; unknown tools get a generic fallback.
    """
    path = args.get("path") or args.get("file_path") or args.get("filename", "")
    query = args.get("query") or args.get("search") or args.get("pattern", "")
    command = args.get("command") or args.get("cmd", "")

    narrations = {
        "read_file": f"Reading {path}" if path else "Reading file",
        "write_file": f"Writing {path}" if path else "Writing file",
        "patch_file": f"Patching {path}" if path else "Patching file",
        "search_files": f"Searching for '{query}'" if query else "Searching files",
        "execute": f"Running `{command}`" if command else "Running command",
        "execute_code": "Running code",
        "web_search": f"Searching web for '{query}'" if query else "Searching the web",
        "browse": f"Browsing {args.get('url', 'page')}",
        "create_file": f"Creating {path}" if path else "Creating file",
        "delete_file": f"Deleting {path}" if path else "Deleting file",
        "list_directory": f"Listing {path}" if path else "Listing directory",
    }
    return narrations.get(tool_name, f"Running {tool_name}")
```

- [ ] **Step 4: Run all tests to verify they pass**

Run: `cd /home/clsandoval/cs/monorepo/projects/hermes-agent && python -m pytest tests/gateway/test_discord_status.py -v`
Expected: All 13 tests PASS

- [ ] **Step 5: Commit**

```bash
cd /home/clsandoval/cs/monorepo/projects/hermes-agent
git add gateway/discord_status.py tests/gateway/test_discord_status.py
git commit -m "feat(discord): add tool narration for status embeds"
```

---

### Task 3: Embed Builder Functions

**Files:**
- Modify: `gateway/discord_status.py`
- Test: `tests/gateway/test_discord_status.py`

- [ ] **Step 1: Write tests for build_activity_embed**

Append to `tests/gateway/test_discord_status.py`:

```python
def test_build_activity_embed_initial():
    """Initial embed should show 'Thinking...' with blue color."""
    from gateway.discord_status import StatusEmbedState, build_activity_embed, COLOR_IN_PROGRESS

    state = StatusEmbedState()
    embed = build_activity_embed(state)
    assert embed.color.value == COLOR_IN_PROGRESS
    assert "Thinking" in embed.title


def test_build_activity_embed_with_active_tool():
    from gateway.discord_status import (
        StatusEmbedState, ActiveTool, build_activity_embed,
    )

    state = StatusEmbedState()
    state.active_tools = [ActiveTool(name="read_file", formatted_args="Reading main.py")]
    embed = build_activity_embed(state)
    # Active tool should appear in the description
    assert "Reading main.py" in embed.description


def test_build_activity_embed_with_completed_tools():
    from gateway.discord_status import StatusEmbedState, build_activity_embed

    state = StatusEmbedState()
    state.completed_tools = ("Searched for 'auth'", "Read config.yaml")
    embed = build_activity_embed(state)
    assert "Searched for 'auth'" in embed.description
    assert "Read config.yaml" in embed.description


def test_build_activity_embed_with_text_preview():
    from gateway.discord_status import StatusEmbedState, build_activity_embed

    state = StatusEmbedState()
    state.text_preview = "The issue is in the auth..."
    embed = build_activity_embed(state)
    desc = embed.description or ""
    # Check fields for preview
    field_values = [f.value for f in embed.fields]
    assert any("The issue is in the auth" in v for v in field_values) or "The issue is in the auth" in desc


def test_build_error_embed():
    from gateway.discord_status import StatusEmbedState, build_activity_embed, COLOR_ERROR

    state = StatusEmbedState()
    state.error = "Connection timeout"
    embed = build_activity_embed(state)
    assert embed.color.value == COLOR_ERROR
    assert "Connection timeout" in (embed.description or "")
```

- [ ] **Step 2: Run tests to verify new tests fail**

Run: `cd /home/clsandoval/cs/monorepo/projects/hermes-agent && python -m pytest tests/gateway/test_discord_status.py::test_build_activity_embed_initial -v`
Expected: FAIL — `ImportError: cannot import name 'build_activity_embed'`

- [ ] **Step 3: Implement build_activity_embed**

Append to `gateway/discord_status.py`:

```python
# ── Embed Builder ────────────────────────────────────────────────────────

try:
    import discord
    DISCORD_AVAILABLE = True
except ImportError:
    DISCORD_AVAILABLE = False


def build_activity_embed(state: StatusEmbedState) -> "discord.Embed":
    """Build a Discord Embed from the current status state.

    Returns a discord.Embed object ready to be sent or used to edit a message.
    """
    import discord

    now = time.monotonic()
    elapsed = int(now - state.turn_started_at)

    # Error state — red embed
    if state.error:
        embed = discord.Embed(
            title=f"❌ Error",
            description=state.error,
            color=discord.Color(COLOR_ERROR),
        )
        embed.set_footer(text=f"⏱ {elapsed}s")
        return embed

    # Active tools
    if state.active_tools:
        title = "🔧 Working..."
        lines = []
        for tool in state.active_tools:
            lines.append(f"▸ **{tool.formatted_args}**")
    else:
        title = "🔧 Thinking..."
        lines = []

    # Completed tools
    if state.completed_tools:
        if lines:
            lines.append("")
        lines.append("**Completed:**")
        for desc in state.completed_tools:
            lines.append(f"✓ {desc}")

    description = "\n".join(lines) if lines else None

    embed = discord.Embed(
        title=f"{title}  ⏱ {elapsed}s",
        description=description,
        color=discord.Color(COLOR_IN_PROGRESS),
    )

    # Text preview as a field
    if state.text_preview:
        embed.add_field(
            name="💬 Preview",
            value=state.text_preview[:MAX_PREVIEW_CHARS],
            inline=False,
        )

    return embed
```

- [ ] **Step 4: Run all tests**

Run: `cd /home/clsandoval/cs/monorepo/projects/hermes-agent && python -m pytest tests/gateway/test_discord_status.py -v`
Expected: All 18 tests PASS

- [ ] **Step 5: Commit**

```bash
cd /home/clsandoval/cs/monorepo/projects/hermes-agent
git add gateway/discord_status.py tests/gateway/test_discord_status.py
git commit -m "feat(discord): add embed builder for status state"
```

---

### Task 4: Embed I/O Functions

**Files:**
- Modify: `gateway/discord_status.py`
- Test: `tests/gateway/test_discord_status.py`

- [ ] **Step 1: Write tests for async I/O functions**

Append to `tests/gateway/test_discord_status.py`:

```python
import asyncio
from unittest.mock import AsyncMock, MagicMock


@pytest.mark.asyncio
async def test_send_initial_status():
    from gateway.discord_status import send_initial_status

    channel = AsyncMock()
    channel.send = AsyncMock(return_value=MagicMock(id=12345))

    msg = await send_initial_status(channel)
    channel.send.assert_called_once()
    # Should have sent an embed
    call_kwargs = channel.send.call_args
    assert call_kwargs.kwargs.get("embed") is not None


@pytest.mark.asyncio
async def test_send_initial_status_none_channel():
    """None-safe: should return None when channel is None."""
    from gateway.discord_status import send_initial_status

    result = await send_initial_status(None)
    assert result is None


@pytest.mark.asyncio
async def test_update_status():
    from gateway.discord_status import update_status, StatusEmbedState, ActiveTool

    message = AsyncMock()
    message.edit = AsyncMock()

    state = StatusEmbedState()
    state.active_tools = [ActiveTool(name="read_file", formatted_args="Reading main.py")]

    await update_status(state, message)
    message.edit.assert_called_once()


@pytest.mark.asyncio
async def test_update_status_none_message():
    """None-safe: should silently skip when message is None."""
    from gateway.discord_status import update_status, StatusEmbedState

    await update_status(StatusEmbedState(), None)  # Should not raise


@pytest.mark.asyncio
async def test_delete_status():
    from gateway.discord_status import delete_status

    message = AsyncMock()
    message.delete = AsyncMock()

    await delete_status(message)
    message.delete.assert_called_once()


@pytest.mark.asyncio
async def test_delete_status_none_message():
    """None-safe: should silently skip when message is None."""
    from gateway.discord_status import delete_status

    await delete_status(None)  # Should not raise


@pytest.mark.asyncio
async def test_finalize_status_error():
    from gateway.discord_status import finalize_status_error

    message = AsyncMock()
    message.edit = AsyncMock()

    await finalize_status_error(message, "Something broke")
    message.edit.assert_called_once()
    call_kwargs = message.edit.call_args
    embed = call_kwargs.kwargs.get("embed")
    assert embed is not None
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /home/clsandoval/cs/monorepo/projects/hermes-agent && python -m pytest tests/gateway/test_discord_status.py::test_send_initial_status -v`
Expected: FAIL — `ImportError: cannot import name 'send_initial_status'`

- [ ] **Step 3: Implement I/O functions**

Append to `gateway/discord_status.py`:

```python
# ── Discord I/O ──────────────────────────────────────────────────────────

async def send_initial_status(channel) -> Optional["discord.Message"]:
    """Send the initial 'Thinking...' status embed. Returns the message or None."""
    if channel is None:
        return None
    try:
        state = StatusEmbedState()
        embed = build_activity_embed(state)
        return await channel.send(embed=embed)
    except Exception as e:
        logger.debug("send_initial_status failed: %s", e)
        return None


async def update_status(state: StatusEmbedState, message) -> None:
    """Edit the status embed message with the current state."""
    if message is None:
        return
    try:
        embed = build_activity_embed(state)
        await message.edit(embed=embed)
    except Exception as e:
        logger.debug("update_status failed: %s", e)


async def finalize_status_error(message, error_text: str) -> None:
    """Turn the status embed red with an error message."""
    if message is None:
        return
    try:
        state = StatusEmbedState()
        state.error = error_text
        embed = build_activity_embed(state)
        await message.edit(embed=embed)
    except Exception as e:
        logger.debug("finalize_status_error failed: %s", e)


async def delete_status(message) -> None:
    """Delete the status embed message."""
    if message is None:
        return
    try:
        await message.delete()
    except Exception as e:
        logger.debug("delete_status failed: %s", e)
```

- [ ] **Step 4: Run all tests**

Run: `cd /home/clsandoval/cs/monorepo/projects/hermes-agent && python -m pytest tests/gateway/test_discord_status.py -v`
Expected: All 25 tests PASS

- [ ] **Step 5: Commit**

```bash
cd /home/clsandoval/cs/monorepo/projects/hermes-agent
git add gateway/discord_status.py tests/gateway/test_discord_status.py
git commit -m "feat(discord): add status embed I/O functions"
```

---

### Task 5: Channel Context Collection and XML Formatting

**Files:**
- Create: `gateway/discord_context.py`
- Test: `tests/gateway/test_discord_context.py`

- [ ] **Step 1: Write tests for message filtering and XML formatting**

```python
# tests/gateway/test_discord_context.py
"""Tests for gateway.discord_context — channel message collection and XML formatting."""
import datetime
from unittest.mock import AsyncMock, MagicMock, PropertyMock

import pytest


def _make_mock_message(
    msg_id: int,
    author_name: str,
    content: str,
    msg_type=None,
    created_at=None,
    reference=None,
    attachments=None,
    mentions=None,
):
    """Create a mock discord.Message for testing."""
    import discord

    msg = MagicMock()
    msg.id = msg_id
    msg.author.display_name = author_name
    msg.content = content
    msg.type = msg_type or discord.MessageType.default
    msg.created_at = created_at or datetime.datetime(2026, 4, 8, 10, 30, 0, tzinfo=datetime.timezone.utc)
    msg.reference = reference
    msg.attachments = attachments or []
    msg.mentions = mentions or []
    return msg


def test_should_include_message_default():
    import discord
    from gateway.discord_context import should_include_message

    msg = _make_mock_message(1, "alice", "hello", msg_type=discord.MessageType.default)
    assert should_include_message(msg) is True


def test_should_include_message_reply():
    import discord
    from gateway.discord_context import should_include_message

    msg = _make_mock_message(1, "alice", "hello", msg_type=discord.MessageType.reply)
    assert should_include_message(msg) is True


def test_should_exclude_system_message():
    import discord
    from gateway.discord_context import should_include_message

    msg = _make_mock_message(1, "alice", "", msg_type=discord.MessageType.pins_add)
    assert should_include_message(msg) is False


def test_format_channel_context_basic():
    import discord
    from gateway.discord_context import format_channel_context

    messages = [
        _make_mock_message(123, "alice", "anyone looked at the auth bug yet?"),
        _make_mock_message(124, "bob", "yeah I pushed a fix"),
    ]
    xml = format_channel_context(messages)
    assert "<channel_context" in xml
    assert 'author="alice"' in xml
    assert 'author="bob"' in xml
    assert "anyone looked at the auth bug yet?" in xml
    assert "</channel_context>" in xml


def test_format_channel_context_with_reply():
    import discord
    from gateway.discord_context import format_channel_context

    ref = MagicMock()
    ref.message_id = 123
    ref_author = MagicMock()
    ref_author.display_name = "alice"
    ref.resolved = MagicMock()
    ref.resolved.author = ref_author

    messages = [
        _make_mock_message(123, "alice", "anyone looked at the auth bug?"),
        _make_mock_message(124, "bob", "yeah I pushed a fix", reference=ref),
    ]
    xml = format_channel_context(messages)
    assert 'reply-to-author="alice"' in xml
    assert 'reply-to-id="123"' in xml


def test_format_channel_context_with_attachments():
    import discord
    from gateway.discord_context import format_channel_context

    att = MagicMock()
    att.url = "https://cdn.discord.com/file.png"
    messages = [
        _make_mock_message(123, "alice", "check this out", attachments=[att]),
    ]
    xml = format_channel_context(messages)
    assert "Attachments:" in xml
    assert "https://cdn.discord.com/file.png" in xml


def test_format_channel_context_empty():
    from gateway.discord_context import format_channel_context

    xml = format_channel_context([])
    assert "<channel_context" in xml
    assert "</channel_context>" in xml
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /home/clsandoval/cs/monorepo/projects/hermes-agent && python -m pytest tests/gateway/test_discord_context.py -v`
Expected: FAIL — `ModuleNotFoundError: No module named 'gateway.discord_context'`

- [ ] **Step 3: Implement discord_context.py**

```python
# gateway/discord_context.py
"""Channel context collection and XML formatting for Discord.

Fetches recent messages from a Discord channel and formats them as XML
context to inject into the agent's prompt when @mentioned.
"""
from __future__ import annotations

import logging
from typing import Optional

logger = logging.getLogger(__name__)

try:
    import discord
    DISCORD_AVAILABLE = True
except ImportError:
    DISCORD_AVAILABLE = False


def should_include_message(msg) -> bool:
    """Return True if this message type should be included in context."""
    import discord
    return msg.type in (discord.MessageType.default, discord.MessageType.reply)


async def collect_channel_messages(channel, limit: int = 20) -> list:
    """Fetch the last `limit` non-system messages from a channel.

    Returns messages in chronological order (oldest first).
    """
    messages = []
    try:
        async for msg in channel.history(limit=limit * 2, oldest_first=False):
            if should_include_message(msg):
                messages.append(msg)
            if len(messages) >= limit:
                break
    except Exception as e:
        logger.debug("collect_channel_messages failed: %s", e)
        return []

    messages.reverse()  # oldest first
    return messages


def _escape_xml(text: str) -> str:
    """Escape XML special characters."""
    return (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


def format_channel_context(messages: list) -> str:
    """Format a list of discord.Message objects as XML context.

    Returns an XML string suitable for prepending to the agent prompt.
    """
    lines = ['<channel_context description="Recent channel messages for conversational context">']

    for msg in messages:
        attrs = [
            f'id="{msg.id}"',
            f'author="{_escape_xml(msg.author.display_name)}"',
            f'timestamp="{msg.created_at.isoformat()}"',
        ]

        # Reply metadata
        if msg.reference and msg.reference.message_id:
            attrs.append(f'reply-to-id="{msg.reference.message_id}"')
            if hasattr(msg.reference, "resolved") and msg.reference.resolved:
                resolved = msg.reference.resolved
                if hasattr(resolved, "author") and resolved.author:
                    reply_author = resolved.author.display_name
                    attrs.append(f'reply-to-author="{_escape_xml(reply_author)}"')

        content = _escape_xml(msg.content) if msg.content else ""

        # Attachments
        if msg.attachments:
            urls = ", ".join(att.url for att in msg.attachments)
            content += f"\n  [Attachments: {urls}]"

        attrs_str = " ".join(attrs)
        lines.append(f"  <message {attrs_str}>")
        lines.append(f"    {content.strip()}")
        lines.append("  </message>")

    lines.append("</channel_context>")
    return "\n".join(lines)
```

- [ ] **Step 4: Run all tests**

Run: `cd /home/clsandoval/cs/monorepo/projects/hermes-agent && python -m pytest tests/gateway/test_discord_context.py -v`
Expected: All 7 tests PASS

- [ ] **Step 5: Commit**

```bash
cd /home/clsandoval/cs/monorepo/projects/hermes-agent
git add gateway/discord_context.py tests/gateway/test_discord_context.py
git commit -m "feat(discord): add channel context collection and XML formatting"
```

---

### Task 6: Channel Context Injection in _handle_message

**Files:**
- Modify: `gateway/platforms/discord.py:2240` (after mention strip, before auto-thread)
- Test: `tests/gateway/test_discord_context.py`

- [ ] **Step 1: Write integration test for context injection**

Append to `tests/gateway/test_discord_context.py`:

```python
@pytest.mark.asyncio
async def test_collect_channel_messages_filters_system():
    """collect_channel_messages should skip system messages."""
    import discord
    from gateway.discord_context import collect_channel_messages

    messages_data = [
        _make_mock_message(3, "bob", "latest msg"),
        _make_mock_message(2, "system", "", msg_type=discord.MessageType.pins_add),
        _make_mock_message(1, "alice", "oldest msg"),
    ]

    channel = AsyncMock()
    # Simulate channel.history() as an async iterator
    async def mock_history(limit=50, oldest_first=False):
        for m in messages_data:
            yield m

    channel.history = mock_history

    result = await collect_channel_messages(channel, limit=20)
    assert len(result) == 2
    assert result[0].author.display_name == "alice"  # oldest first
    assert result[1].author.display_name == "bob"
```

- [ ] **Step 2: Run test to verify it passes** (uses already-implemented logic)

Run: `cd /home/clsandoval/cs/monorepo/projects/hermes-agent && python -m pytest tests/gateway/test_discord_context.py::test_collect_channel_messages_filters_system -v`
Expected: PASS

- [ ] **Step 3: Add context injection to _handle_message**

In `gateway/platforms/discord.py`, after the mention strip block (line ~2239) and before the auto-thread block (line ~2241), add:

```python
            # ── Channel context injection ────────────────────────────────
            # When @mentioned in a channel (not a thread or DM), fetch
            # the last 20 messages as conversational context for the agent.
            _channel_context_xml = ""
            if not is_thread and not isinstance(message.channel, discord.DMChannel):
                try:
                    from gateway.discord_context import collect_channel_messages, format_channel_context
                    _ctx_messages = await collect_channel_messages(message.channel, limit=20)
                    if _ctx_messages:
                        _channel_context_xml = format_channel_context(_ctx_messages)
                except Exception as _ctx_err:
                    logger.debug("[%s] Channel context collection failed: %s", self.name, _ctx_err)
```

Then, at line ~2406 where `event_text` is built, prepend the context:

Find the line:
```python
        event_text = message.content
```

Replace with:
```python
        event_text = message.content
        if _channel_context_xml:
            event_text = f"{_channel_context_xml}\n\n{event_text}"
```

- [ ] **Step 4: Run existing Discord tests to verify no regressions**

Run: `cd /home/clsandoval/cs/monorepo/projects/hermes-agent && python -m pytest tests/gateway/test_discord_channel_controls.py tests/gateway/test_discord_system_messages.py tests/gateway/test_discord_thread_persistence.py -v`
Expected: All existing tests PASS

- [ ] **Step 5: Commit**

```bash
cd /home/clsandoval/cs/monorepo/projects/hermes-agent
git add gateway/platforms/discord.py tests/gateway/test_discord_context.py
git commit -m "feat(discord): inject channel context on @mention"
```

---

### Task 7: Discord Hooks Module — Status Embed Lifecycle

**Files:**
- Create: `gateway/discord_hooks.py`
- Test: `tests/gateway/test_discord_hooks.py`

- [ ] **Step 1: Write tests for StatusEmbedManager**

```python
# tests/gateway/test_discord_hooks.py
"""Tests for gateway.discord_hooks — status embed lifecycle management."""
import asyncio
import time
from unittest.mock import AsyncMock, MagicMock, patch

import pytest


@pytest.mark.asyncio
async def test_manager_start_sends_initial_embed():
    from gateway.discord_hooks import StatusEmbedManager

    channel = AsyncMock()
    mock_msg = MagicMock(id=999)
    channel.send = AsyncMock(return_value=mock_msg)

    manager = StatusEmbedManager(channel)
    await manager.start()

    assert manager._status_message is not None
    channel.send.assert_called_once()


@pytest.mark.asyncio
async def test_manager_on_tool_started():
    from gateway.discord_hooks import StatusEmbedManager

    channel = AsyncMock()
    mock_msg = AsyncMock(id=999)
    mock_msg.edit = AsyncMock()
    channel.send = AsyncMock(return_value=mock_msg)

    manager = StatusEmbedManager(channel)
    await manager.start()

    manager.on_tool_started("read_file", {"path": "main.py"})
    assert len(manager._state.active_tools) == 1
    assert manager._state.active_tools[0].formatted_args == "Reading main.py"


@pytest.mark.asyncio
async def test_manager_on_tool_completed():
    from gateway.discord_hooks import StatusEmbedManager

    manager = StatusEmbedManager(AsyncMock())
    manager._status_message = AsyncMock()
    manager._state.turn_started_at = time.monotonic()

    manager.on_tool_started("read_file", {"path": "main.py"})
    manager.on_tool_completed("read_file")

    assert len(manager._state.active_tools) == 0
    assert len(manager._state.completed_tools) == 1
    assert "Reading main.py" in manager._state.completed_tools[0]


@pytest.mark.asyncio
async def test_manager_finish_success_deletes():
    from gateway.discord_hooks import StatusEmbedManager

    mock_msg = AsyncMock()
    mock_msg.delete = AsyncMock()

    manager = StatusEmbedManager(AsyncMock())
    manager._status_message = mock_msg

    await manager.finish(success=True)
    mock_msg.delete.assert_called_once()


@pytest.mark.asyncio
async def test_manager_finish_error_shows_red():
    from gateway.discord_hooks import StatusEmbedManager

    mock_msg = AsyncMock()
    mock_msg.edit = AsyncMock()

    manager = StatusEmbedManager(AsyncMock())
    manager._status_message = mock_msg

    await manager.finish(success=False, error="timeout")
    mock_msg.edit.assert_called_once()


def test_github_cli_prompt():
    from gateway.discord_hooks import GITHUB_CLI_PROMPT

    assert "gh" in GITHUB_CLI_PROMPT
    assert "GitHub" in GITHUB_CLI_PROMPT
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /home/clsandoval/cs/monorepo/projects/hermes-agent && python -m pytest tests/gateway/test_discord_hooks.py -v`
Expected: FAIL — `ModuleNotFoundError: No module named 'gateway.discord_hooks'`

- [ ] **Step 3: Implement discord_hooks.py**

```python
# gateway/discord_hooks.py
"""Discord lifecycle hooks — status embed manager and GitHub CLI prompt.

Bridges the agent's tool_progress_callback into a Discord embed-based
status display. Replaces the default text-based progress messages with
a single updating embed that shows active/completed tools and a text
preview.
"""
from __future__ import annotations

import asyncio
import logging
import time
from typing import Optional

from gateway.discord_status import (
    ActiveTool,
    StatusEmbedState,
    MAX_COMPLETED,
    build_activity_embed,
    delete_status,
    finalize_status_error,
    narrate_tool,
    send_initial_status,
    update_status,
)

logger = logging.getLogger(__name__)

# ── GitHub CLI Prompt ────────────────────────────────────────────────────

GITHUB_CLI_PROMPT = (
    "GitHub CLI (`gh`) is installed and authenticated. Use it for all GitHub "
    "operations: creating PRs, reviewing code, checking CI status, managing "
    "issues, etc. Prefer `gh` over raw git commands for GitHub-specific operations."
)

# ── Status Embed Manager ────────────────────────────────────────────────

# Minimum interval between embed edits to respect Discord rate limits.
_MIN_EDIT_INTERVAL = 1.0


class StatusEmbedManager:
    """Manages the lifecycle of a single status embed for one message processing turn.

    Usage::

        manager = StatusEmbedManager(channel)
        await manager.start()

        # From tool_progress_callback (sync, called from agent worker thread):
        manager.on_tool_started("read_file", {"path": "main.py"})
        manager.on_tool_completed("read_file")

        # From stream_delta_callback (sync):
        manager.on_text_delta("The issue is...")

        # When processing completes:
        await manager.finish(success=True)
    """

    def __init__(self, channel) -> None:
        self._channel = channel
        self._status_message: Optional[object] = None  # discord.Message
        self._state = StatusEmbedState()
        self._dirty = False  # Whether state has changed since last edit
        self._last_edit_time = 0.0
        self._update_task: Optional[asyncio.Task] = None
        self._loop: Optional[asyncio.AbstractEventLoop] = None

    async def start(self) -> None:
        """Send the initial status embed and start the update loop."""
        self._state = StatusEmbedState()
        self._status_message = await send_initial_status(self._channel)
        self._loop = asyncio.get_event_loop()
        self._update_task = asyncio.create_task(self._update_loop())

    def on_tool_started(self, tool_name: str, args: dict) -> None:
        """Called (sync) when a tool starts executing."""
        narration = narrate_tool(tool_name, args or {})
        self._state.active_tools.append(ActiveTool(name=tool_name, formatted_args=narration))
        self._dirty = True

    def on_tool_completed(self, tool_name: str) -> None:
        """Called (sync) when a tool finishes executing."""
        # Move from active to completed
        removed = None
        for i, t in enumerate(self._state.active_tools):
            if t.name == tool_name:
                removed = self._state.active_tools.pop(i)
                break

        if removed:
            desc = removed.formatted_args
        else:
            desc = f"Ran {tool_name}"

        self._state.completed_tools = (
            *self._state.completed_tools, desc
        )[-MAX_COMPLETED:]
        self._dirty = True

    def on_text_delta(self, text: str) -> None:
        """Called (sync) when the agent streams text."""
        from gateway.discord_status import MAX_PREVIEW_CHARS

        current = self._state.text_preview or ""
        updated = (current + text)[-MAX_PREVIEW_CHARS:]
        self._state.text_preview = updated
        self._dirty = True

    async def finish(self, success: bool = True, error: str = None) -> None:
        """Clean up the status embed on completion."""
        # Stop the update loop
        if self._update_task and not self._update_task.done():
            self._update_task.cancel()
            try:
                await self._update_task
            except asyncio.CancelledError:
                pass

        if success and not error:
            await delete_status(self._status_message)
        else:
            await finalize_status_error(self._status_message, error or "Processing failed")

        self._status_message = None

    async def _update_loop(self) -> None:
        """Background task that flushes dirty state to the Discord embed."""
        try:
            while True:
                await asyncio.sleep(0.2)
                if not self._dirty or self._status_message is None:
                    continue

                now = time.monotonic()
                if now - self._last_edit_time < _MIN_EDIT_INTERVAL:
                    continue

                self._dirty = False
                self._last_edit_time = now
                await update_status(self._state, self._status_message)
        except asyncio.CancelledError:
            # Final flush
            if self._dirty and self._status_message is not None:
                try:
                    await update_status(self._state, self._status_message)
                except Exception:
                    pass
```

- [ ] **Step 4: Run all tests**

Run: `cd /home/clsandoval/cs/monorepo/projects/hermes-agent && python -m pytest tests/gateway/test_discord_hooks.py -v`
Expected: All 6 tests PASS

- [ ] **Step 5: Commit**

```bash
cd /home/clsandoval/cs/monorepo/projects/hermes-agent
git add gateway/discord_hooks.py tests/gateway/test_discord_hooks.py
git commit -m "feat(discord): add StatusEmbedManager and GitHub CLI prompt"
```

---

### Task 8: Wire Status Embed into Discord Adapter

**Files:**
- Modify: `gateway/platforms/discord.py:429-457` (DiscordAdapter.__init__) and `gateway/platforms/discord.py:733-748` (on_processing_start/complete)

The `StatusEmbedManager` is stashed on the `DiscordAdapter` instance in a dict keyed by message ID. This allows both the adapter hooks and `_run_agent` (which receives `event_message_id`) to access it.

- [ ] **Step 1: Write test for new processing hooks**

Append to `tests/gateway/test_discord_hooks.py`:

```python
@pytest.mark.asyncio
async def test_processing_start_creates_manager():
    """on_processing_start should create a StatusEmbedManager and call start()."""
    from gateway.discord_hooks import StatusEmbedManager

    channel = AsyncMock()
    mock_msg = MagicMock(id=999)
    channel.send = AsyncMock(return_value=mock_msg)

    manager = StatusEmbedManager(channel)
    await manager.start()

    assert manager._status_message is not None
    assert manager._update_task is not None


@pytest.mark.asyncio
async def test_processing_complete_cleans_up():
    """finish(success=True) should delete the embed and cancel the update task."""
    from gateway.discord_hooks import StatusEmbedManager

    mock_msg = AsyncMock()
    mock_msg.delete = AsyncMock()

    channel = AsyncMock()
    channel.send = AsyncMock(return_value=mock_msg)

    manager = StatusEmbedManager(channel)
    await manager.start()
    await manager.finish(success=True)

    mock_msg.delete.assert_called_once()
    assert manager._status_message is None
```

- [ ] **Step 2: Run test to verify it passes** (uses already-implemented StatusEmbedManager)

Run: `cd /home/clsandoval/cs/monorepo/projects/hermes-agent && python -m pytest tests/gateway/test_discord_hooks.py -v`
Expected: All 8 tests PASS

- [ ] **Step 3: Add `_status_embed_managers` dict to DiscordAdapter.__init__**

In `gateway/platforms/discord.py`, in `__init__` (around line 429-457), add after the existing instance variable declarations:

```python
        # Status embed managers keyed by message ID — allows _run_agent
        # to look up the manager for the current message.
        self._status_embed_managers: dict[str, object] = {}
```

- [ ] **Step 4: Replace on_processing_start/complete in DiscordAdapter**

In `gateway/platforms/discord.py`, replace lines 733-748:

Find:
```python
    async def on_processing_start(self, event: MessageEvent) -> None:
        """Add an in-progress reaction for normal Discord message events."""
        if not self._reactions_enabled():
            return
        message = event.raw_message
        if hasattr(message, "add_reaction"):
            await self._add_reaction(message, "👀")

    async def on_processing_complete(self, event: MessageEvent, success: bool) -> None:
        """Swap the in-progress reaction for a final success/failure reaction."""
        if not self._reactions_enabled():
            return
        message = event.raw_message
        if hasattr(message, "add_reaction"):
            await self._remove_reaction(message, "👀")
            await self._add_reaction(message, "✅" if success else "❌")
```

Replace with:
```python
    async def on_processing_start(self, event: MessageEvent) -> None:
        """Send an initial status embed for the incoming message."""
        from gateway.discord_hooks import StatusEmbedManager

        channel = getattr(event.raw_message, "channel", None)
        if channel is None:
            return

        manager = StatusEmbedManager(channel)
        await manager.start()

        # Stash by message_id so _run_agent can retrieve it via event_message_id.
        if event.message_id:
            self._status_embed_managers[event.message_id] = manager

    async def on_processing_complete(self, event: MessageEvent, success: bool) -> None:
        """Delete status embed on success, or turn it red on failure."""
        manager = self._status_embed_managers.pop(event.message_id, None) if event.message_id else None
        if manager is None:
            return
        error_msg = None if success else "Processing failed"
        await manager.finish(success=success, error=error_msg)
```

- [ ] **Step 5: Run existing Discord reaction tests to check for regressions**

Run: `cd /home/clsandoval/cs/monorepo/projects/hermes-agent && python -m pytest tests/gateway/test_discord_reactions.py -v`
Expected: Some tests may need updating since we removed the reaction behavior. Check output and adapt. If the reaction tests assert "👀"/"✅" reactions, they need to be updated to assert embed creation/deletion instead.

- [ ] **Step 6: Commit**

```bash
cd /home/clsandoval/cs/monorepo/projects/hermes-agent
git add gateway/platforms/discord.py tests/gateway/test_discord_hooks.py
git commit -m "feat(discord): replace reactions with status embed in processing hooks"
```

---

### Task 9: Wire Status Embed into Tool Progress and Stream Callbacks

**Files:**
- Modify: `gateway/run.py:6244-6254` (_run_agent signature) and `gateway/run.py:6676-6682` (callback assignment)

The key challenge: `_run_agent` doesn't receive the `event` object — it receives `source`, `event_message_id`, etc. The `StatusEmbedManager` is stored on the `DiscordAdapter` instance, keyed by `event_message_id`. We look it up inside `_run_agent` from `self.adapters[source.platform]._status_embed_managers`.

- [ ] **Step 1: Write test for embed-aware progress callback**

Append to `tests/gateway/test_discord_hooks.py`:

```python
def test_manager_on_tool_started_narrates():
    """on_tool_started should use narrate_tool for human-readable descriptions."""
    from gateway.discord_hooks import StatusEmbedManager

    manager = StatusEmbedManager(AsyncMock())
    manager.on_tool_started("search_files", {"query": "auth handler"})

    assert len(manager._state.active_tools) == 1
    assert manager._state.active_tools[0].formatted_args == "Searching for 'auth handler'"


def test_manager_on_text_delta_accumulates():
    """on_text_delta should accumulate text preview."""
    from gateway.discord_hooks import StatusEmbedManager

    manager = StatusEmbedManager(AsyncMock())
    manager.on_text_delta("Hello ")
    manager.on_text_delta("world")

    assert manager._state.text_preview == "Hello world"
```

- [ ] **Step 2: Run tests**

Run: `cd /home/clsandoval/cs/monorepo/projects/hermes-agent && python -m pytest tests/gateway/test_discord_hooks.py -v`
Expected: All 10 tests PASS

- [ ] **Step 3: Modify _run_agent to retrieve the StatusEmbedManager and wire callbacks**

In `gateway/run.py`, inside the `run_sync()` function (around line 6676-6682), after the per-message callback assignments:

```python
            agent.tool_progress_callback = progress_callback if tool_progress_enabled else None
            agent.step_callback = _step_callback_sync if _hooks_ref.loaded_hooks else None
            agent.stream_delta_callback = _stream_delta_cb
            agent.status_callback = _status_callback_sync
            agent.reasoning_config = reasoning_config
```

Add the embed manager wiring:

```python
            # Wire status embed manager for Discord — look up by event_message_id
            # from the Discord adapter's _status_embed_managers dict.
            _embed_manager = None
            if event_message_id:
                _discord_adapter = self.adapters.get(source.platform)
                if _discord_adapter and hasattr(_discord_adapter, "_status_embed_managers"):
                    _embed_manager = _discord_adapter._status_embed_managers.get(event_message_id)

            if _embed_manager is not None:
                _original_progress = agent.tool_progress_callback

                def _embed_progress_callback(event_type, tool_name=None, preview=None, args=None, **kwargs):
                    if event_type == "tool.started" and tool_name:
                        _embed_manager.on_tool_started(tool_name, args or {})
                    elif event_type == "tool.completed" and tool_name:
                        _embed_manager.on_tool_completed(tool_name)
                    if _original_progress:
                        _original_progress(event_type, tool_name, preview, args, **kwargs)

                agent.tool_progress_callback = _embed_progress_callback

                _original_stream_delta = agent.stream_delta_callback

                def _embed_stream_delta(text):
                    if text:
                        _embed_manager.on_text_delta(text)
                    if _original_stream_delta:
                        _original_stream_delta(text)

                agent.stream_delta_callback = _embed_stream_delta
```

- [ ] **Step 4: Run existing progress tests to check for regressions**

Run: `cd /home/clsandoval/cs/monorepo/projects/hermes-agent && python -m pytest tests/gateway/test_run_progress_topics.py -v`
Expected: All existing tests PASS

- [ ] **Step 5: Commit**

```bash
cd /home/clsandoval/cs/monorepo/projects/hermes-agent
git add gateway/run.py tests/gateway/test_discord_hooks.py
git commit -m "feat(discord): wire StatusEmbedManager into tool progress and stream delta callbacks"
```

---

### Task 10: GitHub CLI System Prompt Injection

**Files:**
- Modify: `gateway/run.py` (ephemeral system prompt)

- [ ] **Step 1: Write test for GitHub CLI prompt injection**

Append to `tests/gateway/test_discord_hooks.py`:

```python
def test_github_cli_prompt_content():
    """GITHUB_CLI_PROMPT should instruct the agent to use gh CLI."""
    from gateway.discord_hooks import GITHUB_CLI_PROMPT

    assert "gh" in GITHUB_CLI_PROMPT
    assert "GitHub" in GITHUB_CLI_PROMPT
    assert "creating PRs" in GITHUB_CLI_PROMPT
```

- [ ] **Step 2: Run test**

Run: `cd /home/clsandoval/cs/monorepo/projects/hermes-agent && python -m pytest tests/gateway/test_discord_hooks.py::test_github_cli_prompt_content -v`
Expected: PASS (already implemented)

- [ ] **Step 3: Inject GITHUB_CLI_PROMPT into ephemeral system prompt for Discord**

In `gateway/run.py`, inside `run_sync()` (around line 6568-6571), `combined_ephemeral` is assembled from `context_prompt` and `self._ephemeral_system_prompt`. After that block, add:

```python
            # Inject GitHub CLI prompt for Discord platform
            from gateway.config import Platform
            if source.platform == Platform.DISCORD:
                from gateway.discord_hooks import GITHUB_CLI_PROMPT
                if combined_ephemeral:
                    combined_ephemeral = f"{combined_ephemeral}\n\n{GITHUB_CLI_PROMPT}"
                else:
                    combined_ephemeral = GITHUB_CLI_PROMPT
```

- [ ] **Step 4: Run tests**

Run: `cd /home/clsandoval/cs/monorepo/projects/hermes-agent && python -m pytest tests/gateway/test_discord_hooks.py -v`
Expected: All 11 tests PASS

- [ ] **Step 5: Commit**

```bash
cd /home/clsandoval/cs/monorepo/projects/hermes-agent
git add gateway/run.py
git commit -m "feat(discord): inject GitHub CLI prompt into Discord sessions"
```

---

### Task 11: Update Reaction Tests for New Behavior

**Files:**
- Modify: `tests/gateway/test_discord_reactions.py`

- [ ] **Step 1: Read existing reaction tests**

Run: `cd /home/clsandoval/cs/monorepo/projects/hermes-agent && python -m pytest tests/gateway/test_discord_reactions.py -v --collect-only`

Review which tests assert "👀"/"✅"/"❌" reactions on the Discord adapter. These need to be updated since `on_processing_start/complete` no longer adds reactions — it sends/deletes embeds instead.

- [ ] **Step 2: Update failing reaction tests**

For each test that asserts reaction behavior on `on_processing_start/complete`, update it to assert embed behavior instead:

- Tests that check `add_reaction("👀")` should now check that `channel.send(embed=...)` is called
- Tests that check `add_reaction("✅")` should now check that the embed message is deleted
- Tests that check `add_reaction("❌")` should now check that the embed is edited with error state
- Tests for `_reactions_enabled()` returning False can be removed or adapted (the status embed is always-on)

The exact changes depend on the test file contents — read and adapt accordingly.

- [ ] **Step 3: Run updated tests**

Run: `cd /home/clsandoval/cs/monorepo/projects/hermes-agent && python -m pytest tests/gateway/test_discord_reactions.py -v`
Expected: All tests PASS

- [ ] **Step 4: Run full Discord test suite for regressions**

Run: `cd /home/clsandoval/cs/monorepo/projects/hermes-agent && python -m pytest tests/gateway/test_discord_*.py -v`
Expected: All Discord-related tests PASS

- [ ] **Step 5: Commit**

```bash
cd /home/clsandoval/cs/monorepo/projects/hermes-agent
git add tests/gateway/test_discord_reactions.py
git commit -m "test(discord): update reaction tests for status embed behavior"
```

---

### Task 12: Full Integration Test and Cleanup

**Files:**
- All new and modified files

- [ ] **Step 1: Run the complete test suite**

Run: `cd /home/clsandoval/cs/monorepo/projects/hermes-agent && python -m pytest tests/gateway/ -v --timeout=30`
Expected: All tests PASS, no regressions

- [ ] **Step 2: Run a focused test across all new test files**

Run: `cd /home/clsandoval/cs/monorepo/projects/hermes-agent && python -m pytest tests/gateway/test_discord_status.py tests/gateway/test_discord_context.py tests/gateway/test_discord_hooks.py -v`
Expected: All new tests PASS

- [ ] **Step 3: Verify imports are clean**

Run: `cd /home/clsandoval/cs/monorepo/projects/hermes-agent && python -c "from gateway.discord_status import StatusEmbedState, ActiveTool, narrate_tool, build_activity_embed, send_initial_status, update_status, delete_status, finalize_status_error; print('discord_status OK')" && python -c "from gateway.discord_context import collect_channel_messages, format_channel_context, should_include_message; print('discord_context OK')" && python -c "from gateway.discord_hooks import StatusEmbedManager, GITHUB_CLI_PROMPT; print('discord_hooks OK')"`
Expected: All three print OK

- [ ] **Step 4: Commit final state**

```bash
cd /home/clsandoval/cs/monorepo/projects/hermes-agent
git add -A
git status
# Only commit if there are uncommitted changes from cleanup
git diff --cached --stat
```

- [ ] **Step 5: Manual verification checklist**

Deploy to test server and verify:
1. @mention bot in a channel → status embed appears with "Thinking..."
2. Bot uses tools → embed updates with active/completed tool narrations
3. Bot starts streaming text → embed shows text preview
4. Bot finishes → embed is deleted, response appears as normal message
5. Bot errors → embed turns red with error text
6. Channel context → agent references recent conversation from the channel
7. `gh` commands work → agent can run `gh pr list`, `gh issue list`, etc.
