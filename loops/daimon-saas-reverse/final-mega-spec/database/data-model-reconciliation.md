# Data Model Reconciliation — Aspect 8.1

**Date:** 2026-03-13
**Purpose:** Verify that `database/schema.md` covers everything needed by the frontend, API routes, integrations, and bot. Identify gaps for follow-up aspects.

---

## 1. Tables Defined in `database/schema.md`

| Table | Status | Notes |
|-------|--------|-------|
| `tenants` | ✅ Fully documented | 8 columns, 4 indexes, 4 RLS policies, triggers |
| `tenant_members` | ✅ Fully documented | 5 columns, composite PK, 3 FKs, 4 RLS policies |
| `discord_connections` | ✅ Fully documented | 10 columns, lifecycle states, 3 indexes, 4 RLS policies |
| `tenant_api_keys` | ✅ Fully documented | 9 columns, UNIQUE per provider, Vault, RLS |
| `tenant_service_connections` | ✅ Fully documented | 14 columns, UNIQUE(tenant_id,service), per-service metadata, 3 indexes, 4 RLS policies |
| `tenant_subscriptions` | ⚠️ In migrations.md only | Complete DDL in migrations.md migration 006, but NOT written to schema.md (aspect 3.5 was marked pending and never written into schema.md). **New aspect 8.1.1 needed.** |
| `admin_audit_log` | ✅ Fully documented | Referenced by RLS policies (default deny) |
| `stripe_webhook_events` | ❌ Missing entirely | Referenced in `frontend/edge-cases-integrations-billing.md` section 1.8 as idempotency store (`INSERT ON CONFLICT DO NOTHING`). Table never defined in schema. **New aspect 8.1.1 needed.** |

---

## 2. Frontend Queries vs Schema Coverage

### Dashboard (`frontend/dashboard.md`)

| Table Accessed | In New Schema | Notes |
|----------------|---------------|-------|
| `tenants` | ✅ | Plan, status columns used |
| `discord_connections` | ✅ | status, last_heartbeat_at used |
| `tenant_api_keys` | ✅ | provider, validated_at, status columns used |
| `tenant_service_connections` | ✅ | service, status columns used for icon grid |
| `tenant_subscriptions` | ⚠️ | Used; table defined in migrations.md only, not schema.md |
| `messages` | ⚠️ | **Existing bot table** — NOT a new SaaS table. Used by QuickStatsRow (message count) and RecentActivityFeed. Defined in `source/existing-schema.md` and existing ORM. Dashboard spec reads from this table cross-tenant. **Cross-reference note needed in schema.md.** |
| `tool_calls` | ⚠️ | **Existing bot table** — NOT a new SaaS table. Used by QuickStatsRow (tool use count). Defined in `source/existing-schema.md`. **Cross-reference note needed in schema.md.** |

**Resolution for `messages` and `tool_calls`:** These are existing bot schema tables documented in `source/existing-schema.md`. The new SaaS schema does NOT replace or duplicate them. The dashboard page reads them with tenant-scoped queries (WHERE tenant_id = $tenant_id). RLS on these tables must be extended to support the website user (not just the bot service role). **New aspect 8.1.2 needed.**

### Integrations Page (`frontend/integrations-page.md`)

| Table Accessed | In New Schema | Notes |
|----------------|---------------|-------|
| `tenant_service_connections` | ✅ | service, status, metadata columns |
| `tenants` | ✅ | plan column for connection limit check |

### Billing Page (`frontend/billing-page.md`)

| Table Accessed | In New Schema | Notes |
|----------------|---------------|-------|
| `tenants` | ✅ | stripe_customer_id, plan |
| `tenant_subscriptions` | ⚠️ | stripe_subscription_id, plan, status, current_period_end; defined in migrations.md only |
| `tenant_api_keys` | ✅ | provider (anthropic/openai), validated_at, status |

### Settings Page (`frontend/settings-page.md`)

| Table Accessed | In New Schema | Notes |
|----------------|---------------|-------|
| `tenants` | ✅ | name, status |
| `discord_connections` | ✅ | guild_id, bot_token (masked), status, effective_status |
| `tenant_members` | ✅ | role, user_id |
| `tenant_api_keys` | ✅ | provider, status |

### Admin Panel (`frontend/admin-panel.md`)

| Table Accessed | In New Schema | Notes |
|----------------|---------------|-------|
| `tenants` | ✅ | all columns |
| `tenant_members` | ✅ | role, user_id |
| `admin_audit_log` | ✅ | Referenced in RLS; defined in migrations.md (migration 006) |
| `discord_connections` | ✅ | status, last_heartbeat_at |
| `tenant_subscriptions` | ⚠️ | plan, status, current_period_end; defined in migrations.md only |

