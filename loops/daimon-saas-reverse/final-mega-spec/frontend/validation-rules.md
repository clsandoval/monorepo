# Validation Rules — Complete Specification

> Consolidation of all form field validation rules across every Daimon SaaS page.
> Sources: auth-pages.md, billing-page.md, settings-page.md, integrations-page.md, copy.md
> Last updated: 2026-03-13

---

## Overview

This document is the **authoritative validation contract** for the Daimon SaaS frontend. Every form field,
every constraint, every error message is listed here. The forward loop reads this file to implement
client-side validation in React Hook Form + Zod schemas.

### Validation Architecture

**Client-side validation**: Implemented with `react-hook-form` + `zod` resolver. Errors display inline below
the field immediately on blur (after first interaction) and on all fields on submit attempt.

**Server-side validation**: API route validates all inputs again before writing to Supabase. API errors
are mapped to specific field errors or toast messages.

**Error display rules**:
- **Inline field error**: Red text below the input field. Font: 12px Inter Medium. Color: `#EF4444`. Appears after
  field is touched (blurred at least once) AND fails validation, OR after a submit attempt.
- **Toast error**: For server-level errors not attributable to a specific field. Error toasts persist 6s.
- **Toast success**: Confirmation after successful mutations. Success toasts persist 3s.
- **Form-level error banner**: For auth server errors (wrong credentials, account suspended, etc.).
  Appears above the submit button inside the card.

### Zod Validation Timing

- `mode: 'onTouched'` — validates on blur after first interaction
- `reValidateMode: 'onChange'` — re-validates on change after first error
- On submit: all fields validated simultaneously, focus moves to first error

---

## 1. Auth Pages

### 1.1 Login Form (`/login`)

**Zod schema name**: `LoginSchema`

| Field | Name | Type | Required | Constraints | Error Messages |
|-------|------|------|----------|-------------|----------------|
| Email | `email` | `email` input | Yes | Max 254 chars; valid email format | Empty: `"Email is required."` / Invalid format: `"Please enter a valid email address."` |
| Password | `password` | `password` input | Yes | — | Empty: `"Password is required."` |

**HTML attributes**:
- `email`: `autocomplete="email"`, `autofocus`, `maxlength="254"`
- `password`: `autocomplete="current-password"`

**Server error mapping** (shown in form-level error banner):

| HTTP Status / Supabase Error | Banner Message |
|------------------------------|----------------|
| 401 — Invalid credentials | `"Incorrect email or password."` |
| 400 — Email not confirmed | `"Please verify your email address before signing in. Check your inbox for a confirmation email."` |
| 429 — Rate limited (>5 attempts / 15 min) | `"Too many sign-in attempts. Please wait 15 minutes and try again."` |
| 500 / network error | `"Unable to sign in right now. Please try again in a moment."` |

**Submit button states**:
- Default: `"Sign in"`
- Loading (after click): `"Signing in…"` with spinner, disabled
- Error: returns to `"Sign in"`, enabled

---

### 1.2 Signup Form (`/signup`)

**Zod schema name**: `SignupSchema`

**Step 1 — Account details** (fields visible on initial render):

| Field | Name | Type | Required | Constraints | Error Messages |
|-------|------|------|----------|-------------|----------------|
| Full name | `fullName` | `text` | Yes | Min 2 chars; Max 100 chars | Empty: `"Full name is required."` / < 2: `"Please enter your full name."` / > 100: `"Full name must be 100 characters or less."` |
| Email | `email` | `email` | Yes | Max 254 chars; valid email format | Empty: `"Email is required."` / Invalid: `"Please enter a valid email address."` / Already used (server): `"An account with this email already exists. Try signing in."` |
| Password | `password` | `password` | Yes | Min 8 chars; Max 72 chars; ≥1 uppercase; ≥1 lowercase; ≥1 number | Empty: `"Password is required."` / < 8: `"Password must be at least 8 characters."` / > 72: `"Password cannot exceed 72 characters."` / No uppercase: `"Password must contain at least one uppercase letter."` / No lowercase: `"Password must contain at least one lowercase letter."` / No number: `"Password must contain at least one number."` |
| Confirm password | `confirmPassword` | `password` | Yes | Must match `password` field | Empty: `"Please confirm your password."` / Mismatch: `"Passwords do not match."` |
| Workspace name | `workspaceName` | `text` | Yes | Min 2 chars; Max 64 chars | Empty: `"Workspace name is required."` / < 2: `"Workspace name must be at least 2 characters."` / > 64: `"Workspace name must be 64 characters or less."` |
| Terms agreement | `agreeTerms` | `checkbox` | Yes | Must be checked | Unchecked: `"You must agree to the Terms of Service and Privacy Policy to create an account."` |

