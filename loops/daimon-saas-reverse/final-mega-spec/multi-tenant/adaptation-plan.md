# Multi-Tenant Adaptation Plan — Complete Change Manifest

**Aspect:** 8.1.5 — Top-level overview of all bot changes (synthesized from connection-manager, tenant-scoping, byok-key-routing, tenant-isolation)
**Wave:** Wave 8 Gap Remediation
**Written:** 2026-03-13
**References:**
- [connection-manager.md](./connection-manager.md) — Per-tenant Discord client lifecycle, TenantConnectionManager
- [tenant-scoping.md](./tenant-scoping.md) — ToolContext partitioning, plan gates, PLATFORM_ADMIN scope
- [byok-key-routing.md](./byok-key-routing.md) — BYOK key storage, Vault encryption, hot-reload
- [tenant-isolation.md](./tenant-isolation.md) — Shared vs isolated boundaries, service role trust model
- [health-monitoring.md](./health-monitoring.md) — Status state machine, heartbeat, stale detection
- [realtime-contract.md](./realtime-contract.md) — 4 Realtime channels, payload shapes
- [database/schema.md](../database/schema.md) — New SaaS tables
- [deployment/environment.md](../deployment/environment.md) — All env vars

---

## 1. Executive Summary

Decision Orchestrator is currently a **single-tenant bot**: one Python process, one Discord bot token, one Anthropic API key, hardcoded in environment variables. To become a multi-tenant SaaS platform, the bot must:

1. **Manage N Discord connections** — one per active tenant, started dynamically, not at process startup
2. **Route API keys per tenant** — each tenant's Anthropic (and optionally OpenAI) key is their own (BYOK)
3. **Scope all operations to the current tenant** — DB writes, tool execution, conversation context
4. **Gate tools by plan** — free / starter / pro tiers with enforced feature limits
5. **Restrict platform-admin tools** — LinkedIn, Google Analytics, Dub.co locked to PyMC's own tenant
6. **Report health per tenant** — heartbeat + status written to `discord_connections` table
7. **Hot-reload credentials** — when a tenant updates their key, bot reloads without restart

The architecture remains **shared infrastructure** — one Python process, one Supabase project, one Fly.io app. Multi-tenancy is **logical**, not physical.

---

## 2. Architecture Before and After

### 2.1 Single-Tenant Architecture (Current)

```
Environment Variables at startup:
  DISCORD_BOT_TOKEN=<one token>
  DISCORD_GUILD_ID=<one guild>
  ANTHROPIC_API_KEY=<one key>
  (+ all other service keys)
         ↓
bootstrap/config.py:
  ToolContext = frozen dataclass (all env vars)
         ↓
entrypoints/discord/main.py:
  discord.Client(intents=intents)
  discord_client.run(DISCORD_BOT_TOKEN)  ← blocking call
         ↓
entrypoints/discord/bot.py:
  @client.event on_message(message)
  → build UserContext (DB lookup)
  → ToolRegistry.call_tool(name, params, user_context)
         ↓
mcp/registry.py: ToolRegistry
  - One instance, registered at startup
  - 90 tools available to all messages
  - anthropic_api_key = platform's key
```

### 2.2 Multi-Tenant Architecture (Target)

```
Environment Variables at startup (platform-level only):
  SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
  FLY_API_TOKEN, FLY_ORG_SLUG
  ONYX_API_KEY, ONYX_BASE_URL
  TOGGL_WORKSPACE_ID, TOGGL_ORGANIZATION_ID
  LINKEDIN_*  (admin-only, gated)
  GA_*  (admin-only, gated)
  PLATFORM_ADMIN_TENANT_ID, PLATFORM_ADMIN_GUILD_ID
  LANGFUSE_*
         ↓
entrypoints/discord/main.py (new async entry point):
  SystemEnv.from_env()
  TenantConnectionManager(supabase, session_factory, system_env)
  await manager.start_all()           ← loads all tenants from DB
  await manager._subscribe_to_realtime()
  await start_health_server(manager)
  await asyncio.Event().wait()        ← run forever
         ↓
For each active tenant:
  TenantConnectionManager.add_tenant(TenantConfig)
    → Decrypt discord_token from Vault
    → Decrypt anthropic_api_key from Vault
    → Build TenantConfig (per-tenant frozen dataclass)
    → Build ToolContext (per-tenant — discord_token, anthropic_api_key injected)
    → Build ToolRegistry (per-tenant — with plan gates, admin flags)
    → asyncio.create_task(tenant_supervisor(config, tool_context))
         ↓
Per tenant asyncio Task:
  discord.Client(intents=intents)
  Register on_message_for_tenant(message, config, tool_context)
  await client.start(discord_token)  ← non-blocking (asyncio task)
         ↓
on_message_for_tenant(message):
  → Guild ID check (defense-in-depth)
  → Build UserContext(tenant_id=config.tenant_id, ...)
  → tenant_registries[tenant_id].call_tool(name, params, user_context)
         ↓
ToolRegistry (per-tenant instance):
  - tenant's own ToolContext
  - plan gates: PLAN_STARTER, PLAN_PRO checked before dispatch
  - admin gates: PLATFORM_ADMIN checked before dispatch
  - anthropic_api_key = tenant's BYOK key → routes to tenant's Fly sessions
```

