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
