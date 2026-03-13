# Supabase Realtime Contract — Multi-Tenant Bot

**Aspect:** 2.4 — Supabase Realtime subscription design
**Wave:** Wave 2 — Multi-Tenant Adaptation
**Written:** 2026-03-13
**References:**
- [multi-tenant/connection-manager.md](./connection-manager.md) — `TenantConnectionManager` that subscribes to channels
- [multi-tenant/byok-key-routing.md](./byok-key-routing.md) — `tenant_api_keys` Realtime events
- [database/schema.md](../database/schema.md) — All tables referenced below

---

## 1. Overview

Supabase Realtime is the **only communication channel** between the Daimon website and the bot. The website writes to Supabase tables; the bot subscribes to Realtime to detect those writes and act on them. There is no direct API between website and bot.

### 1.1 Communication Model

```
Website (Next.js / Supabase Edge Functions)
        │
        │ Writes to tables via Supabase client (service role or user JWT)
        ▼
  Supabase PostgreSQL
        │
        │ Logical replication → Realtime service → WebSocket push
        ▼
  Bot (Fly.io) ← TenantConnectionManager subscribes, reacts
```

### 1.2 All Realtime Channels

The bot subscribes to **exactly 4 Supabase Realtime channels** at startup. Each channel is
a Postgres CDC (Change Data Capture) subscription.

| Channel Name | Table | Events | What Triggers It |
|--------------|-------|--------|-----------------|
| `tenant-lifecycle` | `discord_connections` | `INSERT`, `UPDATE` | User connects/disconnects their Discord bot |
| `tenant-api-keys` | `tenant_api_keys` | `INSERT`, `UPDATE` | User saves/updates their Anthropic or OpenAI key |
| `tenant-status` | `tenants` | `UPDATE` | Admin suspends/reactivates a tenant; plan changes |
| `tenant-service-connections` | `tenant_service_connections` | `INSERT`, `UPDATE`, `DELETE` | User connects/disconnects GitHub, Linear, Toggl, etc. |

All channels use **`postgres_changes`** event type (not Broadcast or Presence).

---

## 2. Channel: `tenant-lifecycle`

### 2.1 Purpose

React to users connecting their Discord bot token via the Daimon website. This is the most
critical channel — it determines which Discord connections are live.

### 2.2 Subscription Configuration

```python
# In TenantConnectionManager._subscribe_to_realtime()

channel = supabase.channel("tenant-lifecycle")

# Event 1: New Discord connection created (user saved token for first time)
channel.on(
    "postgres_changes",
    event="INSERT",
    schema="public",
    table="discord_connections",
    callback=manager._on_discord_connection_inserted,
)

# Event 2: Existing connection updated (token change, disconnect, reconnect)
channel.on(
    "postgres_changes",
    event="UPDATE",
    schema="public",
    table="discord_connections",
    callback=manager._on_discord_connection_updated,
)

await channel.subscribe()
```

**No row-level filter:** The bot receives ALL `discord_connections` changes. The handler
is responsible for ignoring events about tenants the bot is not managing.

**Why no filter?** At startup the bot manages all tenants. Filtering by tenant ID would
require re-subscribing as tenants are added. The payload includes `tenant_id` for routing.

### 2.3 INSERT Payload Shape

Fires when: User saves their Discord bot token on the website for the first time.
This creates a new row in `discord_connections` with `status='disconnected'`.

```json
{
  "schema": "public",
  "table": "discord_connections",
  "commit_timestamp": "2026-03-13T10:00:00.000Z",
  "eventType": "INSERT",
  "errors": null,
  "new": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "tenant_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "guild_id": "1234567890123456789",
    "vault_secret_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "status": "disconnected",
    "bot_user_id": null,
    "bot_username": null,
    "last_heartbeat": null,
    "error_message": null,
    "created_at": "2026-03-13T10:00:00.000Z",
    "updated_at": "2026-03-13T10:00:00.000Z"
  },
  "old": {}
}
```

**Field types in payload:**

| Field | JSON Type | Notes |
|-------|-----------|-------|
| `id` | string | UUID as string |
| `tenant_id` | string | UUID as string |
| `guild_id` | string | Discord snowflake as string (NOT integer — too large for JSON number) |
| `vault_secret_id` | string | UUID as string — reference to Vault secret for the Discord token |
| `status` | string | `'disconnected'` on INSERT (always) |
| `bot_user_id` | null | Not populated at INSERT time |
| `bot_username` | null | Not populated at INSERT time |
| `last_heartbeat` | null | Not populated at INSERT time |
| `error_message` | null | Not populated at INSERT time |
| `created_at` | string | ISO 8601 UTC timestamp |
| `updated_at` | string | ISO 8601 UTC timestamp |

### 2.4 INSERT Handler Logic

```python
async def _on_discord_connection_inserted(self, payload: dict) -> None:
    """
    Called when a new discord_connections row is INSERTed.
    Website action: user saved their Discord bot token for the first time.
    """
    new_row = payload["new"]
    tenant_id = uuid.UUID(new_row["tenant_id"])

    # Idempotency check: is this tenant already connected?
    if tenant_id in self._tenants:
        logger.info(
            f"[Realtime INSERT discord_connections] tenant {tenant_id} already active, ignoring"
        )
        return

    # Check if Anthropic key is already configured (required before we can connect)
    config = await self._load_tenant_config(tenant_id)
    if config is None:
        # Missing Anthropic key — write error status to DB
        await self._write_status(
            connection_id=uuid.UUID(new_row["id"]),
            status="error",
            error_message=(
                "No Anthropic API key configured. "
                "Add your key in Settings → API Keys before connecting."
            ),
        )
        logger.warning(f"[Realtime INSERT discord_connections] tenant {tenant_id}: no Anthropic key")
        return

    # All good — start the connection
    logger.info(f"[Realtime INSERT discord_connections] starting connection for tenant {tenant_id}")
    await self.add_tenant(config)
```