**HTML attributes**:
- `fullName`: `autocomplete="name"`, `autofocus`, `maxlength="100"`
- `email`: `autocomplete="email"`, `maxlength="254"`
- `password`: `autocomplete="new-password"`, `minlength="8"`, `maxlength="72"`
- `confirmPassword`: `autocomplete="new-password"`
- `workspaceName`: `maxlength="64"`

**Password strength indicator** (displayed below password field, above confirm field):

| Criteria Met | Bar Color | Label |
|--------------|-----------|-------|
| 1 of 4 | `#DC2626` (red) | `"Weak"` |
| 2 of 4 | `#F59E0B` (amber) | `"Fair"` |
| 3 of 4 | `#B4E7DD` (Aqua) | `"Good"` |
| 4 of 4 | `#059669` (green) | `"Strong"` |

**Criteria** (each is one segment of the 4-segment horizontal bar):
1. At least 1 uppercase letter
2. At least 1 lowercase letter
3. At least 1 number
4. Length ≥ 12 characters

**Server error mapping** (form-level banner):

| Supabase Error | Banner Message |
|----------------|----------------|
| Email already in use | `"An account with this email already exists. Try signing in."` (also shown as field error on `email`) |
| 429 rate limited | `"Too many signup attempts. Please wait 15 minutes and try again."` |
| 500 / network error | `"Unable to create account right now. Please try again in a moment."` |

**Submit button states**:
- Default: `"Create account"`
- Loading: `"Creating account…"` with spinner, disabled
- Error: returns to `"Create account"`, enabled

---

### 1.3 Reset Password Form (`/reset-password`)

**Zod schema name**: `ResetPasswordRequestSchema`

| Field | Name | Type | Required | Constraints | Error Messages |
|-------|------|------|----------|-------------|----------------|
| Email | `email` | `email` | Yes | Max 254 chars; valid email format | Empty: `"Email is required."` / Invalid: `"Please enter a valid email address."` |

**HTML attributes**:
- `email`: `autocomplete="email"`, `autofocus`, `maxlength="254"`

**Server behavior**: Always shows success state regardless of whether email exists (prevents user enumeration). If user exists, sends email. If not, does nothing. No error mapping to display.

**Server error mapping** (form-level banner — only for true server failures):

| Error | Banner Message |
|-------|----------------|
| 429 rate limited | `"Too many reset attempts. Please wait before trying again."` |
| 500 / network error | `"Unable to send reset email. Please try again in a moment."` |

**Submit button states**:
- Default: `"Send reset link"`
- Loading: `"Sending…"` with spinner, disabled
- Success: transitions to success state (not a button state)

---

### 1.4 Reset Password Confirm Form (`/reset-password/confirm`)

**Zod schema name**: `ResetPasswordConfirmSchema`

| Field | Name | Type | Required | Constraints | Error Messages |
|-------|------|------|----------|-------------|----------------|
| New password | `newPassword` | `password` | Yes | Min 8 chars; Max 72 chars; ≥1 uppercase; ≥1 lowercase; ≥1 number | Empty: `"Password is required."` / < 8: `"Password must be at least 8 characters."` / > 72: `"Password cannot exceed 72 characters."` / No uppercase: `"Password must contain at least one uppercase letter."` / No lowercase: `"Password must contain at least one lowercase letter."` / No number: `"Password must contain at least one number."` |
| Confirm new password | `confirmNewPassword` | `password` | Yes | Must match `newPassword` | Empty: `"Please confirm your password."` / Mismatch: `"Passwords do not match."` |

**HTML attributes**:
- `newPassword`: `autocomplete="new-password"`, `autofocus`, `minlength="8"`, `maxlength="72"`
- `confirmNewPassword`: `autocomplete="new-password"`

**Password strength indicator**: Same as signup form (4-segment bar, same criteria and colors).

**Server error mapping** (form-level banner):

| Error | Banner Message |
|-------|----------------|
| New password same as old | `"Your new password must be different from your previous password."` |
| Link expired / session invalid | `"This reset link has expired. Please request a new one."` |
| Supabase min password error | `"Password must be at least 8 characters."` (mapped to field error on `newPassword`) |
| 500 / network error | `"Failed to update password. Please request a new reset link or contact support@daimon.ai."` |

