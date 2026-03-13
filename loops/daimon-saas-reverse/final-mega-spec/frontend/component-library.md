# Component Library — Complete Specification

> File: `final-mega-spec/frontend/component-library.md`
> Last updated: 2026-03-13
> Cross-references:
>   - Brand guidelines: [../source/brand-guidelines.md](../source/brand-guidelines.md)
>   - Design system: [../ui/design-system.md](../ui/design-system.md)
>   - Dashboard spec: [./dashboard.md](./dashboard.md)
>   - Auth pages spec: [./auth-pages.md](./auth-pages.md)

This file documents every reusable React component in the Daimon SaaS website. Each component entry includes:
- File path (relative to `apps/web/`)
- TypeScript props interface (complete, no `any`)
- All variants
- All states (default, hover, focus, active, disabled, loading, error)
- Exact dimensions, colors, typography, spacing from PyMC brand system
- Implementation notes

---

## Table of Contents

1. [Layout Components](#1-layout-components) ← **This section (aspect 4.9a)**
2. Form Components (aspect 4.9b)
3. [Feedback Components](#3-feedback-components) ← **This section (aspect 4.9c)**
4. [Data Display Components](#4-data-display-components) ← **This section (aspect 4.9d)**
5. Action Components (aspect 4.9e)

---

## 1. Layout Components

The layout components define the structural shells for every page. There are two distinct shells:
- **Auth shell** — used by `/login`, `/signup`, `/reset-password`, `/reset-password/confirm`
- **Dashboard shell** — used by all `/dashboard/**` and `/admin/**` routes

### 1.1 DashboardLayout

**File:** `app/(dashboard)/layout.tsx`

**Purpose:** Root layout for all authenticated dashboard routes. Composes `Sidebar` + `DashboardTopbar` + main content area. This is a Next.js layout file, not a reusable component — it is the root wrapper.

**Props interface:** None (Next.js layout receives `{ children: React.ReactNode }` implicitly)

**Markup structure:**

```tsx
// app/(dashboard)/layout.tsx
import { Sidebar } from '@/components/layout/Sidebar'
import { DashboardTopbar } from '@/components/layout/DashboardTopbar'
import { createServerComponentClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="dashboard-shell">
      <Sidebar />
      <div className="main-area">
        <DashboardTopbar />
        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  )
}
```

**CSS classes:**

| Class | Tailwind | Notes |
|-------|----------|-------|
| `.dashboard-shell` | `flex min-h-screen bg-[#F7F7F7]` | Root flex container, full viewport height |
| `.main-area` | `flex flex-1 flex-col ml-[240px]` | Offset by sidebar width; flex column for topbar + content |
| `.page-content` | `flex-1 p-8 max-w-[1200px] w-full` | Scrollable content, max-width constrained |

**Responsive behavior:**

| Breakpoint | Behavior |
|------------|----------|
| Desktop (≥1024px) | Sidebar visible, `.main-area` has `ml-[240px]` |
| Tablet (768–1023px) | Sidebar collapses to icon-only (56px). `.main-area` has `ml-[56px]`. Topbar shows hamburger icon |
| Mobile (<768px) | Sidebar hidden. `.main-area` has `ml-0`. Topbar shows hamburger. `MobileNav` overlay used |

**Auth guard:** Session checked server-side in layout. Missing session → `redirect('/login')`. No client-side flicker.

---

### 1.2 Sidebar

**File:** `components/layout/Sidebar.tsx`

**Purpose:** Fixed left navigation panel for all authenticated pages. Shows logo, nav links, and user identity footer.

**Props interface:**

```typescript
interface SidebarProps {
  // No props — all data fetched internally or from session context
  // Current route detected via `usePathname()` hook for active state
}
```

**Dimensions:**

| Property | Value |
|----------|-------|
| Width | `240px` (fixed) |
| Height | `100vh` (full viewport height) |
| Position | `fixed`, `top: 0`, `left: 0` |
| z-index | `40` |
| Overflow-y | `auto` (scrollable if nav overflows) |

**Background and border:**

| Property | Value |
|----------|-------|
| Background | Navy (`#0C1F40`) |
| Right border | `1px solid rgba(255,255,255,0.06)` |

**Internal structure (top to bottom):**

```
Sidebar
├── LogoArea          (height: 64px)
│   ├── SVG rocket icon (24px, white)
│   └── "Daimon" wordmark
├── NavSection (flex-1, overflow-y-auto)
│   ├── NavItem: Dashboard    → /dashboard
│   ├── NavItem: Integrations → /dashboard/integrations
│   ├── NavItem: Billing      → /dashboard/billing
│   ├── NavItem: Settings     → /dashboard/settings
│   └── NavItem: Documentation → /docs (opens in same tab)
└── SidebarFooter (absolute, bottom: 0)
    ├── UserAvatar (24px circle)
    ├── UserEmail (truncated)
    └── LogoutButton (icon only)
```

---

#### 1.2.1 Sidebar — LogoArea

| Property | Value |
|----------|-------|
| Height | `64px` |
| Padding | `0 16px` |
| Display | `flex`, `align-items: center`, `gap: 8px` |
| Border-bottom | `1px solid rgba(255,255,255,0.08)` |
| Link | `<Link href="/dashboard">` wrapping the entire area |
| Cursor | `pointer` |

SVG rocket icon:
- Size: `24px × 24px`
- Color: White (`#FFFFFF`)
- Import path: `@/components/icons/RocketIcon`

Wordmark:
- Text: `"Daimon"`
- Font: Archivo, `16px`, weight `700`, White (`#FFFFFF`)
- Letter-spacing: `normal`
- No text-transform

Hover state (on entire LogoArea link):
- Opacity: `0.85`
- Transition: `opacity 0.15s ease`

---

#### 1.2.2 Sidebar — NavItem

**File:** `components/layout/SidebarNavItem.tsx`

**Props interface:**

```typescript
interface SidebarNavItemProps {
  href: string           // Route path
  label: string          // Display text
  icon: React.ReactNode  // Lucide icon component at 20px
  isExternal?: boolean   // If true, renders <a target="_self"> instead of <Link>
}
```

**Dimensions:**

| Property | Value |
|----------|-------|
| Height | `44px` |
| Padding | `0 16px` |
| Display | `flex`, `align-items: center`, `gap: 12px` |
| Border-radius | `0` (PyMC sharp corners — never round) |
| Margin | `2px 0` (between items) |

**Icon:**

| Property | Value |
|----------|-------|
| Size | `20px × 20px` |
| Color | Inherited from parent text color |
| Flex-shrink | `0` |

**Label:**

| Property | Value |
|----------|-------|
| Font | Inter, `14px`, weight `500` |
| Color | Inherited from parent |
| Overflow | `hidden`, `text-overflow: ellipsis`, `white-space: nowrap` |

**States:**

| State | Background | Text Color | Left Border | Transition |
|-------|-----------|-----------|-------------|------------|
| Default | `transparent` | `rgba(255,255,255,0.65)` | None | — |
| Hover | `rgba(255,255,255,0.06)` | `rgba(255,255,255,0.90)` | None | `background 0.15s ease, color 0.15s ease` |
| Active (current page) | `rgba(180,231,221,0.12)` | Aqua (`#B4E7DD`) | `2px solid #B4E7DD` | — |
| Focus-visible | `outline: 2px solid #B4E7DD`, `outline-offset: -2px` | White (`#FFFFFF`) | — | — |
| Pressed (mousedown) | `rgba(255,255,255,0.10)` | White | — | — |

**Active state detection:**

```typescript
const pathname = usePathname()
const isActive = pathname === href || pathname.startsWith(href + '/')
// Exception: Dashboard link (/dashboard) uses exact match only to avoid
// matching /dashboard/integrations etc.
const isActive = href === '/dashboard'
  ? pathname === '/dashboard'
  : pathname.startsWith(href)
```

**Nav items list (in render order):**

| Index | Label | Route | Icon (Lucide) | isExternal |
|-------|-------|-------|---------------|------------|
| 0 | Dashboard | `/dashboard` | `LayoutDashboard` (20px) | false |
| 1 | Integrations | `/dashboard/integrations` | `Plug` (20px) | false |
| 2 | Billing | `/dashboard/billing` | `CreditCard` (20px) | false |
| 3 | Settings | `/dashboard/settings` | `Settings` (20px) | false |
| 4 | Documentation | `/docs` | `BookOpen` (20px) | false |

---

#### 1.2.3 Sidebar — SidebarFooter

| Property | Value |
|----------|-------|
| Position | `absolute`, `bottom: 0`, `left: 0`, `right: 0` |
| Padding | `16px` |
| Border-top | `1px solid rgba(255,255,255,0.08)` |
| Display | `flex`, `align-items: center`, `gap: 10px` |
| Background | Navy (`#0C1F40`) (matches sidebar — needed because sidebar scrolls above it) |
| z-index | `1` (above nav scroll content) |

**UserAvatar:**

| Property | Value |
|----------|-------|
| Size | `24px × 24px` |
| Shape | Circle (`border-radius: 50%`) — exception to PyMC no-radius rule: user avatars are always circular |
| Background | Aqua (`#B4E7DD`) |
| Content | User's initials (first letter of email, uppercase), Navy text, 10px Inter weight 600 |
| Fallback | If email unavailable: single "?" character |

**UserEmail:**

| Property | Value |
|----------|-------|
| Font | Inter, `13px`, weight `400` |
| Color | `rgba(255,255,255,0.55)` |
| Overflow | `hidden`, `text-overflow: ellipsis`, `white-space: nowrap` |
| Max-width | `140px` |
| Flex | `1 1 auto` |

**LogoutButton:**

| Property | Value |
|----------|-------|
| Width | `28px` |
| Height | `28px` |
| Display | `flex`, `align-items: center`, `justify-content: center` |
| Background | `transparent` |
| Border | None |
| Cursor | `pointer` |
| Flex-shrink | `0` |
| Icon | Lucide `LogOut`, `16px`, `rgba(255,255,255,0.55)` |
| Tooltip | `title="Sign out"` (native browser tooltip) |
| Hover icon color | `rgba(255,255,255,0.90)` |
| Hover background | `rgba(255,255,255,0.08)` |
| Transition | `color 0.15s ease, background 0.15s ease` |
| Focus-visible | `outline: 2px solid #B4E7DD`, `outline-offset: 2px` |

**Logout action:**

```typescript
async function handleLogout() {
  await supabase.auth.signOut()
  router.push('/login')
}
```

**Loading state during logout:**
- Icon changes to Lucide `Loader2` (16px) with `animate-spin` class
- Button disabled (`pointer-events: none`)
- Duration: until `signOut()` resolves (typically <500ms)

---

### 1.3 DashboardTopbar

**File:** `components/layout/DashboardTopbar.tsx`

**Purpose:** Sticky top bar inside the dashboard shell. Shows current page title, tenant name, and plan badge.

**Props interface:**

```typescript
interface DashboardTopbarProps {
  pageTitle: string        // e.g. "Dashboard", "Integrations", "Billing"
  tenantName: string       // e.g. "Acme Corp" — loaded from tenants.name
  plan: 'free' | 'starter' | 'pro'  // Current subscription plan
}
```

**Note on data flow:** `DashboardTopbar` is rendered inside `DashboardLayout`. The layout fetches tenant data server-side and passes `tenantName` and `plan` as props. `pageTitle` is passed from each individual page via a React context or a slot pattern. Implementation:

```typescript
// app/(dashboard)/layout.tsx — fetch tenant data and pass to Topbar
const { data: tenant } = await supabase
  .from('tenants')
  .select('name, plan')
  .single()

// DashboardTopbar receives tenantName and plan
// pageTitle is provided by each page via <DashboardPageTitle> context
```

**Dimensions:**

| Property | Value |
|----------|-------|
| Height | `56px` |
| Position | `sticky`, `top: 0` |
| z-index | `30` |
| Padding | `0 32px` |
| Display | `flex`, `align-items: center`, `justify-content: space-between` |

**Background and border:**

| Property | Value |
|----------|-------|
| Background | White (`#FFFFFF`) |
| Border-bottom | `1px solid rgba(12,31,64,0.08)` |
| Box-shadow | None |

**Left side — PageTitle:**

| Property | Value |
|----------|-------|
| Font | Archivo, `font-variation-settings: 'wdth' 112.5`, `20px`, weight `500` |
| Color | Navy (`#0C1F40`) |
| Content | The `pageTitle` prop value |

**Right side — TenantInfo:**

| Property | Value |
|----------|-------|
| Display | `flex`, `align-items: center`, `gap: 12px` |

TenantName:
| Property | Value |
|----------|-------|
| Font | Inter, `14px`, weight `500` |
| Color | Navy (`#0C1F40`) |
| Max-width | `160px` |
| Overflow | `hidden`, `text-overflow: ellipsis`, `white-space: nowrap` |

PlanBadge (see [PlanBadge component](#plan-badge)):
- Rendered inline in the topbar right section
- Shows current plan as a small tag

**Mobile behavior (< 768px):**

| Property | Mobile Value |
|----------|-------------|
| Left side | Hamburger menu button (`MenuIcon`, 20px, Navy) + page title |
| Right side | Plan badge only (tenant name hidden to save space) |
| Padding | `0 16px` |

Hamburger button:
- Width: `40px`, Height: `40px`
- Background: `transparent`
- Border: none
- On click: opens `MobileNav` overlay (see section 1.4)
- Focus-visible: `outline: 2px solid #B4E7DD`, `outline-offset: 2px`

**Plan Badge** (embedded sub-component):

```typescript
// components/layout/PlanBadge.tsx
interface PlanBadgeProps {
  plan: 'free' | 'starter' | 'pro'
}
```

| Plan | Background | Text | Border |
|------|-----------|------|--------|
| `free` | `rgba(159,170,226,0.20)` (20% Periwinkle) | Navy (`#0C1F40`) | None |
| `starter` | `rgba(180,231,221,0.30)` (30% Aqua) | Navy (`#0C1F40`) | None |
| `pro` | Aqua (`#B4E7DD`) | Navy (`#0C1F40`) | None |

| Property | Value |
|----------|-------|
| Height | `auto` (flex) |
| Padding | `3px 10px` |
| Font | Inter, `12px`, weight `600` |
| Text-transform | `uppercase` |
| Letter-spacing | `0.05em` |
| Border-radius | `0` (PyMC sharp corners) |

Text labels:
| Plan | Label |
|------|-------|
| `free` | `FREE` |
| `starter` | `STARTER` |
| `pro` | `PRO` |

---

### 1.4 MobileNav

**File:** `components/layout/MobileNav.tsx`

**Purpose:** Full-screen navigation overlay for mobile viewports (<768px). Triggered by the hamburger button in `DashboardTopbar`. Slides in from the left or overlays the screen.

**Props interface:**

```typescript
interface MobileNavProps {
  isOpen: boolean          // Controlled by parent (DashboardLayout via context)
  onClose: () => void      // Called when user taps backdrop, X button, or nav link
  currentPath: string      // Current pathname for active state
  tenantName: string       // Displayed in header
  plan: 'free' | 'starter' | 'pro'
  userEmail: string        // Displayed in footer
}
```

**Overlay dimensions:**

| Property | Value |
|----------|-------|
| Position | `fixed`, `inset: 0` |
| z-index | `50` (above everything) |
| Display | `flex` |

**Backdrop:**

| Property | Value |
|----------|-------|
| Position | fills remaining width to the right of nav panel |
| Background | `rgba(0,0,0,0.50)` |
| On click | calls `onClose()` |
| Transition | `opacity 0.2s ease` |

**Nav panel:**

| Property | Value |
|----------|-------|
| Width | `280px` |
| Height | `100vh` |
| Background | Navy (`#0C1F40`) |
| Overflow-y | `auto` |
| Transform | `translateX(-100%)` when closed; `translateX(0)` when open |
| Transition | `transform 0.25s ease` |

**Animation states:**

| State | Transform | Backdrop Opacity |
|-------|-----------|-----------------|
| Closed | `translateX(-280px)` | `0` |
| Open | `translateX(0)` | `0.50` |
| Opening | CSS transition 250ms ease | CSS transition 200ms ease |
| Closing | CSS transition 250ms ease | CSS transition 200ms ease |

**Internal structure:**

```
MobileNav panel
├── Header (64px)
│   ├── Logo (SVG 24px + "Daimon" wordmark, same as Sidebar)
│   └── CloseButton (X icon, 20px, white 65%)
├── NavItems (same as Sidebar nav items, full list)
│   ├── Dashboard
│   ├── Integrations
│   ├── Billing
│   ├── Settings
│   └── Documentation
└── Footer (bottom, not absolute — naturally at end of content)
    ├── UserAvatar (24px circle) + UserEmail
    └── LogoutButton
```

**Header:**

| Property | Value |
|----------|-------|
| Height | `64px` |
| Padding | `0 16px` |
| Display | `flex`, `align-items: center`, `justify-content: space-between` |
| Border-bottom | `1px solid rgba(255,255,255,0.08)` |

Close button:
- Width: `32px`, Height: `32px`
- Icon: Lucide `X`, 20px, `rgba(255,255,255,0.65)`
- Background: `transparent`, border: none
- Hover: icon color → `rgba(255,255,255,0.90)`, background → `rgba(255,255,255,0.08)`
- Focus-visible: `outline: 2px solid #B4E7DD`, `outline-offset: 2px`
- On click: calls `onClose()`

**Nav items in MobileNav:** Identical spec to [SidebarNavItem](#122-sidebar---navitem). Same heights, fonts, colors, active states.

On nav item click: calls `onClose()` then navigates to route.

**Footer:**

| Property | Value |
|----------|-------|
| Padding | `16px` |
| Border-top | `1px solid rgba(255,255,255,0.08)` |
| Margin-top | `auto` (pushes to bottom) |
| Display | `flex`, `align-items: center`, `gap: 10px` |

Content: same as [SidebarFooter](#123-sidebar---sidebarfooter) — UserAvatar + UserEmail + LogoutButton.

**Keyboard behavior:**
- When open: Tab key cycles through focusable items within the panel only (focus trap)
- Escape key: calls `onClose()`
- `aria-modal="true"` on panel
- `aria-label="Navigation"` on panel

**Body scroll lock:** When MobileNav is open, add `overflow: hidden` to `<body>` to prevent background scroll. Remove on close.

**ARIA:**
```html
<div role="dialog" aria-modal="true" aria-label="Navigation menu" aria-hidden={!isOpen}>
```

---

### 1.5 AuthLayout

**File:** `app/(auth)/layout.tsx`

**Purpose:** Root layout for all authentication pages (`/login`, `/signup`, `/reset-password`, `/reset-password/confirm`). Provides centered-card shell with logo and footer links. Not a reusable component — it's the Next.js auth route group layout.

**Auth guard (inverse):**
```typescript
// In layout — redirect authenticated users away from auth pages
const { data: { session } } = await supabase.auth.getSession()
if (session) {
  redirect('/dashboard')
}
```

**Shell structure:**

```tsx
<div className="auth-shell">
  <div className="auth-container">
    <AuthLogo />
    {children}
    <AuthFooterLinks />
  </div>
</div>
```

**CSS:**

| Class | Tailwind | Description |
|-------|----------|-------------|
| `.auth-shell` | `min-h-screen bg-[#F7F7F7] flex items-center justify-center p-4` | Full viewport, centered |
| `.auth-container` | `w-full max-w-[440px] flex flex-col gap-8` | Constrained width column |

---

### 1.6 AuthCard

**File:** `components/layout/AuthCard.tsx`

**Purpose:** White card container used inside the auth layout. Wraps the form content for login, signup, and reset-password pages.

**Props interface:**

```typescript
interface AuthCardProps {
  children: React.ReactNode
  title: string              // Card heading, e.g. "Sign in to Daimon"
  description?: string       // Optional subtitle, e.g. "Enter your email and password"
}
```

**Dimensions and styling:**

| Property | Value |
|----------|-------|
| Background | White (`#FFFFFF`) |
| Border | `1px solid rgba(12,31,64,0.10)` |
| Border-radius | `0` (PyMC sharp corners — never rounded) |
| Box-shadow | None |
| Padding | `40px` (all sides) |
| Width | `100%` (inherits from auth-container max-width 440px) |

**Internal structure:**

```
AuthCard
├── CardHeader
│   ├── Title (Archivo Semi-Expanded, 24px, weight 500, Navy)
│   └── Description? (Inter, 14px, weight 400, Navy 55% opacity)
├── CardDivider (1px solid rgba(12,31,64,0.08), margin 24px 0)
└── CardBody (children)
```

**CardHeader:**

| Property | Value |
|----------|-------|
| Margin-bottom | `24px` |
| Display | `flex`, `flex-direction: column`, `gap: 6px` |

Title:
| Property | Value |
|----------|-------|
| Font | Archivo, `font-variation-settings: 'wdth' 112.5`, `24px`, weight `500` |
| Color | Navy (`#0C1F40`) |
| Line-height | `1.2` |

Description:
| Property | Value |
|----------|-------|
| Font | Inter, `14px`, weight `400` |
| Color | `rgba(12,31,64,0.55)` |
| Line-height | `1.5` |

**Mobile behavior (<440px viewport width):**
- Card has no side padding from shell (`p-4` provides 16px page margin)
- Card padding reduces to `24px` (all sides)
- Card has no horizontal overflow: stays within viewport

---

### 1.7 AuthLogo

**File:** `components/layout/AuthLogo.tsx`

**Purpose:** Centered logo displayed above the auth card on authentication pages.

**Props interface:**

```typescript
interface AuthLogoProps {
  // No props
}
```

**Markup:**

```tsx
<div className="auth-logo">
  <Link href="/">
    <RocketIcon size={32} color="#0C1F40" />
    <span>Daimon</span>
  </Link>
</div>
```

**Styling:**

| Property | Value |
|----------|-------|
| Container display | `flex`, `justify-content: center` |
| Link display | `flex`, `align-items: center`, `gap: 8px` |
| SVG rocket icon | `32px × 32px`, Navy (`#0C1F40`) |
| Wordmark text | Archivo, `20px`, weight `700`, Navy (`#0C1F40`) |
| Link hover | `opacity: 0.80`, `transition: opacity 0.15s ease` |
| Link focus-visible | `outline: 2px solid #B4E7DD`, `outline-offset: 4px` |

**Dark background variant:** If rendered on a Navy background (not used in auth flow, but exported for reuse):
- Icon color: Aqua (`#B4E7DD`)
- Text color: White (`#FFFFFF`)

---

### 1.8 AuthFooterLinks

**File:** `components/layout/AuthFooterLinks.tsx`

**Purpose:** Legal/support links displayed below the auth card.

**Props interface:**

```typescript
interface AuthFooterLinksProps {
  // No props
}
```

**Markup structure:**

```tsx
<footer className="auth-footer">
  <nav aria-label="Legal links">
    <Link href="/legal/privacy-policy">Privacy Policy</Link>
    <span aria-hidden="true">·</span>
    <Link href="/legal/terms-of-service">Terms of Service</Link>
    <span aria-hidden="true">·</span>
    <Link href="/docs">Help</Link>
  </nav>
</footer>
```

**Styling:**

| Property | Value |
|----------|-------|
| Container display | `flex`, `justify-content: center` |
| Nav display | `flex`, `align-items: center`, `gap: 8px` |
| Font | Inter, `13px`, weight `400` |
| Color | `rgba(12,31,64,0.45)` |
| Link hover | `rgba(12,31,64,0.80)`, `transition: color 0.15s ease` |
| Link focus-visible | `outline: 2px solid #B4E7DD`, `outline-offset: 2px` |
| Separator (·) | `rgba(12,31,64,0.25)`, non-interactive, `aria-hidden="true"` |

---

### 1.9 PageShell

**File:** `components/layout/PageShell.tsx`

**Purpose:** Wrapper used within individual dashboard pages to provide consistent heading, description, and breadcrumb structure. Used on every dashboard page to standardize the top-of-content area.

**Props interface:**

```typescript
interface PageShellProps {
  title: string               // Page heading, e.g. "Integrations"
  description?: string        // Optional subtitle below heading
  breadcrumbs?: BreadcrumbItem[]  // Optional breadcrumb trail
  actions?: React.ReactNode   // Optional right-aligned action buttons
  children: React.ReactNode   // Page content below header
}

interface BreadcrumbItem {
  label: string
  href?: string   // If omitted, item is non-clickable (current page)
}
```

**Markup structure:**

```tsx
<div className="page-shell">
  {breadcrumbs && (
    <Breadcrumbs items={breadcrumbs} />
  )}
  <div className="page-shell-header">
    <div className="page-shell-heading">
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </div>
    {actions && (
      <div className="page-shell-actions">{actions}</div>
    )}
  </div>
  <div className="page-shell-content">
    {children}
  </div>
</div>
```

**CSS:**

| Class | Tailwind | Description |
|-------|----------|-------------|
| `.page-shell` | `flex flex-col gap-6` | Root wrapper |
| `.page-shell-header` | `flex items-start justify-between gap-4` | Heading + actions row |
| `.page-shell-heading` | `flex flex-col gap-1` | Title + description stack |
| `.page-shell-actions` | `flex items-center gap-3 shrink-0` | Right-aligned buttons |
| `.page-shell-content` | `flex flex-col gap-6` | Page content |

**Title (h1):**

| Property | Value |
|----------|-------|
| Font | Archivo, `font-variation-settings: 'wdth' 112.5`, `28px`, weight `500` |
| Color | Navy (`#0C1F40`) |
| Line-height | `1.2` |
| Margin | `0` |

**Description (p):**

| Property | Value |
|----------|-------|
| Font | Inter, `15px`, weight `400` |
| Color | `rgba(12,31,64,0.55)` |
| Line-height | `1.6` |
| Margin | `0` |
| Max-width | `600px` |

**Breadcrumbs (Breadcrumbs sub-component):**

```typescript
// Rendered as <nav aria-label="Breadcrumb">
// Items separated by "/" chevron
// Last item non-linked (current page)
```

| Property | Value |
|----------|-------|
| Font | Inter, `13px`, weight `400` |
| Color (link) | `rgba(12,31,64,0.55)` |
| Color (current) | `rgba(12,31,64,0.80)` |
| Separator | Lucide `ChevronRight`, `12px`, `rgba(12,31,64,0.30)` |
| Link hover | `rgba(12,31,64,0.80)`, underline |
| Margin-bottom | `8px` |

**Mobile behavior (<768px):**
- `.page-shell-header` stacks vertically (`flex-col`)
- `.page-shell-actions` moves below heading, full-width (`width: 100%`)
- Title font-size reduces to `24px`

---

### 1.10 PublicNavbar

**File:** `components/layout/PublicNavbar.tsx`

**Purpose:** Top navigation bar for public-facing pages (landing page, docs, legal pages). Sticky, frosted-glass effect. Distinct from `DashboardTopbar`.

**Props interface:**

```typescript
interface PublicNavbarProps {
  transparent?: boolean  // If true, start transparent (used on landing hero);
                         // becomes opaque on scroll
}
```

**Dimensions:**

| Property | Value |
|----------|-------|
| Height (desktop) | `64px` |
| Height (mobile) | `56px` |
| Position | `sticky`, `top: 0` |
| z-index | `50` |
| Horizontal padding | `32px` (desktop), `16px` (mobile) |

**Background:**

| Property | Value |
|----------|-------|
| Default | `rgba(255,255,255,0.92)` |
| Backdrop-filter | `blur(12px)` |
| Border-bottom | `1px solid rgba(12,31,64,0.06)` |
| Transition | `background 0.3s ease` (for transparent → opaque on scroll) |

**Internal structure:**

```
PublicNavbar
├── Container (max-width: 1280px, centered, full-width padding)
│   ├── Left: Logo (SVG 28px + "Daimon" wordmark)
│   ├── Center: NavLinks (desktop only)
│   │   ├── Features
│   │   ├── Pricing
│   │   ├── Docs
│   │   └── FAQ
│   └── Right: CTAs
│       ├── "Sign in" link (ghost style)
│       └── "Get started" button (primary, compact size)
└── MobileHamburger (mobile only, replaces center + right)
```

**Container:**

| Property | Value |
|----------|-------|
| Max-width | `1280px` |
| Margin | `0 auto` |
| Width | `100%` |
| Display | `flex`, `align-items: center`, `justify-content: space-between` |
| Height | Inherits from navbar |

**Logo (PublicNavbar context):**

| Property | Value |
|----------|-------|
| SVG rocket icon | `28px × 28px`, Navy |
| Wordmark | Archivo, `18px`, weight `700`, Navy |
| Gap | `8px` |
| Link | `href="/"` |
| Hover | `opacity: 0.85` |

**NavLinks (desktop, center):**

| Property | Value |
|----------|-------|
| Display | `flex`, `align-items: center`, `gap: 28px` |
| Hidden on mobile | `@media (max-width: 900px) { display: none }` |

NavLink item:
| Property | Value |
|----------|-------|
| Font | Inter, `15px`, weight `500` |
| Color | Navy (`#0C1F40`) |
| Hover | `opacity: 0.70`, transition `opacity 0.2s ease` |
| Active (current page) | Navy + `2px solid #B4E7DD` bottom border |
| Focus-visible | `outline: 2px solid #B4E7DD`, `outline-offset: 4px` |
| Text-decoration | None (underline replaced by bottom-border active indicator) |

NavLinks list:
| Label | Route |
|-------|-------|
| Features | `/#features` |
| Pricing | `/#pricing` |
| Docs | `/docs` |
| FAQ | `/#faq` |

**CTAs (right side):**

| Property | Value |
|----------|-------|
| Display | `flex`, `align-items: center`, `gap: 12px` |

"Sign in" link:
| Property | Value |
|----------|-------|
| Style | Ghost — no background, no border |
| Font | Inter, `14px`, weight `500` |
| Color | Navy |
| Hover | `opacity: 0.70` |
| Link | `href="/login"` |

"Get started" button:
| Property | Value |
|----------|-------|
| Height | `38px` (compact size) |
| Padding | `0 20px` |
| Background | Aqua (`#B4E7DD`) |
| Text | Navy (`#0C1F40`), Inter `14px` weight `600` |
| Border | `1.5px solid #B4E7DD` |
| Border-radius | `0` |
| Hover | `opacity: 0.85` |
| Link | `href="/signup"` |

**Mobile hamburger (<900px):**

The center nav links and CTA buttons are hidden on mobile. A hamburger menu button appears on the right.

| Property | Value |
|----------|-------|
| Icon | Lucide `Menu`, `20px`, Navy |
| Width | `40px`, Height | `40px` |
| Background | `transparent` |
| Border | None |
| On click | Opens `PublicMobileMenu` overlay |

**PublicMobileMenu:**

Full-screen overlay triggered by hamburger. Navy background.

| Property | Value |
|----------|-------|
| Position | `fixed`, `inset: 0` |
| z-index | `50` |
| Background | Navy (`#0C1F40`) |
| Padding | `24px 24px` |
| Display | `flex`, `flex-direction: column` |
| Transition | `opacity 0.2s ease`, `transform 0.25s ease` |

Internal structure:
```
PublicMobileMenu
├── Header row
│   ├── Logo (24px SVG, white + "Daimon" white)
│   └── CloseButton (X icon, 20px, white 65%)
├── Nav links (vertical list, 56px height each)
│   ├── Features
│   ├── Pricing
│   ├── Docs
│   └── FAQ
├── Divider (1px white 10% opacity)
└── CTA buttons
    ├── "Sign in" (full-width, secondary dark bg style — white border)
    └── "Get started" (full-width, primary — aqua bg, navy text)
```

Mobile nav link style:
| Property | Value |
|----------|-------|
| Height | `56px` |
| Font | Inter, `18px`, weight `500` |
| Color | `rgba(255,255,255,0.80)` |
| Border-bottom | `1px solid rgba(255,255,255,0.06)` |
| Active | White, `font-weight: 600` |

---

### 1.11 PublicLayout

**File:** `app/(public)/layout.tsx`

**Purpose:** Root layout for all public pages (landing, docs, legal, FAQ, pricing). Includes `PublicNavbar` and `PublicFooter`.

**Props interface:** None (Next.js layout)

**Structure:**

```tsx
<div className="public-shell">
  <PublicNavbar />
  <main>{children}</main>
  <PublicFooter />
</div>
```

| Class | Tailwind | Description |
|-------|----------|-------------|
| `.public-shell` | `flex flex-col min-h-screen` | Full page flex column |
| `main` | `flex-1` | Expands to fill space between nav and footer |

---

### 1.12 PublicFooter

**File:** `components/layout/PublicFooter.tsx`

**Purpose:** Site-wide footer for public pages. Navy background with 5-column grid.

**Props interface:**

```typescript
interface PublicFooterProps {
  // No props — all content is static
}
```

**Dimensions:**

| Property | Value |
|----------|-------|
| Background | Navy (`#0C1F40`) |
| Padding | `48px` (all sides) |
| Border-top | None (Navy bg provides visual separation) |

**Grid layout:**

| Property | Desktop Value | Mobile Value |
|----------|--------------|-------------|
| Display | `grid` | `grid` |
| Columns | `1.5fr 1fr 1fr 1fr 1fr` (5 columns) | `1fr 1fr` (2 columns) |
| Gap | `32px` | `32px 24px` |
| Breakpoint | `@media (max-width: 900px)` | — |

**Column 1 — Brand:**

| Property | Value |
|----------|-------|
| Content | Logo (24px SVG, Aqua + "Daimon" wordmark, White) + tagline |
| Tagline | Inter, `14px`, weight `400`, `rgba(255,255,255,0.55)` |
| Tagline text | `"The AI operating system for your Discord server."` |
| Tagline max-width | `200px` |
| Logo margin-bottom | `12px` |
| Logo icon color | Aqua (`#B4E7DD`) |
| Logo text color | White (`#FFFFFF`) |

**Columns 2–5 — Link columns:**

| Column | Heading | Links |
|--------|---------|-------|
| 2 | `PRODUCT` | Features, Pricing, Changelog, Roadmap |
| 3 | `RESOURCES` | Documentation, Quick Start, Tool Reference, FAQ |
| 4 | `LEGAL` | Privacy Policy, Terms of Service, Disclaimers |
| 5 | `COMPANY` | About, Contact, GitHub, Twitter/X |

Column heading:
| Property | Value |
|----------|-------|
| Font | Inter, `14px`, weight `400` |
| Text-transform | `uppercase` |
| Letter-spacing | `0.08em` |
| Color | `rgba(255,255,255,0.45)` |
| Margin-bottom | `16px` |

Column link:
| Property | Value |
|----------|-------|
| Font | Inter, `14px`, weight `400` |
| Color | `rgba(255,255,255,0.70)` |
| Display | `block` |
| Margin-bottom | `8px` |
| Hover color | `rgba(255,255,255,1.0)` |
| Hover underline | None |
| Transition | `color 0.15s ease` |
| Focus-visible | `outline: 2px solid #B4E7DD`, `outline-offset: 2px` |

**Footer divider (below main grid):**

| Property | Value |
|----------|-------|
| Border | `1px solid rgba(255,255,255,0.10)` |
| Margin | `32px 0 16px` |

**Copyright row (below divider):**

| Property | Value |
|----------|-------|
| Display | `flex`, `justify-content: space-between`, `align-items: center` |
| Font | Inter, `13px`, weight `400` |
| Color | `rgba(255,255,255,0.35)` |
| Content left | `© 2026 Daimon. All rights reserved.` |
| Content right | `Built with ❤ on Claude` |

**Mobile (≤900px):**
- Grid becomes 2 columns
- Brand column spans full 2 columns (`grid-column: 1 / -1`)
- All other columns in 2-column grid (2 columns per row)
- Padding reduces to `32px 24px`

---

### 1.13 AdminLayout

**File:** `app/(admin)/layout.tsx`

**Purpose:** Layout for admin-only routes (`/admin/**`). Same shell as dashboard layout, with admin-specific sidebar navigation. Admin access checked server-side.

**Auth guard:**

```typescript
const { data: { session } } = await supabase.auth.getSession()
if (!session) {
  redirect('/login')
}
// Check admin role
const { data: profile } = await supabase
  .from('user_profiles')
  .select('role')
  .eq('user_id', session.user.id)
  .single()
if (profile?.role !== 'admin') {
  redirect('/dashboard')
}
```

**Structure:** Identical to `DashboardLayout` with one difference: `AdminSidebar` is rendered instead of `Sidebar`.

**AdminSidebar nav items:**

| Label | Route | Icon |
|-------|-------|------|
| Admin Home | `/admin` | `LayoutDashboard` |
| Tenants | `/admin/tenants` | `Building2` |
| Users | `/admin/users` | `Users` |
| Subscriptions | `/admin/subscriptions` | `CreditCard` |
| Audit Log | `/admin/audit` | `FileText` |
| Settings | `/admin/settings` | `Settings` |

AdminSidebar also shows a yellow "ADMIN" badge in the logo area to visually distinguish admin context:

| Property | Value |
|----------|-------|
| Badge text | `ADMIN` |
| Badge background | Peach (`#F6AE72`) — exception: this is a data-label use case, not a button |
| Badge font | Inter, `10px`, weight `700`, Navy |
| Badge padding | `2px 6px` |
| Badge border-radius | `0` |
| Badge margin-left | `8px` (after wordmark) |

Note on Peach use: The admin badge uses `#F6AE72` (Peach Orange) to signal special/elevated context. This is an intentional exception to the "data viz only" rule — it serves as a visual warning indicator, analogous to a KPI. No other UI elements use Peach.

---

### Summary Table — Layout Components

| Component | File | Usage Context |
|-----------|------|---------------|
| `DashboardLayout` | `app/(dashboard)/layout.tsx` | All `/dashboard/**` routes |
| `Sidebar` | `components/layout/Sidebar.tsx` | Inside DashboardLayout |
| `SidebarNavItem` | `components/layout/SidebarNavItem.tsx` | Inside Sidebar |
| `DashboardTopbar` | `components/layout/DashboardTopbar.tsx` | Inside DashboardLayout |
| `PlanBadge` | `components/layout/PlanBadge.tsx` | Inside DashboardTopbar, billing page |
| `MobileNav` | `components/layout/MobileNav.tsx` | Mobile overlay, triggered from DashboardTopbar |
| `AuthLayout` | `app/(auth)/layout.tsx` | All `/login`, `/signup`, `/reset-*` routes |
| `AuthCard` | `components/layout/AuthCard.tsx` | Inside auth pages |
| `AuthLogo` | `components/layout/AuthLogo.tsx` | Inside auth pages |
| `AuthFooterLinks` | `components/layout/AuthFooterLinks.tsx` | Inside auth pages |
| `PageShell` | `components/layout/PageShell.tsx` | Inside every dashboard page |
| `PublicNavbar` | `components/layout/PublicNavbar.tsx` | Landing, docs, legal pages |
| `PublicFooter` | `components/layout/PublicFooter.tsx` | Landing, docs, legal pages |
| `PublicLayout` | `app/(public)/layout.tsx` | All public routes |
| `AdminLayout` | `app/(admin)/layout.tsx` | All `/admin/**` routes |

---

*Next section: [Form Components](#2-form-components) — aspect 4.9b*

---

## 2. Form Components

All form components follow a shared anatomy: a wrapper `<div>`, an optional `<label>`, the input element, and an optional hint/error `<p>`. This consistent structure ensures predictable spacing and ARIA wiring across the entire application.

### Shared Form Component Tokens

All form inputs share these base tokens unless overridden:

| Token | Value | Notes |
|-------|-------|-------|
| Input height | `44px` | Minimum touch target per WCAG |
| Border color (default) | `rgba(12,31,64,0.20)` | 20% Navy |
| Border color (hover) | `rgba(12,31,64,0.40)` | 40% Navy |
| Border color (focus) | Navy (`#0C1F40`) | Full Navy — clearly visible |
| Border color (error) | `#DC2626` (red-600) | System error red — only exception to brand palette for errors |
| Border color (disabled) | `rgba(12,31,64,0.10)` | Washed out |
| Border width | `1px` (default/hover/disabled), `1.5px` (focus) | Focus ring weight |
| Border radius | `0` | PyMC sharp corners — no rounding |
| Background (default) | White (`#FFFFFF`) | |
| Background (disabled) | `#F7F7F7` | White Soft — visually muted |
| Background (error) | `#FEF2F2` | `red-50` — light red tint |
| Text color | Navy (`#0C1F40`) | |
| Placeholder color | `rgba(12,31,64,0.35)` | |
| Font | Inter, `15px`, weight `400` | |
| Label font | Inter, `13px`, weight `500`, Navy (`#0C1F40`) | |
| Label margin-bottom | `6px` | Gap between label and input |
| Hint font | Inter, `13px`, weight `400`, `rgba(12,31,64,0.55)` | Below input when no error |
| Error font | Inter, `13px`, weight `400`, `#DC2626` | Below input on error |
| Hint/Error margin-top | `4px` | Gap between input and hint/error |
| Transition | `border-color 0.15s ease, box-shadow 0.15s ease` | All interactive transitions |

**Focus ring convention:** PyMC brand uses a 1.5px solid Navy border on focus (not an outline ring). Additionally, `box-shadow: 0 0 0 3px rgba(180,231,221,0.30)` (30% Aqua) is applied as a soft glow for visibility.

**Error state convention:** Error text replaces hint text (not appended). The input border turns red and the background turns light-red. A Lucide `AlertCircle` icon (14px, `#DC2626`) appears inline in the right of the input where space allows.

---

### 2.1 FormInput

**File:** `components/ui/FormInput.tsx`

**Purpose:** Base text input used for email, name, URL, and other single-line text fields across all forms.

**Props interface:**

```typescript
interface FormInputProps {
  id: string                        // Links label `htmlFor` to input `id`
  label: string                     // Label text above the input
  type?: 'text' | 'email' | 'url' | 'tel' | 'number'  // HTML input type, default: 'text'
  value: string                     // Controlled value
  onChange: (value: string) => void // Called with new value string (not raw event)
  placeholder?: string              // Input placeholder text
  hint?: string                     // Helper text below input (shown when no error)
  error?: string                    // Error message (shown instead of hint; triggers error state)
  disabled?: boolean                // Default: false
  required?: boolean                // Adds `*` to label; default: false
  autoComplete?: string             // HTML autocomplete attribute, e.g. "email", "off"
  autoFocus?: boolean               // Focus on mount; default: false
  maxLength?: number                // Max character length
  readOnly?: boolean                // Read-only but not disabled; default: false
  className?: string                // Additional Tailwind classes on wrapper div
  inputRef?: React.RefObject<HTMLInputElement>  // External ref for programmatic focus
}
```

**Markup structure:**

```tsx
<div className={`form-field ${error ? 'form-field--error' : ''} ${disabled ? 'form-field--disabled' : ''} ${className}`}>
  <label htmlFor={id}>
    {label}
    {required && <span aria-hidden="true" className="required-star">*</span>}
  </label>
  <div className="input-wrapper">
    <input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
      autoComplete={autoComplete}
      autoFocus={autoFocus}
      maxLength={maxLength}
      readOnly={readOnly}
      aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
      aria-invalid={error ? 'true' : undefined}
      ref={inputRef}
    />
    {error && <AlertCircleIcon className="input-error-icon" size={14} />}
  </div>
  {error && <p id={`${id}-error`} role="alert" className="field-error">{error}</p>}
  {!error && hint && <p id={`${id}-hint`} className="field-hint">{hint}</p>}
</div>
```

**CSS classes:**

| Class | Tailwind | Description |
|-------|----------|-------------|
| `.form-field` | `flex flex-col` | Root wrapper |
| `label` | `text-[13px] font-[500] text-[#0C1F40] mb-[6px]` | Label above input |
| `.required-star` | `text-[#DC2626] ml-[2px]` | Red asterisk for required |
| `.input-wrapper` | `relative flex items-center` | Wraps input + error icon |
| `input` | See state table below | The actual input element |
| `.input-error-icon` | `absolute right-[12px] text-[#DC2626] pointer-events-none` | Error icon, right-aligned |
| `.field-error` | `text-[13px] text-[#DC2626] mt-[4px]` | Error message |
| `.field-hint` | `text-[13px] text-[rgba(12,31,64,0.55)] mt-[4px]` | Hint text |

**Input element states:**

| State | Border | Background | Text color | Box-shadow |
|-------|--------|-----------|-----------|------------|
| Default | `1px solid rgba(12,31,64,0.20)` | `#FFFFFF` | `#0C1F40` | None |
| Hover | `1px solid rgba(12,31,64,0.40)` | `#FFFFFF` | `#0C1F40` | None |
| Focus | `1.5px solid #0C1F40` | `#FFFFFF` | `#0C1F40` | `0 0 0 3px rgba(180,231,221,0.30)` |
| Error | `1px solid #DC2626` | `#FEF2F2` | `#0C1F40` | None |
| Error + Focus | `1.5px solid #DC2626` | `#FEF2F2` | `#0C1F40` | `0 0 0 3px rgba(220,38,38,0.15)` |
| Disabled | `1px solid rgba(12,31,64,0.10)` | `#F7F7F7` | `rgba(12,31,64,0.35)` | None |
| Read-only | `1px solid rgba(12,31,64,0.15)` | `#F7F7F7` | `rgba(12,31,64,0.70)` | None |

**Input element dimensions:**

| Property | Value |
|----------|-------|
| Height | `44px` |
| Width | `100%` |
| Padding | `0 12px` (default) |
| Padding with error icon | `0 36px 0 12px` (right padding reserves icon space) |
| Font | Inter, `15px`, weight `400` |
| Outline | `none` (outline handled by border + box-shadow) |
| Border-radius | `0` |

**Required label asterisk:**
- Font: Inter, `13px`, weight `500`
- Color: `#DC2626`
- Margin-left: `2px`
- `aria-hidden="true"` — screen readers rely on `required` attribute on input

**Disabled state details:**
- `pointer-events: none` on the entire field
- Cursor: `not-allowed` on input
- Label opacity: `0.50`

**Read-only state details:**
- Input is focusable but not editable
- Cursor: `default`
- No hover border change
- Used for: displaying API keys before reveal, non-editable tenant slug, etc.

---

### 2.2 PasswordInput

**File:** `components/ui/PasswordInput.tsx`

**Purpose:** Password field with show/hide toggle button. Used on login, signup, and change-password forms.

**Props interface:**

```typescript
interface PasswordInputProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  hint?: string
  error?: string
  disabled?: boolean
  required?: boolean
  autoComplete?: 'current-password' | 'new-password'  // Default: 'current-password'
  autoFocus?: boolean
  showStrengthMeter?: boolean    // Show password strength bar below input; default: false
  minLength?: number             // Used for strength meter calculation; default: 8
}
```

**State:**

```typescript
// Internal state
const [showPassword, setShowPassword] = useState(false)
```

**Markup structure:**

```tsx
<div className={`form-field ${error ? 'form-field--error' : ''}`}>
  <label htmlFor={id}>
    {label}
    {required && <span aria-hidden="true" className="required-star">*</span>}
  </label>
  <div className="input-wrapper">
    <input
      id={id}
      type={showPassword ? 'text' : 'password'}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
      autoComplete={autoComplete}
      autoFocus={autoFocus}
      aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
      aria-invalid={error ? 'true' : undefined}
    />
    <button
      type="button"
      className="password-toggle"
      onClick={() => setShowPassword(!showPassword)}
      aria-label={showPassword ? 'Hide password' : 'Show password'}
      tabIndex={0}
      disabled={disabled}
    >
      {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
    </button>
  </div>
  {showStrengthMeter && value.length > 0 && (
    <PasswordStrengthMeter value={value} minLength={minLength} />
  )}
  {error && <p id={`${id}-error`} role="alert" className="field-error">{error}</p>}
  {!error && hint && <p id={`${id}-hint`} className="field-hint">{hint}</p>}
</div>
```

**Toggle button spec:**

| Property | Value |
|----------|-------|
| Position | `absolute`, `right: 0`, vertically centered |
| Width | `44px` |
| Height | `44px` |
| Display | `flex`, `align-items: center`, `justify-content: center` |
| Background | `transparent` |
| Border | None |
| Icon | Lucide `Eye` (show) / `EyeOff` (hide), `16px` |
| Icon color (default) | `rgba(12,31,64,0.45)` |
| Icon color (hover) | `rgba(12,31,64,0.80)` |
| Icon color (disabled) | `rgba(12,31,64,0.20)` |
| Cursor | `pointer` (enabled), `not-allowed` (disabled) |
| Transition | `color 0.15s ease` |
| Focus-visible | `outline: 2px solid #B4E7DD`, `outline-offset: -2px` |

**Input padding with toggle button:**
- Right padding: `44px` (reserves space for toggle button)

**PasswordStrengthMeter sub-component:**

Rendered only when `showStrengthMeter=true` AND `value.length > 0`.

```typescript
// Strength scoring logic
function getPasswordStrength(password: string, minLength: number): {
  score: 0 | 1 | 2 | 3 | 4,  // 0=too short, 1=weak, 2=fair, 3=good, 4=strong
  label: string,
  color: string
} {
  if (password.length < minLength) return { score: 0, label: 'Too short', color: '#DC2626' }
  let score = 0
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  const levels = [
    { score: 1, label: 'Weak',   color: '#DC2626' },
    { score: 2, label: 'Fair',   color: '#F59E0B' },
    { score: 3, label: 'Good',   color: '#10B981' },
    { score: 4, label: 'Strong', color: '#059669' },
  ]
  return levels[Math.min(score, 4) - 1] ?? levels[0]
}
```

Strength meter bar visual:

| Property | Value |
|----------|-------|
| Container height | `4px` |
| Container background | `rgba(12,31,64,0.08)` |
| Container margin-top | `6px` |
| Bar width | `score / 4 * 100%` |
| Bar color | Per strength level (see scoring logic) |
| Bar transition | `width 0.3s ease, background-color 0.3s ease` |
| Label | `12px` Inter weight `400`, same color as bar, aligned right, `margin-top: 3px` |

Strength labels and colors:
| Score | Label | Color |
|-------|-------|-------|
| 0 | `Too short` | `#DC2626` |
| 1 | `Weak` | `#DC2626` |
| 2 | `Fair` | `#F59E0B` |
| 3 | `Good` | `#10B981` |
| 4 | `Strong` | `#059669` |

**All other states:** Identical to `FormInput` (border colors, focus ring, disabled, error, etc.)

---

### 2.3 Select

**File:** `components/ui/Select.tsx`

**Purpose:** Styled single-select dropdown. Used for timezone selection, plan selection, and other enumerated choices. Implemented as a native `<select>` element with custom CSS overlay for brand consistency. No custom JavaScript dropdown library — native for accessibility.

**Props interface:**

```typescript
interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface SelectProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string           // Disabled, empty-value option shown first; e.g. "Select a timezone..."
  hint?: string
  error?: string
  disabled?: boolean
  required?: boolean
  className?: string
}
```

**Markup structure:**

```tsx
<div className={`form-field ${error ? 'form-field--error' : ''} ${disabled ? 'form-field--disabled' : ''} ${className}`}>
  <label htmlFor={id}>
    {label}
    {required && <span aria-hidden="true" className="required-star">*</span>}
  </label>
  <div className="select-wrapper">
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      required={required}
      aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
      aria-invalid={error ? 'true' : undefined}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} disabled={opt.disabled}>
          {opt.label}
        </option>
      ))}
    </select>
    <ChevronDownIcon className="select-chevron" size={16} />
  </div>
  {error && <p id={`${id}-error`} role="alert" className="field-error">{error}</p>}
  {!error && hint && <p id={`${id}-hint`} className="field-hint">{hint}</p>}
</div>
```

**Select wrapper:**

| Property | Value |
|----------|-------|
| Position | `relative` |
| Display | `block` |

**Native `<select>` styling:**

| Property | Value |
|----------|-------|
| Width | `100%` |
| Height | `44px` |
| Padding | `0 40px 0 12px` (right padding reserves chevron space) |
| Appearance | `none` (removes native arrow) |
| Background | White (`#FFFFFF`) |
| Border | `1px solid rgba(12,31,64,0.20)` |
| Border-radius | `0` |
| Font | Inter, `15px`, weight `400` |
| Color | Navy (`#0C1F40`) |
| Cursor | `pointer` |
| Outline | `none` |
| Transition | `border-color 0.15s ease, box-shadow 0.15s ease` |

**Placeholder option styling:**
- Color: `rgba(12,31,64,0.35)` (use `color` CSS on the option, and CSS `color` on select when value is "")
- Technique: `select:has(option:checked:disabled) { color: rgba(12,31,64,0.35) }` — CSS-only

**Custom chevron icon:**

| Property | Value |
|----------|-------|
| Position | `absolute`, `right: 12px`, vertically centered |
| Size | `16px` |
| Color | `rgba(12,31,64,0.55)` |
| Pointer-events | `none` (click passes through to select) |
| Transition | `transform 0.15s ease` (rotate on open — browser-dependent) |

**States:**

| State | Border | Background | Chevron color |
|-------|--------|-----------|---------------|
| Default | `1px solid rgba(12,31,64,0.20)` | `#FFFFFF` | `rgba(12,31,64,0.55)` |
| Hover | `1px solid rgba(12,31,64,0.40)` | `#FFFFFF` | `rgba(12,31,64,0.80)` |
| Focus | `1.5px solid #0C1F40` + `box-shadow: 0 0 0 3px rgba(180,231,221,0.30)` | `#FFFFFF` | `#0C1F40` |
| Error | `1px solid #DC2626` | `#FEF2F2` | `#DC2626` |
| Disabled | `1px solid rgba(12,31,64,0.10)` | `#F7F7F7` | `rgba(12,31,64,0.20)` |

**Disabled state:**
- `pointer-events: none`
- `opacity: 0.60` on wrapper
- Cursor: `not-allowed` on select
- Label opacity: `0.50`

---

### 2.4 Toggle

**File:** `components/ui/Toggle.tsx`

**Purpose:** Binary on/off switch control. Used for feature flags, notification preferences, and boolean settings. Visually distinct from Checkbox — Toggle is for settings, Checkbox is for multi-select/agreement forms.

**Props interface:**

```typescript
interface ToggleProps {
  id: string
  label: string
  description?: string             // Secondary text below label
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  size?: 'sm' | 'md'               // Default: 'md'
  labelPosition?: 'left' | 'right' // Default: 'right' (label right of toggle)
  className?: string
}
```

**Markup structure:**

```tsx
<div className={`toggle-field ${disabled ? 'toggle-field--disabled' : ''} ${className}`}>
  <label htmlFor={id} className="toggle-label-wrapper">
    {labelPosition === 'left' && (
      <span className="toggle-label-text">
        <span className="toggle-label">{label}</span>
        {description && <span className="toggle-description">{description}</span>}
      </span>
    )}
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`toggle-track ${checked ? 'toggle-track--on' : ''} toggle-track--${size}`}
    >
      <span className="toggle-thumb" aria-hidden="true" />
    </button>
    {labelPosition === 'right' && (
      <span className="toggle-label-text">
        <span className="toggle-label">{label}</span>
        {description && <span className="toggle-description">{description}</span>}
      </span>
    )}
  </label>
</div>
```

Note: Using `role="switch"` on a `<button>` rather than a native `<input type="checkbox">` for better styling control while preserving ARIA semantics.

**Sizes:**

| Size | Track Width | Track Height | Thumb Size | Thumb Travel |
|------|-------------|-------------|-----------|-------------|
| `sm` | `32px` | `18px` | `14px` | `14px` (from left 2px to right 16px) |
| `md` | `44px` | `24px` | `18px` | `20px` (from left 3px to right 23px) |

**Track styling:**

| Property | Off State | On State |
|----------|-----------|---------|
| Background | `rgba(12,31,64,0.15)` | Aqua (`#B4E7DD`) |
| Border | `1px solid rgba(12,31,64,0.15)` | `1px solid #B4E7DD` |
| Border-radius | `9999px` (fully rounded pill — exception: toggles are always pill-shaped) | Same |
| Transition | `background 0.2s ease, border-color 0.2s ease` | Same |

Note: Toggle tracks are the one PyMC exception to the no-border-radius rule. Pill-shaped tracks are a universal UI convention for binary switches; sharp corners on a toggle would be confusing and non-standard. All other components remain sharp-cornered.

**Thumb styling:**

| Property | Value |
|----------|-------|
| Shape | Circle (border-radius: `9999px`) |
| Background | White (`#FFFFFF`) |
| Box-shadow | `0 1px 3px rgba(0,0,0,0.20)` |
| Transition | `transform 0.2s ease` |
| Transform (off) | `translateX(2px)` for md, `translateX(2px)` for sm |
| Transform (on) | `translateX(23px)` for md, `translateX(16px)` for sm |

**States:**

| State | Track BG | Thumb | Track Border | Focus |
|-------|---------|-------|-------------|-------|
| Off default | `rgba(12,31,64,0.15)` | White | `rgba(12,31,64,0.15)` | — |
| Off hover | `rgba(12,31,64,0.25)` | White | `rgba(12,31,64,0.25)` | — |
| Off focus | `rgba(12,31,64,0.15)` | White | `rgba(12,31,64,0.15)` | `outline: 2px solid #B4E7DD; outline-offset: 2px` |
| On default | Aqua `#B4E7DD` | White | `#B4E7DD` | — |
| On hover | `#9DDDD2` (10% darker aqua) | White | `#9DDDD2` | — |
| On focus | Aqua | White | Aqua | `outline: 2px solid #0C1F40; outline-offset: 2px` |
| Disabled off | `rgba(12,31,64,0.08)` | White (60% opacity) | `rgba(12,31,64,0.08)` | None |
| Disabled on | `rgba(180,231,221,0.40)` | White (60% opacity) | `rgba(180,231,221,0.40)` | None |

**Label text:**

| Property | Value |
|----------|-------|
| `.toggle-label` font | Inter, `14px`, weight `500`, Navy |
| `.toggle-description` font | Inter, `13px`, weight `400`, `rgba(12,31,64,0.55)` |
| `.toggle-description` margin-top | `2px` |
| `.toggle-label-wrapper` display | `flex`, `align-items: center`, `gap: 10px`, `cursor: pointer` |
| Disabled cursor | `not-allowed` (on wrapper) |

**Keyboard behavior:**
- `Space` or `Enter` toggles when focused
- `role="switch"` with `aria-checked` provides proper screen reader announcement: "Toggle [label], [on/off], switch"

---

### 2.5 Checkbox

**File:** `components/ui/Checkbox.tsx`

**Purpose:** Single checkbox with label. Used for agreement checkboxes (ToS acceptance), multi-select lists, and individual boolean options. Distinct from Toggle: Checkboxes appear in forms and lists; Toggles appear in settings panels.

**Props interface:**

```typescript
interface CheckboxProps {
  id: string
  label: React.ReactNode   // Allows JSX for links (e.g., "I agree to the <a>Terms</a>")
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  error?: string           // Error message below checkbox (e.g., "You must accept the terms")
  className?: string
  indeterminate?: boolean  // Visual indeterminate state (used in admin select-all); default: false
}
```

**Markup structure:**

```tsx
<div className={`checkbox-field ${error ? 'checkbox-field--error' : ''} ${className}`}>
  <label className="checkbox-label-wrapper">
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      disabled={disabled}
      aria-describedby={error ? `${id}-error` : undefined}
      aria-invalid={error ? 'true' : undefined}
      ref={(el) => {
        if (el) el.indeterminate = indeterminate ?? false
      }}
      className="checkbox-input"
    />
    <span className="checkbox-box" aria-hidden="true">
      {checked && !indeterminate && <CheckIcon size={11} />}
      {indeterminate && <MinusIcon size={11} />}
    </span>
    <span className="checkbox-label-text">{label}</span>
  </label>
  {error && <p id={`${id}-error`} role="alert" className="field-error mt-[4px] ml-[26px]">{error}</p>}
</div>
```

**Visually-hidden native input:**
The native `<input type="checkbox">` is visually hidden but remains in DOM for accessibility (keyboard, screen reader). The custom `.checkbox-box` `<span>` provides the visual representation.

```css
.checkbox-input {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0,0,0,0);
  white-space: nowrap;
  border-width: 0;
}
```

**Custom checkbox box (`.checkbox-box`) dimensions:**

| Property | Value |
|----------|-------|
| Width | `18px` |
| Height | `18px` |
| Flex-shrink | `0` |
| Display | `flex`, `align-items: center`, `justify-content: center` |
| Border-radius | `0` (PyMC sharp corners) |
| Transition | `background 0.15s ease, border-color 0.15s ease` |

**Custom checkbox box states:**

| State | Background | Border | Icon color |
|-------|-----------|--------|-----------|
| Unchecked default | White | `1px solid rgba(12,31,64,0.30)` | N/A |
| Unchecked hover | White | `1px solid rgba(12,31,64,0.60)` | N/A |
| Unchecked focus (parent label focus-within) | White | `1.5px solid #0C1F40` + `box-shadow: 0 0 0 3px rgba(180,231,221,0.30)` | N/A |
| Checked default | Navy (`#0C1F40`) | `1px solid #0C1F40` | White (`#FFFFFF`), `CheckIcon` 11px |
| Checked hover | `rgba(12,31,64,0.85)` | Same | White |
| Checked focus | Navy | `1.5px solid #0C1F40` + `box-shadow: 0 0 0 3px rgba(180,231,221,0.30)` | White |
| Indeterminate | Navy | `1px solid #0C1F40` | White, `MinusIcon` 11px |
| Disabled unchecked | `#F7F7F7` | `1px solid rgba(12,31,64,0.10)` | N/A |
| Disabled checked | `rgba(12,31,64,0.30)` | `1px solid rgba(12,31,64,0.10)` | White (60% opacity) |
| Error unchecked | White | `1px solid #DC2626` | N/A |

**Focus detection:** Focus is detected via `.checkbox-input:focus-visible ~ .checkbox-box` CSS selector since the native input is visually hidden.

**Label wrapper:**

| Property | Value |
|----------|-------|
| Display | `flex`, `align-items: flex-start`, `gap: 8px` |
| Cursor | `pointer` (enabled), `not-allowed` (disabled) |

**Label text (`.checkbox-label-text`):**

| Property | Value |
|----------|-------|
| Font | Inter, `14px`, weight `400`, Navy |
| Line-height | `1.5` |
| User-select | `none` |
| Disabled color | `rgba(12,31,64,0.45)` |

**Error message:**

| Property | Value |
|----------|-------|
| Font | Inter, `13px`, weight `400`, `#DC2626` |
| Margin-top | `4px` |
| Margin-left | `26px` (aligns with label text, accounting for checkbox width + gap) |

**`label` containing links:**
When the `label` prop contains links (e.g., "I agree to the Terms"), the link styling within the label:
- Color: Aqua → Navy (since on white background; standard link pattern)
- Actually use: `color: #0C1F40`, `text-decoration: underline`, underline-color: `#B4E7DD`
- Hover: `color: rgba(12,31,64,0.80)`, underline-color: `rgba(180,231,221,0.80)`
- The link must have `tabIndex={0}` and proper `href`

---

### 2.6 ApiKeyInput

**File:** `components/ui/ApiKeyInput.tsx`

**Purpose:** Specialized input for API key entry and management. Displays the key masked by default; allows reveal on demand, inline copy to clipboard, and inline validation status badge. Used on the billing page (Anthropic/OpenAI key fields) and integrations page (Toggl and other API key services).

**Props interface:**

```typescript
interface ApiKeyInputProps {
  id: string
  label: string
  value: string               // The actual key value (may be masked from server, e.g. "sk-ant-...••••••••")
  onChange?: (value: string) => void  // Omit if readOnly (existing key display mode)
  onSave?: (value: string) => Promise<void>  // Async save handler; triggers loading state
  onDelete?: () => Promise<void>      // Async delete handler; triggers confirmation + loading
  placeholder?: string        // e.g. "sk-ant-api03-..."
  hint?: string
  error?: string
  isValidating?: boolean      // Show spinner instead of action buttons during validation
  validationStatus?: 'valid' | 'invalid' | 'unknown'  // Badge shown after validation
  isMasked?: boolean          // If true, value is masked (server returned redacted key); default: false
  hasExistingValue?: boolean  // If true, key already saved — show edit/delete mode; default: false
  disabled?: boolean
  required?: boolean
  keyPrefix?: string          // Expected prefix for format hint, e.g. "sk-ant-" for Anthropic
}
```

**Modes:**

The ApiKeyInput operates in two distinct modes based on `hasExistingValue`:

**Mode 1: Entry mode** (`hasExistingValue = false`)
- Standard input field with masked display (`type="password"`)
- Show/hide toggle
- "Save" action button appears when `value.length > 0`
- On Save: calls `onSave(value)`, shows spinner, then shows validation badge

**Mode 2: Existing key mode** (`hasExistingValue = true`)
- Read-only display showing masked key (e.g., `sk-ant-api03-••••••••••••••••••••`)
- Copy button (copies full key if available, or shows "Key cannot be copied after saving")
- Edit button → switches to entry mode with cleared input
- Delete button → shows confirmation dialog then calls `onDelete()`

**Markup structure (entry mode):**

```tsx
<div className={`form-field api-key-field ${error ? 'form-field--error' : ''}`}>
  <label htmlFor={id}>
    {label}
    {required && <span aria-hidden="true" className="required-star">*</span>}
  </label>
  <div className="api-key-input-row">
    <div className="input-wrapper">
      <input
        id={id}
        type={showKey ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled || isValidating}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        aria-invalid={error ? 'true' : undefined}
        className="api-key-text-input"
      />
      <button
        type="button"
        className="password-toggle"
        onClick={() => setShowKey(!showKey)}
        aria-label={showKey ? 'Hide key' : 'Show key'}
        disabled={disabled || isValidating}
      >
        {showKey ? <EyeOffIcon size={14} /> : <EyeIcon size={14} />}
      </button>
    </div>
    {value.length > 0 && !isValidating && (
      <button type="button" className="api-key-save-btn" onClick={() => handleSave()}>
        Save
      </button>
    )}
    {isValidating && (
      <Loader2Icon size={16} className="animate-spin text-[rgba(12,31,64,0.45)]" />
    )}
  </div>
  {validationStatus && (
    <ApiKeyValidationBadge status={validationStatus} />
  )}
  {error && <p id={`${id}-error`} role="alert" className="field-error">{error}</p>}
  {!error && hint && <p id={`${id}-hint`} className="field-hint">{hint}</p>}
</div>
```

**Markup structure (existing key mode):**

```tsx
<div className="form-field api-key-field api-key-field--existing">
  <label>{label}</label>
  <div className="api-key-existing-row">
    <code className="api-key-masked-display">{maskedValue}</code>
    <div className="api-key-actions">
      <button type="button" className="icon-btn" onClick={handleCopy} aria-label="Copy API key">
        {copied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
      </button>
      <button type="button" className="icon-btn" onClick={switchToEditMode} aria-label="Edit API key">
        <PencilIcon size={14} />
      </button>
      <button type="button" className="icon-btn icon-btn--danger" onClick={handleDelete} aria-label="Delete API key">
        <Trash2Icon size={14} />
      </button>
    </div>
  </div>
  {validationStatus && <ApiKeyValidationBadge status={validationStatus} />}
  {hint && <p className="field-hint">{hint}</p>}
</div>
```

**Masked value display format:**
- Full key pattern: `[prefix][first-4-chars]••••••••••••••••` (never reveals full key from server)
- Example Anthropic: `sk-ant-api03-aBcD••••••••••••••••••••••`
- Example Toggl: `••••••••••••••••••••••••••••••••` (completely masked if no prefix available)

**`.api-key-masked-display` (code element):**

| Property | Value |
|----------|-------|
| Font | `font-mono`, Inter Mono fallback, `14px` |
| Color | `rgba(12,31,64,0.65)` |
| Background | `rgba(12,31,64,0.04)` |
| Padding | `8px 12px` |
| Border | `1px solid rgba(12,31,64,0.10)` |
| Border-radius | `0` |
| Flex | `1` |
| Overflow | `hidden`, `text-overflow: ellipsis`, `white-space: nowrap` |
| User-select | `none` |

**Action icon buttons (`.icon-btn`):**

| Property | Value |
|----------|-------|
| Width | `32px` |
| Height | `32px` |
| Display | `flex`, `align-items: center`, `justify-content: center` |
| Background | `transparent` |
| Border | `1px solid rgba(12,31,64,0.15)` |
| Border-radius | `0` |
| Icon size | `14px` |
| Icon color | `rgba(12,31,64,0.55)` |
| Hover background | `rgba(12,31,64,0.05)` |
| Hover icon color | `rgba(12,31,64,0.90)` |
| Hover border | `rgba(12,31,64,0.30)` |
| Focus-visible | `outline: 2px solid #B4E7DD`, `outline-offset: 2px` |
| Transition | `background 0.15s ease, border-color 0.15s ease, color 0.15s ease` |

**Delete button (`.icon-btn--danger`):**

| Property | Value |
|----------|-------|
| Icon color | `#DC2626` |
| Hover background | `#FEF2F2` |
| Hover border | `#DC2626` |

**Copy success state:**
- Icon swaps from `CopyIcon` to `CheckIcon` for 2 seconds, then back
- Icon color changes to `#059669` (green) on success
- No toast (the inline icon change is sufficient feedback)

**"Save" button:**

| Property | Value |
|----------|-------|
| Height | `44px` |
| Padding | `0 16px` |
| Background | Aqua (`#B4E7DD`) |
| Text | `"Save"`, Inter `14px` weight `600`, Navy |
| Border | `1.5px solid #B4E7DD` |
| Border-radius | `0` |
| Flex-shrink | `0` |
| Hover | `opacity: 0.85` |
| Disabled | `opacity: 0.50`, `cursor: not-allowed` |
| Focus-visible | `outline: 2px solid #0C1F40`, `outline-offset: 2px` |

**ApiKeyValidationBadge sub-component:**

```typescript
interface ApiKeyValidationBadgeProps {
  status: 'valid' | 'invalid' | 'unknown'
}
```

| Status | Icon | Text | Background | Text color |
|--------|------|------|-----------|-----------|
| `valid` | `CheckCircleIcon` 14px | `"Key verified"` | `rgba(16,185,129,0.10)` | `#059669` |
| `invalid` | `XCircleIcon` 14px | `"Invalid key — check and try again"` | `rgba(220,38,38,0.10)` | `#DC2626` |
| `unknown` | `AlertCircleIcon` 14px | `"Could not verify key"` | `rgba(245,158,11,0.10)` | `#D97706` |

Badge sizing:
| Property | Value |
|----------|-------|
| Display | `flex`, `align-items: center`, `gap: 6px` |
| Padding | `6px 10px` |
| Margin-top | `6px` |
| Font | Inter, `13px`, weight `500` |
| Border | `1px solid currentColor` (at 20% opacity) |
| Border-radius | `0` |

**Row layout (`.api-key-input-row`, `.api-key-existing-row`):**

| Property | Value |
|----------|-------|
| Display | `flex`, `align-items: center`, `gap: 8px` |

The input wrapper within the row takes `flex: 1`; the Save button and icon buttons are `flex-shrink: 0`.

---

### 2.7 SearchInput

**File:** `components/ui/SearchInput.tsx`

**Purpose:** Search field with magnifying glass icon on the left and a clear button on the right when the field has a value. Used in the admin tenant list, integration service search, and tool reference search.

**Props interface:**

```typescript
interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  onClear?: () => void           // Called when X button clicked; if omitted, onChange('') is used
  placeholder?: string           // Default: "Search..."
  disabled?: boolean
  isLoading?: boolean            // Show spinner instead of search icon
  autoFocus?: boolean
  className?: string
  size?: 'sm' | 'md'             // Default: 'md'. sm = 36px height, md = 44px height
  id?: string                    // Optional; auto-generated if omitted
  'aria-label'?: string          // Default: "Search"
}
```

**No `label` prop:** SearchInput has no visible label by default — the placeholder and aria-label are sufficient. If a visible label is needed, wrap with `FormInput` instead.

**Markup structure:**

```tsx
<div className={`search-input-wrapper search-input-wrapper--${size} ${disabled ? 'search-input-wrapper--disabled' : ''} ${className}`}>
  <span className="search-icon" aria-hidden="true">
    {isLoading
      ? <Loader2Icon size={size === 'sm' ? 14 : 16} className="animate-spin" />
      : <SearchIcon size={size === 'sm' ? 14 : 16} />
    }
  </span>
  <input
    type="search"
    id={id}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder ?? 'Search...'}
    disabled={disabled}
    autoFocus={autoFocus}
    aria-label={ariaLabel ?? 'Search'}
    className="search-text-input"
    autoComplete="off"
    autoCorrect="off"
    spellCheck={false}
  />
  {value.length > 0 && !disabled && (
    <button
      type="button"
      className="search-clear-btn"
      onClick={() => onClear ? onClear() : onChange('')}
      aria-label="Clear search"
      tabIndex={0}
    >
      <XIcon size={size === 'sm' ? 12 : 14} />
    </button>
  )}
</div>
```

**Wrapper dimensions:**

| Size | Height | Left padding (for icon) | Right padding (for clear) |
|------|--------|------------------------|--------------------------|
| `sm` | `36px` | `32px` | `32px` (when value present), `12px` (no value) |
| `md` | `44px` | `40px` | `40px` (when value present), `12px` (no value) |

**Wrapper styling:**

| Property | Value |
|----------|-------|
| Position | `relative` |
| Display | `flex`, `align-items: center` |
| Width | `100%` |
| Background | White (`#FFFFFF`) |
| Border | `1px solid rgba(12,31,64,0.20)` |
| Border-radius | `0` |
| Transition | `border-color 0.15s ease, box-shadow 0.15s ease` |

**Wrapper focus-within state:**
```css
.search-input-wrapper:focus-within {
  border: 1.5px solid #0C1F40;
  box-shadow: 0 0 0 3px rgba(180,231,221,0.30);
}
```

**Wrapper hover state:**
```css
.search-input-wrapper:hover:not(:focus-within):not(.search-input-wrapper--disabled) {
  border-color: rgba(12,31,64,0.40);
}
```

**Input element:**

| Property | Value |
|----------|-------|
| Background | `transparent` |
| Border | None |
| Outline | None |
| Width | `100%` |
| Height | `100%` |
| Font | Inter, `14px` (sm) / `15px` (md), weight `400` |
| Color | Navy (`#0C1F40`) |
| Placeholder color | `rgba(12,31,64,0.35)` |
| Padding | `0` (handled by wrapper left/right padding) |

**Hide native search clear button (browser default):**
```css
input[type="search"]::-webkit-search-cancel-button { display: none; }
input[type="search"]::-ms-clear { display: none; }
```

**Search icon (`.search-icon`):**

| Property | Value |
|----------|-------|
| Position | `absolute`, `left: 12px`, vertically centered |
| Color | `rgba(12,31,64,0.40)` |
| Pointer-events | `none` |
| Transition | `color 0.15s ease` |

When focus-within:
- Icon color → `rgba(12,31,64,0.65)`

**Loading spinner (`.search-icon` with `isLoading`):**
- Replaces `SearchIcon` with `Loader2Icon` + `animate-spin`
- Color: `rgba(12,31,64,0.45)`

**Clear button (`.search-clear-btn`):**

| Property | Value |
|----------|-------|
| Position | `absolute`, `right: 0`, vertically centered |
| Width | `32px` (sm) / `40px` (md) |
| Height | `100%` |
| Display | `flex`, `align-items: center`, `justify-content: center` |
| Background | `transparent` |
| Border | None |
| Cursor | `pointer` |
| Icon color | `rgba(12,31,64,0.45)` |
| Hover icon color | `rgba(12,31,64,0.80)` |
| Focus-visible | `outline: 2px solid #B4E7DD`, `outline-offset: -2px` |
| Transition | `color 0.15s ease` |

**Disabled state (`.search-input-wrapper--disabled`):**

| Property | Value |
|----------|-------|
| Background | `#F7F7F7` |
| Border | `1px solid rgba(12,31,64,0.10)` |
| Input cursor | `not-allowed` |
| Input color | `rgba(12,31,64,0.35)` |
| Opacity | `0.60` |

**Debounce note:** `SearchInput` itself does NOT debounce — it calls `onChange` on every keystroke. Callers are responsible for debouncing if needed (typically 300ms debounce on the API query triggered by the value change).

---

### Summary Table — Form Components

| Component | File | Usage |
|-----------|------|-------|
| `FormInput` | `components/ui/FormInput.tsx` | Email, name, URL, tel, general text fields |
| `PasswordInput` | `components/ui/PasswordInput.tsx` | Login, signup, change-password forms |
| `Select` | `components/ui/Select.tsx` | Timezone, plan selection, enum fields |
| `Toggle` | `components/ui/Toggle.tsx` | Settings panels, feature flags, boolean preferences |
| `Checkbox` | `components/ui/Checkbox.tsx` | ToS agreement, multi-select lists |
| `ApiKeyInput` | `components/ui/ApiKeyInput.tsx` | Anthropic/OpenAI keys on billing; Toggl etc. on integrations |
| `SearchInput` | `components/ui/SearchInput.tsx` | Admin tenant search, integration grid search, tool reference search |

---

## 3. Feedback Components

Feedback components communicate system status, errors, confirmations, and empty states to the user. All use the PyMC brand system: Navy `#0C1F40`, Aqua `#B4E7DD`, White `#FFFFFF`, White Soft `#F7F7F7`. No border-radius (sharp corners). Semantic colors for error/warning/success/info are defined below and are the only exception to the primary palette.

### Semantic Feedback Colors

| Semantic Role | Background | Border / Icon | Text |
|---------------|-----------|---------------|------|
| Error | `#FEF2F2` | `#DC2626` (red-600) | `#7F1D1D` (red-900) |
| Warning | `#FFFBEB` | `#D97706` (amber-600) | `#78350F` (amber-900) |
| Success | `#F0FDF4` | `#16A34A` (green-600) | `#14532D` (green-900) |
| Info | `rgba(180,231,221,0.20)` | `#B4E7DD` (Aqua) | `#0C1F40` (Navy) |

---

### 3.1 AlertBanner

**File:** `components/ui/AlertBanner.tsx`

**Purpose:** Inline contextual alert displayed within a page section (not floating). Used for non-dismissible warnings (e.g., "Your bot is offline"), dismissible notices (e.g., "Email not verified"), and persistent system messages. Placed below the TopBar or within a card body.

**Props interface:**

```typescript
type AlertVariant = 'error' | 'warning' | 'success' | 'info'

interface AlertBannerProps {
  variant: AlertVariant           // Controls color scheme
  title: string                   // Bold first line, e.g. "Bot offline"
  description?: string            // Optional supporting text below title
  dismissible?: boolean           // Shows ✕ button; default false
  onDismiss?: () => void          // Called when ✕ is clicked; required if dismissible=true
  action?: {
    label: string                 // Action button label, e.g. "Reconnect"
    onClick: () => void           // Called on action button click
  }
  icon?: React.ReactNode          // Override default icon; if undefined, uses variant default
  className?: string
}
```

**Variant defaults (icon + colors):**

| Variant | Default Icon | Background | Left border | Icon color | Title color | Description color |
|---------|-------------|------------|-------------|-----------|-------------|-------------------|
| `error` | `AlertCircle` (Lucide, 16px) | `#FEF2F2` | `3px solid #DC2626` | `#DC2626` | `#7F1D1D` | `#7F1D1D` at 75% opacity |
| `warning` | `AlertTriangle` (Lucide, 16px) | `#FFFBEB` | `3px solid #D97706` | `#D97706` | `#78350F` | `#78350F` at 75% opacity |
| `success` | `CheckCircle` (Lucide, 16px) | `#F0FDF4` | `3px solid #16A34A` | `#16A34A` | `#14532D` | `#14532D` at 75% opacity |
| `info` | `Info` (Lucide, 16px) | `rgba(180,231,221,0.20)` | `3px solid #B4E7DD` | `#0C1F40` | `#0C1F40` | `rgba(12,31,64,0.65)` |

**Dimensions and layout:**

| Property | Value |
|----------|-------|
| Display | `flex`, `align-items: flex-start`, `gap: 12px` |
| Padding | `14px 16px` |
| Border-radius | `0` |
| Border-left | `3px solid {variant color}` (see above) |
| Width | `100%` |
| Box-shadow | None |

**Internal structure:**

```
AlertBanner
├── Icon (flex-shrink: 0, margin-top: 1px to align with text cap height)
├── Content (flex: 1)
│   ├── Title (Inter, 14px, weight 600, variant title color)
│   ├── Description? (Inter, 13px, weight 400, variant description color, margin-top: 2px)
│   └── Action? (rendered as inline text link — Inter, 13px, weight 600, underline, variant icon color, margin-top: 6px)
└── DismissButton? (flex-shrink: 0, 20px × 20px, X icon 14px, variant icon color at 60%, hover 100%, cursor pointer)
```

**Action button styling:**

The `action` is rendered as a text link (not a button element), styled inline:
| Property | Value |
|----------|-------|
| Font | Inter, 13px, weight 600 |
| Color | Variant icon color (e.g. `#DC2626` for error) |
| Text-decoration | `underline` |
| Cursor | `pointer` |
| Hover | `opacity: 0.75` |
| Display | `block` |
| Margin-top | `6px` |

**Dismiss button (when `dismissible=true`):**

| Property | Value |
|----------|-------|
| Element | `<button>` |
| Size | `20px × 20px` |
| Icon | `X` (Lucide, 14px) |
| Icon color | Variant icon color at 60% opacity |
| Hover icon color | Variant icon color at 100% opacity |
| Background | Transparent |
| Border | None |
| Focus-visible | `outline: 2px solid #B4E7DD`, `outline-offset: 2px` |
| Transition | `opacity 0.15s ease` |
| Cursor | `pointer` |
| Margin-top | `1px` |

**Animation (dismissible):** When dismissed, the component fades out over `200ms` (`opacity: 0`, `max-height: 0`, `padding: 0`, overflow hidden) then calls `onDismiss`. Do not unmount before animation completes.

**Usage in the spec:**
- Dashboard: "Bot offline" warning (variant `error`, not dismissible, action "Check status")
- Dashboard: "Email not verified — check your inbox" (variant `warning`, dismissible)
- Settings: "Danger zone" confirmation banner after disconnect (variant `success`, dismissible)
- Billing: "No active subscription" (variant `info`, action "View plans")
- Auth pages: Server error feedback (variant `error`, not dismissible)

**Implementation note:** `AlertBanner` is NOT used for toast notifications (which are floating). For toasts, use the `Toast` component below.

---

### 3.2 Toast

**File:** `components/ui/Toast.tsx` + `components/ui/ToastProvider.tsx` + `lib/toast.ts`

**Purpose:** Floating notification that appears in the bottom-right corner of the screen. Auto-dismisses after a configurable duration. Used for action confirmation (success) and non-blocking error notifications. Multiple toasts stack vertically.

**Props interface (Toast item):**

```typescript
type ToastVariant = 'success' | 'error' | 'warning' | 'info'

interface ToastItem {
  id: string                      // Unique ID, generated by useToast hook
  variant: ToastVariant
  title: string                   // Primary message, e.g. "Settings saved"
  description?: string            // Optional secondary line
  duration?: number               // Auto-dismiss delay in ms; default 4000; set to 0 to disable auto-dismiss
  action?: {
    label: string                 // e.g. "Undo"
    onClick: () => void
  }
}
```

**ToastProvider props:**

```typescript
interface ToastProviderProps {
  children: React.ReactNode
  maxToasts?: number              // Maximum toasts shown at once; default 5; oldest dismissed first
}
```

**`lib/toast.ts` — imperative API:**

```typescript
// Used throughout the app to trigger toasts without prop drilling
const { toast } = useToast()

toast.success('Settings saved')
toast.success('Settings saved', { description: 'Your changes have been applied.' })
toast.error('Failed to save', { description: 'Please try again.' })
toast.warning('API key expiring soon')
toast.info('Bot reconnecting...')
toast({
  variant: 'success',
  title: 'Tenant deleted',
  description: 'The tenant has been permanently removed.',
  duration: 6000,
  action: { label: 'View log', onClick: () => router.push('/admin') }
})
```

**Toast container (ToastViewport) dimensions and position:**

| Property | Value |
|----------|-------|
| Position | `fixed`, `bottom: 24px`, `right: 24px` |
| Z-index | `100` |
| Width | `360px` |
| Max-height | `calc(100vh - 48px)` |
| Overflow | `hidden` (clips overflow during animation) |
| Display | `flex`, `flex-direction: column-reverse`, `gap: 8px` |

**Individual Toast dimensions:**

| Property | Value |
|----------|-------|
| Background | White (`#FFFFFF`) |
| Border | `1px solid rgba(12,31,64,0.10)` |
| Border-left | `3px solid {variant color}` (same as AlertBanner variant colors) |
| Border-radius | `0` |
| Box-shadow | `0 4px 16px rgba(12,31,64,0.10)` |
| Padding | `12px 14px` |
| Width | `100%` (360px from container) |
| Min-height | `52px` |

**Internal structure:**

```
Toast
├── Left accent bar (3px left border, variant color)
├── Icon (Lucide, 16px, variant icon color, flex-shrink 0, margin-top 1px)
├── Content (flex: 1)
│   ├── Title (Inter, 13px, weight 600, Navy #0C1F40)
│   └── Description? (Inter, 12px, weight 400, rgba(12,31,64,0.65), margin-top: 2px)
├── Action? (text button, Inter, 12px, weight 600, variant color, underline, cursor pointer)
└── DismissButton (X icon 12px, rgba(12,31,64,0.40), hover rgba(12,31,64,0.80))
```

**Variant colors (icon and left border):**

| Variant | Icon | Left border color | Icon component |
|---------|------|-------------------|----------------|
| `success` | `#16A34A` | `#16A34A` | `CheckCircle` (Lucide, 16px) |
| `error` | `#DC2626` | `#DC2626` | `AlertCircle` (Lucide, 16px) |
| `warning` | `#D97706` | `#D97706` | `AlertTriangle` (Lucide, 16px) |
| `info` | `#0C1F40` | `#B4E7DD` | `Info` (Lucide, 16px) |

**Animation:**

| State | Animation |
|-------|-----------|
| Enter | Slide in from right: `translateX(calc(100% + 24px))` → `translateX(0)`, `opacity: 0` → `1`, duration `250ms`, easing `cubic-bezier(0.22, 1, 0.36, 1)` |
| Exit (auto-dismiss or manual) | Slide out right + fade: `translateX(0)` → `translateX(calc(100% + 24px))`, `opacity: 1` → `0`, duration `200ms`, easing `ease-in` |
| Stack reflow (when toast removed) | Remaining toasts animate upward: `transition: transform 200ms ease` |

**Progress bar (auto-dismiss visual indicator):**

- A thin (`2px`) horizontal bar at the bottom of the toast
- Color: variant icon color at 30% opacity
- Animates from full-width to zero-width over `duration` ms using CSS `@keyframes` width animation
- Pauses when user hovers the toast (`animation-play-state: paused`)
- Not shown when `duration = 0`

**Auto-dismiss timer:**

- Starts after enter animation completes
- Paused while user hovers the toast (mouseover → pause, mouseleave → resume from remaining time)
- Paused while user is focused on the toast (keyboard navigation)
- On dismiss: run exit animation, then remove from state

**Stacking behavior:**

- New toasts appear at the bottom of the stack (most recent is lowest)
- When `maxToasts` is reached, the oldest toast is force-dismissed (exit animation plays before removal)
- Each toast tracks its own timer independently

**Mobile behavior (<768px):**

| Property | Value |
|----------|-------|
| Position | `fixed`, `bottom: 16px`, `left: 16px`, `right: 16px` |
| Width | `calc(100vw - 32px)` |
| Max-width | None |

**`useToast` hook (exported from `lib/toast.ts`):**

```typescript
export function useToast() {
  const context = useContext(ToastContext)
  return {
    toast: {
      success: (title: string, opts?: Partial<ToastItem>) => void,
      error: (title: string, opts?: Partial<ToastItem>) => void,
      warning: (title: string, opts?: Partial<ToastItem>) => void,
      info: (title: string, opts?: Partial<ToastItem>) => void,
    }
    // also callable as: toast({ variant, title, ...opts })
  }
}
```

**Complete toast trigger inventory (all places in the app that call `toast`):**

| Action | Variant | Title | Description |
|--------|---------|-------|-------------|
| Settings saved | success | "Settings saved" | — |
| API key saved | success | "API key saved" | "Your Anthropic key has been stored securely." |
| API key deleted | success | "API key removed" | — |
| Discord connection saved | success | "Discord connected" | "Your bot is now connecting." |
| Discord connection removed | success | "Discord disconnected" | — |
| Integration connected (OAuth) | success | "{Service} connected" | — |
| Integration disconnected | success | "{Service} disconnected" | — |
| API key service saved | success | "API key saved" | "{Service} is now connected." |
| Plan upgraded | success | "Plan upgraded" | "Welcome to {plan name}!" |
| Plan downgraded | success | "Plan updated" | — |
| Profile updated | success | "Profile updated" | — |
| Password changed | success | "Password changed" | — |
| Email verification sent | info | "Verification email sent" | "Check your inbox." |
| Tenant deleted (admin) | success | "Tenant deleted" | — |
| Tenant impersonation started | warning | "Impersonating tenant" | "You are viewing as {tenant name}." |
| Impersonation ended | info | "Returned to admin" | — |
| Clipboard copy success | success | "Copied to clipboard" | — |
| Clipboard copy failed | error | "Copy failed" | "Please copy manually." |
| API key validation failed | error | "Invalid API key" | "Please check your key and try again." |
| Discord token invalid | error | "Invalid bot token" | "Please check the token and try again." |
| Server error (generic) | error | "Something went wrong" | "Please try again or contact support." |
| Subscription webhook received | info | "Subscription updated" | — |
| Bot status changed to online | success | "Bot is online" | — |
| Bot status changed to offline | error | "Bot went offline" | "Check the integrations page for details." |

---

### 3.3 ConfirmDialog

**File:** `components/ui/ConfirmDialog.tsx`

**Purpose:** Modal dialog requiring explicit user confirmation before a destructive or irreversible action. Used for: delete tenant, disconnect Discord, remove service, downgrade plan. Blocks interaction with the page until dismissed.

**Props interface:**

```typescript
type ConfirmVariant = 'danger' | 'warning' | 'default'

interface ConfirmDialogProps {
  open: boolean                   // Controlled open state
  onOpenChange: (open: boolean) => void  // Called when dialog should close (backdrop click, Escape, cancel)
  variant?: ConfirmVariant        // Controls header icon and confirm button color; default 'default'
  title: string                   // Dialog heading, e.g. "Delete tenant?"
  description: string             // Explanation of what will happen, e.g. "This will permanently delete..."
  confirmLabel?: string           // Confirm button text; default "Confirm"
  cancelLabel?: string            // Cancel button text; default "Cancel"
  onConfirm: () => void | Promise<void>  // Called on confirm; if Promise, button shows loading state
  loading?: boolean               // External loading state (controlled); disables buttons
  confirmationText?: string       // If provided, user must type this exact string to enable confirm button
  confirmationPlaceholder?: string // Input placeholder; default "Type {confirmationText} to confirm"
}
```

**Variant styles:**

| Variant | Header icon | Icon color | Confirm button |
|---------|------------|------------|----------------|
| `danger` | `Trash2` (Lucide, 20px) | `#DC2626` | Background `#DC2626`, text White, hover `#B91C1C` |
| `warning` | `AlertTriangle` (Lucide, 20px) | `#D97706` | Background `#D97706`, text White, hover `#B45309` |
| `default` | `HelpCircle` (Lucide, 20px) | `#0C1F40` | Primary (Aqua bg, Navy text) same as brand primary button |

**Overlay (backdrop):**

| Property | Value |
|----------|-------|
| Position | `fixed inset-0` |
| Background | `rgba(12,31,64,0.55)` |
| Backdrop-filter | `blur(4px)` |
| Z-index | `50` |
| Animation | Fade in: `opacity 0` → `opacity 1`, `150ms ease` |

**Dialog panel dimensions:**

| Property | Value |
|----------|-------|
| Position | Centered: `fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2` |
| Width | `440px` |
| Max-width | `calc(100vw - 32px)` |
| Background | White (`#FFFFFF`) |
| Border | `1px solid rgba(12,31,64,0.12)` |
| Border-radius | `0` |
| Box-shadow | `0 20px 60px rgba(12,31,64,0.18)` |
| Z-index | `51` |
| Animation | Scale in: `scale(0.96) opacity(0)` → `scale(1) opacity(1)`, `200ms cubic-bezier(0.22, 1, 0.36, 1)` |

**Internal structure:**

```
ConfirmDialog
├── Header (padding: 24px 24px 0)
│   ├── IconContainer (36px × 36px, background: variant icon color at 8% opacity, centered icon)
│   └── Title (Archivo Semi-Expanded, 18px, weight 500, Navy, margin-top: 12px)
├── Body (padding: 12px 24px 0)
│   ├── Description (Inter, 14px, weight 400, rgba(12,31,64,0.65), line-height: 1.6)
│   └── ConfirmationInput? (rendered if confirmationText prop is provided — see below)
└── Footer (padding: 20px 24px 24px, display: flex, justify-content: flex-end, gap: 8px)
    ├── CancelButton (secondary variant, 38px height, "Cancel")
    └── ConfirmButton (variant-dependent, 38px height, loading state supported)
```

**IconContainer:**

| Property | Value |
|----------|-------|
| Size | `36px × 36px` |
| Display | `flex`, `align-items: center`, `justify-content: center` |
| Background | Variant icon color at 8% opacity (e.g. `rgba(220,38,38,0.08)` for danger) |
| Border-radius | `0` |

**ConfirmationInput (when `confirmationText` provided):**

Rendered below the description when `confirmationText` prop is set. Forces the user to type the exact string before confirming.

| Property | Value |
|----------|-------|
| Margin-top | `16px` |
| Label | Inter, 13px, weight 500, Navy, margin-bottom 6px |
| Label text | `Type <code>{confirmationText}</code> to confirm` — the code element uses monospace font, background `rgba(12,31,64,0.06)`, padding `2px 4px` |
| Input element | Uses `FormInput` component (see section 2.1) with no label, full width |
| Input placeholder | Prop `confirmationPlaceholder` or `"Type {confirmationText} to confirm"` |
| Confirm button | Disabled until input value === `confirmationText` (exact string match, case-sensitive) |

**Cancel button:**

| Property | Value |
|----------|-------|
| Variant | Secondary (transparent bg, Navy border, Navy text) |
| Height | `38px` |
| Font | Inter, 14px, weight 600 |
| Padding | `0 20px` |
| Border | `1.5px solid #0C1F40` |
| Disabled | When `loading=true` |

**Confirm button loading state:**

When `onConfirm` returns a Promise (or `loading=true`), the confirm button:
- Shows a `Loader2` (Lucide) icon, `14px`, spinning at `1s linear infinite`
- Text replaced by `loading` prop label (same as `confirmLabel`)
- Pointer-events disabled
- Opacity `0.75`

**Keyboard behavior:**

| Key | Action |
|-----|--------|
| `Escape` | Calls `onOpenChange(false)` — closes dialog (if not loading) |
| `Enter` | Activates focused button (confirm or cancel) |
| `Tab` / `Shift+Tab` | Cycles focus through: Cancel → Confirm → Close (if shown) → back |
| Focus trap | Focus cannot leave the dialog while open |

**Scroll lock:** When open, `document.body` gets `overflow: hidden` to prevent background scroll.

**Accessibility:**

| ARIA | Value |
|------|-------|
| Dialog role | `role="dialog"` |
| `aria-modal` | `"true"` |
| `aria-labelledby` | References title element ID |
| `aria-describedby` | References description element ID |
| Initial focus | On `CancelButton` (safe default — not destructive) |

**Complete usage inventory (all ConfirmDialogs in the app):**

| Location | Variant | Title | Description | confirmLabel | confirmationText |
|----------|---------|-------|-------------|--------------|-----------------|
| Settings → Disconnect Discord | danger | "Disconnect bot?" | "Your Discord bot will go offline immediately. Any active conversations will be interrupted. You can reconnect at any time." | "Disconnect" | — |
| Settings → Delete Account | danger | "Delete your account?" | "This permanently deletes your Daimon account, all tenant data, Discord connections, API keys, and cancels your subscription. This cannot be undone." | "Delete account" | `"delete my account"` |
| Admin → Delete Tenant | danger | "Delete tenant?" | "This permanently deletes the tenant "{name}" and all associated data. The bot will go offline immediately." | "Delete tenant" | tenant slug |
| Integrations → Disconnect service | warning | "Disconnect {service}?" | "Disconnecting {service} will disable all {service} tools in Decision Orchestrator. You can reconnect at any time." | "Disconnect" | — |
| Billing → Downgrade to Free | warning | "Downgrade to Free?" | "You will lose access to all Starter features at the end of your current billing period. Usage above Free limits will be disabled." | "Downgrade" | — |

---

### 3.4 Modal

**File:** `components/ui/Modal.tsx`

**Purpose:** General-purpose modal dialog for non-destructive interactions: forms, previews, detail views. Unlike `ConfirmDialog` (which has a fixed layout), `Modal` accepts arbitrary children. Used for: add service connection, view audit log entry, disconnect service form.

**Props interface:**

```typescript
interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string            // Optional subtitle below title in header
  size?: 'sm' | 'md' | 'lg'      // Default 'md'
  children: React.ReactNode       // Modal body content
  footer?: React.ReactNode        // Optional footer area (for action buttons)
  showClose?: boolean             // Show × button in header; default true
  closeOnBackdrop?: boolean       // Whether backdrop click closes; default true
  closeOnEscape?: boolean         // Whether Escape closes; default true
  loading?: boolean               // When true, disables close triggers and shows overlay inside modal
}
```

**Size variants:**

| Size | Width | Max-width |
|------|-------|-----------|
| `sm` | `380px` | `calc(100vw - 32px)` |
| `md` | `520px` | `calc(100vw - 32px)` |
| `lg` | `720px` | `calc(100vw - 48px)` |

**Overlay (backdrop) — identical to ConfirmDialog:**

| Property | Value |
|----------|-------|
| Position | `fixed inset-0` |
| Background | `rgba(12,31,64,0.55)` |
| Backdrop-filter | `blur(4px)` |
| Z-index | `50` |

**Modal panel:**

| Property | Value |
|----------|-------|
| Position | `fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2` |
| Max-height | `calc(100vh - 80px)` |
| Display | `flex`, `flex-direction: column` |
| Background | White (`#FFFFFF`) |
| Border | `1px solid rgba(12,31,64,0.12)` |
| Border-radius | `0` |
| Box-shadow | `0 20px 60px rgba(12,31,64,0.18)` |
| Z-index | `51` |
| Animation | Same as ConfirmDialog: `scale(0.96) opacity(0)` → `scale(1) opacity(1)`, `200ms cubic-bezier(0.22, 1, 0.36, 1)` |
| Overflow | `hidden` (body section scrolls internally if content overflows) |

**Internal structure:**

```
Modal
├── ModalHeader (padding: 20px 24px, border-bottom: 1px solid rgba(12,31,64,0.08), flex-shrink: 0)
│   ├── TitleGroup (flex: 1)
│   │   ├── Title (Archivo Semi-Expanded, 18px, weight 500, Navy)
│   │   └── Description? (Inter, 13px, weight 400, rgba(12,31,64,0.55), margin-top: 2px)
│   └── CloseButton? (showClose=true — 28px × 28px, X icon 16px, rgba(12,31,64,0.45) → rgba(12,31,64,0.80) on hover)
├── ModalBody (padding: 24px, flex: 1, overflow-y: auto, children rendered here)
│   └── {children}
└── ModalFooter? (padding: 16px 24px, border-top: 1px solid rgba(12,31,64,0.08), flex-shrink: 0)
    └── {footer}
```

**ModalBody scroll:** When content height exceeds `calc(100vh - 80px - header height - footer height)`, the body section scrolls with `overflow-y: auto`. The header and footer remain sticky.

**Loading overlay (when `loading=true`):**

An overlay is rendered inside the modal panel covering the body:
| Property | Value |
|----------|-------|
| Position | `absolute inset-0` (positioned relative to modal panel) |
| Background | `rgba(255,255,255,0.75)` |
| Display | `flex`, `align-items: center`, `justify-content: center` |
| Z-index | `1` (above body, below nothing) |
| Content | `Loader2` (Lucide, 24px, Navy, spinning `1s linear infinite`) |

**Close button:**

| Property | Value |
|----------|-------|
| Size | `28px × 28px` |
| Icon | `X` (Lucide, 16px) |
| Icon color | `rgba(12,31,64,0.45)` |
| Hover icon color | `rgba(12,31,64,0.80)` |
| Background | Transparent |
| Border | None |
| Focus-visible | `outline: 2px solid #B4E7DD`, `outline-offset: 2px` |
| Transition | `color 0.15s ease` |

**Keyboard behavior:** Same as ConfirmDialog — Escape to close (if `closeOnEscape=true`), focus trap, scroll lock.

**Accessibility:**

| ARIA | Value |
|------|-------|
| Dialog role | `role="dialog"` |
| `aria-modal` | `"true"` |
| `aria-labelledby` | References title element ID |
| `aria-describedby` | References description element ID (if present) |
| Initial focus | First focusable element in `ModalBody`, or `CloseButton` as fallback |

**Complete usage inventory (all Modals in the app):**

| Location | Size | Title | Purpose |
|----------|------|-------|---------|
| Integrations → Add API key service | `sm` | "Connect {service}" | Form with API key input + save/cancel |
| Integrations → OAuth connecting | `sm` | "Connecting {service}..." | Loading state during OAuth redirect |
| Admin → View audit log entry | `md` | "Audit log entry" | Full detail of a single log entry |
| Admin → Impersonate tenant confirm | `sm` | "Impersonate tenant?" | Warning + confirm button before switching |
| Billing → Manage payment method | `md` | "Payment method" | Stripe Elements iframe for card update |

---

### 3.5 EmptyState

**File:** `components/ui/EmptyState.tsx`

**Purpose:** Displayed when a list or data section has no content yet. Used in: integrations page (no services connected), admin tenant list (no tenants), activity feed (no activity), dashboard (no bot status history), tool reference (no search results).

**Props interface:**

```typescript
interface EmptyStateProps {
  icon?: React.ReactNode           // Lucide icon component, 32px; if omitted, uses default placeholder icon
  title: string                    // Primary message, e.g. "No integrations yet"
  description?: string             // Supporting text, e.g. "Connect your first service to get started."
  action?: {
    label: string                  // CTA button label, e.g. "Connect a service"
    onClick?: () => void           // Mutually exclusive with href
    href?: string                  // Mutually exclusive with onClick — renders as Next.js Link
    variant?: 'primary' | 'secondary'  // Default 'primary'
  }
  size?: 'sm' | 'md' | 'lg'       // Controls icon + title size; default 'md'
  className?: string
}
```

**Size variants:**

| Size | Icon container | Icon size | Title font | Description font | Padding |
|------|---------------|-----------|------------|-----------------|---------|
| `sm` | `48px × 48px` | `20px` | Inter, 14px, weight 600 | Inter, 13px | `24px 0` |
| `md` | `64px × 64px` | `28px` | Inter, 16px, weight 600 | Inter, 14px | `40px 0` |
| `lg` | `80px × 80px` | `36px` | Archivo Semi-Expanded, 20px, weight 500 | Inter, 15px | `60px 0` |

**Layout:**

| Property | Value |
|----------|-------|
| Display | `flex`, `flex-direction: column`, `align-items: center`, `text-align: center` |
| Width | `100%` |
| Max-width | `360px` (centered within parent) |
| Margin | `0 auto` |

**Icon container:**

| Property | Value |
|----------|-------|
| Background | `rgba(180,231,221,0.20)` (Aqua at 20%) |
| Border | `1px solid rgba(180,231,221,0.50)` |
| Border-radius | `0` |
| Display | `flex`, `align-items: center`, `justify-content: center` |
| Icon color | `#0C1F40` at 45% opacity (`rgba(12,31,64,0.45)`) |
| Margin-bottom | `16px` |

**Default icon** (when `icon` prop is omitted): `InboxIcon` (Lucide) — a tray/inbox indicating emptiness.

**Title:**

| Property | Value |
|----------|-------|
| Color | Navy (`#0C1F40`) |
| Margin-bottom | `6px` |
| Font | See size variants above |

**Description:**

| Property | Value |
|----------|-------|
| Color | `rgba(12,31,64,0.55)` |
| Line-height | `1.6` |
| Margin-bottom | `20px` (when action present) |
| Max-width | `280px` |

**Action button:** Uses the brand Button component (see section 5 — Action Components). Variant `primary` maps to Aqua bg + Navy text. Variant `secondary` maps to transparent + Navy border.

**Complete usage inventory:**

| Location | Icon | Title | Description | Action |
|----------|------|-------|-------------|--------|
| Integrations page — no services | `PlugZap` (Lucide) | "No integrations yet" | "Connect your first service to unlock tools in Decision Orchestrator." | "Browse services" (scroll to grid) |
| Admin → tenant list — no tenants | `Users` (Lucide) | "No tenants yet" | "Tenants appear here when users sign up." | — |
| Admin → audit log — no entries | `FileText` (Lucide) | "No audit events yet" | "Admin actions will appear here." | — |
| Dashboard → activity feed — no activity | `Activity` (Lucide) | "No recent activity" | "Your bot's tool calls and decisions will appear here." | — |
| Dashboard → bot never connected | `Bot` (Lucide) | "Bot not connected" | "Complete the setup checklist to connect your Discord bot." | "Go to settings" (`href="/dashboard/settings"`) |
| Tool reference — no search results | `Search` (Lucide) | "No tools found" | "Try a different search term or browse all categories." | "Clear search" (onClick) |
| Integrations — service search empty | `Search` (Lucide) | "No matching services" | "Try a different search term." | "Clear search" (onClick) |
| Billing — no invoices yet | `Receipt` (Lucide) | "No invoices yet" | "Your billing history will appear here after your first payment." | — |

---

### 3.6 ErrorState

**File:** `components/ui/ErrorState.tsx`

**Purpose:** Displayed when a data fetch fails and the section cannot render. Provides a retry mechanism. Used as a replacement for the page/section content when an error occurs (not as a toast or banner — those are used for non-blocking errors).

**Props interface:**

```typescript
interface ErrorStateProps {
  title?: string                   // Error heading; default "Something went wrong"
  description?: string             // Error detail; default "We couldn't load this content. Please try again."
  onRetry?: () => void             // If provided, shows a "Try again" button
  error?: Error | string           // Technical error detail (shown in dev mode only, hidden in prod)
  size?: 'sm' | 'md' | 'lg'       // Same size tokens as EmptyState; default 'md'
  className?: string
}
```

**Visual design:** Similar layout to `EmptyState` but uses error color scheme.

**Icon:** `AlertCircle` (Lucide) — always used, not overridable.

**Icon container:**

| Property | Value |
|----------|-------|
| Background | `rgba(220,38,38,0.06)` |
| Border | `1px solid rgba(220,38,38,0.20)` |
| Border-radius | `0` |
| Icon color | `#DC2626` |

**Title:**

| Property | Value |
|----------|-------|
| Color | Navy (`#0C1F40`) |
| Font | Same as EmptyState by size variant |

**Description:**

| Property | Value |
|----------|-------|
| Color | `rgba(12,31,64,0.55)` |
| Line-height | `1.6` |
| Max-width | `280px` |

**Retry button (when `onRetry` provided):**

| Property | Value |
|----------|-------|
| Label | "Try again" |
| Variant | Secondary (transparent, Navy border) |
| Size | Compact (38px height) |
| Leading icon | `RotateCw` (Lucide, 14px) |
| Icon spacing | `gap: 6px` |

**Development mode error detail:**

When `error` prop is provided AND `process.env.NODE_ENV === 'development'`, renders a `<pre>` block below the retry button:

| Property | Value |
|----------|-------|
| Font | `font-mono`, 11px |
| Color | `#DC2626` at 75% opacity |
| Background | `rgba(220,38,38,0.04)` |
| Border | `1px solid rgba(220,38,38,0.15)` |
| Padding | `8px 12px` |
| Margin-top | `16px` |
| Max-width | `400px` |
| Text-align | `left` |
| White-space | `pre-wrap` |
| Word-break | `break-word` |
| Max-height | `120px` |
| Overflow-y | `auto` |

In production (`NODE_ENV !== 'development'`), the `error` prop is completely suppressed — no technical detail shown to users.

**Layout:** Identical to `EmptyState` (flex column, centered, max-width 360px).

**Complete usage inventory:**

| Location | Title | Description | onRetry |
|----------|-------|-------------|---------|
| Dashboard data fetch failure | "Couldn't load dashboard" | "We couldn't load your dashboard data. Please try again." | Yes — re-runs dashboard query |
| Integrations fetch failure | "Couldn't load integrations" | "We couldn't load your connected services. Please try again." | Yes |
| Admin tenant list fetch failure | "Couldn't load tenants" | "We couldn't load the tenant list. Please try again." | Yes |
| Admin audit log fetch failure | "Couldn't load audit log" | "We couldn't load the audit log. Please try again." | Yes |
| Billing page fetch failure | "Couldn't load billing info" | "We couldn't load your subscription details. Please try again." | Yes |
| Settings page fetch failure | "Couldn't load settings" | "We couldn't load your settings. Please try again." | Yes |
| Bot status fetch failure | "Couldn't load bot status" | "Bot status is temporarily unavailable." | Yes — silent retry, shows ErrorState only after 3 failed attempts |
| Docs page render failure | "Page unavailable" | "This documentation page couldn't be loaded." | No (static docs don't retry) |

---

### 3.7 SkeletonLoader

**File:** `components/ui/SkeletonLoader.tsx` (base component) + `components/ui/skeletons/` (page-specific composites)

**Purpose:** Placeholder UI shown while data is loading. Mimics the layout of the content that will replace it, reducing perceived load time and preventing layout shift. Uses a shimmer animation.

**Base component props:**

```typescript
interface SkeletonProps {
  width?: string | number          // CSS width; default '100%'
  height?: string | number         // CSS height; default '16px'
  className?: string
  style?: React.CSSProperties      // For arbitrary dimensions not coverable by width/height
}
```

**Base component styling:**

| Property | Value |
|----------|-------|
| Background | `linear-gradient(90deg, rgba(12,31,64,0.06) 25%, rgba(12,31,64,0.10) 50%, rgba(12,31,64,0.06) 75%)` |
| Background-size | `200% 100%` |
| Animation | `shimmer 1.5s ease-in-out infinite` |
| Border-radius | `0` |
| Display | `block` |

**Shimmer keyframes:**

```css
@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

---

#### Composite skeletons (page-specific, in `components/ui/skeletons/`)

These pre-composed skeleton layouts are used directly in page components during loading states.

---

##### DashboardSkeleton

**File:** `components/ui/skeletons/DashboardSkeleton.tsx`

**Mimics:** Dashboard home page layout

**Structure:**

```
DashboardSkeleton
├── PageHeader row
│   └── Skeleton (width: 200px, height: 28px)  ← page title
├── StatusCards row (4 cards, gap: 16px, display: grid, grid-template-columns: repeat(4, 1fr))
│   └── [×4] StatusCardSkeleton
│       ├── Skeleton (width: 80px, height: 12px)   ← label
│       ├── Skeleton (width: 48px, height: 28px, margin-top: 8px)  ← value
│       └── Skeleton (width: 60%, height: 10px, margin-top: 6px)  ← sub-label
├── Divider (16px margin)
├── TwoColumn row (grid: 7fr 5fr, gap: 24px)
│   ├── Left: ActivityFeedSkeleton
│   │   ├── Skeleton (width: 140px, height: 18px)  ← section title
│   │   └── [×5] ActivityRowSkeleton (margin-top: 16px each)
│   │       ├── Skeleton (width: 32px, height: 32px)  ← avatar circle (still square per brand)
│   │       └── ContentGroup (flex column, gap: 4px)
│   │           ├── Skeleton (width: 70%, height: 13px)
│   │           └── Skeleton (width: 40%, height: 11px)
│   └── Right: OnboardingChecklistSkeleton
│       ├── Skeleton (width: 180px, height: 18px)  ← section title
│       └── [×4] ChecklistRowSkeleton (margin-top: 12px each)
│           ├── Skeleton (width: 20px, height: 20px)  ← checkbox area
│           └── Skeleton (width: 85%, height: 14px)   ← text
```

---

##### IntegrationsSkeleton

**File:** `components/ui/skeletons/IntegrationsSkeleton.tsx`

**Mimics:** Integrations page service grid

**Structure:**

```
IntegrationsSkeleton
├── PageHeader row
│   ├── Skeleton (width: 160px, height: 28px)   ← title
│   └── Skeleton (width: 240px, height: 38px)   ← search input
├── ServiceGrid (display: grid, grid-template-columns: repeat(3, 1fr), gap: 16px, margin-top: 24px)
│   └── [×9] ServiceCardSkeleton
│       ├── Skeleton (width: 40px, height: 40px)   ← service icon
│       ├── Skeleton (width: 100px, height: 16px, margin-top: 10px)  ← service name
│       ├── Skeleton (width: 80%, height: 12px, margin-top: 6px)     ← description line 1
│       ├── Skeleton (width: 55%, height: 12px, margin-top: 4px)     ← description line 2
│       └── Skeleton (width: 100px, height: 34px, margin-top: 12px) ← button
```

---

##### BillingSkeleton

**File:** `components/ui/skeletons/BillingSkeleton.tsx`

**Mimics:** Billing page

**Structure:**

```
BillingSkeleton
├── PageHeader row
│   └── Skeleton (width: 120px, height: 28px)
├── PlanCard (full-width, padding: 24px, border skeleton)
│   ├── Skeleton (width: 160px, height: 22px)  ← plan name
│   ├── Skeleton (width: 240px, height: 14px, margin-top: 8px)  ← plan description
│   └── ButtonRow (margin-top: 16px, gap: 12px)
│       ├── Skeleton (width: 140px, height: 38px)  ← primary CTA
│       └── Skeleton (width: 120px, height: 38px)  ← secondary CTA
├── Divider (24px margin)
├── ApiKeysCard (full-width)
│   ├── Skeleton (width: 140px, height: 20px)  ← section title
│   └── [×2] ApiKeyRowSkeleton (margin-top: 16px each)
│       ├── Skeleton (width: 80px, height: 14px)   ← key label
│       └── Skeleton (width: 90%, height: 38px)    ← masked input
```

---

##### SettingsSkeleton

**File:** `components/ui/skeletons/SettingsSkeleton.tsx`

**Mimics:** Settings page

**Structure:**

```
SettingsSkeleton
├── PageHeader row
│   └── Skeleton (width: 100px, height: 28px)
├── [×3] SettingsSectionSkeleton (margin-top: 32px each)
│   ├── SectionTitle Skeleton (width: 160px, height: 20px)
│   ├── Divider (8px margin)
│   └── [×2] FieldRowSkeleton (margin-top: 16px each)
│       ├── Skeleton (width: 100px, height: 13px)   ← label
│       └── Skeleton (width: 100%, height: 40px, margin-top: 6px)  ← input
```

---

##### AdminTenantListSkeleton

**File:** `components/ui/skeletons/AdminTenantListSkeleton.tsx`

**Mimics:** Admin panel tenant list

**Structure:**

```
AdminTenantListSkeleton
├── PageHeader row
│   ├── Skeleton (width: 140px, height: 28px)   ← title
│   └── Skeleton (width: 260px, height: 38px)   ← search
├── TableHeaderSkeleton (margin-top: 24px)
│   ├── [×5] Skeleton (width varies: 15%, 20%, 15%, 15%, 10%; height: 13px each, gap: 16px)
├── [×8] TenantRowSkeleton (height: 56px, border-bottom skeleton, flex, align-items: center, gap: 16px)
│   ├── Skeleton (width: 15%, height: 15px)
│   ├── Skeleton (width: 20%, height: 13px)
│   ├── Skeleton (width: 15%, height: 20px)   ← status badge
│   ├── Skeleton (width: 15%, height: 13px)
│   └── Skeleton (width: 10%, height: 13px)
```

---

### Summary Table — Feedback Components

| Component | File | Primary Usage |
|-----------|------|---------------|
| `AlertBanner` | `components/ui/AlertBanner.tsx` | Inline contextual alerts within pages/cards |
| `Toast` | `components/ui/Toast.tsx` + `ToastProvider.tsx` + `lib/toast.ts` | Floating action-confirmation notifications |
| `ConfirmDialog` | `components/ui/ConfirmDialog.tsx` | Destructive/irreversible action confirmation |
| `Modal` | `components/ui/Modal.tsx` | General-purpose dialog with arbitrary content |
| `EmptyState` | `components/ui/EmptyState.tsx` | No-data placeholder for lists and sections |
| `ErrorState` | `components/ui/ErrorState.tsx` | Data-fetch failure with retry option |
| `SkeletonLoader` | `components/ui/SkeletonLoader.tsx` + `components/ui/skeletons/` | Loading placeholders mimicking page layout |


---

## 4. Data Display Components

Data display components render structured information — badges, status indicators, tables, statistics, activity feeds, and copy utilities. These components are read-only (no user input) and focus on communicating system state clearly.

---

### 4.1 Badge

**File:** `components/ui/Badge.tsx`

**Purpose:** Small inline label conveying categorical or status information. The base `Badge` component is the primitive; typed variants (PlanBadge, StatusBadge, KeyStatusBadge, ConnectionStatusBadge) are built on top of it.

**Props interface:**

```typescript
type BadgeVariant =
  | 'plan-free'
  | 'plan-starter'
  | 'plan-pro'
  | 'status-pending'
  | 'status-configured'
  | 'status-active'
  | 'status-suspended'
  | 'key-valid'
  | 'key-invalid'
  | 'key-unconfigured'
  | 'key-validating'
  | 'connection-connected'
  | 'connection-connecting'
  | 'connection-error'
  | 'connection-disconnected'
  | 'neutral'
  | 'info'
  | 'success'
  | 'warning'
  | 'danger'

interface BadgeProps {
  variant: BadgeVariant
  label?: string          // Override the default label for the variant
  size?: 'sm' | 'md'     // Default: 'sm'
  uppercase?: boolean     // Default: true for named variants, false for generic
  className?: string
}
```

**Base styles (all badges):**

| Property | Value |
|----------|-------|
| Font | Inter |
| Font-weight | `600` |
| Line-height | `1` |
| Border-radius | `0px` (PyMC sharp corners — NEVER rounded) |
| White-space | `nowrap` |
| Display | `inline-flex`, `align-items: center` |

**Size variants:**

| Size | Font size | Padding | Letter-spacing |
|------|-----------|---------|----------------|
| `sm` (default) | `11px` | `2px 8px` | `0.05em` |
| `md` | `13px` | `3px 10px` | `0.03em` |

**Plan badge variants (`plan-*`):**

| Variant | Default Label | Background | Text color | Border |
|---------|--------------|-----------|-----------|--------|
| `plan-free` | "FREE" | `rgba(12,31,64,0.08)` | `rgba(12,31,64,0.65)` | `1.5px solid rgba(12,31,64,0.15)` |
| `plan-starter` | "STARTER" | `rgba(180,231,221,0.20)` | `#0C1F40` (Navy) | `1.5px solid rgba(180,231,221,0.60)` |
| `plan-pro` | "PRO" | `#0C1F40` (Navy) | `#FFFFFF` (White) | None |

Note: uppercase always true for plan badges.

**Tenant status badge variants (`status-*`):**

| Variant | Default Label | Background | Text color | Border |
|---------|--------------|-----------|-----------|--------|
| `status-pending` | "PENDING" | `#FEF9C3` (yellow-100) | `#854D0E` (yellow-800) | None |
| `status-configured` | "CONFIGURED" | `#DBEAFE` (blue-100) | `#1E40AF` (blue-800) | None |
| `status-active` | "ACTIVE" | `rgba(34,197,94,0.12)` | `#16A34A` (green-700) | None |
| `status-suspended` | "SUSPENDED" | `rgba(239,68,68,0.12)` | `#DC2626` (red-600) | None |

**API key status badge variants (`key-*`):**

| Variant | Default Label | Background | Text color | Border |
|---------|--------------|-----------|-----------|--------|
| `key-valid` | "VALID" | `rgba(34,197,94,0.12)` | `#16A34A` | `1.5px solid rgba(34,197,94,0.30)` |
| `key-invalid` | "INVALID" | `rgba(239,68,68,0.12)` | `#DC2626` | `1.5px solid rgba(239,68,68,0.30)` |
| `key-unconfigured` | "NOT CONFIGURED" | `rgba(12,31,64,0.08)` | `rgba(12,31,64,0.55)` | `1.5px solid rgba(12,31,64,0.15)` |
| `key-validating` | "CHECKING…" | `rgba(245,158,11,0.12)` | `#D97706` | `1.5px solid rgba(245,158,11,0.30)` |

Note: `key-validating` animates the ellipsis via a CSS animation (3 dots cycle: `…` → `.` → `..` → `…` at 600ms intervals).

**Discord connection status badge variants (`connection-*`):**

| Variant | Default Label | Background | Text color | Border |
|---------|--------------|-----------|-----------|--------|
| `connection-connected` | "CONNECTED" | `rgba(34,197,94,0.12)` | `#16A34A` | `1.5px solid rgba(34,197,94,0.30)` |
| `connection-connecting` | "CONNECTING" | `rgba(245,158,11,0.12)` | `#D97706` | `1.5px solid rgba(245,158,11,0.30)` |
| `connection-error` | "ERROR" | `rgba(239,68,68,0.12)` | `#DC2626` | `1.5px solid rgba(239,68,68,0.30)` |
| `connection-disconnected` | "DISCONNECTED" | `rgba(12,31,64,0.08)` | `rgba(12,31,64,0.55)` | `1.5px solid rgba(12,31,64,0.15)` |

**Generic semantic variants:**

| Variant | Background | Text color | Border |
|---------|-----------|-----------|--------|
| `neutral` | `rgba(12,31,64,0.08)` | `rgba(12,31,64,0.65)` | `1.5px solid rgba(12,31,64,0.15)` |
| `info` | `#DBEAFE` | `#1E40AF` | None |
| `success` | `rgba(34,197,94,0.12)` | `#16A34A` | None |
| `warning` | `rgba(245,158,11,0.12)` | `#D97706` | None |
| `danger` | `rgba(239,68,68,0.12)` | `#DC2626` | None |

**Implementation:**

```tsx
// components/ui/Badge.tsx
export function Badge({
  variant,
  label,
  size = 'sm',
  uppercase = true,
  className,
}: BadgeProps) {
  const config = BADGE_CONFIGS[variant]
  const displayLabel = label ?? config.defaultLabel

  return (
    <span
      className={cn(
        'inline-flex items-center whitespace-nowrap font-semibold leading-none',
        size === 'sm' ? 'text-[11px] px-[8px] py-[2px] tracking-[0.05em]' : 'text-[13px] px-[10px] py-[3px] tracking-[0.03em]',
        uppercase && 'uppercase',
        className
      )}
      style={{
        background: config.background,
        color: config.color,
        border: config.border ?? 'none',
        borderRadius: '0px',
      }}
    >
      {displayLabel}
    </span>
  )
}
```

**Where used:**

| Badge variant | Used in |
|---------------|---------|
| `plan-free/starter/pro` | DashboardTopbar, admin tenant list, billing page |
| `status-pending/configured/active/suspended` | Admin tenant list, admin tenant detail |
| `key-valid/invalid/unconfigured/validating` | API Keys Card (dashboard), billing page |
| `connection-connected/connecting/error/disconnected` | Bot Status Card, admin tenant detail |
| `neutral` | Misc labels, doc tags |
| `success/warning/danger` | AlertBanner, admin audit log entries |

**No hover/focus states** — badges are non-interactive. If a badge must be clickable (e.g., a filter trigger), wrap it in a `<button>` element.

**Accessibility:** Add `aria-label` describing the status when badge is the only indication of state, e.g., `aria-label="Plan: Pro"`. Screen readers must not rely solely on color.

---

### 4.2 StatusIndicator

**File:** `components/ui/StatusIndicator.tsx`

**Purpose:** An animated or static dot paired with a status label. Used in Bot Status Card headings to convey live connection state. Larger and more prominent than a Badge — intended as a page-level status signal rather than a table cell label.

**Props interface:**

```typescript
type IndicatorStatus = 'connected' | 'connecting' | 'error' | 'disconnected' | 'suspended'

interface StatusIndicatorProps {
  status: IndicatorStatus
  label?: string          // Override default label text
  dotSize?: number        // Default: 12 (px)
  labelSize?: number      // Default: 14 (px) — font-size for accompanying label
  showLabel?: boolean     // Default: true
  className?: string
}
```

**Dot specifications:**

| Status | Dot color | Animation |
|--------|-----------|-----------|
| `connected` | `#22C55E` (green-500) | Pulse ring: `box-shadow` radiates outward, 2s infinite ease-out |
| `connecting` | `#F59E0B` (amber-400) | Slow fade: opacity oscillates 0.4 → 1 → 0.4, 1.5s infinite ease-in-out |
| `error` | `#EF4444` (red-500) | Static — no animation |
| `disconnected` | `rgba(12,31,64,0.25)` (muted) | Static — no animation |
| `suspended` | `rgba(12,31,64,0.40)` (dark muted) | Static — no animation |

**Pulse animation for `connected` state:**

```css
@keyframes status-pulse {
  0%   { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.50); }
  70%  { box-shadow: 0 0 0 8px rgba(34, 197, 94, 0); }
  100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
}

.status-dot-connected {
  animation: status-pulse 2s infinite ease-out;
}
```

**Fade animation for `connecting` state:**

```css
@keyframes status-fade {
  0%, 100% { opacity: 0.4; }
  50%       { opacity: 1; }
}

.status-dot-connecting {
  animation: status-fade 1.5s infinite ease-in-out;
}
```

**Default labels per status:**

| Status | Default label |
|--------|--------------|
| `connected` | "Connected" |
| `connecting` | "Connecting" |
| `error` | "Connection Error" |
| `disconnected` | "Disconnected" |
| `suspended` | "Suspended" |

**Layout:**

```
[dot] [label]
  gap: 10px
  align-items: center
  display: flex
```

**Label typography:**

| Property | Value |
|----------|-------|
| Font | Archivo Semi-Expanded (wdth: 112.5) |
| Font-size | `28px` (default when used in Bot Status Card heading context) |
| Font-weight | `500` |
| Color | Navy (`#0C1F40`) |
| Note | When `labelSize` prop overrides to `14px`, label uses Inter Regular instead of Archivo |

**Dot dimensions:**

| Property | Value |
|----------|-------|
| Width | `dotSize` px (default `12px`) |
| Height | `dotSize` px |
| Border-radius | `50%` (always circular) |
| Flex-shrink | `0` |

**Implementation:**

```tsx
// components/ui/StatusIndicator.tsx
export function StatusIndicator({
  status,
  label,
  dotSize = 12,
  labelSize = 14,
  showLabel = true,
  className,
}: StatusIndicatorProps) {
  const dotColorMap: Record<IndicatorStatus, string> = {
    connected:    '#22C55E',
    connecting:   '#F59E0B',
    error:        '#EF4444',
    disconnected: 'rgba(12,31,64,0.25)',
    suspended:    'rgba(12,31,64,0.40)',
  }
  const defaultLabelMap: Record<IndicatorStatus, string> = {
    connected:    'Connected',
    connecting:   'Connecting',
    error:        'Connection Error',
    disconnected: 'Disconnected',
    suspended:    'Suspended',
  }
  const animationClassMap: Record<IndicatorStatus, string> = {
    connected:    'status-dot-connected',
    connecting:   'status-dot-connecting',
    error:        '',
    disconnected: '',
    suspended:    '',
  }

  return (
    <div className={cn('flex items-center gap-[10px]', className)}>
      <span
        className={cn('flex-shrink-0 rounded-full', animationClassMap[status])}
        style={{
          width: dotSize,
          height: dotSize,
          backgroundColor: dotColorMap[status],
        }}
        role="img"
        aria-label={`Status: ${label ?? defaultLabelMap[status]}`}
      />
      {showLabel && (
        <span style={{ fontSize: labelSize }}>
          {label ?? defaultLabelMap[status]}
        </span>
      )}
    </div>
  )
}
```

**Where used:**

| Location | Status prop | dotSize | labelSize |
|----------|------------|---------|-----------|
| Bot Status Card heading | Dynamic from `discord_connections.status` | `12` | `28` (Archivo heading) |
| Admin tenant detail — connection overview | Dynamic | `10` | `14` (Inter) |
| DashboardTopbar — compact indicator (no label) | Dynamic | `8` | N/A (`showLabel=false`) |

**Accessibility:**
- Dot `<span>` has `role="img"` and `aria-label="Status: Connected"` (or relevant status).
- Label text is independent of dot color — screen readers read the label directly.
- Do not rely on color alone to convey status — the label is required by default.

---

### 4.3 Table

**File:** `components/ui/Table.tsx`

**Purpose:** A styled data table component for rendering tabular data with consistent column headers, row hover states, and optional sorting indicators. Used in admin panel for tenant list and audit log.

**Props interface:**

```typescript
interface Column<T> {
  key: string                                // Unique key for the column
  header: string                             // Column header label
  width?: string                             // CSS width (e.g., '20%', '120px')
  align?: 'left' | 'right' | 'center'       // Default: 'left'
  sortable?: boolean                         // Show sort indicator; default false
  render: (row: T, index: number) => React.ReactNode  // Cell renderer
}

interface TableProps<T> {
  columns: Column<T>[]
  rows: T[]
  keyExtractor: (row: T) => string           // Unique key per row (usually row.id)
  onRowClick?: (row: T) => void              // Optional row click handler
  sortKey?: string                           // Currently sorted column key
  sortDirection?: 'asc' | 'desc'            // Sort direction
  onSort?: (key: string) => void             // Called when a sortable header is clicked
  emptyState?: React.ReactNode              // Custom empty state; default: generic empty
  loading?: boolean                          // Shows skeleton rows when true
  rowClassName?: (row: T) => string          // Dynamic row class
  stickyHeader?: boolean                     // Default: false
  caption?: string                           // Accessible table caption
  className?: string
}
```

**Container styles:**

| Property | Value |
|----------|-------|
| Overflow | `overflow-x: auto` (wraps the table to allow horizontal scroll on mobile) |
| Border | `1px solid #E5E7EB` |
| Border-radius | `0px` |
| Background | White |

**Table element styles:**

| Property | Value |
|----------|-------|
| Width | `100%` |
| Border-collapse | `collapse` |
| Table-layout | `auto` |

**Header row (`<thead>`):**

| Property | Value |
|----------|-------|
| Background | `#F9FAFB` |
| Border-bottom | `1px solid #E5E7EB` |
| Position | `sticky top: 0` when `stickyHeader=true` |
| z-index | `10` when sticky |

**Header cell (`<th>`):**

| Property | Value |
|----------|-------|
| Font | Inter, `12px`, weight `500`, `#374151`, uppercase, letter-spacing `0.05em` |
| Padding | `10px 16px` |
| Text-align | Per `column.align` (default left) |
| White-space | `nowrap` |
| User-select | `none` |
| Cursor | `pointer` when `column.sortable = true`, else `default` |

**Sort indicator (when `column.sortable = true`):**

| State | Icon | Color |
|-------|------|-------|
| Not currently sorted | ChevronUpDown icon, 14px | `#9CA3AF` (gray-400) |
| Sorted ascending | ChevronUp icon, 14px | Navy (`#0C1F40`) |
| Sorted descending | ChevronDown icon, 14px | Navy (`#0C1F40`) |

Icon appears inline after header text, `gap: 4px`, vertically centered.

**Data row (`<tr>`):**

| State | Background | Transition |
|-------|-----------|-----------|
| Default | Transparent (inherits White from table) | — |
| Hover | `#F9FAFB` | `background 0.1s ease` |
| Focus-visible (when `onRowClick` is set) | `outline: 2px solid #B4E7DD` | — |
| Active click | `#F3F4F6` | `background 0.05s ease` |

When `onRowClick` is provided: row has `role="button"`, `tabIndex={0}`, and handles both `onClick` and `onKeyDown` (Enter/Space).

**Data cell (`<td>`):**

| Property | Value |
|----------|-------|
| Font | Inter, `14px`, weight `400`, Navy (`#0C1F40`) |
| Padding | `12px 16px` |
| Text-align | Per `column.align` |
| Border-bottom | `1px solid #F3F4F6` |
| Vertical-align | `middle` |

Last row has no border-bottom (`:last-child td { border-bottom: none }`).

**Empty state (no rows):**

When `rows.length === 0` and `loading` is false, a single full-width `<tr>` with a centered empty state:

| Property | Value |
|----------|-------|
| Padding | `48px 24px` |
| Icon | TableIcon or SearchX, 32px, Navy at 20% |
| Title | "No results" — Inter, 14px, weight 500, Navy |
| Default body | "No data to display." — Inter, 13px, Navy at 55% |

Custom `emptyState` prop replaces this default.

**Loading state (skeleton rows):**

When `loading = true`, renders 5 skeleton rows. Each skeleton row has:

```
<tr>
  [per column] <td><Skeleton width="80%" height="14px" /></td>
</tr>
```

Skeleton uses the same `SkeletonLoader` shimmer animation (see feedback components section 3.7).

**Implementation:**

```tsx
// components/ui/Table.tsx
export function Table<T>({
  columns,
  rows,
  keyExtractor,
  onRowClick,
  sortKey,
  sortDirection,
  onSort,
  emptyState,
  loading = false,
  rowClassName,
  stickyHeader = false,
  caption,
  className,
}: TableProps<T>) {
  return (
    <div className={cn('overflow-x-auto border border-[#E5E7EB]', className)}>
      <table className="w-full border-collapse" role="table">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead className={cn('bg-[#F9FAFB]', stickyHeader && 'sticky top-0 z-10')}>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{ width: col.width, textAlign: col.align ?? 'left' }}
                className={cn(
                  'px-[16px] py-[10px] text-[12px] font-medium text-[#374151] uppercase tracking-[0.05em] whitespace-nowrap select-none',
                  col.sortable && 'cursor-pointer'
                )}
                onClick={() => col.sortable && onSort?.(col.key)}
                aria-sort={
                  sortKey === col.key
                    ? sortDirection === 'asc' ? 'ascending' : 'descending'
                    : col.sortable ? 'none' : undefined
                }
              >
                <span className="inline-flex items-center gap-[4px]">
                  {col.header}
                  {col.sortable && (
                    sortKey === col.key
                      ? sortDirection === 'asc' ? <ChevronUpIcon size={14} /> : <ChevronDownIcon size={14} />
                      : <ChevronUpDownIcon size={14} className="text-[#9CA3AF]" />
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {columns.map((col) => (
                    <td key={col.key} className="px-[16px] py-[12px] border-b border-[#F3F4F6]">
                      <Skeleton width="80%" height="14px" />
                    </td>
                  ))}
                </tr>
              ))
            : rows.length === 0
            ? (
                <tr>
                  <td colSpan={columns.length} className="px-[24px] py-[48px] text-center">
                    {emptyState ?? <DefaultTableEmptyState />}
                  </td>
                </tr>
              )
            : rows.map((row, index) => (
                <tr
                  key={keyExtractor(row)}
                  className={cn(
                    'transition-colors duration-100 hover:bg-[#F9FAFB] last:border-b-0',
                    onRowClick && 'cursor-pointer focus-visible:outline-2 focus-visible:outline-[#B4E7DD]',
                    rowClassName?.(row)
                  )}
                  onClick={() => onRowClick?.(row)}
                  onKeyDown={(e) => {
                    if (onRowClick && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault()
                      onRowClick(row)
                    }
                  }}
                  tabIndex={onRowClick ? 0 : undefined}
                  role={onRowClick ? 'button' : undefined}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      style={{ textAlign: col.align ?? 'left' }}
                      className="px-[16px] py-[12px] text-[14px] text-[#0C1F40] border-b border-[#F3F4F6] align-middle"
                    >
                      {col.render(row, index)}
                    </td>
                  ))}
                </tr>
              ))
          }
        </tbody>
      </table>
    </div>
  )
}
```

**Where used:**

| Page | Table purpose | Columns |
|------|--------------|---------|
| `/admin/tenants` | Tenant list | Tenant name+email, Plan badge, Status badge, Discord info, Created, Actions |
| `/admin/audit-log` | Admin audit log | Timestamp, Admin email, Action type, Target tenant, Details |
| `/admin/tenants/[id]` (detail) | Tenant service connections list | Service, Auth type, Status, Connected at, Account |

---

### 4.4 Pagination

**File:** `components/ui/Pagination.tsx`

**Purpose:** Page navigation control for paginated tables. Uses URL-based pagination (page number in URL param `?page=N`) so the current page survives page refresh and can be shared via link.

**Props interface:**

```typescript
interface PaginationProps {
  currentPage: number          // 1-indexed current page
  totalPages: number           // Total number of pages
  totalItems: number           // Total item count (for "{X}–{Y} of {Z}" display)
  itemsPerPage: number         // Items per page (for range display)
  onPageChange: (page: number) => void  // Called when user navigates pages
  className?: string
}
```

**Layout:**

```
[Showing 1–50 of 1,247 tenants]          [← Prev]  [1] [2] [3] ... [25]  [Next →]
```

Left side: item range text.
Right side: page button row.

**Item range text:**

| Property | Value |
|----------|-------|
| Font | Inter, `14px`, weight `400`, `#6B7280` (gray-500) |
| Text | `"Showing {start}–{end} of {totalItems.toLocaleString()} {entity}"` |
| Range calc | `start = (currentPage - 1) * itemsPerPage + 1`; `end = Math.min(currentPage * itemsPerPage, totalItems)` |
| Entity label | Not in props — the containing page provides context via `aria-label` on the `<nav>` |

**Page button row:**

| Element | Description |
|---------|-------------|
| "← Prev" button | Disabled on page 1. On click: `onPageChange(currentPage - 1)` |
| Page number buttons | Show: current page ± 2, always show first and last page, `...` ellipsis where gaps exist |
| "Next →" button | Disabled on last page. On click: `onPageChange(currentPage + 1)` |

**Page number display algorithm:**

For `totalPages = 25`, `currentPage = 12`:
```
[1] ... [10] [11] [12] [13] [14] ... [25]
```

For `totalPages = 6`, `currentPage = 3`:
```
[1] [2] [3] [4] [5] [6]
```
(No ellipsis when all pages fit within the ±2 window.)

**Button styles:**

| State | Background | Text | Border |
|-------|-----------|------|--------|
| Default page number | Transparent | `#374151` | `1px solid #E5E7EB` |
| Current page | `#0C1F40` (Navy) | White | None |
| Hover (non-current) | `#F9FAFB` | Navy | `1px solid #D1D5DB` |
| Disabled (Prev on page 1, Next on last page) | Transparent | `#D1D5DB` | `1px solid #E5E7EB` |
| Ellipsis `...` | Transparent | `#9CA3AF` | None — not a button |
| Focus-visible | `outline: 2px solid #B4E7DD`, `outline-offset: 2px` | — | — |

**Button dimensions:**

| Property | Value |
|----------|-------|
| Height | `36px` |
| Min-width | `36px` (square for numbers, wider for Prev/Next) |
| Prev/Next width | `auto` (text + arrow icon with `gap: 6px`) |
| Padding | `0 10px` |
| Font | Inter, `14px`, weight `500` |
| Border-radius | `0px` |
| Transition | `background 0.1s ease, border-color 0.1s ease` |

**Prev/Next button content:**

| Button | Content |
|--------|---------|
| Prev | `<ChevronLeftIcon size={16} />` + "Previous" — or just `←` on mobile (`< 480px`) |
| Next | "Next" + `<ChevronRightIcon size={16} />` — or just `→` on mobile |

**Container layout:**

```
display: flex
justify-content: space-between
align-items: center
margin-top: 24px
padding: 0 (flush with table)
```

On mobile (`< 640px`): item range text hidden, only Prev/Next + current page shown:
```
[← Prev]   Page 3 of 25   [Next →]
```

**URL param integration:**

The page component using `Pagination` reads `searchParams.page` (server-side in Next.js App Router), defaults to `1`. When `onPageChange` is called, the handler calls `router.push` with the updated URL:

```typescript
// Pattern in admin/tenants/page.tsx
function handlePageChange(page: number) {
  const params = new URLSearchParams(searchParams)
  params.set('page', page.toString())
  router.push(`/admin/tenants?${params.toString()}`)
}
```

**Accessibility:**

| Property | Value |
|----------|-------|
| `<nav>` element | Wraps the entire pagination, `aria-label="Pagination"` |
| Current page button | `aria-current="page"` |
| Disabled buttons | `disabled` attribute + `aria-disabled="true"` |
| Prev button | `aria-label="Go to previous page"` |
| Next button | `aria-label="Go to next page"` |
| Page number buttons | `aria-label="Go to page {N}"` |

**Where used:**

| Page | `totalItems` source | `itemsPerPage` |
|------|-------------------|----------------|
| `/admin/tenants` | `SELECT COUNT(*) FROM tenants` (with filters) | `50` |
| `/admin/audit-log` | `SELECT COUNT(*) FROM admin_audit_log` | `100` |

---

### 4.5 StatCard

**File:** `components/ui/StatCard.tsx`

**Purpose:** A metric display card showing a single KPI — a large numeric value with a label, optional sub-label, and optional icon. Used in Dashboard Quick Stats Row and Admin panel summary statistics bar.

**Props interface:**

```typescript
interface StatCardProps {
  label: string                     // Primary label above value
  value: string | number            // The metric value (e.g., "47", "3d 14h", "—")
  subValue?: string                 // Secondary line below value (e.g., "in the last 24 hours")
  icon?: React.ComponentType<{ size?: number; className?: string }>  // Lucide icon component
  accentStripe?: boolean            // Left Aqua accent stripe; default true
  variant?: 'default' | 'compact'  // 'default' = dashboard; 'compact' = admin summary bar
  loading?: boolean                 // Show skeleton when true
  className?: string
}
```

**`default` variant (Dashboard Quick Stats Row):**

| Property | Value |
|----------|-------|
| Background | White (`#FFFFFF`) |
| Border | `1.5px solid rgba(12,31,64,0.12)` |
| Border-radius | `0px` |
| Padding | `20px 24px` |
| Left accent stripe | `3px solid rgba(180,231,221,0.6)` (60% Aqua — PyMC CI accent band 3) when `accentStripe=true` |

Icon (when provided):
| Property | Value |
|----------|-------|
| Size | `20px` |
| Color | Navy at 45% (`rgba(12,31,64,0.45)`) |
| Position | Flex row, left of label |
| Gap | `8px` |
| Container | Flex row, `justify-content: space-between`, top of card |

Label:
| Property | Value |
|----------|-------|
| Font | Inter, `12px`, weight `500`, Navy at 55%, uppercase, letter-spacing `0.06em` |
| Margin-bottom | `8px` |

Value:
| Property | Value |
|----------|-------|
| Font | Archivo Expanded (wdth: 125), `32px`, weight `700`, Navy |
| Line-height | `1.1` |
| Display | Block |

Sub-value:
| Property | Value |
|----------|-------|
| Font | Inter, `12px`, weight `400`, Navy at 45% |
| Margin-top | `4px` |

**`compact` variant (Admin Summary Bar):**

| Property | Value |
|----------|-------|
| Background | White |
| Border | `1px solid #E5E7EB` |
| Padding | `16px 20px` |
| Border-radius | `0px` |
| Left accent stripe | None |

Value font:
| Property | Value |
|----------|-------|
| Font | Archivo Semi-Expanded (wdth: 112.5), `28px`, weight `600`, Navy |

Label font:
| Property | Value |
|----------|-------|
| Font | Inter, `12px`, weight `400`, `#6B7280` |

Sub-value font:
| Property | Value |
|----------|-------|
| Font | Inter, `11px`, weight `400`, `#9CA3AF` |

**Loading state:**

When `loading = true`, content area shows:

| Element | Skeleton dimensions |
|---------|-------------------|
| Icon area | `Skeleton(20px × 20px)` |
| Label | `Skeleton(80px × 12px)` |
| Value | `Skeleton(60px × 32px)` |
| Sub-value | `Skeleton(100px × 11px)` |

**Internal layout structure:**

```
StatCard (div)
├── TopRow (flex, justify-between, align-center, mb-2)
│   ├── Label text + icon (flex, align-center, gap-2)
│   └── [optional trailing icon slot]
└── BottomSection
    ├── Value (block, large Archivo)
    └── SubValue (block, small Inter)
```

**Implementation:**

```tsx
// components/ui/StatCard.tsx
export function StatCard({
  label,
  value,
  subValue,
  icon: Icon,
  accentStripe = true,
  variant = 'default',
  loading = false,
  className,
}: StatCardProps) {
  const isDefault = variant === 'default'

  return (
    <div
      className={cn(
        isDefault
          ? 'bg-white border-[1.5px] border-[rgba(12,31,64,0.12)] p-[20px_24px]'
          : 'bg-white border border-[#E5E7EB] p-[16px_20px]',
        accentStripe && isDefault && 'border-l-[3px] border-l-[rgba(180,231,221,0.6)]',
        className
      )}
    >
      {loading ? (
        <StatCardSkeleton variant={variant} />
      ) : (
        <>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {Icon && (
                <Icon size={20} className="text-[rgba(12,31,64,0.45)] flex-shrink-0" />
              )}
              <span
                className={cn(
                  'uppercase tracking-[0.06em]',
                  isDefault
                    ? 'text-[12px] font-medium text-[rgba(12,31,64,0.55)]'
                    : 'text-[12px] font-normal text-[#6B7280]'
                )}
              >
                {label}
              </span>
            </div>
          </div>
          <span
            className={cn(
              'block',
              isDefault
                ? 'font-archivo font-bold text-[32px] leading-[1.1] text-[#0C1F40]'
                : 'font-archivo font-semibold text-[28px] leading-[1.1] text-[#0C1F40]'
            )}
            style={{ fontVariationSettings: isDefault ? '"wdth" 125' : '"wdth" 112.5' }}
          >
            {value === null || value === undefined ? '—' : value}
          </span>
          {subValue && (
            <span
              className={cn(
                'block mt-1',
                isDefault ? 'text-[12px] text-[rgba(12,31,64,0.45)]' : 'text-[11px] text-[#9CA3AF]'
              )}
            >
              {subValue}
            </span>
          )}
        </>
      )}
    </div>
  )
}
```

**Where used:**

| Location | Count | Variant | Labels |
|----------|-------|---------|--------|
| Dashboard `/dashboard` Quick Stats Row | 3 | `default` | "Messages Today", "Tool Uses Today", "Uptime" |
| Admin `/admin/tenants` Summary Bar | 4 | `compact` | "Total Tenants", "Active Bots", "Starter + Pro", "Suspended" |

**Peach Orange restriction:** `#F6AE72` (Peach Orange) is NOT used in `StatCard` backgrounds, borders, or text — it is reserved exclusively for data visualizations (charts/graphs). See brand guidelines.

---

### 4.6 ActivityFeed

**File:** `components/ui/ActivityFeed.tsx`

**Purpose:** A chronological list of system events displayed in a card. Used on the Dashboard home page to show recent bot activity (connections, key validations, service connections, billing events).

**Props interface:**

```typescript
type ActivityEventType =
  | 'bot_connected'
  | 'bot_disconnected'
  | 'bot_error'
  | 'api_key_added'
  | 'api_key_invalid'
  | 'service_connected'
  | 'service_expired'
  | 'plan_upgraded'
  | 'plan_downgraded'
  | 'account_created'

interface ActivityEvent {
  id: string
  type: ActivityEventType
  timestamp: string          // ISO 8601 timestamp
  description: string        // Human-readable event text (pre-formatted by server)
  metadata?: {
    serviceName?: string     // For service_connected / service_expired
    planName?: string        // For plan_upgraded / plan_downgraded
    errorMessage?: string    // For bot_error / api_key_invalid
  }
}

interface ActivityFeedProps {
  events: ActivityEvent[]
  maxItems?: number          // Default: 10 — truncates list to this many events
  showHeader?: boolean       // Default: true
  loading?: boolean
  className?: string
}
```

**Container:**

| Property | Value |
|----------|-------|
| Background | White (`#FFFFFF`) |
| Border | `1.5px solid rgba(12,31,64,0.12)` |
| Border-radius | `0px` |
| Padding | `24px 28px` |

**Header (when `showHeader = true`):**

```
[Activity/Clock icon 16px Navy@45%]  "Recent Activity"   [spacer]
```

| Property | Value |
|----------|-------|
| Icon | ClockIcon (16px, Navy at 45%) |
| Title | "Recent Activity" |
| Title font | Inter, `14px`, weight `600`, Navy |
| Layout | `flex items-center gap-2 mb-5` |
| Divider | `border-b border-[rgba(12,31,64,0.06)] pb-4 mb-0` below header |

**Event row layout:**

```
[EventIcon]  [EventText]           [Timestamp]
```

| Property | Value |
|----------|-------|
| Row layout | `flex items-start gap-3` |
| Row padding | `12px 0` |
| Row border-bottom | `1px solid rgba(12,31,64,0.04)` (on all except last) |

**EventIcon container:**

| Property | Value |
|----------|-------|
| Size | `32px × 32px` |
| Flex-shrink | `0` |
| Display | `flex items-center justify-content-center` |
| Background | Per event type (see below) |
| Icon | Lucide icon, `16px`, per event type |

**Event type configurations:**

| Type | Icon | Icon bg | Description template |
|------|------|---------|---------------------|
| `bot_connected` | `ZapIcon` | `rgba(34,197,94,0.12)` | "Bot connected to Discord server" |
| `bot_disconnected` | `ZapOffIcon` | `rgba(239,68,68,0.12)` | "Bot disconnected from Discord" |
| `bot_error` | `AlertTriangleIcon` | `rgba(239,68,68,0.12)` | "Bot encountered a connection error" |
| `api_key_added` | `KeyIcon` | `rgba(180,231,221,0.30)` | "Anthropic API key added and validated" |
| `api_key_invalid` | `KeyRoundIcon` | `rgba(239,68,68,0.12)` | "Anthropic API key validation failed" |
| `service_connected` | `PlugIcon` | `rgba(180,231,221,0.30)` | "{metadata.serviceName} connected" |
| `service_expired` | `PlugZapIcon` | `rgba(245,158,11,0.12)` | "{metadata.serviceName} token expired — reconnect required" |
| `plan_upgraded` | `CreditCardIcon` | `rgba(180,231,221,0.30)` | "Plan upgraded to {metadata.planName}" |
| `plan_downgraded` | `CreditCardIcon` | `rgba(245,158,11,0.12)` | "Plan changed to {metadata.planName}" |
| `account_created` | `UserIcon` | `rgba(159,170,226,0.30)` | "Account created" |

**EventText column:**

| Property | Value |
|----------|-------|
| Font | Inter, `14px`, weight `400`, Navy |
| Line-height | `1.5` |
| Flex | `1` (takes remaining width) |

**Timestamp column:**

| Property | Value |
|----------|-------|
| Font | Inter, `12px`, weight `400`, Navy at 45% |
| White-space | `nowrap` |
| Align-self | `flex-start` |
| Title attribute | Full ISO timestamp for hover tooltip (e.g., `"2026-03-13T14:32:05Z"`) |

**Relative timestamp format:** Uses a standard relative time formatter:

| Age | Display format |
|-----|---------------|
| < 60 seconds | "just now" |
| 1–59 minutes | "{N}m ago" |
| 1–23 hours | "{N}h ago" |
| 1–6 days | "{N}d ago" |
| ≥ 7 days | "MMM D" (e.g., "Mar 6") |

Timestamps refresh every 60 seconds client-side via `setInterval` (to keep relative times accurate while the user keeps the page open).

**Empty state (no events):**

```
ActivityFeed (empty)
├── EmptyState component
│   ├── Icon: ActivityIcon (40px, Navy at 20%)
│   ├── Title: "No activity yet"
│   └── Body: "Activity will appear here once your bot is connected and running."
```

**Loading state (skeleton):**

When `loading = true`:
```
ActivityFeed (loading)
├── Header skeleton: Skeleton(140px × 16px)
└── [×5] EventRowSkeleton
    ├── Skeleton(32px × 32px) ← icon area
    └── ContentGroup (flex col, gap-1)
        ├── Skeleton(70% × 14px)
        └── Skeleton(40% × 12px)
```

**Implementation:**

```tsx
// components/ui/ActivityFeed.tsx
export function ActivityFeed({
  events,
  maxItems = 10,
  showHeader = true,
  loading = false,
  className,
}: ActivityFeedProps) {
  const displayEvents = events.slice(0, maxItems)

  if (loading) return <ActivityFeedSkeleton />

  return (
    <div className={cn('bg-white border-[1.5px] border-[rgba(12,31,64,0.12)] p-[24px_28px]', className)}>
      {showHeader && (
        <div className="flex items-center gap-2 border-b border-[rgba(12,31,64,0.06)] pb-4 mb-0">
          <ClockIcon size={16} className="text-[rgba(12,31,64,0.45)]" />
          <span className="text-[14px] font-semibold text-[#0C1F40]">Recent Activity</span>
        </div>
      )}
      {displayEvents.length === 0 ? (
        <EmptyState
          icon={ActivityIcon}
          title="No activity yet"
          body="Activity will appear here once your bot is connected and running."
        />
      ) : (
        <ul className="divide-y divide-[rgba(12,31,64,0.04)]" role="list" aria-label="Recent activity feed">
          {displayEvents.map((event) => {
            const config = EVENT_CONFIGS[event.type]
            return (
              <li key={event.id} className="flex items-start gap-3 py-3">
                <div
                  className="flex-shrink-0 w-8 h-8 flex items-center justify-center"
                  style={{ background: config.iconBg }}
                  aria-hidden="true"
                >
                  <config.Icon size={16} />
                </div>
                <span className="flex-1 text-[14px] text-[#0C1F40] leading-[1.5]">
                  {event.description}
                </span>
                <time
                  className="flex-shrink-0 text-[12px] text-[rgba(12,31,64,0.45)] self-start whitespace-nowrap"
                  dateTime={event.timestamp}
                  title={event.timestamp}
                >
                  {formatRelativeTime(event.timestamp)}
                </time>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
```

**Real-time updates:** The Dashboard page subscribes to Supabase Realtime on relevant tables. When a new event arrives, the `events` array is updated client-side by prepending the new event and trimming to `maxItems`. No full page reload.

**Where used:**

| Location | `maxItems` | Source tables |
|----------|-----------|--------------|
| Dashboard home — Section 6 | `10` | `discord_connections`, `tenant_service_connections`, `tenant_api_keys`, `tenant_subscriptions` |

---

### 4.7 CopyToClipboard

**File:** `components/ui/CopyToClipboard.tsx`

**Purpose:** An inline copy button that copies text to the clipboard. Shows a success checkmark for 2 seconds after copying, then resets. Used wherever a user needs to copy a key, ID, token, or URL — without seeing the raw value if it's sensitive.

**Props interface:**

```typescript
interface CopyToClipboardProps {
  value: string                    // The text to copy to clipboard
  displayValue?: string            // What to show in the UI (default: `value`)
  masked?: boolean                 // If true, display as ••••••• with toggleable reveal; default false
  size?: 'sm' | 'md'             // Default: 'md'
  variant?: 'inline' | 'block'    // 'inline' = icon only; 'block' = value display + copy button
  label?: string                  // ARIA label (default: "Copy to clipboard")
  className?: string
}
```

**`block` variant (value display + copy button):**

Used in Billing page API key management, Settings page, and documentation pages.

```
┌─────────────────────────────────────────────────────┐
│  sk-ant-api03-••••••••••••••••    [Copy] [👁 Show]  │
└─────────────────────────────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Container | `flex items-center gap-2` |
| Value display | `flex-1`, `font-mono`, `14px`, Navy, truncated with `overflow: hidden; text-overflow: ellipsis; white-space: nowrap` |
| Container background | `#F9FAFB` |
| Container border | `1px solid #E5E7EB` |
| Container padding | `8px 12px` |
| Container border-radius | `0px` |

When `masked = true`:
- `displayValue` shown as `••••••••••••••••••••` (20 bullets) regardless of actual length.
- A "Show" toggle button appears to the right of the copy button.
- Clicking "Show" reveals the actual `displayValue` and changes button to "Hide".
- The clipboard always copies the real `value` (not the masked display).

**Show/Hide toggle button:**

| State | Icon | Tooltip |
|-------|------|---------|
| Masked (default) | `EyeIcon` (16px) | "Reveal" |
| Revealed | `EyeOffIcon` (16px) | "Hide" |

| Property | Value |
|----------|-------|
| Height | `28px` (sm) / `32px` (md) |
| Width | `28px` / `32px` |
| Background | Transparent |
| Border | None |
| Icon color | Navy at 45%, hover: Navy at 75% |
| Transition | `color 0.15s ease` |

**Copy button (inside `block` variant):**

| State | Icon | Background | Border | Tooltip |
|-------|------|-----------|--------|---------|
| Default | `CopyIcon` (14px) | Transparent | None | "Copy to clipboard" |
| Hover | `CopyIcon` (14px) | `rgba(12,31,64,0.06)` | None | "Copy to clipboard" |
| Success (2s window) | `CheckIcon` (14px) | `rgba(34,197,94,0.12)` | None | "Copied!" |
| Error | `XIcon` (14px) | `rgba(239,68,68,0.12)` | None | "Failed to copy" |

Button dimensions:
| Property | Value |
|----------|-------|
| Height | `28px` (sm) / `32px` (md) |
| Width | `28px` / `32px` |
| Border-radius | `0px` |
| Transition | `background 0.1s ease` |

**`inline` variant (icon-only button):**

Used inline next to IDs, short values, URLs in docs pages and admin panel.

```
guild ID: 123456789012345678  [□]
```

Only the copy icon button — no separate value display box.

| Property | Value |
|----------|-------|
| Icon | `CopyIcon` (14px for sm, 16px for md) |
| Display | Inline-flex |
| Height | `24px` (sm) / `28px` (md) |
| Width | `24px` / `28px` |
| Padding | `4px` |
| Background | Transparent |
| Border | None |
| Border-radius | `0px` |

Success state: Icon switches to `CheckIcon` (same size), background `rgba(34,197,94,0.12)` for 2 seconds, then resets.

**Clipboard API implementation:**

```typescript
async function handleCopy() {
  try {
    await navigator.clipboard.writeText(value)
    setCopyState('success')
  } catch (err) {
    // Fallback for older browsers / HTTP contexts
    const textArea = document.createElement('textarea')
    textArea.value = value
    textArea.style.cssText = 'position:fixed;top:-9999px;left:-9999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    try {
      document.execCommand('copy')
      setCopyState('success')
    } catch {
      setCopyState('error')
    }
    document.body.removeChild(textArea)
  }
  setTimeout(() => setCopyState('default'), 2000)
}
```

**Toast notification:** When copy succeeds, a toast notification is shown: `"Copied to clipboard"` (duration: 2000ms, variant: `success`). This is separate from the in-button success icon — both fire simultaneously.

**Accessibility:**

| Property | Value |
|----------|-------|
| Copy button `aria-label` | Default: "Copy to clipboard"; Success: "Copied!"; Error: "Failed to copy" |
| Copy button `aria-live` | `"polite"` — so screen readers announce state changes |
| Show/Hide button `aria-label` | "Reveal API key" / "Hide API key" |
| Show/Hide button `aria-pressed` | `true` when revealed, `false` when masked |
| Value display | `aria-label="API key value: [masked or revealed]"` |

**Where used:**

| Location | Variant | `masked` | `value` source |
|----------|---------|---------|---------------|
| Billing page — Anthropic key display | `block` | `true` | `tenant_api_keys.encrypted_key` (decrypted server-side) |
| Billing page — OpenAI key display | `block` | `true` | Same |
| Admin panel — tenant detail, bot token | `block` | `true` | `discord_connections.bot_token` |
| Settings page — Discord guild ID | `inline` | `false` | `discord_connections.guild_id` |
| Docs pages — example values, IDs | `inline` | `false` | Hardcoded doc content |

---

### Summary Table — Data Display Components

| Component | File | Primary Usage |
|-----------|------|---------------|
| `Badge` | `components/ui/Badge.tsx` | Plan labels, status indicators, key status, connection state |
| `StatusIndicator` | `components/ui/StatusIndicator.tsx` | Bot connection status dot + label in Bot Status Card |
| `Table` | `components/ui/Table.tsx` | Admin tenant list, admin audit log, admin tenant detail connections |
| `Pagination` | `components/ui/Pagination.tsx` | Admin tenant list paging, audit log paging |
| `StatCard` | `components/ui/StatCard.tsx` | Dashboard Quick Stats Row, admin summary statistics bar |
| `ActivityFeed` | `components/ui/ActivityFeed.tsx` | Dashboard recent activity section |
| `CopyToClipboard` | `components/ui/CopyToClipboard.tsx` | API key display, guild ID copy, doc code examples |

*Next section: Action Components — aspect 4.9e*

---

## 5. Action Components

Action components are interactive elements that trigger user actions, navigate between views, or surface contextual options. All action components follow PyMC brand rules: **zero border-radius**, Inter font, Aqua primary, and strict no-Peach-Orange enforcement.

---

### 5.1 Button

**File:** `components/ui/Button.tsx`

**Purpose:** The primary interactive element across the entire application. Used for form submissions, triggering Stripe Checkout, confirming dialogs, saving settings, and all other primary/secondary/ghost call-to-action patterns.

**Props interface:**

```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'danger-secondary'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean            // Shows spinner + disables interaction
  disabled?: boolean             // Disabled state
  leftIcon?: React.ReactNode     // Icon rendered left of label (16px for sm, 20px for md/lg)
  rightIcon?: React.ReactNode    // Icon rendered right of label
  fullWidth?: boolean            // width: 100%
  type?: 'button' | 'submit' | 'reset'  // Default: 'button'
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  children: React.ReactNode
  className?: string
  'aria-label'?: string          // Required when button has no text (icon-only use via Button with no children)
  form?: string                  // Associate with a specific form by id
}
```

**Size specifications:**

| Size | Height | Padding (H) | Font Size | Font Weight | Icon Size | Gap (icon+label) |
|------|--------|-------------|-----------|-------------|-----------|------------------|
| `sm` | `32px` | `12px` | `13px` | `600` | `14px` | `6px` |
| `md` | `44px` | `28px` | `15px` | `600` | `16px` | `8px` |
| `lg` | `52px` | `36px` | `17px` | `600` | `20px` | `10px` |

Default size: `md`.

**Variant specifications — light background context:**

| Variant | Background | Text Color | Border | Hover Background | Hover Text | Hover Border |
|---------|-----------|------------|--------|-----------------|------------|--------------|
| `primary` | Aqua (`#B4E7DD`) | Navy (`#0C1F40`) | `1.5px solid #B4E7DD` | `rgba(180,231,221,0.85)` | Navy | Same |
| `secondary` | Transparent | Navy (`#0C1F40`) | `1.5px solid #0C1F40` | Navy (`#0C1F40`) | White (`#FFFFFF`) | `1.5px solid #0C1F40` |
| `ghost` | Transparent | Navy (`#0C1F40`) | None | `rgba(12,31,64,0.06)` | Navy | None |
| `danger` | `#EF4444` | White (`#FFFFFF`) | `1.5px solid #EF4444` | `#DC2626` | White | `1.5px solid #DC2626` |
| `danger-secondary` | Transparent | `#EF4444` | `1.5px solid #EF4444` | `#EF4444` | White | `1.5px solid #EF4444` |

**Variant specifications — dark background context (Sidebar, dark banners):**

When rendered inside a dark background (Navy `#0C1F40`) container, use these overrides:

| Variant | Background | Text Color | Border | Hover Background | Hover Text |
|---------|-----------|------------|--------|-----------------|------------|
| `primary` | Aqua (`#B4E7DD`) | Navy (`#0C1F40`) | — | `rgba(180,231,221,0.85)` | Navy |
| `secondary` | Transparent | White (`#FFFFFF`) | `1.5px solid #FFFFFF` | White (`#FFFFFF`) | Navy (`#0C1F40`) |
| `ghost` | Transparent | White (`#FFFFFF`) | None | `rgba(255,255,255,0.08)` | White |

Note: The dark-context variants are applied automatically when the `Button` is wrapped inside a component with `data-theme="dark"` attribute, or via a `darkContext` prop. The default is light context.

**All states:**

| State | Description |
|-------|-------------|
| Default | As specified in variant table above |
| Hover | Background/border transition per variant; transition: `all 0.2s ease` |
| Focus-visible | `outline: 2px solid #B4E7DD; outline-offset: 2px` (all variants) |
| Active (mousedown) | Additional opacity 0.90 layer — `filter: brightness(0.93)` |
| Disabled | `opacity: 0.45`; `cursor: not-allowed`; `pointer-events: none` |
| Loading | Spinner replaces or prepends icon; button disabled; text remains visible |

**Loading state implementation:**

When `isLoading = true`:
- A `LoadingSpinner` (16px, matches text color) appears to the left of the label text, replacing `leftIcon` if present.
- Button is `disabled` and `aria-disabled="true"`.
- Button `aria-label` changes to `"Loading…"` if no explicit `aria-label` given.
- Width does NOT change — the button maintains its pre-loading dimensions to prevent layout shift.

```typescript
// LoadingSpinner sub-component — rendered inside Button when isLoading
function LoadingSpinner({ size = 16, color = 'currentColor' }) {
  return (
    <svg
      className="animate-spin"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="3" strokeOpacity="0.25" />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}
```

**Border-radius:** `0px` — STRICTLY zero. No rounding under any circumstance. This is a core PyMC brand rule.

**Transition:** `all 0.2s ease` on background, color, border-color, opacity.

**Font:** Inter, size per size table, weight per size table. No text-transform (no uppercase/lowercase enforcement — use natural case in label).

**Full-width behavior:** When `fullWidth = true`, `width: 100%` and `display: block` (defaults to `display: inline-flex`).

**Tailwind class composition (illustrative, not exhaustive):**

```typescript
const base = [
  'inline-flex items-center justify-center',
  'font-inter font-semibold',
  'border transition-all duration-200 ease-in-out',
  'rounded-none',               // PyMC: zero border-radius
  'disabled:opacity-45 disabled:cursor-not-allowed',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B4E7DD] focus-visible:ring-offset-2',
].join(' ')

const sizeMap = {
  sm: 'h-8 px-3 text-[13px] gap-1.5',
  md: 'h-11 px-7 text-[15px] gap-2',
  lg: 'h-[52px] px-9 text-[17px] gap-2.5',
}

const variantMap = {
  primary: 'bg-[#B4E7DD] text-[#0C1F40] border-[#B4E7DD] hover:bg-[#B4E7DD]/85',
  secondary: 'bg-transparent text-[#0C1F40] border-[#0C1F40] hover:bg-[#0C1F40] hover:text-white',
  ghost: 'bg-transparent text-[#0C1F40] border-transparent hover:bg-[#0C1F40]/6',
  danger: 'bg-red-500 text-white border-red-500 hover:bg-red-600 hover:border-red-600',
  'danger-secondary': 'bg-transparent text-red-500 border-red-500 hover:bg-red-500 hover:text-white',
}
```

**Where used across the application:**

| Location | Variant | Size | Label | Notes |
|----------|---------|------|-------|-------|
| Landing page — hero | `primary` | `lg` | "Get Started Free" | Links to `/signup` |
| Landing page — hero | `secondary` | `lg` | "See How It Works" | Scrolls to #how-it-works |
| Landing page — pricing section | `primary` | `md` | "Start Free" | Links to `/signup` |
| Landing page — pricing section | `secondary` | `md` | "Contact Us" | For enterprise inquiries |
| Auth pages — login form | `primary` | `md` | "Sign In" | `type="submit"`, fullWidth |
| Auth pages — signup form | `primary` | `md` | "Create Account" | `type="submit"`, fullWidth |
| Auth pages — reset password | `primary` | `md` | "Send Reset Link" | `type="submit"`, fullWidth |
| Auth pages — new password | `primary` | `md` | "Set New Password" | `type="submit"`, fullWidth |
| Dashboard — onboarding checklist CTA | `primary` | `sm` | Per step label | One per incomplete step |
| Integrations page — connect service | `primary` | `sm` | "Connect" | Per service card |
| Integrations page — disconnect service | `danger-secondary` | `sm` | "Disconnect" | Per service card |
| Billing page — upgrade plan | `primary` | `md` | "Upgrade to Pro" | Triggers Stripe Checkout |
| Billing page — manage subscription | `secondary` | `md` | "Manage Billing" | Opens Stripe Customer Portal |
| Settings page — save tenant config | `primary` | `md` | "Save Changes" | `type="submit"` |
| Settings page — delete account | `danger` | `md` | "Delete Account" | Opens ConfirmDialog |
| Admin panel — impersonate | `secondary` | `sm` | "Impersonate" | Per tenant row |
| Modal/Dialog — primary action | `primary` | `md` | Context-specific | E.g., "Confirm", "Delete" |
| Modal/Dialog — cancel action | `secondary` | `md` | "Cancel" | Always secondary |
| ConfirmDialog — destructive confirm | `danger` | `md` | Context-specific | E.g., "Delete Account" |

**Accessibility:**

| Attribute | Rule |
|-----------|------|
| `type` | Always explicitly set; default `"button"` prevents accidental form submission |
| `aria-disabled` | Set to `"true"` when `disabled` or `isLoading`; use alongside HTML `disabled` attribute |
| `aria-label` | Required when button contains only an icon (no text children) |
| `aria-busy` | Set to `"true"` when `isLoading = true` |
| Focus ring | `outline: 2px solid #B4E7DD; outline-offset: 2px` — always visible on keyboard focus, never hidden |
| `role` | Implicit `button` via `<button>` element — no explicit role needed |

---

### 5.2 IconButton

**File:** `components/ui/IconButton.tsx`

**Purpose:** A square button containing only an icon — no label text. Used for copy, close, expand/collapse, actions in table rows, and icon-only controls. Distinct from `Button` in that it enforces square dimensions and requires an accessible `aria-label`.

**Props interface:**

```typescript
interface IconButtonProps {
  icon: React.ReactNode          // The icon element (Lucide component, sized to match button)
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  isLoading?: boolean
  disabled?: boolean
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  'aria-label': string           // REQUIRED — no default; must describe the action
  tooltip?: string               // If provided, wraps button in Tooltip component
  type?: 'button' | 'submit'
  className?: string
}
```

Note: `aria-label` is required (non-optional in TypeScript) because an icon with no text provides no accessibility context. If the `aria-label` prop is omitted, TypeScript will produce a type error.

**Size specifications:**

| Size | Width × Height | Icon Size | Border Width |
|------|----------------|-----------|--------------|
| `xs` | `24px × 24px` | `12px` | `1px` |
| `sm` | `32px × 32px` | `16px` | `1.5px` |
| `md` | `40px × 40px` | `20px` | `1.5px` |
| `lg` | `48px × 48px` | `24px` | `1.5px` |

Default size: `sm`.

**Variant specifications (light background):**

| Variant | Background | Icon Color | Border | Hover Background | Hover Icon |
|---------|-----------|------------|--------|-----------------|------------|
| `primary` | Aqua (`#B4E7DD`) | Navy (`#0C1F40`) | `1.5px solid #B4E7DD` | `rgba(180,231,221,0.85)` | Navy |
| `secondary` | Transparent | Navy (`#0C1F40`) | `1.5px solid #0C1F40` | Navy | White |
| `ghost` | Transparent | `rgba(12,31,64,0.55)` | None | `rgba(12,31,64,0.06)` | Navy |
| `danger` | Transparent | `#EF4444` | `1.5px solid #EF4444` | `#EF4444` | White |

**States:**

| State | Description |
|-------|-------------|
| Default | Per variant |
| Hover | Per variant hover specs; transition `all 0.2s ease` |
| Focus-visible | `outline: 2px solid #B4E7DD; outline-offset: 2px` |
| Active | `filter: brightness(0.93)` |
| Disabled | `opacity: 0.45; cursor: not-allowed; pointer-events: none` |
| Loading | Spinner replaces icon; button disabled |

**Border-radius:** `0px` — always zero.

**Tooltip behavior:** When `tooltip` prop is provided, the `IconButton` is wrapped in the `Tooltip` component (see Section 3 Feedback Components — note: `Tooltip` is the hover label component from the Tooltip within the Modal/ConfirmDialog section). The tooltip appears after 500ms hover delay, positioned above the button. This ensures keyboard and pointer users both see the button's purpose.

**Where used:**

| Location | Size | Variant | Icon | `aria-label` |
|----------|------|---------|------|--------------|
| Table row actions — view | `sm` | `ghost` | `EyeIcon` | "View tenant [id]" |
| Table row actions — copy | `sm` | `ghost` | `CopyIcon` | "Copy tenant ID" |
| Modal close button | `sm` | `ghost` | `XIcon` | "Close dialog" |
| Toast close button | `xs` | `ghost` | `XIcon` | "Dismiss notification" |
| Sidebar logout button | `sm` | `ghost` | `LogOutIcon` | "Sign out" |
| Dashboard bot status — refresh | `sm` | `ghost` | `RefreshCwIcon` | "Refresh bot status" |
| Settings — copy guild ID | `sm` | `ghost` | `CopyIcon` | "Copy guild ID" |
| Integrations — service info | `xs` | `ghost` | `InfoIcon` | "Learn about [service]" |
| Admin — tenant impersonate | `sm` | `secondary` | `UserIcon` | "Impersonate [tenant]" |
| Billing — reveal key | `sm` | `ghost` | `EyeIcon` | "Reveal API key" |
| Billing — hide key | `sm` | `ghost` | `EyeOffIcon` | "Hide API key" |
| TopBar — mobile menu toggle | `md` | `ghost` | `MenuIcon` / `XIcon` | "Open menu" / "Close menu" |

**Accessibility:**

| Attribute | Value |
|-----------|-------|
| `aria-label` | Always present (TypeScript enforced) |
| `title` | Same as `aria-label` (secondary tooltip for sighted users without JS) |
| `aria-pressed` | Set to `true/false` for toggle buttons (e.g., Show/Hide key) |
| `aria-busy` | `"true"` when `isLoading` |
| Focus ring | `outline: 2px solid #B4E7DD; outline-offset: 2px` |

---

### 5.3 Link

**File:** `components/ui/Link.tsx`

**Purpose:** A styled anchor component wrapping Next.js `<Link>`. Used for all navigational links within the UI — nav items, inline text links, breadcrumbs, and "forgot password?" type links. Distinct from `Button` in that it navigates rather than triggers an action.

**Props interface:**

```typescript
interface LinkProps {
  href: string
  variant?: 'default' | 'nav' | 'muted' | 'underline' | 'unstyled'
  size?: 'sm' | 'md' | 'lg'   // Controls font size; default: 'md'
  external?: boolean            // Opens in new tab if true; adds rel="noopener noreferrer"
  disabled?: boolean            // Renders as <span> instead of <a>; no navigation
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode   // ExternalLinkIcon auto-injected when external=true
  className?: string
  children: React.ReactNode
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void
}
```

**Variant specifications:**

| Variant | Color | Underline | Hover | Focus |
|---------|-------|-----------|-------|-------|
| `default` | Navy (`#0C1F40`) | None by default | `text-decoration: underline; text-decoration-color: #B4E7DD` | `outline: 2px solid #B4E7DD; outline-offset: 2px` |
| `nav` | Navy (`#0C1F40`), weight `500` | None | Aqua 2px underline (bottom) | Same |
| `muted` | `rgba(12,31,64,0.55)` | None | Navy (`#0C1F40`), underline appears | Same |
| `underline` | Navy (`#0C1F40`) | `text-decoration: underline; text-decoration-color: rgba(180,231,221,0.6)` | `text-decoration-color: #B4E7DD` (stronger) | Same |
| `unstyled` | Inherit | None | Inherit | Same outline |

**Size specifications:**

| Size | Font Size | Line Height |
|------|-----------|-------------|
| `sm` | `13px` | `1.5` |
| `md` | `15px` | `1.5` |
| `lg` | `17px` | `1.5` |

**External link behavior:**

When `external = true`:
- Renders `<a target="_blank" rel="noopener noreferrer">`.
- Appends `ExternalLinkIcon` (12px, `rgba(12,31,64,0.45)`) as `rightIcon` automatically unless `rightIcon` is explicitly provided.
- Does NOT use Next.js `<Link>` (not an internal navigation).

**Disabled behavior:**

When `disabled = true`:
- Renders as `<span>` instead of `<a>` — no `href`, no navigation.
- `opacity: 0.45; cursor: not-allowed`.
- No hover state, no focus ring.
- `aria-disabled="true"`.

**Transition:** `color 0.15s ease, text-decoration-color 0.15s ease`.

**Font:** Inherits from parent by default — no explicit font-family override unless used in isolation (in which case: Inter).

**Where used:**

| Location | Variant | Size | Text | Destination |
|----------|---------|------|------|-------------|
| Auth pages — "Forgot password?" | `muted` | `sm` | "Forgot password?" | `/reset-password` |
| Auth pages — "Already have an account? Sign in" | `default` | `sm` | "Sign in" | `/login` |
| Auth pages — "Don't have an account? Sign up" | `default` | `sm` | "Sign up" | `/signup` |
| Auth pages — ToS + Privacy links | `underline` | `sm` | "Terms of Service", "Privacy Policy" | `/legal/terms`, `/legal/privacy` |
| Landing page — nav links | `nav` | `md` | "Features", "Pricing", "Docs" | Same-page anchors |
| Dashboard — onboarding inline links | `default` | `sm` | Contextual | Various |
| Billing — "View on Stripe" | `default` | `sm` | "View invoice on Stripe" | external: Stripe invoice URL |
| Admin panel — tenant email links | `default` | `sm` | User email | `mailto:` |
| Footer — legal links | `muted` | `sm` | "Terms", "Privacy" | `/legal/terms`, `/legal/privacy` |
| Docs pages — inline cross-references | `underline` | `md` | Anchor text | Internal doc pages |
| Error pages — "Go back home" | `default` | `md` | "Return to Dashboard" | `/dashboard` |

**Accessibility:**

| Attribute | Rule |
|-----------|------|
| `aria-label` | Only needed when link text is ambiguous (e.g., "here" — never write such links) |
| External links | `aria-label` appended with "(opens in new tab)" if using screen reader announcement convention |
| External `rel` | Always `rel="noopener noreferrer"` on `target="_blank"` |
| Disabled | `aria-disabled="true"` on the `<span>` replacement |
| Focus ring | Always visible — never `outline: none` |

---

### 5.4 DropdownMenu

**File:** `components/ui/DropdownMenu.tsx`

**Purpose:** A popover menu triggered by a button click, revealing a list of contextual actions. Used for row-level actions in tables, the user menu (if expanded from TopBar), and any multi-action control that doesn't warrant a full toolbar.

**Props interface:**

```typescript
interface DropdownMenuProps {
  trigger: React.ReactNode       // The element that opens the menu (Button, IconButton, or custom)
  items: DropdownMenuItem[]
  align?: 'start' | 'end' | 'center'  // Menu alignment relative to trigger; default: 'end'
  side?: 'bottom' | 'top' | 'right' | 'left'  // Preferred open direction; default: 'bottom'
  sideOffset?: number            // Gap between trigger and menu panel; default: 4px
  disabled?: boolean             // Prevents menu from opening
  className?: string
}

interface DropdownMenuItem {
  type: 'item' | 'separator' | 'label'
  // 'item' fields:
  label?: string                 // Display text
  icon?: React.ReactNode         // Lucide icon (16px)
  onClick?: () => void
  href?: string                  // If set, renders as Link instead of button
  disabled?: boolean
  variant?: 'default' | 'danger' // 'danger' → red text + icon
  shortcut?: string              // Keyboard shortcut label (display only, e.g. "⌘K")
  // 'separator' — renders a horizontal divider line
  // 'label' fields:
  label?: string                 // Section label text (non-interactive)
}
```

**Menu panel dimensions and styling:**

| Property | Value |
|----------|-------|
| Background | White (`#FFFFFF`) |
| Border | `1px solid rgba(12,31,64,0.10)` |
| Box-shadow | `0 4px 16px rgba(12,31,64,0.12), 0 1px 4px rgba(12,31,64,0.06)` |
| Border-radius | `0px` (PyMC sharp corners) |
| Min-width | `160px` |
| Max-width | `240px` |
| Padding | `4px 0` (top/bottom inside panel) |
| z-index | `200` (above sidebar at 40, modal at 100) |

**Menu item dimensions and styling:**

| Element | Value |
|---------|-------|
| Item height | `36px` (default variant); `32px` (compact with icon only) |
| Item padding | `0 12px` |
| Item display | `flex; align-items: center; gap: 8px` |
| Item font | Inter, `14px`, weight `400`, Navy (`#0C1F40`) |
| Item border-radius | `0px` |
| Icon size | `16px × 16px`, `flex-shrink: 0` |
| Shortcut label | Inter, `12px`, weight `400`, `rgba(12,31,64,0.40)`, `margin-left: auto` |

**Item states:**

| State | Background | Text Color | Transition |
|-------|-----------|------------|------------|
| Default | Transparent | Navy (`#0C1F40`) | — |
| Hover | `rgba(12,31,64,0.05)` | Navy | `background 0.1s ease` |
| Focus (keyboard) | `rgba(180,231,221,0.20)` | Navy | — |
| Pressed | `rgba(12,31,64,0.08)` | Navy | — |
| Disabled | Transparent | `rgba(12,31,64,0.35)` | None |

**Danger variant item:**

| State | Text Color | Icon Color | Background |
|-------|-----------|------------|------------|
| Default | `#EF4444` | `#EF4444` | Transparent |
| Hover | `#DC2626` | `#DC2626` | `rgba(239,68,68,0.06)` |
| Focus | `#DC2626` | `#DC2626` | `rgba(239,68,68,0.10)` |

**Separator:**

| Property | Value |
|----------|-------|
| Height | `1px` |
| Margin | `4px 0` |
| Background | `rgba(12,31,64,0.08)` |

**Section label:**

| Property | Value |
|----------|-------|
| Height | `28px` |
| Padding | `0 12px` |
| Font | Inter, `11px`, weight `600`, `rgba(12,31,64,0.45)`, `text-transform: uppercase; letter-spacing: 0.06em` |
| Cursor | `default` |
| Non-interactive | Does not receive focus or hover |

**Open/Close behavior:**

- Opens on trigger click (toggle on repeated click).
- Closes on: item selection, pressing `Escape`, clicking outside the menu.
- Focus moves to first non-disabled item when menu opens.
- Arrow keys (`↑`, `↓`) navigate between items.
- `Home` / `End` keys jump to first / last item.
- `Enter` or `Space` activates focused item.
- Opening animation: fade-in + slight downward shift (`opacity: 0 → 1`, `translateY: -4px → 0`, `duration: 150ms`, `ease-out`).
- Closing animation: fade-out (`opacity: 1 → 0`, `duration: 100ms`).

**Positioning:**

Uses `@radix-ui/react-dropdown-menu` or equivalent floating-ui positioning. Menu reflows automatically:
- If `side="bottom"` but insufficient space below → flips to `top`.
- If `align="end"` but menu would overflow viewport right edge → shifts left.
- Keeps at least `8px` from any viewport edge.

**Implementation approach:**

```typescript
// Built on @radix-ui/react-dropdown-menu primitives
// Trigger → DropdownMenu.Trigger
// Panel → DropdownMenu.Content
// Item → DropdownMenu.Item
// Separator → DropdownMenu.Separator
// Label → DropdownMenu.Label
```

**Where used across the application:**

| Location | Trigger | Items |
|----------|---------|-------|
| Admin panel — tenant row actions | `IconButton` (`MoreHorizontalIcon`, `sm`, `ghost`) | View Details, Impersonate, Suspend, [separator], Delete |
| Admin panel — audit log filter | `Button` (`secondary`, `sm`) | Filter by action, filter by user, filter by date |
| TopBar — user menu (if implemented) | User avatar / initials | Profile, Settings, [separator], Sign Out |
| Integrations page — service options | `IconButton` (`MoreHorizontalIcon`, `xs`, `ghost`) | Reconnect, View Token Info, Disconnect |
| Table bulk actions | `Button` (`secondary`, `sm`, `rightIcon=ChevronDown`) | Export, Archive, Delete selected |

**Accessibility:**

| Attribute | Value |
|-----------|-------|
| Trigger `aria-haspopup` | `"menu"` |
| Trigger `aria-expanded` | `"true"` when open, `"false"` when closed |
| Trigger `aria-controls` | ID of the menu panel |
| Menu panel `role` | `"menu"` |
| Menu item `role` | `"menuitem"` |
| Disabled item `aria-disabled` | `"true"` |
| Section label `role` | `"group"` with `aria-label` matching label text |
| Focus trap | Focus cycles within menu while open; `Escape` returns focus to trigger |
| Screen reader | Uses Radix UI built-in accessibility — announcements for open/close are automatic |

---

### 5.5 Tabs

**File:** `components/ui/Tabs.tsx`

**Purpose:** A horizontal tab bar for switching between views within a single page section. Used in the Admin panel (tenant detail: Overview / Connections / Audit Log), the Docs pages (code language selector), and potentially the Settings page (General / Danger Zone tabs).

**Props interface:**

```typescript
interface TabsProps {
  tabs: TabItem[]
  activeTab: string              // Value of the currently active tab
  onChange: (value: string) => void
  variant?: 'underline' | 'pills' | 'bordered'
  size?: 'sm' | 'md'
  fullWidth?: boolean            // Tabs stretch to fill container width
  className?: string
}

interface TabItem {
  value: string                  // Unique identifier
  label: string                  // Display text
  icon?: React.ReactNode         // Optional Lucide icon (16px)
  badge?: string | number        // Optional count badge (e.g., "3", "New")
  disabled?: boolean
}
```

**Variant: `underline` (primary variant)**

The standard tab style used in Admin panel and Settings page.

**Tab bar container:**

| Property | Value |
|----------|-------|
| Display | `flex` |
| Border-bottom | `1px solid rgba(12,31,64,0.10)` |
| Gap | `0` (tabs are flush) |
| Overflow-x | `auto` (horizontal scroll on overflow, hide scrollbar) |

**Individual tab (underline variant):**

| Property | Value |
|----------|-------|
| Height | `sm: 36px` / `md: 44px` |
| Padding | `sm: 0 12px` / `md: 0 16px` |
| Font | Inter, `sm: 13px` / `md: 14px`, weight `500` |
| Border-radius | `0px` |
| Background | Transparent |
| Border-bottom (active) | `2px solid #B4E7DD` — overrides the container line |
| Margin-bottom | `-1px` (so active tab border overlaps container border) |
| Gap (icon + label) | `6px` |
| White-space | `nowrap` |

**Tab states — underline variant:**

| State | Text Color | Border-bottom | Background |
|-------|-----------|--------------|------------|
| Default (inactive) | `rgba(12,31,64,0.55)` | None | Transparent |
| Hover (inactive) | Navy (`#0C1F40`) | None | `rgba(12,31,64,0.04)` |
| Active | Navy (`#0C1F40`) | `2px solid #B4E7DD` | Transparent |
| Disabled | `rgba(12,31,64,0.25)` | None | Transparent |
| Focus-visible | `outline: 2px solid #B4E7DD; outline-offset: -2px` | — | — |

**Variant: `pills`**

Used in the Docs pages for code language selectors and secondary navigation within doc sections.

**Tab bar container (pills):**

| Property | Value |
|----------|-------|
| Display | `flex; gap: 4px` |
| Background | `#F3F4F6` |
| Padding | `4px` |
| Border | `1px solid rgba(12,31,64,0.08)` |
| Border-radius | `0px` (PyMC: never round the container either) |

**Individual tab (pills variant):**

| Property | Value |
|----------|-------|
| Height | `sm: 28px` / `md: 34px` |
| Padding | `sm: 0 10px` / `md: 0 14px` |
| Font | Inter, `sm: 12px` / `md: 13px`, weight `500` |
| Border-radius | `0px` |

**Tab states — pills variant:**

| State | Background | Text Color | Border |
|-------|-----------|------------|--------|
| Default (inactive) | Transparent | `rgba(12,31,64,0.55)` | None |
| Hover (inactive) | `rgba(12,31,64,0.06)` | Navy | None |
| Active | White (`#FFFFFF`) | Navy (`#0C1F40`) | `1px solid rgba(12,31,64,0.12)` |
| Disabled | Transparent | `rgba(12,31,64,0.25)` | None |
| Focus-visible | `outline: 2px solid #B4E7DD; outline-offset: -2px` | — | — |

Active tab has a subtle box-shadow: `0 1px 2px rgba(12,31,64,0.08)`.

**Variant: `bordered`**

Used for high-emphasis tab navigation where tabs visually separate from content below (e.g., top-level admin section navigation).

**Tab bar container (bordered):**

| Property | Value |
|----------|-------|
| Display | `flex` |
| Border | `1px solid rgba(12,31,64,0.10)` |
| Background | White |
| Overflow-x | `auto` |

**Individual tab (bordered variant):**

| Property | Value |
|----------|-------|
| Height | `44px` |
| Padding | `0 20px` |
| Font | Inter, `14px`, weight `500` |
| Border-right | `1px solid rgba(12,31,64,0.10)` (between tabs) |
| Border-radius | `0px` |

**Tab states — bordered variant:**

| State | Background | Text Color | Border-bottom |
|-------|-----------|------------|--------------|
| Default | White | `rgba(12,31,64,0.55)` | None |
| Hover | `rgba(12,31,64,0.03)` | Navy | None |
| Active | `rgba(180,231,221,0.12)` | Navy (`#0C1F40`) | `2px solid #B4E7DD` |
| Disabled | White | `rgba(12,31,64,0.25)` | None |
| Focus-visible | `outline: 2px solid #B4E7DD; outline-offset: -2px` | — | — |

**Tab badge:**

When `badge` is present on a `TabItem`, a small pill badge renders to the right of the label text.

| Property | Value |
|----------|-------|
| Background | Aqua 20% (`rgba(180,231,221,0.30)`) |
| Text | Navy, `11px`, weight `600` |
| Padding | `1px 6px` |
| Border-radius | `0px` |
| Margin-left | `4px` |

Active tab badge: background `rgba(180,231,221,0.50)`.

**Full-width behavior:**

When `fullWidth = true`, each tab takes `flex: 1` — tabs divide available width equally. Used in Settings page where there are only 2 tabs (General / Danger Zone).

**Transition:** `color 0.15s ease, background 0.15s ease, border-color 0.15s ease`.

**Controlled vs uncontrolled:**

`Tabs` is always controlled — `activeTab` and `onChange` are required. There is no internal state. The parent manages active tab. This enables URL-based tab persistence:

```typescript
// Admin panel example: tab state in URL searchParams
const searchParams = useSearchParams()
const activeTab = searchParams.get('tab') ?? 'overview'

function handleTabChange(value: string) {
  router.push(`?tab=${value}`, { scroll: false })
}
```

**Tab content area:**

The `Tabs` component does NOT render tab panel content — it only renders the tab bar. The parent is responsible for rendering the appropriate content beneath the tab bar based on `activeTab`. This keeps the component purely presentational.

**Where used:**

| Location | Variant | Tabs |
|----------|---------|------|
| Admin panel — tenant detail | `underline` | Overview, Connections, Audit Log |
| Docs pages — code language selector | `pills` | TypeScript, Python, cURL |
| Settings page | `underline` (fullWidth) | General, Danger Zone |
| Billing page — plan detail (if needed) | `underline` | Current Plan, Invoice History |

**Accessibility:**

| Attribute | Value |
|-----------|-------|
| Tab list container `role` | `"tablist"` |
| Tab list container `aria-label` | Descriptive label: e.g., `"Tenant detail sections"` |
| Each tab button `role` | `"tab"` |
| Active tab `aria-selected` | `"true"` |
| Inactive tabs `aria-selected` | `"false"` |
| Each tab `aria-controls` | ID of the corresponding tab panel |
| Disabled tab `aria-disabled` | `"true"` |
| Tab panel `role` | `"tabpanel"` (applied by parent to content area) |
| Tab panel `aria-labelledby` | ID of the controlling tab |
| Keyboard navigation | Arrow keys (`←`, `→`) move between tabs; `Home`/`End` jump to first/last; `Enter`/`Space` activates focused tab |
| Focus management | When a tab is activated by keyboard, focus moves to the tab panel content |

---

### Summary Table — Action Components

| Component | File | Primary Usage |
|-----------|------|---------------|
| `Button` | `components/ui/Button.tsx` | All primary/secondary/ghost/danger CTAs across forms, dialogs, pages |
| `IconButton` | `components/ui/IconButton.tsx` | Icon-only actions: close, copy, logout, expand, row actions |
| `Link` | `components/ui/Link.tsx` | Navigation links, inline text links, external URLs |
| `DropdownMenu` | `components/ui/DropdownMenu.tsx` | Contextual row actions, user menu, bulk actions |
| `Tabs` | `components/ui/Tabs.tsx` | Admin panel tenant detail, docs code selector, settings sections |

---

## 6. Brand Compliance Matrix — All Components

This matrix is the definitive reference for enforcing PyMC brand rules across every component in the library. A developer building or reviewing any component should check this matrix to verify compliance.

### Rule Reference

Before the matrix, the 8 PyMC brand rules that components must obey:

| # | Rule | Spec Reference |
|---|------|---------------|
| R1 | **Zero border-radius** on all interactive elements and containers (exception: circular user avatars only) | [brand-guidelines.md §6] |
| R2 | **Aqua (`#B4E7DD`)** is the only primary button background color | [brand-guidelines.md §5] |
| R3 | **Peach Orange (`#F6AE72`) is NEVER used** in UI elements — data visualization only | [brand-guidelines.md §1] |
| R4 | **Inter** for all UI text (labels, buttons, navigation, body, tooltips, errors) | [brand-guidelines.md §2] |
| R5 | **Archivo** for headlines and display text only — never for UI controls | [brand-guidelines.md §2] |
| R6 | **Navy (`#0C1F40`)** is primary text color and dark background | [brand-guidelines.md §1] |
| R7 | **Transition duration 0.2s ease** (or 0.15s for subtle states) — never instant, never slow | [brand-guidelines.md §5] |
| R8 | **Focus ring: `outline: 2px solid #B4E7DD; outline-offset: 2px`** — always visible on keyboard focus | [accessibility best practice + brand] |

### Compliance Matrix

| Component | R1 (0 radius) | R2 (Aqua primary) | R3 (No Peach) | R4 (Inter font) | R5 (Archivo headlines) | R6 (Navy text) | R7 (Transition) | R8 (Focus ring) | Notes |
|-----------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|-------|
| **Layout** | | | | | | | | | |
| DashboardLayout | ✓ | N/A | ✓ | ✓ | N/A | ✓ | N/A | N/A | Container only |
| Sidebar | ✓ | N/A | ✓ | ✓ | N/A | White on Navy | ✓ | ✓ | Dark context |
| SidebarNavItem | ✓ | ✓ (active: Aqua underline) | ✓ | ✓ | N/A | White 65% default, Aqua active | ✓ 0.15s | ✓ Aqua outline | Left border 2px Aqua on active |
| DashboardTopbar | ✓ | N/A | ✓ | ✓ | N/A | ✓ | ✓ | ✓ | |
| MobileNav | ✓ | N/A | ✓ | ✓ | N/A | ✓ | ✓ | ✓ | |
| AuthCard | ✓ | N/A | ✓ | ✓ | ✓ (page title uses Archivo) | ✓ | N/A | N/A | |
| PageShell | ✓ | N/A | ✓ | ✓ | N/A | ✓ | N/A | N/A | |
| **Form** | | | | | | | | | |
| FormInput | ✓ | N/A | ✓ | ✓ | N/A | ✓ | ✓ 0.15s | ✓ Aqua outline | Focus: 2px Aqua border |
| PasswordInput | ✓ | N/A | ✓ | ✓ | N/A | ✓ | ✓ | ✓ | Eye toggle ghost variant |
| Select | ✓ | N/A | ✓ | ✓ | N/A | ✓ | ✓ | ✓ | Dropdown panel: 0 radius |
| Toggle | ✓ | ✓ (checked: Aqua track) | ✓ | ✓ | N/A | ✓ | ✓ | ✓ | Thumb is white circle (avatar exception) |
| Checkbox | ✓ | ✓ (checked: Aqua bg) | ✓ | ✓ | N/A | ✓ | ✓ | ✓ | 2px Aqua border on focus |
| ApiKeyInput | ✓ | N/A | ✓ | ✓ (monospace for key value) | N/A | ✓ | ✓ | ✓ | Uses `font-mono` for key; labels use Inter |
| SearchInput | ✓ | N/A | ✓ | ✓ | N/A | ✓ | ✓ | ✓ | |
| **Feedback** | | | | | | | | | |
| AlertBanner | ✓ | N/A | ✓ | ✓ | N/A | ✓ | N/A | N/A | Info variant uses Aqua tint NOT Peach |
| Toast | ✓ | N/A | ✓ | ✓ | N/A | ✓ | ✓ (slide-in 300ms) | N/A | Dismiss button: Aqua focus ring |
| ConfirmDialog | ✓ | ✓ (confirm: Aqua or danger) | ✓ | ✓ | N/A | ✓ | ✓ | ✓ | Modal overlay prevents page interaction |
| Modal | ✓ | N/A | ✓ | ✓ | ✓ (modal title can use Archivo) | ✓ | ✓ (150ms open) | ✓ | Focus trapped inside |
| EmptyState | ✓ | ✓ (CTA button uses Aqua) | ✓ | ✓ | N/A | ✓ | N/A | ✓ | |
| ErrorState | ✓ | ✓ (retry button if present) | ✓ | ✓ | N/A | ✓ | N/A | ✓ | |
| SkeletonLoader | ✓ | N/A | ✓ | N/A | N/A | N/A | ✓ (shimmer animation) | N/A | Shimmer uses gray tones only |
| **Data Display** | | | | | | | | | |
| Badge | ✓ | ✓ (active/online: Aqua) | ✓ | ✓ | N/A | ✓ | N/A | N/A | Error: red; warning: yellow (not Peach) |
| StatusIndicator | ✓ | ✓ (connected: Aqua dot) | ✓ | ✓ | N/A | ✓ | ✓ (dot pulse) | N/A | Disconnected: red; degraded: yellow |
| Table | ✓ | N/A | ✓ | ✓ | N/A | ✓ | ✓ (row hover 0.1s) | ✓ (row focus) | Header bg: Navy; header text: White |
| Pagination | ✓ | ✓ (active page: Aqua bg) | ✓ | ✓ | N/A | ✓ | ✓ 0.15s | ✓ | |
| StatCard | ✓ | N/A | ✓ | ✓ | ✓ (value number uses Archivo) | ✓ | N/A | N/A | CI stripe on left edge |
| ActivityFeed | ✓ | ✓ (icon bg: Aqua tint) | ✓ | ✓ | N/A | ✓ | N/A | N/A | Timeline dot uses Aqua |
| CopyToClipboard | ✓ | N/A | ✓ | ✓ (mono for values) | N/A | ✓ | ✓ | ✓ | Success: green tint (NOT Aqua — semantic) |
| **Action** | | | | | | | | | |
| Button | ✓ | ✓ (primary: Aqua bg, Navy text) | ✓ | ✓ | N/A | ✓ | ✓ 0.2s | ✓ | Secondary: Navy border; Ghost: no border |
| IconButton | ✓ | ✓ (primary variant) | ✓ | N/A (icon-only) | N/A | ✓ | ✓ 0.2s | ✓ | Ghost: most common variant |
| Link | ✓ | ✓ (active underline: Aqua) | ✓ | ✓ | N/A | ✓ | ✓ 0.15s | ✓ | External links auto-add ExternalLinkIcon |
| DropdownMenu | ✓ | N/A (panel) | ✓ | ✓ | N/A | ✓ | ✓ 0.1s items | ✓ (items) | Panel shadow: Navy-tinted |
| Tabs | ✓ | ✓ (active: Aqua underline/bg) | ✓ | ✓ | N/A | ✓ | ✓ 0.15s | ✓ | |

### Common Violations to Check

The following are the most frequent brand violations that reviewers should actively check:

| Violation | Symptom | Correction |
|-----------|---------|------------|
| Rounded corners | `border-radius: 4px` or `rounded-md` in Tailwind | Change to `rounded-none` or `border-radius: 0` |
| Peach Orange in UI | `#F6AE72` or `orange-` Tailwind classes in non-chart code | Replace with `#B4E7DD` (Aqua) or semantic red/green/yellow |
| Missing focus ring | `focus:outline-none` without a replacement ring | Add `focus-visible:ring-2 focus-visible:ring-[#B4E7DD]` |
| Primary button not Aqua | Blue (`#3B82F6`) or black primary buttons | Change to `bg-[#B4E7DD] text-[#0C1F40]` |
| Archivo in buttons | `font-archivo` on any `<Button>` or form element | Change to `font-inter` |
| Inter in page headings | `font-inter` on `h1`, `h2`, page titles | Change to `font-archivo` with appropriate `wdth` |
| Instant transitions | Missing `transition-*` classes | Add `transition-all duration-200 ease-in-out` |
| Button with rounded corners inside modal | Re-using a third-party modal that doesn't inherit PyMC rules | Override with `[&_button]:rounded-none` |
| Avatar not circular | Non-user avatar with `rounded-full` | Remove; only user initials avatars use `rounded-full` |
| Yellow warning using Peach | Using `#F6AE72` for a warning state | Use standard yellow `#F59E0B` for warnings |

### Tailwind Config Verification Checklist

The following must be set in `tailwind.config.ts` for brand compliance:

```typescript
// tailwind.config.ts (brand-compliance relevant sections)
module.exports = {
  theme: {
    extend: {
      colors: {
        navy: '#0C1F40',
        aqua: '#B4E7DD',
        periwinkle: '#9FAAE2',
        // Note: peach-orange NOT added here intentionally — it should not be
        // accessible as a utility class to prevent accidental UI use
      },
      fontFamily: {
        archivo: ['Archivo', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        lora: ['Lora', 'Georgia', 'serif'],
      },
      borderRadius: {
        DEFAULT: '0px',   // Override Tailwind default of 4px
        none: '0px',
        sm: '0px',        // Override — PyMC never uses rounded corners
        md: '0px',        // Override
        lg: '0px',        // Override
        xl: '0px',        // Override
        full: '9999px',   // KEEP — used only for circular user avatars
      },
      ringColor: {
        DEFAULT: '#B4E7DD',  // Aqua focus ring by default
      },
      ringOffsetWidth: {
        DEFAULT: '2px',
      },
    },
  },
}
```

**Note on `full` border-radius:** The only permitted use of `rounded-full` (circular) is for user avatar initials circles — see `SidebarFooter.UserAvatar` and any user avatar rendering across the application. All other uses of `rounded-full` are brand violations.

### Design Token Reference (CSS Custom Properties)

These tokens must be defined in `app/globals.css` for use across the application:

```css
:root {
  /* Core brand colors */
  --color-navy: #0C1F40;
  --color-aqua: #B4E7DD;
  --color-periwinkle: #9FAAE2;
  --color-white: #FFFFFF;
  --color-white-soft: #F7F7F7;

  /* Semantic UI colors (not in brand deck but needed for functional states) */
  --color-success: #22C55E;      /* green-500 — success states, confirmation */
  --color-error: #EF4444;        /* red-500 — errors, danger actions */
  --color-warning: #F59E0B;      /* amber-500 — warnings (NOT Peach Orange) */
  --color-info: rgba(180,231,221,0.20);  /* Aqua tint — info banners */

  /* Surface colors */
  --color-surface-page: #FFFFFF;
  --color-surface-raised: #F7F7F7;
  --color-surface-overlay: rgba(12,31,64,0.45);  /* Modal backdrop */

  /* Border colors */
  --color-border-default: rgba(12,31,64,0.10);
  --color-border-strong: rgba(12,31,64,0.20);
  --color-border-focus: #B4E7DD;

  /* Typography */
  --font-archivo: 'Archivo', sans-serif;
  --font-inter: 'Inter', sans-serif;
  --font-lora: 'Lora', Georgia, serif;

  /* Transitions */
  --transition-fast: all 0.15s ease;
  --transition-default: all 0.2s ease;

  /* Spacing (consistent with brand margin scale) */
  --space-12: 12px;
  --space-16: 16px;
  --space-24: 24px;
  --space-32: 32px;
  --space-48: 48px;
  --space-64: 64px;
}
```

---

*End of Component Library Specification. All 5 sections complete: Layout (4.9a), Form (4.9b), Feedback (4.9c), Data Display (4.9d), Action + Brand Matrix (4.9e).*
