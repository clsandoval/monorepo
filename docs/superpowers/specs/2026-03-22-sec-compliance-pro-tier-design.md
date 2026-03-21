# SEC Compliance Navigator — Pro Tier Design

## Problem

The MVP serves individual corporation owners checking their own compliance status. But the higher-value market is **accountants and bookkeepers** managing compliance for multiple client corporations. They currently track filing deadlines, penalty computations, and remediation status across 10-50+ corporations using spreadsheets. Each client consultation requires manually re-computing penalties and assembling status reports.

## Solution

A Pro tier that gives accountants a portfolio dashboard, branded client-facing reports, and batch corporation onboarding — all built on top of the existing computation engine and wizard UI.

## Primary Persona

**The accountant/bookkeeper** managing SEC compliance for multiple client corporations. Secondary personas (corporation owners managing 1-3 corps, law firms handling reinstatement cases) are served but the accountant drives design decisions.

## Architecture

**Approach: Same app, role-based routing.** Single Next.js deploy, single Supabase project. Auth determines role (free vs pro). Free users get the existing single-corp flow. Pro users get the dashboard experience. The computation engine is shared — it doesn't care whether it's called for one corp or fifty.

### Route Structure

```
Public (no auth):
  /                    Landing page (existing)
  /wizard              4-step wizard (existing)
  /results             Penalty results (existing)
  /pro                 Pro landing/pricing page (new)
  /login               Login (existing)
  /signup              Free signup (existing)

Free (authenticated, role=free):
  /remediation         Single-corp remediation (existing)

Pro (authenticated, role=pro):
  /pro/signup          Pro signup — creates user + organization (new)
  /dashboard           Portfolio overview (new)
  /dashboard/[corpId]  Corporation detail (new)
  /reports             Report history (new)
  /settings            Organization settings (new)
  /settings/billing    Subscription management (new)
```

Pro users can still access `/wizard` and `/results` — the wizard is how they add corporations. When a Pro user completes the wizard, results save to their organization instead of prompting signup.

## Data Model

### New Tables

**`organizations`**
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `name` | text | Practice/firm name |
| `owner_id` | uuid | FK → auth.users |
| `logo_url` | text | Supabase Storage path, nullable |
| `plan` | enum | solo / practice / firm |
| `subscription_status` | enum | trialing / active / past_due / unpaid / canceled |
| `paymongo_customer_id` | text | nullable |
| `paymongo_subscription_id` | text | nullable |
| `corp_limit` | int | 5 / 25 / 100 based on plan |
| `trial_ends_at` | timestamptz | 14 days from creation |
| `current_period_ends_at` | timestamptz | synced from PayMongo webhook |
| `created_at` | timestamptz | |

**`organization_members`**
| Column | Type | Notes |
|--------|------|-------|
| `organization_id` | uuid | FK → organizations |
| `user_id` | uuid | FK → auth.users |
| `role` | enum | owner / member |

Single-seat at launch (owner only). Table exists to avoid migration when multi-seat is added later. RLS policies for `member` role deferred — only `owner` policies at launch.

**`reports`**
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `corporation_id` | uuid | FK → corporations |
| `organization_id` | uuid | FK → organizations |
| `generated_at` | timestamptz | |
| `report_type` | enum | compliance_summary |
| `storage_path` | text | Supabase Storage ref |

### Changes to Existing Tables

**`users` (Supabase auth.users metadata)**
- Add `role`: enum (free / pro). Default: free. Checked by middleware for routing.

**`corporations`**
- Add `organization_id`: uuid, nullable FK → organizations. Null for free users, set for pro users.
- Add `name`: text, nullable. Free users don't need this (single corp). Pro users need it to distinguish corps in the portfolio. For Pro users, the wizard gets a "Corporation Name" text field added to Step 1 (corporation type step). For free users, the field is hidden.

### RLS Updates

- Pro users can read/write corporations where `organization_id` matches their org
- Reports scoped to organization
- Organization members can read org data; only owner can modify org settings

## Pro Dashboard

### Summary Stats (top row, 4 cards)

