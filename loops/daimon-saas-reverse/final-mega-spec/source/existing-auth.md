# Existing Auth Model — Decision Orchestrator

**Source:** `supabase/migrations/` (schema) + `src_v2/mcp/context.py` + `src_v2/core/credential_platform.py` + design spec
**Extracted:** 2026-03-13
**Note:** `apps/bot/src_v2/` is not present in this CI environment. Auth details are reconstructed from the extracted schema (`existing-schema.md`), tool catalog (`existing-tools.md`), and design spec (`2026-03-12-daimon-saas-design.md`).

---

## 1. Auth Architecture Overview

Decision Orchestrator uses a **two-layer auth model**:

1. **Website / Dashboard layer** — Supabase Auth (email/password) for human users accessing the self-serve portal.
2. **Bot layer** — Service role key for all database access. Per-user credential lookup from `user_credentials` + Vault.

The two layers share the same Supabase project. The website manages credentials; the bot reads them. No direct API between them.

---

## 2. Database Tables (Auth-Related)

### Table: `user_identity_discord`

Maps a Supabase Auth user to their Discord account. One-to-one.

**Source migration:** `20260211_create_user_auth_tables.sql`

| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PRIMARY KEY |
| user_id | UUID | NOT NULL | — | UNIQUE, REFERENCES auth.users(id) ON DELETE CASCADE |
| discord_id | TEXT | NOT NULL | — | UNIQUE |
| discord_username | TEXT | NULL | — | — |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | — |

**Purpose:** The bot receives a Discord user ID with each message. It looks up this table to resolve the Supabase Auth `user_id`. If no row exists, the user is unauthenticated from Supabase's perspective (can still use tools that don't require credentials, but `user_context.is_authenticated == False`).

**RLS:** ENABLED.

```sql
-- Users can read their own identity
CREATE POLICY "Users can read own identity"
    ON public.user_identity_discord FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own identity
CREATE POLICY "Users can insert own identity"
    ON public.user_identity_discord FOR INSERT
    WITH CHECK (auth.uid() = user_id);
```

**Bot access:** Service role key — bypasses all RLS.

---

### Table: `user_credentials`

Per-user platform credentials. Actual secret values stored in Supabase Vault; this table holds references.

**Source migration:** `20260211_create_user_auth_tables.sql`

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

**`platform` values observed (from design spec and schema notes):**

| Platform Value | Credential Type | Used By |
|---------------|----------------|---------|
| `'anthropic'` | API key | Deprecated in multi-tenant (moved to `tenant_api_keys`) |
| `'openai'` | API key | Deprecated in multi-tenant (moved to `tenant_api_keys`) |
| `'github'` | OAuth access token | `github_run_gh` tool — `requires_credential: CredentialPlatform.GITHUB` |
| `'toggl'` | API token | All `toggl_*` tools — `requires_credential: CredentialPlatform.TOGGL` |
| `'linear'` | API key | Linear tools (though currently Linear uses system-level key in ToolContext) |
| `'google'` | OAuth token | Future use |

**`metadata` field examples:**

| Platform | Metadata Shape |
|---------|---------------|
| TOGGL | `{"toggl_workspace_role": "admin" | "member", "toggl_workspace_id": "12345"}` |
| GITHUB | `{}` |
| LINEAR | `{}` |

**RLS:** ENABLED.

```sql
-- Users can read own credentials
CREATE POLICY "Users can read own credentials"
    ON public.user_credentials FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert own credentials
CREATE POLICY "Users can insert own credentials"
    ON public.user_credentials FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update own credentials
CREATE POLICY "Users can update own credentials"
    ON public.user_credentials FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete own credentials
CREATE POLICY "Users can delete own credentials"
    ON public.user_credentials FOR DELETE
    USING (auth.uid() = user_id);
```

**Bot access:** Service role key — bypasses RLS. Bot reads `user_credentials`, then calls Vault to decrypt the value at `vault_secret_id`.

---

### Table: `user_profiles`

Decision Orchestrator user properties. Only used for `is_admin` flag. One row per user.

**Source migration:** `20260217081322_add_admin_impersonation.sql`

| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| user_id | UUID | NOT NULL | — | PRIMARY KEY |
| is_admin | BOOLEAN | NOT NULL | false | — |
| created_at | TIMESTAMPTZ | NULL | NOW() | — |

**Note:** No explicit `REFERENCES auth.users` in the migration DDL, but logically references auth.users.

**RLS:** NOT ENABLED. Admin-only access via service role.

**How admin status is checked in the website:**
The Next.js `/admin` route group (middleware) reads `user_profiles.is_admin` after user authentication. If `false`, redirects to `/dashboard`. Checked on every request to `/admin/**`.

---

### Table: `admin_impersonation_sessions`

Tracks currently active admin impersonation sessions.

**Source migration:** `20260217081322_add_admin_impersonation.sql`

| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PRIMARY KEY |
| admin_user_id | UUID | NOT NULL | — | UNIQUE (one active session per admin) |
| target_user_id | UUID | NOT NULL | — | — |
| created_at | TIMESTAMPTZ | NULL | NOW() | — |

**UNIQUE constraint:** `admin_user_id` is UNIQUE, enforcing that each admin can only impersonate one user at a time. Starting a new impersonation must first delete the previous row.

**RLS:** NOT ENABLED.

**Impersonation flow (current single-tenant behavior):**
1. Admin navigates to `/admin/tenant/[id]`
2. Clicks "Impersonate" — creates a row in `admin_impersonation_sessions`
3. System generates a Supabase Auth impersonation session (admin API) scoped to `target_user_id`
4. Admin sees the dashboard as that user
5. All actions during impersonation are logged to `admin_audit_log` (new table for multi-tenant SaaS)
6. Impersonation is read-only from admin's perspective per design spec
7. "End Impersonation" deletes the row and invalidates the scoped session

---

## 3. Bot-Side Auth Components

### 3.1 ToolContext (per-bot-instance, from bootstrap config)

`ToolContext` is constructed once at bot startup from environment variables / config. In the current single-tenant system, there is one `ToolContext` for the whole process.

```python
# From src_v2/bootstrap/config.py (reconstructed from tools catalog)
@dataclass(frozen=True)
class ToolContext:
    discord_token: str                    # Bot token for Discord API
    fly_api_token: str                    # Fly.io Machines API token
    onyx_api_key: str                     # Onyx RAG API key
    anthropic_api_key: str                # Claude API key (forwarded to Fly sessions)
    supabase_service_role_key: str        # Supabase service role — bypasses RLS
    linkedin_community_token: str         # LinkedIn Community Management API (App 2)
    linkedin_ads_token: str               # LinkedIn Advertising API (App 1)
    linear_api_key: str = ""              # Linear GraphQL API key (optional)
    dub_api_key: str = ""                 # Dub.co API key (optional)
    # Additional workspace-level fields:
    discord_guild_id: str = ""            # Discord server ID
    fly_org_slug: str = ""                # Fly.io org slug
    toggl_workspace_id: str = ""          # Toggl workspace ID (system-level)
    toggl_organization_id: str = ""       # Toggl organization ID
    linear_team_id: str = ""              # Default Linear team (optional)
    onyx_base_url: str = ""              # Onyx instance URL
```

**Multi-tenant implication:** In the SaaS version, `ToolContext` must be created **per tenant** at bot startup, one per active `discord_connections` row. The `anthropic_api_key` and `discord_token` come from tenant-specific `tenant_api_keys` and `discord_connections` tables respectively. See [multi-tenant/byok-key-routing.md](../multi-tenant/byok-key-routing.md).

---

### 3.2 UserContext (per-request, per-Discord user)

Constructed per message in the Discord message handler. Populated by querying `user_identity_discord` and `user_credentials`.

```python
# From src_v2/mcp/context.py
@dataclass(frozen=True)
class UserContext:
    user_id: uuid.UUID | None                              # Supabase Auth user ID (None if not linked)
    discord_id: str                                        # Discord user ID (always available from message)
    credentials: dict[CredentialPlatform, str]             # Platform → decrypted token from Vault
    credential_metadata: dict[CredentialPlatform, dict]    # Platform → metadata dict (e.g., toggl_workspace_role)
    conversation_id: str = ""                              # Discord thread ID or channel ID
    impersonating_user_id: uuid.UUID | None = None         # Set during admin impersonation

    @property
    def is_authenticated(self) -> bool:
        return self.user_id is not None
```

