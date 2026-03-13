# API Rate Limiting — Daimon SaaS

> Aspect: 8.1.6 — Rate limits per endpoint, error responses, retry-after headers
> Written: 2026-03-13
> Related: [./routes.md](./routes.md), [./auth.md](./auth.md), [../deployment/environment.md](../deployment/environment.md), [../deployment/infrastructure.md](../deployment/infrastructure.md)

---

## Overview

Daimon uses a two-layer rate limiting strategy:

1. **Supabase Auth built-in limits** — Applied automatically by Supabase to all `/auth/v1/*` endpoints. Configured in Supabase Dashboard → Auth → Rate Limits. No code required.
2. **Custom middleware limits** — Applied in Next.js Edge Middleware (`middleware.ts`) using **Upstash Redis** + `@upstash/ratelimit`. Covers all `/api/*` routes.

---

## Layer 1: Supabase Auth Built-In Rate Limits

These limits are enforced by Supabase before requests reach the Next.js application. They cannot be bypassed. Configure in **Supabase Dashboard → Authentication → Rate Limits**.

### Supabase Auth Limits (configure to these exact values)

| Limit Type | Supabase Setting Name | Value to Set | Per | Notes |
|------------|----------------------|-------------|-----|-------|
| Sign-up confirmation emails | `MAX_CONFIRMED_SIGNUPS_PER_HOUR` | 30 | IP per hour | Prevents email-bombing abuse |
| OTP / Magic Link sends | `MAX_OTP_PER_HOUR` | 10 | IP per hour | Applies to `signInWithOtp` |
| Password reset emails | `MAX_PASSWORD_RESETS_PER_HOUR` | 6 | IP per hour | Generous for legit users |
| Anonymous sign-ins | `MAX_ANONYMOUS_USERS_PER_HOUR` | 5 | IP per hour | Not used; set low |
| Token refreshes | `MAX_TOKEN_REFRESHES_PER_HOUR` | 600 | User per hour | 1 refresh/6s sustained |
| New users per hour | `MAX_CONFIRMED_SIGNUPS_PER_HOUR` | 30 | IP per hour | Global signup rate cap |

### Supabase Auth Error Response

When Supabase Auth rate limit is exceeded, Supabase returns:

```http
HTTP/1.1 429 Too Many Requests
Content-Type: application/json

{
  "code": 429,
  "error_code": "over_request_rate_limit",
  "message": "Request rate limit reached for authentication endpoint"
}
```

The Supabase client SDK surfaces this as an `AuthError` with `status: 429`. The frontend must catch this and display:
- Toast: "Too many attempts. Please wait a moment and try again."
- Disable the submit button for 60 seconds after a 429 response on auth forms.

---

## Layer 2: Custom API Rate Limits (Upstash Redis)

### Dependencies

```json
{
  "@upstash/ratelimit": "^2.0.0",
  "@upstash/redis": "^1.31.0"
}
```

### Environment Variables Required

| Variable | Description | Example |
|----------|-------------|---------|
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST endpoint | `https://us1-xxx.upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token | `AX...` |

See [../deployment/environment.md](../deployment/environment.md) for full env var spec.

### Rate Limiter Initialization

File: `lib/rate-limit.ts`

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// --- Named rate limiters (one per tier) ---

// Tier A: Strict — sensitive operations (token validation, auth admin actions)
// 5 requests per 60-second sliding window
export const strictLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '60 s'),
  prefix: 'rl:strict',
  analytics: false,
});

// Tier B: Moderate — OAuth flows, billing operations
// 10 requests per 60-second sliding window
export const moderateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '60 s'),
  prefix: 'rl:moderate',
  analytics: false,
});

// Tier C: Standard — general authenticated CRUD
// 60 requests per 60-second sliding window
export const standardLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, '60 s'),
  prefix: 'rl:standard',
  analytics: false,
});

// Tier D: Admin — admin panel operations
// 30 requests per 60-second sliding window per admin user
export const adminLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, '60 s'),
  prefix: 'rl:admin',
  analytics: false,
});

// Tier E: Webhook — Stripe webhooks (no per-IP limit; Stripe IPs are allowlisted)
// 200 requests per 10-second window globally (covers Stripe burst delivery)
export const webhookLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(200, '10 s'),
  prefix: 'rl:webhook',
  analytics: false,
});

// Helper: build identifier key
// For authenticated routes: use user ID (not IP, to prevent proxy bypass)
// For unauthenticated routes: use IP
export function getRateLimitKey(prefix: string, identifier: string): string {
  return `${prefix}:${identifier}`;
}
```

