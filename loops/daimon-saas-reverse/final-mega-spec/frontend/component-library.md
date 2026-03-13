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
3. Feedback Components (aspect 4.9c)
4. Data Display Components (aspect 4.9d)
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

*Next section: [Feedback Components](#3-feedback-components) — aspect 4.9c*
