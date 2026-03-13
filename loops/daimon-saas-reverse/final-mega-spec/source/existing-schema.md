# Existing Supabase Schema — Decision Orchestrator

**Source:** `projects/decision-orchestrator/supabase/migrations/` (31 migration files)
**Database:** PostgreSQL 17, hosted on Supabase
**Schema:** `public` (all tables unless otherwise noted)
**Extracted:** 2026-03-13

This file documents the CURRENT (post-all-migrations) schema. It reflects the net state after all 31 migrations have been applied, including dropped columns and dropped tables.

---

## Migration History (Chronological)

| Migration | Description |
|-----------|-------------|
| 20251104000000_create_discord_workflow_system.sql | Created discord_workflow, discord_workflow_scope, discord_workflow_execution, discord_thread_sessions, discord_channel_mapping |
| 20251105000000_drop_recursive_trigger.sql | Dropped cleanup trigger on discord_thread_sessions (caused stack overflow) |
| 20251108000000_remove_claude_session_resumption.sql | Removed claude_session_id, expires_at, status from discord_thread_sessions; renamed last_interaction_at → updated_at |
| 20251108171941_add_workflow_trigger_type.sql | Added trigger_type column to discord_workflow |
| 20251113_remove_langfuse_columns.sql | Removed langfuse_trace_id, langfuse_observation_id from discord_thread_sessions |
| 20251204_add_xero_workflow.sql | Added UNIQUE constraint on discord_workflow.name; inserted Xero Accounting Assistant workflow seed data |
| 20251216204538_create_session_templates.sql | Created session_templates table |
| 20260103_remove_onyx_session_id.sql | Removed onyx_session_id from discord_thread_sessions |
| 20260107_simplify_session_templates.sql | Added fly_app to session_templates; dropped image_ref and services |
| 20260113_create_n8n_workflows.sql | Created n8n_workflows table |
| 20260121_drop_legacy_schema_migrations.sql | Dropped legacy public.schema_migrations table |
| 20260123_create_accessible_view.sql | No-op baseline (view already existed in production) |
| 20260124_add_bluedot_workflow.sql | Inserted Bluedot Meeting Assistant seed data into discord_workflow |
| 20260125_create_bluedot_transcripts.sql | Created bluedot_transcripts table, bluedot_accessible_meetings view, bluedot_webhook_writer and discord_bot_reader roles |
| 20260130_create_thread_tool_contexts.sql | Created thread_tool_contexts table |
| 20260201_baseline_bluedot_schema.sql | No-op baseline (history tracking) |
| 20260211_create_user_auth_tables.sql | Created user_identity_discord and user_credentials with RLS policies |
| 20260217081322_add_admin_impersonation.sql | Created user_profiles and admin_impersonation_sessions |
| 20260219093104_create_discord_archive_bucket.sql | Created discord-archive storage bucket (private) |
| 20260223_create_direct_message_sessions.sql | Created direct_message_sessions table |
| 20260224_drop_unused_tables.sql | **DROPPED**: discord_workflow_execution, discord_workflow_scope, discord_workflow, discord_thread_sessions, n8n_workflows, thread_tool_contexts |
| 20260225000000_fix_accessible_view_null_validation.sql | Fixed bluedot_accessible_meetings view: changed IS TRUE → IS NOT FALSE to include null validation state |
| 20260225100000_create_conversation_skills.sql | Created conversation_skills table |
| 20260225120000_create_scheduled_tasks.sql | Created scheduled_tasks table; added pg_cron job if extension available |
| 20260225130000_repair.sql | No-op repair placeholder for migration history consistency |
| 20260226050000_add_transcript_text.sql | Added transcript_text TEXT column to bluedot_transcripts |
| 20260226100000_refresh_accessible_meetings_view.sql | Refreshed bluedot_accessible_meetings view to include transcript_text |
| 20260227120000_drop_scheduled_tasks_channel_id.sql | Intended to drop channel_id from scheduled_tasks — did NOT run on production (timestamp collision) |
| 20260227130000_backfill_has_transcript_flags.sql | Backfilled has_transcript and has_summary flags on bluedot_transcripts |
| 20260302120000_drop_scheduled_tasks_channel_id_retry.sql | Retry: DROP COLUMN IF EXISTS channel_id on scheduled_tasks |
| 20260303120000_enable_discord_bot_reader_login.sql | ALTER ROLE discord_bot_reader WITH LOGIN |

