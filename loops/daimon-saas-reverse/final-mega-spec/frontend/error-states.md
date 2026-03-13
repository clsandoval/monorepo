# Error States — Complete Specification

> Applies to: Every page in the Daimon website
> Last updated: 2026-03-13
> Related files:
>   - [component-library.md](./component-library.md) — ErrorState, AlertBanner, Toast components
>   - [copy.md](./copy.md) — All error state copy strings (section 12)
>   - [loading-and-empty-states.md](./loading-and-empty-states.md) — Loading and empty state patterns
>   - [validation-rules.md](./validation-rules.md) — Client-side field validation errors
>   - [dashboard.md](./dashboard.md) — Dashboard page spec
>   - [integrations-page.md](./integrations-page.md) — Integrations page spec
>   - [billing-page.md](./billing-page.md) — Billing page spec
>   - [settings-page.md](./settings-page.md) — Settings page spec
>   - [admin-panel.md](./admin-panel.md) — Admin panel spec

---

## Overview

Every page and component must handle error scenarios explicitly. There must never be an unhandled error that leaves the user staring at a blank screen or a raw exception message.

**Error categories:**

| Category | When | UI Pattern |
|----------|------|-----------|
| **Page load error** | Server component data fetch fails | Full-page error UI via `error.tsx` |
| **Card/section error** | Individual component data fetch fails | Inline error within component bounds |
| **Mutation error** | Form submit or async action fails | Inline error text OR error toast, depending on context |
| **Field validation error** | Client-side or server-side form validation | Inline field error text below input |
| **OAuth callback error** | OAuth provider returns error | Dedicated error page (`/dashboard/integrations?error=...`) |
| **Auth error** | Session expired, unauthorized | Redirect to `/login?redirect=...` + toast |
| **Network error** | Browser offline or request timed out | Toast notification |
| **Rate limit error** | 429 from API | Inline message or toast with wait guidance |

---

## Global Error Patterns

### Pattern 1: Full-Page Error (`error.tsx`)

Next.js App Router provides error boundaries via `error.tsx` files. Each authenticated route segment has its own `error.tsx`. When a Server Component throws, Next.js renders the nearest `error.tsx`.

**Files that must exist:**

```
app/
├── error.tsx                              # Root error boundary (rarely triggered)
├── (dashboard)/
│   ├── error.tsx                          # Dashboard layout error
│   ├── dashboard/
│   │   ├── error.tsx                      # /dashboard page error
│   │   ├── integrations/
│   │   │   ├── error.tsx                  # /dashboard/integrations error
│   │   ├── billing/
│   │   │   ├── error.tsx                  # /dashboard/billing error
│   │   ├── settings/
│   │   │   ├── error.tsx                  # /dashboard/settings error
│   ├── admin/
│   │   ├── error.tsx                      # /admin error
└── docs/
    └── error.tsx                          # /docs error (static — rarely triggers)
```

**Full-page error component — visual spec:**

```
┌─────────────────────────────────────────────┐
│                                             │
│               [AlertCircle icon]            │
│                48px, #DC2626 (Red 600)      │
│                                             │
│          "Something went wrong"             │
│       Archivo Semi-Expanded, 24px,          │
│          weight 600, #0C1F40               │
│                                             │
│   "We couldn't load this page. Please      │
│    try refreshing."                         │
│     Inter Regular, 14px, #6B7280           │
│     max-width 400px, text-align center      │
│                                             │
│         [  Refresh page  ]                  │
│         Primary button, onClick:            │
│         router.refresh()                    │
│                                             │
│   Having trouble? Contact                  │
│   support@daimon.ai                         │
│   Inter Regular, 12px, #9CA3AF             │
│   "support@daimon.ai" is a mailto: link    │
│                                             │
└─────────────────────────────────────────────┘
```

**Dimensions:** Centered vertically and horizontally in the page content area. Minimum top padding: 80px from header.

**Component signature (`error.tsx` boilerplate):**

```tsx
'use client';

import { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log to Sentry/error tracking
    console.error('[page error]', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 px-4">
      <AlertCircle size={48} className="text-red-600" />
      <h1 className="text-2xl font-semibold text-navy text-center">
        Something went wrong
      </h1>
      <p className="text-sm text-gray-500 text-center max-w-md">
        We couldn't load this page. Please try refreshing.
      </p>
      <Button variant="primary" onClick={reset}>
        Refresh page
      </Button>
      <p className="text-xs text-gray-400">
        Having trouble? Contact{' '}
        <a href="mailto:support@daimon.ai" className="underline">
          support@daimon.ai
        </a>
      </p>
    </div>
  );
}
```

**Per-page customization of the body text:**

| Page | Body text |
|------|----------|
| `/dashboard` | "We couldn't load your workspace data. Please try refreshing." |
| `/dashboard/integrations` | "We couldn't load your service connections. Please try refreshing." |
| `/dashboard/billing` | "We couldn't load your billing information. Please try refreshing." |
| `/dashboard/settings` | "We couldn't load your settings. Please try refreshing." |
| `/admin` | "We couldn't load the admin panel. Please try refreshing." |

---

### Pattern 2: Card-Level Error (Inline Within Component)

When an individual card's data fetch fails (e.g., `discord_connections` query fails but the rest of the dashboard loads), show an error state inside the card bounds rather than a full-page error.

**Visual spec:**

