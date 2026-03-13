# Screenshot Manifest — Daimon SaaS

> Every unique visual state across every route at desktop (1280px) and mobile (375px).
> Used by the forward loop as a Playwright screenshot task list.
> Target: 200+ screenshots minimum.
> Format: `[N] route | state | viewport | scroll`

---

## Naming Convention

All screenshot files follow: `{N:04d}_{route}_{state}_{viewport}.png`

Examples:
- `0001_landing_above-fold_desktop.png`
- `0002_landing_above-fold_mobile.png`
- `0045_dashboard_bot-online_desktop.png`

Route slugs replace `/` with `_` and strip leading underscore. Special chars removed.
`dashboard_billing` = `/dashboard/billing`, `admin_tenants_detail` = `/admin/tenants/[id]`

---

## Viewport Configurations

| Handle | Width | Height | Device Scale |
|--------|-------|--------|--------------|
| `desktop` | 1280 | 800 | 1 |
| `mobile` | 375 | 812 | 2 |

For long pages (landing, docs, changelog, about, blog), additional scroll positions are captured:
- `above-fold` — scroll 0
- `below-fold` — scroll to first full-width section below hero
- `bottom` — scroll to footer

---

## Section Index

1. [Landing Page (`/`)](#1-landing-page)
2. [Auth Pages](#2-auth-pages)
3. [Dashboard Home (`/dashboard`)](#3-dashboard-home)
4. [Integrations Page (`/dashboard/integrations`)](#4-integrations-page)
5. [Billing Page (`/dashboard/billing`)](#5-billing-page)
6. [Settings Page (`/dashboard/settings`)](#6-settings-page)
7. [Admin Panel](#7-admin-panel)
8. [Docs Pages](#8-docs-pages)
9. [Changelog (`/changelog`)](#9-changelog)
10. [About (`/about`)](#10-about)
11. [Blog (`/blog`, `/blog/[slug]`)](#11-blog)
12. [Cookie Policy (`/legal/cookies`)](#12-cookie-policy)
13. [Terms of Service (`/terms`)](#13-terms-of-service)
14. [Privacy Policy (`/privacy`)](#14-privacy-policy)
15. [Error Pages (404, 500)](#15-error-pages)
16. [Toast Notifications (global)](#16-toast-notifications)
17. [Confirmation Dialogs (global)](#17-confirmation-dialogs)

---

## 1. Landing Page

**Route:** `/`
**Layout:** Public — top nav + hero + sections + footer
**Scroll positions captured:** above-fold, social-proof, pricing, footer

- [ ] 001 | `/` | above-fold (hero visible, nav, CTA buttons) | desktop
- [ ] 002 | `/` | above-fold (hero visible, nav, CTA buttons) | mobile
- [ ] 003 | `/` | nav hamburger menu open | mobile
- [ ] 004 | `/` | how-it-works section (scroll ~50%) | desktop
- [ ] 005 | `/` | how-it-works section (scroll ~50%) | mobile
- [ ] 006 | `/` | features grid section | desktop
- [ ] 007 | `/` | features grid section | mobile
- [ ] 008 | `/` | pricing section (free + starter + pro cards) | desktop
- [ ] 009 | `/` | pricing section (free + starter + pro cards) | mobile
- [ ] 010 | `/` | pricing section — "Pro" card highlighted/active | desktop
- [ ] 011 | `/` | footer visible (all links, social) | desktop
- [ ] 012 | `/` | footer visible (all links, social) | mobile
- [ ] 013 | `/` | CTA button hover state (Get Started) | desktop
- [ ] 014 | `/` | CTA button hover state (View Docs) | desktop

**Subtotal: 14**

---

## 2. Auth Pages

**Routes:** `/login`, `/signup`, `/reset-password`, `/reset-password/confirm`
**Layout:** Centered card on white-soft bg, no nav

### 2.1 Login Page (`/login`)

- [ ] 015 | `/login` | default (empty form) | desktop
- [ ] 016 | `/login` | default (empty form) | mobile
- [ ] 017 | `/login` | email field focused | desktop
- [ ] 018 | `/login` | email field filled, password empty | desktop
- [ ] 019 | `/login` | both fields filled (ready to submit) | desktop
- [ ] 020 | `/login` | both fields filled (ready to submit) | mobile
- [ ] 021 | `/login` | submit loading state (button spinner, form disabled) | desktop
- [ ] 022 | `/login` | submit loading state (button spinner, form disabled) | mobile
- [ ] 023 | `/login` | error: "Invalid email or password." below form | desktop
- [ ] 024 | `/login` | error: "Invalid email or password." below form | mobile
- [ ] 025 | `/login` | error: "Too many attempts. Try again in 60 seconds." | desktop
- [ ] 026 | `/login` | email validation error: "Please enter a valid email address." | desktop
- [ ] 027 | `/login` | password field — show/hide toggle (eye icon, text visible) | desktop

### 2.2 Signup Page (`/signup`)

- [ ] 028 | `/signup` | default (empty form) | desktop
- [ ] 029 | `/signup` | default (empty form) | mobile
- [ ] 030 | `/signup` | all fields filled (ready to submit) | desktop
- [ ] 031 | `/signup` | all fields filled (ready to submit) | mobile
- [ ] 032 | `/signup` | submit loading state (button spinner) | desktop
- [ ] 033 | `/signup` | error: "An account with this email already exists." | desktop
- [ ] 034 | `/signup` | error: "Password must be at least 8 characters." (inline) | desktop
- [ ] 035 | `/signup` | error: "Workspace name is required." (inline) | desktop
- [ ] 036 | `/signup` | success state: "Check your email to confirm your account." | desktop
- [ ] 037 | `/signup` | success state: "Check your email to confirm your account." | mobile

### 2.3 Reset Password Request (`/reset-password`)

- [ ] 038 | `/reset-password` | default (empty form) | desktop
- [ ] 039 | `/reset-password` | default (empty form) | mobile
- [ ] 040 | `/reset-password` | email filled | desktop
- [ ] 041 | `/reset-password` | submit loading state | desktop
- [ ] 042 | `/reset-password` | success: "Reset link sent. Check your email." | desktop
- [ ] 043 | `/reset-password` | success: "Reset link sent. Check your email." | mobile
- [ ] 044 | `/reset-password` | error: "No account found with that email." | desktop

### 2.4 Reset Password Confirm (`/reset-password/confirm`)

- [ ] 045 | `/reset-password/confirm` | default (new password form) | desktop
- [ ] 046 | `/reset-password/confirm` | default (new password form) | mobile
- [ ] 047 | `/reset-password/confirm` | passwords filled | desktop
- [ ] 048 | `/reset-password/confirm` | submit loading state | desktop
- [ ] 049 | `/reset-password/confirm` | error: "Passwords do not match." | desktop
- [ ] 050 | `/reset-password/confirm` | error: "Password must be at least 8 characters." | desktop
- [ ] 051 | `/reset-password/confirm` | success: redirect to `/login?reset=success` — login with "Password updated successfully." banner | desktop
- [ ] 052 | `/reset-password/confirm` | invalid/expired token error: "This reset link has expired. Request a new one." | desktop

**Subtotal: 38 (cumulative: 52)**

---

## 3. Dashboard Home

**Route:** `/dashboard`
**Layout:** Dashboard shell (sidebar + topbar + main)
**States:** Loading skeleton, Bot online, Bot offline, Bot error, First-time user (onboarding checklist), Member role view

### 3.1 Loading State (Skeleton)

- [ ] 053 | `/dashboard` | loading skeleton (sidebar renders, main area shows shimmer cards) | desktop
- [ ] 054 | `/dashboard` | loading skeleton | mobile

### 3.2 Bot Online State

- [ ] 055 | `/dashboard` | bot online — status card green, all 4 stat cards loaded | desktop
- [ ] 056 | `/dashboard` | bot online — status card green, all 4 stat cards loaded | mobile
- [ ] 057 | `/dashboard` | bot online — sidebar nav (Dashboard active, aqua highlight) | desktop
- [ ] 058 | `/dashboard` | bot online — below fold (activity feed visible) | desktop
- [ ] 059 | `/dashboard` | bot online — below fold (activity feed visible) | mobile

### 3.3 Bot Offline State

- [ ] 060 | `/dashboard` | bot offline — status card gray/amber, no recent activity | desktop
- [ ] 061 | `/dashboard` | bot offline — status card gray/amber | mobile

### 3.4 Bot Error State

- [ ] 062 | `/dashboard` | bot error — status card red, error badge, "Reconnect" CTA | desktop
- [ ] 063 | `/dashboard` | bot error — status card red | mobile

### 3.5 First-Time User / Onboarding Checklist

- [ ] 064 | `/dashboard` | new user — onboarding checklist banner (0/5 steps completed) | desktop
- [ ] 065 | `/dashboard` | new user — onboarding checklist banner | mobile
- [ ] 066 | `/dashboard` | onboarding 1/5 (Discord connected, others pending) | desktop
- [ ] 067 | `/dashboard` | onboarding 2/5 (Discord + Anthropic key done) | desktop
- [ ] 068 | `/dashboard` | onboarding 4/5 (one step remaining) | desktop
- [ ] 069 | `/dashboard` | onboarding checklist expanded (all steps visible) | desktop
- [ ] 070 | `/dashboard` | onboarding checklist collapsed (step count summary only) | desktop

### 3.6 No Discord Connection (no bot yet)

- [ ] 071 | `/dashboard` | no Discord connection — empty state in bot status card | desktop
- [ ] 072 | `/dashboard` | no Discord connection — empty state | mobile

### 3.7 Member Role View

- [ ] 073 | `/dashboard` | member role — read-only, no admin actions visible | desktop

### 3.8 Sidebar States

- [ ] 074 | `/dashboard` | sidebar — user avatar menu open (account + signout dropdown) | desktop
- [ ] 075 | `/dashboard` | sidebar — user avatar menu open | mobile (drawer variant)
- [ ] 076 | `/dashboard` | mobile nav drawer open (full-screen overlay) | mobile

**Subtotal: 24 (cumulative: 76)**

---

## 4. Integrations Page

**Route:** `/dashboard/integrations`
**States:** Loading skeleton, All disconnected, Partial connections, All connected, OAuth in-progress (redirect), API key modal states, Error states

### 4.1 Loading State

- [ ] 077 | `/dashboard/integrations` | loading skeleton (4 service card skeletons) | desktop
- [ ] 078 | `/dashboard/integrations` | loading skeleton | mobile

### 4.2 All Disconnected (fresh tenant)

- [ ] 079 | `/dashboard/integrations` | all 4 services disconnected (4 "Connect" buttons) | desktop
- [ ] 080 | `/dashboard/integrations` | all 4 services disconnected | mobile

### 4.3 Partial Connections

- [ ] 081 | `/dashboard/integrations` | GitHub connected, others not — mixed state | desktop
- [ ] 082 | `/dashboard/integrations` | GitHub + Google connected, Linear + Toggl not | desktop

### 4.4 All Connected

- [ ] 083 | `/dashboard/integrations` | all 4 services connected (green badges, "Disconnect" buttons) | desktop
- [ ] 084 | `/dashboard/integrations` | all 4 services connected | mobile

### 4.5 Service Card States

- [ ] 085 | `/dashboard/integrations` | GitHub card — connected state (scopes, "Connected" badge, "Disconnect" button) | desktop
- [ ] 086 | `/dashboard/integrations` | GitHub card — "Connect" button hover | desktop
- [ ] 087 | `/dashboard/integrations` | Google card — expired token (amber "Reconnect" badge, reconnect button) | desktop
- [ ] 088 | `/dashboard/integrations` | Linear card — error state (red badge, error message) | desktop
- [ ] 089 | `/dashboard/integrations` | Toggl card — connected (masked key hint: "••••••••abcd1234") | desktop

### 4.6 Toggl API Key Modal

- [ ] 090 | `/dashboard/integrations` | Toggl "Connect" clicked — ApiKeyModal open (empty field) | desktop
- [ ] 091 | `/dashboard/integrations` | Toggl ApiKeyModal open | mobile
- [ ] 092 | `/dashboard/integrations` | Toggl ApiKeyModal — key entered, validating state (spinner in input) | desktop
- [ ] 093 | `/dashboard/integrations` | Toggl ApiKeyModal — validation success (green checkmark, "Save" button enabled) | desktop
- [ ] 094 | `/dashboard/integrations` | Toggl ApiKeyModal — validation error: "Invalid API key. Please check and try again." | desktop
- [ ] 095 | `/dashboard/integrations` | Toggl ApiKeyModal — save loading state | desktop

### 4.7 Disconnect Confirmation

- [ ] 096 | `/dashboard/integrations` | "Disconnect" clicked — ConfirmDialog open ("Disconnect GitHub?") | desktop
- [ ] 097 | `/dashboard/integrations` | ConfirmDialog open | mobile
- [ ] 098 | `/dashboard/integrations` | ConfirmDialog — loading (confirming disconnect) | desktop

### 4.8 Member Role (read-only)

- [ ] 099 | `/dashboard/integrations` | member role — all connect/disconnect buttons hidden | desktop

### 4.9 OAuth Redirect Interstitial

- [ ] 100 | `/dashboard/integrations` | OAuth loading page (after clicking "Connect GitHub" — redirect in progress) | desktop

**Subtotal: 24 (cumulative: 100)**

---

## 5. Billing Page

**Route:** `/dashboard/billing`
**States:** Loading skeleton, Free plan, Starter plan, Pro plan, Trial, Cancelled, Member role (read-only), Checkout redirect, Post-checkout success, API key states

### 5.1 Loading State

- [ ] 101 | `/dashboard/billing` | loading skeleton (plan card + 2 API key rows skeleton) | desktop
- [ ] 102 | `/dashboard/billing` | loading skeleton | mobile

### 5.2 Free Plan State

- [ ] 103 | `/dashboard/billing` | free plan — "Free" badge, "Upgrade to Starter" CTA, plan comparison below | desktop
- [ ] 104 | `/dashboard/billing` | free plan | mobile
- [ ] 105 | `/dashboard/billing` | free plan — plan comparison grid (Free / Starter / Pro) | desktop
- [ ] 106 | `/dashboard/billing` | free plan — plan comparison grid | mobile

### 5.3 Starter Plan State

- [ ] 107 | `/dashboard/billing` | Starter plan — "Starter" badge, next billing date, "Upgrade to Pro" + "Manage Billing" CTAs | desktop
- [ ] 108 | `/dashboard/billing` | Starter plan | mobile

### 5.4 Pro Plan State

- [ ] 109 | `/dashboard/billing` | Pro plan — "Pro" badge, next billing date, "Manage Billing" CTA only | desktop
- [ ] 110 | `/dashboard/billing` | Pro plan | mobile

### 5.5 Trial State

- [ ] 111 | `/dashboard/billing` | trial active — "Trial" badge, trial end date, days remaining counter | desktop
- [ ] 112 | `/dashboard/billing` | trial expiring soon (≤3 days) — amber warning banner | desktop
- [ ] 113 | `/dashboard/billing` | trial expired — "Upgrade required" red banner, CTAs | desktop

### 5.6 Cancelled / Past-Due States

- [ ] 114 | `/dashboard/billing` | cancel_at_period_end: true — "Cancels on [date]" warning, "Keep Plan" CTA | desktop
- [ ] 115 | `/dashboard/billing` | past_due — red "Payment Failed" banner, "Update Payment Method" CTA | desktop
- [ ] 116 | `/dashboard/billing` | subscription cancelled / unpaid — read-only, "Reactivate" CTA | desktop

### 5.7 Post-Checkout Success

- [ ] 117 | `/dashboard/billing` | `?success=1` — success banner: "You're now on [Plan]. Welcome!" | desktop
- [ ] 118 | `/dashboard/billing` | `?success=1` | mobile
- [ ] 119 | `/dashboard/billing` | `?cancelled=1` — info banner: "Checkout cancelled. No charge was made." | desktop

### 5.8 API Keys Section

- [ ] 120 | `/dashboard/billing` | API keys section — Anthropic key missing, OpenAI key missing (both empty states) | desktop
- [ ] 121 | `/dashboard/billing` | API keys section | mobile
- [ ] 122 | `/dashboard/billing` | Anthropic key saved (masked hint "sk-ant-••••••••1234"), "Rotate" + "Delete" buttons | desktop
- [ ] 123 | `/dashboard/billing` | Anthropic key "Rotate" clicked — inline paste field open | desktop
- [ ] 124 | `/dashboard/billing` | Anthropic key paste field — key entered, validating (spinner) | desktop
- [ ] 125 | `/dashboard/billing` | Anthropic key validation success (green checkmark, "Save" active) | desktop
- [ ] 126 | `/dashboard/billing` | Anthropic key validation error: "Invalid key. Check your Anthropic dashboard." | desktop
- [ ] 127 | `/dashboard/billing` | Anthropic key "Delete" — ConfirmDialog open | desktop
- [ ] 128 | `/dashboard/billing` | both Anthropic + OpenAI keys saved | desktop

### 5.9 Member Role (read-only)

- [ ] 129 | `/dashboard/billing` | member role — all buttons hidden, plan info visible | desktop

### 5.10 Stripe Checkout Interstitial

- [ ] 130 | `/dashboard/billing` | "Upgrade to Starter" clicked — loading state (button spinner, redirect in progress) | desktop

**Subtotal: 30 (cumulative: 130)**

---

## 6. Settings Page

**Route:** `/dashboard/settings`
**States:** Loading skeleton, All sections (owner view), Admin role view, Member role view, Each section's edit mode, Danger zone states

### 6.1 Loading State

- [ ] 131 | `/dashboard/settings` | loading skeleton (5 section card skeletons) | desktop
- [ ] 132 | `/dashboard/settings` | loading skeleton | mobile

### 6.2 Owner View (full access)

- [ ] 133 | `/dashboard/settings` | owner view — all 5 sections visible (above fold) | desktop
- [ ] 134 | `/dashboard/settings` | owner view — all 5 sections | mobile
- [ ] 135 | `/dashboard/settings` | owner view — below fold (Danger Zone visible, red border) | desktop

### 6.3 Member Role View

- [ ] 136 | `/dashboard/settings` | member role — Danger Zone section hidden, edit buttons disabled | desktop
- [ ] 137 | `/dashboard/settings` | member role — disabled button tooltip: "Only the workspace owner can perform this action." | desktop

### 6.4 Workspace Section

- [ ] 138 | `/dashboard/settings` | workspace section — default (name display, workspace ID, creation date) | desktop
- [ ] 139 | `/dashboard/settings` | workspace section — "Edit Name" clicked (inline text input with Save/Cancel) | desktop
- [ ] 140 | `/dashboard/settings` | workspace name — validation error: "Workspace name must be 2–50 characters." | desktop
- [ ] 141 | `/dashboard/settings` | workspace name — save loading state | desktop

### 6.5 Discord Connection Section

- [ ] 142 | `/dashboard/settings` | Discord section — no connection (empty state: "No Discord bot connected") | desktop
- [ ] 143 | `/dashboard/settings` | Discord section — no connection | mobile
- [ ] 144 | `/dashboard/settings` | Discord section — connection form open (token + guild ID fields) | desktop
- [ ] 145 | `/dashboard/settings` | Discord section — fields filled | desktop
- [ ] 146 | `/dashboard/settings` | Discord section — validating token (spinner) | desktop
- [ ] 147 | `/dashboard/settings` | Discord section — validation success (green "✓ Bot found: YourBotName in YourServer") | desktop
- [ ] 148 | `/dashboard/settings` | Discord section — validation error: "Invalid bot token. Check your Discord Developer Portal." | desktop
- [ ] 149 | `/dashboard/settings` | Discord section — connection saved (connected badge, token masked) | desktop
- [ ] 150 | `/dashboard/settings` | Discord section — connection saved | mobile
- [ ] 151 | `/dashboard/settings` | Discord section — "Remove Connection" ConfirmDialog open | desktop
- [ ] 152 | `/dashboard/settings` | Discord section — bot token field with "Show/Hide" toggle (value revealed) | desktop

### 6.6 Team Members Section

- [ ] 153 | `/dashboard/settings` | team members — 1 member (owner, current user) | desktop
- [ ] 154 | `/dashboard/settings` | team members — 3 members (owner + 2 others with roles) | desktop
- [ ] 155 | `/dashboard/settings` | team members — invite button (future, greyed out with "Coming soon" tooltip) | desktop

### 6.7 Account Section

- [ ] 156 | `/dashboard/settings` | account section — default (display name, email read-only) | desktop
- [ ] 157 | `/dashboard/settings` | account section — editing display name (inline input) | desktop
- [ ] 158 | `/dashboard/settings` | account section — change password form open (current + new + confirm fields) | desktop
- [ ] 159 | `/dashboard/settings` | change password — validation error: "Current password is incorrect." | desktop
- [ ] 160 | `/dashboard/settings` | change password — success toast + form reset | desktop

### 6.8 Danger Zone Section

- [ ] 161 | `/dashboard/settings` | danger zone — default (red card, "Delete Workspace" button) | desktop
- [ ] 162 | `/dashboard/settings` | danger zone — "Delete Workspace" clicked — ConfirmDialog with workspace name confirmation input | desktop
- [ ] 163 | `/dashboard/settings` | danger zone ConfirmDialog — workspace name typed (matches, button enabled) | desktop
- [ ] 164 | `/dashboard/settings` | danger zone ConfirmDialog — deleting state (spinner) | desktop

**Subtotal: 34 (cumulative: 164)**

---

## 7. Admin Panel

**Routes:** `/admin/tenants`, `/admin/tenants/[id]`, `/admin/audit-log`
**Auth:** Platform admin only (`is_admin: true` JWT claim)
**States:** Loading, list states, detail states, action modals, audit log

### 7.1 Admin Auth Guard

- [ ] 165 | `/admin` | unauthorized (non-admin user) — 403 page with "Access Denied" message | desktop
- [ ] 166 | `/admin` | unauthorized | mobile

### 7.2 Tenant List (`/admin/tenants`)

- [ ] 167 | `/admin/tenants` | loading skeleton (table rows skeleton) | desktop
- [ ] 168 | `/admin/tenants` | populated list — 10 tenants, all statuses (active, suspended, cancelled, trial) | desktop
- [ ] 169 | `/admin/tenants` | populated list | mobile
- [ ] 170 | `/admin/tenants` | search active — filtered by name/email | desktop
- [ ] 171 | `/admin/tenants` | no results — empty state: "No tenants match your search." | desktop
- [ ] 172 | `/admin/tenants` | stats bar (total tenants, active, trial, revenue metrics) | desktop
- [ ] 173 | `/admin/tenants` | pagination — page 2 of 5 active | desktop

### 7.3 Tenant Detail (`/admin/tenants/[id]`)

- [ ] 174 | `/admin/tenants/[id]` | loading skeleton | desktop
- [ ] 175 | `/admin/tenants/[id]` | full detail — active tenant (plan, Discord status, integrations, billing) | desktop
- [ ] 176 | `/admin/tenants/[id]` | full detail | mobile
- [ ] 177 | `/admin/tenants/[id]` | tenant suspended — "Suspended" badge, "Unsuspend" action | desktop
- [ ] 178 | `/admin/tenants/[id]` | impersonate button + confirmation dialog | desktop
- [ ] 179 | `/admin/tenants/[id]` | override plan dropdown open (Free / Starter / Pro) | desktop
- [ ] 180 | `/admin/tenants/[id]` | override plan confirm dialog | desktop
- [ ] 181 | `/admin/tenants/[id]` | suspend confirmation dialog | desktop
- [ ] 182 | `/admin/tenants/[id]` | activity log tab (tool calls, messages timeline) | desktop

### 7.4 Audit Log (`/admin/audit-log`)

- [ ] 183 | `/admin/audit-log` | loading skeleton | desktop
- [ ] 184 | `/admin/audit-log` | populated — 20 recent entries (impersonations, plan overrides, suspensions) | desktop
- [ ] 185 | `/admin/audit-log` | populated | mobile
- [ ] 186 | `/admin/audit-log` | filtered by action type (dropdown active) | desktop

**Subtotal: 22 (cumulative: 186)**

---

## 8. Docs Pages

**Routes:** `/docs/quick-start`, `/docs/tool-reference/*`, `/docs/faq`, `/docs/billing`
**Layout:** Docs shell — fixed left sidebar + scrollable content
**States:** Loading (static content, minimal states), sidebar nav active states, mobile navigation

### 8.1 Docs Layout / Sidebar

- [ ] 187 | `/docs/quick-start` | docs layout — sidebar visible, quick start active | desktop
- [ ] 188 | `/docs/quick-start` | docs layout | mobile (sidebar hidden, hamburger nav)
- [ ] 189 | `/docs/quick-start` | mobile docs sidebar open (drawer) | mobile

### 8.2 Quick Start Guide

- [ ] 190 | `/docs/quick-start` | above fold (step 1 visible, progress steps nav) | desktop
- [ ] 191 | `/docs/quick-start` | above fold | mobile
- [ ] 192 | `/docs/quick-start` | mid-page (step 3–4 visible) | desktop
- [ ] 193 | `/docs/quick-start` | bottom (step 5 + "Next Steps" CTA) | desktop

### 8.3 Tool Reference Pages

- [ ] 194 | `/docs/tool-reference/discord` | discord tools section (above fold) | desktop
- [ ] 195 | `/docs/tool-reference/discord` | above fold | mobile
- [ ] 196 | `/docs/tool-reference/toggl` | above fold (34 tools, collapsed/expanded state) | desktop
- [ ] 197 | `/docs/tool-reference/toggl` | a tool entry expanded (params + example output visible) | desktop
- [ ] 198 | `/docs/tool-reference/linear` | linear tools section + "Remote MCP" badge | desktop

### 8.4 FAQ Page

- [ ] 199 | `/docs/faq` | above fold (accordion items all collapsed) | desktop
- [ ] 200 | `/docs/faq` | accordion — 1 question expanded | desktop
- [ ] 201 | `/docs/faq` | above fold | mobile

### 8.5 Billing & Plans Docs

- [ ] 202 | `/docs/billing` | above fold (plan comparison table) | desktop
- [ ] 203 | `/docs/billing` | above fold | mobile

**Subtotal: 17 (cumulative: 203)**

---

## 9. Changelog

**Route:** `/changelog`
**Layout:** Public layout (top nav + footer), max-w-3xl centered

- [ ] 204 | `/changelog` | above fold (page header + first 2 release entries) | desktop
- [ ] 205 | `/changelog` | above fold | mobile
- [ ] 206 | `/changelog` | mid-page (release entries list) | desktop
- [ ] 207 | `/changelog` | bottom (footer visible) | desktop

**Subtotal: 4 (cumulative: 207)**

---

## 10. About

**Route:** `/about`
**Layout:** Public layout (top nav + footer)

- [ ] 208 | `/about` | above fold (hero section with mission statement) | desktop
- [ ] 209 | `/about` | above fold | mobile
- [ ] 210 | `/about` | team / company section | desktop
- [ ] 211 | `/about` | bottom (footer visible) | desktop

**Subtotal: 4 (cumulative: 211)**

---

## 11. Blog

**Routes:** `/blog` (index), `/blog/[slug]` (post)

### 11.1 Blog Index

- [ ] 212 | `/blog` | above fold (page header + post grid, ≥1 post) | desktop
- [ ] 213 | `/blog` | above fold | mobile
- [ ] 214 | `/blog` | empty state (no posts yet: "Blog coming soon." with muted text) | desktop
- [ ] 215 | `/blog` | bottom (footer visible) | desktop

### 11.2 Blog Post

- [ ] 216 | `/blog/first-post` | above fold (title, author, date, hero image placeholder) | desktop
- [ ] 217 | `/blog/first-post` | above fold | mobile
- [ ] 218 | `/blog/first-post` | mid-post content | desktop
- [ ] 219 | `/blog/first-post` | bottom (footer, back to blog link) | desktop
- [ ] 220 | `/blog/nonexistent-slug` | 404 not found for blog post | desktop

**Subtotal: 9 (cumulative: 220)**

---

## 12. Cookie Policy

**Route:** `/legal/cookies`
**Layout:** Public layout (top nav + footer), max-w-3xl centered

- [ ] 221 | `/legal/cookies` | above fold (page header + first section) | desktop
- [ ] 222 | `/legal/cookies` | above fold | mobile
- [ ] 223 | `/legal/cookies` | bottom (all cookie table rows visible, footer) | desktop

**Subtotal: 3 (cumulative: 223)**

---

## 13. Terms of Service

**Route:** `/terms`
**Layout:** Public layout (top nav + footer), max-w-3xl centered

- [ ] 224 | `/terms` | above fold (h1 + intro paragraph) | desktop
- [ ] 225 | `/terms` | above fold | mobile
- [ ] 226 | `/terms` | mid-page (sections 3–6 visible) | desktop
- [ ] 227 | `/terms` | bottom (footer) | desktop

**Subtotal: 4 (cumulative: 227)**

---

## 14. Privacy Policy

**Route:** `/privacy`
**Layout:** Public layout (top nav + footer), max-w-3xl centered

- [ ] 228 | `/privacy` | above fold (h1 + data collection section) | desktop
- [ ] 229 | `/privacy` | above fold | mobile
- [ ] 230 | `/privacy` | mid-page (sections 3–6 visible) | desktop
- [ ] 231 | `/privacy` | bottom (footer) | desktop

**Subtotal: 4 (cumulative: 231)**

---

## 15. Error Pages

**Routes:** Not found (any 404), Internal server error (500), Unauthorized (403 admin)

- [ ] 232 | `/*` | 404 page (custom Not Found page with "Go Home" CTA) | desktop
- [ ] 233 | `/*` | 404 page | mobile
- [ ] 234 | `/*` | 500 page (custom Error page with "Try Again" CTA) | desktop
- [ ] 235 | `/*` | 500 page | mobile

**Subtotal: 4 (cumulative: 235)**

---

## 16. Toast Notifications (Global)

Toasts appear in the top-right corner (desktop) or top-center (mobile), `z-index: 9999`. Screenshot by triggering the relevant action on each page.

- [ ] 236 | `/dashboard` | toast: success — "Bot reconnected successfully." (green, ✓ icon) | desktop
- [ ] 237 | `/dashboard` | toast: success | mobile
- [ ] 238 | `/dashboard/integrations` | toast: success — "GitHub connected." (green) | desktop
- [ ] 239 | `/dashboard/integrations` | toast: error — "Failed to disconnect. Please try again." (red, ✕ icon) | desktop
- [ ] 240 | `/dashboard/integrations` | toast: info — "Reconnecting to GitHub..." (blue, spinner) | desktop
- [ ] 241 | `/dashboard/billing` | toast: success — "Anthropic API key saved." | desktop
- [ ] 242 | `/dashboard/billing` | toast: success — "API key deleted." | desktop
- [ ] 243 | `/dashboard/billing` | toast: error — "Failed to save key. Please try again." | desktop
- [ ] 244 | `/dashboard/settings` | toast: success — "Workspace name updated." | desktop
- [ ] 245 | `/dashboard/settings` | toast: success — "Discord connection saved." | desktop
- [ ] 246 | `/dashboard/settings` | toast: success — "Password changed." | desktop
- [ ] 247 | `/dashboard/settings` | toast: error — "Failed to save changes." | desktop
- [ ] 248 | any page | toast: warning — "Your session has expired. Please log in again." (amber) | desktop
- [ ] 249 | any page | toast: stacked — 2 simultaneous toasts visible | desktop

**Subtotal: 14 (cumulative: 249)**

---

## 17. Confirmation Dialogs (Global)

ConfirmDialogs are modals that block interaction. Screenshot at point of dialog open + loading state.

- [ ] 250 | `/dashboard/integrations` | ConfirmDialog — "Disconnect GitHub?" (open) | desktop
- [ ] 251 | `/dashboard/integrations` | ConfirmDialog — "Disconnect GitHub?" | mobile
- [ ] 252 | `/dashboard/integrations` | ConfirmDialog — loading (Confirm button spinner) | desktop
- [ ] 253 | `/dashboard/billing` | ConfirmDialog — "Delete Anthropic API Key?" (open) | desktop
- [ ] 254 | `/dashboard/billing` | ConfirmDialog — loading | desktop
- [ ] 255 | `/dashboard/settings` | ConfirmDialog — "Remove Discord Connection?" (open) | desktop
- [ ] 256 | `/dashboard/settings` | ConfirmDialog — "Delete Workspace?" with name-confirmation input (empty) | desktop
- [ ] 257 | `/dashboard/settings` | ConfirmDialog — name-confirmation input filled (button enabled) | desktop
- [ ] 258 | `/dashboard/settings` | ConfirmDialog — deleting state | desktop
- [ ] 259 | `/admin/tenants/[id]` | ConfirmDialog — "Suspend tenant?" (open) | desktop
- [ ] 260 | `/admin/tenants/[id]` | ConfirmDialog — "Impersonate tenant?" with warning text | desktop

**Subtotal: 11 (cumulative: 260)**

---

## Summary

| Section | Route(s) | States | Desktop | Mobile | Total |
|---------|----------|--------|---------|--------|-------|
| 1. Landing | `/` | 7 | 10 | 4 | 14 |
| 2. Auth | `/login`, `/signup`, `/reset-password*` | 38 | 29 | 9 | 38 |
| 3. Dashboard | `/dashboard` | 10 | 19 | 5 | 24 |
| 4. Integrations | `/dashboard/integrations` | 12 | 20 | 4 | 24 |
| 5. Billing | `/dashboard/billing` | 15 | 26 | 4 | 30 |
| 6. Settings | `/dashboard/settings` | 20 | 28 | 6 | 34 |
| 7. Admin | `/admin/**` | 11 | 19 | 3 | 22 |
| 8. Docs | `/docs/**` | 10 | 14 | 3 | 17 |
| 9. Changelog | `/changelog` | 2 | 3 | 1 | 4 |
| 10. About | `/about` | 2 | 3 | 1 | 4 |
| 11. Blog | `/blog`, `/blog/[slug]` | 5 | 7 | 2 | 9 |
| 12. Cookie Policy | `/legal/cookies` | 2 | 2 | 1 | 3 |
| 13. ToS | `/terms` | 2 | 3 | 1 | 4 |
| 14. Privacy | `/privacy` | 2 | 3 | 1 | 4 |
| 15. Error Pages | `404`, `500` | 2 | 2 | 2 | 4 |
| 16. Toasts | (global overlays) | 9 | 13 | 1 | 14 |
| 17. Confirm Dialogs | (global modals) | 11 | 11 | 0 | 11 |
| **TOTAL** | | **162** | **212** | **48** | **260** |

**Total screenshots: 260** (exceeds 200-screenshot minimum).

---

## Action Sequences for Each Viewport

The Playwright test runner must execute these sequences to trigger each state. See [`playwright-verification.md`](./playwright-verification.md) for full test code.

### Common Setup

```typescript
// Base URLs
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

// Test user seeds (from supabase/seed.sql)
const TEST_USERS = {
  owner:   { email: 'owner@test.daimon.app',  password: 'testpass1234' },
  admin:   { email: 'admin@test.daimon.app',  password: 'testpass1234' },
  member:  { email: 'member@test.daimon.app', password: 'testpass1234' },
  platformAdmin: { email: 'platform@test.daimon.app', password: 'testpass1234' },
};

// Tenants (seeded states)
const TEST_TENANTS = {
  onboarding:     'tenant_id_onboarding',      // no Discord, no keys
  activeFree:     'tenant_id_active_free',      // free plan, Discord connected, all integrations
  activeStarter:  'tenant_id_active_starter',   // Starter plan, full setup
  activePro:      'tenant_id_active_pro',       // Pro plan, full setup
  trial:          'tenant_id_trial',            // trial active (3 days left)
  suspended:      'tenant_id_suspended',        // suspended tenant
  cancelled:      'tenant_id_cancelled',        // cancelled subscription
};
```

### Scroll Positions

```typescript
// How to scroll to specific sections on the landing page
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.35)); // How it works
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.65)); // Pricing
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));        // Footer
```

### Triggering Loading States

```typescript
// Intercept Supabase fetch to delay response — shows skeleton
await page.route('**/rest/v1/**', async route => {
  await new Promise(r => setTimeout(r, 5000)); // 5s delay
  await route.continue();
});
await page.goto(`${BASE_URL}/dashboard`);
await page.screenshot({ path: 'screenshots/0053_dashboard_loading-skeleton_desktop.png' });
```

### Triggering Toast Notifications

```typescript
// Toast state: trigger action, wait for toast to appear, screenshot immediately
await page.click('[data-testid="disconnect-github"]');
await page.click('[data-testid="confirm-dialog-confirm"]');
await page.waitForSelector('[data-testid="toast"]', { timeout: 3000 });
await page.screenshot({ path: 'screenshots/0238_integrations_toast-success-github-connected_desktop.png' });
```

---

## File Output Structure

All screenshots saved to: `tests/screenshots/` (relative to project root)

```
tests/screenshots/
├── 0001_landing_above-fold_desktop.png
├── 0002_landing_above-fold_mobile.png
├── ...
├── 0260_admin_tenants_detail_confirm-impersonate_desktop.png
└── manifest.json   ← machine-readable index: { id, path, route, state, viewport, status }
```

`manifest.json` structure:

```json
[
  {
    "id": 1,
    "path": "tests/screenshots/0001_landing_above-fold_desktop.png",
    "route": "/",
    "state": "above-fold",
    "viewport": "desktop",
    "status": "pending"
  }
]
```

`status` values: `"pending"` → `"captured"` → `"approved"` (set by visual regression baseline approval).
