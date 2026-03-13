# Keyboard Navigation & Focus Management Specification

> File: `final-mega-spec/ui/keyboard-navigation.md`
> Last updated: 2026-03-13
> Cross-references:
>   - ARIA labels and roles: [./accessibility.md](./accessibility.md)
>   - Component library: [../frontend/component-library.md](../frontend/component-library.md)
>   - Copy inventory: [../frontend/copy.md](../frontend/copy.md)

This document specifies exhaustive keyboard navigation behavior, tab order, focus management, focus traps, and screen reader announcements for every page in the Daimon SaaS website. No "implement appropriate keyboard support" placeholders — every key, every sequence, and every focus transition is specified here.

**Target standard**: WCAG 2.1 Level AA (Success Criteria 2.1.1, 2.1.2, 2.4.3, 2.4.7, 3.2.1, 3.3.1)

---

## Table of Contents

1. [Global Keyboard Conventions](#1-global-keyboard-conventions)
2. [Focus Ring Styles](#2-focus-ring-styles)
3. [Skip Links](#3-skip-links)
4. [Tab Order — Landing Page](#4-tab-order--landing-page)
5. [Tab Order — Login Page](#5-tab-order--login-page)
6. [Tab Order — Signup Page](#6-tab-order--signup-page)
7. [Tab Order — Reset Password Page](#7-tab-order--reset-password-page)
8. [Tab Order — Dashboard Home](#8-tab-order--dashboard-home)
9. [Tab Order — Integrations Page](#9-tab-order--integrations-page)
10. [Tab Order — Billing Page](#10-tab-order--billing-page)
11. [Tab Order — Settings Page](#11-tab-order--settings-page)
12. [Tab Order — Admin Panel](#12-tab-order--admin-panel)
13. [Tab Order — Docs Pages](#13-tab-order--docs-pages)
14. [Focus Traps — Modals and Dialogs](#14-focus-traps--modals-and-dialogs)
15. [Focus Management After Actions](#15-focus-management-after-actions)
16. [Component-Level Keyboard Behavior](#16-component-level-keyboard-behavior)
17. [Screen Reader Announcements (Live Regions)](#17-screen-reader-announcements-live-regions)
18. [Mobile Keyboard Behavior](#18-mobile-keyboard-behavior)

---

## 1. Global Keyboard Conventions

These conventions apply across every page unless overridden by a specific component.

### 1.1 Universal Keys

| Key | Behavior |
|-----|----------|
| `Tab` | Move focus forward through focusable elements in DOM order |
| `Shift+Tab` | Move focus backward through focusable elements |
| `Enter` | Activate focused button, link, or select option |
| `Space` | Activate focused button, checkbox, toggle |
| `Escape` | Close modal, dialog, dropdown menu, or tooltip; move focus to trigger |
| `Arrow keys` | Navigate within composite widgets (tabs, dropdown menus, radio groups) |
| `Home` / `End` | Jump to first/last item in a list widget (dropdown menus) |
| `Page Up` / `Page Down` | Scroll the current scrollable region |

### 1.2 Focus Order Rules

1. Focus order follows DOM reading order (top-to-bottom, left-to-right in LTR layout)
2. Sidebar navigation precedes main content in DOM (but skip link bypasses it)
3. `tabindex="0"` is used ONLY for elements that are not natively focusable (e.g., custom interactive `<div>`)
4. `tabindex="-1"` is used for elements that receive programmatic focus but are not in tab sequence
5. `tabindex` values > 0 are NEVER used (they disrupt natural order)
6. Hidden elements (`display:none`, `visibility:hidden`, `aria-hidden="true"`) are removed from tab sequence automatically

### 1.3 Focusable Elements (in order of appearance)

Elements that receive Tab focus, in priority order:
1. Skip link (visually hidden until focused)
2. `<a href>` links
3. `<button>` elements (including `type="submit"`)
4. `<input>` fields (all types except `type="hidden"`)
5. `<select>` dropdowns
6. `<textarea>` fields
7. Elements with `tabindex="0"` (interactive custom widgets)

Non-focusable (never receive Tab):
- `<div>`, `<span>`, `<p>` without `tabindex`
- `aria-hidden="true"` elements
- `disabled` form elements
- Decorative icons with `aria-hidden="true"`

---

## 2. Focus Ring Styles

### 2.1 Global Focus Ring

**Applied via Tailwind `focus-visible:` pseudo-class (NOT `focus:` to avoid mouse-click rings)**

```css
/* tailwind.config.ts — extend default ring */
/* Applied to all interactive elements */
.focus-visible\:ring {
  outline: 2px solid #00D4E8;  /* --color-aqua */
  outline-offset: 2px;
  border-radius: 4px;
}
```

Concrete Tailwind classes added to every interactive element:
```
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aqua focus-visible:ring-offset-2
```

Where `aqua` = `#00D4E8` (defined in `tailwind.config.ts` as `colors.aqua`).

### 2.2 Focus Ring Variants by Component

| Component | Focus ring color | Ring offset | Border radius |
|-----------|-----------------|-------------|---------------|
| Primary Button | `#00D4E8` (aqua) | 2px | 6px |
| Secondary Button | `#00D4E8` (aqua) | 2px | 6px |
| Ghost Button | `#00D4E8` (aqua) | 2px | 6px |
| Destructive Button | `#FF4444` (red-500) | 2px | 6px |
| Text Input | `#00D4E8` (aqua) | 0px (inset ring) | 8px |
| Checkbox | `#00D4E8` (aqua) | 2px | 4px |
| Toggle/Switch | `#00D4E8` (aqua) | 2px | 100px (full) |
| Select | `#00D4E8` (aqua) | 0px (inset ring) | 8px |
| Link (nav) | `#00D4E8` (aqua) | 2px | 4px |
| Link (inline text) | `#00D4E8` (aqua) | 1px | 2px |
| Skip link | `#00D4E8` (aqua) | 0px | 4px |
| Modal backdrop close | `#00D4E8` (aqua) | 2px | 6px |
| Service card (integrations) | `#00D4E8` (aqua) | 2px | 12px |
| Dropdown menu item | `#00D4E8` (aqua), applied to `background` | — | 6px |
| Tab trigger | `#00D4E8` (aqua) | 2px | 6px |
| CopyToClipboard button | `#00D4E8` (aqua) | 2px | 6px |

### 2.3 High Contrast Mode Support

When `prefers-contrast: more` is detected:
```css
@media (prefers-contrast: more) {
  :focus-visible {
    outline: 3px solid #000000;
    outline-offset: 2px;
  }
}
```

### 2.4 Focus Ring Implementation (global CSS)

**File:** `app/globals.css`

```css
/* Remove browser default, apply custom ring via Tailwind */
*:focus {
  outline: none;
}

*:focus-visible {
  outline: 2px solid #00D4E8;
  outline-offset: 2px;
}

/* Inset ring for inputs */
input:focus-visible,
select:focus-visible,
textarea:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px #00D4E8 inset;
}

/* High contrast override */
@media (prefers-contrast: more) {
  *:focus-visible {
    outline: 3px solid #000000;
    outline-offset: 2px;
  }
}
```

---

## 3. Skip Links

### 3.1 Skip Link HTML (all pages)

**File:** `app/layout.tsx` (root layout)

```tsx
// First child of <body>, before any nav or header
<a
  href="#main-content"
  className={[
    "sr-only",
    "focus-visible:not-sr-only",
    "focus-visible:absolute",
    "focus-visible:top-4",
    "focus-visible:left-4",
    "focus-visible:z-[200]",
    "focus-visible:bg-white",
    "focus-visible:text-navy",
    "focus-visible:font-semibold",
    "focus-visible:px-4",
    "focus-visible:py-2",
    "focus-visible:rounded",
    "focus-visible:border-2",
    "focus-visible:border-aqua",
    "focus-visible:shadow-lg",
  ].join(" ")}
>
  Skip to main content
</a>
```

### 3.2 Docs Pages — Additional Skip Link

Docs pages have a second skip link for the in-page table of contents:

```tsx
<a href="#doc-content" className="sr-only focus-visible:not-sr-only ...">
  Skip to article
</a>
```

### 3.3 Skip Link Behavior

1. Hidden from visual display (`.sr-only`) until Tab is pressed
2. On focus: appears top-left, z-index 200 (above sidebar and nav)
3. On Enter: scrolls `#main-content` into view and moves focus to it
4. `<main id="main-content" tabindex="-1">` — `tabindex="-1"` allows programmatic focus without adding to tab sequence
5. After focus lands on `#main-content`, next Tab moves to the first focusable element inside main

---

## 4. Tab Order — Landing Page

Route: `/`

**Full tab sequence (in order):**

| Position | Element | Type | Notes |
|----------|---------|------|-------|
| 1 | Skip link | `<a>` | Visually hidden |
| 2 | Logo "Daimon" | `<a href="/">` | `aria-label="Daimon home"` |
| 3 | Nav: "Features" | `<a href="#features">` | Smooth scroll anchor |
| 4 | Nav: "Pricing" | `<a href="#pricing">` | Smooth scroll anchor |
| 5 | Nav: "Docs" | `<a href="/docs">` | |
| 6 | Nav: "Sign in" | `<a href="/login">` | |
| 7 | Nav: "Get started free" | `<button>` or `<a href="/signup">` | Primary CTA |
| 8 | Hero: "Get started free" | `<a href="/signup">` | Hero CTA button |
| 9 | Hero: "View docs" | `<a href="/docs">` | Hero secondary link |
| 10–25 | Feature cards | Each card has no focusable element unless it contains a link | Cards are `<article>` with no tabstop if purely informational |
| 26 | Pricing: Free plan "Get started free" | `<a href="/signup">` | |
| 27 | Pricing: Starter plan "Get started" | `<a href="/signup?plan=starter">` | |
| 28 | Pricing: Pro plan "Get started" | `<a href="/signup?plan=pro">` | |
| 29 | FAQ: Accordion item 1 toggle | `<button aria-expanded>` | |
| 30 | FAQ: Accordion item 2 toggle | `<button aria-expanded>` | |
| 31 | FAQ: Accordion item 3 toggle | `<button aria-expanded>` | |
| 32 | FAQ: Accordion item 4 toggle | `<button aria-expanded>` | |
| 33 | FAQ: Accordion item 5 toggle | `<button aria-expanded>` | |
| 34 | FAQ: Accordion item 6 toggle | `<button aria-expanded>` | |
| 35 | CTA section: "Get started free" | `<a href="/signup">` | |
| 36 | Footer: "Privacy Policy" | `<a href="/legal/privacy">` | |
| 37 | Footer: "Terms of Service" | `<a href="/legal/terms">` | |
| 38 | Footer: "Docs" | `<a href="/docs">` | |
| 39 | Footer: "Contact" | `<a href="mailto:hello@daimon.ai">` | |
| 40 | Footer: GitHub icon | `<a href="...">` | `aria-label="Daimon on GitHub"` |
| 41 | Footer: Discord icon | `<a href="...">` | `aria-label="Join Daimon Discord"` |

**FAQ Accordion keyboard behavior:**
- `Enter` or `Space` on accordion trigger: expands/collapses panel
- `aria-expanded="true/false"` updated on trigger
- `aria-controls="faq-panel-N"` on trigger; `id="faq-panel-N"` on panel
- When expanded, panel content is in tab sequence (links within answer text)
- When collapsed, panel content is hidden (`hidden` attribute or `display:none`) — not in tab sequence

---

## 5. Tab Order — Login Page

Route: `/login`

**Full tab sequence (in order):**

| Position | Element | Type | Notes |
|----------|---------|------|-------|
| 1 | Skip link | `<a>` | |
| 2 | Logo "Daimon" | `<a href="/">` | Top-left in auth layout |
| 3 | Email input | `<input type="email" id="email">` | `autofocus` — auto-focused on page load |
| 4 | Password input | `<input type="password" id="password">` | |
| 5 | "Forgot password?" | `<a href="/reset-password">` | Positioned below password field |
| 6 | "Sign in" submit button | `<button type="submit">` | |
| 7 | "Sign up" link | `<a href="/signup">` | "Don't have an account?" text |

**Autofocus rule:** `<input id="email" autoFocus>` — email field receives focus on mount. Do not autofocus on password (security: avoid exposing it's a login page to assistive tech).

**Enter key:** Pressing Enter within any field submits the form (native HTML form submission).

**Tab from last field:** After "Sign up" link, Tab wraps to skip link (browser default behavior; no override needed).

**Error state focus:** When form submission fails, focus moves to the first field with an error. If it's a general error (e.g., "Invalid credentials"), focus moves to the error `<div role="alert">` above the form. Implementation:
```tsx
useEffect(() => {
  if (error) {
    errorRef.current?.focus();
  }
}, [error]);
// errorRef attached to <div role="alert" tabindex="-1">
```

---

## 6. Tab Order — Signup Page

Route: `/signup`

**Full tab sequence (in order):**

| Position | Element | Type | Notes |
|----------|---------|------|-------|
| 1 | Skip link | `<a>` | |
| 2 | Logo "Daimon" | `<a href="/">` | |
| 3 | Email input | `<input type="email" id="email" autoFocus>` | Auto-focused |
| 4 | Password input | `<input type="password" id="password">` | |
| 5 | Confirm password input | `<input type="password" id="confirmPassword">` | |
| 6 | Terms checkbox | `<input type="checkbox" id="termsAccepted">` | |
| 7 | "Terms of Service" link (inline) | `<a href="/legal/terms">` | Inside label text |
| 8 | "Privacy Policy" link (inline) | `<a href="/legal/privacy">` | Inside label text |
| 9 | "Create account" submit button | `<button type="submit">` | |
| 10 | "Sign in" link | `<a href="/login">` | "Already have an account?" |

**Inline links in checkbox label:** The links are inside the `<label for="termsAccepted">` text. They are focusable independently. Screen reader reads the full label text when checkbox is focused, then separately reads each link when focused.

**Password strength indicator:** Not focusable. `role="status"` with `aria-live="polite"` — see [Section 17](#17-screen-reader-announcements-live-regions).

---

## 7. Tab Order — Reset Password Page

Route: `/reset-password`

### 7.1 Step 1: Request Reset (initial state)

| Position | Element | Type | Notes |
|----------|---------|------|-------|
| 1 | Skip link | `<a>` | |
| 2 | Logo | `<a href="/">` | |
| 3 | Email input | `<input type="email" autoFocus>` | |
| 4 | "Send reset email" button | `<button type="submit">` | |
| 5 | "Back to sign in" link | `<a href="/login">` | |

### 7.2 Step 2: Check Email (confirmation state)

After form submission, page transitions to confirmation message. Focus moves to heading:
```tsx
useEffect(() => {
  if (emailSent) {
    confirmationHeadingRef.current?.focus();
  }
}, [emailSent]);
// <h1 tabindex="-1" ref={confirmationHeadingRef}>Check your email</h1>
```

Tab sequence in confirmation state:
| Position | Element | Type |
|----------|---------|------|
| 1 | Skip link | `<a>` |
| 2 | Logo | `<a href="/">` |
| 3 | "Back to sign in" link | `<a href="/login">` |

### 7.3 Step 3: New Password Form (from email link)

Route: `/reset-password?token=...`

| Position | Element | Type | Notes |
|----------|---------|------|-------|
| 1 | Skip link | `<a>` | |
| 2 | Logo | `<a href="/">` | |
| 3 | New password input | `<input type="password" autoFocus>` | |
| 4 | Confirm new password | `<input type="password">` | |
| 5 | "Reset password" button | `<button type="submit">` | |

After successful reset: redirect to `/login` with success toast — see [Section 17](#17-screen-reader-announcements-live-regions) for toast announcement.

---

## 8. Tab Order — Dashboard Home

Route: `/dashboard`

**Full tab sequence (in order):**

| Position | Element | Type | Notes |
|----------|---------|------|-------|
| 1 | Skip link | `<a>` | |
| 2 | Sidebar logo | `<a href="/dashboard" aria-label="Daimon home — go to dashboard">` | |
| 3 | Sidebar: Dashboard nav link | `<a href="/dashboard" aria-current="page">` | |
| 4 | Sidebar: Integrations nav link | `<a href="/dashboard/integrations">` | |
| 5 | Sidebar: Billing nav link | `<a href="/dashboard/billing">` | |
| 6 | Sidebar: Settings nav link | `<a href="/dashboard/settings">` | |
| 7 | Sidebar: Docs nav link | `<a href="/docs">` | |
| 8 | Sidebar: Sign out button | `<button aria-label="Sign out">` | |
| 9 | Topbar: User menu button | `<button aria-label="User menu" aria-expanded aria-haspopup="menu">` | If present |
| 10 | Onboarding checklist: Step 1 action | `<button>` or `<a>` | "Connect Discord" CTA |
| 11 | Onboarding checklist: Step 2 action | `<button>` or `<a>` | "Add Anthropic API key" CTA |
| 12 | Onboarding checklist: Step 3 action | `<button>` or `<a>` | "Connect an integration" CTA |
| 13 | Bot status card: "View details" | `<a href="/dashboard/settings">` | If bot is disconnected |
| 14 | Bot status card: "Reconnect" | `<button>` | If bot shows error state |
| 15 | Stat card 1: no focusable element | — | Pure display |
| 16 | Stat card 2: no focusable element | — | Pure display |
| 17 | Stat card 3: no focusable element | — | Pure display |
| 18 | Activity feed: "View all" | `<a href="/dashboard/activity">` | If exists |
| 19 | Quick action: "Go to Integrations" | `<a href="/dashboard/integrations">` | |
| 20 | Quick action: "Go to Billing" | `<a href="/dashboard/billing">` | |
| 21 | Quick action: "Go to Settings" | `<a href="/dashboard/settings">` | |

**Onboarding checklist when all steps complete:** Checklist section collapses or shows "Setup complete" with no interactive elements. `role="status"` announces: `"Setup complete. Your bot is ready."` — see [Section 17](#17-screen-reader-announcements-live-regions).

**Mobile:** On mobile, sidebar is hidden. Tab sequence starts at skip link → mobile menu toggle → (if open: sidebar items in overlay) → main content.

---

## 9. Tab Order — Integrations Page

Route: `/dashboard/integrations`

| Position | Element | Type | Notes |
|----------|---------|------|-------|
| 1 | Skip link | `<a>` | |
| 2–8 | Sidebar navigation (same as dashboard) | `<a>` / `<button>` | |
| 9 | Page heading (no focus) | `<h1>` | Not focusable |
| 10 | Filter tabs: "All" | `<button role="tab" aria-selected>` | Tab widget; arrow keys navigate |
| 11 | Filter tabs: "Connected" | `<button role="tab">` | |
| 12 | Filter tabs: "Available" | `<button role="tab">` | |
| 13 | Search input | `<input type="search" aria-label="Search integrations">` | |
| 14 | Service card 1 primary action | `<button>` ("Connect") or `<button>` ("Manage") | |
| 15 | Service card 2 primary action | `<button>` | |
| …  | (one focusable button per service card) | | |
| N | Service card N primary action | `<button>` | |

**Tab widget keyboard behavior (filter tabs):**
- When focus is on a tab, `ArrowRight` moves to next tab, `ArrowLeft` moves to previous tab
- `Home` moves to first tab ("All"), `End` moves to last tab ("Available")
- Tab key moves focus OUT of the tab widget to the next focusable element (search input)
- Active tab has `aria-selected="true"`, inactive tabs have `aria-selected="false"`
- Tab panel (`role="tabpanel"`) is linked via `aria-labelledby` to active tab

**Service card keyboard behavior:**
- Each service card has one primary action button ("Connect", "Manage", "Reconnect")
- The card container itself is NOT focusable (button inside is)
- Connected service cards with a "Disconnect" option: the main button is "Manage" (opens modal)

**OAuth flow keyboard path:**
1. User presses Enter on "Connect GitHub" button
2. Browser redirects to GitHub OAuth (external; keyboard handled by GitHub)
3. After redirect back, page re-renders with card showing "Connected" state
4. Focus is restored to the GitHub service card's "Manage" button
5. Implementation: after OAuth callback, set `focusTarget` in sessionStorage to `"service-card-github"`, then in `useEffect` on integrations page: `document.getElementById('service-card-github')?.querySelector('button')?.focus()`

**API key modal keyboard:** See [Section 14](#14-focus-traps--modals-and-dialogs) for focus trap specification.

---

## 10. Tab Order — Billing Page

Route: `/dashboard/billing`

| Position | Element | Type | Notes |
|----------|---------|------|-------|
| 1 | Skip link | `<a>` | |
| 2–8 | Sidebar navigation | `<a>` / `<button>` | |
| 9 | Current plan card: "Manage billing" / "Upgrade" | `<button>` | Opens Stripe Customer Portal or Checkout |
| 10 | Anthropic API key label text | — | Non-focusable |
| 11 | Anthropic API key: masked input / "Reveal" | `<button aria-label="Reveal API key">` | If key exists |
| 12 | Anthropic API key: "Copy" | `<button aria-label="Copy API key">` | If key exists |
| 13 | Anthropic API key: "Update key" / "Add key" | `<button>` | Opens inline form or modal |
| 14 | OpenAI API key: same pattern as above | `<button>` × 3 | If key exists |
| 15 | "Usage this month" section: no focusable elements | — | Pure display |
| 16 | Invoice history: row 1 "Download" | `<a href="...">` | Stripe invoice link |
| 17 | Invoice history: row 2 "Download" | `<a href="...">` | |
| … | (one link per invoice row) | | |

**Inline API key update form (when expanded):**
When "Update key" button is clicked, an inline form expands below the button. Focus moves to the new input field. Tab sequence within expanded form:

| Sub-position | Element | Type |
|-------------|---------|------|
| A | New API key input | `<input type="password" autoFocus>` |
| B | "Save" button | `<button type="submit">` |
| C | "Cancel" button | `<button type="button">` |

After "Cancel": focus returns to "Update key" button. After "Save" (success): focus returns to the "Update key" button (which is now re-labeled "Update key" with the key masked). After "Save" (error): focus stays on the error message `<div role="alert" tabindex="-1">`.

---

## 11. Tab Order — Settings Page

Route: `/dashboard/settings`

| Position | Element | Type | Notes |
|----------|---------|------|-------|
| 1 | Skip link | `<a>` | |
| 2–8 | Sidebar navigation | `<a>` / `<button>` | |
| 9 | Section tabs: "General" | `<button role="tab" aria-selected>` | Tab widget |
| 10 | Section tabs: "Discord" | `<button role="tab">` | |
| 11 | Section tabs: "Team" | `<button role="tab">` | |
| 12 | Section tabs: "Danger Zone" | `<button role="tab">` | |

**"General" tab panel (aria-labelledby="tab-general"):**

| Sub-position | Element | Type |
|-------------|---------|------|
| A | Tenant name input | `<input type="text">` |
| B | "Save" button | `<button type="submit">` |

**"Discord" tab panel (aria-labelledby="tab-discord"):**

| Sub-position | Element | Type |
|-------------|---------|------|
| A | Bot token input (masked) | `<input type="password" aria-label="Discord bot token">` |
| B | "Reveal" button | `<button aria-label="Reveal Discord bot token">` |
| C | Guild ID input | `<input type="text" aria-label="Discord guild ID">` |
| D | "Save Discord settings" button | `<button type="submit">` |
| E | "Test connection" button | `<button type="button">` |
| F | "Disconnect bot" button | `<button type="button" aria-describedby="disconnect-warning">` |

**"Team" tab panel:**

| Sub-position | Element | Type |
|-------------|---------|------|
| A | Invite email input | `<input type="email" aria-label="Team member email">` |
| B | Role select | `<select aria-label="Member role">` |
| C | "Send invite" button | `<button type="submit">` |
| D | Member row 1: "Remove" button | `<button aria-label="Remove [name] from team">` |
| E | Member row 2: "Remove" button | `<button>` |
| … | (one Remove per member row) | | |

**"Danger Zone" tab panel:**

| Sub-position | Element | Type |
|-------------|---------|------|
| A | "Delete account" button | `<button type="button" aria-describedby="delete-warning">` |

"Delete account" button opens confirmation dialog. See [Section 14](#14-focus-traps--modals-and-dialogs).

**Tab widget keyboard rules (same as Integrations):** ArrowLeft/Right navigate tabs, Tab exits widget.

---

## 12. Tab Order — Admin Panel

Route: `/admin` (admin users only)

| Position | Element | Type | Notes |
|----------|---------|------|-------|
| 1 | Skip link | `<a>` | |
| 2–8 | Sidebar navigation (includes "Admin" link) | `<a>` / `<button>` | |
| 9 | Admin sub-nav: "Tenants" | `<a href="/admin/tenants" aria-current>` | |
| 10 | Admin sub-nav: "Audit Log" | `<a href="/admin/audit">` | |
| 11 | Admin sub-nav: "System" | `<a href="/admin/system">` | |
| 12 | Search input | `<input type="search" aria-label="Search tenants">` | |
| 13 | Filter select | `<select aria-label="Filter by status">` | |
| 14 | Tenant row 1: "View" link | `<a href="/admin/tenants/[id]">` | |
| 15 | Tenant row 1: "Impersonate" button | `<button aria-label="Impersonate [tenant name]">` | |
| … | (two focusable elements per tenant row) | | |
| N | Pagination: "Previous" | `<button aria-label="Previous page" aria-disabled>` | Disabled on first page |
| N+1 | Pagination: page 1 | `<button aria-label="Page 1" aria-current="page">` | |
| N+2 | Pagination: page 2 | `<button aria-label="Page 2">` | |
| N+3 | Pagination: "Next" | `<button aria-label="Next page">` | |

**Impersonate button confirmation:** Opens inline confirmation (`ConfirmDialog`). See [Section 14](#14-focus-traps--modals-and-dialogs).

**Tenant detail page `/admin/tenants/[id]`:**

| Position | Element | Type |
|----------|---------|------|
| 1 | Skip link | `<a>` |
| 2–8 | Sidebar nav | `<a>` / `<button>` |
| 9 | Back link: "← All tenants" | `<a href="/admin/tenants">` |
| 10 | "Impersonate tenant" button | `<button>` |
| 11 | "Suspend tenant" / "Unsuspend" button | `<button>` |
| 12 | Audit log entries (no focusable elements) | — |
| 13 | Pagination controls | `<button>` × N |

---

## 13. Tab Order — Docs Pages

Route: `/docs`, `/docs/[slug]`

| Position | Element | Type | Notes |
|----------|---------|------|-------|
| 1 | Skip link: "Skip to main content" | `<a>` | |
| 2 | Secondary skip: "Skip to article" | `<a href="#doc-content">` | Only on article pages |
| 3 | Docs nav logo | `<a href="/">` | |
| 4 | Docs search input | `<input type="search" aria-label="Search documentation">` | |
| 5 | Left sidebar: "Getting Started" section heading | Not focusable (`<h3>`) | |
| 6 | Left sidebar: "Quick Start" link | `<a href="/docs/quick-start" aria-current="page">` | |
| 7 | Left sidebar: "Configuration" link | `<a href="/docs/configuration">` | |
| 8 | Left sidebar: "Tool Reference" section heading | Not focusable | |
| 9 | Left sidebar: "Discord Tools" link | `<a href="/docs/tools/discord">` | |
| 10 | Left sidebar: "Toggl Tools" link | `<a href="/docs/tools/toggl">` | |
| … | (one link per doc page in sidebar) | | |
| N | Article heading links (anchor tags) | `<a aria-label="Link to section [heading text]">` | `#` icon on heading hover |
| N+1 | Inline code blocks: "Copy" button | `<button aria-label="Copy code">` | |
| N+2 | Table of contents (right sidebar): link 1 | `<a href="#section-1">` | |
| N+3 | Table of contents: link 2 | `<a href="#section-2">` | |
| … | (one link per TOC item) | | |
| Last | Footer nav links | `<a>` | |

**Docs search keyboard behavior:**
- Typing in search input shows dropdown results (`role="listbox"`)
- `ArrowDown` from input moves focus to first result (`role="option"`)
- `ArrowUp`/`ArrowDown` navigate results
- `Enter` on result navigates to that doc page
- `Escape` clears/closes dropdown, returns focus to input
- `Tab` from input closes dropdown, moves to next element (left sidebar first link)

---

## 14. Focus Traps — Modals and Dialogs

All modals and dialogs must trap focus while open. No focus should escape to background content.

### 14.1 Focus Trap Implementation

**Library:** `focus-trap` npm package (or equivalent manual implementation)

**Required behavior:**
1. When modal opens: focus moves to first focusable element inside modal (typically the modal's close button or first form field)
2. Tab cycles through focusable elements inside modal only
3. Shift+Tab cycles backward through focusable elements inside modal only
4. Escape closes modal and returns focus to the element that triggered it
5. Clicking outside modal (backdrop) closes modal and returns focus to trigger
6. Background content: `aria-hidden="true"` applied to `#root` or layout wrapper while modal is open

**Trigger reference:** Before opening modal, store a ref to the trigger element:
```tsx
const triggerRef = useRef<HTMLButtonElement>(null);

const openModal = () => {
  triggerRef.current = document.activeElement as HTMLButtonElement;
  setIsOpen(true);
};

const closeModal = () => {
  setIsOpen(false);
  triggerRef.current?.focus(); // Restore focus
};
```

### 14.2 Service Connection Modal (Integrations page)

**Trigger:** "Connect [service]" button on service card

**Focus order within modal:**
| Position | Element | Type |
|----------|---------|------|
| 1 | Modal close button | `<button aria-label="Close">` — receives focus on open |
| 2 | API key input | `<input type="password" aria-label="[Service] API key">` |
| 3 | "Validate" / "Save" button | `<button type="submit">` |
| 4 | "Cancel" button | `<button type="button">` |

**On open:** Focus moves to modal close button (position 1).
**On Escape or "Cancel":** Modal closes, focus returns to "Connect [service]" trigger.
**On "Save" success:** Modal closes, focus returns to service card's new "Manage" button.
**On "Save" error:** Focus stays in modal, moves to error message `<div role="alert" tabindex="-1">`.

### 14.3 Confirmation Dialog (Destructive Actions)

Used for: "Delete account", "Disconnect bot", "Remove team member", "Impersonate tenant"

**Focus order within dialog:**
| Position | Element | Type |
|----------|---------|------|
| 1 | Dialog heading | `<h2 id="dialog-title" tabindex="-1">` — receives focus on open |
| 2 | "Cancel" button | `<button type="button">` — default action |
| 3 | "Confirm [action]" button | `<button type="button" class="destructive">` |

**Default focus:** Dialog heading (position 1), NOT the destructive button.
**Enter key default:** Cancel (not confirm). This prevents accidental deletion via Enter.
**Escape:** Cancel + close.
**On "Cancel":** Dialog closes, focus returns to trigger.
**On "Confirm":** Dialog closes (or stays open during loading), focus returns to trigger or to a contextually appropriate element after action completes.

```tsx
// ConfirmDialog.tsx
useEffect(() => {
  if (isOpen) {
    // Focus heading on open
    headingRef.current?.focus();
  }
}, [isOpen]);

// <h2 ref={headingRef} tabindex="-1" id="confirm-dialog-title">
//   Are you sure?
// </h2>
```

### 14.4 User Account Dropdown Menu (Topbar)

**Trigger:** User avatar/email button in topbar (`aria-haspopup="menu"`, `aria-expanded`)

**Keyboard behavior:**
- `Enter` or `Space` or `ArrowDown` on trigger: opens menu, moves focus to first menu item
- `ArrowDown`: moves to next menu item
- `ArrowUp`: moves to previous menu item
- `Home`: moves to first menu item
- `End`: moves to last menu item
- `Escape`: closes menu, returns focus to trigger
- `Tab`: closes menu, moves focus to next element in page (NOT trapped)
- `Enter` on menu item: activates item, closes menu

**Menu items (in order):**
1. "Account settings" → `<a href="/dashboard/settings">`
2. "Billing" → `<a href="/dashboard/billing">`
3. "Sign out" → `<button>`

### 14.5 Mobile Navigation Overlay

**Trigger:** Hamburger button in mobile topbar (`aria-expanded`, `aria-controls="mobile-nav"`)

**Keyboard behavior:**
1. `Enter`/`Space` on hamburger: opens overlay, applies focus trap
2. Focus moves to first nav link inside overlay
3. Tab/Shift+Tab cycles through nav links only (focus trapped)
4. `Escape`: closes overlay, returns focus to hamburger button
5. Nav link activated: overlay closes, focus moves to page main content

**Focus order within mobile overlay:**
| Position | Element |
|----------|---------|
| 1 | Close button (`<button aria-label="Close navigation">`) |
| 2 | Dashboard link |
| 3 | Integrations link |
| 4 | Billing link |
| 5 | Settings link |
| 6 | Docs link |
| 7 | Sign out button |

### 14.6 API Key Reveal Dialog

When user clicks "Reveal" on a masked API key field, no modal is opened — the field's type toggles from `password` to `text`. This is not a focus trap scenario. Focus stays on the now-text input field.

---

## 15. Focus Management After Actions

### 15.1 Page Navigation (client-side routing)

On every Next.js client-side navigation (Link click or programmatic `router.push()`):
1. New page mounts
2. Focus moves to `<main id="main-content" tabindex="-1">` (the main element)
3. Screen reader announces new page title via document title change

**Implementation:**

```tsx
// app/(dashboard)/layout.tsx — route change effect
const pathname = usePathname();
const mainRef = useRef<HTMLElement>(null);

useEffect(() => {
  mainRef.current?.focus();
}, [pathname]);

// <main ref={mainRef} id="main-content" tabindex="-1">
```

### 15.2 Form Submission — Success

| Action | Focus after success |
|--------|---------------------|
| Login | Redirect to `/dashboard`; focus on `#main-content` |
| Signup | Redirect to `/dashboard` (or email verification page); focus on `#main-content` |
| Reset password request | Focus on confirmation heading `<h1 tabindex="-1">` |
| Settings save (tenant name) | Focus returns to "Save" button; toast appears |
| Discord settings save | Focus returns to "Save Discord settings" button |
| API key add/update | Focus returns to "Update key" button |
| Integration connect (API key) | Modal closes; focus on service card "Manage" button |
| Integration connect (OAuth) | Post-redirect; focus on service card "Manage" button |
| Team member invite | Focus returns to "Send invite" button; new member appears in list |
| Remove team member | Focus moves to next "Remove" button, or to "Send invite" if none remain |

### 15.3 Form Submission — Error

| Action | Focus on error |
|--------|----------------|
| Login — invalid credentials | Focus to `<div role="alert" tabindex="-1">` error banner |
| Signup — email exists | Focus to email input with error state |
| Signup — password mismatch | Focus to confirm password input with error state |
| API key — invalid format | Focus to API key input with error state |
| Discord settings — invalid token | Focus to bot token input with error state |
| Settings save — server error | Focus to `<div role="alert" tabindex="-1">` error banner |
| Any form — network error | Focus to `<div role="alert" tabindex="-1">` with "Something went wrong" message |

**Error focus implementation pattern:**
```tsx
const errorRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (formState.errors?.general) {
    errorRef.current?.focus();
  }
  // For field-level errors, focus first errored field:
  if (formState.errors?.email) {
    emailInputRef.current?.focus();
  }
}, [formState.errors]);
```

### 15.4 Async State Changes (non-form)

| Trigger | Focus behavior |
|---------|----------------|
| Bot status changes to "online" (Realtime) | No focus change; `role="status"` live region announces |
| Bot status changes to "offline" | No focus change; `role="alert"` live region announces |
| Toast notification appears | No focus change; announced by `role="status"` live region |
| OAuth redirect return | Focus restored to integration service card button |
| Stripe redirect return | Focus on billing page `<h1>` after redirect (standard page load) |
| Pagination next page | Focus moves to table/list container heading |
| Modal close (any) | Focus returns to trigger element |
| Accordion expand | Focus stays on accordion trigger; content available below in tab order |
| Tab panel switch | Focus stays on active tab trigger; panel content available in tab order |

---

## 16. Component-Level Keyboard Behavior

### 16.1 Button

```
Enter: activate (same as click)
Space: activate (same as click)
Tab: move to next focusable element
Shift+Tab: move to previous focusable element
```

Disabled buttons: `disabled` attribute removes from tab order AND prevents activation.
Loading buttons: `aria-disabled="true"` keeps in tab order (screen readers can announce "loading") but prevents click/Enter/Space activation via `onClick` guard.

### 16.2 FormInput / TextInput

```
Tab: move to next field
Shift+Tab: move to previous field
Enter: submit form (if inside <form>)
Escape: (no default behavior — do NOT clear field on Escape, it's unexpected)
```

### 16.3 PasswordInput (with reveal toggle)

```
Tab into password field: focus on <input type="password">
Tab from password field: focus on reveal toggle button
Space/Enter on reveal toggle: toggle input type between "password" and "text"
Tab from reveal toggle: moves to next field
```

### 16.4 Select (native `<select>`)

```
Tab: focus element
ArrowDown/ArrowUp: navigate options (browser native)
Enter/Space: open dropdown and select (browser native)
Escape: close dropdown without changing (browser native)
```

### 16.5 Toggle/Switch

```
Tab: focus element
Space: toggle on/off
Enter: toggle on/off
```
`role="switch"`, `aria-checked="true/false"`.

### 16.6 Checkbox

```
Tab: focus element
Space: check/uncheck
Enter: (no behavior — Enter does not activate checkboxes per ARIA spec)
```

### 16.7 Dropdown Menu (custom)

```
Button trigger:
  Enter/Space: open menu, focus first item
  ArrowDown: open menu, focus first item
  ArrowUp: open menu, focus last item

Inside open menu:
  ArrowDown: next item (wraps to first)
  ArrowUp: previous item (wraps to last)
  Home: first item
  End: last item
  Enter/Space: activate item, close menu, return focus to trigger
  Escape: close menu, return focus to trigger
  Tab: close menu, move to next focusable outside menu (NOT trapped)
  Shift+Tab: close menu, move to previous focusable outside menu
```

### 16.8 Tabs (tab list)

```
Tab into tab list: focus on active tab
ArrowRight: focus next tab, activates it immediately (auto-activation per ARIA pattern)
ArrowLeft: focus previous tab, activates it immediately
Home: focus first tab, activate it
End: focus last tab, activate it
Tab from tab list: exits tab widget, moves to tab panel content
```

Note: Auto-activation (panel switches on arrow key) is used because each panel is small and no async load is needed. If panels required async loading, manual activation (Enter to activate) would be used instead.

### 16.9 Accordion

```
Tab: focus accordion trigger button
Space/Enter: toggle expanded/collapsed
ArrowDown: focus next accordion trigger (does not expand)
ArrowUp: focus previous accordion trigger (does not expand)
Home: focus first accordion trigger
End: focus last accordion trigger
```

`role="button"`, `aria-expanded="true/false"`, `aria-controls="panel-id"` on trigger.
`role="region"`, `aria-labelledby="trigger-id"` on panel.

### 16.10 Table (Admin Tenant List)

```
Tab: moves through focusable cells in reading order
(Sortable column headers: Enter activates sort)
(Row actions: Tab within row focuses action buttons)
```

Column headers with sort: `<th scope="col" role="columnheader" aria-sort="ascending/descending/none">`. Click or Enter activates sort. Tab does not sort.

### 16.11 CopyToClipboard Button

```
Tab: focus button
Enter/Space: copy to clipboard, announce "Copied!" via live region
```

After copy: button label briefly changes to "Copied!" (accessible text changes too, not just icon). After 2 seconds, reverts to "Copy".

### 16.12 Pagination

```
Previous page button: Tab, Enter/Space
Page number buttons: Tab between them, Enter/Space to activate
Next page button: Tab, Enter/Space
```

Disabled state (`aria-disabled="true"` + `disabled`): on first page, "Previous" is disabled. On last page, "Next" is disabled.

Current page: `aria-current="page"` on active page button.

After page change: focus moves to results container heading:
```tsx
resultsHeadingRef.current?.focus();
// <h2 ref={resultsHeadingRef} tabindex="-1">Showing 21–40 of 87 tenants</h2>
```

### 16.13 SearchInput

```
Tab: focus input
Type to search: results dropdown appears
ArrowDown: move focus into results (role="listbox")
ArrowUp: move focus back to input from first result
Escape: clear results, return focus to input
Enter (in input): submit search (if form)
Enter (on result item): select result, navigate
```

---

## 17. Screen Reader Announcements (Live Regions)

### 17.1 Live Region Types

| `aria-live` value | `aria-atomic` | Usage |
|------------------|--------------|-------|
| `polite` | `true` | Non-urgent updates (success toasts, status changes) |
| `assertive` | `true` | Urgent updates (errors, critical alerts) |
| `off` | — | Content that should not be announced |

### 17.2 Global Toast Container

**File:** `components/feedback/ToastContainer.tsx`

```tsx
<div
  aria-live="polite"
  aria-atomic="true"
  aria-relevant="additions"
  role="status"
  className="sr-only"
  id="toast-live-region"
>
  {/* Latest toast text injected here */}
  {activeToast?.message}
</div>
```

Visual toasts are rendered separately in a fixed overlay. This hidden live region ensures screen readers announce toast messages.

**All toast messages that trigger announcements:**

| Action | Live region text |
|--------|-----------------|
| Integration connected | "[Service name] connected successfully" |
| Integration disconnected | "[Service name] disconnected" |
| API key saved | "API key saved" |
| API key updated | "API key updated" |
| Settings saved | "Settings saved" |
| Discord settings saved | "Discord settings saved. Bot is reconnecting." |
| Team invite sent | "Invitation sent to [email]" |
| Team member removed | "[Name] removed from your team" |
| Password changed | "Password updated successfully" |
| Account deleted | "Account deleted. Redirecting." |
| Copy to clipboard | "Copied to clipboard" |
| Plan upgraded | "Plan upgraded to [plan name]" |
| Form error (general) | "Error: [error message text]" (via assertive) |

### 17.3 Error Alert Region

```tsx
// For form-level errors
<div
  role="alert"
  aria-live="assertive"
  aria-atomic="true"
  tabindex="-1"
  ref={errorRef}
>
  {error}
</div>
```

Error region text is also programmatically focused (see [Section 15.3](#153-form-submission--error)).

### 17.4 Bot Status Live Region (Dashboard)

The bot status indicator on the dashboard must announce when status changes (driven by Supabase Realtime):

```tsx
<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
  className="sr-only"
  id="bot-status-announcer"
>
  {/* Updated when status changes */}
  {statusAnnouncement}
</div>
```

Status change announcements:
| Status transition | Announcement text |
|------------------|-------------------|
| `connecting` → `online` | "Your bot is now online" |
| `online` → `offline` | "Your bot has gone offline" |
| `online` → `error` | "Your bot encountered an error" |
| `offline` → `connecting` | "Your bot is reconnecting" |
| `connecting` → `error` | "Your bot failed to connect" |

### 17.5 Onboarding Checklist Progress

When a checklist step is marked complete:

```tsx
<div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
  {completedStep && `Step complete: ${completedStep.label}`}
  {allComplete && "Setup complete. Your bot is ready."}
</div>
```

### 17.6 Password Strength Indicator

On the signup page, as user types password:

```tsx
<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
  id="password-strength-status"
>
  {/* Updated as user types */}
  Password strength: {strengthLabel}
  {/* strengthLabel: "Weak", "Fair", "Strong", "Very strong" */}
</div>
```

`aria-describedby="password-strength-status"` added to password input.

### 17.7 Search Results Count

When docs search or admin search returns results:

```tsx
<div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
  {query && `${resultCount} results for "${query}"`}
  {query && resultCount === 0 && `No results for "${query}"`}
</div>
```

Announced after a 300ms debounce to avoid announcing on every keystroke.

### 17.8 Loading State Announcements

```tsx
// When async data fetch starts
<div role="status" aria-live="polite" className="sr-only">
  {isLoading && "Loading..."}
</div>

// When data loads
useEffect(() => {
  if (!isLoading && data) {
    announce("Content loaded");
  }
}, [isLoading, data]);
```

Only announce loading/loaded for user-triggered actions (not background polls). Background Realtime updates should NOT announce "loading" (too noisy).

---

## 18. Mobile Keyboard Behavior

### 18.1 Virtual Keyboard

On mobile devices, virtual keyboard appears when text input is focused. Pages must not be obscured by virtual keyboard.

**Scroll behavior:**
- Forms: `scroll-into-view` is browser-native for focused inputs
- Custom controls (e.g., modals with inputs): modal content scrolls within the modal container; modal remains visible above virtual keyboard
- `viewport-fit=cover` is NOT set; use default viewport behavior

**Input types:** Use correct `type` attributes to invoke the right virtual keyboard:
| Field | `type` | Keyboard type |
|-------|--------|--------------|
| Email | `email` | Email keyboard (@ and . in primary) |
| Password | `password` | Standard keyboard with obscure |
| Numeric ID (Guild ID) | `text` inputmode="numeric" | Numeric keyboard |
| API key | `password` | Standard keyboard |
| Bot token | `password` | Standard keyboard |
| Search | `search` | Search keyboard (search button on return key) |
| URL | `url` | URL keyboard (. and / in primary) |

### 18.2 Touch Targets

All interactive elements must have minimum 44×44px touch targets per WCAG 2.5.5:

| Element | Visual size | Touch target expansion |
|---------|------------|----------------------|
| Nav links (sidebar) | 36px height | Padding extended to 44px |
| Buttons (primary) | 44px height | Meets requirement natively |
| Buttons (small/ghost) | 32px height | Wrapper adds 6px top/bottom padding |
| Checkboxes | 16px visual | Wrapper `<label>` extends to 44×44px |
| Toggle/switch | 24px height | Wrapper extends to 44px |
| Accordion triggers | 48px height | Meets requirement natively |
| Table action buttons | 32px height | Cell padding provides 44px effective target |
| Pagination buttons | 36px height | Adds wrapper padding |
| Copy button | 32×32px | Wrapper extends to 44×44px |

### 18.3 Swipe and Touch Gestures

No custom swipe gestures are implemented (reduces complexity, prevents conflicts with system gestures). All interactions are tap/press only.

Exception: native `<select>` on iOS/Android uses native picker wheel — no override.

---

## Appendix A: Focus Indicator Checklist

Every interactive element in the codebase must pass:
- [ ] Visible focus ring when navigated to with keyboard
- [ ] Focus ring color `#00D4E8` (aqua) at minimum 3:1 contrast against adjacent colors
- [ ] Focus ring not hidden by `overflow:hidden` container
- [ ] Focus ring not clipped by modal or scroll container
- [ ] Focus ring not `outline:none` without replacement
- [ ] `focus-visible:` pseudo-class used (not `focus:`) to hide ring for mouse users

## Appendix B: Screen Reader Testing Targets

Required test coverage for each major browser/AT combination:

| Screen Reader | Browser | OS |
|--------------|---------|-----|
| VoiceOver | Safari | macOS |
| NVDA | Firefox | Windows |
| JAWS | Chrome | Windows |
| TalkBack | Chrome | Android |
| VoiceOver | Safari | iOS |

Minimum test scenarios per AT combination:
1. Complete signup flow (keyboard only)
2. Connect an integration
3. Navigate dashboard using landmarks
4. Trigger and dismiss a modal
5. Form submission with validation error

## Appendix C: ARIA Pattern Compliance Reference

| Widget | ARIA Pattern Used | Reference |
|--------|------------------|-----------|
| Modal/Dialog | `role="dialog"`, focus trap, `aria-modal="true"` | APG Modal Dialog |
| Dropdown Menu | `role="menu"`, `role="menuitem"`, `aria-haspopup="menu"` | APG Menu Button |
| Tabs | `role="tablist"`, `role="tab"`, `role="tabpanel"` | APG Tabs (auto-activation) |
| Accordion | `role="button"`, `aria-expanded`, `aria-controls` | APG Accordion |
| Combobox (search) | `role="combobox"`, `role="listbox"`, `role="option"` | APG Combobox |
| Switch (toggle) | `role="switch"`, `aria-checked` | APG Switch |
| Alert | `role="alert"`, `aria-live="assertive"` | APG Alert |
| Status | `role="status"`, `aria-live="polite"` | APG Live Region |
| Pagination | `role="navigation"`, `aria-label="Pagination"`, `aria-current="page"` | APG Landmark |
