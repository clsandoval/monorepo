# API Auth — Supabase Auth Session Management

> Aspect: 8.1.4 — Supabase Auth session management: middleware spec, getUser vs getSession distinction, createClient patterns, JWT claims, session refresh, server action auth guard
> Written: 2026-03-13
> Related: [../source/existing-auth.md](../source/existing-auth.md), [./routes.md](./routes.md), [./rate-limiting.md](./rate-limiting.md), [../frontend/auth-pages.md](../frontend/auth-pages.md), [../database/schema.md](../database/schema.md), [../database/rls-policies.md](../database/rls-policies.md)

---

## Overview

Daimon uses **Supabase Auth** for all website authentication. The integration uses the `@supabase/ssr` package (v0.5+) which provides first-class Next.js App Router support: session tokens are stored as secure httpOnly cookies and refreshed automatically via middleware.

**Packages required:**
```json
{
  "@supabase/supabase-js": "^2.43.0",
  "@supabase/ssr": "^0.5.0"
}
```

**Auth strategy:** Email/password only at launch. No social OAuth for platform login. No magic links at launch.

---

## 1. Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL | `https://abcdefghijkl.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase publishable anon key | `eyJhbGci...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (server only, never expose to browser) | `eyJhbGci...` |

These three variables power all Supabase client creation. The anon key is safe to expose to the browser. The service role key must NEVER be used in client-side code.

---

## 2. Client Creation Patterns

There are four distinct Supabase client creation patterns used in the Daimon Next.js app. Each is appropriate for a specific context. Using the wrong client is a security or correctness bug.

### 2.1 Browser Client (Client Components)

**File:** `lib/supabase/client.ts`

**When to use:** Inside `"use client"` components — typically for interactive auth forms (login, signup, password reset) and real-time subscriptions.

**Implementation:**
```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase';

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

**Session behavior:** Reads and writes session cookies automatically. The browser client keeps the session in sync with the server via cookie reads. Use `supabase.auth.onAuthStateChange()` in client components to react to login/logout events.

**RLS:** Requests use the session's JWT. RLS policies using `auth.uid()` will work correctly with the logged-in user's identity.

**DO NOT use for:** Server Components, Route Handlers, Server Actions. The browser client cannot access httpOnly cookies from the server.

---

### 2.2 Server Client (Server Components, Route Handlers, Server Actions)

**File:** `lib/supabase/server.ts`

**When to use:** In Server Components, API Route Handlers (`route.ts`), and Server Actions. This is the most commonly used pattern for data fetching.

**Implementation:**
```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';

