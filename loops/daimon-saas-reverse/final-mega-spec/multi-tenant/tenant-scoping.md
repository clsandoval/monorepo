# Multi-Tenant Tool Execution Scoping

**Aspect:** 2.2 — Per-tenant tool access with tenant API keys
**Wave:** Wave 2 — Multi-Tenant Adaptation
**Written:** 2026-03-13
**References:**
- [source/existing-tools.md](../source/existing-tools.md) — ToolContext, UserContext, ToolDef, ToolRegistry, ALL_TOOLS catalog
- [source/existing-bot-architecture.md](../source/existing-bot-architecture.md) — ToolContext fields, env var mapping
- [source/existing-auth.md](../source/existing-auth.md) — user_credentials, user_identity_discord
- [multi-tenant/connection-manager.md](./connection-manager.md) — TenantConnectionManager, TenantConfig

---

## 1. Current Single-Tenant Behavior

### 1.1 How Tool Execution Works Today

In the current single-tenant bot:

1. At startup, one `ToolContext` frozen dataclass is constructed from env vars. All fields are hardcoded for the PyMC deployment.
2. One `ToolRegistry` is created with `create_tool_registry(tool_context)` — it registers all 84 direct tools + 6 Linear remote tools = 90 tools.
3. Per Discord message, a `UserContext` is constructed by:
   - Extracting `discord_id` from the Discord message object
   - Querying `user_identity_discord` to get `user_id`
   - Querying `user_credentials` to get all credentials for that user
   - Decrypting each credential via Supabase Vault
4. `ToolRegistry.call_tool(name, params, user_context)` dispatches the call.
5. The tool handler receives `(tool_context, user_context, db_context, params)` — `tool_context` is the same object for every call regardless of which user triggered it.

### 1.2 Tool Credential Sources (Single-Tenant)

| Credential Source | How It's Used | Who Supplies It |
|------------------|---------------|-----------------|
| `ToolContext.discord_token` | Discord API calls (read/write channels, search) | PyMC env var |
| `ToolContext.discord_guild_id` | Scopes Discord searches to one guild | PyMC env var |
| `ToolContext.anthropic_api_key` | Forwarded to Fly session machines | PyMC env var |
| `ToolContext.fly_api_token` + `.fly_org_slug` | Fly.io Machines API | PyMC env var |
| `ToolContext.onyx_api_key` + `.onyx_base_url` | Onyx RAG API | PyMC env var |
| `ToolContext.toggl_workspace_id` + `.toggl_organization_id` | Scopes Toggl API calls | PyMC env var |
| `ToolContext.linkedin_community_token` | LinkedIn Community Management API | PyMC env var |
| `ToolContext.linkedin_ads_token` | LinkedIn Advertising API | PyMC env var |
| `ToolContext.linkedin_org_id` | LinkedIn Organization ID | PyMC env var |
| `ToolContext.ga_service_account_json` | Google Analytics service account | PyMC env var |
| `ToolContext.ga_property_id` | GA4 property | PyMC env var |
| `ToolContext.linear_api_key` + `.linear_team_id` | Linear GraphQL API | PyMC env var |
| `ToolContext.dub_api_key` | Dub.co short link API | PyMC env var |
| `UserContext.credentials[CredentialPlatform.GITHUB]` | GitHub CLI (gh) | Per user — OAuth |
| `UserContext.credentials[CredentialPlatform.TOGGL]` | Toggl Track API (personal token) | Per user — API key |
| `UserContext.credentials[CredentialPlatform.LINEAR]` | Linear API (personal) | Per user — API key |

### 1.3 Why This Cannot Scale to Multi-Tenant

| Problem | Explanation |
|---------|-------------|
| Single `ToolContext` | All 90 tools share one set of credentials. No per-tenant separation. |
| `anthropic_api_key` is hardcoded | Every Claude call uses PyMC's key. BYOK is impossible. |
| `discord_token` + `discord_guild_id` are single values | All Discord tool calls target one guild. Multi-guild is impossible. |
| `user_credentials` has no tenant scope | If user A in tenant X has GitHub connected, and user A is also in tenant Y's guild, their credentials are shared — no isolation. |
| Tool registry is global | One registry with all 90 tools registered for all messages. |

---

## 2. Multi-Tenant Tool Context Architecture