---

## 3. Complete File Change Manifest

Every file that must be created or modified. Organized by change type.

### 3.1 NEW Files (Create from scratch)

| File Path | Purpose | Detailed Spec |
|-----------|---------|---------------|
| `apps/bot/src_v2/entrypoints/discord/tenant_connection_manager.py` | `TenantConnectionManager` class — manages N Discord connections, Realtime subscriptions, heartbeat | [connection-manager.md](./connection-manager.md) §3 |
| `apps/bot/src_v2/entrypoints/discord/health_server.py` | FastAPI health server (`/health`, `/health/tenants`) on port 8080 | [health-monitoring.md](./health-monitoring.md) §6 |
| `apps/bot/src_v2/bootstrap/tenant_config.py` | `TenantConfig` dataclass, `SystemConfig` namedtuple | [connection-manager.md](./connection-manager.md) §3.1; [tenant-scoping.md](./tenant-scoping.md) §2.2 |
| `apps/bot/src_v2/bootstrap/context_builder.py` | `build_tenant_tool_context()` function | [tenant-isolation.md](./tenant-isolation.md) §2.4; [byok-key-routing.md](./byok-key-routing.md) §3.3 |

### 3.2 MODIFIED Files (Change existing files)

| File Path | What Changes | Detailed Spec |
|-----------|-------------|---------------|
| `apps/bot/src_v2/entrypoints/discord/main.py` | **Complete replacement** — remove blocking `discord.run()`, implement async multi-tenant entry point with `TenantConnectionManager` + asyncio | [connection-manager.md](./connection-manager.md) §13 |
| `apps/bot/src_v2/entrypoints/discord/bot.py` | Add `on_message_for_tenant()` function that receives `config: TenantConfig` and `tool_context: ToolContext`; existing `on_message` becomes unused (kept for reference) | [connection-manager.md](./connection-manager.md) §6 |
| `apps/bot/src_v2/bootstrap/config.py` | Add `SystemEnv` frozen dataclass; keep existing `ToolContext` unchanged; deprecate `ToolContext.from_env()` factory | [connection-manager.md](./connection-manager.md) §12 |
| `apps/bot/src_v2/mcp/context.py` | Add `tenant_id: uuid.UUID` field to `UserContext` dataclass | [tenant-scoping.md](./tenant-scoping.md) §4.2 |
| `apps/bot/src_v2/mcp/tags.py` | Add `Scope.PLATFORM_ADMIN`, `Scope.PLAN_STARTER`, `Scope.PLAN_PRO` to `Scope` StrEnum | [tenant-scoping.md](./tenant-scoping.md) §3.1, §5.1 |
| `apps/bot/src_v2/mcp/registry.py` | Add plan gate logic and admin gate logic in `call_tool()`; add `tenant_plan: str` and `is_platform_admin: bool` params to `ToolRegistry.__init__()` | [tenant-scoping.md](./tenant-scoping.md) §3.2, §5.2 |
| `apps/bot/src_v2/mcp/catalog.py` | Add `Scope.PLATFORM_ADMIN` to LinkedIn, GA, Dub tools; add `Scope.PLAN_STARTER` to Fly, Onyx, GitHub, Toggl tools; add `Scope.PLAN_PRO` to Linear, Bluedot, ACP, DecisionHub tools; add `tenant_plan` + `is_platform_admin` params to `create_tool_registry()` | [tenant-scoping.md](./tenant-scoping.md) §3.2, §5.3–5.4 |

### 3.3 Supabase Database Changes (New Tables + Migrations)

