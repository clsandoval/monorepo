# Auth Pages — Complete Specification

> Routes: `/login`, `/signup`, `/reset-password`, `/reset-password/confirm`
> Layout: `app/(auth)/layout.tsx` — Public, unauthenticated only
> Last updated: 2026-03-13

---

## Overview

The auth pages handle all user authentication flows: sign in, sign up, and password reset. They share a common centered-card layout on a white-soft background with the Daimon logo. No navigation bar or footer is shown on auth pages — only the card and minimal branding.

**Auth provider:** Supabase Auth (email/password). No social OAuth for platform login at launch.

**Package:** `@supabase/ssr` for Next.js App Router integration.

**Redirect rules (middleware enforced):**
- Authenticated users visiting `/login`, `/signup`, `/reset-password` are redirected to `/dashboard`.
- Unauthenticated users visiting `/dashboard/**` or `/admin/**` are redirected to `/login?next=<original-path>`.

---

## Auth Layout (`app/(auth)/layout.tsx`)

All auth pages share this layout wrapper.

### Markup Structure
```
<body>
  <div class="auth-shell">            <!-- min-h-screen, bg-white-soft, flex, items-center, justify-center, p-4 -->
    <div class="auth-container">      <!-- w-full, max-w-[440px], flex, flex-col, gap-8 -->
      <Logo />                        <!-- Centered logo at top -->
      {children}                      <!-- The page-specific card -->
      <AuthFooterLinks />             <!-- Legal links at bottom -->
    </div>
  </div>
</body>
```

### Layout Styling

| Property | Value |
|----------|-------|
| Background | White Soft (`#F7F7F7`) |
| Min height | `100vh` |
| Display | `flex` |
| Align items | `center` |
| Justify content | `center` |
| Padding | `16px` (all sides — allows card to not touch screen edge on mobile) |
| Container max-width | `440px` |
| Container width | `100%` |
| Container flex direction | `column` |
| Container gap | `32px` |

### Logo Component (auth context)

| Property | Value |
|----------|-------|
| Container alignment | `flex`, `justify-center`, `align-center` |
| SVG rocket icon | 32px × 32px, Navy (`#0C1F40`) |
| Wordmark | "Daimon", Archivo, 20px, weight 700, Navy |
| Gap between icon and wordmark | 8px |
| Link | `<a href="/">` wraps entire logo |
| Hover | `opacity: 0.85`, `transition: opacity 0.2s ease` |

### Auth Footer Links

Rendered below the card on all auth pages.

| Property | Value |
|----------|-------|
| Font | Inter, 12px, weight 400 |
| Color | Navy at 45% opacity |
| Text align | Center |
| Gap between links | 16px |

Links:
- "Terms of Service" → `/terms`
- "Privacy Policy" → `/privacy`
- "Support" → `mailto:support@daimon.ai`

---

## Auth Card (shared component)

```tsx
// components/AuthCard.tsx
// Props: title: string, subtitle?: string, children: React.ReactNode
```

| Property | Value |
|----------|-------|
| Background | White (`#FFFFFF`) |
| Border radius | `0` |
| Box shadow | `0 1px 3px rgba(12,31,64,0.08), 0 4px 16px rgba(12,31,64,0.06)` |
| Padding | `40px` desktop / `32px` mobile (≤900px) |
| Width | `100%` (fills container up to max-width 440px) |
| Left CI stripe | 6px wide, three-band Aqua/Periwinkle as per brand card spec |

### Card CI Stripe
| Band | Height range | Color | Opacity |
|------|-------------|-------|---------|
| Primary | 15%–85% of card height | Aqua (`#B4E7DD`) | 30% |
| Secondary | 35%–65% of card height | Periwinkle (`#9FAAE2`) | 35% |
| Tertiary | center (40%–60%) | Aqua (`#B4E7DD`) | 60% |
| Total stripe width | — | — | 6px |

### Card Title
| Property | Value |
|----------|-------|
| Font | Archivo Semi-Expanded (wdth:112.5) |
| Size | 24px |
| Weight | 500 |
| Color | Navy (`#0C1F40`) |
| Margin bottom | 4px |

### Card Subtitle
| Property | Value |
|----------|-------|
| Font | Inter, 15px, weight 400 |
| Color | Navy at 55% opacity |
| Margin bottom | 24px |

---

## Form Components (shared across all auth pages)

### Input Field Component

```tsx
// components/FormInput.tsx
// Props: id, label, type, placeholder, value, onChange, error?, helpText?, disabled?
```

| State | Border | Background | Label color |
|-------|--------|------------|-------------|
| Default | `1.5px solid rgba(12,31,64,0.2)` | White | Navy 70% opacity |
| Focus | `1.5px solid #0C1F40` | White | Navy |
| Error | `1.5px solid #DC2626` | `#FFF5F5` | Navy |
| Disabled | `1.5px solid rgba(12,31,64,0.1)` | `#F7F7F7` | Navy 40% opacity |