**Submit button states**:
- Default: `"Set new password"`
- Loading: `"Updating password…"` with spinner, disabled
- Success: transitions to success state

---

## 2. Billing Page

### 2.1 Anthropic API Key Modal

**Modal trigger**: "Add API Key" button (no key set) or "Update" button (key already set).
**Zod schema name**: `AnthropicApiKeySchema`

| Field | Name | Type | Required | Constraints | Error Messages |
|-------|------|------|----------|-------------|----------------|
| Anthropic API Key | `api_key` | `password` (show/hide toggle) | Yes | Starts with `sk-ant-`; Min 20 chars; No whitespace | Empty: `"API key is required."` / Wrong prefix: `"Anthropic keys start with 'sk-ant-'. Please check and try again."` / < 20 chars: `"This key is too short to be valid."` / Contains whitespace: `"API key should not contain spaces or newlines."` |

**HTML attributes**:
- `api_key`: `autocomplete="off"`, `spellcheck="false"`, `placeholder="sk-ant-api03-..."`, `autofocus`

**Client-side validation** (Zod):
```
z.string()
  .min(1, "API key is required.")
  .refine(k => k.startsWith("sk-ant-"), "Anthropic keys start with 'sk-ant-'. Please check and try again.")
  .min(20, "This key is too short to be valid.")
  .refine(k => !/\s/.test(k), "API key should not contain spaces or newlines.")
```

**Server-side validation** (POST `/api/validate/anthropic-key`):
- Makes test call: `POST https://api.anthropic.com/v1/messages` with `max_tokens: 1`, model `claude-haiku-4-5-20251001`
- Loading state in modal: button shows `"Validating…"` with spinner; helper text below: `"Verifying your key with Anthropic — this takes about 2 seconds."`

**Server error mapping** (shown inline below the input field):

| Anthropic Response | Error Message |
|--------------------|---------------|
| 401 Unauthorized | `"This key was rejected by Anthropic. Double-check it and try again."` |
| 429 Too Many Requests | `"Anthropic rate-limited the validation request. Please wait a moment and try again."` |
| 5xx Server Error | `"Anthropic returned an unexpected error. Your key may be valid — wait a few minutes and try again."` |
| Network error | `"Unable to reach Anthropic. Please check your connection and try again."` |

**On success**: Modal closes. Toast: `"Anthropic API key saved."` (if new) or `"Anthropic API key updated."` (if replacing).

**Submit button states**:
- Default: `"Save key"` (if new) or `"Update key"` (if replacing)
- Loading: `"Validating…"` with spinner, disabled
- Error: returns to default label, enabled

---

### 2.2 OpenAI API Key Modal

**Modal trigger**: "Add OpenAI Key" button (no key set) or "Update" button (key set).
**Zod schema name**: `OpenAIApiKeySchema`

| Field | Name | Type | Required | Constraints | Error Messages |
|-------|------|------|----------|-------------|----------------|
| OpenAI API Key | `api_key` | `password` (show/hide toggle) | Yes | Starts with `sk-`; Min 20 chars; No whitespace | Empty: `"API key is required."` / Wrong prefix: `"OpenAI keys start with 'sk-'. Please check and try again."` / < 20 chars: `"This key is too short to be valid."` / Contains whitespace: `"API key should not contain spaces or newlines."` |

**HTML attributes**:
- `api_key`: `autocomplete="off"`, `spellcheck="false"`, `placeholder="sk-proj-..."`, `autofocus`

**Client-side validation** (Zod):
```
z.string()
  .min(1, "API key is required.")
  .refine(k => k.startsWith("sk-"), "OpenAI keys start with 'sk-'. Please check and try again.")
  .min(20, "This key is too short to be valid.")
  .refine(k => !/\s/.test(k), "API key should not contain spaces or newlines.")
```

**Server-side validation** (POST `/api/validate/openai-key`):
- Makes test call: `GET https://api.openai.com/v1/models` with `Authorization: Bearer <key>`
- Loading state: button shows `"Validating…"` with spinner

**Server error mapping** (shown inline below input field):

