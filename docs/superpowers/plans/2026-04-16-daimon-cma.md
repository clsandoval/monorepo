# Daimon CMA — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold `daimon-cma` — a platform-agnostic AI agent orchestrator using Claude Managed Agents with FastMCP tools and Supabase persistence.

**Architecture:** Flat Python package (`src/daimon/`) with core API client, FastMCP tool server, Supabase-backed session/config stores, and adapter entry point stubs. Single `pyproject.toml` with uv.

**Tech Stack:** Python 3.12+, uv, httpx, FastMCP, supabase-py, dataclasses

**Spec:** `docs/superpowers/specs/2026-04-16-daimon-managed-agents-design.md`

---

## File Structure

```
daimon-cma/
├── pyproject.toml
├── .env.example
├── .gitignore
├── CLAUDE.md
├── supabase/
│   └── migrations/
│       └── 00000000000000_init.sql
├── src/daimon/
│   ├── __init__.py
│   ├── core/
│   │   ├── __init__.py
│   │   ├── client.py
│   │   ├── events.py
│   │   ├── sessions.py
│   │   └── config.py
│   ├── skills/
│   │   └── brainstorming.md
│   ├── tools/
│   │   ├── __init__.py
│   │   └── example/
│   │       └── __init__.py
│   └── adapters/
│       ├── __init__.py
│       ├── discord.py
│       ├── slack.py
│       └── web.py
└── tests/
    ├── __init__.py
    ├── test_events.py
    ├── test_client.py
    ├── test_sessions.py
    ├── test_config.py
    └── test_tools.py
```

---

### Task 1: Repository Init + Project Config

**Files:**
- Create: `daimon-cma/pyproject.toml`
- Create: `daimon-cma/.env.example`
- Create: `daimon-cma/.gitignore`
- Create: `daimon-cma/CLAUDE.md`
- Create: `daimon-cma/src/daimon/__init__.py`

- [ ] **Step 1: Create the repo directory**

```bash
mkdir -p /home/clsandoval/cs/daimon-cma
cd /home/clsandoval/cs/daimon-cma
git init
mkdir -p tests
touch tests/__init__.py
```

- [ ] **Step 2: Create pyproject.toml**

```toml
[project]
name = "daimon"
version = "0.1.0"
description = "Platform-agnostic AI agent orchestrator using Claude Managed Agents"
requires-python = ">=3.12"
dependencies = [
    "httpx>=0.28",
    "httpx-sse>=0.4",
    "fastmcp>=2",
    "supabase>=2",
    "python-dotenv>=1",
]

[project.optional-dependencies]
discord = ["discord.py>=2"]
slack = ["slack-bolt>=1"]
web = ["fastapi>=0.115", "uvicorn>=0.34"]
dev = ["pytest>=8", "pytest-asyncio>=0.24", "respx>=0.22"]

[project.scripts]
daimon-discord = "daimon.adapters.discord:main"
daimon-slack = "daimon.adapters.slack:main"
daimon-web = "daimon.adapters.web:main"

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[tool.hatch.build.targets.wheel]
packages = ["src/daimon"]

[tool.pytest.ini_options]
asyncio_mode = "auto"
testpaths = ["tests"]
```

- [ ] **Step 3: Create .env.example**

```
ANTHROPIC_API_KEY=
GITHUB_TOKEN=
SUPABASE_URL=
SUPABASE_KEY=
```

- [ ] **Step 4: Create .gitignore**

```
__pycache__/
*.pyc
.env
.venv/
dist/
*.egg-info/
.pytest_cache/
```

- [ ] **Step 5: Create CLAUDE.md**

```markdown
# Daimon CMA

Platform-agnostic AI agent orchestrator using Claude Managed Agents.

## Structure

- `src/daimon/core/` — Managed Agents API client, event types, Supabase stores
- `src/daimon/skills/` — Markdown skill files uploaded via Skills API
- `src/daimon/tools/` — FastMCP tool definitions
- `src/daimon/adapters/` — Platform adapter entry points (Discord, Slack, web)

## Commands

- `uv run pytest` — run tests
- `uv run daimon-discord` — start Discord adapter
- `uv run daimon-slack` — start Slack adapter
- `uv run daimon-web` — start web adapter

## Key Patterns

- Core is async (httpx + httpx-sse for streaming)
- Tools use FastMCP `@mcp.tool()` decorator, each module exports `TOOLS` list
- Adapters import core library, map platform conversations to managed agent sessions
- Config and session mappings persisted in Supabase
```

