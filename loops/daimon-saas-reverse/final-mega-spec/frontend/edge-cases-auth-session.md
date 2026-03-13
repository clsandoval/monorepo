# Edge Cases: Auth & Session — Exhaustive Specification

> Aspect: 7.3a
> Last updated: 2026-03-13
> Covers: expired sessions, invalid tokens, concurrent logins, password reset mid-session, account state transitions, and all auth-related failure modes

---

## Overview

This document specifies every non-happy-path scenario in the authentication and session lifecycle. Every scenario has:
- Trigger condition (what causes it)
- Detection mechanism (how the system knows)
- User-facing behavior (what they see)
- System behavior (what code must do)
- Recovery path (how the user can get back on track)

---

## 1. Session Expiry Scenarios

### 1.1 Access Token Expired — Background Refresh Succeeds

**Trigger:** User's JWT access token expires (1-hour TTL) while they are actively using the app. The refresh token (14-day TTL) is still valid.

**Detection:** `@supabase/ssr` middleware calls `supabase.auth.getSession()` on the next request. Supabase SDK detects the access token is expired and automatically calls the refresh endpoint using the refresh token from the cookie.

**User-facing behavior:**
- The user sees nothing unusual. The page loads normally.
- No toast, no redirect, no error message.
- The refreshed session cookies are written automatically by `@supabase/ssr` in the middleware's `NextResponse`.

**System behavior:**
1. Middleware calls `createMiddlewareClient({ req, res })` and `supabase.auth.getSession()`.
2. Supabase SDK makes `POST /auth/v1/token?grant_type=refresh_token` internally.
3. New access token and refresh token returned and written to cookies in `res`.
4. Middleware continues — `session` is valid with the new token.
5. Request proceeds normally.

**Recovery path:** No recovery needed — transparent to user.

**Implementation note:** The `NextResponse` object MUST be returned from middleware with the refreshed cookies. If the developer returns `NextResponse.redirect()` or `NextResponse.next()` without passing through `res`, the refresh is lost. Always use the pattern:
```typescript
const res = NextResponse.next()
const supabase = createMiddlewareClient({ req, res })
await supabase.auth.getSession()  // this writes new cookies into res
return res  // MUST return this res, not a new NextResponse
```

---

### 1.2 Access Token Expired — Refresh Token Also Expired

**Trigger:** User's refresh token has also expired (14-day TTL). User may have left the browser open for 2+ weeks without making any requests.

**Detection:** `@supabase/ssr` middleware calls `supabase.auth.getSession()`. Supabase SDK attempts token refresh but gets `401` from auth API. `getSession()` returns `{ data: { session: null }, error: ... }`.

**User-facing behavior:**
- User is silently redirected to `/login?next=/dashboard` (or whatever protected path they were on).
- On the login page, they see the standard login form with NO error message (this is a clean expiry, not an error).
- After login, the `?next` parameter causes a redirect back to their original destination.

**System behavior:**
1. Middleware detects `session === null`.
2. Middleware redirects to `/login?next=${encodeURIComponent(req.nextUrl.pathname + req.nextUrl.search)}`.
3. Cookies are cleared (Supabase SDK clears them automatically on failed refresh).
4. Login page reads `?next` query param and stores it in a hidden `<input>` or local state.
5. After successful login, server action reads the `next` param and redirects there (after validating it starts with `/`).

**`next` param validation (security):** The `next` param MUST be validated before redirect to prevent open redirect:
```typescript
const next = searchParams.get('next') ?? '/dashboard'
// Only allow relative paths starting with /
const safePath = next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard'
redirect(safePath)
```

**Recovery path:** User logs in again → redirected to original page.

---

### 1.3 Session Expired Mid-Action (Form Submission)

**Trigger:** User's session expires while they are filling out a form. They submit the form. The server action or API route cannot authenticate them.

**Scenarios where this occurs:**
- Billing page: User starts Stripe Checkout flow, session expires while on Stripe's page.
- Settings page: User is editing Discord connection, session expires.
- Integrations page: User completes OAuth flow in new tab, returns to a tab with expired session.

**Detection:** Server action calls `supabase.auth.getUser()` → returns `{ data: { user: null }, error: AuthSessionMissingError }`.

**User-facing behavior for each scenario:**

| Scenario | What the user sees |
|----------|-------------------|
| Form submission (any page) | Toast: "Your session has expired. Please sign in again." Redirect to `/login?next=/current-path` after 2 seconds. |
| Stripe Checkout (returning from stripe.com) | User lands on `/billing/return` with session expired. Page shows: "Session expired while completing checkout. Please sign in to verify your subscription." Login redirects back to `/billing`. |
| OAuth callback (returning from GitHub, Google, Linear) | `/api/integrations/[service]/callback` returns 401. User is redirected to `/login?next=/integrations`. After login, they must restart the OAuth flow. Their OAuth `code` is expired and cannot be reused. |
| File/key upload | Error message inline in form: "Your session has expired. Save your work and sign in again." |

**System behavior:**
1. All server actions must check `getUser()` as first operation.
2. If `user === null`, throw or return `{ error: 'SESSION_EXPIRED' }`.
3. Client component catches `SESSION_EXPIRED` response and:
   a. Shows toast with session expired message (duration: 3000ms).
   b. After 2000ms, calls `router.push('/login?next=' + encodeURIComponent(window.location.pathname))`.
4. The form input state is lost (no draft persistence at launch).

**Code pattern for Server Actions:**
```typescript
export async function updateSettingsAction(formData: FormData) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user }, error } = await supabase.auth.getUser()
  if (!user || error) {
    return { error: 'SESSION_EXPIRED' }
  }
  // ... proceed
}
```

**Recovery path:** User logs in → returns to page → must re-fill form.

---

### 1.4 Session Cookie Tampered or Corrupted

**Trigger:** Auth cookie has been modified (e.g., browser extension, manual edit). JWT signature validation fails.

