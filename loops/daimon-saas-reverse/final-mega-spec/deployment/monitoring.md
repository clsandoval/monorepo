# Monitoring & Alerting — Daimon SaaS

> Aspect: 6.3 — Health checks, error tracking, Langfuse integration, alert thresholds
> Written: 2026-03-13
> Related: [infrastructure.md](./infrastructure.md), [environment.md](./environment.md), [ci-cd.md](./ci-cd.md), [multi-tenant/health-monitoring.md](../multi-tenant/health-monitoring.md)

---

## Overview

Daimon monitoring spans three components:

| Component | Tool | What It Monitors |
|-----------|------|-----------------|
| **Next.js website** (Vercel) | Vercel Analytics + Sentry (optional) | Page performance, JS errors, API route errors |
| **Python bot** (Fly.io) | Fly.io native metrics + Langfuse + custom `/health` endpoint | Process health, per-tenant connection status, Claude trace observability |
| **Database** (Supabase) | Supabase Dashboard + pg_cron heartbeat cleanup | Query performance, table bloat, auth events |

**No paid third-party alerting platform is required for v1.** Alerts are delivered via:
1. Fly.io → email alerts on machine restarts/failures
2. GitHub Actions → email on failed deploy workflows
3. A Supabase Edge Function cron job → Discord DM alert for stale tenant connections
4. Vercel → email on deployment failures

---

## Section 1: Bot Health Endpoint (`/health`)

### 1.1 FastAPI Route Definition

The bot exposes a FastAPI app on `HEALTH_PORT` (default: `8080`). The `/health` route is the sole public endpoint.

```python
# apps/bot/src_v2/entrypoints/discord/main.py (FastAPI section)
from fastapi import FastAPI
from fastapi.responses import JSONResponse
import time

app = FastAPI(title="Daimon Bot Health", docs_url=None, redoc_url=None)

_bot_start_time = time.time()

@app.get("/health")
async def health() -> JSONResponse:
    """
    Fly.io health check endpoint. Called every 10 seconds by Fly.io.
    Returns 200 if the bot process is running and event loop is alive.
    Returns 503 if the process is shutting down.
    """
    return JSONResponse(
        status_code=200,
        content={
            "status": "ok",
            "uptime_seconds": int(time.time() - _bot_start_time),
        }
    )
```

### 1.2 What `/health` Does and Does NOT Check