- [ ] **Step 6: Create package init**

Create `src/daimon/__init__.py`:

```python
"""Daimon CMA — Platform-agnostic AI agent orchestrator using Claude Managed Agents."""
```

- [ ] **Step 7: Install dependencies and commit**

```bash
cd /home/clsandoval/cs/daimon-cma
uv sync --all-extras
git add -A
git commit -m "feat: init daimon-cma repo with project config"
```

---

### Task 2: Event Types

**Files:**
- Create: `src/daimon/core/__init__.py`
- Create: `src/daimon/core/events.py`
- Create: `tests/test_events.py`

- [ ] **Step 1: Write the failing test**

Create `tests/test_events.py`:

```python
from daimon.core.events import (
    AgentMessage,
    AgentThinking,
    ToolUse,
    ToolResult,
    McpToolUse,
    McpToolResult,
    CustomToolUse,
    StatusRunning,
    StatusIdle,
    StatusTerminated,
    SessionError,
    parse_event,
)


def test_parse_agent_message():
    raw = {
        "id": "evt_01",
        "type": "agent.message",
        "content": [{"type": "text", "text": "Hello"}],
        "processed_at": "2026-04-16T00:00:00Z",
    }
    event = parse_event(raw)
    assert isinstance(event, AgentMessage)
    assert event.id == "evt_01"
    assert event.content == [{"type": "text", "text": "Hello"}]


def test_parse_status_idle_end_turn():
    raw = {
        "id": "evt_02",
        "type": "session.status_idle",
        "stop_reason": {"type": "end_turn"},
        "processed_at": "2026-04-16T00:00:00Z",
    }
    event = parse_event(raw)
    assert isinstance(event, StatusIdle)
    assert event.stop_reason_type == "end_turn"
    assert event.blocked_event_ids == []


def test_parse_status_idle_requires_action():
    raw = {
        "id": "evt_03",
        "type": "session.status_idle",
        "stop_reason": {"type": "requires_action", "event_ids": ["evt_tool_01"]},
        "processed_at": "2026-04-16T00:00:00Z",
    }
    event = parse_event(raw)
    assert isinstance(event, StatusIdle)
    assert event.stop_reason_type == "requires_action"
    assert event.blocked_event_ids == ["evt_tool_01"]


def test_parse_custom_tool_use():
    raw = {
        "id": "evt_04",
        "type": "agent.custom_tool_use",
        "name": "ask_user",
        "input": {"question": "Which approach?", "context": "Need to decide"},
        "processed_at": "2026-04-16T00:00:00Z",
    }
    event = parse_event(raw)
    assert isinstance(event, CustomToolUse)
    assert event.name == "ask_user"
    assert event.input["question"] == "Which approach?"


def test_parse_unknown_event_returns_none():
    raw = {
        "id": "evt_99",
        "type": "some.future.event",
        "processed_at": "2026-04-16T00:00:00Z",
    }
    event = parse_event(raw)
    assert event is None
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /home/clsandoval/cs/daimon-cma
uv run pytest tests/test_events.py -v
```

Expected: FAIL with `ModuleNotFoundError: No module named 'daimon.core.events'`

- [ ] **Step 3: Write the implementation**

Create `src/daimon/core/__init__.py` (empty) and `src/daimon/core/events.py`:

```python
"""Typed event models for Managed Agents SSE stream."""

from __future__ import annotations

from dataclasses import dataclass, field


@dataclass(frozen=True)
class AgentMessage:
    id: str
    content: list[dict]
    processed_at: str


@dataclass(frozen=True)
class AgentThinking:
    id: str
    content: list[dict]
    processed_at: str


@dataclass(frozen=True)
class ToolUse:
    id: str
    name: str
    input: dict
    processed_at: str


@dataclass(frozen=True)
class ToolResult:
    id: str
    tool_use_id: str
    content: list[dict]
    processed_at: str


@dataclass(frozen=True)
class McpToolUse:
    id: str
    name: str
    input: dict
    processed_at: str


@dataclass(frozen=True)
class McpToolResult:
    id: str
    tool_use_id: str
    content: list[dict]
    processed_at: str


@dataclass(frozen=True)
class CustomToolUse:
    id: str
    name: str
    input: dict
    processed_at: str


@dataclass(frozen=True)
class StatusRunning:
    id: str
    processed_at: str


@dataclass(frozen=True)
class StatusIdle:
    id: str
    stop_reason_type: str
    blocked_event_ids: list[str] = field(default_factory=list)
    processed_at: str = ""


@dataclass(frozen=True)
class StatusTerminated:
    id: str
    processed_at: str


@dataclass(frozen=True)
class SessionError:
    id: str
    error: dict
    processed_at: str


_EVENT_MAP: dict[str, type] = {
    "agent.message": AgentMessage,
    "agent.thinking": AgentThinking,
    "agent.tool_use": ToolUse,
    "agent.tool_result": ToolResult,
    "agent.mcp_tool_use": McpToolUse,
    "agent.mcp_tool_result": McpToolResult,
    "agent.custom_tool_use": CustomToolUse,
    "session.status_running": StatusRunning,
    "session.status_idle": StatusIdle,
    "session.status_terminated": StatusTerminated,
    "session.error": SessionError,
}


def parse_event(raw: dict) -> AgentMessage | AgentThinking | ToolUse | ToolResult | McpToolUse | McpToolResult | CustomToolUse | StatusRunning | StatusIdle | StatusTerminated | SessionError | None:
    """Parse a raw SSE event dict into a typed dataclass. Returns None for unknown event types."""
    event_type = raw.get("type")
    cls = _EVENT_MAP.get(event_type)
    if cls is None:
        return None

    event_id = raw["id"]
    processed_at = raw.get("processed_at", "")

    if cls is AgentMessage or cls is AgentThinking:
        return cls(id=event_id, content=raw.get("content", []), processed_at=processed_at)

    if cls is ToolUse or cls is McpToolUse or cls is CustomToolUse:
        return cls(id=event_id, name=raw.get("name", ""), input=raw.get("input", {}), processed_at=processed_at)

    if cls is ToolResult or cls is McpToolResult:
        return cls(id=event_id, tool_use_id=raw.get("tool_use_id", ""), content=raw.get("content", []), processed_at=processed_at)

    if cls is StatusRunning or cls is StatusTerminated:
        return cls(id=event_id, processed_at=processed_at)

    if cls is StatusIdle:
        stop_reason = raw.get("stop_reason", {})
        return StatusIdle(
            id=event_id,
            stop_reason_type=stop_reason.get("type", "unknown"),
            blocked_event_ids=stop_reason.get("event_ids", []),
            processed_at=processed_at,
        )

    if cls is SessionError:
        return SessionError(id=event_id, error=raw.get("error", {}), processed_at=processed_at)

    return None
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
uv run pytest tests/test_events.py -v
```

Expected: All 5 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/daimon/core/ tests/
git commit -m "feat: add typed event models for managed agents SSE stream"
```

---

### Task 3: Config Store (Supabase)

**Files:**
- Create: `src/daimon/core/config.py`
- Create: `tests/test_config.py`
- Create: `supabase/migrations/00000000000000_init.sql`

- [ ] **Step 1: Create the Supabase migration**

Create `supabase/migrations/00000000000000_init.sql`:

```sql
create table config (
    key text primary key,
    value text not null,
    updated_at timestamptz default now()
);

create table session_mappings (
    id uuid primary key default gen_random_uuid(),
    platform text not null,
    platform_thread_id text not null,
    managed_session_id text not null,
    agent_id text not null,
    created_at timestamptz default now(),
    unique (platform, platform_thread_id)
);
```

- [ ] **Step 2: Write the failing test**

Create `tests/test_config.py`:

```python
import pytest
from unittest.mock import AsyncMock, MagicMock