| OpenAI Response | Error Message |
|-----------------|---------------|
| 401 Unauthorized | `"This key was rejected by OpenAI. Please verify it in the OpenAI Platform dashboard."` |
| 429 Too Many Requests | `"OpenAI rate-limited the validation request. Please wait a moment and try again."` |
| 5xx Server Error | `"OpenAI returned an unexpected error. Your key may be valid — wait a few minutes and try again."` |
| Network error | `"Unable to reach OpenAI. Please check your connection and try again."` |

**On success**: Modal closes. Toast: `"OpenAI API key saved."` (if new) or `"OpenAI API key updated."` (if replacing).

**Submit button states**:
- Default: `"Save key"` or `"Update key"`
- Loading: `"Validating…"` with spinner, disabled

---

## 3. Settings Page

### 3.1 Workspace Name Form

**Zod schema name**: `WorkspaceNameSchema`

| Field | Name | Type | Required | Constraints | Error Messages |
|-------|------|------|----------|-------------|----------------|
| Workspace name | `name` | `text` | Yes | Min 2 chars; Max 64 chars | Empty: `"Workspace name is required."` / < 2: `"Workspace name must be at least 2 characters."` / > 64: `"Workspace name must be 64 characters or less."` |

**HTML attributes**:
- `name`: `maxlength="64"`, `autocomplete="off"`, pre-filled with current workspace name

**UX behavior**:
- Save button disabled when field value equals current tenant name (no change)
- Save button disabled when field is empty
- Save button enabled only when value differs from current AND passes validation

**Character counter**: Shown below field when > 50 chars. Format: `"52/64"`. Color turns `#EF4444` when at max.

**Server error mapping** (toast):

| HTTP Status | Toast Message |
|-------------|---------------|
| 403 Forbidden | `"Only workspace owners and admins can update workspace settings."` |
| 500 / network | `"Failed to save workspace name. Please try again."` |

**On success**: Toast: `"Workspace name updated."`

---

### 3.2 Discord Connection Form

**Zod schema name**: `DiscordConnectionSchema`

**Form fields**:

| Field | Name | Type | Required | Constraints | Error Messages |
|-------|------|------|----------|-------------|----------------|
| Bot Token | `bot_token` | `password` input (masked) | Yes | Regex: `/^[A-Za-z0-9_\-]{23,28}\.[A-Za-z0-9_\-]{6}\.[A-Za-z0-9_\-]{27,38}$/`; Min 50 chars | Empty: `"Bot token is required."` / Too short (< 50 chars): `"This doesn't look like a valid Discord bot token."` / Pattern mismatch: `"Invalid bot token format. Discord tokens follow the pattern: Base64ID.Timestamp.HMAC."` |
| Guild (Server) ID | `guild_id` | `text` | Yes | Numeric only; Length 17–20 digits | Empty: `"Server ID is required."` / Non-numeric: `"Server ID must be a number."` / Wrong length: `"Invalid server ID. Guild IDs are 17–20 digit numbers."` |

**HTML attributes**:
- `bot_token`: `autocomplete="off"`, `spellcheck="false"`, `inputmode="text"`, `placeholder="Paste your bot token here"`
- `guild_id`: `autocomplete="off"`, `inputmode="numeric"`, `pattern="[0-9]{17,20}"`, `placeholder="e.g., 1234567890123456789"`

**Client-side Zod schema**:
```typescript
z.object({
  bot_token: z.string()
    .min(1, "Bot token is required.")
    .min(50, "This doesn't look like a valid Discord bot token.")
    .regex(
      /^[A-Za-z0-9_\-]{23,28}\.[A-Za-z0-9_\-]{6}\.[A-Za-z0-9_\-]{27,38}$/,
      "Invalid bot token format. Discord tokens follow the pattern: Base64ID.Timestamp.HMAC."
    ),
  guild_id: z.string()
    .min(1, "Server ID is required.")
    .regex(/^\d+$/, "Server ID must be a number.")
    .refine(
      id => id.length >= 17 && id.length <= 20,
      "Invalid server ID. Guild IDs are 17–20 digit numbers."
    ),
})
```

**Server-side validation** (POST `/api/discord/validate-token`):
- Calls Discord API: `GET https://discord.com/api/v10/users/@me` with `Authorization: Bot <token>`
- 401: Token invalid
- 200: Token valid, bot user object returned (display bot username in form confirmation)

**Server error mapping** (inline below relevant field):