export function createClient() {
  const cookieStore = cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Server Components cannot set cookies — ignore; middleware handles refresh
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch {
            // Same — middleware handles
          }
        },
      },
    }
  );
}
```

**Session behavior:** Reads session JWT from httpOnly cookies. Can read cookies in Route Handlers and Server Actions. Server Components can read cookies but not set them — the `try/catch` above is intentional and required; the `@supabase/ssr` docs recommend this exact pattern.

**RLS:** Requests use the session JWT. `auth.uid()` in RLS policies will return the logged-in user's ID.

**DO NOT use for:** Admin operations requiring elevated privileges (use Service Role client instead).

---

### 2.3 Middleware Client

**File:** `middleware.ts` (root of Next.js app)

**When to use:** Exclusively inside the Next.js `middleware()` function. Handles session refresh before every request.

**Implementation:**
```typescript
// middleware.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  // IMPORTANT: Use getUser() not getSession() here — see Section 3
  const { data: { user } } = await supabase.auth.getUser();

  // Route protection logic — see Section 5
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/login';
      redirectUrl.searchParams.set('next', request.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Check admin status — requires DB query
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('is_admin')
      .eq('user_id', user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Redirect authenticated users away from auth pages
  if (user && (
    request.nextUrl.pathname === '/login' ||
    request.nextUrl.pathname === '/signup' ||
    request.nextUrl.pathname === '/reset-password'
  )) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    // Run on all routes except static assets, _next, and public files
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

**Critical:** The middleware MUST run on every request (not just protected routes) so that session cookies are refreshed before they expire. The broad `matcher` above achieves this. Narrowing the matcher to only `/dashboard/**` will cause session expiry bugs.

---

### 2.4 Service Role Client (Privileged Server Operations)

**File:** `lib/supabase/service-role.ts`

**When to use:** Admin-only API routes (`/api/admin/**`), Stripe webhook handler, post-signup tenant creation, any operation that requires bypassing RLS. NEVER in browser code or Server Components that handle user requests.

**Implementation:**
```typescript
// lib/supabase/service-role.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

export function createServiceRoleClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
```

**Session behavior:** No session. All requests use the service role key. All RLS policies are bypassed. Has full read/write access to all tables including `vault.secrets`.

**RLS:** Bypassed entirely. `auth.uid()` returns null in SQL context when using service role.

**Security rules:**
1. The `SUPABASE_SERVICE_ROLE_KEY` env var must NEVER appear in any `NEXT_PUBLIC_*` variable.
2. Service role client must NEVER be instantiated in `"use client"` components.
3. Never log or return the service role key in any response.
4. API routes using service role MUST verify the caller's identity via the anon/server client FIRST, then use service role to perform privileged operations.

**Usage example (admin route pattern):**
```typescript
// app/api/admin/tenants/[id]/suspend/route.ts
import { createClient as createAnonClient } from '@/lib/supabase/server';
import { createServiceRoleClient } from '@/lib/supabase/service-role';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  // Step 1: Verify caller identity with anon client + RLS
  const anonClient = createAnonClient();
  const { data: { user }, error } = await anonClient.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  // Step 2: Verify admin status
  const { data: profile } = await anonClient
    .from('user_profiles')
    .select('is_admin')
    .eq('user_id', user.id)
    .single();
  if (!profile?.is_admin) {
    return NextResponse.json({ error: 'Insufficient permissions.' }, { status: 403 });
  }

  // Step 3: Perform privileged operation with service role
  const adminClient = createServiceRoleClient();
  await adminClient
    .from('tenants')
    .update({ status: 'suspended' })
    .eq('id', params.id);

  return NextResponse.json({ success: true });
}
```

---

## 3. getUser() vs getSession() — Critical Distinction

This is the single most important auth correctness rule in the codebase.

### getSession() — DO NOT use for authorization decisions

```typescript
// ❌ WRONG — never use getSession() to check if user is authenticated
const { data: { session } } = await supabase.auth.getSession();
if (!session) { /* unauthorized? NOT RELIABLE */ }
```

**Why getSession() is unsafe for auth checks:** `getSession()` reads the JWT from the cookie WITHOUT re-validating it with the Supabase Auth server. A tampered or replayed token will pass this check. `getSession()` is appropriate ONLY for reading session metadata on the client side (e.g., checking expiry to show a warning UI). Never use it to gate access to resources.

### getUser() — ALWAYS use for authorization decisions

```typescript
// ✅ CORRECT — always use getUser() for authorization
const { data: { user }, error } = await supabase.auth.getUser();
if (error || !user) { /* unauthorized — trust this */ }
```

**Why getUser() is safe:** `getUser()` sends the JWT to the Supabase Auth server for verification. The server validates the signature, expiry, and revocation status. A tampered or revoked token will cause `getUser()` to return `null`.

**Performance note:** `getUser()` makes a network call to the Supabase Auth server on every invocation. In Server Components and Route Handlers, this is a single additional round-trip per request. Cache the result within a single request via a helper:

```typescript
// lib/auth/getAuthUser.ts
// Cache the user within a single request using React cache()
import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';

export const getAuthUser = cache(async () => {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
});
```

**Summary table:**

| Method | Validates with server | Use for auth decisions | Use for |
|--------|----------------------|----------------------|---------|
| `getSession()` | No | ❌ Never | Client-side session expiry UI only |
| `getUser()` | Yes | ✅ Always | All auth gates, middleware, route handlers |

---

## 4. JWT Claims

Supabase Auth JWTs use the standard HS256 algorithm signed with the project's JWT secret.

### Standard Claims

| Claim | Type | Description |
|-------|------|-------------|
| `sub` | string (UUID) | Supabase Auth user ID — same as `auth.users.id` |
| `email` | string | User's email address |
| `role` | string | Always `"authenticated"` for logged-in users |
| `aud` | string | Always `"authenticated"` |
| `iss` | string | Supabase project URL + `/auth/v1` |
| `exp` | number | Expiry Unix timestamp (default: issued_at + 3600 seconds) |
| `iat` | number | Issued-at Unix timestamp |
| `session_id` | string (UUID) | Session identifier — matches `auth.sessions.id` |

### App Metadata Claims

Supabase adds app metadata into the JWT. These are set by the Auth Admin API or via triggers:

| Claim path | Type | Description |
|-----------|------|-------------|
| `app_metadata.provider` | string | Always `"email"` for email/password auth |
| `app_metadata.providers` | string[] | Always `["email"]` |
| `user_metadata.display_name` | string | User's chosen display name (set during signup) |
| `user_metadata.full_name` | string | Optional full name |

### Custom Claims (Daimon-Specific)

Daimon does NOT add custom claims to the JWT at launch. Admin status is checked via database query against `user_profiles.is_admin` rather than a JWT claim. Rationale: JWT claims are cached until token expiry; if admin status is revoked, the user would retain admin access for up to 1 hour. Database check is authoritative.

**Future consideration:** If performance becomes an issue, add `is_admin` as a custom claim via a Supabase Auth Hook (Database Webhook → Edge Function that updates `app_metadata`). This would allow middleware to check claims without a DB query. Not implemented at launch.

### Reading JWT in RLS Policies

Supabase exposes JWT claims to SQL via these functions:

```sql
-- Get current user's Supabase Auth user ID
auth.uid()                          -- returns UUID

-- Get raw JWT claims
auth.jwt()                          -- returns JSONB, e.g.: {"sub":"uuid","email":"...","role":"authenticated",...}

-- Get user's email from JWT
auth.jwt()->>'email'                -- returns TEXT

-- Get user's role from JWT
auth.jwt()->>'role'                 -- returns TEXT ('authenticated' or 'anon')
```

All RLS policies in Daimon use `auth.uid()` to scope rows to the current user. See [../database/rls-policies.md](../database/rls-policies.md).

---

## 5. Middleware Route Protection

The Next.js middleware (`middleware.ts`) runs before every request and enforces route-level access control.

### Protected Route Groups

| Route Pattern | Protection | Redirect if unauthorized |
|--------------|-----------|--------------------------|
| `/dashboard/**` | Must be authenticated | `/login?next=<original-path>` |
| `/admin/**` | Must be authenticated AND `user_profiles.is_admin = true` | `/login` (not auth) or `/dashboard` (not admin) |
| `/login`, `/signup`, `/reset-password` | Must NOT be authenticated | `/dashboard` |
| `/api/auth/callback` | Public | N/A |
| `/api/stripe/webhook` | Stripe signature (not Supabase auth) | N/A |
| All other routes | Public | N/A |

### `next` Parameter Behavior

When the middleware redirects an unauthenticated user from a protected page, it preserves the intended destination:

```
User visits: /dashboard/integrations
Middleware redirects: /login?next=%2Fdashboard%2Fintegrations
After login: redirect to /dashboard/integrations (not default /dashboard)
```

**Implementation in login Server Action:**
```typescript
// app/(auth)/login/actions.ts
'use server'
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function signInAction(formData: FormData) {
  const supabase = createClient();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const next = formData.get('next') as string || '/dashboard';

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Return error to client via URL params or state
    return { error: mapAuthError(error.message) };
  }

  // Safe redirect — only allow relative paths
  const safeNext = next.startsWith('/') ? next : '/dashboard';
  redirect(safeNext);
}
```

**Security note:** The `next` parameter MUST be validated to be a relative path before redirecting. Never redirect to an absolute URL from `next` parameter — this prevents open redirect attacks. The `safeNext` check above (`.startsWith('/')`) enforces this.

---

## 6. Session Lifecycle and Refresh

### Token Expiry

| Token | Expiry | Storage |
|-------|--------|---------|
| Access token (JWT) | 3600 seconds (1 hour) — Supabase default | httpOnly cookie `sb-{project-ref}-auth-token` |
| Refresh token | 7 days (Supabase default) | httpOnly cookie `sb-{project-ref}-auth-token-code-verifier` — NOTE: `@supabase/ssr` may use a different cookie name scheme |

**Actual cookie names:** Supabase `@supabase/ssr` stores session data in one or more cookies whose names are derived from the project reference. The exact names are:
- `sb-{project-ref}-auth-token.0` — chunk 0 of the base64-encoded JSON session
- `sb-{project-ref}-auth-token.1` — chunk 1 (if session JSON exceeds cookie size limit)

Where `{project-ref}` is the portion of `NEXT_PUBLIC_SUPABASE_URL` between `https://` and `.supabase.co`.

### Automatic Refresh via Middleware

The middleware runs `supabase.auth.getUser()` on every request. This call:
1. Reads the current JWT from the cookie
2. If the JWT is expired but the refresh token is valid: calls Supabase Auth API to get a new JWT
3. The new JWT is written to the response cookies by the middleware client's `set()` cookie handler
4. The request proceeds with the fresh session

**Result:** Users stay logged in for up to 7 days without re-authenticating, as long as they make at least one request before the refresh token expires.

### Session Expiry Handling

| Scenario | Token State | User Experience |
|----------|------------|-----------------|
| Active user, JWT expired | Refresh token valid | Middleware auto-refreshes. User sees no interruption. |
| Inactive user, refresh token expired (7+ days) | Both expired | Next request → middleware redirect to `/login?next=<path>`. User must re-authenticate. |
| User signs out | Both invalidated | Cookies cleared. Any subsequent request → redirect to `/login`. |
| Admin revokes session | Access token invalid at Supabase server | `getUser()` returns error → next request → redirect to `/login`. |
| Password changed | Existing sessions invalidated by Supabase | Same as above. |

### Session Expiry Mid-Action

If a session expires while a user is in the middle of a form submission or action:

1. Route Handler calls `getUser()` → returns `null`
2. Route Handler returns `401 { "error": "Authentication required." }`
3. Client receives 401
4. Client shows toast: **"Your session has expired. Please log in again."** with a "Log In" button that navigates to `/login?next=<current-path>`
5. After re-authentication, user is returned to their current page

**Client-side 401 handler** (shared utility):
```typescript
// lib/api/fetchWithAuth.ts
export async function fetchWithAuth(url: string, options?: RequestInit) {
  const response = await fetch(url, options);

  if (response.status === 401) {
    // Dispatch global event — layout catches and shows toast
    window.dispatchEvent(new CustomEvent('auth:session-expired'));
    throw new Error('Session expired');
  }

  return response;
}
```

**Global 401 listener** (in `app/(dashboard)/layout.tsx` client component):
```typescript
useEffect(() => {
  const handler = () => {
    toast.error('Your session has expired. Please log in again.', {
      action: { label: 'Log In', onClick: () => router.push('/login?next=' + window.location.pathname) },
    });
  };
  window.addEventListener('auth:session-expired', handler);
  return () => window.removeEventListener('auth:session-expired', handler);
}, [router]);
```

---

## 7. Auth Callback Route

**File:** `app/api/auth/callback/route.ts`

Used exclusively for Supabase Auth PKCE flow completion. Supabase email confirmation links and password reset links redirect here.

**Method:** GET

**Query parameters:**
| Parameter | Description |
|-----------|-------------|
| `code` | Authorization code from Supabase Auth email link |
| `next` | Optional redirect path after code exchange (default: `/dashboard`) |

**Implementation:**
```typescript
// app/api/auth/callback/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name) { return cookieStore.get(name)?.value; },
          set(name, value, options) { cookieStore.set({ name, value, ...options }); },
          remove(name, options) { cookieStore.set({ name, value: '', ...options }); },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Validate next is a safe relative path
      const safeNext = next.startsWith('/') ? next : '/dashboard';
      return NextResponse.redirect(`${origin}${safeNext}`);
    }
  }

  // Auth code exchange failed — redirect to error page
  return NextResponse.redirect(`${origin}/auth/error?error=code_exchange_failed`);
}
```

**Trigger points:**
- Email confirmation after signup (Supabase sends confirmation email with link to this route)
- Password reset email (Supabase sends reset email with link to this route, `next=/reset-password/confirm`)

**Note:** The password reset link uses `next=/reset-password/confirm` so after code exchange the user lands on the new-password form, not the dashboard.

---

## 8. Sign-Out Route

**File:** `app/api/auth/sign-out/route.ts`

**Method:** POST

**Auth required:** Yes (Supabase session)

**Request:** No body required. Session is read from cookie.

**Response:**
- `200 OK` — Session cleared, redirect header set
- `303 See Other` — Location: `/login`

**Implementation:**
```typescript
// app/api/auth/sign-out/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST() {
  const supabase = createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_SITE_URL!), {
    status: 303,
  });
}
```

**Sign-out button implementation (Client Component):**
```typescript
// components/SignOutButton.tsx
'use client'
export function SignOutButton() {
  return (
    <form action="/api/auth/sign-out" method="post">
      <button type="submit">Sign out</button>
    </form>
  );
}
```

Using a `<form>` POST ensures the sign-out works even if JavaScript is disabled. Supabase `signOut()` both invalidates the server-side session and clears the local cookies.

---

## 9. Server Action Auth Guard

Server Actions in Next.js App Router run on the server but are triggered from client components. They do NOT automatically inherit middleware auth protections. Every Server Action that requires authentication MUST implement its own auth guard.

### Pattern: Server Action Auth Guard

```typescript
// lib/auth/requireAuth.ts
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function requireAuth() {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    redirect('/login');
  }
  return user;
}

export async function requireTenantMember() {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    redirect('/login');
  }

  const { data: membership } = await supabase
    .from('tenant_members')
    .select('tenant_id, role')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .single();

  if (!membership) {
    // User has no tenant — send to onboarding
    redirect('/onboarding');
  }

  return {
    user,
    tenantId: membership.tenant_id,
    role: membership.role as 'owner' | 'admin' | 'member',
  };
}

export async function requireTenantOwner() {
  const { user, tenantId, role } = await requireTenantMember();
  if (role !== 'owner') {
    redirect('/dashboard?error=insufficient_permissions');
  }
  return { user, tenantId };
}

export async function requireAdmin() {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('is_admin')
    .eq('user_id', user.id)
    .single();

  if (!profile?.is_admin) {
    redirect('/dashboard');
  }

  return user;
}
```

**Usage in Server Actions:**
```typescript
// app/(dashboard)/settings/actions.ts
'use server'
import { requireTenantMember, requireTenantOwner } from '@/lib/auth/requireAuth';
import { createClient } from '@/lib/supabase/server';

// Any member can update display name
export async function updateDisplayName(formData: FormData) {
  const { user } = await requireTenantMember();
  const displayName = formData.get('display_name') as string;

  const supabase = createClient();
  await supabase.auth.updateUser({
    data: { display_name: displayName },
  });
}

// Only owner can delete workspace
export async function deleteWorkspace(formData: FormData) {
  const { tenantId } = await requireTenantOwner();
  // ... deletion logic
}
```

**Rule:** Every Server Action that writes data or reads sensitive information MUST call one of the `require*` guards as its FIRST operation. No exceptions.

---

## 10. Route Handler Auth Guard

Route Handlers (`route.ts` files) follow the same pattern but return JSON errors instead of redirecting.

### Pattern: Route Handler Auth Guard

**File:** `lib/api/withTenantAuth.ts`

```typescript
// lib/api/withTenantAuth.ts
import { createClient } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';

export type TenantContext = {
  user: { id: string; email: string };
  tenantId: string;
  role: 'owner' | 'admin' | 'member';
};

export async function getTenantContext(req: NextRequest): Promise<TenantContext | null> {
  const supabase = createClient();

  // ALWAYS use getUser() — never getSession()
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;

  const { data: membership } = await supabase
    .from('tenant_members')
    .select('tenant_id, role')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .single();

  if (!membership) return null;

  return {
    user: { id: user.id, email: user.email ?? '' },
    tenantId: membership.tenant_id,
    role: membership.role as 'owner' | 'admin' | 'member',
  };
}

// Role check helpers
export function isOwnerOrAdmin(role: TenantContext['role']): boolean {
  return role === 'owner' || role === 'admin';
}

export function isOwner(role: TenantContext['role']): boolean {
  return role === 'owner';
}
```

**Usage in Route Handlers:**
```typescript
// app/api/discord-connections/route.ts
import { getTenantContext, isOwnerOrAdmin } from '@/lib/api/withTenantAuth';

export async function POST(req: NextRequest) {
  const ctx = await getTenantContext(req);
  if (!ctx) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }
  if (!isOwnerOrAdmin(ctx.role)) {
    return NextResponse.json({ error: 'Insufficient permissions.' }, { status: 403 });
  }

  // ... handler logic using ctx.tenantId
}
```

---

## 11. Post-Signup Tenant Creation

When a new user signs up, a tenant must be created automatically. This is implemented as a Supabase Database Webhook (trigger → Edge Function) or as a Server Action immediately after `signUp()`.

### Recommended Approach: Server Action (Not DB Trigger)

Using a Server Action avoids Edge Function complexity and keeps the logic in the Next.js codebase.

**File:** `app/(auth)/signup/actions.ts`

```typescript
'use server'
import { createClient } from '@/lib/supabase/server';
import { createServiceRoleClient } from '@/lib/supabase/service-role';
import { redirect } from 'next/navigation';

export async function signUpAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const workspaceName = formData.get('workspace_name') as string;

  const supabase = createClient();

  // Step 1: Create Supabase Auth user
  const { data: { user }, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: email.split('@')[0] }, // default display name
    },
  });

  if (signUpError || !user) {
    return { error: mapSignUpError(signUpError?.message ?? 'Unknown error') };
  }

  // Step 2: Create tenant + member (requires service role to bypass RLS on tenants table)
  const adminClient = createServiceRoleClient();

  const { data: tenant, error: tenantError } = await adminClient
    .from('tenants')
    .insert({
      name: workspaceName || `${email.split('@')[0]}'s Workspace`,
      owner_id: user.id,
      plan: 'free',
      status: 'active',
    })
    .select('id')
    .single();

  if (tenantError || !tenant) {
    // Rollback: delete the auth user to avoid orphaned accounts
    await adminClient.auth.admin.deleteUser(user.id);
    return { error: 'Failed to create workspace. Please try again.' };
  }

  await adminClient
    .from('tenant_members')
    .insert({
      tenant_id: tenant.id,
      user_id: user.id,
      role: 'owner',
    });

  // Step 3: Redirect to dashboard (email confirmation may be required)
  // If Supabase email confirmation is enabled, user gets a confirmation email
  // and is redirected to /signup/confirm-email to await confirmation
  if (!user.confirmed_at) {
    redirect('/signup/confirm-email?email=' + encodeURIComponent(email));
  }

  redirect('/dashboard');
}