---

## Current Tables (Live Schema)

### Table: `discord_channel_mapping`

Maps client-facing Discord channels to internal response channels. Used to route bot responses to correct channel.

| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PRIMARY KEY |
| client_channel_id | BIGINT | NOT NULL | — | UNIQUE |
| internal_channel_id | BIGINT | NOT NULL | — | — |
| server_id | BIGINT | NOT NULL | — | — |
| is_enabled | BOOLEAN | NOT NULL | true | — |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | — |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | — |

**Indexes:**
- `idx_discord_channel_mapping_client` ON (client_channel_id, is_enabled) WHERE is_enabled = true

**Triggers:**
- `discord_channel_mapping_updated_at` BEFORE UPDATE FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()

**RLS:** Not enabled.

**Comment:** Maps client-facing channels to internal response channels.

---

### Table: `session_templates`

Stores user-created and system templates for dev environment launches. Each template references a Fly.io application.

| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PRIMARY KEY |
| slug | TEXT | NOT NULL | — | UNIQUE |
| name | TEXT | NOT NULL | — | — |
| description | TEXT | NULL | — | — |
| fly_app | TEXT | NOT NULL | — | — |
| features | TEXT[] | NULL | '{}' | — |
| source_repos | TEXT[] | NULL | '{}' | — |
| framework | TEXT | NULL | — | — |
| created_by_discord_id | TEXT | NULL | — | — |
| created_by_discord_name | TEXT | NULL | — | — |
| is_public | BOOLEAN | NULL | FALSE | — |
| created_at | TIMESTAMPTZ | NULL | NOW() | — |
| updated_at | TIMESTAMPTZ | NULL | NOW() | — |
| last_launched_at | TIMESTAMPTZ | NULL | — | — |
| launch_count | INTEGER | NULL | 0 | — |

**Indexes:**
- `idx_session_templates_slug` ON (slug)
- `idx_session_templates_public` ON (is_public)
- `idx_session_templates_created_by` ON (created_by_discord_id)
- `idx_session_templates_fly_app` ON (fly_app)

**Triggers:**
- `session_templates_updated_at` BEFORE UPDATE FOR EACH ROW EXECUTE FUNCTION update_session_templates_updated_at()

**Functions:**
- `update_session_templates_updated_at()` — Sets NEW.updated_at = NOW(); RETURN NEW

**RLS:** Not enabled.

---

### Table: `bluedot_transcripts`

BlueDot meeting transcripts ingested via webhook. Stores full meeting metadata, transcript JSON, and AI-generated summaries.

| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PRIMARY KEY |
| meeting_id | TEXT | NOT NULL | — | UNIQUE |
| video_id | TEXT | NULL | — | — |
| title | TEXT | NULL | — | — |
| attendees | JSONB | NULL | — | — |
| duration | NUMERIC | NULL | — | — |
| meeting_created_at | TIMESTAMPTZ | NULL | — | — |
| transcript | JSONB | NULL | — | — |
| has_transcript | BOOLEAN | NOT NULL | FALSE | — |
| summary | TEXT | NULL | — | — |
| summary_v2 | TEXT | NULL | — | — |
| has_summary | BOOLEAN | NOT NULL | FALSE | — |
| webhook_type | TEXT | NULL | — | — |
| raw_payload | JSONB | NULL | — | — |
| transcript_text | TEXT | NULL | — | — |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | — |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | — |

**Notes on columns:**
- `transcript_text` — Plain-text version of the transcript for fast ILIKE search (avoids JSONB casting). Added in 20260226050000.
- `has_transcript` — Backfilled flag; true when transcript IS NOT NULL AND jsonb_array_length(transcript) > 0.
- `has_summary` — Backfilled flag; true when summary IS NOT NULL OR summary_v2 IS NOT NULL.
- `raw_payload` — Raw webhook payload including `_validation` key: `{"_validation": {"is_accessible": boolean|null, "checked_at": timestamp}}`.