| Error | Field | Error Message |
|-------|-------|---------------|
| Discord rejects token (401) | `bot_token` | `"Discord rejected this token. Double-check it in the Developer Portal."` |
| Token already in use by another tenant | `bot_token` | `"This bot token is already in use. Each bot can only be connected to one workspace."` |
| Guild already connected (same tenant, different connection row) | `guild_id` | `"This server is already connected. Remove the existing connection first."` |
| Network / 5xx | form-level | `"Failed to add connection. Please try again."` |

**On success**: Connection added. Bot username displayed in connection card. Toast: `"Discord bot connected."`

**Submit button states**:
- Default: `"Connect bot"` (add) or `"Reconnect"` (updating)
- Loading: `"Connecting…"` with spinner, disabled
- Error: returns to default, enabled

---

### 3.3 Account — Display Name Form

**Zod schema name**: `DisplayNameSchema`

| Field | Name | Type | Required | Constraints | Error Messages |
|-------|------|------|----------|-------------|----------------|
| Display name | `full_name` | `text` | Yes | Max 100 chars | Empty: `"Display name is required."` / > 100: `"Display name must be 100 characters or less."` |

**HTML attributes**:
- `full_name`: `autocomplete="name"`, `maxlength="100"`, pre-filled with current display name

**Server error mapping** (toast):

| Error | Toast |
|-------|-------|
| 500 / network | `"Failed to update display name. Please try again."` |

**On success**: Toast: `"Display name updated."`

---

### 3.4 Account — Change Password Form

**Zod schema name**: `ChangePasswordSchema`

| Field | Name | Type | Required | Constraints | Error Messages |
|-------|------|------|----------|-------------|----------------|
| Current password | `current_password` | `password` | Yes | — | Empty: `"Current password is required."` / Server: wrong: `"Current password is incorrect."` (shown inline) |
| New password | `new_password` | `password` | Yes | Min 8 chars | Empty: `"New password is required."` / < 8: `"Password must be at least 8 characters."` / Same as current (server): `"New password must be different from your current password."` (shown inline) |
| Confirm password | `confirm_password` | `password` | Yes | Must match `new_password` | Empty: `"Please confirm your new password."` / Mismatch: `"Passwords do not match."` |

**HTML attributes**:
- `current_password`: `autocomplete="current-password"`
- `new_password`: `autocomplete="new-password"`, `minlength="8"`
- `confirm_password`: `autocomplete="new-password"`

**Server error mapping**:

| Error | Where Shown | Message |
|-------|-------------|---------|
| Wrong current password | Inline on `current_password` field | `"Current password is incorrect."` |
| New password same as old | Inline on `new_password` field | `"New password must be different from your current password."` |
| 500 / network | Toast (error) | `"Failed to update password. Please try again."` |

**On success**: Toast: `"Password updated successfully."`

**Submit button states**:
- Default: `"Update password"`
- Loading: `"Updating…"` with spinner, disabled

---

### 3.5 Danger Zone — Delete Workspace Confirmation Dialog

**Zod schema name**: `DeleteWorkspaceConfirmSchema`

| Field | Name | Type | Required | Constraints | Error Messages |
|-------|------|------|----------|-------------|----------------|
| Workspace name confirmation | `confirmation` | `text` | Yes | Must exactly match current workspace name (case-sensitive) | Empty: `"Please type the workspace name to confirm."` / Mismatch: `"Workspace name doesn't match. Please type it exactly."` |

**HTML attributes**:
- `confirmation`: `autocomplete="off"`, `spellcheck="false"`, `autofocus`, `placeholder="Type workspace name to confirm"`

**Confirmation dialog context**:
- Dialog title: `"Delete Workspace"`
- Instruction text: `"This action cannot be undone. All data, connections, and settings will be permanently deleted. Type {workspaceName} to confirm."`
- `{workspaceName}` displayed in inline code style within instruction text

**Server error mapping** (form-level in dialog):

| Error | Message |
|-------|---------|
| 403 — Not owner | `"Only the workspace owner can delete the workspace."` |
| 409 — Active subscription | `"Please cancel your subscription before deleting the workspace."` |
| 500 / network | `"Failed to delete workspace. Please try again or contact support@daimon.ai."` |

**Submit button**:
- Label: `"Delete workspace permanently"`
- Color: `#DC2626` (destructive red)
- Disabled until `confirmation` field exactly matches workspace name
- Loading: `"Deleting…"` with spinner, disabled

---

## 4. Integrations Page

### 4.1 Toggl API Key Modal

