# Tenant Isolation Boundaries

**Aspect:** 2.6 — What's shared (code, infra) vs isolated (tokens, keys, data)
**Wave:** Wave 2 — Multi-Tenant Adaptation
**Written:** 2026-03-13
**References:**
- [connection-manager.md](./connection-manager.md) — Per-tenant Discord client, TenantConnectionManager
- [tenant-scoping.md](./tenant-scoping.md) — ToolContext partitioning, UserContext, plan gates
- [byok-key-routing.md](./byok-key-routing.md) — BYOK key storage, Vault encryption, hot-reload
- [realtime-contract.md](./realtime-contract.md) — 4 Realtime channels, event routing
- [health-monitoring.md](./health-monitoring.md) — Per-tenant status, stale detection
- [database/schema.md](../database/schema.md) — All table schemas
- [source/existing-schema.md](../source/existing-schema.md) — Current single-tenant tables

---

## 1. Isolation Model Overview

Daimon uses **logical multi-tenancy** — shared physical infrastructure with per-tenant data, credential, and context isolation. There is no per-tenant Fly.io Machine, no per-tenant Supabase project, and no per-tenant process. Everything runs in one bot process on Fly.io, one Supabase project, one Next.js deployment on Vercel.

### 1.1 Isolation Principle Summary

| Dimension | Isolation Type | Mechanism |
|-----------|---------------|-----------|
| Discord connection | **Strong physical** | Per-tenant `discord.Client` with its own WebSocket and bot token |
| Discord guild | **Strong logical** | Guild ID check in `on_message` — messages from other guilds silently dropped |
| Anthropic API key | **Strong logical** | Per-tenant BYOK key in `TenantConfig.anthropic_api_key`; injected into Fly sessions |
| OpenAI API key | **Strong logical** | Optional per-tenant BYOK key, same pattern as Anthropic |
| Claude conversation context | **Strong logical** | Per-channel conversation history; no cross-tenant context sharing |
| Supabase database rows | **Strong logical + RLS** | tenant_id scoping in all new SaaS tables; RLS enforced for website client |
| Supabase RLS (website) | **Strong** | Anon/user JWT cannot read other tenants' rows |
| Supabase (bot) | **Trust boundary** | Bot uses service role key — bypasses RLS; bot enforces tenant scoping in application code |
| Tool execution | **Strong logical** | Per-tenant `ToolRegistry`; platform-admin tools gated by guild ID check |
| Platform infrastructure | **Shared** | Fly.io org, Supabase project, Vercel deployment — not isolated per tenant |
| Platform credentials | **Shared (by design)** | Fly API token, Onyx key, Toggl workspace, etc. — same for all tenants |
| Platform-admin tools | **Restricted to PyMC tenant** | `Scope.PLATFORM_ADMIN` gate; LinkedIn/GA/Dub locked to platform guild ID |
| Langfuse observability | **Strong logical** | `tenant_id` tag on every trace; traces queryable per tenant |
| Rate limits (Anthropic) | **Strong isolation** | Each tenant's key has its own Anthropic rate limits; no shared quota |
| Rate limits (Discord) | **Partial isolation** | Each bot token has its own Discord rate limits; but all tokens share one Fly.io IP |
| Failure isolation | **Strong** | One tenant's supervisor task crashing does not affect other tenants' tasks |
| Memory | **Weak** | All tenant contexts live in the same Python process; no per-tenant memory limit |

---

## 2. What Is Shared Across All Tenants

### 2.1 Code

The entire Decision Orchestrator Python codebase runs once as a single process. All tenants share:

| Shared Component | Description |
|-----------------|-------------|
| `apps/bot/src_v2/` | Entire bot codebase — handlers, tools, registry, auth, DB layer |
| Python interpreter + runtime | One CPython process, one GIL |
| asyncio event loop | All tenant tasks (Discord clients + heartbeat writers) share one event loop |
| `TenantConnectionManager` | One instance manages all N tenant connections |
| Tool handler functions | The 90+ tool handlers are loaded once; called per-tenant with per-tenant contexts |
| SQLAlchemy session factory | One connection pool shared across all tenants' DB calls |
| Supabase client | One Supabase service role client shared across all tenants |

