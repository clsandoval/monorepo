# SEC Compliance Navigator — Pro Tier Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Pro tier for accountants/bookkeepers to manage multiple corporations with a portfolio dashboard, branded PDF reports, CSV import, and PayMongo subscription billing.

**Architecture:** Same Next.js app, role-based routing via Supabase auth user metadata. Pro users get a separate page tree (`/dashboard`, `/reports`, `/settings`) while sharing the computation engine and wizard. Single Supabase project, single Fly.io deploy.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS 4, Supabase (auth + DB + storage), @react-pdf/renderer, PayMongo REST API, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-03-22-sec-compliance-pro-tier-design.md`

**Branch:** `feature/sec-compliance-navigator` (build on existing MVP)

**Design System (existing):**
- Fonts: `font-display` (Newsreader serif), `font-body` (Public Sans)
- Colors: `charcoal` (#1C1C1E), `sec-blue` (#1B4F72), `crimson` (#A63232), `gray-secondary`, `gray-muted`, `divider`
- Components: Button (cva variants), Card (slots), Label, Checkbox, RadioGroup, Select
- Pattern: `max-w-5xl mx-auto px-4 sm:px-6` for page containers

---

## File Structure

### New files

```
src/
├── lib/
│   ├── pro/
│   │   ├── types.ts                    # Pro domain types (Organization, Plan, SubscriptionStatus)
│   │   ├── auth.ts                     # getUserRole(), getUserOrg(), requirePro() helpers
│   │   ├── paymongo.ts                 # PayMongo API client (subscriptions, customers, plans)
│   │   └── csv.ts                      # CSV parse + validate logic
│   │
├── app/
│   ├── pro/
│   │   ├── page.tsx                    # Pro landing/pricing page (public)
│   │   └── signup/
│   │       └── page.tsx                # Pro signup (creates user + org)
│   │
│   ├── dashboard/
│   │   ├── layout.tsx                  # Pro shell layout (nav sidebar + trial banner)
│   │   ├── page.tsx                    # Portfolio dashboard (summary + corp table)
│   │   └── [corpId]/
│   │       └── page.tsx                # Corporation detail (merged results + remediation)
│   │
│   ├── reports/
│   │   └── page.tsx                    # Report history list
│   │
│   ├── settings/
│   │   ├── page.tsx                    # Organization settings (name, logo)
│   │   └── billing/
│   │       └── page.tsx                # Plan management, PayMongo
│   │
│   └── api/
│       ├── pro/
│       │   ├── corporations/route.ts   # CRUD for org corporations
│       │   ├── import/route.ts         # CSV import endpoint
│       │   └── reports/route.ts        # Generate PDF report
│       ├── billing/
│       │   ├── subscribe/route.ts      # Create PayMongo subscription
│       │   ├── change-plan/route.ts    # Change PayMongo plan
│       │   └── cancel/route.ts         # Cancel subscription
│       └── webhooks/
│           └── paymongo/route.ts       # PayMongo webhook handler
│
├── components/
│   ├── pro/
│   │   ├── dashboard-stats.tsx         # 4 summary stat cards
│   │   ├── corporation-table.tsx       # Filterable, sortable corp table
│   │   ├── status-filter-tabs.tsx      # All/Delinquent/Suspended/Active/Revoked tabs
│   │   ├── trial-banner.tsx            # Trial countdown / expiry banner
│   │   ├── csv-import-modal.tsx        # Upload, validate, preview, import
│   │   ├── filing-edit-modal.tsx        # Wizard step 3 in a modal
│   │   └── pro-nav.tsx                 # Left nav for pro layout
│   │
│   └── pdf/
│       ├── compliance-report.tsx       # @react-pdf document template
│       └── pdf-timeline.tsx            # Timeline reimplemented with @react-pdf SVG primitives

supabase/migrations/
└── 002_pro_tier.sql                    # New tables + column alterations + RLS

__tests__/
├── engine/
│   └── csv-validation.test.ts          # CSV parse + validate unit tests
├── lib/
│   └── pro-auth.test.ts               # Auth helper unit tests
└── e2e/
    ├── pro-signup.spec.ts              # Pro signup flow
    ├── dashboard.spec.ts               # Dashboard rendering + filtering
    └── csv-import.spec.ts              # CSV import flow
```

### Modified files

```
src/middleware.ts                        # Add pro route protection
src/components/layout/header.tsx         # Conditional nav (Pro link, Dashboard link when logged in)
src/components/wizard/wizard-shell.tsx   # Add corp name field for pro users, save to org
src/components/wizard/corp-type-step.tsx # Add corp name input (shown for pro users)
src/app/api/compute/route.ts            # Optionally save computation to org corporation
```

---

## Task 1: Database Migration

**Files:**
- Create: `supabase/migrations/002_pro_tier.sql`

- [ ] **Step 1: Write the migration**

```sql
-- Pro tier: organizations, members, reports, column additions

create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references auth.users(id),
  logo_url text,
  plan text not null default 'solo' check (plan in ('solo', 'practice', 'firm')),
  subscription_status text not null default 'trialing'
    check (subscription_status in ('trialing', 'active', 'past_due', 'unpaid', 'canceled')),
  paymongo_customer_id text,
  paymongo_subscription_id text,
  corp_limit integer not null default 5,
  trial_ends_at timestamptz not null default (now() + interval '14 days'),
  current_period_ends_at timestamptz,
  created_at timestamptz not null default now()
);

create table organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  role text not null default 'owner' check (role in ('owner', 'member')),
  created_at timestamptz not null default now(),
  unique(organization_id, user_id)
);

