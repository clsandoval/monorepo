# Health Monitoring — Per-Tenant Status, Stale Detection, Reconnection

**Aspect:** 2.5 — Heartbeat + health monitoring
**Wave:** Wave 2 — Multi-Tenant Adaptation
**Written:** 2026-03-13
**References:**
- [connection-manager.md](./connection-manager.md) — `TenantConnectionManager`, heartbeat loop, supervisor task
- [realtime-contract.md](./realtime-contract.md) — Realtime channels for status updates
- [database/schema.md](../database/schema.md) — `discord_connections` table schema

---

## 1. Overview

Health monitoring for Daimon's multi-tenant bot operates at two levels:

1. **Per-tenant health** — Is an individual tenant's bot connected and responsive?
2. **Platform health** — Is the bot process itself healthy? Is the Fly.io machine running?

These two levels are tracked separately and exposed via different mechanisms:
- Per-tenant health → `discord_connections` table (written by bot, read by website dashboard)
- Platform health → FastAPI `/health` HTTP endpoint (read by Fly.io health checks + monitoring)

---

## 2. Per-Tenant Status State Machine

### 2.1 All Status Values

The `discord_connections.status` column uses this `ConnectionStatus` enum:

```python
class ConnectionStatus(str, enum.Enum):
    DISCONNECTED = "disconnected"   # User explicitly disconnected OR never connected
    CONNECTING   = "connecting"     # Bot is attempting to connect (startup or retry)
    CONNECTED    = "connected"      # Discord WebSocket established; heartbeats flowing
    ERROR        = "error"          # Non-transient failure; user action may be required
```

### 2.2 Derived/Computed Status: `stale`

`stale` is NOT stored in the database. It is computed at query time by the frontend:

```sql
CASE
    WHEN status = 'connected'
         AND last_heartbeat < NOW() - INTERVAL '120 seconds'
    THEN 'stale'
    ELSE status
END AS effective_status
```

**Why computed not stored:** Writing `stale` to the DB would require a background job or trigger running every 30 seconds across all tenants. Computing it at query time is cheaper, always accurate, and avoids race conditions between the bot (which writes heartbeats) and a stale-detection job.

### 2.3 Status Transition Table

| From State | Event | To State | Who Writes |
|------------|-------|----------|-----------|
| `disconnected` | User saves Discord bot token on website | `disconnected` → (INSERT triggers bot) | Website (INSERT row) |
| `disconnected` | Bot receives INSERT Realtime event + has Anthropic key | `connecting` | Bot |
| `connecting` | Discord WebSocket established (`on_ready` fires) | `connected` | Bot |
| `connected` | Heartbeat write every 30s (no status change) | `connected` (timestamp only) | Bot |
| `connected` | User clicks "Disconnect" on website | `disconnected` | Website |
| `connected` | User updates bot token on website | `connecting` → reconnect | Bot |
| `connected` | Discord WebSocket dropped (network transient) | `connecting` (retry backoff) | Bot |
| `connected` | Bot sends SIGTERM (graceful restart) | `connected` (not changed) | — (stays connected, reconnects on restart) |
| `connecting` | Reconnect attempt #N fails | `connecting` (error_message updated) | Bot |
| `connecting` | Reconnect attempt #10 fails (max exceeded) | `error` | Bot |
| `connecting` | `discord.LoginFailure` (invalid token) | `error` | Bot |
| `connecting` | `discord.PrivilegedIntentsRequired` | `error` | Bot |
| `error` | User saves new/corrected bot token | `disconnected` → (bot reconnects via Realtime) | Website |
| `error` | Admin clicks "Force Reconnect" in admin panel | `disconnected` → (bot reconnects via Realtime) | Admin API |
| any | Admin suspends tenant | `disconnected` (bot disconnects) | Bot (via `tenants` UPDATE Realtime) |
| `disconnected` | Admin reactivates tenant | `connecting` (bot restarts connection) | Bot (via `tenants` UPDATE Realtime) |

### 2.4 `effective_status` Values Shown in Dashboard

The website always displays `effective_status`, which incorporates `stale` detection:

| `discord_connections.status` | `last_heartbeat` age | `effective_status` | UI Indicator |
|-------------------------------|---------------------|-------------------|-------------|
| `connected` | < 120s | `connected` | Green dot, "Connected" |
| `connected` | ≥ 120s but < 10 min | `stale` | Yellow dot, "Bot may be unresponsive" |
| `connected` | ≥ 10 min | `stale` | Orange dot, "Bot offline — check Fly.io" |
| `connecting` | any | `connecting` | Spinner, "Connecting..." |
| `disconnected` | any | `disconnected` | Grey dot, "Not connected" |
| `error` | any | `error` | Red dot, `error_message` text |

**Two stale thresholds:**
- **120s (2 min):** Heartbeat missed (heartbeat writes every 30s; 2 min = 4 misses). Warning: may be unresponsive.
- **600s (10 min):** Bot process almost certainly crashed or Fly.io machine is down. Escalated warning.

Both thresholds are computed using the same query pattern (using `INTERVAL '120 seconds'` and `INTERVAL '10 minutes'` respectively).

---

## 3. Heartbeat Mechanism

### 3.1 Heartbeat Writer (Bot Side)

Each tenant has a dedicated `heartbeat_writer` asyncio task, sibling to the `discord_client_runner` task. Full implementation:

```python
# apps/bot/src_v2/entrypoints/discord/health_monitor.py

HEARTBEAT_INTERVAL_SECONDS: Final[int] = 30
STALE_THRESHOLD_SECONDS: Final[int] = 120
STALE_CRITICAL_THRESHOLD_SECONDS: Final[int] = 600

async def heartbeat_writer(
    supabase: Client,
    tenant_id: uuid.UUID,
    connection_id: uuid.UUID,
) -> None:
    """
    Writes last_heartbeat to discord_connections every HEARTBEAT_INTERVAL_SECONDS.

    This task is started as a sibling to the Discord client task.
    It is cancelled when the Discord client task exits (clean disconnect).
    It is NOT cancelled on transient errors — heartbeat failure is non-fatal.

    Args:
        supabase: Supabase service role client
        tenant_id: UUID of the tenant (for logging)
        connection_id: discord_connections.id to update
    """
    while True:
        try:
            await asyncio.sleep(HEARTBEAT_INTERVAL_SECONDS)

            now_iso = datetime.utcnow().isoformat() + "Z"
            result = (
                supabase.table("discord_connections")
                .update({"last_heartbeat": now_iso, "updated_at": now_iso})
                .eq("id", str(connection_id))
                .execute()
            )
            # result.data is empty list on success when using service role
            # No error handling needed — if supabase is down, we just log and retry next cycle

        except asyncio.CancelledError:
            # Parent task (discord_client_runner) was cancelled — stop gracefully
            return

        except Exception as exc:
            # Heartbeat failure is non-fatal:
            # - Supabase may be momentarily unavailable
            # - The Discord connection itself is fine
            # - Dashboard will show 'stale' after 120s but connection is real
            # Log to stderr; do NOT raise; sleep and retry next cycle
            print(f"[heartbeat] tenant={tenant_id} WARN: heartbeat write failed: {exc}",
                  file=sys.stderr, flush=True)
            # Do NOT sleep an extra duration — just let the loop continue
```

### 3.2 Heartbeat Data Written

On each 30-second tick, the bot writes:

```json
{
  "last_heartbeat": "2026-03-13T12:34:56.789Z",
  "updated_at": "2026-03-13T12:34:56.789Z"
}
```

**What is NOT written on heartbeat:**
- `status` — not changed (stays `"connected"`)
- `bot_user_id` — not changed (set once on `on_ready`)
- `bot_username` — not changed
- `error_message` — not changed

### 3.3 Reading Heartbeat on Dashboard

Frontend query (Supabase JS client, called from `/dashboard` page server component):

```typescript
// apps/web/src/app/dashboard/page.tsx — server component

const { data: connection, error } = await supabase
  .from("discord_connections")
  .select(`
    id,
    status,
    last_heartbeat,
    error_message,
    bot_user_id,
    bot_username,
    guild_id,
    created_at,
    updated_at
  `)
  .eq("tenant_id", tenantId)
  .single();

// Compute effective_status
function getEffectiveStatus(
  status: string,
  lastHeartbeat: string | null
): "connected" | "stale" | "stale_critical" | "connecting" | "disconnected" | "error" {
  if (status !== "connected") return status as any;
  if (!lastHeartbeat) return "stale_critical";

  const ageSecs = (Date.now() - new Date(lastHeartbeat).getTime()) / 1000;
  if (ageSecs >= 600) return "stale_critical";
  if (ageSecs >= 120) return "stale";
  return "connected";
}
```