function mapSignUpError(message: string): string {
  if (message.includes('already registered')) {
    return 'An account with this email already exists. Try signing in instead.';
  }
  if (message.includes('password')) {
    return 'Password must be at least 8 characters.';
  }
  return 'Sign up failed. Please try again.';
}
```

**Atomicity note:** If tenant creation fails after auth user creation, the code rolls back by deleting the auth user. This prevents orphaned `auth.users` rows with no associated tenant.

---

## 12. Auth Error Message Mapping

All Supabase Auth errors must be translated to user-friendly messages. Raw Supabase error messages (e.g., "Invalid login credentials") are acceptable but must be supplemented with actionable guidance.

### Sign-In Errors

| Supabase Error | User-Facing Message |
|---------------|---------------------|
| `Invalid login credentials` | "Invalid email or password. Please try again." |
| `Email not confirmed` | "Please check your email and click the confirmation link before signing in." |
| `Too many requests` | "Too many login attempts. Please wait 15 minutes and try again." |
| `User not found` | "Invalid email or password. Please try again." (same as credentials error — do NOT reveal whether email exists) |
| `Network request failed` | "Unable to connect. Please check your internet connection and try again." |
| Any other error | "Sign-in failed. Please try again. If the problem persists, contact support@daimon.ai." |

### Sign-Up Errors

| Supabase Error | User-Facing Message |
|---------------|---------------------|
| `User already registered` | "An account with this email already exists. Sign in instead?" (with link to /login) |
| `Password should be at least 6 characters` | "Password must be at least 8 characters." |
| `Signup requires a valid password` | "Please enter a valid password." |
| `Too many requests` | "Too many sign-up attempts. Please wait and try again." |
| Any other error | "Sign-up failed. Please try again." |

### Password Reset Errors

| Supabase Error | User-Facing Message |
|---------------|---------------------|
| `Email rate limit exceeded` | "A reset email was recently sent. Please check your inbox or wait a few minutes before requesting another." |
| `User not found` | Do NOT reveal whether email exists. Show: "If an account with this email exists, you'll receive a reset link shortly." |
| Token expired (on confirm page) | "This reset link has expired. Please request a new one." |
| Token already used | "This reset link has already been used. Request a new one if needed." |

---

## 13. Admin Impersonation Auth Flow

Admin impersonation allows an admin user to view the dashboard as a tenant user for support purposes. This is read-only from the admin's perspective.

### Flow

```
1. Admin navigates to /admin/tenants/[id]
2. Admin clicks "Impersonate" button
3. POST /api/admin/tenants/[id]/impersonate (Admin JWT claim required)
4. Server:
   a. Verifies caller is admin (via user_profiles.is_admin)
   b. Looks up tenant owner user_id from tenant_members WHERE role='owner'
   c. Creates admin impersonation token via Supabase Admin API:
      supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email: targetUserEmail,
        options: { redirectTo: '/dashboard' }
      })
      — OR —
      Use exchange session for service role if Supabase supports it
   d. Inserts row into admin_impersonation_sessions:
      { admin_user_id: adminUser.id, target_user_id: targetUser.id }
   e. Logs to admin_audit_log:
      { admin_user_id, action: 'impersonate', target_tenant_id, metadata: { target_user_id } }
