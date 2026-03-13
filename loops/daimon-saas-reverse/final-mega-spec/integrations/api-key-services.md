# API Key Services — Integration Contracts

**Aspect:** 5.6 — API key services (Toggl, etc.) — validation endpoints, key format, error handling per service
**Created:** 2026-03-13
**Scope:** Covers every service that uses API key (non-OAuth) authentication in the Daimon SaaS platform at launch.

---

## Overview

At launch, **one service** uses API key authentication: **Toggl**. GitHub, Google, and Linear all use OAuth 2.0 (covered in `oauth-services.md`).

API key services differ from OAuth services in the following ways:

| Property | OAuth Services | API Key Services |
|----------|---------------|-----------------|
| Auth mechanism | OAuth 2.0 Authorization Code Grant | Static API key / personal access token |
| User flow | Redirect to provider, authorize, redirect back | Paste key into modal, submit |
| Token expiry | Access tokens expire (Google: 1 hour; GitHub/Linear: no expiry) | API keys do not expire (until manually revoked in provider UI) |
| Refresh tokens | Some services issue refresh tokens (Google) | None — API keys don't refresh |
| Revocation | Revoke via OAuth app in provider settings | Revoke via provider profile page |
| `token_expires_at` column | Non-null for Google | Always NULL |
| `refresh_vault_secret_id` column | Non-null for Google | Always NULL |
| DB constraint | `auth_type = 'oauth'` | `auth_type = 'api_key'` |

---

## Service: Toggl

### Overview

Toggl Track is a time tracking SaaS. The Daimon bot uses it to create/read/update time entries, manage projects, tasks, clients, and generate reports.

**Auth type:** API key (HTTP Basic Auth with the key as the username and the literal string `"api_token"` as the password).

**User story:** The tenant owner navigates to `/dashboard/integrations`, clicks "Connect Toggl", pastes their Toggl API token into the modal, and clicks "Save & Connect". The server validates the key against Toggl, stores it encrypted in Supabase Vault, and the bot gains access to 34 Toggl tools.

**Who connects:** Tenant-level connection. The owner or admin connects Toggl once for the whole workspace. All bot users in the Discord server can then use Toggl tools (using the tenant-level credential as fallback, unless the Discord user has a personal Toggl credential via `/connect toggl`).

---

### Key Format

**Toggl API Token characteristics:**

| Property | Value |
|----------|-------|
| Length | Exactly 32 characters |
| Character set | Lowercase hexadecimal (`[a-f0-9]`) |
| Example | `1971800d4d82861d8f2c1651fea4d212` |
| Format regex | `/^[a-f0-9]{32}$/` |
| Where to find it | Toggl Track web app → Profile page → scroll to "API Token" section → click "Click to reveal" → copy |
| URL to find it | `https://track.toggl.com/profile` |
| Notes | Tokens are UUIDs represented as 32-character hex strings with hyphens removed. |

**Validation notes:**

1. The regex `[a-f0-9]` is stricter than `[a-z0-9]`. Toggl tokens are hex strings (digits 0-9 and letters a-f only). The integrations page spec uses `[a-z0-9]` as a wider safety net — if Toggl ever issues tokens with g-z characters, the `[a-z0-9]` pattern won't reject them. The canonical authoritative format is hex, but validate with `[a-z0-9]` on the frontend to avoid false negatives.

2. Server-side validation: after passing the format check, always make a live API call to Toggl. The format check alone is not sufficient — a 32-char hex string that was typed incorrectly will pass format validation but fail the live API call.

---

### Validation Endpoint

**Toggl API used for validation:**

```
GET https://api.track.toggl.com/api/v9/me
```

**Authentication:**

```
Authorization: Basic base64("{api_key}:api_token")
```