**Detection:** Supabase SDK fails to parse the JWT. `getSession()` returns `{ data: { session: null }, error: ... }`.

**User-facing behavior:**
- Identical to 1.2 (expired refresh token): silent redirect to `/login`.
- No error message about tampering (don't reveal security details to potential attacker).

**System behavior:**
1. Middleware detects `session === null`.
2. Clears cookies (Supabase SDK does this automatically).
3. Redirects to `/login`.

**Recovery path:** User logs in with valid credentials.

---

### 1.5 Session Invalidated Server-Side (Admin Revocation)

**Trigger:** Admin uses Supabase Dashboard or admin panel to invalidate a specific user's sessions (e.g., after account suspension).

**Detection:** On next request, middleware calls `supabase.auth.getUser()` (not `getSession()` — `getUser()` validates against Supabase's server, not just locally). Returns `null` because the session has been revoked server-side.

**Important:** `getSession()` validates the JWT signature locally and does NOT detect server-side revocation. Only `getUser()` makes a server round-trip and detects revocation.

**Implementation requirement:** The middleware MUST call `getUser()` for protected routes (not just `getSession()`):
```typescript
// For admin and billing routes, use getUser() for server-side validation
const { data: { user } } = await supabase.auth.getUser()
if (!user) {
  return NextResponse.redirect(new URL('/login', req.url))
}
```
For performance, `getSession()` can be used for non-critical route guards (dashboard content), but `getUser()` is required for routes that perform privileged actions.

**User-facing behavior:**
- On next page navigation: silent redirect to `/login`.
- If account was suspended: after login attempt shows error "Your account has been suspended. Contact support at support@daimon.ai."

**Recovery path:** User contacts support. Admin can re-enable account.

---

## 2. Invalid Token Scenarios

### 2.1 Invalid Discord Bot Token — Format Validation

**Trigger:** User pastes a string that does not match the Discord bot token format.

**Discord bot token format:**
```
[MTA...MjQ...].[ Gjk...].[ short-hash ]
```
Regex: `^[A-Za-z0-9_-]{23,28}\.[A-Za-z0-9_-]{6,7}\.[A-Za-z0-9_-]{27,38}$`

**Detection:** Client-side regex check before API call.

**User-facing behavior:**
- Field border turns `#EF4444` (error red).
- Error message below field: "Invalid token format. Discord bot tokens look like: MTAxMTI...Gjk...xxxxx"
- Submit button remains disabled.

**System behavior:**
- No API call is made until client-side format check passes.
- If somehow a malformed token reaches the API route (direct POST), the `/api/discord/validate-token` route performs the same regex check and returns:
```json
{ "valid": false, "error": "INVALID_FORMAT", "message": "Token does not match Discord bot token format." }
```

**Recovery path:** User obtains correct bot token from Discord Developer Portal.

---

### 2.2 Invalid Discord Bot Token — API Validation Fails (Wrong Credentials)

**Trigger:** Token passes format check but Discord API rejects it (wrong token, revoked token, bot deleted).

**Detection:** `/api/discord/validate-token` calls `GET https://discord.com/api/v10/users/@me` with `Authorization: Bot <token>`. Discord returns HTTP 401.

**User-facing behavior:**
- Inline error below the token field: "This token is invalid or has been revoked. Please generate a new bot token in the Discord Developer Portal."
- "Validate" button returns to default state.
- Field border remains error red until user modifies the value.

**System behavior:**
```typescript
// POST /api/discord/validate-token
const response = await fetch('https://discord.com/api/v10/users/@me', {
  headers: { 'Authorization': `Bot ${token}` }
})
if (response.status === 401) {
  return NextResponse.json({
    valid: false,
    error: 'INVALID_TOKEN',
    message: 'This token is invalid or has been revoked.'
  }, { status: 422 })
}
```

**Recovery path:** User regenerates token in Discord Developer Portal → pastes new token.

---

### 2.3 Invalid Discord Bot Token — Bot Not in Guild

**Trigger:** Token is valid (bot exists and token is correct) but the bot has NOT been invited to the specified guild_id.

**Detection:** `/api/discord/validate-token` calls `GET https://discord.com/api/v10/guilds/{guild_id}` with the bot token. Discord returns HTTP 403 (Forbidden — bot lacks access) or 404 (guild not found from bot's perspective).

**User-facing behavior:**
- Inline warning below guild ID field: "The bot doesn't have access to this server. Make sure you've invited the bot to your Discord server using its invite link."
- A help link: "Generate invite link →" opens a modal with the invite URL constructed from the bot's client ID.
- The connection is NOT saved until the bot is confirmed to have guild access.

**Invite URL modal content:**
```
Invite your bot to the server using this link:
https://discord.com/api/oauth2/authorize?client_id={bot_client_id}&permissions=8&scope=bot%20applications.commands

After inviting:
1. Select your server from the dropdown
2. Click "Authorize"
3. Return to this page and click "Validate Again"
```
Where `{bot_client_id}` is extracted from the Discord bot token (first segment, base64-decoded).

**System behavior:**
```typescript
// After token validation succeeds, validate guild access
const guildResponse = await fetch(`https://discord.com/api/v10/guilds/${guildId}`, {
  headers: { 'Authorization': `Bot ${token}` }
})
if (guildResponse.status === 403 || guildResponse.status === 404) {
  return NextResponse.json({
    valid: false,
    error: 'BOT_NOT_IN_GUILD',
    message: "Bot doesn't have access to this server.",
    botClientId: extractClientIdFromToken(token)  // first segment, base64url decode, parse as snowflake
  }, { status: 422 })
}
```

**Recovery path:** User invites bot to guild → retries validation.

---

### 2.4 Invalid Anthropic API Key

**Trigger:** User enters an Anthropic API key that is invalid, expired, or has no credits.

**Detection:** `/api/keys/validate-anthropic` makes a minimal API call: `POST https://api.anthropic.com/v1/messages` with `max_tokens: 1` and an empty messages array to check auth without spending credits.

**Response scenarios:**

| HTTP Status | Anthropic Error | Meaning | Error shown to user |
|-------------|----------------|---------|-------------------|
| 401 | `authentication_error` | Key is invalid | "This API key is invalid. Please check your Anthropic Console for valid keys." |
| 403 | `permission_error` | Key lacks permissions | "This API key doesn't have permission to use the Messages API. Check your Anthropic Console." |
| 429 | `rate_limit_error` | Rate limited (key is probably valid) | "Key validated — you've hit Anthropic's rate limit. Your key appears valid." (treated as success) |
| 402 | `billing_error` | No credits | Warning: "This key is valid but has no remaining credits. Add credits at console.anthropic.com." (allowed to save — user can add credits later) |
| 200 | — | Key is valid | "API key validated successfully." |

**User-facing behavior for 401:**
- Inline error below key field: "This API key is invalid. Please check your Anthropic Console for valid keys."
- Field border: error red.
- "Save" button disabled.

**User-facing behavior for 402 (no credits):**
- Inline warning (yellow) below key field: "This key has no remaining credits. Your bot won't work until you add credits at console.anthropic.com."
- "Save" button ENABLED — user can save the key and add credits later.
- A toast on save: "API key saved. Add credits to Anthropic to activate your bot."

**System behavior:**
```typescript
// POST /api/keys/validate-anthropic
const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'x-api-key': key,
    'anthropic-version': '2023-06-01',
    'content-type': 'application/json'
  },
  body: JSON.stringify({ model: 'claude-3-haiku-20240307', max_tokens: 1, messages: [] })
})
// 400 with invalid_request_error is fine — the key authenticated
// 401 means the key is bad
```

**Recovery path:** User goes to console.anthropic.com → generates new key → re-enters.

---

### 2.5 Invalid OpenAI API Key

**Trigger:** User enters an invalid OpenAI API key (optional key for classification fallback).

**Detection:** `/api/keys/validate-openai` calls `GET https://api.openai.com/v1/models` with the key.

**Response scenarios:**

| HTTP Status | Meaning | Error shown to user |
|-------------|---------|-------------------|
| 401 | Key is invalid | "This API key is invalid. Check your OpenAI account." |
| 429 | Rate limited (key valid) | "Key appears valid (rate limited). Saved successfully." |
| 200 | Key is valid | "API key validated." |

**User-facing behavior:** Same pattern as 2.4. Invalid key → error red field + error message.

**Recovery path:** User visits platform.openai.com → generates new key.

---

### 2.6 OAuth Token Externally Revoked (GitHub, Google, Linear)

**Trigger:** User revokes Daimon's access in the third-party service's settings AFTER the OAuth flow completed. The token is stored in Supabase but is now invalid.

**Detection:** When the bot attempts to use the token for an API call, it receives a 401. The bot cannot refresh the token (access tokens for these services are non-refreshable or the refresh token was also revoked).

**Bot-side behavior:**
- Bot catches the 401 error.
- Returns error message to Discord: `"Your {GitHub/Google/Linear} connection has been revoked. Please reconnect it at https://daimon.ai/integrations."`

**Website-side behavior (on next integrations page load):**
- The service connection row shows status: `revoked` (from `tenant_service_connections.status` column).
- Status badge: "Revoked" (red badge, `#EF4444` text on `#FEE2E2` background).
- Action button: "Reconnect" (primary button, starts OAuth flow again).

**How the website learns the token was revoked:**
1. Bot detects 401 → updates `tenant_service_connections.status = 'revoked'` via Supabase (service role).
2. Website reads status on next load → displays "Revoked" state.
3. OR: User manually visits the integrations page and the UI shows the stored status.

**Integrations page revoked state per service:**

GitHub revoked:
```
[GitHub icon] GitHub
Status: Revoked
Connected: Never / [date]
Message: "Your GitHub connection was revoked. GitHub tools won't work until you reconnect."
[Reconnect] button
```

Google revoked:
```
[Google icon] Google
Status: Revoked
Message: "Your Google connection was revoked. Google tools won't work until you reconnect."
[Reconnect] button
```

Linear revoked:
```
[Linear icon] Linear
Status: Revoked
Message: "Your Linear connection was revoked. Linear tools won't work until you reconnect."
[Reconnect] button
```

**Recovery path:** User clicks "Reconnect" → OAuth flow restarts → new token stored.

---

## 3. Concurrent Login Scenarios

### 3.1 Same User Logged In from Two Browsers

**Trigger:** User is logged in on Browser A (home computer) and also logs in on Browser B (work computer). Both sessions are valid simultaneously.

**Supabase Auth behavior:** Supabase Auth allows multiple concurrent sessions. Each browser has its own JWT + refresh token pair. Both sessions are independently valid.

**Website behavior:**
- Both browsers work normally.
- Changes made in Browser A (e.g., updating settings) are immediately visible in Browser B on the next page load (server-side data fetch reflects DB state).
- Real-time updates (Supabase Realtime for bot status) propagate to both browsers.

**No special handling needed.** No "you've been logged in elsewhere" message.

---

### 3.2 Same User: One Browser Logs Out

**Trigger:** User clicks "Sign Out" in Browser A. Supabase revokes that session.

**Browser A behavior:** Redirected to `/login`.

**Browser B behavior:**
- The session in Browser B remains valid until its own JWT expires (up to 1 hour for access token).
- After JWT expiry, Browser B's next request triggers a refresh attempt. If Supabase was configured to revoke ALL sessions on sign-out, the refresh fails → redirect to `/login`.
- If Supabase uses single-session revocation (default), Browser B continues working normally with its own session.

**Default Supabase behavior:** Single-session revocation. Browser B continues unaffected.

**Implementation:** No special handling needed. Document this behavior in admin docs so users know sign-out doesn't invalidate all devices.

---

### 3.3 Concurrent Modification of the Same Resource

**Trigger:** User has the Settings page open in two browser tabs (Tab A and Tab B). Both are loaded with the same initial state. Tab A updates the Anthropic API key. Tab B still shows the old key and then tries to save a different key.

**Supabase behavior:** Last-write-wins at the database level. Tab B's save will overwrite Tab A's key.

**Website behavior:**
- Tab A saves: "API key updated successfully." (toast)
- Tab B saves (later): "API key updated successfully." (toast)
- Tab A now shows stale data until next page load.

**Mitigation:** No optimistic locking at launch. Document behavior: "Settings are not locked — if you have this page open in multiple tabs, the last save wins."

**Dashboard status widget:** The dashboard polls bot status every 30 seconds. Both tabs independently poll and display current status. No conflict.

---

### 3.4 Admin Impersonating a User Who Logs In Simultaneously

**Trigger:** Admin is impersonating User X. User X also logs in and starts using the dashboard at the same time.

**Detection:** Impersonation creates a separate admin session scoped to User X. User X's own session is unaffected.

**System behavior:**
- Impersonation session is in read-only mode (admin cannot write data as the user).
- User X's own session can make changes.
- No conflict at DB level because impersonation is read-only.

**User X visibility:** User X does NOT know they are being impersonated (no indicator shown to the impersonated user).

**Admin visibility:** Admin sees an "Impersonating: {user@email.com}" banner at the top of every page during impersonation. Clicking "End Impersonation" terminates the impersonation session only; User X's own session continues.

---

### 3.5 OAuth Flow Started in Multiple Tabs

**Trigger:** User opens two tabs and starts the OAuth flow for GitHub in both.

**CSRF state token:** Each OAuth initiation generates a unique `state` parameter stored as an encrypted cookie (or Supabase row). The two tabs generate different `state` values.

**Scenario A — Tab A completes first:**
1. Tab A's callback `/api/integrations/github/callback?code=xxx&state=yyy` validates state from cookie. State matches. Token exchanged and stored.
2. Tab B's callback arrives with a different state value.
3. State cookie in Tab B's browser has been replaced by Tab A's completion or has expired.
4. State mismatch → Tab B's callback returns: "Authorization failed. Please try connecting again." Redirect to `/integrations`.

**Scenario B — Tab B completes first (symmetric):** Same result as A, opposite tabs.

**Implementation:**
- State token is stored as a short-lived (15-minute) encrypted cookie `oauth_state_{service}`.
- On callback, state cookie is read, compared, and immediately deleted (one-time use).
- If state mismatch or cookie missing: return 400 error page with message and link to retry.

---

## 4. Password Reset Edge Cases

### 4.1 Password Reset While Already Logged In

**Trigger:** User is logged in to the dashboard and navigates to `/reset-password` (e.g., bookmarked link).

**Detection:** Middleware checks: if authenticated user visits `/reset-password`, redirect to `/settings` with a message.

**User-facing behavior:**
- Redirect to `/settings#security` (password change section on settings page).
- Toast: "You're already signed in. Change your password in Settings."

**System behavior (middleware):**
```typescript
if (req.nextUrl.pathname === '/reset-password' && session) {
  return NextResponse.redirect(new URL('/settings?tab=security', req.url))
}
```

**Settings page password change flow (for already-logged-in users):**
- Shows "Change Password" section with fields: Current Password, New Password, Confirm New Password.
- Does NOT require a reset link — uses `supabase.auth.updateUser({ password: newPassword })`.
- Requires valid current session.

---

### 4.2 Password Reset Link Clicked After Expiry (1 Hour)

**Trigger:** User requests a password reset email but clicks the link more than 1 hour later (Supabase default expiry).

**Detection:** `/reset-password?token=...&type=recovery` — when user submits new password, Supabase API returns `{ error: { message: 'Token has expired or is invalid' } }`.

**Detection timing:** The error is only detected on PASSWORD SUBMISSION, not on page load. The page loads normally even with an expired token. The token is only validated when the user submits the new password.

**User-facing behavior on page load:**
- Normal password reset form loads. User can type their new password.
- No indication the link is expired (Supabase doesn't expose pre-validation).

**User-facing behavior on form submission:**
- Form submit fails.
- Error message (inline, below the form): "This reset link has expired. Password reset links are valid for 1 hour."
- "Request a new reset link →" button/link appears, which navigates to `/reset-password` (the request step).
- Password fields are cleared.

**System behavior:**
```typescript
const { error } = await supabase.auth.updateUser({ password: newPassword })
if (error?.message?.includes('expired') || error?.message?.includes('invalid')) {
  return { error: 'RESET_TOKEN_EXPIRED' }
}
```

**Recovery path:** User clicks "Request a new reset link" → enters email again → receives new email → uses new link within 1 hour.

---

### 4.3 Password Reset Link Already Used

**Trigger:** Reset link is one-time-use. User clicks it, completes the reset, then clicks the same link again (e.g., from email history).

**Detection:** Supabase invalidates the token after first use. Same error as 4.2: `'Token has expired or is invalid'`.

**User-facing behavior:**
- Same as 4.2: "This reset link has expired."
- If user is already logged in (just reset password), middleware redirects them to `/dashboard` before they see the form.
- If user is NOT logged in: they see the expired link error and can request a new one.

---

### 4.4 Password Reset While Session Active (Mid-Flow Interruption)

**Trigger:** User initiates password reset from `/reset-password`. Before clicking the link, they log in on another device with their old password. Then they click the reset link.

**System behavior:**
- The reset link is still valid (tokens are valid regardless of whether the user is logged in elsewhere).
- Supabase processes the password update.
- After password update, the session established by the reset link is active.
- Other sessions (logged in with old password) may be invalidated (Supabase behavior: on password change, Supabase invalidates all other sessions by default).

**User-facing behavior:**
- Password reset completes normally.
- User is redirected to `/login` with message: "Your password has been updated. Please sign in with your new password."
- Other logged-in devices will be logged out on their next request (session invalidated).

---

### 4.5 Password Reset for Non-Existent Email

**Trigger:** User enters an email address that is not registered in Supabase Auth.

**Detection:** Supabase `auth.resetPasswordForEmail()` returns success (200) even for non-existent emails — this is intentional to prevent email enumeration.

**User-facing behavior:**
- Same success message as a real reset: "Check your email. We've sent password reset instructions to {email@example.com}."
- No indication that the email is not registered.
- No email is actually sent.

**System behavior:**
```typescript
const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password`
})
// Always show success message regardless of whether user exists
// This prevents email enumeration
return { success: true }
```

**Recovery path:** If the user never receives an email, they should try a different email address or sign up with this email.

---

### 4.6 Password Reset Email Goes to Spam / User Never Receives It

**Trigger:** Supabase sends the email, but it lands in spam or is blocked by the user's email provider.

**User-facing behavior:**
- After submitting the reset form, show: "Check your email (including spam folder). We've sent password reset instructions to {email}."
- Below the success message, a secondary action: "Didn't receive it? Wait 2 minutes then [resend →]"
- Clicking "Resend" calls the reset API again. Rate limit: maximum 3 resend attempts per email per 15 minutes.
- After 3 resends, the "Resend" link is disabled with text: "Maximum resend attempts reached. Try again in 15 minutes."

**System behavior:**
- Track resend count client-side (not server-side at launch — use a simple counter in React state).
- After 3 attempts: disable button and show cooldown message.
- Each resend calls `/api/auth/request-reset` which calls `supabase.auth.resetPasswordForEmail()`.

**Recovery path:** Check spam folder → whitelist daimon.ai → contact support if email consistently not received.

---

## 5. Account State Edge Cases

### 5.1 Email Verification Required (Supabase Email Confirmation Enabled)

**Trigger:** User signs up. Supabase is configured to require email confirmation before allowing login.

**Detection at signup:** `supabase.auth.signUp()` returns `{ data: { user: { email_confirmed_at: null } }, error: null }`. This indicates email was sent but not confirmed.

**User-facing behavior:**
- After signup form submission, redirect to `/signup/confirm-email` (a simple informational page).
- Page content:
  ```
  Check Your Email

  We sent a confirmation link to {user@example.com}.
  Click the link to activate your account.

  [Resend confirmation email]

  Already confirmed? [Sign in →]
  ```
- Resend button: same rate limiting as password reset (3 attempts per 15 minutes).
- Resend calls `supabase.auth.resend({ type: 'signup', email })`.

**Detection at login (if user tries to log in before confirming):**
- `supabase.auth.signInWithPassword()` returns `{ error: { message: 'Email not confirmed' } }`.
- Login form shows: "Please verify your email before signing in. Check your inbox for a confirmation link."
- Link below: "Resend confirmation email →" — opens a minimal modal with an email field.

**Email confirmation callback:**
- Supabase sends link pointing to `/api/auth/callback?token_hash=...&type=signup`.
- `/api/auth/callback` exchanges the token, establishes session, redirects to `/dashboard`.

**System behavior for `/api/auth/callback`:**
```typescript
// app/api/auth/callback/route.ts
import { createRouteHandlerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/dashboard'

  if (tokenHash && type) {
    const supabase = createRouteHandlerClient({ cookies })
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
    if (!error) {
      return NextResponse.redirect(new URL(next, request.url))
    }
  }
  // Error case: invalid or expired confirmation link
  return NextResponse.redirect(new URL('/login?error=confirmation_failed', request.url))
}
```

**Login page reads `?error=confirmation_failed`:**
- Shows: "Email confirmation failed. The link may have expired. Try signing in or request a new confirmation email."

---

### 5.2 Signup with Already-Registered Email

**Trigger:** User enters an email that already has a Supabase Auth account.

**Detection:** `supabase.auth.signUp()` with an existing email — Supabase behavior varies:
- If `ENABLE_EMAIL_AUTOCONFIRM` is off: Supabase sends a confirmation email to the existing address and returns success (prevents email enumeration).
- If `ENABLE_EMAIL_AUTOCONFIRM` is on: Supabase returns `{ data: { user: { identities: [] } }, error: null }`. Empty `identities` array signals duplicate.

**User-facing behavior:**
- To prevent email enumeration: ALWAYS show "Check your email for a confirmation link."
- Do NOT say "An account with this email already exists."
- The existing user will receive an email: "Someone tried to create a Daimon account with your email. If this was you, [sign in here →]. If this wasn't you, you can ignore this email."

**System behavior:**
```typescript
const { data, error } = await supabase.auth.signUp({ email, password })
// Always redirect to confirm email page — don't differentiate existing vs new
redirect('/signup/confirm-email?email=' + encodeURIComponent(email))
```

---

### 5.3 Account Not Yet Active (Tenant Setup Incomplete)

**Trigger:** User completed signup (email confirmed, auth.users row exists) but the tenant creation server action failed partway through (network error, DB constraint). Result: auth.users row exists but no `tenants` or `tenant_members` row.

**Detection:** After successful login, tenant resolution query:
```typescript
const { data: membership } = await supabase
  .from('tenant_members')
  .select('tenant_id, role, tenants(*)')
  .eq('user_id', user.id)
  .single()