| Object | Type | Purpose | Detailed Spec |
|--------|------|---------|---------------|
| `tenants` | NEW TABLE | One row per SaaS tenant — name, slug, plan, status | [database/schema.md](../database/schema.md) |
| `tenant_members` | NEW TABLE | Users that belong to a tenant — role (owner/admin/member) | [database/schema.md](../database/schema.md) |
| `discord_connections` | NEW TABLE | Per-tenant bot token (Vault ref), guild ID, status, heartbeat | [database/schema.md](../database/schema.md) |
| `tenant_api_keys` | NEW TABLE | Per-tenant Anthropic/OpenAI keys (Vault encrypted, key_hint only) | [database/schema.md](../database/schema.md) |
| `tenant_service_connections` | NEW TABLE | Per-tenant OAuth/API-key service connections (GitHub, Linear, Toggl, etc.) | [database/schema.md](../database/schema.md) |
| `tenant_subscriptions` | NEW TABLE | Stripe subscription state — plan, status, Stripe IDs | [database/schema.md](../database/schema.md) |
| `stripe_webhook_events` | NEW TABLE | Idempotency store for processed Stripe webhook events | [database/schema.md](../database/schema.md) |
| RLS policies | 13 policies | One per table operation (SELECT/INSERT/UPDATE/DELETE) per new table | [database/rls-policies.md](../database/rls-policies.md) |
| `update_updated_at` trigger | TRIGGER (new instances) | Auto-updates `updated_at` on all new tables | [database/triggers.md](../database/triggers.md) |
| `sync_tenant_plan` trigger | NEW TRIGGER | Copies `tenant_subscriptions.plan` → `tenants.plan` on UPDATE | [database/triggers.md](../database/triggers.md) |
| `get_decrypted_secret(UUID)` | NEW FUNCTION | SECURITY DEFINER function for bot to decrypt Vault secrets | [database/vault-encryption.md](../database/vault-encryption.md) |

### 3.4 New Next.js API Routes (Website Side)

| Route | Method | Purpose | Detailed Spec |
|-------|--------|---------|---------------|
| `/api/discord/validate-token` | POST | Validate a Discord bot token before saving | [api/routes.md](../api/routes.md) |
| `/api/discord/connections` | GET, POST | List or create Discord connections | [api/routes.md](../api/routes.md) |
| `/api/discord/connections/[id]` | PUT, DELETE | Update or delete a Discord connection | [api/routes.md](../api/routes.md) |
| `/api/keys/validate-anthropic` | POST | Validate Anthropic API key (test API call) | [api/routes.md](../api/routes.md); [byok-key-routing.md](./byok-key-routing.md) §5.1 |
| `/api/keys/validate-openai` | POST | Validate OpenAI API key (test API call) | [api/routes.md](../api/routes.md); [byok-key-routing.md](./byok-key-routing.md) §5.2 |
| `/api/billing/checkout` | POST | Create Stripe Checkout Session | [api/routes.md](../api/routes.md) |
| `/api/billing/portal` | POST | Create Stripe Customer Portal session | [api/routes.md](../api/routes.md) |
| `/api/webhooks/stripe` | POST | Stripe webhook handler (idempotent) | [api/routes.md](../api/routes.md); [integrations/stripe.md](../integrations/stripe.md) |
| `/api/oauth/[service]/start` | GET | Initiate OAuth for GitHub/Google/Linear | [api/routes.md](../api/routes.md) |
| `/api/oauth/[service]/callback` | GET | Handle OAuth callback, store tokens | [api/routes.md](../api/routes.md) |
| `/api/admin/tenants` | GET | Admin: list all tenants | [api/routes.md](../api/routes.md) |
| `/api/admin/tenants/[id]` | GET, PUT | Admin: tenant detail + update | [api/routes.md](../api/routes.md) |
| `/api/admin/impersonate` | POST | Admin: create impersonation session | [api/routes.md](../api/routes.md) |

### 3.5 New Supabase Edge Functions

| Function Name | Purpose | Detailed Spec |
|--------------|---------|---------------|
| `store-tenant-api-key` | Store API key in Vault + upsert `tenant_api_keys` row (requires service role) | [byok-key-routing.md](./byok-key-routing.md) §6.1 |
| `store-discord-token` | Store Discord bot token in Vault + upsert `discord_connections` row (requires service role) | [database/vault-encryption.md](../database/vault-encryption.md) |

### 3.6 New Fly.io Configuration

| Change | What | Detailed Spec |
|--------|------|---------------|
| `fly.toml` — remove `DISCORD_BOT_TOKEN` / `DISCORD_GUILD_ID` / `ANTHROPIC_API_KEY` from `[env]` section | These are now per-tenant in DB, not env vars | [deployment/environment.md](../deployment/environment.md) |
| `fly.toml` — add `PLATFORM_ADMIN_TENANT_ID` / `PLATFORM_ADMIN_GUILD_ID` to `[env]` section | Needed to identify PyMC's tenant | [tenant-isolation.md](./tenant-isolation.md) §8.1 |
| Health check configuration — `[http_service.checks]` targeting `/health` on port 8080 | FastAPI health server replaces any existing health check | [health-monitoring.md](./health-monitoring.md) §6 |
| SQLAlchemy pool_size increase: from default (5) to 10 + overflow 20 | Support N concurrent tenants with short-lived DB sessions | [connection-manager.md](./connection-manager.md) §15 |