| Card | Value | Subtext |
|------|-------|---------|
| Total Corporations | count | "of N limit" |
| Total Penalty Exposure | sum of all penalties | "across all corps" |
| Need Attention | corps with filings due within 60 days | "filings due within 60 days" |
| Compliant | count with Active status | "of N corporations" |

### Corporation Table

Filterable by status tabs: All / Delinquent / Suspended / Active / Revoked.

| Column | Content |
|--------|---------|
| Corporation | Name (bold, high contrast) |
| Type | Stock / Non-Stock / OPC |
| Status | Color-coded badge |
| Penalties | Total, colored by severity |
| Next Deadline | Next filing due date, amber when within 60 days |
| Actions | View (→ detail page) · Report (→ generate PDF) |

Action buttons: "+ Add Corporation" (opens wizard), "Import CSV" (opens import modal).

Sortable by any column. Paginated if > 25 rows.

### Corporation Detail Page

Merges the existing results page and remediation page into a single Pro view:

- **Header:** Corp name, type, registration date, status badge
- **Compliance Timeline** — existing hero visualization, reused as-is
- **Penalty Table** — existing itemized breakdown, reused as-is
- **Remediation Section** — existing cost estimate, step guide, document checklist (no auth gate for Pro)
- **"Generate Report" button** — produces branded PDF
- **"Edit Filing History" button** — opens wizard step 3 in a modal overlay, pre-filled with current filing data. On save, recomputes penalties and refreshes the detail page without navigating away.

No new computation logic. Composes existing components with Pro-specific layout.

## Branded PDF Reports

### Purpose

Client-facing deliverable the accountant hands to their client. Justifies the accountant's fee by presenting a professional compliance assessment.

### Contents

1. **Cover page** — accountant's practice name + logo (from org settings), corporation name, date
2. **Compliance Summary** — status badge, risk level, plain-language paragraph summarizing the situation
3. **Compliance Timeline** — the horizontal visualization rendered as static SVG for PDF
4. **Penalty Breakdown** — itemized penalty table (year × report type × offense → amount)
5. **Reinstatement Cost Estimate** — petition fee + penalties + publication + professional fees
6. **Recommended Next Steps** — ordered remediation actions with required documents
7. **Legal Disclaimer** — informational only, not legal advice
8. **Footer** — "Generated by SEC Compliance Navigator" + date

### Implementation

- Server-side PDF generation using `@react-pdf/renderer` (pure Node.js, no headless browser dependency — lighter for Fly.io deployment). Note: the compliance timeline visualization will need a dedicated `@react-pdf` reimplementation using its SVG primitives — the existing React/DOM component cannot be reused directly.
- Generated PDFs stored in Supabase Storage, linked to `reports` table
- Report history preserved — accountant can show client progress over time ("here vs 3 months ago")

### Customization (launch)

- Practice name + logo upload in org settings
- These appear on cover page
- One professional template, no custom colors/themes at launch

## CSV Import

### Template Columns

| Column | Required | Notes |
|--------|----------|-------|
| `corporation_name` | Yes | |
| `corp_type` | Yes | stock / non-stock / OPC |
| `incorporation_date` | Yes | YYYY-MM-DD or YYYY |
| `re_bracket` | No | Defaults to unknown |
| `sec_registration_number` | No | |

### Flow

1. Click "Import CSV" on dashboard
2. Modal: download template link + file upload dropzone
3. Parse + validate, show preview table with row-level errors
4. Accountant proceeds with valid rows (skips errors) or fixes and re-uploads
5. Valid rows create corporation records linked to org
6. Success summary: "N imported, M skipped"
7. Imported corps show "Filing history needed" indicator on dashboard
8. Accountant enters filing history per-corp via existing wizard step 3

No filing history in CSV. Corp details only.

### Limits

- CSV import respects plan corp limit
- If import would exceed limit: "This import would add N corporations but you only have M slots remaining. [Upgrade plan]"

## Billing & Subscription — PayMongo

### Plan Tiers

| Plan | Corp Limit | Price |
|------|-----------|-------|
| Solo | 5 | ₱999/mo |
| Practice | 25 | ₱2,499/mo |
| Firm | 100 | ₱4,999/mo |