```
Returns `{ data: null }` — no tenant membership found.

**User-facing behavior:**
- Do not show the normal dashboard.
- Redirect to `/onboarding` — a setup page that completes tenant creation.
- Page content: "Let's set up your workspace." with a simple form:
  - Workspace name (pre-filled with email prefix)
  - [Create workspace] button

**System behavior:**
```typescript
// In dashboard layout server component
if (!membership) {
  redirect('/onboarding')
}
```

**Onboarding page action:**
```typescript
export async function createWorkspaceAction(name: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'SESSION_EXPIRED' }

  // Check if tenant already exists (idempotent)
  const { data: existing } = await supabase
    .from('tenant_members')
    .select('tenant_id')
    .eq('user_id', user.id)
    .single()

  if (existing) {
    redirect('/dashboard')
  }

  // Create tenant
  const { data: tenant, error } = await supabase
    .from('tenants')
    .insert({ name, owner_id: user.id, plan: 'free', status: 'active' })
    .select()
    .single()

  if (error) return { error: 'TENANT_CREATION_FAILED' }

  // Create membership
  await supabase
    .from('tenant_members')
    .insert({ tenant_id: tenant.id, user_id: user.id, role: 'owner' })

  redirect('/dashboard')
}
```

**Recovery path:** User completes onboarding form → tenant created → dashboard loads normally.

---

### 5.4 Account Suspended Mid-Session

**Trigger:** Admin suspends a user's account while the user is actively browsing the dashboard.

**Detection timing:**
- Suspension in Supabase: admin calls Supabase Auth Admin API to disable the user.
- The user's current JWT is still valid until expiry (up to 1 hour).
- After JWT expiry, refresh attempt fails → user is logged out.
- If admin wants immediate revocation: use Supabase Admin API to sign out the user from all sessions.

**User-facing behavior (immediate revocation):**
- On next protected route request, middleware detects `user === null` → redirect to `/login`.
- Login attempt with their credentials returns: "Your account has been suspended. Contact support at support@daimon.ai."

**User-facing behavior (natural JWT expiry path):**
- User continues browsing for up to 1 hour (the access token duration).
- After expiry, redirect to `/login` with suspended account error.

**Implementation for suspended account detection at login:**
```typescript
const { error } = await supabase.auth.signInWithPassword({ email, password })
if (error?.message?.includes('User not allowed')) {
  return { error: 'ACCOUNT_SUSPENDED' }
}
// Error message shown: "Your account has been suspended. Contact support at support@daimon.ai."
```

---

## 6. Admin Impersonation Edge Cases

### 6.1 Admin Impersonates User Then User Deletes Their Account

**Trigger:** Admin starts impersonating User X. User X (in another session) initiates account deletion.

**System behavior:**
1. Account deletion cascade: `auth.users` delete cascades to `tenant_members` → `tenants` (if owner and no other members).
2. Admin's impersonation session references the now-deleted user.
3. Next request from admin (during impersonation) will fail to resolve the user.
4. Middleware detects session invalid → redirect admin to `/login`.
5. Admin logs back in with their own credentials.

**Mitigation:** Account deletion is soft-delete (sets `tenants.status = 'deleted'`), not hard delete, until a 30-day grace period. Hard delete is a Supabase Admin API operation that only runs during grace period expiry cleanup. This gives admin time to end impersonation before the account is truly gone.

---

### 6.2 Admin Token Expiry During Impersonation

**Trigger:** Admin's own session expires while they are in an impersonation session.

**Detection:** The impersonation session is a separate short-lived Supabase session (60-minute TTL, non-refreshable). The admin's own session is checked when they try to end impersonation.

**User-facing behavior:**
- During impersonation: if the impersonation session expires, admin sees "Impersonation session has ended." Banner disappears, admin is still logged in as themselves.
- Admin is redirected to `/admin/tenant/[id]` with the tenant they were impersonating.

**Implementation:**
- Impersonation sessions are stored in `admin_impersonation_sessions` with a `created_at` timestamp.
- A cron job (Edge Function, every 15 minutes) deletes rows older than 60 minutes.
- On each admin page load, check if the impersonation session row still exists. If not, show "Impersonation ended."

---

### 6.3 Impersonation Read-Only Enforcement

**Trigger:** Admin clicks a button that would normally trigger a write operation (e.g., saving settings, disconnecting a service).

**Detection:** All server actions check `impersonating_admin_id` in the session context. If set, write actions are blocked.

**Session context with impersonation:**
```typescript
// In session context (cookie or server component)
interface SessionContext {
  user_id: string
  tenant_id: string
  impersonating_admin_id?: string  // Set when admin is impersonating
}
```

**User-facing behavior:**
- Write buttons are visible but disabled with a tooltip: "Actions are disabled during impersonation."
- Specifically disabled actions:
  - Save settings
  - Connect/disconnect integrations
  - Update API keys
  - Cancel subscription
  - Delete account

**System behavior:**
```typescript
export async function saveSettingsAction(formData: FormData) {
  const session = await getSessionContext()
  if (session.impersonating_admin_id) {
    return { error: 'IMPERSONATION_READ_ONLY', message: 'Actions are disabled during impersonation.' }
  }
  // proceed...
}
```

---

## 7. Multi-Tab Behavior

### 7.1 Sign Out in One Tab, Other Tabs Still Active

**Trigger:** User has dashboard open in Tab A and Tab B. User signs out in Tab A.

**Tab A behavior:** Redirected to `/login`.

**Tab B behavior:**
- Tab B continues to display the last loaded data (static render in React state).
- Next navigation or data fetch: Supabase client in Tab B detects cookie is cleared → request returns 401 → redirect to `/login`.
- If using Supabase Realtime in Tab B: Realtime connection drops when the auth token is invalidated → connection error handler redirects to `/login`.

**Implementation: Auth state listener in root layout:**
```typescript
// app/(dashboard)/layout.tsx
'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