from daimon.core.config import ConfigStore


@pytest.fixture
def mock_supabase():
    client = MagicMock()
    return client


@pytest.fixture
def store(mock_supabase):
    return ConfigStore(mock_supabase)


def test_get_calls_supabase(store, mock_supabase):
    table = MagicMock()
    mock_supabase.table.return_value = table
    select = MagicMock()
    table.select.return_value = select
    eq = MagicMock()
    select.eq.return_value = eq
    eq.maybe_single.return_value.execute.return_value.data = {"key": "environment_id", "value": "env_123"}

    result = store.get("environment_id")
    assert result == "env_123"
    mock_supabase.table.assert_called_with("config")


def test_get_returns_none_when_missing(store, mock_supabase):
    table = MagicMock()
    mock_supabase.table.return_value = table
    select = MagicMock()
    table.select.return_value = select
    eq = MagicMock()
    select.eq.return_value = eq
    eq.maybe_single.return_value.execute.return_value.data = None

    result = store.get("nonexistent")
    assert result is None


def test_set_upserts(store, mock_supabase):
    table = MagicMock()
    mock_supabase.table.return_value = table
    upsert = MagicMock()
    table.upsert.return_value = upsert
    upsert.execute.return_value = None

    store.set("environment_id", "env_456")
    table.upsert.assert_called_once()
    call_args = table.upsert.call_args[0][0]
    assert call_args["key"] == "environment_id"
    assert call_args["value"] == "env_456"
```

- [ ] **Step 3: Run test to verify it fails**

```bash
uv run pytest tests/test_config.py -v
```

Expected: FAIL with `ModuleNotFoundError: No module named 'daimon.core.config'`

- [ ] **Step 4: Write the implementation**

Create `src/daimon/core/config.py`:

```python
"""Key-value config store backed by Supabase."""

from __future__ import annotations

from supabase import Client


class ConfigStore:
    """Simple key-value store using the Supabase `config` table."""

    def __init__(self, client: Client) -> None:
        self._client = client

    def get(self, key: str) -> str | None:
        result = (
            self._client.table("config")
            .select("value")
            .eq("key", key)
            .maybe_single()
            .execute()
        )
        if result.data is None:
            return None
        return result.data["value"]

    def set(self, key: str, value: str) -> None:
        self._client.table("config").upsert({"key": key, "value": value}).execute()
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
uv run pytest tests/test_config.py -v
```

Expected: All 3 tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/daimon/core/config.py tests/test_config.py supabase/
git commit -m "feat: add config store with Supabase migration"
```

---

### Task 4: Session Store (Supabase)

**Files:**
- Create: `src/daimon/core/sessions.py`
- Create: `tests/test_sessions.py`

- [ ] **Step 1: Write the failing test**

Create `tests/test_sessions.py`:

```python
from unittest.mock import MagicMock

from daimon.core.sessions import SessionStore


def _make_store():
    client = MagicMock()
    return SessionStore(client), client


def test_get_session_found():
    store, client = _make_store()
    table = MagicMock()
    client.table.return_value = table
    select = MagicMock()
    table.select.return_value = select
    eq1 = MagicMock()
    select.eq.return_value = eq1
    eq2 = MagicMock()
    eq1.eq.return_value = eq2
    eq2.maybe_single.return_value.execute.return_value.data = {
        "managed_session_id": "sess_123",
        "agent_id": "agent_abc",
    }

    result = store.get_session("discord", "thread_456")
    assert result == {"managed_session_id": "sess_123", "agent_id": "agent_abc"}


def test_get_session_not_found():
    store, client = _make_store()
    table = MagicMock()
    client.table.return_value = table
    select = MagicMock()
    table.select.return_value = select
    eq1 = MagicMock()
    select.eq.return_value = eq1
    eq2 = MagicMock()
    eq1.eq.return_value = eq2
    eq2.maybe_single.return_value.execute.return_value.data = None

    result = store.get_session("discord", "thread_missing")
    assert result is None


def test_create_session():
    store, client = _make_store()
    table = MagicMock()
    client.table.return_value = table
    insert = MagicMock()
    table.insert.return_value = insert
    insert.execute.return_value = None

    store.create_session(
        platform="slack",
        platform_thread_id="ts_789",
        managed_session_id="sess_456",
        agent_id="agent_def",
    )
    table.insert.assert_called_once()
    call_args = table.insert.call_args[0][0]
    assert call_args["platform"] == "slack"
    assert call_args["platform_thread_id"] == "ts_789"
    assert call_args["managed_session_id"] == "sess_456"
```