**Zod schema name**: `TogglApiKeySchema`

| Field | Name | Type | Required | Constraints | Error Messages |
|-------|------|------|----------|-------------|----------------|
| Toggl API Key | `api_key` | `password` (show/hide toggle) | Yes | Min 10 chars; No whitespace | Empty: `"API key is required."` / < 10 chars: `"This doesn't look like a valid Toggl API key."` / Whitespace: `"API key should not contain spaces or newlines."` |

**HTML attributes**:
- `api_key`: `autocomplete="off"`, `spellcheck="false"`, `autofocus`, `placeholder="Enter your Toggl API key"`

**Where to find the Toggl API key**: Helper text below input: `"Find your API token at toggl.com/app/profile (bottom of the page)."` — this is static help text, not a validation error.

**Client-side Zod schema**:
```typescript
z.string()
  .min(1, "API key is required.")
  .min(10, "This doesn't look like a valid Toggl API key.")
  .refine(k => !/\s/.test(k), "API key should not contain spaces or newlines.")
```

**Server-side validation** (POST `/api/validate/toggl-key`):
- Calls Toggl API: `GET https://api.track.toggl.com/api/v9/me` with `Authorization: Basic base64(key:api_token)`
- 403: Invalid key
- 200: Valid key, user object returned

**Server error mapping** (inline below input):

| Toggl Response | Error Message |
|----------------|---------------|
| 403 Forbidden | `"Invalid API key. Please check and try again."` |
| 5xx Server Error | `"Toggl returned an error. Please wait a moment and try again."` |
| Network error | `"Unable to reach Toggl. Please check your connection."` |

**On success**: Modal closes. Toast: `"Toggl connected."` (if new) or `"Toggl API key updated."` (if replacing).

**Submit button states**:
- Default: `"Connect Toggl"` (new) or `"Update key"` (replacing)
- Loading: `"Validating…"` with spinner, disabled

---

### 4.2 OAuth Service Flows (GitHub, Google, Linear)

OAuth flows do not involve form validation — they are pure redirect flows. However, callback error states
must be handled and displayed to the user.

**GitHub OAuth callback error handling** (displayed as alert banner on `/dashboard/integrations` after redirect-back):

| Error Param | User-Facing Message |
|-------------|---------------------|
| `error=access_denied` | `"GitHub connection was cancelled."` |
| `error=redirect_uri_mismatch` | `"GitHub connection failed due to a configuration error. Please contact support."` |
| Any other error | `"Failed to connect GitHub. Please try again."` |

**Google OAuth callback error handling**:

| Error Param | User-Facing Message |
|-------------|---------------------|
| `error=access_denied` | `"Google connection was cancelled."` |
| `error=redirect_uri_mismatch` | `"Google connection failed due to a configuration error. Please contact support."` |
| `error=invalid_scope` | `"The required Google permissions were not granted. Please try again and approve all requested permissions."` |
| Any other error | `"Failed to connect Google. Please try again."` |

**Linear OAuth callback error handling**:

| Error Param | User-Facing Message |
|-------------|---------------------|
| `error=access_denied` | `"Linear connection was cancelled."` |
| Any other error | `"Failed to connect Linear. Please try again."` |

**Note**: These error messages appear as `AlertBanner` component (variant: `"warning"`) at the top of the
integrations page content area (below page header), not as toasts. They have an `×` dismiss button.

---

## 5. Admin Panel

### 5.1 Impersonation Confirmation Dialog

**Zod schema name**: N/A (no text input required — just a confirmation button click)

| Element | Behavior |
|---------|----------|
| Confirm button | `"Impersonate [tenant name]"` — destructive red |
| Cancel button | `"Cancel"` — secondary |
| On confirm: error | Toast: `"Failed to impersonate tenant. Please try again."` |
| On confirm: success | Redirect to `/dashboard` with banner: `"You are viewing as [tenant name]. [Exit impersonation]"` |

---

## 6. General Patterns and Cross-Cutting Rules

### 6.1 Required Field Indicator

All required fields display an asterisk (`*`) after the label. Screen reader text: `" (required)"` via
`aria-required="true"` on the input.

### 6.2 Email Format Validation

**Pattern used across all forms**:
```typescript
z.string().email("Please enter a valid email address.")
```
- Uses Zod's built-in email validation (RFC 5322 subset)
- Max length enforced separately: `.max(254, "Email address is too long.")`

### 6.3 Password Complexity Rules (Create / Reset)

