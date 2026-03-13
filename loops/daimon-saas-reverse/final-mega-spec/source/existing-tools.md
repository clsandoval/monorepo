# Existing MCP Tool Catalog — Decision Orchestrator

**Source:** `projects/decision-orchestrator/apps/bot/src_v2/mcp/`
**Extracted:** 2026-03-13
**Total tools (ALL_TOOLS list):** 84 direct tools + 6 remote MCP tools (Linear) = **90 registered tools**
**Catalog file:** `src_v2/mcp/catalog.py`

---

## 1. Registry System

### Files

| File | Purpose |
|------|---------|
| `src_v2/mcp/catalog.py` | Central `ALL_TOOLS: list[ToolDef]` + `create_tool_registry()` factory |
| `src_v2/mcp/registry.py` | `ToolDef` dataclass, `ToolRegistry` class, `@tool` decorator, `ToolError`, `ToolNotFoundError` |
| `src_v2/mcp/context.py` | `ToolContext`, `UserContext`, `DatabaseContext` dataclasses |
| `src_v2/mcp/tags.py` | `Platform`, `Action`, `Scope` StrEnum tag constants |
| `src_v2/mcp/tools/*/` | Per-platform tool implementations |

### ToolDef Dataclass

```python
@dataclass(frozen=True)
class ToolDef:
    description: str                                 # Tool description for Claude
    input_model: type[BaseModel]                     # Pydantic model for inputs
    tags: AbstractSet[Platform | Action | Scope]     # Metadata tags
    handler: Callable[..., Awaitable[str]]           # Async function
    requires_credential: CredentialPlatform | None   # Optional credential gate

    @property
    def name(self) -> str: ...           # Derived from handler.__name__
    @property
    def input_schema(self) -> dict: ...  # JSON Schema from input_model
```

### @tool Decorator

```python
def tool(
    description: str,
    tags: AbstractSet[Platform | Action | Scope],
    requires_credential: CredentialPlatform | None = None,
) -> Callable[..., ToolDef]:
```

Decorated function must have signature:
```python
async def tool_name(
    tool_context: ToolContext,
    user_context: UserContext,
    db_context: DatabaseContext | None,
    params: SomePydanticModel,
) -> str:
```

### ToolRegistry

```python
class ToolRegistry:
    def __init__(self, tool_context: ToolContext, db_context: DatabaseContext | None): ...
    def register(self, tool_def: ToolDef) -> None: ...              # Raises ValueError on duplicate
    def list_tools(self, platforms: set[Platform] | None) -> list[ToolDef]: ...
    async def call_tool(self, name: str, params: dict, user_context: UserContext) -> str: ...
    def get_tool_names(self) -> list[str]: ...
```

**Credential gate:** Before dispatching, `call_tool()` checks `tool_def.requires_credential` against `user_context.credentials`. If missing, raises `ToolError("This tool requires a connected {platform} account. Run /connect {platform} to link your account.")`.

**Scope gate:** If tool has `Scope.TOGGL_WORKSPACE_ADMIN` tag, checks `user_context.credential_metadata[CredentialPlatform.TOGGL].get("toggl_workspace_role") != "admin"`. If not admin, raises `ToolError("This tool requires workspace admin permissions in Toggl.")`.

### create_tool_registry Factory

```python
def create_tool_registry(
    tool_context: ToolContext,
    db_context: DatabaseContext | None = None,
    *,
    remote_tools: list[ToolDef] | None = None,
) -> ToolRegistry:
```

Registers all `ALL_TOOLS` plus any `remote_tools` (used for Linear MCP proxy tools).

---

## 2. Context System

### ToolContext (system-level, per-bot-instance)

```python
@dataclass(frozen=True)
class ToolContext:
    discord_token: str                    # Bot token for Discord API
    discord_guild_id: str                 # Deploy-scoped guild/server ID
    fly_api_token: str                    # Fly.io Machines API token
    fly_org_slug: str                     # Fly.io organization slug
    onyx_api_key: str                     # Onyx RAG API key
    onyx_base_url: str                    # Onyx base URL (e.g. "https://cloud.onyx.app")
    toggl_workspace_id: int               # Shared Toggl workspace ID
    toggl_organization_id: int            # Shared Toggl organization ID
    anthropic_api_key: str                # Forwarded to Fly sessions
    supabase_url: str                     # Forwarded to Fly sessions
    supabase_service_role_key: str        # Forwarded to Fly sessions
    linkedin_community_token: str         # LinkedIn Community Management API (App 2)
    linkedin_ads_token: str               # LinkedIn Advertising API (App 1)
    linkedin_org_id: str                  # LinkedIn Organization ID (numeric string)
    ga_service_account_json: str = ""     # Google Analytics service account JSON
    ga_property_id: str = ""              # GA4 property ID (e.g. "279093528")
    linear_api_key: str = ""              # Linear GraphQL API key
    linear_team_id: str = ""              # Default Linear team ID
    dub_api_key: str = ""                 # Dub.co API key
```

**Multi-tenant implication:** In the SaaS version, `ToolContext` is created per tenant from their stored credentials. Each field maps to either a platform-level secret (Toggl workspace ID, LinkedIn org ID) or a per-tenant credential (discord_token, anthropic_api_key). See `multi-tenant/byok-key-routing.md`.

### UserContext (per-request, per-Discord user)

```python
@dataclass(frozen=True)
class UserContext:
    user_id: uuid.UUID | None                              # Supabase Auth user ID (None if not linked)
    discord_id: str                                        # Discord user ID (always available)
    credentials: dict[CredentialPlatform, str]             # Platform → decrypted token
    credential_metadata: dict[CredentialPlatform, dict]    # Platform → extra metadata
    conversation_id: str = ""                              # Discord thread/channel ID
    impersonating_user_id: uuid.UUID | None = None         # Set during admin impersonation

    @property
    def is_authenticated(self) -> bool: ...               # user_id is not None
```

### DatabaseContext (optional, per-handler)

```python
@dataclass(frozen=True)
class DatabaseContext:
    session_factory: Callable[[], Session]    # SQLAlchemy session factory
```

Only passed to tools that need DB access (Bluedot, Fly templates, Decision Hub skills).

---

## 3. Tags System

### Platform (StrEnum) — from `src_v2/core/platforms.py`, re-exported via `tags.py`

| Tag | String Value | Tools |
|-----|-------------|-------|
| Platform.DISCORD | "discord" | discord_* tools |
| Platform.GITHUB | "github" | github_run_gh |
| Platform.TOGGL | "toggl" | toggl_* tools |
| Platform.LINKEDIN | "linkedin" | linkedin_* tools |
| Platform.FLY | "fly" | fly_* tools |
| Platform.BLUEDOT | "bluedot" | bluedot_* tools |
| Platform.ONYX | "onyx" | onyx_* tools |
| Platform.ACP | "acp" | acp_* tools |
| Platform.DECISION_HUB | "decision_hub" | decision_hub_* tools |
| Platform.LINEAR | "linear" | linear_* tools |
| Platform.DUB | "dub" | dub_* tools |
| Platform.GOOGLE_ANALYTICS | "google_analytics" | ga_* tools |

### Action (StrEnum) — in `tags.py`

| Tag | String Value | Meaning |
|-----|-------------|---------|
| Action.READ | "read" | Read-only operation |
| Action.WRITE | "write" | Creates or modifies data |
| Action.HEALTH | "health" | Health check |
| Action.SESSION | "session" | Session management |
| Action.TOOLS | "tools" | Tool introspection |
| Action.COMMUNICATION | "communication" | Message sending |

### Scope (StrEnum) — in `tags.py`

| Tag | String Value | Gate Behavior |
|-----|-------------|--------------|
| Scope.TOGGL_WORKSPACE_ADMIN | "toggl_workspace_admin" | Requires `credential_metadata[TOGGL]["toggl_workspace_role"] == "admin"` |

---

## 4. Complete Tool Catalog

Tools ordered as in `ALL_TOOLS` list in `catalog.py`. Total: 84 direct tools.

---

### 4.1 Dub.co (2 tools)

**Platform:** `Platform.DUB`
**Source:** `src_v2/mcp/tools/dub/tools.py`
**Auth:** `tool_context.dub_api_key` (system-level, raises `ToolError` if not configured)

#### `dub_list_links`

- **Description:** "List Dub.co short links with their UTM parameters and aggregate stats (clicks, leads, sales, saleAmount). Use to discover which links exist, check their UTM tags, or find top-performing links."
- **Tags:** `{Platform.DUB, Action.READ}`
- **requires_credential:** None (uses system dub_api_key)
- **Input Model: `DubListLinksInput`**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| search | str \| None | None | Search by slug or destination URL |
| domain | str \| None | None | Filter by short link domain |
| tag_names | str \| None | None | Filter by tag name |
| sort_by | SortBy \| None | None | Sort field: createdAt, clicks, saleAmount, lastClicked |
| sort_order | SortOrder \| None | None | Sort direction: asc, desc |
| page | int | 1 | Page number (starts at 1) |
| page_size | int | 100 | Results per page, max 100 |

