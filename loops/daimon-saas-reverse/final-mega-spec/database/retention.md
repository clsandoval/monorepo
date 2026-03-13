# Database Retention Policy — Daimon SaaS Multi-Tenant Platform

**Aspect:** 8.1.9 — Data retention policy per table, cleanup job SQL/schedules, PITR + snapshot policy
**Wave:** Wave 8 Gap Remediation
**Written:** 2026-03-13
**References:**
- [schema.md](./schema.md) — Full table definitions
- [triggers.md](./triggers.md) — Trigger reference (cleanup jobs run as cron, not triggers)
- [migrations.md](./migrations.md) — Migration files that create these tables
- [vault-encryption.md](./vault-encryption.md) — Vault secret lifecycle (separate from row retention)
- [../deployment/infrastructure.md](../deployment/infrastructure.md) — Supabase plan, PITR configuration

---

## Overview

This document defines the complete data retention policy for the Daimon SaaS platform. It covers:

1. **Per-table retention rules** — how long each category of data is kept and when it is deleted
2. **Cleanup job SQL** — exact SQL statements for each cleanup operation
3. **Cleanup schedule** — when each job runs (pg_cron expressions)
4. **PITR and snapshot policy** — point-in-time recovery windows and backup snapshots
5. **Legal retention requirements** — which data must be kept for compliance reasons
6. **Account deletion cascade** — exact deletion order when a tenant deletes their account

---

## Guiding Principles

1. **Minimal data retention.** Keep only what is operationally necessary or legally required. Delete everything else on schedule.
2. **Encrypt in Vault, not in rows.** Sensitive credentials are in Supabase Vault (`vault.secrets`), not in table columns. Vault secret deletion is a separate operation from row deletion (see [vault-encryption.md](./vault-encryption.md) §Lifecycle).
3. **Hard deletes, not soft deletes, for personal data.** When a tenant deletes their account, rows are permanently deleted. No "deleted_at" flag that keeps data around. The exception is billing records (`stripe_webhook_events`, `tenant_subscriptions`) which are retained for regulatory compliance.
4. **Anonymize rather than delete where deletion is impossible.** If a foreign key constraint prevents deletion (e.g., `tenants.owner_id` ON DELETE RESTRICT), anonymize by nulling or replacing PII before deleting the user.
5. **Idempotent cleanup jobs.** Every cleanup SQL can run multiple times without error. Use `WHERE ... < NOW() - INTERVAL '...'` conditions. No state is maintained between runs.

---

## Table Inventory and Retention Summary

### New SaaS Tables (created by Daimon migrations)

| Table | Data Category | Retention Period | Cleanup Method | Legal Hold |
|-------|--------------|-----------------|----------------|-----------|
| `tenants` | Account configuration | Deleted on account deletion | Hard delete via API | No |
| `tenant_members` | Access control | Cascade delete with tenant | ON DELETE CASCADE | No |
| `discord_connections` | Configuration + operational state | Deleted on tenant deletion | Hard delete + Vault secret deletion | No |
| `tenant_api_keys` | API key metadata (not keys themselves) | Deleted on tenant deletion; metadata rows retained 90 days after revocation | Soft revoke → hard delete at 90 days | No |
| `tenant_service_connections` | OAuth/API key metadata | Deleted on tenant deletion; revoked connections retained 30 days | Soft revoke → hard delete at 30 days | No |
| `tenant_subscriptions` | Billing records | **7 years** after subscription end | Never auto-deleted — manual archive | **Yes** (tax/accounting law) |
| `stripe_webhook_events` | Webhook idempotency log | **90 days** | Cleanup job deletes rows older than 90 days | No |

### Existing Bot Tables (pre-existing schema)

| Table | Data Category | Retention Period | Cleanup Method | Legal Hold |
|-------|--------------|-----------------|----------------|-----------|
| `discord_channel_mapping` | Bot routing config | Indefinite (config data, no PII) | Manual deletion only | No |
| `session_templates` | Dev environment templates | Indefinite unless unused | Admin-managed | No |
| `bluedot_transcripts` | Meeting transcripts | **2 years** from `meeting_created_at` | Cleanup job | No |
| `user_identity_discord` | Discord identity link | Deleted with auth user (ON DELETE CASCADE) | CASCADE | No |
| `user_credentials` | Per-user credential metadata | Deleted with auth user (ON DELETE CASCADE); Vault secrets deleted at revocation | CASCADE + Vault cleanup | No |
| `user_profiles` | Admin flags | Deleted with auth user (manual, no FK) | Manual in account deletion flow | No |
| `admin_impersonation_sessions` | Security audit log | **1 year** | Cleanup job | No |
| `direct_message_sessions` | DM conversation context | **90 days** from last activity | Cleanup job | No |
| `conversation_skills` | Bot skill definitions | Indefinite (config data) | Manual deletion only | No |
| `scheduled_tasks` | Cron task definitions | Indefinite (config data) | Manual deletion only | No |

