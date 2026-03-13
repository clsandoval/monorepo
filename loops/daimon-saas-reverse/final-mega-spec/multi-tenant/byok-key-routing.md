# BYOK Key Routing — Per-Tenant Anthropic & OpenAI API Keys

**Aspect:** 2.3 — BYOK key routing per tenant
**Wave:** Wave 2 — Multi-Tenant Adaptation
**Written:** 2026-03-13
**References:**
- [source/existing-bot-architecture.md](../source/existing-bot-architecture.md) — ToolContext fields, env var mapping
- [source/existing-auth.md](../source/existing-auth.md) — Vault encryption, user_credentials pattern
- [multi-tenant/connection-manager.md](./connection-manager.md) — TenantConnectionManager, TenantConfig
- [multi-tenant/tenant-scoping.md](./tenant-scoping.md) — Per-tenant ToolContext partitioning
- [database/schema.md](../database/schema.md) — `tenant_api_keys` table

---

## 1. Current Single-Tenant Behavior

### 1.1 How the Bot Uses the Anthropic API Key Today

In the current single-tenant deployment:

1. **At startup**, `bootstrap/config.py` reads `ANTHROPIC_API_KEY` from the Fly.io environment variable.
2. This value is stored in `ToolContext.anthropic_api_key` — a frozen string field.
3. The key is **not passed directly to the Anthropic Python SDK** at the top level. Instead, it is forwarded to Fly.io session machines via `ToolContext.fly_api_token` + `ANTHROPIC_API_KEY` env injection.

**Fly.io session machines:**
- Each Claude conversation runs in a Fly.io ephemeral Machine.
- The Machine is launched by the `fly_run_session` tool with the `ANTHROPIC_API_KEY` environment variable injected.
- Inside the Machine, the Claude Agent SDK reads this env var via `anthropic.Anthropic()` (standard SDK init).
- The Machine exits when the conversation ends.

**Key transport path (single-tenant):**
```
Fly.io env var ANTHROPIC_API_KEY
  → ToolContext.anthropic_api_key (at bot startup)
    → fly_run_session tool invocation
      → Fly Machine launched with ANTHROPIC_API_KEY env var injected
        → anthropic.Anthropic() inside Machine reads it
          → Claude API call using PyMC's key
```

### 1.2 Why This Cannot Scale to Multi-Tenant

| Problem | Explanation |
|---------|-------------|
| One API key for all tenants | Every tenant's Claude calls consume PyMC's Anthropic quota |
| Key is in env var, not DB | Cannot change key per tenant without redeploying the bot |
| No quota isolation | If one tenant goes viral, it impacts all other tenants' rate limits |
| BYOK is impossible | Users cannot bring their own key — there's nowhere to store or route it |
| No OpenAI key support | Classification/routing via OpenAI (haiku-equivalent tasks) uses a single env key too |

### 1.3 ToolContext Fields Affected

```python
# src_v2/bootstrap/config.py (single-tenant)
@dataclass(frozen=True)
class ToolContext:
    anthropic_api_key: str    # → Must become per-tenant in multi-tenant
    # ...all other fields
```

The `openai_api_key` field (if present in the single-tenant codebase for classification tasks)
follows the same pattern and is similarly affected.

---

## 2. BYOK Architecture

### 2.1 Core Principle

**BYOK = Bring Your Own Key.** Every tenant provides their own Anthropic API key. The platform:
1. Stores the key encrypted in Supabase Vault
2. Decrypts it at bot startup into the tenant's `ToolContext`
3. Routes it to Fly.io session machines as the session's `ANTHROPIC_API_KEY`
4. Never charges for API usage — the tenant's key pays for their own Claude calls
5. Validates the key before storing (test API call)
6. Hot-reloads the key when the tenant updates it (via Supabase Realtime)

### 2.2 Storage Architecture

Keys are stored in the `tenant_api_keys` table with Vault encryption:

```sql
-- tenant_api_keys table (full spec in database/schema.md)
CREATE TABLE public.tenant_api_keys (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    provider        TEXT NOT NULL,           -- 'anthropic' | 'openai'
    vault_secret_id UUID NOT NULL,           -- FK to vault.secrets(id)
    key_hint        TEXT NOT NULL,           -- 'sk-ant-...ab12' (first 8 + last 4 chars)
    status          TEXT NOT NULL DEFAULT 'active',  -- 'active' | 'invalid' | 'revoked'
    validated_at    TIMESTAMPTZ,             -- Last successful validation timestamp
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, provider)             -- One key per provider per tenant
);
```

**Vault storage pattern:**
```sql
-- When tenant saves their Anthropic key:
-- 1. Encrypt and store in Vault
SELECT vault.create_secret(
    'sk-ant-api03-...',                         -- plaintext key (from validated POST body)
    'tenant_api_keys:' || tenant_id || ':anthropic',  -- unique name in Vault
    'Anthropic API key for tenant ' || tenant_id      -- description
) AS vault_secret_id;

-- 2. Store reference + hint in tenant_api_keys
INSERT INTO tenant_api_keys (tenant_id, provider, vault_secret_id, key_hint, validated_at)
VALUES (
    :tenant_id,
    'anthropic',
    :vault_secret_id,
    'sk-ant-...ab12',  -- constructed by server: key[:8] + '...' + key[-4:]
    NOW()
);
```

**Key hint construction rule:**
- For Anthropic keys: `key[:8] + '...' + key[-4:]` → `'sk-ant-a...'ab12'`
- For OpenAI keys: `key[:7] + '...' + key[-4:]` → `'sk-proj...ab12'`
- The hint is stored as `key_hint` in `tenant_api_keys` — it is safe to display in the UI
- The full plaintext key is NEVER stored anywhere except Vault

---

## 3. Bot-Side Key Loading

### 3.1 TenantConfig Expansion

The `TenantConfig` dataclass (defined in `multi-tenant/connection-manager.md`) is expanded
to carry decrypted API keys:

```python
@dataclass(frozen=True)
class TenantConfig:
    tenant_id: uuid.UUID
    tenant_name: str
    discord_token: str          # Decrypted from discord_connections.vault_secret_id
    guild_id: str               # From discord_connections.guild_id
    anthropic_api_key: str      # Decrypted from tenant_api_keys WHERE provider='anthropic'
    openai_api_key: str | None  # Decrypted from tenant_api_keys WHERE provider='openai' (optional)
    plan: str                   # From tenants.plan: 'free' | 'starter' | 'pro'
    discord_connection_id: uuid.UUID  # PK of discord_connections row
```

### 3.2 Key Loading at Startup

The `TenantConnectionManager` loads API keys when assembling `TenantConfig` for each tenant:

```python
async def _load_tenant_config(self, tenant_id: uuid.UUID) -> TenantConfig | None:
    """
    Load complete tenant configuration from Supabase, including decrypted API keys.
    Returns None if required credentials are missing.
    """
    # 1. Load discord connection
    conn_row = await self._supabase.table('discord_connections') \
        .select('id, guild_id, vault_secret_id, status') \
        .eq('tenant_id', str(tenant_id)) \
        .eq('status', 'active') \
        .maybe_single() \
        .execute()

    if not conn_row.data:
        logger.warning(f"Tenant {tenant_id}: no active discord_connection found, skipping")
        return None

    # 2. Decrypt discord token from Vault
    discord_token = await self._decrypt_vault_secret(conn_row.data['vault_secret_id'])

    # 3. Load API keys
    keys_rows = await self._supabase.table('tenant_api_keys') \
        .select('provider, vault_secret_id, status') \
        .eq('tenant_id', str(tenant_id)) \
        .eq('status', 'active') \
        .execute()

    keys_by_provider: dict[str, str] = {}
    for row in keys_rows.data:
        decrypted = await self._decrypt_vault_secret(row['vault_secret_id'])
        keys_by_provider[row['provider']] = decrypted

    # 4. Require anthropic key
    if 'anthropic' not in keys_by_provider:
        logger.warning(f"Tenant {tenant_id}: no active anthropic key, skipping")
        return None

    # 5. Load tenant metadata
    tenant_row = await self._supabase.table('tenants') \
        .select('name, plan, status') \
        .eq('id', str(tenant_id)) \
        .single() \
        .execute()

    if tenant_row.data['status'] != 'active':
        logger.info(f"Tenant {tenant_id}: status={tenant_row.data['status']}, skipping")
        return None

    return TenantConfig(
        tenant_id=tenant_id,
        tenant_name=tenant_row.data['name'],
        discord_token=discord_token,
        guild_id=conn_row.data['guild_id'],
        anthropic_api_key=keys_by_provider['anthropic'],
        openai_api_key=keys_by_provider.get('openai'),  # Optional
        plan=tenant_row.data['plan'],
        discord_connection_id=uuid.UUID(conn_row.data['id']),
    )

async def _decrypt_vault_secret(self, vault_secret_id: str) -> str:
    """
    Decrypt a Vault secret using the service role key.
    Uses: SELECT decrypted_secret FROM vault.decrypted_secrets WHERE id = :id
    """
    result = await self._supabase.rpc('get_decrypted_secret', {'secret_id': vault_secret_id}).execute()
    # Supabase Edge Function or RPC wrapping vault.decrypted_secrets access
    return result.data['decrypted_secret']
```

