# Vault Encryption — Daimon SaaS Platform

**Aspect:** 3.3 — Vault setup and encrypt/decrypt patterns
**Wave:** Wave 3 — Exhaustive Data Model
**Written:** 2026-03-13
**References:**
- [schema.md](./schema.md) — Tables that use Vault: `discord_connections`, `tenant_api_keys`
- [multi-tenant/byok-key-routing.md](../multi-tenant/byok-key-routing.md) — Key routing, hot-reload
- [multi-tenant/connection-manager.md](../multi-tenant/connection-manager.md) — Bot startup, secret decryption

---

## 1. What is Supabase Vault?

Supabase Vault is a PostgreSQL extension (`supabase_vault`) that provides encrypted secret storage directly within the database. It uses `pgsodium` (libsodium bindings) with AES-256-GCM encryption. Secrets are stored in the `vault.secrets` table as ciphertext and can only be decrypted via the `vault.decrypted_secrets` view — accessible only to the PostgreSQL superuser (i.e., service role).

**Key properties:**
- Encryption is performed at the database layer, not the application layer
- Plaintext keys are never stored in any public schema table
- The `vault.decrypted_secrets` view is inaccessible to RLS-scoped JWT users (anon, authenticated roles)
- Service role key (`SUPABASE_SERVICE_ROLE_KEY`) is required to access `vault.decrypted_secrets`
- Vault is managed by Supabase — no manual key management required (Supabase holds the encryption root key)

---

## 2. Supabase Vault Schema

### 2.1 `vault.secrets` Table

The underlying storage table. Application code does NOT insert directly — use `vault.create_secret()`.

```sql
-- vault.secrets (managed by Supabase — do not create manually)
-- Approximate structure:
TABLE vault.secrets (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT,            -- human-readable identifier (not unique)
    description     TEXT,            -- optional description
    secret          TEXT,            -- encrypted ciphertext (AES-256-GCM)
    key_id          UUID,            -- reference to pgsodium.valid_key
    nonce           BYTEA,           -- encryption nonce
    created_at      TIMESTAMPTZ,
    updated_at      TIMESTAMPTZ
)
```

### 2.2 `vault.decrypted_secrets` View

The decryption view. Only accessible to PostgreSQL superuser (service role).

```sql
-- vault.decrypted_secrets (managed by Supabase — do not create manually)
-- Returns rows from vault.secrets with the decrypted plaintext:
VIEW vault.decrypted_secrets AS (
    SELECT
        id,
        name,
        description,
        decrypted_secret,   -- ← plaintext, decrypted on the fly
        secret,             -- ciphertext (still included for reference)
        key_id,
        nonce,
        created_at,
        updated_at
    FROM vault.secrets
    -- decryption performed by pgsodium internally
)
```

**Access control:** `vault.decrypted_secrets` is accessible ONLY to the `postgres` role (superuser). Supabase's `authenticated` and `anon` roles cannot query it. The bot accesses it via the `SECURITY DEFINER` wrapper function `public.get_decrypted_secret()`.

---

## 3. Vault Functions

### 3.1 `vault.create_secret()` — Store a New Secret

```sql
-- Function signature:
SELECT vault.create_secret(
    secret      TEXT,       -- plaintext value to encrypt
    name        TEXT,       -- human-readable name (stored as-is, NOT encrypted)
    description TEXT        -- optional description (stored as-is, NOT encrypted)
) RETURNS UUID;  -- returns the vault.secrets.id of the new record
```

**Important:** `name` and `description` are stored as plaintext in `vault.secrets`. Do not include sensitive information in these fields. They serve only as human-readable identifiers in the Supabase Vault dashboard.

**Example — storing a Discord bot token:**
```sql
SELECT vault.create_secret(
    'Bot.TokenHere.abc123',                                        -- plaintext token
    'discord_connections:' || gen_random_uuid()::text,             -- unique name
    'Discord bot token for tenant ' || '550e8400-e29b-41d4-a716'  -- description
) AS vault_secret_id;
-- Returns: 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
```

**Example — storing an Anthropic API key:**
```sql
SELECT vault.create_secret(
    'sk-ant-api03-ABCDEFGHIJKLMNOPabcdefghijklmn',              -- plaintext key
    'tenant_api_keys:550e8400-e29b-41d4-a716:anthropic',         -- unique name pattern
    'Anthropic API key for tenant 550e8400-e29b-41d4-a716'       -- description
) AS vault_secret_id;
-- Returns: 'c9bf9e57-1685-4c89-bafb-ff5af830be8a'
```