---

## 3. API Routes vs Schema Coverage

**CRITICAL GAP:** `api/routes.md` does not exist. Only `api/webhooks.md` exists. All page specs reference API routes (billing page alone has 5 API routes; Discord spec has 5 CRUD routes) but there is no consolidated specification document. **New aspect 8.1.3 needed.**

| Route Referenced | Source | In api/ dir |
|-----------------|--------|-------------|
| `/api/stripe/webhook` | api/webhooks.md | ✅ |
| `/api/stripe/checkout` | frontend/billing-page.md | ❌ |
| `/api/stripe/portal` | frontend/billing-page.md | ❌ |
| `/api/discord/validate-token` | integrations/discord.md | ❌ |
| `/api/discord/connections` (GET/POST) | integrations/discord.md | ❌ |
| `/api/discord/connections/[id]` (PATCH/DELETE) | integrations/discord.md | ❌ |
| `/api/discord/connections/[id]/reconnect` | integrations/discord.md | ❌ |
| `/api/auth/callback` | frontend/auth-pages.md | ❌ |
| `/api/integrations/oauth/[service]/start` | integrations/oauth-services.md | ❌ |
| `/api/integrations/oauth/[service]/callback` | integrations/oauth-services.md | ❌ |
| `/api/integrations/toggl/validate` | integrations/api-key-services.md | ❌ |
| `/api/integrations/[service]/disconnect` | integrations/api-key-services.md | ❌ |
| `/api/admin/tenants` (GET) | frontend/admin-panel.md | ❌ |
| `/api/admin/tenants/[id]` (GET) | frontend/admin-panel.md | ❌ |
| `/api/admin/tenants/[id]/suspend` (POST) | frontend/admin-panel.md | ❌ |
| `/api/admin/tenants/[id]/reactivate` (POST) | frontend/admin-panel.md | ❌ |
| `/api/admin/tenants/[id]/override-plan` (POST) | frontend/admin-panel.md | ❌ |
| `/api/admin/tenants/[id]/impersonate` (POST) | frontend/admin-panel.md | ❌ |
| `/api/admin/audit-log` (GET) | frontend/admin-panel.md | ❌ |

**Summary:** 18 API routes documented across various spec files but never consolidated into `api/routes.md`. A forward loop developer cannot build the API layer without this file.

---

## 4. Integration Storage vs Schema Coverage

### Stripe

| Storage Need | Column/Table | Status |
|-------------|-------------|--------|
| Stripe Customer ID | `tenants.stripe_customer_id` | ✅ |
| Stripe Subscription ID | `tenant_subscriptions.stripe_subscription_id` | ⚠️ in migrations.md only |
| Stripe Price ID | `tenant_subscriptions.stripe_price_id` | ⚠️ in migrations.md only |
| Subscription status | `tenant_subscriptions.status` | ⚠️ in migrations.md only |
| Current period end | `tenant_subscriptions.current_period_end` | ⚠️ in migrations.md only |
| Webhook event deduplication | `stripe_webhook_events.stripe_event_id` | ❌ table not defined anywhere |

### OAuth Services (GitHub, Google, Linear)

| Storage Need | Column/Table | Status |
|-------------|-------------|--------|
| Access token (encrypted) | `tenant_service_connections.vault_access_secret_id` → `vault.secrets` | ✅ |
| Refresh token (encrypted, for Google) | `tenant_service_connections.vault_refresh_secret_id` → `vault.secrets` | ✅ |
| Token expiry | `tenant_service_connections.token_expires_at` | ✅ |
| Service metadata (scopes, workspace, etc.) | `tenant_service_connections.metadata` (JSONB) | ✅ |
| Connection status | `tenant_service_connections.status` | ✅ |

### Discord

| Storage Need | Column/Table | Status |
|-------------|-------------|--------|
| Bot token (encrypted) | `discord_connections.vault_token_secret_id` → `vault.secrets` | ✅ |
| Guild ID | `discord_connections.guild_id` | ✅ |
| Connection status | `discord_connections.status` | ✅ |
| Error details | `discord_connections.error_message` | ✅ |
| Heartbeat | `discord_connections.last_heartbeat_at` | ✅ |

### API Key Services (Toggl)

| Storage Need | Column/Table | Status |
|-------------|-------------|--------|
| API key (encrypted) | `tenant_service_connections.vault_access_secret_id` → `vault.secrets` | ✅ |
| Workspace metadata | `tenant_service_connections.metadata` (JSONB) | ✅ |

---

## 5. Bot Read Queries vs Schema Coverage

### Bot Startup Query (from `multi-tenant/connection-manager.md`)