export function AuthStateListener() {
  const router = useRouter()
  const supabase = createBrowserClient(...)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        router.push('/login')
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  return null
}
```

This listener fires in ALL open tabs when any tab signs out (Supabase broadcasts auth state changes across tabs via localStorage events).

---

### 7.2 Session Refresh in One Tab, Other Tabs Pick Up New Token

**Trigger:** Tab A's access token is refreshed. Tab B has an older access token.

**Supabase behavior:** `@supabase/ssr` stores tokens in cookies (shared across tabs). When Tab A refreshes, the new token in the cookie is available to Tab B on its next request.

**User-facing behavior:** Transparent. No action needed.

---

### 7.3 Concurrent Reads of Bot Status from Multiple Tabs

**Trigger:** User has dashboard open in two tabs. Both subscribe to Supabase Realtime for bot status updates.

**System behavior:**
- Each tab creates an independent Realtime subscription.
- Both receive the same status updates.
- No data inconsistency.
- No message duplication (each tab processes its own subscription independently).

**Resource concern:** Each open tab = one additional Realtime WebSocket connection. Acceptable for the anticipated usage pattern (1-2 tabs at most).

---

## 8. Rate Limiting Edge Cases

### 8.1 Login Rate Limit Hit

**Trigger:** User makes 5 failed login attempts within 15 minutes (brute force protection, enforced by Supabase Auth).

**Detection:** Supabase Auth returns: `{ error: { message: 'Too many requests', status: 429 } }`.

**User-facing behavior:**
- Error message below form: "Too many failed attempts. Please wait 15 minutes before trying again."
- Login form submit button is DISABLED for 15 minutes.
- A countdown timer is shown: "Try again in 14:32"
- The timer is client-side (no server state needed). Starts when 429 is received.
- After 15 minutes, button re-enables automatically and countdown disappears.

**System behavior:**
```typescript
const { error } = await supabase.auth.signInWithPassword({ email, password })
if (error?.status === 429) {
  return { error: 'RATE_LIMITED', retryAfterMs: 15 * 60 * 1000 }
}
```

**Client component:**
```typescript
if (result.error === 'RATE_LIMITED') {
  setRateLimitEndTime(Date.now() + result.retryAfterMs)
  // useEffect watches rateLimitEndTime and re-enables button when reached
}
```

---

### 8.2 Signup Rate Limit Hit

**Trigger:** IP address creates more than 5 accounts within 1 hour.

**Detection:** Supabase Auth returns 429.

**User-facing behavior:**
- Error below form: "Too many accounts created recently. Please try again in 1 hour."
- Form submit disabled (no countdown timer — 1 hour is too long to display).

---

### 8.3 Password Reset Rate Limit Hit

**Trigger:** User requests more than 3 password reset emails in 15 minutes.

**Detection:** Handled client-side (3 resend clicks). Supabase may also return 429.

**User-facing behavior:**
- After 3 resends: "Maximum resend attempts reached. Please wait 15 minutes."
- Resend button disabled, greyed out.
- No countdown timer.

---

## 9. Email Change Edge Cases

### 9.1 User Changes Email in Settings

**Note:** At launch, email change is NOT available in the settings UI. This section documents future behavior for when it is added.

**Future flow:**
1. User enters new email in settings form.
2. `supabase.auth.updateUser({ email: newEmail })` — Supabase sends confirmation to BOTH old and new email addresses.
3. User must confirm from the new email address.
4. Until confirmed, user's auth email remains the old address.

**Not implemented at launch.** Settings page shows email as read-only: "To change your email, contact support@daimon.ai."

---

## 10. Deep Link / Redirect Edge Cases

### 10.1 User Bookmarks a Deep Link, Returns When Logged Out

**Trigger:** User bookmarked `/dashboard/settings` (or `/billing`, etc.). Visits bookmark when session is expired or not logged in.

**Detection:** Middleware detects no session → redirect.

**User-facing behavior:**
- Redirect to `/login?next=%2Fdashboard%2Fsettings`.
- After login: redirect to `/dashboard/settings`.
- The exact path (including hash or query params) is preserved.

**Implementation:**
```typescript
// middleware.ts
const next = encodeURIComponent(req.nextUrl.pathname + req.nextUrl.search)
return NextResponse.redirect(new URL(`/login?next=${next}`, req.url))
```

---

### 10.2 `?next` Parameter Points to Invalid Path

**Trigger:** Someone crafts a link `/login?next=https://evil.com` trying to redirect to an external site after login.