### 2.5 UPDATE Payload Shape

Fires when: A `discord_connections` row is updated. This includes:
- Bot's own heartbeat writes (every 30s) — the bot writes `last_heartbeat`
- Bot's own status writes — bot writes `status`, `bot_user_id`, `error_message`
- Website action — user clicks "Disconnect" (website writes `status='disconnected'`)
- Website action — user updates their bot token (website creates new Vault secret, updates `vault_secret_id`)
- Admin action — admin suspends a tenant (writes `status='suspended'`)

```json
{
  "schema": "public",
  "table": "discord_connections",
  "commit_timestamp": "2026-03-13T10:30:00.000Z",
  "eventType": "UPDATE",
  "errors": null,
  "new": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "tenant_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "guild_id": "1234567890123456789",
    "vault_secret_id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "status": "connected",
    "bot_user_id": "987654321098765432",
    "bot_username": "MyBot",
    "last_heartbeat": "2026-03-13T10:30:00.000Z",
    "error_message": null,
    "created_at": "2026-03-13T10:00:00.000Z",
    "updated_at": "2026-03-13T10:30:00.000Z"
  },
  "old": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "tenant_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "guild_id": "1234567890123456789",
    "vault_secret_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "status": "connecting",
    "bot_user_id": null,
    "bot_username": null,
    "last_heartbeat": null,
    "error_message": null,
    "created_at": "2026-03-13T10:00:00.000Z",
    "updated_at": "2026-03-13T10:00:30.000Z"
  }
}
```

**Note on `old` field:** Supabase Realtime only includes `old` values for columns that are in
the table's REPLICA IDENTITY. The `discord_connections` table MUST have `REPLICA IDENTITY FULL`
set so the `old` values are available for change detection. This is set in the migration that
creates this table:

```sql
ALTER TABLE public.discord_connections REPLICA IDENTITY FULL;
```

Without `REPLICA IDENTITY FULL`, the `old` field contains only the primary key (`id`), making
it impossible to detect which field changed.

### 2.6 UPDATE Handler Logic

```python
async def _on_discord_connection_updated(self, payload: dict) -> None:
    """
    Called when a discord_connections row is UPDATEd.
    Distinguishes between bot-initiated updates (heartbeats, status changes)
    and website-initiated updates (user disconnect, token change).
    """
    new_row = payload["new"]
    old_row = payload["old"]
    tenant_id = uuid.UUID(new_row["tenant_id"])

    # --- Case 1: User explicitly disconnected ---
    # Website sets status='disconnected' via UI action
    if new_row.get("status") == "disconnected" and old_row.get("status") != "disconnected":
        logger.info(f"[Realtime UPDATE discord_connections] tenant {tenant_id}: user disconnected")
        await self.remove_tenant(tenant_id, reason="Disconnected by user via dashboard")
        return

    # --- Case 2: Admin suspended the tenant ---
    if new_row.get("status") == "suspended" and old_row.get("status") != "suspended":
        logger.info(f"[Realtime UPDATE discord_connections] tenant {tenant_id}: suspended by admin")
        await self.remove_tenant(tenant_id, reason="Account suspended by admin")
        return

    # --- Case 3: User updated their bot token ---
    # Detected by vault_secret_id change (new Vault secret = new token)
    if new_row.get("vault_secret_id") != old_row.get("vault_secret_id"):
        logger.info(
            f"[Realtime UPDATE discord_connections] tenant {tenant_id}: token updated, reconnecting"
        )
        await self.reconnect_tenant(tenant_id)
        return

    # --- Case 4: Bot's own writes (heartbeat, status, on_ready) ---
    # new_row.last_heartbeat changed, or status changed to 'connected'/'connecting'/'error'
    # These are writes the bot made itself — no action needed
    # Detect: if the change was only to last_heartbeat, updated_at, status, error_message
    changed_fields = {
        k for k in new_row
        if new_row.get(k) != old_row.get(k)
    }
    bot_writable_fields = {
        "last_heartbeat", "updated_at", "status", "error_message",
        "bot_user_id", "bot_username"
    }
    if changed_fields.issubset(bot_writable_fields):
        # Bot's own write — skip to avoid feedback loop
        return

    # --- Case 5: guild_id changed ---
    # User re-configured their guild ID (unusual but possible)
    if new_row.get("guild_id") != old_row.get("guild_id"):
        logger.info(
            f"[Realtime UPDATE discord_connections] tenant {tenant_id}: guild_id changed, reconnecting"
        )
        await self.reconnect_tenant(tenant_id)
        return

    # No recognized change pattern — log and ignore
    logger.debug(
        f"[Realtime UPDATE discord_connections] tenant {tenant_id}: unrecognized change {changed_fields}"
    )
```

---

## 3. Channel: `tenant-api-keys`

### 3.1 Purpose

React to tenants saving or updating their BYOK API keys (Anthropic or OpenAI). When a key is
saved, the bot must hot-reload the key into the active `TenantConfig` without restarting.

### 3.2 Subscription Configuration

```python
channel = supabase.channel("tenant-api-keys")

channel.on(
    "postgres_changes",
    event="INSERT",
    schema="public",
    table="tenant_api_keys",
    callback=manager._on_api_key_inserted,
)

channel.on(
    "postgres_changes",
    event="UPDATE",
    schema="public",
    table="tenant_api_keys",
    callback=manager._on_api_key_updated,
)

await channel.subscribe()
```

**No DELETE event:** Deleting a key triggers a tenant disconnect, which is handled via the
`tenant-lifecycle` channel (the `discord_connections` status is updated to `error` by the
website when a key is deleted). No direct DELETE subscription needed.