**Indexes:**
- `idx_bluedot_meeting_id` ON (meeting_id)
- `idx_bluedot_meeting_created_at` ON (meeting_created_at DESC NULLS LAST)
- `idx_bluedot_raw_payload` GIN ON (raw_payload)

**RLS:** Not enabled. Controlled via role-based grants (see Roles section).

---

### Table: `user_identity_discord`

Links Supabase Auth users to their Discord accounts. One-to-one relationship.

| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PRIMARY KEY |
| user_id | UUID | NOT NULL | — | UNIQUE, REFERENCES auth.users(id) ON DELETE CASCADE |
| discord_id | TEXT | NOT NULL | — | UNIQUE |
| discord_username | TEXT | NULL | — | — |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | — |

**Indexes:**
- `idx_user_identity_discord_discord_id` ON (discord_id)
- `idx_user_identity_discord_user_id` ON (user_id)

**RLS:** ENABLED.

**RLS Policies:**
```sql
-- Policy: "Users can read own identity"
CREATE POLICY "Users can read own identity"
    ON public.user_identity_discord FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: "Users can insert own identity"
CREATE POLICY "Users can insert own identity"
    ON public.user_identity_discord FOR INSERT
    WITH CHECK (auth.uid() = user_id);
```

**Note:** Bot uses service_role key which bypasses RLS.

---

### Table: `user_credentials`

Per-user platform credentials stored as references to Supabase Vault secrets. Actual credential values live in vault.secrets.

| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PRIMARY KEY |
| user_id | UUID | NOT NULL | — | REFERENCES auth.users(id) ON DELETE CASCADE |
| platform | TEXT | NOT NULL | — | — |
| vault_secret_id | UUID | NOT NULL | — | REFERENCES vault.secrets(id) |
| metadata | JSONB | NULL | '{}' | — |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | — |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | — |
| | | | | UNIQUE (user_id, platform) |

**Indexes:**
- `idx_user_credentials_user_id` ON (user_id)

**RLS:** ENABLED.

**RLS Policies:**
```sql
-- Policy: "Users can read own credentials"
CREATE POLICY "Users can read own credentials"
    ON public.user_credentials FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: "Users can insert own credentials"
CREATE POLICY "Users can insert own credentials"
    ON public.user_credentials FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: "Users can update own credentials"
CREATE POLICY "Users can update own credentials"
    ON public.user_credentials FOR UPDATE
    USING (auth.uid() = user_id);

-- Policy: "Users can delete own credentials"
CREATE POLICY "Users can delete own credentials"
    ON public.user_credentials FOR DELETE
    USING (auth.uid() = user_id);
```

**Note:** Bot uses service_role key which bypasses RLS. `platform` values observed in design: 'anthropic', 'openai', 'github', 'linear', 'toggl', 'google'.

---

### Table: `user_profiles`

Decision Orchestrator-level user properties. Currently only tracks is_admin flag. One row per user.

| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| user_id | UUID | NOT NULL | — | PRIMARY KEY |
| is_admin | BOOLEAN | NOT NULL | false | — |
| created_at | TIMESTAMPTZ | NULL | NOW() | — |

**RLS:** Not enabled (no migration sets it up).

**Note:** user_id is a PK but there is no explicit REFERENCES auth.users constraint declared in the migration. Assumed to reference auth.users conceptually.

---

### Table: `admin_impersonation_sessions`

Tracks currently active admin impersonation sessions. One active session per admin at a time (enforced by UNIQUE on admin_user_id).

| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PRIMARY KEY |
| admin_user_id | UUID | NOT NULL | — | UNIQUE |
| target_user_id | UUID | NOT NULL | — | — |
| created_at | TIMESTAMPTZ | NULL | NOW() | — |

**RLS:** Not enabled.

---

### Table: `direct_message_sessions`

Tracks DM conversation boundaries per user per platform. One active session per (platform, platform_user_id) pair — new message resets the session.

| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PRIMARY KEY |
| platform | TEXT | NOT NULL | 'discord' | — |
| platform_user_id | TEXT | NOT NULL | — | — |
| started_at | TIMESTAMPTZ | NOT NULL | NOW() | — |
| session_uuid | TEXT | NOT NULL | — | — |
| | | | | UNIQUE (platform, platform_user_id) |

**Indexes:**
- `idx_direct_message_sessions_platform_user` ON (platform, platform_user_id)

**RLS:** Not enabled.

---

### Table: `conversation_skills`

Tracks which Decision Hub skills are active per conversation. Skills are activated within a conversation and remain active for that conversation's duration.

| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PRIMARY KEY |
| conversation_id | TEXT | NOT NULL | — | — |
| org | TEXT | NOT NULL | — | — |
| skill_name | TEXT | NOT NULL | — | — |
| activated_at | TIMESTAMPTZ | NOT NULL | NOW() | — |
| | | | | UNIQUE (conversation_id, org, skill_name) |

**Indexes:**
- `idx_conversation_skills_conversation_id` ON (conversation_id)

**RLS:** Not enabled.

---

### Table: `scheduled_tasks`

Recurring cron-based task execution. Bot polls this table to find tasks due for execution and sends prompts as DMs to the user.

| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PRIMARY KEY |
| user_discord_id | TEXT | NOT NULL | — | — |
| guild_id | TEXT | NOT NULL | — | — |
| prompt | TEXT | NOT NULL | — | — |
| cron_expression | TEXT | NOT NULL | — | — |
| schedule_display | TEXT | NOT NULL | — | — |
| timezone | TEXT | NOT NULL | — | — |
| is_enabled | BOOLEAN | NOT NULL | true | — |
| next_run | TIMESTAMPTZ | NOT NULL | — | — |
| last_run | TIMESTAMPTZ | NULL | — | — |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | — |

**Indexes:**
- `idx_scheduled_tasks_due` ON (next_run, is_enabled) — supports query: WHERE next_run <= NOW() AND is_enabled = true
- `idx_scheduled_tasks_user_guild` ON (user_discord_id, guild_id)

**RLS:** Not enabled.

**pg_cron job (if extension available):**
```sql
-- Job name: 'advance-overdue-schedules'
-- Schedule: every 5 minutes
-- Action: Advances next_run for tasks overdue > 1 hour
-- (bot recomputes precise next_run with croniter on actual execution)
UPDATE scheduled_tasks
SET next_run = next_run + (
    CASE
        WHEN cron_expression LIKE '% % % % %' THEN interval '1 day'
        ELSE interval '1 hour'
    END
)
WHERE next_run < now() - interval '1 hour'
  AND is_enabled = true;
```

**Note on channel_id:** A channel_id column was initially present but was successfully dropped via the retry migration 20260302120000.

---

## Views

### View: `bluedot_accessible_meetings`

Read-only view over `bluedot_transcripts` filtering to accessible meetings only.

```sql
CREATE OR REPLACE VIEW bluedot_accessible_meetings AS
SELECT *
FROM bluedot_transcripts
WHERE (raw_payload->'_validation'->>'is_accessible')::boolean IS NOT FALSE;
```

**Filter logic:**
- `IS NOT FALSE` is used (not `IS TRUE`) to include rows where:
  - `_validation` key is absent from raw_payload (NULL IS NOT FALSE = TRUE → include)
  - `is_accessible` is null due to validation error (NULL IS NOT FALSE = TRUE → include)
  - `is_accessible` is true (TRUE IS NOT FALSE = TRUE → include)
  - `is_accessible` is false → excluded

**Grants:**
```sql
GRANT SELECT ON bluedot_accessible_meetings TO bluedot_webhook_writer;
GRANT SELECT ON bluedot_accessible_meetings TO discord_bot_reader;
```

**Columns:** All columns from `bluedot_transcripts` including `transcript_text` (added after view refresh in 20260226100000).

---

## Storage Buckets

### Bucket: `discord-archive`

| Property | Value |
|----------|-------|
| id | discord-archive |
| name | discord-archive |
| public | false |
| created_by | — |

Created via: `INSERT INTO storage.buckets (id, name, public) VALUES ('discord-archive', 'discord-archive', false) ON CONFLICT (id) DO NOTHING`