#### `dub_get_analytics`

- **Description:** "Get aggregated Dub.co analytics. Group by time, geography, device, browser, UTM parameters, referrer, and more. Filter by link, domain, date range, or any dimension. Use after dub_list_links to drill into specific link performance."
- **Tags:** `{Platform.DUB, Action.READ}`
- **requires_credential:** None
- **Input Model: `DubGetAnalyticsInput`**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| event | AnalyticsEvent \| None | None | Event type: clicks, leads, sales, composite |
| group_by | AnalyticsGroupBy \| None | None | Aggregation: count, timeseries, top_links, countries, cities, regions, continents, devices, browsers, os, referers, referer_urls, utm_sources, utm_mediums, utm_campaigns, utm_terms, utm_contents |
| link_id | str \| None | None | Filter to specific link ID |
| domain | str \| None | None | Filter by domain |
| interval | str \| None | None | Predefined: 24h, 7d, 30d, 90d, 1y, mtd, qtd, ytd, all |
| start | str \| None | None | Start date ISO 8601 (overrides interval) |
| end | str \| None | None | End date ISO 8601 (overrides interval) |
| timezone | str \| None | None | IANA timezone (default: UTC) |
| country | str \| None | None | Filter by 2-letter ISO country code |
| city | str \| None | None | Filter by city name |
| device | str \| None | None | Filter by device type |
| browser | str \| None | None | Filter by browser |
| os | str \| None | None | Filter by operating system |
| referer | str \| None | None | Filter by referrer hostname |
| url | str \| None | None | Filter by destination URL |
| tag_id | str \| None | None | Filter by tag ID |
| utm_source | str \| None | None | Filter by UTM source |
| utm_medium | str \| None | None | Filter by UTM medium |
| utm_campaign | str \| None | None | Filter by UTM campaign |
| utm_term | str \| None | None | Filter by UTM term |
| utm_content | str \| None | None | Filter by UTM content |

---

### 4.2 Discord (7 tools)

**Platform:** `Platform.DISCORD`
**Source:** `src_v2/mcp/tools/discord/read.py`, `write.py`
**Auth:** `tool_context.discord_token` + `tool_context.discord_guild_id`
**Safety guard:** Write tools call `validate_channel_writable(channel.name)` — blocks channels with "client" in name. Also blocks threads whose parent is a client channel.

#### `discord_read_thread`

- **Description:** "Read message history from a Discord thread. Use when a user shares a thread link or asks about a thread conversation. Returns messages oldest-first. Bot messages marked [assistant], humans [user]. Each message includes: Role ([user] or [assistant]), Display name, @username, and user ID, Timestamp, Message content"
- **Tags:** `{Platform.DISCORD, Action.READ}`
- **Input Model: `ReadThreadInput`**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| thread_id | str | required | Discord thread ID (numeric string, not a URL) |

#### `discord_read_channel`

- **Description:** "Read recent messages from a Discord channel. Use when a user asks about channel activity or wants recent context. Returns messages oldest-first. Bot messages marked [assistant], humans [user]. Each message includes: Role ([user] or [assistant]), Display name, @username, and user ID, Timestamp, Message content"
- **Tags:** `{Platform.DISCORD, Action.READ}`
- **Input Model: `ReadChannelInput`**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| channel_id | str | required | Discord channel ID (numeric string, not a URL) |
| limit | int | 50 | Max messages to fetch (1-100) |

#### `discord_parse_link`

- **Description:** "Extract IDs from a Discord URL. Use to determine what a link points to before reading content. Supports discord.com, ptb.discord.com, and canary.discord.com URLs. After parsing: If link_type is 'channel': use discord_read_channel(channel_id). If link_type is 'message_or_thread': try discord_read_thread(message_id) first; if that fails, the ID refers to a message in that channel, not a thread"
- **Tags:** `{Platform.DISCORD, Action.READ}`
- **Input Model: `ParseLinkInput`**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| url | str | required | Full Discord URL to parse |

#### `discord_search_messages`

- **Description:** "Search messages across a Discord guild. Use when looking for specific messages by content, author, channel, or content type. Returns up to 25 results per request. Use offset to paginate. Note: Discord may return 202 if search index is still building - retry shortly. Each result includes: Date, author display name, @username, and user ID, Channel ID where message was posted, Full message content, Message ID for reference"
- **Tags:** `{Platform.DISCORD, Action.READ}`
- **Input Model: `SearchMessagesInput`**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| content | str \| None | None | Text to search for (max 1024 chars) |
| author_ids | list[str] \| None | None | Filter to messages from these user IDs |
| author_types | list[str] \| None | None | Filter by author type: 'user', 'bot', or 'webhook' |
| mentions | list[str] \| None | None | Filter to messages mentioning these user IDs |
| channel_ids | list[str] \| None | None | Filter to messages in these channels |
| has | list[str] \| None | None | Filter by content type: 'image', 'video', 'file', 'sticker', 'embed', 'link', 'poll', 'sound' |
| limit | int | 25 | Results per request (1-25) |
| offset | int | 0 | Skip this many results for pagination (0-9975) |

#### `discord_get_message`

- **Description:** "Fetch the full content of a single Discord message by ID. Use this to retrieve a specific message when you have the channel and message IDs. Returns the full message with author info and complete content."
- **Tags:** `{Platform.DISCORD, Action.READ}`
- **Input Model: `GetMessageInput`**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| channel_id | str | required | Discord channel ID where the message was posted |
| message_id | str | required | Discord message ID to fetch |

#### `discord_send_message`

- **Description:** "Send a message to a Discord text channel. NEVER use this tool to communicate with clients. This is for internal team channels only. Use when you need to post information, updates, or results to a specific channel. Cannot write to channels whose name contains 'client' (client-facing channels are protected). Returns confirmation with the message ID."
- **Tags:** `{Platform.DISCORD, Action.WRITE}`
- **Input Model: `SendMessageInput`**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| channel_id | str | required | Discord channel ID to send the message to |
| content | str | required | Message content (max 2000 characters) |
| silent | bool | False | If true, suppress notifications for this message |

#### `discord_create_thread`

- **Description:** "Create a public thread in a Discord text channel and post an initial message. NEVER use this tool to communicate with clients. This is for internal team channels only. Use when you need to start a focused discussion or post structured content in its own thread. Cannot create threads in channels whose name contains 'client' (client-facing channels are protected). Returns confirmation with the thread ID."
- **Tags:** `{Platform.DISCORD, Action.WRITE}`
- **Input Model: `CreateThreadInput`**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| channel_id | str | required | Discord channel ID to create the thread in |
| thread_name | str | required | Thread name (max 100 characters) |
| content | str | required | Initial message content (max 2000 characters) |
| silent | bool | False | If true, suppress notifications for the initial message |

---

### 4.3 Fly.io (9 tools)

**Platform:** `Platform.FLY`
**Source:** `src_v2/mcp/tools/fly/tools.py`
**Auth:** `tool_context.fly_api_token` + `tool_context.fly_org_slug`
**Purpose:** Launch and manage ephemeral Fly.io session machines (running Marimo notebooks with Claude access)

#### `fly_launch_session`

- **Description:** "Launch a new ephemeral session on Fly.io from a template. Creates a new Fly app with a running machine based on the template's Docker image. Returns URLs for accessing the session."
- **Tags:** `{Platform.FLY, Action.SESSION, Action.WRITE}`
- **Input Model: `LaunchSessionInput`**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| template | str | required | Template slug to launch |
| region | str | "iad" | Fly.io region code |
| cpu_kind | str | "shared" | CPU kind: shared or performance |
| cpus | int | 2 | Number of CPUs |
| memory_mb | int | 4096 | Memory in megabytes |

#### `fly_stop_session`

- **Description:** "Stop and delete a Fly.io session app. Permanently deletes the app and all its resources."
- **Tags:** `{Platform.FLY, Action.SESSION, Action.WRITE}`
- **Input Model: `StopSessionInput`**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| app_name | str | required | Fly app name to stop |

#### `fly_get_session_status`

- **Description:** "Get status of a Fly.io session. Returns machine state, region, and access URLs."
- **Tags:** `{Platform.FLY, Action.SESSION, Action.READ}`
- **Input Model: `GetSessionStatusInput`**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| app_name | str | required | Fly app name to check |

#### `fly_list_sessions`

- **Description:** "List all active Fly.io sessions. Returns list of running mmm-* apps with their status."
- **Tags:** `{Platform.FLY, Action.SESSION, Action.READ}`
- **Input Model: `ListSessionsInput`** (empty — no fields)

