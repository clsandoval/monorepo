# Integrations Page — Complete Specification

> Route: `/dashboard/integrations`
> Layout: `app/(dashboard)/layout.tsx` — Authenticated only
> File: `app/(dashboard)/integrations/page.tsx` (Server Component, data fetched server-side)
> Last updated: 2026-03-13

---

## Overview

The Integrations page lets tenants connect third-party services that the bot uses as tool sources. Each service appears as a card in a grid. Connected services show their connection status; unconnected services show a "Connect" button that initiates the appropriate flow (OAuth redirect or API key modal).

**Services at launch (4 total):**

| Service | Auth Type | Purpose |
|---------|-----------|---------|
| GitHub | OAuth 2.0 | Run `gh` CLI commands, manage issues/PRs |
| Google | OAuth 2.0 | Google Analytics data, Calendar (future) |
| Linear | OAuth 2.0 | Issue tracking, project management tools |
| Toggl | API key paste | Time tracking and reporting tools |

**Auth guard:** Middleware (`middleware.ts`) redirects unauthenticated requests to `/login?next=/dashboard/integrations`. Member-role users can VIEW but cannot connect/disconnect (owner/admin role required for mutations — enforced in API routes).

**Real-time updates:** After initial server-side render, the page subscribes to Supabase Realtime on the `tenant:service_connections:{tenant_id}` channel. When the bot marks a connection as `expired` or `error`, the card status updates without a reload. See [../multi-tenant/realtime-contract.md](../multi-tenant/realtime-contract.md).

---

## Layout Structure

The integrations page uses the standard Dashboard Shell (sidebar + topbar + main content area). See [dashboard.md](./dashboard.md) for full shell spec.

```
<main class="page-content">                <!-- p-8 -->
  <PageHeader />                            <!-- Title + subtitle -->
  <ServiceGrid />                           <!-- 2-col grid → 1-col mobile -->
</main>
```

---

## Page Header

```html
<div class="page-header">
  <h1>Integrations</h1>
  <p class="subtitle">
    Connect your services so the bot can work with your tools.
    Connected services are available to all users in your Discord server.
  </p>
</div>
```

| Property | Value |
|----------|-------|
| `h1` font | Archivo SemiBold, 28px, #0C1F40 (Navy) |
| `h1` margin-bottom | 8px |
| Subtitle font | Inter Regular, 14px, #6B7280 (Gray 500) |
| Subtitle max-width | 640px |
| Header margin-bottom | 32px |

---

## Service Grid (`components/integrations/ServiceGrid.tsx`)

```html
<div class="service-grid">
  <ServiceCard service="github" />
  <ServiceCard service="google" />
  <ServiceCard service="linear" />
  <ServiceCard service="toggl" />
</div>
```

| Property | Value |
|----------|-------|
| Display | CSS Grid |
| Grid columns (desktop ≥1280px) | `repeat(2, 1fr)` |
| Grid columns (tablet 768–1279px) | `repeat(2, 1fr)` |
| Grid columns (mobile <768px) | `1fr` |
| Gap | 16px |

---

## Service Card Component (`components/integrations/ServiceCard.tsx`)

### Props Interface

```typescript
interface ServiceCardProps {
  service: 'github' | 'google' | 'linear' | 'toggl';
  connection: TenantServiceConnection | null;  // null = not connected
  userRole: 'owner' | 'admin' | 'member';      // controls CTA visibility
  isLoading?: boolean;                          // skeleton state
}

interface TenantServiceConnection {
  id: string;
  service: 'github' | 'google' | 'linear' | 'toggl';
  auth_type: 'oauth' | 'api_key';
  status: 'connected' | 'expired' | 'revoked' | 'error';
  scopes: string[];
  metadata: Record<string, unknown>;
  connected_at: string;                        // ISO 8601
  last_used_at: string | null;
  error_message: string | null;
}
```

### Card Anatomy (HTML structure)

```html
<div class="service-card" data-status="{status | 'not-connected'}">
  <!-- Header row -->
  <div class="card-header">
    <div class="service-identity">
      <ServiceLogo service="{service}" />        <!-- 40px × 40px SVG icon -->
      <div class="service-name-group">
        <span class="service-name">{SERVICE_META[service].displayName}</span>
        <span class="service-description">{SERVICE_META[service].description}</span>
      </div>
    </div>
    <StatusBadge status="{status | 'not-connected'}" />
  </div>

  <!-- Connection details (shown only when connected or error) -->
  <div class="card-details" hidden="{not connected}">
    <div class="detail-row">
      <span class="detail-label">Connected</span>
      <span class="detail-value">{relative time, e.g. "3 days ago"}</span>
    </div>
    <div class="detail-row" hidden="{last_used_at is null}">
      <span class="detail-label">Last used</span>
      <span class="detail-value">{relative time | "Never"}</span>
    </div>
    <div class="detail-row" hidden="{auth_type != 'oauth' || scopes.length == 0}">
      <span class="detail-label">Scopes</span>
      <span class="detail-value">{scopes joined with ", "}</span>
    </div>
    <!-- Error banner (only when status='error' or status='expired') -->
    <div class="error-banner" hidden="{status not in ['error', 'expired']}">
      <IconAlertTriangle size=14 />
      <span>{error_message | SERVICE_META[service].defaultErrorMessage}</span>
    </div>
  </div>

  <!-- Footer actions -->
  <div class="card-footer">
    <!-- Not connected: single CTA -->
    <button class="btn-primary" hidden="{is connected}" disabled="{userRole == 'member'}"
            onclick="handleConnect(service)">
      Connect {SERVICE_META[service].displayName}
    </button>

    <!-- Connected: secondary actions -->
    <div class="connected-actions" hidden="{not connected}">
      <!-- Reconnect (shown when expired or error) -->
      <button class="btn-secondary" hidden="{status not in ['expired', 'error']}"
              disabled="{userRole == 'member'}"
              onclick="handleConnect(service)">
        Reconnect
      </button>
      <!-- Disconnect -->
      <button class="btn-ghost btn-destructive" hidden="{status == 'revoked'}"
              disabled="{userRole == 'member'}"
              onclick="handleDisconnect(service)">
        Disconnect
      </button>
    </div>
  </div>
</div>
```