**Does check:**
- The FastAPI event loop is alive (implicit — if the event loop died, the HTTP server wouldn't respond)
- The bot process is running (Fly.io only routes to this if the process is up)

**Does NOT check:**
- Discord WebSocket connectivity (that's tracked per-tenant in `discord_connections`)
- Database connectivity (checked at startup; crash on failure)
- Number of active tenant connections

**Rationale:** A `/health` endpoint that checks Discord connectivity would fail if Discord has a partial outage, causing Fly.io to restart the bot unnecessarily. The bot process itself is healthy even if Discord is temporarily unreachable; per-tenant disconnections are tracked separately in Supabase.

### 1.3 Fly.io Health Check Configuration

In `fly.toml`:

```toml
[[services]]
  internal_port = 8080
  protocol = "tcp"

  [[services.http_checks]]
    interval = "10s"           # Check every 10 seconds
    timeout = "5s"             # Fail if no response in 5 seconds
    grace_period = "30s"       # Allow 30 seconds on startup before checks begin
    method = "GET"
    path = "/health"
    protocol = "http"

  [[services.tcp_checks]]
    interval = "10s"
    timeout = "2s"
    grace_period = "30s"
```

**Failure behavior:** If `/health` returns non-200 or times out 3 consecutive times:
1. Fly.io marks the machine as unhealthy
2. Fly.io sends an email notification to the Fly.io org admin
3. Fly.io attempts an automatic machine restart (if `restart_policy = "always"` in `fly.toml`)

---

## Section 2: Fly.io Machine Monitoring

### 2.1 Machine Configuration for Monitoring

In `fly.toml`:

```toml
[machine]
  restart_policy = "always"           # Always restart on crash
  kill_signal = "SIGTERM"
  kill_timeout = 30                   # 30s graceful shutdown window

[metrics]
  port = 9091                         # Fly.io Prometheus scrape port (built-in)
  path = "/metrics"                   # Standard Prometheus path
```

### 2.2 Fly.io Built-In Metrics (No Extra Config Required)

Fly.io automatically collects and exposes these metrics via its Prometheus endpoint:

| Metric | Description | Alert Threshold |
|--------|-------------|-----------------|
| `fly_instance_up` | Machine is up and passing health checks | < 1 for > 2 minutes → ALERT |
| `fly_machine_restarts` | Count of machine restarts | > 3 in 10 minutes → ALERT |
| `fly_instance_memory_mem_total` | Total memory (bytes) | — (reference) |
| `fly_instance_memory_mem_available` | Available memory (bytes) | < 50MB → WARNING |
| `fly_instance_cpu_usage_user` | User-space CPU % | > 90% for > 5 minutes → WARNING |
| `fly_net_bytes_in` | Network bytes received | — (reference) |
| `fly_net_bytes_out` | Network bytes sent | — (reference) |

### 2.3 Viewing Fly.io Metrics

```bash
# View machine status
fly status --app daimon-bot

# View recent logs (last 100 lines)
fly logs --app daimon-bot -n 100

# View machine restarts
fly machine list --app daimon-bot

# SSH into the machine for live debugging
fly ssh console --app daimon-bot
```

### 2.4 Fly.io Email Alerts (Built-In)

Fly.io sends email alerts to the org admin for:
- Machine health check failures (3 consecutive failures)
- Machine restarts (automatic)
- Deployment failures

No configuration required — alerts go to the email used for the Fly.io account.

---

## Section 3: Langfuse Observability Integration

### 3.1 What Langfuse Tracks

Langfuse is the primary observability tool for Claude Agent SDK usage. Every message processed by the bot results in a Langfuse trace.

| Trace Field | Value | Purpose |
|-------------|-------|---------|
| `trace.name` | `"message_handler"` | Groups all bot traces |
| `trace.user_id` | Discord user ID (string) | Per-user filtering |
| `trace.session_id` | `conversation_id` (channel or thread ID) | Conversation continuity |
| `trace.tags` | `["tenant_id:{uuid}", "guild_id:{id}", "deploy_env:{env}"]` | Per-tenant filtering |
| `trace.metadata.tenant_id` | UUID of the tenant | Tenant-level analytics |
| `trace.metadata.guild_id` | Discord guild ID (string) | Guild-level analytics |
| `trace.metadata.channel_id` | Discord channel ID (string) | Channel-level filtering |
| `trace.metadata.conversation_type` | `"thread"` or `"channel"` | Conversation type |
| `trace.input` | User's message content | Input for evaluation |
| `trace.output` | Claude's final response | Output for evaluation |

### 3.2 Langfuse Span Structure Per Request

Each trace contains these spans in order:

```
trace: message_handler
├── span: routing_decision              (is this a DM, channel, or thread?)
├── span: system_prompt_build           (construct system prompt for Claude)
├── span: claude_agent_run              (Claude Agent SDK execution)
│   ├── generation: claude_response     (the actual Claude API call)
│   │   ├── tool_call: discord_tools/send_message (if used)
│   │   ├── tool_call: toggl_time_entries/list (if used)
│   │   └── ... (all tool calls as sub-spans)
│   └── span: tool_dispatch             (ToolRegistry.call_tool)
└── span: discord_response_send         (sending response back to Discord)
```

### 3.3 Langfuse Client Initialization (Bot Side)

```python
# apps/bot/src_v2/bootstrap/langfuse_client.py
from langfuse import Langfuse

def create_langfuse_client(settings: LangfuseSettings, deploy_environment: str) -> Langfuse:
    """
    Creates and returns a Langfuse client instance.
    Returns a no-op client if keys are not set (development/testing).
    """
    if not settings.public_key or not settings.secret_key:
        # Return a no-op client that logs nothing
        # This allows the bot to run without Langfuse in development
        return Langfuse.__new__(Langfuse)  # Uninitialized — all methods are no-ops

    return Langfuse(
        public_key=settings.public_key,
        secret_key=settings.secret_key,
        host=settings.host,
        release=deploy_environment,      # "production" or "preview"
        enabled=True,
        flush_at=15,                      # Flush after 15 items
        flush_interval=60,                # Or every 60 seconds, whichever comes first
    )
```

### 3.4 Langfuse Dashboard Setup (One-Time Configuration)

**Step 1: Create Langfuse account**
- Go to https://cloud.langfuse.com
- Create account with work email
- Create project named `"daimon-production"`

**Step 2: Get API keys**
- Langfuse Dashboard → Project → Settings → API Keys
- Copy `Public Key` → `LANGFUSE_PUBLIC_KEY`
- Copy `Secret Key` → `LANGFUSE_SECRET_KEY`
- Set both as Fly.io secrets (see [environment.md](./environment.md) Section 2.4)

**Step 3: Configure dashboards in Langfuse**

Create these saved views in Langfuse Dashboard → Traces:

| View Name | Filter | Purpose |
|-----------|--------|---------|
| All Traces | (none) | Overview of all bot activity |
| By Tenant | `tags = tenant_id:{uuid}` | Per-tenant trace audit |
| Errors Only | `status = ERROR` | Error monitoring |
| High Latency | `latency > 30s` | Performance issues |
| Tool Usage | `spans.name CONTAINS tool_call` | Which tools are used |

**Step 4: Set up Langfuse alerts (optional)**
- Langfuse Dashboard → Alerts → Create Alert
- Alert name: `"High Error Rate"`
- Condition: Error rate > 5% over last 1 hour
- Delivery: Email to admin

### 3.5 Multi-Tenant Langfuse Filtering

Because all tenants share one Langfuse project, use these tags to filter:

```
tags = tenant_id:550e8400-e29b-41d4-a716-446655440000
```

This allows:
- Viewing all traces for a specific tenant (for debugging)
- Comparing error rates across tenants
- Auditing which tools a specific tenant uses most

**Data isolation note:** Langfuse does NOT enforce tenant data isolation — all traces are visible to the Langfuse project owner (the platform admin). Tenant users do NOT have access to Langfuse. Trace data in Langfuse is considered platform-internal observability data, not user-facing.

### 3.6 What the Admin Panel Shows from Langfuse

The admin panel does NOT query Langfuse directly. Instead:
- Bot writes aggregate metrics (messages processed, errors) to Supabase `discord_connections.messages_processed` and `discord_connections.error_count` columns
- Admin panel reads from Supabase
- Langfuse is for raw trace investigation by platform operators only

---

## Section 4: Website Monitoring (Vercel + Next.js)

### 4.1 Vercel Built-In Analytics

Vercel automatically provides:
- Deployment status and build logs
- Edge network metrics (requests, bandwidth, latency by region)
- Serverless function invocation counts and duration
- Cold start frequency

Access: Vercel Dashboard → Project → Analytics

### 4.2 Next.js Error Handling and Logging

All API routes use structured error logging via `console.error`. Vercel captures these in its log drains.

```typescript
// apps/web/src/lib/logger.ts
export function logError(context: string, error: unknown, metadata?: Record<string, unknown>) {
  console.error(JSON.stringify({
    level: 'error',
    context,
    error: error instanceof Error ? {
      message: error.message,
      stack: error.stack,
      name: error.name,
    } : String(error),
    metadata,
    timestamp: new Date().toISOString(),
  }))
}

export function logInfo(context: string, message: string, metadata?: Record<string, unknown>) {
  console.log(JSON.stringify({
    level: 'info',
    context,
    message,
    metadata,
    timestamp: new Date().toISOString(),
  }))
}
```

### 4.3 API Route Error Logging Pattern

Every API route logs errors before returning:

```typescript
// Example: apps/web/src/app/api/tenants/route.ts
import { logError } from '@/lib/logger'

export async function POST(request: Request) {
  try {
    // ... route logic
  } catch (error) {
    logError('api/tenants/POST', error, {
      path: '/api/tenants',
      method: 'POST',
    })
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

### 4.4 Vercel Log Drain (Optional — for Persistent Logs)

By default, Vercel logs are retained for 1 hour on the free plan, 7 days on Pro. For longer retention, configure a log drain:

1. Vercel Dashboard → Project → Settings → Log Drains
2. Add drain URL (e.g., a Supabase Edge Function URL or a Logtail endpoint)
3. Select: `Static`, `Edge`, `Serverless` log sources
4. Format: `ndjson`

If using Supabase as a log sink (cheapest option for v1):

```typescript
// supabase/functions/log-drain/index.ts
// Receives Vercel log drain POST requests, stores in 'platform_logs' table
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

Deno.serve(async (req) => {
  const logs = await req.json()  // Array of Vercel log entries
  await supabase.from('platform_logs').insert(
    logs.map((log: any) => ({
      source: 'vercel',
      level: log.level || 'info',
      message: log.message,
      metadata: log,
      created_at: new Date(log.timestamp).toISOString(),
    }))
  )
  return new Response('ok')
})
```

### 4.5 Optional: Sentry Integration

If error tracking beyond Vercel logs is needed, add Sentry:

```bash
# Install
npm install @sentry/nextjs

# Initialize (Sentry wizard auto-generates this)
# apps/web/sentry.client.config.ts
# apps/web/sentry.server.config.ts
# apps/web/sentry.edge.config.ts
```

```typescript
// apps/web/sentry.client.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,        // Sample 10% of requests for performance
  environment: process.env.NEXT_PUBLIC_DEPLOY_ENV || 'development',
  enabled: process.env.NODE_ENV === 'production',
})
```

**Sentry env vars (optional — only if Sentry is enabled):**

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_SENTRY_DSN` | NO | Sentry Data Source Name. From Sentry Dashboard → Project → Settings → Client Keys. | `https://abc123@o1234.ingest.sentry.io/456` |
| `SENTRY_AUTH_TOKEN` | NO | For uploading source maps to Sentry during builds. From Sentry Dashboard → Settings → Auth Tokens. | `sntrys_...` |
| `SENTRY_ORG` | NO | Your Sentry organization slug. From Sentry Dashboard → Settings → Organization. | `pymc` |
| `SENTRY_PROJECT` | NO | Your Sentry project slug. | `daimon-web` |

