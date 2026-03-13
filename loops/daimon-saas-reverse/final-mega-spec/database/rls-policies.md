# RLS Policies — Daimon SaaS Multi-Tenant Platform

**Source:** Wave 3, Aspect 3.6
**Database:** PostgreSQL 17, hosted on Supabase
**Last Updated:** 2026-03-13

This file contains the **exact SQL** for every Row Level Security (RLS) policy on every table in the Daimon SaaS multi-tenant schema. These policies are the primary access control mechanism for the Supabase PostgREST API used by the Next.js website frontend.

Related files:
- [schema.md](./schema.md) — Table definitions with column-level policy summaries
- [migrations.md](./migrations.md) — Ordered migration SQL that applies these policies
- [vault-encryption.md](./vault-encryption.md) — Vault setup (separate from RLS, but complementary)

---

## RLS Architecture Overview

### Two Trust Levels

| Actor | Auth Mechanism | RLS Behavior |
|-------|---------------|--------------|
| Website users (browsers) | Supabase Auth JWT (`anon` or `authenticated` role) | Subject to RLS — policies evaluated on every query |
| Bot (Python) | Service role key (`SUPABASE_SERVICE_ROLE_KEY`) | **Bypasses RLS entirely** — service role has superuser-equivalent access |
| Next.js API routes (server-side) | Service role key (for writes requiring Vault ops) | **Bypasses RLS** — used for trusted server-side operations |
| Next.js API routes (reads/simple writes) | User's JWT forwarded via `createServerClient` | Subject to RLS — user's permissions apply |
| Supabase Edge Functions | Service role key | **Bypasses RLS** |

### The Membership Pattern

Almost every SELECT policy on SaaS tables uses this subquery:

```sql
EXISTS (
    SELECT 1 FROM public.tenant_members tm
    WHERE tm.tenant_id = <table>.tenant_id
      AND tm.user_id = auth.uid()
)
```

This checks "is the authenticated user a member of the tenant that owns this row?" The `idx_tenant_members_user_id` index on `tenant_members(user_id)` makes this subquery fast.

For UPDATE/DELETE policies that require elevated roles (owner or admin), the subquery adds:

```sql
AND tm.role IN ('owner', 'admin')
```

### RLS and `tenant_members` Self-Reference

The `tenant_members` table's SELECT policy references itself:

```sql
tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
```

This is valid in PostgreSQL — RLS policies can reference the same table. The query planner correctly handles the recursive reference because the inner query is filtered by `auth.uid()` to a single user's rows (O(1) lookup via the index).

### Default Deny

When RLS is enabled on a table and **no policy matches**, access is **denied**. This means:
- Tables with `ENABLE ROW LEVEL SECURITY` and zero policies = no access for any user
- This is the correct behavior for `admin_audit_log` (admin panel uses service role, bypassing RLS)
- Policies are **additive** — a row is accessible if ANY applicable policy permits it

---

## Table: `tenants` {#tenants}

### Enable RLS

```sql
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
```

### Policy 1: `tenants_select_member` — Members Can Read Their Tenants

**Operation:** SELECT
**Role:** `authenticated`
**Condition:** User is a member of the tenant

```sql
CREATE POLICY "tenants_select_member"
    ON public.tenants
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.tenant_members tm
            WHERE tm.tenant_id = tenants.id
              AND tm.user_id = auth.uid()
        )
    );
```

**What it allows:** Any authenticated user who has a row in `tenant_members` for this tenant can SELECT the tenant row.
**Who is affected:** All tenant members (owner, admin, member roles all can read).
**Why:** The dashboard needs to load the tenant name, plan, and status on every page load. All tenant members need read access.

---

### Policy 2: `tenants_insert_owner` — New Tenant Creation

**Operation:** INSERT
**Role:** `authenticated`
**Condition:** The `owner_id` must equal the authenticated user's ID

```sql
CREATE POLICY "tenants_insert_owner"
    ON public.tenants
    FOR INSERT
    TO authenticated
    WITH CHECK (
        owner_id = auth.uid()
    );
```

**What it allows:** An authenticated user can create a tenant if and only if they set `owner_id` to their own user ID.
**Prevents:** A user from creating a tenant with someone else listed as owner.
**Note:** After INSERT, the API route must also INSERT a row into `tenant_members` with `role = 'owner'` in the same transaction.

---

### Policy 3: `tenants_update_admin` — Owners and Admins Can Update Tenant Settings

**Operation:** UPDATE
**Role:** `authenticated`
**Condition:** User is an owner or admin of the tenant

```sql
CREATE POLICY "tenants_update_admin"
    ON public.tenants
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.tenant_members tm
            WHERE tm.tenant_id = tenants.id
              AND tm.user_id = auth.uid()
              AND tm.role IN ('owner', 'admin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.tenant_members tm
            WHERE tm.tenant_id = tenants.id
              AND tm.user_id = auth.uid()
              AND tm.role IN ('owner', 'admin')
        )
    );
```

**What it allows:** Owners and admins can update tenant settings (e.g., tenant `name`).
**What it prevents:** Regular members cannot modify tenant settings. Members with `role = 'member'` are blocked.
**Note on `plan` and `status` columns:** These columns should NOT be updated by the website frontend directly. They are managed by: (a) the Stripe webhook handler (service role), (b) the bot (service role), (c) the admin panel (service role). The API route that processes tenant updates (`PATCH /api/tenants/:id`) must explicitly exclude `plan` and `status` from the allowed update fields in the request body, even though the RLS policy would technically allow it.