**Detection:** The `next` param is validated after login.

**System behavior:**
```typescript
// After successful login
const next = searchParams.get('next') ?? '/dashboard'
// Validate: must start with / and not //
const safePath = (next.startsWith('/') && !next.startsWith('//')) ? next : '/dashboard'
redirect(safePath)
```

**User-facing behavior:** User is redirected to `/dashboard` instead of the malicious URL. No error shown.

---

### 10.3 Email Confirmation Link with Invalid `next` Parameter

**Trigger:** Confirmation link was generated with a `next` parameter pointing to a path that no longer exists (e.g., `/dashboard/old-feature`).

**Detection:** After confirmation, redirect to the `next` path. Next.js will return 404.

**System behavior:**
- The 404 page shows the standard Daimon 404 page with a link to `/dashboard`.
- This is acceptable. The user is already authenticated at this point.

---

## 11. Supabase Auth Service Outage

### 11.1 Supabase Auth Completely Down During Login

**Trigger:** Supabase Auth service is experiencing an outage. Login request returns network error or 503.

**Detection:** `supabase.auth.signInWithPassword()` throws a network error or returns a 5xx response.

**User-facing behavior:**
- Error message below form: "Sign in is temporarily unavailable. Please try again in a few minutes."
- "Try again in a few minutes" — no retry button or countdown (the outage duration is unknown).
- Link: "Check Daimon status → [status.daimon.ai]"

