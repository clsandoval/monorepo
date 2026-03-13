# Loading States & Empty States — Complete Specification

> Applies to: Every page in the Daimon website
> Last updated: 2026-03-13
> Related files:
>   - [component-library.md](./component-library.md) — SkeletonLoader, EmptyState, Spinner components
>   - [copy.md](./copy.md) — All empty state copy strings
>   - [dashboard.md](./dashboard.md) — Dashboard page spec
>   - [integrations-page.md](./integrations-page.md) — Integrations page spec
>   - [billing-page.md](./billing-page.md) — Billing page spec
>   - [settings-page.md](./settings-page.md) — Settings page spec
>   - [admin-panel.md](./admin-panel.md) — Admin panel spec

---

## Overview

Every page and component in the Daimon website must handle three temporal states:

1. **Loading state** — Data is being fetched or an action is in progress. The user must see progress feedback within 100ms of initiating an action. Never show a blank white screen.
2. **Empty state** — Data fetch succeeded but returned no results, or the user has not yet completed setup. Always provide context and a clear next action.
3. **Loaded state** — Data is available and rendered normally (documented in the page-level specs).

This document audits every page and specifies each loading and empty state exactly. For Supabase server components, Next.js `loading.tsx` files provide skeleton UIs automatically (streaming SSR). For client-side mutations, inline spinners replace action buttons.

---

## Global Patterns

### Pattern 1: Server Component Initial Load (Skeleton via `loading.tsx`)

Next.js App Router streams server components. When a route has a `loading.tsx` sibling, Next.js shows it while the Server Component fetches data. All authenticated pages have a `loading.tsx`.

**Skeleton animation (shared across all skeletons):**

```css
/* globals.css */
@keyframes shimmer {
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
}

.skeleton {
  background: linear-gradient(
    90deg,
    rgba(12, 31, 64, 0.04) 25%,
    rgba(12, 31, 64, 0.08) 50%,
    rgba(12, 31, 64, 0.04) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: 0px; /* No border-radius per PyMC brand */
}
```

All skeleton placeholder blocks use the `.skeleton` class. Sizes match the rendered element they replace.

**ARIA on skeleton containers:**

```html
<div aria-busy="true" aria-label="Loading {page name}" role="status">
  <!-- skeleton blocks -->
</div>
```

---

### Pattern 2: Client-Side Mutation Loading (Inline Spinner)

When a form submission or async action is in progress:

- The primary action button shows a `Loader2` icon (Lucide, 14px) spinning at `1s linear infinite`
- Button text is replaced by a loading label (e.g., "Saving…", "Connecting…", "Deleting…")
- The button is disabled (`pointer-events: none`, `opacity: 0.75`)
- Other form fields remain enabled (no full-page lock unless destructive)
- Timeout: if the action exceeds 30 seconds, the button resets to its default state and shows an error toast: **"Request timed out. Please try again."**

---

### Pattern 3: Empty State Component (`<EmptyState />`)

See [component-library.md § EmptyState](./component-library.md) for the full component spec.

Every empty state includes:
1. An icon (Lucide, 48px, `#0C1F40` at 30% opacity)
2. A title (Archivo SemiBold, 16px, `#0C1F40`)
3. A subtitle (Inter Regular, 13px, `#6B7280`, max-width 320px, centered)
4. An optional CTA button (primary variant)

Empty states are **never** just a blank area or only a loading spinner. They always explain why the area is empty and what the user should do.

---

## 1. Landing Page (`/`)

The landing page is a static marketing page with no authenticated data fetching. All content is statically rendered.

### Loading States

| Element | Loading Behavior |
|---------|-----------------|
| Page initial load | No skeleton — full HTML served from Vercel Edge CDN (ISR). First paint < 200ms. |
| "Get Started" CTA button | No loading state. Click navigates immediately to `/signup`. |
| "Sign In" link | No loading state. Click navigates immediately to `/login`. |
| Pricing section | Statically rendered. No fetch needed. |
| Testimonials/social proof | Statically rendered. No fetch needed. |

### Empty States

Not applicable — the landing page has no user-specific data and no areas that can be empty.

---

## 2. Auth Pages

### 2a. Signup Page (`/signup`)

#### Loading States

**Form submission (clicking "Create Account" button):**

| Phase | What the user sees |
|-------|--------------------|
| Button clicked | Button text changes to "Creating account…"; `Loader2` spinner appears left of text; button disabled |
| Supabase `signUp()` in progress (0–3s typical) | Button remains in loading state; form fields remain enabled |
| On success | Button resets; page shows success confirmation: **"Check your email. We sent a confirmation link to {email}."** — no redirect yet |
| On error | Button resets; inline error shown below email field (see validation-rules.md for specific messages) |
| Timeout (> 30s) | Button resets; error toast: **"Signup request timed out. Please try again."** |

**Google OAuth button ("Continue with Google"):**

| Phase | What the user sees |
|-------|--------------------|
| Button clicked | Button text changes to "Redirecting…"; `Loader2` spinner; button disabled |
| Redirect initiated | Browser navigates to Google OAuth. User leaves the page. |

#### Empty States

Not applicable — signup is a form page. There is no "empty" concept.

---

### 2b. Login Page (`/login`)

#### Loading States

**Form submission ("Sign In" button):**

| Phase | What the user sees |
|-------|--------------------|
| Button clicked | Button text: "Signing in…"; `Loader2` spinner; button disabled |
| Supabase `signInWithPassword()` in progress | Button in loading state |
| On success | Button resets; router.push(`/dashboard`) or `?next=` param destination |
| On error | Button resets; inline error below password field |
| Timeout (> 30s) | Button resets; error toast: **"Sign in request timed out. Please try again."** |