### 2.1 ToolContext Partitioning

In multi-tenant, `ToolContext` fields are divided into three categories:

#### Category A: Per-Tenant (Varies Per Customer)

These fields come from the tenant's stored configuration in Supabase, not from platform env vars.

| Field | Source | Table | Column |
|-------|--------|-------|--------|
| `discord_token` | Tenant's bot token | `discord_connections` | `bot_token` (Vault-decrypted) |
| `discord_guild_id` | Tenant's guild ID | `discord_connections` | `guild_id` |
| `anthropic_api_key` | Tenant's BYOK key | `tenant_api_keys` | `vault_secret_id` (Vault-decrypted) |

**These are different for every tenant. A tenant's Discord calls only affect their guild. Claude calls consume their API quota.**

#### Category B: Per-Tenant Optional (Set If Tenant Has Connected the Service)

These fields come from `tenant_service_connections` for services the tenant has OAuth'd or API-key'd.

| Field | Source | Table | Platform Value | Default If Not Connected |
|-------|--------|-------|---------------|--------------------------|
| `linear_api_key` | Tenant's Linear connection | `tenant_service_connections` | `'linear'` | `""` |
| `linear_team_id` | Tenant's Linear connection metadata | `tenant_service_connections.metadata` | `'linear'` | `""` |

**If a tenant hasn't connected Linear, `linear_api_key` = `""`. Linear tools will raise `ToolError("Linear API key not configured. Configure Linear in your Daimon dashboard.")`.**

#### Category C: Platform-Level (Same for All Tenants)

These fields are shared platform infrastructure. They come from the bot process's env vars and are the same value for every tenant's `ToolContext`.

| Field | Env Var | Shared Rationale |
|-------|---------|-----------------|
| `fly_api_token` | `FLY_API_TOKEN` | Fly sessions launch in platform's Fly org. All tenants share the Fly.io infrastructure. |
| `fly_org_slug` | `FLY_ORG_SLUG` | Same Fly.io organization. |
| `onyx_api_key` | `ONYX_API_KEY` | Shared Onyx RAG instance. All tenants search the same knowledge base. |
| `onyx_base_url` | `ONYX_BASE_URL` | Same Onyx deployment. |
| `toggl_workspace_id` | `TOGGL_WORKSPACE_ID` | Platform-managed Toggl workspace. |
| `toggl_organization_id` | `TOGGL_ORGANIZATION_ID` | Platform-managed Toggl org. |
| `supabase_url` | `SUPABASE_URL` | Shared Supabase project. |
| `supabase_service_role_key` | `SUPABASE_SERVICE_ROLE_KEY` | Service role — bypasses RLS, reads all tenant data. |

#### Category D: Platform-Admin Only (Restricted — PyMC Internal)

These fields contain PyMC's private analytics and social credentials. They are populated in platform env vars but **tools that use them are gated to the platform-admin tenant** (the PyMC tenant identified by `PLATFORM_ADMIN_TENANT_ID` env var).

| Field | Tools That Use It |
|-------|------------------|
| `linkedin_community_token` | `linkedin_post_update`, `linkedin_list_posts`, etc. |
| `linkedin_ads_token` | `linkedin_get_ad_performance`, etc. |
| `linkedin_org_id` | All LinkedIn tools |
| `ga_service_account_json` | `google_analytics_run_report`, etc. |
| `ga_property_id` | All GA tools |
| `dub_api_key` | `dub_list_links`, `dub_get_analytics` |

**Enforcement mechanism:** See Section 3.2 (Scope.PLATFORM_ADMIN gate).

---

### 2.2 ToolContext Construction Per Tenant

At connection time (when `TenantConnectionManager.add_tenant(tenant_config)` is called), the bot constructs a `ToolContext` for that tenant:

```python
def build_tenant_tool_context(
    tenant_config: TenantConfig,
    system_config: SystemConfig,
) -> ToolContext:
    """
    Construct a per-tenant ToolContext from tenant DB credentials + system env vars.

    Args:
        tenant_config: TenantConfig namedtuple loaded from discord_connections +
                       tenant_api_keys + tenant_service_connections at connection time.
                       Contains pre-decrypted credentials (Vault decryption happens
                       in TenantConnectionManager.add_tenant).
        system_config: SystemConfig namedtuple loaded once at process startup from
                       environment variables. Contains platform-level credentials.

    Returns:
        Frozen ToolContext ready for use in this tenant's ToolRegistry.
    """
    return ToolContext(
        # Category A: Per-tenant
        discord_token=tenant_config.discord_token,           # Decrypted from Vault
        discord_guild_id=tenant_config.guild_id,

        # Category B: Per-tenant optional (empty string if not connected)
        linear_api_key=tenant_config.linear_api_key or "",
        linear_team_id=tenant_config.linear_team_id or "",

        # Category C: Platform-level (same for all tenants)
        fly_api_token=system_config.fly_api_token,
        fly_org_slug=system_config.fly_org_slug,
        onyx_api_key=system_config.onyx_api_key,
        onyx_base_url=system_config.onyx_base_url,
        toggl_workspace_id=system_config.toggl_workspace_id,
        toggl_organization_id=system_config.toggl_organization_id,
        anthropic_api_key=tenant_config.anthropic_api_key,  # BYOK — from tenant_api_keys
        supabase_url=system_config.supabase_url,
        supabase_service_role_key=system_config.supabase_service_role_key,

        # Category D: Platform-admin only (populated but gated in ToolRegistry)
        linkedin_community_token=system_config.linkedin_community_token,
        linkedin_ads_token=system_config.linkedin_ads_token,
        linkedin_org_id=system_config.linkedin_org_id,
        ga_service_account_json=system_config.ga_service_account_json,
        ga_property_id=system_config.ga_property_id,
        dub_api_key=system_config.dub_api_key,
    )
```

**TenantConfig namedtuple** (passed into `build_tenant_tool_context`):

```python
TenantConfig = NamedTuple("TenantConfig", [
    ("tenant_id", uuid.UUID),
    ("guild_id", str),
    ("discord_token", str),           # Vault-decrypted
    ("anthropic_api_key", str),       # Vault-decrypted from tenant_api_keys
    ("openai_api_key", str | None),   # Optional BYOK — Vault-decrypted
    ("linear_api_key", str | None),   # From tenant_service_connections, Vault-decrypted
    ("linear_team_id", str | None),   # From tenant_service_connections.metadata
    ("is_platform_admin", bool),      # True only for PLATFORM_ADMIN_TENANT_ID
    ("plan", str),                    # 'free' | 'starter' | 'pro'
])
```

**SystemConfig namedtuple** (loaded at process startup from env vars):

```python
SystemConfig = NamedTuple("SystemConfig", [
    ("supabase_url", str),
    ("supabase_service_role_key", str),
    ("fly_api_token", str),
    ("fly_org_slug", str),
    ("onyx_api_key", str),
    ("onyx_base_url", str),
    ("toggl_workspace_id", int),
    ("toggl_organization_id", int),
    ("linkedin_community_token", str),
    ("linkedin_ads_token", str),
    ("linkedin_org_id", str),
    ("ga_service_account_json", str),
    ("ga_property_id", str),
    ("dub_api_key", str),
    ("platform_admin_tenant_id", uuid.UUID),
])
```

---

### 2.3 Per-Tenant ToolRegistry

Each tenant gets its own `ToolRegistry` instance constructed with its `ToolContext`. The registry is stored in `TenantConnectionManager._tenant_registries: dict[uuid.UUID, ToolRegistry]`.

```python
# In TenantConnectionManager.add_tenant():
tool_context = build_tenant_tool_context(tenant_config, system_config)
tool_registry = create_tool_registry(tool_context, db_context)
self._tenant_registries[tenant_id] = tool_registry
```

