# Multi-Tenant Connection Manager

**Aspect:** 2.1 — Multi-token Discord connection lifecycle
**Wave:** Wave 2 — Multi-Tenant Adaptation
**Written:** 2026-03-13
**References:**
- [source/existing-bot-architecture.md](../source/existing-bot-architecture.md) — Single-tenant startup + ToolContext
- [source/existing-auth.md](../source/existing-auth.md) — Credential model
- [database/schema.md](../database/schema.md) — `discord_connections`, `tenant_api_keys`, `tenants`

---

## 1. Current Single-Tenant Behavior

### 1.1 How the Bot Connects Today

The current Decision Orchestrator bot is a **single-tenant process**. It:

1. Reads one `DISCORD_BOT_TOKEN` + `DISCORD_GUILD_ID` from environment variables at startup.
2. Constructs one `ToolContext` frozen dataclass containing those values.
3. Creates one `discord.Client` with `intents` configured.
4. Calls `discord_client.run(tool_context.discord_token)` — this is **blocking**. The Python process lives entirely inside this call.
5. All `on_message` events are handled within this single client.

**Source files (single-tenant):**
- `apps/bot/src_v2/entrypoints/discord/main.py` — entry point, calls `discord_client.run()`
- `apps/bot/src_v2/entrypoints/discord/bot.py` — `on_message` handler registration
- `apps/bot/src_v2/bootstrap/config.py` — `ToolContext` construction from env vars

### 1.2 Why This Cannot Scale to Multi-Tenant

| Problem | Explanation |
|---------|-------------|
| One token hardcoded | `discord_client.run(token)` is a single static token per process |
| Blocking call | `discord_client.run()` blocks the main thread; no way to add/remove tenants at runtime |
| ToolContext is frozen per-process | `ToolContext.anthropic_api_key` is one value; all messages use same key |
| No tenant isolation in message handler | `on_message` has no concept of which tenant a message belongs to |
| No lifecycle management | No connect/disconnect per-tenant; process = connection |

---

## 2. Multi-Tenant Architecture: Connection Pool

### 2.1 Design Principle

Replace the single blocking `discord.Client` with a **pool of async Discord clients** — one per active tenant. Each client:
- Runs in its own async task (not a thread)
- Has its own `ToolContext` with the tenant's `discord_token` and `anthropic_api_key`
- Is identified by `tenant_id`
- Knows its `guild_id` to scope all DB operations

The pool is managed by a `TenantConnectionManager` class that:
- Starts connections for all active tenants at bot startup
- Adds new connections when a tenant is provisioned (via Supabase Realtime)
- Removes connections when a tenant disconnects or is suspended
- Reconnects on failure with exponential backoff
- Writes heartbeats and status updates to `discord_connections`

### 2.2 Startup Flow (Multi-Tenant)

```
Bot process starts on Fly.io
  ↓
Load system-level env vars (Supabase URL, service role key, Fly API token, etc.)
  ↓
Create TenantConnectionManager(supabase_client, db_session_factory)
  ↓
Query: SELECT * FROM discord_connections
       JOIN tenant_api_keys ON tenant_id
       JOIN tenants ON tenant_id
       WHERE discord_connections.status IN ('disconnected', 'connected', 'error')
         AND tenants.status = 'active'
  ↓
For each row: manager.add_tenant(tenant_config)
  ↓
Subscribe to Supabase Realtime channel 'tenant-lifecycle'
  (listens for INSERT/UPDATE on discord_connections)
  ↓
Start FastAPI health server (port 8080)
  ↓
Await all tasks forever (asyncio.gather(*all_tenant_tasks))
```

### 2.3 Per-Tenant Connection Startup

For each tenant, the following sequence executes in an **asyncio Task**:

```
manager.add_tenant(tenant_config: TenantConfig)
  ↓
Decrypt discord_token:
  SELECT decrypted_secret FROM vault.decrypted_secrets
  WHERE id = discord_connections.vault_secret_id
  ↓
Decrypt anthropic_api_key:
  SELECT decrypted_secret FROM vault.decrypted_secrets
  WHERE id = tenant_api_keys.vault_secret_id
  WHERE tenant_api_keys.provider = 'anthropic'
  AND   tenant_api_keys.tenant_id = :tenant_id
  ↓
Construct TenantToolContext(
    tenant_id=tenant_id,
    discord_token=decrypted_token,
    discord_guild_id=guild_id,
    anthropic_api_key=decrypted_anthropic_key,
    # System-level fields from env vars:
    fly_api_token=PLATFORM_FLY_API_TOKEN,
    fly_org_slug=PLATFORM_FLY_ORG_SLUG,
    onyx_api_key=PLATFORM_ONYX_API_KEY,
    onyx_base_url=PLATFORM_ONYX_BASE_URL,
    toggl_workspace_id=PLATFORM_TOGGL_WORKSPACE_ID,
    toggl_organization_id=PLATFORM_TOGGL_ORGANIZATION_ID,
    supabase_url=PLATFORM_SUPABASE_URL,
    supabase_service_role_key=PLATFORM_SUPABASE_SERVICE_ROLE_KEY,
    linkedin_community_token=PLATFORM_LINKEDIN_COMMUNITY_TOKEN,
    linkedin_ads_token=PLATFORM_LINKEDIN_ADS_TOKEN,
    linkedin_org_id=PLATFORM_LINKEDIN_ORG_ID,
    linear_api_key="",        # Per-tenant, loaded from tenant_service_connections at runtime
    linear_team_id="",        # Per-tenant
    ga_service_account_json="", # System-level or per-tenant future
    ga_property_id="",
    dub_api_key=PLATFORM_DUB_API_KEY,
)
  ↓
Update discord_connections SET status='connecting', updated_at=now()
WHERE tenant_id = :tenant_id
  ↓
Create discord.Client(intents=INTENTS)
  ↓
Register on_message handler with tenant_id and TenantToolContext bound
  ↓
asyncio.create_task(
    tenant_client_runner(client, token, tenant_id)
)
  ↓
Store task handle in manager._tasks[tenant_id]
```

---

## 3. TenantConnectionManager Class

### 3.1 Data Structures

```python
# apps/bot/src_v2/entrypoints/discord/tenant_connection_manager.py

@dataclass
class TenantConfig:
    """
    Loaded from Supabase at startup or on Realtime INSERT event.
    Contains everything needed to start one tenant's connection.
    """
    tenant_id: uuid.UUID
    guild_id: str
    discord_token_vault_id: uuid.UUID       # vault.secrets.id for the bot token
    anthropic_key_vault_id: uuid.UUID       # vault.secrets.id for the Anthropic key
    discord_connection_id: uuid.UUID        # discord_connections.id (for heartbeat writes)

@dataclass
class ActiveTenant:
    """
    Runtime state for one connected tenant.
    """
    tenant_id: uuid.UUID
    config: TenantConfig
    client: discord.Client
    task: asyncio.Task
    started_at: datetime
    reconnect_count: int = 0
    last_heartbeat: datetime | None = None
```

### 3.2 Class Interface

```python
class TenantConnectionManager:
    """
    Manages the lifecycle of N Discord bot connections, one per active tenant.

    Responsibilities:
    - Start/stop/restart individual tenant connections
    - Subscribe to Supabase Realtime for dynamic tenant events
    - Write heartbeats and status updates to discord_connections
    - Expose health summary for the FastAPI health endpoint
    """

    def __init__(
        self,
        supabase: Client,                    # Supabase service role client
        session_factory: Callable[[], Session],  # SQLAlchemy session factory
        system_env: SystemEnv,               # Frozen dataclass of platform env vars
    ) -> None:
        self._supabase = supabase
        self._session_factory = session_factory
        self._system_env = system_env
        self._tenants: dict[uuid.UUID, ActiveTenant] = {}  # tenant_id → ActiveTenant
        self._lock = asyncio.Lock()           # Prevent concurrent add/remove races

    async def start_all(self) -> None:
        """Load all active tenants from DB and start connections. Called at startup."""

    async def stop_all(self) -> None:
        """Gracefully disconnect all tenants. Called on SIGTERM."""

    async def add_tenant(self, config: TenantConfig) -> None:
        """Start connection for one tenant. Idempotent — no-op if already connected."""

    async def remove_tenant(self, tenant_id: uuid.UUID, reason: str) -> None:
        """
        Disconnect one tenant. Updates status to 'disconnected'.
        reason: human-readable string written to discord_connections.error_message
        """

    async def reconnect_tenant(self, tenant_id: uuid.UUID) -> None:
        """
        Remove + re-add a tenant. Used after token update or error recovery.
        Called from Realtime event handler when discord_connections row is updated.
        """

    def get_status(self) -> dict[str, Any]:
        """Return health summary for /health endpoint."""

    async def _write_status(
        self,
        connection_id: uuid.UUID,
        status: str,
        error_message: str | None = None,
        bot_user_id: str | None = None,
        bot_username: str | None = None,
    ) -> None:
        """
        Update discord_connections row with current status.
        Called after connect, disconnect, error, and heartbeat events.
        """

    async def _heartbeat_loop(self, tenant_id: uuid.UUID, connection_id: uuid.UUID) -> None:
        """
        Background coroutine: write last_heartbeat to discord_connections every 30 seconds.
        Runs as a sibling task to the Discord client's event loop.
        Cancels when the tenant's main client task completes.
        """
```

