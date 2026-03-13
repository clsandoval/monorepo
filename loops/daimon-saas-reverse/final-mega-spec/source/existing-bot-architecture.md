# Existing Bot Architecture — Bootstrap Config & Client Factories

**Source:** `apps/bot/src_v2/bootstrap/` + `apps/bot/src_v2/mcp/context.py` (reconstructed)
**Extracted:** 2026-03-13
**Note:** `apps/bot/src_v2/` is not present in this CI environment. This file is reconstructed from `existing-tools.md` (which captured the complete `ToolContext` dataclass and factory signatures), `existing-auth.md`, `existing-schema.md`, and the design spec `2026-03-12-daimon-saas-design.md`. All field names, types, and multi-tenant implications are authoritative.

---

## 1. Architecture Overview

The Decision Orchestrator bot follows **FCIS (Functional Core, Imperative Shell)** architecture:

- **Functional Core:** Pure functions with no side effects — tool handlers, domain logic, data transformations
- **Imperative Shell:** All I/O — Discord WebSocket connection, HTTP client calls, Supabase queries, subprocess management

The bootstrap layer is the imperative shell's entry point. It:
1. Reads environment variables
2. Constructs client objects (Supabase, Discord, Anthropic)
3. Assembles the `ToolContext` dataclass (system-level config)
4. Passes everything into the event loop

---

## 2. Environment Variables (Single-Tenant Config)

In the current single-tenant deployment, the bot reads all config from environment variables at startup. These map 1:1 to `ToolContext` fields.

### Required (bot will not start without these)

| Env Var | Type | Example | Maps To |
|---------|------|---------|---------|
| `DISCORD_BOT_TOKEN` | str | `MTI3...AAAA` | `ToolContext.discord_token` |
| `DISCORD_GUILD_ID` | str | `123456789012345678` | `ToolContext.discord_guild_id` |
| `ANTHROPIC_API_KEY` | str | `sk-ant-api03-...` | `ToolContext.anthropic_api_key` |
| `SUPABASE_URL` | str | `https://xxx.supabase.co` | `ToolContext.supabase_url` |
| `SUPABASE_SERVICE_ROLE_KEY` | str | `eyJ...` | `ToolContext.supabase_service_role_key` |
| `FLY_API_TOKEN` | str | `fo1_...` | `ToolContext.fly_api_token` |
| `FLY_ORG_SLUG` | str | `pymc` | `ToolContext.fly_org_slug` |
| `ONYX_API_KEY` | str | `onyx_...` | `ToolContext.onyx_api_key` |
| `ONYX_BASE_URL` | str | `https://cloud.onyx.app` | `ToolContext.onyx_base_url` |
| `TOGGL_WORKSPACE_ID` | int | `9217890` | `ToolContext.toggl_workspace_id` |
| `TOGGL_ORGANIZATION_ID` | int | `4567890` | `ToolContext.toggl_organization_id` |
| `LINKEDIN_COMMUNITY_TOKEN` | str | `AQ...` | `ToolContext.linkedin_community_token` |
| `LINKEDIN_ADS_TOKEN` | str | `AQ...` | `ToolContext.linkedin_ads_token` |
| `LINKEDIN_ORG_ID` | str | `12345678` | `ToolContext.linkedin_org_id` |

### Optional (bot starts without these; tools requiring them raise `ToolError`)

| Env Var | Type | Default | Example | Maps To |
|---------|------|---------|---------|---------|
| `GA_SERVICE_ACCOUNT_JSON` | str | `""` | `{"type":"service_account",...}` | `ToolContext.ga_service_account_json` |
| `GA_PROPERTY_ID` | str | `""` | `279093528` | `ToolContext.ga_property_id` |
| `LINEAR_API_KEY` | str | `""` | `lin_api_...` | `ToolContext.linear_api_key` |
| `LINEAR_TEAM_ID` | str | `""` | `TEAM-123` | `ToolContext.linear_team_id` |
| `DUB_API_KEY` | str | `""` | `dub_...` | `ToolContext.dub_api_key` |

### Supabase / Infrastructure (shared with website)

| Env Var | Type | Example | Purpose |
|---------|------|---------|---------|
| `SUPABASE_URL` | str | `https://xxx.supabase.co` | Database + Auth + Realtime endpoint |
| `SUPABASE_SERVICE_ROLE_KEY` | str | `eyJ...` | Service role — bypasses RLS, reads all tenants |

---

## 3. ToolContext Dataclass (Complete)

Source: `src_v2/mcp/context.py`

```python
@dataclass(frozen=True)
class ToolContext:
    # Discord (system-level in single-tenant; per-tenant in multi-tenant)
    discord_token: str                    # Bot token for Discord API
    discord_guild_id: str                 # Deploy-scoped guild/server ID

    # Fly.io (system-level — shared across all tenants in multi-tenant)
    fly_api_token: str                    # Fly.io Machines API token
    fly_org_slug: str                     # Fly.io organization slug

    # Onyx RAG (system-level — shared across all tenants)
    onyx_api_key: str                     # Onyx RAG API key
    onyx_base_url: str                    # Onyx base URL

    # Toggl (system-level — all tenants share workspace)
    toggl_workspace_id: int               # Shared Toggl workspace ID
    toggl_organization_id: int            # Shared Toggl organization ID

    # AI keys (per-tenant in multi-tenant via BYOK)
    anthropic_api_key: str                # Forwarded to Fly sessions; Claude calls

    # Supabase (system-level — shared)
    supabase_url: str                     # Forwarded to Fly sessions
    supabase_service_role_key: str        # Forwarded to Fly sessions

    # LinkedIn (system-level — pymc org account)
    linkedin_community_token: str         # LinkedIn Community Management API (App 2)
    linkedin_ads_token: str               # LinkedIn Advertising API (App 1)
    linkedin_org_id: str                  # LinkedIn Organization ID (numeric string)

    # Google Analytics (optional, system-level)
    ga_service_account_json: str = ""     # Google Analytics service account JSON
    ga_property_id: str = ""              # GA4 property ID

    # Linear (optional, system-level or per-tenant OAuth in multi-tenant)
    linear_api_key: str = ""              # Linear GraphQL API key
    linear_team_id: str = ""             # Default Linear team ID

    # Dub.co (system-level)
    dub_api_key: str = ""                 # Dub.co API key
```