Applied on signup and reset-password-confirm forms:

```typescript
const passwordSchema = z.string()
  .min(1, "Password is required.")
  .min(8, "Password must be at least 8 characters.")
  .max(72, "Password cannot exceed 72 characters.")
  .refine(p => /[A-Z]/.test(p), "Password must contain at least one uppercase letter.")
  .refine(p => /[a-z]/.test(p), "Password must contain at least one lowercase letter.")
  .refine(p => /[0-9]/.test(p), "Password must contain at least one number.")
```

**Validation order** (errors shown one at a time, in priority order):
1. Required / empty
2. Min length (8)
3. Max length (72)
4. Uppercase letter
5. Lowercase letter
6. Number

### 6.4 Password Visibility Toggle

All `password` type inputs have a show/hide toggle button at the trailing edge of the input.
- Toggle button: `IconButton` with eye icon (`EyeIcon`) / eye-slash icon (`EyeSlashIcon`)
- `aria-label`: `"Show password"` / `"Hide password"` (toggles with state)
- When visible: input `type="text"`, icon = EyeSlashIcon
- When hidden: input `type="password"`, icon = EyeIcon
- Toggle does NOT reset validation state

### 6.5 Form Submission During Loading

When a form is submitted and the loading state is active:
- All input fields: `disabled` attribute set
- Submit button: shows spinner + loading label, `disabled`
- Cancel/secondary buttons (in modals): `disabled`
- Pressing Enter on a field does NOT re-submit while loading

### 6.6 Error Message Persistence

- Inline field errors: Persist until the field is corrected. Cleared as soon as the corrected value passes validation (onChange, after first touch).
- Toast errors: Auto-dismiss after 6 seconds. Have an `×` dismiss button.
- Form-level error banners (auth pages): Persist until the user modifies any field.

### 6.7 Accessible Error Association

Every error message is linked to its input via `aria-describedby`:
```html
<input id="email" aria-describedby="email-error" aria-invalid="true" />
<p id="email-error" role="alert">Please enter a valid email address.</p>
```
The `role="alert"` on the error paragraph triggers screen reader announcement on appearance.

### 6.8 Zod Schema Composition Pattern

Shared sub-schemas (defined in `lib/validation/schemas.ts`):
```typescript
export const emailSchema = z.string()
  .min(1, "Email is required.")
  .email("Please enter a valid email address.")
  .max(254, "Email address is too long.");

export const newPasswordSchema = z.string()
  .min(1, "Password is required.")
  .min(8, "Password must be at least 8 characters.")
  .max(72, "Password cannot exceed 72 characters.")
  .refine(p => /[A-Z]/.test(p), "Password must contain at least one uppercase letter.")
  .refine(p => /[a-z]/.test(p), "Password must contain at least one lowercase letter.")
  .refine(p => /[0-9]/.test(p), "Password must contain at least one number.");

export const apiKeyBaseSchema = (name: string) => z.string()
  .min(1, "API key is required.")
  .min(20, "This key is too short to be valid.")
  .refine(k => !/\s/.test(k), "API key should not contain spaces or newlines.");
```

These are composed in page-specific schemas:
```typescript
// LoginSchema
export const LoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required."),
});

// SignupSchema
export const SignupSchema = z.object({
  fullName: z.string().min(1, "Full name is required.").min(2, "Please enter your full name.").max(100, "Full name must be 100 characters or less."),
  workspaceName: z.string().min(1, "Workspace name is required.").min(2, "Workspace name must be at least 2 characters.").max(64, "Workspace name must be 64 characters or less."),
  email: emailSchema,
  password: newPasswordSchema,
  confirmPassword: z.string().min(1, "Please confirm your password."),
  agreeTerms: z.literal(true, { errorMap: () => ({ message: "You must agree to the Terms of Service and Privacy Policy to create an account." }) }),
}).refine(d => d.password === d.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});
```

### 6.9 Server Error Code → Client Message Mapping

All API routes return errors in this shape:
```typescript
{ error: string; code: string; field?: string }
```

The `code` field maps to a user-facing message. The `field` field (if present) tells the client which form field to attach the error to. Example:
```json
{ "error": "Discord token already in use", "code": "DISCORD_TOKEN_CONFLICT", "field": "bot_token" }
```