---

## Detailed Retention Policy Per Table

### `tenants`

**Data sensitivity:** Medium. Contains tenant name, owner user ID, plan status, Stripe customer ID.

**Retention rule:** Retained for the lifetime of the account. Deleted immediately upon account deletion (tenant owner initiates "Delete Account" from Settings → Danger Zone).

**What happens at deletion:**
1. All child rows are deleted first (see Account Deletion Cascade section below).
2. `tenants` row is deleted last.
3. Associated Supabase Auth user (`auth.users`) is deleted after `tenants` row (to satisfy ON DELETE RESTRICT constraint on `tenants.owner_id`).

**Cleanup job:** None. Deletion is always user-initiated or admin-initiated via the API.

**Legal hold:** None. The tenant name and Stripe customer ID are operational data, not billing records. Billing records are in `tenant_subscriptions`.

---

### `tenant_members`

**Data sensitivity:** Low. Contains user IDs and roles.

**Retention rule:** Cascade delete when the `tenants` row is deleted (ON DELETE CASCADE). Also cascade deleted when the `auth.users` row is deleted (ON DELETE CASCADE).

**No cleanup job required.** PostgreSQL handles this automatically.

---

### `discord_connections`

**Data sensitivity:** High. The `vault_secret_id` column points to an encrypted Discord bot token in Vault. The `guild_id` column is a Discord server identifier.

**Retention rule:** Retained for the lifetime of the tenant. Deleted when the tenant deletes their account.

**Vault cleanup:** The Vault secret (`vault.secrets` row containing the encrypted bot token) must be deleted separately — ON DELETE CASCADE on the `tenants` row does NOT cascade into Vault. The account deletion API route explicitly calls `vault.delete_secret(vault_secret_id)` before deleting the `discord_connections` row.

**On disconnection (user-initiated, not deletion):** When a user disconnects their bot without deleting the account, the `discord_connections` row is set to `status = 'disconnected'` but NOT deleted. The row is retained so that the user can reconnect using the same guild ID. The Vault secret is retained too. Only account deletion triggers actual row + Vault secret deletion.

**Cleanup job:** None for disconnected connections — they persist indefinitely. Only account deletion triggers cleanup.

---

### `tenant_api_keys`

**Data sensitivity:** High. `vault_secret_id` points to an encrypted Anthropic or OpenAI API key in Vault. `key_hint` is the masked last-4 of the key — safe to retain.

**Retention rule:**
- `status = 'active'` rows: retained indefinitely (until tenant replaces key, revokes it, or deletes account).
- `status = 'invalid'` rows: retained indefinitely (waiting for user to replace the key; the row is updated to `status = 'active'` when a new key is saved via UPSERT).
- `status = 'revoked'` rows: retained for **90 days** after `updated_at` (the revocation timestamp), then hard-deleted.

**Why 90 days for revoked rows?** The `key_hint` and revocation timestamp are useful for audit purposes: users and admins can see "Anthropic key sk-ant-a...b12c was removed on YYYY-MM-DD." After 90 days, this audit trail is no longer operationally useful.

**Vault cleanup on revocation:** At revocation time (not 90 days later), the Vault secret is immediately deleted by the API route. The `tenant_api_keys` row persists for 90 days but contains only metadata (`key_hint`, `key_type`, `status`, timestamps). No encrypted key material remains in the row or in Vault after revocation.

**Cleanup job:**

```sql
-- Cleanup job: delete revoked API key metadata rows older than 90 days
-- Schedule: daily at 03:00 UTC
-- Safe to run multiple times (idempotent)
DELETE FROM public.tenant_api_keys
WHERE status = 'revoked'
  AND updated_at < NOW() - INTERVAL '90 days';
```