**v1 decision:** Sentry is optional. Start without it. Add if Vercel logs prove insufficient for debugging.

---

## Section 5: Database Monitoring (Supabase)

### 5.1 Supabase Built-In Monitoring

Supabase Dashboard provides:

| Section | URL | What To Watch |
|---------|-----|---------------|
| Database → Performance | `/project/{ref}/database/performance` | Slow queries, index usage |
| Database → Tables | `/project/{ref}/database/tables` | Row counts, table sizes |
| Auth → Users | `/project/{ref}/auth/users` | Sign-up rate, active users |
| Storage → Buckets | `/project/{ref}/storage/buckets` | N/A for v1 (no file uploads) |
| Functions → Logs | `/project/{ref}/functions` | Edge Function errors |
| Reports | `/project/{ref}/reports` | API requests, database connections |

### 5.2 Key Queries to Check Manually (Weekly)

Run in Supabase Dashboard → SQL Editor:

```sql
-- 1. Stale tenant connections (> 10 minutes since heartbeat, status = connected)
SELECT
    dc.tenant_id,
    t.name AS tenant_name,
    dc.status,
    dc.last_heartbeat,
    NOW() - dc.last_heartbeat AS time_since_heartbeat
FROM discord_connections dc
JOIN tenants t ON dc.tenant_id = t.id
WHERE dc.status = 'connected'
  AND dc.last_heartbeat < NOW() - INTERVAL '10 minutes'
ORDER BY time_since_heartbeat DESC;

-- 2. Tenants in error state
SELECT
    dc.tenant_id,
    t.name AS tenant_name,
    dc.error_message,
    dc.updated_at
FROM discord_connections dc
JOIN tenants t ON dc.tenant_id = t.id
WHERE dc.status = 'error'
ORDER BY dc.updated_at DESC;

-- 3. Active tenant count
SELECT
    status,
    COUNT(*) AS count
FROM discord_connections
GROUP BY status
ORDER BY count DESC;

-- 4. Recent subscription changes (last 7 days)
SELECT
    ts.tenant_id,
    t.name,
    ts.plan,
    ts.status,
    ts.updated_at
FROM tenant_subscriptions ts
JOIN tenants t ON ts.tenant_id = t.id
WHERE ts.updated_at > NOW() - INTERVAL '7 days'
ORDER BY ts.updated_at DESC;

-- 5. Table sizes (check monthly for unexpected growth)
SELECT
    relname AS table_name,
    pg_size_pretty(pg_total_relation_size(relid)) AS total_size,
    pg_size_pretty(pg_relation_size(relid)) AS table_size,
    pg_size_pretty(pg_total_relation_size(relid) - pg_relation_size(relid)) AS index_size
FROM pg_catalog.pg_statio_user_tables
ORDER BY pg_total_relation_size(relid) DESC
LIMIT 20;
```