### PayMongo Integration

PayMongo's native Subscriptions API handles recurring billing:
- 3 Plan objects created once in PayMongo (solo/practice/firm)
- On subscribe: create PayMongo Customer + Subscription → first invoice auto-generated → user pays within 24hrs
- Subsequent invoices auto-generated and auto-debited
- Payment methods: **card + Maya only** (PayMongo subscription limitation — GCash only supports one-time payments)
- Direct HTTP calls to PayMongo REST API (Basic Auth + JSON) — official Node SDK is poorly maintained

### Trial Flow

PayMongo has no native trial support. Trials are handled entirely in app logic:

1. Pro signup creates organization with `subscription_status: trialing`, `trial_ends_at: now + 14 days`
2. Full functionality during trial
3. Dashboard banner: "X days left in your free trial. [Subscribe now]"
4. On expiry: dashboard goes read-only (can view existing data, can't add corps / generate reports / import CSV)
5. Banner: "Your trial has ended. [Subscribe to continue]"
6. No PayMongo involvement until user subscribes

### Webhook Endpoint

**Route:** `POST /api/webhooks/paymongo`

- Verify webhook signature using the webhook's `secret_key` (provided when webhook is created via PayMongo API)
- Subscribe to events: `subscription.invoice.paid`, `subscription.invoice.payment_failed`, `subscription.past_due`, `subscription.unpaid`, `subscription.updated`
- Webhook registered once during initial PayMongo setup (manual or seed script)
- PayMongo does not re-send missed events — implement a daily reconciliation cron that checks subscription status via PayMongo API as a fallback

### Subscription Lifecycle

| Event | Action |
|-------|--------|
| User subscribes | Create PayMongo Customer + Subscription, update org status to `active` |
| `subscription.invoice.paid` (webhook) | Update `current_period_ends_at` |
| `subscription.invoice.payment_failed` (webhook) | Set status to `past_due`, show banner |
| `subscription.past_due` → 7 days with no payment (app logic) | Set status to `unpaid`, go read-only |
| User cancels | Cancel PayMongo Subscription, set status to `canceled` |
| Plan change | PayMongo `change plan` API, takes effect next billing cycle |

### Billing Settings Page (`/settings/billing`)

- Current plan + status
- Corp usage ("17 of 25")
- Change plan (upgrade/downgrade — takes effect next cycle, no proration). Downgrade blocked if current corp count exceeds the target plan's limit: "You have N corporations but the Solo plan allows 5. Remove corporations before downgrading."
- Update payment method
- Cancel subscription
- Built in-app (PayMongo has no customer portal)

### Corp Limit Enforcement

- Checked on "Add Corporation" and CSV import
- At limit: "You've reached your plan's limit of N corporations. [Upgrade plan]"
- No enforcement on compute/report generation — bill by corp count only

### Fees (reference)

- Cards: 3.125% + ₱13.39 per transaction
- Maya: 1.79% per transaction
- No monthly platform fee

## Pro Signup Flow

1. User visits `/pro` — sees pricing page with 3 tiers + "Start 14-day free trial" CTA
2. `/pro/signup` — collects: email, password, organization name. Google OAuth also supported (org name collected on next screen after OAuth). Logo upload deferred to `/settings` — not part of signup.
3. Creates user (role=pro) + organization (plan=solo default, status=trialing, trial_ends_at=now+14d) + organization_member (role=owner)
4. Redirect to `/dashboard` — full functionality, trial banner showing
5. When ready to subscribe: `/settings/billing` → select plan → PayMongo Checkout → first invoice → paid → active

**Note:** This spec supersedes the MVP spec's billing model (which described hybrid billing with credits). The flat tier pricing defined here is the canonical billing model.

## Explicitly Out of Scope

- Email/push notifications
- Document upload / OCR pre-fill
- Multi-seat organizations (table exists, feature deferred)
- Foreign corporation support
- Custom report templates / themes
- API access for third-party integrations
- In-app notification center
- GCash recurring billing
- Proration on mid-cycle plan changes
- Pause/resume subscription