```sql
SELECT
    t.id, t.plan, t.status,
    dc.id, dc.guild_id, dc.vault_token_secret_id, dc.status,
    tak.provider, tak.vault_secret_id, tak.validated_at,
    tsc.service, tsc.vault_access_secret_id, tsc.vault_refresh_secret_id,
    tsc.metadata, tsc.status, tsc.token_expires_at
FROM tenants t
JOIN discord_connections dc ON dc.tenant_id = t.id AND dc.status != 'disconnected'
LEFT JOIN tenant_api_keys tak ON tak.tenant_id = t.id
LEFT JOIN tenant_service_connections tsc ON tsc.tenant_id = t.id AND tsc.status = 'active'
WHERE t.status != 'suspended'
```

| Table | In Schema | Notes |
|-------|-----------|-------|
| `tenants` | ✅ | All required columns present |
| `discord_connections` | ✅ | All required columns present |
| `tenant_api_keys` | ✅ | All required columns present |
| `tenant_service_connections` | ✅ | All required columns present |

### Bot Realtime Subscriptions (from `multi-tenant/realtime-contract.md`)

| Channel | Table Subscribed | In Schema | Notes |
|---------|-----------------|-----------|-------|
| `tenant-lifecycle` | `tenants` | ✅ | plan, status updates |
| `tenant-api-keys` | `tenant_api_keys` | ✅ | INSERT/UPDATE/DELETE events |
| `tenant-status` | `discord_connections` | ✅ | status, last_heartbeat_at |
| `tenant-service-connections` | `tenant_service_connections` | ✅ | status, metadata updates |

---

## 6. Edge Function vs Schema Coverage

| Edge Function | Tables Used | Status |
|--------------|-------------|--------|
| `store-tenant-api-key` | `tenant_api_keys`, Vault | ✅ |
| `upsert-service-connection` | `tenant_service_connections`, Vault | ✅ |
| `delete-service-connection` | `tenant_service_connections`, Vault | ✅ |
| `validate-oauth-tokens` (daily cron) | `tenant_service_connections` | ✅ |
| `reconcile-stripe-subscriptions` (6hr cron) | `tenant_subscriptions`, Stripe API | ⚠️ `tenant_subscriptions` in migrations.md only |

---

## 7. Summary of Gaps

### Critical (block forward loop developer)

| Gap | Priority | New Aspect |
|-----|----------|-----------|
| `tenant_subscriptions` table missing from schema.md | P0 | 8.1.1 |
| `stripe_webhook_events` idempotency table undefined | P0 | 8.1.1 |
| `api/routes.md` missing — 18+ routes undocumented | P0 | 8.1.3 |
| `api/auth.md` missing | P1 | 8.1.4 |
| `messages`/`tool_calls` existing tables need cross-reference note + RLS coverage for website reads | P1 | 8.1.2 |

### Important (spec incomplete but content exists elsewhere)

| Gap | Content Location | New Aspect |
|-----|-----------------|-----------|
| `multi-tenant/adaptation-plan.md` missing | Covered piecemeal in connection-manager, tenant-scoping, byok-key-routing, tenant-isolation | 8.1.5 |
| `api/rate-limiting.md` missing | Mentioned in edge-cases-auth-session section 8 | 8.1.6 |
| `database/triggers.md` missing as dedicated file | Trigger SQL embedded in migrations.md | 8.1.7 |
| `database/indexes.md` missing as dedicated file | Index SQL embedded in schema.md | 8.1.8 |
| `database/retention.md` missing | Covered in privacy-policy.md section 7 | 8.1.9 |

### Minor (content covered elsewhere, organizational only)

| Gap | Content Location |
|-----|-----------------|
| `ui/design-system.md` | Covered by `source/brand-guidelines.md` + `frontend/component-library.md` |
| `ui/component-specs.md` | Covered by `frontend/component-library.md` |
| `ui/responsive.md` | Covered by `frontend/responsive-behavior.md` |
| `seo-and-growth/landing-page.md` | Covered by `frontend/landing-page.md` + `seo-and-growth/content-strategy.md` |
| `legal/disclaimers.md` | Covered by `legal/terms-of-service.md` sections 15-16 |

---

## 8. Reconciliation Verdict

The spec is **NOT fully converged** due to the following blocking gaps:
1. `tenant_subscriptions` not in schema.md
2. `stripe_webhook_events` table undefined
3. `api/routes.md` missing (18+ undocumented routes)
4. `api/auth.md` missing
5. RLS coverage for `messages`/`tool_calls` when read by website user context

Nine new frontier aspects (8.1.1–8.1.9) have been added to cover all identified gaps.