### 5.3 Automated Stale Connection Alerting

An automated cron job in Supabase Edge Functions sends a Discord DM alert when connections are critically stale.

**Step 1: Create Edge Function**

```typescript
// supabase/functions/stale-connection-alert/index.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

const DISCORD_WEBHOOK_URL = Deno.env.get('ADMIN_DISCORD_WEBHOOK_URL')!
const STALE_CRITICAL_MINUTES = 10  // Alert if > 10 minutes since heartbeat

Deno.serve(async (_req) => {
  // Find critically stale connections
  const { data: staleConnections, error } = await supabase
    .from('discord_connections')
    .select(`
      tenant_id,
      status,
      last_heartbeat,
      tenants!inner(name)
    `)
    .eq('status', 'connected')
    .lt('last_heartbeat', new Date(Date.now() - STALE_CRITICAL_MINUTES * 60 * 1000).toISOString())

  if (error) {
    console.error('Failed to query stale connections:', error)
    return new Response('error', { status: 500 })
  }

  if (!staleConnections || staleConnections.length === 0) {
    return new Response('ok — no stale connections')
  }

  // Send Discord webhook alert
  const embed = {
    title: `⚠️ ${staleConnections.length} stale bot connection(s)`,
    color: 0xFF6B00,  // Orange
    fields: staleConnections.map(conn => ({
      name: (conn.tenants as any).name,
      value: `Last heartbeat: ${conn.last_heartbeat}\nTenant ID: ${conn.tenant_id}`,
      inline: false,
    })),
    timestamp: new Date().toISOString(),
  }

  await fetch(DISCORD_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ embeds: [embed] }),
  })

  return new Response(`ok — alerted ${staleConnections.length} stale connections`)
})
```

