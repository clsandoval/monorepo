# Dashboard Home — Complete Specification

> Route: `/dashboard`
> Layout: `app/(dashboard)/layout.tsx` — Authenticated only
> File: `app/(dashboard)/page.tsx` (Server Component, data fetched server-side)
> Last updated: 2026-03-13

---

## Overview

The dashboard home is the first page authenticated users see after login. It provides an at-a-glance view of the tenant's bot status, connection health, service integrations, and onboarding progress. It uses a card-based layout on a White Soft background.

**Auth guard:** Middleware redirects unauthenticated requests to `/login?next=/dashboard`. See [auth-pages.md](./auth-pages.md) for redirect rules.

**Real-time updates:** The page subscribes to Supabase Realtime on three channels after initial server-side render, updating status cards without a full page reload. See [../multi-tenant/realtime-contract.md](../multi-tenant/realtime-contract.md) for channel specs.

---

## Layout Structure

### Dashboard Shell (`app/(dashboard)/layout.tsx`)

All authenticated pages share a two-column shell: a fixed sidebar on the left, a scrollable main content area on the right.

```
<body>
  <div class="dashboard-shell">          <!-- flex, min-h-screen, bg-[#F7F7F7] -->
    <Sidebar />                           <!-- fixed, w-[240px], bg-navy, h-screen -->
    <div class="main-area">              <!-- flex-1, ml-[240px], flex, flex-col -->
      <DashboardTopbar />                <!-- sticky, h-[56px], bg-white, border-b -->
      <main class="page-content">        <!-- flex-1, p-8 -->
        {children}
      </main>
    </div>
  </div>
</body>
```

### Sidebar (`components/layout/Sidebar.tsx`)

| Property | Value |
|----------|-------|
| Width | `240px` |
| Background | Navy (`#0C1F40`) |
| Position | `fixed`, left 0, top 0, `h-screen` |
| Overflow | `overflow-y-auto` |
| z-index | `40` |
| Padding | `24px 0` (top/bottom); items have `0 16px` horizontal padding |

**Logo area** (top of sidebar):

| Property | Value |
|----------|-------|
| Height | `64px` |
| Content | SVG rocket icon (24px, White) + "Daimon" wordmark |
| Font | Archivo, 16px, weight 700, White |
| Gap | 8px |
| Link | `href="/dashboard"` |
| Padding | `0 16px` |
| Border-bottom | `1px solid rgba(255,255,255,0.08)` |

**Navigation items** (below logo):

Rendered as `<nav>` with `<ul>` list. Each item is a `<li>` with `<Link>`.

| Label | Route | Icon | Description |
|-------|-------|------|-------------|
| Dashboard | `/dashboard` | Home icon (20px) | Overview page |
| Integrations | `/dashboard/integrations` | Plug icon (20px) | Service connections |
| Billing | `/dashboard/billing` | CreditCard icon (20px) | Plan and keys |
| Settings | `/dashboard/settings` | Settings icon (20px) | Tenant settings |
| Documentation | `/docs` | BookOpen icon (20px) | Opens docs |

**Nav item styles:**

| State | Background | Text color | Border |
|-------|-----------|-----------|--------|
| Default | Transparent | `rgba(255,255,255,0.65)` | None |
| Hover | `rgba(255,255,255,0.06)` | White | None |
| Active (current page) | `rgba(180,231,221,0.12)` (12% Aqua) | Aqua (`#B4E7DD`) | `2px solid #B4E7DD` left edge |
| Focus-visible | `outline: 2px solid #B4E7DD`, `outline-offset: -2px` | White | — |

**Nav item layout:**

| Property | Value |
|----------|-------|
| Height | `44px` |
| Padding | `0 16px` |
| Display | `flex`, `align-items: center`, `gap: 12px` |
| Font | Inter, 14px, weight 500 |
| Border-radius | `0` (PyMC sharp corners) |
| Transition | `background 0.15s ease, color 0.15s ease` |
| Margin | `2px 0` |

**Sidebar footer** (bottom of sidebar):

| Property | Value |
|----------|-------|
| Position | `absolute`, `bottom: 0`, `left: 0`, `right: 0` |
| Padding | `16px` |
| Border-top | `1px solid rgba(255,255,255,0.08)` |
| Content | User avatar (24px circle) + truncated email + Logout button |

Logout button:
- Icon: LogOut (16px), White at 65% opacity
- No label on desktop (icon only), tooltip "Sign out"
- On click: call `supabase.auth.signOut()`, redirect to `/login`

### Dashboard Topbar (`components/layout/DashboardTopbar.tsx`)

| Property | Value |
|----------|-------|
| Height | `56px` |
| Background | White (`#FFFFFF`) |
| Border-bottom | `1px solid rgba(12,31,64,0.08)` |
| Position | Sticky, top 0, `z-index: 30` |
| Padding | `0 32px` |
| Display | Flex, `align-items: center`, `justify-content: space-between` |

Left side: Page title — rendered by each page via a `<DashboardPageTitle>` slot or a shared context. For the dashboard home: **"Dashboard"** in Archivo Semi-Expanded, 20px, weight 500, Navy.