create table reports (
  id uuid primary key default gen_random_uuid(),
  corporation_id uuid not null references corporations(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  generated_at timestamptz not null default now(),
  report_type text not null default 'compliance_summary'
    check (report_type in ('compliance_summary')),
  storage_path text not null
);

alter table corporations add column organization_id uuid references organizations(id);
alter table corporations add column name text;

-- RLS
alter table organizations enable row level security;
alter table organization_members enable row level security;
alter table reports enable row level security;

create policy "Owners can read own organizations"
  on organizations for select using (auth.uid() = owner_id);
create policy "Owners can update own organizations"
  on organizations for update using (auth.uid() = owner_id);
create policy "Users can create organizations"
  on organizations for insert with check (auth.uid() = owner_id);

create policy "Members can read own memberships"
  on organization_members for select using (auth.uid() = user_id);
create policy "Owners can manage members"
  on organization_members for insert with check (
    organization_id in (select id from organizations where owner_id = auth.uid())
  );

create policy "Pro users can read org corporations"
  on corporations for select using (
    organization_id in (
      select organization_id from organization_members where user_id = auth.uid()
    )
  );
create policy "Pro users can insert org corporations"
  on corporations for insert with check (
    organization_id in (
      select organization_id from organization_members where user_id = auth.uid()
    )
  );
create policy "Pro users can update org corporations"
  on corporations for update using (
    organization_id in (
      select organization_id from organization_members where user_id = auth.uid()
    )
  );

create policy "Pro users can read org filing records"
  on filing_records for select using (
    corporation_id in (
      select c.id from corporations c
      join organization_members om on om.organization_id = c.organization_id
      where om.user_id = auth.uid()
    )
  );
create policy "Pro users can insert org filing records"
  on filing_records for insert with check (
    corporation_id in (
      select c.id from corporations c
      join organization_members om on om.organization_id = c.organization_id
      where om.user_id = auth.uid()
    )
  );

create policy "Pro users can read org computations"
  on computations for select using (
    corporation_id in (
      select c.id from corporations c
      join organization_members om on om.organization_id = c.organization_id
      where om.user_id = auth.uid()
    )
  );
create policy "Pro users can insert org computations"
  on computations for insert with check (
    corporation_id in (
      select c.id from corporations c
      join organization_members om on om.organization_id = c.organization_id
      where om.user_id = auth.uid()
    )
  );

create policy "Org members can read reports"
  on reports for select using (
    organization_id in (
      select organization_id from organization_members where user_id = auth.uid()
    )
  );
create policy "Org members can insert reports"
  on reports for insert with check (
    organization_id in (
      select organization_id from organization_members where user_id = auth.uid()
    )
  );

-- Storage bucket for PDF reports
insert into storage.buckets (id, name, public) values ('reports', 'reports', false);

create policy "Org members can read report files"
  on storage.objects for select using (
    bucket_id = 'reports' and
    (storage.foldername(name))[1] in (
      select id::text from organizations where owner_id = auth.uid()
    )
  );
create policy "Org members can upload report files"
  on storage.objects for insert with check (
    bucket_id = 'reports' and
    (storage.foldername(name))[1] in (
      select id::text from organizations where owner_id = auth.uid()
    )
  );
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/002_pro_tier.sql
git commit -m "feat(db): add pro tier migration — organizations, members, reports tables"
```

---

## Task 2: Pro Types & Auth Helpers

**Files:**
- Create: `src/lib/pro/types.ts`
- Create: `src/lib/pro/auth.ts`
- Test: `__tests__/lib/pro-auth.test.ts`

- [ ] **Step 1: Write pro domain types**

Create `src/lib/pro/types.ts`:

```typescript
export type Plan = "solo" | "practice" | "firm";
export type SubscriptionStatus = "trialing" | "active" | "past_due" | "unpaid" | "canceled";
export type UserRole = "free" | "pro";
export type OrgMemberRole = "owner" | "member";

export interface Organization {
  id: string;
  name: string;
  owner_id: string;
  logo_url: string | null;
  plan: Plan;
  subscription_status: SubscriptionStatus;
  paymongo_customer_id: string | null;
  paymongo_subscription_id: string | null;
  corp_limit: number;
  trial_ends_at: string;
  current_period_ends_at: string | null;
  created_at: string;
}

export interface OrgMember {
  organization_id: string;
  user_id: string;
  role: OrgMemberRole;
}

export interface Report {
  id: string;
  corporation_id: string;
  organization_id: string;
  generated_at: string;
  report_type: "compliance_summary";
  storage_path: string;
}

export const PLAN_LIMITS: Record<Plan, number> = {
  solo: 5,
  practice: 25,
  firm: 100,
};

export const PLAN_PRICES: Record<Plan, number> = {
  solo: 999,
  practice: 2499,
  firm: 4999,
};

export function isActiveSubscription(status: SubscriptionStatus, trialEndsAt: string): boolean {
  if (status === "active") return true;
  if (status === "trialing") return new Date(trialEndsAt) > new Date();
  return false;
}

export function trialDaysRemaining(trialEndsAt: string): number {
  const diff = new Date(trialEndsAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}
```

- [ ] **Step 2: Write auth helpers**

Create `src/lib/pro/auth.ts`:

```typescript
import { createClient } from "@/lib/supabase/server";
import type { Organization, UserRole } from "./types";

export async function getUserRole(): Promise<UserRole> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return "free";
  return (user.user_metadata?.role as UserRole) ?? "free";
}

export async function getUserOrg(): Promise<Organization | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .single();

  if (!membership) return null;

  const { data: org } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", membership.organization_id)
    .single();

  return org as Organization | null;
}

export async function requirePro(): Promise<{
  userId: string;
  org: Organization;
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const role = (user.user_metadata?.role as UserRole) ?? "free";
  if (role !== "pro") throw new Error("Not a pro user");

  const org = await getUserOrg();
  if (!org) throw new Error("No organization found");

  return { userId: user.id, org };
}

export async function getOrgCorpCount(orgId: string): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("corporations")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", orgId);

  return count ?? 0;
}
```

- [ ] **Step 3: Write tests for type helpers**

Create `__tests__/lib/pro-auth.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { isActiveSubscription, trialDaysRemaining, PLAN_LIMITS } from "@/lib/pro/types";

describe("isActiveSubscription", () => {
  it("returns true for active status", () => {
    expect(isActiveSubscription("active", "2020-01-01")).toBe(true);
  });

  it("returns true for trialing with future date", () => {
    const future = new Date(Date.now() + 7 * 86400000).toISOString();
    expect(isActiveSubscription("trialing", future)).toBe(true);
  });

  it("returns false for expired trial", () => {
    expect(isActiveSubscription("trialing", "2020-01-01")).toBe(false);
  });

  it("returns false for past_due", () => {
    expect(isActiveSubscription("past_due", "2030-01-01")).toBe(false);
  });

  it("returns false for canceled", () => {
    expect(isActiveSubscription("canceled", "2030-01-01")).toBe(false);
  });
});

describe("trialDaysRemaining", () => {
  it("returns 0 for past date", () => {
    expect(trialDaysRemaining("2020-01-01")).toBe(0);
  });

  it("returns positive number for future date", () => {
    const future = new Date(Date.now() + 7 * 86400000).toISOString();
    expect(trialDaysRemaining(future)).toBeGreaterThan(0);
    expect(trialDaysRemaining(future)).toBeLessThanOrEqual(8);
  });
});

describe("PLAN_LIMITS", () => {
  it("has correct limits", () => {
    expect(PLAN_LIMITS.solo).toBe(5);
    expect(PLAN_LIMITS.practice).toBe(25);
    expect(PLAN_LIMITS.firm).toBe(100);
  });
});
```

- [ ] **Step 4: Run tests**

Run: `cd apps/sec-compliance && npx vitest run __tests__/lib/pro-auth.test.ts`
Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/pro/ __tests__/lib/
git commit -m "feat(pro): add pro types and auth helpers"
```

---

## Task 3: Update Middleware for Role-Based Routing

**Files:**
- Modify: `src/middleware.ts`

- [ ] **Step 1: Update middleware**

Replace `src/middleware.ts` with:

```typescript
import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const PRO_ROUTES = ["/dashboard", "/reports", "/settings"];

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);
  const path = request.nextUrl.pathname;

  // Protect /remediation — redirect to /login if not authenticated
  if (path.startsWith("/remediation") && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  // Protect pro routes — require auth + pro role
  if (PRO_ROUTES.some((route) => path.startsWith(route))) {
    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      return NextResponse.redirect(loginUrl);
    }

    const role = user.user_metadata?.role ?? "free";
    if (role !== "pro") {
      const proUrl = request.nextUrl.clone();
      proUrl.pathname = "/pro";
      return NextResponse.redirect(proUrl);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

- [ ] **Step 2: Commit**

```bash
git add src/middleware.ts
git commit -m "feat(auth): add role-based routing for pro routes"
```

---

## Task 4: Update Header with Pro Navigation

**Files:**
- Modify: `src/components/layout/header.tsx`

- [ ] **Step 1: Make header a server component that reads auth state**

Replace `src/components/layout/header.tsx`:

```tsx
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Header() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const role = user?.user_metadata?.role ?? "free";
  const isProUser = role === "pro";

  return (
    <header className="bg-white border-b border-divider">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link
          href={isProUser ? "/dashboard" : "/"}
          className="font-display text-xl font-semibold text-charcoal hover:opacity-80 transition-opacity"
        >
          SEC Compliance Navigator
        </Link>
        <nav className="flex items-center gap-6">
          {isProUser ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm font-body text-charcoal hover:text-sec-blue transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/reports"
                className="text-sm font-body text-charcoal hover:text-sec-blue transition-colors"
              >
                Reports
              </Link>
              <Link
                href="/settings"
                className="text-sm font-body text-charcoal hover:text-sec-blue transition-colors"
              >
                Settings
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/"
                className="text-sm font-body text-charcoal hover:text-sec-blue transition-colors"
              >
                Home
              </Link>
              <Link
                href="/wizard"
                className="text-sm font-body text-charcoal hover:text-sec-blue transition-colors"
              >
                Check Status
              </Link>
              <Link
                href="/pro"
                className="text-sm font-body font-semibold text-sec-blue hover:text-sec-blue/80 transition-colors"
              >
                Pro
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/layout/header.tsx
git commit -m "feat(nav): update header with role-based navigation"
```

---

## Task 5: Pro Landing / Pricing Page

**Files:**
- Create: `src/app/pro/page.tsx`

- [ ] **Step 1: Build the pricing page**

Create `src/app/pro/page.tsx`. This is a public page — no auth required. Three pricing cards (Solo, Practice, Firm) with a shared "Start 14-day free trial" CTA. Use the existing design system: Newsreader headings, Public Sans body, sec-blue for primary actions, charcoal text.

Design notes:
- **Elevated feel** — this page sells. More whitespace, larger typography than the rest of the app.
- Hero: "Manage compliance for all your clients" with subtitle about the accountant pain point.
- 3-column pricing grid. Each card: plan name, price, corp limit, feature list, CTA button.
- Recommended plan (Practice) gets a subtle `border-sec-blue` highlight.
- Bottom section: "How it works" — 3 steps: Import → Dashboard → Report.
- FAQ section addressing: "What happens after the trial?", "Can I change plans?", "What payment methods?".

Use the existing `Card`, `Button` components from `src/components/ui/`.

Reference the landing page at `src/app/page.tsx` for style patterns (serif headings, container widths, spacing).

Follow the @frontend-design skill for the visual implementation — this page should look distinctive, not generic.

- [ ] **Step 2: Commit**

```bash
git add src/app/pro/
git commit -m "feat(pro): add pro landing and pricing page"
```

---

## Task 6: Pro Signup Page

**Files:**
- Create: `src/app/pro/signup/page.tsx`

- [ ] **Step 1: Build the pro signup page**

Create `src/app/pro/signup/page.tsx`. Client component. Collects:
- Organization name (text input, required)
- Email (text input, required)
- Password (text input, required, min 8 chars)
- Confirm password
- Google OAuth button

Reference the existing signup at `src/app/signup/page.tsx` for the form pattern, Google OAuth flow, and styling. Key differences:
- Organization name field added before email
- On successful signup: set `user_metadata.role = "pro"` via Supabase `auth.updateUser()`
- Create `organizations` row (plan: 'solo', status: 'trialing', trial_ends_at: now+14d, corp_limit: 5)
- Create `organization_members` row (role: 'owner')
- Redirect to `/dashboard` instead of `/remediation`

For Google OAuth: after OAuth callback, redirect to a page that collects org name (since OAuth skips the form). Handle this by checking on `/dashboard` load if org exists — if not, show a modal to collect org name.

Simpler approach: add org name input to the OAuth post-redirect flow. In the `/api/auth/callback` route, check if the user has role=pro metadata but no org — if so, redirect to `/pro/signup?complete=true` which shows only the org name field.

```typescript
// Key signup logic:
const { data, error } = await supabase.auth.signUp({ email, password });
if (data.user) {
  // Set pro role in user metadata
  await supabase.auth.updateUser({ data: { role: "pro" } });

  // Create organization
  const { data: org } = await supabase.from("organizations").insert({
    name: orgName,
    owner_id: data.user.id,
    plan: "solo",
    subscription_status: "trialing",
    corp_limit: 5,
  }).select("id").single();

  // Create membership
  if (org) {
    await supabase.from("organization_members").insert({
      organization_id: org.id,
      user_id: data.user.id,
      role: "owner",
    });
  }
}
router.push("/dashboard");
```

Style: match existing signup page layout (centered card, max-w-md, same input styling). Change heading to "Start your free trial" with subtitle "14 days, full access, no credit card required."

- [ ] **Step 2: Commit**

```bash
git add src/app/pro/signup/
git commit -m "feat(pro): add pro signup with organization creation"
```

---

## Task 7: Pro Dashboard Layout

**Files:**
- Create: `src/app/dashboard/layout.tsx`
- Create: `src/components/pro/pro-nav.tsx`
- Create: `src/components/pro/trial-banner.tsx`

- [ ] **Step 1: Build the trial banner component**

Create `src/components/pro/trial-banner.tsx`:

```tsx
import Link from "next/link";
import { trialDaysRemaining } from "@/lib/pro/types";
import type { Organization } from "@/lib/pro/types";

interface TrialBannerProps {
  org: Organization;
}

export function TrialBanner({ org }: TrialBannerProps) {
  if (org.subscription_status === "active") return null;

  if (org.subscription_status === "trialing") {
    const days = trialDaysRemaining(org.trial_ends_at);
    if (days <= 0) {
      return (
        <div className="bg-crimson/10 border-b border-crimson/20 px-4 py-2.5">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <p className="font-body text-sm text-crimson font-medium">
              Your trial has ended. Subscribe to continue using Pro features.
            </p>
            <Link
              href="/settings/billing"
              className="font-body text-sm font-semibold text-crimson hover:underline"
            >
              Subscribe now
            </Link>
          </div>
        </div>
      );
    }
    return (
      <div className="bg-sec-blue/5 border-b border-sec-blue/10 px-4 py-2.5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <p className="font-body text-sm text-sec-blue">
            <span className="font-semibold">{days} day{days !== 1 ? "s" : ""}</span> left in your free trial.
          </p>
          <Link
            href="/settings/billing"
            className="font-body text-sm font-semibold text-sec-blue hover:underline"
          >
            Subscribe now
          </Link>
        </div>
      </div>
    );
  }

  if (org.subscription_status === "past_due") {
    return (
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <p className="font-body text-sm text-amber-800 font-medium">
            Payment failed. Please update your payment method to avoid losing access.
          </p>
          <Link
            href="/settings/billing"
            className="font-body text-sm font-semibold text-amber-800 hover:underline"
          >
            Update payment
          </Link>
        </div>
      </div>
    );
  }

  return null;
}
```

- [ ] **Step 2: Build the pro nav component**

Create `src/components/pro/pro-nav.tsx` — horizontal sub-nav below the header for pro pages. Links: Dashboard, Reports, Settings. Active state highlighted.

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/reports", label: "Reports" },
  { href: "/settings", label: "Settings" },
];

export function ProNav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-divider bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 flex gap-6">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "py-3 font-body text-sm border-b-2 transition-colors",
                isActive
                  ? "border-sec-blue text-sec-blue font-semibold"
                  : "border-transparent text-gray-secondary hover:text-charcoal"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

- [ ] **Step 3: Build the dashboard layout**

Create `src/app/dashboard/layout.tsx`:

```tsx
import { redirect } from "next/navigation";
import { getUserOrg } from "@/lib/pro/auth";
import { TrialBanner } from "@/components/pro/trial-banner";
import { ProNav } from "@/components/pro/pro-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const org = await getUserOrg();
  if (!org) redirect("/pro");

  return (
    <>
      <TrialBanner org={org} />
      <ProNav />
      <div className="flex-1">{children}</div>
    </>
  );
}
```

Note: this layout nests inside the root layout (which has Header + Footer). The ProNav sits below the Header.

- [ ] **Step 4: Commit**

```bash
git add src/app/dashboard/layout.tsx src/components/pro/
git commit -m "feat(pro): add dashboard layout with trial banner and pro nav"
```

---

## Task 8: Dashboard Page — Summary Stats

**Files:**
- Create: `src/components/pro/dashboard-stats.tsx`

- [ ] **Step 1: Build the stats component**

Create `src/components/pro/dashboard-stats.tsx`:

```tsx
import { formatCurrency } from "@/lib/utils";

interface DashboardStatsProps {
  totalCorps: number;
  corpLimit: number;
  totalPenaltyExposure: number;
  needAttention: number;
  compliantCount: number;
}

export function DashboardStats({
  totalCorps,
  corpLimit,
  totalPenaltyExposure,
  needAttention,
  compliantCount,
}: DashboardStatsProps) {
  const stats = [
    {
      label: "Total Corporations",
      value: String(totalCorps),
      subtext: `of ${corpLimit} limit`,
      color: "text-charcoal",
    },
    {
      label: "Total Penalty Exposure",
      value: formatCurrency(totalPenaltyExposure),
      subtext: "across all corps",
      color: totalPenaltyExposure > 0 ? "text-crimson" : "text-charcoal",
    },
    {
      label: "Need Attention",
      value: String(needAttention),
      subtext: "filings due within 60 days",
      color: needAttention > 0 ? "text-amber-600" : "text-charcoal",
    },
    {
      label: "Compliant",
      value: String(compliantCount),
      subtext: `of ${totalCorps} corporations`,
      color: "text-green-700",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl border border-divider bg-white p-5"
        >
          <p className="font-body text-xs uppercase tracking-wide text-gray-muted">
            {stat.label}
          </p>
          <p className={`font-display text-3xl font-bold mt-1 ${stat.color}`}>
            {stat.value}
          </p>
          <p className="font-body text-xs text-gray-muted mt-0.5">
            {stat.subtext}
          </p>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/pro/dashboard-stats.tsx
git commit -m "feat(pro): add dashboard summary stats component"
```

---

## Task 9: Dashboard Page — Corporation Table + Filters

**Files:**
- Create: `src/components/pro/status-filter-tabs.tsx`
- Create: `src/components/pro/corporation-table.tsx`

- [ ] **Step 1: Build the filter tabs**

Create `src/components/pro/status-filter-tabs.tsx`:

```tsx
"use client";

import { cn } from "@/lib/utils";
import type { ComplianceStatus } from "@/engine/types";

type FilterValue = "all" | ComplianceStatus;

interface StatusFilterTabsProps {
  active: FilterValue;
  counts: Record<FilterValue, number>;
  onChange: (value: FilterValue) => void;
}

const TABS: { value: FilterValue; label: string }[] = [
  { value: "all", label: "All" },
  { value: "delinquent", label: "Delinquent" },
  { value: "suspended", label: "Suspended" },
  { value: "active", label: "Active" },
  { value: "revoked", label: "Revoked" },
];

export function StatusFilterTabs({ active, counts, onChange }: StatusFilterTabsProps) {
  return (
    <div className="flex gap-2">
      {TABS.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={cn(
            "px-3.5 py-1.5 rounded-lg font-body text-sm transition-colors",
            active === tab.value
              ? "bg-sec-blue text-white font-medium"
              : "bg-white border border-divider text-gray-secondary hover:text-charcoal"
          )}
        >
          {tab.label} ({counts[tab.value]})
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Build the corporation table**

Create `src/components/pro/corporation-table.tsx`. Client component with sorting, filtering, pagination.

Props interface:
```typescript
interface CorpRow {
  id: string;
  name: string | null;
  corp_type: string;
  status: ComplianceStatus;
  totalPenalty: number;
  nextDeadline: string | null; // ISO date string or null
  hasFilingHistory: boolean;
}
```

Table columns: Corporation (bold name), Type, Status (color badge reusing StatusBadge patterns), Penalties (formatted currency, colored), Next Deadline (amber if within 60 days), Actions (View · Report links).

Pagination: 25 rows per page. Sortable by clicking column headers.

"+ Add Corporation" button links to `/wizard`. "Import CSV" button opens the CSV import modal (wired in a later task — for now, a disabled button placeholder).

Reference the StatusBadge colors from `src/components/results/status-badge.tsx` for consistent styling.

Follow the @frontend-design skill for the table design — it should feel institutional and authoritative, matching the rest of the app.

- [ ] **Step 3: Commit**

```bash
git add src/components/pro/status-filter-tabs.tsx src/components/pro/corporation-table.tsx
git commit -m "feat(pro): add corporation table with filters and sorting"
```

---

## Task 10: Dashboard Page Assembly

**Files:**
- Create: `src/app/dashboard/page.tsx`
- Create: `src/app/api/pro/corporations/route.ts`

- [ ] **Step 1: Build the corporations API route**

Create `src/app/api/pro/corporations/route.ts`. Server-side endpoint that:
- Calls `requirePro()` to verify auth + get org
- Queries all corporations for the org, including their latest computation
- For each corporation, runs `computeCompliance()` to get current status + penalties (or reads from latest computation in DB)
- Returns array of `CorpRow` objects

```typescript
// GET /api/pro/corporations
// Returns: { corporations: CorpRow[], org: Organization }
```

- [ ] **Step 2: Build the dashboard page**

Create `src/app/dashboard/page.tsx`. Server component that:
- Calls `requirePro()` to get org
- Fetches corporations from `/api/pro/corporations` (or directly queries in server component)
- Computes summary stats from the corporation data
- Renders DashboardStats + StatusFilterTabs + CorporationTable

The page should be a server component that passes data to client sub-components.

```tsx
import { requirePro } from "@/lib/pro/auth";
import { createClient } from "@/lib/supabase/server";
import { DashboardStats } from "@/components/pro/dashboard-stats";
import { DashboardClient } from "@/components/pro/dashboard-client"; // client wrapper for table + filters

export default async function DashboardPage() {
  const { org } = await requirePro();
  const supabase = await createClient();

  // Fetch corporations with latest computation
  const { data: corporations } = await supabase
    .from("corporations")
    .select("*, computations(result_json, total_penalty, computed_at)")
    .eq("organization_id", org.id)
    .order("created_at", { ascending: false });

  // ... compute stats, map to CorpRow[], render
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/dashboard/page.tsx src/app/api/pro/corporations/
git commit -m "feat(pro): add dashboard page with stats and corporation table"
```

---

## Task 11: Corporation Detail Page

**Files:**
- Create: `src/app/dashboard/[corpId]/page.tsx`

- [ ] **Step 1: Build the corp detail page**

Create `src/app/dashboard/[corpId]/page.tsx`. Server component that:
- Calls `requirePro()` to verify auth
- Fetches the corporation by ID (with org check)
- Fetches filing records
- Runs `computeCompliance()` with the corporation's data
- Renders the merged results + remediation view

Reuse these existing components directly:
- `ComplianceTimeline` from `src/components/results/compliance-timeline.tsx`
- `PenaltyTable` from `src/components/results/penalty-table.tsx`
- `StatusBadge` from `src/components/results/status-badge.tsx`
- `RiskFlag` from `src/components/results/risk-flag.tsx`
- `CostEstimate` from `src/components/remediation/cost-estimate.tsx`
- `StepGuide` from `src/components/remediation/step-guide.tsx`
- `DocumentChecklist` from `src/components/remediation/document-checklist.tsx`

Add two new buttons at the top:
- "Generate Report" — calls `/api/pro/reports` POST to generate PDF, downloads the file
- "Edit Filing History" — opens filing edit modal (wired in Task 13)

Page structure:
```
<Corp header: name, type, reg date, StatusBadge>
<Action buttons: Generate Report, Edit Filing History>
<ComplianceTimeline />
<PenaltyTable />
<RiskFlag />
<CostEstimate />
<StepGuide />
<DocumentChecklist />
```

- [ ] **Step 2: Commit**

```bash
git add src/app/dashboard/\[corpId\]/
git commit -m "feat(pro): add corporation detail page with merged results and remediation"
```

---

## Task 12: CSV Validation Logic

**Files:**
- Create: `src/lib/pro/csv.ts`
- Test: `__tests__/engine/csv-validation.test.ts`

- [ ] **Step 1: Write failing tests for CSV validation**

Create `__tests__/engine/csv-validation.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { parseAndValidateCSV, type CSVRow, type CSVValidationResult } from "@/lib/pro/csv";

describe("parseAndValidateCSV", () => {
  it("parses valid CSV with all fields", () => {
    const csv = `corporation_name,corp_type,incorporation_date,re_bracket,sec_registration_number
ABC Corp,stock,2018-01-15,100k_500k,CS201800001`;
    const result = parseAndValidateCSV(csv);
    expect(result.validRows).toHaveLength(1);
    expect(result.errors).toHaveLength(0);
    expect(result.validRows[0].corporation_name).toBe("ABC Corp");
    expect(result.validRows[0].corp_type).toBe("stock");
  });

  it("parses year-only incorporation date", () => {
    const csv = `corporation_name,corp_type,incorporation_date
Test Corp,non_stock,2020`;
    const result = parseAndValidateCSV(csv);
    expect(result.validRows).toHaveLength(1);
    expect(result.validRows[0].incorporation_date).toBe("2020-01-01");
  });

  it("rejects missing required fields", () => {
    const csv = `corporation_name,corp_type,incorporation_date
,stock,2018`;
    const result = parseAndValidateCSV(csv);
    expect(result.validRows).toHaveLength(0);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].message).toContain("corporation_name");
  });

  it("rejects invalid corp_type", () => {
    const csv = `corporation_name,corp_type,incorporation_date
Test,partnership,2018`;
    const result = parseAndValidateCSV(csv);
    expect(result.errors[0].message).toContain("corp_type");
  });

  it("defaults re_bracket to 0_100k when not provided", () => {
    const csv = `corporation_name,corp_type,incorporation_date
Test,stock,2018`;
    const result = parseAndValidateCSV(csv);
    expect(result.validRows[0].re_bracket).toBe("0_100k");
  });

  it("handles multiple rows with mixed validity", () => {
    const csv = `corporation_name,corp_type,incorporation_date
Good Corp,stock,2018
,opc,2020
Bad Type,llc,2019`;
    const result = parseAndValidateCSV(csv);
    expect(result.validRows).toHaveLength(1);
    expect(result.errors).toHaveLength(2);
  });
});
```

- [ ] **Step 2: Run tests — verify they fail**

Run: `cd apps/sec-compliance && npx vitest run __tests__/engine/csv-validation.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement CSV parser**

Create `src/lib/pro/csv.ts`:

```typescript
export interface CSVRow {
  corporation_name: string;
  corp_type: "stock" | "non_stock" | "opc";
  incorporation_date: string; // YYYY-MM-DD
  re_bracket: string;
  sec_registration_number: string | null;
}

export interface CSVError {
  row: number;
  message: string;
}

export interface CSVValidationResult {
  validRows: CSVRow[];
  errors: CSVError[];
}

const VALID_CORP_TYPES = ["stock", "non_stock", "opc"];
const VALID_RE_BRACKETS = [
  "capital_deficiency", "negative", "0_100k",
  "100k_500k", "500k_5m", "5m_10m", "above_10m",
];

export function parseAndValidateCSV(csvText: string): CSVValidationResult {
  const lines = csvText.trim().split("\n");
  if (lines.length < 2) return { validRows: [], errors: [{ row: 0, message: "CSV must have a header row and at least one data row" }] };

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const validRows: CSVRow[] = [];
  const errors: CSVError[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, j) => { row[h] = values[j] ?? ""; });

    const rowNum = i + 1;

    // Required: corporation_name
    if (!row.corporation_name) {
      errors.push({ row: rowNum, message: "Missing required field: corporation_name" });
      continue;
    }

    // Required: corp_type
    const corpType = row.corp_type?.toLowerCase();
    if (!corpType || !VALID_CORP_TYPES.includes(corpType)) {
      errors.push({ row: rowNum, message: `Invalid corp_type "${row.corp_type}". Expected: stock, non_stock, or opc` });
      continue;
    }

    // Required: incorporation_date
    if (!row.incorporation_date) {
      errors.push({ row: rowNum, message: "Missing required field: incorporation_date" });
      continue;
    }

    let incDate = row.incorporation_date;
    // Year-only: convert to YYYY-01-01
    if (/^\d{4}$/.test(incDate)) {
      incDate = `${incDate}-01-01`;
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(incDate)) {
      errors.push({ row: rowNum, message: `Invalid incorporation_date "${row.incorporation_date}". Expected YYYY-MM-DD or YYYY` });
      continue;
    }

    // Optional: re_bracket
    let reBracket = row.re_bracket?.toLowerCase() || "0_100k"; // default per spec: use lowest bracket as safe default
    if (row.re_bracket && !VALID_RE_BRACKETS.includes(reBracket)) {
      errors.push({ row: rowNum, message: `Invalid re_bracket "${row.re_bracket}"` });
      continue;
    }

    validRows.push({
      corporation_name: row.corporation_name,
      corp_type: corpType as CSVRow["corp_type"],
      incorporation_date: incDate,
      re_bracket: reBracket,
      sec_registration_number: row.sec_registration_number || null,
    });
  }

  return { validRows, errors };
}

export function generateCSVTemplate(): string {
  return "corporation_name,corp_type,incorporation_date,re_bracket,sec_registration_number\n";
}
```

- [ ] **Step 4: Run tests — verify they pass**

Run: `cd apps/sec-compliance && npx vitest run __tests__/engine/csv-validation.test.ts`
Expected: All pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/pro/csv.ts __tests__/engine/csv-validation.test.ts
git commit -m "feat(pro): add CSV parse and validation logic with tests"
```

---

## Task 13: CSV Import Modal + Filing Edit Modal

**Files:**
- Create: `src/components/pro/csv-import-modal.tsx`
- Create: `src/components/pro/filing-edit-modal.tsx`
- Create: `src/app/api/pro/import/route.ts`

- [ ] **Step 1: Build the CSV import API route**

Create `src/app/api/pro/import/route.ts`:

```typescript
// POST /api/pro/import
// Body: { rows: CSVRow[] }
// Validates org auth, checks corp limit, inserts corporations
// Returns: { imported: number, orgId: string }
```

Key logic:
- Call `requirePro()` to get org
- Check `getOrgCorpCount(org.id) + rows.length <= org.corp_limit`
- Insert each row as a corporation with `organization_id = org.id`
- Return count of imported rows

- [ ] **Step 2: Build the CSV import modal**

Create `src/components/pro/csv-import-modal.tsx`. Client component.

States: `idle` → `preview` → `importing` → `done`

- **idle**: File upload dropzone + "Download template" link (generates CSV template blob)
- **preview**: Table showing parsed rows with row-level errors highlighted in red. "Import N valid rows" button + "Cancel" button.
- **importing**: Spinner
- **done**: "N corporations imported. M rows skipped." + "Close" button

Uses `parseAndValidateCSV()` from `src/lib/pro/csv.ts` for client-side validation. On confirm, POSTs valid rows to `/api/pro/import`.

Modal overlay: fixed position, backdrop blur, centered card. Use existing Card component.

- [ ] **Step 3: Build the filing edit modal**

Create `src/components/pro/filing-edit-modal.tsx`. Client component.

Wraps the existing `FilingsStep` component from `src/components/wizard/filings-step.tsx` in a modal overlay. Props:

```typescript
interface FilingEditModalProps {
  corpId: string;
  incorporationYear: number;
  existingFilings: FilingRecord[];
  onSave: (filings: FilingRecord[]) => Promise<void>;
  onClose: () => void;
}
```

On save:
1. POST updated filing records to server
2. Recompute compliance via `/api/compute`
3. Call `onSave()` to refresh the parent page
4. Close modal

- [ ] **Step 4: Commit**

```bash
git add src/components/pro/csv-import-modal.tsx src/components/pro/filing-edit-modal.tsx src/app/api/pro/import/
git commit -m "feat(pro): add CSV import and filing edit modals"
```

---

## Task 14: PDF Report Generation

**Files:**
- Create: `src/components/pdf/compliance-report.tsx`
- Create: `src/components/pdf/pdf-timeline.tsx`
- Create: `src/app/api/pro/reports/route.ts`

- [ ] **Step 1: Install @react-pdf/renderer**

```bash
cd apps/sec-compliance && npm install @react-pdf/renderer
```

- [ ] **Step 2: Build the PDF timeline component**

Create `src/components/pdf/pdf-timeline.tsx`. Reimplements the compliance timeline using `@react-pdf/renderer` SVG primitives (`<Svg>`, `<Rect>`, `<Text>`). Same data, same colors, different rendering backend.

Reference `src/components/results/compliance-timeline.tsx` for the data structure and color mapping:
- `filed_on_time` → green (#22c55e)
- `filed_late` → amber (#f59e0b)
- `not_filed` → crimson (#A63232)
- `not_required` → gray (#e5e7eb)

Grid layout: rows = report types (GIS, AFS, BO), columns = years. Each cell is a small colored rectangle with year labels at top.

- [ ] **Step 3: Build the compliance report document**

Create `src/components/pdf/compliance-report.tsx`:

```tsx
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import type { ComplianceResult } from "@/engine/compute";
import { PDFTimeline } from "./pdf-timeline";
// ... define styles, layout

interface ComplianceReportProps {
  orgName: string;
  orgLogoUrl: string | null;
  corpName: string;
  corpType: string;
  registrationDate: string;
  result: ComplianceResult;
  generatedAt: string;
}

export function ComplianceReport(props: ComplianceReportProps) {
  return (
    <Document>
      {/* Cover Page */}
      <Page size="A4" style={styles.page}>
        {/* Org logo + name */}
        {/* Corporation name */}
        {/* Date */}
      </Page>

      {/* Content Page */}
      <Page size="A4" style={styles.page}>
        {/* Compliance Summary */}
        {/* Timeline (PDFTimeline) */}
        {/* Penalty Breakdown Table */}
        {/* Reinstatement Cost Estimate */}
        {/* Recommended Next Steps */}
        {/* Legal Disclaimer */}
        {/* Footer */}
      </Page>
    </Document>
  );
}
```

Contents from spec:
1. Cover: org name/logo, corp name, date
2. Summary: status, risk level, plain-language paragraph
3. Timeline: PDFTimeline component
4. Penalty table: year × report × offense → amount
5. Reinstatement cost: petition + penalties + publication + professional fees
6. Next steps: ordered remediation list
7. Disclaimer: informational only
8. Footer: "Generated by SEC Compliance Navigator" + date

Style: Professional, clean. Use system fonts available in @react-pdf (Helvetica). Charcoal text, sec-blue accents, crimson for penalties.

- [ ] **Step 4: Build the report generation API route**

Create `src/app/api/pro/reports/route.ts`:

```typescript
// POST /api/pro/reports
// Body: { corporationId: string }
// 1. requirePro() — verify auth
// 2. Fetch corporation + filing records + latest computation
// 3. Render ComplianceReport to PDF buffer via renderToBuffer()
// 4. Upload to Supabase Storage: reports/{orgId}/{corpId}-{timestamp}.pdf
// 5. Insert into reports table
// 6. Return: { reportId, downloadUrl }
```

Key imports:
```typescript
import { renderToBuffer } from "@react-pdf/renderer";
import { ComplianceReport } from "@/components/pdf/compliance-report";
```

- [ ] **Step 5: Commit**

```bash
git add src/components/pdf/ src/app/api/pro/reports/
git commit -m "feat(pro): add PDF report generation with @react-pdf/renderer"
```

---

## Task 15: Reports Page

**Files:**
- Create: `src/app/reports/page.tsx`

- [ ] **Step 1: Build the reports list page**

Create `src/app/reports/page.tsx`. Server component:

- Calls `requirePro()` to get org
- Queries `reports` table for org, joined with `corporations` for corp name
- Renders a table: Date Generated, Corporation Name, Report Type, Download button
- Download button creates a signed URL from Supabase Storage
- "Generate Report" button navigates to corp detail page

Design: Same institutional table style as the corporation table. Max-w-5xl container. Paginated if > 25 reports.

- [ ] **Step 2: Commit**

```bash
git add src/app/reports/
git commit -m "feat(pro): add reports history page"
```

---

## Task 16: Settings Page — Organization

**Files:**
- Create: `src/app/settings/page.tsx`
- Create: `src/app/settings/layout.tsx`

- [ ] **Step 1: Build settings layout**

Create `src/app/settings/layout.tsx` — simple layout that uses the dashboard layout (already nested under pro nav + trial banner via the middleware). Add settings sub-nav: General, Billing.

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-2xl font-semibold text-charcoal mb-6">Settings</h1>
      <div className="flex gap-4 border-b border-divider mb-8">
        <Link
          href="/settings"
          className={cn(
            "pb-2.5 font-body text-sm border-b-2 transition-colors",
            pathname === "/settings"
              ? "border-sec-blue text-sec-blue font-semibold"
              : "border-transparent text-gray-secondary hover:text-charcoal"
          )}
        >
          General
        </Link>
        <Link
          href="/settings/billing"
          className={cn(
            "pb-2.5 font-body text-sm border-b-2 transition-colors",
            pathname === "/settings/billing"
              ? "border-sec-blue text-sec-blue font-semibold"
              : "border-transparent text-gray-secondary hover:text-charcoal"
          )}
        >
          Billing
        </Link>
      </div>
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Build general settings page**

Create `src/app/settings/page.tsx`. Client component with form:

Fields:
- Organization name (text input, pre-filled)
- Logo upload (file input, shows current logo if set, upload to Supabase Storage `logos/{orgId}.{ext}`, update org `logo_url`)
- Save button

On save: update `organizations` row via Supabase client.

- [ ] **Step 3: Commit**

```bash
git add src/app/settings/
git commit -m "feat(pro): add organization settings page with logo upload"
```

---

## Task 17: Billing Page + PayMongo Client

**Files:**
- Create: `src/lib/pro/paymongo.ts`
- Create: `src/app/settings/billing/page.tsx`
- Create: `src/app/api/billing/subscribe/route.ts`
- Create: `src/app/api/billing/change-plan/route.ts`
- Create: `src/app/api/billing/cancel/route.ts`

- [ ] **Step 1: Build PayMongo API client**

Create `src/lib/pro/paymongo.ts`:

```typescript
const PAYMONGO_BASE = "https://api.paymongo.com/v1";
const PAYMONGO_SECRET = process.env.PAYMONGO_SECRET_KEY!;

function headers() {
  return {
    Authorization: `Basic ${Buffer.from(PAYMONGO_SECRET + ":").toString("base64")}`,
    "Content-Type": "application/json",
  };
}

export async function createCustomer(email: string, name: string) {
  const res = await fetch(`${PAYMONGO_BASE}/customers`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      data: { attributes: { email, first_name: name, last_name: "" } },
    }),
  });
  return res.json();
}

export async function createSubscription(customerId: string, planId: string, paymentMethodId: string) {
  const res = await fetch(`${PAYMONGO_BASE}/subscriptions`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      data: {
        attributes: {
          customer_id: customerId,
          plan_id: planId,
          payment_method_id: paymentMethodId,
        },
      },
    }),
  });
  return res.json();
}

export async function changePlan(subscriptionId: string, newPlanId: string) {
  const res = await fetch(`${PAYMONGO_BASE}/subscriptions/${subscriptionId}/plan`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify({
      data: { attributes: { plan_id: newPlanId } },
    }),
  });
  return res.json();
}

export async function cancelSubscription(subscriptionId: string, reason: string = "other") {
  const res = await fetch(`${PAYMONGO_BASE}/subscriptions/${subscriptionId}/cancel`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      data: { attributes: { cancellation_reason: reason } },
    }),
  });
  return res.json();
}

export async function getSubscription(subscriptionId: string) {
  const res = await fetch(`${PAYMONGO_BASE}/subscriptions/${subscriptionId}`, {
    headers: headers(),
  });
  return res.json();
}
```

Environment variables needed (add to `.env.local.example`):
```
PAYMONGO_SECRET_KEY=sk_test_...
PAYMONGO_PUBLIC_KEY=pk_test_...
PAYMONGO_WEBHOOK_SECRET=whsk_...
PAYMONGO_PLAN_SOLO=plan_...
PAYMONGO_PLAN_PRACTICE=plan_...
PAYMONGO_PLAN_FIRM=plan_...
```

- [ ] **Step 2: Build billing API routes**

Create `src/app/api/billing/subscribe/route.ts`:
```typescript
// POST /api/billing/subscribe
// Body: { planId: string, paymentMethodId: string }
// 1. requirePro()
// 2. Create PayMongo customer if not exists
// 3. Create subscription
// 4. Update org: paymongo_customer_id, paymongo_subscription_id, subscription_status='active', plan
// 5. Return: { success: true }
```

Create `src/app/api/billing/change-plan/route.ts`:
```typescript
// POST /api/billing/change-plan
// Body: { newPlan: "solo" | "practice" | "firm" }
// 1. requirePro()
// 2. Check corp count <= new plan limit (block downgrade if over)
// 3. Call PayMongo changePlan()
// 4. Update org: plan, corp_limit (takes effect next cycle, but update limit immediately for upgrades)
// 5. Return: { success: true }
```

Create `src/app/api/billing/cancel/route.ts`:
```typescript
// POST /api/billing/cancel
// 1. requirePro()
// 2. Call PayMongo cancelSubscription()
// 3. Update org: subscription_status='canceled'
// 4. Return: { success: true }
```

- [ ] **Step 3: Build billing settings page**

Create `src/app/settings/billing/page.tsx`. Server component that fetches org, renders:

- Current plan card (name, price, status badge)
- Corp usage bar ("17 of 25 corporations")
- Plan comparison table (Solo/Practice/Firm with current plan highlighted)
- Change plan buttons (upgrade/downgrade, with downgrade blocked if over limit)
- Payment method section (if subscribed: card last 4 digits, "Update" button)
- Cancel subscription button (with confirmation dialog)

For subscribing (initial): render PayMongo Checkout flow. The user clicks "Subscribe", we:
1. Create a PayMongo payment method via their client-side SDK (card/Maya)
2. POST to `/api/billing/subscribe` with the plan + payment method
3. PayMongo generates first invoice → user pays → webhook confirms

For the client-side payment method collection, use PayMongo's `createPaymentMethod()` via their public key. This is a client-side form that collects card details and returns a `payment_method_id`.

- [ ] **Step 4: Commit**

```bash
git add src/lib/pro/paymongo.ts src/app/api/billing/ src/app/settings/billing/
git commit -m "feat(pro): add billing page and PayMongo integration"
```

---

## Task 18: PayMongo Webhook Handler

**Files:**
- Create: `src/app/api/webhooks/paymongo/route.ts`

- [ ] **Step 1: Build webhook handler**

Create `src/app/api/webhooks/paymongo/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Use service role key for webhook (no user context)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const WEBHOOK_SECRET = process.env.PAYMONGO_WEBHOOK_SECRET!;

function verifySignature(payload: string, signature: string): boolean {
  // PayMongo webhook signature verification
  // signature format: "t=timestamp,te=test_signature,li=live_signature"
  // Verify using HMAC SHA256 of "timestamp.payload" with webhook secret
  const crypto = require("crypto");
  const parts = signature.split(",");
  const timestamp = parts.find((p: string) => p.startsWith("t="))?.slice(2);
  const testSig = parts.find((p: string) => p.startsWith("te="))?.slice(3);
  const liveSig = parts.find((p: string) => p.startsWith("li="))?.slice(3);

  const expectedSig = crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(`${timestamp}.${payload}`)
    .digest("hex");

  return expectedSig === testSig || expectedSig === liveSig;
}

export async function POST(request: Request) {
  const payload = await request.text();
  const signature = request.headers.get("paymongo-signature") ?? "";

  if (!verifySignature(payload, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(payload);
  const eventType = event.data?.attributes?.type;
  const eventData = event.data?.attributes?.data;

  switch (eventType) {
    case "subscription.invoice.paid": {
      const subscriptionId = eventData?.attributes?.subscription_id;
      if (subscriptionId) {
        await supabase
          .from("organizations")
          .update({
            subscription_status: "active",
            current_period_ends_at: eventData?.attributes?.period_end,
          })
          .eq("paymongo_subscription_id", subscriptionId);
      }
      break;
    }

    case "subscription.invoice.payment_failed": {
      const subscriptionId = eventData?.attributes?.subscription_id;
      if (subscriptionId) {
        await supabase
          .from("organizations")
          .update({ subscription_status: "past_due" })
          .eq("paymongo_subscription_id", subscriptionId);
      }
      break;
    }

    case "subscription.past_due":
    case "subscription.unpaid": {
      const subscriptionId = eventData?.id;
      if (subscriptionId) {
        await supabase
          .from("organizations")
          .update({ subscription_status: "unpaid" })
          .eq("paymongo_subscription_id", subscriptionId);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
```

- [ ] **Step 2: Add SUPABASE_SERVICE_ROLE_KEY to .env.local.example**

Append to the existing `.env.local.example`:

```
# PayMongo
PAYMONGO_SECRET_KEY=sk_test_...
PAYMONGO_PUBLIC_KEY=pk_test_...
PAYMONGO_WEBHOOK_SECRET=whsk_...
PAYMONGO_PLAN_SOLO=plan_...
PAYMONGO_PLAN_PRACTICE=plan_...
PAYMONGO_PLAN_FIRM=plan_...

# Supabase (service role — for webhooks only, never expose to client)
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/webhooks/ .env.local.example
git commit -m "feat(pro): add PayMongo webhook handler with signature verification"
```

---

## Task 19: Wizard Updates for Pro Users

**Files:**
- Modify: `src/components/wizard/corp-type-step.tsx`
- Modify: `src/components/wizard/wizard-shell.tsx`

- [ ] **Step 1: Add corp name to wizard state**

Modify `src/components/wizard/wizard-shell.tsx`:
- Add `corpName: string | null` to `WizardState` interface (default: null)
- Pass `corpName` through to the encoded wizard data

The wizard needs to know if the current user is a pro user. Since the wizard is a client component, check user metadata on mount:

```typescript
const [isProUser, setIsProUser] = useState(false);

useEffect(() => {
  const supabase = createClient();
  supabase.auth.getUser().then(({ data: { user } }) => {
    if (user?.user_metadata?.role === "pro") setIsProUser(true);
  });
}, []);
```

Pass `isProUser` to `CorpTypeStep`.

- [ ] **Step 2: Add corp name field to corp type step**

Modify `src/components/wizard/corp-type-step.tsx`:
- Accept `isProUser` and `corpName` props
- When `isProUser` is true, render a "Corporation Name" text input above the corp type radio buttons
- Wire the input to update `corpName` in wizard state

```tsx
{isProUser && (
  <div className="space-y-1.5 mb-6">
    <Label htmlFor="corp-name" className="font-body text-sm text-charcoal">
      Corporation Name
    </Label>
    <input
      id="corp-name"
      type="text"
      value={corpName ?? ""}
      onChange={(e) => onCorpNameChange(e.target.value)}
      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 font-body text-sm text-charcoal placeholder:text-gray-muted focus:border-sec-blue focus:outline-none focus:ring-2 focus:ring-sec-blue/20"
      placeholder="e.g. ABC Holdings Corp."
    />
  </div>
)}
```

- [ ] **Step 3: Update wizard completion to save to org for pro users**

In `wizard-shell.tsx`, when the wizard completes and the user is pro:
- Instead of just encoding data in URL, also POST to save the corporation to the org
- Redirect to `/dashboard/[newCorpId]` instead of `/results`

```typescript
if (isProUser) {
  // Save corporation to org
  const res = await fetch("/api/pro/corporations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: state.corpName,
      corpType: state.corpType,
      incorporationYear: state.incorporationYear,
      reBracket: state.reBracket,
      mc28Compliant: state.mc28Compliant,
      filedReports: state.filedReports,
      suspensionDate: state.suspensionDate,
      revocationDate: state.revocationDate,
    }),
  });
  const { corporationId } = await res.json();
  router.push(`/dashboard/${corporationId}`);
} else {
  // Existing flow: encode and redirect to results
  const encoded = encodeWizardData(state);
  router.push(`/results?data=${encoded}`);
}
```

- [ ] **Step 4: Build the pro corporations POST route**

Create `src/app/api/pro/corporations/route.ts`:

```typescript
// POST /api/pro/corporations
// Creates a corporation + filing records for the org
// Body: { name, corpType, incorporationYear, reBracket, mc28Compliant, filedReports, suspensionDate, revocationDate }
// 1. requirePro()
// 2. Check corp limit
// 3. Insert corporation with organization_id
// 4. Insert filing records
// 5. Compute compliance and save to computations table
// 6. Return: { corporationId }
```

- [ ] **Step 5: Commit**

```bash
git add src/components/wizard/ src/app/api/pro/corporations/
git commit -m "feat(pro): add corp name to wizard and save to org for pro users"
```

---

## Task 20: E2E Tests

**Files:**
- Create: `__tests__/e2e/pro-signup.spec.ts`
- Create: `__tests__/e2e/dashboard.spec.ts`

- [ ] **Step 1: Write pro signup E2E test**

Create `__tests__/e2e/pro-signup.spec.ts`:

```typescript
import { test, expect } from "@playwright/test";

test.describe("Pro Signup", () => {
  test("shows pricing page at /pro", async ({ page }) => {
    await page.goto("/pro");
    await expect(page.locator("text=Solo")).toBeVisible();
    await expect(page.locator("text=Practice")).toBeVisible();
    await expect(page.locator("text=Firm")).toBeVisible();
    await expect(page.locator("text=₱999")).toBeVisible();
  });

  test("signup creates org and redirects to dashboard", async ({ page }) => {
    await page.goto("/pro/signup");
    await page.fill('[id="org-name"]', "Test Practice");
    await page.fill('[id="email"]', `test-${Date.now()}@example.com`);
    await page.fill('[id="password"]', "testpassword123");
    await page.fill('[id="confirm-password"]', "testpassword123");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard**");
    await expect(page.locator("text=Test Practice")).toBeVisible();
  });
});
```

- [ ] **Step 2: Write dashboard E2E test**

Create `__tests__/e2e/dashboard.spec.ts`:

```typescript
import { test, expect } from "@playwright/test";

test.describe("Pro Dashboard", () => {
  test("redirects non-pro users to /pro", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForURL("**/login**");
  });

  test("shows empty state for new org", async ({ page }) => {
    // This test requires a seeded pro user
    // Setup: login as pro user, navigate to dashboard
    // Verify: "0" total corporations, empty table message
  });
});
```

- [ ] **Step 3: Run E2E tests**

Run: `cd apps/sec-compliance && npx playwright test __tests__/e2e/pro-signup.spec.ts __tests__/e2e/dashboard.spec.ts`

- [ ] **Step 4: Commit**

```bash
git add __tests__/e2e/
git commit -m "test(pro): add E2E tests for pro signup and dashboard"
```

---

## Task 21: Integration Wiring & Polish

**Files:**
- Modify: `src/app/dashboard/[corpId]/page.tsx` — wire up filing edit modal and generate report button
- Modify: `src/app/dashboard/page.tsx` — wire up CSV import modal
- Modify: `src/components/pro/corporation-table.tsx` — wire CSV import button

- [ ] **Step 1: Wire CSV import modal into dashboard**

In `src/app/dashboard/page.tsx`, import `CSVImportModal` and render it. The "+ Import CSV" button in the corporation table opens it. On successful import, refresh the page data.

- [ ] **Step 2: Wire filing edit modal into corp detail**

In `src/app/dashboard/[corpId]/page.tsx`:
- Import `FilingEditModal`
- "Edit Filing History" button opens it
- On save: recompute compliance, refresh page data

- [ ] **Step 3: Wire generate report button**

In `src/app/dashboard/[corpId]/page.tsx`:
- "Generate Report" button calls `/api/pro/reports` POST
- On success: download the PDF via signed URL from response
- Show loading state during generation

- [ ] **Step 4: Final commit**

```bash
git add src/app/dashboard/ src/components/pro/
git commit -m "feat(pro): wire modals and report generation into dashboard"
```

---

## Summary of Commits

| # | Commit Message |
|---|---------------|
| 1 | `feat(db): add pro tier migration — organizations, members, reports tables` |
| 2 | `feat(pro): add pro types and auth helpers` |
| 3 | `feat(auth): add role-based routing for pro routes` |
| 4 | `feat(nav): update header with role-based navigation` |
| 5 | `feat(pro): add pro landing and pricing page` |
| 6 | `feat(pro): add pro signup with organization creation` |
| 7 | `feat(pro): add dashboard layout with trial banner and pro nav` |
| 8 | `feat(pro): add dashboard summary stats component` |
| 9 | `feat(pro): add corporation table with filters and sorting` |
| 10 | `feat(pro): add dashboard page with stats and corporation table` |
| 11 | `feat(pro): add corporation detail page with merged results and remediation` |
| 12 | `feat(pro): add CSV parse and validation logic with tests` |
| 13 | `feat(pro): add CSV import and filing edit modals` |
| 14 | `feat(pro): add PDF report generation with @react-pdf/renderer` |
| 15 | `feat(pro): add reports history page` |
| 16 | `feat(pro): add organization settings page with logo upload` |
| 17 | `feat(pro): add billing page and PayMongo integration` |
| 18 | `feat(pro): add PayMongo webhook handler with signature verification` |
| 19 | `feat(pro): add corp name to wizard and save to org for pro users` |
| 20 | `test(pro): add E2E tests for pro signup and dashboard` |
| 21 | `feat(pro): wire modals and report generation into dashboard` |