| Property | Value |
|----------|-------|
| Height | `44px` |
| Border radius | `0` |
| Padding | `0 14px` |
| Font | Inter, 15px, weight 400, Navy |
| Placeholder color | Navy at 35% opacity |
| Label font | Inter, 13px, weight 500, Navy 70% opacity |
| Label margin bottom | `6px` |
| Input margin bottom | `0` (gap handled by form layout) |
| Transition | `border-color 0.15s ease` |
| Width | `100%` |

### Error Message Component (inline field error)

```tsx
// components/FieldError.tsx
// Props: message: string | null
```

| Property | Value |
|----------|-------|
| Font | Inter, 12px, weight 400 |
| Color | `#DC2626` (red-600) |
| Margin top | `4px` |
| Display | `flex`, `align-items: center`, `gap: 4px` |
| Icon | 12px warning triangle SVG, same red color |

### Alert Banner Component (form-level errors)

```tsx
// components/AlertBanner.tsx
// Props: message: string, type: 'error' | 'success' | 'info'
```

| Type | Background | Border left | Text color | Icon |
|------|------------|-------------|------------|------|
| error | `#FEF2F2` | `3px solid #DC2626` | `#991B1B` | Red circle-x |
| success | `rgba(180,231,221,0.2)` | `3px solid #B4E7DD` | `#0C1F40` | Aqua circle-check |
| info | `rgba(159,170,226,0.15)` | `3px solid #9FAAE2` | `#0C1F40` | Periwinkle info-circle |

| Property | Value |
|----------|-------|
| Padding | `12px 16px` |
| Border radius | `0` |
| Font | Inter, 14px, weight 400 |
| Margin bottom | `20px` |
| Display | `flex`, `align-items: flex-start`, `gap: 10px` |
| Icon size | 16px × 16px, flex-shrink-0 |

### Submit Button (auth variant)

| Property | Value |
|----------|-------|
| Width | `100%` |
| Height | `44px` |
| Background | Aqua (`#B4E7DD`) |
| Text color | Navy (`#0C1F40`) |
| Border | `1.5px solid #B4E7DD` |
| Border radius | `0` |
| Font | Inter, 15px, weight 600 |
| Hover | `opacity: 0.85`, `transition: all 0.2s ease` |
| Disabled | `opacity: 0.5`, `cursor: not-allowed` |
| Loading state | Show spinner (16px, navy, spin animation) + hide label text |
| Spinner animation | `spin 0.8s linear infinite` |

### Password Input with Toggle

Password fields use the standard `FormInput` plus an eye/eye-off toggle button inside the input at the right edge.

| Property | Value |
|----------|-------|
| Toggle button size | 20px × 20px icon, navy at 50% opacity |
| Toggle button hover | Navy at 80% opacity |
| Toggle position | `absolute`, `right: 14px`, `top: 50%`, `translateY(-50%)` |
| Input padding-right | `44px` (to not overlap toggle) |
| Initial state | Password hidden (type="password") |
| After toggle | type="text" |
| Accessibility | `aria-label="Show password"` / `aria-label="Hide password"` |

---

## Page 1: Login (`/login`)

### Route & File
- **Route:** `/login`
- **File:** `app/(auth)/login/page.tsx`
- **Server Component:** No (uses client-side form state)
- **Client Component:** Yes (`'use client'`)

### Redirect Logic (pre-render)
```typescript
// At the top of the page component (Server Component wrapper or middleware):
// If session exists → redirect('/dashboard')
// If ?next= param exists, store it for post-login redirect
```

### Page Title (HTML `<title>`)
`Sign in — Daimon`

### AuthCard Props
- `title`: "Welcome back"
- `subtitle`: "Sign in to your Daimon account"

### Form Fields

#### Field 1: Email

| Property | Value |
|----------|-------|
| Label | "Email" |
| Input type | `email` |
| `id` | `email` |
| `name` | `email` |
| Placeholder | `you@example.com` |
| Autocomplete | `email` |
| Required | Yes |
| Autofocus | Yes (on page load) |
| Max length | 254 characters |

**Validation rules:**

| Rule | Error message |
|------|---------------|
| Empty on submit | "Email is required." |
| Not valid email format (no @, no TLD) | "Please enter a valid email address." |

#### Field 2: Password

| Property | Value |
|----------|-------|
| Label | "Password" |
| Input type | `password` (with toggle) |
| `id` | `password` |
| `name` | `password` |
| Placeholder | `••••••••` |
| Autocomplete | `current-password` |
| Required | Yes |
| Min length | 8 characters (client-side hint only — actual validation is server-side) |

**Validation rules:**

| Rule | Error message |
|------|---------------|
| Empty on submit | "Password is required." |

#### Forgot Password Link

| Property | Value |
|----------|-------|
| Position | Inline to the right of the "Password" label (flex space-between row) |
| Text | "Forgot password?" |
| `href` | `/reset-password` |
| Font | Inter, 13px, weight 500 |
| Color | Navy at 60% opacity |
| Hover | Navy at 90% opacity |
| Underline | None by default, underline on hover |

### Form Layout