### 3.2 `vault.update_secret()` — Replace Secret Value

```sql
-- Function signature:
SELECT vault.update_secret(
    id          UUID,       -- vault.secrets.id to update
    secret      TEXT,       -- new plaintext value
    name        TEXT,       -- updated name (optional — pass existing name if unchanged)
    description TEXT        -- updated description (optional)
);
```

**Usage in Daimon:** NOT used. When a tenant replaces their API key or bot token, the platform creates a NEW Vault secret (getting a new UUID) and updates the reference in the application table (`vault_secret_id`). The old secret is then deleted via `vault.delete_secret()`. This pattern avoids `vault.update_secret()` to keep the application table's `vault_secret_id` always pointing to a live, valid secret — even if `update_secret` fails partway through, the old secret is still valid.

### 3.3 `vault.delete_secret()` — Permanently Delete a Secret

```sql
-- Function signature:
SELECT vault.delete_secret(
    id UUID  -- vault.secrets.id to delete
) RETURNS BOOLEAN;  -- true if deleted, false if not found
```

**When called:**
- After a successful UPSERT of `discord_connections.vault_secret_id` (new token replaces old)
- After a successful UPSERT of `tenant_api_keys.vault_secret_id` (new key replaces old)
- When `tenant_api_keys.status` is set to `'revoked'` (key permanently removed)
- When a tenant deletes their account (all secrets deleted before rows are deleted)

**Deletion is permanent.** There is no soft-delete or recovery for Vault secrets. This is intentional — key rotation and revocation should permanently destroy old key material.

---

## 4. Application-Layer Wrapper Functions

These PostgreSQL functions bridge between the application layer (Edge Functions, bot) and the Vault, providing safe, type-checked access patterns.

### 4.1 `public.get_decrypted_secret()` — Read a Secret (Service Role Only)

```sql
CREATE OR REPLACE FUNCTION public.get_decrypted_secret(secret_id UUID)
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, vault
AS $$
    SELECT decrypted_secret
    FROM vault.decrypted_secrets
    WHERE id = secret_id;
$$;

-- Grant execute to service role only (postgres already has access via SECURITY DEFINER)
-- The authenticated and anon roles should NOT have EXECUTE on this function
REVOKE EXECUTE ON FUNCTION public.get_decrypted_secret(UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_decrypted_secret(UUID) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.get_decrypted_secret(UUID) FROM anon;
-- Service role inherits from postgres — has access via SECURITY DEFINER escalation
```