Client-side handler in `lib/api/errors.ts`:
```typescript
const SERVER_ERROR_MESSAGES: Record<string, string> = {
  DISCORD_TOKEN_CONFLICT: "This bot token is already in use. Each bot can only be connected to one workspace.",
  DISCORD_TOKEN_INVALID: "Discord rejected this token. Double-check it in the Developer Portal.",
  DISCORD_GUILD_CONFLICT: "This server is already connected. Remove the existing connection first.",
  ANTHROPIC_KEY_INVALID: "This key was rejected by Anthropic. Double-check it and try again.",
  ANTHROPIC_KEY_RATE_LIMITED: "Anthropic rate-limited the validation request. Please wait a moment and try again.",
  OPENAI_KEY_INVALID: "This key was rejected by OpenAI. Please verify it in the OpenAI Platform dashboard.",
  TOGGL_KEY_INVALID: "Invalid API key. Please check and try again.",
  WORKSPACE_NAME_TOO_LONG: "Workspace name must be 64 characters or less.",
  PASSWORD_SAME_AS_CURRENT: "New password must be different from your current password.",
  PASSWORD_INCORRECT: "Current password is incorrect.",
  WORKSPACE_DELETE_SUBSCRIPTION_ACTIVE: "Please cancel your subscription before deleting the workspace.",
  WORKSPACE_DELETE_NOT_OWNER: "Only the workspace owner can delete the workspace.",
  RATE_LIMITED: "Too many attempts. Please wait 15 minutes and try again.",
  UNAUTHORIZED: "Your session has expired. Please sign in again.",
};
```

---

## 7. Validation Error Display Components

### 7.1 Inline Field Error (`FieldError`)

**Component**: `components/ui/FieldError.tsx`

```typescript
interface FieldErrorProps {
  message?: string;  // If undefined, renders nothing
  id: string;        // Should match input's aria-describedby
}
```

**Rendered output**:
```html
<p id="{id}" role="alert" class="field-error">
  {message}
</p>
```

**Styling**:
- Font: 12px Inter Medium
- Color: `#EF4444`
- Margin: `mt-1` (4px above, from input)
- Display: only when `message` is defined

### 7.2 Form-Level Error Banner (`FormErrorBanner`)

**Component**: `components/ui/FormErrorBanner.tsx`

Used for auth page server errors that are not field-specific.

```typescript
interface FormErrorBannerProps {
  message?: string;  // If undefined, not rendered
}
```

**Rendered output**:
```html
<div role="alert" class="form-error-banner">
  <ExclamationCircleIcon class="w-4 h-4 flex-shrink-0" aria-hidden="true" />
  <span>{message}</span>
</div>
```

**Styling**:
- Background: `#FEF2F2` (red-50)
- Border: `1px solid #FECACA` (red-200)
- Border radius: `8px`
- Padding: `12px 16px`
- Display: `flex`, `gap-2`, `items-start`
- Icon color: `#EF4444`
- Text: 14px Inter Regular, `#991B1B` (red-800)
- Margin: `mb-4` (16px below banner, before submit button area)

### 7.3 Character Counter

**Component**: `components/ui/CharacterCounter.tsx`

Used on workspace name inputs.

```typescript
interface CharacterCounterProps {
  current: number;
  max: number;
}
```

**Rendered output**:
```html
<span class="char-counter {current > max ? 'char-counter--over' : ''}" aria-live="polite">
  {current}/{max}
</span>
```

**Styling**:
- Font: 12px Inter Regular
- Color normal: `#6B7280` (gray-500)
- Color at limit (current === max): `#EF4444`
- Color over limit: `#EF4444`, font-weight: Medium
- Display: `flex justify-end`, right-aligned below input
- Appears only when `current > max * 0.75` (i.e., when 75% of max is used)

---

## 8. Discrepancy Notes

The following discrepancies were found between spec files. The resolution is noted:

| Field | auth-pages.md value | copy.md value | **Resolved value** | Rationale |
|-------|--------------------|--------------------|------|-----------|
| Workspace name max length | 100 chars | 64 chars | **64 chars** | copy.md is the most recently compiled canonical source; 64 is more practical for UI display |
| Full name min error message | "Name must be at least 2 characters." | "Please enter your full name." | **"Please enter your full name."** | copy.md phrasing is more natural |
| Full name > max error message | "Name must be 100 characters or fewer." | "Full name must be 100 characters or less." | **"Full name must be 100 characters or less."** | copy.md phrasing is standard |

Forward loop: use the **Resolved value** column for implementation.