**UserContext construction flow (inferred from schema + tools):**

```
Message received from Discord
  ↓
Extract discord_id from message.author.id
  ↓
Query: SELECT user_id FROM user_identity_discord WHERE discord_id = :discord_id
  ↓
If row found → user_id = row.user_id, is_authenticated = True
If no row   → user_id = None, is_authenticated = False
  ↓
If user_id is not None:
  Query: SELECT * FROM user_credentials WHERE user_id = :user_id
  For each credential row:
    Decrypt via: SELECT decrypted_secret FROM vault.decrypted_secrets WHERE id = :vault_secret_id
    Build: credentials[CredentialPlatform(row.platform)] = decrypted_value
    Build: credential_metadata[CredentialPlatform(row.platform)] = row.metadata
  ↓
Construct UserContext(
    user_id=user_id,
    discord_id=discord_id,
    credentials=credentials,
    credential_metadata=credential_metadata,
    conversation_id=str(message.channel.id)
)
```

---

### 3.3 DatabaseContext (optional, per-handler)

```python
# From src_v2/mcp/context.py
@dataclass(frozen=True)
class DatabaseContext:
    session_factory: Callable[[], Session]    # SQLAlchemy async session factory
```

Passed only to tools that need direct database access (Bluedot tools, Fly template tools, Decision Hub skill tools). Not needed for tools that use REST APIs.

---

### 3.4 CredentialPlatform Enum

From `src_v2/core/credential_platform.py`:

```python
class CredentialPlatform(StrEnum):
    GITHUB = "github"
    TOGGL = "toggl"
    # Additional values may exist (LINEAR, GOOGLE, etc.)
    # but only GITHUB and TOGGL are used as requires_credential gates
```

**How the credential gate works in `ToolRegistry.call_tool()`:**

```python
async def call_tool(self, name: str, params: dict, user_context: UserContext) -> str:
    tool_def = self._registry[name]

    # 1. Credential gate
    if tool_def.requires_credential is not None:
        if tool_def.requires_credential not in user_context.credentials:
            raise ToolError(
                f"This tool requires a connected {tool_def.requires_credential} account. "
                f"Run /connect {tool_def.requires_credential} to link your account."
            )

    # 2. Scope gate (Toggl workspace admin)
    if Scope.TOGGL_WORKSPACE_ADMIN in tool_def.tags:
        metadata = user_context.credential_metadata.get(CredentialPlatform.TOGGL, {})
        if metadata.get("toggl_workspace_role") != "admin":
            raise ToolError(
                "This tool requires workspace admin permissions in Toggl."
            )

    # 3. Dispatch to handler
    return await tool_def.handler(params, tool_context, user_context, db_context)
```

---

### 3.5 Vault Integration (Credential Decryption)

Supabase Vault (`vault.secrets` table) stores the actual credential values. `user_credentials.vault_secret_id` is a foreign key to `vault.secrets(id)`.

**Decryption pattern used by bot:**

```sql
-- Read decrypted value
SELECT decrypted_secret
FROM vault.decrypted_secrets
WHERE id = :vault_secret_id;
```

**Encryption on write (when user connects a service via the website):**

```sql
-- Insert encrypted secret and get vault_secret_id
SELECT vault.create_secret(
    :plain_text_secret,     -- the actual API key or token
    :secret_name,           -- e.g., 'user_credentials:user_id:platform'
    :description            -- e.g., 'GitHub OAuth token for user X'
) AS vault_secret_id;

-- Then insert reference into user_credentials
INSERT INTO user_credentials (user_id, platform, vault_secret_id, metadata)
VALUES (:user_id, :platform, :vault_secret_id, :metadata);
```

**Key constraint:** The bot **never stores decrypted values in memory longer than needed for the current tool invocation**. Decryption happens per-request in `UserContext` construction.

---

## 4. Bot Access Model Summary

| Resource | Access Method | Notes |
|---------|--------------|-------|
| `user_identity_discord` | Service role (bypasses RLS) | Bot reads; website also reads via anon key with RLS |
| `user_credentials` | Service role (bypasses RLS) | Bot reads vault_secret_id then decrypts |
| `vault.decrypted_secrets` | Service role required | Only accessible to service role, not anon/user role |
| `user_profiles` | Service role | No RLS, admin only |
| `admin_impersonation_sessions` | Service role | No RLS, admin only |
| All other bot tables | Service role | discord_channel_mapping, session_templates, etc. |