**Note on Vault access:** `vault.decrypted_secrets` is only accessible via service role.
The bot uses `SUPABASE_SERVICE_ROLE_KEY` for all DB operations. The RPC function
`get_decrypted_secret` is a Postgres function that reads `vault.decrypted_secrets`:

```sql
CREATE OR REPLACE FUNCTION public.get_decrypted_secret(secret_id UUID)
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER  -- runs as postgres superuser, can access vault schema
AS $$
    SELECT decrypted_secret FROM vault.decrypted_secrets WHERE id = secret_id;
$$;
```

### 3.3 ToolContext Construction from TenantConfig

```python
def _build_tool_context(self, config: TenantConfig) -> ToolContext:
    """
    Build a per-tenant ToolContext. BYOK keys injected here.
    System-level keys (Fly, Onyx, LinkedIn, etc.) come from platform env vars.
    """
    return ToolContext(
        # Per-tenant fields (from TenantConfig)
        discord_token=config.discord_token,
        discord_guild_id=config.guild_id,
        anthropic_api_key=config.anthropic_api_key,  # ← BYOK: tenant's own key

        # System-level fields (from platform env vars — same for all tenants)
        fly_api_token=os.environ['FLY_API_TOKEN'],
        fly_org_slug=os.environ['FLY_ORG_SLUG'],
        onyx_api_key=os.environ.get('ONYX_API_KEY', ''),
        onyx_base_url=os.environ.get('ONYX_BASE_URL', ''),
        linkedin_community_token=os.environ.get('LINKEDIN_COMMUNITY_TOKEN', ''),
        linkedin_ads_token=os.environ.get('LINKEDIN_ADS_TOKEN', ''),
        linkedin_org_id=os.environ.get('LINKEDIN_ORG_ID', ''),
        ga_service_account_json=os.environ.get('GA_SERVICE_ACCOUNT_JSON', ''),
        ga_property_id=os.environ.get('GA_PROPERTY_ID', ''),
        linear_api_key=os.environ.get('LINEAR_API_KEY', ''),
        linear_team_id=os.environ.get('LINEAR_TEAM_ID', ''),
        dub_api_key=os.environ.get('DUB_API_KEY', ''),
        toggl_workspace_id=os.environ.get('TOGGL_WORKSPACE_ID', ''),
        toggl_organization_id=os.environ.get('TOGGL_ORGANIZATION_ID', ''),
    )
```

**Critical design decision — system-level tool availability in multi-tenant SaaS:**

Many `ToolContext` fields (LinkedIn, Google Analytics, Onyx, Toggl workspace, etc.) are
system-level credentials for PyMC's own integrations. In the SaaS version:

| Tool Category | Availability in SaaS | Rationale |
|--------------|---------------------|-----------|
| Discord tools | Per-tenant (uses tenant's guild) | Core feature — tenant's own Discord |
| Anthropic Claude calls | Per-tenant (uses tenant's BYOK key) | Core BYOK feature |
| GitHub, Toggl, Linear, Google | Per-tenant service connections | Configured per tenant in dashboard |
| LinkedIn tools | **NOT available to SaaS tenants** | PyMC internal tool, no multi-tenant support |
| Google Analytics tools | **NOT available to SaaS tenants** | PyMC internal tool, requires GA property ID |
| Onyx RAG tools | **NOT available to SaaS tenants** | PyMC's own Onyx instance |
| Fly.io tools | Available via platform account | Fly API is shared, sessions scoped to tenant |
| Dub.co tools | NOT available (PyMC internal) | PyMC's Dub account |

**Implementation:** System-level tools that should not be available to SaaS tenants are
excluded from the `ToolRegistry` when creating a multi-tenant instance. The `create_tool_registry`
factory accepts an optional `excluded_tools: set[str]` parameter. See [tenant-scoping.md](./tenant-scoping.md)
for the complete list of tools disabled in SaaS mode.

---

## 4. Key Routing to Fly.io Session Machines

### 4.1 How the Anthropic Key Reaches Claude

The bot does not call the Anthropic SDK directly. It launches Fly.io ephemeral Machines
(the `fly_run_session` tool) that run the Claude Agent SDK. The tenant's BYOK key must
reach these Machines as an environment variable.

**Key injection path:**

```python
# In fly_run_session tool handler (src_v2/tools/fly/run_session.py or equivalent)
async def fly_run_session_handler(
    params: FlyRunSessionInput,
    tool_context: ToolContext,
    user_context: UserContext,
    db_context: DatabaseContext | None,
) -> str:
    """
    Launch a Fly.io ephemeral Machine with the Claude Agent SDK.
    Injects tenant's BYOK Anthropic key as env var.
    """
    machine_config = {
        "image": "registry.fly.io/pymc-decision-session:latest",
        "env": {
            "ANTHROPIC_API_KEY": tool_context.anthropic_api_key,  # ← Tenant's BYOK key
            "GUILD_ID": tool_context.discord_guild_id,            # ← Tenant's guild
            "SUPABASE_URL": os.environ['SUPABASE_URL'],           # ← Platform Supabase
            "SUPABASE_SERVICE_ROLE_KEY": os.environ['SUPABASE_SERVICE_ROLE_KEY'],
            # ... other session env vars
        },
        "size": "shared-cpu-1x",
        "auto_destroy": True,
        # ... other Fly machine config
    }

    # Launch via Fly Machines API
    response = await fly_client.machines.create(
        app_name=os.environ['FLY_SESSION_APP'],
        config=machine_config,
    )
    return f"Session machine launched: {response.id}"
```

**Security property:** The tenant's `anthropic_api_key` is:
1. Loaded into `ToolContext` at tenant startup (in memory only)
2. Injected into Fly Machine env at session launch (encrypted in transit via TLS)
3. Never written to disk, logs, or persistent storage in the bot process
4. Never returned in any API response or tool output
5. The Machine auto-destroys after the session ends, clearing the env var

### 4.2 Per-Tenant API Key Isolation

Each tenant's Claude calls use their own key. This provides:

| Property | Mechanism |
|---------|----------|
| Rate limit isolation | Each tenant's key has its own Anthropic rate limits |
| Cost isolation | Usage billed to tenant's Anthropic account, not the platform |
| Quota independence | One tenant's heavy usage doesn't impact another's |
| Compliance | Tenant's data goes through their own Anthropic account |
| Auditability | Tenant can see their own usage in Anthropic console |

---

## 5. Key Validation (Website Side)

### 5.1 Validation Endpoint

When a tenant saves their Anthropic key via the dashboard, the website validates it before
storing it in Vault.

**Route:** `POST /api/keys/validate-anthropic`

**Request:**
```typescript
interface ValidateAnthropicKeyRequest {
    api_key: string  // Full plaintext key from the form
}
```

**Response (success):**
```typescript
interface ValidateAnthropicKeyResponse {
    valid: true
    key_hint: string  // 'sk-ant-...ab12' — for display in UI after save
}
```

**Response (failure):**
```typescript
interface ValidateAnthropicKeyResponse {
    valid: false
    error: "invalid_key" | "rate_limited" | "network_error"
    message: string  // User-friendly error message
}
```

**Validation implementation:**
```typescript
// /app/api/keys/validate-anthropic/route.ts
import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    const { api_key } = await request.json()

    // Format check first — fail fast without network call
    if (!api_key.startsWith('sk-ant-')) {
        return NextResponse.json({
            valid: false,
            error: 'invalid_key',
            message: 'Invalid key format. Anthropic API keys start with "sk-ant-".',
        }, { status: 400 })
    }

    // Test API call — use cheapest possible request
    try {
        const client = new Anthropic({ apiKey: api_key })
        await client.messages.create({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 1,
            messages: [{ role: 'user', content: 'Hi' }],
        })
    } catch (err: unknown) {
        const error = err as { status?: number; error?: { type?: string } }
        if (error?.status === 401) {
            return NextResponse.json({
                valid: false,
                error: 'invalid_key',
                message: 'This API key is invalid or has been revoked.',
            }, { status: 400 })
        }
        if (error?.status === 429) {
            // Rate limited but key is valid
            return NextResponse.json({
                valid: true,
                key_hint: buildKeyHint(api_key, 'anthropic'),
            })
        }
        // Unexpected error — treat as network error, don't block save
        console.error('Anthropic key validation error:', error)
        return NextResponse.json({
            valid: false,
            error: 'network_error',
            message: 'Could not validate key. Please check your connection and try again.',
        }, { status: 503 })
    }

    return NextResponse.json({
        valid: true,
        key_hint: buildKeyHint(api_key, 'anthropic'),
    })
}

function buildKeyHint(key: string, provider: 'anthropic' | 'openai'): string {
    // 'sk-ant-api03-abc...' → 'sk-ant-a...abc1'
    // Show first 8 chars + '...' + last 4 chars
    return key.slice(0, 8) + '...' + key.slice(-4)
}
```

**Rate limiting:** Max 10 validation calls per tenant per minute (enforced via Supabase
middleware or Vercel edge rate limiting). Error response for exceeded rate limit:
```json
{ "error": "rate_limited", "message": "Too many validation attempts. Wait 60 seconds." }
```

### 5.2 OpenAI Key Validation

**Route:** `POST /api/keys/validate-openai`

**Format check:** OpenAI keys start with `sk-` (classic) or `sk-proj-` (project keys).

```typescript
// /app/api/keys/validate-openai/route.ts
// Test with a minimal chat completion call
await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 1,
    messages: [{ role: 'user', content: 'Hi' }],
})
```

**Key hint format:** `key[:7] + '...' + key[-4:]` → `'sk-proj...ab12'`

**Format check:**
```typescript
if (!api_key.startsWith('sk-')) {
    return error('Invalid key format. OpenAI API keys start with "sk-".')
}
```

---

## 6. Key Storage (Website Side — Save Flow)

### 6.1 Complete Save Flow

```
User pastes key in Billing/Integrations page
  ↓
Client-side: basic format check (no network — instant feedback)
  ↓
User clicks "Validate & Save"
  ↓
POST /api/keys/validate-anthropic { api_key: "sk-ant-..." }
  [Server validates with Anthropic API]
  ↓
If valid: Server calls Supabase Edge Function to store in Vault
  POST /functions/v1/store-tenant-api-key
  { tenant_id, provider: 'anthropic', api_key: 'sk-ant-...' }
  ↓
Edge Function:
  1. vault.create_secret(api_key, name, description) → vault_secret_id
  2. UPSERT into tenant_api_keys (tenant_id, provider, vault_secret_id, key_hint, validated_at)
     ON CONFLICT (tenant_id, provider) DO UPDATE SET vault_secret_id = EXCLUDED.vault_secret_id,
     key_hint = EXCLUDED.key_hint, validated_at = EXCLUDED.validated_at, status = 'active'
  3. Return { key_hint, created_at }
  ↓
Response returned to browser: { key_hint: 'sk-ant-...ab12' }
  ↓
UI updates to show masked key: "sk-ant-...ab12 ✓ Connected"
  ↓
Supabase Realtime fires INSERT/UPDATE on tenant_api_keys row
  ↓
Bot's TenantConnectionManager receives Realtime event (see section 7)
  ↓
Bot hot-reloads the key for this tenant
```

**Why use an Edge Function for Vault storage?**
- `vault.create_secret()` requires database-level access that Vault grants only to service role
- Edge Functions run with service role key (set in Supabase dashboard secrets)
- The Next.js API route cannot call `vault.create_secret()` with the anon key
- The Edge Function verifies the user's JWT before writing (not just blindly trusting the call)

**Edge Function input validation:**
```typescript
// supabase/functions/store-tenant-api-key/index.ts
const { tenant_id, provider, api_key } = await req.json()

// Verify caller is authenticated and owns the tenant
const { data: { user } } = await supabase.auth.getUser(authHeader)
if (!user) return error(401, 'Unauthorized')

const { data: membership } = await supabase
    .from('tenant_members')
    .select('role')
    .eq('tenant_id', tenant_id)
    .eq('user_id', user.id)
    .single()

if (!membership || !['owner', 'admin'].includes(membership.role)) {
    return error(403, 'Not authorized to manage API keys for this tenant')
}

// provider must be 'anthropic' or 'openai'
if (!['anthropic', 'openai'].includes(provider)) {
    return error(400, 'Invalid provider')
}
```

---

## 7. Hot Key Reload (Runtime Key Update)

### 7.1 Why Hot Reload Is Needed

When a tenant updates their API key via the dashboard:
1. The old key in the bot's in-memory `TenantConfig` is stale
2. The bot cannot restart — that would drop all other tenants' connections
3. The bot must reload only the affected tenant's key without disruption

### 7.2 Realtime Trigger

The `TenantConnectionManager` subscribes to changes in `tenant_api_keys`:

```python
# In TenantConnectionManager.__aenter__ or startup
self._supabase.channel('tenant-api-keys') \
    .on('postgres_changes', {
        'event': 'INSERT',
        'schema': 'public',
        'table': 'tenant_api_keys',
    }, self._on_api_key_change) \
    .on('postgres_changes', {
        'event': 'UPDATE',
        'schema': 'public',
        'table': 'tenant_api_keys',
    }, self._on_api_key_change) \
    .subscribe()
```

**Realtime payload shape:**
```python
{
    "type": "postgres_changes",
    "table": "tenant_api_keys",
    "schema": "public",
    "event": "INSERT" | "UPDATE",
    "new": {
        "id": "uuid",
        "tenant_id": "uuid",
        "provider": "anthropic" | "openai",
        "vault_secret_id": "uuid",
        "key_hint": "sk-ant-...ab12",
        "status": "active",
        "validated_at": "2026-03-13T10:00:00Z",
    },
    "old": { ... }  # Previous row for UPDATE events
}
```

**Note:** The `vault_secret_id` is in the Realtime payload. The actual key is NOT in the payload
(Vault secrets are never surfaced via Realtime). The bot must call Vault to decrypt the new key.

### 7.3 Hot Reload Handler

```python
async def _on_api_key_change(self, payload: dict) -> None:
    """
    Handle INSERT or UPDATE on tenant_api_keys.
    Decrypts new key and updates TenantConfig + ToolContext in-place.
    """
    row = payload['new']
    tenant_id = uuid.UUID(row['tenant_id'])
    provider = row['provider']
    new_vault_secret_id = row['vault_secret_id']
    new_status = row['status']

    if tenant_id not in self._connections:
        logger.info(f"API key change for inactive tenant {tenant_id}, ignoring")
        return

    if new_status != 'active':
        logger.info(f"API key {provider} for tenant {tenant_id} status={new_status}, not reloading")
        return

    # Decrypt new key from Vault
    new_key = await self._decrypt_vault_secret(new_vault_secret_id)

    # Get the current TenantRunner
    runner = self._connections[tenant_id]

    # Update TenantConfig with new key
    old_config = runner.config
    if provider == 'anthropic':
        new_config = TenantConfig(
            **{**old_config.__dict__, 'anthropic_api_key': new_key}
        )
    elif provider == 'openai':
        new_config = TenantConfig(
            **{**old_config.__dict__, 'openai_api_key': new_key}
        )
    else:
        logger.warning(f"Unknown provider in api key change: {provider}")
        return

    # Rebuild ToolContext with new key
    new_tool_context = self._build_tool_context(new_config)

    # Update runner atomically — new messages use new context, in-flight messages
    # continue with old context (Python dict assignment is thread-safe for CPython)
    runner.config = new_config
    runner.tool_context = new_tool_context

    logger.info(f"Hot-reloaded {provider} API key for tenant {tenant_id}")
```

**Concurrency safety:** `TenantRunner.tool_context` is replaced atomically (Python dict/attr
assignment is atomic at the bytecode level for CPython). In-flight Fly Machine launches already
have the old key injected — they complete successfully. New sessions after the hot-reload use
the new key.

---

## 8. Key Lifecycle State Machine

```
                    ┌─────────────────┐
                    │                 │
              ┌────►│    active       │────────────────┐
              │     │                 │                │
              │     └────────┬────────┘                │
              │              │ Tenant saves             │
              │              │ new key                  │
              │              ▼                          │
              │     ┌─────────────────┐                │
              │     │                 │                │ 401 from
    Tenant saves    │    active       │                │ Anthropic API
    new valid key   │  (new row,      │                │ (async check)
              │     │  old archived)  │                │
              │     └─────────────────┘                │
              │                                        ▼
              │                               ┌─────────────────┐
              │                               │                 │
              └──────────────────────────────┤    invalid      │
                                              │                 │
                                              └────────┬────────┘
                                                       │
                                                  Admin marks
                                                  revoked / tenant
                                                  deletes key
                                                       │
                                                       ▼
                                              ┌─────────────────┐
                                              │                 │
                                              │    revoked      │
                                              │                 │
                                              └─────────────────┘
```

**Status transitions:**

| From | To | Trigger | Bot Behavior |
|------|----|---------|-------------|
| (none) | `active` | Tenant saves new key (passes validation) | Hot-reload into ToolContext |
| `active` | `active` | Tenant replaces key (upsert) | Hot-reload new key |
| `active` | `invalid` | Async 401 detected during Fly session launch | Log error, update status, send Realtime alert to bot |
| `invalid` | `active` | Tenant saves new valid key | Hot-reload, clear error state |
| `active` | `revoked` | Admin action or tenant explicitly removes key | Bot disconnects tenant |
| `invalid` | `revoked` | Admin action | No bot action needed |

### 8.1 Async Invalidity Detection

The bot detects key invalidity **asynchronously** when a Fly Machine fails to launch:

```python
async def _handle_fly_session_launch_error(
    self, tenant_id: uuid.UUID, error: Exception
) -> None:
    """
    Called when fly_run_session fails with auth error.
    Updates tenant_api_keys.status to 'invalid'.
    """
    if isinstance(error, AnthropicAuthError):  # 401 from Anthropic SDK
        logger.error(f"Tenant {tenant_id}: Anthropic key invalid — marking as invalid")

        await self._supabase.table('tenant_api_keys') \
            .update({'status': 'invalid', 'updated_at': 'NOW()'}) \
            .eq('tenant_id', str(tenant_id)) \
            .eq('provider', 'anthropic') \
            .execute()

        # Also update discord_connections to reflect the issue
        await self._supabase.table('discord_connections') \
            .update({'status': 'error', 'last_error': 'Anthropic API key is invalid'}) \
            .eq('tenant_id', str(tenant_id)) \
            .execute()

        # Disconnect this tenant to stop accepting messages
        await self._disconnect_tenant(tenant_id, reason='invalid_anthropic_key')
```

---

## 9. UI Behavior (Key Management in Dashboard)

### 9.1 Billing Page — API Key Section

The Billing page (route: `/dashboard/billing`) contains the API key management section.
See [frontend/billing-page.md](../frontend/billing-page.md) for full page spec.

**Key display states:**

| State | Display |
|-------|---------|
| No key set | "No Anthropic API key configured" + "Add Key" button |
| Key set, active | "sk-ant-...ab12" + green "✓ Connected" badge + "Replace Key" button |
| Key set, invalid | "sk-ant-...ab12" + red "✗ Invalid" badge + "Replace Key" button + error message |
| Key being validated | Spinner + "Validating..." text |
| Validation failed | Red error message (format below) + form remains open |
| Save success | Key masked display + green toast "API key saved successfully" |

### 9.2 Error Messages (Exact Copy)

| Error Scenario | User-Facing Message |
|---------------|---------------------|
| Wrong format (not sk-ant-) | "Invalid key format. Anthropic API keys begin with \"sk-ant-\"." |
| Invalid key (401) | "This API key is invalid or has been revoked. Check your Anthropic console." |
| Rate limited during validation | "Your Anthropic account is rate limited. The key has been saved — try using it in a moment." |
| Network error during validation | "Could not reach Anthropic to validate the key. Please try again." |
| Key marked invalid by bot | Orange banner: "Your Anthropic API key appears to be invalid. Replace it to restore your bot." |
| OpenAI: wrong format | "Invalid key format. OpenAI API keys begin with \"sk-\"." |
| OpenAI: invalid key (401) | "This OpenAI API key is invalid or has been revoked. Check your OpenAI console." |

### 9.3 Replace Key Flow

When tenant clicks "Replace Key":
1. A modal appears: "Replace API Key — Your current key sk-ant-...ab12 will be replaced."
2. Input field: label "New Anthropic API Key", type="password" (toggle visibility icon), placeholder "sk-ant-api03-..."
3. Buttons: "Cancel" (closes modal) | "Validate & Save" (triggers validation + save)
4. On success: modal closes, display updates to show new key hint, green toast
5. On failure: error shown inside modal, modal stays open

---

## 10. OpenAI Key (Optional BYOK)

### 10.1 Purpose

The bot optionally uses OpenAI for classification/routing tasks that are cheaper on GPT-4o-mini
than Claude. In SaaS mode, tenants can optionally provide an OpenAI key.

### 10.2 Behavior Without OpenAI Key

If `TenantConfig.openai_api_key is None`:
- All classification/routing tasks fall back to `claude-haiku-4-5-20251001` using the tenant's Anthropic key
- No functionality is lost — only potential cost efficiency for certain tasks
- The UI shows "OpenAI key: Not configured (optional)" in the Billing page

### 10.3 Behavior With OpenAI Key

If `TenantConfig.openai_api_key is not None`:
- Classification tasks use `gpt-4o-mini` via the tenant's OpenAI key
- The key is injected into Fly session Machines as `OPENAI_API_KEY`
- Usage is billed to the tenant's OpenAI account

### 10.4 Storage

Same `tenant_api_keys` table with `provider = 'openai'`. Same Vault pattern. Same hot-reload
mechanism. UNIQUE constraint allows one OpenAI key per tenant.

---

## 11. Security Properties

| Property | Mechanism |
|---------|----------|
| Key at rest | Supabase Vault (pgcrypto AES-256), never stored as plaintext |
| Key in transit | TLS on all API calls (Supabase, Fly.io Machines API) |
| Key in bot memory | Loaded into `TenantConfig` object at startup, never written to disk or logs |
| Key in Fly Machine | Injected as env var via Fly Machines API (TLS-encrypted), cleared on Machine auto-destroy |
| Key in UI | Only `key_hint` (masked) ever returned to browser; full key only flows server→Vault |
| Key in logs | Bot logs only `key_hint` format (first 8 + '...' + last 4), never full key |
| Key in Realtime payload | `vault_secret_id` (UUID) in payload — not the key itself |
| Admin visibility | Admin panel shows `key_hint` only — admins cannot recover full keys |
| Key rotation | Replacing a key archives the old Vault secret; `vault.secrets` retains history for audit |

---

## 12. Cross-References

- [multi-tenant/connection-manager.md](./connection-manager.md) — `TenantConnectionManager` startup, `TenantConfig` dataclass
- [multi-tenant/tenant-scoping.md](./tenant-scoping.md) — Which tools are available per tenant; `ToolContext` partitioning
- [multi-tenant/realtime-contract.md](./realtime-contract.md) — Realtime channel for `tenant_api_keys` changes
- [database/schema.md](../database/schema.md) — `tenant_api_keys` table full schema
- [database/vault-encryption.md](../database/vault-encryption.md) — Vault setup, `get_decrypted_secret` function
- [frontend/billing-page.md](../frontend/billing-page.md) — Full billing page spec including key management UI
- [api/routes.md](../api/routes.md) — `/api/keys/validate-anthropic` and `/api/keys/validate-openai` endpoints
- [integrations/stripe.md](../integrations/stripe.md) — Plan gating: which plans require a BYOK key