### Card Dimensions & Styling

| Property | Value |
|----------|-------|
| Background | `#FFFFFF` |
| Border | `1px solid #E5E7EB` (Gray 200) |
| Border-radius | `0px` (PyMC brand: sharp corners) |
| Padding | `24px` |
| Min-height | `180px` |
| Box-shadow | `none` (default) |
| Box-shadow hover | `0 2px 8px rgba(0,0,0,0.08)` |
| Transition | `box-shadow 150ms ease` |

**Variant: connected**

| Property | Value |
|----------|-------|
| Border-left | `3px solid #00D4B8` (Aqua — brand accent) |

**Variant: error or expired**

| Property | Value |
|----------|-------|
| Border-left | `3px solid #EF4444` (Red 500) |

**Variant: not-connected (default)**

| Property | Value |
|----------|-------|
| Border | `1px solid #E5E7EB` (no accent left border) |
| Opacity | `1` (full — not dimmed, just no accent) |

### Card Header Row

| Property | Value |
|----------|-------|
| Display | `flex`, `justify-between`, `align-center` |
| Margin-bottom | `16px` |

### Service Logo

| Property | Value |
|----------|-------|
| Size | `40px × 40px` |
| Container | `flex-shrink-0` |
| Margin-right | `12px` |
| GitHub logo | `/icons/github.svg` — `#0C1F40` (monochrome navy) |
| Google logo | `/icons/google.svg` — full-color official Google "G" |
| Linear logo | `/icons/linear.svg` — `#5E6AD2` (Linear's brand purple) |
| Toggl logo | `/icons/toggl.svg` — `#E57CD8` (Toggl's brand pink) |

### Service Name Group

| Element | Font | Color |
|---------|------|-------|
| `.service-name` | Archivo SemiBold, 16px | `#0C1F40` (Navy) |
| `.service-description` | Inter Regular, 13px | `#6B7280` (Gray 500) |

### Status Badge (`components/ui/StatusBadge.tsx`)

| Status | Label | Background | Text color | Border |
|--------|-------|-----------|-----------|--------|
| `connected` | "Connected" | `#D1FAE5` (Green 100) | `#059669` (Green 600) | none |
| `expired` | "Expired" | `#FEF3C7` (Yellow 100) | `#D97706` (Amber 600) | none |
| `error` | "Error" | `#FEE2E2` (Red 100) | `#DC2626` (Red 600) | none |
| `revoked` | "Disconnected" | `#F3F4F6` (Gray 100) | `#6B7280` (Gray 500) | none |
| `not-connected` | "Not Connected" | `#F3F4F6` (Gray 100) | `#6B7280` (Gray 500) | none |

Badge dimensions: height `22px`, padding `4px 10px`, font Inter Medium 12px, border-radius `0px`.

### Card Details Section

| Property | Value |
|----------|-------|
| Background | `#F9FAFB` (Gray 50) |
| Border | `1px solid #F3F4F6` |
| Padding | `12px` |
| Margin-top | `16px` |
| Margin-bottom | `16px` |

| Element | Font | Color |
|---------|------|-------|
| `.detail-label` | Inter Regular, 12px | `#9CA3AF` (Gray 400) |
| `.detail-value` | Inter Medium, 12px | `#374151` (Gray 700) |
| Detail row | `flex justify-between align-center` | — |
| Detail row height | `24px` | — |

**Error banner:**

| Property | Value |
|----------|-------|
| Background | `#FEF2F2` (Red 50) |
| Border | `1px solid #FEE2E2` (Red 100) |
| Padding | `8px 12px` |
| Margin-top | `8px` |
| Font | Inter Regular, 12px, `#DC2626` (Red 600) |
| Icon | `AlertTriangle` 14px, `#DC2626` |
| Icon margin-right | `6px` |

### Card Footer

| Property | Value |
|----------|-------|
| Margin-top | `auto` (pushes footer to bottom) |
| Padding-top | `16px` |
| Border-top | `1px solid #F3F4F6` |
| Display | `flex`, `justify-end`, `gap: 8px` |

---

## Service Metadata (`SERVICE_META` constant)

```typescript
const SERVICE_META = {
  github: {
    displayName: 'GitHub',
    description: 'Run GitHub CLI commands, manage issues and pull requests.',
    defaultErrorMessage: 'GitHub token may be expired or revoked. Reconnect to restore access.',
    authType: 'oauth',
    oauthScopes: ['repo', 'read:org', 'gist'],
  },
  google: {
    displayName: 'Google',
    description: 'Access Google Analytics reports and workspace data.',
    defaultErrorMessage: 'Google OAuth token expired. Reconnect to refresh access.',
    authType: 'oauth',
    oauthScopes: ['https://www.googleapis.com/auth/analytics.readonly'],
  },
  linear: {
    displayName: 'Linear',
    description: 'Manage Linear issues, cycles, and projects.',
    defaultErrorMessage: 'Linear token invalid or revoked. Reconnect to restore access.',
    authType: 'oauth',
    oauthScopes: ['read', 'write', 'issues:create', 'comments:create'],
  },
  toggl: {
    displayName: 'Toggl',
    description: 'Track time entries and access workspace reports.',
    defaultErrorMessage: 'Toggl API key is invalid or has been revoked.',
    authType: 'api_key',
    keyPlaceholder: 'Paste your Toggl API token',
    keyHelpText: 'Find your API token at toggl.com/app/profile.',
    keyFormat: /^[a-z0-9]{32}$/, // 32-char hex string
  },
} as const;
```

---

## Data Fetching

### Server Component Query (initial render)

```typescript
// app/(dashboard)/integrations/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export default async function IntegrationsPage() {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Get tenant ID and user role from session
  const { data: membership } = await supabase
    .from('tenant_members')
    .select('tenant_id, role')
    .eq('user_id', session.user.id)
    .single();

  // Fetch all service connections for this tenant
  const { data: connections } = await supabase
    .from('tenant_service_connections')
    .select('id, service, auth_type, status, scopes, metadata, connected_at, last_used_at, error_message')
    .eq('tenant_id', membership.tenant_id)
    .neq('status', 'revoked');     // Don't show revoked connections in the grid

  // Index by service name for O(1) card lookup
  const connectionsByService = Object.fromEntries(
    (connections ?? []).map((c) => [c.service, c])
  );

  return (
    <IntegrationsPageClient
      tenantId={membership.tenant_id}
      userRole={membership.role}
      connectionsByService={connectionsByService}
    />
  );
}
```

**Fields fetched:** `id`, `service`, `auth_type`, `status`, `scopes`, `metadata`, `connected_at`, `last_used_at`, `error_message`.
**Fields NOT fetched:** `vault_secret_id`, `refresh_vault_secret_id`, `token_expires_at` (server-only, never exposed to client).

---

## Connect Flows

### Flow A: OAuth Services (GitHub, Google, Linear)

#### Step 1 — User clicks "Connect {Service}"

The button click invokes a Next.js API route that generates the OAuth authorization URL and redirects:

```
GET /api/integrations/oauth/start?service={service}&tenant_id={tenantId}
```

**Server action in `IntegrationsPageClient.tsx`:**

```typescript
const handleConnect = async (service: 'github' | 'google' | 'linear') => {
  // Show loading spinner on the card
  setConnectingService(service);

  // Redirect to OAuth start route
  window.location.href = `/api/integrations/oauth/start?service=${service}`;
};
```

#### Step 2 — OAuth Start Route

**File:** `app/api/integrations/oauth/start/route.ts`

```typescript
// GET /api/integrations/oauth/start?service={service}
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const service = searchParams.get('service'); // 'github' | 'google' | 'linear'

  // Validate service
  if (!['github', 'google', 'linear'].includes(service ?? '')) {
    return NextResponse.redirect('/dashboard/integrations?error=invalid_service');
  }

  // Validate user session
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.redirect('/login');

  // Get tenant ID
  const { data: membership } = await supabase
    .from('tenant_members')
    .select('tenant_id, role')
    .eq('user_id', session.user.id)
    .single();

  if (!membership || !['owner', 'admin'].includes(membership.role)) {
    return NextResponse.redirect('/dashboard/integrations?error=unauthorized');
  }

  // Generate OAuth state param (CSRF protection)
  const state = crypto.randomUUID();

  // Store state in cookie (expires in 10 minutes)
  const response = NextResponse.redirect(buildAuthorizationUrl(service, state));
  response.cookies.set('oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600, // 10 minutes
    path: '/',
  });
  response.cookies.set('oauth_service', service, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  });
  response.cookies.set('oauth_tenant_id', membership.tenant_id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  });

  return response;
}
```

#### Step 3 — Authorization URL Construction

**File:** `lib/integrations/oauth.ts`

```typescript
function buildAuthorizationUrl(service: string, state: string): string {
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/oauth/callback`;

  switch (service) {
    case 'github':
      return (
        `https://github.com/login/oauth/authorize` +
        `?client_id=${process.env.GITHUB_OAUTH_CLIENT_ID}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&scope=${encodeURIComponent('repo read:org gist')}` +
        `&state=${state}`
      );

    case 'google':
      return (
        `https://accounts.google.com/o/oauth2/v2/auth` +
        `?client_id=${process.env.GOOGLE_OAUTH_CLIENT_ID}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_type=code` +
        `&scope=${encodeURIComponent('https://www.googleapis.com/auth/analytics.readonly')}` +
        `&access_type=offline` +   // Request refresh token
        `&prompt=consent` +        // Force consent to get refresh_token every time
        `&state=${state}`
      );

    case 'linear':
      return (
        `https://linear.app/oauth/authorize` +
        `?client_id=${process.env.LINEAR_OAUTH_CLIENT_ID}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_type=code` +
        `&scope=${encodeURIComponent('read write issues:create comments:create')}` +
        `&state=${state}`
      );

    default:
      throw new Error(`Unknown OAuth service: ${service}`);
  }
}
```

#### Step 4 — OAuth Callback

**File:** `app/api/integrations/oauth/callback/route.ts`

```typescript
// GET /api/integrations/oauth/callback?code={code}&state={state}
// GET /api/integrations/oauth/callback?error={error}&error_description={desc}
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  const cookieStore = cookies();
  const storedState = cookieStore.get('oauth_state')?.value;
  const service = cookieStore.get('oauth_service')?.value;
  const tenantId = cookieStore.get('oauth_tenant_id')?.value;

  // Clear cookies immediately (prevent replay)
  const response = NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/integrations`
  );
  response.cookies.delete('oauth_state');
  response.cookies.delete('oauth_service');
  response.cookies.delete('oauth_tenant_id');

  // Handle provider error
  if (error) {
    const msg = encodeURIComponent(errorDescription ?? error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/integrations?error=${msg}`
    );
  }

  // Validate state (CSRF)
  if (!state || state !== storedState) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/integrations?error=invalid_state`
    );
  }

  // Validate service and code
  if (!service || !code || !tenantId) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/integrations?error=missing_params`
    );
  }

  // Exchange code for tokens
  let tokens: OAuthTokens;
  try {
    tokens = await exchangeCodeForTokens(service, code);
  } catch (err) {
    const msg = encodeURIComponent('Token exchange failed. Please try again.');
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/integrations?error=${msg}`
    );
  }

  // Validate user session (re-check — state was validated, but double-check auth)
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login`);
  }

  // Upsert connection via Edge Function (service role)
  const upsertResponse = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/upsert-service-connection`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        tenant_id: tenantId,
        service,
        auth_type: 'oauth',
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token ?? null,
        token_expires_at: tokens.expires_at ?? null,
        scopes: tokens.scopes ?? [],
        metadata: tokens.metadata ?? {},
        connected_by_user_id: session.user.id,
      }),
    }
  );

  if (!upsertResponse.ok) {
    const msg = encodeURIComponent('Failed to save connection. Please try again.');
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/integrations?error=${msg}`
    );
  }

  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/integrations?success=${service}`
  );
}
```