### 2.2 Infrastructure

| Shared Resource | Detail |
|----------------|--------|
| Fly.io application | `pymc-decision-orchestrator` app runs one Machine (or 2 for HA); all tenants run here |
| Fly.io org | `pymc` org account; all Fly session Machines launched in this org |
| Supabase project | One Supabase project; all tenants' data lives in same PostgreSQL cluster |
| Vercel project | One Next.js deployment for the Daimon website |
| Stripe account | One Stripe account; per-customer `Customer` objects but shared account |
| Langfuse project | One Langfuse project; traces tagged by `tenant_id` |
| Fly.io IP address | All Discord WebSocket connections originate from the same egress IP |

### 2.3 Platform-Level Credentials (Same for All Tenants)

These env vars are set on the Fly.io Machine and are identical for every tenant's `ToolContext`. See [source/existing-bot-architecture.md](../source/existing-bot-architecture.md) for origin.

| Env Var | ToolContext Field | Usage |
|---------|------------------|-------|
| `SUPABASE_URL` | `supabase_url` | Supabase project URL for all DB operations |
| `SUPABASE_SERVICE_ROLE_KEY` | `supabase_service_role_key` | Service role; bypasses RLS; same for all tenants |
| `FLY_API_TOKEN` | `fly_api_token` | Fly Machines API; launches session Machines in PyMC's org |
| `FLY_ORG_SLUG` | `fly_org_slug` | `pymc` — same org for all tenant sessions |
| `ONYX_API_KEY` | `onyx_api_key` | PyMC's Onyx RAG instance |
| `ONYX_BASE_URL` | `onyx_base_url` | Same Onyx instance URL for all tenants |
| `TOGGL_WORKSPACE_ID` | `toggl_workspace_id` | PyMC's Toggl workspace |
| `TOGGL_ORGANIZATION_ID` | `toggl_organization_id` | PyMC's Toggl org |
| `LANGFUSE_SECRET_KEY` | (not in ToolContext — used in SystemEnv) | Traces for all tenants go to same Langfuse project |
| `LANGFUSE_PUBLIC_KEY` | (not in ToolContext — used in SystemEnv) | Same |
| `LANGFUSE_HOST` | (not in ToolContext) | `https://cloud.langfuse.com` |

### 2.4 Platform-Admin-Only Credentials (Shared but Gated)

These credentials are populated in all tenants' `ToolContext` structs (they come from platform env vars), but access is blocked by the `Scope.PLATFORM_ADMIN` gate in `ToolRegistry.call_tool()`. Tools that use these credentials will raise `ToolError` for any non-admin tenant.

| Env Var | ToolContext Field | Gate |
|---------|------------------|------|
| `LINKEDIN_COMMUNITY_TOKEN` | `linkedin_community_token` | `Scope.PLATFORM_ADMIN` |
| `LINKEDIN_ADS_TOKEN` | `linkedin_ads_token` | `Scope.PLATFORM_ADMIN` |
| `LINKEDIN_ORG_ID` | `linkedin_org_id` | `Scope.PLATFORM_ADMIN` |
| `GA_SERVICE_ACCOUNT_JSON` | `ga_service_account_json` | `Scope.PLATFORM_ADMIN` |
| `GA_PROPERTY_ID` | `ga_property_id` | `Scope.PLATFORM_ADMIN` |
| `DUB_API_KEY` | `dub_api_key` | `Scope.PLATFORM_ADMIN` |

**Security note:** The credentials ARE present in the TenantConfig for non-admin tenants (loaded from env vars). The isolation is enforced only in the `ToolRegistry.call_tool()` gate, not at the data layer. This is acceptable because the tool handlers cannot be invoked without going through `call_tool()` — there is no other path to execute tool logic.

**If this is a concern:** A hardening option is to pass empty strings for these fields in non-admin tenants' `build_tenant_tool_context()` calls. This provides defense-in-depth if a bug bypasses the scope gate. Decision: implement the empty-string approach for defense-in-depth.