- [ ] **Step 2: Run test to verify it fails**

```bash
uv run pytest tests/test_sessions.py -v
```

Expected: FAIL with `ModuleNotFoundError: No module named 'daimon.core.sessions'`

- [ ] **Step 3: Write the implementation**

Create `src/daimon/core/sessions.py`:

```python
"""Session mapping store backed by Supabase."""

from __future__ import annotations

from supabase import Client


class SessionStore:
    """Maps platform thread IDs to managed agent session IDs."""

    def __init__(self, client: Client) -> None:
        self._client = client

    def get_session(self, platform: str, platform_thread_id: str) -> dict | None:
        result = (
            self._client.table("session_mappings")
            .select("managed_session_id, agent_id")
            .eq("platform", platform)
            .eq("platform_thread_id", platform_thread_id)
            .maybe_single()
            .execute()
        )
        return result.data

    def create_session(
        self,
        platform: str,
        platform_thread_id: str,
        managed_session_id: str,
        agent_id: str,
    ) -> None:
        self._client.table("session_mappings").insert(
            {
                "platform": platform,
                "platform_thread_id": platform_thread_id,
                "managed_session_id": managed_session_id,
                "agent_id": agent_id,
            }
        ).execute()
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
uv run pytest tests/test_sessions.py -v
```

Expected: All 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/daimon/core/sessions.py tests/test_sessions.py
git commit -m "feat: add session mapping store"
```

---

### Task 5: Managed Agents API Client

**Files:**
- Create: `src/daimon/core/client.py`
- Create: `tests/test_client.py`

- [ ] **Step 1: Write the failing test**

Create `tests/test_client.py`:

```python
import json
import pytest
import httpx
import respx

from daimon.core.client import DaimonClient

API_BASE = "https://api.anthropic.com/v1"


@pytest.fixture
def mock_transport():
    """Create a respx mock transport for injecting into DaimonClient."""
    with respx.mock(assert_all_called=False) as router:
        yield router


@pytest.fixture
def client(mock_transport):
    """DaimonClient with a mocked httpx transport."""
    mock_http = httpx.AsyncClient(transport=mock_transport.handler)
    return DaimonClient(api_key="test-key", http_client=mock_http)


async def test_create_environment(mock_transport, client):
    mock_transport.post(f"{API_BASE}/environments").mock(
        return_value=httpx.Response(200, json={"id": "env_123", "name": "daimon"})
    )
    result = await client.create_environment(name="daimon")
    assert result["id"] == "env_123"


async def test_create_agent(mock_transport, client):
    mock_transport.post(f"{API_BASE}/agents").mock(
        return_value=httpx.Response(200, json={"id": "agent_abc", "version": 1})
    )
    result = await client.create_agent(
        name="test-agent",
        model="claude-opus-4-6",
        system="You are helpful.",
        skills=[],
        tools=[{"type": "agent_toolset_20260401"}],
    )
    assert result["id"] == "agent_abc"
    assert result["version"] == 1


async def test_create_session(mock_transport, client):
    mock_transport.post(f"{API_BASE}/sessions").mock(
        return_value=httpx.Response(200, json={"id": "sess_789"})
    )
    result = await client.create_session(
        agent_id="agent_abc",
        agent_version=1,
        environment_id="env_123",
    )
    assert result["id"] == "sess_789"