#### Step 5 — Token Exchange

**File:** `lib/integrations/oauth.ts`

```typescript
interface OAuthTokens {
  access_token: string;
  refresh_token?: string;
  expires_at?: string;     // ISO 8601 timestamp
  scopes?: string[];
  metadata?: Record<string, unknown>;
}

async function exchangeCodeForTokens(service: string, code: string): Promise<OAuthTokens> {
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/oauth/callback`;

  switch (service) {
    case 'github': {
      const res = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          client_id: process.env.GITHUB_OAUTH_CLIENT_ID,
          client_secret: process.env.GITHUB_OAUTH_CLIENT_SECRET,
          code,
          redirect_uri: redirectUri,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error_description ?? data.error);
      return {
        access_token: data.access_token,
        // GitHub OAuth App tokens don't expire and have no refresh token
        scopes: data.scope?.split(',').map((s: string) => s.trim()) ?? [],
      };
    }

    case 'google': {
      const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: process.env.GOOGLE_OAUTH_CLIENT_ID!,
          client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET!,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error_description ?? data.error);
      const expiresAt = data.expires_in
        ? new Date(Date.now() + data.expires_in * 1000).toISOString()
        : undefined;
      return {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: expiresAt,
        scopes: data.scope?.split(' ') ?? [],
      };
    }

    case 'linear': {
      const res = await fetch('https://api.linear.app/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: process.env.LINEAR_OAUTH_CLIENT_ID!,
          client_secret: process.env.LINEAR_OAUTH_CLIENT_SECRET!,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error_description ?? data.error);
      // Linear tokens do not expire; no refresh token
      return {
        access_token: data.access_token,
        scopes: data.scope?.split(',').map((s: string) => s.trim()) ?? [],
      };
    }

    default:
      throw new Error(`Unknown OAuth service: ${service}`);
  }
}
```

---

### Flow B: API Key Service (Toggl)

#### Step 1 — User clicks "Connect Toggl"

Clicking the button opens the **API Key Modal** overlay.

```typescript
const handleConnect = (service: 'toggl') => {
  setApiKeyModalOpen(true);
  setApiKeyModalService(service);
};
```

#### Step 2 — API Key Modal (`components/integrations/ApiKeyModal.tsx`)

```html
<dialog class="api-key-modal" aria-labelledby="modal-title" role="dialog" aria-modal="true">
  <div class="modal-overlay" onclick="handleClose()" />
  <div class="modal-content">
    <!-- Header -->
    <div class="modal-header">
      <div class="modal-title-row">
        <ServiceLogo service="toggl" size=32 />
        <h2 id="modal-title">Connect Toggl</h2>
      </div>
      <button class="modal-close" aria-label="Close" onclick="handleClose()">
        <IconX size=20 />
      </button>
    </div>

    <!-- Body -->
    <div class="modal-body">
      <p class="modal-description">
        Paste your Toggl API token to enable time tracking tools.
      </p>

      <!-- Help text -->
      <div class="help-banner">
        <IconInfo size=14 />
        <span>
          Find your API token at
          <a href="https://toggl.com/app/profile" target="_blank" rel="noopener noreferrer">
            toggl.com/app/profile
          </a>
          under "API Token".
        </span>
      </div>

      <!-- Input field -->
      <label for="api-key-input" class="field-label">
        Toggl API Token
        <span class="field-required" aria-label="required">*</span>
      </label>
      <input
        id="api-key-input"
        type="password"
        name="api_key"
        placeholder="Your 32-character Toggl API token"
        autocomplete="off"
        spellcheck="false"
        aria-describedby="api-key-error api-key-hint"
        class="text-input {error ? 'text-input--error' : ''}"
      />
      <p id="api-key-hint" class="field-hint">
        32-character alphanumeric token. Never share this with others.
      </p>
      <p id="api-key-error" class="field-error" hidden="{!error}">
        {errorMessage}
      </p>
    </div>

    <!-- Footer -->
    <div class="modal-footer">
      <button class="btn-ghost" onclick="handleClose()" disabled="{isSubmitting}">
        Cancel
      </button>
      <button class="btn-primary" onclick="handleSubmitApiKey()" disabled="{isSubmitting || !keyValue}">
        {isSubmitting ? <Spinner size=14 /> + ' Validating...' : 'Save & Connect'}
      </button>
    </div>
  </div>