**Google OAuth button:**

Same as signup — "Redirecting…" + spinner on click.

#### Empty States

Not applicable.

---

### 2c. Reset Password Page (`/reset-password`)

#### Loading States

**Step 1 — Request reset email ("Send Reset Link" button):**

| Phase | What the user sees |
|-------|--------------------|
| Button clicked | Button text: "Sending…"; `Loader2` spinner; button disabled |
| Supabase `resetPasswordForEmail()` in progress | Loading state |
| On success | Button resets; page replaces form with confirmation: **"Password reset link sent. Check your email."** |
| On error | Button resets; inline error below email field |

**Step 2 — Set new password ("Update Password" button) — accessed via email link:**

| Phase | What the user sees |
|-------|--------------------|
| Button clicked | Button text: "Updating…"; `Loader2` spinner; button disabled |
| Supabase `updateUser()` in progress | Loading state |
| On success | Button resets; success toast: **"Password updated successfully."**; redirect to `/login` after 2s |
| On error | Button resets; inline error below new password field |

#### Empty States

Not applicable.

---

## 3. Dashboard Home (`/dashboard`)

### 3a. Initial Page Load Skeleton

File: `app/(dashboard)/loading.tsx`

Shown while the Server Component fetches tenant data. Displayed for at most 1–2s on normal connections.

```html
<div class="page-content" aria-busy="true" aria-label="Loading dashboard" role="status">

  <!-- Page header skeleton -->
  <div style="margin-bottom: 32px;">
    <div class="skeleton" style="width: 220px; height: 28px; margin-bottom: 8px;"></div>
    <div class="skeleton" style="width: 340px; height: 16px;"></div>
  </div>

  <!-- Onboarding checklist skeleton (shown until bot connected) -->
  <div class="skeleton" style="width: 100%; height: 120px; margin-bottom: 24px;"></div>

  <!-- Row 1: Bot Status Card (full width) -->
  <div class="skeleton" style="width: 100%; height: 130px; margin-bottom: 24px;"></div>

  <!-- Row 2: API Keys Card + Placeholder (two columns) -->
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
    <div class="skeleton" style="height: 100px;"></div>
    <div class="skeleton" style="height: 100px;"></div>
  </div>

  <!-- Row 3: Integrations Card (full width) -->
  <div class="skeleton" style="width: 100%; height: 100px; margin-bottom: 24px;"></div>

  <!-- Row 4: Stats row (three columns) -->
  <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px;">
    <div class="skeleton" style="height: 72px;"></div>
    <div class="skeleton" style="height: 72px;"></div>
    <div class="skeleton" style="height: 72px;"></div>
  </div>

  <!-- Row 5: Activity Feed (full width) -->
  <div class="skeleton" style="width: 100%; height: 240px;"></div>

</div>
```

### 3b. Real-Time Update Loading (Client Side)

The dashboard subscribes to Supabase Realtime after initial render. When a status update arrives, individual cards update without a page reload. While a card's status is being updated (between receiving a Realtime event and re-rendering):

| Card | Transition behavior |
|------|---------------------|
| Bot Status Card | Card background fades to `rgba(180, 231, 221, 0.15)` for 300ms (Aqua tint) then re-renders with new status. No spinner. |
| Stats Row | Stat values cross-fade: old value fades to 0 opacity (200ms), new value fades in (200ms). |
| Activity Feed | New items slide in from bottom with `translateY(8px) → translateY(0)` over 200ms. |

### 3c. Section-Level Loading States

#### Bot Status Card — Reconnect Action

When the user clicks "Reconnect Bot" (after a bot disconnection):

| Phase | What the user sees |
|-------|--------------------|
| Button clicked | Button: "Reconnecting…" + `Loader2` spinner; disabled |
| API call in progress | Button loading state; card shows pulsing border `rgba(12,31,64,0.2)` |
| Success (Realtime update arrives showing `connected`) | Button resets; card status updates; success toast: **"Bot reconnected successfully."** |
| Error (API returns error) | Button resets; error toast: **"Failed to reconnect. Check your bot token in Settings."** |
| Timeout (no Realtime update within 30s) | Button resets; warning toast: **"Reconnect request sent. Check bot status in a moment."** |

#### Activity Feed — Load More

When the user clicks "Load more" in the activity feed:

| Phase | What the user sees |
|-------|--------------------|
| Button clicked | Button: "Loading…" + `Loader2` spinner; disabled |
| Supabase query in progress | Button loading state; existing feed entries remain visible |
| Success | New entries append below existing; button resets or hides if no more entries |
| Error | Button resets; error toast: **"Failed to load activity. Please try again."** |

### 3d. Empty States

#### New User / Onboarding State (Bot Not Connected)

Condition: `discord_connections` table has no row for this tenant, or `tenant.status = 'pending'`

The dashboard does **not** show a full-page empty state. Instead:

1. **Onboarding Checklist** appears at the top (see dashboard.md § Onboarding Checklist) — this IS the primary empty-state UI
2. **Bot Status Card** shows:
   ```
   Icon: BotOff (Lucide, 32px, #0C1F40 at 30% opacity)
   Title: "No bot connected"
   Subtitle: "Add your Discord bot token in Settings to get started."
   CTA: "Go to Settings" → /dashboard/settings
   ```
3. **API Keys Card** shows a warning banner: **"Required: Add your Anthropic API key to enable your bot."** with a link to `/dashboard/billing`.
4. **Integrations Card** shows:
   ```
   Icon: Plug (Lucide, 28px, #0C1F40 at 30% opacity)
   Title: "No integrations connected"
   Subtitle: "Connect GitHub, Google, Linear, or Toggl to give your bot superpowers."
   CTA: "Set up integrations" → /dashboard/integrations
   ```