async def test_send_message(mock_transport, client):
    mock_transport.post(f"{API_BASE}/sessions/sess_789/events").mock(
        return_value=httpx.Response(200, json={"ok": True})
    )
    await client.send_message(session_id="sess_789", text="Hello")


async def test_send_tool_result(mock_transport, client):
    mock_transport.post(f"{API_BASE}/sessions/sess_789/events").mock(
        return_value=httpx.Response(200, json={"ok": True})
    )
    await client.send_tool_result(
        session_id="sess_789",
        tool_use_id="evt_tool_01",
        content="User chose option A",
    )


async def test_upload_skill(mock_transport, client):
    mock_transport.post(f"{API_BASE}/skills").mock(
        return_value=httpx.Response(200, json={"id": "skill_01"})
    )
    result = await client.upload_skill(
        display_title="Brainstorming",
        files={"brainstorming.md": b"# Brainstorming\nContent here"},
    )
    assert result == "skill_01"


async def test_get_events(mock_transport, client):
    mock_transport.get(f"{API_BASE}/sessions/sess_789/events").mock(
        return_value=httpx.Response(200, json={"data": [{"id": "evt_01", "type": "agent.message"}]})
    )
    result = await client.get_events(session_id="sess_789")
    assert len(result) == 1
    assert result[0]["id"] == "evt_01"
```

- [ ] **Step 2: Run test to verify it fails**

```bash
uv run pytest tests/test_client.py -v
```

Expected: FAIL with `ModuleNotFoundError: No module named 'daimon.core.client'`

- [ ] **Step 3: Write the implementation**

Create `src/daimon/core/client.py`:

```python
"""Async client for the Claude Managed Agents API."""

from __future__ import annotations

from contextlib import asynccontextmanager
from collections.abc import AsyncIterator
import json

import httpx
from httpx_sse import aconnect_sse

from daimon.core.events import parse_event

API_BASE = "https://api.anthropic.com/v1"
BETA_AGENTS = "managed-agents-2026-04-01"
BETA_SKILLS = "skills-2025-10-02"