</dialog>
```

**Modal dimensions:**

| Property | Value |
|----------|-------|
| Max-width | `480px` |
| Width | `100%` (responsive) |
| Background | `#FFFFFF` |
| Border | `1px solid #E5E7EB` |
| Border-radius | `0px` (PyMC sharp corners) |
| Padding | `24px` |
| Box-shadow | `0 20px 60px rgba(0,0,0,0.15)` |
| Overlay background | `rgba(0,0,0,0.5)` |

**Validation on submit:**

1. Check key length is 32 characters. If not: show error "API token must be exactly 32 characters."
2. Check key matches `/^[a-z0-9]{32}$/`. If not: show error "API token may only contain lowercase letters and numbers."
3. Submit to `/api/integrations/api-key/validate` — server validates against Toggl API.
4. If valid: close modal, show success toast, refresh card.
5. If invalid (Toggl returns 403): show error "Invalid API token. Please check and try again."
6. If network error: show error "Could not reach Toggl to validate. Please try again."

#### Step 3 — API Key Validation Route

**File:** `app/api/integrations/api-key/validate/route.ts`

```typescript
// POST /api/integrations/api-key/validate
// Body: { service: 'toggl', api_key: string }
export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { service, api_key } = body;

  if (service !== 'toggl') {
    return NextResponse.json({ error: 'Unknown service' }, { status: 400 });
  }

  // Format validation
  if (!/^[a-z0-9]{32}$/.test(api_key)) {
    return NextResponse.json(
      { valid: false, error: 'Invalid token format — must be 32 lowercase alphanumeric characters.' },
      { status: 400 }
    );
  }

  // Live validation against Toggl API
  const togglRes = await fetch('https://api.track.toggl.com/api/v9/me', {
    headers: {
      Authorization: `Basic ${Buffer.from(`${api_key}:api_token`).toString('base64')}`,
    },
  });

  if (togglRes.status === 403 || togglRes.status === 401) {
    return NextResponse.json({ valid: false, error: 'Invalid API token.' }, { status: 200 });
  }

  if (!togglRes.ok) {
    return NextResponse.json(
      { valid: false, error: 'Could not reach Toggl to validate. Please try again.' },
      { status: 200 }
    );
  }

  const togglUser = await togglRes.json();

  // Get tenant
  const { data: membership } = await supabase
    .from('tenant_members')
    .select('tenant_id, role')
    .eq('user_id', session.user.id)
    .single();

  if (!membership || !['owner', 'admin'].includes(membership.role)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  // Save via Edge Function (service role writes Vault secret)
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
          toggl_workspace_id: togglUser.default_workspace_id,
        },
        connected_by_user_id: session.user.id,
      }),
    }
  );

  if (!upsertRes.ok) {
    return NextResponse.json({ valid: false, error: 'Failed to save connection.' }, { status: 500 });
  }

  return NextResponse.json({ valid: true });
}
```