**Hardened implementation:**
```python
def build_tenant_tool_context(
    tenant_config: TenantConfig,
    system_config: SystemConfig,
) -> ToolContext:
    is_admin = tenant_config.is_platform_admin

    return ToolContext(
        # Per-tenant
        discord_token=tenant_config.discord_token,
        discord_guild_id=tenant_config.guild_id,
        anthropic_api_key=tenant_config.anthropic_api_key,

        # Platform-level (shared)
        fly_api_token=system_config.fly_api_token,
        fly_org_slug=system_config.fly_org_slug,
        onyx_api_key=system_config.onyx_api_key,
        onyx_base_url=system_config.onyx_base_url,
        toggl_workspace_id=system_config.toggl_workspace_id,
        toggl_organization_id=system_config.toggl_organization_id,
        supabase_url=system_config.supabase_url,
        supabase_service_role_key=system_config.supabase_service_role_key,

        # Platform-admin only: only populate for admin tenant
        linkedin_community_token=system_config.linkedin_community_token if is_admin else "",
        linkedin_ads_token=system_config.linkedin_ads_token if is_admin else "",
        linkedin_org_id=system_config.linkedin_org_id if is_admin else "",
        ga_service_account_json=system_config.ga_service_account_json if is_admin else "",
        ga_property_id=system_config.ga_property_id if is_admin else "",
        dub_api_key=system_config.dub_api_key if is_admin else "",

        # Per-tenant optional service connections
        linear_api_key=tenant_config.linear_api_key or "",
        linear_team_id=tenant_config.linear_team_id or "",
    )
```

---

## 3. What Is Isolated Per Tenant

### 3.1 Discord Connection (Strong Physical Isolation)

Each active tenant has its own `discord.Client` object with its own:
- Bot token (from `discord_connections.vault_secret_id`)
- WebSocket connection to Discord's gateway
- asyncio Task (the `tenant_supervisor` coroutine)
- `on_ready`, `on_message`, `on_guild_remove` event handlers — bound to that tenant's `TenantConfig`

**Isolation guarantee:** Discord events for tenant A's guild can only arrive on tenant A's `discord.Client`. Discord's infrastructure enforces this — a bot token only receives events for guilds it's in. There is no way for tenant B's messages to arrive on tenant A's client.

**Cross-contamination prevention in code:**
```python
async def on_message_for_tenant(message, config, tool_context, ...):
    # Defense-in-depth: verify guild even though Discord enforces this
    if message.guild is None or str(message.guild.id) != config.guild_id:
        return  # Silently drop — wrong guild
```

### 3.2 Anthropic API Key (Strong BYOK Isolation)

Each tenant's Claude calls use their own `anthropic_api_key`. This is stored in `tenant_api_keys` (Vault-encrypted), decrypted at tenant startup, placed in the per-tenant `TenantConfig` and `ToolContext`.

**Call path to Claude:**
```
TenantConfig.anthropic_api_key (in memory)
  → build_tenant_tool_context() → ToolContext.anthropic_api_key
    → fly_run_session tool: injects as ANTHROPIC_API_KEY env var into Fly Machine
      → Claude Agent SDK inside Machine: reads ANTHROPIC_API_KEY from env
        → Anthropic API call on tenant's account
```

**Billing isolation:** The tenant's Anthropic account is billed, not the platform's. If tenant A sends 1,000 requests, their Anthropic bill increases. The platform pays $0 in Anthropic API fees.

**Rate limit isolation:** Each tenant's key has its own rate limits. Tenant A hitting their rate limit does NOT affect tenant B.

### 3.3 Database Rows (Strong Logical Isolation via tenant_id + RLS)

#### 3.3.1 New SaaS Tables (Full Tenant Isolation)

All new tables added for the SaaS platform use `tenant_id UUID NOT NULL REFERENCES tenants(id)` as a scope column. Every query by the website MUST include a `tenant_id` filter.