**Security model:**
- `SECURITY DEFINER` causes this function to execute as `postgres` (superuser) regardless of caller
- The caller (bot using service role, or Edge Function using service role) is authenticated before calling
- The function returns NULL if `secret_id` does not exist in `vault.decrypted_secrets` (secret doesn't exist or is inaccessible)
- `SET search_path = public, vault` prevents search_path injection attacks
- `LANGUAGE sql` (not `LANGUAGE plpgsql`) — single pure SQL statement, no dynamic execution, no injection risk

**Usage in bot Python code:**
```python
async def _decrypt_vault_secret(self, vault_secret_id: str) -> str:
    """
    Decrypt a Vault secret using the SECURITY DEFINER RPC function.
    Requires service role Supabase client.
    """
    result = await self._supabase.rpc(
        'get_decrypted_secret',
        {'secret_id': vault_secret_id}
    ).execute()

    if not result.data:
        raise ValueError(f"Vault secret {vault_secret_id} not found or inaccessible")

    return result.data
```

**Note on `supabase.rpc()`:** The Supabase Python client's `rpc()` method calls the PostgREST `/rpc/{function_name}` endpoint. The bot uses the service role key, which PostgREST forwards to PostgreSQL as the `postgres` role — `SECURITY DEFINER` functions then execute at superuser level.

### 4.2 `public.create_tenant_secret()` — Convenience Wrapper (Optional)

This wrapper function is used by Edge Functions to create Vault secrets with a standardized naming convention. It is an optional convenience — Edge Functions can call `vault.create_secret()` directly, but this wrapper enforces naming conventions.

```sql
CREATE OR REPLACE FUNCTION public.create_tenant_secret(
    p_tenant_id  UUID,
    p_secret_type TEXT,   -- 'discord_token' | 'anthropic_key' | 'openai_key' | 'oauth_token' | 'api_key'
    p_secret     TEXT,    -- plaintext value
    p_hint       TEXT     -- masked hint for description
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, vault
AS $$
DECLARE
    v_name        TEXT;
    v_description TEXT;
    v_secret_id   UUID;
BEGIN
    -- Construct standardized name: '{table}:{tenant_id}:{type}'
    v_name := 'tenant_secrets:' || p_tenant_id::TEXT || ':' || p_secret_type;

    -- Description includes masked hint for Vault dashboard readability
    v_description := p_secret_type || ' for tenant ' || p_tenant_id::TEXT || ' [' || p_hint || ']';

    -- Store in Vault
    SELECT vault.create_secret(p_secret, v_name, v_description)
    INTO v_secret_id;

    RETURN v_secret_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.create_tenant_secret(UUID, TEXT, TEXT, TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.create_tenant_secret(UUID, TEXT, TEXT, TEXT) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.create_tenant_secret(UUID, TEXT, TEXT, TEXT) FROM anon;
```

**Note:** This function is a convenience wrapper. The actual calls in Edge Functions may use `vault.create_secret()` directly with inline name construction — both patterns produce identical results.

### 4.3 `public.delete_tenant_secret()` — Convenience Wrapper for Deletion

```sql
CREATE OR REPLACE FUNCTION public.delete_tenant_secret(p_vault_secret_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, vault
AS $$
    SELECT vault.delete_secret(p_vault_secret_id);
$$;

REVOKE EXECUTE ON FUNCTION public.delete_tenant_secret(UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.delete_tenant_secret(UUID) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_tenant_secret(UUID) FROM anon;
```

---

## 5. Tables Using Vault

### 5.1 `discord_connections.vault_secret_id`

- **What is stored:** Discord bot token (format: `Bot.xxxxxxxx.yyyyyyy.zzzzzz` — the raw token as pasted by the user, without the `Bot ` prefix if the user includes it; website strips the prefix before storage)
- **When created:** Website `POST /api/discord-connections` route calls `store-discord-token` Edge Function → `vault.create_secret(token, name, desc)` → gets UUID → stores UUID in `discord_connections.vault_secret_id`
- **When updated:** User clicks "Update Token" → website creates NEW Vault secret → updates `discord_connections.vault_secret_id` → deletes OLD Vault secret
- **When deleted:** User clicks "Disconnect" → `discord_connections.status = 'disconnected'` (soft delete) → Vault secret is NOT deleted on disconnect, only on row deletion. When tenant account is deleted, all `vault_secret_id` secrets are deleted before CASCADE deletes the row.
- **Vault secret name pattern:** `'discord_connections:{connection_id}:{guild_id}'`
- **Vault secret description:** `'Discord bot token for tenant {tenant_id}, guild {guild_id} [{token_hint}]'`
- **Token hint:** `token[:10] + '...' + token[-6:]`
- **Bot access path:** Bot startup and hot-reload → `get_decrypted_secret(discord_connections.vault_secret_id)` → plaintext token → `discord.Client(intents=...).start(token)`

### 5.2 `tenant_api_keys.vault_secret_id`

- **What is stored:** Anthropic API key (format: `sk-ant-api03-...`) or OpenAI API key (format: `sk-proj-...` or `sk-...`)
- **When created:** Website `POST /api/keys/validate-anthropic` validates → calls `store-tenant-api-key` Edge Function → `vault.create_secret(key, name, desc)` → stores UUID in `tenant_api_keys.vault_secret_id`
- **When updated:** User clicks "Replace Key" → validates new key → Edge Function creates NEW Vault secret → UPSERTs `tenant_api_keys.vault_secret_id` → deletes OLD Vault secret
- **When deleted:** User clicks "Remove Key" → Edge Function sets `status = 'revoked'` AND calls `vault.delete_secret(old_vault_secret_id)` → key material permanently gone, metadata row persists with `status = 'revoked'`
- **Vault secret name pattern:** `'tenant_api_keys:{tenant_id}:{key_type}'` (e.g., `'tenant_api_keys:550e8400...:anthropic'`)
- **Vault secret description:** `'Anthropic API key for tenant {tenant_id} [{key_hint}]'`
- **Key hint:** `key[:8] + '...' + key[-4:]` for Anthropic; `key[:7] + '...' + key[-4:]` for OpenAI
- **Bot access path:** Bot startup and hot-reload → `get_decrypted_secret(tenant_api_keys.vault_secret_id)` → plaintext key → injected into `TenantConfig.anthropic_api_key` → injected as env var into Fly.io session Machine

### 5.3 `tenant_service_connections.vault_secret_id` and `refresh_vault_secret_id`

- **What is stored in `vault_secret_id`:** OAuth access token (for GitHub, Google, Linear) or API key (for Toggl).
- **What is stored in `refresh_vault_secret_id`:** OAuth refresh token (Google only at launch; GitHub, Linear, Toggl have NULL).
- **When created:** Website OAuth callback route or API key submission route calls `vault.create_secret()` for each token and stores the returned UUID(s) in `tenant_service_connections`.
- **When updated (token refresh):** Google token refresh creates a new Vault secret for the new access token, updates `vault_secret_id` to the new UUID, deletes the old Vault secret. The `refresh_vault_secret_id` is NOT replaced on refresh — the refresh token remains valid unless Google explicitly rotates it.
- **When deleted:** On disconnect (`status = 'revoked'`), both `vault_secret_id` and `refresh_vault_secret_id` secrets are permanently deleted via `vault.delete_secret()`. On tenant account deletion, CASCADE deletes the row, but application code must delete Vault secrets BEFORE the CASCADE (database CASCADE does not delete Vault secrets automatically — Vault is separate from application tables).
- **Vault secret name patterns:**
  - Access token: `'tenant_service_connections:{connection_id}:{service}:access'` (e.g., `'tenant_service_connections:a1b2...:github:access'`)
  - Refresh token: `'tenant_service_connections:{connection_id}:{service}:refresh'` (e.g., `'tenant_service_connections:b2c3...:google:refresh'`)
  - API key: `'tenant_service_connections:{connection_id}:{service}:key'` (e.g., `'tenant_service_connections:c3d4...:toggl:key'`)
- **Bot access path:** Bot startup query reads `vault_secret_id` for each connected service, calls `get_decrypted_secret()` for each, and stores in `TenantConfig`. GitHub token → `TenantConfig.github_token`. Linear token → `TenantConfig.linear_api_key`. Toggl token → `TenantConfig.toggl_api_key`. Google token → `TenantConfig.google_token` (plus expiry check before use).

---

## 6. Edge Functions That Use Vault

### 6.1 `store-discord-token`

**Path:** `supabase/functions/store-discord-token/index.ts`

**Inputs:**
```typescript
interface StoreDiscordTokenRequest {
  tenant_id: string        // UUID
  guild_id: string         // 17–20 digit string
  token: string            // Plaintext Discord bot token
  connection_id?: string   // If replacing token for existing connection
}
```

**Logic:**
1. Verify caller JWT + owner/admin role in `tenant_members`
2. Strip `'Bot '` prefix from token if user accidentally included it
3. Format-validate token (not empty, reasonable length)
4. Compute token hint: `token[:10] + '...' + token[-6:]`
5. Call `vault.create_secret(token, name, desc)` → get `new_vault_secret_id`
6. If `connection_id` provided (token replacement):
   a. SELECT `old_vault_secret_id` from `discord_connections` WHERE `id = connection_id`
   b. UPDATE `discord_connections SET vault_secret_id = new_vault_secret_id` WHERE `id = connection_id`
   c. `vault.delete_secret(old_vault_secret_id)`
7. If no `connection_id` (new connection):
   a. INSERT into `discord_connections` with `vault_secret_id = new_vault_secret_id`
8. Return `{ connection_id, vault_secret_id: new_vault_secret_id }`

**Failure handling:**
- Vault write fails → return 500, do NOT write to `discord_connections`
- `discord_connections` INSERT/UPDATE fails → call `vault.delete_secret(new_vault_secret_id)` to avoid orphaned secret, return 500
- `vault.delete_secret(old_vault_secret_id)` fails → log error (non-fatal), the old secret is orphaned but the new one is active; orphan cleanup runs via a scheduled job (see below)

### 6.2 `store-tenant-api-key`

**Path:** `supabase/functions/store-tenant-api-key/index.ts`

**Inputs:**
```typescript
interface StoreTenantApiKeyRequest {
  tenant_id: string        // UUID
  key_type: 'anthropic' | 'openai'
  api_key: string          // Plaintext key (already validated by Next.js API route)
}
```

**Logic:**
1. Verify caller JWT + owner/admin role in `tenant_members`
2. Validate `key_type` is one of `['anthropic', 'openai']`
3. Compute `key_hint` server-side:
   ```typescript
   function buildKeyHint(key: string, keyType: 'anthropic' | 'openai'): string {
     const prefixLen = keyType === 'anthropic' ? 8 : 7
     return key.slice(0, prefixLen) + '...' + key.slice(-4)
   }
   ```
4. Check if existing key exists:
   ```sql
   SELECT id, vault_secret_id FROM tenant_api_keys
   WHERE tenant_id = :t AND key_type = :kt AND status != 'revoked'
   ```
5. Call `vault.create_secret(api_key, name, desc)` → `new_vault_secret_id`
6. UPSERT into `tenant_api_keys`:
   ```sql
   INSERT INTO tenant_api_keys (tenant_id, key_type, vault_secret_id, key_hint, validated_at, status)
   VALUES (:tenant_id, :key_type, :new_vault_secret_id, :key_hint, NOW(), 'active')
   ON CONFLICT (tenant_id, key_type)
   DO UPDATE SET vault_secret_id = EXCLUDED.vault_secret_id,
                 key_hint = EXCLUDED.key_hint,
                 validated_at = EXCLUDED.validated_at,
                 status = 'active',
                 updated_at = NOW();
   ```
7. If previous active key existed (step 4 found a row): `vault.delete_secret(old_vault_secret_id)`
8. Return `{ key_hint, created_at }`

### 6.3 `revoke-tenant-api-key`

**Path:** `supabase/functions/revoke-tenant-api-key/index.ts`

**Inputs:**
```typescript
interface RevokeTenantApiKeyRequest {
  tenant_id: string
  key_type: 'anthropic' | 'openai'
}
```

**Logic:**
1. Verify caller JWT + owner/admin role in `tenant_members`
2. SELECT `id, vault_secret_id` from `tenant_api_keys` WHERE `tenant_id = :t AND key_type = :kt AND status != 'revoked'`
3. If not found: return 404 "No active key found to revoke"
4. UPDATE `tenant_api_keys SET status = 'revoked', updated_at = NOW()` WHERE `id = :id`
5. `vault.delete_secret(vault_secret_id)` — permanently delete encrypted key
6. Return `{ success: true }`

---

## 7. Vault Secret Naming Convention

| Secret Type | Name Pattern | Example |
|-------------|-------------|---------|
| Discord bot token | `discord_connections:{connection_id}:{guild_id}` | `discord_connections:a1b2c3...:813258688680919040` |
| Anthropic API key | `tenant_api_keys:{tenant_id}:anthropic` | `tenant_api_keys:550e8400...:anthropic` |
| OpenAI API key | `tenant_api_keys:{tenant_id}:openai` | `tenant_api_keys:550e8400...:openai` |
| OAuth access token | `tenant_service_connections:{id}:{service}:access` | `tenant_service_connections:b2c3d4...:github:access` |
| OAuth refresh token | `tenant_service_connections:{id}:{service}:refresh` | `tenant_service_connections:b2c3d4...:google:refresh` |
| API key (Toggl, etc.) | `tenant_service_connections:{id}:{service}:key` | `tenant_service_connections:c3d4e5...:toggl:key` |

**Rules:**
1. Names are NOT unique in Vault (Vault does not enforce name uniqueness)
2. Names exist only for human readability in the Supabase Vault dashboard
3. Names NEVER contain sensitive data (only IDs, provider names, service names)
4. The UUID in the name corresponds to the DB row ID, not the `vault.secrets.id`
5. Application code always looks up secrets by `vault.secrets.id` (the `vault_secret_id` column), never by name

---

## 8. Orphaned Secret Cleanup

If an Edge Function or bot process crashes between creating a new Vault secret and updating the database reference, an orphaned Vault secret may exist. These orphans consume minimal storage but should be cleaned up periodically.

**Detection query (run by admin or scheduled job):**
```sql
-- Find Vault secrets not referenced by any application table
SELECT vs.id, vs.name, vs.description, vs.created_at
FROM vault.secrets vs
WHERE vs.id NOT IN (
    SELECT vault_secret_id FROM public.discord_connections
    WHERE vault_secret_id IS NOT NULL
    UNION ALL
    SELECT vault_secret_id FROM public.tenant_api_keys
    WHERE vault_secret_id IS NOT NULL
    UNION ALL
    SELECT vault_secret_id FROM public.tenant_service_connections
    WHERE vault_secret_id IS NOT NULL
    UNION ALL
    SELECT refresh_vault_secret_id FROM public.tenant_service_connections
    WHERE refresh_vault_secret_id IS NOT NULL
)
AND vs.created_at < NOW() - INTERVAL '1 hour'  -- grace period for in-progress writes
ORDER BY vs.created_at DESC;
```

**Cleanup action:** Call `vault.delete_secret(id)` for each orphaned secret. This cleanup is run manually at launch (no automated job scheduled). If the orphan count grows, add a scheduled Supabase Edge Function (triggered by pg_cron) to run this cleanup weekly.

---

## 9. What is NOT Stored in Vault

The following sensitive values do NOT go into Supabase Vault. They are stored in platform environment variables (Fly.io secrets or Vercel environment variables):

| Value | Storage Location | Why Not Vault |
|-------|-----------------|---------------|
| `SUPABASE_SERVICE_ROLE_KEY` | Fly.io secrets | Bootstrap credential — needed before Supabase connection is open |
| `STRIPE_SECRET_KEY` | Vercel env vars | Used only by Next.js server, not the bot |
| `STRIPE_WEBHOOK_SECRET` | Vercel env vars | Used only by Next.js webhook handler |
| `FLY_API_TOKEN` | Fly.io secrets | Platform-level credential, not per-tenant |
| OAuth app `client_secret` | Vercel env vars | Platform-level credential (one app for all tenants) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Vercel env vars (public) | Not secret — anon key is safe to expose |

Per-tenant secrets (API keys, OAuth tokens, Discord tokens) are stored in Vault. Platform-level secrets are stored in environment variables.

---

## 10. Security Properties Summary

| Property | Mechanism |
|----------|----------|
| Encryption at rest | Supabase Vault — AES-256-GCM via pgsodium/libsodium |
| Encryption key management | Managed by Supabase (root key stored in pgsodium key table, not accessible to app) |
| Decryption access control | Only `postgres` superuser (= service role in Supabase) can read `vault.decrypted_secrets` |
| Application access pattern | Bot + Edge Functions use `public.get_decrypted_secret()` — `SECURITY DEFINER` SQL function, no dynamic SQL |
| No plaintext in public schema | All public tables store only `vault_secret_id` UUID, never plaintext keys or tokens |
| Hint-only UI display | `key_hint` (masked) is the only representation exposed to browsers — `vault_secret_id` is never sent to client |
| Deletion on revocation | `vault.delete_secret()` permanently destroys ciphertext on revocation — no soft-delete for key material |
| In-transit protection | TLS on all connections to Supabase (PostgREST, pgbouncer, Realtime, Edge Functions) |
| Log safety | Bot logs `key_hint` only, never `vault_secret_id` or decrypted values |
| Audit trail | `tenant_api_keys` rows preserved after revocation (metadata only); Vault secret destroyed |

---

## Cross-References

- [schema.md](./schema.md) — `discord_connections.vault_secret_id`, `tenant_api_keys.vault_secret_id` column specs
- [rls-policies.md](./rls-policies.md) — RLS blocks JWT users from writing to tables that use Vault
- [migrations.md](./migrations.md) — Migration that creates `get_decrypted_secret()` function
- [multi-tenant/byok-key-routing.md](../multi-tenant/byok-key-routing.md) — Bot-side key decryption and hot-reload
- [multi-tenant/connection-manager.md](../multi-tenant/connection-manager.md) — `_decrypt_vault_secret()` Python implementation
- [api/routes.md](../api/routes.md) — `/api/keys/validate-anthropic`, `/api/keys/validate-openai` routes
- [integrations/discord.md](../integrations/discord.md) — Discord token storage and validation flow