**Account deletion:** All rows (regardless of status) for a given `tenant_id` are deleted by the account deletion API route. No cleanup job participation needed for account deletion.

---

### `tenant_service_connections`

**Data sensitivity:** High. `vault_secret_id` points to encrypted OAuth tokens or API keys in Vault. `metadata` JSONB may contain OAuth scopes and service-specific identifiers.

**Retention rule:**
- `status = 'active'` rows: retained indefinitely.
- `status = 'expired'` rows: retained until user reconnects (status updates to `'active'`) or until account deletion. NOT auto-deleted — expired connections serve as prompts for the user to reconnect.
- `status = 'error'` rows: retained indefinitely until user reconnects or disconnects.
- `status = 'revoked'` rows (user explicitly disconnected): retained for **30 days** after `updated_at`, then hard-deleted.

**Why 30 days for revoked rows?** Shorter than API keys (30 vs 90 days) because OAuth connections have less audit significance — there is no key hint to display. The row is only useful to show "last connected on YYYY-MM-DD" in the integration grid.

**Vault cleanup on revocation:** At disconnect time (not 30 days later), the Vault secret is immediately deleted by the API route. The metadata row persists for 30 days.

**Cleanup job:**

```sql
-- Cleanup job: delete revoked service connection metadata rows older than 30 days
-- Schedule: daily at 03:15 UTC
-- Safe to run multiple times (idempotent)
DELETE FROM public.tenant_service_connections
WHERE status = 'revoked'
  AND updated_at < NOW() - INTERVAL '30 days';
```

---

### `tenant_subscriptions`

**Data sensitivity:** Medium-High. Contains Stripe subscription IDs, billing cycle dates, plan history.

**Retention rule:** **7 years** from the date the subscription row is created or last meaningfully modified. Billing records are subject to tax and accounting regulations in most jurisdictions (IRS regulations in the US require retention of financial records for a minimum of 3 years for audits, 7 years for business records). Daimon retains for 7 years to be safe.

**No auto-deletion:** No cleanup job removes `tenant_subscriptions` rows. These rows persist beyond account deletion.

**Account deletion behavior:** When a tenant deletes their account:
1. The `tenants` row is deleted.
2. The `tenant_subscriptions` row is **NOT deleted** — it is retained for compliance.
3. The `tenant_id` foreign key on `tenant_subscriptions` references `tenants(id)`. To allow the `tenants` row to be deleted while keeping `tenant_subscriptions` alive, the FK relationship uses `ON DELETE SET NULL` (see schema note below).

**Schema note:** The `tenant_subscriptions.tenant_id` foreign key must be `ON DELETE SET NULL` (not CASCADE) so that billing records survive tenant deletion. After account deletion, `tenant_subscriptions.tenant_id` becomes NULL. The `stripe_subscription_id` and `stripe_customer_id` columns remain populated for compliance traceability.

**Archive process (at 7 years):**
1. Export all `tenant_subscriptions` rows where `updated_at < NOW() - INTERVAL '7 years'` to a CSV in a private Supabase Storage bucket (`billing-archive`).
2. Delete the rows from the database.
3. This is a manual admin operation — no automated job. Run via admin panel or direct database access.

---

### `stripe_webhook_events`

**Data sensitivity:** Low. Contains Stripe event IDs (format: `evt_XXXXXXXXXXXXXXXXX`) and processing status. No PII or sensitive financial data — Stripe event IDs are not sensitive.

**Purpose:** Idempotency store — prevents processing the same Stripe webhook event twice. After the retry window passes, old events have no operational value.

**Retention rule:** **90 days**. Stripe's event retention window is 30 days (events can be manually resent up to 30 days after creation via the Stripe Dashboard). Keeping 90 days provides buffer for late deliveries and gives the ops team time to investigate duplicate-processing incidents.

**Cleanup job:**

```sql
-- Cleanup job: delete old Stripe webhook event records
-- Schedule: daily at 03:30 UTC
-- Safe to run multiple times (idempotent)
DELETE FROM public.stripe_webhook_events
WHERE created_at < NOW() - INTERVAL '90 days';
```