---

## 4. Per-Tenant Discord Client Task

### 4.1 Task Structure

Each tenant runs two sibling asyncio tasks:
1. **`discord_client_runner`** — runs the Discord WebSocket connection
2. **`heartbeat_writer`** — writes `last_heartbeat` to DB every 30 seconds

Both are wrapped in a **supervisor task** that handles reconnection.

### 4.2 Supervisor Task (Python pseudocode)

```python
async def tenant_supervisor(
    manager: TenantConnectionManager,
    config: TenantConfig,
    tool_context: TenantToolContext,
    max_reconnects: int = 10,
    base_delay: float = 5.0,    # seconds
    max_delay: float = 300.0,   # 5 minutes
) -> None:
    """
    Supervises one tenant's Discord connection.
    Reconnects on failure with exponential backoff.
    Stops after max_reconnects failures without a successful heartbeat.
    Marks tenant as 'error' after max_reconnects exceeded.
    """
    reconnect_count = 0

    while reconnect_count <= max_reconnects:
        try:
            client = discord.Client(intents=_make_intents())
            _register_handlers(client, manager, config, tool_context)

            # Inform DB: connecting
            await manager._write_status(
                config.discord_connection_id,
                status="connecting",
            )

            # Start heartbeat as background task
            heartbeat_task = asyncio.create_task(
                manager._heartbeat_loop(config.tenant_id, config.discord_connection_id)
            )

            # Run Discord client — this runs until disconnect or exception
            await client.start(tool_context.discord_token)

            # If we reach here, client disconnected cleanly (logout called)
            heartbeat_task.cancel()
            await manager._write_status(config.discord_connection_id, status="disconnected")
            return  # Clean exit — don't reconnect

        except discord.LoginFailure as e:
            # Token is invalid — do not retry
            heartbeat_task.cancel()
            await manager._write_status(
                config.discord_connection_id,
                status="error",
                error_message=f"Invalid bot token: {str(e)}. Update your bot token in Settings.",
            )
            return  # Non-retriable

        except discord.PrivilegedIntentsRequired as e:
            # Bot doesn't have required intents in Discord Developer Portal
            heartbeat_task.cancel()
            await manager._write_status(
                config.discord_connection_id,
                status="error",
                error_message=(
                    "Bot is missing required intents. "
                    "In Discord Developer Portal → Your Bot → Privileged Gateway Intents, "
                    "enable: MESSAGE CONTENT INTENT, SERVER MEMBERS INTENT."
                ),
            )
            return  # Non-retriable until user fixes their bot settings

        except Exception as e:
            # Transient error — retry with backoff
            heartbeat_task.cancel()
            reconnect_count += 1
            delay = min(base_delay * (2 ** reconnect_count), max_delay)

            if reconnect_count > max_reconnects:
                await manager._write_status(
                    config.discord_connection_id,
                    status="error",
                    error_message=(
                        f"Connection failed after {max_reconnects} attempts. "
                        f"Last error: {str(e)[:200]}"
                    ),
                )
                return

            await manager._write_status(
                config.discord_connection_id,
                status="connecting",
                error_message=f"Reconnecting (attempt {reconnect_count}/{max_reconnects})...",
            )
            await asyncio.sleep(delay)
```

### 4.3 Discord Intents Configuration

Same intents as single-tenant, applied to each per-tenant client:

```python
def _make_intents() -> discord.Intents:
    intents = discord.Intents.default()
    intents.message_content = True    # Required for reading message content (Privileged)
    intents.guild_messages = True     # Required for guild channel monitoring
    intents.direct_messages = True    # Required for DM sessions
    intents.members = True            # Required for guild member lookup (Privileged)
    return intents
```