### 3.3 INSERT Payload Shape

Fires when: Tenant saves their API key for the first time (no existing row for that provider).

```json
{
  "schema": "public",
  "table": "tenant_api_keys",
  "commit_timestamp": "2026-03-13T10:05:00.000Z",
  "eventType": "INSERT",
  "errors": null,
  "new": {
    "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
    "tenant_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "provider": "anthropic",
    "vault_secret_id": "d4e5f6a7-b8c9-0123-defa-234567890123",
    "key_hint": "sk-ant-a...ab12",
    "status": "active",
    "validated_at": "2026-03-13T10:05:00.000Z",
    "created_at": "2026-03-13T10:05:00.000Z",
    "updated_at": "2026-03-13T10:05:00.000Z"
  },
  "old": {}
}
```

**Field types:**

| Field | JSON Type | Notes |
|-------|-----------|-------|
| `id` | string | UUID as string |
| `tenant_id` | string | UUID as string |
| `provider` | string | `'anthropic'` or `'openai'` |
| `vault_secret_id` | string | UUID as string — reference to Vault secret for key |
| `key_hint` | string | Masked key: `key[:8] + '...' + key[-4:]` — safe to log |
| `status` | string | `'active'` on INSERT (website only INSERTs valid keys) |
| `validated_at` | string | ISO 8601 UTC timestamp of last successful validation |
| `created_at` | string | ISO 8601 UTC timestamp |
| `updated_at` | string | ISO 8601 UTC timestamp |

**Critical security note:** The full API key is NEVER in the Realtime payload. Only the
`vault_secret_id` (UUID) is present. The bot must call `vault.decrypted_secrets` separately
to decrypt the actual key. This is by design — Vault secrets never leave Vault via Realtime.

### 3.4 INSERT Handler Logic

```python
async def _on_api_key_inserted(self, payload: dict) -> None:
    """
    Called when a tenant_api_keys row is INSERTed.
    This means the tenant saved their API key for the first time.

    Two scenarios:
    1. Tenant already connected (discord_connections exists, but we skipped at startup
       because Anthropic key was missing) — now we can start them
    2. Tenant not yet connected (discord_connections not yet created) — no action,
       the INSERT on discord_connections will handle startup
    """
    row = payload["new"]
    tenant_id = uuid.UUID(row["tenant_id"])
    provider = row["provider"]

    if provider != "anthropic":
        # OpenAI key added — hot-reload if tenant is active, no-op otherwise
        await self._hot_reload_api_key(tenant_id, provider, row["vault_secret_id"])
        return

    # Anthropic key added — check if tenant is waiting to connect
    if tenant_id in self._tenants:
        # Already connected (shouldn't happen but be safe)
        await self._hot_reload_api_key(tenant_id, "anthropic", row["vault_secret_id"])
        return

    # Check if tenant has a discord_connections row waiting to connect
    conn_row = await self._supabase.table("discord_connections") \
        .select("id, tenant_id, guild_id, vault_secret_id, status") \
        .eq("tenant_id", str(tenant_id)) \
        .neq("status", "disconnected") \
        .maybe_single() \
        .execute()

    if not conn_row.data:
        # No pending discord connection — no action needed yet
        logger.info(
            f"[Realtime INSERT tenant_api_keys] tenant {tenant_id}: Anthropic key added, "
            f"no pending discord connection"
        )
        return

    # Tenant has a pending discord connection but was waiting for this key
    # Load full config and start the connection
    config = await self._load_tenant_config(tenant_id)
    if config is not None:
        logger.info(
            f"[Realtime INSERT tenant_api_keys] tenant {tenant_id}: Anthropic key added, "
            f"pending discord connection found — starting connection"
        )
        await self.add_tenant(config)
```

### 3.5 UPDATE Payload Shape

Fires when: Tenant replaces their existing API key (UPSERT on `tenant_api_keys`).

```json
{
  "schema": "public",
  "table": "tenant_api_keys",
  "commit_timestamp": "2026-03-13T11:00:00.000Z",
  "eventType": "UPDATE",
  "errors": null,
  "new": {
    "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
    "tenant_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "provider": "anthropic",
    "vault_secret_id": "e5f6a7b8-c9d0-1234-efab-345678901234",
    "key_hint": "sk-ant-a...cd34",
    "status": "active",
    "validated_at": "2026-03-13T11:00:00.000Z",
    "created_at": "2026-03-13T10:05:00.000Z",
    "updated_at": "2026-03-13T11:00:00.000Z"
  },
  "old": {
    "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
    "tenant_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "provider": "anthropic",
    "vault_secret_id": "d4e5f6a7-b8c9-0123-defa-234567890123",
    "key_hint": "sk-ant-a...ab12",
    "status": "active",
    "validated_at": "2026-03-13T10:05:00.000Z",
    "created_at": "2026-03-13T10:05:00.000Z",
    "updated_at": "2026-03-13T10:05:00.000Z"
  }
}
```

**`tenant_api_keys` MUST also have `REPLICA IDENTITY FULL`** so the `old` row is available:

```sql
ALTER TABLE public.tenant_api_keys REPLICA IDENTITY FULL;
```

### 3.6 UPDATE Handler Logic