class DaimonClient:
    """Thin async wrapper over the Managed Agents HTTP API."""

    def __init__(self, api_key: str, http_client: httpx.AsyncClient | None = None) -> None:
        self._api_key = api_key
        self._http = http_client or httpx.AsyncClient(timeout=60)

    def _headers(self, beta: str = BETA_AGENTS) -> dict[str, str]:
        return {
            "x-api-key": self._api_key,
            "anthropic-version": "2023-06-01",
            "anthropic-beta": beta,
            "content-type": "application/json",
        }

    async def create_environment(self, name: str) -> dict:
        resp = await self._http.post(
            f"{API_BASE}/environments",
            headers=self._headers(),
            json={
                "name": name,
                "config": {"type": "cloud", "networking": {"type": "unrestricted"}},
            },
        )
        resp.raise_for_status()
        return resp.json()

    async def create_agent(
        self,
        name: str,
        model: str,
        system: str,
        skills: list[dict],
        tools: list[dict],
    ) -> dict:
        resp = await self._http.post(
            f"{API_BASE}/agents",
            headers=self._headers(),
            json={
                "name": name,
                "model": {"id": model, "speed": "standard"},
                "system": system,
                "skills": skills,
                "tools": tools,
            },
        )
        resp.raise_for_status()
        return resp.json()

    async def create_session(
        self,
        agent_id: str,
        agent_version: int,
        environment_id: str,
        resources: list[dict] | None = None,
        vault_ids: list[str] | None = None,
    ) -> dict:
        resp = await self._http.post(
            f"{API_BASE}/sessions",
            headers=self._headers(),
            json={
                "agent": {"type": "agent", "id": agent_id, "version": agent_version},
                "environment_id": environment_id,
                "resources": resources or [],
                "vault_ids": vault_ids or [],
            },
        )
        resp.raise_for_status()
        return resp.json()

    async def send_message(self, session_id: str, text: str) -> dict:
        resp = await self._http.post(
            f"{API_BASE}/sessions/{session_id}/events",
            headers=self._headers(),
            json={
                "events": [
                    {
                        "type": "user.message",
                        "content": [{"type": "text", "text": text}],
                    }
                ]
            },
        )
        resp.raise_for_status()
        return resp.json()

    async def send_tool_result(
        self, session_id: str, tool_use_id: str, content: str
    ) -> dict:
        resp = await self._http.post(
            f"{API_BASE}/sessions/{session_id}/events",
            headers=self._headers(),
            json={
                "events": [
                    {
                        "type": "user.custom_tool_result",
                        "custom_tool_use_id": tool_use_id,
                        "content": [{"type": "text", "text": content}],
                    }
                ]
            },
        )
        resp.raise_for_status()
        return resp.json()

    async def upload_skill(
        self, display_title: str, files: dict[str, bytes]
    ) -> str:
        """Upload skill files and return the skill ID."""
        headers = {
            "x-api-key": self._api_key,
            "anthropic-version": "2023-06-01",
            "anthropic-beta": BETA_SKILLS,
        }
        file_tuples = [
            ("files[]", (filename, content, "text/markdown"))
            for filename, content in files.items()
        ]
        resp = await self._http.post(
            f"{API_BASE}/skills",
            headers=headers,
            data={"display_title": display_title},
            files=file_tuples,
        )
        resp.raise_for_status()
        return resp.json()["id"]

    async def get_events(self, session_id: str) -> list[dict]:
        resp = await self._http.get(
            f"{API_BASE}/sessions/{session_id}/events",
            headers=self._headers(),
        )
        resp.raise_for_status()
        return resp.json().get("data", [])

    @asynccontextmanager
    async def stream_events(self, session_id: str) -> AsyncIterator:
        """Open an SSE stream for session events. Yields parsed event objects."""
        headers = self._headers()
        headers.pop("content-type", None)

        async with aconnect_sse(
            self._http,
            "GET",
            f"{API_BASE}/sessions/{session_id}/events/stream",
            headers=headers,
        ) as event_source:
            async def _iter_events():
                async for sse_event in event_source.aiter_sse():
                    raw = json.loads(sse_event.data)
                    parsed = parse_event(raw)
                    if parsed is not None:
                        yield parsed

            yield _iter_events()

    async def close(self) -> None:
        await self._http.aclose()
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
uv run pytest tests/test_client.py -v
```

Expected: All 7 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/daimon/core/client.py tests/test_client.py
git commit -m "feat: add managed agents API client with SSE streaming"
```

---

### Task 6: FastMCP Tool Scaffold

**Files:**
- Create: `src/daimon/tools/__init__.py`
- Create: `src/daimon/tools/example/__init__.py`
- Create: `tests/test_tools.py`

- [ ] **Step 1: Write the failing test**

Create `tests/test_tools.py`:

```python
from daimon.tools import create_mcp_server


def test_create_mcp_server():
    server = create_mcp_server()
    assert server.name == "daimon-tools"


async def test_example_tool_registered():
    server = create_mcp_server()
    tools = await server.list_tools()
    tool_names = [t.name for t in tools]
    assert "echo" in tool_names
```

- [ ] **Step 2: Run test to verify it fails**

```bash
uv run pytest tests/test_tools.py -v
```

Expected: FAIL with `ModuleNotFoundError: No module named 'daimon.tools'`

- [ ] **Step 3: Write the example tool**

Create `src/daimon/tools/example/__init__.py`:

```python
"""Example tool showing the FastMCP tool pattern."""

from __future__ import annotations


async def echo(message: str) -> str:
    """Echo a message back. Use this as a template for new tools."""
    return f"Echo: {message}"


TOOLS = [echo]
```

- [ ] **Step 4: Write the catalog/server factory**

Create `src/daimon/tools/__init__.py`:

```python
"""Tool catalog and FastMCP server factory."""

from __future__ import annotations

from fastmcp import FastMCP

from daimon.tools.example import TOOLS as EXAMPLE_TOOLS

ALL_TOOLS = [
    *EXAMPLE_TOOLS,
]


def create_mcp_server() -> FastMCP:
    """Create a FastMCP server with all registered tools."""
    mcp = FastMCP("daimon-tools")
    for tool_fn in ALL_TOOLS:
        mcp.tool()(tool_fn)
    return mcp
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
uv run pytest tests/test_tools.py -v
```