### Middleware Integration

File: `middleware.ts` (Next.js root)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import {
  strictLimiter,
  moderateLimiter,
  standardLimiter,
  adminLimiter,
  webhookLimiter,
} from '@/lib/rate-limit';

// Route → limiter tier mapping
// Key: route prefix (matched with startsWith or exact path)
// Value: which limiter + identifier source
const RATE_LIMIT_CONFIG: Array<{
  matcher: (pathname: string, method: string) => boolean;
  limiter: typeof strictLimiter;
  identifierSource: 'ip' | 'user' | 'global';
  tier: string;
}> = [
  // Strict tier: Discord token validation (POST /api/discord-connections, PATCH /api/discord-connections/[id])
  {
    matcher: (p, m) =>
      p.startsWith('/api/discord-connections') && (m === 'POST' || m === 'PATCH'),
    limiter: strictLimiter,
    identifierSource: 'user',
    tier: 'strict',
  },
  // Strict tier: Billing API key save (POST /api/billing/api-keys)
  {
    matcher: (p, m) => p === '/api/billing/api-keys' && m === 'POST',
    limiter: strictLimiter,
    identifierSource: 'user',
    tier: 'strict',
  },
  // Strict tier: Integration API key validation (POST /api/integrations/api-key)
  {
    matcher: (p, m) => p === '/api/integrations/api-key' && m === 'POST',
    limiter: strictLimiter,
    identifierSource: 'user',
    tier: 'strict',
  },
  // Moderate tier: OAuth start + callback
  {
    matcher: (p) => p.startsWith('/api/integrations/oauth'),
    limiter: moderateLimiter,
    identifierSource: 'user',
    tier: 'moderate',
  },
  // Moderate tier: Billing checkout + portal (prevent spam sessions)
  {
    matcher: (p) => p.startsWith('/api/billing/checkout') || p.startsWith('/api/billing/portal'),
    limiter: moderateLimiter,
    identifierSource: 'user',
    tier: 'moderate',
  },
  // Moderate tier: Billing downgrade
  {
    matcher: (p, m) => p === '/api/billing/downgrade' && m === 'POST',
    limiter: moderateLimiter,
    identifierSource: 'user',
    tier: 'moderate',
  },
  // Admin tier: All admin routes
  {
    matcher: (p) => p.startsWith('/api/admin'),
    limiter: adminLimiter,
    identifierSource: 'user',
    tier: 'admin',
  },
  // Webhook tier: Stripe webhooks (global, IP-agnostic)
  {
    matcher: (p) => p === '/api/stripe/webhook',
    limiter: webhookLimiter,
    identifierSource: 'global',
    tier: 'webhook',
  },
  // Standard tier: Everything else under /api/ (settings, integrations DELETE, discord DELETE)
  {
    matcher: (p) => p.startsWith('/api/'),
    limiter: standardLimiter,
    identifierSource: 'user',
    tier: 'standard',
  },
];

// Extract IP from request headers (Vercel sets x-forwarded-for)
function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    '127.0.0.1'
  );
}