---

### Policy 4: `tenants_delete_owner` — Only Owners Can Delete Their Tenant

**Operation:** DELETE
**Role:** `authenticated`
**Condition:** User is the owner of the tenant

```sql
CREATE POLICY "tenants_delete_owner"
    ON public.tenants
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.tenant_members tm
            WHERE tm.tenant_id = tenants.id
              AND tm.user_id = auth.uid()
              AND tm.role = 'owner'
        )
    );
```

**What it allows:** Only the owner can delete the tenant.
**Deletion order:** The API route for "Delete Account" must delete child rows first (due to FK constraints): `discord_connections` → `tenant_api_keys` → `tenant_service_connections` → `tenant_subscriptions` → `tenant_members` → then `tenants`. The `auth.users` row (Supabase Auth) must be deleted LAST after the `tenants` row is gone (due to `tenants.owner_id` FK with ON DELETE RESTRICT).

---

### Summary

| Policy Name | Operation | Role | Key Condition |
|-------------|-----------|------|---------------|
| `tenants_select_member` | SELECT | authenticated | Member exists in `tenant_members` |
| `tenants_insert_owner` | INSERT | authenticated | `owner_id = auth.uid()` |
| `tenants_update_admin` | UPDATE | authenticated | Member role IN ('owner', 'admin') |
| `tenants_delete_owner` | DELETE | authenticated | Member role = 'owner' |

---

## Table: `tenant_members` {#tenant_members}

### Enable RLS

```sql
ALTER TABLE public.tenant_members ENABLE ROW LEVEL SECURITY;
```

### Policy 1: `tenant_members_select` — Members Can Read Membership Rows

**Operation:** SELECT
**Role:** `authenticated`
**Condition:** User is a member of the tenant referenced by the row

```sql
CREATE POLICY "tenant_members_select"
    ON public.tenant_members
    FOR SELECT
    TO authenticated
    USING (
        tenant_id IN (
            SELECT tm.tenant_id
            FROM public.tenant_members tm
            WHERE tm.user_id = auth.uid()
        )
    );
```

**What it allows:** Any member of a tenant can see all membership rows for that tenant (who else is in the workspace).
**Self-reference note:** This policy's `USING` clause queries `tenant_members` itself. The inner query is filtered to `auth.uid()` and uses the `idx_tenant_members_user_id` index, so performance is O(1) regardless of tenant size.
**Why:** The dashboard and settings page need to display who is in the workspace (for member management UI, future invite list).

---

### Policy 2: `tenant_members_insert_admin` — Owners and Admins Can Add Members

**Operation:** INSERT
**Role:** `authenticated`
**Condition:** Inserting user is an owner or admin of the target tenant

```sql
CREATE POLICY "tenant_members_insert_admin"
    ON public.tenant_members
    FOR INSERT
    TO authenticated
    WITH CHECK (
        tenant_id IN (
            SELECT tm.tenant_id
            FROM public.tenant_members tm
            WHERE tm.user_id = auth.uid()
              AND tm.role IN ('owner', 'admin')
        )
    );
```

**What it allows:** Owners and admins can add new members to the tenant.
**Special case — owner self-insert at signup:** When a user creates a tenant, the API route (using service role) inserts the owner membership row. The service role bypasses RLS, so this policy does not apply to the initial owner row creation. This policy applies to subsequent invites only.
**Free-tier restriction:** Free-tier tenants cannot invite additional members. This limit is enforced at the API route level (`POST /api/invites`), not by a database constraint or RLS policy. The database schema supports multiple members from day one.

---

### Policy 3: `tenant_members_update_owner` — Only Owners Can Change Member Roles

**Operation:** UPDATE
**Role:** `authenticated`
**Condition:** User performing the update is the owner of the tenant

```sql
CREATE POLICY "tenant_members_update_owner"
    ON public.tenant_members
    FOR UPDATE
    TO authenticated
    USING (
        tenant_id IN (
            SELECT tm.tenant_id
            FROM public.tenant_members tm
            WHERE tm.user_id = auth.uid()
              AND tm.role = 'owner'
        )
    )
    WITH CHECK (
        tenant_id IN (
            SELECT tm.tenant_id
            FROM public.tenant_members tm
            WHERE tm.user_id = auth.uid()
              AND tm.role = 'owner'
        )
    );
```