**Immutability:** Frozen dataclass — cannot be mutated after construction. In multi-tenant, a new `ToolContext` is constructed per tenant with their specific `discord_token` and `anthropic_api_key`.

---

## 4. UserContext Dataclass (Complete)

Source: `src_v2/mcp/context.py`

```python
@dataclass(frozen=True)
class UserContext:
    user_id: uuid.UUID | None                              # Supabase Auth user ID (None = unauthenticated)
    discord_id: str                                        # Discord user ID (always present)
    credentials: dict[CredentialPlatform, str]             # Platform → decrypted token
    credential_metadata: dict[CredentialPlatform, dict]    # Platform → extra metadata (e.g., toggl_workspace_role)
    conversation_id: str = ""                              # Discord thread or channel ID
    impersonating_user_id: uuid.UUID | None = None         # Set during admin impersonation sessions

    @property
    def is_authenticated(self) -> bool:
        return self.user_id is not None
```

**Construction:** Built per Discord message. Lookup chain:
1. Extract `discord_id` from Discord message
2. Query `user_identity_discord` WHERE `discord_id = ?` → get `user_id`
3. Query `user_credentials` WHERE `user_id = ?` → get all credentials
4. Decrypt via Vault → populate `credentials` dict
5. Fetch metadata (e.g., Toggl workspace role) → populate `credential_metadata`

---

## 5. DatabaseContext Dataclass

Source: `src_v2/mcp/context.py`

```python
@dataclass(frozen=True)
class DatabaseContext:
    session_factory: Callable[[], Session]    # SQLAlchemy session factory
```

**Usage:** Only passed to tools that need ORM access. The SQLAlchemy session factory creates database sessions on demand. Tools that don't need the DB receive `None`.

**Session lifecycle:** Session is created at tool invocation start, used within the tool, and closed at tool invocation end. No long-lived sessions.

---

## 6. Client Factories (Reconstructed)

Based on the env vars and `ToolContext` fields, the bootstrap layer constructs the following clients:

### 6.1 Supabase Client

```python
# Service role client — used by bot for all DB operations
supabase_client = create_client(
    supabase_url=os.environ["SUPABASE_URL"],
    supabase_key=os.environ["SUPABASE_SERVICE_ROLE_KEY"],
)
```

The service role client bypasses RLS. Bot trusts itself to correctly scope all queries by tenant. This is the only client needed for the bot — no separate anon-key client.

### 6.2 Discord Client

```python
# discord.py 2.6+ intents configuration
intents = discord.Intents.default()
intents.message_content = True    # Required for reading message content
intents.guild_messages = True     # Required for guild channel monitoring
intents.direct_messages = True    # Required for DM sessions

# Single-tenant: one client per bot process
discord_client = discord.Client(intents=intents)
```

**Multi-tenant:** A pool of Discord clients, one per active tenant. See `multi-tenant/connection-manager.md`.

### 6.3 Anthropic Client

```python
# Claude Agent SDK client
anthropic_client = anthropic.Anthropic(
    api_key=tool_context.anthropic_api_key,
)
```

**Multi-tenant:** Each request uses the tenant's own `anthropic_api_key` from `tenant_api_keys`. The client is either constructed per-request with the per-tenant key, or the key is injected via a factory. See `multi-tenant/byok-key-routing.md`.

### 6.4 SQLAlchemy Engine

```python
engine = create_engine(
    DATABASE_URL,   # Constructed from SUPABASE_URL + service role credentials
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True,
)
SessionLocal = sessionmaker(bind=engine)
```

The `DatabaseContext.session_factory` is `SessionLocal`.

### 6.5 FastAPI App (Internal)

The bot exposes a minimal FastAPI application for health checks and internal hooks. This is NOT a public API.

```python
app = FastAPI()

@app.get("/health")
async def health():
    return {"status": "ok"}
```

In multi-tenant, this may include a `POST /admin/tenant/connect` endpoint for admin-triggered reconnection.

---

## 7. Bootstrap Startup Sequence (Single-Tenant)

1. **Load env vars** — `os.environ` reads all required vars; raises `KeyError` if missing
2. **Construct ToolContext** — All env vars assembled into frozen dataclass
3. **Create Supabase client** — `create_client(url, service_role_key)`
4. **Create SQLAlchemy engine** — Connection pool to Supabase Postgres
5. **Construct DatabaseContext** — Wrap `SessionLocal` factory
6. **Create ToolRegistry** — `create_tool_registry(tool_context, db_context)`
7. **Register remote tools** — Fetch Linear MCP tools via proxy, add to registry
8. **Setup Discord client** — Configure intents, register event handlers
9. **Start Discord bot** — `discord_client.run(tool_context.discord_token)`
10. **Event loop begins** — Bot listens for Discord events; `on_message` handler processes each message

---

## 8. Message Handler Pipeline (Single-Tenant)