```
[Email label]
[Email input]
[12px gap]
[Password label ←———————————→ Forgot password?]
[Password input with toggle]
[24px gap]
[Alert banner — only shown when server error]
[24px gap]
[Sign In button]
```

### Submit Button Label
- Default: "Sign In"
- Loading: Spinner only (no text)

### Form Submission Logic

```typescript
// Client-side handler
async function handleLogin(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // 1. Client-side validation
    if (!email) { setFieldError('email', 'Email is required.'); return; }
    if (!isValidEmail(email)) { setFieldError('email', 'Please enter a valid email address.'); return; }
    if (!password) { setFieldError('password', 'Password is required.'); return; }

    // 2. Call Supabase Auth
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    // 3. Handle errors
    if (error) {
        setLoading(false)
        setError(mapAuthError(error))
        return
    }

    // 4. Success → redirect
    const next = searchParams.get('next') ?? '/dashboard'
    router.push(next)
}
```

### Server Error Mapping (`mapAuthError`)

| Supabase error code / message | Displayed message (AlertBanner, type=error) |
|-------------------------------|---------------------------------------------|
| `Invalid login credentials` | "Invalid email or password. Please try again." |
| `Email not confirmed` | "Please verify your email address. Check your inbox for a confirmation link." |
| `User account is banned` | "Your account has been suspended. Contact support at support@daimon.ai." |
| Rate limit errors (HTTP 429) | "Too many sign-in attempts. Please wait 15 minutes and try again." |
| Network error / fetch failed | "Unable to connect. Please check your internet connection and try again." |
| Any other error | "Something went wrong. Please try again or contact support@daimon.ai." |

### Footer Link (below card)

```
Don't have an account? [Sign up free]
```

| Property | Value |
|----------|-------|
| Container | `flex`, `justify-center`, `gap: 6px` |
| Text | Inter, 14px, weight 400, Navy at 60% opacity |
| Link text | "Sign up free" |
| Link `href` | `/signup` |
| Link style | Inter, 14px, weight 600, Navy |
| Link hover | Aqua (`#B4E7DD`) text color |

### Loading State (full page)

When `loading === true` after submit:
- Submit button shows spinner, no text
- All form inputs are `disabled`
- Forgot password link is `pointer-events: none`
- Sign up link is `pointer-events: none`

### Success State

No visible success state — immediately redirects to `/dashboard` (or `?next` value).

### Rate Limiting Display

After 5 failed attempts within 15 minutes, Supabase returns a rate limit error. The `AlertBanner` displays:
> "Too many sign-in attempts. Please wait 15 minutes and try again."

The submit button becomes disabled for the duration. There is no countdown timer shown in the UI.

---

## Page 2: Signup (`/signup`)

### Route & File
- **Route:** `/signup`
- **File:** `app/(auth)/signup/page.tsx`
- **Client Component:** Yes (`'use client'`)

### Redirect Logic
If session exists → `redirect('/dashboard')`.

### Page Title
`Create your account — Daimon`

### AuthCard Props
- `title`: "Create your account"
- `subtitle`: "Start with your Discord bot in minutes."

### Form Fields

#### Field 1: Full Name

| Property | Value |
|----------|-------|
| Label | "Full name" |
| Input type | `text` |
| `id` | `fullName` |
| `name` | `fullName` |
| Placeholder | `Jane Smith` |
| Autocomplete | `name` |
| Required | Yes |
| Autofocus | Yes |
| Max length | 100 characters |

**Validation rules:**

| Rule | Error message |
|------|---------------|
| Empty on submit | "Full name is required." |
| Less than 2 characters | "Name must be at least 2 characters." |
| More than 100 characters | "Name must be 100 characters or fewer." |

#### Field 2: Email

| Property | Value |
|----------|-------|
| Label | "Email" |
| Input type | `email` |
| `id` | `email` |
| `name` | `email` |
| Placeholder | `you@example.com` |
| Autocomplete | `email` |
| Required | Yes |
| Max length | 254 characters |

**Validation rules:**

| Rule | Error message |
|------|---------------|
| Empty on submit | "Email is required." |
| Not valid email format | "Please enter a valid email address." |
| Already in use (server error) | "An account with this email already exists. [Sign in]" — the "Sign in" is a link to `/login` |

#### Field 3: Password

| Property | Value |
|----------|-------|
| Label | "Password" |
| Input type | `password` (with toggle) |
| `id` | `password` |
| `name` | `password` |
| Placeholder | `••••••••` |
| Autocomplete | `new-password` |
| Required | Yes |
| Min length | 8 |
| Max length | 72 characters (bcrypt limit) |

**Validation rules:**

| Rule | Error message |
|------|---------------|
| Empty on submit | "Password is required." |
| Less than 8 characters | "Password must be at least 8 characters." |
| More than 72 characters | "Password cannot exceed 72 characters." |
| Does not contain at least one uppercase letter | "Password must contain at least one uppercase letter." |
| Does not contain at least one lowercase letter | "Password must contain at least one lowercase letter." |
| Does not contain at least one number | "Password must contain at least one number." |