#### `fly_list_images`

- **Description:** "List available Docker images from template apps. Shows images that can be used for launching new sessions."
- **Tags:** `{Platform.FLY, Action.READ}`
- **Input Model: `ListImagesInput`** (empty — no fields)

#### `fly_list_templates`

- **Description:** "List available session templates. Returns system templates and saved templates visible to the user."
- **Tags:** `{Platform.FLY, Action.READ}`
- **Input Model: `ListTemplatesInput`**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| discord_user_id | str \| None | None | Filter saved templates by Discord user ID |

#### `fly_save_template`

- **Description:** "Save a deployed Fly app as a reusable template. Creates a template that can be used to launch new sessions."
- **Tags:** `{Platform.FLY, Action.WRITE}`
- **Input Model: `SaveTemplateInput`**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| slug | str | required | Template slug (unique identifier) |
| name | str | required | Human-readable template name |
| fly_app | str | required | Fly app name to save as template |
| description | str \| None | None | Optional description |
| source_repos | str \| None | None | Comma-separated source repository names |
| framework | str \| None | None | Framework name |
| is_public | bool | False | Whether template is visible to all users |
| discord_user_id | str \| None | None | Discord user ID for ownership |
| discord_user_name | str \| None | None | Discord username for display |

#### `fly_delete_template`

- **Description:** "Delete a saved template. Only the template creator can delete their templates. System templates cannot be deleted."
- **Tags:** `{Platform.FLY, Action.WRITE}`
- **Input Model: `DeleteTemplateInput`**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| slug | str | required | Template slug to delete |
| discord_user_id | str \| None | None | Discord user ID for ownership verification |

#### `fly_launch_builder`

- **Description:** "Launch a Docker-in-Docker builder session. Creates a beefier session with Docker, git, and Claude assistant for building and deploying applications."
- **Tags:** `{Platform.FLY, Action.WRITE}`
- **Hardcoded:** Uses template `"decision-pack-compiler"`, cpu_kind `"performance"`, cpus `4`
- **Input Model: `LaunchBuilderInput`**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| region | str | "iad" | Fly.io region code |
| memory_mb | int | 8192 | Memory in megabytes |

---

### 4.4 Bluedot (4 tools)

**Platform:** `Platform.BLUEDOT`
**Source:** `src_v2/mcp/tools/bluedot/read.py`
**Auth:** `db_context` (required — reads from `bluedot_transcripts` table via DatabaseContext)
**Note:** All Bluedot tools raise `ToolError("Database context required for Bluedot tools")` if `db_context is None`.

#### `bluedot_list_meetings`

- **Description:** "List all accessible Bluedot meetings, newest first. Returns meetings from the workspace that have been shared or are public. Private meetings are not included. Each entry shows date, title, duration, attendees, and available content (transcript/summary). Use date_from and date_to to restrict to a specific date range (e.g. 'last week', 'this month', 'on Feb 26')."
- **Tags:** `{Platform.BLUEDOT, Action.READ}`
- **Input Model: `ListMeetingsInput`**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| start_date | str \| None | None | Only include meetings on or after this date (ISO 8601, e.g. '2026-02-01') |
| end_date | str \| None | None | Only include meetings on or before this date (ISO 8601, e.g. '2026-02-26') |

#### `bluedot_get_transcript`

- **Description:** "Get the full transcript of a Bluedot meeting. Returns speaker-attributed transcript. Use bluedot_list_meetings first to find the meeting_id."
- **Tags:** `{Platform.BLUEDOT, Action.READ}`
- **Input Model: `GetTranscriptInput`**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| meeting_id | str | required | Meeting ID from bluedot_list_meetings |
| max_lines | int \| None | None | Truncate transcript to this many lines |

#### `bluedot_get_summary`

- **Description:** "Get the AI-generated summary of a Bluedot meeting. Returns the meeting summary with action items and key points. Use bluedot_list_meetings first to find the meeting_id."
- **Tags:** `{Platform.BLUEDOT, Action.READ}`
- **Input Model: `GetSummaryInput`**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| meeting_id | str | required | Meeting ID from bluedot_list_meetings |

#### `bluedot_search_transcripts`

- **Description:** "Search across all accessible Bluedot transcripts and summaries. Finds meetings where the transcript or summary contains the search term. Returns matching meetings ordered newest first. ALWAYS pass date_from and date_to when the user mentions a specific date, week, or time range — do not filter results yourself after calling this tool."
- **Tags:** `{Platform.BLUEDOT, Action.READ}`
- **Input Model: `SearchTranscriptsInput`**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| query | str | required | Keyword or phrase to search across transcripts and summaries |
| start_date | str \| None | None | Search only meetings on or after this date (ISO 8601) |
| end_date | str \| None | None | Search only meetings on or before this date (ISO 8601) |
| limit | int | 25 | Max results to return (1-100) |

**Note on sync:** Meetings sync via Bluedot webhook. Private meetings and meetings in Collections may not sync automatically. Error message guides user to re-export manually: open meeting → three-dot menu → "Export to webhook".

---

### 4.5 Onyx (2 tools)

**Platform:** `Platform.ONYX`
**Source:** `src_v2/mcp/tools/onyx/query.py`
**Auth:** `tool_context.onyx_api_key` + `tool_context.onyx_base_url`
**Purpose:** Knowledge base RAG (Retrieval-Augmented Generation) via Onyx (formerly Danswer)

#### `onyx_list_agents`

- **Description:** "List available Onyx knowledge base agents. Returns list of agents with their IDs, names, descriptions, and associated document sets. Use agent IDs with onyx_query."
- **Tags:** `{Platform.ONYX, Action.READ}`
- **Input Model: `ListAgentsInput`** (empty — no fields)

#### `onyx_query`

- **Description:** "Query the organization's knowledge base using Onyx RAG. Returns answer with citations from source documents. Use onyx_list_agents to discover available agents."
- **Tags:** `{Platform.ONYX, Action.READ}`
- **Input Model: `QueryInput`**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| message | str | required | Query message |
| persona_id | int | 0 | Onyx agent/persona ID (0 = default) |

---

### 4.6 GitHub (1 tool)

**Platform:** `Platform.GITHUB`
**Source:** `src_v2/mcp/tools/github/tools.py`
**Auth:** `user_context.credentials[CredentialPlatform.GITHUB]` (per-user OAuth token)
**Timeout:** 30 seconds

#### `github_run_gh`

- **Description:** "Run a GitHub CLI (gh) command using the requesting user's credentials."
- **Tags:** `{Platform.GITHUB, Action.WRITE}`
- **requires_credential:** `CredentialPlatform.GITHUB`
- **Input Model: `RunGhInput`**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| command | str | required | gh CLI arguments (e.g., 'pr list --repo owner/repo --state open') |

**Implementation note:** Strips leading "gh " prefix if included. Executes `gh {args}` with `GH_TOKEN={user_token}` in environment. Timeout 30 seconds.

---

### 4.7 Credentials (1 tool)

**Platform:** None (no platform tag)
**Source:** `src_v2/mcp/tools/credentials/tools.py`

#### `get_credential`

- **Description:** "Get the requesting user's API token for a platform. Use this when writing ad-hoc scripts that call platform APIs directly."
- **Tags:** `{Action.READ}`
- **Input Model: `GetCredentialInput`**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| platform | CredentialPlatform | required | Platform to get credential for (e.g. 'toggl', 'github') |

**Returns:** Raw decrypted API token string. Raises `ToolError` if not linked.

---

### 4.8 ACP — Agent Communication Protocol (4 tools)

**Platform:** `Platform.ACP`
**Source:** `src_v2/mcp/tools/acp/tools.py`
**Purpose:** Claude-to-Claude communication with remote Fly.io sessions via ACP (HTTP protocol)
**Note:** ACP is a custom protocol built on top of MCP, enabling Claude to call tools and send messages to remote Claude sessions running on Fly.io.

#### `acp_health_check`

- **Description:** "Check if ACP server is healthy on a Fly.io session. Use before sending messages to verify the session is reachable."
- **Tags:** `{Platform.ACP, Action.SESSION, Action.HEALTH}`
- **Input Model: `HealthCheckInput`**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| app_name | str | required | Fly app name (e.g., "mmm-abc12345") or local address |

#### `acp_list_tools`

- **Description:** "List tools available to session Claude via ACP. Use to discover what capabilities the remote session has."
- **Tags:** `{Platform.ACP, Action.SESSION, Action.TOOLS}`
- **Input Model: `ListToolsInput`**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| app_name | str | required | Fly app name (e.g., "mmm-abc12345") or local address |

#### `acp_send_message`