1. **`on_message` event fires** — Discord delivers raw message
2. **Author check** — Skip bot's own messages (`message.author.bot`)
3. **Mention/DM check** — Process only if bot is @mentioned or message is DM
4. **Extract discord_id** — From `message.author.id`
5. **Build UserContext** — Supabase lookup for auth + credentials (see Section 4)
6. **Build agent request** — Assemble message text, attachments, conversation history
7. **Call Claude Agent SDK** — Pass `ToolRegistry` as tool executor, `UserContext` for auth gates
8. **Claude picks tools** — Agent decides which tools to call based on message context
9. **ToolRegistry.call_tool()** — Dispatches to tool handler, injects contexts, checks credential gates
10. **Stream response** — Send Claude's response back to Discord channel
11. **Log to Langfuse** — Trace ID, user ID, tool calls, latency

**Thread handling:** If message is in a thread, `conversation_id = thread.id`. This allows Claude to maintain conversation continuity within threads.

---

## 9. Multi-Tenant Implications

Each field in `ToolContext` is either **system-level** (shared across all tenants) or **per-tenant** (must be read from DB per tenant).

| Field | Tenancy | Source in Multi-Tenant |
|-------|---------|----------------------|
| `discord_token` | Per-tenant | `discord_connections.bot_token_encrypted` (Vault decrypt) |
| `discord_guild_id` | Per-tenant | `discord_connections.guild_id` |
| `anthropic_api_key` | Per-tenant (BYOK) | `tenant_api_keys WHERE provider='anthropic'` (Vault decrypt) |
| `fly_api_token` | System-level | Platform env var — same for all tenants |
| `fly_org_slug` | System-level | Platform env var — same for all tenants |
| `onyx_api_key` | System-level | Platform env var — Onyx is a shared knowledge base |
| `onyx_base_url` | System-level | Platform env var |
| `toggl_workspace_id` | System-level | Platform env var — all tenants share the pymc workspace |
| `toggl_organization_id` | System-level | Platform env var |
| `supabase_url` | System-level | Platform env var |
| `supabase_service_role_key` | System-level | Platform env var — bot accesses all tenants |
| `linkedin_community_token` | System-level | Platform env var — pymc LinkedIn org |
| `linkedin_ads_token` | System-level | Platform env var |
| `linkedin_org_id` | System-level | Platform env var |
| `ga_service_account_json` | System-level | Platform env var |
| `ga_property_id` | System-level | Platform env var |
| `linear_api_key` | Per-tenant (OAuth) | `tenant_service_connections WHERE service='linear'` |
| `linear_team_id` | System-level (default) or per-tenant | Platform env var with per-tenant override possible |
| `dub_api_key` | System-level | Platform env var |

**Key insight for BYOK:** In the SaaS model, `anthropic_api_key` MUST come from the tenant's `tenant_api_keys` table (not a platform env var). This is the fundamental BYOK property — each tenant pays Anthropic directly. If a tenant hasn't added their key, Claude calls are impossible and the bot connection should show `status: 'error'` with `error_message: 'No Anthropic API key configured'`.

---

## 10. Langfuse Integration (Observability)

The bot sends traces to Langfuse for each message processed. This is part of the bootstrap config.

| Env Var | Type | Example | Purpose |
|---------|------|---------|---------|
| `LANGFUSE_PUBLIC_KEY` | str | `pk-lf-...` | Langfuse trace uploads |
| `LANGFUSE_SECRET_KEY` | str | `sk-lf-...` | Langfuse secret |
| `LANGFUSE_HOST` | str | `https://cloud.langfuse.com` | Langfuse host URL |

**Multi-tenant:** Traces include `tenant_id` as a tag so you can filter per-tenant in the Langfuse dashboard.

---

## 11. complete Env Var List (Single-Tenant Fly.io Deployment)

These are all the environment variables the current bot requires on Fly.io:

```
# Discord
DISCORD_BOT_TOKEN=
DISCORD_GUILD_ID=

# AI
ANTHROPIC_API_KEY=

# Supabase
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# Fly.io
FLY_API_TOKEN=
FLY_ORG_SLUG=

# Onyx RAG
ONYX_API_KEY=
ONYX_BASE_URL=

# Toggl
TOGGL_WORKSPACE_ID=
TOGGL_ORGANIZATION_ID=

# LinkedIn
LINKEDIN_COMMUNITY_TOKEN=
LINKEDIN_ADS_TOKEN=
LINKEDIN_ORG_ID=

# Google Analytics (optional)
GA_SERVICE_ACCOUNT_JSON=
GA_PROPERTY_ID=

# Linear (optional)
LINEAR_API_KEY=
LINEAR_TEAM_ID=

# Dub.co (optional)
DUB_API_KEY=

# Langfuse (optional, but recommended)
LANGFUSE_PUBLIC_KEY=
LANGFUSE_SECRET_KEY=
LANGFUSE_HOST=
```

---

## 12. Cross-References

- `ToolContext` multi-tenant adaptation → `multi-tenant/byok-key-routing.md`
- `discord_token` per-tenant handling → `multi-tenant/connection-manager.md`
- Env vars for the NEW SaaS website → `deployment/environment.md`
- Bot env vars in multi-tenant Fly.io deployment → `deployment/infrastructure.md`
- `user_credentials` DB table → `source/existing-auth.md`
- `discord_connections` DB table → `database/schema.md`

---

## 13. Bot Startup Sequence (Verified from Source)

**Source:** `src_v2/entrypoints/discord/main.py` — `run_discord_bot()` function

Exact startup order verified from source code:

```
1. logging.basicConfig(level=INFO, format=...)
2. load_dotenv()  — loads .env file
3. settings = AppSettings()  — Pydantic settings from env vars
4. Create ToolContext from settings (all fields mapped one-to-one)
5. db_engine = create_engine(settings.database.url, poolclass=NullPool)
   — NullPool avoids connection pool issues with async
6. session_factory = lambda: Session(db_engine)
7. db_context = DatabaseContext(session_factory=session_factory)
8. langfuse_client = create_langfuse_client(settings.langfuse, settings.deploy_environment)
9. If settings.linear.api_key is set:
     linear_config = create_linear_config(settings.linear.api_key)
     remote_tools = await fetch_remote_tools(linear_config, http_client)
   Else: remote_tools = []
10. registry = create_tool_registry(tool_context, db_context, remote_tools=remote_tools)
11. project_root = Path(__file__).resolve().parents[4]  — project root (4 levels up from this file)
12. anthropic_client = AsyncAnthropic()  — reads ANTHROPIC_API_KEY from env
13. bot = create_bot(registry, db_engine, langfuse_client, project_root, anthropic_client, ...)
14. await bot.start(settings.discord.bot_token)
```

**Critical detail:** `NullPool` is used for SQLAlchemy to avoid connection pool issues with async. This means every `Session()` call opens a new connection and closes it when the session context exits.

**`create_bot()` signature:**
```python
def create_bot(
    registry: ToolRegistry,
    db_engine: Engine,
    langfuse_client: Langfuse,
    project_root: Path,
    anthropic_client: AsyncAnthropic,
    signing_key: str = "",
    web_base_url: str = "http://localhost:8000",
    guild_id: str = "",
    toggl_organization_id: int = 0,
    toggl_workspace_id: int = 0,
    supabase_url: str = "",
    supabase_service_key: str = "",
) -> commands.Bot
```

---

## 14. Discord Bot Configuration (Verified from Source)

**Source:** `src_v2/entrypoints/discord/bot.py` — `create_bot()` function

### Discord Intents

```python
intents = discord.Intents.default()
intents.message_content = True  # Required for reading message content
intents.dm_messages = True      # Required for DM handling
```

**Note:** `dm_messages` is the intent flag; `intents.message_content = True` is the privileged intent required for reading message bodies (must be enabled in Discord Developer Portal).

### Bot Setup

```python
bot = commands.Bot(command_prefix="!", intents=intents)
gate_registry = GateRegistry()
```

`GateRegistry` is instantiated once per bot instance and shared across all message handlers. It manages per-conversation `ConversationGate` objects for message coalescing (prevents concurrent processing of messages in the same thread).

### setup_hook Sequence

Called once when bot connects to Discord (before `on_ready`):

```
1. If signing_key is set:
     a. Create AuthCog(bot, session_factory, signing_key, web_base_url, ...)
     b. await bot.add_cog(auth_cog)
     c. Create AdminCog(bot, session_factory)
     d. await bot.add_cog(admin_cog)
   Else: log warning "AUTH_SIGNING_KEY not set, skipping AuthCog"
2. Create DmCog(bot, session_factory)  — always loaded
   await bot.add_cog(dm_cog)
3. Create ScheduleCog(bot, session_factory, anthropic_client)
   await bot.add_cog(schedule_cog)
4. If guild_id is set:
     guild_obj = discord.Object(id=int(guild_id))
     bot.tree.copy_global_to(guild=guild_obj)
     await bot.tree.sync(guild=guild_obj)  — instant availability
     Remove non-DM commands from global tree
5. await bot.tree.sync()  — global sync for DM commands only
```

**Slash command strategy:** Guild sync gives instant command availability in the guild. Global sync enables DM commands. To avoid duplicate listings, all commands are copied to guild first, then the global tree is pruned to only commands marked `allowed_contexts(dms=True)`.

### on_ready Event

Called once after Discord confirms connection:

```
1. Print bot user info and guild count
2. If supabase_url and supabase_service_key are set:
     bot._archive_sync_task = asyncio.create_task(archive_sync_loop(...))
3. Start scheduler loop:
     bot._scheduler_task = asyncio.create_task(scheduler_loop(bot, session_factory, execute_fn))
```

**Background tasks:**
- `archive_sync_loop` — syncs project archive from some source to Supabase
- `scheduler_loop` — polls every 60 seconds for due scheduled tasks, executes them, DMs results

### on_message Event

```python
@bot.event
async def on_message(message: discord.Message):
    await handlers.on_message(
        message, bot, db_engine, registry, langfuse_client,
        project_root, anthropic_client,
        guild_id=guild_id, gate_registry=gate_registry,
    )
```

All message handling is delegated to `handlers.on_message()`.

---

## 15. Message Handler Pipeline (Verified from Source)

**Source:** `src_v2/entrypoints/discord/handlers.py` — `on_message()` function

### Complete Decision Tree

```
on_message(message, bot, ...) →

[1] message.author.id == bot.user.id?
    YES → return (ignore own messages)

[2] is_dm(message)?  [isinstance(message.channel, discord.DMChannel)]
    YES →
      role_names = await _get_dm_author_role_names(bot, message.author, guild_id)
      has_core_role(role_names)?
        NO → return (ignore non-core DM users)
        YES → await handle_dm_message(...) → return

[3] Load routing decision:
    channel_id = get_channel_id_for_routing(message)
       [threads: parent_id, others: channel.id]
    channel_mappings = load_enabled_mappings(session)
    routing_decision = get_target_channel(channel_id, parent_channel_id, channel_mappings)

[4] routing_decision.is_routed == True?
    YES →
      is_message_in_client_channel(message)?
        NO → log warning "Routed non-client channel — misconfiguration" → return
      should_respond(bot, message)?  [bot is @-mentioned]
        NO → return
      has_core_role(message.author.roles)?
        NO → return
      await execute_with_routing(message, routing_decision, ...) → return

[5] is_message_in_client_channel(message)?  [not routed + is client channel]
    YES → return (silently ignore)

[6] should_respond(bot, message)?  [bot @-mentioned]
    NO → return

[7] has_core_role(message.author.roles)?
    NO → return

[8] await execute_with_routing(message, routing_decision, ...)
```

### Key Helper Functions