Expected: All 2 tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/daimon/tools/ tests/test_tools.py
git commit -m "feat: add FastMCP tool scaffold with example echo tool"
```

---

### Task 7: Skills Directory

**Files:**
- Create: `src/daimon/skills/brainstorming.md`

- [ ] **Step 1: Create example skill**

Create `src/daimon/skills/brainstorming.md`:

```markdown
# Brainstorming

You are a brainstorming assistant. Help the user explore ideas by asking one question at a time.

## Process

1. Understand the idea — ask clarifying questions one at a time
2. Explore alternatives — propose 2-3 approaches with trade-offs
3. Converge — help the user pick an approach and refine it

## Rules

- One question per message
- Prefer multiple choice when possible
- Don't make assumptions — ask
```

- [ ] **Step 2: Commit**

```bash
git add src/daimon/skills/
git commit -m "feat: add example brainstorming skill"
```

---

### Task 8: Adapter Stubs

**Files:**
- Create: `src/daimon/adapters/__init__.py`
- Create: `src/daimon/adapters/discord.py`
- Create: `src/daimon/adapters/slack.py`
- Create: `src/daimon/adapters/web.py`

- [ ] **Step 1: Create adapter __init__**

Create `src/daimon/adapters/__init__.py` (empty).

- [ ] **Step 2: Create Discord adapter stub**

Create `src/daimon/adapters/discord.py`:

```python
"""Discord adapter — import core + tools, map Discord threads to managed agent sessions."""

from __future__ import annotations


def main() -> None:
    """Entry point for daimon-discord."""
    raise NotImplementedError(
        "Discord adapter not yet implemented. "
        "Install discord.py (`uv pip install daimon[discord]`) and implement "
        "the bot that maps Discord threads to managed agent sessions."
    )


if __name__ == "__main__":
    main()
```

- [ ] **Step 3: Create Slack adapter stub**

Create `src/daimon/adapters/slack.py`:

```python
"""Slack adapter — import core + tools, map Slack threads to managed agent sessions."""

from __future__ import annotations


def main() -> None:
    """Entry point for daimon-slack."""
    raise NotImplementedError(
        "Slack adapter not yet implemented. "
        "Install slack_bolt (`uv pip install daimon[slack]`) and implement "
        "the app that maps Slack threads to managed agent sessions."
    )


if __name__ == "__main__":
    main()
```

- [ ] **Step 4: Create web adapter stub**

Create `src/daimon/adapters/web.py`:

```python
"""Web adapter — FastAPI endpoint that maps web sessions to managed agent sessions."""

from __future__ import annotations


def main() -> None:
    """Entry point for daimon-web."""
    raise NotImplementedError(
        "Web adapter not yet implemented. "
        "Install FastAPI (`uv pip install daimon[web]`) and implement "
        "the API that maps web sessions to managed agent sessions."
    )


if __name__ == "__main__":
    main()
```

- [ ] **Step 5: Commit**

```bash
git add src/daimon/adapters/
git commit -m "feat: add adapter entry point stubs for Discord, Slack, web"
```

---

### Task 9: Final Verification

- [ ] **Step 1: Run full test suite**

```bash
cd /home/clsandoval/cs/daimon-cma
uv run pytest -v
```

Expected: All tests pass (events: 5, config: 3, sessions: 3, client: 7, tools: 2 = ~20 tests).

- [ ] **Step 2: Verify package installs cleanly**

```bash
uv pip install -e ".[dev]"
```

- [ ] **Step 3: Verify entry points exist**

```bash
uv run daimon-discord 2>&1 | head -1
uv run daimon-slack 2>&1 | head -1
uv run daimon-web 2>&1 | head -1
```

Expected: Each prints `NotImplementedError` message.

- [ ] **Step 4: Final commit if any cleanup needed, then tag**

```bash
git tag v0.1.0
```