- **Description:** "Send a message to session Claude via ACP. Use for Claude-to-Claude communication with remote sessions."
- **Tags:** `{Platform.ACP, Action.SESSION, Action.COMMUNICATION}`
- **Input Model: `SendMessageInput`**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| app_name | str | required | Fly app name (e.g., "mmm-abc12345") or local address |
| message | str | required | Message to send to the session |
| timeout | int | 120 | Response timeout in seconds (10-600) |

#### `acp_call_tool`

- **Description:** "Call a specific tool on the remote session via ACP. Use to execute tools on the remote session without going through Claude."
- **Tags:** `{Platform.ACP, Action.SESSION, Action.TOOLS}`
- **Input Model: `CallToolInput`**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| app_name | str | required | Fly app name (e.g., "mmm-abc12345") or local address |
| server | str | required | MCP server name (e.g., "marimo") |
| tool | str | required | Tool name (e.g., "get_active_notebooks") |
| params | str | "{}" | Tool parameters as JSON string |

---

### 4.9 LinkedIn (17 tools)

**Platform:** `Platform.LINKEDIN`
**Source:** `src_v2/mcp/tools/linkedin/` (posts.py, ads.py, org_stats.py, ad_analytics.py, events.py, leads.py, conversions.py, ad_library.py)
**Auth:** Two tokens from ToolContext:
- `tool_context.linkedin_community_token` — Community Management API (App 2) — used by posts, org_stats
- `tool_context.linkedin_ads_token` — Advertising/Marketing API (App 1) — used by ads, ad_analytics, events, leads, conversions, ad_library
- `tool_context.linkedin_org_id` — Numeric organization ID (shared across both)

#### `linkedin_list_posts`

- **Description:** "List recent posts from the LinkedIn organization page. Returns post text, visibility, and lifecycle state."
- **Tags:** `{Platform.LINKEDIN, Action.READ}`
- **Input Model: `ListPostsInput`**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| count | int | 10 | Number of posts to return (max 100) |
| start | int | 0 | Offset for pagination |

#### `linkedin_create_post`

- **Description:** "Create a text or article post on the LinkedIn organization page."
- **Tags:** `{Platform.LINKEDIN, Action.WRITE}`
- **Input Model: `CreatePostInput`**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| commentary | str | required | Post text content |
| visibility | str | "PUBLIC" | Post visibility: PUBLIC or CONNECTIONS |
| article_url | str \| None | None | URL for article post (optional) |
| article_title | str \| None | None | Article title (optional, requires article_url) |
| article_description | str \| None | None | Article description (optional) |

#### `linkedin_update_post`

- **Description:** "Update the text of an existing LinkedIn post."
- **Tags:** `{Platform.LINKEDIN, Action.WRITE}`
- **Input Model: `UpdatePostInput`**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| post_urn | str | required | Post URN to update (e.g. urn:li:share:12345) |
| commentary | str | required | New post text |

#### `linkedin_delete_post`

- **Description:** "Delete a post from the LinkedIn organization page."
- **Tags:** `{Platform.LINKEDIN, Action.WRITE}`
- **Input Model: `DeletePostInput`**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| post_urn | str | required | Post URN to delete (e.g. urn:li:share:12345) |

#### `linkedin_get_share_stats`

- **Description:** "Get share/post engagement statistics for the LinkedIn organization (clicks, likes, comments, impressions)."
- **Tags:** `{Platform.LINKEDIN, Action.READ}`
- **Input Model: `GetShareStatsInput`**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| start_ms | int \| None | None | Start timestamp in ms since epoch |
| end_ms | int \| None | None | End timestamp in ms since epoch |
| granularity | str | "DAY" | Time granularity: DAY, WEEK, or MONTH |
| share_urns | list[str] \| None | None | Optional list of share URNs to filter by |

#### `linkedin_get_follower_stats`

- **Description:** "Get follower demographics and growth statistics for the LinkedIn organization."
- **Tags:** `{Platform.LINKEDIN, Action.READ}`
- **Input Model: `GetFollowerStatsInput`**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| start_ms | int \| None | None | Start timestamp in ms since epoch |
| end_ms | int \| None | None | End timestamp in ms since epoch |
| granularity | str | "DAY" | Time granularity: DAY, WEEK, or MONTH |

#### `linkedin_get_page_stats`

- **Description:** "Get page view statistics for the LinkedIn organization page (desktop, mobile, total)."
- **Tags:** `{Platform.LINKEDIN, Action.READ}`
- **Input Model: `GetPageStatsInput`**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| start_ms | int \| None | None | Start timestamp in ms since epoch |
| end_ms | int \| None | None | End timestamp in ms since epoch |
| granularity | str | "DAY" | Time granularity: DAY, WEEK, or MONTH |

#### `linkedin_list_ad_accounts`

- **Description:** "List LinkedIn ad accounts accessible to the organization."
- **Tags:** `{Platform.LINKEDIN, Action.READ}`
- **Input Model: `ListAdAccountsInput`**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| page_size | int | 25 | Number of accounts per page (max 100) |

#### `linkedin_list_campaigns`

- **Description:** "List campaigns in a LinkedIn ad account."
- **Tags:** `{Platform.LINKEDIN, Action.READ}`
- **Input Model: `ListCampaignsInput`**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| ad_account_id | str | required | Ad account ID |
| status_filter | list[str] \| None | None | Filter by status (ACTIVE, PAUSED, etc) |

#### `linkedin_create_campaign`

- **Description:** "Create a new campaign in a LinkedIn ad account."
- **Tags:** `{Platform.LINKEDIN, Action.WRITE}`
- **Input Model: `CreateCampaignInput`**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| ad_account_id | str | required | Ad account ID |
| campaign_data | dict[str, Any] | required | Campaign configuration (name, status, objective, etc) |

#### `linkedin_update_campaign`

- **Description:** "Update a campaign in a LinkedIn ad account (pause, resume, change budget)."
- **Tags:** `{Platform.LINKEDIN, Action.WRITE}`
- **Input Model: `UpdateCampaignInput`**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| ad_account_id | str | required | Ad account ID |
| campaign_id | str | required | Campaign ID to update |
| patch_data | dict[str, Any] | required | Fields to update (status, budget, etc) |

#### `linkedin_get_ad_analytics`

- **Description:** "Get ad performance analytics with configurable pivots, date ranges, and metrics."
- **Tags:** `{Platform.LINKEDIN, Action.READ}`
- **Input Model: `GetAdAnalyticsInput`**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| ad_account_urns | list[str] | required | Ad account URNs (e.g. urn:li:sponsoredAccount:123) |
| pivot | str | required | Pivot dimension: CAMPAIGN, CREATIVE, ACCOUNT, MEMBER_INDUSTRY, etc |
| start_year | int | required | Start date year |
| start_month | int | required | Start date month (1-12) |
| start_day | int | required | Start date day (1-31) |
| end_year | int | required | End date year |
| end_month | int | required | End date month (1-12) |
| end_day | int | required | End date day (1-31) |
| time_granularity | str | "DAILY" | DAILY, MONTHLY, or ALL |
| fields | list[str] \| None | None | Metric fields (clicks, impressions, etc) |
| campaign_urns | list[str] \| None | None | Optional campaign URN filter |

#### `linkedin_get_lead_form_responses`

- **Description:** "Get lead form responses from LinkedIn Lead Gen Forms."
- **Tags:** `{Platform.LINKEDIN, Action.READ}`
- **Input Model: `GetLeadFormResponsesInput`**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| sponsored_account_urn | str | required | Sponsored account URN (e.g. urn:li:sponsoredAccount:123) |
| start_ms | int \| None | None | Start timestamp in ms since epoch |
| end_ms | int \| None | None | End timestamp in ms since epoch |
| count | int | 100 | Number of responses to return |

#### `linkedin_send_conversions`

- **Description:** "Send conversion events to LinkedIn for offline/online attribution tracking."
- **Tags:** `{Platform.LINKEDIN, Action.WRITE}`
- **Input Model: `SendConversionsInput`**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| conversion_events | list[dict[str, Any]] | required | List of conversion event objects (each with conversion URN, timestamp, user identifiers) |

#### `linkedin_list_events`

- **Description:** "List events for the LinkedIn organization."
- **Tags:** `{Platform.LINKEDIN, Action.READ}`
- **Input Model: `ListEventsInput`** (empty — no fields)

#### `linkedin_create_event`

- **Description:** "Create a new event on the LinkedIn organization page."
- **Tags:** `{Platform.LINKEDIN, Action.WRITE}`
- **Input Model: `CreateEventInput`**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| event_data | dict[str, Any] | required | Event configuration (name, organizer URN, date, etc) |

#### `linkedin_search_ad_library`

- **Description:** "Search the LinkedIn Ad Library for public ad transparency data."
- **Tags:** `{Platform.LINKEDIN, Action.READ}`
- **Input Model: `SearchAdLibraryInput`**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| query | str \| None | None | Search query text (optional) |
| advertiser_name | str \| None | None | Filter by advertiser name (optional) |
| page_size | int | 25 | Number of results per page (max 100) |