| New Table | Scope Column | Isolation Mechanism |
|-----------|-------------|---------------------|
| `tenants` | `id` (IS the tenant) | RLS: user can only read their own tenant via `tenant_members` join |
| `tenant_members` | `tenant_id` | RLS: users see only memberships for tenants they belong to |
| `discord_connections` | `tenant_id` | RLS: users see only their tenant's connection |
| `tenant_api_keys` | `tenant_id` | RLS: users see only their tenant's keys (key_hint only — not Vault ID) |
| `tenant_service_connections` | `tenant_id` | RLS: users see only their tenant's service connections |
| `tenant_subscriptions` | `tenant_id` | RLS: users see only their tenant's subscription |

#### 3.3.2 Existing Tables (Partial or No Tenant Scope)

The existing single-tenant tables are NOT redesigned for multi-tenancy. They have no `tenant_id` column. Their isolation is by design:

| Existing Table | Scope | Isolation Decision |
|---------------|-------|-------------------|
| `user_identity_discord` | `user_id` (platform-wide) | **Intentional** — one Discord identity per user, usable across tenants |
| `user_credentials` | `user_id` (platform-wide) | **Intentional** — user's GitHub/Toggl/Linear credentials follow the user, not the tenant |
| `user_profiles` | `user_id` (platform-wide) | **Intentional** — admin flag is platform-wide |
| `admin_impersonation_sessions` | `impersonator_id` | Platform admin only |
| `bluedot_transcripts` | `guild_id` (implicit scope) | Bot writes guild_id; no cross-guild access risk |
| `direct_message_sessions` | `discord_user_id` | Per-user DM history; no guild scope needed |
| `discord_channel_mapping` | `server_id` (implicit) | Bot reads by guild; no cross-guild access risk |
| `session_templates` | global | Platform-managed; all tenants can read public templates |
| `conversation_skills` | `guild_id` | Scoped to guild in existing schema |
| `scheduled_tasks` | `guild_id` | Scoped to guild |

#### 3.3.3 RLS Policy Design

**For new SaaS tables, RLS is enforced for the website client (user JWT).**
The bot uses the service role key and bypasses RLS — it enforces tenant scoping in application code.

**RLS policy pattern for all new tables:**

```sql
-- Policy: users can only access rows for tenants they are members of
CREATE POLICY "tenant_members_access" ON public.<table_name>
    FOR ALL
    USING (
        tenant_id IN (
            SELECT tenant_id
            FROM tenant_members
            WHERE user_id = auth.uid()
        )
    );
```

Full exact SQL for all policies is in [database/rls-policies.md](../database/rls-policies.md).

### 3.4 Claude Conversation Context (Strong Logical Isolation)

Conversation history (context window) is never shared across tenants. Each Discord channel has its own conversation thread. The bot reads conversation history from `direct_message_sessions` or thread-scoped state — both scoped by `discord_user_id` + `channel_id`, which are inherently guild-scoped (channel IDs are unique to a guild).

**Cross-tenant context bleed is impossible because:**
1. Fly session Machines are ephemeral — each session starts with a fresh context
2. Discord channel IDs are globally unique (a tenant's channel ID cannot match another tenant's)
3. Conversation history is not stored in a multi-tenant table — each session Machine is stateless

### 3.5 ToolRegistry (Strong Logical Isolation)

Each tenant gets its own `ToolRegistry` instance at startup. The registry holds:
- The tenant's `ToolContext` (with their credentials)
- The tenant's plan level (`tenant_plan: 'free' | 'starter' | 'pro'`)
- The `is_platform_admin` flag (only `True` for the PyMC tenant)

**Registry map in TenantConnectionManager:**
```python
self._tenant_registries: dict[uuid.UUID, ToolRegistry] = {}
# tenant_id → ToolRegistry for that tenant
```

When a message arrives on tenant X's Discord client, only tenant X's `ToolRegistry` is used for that message. There is no way for the wrong registry to be used — the `on_message` handler closes over the `tenant_id` at registration time.

### 3.6 Langfuse Traces (Strong Logical Isolation via Tags)

Every Langfuse trace is tagged with `tenant_id`. This allows:
- Platform admins to filter traces by tenant in Langfuse UI
- Per-tenant cost analysis (token usage, latency)
- Per-tenant error monitoring