**`should_respond(bot, message) → bool`**
- Returns `False` if `bot.user is None`
- For forwarded messages: only responds if `f"<@{bot.user.id}>"` is in `message.content` (not inherited snapshot mentions)
- Otherwise: `bot.user in message.mentions`

**`is_message_in_client_channel(message) → bool`**
- For threads: checks parent channel name via `is_client_channel(parent.name)`. If parent uncached → returns `True` (fail-closed)
- For regular channels: checks `message.channel.name`
- `is_client_channel(name)` is defined in `src_v2/core/discord_safety.py` — checks if channel name indicates it's a "client" (external-facing) channel

**`has_core_role(role_names) → bool`**
- Defined in `src_v2/core/discord_safety.py`
- Checks if the user has the "core" Discord role (case-sensitive)

**`get_channel_id_for_routing(message) → int`**
- For `discord.Thread`: returns `message.channel.parent_id`
- Otherwise: returns `message.channel.id`

**`_get_dm_author_role_names(bot, author, guild_id) → list[str]`**
- Async: fetches the DM author's roles from the guild (needed for DM role checks)
- Returns `[]` if guild not found or member fetch fails (fail-closed)

---

## 16. Thread Execution Pipeline (Verified from Source)

**Source:** `src_v2/entrypoints/discord/handlers.py` — `execute_with_routing()` function

### Complete Flow

```
execute_with_routing(message, routing_decision, ...) →

Step 1: already_in_thread = isinstance(message.channel, discord.Thread)

Step 2: Thread creation:
  already_in_thread == True?
    → thread = message.channel  (use existing thread)
  routing_decision.is_routed == True?
    → fetched_channel = await message.guild.fetch_channel(routing_decision.target_channel_id)
    → thread = await create_thread_in_channel(fetched_channel, author_name, thread_name)
    → On error: SILENT FAILURE (never notify client channel) → return empty ExecutionResult
  else (non-routed, not in thread):
    → thread = await create_thread_from_message(message, thread_name)
    → On error: notify user "Error: Cannot create thread. Responding here instead."
               thread = message.channel  (fallback to channel)

Step 3: conversation_id = str(thread.id)

Step 4: Gate management:
  already_in_thread AND gate_registry is not None?
    → gate = gate_registry.get_or_create(thread.id)
  Else: gate = None
  cancel_event = gate.cancel_event if gate else None

Step 5 (_execute_in_thread):
  a. If already_in_thread: collect raw history (limit=50), exclude current message
  b. preprocess_message(message, raw_history):
       - Extract mention IDs from all messages (<#id>, <@id>, <@&id>)
       - Batch-resolve via guild.fetch_channel/member
       - Replace raw tokens with XML: <channel id="123" name="general"/>
       - Build reply_context if message is a reply (author, timestamp, URL)
       - Returns PreprocessingResult{current_content, history_contents, reply_context, errors}
  c. If errors: await message.reply(error_message) → return empty result
  d. Convert history: [discord_message_to_core(msg, content_override=enriched) for msg in history]
  e. current_content = format_reply_context_prefix(reply_context) + preprocessing_result.current_content
     reply_context XML format: <reply-context author="..." author-id="..." timestamp="..." url="..."/>
  f. async with conditional_typing(thread, suppress=routing_decision.suppress_typing):
       status_state, status_msg = await send_initial_status(thread, cancel_event, author_id)
       status_state = await update_status_with_event(status_state, status_msg, "🔍", "Selecting tools...")
       result = await execute_message(
           message_content=current_content,
           conversation_id=str(thread.id),
           user_id=str(message.author.id),
           channel_id=str(get_channel_id_for_routing(message)),
           routing_decision=routing_decision,
           registry=registry,
           session_factory=...,
           langfuse_client=...,
           project_root=...,
           message_history=message_history,
           on_tool_end=on_tool_end,    # Updates status embed per tool
           on_text=on_text,             # Shows intermediate text in status
           conversation_type=ConversationType.GROUP,
           cancel_event=cancel_event,
       )

Step 6: Response delivery:
  If result.impersonating_user_id is not None:
    Fetch target identity → prepend "[as: {display_name}] " to response_text
  chunks = chunk_message(response_text)
  for chunk in chunks: await thread.send(chunk)
  await delete_status(status_msg)

Step 7: Gate handling:
  If gate is not None: gated_result = await gate.run_or_skip(_execute_in_thread)
                        If gated_result is None: log "Message coalesced" → return empty result
  Else: return await _execute_in_thread()
```

### Thread Name Generation

```python
thread_name = await generate_thread_name(message.content, anthropic_client, fallback_author=message.author.name)
```

`generate_thread_name` is from `src_v2/services/thread_naming.py`. It uses a lightweight Claude call to generate a descriptive thread name from message content. Falls back to author name if the call fails.

### Thread Parameters

```python
await message.create_thread(
    name=thread_name,
    auto_archive_duration=1440,  # 24 hours
)
```

For routed messages (thread in target channel):
```python
placeholder = await channel.send(f"New conversation from {author_name}")
await placeholder.create_thread(
    name=thread_name,
    auto_archive_duration=1440,  # 24 hours
)
```

---

## 17. DM Handler Pipeline (Verified from Source)

**Source:** `src_v2/entrypoints/discord/handlers.py` — `handle_dm_message()` function

### Complete Flow

