# Webhooks — Daimon SaaS API

> Aspect: 5.1 (Stripe integration — webhook handler details)
> Written: 2026-03-13
> Related: [../integrations/stripe.md](../integrations/stripe.md), [routes.md](./routes.md), [../database/schema.md](../database/schema.md)

---

## Overview

The Daimon Next.js app has one webhook endpoint: `/api/stripe/webhook`. This receives all Stripe lifecycle events and updates the Supabase database.

There are no other inbound webhooks at launch. (Future: GitHub webhooks for CI/CD notifications, Discord webhook for status pings — not in v1 scope.)

---

## Stripe Webhook

**Route:** `POST /api/stripe/webhook`
**File:** `app/api/stripe/webhook/route.ts`
**Auth:** Stripe signature verification (NOT Supabase auth — this is a server-to-server call)

### Critical Configuration

```typescript
// IMPORTANT: This must be in the route file to prevent Next.js from parsing the body
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
```

**Do NOT add this route to any CSRF protection middleware.** Stripe sends POST requests without CSRF tokens.

**Do NOT use `req.json()`.** The raw body text is required for `stripe.webhooks.constructEvent()`. Use `await req.text()` only.

### Middleware Exclusion

In `middleware.ts`, exclude this route from auth middleware:

```typescript
export const config = {
  matcher: [
    // Match all routes EXCEPT:
    '/((?!api/stripe/webhook|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

Or use a condition in the middleware:

```typescript
export function middleware(req: NextRequest) {
  // Skip auth check for Stripe webhook
  if (req.nextUrl.pathname.startsWith('/api/stripe/webhook')) {
    return NextResponse.next();
  }
  // ... rest of auth middleware
}
```

### Request Headers

| Header | Value | Required |
|--------|-------|---------|
| `stripe-signature` | `t=timestamp,v1=signature` format | Yes |
| `content-type` | `application/json` | Yes (Stripe sets this) |

### Response Codes

| Code | When |
|------|------|
| 200 `{ received: true }` | Event processed successfully |
| 400 `{ error: "Missing signature" }` | No `stripe-signature` header |
| 400 `{ error: "Invalid signature" }` | Signature verification failed (tampered payload, wrong secret) |
| 500 `{ error: "Internal error processing event" }` | DB error or unhandled exception — triggers Stripe retry |

### Stripe Retry Behavior

Stripe retries events that receive non-2xx responses. The retry schedule:
- Immediate retry (if no response within 30 seconds)
- After 1 hour
- After 6 hours
- After 24 hours
- After 3 days
- Total: 7 attempts over 3 days

**Strategy:** Return 500 for DB errors (so Stripe retries). Return 200 for:
- Successfully processed events
- Events we intentionally ignore (`checkout.session.expired`, unrecognized event types)
- Events for tenants not found (to prevent infinite retry loops on orphaned events)

### Full Handler Implementation

See [../integrations/stripe.md](../integrations/stripe.md#webhook-handler) for complete implementation code.

---

## Idempotency

All webhook handlers must be idempotent (safe to run multiple times). Stripe may deliver the same event more than once.

**Verification:** Stripe includes an `event.id` in every event object. For critical events, idempotency is enforced by the SQL semantics (all handlers use `UPDATE WHERE` — re-running with same data is a no-op). For extra safety, implement event deduplication:

```typescript
// Optional: Deduplicate events using a processed_events table (not in v1 schema)
// If implementing, create table: processed_stripe_events(event_id TEXT PRIMARY KEY, processed_at TIMESTAMPTZ)
// Check before processing: SELECT 1 FROM processed_stripe_events WHERE event_id = event.id
// Insert after processing: INSERT INTO processed_stripe_events(event_id, processed_at) VALUES (event.id, NOW()) ON CONFLICT DO NOTHING
```

**v1 decision:** Do NOT implement event deduplication table. Rely on idempotent SQL operations. If a duplicate event causes a duplicate update, the result is the same as a single update. The `updated_at` timestamp will be bumped, which is acceptable.

---

## Logging

All webhook events must be logged with the Stripe event ID and type for debugging.

```typescript
// In handleStripeEvent:
console.info(`[webhook] Processing event: ${event.id} type=${event.type}`);
```

**Log all webhook errors** with full context:
```typescript
console.error(`[webhook] Error in ${event.type} handler:`, {
  eventId: event.id,
  error: err instanceof Error ? err.message : String(err),
  stack: err instanceof Error ? err.stack : undefined,
});
```

---

## Database Client for Webhooks

The webhook handler uses the Supabase **admin/service role client** — NOT the user-scoped RLS client.

**File:** `lib/supabase/admin.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

export function createSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase admin credentials');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
```

**Why service role:** The webhook processes Stripe events server-to-server. There is no authenticated user. RLS policies would block the updates because there's no `auth.uid()` in the request context. The service role bypasses RLS, which is correct and intentional for server-to-server operations.

**Security:** The `SUPABASE_SERVICE_ROLE_KEY` is never exposed to the client. It is only used in server-side Next.js code (API routes, Server Components, Route Handlers).