5. Admin's browser receives a one-time impersonation link
6. Admin opens link → session is set as target user
7. Admin sees /dashboard as if they were the target user
8. All mutations during impersonation are BLOCKED (read-only enforcement in UI)
9. "End Impersonation" button:
   - POST /api/admin/impersonation/end
   - Server deletes admin_impersonation_sessions row
   - Server calls supabase.auth.signOut()
   - Admin is redirected to /admin
```

**Read-only enforcement:** The impersonation session in `admin_impersonation_sessions` is checked by write-path Server Actions. If the active user's `user_id` matches any `target_user_id` in `admin_impersonation_sessions`, all mutation actions return an error: "This action is not available during admin impersonation."

**Audit log entry structure:**
```typescript
{
  id: UUID,
  admin_user_id: UUID,          // The admin performing the action
  action: 'impersonate',        // Action type
  target_tenant_id: UUID,       // The tenant being impersonated
  metadata: {
    target_user_id: UUID,       // The specific user account
  },
  created_at: TIMESTAMPTZ,
}
```

---

## 14. Auth-Related Supabase Configuration

These settings must be configured in the Supabase Dashboard → Authentication → Settings:

| Setting | Value | Reason |
|---------|-------|--------|
| Email confirmations | Enabled | Verify email ownership before granting access |
| Secure email change | Enabled | Require confirmation to old email when changing email |
| Password minimum length | 8 characters | Enforce reasonable password security |
| Password requirements | Lowercase + uppercase + number | Enforce password strength |
| Rate limiting: signup | 5 per hour per IP | Prevent abuse |
| Rate limiting: send email | 3 per hour per user | Prevent email flooding |
| JWT expiry | 3600 seconds (1 hour) | Standard; balanced between security and UX |
| Refresh token expiry | 604800 seconds (7 days) | Keep users logged in for a week of inactivity |
| Refresh token rotation | Enabled | Invalidate old refresh tokens on use |
| Email template: Confirm signup | Custom (see below) | Branded email |
| Email template: Reset password | Custom (see below) | Branded email |
| Redirect URLs (allowlist) | `https://daimon.ai/**`, `https://*.daimon.ai/**`, `http://localhost:3000/**` | PKCE callback security |