5. **Stats Row**: All three stat cards show `—` (em dash) as the value with label text intact.
6. **Activity Feed** shows:
   ```
   Icon: Activity (Lucide, 48px, #0C1F40 at 20% opacity)
   Title: "No activity yet"
   Subtitle: "Once your bot is connected, command history will appear here."
   No CTA button.
   ```

#### Returning User — Bot Disconnected

Condition: `discord_connections` row exists but `status = 'disconnected'` or `status = 'error'`

Bot Status Card shows:
```
Status badge: "Disconnected" (red)
Status description: "Your bot disconnected at {formatted datetime}."
Error detail (if available): "{error_message from discord_connections.last_error}"
CTA: "Reconnect Bot" button (primary)
```

#### Returning User — Bot Connected, No Recent Activity

Condition: Bot is `connected` but `bot_events` table has no entries in last 7 days

Activity Feed shows:
```
Icon: MessageSquare (Lucide, 48px, #0C1F40 at 20% opacity)
Title: "No recent activity"
Subtitle: "Mention @Daimon in your Discord server to get started."
No CTA button.
```

Stats Row values: Show actual counts (0 is valid; display `0` not `—` for a connected-but-idle bot).

---

## 4. Integrations Page (`/dashboard/integrations`)

### 4a. Initial Page Load Skeleton

File: `app/(dashboard)/integrations/loading.tsx`

```html
<div class="page-content" aria-busy="true" aria-label="Loading integrations" role="status">

  <!-- Page header skeleton -->
  <div style="margin-bottom: 32px;">
    <div class="skeleton" style="width: 180px; height: 28px; margin-bottom: 8px;"></div>
    <div class="skeleton" style="width: 480px; height: 16px;"></div>
  </div>

  <!-- Service grid skeleton (4 cards, 2×2 on desktop) -->
  <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
    <!-- 4 × ServiceCardSkeleton -->
    <ServiceCardSkeleton />
    <ServiceCardSkeleton />
    <ServiceCardSkeleton />
    <ServiceCardSkeleton />
  </div>

</div>
```

**ServiceCardSkeleton** (`components/integrations/ServiceCardSkeleton.tsx`):

```html
<div class="service-card service-card--skeleton"
     style="height: 180px; border: 1.5px solid rgba(12,31,64,0.1);">
  <div class="card-header" style="padding: 20px; display: flex; align-items: center; gap: 12px;">
    <div class="skeleton" style="width: 40px; height: 40px;"></div>  <!-- logo -->
    <div>
      <div class="skeleton" style="width: 100px; height: 16px; margin-bottom: 6px;"></div>  <!-- name -->
      <div class="skeleton" style="width: 220px; height: 12px;"></div>  <!-- description -->
    </div>
    <div class="skeleton" style="width: 80px; height: 22px; margin-left: auto;"></div>  <!-- badge -->
  </div>
  <div style="padding: 0 20px 20px; margin-top: auto;">
    <div class="skeleton" style="width: 120px; height: 36px;"></div>  <!-- button -->
  </div>
</div>
```

Skeleton animation: `animate-pulse` (Tailwind). Background alternates `#E5E7EB` ↔ `#F3F4F6` at 1.5s.

### 4b. Connect Action Loading States

#### OAuth Services (GitHub, Google, Linear)

**"Connect" button clicked:**

| Phase | What the user sees |
|-------|--------------------|
| Button clicked | Card's "Connect" button: "Connecting…" + `Loader2` spinner; button disabled |
| Server action initiates OAuth redirect | After ~200ms, browser navigates to provider's authorization page |
| User completes OAuth on provider site | Browser returns to `/api/auth/callback/{service}?code=...` |
| Callback processing | Redirect to `/dashboard/integrations?connected=github` (or similar); page reloads |
| Page reload post-OAuth | Full `loading.tsx` skeleton shown for 1–2s while page re-fetches |
| Card renders as "Connected" | `ServiceCard` shows `status: connected` badge + "Connected" state |

**OAuth cancelled (user closes provider popup or clicks "Deny"):**

- Browser returns to `/api/auth/callback/{service}?error=access_denied`
- Page redirects to `/dashboard/integrations?error=oauth_cancelled`
- `AlertBanner` shown at top of page: **"Connection cancelled. You can try connecting again anytime."** (dismissible, `variant: info`)

**OAuth error (provider returns error other than access_denied):**

- Page redirects to `/dashboard/integrations?error=oauth_error&service=github`
- `AlertBanner`: **"Connection failed. {service} returned an error. Please try again."** (variant: `error`)

#### API Key Services (Toggl)

**"Connect" button clicked → API Key Modal opens.**

API Key Modal loading states — see billing-page.md § API Key Input for the `<ApiKeyInput />` component spec. Same behavior:

| Phase | What the user sees |
|-------|--------------------|
| User pastes key and clicks "Save & Validate" | Button: "Validating…" + `Loader2`; disabled |
| Validation API call in progress (~1–3s) | Loading state on button |
| Success | Success toast: **"Toggl connected successfully."**; modal closes; card updates to "Connected" |
| Invalid key | Button resets; inline error in modal: **"Invalid API key. Double-check your Toggl API key and try again."** |
| Network error | Button resets; error toast: **"Validation failed. Check your connection and try again."** |

#### Disconnect Action Loading States

**"Disconnect" clicked (within kebab menu or disconnect button):**

