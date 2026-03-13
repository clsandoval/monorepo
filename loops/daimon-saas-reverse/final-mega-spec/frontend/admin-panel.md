# Admin Panel — Complete Specification

> Routes: `/admin`, `/admin/tenants/[id]`, `/admin/audit-log`
> Layout: `app/(admin)/layout.tsx` — Platform admin only (JWT claim check)
> Files:
>   - `app/(admin)/layout.tsx` — Admin shell layout
>   - `app/(admin)/page.tsx` — Tenant list (redirects to `/admin/tenants`)
>   - `app/(admin)/tenants/page.tsx` — Tenant list + stats
>   - `app/(admin)/tenants/[id]/page.tsx` — Tenant detail
>   - `app/(admin)/audit-log/page.tsx` — Audit log viewer
> Last updated: 2026-03-13

---

## Overview

The Admin Panel is an internal-only section of the Daimon website accessible exclusively to platform administrators. It provides tools to manage all tenants, view system health, take administrative actions (suspend, override plan, reset connections), impersonate tenants for debugging, and review the admin audit log.

**Key principle**: The admin panel is a power tool, not a customer-facing product. Functionality over aesthetics. Use the same PyMC brand tokens but prioritize information density.

**The admin panel is completely separate from the tenant dashboard**:
- Different route group: `app/(admin)/` vs `app/(dashboard)/`
- Different layout: no tenant-scoped sidebar
- Different data access: uses Supabase service role (bypasses RLS), not user JWT
- Different auth check: JWT custom claim `is_admin: true`, not tenant membership

Related files:
- [../database/schema.md → admin_audit_log](../database/schema.md) — Audit log table schema
- [../api/routes.md](../api/routes.md) — Admin API routes
- [../database/rls-policies.md](../database/rls-policies.md) — Why RLS is bypassed for admin

---

## 1. Admin Authentication Model

### How Platform Admins Are Identified

Platform admins are identified by a custom claim in their Supabase Auth JWT. Specifically, the field `is_admin: true` in `auth.users.raw_app_meta_data`.

**Setting an admin** (run in Supabase SQL editor or via admin API):

```sql
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"is_admin": true}'::jsonb
WHERE email = 'admin@daimon.app';
```

This field propagates to the JWT as `app_metadata.is_admin = true`. It is set in `app_metadata` (not `user_metadata`) because `app_metadata` cannot be modified by the user — only by service-role operations.

**Why not a separate `platform_admins` table?**
Using `app_metadata` avoids a DB round-trip on every request. The middleware reads the JWT directly (no DB query). The claim can only be set via service-role SQL — no user can grant themselves admin status.

**Admin JWT payload structure** (relevant fields):
```json
{
  "sub": "a1b2c3d4-...",
  "email": "admin@daimon.app",
  "app_metadata": {
    "is_admin": true,
    "provider": "email"
  },
  "exp": 1741824000
}
```

### Admin Middleware

File: `middleware.ts` (extends existing middleware)

The middleware checks the `/admin` route group before any admin page loads:

```typescript
// Pseudocode — exact implementation in api/routes.md
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin route protection
  if (pathname.startsWith('/admin')) {
    const supabase = createServerClient(/* ... */);
    const { data: { user } } = await supabase.auth.getUser();

    // Not authenticated at all
    if (!user) {
      return NextResponse.redirect(new URL('/login?next=' + pathname, request.url));
    }

    // Authenticated but not admin
    const isAdmin = user.app_metadata?.is_admin === true;
    if (!isAdmin) {
      // Returns 404, not 403 — to avoid leaking that admin panel exists
      return NextResponse.rewrite(new URL('/404', request.url));
    }
  }
  // ... rest of middleware
}
```

**Security note**: Returning 404 (not 403) for non-admins accessing `/admin` routes prevents information disclosure. The admin panel's existence is not public knowledge.

### Admin Supabase Client

All admin data operations use a **service role Supabase client**, not the user's JWT client. The service role bypasses RLS entirely — admins can read all tenant data.