---

## Database Roles

### Role: `bluedot_webhook_writer`

| Grant | Object |
|-------|--------|
| SELECT, INSERT, UPDATE, DELETE | bluedot_transcripts |
| SELECT | bluedot_accessible_meetings |

**Login:** Not enabled (application role, used by webhook service account).

### Role: `discord_bot_reader`

| Grant | Object |
|-------|--------|
| SELECT | bluedot_accessible_meetings |

**Login:** ENABLED (as of 20260303120000). Password must be set separately via `ALTER ROLE discord_bot_reader WITH PASSWORD '...'`. Used by external read-only consumers (e.g., Cursor agent, Postgres MCP server).

---

## Shared Functions

### `update_updated_at_column()`

Still active (not dropped). Used by `discord_channel_mapping_updated_at` trigger.

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### `update_session_templates_updated_at()`

Used by `session_templates_updated_at` trigger.

```sql
CREATE OR REPLACE FUNCTION update_session_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## Dropped Tables (No Longer Exist)

Dropped by migration 20260224_drop_unused_tables.sql:

| Table | Originally Created | Reason Dropped |
|-------|-------------------|----------------|
| `discord_workflow` | 20251104 | No longer referenced by application code |
| `discord_workflow_scope` | 20251104 | No longer referenced |
| `discord_workflow_execution` | 20251104 | No longer referenced |
| `discord_thread_sessions` | 20251104 | No longer referenced (bot rebuilt history on each message) |
| `n8n_workflows` | 20260113 | No longer referenced |
| `thread_tool_contexts` | 20260130 | No longer referenced |

**Note:** `update_updated_at_column()` function was NOT dropped as it is still used by `discord_channel_mapping`.

---

## Schema Notes for Multi-Tenant Adaptation

The following observations are critical for the Daimon SaaS multi-tenant adaptation (see [multi-tenant/adaptation-plan.md](../multi-tenant/adaptation-plan.md)):

1. **Existing tables have NO tenant_id column.** All existing tables (`discord_channel_mapping`, `session_templates`, `bluedot_transcripts`, `scheduled_tasks`, `conversation_skills`, `direct_message_sessions`) are single-tenant. They will need either:
   - A `tenant_id` column added via additive migration, OR
   - Separate new tables for multi-tenant equivalents, OR
   - Remain as single-tenant tables (if they are deprecated in the multi-tenant model)

2. **`user_credentials` and `user_identity_discord` are user-scoped, not tenant-scoped.** These use `auth.users` as the root reference. In multi-tenant, credentials should be tenant-scoped. The new `tenant_api_keys` and `tenant_service_connections` tables (defined in the design spec) will replace/supplement these.

3. **`scheduled_tasks` is by Discord user, not tenant.** In multi-tenant, tasks should be tenant-scoped. The `guild_id` and `user_discord_id` columns will need tenant context.

4. **`admin_impersonation_sessions` and `user_profiles` can remain as-is** — they are user-level admin constructs that the new admin panel will also use.

5. **Vault integration exists** — `user_credentials.vault_secret_id REFERENCES vault.secrets(id)` shows the Vault pattern is already established. The new `tenant_api_keys` and `tenant_service_connections` tables will follow the same pattern.

6. **RLS on `user_identity_discord` and `user_credentials` is a model** — The multi-tenant tables should follow this same pattern but scoped to `tenant_members` membership rather than direct `user_id` equality.

---

## New Tables Required for Multi-Tenant SaaS

The following new tables are specified in the design spec (`docs/superpowers/specs/2026-03-12-daimon-saas-design.md`) and must be created via new migrations:

- `tenants` — Core tenant entity
- `tenant_members` — User membership in tenants (owner/admin/member roles)
- `discord_connections` — Bot token + guild per tenant
- `tenant_api_keys` — Anthropic/OpenAI keys per tenant (Vault-encrypted)
- `tenant_service_connections` — OAuth and API key service credentials per tenant
- `tenant_subscriptions` — Stripe subscription state per tenant

See [database/schema.md](../database/schema.md) for complete column specifications of all new tables.