**What it allows:** Only the owner can change a member's role (e.g., promote member → admin, demote admin → member).
**Limitation:** Owners cannot change their own role via this policy (enforced at the API route level — the route checks `WHERE user_id != auth.uid()` before issuing an UPDATE to a member's role). Ownership transfer (changing another user TO 'owner') requires also updating `tenants.owner_id` atomically — handled by service role in the admin panel.

---

### Policy 4: `tenant_members_delete_owner` — Owners Can Remove Members (Not Themselves)

**Operation:** DELETE
**Role:** `authenticated`
**Condition:** User is the owner AND is not removing themselves

```sql
CREATE POLICY "tenant_members_delete_owner"
    ON public.tenant_members
    FOR DELETE
    TO authenticated
    USING (
        tenant_id IN (
            SELECT tm.tenant_id
            FROM public.tenant_members tm
            WHERE tm.user_id = auth.uid()
              AND tm.role = 'owner'
        )
        AND user_id != auth.uid()
    );
```

**What it allows:** The owner can remove other members from the tenant.
**Self-removal prevention:** `AND user_id != auth.uid()` prevents the owner from removing themselves. To leave a tenant, an owner must transfer ownership first or delete the entire tenant.
**What happens to removed members:** The removed user loses access to all tenant data immediately (their `tenant_members` row is deleted → the membership subquery in all other RLS policies returns empty → all data access is denied).

---

### Summary

| Policy Name | Operation | Role | Key Condition |
|-------------|-----------|------|---------------|
| `tenant_members_select` | SELECT | authenticated | User is a member of the same tenant |
| `tenant_members_insert_admin` | INSERT | authenticated | Inserting user is owner or admin |
| `tenant_members_update_owner` | UPDATE | authenticated | Updating user is owner |
| `tenant_members_delete_owner` | DELETE | authenticated | Deleting user is owner AND not removing self |

---

## Table: `discord_connections` {#discord_connections}

### Enable RLS

```sql
ALTER TABLE public.discord_connections ENABLE ROW LEVEL SECURITY;
```

### Policy 1: `discord_connections_select` — Members Can Read Their Connections

**Operation:** SELECT
**Role:** `authenticated`
**Condition:** User is a member of the tenant that owns the connection

```sql
CREATE POLICY "discord_connections_select"
    ON public.discord_connections
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.tenant_members tm
            WHERE tm.tenant_id = discord_connections.tenant_id
              AND tm.user_id = auth.uid()
        )
    );
```

**What it allows:** All members of a tenant can see the Discord connection records (status, bot_username, last_heartbeat, guild_id).
**What is NOT exposed:** The `vault_secret_id` column value (a UUID) is visible in SELECT results, but the UUID itself is useless without access to Vault. The actual bot token is never returned — it lives only in Vault and is decrypted only by the bot (service role) or Edge Functions (service role).

---

### Policy 2: `discord_connections_insert` — Owners and Admins Can Add Connections

**Operation:** INSERT
**Role:** `authenticated`
**Condition:** User is an owner or admin of the tenant

```sql
CREATE POLICY "discord_connections_insert"
    ON public.discord_connections
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.tenant_members tm
            WHERE tm.tenant_id = discord_connections.tenant_id
              AND tm.user_id = auth.uid()
              AND tm.role IN ('owner', 'admin')
        )
    );
```

**What it allows:** Owners and admins can create new Discord connection records.
**Note on bot token storage:** The actual bot token is NEVER inserted directly into the database via this path. The API route (`POST /api/discord-connections`) first calls the `store-discord-token` Edge Function (service role) which stores the token in Vault, then the API route inserts the `discord_connections` row with the `vault_secret_id` UUID returned from Vault. The inserted row contains only the UUID, not the token.
**Plan limit enforcement:** The API route checks the count of non-disconnected connections before inserting. Free plan: max 1 connection. Starter: max 3. Pro: unlimited. The RLS policy does not enforce this limit.

---

### Policy 3: `discord_connections_update_user` — Owners and Admins Can Update Connection Settings

**Operation:** UPDATE
**Role:** `authenticated`
**Condition:** User is an owner or admin of the tenant

```sql
CREATE POLICY "discord_connections_update_user"
    ON public.discord_connections
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.tenant_members tm
            WHERE tm.tenant_id = discord_connections.tenant_id
              AND tm.user_id = auth.uid()
              AND tm.role IN ('owner', 'admin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.tenant_members tm
            WHERE tm.tenant_id = discord_connections.tenant_id
              AND tm.user_id = auth.uid()
              AND tm.role IN ('owner', 'admin')
        )
    );
```

**What it allows:** Owners and admins can update the connection (e.g., change the `guild_id`, update the `vault_secret_id` after token replacement, set `status = 'disconnected'` to disconnect).
**Column-level restriction (application-level, not RLS):** Standard PostgreSQL RLS cannot restrict which columns are updated — only column-level privileges (`GRANT UPDATE (column_name) ON table TO role`) or application-level validation can do this. The enforcement strategy is:
- The `PATCH /api/discord-connections/:id` API route only accepts `guild_id` and `vault_secret_id` in the request body (all other fields are stripped before the Supabase update call).
- Status transitions are only allowed for: `status = 'disconnected'` (user-initiated disconnect) — any other status value in the request body is rejected with HTTP 400.
- The fields `bot_user_id`, `bot_username`, `last_heartbeat`, and `error_message` are ONLY written by the bot (service role) — they are never accepted from the website frontend.

---

### Policy 4: `discord_connections_delete` — Owners and Admins Can Delete Connections

**Operation:** DELETE
**Role:** `authenticated`
**Condition:** User is an owner or admin of the tenant

```sql
CREATE POLICY "discord_connections_delete"
    ON public.discord_connections
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.tenant_members tm
            WHERE tm.tenant_id = discord_connections.tenant_id
              AND tm.user_id = auth.uid()
              AND tm.role IN ('owner', 'admin')
        )
    );
```

**What it allows:** Owners and admins can delete Discord connection records.
**When hard DELETE is used vs soft disconnect:**
- **Soft disconnect** (preferred): API route updates `status = 'disconnected'` — this signals the bot to stop the connection but preserves the row for audit trail and potential reconnection.
- **Hard DELETE**: Only used when the user explicitly removes the connection from the settings page (clicks "Remove Connection" after confirming). The API route must: (1) call the `delete-discord-token` Edge Function to delete the Vault secret, (2) then DELETE the row. If the Vault deletion fails, the row should still be deleted (Vault orphan cleanup handles this later).
- **Cascade DELETE**: When a tenant is deleted, `discord_connections` rows are deleted automatically via the FK `ON DELETE CASCADE`. The Vault secret cleanup for orphaned secrets is handled by the weekly vault orphan cleanup job (see [vault-encryption.md](./vault-encryption.md)).

---

### Bot Update Access (Service Role — Bypasses RLS)

The bot uses `SUPABASE_SERVICE_ROLE_KEY` which bypasses all RLS policies. The bot writes:

```sql
-- Heartbeat (every 30 seconds per connected tenant):
UPDATE public.discord_connections
SET last_heartbeat = NOW(), updated_at = NOW()
WHERE id = :connection_id;

-- Status transitions:
UPDATE public.discord_connections
SET status = 'connected',
    bot_user_id = :bot_user_id,
    bot_username = :bot_username,
    error_message = NULL,
    updated_at = NOW()
WHERE id = :connection_id;

UPDATE public.discord_connections
SET status = 'error',
    error_message = :error_message,
    updated_at = NOW()
WHERE id = :connection_id;

UPDATE public.discord_connections
SET status = 'connecting',
    error_message = NULL,
    updated_at = NOW()
WHERE id = :connection_id;

UPDATE public.discord_connections
SET status = 'suspended',
    error_message = 'Account suspended. Contact support to restore access.',
    updated_at = NOW()
WHERE id = :connection_id;
```

---

### Summary

| Policy Name | Operation | Role | Key Condition |
|-------------|-----------|------|---------------|
| `discord_connections_select` | SELECT | authenticated | User is a tenant member |
| `discord_connections_insert` | INSERT | authenticated | User is owner or admin |
| `discord_connections_update_user` | UPDATE | authenticated | User is owner or admin |
| `discord_connections_delete` | DELETE | authenticated | User is owner or admin |
| *(bot writes)* | UPDATE | service role | Bypasses RLS — service role |

---

## Table: `tenant_api_keys` {#tenant_api_keys}

### Enable RLS

```sql
ALTER TABLE public.tenant_api_keys ENABLE ROW LEVEL SECURITY;
```

### Policy 1: `tenant_api_keys_select` — Members Can Read Their Key Metadata

**Operation:** SELECT
**Role:** `authenticated`
**Condition:** User is a member of the tenant that owns the key record

```sql
CREATE POLICY "tenant_api_keys_select"
    ON public.tenant_api_keys
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.tenant_members tm
            WHERE tm.tenant_id = tenant_api_keys.tenant_id
              AND tm.user_id = auth.uid()
        )
    );
```

**What it allows:** All tenant members can read API key metadata: `key_hint`, `key_type`, `status`, `validated_at`, `created_at`, `updated_at`.
**What is NOT exposed:** The `vault_secret_id` UUID is visible in SELECT results, but is useless without Vault access. The actual API key (plaintext) lives only in Vault and is never returned by any frontend-accessible query.
**Why all roles can read (not just owner/admin):** The billing page and dashboard show "Anthropic key configured: sk-ant-a...b12c" to all tenant members. Read access to key metadata is not a security risk — the hint is designed to be safe for display.

---

### No INSERT Policy (Blocked for JWT Users)

```sql
-- No INSERT policy exists for tenant_api_keys.
-- INSERT is blocked by default for all JWT-authenticated users.
-- All INSERTs go through the 'store-tenant-api-key' Edge Function (service role).
--
-- If a JWT user attempts direct INSERT via PostgREST:
--   HTTP 403: { "code": "42501", "message": "new row violates row-level security policy" }
```

**Why:** Storing an API key requires a Vault operation (`vault.create_secret()`) that requires service role. All key writes are funneled through the `store-tenant-api-key` Supabase Edge Function, which runs as service role and performs both the Vault write and the database UPSERT atomically. Blocking INSERT at the RLS level is defense-in-depth — even if the Next.js frontend has a bug that tries to write directly, the database rejects it.

---

### No UPDATE Policy (Blocked for JWT Users)

```sql
-- No UPDATE policy exists for tenant_api_keys.
-- UPDATE is blocked by default for all JWT-authenticated users.
-- All UPDATEs go through Edge Functions (service role) or the bot (service role).
--
-- If a JWT user attempts direct UPDATE via PostgREST:
--   HTTP 403: { "code": "42501", "message": "new row violates row-level security policy" }
```

**Why:** Key replacement requires Vault operations (create new secret, delete old secret). Key revocation requires Vault deletion. Status transitions (marking 'invalid') are bot-only. All update paths require service role.

---

### No DELETE Policy (Blocked for JWT Users)

```sql
-- No DELETE policy exists for tenant_api_keys.
-- DELETE is blocked by default for all JWT-authenticated users.
-- Row deletion only happens via:
--   (a) CASCADE from tenants deletion (ON DELETE CASCADE — bypasses RLS)
--   (b) The 'revoke-tenant-api-key' Edge Function (service role)
--
-- If a JWT user attempts direct DELETE via PostgREST:
--   HTTP 403: { "code": "42501", "message": "new row violates row-level security policy" }
```

---

### Summary

| Policy Name | Operation | Role | Key Condition |
|-------------|-----------|------|---------------|
| `tenant_api_keys_select` | SELECT | authenticated | User is a tenant member |
| *(no policy)* | INSERT | authenticated | **BLOCKED** — 403 for all JWT users |
| *(no policy)* | UPDATE | authenticated | **BLOCKED** — 403 for all JWT users |
| *(no policy)* | DELETE | authenticated | **BLOCKED** — 403 for all JWT users |
| *(Edge Functions)* | INSERT/UPDATE | service role | Bypasses RLS |
| *(bot)* | UPDATE (status) | service role | Bypasses RLS |

---

## Table: `tenant_service_connections` {#tenant_service_connections}

### Enable RLS

```sql
ALTER TABLE public.tenant_service_connections ENABLE ROW LEVEL SECURITY;
```

### Policy 1: `tenant_service_connections_select` — Members Can Read Their Connections

**Operation:** SELECT
**Role:** `authenticated`

```sql
CREATE POLICY "tenant_service_connections_select"
    ON public.tenant_service_connections
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.tenant_members tm
            WHERE tm.tenant_id = tenant_service_connections.tenant_id
              AND tm.user_id = auth.uid()
        )
    );
```

**What it allows:** All tenant members can view service connections (which services are connected, status, metadata, scopes).
**What is NOT exposed:** `vault_secret_id` and `refresh_vault_secret_id` are UUIDs — visible but useless without Vault access. Actual OAuth tokens and API keys live only in Vault.

---

### Policy 2: `tenant_service_connections_insert` — Owners and Admins Can Connect Services

**Operation:** INSERT
**Role:** `authenticated`

```sql
CREATE POLICY "tenant_service_connections_insert"
    ON public.tenant_service_connections
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.tenant_members tm
            WHERE tm.tenant_id = tenant_service_connections.tenant_id
              AND tm.user_id = auth.uid()
              AND tm.role IN ('owner', 'admin')
        )
    );
```

**What it allows:** Owners and admins can connect new services to the tenant.
**How OAuth connections work:** The OAuth callback API route (`/api/integrations/[service]/callback`) runs server-side with the user's JWT — this policy permits it to INSERT the row directly (after Vault writes for the tokens are completed via service-role RPC calls embedded in the server-side route).
**How API key services work:** The `/api/integrations/toggl/connect` route uses the user's JWT to INSERT the row (after Vault write via service-role Edge Function).

---

### Policy 3: `tenant_service_connections_update` — Owners and Admins Can Update Connections

**Operation:** UPDATE
**Role:** `authenticated`

```sql
CREATE POLICY "tenant_service_connections_update"
    ON public.tenant_service_connections
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.tenant_members tm
            WHERE tm.tenant_id = tenant_service_connections.tenant_id
              AND tm.user_id = auth.uid()
              AND tm.role IN ('owner', 'admin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.tenant_members tm
            WHERE tm.tenant_id = tenant_service_connections.tenant_id
              AND tm.user_id = auth.uid()
              AND tm.role IN ('owner', 'admin')
        )
    );
```

**What it allows:** Owners and admins can update the connection (e.g., set status = 'revoked' on disconnect, update metadata on re-authorization, update vault_secret_id on token refresh).
**Note:** The bot updates `status`, `error_message`, and `last_used_at` using service role (bypasses RLS). The website frontend only updates via API routes which validate the update fields.

---

### Policy 4: `tenant_service_connections_delete` — Owners and Admins Can Delete Connections

**Operation:** DELETE
**Role:** `authenticated`

```sql
CREATE POLICY "tenant_service_connections_delete"
    ON public.tenant_service_connections
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.tenant_members tm
            WHERE tm.tenant_id = tenant_service_connections.tenant_id
              AND tm.user_id = auth.uid()
              AND tm.role IN ('owner', 'admin')
        )
    );
```

**What it allows:** Owners and admins can hard-delete connection rows.
**When used:** Hard DELETE is not the primary disconnect path. The preferred flow sets `status = 'revoked'` (preserving audit metadata). Hard DELETE only happens via: (a) CASCADE from tenant deletion, (b) explicit "Remove connection entirely" admin action (deferred feature). The soft-delete (revoke) flow uses UPDATE, not DELETE.

---

### Summary

| Policy Name | Operation | Role | Key Condition |
|-------------|-----------|------|---------------|
| `tenant_service_connections_select` | SELECT | authenticated | User is a tenant member |
| `tenant_service_connections_insert` | INSERT | authenticated | User is owner or admin |
| `tenant_service_connections_update` | UPDATE | authenticated | User is owner or admin |
| `tenant_service_connections_delete` | DELETE | authenticated | User is owner or admin |
| *(bot writes)* | UPDATE | service role | Bypasses RLS |
| *(refresh cron)* | UPDATE | service role | Bypasses RLS |

---

## Table: `tenant_subscriptions` {#tenant_subscriptions}

### Enable RLS

```sql
ALTER TABLE public.tenant_subscriptions ENABLE ROW LEVEL SECURITY;
```

### Policy 1: `tenant_subscriptions_select` — Members Can Read Their Subscription

**Operation:** SELECT
**Role:** `authenticated`

```sql
CREATE POLICY "tenant_subscriptions_select"
    ON public.tenant_subscriptions
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.tenant_members tm
            WHERE tm.tenant_id = tenant_subscriptions.tenant_id
              AND tm.user_id = auth.uid()
        )
    );
```

**What it allows:** All tenant members can read the subscription row (plan, status, billing period, cancel_at_period_end).
**Why all roles can read (not just owner):** The dashboard displays the current plan to all members. The billing page is owner-only in the UI (protected by a component-level role check), but the underlying data is safe for all members to read.

---

### No INSERT Policy (Blocked for JWT Users)

```sql
-- No INSERT policy exists for tenant_subscriptions.
-- INSERT is blocked by default for all JWT-authenticated users.
-- All INSERTs go through the tenant signup API route (service role):
--   When a tenant is created, the signup route inserts a free-tier subscription row.
--
-- If a JWT user attempts direct INSERT via PostgREST:
--   HTTP 403: { "code": "42501", "message": "new row violates row-level security policy" }
```

---

### No UPDATE Policy (Blocked for JWT Users)

```sql
-- No UPDATE policy exists for tenant_subscriptions.
-- UPDATE is blocked by default for all JWT-authenticated users.
-- All UPDATEs go through:
--   (a) Stripe webhook handler (/api/webhooks/stripe) — service role
--   (b) Admin panel force-set-plan route — service role
--
-- CRITICAL SECURITY RATIONALE:
-- Allowing JWT users to UPDATE tenant_subscriptions would let a tenant
-- self-upgrade their plan to 'pro' without paying. This is the most important
-- write to protect. Service role is the ONLY path to write this table.
--
-- If a JWT user attempts direct UPDATE via PostgREST:
--   HTTP 403: { "code": "42501", "message": "new row violates row-level security policy" }
```

---

### No DELETE Policy (Blocked for JWT Users)

```sql
-- No DELETE policy exists for tenant_subscriptions.
-- DELETE is blocked by default for all JWT-authenticated users.
-- Row deletion only happens via CASCADE from tenants deletion.
--
-- If a JWT user attempts direct DELETE via PostgREST:
--   HTTP 403: { "code": "42501", "message": "new row violates row-level security policy" }
```

---

### Summary

| Policy Name | Operation | Role | Key Condition |
|-------------|-----------|------|---------------|
| `tenant_subscriptions_select` | SELECT | authenticated | User is a tenant member |
| *(no policy)* | INSERT | authenticated | **BLOCKED** — 403 for all JWT users |
| *(no policy)* | UPDATE | authenticated | **BLOCKED** — 403 for all JWT users (critical security) |
| *(no policy)* | DELETE | authenticated | **BLOCKED** — 403 for all JWT users |
| *(Stripe webhook handler)* | UPDATE | service role | Bypasses RLS |
| *(signup route)* | INSERT | service role | Bypasses RLS |

---

## Table: `admin_audit_log` {#admin_audit_log}

### Enable RLS

```sql
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
```

### No Policies — All Access via Service Role

```sql
-- No RLS policies are created for admin_audit_log.
-- When RLS is enabled with no policies, ALL access is denied for authenticated (JWT) users.
--
-- Access pattern:
--   - Admin panel reads: via Next.js server component using service role key (bypasses RLS)
--   - Admin panel writes: via Next.js API routes using service role key (bypasses RLS)
--   - Regular tenant users: BLOCKED (403) — no policy exists to permit any access
--
-- This is intentional. The audit log contains records of admin actions
-- (suspensions, impersonation, plan overrides, bans). Regular users
-- must never be able to read or write this table.
```

**Access enforcement architecture:**

| Layer | Mechanism |
|-------|-----------|
| Database | RLS with no policies = deny all authenticated JWT users |
| Next.js API route | Admin middleware (`/api/admin/*`) checks `ADMIN_USER_IDS` env var or `is_admin` user metadata claim before calling any Supabase operation |
| Supabase client | Admin routes use `supabaseAdmin` client (initialized with `SUPABASE_SERVICE_ROLE_KEY`) |

**How admin identity is checked (API route middleware):**

```typescript
// In: middleware.ts or /api/admin/[...route]/route.ts
// Before ANY admin API route executes:

const { data: { user } } = await supabaseAdmin.auth.getUser(token)

const ADMIN_USER_IDS = process.env.ADMIN_USER_IDS?.split(',') ?? []
if (!ADMIN_USER_IDS.includes(user.id)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
// Proceed with admin operation using supabaseAdmin (service role)
```

**`ADMIN_USER_IDS` env var:** Comma-separated list of Supabase Auth user UUIDs who are platform admins. Set in Vercel environment variables. Format: `"uuid1,uuid2,uuid3"`. See [deployment/environment.md](../deployment/environment.md) for the complete env var specification.

---

### Summary

| Policy | Operation | Role | Result |
|--------|-----------|------|--------|
| *(no policy)* | SELECT | authenticated | **BLOCKED** — no policy exists |
| *(no policy)* | INSERT | authenticated | **BLOCKED** — no policy exists |
| *(no policy)* | UPDATE | authenticated | **BLOCKED** — no policy exists |
| *(no policy)* | DELETE | authenticated | **BLOCKED** — no policy exists |
| *(admin routes)* | ALL | service role | Bypasses RLS |

---

## Policy Application Order

When Supabase PostgREST evaluates an SQL query from a JWT-authenticated user, the following happens for each affected row:

1. **RLS enabled check** — if `ENABLE ROW LEVEL SECURITY` is set on the table, RLS is active
2. **Policy evaluation** — all policies matching the operation (SELECT/INSERT/UPDATE/DELETE) are evaluated
3. **USING clause** — evaluated BEFORE reading the row (filters which rows are visible)
4. **WITH CHECK clause** — evaluated AFTER constructing the new row (validates INSERTs and UPDATEs)
5. **Access granted** — if ANY matching policy's conditions are true, access is permitted for that row
6. **Default deny** — if NO policy matches, the row is excluded from SELECT results or the write is rejected with HTTP 403

### Effect of Multiple Policies

Multiple policies for the same operation on the same table are combined with **OR** semantics (permissive default). A row is accessible if ANY policy permits it. To restrict access, use the `AS RESTRICTIVE` modifier when creating a policy. None of the Daimon SaaS policies use `AS RESTRICTIVE` — all use the default permissive mode.

---

## RLS Performance Optimization

### The Membership Subquery

Every RLS policy references `tenant_members` to check if the authenticated user is a member of a tenant. This subquery runs on every row evaluated:

```sql
EXISTS (
    SELECT 1 FROM public.tenant_members tm
    WHERE tm.tenant_id = <table>.tenant_id
      AND tm.user_id = auth.uid()
)
```

**Performance analysis:**
- `auth.uid()` is a constant per query (evaluated once)
- The `idx_tenant_members_user_id` index on `tenant_members(user_id)` makes the subquery O(1)
- At launch (single membership per tenant per user), this returns immediately
- The subquery result is NOT memoized across rows in the same query — it runs once per row. For queries returning many rows (e.g., admin queries), consider using `IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())` pattern instead, which PostgreSQL can optimize as a single nested loop join

**Alternative pattern for multi-row queries:**

```sql
-- For SELECT queries expected to return many rows, use IN instead of EXISTS:
USING (
    tenant_id IN (
        SELECT tm.tenant_id
        FROM public.tenant_members tm
        WHERE tm.user_id = auth.uid()
    )
);
```

This allows PostgreSQL to execute the subquery once and use the result set as a lookup, rather than re-evaluating EXISTS per row. The policies above use `EXISTS` for SELECT policies on tables with typically 1 row per tenant (e.g., `tenant_subscriptions`), and `IN` patterns for tables where a tenant might have multiple rows (e.g., `tenant_members`, `discord_connections`). The performance difference is negligible at the scale of a typical tenant's data.

---

## RLS Bypass Paths (Service Role)

The following operations ALWAYS bypass RLS regardless of the table's policies:

| Operation | Actor | Service Role Usage |
|-----------|-------|-------------------|
| Bot heartbeat writes | Python bot | `SUPABASE_SERVICE_ROLE_KEY` in bot env |
| Bot status transitions | Python bot | Same service role key |
| Bot API key validation (mark invalid) | Python bot | Same service role key |
| Stripe webhook handler | Next.js API route `/api/webhooks/stripe` | `SUPABASE_SERVICE_ROLE_KEY` in Vercel env |
| Tenant signup (create tenant + membership + subscription rows) | Next.js API route `/api/onboarding` | Service role for atomic transaction |
| API key store/revoke Edge Functions | Supabase Edge Functions | Service role injected automatically |
| Discord token store/delete Edge Functions | Supabase Edge Functions | Service role injected automatically |
| Admin panel reads and writes | Next.js server components + API routes | Service role via `supabaseAdmin` client |
| Google token refresh cron | Supabase Edge Function `refresh-google-tokens` | Service role injected automatically |

**Security principle:** Service role usage is limited to:
1. Operations that require Vault access (read/write encrypted secrets)
2. Operations that must be trusted server-side (plan upgrades, audit log writes)
3. Operations where the caller is verified by a separate mechanism (admin UUID check, Stripe webhook signature)

Regular tenant actions (connecting Discord, viewing dashboard, changing settings) use the user's JWT with RLS enforcement wherever possible.

---

## Complete RLS Enable Statements (All Tables)

For migration convenience, all `ENABLE ROW LEVEL SECURITY` statements in one block:

```sql
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discord_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_service_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
```

---

## Complete Policy Creation (All Tables, In Order)

The following block creates all RLS policies in dependency order. Apply this after creating all tables and enabling RLS.

```sql
-- ============================================================
-- RLS POLICIES: tenants
-- ============================================================

CREATE POLICY "tenants_select_member"
    ON public.tenants
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.tenant_members tm
            WHERE tm.tenant_id = tenants.id
              AND tm.user_id = auth.uid()
        )
    );

CREATE POLICY "tenants_insert_owner"
    ON public.tenants
    FOR INSERT
    TO authenticated
    WITH CHECK (
        owner_id = auth.uid()
    );

CREATE POLICY "tenants_update_admin"
    ON public.tenants
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.tenant_members tm
            WHERE tm.tenant_id = tenants.id
              AND tm.user_id = auth.uid()
              AND tm.role IN ('owner', 'admin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.tenant_members tm
            WHERE tm.tenant_id = tenants.id
              AND tm.user_id = auth.uid()
              AND tm.role IN ('owner', 'admin')
        )
    );

CREATE POLICY "tenants_delete_owner"
    ON public.tenants
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.tenant_members tm
            WHERE tm.tenant_id = tenants.id
              AND tm.user_id = auth.uid()
              AND tm.role = 'owner'
        )
    );

-- ============================================================
-- RLS POLICIES: tenant_members
-- ============================================================

CREATE POLICY "tenant_members_select"
    ON public.tenant_members
    FOR SELECT
    TO authenticated
    USING (
        tenant_id IN (
            SELECT tm.tenant_id
            FROM public.tenant_members tm
            WHERE tm.user_id = auth.uid()
        )
    );

CREATE POLICY "tenant_members_insert_admin"
    ON public.tenant_members
    FOR INSERT
    TO authenticated
    WITH CHECK (
        tenant_id IN (
            SELECT tm.tenant_id
            FROM public.tenant_members tm
            WHERE tm.user_id = auth.uid()
              AND tm.role IN ('owner', 'admin')
        )
    );

CREATE POLICY "tenant_members_update_owner"
    ON public.tenant_members
    FOR UPDATE
    TO authenticated
    USING (
        tenant_id IN (
            SELECT tm.tenant_id
            FROM public.tenant_members tm
            WHERE tm.user_id = auth.uid()
              AND tm.role = 'owner'
        )
    )
    WITH CHECK (
        tenant_id IN (
            SELECT tm.tenant_id
            FROM public.tenant_members tm
            WHERE tm.user_id = auth.uid()
              AND tm.role = 'owner'
        )
    );

CREATE POLICY "tenant_members_delete_owner"
    ON public.tenant_members
    FOR DELETE
    TO authenticated
    USING (
        tenant_id IN (
            SELECT tm.tenant_id
            FROM public.tenant_members tm
            WHERE tm.user_id = auth.uid()
              AND tm.role = 'owner'
        )
        AND user_id != auth.uid()
    );

-- ============================================================
-- RLS POLICIES: discord_connections
-- ============================================================

CREATE POLICY "discord_connections_select"
    ON public.discord_connections
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.tenant_members tm
            WHERE tm.tenant_id = discord_connections.tenant_id
              AND tm.user_id = auth.uid()
        )
    );

CREATE POLICY "discord_connections_insert"
    ON public.discord_connections
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.tenant_members tm
            WHERE tm.tenant_id = discord_connections.tenant_id
              AND tm.user_id = auth.uid()
              AND tm.role IN ('owner', 'admin')
        )
    );

CREATE POLICY "discord_connections_update_user"
    ON public.discord_connections
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.tenant_members tm
            WHERE tm.tenant_id = discord_connections.tenant_id
              AND tm.user_id = auth.uid()
              AND tm.role IN ('owner', 'admin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.tenant_members tm
            WHERE tm.tenant_id = discord_connections.tenant_id
              AND tm.user_id = auth.uid()
              AND tm.role IN ('owner', 'admin')
        )
    );

CREATE POLICY "discord_connections_delete"
    ON public.discord_connections
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.tenant_members tm
            WHERE tm.tenant_id = discord_connections.tenant_id
              AND tm.user_id = auth.uid()
              AND tm.role IN ('owner', 'admin')
        )
    );

-- ============================================================
-- RLS POLICIES: tenant_api_keys
-- ============================================================

CREATE POLICY "tenant_api_keys_select"
    ON public.tenant_api_keys
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.tenant_members tm
            WHERE tm.tenant_id = tenant_api_keys.tenant_id
              AND tm.user_id = auth.uid()
        )
    );

-- No INSERT, UPDATE, or DELETE policies.
-- All writes via service role (Edge Functions, bot).

-- ============================================================
-- RLS POLICIES: tenant_service_connections
-- ============================================================

CREATE POLICY "tenant_service_connections_select"
    ON public.tenant_service_connections
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.tenant_members tm
            WHERE tm.tenant_id = tenant_service_connections.tenant_id
              AND tm.user_id = auth.uid()
        )
    );

CREATE POLICY "tenant_service_connections_insert"
    ON public.tenant_service_connections
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.tenant_members tm
            WHERE tm.tenant_id = tenant_service_connections.tenant_id
              AND tm.user_id = auth.uid()
              AND tm.role IN ('owner', 'admin')
        )
    );

CREATE POLICY "tenant_service_connections_update"
    ON public.tenant_service_connections
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.tenant_members tm
            WHERE tm.tenant_id = tenant_service_connections.tenant_id
              AND tm.user_id = auth.uid()
              AND tm.role IN ('owner', 'admin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.tenant_members tm
            WHERE tm.tenant_id = tenant_service_connections.tenant_id
              AND tm.user_id = auth.uid()
              AND tm.role IN ('owner', 'admin')
        )
    );

CREATE POLICY "tenant_service_connections_delete"
    ON public.tenant_service_connections
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.tenant_members tm
            WHERE tm.tenant_id = tenant_service_connections.tenant_id
              AND tm.user_id = auth.uid()
              AND tm.role IN ('owner', 'admin')
        )
    );

-- ============================================================
-- RLS POLICIES: tenant_subscriptions
-- ============================================================

CREATE POLICY "tenant_subscriptions_select"
    ON public.tenant_subscriptions
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.tenant_members tm
            WHERE tm.tenant_id = tenant_subscriptions.tenant_id
              AND tm.user_id = auth.uid()
        )
    );

-- No INSERT, UPDATE, or DELETE policies.
-- All writes via service role (Stripe webhook handler, signup route).

-- ============================================================
-- RLS POLICIES: admin_audit_log
-- ============================================================

-- No policies created. All access via service role only.
-- Default deny applies to all authenticated users.
```

---

## Cross-References

- [schema.md](./schema.md) — Table definitions, column specs, constraint details, per-table RLS summaries
- [migrations.md](./migrations.md) — Migration files that apply these policies (in order after table creation)
- [vault-encryption.md](./vault-encryption.md) — Vault setup used alongside these policies for secret column protection
- [api/routes.md](../api/routes.md) — API routes that use these policies via the user JWT (`createServerClient`)
- [deployment/environment.md](../deployment/environment.md) — `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_USER_IDS` env vars
- [multi-tenant/tenant-scoping.md](../multi-tenant/tenant-scoping.md) — How the bot's service-role access interacts with tenant isolation