| Phase | What the user sees |
|-------|--------------------|
| User clicks "Disconnect" | `ConfirmDialog` opens (see component-library.md) |
| User confirms | Confirm button: "Disconnecting…" + spinner; disabled; cancel button disabled |
| API call in progress | Dialog remains open in loading state |
| Success | Dialog closes; card updates to "Not Connected" state; success toast: **"{Service} disconnected."** |
| Error | Dialog closes; error toast: **"Failed to disconnect {service}. Please try again."** |

### 4c. Real-Time Status Update Loading

When Supabase Realtime pushes a `service_connection.status_changed` event (e.g., bot marks a token as `expired`):

- The affected ServiceCard's status badge transitions from `connected` (green) to `expired` (yellow/amber) with a 300ms CSS transition on `background-color`.
- No spinner shown. The update is visually seamless.
- If `status = 'error'`, the card shows a tooltip on the badge: **"Connection error. Reconnect to restore access."**

### 4d. Empty States

#### All Services Disconnected

The service grid **always** shows all 4 service cards in their "Not Connected" state. There is no "empty" grid. The page never shows a full empty state.

#### No Services Available (Future: zero-service tenant tier)

Not applicable at launch. All tenants see all 4 services.

#### Data Fetch Error (Supabase unreachable)

If the server-side query for `tenant_service_connections` fails:

```html
<ErrorState
  icon="AlertTriangle"
  title="Failed to load integrations"
  subtitle="We couldn't fetch your connection status. Please refresh the page."
  action={{ label: "Refresh", href: "/dashboard/integrations" }}
/>
```

---

## 5. Billing Page (`/dashboard/billing`)

### 5a. Initial Page Load Skeleton

File: `app/(dashboard)/billing/loading.tsx`

```html
<div class="page-content" aria-busy="true" aria-label="Loading billing" role="status">

  <!-- Page header -->
  <div style="margin-bottom: 32px;">
    <div class="skeleton" style="width: 160px; height: 28px; margin-bottom: 8px;"></div>
    <div class="skeleton" style="width: 420px; height: 16px;"></div>
  </div>

  <!-- Section 1: Current Plan card -->
  <div class="skeleton" style="width: 100%; height: 120px; margin-bottom: 24px;"></div>

  <!-- Section 2: Plan comparison table -->
  <div class="skeleton" style="width: 100%; height: 280px; margin-bottom: 24px;"></div>

  <!-- Section 3: API Keys card (Anthropic + OpenAI) -->
  <div class="skeleton" style="width: 100%; height: 200px; margin-bottom: 24px;"></div>

</div>
```

### 5b. Plan Upgrade Action Loading States

**"Upgrade to Starter" or "Upgrade to Pro" button clicked:**

| Phase | What the user sees |
|-------|--------------------|
| Button clicked | Button: "Redirecting to checkout…" + `Loader2`; disabled |
| Next.js API route `/api/stripe/checkout` called (creates Stripe Checkout Session) | Loading state (~500ms typical) |
| Checkout Session created | Browser navigates to `checkout.stripe.com` — user leaves the page |
| Payment completed | Stripe redirects to `/dashboard/billing?success=1` |
| Return page load | Full `loading.tsx` skeleton shown while server re-fetches updated plan |
| Plan updated | Page renders with new plan highlighted in plan grid; success banner shown |

**On return from Stripe with `?success=1`:**

```html
<AlertBanner
  variant="success"
  title="Subscription activated!"
  body="Your {plan name} plan is now active. All features are unlocked."
  dismissible={true}
/>
```

**On return from Stripe with `?cancelled=1`:**

```html
<AlertBanner
  variant="info"
  title="Checkout cancelled"
  body="You weren't charged. Your current plan remains active."
  dismissible={true}
/>
```

**Stripe Checkout Session creation fails (API error):**

- Button resets
- Error toast: **"Failed to start checkout. Please try again or contact support."**

### 5c. Customer Portal Loading States

**"Manage Billing" button clicked:**

| Phase | What the user sees |
|-------|--------------------|
| Button clicked | Button: "Opening portal…" + `Loader2`; disabled |
| `/api/stripe/portal` called | Loading state (~300ms typical) |
| Portal URL created | Browser navigates to `billing.stripe.com` |
| User returns from portal | Browser returns to `/dashboard/billing`; page performs fresh SSR render |

**Portal URL creation fails:**

- Button resets
- Error toast: **"Failed to open billing portal. Please try again."**

### 5d. API Key Loading States

#### Anthropic API Key

**Saving a new key:**

| Phase | What the user sees |
|-------|--------------------|
| User pastes key (starts with `sk-ant-api03-`) | "Save" button becomes active |
| "Save" clicked | `ApiKeyInput` component: `isValidating={true}`; "Save" replaced by spinner |
| API validates key against Anthropic API | Validation in progress (~1–3s) |
| Valid key | Success badge ("Valid") appears; key saved to Vault; success toast: **"Anthropic API key saved."** |
| Invalid key | Error badge ("Invalid"); inline error: **"Invalid API key. Must start with `sk-ant-api03-`."** |
| Validation request fails (network error) | Button resets; error toast: **"Validation failed. Check your connection and try again."** |

**Deleting an existing key:**

| Phase | What the user sees |
|-------|--------------------|
| "Delete Key" button clicked | `ConfirmDialog` opens: "Delete API key? Your bot will stop working until you add a new one." |
| User confirms | Confirm button: "Deleting…" + spinner; disabled |
| API call in progress | Dialog loading state |
| Success | Dialog closes; `ApiKeyInput` resets to empty entry mode; warning toast: **"Anthropic API key removed. Your bot is now offline until a new key is added."** |
| Error | Dialog closes; error toast: **"Failed to delete key. Please try again."** |