```python
async def _on_api_key_updated(self, payload: dict) -> None:
    """
    Called when a tenant_api_keys row is UPDATEd.
    This happens when tenant replaces their key (UPSERT) or bot marks key as invalid.
    """
    new_row = payload["new"]
    old_row = payload["old"]
    tenant_id = uuid.UUID(new_row["tenant_id"])
    provider = new_row["provider"]

    # --- Case 1: Bot marked the key as invalid ---
    # Bot writes status='invalid' when Anthropic returns 401
    if new_row.get("status") == "invalid" and old_row.get("status") == "active":
        # This is a write the bot itself made — no action needed
        logger.debug(
            f"[Realtime UPDATE tenant_api_keys] tenant {tenant_id}: "
            f"{provider} key marked invalid (our own write)"
        )
        return

    # --- Case 2: Tenant replaced their key ---
    # Detected by vault_secret_id changing
    if new_row.get("vault_secret_id") != old_row.get("vault_secret_id"):
        if new_row.get("status") == "active":
            logger.info(
                f"[Realtime UPDATE tenant_api_keys] tenant {tenant_id}: "
                f"{provider} key replaced — hot-reloading"
            )
            await self._hot_reload_api_key(tenant_id, provider, new_row["vault_secret_id"])
        return

    # --- Case 3: Tenant re-activated a revoked/invalid key ---
    if new_row.get("status") == "active" and old_row.get("status") != "active":
        logger.info(
            f"[Realtime UPDATE tenant_api_keys] tenant {tenant_id}: "
            f"{provider} key re-activated — hot-reloading"
        )
        await self._hot_reload_api_key(tenant_id, provider, new_row["vault_secret_id"])
        return

    # No recognized change pattern
    logger.debug(
        f"[Realtime UPDATE tenant_api_keys] tenant {tenant_id}: unrecognized update, ignoring"
    )

async def _hot_reload_api_key(
    self,
    tenant_id: uuid.UUID,
    provider: str,
    vault_secret_id: str,
) -> None:
    """
    Decrypt the new key from Vault and update the in-memory TenantConfig.
    No Discord reconnection needed — the key is only used in Fly session launches.
    """
    if tenant_id not in self._tenants:
        logger.debug(
            f"_hot_reload_api_key: tenant {tenant_id} not active, ignoring"
        )
        return

    new_key = await self._decrypt_vault_secret(vault_secret_id)

    runner = self._tenants[tenant_id]
    old_config = runner.config

    if provider == "anthropic":
        new_config = TenantConfig(
            **{**vars(old_config), "anthropic_api_key": new_key}
        )
    elif provider == "openai":
        new_config = TenantConfig(
            **{**vars(old_config), "openai_api_key": new_key}
        )
    else:
        logger.warning(f"_hot_reload_api_key: unknown provider '{provider}'")
        return

    new_tool_context = self._build_tool_context(new_config)

    # Atomic update (CPython bytecode-level atomicity for attribute assignment)
    runner.config = new_config
    runner.tool_context = new_tool_context

    logger.info(
        f"_hot_reload_api_key: tenant {tenant_id} {provider} key reloaded "
        f"(hint: {new_config.anthropic_api_key[:8]}...)"
    )
```

---

## 4. Channel: `tenant-status`

### 4.1 Purpose

React to admin actions on the `tenants` table: suspending accounts, reactivating accounts,
and plan downgrades that require behavior changes.

### 4.2 Subscription Configuration

```python
channel = supabase.channel("tenant-status")

channel.on(
    "postgres_changes",
    event="UPDATE",
    schema="public",
    table="tenants",
    callback=manager._on_tenant_updated,
)

await channel.subscribe()
```