**Step 2: Schedule with pg_cron**

```sql
-- Run every 5 minutes
SELECT cron.schedule(
    'stale-connection-alert',
    '*/5 * * * *',
    $$
    SELECT net.http_post(
        url := 'https://{project_ref}.supabase.co/functions/v1/stale-connection-alert',
        headers := '{"Authorization": "Bearer {anon_key}", "Content-Type": "application/json"}'::jsonb,
        body := '{}'::jsonb
    );
    $$
);
```

Replace `{project_ref}` with your Supabase project reference and `{anon_key}` with the anon key.

**Step 3: Set Edge Function environment variable**

In Supabase Dashboard → Project → Settings → Edge Functions → Environment Variables:

| Variable | Value |
|----------|-------|
| `ADMIN_DISCORD_WEBHOOK_URL` | Discord webhook URL for an admin-only channel. Create at: Discord Server → Channel Settings → Integrations → Webhooks → New Webhook. |

### 5.4 Supabase Connection Pool Monitoring

```sql
-- Check current connection pool usage
SELECT
    count(*) AS total_connections,
    count(*) FILTER (WHERE state = 'active') AS active,
    count(*) FILTER (WHERE state = 'idle') AS idle,
    count(*) FILTER (WHERE state = 'idle in transaction') AS idle_in_transaction
FROM pg_stat_activity
WHERE datname = current_database();
```