---

### 4.10 Decision Hub (4 tools)

**Platform:** `Platform.DECISION_HUB`
**Source:** `src_v2/mcp/tools/decision_hub/tools.py`
**Auth:** `orchestrator_clients.decision_hub` client (system-level URL, no user credential)
**Purpose:** Search, download, and activate/deactivate Decision Hub skills (prompt engineering packages stored as ZIP files)
**Note:** All tools except `decision_hub_search_skills` require `db_context` for skill persistence.

#### `decision_hub_search_skills`

- **Description:** "Search Decision Hub for skills matching a natural language query. Returns skill names, descriptions, and org slugs."
- **Tags:** `{Platform.DECISION_HUB, Action.READ}`
- **Input Model: `SearchSkillsInput`**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| query | str | required | Natural language search query for Decision Hub skills |

#### `decision_hub_activate_skill`

- **Description:** "Activate a Decision Hub skill for the current conversation. Downloads and injects the skill instructions into the system prompt."
- **Tags:** `{Platform.DECISION_HUB, Action.WRITE}`
- **Input Model: `ActivateSkillInput`**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| org | str | required | Organization slug (e.g. 'pymc-labs') |
| skill_name | str | required | Skill name (e.g. 'brainstorming') |

#### `decision_hub_list_active_skills`

- **Description:** "List Decision Hub skills currently active in this conversation."
- **Tags:** `{Platform.DECISION_HUB, Action.READ}`
- **Input Model: `ListActiveSkillsInput`** (empty — no fields)

#### `decision_hub_deactivate_skill`

- **Description:** "Deactivate a Decision Hub skill from the current conversation."
- **Tags:** `{Platform.DECISION_HUB, Action.WRITE}`
- **Input Model: `DeactivateSkillInput`**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| org | str | required | Organization slug (e.g. 'pymc-labs') |
| skill_name | str | required | Skill name (e.g. 'brainstorming') |

---

### 4.11 Linear (6 tools — registered via Remote MCP Proxy)

**Platform:** `Platform.LINEAR`
**Source:** `src_v2/mcp/tools/linear/tools.py`
**Registration:** NOT in `ALL_TOOLS` list. Registered via `remote_tools` parameter in `create_tool_registry()`.
**Source of truth comment in catalog.py:** `# Linear: registered via remote MCP proxy (see remote_tools param)`
**Auth:** `tool_context.linear_api_key` + `tool_context.linear_team_id` (optional default team)
**Note:** Linear API key configuration raises `ToolError("Linear API key not configured. Set LINEAR_API_KEY in environment.")` if missing.
**Proxy:** `src_v2/mcp/tools/remote/proxy.py` — MCP Streamable HTTP client for remote tool servers

#### `linear_list_issues`

- **Description:** "List Linear issues, optionally filtered by team. Returns issue titles, states, assignees, and priorities."
- **Tags:** `{Platform.LINEAR, Action.READ}`
- **Input Model: `ListIssuesInput`**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| team_id | str \| None | None | Filter by team ID. Uses default team if not specified. |
| first | int | 50 | Maximum number of issues to return (1-100). |

#### `linear_search_issues`

- **Description:** "Search Linear issues by text query. Searches across issue titles and descriptions."
- **Tags:** `{Platform.LINEAR, Action.READ}`
- **Input Model: `SearchIssuesInput`**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| query | str | required | Search query text to find issues by title or description. |
| first | int | 20 | Maximum number of results (1-100). |

#### `linear_get_issue`

- **Description:** "Get a single Linear issue by ID or identifier (e.g. 'BAI-42'). Returns full details including description and comments."
- **Tags:** `{Platform.LINEAR, Action.READ}`
- **Input Model: `GetIssueInput`**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| issue_id | str | required | Issue ID or identifier (e.g. 'BAI-42'). |

#### `linear_create_issue`

- **Description:** "Create a new Linear issue. Requires a title. Optionally set description, priority, assignee, and labels."
- **Tags:** `{Platform.LINEAR, Action.WRITE}`
- **Input Model: `CreateIssueInput`**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| title | str | required | Issue title. |
| description | str \| None | None | Issue description in markdown. |
| team_id | str \| None | None | Team ID. Uses default team if not specified. |
| priority | int \| None | None | Priority: 0=none, 1=urgent, 2=high, 3=medium, 4=low. |
| assignee_id | str \| None | None | User ID to assign the issue to. |
| label_ids | list[str] \| None | None | List of label IDs to apply. |

#### `linear_update_issue`

- **Description:** "Update an existing Linear issue. Provide the issue ID and any fields to change (title, description, priority, state, assignee)."
- **Tags:** `{Platform.LINEAR, Action.WRITE}`
- **Input Model: `UpdateIssueInput`**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| issue_id | str | required | Issue ID or identifier to update. |
| title | str \| None | None | New title. |
| description | str \| None | None | New description in markdown. |
| priority | int \| None | None | New priority: 0=none, 1=urgent, 2=high, 3=medium, 4=low. |
| state_id | str \| None | None | New workflow state ID. |
| assignee_id | str \| None | None | New assignee user ID. |

#### `linear_list_teams`

- **Description:** "List all Linear teams in the workspace. Returns team names, keys, and available workflow states."
- **Tags:** `{Platform.LINEAR, Action.READ}`
- **Input Model: `ListTeamsInput`** (empty — no fields)

---

### 4.12 Toggl (34 tools)

**Platform:** `Platform.TOGGL`
**Source:** `src_v2/mcp/tools/toggl/tools.py`
**Auth:** `user_context.credentials[CredentialPlatform.TOGGL]` (per-user API token)
**System context:** `tool_context.toggl_workspace_id`, `tool_context.toggl_organization_id`
**Scope gate:** Most reporting tools require `Scope.TOGGL_WORKSPACE_ADMIN` (user must be Toggl workspace admin)

#### Time Entry Tools (7)

##### `toggl_get_my_time_entries`
- **Description:** "Get time entries for the authenticated user, optionally filtered by date range. Max 90-day range."
- **Tags:** `{Platform.TOGGL, Action.READ}`
- **requires_credential:** `CredentialPlatform.TOGGL`

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| start_date | str \| None | None | ISO 8601 start date filter |
| end_date | str \| None | None | ISO 8601 end date filter |

##### `toggl_get_my_time_entry`
- **Description:** "Get a single time entry by ID."
- **Tags:** `{Platform.TOGGL, Action.READ}`
- **requires_credential:** `CredentialPlatform.TOGGL`

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| time_entry_id | int | required | Time entry ID |

##### `toggl_get_my_current_time_entry`
- **Description:** "Get the currently running time entry. Returns a hint if no entry is running."
- **Tags:** `{Platform.TOGGL, Action.READ}`
- **requires_credential:** `CredentialPlatform.TOGGL`
- **Input Model:** Empty (no fields)

##### `toggl_create_my_time_entry`
- **Description:** "Create a new time entry. For a running entry, set duration to -1 and omit stop."
- **Tags:** `{Platform.TOGGL, Action.WRITE}`
- **requires_credential:** `CredentialPlatform.TOGGL`

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| start | str | required | Start time in ISO 8601 format (e.g. 2026-02-13T09:00:00Z) |
| description | str \| None | None | Description of the time entry |
| project_id | int \| None | None | Project ID to assign |
| task_id | int \| None | None | Task ID to assign |
| duration | int \| None | None | Duration in seconds. Use -1 for running entry |
| stop | str \| None | None | Stop time in ISO 8601 format |
| tags | list[str] \| None | None | Tag names to apply |
| billable | bool \| None | None | Whether entry is billable |

##### `toggl_update_my_time_entry`
- **Description:** "Update an existing time entry. Only provided fields are changed."
- **Tags:** `{Platform.TOGGL, Action.WRITE}`
- **requires_credential:** `CredentialPlatform.TOGGL`

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| time_entry_id | int | required | Time entry ID to update |
| description | str \| None | None | New description |
| project_id | int \| None | None | New project ID |
| task_id | int \| None | None | New task ID |
| start | str \| None | None | New start time |
| stop | str \| None | None | New stop time |
| duration | int \| None | None | New duration in seconds |
| tags | list[str] \| None | None | New tags |
| billable | bool \| None | None | New billable status |

##### `toggl_stop_my_time_entry`
- **Description:** "Stop a currently running time entry."
- **Tags:** `{Platform.TOGGL, Action.WRITE}`
- **requires_credential:** `CredentialPlatform.TOGGL`

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| time_entry_id | int | required | Running time entry ID to stop |