// Extract user ID from Supabase session cookie (lightweight JWT decode, no DB call)
function getUserIdFromCookie(req: NextRequest): string | null {
  // Supabase stores session in sb-<project-ref>-auth-token cookie as base64 JSON
  // The JWT sub claim = user ID (UUID)
  const cookieHeader = req.headers.get('cookie') ?? '';
  const match = cookieHeader.match(/sb-[^-]+-auth-token=([^;]+)/);
  if (!match) return null;
  try {
    const decoded = JSON.parse(Buffer.from(match[1], 'base64').toString());
    // Supabase session object: { access_token, refresh_token, ... }
    const jwt = decoded?.access_token;
    if (!jwt) return null;
    const payload = JSON.parse(Buffer.from(jwt.split('.')[1], 'base64').toString());
    return payload?.sub ?? null;
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const method = req.method;

  // Find matching rate limit config (first match wins)
  const config = RATE_LIMIT_CONFIG.find(({ matcher }) => matcher(pathname, method));
  if (!config) return NextResponse.next(); // No rate limit for non-API routes

  // Determine identifier
  let identifier: string;
  if (config.identifierSource === 'ip') {
    identifier = getClientIp(req);
  } else if (config.identifierSource === 'global') {
    identifier = 'global';
  } else {
    // 'user' — prefer user ID, fall back to IP for unauthenticated requests
    identifier = getUserIdFromCookie(req) ?? getClientIp(req);
  }

  const { success, limit, remaining, reset } = await config.limiter.limit(identifier);

  if (!success) {
    const resetInSeconds = Math.ceil((reset - Date.now()) / 1000);
    return NextResponse.json(
      {
        error: 'rate_limit_exceeded',
        message: 'Too many requests. Please slow down.',
        retry_after: resetInSeconds,
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': String(limit),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(reset / 1000)), // Unix timestamp
          'Retry-After': String(resetInSeconds),
        },
      }
    );
  }

  // Pass through with rate limit headers attached
  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', String(limit));
  response.headers.set('X-RateLimit-Remaining', String(remaining));
  response.headers.set('X-RateLimit-Reset', String(Math.ceil(reset / 1000)));
  return response;
}