**Multiple registries in memory**: Each of the N active tenants has one `ToolRegistry` instance. The registry holds no mutable state (it's a lookup table); memory overhead per registry is small (just references to 90 tool handlers).

**Registry invalidation**: When a tenant's credentials change (e.g., they update their Anthropic API key), the old registry is discarded and a new one is constructed:

```python
async def refresh_tenant_context(self, tenant_id: uuid.UUID) -> None:
    """
    Called when a tenant updates their API keys or service connections.
    Triggered by Supabase Realtime UPDATE event on tenant_api_keys or
    tenant_service_connections.
    """
    tenant_config = await self._load_tenant_config(tenant_id)
    tool_context = build_tenant_tool_context(tenant_config, self._system_config)
    self._tenant_registries[tenant_id] = create_tool_registry(tool_context, self._db_context)
```

---

## 3. Tool Access Control

### 3.1 New Scope Tag: PLATFORM_ADMIN

The existing `Scope` StrEnum in `src_v2/mcp/tags.py` gains one new value:

```python
class Scope(StrEnum):
    TOGGL_WORKSPACE_ADMIN = "toggl_workspace_admin"  # Existing
    PLATFORM_ADMIN = "platform_admin"                 # NEW for multi-tenant
```

**Gate behavior in `ToolRegistry.call_tool()`:**

```python
# Check PLATFORM_ADMIN scope
if Scope.PLATFORM_ADMIN in tool_def.tags:
    if not self._tool_context_is_platform_admin:
        raise ToolError(
            "This tool is only available to platform administrators."
        )
```

Where `self._tool_context_is_platform_admin` is a boolean set during `ToolRegistry.__init__()` by checking `tool_context.discord_guild_id == system_config.platform_admin_guild_id` (the guild ID of the PyMC admin tenant, stored as env var `PLATFORM_ADMIN_GUILD_ID`).

### 3.2 Tools Requiring PLATFORM_ADMIN Scope

The following tools in `ALL_TOOLS` gain `Scope.PLATFORM_ADMIN` in their tag set:

| Tool Name | Platform | Why Admin-Only |
|-----------|----------|----------------|
| `linkedin_post_update` | LINKEDIN | Posts to PyMC's LinkedIn — no tenant should do this |
| `linkedin_list_posts` | LINKEDIN | Reads PyMC's LinkedIn analytics |
| `linkedin_get_follower_stats` | LINKEDIN | PyMC's follower data |
| `linkedin_get_ad_performance` | LINKEDIN | PyMC's ad spend data |
| `linkedin_get_ad_campaigns` | LINKEDIN | PyMC's ad campaigns |
| `google_analytics_run_report` | GOOGLE_ANALYTICS | PyMC's GA4 property |
| `dub_list_links` | DUB | PyMC's Dub.co links |
| `dub_get_analytics` | DUB | PyMC's link analytics |

**All Fly.io tools**: NOT platform-admin only. Tenants benefit from launching Fly session machines (they get an interactive AI notebook session in PyMC's Fly org). All tenants can launch sessions.

**Onyx tools**: NOT platform-admin only. All tenants share the same Onyx RAG knowledge base (PyMC's knowledge base). This is acceptable and a feature (shared knowledge resource).

**Toggl tools**: NOT platform-admin only. Tenants may have personal Toggl API keys connected as user credentials. System-level workspace/org IDs define the scope.

### 3.3 Existing Credential Gates (Unchanged)

The existing `requires_credential` mechanism in `ToolDef` and `ToolRegistry.call_tool()` continues to work identically in multi-tenant. Per-user credentials from `UserContext.credentials` are used for:

| Tool Group | CredentialPlatform Required | Error If Missing |
|------------|---------------------------|-----------------|
| `github_run_gh` | `CredentialPlatform.GITHUB` | "This tool requires a connected GitHub account. Run /connect github to link your account." |
| `toggl_*` tools | `CredentialPlatform.TOGGL` | "This tool requires a connected Toggl account. Run /connect toggl to link your account." |
| `linear_*` user tools | `CredentialPlatform.LINEAR` | "This tool requires a connected Linear account. Run /connect linear to link your account." |

---

## 4. UserContext Construction in Multi-Tenant

### 4.1 Problem: user_credentials Has No Tenant Scope

In single-tenant, every user in the guild is implicitly in the same "tenant" (PyMC). In multi-tenant, user A in tenant X and user A in tenant Y are logically different actors.

**Current `user_credentials` schema:**
```sql
UNIQUE (user_id, platform)
```
One credential per user per platform — no tenant scope.

**Problem example:**
- User A (Discord ID `123`) is in PyMC's guild AND tenant Y's guild.
- User A connects their GitHub account while in PyMC's guild. The `user_credentials` row is `(user_id=A, platform='github', vault_secret_id=X)`.
- When User A speaks in tenant Y's guild, the bot finds their GitHub credential and allows `github_run_gh`.
- This is correct — GitHub credentials are per-user, not per-tenant.

**Conclusion:** Per-user credentials (`user_credentials`) are intentionally NOT tenant-scoped. If a user connects GitHub once, it works in any guild. This is acceptable — the credential belongs to the user, not the tenant.

**However**, `user_identity_discord` linking Discord ID to Supabase Auth user_id IS potentially cross-tenant. A user who has a Supabase Auth account in tenant X's context could use those credentials in tenant Y.

**Resolution:** `user_identity_discord` is global (not tenant-scoped). The Supabase Auth account is platform-wide. This is correct — one Supabase Auth account per Discord user, usable across all guilds they're in.

### 4.2 UserContext Construction in Multi-Tenant

`UserContext` construction per Discord message adds one field: `tenant_id`.

```python
@dataclass(frozen=True)
class UserContext:
    user_id: uuid.UUID | None
    discord_id: str
    tenant_id: uuid.UUID                                   # NEW: which tenant this request is for
    credentials: dict[CredentialPlatform, str]
    credential_metadata: dict[CredentialPlatform, dict]
    conversation_id: str = ""
    impersonating_user_id: uuid.UUID | None = None

    @property
    def is_authenticated(self) -> bool:
        return self.user_id is not None
```

**Construction sequence per message (multi-tenant):**

```
Discord message arrives on tenant X's discord.Client
  ↓
Extract discord_id from message.author.id
Extract tenant_id from TenantConnectionManager (keyed by which client received the message)
  ↓
Query: SELECT user_id FROM user_identity_discord WHERE discord_id = ?
  → user_id (or None if not linked)
  ↓
If user_id is not None:
  Query: SELECT platform, vault_secret_id, metadata
         FROM user_credentials WHERE user_id = ?
  For each row: call vault.decrypt(vault_secret_id) → decrypted_token
  Build credentials dict: {CredentialPlatform.GITHUB: "ghp_...", ...}
  Build credential_metadata dict: {CredentialPlatform.TOGGL: {"toggl_workspace_role": "admin"}, ...}
  ↓
Construct UserContext(
    user_id=user_id,
    discord_id=discord_id,
    tenant_id=tenant_id,
    credentials=credentials,
    credential_metadata=credential_metadata,
    conversation_id=str(message.channel.id),
)
  ↓
Dispatch to tenant's ToolRegistry.call_tool(name, params, user_context)
```

### 4.3 Tenant Scoping of DB Operations Within Tools

Tools that perform Supabase database reads/writes must scope their queries to the tenant. In single-tenant, all data in the DB belongs to one tenant. In multi-tenant, each table either has a `guild_id` column or is linked via `user_id` (which is platform-wide).

**Tables scoped by tenant (via guild_id or tenant_id):**

| Table | Scope Column | How Tools Use It |
|-------|-------------|-----------------|
| `discord_connections` | `guild_id` | Bot reads its own connection row by guild_id |
| `tenants` | `id` | Looked up via tenant_id from TenantConfig |
| `tenant_api_keys` | `tenant_id` | Key rotation managed via website, not tools |
| `tenant_service_connections` | `tenant_id` | Service connections managed via website |
| `tenant_subscriptions` | `tenant_id` | Plan enforcement in tools |

**Tables scoped by user (platform-wide):**

| Table | Scope Column | Cross-Tenant Risk |
|-------|-------------|------------------|
| `user_credentials` | `user_id` | Intentional — credentials follow the user |
| `user_identity_discord` | `discord_id` + `user_id` | Intentional — one identity per Discord user |
| `user_profiles` | `user_id` | Admin flag is platform-wide |

**Tables with no tenant/user scope (global):**

| Table | Purpose | Tenancy Approach |
|-------|---------|-----------------|
| `fly_session_templates` | Fly.io launch templates | Platform-managed; all tenants share templates |
| `decision_hub_skills` | Agent skill definitions | Platform-managed skill library |
| `bluedot_templates` | Bluedot meeting templates | Platform-managed |

---

## 5. Plan-Based Tool Gating

Tools can be gated by tenant subscription plan. This requires a new scope check in `ToolRegistry`.

### 5.1 New Scope Tags for Plan Gating

```python
class Scope(StrEnum):
    TOGGL_WORKSPACE_ADMIN = "toggl_workspace_admin"  # Existing
    PLATFORM_ADMIN = "platform_admin"                 # New — section 3.1
    PLAN_STARTER = "plan_starter"                     # Requires Starter or Pro plan
    PLAN_PRO = "plan_pro"                             # Requires Pro plan only
```

### 5.2 Plan Gate in ToolRegistry.call_tool()

```python
# Check plan-based scopes
tenant_plan = self._tenant_plan  # 'free' | 'starter' | 'pro', set at registry init

if Scope.PLAN_PRO in tool_def.tags and tenant_plan != 'pro':
    raise ToolError(
        "This feature requires a Pro plan. Upgrade at https://daimon.ai/billing."
    )

if Scope.PLAN_STARTER in tool_def.tags and tenant_plan not in ('starter', 'pro'):
    raise ToolError(
        "This feature requires a Starter or Pro plan. Upgrade at https://daimon.ai/billing."
    )
```

### 5.3 Tools Gated by Plan

**Free plan:** Discord tools, basic Claude conversation, health/tools introspection.

**Starter plan (adds):** GitHub integration, Toggl integration, Fly session launching, Onyx search.

**Pro plan (adds):** Linear integration, all admin-class features, unlimited Fly sessions.

| Scope Tag Required | Tools |
|-------------------|-------|
| `Scope.PLAN_STARTER` | All `fly_*` tools, `onyx_*` tools, `github_run_gh`, all `toggl_*` tools |
| `Scope.PLAN_PRO` | All `linear_*` tools, `bluedot_*` tools, `acp_*` tools, `decision_hub_*` tools |
| None (Free) | `discord_*` tools, `health_check`, `tools_list`, basic agent conversation |

**Note:** Exact feature matrix is defined in [premium/features-by-tier.md](../premium/features-by-tier.md). The tags above are the enforcement mechanism; that file is the source of truth for what's in each tier.

### 5.4 ToolRegistry Initialization With Plan Context

`create_tool_registry()` gains a `tenant_plan` parameter:

```python
def create_tool_registry(
    tool_context: ToolContext,
    db_context: DatabaseContext | None = None,
    *,
    remote_tools: list[ToolDef] | None = None,
    tenant_plan: str = "free",
    is_platform_admin: bool = False,
) -> ToolRegistry:
    """
    tenant_plan: 'free' | 'starter' | 'pro'
    is_platform_admin: True only for the PyMC admin tenant
    """
```

Both `tenant_plan` and `is_platform_admin` come from `TenantConfig` and are passed through from `TenantConnectionManager.add_tenant()`.

---

## 6. Tool Execution Flow (End-to-End, Multi-Tenant)

```
[Discord Message from user @alice in guild XYZ]
                ↓
TenantConnectionManager routes to TenantClient for guild XYZ
                ↓
TenantClient.on_message(message)
                ↓
build_user_context(
    discord_id = message.author.id,
    tenant_id  = self.tenant_id,            # From TenantClient.tenant_id
    supabase   = self.supabase_client,      # Service role — bypasses RLS
) → UserContext
                ↓
Select ToolRegistry for tenant_id:
    registry = connection_manager.get_registry(tenant_id)
                ↓
Claude agent processes message:
    - Uses tenant's ToolContext (tenant's anthropic_api_key, discord_token, etc.)
    - Claude returns tool_use block: {"name": "fly_launch_session", "input": {...}}
                ↓
registry.call_tool("fly_launch_session", params, user_context)
                ↓
Gate checks (in order):
    1. Tool exists in registry?           → ToolNotFoundError if not
    2. Scope.PLATFORM_ADMIN required?     → ToolError if not admin tenant
    3. Scope.PLAN_PRO/PLAN_STARTER?       → ToolError if wrong plan
    4. requires_credential set?           → ToolError if credential missing from user_context
    5. Scope.TOGGL_WORKSPACE_ADMIN?       → ToolError if not toggl admin
                ↓
tool_def.handler(tool_context, user_context, db_context, params)
                ↓
Tool executes using tenant's credentials (e.g., fly_launch_session uses
    tool_context.fly_api_token + tool_context.fly_org_slug from platform env)
                ↓
Returns str result → Claude agent incorporates → Discord reply
```

---

## 7. Credential Update Propagation

When a tenant updates their credentials through the Daimon website (e.g., changes their Anthropic API key), the bot must use the new credentials without restarting.

### 7.1 Trigger

Supabase Realtime emits an UPDATE event on `tenant_api_keys` with the new `vault_secret_id`. The bot's Realtime listener receives this and calls `TenantConnectionManager.refresh_tenant_context(tenant_id)`.

### 7.2 Refresh Sequence

```
Realtime UPDATE received: tenant_api_keys WHERE tenant_id = X
                ↓
TenantConnectionManager.refresh_tenant_context(tenant_id=X)
                ↓
1. Re-query tenant credentials from Supabase:
   - discord_connections WHERE tenant_id = X
   - tenant_api_keys WHERE tenant_id = X (gets new vault_secret_id)
   - tenant_service_connections WHERE tenant_id = X
                ↓
2. Decrypt new credentials via Vault
                ↓
3. Build new TenantConfig
                ↓
4. Build new ToolContext via build_tenant_tool_context()
                ↓
5. Build new ToolRegistry via create_tool_registry()
                ↓
6. Atomically swap: self._tenant_registries[tenant_id] = new_registry
                ↓
7. Log: "Refreshed tool context for tenant {tenant_id}"
```

**Atomicity:** Python's GIL ensures dict assignment is atomic. In-flight `call_tool()` invocations on the old registry complete before it's garbage-collected. No lock needed.

**Discord client not restarted:** The Discord connection itself is not affected by a credential refresh. Only the ToolRegistry (and the ToolContext it holds) is swapped. The tenant's Discord client continues listening without interruption.

---

## 8. Isolation Guarantees

| Isolation Property | Mechanism | Guarantee Strength |
|-------------------|-----------|-------------------|
| Discord messages | Each tenant has its own `discord.Client` with its own token; `on_message` only fires for messages in their guild | **Strong** — hardware-separated |
| Anthropic API key | `ToolContext.anthropic_api_key` is set to tenant's BYOK key; Claude calls use that key | **Strong** — all Claude calls billed to tenant's key |
| Claude conversation context | Each Discord thread has its own conversation history; history is per-thread, per-channel, not shared | **Strong** — no cross-tenant context bleed |
| Supabase DB rows | Tools that write to Supabase use the tenant_id from UserContext or TenantConfig to scope all writes | **Strong** — enforced in tool handlers |
| Per-user credentials | `user_credentials` is global by design; one user can use their GitHub across guilds | **Intentional design decision** |
| Platform admin tools | PLATFORM_ADMIN scope gate in ToolRegistry; admin guild ID checked at registry init | **Strong** — enforced before handler call |
| Plan-gated tools | PLAN_STARTER/PLAN_PRO scope gate; plan checked at registry init from TenantConfig | **Strong** — enforced before handler call |

---

## 9. Files Changed from Single-Tenant

| File | Change Type | Description |
|------|-------------|-------------|
| `src_v2/mcp/context.py` | **MODIFY** | Add `tenant_id: uuid.UUID` to `UserContext` |
| `src_v2/mcp/tags.py` | **MODIFY** | Add `Scope.PLATFORM_ADMIN`, `Scope.PLAN_STARTER`, `Scope.PLAN_PRO` |
| `src_v2/mcp/registry.py` | **MODIFY** | Add plan/admin gate in `call_tool()`, add `tenant_plan` + `is_platform_admin` params to `ToolRegistry.__init__()` |
| `src_v2/mcp/catalog.py` | **MODIFY** | Add `Scope.PLATFORM_ADMIN` to LinkedIn, GA, Dub tools; add `Scope.PLAN_STARTER`/`PLAN_PRO` to gated tools |
| `src_v2/bootstrap/context_builder.py` | **NEW** | `build_tenant_tool_context()` function, `TenantConfig` namedtuple, `SystemConfig` namedtuple |
| `src_v2/mcp/catalog.py` (factory) | **MODIFY** | `create_tool_registry()` gains `tenant_plan` + `is_platform_admin` params |
| `src_v2/entrypoints/discord/tenant_client.py` | **NEW** | `TenantClient` class — per-tenant `discord.Client` with `tenant_id` |
| `src_v2/entrypoints/discord/connection_manager.py` | **NEW** | `TenantConnectionManager` — see connection-manager.md |