**System behavior:**
```typescript
try {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    if (error.status && error.status >= 500) {
      return { error: 'SERVICE_UNAVAILABLE' }
    }
    // ... handle other errors
  }
} catch (e) {
  // Network error
  return { error: 'SERVICE_UNAVAILABLE' }
}
```

---

### 11.2 Supabase Auth Down During Session Refresh (Middleware)

**Trigger:** Middleware calls `supabase.auth.getSession()` but Supabase Auth is down. The SDK throws or returns a network error.

**System behavior:**
- Middleware catches the error.
- Does NOT redirect to `/login` (would be jarring for currently-logged-in users).
- Allows the request to proceed with the last-known session state (last cached session).
- Logs the error to monitoring (Sentry/Axiom).

**Implementation:**
```typescript
try {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
} catch (e) {
  // Auth service unavailable — allow request through with caution
  // Log error, allow cached session
  console.error('Supabase auth unavailable:', e)
  // Continue with next() — user sees potentially stale data
}
return res
```

**User-facing behavior:** User continues browsing. May see "Connection lost" indicator if Realtime is also down. Dashboard data may be stale but page continues to render.

---

## 12. Summary Table: Auth Edge Cases

| # | Scenario | Trigger | User Sees | System Does |
|---|---------|---------|-----------|-------------|
| 1.1 | Access token expired, refresh succeeds | JWT expiry (1h) | Nothing | Silent refresh, request continues |
| 1.2 | Both tokens expired | 14d inactivity | Redirect to /login?next=... | Clear cookies, preserve destination |
| 1.3 | Session expires mid-form | Form submit with expired session | Toast + redirect after 2s | Return SESSION_EXPIRED, trigger redirect |
| 1.4 | Cookie tampered | Cookie modification | Redirect to /login | Clear cookies, redirect |
| 1.5 | Session revoked server-side | Admin action | Redirect to /login | getUser() detects revocation |
| 2.1 | Discord token: bad format | User input | Field error: invalid format | Client-side regex, no API call |
| 2.2 | Discord token: 401 from Discord | Wrong/revoked token | "Token invalid or revoked" | Discord API call returns 401 |
| 2.3 | Bot not in guild | Bot not invited | "Bot doesn't have access" + invite link | Discord guild API returns 403 |
| 2.4 | Anthropic key invalid | 401 from Anthropic | "Invalid API key" | Anthropic API returns 401 |
| 2.4b | Anthropic key: no credits | 402 from Anthropic | Warning, still saveable | Allow save with warning |
| 2.5 | OpenAI key invalid | 401 from OpenAI | "Invalid API key" | OpenAI models endpoint returns 401 |
| 2.6 | OAuth token externally revoked | User revokes in service | "Revoked" badge, reconnect button | Bot detects 401, updates status column |
| 3.1 | Concurrent sessions (2 browsers) | Multi-device login | Nothing special | Both sessions valid |
| 3.2 | Sign out one browser | User action | Other browser: logs out on JWT expiry | Auth state listener handles cross-tab |
| 3.3 | Concurrent edit same resource | Two tabs | Last-write-wins, no conflict | No optimistic locking |
| 3.4 | Admin impersonates active user | Admin action | User unaware | Impersonation is read-only |
| 3.5 | OAuth started in two tabs | User opens 2 tabs | Second tab: "Authorization failed" | State mismatch detected, one-time state token |
| 4.1 | Reset while logged in | Authenticated user visits /reset-password | Redirect to /settings | Middleware redirect |
| 4.2 | Reset link expired | >1h since request | "Link expired" on submit | Supabase returns token error |
| 4.3 | Reset link used twice | Second click | "Link expired" | Token invalidated on first use |
| 4.4 | Reset mid-session | Normal flow | Success, other sessions logged out | Supabase invalidates other sessions |
| 4.5 | Reset for unknown email | Non-existent account | "Check your email" (same as real) | Prevent email enumeration |
| 4.6 | Reset email in spam | Email delivery issue | "Check spam" message + resend (3 max) | Rate-limited resend |
| 5.1 | Email verification required | New signup | "Check your email" page | /api/auth/callback handles token |
| 5.2 | Signup with existing email | Duplicate email | "Check your email" (obscures duplicate) | Prevent email enumeration |
| 5.3 | Tenant setup incomplete | Failed signup transaction | Redirect to /onboarding | Idempotent tenant creation |
| 5.4 | Account suspended mid-session | Admin action | Redirect to /login + suspended message | Session revoked, login blocked |
| 6.1 | User deleted during impersonation | Account deletion | Admin redirected to /login | Cascade delete, session invalidated |
| 6.2 | Admin token expires during impersonation | 60min TTL | "Impersonation ended" banner goes away | Cron cleanup + session check |
| 6.3 | Write action during impersonation | Admin clicks write button | Disabled button + tooltip | Server action returns IMPERSONATION_READ_ONLY |
| 7.1 | Sign out in one tab | User action | Other tabs redirect to /login | onAuthStateChange broadcast |
| 7.2 | Token refresh in one tab | JWT expiry | Other tabs use new token | Shared cookie storage |
| 7.3 | Bot status from multiple tabs | Multiple open tabs | Both tabs update correctly | Independent Realtime subscriptions |
| 8.1 | Login rate limit | 5 failed attempts | 15-min countdown, disabled button | Client-side countdown timer |
| 8.2 | Signup rate limit | 5 accounts/IP/hour | "Try again in 1 hour" | Supabase 429 → error message |
| 8.3 | Password reset rate limit | 3 resends | "Max attempts reached" | Client-side counter + button disable |
| 10.1 | Bookmarked deep link | User visits when logged out | Login → redirect back | next param preserved and used |
| 10.2 | Open redirect via next param | Malicious URL in next | Redirect to /dashboard | next param validated (must start with /) |
| 10.3 | Invalid next in email link | 404 path after confirm | 404 page with dashboard link | Next.js 404 handler |
| 11.1 | Supabase Auth down at login | Service outage | "Temporarily unavailable" + status link | Catch 5xx/network error, friendly message |
| 11.2 | Supabase Auth down mid-session | Service outage | Page continues with cached session | Middleware catches error, allows through |