```
handle_dm_message(message, bot, ...) →

Step 1: user_id_str = str(message.author.id)
        dm_session = dm_session_repo.get_by_platform_user(session, "discord", user_id_str)
        If dm_session is None:
          dm_session = dm_session_repo.upsert(session, "discord", user_id_str, new_uuid)
          session.commit()
        session_boundary = dm_session.started_at

Step 2: gate = gate_registry.get_or_create(message.channel.id) if gate_registry else None
        cancel_event = gate.cancel_event if gate else None

Step 3 (_execute_dm):
  a. raw_history = await history_mod.collect_dm_messages(channel, after=session_boundary, limit=50)
     On error: log warning, raw_history = []
  b. preprocessing_result = await preprocess_message(message, raw_history)
     (same preprocessing as thread flow)
  c. If errors: await message.reply(error_message) → return
  d. message_history = [converters.discord_message_to_core(msg, content_override=enriched)]
  e. current_content = reply_context_prefix + preprocessing_result.current_content
  f. routing_decision = RoutingDecision(is_routed=False, target_channel_id=None,
                                         suppress_typing=False, suppress_status=False)
  g. async with conditional_typing(channel, suppress=False):
       status_state, status_msg = await send_initial_status(channel, cancel_event, author_id)
       result = await execute_message(
           message_content=current_content,
           conversation_id=str(channel.id),
           user_id=user_id_str,
           channel_id=str(channel.id),
           ...
           conversation_type=ConversationType.DIRECT_MESSAGE,
       )
       chunks = chunk_message(result.response_text)
       for chunk in chunks: await channel.send(chunk)
       await delete_status(status_msg)

Step 4: Gate:
  If gate: await gate.run_or_skip(_execute_dm)
           If None: log "Message coalesced" → return
  Else: await _execute_dm()
```

### DM Session Boundary

`session_boundary = dm_session.started_at` — only messages AFTER this timestamp are included in history. This creates conversation context isolation. `/new` command resets `started_at` to `now()`.

---

## 18. Slash Commands (Verified from Source)

### AuthCog — `/connect` (guild + DM)

**Source:** `src_v2/entrypoints/discord/cogs/auth.py`

| Subcommand | Description | Available In |
|------------|-------------|--------------|
| `/connect` (no platform) | Account linking — sends signed token DM link | Guild |
| `/connect toggl` | Opens TokenModal for Toggl API key | Guild |
| `/connect github` | Sends OAuth link (signed token) | Guild |

**Flow for `/connect` (account linking):**
1. Check `user_identity_discord WHERE discord_id = ?`
2. If already linked: reply "Your account is already linked!"
3. Create signed token: `create_signed_token(discord_id, signing_key)` (HMAC-SHA256, 15 min expiry)
4. Construct signup URL: `{web_base_url}/auth/signup?token={token}`
5. DM the user the signup link
6. Reply ephemeral "Check your DMs!"

**Flow for `/connect toggl`:**
1. Check if user identity exists (must link account first)
2. Show `TokenModal(title="Connect Toggl")`
3. On modal submit: validate token via `get_me(token_value)` → Toggl API
4. If 401/403: "Invalid API token"
5. Fetch workspace role via `get_workspace_members()`
6. Store in Vault: `vault_repo.create_secret(session, name=f"toggl-{user_id}", secret=token_value)`
7. Store metadata: `user_credentials_repo.upsert_credential(session, user_id, "toggl", vault_secret_id, metadata)`
8. Reply "Toggl connected as {fullname}!"

**Flow for `/connect github`:**
1. Check user identity exists
2. Create signed token
3. Construct OAuth URL: `{web_base_url}/auth/oauth/github?token={token}`
4. Reply ephemeral with the URL

### AdminCog — `/impersonate` (guild only)

**Source:** `src_v2/entrypoints/discord/cogs/admin.py`

| Subcommand | Description |
|------------|-------------|
| `/impersonate user @target` | Start impersonating a target user |
| `/impersonate stop` | Stop impersonating |
| `/impersonate status` | Check current impersonation status |

**Preconditions for `/impersonate user`:**
1. Caller must have `user_identity_discord` record
2. Caller must have `user_profile.is_admin = true`
3. Target must have `user_identity_discord` record
4. Cannot impersonate self

**DB operation:** `impersonation_repo.upsert_session(session, admin_user_id=..., target_user_id=...)`

**How impersonation affects messages:** In `execute_with_routing`, after `execute_message()` returns, if `result.impersonating_user_id is not None`, the response is prefixed with `[as: {display_name}]`.

### DmCog — `/new` (DM only)

**Source:** `src_v2/entrypoints/discord/cogs/dm.py`

```python
@app_commands.command(name="new", description="Start a new DM conversation")
@app_commands.allowed_contexts(guilds=False, dms=True, private_channels=False)
async def new_conversation(self, interaction: discord.Interaction)
```

- Resets DM session: `dm_session_repo.upsert(session, "discord", user_id_str, new_uuid4)`
- This updates `started_at = now()` so subsequent history collection only gets new messages
- Reply: Discord Embed with title "New Conversation", description "Previous conversation cleared. Starting fresh.", color green

### ScheduleCog — `/schedule` (guild only)

**Source:** `src_v2/entrypoints/discord/cogs/schedule.py` (read separately if needed)

Used for creating/managing recurring scheduled tasks that execute prompts on a cron schedule.

---

## 19. Status Embed System (Verified from Source)

**Source:** `src_v2/entrypoints/discord/status_embed.py`

The status embed is a Discord embed that shows real-time progress during Claude execution. It is sent as a separate message in the thread/channel, updated as tools execute, then deleted when the response is sent.

### Lifecycle

```
send_initial_status(channel, cancel_event, author_id)
  → Sends embed with empty events list + CancelView button (if cancel_event set)
  → Returns (StatusState, discord.Message)

update_status_with_event(state, message, icon, text)
  → Adds event to state
  → Edits embed message with new event list
  → Returns new state

delete_status(message)
  → Deletes the status embed message

finalize_status_error(state, message, error_text)
  → Adds "🚫 Error: {error_text[:40]}" event
  → Edits embed with red color (COLOR_ERROR)
```