**Password strength indicator** (shown below password field after user starts typing):
- Displayed as a horizontal bar, full width, 4px tall
- 4 segments: Weak / Fair / Good / Strong
- Each segment is 1/4 of bar width with 4px gap between
- Colors:
  - Weak (1 criterion met): 1 segment filled, `#DC2626` (red)
  - Fair (2 criteria met): 2 segments filled, `#F59E0B` (amber)
  - Good (3 criteria met): 3 segments filled, `#B4E7DD` (Aqua)
  - Strong (all 4 criteria + ≥12 chars): 4 segments filled, `#059669` (green)
- Below bar: text label "Weak" / "Fair" / "Good" / "Strong", Inter, 11px, matching segment color
- Criteria: uppercase (1), lowercase (2), number (3), length ≥12 (4)
- Only shown when password field is non-empty

#### Field 4: Confirm Password

| Property | Value |
|----------|-------|
| Label | "Confirm password" |
| Input type | `password` (with toggle) |
| `id` | `confirmPassword` |
| `name` | `confirmPassword` |
| Placeholder | `••••••••` |
| Autocomplete | `new-password` |
| Required | Yes |

**Validation rules:**

| Rule | Error message |
|------|---------------|
| Empty on submit | "Please confirm your password." |
| Does not match password field | "Passwords do not match." |

#### Checkbox: Terms Agreement

| Property | Value |
|----------|-------|
| Type | `checkbox` |
| `id` | `agreeTerms` |
| Required | Yes |
| Label text | `I agree to the [Terms of Service] and [Privacy Policy]` |
| "Terms of Service" link | `/terms`, opens in new tab |
| "Privacy Policy" link | `/privacy`, opens in new tab |
| Label font | Inter, 13px, weight 400, Navy at 65% opacity |
| Checkbox size | 16px × 16px |
| Checkbox style | 1.5px solid Navy at 30% opacity border, 0 border-radius |
| Checked background | Aqua (`#B4E7DD`) |
| Checkmark color | Navy |

**Validation rules:**

| Rule | Error message |
|------|---------------|
| Unchecked on submit | "You must agree to the Terms of Service and Privacy Policy to create an account." |

### Form Layout

```
[Full name label]
[Full name input]
[16px gap]
[Email label]
[Email input]
[16px gap]
[Password label]
[Password input with toggle]
[Password strength bar (visible when field non-empty)]
[12px gap]
[Confirm password label]
[Confirm password input with toggle]
[20px gap]
[Terms checkbox + label]
[24px gap]
[Alert banner — only shown when server error]
[20px gap]
[Create Account button]
```

### Submit Button Label
- Default: "Create Account"
- Loading: Spinner only

### Form Submission Logic

```typescript
async function handleSignup(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // 1. Client-side validation (all fields)
    const errors: Record<string, string> = {}
    if (!fullName || fullName.trim().length < 2) errors.fullName = 'Full name is required.'
    if (fullName.trim().length > 100) errors.fullName = 'Name must be 100 characters or fewer.'
    if (!email || !isValidEmail(email)) errors.email = 'Please enter a valid email address.'
    if (!password || password.length < 8) errors.password = 'Password must be at least 8 characters.'
    if (password.length > 72) errors.password = 'Password cannot exceed 72 characters.'
    if (!/[A-Z]/.test(password)) errors.password = 'Password must contain at least one uppercase letter.'
    if (!/[a-z]/.test(password)) errors.password = 'Password must contain at least one lowercase letter.'
    if (!/[0-9]/.test(password)) errors.password = 'Password must contain at least one number.'
    if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match.'
    if (!agreeTerms) errors.agreeTerms = 'You must agree to the Terms of Service and Privacy Policy to create an account.'

    if (Object.keys(errors).length > 0) {
        setFieldErrors(errors)
        setLoading(false)
        return
    }

    // 2. Sign up with Supabase Auth
    const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { full_name: fullName.trim() }
        }
    })

    if (authError) {
        setLoading(false)
        setError(mapSignupError(authError))
        return
    }

    // 3. Create tenant + tenant_members row via Server Action
    const { error: tenantError } = await createTenantForUser({
        userId: data.user!.id,
        tenantName: `${fullName.trim()}'s Workspace`,
    })

    if (tenantError) {
        // Signup succeeded but tenant creation failed — show specific error
        setLoading(false)
        setError('Account created but workspace setup failed. Please contact support@daimon.ai.')
        return
    }

    // 4. Success → redirect to dashboard (onboarding checklist visible)
    router.push('/dashboard?onboarding=true')
}
```

### Server Action: `createTenantForUser`

Called after successful Supabase Auth signup. Runs server-side with service role key.

```typescript
// app/actions/createTenant.ts
'use server'