The service role client is instantiated in server components and API routes as:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Server-side only — never exposed to client
  { auth: { autoRefreshToken: false, persistSession: false } }
);
```

The service role key (`SUPABASE_SERVICE_ROLE_KEY`) is **never sent to the browser**. It lives only in server-side env vars. All admin mutations go through Next.js API routes (server-side), never client-side Supabase calls.

---

## 2. Admin Layout (`app/(admin)/layout.tsx`)

The admin layout is a simplified two-column shell. No tenant context — global view only.

### Layout Structure

```
<body>
  <div class="admin-shell">               <!-- flex, min-h-screen, bg-[#F7F7F7] -->
    <AdminSidebar />                       <!-- fixed, w-[220px], bg-navy, h-screen -->
    <div class="admin-main">              <!-- flex-1, ml-[220px], flex, flex-col -->
      <AdminTopbar />                      <!-- sticky, h-[52px], bg-white, border-b -->
      <main class="admin-content">        <!-- flex-1, p-6 -->
        {children}
      </main>
    </div>
  </div>
</body>
```

### Admin Sidebar

| Property | Value |
|----------|-------|
| Width | `220px` |
| Background | Navy (`#0C1F40`) |
| Position | `fixed`, left 0, top 0, `h-screen` |
| Padding | `20px 0` (top/bottom) |

**Logo area**:

| Property | Value |
|----------|-------|
| Content | SVG shield icon (20px, White) + "Daimon Admin" text |
| Font | Archivo SemiBold, 14px, White |
| Height | `52px` |
| Padding | `0 16px` |
| Border-bottom | `1px solid rgba(255,255,255,0.08)` |

**Navigation items**:

| Label | Route | Icon |
|-------|-------|------|
| Tenants | `/admin/tenants` | Users icon (18px) |
| Audit Log | `/admin/audit-log` | ClipboardList icon (18px) |
| ← Exit Admin | `/dashboard` | ArrowLeft icon (18px) |

**Nav item styles** (same as dashboard sidebar but smaller font):

| State | Background | Text color |
|-------|-----------|-----------|
| Default | Transparent | `rgba(255,255,255,0.65)` |
| Hover | `rgba(255,255,255,0.06)` | White |
| Active | `rgba(255,255,255,0.10)` | White |

Active item has `2px solid #B4E7DD` left border.

### Admin Topbar

| Property | Value |
|----------|-------|
| Height | `52px` |
| Background | White (`#FFFFFF`) |
| Border-bottom | `1px solid #E5E7EB` |
| Content (left) | Page title (changes per route) |
| Content (right) | Admin badge + admin email |

**Admin badge** (right side of topbar):

```html
<div style="display:flex; align-items:center; gap:8px;">
  <span class="admin-badge">Admin</span>
  <span style="font: Inter 13px, color:#6B7280;">admin@daimon.app</span>
</div>
```

Admin badge styles:
| Property | Value |
|----------|-------|
| Background | Aqua (`#B4E7DD`) |
| Text | Navy (`#0C1F40`), Inter SemiBold, 11px, uppercase, letter-spacing 0.5px |
| Padding | `2px 8px` |
| Border-radius | `0px` (sharp corners per brand) |

---

## 3. Tenant List Page (`/admin/tenants`)

### Route & File

- Route: `/admin/tenants`
- File: `app/(admin)/tenants/page.tsx` (Server Component)
- Page title (topbar): "Tenants"

### Summary Statistics Bar

Displayed above the tenant table. Four stat cards in a horizontal row.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Total Tenants    │  Active Bots    │  Starter+Pro     │  Suspended         │
│  1,247            │  892            │  341             │  12                 │
│  All time         │  Right now      │  Paying tenants  │  Action needed      │
└─────────────────────────────────────────────────────────────────────────────┘
```

| Stat Card | Label | Query | Sub-label |
|-----------|-------|-------|-----------|
| Total Tenants | "Total Tenants" | `SELECT COUNT(*) FROM tenants` | "All time" |
| Active Bots | "Active Bots" | `SELECT COUNT(*) FROM tenants WHERE status = 'active'` | "Right now" |
| Paying Tenants | "Starter + Pro" | `SELECT COUNT(*) FROM tenants WHERE plan IN ('starter', 'pro')` | "Paying tenants" |
| Suspended | "Suspended" | `SELECT COUNT(*) FROM tenants WHERE status = 'suspended'` | "Action needed" |

**Stat card styles**:

| Property | Value |
|----------|-------|
| Background | White (`#FFFFFF`) |
| Border | `1px solid #E5E7EB` |
| Padding | `16px 20px` |
| Count font | Archivo SemiBold, 28px, Navy |
| Label font | Inter Regular, 12px, `#6B7280` |
| Sub-label font | Inter Regular, 11px, `#9CA3AF` |
| Layout | 4-column grid, `gap-4` |

### Filters Bar

Below the stat cards, above the table. Horizontal row of filter controls.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ [Search: tenant name or email...] [Plan ▼] [Status ▼] [Sort: Newest ▼]     │
│                                                         [Reset Filters]      │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Search field**:

| Property | Value |
|----------|-------|
| Input type | `text` |
| Placeholder | "Search by tenant name or owner email…" |
| Width | `320px` |
| Search behavior | Client-side filter on current page data. Does NOT trigger new server query per keystroke — search is applied after 300ms debounce on the URL parameter. Full URL param: `?q=...` triggers server re-render. |
| Icon | Search icon (16px, `#9CA3AF`) inside input left padding |
| Font | Inter Regular, 14px |

**Plan filter**:

| Property | Value |
|----------|-------|
| Element type | `<select>` (styled dropdown) |
| Label | "Plan" |
| Options | "All Plans", "Free", "Starter", "Pro" |
| URL param | `?plan=free` / `?plan=starter` / `?plan=pro` |
| Default | "All Plans" (no param) |

**Status filter**:

| Property | Value |
|----------|-------|
| Element type | `<select>` (styled dropdown) |
| Label | "Status" |
| Options | "All Statuses", "Pending", "Configured", "Active", "Suspended" |
| URL param | `?status=pending` / `?status=configured` / `?status=active` / `?status=suspended` |
| Default | "All Statuses" (no param) |

**Sort dropdown**:

| Property | Value |
|----------|-------|
| Element type | `<select>` (styled dropdown) |
| Label | "Sort" |
| Options | "Newest First", "Oldest First", "Name A–Z", "Name Z–A", "Plan (Pro first)", "Recently Active" |
| URL param | `?sort=created_desc` (default) / `?sort=created_asc` / `?sort=name_asc` / `?sort=name_desc` / `?sort=plan_desc` / `?sort=heartbeat_desc` |
| Default | "Newest First" |

**Reset Filters button**:

| Property | Value |
|----------|-------|
| Text | "Reset Filters" |
| Variant | Ghost (no background, Navy text, no border) |
| Visibility | Only shown when any filter is active (URL has any of `q`, `plan`, `status`, `sort`) |
| Action | Navigates to `/admin/tenants` (clears all URL params) |

### Tenant Table

The main table listing all tenants, paginated at 50 per page.

**Columns**:

| Column Header | Data | Width | Notes |
|--------------|------|-------|-------|
| Tenant | Tenant name + owner email (stacked) | `~35%` | Name: Inter Medium 14px Navy. Email: Inter Regular 12px `#6B7280` |
| Plan | Badge: Free / Starter / Pro | `~10%` | See badge styles below |
| Status | Badge: Pending / Configured / Active / Suspended | `~12%` | See badge styles below |
| Discord | Bot username + guild ID OR "—" | `~18%` | Bot username in 13px, guild ID in `#9CA3AF` 11px |
| Created | Relative date ("3 days ago") + full date tooltip | `~12%` | Tooltip on hover: ISO date string |
| Actions | "View" button | `~8%` | Links to `/admin/tenants/[id]` |

**Table styles**:

| Property | Value |
|----------|-------|
| Background | White |
| Border | `1px solid #E5E7EB` (full table border) |
| Header row background | `#F9FAFB` |
| Header font | Inter Medium, 12px, `#374151`, uppercase |
| Row border-bottom | `1px solid #F3F4F6` |
| Row hover background | `#F9FAFB` |
| Row padding | `12px 16px` |
| Striping | None — hover-only differentiation |

**Plan badge styles**:

| Plan | Background | Text |
|------|-----------|------|
| Free | `#F3F4F6` | `#6B7280` (Gray) |
| Starter | `rgba(180,231,221,0.3)` (20% Aqua) | `#0C1F40` (Navy) |
| Pro | `#B4E7DD` (Aqua) | `#0C1F40` (Navy) |

Common badge properties: Inter SemiBold 11px, uppercase, letter-spacing 0.5px, padding `2px 8px`, border-radius `0px`.

**Status badge styles**:

| Status | Background | Text |
|--------|-----------|------|
| Pending | `#FEF9C3` (yellow-100) | `#854D0E` (yellow-800) |
| Configured | `#DBEAFE` (blue-100) | `#1E40AF` (blue-800) |
| Active | `rgba(180,231,221,0.4)` | `#065F46` (green-800) |
| Suspended | `#FEE2E2` (red-100) | `#991B1B` (red-800) |

**"View" button**:

| Property | Value |
|----------|-------|
| Text | "View" |
| Variant | Secondary (border: `1px solid #E5E7EB`, background: white) |
| Font | Inter Medium, 13px, Navy |
| Padding | `4px 12px` |
| Hover background | `#F9FAFB` |
| Action | Navigate to `/admin/tenants/[tenantId]` |

### Pagination

Below the table. Shows page count and navigation.

```
Showing 1–50 of 1,247 tenants        ← Previous   1  2  3 ... 25   Next →
```

| Property | Value |
|----------|-------|
| Items per page | 50 (fixed) |
| URL param | `?page=2` (default: 1) |
| Previous button | Disabled when on page 1 |
| Next button | Disabled when on last page |
| Page number buttons | Max 5 shown, with `...` ellipsis for large ranges |
| Font | Inter Regular, 14px, `#6B7280` |
| Active page | Navy background, white text |

### Server Query (Tenant List Page)

The server component builds and executes the following query based on URL params:

```typescript
// Pseudocode — exact types in api/routes.md
const { q, plan, status, sort, page } = searchParams;

let query = supabaseAdmin
  .from('tenants')
  .select(`
    id,
    name,
    plan,
    status,
    created_at,
    owner:auth.users!owner_id(email),
    discord_connections(bot_username, guild_id, status, last_heartbeat)
  `, { count: 'exact' });

if (q) {
  // Filter by tenant name OR owner email (via join)
  query = query.or(`name.ilike.%${q}%`);
  // Note: filtering by owner email requires a separate subquery; see api/routes.md
}
if (plan) query = query.eq('plan', plan);
if (status) query = query.eq('status', status);

const sortMap = {
  created_desc: { column: 'created_at', ascending: false },
  created_asc: { column: 'created_at', ascending: true },
  name_asc: { column: 'name', ascending: true },
  name_desc: { column: 'name', ascending: false },
  heartbeat_desc: { column: 'updated_at', ascending: false }, // approximation
};
const sortOpt = sortMap[sort ?? 'created_desc'];
query = query.order(sortOpt.column, { ascending: sortOpt.ascending });

const pageNum = Math.max(1, parseInt(page ?? '1', 10));
const ITEMS_PER_PAGE = 50;
query = query.range((pageNum - 1) * ITEMS_PER_PAGE, pageNum * ITEMS_PER_PAGE - 1);

const { data: tenants, count } = await query;
```

**Note**: Auth user email is stored in `auth.users` which is not directly queryable via RLS from regular clients. The service role client can query it. The `owner:auth.users!owner_id(email)` join syntax may require a Supabase database function or separate query to fetch emails. Exact implementation: see `api/routes.md`.

### Loading State

The page uses React Suspense. While the server query executes (typically < 200ms), a skeleton is shown:

```
Skeleton: 4 stat cards (shimmer) + filter bar (shimmer) + 10 table rows (shimmer lines)
```

Each skeleton row: 3 gray shimmer blocks at expected column widths. Shimmer animation: 1.5s linear infinite gradient sweep from `#F3F4F6` to `#E5E7EB` to `#F3F4F6`.

### Empty State (No Tenants)

Only possible if filters return no results:

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│           No tenants match these filters.           │
│           Try adjusting your search or              │
│           clearing the filters.                     │
│                                                     │
│              [Clear All Filters]                    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

"Clear All Filters" button: links to `/admin/tenants` (clears all URL params).

---

## 4. Tenant Detail Page (`/admin/tenants/[id]`)

### Route & File

- Route: `/admin/tenants/[id]`
- File: `app/(admin)/tenants/[id]/page.tsx` (Server Component)
- Dynamic segment: `[id]` = tenant UUID
- Page title (topbar): Tenant name (e.g., "Acme Corp — Tenant Detail")

If the tenant ID does not exist (invalid UUID or deleted tenant): render a 404-style error page:

```
Tenant not found.
The tenant "abc123" does not exist or has been deleted.
[← Back to Tenant List]
```

### Page Layout

The tenant detail page is a single-column layout divided into stacked sections:

```
<main class="admin-content">
  <AdminBackBreadcrumb />        <!-- "← Tenants" link, 14px, Aqua color -->
  <TenantDetailHeader />         <!-- Tenant name, badges, quick actions -->
  <TenantInfoSection />          <!-- Core tenant fields -->
  <DiscordConnectionsSection />  <!-- Discord connections list -->
  <ApiKeysSection />             <!-- API keys (masked) -->
  <ServiceConnectionsSection />  <!-- Connected services -->
  <SubscriptionSection />        <!-- Billing/Stripe data -->
  <AuditLogSection />            <!-- Recent admin actions on this tenant -->
  <DangerZoneSection />          <!-- Suspend, override plan, delete -->
</main>
```

### Breadcrumb

```html
<a href="/admin/tenants" style="color:#B4E7DD; font: Inter 13px; display:flex; gap:4px;">
  ← Tenants
</a>
```

### Tenant Detail Header

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Acme Corp                                          [Starter] [Active]        │
│ Tenant ID: b2c3d4e5-...                                                     │
│ Owner: alice@example.com                                                    │
│                                                                             │
│ [Impersonate]  [Suspend]  [Override Plan ▼]                                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

| Element | Content | Style |
|---------|---------|-------|
| Tenant name | `tenants.name` | Archivo SemiBold 24px, Navy |
| Plan badge | See plan badge styles (section 3) | Same as tenant list |
| Status badge | See status badge styles (section 3) | Same as tenant list |
| Tenant ID | "Tenant ID: [UUID]" | Inter Regular 12px, `#9CA3AF`, with copy-to-clipboard icon |
| Owner email | "Owner: [email]" | Inter Regular 13px, `#6B7280` |
| Impersonate button | "Impersonate" | Secondary button, border Aqua, text Navy |
| Suspend/Unsuspend button | "Suspend" (if active/configured) OR "Unsuspend" (if suspended) | Danger button (red border) for Suspend; Secondary for Unsuspend |
| Override Plan dropdown | "Override Plan ▼" (opens menu: Free / Starter / Pro) | Secondary button with dropdown |

**Quick Actions** row:

| Button | Shown when | Action |
|--------|-----------|--------|
| Impersonate | Always (any status) | Opens impersonation confirmation modal |
| Suspend | Status is `pending`, `configured`, or `active` | Opens suspend confirmation modal with note field |
| Unsuspend | Status is `suspended` | Opens unsuspend confirmation modal |
| Override Plan → Free | Current plan is not `free` | Calls `PATCH /api/admin/tenants/[id]/plan` with `{ plan: 'free' }` |
| Override Plan → Starter | Current plan is not `starter` | Calls `PATCH /api/admin/tenants/[id]/plan` with `{ plan: 'starter' }` |
| Override Plan → Pro | Current plan is not `pro` | Calls `PATCH /api/admin/tenants/[id]/plan` with `{ plan: 'pro' }` |

### Section: Tenant Info

Card with all core tenant fields:

```
Tenant Information
──────────────────────────────────────
Tenant Name        Acme Corp
Tenant ID          b2c3d4e5-a1b2-c3d4-e5f6-...       [Copy]
Owner User ID      c3d4e5f6-...                        [Copy]
Owner Email        alice@example.com
Plan               Starter
Status             Active
Stripe Customer    cus_XXXXXXXXXXXXXXXXX               [Copy] [View in Stripe ↗]
Created            2026-03-01 at 14:23 UTC
Last Updated       2026-03-13 at 09:11 UTC
```

| Field | Database source | Notes |
|-------|----------------|-------|
| Tenant Name | `tenants.name` | Read-only in admin panel (tenant edits in their Settings) |
| Tenant ID | `tenants.id` | UUID, copy-to-clipboard |
| Owner User ID | `tenants.owner_id` | UUID, copy-to-clipboard |
| Owner Email | `auth.users.email` WHERE `id = tenants.owner_id` | Retrieved via service role |
| Plan | `tenants.plan` | Shown as badge (Free/Starter/Pro) |
| Status | `tenants.status` | Shown as badge |
| Stripe Customer | `tenants.stripe_customer_id` | If NULL: shown as "—". If set: UUID + "View in Stripe ↗" link (opens `https://dashboard.stripe.com/customers/[id]` in new tab) |
| Created | `tenants.created_at` | ISO 8601 display: "2026-03-01 at 14:23 UTC" |
| Last Updated | `tenants.updated_at` | ISO 8601 display |

**Copy-to-clipboard behavior**: Clicking the `[Copy]` icon copies the value to clipboard. Icon temporarily changes to a checkmark for 1.5s, then reverts. No toast notification — icon feedback is sufficient.

**"View in Stripe ↗" link behavior**: Opens `https://dashboard.stripe.com/customers/[stripe_customer_id]` in a new tab (`target="_blank"`, `rel="noopener noreferrer"`).

### Section: Discord Connections

Card showing all Discord connections for this tenant.

```
Discord Connections (2)
──────────────────────────────────────────────────────────────────────────────
  Bot                    Guild ID              Status      Last Heartbeat    Actions
  ─────────────────────────────────────────────────────────────────────────
  DaimonBot#4521         813258688680919040    ● Connected   2 min ago       [Reset] [Disconnect]
  DaimonBot#4521         923458712345678901    ✗ Error       3 days ago      [Reset] [Disconnect]
    Error: Invalid token — Authentication failure
```

**Column definitions**:

| Column | Data | Notes |
|--------|------|-------|
| Bot | `bot_username` (or "—" if not yet resolved) | 13px Inter Medium, Navy |
| Guild ID | `guild_id` | 12px Inter Regular, `#6B7280` |
| Status | `status` badge | Same status badge colors as tenant list but for `discord_connection_status` |
| Last Heartbeat | `last_heartbeat` relative time | "X min ago", "X hours ago", "X days ago"; tooltip: ISO timestamp |
| Actions | Reset + Disconnect buttons | See actions below |

**Discord connection status badge colors**:

| Status | Background | Text |
|--------|-----------|------|
| `pending` | `#FEF9C3` | `#854D0E` |
| `connecting` | `#DBEAFE` | `#1E40AF` |
| `connected` | `rgba(180,231,221,0.4)` | `#065F46` |
| `disconnected` | `#F3F4F6` | `#6B7280` |
| `error` | `#FEE2E2` | `#991B1B` |
| `suspended` | `#F3F4F6` | `#6B7280` |

**Error message display**: If `status = 'error'` and `error_message` is not NULL, display the error message in a `#FEF2F2` box with `#DC2626` text below the connection row. Example:
```
Error: Invalid token — Authentication failure
```

**Reset button**:

| Property | Value |
|----------|-------|
| Text | "Reset" |
| Variant | Secondary, small |
| Action | Opens confirmation modal: "Reset this Discord connection? This will set the status back to 'pending' and trigger the bot to reattempt connection." |
| Confirmation: Confirm | Calls `PATCH /api/admin/discord-connections/[connectionId]/reset` |
| Confirmation: Cancel | Closes modal |
| Audit log | Writes `discord_connection_reset` to `admin_audit_log` |
| Success toast | "Connection reset. Bot will reattempt connection shortly." |
| Error toast | "Failed to reset connection. Check server logs." |

**Disconnect button**:

| Property | Value |
|----------|-------|
| Text | "Disconnect" |
| Variant | Danger, small |
| Action | Opens confirmation modal: "Disconnect this bot? This will set status to 'disconnected'. The bot token will remain stored. The tenant can reconnect from their Settings page." |
| Confirmation: Confirm | Calls `PATCH /api/admin/discord-connections/[connectionId]/disconnect` (sets `status = 'disconnected'`) |
| Confirmation: Cancel | Closes modal |
| Audit log | Writes `discord_connection_reset` with `new_status: 'disconnected'` |
| Success toast | "Connection disconnected." |

**Empty state** (tenant has no Discord connections):
```
No Discord connections found for this tenant.
The tenant has not yet set up a bot connection.
```
Font: Inter Regular 14px, `#6B7280`, centered in the card.

### Section: API Keys

Card showing all API key records for this tenant. Note: admin cannot see the actual key — only `key_hint` and metadata.

```
API Keys
──────────────────────────────────────────────────────────
  Provider    Key (hint)           Status    Validated        Actions
  ──────────────────────────────────────────────────────
  Anthropic   sk-ant-a...b12c      ● Valid   2026-03-12       [Revoke]
  OpenAI      sk-...c9d2           ● Valid   2026-03-10       [Revoke]
```

**Column definitions**:

| Column | Data | Notes |
|--------|------|-------|
| Provider | `api_key_type` enum | "Anthropic" or "OpenAI" |
| Key (hint) | `key_hint` | Partially masked key for identification only |
| Status | `status` | Badge: Valid (Aqua), Invalid (red), Revoked (gray) |
| Validated | `validated_at` | ISO date, e.g., "2026-03-12" |
| Actions | Revoke button | See below |

**API key status badge colors**:

| Status | Background | Text |
|--------|-----------|------|
| `active` | `rgba(180,231,221,0.4)` | `#065F46` |
| `invalid` | `#FEE2E2` | `#991B1B` |
| `revoked` | `#F3F4F6` | `#6B7280` |

**Revoke button**:

| Property | Value |
|----------|-------|
| Text | "Revoke" |
| Variant | Danger, small |
| Shown when | `status = 'active'` or `status = 'invalid'`. Hidden when `status = 'revoked'`. |
| Action | Opens confirmation modal: "Revoke this API key? This will immediately disconnect the bot for this tenant. They will need to re-enter their key. Enter a reason (optional):" + text input |
| Confirmation: Confirm | Calls `POST /api/admin/tenants/[id]/revoke-api-key` with `{ keyId, reason }` |
| On success | Row updates to `status = 'revoked'`, Revoke button hidden |
| Audit log | Writes `api_key_revoked_by_admin` |
| Success toast | "API key revoked." |
| Error toast | "Failed to revoke key." |

**Revoke confirmation modal note field**:

```
Reason (optional)
[__________________________________________]
Placeholder: "e.g., suspected abuse, tenant request"
Max length: 500 characters
```

**Empty state** (tenant has no API keys):
```
No API keys found. The tenant has not yet added any API keys.
```

### Section: Service Connections

Card showing all OAuth/API key service connections for this tenant.

```
Service Connections (3)
──────────────────────────────────────────────────────────────────────────────
  Service     Connected As            Status    Connected On   Actions
  ──────────────────────────────────────────────────────────────────────────
  GitHub      @alice (ID: 12345678)  ● Active   2026-03-02    [Revoke]
  Google      alice@gmail.com        ● Active   2026-03-02    [Revoke]
  Linear      alice@acme.com         ✗ Expired  2026-03-01    [Revoke]
  Toggl       (API key)              ● Active   2026-03-05    [Revoke]
```

**Column definitions**:

| Column | Data | Notes |
|--------|------|-------|
| Service | `service_name` | Capitalized: "GitHub", "Google", "Linear", "Toggl" |
| Connected As | `display_name` + optional `email` | From `tenant_service_connections.metadata` — identity info. No tokens ever shown. |
| Status | `status` | Badge using service_connection_status styles |
| Connected On | `created_at` | Date only, "2026-03-02" |
| Actions | Revoke button | See below |

**Service connection status badge colors**: Same as `service_connection_status` badges used in tenant list.

| Status | Background | Text |
|--------|-----------|------|
| `active` | `rgba(180,231,221,0.4)` | `#065F46` |
| `expired` | `#FEF9C3` | `#854D0E` |
| `revoked` | `#F3F4F6` | `#6B7280` |
| `error` | `#FEE2E2` | `#991B1B` |

**Revoke button** (admin revoking a service connection):

| Property | Value |
|----------|-------|
| Text | "Revoke" |
| Shown when | `status` is `active`, `expired`, or `error`. Hidden when `status = 'revoked'`. |
| Action | Opens confirmation: "Revoke [Service] connection? The tenant will need to reconnect the service." |
| On confirm | Calls `DELETE /api/admin/tenants/[id]/service-connections/[connectionId]` |
| Audit log | Writes action type `'discord_connection_reset'` (reuse) — Note: this is a v1 simplification; a proper `service_connection_revoked_by_admin` action should be added to schema in future |
| Success toast | "[Service] connection revoked." |

**Empty state**:
```
No service connections. The tenant has not connected any external services.
```

### Section: Subscription

Card showing billing data for this tenant.

```
Subscription
────────────────────────────────────────────────
Plan                Starter
Stripe Status       Active
Stripe Sub ID       sub_XXXXXXXXXXXXXXXXX       [Copy] [View in Stripe ↗]
Current Period      2026-03-01 → 2026-04-01
Cancel at Period    No
Trial Ends          N/A
Created             2026-02-28
```

| Field | Data | Notes |
|-------|------|-------|
| Plan | `tenants.plan` | Same as tenant info section |
| Stripe Status | `tenant_subscriptions.stripe_status` | If no subscription record: "No subscription (Free)" |
| Stripe Sub ID | `tenant_subscriptions.stripe_subscription_id` | Copy + View in Stripe link. NULL → "—" |
| Current Period | `current_period_start` → `current_period_end` | Both displayed as "YYYY-MM-DD" |
| Cancel at Period End | `cancel_at_period_end` | "Yes" or "No" |
| Trial Ends | `trial_end` | Date if in trial, "N/A" if not |
| Created | `tenant_subscriptions.created_at` | Date only |

If `tenants.stripe_customer_id` is NULL (never opened Stripe): display entire section as:
```
Free tier — no Stripe subscription.
This tenant has never initiated a billing flow.
```

### Section: Recent Admin Actions

Shows the last 10 `admin_audit_log` entries where `tenant_id = [this tenant's id]`, ordered by `created_at DESC`.

```
Recent Admin Actions
──────────────────────────────────────────────────────────────────────────────
  Action                    Admin           Date & Time              Metadata
  ──────────────────────────────────────────────────────────────────────────
  tenant_suspended          admin@daimon.app  2026-03-10 14:22 UTC   reason: manual
  tenant_plan_override      admin@daimon.app  2026-03-05 09:11 UTC   free → starter
  impersonation_started     admin@daimon.app  2026-03-03 16:45 UTC   session: a1b2...
```

**Column definitions**:

| Column | Data | Notes |
|--------|------|-------|
| Action | `action` | Display as human-readable label (see mapping below) |
| Admin | Email of `admin_audit_log.admin_user_id` | Via service role lookup |
| Date & Time | `created_at` | "2026-03-10 14:22 UTC" |
| Metadata | Key metadata from `metadata` JSONB | Action-specific summary (see below) |

**Action display mapping**:

| `action` value | Display label |
|----------------|--------------|
| `tenant_suspended` | Tenant Suspended |
| `tenant_unsuspended` | Tenant Unsuspended |
| `tenant_plan_override` | Plan Override |
| `impersonation_started` | Impersonation Started |
| `impersonation_ended` | Impersonation Ended |
| `tenant_deleted_by_admin` | Tenant Deleted (Admin) |
| `api_key_revoked_by_admin` | API Key Revoked |
| `discord_connection_reset` | Discord Connection Reset |
| `subscription_override` | Subscription Override |
| `user_banned` | User Banned |

**Metadata summary per action** (rendered in Metadata column):

| Action | Metadata shown |
|--------|---------------|
| `tenant_suspended` | `"note: [note]"` or `"(no note)"` |
| `tenant_unsuspended` | `"note: [note]"` or `"(no note)"` |
| `tenant_plan_override` | `"[previous_plan] → [new_plan]"` |
| `impersonation_started` | `"session: [first 8 chars of session ID]..."` |
| `impersonation_ended` | `"duration: [duration_seconds]s"` |
| `api_key_revoked_by_admin` | `"key: [key_hint], reason: [reason]"` |
| `discord_connection_reset` | `"guild: [guild_id], [previous_status] → [new_status]"` |
| `subscription_override` | `"action: [action_taken]"` |
| `user_banned` | `"reason: [reason]"` |

**"View All Actions" link**: Below the table, a link: `← View all actions for this tenant in the audit log` — links to `/admin/audit-log?tenant_id=[id]`.

**Empty state** (no admin actions for this tenant):
```
No admin actions have been taken on this tenant.
```

### Section: Danger Zone

Card with red border (`border: 1px solid #FCA5A5`). Visible only in admin detail page.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ⚠ Danger Zone                                                               │
│ These actions are irreversible and may disrupt the tenant's service.        │
├─────────────────────────────────────────────────────────────────────────────┤
│ Delete Tenant                                                               │
│ Permanently delete this tenant, all their data, and cancel their           │
│ Stripe subscription. This cannot be undone.                                 │
│                                                                   [Delete]  │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Delete Tenant button**:

| Property | Value |
|----------|-------|
| Text | "Delete Tenant" |
| Variant | Danger (background: `#DC2626`, text: White) |
| Action | Opens a multi-step confirmation modal (see below) |

**Delete Tenant confirmation modal** (multi-step, cannot be dismissed by clicking outside):

**Step 1** — Impact summary:
```
Delete "Acme Corp"?

This will permanently:
• Delete the tenant account and all member associations
• Delete all Discord connections (tokens destroyed)
• Delete all API keys (from Vault)
• Delete all service connections (OAuth tokens revoked)
• Cancel their Stripe subscription (if any)
• Remove all data from the database

This action CANNOT be undone.

[Cancel]    [Proceed →]
```

**Step 2** — Type to confirm:
```
Type the tenant name to confirm:

Tenant name: Acme Corp

[________________________]
Placeholder: Type "Acme Corp" to confirm

[← Back]    [Delete Permanently]
```

The "Delete Permanently" button is disabled until the typed value exactly matches `tenants.name` (case-sensitive).

On confirm: calls `DELETE /api/admin/tenants/[id]`.

**Success behavior**: Redirects to `/admin/tenants` with toast: "Tenant 'Acme Corp' has been permanently deleted."

**Error behavior**: Shows error in modal: "Failed to delete tenant: [error message]. The tenant was not deleted."

**Audit log**: Writes `tenant_deleted_by_admin`.

---

## 5. Impersonation Flow

Impersonation allows an admin to view the tenant dashboard exactly as the tenant owner sees it, for debugging purposes. Impersonation is **read-only** — the admin cannot make changes while impersonating.

### Impersonation Modal

Triggered by clicking "Impersonate" on the tenant detail header.

```
Impersonate "Acme Corp"?

You will be redirected to the tenant dashboard as the owner of Acme Corp.
Any changes you make will affect the tenant's real data.

⚠ Impersonation is logged. This action will be recorded in the audit log.

[Cancel]    [Start Impersonation]
```

Note: The modal says "any changes will affect real data" but the implementation enforces read-only at the API level (API routes check for impersonation header and block mutations).

### Impersonation Implementation

**Step 1**: Admin clicks "Start Impersonation" → POST `/api/admin/tenants/[id]/impersonate`

**Step 2**: API route:
1. Verifies admin JWT (`is_admin: true`)
2. Generates a scoped auth token for the tenant owner using:
   ```typescript
   const { data } = await supabaseAdmin.auth.admin.generateLink({
     type: 'magiclink',
     email: tenantOwnerEmail,
   });
   // Or: use a custom short-lived JWT with impersonation claim
   ```
   **Preferred approach**: Generate a short-lived JWT with custom claim `{ is_impersonated: true, impersonated_by: adminUserId, impersonation_session_id: sessionId }`. This claim allows the middleware to detect impersonation and block mutations.
3. Stores `impersonation_session_id` in a server-side session (Redis or Supabase KV — v1: use an in-memory store or Vercel KV)
4. Writes `impersonation_started` to `admin_audit_log`
5. Returns `{ redirectUrl: '/dashboard?impersonation_session=SESSION_ID' }`

**Step 3**: Admin browser redirects to `/dashboard` with the impersonated session.

**Step 4**: Dashboard detects impersonation via the JWT claim and renders an **Impersonation Banner**:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 👁  You are viewing this dashboard as "Acme Corp" (alice@example.com).      │
│     All actions are blocked. This session will expire in 30 minutes.        │
│                                               [End Impersonation]           │
└─────────────────────────────────────────────────────────────────────────────┘
```

Impersonation banner styles:

| Property | Value |
|----------|-------|
| Background | `#FEF9C3` (yellow-100) |
| Border-bottom | `2px solid #EAB308` (yellow-500) |
| Text | Inter Medium 13px, `#854D0E` (yellow-800) |
| Height | `48px` |
| Position | Fixed, top 0, full width, z-index 100 (above topbar) |
| When shown | When JWT contains `is_impersonated: true` |

Dashboard shell adjusts `padding-top` by `48px` when banner is present.

**Mutation blocking during impersonation**: All Next.js API route handlers that modify data (`POST`, `PUT`, `PATCH`, `DELETE`) check for the impersonation claim in the JWT. If found, they return `403 Forbidden` with body `{ error: 'Mutations are disabled during impersonation.' }`. Read-only `GET` routes are not affected.

**"End Impersonation" button**:
1. Calls `POST /api/admin/impersonation/[sessionId]/end`
2. Server writes `impersonation_ended` to `admin_audit_log` (with `duration_seconds` calculated)
3. Server invalidates the impersonation JWT
4. Browser is redirected to `/admin/tenants/[tenantId]` (back to admin panel)

**Impersonation session expiry**: Impersonation JWTs expire after 30 minutes. After expiry, the user is redirected to `/login`. The `/login` page detects the impersonation session expired via URL param and shows: "Your impersonation session has expired. Please log back in as an admin."

---

## 6. Suspend / Unsuspend Flow

### Suspend Modal

Triggered by "Suspend" button on the tenant detail header.

```
Suspend "Acme Corp"?

The tenant's bot will be disconnected immediately. They will see a
"Account Suspended" message when they log in.

Reason (optional):
[__________________________________________]
Placeholder: "e.g., payment dispute, TOS violation, abuse"
Max: 500 characters

[Cancel]    [Suspend Tenant]
```

**On confirm**:
1. Calls `PATCH /api/admin/tenants/[id]/suspend` with `{ reason: '...' }`
2. API route:
   a. Updates `tenants.status = 'suspended'`
   b. Updates all `discord_connections.status = 'suspended'` for this tenant (bot will detect via Realtime and disconnect)
   c. Writes `tenant_suspended` to `admin_audit_log` with `{ reason: 'manual_admin_action', previous_status, note }`
3. Returns 200
4. Page re-renders: status badge changes to Suspended, button changes to "Unsuspend"

**Success toast**: "Tenant 'Acme Corp' has been suspended. The bot will disconnect shortly."

### Unsuspend Modal

Triggered by "Unsuspend" button.

```
Unsuspend "Acme Corp"?

The tenant's account will be restored. They can log in and reconnect
their bot from their dashboard.

Note (optional):
[__________________________________________]

[Cancel]    [Unsuspend Tenant]
```

**On confirm**:
1. Calls `PATCH /api/admin/tenants/[id]/unsuspend` with `{ note: '...' }`
2. API route:
   a. Updates `tenants.status = 'configured'` (not back to `active` — bot must re-heartbeat to become active)
   b. Updates all `discord_connections.status = 'pending'` for this tenant (bot will pick up and reconnect)
   c. Writes `tenant_unsuspended` to `admin_audit_log`
3. Returns 200

**Success toast**: "Tenant 'Acme Corp' has been unsuspended. They can reconnect their bot from their dashboard."

---

## 7. Plan Override Flow

Triggered by the "Override Plan ▼" dropdown on the tenant detail header.

Selecting a plan (e.g., "Pro") opens a confirmation modal:

```
Override plan for "Acme Corp"?

Current plan: Starter
New plan: Pro

⚠ This changes the plan in the database only. It does NOT create or
  modify a Stripe subscription. Use this for courtesy upgrades,
  support exceptions, or fraud resolution only.

Reason:
[__________________________________________]
Placeholder: "e.g., courtesy upgrade, support exception"
(Required — minimum 10 characters)

[Cancel]    [Override Plan]
```

**Validation**: Reason field required, minimum 10 characters. Error: "Please provide a reason (at least 10 characters)."

**On confirm**:
1. Calls `PATCH /api/admin/tenants/[id]/plan` with `{ plan: 'pro', reason: '...' }`
2. API route:
   a. Updates `tenants.plan = 'pro'`
   b. Does NOT modify `tenant_subscriptions` (subscription data reflects Stripe; plan override is a direct DB override)
   c. Writes `tenant_plan_override` to `admin_audit_log` with `{ previous_plan, new_plan, reason }`
3. Returns 200

**Success toast**: "Plan overridden to Pro for 'Acme Corp'."

**Warning in UI**: After a plan override, a warning appears in the Subscription section:
```
⚠ Plan override active: This tenant's plan (Pro) was manually overridden.
  The Stripe subscription shows: Starter. These are out of sync.
```
Shown when `tenants.plan != tenant_subscriptions.plan` (both not null).

---

## 8. Audit Log Page (`/admin/audit-log`)

### Route & File

- Route: `/admin/audit-log`
- File: `app/(admin)/audit-log/page.tsx` (Server Component)
- Page title: "Audit Log"

### Filters

```
[Tenant ID filter: _____________]  [Action ▼]  [Admin ▼]  [Date range: from __ to __]
```

| Filter | URL param | Options | Notes |
|--------|----------|---------|-------|
| Tenant ID | `?tenant_id=UUID` | Free text UUID input | Shows all actions for that tenant |
| Action | `?action=...` | All, + each action type from check constraint | Dropdown |
| Admin | `?admin_id=UUID` | All admins (pulled from distinct `admin_user_id` in log) | Dropdown |
| Date from | `?from=2026-03-01` | Date picker | ISO date |
| Date to | `?to=2026-03-13` | Date picker | ISO date |

### Audit Log Table

```
  ID         Action                 Tenant                Admin           Date & Time          Metadata
  ─────────────────────────────────────────────────────────────────────────────────────────────
  a1b2c3...  Tenant Suspended       Acme Corp            admin@daimon.app  2026-03-10 14:22    reason: manual...
  b2c3d4...  Impersonation Started  Globex Corp          admin@daimon.app  2026-03-09 11:33    session: d4e5f6...
```

**Column definitions**:

| Column | Data | Notes |
|--------|------|-------|
| ID | `id` (first 8 chars) | Monospace, `#9CA3AF`, tooltip: full UUID |
| Action | `action` human-readable label | See action display mapping in section 4 |
| Tenant | Tenant name (looked up by `tenant_id`) | If tenant deleted: "Deleted tenant (UUID)" in italic gray |
| Admin | Admin email (looked up by `admin_user_id`) | Inter 13px |
| Date & Time | `created_at` | "2026-03-10 at 14:22 UTC" |
| Metadata | Key-value summary | Same format as section 4 |

**Row expansion**: Clicking any row expands it to show the full `metadata` JSONB in a preformatted block:
```json
{
  "reason": "manual_admin_action",
  "previous_status": "active",
  "note": "Customer disputed charge, investigated confirmed fraud"
}
```

**Pagination**: 100 per page. Same pagination component as tenant list.

### Empty State

```
No audit log entries found.
No admin actions have been recorded yet, or your filters returned no results.
[Clear Filters]
```

### Loading State

10 skeleton rows (shimmer).

---

## 9. API Routes (Admin)

All admin API routes are in `app/api/admin/`. They require admin JWT verification in a shared `verifyAdminRequest()` middleware function.

### `verifyAdminRequest(request)` (shared helper)

```typescript
// app/api/admin/_shared/verify-admin.ts
export async function verifyAdminRequest(request: Request): Promise<{
  adminUser: User;
  supabaseAdmin: SupabaseClient;
} | Response> {
  const supabase = createServerClient(/* cookies */);
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!user.app_metadata?.is_admin) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  return { adminUser: user, supabaseAdmin };
}
```

### Route Table

| Method | Route | Description | Request body | Response |
|--------|-------|-------------|-------------|---------|
| `GET` | `/api/admin/tenants` | List tenants with filters | — (URL params) | `{ tenants: [...], total: number }` |
| `GET` | `/api/admin/tenants/[id]` | Full tenant detail | — | `{ tenant, connections, apiKeys, services, subscription, auditLog }` |
| `PATCH` | `/api/admin/tenants/[id]/suspend` | Suspend tenant | `{ reason?: string }` | `{ success: true }` |
| `PATCH` | `/api/admin/tenants/[id]/unsuspend` | Unsuspend tenant | `{ note?: string }` | `{ success: true }` |
| `PATCH` | `/api/admin/tenants/[id]/plan` | Override plan | `{ plan: tenant_plan, reason: string }` | `{ success: true }` |
| `DELETE` | `/api/admin/tenants/[id]` | Delete tenant | — | `{ success: true }` |
| `POST` | `/api/admin/tenants/[id]/impersonate` | Start impersonation | — | `{ redirectUrl: string, sessionId: string }` |
| `POST` | `/api/admin/impersonation/[sessionId]/end` | End impersonation | — | `{ redirectUrl: string }` |
| `PATCH` | `/api/admin/discord-connections/[id]/reset` | Reset connection | — | `{ success: true }` |
| `PATCH` | `/api/admin/discord-connections/[id]/disconnect` | Disconnect | — | `{ success: true }` |
| `POST` | `/api/admin/tenants/[id]/revoke-api-key` | Revoke API key | `{ keyId: string, reason?: string }` | `{ success: true }` |
| `DELETE` | `/api/admin/tenants/[id]/service-connections/[connId]` | Revoke service connection | — | `{ success: true }` |
| `GET` | `/api/admin/audit-log` | List audit log entries | — (URL params) | `{ entries: [...], total: number }` |

**Every route**:
1. Calls `verifyAdminRequest()` first — returns 401/403 if not admin
2. Logs action to `admin_audit_log` for all write operations
3. Returns appropriate HTTP status codes (200 on success, 400 on validation error, 404 on not found, 500 on server error)

---

## 10. Page States Summary

### Tenant List Page

| State | Trigger | UI |
|-------|---------|-----|
| Loading | Page initial render | Shimmer stat cards + shimmer table rows |
| Loaded | Data fetched | Stat cards + filter bar + table |
| Empty (filtered) | Filters return no results | Empty state with "Clear Filters" |
| Error | Supabase query fails | Error card: "Failed to load tenants. Refresh the page." |

### Tenant Detail Page

| State | Trigger | UI |
|-------|---------|-----|
| Loading | Page initial render | Shimmer sections |
| Loaded | Data fetched | Full detail with all sections |
| Not found | Tenant ID doesn't exist | "Tenant not found" with back link |
| Action in progress | Admin clicked action | Button shows spinner, disabled |
| Action success | API returns 200 | Toast notification, page data refreshes |
| Action error | API returns 4xx/5xx | Error toast, data unchanged |

### Audit Log Page

| State | Trigger | UI |
|-------|---------|-----|
| Loading | Page initial render | Shimmer rows |
| Loaded | Data fetched | Table with entries |
| Empty | No entries match | Empty state with "Clear Filters" |
| Row expanded | User clicks row | Metadata JSON block shown inline |

---

## 11. Security Considerations

1. **Admin routes return 404 for non-admins**: Prevents disclosure that the admin panel exists.

2. **Service role key never exposed to browser**: All admin Supabase queries run server-side. The service role key is a server-only env var.

3. **All admin actions audit-logged**: The `admin_audit_log` write happens atomically with the action. If the audit write fails, the action is rolled back (use a DB transaction where possible).

4. **Impersonation is read-only at API level**: All mutation routes check for `is_impersonated` JWT claim and return 403. The dashboard UI does not conditionally hide mutation buttons based on this — the backend is the enforcement point.

5. **Impersonation sessions expire in 30 minutes**: Short-lived JWTs limit blast radius if an impersonation session is leaked.

6. **Plan overrides are DB-only**: Overriding a plan does not create or cancel Stripe subscriptions. The warning in the UI makes this clear.

7. **Delete requires typing tenant name**: Multi-step confirmation prevents accidental deletion.

8. **Admin users cannot be deleted via UI**: `admin_audit_log.admin_user_id` has `ON DELETE RESTRICT` — the DB will prevent deleting an admin user who has audit entries. Admin user management must be done via Supabase dashboard SQL.

9. **Rate limiting on admin routes**: `/api/admin/*` routes are rate-limited at 60 requests per minute per admin IP. See `api/rate-limiting.md`.

10. **IP address logged**: Every admin audit log entry captures the request IP address. This is set in the API route from `request.headers.get('x-forwarded-for')` (Vercel provides this).

---

## 12. Responsive Behavior

The admin panel is **desktop-only**. It is not designed for mobile use. On screens narrower than `1024px`:

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  The admin panel is not available on mobile devices.   │
│  Please use a desktop browser.                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

This message is rendered by the admin layout at `max-width: 1024px` via a CSS media query. The full admin UI is hidden (`display: none`) and this message is shown instead.

**Rationale**: Admin operations (suspension, deletion, impersonation) are high-consequence. Requiring a desktop environment reduces accidental mis-taps on mobile.