---

## Disconnect Flow

### Step 1 — User clicks "Disconnect"

Clicking shows a **confirmation dialog** before proceeding.

```typescript
const handleDisconnect = (service: string) => {
  setConfirmDisconnect({ open: true, service });
};
```

### Step 2 — Confirmation Dialog (`components/ui/ConfirmDialog.tsx`)

```html
<dialog class="confirm-dialog" role="alertdialog" aria-modal="true"
        aria-labelledby="confirm-title" aria-describedby="confirm-desc">
  <div class="confirm-content">
    <div class="confirm-icon">
      <IconAlertTriangle size=24 color="#EF4444" />
    </div>
    <h3 id="confirm-title">Disconnect {SERVICE_META[service].displayName}?</h3>
    <p id="confirm-desc">
      The bot will no longer have access to {SERVICE_META[service].displayName}.
      Any tools that use {SERVICE_META[service].displayName} will stop working in Discord.
      You can reconnect at any time.
    </p>
    <div class="confirm-actions">
      <button class="btn-ghost" onclick="handleCancel()">Cancel</button>
      <button class="btn-destructive" onclick="handleConfirmDisconnect()" disabled="{isLoading}">
        {isLoading ? <Spinner size=14 /> + ' Disconnecting...' : 'Disconnect'}
      </button>
    </div>
  </div>
</dialog>
```

**Confirmation dialog dimensions:**

| Property | Value |
|----------|-------|
| Max-width | `400px` |
| Background | `#FFFFFF` |
| Border | `1px solid #E5E7EB` |
| Border-radius | `0px` |
| Padding | `24px` |
| Box-shadow | `0 20px 60px rgba(0,0,0,0.15)` |

### Step 3 — Disconnect API Route

**File:** `app/api/integrations/[service]/route.ts`