##### `toggl_bulk_edit_time_entries`
- **Description:** "Bulk edit multiple time entries using JSON Patch operations. Max 100 entries."
- **Tags:** `{Platform.TOGGL, Action.WRITE}`
- **requires_credential:** `CredentialPlatform.TOGGL`

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| time_entry_ids | list[int] | required | Time entry IDs to edit (max 100) |
| operations | list[dict[str, Any]] | required | JSON Patch operations (e.g. [{"op": "replace", "path": "/description", "value": "New desc"}]) |

#### Project Tools (4)

##### `toggl_get_projects`
- **Description:** "Get all projects in the workspace, optionally filtered by active status."
- **Tags:** `{Platform.TOGGL, Action.READ}`
- **requires_credential:** `CredentialPlatform.TOGGL`

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| active | bool \| None | None | Filter by active status |

##### `toggl_get_project`
- **Description:** "Get a single project by ID."
- **Tags:** `{Platform.TOGGL, Action.READ}`
- **requires_credential:** `CredentialPlatform.TOGGL`

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| project_id | int | required | Project ID |

##### `toggl_update_project`
- **Description:** "Update a project's metadata (name, color, status, etc.)."
- **Tags:** `{Platform.TOGGL, Action.WRITE}`
- **requires_credential:** `CredentialPlatform.TOGGL`

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| project_id | int | required | Project ID to update |
| name | str \| None | None | New project name |
| active | bool \| None | None | Active/archived status |
| color | str \| None | None | Project color hex |
| is_private | bool \| None | None | Private visibility |
| billable | bool \| None | None | Billable status |
| client_id | int \| None | None | Client ID |

##### `toggl_create_project`
- **Description:** "Create a new Toggl project in the workspace."
- **Tags:** `{Platform.TOGGL, Action.WRITE}`
- **requires_credential:** `CredentialPlatform.TOGGL`

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| name | str | required | Project name |
| client_id | int \| None | None | Toggl client ID |
| color | str \| None | None | Hex color, e.g. '#ff0000' |
| billable | bool \| None | None | Whether the project is billable |
| is_private | bool \| None | None | Whether the project is private |

#### Task Tools (5)

##### `toggl_get_tasks`
- **Description:** "Get all tasks in the workspace."
- **Tags:** `{Platform.TOGGL, Action.READ}`
- **requires_credential:** `CredentialPlatform.TOGGL`
- **Input Model:** Empty (no fields)

##### `toggl_get_task`
- **Description:** "Get a single task by project and task ID."
- **Tags:** `{Platform.TOGGL, Action.READ}`
- **requires_credential:** `CredentialPlatform.TOGGL`

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| project_id | int | required | Project ID the task belongs to |
| task_id | int | required | Task ID |

##### `toggl_get_project_tasks`
- **Description:** "Get all tasks for a specific project."
- **Tags:** `{Platform.TOGGL, Action.READ}`
- **requires_credential:** `CredentialPlatform.TOGGL`

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| project_id | int | required | Project ID to get tasks for |

##### `toggl_create_task`
- **Description:** "Create a new task under a project."
- **Tags:** `{Platform.TOGGL, Action.WRITE}`
- **requires_credential:** `CredentialPlatform.TOGGL`

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| project_id | int | required | Project ID to create task under |
| name | str | required | Task name |
| estimated_seconds | int \| None | None | Estimated time in seconds |
| active | bool | True | Whether task is active |

##### `toggl_update_task`
- **Description:** "Update a task's name, status, or estimate."
- **Tags:** `{Platform.TOGGL, Action.WRITE}`
- **requires_credential:** `CredentialPlatform.TOGGL`

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| project_id | int | required | Project ID the task belongs to |
| task_id | int | required | Task ID to update |
| name | str \| None | None | New task name |
| active | bool \| None | None | Active status |
| estimated_seconds | int \| None | None | Estimated time in seconds |

#### Workspace Member Tools (1)

##### `toggl_get_workspace_members`
- **Description:** "Look up workspace members by name or list all members. Returns Toggl user IDs needed for toggl_add_user_to_project."
- **Tags:** `{Platform.TOGGL, Action.READ}`
- **requires_credential:** `CredentialPlatform.TOGGL`

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| name | str \| None | None | Filter members by name (server-side search) |

#### Project User Tools (3)

##### `toggl_add_user_to_project`
- **Description:** "Add a user to a Toggl project. user_id is the Toggl user ID — use toggl_get_workspace_members to look up users by name/email first."
- **Tags:** `{Platform.TOGGL, Action.WRITE}`
- **requires_credential:** `CredentialPlatform.TOGGL`

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| project_id | int | required | Toggl project ID |
| user_id | int | required | Toggl user ID (from toggl_get_workspace_members) |
| manager | bool | False | Whether the user is a project manager |

##### `toggl_get_project_users`
- **Description:** "List users assigned to a Toggl project. Returns project_user_id for each member — this ID (not user_id) is required for toggl_remove_user_from_project."
- **Tags:** `{Platform.TOGGL, Action.READ}`
- **requires_credential:** `CredentialPlatform.TOGGL`

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| project_id | int | required | Toggl project ID |

##### `toggl_remove_user_from_project`
- **Description:** "Remove a user from a Toggl project. Takes project_user_id (the association ID), not user_id. Get this from toggl_get_project_users."
- **Tags:** `{Platform.TOGGL, Action.WRITE}`
- **requires_credential:** `CredentialPlatform.TOGGL`

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| project_user_id | int | required | Project-user association ID (from toggl_get_project_users, NOT user_id) |

#### Workspace Report Tools (14) — All require `Scope.TOGGL_WORKSPACE_ADMIN`

##### `toggl_search_workspace_time_entries`
- **Description:** "Search all workspace members' time entries. Requires workspace admin. Supports date ranges beyond 1 year (auto-chunked)."
- **Tags:** `{Platform.TOGGL, Action.READ, Scope.TOGGL_WORKSPACE_ADMIN}`
- **requires_credential:** `CredentialPlatform.TOGGL`

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| start_date | str | required | Start date (YYYY-MM-DD) |
| end_date | str | required | End date (YYYY-MM-DD) |
| user_ids | list[int] \| None | None | Filter by user IDs |
| project_ids | list[int] \| None | None | Filter by project IDs |

##### `toggl_get_workspace_time_summary`
- **Description:** "Get aggregated time summary for all workspace members. Requires workspace admin. Group by users, projects, or clients."
- **Tags:** `{Platform.TOGGL, Action.READ, Scope.TOGGL_WORKSPACE_ADMIN}`
- **requires_credential:** `CredentialPlatform.TOGGL`

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| start_date | str | required | Start date (YYYY-MM-DD) |
| end_date | str | required | End date (YYYY-MM-DD) |
| user_ids | list[int] \| None | None | Filter by user IDs |
| project_ids | list[int] \| None | None | Filter by project IDs |
| grouping | str \| None | None | Grouping: "users", "projects", or "clients" |
| sub_grouping | str \| None | None | Sub-grouping: "time_entries", "tasks", "users", "projects", "clients" |

##### `toggl_workspace_project_summary`
- **Description:** "Get per-project/user tracked and billable seconds. Requires workspace admin."
- **Tags:** `{Platform.TOGGL, Action.READ, Scope.TOGGL_WORKSPACE_ADMIN}`
- **requires_credential:** `CredentialPlatform.TOGGL`

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| start_date | str | required | Start date (YYYY-MM-DD) |
| end_date | str | required | End date (YYYY-MM-DD) |

##### `toggl_workspace_time_totals`
- **Description:** "Get aggregated time totals with optional day/week/month granularity. Requires workspace admin."
- **Tags:** `{Platform.TOGGL, Action.READ, Scope.TOGGL_WORKSPACE_ADMIN}`
- **requires_credential:** `CredentialPlatform.TOGGL`

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| start_date | str | required | Start date (YYYY-MM-DD) |
| end_date | str | required | End date (YYYY-MM-DD) |
| user_ids | list[int] \| None | None | Filter by user IDs |
| project_ids | list[int] \| None | None | Filter by project IDs |
| granularity | str \| None | None | Granularity: "day", "week", or "month" |

##### `toggl_weekly_report`
- **Description:** "Get weekly timesheet per user with daily breakdowns. Requires workspace admin."
- **Tags:** `{Platform.TOGGL, Action.READ, Scope.TOGGL_WORKSPACE_ADMIN}`
- **requires_credential:** `CredentialPlatform.TOGGL`

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| start_date | str | required | Start date (YYYY-MM-DD) |
| end_date | str | required | End date (YYYY-MM-DD) |
| user_ids | list[int] \| None | None | Filter by user IDs |
| project_ids | list[int] \| None | None | Filter by project IDs |

##### `toggl_export_detailed_csv`
- **Description:** "Export detailed time entries as CSV. Requires workspace admin."
- **Tags:** `{Platform.TOGGL, Action.READ, Scope.TOGGL_WORKSPACE_ADMIN}`
- **requires_credential:** `CredentialPlatform.TOGGL`

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| start_date | str | required | Start date (YYYY-MM-DD) |
| end_date | str | required | End date (YYYY-MM-DD) |
| user_ids | list[int] \| None | None | Filter by user IDs |
| project_ids | list[int] \| None | None | Filter by project IDs |

