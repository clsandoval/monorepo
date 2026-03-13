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