**Index support:** `idx_stripe_webhook_events_created_at` on `(created_at)` ensures this DELETE is a fast index scan, not a sequential scan. See [indexes.md](./indexes.md#stripe_webhook_events).

---

### `bluedot_transcripts`

**Data sensitivity:** High. Full meeting transcripts, attendee lists, AI-generated summaries. Personal and business-confidential information.

**Retention rule:** **2 years** from `meeting_created_at`. After 2 years, meeting content has no operational value (Decision Orchestrator's use case is near-real-time meeting assistance, not archival).

**Cleanup job:**

```sql
-- Cleanup job: delete old Bluedot meeting transcripts
-- Schedule: weekly on Sunday at 04:00 UTC (low-traffic window)
-- Safe to run multiple times (idempotent)
-- Note: meeting_created_at may be NULL for malformed webhooks — those rows are never auto-deleted
DELETE FROM public.bluedot_transcripts
WHERE meeting_created_at IS NOT NULL
  AND meeting_created_at < NOW() - INTERVAL '2 years';
```

**Large row consideration:** `bluedot_transcripts` contains large JSONB columns (`transcript`, `raw_payload`). Each row can be 10–200KB. As the platform grows, this table may require partitioning by `meeting_created_at`. At current scale (single-tenant), weekly cleanup of 2-year-old rows is sufficient.

---

### `admin_impersonation_sessions`

**Data sensitivity:** High. Records of when admins impersonated users — security audit trail.

**Retention rule:** **1 year**. Security audit logs are typically retained for 1 year to support post-incident investigation and compliance reviews.

**Cleanup job:**

```sql
-- Cleanup job: delete old admin impersonation session records
-- Schedule: monthly on the 1st at 05:00 UTC
-- Safe to run multiple times (idempotent)
DELETE FROM public.admin_impersonation_sessions
WHERE created_at < NOW() - INTERVAL '1 year';
```

---

### `direct_message_sessions`

**Data sensitivity:** Medium. Contains conversation context for DM sessions. May contain user intent data but not full message content (messages are not stored in DB — ephemeral).

**Retention rule:** **90 days** from `updated_at` (last activity). DM sessions with no activity for 90 days are stale and consume unnecessary storage.

**Cleanup job:**

```sql
-- Cleanup job: delete inactive direct message sessions
-- Schedule: daily at 03:45 UTC
-- Safe to run multiple times (idempotent)
-- Note: uses updated_at (last activity), not created_at
DELETE FROM public.direct_message_sessions
WHERE updated_at < NOW() - INTERVAL '90 days';
```

---

### Tables With No Cleanup Jobs

The following tables contain configuration data with no time-based expiry. They are only modified by explicit user or admin actions:

| Table | Reason for No Cleanup |
|-------|----------------------|
| `discord_channel_mapping` | Configuration; deleted by admin when no longer needed |
| `session_templates` | Configuration; deleted by user or admin when deprecated |
| `user_profiles` | Small table (one row per user); lifecycle managed by auth user deletion |
| `conversation_skills` | Configuration; deleted when skill is removed |
| `scheduled_tasks` | Configuration; deleted when task is removed |

---

## Cleanup Job Schedule (pg_cron)

All cleanup jobs run as pg_cron jobs in the Supabase database. pg_cron is available on Supabase Pro plan and above.

### Installation Check

```sql
-- Verify pg_cron is available (run once)
SELECT * FROM pg_extension WHERE extname = 'pg_cron';
-- If not installed: CREATE EXTENSION pg_cron;
-- (Supabase Pro enables this automatically)
```

### Complete Cron Job Registration

Run the following SQL once (in a migration file `20260400000009_setup_cleanup_crons.sql`) to register all cleanup jobs:

```sql
-- Job 1: Delete revoked API key metadata rows older than 90 days
SELECT cron.schedule(
    'cleanup-revoked-api-keys',
    '0 3 * * *',  -- Daily at 03:00 UTC
    $$
    DELETE FROM public.tenant_api_keys
    WHERE status = 'revoked'
      AND updated_at < NOW() - INTERVAL '90 days';
    $$
);

-- Job 2: Delete revoked service connection metadata rows older than 30 days
SELECT cron.schedule(
    'cleanup-revoked-service-connections',
    '15 3 * * *',  -- Daily at 03:15 UTC
    $$
    DELETE FROM public.tenant_service_connections
    WHERE status = 'revoked'
      AND updated_at < NOW() - INTERVAL '30 days';
    $$
);

-- Job 3: Delete old Stripe webhook event records
SELECT cron.schedule(
    'cleanup-stripe-webhook-events',
    '30 3 * * *',  -- Daily at 03:30 UTC
    $$
    DELETE FROM public.stripe_webhook_events
    WHERE created_at < NOW() - INTERVAL '90 days';
    $$
);

-- Job 4: Delete inactive DM sessions
SELECT cron.schedule(
    'cleanup-direct-message-sessions',
    '45 3 * * *',  -- Daily at 03:45 UTC
    $$
    DELETE FROM public.direct_message_sessions
    WHERE updated_at < NOW() - INTERVAL '90 days';
    $$
);

-- Job 5: Delete old Bluedot transcripts (weekly — large rows, run on low-traffic day)
SELECT cron.schedule(
    'cleanup-bluedot-transcripts',
    '0 4 * * 0',  -- Weekly, Sunday at 04:00 UTC
    $$
    DELETE FROM public.bluedot_transcripts
    WHERE meeting_created_at IS NOT NULL
      AND meeting_created_at < NOW() - INTERVAL '2 years';
    $$
);

-- Job 6: Delete old admin impersonation session records
SELECT cron.schedule(
    'cleanup-admin-impersonation-sessions',
    '0 5 1 * *',  -- Monthly, 1st of month at 05:00 UTC
    $$
    DELETE FROM public.admin_impersonation_sessions
    WHERE created_at < NOW() - INTERVAL '1 year';
    $$
);
```

### Verify Registered Jobs

```sql
-- List all registered cleanup jobs
SELECT jobid, jobname, schedule, command, active
FROM cron.job
WHERE jobname LIKE 'cleanup-%'
ORDER BY jobname;
```

Expected output:

| jobname | schedule | active |
|---------|----------|--------|
| `cleanup-admin-impersonation-sessions` | `0 5 1 * *` | `true` |
| `cleanup-bluedot-transcripts` | `0 4 * * 0` | `true` |
| `cleanup-direct-message-sessions` | `45 3 * * *` | `true` |
| `cleanup-revoked-api-keys` | `0 3 * * *` | `true` |
| `cleanup-revoked-service-connections` | `15 3 * * *` | `true` |
| `cleanup-stripe-webhook-events` | `30 3 * * *` | `true` |

### Monitor Job Run History

```sql
-- Check recent job run results (last 50 runs per job)
SELECT
    j.jobname,
    r.start_time,
    r.end_time,
    r.return_message,
    r.status
FROM cron.job_run_details r
JOIN cron.job j ON j.jobid = r.jobid
WHERE j.jobname LIKE 'cleanup-%'
ORDER BY r.start_time DESC
LIMIT 100;
```

### Disable/Re-enable a Job (Emergency Use)

```sql
-- Disable a job (e.g., during incident investigation)
SELECT cron.unschedule('cleanup-stripe-webhook-events');

-- Re-enable:
SELECT cron.schedule(
    'cleanup-stripe-webhook-events',
    '30 3 * * *',
    $$
    DELETE FROM public.stripe_webhook_events
    WHERE created_at < NOW() - INTERVAL '90 days';
    $$
);
```

---

## Account Deletion Cascade

When a tenant owner triggers "Delete Account" from Settings → Danger Zone, the website API route `DELETE /api/tenants/[tenantId]` performs the following deletion sequence. All steps run in a single database transaction (using Supabase service role client) except for Vault deletions (Vault operations are not transactional with PostgreSQL).

### Pre-Transaction: Vault Secret Deletion

Vault secrets are NOT deleted by PostgreSQL CASCADE. They must be explicitly deleted before the database rows that reference them.

```
Step 1: Fetch all Vault secret IDs for this tenant
  SELECT vault_secret_id FROM discord_connections
  WHERE tenant_id = :tenant_id AND vault_secret_id IS NOT NULL;

  SELECT vault_secret_id FROM tenant_api_keys
  WHERE tenant_id = :tenant_id AND vault_secret_id IS NOT NULL;

  SELECT vault_secret_id FROM tenant_service_connections
  WHERE tenant_id = :tenant_id AND vault_secret_id IS NOT NULL;

Step 2: Delete each Vault secret
  For each vault_secret_id:
    vault.delete_secret(vault_secret_id)
    -- This calls the Vault API; not a SQL statement
    -- On failure: log error, continue (orphaned Vault secrets are
    -- non-critical — they contain no row references and will be
    -- cleaned up by the monthly Vault orphan cleanup job)
```

### In-Transaction: Row Deletion (Ordered)

```sql
BEGIN;

-- Step 3: Delete tenant_service_connections (child of tenants)
DELETE FROM public.tenant_service_connections
WHERE tenant_id = :tenant_id;

-- Step 4: Delete tenant_api_keys (child of tenants)
DELETE FROM public.tenant_api_keys
WHERE tenant_id = :tenant_id;

-- Step 5: Delete discord_connections (child of tenants)
DELETE FROM public.discord_connections
WHERE tenant_id = :tenant_id;

-- Step 6: Delete tenant_subscriptions — NOTE: NOT deleted for compliance.
-- Instead: SET tenant_id = NULL to detach from the deleted tenant.
-- The stripe_subscription_id, stripe_customer_id, and billing history remain.
UPDATE public.tenant_subscriptions
SET tenant_id = NULL
WHERE tenant_id = :tenant_id;

-- Step 7: Delete tenant_members (ON DELETE CASCADE handles this automatically
-- when tenants is deleted in Step 8, but explicit delete is cleaner for
-- error handling — if Step 8 fails, we want to see which step failed)
DELETE FROM public.tenant_members
WHERE tenant_id = :tenant_id;

-- Step 8: Delete tenants (parent row — must be last)
DELETE FROM public.tenants
WHERE id = :tenant_id;

COMMIT;
```

### Post-Transaction: Auth User Deletion

After the database transaction commits, the Supabase Auth user is deleted. This must happen AFTER the `tenants` row is deleted because `tenants.owner_id` references `auth.users(id)` with ON DELETE RESTRICT.

```typescript
// Using Supabase Admin client (service role)
const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
if (error) {
  // Log critical error — tenant rows are deleted but auth user still exists.
  // User cannot log in but ghost auth user exists.
  // Manual cleanup required.
  logger.error('CRITICAL: Failed to delete auth user after tenant deletion', {
    userId,
    tenantId,
    error: error.message,
  });
}
```

### Cancellation / Error Handling

If the database transaction fails at any step:
- Steps 1–2 (Vault deletions) have already run. Vault secrets may be orphaned.
- Steps 3–8 are rolled back automatically by `ROLLBACK`.
- The account is not deleted. The user sees an error: "Account deletion failed. Please contact support."
- Orphaned Vault secrets (secrets with no corresponding row) are cleaned up by the monthly Vault orphan cleanup job (see Vault Orphan Cleanup section below).

---

## Vault Orphan Cleanup

Supabase Vault secrets can become orphaned if the API route crashes between deleting the Vault secret and deleting the database row (or vice versa). This is rare but possible.

**Definition of orphan:** A `vault.secrets` row whose `id` does not appear in any of:
- `discord_connections.vault_secret_id`
- `tenant_api_keys.vault_secret_id`
- `tenant_service_connections.vault_secret_id`
- `user_credentials.vault_secret_id`

**Detection query (run monthly via admin panel or cron):**

```sql
-- Find orphaned Vault secrets (secrets with no referencing row)
-- NOTE: Requires service role or Vault-enabled role to access vault.secrets
SELECT vs.id, vs.name, vs.created_at
FROM vault.secrets vs
WHERE vs.name LIKE 'discord_bot_tokens:%'
   OR vs.name LIKE 'tenant_api_keys:%'
   OR vs.name LIKE 'tenant_service_connections:%'
   OR vs.name LIKE 'user_credentials:%'
EXCEPT
(
    SELECT vault_secret_id FROM public.discord_connections
    WHERE vault_secret_id IS NOT NULL
    UNION ALL
    SELECT vault_secret_id FROM public.tenant_api_keys
    WHERE vault_secret_id IS NOT NULL
    UNION ALL
    SELECT vault_secret_id FROM public.tenant_service_connections
    WHERE vault_secret_id IS NOT NULL
    UNION ALL
    SELECT vault_secret_id FROM public.user_credentials
    WHERE vault_secret_id IS NOT NULL
);
```

**Cleanup:** For each orphaned Vault secret, call `vault.delete_secret(id)` from the admin panel or a service-role SQL function. There is no automated cron for Vault cleanup because the detection query requires service role access (not available to pg_cron jobs by default on Supabase).

**Frequency:** Run this check monthly. Volume expected: near-zero in normal operation.

---

## PITR (Point-In-Time Recovery) Policy

### Supabase PITR Configuration

Supabase provides PITR on Pro plan and above. Daimon SaaS must use Supabase **Pro** plan (not Free) to enable PITR.

**Required PITR window:** **7 days**

**Rationale:**
- 7-day PITR covers the most common operational incidents: accidental data deletion, failed migrations, corrupted data from bugs.
- Stripe webhook events are retained for 90 days (see above) — if billing data needs recovery beyond 7 days, it can be reconstructed from Stripe's event log.
- 7-day PITR is the minimum Supabase Pro offering. Upgrade to Business plan for 30-day PITR if needed.

**Configuration steps:**
1. Log in to Supabase Dashboard → Project Settings → Database
2. Under "Point in Time Recovery," enable PITR.
3. Select **7-day** recovery window (included in Pro plan).
4. Confirm that WAL (Write-Ahead Log) archiving is active (shown on the same page).

**PITR restoration procedure:**
1. Supabase Dashboard → Project → Database → Restore
2. Select target timestamp (must be within 7-day window)
3. Choose between:
   - **Full restore** — replaces entire database with PITR snapshot. Use for catastrophic failures.
   - **Fork restore** — creates a new Supabase project from the PITR snapshot. Use for data recovery without affecting production.
4. For data recovery, use Fork restore, extract the affected rows, and re-insert into production.

### When PITR is NOT sufficient

PITR restores the entire database state at a point in time. It does NOT restore:
- Supabase Vault secrets (Vault is a separate service, not covered by database PITR).
- Supabase Auth state (auth users are separate from the PostgreSQL database in Supabase's architecture).
- Supabase Storage objects (files in storage buckets are not in PostgreSQL).

For Vault secret loss, there is no automated recovery. Affected tenants must re-enter their credentials.

---

## Snapshot Policy (Manual Backups)

In addition to PITR, Supabase automatically creates daily database snapshots on Pro plan.

**Automatic snapshot retention:** Supabase retains the last 7 days of daily snapshots on Pro plan.

**Manual snapshot policy:**

| Event | Action |
|-------|--------|
| Before a major migration | Run `supabase db dump -f backup-pre-migration-YYYY-MM-DD.sql` and save to private storage |
| Monthly | Save a monthly snapshot CSV for `tenant_subscriptions` to `billing-archive` Supabase Storage bucket |
| Before Supabase plan changes | Take a manual snapshot in case plan change triggers any database operations |

**Manual snapshot command (run from local machine with Supabase CLI):**

```bash
# Full schema + data dump (for local archive before major migrations)
supabase db dump \
  --project-ref <PROJECT_REF> \
  --linked \
  -f backup-$(date +%Y%m%d).sql

# Data-only dump of billing records (monthly archive)
supabase db dump \
  --project-ref <PROJECT_REF> \
  --linked \
  --data-only \
  --table tenant_subscriptions \
  -f tenant_subscriptions-$(date +%Y%m).csv
```

---

## Data Retention Summary for Privacy Policy

The following retention periods must be accurately reflected in the Daimon Privacy Policy (see [../legal/privacy-policy.md](../legal/privacy-policy.md)):

| Data Type | Retention Period | Notes |
|-----------|-----------------|-------|
| Account information (tenant name, email) | Until account deletion | Deleted within 30 days of account deletion request |
| Discord bot token | Until disconnected or account deleted | Stored encrypted; deleted immediately on revocation |
| AI provider API keys (Anthropic, OpenAI) | Until revoked or account deleted | Stored encrypted; key material deleted immediately on revocation |
| OAuth tokens (GitHub, Google, Linear) | Until disconnected or account deleted | Stored encrypted; deleted immediately on revocation |
| Billing records (subscription history) | 7 years from subscription end | Required for tax compliance |
| Meeting transcripts (Bluedot) | 2 years from meeting date | Subject to user data deletion requests (GDPR/CCPA) |
| Admin audit logs | 1 year | Security compliance |
| Bot conversation context | 90 days from last activity | Not full message content — only session metadata |

**User data deletion requests (GDPR Article 17 / CCPA):**
- Users can delete their account at any time from Settings → Danger Zone → Delete Account.
- Account deletion triggers immediate deletion of all personal data except billing records (legally retained for 7 years).
- Billing records are anonymized where possible (tenant_id set to NULL) but financial records are retained.
- Data deletion is complete within **30 days** of the account deletion request.
- Supabase backups (PITR + daily snapshots) may retain deleted data for up to **7 days** after deletion, after which it is permanently purged from backup storage.

---

## Migration: Cleanup Cron Registration

**Migration file:** `20260400000009_setup_cleanup_crons.sql`

**Migration type:** Additive (safe). Does not modify any existing tables or rows. Creates pg_cron jobs only.

**Idempotency:** Use `cron.unschedule()` before `cron.schedule()` to allow re-running the migration safely.

```sql
-- Migration: 20260400000009_setup_cleanup_crons.sql
-- Purpose: Register all data retention cleanup jobs via pg_cron
-- Type: Additive (safe to run on live database)

-- Unschedule existing jobs first (idempotent — no error if job doesn't exist)
SELECT cron.unschedule('cleanup-revoked-api-keys') WHERE EXISTS (
    SELECT 1 FROM cron.job WHERE jobname = 'cleanup-revoked-api-keys'
);
SELECT cron.unschedule('cleanup-revoked-service-connections') WHERE EXISTS (
    SELECT 1 FROM cron.job WHERE jobname = 'cleanup-revoked-service-connections'
);
SELECT cron.unschedule('cleanup-stripe-webhook-events') WHERE EXISTS (
    SELECT 1 FROM cron.job WHERE jobname = 'cleanup-stripe-webhook-events'
);
SELECT cron.unschedule('cleanup-direct-message-sessions') WHERE EXISTS (
    SELECT 1 FROM cron.job WHERE jobname = 'cleanup-direct-message-sessions'
);
SELECT cron.unschedule('cleanup-bluedot-transcripts') WHERE EXISTS (
    SELECT 1 FROM cron.job WHERE jobname = 'cleanup-bluedot-transcripts'
);
SELECT cron.unschedule('cleanup-admin-impersonation-sessions') WHERE EXISTS (
    SELECT 1 FROM cron.job WHERE jobname = 'cleanup-admin-impersonation-sessions'
);

-- Register jobs
SELECT cron.schedule('cleanup-revoked-api-keys', '0 3 * * *',
    'DELETE FROM public.tenant_api_keys WHERE status = ''revoked'' AND updated_at < NOW() - INTERVAL ''90 days'';'
);

SELECT cron.schedule('cleanup-revoked-service-connections', '15 3 * * *',
    'DELETE FROM public.tenant_service_connections WHERE status = ''revoked'' AND updated_at < NOW() - INTERVAL ''30 days'';'
);

SELECT cron.schedule('cleanup-stripe-webhook-events', '30 3 * * *',
    'DELETE FROM public.stripe_webhook_events WHERE created_at < NOW() - INTERVAL ''90 days'';'
);

SELECT cron.schedule('cleanup-direct-message-sessions', '45 3 * * *',
    'DELETE FROM public.direct_message_sessions WHERE updated_at < NOW() - INTERVAL ''90 days'';'
);

SELECT cron.schedule('cleanup-bluedot-transcripts', '0 4 * * 0',
    'DELETE FROM public.bluedot_transcripts WHERE meeting_created_at IS NOT NULL AND meeting_created_at < NOW() - INTERVAL ''2 years'';'
);

SELECT cron.schedule('cleanup-admin-impersonation-sessions', '0 5 1 * *',
    'DELETE FROM public.admin_impersonation_sessions WHERE created_at < NOW() - INTERVAL ''1 year'';'
);
```

---

## Cross-References

- [schema.md](./schema.md) — Full table definitions including FK constraint types (CASCADE vs SET NULL vs RESTRICT)
- [vault-encryption.md](./vault-encryption.md) — Vault secret lifecycle and deletion patterns
- [migrations.md](./migrations.md) — Migration `20260400000009_setup_cleanup_crons.sql` location
- [../legal/privacy-policy.md](../legal/privacy-policy.md) — Privacy policy retention disclosures (must match this document)
- [../api/routes.md](../api/routes.md) — `DELETE /api/tenants/[tenantId]` — account deletion API route implementation
- [../frontend/settings-page.md](../frontend/settings-page.md) — Danger Zone UI that triggers account deletion
- [../deployment/infrastructure.md](../deployment/infrastructure.md) — Supabase plan requirements (Pro plan for PITR + pg_cron)