##### `toggl_export_summary_csv`
- **Description:** "Export summary time entries as CSV. Requires workspace admin."
- **Tags:** `{Platform.TOGGL, Action.READ, Scope.TOGGL_WORKSPACE_ADMIN}`
- **requires_credential:** `CredentialPlatform.TOGGL`

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| start_date | str | required | Start date (YYYY-MM-DD) |
| end_date | str | required | End date (YYYY-MM-DD) |
| grouping | str \| None | None | Grouping: "users", "projects", or "clients" |
| sub_grouping | str \| None | None | Sub-grouping: "time_entries", "tasks", "users", "projects", "clients" |
| user_ids | list[int] \| None | None | Filter by user IDs |
| project_ids | list[int] \| None | None | Filter by project IDs |

##### `toggl_project_trends`
- **Description:** "Get project trends comparing current vs previous period. Requires workspace admin. Premium feature."
- **Tags:** `{Platform.TOGGL, Action.READ, Scope.TOGGL_WORKSPACE_ADMIN}`
- **requires_credential:** `CredentialPlatform.TOGGL`

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| start_date | str | required | Start date (YYYY-MM-DD) |
| end_date | str | required | End date (YYYY-MM-DD) |
| previous_period_start | str | required | Start date for comparison period (YYYY-MM-DD) |
| project_ids | list[int] \| None | None | Filter by project IDs |

##### `toggl_employee_profitability`
- **Description:** "Export employee profitability as CSV. Requires workspace admin. Premium feature."
- **Tags:** `{Platform.TOGGL, Action.READ, Scope.TOGGL_WORKSPACE_ADMIN}`
- **requires_credential:** `CredentialPlatform.TOGGL`

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| currency | str | required | Currency code, e.g. "USD" |
| start_date | str | required | Start date (YYYY-MM-DD) |
| end_date | str | required | End date (YYYY-MM-DD) |
| user_ids | list[int] \| None | None | Filter by user IDs |

##### `toggl_project_profitability`
- **Description:** "Export project profitability as CSV. Requires workspace admin. Premium feature."
- **Tags:** `{Platform.TOGGL, Action.READ, Scope.TOGGL_WORKSPACE_ADMIN}`
- **requires_credential:** `CredentialPlatform.TOGGL`

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| currency | str | required | Currency code, e.g. "USD" |
| start_date | str | required | Start date (YYYY-MM-DD) |
| end_date | str | required | End date (YYYY-MM-DD) |
| project_ids | list[int] \| None | None | Filter by project IDs |

##### `toggl_list_report_users`
- **Description:** "List users available for report filtering. Requires workspace admin."
- **Tags:** `{Platform.TOGGL, Action.READ, Scope.TOGGL_WORKSPACE_ADMIN}`
- **requires_credential:** `CredentialPlatform.TOGGL`
- **Input Model:** Empty (no fields)

##### `toggl_list_report_projects`
- **Description:** "List projects available for report filtering. Requires workspace admin."
- **Tags:** `{Platform.TOGGL, Action.READ, Scope.TOGGL_WORKSPACE_ADMIN}`
- **requires_credential:** `CredentialPlatform.TOGGL`
- **Input Model:** Empty (no fields)

##### `toggl_list_report_clients`
- **Description:** "List clients available for report filtering. Requires workspace admin."
- **Tags:** `{Platform.TOGGL, Action.READ, Scope.TOGGL_WORKSPACE_ADMIN}`
- **requires_credential:** `CredentialPlatform.TOGGL`
- **Input Model:** Empty (no fields)

##### `toggl_list_project_user_rates`
- **Description:** "List project-user rate assignments. Requires workspace admin."
- **Tags:** `{Platform.TOGGL, Action.READ, Scope.TOGGL_WORKSPACE_ADMIN}`
- **requires_credential:** `CredentialPlatform.TOGGL`

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| project_ids | list[int] \| None | None | Filter by project IDs |

---

### 4.13 Google Analytics (4 tools)

**Platform:** `Platform.GOOGLE_ANALYTICS`
**Source:** `src_v2/mcp/tools/google_analytics/tools.py`
**Auth:** `tool_context.ga_service_account_json` + `tool_context.ga_property_id` (system-level, raises `ToolError` if not configured)

#### `ga_run_report`

- **Description:** "Run a custom Google Analytics 4 report. Specify any combination of GA4 dimensions and metrics with a date range. Common dimensions: date, sessionSourceMedium, sessionCampaignName, pagePath, country, deviceCategory. Common metrics: sessions, activeUsers, screenPageViews, bounceRate, conversions, totalRevenue."
- **Tags:** `{Platform.GOOGLE_ANALYTICS, Action.READ}`
- **Input Model: `GaRunReportInput`**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| dimensions | list[str] | required | GA4 dimension names, e.g. ['date', 'sessionSourceMedium', 'country'] |
| metrics | list[str] | required | GA4 metric names, e.g. ['sessions', 'activeUsers', 'bounceRate'] |
| start_date | str | required | Start date: YYYY-MM-DD, 'NdaysAgo', or 'today' |
| end_date | str | required | End date: YYYY-MM-DD or 'today' |
| limit | int | 50 | Max rows to return (1–1000) |

#### `ga_get_traffic_overview`

- **Description:** "Get Google Analytics traffic overview: sessions and users broken down by channel group and source/medium. Useful for understanding where traffic is coming from."
- **Tags:** `{Platform.GOOGLE_ANALYTICS, Action.READ}`
- **Hardcoded dimensions:** `["sessionDefaultChannelGroup", "sessionSourceMedium"]`
- **Hardcoded metrics:** `["sessions", "activeUsers", "bounceRate", "engagementRate"]`
- **Input Model: `GaDateRangeInput`**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| start_date | str | required | Start date: YYYY-MM-DD, 'NdaysAgo', or 'today' |
| end_date | str | required | End date: YYYY-MM-DD or 'today' |
| limit | int | 25 | Max rows to return (1–500) |

#### `ga_get_top_pages`

- **Description:** "Get the top pages on the site by pageviews for a date range. Returns page path, title, views, active users, and engagement duration."
- **Tags:** `{Platform.GOOGLE_ANALYTICS, Action.READ}`
- **Hardcoded dimensions:** `["pagePath", "pageTitle"]`
- **Hardcoded metrics:** `["screenPageViews", "activeUsers", "userEngagementDuration"]`
- **Input Model: `GaDateRangeInput`** (same as above)

#### `ga_get_campaign_performance`

- **Description:** "Get Google Analytics campaign performance: sessions, users, conversions, and revenue broken down by campaign name and source/medium. Useful for evaluating marketing campaigns."
- **Tags:** `{Platform.GOOGLE_ANALYTICS, Action.READ}`
- **Hardcoded dimensions:** `["sessionCampaignName", "sessionSourceMedium"]`
- **Hardcoded metrics:** `["sessions", "activeUsers", "conversions", "totalRevenue"]`
- **Input Model: `GaDateRangeInput`** (same as above)

---

## 5. ALL_TOOLS List (catalog order)