### 3.4 Real-Time Dashboard Updates

The dashboard subscribes to `discord_connections` changes via Supabase Realtime (client-side) to update the status indicator without page refresh:

```typescript
// apps/web/src/components/dashboard/BotStatusCard.tsx

useEffect(() => {
  const channel = supabase
    .channel(`bot-status-${tenantId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "discord_connections",
        filter: `tenant_id=eq.${tenantId}`,
      },
      (payload) => {
        // payload.new contains the updated row
        setConnection(payload.new as DiscordConnection);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [tenantId, supabase]);
```

**What this achieves:** When the bot writes a heartbeat (every 30s) or changes status (`connecting` → `connected`), the dashboard updates the status dot in real-time without polling or page reload.

---

## 4. Stale Detection Algorithm

### 4.1 Definition

A tenant's bot connection is **stale** when:
- `discord_connections.status = 'connected'` (bot claims to be connected)
- AND `discord_connections.last_heartbeat < NOW() - INTERVAL '120 seconds'`

This means the bot's heartbeat writer has failed to write for at least 4 consecutive cycles (4 × 30s = 120s). Possible causes:
- Bot process crashed (SIGKILL, OOM, hardware failure)
- Fly.io machine is down or unreachable
- Supabase is unreachable from the bot (but DB/web still works fine from the dashboard side)
- Bot process is deadlocked (asyncio event loop stuck)

### 4.2 Stale Does NOT Trigger Reconnection

**Critical design decision:** Stale detection is display-only. The bot DOES NOT poll for its own stale status and reconnect. Reasons:
1. The bot may be stale because Supabase is unreachable — not because the Discord connection dropped. Reconnecting would be wrong.
2. The Discord connection itself may still be alive. Closing and reopening it unnecessarily would disrupt users.
3. Stale is almost always caused by a crashed process. When the process restarts (Fly.io auto-restart), it reconnects automatically.

**What happens instead:**
- Dashboard shows warning to the tenant user
- If stale for > 10 minutes, admin panel flags the tenant for manual review
- Fly.io `[checks]` HTTP health check detects the bot process is down and auto-restarts it (see Section 6)

### 4.3 Manual Reconnection (User-Triggered)

If a tenant sees "stale" and wants to force reconnect, they click **"Force Reconnect"** in the dashboard. This:
1. Sets `discord_connections.status = 'disconnected'`
2. Waits 2 seconds (gives bot time to process the UPDATE event)
3. Sets `discord_connections.status = 'connecting'` (or inserts a new row trigger equivalent)

Actually: it just sets status back to `disconnected` and the bot's UPDATE handler fires which calls `remove_tenant` + `add_tenant`. See [connection-manager.md](./connection-manager.md) Section 7.3.

```typescript
// apps/web/src/app/api/discord/reconnect/route.ts