Where `api_token` is the literal string used as the password (this is how Toggl's Basic Auth works — the API key IS the username; the password is always the literal string `"api_token"`).

**Equivalent curl:**

```bash
curl -u "{api_token}:api_token" https://api.track.toggl.com/api/v9/me
```

**Success response (HTTP 200):**

```json
{
  "id": 9876543,
  "email": "user@example.com",
  "fullname": "Jane Doe",
  "timezone": "America/New_York",
  "default_workspace_id": 1234567,
  "beginning_of_week": 1,
  "image_url": "https://assets.track.toggl.com/images/profile.png",
  "created_at": "2022-03-01T12:00:00+00:00",
  "updated_at": "2026-01-15T09:30:00+00:00"
}
```

**Fields used from validation response:**

| Field | Type | Used For |
|-------|------|----------|
| `id` | integer | Stored in `metadata.toggl_user_id`; used for identity tracking |
| `email` | string | Stored in `metadata.toggl_email`; displayed in UI as "Connected as user@example.com" |
| `fullname` | string | Stored in `metadata.toggl_full_name`; displayed in UI as display name |
| `default_workspace_id` | integer | Seed value for workspace lookup; stored in `metadata.toggl_workspace_id` |

**Error responses:**

| HTTP Status | Meaning | Server Action |
|-------------|---------|---------------|
| 200 | Valid API key | Proceed with workspace lookup, then save connection |
| 403 | Invalid API key (wrong token) | Return `{ valid: false, error: 'Invalid API token.' }` to browser |
| 401 | Authentication failed (malformed header) | Return `{ valid: false, error: 'Invalid API token.' }` to browser |
| 429 | Rate limited by Toggl | Return `{ valid: false, error: 'Toggl rate limit exceeded. Please wait a moment and try again.' }` |
| 500, 502, 503 | Toggl service error | Return `{ valid: false, error: 'Could not reach Toggl to validate. Please try again.' }` |
| Network timeout | DNS/connection failure | Return `{ valid: false, error: 'Could not reach Toggl to validate. Please try again.' }` |

---

### Workspace Lookup (Post-Validation)

After successfully validating the API key via `GET /me`, the server performs an additional workspace lookup to populate the workspace metadata fields. This lookup is **not** required for the key to be saved — if it fails, the connection is still created with partial metadata.

**Step 1 — Get workspace details:**

```
GET https://api.track.toggl.com/api/v9/me/all
```

This endpoint returns the full user profile including workspaces and organizations.

**Success response (relevant fields):**

```json
{
  "id": 9876543,
  "email": "user@example.com",
  "fullname": "Jane Doe",
  "default_workspace_id": 1234567,
  "workspaces": [
    {
      "id": 1234567,
      "name": "My Workspace",
      "organization_id": 2345678,
      "premium": true,
      "role": "admin"
    }
  ],
  "organizations": [
    {
      "id": 2345678,
      "name": "My Organization"
    }
  ]
}
```

**Fields used from `/me/all` response:**

| Field path | Type | Stored As |
|------------|------|-----------|
| `.workspaces[default_workspace_id].id` | integer | `metadata.toggl_workspace_id` |
| `.workspaces[default_workspace_id].name` | string | `metadata.toggl_workspace_name` |
| `.workspaces[default_workspace_id].organization_id` | integer | `metadata.toggl_organization_id` |
| `.workspaces[default_workspace_id].role` | string | `metadata.toggl_workspace_role` (either `"admin"` or `"member"`) |
| `.organizations[matching].name` | string | `metadata.toggl_organization_name` |

**Finding the default workspace:** Filter `.workspaces` where `id == default_workspace_id` from the `/me` response. If no workspace matches, use the first workspace in the list. If the workspaces array is empty, log a warning and leave workspace fields as `null`.

**Finding the organization:** Filter `.organizations` where `id == organization_id` from the default workspace. If no match, leave `toggl_organization_name` as `null`.

**If `/me/all` fails (non-200 response or network error):**

Log a warning but continue saving the connection with partial metadata:

```json
{
  "toggl_user_id": 9876543,
  "toggl_email": "user@example.com",
  "toggl_full_name": "Jane Doe",
  "toggl_workspace_id": 1234567,
  "toggl_workspace_name": null,
  "toggl_organization_id": null,
  "toggl_organization_name": null,
  "toggl_workspace_role": null
}
```

The workspace fields being null means the bot will not override `ToolContext.toggl_workspace_id` with a tenant-specific value and will fall back to the platform-level defaults. The bot can still use Toggl tools — it just uses the platform Toggl workspace rather than the tenant's workspace.

**Alternative: if `/me/all` is unavailable:** Use `GET /me` (already called during validation) which returns `default_workspace_id`, then separately query:

```
GET https://api.track.toggl.com/api/v9/workspaces/{workspace_id}
```

To get the workspace name and organization ID.

---

### Complete Metadata Schema

The `tenant_service_connections.metadata` JSONB column stores all Toggl-specific non-secret metadata:

```typescript
interface TogglServiceConnectionMetadata {
  toggl_user_id: number;                // integer — Toggl user ID
  toggl_email: string;                  // string — Toggl account email
  toggl_full_name: string;              // string — Toggl display name
  toggl_workspace_id: number | null;    // integer — default workspace ID
  toggl_workspace_name: string | null;  // string — workspace display name
  toggl_organization_id: number | null; // integer — organization ID
  toggl_organization_name: string | null; // string — organization name
  toggl_workspace_role: 'admin' | 'member' | null; // string — role in workspace
}
```

**Example populated metadata:**

```json
{
  "toggl_user_id": 9876543,
  "toggl_email": "user@example.com",
  "toggl_full_name": "Jane Doe",
  "toggl_workspace_id": 1234567,
  "toggl_workspace_name": "Acme Corp",
  "toggl_organization_id": 2345678,
  "toggl_organization_name": "Acme Organization",
  "toggl_workspace_role": "admin"
}
```

---

### Storage: `tenant_service_connections` Row

When a Toggl API key is successfully validated, the following row is created (or updated via UPSERT):

```sql
-- INSERT or UPDATE ON CONFLICT (tenant_id, service)
INSERT INTO public.tenant_service_connections (
    tenant_id,
    service,
    auth_type,
    vault_secret_id,
    refresh_vault_secret_id,
    token_expires_at,
    scopes,
    metadata,
    status,
    error_message,
    connected_by_user_id,
    connected_at
) VALUES (
    :tenant_id,
    'toggl',
    'api_key',
    :new_vault_secret_id,   -- UUID of newly created vault.secrets row
    NULL,                    -- no refresh token for API keys
    NULL,                    -- API keys don't expire
    '{}',                    -- no OAuth scopes
    :metadata_json,
    'connected',
    NULL,
    :connected_by_user_id,
    NOW()
)
ON CONFLICT (tenant_id, service)
DO UPDATE SET
    vault_secret_id = EXCLUDED.vault_secret_id,
    metadata = EXCLUDED.metadata,
    status = 'connected',
    error_message = NULL,
    connected_by_user_id = EXCLUDED.connected_by_user_id,
    connected_at = NOW(),
    updated_at = NOW();
```

**UPSERT behavior:** If the tenant already has a Toggl connection and re-connects (e.g., to update their API key), the existing row is updated in place. The old `vault_secret_id` must be captured BEFORE the UPSERT and deleted from `vault.secrets` AFTER the UPSERT commits. See `database/vault-encryption.md` for Vault secret lifecycle.

---

### Storage: Supabase Vault Secret

The API key itself is stored as an encrypted secret in Supabase Vault (never in a plaintext column).

**Vault secret creation:**

```sql
-- Called in Edge Function BEFORE inserting/upserting the tenant_service_connections row
SELECT vault.create_secret(
    :api_key_plaintext,
    'toggl_' || :tenant_id::text,
    'Toggl API key for tenant ' || :tenant_id::text
) AS vault_secret_id;
```

**Returns:** A UUID (`vault_secret_id`) that is stored in `tenant_service_connections.vault_secret_id`.

**Vault secret name format:** `toggl_{tenant_id}` — e.g., `toggl_b2c3d4e5-f6a7-8901-bcde-f12345678901`

If a secret with this name already exists (tenant is replacing their Toggl key):
1. Call `vault.create_secret()` with the new key → get `new_vault_secret_id`
2. Capture old `vault_secret_id` from existing `tenant_service_connections` row
3. UPSERT row with `new_vault_secret_id`
4. Call `vault.delete_secret(old_vault_secret_id)` to remove the old encrypted key

**Vault secret retrieval (by bot):**

```sql
-- Bot reads Toggl API key at startup and after Realtime hot-reload events
SELECT decrypted_secret
FROM vault.decrypted_secrets
WHERE id = :vault_secret_id;
```

Returns the plaintext API key string. The bot passes this to all Toggl tool calls as the `api_token` parameter.

---

### upsert-service-connection Edge Function

The Toggl API key save and all OAuth token saves go through the **same** Edge Function: `supabase/functions/upsert-service-connection/index.ts`. This function runs with the Supabase service role key (which has Vault write access).

**Function invocation for Toggl (from `/api/integrations/api-key/validate/route.ts`):**

```typescript
const upsertRes = await fetch(
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/upsert-service-connection`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({
      tenant_id: membership.tenant_id,
      service: 'toggl',
      auth_type: 'api_key',
      access_token: api_key,          // The Toggl API token plaintext
      refresh_token: null,
      token_expires_at: null,
      scopes: [],
      metadata: {
        toggl_user_id: togglUser.id,
        toggl_email: togglUser.email,
        toggl_full_name: togglUser.fullname,
        toggl_workspace_id: workspaceData?.id ?? togglUser.default_workspace_id,
        toggl_workspace_name: workspaceData?.name ?? null,
        toggl_organization_id: workspaceData?.organization_id ?? null,
        toggl_organization_name: orgData?.name ?? null,
        toggl_workspace_role: workspaceData?.role ?? null,
      },
      connected_by_user_id: session.user.id,
    }),
  }
);
```

**Edge Function logic (abbreviated):**

```typescript
// supabase/functions/upsert-service-connection/index.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