---

## 4. Change Categories: Additive vs Breaking

### 4.1 Additive Changes (Safe to Deploy Alongside Existing Code)

These changes add new code or tables without removing or altering existing functionality. They can be merged without coordination.

| Change | Why Additive |
|--------|-------------|
| New database tables (`tenants`, `tenant_members`, `discord_connections`, `tenant_api_keys`, `tenant_service_connections`, `tenant_subscriptions`, `stripe_webhook_events`) | Tables added; existing tables unchanged |
| New RLS policies on new tables | Only affects new tables; existing tables' RLS unchanged |
| `get_decrypted_secret()` Postgres function | New function; no existing code changed |
| `Scope.PLATFORM_ADMIN`, `Scope.PLAN_STARTER`, `Scope.PLAN_PRO` added to `tags.py` | New enum values; existing values unchanged |
| `tenant_id: uuid.UUID` field added to `UserContext` | Additive field with `= uuid.uuid4()` default? No — see §4.2 |
| New files: `tenant_connection_manager.py`, `health_server.py`, `tenant_config.py`, `context_builder.py` | New files; no existing files changed |

### 4.2 Breaking Changes (Require Coordination)

These changes modify interfaces that existing code depends on. They must be deployed atomically with any code that depends on the new interface.

| Change | Why Breaking | Coordination Required |
|--------|-------------|----------------------|
| `UserContext` gains `tenant_id` field | All callers of `UserContext(...)` must pass `tenant_id`; existing single-tenant code passes nothing | Update all call sites simultaneously; `tenant_id` defaults to sentinel value (zero UUID) in transition |
| `create_tool_registry()` gains `tenant_plan` + `is_platform_admin` params | Existing call sites do not pass these; they get free-plan behavior by default | Add defaults: `tenant_plan='pro'`, `is_platform_admin=True` for the single-tenant entry point (during migration) |
| `entrypoints/discord/main.py` — complete replacement | Old blocking `discord.run()` entry point is removed | New multi-tenant main is the only entry point after deployment |
| `DISCORD_BOT_TOKEN` / `DISCORD_GUILD_ID` / `ANTHROPIC_API_KEY` removed from env vars | If any code reads these directly from `os.environ`, it will break | Audit all `os.environ` reads; replace with `TenantConfig` fields |
| `ToolContext.from_env()` factory — deprecated | Code that constructs `ToolContext` from env vars must migrate to `TenantConfig` + `build_tenant_tool_context()` | Deprecate but keep `from_env()` during transition; log warning if called |

### 4.3 Planned Breaking Changes Deferred to Phase 2

| Change | Why Deferred |
|--------|-------------|
| Remove LinkedIn/GA/Dub tools from catalog entirely for SaaS tenants | Currently gated by scope; removal requires catalog refactor. Phase 1 uses scope gate only. |
| Per-tenant Onyx instance (separate knowledge base per tenant) | Phase 2 feature; currently all tenants share PyMC's Onyx. |
| Per-tenant Toggl workspace | Phase 2; currently all tenants share PyMC's Toggl workspace via platform-level credentials. |

---

## 5. Migration Strategy

The bot migration happens in **3 phases**. Each phase is independently deployable.

### Phase 0: Database Migrations (Zero Downtime)

Run all new table migrations. No bot code changes. The new tables exist but are empty.

```sql
-- Phase 0 migration order (see database/migrations.md for full SQL)
1. CREATE TABLE tenants
2. CREATE TABLE tenant_members
3. CREATE TABLE discord_connections
4. CREATE TABLE tenant_api_keys
5. CREATE TABLE tenant_service_connections
6. CREATE TABLE tenant_subscriptions
7. CREATE TABLE stripe_webhook_events
8. CREATE FUNCTION get_decrypted_secret
9. CREATE RLS policies for all new tables
10. CREATE triggers (update_updated_at, sync_tenant_plan)
```

**After Phase 0:** Deploy the Next.js website. Users can sign up, configure Discord tokens, add API keys, set up billing. The website writes to the new tables. The bot still uses the old single-tenant code — it ignores the new tables.