**No INSERT event:** New tenants starting up are detected via `discord_connections` INSERT
(the tenant has a row in `tenants` but the bot doesn't care until they connect Discord).

**No DELETE event:** Tenants are never hard-deleted in production; they are suspended.

### 4.3 UPDATE Payload Shape

Fires when: Admin changes `tenants.status` (suspend/reactivate), or Stripe webhook updates
`tenants.plan` (plan upgrade/downgrade).

```json
{
  "schema": "public",
  "table": "tenants",
  "commit_timestamp": "2026-03-13T12:00:00.000Z",
  "eventType": "UPDATE",
  "errors": null,
  "new": {
    "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "name": "Acme Corp",
    "slug": "acme-corp",
    "status": "suspended",
    "plan": "starter",
    "stripe_customer_id": "cus_abc123",
    "stripe_subscription_id": "sub_def456",
    "created_at": "2026-01-15T09:00:00.000Z",
    "updated_at": "2026-03-13T12:00:00.000Z"
  },
  "old": {
    "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "name": "Acme Corp",
    "slug": "acme-corp",
    "status": "active",
    "plan": "starter",
    "stripe_customer_id": "cus_abc123",
    "stripe_subscription_id": "sub_def456",
    "created_at": "2026-01-15T09:00:00.000Z",
    "updated_at": "2026-03-13T11:00:00.000Z"
  }
}
```

**`tenants` table MUST have `REPLICA IDENTITY FULL`:**

```sql
ALTER TABLE public.tenants REPLICA IDENTITY FULL;
```

### 4.4 UPDATE Handler Logic

```python
async def _on_tenant_updated(self, payload: dict) -> None:
    """
    Called when a tenants row is UPDATEd.
    Handles: admin suspension, admin reactivation, plan changes.
    """
    new_row = payload["new"]
    old_row = payload["old"]
    tenant_id = uuid.UUID(new_row["id"])

    # --- Case 1: Tenant suspended ---
    if new_row.get("status") == "suspended" and old_row.get("status") != "suspended":
        logger.info(f"[Realtime UPDATE tenants] tenant {tenant_id}: suspended — disconnecting")
        await self.remove_tenant(
            tenant_id,
            reason="Account suspended by admin. Contact support@daimon.ai.",
        )
        # Update discord_connections to reflect suspension
        await self._supabase.table("discord_connections") \
            .update({
                "status": "error",
                "error_message": "Account suspended. Contact support@daimon.ai.",
                "updated_at": datetime.utcnow().isoformat(),
            }) \
            .eq("tenant_id", str(tenant_id)) \
            .execute()
        return

    # --- Case 2: Tenant reactivated from suspension ---
    if new_row.get("status") == "active" and old_row.get("status") == "suspended":
        logger.info(f"[Realtime UPDATE tenants] tenant {tenant_id}: reactivated — reconnecting")
        config = await self._load_tenant_config(tenant_id)
        if config is not None:
            await self.add_tenant(config)
        return

    # --- Case 3: Plan changed ---
    # No immediate bot action needed for plan changes.
    # Plan gating is enforced at session launch time (fly_run_session checks plan).
    if new_row.get("plan") != old_row.get("plan"):
        if tenant_id in self._tenants:
            # Reload TenantConfig with new plan
            runner = self._tenants[tenant_id]
            old_config = runner.config
            new_config = TenantConfig(**{**vars(old_config), "plan": new_row["plan"]})
            runner.config = new_config
            logger.info(
                f"[Realtime UPDATE tenants] tenant {tenant_id}: plan changed "
                f"{old_row['plan']} → {new_row['plan']}"
            )
        return

    # No recognized change
    logger.debug(
        f"[Realtime UPDATE tenants] tenant {tenant_id}: unrecognized update, ignoring"
    )
```

---

## 5. Channel: `tenant-service-connections`

### 5.1 Purpose

React to tenants connecting or disconnecting service integrations (GitHub, Linear, Toggl, etc.).
When a service is connected, the bot can use its API key for that tenant's sessions.

### 5.2 Subscription Configuration

```python
channel = supabase.channel("tenant-service-connections")

channel.on(
    "postgres_changes",
    event="INSERT",
    schema="public",
    table="tenant_service_connections",
    callback=manager._on_service_connection_inserted,
)

channel.on(
    "postgres_changes",
    event="UPDATE",
    schema="public",
    table="tenant_service_connections",
    callback=manager._on_service_connection_updated,
)

channel.on(
    "postgres_changes",
    event="DELETE",
    schema="public",
    table="tenant_service_connections",
    callback=manager._on_service_connection_deleted,
)

await channel.subscribe()
```

### 5.3 INSERT Payload Shape

Fires when: Tenant connects a new service (e.g., pastes their Linear API key).

```json
{
  "schema": "public",
  "table": "tenant_service_connections",
  "commit_timestamp": "2026-03-13T14:00:00.000Z",
  "eventType": "INSERT",
  "errors": null,
  "new": {
    "id": "f6a7b8c9-d0e1-2345-fabc-456789012345",
    "tenant_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "service": "linear",
    "auth_type": "api_key",
    "vault_secret_id": "a7b8c9d0-e1f2-3456-abcd-567890123456",
    "access_token_vault_id": null,
    "refresh_token_vault_id": null,
    "token_expires_at": null,
    "scopes": null,
    "external_account_id": null,
    "external_account_name": null,
    "metadata": {"team_id": "TEAM_abc123"},
    "status": "active",
    "error_message": null,
    "created_at": "2026-03-13T14:00:00.000Z",
    "updated_at": "2026-03-13T14:00:00.000Z"
  },
  "old": {}
}
```

**Field types:**

| Field | JSON Type | Notes |
|-------|-----------|-------|
| `id` | string | UUID as string |
| `tenant_id` | string | UUID as string |
| `service` | string | `'linear'`, `'github'`, `'google'`, `'toggl'` |
| `auth_type` | string | `'api_key'` or `'oauth'` |
| `vault_secret_id` | string \| null | UUID — for `auth_type='api_key'` only |
| `access_token_vault_id` | string \| null | UUID — for `auth_type='oauth'` access token |
| `refresh_token_vault_id` | string \| null | UUID — for `auth_type='oauth'` refresh token |
| `token_expires_at` | string \| null | ISO 8601 — for OAuth tokens with expiry |
| `scopes` | array \| null | OAuth scopes granted, e.g. `["repo", "read:user"]` |
| `external_account_id` | string \| null | Provider account ID (e.g., GitHub user ID) |
| `external_account_name` | string \| null | Provider account name (e.g., `"octocat"`) |
| `metadata` | object \| null | Service-specific data (e.g., `{"team_id": "..."}` for Linear) |
| `status` | string | `'active'`, `'error'`, `'expired'` |
| `error_message` | string \| null | Error detail if `status='error'` |

### 5.4 Service Connection INSERT Handler

```python
async def _on_service_connection_inserted(self, payload: dict) -> None:
    """
    Called when tenant connects a new service integration.
    Loads the service credentials into the active TenantConfig.
    """
    row = payload["new"]
    tenant_id = uuid.UUID(row["tenant_id"])
    service = row["service"]

    if tenant_id not in self._tenants:
        # Tenant is not currently active — no action
        return

    if row["status"] != "active":
        # Service connection was added in error state — no action
        return

    runner = self._tenants[tenant_id]
    await self._reload_service_connection(runner, service, row)
    logger.info(
        f"[Realtime INSERT tenant_service_connections] "
        f"tenant {tenant_id}: {service} connected"
    )

async def _reload_service_connection(
    self,
    runner: ActiveTenant,
    service: str,
    row: dict,
) -> None:
    """
    Decrypt service credentials from Vault and update TenantConfig.
    Each service has its own field in TenantConfig/ToolContext.
    """
    if row["auth_type"] == "api_key" and row.get("vault_secret_id"):
        decrypted_key = await self._decrypt_vault_secret(row["vault_secret_id"])
    elif row["auth_type"] == "oauth" and row.get("access_token_vault_id"):
        decrypted_key = await self._decrypt_vault_secret(row["access_token_vault_id"])
    else:
        logger.warning(
            f"_reload_service_connection: service {service} has no vault secret ID"
        )
        return

    old_config = runner.config
    metadata = row.get("metadata") or {}

    if service == "linear":
        new_config = TenantConfig(**{
            **vars(old_config),
            "linear_api_key": decrypted_key,
            "linear_team_id": metadata.get("team_id", ""),
        })
    elif service == "github":
        new_config = TenantConfig(**{
            **vars(old_config),
            "github_access_token": decrypted_key,
        })
    elif service == "google":
        new_config = TenantConfig(**{
            **vars(old_config),
            "google_access_token": decrypted_key,
            "google_refresh_token": (
                await self._decrypt_vault_secret(row["refresh_token_vault_id"])
                if row.get("refresh_token_vault_id") else ""
            ),
            "google_token_expires_at": row.get("token_expires_at", ""),
        })
    elif service == "toggl":
        new_config = TenantConfig(**{
            **vars(old_config),
            "toggl_api_key": decrypted_key,
        })
    else:
        logger.warning(f"_reload_service_connection: unknown service '{service}'")
        return

    runner.config = new_config
    runner.tool_context = self._build_tool_context(new_config)
```

### 5.5 DELETE Payload Shape

Fires when: Tenant disconnects a service (removes the row). The bot must clear the service
credentials from the active TenantConfig.

```json
{
  "schema": "public",
  "table": "tenant_service_connections",
  "commit_timestamp": "2026-03-13T15:00:00.000Z",
  "eventType": "DELETE",
  "errors": null,
  "new": {},
  "old": {
    "id": "f6a7b8c9-d0e1-2345-fabc-456789012345",
    "tenant_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "service": "linear",
    "auth_type": "api_key",
    "vault_secret_id": "a7b8c9d0-e1f2-3456-abcd-567890123456",
    "access_token_vault_id": null,
    "refresh_token_vault_id": null,
    "token_expires_at": null,
    "scopes": null,
    "external_account_id": null,
    "external_account_name": null,
    "metadata": {"team_id": "TEAM_abc123"},
    "status": "active",
    "error_message": null,
    "created_at": "2026-03-13T14:00:00.000Z",
    "updated_at": "2026-03-13T14:00:00.000Z"
  }
}
```

**`tenant_service_connections` MUST have `REPLICA IDENTITY FULL`** for DELETE events to
include the `old` row (needed to know which tenant and service was deleted):

```sql
ALTER TABLE public.tenant_service_connections REPLICA IDENTITY FULL;
```

### 5.6 DELETE Handler Logic

```python
async def _on_service_connection_deleted(self, payload: dict) -> None:
    """
    Called when tenant disconnects a service integration (row deleted).
    Clears the service credentials from the active TenantConfig.
    """
    old_row = payload["old"]
    tenant_id = uuid.UUID(old_row["tenant_id"])
    service = old_row["service"]

    if tenant_id not in self._tenants:
        return

    runner = self._tenants[tenant_id]
    old_config = runner.config

    if service == "linear":
        new_config = TenantConfig(**{
            **vars(old_config),
            "linear_api_key": "",
            "linear_team_id": "",
        })
    elif service == "github":
        new_config = TenantConfig(**{
            **vars(old_config),
            "github_access_token": "",
        })
    elif service == "google":
        new_config = TenantConfig(**{
            **vars(old_config),
            "google_access_token": "",
            "google_refresh_token": "",
            "google_token_expires_at": "",
        })
    elif service == "toggl":
        new_config = TenantConfig(**{
            **vars(old_config),
            "toggl_api_key": "",
        })
    else:
        logger.warning(f"_on_service_connection_deleted: unknown service '{service}'")
        return

    runner.config = new_config
    runner.tool_context = self._build_tool_context(new_config)

    logger.info(
        f"[Realtime DELETE tenant_service_connections] "
        f"tenant {tenant_id}: {service} disconnected — credentials cleared"
    )
```

---

## 6. Realtime Channel Lifecycle Management

### 6.1 Subscribing at Startup

All 4 channels are subscribed in sequence at bot startup, after `start_all()` loads active tenants:

```python
async def _subscribe_to_all_realtime(self) -> None:
    """
    Called once at startup after start_all() completes.
    Creates and subscribes to all 4 channels.
    Stores channel handles for potential re-subscription.
    """
    self._channels: dict[str, RealtimeChannel] = {}

    # 1. Discord connections (tenant lifecycle)
    ch1 = self._supabase.channel("tenant-lifecycle")
    ch1.on("postgres_changes", event="INSERT", schema="public",
           table="discord_connections", callback=self._on_discord_connection_inserted)
    ch1.on("postgres_changes", event="UPDATE", schema="public",
           table="discord_connections", callback=self._on_discord_connection_updated)
    await ch1.subscribe()
    self._channels["tenant-lifecycle"] = ch1

    # 2. API keys
    ch2 = self._supabase.channel("tenant-api-keys")
    ch2.on("postgres_changes", event="INSERT", schema="public",
           table="tenant_api_keys", callback=self._on_api_key_inserted)
    ch2.on("postgres_changes", event="UPDATE", schema="public",
           table="tenant_api_keys", callback=self._on_api_key_updated)
    await ch2.subscribe()
    self._channels["tenant-api-keys"] = ch2

    # 3. Tenant status
    ch3 = self._supabase.channel("tenant-status")
    ch3.on("postgres_changes", event="UPDATE", schema="public",
           table="tenants", callback=self._on_tenant_updated)
    await ch3.subscribe()
    self._channels["tenant-status"] = ch3

    # 4. Service connections
    ch4 = self._supabase.channel("tenant-service-connections")
    ch4.on("postgres_changes", event="INSERT", schema="public",
           table="tenant_service_connections", callback=self._on_service_connection_inserted)
    ch4.on("postgres_changes", event="UPDATE", schema="public",
           table="tenant_service_connections", callback=self._on_service_connection_updated)
    ch4.on("postgres_changes", event="DELETE", schema="public",
           table="tenant_service_connections", callback=self._on_service_connection_deleted)
    await ch4.subscribe()
    self._channels["tenant-service-connections"] = ch4

    logger.info("[Realtime] Subscribed to all 4 channels")
```

### 6.2 Realtime Reconnection on Disconnect

Supabase Realtime connections use WebSocket. If the WebSocket drops (network blip, Supabase
restart, Fly.io network issue), the supabase-py client handles reconnection automatically
using its built-in WebSocket reconnect logic.

However, **the bot must also handle the case where events were missed during a disconnect**.
After reconnection, the bot performs a **reconciliation pass**:

```python
async def _on_realtime_reconnect(self) -> None:
    """
    Called when the Supabase Realtime WebSocket reconnects after a disconnect.
    Performs a reconciliation pass to catch any events missed during the outage.
    """
    logger.info("[Realtime] WebSocket reconnected — running reconciliation pass")

    # 1. Load current state of all tenants from DB
    current_db_state = await self._load_all_active_configs()
    current_db_tenant_ids = {config.tenant_id for config in current_db_state}
    current_local_tenant_ids = set(self._tenants.keys())

    # 2. Start any tenants that are in DB but not running locally
    missing_tenants = current_db_tenant_ids - current_local_tenant_ids
    for tenant_id in missing_tenants:
        config = next(c for c in current_db_state if c.tenant_id == tenant_id)
        logger.info(f"[Reconcile] Adding missed tenant {tenant_id}")
        await self.add_tenant(config)

    # 3. Remove any tenants that are running locally but no longer active in DB
    extra_tenants = current_local_tenant_ids - current_db_tenant_ids
    for tenant_id in extra_tenants:
        logger.info(f"[Reconcile] Removing tenant {tenant_id} no longer in DB")
        await self.remove_tenant(tenant_id, reason="Tenant no longer active in DB (reconcile)")

    # 4. Reload API keys for all active tenants (catch any key updates missed)
    for tenant_id in current_local_tenant_ids & current_db_tenant_ids:
        await self._refresh_api_keys_for_tenant(tenant_id)

    logger.info(
        f"[Reconcile] Complete — "
        f"added {len(missing_tenants)}, removed {len(extra_tenants)} tenants"
    )
```

### 6.3 Supabase Realtime Connection Status Monitoring

The bot monitors whether Realtime channels are healthy:

```python
async def _monitor_realtime_health(self) -> None:
    """
    Background coroutine that monitors Realtime channel health.
    Runs every 60 seconds. If a channel is not subscribed, re-subscribes.
    """
    while True:
        await asyncio.sleep(60)
        for channel_name, channel in self._channels.items():
            if channel.state != "joined":
                logger.warning(
                    f"[Realtime] Channel '{channel_name}' is in state '{channel.state}'"
                    f" — attempting re-subscribe"
                )
                try:
                    await channel.subscribe()
                    logger.info(f"[Realtime] Channel '{channel_name}' re-subscribed")
                except Exception as e:
                    logger.error(
                        f"[Realtime] Failed to re-subscribe to '{channel_name}': {e}"
                    )
```

### 6.4 Channel State Values

The supabase-py `RealtimeChannel.state` can be:

| State | Meaning |
|-------|---------|
| `"joined"` | Connected and subscribed — healthy |
| `"joining"` | Subscription in progress |
| `"leaving"` | Unsubscribing in progress |
| `"closed"` | Channel closed (WebSocket disconnected) |
| `"errored"` | Subscription failed — needs re-subscribe |

The bot treats any state other than `"joined"` as unhealthy and attempts re-subscription.

---

## 7. Supabase Realtime Configuration Requirements

### 7.1 Tables That Must Have REPLICA IDENTITY FULL

For UPDATE and DELETE events to include `old` row values, these tables must have
`REPLICA IDENTITY FULL`. This is set in the migration SQL:

```sql
-- In the migration that creates each table:
ALTER TABLE public.discord_connections REPLICA IDENTITY FULL;
ALTER TABLE public.tenant_api_keys REPLICA IDENTITY FULL;
ALTER TABLE public.tenants REPLICA IDENTITY FULL;
ALTER TABLE public.tenant_service_connections REPLICA IDENTITY FULL;
```

**Without this:** UPDATE events only include the new row and the primary key in `old`.
DELETE events only include the primary key in `old`. This breaks the change detection
logic that compares `old` and `new` field values.

### 7.2 Supabase Realtime Publication

By default, Supabase adds all tables to the `supabase_realtime` publication. Verify that
all 4 tables are in the publication after migration:

```sql
-- Verify tables are in the Realtime publication
SELECT schemaname, tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
  AND tablename IN (
    'discord_connections',
    'tenant_api_keys',
    'tenants',
    'tenant_service_connections'
  );
-- Should return 4 rows
```

If a table is missing:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.discord_connections;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tenant_api_keys;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tenants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tenant_service_connections;
```

### 7.3 Realtime Row-Level Security

Supabase Realtime respects RLS policies when using the **anon key** or **user JWT**. However,
the bot uses the **service role key** (`SUPABASE_SERVICE_ROLE_KEY`), which bypasses RLS.
This is correct — the bot must receive events for ALL tenants, not just the current user.

**Security implication:** The service role key is a privileged credential. It MUST:
1. Never be exposed to tenants or end users
2. Only be used by the bot process (Fly.io machine)
3. Be rotated if compromised via the Supabase dashboard
4. Be stored as a Fly.io secret (`fly secrets set SUPABASE_SERVICE_ROLE_KEY=...`)

### 7.4 Concurrent Connections from Website

The website (Next.js on Vercel) does NOT subscribe to Realtime for these tables. The website
only writes to the database. Only the bot reads via Realtime. This avoids:
- Unnecessary Realtime connections from serverless functions (Vercel is stateless)
- Security exposure of service role credentials to the browser

The **dashboard** uses polling or Supabase's browser Realtime client (anon key) to display
bot status updates. See [integrations/supabase-realtime.md](../integrations/supabase-realtime.md)
for the browser-side Realtime contract (different channels, read-only for status display).

---

## 8. Event Ordering and Idempotency

### 8.1 Ordering Guarantees

Supabase Realtime delivers events in **commit order** (PostgreSQL WAL sequence). However:
- Events from different tables may arrive out of logical order
- Example: `tenant_api_keys INSERT` may arrive before `discord_connections INSERT` even if
  both happened in the same transaction

**Design implication:** All handlers must be idempotent and handle missing prerequisites:
- `discord_connections INSERT` handler checks for Anthropic key and writes `error` if missing
- `tenant_api_keys INSERT` handler checks for pending `discord_connections` and starts it

### 8.2 Idempotency Rules

| Handler | Idempotency Mechanism |
|---------|----------------------|
| `_on_discord_connection_inserted` | Check `tenant_id in self._tenants` before adding |
| `_on_discord_connection_updated` | Detect bot's own writes by checking which fields changed |
| `_on_api_key_inserted` | Check `tenant_id in self._tenants` before reloading |
| `_on_api_key_updated` | Check vault_secret_id changed before reloading |
| `_on_tenant_updated` | Compare `old` and `new` status before acting |
| `_on_service_connection_inserted` | Check `tenant_id in self._tenants` before reloading |
| `_on_service_connection_deleted` | Check `tenant_id in self._tenants` before clearing |

### 8.3 Duplicate Event Handling

Supabase Realtime guarantees at-least-once delivery. Duplicate events are possible after
reconnection. All handlers are safe to call multiple times:
- `add_tenant` is idempotent (checks if already active)
- `remove_tenant` is idempotent (checks if present before removing)
- `_hot_reload_api_key` is idempotent (reloads the same key again is harmless)
- `_reload_service_connection` is idempotent (overwrites with same value)

---

## 9. Complete Event Table

A reference table of every event the bot reacts to:

| Table | Event | Trigger | Bot Action |
|-------|-------|---------|------------|
| `discord_connections` | INSERT | User saves bot token for first time | If Anthropic key exists: start Discord connection. If not: write `error` status. |
| `discord_connections` | UPDATE: `status` → `disconnected` | User clicks "Disconnect" in dashboard | Disconnect this tenant's Discord client |
| `discord_connections` | UPDATE: `status` → `suspended` | Admin suspends account | Disconnect this tenant's Discord client |
| `discord_connections` | UPDATE: `vault_secret_id` changed | User updates bot token | Reconnect with new token (disconnect + re-decrypt + reconnect) |
| `discord_connections` | UPDATE: `guild_id` changed | User updates guild ID | Reconnect (re-bind on_message guild filter) |
| `discord_connections` | UPDATE: `last_heartbeat`, `status`, `error_message`, `bot_user_id`, `bot_username` changed | Bot's own writes | No action (self-generated, ignore) |
| `tenant_api_keys` | INSERT: `provider='anthropic'` | User saves Anthropic key for first time | If pending discord_connection exists: start connection. If tenant active: hot-reload key. |
| `tenant_api_keys` | INSERT: `provider='openai'` | User saves OpenAI key for first time | Hot-reload into TenantConfig if tenant active |
| `tenant_api_keys` | UPDATE: `vault_secret_id` changed | User replaces existing key | Hot-reload new key into TenantConfig |
| `tenant_api_keys` | UPDATE: `status` → `invalid` | Bot marked key invalid (bot's own write) | No action (self-generated, ignore) |
| `tenant_api_keys` | UPDATE: `status` → `active` from `invalid` | User saved new valid key | Hot-reload key into TenantConfig |
| `tenants` | UPDATE: `status` → `suspended` | Admin suspends account | Disconnect tenant, write error to discord_connections |
| `tenants` | UPDATE: `status` → `active` from `suspended` | Admin reactivates account | Reload config and reconnect |
| `tenants` | UPDATE: `plan` changed | Stripe webhook updated plan | Reload plan into TenantConfig (affects session gating) |
| `tenant_service_connections` | INSERT | User connects a service (Linear, GitHub, etc.) | Decrypt and load service credentials into TenantConfig |
| `tenant_service_connections` | UPDATE: `vault_secret_id` changed | User updates service credentials | Reload new credentials into TenantConfig |
| `tenant_service_connections` | UPDATE: `status` → `expired` or `error` | OAuth token expired | Clear credentials from TenantConfig (token unusable) |
| `tenant_service_connections` | DELETE | User disconnects a service | Clear service credentials from TenantConfig |

---

## 10. Cross-References

- [multi-tenant/connection-manager.md](./connection-manager.md) — `TenantConnectionManager` class and `add_tenant`/`remove_tenant`
- [multi-tenant/byok-key-routing.md](./byok-key-routing.md) — Hot-reload logic for API keys, Vault decryption
- [multi-tenant/tenant-scoping.md](./tenant-scoping.md) — `TenantConfig` dataclass, `ToolContext` fields
- [multi-tenant/health-monitoring.md](./health-monitoring.md) — Heartbeat writes that generate Realtime events (must be ignored)
- [database/schema.md](../database/schema.md) — All 4 table schemas; `REPLICA IDENTITY FULL` constraints
- [database/rls-policies.md](../database/rls-policies.md) — RLS policies (Realtime uses service role, bypasses RLS)
- [integrations/supabase-realtime.md](../integrations/supabase-realtime.md) — Browser-side Realtime contract (dashboard status display, different channels)