### Email Templates

**Confirm Signup (subject):** `Confirm your Daimon account`

**Confirm Signup (body):**
```
Welcome to Daimon!

Please confirm your email address to activate your account.

[Confirm my email] → {{ .ConfirmationURL }}

If you didn't create a Daimon account, you can safely ignore this email.

— The Daimon Team
```

**Reset Password (subject):** `Reset your Daimon password`

**Reset Password (body):**
```
We received a request to reset your Daimon password.

[Reset my password] → {{ .ConfirmationURL }}

This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email.

— The Daimon Team
```

---

## 15. TypeScript Types

**File:** `types/supabase.ts`

This file is auto-generated by the Supabase CLI and should not be manually edited:
```bash
npx supabase gen types typescript --project-id <project-id> > types/supabase.ts
```

**File:** `types/auth.ts` — manually maintained auth types:

```typescript
// types/auth.ts

export type UserRole = 'owner' | 'admin' | 'member';

export type TenantMembership = {
  tenant_id: string;
  role: UserRole;
  tenants: {
    id: string;
    name: string;
    plan: 'free' | 'starter' | 'pro';
    status: 'active' | 'suspended' | 'deleted';
  };
};

export type AuthUser = {
  id: string;
  email: string;
  user_metadata: {
    display_name?: string;
    full_name?: string;
  };
};

export type TenantAuthContext = {
  user: AuthUser;
  tenantId: string;
  role: UserRole;
};
```