**Seed the PyMC admin tenant:**
```sql
-- Insert PyMC as a tenant (the platform-admin tenant)
INSERT INTO tenants (id, name, slug, plan, status)
VALUES ('PLATFORM_ADMIN_TENANT_ID_UUID', 'PyMC', 'pymc', 'pro', 'active');

INSERT INTO tenant_members (tenant_id, user_id, role)
VALUES ('PLATFORM_ADMIN_TENANT_ID_UUID', '<PYMC_USER_AUTH_ID>', 'owner');
```

### Phase 1: Additive Bot Changes (Zero Downtime)

Deploy new files only — `TenantConnectionManager`, `TenantConfig`, `context_builder.py`. These are imported but not yet used by `main.py`. The old single-tenant entry point continues to run.

1. Add `Scope.PLATFORM_ADMIN`, `Scope.PLAN_STARTER`, `Scope.PLAN_PRO` to `tags.py`
2. Add `tenant_id` field to `UserContext` (with fallback default = `PLATFORM_ADMIN_TENANT_ID` for backward compat)
3. Add `tenant_plan` + `is_platform_admin` params to `create_tool_registry()` with defaults
4. Deploy. Existing single-tenant code continues to work — new params use defaults.

### Phase 2: Multi-Tenant Entry Point (Requires Restart)

Replace `entrypoints/discord/main.py` with the new multi-tenant async entry point. Bot restarts; during restart (~10-30s) the single PyMC guild is briefly offline.

**Deployment checklist:**
1. Remove `DISCORD_BOT_TOKEN`, `DISCORD_GUILD_ID`, `ANTHROPIC_API_KEY` from `fly.toml [env]`
2. Add `PLATFORM_ADMIN_TENANT_ID`, `PLATFORM_ADMIN_GUILD_ID` to `fly.toml [env]`
3. Ensure PyMC tenant exists in `tenants` table (from Phase 0 seed)
4. Ensure PyMC's Discord token is stored in `discord_connections` for the PyMC tenant
5. Ensure PyMC's Anthropic key is stored in `tenant_api_keys` for the PyMC tenant
6. Deploy new `main.py`
7. Bot starts, loads PyMC tenant from DB, connects to PyMC's Discord guild
8. New tenants are now onboarded dynamically via Realtime

---

## 6. Realtime Channels (Bot Subscriptions)

The bot subscribes to 4 Supabase Realtime channels at startup. See [realtime-contract.md](./realtime-contract.md) for complete payload shapes.

| Channel Name | Table | Events | Purpose |
|-------------|-------|--------|---------|
| `tenant-lifecycle` | `discord_connections` | INSERT, UPDATE | New tenant connects; existing tenant updates token or disconnects |
| `tenant-api-keys` | `tenant_api_keys` | INSERT, UPDATE | Tenant adds/replaces Anthropic or OpenAI key → hot-reload |
| `tenant-service-connections` | `tenant_service_connections` | INSERT, UPDATE, DELETE | Tenant connects/disconnects a service → refresh ToolRegistry |
| `tenant-status-changes` | `tenants` | UPDATE | Tenant suspended or reactivated by admin |

---

## 7. ToolContext Field Partitioning Summary

Fields in `ToolContext` are now one of four categories. See [tenant-scoping.md](./tenant-scoping.md) §2.1 for full details.

### Category A: Per-Tenant (Different for every tenant)

| Field | Source |
|-------|--------|
| `discord_token` | `discord_connections.vault_secret_id` (Vault decrypt) |
| `discord_guild_id` | `discord_connections.guild_id` |
| `anthropic_api_key` | `tenant_api_keys` WHERE `provider='anthropic'` (Vault decrypt) |

### Category B: Per-Tenant Optional (Empty string if not connected)

| Field | Source |
|-------|--------|
| `linear_api_key` | `tenant_service_connections` WHERE `service='linear'` (Vault decrypt) |
| `linear_team_id` | `tenant_service_connections.metadata->>'linear_team_id'` |
| `openai_api_key` | `tenant_api_keys` WHERE `provider='openai'` (Vault decrypt) — optional BYOK |

### Category C: Platform-Level (Same for all tenants — from env vars)

| Field | Env Var |
|-------|---------|
| `fly_api_token` | `FLY_API_TOKEN` |
| `fly_org_slug` | `FLY_ORG_SLUG` |
| `onyx_api_key` | `ONYX_API_KEY` |
| `onyx_base_url` | `ONYX_BASE_URL` |
| `toggl_workspace_id` | `TOGGL_WORKSPACE_ID` |
| `toggl_organization_id` | `TOGGL_ORGANIZATION_ID` |
| `supabase_url` | `SUPABASE_URL` |
| `supabase_service_role_key` | `SUPABASE_SERVICE_ROLE_KEY` |