### CancelView Button

```python
class CancelView(View):
    cancel_button = Button(label="Cancel", style=secondary, emoji="❌")
```

- Button only works for the original message author (`interaction.user.id != self.author_id` → reply "Only the message author can cancel")
- On click: `cancel_event.set()` + `cancel_button.disabled = True` + edit message
- `cancel_event` is an `asyncio.Event` that the Claude Agent SDK checks during tool execution

### Embed Colors

```python
COLOR_IN_PROGRESS = ...  # Blue/blurple — defined in src_v2/core/discord/status.py
COLOR_ERROR = ...        # Red — defined in src_v2/core/discord/status.py
```

---

## 20. Message History Collection (Verified from Source)

**Source:** `src_v2/entrypoints/discord/message_history.py`

### Message Types (Included vs Skipped)

**Included:**
- `discord.MessageType.default` — Normal user messages
- `discord.MessageType.reply` — Reply messages
- `discord.MessageType.thread_starter_message` — Thread opener (type 21)

**Skipped:**
- All other types: pins, joins, boosts, thread creation notices, etc.

### Functions

**`collect_raw_thread_messages(thread, limit=50) → list[discord.Message]`**
- Fetches via `thread.history(limit=50, oldest_first=True)`
- Filters skipped types
- Used for thread message history (preprocessing flow)

**`collect_dm_messages(channel, after=datetime, limit=50) → list[discord.Message]`**
- Fetches via `channel.history(limit=50, after=after, oldest_first=True)`
- The `after` parameter is the DM session boundary (`dm_session.started_at`)
- Used for DM message history

### Thread Starter Message Quirk

Discord thread starter messages (type 21) have empty `.content`. The actual text is in `.reference.resolved.content`. `converters.discord_message_to_core()` handles this:

```python
if (discord_msg.type == discord.MessageType.thread_starter_message
    and discord_msg.reference
    and isinstance(discord_msg.reference.resolved, discord.Message)):
    resolved = discord_msg.reference.resolved
    return Message(
        author_id=str(resolved.author.id),
        author_name=resolved.author.name,
        content=content_override or resolved.content,
        ...
    )
```

---

## 21. Execution Service (Verified from Source)

**Source:** `src_v2/services/execution.py` — `execute_message()` function

```python
async def execute_message(
    message_content: str,
    conversation_id: str,
    user_id: str,
    channel_id: str,
    routing_decision: RoutingDecision,
    registry: ToolRegistry,
    session_factory: Callable[[], Session],
    langfuse_client: Langfuse,
    project_root: Path,
    message_history: list[Message] | None = None,
    on_tool_start: OnToolStart | None = None,
    on_tool_end: OnToolEnd | None = None,
    on_text: OnText | None = None,
    conversation_type: ConversationType | None = None,
    cancel_event: asyncio.Event | None = None,
    prompt_variant: PromptVariant | None = None,
) -> ExecutionResult
```

### Execution Pipeline

```
1. resolve_user_context(session, discord_id=user_id)
   → Looks up user identity, credentials, impersonation state
   → Returns UserContext (with impersonating_user_id if admin session active)

2. extract_platforms_from_message(message_content)
   → Keyword extraction from message text
   → Returns set of platform slugs (e.g., {"toggl", "github"})

3. all_tools = registry.list_tools()
   selected_slugs = filter_tools_by_platforms(all_tools, platforms)
   → Filters tool list to relevant tools based on message keywords

4. Load active Decision Hub skills for this conversation:
   active_skills = load_conversation_skills(session, conversation_id=conversation_id)
   For each skill: download zip, extract body, format skill prompt
   skill_bodies: list[str]

5. Select system prompt:
   If prompt_variant explicitly set: use that
   Else: PromptVariant.ROUTED_CLIENT if routing_decision.is_routed else PromptVariant.BASE
   system_prompt = select_prompt(PromptSelectionContext(variant=variant), skill_bodies=skill_bodies)

6. sdk_tool_config = create_sdk_tools(registry, user_context)
   → Creates Claude Agent SDK tool config with registry dispatch + user context injection

7. langfuse_context = LangfuseContext(conversation_type, channel_id, user_id, conversation_id)

8. agent_result = await run_claude_agent(
       message_content, session_uuid, system_prompt,
       langfuse_client, sdk_tool_config, project_root,
       message_history, on_tool_start, on_tool_end, on_text,
       langfuse_context, cancel_event
   )

9. Return ExecutionResult(
       response_text=agent_result.final_text,
       tool_slugs_used=selected_slugs,
       session_uuid=session_uuid,
       impersonating_user_id=user_context.impersonating_user_id,
   )
```

### ExecutionResult

```python
@dataclass
class ExecutionResult:
    response_text: str                          # Claude's final text response
    tool_slugs_used: list[str]                  # Tools that were selected (NOT necessarily called)
    session_uuid: str                           # UUID for this execution session
    impersonating_user_id: uuid.UUID | None = None  # Set if admin is impersonating
```

---

## 22. Message Coalescing (GateRegistry, Verified from Source)

**Source:** `src_v2/services/gate_registry.py`

`GateRegistry` prevents concurrent execution of multiple messages in the same conversation thread. Only one execution runs at a time per conversation; new incoming messages while execution is running are "coalesced" (skipped).

### Eviction

- `max_idle_seconds = 1800` (30 minutes) — gates evicted after 30 minutes of no activity
- Eviction checked every 100 accesses (`eviction_interval = 100`)

### When Gates Are Created

- **Existing threads:** Gate is created on first message, reused for all subsequent messages
- **New threads:** No gate needed (single initial message, no contention)
- **DM channels:** Gate created on first message to channel

### Gate Behavior