export const config = {
  // Run middleware only on API routes (not on static files or page routes)
  matcher: ['/api/:path*'],
};
```

---

## Per-Endpoint Rate Limit Table

Complete reference for every route in [./routes.md](./routes.md).

| Route | Method | Tier | Limit | Window | Identifier | Rationale |
|-------|--------|------|-------|--------|------------|-----------|
| `/api/billing/checkout` | POST | Moderate | 10 req | 60 s | user ID | Checkout sessions are expensive; prevents Stripe session spam |
| `/api/billing/portal` | POST | Moderate | 10 req | 60 s | user ID | Customer Portal sessions are short-lived but creation is fast |
| `/api/billing/downgrade` | POST | Moderate | 10 req | 60 s | user ID | Plan changes are significant; prevents accidental rapid toggling |
| `/api/billing/api-keys` | POST | Strict | 5 req | 60 s | user ID | Each call hits Anthropic API validation; expensive external call |
| `/api/billing/api-keys/[id]` | DELETE | Standard | 60 req | 60 s | user ID | Safe delete; low abuse potential |
| `/api/discord-connections` | POST | Strict | 5 req | 60 s | user ID | Validates Discord token via Discord API; external call per request |
| `/api/discord-connections/[id]` | PATCH | Strict | 5 req | 60 s | user ID | Same — token update hits Discord API |
| `/api/discord-connections/[id]` | DELETE | Standard | 60 req | 60 s | user ID | DB-only delete; safe |
| `/api/integrations/oauth/start` | GET | Moderate | 10 req | 60 s | user ID | OAuth flows require external redirect; prevents rapid-fire OAuth spam |
| `/api/integrations/oauth/callback` | GET | Moderate | 10 req | 60 s | IP | Callback is stateless (state param, no session yet); use IP |
| `/api/integrations/api-key` | POST | Strict | 5 req | 60 s | user ID | Validates against external service API (e.g. Toggl); external call |
| `/api/integrations/[service]` | DELETE | Standard | 60 req | 60 s | user ID | DB-only delete; safe |
| `/api/settings/workspace` | POST | Standard | 60 req | 60 s | user ID | Simple name update |
| `/api/settings/workspace` | DELETE | Moderate | 10 req | 60 s | user ID | Destructive action; lower limit adds accidental-click protection |
| `/api/settings/account/display-name` | POST | Standard | 60 req | 60 s | user ID | Simple update |
| `/api/settings/account/password` | POST | Strict | 5 req | 60 s | user ID | Sensitive credential change; limit tightly |
| `/api/admin/tenants/[id]/suspend` | POST | Admin | 30 req | 60 s | user ID | Admin action; 30/min is sufficient for manual operations |
| `/api/admin/tenants/[id]/unsuspend` | POST | Admin | 30 req | 60 s | user ID | Admin action |
| `/api/admin/tenants/[id]/plan` | PATCH | Admin | 30 req | 60 s | user ID | Admin action |
| `/api/admin/tenants/[id]/impersonate` | POST | Admin | 30 req | 60 s | user ID | Sensitive admin action; audit trail required |
| `/api/admin/tenants/[id]/revoke-api-key` | POST | Admin | 30 req | 60 s | user ID | Admin action |
| `/api/admin/tenants/[id]/service-connections/[connectionId]` | DELETE | Admin | 30 req | 60 s | user ID | Admin action |
| `/api/admin/discord-connections/[connectionId]/reset` | PATCH | Admin | 30 req | 60 s | user ID | Admin action |
| `/api/admin/discord-connections/[connectionId]/disconnect` | PATCH | Admin | 30 req | 60 s | user ID | Admin action |
| `/api/stripe/webhook` | POST | Webhook | 200 req | 10 s | global | Stripe can retry aggressively; global bucket; signature verification is primary security |

---

## Error Response Format

All rate limit errors return `HTTP 429` with the following body shape. This shape is consistent across all endpoints.

```typescript
// Type: RateLimitErrorResponse
{
  "error": "rate_limit_exceeded",          // Always this string
  "message": "Too many requests. Please slow down.",  // Human-readable
  "retry_after": 47                         // Seconds until limit resets (integer)
}
```

### Response Headers on Every API Response (success AND error)

| Header | Type | Description | Example |
|--------|------|-------------|---------|
| `X-RateLimit-Limit` | integer | Maximum requests allowed in the window | `60` |
| `X-RateLimit-Remaining` | integer | Requests remaining in current window | `47` |
| `X-RateLimit-Reset` | integer | Unix timestamp (seconds) when window resets | `1710356745` |
| `Retry-After` | integer | **Only on 429**: seconds until retry is safe | `13` |

### Frontend Handling of 429 Responses

All API-calling functions in the frontend (in `lib/api/`) must handle 429 responses with the following pattern:

```typescript
// lib/api/fetchWithRateLimit.ts
export async function fetchWithRateLimit(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const response = await fetch(url, options);

  if (response.status === 429) {
    const body = await response.json() as RateLimitErrorResponse;
    const retryAfter = body.retry_after ?? 60;
    // Throw a typed error that UI components can catch
    throw new RateLimitError(
      body.message,
      retryAfter
    );
  }

  return response;
}

export class RateLimitError extends Error {
  constructor(
    message: string,
    public readonly retryAfterSeconds: number
  ) {
    super(message);
    this.name = 'RateLimitError';
  }
}
```

UI components that call APIs must display a specific error message when catching `RateLimitError`:

```
Toast (error variant): "Too many requests — please wait {retryAfterSeconds} seconds before trying again."
```

The submit button must be disabled for `retryAfterSeconds` with a countdown:
```
Button text while disabled: "Wait {countdown}s..."
```

---

## Supabase Auth 429 Specific Handling

The Supabase JS client (`@supabase/ssr`) returns `AuthError` objects. Auth forms must check for rate limit errors:

```typescript
// In auth form submit handlers
const { error } = await supabase.auth.signInWithPassword({ email, password });