### Category D: Platform-Admin Only (Empty string for non-admin tenants — defense-in-depth)

| Field | Env Var | Tools Requiring It |
|-------|---------|-------------------|
| `linkedin_community_token` | `LINKEDIN_COMMUNITY_TOKEN` | `linkedin_post_update`, `linkedin_list_posts`, `linkedin_get_follower_stats` |
| `linkedin_ads_token` | `LINKEDIN_ADS_TOKEN` | `linkedin_get_ad_performance`, `linkedin_get_ad_campaigns` |
| `linkedin_org_id` | `LINKEDIN_ORG_ID` | All LinkedIn tools |
| `ga_service_account_json` | `GA_SERVICE_ACCOUNT_JSON` | `google_analytics_run_report` |
| `ga_property_id` | `GA_PROPERTY_ID` | All GA tools |
| `dub_api_key` | `DUB_API_KEY` | `dub_list_links`, `dub_get_analytics` |

---

## 8. Tool Scope Gate Summary

Three new scope gates added to `ToolRegistry.call_tool()`, checked in this order:

```
1. Tool exists?             → ToolNotFoundError
2. Scope.PLATFORM_ADMIN?    → ToolError("Platform admin only") if not admin tenant
3. Scope.PLAN_PRO?          → ToolError("Requires Pro plan") if plan != 'pro'
4. Scope.PLAN_STARTER?      → ToolError("Requires Starter or Pro plan") if plan == 'free'
5. requires_credential?     → ToolError("Requires connected <service>") if credential missing
6. Scope.TOGGL_WORKSPACE_ADMIN? → ToolError if not toggl admin (existing gate)
```

### Tools by Scope

| Scope Required | Tools |
|---------------|-------|
| `Scope.PLATFORM_ADMIN` | `linkedin_post_update`, `linkedin_list_posts`, `linkedin_get_follower_stats`, `linkedin_get_ad_performance`, `linkedin_get_ad_campaigns`, `google_analytics_run_report`, `dub_list_links`, `dub_get_analytics` |
| `Scope.PLAN_STARTER` | All `fly_*` tools (9 tools), all `onyx_*` tools (2 tools), `github_run_gh` (1 tool), all `toggl_*` tools (34 tools) |
| `Scope.PLAN_PRO` | All `linear_*` tools (6 remote MCP tools), all `bluedot_*` tools (4 tools), all `acp_*` tools (4 tools), all `decision_hub_*` tools (4 tools) |
| None (Free plan) | All `discord_*` tools (7 tools), `dub_create_link` (1 tool — available free), `credentials_list` (1 tool), `health_check`, agent conversation |

---

## 9. New Data Structures Summary

### 9.1 TenantConfig (Per-Tenant Frozen Dataclass)

```python
@dataclass(frozen=True)
class TenantConfig:
    tenant_id: uuid.UUID              # tenants.id
    tenant_name: str                   # tenants.name
    discord_token: str                 # Vault-decrypted from discord_connections
    guild_id: str                      # discord_connections.guild_id
    anthropic_api_key: str             # Vault-decrypted from tenant_api_keys
    openai_api_key: str | None         # Optional — Vault-decrypted from tenant_api_keys
    linear_api_key: str | None         # Optional — Vault-decrypted from tenant_service_connections
    linear_team_id: str | None         # From tenant_service_connections.metadata
    plan: str                          # 'free' | 'starter' | 'pro'
    is_platform_admin: bool            # True only for PLATFORM_ADMIN_TENANT_ID
    discord_connection_id: uuid.UUID   # discord_connections.id (for heartbeat writes)
```

### 9.2 SystemConfig (Platform-Level Frozen Dataclass)

```python
@dataclass(frozen=True)
class SystemConfig:
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
    ga_service_account_json: str
    ga_property_id: str
    dub_api_key: str
    platform_admin_tenant_id: uuid.UUID   # Identifies PyMC's tenant
    platform_admin_guild_id: str          # Identifies PyMC's guild
    langfuse_secret_key: str
    langfuse_public_key: str
    langfuse_host: str = "https://cloud.langfuse.com"
```

### 9.3 ActiveTenant (Runtime State)

```python
@dataclass
class ActiveTenant:
    tenant_id: uuid.UUID
    config: TenantConfig               # Current config (mutable for hot-reload)
    client: discord.Client             # The discord.Client for this tenant
    task: asyncio.Task                 # The supervisor asyncio Task
    heartbeat_task: asyncio.Task       # The heartbeat writer asyncio Task
    tool_context: ToolContext          # Current ToolContext (mutable for hot-reload)
    tool_registry: ToolRegistry        # Current ToolRegistry (mutable for hot-reload)
    started_at: datetime
    reconnect_count: int = 0
```