```
┌───────────────────────────────────────────┐
│  Card header (if applicable)              │
│                                           │
│  [AlertTriangle icon, 20px, #DC2626]      │
│  "Failed to load"                         │
│  Inter SemiBold, 13px, #DC2626            │
│                                           │
│  "We couldn't load this information.      │
│   Try refreshing."                        │
│  Inter Regular, 12px, #6B7280             │
│                                           │
│  [Try again]                              │
│  text button, 12px, #0070F3 (blue),       │
│  underline on hover, onClick: re-fetch    │
│                                           │
└───────────────────────────────────────────┘
```

**When to use card-level vs full-page error:**
- **Card-level**: A single isolated query within a page fails, the rest of the page is operational.
- **Full-page**: The primary data for the page (e.g., tenant record, subscription status) fails to load.

---

### Pattern 3: Mutation Error (Inline or Toast)

When a form submit or async action (button click) fails:

**Rule: Inline errors for modal/form contexts. Toast errors for standalone button actions.**

**Inline error (within form/modal):**
- Appears below the submit button (or below the relevant field if server returns a field-specific error)
- Uses the `AlertBanner` component with `variant="error"`
- Color: `#FEE2E2` background, `#991B1B` text, `1px solid #FCA5A5` border
- Icon: `AlertCircle` (Lucide, 16px)
- Padding: `12px 16px`
- Does not dismiss automatically — user must retry or close the modal

**Toast error (for button-triggered actions outside forms):**
- Appears top-right, stacked above existing toasts
- `variant="error"`: `#DC2626` background, `#FFFFFF` text
- Duration: 6000ms (error toasts stay longer than success toasts)
- Icon: `AlertCircle` (Lucide, 16px)
- Manual dismiss button (×) always visible on error toasts

---

### Pattern 4: Field Validation Error (Server-Side)

When the server returns a field-specific error (400 with `"field"` in body):

- The affected input gets `border-color: #DC2626` (red)
- Error text appears immediately below the field: Inter Regular, 12px, `#DC2626`
- `aria-describedby` on the input points to the error text element
- `aria-invalid="true"` on the input

---

### Pattern 5: Network / Offline Error

When a fetch fails due to network issues (no response, DNS failure, timeout):

- Show error toast: **"Connection error. Please check your internet and try again."**
- For page-level fetches (server components): show full-page error (error.tsx is triggered by the thrown error)
- For mutations: error toast only — do not clear the form, allow retry

**Timeout threshold:** 30 seconds. If an action takes longer than 30 seconds, the UI resets to its pre-action state and shows: **"Request timed out. Please try again."** (toast, error, 6s).

---

### Pattern 6: Session Expiry Error

When a request returns 401 (unauthorized) mid-session:

- Show error toast: **"Your session has expired. Please sign in again."** (6000ms)
- After 1500ms delay, redirect to `/login?redirect={current_path}`
- If in a modal, close the modal first, then show the toast, then redirect

---

### Pattern 7: Rate Limit Error (429)

When an API route returns 429:

- Show inline error (in form context) or toast (in action context)
- Text: **"Too many requests. Please wait a moment and try again."**
- Do NOT include a retry countdown timer (implementation complexity not worth it at this stage)

---

## 2. Landing Page (`/`)

The landing page is fully static. There are no data fetches that can fail. The only errors are form-related.

### Email Signup Form (waitlist / beta interest, if present in footer)

| Scenario | Error | UI |
|----------|-------|----|
| Email field empty on submit | "Please enter your email address." | Inline field error |
| Email invalid format | "Please enter a valid email address." | Inline field error |
| Server error (500) on submit | "Something went wrong. Please try again." | Inline below submit button |
| Rate limited (429) | "Too many requests. Please try again later." | Inline below submit button |

**Note:** If the landing page does not have a signup form (users go directly to `/signup`), this section is not applicable. Check `landing-page.md` — the landing page CTA goes to `/signup`, not an email capture form. No error states apply to landing.md beyond the navigation.

---

## 3. Auth Pages

### 3.1 Login (`/login`)

**Fetch/mutation:** `supabase.auth.signInWithPassword()`

| Scenario | Error message | UI location |
|----------|--------------|------------|
| Empty email | "Email is required." | Inline field error |
| Invalid email format | "Please enter a valid email address." | Inline field error |
| Empty password | "Password is required." | Inline field error |
| Wrong password | "Incorrect email or password." | AlertBanner below form (never say which field is wrong — security) |
| Email not confirmed | "Please verify your email before signing in. Check your inbox." | AlertBanner below form |
| Account not found | "Incorrect email or password." | AlertBanner below form (same message — security) |
| Account suspended | "This account has been suspended. Contact support@daimon.ai." | AlertBanner below form |
| Rate limit (>10 failed attempts) | "Too many sign-in attempts. Please wait 15 minutes and try again." | AlertBanner below form |
| Network error | "Unable to connect. Please check your internet connection and try again." | AlertBanner below form |
| Generic server error | "Something went wrong. Please try again or contact support@daimon.ai." | AlertBanner below form |

**Error UI component for auth pages:**

```
┌─────────────────────────────────────────────┐
│ [AlertCircle 16px] Error message text here   │
└─────────────────────────────────────────────┘
Background: #FEE2E2
Text: #991B1B (Red 800)
Border: 1px solid #FCA5A5 (Red 300)
Border-radius: 0 (PyMC brand — no border-radius)
Padding: 12px 16px
Margin: 16px 0 (above submit button)
Role: alert
aria-live: assertive
```

**Button state during error:** "Sign in" button returns to default state after error. User can retry immediately.

---

### 3.2 Signup (`/signup`)