Expected: Total connections < 90% of pool limit. Supabase Pro supports up to 60 direct connections; with PgBouncer, effectively unlimited. The bot uses `NullPool` (no persistent connections), so connections are only held during query execution.

---

## Section 6: Alert Thresholds — Complete Reference

### 6.1 Critical Alerts (Require Immediate Action — < 15 Minutes)

| Alert | Threshold | Signal Source | Action |
|-------|-----------|---------------|--------|
| Bot process down | `/health` returns non-200 for > 2 minutes | Fly.io health check | Check Fly.io logs, SSH in, investigate crash |
| Bot machine restarted > 3x in 10 minutes | 3+ restarts | Fly.io email alert | Check logs for crash loop, may indicate OOM or crash bug |
| Database unreachable | Supabase status page or all bot queries failing | Supabase status page | Check https://status.supabase.com, wait for resolution |
| Stripe webhook failures | 5+ webhook delivery failures in 1 hour | Stripe Dashboard → Webhooks → delivery logs | Check webhook handler logs, verify signature secret |

### 6.2 Warning Alerts (Investigate Within 1 Hour)

| Alert | Threshold | Signal Source | Action |
|-------|-----------|---------------|--------|
| Stale tenant connections | Any connection with `last_heartbeat > 10 minutes` and `status = connected` | Supabase Edge Function cron alert (Discord DM) | Check Langfuse for tenant activity, contact tenant if needed |
| High error rate in Langfuse | Error rate > 5% over 1 hour | Langfuse dashboard | Check trace errors, identify failing tool or bad input pattern |
| Elevated Claude latency | P95 latency > 60s over 1 hour | Langfuse trace latency | Check Anthropic status, may be upstream |
| Memory pressure on bot machine | Available memory < 50MB | Fly.io metrics | Review tenant count, consider scaling up machine |
| New tenant signups with no Discord connection after 24 hours | Any tenant with `created_at > 24h ago` and no `discord_connections` row | Weekly Supabase query | Check if onboarding is confusing; reach out to tenant |

### 6.3 Informational Alerts (Review Weekly)

| Alert | Threshold | Signal Source | Action |
|-------|-----------|---------------|--------|
| Tenants in `error` status | Any row in `discord_connections` where `status = error` | Weekly Supabase query | Review `error_message`, contact tenant if needed |
| High API key validation failures | > 10 failures for a tenant in 1 day | Langfuse traces with tool errors | May indicate revoked key; contact tenant |
| Approaching Supabase row limits | Any table > 1M rows | Monthly Supabase query | Plan archival or partitioning strategy |
| Long-running transactions | Any transaction > 30 seconds | Supabase performance dashboard | Investigate `pg_stat_activity`, terminate if stuck |

---

## Section 7: Incident Response Runbook

### 7.1 Bot Process Not Responding

**Symptoms:** Fly.io health check failures, tenants reporting bot is offline.

**Steps:**
1. Check Fly.io status: `fly status --app daimon-bot`
2. View recent logs: `fly logs --app daimon-bot -n 200`
3. Check if machine restarted: `fly machine list --app daimon-bot`
4. If machine is running but `/health` fails, SSH in: `fly ssh console --app daimon-bot`
5. Inside machine: `ps aux | grep python` to verify process is running
6. If process crashed: check Python exception in logs
7. If OOM: `cat /proc/meminfo` inside machine. Consider upgrading to `shared-cpu-2x` with 512MB.
8. If crash loop: `fly deploy --app daimon-bot` to redeploy from last known-good image

**Rollback:**
```bash
# List recent deployments
fly releases --app daimon-bot

# Roll back to previous release
fly deploy --image registry.fly.io/daimon-bot:{previous-image-hash} --app daimon-bot
```

### 7.2 Tenant Connections All Showing Stale

**Symptoms:** All tenants show stale in dashboard, heartbeats not updating.