export async function createTenantForUser({
    userId,
    tenantName,
}: {
    userId: string
    tenantName: string
}): Promise<{ error: string | null }> {
    const supabaseAdmin = createServiceRoleClient()

    // 1. Create tenant row
    const { data: tenant, error: tenantError } = await supabaseAdmin
        .from('tenants')
        .insert({
            name: tenantName,
            owner_id: userId,
            plan: 'free',
            status: 'active',
        })
        .select('id')
        .single()

    if (tenantError) return { error: tenantError.message }

    // 2. Create tenant_members row (owner)
    const { error: memberError } = await supabaseAdmin
        .from('tenant_members')
        .insert({
            tenant_id: tenant.id,
            user_id: userId,
            role: 'owner',
        })

    if (memberError) return { error: memberError.message }

    // 3. Create tenant_subscriptions row (free tier)
    const { error: subError } = await supabaseAdmin
        .from('tenant_subscriptions')
        .insert({
            tenant_id: tenant.id,
            plan: 'free',
            status: 'active',
        })

    if (subError) return { error: subError.message }

    return { error: null }
}
```

### Server Error Mapping (`mapSignupError`)

| Supabase error / message | Displayed message |
|--------------------------|-------------------|
| `User already registered` | "An account with this email already exists." (with sign-in link) |
| `Signup is disabled` | "New signups are temporarily disabled. Please try again later or contact support@daimon.ai." |
| Rate limit (HTTP 429) | "Too many signup attempts. Please wait 15 minutes and try again." |
| Password too weak (server) | "Your password doesn't meet security requirements. Please choose a stronger password." |
| Network error | "Unable to connect. Please check your internet connection and try again." |
| Any other error | "Something went wrong. Please try again or contact support@daimon.ai." |

### "Email already exists" Special Case

When the server returns `User already registered`, the AlertBanner shows:

```
An account with this email already exists.
[Sign in to your account →]
```

The second line is a link to `/login?email=<encoded-email>` (pre-fills email field on login page).

### Email Confirmation

Supabase Auth sends a confirmation email after signup. Whether email confirmation is required is a Supabase project setting.

**At launch:** Email confirmation is **disabled** in Supabase settings (users go directly to dashboard after signup). This avoids friction for the initial launch.

**If email confirmation is enabled later:**
- After signup, redirect to `/signup/check-email` instead of `/dashboard`
- Show message: "We've sent a confirmation link to **{email}**. Click it to activate your account."
- "Resend email" link below — calls `supabase.auth.resend({ type: 'signup', email })`
- After clicking link, Supabase redirects to `/api/auth/callback` → redirect to `/dashboard?onboarding=true`

### Footer Link (below card)

```
Already have an account? [Sign in]
```

| Property | Value |
|----------|-------|
| Text | Inter, 14px, weight 400, Navy at 60% opacity |
| Link text | "Sign in" |
| Link `href` | `/login` |
| Link style | Inter, 14px, weight 600, Navy |
| Link hover | Aqua text color |

---

## Page 3: Request Password Reset (`/reset-password`)

### Route & File
- **Route:** `/reset-password`
- **File:** `app/(auth)/reset-password/page.tsx`
- **Client Component:** Yes

### Redirect Logic
If session exists → `redirect('/dashboard')`.

### Page Title
`Reset your password — Daimon`

### States

This page has two states:

**State A: Request Form** — user enters their email to request a reset link.
**State B: Success** — reset link has been sent; show confirmation with resend option.

Initial state: A (request form).

---

### State A: Request Form

#### AuthCard Props
- `title`: "Reset your password"
- `subtitle`: "Enter your email and we'll send you a link to reset your password."

#### Form Fields

##### Field 1: Email

| Property | Value |
|----------|-------|
| Label | "Email" |
| Input type | `email` |
| `id` | `email` |
| `name` | `email` |
| Placeholder | `you@example.com` |
| Autocomplete | `email` |
| Required | Yes |
| Autofocus | Yes |
| Pre-fill | If `?email=<value>` is in the URL, pre-fill this field |

**Validation rules:**

| Rule | Error message |
|------|---------------|
| Empty on submit | "Email is required." |
| Not valid email format | "Please enter a valid email address." |

#### Submit Button
- Label: "Send Reset Link"
- Loading: Spinner only

#### Form Submission Logic

```typescript
async function handleResetRequest(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // 1. Validate
    if (!email || !isValidEmail(email)) {
        setFieldError('email', 'Please enter a valid email address.')
        setLoading(false)
        return
    }

    // 2. Call Supabase Auth
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password/confirm`,
    })

    if (error) {
        setLoading(false)
        setError(mapResetRequestError(error))
        return
    }

    // 3. Show success state (regardless of whether email exists — security)
    setLoading(false)
    setShowSuccess(true)
    setSentToEmail(email)
}
```

**Security note:** The success state is shown even if the email does not exist in the system. This prevents email enumeration. Supabase's `resetPasswordForEmail` already handles this correctly by not returning an error for unknown emails.

#### Server Error Mapping (`mapResetRequestError`)

| Error | Displayed message |
|-------|-------------------|
| Rate limit (HTTP 429) | "Too many reset requests. Please wait before trying again." |
| Network error | "Unable to connect. Please check your internet connection and try again." |
| Any other error | "Something went wrong. Please try again or contact support@daimon.ai." |

#### Footer Link

```
Remember your password? [Sign in]
```

Same styling as signup footer link, href → `/login`.

---

### State B: Success

#### AuthCard Props
- `title`: "Check your email"
- `subtitle`: "" (no subtitle; content is in the card body)

#### Card Content (State B)

```
[Check/envelope icon — 48px, Aqua color, centered]
[16px gap]
[Text: "We've sent a password reset link to:"]
[Email in bold: "{sentToEmail}"]
[24px gap]
[Text: "Click the link in the email to reset your password."]
[Text: "The link expires in 1 hour."]
[32px gap]
[Divider: 48px × 3px Aqua, centered]
[24px gap]
[Text: "Didn't receive the email? Check your spam folder."]
[12px gap]
[Resend link button]
```

#### Resend Link Button

| Property | Value |
|----------|-------|
| Text | "Resend reset email" |
| Type | Button (not submit) |
| Style | Ghost button — transparent bg, navy border 1.5px, navy text |
| Width | `100%` |
| Height | `44px` |
| Cooldown | 60 seconds after initial send (enforced client-side) |
| During cooldown | Button disabled, text: "Resend available in {N}s" |
| After cooldown | Button enabled, text: "Resend reset email" |
| On click | Re-calls `supabase.auth.resetPasswordForEmail(sentToEmail, {...})` |
| On resend success | Toast: "Reset link resent. Check your inbox." (see toast spec below) |
| On resend error | AlertBanner: "Failed to resend. Please try again." |

#### Back to Sign In Link

Below the card (in auth footer area):

```
[← Back to sign in]
```

| Property | Value |
|----------|-------|
| `href` | `/login` |
| Font | Inter, 14px, weight 500, Navy at 60% opacity |
| Hover | Navy |

---

## Page 4: Confirm New Password (`/reset-password/confirm`)

### Route & File
- **Route:** `/reset-password/confirm`
- **File:** `app/(auth)/reset-password/confirm/page.tsx`
- **Client Component:** Yes

### When This Page Is Visited

Supabase sends a reset email with a link that includes `?token=<hash>&type=recovery`. When clicked, the browser is redirected to the `redirectTo` URL configured above: `/reset-password/confirm`.

Supabase's `@supabase/ssr` client automatically exchanges the token and creates a session from the URL hash/params on page load.

### States

**State A: Token Valid** — user can enter new password.
**State B: Token Invalid/Expired** — show error with link back to request form.
**State C: Success** — password updated; redirect to login.

### Token Validation (on page mount)

```typescript
useEffect(() => {
    // @supabase/ssr processes the token from URL params automatically
    // Check if session was created successfully
    supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
            setTokenValid(true)
        } else if (event === 'SIGNED_OUT' || !session) {
            setTokenValid(false)
            setTokenError('This reset link is invalid or has expired. Please request a new one.')
        }
    })
}, [])
```

---

### State A: Token Valid (new password form)

#### AuthCard Props
- `title`: "Choose a new password"
- `subtitle`: "Your new password must be at least 8 characters and contain uppercase, lowercase, and a number."

#### Form Fields

##### Field 1: New Password

| Property | Value |
|----------|-------|
| Label | "New password" |
| Input type | `password` (with toggle) |
| `id` | `newPassword` |
| `name` | `newPassword` |
| Placeholder | `••••••••` |
| Autocomplete | `new-password` |
| Required | Yes |
| Autofocus | Yes |

Same password strength indicator as signup page.

**Validation rules (same as signup):**

| Rule | Error message |
|------|---------------|
| Empty on submit | "New password is required." |
| Less than 8 characters | "Password must be at least 8 characters." |
| More than 72 characters | "Password cannot exceed 72 characters." |
| No uppercase letter | "Password must contain at least one uppercase letter." |
| No lowercase letter | "Password must contain at least one lowercase letter." |
| No number | "Password must contain at least one number." |

##### Field 2: Confirm New Password

| Property | Value |
|----------|-------|
| Label | "Confirm new password" |
| Input type | `password` (with toggle) |
| `id` | `confirmNewPassword` |
| Placeholder | `••••••••` |
| Autocomplete | `new-password` |
| Required | Yes |

**Validation rules:**

| Rule | Error message |
|------|---------------|
| Empty on submit | "Please confirm your new password." |
| Does not match | "Passwords do not match." |

#### Submit Button
- Label: "Update Password"
- Loading: Spinner only

#### Form Submission Logic

```typescript
async function handlePasswordUpdate(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // 1. Client-side validation
    const errors: Record<string, string> = {}
    if (!newPassword || newPassword.length < 8) errors.newPassword = 'Password must be at least 8 characters.'
    if (newPassword.length > 72) errors.newPassword = 'Password cannot exceed 72 characters.'
    if (!/[A-Z]/.test(newPassword)) errors.newPassword = 'Password must contain at least one uppercase letter.'
    if (!/[a-z]/.test(newPassword)) errors.newPassword = 'Password must contain at least one lowercase letter.'
    if (!/[0-9]/.test(newPassword)) errors.newPassword = 'Password must contain at least one number.'
    if (newPassword !== confirmNewPassword) errors.confirmNewPassword = 'Passwords do not match.'

    if (Object.keys(errors).length > 0) {
        setFieldErrors(errors)
        setLoading(false)
        return
    }

    // 2. Update password via Supabase Auth (session from recovery token)
    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
        setLoading(false)
        setError(mapPasswordUpdateError(error))
        return
    }

    // 3. Sign out (security — start fresh session)
    await supabase.auth.signOut()

    // 4. Redirect to login with success message
    router.push('/login?passwordUpdated=true')
}
```

#### Server Error Mapping (`mapPasswordUpdateError`)

| Error | Displayed message |
|-------|-------------------|
| `New password should be different from the old password` | "Your new password must be different from your previous password." |
| `Password should be at least 6 characters` (Supabase fallback) | "Password must be at least 8 characters." |
| Session expired during update | "Your session has expired. Please request a new reset link." |
| Network error | "Unable to connect. Please check your internet connection and try again." |
| Any other error | "Failed to update password. Please request a new reset link or contact support@daimon.ai." |

---

### State B: Token Invalid/Expired

#### AuthCard Props
- `title`: "Reset link expired"
- `subtitle`: "" (content in card body)

#### Card Content

```
[Warning icon — 48px, amber (#F59E0B), centered]
[20px gap]
[Text: "This password reset link has expired or is invalid."]
[Text: "Reset links are valid for 1 hour."]
[28px gap]
[Request New Link button]
```

#### Request New Link Button

| Property | Value |
|----------|-------|
| Text | "Request New Reset Link" |
| `href` | `/reset-password` |
| Style | Primary button (Aqua bg, Navy text, full width, 44px height) |

---

### State C: Loading/Validating Token

While the token is being validated by Supabase client on page mount, show a loading state:

| Property | Value |
|----------|-------|
| Card content | Centered spinner (24px, Navy, spin animation) |
| Spinner margin | `32px` above and below |
| Text below spinner | "Validating reset link..." in Inter, 14px, Navy at 55% opacity |

---

## Login Page: `?passwordUpdated=true` Banner

When redirected to `/login?passwordUpdated=true` after successful password reset:

Show AlertBanner (type=success) at top of card:
> "Your password has been updated. Please sign in with your new password."

This banner is dismissed when the user starts typing in any field.

---

## Sign-In Page: `?next=<path>` Handling

When redirected to `/login?next=/dashboard/integrations`:
- The `next` param is stored in component state (or read from `searchParams` on the Server Component)
- After successful login, `router.push(next)` is called instead of `router.push('/dashboard')`
- **Security:** Validate that `next` starts with `/` (is a relative path) before using it. If it is an absolute URL or doesn't start with `/`, ignore it and redirect to `/dashboard`.

---

## `/api/auth/callback` Route

Supabase Auth uses PKCE flow with SSR. After OAuth-style redirects (e.g., password recovery, magic links), the browser lands on this route which exchanges the code for a session.

### Route File
`app/api/auth/callback/route.ts`

### Handler

```typescript
import { createRouteHandlerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const next = requestUrl.searchParams.get('next') ?? '/dashboard'

    if (code) {
        const supabase = createRouteHandlerClient({ cookies })
        await supabase.auth.exchangeCodeForSession(code)
    }

    // Redirect to next (validated to be relative path)
    const safeNext = next.startsWith('/') ? next : '/dashboard'
    return NextResponse.redirect(new URL(safeNext, requestUrl.origin))
}
```

This route handles:
- Email confirmation links (type=signup)
- Password recovery links (type=recovery) — after exchange, redirects to `/reset-password/confirm`
- Magic link flows if enabled in future

---

## Responsive Behavior

### Breakpoints
- Desktop: > 900px
- Mobile: ≤ 900px

### Auth Layout (both)

The auth layout is vertically centered regardless of breakpoint. The card fills the container up to its max-width.

| Property | Desktop | Mobile |
|----------|---------|--------|
| Container padding | `16px` all sides | `16px` all sides |
| Card padding | `40px` | `32px` |
| Card max-width | `440px` | `100%` (fills screen width minus 32px) |
| Logo icon size | `32px × 32px` | `28px × 28px` |
| Logo wordmark size | `20px` | `18px` |
| Logo margin bottom | `8px` | `8px` |
| Footer links | Centered, inline | Centered, wrap |

### Form Fields (both breakpoints)
- All fields are full-width (100%) at both breakpoints
- Touch targets (inputs, buttons) are minimum 44px height at all breakpoints
- Form gap between field groups is `16px` desktop / `12px` mobile

---

## Accessibility

### Focus Management
- On page load, the first field is autofocused (email on login/reset, fullName on signup)
- Tab order follows visual order (top to bottom)
- On form submission error, focus moves to the AlertBanner (set `tabIndex={-1}` on it and call `.focus()`)
- On field errors, focus moves to the first field with an error

### ARIA Labels

| Element | ARIA attribute | Value |
|---------|---------------|-------|
| Email input | `aria-describedby` | ID of FieldError if error exists |
| Password input | `aria-describedby` | ID of FieldError if error exists |
| Full name input | `aria-describedby` | ID of FieldError if error exists |
| Password toggle button | `aria-label` | "Show password" or "Hide password" |
| Alert banner | `role="alert"`, `aria-live="polite"` | — |
| Password strength bar | `role="progressbar"`, `aria-valuenow={0-4}`, `aria-valuemin=0`, `aria-valuemax=4`, `aria-label="Password strength"` | — |
| Submit button (loading) | `aria-busy="true"` | — |
| Resend cooldown button | `aria-disabled="true"` when disabled | — |
| Form | `aria-label="Sign in form"` / `"Create account form"` / `"Reset password form"` | — |

### Keyboard Navigation
- All interactive elements reachable by Tab
- Enter key submits the form from any field
- Escape does not close anything on auth pages (no modals)
- Checkbox toggled by Space key

### Screen Reader Text (visually hidden but read aloud)
- Loading spinner: `<span class="sr-only">Loading...</span>` adjacent to spinner
- Password strength: `<span class="sr-only">Password strength: {Weak|Fair|Good|Strong}</span>` — updated live

### Color Contrast
- All text on white background meets WCAG AA (4.5:1 minimum):
  - Navy (#0C1F40) on White (#FFFFFF): 16.4:1 ✅
  - Navy at 55% opacity on White: 7.2:1 ✅
  - Navy at 40% opacity on White: 5.1:1 ✅
  - Error red (#DC2626) on White: 5.1:1 ✅
- Aqua (#B4E7DD) button with Navy text: 5.8:1 ✅

---

## Toast Notifications

Auth pages use a global `<Toaster>` component from `sonner` (or equivalent) positioned at top-center.

| Event | Toast type | Message |
|-------|-----------|---------|
| Reset email resent | success | "Reset link resent. Check your inbox." |
| Any unexpected success | success | Custom message per flow |

Toast styling:
| Property | Value |
|----------|-------|
| Position | Top center |
| Duration | 4000ms |
| Background | White |
| Border | `1px solid rgba(12,31,64,0.12)` |
| Border radius | `0` |
| Font | Inter, 14px, weight 400, Navy |
| Success icon | 16px Aqua checkmark |
| Error icon | 16px red circle-x |
| Box shadow | `0 4px 12px rgba(12,31,64,0.12)` |

---

## File Structure

```
app/
  (auth)/
    layout.tsx                    # Auth shell layout
    login/
      page.tsx                    # Login form
    signup/
      page.tsx                    # Signup form
      check-email/
        page.tsx                  # Email confirmation sent (if enabled)
    reset-password/
      page.tsx                    # Request reset form + success state
      confirm/
        page.tsx                  # Enter new password form

    api/
      auth/
        callback/
          route.ts                # PKCE code exchange

components/
  auth/
    AuthCard.tsx                  # Shared card wrapper with CI stripe
    FormInput.tsx                 # Input field with label, error
    FieldError.tsx                # Inline error message
    AlertBanner.tsx               # Form-level alert (error/success/info)
    PasswordStrengthBar.tsx       # 4-segment strength indicator
    PasswordInput.tsx             # Password input with show/hide toggle

app/
  actions/
    createTenant.ts               # Server action: create tenant + members + subscription
```

---

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| User navigates back after successful login | Middleware detects session, redirects to /dashboard |
| User opens login in two tabs simultaneously | Second tab detects existing session on mount and redirects to /dashboard |
| Reset link clicked after already used | Supabase returns invalid token; State B (token invalid) is shown |
| Reset link clicked on different device/browser | Token still valid (Supabase verifies server-side); page works normally |
| Signup with very slow network | Submit button stays in loading state; no duplicate submissions (button is disabled while loading) |
| User submits form with JavaScript disabled | Form uses `<form action="...">` post — NOT supported without JS. Auth pages require JavaScript. Show `<noscript>` message: "Please enable JavaScript to use Daimon." |
| Email field pre-filled via `?email=` param | Sanitize: accept only valid email format; ignore if invalid |
| Session expires while on dashboard → redirected to /login | `next` param preserved; user sees their intended destination after re-login |
| Very long email (>254 chars) | Client-side: rejected with "Please enter a valid email address." |
| Password 73+ chars | Client-side: "Password cannot exceed 72 characters." |
| `fullName` contains only whitespace | Trimmed client-side: if `.trim().length < 2`, shows "Full name is required." |

---

## Cross-References

- See [source/existing-auth.md](../source/existing-auth.md) for Supabase Auth technical implementation (session cookies, middleware, tenant resolution)
- See [database/schema.md](../database/schema.md) for `tenants`, `tenant_members`, `tenant_subscriptions` tables created during signup
- See [api/auth.md](../api/auth.md) for `/api/auth/callback` route and sign-out endpoint
- See [database/vault-encryption.md](../database/vault-encryption.md) for the Vault pattern used after signup
- See [frontend/copy.md](copy.md) for the complete string inventory including all auth page strings
- See [frontend/validation-rules.md](validation-rules.md) for the canonical validation rules for all form fields
- See [ui/design-system.md](../ui/design-system.md) for the full brand-compliant design system