**Fetch/mutation:** `supabase.auth.signUp()`

| Scenario | Error message | UI location |
|----------|--------------|------------|
| Empty email | "Email is required." | Inline field error |
| Invalid email format | "Please enter a valid email address." | Inline field error |
| Empty password | "Password is required." | Inline field error |
| Password < 8 characters | "Password must be at least 8 characters." | Inline field error |
| Email already in use | "An account with this email already exists. Sign in instead." | AlertBanner (with link to `/login`) |
| Disposable email domain (if blocked) | "Please use a work or personal email address." | AlertBanner below form |
| Rate limit | "Too many sign-up attempts. Please wait and try again." | AlertBanner below form |
| Network error | "Unable to connect. Please check your internet connection and try again." | AlertBanner below form |
| Generic server error | "Something went wrong. Please try again or contact support@daimon.ai." | AlertBanner below form |

**Post-signup error (email confirmation sent but fails):** If the confirmation email fails to send, Supabase still returns success. There is no client-visible error for this. The user lands on the "Check your email" screen. If the user reports not receiving the email, they use the resend link.

**Resend confirmation email errors:**

| Scenario | Error message | UI location |
|----------|--------------|------------|
| Rate limited on resend | "Please wait before requesting another link." | Inline below resend button |
| Email not found | "No account found with this email." | Inline below resend button |
| Generic error | "Failed to resend. Please try again." | Inline below resend button |

---

### 3.3 Reset Password Request (`/reset-password`)

**Fetch/mutation:** `supabase.auth.resetPasswordForEmail()`

| Scenario | Error message | UI location |
|----------|--------------|------------|
| Empty email | "Email is required." | Inline field error |
| Invalid email format | "Please enter a valid email address." | Inline field error |
| Email not found | "If an account exists for this email, a reset link will be sent." | AlertBanner (success — do NOT reveal whether email exists) |
| Rate limit (>5 reset requests in 1 hour) | "Too many reset attempts. Please wait before trying again." | AlertBanner below form |
| Network error | "Unable to connect. Please check your internet and try again." | AlertBanner below form |
| Generic server error | "Something went wrong. Please try again." | AlertBanner below form |

---

### 3.4 Reset Password Form (`/reset-password/confirm`)

**Fetch/mutation:** `supabase.auth.updateUser({ password: newPassword })`

Accessed via magic link in email. If the link is expired or invalid, Supabase redirects to this page with an error in the URL hash.

| Scenario | Error message | UI location |
|----------|--------------|------------|
| Link expired (`#error=access_denied&error_description=...`) | "This reset link has expired. Please request a new one." | Full-page error state (no form shown, just error + CTA) |
| Link already used | "This reset link has already been used. Please request a new one." | Full-page error state |
| Empty new password | "Password is required." | Inline field error |
| Password < 8 characters | "Password must be at least 8 characters." | Inline field error |
| Passwords don't match | "Passwords do not match." | Inline field error (on confirm field) |
| Token mismatch (race condition) | "Session error. Please request a new reset link." | AlertBanner below form |
| Generic server error | "Something went wrong. Please try again." | AlertBanner below form |

**Full-page error state for expired/invalid links:**

```
┌──────────────────────────────────────────┐
│          [Lock icon, 48px, #DC2626]      │
│                                          │
│       "Confirmation failed"              │
│    Archivo Semi-Expanded, 24px, #0C1F40  │
│                                          │
│  "This confirmation link is invalid     │
│   or has expired."                       │
│   Inter Regular, 14px, #6B7280          │
│                                          │
│     [Request a new link]                 │
│      links to /reset-password            │
│                                          │
└──────────────────────────────────────────┘
```

---

## 4. Dashboard (`/dashboard`)

### 4.1 Page Load Error

**When:** Server component fetch for `tenants`, `discord_connections`, `tenant_subscriptions`, or `tenant_members` throws.

**UI:** Full-page error via `app/(dashboard)/dashboard/error.tsx`

```
Body text: "We couldn't load your workspace data. Please try refreshing."
CTA: "Refresh" → onClick: reset() (re-renders server component)
```

---

### 4.2 Bot Status Card Error

**When:** `discord_connections` query fails OR real-time subscription errors.

**Scenario A: Query fails at load time**

Card shows card-level error:

```
┌────────────────────────────────────────┐
│  Bot Status                            │
│  ─────────────────────────────────────│
│  [AlertTriangle 20px, #DC2626]         │
│  "Failed to load bot status"           │
│  Inter SemiBold, 13px, #DC2626         │
│  "We couldn't load your bot's status.  │
│   Try refreshing the page."            │
│  Inter Regular, 12px, #6B7280          │
│  [Try again] — text button             │
└────────────────────────────────────────┘
```

**Scenario B: `status = 'error'` on the connection record**

Bot is connected but reporting an error (e.g., Discord kicked the bot, token revoked):

```
┌────────────────────────────────────────┐
│  Bot Status              [Error badge] │
│  ─────────────────────────────────────│
│  [AlertTriangle icon, 24px, #DC2626]   │
│                                        │
│  Connection Error                      │
│  Archivo Semi-Expanded, 28px, #0C1F40  │
│                                        │
│  {error_message from DB}               │
│  Inter Regular, 14px, #DC2626         │
│  (fallback: "Check your bot token in  │
│   Settings and try reconnecting.")     │
│                                        │
│  [Go to Settings]                      │
│  Primary button → /dashboard/settings  │
└────────────────────────────────────────┘
```

Status badge: `#FEE2E2` background, `#DC2626` text, text "Connection Error"