Right side:
- **Tenant name** — Inter, 14px, weight 500, Navy. Loaded from `tenants.name`.
- **Plan badge** — small tag showing current plan. See [Plan Badge](#plan-badge) component.

### Main Content Area

| Property | Value |
|----------|-------|
| Flex-grow | `1` |
| Padding | `32px` (all sides) |
| Max-width | `1200px` (centered within flex area) |
| Background | White Soft (`#F7F7F7`) |

---

## Page: Dashboard Home (`app/(dashboard)/page.tsx`)

### Server-Side Data Fetching

The page is a React Server Component. It fetches all data before rendering. No loading spinners on initial render — skeleton placeholders are shown only for client-side real-time updates.

**Supabase client:** Server-side Supabase client created with `createServerComponentClient({ cookies })` from `@supabase/ssr`.

**Queries executed (in parallel via `Promise.all`):**

```typescript
const [
  tenantResult,
  discordResult,
  apiKeysResult,
  serviceConnectionsResult,
  subscriptionResult,
] = await Promise.all([
  supabase
    .from('tenants')
    .select('id, name, plan, status, created_at')
    .single(),

  supabase
    .from('discord_connections')
    .select('id, guild_id, bot_user_id, bot_username, status, last_heartbeat, error_message, created_at')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle(),

  supabase
    .from('tenant_api_keys')
    .select('id, provider, is_valid, last_validated_at')
    .order('created_at', { ascending: true }),

  supabase
    .from('tenant_service_connections')
    .select('id, service, auth_type, status, connected_at, account_display_name')
    .eq('status', 'active'),

  supabase
    .from('tenant_subscriptions')
    .select('plan, status, current_period_end')
    .maybeSingle(),
]);
```

**Error handling:** If any query returns an error (not just empty), the page renders an [Error State](#error-state). Individual null results (no discord connection yet, no subscription yet) are handled per-section.

**RLS note:** The Supabase client uses the authenticated user's JWT. RLS policies automatically scope all queries to the user's tenant. No `tenant_id` filter needed in queries — RLS handles it.

---

## Page Sections (in render order)

```
1. [Onboarding Checklist]    — Shown only when tenant.status is 'pending' or 'configured'
2. [Bot Status Card]         — Always shown
3. [API Keys Card]           — Always shown
4. [Service Integrations Card] — Always shown (compact summary)
5. [Quick Stats Row]         — Always shown (message count, commands today, uptime)
6. [Recent Activity Feed]    — Always shown
```

---

## Section 1: Onboarding Checklist

**Visibility condition:** Rendered when `tenant.status === 'pending' OR tenant.status === 'configured'`. Hidden when `tenant.status === 'active'` or `'suspended'`.

When visible, this section appears at the TOP of the page above all other cards, spanning full width.

### Component: `OnboardingChecklist`

```
File: components/dashboard/OnboardingChecklist.tsx
```

**Container:**

| Property | Value |
|----------|-------|
| Background | White (`#FFFFFF`) |
| Border | `1.5px solid rgba(12,31,64,0.12)` |
| Border-radius | `0px` (PyMC sharp corners) |
| Padding | `24px 28px` |
| Margin-bottom | `24px` |
| Left accent stripe | `4px solid #B4E7DD` (Aqua) on left edge |

**Header:**

| Property | Value |
|----------|-------|
| Icon | Checklist / ListChecks icon, 20px, Navy |
| Title | "Get started" |
| Title font | Archivo Semi-Expanded, 16px, weight 500, Navy |
| Subtitle | "Complete these steps to bring your bot online." |
| Subtitle font | Inter, 14px, Navy at 65% opacity |
| Header layout | Flex, space-between |
| Dismiss button | NOT shown — checklist disappears automatically when all steps complete |

**Steps:**

Steps are displayed as a vertical list. Each step has: step number, title, description, status icon/badge, and optional CTA link.

| # | Step Title | Description | Completed When | CTA Link |
|---|-----------|-------------|----------------|----------|
| 1 | "Create your Discord bot" | "Go to the Discord Developer Portal, create a new application, and copy your bot token." | `discord_connections` row exists with non-null `bot_token_encrypted` | "Go to Discord Developer Portal →" (external link, opens new tab) |
| 2 | "Connect your Discord server" | "Paste your bot token and server (guild) ID to connect your bot to your Discord server." | `discord_connections` row exists AND status is not `pending` | "Add Discord Connection →" (links to `/dashboard/settings#discord`) |
| 3 | "Add your Anthropic API key" | "Paste your Anthropic API key so your bot can use Claude for conversations and tool use." | `tenant_api_keys` row with `provider = 'anthropic'` AND `is_valid = true` | "Add API Key →" (links to `/dashboard/billing#api-keys`) |
| 4 | "Wait for your bot to come online" | "Once your token and key are saved, your bot will connect automatically — usually within 30 seconds." | `discord_connections.status = 'connected'` | None (informational) |

**Step status icons:**

| State | Icon | Color | Border |
|-------|------|-------|--------|
| Completed | CheckCircle (filled) | Aqua (`#B4E7DD`) | None |
| Current (next to complete) | Circle (outline) with step number inside | Navy | `1.5px solid Navy` |
| Pending (not yet reachable) | Circle (outline) | Navy at 25% opacity | `1.5px solid rgba(12,31,64,0.25)` |

**Step layout per item:**

```
[Status Icon 20px] [Step content]                [CTA link]
                   [Title — Inter 14px w-500]
                   [Description — Inter 13px, Navy 65%]
```

- Item height: `auto`, min `52px`
- Item padding: `12px 0`
- Item border-bottom: `1px solid rgba(12,31,64,0.06)` (except last item)
- Completed items: title and description at 55% opacity, strikethrough NOT used

**Progress indicator:**

Below the header, before the step list: a thin horizontal progress bar.

| Property | Value |
|----------|-------|
| Track background | `rgba(12,31,64,0.08)` |
| Fill color | Aqua (`#B4E7DD`) |
| Height | `4px` |
| Border-radius | `0px` |
| Width | Calculated: `(completedSteps / totalSteps) * 100%` |
| Transition | `width 0.4s ease` |
| Label above bar | "Step {completedSteps} of {totalSteps}" — Inter, 12px, Navy at 55% |

**Completion animation:**

When the last step completes (bot status changes to `connected` via Realtime update):
1. All steps show checkmarks
2. Progress bar fills to 100%
3. After 1.5s delay, the entire checklist fades out (`opacity: 0, height: 0, overflow: hidden`) with CSS transition `0.4s ease`
4. A success toast appears: "Your bot is online! Daimon is now active in your Discord server." (see Toast spec)
5. The page re-renders without the checklist

---

## Section 2: Bot Status Card

**Always visible.** Placed immediately after the onboarding checklist (if shown), otherwise at the top of the page.

### Component: `BotStatusCard`

```
File: components/dashboard/BotStatusCard.tsx
Props: { connection: DiscordConnection | null }
```

**Receives real-time updates** via Supabase Realtime subscription on `discord_connections` table filtered to the tenant's connection ID. Updates `status`, `last_heartbeat`, and `error_message` without re-fetching.

**Container:**

| Property | Value |
|----------|-------|
| Background | White (`#FFFFFF`) |
| Border | `1.5px solid rgba(12,31,64,0.12)` |
| Border-radius | `0px` |
| Padding | `24px 28px` |
| Width | `100%` |

**Card header:**

| Property | Value |
|----------|-------|
| Title | "Bot Status" |
| Title font | Archivo Semi-Expanded, 14px, weight 500, Navy at 65% (uppercase, letter-spacing 0.06em — label style) |
| Icon | Bot/Robot icon, 16px, Navy at 45% |
| Layout | Flex, align-items center, gap 8px |

**Status display (main content):**

Centered vertically in the card. Three possible status states:

---

### Bot Status: Connected

| Element | Value |
|---------|-------|
| Status dot | 12px circle, background `#22C55E` (green-500), animated pulse ring |
| Status text | "Connected" — Archivo Semi-Expanded, 28px, weight 500, Navy |
| Subtext | "Bot is online and active in your server" — Inter, 14px, Navy at 65% |
| Bot identity | `@{bot_username}` with Discord bot icon — Inter, 14px, Navy |
| Guild ID | "Server ID: {guild_id}" — Inter, 12px, Navy at 45%, monospace font |
| Last heartbeat | "Last seen {relative-time}" — Inter, 12px, Navy at 45% |

Pulse animation:
```css
@keyframes pulse-ring {
  0% { transform: scale(1); opacity: 0.6; }
  100% { transform: scale(2); opacity: 0; }
}
.pulse-dot::before {
  content: '';
  position: absolute;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #22C55E;
  animation: pulse-ring 2s ease-out infinite;
}
```

Relative time format for last heartbeat:
- < 60s ago: "just now"
- 1–59 min ago: "{n} minute(s) ago"
- 1+ hours ago: displays in format "HH:MM" (stale — should trigger warning)

**Stale heartbeat warning** (shown if `last_heartbeat` > 2 minutes old but status is still `connected`):

- Yellow warning icon + text: "Heartbeat delayed — bot may be unresponsive" in Inter, 13px, `#CA8A04` (amber-600)
- Background of card bottom section: `rgba(234, 179, 8, 0.06)`

---

### Bot Status: Connecting

| Element | Value |
|---------|-------|
| Status dot | 12px circle, background `#F59E0B` (amber), animated slow blink |
| Status text | "Connecting…" — Archivo Semi-Expanded, 28px, weight 500, Navy |
| Subtext | "Your bot is establishing a connection. This usually takes under 30 seconds." — Inter, 14px, Navy at 65% |
| Animation | Dots ellipsis animation on "Connecting" text |

---

### Bot Status: Error

| Element | Value |
|---------|-------|
| Status dot | 12px circle, background `#EF4444` (red-500) |
| Status text | "Connection Error" — Archivo Semi-Expanded, 28px, weight 500, Navy |
| Error message | Contents of `discord_connections.error_message` — Inter, 14px, `#DC2626` (red-600) |
| Subtext | "Check your bot token in Settings and try reconnecting." — Inter, 14px, Navy at 65% |
| CTA | Button: "Go to Settings" → `/dashboard/settings#discord` — Secondary button style, small (height 36px) |

---

### Bot Status: Disconnected

| Element | Value |
|---------|-------|
| Status dot | 12px circle, background `rgba(12,31,64,0.25)` (gray, no animation) |
| Status text | "Disconnected" — Archivo Semi-Expanded, 28px, weight 500, Navy at 65% |
| Subtext | "Your bot is not currently connected to Discord." — Inter, 14px, Navy at 65% |
| CTA | Button: "Connect Discord Bot" → `/dashboard/settings#discord` — Primary button style, small |

---

### Bot Status: No Connection Configured (null)

Shown when `connection` prop is `null` (no `discord_connections` row exists yet).

| Element | Value |
|---------|-------|
| Illustration | Dashed border rectangle, 120px height, centered — with bot outline icon (48px, Navy at 20%) |
| Empty state title | "No bot connected yet" — Inter, 15px, weight 500, Navy |
| Empty state body | "Connect your Discord bot to get started." — Inter, 14px, Navy at 65% |
| CTA | "Add Discord Connection" → `/dashboard/settings#discord` — Primary button style |

---

### Bot Status: Suspended

| Element | Value |
|---------|-------|
| Status dot | 12px circle, background `rgba(12,31,64,0.4)` |
| Card border | `1.5px solid #EF4444` (red) |
| Banner | Full-width red banner at top of card: "Account suspended — bot is offline" |
| Status text | "Suspended" — Archivo Semi-Expanded, 28px, weight 500, Navy at 65% |
| Subtext | "Your account has been suspended. Contact support to resolve." — Inter, 14px, Navy at 65% |
| CTA | "Contact Support" → `mailto:support@daimon.ai` |

---

**Bot Status Card footer:**

| Element | Value |
|---------|-------|
| Layout | Flex, space-between, align-center |
| Border-top | `1px solid rgba(12,31,64,0.06)` |
| Padding-top | `16px`, margin-top `16px` |
| Left | Guild name: "Connected to: {guild_id}" — Inter, 13px, Navy at 55% (hidden when no connection) |
| Right | "Manage" link → `/dashboard/settings#discord` — Inter, 13px, Aqua, hover underline |

---

## Section 3: API Keys Card

**Always visible.** Placed to the right of the Bot Status Card on desktop (two-column grid), full-width on mobile.

### Component: `ApiKeysCard`

```
File: components/dashboard/ApiKeysCard.tsx
Props: { apiKeys: ApiKey[] }
```

**Container:** Same as Bot Status Card (White, 1.5px border, 0px radius, 24px 28px padding).

**Card header:**

| Property | Value |
|----------|-------|
| Title | "API Keys" |
| Title style | Same as Bot Status Card label style |
| Icon | Key icon, 16px, Navy at 45% |

**Key list:**

One row per API key. At launch: up to 2 rows (`anthropic`, `openai`).

| Column | Value |
|--------|-------|
| Provider icon | Anthropic logo SVG (20px) / OpenAI logo SVG (20px) |
| Provider name | "Anthropic" / "OpenAI" |
| Provider font | Inter, 14px, weight 500, Navy |
| Status badge | See [Key Status Badge](#key-status-badge) |
| Last validated | "Validated {relative-time}" — Inter, 12px, Navy at 45% |
| Action | "Update" button (ghost, 12px, 32px height) → opens update key modal |

**If no Anthropic key exists:**

| Element | Value |
|---------|-------|
| Row style | Same layout but dashed border on row |
| Status badge | "Not configured" badge — gray |
| Action | "Add Key" button (Primary, small) → links to `/dashboard/billing#api-keys` |
| Warning banner | "Required: Add your Anthropic API key to activate your bot." |

**If Anthropic key is invalid (`is_valid = false`):**

| Element | Value |
|---------|-------|
| Row style | Red tint: `background: rgba(239,68,68,0.04)` |
| Status badge | "Invalid" badge — red |
| Warning text | "This key is invalid. Conversations will fail until you update it." — Inter, 13px, red |
| Action | "Update Key" button (Secondary, small) |

### Key Status Badge

| Status | Label | Background | Text color |
|--------|-------|-----------|-----------|
| Valid | "Valid" | `rgba(34,197,94,0.12)` | `#16A34A` |
| Invalid | "Invalid" | `rgba(239,68,68,0.12)` | `#DC2626` |
| Not configured | "Not configured" | `rgba(12,31,64,0.08)` | Navy at 55% |
| Validating | "Checking…" | `rgba(245,158,11,0.12)` | `#D97706` |

Badge styling:
- Font: Inter, 12px, weight 500
- Padding: `2px 8px`
- Border-radius: `0px`
- Border: `1.5px solid currentColor` at 30% opacity

**OpenAI key row:** Always shown but labeled "(Optional)". No warning if missing.

**Card footer:**

| Element | Value |
|---------|-------|
| Text | "BYOK — you pay Anthropic directly. Daimon charges a small platform fee." |
| Font | Inter, 12px, Navy at 45% |
| Link | "Learn more" → `/docs#billing` |

---

## Section 4: Service Integrations Card (Compact Summary)

**Always visible.** Full-width below the two-column row.

This is a compact view. Full management is on `/dashboard/integrations`.

### Component: `IntegrationsSummaryCard`

```
File: components/dashboard/IntegrationsSummaryCard.tsx
Props: { connections: ServiceConnection[] }
```

**Container:** White, 1.5px border, 0px radius, 24px 28px padding.

**Header:**

| Property | Value |
|----------|-------|
| Title | "Integrations" |
| Title style | Label style (same as other cards) |
| Icon | Plug icon, 16px, Navy at 45% |
| Right header | "Manage all →" link → `/dashboard/integrations` — Inter, 13px, Aqua |

**Integration grid:**

All 7 supported services displayed in a 7-column icon grid (desktop). On mobile: 4 columns, wrap.

| Service | Icon | Color when connected | Color when disconnected |
|---------|------|---------------------|------------------------|
| GitHub | GitHub SVG | Navy (full opacity) | Navy at 25% |
| Google | Google SVG | Navy (full opacity) | Navy at 25% |
| Linear | Linear SVG | Navy (full opacity) | Navy at 25% |
| Toggl | Toggl SVG | Navy (full opacity) | Navy at 25% |
| Slack (future) | Slack SVG | Navy (full opacity) | Navy at 25% |
| Notion (future) | Notion SVG | Navy (full opacity) | Navy at 25% |
| Jira (future) | Jira SVG | Navy (full opacity) | Navy at 25% |

**Integration icon cell:**

| Property | Value |
|----------|-------|
| Size | 48px × 48px |
| Background connected | `rgba(180,231,221,0.15)` (15% Aqua) |
| Background disconnected | `rgba(12,31,64,0.04)` |
| Border | `1.5px solid rgba(12,31,64,0.08)` |
| Border-radius | `0px` |
| Icon size | 24px |
| Tooltip | Service name + "(Connected)" or "(Not connected)" |

Tooltip implementation:
- HTML `title` attribute for basic tooltip
- On hover: custom `TooltipPopover` component appears after 300ms delay
- Tooltip background: Navy, text: White, font: Inter, 12px
- Tooltip offset: 8px above the icon

**Connected count:**

Below the grid:
- "5 of 7 services connected" — Inter, 13px, Navy at 55%
- If 0 connected: "No services connected yet. Connect integrations to unlock more tools."

**Empty state** (no connections at all):

| Element | Value |
|---------|-------|
| Grid hidden | Yes |
| Illustration | Row of 4 gray placeholder service boxes |
| Text | "No integrations connected" — Inter, 15px, weight 500, Navy at 65% |
| Body | "Connect GitHub, Google, Linear, and more to unlock the full power of your bot." |
| CTA | "Connect Services" → `/dashboard/integrations` — Primary button, small |

---

## Section 5: Quick Stats Row

**Always visible.** Three equal-width stat cards in a row below the integrations card.

### Component: `QuickStatsRow`

```
File: components/dashboard/QuickStatsRow.tsx
Props: { stats: DashboardStats }
```

**Layout:** CSS Grid, `grid-template-columns: repeat(3, 1fr)`, gap `24px`.

On mobile: `grid-template-columns: 1fr`, stacked.

**Data source:** Queried from the existing bot tables (read by website via service role or via Supabase views):

```typescript
// Query: message count today
const { data: messageStats } = await supabase
  .from('messages')
  .select('id', { count: 'exact', head: true })
  .gte('created_at', startOfTodayUTC);

// Query: tool calls today
const { data: toolStats } = await supabase
  .from('tool_calls')
  .select('id', { count: 'exact', head: true })
  .gte('created_at', startOfTodayUTC);

// Query: bot uptime — derived from discord_connections.last_heartbeat and status
// If status = 'connected' and last_heartbeat is recent: calculate uptime from connected_at
```

**Note:** If the `messages` and `tool_calls` tables are not accessible via the website's RLS policy, these stats will show `—` (em dash). The stats section is informational and degrades gracefully.

### Stat Card: "Messages Today"

| Property | Value |
|----------|-------|
| Icon | MessageSquare icon, 20px, Navy at 45% |
| Label | "Messages Today" — Inter, 12px, weight 500, Navy at 55%, uppercase, letter-spacing 0.06em |
| Value | Integer count, e.g., "47" — Archivo Expanded, 32px, weight 700, Navy |
| Subvalue | "in the last 24 hours" — Inter, 12px, Navy at 45% |
| No data | "—" (em dash) in place of value |

### Stat Card: "Tool Uses Today"

| Property | Value |
|----------|-------|
| Icon | Wrench/Tool icon, 20px, Navy at 45% |
| Label | "Tool Uses Today" |
| Value | Integer count, e.g., "12" |
| Subvalue | "commands executed" |
| No data | "—" |

### Stat Card: "Uptime"

| Property | Value |
|----------|-------|
| Icon | Activity icon, 20px, Navy at 45% |
| Label | "Uptime" |
| Value | Formatted duration, e.g., "3d 14h" — Archivo Expanded, 32px, weight 700, Navy |
| Subvalue | "since last connection" |
| Value when disconnected | "—" |

**Stat card container:**

| Property | Value |
|----------|-------|
| Background | White |
| Border | `1.5px solid rgba(12,31,64,0.12)` |
| Padding | `20px 24px` |
| Border-radius | `0px` |
| Left accent stripe | `3px solid rgba(180,231,221,0.6)` (60% Aqua — PyMC CI accent band 3) |

---

## Section 6: Recent Activity Feed

**Always visible.** Full-width, below the stats row.

### Component: `RecentActivityFeed`

```
File: components/dashboard/RecentActivityFeed.tsx
Props: { events: ActivityEvent[] }
```

**Data source:** Combination of:
- Recent `discord_connections` status changes (joined at, last_heartbeat)
- Recent service connections (`tenant_service_connections.connected_at`)
- Recent API key validations (`tenant_api_keys.last_validated_at`)
- Recent billing events (from `tenant_subscriptions` updates)

Query:
```typescript
// Synthesize from multiple tables; max 10 most recent events
// Sorted by timestamp descending
```

**Container:** White, 1.5px border, 0px radius, 24px 28px padding.

**Header:**

| Property | Value |
|----------|-------|
| Title | "Recent Activity" |
| Title style | Label style |
| Icon | Activity/Clock icon, 16px, Navy at 45% |

**Event list:**

Each row:

| Element | Value |
|---------|-------|
| Icon | Event-type icon, 20px circle background (see event types below) |
| Event text | Human-readable description (see event types below) |
| Timestamp | Relative time — Inter, 12px, Navy at 45% |

**Event types:**

| Event type | Icon | Icon bg color | Description text |
|-----------|------|--------------|-----------------|
| Bot connected | Zap icon | `rgba(34,197,94,0.12)` | "Bot connected to Discord server" |
| Bot disconnected | ZapOff icon | `rgba(239,68,68,0.12)` | "Bot disconnected from Discord" |
| Bot error | AlertTriangle icon | `rgba(239,68,68,0.12)` | "Bot encountered a connection error" |
| API key added | Key icon | `rgba(180,231,221,0.3)` | "Anthropic API key added and validated" |
| API key invalid | KeyRound icon | `rgba(239,68,68,0.12)` | "Anthropic API key validation failed" |
| Service connected | Plug icon | `rgba(180,231,221,0.3)` | "{Service name} connected" |
| Service expired | PlugZap icon | `rgba(245,158,11,0.12)` | "{Service name} token expired — reconnect required" |
| Plan upgraded | CreditCard icon | `rgba(180,231,221,0.3)` | "Plan upgraded to {plan name}" |
| Plan downgraded | CreditCard icon | `rgba(245,158,11,0.12)` | "Plan changed to {plan name}" |
| Account created | User icon | `rgba(159,170,226,0.3)` | "Account created" |

**Empty state:**

| Element | Value |
|---------|-------|
| Icon | Activity icon, 40px, Navy at 20% |
| Title | "No activity yet" |
| Body | "Activity will appear here once your bot is connected and running." |

**"View all" link:** Not shown at launch — this is the full feed with max 10 items.

---

## Plan Badge Component

```
File: components/ui/PlanBadge.tsx
Props: { plan: 'free' | 'starter' | 'pro' }
```

| Plan | Label | Background | Text color | Border |
|------|-------|-----------|-----------|--------|
| `free` | "Free" | `rgba(12,31,64,0.08)` | Navy at 65% | `1.5px solid rgba(12,31,64,0.15)` |
| `starter` | "Starter" | `rgba(180,231,221,0.2)` | Navy | `1.5px solid rgba(180,231,221,0.6)` |
| `pro` | "Pro" | `rgba(12,31,64,0.85)` | White | None |

Styling:
- Font: Inter, 11px, weight 600, uppercase, letter-spacing 0.08em
- Padding: `2px 8px`
- Border-radius: `0px`

---

## Loading States

### Initial Page Load

The page is a Server Component — data is fetched before HTML reaches the browser. No global spinner. However:

- If the Supabase queries take > 500ms (rare), Next.js Suspense boundary shows skeleton UI.
- Skeleton is triggered via `loading.tsx` file at `app/(dashboard)/loading.tsx`.

**Skeleton layout:**

```
[Skeleton bar — 60% width, 20px height, animated shimmer]  ← "Tenant name"
[Skeleton card — full width, 120px height]                  ← Bot Status Card
[Skeleton card row — two 50% cards, 80px height]            ← API Keys + placeholder
[Skeleton card — full width, 80px height]                   ← Integrations
[Skeleton row — three 33% cards, 60px height]               ← Stats
[Skeleton card — full width, 200px height]                  ← Activity feed
```

Shimmer animation:
```css
@keyframes shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}
.skeleton {
  background: linear-gradient(
    90deg,
    rgba(12,31,64,0.04) 25%,
    rgba(12,31,64,0.08) 50%,
    rgba(12,31,64,0.04) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}
```

### Real-Time Update Loading

When a Supabase Realtime event fires and triggers a status update:
- The specific card that's updating shows a 1px Aqua spinner in its top-right corner for 500ms
- Then transitions to the new state with `transition: all 0.25s ease`
- No full-page re-render

---

## Error States

### Full Page Error

If the primary `tenants` query fails:

```
File: app/(dashboard)/error.tsx
```

| Element | Value |
|---------|-------|
| Background | White Soft |
| Icon | AlertCircle, 48px, Navy at 35% |
| Title | "Something went wrong" — Archivo Semi-Expanded, 24px, Navy |
| Body | "We couldn't load your dashboard. Please try refreshing the page." — Inter, 15px, Navy at 65% |
| CTA | "Refresh Page" button (Primary) — calls `router.refresh()` |
| Secondary CTA | "Contact Support" → `mailto:support@daimon.ai` (Ghost) |

### Card-Level Error

If an individual card's query fails (e.g., `discord_connections` query errors):
- The card renders with a gray dashed border
- Inside: AlertCircle icon (24px) + "Failed to load — refresh to retry" in Inter, 13px, Navy at 55%
- A "Retry" button (Ghost, 13px) re-fetches that card's data via client-side route refresh

### Supabase Realtime Disconnected

If the real-time WebSocket connection drops:
- A non-intrusive yellow banner appears at the top of the main content: "Live updates paused — reconnecting…"
- Banner background: `rgba(245,158,11,0.1)`, text: `#D97706`, font: Inter, 13px
- When reconnected: banner disappears with `opacity: 0` transition
- After 5 failed reconnect attempts: banner changes to "Live updates unavailable. Refresh for latest status."

---

## Empty States (First-Time User)

When a new user first reaches the dashboard (status = `pending`, no connections):

1. **Onboarding checklist** is shown at top (see Section 1)
2. **Bot Status Card** shows "No bot connected yet" empty state
3. **API Keys Card** shows warning banner: "Required: Add your Anthropic API key"
4. **Integrations Card** shows empty grid with CTA
5. **Stats Row** all show "—"
6. **Activity Feed** shows empty state

**First-time welcome message:**

If `tenant.created_at` is within the last 5 minutes, show a dismissible welcome banner before the onboarding checklist:

| Element | Value |
|---------|-------|
| Container | Full-width, bg `rgba(180,231,221,0.15)`, border `1.5px solid rgba(180,231,221,0.6)`, padding `16px 20px` |
| Icon | Sparkles icon, 20px, Navy |
| Title | "Welcome to Daimon, {user display name or email prefix}!" |
| Body | "Your account is ready. Follow the steps below to bring your Discord bot online." |
| Dismiss button | X icon, 16px, Navy at 45%. On click: saves dismissal to `localStorage` key `daimon_welcome_dismissed_{userId}`. Does not call any API. |

---

## Responsive Behavior

### Desktop (≥ 1280px)

```
┌─────────────────────────────────────────────────────────────┐
│ [Sidebar 240px] │ [Main content — max-width 1200px]         │
│                 │                                           │
│                 │ [Onboarding Checklist — full width]       │
│                 │                                           │
│                 │ [Bot Status Card 60%] [API Keys Card 40%] │
│                 │                                           │
│                 │ [Integrations Summary Card — full width]  │
│                 │                                           │
│                 │ [Stats 33%] [Stats 33%] [Stats 33%]      │
│                 │                                           │
│                 │ [Recent Activity Feed — full width]       │
└─────────────────────────────────────────────────────────────┘
```

- Sidebar: fixed, 240px
- Main: `margin-left: 240px`, padding `32px`
- Bot Status + API Keys: CSS Grid, `grid-template-columns: 3fr 2fr`, gap `24px`
- Stats: CSS Grid, `repeat(3, 1fr)`, gap `24px`
- Integrations icon grid: 7 columns

### Tablet (768px–1279px)

```
┌─────────────────────────────────────────────────────────────┐
│ [Sidebar 200px] │ [Main content]                            │
│                 │                                           │
│                 │ [Onboarding Checklist — full width]       │
│                 │ [Bot Status Card — full width]            │
│                 │ [API Keys Card — full width]              │
│                 │ [Integrations — full width]               │
│                 │ [Stats 50%] [Stats 50%]                   │
│                 │ [Stats — full width (third)]              │
│                 │ [Activity — full width]                   │
└─────────────────────────────────────────────────────────────┘
```

- Sidebar: collapses to 200px (icon + abbreviated label)
- Bot Status + API Keys: stack vertically, `grid-template-columns: 1fr`
- Stats: `grid-template-columns: 1fr 1fr`, third card spans full width
- Integrations icon grid: 4 columns, wraps

### Mobile (375px–767px)

```
┌─────────────────────────┐
│ [Mobile header bar 56px]│  ← Hamburger + "Dashboard" title + tenant badge
│                         │
│ [Onboarding Checklist]  │
│ [Bot Status Card]       │
│ [API Keys Card]         │
│ [Integrations]          │
│ [Stat — full width]     │
│ [Stat — full width]     │
│ [Stat — full width]     │
│ [Activity Feed]         │
│                         │
│ [Bottom nav bar]        │  ← 56px, 5 nav icons
└─────────────────────────┘
```

**Mobile-specific changes:**

| Element | Change |
|---------|--------|
| Sidebar | Hidden; replaced by bottom navigation bar |
| Bottom nav bar | 56px height, White bg, 5 icons: Dashboard, Integrations, Billing, Settings, Docs |
| Page padding | `16px` (all sides) |
| Card padding | `16px 16px` |
| Bot status value size | Archivo Expanded 22px (from 28px) |
| Stats row | All 3 cards stacked vertically, full width |
| Integrations grid | 4 columns (wraps to 2 rows for 7+ services) |
| Topbar | Shows hamburger icon (opens sidebar as slide-over overlay) |
| Welcome banner | Shown but with condensed copy |

**Mobile bottom navigation bar:**

| Property | Value |
|----------|-------|
| Position | Fixed, `bottom: 0`, `left: 0`, `right: 0` |
| Height | `56px + env(safe-area-inset-bottom)` (iOS safe area) |
| Background | White |
| Border-top | `1px solid rgba(12,31,64,0.08)` |
| z-index | `50` |
| Items | 5 icons with labels — Dashboard, Integrations, Billing, Settings, Docs |
| Icon size | 22px |
| Label font | Inter, 10px, weight 500 |
| Active color | Navy |
| Inactive color | Navy at 35% |
| Touch target | Full width of each slot (20% each), min 44px height |

---

## Data Types (TypeScript)

```typescript
// app/types/dashboard.ts

export interface Tenant {
  id: string;
  name: string;
  plan: 'free' | 'starter' | 'pro';
  status: 'pending' | 'configured' | 'active' | 'suspended';
  created_at: string; // ISO 8601
}

export interface DiscordConnection {
  id: string;
  guild_id: string;
  bot_user_id: string | null;
  bot_username: string | null;
  status: 'pending' | 'connecting' | 'connected' | 'disconnected' | 'error' | 'suspended';
  last_heartbeat: string | null; // ISO 8601
  error_message: string | null;
  created_at: string;
}

export interface ApiKey {
  id: string;
  provider: 'anthropic' | 'openai';
  is_valid: boolean;
  last_validated_at: string | null; // ISO 8601
}

export interface ServiceConnection {
  id: string;
  service: string; // 'github' | 'google' | 'linear' | 'toggl' | ...
  auth_type: 'oauth' | 'api_key';
  status: 'active' | 'expired' | 'revoked' | 'error';
  connected_at: string;
  account_display_name: string | null; // e.g., GitHub username
}

export interface TenantSubscription {
  plan: 'free' | 'starter' | 'pro';
  status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'paused' | 'unpaid';
  current_period_end: string | null;
}

export interface DashboardStats {
  messagesToday: number | null;
  toolUsesToday: number | null;
  uptimeSeconds: number | null;
}

export type ActivityEventType =
  | 'bot_connected'
  | 'bot_disconnected'
  | 'bot_error'
  | 'api_key_added'
  | 'api_key_invalid'
  | 'service_connected'
  | 'service_expired'
  | 'plan_upgraded'
  | 'plan_downgraded'
  | 'account_created';

export interface ActivityEvent {
  type: ActivityEventType;
  timestamp: string; // ISO 8601
  metadata: Record<string, string>; // e.g., { service: 'github', plan: 'starter' }
}

export interface DashboardPageData {
  tenant: Tenant;
  discordConnection: DiscordConnection | null;
  apiKeys: ApiKey[];
  serviceConnections: ServiceConnection[];
  subscription: TenantSubscription | null;
  stats: DashboardStats;
  recentActivity: ActivityEvent[];
}
```

---

## Supabase Realtime Subscriptions (Client Component)

The client-side wrapper (`DashboardRealtimeProvider.tsx`) sets up subscriptions after hydration:

```typescript
// components/dashboard/DashboardRealtimeProvider.tsx
// This is a Client Component ('use client')

const channel = supabase.channel(`dashboard:${tenantId}`)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'discord_connections',
    filter: `tenant_id=eq.${tenantId}`,
  }, (payload) => {
    // Update discordConnection state
    setDiscordConnection(payload.new as DiscordConnection);
  })
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'tenant_api_keys',
    filter: `tenant_id=eq.${tenantId}`,
  }, (payload) => {
    // Update apiKeys state
    setApiKeys(prev => upsertById(prev, payload.new as ApiKey));
  })
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'tenants',
    filter: `id=eq.${tenantId}`,
  }, (payload) => {
    // Update tenant status (e.g., pending → active)
    setTenant(prev => ({ ...prev, ...(payload.new as Partial<Tenant>) }));
  })
  .subscribe();

// Cleanup on unmount
return () => { supabase.removeChannel(channel); };
```

Channel name format: `dashboard:{tenantId}` — matches the Realtime channel spec in [../multi-tenant/realtime-contract.md](../multi-tenant/realtime-contract.md).

---

## Accessibility

| Element | ARIA implementation |
|---------|---------------------|
| Sidebar nav | `<nav aria-label="Main navigation">` |
| Active nav item | `aria-current="page"` |
| Status indicators | `role="status"` on status text containers; `aria-live="polite"` for real-time updates |
| Bot status card | `aria-label="Bot connection status: {status}"` on card container |
| Onboarding step list | `<ol aria-label="Setup steps">`, each `<li aria-label="Step {n}: {title} — {completed ? 'completed' : 'pending'}"` |
| Progress bar | `role="progressbar" aria-valuenow="{completedSteps}" aria-valuemin="0" aria-valuemax="{totalSteps}"` |
| Skeleton loading | `aria-busy="true" aria-label="Loading dashboard"` on skeleton container |
| Plan badge | `aria-label="Current plan: {plan}"` |
| Service icon grid | Each icon: `aria-label="{service} — {connected ? 'Connected' : 'Not connected'}"` |

Keyboard navigation:
- Tab order: Sidebar links → Topbar → Onboarding checklist → Bot card → API Keys card → Integrations → Stats → Activity
- All CTAs and links reachable via Tab key
- Escape closes any open modal or slide-over
- Focus management: when a modal opens, focus moves to the first focusable element inside it; when closed, focus returns to the trigger

---

## File Structure

```
app/
  (dashboard)/
    layout.tsx                        # Dashboard shell with Sidebar + Topbar
    page.tsx                          # Dashboard home (Server Component)
    loading.tsx                       # Skeleton for Suspense boundary
    error.tsx                         # Error boundary UI

components/
  layout/
    Sidebar.tsx                       # Fixed sidebar with nav items
    DashboardTopbar.tsx               # Sticky topbar
    MobileBottomNav.tsx               # Mobile-only bottom nav
  dashboard/
    OnboardingChecklist.tsx           # Setup steps with progress
    BotStatusCard.tsx                 # Discord connection status
    ApiKeysCard.tsx                   # Anthropic/OpenAI key status
    IntegrationsSummaryCard.tsx       # Compact integration grid
    QuickStatsRow.tsx                 # Three stat cards
    RecentActivityFeed.tsx            # Activity event list
    DashboardRealtimeProvider.tsx     # Client component for Realtime subscriptions
  ui/
    PlanBadge.tsx                     # Free/Starter/Pro badge
    StatusDot.tsx                     # Animated status indicator dot
    KeyStatusBadge.tsx                # API key validity badge
    SkeletonCard.tsx                  # Reusable skeleton shimmer block
```

---

## Cross-References

- [database/schema.md](../database/schema.md) — `tenants`, `discord_connections`, `tenant_api_keys`, `tenant_service_connections`, `tenant_subscriptions` tables
- [database/rls-policies.md](../database/rls-policies.md) — RLS policies that gate all queries
- [multi-tenant/realtime-contract.md](../multi-tenant/realtime-contract.md) — Supabase Realtime channel specs
- [multi-tenant/health-monitoring.md](../multi-tenant/health-monitoring.md) — Heartbeat interval and stale detection logic
- [frontend/auth-pages.md](./auth-pages.md) — Redirect rules and auth session management
- [frontend/integrations-page.md](./integrations-page.md) — Full integrations management (linked from compact summary card)
- [frontend/billing-page.md](./billing-page.md) — API key management (linked from API Keys card footer)
- [frontend/settings-page.md](./settings-page.md) — Discord connection management (linked from Bot Status card)