export async function POST(req: Request) {
  const { tenantId } = await req.json();

  // 1. Verify requesting user is owner of this tenant
  const session = await getSession(req);
  await assertTenantOwner(session.userId, tenantId);

  // 2. Set status to disconnected — triggers bot's UPDATE handler
  const { error } = await supabaseAdmin
    .from("discord_connections")
    .update({
      status: "disconnected",
      error_message: null,
      updated_at: new Date().toISOString(),
    })
    .eq("tenant_id", tenantId);

  if (error) {
    return Response.json({ error: "Failed to trigger reconnect" }, { status: 500 });
  }

  // 3. Return immediately — bot will update status to 'connecting' async
  return Response.json({ success: true });
}
```

---

## 5. Reconnection Strategy (Bot Side)

Reconnection is handled in the supervisor task (defined in [connection-manager.md](./connection-manager.md) Section 4.2). This section documents the exact parameters and retry schedule.

### 5.1 Backoff Parameters

```python
RECONNECT_BASE_DELAY_SECONDS: Final[float] = 5.0    # First retry wait
RECONNECT_MAX_DELAY_SECONDS: Final[float] = 300.0   # Maximum wait (5 minutes)
RECONNECT_MAX_ATTEMPTS: Final[int] = 10             # After this, mark as error
RECONNECT_BACKOFF_MULTIPLIER: Final[float] = 2.0    # Exponential factor
```

### 5.2 Retry Schedule

| Attempt | Delay Before Retry | Cumulative Time |
|---------|--------------------|-----------------|
| 1 | 5s | 5s |
| 2 | 10s | 15s |
| 3 | 20s | 35s |
| 4 | 40s | 75s |
| 5 | 80s | ~2.5 min |
| 6 | 160s | ~5.2 min |
| 7 | 300s (cap) | ~10.2 min |
| 8 | 300s | ~15.2 min |
| 9 | 300s | ~20.2 min |
| 10 | 300s | ~25.2 min |
| (final) | — | status = `error` |

Total time from first disconnect to `error` status: approximately **25 minutes** for transient errors.

### 5.3 Non-Retriable Errors

These errors do NOT retry. The supervisor exits immediately and writes `status = 'error'`:

| Exception | Reason Not Retriable | Error Message Written to DB |
|-----------|---------------------|----------------------------|
| `discord.LoginFailure` | Token is invalid — retrying will always fail | `"Invalid bot token. Update your bot token in Settings → Discord Connection."` |
| `discord.PrivilegedIntentsRequired` | Bot application missing intents — user must fix in Discord Portal | `"Bot is missing required intents. In Discord Developer Portal → Your Bot → Privileged Gateway Intents, enable: MESSAGE CONTENT INTENT, SERVER MEMBERS INTENT."` |
| `discord.Forbidden` (on `on_ready` guild check) | Bot was not invited to the configured guild | `"Bot is not in your Discord server. Invite the bot to your server using the invite link, then reconnect."` |

### 5.4 What Happens After `error` Status

When a tenant reaches `error` status:
1. Bot supervisor task exits (no more retries)
2. `discord_connections.status = 'error'`, `error_message = '...'`
3. Bot's `_tenants` dict removes this tenant's entry
4. Dashboard shows red dot with `error_message` text
5. User must take action (fix their token/intents) before reconnection is attempted

**To retry after error:** User updates their bot token via Settings → Discord Connection → saves new token → website writes new `vault_secret_id` → bot's UPDATE Realtime handler fires → `reconnect_tenant()` is called → new supervisor task starts with fresh retry count.

### 5.5 Recovery After Bot Process Restart

When the bot process restarts (Fly.io restart after crash), it runs `start_all()` which:
1. Queries all tenants where `status != 'disconnected'` (includes `'connected'`, `'connecting'`, `'error'`)
2. Starts supervisor tasks for all of them
3. Error-state tenants are included — they will attempt to reconnect (fresh 10 retries)

This is intentional: if the bot crashed, the previous `error` may have been due to a transient platform issue, not a user misconfiguration. A fresh restart deserves fresh retry attempts.

**Exception:** `discord.LoginFailure` is caught again and immediately marks as `error` without burning through retries.

---

## 6. FastAPI Health Server

The bot runs a FastAPI HTTP server on port `8080` for:
1. Fly.io health check (keeps the machine alive)
2. Admin/monitoring inspection of per-tenant status
3. Internal readiness check (before accepting traffic)

### 6.1 File Location

```
apps/bot/src_v2/entrypoints/discord/health_server.py
```

### 6.2 Full FastAPI App Specification

```python
# apps/bot/src_v2/entrypoints/discord/health_server.py

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn
import asyncio
import uuid
from datetime import datetime, timezone
from typing import Any
from apps.bot.src_v2.entrypoints.discord.tenant_connection_manager import TenantConnectionManager

app = FastAPI(title="Daimon Bot Health Server", docs_url=None, redoc_url=None)

# Global reference set by start_health_server()
_manager: TenantConnectionManager | None = None


class TenantHealthItem(BaseModel):
    tenant_id: str
    status: str                  # 'connected' | 'connecting' | 'disconnected' | 'error'
    reconnect_count: int
    started_at: str              # ISO 8601
    last_heartbeat: str | None   # ISO 8601 or null


class HealthResponse(BaseModel):
    status: str                  # 'healthy' | 'degraded' | 'unhealthy'
    bot_process: str             # 'running'
    total_tenants: int
    connected_tenants: int
    connecting_tenants: int
    error_tenants: int
    disconnected_tenants: int
    uptime_seconds: float
    checked_at: str              # ISO 8601


class TenantListResponse(BaseModel):
    tenants: list[TenantHealthItem]
    total: int