### 9.4 UserContext (Modified)

```python
@dataclass(frozen=True)
class UserContext:
    user_id: uuid.UUID | None
    discord_id: str
    tenant_id: uuid.UUID                                   # NEW FIELD
    credentials: dict[CredentialPlatform, str]
    credential_metadata: dict[CredentialPlatform, dict]
    conversation_id: str = ""
    impersonating_user_id: uuid.UUID | None = None
```

---

## 10. Error Handling Matrix

| Error Scenario | Bot Response | DB State Written | User-Visible (Dashboard) |
|---------------|-------------|-----------------|--------------------------|
| Invalid Discord bot token (`discord.LoginFailure`) | Supervisor exits without retry | `status='error'`, `error_message='Invalid bot token...'` | Red dot + "Invalid bot token: update in Settings" |
| Missing privileged intents (`discord.PrivilegedIntentsRequired`) | Supervisor exits without retry | `status='error'`, `error_message='Missing intents...'` | Red dot + detailed instructions for Discord Developer Portal |
| Discord WebSocket transient disconnect | Supervisor retries with exp backoff (5s/10s/20s/.../300s max) | `status='connecting'`, `error_message='Reconnecting (attempt N/10)...'` | Spinner + "Reconnecting..." |
| Max reconnect attempts (10) exceeded | Supervisor exits | `status='error'`, `error_message='Connection failed after 10 attempts...'` | Red dot + last error message |
| No Anthropic API key configured | Skip tenant at startup or on INSERT Realtime event | `status='error'`, `error_message='No Anthropic API key configured...'` | Red dot + "Add your key in Settings → API Keys" |
| Anthropic key invalid at Fly session launch (401) | Update `tenant_api_keys.status='invalid'`, disconnect tenant | `status='error'` on discord_connections; `status='invalid'` on tenant_api_keys | Orange banner: "Your Anthropic API key appears invalid" |
| Vault decrypt failure | Skip tenant at startup | `status='error'`, `error_message='Failed to decrypt credentials...'` | Red dot + "Contact support" |
| Bot kicked from guild (`on_guild_remove`) | Supervisor exits cleanly | `status='disconnected'` | Grey dot + "Bot was removed from your Discord server" |
| Supabase heartbeat write fails | Log and continue (non-fatal) | `last_heartbeat` goes stale (no write) | Dashboard shows 'stale' after 120s |
| Tenant suspended by admin (Realtime `tenants` UPDATE) | `remove_tenant(tenant_id)` | `status='disconnected'` | Dashboard shows suspended state |
| Tenant reactivated by admin | `add_tenant(tenant_config)` | `status='connecting'` then `'connected'` | Normal reconnect flow |
| Tenant updates bot token (Realtime `discord_connections` UPDATE) | `reconnect_tenant(tenant_id)` — disconnect + reconnect | `status='connecting'` during reconnect | Spinner during reconnect |
| Tenant updates API key (Realtime `tenant_api_keys` UPDATE) | Hot-reload key in `TenantConfig` + `ToolContext` + `ToolRegistry` | No status change | Dashboard shows new key hint immediately |
| Service connection updated (Realtime `tenant_service_connections` UPDATE) | `refresh_tenant_context(tenant_id)` — rebuild ToolRegistry | No status change | Dashboard shows updated connection state |
| Tenant not in guild (bot token valid, but not in their guild) | `on_ready` check: `guild = client.get_guild(int(config.guild_id)); if not guild:` → exit | `status='error'`, `error_message='Bot is not in the configured guild...'` | Red dot + "Invite your bot to your server" |

---

## 11. Health Monitoring Summary

### 11.1 Per-Tenant Heartbeat

- Bot writes `last_heartbeat` to `discord_connections` every **30 seconds** per connected tenant
- Frontend computes `effective_status`: if `status='connected'` AND `last_heartbeat > 120s old` → `'stale'`
- `stale` is never stored in DB — always computed at query time

### 11.2 FastAPI Health Endpoint

The bot runs a FastAPI server on port 8080 (used by Fly.io health checks):

```
GET /health
Response: { "status": "ok", "active_tenants": N, "uptime_seconds": M }

GET /health/tenants
Response: [
    { "tenant_id": "...", "status": "connected", "reconnect_count": 0 },
    ...
]
```

### 11.3 Stale Tenant Detection

A background coroutine in `TenantConnectionManager` checks every 60 seconds for tasks that have exited without updating their status:

```python
async def _stale_task_monitor(self) -> None:
    """Every 60s: check for completed asyncio Tasks that didn't clean up their DB status."""
    while True:
        await asyncio.sleep(60)
        for tenant_id, active in list(self._tenants.items()):
            if active.task.done() and not active.task.cancelled():
                # Task exited — check if it left status as 'connecting'
                if exception := active.task.exception():
                    await self._write_status(
                        active.config.discord_connection_id,
                        status="error",
                        error_message=f"Unexpected exit: {str(exception)[:200]}"
                    )
                del self._tenants[tenant_id]
```

---

## 12. Concurrency Model

| Aspect | Mechanism | Limit |
|--------|----------|-------|
| Concurrent tenant connections | One `asyncio.Task` per tenant (Discord client runner + heartbeat writer) | 500 tenants per bot process |
| asyncio event loop | Single-threaded; all tenant tasks share one loop | No per-tenant threading |
| DB connection pool | SQLAlchemy `pool_size=10`, `max_overflow=20` | 30 max concurrent DB connections |
| Startup stagger | Add tenant task every 50ms for groups of 10 (prevents thundering herd) | 500 tenants start in ~2.5s |
| Realtime subscriptions | 4 channels, all on one WebSocket connection | Handled by Supabase Realtime client |
| Hot-reload safety | Python dict assignment is atomic (CPython GIL) | No lock needed for ToolRegistry swap |
| Per-tenant crash isolation | `_safe_supervisor()` wraps each task; exceptions do not propagate | One crash never affects other tenants |

---

## 13. Testing Requirements

Each of the following must have an integration test before Phase 2 deployment:

| Scenario | Test Type | What to Assert |
|---------|-----------|----------------|
| Add tenant with valid token + valid Anthropic key | Integration | `discord_connections.status = 'connected'` within 10s |
| Add tenant with invalid Discord token | Integration | `discord_connections.status = 'error'`, `error_message` contains "Invalid bot token" |
| Add tenant with missing Anthropic key | Integration | `discord_connections.status = 'error'`, error mentions API key |
| Update Anthropic key via Realtime | Integration | `TenantConnectionManager._tenant_registries[tenant_id].tool_context.anthropic_api_key` = new key |
| Message from wrong guild silently ignored | Unit | `on_message_for_tenant` returns early without DB write |
| PLATFORM_ADMIN tool called by non-admin | Unit | `call_tool()` raises `ToolError("Platform admin only")` |
| PLAN_STARTER tool called by free-plan tenant | Unit | `call_tool()` raises `ToolError("Requires Starter or Pro plan")` |
| Supervisor crashes for tenant A | Integration | Tenant B's connection unaffected; Tenant A's status = 'error' |
| Max reconnect exceeded | Integration | `discord_connections.status = 'error'` after 10 failed attempts |
| Graceful shutdown (SIGTERM) | Integration | `manager.stop_all()` completes; all tasks cancelled; no status written |
| Stale heartbeat detection | Unit | `effective_status` query returns `'stale'` when `last_heartbeat > 120s` |

---

## 14. Cross-References

| Topic | Detailed Spec |
|-------|---------------|
| TenantConnectionManager class API | [connection-manager.md](./connection-manager.md) §3.2 |
| Per-tenant supervisor task with backoff | [connection-manager.md](./connection-manager.md) §4.2 |
| ToolContext field partitioning | [tenant-scoping.md](./tenant-scoping.md) §2.1 |
| Plan gate implementation | [tenant-scoping.md](./tenant-scoping.md) §5.2 |
| BYOK key validation (website) | [byok-key-routing.md](./byok-key-routing.md) §5 |
| BYOK hot-reload (bot) | [byok-key-routing.md](./byok-key-routing.md) §7 |
| Shared vs isolated boundaries | [tenant-isolation.md](./tenant-isolation.md) §1 |
| Platform-admin tenant identity | [tenant-isolation.md](./tenant-isolation.md) §8 |
| Status state machine | [health-monitoring.md](./health-monitoring.md) §2 |
| FastAPI health endpoint spec | [health-monitoring.md](./health-monitoring.md) §6 |
| Realtime channel names + payloads | [realtime-contract.md](./realtime-contract.md) |
| Database table schemas | [../database/schema.md](../database/schema.md) |
| RLS policies (exact SQL) | [../database/rls-policies.md](../database/rls-policies.md) |
| Database triggers | [../database/triggers.md](../database/triggers.md) |
| Vault encryption setup | [../database/vault-encryption.md](../database/vault-encryption.md) |
| All env vars | [../deployment/environment.md](../deployment/environment.md) |
| All API routes | [../api/routes.md](../api/routes.md) |
| Premium tier feature gating | [../premium/features-by-tier.md](../premium/features-by-tier.md) |