**Scenario C: Real-time subscription error (WebSocket drops)**

- No immediate visible error — the page continues to show the last known status
- After 60 seconds without a heartbeat update AND no realtime reconnect, show a subtle status indicator:

```
Small banner below bot status card:
[Wifi-off icon, 12px] "Live updates paused — reconnecting..."
Background: #FEF3C7 (Amber 100)
Text: #92400E (Amber 800)
Auto-dismisses when WebSocket reconnects
```

---

### 4.3 Subscription Status Card Error

**When:** `tenant_subscriptions` query fails at load.

Card shows card-level error:

```
Title: "Failed to load plan info"
Body: "We couldn't load your subscription. Try refreshing."
CTA: "Try again" — re-fetches subscription query
```

---

### 4.4 Activity Feed Error

**When:** Recent activity query fails.

Card shows card-level error (small, non-blocking):

```
[AlertTriangle 16px, #9CA3AF]
"Could not load recent activity."
Inter Regular, 12px, #9CA3AF
No CTA (not critical)
```

---

### 4.5 Onboarding Checklist Error

**When:** Checklist state cannot be determined (tenant record query fails separately).

Shows a minimal fallback:

```
"Unable to load setup checklist."
Inter Regular, 13px, #9CA3AF
No CTA — user can still navigate manually
```

---

## 5. Integrations Page (`/dashboard/integrations`)

### 5.1 Page Load Error

**When:** Server component fetch for `tenant_service_connections` throws.

**UI:** Full-page error via `error.tsx`

```
Body text: "We couldn't load your service connections. Please try refreshing."
CTA: "Refresh"
```

---

### 5.2 Individual Service Card Error

When `status = 'error'` or `status = 'expired'` on a service connection record.

**Visual spec for error/expired card variant:**

```
┌─────────────────────────────────────────┐
│ [Service logo]  GitHub          [Error] │
│                                         │
│ ⚠ Connection error — please reconnect  │
│ Inter Regular, 13px, #DC2626           │
│                                         │
│ {error_message or defaultErrorMessage}  │
│ Inter Regular, 12px, #6B7280           │
│                                         │
│      [Reconnect]  [Disconnect]          │
└─────────────────────────────────────────┘
```

**Error badge:** `#FEE2E2` background, `#DC2626` text, "Error" label. Same dimensions as connected badge.

**Default error messages per service (fallback when `error_message` is null):**

| Service | Default error message |
|---------|-----------------------|
| GitHub | "GitHub token may be expired or revoked. Reconnect to restore access." |
| Google | "Google OAuth token expired. Reconnect to refresh access." |
| Linear | "Linear token invalid or revoked. Reconnect to restore access." |
| Toggl | "Toggl API key is invalid or has been revoked." |

---

### 5.3 OAuth Callback Errors

OAuth callback route is `/api/integrations/oauth/callback`. On error, it redirects to `/dashboard/integrations?error={message}`. The integrations page reads the `error` query param on mount and shows a toast.

**`?error=` param values and corresponding toasts:**

| `error` param | Toast message | Duration |
|--------------|--------------|---------|
| `access_denied` | "{Service} authorization was cancelled." | 4000ms |
| `invalid_state` | "Authorization failed — the request expired. Please try again." | 6000ms |
| `server_error` | "Connection to {service} failed. Please try again." | 6000ms |
| `unauthorized` | "Not authorized to connect this service." | 6000ms |
| `invalid_service` | "Unknown service. Please try again." | 6000ms |
| `missing_params` | "Authorization failed — missing required parameters." | 6000ms |
| Any other value | "Failed to connect {service}. Please try again." | 6000ms |

**Note:** The `{Service}` placeholder is resolved from the `service` query parameter (e.g., `?service=github`). If `service` is missing, use "the service".

**Implementation:** The integrations page (`page.tsx`) reads `searchParams.error` and `searchParams.service` on load. If `error` is present, show the toast after the page mounts (`useEffect` with empty deps). After showing, clear the URL params with `router.replace('/dashboard/integrations')` to avoid re-showing on refresh.

---

### 5.4 OAuth Initiation Error

When clicking "Connect" for GitHub/Google/Linear triggers a POST to `/api/integrations/oauth/initiate` and it fails:

| Scenario | UI |
|----------|----|
| Server error (500) | Error toast: "Failed to start {service} authorization. Please try again." |
| Plan limit (403) | Error toast: "Upgrade to connect more services." (with link to `/dashboard/billing`) |
| Session expired (401) | Error toast: "Your session has expired. Please sign in again." → redirect to `/login` |

---

### 5.5 API Key Modal Errors (Toggl)

**Inline errors within the API key modal:**

| Scenario | Error message | Location |
|----------|--------------|---------|
| Empty input on submit | "API token is required." | Inline below input |
| Wrong length (not 32 chars) | "API token must be exactly 32 characters." | Inline below input |
| Invalid format (not `/^[a-z0-9]{32}$/`) | "API token may only contain lowercase letters and numbers." | Inline below input |
| Server validates — 403 from Toggl | "Invalid API token. Please check and try again." | Inline below input |
| Server validates — network error | "Could not reach Toggl to validate. Please try again." | Inline below input |
| Server error (500) on save | "Something went wrong saving your key. Please try again." | Inline below submit button |
| Session expired (401) | Error toast shown after modal close: "Your session has expired." | Toast |