@app.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """
    Fly.io uses this endpoint for health checks.
    Returns HTTP 200 if the bot process is running and Realtime is connected.
    Returns HTTP 503 if the bot is unhealthy (no tenants connected + more than 5 min uptime).

    Fly.io config:
      [checks]
        [checks.alive]
          type = "http"
          port = 8080
          method = "GET"
          path = "/health"
          interval = "30s"
          timeout = "5s"
          grace_period = "10s"
    """
    if _manager is None:
        raise HTTPException(status_code=503, detail="Manager not initialized")

    summary = _manager.get_status()

    # Determine overall health
    connected = summary["connected_tenants"]
    total = summary["total_tenants"]
    uptime = summary["uptime_seconds"]

    if total == 0:
        # No tenants provisioned yet — healthy (new platform)
        overall_status = "healthy"
    elif connected == 0 and uptime > 300:
        # All tenants failing for > 5 minutes — degraded
        overall_status = "degraded"
    else:
        overall_status = "healthy"

    response = HealthResponse(
        status=overall_status,
        bot_process="running",
        total_tenants=total,
        connected_tenants=connected,
        connecting_tenants=summary["connecting_tenants"],
        error_tenants=summary["error_tenants"],
        disconnected_tenants=summary["disconnected_tenants"],
        uptime_seconds=uptime,
        checked_at=datetime.now(timezone.utc).isoformat(),
    )

    # Fly.io only treats HTTP 200 as healthy
    if overall_status == "unhealthy":
        raise HTTPException(status_code=503, detail=response.model_dump())

    return response


@app.get("/health/tenants", response_model=TenantListResponse)
async def list_tenant_health() -> TenantListResponse:
    """
    Returns health status for every active tenant.
    Used by admin panel for monitoring.
    NOT exposed publicly — protected by Fly.io private networking (only internal calls).

    Response shape:
    {
      "tenants": [
        {
          "tenant_id": "uuid",
          "status": "connected",
          "reconnect_count": 0,
          "started_at": "2026-03-13T12:00:00Z",
          "last_heartbeat": "2026-03-13T12:34:56Z"
        },
        ...
      ],
      "total": 42
    }
    """
    if _manager is None:
        raise HTTPException(status_code=503, detail="Manager not initialized")

    tenants = []
    for tenant_id, active in _manager._tenants.items():
        tenants.append(TenantHealthItem(
            tenant_id=str(tenant_id),
            status=_infer_status(active),
            reconnect_count=active.reconnect_count,
            started_at=active.started_at.isoformat(),
            last_heartbeat=active.last_heartbeat.isoformat() if active.last_heartbeat else None,
        ))

    return TenantListResponse(tenants=tenants, total=len(tenants))