---

## 5. Website Auth Model (New — Supabase Auth + Next.js)

### 5.1 Auth Provider

**Supabase Auth** with email/password strategy. No social OAuth for platform login. No magic links at launch (may be added later).

**Package:** `@supabase/ssr` (Next.js App Router SSR integration)

### 5.2 Auth Flows

#### Sign Up Flow
```
POST /auth/v1/signup (Supabase Auth API via SDK)
  ↓
Creates auth.users row
  ↓
Website creates tenant row: INSERT INTO tenants (name, owner_id, plan, status)
  ↓
Website creates tenant_members row: INSERT INTO tenant_members (tenant_id, user_id, role='owner')
  ↓
Redirect to /dashboard (onboarding checklist visible)
```

#### Log In Flow
```
POST /auth/v1/token?grant_type=password (Supabase Auth API via SDK)
  ↓
Returns access_token + refresh_token
  ↓
@supabase/ssr stores tokens in secure httpOnly cookies
  ↓
Next.js middleware validates session on every request
  ↓
Redirect to /dashboard
```

#### Password Reset Flow
```
User submits email on /reset-password
  ↓
POST /auth/v1/recover — Supabase sends reset email
  ↓
User clicks link → redirected to /reset-password?token=...&type=recovery
  ↓
User submits new password
  ↓
POST /auth/v1/user — Supabase updates password
  ↓
Redirect to /login
```

#### Sign Out Flow
```
User clicks Sign Out
  ↓
DELETE /auth/v1/logout (Supabase Auth API)
  ↓
@supabase/ssr clears cookies
  ↓
Redirect to /login
```

### 5.3 Session Management

**Mechanism:** `@supabase/ssr` package creates a Supabase client that reads/writes session cookies automatically.

**Cookie names (Supabase default):**
- `sb-[project-ref]-auth-token` — contains JWT access token
- `sb-[project-ref]-auth-token-code-verifier` — for PKCE flows (used by SSR)

**JWT expiry:** Default 3600 seconds (1 hour). Automatically refreshed by `@supabase/ssr` when `refresh_token` cookie is present.

**Middleware file:** `middleware.ts` at Next.js root. Runs on all requests matched by `matcher`.

```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req, res })

    // Refresh session if expired
    const { data: { session } } = await supabase.auth.getSession()

    // Protect /dashboard/* routes
    if (req.nextUrl.pathname.startsWith('/dashboard')) {
        if (!session) {
            return NextResponse.redirect(new URL('/login', req.url))
        }
    }

    // Protect /admin/* routes — check is_admin flag
    if (req.nextUrl.pathname.startsWith('/admin')) {
        if (!session) {
            return NextResponse.redirect(new URL('/login', req.url))
        }
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('is_admin')
            .eq('user_id', session.user.id)
            .single()
        if (!profile?.is_admin) {
            return NextResponse.redirect(new URL('/dashboard', req.url))
        }
    }

    return res
}

export const config = {
    matcher: ['/dashboard/:path*', '/admin/:path*'],
}
```

### 5.4 Tenant Resolution

After authentication, the tenant context is resolved:

```typescript
// Server Component or Server Action
const supabase = createServerComponentClient({ cookies })
const { data: { user } } = await supabase.auth.getUser()

// Get tenant membership
const { data: membership } = await supabase
    .from('tenant_members')
    .select('tenant_id, role, tenants(*)')
    .eq('user_id', user.id)
    .single()  // At launch: one tenant per user

const tenant = membership.tenants
```

**At launch:** One tenant per user (owner only). `tenant_members` always returns exactly one row per user. The `.single()` call is safe.

**Future:** Multi-tenant membership (team invites) will require a tenant selector UI and storing the active tenant in a cookie.

### 5.5 Admin Auth Gate

Admin status is checked in middleware (see 5.3 above) AND in each admin server component for defense in depth:

```typescript
// /admin/page.tsx (Server Component)
const { data: profile } = await supabase
    .from('user_profiles')
    .select('is_admin')
    .eq('user_id', user.id)
    .single()

if (!profile?.is_admin) {
    redirect('/dashboard')
}
```

### 5.6 Auth Error Scenarios

| Scenario | User Experience |
|---------|----------------|
| Invalid email/password | Error: "Invalid email or password. Please try again." |
| Email not confirmed | Error: "Please verify your email before signing in." |
| Account suspended | Error: "Your account has been suspended. Contact support at support@daimon.ai." |
| Session expired mid-page | Redirect to /login with `?next=/current-path` |
| Token refresh failed | Redirect to /login with session cleared |
| Rate limited (5 attempts) | Error: "Too many login attempts. Try again in 15 minutes." |
| Password reset token expired | Error: "This reset link has expired. Request a new one." |

---

## 6. Credential Lifecycle in Multi-Tenant SaaS

In the multi-tenant model, the `user_credentials` table is supplemented by tenant-scoped tables. The auth model evolves:

| Credential Type | Old table (single-tenant) | New table (multi-tenant) |
|----------------|--------------------------|-------------------------|
| Anthropic API key | `user_credentials` platform='anthropic' | `tenant_api_keys` provider='anthropic' |
| OpenAI API key | `user_credentials` platform='openai' | `tenant_api_keys` provider='openai' |
| Discord bot token | Not in user_credentials (was in env) | `discord_connections.bot_token_encrypted` |
| GitHub OAuth token | `user_credentials` platform='github' | `tenant_service_connections` service='github' |
| Toggl API token | `user_credentials` platform='toggl' | `tenant_service_connections` service='toggl' |
| Linear API key | `user_credentials` platform='linear' | `tenant_service_connections` service='linear' |
| Google OAuth token | `user_credentials` platform='google' | `tenant_service_connections` service='google' |

**Key change:** Per-user credentials (`user_credentials`) become per-tenant credentials (`tenant_service_connections`). Any Discord user in the guild uses the tenant's shared service credentials. The `user_credentials` table may remain for backward compatibility with existing single-tenant users.

**Vault pattern preserved:** All new tables (`tenant_api_keys`, `tenant_service_connections`, `discord_connections`) use the same Vault pattern — store a `vault_secret_id` reference, never the plaintext value.

See [database/vault-encryption.md](../database/vault-encryption.md) for full Vault setup and patterns.

---

## 7. Auth-Related API Routes (New Website)

| Route | Method | Auth Required | Purpose |
|-------|--------|--------------|---------|
| `/api/auth/callback` | GET | No | Supabase Auth redirect callback (PKCE) |
| `/api/auth/sign-out` | POST | Yes | Clear session, redirect to /login |
| `/api/integrations/github/callback` | GET | Yes | GitHub OAuth code exchange |
| `/api/integrations/google/callback` | GET | Yes | Google OAuth code exchange |
| `/api/integrations/linear/callback` | GET | Yes | Linear OAuth code exchange |
| `/api/discord/validate-token` | POST | Yes | Validate Discord bot token format + API call |
| `/api/keys/validate-anthropic` | POST | Yes | Validate Anthropic key with test API call |
| `/api/keys/validate-openai` | POST | Yes | Validate OpenAI key with test API call |

See [api/auth.md](../api/auth.md) for complete request/response shapes.

---

## 8. Security Properties

| Property | Mechanism |
|---------|----------|
| Passwords | Supabase Auth bcrypt hashing |
| Session tokens | JWT signed by Supabase, stored in httpOnly cookies |
| Credential values | Supabase Vault (pgcrypto AES-256) |
| CSRF protection | OAuth `state` parameter stored in short-lived Supabase row or encrypted cookie |
| Bot token masking | API responses never return full tokens — masked as `Bot {first4}...{last4}` |
| API key masking | API responses return `sk-ant-...{last4}` — never full key |
| Admin access | `user_profiles.is_admin` gate + middleware + component-level checks |
| Impersonation | Logged to `admin_audit_log` with timestamp, admin_user_id, target tenant, action |
| Service role key | Only used by bot (Fly.io) and admin Edge Functions — never exposed to browser |
| Rate limiting | 5 signup attempts per IP per hour, 10 key validations per tenant per minute |