**Trace tagging:**
```python
langfuse_context.update_current_trace(
    tags=[f"tenant:{config.tenant_id}", f"guild:{config.guild_id}"],
    metadata={
        "tenant_id": str(config.tenant_id),
        "guild_id": config.guild_id,
        "plan": config.plan,
    }
)
```

**Tenant data visibility in Langfuse:** Langfuse is a single platform-admin tool. Tenants do NOT have access to Langfuse. Their conversation data (including message content) is visible to platform admins via Langfuse traces.

**Privacy implication for ToS/Privacy Policy:** Langfuse receives message content for all tenants. This must be disclosed in the Privacy Policy. See [legal/privacy-policy.md](../legal/privacy-policy.md).

---

## 4. Failure Isolation

### 4.1 Per-Tenant Supervisor Crash Isolation

Each tenant's connection runs in its own asyncio `Task` (the `tenant_supervisor` coroutine). If a tenant's supervisor raises an unhandled exception:
- The exception is caught inside `asyncio.create_task()` — Python asyncio swallows task exceptions unless explicitly retrieved
- The tenant's status is updated to `'error'` by the exception handler
- Other tenants' tasks continue running unaffected

**Exception boundary in `TenantConnectionManager`:**
```python
async def add_tenant(self, config: TenantConfig) -> None:
    async def _safe_supervisor():
        try:
            await tenant_supervisor(self, config, tool_context)
        except Exception as e:
            # Log the exception — never propagate to main loop
            logger.error(f"Tenant {config.tenant_id} supervisor crashed: {e}", exc_info=True)
            await self._write_status(
                config.discord_connection_id,
                status="error",
                error_message=f"Internal error: {str(e)[:200]}",
            )

    task = asyncio.create_task(_safe_supervisor())
    self._tenants[config.tenant_id] = ActiveTenant(
        tenant_id=config.tenant_id,
        config=config,
        task=task,
        started_at=datetime.utcnow(),
    )
```

### 4.2 Fly Session Machine Isolation

Each tenant's Fly session Machine is a separate VM. If tenant A's session Machine crashes:
- Tenant A's conversation ends (Machine auto-destroys)
- Tenant B's session Machines are unaffected
- The bot process on the main Machine is unaffected

### 4.3 Rate Limit Cascade Prevention

If tenant A hits their Anthropic rate limit:
- Only tenant A's Claude calls fail
- Tenant B's calls use tenant B's key — completely separate Anthropic account
- No cascading rate limit across tenants

If a tenant's Discord bot token hits Discord's gateway rate limit:
- That tenant's `discord.Client` will back off per Discord's gateway guidance
- Other tenants' clients (different tokens) are not rate-limited
- Exception: all tokens share the same egress IP — Discord's IP-based rate limits could theoretically affect all tenants simultaneously. Mitigation: stagger connections at startup (see connection-manager.md §16).

### 4.4 Memory Exhaustion

If a tenant's message handler is processing an unusually large response:
- The Python process's memory increases
- Other tenants' handlers are not blocked (asyncio — all on one thread, no blocking I/O waits)
- Risk: Very large responses could increase GC pressure
- Mitigation: Discord messages have a 4,000-character limit; responses are bounded. No token streaming in the current architecture — Fly session Machines handle full generation.

---

## 5. Supabase Service Role Trust Model

### 5.1 Why the Bot Uses Service Role

The bot uses `SUPABASE_SERVICE_ROLE_KEY` for all database operations. This key:
- Bypasses all Row Level Security policies
- Can read and write any table in any schema
- Cannot be revoked without rotating the key (which requires bot redeploy)

**Rationale:** The bot needs to:
1. Read all active tenants at startup (across all tenant_id values)
2. Write heartbeats to `discord_connections` for any tenant
3. Decrypt Vault secrets (requires service role)
4. Write to `bluedot_transcripts`, `direct_message_sessions`, etc. without RLS restrictions

### 5.2 Application-Level Isolation in the Bot

Since the bot bypasses RLS, it must enforce tenant scoping in application code. The rules:

**Rule 1: Every DB write from a tool handler MUST include `tenant_id` or `guild_id` in the WHERE/VALUES clause.**