if (error) {
  if (error.status === 429) {
    // Show: "Too many sign-in attempts. Please wait 60 seconds and try again."
    setError('Too many sign-in attempts. Please wait 60 seconds and try again.');
    disableSubmitFor(60); // Disable button for 60 seconds with countdown
  } else {
    setError(error.message);
  }
}
```

This applies to all auth actions: sign in, sign up, password reset, OTP.

---

## Rate Limit Tiers Summary

| Tier | Requests | Window | Used For |
|------|----------|--------|----------|
| Strict | 5 | 60 s | External API calls (Discord token validation, Anthropic key validation, Toggl key validation), password changes |
| Moderate | 10 | 60 s | OAuth flows, billing checkout/portal/downgrade, workspace deletion |
| Standard | 60 | 60 s | General CRUD (settings updates, integration disconnects, safe deletes) |
| Admin | 30 | 60 s | All admin panel operations |
| Webhook | 200 | 10 s | Stripe webhook delivery (global bucket, no per-user) |

---

## Upstash Redis Configuration

### Creating the Upstash Redis Database

1. Go to console.upstash.com
2. Create a new Redis database
3. Select **Global** replication (closest to Vercel edge nodes)
4. Select **Free** tier (sufficient for Daimon scale — 10k requests/day free; upgrade when needed)
5. Copy **REST URL** and **REST Token** to environment variables:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

### Key Naming Convention in Redis

Keys written by `@upstash/ratelimit` follow this pattern:

```
{prefix}:{identifier}
```

Examples:
- `rl:strict:user_abc123` — strict tier for user `abc123`
- `rl:admin:user_xyz789` — admin tier for admin user `xyz789`
- `rl:webhook:global` — global webhook bucket
- `rl:strict:192.168.1.1` — strict tier for unauthenticated IP

Keys expire automatically when the sliding window elapses (Redis TTL is managed by `@upstash/ratelimit`).

### Redis Key TTL Policy

`@upstash/ratelimit` uses the **sliding window** algorithm, which creates keys with TTL equal to the window duration. No manual cleanup is needed. Key churn is low (one key per active user per tier per window).

---

## Stripe Webhook Special Handling

The Stripe webhook endpoint (`/api/stripe/webhook`) is rate-limited globally (200 req / 10 s), but the primary security mechanism is **Stripe signature verification**, not rate limiting.

### Why a Global Bucket (Not Per-IP) for Stripe

Stripe delivers webhooks from a pool of IP addresses that changes over time. Per-IP rate limiting would incorrectly throttle legitimate Stripe deliveries. The global bucket at 200/10s is a defense-in-depth measure against webhook replay floods while allowing Stripe's normal aggressive retry behavior (up to 100 retries over 3 days per event).

### Stripe IP Allowlist (Optional Defense)

As an additional hardening option, the webhook handler can verify the request IP against Stripe's published IP list. This is optional and not required if signature verification is implemented correctly. If implemented, log (do not block) requests from unlisted IPs — Stripe occasionally adds IPs without notice.

---

## Disabling Rate Limits in Tests

During automated tests, rate limits must not fire. Set the environment variable:

```
UPSTASH_DISABLE_TELEMETRY=1
```

And mock the Upstash Redis client in test setup:

```typescript
// jest.setup.ts or vitest.setup.ts
jest.mock('@upstash/redis', () => ({
  Redis: jest.fn().mockImplementation(() => ({
    // No-op mock; rate limiters will always succeed
  })),
}));

jest.mock('@upstash/ratelimit', () => ({
  Ratelimit: jest.fn().mockImplementation(() => ({
    limit: jest.fn().mockResolvedValue({
      success: true,
      limit: 60,
      remaining: 59,
      reset: Date.now() + 60000,
    }),
    slidingWindow: jest.fn(),
  })),
}));
```

Alternatively, in CI set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` to empty strings and catch the resulting initialization error to return `success: true` always.

---

## Monitoring Rate Limit Events

Rate limit events (HTTP 429 responses) should be tracked in the error monitoring system. See [../deployment/monitoring.md](../deployment/monitoring.md).

When a 429 is returned, log the following structured event:
```json
{
  "event": "rate_limit_exceeded",
  "tier": "strict",
  "route": "/api/discord-connections",
  "method": "POST",
  "identifier": "user_abc123",
  "identifier_type": "user",
  "reset_in_seconds": 47,
  "timestamp": "2026-03-13T12:00:00Z"
}
```

Alert threshold: If any single route logs > 50 rate limit exceeded events in 5 minutes, fire a Slack alert (possible abuse or bug).