@app.get("/health/tenant/{tenant_id}", response_model=TenantHealthItem)
async def get_tenant_health(tenant_id: str) -> TenantHealthItem:
    """
    Returns health status for a single tenant.
    Used by admin panel tenant detail view.
    """
    if _manager is None:
        raise HTTPException(status_code=503, detail="Manager not initialized")

    try:
        tid = uuid.UUID(tenant_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid tenant_id UUID format")

    active = _manager._tenants.get(tid)
    if not active:
        raise HTTPException(status_code=404, detail=f"Tenant {tenant_id} not found in active connections")

    return TenantHealthItem(
        tenant_id=str(tid),
        status=_infer_status(active),
        reconnect_count=active.reconnect_count,
        started_at=active.started_at.isoformat(),
        last_heartbeat=active.last_heartbeat.isoformat() if active.last_heartbeat else None,
    )


def _infer_status(active: "ActiveTenant") -> str:
    """Derive status from asyncio task state since the canonical status is in the DB."""
    if active.task.done():
        return "disconnected"  # Task exited — either error or clean disconnect
    return "running"  # Task is alive — could be connecting or connected (check DB for detail)


async def start_health_server(
    manager: TenantConnectionManager,
    port: int = 8080,
) -> asyncio.Task:
    """
    Starts the FastAPI health server in a background asyncio task.
    Returns the task handle (not awaited — runs until cancellation).

    Args:
        manager: The running TenantConnectionManager
        port: TCP port to listen on (default 8080)

    Returns:
        asyncio.Task wrapping the uvicorn server
    """
    global _manager
    _manager = manager

    config = uvicorn.Config(
        app=app,
        host="0.0.0.0",  # Fly.io private networking requires 0.0.0.0
        port=port,
        loop="asyncio",
        log_level="warning",   # Suppress uvicorn access logs (noise)
        access_log=False,
    )
    server = uvicorn.Server(config)

    return asyncio.create_task(server.serve())
```

### 6.3 HTTP Endpoints Summary

| Method | Path | Auth | Purpose | Response Code |
|--------|------|------|---------|---------------|
| `GET` | `/health` | None (public) | Fly.io health check | `200 OK` (healthy/degraded) or `503` (unhealthy) |
| `GET` | `/health/tenants` | None (Fly.io private network only) | List all tenant statuses | `200 OK` |
| `GET` | `/health/tenant/{tenant_id}` | None (Fly.io private network only) | Single tenant status | `200 OK` or `404` |

**Security note:** `/health/tenants` and `/health/tenant/{id}` are only accessible within Fly.io's private network (`fdaa::/16` IPv6). They are NOT accessible from the public internet. The main `/health` endpoint is public (required for Fly.io health probing).

### 6.4 `get_status()` Implementation in TenantConnectionManager

The health server calls `manager.get_status()` which returns a dict summary:

```python
def get_status(self) -> dict[str, Any]:
    """
    Returns a dict summary of all tenant connection states.
    Called by the health server.
    Thread-safe: reads _tenants dict without lock (dict reads are atomic in CPython).
    """
    total = len(self._tenants)
    connected = sum(
        1 for t in self._tenants.values()
        if not t.task.done()  # Task alive = at least connecting or connected
    )
    done = sum(
        1 for t in self._tenants.values()
        if t.task.done()
    )
    uptime = (datetime.utcnow() - self._started_at).total_seconds()

    return {
        "total_tenants": total,
        "connected_tenants": connected,   # Approximation: tasks still running
        "connecting_tenants": 0,          # Not tracked separately at runtime (DB is authoritative)
        "error_tenants": done,            # Tasks that exited = error or disconnected
        "disconnected_tenants": 0,        # Not tracked separately
        "uptime_seconds": uptime,
        "realtime_connected": self._realtime_connected,  # bool: Supabase Realtime subscription status
    }
```

### 6.5 Fly.io Health Check Configuration

```toml
# fly.toml (apps/bot/fly.toml)

[[services]]
  internal_port = 8080
  protocol = "tcp"

  [[services.tcp_checks]]
    interval = "15s"
    timeout = "2s"
    grace_period = "5s"

  [[services.http_checks]]
    interval = "30s"
    timeout = "5s"
    grace_period = "10s"
    method = "get"
    path = "/health"
    protocol = "http"
    tls_skip_verify = false
```

**Behavior:** If `/health` returns non-200 for 3 consecutive checks (90 seconds), Fly.io marks the machine as unhealthy and restarts it. `grace_period = "10s"` gives the bot time to start before checks begin.

---

## 7. Platform-Level Health (Bot Process Monitoring)

### 7.1 Fly.io Machine Status

The bot runs as a Fly.io Machine in the `daimon-bot` app. Fly.io manages restarts automatically:

| Event | Fly.io Action | Bot Recovery |
|-------|---------------|-------------|
| Process crashes (unhandled exception, OOM, SIGKILL) | Auto-restart within 5 seconds | `start_all()` reconnects all tenants |
| Health check fails 3× | Machine restart | `start_all()` reconnects all tenants |
| Fly.io machine host fails | New machine started in same region | `start_all()` reconnects all tenants |
| Fly.io scheduled restart (deploy) | SIGTERM → 30s grace → SIGKILL | `stop_all()` runs, reconnects on restart |

**Fly.io app configuration (`fly.toml`):**
```toml
[build]
  dockerfile = "apps/bot/Dockerfile"

[env]
  PORT = "8080"

[[vm]]
  memory = "2gb"
  cpu_kind = "shared"
  cpus = 2

[restart]
  policy = "always"        # Always restart crashed machines
  max_retries = 5          # Give up after 5 rapid crashes (prevents crash loop billing)
```

### 7.2 Langfuse Traces for Monitoring

Every Claude API call is traced in Langfuse. The trace includes `tenant_id` as metadata, enabling per-tenant usage monitoring:

```python
# In the Claude call wrapper (apps/bot/src_v2/services/agent_runner.py)

langfuse_handler = CallbackHandler(
    secret_key=system_env.langfuse_secret_key,
    public_key=system_env.langfuse_public_key,
    host=system_env.langfuse_host,
    metadata={
        "tenant_id": str(tool_context.tenant_id),
        "guild_id": tool_context.discord_guild_id,
    },
    session_id=str(message_id),
    user_id=str(discord_user_id),
)
```

**What this enables:** In Langfuse dashboard, filter by `tenant_id` to see per-tenant call volume, latency, errors, and cost. Alerts can be configured in Langfuse for error rate spikes.

### 7.3 Error Logging (stderr)

All bot errors are logged to stderr with structured format. Fly.io captures stderr and makes it available via `fly logs`:

```python
# Logging format used throughout the bot
def log_error(tenant_id: uuid.UUID | None, component: str, message: str, exc: Exception | None = None) -> None:
    entry = {
        "level": "ERROR",
        "component": component,
        "tenant_id": str(tenant_id) if tenant_id else "system",
        "message": message,
        "error": str(exc) if exc else None,
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }
    print(json.dumps(entry), file=sys.stderr, flush=True)
```

**Fly.io logs access:** `fly logs --app daimon-bot` streams live. Can be filtered with grep for specific tenant IDs.

---

## 8. Admin Panel Monitoring

The admin panel (website) has a dedicated health monitoring view. Full page spec is in [../frontend/admin-panel.md](../frontend/admin-panel.md). The data model for this view is:

### 8.1 Admin Health Dashboard Query

```sql
-- Aggregate bot health view used by admin dashboard
SELECT
    t.id AS tenant_id,
    t.name AS tenant_name,
    t.status AS tenant_status,
    dc.status AS connection_status,
    dc.last_heartbeat,
    dc.error_message,
    dc.bot_username,
    EXTRACT(EPOCH FROM (NOW() - dc.last_heartbeat)) AS heartbeat_age_seconds,
    CASE
        WHEN dc.status = 'connected'
             AND dc.last_heartbeat < NOW() - INTERVAL '120 seconds'
        THEN 'stale'
        WHEN dc.status = 'connected'
             AND dc.last_heartbeat < NOW() - INTERVAL '10 minutes'
        THEN 'stale_critical'
        ELSE dc.status
    END AS effective_status
FROM tenants t
LEFT JOIN discord_connections dc ON dc.tenant_id = t.id
WHERE t.status != 'deleted'
ORDER BY
    -- Sort critical issues first
    CASE
        WHEN dc.status = 'error' THEN 0
        WHEN dc.status = 'connected' AND dc.last_heartbeat < NOW() - INTERVAL '10 minutes' THEN 1
        WHEN dc.status = 'connected' AND dc.last_heartbeat < NOW() - INTERVAL '120 seconds' THEN 2
        ELSE 3
    END,
    t.created_at DESC;
```

### 8.2 Admin Alert Thresholds

| Condition | Admin Panel Indicator | Action Available |
|-----------|----------------------|-----------------|
| `effective_status = 'error'` | Red row in tenant list | "Force Reconnect" button |
| `effective_status = 'stale_critical'` | Orange row | "Check Fly.io" link |
| `effective_status = 'stale'` | Yellow row | No action (informational) |
| `tenant_status = 'suspended'` | Grey strikethrough row | "Reactivate" button |
| `reconnect_count ≥ 5` | Warning badge on tenant row | "View Error Log" |

### 8.3 Admin Force Reconnect

From the admin panel, an admin can force-reconnect any tenant:

```typescript
// apps/web/src/app/api/admin/tenants/[tenantId]/reconnect/route.ts

export async function POST(
  req: Request,
  { params }: { params: { tenantId: string } }
) {
  // 1. Verify caller is admin (check users.role = 'admin')
  const session = await getAdminSession(req);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const tenantId = params.tenantId;

  // 2. Update discord_connections status to 'disconnected' — triggers bot Realtime UPDATE handler
  const { error } = await supabaseAdmin
    .from("discord_connections")
    .update({
      status: "disconnected",
      error_message: null,
      updated_at: new Date().toISOString(),
    })
    .eq("tenant_id", tenantId);

  if (error) {
    return Response.json({ error: "Database update failed" }, { status: 500 });
  }

  // 3. Log admin action
  await supabaseAdmin.from("admin_audit_log").insert({
    admin_user_id: session.userId,
    action: "force_reconnect",
    target_tenant_id: tenantId,
    metadata: { reason: "admin_panel_force_reconnect" },
  });

  return Response.json({ success: true, message: "Reconnect triggered" });
}
```

---

## 9. Realtime Subscription Health

The `TenantConnectionManager` tracks whether its Supabase Realtime subscription is active:

```python
# In TenantConnectionManager

self._realtime_connected: bool = False  # Set to True after channel.subscribe() succeeds

async def _subscribe_to_realtime(self) -> None:
    """
    Subscribe to Supabase Realtime channels.
    Sets _realtime_connected = True on success.
    On failure, logs error and retries after 60 seconds.
    """
    while True:
        try:
            channel = self._supabase.channel("tenant-lifecycle")
            # ... event registrations ...
            await channel.subscribe()

            self._realtime_connected = True
            # Subscription active — stay subscribed forever
            # (supabase-py handles reconnection internally)
            break

        except Exception as exc:
            self._realtime_connected = False
            print(
                f"[realtime] ERROR: Failed to subscribe to tenant-lifecycle: {exc}. "
                "Retrying in 60s.",
                file=sys.stderr, flush=True
            )
            await asyncio.sleep(60)
```

**Impact of Realtime disconnection:** If Supabase Realtime goes down:
- Existing tenant connections continue running (Discord WebSocket is independent)
- New tenants added via website will NOT be picked up by bot until Realtime reconnects
- Existing error → reconnect requests will NOT be processed
- Dashboard shows stale status for existing tenants (heartbeats still write if DB is up)

The `_realtime_connected` flag is reported in `/health` endpoint so admins can detect this degraded state.

---

## 10. Summary Table — All Health Data Points

| Data Point | Location | Written By | Read By | Purpose |
|-----------|----------|-----------|---------|---------|
| `discord_connections.status` | Supabase DB | Bot | Website dashboard, admin panel | Current connection state |
| `discord_connections.last_heartbeat` | Supabase DB | Bot (every 30s) | Website dashboard (stale calc) | Liveness indicator |
| `discord_connections.error_message` | Supabase DB | Bot | User-facing error display | Human-readable failure reason |
| `discord_connections.bot_username` | Supabase DB | Bot (on_ready) | Dashboard status card | Show which bot is connected |
| `discord_connections.bot_user_id` | Supabase DB | Bot (on_ready) | Admin panel | Discord user ID lookup |
| `/health` HTTP endpoint | Fly.io bot process | FastAPI | Fly.io health check probe | Machine liveness |
| `/health/tenants` HTTP endpoint | Fly.io bot process | FastAPI | Admin panel API | Per-tenant runtime status |
| Langfuse traces | Langfuse cloud | Bot (each Claude call) | Langfuse dashboard | Usage, errors, cost per tenant |
| Fly.io machine status | Fly.io API | Fly.io | Monitoring alerts | Machine-level health |
| Bot stderr logs | Fly.io logs | Bot | `fly logs` / log aggregator | Debug events |

---

## 11. Constants Reference

All health-monitoring constants are defined in `apps/bot/src_v2/entrypoints/discord/health_monitor.py`:

```python
# Heartbeat
HEARTBEAT_INTERVAL_SECONDS: Final[int] = 30

# Stale detection thresholds (used by frontend, referenced here for consistency)
STALE_WARNING_THRESHOLD_SECONDS: Final[int] = 120   # 4 missed heartbeats
STALE_CRITICAL_THRESHOLD_SECONDS: Final[int] = 600  # ~20 missed heartbeats

# Reconnection backoff
RECONNECT_BASE_DELAY_SECONDS: Final[float] = 5.0
RECONNECT_MAX_DELAY_SECONDS: Final[float] = 300.0
RECONNECT_MAX_ATTEMPTS: Final[int] = 10
RECONNECT_BACKOFF_MULTIPLIER: Final[float] = 2.0

# Health server
HEALTH_SERVER_PORT: Final[int] = 8080

# Startup staggering
STARTUP_STAGGER_MS: Final[int] = 50    # per tenant, every 10 tenants
```

These constants MUST be kept consistent with the frontend queries (which use the same threshold values in SQL `INTERVAL` expressions and TypeScript `getEffectiveStatus()` calculations). If thresholds change, update both the backend constants and the frontend queries.