```typescript
// DELETE /api/integrations/{service}
// Path params: service = 'github' | 'google' | 'linear' | 'toggl'
export async function DELETE(
  request: Request,
  { params }: { params: { service: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { service } = params;
  if (!['github', 'google', 'linear', 'toggl'].includes(service)) {
    return NextResponse.json({ error: 'Unknown service' }, { status: 400 });
  }

  const { data: membership } = await supabase
    .from('tenant_members')
    .select('tenant_id, role')
    .eq('user_id', session.user.id)
    .single();

  if (!membership || !['owner', 'admin'].includes(membership.role)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  // Delete via Edge Function (needs service role to delete Vault secrets)
  const deleteRes = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/delete-service-connection`,
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

  if (!deleteRes.ok) {
    return NextResponse.json({ error: 'Failed to disconnect service' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
```

**What the Edge Function does on disconnect:**

1. `SELECT id, vault_secret_id, refresh_vault_secret_id FROM tenant_service_connections WHERE tenant_id = $t AND service = $s`
2. `DELETE FROM vault.secrets WHERE id = $vault_secret_id`
3. If `refresh_vault_secret_id IS NOT NULL`: `DELETE FROM vault.secrets WHERE id = $refresh_vault_secret_id`
4. `UPDATE tenant_service_connections SET status = 'revoked', updated_at = NOW() WHERE tenant_id = $t AND service = $s`

---

## Toast Notifications

All success/error outcomes show a toast notification via the global `ToastProvider`.

| Trigger | Toast Type | Message |
|---------|-----------|---------|
| `?success=github` in URL | Success | "GitHub connected successfully." |
| `?success=google` in URL | Success | "Google connected successfully." |
| `?success=linear` in URL | Success | "Linear connected successfully." |
| API key modal: valid key saved | Success | "Toggl connected successfully." |
| `?error=invalid_state` in URL | Error | "Connection failed: security check failed. Please try again." |
| `?error=invalid_service` in URL | Error | "Unknown service. Please contact support." |
| `?error=unauthorized` in URL | Error | "You don't have permission to connect integrations." |
| `?error=missing_params` in URL | Error | "Connection failed: missing parameters. Please try again." |
| `?error={other}` in URL | Error | The decoded `error` string (max 100 chars) |
| Disconnect: success | Success | "{Service} disconnected." |
| Disconnect: API error | Error | "Could not disconnect {service}. Please try again." |
| API key validation: format error | Inline (modal) | "API token must be exactly 32 characters." or "API token may only contain lowercase letters and numbers." |
| API key validation: invalid | Inline (modal) | "Invalid API token. Please check and try again." |
| API key validation: network error | Inline (modal) | "Could not reach Toggl to validate. Please try again." |

**Toast component spec:**

| Property | Value |
|----------|-------|
| Position | Bottom-right, `fixed`, `z-50` |
| Margin from edge | `24px` |
| Background (success) | `#0C1F40` (Navy) |
| Background (error) | `#DC2626` (Red 600) |
| Background (info) | `#374151` (Gray 700) |
| Text color | `#FFFFFF` |
| Font | Inter Medium, 14px |
| Padding | `12px 16px` |
| Border-radius | `0px` |
| Max-width | `360px` |
| Auto-dismiss | 4000ms |
| Icon (success) | `CheckCircle` 16px, `#00D4B8` (Aqua) |
| Icon (error) | `XCircle` 16px, `#FCA5A5` (Red 300) |

---

## Real-Time Updates (Client-Side)

After the page mounts, a React hook subscribes to Supabase Realtime:

**File:** `hooks/useServiceConnectionsRealtime.ts`

```typescript
export function useServiceConnectionsRealtime(
  tenantId: string,
  onUpdate: (service: string, status: string, errorMessage: string | null) => void
) {
  useEffect(() => {
    const supabase = createClientComponentClient();

    const channel = supabase
      .channel(`tenant:service_connections:${tenantId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tenant_service_connections',
          filter: `tenant_id=eq.${tenantId}`,
        },
        (payload) => {
          const { service, status, error_message } = payload.new;
          onUpdate(service, status, error_message ?? null);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tenantId, onUpdate]);
}
```

When a service connection row is updated (e.g., bot marks GitHub as `expired`), the relevant card refreshes its status badge and shows the error banner without a page reload.

---

## Loading States

### Page-Level Loading

While the server component fetches data (initial load), Next.js shows `app/(dashboard)/integrations/loading.tsx`:

```typescript
export default function IntegrationsLoading() {
  return (
    <div class="page-content">
      <div class="page-header-skeleton">
        <Skeleton width={180} height={28} />
        <Skeleton width={480} height={16} style={{ marginTop: 8 }} />
      </div>
      <div class="service-grid">
        {[0, 1, 2, 3].map((i) => (
          <ServiceCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
```

### ServiceCardSkeleton

```html
<div class="service-card service-card--skeleton">
  <div class="card-header">
    <Skeleton width=40 height=40 />     <!-- logo placeholder -->
    <div>
      <Skeleton width=100 height=16 />   <!-- service name -->
      <Skeleton width=200 height=12 style={{ marginTop: 6 }} />  <!-- description -->
    </div>
    <Skeleton width=80 height=22 />      <!-- badge placeholder -->
  </div>
  <div class="card-footer" style={{ marginTop: 'auto' }}>
    <Skeleton width=120 height=36 />     <!-- button placeholder -->
  </div>
</div>
```

Skeleton animation: `animate-pulse` (Tailwind CSS). Background: `#E5E7EB` → `#F3F4F6` pulsing.

### Card-Level Loading (Connect action in progress)

When a user clicks "Connect" on an OAuth service and is about to be redirected:

- Button label changes to `<Spinner size=14 /> Redirecting...`
- Button is `disabled`
- Spinner color: `#FFFFFF` on Navy button background
- Duration: until redirect fires (usually <500ms) or times out at 5000ms with error toast

### API Key Modal Submit Loading

- "Save & Connect" button changes to `<Spinner size=14 /> Validating...`
- "Cancel" button is `disabled`
- All form inputs are `disabled`
- Duration: until server responds (Toggl validation is typically <1000ms)

### Disconnect Loading

- "Disconnect" button in the confirmation dialog shows `<Spinner size=14 /> Disconnecting...`
- "Cancel" button is `disabled`
- Duration: until server responds

---

## Empty State

If ALL four services are in `'revoked'` state (all disconnected), the service grid still shows all four cards but in their "Not Connected" state. There is no "empty state" for the grid — the grid always shows the full service catalog.

However, if there is a data fetch error at the page level (e.g., Supabase unreachable):

```html
<div class="error-state">
  <IconAlertTriangle size=40 color="#EF4444" />
  <h3>Couldn't load integrations</h3>
  <p>We had trouble fetching your service connections. Please refresh the page.</p>
  <button class="btn-secondary" onclick="window.location.reload()">Refresh</button>
</div>
```

---

## Error States

### Member Role (read-only)

When `userRole === 'member'`, all buttons are `disabled` with `cursor: not-allowed`. A tooltip appears on hover:

```html
<span class="tooltip" role="tooltip">
  Only owners and admins can manage integrations.
</span>
```

Tooltip implementation: wraps the disabled button in a `<div>` with `title` attribute. On desktop, the native browser tooltip is sufficient. On mobile (no hover), the tooltip is omitted.

### OAuth Error (query param `?error=...`)

The page reads the `error` query param on mount. If present, shows an error toast (see Toast Notifications above) and then removes the param from the URL with `router.replace('/dashboard/integrations')` to prevent re-showing on refresh.

### Service Status Errors

Cards with `status === 'error'` show:
- Red `3px` left border accent
- "Error" badge (red)
- Error banner with `error_message` (from DB) or service-specific default error text
- "Reconnect" button (not "Connect")

Cards with `status === 'expired'` show:
- Red `3px` left border accent
- "Expired" badge (amber)
- Error banner: "{Service} access has expired. Reconnect to restore tools."
- "Reconnect" button

---

## Responsive Behavior

### Desktop (≥1280px)

- Service grid: `2 columns`
- Page padding: `p-8` (32px all sides)
- Page header: full-width

### Tablet (768–1279px)

- Service grid: `2 columns`
- Page padding: `p-6` (24px all sides)

### Mobile (<768px)

- Service grid: `1 column`
- Page padding: `p-4` (16px all sides)
- Service card: full-width
- API key modal: full-screen (`position: fixed, inset: 0`) with `padding: 16px`
- Confirmation dialog: full-width, pinned to bottom (bottom sheet style)
  - Bottom sheet animation: `transform: translateY(0)` from `translateY(100%)`
  - Transition: `300ms ease-out`

---

## Accessibility

| Element | Requirement |
|---------|------------|
| Service grid | `role="list"`, each card has `role="listitem"` |
| Service card | `aria-label="{service} — {status}"` on the card `<div>` |
| Connect button | `aria-label="Connect {service name}"` |
| Disconnect button | `aria-label="Disconnect {service name}"` |
| Status badge | `role="status"`, `aria-live="polite"` (updates when Realtime fires) |
| API Key modal | `role="dialog"`, `aria-modal="true"`, `aria-labelledby="modal-title"` |
| Confirmation dialog | `role="alertdialog"`, `aria-modal="true"`, `aria-labelledby`, `aria-describedby` |
| Modal close button | `aria-label="Close"` |
| Password input | `type="password"`, `autocomplete="off"`, `aria-describedby` pointing to hint and error |
| Error messages | `role="alert"` or `aria-live="assertive"` when dynamically inserted |
| Spinner | `aria-hidden="true"` (decorative) + sibling visually-hidden text "Loading..." |
| Toast | `role="status"` for success; `role="alert"` for error |

**Keyboard navigation:**

| Action | Key |
|--------|-----|
| Navigate cards | `Tab` |
| Open API Key modal | `Enter` / `Space` on "Connect Toggl" button |
| Close modal | `Escape` |
| Submit API key form | `Enter` in input field |
| Close confirmation dialog | `Escape` or `Tab` to Cancel + `Enter` |
| Focus trap in modal | `Tab` cycles through focusable elements; `Shift+Tab` reverses |

**Focus management:**

- When API Key modal opens: focus moves to the `<input>` field.
- When modal closes (success or cancel): focus returns to the "Connect Toggl" button.
- When confirmation dialog opens: focus moves to the "Cancel" button (safe default).
- When confirmation dialog closes: focus returns to the "Disconnect" button.

---

## Supabase Edge Functions Required

Two Edge Functions are required for this page (they write Vault secrets and need service role):

### `upsert-service-connection`

**Purpose:** Creates or replaces a service connection row, storing credentials in Vault.

**Input:**

```typescript
{
  tenant_id: string;
  service: 'github' | 'google' | 'linear' | 'toggl';
  auth_type: 'oauth' | 'api_key';
  access_token: string;
  refresh_token: string | null;
  token_expires_at: string | null;  // ISO 8601
  scopes: string[];
  metadata: Record<string, unknown>;
  connected_by_user_id: string;
}
```

**Logic:**

1. Check if a row for `(tenant_id, service)` already exists.
2. If it exists: delete the old Vault secrets (`vault_secret_id`, `refresh_vault_secret_id`).
3. Store new access token via `vault.create_secret(access_token, 'service_{service}_{tenant_id}_access', '...')`. Returns `new_vault_secret_id`.
4. If `refresh_token` is not null: `vault.create_secret(refresh_token, ...)`. Returns `new_refresh_vault_secret_id`.
5. UPSERT the `tenant_service_connections` row with new vault IDs.

**Output:** `{ success: true, connection_id: string }`

### `delete-service-connection`

**Purpose:** Removes a service connection and deletes its Vault secrets.

**Input:**

```typescript
{
  tenant_id: string;
  service: 'github' | 'google' | 'linear' | 'toggl';
}
```

**Logic:**

1. `SELECT id, vault_secret_id, refresh_vault_secret_id FROM tenant_service_connections WHERE tenant_id = $t AND service = $s`
2. Delete `vault.secrets` rows for both vault IDs (if not null).
3. `UPDATE tenant_service_connections SET status = 'revoked', updated_at = NOW() WHERE id = $id`

**Output:** `{ success: true }`

---

## Security Notes

1. **Vault-only credential storage:** OAuth tokens and API keys are NEVER stored in plaintext anywhere in the database. All credential values go to `vault.secrets` immediately. The `tenant_service_connections` table only holds `vault_secret_id` references.

2. **Service role for Vault writes:** JWT user tokens cannot write to `vault.secrets`. All credential persistence goes through Edge Functions that use `SUPABASE_SERVICE_ROLE_KEY`. This is enforced by RLS on `tenant_api_keys` and `tenant_service_connections` (no INSERT/UPDATE policies for JWT users — see [../database/rls-policies.md](../database/rls-policies.md)).

3. **CSRF protection for OAuth:** The `state` parameter is a UUID generated per-request and stored in an `httpOnly; SameSite=Lax; Secure` cookie. The callback verifies the state matches before proceeding. State cookie expires in 10 minutes.

4. **Redirect URI validation:** The `redirect_uri` passed to OAuth providers is always `${NEXT_PUBLIC_APP_URL}/api/integrations/oauth/callback`. OAuth apps are configured at the provider (GitHub/Google/Linear) to only accept this URI. Any mismatch causes the provider to reject the request.

5. **Member-role enforcement:** The API routes check `membership.role` and return `403` if the user is a `'member'`. The UI also disables buttons for members, but server-side enforcement is the authoritative check.

6. **Token hints on client:** The client NEVER sees raw tokens. The only token-adjacent data returned to the client is metadata stored in the `metadata` JSONB column (e.g., `toggl_email`, GitHub login). Even this data is non-sensitive (no secret material).

---

## File Map

| File | Purpose |
|------|---------|
| `app/(dashboard)/integrations/page.tsx` | Server Component — fetches connections, renders `IntegrationsPageClient` |
| `app/(dashboard)/integrations/loading.tsx` | Skeleton loading UI |
| `app/(dashboard)/integrations/IntegrationsPageClient.tsx` | Client Component — manages real-time, modal state, toast |
| `app/api/integrations/oauth/start/route.ts` | Initiates OAuth flow |
| `app/api/integrations/oauth/callback/route.ts` | Handles OAuth callback, exchanges code, calls Edge Function |
| `app/api/integrations/api-key/validate/route.ts` | Validates Toggl API key, calls Edge Function |
| `app/api/integrations/[service]/route.ts` | DELETE handler for disconnect |
| `components/integrations/ServiceGrid.tsx` | Grid container |
| `components/integrations/ServiceCard.tsx` | Individual service card |
| `components/integrations/ApiKeyModal.tsx` | Toggl API key input modal |
| `components/ui/ConfirmDialog.tsx` | Reusable confirmation dialog |
| `components/ui/StatusBadge.tsx` | Status badge (connected/expired/error/not-connected) |
| `hooks/useServiceConnectionsRealtime.ts` | Supabase Realtime subscription hook |
| `lib/integrations/oauth.ts` | `buildAuthorizationUrl()`, `exchangeCodeForTokens()` |
| `supabase/functions/upsert-service-connection/index.ts` | Edge Function: write credentials to Vault, upsert row |
| `supabase/functions/delete-service-connection/index.ts` | Edge Function: delete Vault secrets, update row status |

---

## Cross-References

- Database tables: [../database/schema.md](../database/schema.md#tenant_service_connections)
- RLS policies: [../database/rls-policies.md](../database/rls-policies.md#tenant_service_connections)
- Vault encryption: [../database/vault-encryption.md](../database/vault-encryption.md)
- Realtime channel: [../multi-tenant/realtime-contract.md](../multi-tenant/realtime-contract.md)
- OAuth service details (scopes, token refresh, error handling): [../integrations/oauth-services.md](../integrations/oauth-services.md)
- API key service details (Toggl format, validation): [../integrations/api-key-services.md](../integrations/api-key-services.md)
- Design system tokens (colors, typography): [../ui/design-system.md](../ui/design-system.md)
- Component library: [./component-library.md](./component-library.md)