#### OpenAI API Key

Identical loading state pattern to Anthropic key above, with these copy differences:

- Save success toast: **"OpenAI API key saved."**
- Delete confirm: **"Delete OpenAI API key? Classification features will be disabled."**
- Delete success toast: **"OpenAI API key removed. Classification features disabled."**

### 5e. Empty States

#### Free Plan (No Subscription)

Condition: `tenant.plan = 'free'`

The current plan section shows the Free plan highlighted. The plan comparison table is shown in full. No empty state needed — this is a valid state.

#### No API Keys Added (New User)

Condition: No `tenant_api_keys` row for `service = 'anthropic'`

The Anthropic key section shows `ApiKeyInput` in entry mode with a warning banner:

```html
<AlertBanner
  variant="warning"
  title="Anthropic API key required"
  body="Your bot needs an Anthropic API key to function. Add yours below."
  dismissible={false}
/>
```

The OpenAI key section shows `ApiKeyInput` in entry mode with no warning (it's optional).

#### Data Fetch Error (Supabase unreachable)

If server-side queries fail:

```html
<ErrorState
  icon="AlertTriangle"
  title="Failed to load billing information"
  subtitle="We couldn't fetch your subscription details. Please refresh the page."
  action={{ label: "Refresh", href: "/dashboard/billing" }}
/>
```

---

## 6. Settings Page (`/dashboard/settings`)

### 6a. Initial Page Load Skeleton

File: `app/(dashboard)/settings/loading.tsx`

```html
<div class="page-content" aria-busy="true" aria-label="Loading settings" role="status">

  <!-- Page header -->
  <div style="margin-bottom: 32px;">
    <div class="skeleton" style="width: 140px; height: 28px; margin-bottom: 8px;"></div>
    <div class="skeleton" style="width: 400px; height: 16px;"></div>
  </div>

  <!-- Section 1: Workspace -->
  <div class="skeleton" style="width: 100%; height: 130px; margin-bottom: 16px;"></div>

  <!-- Section 2: Discord Connection -->
  <div class="skeleton" style="width: 100%; height: 180px; margin-bottom: 16px;"></div>

  <!-- Section 3: Team Members -->
  <div class="skeleton" style="width: 100%; height: 120px; margin-bottom: 16px;"></div>

  <!-- Section 4: Account -->
  <div class="skeleton" style="width: 100%; height: 160px; margin-bottom: 16px;"></div>

  <!-- Section 5: Danger Zone (owner only — always render skeleton, hide if not owner after load) -->
  <div class="skeleton" style="width: 100%; height: 100px;"></div>

</div>
```

### 6b. Section-Level Loading States

#### Workspace — Save Tenant Name

| Phase | What the user sees |
|-------|--------------------|
| User edits workspace name field and clicks "Save" | "Save" button: "Saving…" + `Loader2`; disabled |
| API call in progress | Loading state |
| Success | Button resets; success toast: **"Workspace name updated."**; field value updates to new name |
| Error (name taken) | Button resets; inline error on field: **"That name is already taken."** |
| Error (other) | Button resets; error toast: **"Failed to save. Please try again."** |

#### Discord Connection — Add Bot Token

**"Connect Discord Bot" form submission:**

| Phase | What the user sees |
|-------|--------------------|
| User fills bot token + guild ID and clicks "Connect" | "Connect" button: "Connecting…" + `Loader2`; disabled |
| API validates token format | Client-side (instant) — no loading state |
| API sends `INSERT` to `discord_connections` | Server call in progress (~500ms) |
| Bot picks up Realtime event and attempts login | (Async, may take 10–60s) |
| Immediately on API success | Button resets; success toast: **"Bot token saved. The bot is connecting — check the Bot Status on your dashboard."** |
| API returns error (duplicate guild) | Button resets; inline error: **"This Guild ID is already registered."** |
| API returns error (other) | Button resets; error toast: **"Failed to save connection. Please try again."** |

**"Remove" Discord connection:**

| Phase | What the user sees |
|-------|--------------------|
| User clicks "Remove" | `ConfirmDialog`: **"Remove bot connection? The bot will stop responding in your server."** |
| User confirms | Confirm button: "Removing…" + spinner; disabled |
| API call in progress | Dialog loading state |
| Success | Dialog closes; connection row removed from UI; warning toast: **"Bot connection removed. The bot will disconnect from your server shortly."** |
| Error | Dialog closes; error toast: **"Failed to remove connection. Please try again."** |

#### Account — Update Display Name

| Phase | What the user sees |
|-------|--------------------|
| User edits display name and clicks "Save" | "Save" button: "Saving…" + spinner; disabled |
| Supabase `updateUser()` in progress | Loading state |
| Success | Button resets; success toast: **"Display name updated."** |
| Error | Button resets; error toast: **"Failed to update name. Please try again."** |

#### Account — Change Password

| Phase | What the user sees |
|-------|--------------------|
| User fills current + new password and clicks "Update Password" | Button: "Updating…" + spinner; disabled |
| Supabase `updateUser({ password })` in progress | Loading state |
| Success | Button resets; form fields cleared; success toast: **"Password updated successfully."** |
| Error (wrong current password) | Button resets; inline error below current password: **"Current password is incorrect."** |
| Error (other) | Button resets; error toast: **"Failed to update password. Please try again."** |

#### Danger Zone — Delete Workspace

| Phase | What the user sees |
|-------|--------------------|
| Owner clicks "Delete Workspace" | `ConfirmDialog` opens with `confirmationText="delete {workspace name}"` |
| User types confirmation phrase | Confirm button becomes active |
| User clicks "Delete permanently" | Confirm button: "Deleting…" + spinner; disabled; cancel disabled |
| API call in progress (cascade delete) | Dialog in loading state. This may take 5–10s. |
| Success | Dialog closes; router.push(`/signup`) with URL param `?deleted=1` |
| Error | Dialog closes; error toast: **"Failed to delete workspace. Contact support if this persists."** |

### 6c. Empty States

#### Discord Connection — No Connection Added

Condition: No `discord_connections` rows for tenant

The Discord Connection section shows:

```html
<EmptyState
  icon="Bot"
  title="No bot connected"
  subtitle="Add your Discord bot token and guild ID to get started."
  action={null}   // The "Add Connection" form is shown directly below — no separate CTA needed
/>
```

Immediately below the empty state, the "Add Connection" form is shown inline (not behind a button click). This is the primary action and should not be hidden.

#### Team Members — Only One Member (No Team Yet)

Condition: `tenant_members` has exactly one row (the owner)

The Team Members section shows the owner row in the table, plus:

```html
<!-- Below the single-member table -->
<div class="invite-placeholder" style="padding: 12px; background: #F7F7F7; text-align: center;">
  <p style="font-size: 13px; color: #6B7280;">
    Team invites are coming soon. You'll be able to add team members to collaborate on your bot.
  </p>
</div>
```

---

## 7. Admin Panel (`/admin`, `/admin/tenants`, `/admin/tenants/[id]`, `/admin/audit-log`)

### 7a. Tenant List — Initial Load Skeleton

File: `app/(admin)/tenants/loading.tsx`

```html
<div class="admin-content" aria-busy="true" aria-label="Loading tenant list" role="status">

  <!-- Page header -->
  <div style="margin-bottom: 24px;">
    <div class="skeleton" style="width: 160px; height: 28px; margin-bottom: 8px;"></div>
    <div class="skeleton" style="width: 280px; height: 16px;"></div>
  </div>

  <!-- Stats bar (3 stat chips) -->
  <div style="display: flex; gap: 16px; margin-bottom: 24px;">
    <div class="skeleton" style="width: 120px; height: 60px;"></div>
    <div class="skeleton" style="width: 120px; height: 60px;"></div>
    <div class="skeleton" style="width: 120px; height: 60px;"></div>
  </div>

  <!-- Search bar skeleton -->
  <div class="skeleton" style="width: 320px; height: 38px; margin-bottom: 16px;"></div>

  <!-- Table skeleton (header + 10 rows) -->
  <table style="width: 100%; border-collapse: collapse;">
    <thead>
      <tr>
        <th><div class="skeleton" style="width: 100px; height: 14px;"></div></th>
        <th><div class="skeleton" style="width: 60px; height: 14px;"></div></th>
        <th><div class="skeleton" style="width: 60px; height: 14px;"></div></th>
        <th><div class="skeleton" style="width: 80px; height: 14px;"></div></th>
        <th><div class="skeleton" style="width: 80px; height: 14px;"></div></th>
        <th><div class="skeleton" style="width: 60px; height: 14px;"></div></th>
      </tr>
    </thead>
    <tbody>
      <!-- 10 skeleton rows -->
      {[...Array(10)].map((_, i) => (
        <tr key={i}>
          <td><div class="skeleton" style="width: 180px; height: 16px;"></div></td>
          <td><div class="skeleton" style="width: 50px; height: 22px;"></div></td>   <!-- status badge -->
          <td><div class="skeleton" style="width: 60px; height: 22px;"></div></td>   <!-- plan badge -->
          <td><div class="skeleton" style="width: 100px; height: 14px;"></div></td>  <!-- created date -->
          <td><div class="skeleton" style="width: 100px; height: 14px;"></div></td>  <!-- last active -->
          <td><div class="skeleton" style="width: 80px; height: 30px;"></div></td>   <!-- actions -->
        </tr>
      ))}
    </tbody>
  </table>

</div>
```

### 7b. Tenant Detail — Initial Load Skeleton

File: `app/(admin)/tenants/[id]/loading.tsx`

```html
<div class="admin-content" aria-busy="true" aria-label="Loading tenant details" role="status">

  <!-- Back link + page header -->
  <div style="margin-bottom: 24px;">
    <div class="skeleton" style="width: 120px; height: 16px; margin-bottom: 16px;"></div>
    <div class="skeleton" style="width: 260px; height: 28px; margin-bottom: 8px;"></div>
    <div class="skeleton" style="width: 180px; height: 16px;"></div>
  </div>

  <!-- Overview card -->
  <div class="skeleton" style="width: 100%; height: 160px; margin-bottom: 16px;"></div>

  <!-- Discord connection card -->
  <div class="skeleton" style="width: 100%; height: 120px; margin-bottom: 16px;"></div>

  <!-- Subscription card -->
  <div class="skeleton" style="width: 100%; height: 120px; margin-bottom: 16px;"></div>

  <!-- Admin actions card -->
  <div class="skeleton" style="width: 100%; height: 140px; margin-bottom: 16px;"></div>

</div>
```

### 7c. Admin Audit Log — Initial Load Skeleton

File: `app/(admin)/audit-log/loading.tsx`

```html
<div class="admin-content" aria-busy="true" aria-label="Loading audit log" role="status">

  <!-- Header -->
  <div style="margin-bottom: 24px;">
    <div class="skeleton" style="width: 160px; height: 28px; margin-bottom: 8px;"></div>
  </div>

  <!-- Filters row -->
  <div style="display: flex; gap: 12px; margin-bottom: 16px;">
    <div class="skeleton" style="width: 160px; height: 38px;"></div>  <!-- date range -->
    <div class="skeleton" style="width: 120px; height: 38px;"></div>  <!-- action type filter -->
  </div>

  <!-- Log table (50 rows typical) -->
  {[...Array(15)].map((_, i) => (
    <div style="display: flex; gap: 16px; padding: 12px 0; border-bottom: 1px solid rgba(12,31,64,0.08);">
      <div class="skeleton" style="width: 140px; height: 14px; flex-shrink: 0;"></div>  <!-- timestamp -->
      <div class="skeleton" style="width: 60px; height: 22px; flex-shrink: 0;"></div>   <!-- action badge -->
      <div class="skeleton" style="width: 100%; height: 14px;"></div>                   <!-- description -->
    </div>
  ))}

</div>
```

### 7d. Admin Action Loading States

#### Suspend Tenant

| Phase | What the user sees |
|-------|--------------------|
| "Suspend" button clicked | `ConfirmDialog` opens: **"Suspend {tenant name}? Their bot will stop working immediately."** |
| Confirmed | Confirm button: "Suspending…" + spinner |
| API call in progress | Dialog loading state |
| Success | Dialog closes; tenant status badge on page updates to "Suspended"; success toast: **"Tenant suspended."** |
| Error | Dialog closes; error toast: **"Failed to suspend tenant. Please try again."** |

#### Reactivate Tenant

Same pattern, toast: **"Tenant reactivated."**

#### Override Plan

| Phase | What the user sees |
|-------|--------------------|
| Admin selects new plan from dropdown + clicks "Apply Override" | Button: "Applying…" + spinner; disabled |
| API call in progress | Loading state |
| Success | Plan badge updates; success toast: **"Plan overridden to {plan}."** |
| Error | Error toast: **"Failed to override plan. Please try again."** |

#### Impersonate Tenant

| Phase | What the user sees |
|-------|--------------------|
| "Impersonate" button clicked | `ConfirmDialog`: **"Impersonate {tenant name}? You'll see their dashboard as them. This is logged."** |
| Confirmed | Confirm button: "Impersonating…" + spinner |
| API call in progress | Dialog loading state |
| Success | Dialog closes; page navigates to `/dashboard` with impersonation JWT. Yellow impersonation banner shown at top: **"Impersonating {tenant name} — Exit"** |
| Error | Dialog closes; error toast: **"Impersonation failed. Please try again."** |

### 7e. Admin Empty States

#### Tenant List — No Tenants (Brand New Platform)

Condition: Zero tenants in the system.

```html
<EmptyState
  icon="Users"
  title="No tenants yet"
  subtitle="Tenants will appear here once users sign up for Daimon."
  action={null}
/>
```

#### Tenant List — Search Returns No Results

Condition: Admin has typed in the search box and no tenants match.

```html
<EmptyState
  icon="Search"
  title="No tenants found"
  subtitle="No tenants match '{searchQuery}'. Try a different name or email."
  action={{ label: "Clear search", onClick: clearSearch }}
/>
```

#### Audit Log — No Entries

Condition: No admin actions have been taken yet, or the date filter returns no results.

```html
<EmptyState
  icon="FileText"
  title="No audit log entries"
  subtitle={filterActive
    ? "No actions match the selected filters. Try a different date range."
    : "Admin actions will appear here as they occur."
  }
  action={filterActive ? { label: "Clear filters", onClick: clearFilters } : null}
/>
```

---

## 8. Docs Pages (`/docs/*`)

### 8a. Loading States

All docs pages are statically generated at build time (Next.js `generateStaticParams`). They are served as pre-rendered HTML from Vercel's Edge CDN. No data fetching occurs at request time.

**No `loading.tsx` needed for docs pages.** First paint is instant (< 200ms) from CDN.

**Exception: Doc search** (if implemented at launch — currently deferred).

#### Table of Contents (Client Component)

The docs sidebar table of contents (`DocsToC`) is a Client Component that uses `IntersectionObserver` to highlight the active section. No loading state — it renders immediately from static HTML.

#### Code blocks with syntax highlighting

Syntax highlighting is applied at build time (via `rehype-pretty-code` or similar). No client-side loading state.

### 8b. Empty States

#### Search — No Results (Deferred Feature)

If search is implemented:

```html
<EmptyState
  icon="Search"
  title="No results"
  subtitle="No docs pages match '{query}'. Try a different search term."
  action={{ label: "Browse all docs", href: "/docs" }}
/>
```

#### 404 — Doc Page Not Found

Route: `/docs/[...slug]` — when no matching page exists.

```html
<ErrorState
  icon="FileQuestion"
  title="Page not found"
  subtitle="This doc page doesn't exist. It may have moved or been removed."
  action={{ label: "Go to docs home", href: "/docs" }}
/>
```

---

## 9. Cross-Cutting: Global Loading States

### 9a. Navigation Transitions

When the user clicks a sidebar nav link:

- Next.js App Router initiates a client-side navigation
- **Progress bar** shown at top of page (using `nprogress` or a custom thin bar): `height: 2px`, `background: #B4E7DD` (Aqua), animates from left to right
- Duration: typically 100–500ms for cached routes; up to 2s for uncached routes
- The sidebar link's icon animates: `opacity: 0.6` while navigating, returns to `1.0` on arrival
- The `loading.tsx` skeleton is shown if the route's Server Component takes > 100ms

### 9b. Sign Out Loading State

When the user clicks "Sign out" in the sidebar footer:

| Phase | What the user sees |
|-------|--------------------|
| "Sign out" clicked | Sidebar link shows `Loader2` spinner inline, text grayed |
| Supabase `signOut()` call in progress | ~200ms |
| Success | Router.push(`/login`); session cleared |
| Error (rare) | Toast: **"Sign out failed. Please try again."** |

### 9c. Session Expiry Mid-Page

When the user's Supabase session expires while they are on a page:

- **Supabase client** auto-refreshes tokens via `onAuthStateChange`. If refresh fails (user not online for > 7 days), the client fires `SIGNED_OUT`.
- **`onAuthStateChange` handler** (in `AuthProvider`) detects `SIGNED_OUT`, shows a **full-page modal**:
  ```
  Icon: Lock (Lucide, 48px)
  Title: "Session expired"
  Body: "Your session has expired. Please sign in again to continue."
  CTA: "Sign in" → navigates to /login?next={current path}
  ```
  The modal is non-dismissible. Clicking "Sign in" is the only action.
- The user's unsaved form data is lost. No warning before expiry (by design — session length is 7 days, ample time).

### 9d. Global Error Boundary

Every route group has an `error.tsx` file as a React Error Boundary.

File: `app/(dashboard)/error.tsx`, `app/(admin)/error.tsx`

Shown when an unhandled exception occurs in a Server Component or Client Component during render:

```html
<div class="error-boundary" style="display: flex; flex-direction: column; align-items: center;
     justify-content: center; min-height: 400px; padding: 40px;">
  <AlertTriangleIcon size={48} color="rgba(12,31,64,0.3)" />
  <h2 style="font: 600 20px/1.3 'Archivo', sans-serif; color: #0C1F40; margin-top: 16px;">
    Something went wrong
  </h2>
  <p style="font: 400 14px/1.5 'Inter', sans-serif; color: #6B7280; margin-top: 8px; max-width: 400px; text-align: center;">
    An unexpected error occurred. Our team has been notified.
  </p>
  <button onClick={reset} style="margin-top: 24px; ..." class="btn-primary">
    Try again
  </button>
  <a href="/dashboard" style="margin-top: 12px; font-size: 13px; color: #6B7280;">
    Return to dashboard
  </a>
</div>
```

The `reset()` function is provided by Next.js App Router's `error.tsx` interface. Clicking "Try again" re-mounts the route segment.

---

## 10. Summary: Pattern Matrix

| Page | `loading.tsx` Skeleton | Client Mutation Spinners | Empty State(s) |
|------|------------------------|--------------------------|----------------|
| Landing | None (static) | None | None |
| Signup | None (form renders instantly) | "Creating account…" on submit | None |
| Login | None (form renders instantly) | "Signing in…" on submit | None |
| Reset Password | None | "Sending…" / "Updating…" | None |
| Dashboard | Full skeleton (6 sections) | "Reconnecting…" (bot card) | New user onboarding state; no activity feed; bot disconnected |
| Integrations | Full skeleton (4 cards) | "Connecting…" / "Disconnecting…" per card | Data fetch error only |
| Billing | Full skeleton (3 sections) | "Redirecting to checkout…" / "Opening portal…" / "Validating…" / "Deleting…" | No API key added |
| Settings | Full skeleton (5 sections) | "Saving…" per section action / "Removing…" / "Deleting…" | No Discord connection; solo team member |
| Admin: Tenants | Full skeleton (table + header) | "Suspending…" / "Reactivating…" / "Applying…" / "Impersonating…" | No tenants; search no results |
| Admin: Tenant Detail | Full skeleton (cards) | Same admin actions | N/A |
| Admin: Audit Log | Full skeleton (table rows) | None | No entries; filter no results |
| Docs | None (static) | None | 404 page; search no results |

---

## 11. Skeleton Component Spec (Consolidation)

All skeleton blocks are implemented using a single shared `<Skeleton />` component.

File: `components/ui/Skeleton.tsx`

```typescript
interface SkeletonProps {
  width?: number | string;    // CSS value; default '100%'
  height?: number | string;   // CSS value; required
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ width = '100%', height, className, style }: SkeletonProps) {
  return (
    <div
      className={cn('skeleton', className)}
      style={{ width, height, ...style }}
      aria-hidden="true"   // Skeleton content is decorative
    />
  );
}
```

The `.skeleton` class uses the shimmer animation defined in [§ Global Patterns → Pattern 1](#pattern-1-server-component-initial-load-skeleton-via-loadingtsx).

---

## 12. EmptyState Component Spec (Consolidation)

File: `components/ui/EmptyState.tsx`

```typescript
interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  action?: {
    label: string;
    href?: string;           // Use href for navigation links
    onClick?: () => void;    // Use onClick for in-page actions
  } | null;
  className?: string;
}

export function EmptyState({ icon: Icon, title, subtitle, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn('empty-state', className)}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: '48px 24px', textAlign: 'center',
      }}
      role="status"
      aria-label={title}
    >
      <Icon size={48} color="rgba(12,31,64,0.25)" />
      <h3 style={{
        fontFamily: 'Archivo, sans-serif', fontWeight: 600, fontSize: '16px',
        color: '#0C1F40', marginTop: '16px', marginBottom: '8px',
      }}>
        {title}
      </h3>
      <p style={{
        fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '13px',
        color: '#6B7280', maxWidth: '320px', lineHeight: 1.5,
      }}>
        {subtitle}
      </p>
      {action && (
        action.href
          ? <a href={action.href} className="btn-primary" style={{ marginTop: '20px' }}>
              {action.label}
            </a>
          : <button onClick={action.onClick} className="btn-primary" style={{ marginTop: '20px' }}>
              {action.label}
            </button>
      )}
    </div>
  );
}
```

---