**Steps:**
1. Check if bot process is alive: `fly status --app daimon-bot`
2. Check database connectivity from bot: `fly ssh console --app daimon-bot` → `python -c "import psycopg2; psycopg2.connect('...')"`
3. Check Supabase status: https://status.supabase.com
4. Check if `HEARTBEAT_INTERVAL_SECONDS` env var is set correctly
5. Check Langfuse for recent traces — if traces are flowing, bot is alive but heartbeat writes are failing

**Most likely causes:**
- Database password rotated (SUPABASE_SERVICE_ROLE_KEY changed) → Update `fly secrets set SUPABASE_SERVICE_ROLE_KEY=...`
- Supabase temporary outage → Wait and monitor
- Heartbeat code bug after deploy → Roll back bot deploy

### 7.3 Stripe Webhooks Not Processing

**Symptoms:** Subscriptions not updating after payment, Stripe Dashboard shows delivery failures.

**Steps:**
1. Stripe Dashboard → Developers → Webhooks → Select endpoint → Event logs
2. Look for failed deliveries — click to see response body
3. Check Vercel function logs for the webhook route (`/api/webhooks/stripe`)
4. Verify `STRIPE_WEBHOOK_SECRET` env var is set correctly in Vercel
5. Test webhook manually: Stripe Dashboard → Webhooks → Send test event

**Signature verification failure:** `STRIPE_WEBHOOK_SECRET` must be the Webhook Signing Secret from Stripe Dashboard → Webhooks → [endpoint] → Signing secret. NOT the regular Stripe API key.

### 7.4 Database Migration Failure

**Symptoms:** GitHub Actions `daimon-db-migrate` workflow failed.

**Steps:**
1. Check workflow logs for specific SQL error
2. Connect to Supabase via `psql`: `psql "postgresql://postgres:{password}@db.{project_ref}.supabase.co:5432/postgres"`
3. Check current migration state: `SELECT version FROM schema_migrations ORDER BY version DESC LIMIT 5;`
4. If migration partially applied: manually roll back the partial changes, then fix the migration SQL
5. Re-run with corrected migration

**Never run `DROP TABLE` or `DELETE FROM` migration on production without a recent backup.**

---

## Section 8: Monitoring Checklist (Daily / Weekly)

### 8.1 Daily (< 5 Minutes)

- [ ] Check Fly.io machine status: `fly status --app daimon-bot`
- [ ] Glance at Langfuse error rate for last 24h
- [ ] Check Vercel deployment status for any failed deploys
- [ ] Review Discord DM for stale-connection alerts from the cron job

### 8.2 Weekly (< 30 Minutes)

- [ ] Run stale connections query (Section 5.2, Query 1)
- [ ] Run error state tenants query (Section 5.2, Query 2)
- [ ] Check Langfuse for unusual tool error patterns
- [ ] Review Stripe Dashboard for any failed payments or webhook failures
- [ ] Review Supabase performance dashboard for slow queries
- [ ] Check active tenant count (Section 5.2, Query 3)

### 8.3 Monthly (< 1 Hour)

- [ ] Run table sizes query (Section 5.2, Query 5)
- [ ] Review Fly.io monthly resource usage
- [ ] Review Supabase monthly database size and API usage
- [ ] Review Stripe monthly revenue report
- [ ] Check Langfuse storage usage (free tier: 50K traces/month)
- [ ] Update this monitoring runbook if new alert patterns were discovered

---

## Section 9: Langfuse Free Tier Limits

Langfuse Cloud free tier limits:

| Limit | Free Tier | Action When Approaching |
|-------|-----------|------------------------|
| Traces per month | 50,000 | Upgrade to Langfuse Pro ($39/mo) or reduce `flush_at` to batch fewer traces |
| Data retention | 30 days | Export important traces before they expire, or upgrade |
| Team members | 2 | Add only essential team members |
| Projects | 3 | Use 1 project (daimon-production) to stay within limit |

**When to upgrade Langfuse:**
- Approaching 40K traces/month (80% of limit)
- Need > 30-day trace retention for compliance
- Need more than 2 team members with Langfuse access