Deno.serve(async (req) => {
  const {
    tenant_id, service, auth_type,
    access_token, refresh_token, token_expires_at,
    scopes, metadata, connected_by_user_id
  } = await req.json()

  // Check for existing connection to capture old vault_secret_id
  const { data: existing } = await supabase
    .from('tenant_service_connections')
    .select('vault_secret_id, refresh_vault_secret_id')
    .eq('tenant_id', tenant_id)
    .eq('service', service)
    .single()

  const oldVaultSecretId = existing?.vault_secret_id ?? null
  const oldRefreshVaultSecretId = existing?.refresh_vault_secret_id ?? null

  // Create new Vault secret for access token
  const { data: newSecret } = await supabase.rpc('vault_create_secret', {
    secret: access_token,
    name: `${service}_${tenant_id}`,
    description: `${service} access token for tenant ${tenant_id}`,
  })
  const newVaultSecretId = newSecret

  // Create new Vault secret for refresh token (if applicable)
  let newRefreshVaultSecretId = null
  if (refresh_token) {
    const { data: refreshSecret } = await supabase.rpc('vault_create_secret', {
      secret: refresh_token,
      name: `${service}_refresh_${tenant_id}`,
      description: `${service} refresh token for tenant ${tenant_id}`,
    })
    newRefreshVaultSecretId = refreshSecret
  }

  // UPSERT connection row
  const { error: upsertError } = await supabase
    .from('tenant_service_connections')
    .upsert({
      tenant_id, service, auth_type,
      vault_secret_id: newVaultSecretId,
      refresh_vault_secret_id: newRefreshVaultSecretId,
      token_expires_at: token_expires_at ?? null,
      scopes: scopes ?? [],
      metadata: metadata ?? {},
      status: 'connected',
      error_message: null,
      connected_by_user_id,
      connected_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'tenant_id,service',
    })

  if (upsertError) {
    // Clean up newly created Vault secrets since row upsert failed
    if (newVaultSecretId) await supabase.rpc('vault_delete_secret', { id: newVaultSecretId })
    if (newRefreshVaultSecretId) await supabase.rpc('vault_delete_secret', { id: newRefreshVaultSecretId })
    return new Response(JSON.stringify({ error: 'Failed to save connection' }), { status: 500 })
  }

  // Delete old Vault secrets (only after row upsert succeeds)
  if (oldVaultSecretId) {
    await supabase.rpc('vault_delete_secret', { id: oldVaultSecretId })
  }
  if (oldRefreshVaultSecretId) {
    await supabase.rpc('vault_delete_secret', { id: oldRefreshVaultSecretId })
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200 })
})
```

---

### Server-Side Validation Route

**File:** `app/api/integrations/api-key/validate/route.ts`
**Method:** `POST`
**Path:** `/api/integrations/api-key/validate`

#### Request

```typescript
interface ApiKeyValidateRequest {
  service: 'toggl';           // Only 'toggl' supported at launch
  api_key: string;            // The key to validate
}
```

#### Response (success)

```typescript
interface ApiKeyValidateSuccess {
  valid: true;
}
// HTTP 200
```

#### Response (invalid key)

```typescript
interface ApiKeyValidateInvalid {
  valid: false;
  error: string;              // Human-readable error message
}
// HTTP 200 (not a server error — the validation itself succeeded; the key is just wrong)
```

#### Response (server error)

```typescript
interface ApiKeyValidateError {
  error: string;
}
// HTTP 400: bad request (missing fields, unknown service)
// HTTP 401: user not authenticated
// HTTP 403: user doesn't have owner/admin role
// HTTP 500: Edge Function call failed, Vault error
```

#### Complete Route Implementation

```typescript
// app/api/integrations/api-key/validate/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // 1. Authenticate user
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Parse and validate request body
  let body: { service?: string; api_key?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { service, api_key } = body;

  // 3. Validate service
  if (service !== 'toggl') {
    return NextResponse.json(
      { error: `Unknown service: ${service}. Only 'toggl' is supported.` },
      { status: 400 }
    );
  }

  // 4. Validate api_key presence
  if (!api_key || typeof api_key !== 'string') {
    return NextResponse.json({ error: 'api_key is required.' }, { status: 400 });
  }

  // 5. Format validation (server-side, before hitting external API)
  if (!/^[a-z0-9]{32}$/.test(api_key)) {
    return NextResponse.json(
      {
        valid: false,
        error: 'Invalid token format. Toggl API tokens are 32-character alphanumeric strings.',
      },
      { status: 200 }
    );
  }

  // 6. Check tenant membership and role
  const { data: membership, error: membershipError } = await supabase
    .from('tenant_members')
    .select('tenant_id, role')
    .eq('user_id', session.user.id)
    .single();

  if (membershipError || !membership) {
    return NextResponse.json({ error: 'No tenant membership found.' }, { status: 403 });
  }

  if (!['owner', 'admin'].includes(membership.role)) {
    return NextResponse.json(
      { error: 'Only owners and admins can connect integrations.' },
      { status: 403 }
    );
  }

  // 7. Live validation against Toggl API
  let togglUser: {
    id: number;
    email: string;
    fullname: string;
    default_workspace_id: number;
  };

  try {
    const togglRes = await fetch('https://api.track.toggl.com/api/v9/me', {
      headers: {
        Authorization: `Basic ${Buffer.from(`${api_key}:api_token`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10_000), // 10 second timeout
    });

    if (togglRes.status === 401 || togglRes.status === 403) {
      return NextResponse.json(
        { valid: false, error: 'Invalid API token. Check the token at toggl.com/app/profile.' },
        { status: 200 }
      );
    }

    if (togglRes.status === 429) {
      return NextResponse.json(
        { valid: false, error: 'Toggl rate limit exceeded. Please wait a moment and try again.' },
        { status: 200 }
      );
    }

    if (!togglRes.ok) {
      return NextResponse.json(
        { valid: false, error: 'Could not reach Toggl to validate. Please try again.' },
        { status: 200 }
      );
    }

    togglUser = await togglRes.json();
  } catch (err) {
    // Network error or timeout
    return NextResponse.json(
      { valid: false, error: 'Could not reach Toggl to validate. Please try again.' },
      { status: 200 }
    );
  }

  // 8. Workspace metadata lookup (non-fatal if fails)
  let workspaceMetadata: {
    toggl_workspace_id: number | null;
    toggl_workspace_name: string | null;
    toggl_organization_id: number | null;
    toggl_organization_name: string | null;
    toggl_workspace_role: 'admin' | 'member' | null;
  } = {
    toggl_workspace_id: togglUser.default_workspace_id,
    toggl_workspace_name: null,
    toggl_organization_id: null,
    toggl_organization_name: null,
    toggl_workspace_role: null,
  };

  try {
    const allRes = await fetch('https://api.track.toggl.com/api/v9/me/all', {
      headers: {
        Authorization: `Basic ${Buffer.from(`${api_key}:api_token`).toString('base64')}`,
      },
      signal: AbortSignal.timeout(10_000),
    });

    if (allRes.ok) {
      const allData = await allRes.json();
      const defaultWs = (allData.workspaces ?? []).find(
        (ws: { id: number }) => ws.id === togglUser.default_workspace_id
      ) ?? allData.workspaces?.[0];

      if (defaultWs) {
        const org = (allData.organizations ?? []).find(
          (o: { id: number }) => o.id === defaultWs.organization_id
        );
        workspaceMetadata = {
          toggl_workspace_id: defaultWs.id,
          toggl_workspace_name: defaultWs.name ?? null,
          toggl_organization_id: defaultWs.organization_id ?? null,
          toggl_organization_name: org?.name ?? null,
          toggl_workspace_role: defaultWs.role ?? null,
        };
      }
    }
    // If /me/all fails, workspaceMetadata has partial data from /me — this is acceptable
  } catch {
    // Non-fatal — proceed with partial metadata
  }

  // 9. Save connection via Edge Function
  const upsertRes = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/upsert-service-connection`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        tenant_id: membership.tenant_id,
        service: 'toggl',
        auth_type: 'api_key',
        access_token: api_key,
        refresh_token: null,
        token_expires_at: null,
        scopes: [],
        metadata: {
          toggl_user_id: togglUser.id,
          toggl_email: togglUser.email,
          toggl_full_name: togglUser.fullname,
          ...workspaceMetadata,
        },
        connected_by_user_id: session.user.id,
      }),
    }
  );

  if (!upsertRes.ok) {
    console.error('upsert-service-connection failed:', await upsertRes.text());
    return NextResponse.json(
      { valid: false, error: 'Failed to save connection. Please try again.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ valid: true });
}
```

---

### How the Bot Reads the Toggl Key

At bot startup, for each active tenant, the bot loads service connections including Toggl. See `multi-tenant/byok-key-routing.md` for the full startup sequence. The Toggl-specific parts:

**1. Bot queries tenant service connections at startup:**

```python
# In multi-tenant connection manager (src_v2/entrypoints/discord/connection_manager.py)
# After loading a tenant's config, fetch service connections
connections = await db_session.execute(
    select(TenantServiceConnection)
    .where(
        TenantServiceConnection.tenant_id == tenant_id,
        TenantServiceConnection.status == 'connected',
    )
)
```

**2. For the Toggl row, bot decrypts the API key from Vault:**

```python
# vault_secret_id is the UUID from tenant_service_connections.vault_secret_id
toggl_api_key = await vault_repo.get_secret(session, vault_secret_id)
```

**3. Bot injects into ToolContext and per-request UserContext:**

The Toggl connection is a **tenant-level** credential, but it must be injected into `UserContext.credentials[CredentialPlatform.TOGGL]` for each request, since Toggl tools check `user_context.credentials[CredentialPlatform.TOGGL]` before executing.

The injection logic in the multi-tenant handler:

```python
# When building UserContext for a Discord message, inject tenant-level Toggl cred
# as fallback if the Discord user has no personal Toggl credential
personal_toggl = user_credentials.get(CredentialPlatform.TOGGL)
tenant_toggl = tenant_service_connections.get('toggl')

credentials = {}
if personal_toggl:
    credentials[CredentialPlatform.TOGGL] = personal_toggl.decrypted_token
    credential_metadata[CredentialPlatform.TOGGL] = personal_toggl.metadata
elif tenant_toggl:
    # Fall back to tenant-level Toggl connection
    credentials[CredentialPlatform.TOGGL] = tenant_toggl.decrypted_token
    credential_metadata[CredentialPlatform.TOGGL] = {
        'toggl_user_id': tenant_toggl.metadata.get('toggl_user_id'),
        'toggl_default_workspace_id': tenant_toggl.metadata.get('toggl_workspace_id'),
        'toggl_fullname': tenant_toggl.metadata.get('toggl_full_name'),
        'toggl_email': tenant_toggl.metadata.get('toggl_email'),
        'toggl_workspace_role': tenant_toggl.metadata.get('toggl_workspace_role'),
    }
```

**4. ToolContext is updated with tenant workspace IDs:**

```python
# Override platform-level Toggl workspace/org IDs with tenant-specific ones
tool_context = ToolContext(
    ...
    toggl_workspace_id=tenant_toggl.metadata.get('toggl_workspace_id') or PLATFORM_TOGGL_WORKSPACE_ID,
    toggl_organization_id=tenant_toggl.metadata.get('toggl_organization_id') or PLATFORM_TOGGL_ORG_ID,
    ...
)
```

---

### Error Scenarios

#### Scenario 1: User pastes wrong token

**What happens:**
1. Frontend: format validation passes (32 chars, alphanumeric) ✓
2. Server: format validation passes ✓
3. Server: `GET /me` → HTTP 403 from Toggl
4. Server returns `{ valid: false, error: 'Invalid API token. Check the token at toggl.com/app/profile.' }`
5. Frontend: shows error in modal field — `"Invalid API token. Check the token at toggl.com/app/profile."`

**Recovery:** User goes to `https://track.toggl.com/profile`, reveals their API token, copies it, pastes again.

#### Scenario 2: Token is correct format but revoked by user in Toggl

**What happens:**
1. Key was previously valid and connected
2. User goes to Toggl → Profile → Regenerates their API token
3. Bot attempts to use old key → Toggl returns HTTP 403
4. Bot's Toggl tool raises `ToolError("This tool requires a connected Toggl account.")`
5. Bot marks connection as error: `UPDATE tenant_service_connections SET status = 'error', error_message = 'API token rejected by Toggl. Please reconnect from the dashboard.' WHERE tenant_id = :id AND service = 'toggl'`
6. Bot fires Realtime event → dashboard shows "Error" badge on Toggl card
7. User sees error banner: "Toggl API key is invalid or has been revoked." with "Reconnect" button

**Recovery:** User clicks "Reconnect", pastes new API token from Toggl profile.

#### Scenario 3: Toggl is down during validation

**What happens:**
1. Frontend: format validation passes ✓
2. Server: `GET /me` → network timeout or 5xx
3. Server returns `{ valid: false, error: 'Could not reach Toggl to validate. Please try again.' }`
4. Frontend: shows error — "Could not reach Toggl to validate. Please try again."
5. Modal stays open; key is NOT saved

**Recovery:** User waits and tries again.

#### Scenario 4: Token format is wrong

**What happens (< 32 chars):**
- Frontend: validation error immediately (before submit): "API token must be exactly 32 characters."
- Form submit is blocked (disabled button while format invalid)

**What happens (invalid chars — uppercase, special):**
- Frontend: validation error: "API token may only contain lowercase letters and numbers."
- Form submit is blocked

**What happens (wrong length but right chars, e.g., 31 chars):**
- Frontend: "API token must be exactly 32 characters."

**Note on frontend vs server validation:** Both frontend AND server validate the format. The server is the authoritative gate; the frontend validation provides immediate feedback to reduce unnecessary API calls.

#### Scenario 5: User clicks "Connect Toggl" but has only Member role

**What happens:**
1. The "Connect Toggl" button is disabled for `member` role users (prop `disabled={userRole == 'member'}`)
2. If somehow the API route is called (e.g., direct HTTP call), the server returns HTTP 403 with error `"Only owners and admins can connect integrations."`

#### Scenario 6: Concurrent Toggl connections from two browser tabs

**What happens:**
1. Tab A opens modal, Tab B also opens modal (stale state)
2. Tab A submits valid key → upsert creates connection row
3. Tab B submits different key → upsert updates existing connection row (UPSERT on conflict)
4. The LAST write wins
5. The old Vault secret from Tab A's key is deleted by the Tab B write

**Note:** This is acceptable behavior — both keys were valid. The tenant simply ends up with the most recently submitted key.

#### Scenario 7: Bot marks Toggl connection as error

**Bot trigger:** When a Toggl tool call fails with HTTP 401 or 403 from Toggl.

**Bot action:**

```python
# In Toggl tool handler error handling
async def handle_toggl_auth_error(tenant_id: uuid.UUID, supabase_client):
    await supabase_client.table('tenant_service_connections').update({
        'status': 'error',
        'error_message': 'API token rejected by Toggl. Please reconnect from the dashboard.',
        'updated_at': datetime.utcnow().isoformat(),
    }).eq('tenant_id', str(tenant_id)).eq('service', 'toggl').execute()
```

**Bot does NOT delete the Vault secret** when marking as error — the secret remains so that if the bot or status monitor incorrectly marked it as error (transient Toggl outage), the tenant can check the dashboard and see the error message without losing the key. The tenant must explicitly disconnect or reconnect to change the Vault secret.

---

### Bot Usage: Toggl API Call Pattern

All 34 Toggl tools follow the same pattern. The API key is read from `user_context.credentials[CredentialPlatform.TOGGL]` and passed to the `orchestrator_clients.toggl.api` functions:

**Authentication:**

```python
# From orchestrator_clients/toggl/api.py
BASE_URL = "https://api.track.toggl.com/api/v9"

def _auth(api_token: str) -> httpx.BasicAuth:
    return httpx.BasicAuth(api_token, "api_token")
```

All Toggl API calls use this `_auth()` helper. The API token becomes the HTTP Basic Auth username; `"api_token"` is always the literal password.

**Example tool call (from `toggl/tools.py`):**

```python
@tool(
    description="Get current time entry...",
    tags={Platform.TOGGL, Action.READ},
    requires_credential=CredentialPlatform.TOGGL,
)
async def toggl_get_current_time_entry(
    tool_context: ToolContext,
    user_context: UserContext,
    db_context: DatabaseContext | None,
    params: GetCurrentTimeEntryInput,
) -> str:
    api_token = user_context.credentials[CredentialPlatform.TOGGL]
    entry = await toggl_api.get_current_time_entry(api_token)
    ...
```

**Scope gate (admin-only tools):**

```python
# In src_v2/mcp/registry.py — applied before dispatching
if Scope.TOGGL_WORKSPACE_ADMIN in tool_def.tags:
    toggl_meta = user_context.credential_metadata.get(CredentialPlatform.TOGGL, {})
    if toggl_meta.get('toggl_workspace_role') != 'admin':
        raise ToolError(
            "This tool requires workspace admin permissions in Toggl. "
            "Your account may not have admin access to the connected workspace."
        )
```

---

### Disconnect Flow

**Frontend trigger:** User clicks "Disconnect" → confirmation dialog → confirms.

**API route called:**

```
DELETE /api/integrations/toggl
```

**Route implementation:**

```typescript
// app/api/integrations/[service]/route.ts (DELETE handler for 'toggl')
export async function DELETE(
  request: Request,
  { params }: { params: { service: string } }
) {
  const { service } = params;

  // Validate service (toggl is valid)
  if (!['github', 'google', 'linear', 'toggl'].includes(service)) {
    return NextResponse.json({ error: 'Unknown service' }, { status: 400 });
  }

  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: membership } = await supabase
    .from('tenant_members')
    .select('tenant_id, role')
    .eq('user_id', session.user.id)
    .single();

  if (!membership || !['owner', 'admin'].includes(membership.role)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  // Call Edge Function to handle Vault deletion + row status update
  const disconnectRes = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/disconnect-service`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        tenant_id: membership.tenant_id,
        service,
      }),
    }
  );

  if (!disconnectRes.ok) {
    return NextResponse.json({ error: 'Failed to disconnect service.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
```

**`disconnect-service` Edge Function logic:**

```typescript
// supabase/functions/disconnect-service/index.ts
Deno.serve(async (req) => {
  const { tenant_id, service } = await req.json()
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

  // Fetch current row to get vault IDs
  const { data: connection } = await supabase
    .from('tenant_service_connections')
    .select('vault_secret_id, refresh_vault_secret_id')
    .eq('tenant_id', tenant_id)
    .eq('service', service)
    .single()

  if (!connection) {
    return new Response(JSON.stringify({ error: 'Connection not found' }), { status: 404 })
  }

  // Update status to 'revoked' (soft delete — row remains for history)
  await supabase
    .from('tenant_service_connections')
    .update({ status: 'revoked', updated_at: new Date().toISOString() })
    .eq('tenant_id', tenant_id)
    .eq('service', service)

  // Hard-delete Vault secrets
  if (connection.vault_secret_id) {
    await supabase.rpc('vault_delete_secret', { id: connection.vault_secret_id })
  }
  if (connection.refresh_vault_secret_id) {
    await supabase.rpc('vault_delete_secret', { id: connection.refresh_vault_secret_id })
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200 })
})
```

**What happens after disconnect:**

1. `tenant_service_connections.status` → `'revoked'`
2. Vault secret deleted — API key is permanently destroyed
3. Supabase Realtime fires UPDATE event to the bot
4. Bot detects `status = 'revoked'` for Toggl connection
5. Bot removes Toggl credential from all in-memory `TenantConfig` objects for this tenant
6. All future Toggl tool calls from this tenant's Discord server will return: `"This tool requires a connected Toggl account. Run /connect toggl to link your account."` (or the tenant-level equivalent)
7. Integrations page refreshes — Toggl card shows "Not Connected" status
8. "Connect Toggl" button becomes active again

---

### Reconnection Flow

After disconnecting and wanting to reconnect with the same or a different key:

1. The `tenant_service_connections` row has `status = 'revoked'` and `vault_secret_id` is now a dangling reference (Vault secret deleted)
2. User clicks "Connect Toggl" → opens API key modal
3. User pastes new (or same) key
4. Server validates → calls `upsert-service-connection` Edge Function
5. Edge Function: `ON CONFLICT (tenant_id, service) DO UPDATE` → updates the existing `status='revoked'` row to `status='connected'` with new `vault_secret_id`
6. A **new** Vault secret is created
7. Old dangling `vault_secret_id` from `status='revoked'` row: since the Vault secret was already deleted during disconnect, calling `vault_delete_secret()` on it will return "not found" — Edge Function should handle this gracefully (ignore the error)

**Important:** The `ON CONFLICT` update resets `connected_at` to `NOW()` — the "Connected" timestamp shown in the UI reflects the most recent connection, not the original one.

---

### Rate Limiting Considerations

**Toggl's public rate limit policy:**

- The Toggl Track API has a rate limit of approximately **1 request per second** per IP address on the public API
- Validation calls from Daimon's Next.js server use the server's outbound IP
- If many tenants validate keys simultaneously (e.g., launch day), this could cause 429 responses
- **Mitigation:** The validation route already handles 429 by returning a user-friendly error. No retry logic on the server — user must retry manually.
- **Future improvement:** Add a Redis-backed rate limiter on the validation route to prevent hammering Toggl from the server side. Not required at launch.

---

### UI Integration Points

The `api-key-services.md` spec covers the backend. The corresponding frontend spec is in:

- **`frontend/integrations-page.md`**: `## Connect Flows → Flow B: API Key Service (Toggl)` — Complete modal HTML, validation client-side logic, API route call

Key frontend behaviors for Toggl specifically:

| Behavior | Detail |
|----------|--------|
| Modal field type | `type="password"` (hides characters while typing) |
| Autocomplete | `autocomplete="off"` |
| Spellcheck | `spellcheck="false"` |
| Client-side validation trigger | On submit click (not on blur/change — avoids annoying the user while still typing) |
| Format check | `/^[a-z0-9]{32}$/.test(key)` |
| Length error message | "API token must be exactly 32 characters." |
| Format error message | "API token may only contain lowercase letters and numbers." |
| Submitting state | Button text: "Validating..." + spinner; button disabled |
| Server invalid response | "Invalid API token. Check the token at toggl.com/app/profile." |
| Server network error | "Could not reach Toggl to validate. Please try again." |
| Save failure (Edge Function error) | "Failed to save connection. Please try again." |
| Success | Modal closes; toast "Toggl connected as {fullname}"; card updates to Connected status |

---

### Full Error Message Reference

All error messages related to Toggl (server-side, client-side, bot-side):

| Context | Trigger | Message |
|---------|---------|---------|
| Frontend modal | key length ≠ 32 | "API token must be exactly 32 characters." |
| Frontend modal | key contains invalid chars | "API token may only contain lowercase letters and numbers." |
| Server route | key format invalid (server check) | "Invalid token format. Toggl API tokens are 32-character alphanumeric strings." |
| Server route | Toggl 401/403 | "Invalid API token. Check the token at toggl.com/app/profile." |
| Server route | Toggl 429 | "Toggl rate limit exceeded. Please wait a moment and try again." |
| Server route | Toggl 5xx or timeout | "Could not reach Toggl to validate. Please try again." |
| Server route | Edge Function failed | "Failed to save connection. Please try again." |
| Bot tool call | Toggl key expired/revoked | "API token rejected by Toggl. Please reconnect from the dashboard." (stored in `error_message`; shown in integrations UI) |
| Bot tool dispatch | No Toggl credential | "This tool requires a connected Toggl account. Use the dashboard to connect Toggl." |
| Bot tool dispatch | Not workspace admin | "This tool requires workspace admin permissions in Toggl. Your account may not have admin access to the connected workspace." |

---

## Future API Key Services

The architecture supports adding more API key services in the future. To add a new service (e.g., `notion`, `airtable`):

1. **Database:** Add new value to `CHECK (service IN (...))` constraint via `ALTER TABLE` migration. Add corresponding `auth_type` check constraint update.
2. **Frontend:** Add service to `SERVICE_META` constant in `integrations-page.md`. Add logo to `/public/icons/`.
3. **Validation route:** Add a `case` for the new service in `POST /api/integrations/api-key/validate` — implement the service-specific validation call and metadata extraction.
4. **Bot:** Add new `CredentialPlatform` enum value and update the connection manager to inject the key.
5. **Docs:** Add tool reference for the new service's tools.

**API key format documentation template (per-service):**

| Property | Must Document |
|----------|---------------|
| Key length | Exact character count |
| Key character set | Regex pattern |
| Key example | Redacted example |
| Where to find | URL and navigation steps |
| Validation endpoint | URL, method, auth, expected response |
| Metadata to store | All JSONB fields |
| Bot usage | Which ToolContext/UserContext fields populated |
| Error handling | All HTTP status codes and responses |

---

## Cross-References

- **Database schema for `tenant_service_connections`:** [`../database/schema.md#Table: tenant_service_connections`](../database/schema.md)
- **Vault encryption setup:** [`../database/vault-encryption.md`](../database/vault-encryption.md)
- **OAuth services (GitHub, Google, Linear):** [`./oauth-services.md`](./oauth-services.md)
- **Frontend integrations page (modal + flow):** [`../frontend/integrations-page.md`](../frontend/integrations-page.md)
- **Multi-tenant BYOK key routing:** [`../multi-tenant/byok-key-routing.md`](../multi-tenant/byok-key-routing.md)
- **API routes overview:** [`../api/routes.md`](../api/routes.md)
- **Bot tool dispatch and credential gate:** [`../source/existing-tools.md`](../source/existing-tools.md)