**Button state on error:** "Save" button re-enables after error. Input retains the entered value (don't clear on error — let user correct). Error text clears when the user focuses the input again (`onFocus: clearError`).

---

### 5.6 Disconnect Service Error

When clicking "Disconnect" and confirming, if the DELETE request fails:

| Scenario | UI |
|----------|----|
| Server error (500) | Error toast: "Failed to disconnect {service}. Please try again." (6000ms) |
| Session expired (401) | Error toast + redirect to `/login` |
| Not found (404) | Error toast: "This connection was already removed." + refresh service list |

---

## 6. Billing Page (`/dashboard/billing`)

### 6.1 Page Load Error

**When:** Server component fetch for `tenant_subscriptions` or plan data throws.

**UI:** Full-page error via `error.tsx`

```
Body text: "We couldn't load your billing information. Please try refreshing."
CTA: "Refresh"
```

---

### 6.2 Stripe Checkout Errors

**When:** User clicks "Upgrade to Starter" or "Upgrade to Pro" — triggers POST to `/api/billing/checkout`.

| Scenario | Error message | UI |
|----------|--------------|-----|
| Server error (500) | "Could not initiate checkout. Please try again." | Error toast (6000ms) |
| Stripe unavailable | "Could not initiate checkout. Please try again." | Error toast (6000ms) |
| Session expired (401) | "Your session has expired. Please sign in again." | Error toast + redirect |
| Return from Stripe with `?canceled=true` (user cancelled checkout) | — | No error shown. Page shows plan unchanged. Optional: info toast "Checkout cancelled — no changes were made." (3000ms) |
| Return from Stripe with `?error=...` | "Payment failed. Please try again or use a different payment method." | AlertBanner on billing page |

---

### 6.3 Stripe Customer Portal Errors

**When:** User clicks "Manage billing" — triggers POST to `/api/billing/portal`.

| Scenario | Error message | UI |
|----------|--------------|-----|
| Server error (500) | "Unable to open billing portal. Please try again." | Error toast (6000ms) |
| No Stripe customer ID (unexpected state) | "Unable to open billing portal. Please contact support@daimon.ai." | Error toast (6000ms) |
| Session expired (401) | Error toast + redirect | — |

**Button state:** "Manage billing" re-enables after error (spinner disappears).

---

### 6.4 Anthropic API Key Errors

**When:** User submits Anthropic key in the API key modal.

| Scenario | Error message | UI location |
|----------|--------------|------------|
| Empty input | "API key is required." | Inline below input |
| Wrong format (doesn't start with `sk-ant-`) | "This doesn't look like an Anthropic API key. Keys start with 'sk-ant-'." | Inline below input |
| Key rejected by Anthropic (`invalid_key`) | "This key was rejected by Anthropic. Double-check it in the Anthropic Console and try again." | Inline below input |
| Rate limited by Anthropic (`rate_limited`) | "Anthropic rate-limited the validation request. Please wait a moment and try again." | Inline below input |
| Anthropic returned unexpected error (`provider_error`) | "Anthropic returned an unexpected error. Your key may be valid — wait a few minutes and try again." | Inline below input |
| Server error (500) | "Something went wrong saving your key. Please try again." | Inline below submit button |
| Session expired (401) | Error toast + modal close + redirect | — |

---

### 6.5 OpenAI API Key Errors

**When:** User submits OpenAI key in the API key modal.

| Scenario | Error message | UI location |
|----------|--------------|------------|
| Empty input | "API key is required." | Inline below input |
| Wrong format (doesn't start with `sk-`) | "This doesn't look like an OpenAI API key. Keys start with 'sk-'." | Inline below input |
| Key rejected by OpenAI (`invalid_key`) | "This key was rejected by OpenAI. Please verify it in the OpenAI Platform dashboard." | Inline below input |
| Server error (500) | "Something went wrong saving your key. Please try again." | Inline below submit button |

---

### 6.6 Delete API Key Errors

**When:** User confirms deletion of Anthropic or OpenAI key.

| Scenario | Error message | UI |
|----------|--------------|-----|
| Server error (500) | "Could not delete key. Please try again." | Inline below buttons in confirm dialog (dialog stays open) |
| Session expired (401) | Error toast + dialog close + redirect | — |

**Note:** Dialog does NOT close on error. Error text appears below the "Delete" button. User can retry or cancel.

---

### 6.7 Subscription Page Load Error — Partial

If the subscription query returns data but the billing portal URL fetch fails separately (future), show:

```
AlertBanner (warning variant):
"We couldn't verify your billing status. Some features may be unavailable. Refresh or contact support@daimon.ai."
Background: #FEF3C7, text: #92400E, border: 1px solid #FCD34D
```

---

## 7. Settings Page (`/dashboard/settings`)

### 7.1 Page Load Error

**When:** Server component fetch for tenant, members, or Discord connection throws.

**UI:** Full-page error via `error.tsx`

```
Body text: "We couldn't load your settings. Please try refreshing."
CTA: "Refresh"
```

---

### 7.2 Workspace Name Update Error

**When:** User submits the workspace name form.

| Scenario | Error message | UI |
|----------|--------------|-----|
| Empty (client) | "Workspace name is required." | Inline field error |
| Too short < 2 chars (client) | "Workspace name must be at least 2 characters." | Inline field error |
| Too long > 64 chars (client) | "Workspace name must be 64 characters or less." | Inline field error |
| Server error (500) | Toast: "Failed to save workspace name. Please try again." | Error toast (4000ms) |
| Unauthorized (403) | Toast: "Only workspace owners and admins can update settings." | Error toast (4000ms) |

---

### 7.3 Discord Connection Errors

**Adding a new connection:**

| Scenario | Error message | UI |
|----------|--------------|-----|
| Invalid token format | "Invalid bot token format. Discord tokens follow the pattern: Base64ID.Timestamp.HMAC." | Inline field error |
| Invalid guild ID (not 17–20 digits) | "Invalid server ID. Guild IDs are 17–20 digit numbers." | Inline field error |
| Token already in use (409) | "This bot token is already in use by another workspace." | Inline error below submit in modal |
| Plan limit reached (403) | "Your plan supports only one Discord connection. Upgrade to add more." | Inline error below submit in modal |
| Server error (500) | "Failed to add connection. Please try again." | Error toast (4000ms) + modal stays open |
| Session expired (401) | Error toast + modal close + redirect | — |

**Updating a connection (re-enter token):**

| Scenario | Error message | UI |
|----------|--------------|-----|
| Invalid token format | "Invalid bot token format." | Inline field error |
| Same token as existing | "This is the same token already in use." | Inline field error |
| Server error (500) | "Failed to update token. Please try again." | Error toast (4000ms) + modal stays open |

**Removing a connection:**

| Scenario | Error message | UI |
|----------|--------------|-----|
| Server error (500) | "Failed to remove connection. Please try again." | Error toast (4000ms) |
| Connection in use by active bot session | Same error — no special handling (admin handles cleanup) | Error toast (4000ms) |

---

### 7.4 Display Name Update Error

| Scenario | Error message | UI |
|----------|--------------|-----|
| Empty (client) | "Display name is required." | Inline field error |
| Too long > 100 chars (client) | "Display name must be 100 characters or less." | Inline field error |
| Server error (500) | Toast: "Failed to update display name. Please try again." | Error toast (4000ms) |

---

### 7.5 Change Password Error

| Scenario | Error message | UI |
|----------|--------------|-----|
| Empty current password | "Current password is required." | Inline field error |
| Empty new password | "New password is required." | Inline field error |
| New password < 8 chars | "Password must be at least 8 characters." | Inline field error |
| Passwords don't match | "Passwords do not match." | Inline on confirm field |
| Wrong current password (401) | "Current password is incorrect." | Inline error below current password field |
| Server error (500) | Toast: "Failed to update password. Please try again." | Error toast (4000ms) |

---

### 7.6 Delete Workspace Error

| Scenario | Error message | UI |
|----------|--------------|-----|
| Confirmation text doesn't match | "Workspace name doesn't match. Please type it exactly." | Inline field error |
| Unauthorized (403) | "Only the workspace owner can delete the workspace." | Inline below buttons in modal |
| Stripe cancellation fails | Server logs error, continues with deletion | Toast on next page: "Workspace deleted. Note: your Stripe subscription may take a moment to reflect the change." |
| Generic server error (500) | "Failed to delete workspace. Please try again or contact support." | Inline below buttons in modal (modal stays open) |

---

### 7.7 Member Management Errors

**Inviting a member:**

| Scenario | Error message | UI |
|----------|--------------|-----|
| Invalid email | "Please enter a valid email address." | Inline field error |
| Email already a member | "This person is already in your workspace." | Inline below input |
| Email already has pending invite | "An invite has already been sent to this email." | Inline below input |
| Member limit reached (Free plan: 1 member) | "Your plan supports only 1 member. Upgrade to invite more." | Inline below input (with upgrade link) |
| Server error (500) | "Failed to send invitation. Please try again." | Error toast (4000ms) |

**Removing a member:**

| Scenario | Error message | UI |
|----------|--------------|-----|
| Cannot remove owner | "You cannot remove the workspace owner." | Error toast (4000ms) — button should be disabled, this is a fallback |
| Server error (500) | "Failed to remove member. Please try again." | Error toast (4000ms) |

**Changing member role:**

| Scenario | Error message | UI |
|----------|--------------|-----|
| Server error (500) | "Failed to update role. Please try again." | Error toast (4000ms) |
| Cannot change owner role | "The workspace owner's role cannot be changed." | Error toast (4000ms) |

---

## 8. Admin Panel (`/admin`)

### 8.1 Page Load Error

**When:** Server component fetch for tenant list throws (requires `admin` role check).

**Redirect scenario:** If user is not admin, middleware redirects to `/dashboard` before the page renders — not an error, just a redirect. No error UI needed.

**UI for data fetch error:**

```
Body text: "We couldn't load the admin panel. Please try refreshing."
CTA: "Refresh"
```

---

### 8.2 Tenant List Error

If tenant list pagination query fails after initial load (e.g., user navigates to page 2):

- Inline error above pagination controls:

```
[AlertTriangle 16px, #DC2626] "Failed to load page {n}. Try again."
[Try again] text button — re-fetches that page
```

---

### 8.3 Tenant Detail Error

**When:** Server component for tenant detail page (`/admin/tenants/[id]`) throws.

```
Body text: "We couldn't load this tenant's details. Please try refreshing."
CTA: "Refresh"
CTA secondary: "Back to tenant list" → /admin
```

---

### 8.4 Admin Mutation Errors

**Suspending a tenant:**

| Scenario | Error message | UI |
|----------|--------------|-----|
| Server error (500) | "Failed to suspend tenant. Please try again." | Error toast (6000ms) |
| Already suspended | "This tenant is already suspended." | Error toast (4000ms) |
| Own account | "You cannot suspend your own account." | Error toast (4000ms) — button should be disabled, this is a fallback |

**Unsuspending a tenant:**

| Scenario | Error message | UI |
|----------|--------------|-----|
| Server error (500) | "Failed to restore tenant. Please try again." | Error toast (6000ms) |

**Forcing plan:**

| Scenario | Error message | UI |
|----------|--------------|-----|
| Server error (500) | "Failed to update plan. Please try again." | Error toast (6000ms) |
| Invalid plan value | "Invalid plan selected." | Error toast (4000ms) |

**Impersonating a tenant:**

| Scenario | Error message | UI |
|----------|--------------|-----|
| Server error (500) | "Failed to impersonate tenant. Please try again." | Error toast (6000ms) |
| Own account | "You cannot impersonate your own account." | Error toast (4000ms) |

---

## 9. Docs Pages (`/docs`)

Docs pages are statically generated or server-rendered from MDX. The content is static — no Supabase queries.

### 9.1 Page Not Found (missing doc slug)

If a user navigates to `/docs/nonexistent-slug`:

- Next.js `not-found.tsx` is triggered
- Shows the standard 404 page (see below)

### 9.2 404 Page (`not-found.tsx`)

```
┌──────────────────────────────────────────────┐
│           [FileQuestion icon, 48px, #9CA3AF] │
│                                              │
│           "Page not found"                   │
│       Archivo Semi-Expanded, 24px, #0C1F40   │
│                                              │
│  "The page you're looking for doesn't        │
│   exist or has been moved."                  │
│   Inter Regular, 14px, #6B7280              │
│                                              │
│    [Go to dashboard]   [Go to docs]          │
│    Primary button       Ghost button         │
│                                              │
└──────────────────────────────────────────────┘
```

---

## 10. Global 500 Page (`error.tsx` at root)

For uncaught errors at the root layout level (very rare — layout.tsx error):

```
┌──────────────────────────────────────────────┐
│           [AlertCircle icon, 48px, #DC2626]  │
│                                              │
│         "Something went wrong"               │
│       Archivo Semi-Expanded, 24px, #0C1F40   │
│                                              │
│  "We encountered an unexpected error.        │
│   Our team has been notified."               │
│   Inter Regular, 14px, #6B7280              │
│                                              │
│         [Go to dashboard]                    │
│         Primary button → /dashboard          │
│                                              │
│   If this keeps happening, contact           │
│   support@daimon.ai                          │
│   Inter Regular, 12px, #9CA3AF              │
│                                              │
└──────────────────────────────────────────────┘
```

---

## 11. Cross-Cutting Error Scenarios

### 11.1 Session Expiry Mid-Action

**Scenario:** User is filling out a form, session expires (1-hour Supabase JWT expiry), user submits.

**Behavior:**
1. Request returns 401
2. Show error toast: **"Your session has expired. Please sign in again."** (6000ms, error variant)
3. After 1500ms, redirect to `/login?redirect={encodeURIComponent(window.location.pathname)}`
4. After re-login, Supabase redirects back to the `redirect` param
5. The form data is NOT preserved (acceptable — this is a rare edge case)

**Implementation note:** The Supabase client auto-refreshes tokens using refresh tokens, so this only triggers if the user has been completely inactive for the JWT + refresh token expiry window (typically 60+ days). However, the 401 handler must exist for defense in depth.

---

### 11.2 Concurrent Modification (Optimistic Update Conflict)

**Scenario:** User updates workspace name. Bot also writes to the tenant record at the same moment. The optimistic update shown is stale.

**Behavior:**
- On mutation error (e.g., Supabase returns a constraint error): revert optimistic update, show error toast.
- Daimon does NOT implement complex conflict resolution at this stage.
- Text: **"Failed to save. Please try again."** (toast, error, 4000ms)

---

### 11.3 Bot Token Revoked While Dashboard is Open

**Scenario:** User is on the dashboard. The bot's Discord token is revoked externally (e.g., Discord regenerated the token). The bot writes `status = 'error'` and `error_message = 'Token revoked by Discord'` to the DB.

**Behavior:**
1. Supabase Realtime pushes the update to the dashboard page
2. Bot Status card updates in real-time (no page reload needed)
3. Status card shows: `status = 'error'`, error message: "Token revoked by Discord"
4. An alert banner appears above the bot status card:

```
AlertBanner (error variant):
[AlertTriangle 16px] "Your bot's connection was lost."
Subtitle: "Check your bot token in Settings and try reconnecting."
CTA button (inline): "Go to Settings" → /dashboard/settings
```

5. No toast for this scenario (banner is sufficient since the user can see the dashboard)

---

### 11.4 Stripe Webhook Delivery Failure

**Scenario:** Stripe fails to deliver a webhook (subscription.updated, payment_failed). The subscription status in the DB is stale.

**Behavior on the frontend:**
- The billing page shows whatever is in the DB (potentially stale)
- If Stripe Customer Portal shows a discrepancy: no automatic UI error
- If the user contacts support: admin panel can force-sync the plan
- **No automatic "stale billing data" UI warning at this stage** (implementation complexity not worth it)

---

### 11.5 Supabase Realtime WebSocket Failure

**Scenario:** Supabase Realtime WebSocket fails to connect or drops.

**Behavior:**
1. Supabase client automatically retries with exponential backoff (built-in)
2. During retry window (up to 60 seconds): show subtle reconnecting indicator on any real-time-dependent component:

```
Small inline badge below bot status card:
[Wifi-off icon, 12px, #92400E] "Reconnecting..."
Background: #FEF3C7 (Amber 100), border-radius: 0
```

3. After reconnect: badge disappears, status re-syncs (Supabase re-delivers missed events)
4. If reconnect never succeeds (>5 minutes): no additional UI. User can refresh the page manually.

---

### 11.6 Free Plan Feature Gate Errors

**Scenario:** User on Free plan tries to trigger a feature gated to Starter/Pro.

**Behavior:** Feature gate errors are shown as upgrade prompts, NOT as generic errors.

| Feature | Error message | UI |
|---------|--------------|-----|
| Add second Discord connection | "Your current plan supports 1 connection. Upgrade to add more." | Inline in Settings (button disabled, tooltip shows message), OR inline in modal |
| Invite a second member | "Your Free plan supports 1 member. Upgrade to invite more." | Inline in Settings member section |
| Access Pro-only feature | "This feature requires the Pro plan." | Upgrade prompt modal |

**Pattern for upgrade prompts:**

```
┌───────────────────────────────────────────┐
│  [Lock icon, 20px, #6B7280]               │
│  "Upgrade to unlock this feature"          │
│  Archivo SemiBold, 14px, #0C1F40          │
│                                           │
│  "This feature is available on the        │
│   Starter plan and above."                │
│  Inter Regular, 13px, #6B7280            │
│                                           │
│  [View Plans]  → /dashboard/billing       │
│  Primary button                           │
└───────────────────────────────────────────┘
```

---

## 12. Error State Visual Specifications Summary

### ErrorState Component (full-page variant)

| Property | Value |
|----------|-------|
| Container min-height | `400px` |
| Container alignment | `flex column, items-center, justify-center` |
| Container padding | `24px` |
| Icon size | `48px` |
| Icon color (error) | `#DC2626` (Red 600) |
| Icon color (not-found) | `#9CA3AF` (Gray 400) |
| Title font | Archivo Semi-Expanded, 24px, weight 600 |
| Title color | `#0C1F40` (Navy) |
| Title margin-top | `16px` |
| Body font | Inter Regular, 14px |
| Body color | `#6B7280` (Gray 500) |
| Body max-width | `400px` |
| Body text-align | `center` |
| Body margin-top | `8px` |
| CTA margin-top | `20px` |
| Support text font | Inter Regular, 12px |
| Support text color | `#9CA3AF` (Gray 400) |
| Support text margin-top | `12px` |
| Support link color | `#0C1F40` (underline) |

### AlertBanner Component (inline error variant)

| Property | Value |
|----------|-------|
| Background | `#FEE2E2` (Red 100) |
| Text color | `#991B1B` (Red 800) |
| Border | `1px solid #FCA5A5` (Red 300) |
| Border-radius | `0` (PyMC brand) |
| Padding | `12px 16px` |
| Icon | `AlertCircle` (Lucide, 16px), color `#DC2626` |
| Icon margin-right | `8px` |
| Font | Inter Regular, 13px |
| Role | `alert` |
| aria-live | `assertive` |

### Toast Component (error variant)

| Property | Value |
|----------|-------|
| Background | `#DC2626` (Red 600) |
| Text color | `#FFFFFF` |
| Border-radius | `0` (PyMC brand) |
| Padding | `12px 16px` |
| Icon | `AlertCircle` (Lucide, 16px), white |
| Icon margin-right | `8px` |
| Font | Inter Regular, 13px |
| Auto-dismiss | `6000ms` |
| Manual dismiss | Always shown (× button) |
| Position | Top-right, 16px from edges |
| Z-index | `9999` |
| Role | `alert` |
| aria-live | `assertive` |

### Card-Level Error (inline within card)

| Property | Value |
|----------|-------|
| Icon | `AlertTriangle` (Lucide, 20px), `#DC2626` |
| Title font | Inter SemiBold, 13px, `#DC2626` |
| Body font | Inter Regular, 12px, `#6B7280` |
| CTA | Text button, 12px, `#0070F3`, underline on hover |
| Padding | Matches card padding (typically `16px`) |
| Background | Transparent (inherits card background) |

### Field-Level Error

| Property | Value |
|----------|-------|
| Input border-color | `#DC2626` (Red 600) |
| Input border on focus | `#DC2626` (overrides default focus ring) |
| Error text font | Inter Regular, 12px |
| Error text color | `#DC2626` |
| Error text margin-top | `4px` |
| Error text `id` | `{fieldId}-error` |
| Input `aria-describedby` | `{fieldId}-error` |
| Input `aria-invalid` | `"true"` |

---

## 13. Error State Accessibility Requirements

| Requirement | Implementation |
|-------------|---------------|
| All error messages must be announced to screen readers | Use `role="alert"` and `aria-live="assertive"` on error containers |
| Error toasts must be announced | `role="alert"` on toast container |
| Field errors must be associated with inputs | `aria-describedby` pointing to error text element ID |
| Invalid fields must be marked | `aria-invalid="true"` on invalid inputs |
| Full-page errors must have a visible CTA | Required — no dead-end error pages |
| Error messages must not rely on color alone | All error states include icon + text (not just red color) |
| "Refresh" / "Try again" buttons must have meaningful labels | Not just "Click here" — specific action text |
| Dismiss buttons on toasts must be keyboard accessible | `<button>` element with `aria-label="Dismiss notification"` |

---

*Cross-references: [loading-and-empty-states.md](./loading-and-empty-states.md) — loading and empty patterns | [component-library.md](./component-library.md) — component implementations | [copy.md](./copy.md#12-error-states) — all error copy strings | [validation-rules.md](./validation-rules.md) — field-level validation logic*