`gate.run_or_skip(coro)`:
- If no execution running: run `coro`, return result
- If execution running: coalesce (skip), return `None`
- Caller checks for `None` and logs "Message coalesced for thread {id}"

---

## 23. Preprocessor — Mention Resolution (Verified from Source)

**Source:** `src_v2/entrypoints/discord/preprocessing.py`

### Mention Patterns

```python
_MENTION_PATTERNS = [
    (MentionType.CHANNEL, re.compile(r"<#(\d+)>")),
    (MentionType.USER, re.compile(r"<@(\d+)>")),
    (MentionType.ROLE, re.compile(r"<@&(\d+)>")),
]
```

### Resolution

| Mention Type | Resolution Method |
|-------------|------------------|
| CHANNEL | `guild.get_channel(id)` → `guild.fetch_channel(id)` if not cached |
| USER | `guild.get_member(id)` → `guild.fetch_member(id)` if not cached |
| ROLE | `guild.get_role(id)` — no fetch; NOT_FOUND if not in cache |

### XML Replacement Format

```
<#123> → <channel id="123" name="general"/>
<@456> → <user id="456" name="Alice"/>
<@&789> → <role id="789" name="Team Members"/>
```

### Error Types

| Reason | Error Message |
|--------|--------------|
| `NOT_FOUND` | "doesn't exist {raw_token}" |
| `FORBIDDEN` | "I don't have access to {raw_token}" |
| `TRANSIENT` | "Something went wrong resolving {raw_token}" |

If any errors occur, preprocessing returns them and `execute_with_routing` sends `message.reply(error_message)` without calling Claude.

### Reply Context

```python
@dataclass(frozen=True)
class ReplyContext:
    author_name: str
    author_id: str
    timestamp: datetime
    message_url: str
```

Prepended to message as:
```xml
<reply-context author="Alice" author-id="456" timestamp="2026-03-13T10:00:00+00:00" url="https://discord.com/channels/..."/>
```

Resolution order for referenced message: `ref.resolved` → `ref.cached_message` → `channel.fetch_message(message_id)`. Returns `None` for non-reply messages and deleted references.

---

## 24. Scheduler Loop (Verified from Source)

**Source:** `src_v2/entrypoints/discord/scheduler_loop.py`

### Poll Loop

```python
POLL_INTERVAL_SECONDS = 60

async def scheduler_loop(bot, session_factory, execute_fn):
    while True:
        try:
            with session_factory() as session:
                due_tasks = scheduled_task_repo.load_due_tasks(session)
            for task in due_tasks:
                try:
                    success = await execute_scheduled_task(task=task, bot=bot, execute_fn=execute_fn)
                    if success:
                        next_run = compute_and_advance_next_run(task)
                        scheduled_task_repo.update_next_run(session, task_id=task.id, next_run=next_run)
                except Exception: logger.exception(...)
        except Exception: logger.exception(...)
        await asyncio.sleep(POLL_INTERVAL_SECONDS)
```

### Task Execution

```python
async def execute_scheduled_task(task, bot, execute_fn):
    result = await execute_fn(task.prompt)
    await _send_scheduled_dm(bot, user_id=task.user_discord_id, task=task, response_text=result.response_text)
    return True
```

`execute_fn` is a wrapper that calls `execute_message()` with:
- `message_content = task.prompt`
- `conversation_id = "scheduled"`
- `user_id = "system"`
- `channel_id = "scheduled"`
- `routing_decision = RoutingDecision.no_routing()`
- `conversation_type = ConversationType.GROUP`
- `prompt_variant = PromptVariant.SCHEDULED_TASK`

### DM Delivery

Uses Discord Components v2 `LayoutView`:

```
Container (blurple accent):
  TextDisplay: "**{title}** · {schedule} · <t:{timestamp}:R>"
Container (spoiler=True):
  TextDisplay: {output_text}  (truncated at 3950 chars)
```

Sent as `silent=True` DM to `task.user_discord_id`.

Output truncated at `_OUTPUT_CHAR_LIMIT = 3950` chars with suffix `"\n\n⚠️ Output truncated (too long for one message)."`.

---

## 25. Web Entrypoint (Verified from Source)

**Source:** `src_v2/entrypoints/web/main.py`, `src_v2/entrypoints/web/routes/`

The bot also exposes a minimal FastAPI application for:
1. OAuth callbacks (GitHub)
2. Auth token validation

**Routes found:**
- `src_v2/entrypoints/web/routes/auth.py` — auth endpoints
- `src_v2/entrypoints/web/routes/github_oauth.py` — GitHub OAuth callback

This is the existing single-tenant web server; in the multi-tenant SaaS, these flows move to the Next.js website. The bot's FastAPI web entrypoint will be simplified or removed.

---

## 26. Updated Cross-References

- Discord intents → `multi-tenant/connection-manager.md` (each tenant needs separate intents/bot)
- Slash commands in multi-tenant → `multi-tenant/adaptation-plan.md` (commands registered per-tenant bot)
- Status embed system → `frontend/component-library.md` (no equivalent in web UI, but informs UX)
- `execute_message()` → `multi-tenant/byok-key-routing.md` (Anthropic key injection point)
- `execute_message()` → `multi-tenant/tenant-scoping.md` (UserContext scoping per tenant)
- `GateRegistry` → `multi-tenant/adaptation-plan.md` (per-tenant gate registries in multi-tenant)
- `scheduler_loop` → `multi-tenant/adaptation-plan.md` (per-tenant schedulers needed)
- `archive_sync_loop` → `multi-tenant/adaptation-plan.md` (single shared loop or per-tenant?)
- `AuthCog (/connect)` → `frontend/integrations-page.md` (web replaces Discord OAuth flow)
- Signed token format → `source/existing-auth.md` (HMAC-SHA256, 15 min expiry)