**Privileged intents note:** Both `message_content` and `members` are [Privileged Gateway Intents](https://discord.com/developers/docs/topics/gateway#privileged-intents) and must be enabled in each user's Discord Developer Portal for their bot application. If not enabled, `discord.PrivilegedIntentsRequired` is raised. The error message above guides the user to fix this.

---

## 5. On-Connect Handler: Resolve Bot Identity

When a tenant's Discord client fires `on_ready`, the bot resolves its own identity from the Discord API and writes it to `discord_connections`:

```python
async def on_ready_for_tenant(
    client: discord.Client,
    manager: TenantConnectionManager,
    config: TenantConfig,
) -> None:
    """
    Called once when the Discord WebSocket connection is established.
    Resolves bot identity and writes 'connected' status to DB.
    """
    bot_user = client.user
    await manager._write_status(
        config.discord_connection_id,
        status="connected",
        bot_user_id=str(bot_user.id),
        bot_username=f"{bot_user.name}#{bot_user.discriminator}" if bot_user.discriminator != "0"
                    else bot_user.name,
        error_message=None,   # Clear any previous error
    )
```

---

## 6. On-Message Handler: Tenant Scoping

The per-tenant `on_message` handler is identical to the single-tenant handler in logic, but:

1. **Guild ID is checked** — messages from other guilds are silently ignored (defense-in-depth, even though each bot token should only be in one guild)
2. **`tenant_id` is passed** to all DB queries to ensure tenant isolation
3. **`TenantToolContext`** provides the per-tenant Anthropic key

```python
async def on_message_for_tenant(
    message: discord.Message,
    manager: TenantConnectionManager,
    config: TenantConfig,
    tool_context: TenantToolContext,
    db_session_factory: Callable[[], Session],
) -> None:
    """Per-tenant message handler. Bound per-client at registration time."""

    # 1. Ignore bot's own messages
    if message.author.bot:
        return

    # 2. Guild scope check — ensure message is from this tenant's guild
    if message.guild is None or str(message.guild.id) != config.guild_id:
        return  # Silently ignore — wrong guild

    # 3. Mention/DM check
    if not (
        message.guild is None  # DM
        or (message.guild and tool_context.discord_client_user_id in [m.id for m in message.mentions])
    ):
        return  # Not a DM and bot not mentioned

    # 4. Build UserContext (same as single-tenant, but scoped to tenant_id)
    user_context = await _build_user_context(
        message=message,
        tenant_id=config.tenant_id,
        supabase=manager._supabase,
        db_session_factory=db_session_factory,
    )

    # 5. Build agent request and call Claude (same as single-tenant)
    await _handle_message(
        message=message,
        user_context=user_context,
        tool_context=tool_context,
        db_session_factory=db_session_factory,
    )
```

---

## 7. Dynamic Tenant Events via Supabase Realtime

The connection manager subscribes to Supabase Realtime to react to tenant lifecycle changes without restarting the bot process.

### 7.1 Realtime Subscription Setup

```python
async def _subscribe_to_realtime(self, manager: TenantConnectionManager) -> None:
    """
    Subscribe to INSERT and UPDATE events on discord_connections.
    Channel: 'tenant-lifecycle'
    Filter: tenant status changes (connect, disconnect, token update)
    """
    channel = manager._supabase.channel("tenant-lifecycle")

    channel.on(
        "postgres_changes",
        event="INSERT",
        schema="public",
        table="discord_connections",
        callback=lambda payload: asyncio.create_task(
            manager._on_connection_inserted(payload)
        ),
    )

    channel.on(
        "postgres_changes",
        event="UPDATE",
        schema="public",
        table="discord_connections",
        callback=lambda payload: asyncio.create_task(
            manager._on_connection_updated(payload)
        ),
    )

    await channel.subscribe()
```

### 7.2 INSERT Handler — New Tenant Connected

```python
async def _on_connection_inserted(self, payload: dict) -> None:
    """
    Called when a new discord_connections row is INSERTed.
    This happens when a user saves their Discord bot token on the website for the first time.

    Payload shape (Supabase Realtime postgres_changes):
    {
        "schema": "public",
        "table": "discord_connections",
        "commit_timestamp": "...",
        "eventType": "INSERT",
        "new": {
            "id": "uuid",
            "tenant_id": "uuid",
            "guild_id": "1234567890",
            "vault_secret_id": "uuid",
            "status": "disconnected",
            "last_heartbeat": null,
            "error_message": null,
            "created_at": "...",
            "updated_at": "..."
        },
        "old": {}
    }
    """
    new_row = payload["new"]
    tenant_id = uuid.UUID(new_row["tenant_id"])

    # Look up the anthropic key vault ID
    key_row = await self._get_anthropic_key_vault_id(tenant_id)
    if key_row is None:
        # No Anthropic key yet — cannot connect
        # Update status: error = "No Anthropic API key configured"
        await self._write_status(
            uuid.UUID(new_row["id"]),
            status="error",
            error_message="No Anthropic API key configured. Add your key in Settings → API Keys.",
        )
        return

    config = TenantConfig(
        tenant_id=tenant_id,
        guild_id=new_row["guild_id"],
        discord_token_vault_id=uuid.UUID(new_row["vault_secret_id"]),
        anthropic_key_vault_id=uuid.UUID(key_row["vault_secret_id"]),
        discord_connection_id=uuid.UUID(new_row["id"]),
    )
    await self.add_tenant(config)
```

### 7.3 UPDATE Handler — Token Update or Disconnect

```python
async def _on_connection_updated(self, payload: dict) -> None:
    """
    Called when a discord_connections row is UPDATEd.
    This happens when:
    - User updates their bot token (new vault_secret_id)
    - User disconnects (status set to 'disconnected' by website)
    - Admin suspends a tenant

    Payload shape:
    {
        "new": { ... updated row ... },
        "old": { ... previous row ... }
    }
    """
    new_row = payload["new"]
    old_row = payload["old"]
    tenant_id = uuid.UUID(new_row["tenant_id"])

    # Check if tenant is requesting disconnect
    if new_row.get("status") == "disconnected" and old_row.get("status") != "disconnected":
        await self.remove_tenant(tenant_id, reason="Disconnected by user")
        return

    # Check if token was updated (vault_secret_id changed)
    if new_row.get("vault_secret_id") != old_row.get("vault_secret_id"):
        await self.reconnect_tenant(tenant_id)
        return

    # No action needed for other updates (e.g., heartbeat writes, which we wrote ourselves)
```

---

## 8. Heartbeat Loop

The heartbeat loop writes to `discord_connections.last_heartbeat` every 30 seconds while a tenant is connected. It also checks if the bot is actually receiving events by tracking the last `on_message` time.

```python
HEARTBEAT_INTERVAL_SECONDS = 30
STALE_THRESHOLD_SECONDS = 120  # 2 minutes without heartbeat = stale

async def _heartbeat_loop(
    self,
    tenant_id: uuid.UUID,
    connection_id: uuid.UUID,
) -> None:
    """
    Writes last_heartbeat to discord_connections every 30 seconds.
    Runs until cancelled (when the parent client task ends).
    """
    while True:
        try:
            await asyncio.sleep(HEARTBEAT_INTERVAL_SECONDS)

            # Write heartbeat
            self._supabase.table("discord_connections").update({
                "last_heartbeat": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat(),
            }).eq("id", str(connection_id)).execute()

        except asyncio.CancelledError:
            return  # Task was cancelled — parent client is stopping
        except Exception as e:
            # Heartbeat failure is non-fatal — log and continue
            # (If DB is unreachable, the connection is still valid)
            pass  # Log to Langfuse/stderr
```

---

## 9. Stale Connection Detection

The website dashboard shows a tenant's bot status as `stale` if `last_heartbeat` is older than 120 seconds. This is computed in the frontend query, NOT as a DB trigger:

```sql
-- Query used by dashboard to compute effective bot status
SELECT
    dc.*,
    CASE
        WHEN dc.status = 'connected'
             AND dc.last_heartbeat < NOW() - INTERVAL '120 seconds'
        THEN 'stale'
        ELSE dc.status
    END AS effective_status
FROM discord_connections dc
WHERE dc.tenant_id = :tenant_id
```

**Effective status values:**

| `discord_connections.status` | `last_heartbeat` age | `effective_status` shown in dashboard |
|------------------------------|---------------------|--------------------------------------|
| `'connected'` | < 120s | `'connected'` — green dot |
| `'connected'` | ≥ 120s | `'stale'` — yellow dot + "Bot may be unresponsive" |
| `'connecting'` | any | `'connecting'` — spinner |
| `'disconnected'` | any | `'disconnected'` — grey dot |
| `'error'` | any | `'error'` — red dot + `error_message` displayed |

---

## 10. Startup Query (Load All Active Tenants)

```sql
-- Executed by TenantConnectionManager.start_all() at bot startup
SELECT
    dc.id                AS discord_connection_id,
    dc.tenant_id         AS tenant_id,
    dc.guild_id          AS guild_id,
    dc.vault_secret_id   AS discord_token_vault_id,
    tak.vault_secret_id  AS anthropic_key_vault_id
FROM discord_connections dc
JOIN tenants t ON t.id = dc.tenant_id
JOIN tenant_api_keys tak ON tak.tenant_id = dc.tenant_id
    AND tak.provider = 'anthropic'
WHERE t.status = 'active'
  AND dc.status != 'disconnected'   -- Include 'connected', 'connecting', 'error' (will retry)
  AND tak.is_valid = TRUE            -- Only tenants with valid Anthropic keys
ORDER BY dc.created_at ASC;          -- Oldest tenants first (fairness)
```

**Rows returned:** One row per active tenant that has both a Discord connection configured AND a valid Anthropic API key.

**Tenants excluded at startup:**
- `tenants.status = 'suspended'` — suspended accounts
- `discord_connections.status = 'disconnected'` — user explicitly disconnected
- Missing `tenant_api_keys` row with `provider='anthropic'` — BYOK key not set up
- `tenant_api_keys.is_valid = FALSE` — Anthropic key failed last validation

---

## 11. TenantToolContext Dataclass

`TenantToolContext` extends the existing `ToolContext` with the `tenant_id` field:

```python
@dataclass(frozen=True)
class TenantToolContext:
    """
    Per-tenant version of ToolContext.
    Contains:
    - Per-tenant fields: discord_token, discord_guild_id, anthropic_api_key, tenant_id
    - System-level fields: all others (from platform env vars)
    """
    # Per-tenant fields
    tenant_id: uuid.UUID              # NEW: tenant scoping for all DB operations
    discord_token: str                # From discord_connections (Vault decrypt)
    discord_guild_id: str             # From discord_connections.guild_id
    anthropic_api_key: str            # From tenant_api_keys (Vault decrypt)

    # System-level fields (from platform env vars — same for all tenants)
    fly_api_token: str
    fly_org_slug: str
    onyx_api_key: str
    onyx_base_url: str
    toggl_workspace_id: int
    toggl_organization_id: int
    supabase_url: str
    supabase_service_role_key: str
    linkedin_community_token: str
    linkedin_ads_token: str
    linkedin_org_id: str
    ga_service_account_json: str = ""
    ga_property_id: str = ""
    linear_api_key: str = ""          # Per-tenant at runtime via tenant_service_connections
    linear_team_id: str = ""
    dub_api_key: str = ""
```

**Backward compatibility:** `TenantToolContext` is a drop-in replacement for `ToolContext` in all tool handlers. The only new field is `tenant_id`. All existing tool handlers accept `ToolContext` — they can be updated to `TenantToolContext` with no behavior change since the extra field is ignored unless the handler uses it.

---

## 12. SystemEnv Dataclass (Platform-Level Config)

A new frozen dataclass holds the system-level env vars that are shared across all tenants:

```python
@dataclass(frozen=True)
class SystemEnv:
    """
    Platform-level environment variables. Loaded once at startup.
    Shared across all tenants. Never per-tenant.
    """
    supabase_url: str
    supabase_service_role_key: str
    fly_api_token: str
    fly_org_slug: str
    onyx_api_key: str
    onyx_base_url: str
    toggl_workspace_id: int
    toggl_organization_id: int
    linkedin_community_token: str
    linkedin_ads_token: str
    linkedin_org_id: str
    langfuse_secret_key: str
    langfuse_public_key: str
    langfuse_host: str = "https://cloud.langfuse.com"
    ga_service_account_json: str = ""
    ga_property_id: str = ""
    linear_team_id: str = ""
    dub_api_key: str = ""

    @classmethod
    def from_env(cls) -> "SystemEnv":
        """Construct from os.environ. Raises KeyError for missing required vars."""
        return cls(
            supabase_url=os.environ["SUPABASE_URL"],
            supabase_service_role_key=os.environ["SUPABASE_SERVICE_ROLE_KEY"],
            fly_api_token=os.environ["FLY_API_TOKEN"],
            fly_org_slug=os.environ["FLY_ORG_SLUG"],
            onyx_api_key=os.environ["ONYX_API_KEY"],
            onyx_base_url=os.environ["ONYX_BASE_URL"],
            toggl_workspace_id=int(os.environ["TOGGL_WORKSPACE_ID"]),
            toggl_organization_id=int(os.environ["TOGGL_ORGANIZATION_ID"]),
            linkedin_community_token=os.environ["LINKEDIN_COMMUNITY_TOKEN"],
            linkedin_ads_token=os.environ["LINKEDIN_ADS_TOKEN"],
            linkedin_org_id=os.environ["LINKEDIN_ORG_ID"],
            langfuse_secret_key=os.environ["LANGFUSE_SECRET_KEY"],
            langfuse_public_key=os.environ["LANGFUSE_PUBLIC_KEY"],
            langfuse_host=os.environ.get("LANGFUSE_HOST", "https://cloud.langfuse.com"),
            ga_service_account_json=os.environ.get("GA_SERVICE_ACCOUNT_JSON", ""),
            ga_property_id=os.environ.get("GA_PROPERTY_ID", ""),
            linear_team_id=os.environ.get("LINEAR_TEAM_ID", ""),
            dub_api_key=os.environ.get("DUB_API_KEY", ""),
        )
```

---

## 13. Multi-Tenant Main Entry Point

The new `entrypoints/discord/main.py` replaces the single-tenant blocking `discord.run()`:

```python
# apps/bot/src_v2/entrypoints/discord/main.py (multi-tenant version)

import asyncio
from apps.bot.src_v2.bootstrap.config import SystemEnv
from apps.bot.src_v2.entrypoints.discord.tenant_connection_manager import TenantConnectionManager
from apps.bot.src_v2.entrypoints.discord.health_server import start_health_server

async def main() -> None:
    # 1. Load system env
    system_env = SystemEnv.from_env()

    # 2. Create Supabase service role client
    supabase = create_client(system_env.supabase_url, system_env.supabase_service_role_key)

    # 3. Create SQLAlchemy session factory
    engine = create_engine(
        build_db_url(system_env),
        pool_size=10,          # One connection per tenant + buffer
        max_overflow=20,
        pool_pre_ping=True,
    )
    session_factory = sessionmaker(bind=engine)

    # 4. Create and start tenant manager
    manager = TenantConnectionManager(supabase, session_factory, system_env)
    await manager.start_all()           # Start all active tenants
    await manager._subscribe_to_realtime()  # Watch for new tenants

    # 5. Start FastAPI health server
    await start_health_server(manager, port=8080)

    # 6. Run forever
    await asyncio.Event().wait()

if __name__ == "__main__":
    asyncio.run(main())
```

---

## 14. Error Scenarios and Responses

| Scenario | What Happens | Status Written to DB | User-Visible Message |
|----------|-------------|---------------------|----------------------|
| Invalid bot token (`discord.LoginFailure`) | Supervisor exits; no retry | `error` | "Invalid bot token: {error}. Update your bot token in Settings." |
| Missing privileged intents (`discord.PrivilegedIntentsRequired`) | Supervisor exits; no retry | `error` | "Bot is missing required intents. In Discord Developer Portal → Your Bot → Privileged Gateway Intents, enable: MESSAGE CONTENT INTENT, SERVER MEMBERS INTENT." |
| WebSocket disconnect (transient) | Supervisor retries with exponential backoff (5s, 10s, 20s, ..., 300s max) | `connecting` during retry | "Reconnecting (attempt N/10)..." |
| Max retries exceeded | Supervisor exits | `error` | "Connection failed after 10 attempts. Last error: {error[:200]}" |
| No Anthropic API key for tenant | Skip tenant at startup / on INSERT event | `error` | "No Anthropic API key configured. Add your key in Settings → API Keys." |
| Vault decrypt failure | Skip tenant at startup | `error` | "Failed to decrypt credentials. Contact support at support@daimon.ai." |
| Guild not found (bot not in guild) | Supervisor exits after `on_ready` check | `error` | "Bot is not in the configured guild. Invite your bot to your Discord server and try again." |
| Anthropic key invalid (403 from Anthropic) | Tool handler raises error on first use; heartbeat continues | No status change | Tool response: "Your Anthropic API key is invalid or expired. Update it in Settings → API Keys." |
| Supabase unreachable (heartbeat fails) | Heartbeat failure logged; connection continues | No status change (last heartbeat goes stale) | Dashboard shows 'stale' status after 120s |
| Bot kicked from guild mid-session | `on_guild_remove` event fires; supervisor exits cleanly | `disconnected` | "Bot was removed from your Discord server. Re-invite the bot and reconnect in Settings." |

---

## 15. Concurrency Limits

| Resource | Limit | Rationale |
|---------|-------|-----------|
| Concurrent tenant connections | 500 | Discord rate limits WebSocket connections per IP; one Fly.io machine can handle 500+ asyncio clients |
| Asyncio tasks per tenant | 2 (client runner + heartbeat writer) | Supervisor is the parent task; sibling tasks are lightweight |
| SQLAlchemy pool_size | 10 + overflow 20 = 30 max | At 500 tenants, per-message DB connections are short-lived (< 100ms); pool does not need to match tenant count |
| Vault decrypt calls per second | ~500 (at startup when all tenants start) | Supabase Vault can handle this; startup staggered by 50ms per tenant if > 100 tenants |
| Realtime channel subscriptions | 1 per bot process | All tenant events flow through one channel |

---

## 16. Startup Staggering (> 100 Tenants)

To prevent thundering herd on startup (all tenants connecting to Discord and Supabase simultaneously):

```python
STARTUP_STAGGER_MS = 50  # 50ms between each tenant start

async def start_all(self) -> None:
    configs = await self._load_active_configs()
    for i, config in enumerate(configs):
        await self.add_tenant(config)
        if i > 0 and i % 10 == 0:
            await asyncio.sleep(STARTUP_STAGGER_MS / 1000)
```

This means 500 tenants start in ~2.5 seconds (50ms × 50 groups of 10).

---

## 17. Graceful Shutdown (SIGTERM)

```python
import signal

def _handle_sigterm(loop: asyncio.AbstractEventLoop, manager: TenantConnectionManager) -> None:
    """Called when Fly.io sends SIGTERM before killing the machine."""
    async def shutdown():
        await manager.stop_all()      # Disconnect all tenants gracefully
        loop.stop()
    loop.create_task(shutdown())
```

`manager.stop_all()` iterates all `_tenants`, calls `client.close()` on each Discord client, and cancels the supervisor + heartbeat tasks. Each tenant's status is NOT updated to 'disconnected' on SIGTERM — the bot is just stopping, not the tenant disconnecting intentionally. The status stays as 'connected' so the bot will reconnect on next startup.

**Exception:** If the machine is being decommissioned (not just restarted), the orchestrator writes `status='disconnected'` for all tenants via an admin API call before sending SIGTERM.

---

## 18. File Structure (New Files)

```
apps/bot/src_v2/entrypoints/discord/
├── main.py                           # REPLACED — new async multi-tenant entry point
├── tenant_connection_manager.py      # NEW — TenantConnectionManager class
├── health_server.py                  # NEW — FastAPI health server (async)
└── bot.py                            # MODIFIED — on_message_for_tenant() added

apps/bot/src_v2/bootstrap/
├── config.py                         # MODIFIED — add SystemEnv, TenantToolContext
└── tenant_config.py                  # NEW — TenantConfig dataclass
```

---

## 19. Cross-References

- **Database tables:** `discord_connections`, `tenants`, `tenant_api_keys` — see [../database/schema.md](../database/schema.md)
- **BYOK key loading:** How `anthropic_api_key` is resolved per tenant — see [byok-key-routing.md](byok-key-routing.md)
- **Realtime contract:** Channel config, filter patterns, payload shapes — see [realtime-contract.md](realtime-contract.md)
- **Health monitoring:** Heartbeat thresholds, stale detection, reconnection dashboard display — see [health-monitoring.md](health-monitoring.md)
- **Tenant isolation:** What data is shared vs isolated — see [tenant-scoping.md](tenant-scoping.md)
- **Bot environment variables (platform-level):** Complete list — see [../deployment/environment.md](../deployment/environment.md)