| # | Tool Name | Platform | Count in group |
|---|-----------|----------|---------------|
| 1 | dub_list_links | DUB | 1/2 |
| 2 | dub_get_analytics | DUB | 2/2 |
| 3 | discord_read_thread | DISCORD | 1/7 |
| 4 | discord_read_channel | DISCORD | 2/7 |
| 5 | discord_parse_link | DISCORD | 3/7 |
| 6 | discord_search_messages | DISCORD | 4/7 |
| 7 | discord_get_message | DISCORD | 5/7 |
| 8 | discord_send_message | DISCORD | 6/7 |
| 9 | discord_create_thread | DISCORD | 7/7 |
| 10 | fly_launch_session | FLY | 1/9 |
| 11 | fly_stop_session | FLY | 2/9 |
| 12 | fly_get_session_status | FLY | 3/9 |
| 13 | fly_list_sessions | FLY | 4/9 |
| 14 | fly_list_images | FLY | 5/9 |
| 15 | fly_list_templates | FLY | 6/9 |
| 16 | fly_save_template | FLY | 7/9 |
| 17 | fly_delete_template | FLY | 8/9 |
| 18 | fly_launch_builder | FLY | 9/9 |
| 19 | bluedot_list_meetings | BLUEDOT | 1/4 |
| 20 | bluedot_get_transcript | BLUEDOT | 2/4 |
| 21 | bluedot_get_summary | BLUEDOT | 3/4 |
| 22 | bluedot_search_transcripts | BLUEDOT | 4/4 |
| 23 | onyx_list_agents | ONYX | 1/2 |
| 24 | onyx_query | ONYX | 2/2 |
| 25 | github_run_gh | GITHUB | 1/1 |
| 26 | get_credential | (none) | 1/1 |
| 27 | acp_health_check | ACP | 1/4 |
| 28 | acp_list_tools | ACP | 2/4 |
| 29 | acp_send_message | ACP | 3/4 |
| 30 | acp_call_tool | ACP | 4/4 |
| 31 | linkedin_list_posts | LINKEDIN | 1/17 |
| 32 | linkedin_create_post | LINKEDIN | 2/17 |
| 33 | linkedin_update_post | LINKEDIN | 3/17 |
| 34 | linkedin_delete_post | LINKEDIN | 4/17 |
| 35 | linkedin_get_share_stats | LINKEDIN | 5/17 |
| 36 | linkedin_get_follower_stats | LINKEDIN | 6/17 |
| 37 | linkedin_get_page_stats | LINKEDIN | 7/17 |
| 38 | linkedin_list_ad_accounts | LINKEDIN | 8/17 |
| 39 | linkedin_list_campaigns | LINKEDIN | 9/17 |
| 40 | linkedin_create_campaign | LINKEDIN | 10/17 |
| 41 | linkedin_update_campaign | LINKEDIN | 11/17 |
| 42 | linkedin_get_ad_analytics | LINKEDIN | 12/17 |
| 43 | linkedin_get_lead_form_responses | LINKEDIN | 13/17 |
| 44 | linkedin_send_conversions | LINKEDIN | 14/17 |
| 45 | linkedin_list_events | LINKEDIN | 15/17 |
| 46 | linkedin_create_event | LINKEDIN | 16/17 |
| 47 | linkedin_search_ad_library | LINKEDIN | 17/17 |
| 48 | decision_hub_search_skills | DECISION_HUB | 1/4 |
| 49 | decision_hub_activate_skill | DECISION_HUB | 2/4 |
| 50 | decision_hub_list_active_skills | DECISION_HUB | 3/4 |
| 51 | decision_hub_deactivate_skill | DECISION_HUB | 4/4 |
| 52 | toggl_get_my_time_entries | TOGGL | 1/34 |
| 53 | toggl_get_my_time_entry | TOGGL | 2/34 |
| 54 | toggl_get_my_current_time_entry | TOGGL | 3/34 |
| 55 | toggl_create_my_time_entry | TOGGL | 4/34 |
| 56 | toggl_update_my_time_entry | TOGGL | 5/34 |
| 57 | toggl_stop_my_time_entry | TOGGL | 6/34 |
| 58 | toggl_bulk_edit_time_entries | TOGGL | 7/34 |
| 59 | toggl_get_projects | TOGGL | 8/34 |
| 60 | toggl_get_project | TOGGL | 9/34 |
| 61 | toggl_update_project | TOGGL | 10/34 |
| 62 | toggl_get_tasks | TOGGL | 11/34 |
| 63 | toggl_get_task | TOGGL | 12/34 |
| 64 | toggl_get_project_tasks | TOGGL | 13/34 |
| 65 | toggl_create_task | TOGGL | 14/34 |
| 66 | toggl_update_task | TOGGL | 15/34 |
| 67 | toggl_create_project | TOGGL | 16/34 |
| 68 | toggl_get_workspace_members | TOGGL | 17/34 |
| 69 | toggl_add_user_to_project | TOGGL | 18/34 |
| 70 | toggl_get_project_users | TOGGL | 19/34 |
| 71 | toggl_remove_user_from_project | TOGGL | 20/34 |
| 72 | toggl_search_workspace_time_entries | TOGGL | 21/34 |
| 73 | toggl_get_workspace_time_summary | TOGGL | 22/34 |
| 74 | toggl_employee_profitability | TOGGL | 23/34 |
| 75 | toggl_export_detailed_csv | TOGGL | 24/34 |
| 76 | toggl_export_summary_csv | TOGGL | 25/34 |
| 77 | toggl_list_project_user_rates | TOGGL | 26/34 |
| 78 | toggl_list_report_clients | TOGGL | 27/34 |
| 79 | toggl_list_report_projects | TOGGL | 28/34 |
| 80 | toggl_list_report_users | TOGGL | 29/34 |
| 81 | toggl_project_profitability | TOGGL | 30/34 |
| 82 | toggl_project_trends | TOGGL | 31/34 |
| 83 | toggl_weekly_report | TOGGL | 32/34 |
| 84 | toggl_workspace_project_summary | TOGGL | 33/34 |
| 85 | toggl_workspace_time_totals | TOGGL | 34/34 |
| 86 | ga_run_report | GOOGLE_ANALYTICS | 1/4 |
| 87 | ga_get_traffic_overview | GOOGLE_ANALYTICS | 2/4 |
| 88 | ga_get_top_pages | GOOGLE_ANALYTICS | 3/4 |
| 89 | ga_get_campaign_performance | GOOGLE_ANALYTICS | 4/4 |
| — | linear_list_issues | LINEAR (remote) | 1/6 |
| — | linear_search_issues | LINEAR (remote) | 2/6 |
| — | linear_get_issue | LINEAR (remote) | 3/6 |
| — | linear_create_issue | LINEAR (remote) | 4/6 |
| — | linear_update_issue | LINEAR (remote) | 5/6 |
| — | linear_list_teams | LINEAR (remote) | 6/6 |

**Total: 89 direct + 6 remote = 95 tools**

---

## 6. Tools by Credential Requirement

| Credential | Tools That Require It |
|-----------|----------------------|
| CredentialPlatform.GITHUB | github_run_gh |
| CredentialPlatform.TOGGL | All 34 toggl_* tools |
| CredentialPlatform.LINEAR | (NOT required — uses system linear_api_key from ToolContext) |

**All other tools** use system credentials from `ToolContext` (no per-user credential required):
- Discord: `tool_context.discord_token`
- Fly: `tool_context.fly_api_token`
- Bluedot: `db_context` (database)
- Onyx: `tool_context.onyx_api_key`
- ACP: No auth (app_name routing)
- LinkedIn: `tool_context.linkedin_community_token` or `tool_context.linkedin_ads_token`
- Decision Hub: External HTTP (no auth parameter in tool)
- Dub: `tool_context.dub_api_key`
- Google Analytics: `tool_context.ga_service_account_json`

---

## 7. Multi-Tenant Implications for Tool Catalog

When adapting Decision Orchestrator to multi-tenant SaaS:

1. **`tool_context.discord_token`** — Must be per-tenant. Each tenant has their own bot token stored in `discord_connections.bot_token_encrypted`.

2. **`tool_context.discord_guild_id`** — Must be per-tenant. Stored in `discord_connections.guild_id`.

3. **`tool_context.anthropic_api_key`** — Must be per-tenant (BYOK). Stored in `tenant_api_keys` where `provider = 'anthropic'`.

4. **`tool_context.linear_api_key`** + `linear_team_id` — Per-tenant service connection. Stored in `tenant_service_connections` where `service = 'linear'`.

5. **`tool_context.dub_api_key`** — Per-tenant service connection. Stored in `tenant_service_connections` where `service = 'dub'`.

6. **`tool_context.ga_service_account_json`** + `ga_property_id` — Per-tenant. Stored in `tenant_service_connections` where `service = 'google_analytics'`.

7. **LinkedIn tokens** — Per-tenant. `linkedin_community_token`, `linkedin_ads_token`, `linkedin_org_id` stored in `tenant_service_connections`.

8. **`tool_context.toggl_workspace_id`** + `toggl_organization_id` — Per-tenant. Stored in `tenant_service_connections` where `service = 'toggl'`. Note: `CredentialPlatform.TOGGL` per-user token still comes from `user_context.credentials`.

9. **`tool_context.fly_api_token`** + `fly_org_slug` — System-level (shared infrastructure). Not per-tenant.

10. **`tool_context.onyx_api_key`** + `onyx_base_url` — System-level or per-tenant depending on deployment model.

11. **Bluedot** — Reads from the `bluedot_transcripts` table scoped by workspace. With multi-tenancy, either each tenant has their own Bluedot webhook routing, or this tool is scoped to the tenant's data via RLS.

12. **ACP/Decision Hub** — System-level. Same endpoints for all tenants.

See `multi-tenant/byok-key-routing.md` for the full key routing specification.

---

## 8. CredentialPlatform Enum

From `src_v2/core/credential_platform.py` (referenced in tools but not read directly):

| Value | String | Usage |
|-------|--------|-------|
| CredentialPlatform.GITHUB | "github" | github_run_gh requires_credential |
| CredentialPlatform.TOGGL | "toggl" | All toggl_* tools requires_credential |

Additional platforms may be in this enum (Linear, etc.) but are accessed via system ToolContext rather than user credentials.