```python
# Correct: scoped to tenant's guild
supabase.table('discord_channel_mapping') \
    .select('*') \
    .eq('server_id', tool_context.discord_guild_id) \
    .execute()

# Incorrect: unscoped read (could return data from other tenants)
supabase.table('discord_channel_mapping') \
    .select('*') \
    .execute()
```

**Rule 2: UserContext.tenant_id MUST be set before any DB operation in a message handler.**

```python
user_context = await build_user_context(
    discord_id=str(message.author.id),
    tenant_id=config.tenant_id,  # REQUIRED
    ...
)
```

**Rule 3: Any tool that reads user-specific data (user_credentials, user_identity_discord) scopes by user_id — not tenant_id — because these are intentionally global.**

### 5.3 Audit: Service Role Operations

The following operations use service role (all considered acceptable):

| Operation | Table | Why Service Role Needed |
|-----------|-------|------------------------|
| Read all active tenants at startup | `tenants`, `discord_connections`, `tenant_api_keys` | Reads ALL tenants; no user JWT |
| Write heartbeat | `discord_connections` | Bot writes, no user JWT available |
| Write status updates | `discord_connections` | Bot writes, no user JWT available |
| Decrypt Vault secrets | `vault.decrypted_secrets` | Vault requires service role |
| Read user identity | `user_identity_discord` | No RLS on this table |
| Read user credentials | `user_credentials` | RLS would restrict; bot needs all |
| Write transcripts | `bluedot_transcripts` | Bot writer role (discord_bot_reader has login) |
| Write DM sessions | `direct_message_sessions` | Bot writer |
| Write conversation skills | `conversation_skills` | Bot writer |
| Write scheduled tasks | `scheduled_tasks` | Bot writer |

---

## 6. Website Client Trust Model

### 6.1 Website Uses User JWT (Anon Key + Auth)

The Next.js website uses the Supabase `anon` key + user JWT for all client-side requests. RLS enforces that users can only read their own tenant's data.

**What a website user can access via anon key:**
- Rows in `tenants` where they are a member (via `tenant_members`)
- Rows in `discord_connections` where `tenant_id` matches their membership
- Rows in `tenant_api_keys` — `key_hint` only (full `vault_secret_id` never returned to client)
- Rows in `tenant_service_connections` where `tenant_id` matches
- Rows in `tenant_subscriptions` where `tenant_id` matches
- Their own row in `user_identity_discord`
- Their own rows in `user_credentials` (via `user_id`)

**What a website user CANNOT access via anon key:**
- Other tenants' rows in any SaaS table
- `vault.secrets` or `vault.decrypted_secrets` (Vault is service-role only)
- `admin_impersonation_sessions` for other users
- Any table without RLS unless the policy explicitly allows it

### 6.2 Server-Side API Routes Use Service Role

Next.js API routes (`/api/*`) run on the server. They use the `SUPABASE_SERVICE_ROLE_KEY` to:
- Validate API keys (calling Anthropic/OpenAI API)
- Store keys in Vault via `store-tenant-api-key` Edge Function
- Handle Stripe webhooks and update `tenant_subscriptions`
- Create/update Stripe Customer objects

**Server-side routes that use service role:**
- `POST /api/keys/validate-anthropic` — calls Anthropic API + stores key
- `POST /api/keys/validate-openai` — calls OpenAI API + stores key
- `POST /api/webhooks/stripe` — Stripe webhook handler; updates billing tables
- `POST /api/admin/*` — admin-only routes; validates admin claim before service role use

---

## 7. Data Residency and Commingling

### 7.1 Commingled Tables

The following tables store data for multiple tenants without tenant-level physical separation. All data is in the same PostgreSQL schema, same tables:

| Table | Commingling Risk | Mitigation |
|-------|----------------|------------|
| `tenants` | All tenant rows in one table | RLS — each user sees only their row |
| `discord_connections` | All connections in one table | RLS + `tenant_id` column |
| `tenant_api_keys` | All API key hints in one table | RLS; Vault secret IDs (not keys) stored |
| `tenant_subscriptions` | All subscriptions in one table | RLS |
| `bluedot_transcripts` | All transcripts commingled | `guild_id` column; bot scopes by guild |
| `direct_message_sessions` | All DM sessions commingled | `discord_user_id`; user-scoped |
| Langfuse | All traces in one project | `tenant_id` tag; no cross-tenant visibility in UI |

### 7.2 Tables That Do NOT Need Tenant Scoping

| Table | Reason |
|-------|--------|
| `session_templates` | Platform-managed content; same for all tenants; no sensitive data |
| `conversation_skills` | Platform-managed skill library; `guild_id` scoping sufficient |

### 7.3 Vault Isolation

All sensitive credentials (discord tokens, API keys) are stored in Supabase Vault (`vault.secrets`). Vault uses AES-256 encryption with a key managed by Supabase infrastructure.

**Cross-tenant Vault access:** The Vault tables store all secrets commingled. Isolation is at the application layer — only the `get_decrypted_secret(secret_id UUID)` function can decrypt, and the caller must know the specific `vault.secrets.id` UUID to decrypt a secret. The UUIDs are stored in `discord_connections.vault_secret_id` and `tenant_api_keys.vault_secret_id`, which are RLS-protected.

**Attack scenario analysis:**
- SQL injection via bot: Cannot occur — bot uses parameterized queries via Supabase Python SDK
- RLS bypass by regular user: Cannot occur — only service role bypasses RLS
- Vault UUID enumeration: Cannot occur — UUIDs are randomly generated, not sequential
- Cross-tenant Vault read by attacker with service role: The only parties with service role are the bot process (Fly.io) and the Next.js server (Vercel). Neither is user-accessible.

---

## 8. Platform-Admin Tenant

### 8.1 Identity

The **platform-admin tenant** is PyMC's own tenant in the system. It is the original single-tenant deployment, converted to a "tenant" in the multi-tenant system.

**Identification:** `PLATFORM_ADMIN_TENANT_ID` environment variable on the Fly.io bot Machine. This env var holds the UUID of the PyMC tenant row in the `tenants` table.

**Alternatively identified by guild ID:** `PLATFORM_ADMIN_GUILD_ID` — the Discord guild ID for PyMC's own server. The `ToolRegistry` uses guild ID (not tenant ID) to set `is_platform_admin` at init time:

```python
# In TenantConnectionManager.add_tenant()
is_platform_admin = (
    str(config.tenant_id) == os.environ.get('PLATFORM_ADMIN_TENANT_ID', '')
    or config.guild_id == os.environ.get('PLATFORM_ADMIN_GUILD_ID', '')
)
```

### 8.2 Capabilities Unique to Platform-Admin Tenant

| Capability | Mechanism | Available to Other Tenants? |
|------------|-----------|----------------------------|
| LinkedIn tools | `Scope.PLATFORM_ADMIN` gate + credentials populated | No |
| Google Analytics tools | `Scope.PLATFORM_ADMIN` gate + credentials populated | No |
| Dub.co tools | `Scope.PLATFORM_ADMIN` gate + credentials populated | No |
| All plan-gated tools (unlimited) | `is_platform_admin=True` bypasses plan gates | No |
| Access to all tenants' data via bot | Service role — same as all tenants | N/A (not user-accessible) |

### 8.3 Platform-Admin Tenant Plan

The platform-admin tenant is assigned `plan='pro'` permanently. The Stripe subscription enforcement is skipped for the platform-admin tenant:

```python
# In ToolRegistry plan gate check
if Scope.PLAN_PRO in tool_def.tags and tenant_plan != 'pro':
    if not is_platform_admin:  # Admin bypasses all plan gates
        raise ToolError("This feature requires a Pro plan.")
```

---

## 9. Isolation Boundary Checklist

A forward loop implementing the multi-tenant adaptation must verify each boundary:

| Boundary | Where Enforced | Test |
|---------|---------------|------|
| Discord guild scope | `on_message_for_tenant`: `guild_id` check | Send message from tenant B's guild to tenant A's bot; expect silence |
| BYOK key routing | `build_tenant_tool_context()`: `anthropic_api_key` from TenantConfig | Assert Fly Machine env has correct tenant key |
| Tool scope gate (PLATFORM_ADMIN) | `ToolRegistry.call_tool()`: `Scope.PLATFORM_ADMIN` check | Non-admin tenant calls `linkedin_post_update`; expect `ToolError` |
| Plan gate | `ToolRegistry.call_tool()`: `Scope.PLAN_STARTER`/`PLAN_PRO` check | Free-plan tenant calls `fly_launch_session`; expect `ToolError` |
| DB row scope (new tables) | RLS policies | Website user queries `discord_connections`; only sees own tenant's row |
| DB row scope (existing tables) | Application code — guild_id in WHERE clause | Bot queries `discord_channel_mapping` without guild_id filter; flag as bug |
| Service role trust | Only bot + server API routes have service role | No client-side code has service role key |
| Vault access | Only service role can call `get_decrypted_secret()` | Anon key cannot call vault functions |
| Langfuse tagging | `langfuse_context.update_current_trace()` with `tenant_id` tag | All traces have `tenant:` tag |
| Supervisor crash isolation | `_safe_supervisor()` wrapper catches all exceptions | Crash one tenant's task; other tenants unaffected |
| Failure isolation (Discord rate limit) | Per-token rate limits (Discord API) | Tenant A hits rate limit; tenant B unaffected |
| Platform-admin identity | `PLATFORM_ADMIN_TENANT_ID` + `PLATFORM_ADMIN_GUILD_ID` env vars | Only PyMC guild resolves to `is_platform_admin=True` |

---

## 10. What Does NOT Provide Isolation (Known Limitations)

| Limitation | Explanation | Risk Level | Mitigation |
|-----------|-------------|-----------|------------|
| Shared asyncio event loop | A blocking operation in one tenant's code (e.g., long synchronous loop) blocks all tenants | Low | All tool handlers use async I/O; no blocking calls in handlers |
| Shared SQLAlchemy pool | At high tenant count, pool contention could slow all tenants | Low | Pool size 30 (10 + 20 overflow) handles 500 tenants at expected message rates |
| Shared Fly.io IP | All Discord WebSocket connections share one egress IP for Discord rate limiting | Medium | Discord's gateway limits are per-token, not per-IP for established connections |
| Memory not isolated | One tenant's large response could pressure GC for all | Low | Discord message + response sizes are bounded; Fly Machine handles generation |
| Langfuse content visibility | Platform can read all tenants' message content via Langfuse traces | Disclosure required | Privacy policy must disclose; Langfuse is admin-only access |
| Onyx RAG shared | All tenants search the same Onyx knowledge base (PyMC's docs/knowledge) | Medium | This is intentional — Onyx is a shared platform resource, not per-tenant |
| Toggl workspace shared | All Toggl operations target PyMC's workspace | Medium | Toggl tools are intended for PyMC team; per-user credentials provide user-level scope |

---

## 11. Cross-References

- [connection-manager.md](./connection-manager.md) — Per-tenant Discord client setup, supervisor task, Realtime subscription
- [tenant-scoping.md](./tenant-scoping.md) — ToolContext field partitioning, UserContext, plan gates, tool catalog
- [byok-key-routing.md](./byok-key-routing.md) — BYOK Anthropic/OpenAI key storage, hot-reload, Vault access
- [realtime-contract.md](./realtime-contract.md) — 4 Realtime channels, event routing, payload shapes
- [health-monitoring.md](./health-monitoring.md) — Per-tenant status, stale detection, reconnection dashboard view
- [database/rls-policies.md](../database/rls-policies.md) — Complete SQL for all RLS policies
- [database/vault-encryption.md](../database/vault-encryption.md) — Vault setup, `get_decrypted_secret()`, encrypt patterns
- [deployment/environment.md](../deployment/environment.md) — All env vars including `PLATFORM_ADMIN_TENANT_ID`, `PLATFORM_ADMIN_GUILD_ID`
- [legal/privacy-policy.md](../legal/privacy-policy.md) — Langfuse content visibility disclosure
