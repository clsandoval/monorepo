# Responsive Behavior — Complete Specification

> File: `final-mega-spec/frontend/responsive-behavior.md`
> Last updated: 2026-03-13
> Cross-references:
>   - Component library: [./component-library.md](./component-library.md)
>   - Dashboard spec: [./dashboard.md](./dashboard.md)
>   - Landing page spec: [./landing-page.md](./landing-page.md)
>   - Auth pages spec: [./auth-pages.md](./auth-pages.md)
>   - Integrations spec: [./integrations-page.md](./integrations-page.md)
>   - Billing spec: [./billing-page.md](./billing-page.md)
>   - Settings spec: [./settings-page.md](./settings-page.md)
>   - Admin panel spec: [./admin-panel.md](./admin-panel.md)
>   - Docs spec: [./docs-pages.md](./docs-pages.md)
>   - Design system: [../ui/design-system.md](../ui/design-system.md)

This file is the single authoritative source for how every page and layout adapts across the three supported viewport widths. It consolidates responsive behavior from all page specs and fills gaps not covered elsewhere.

---

## Table of Contents

1. [Breakpoint System](#1-breakpoint-system)
2. [Touch Target Rules](#2-touch-target-rules)
3. [Typography Scaling](#3-typography-scaling)
4. [Global Layout Shell](#4-global-layout-shell)
   - 4.1 Dashboard Shell (Sidebar + Main)
   - 4.2 Public Shell (Landing / Docs / Auth)
5. [Page-by-Page Responsive Behavior](#5-page-by-page-responsive-behavior)
   - 5.1 Landing Page
   - 5.2 Auth Pages (Login, Signup, Reset Password)
   - 5.3 Dashboard Home
   - 5.4 Integrations Page
   - 5.5 Billing Page
   - 5.6 Settings Page
   - 5.7 Admin Panel
   - 5.8 Docs Pages
6. [Component-Level Responsive Rules](#6-component-level-responsive-rules)
7. [Tailwind CSS Breakpoint Configuration](#7-tailwind-css-breakpoint-configuration)
8. [Viewport Meta Tag and Zoom Behavior](#8-viewport-meta-tag-and-zoom-behavior)

---

## 1. Breakpoint System

Daimon uses a **mobile-first** CSS approach. Base styles target mobile; `md:` and `lg:` prefixes add overrides for larger viewports.

| Name | Min Width | Max Width | Notes |
|------|-----------|-----------|-------|
| `mobile` | 375px | 767px | Base / default styles |
| `tablet` | 768px | 1279px | `md:` Tailwind prefix |
| `desktop` | 1280px | ∞ | `lg:` Tailwind prefix |

> **Note on auth and landing pages**: These pages use `900px` as the mobile/desktop breakpoint (not 768px) because they are full-width public pages without a sidebar. The `sm:` prefix (640px) is also used in some places for fine-grained adjustments.

**Exact pixel widths used in layout decisions:**

| Breakpoint trigger | Pixel value | Usage |
|-------------------|-------------|-------|
| Auth/landing mobile cutoff | `≤ 900px` | Nav links hidden, hamburger shows, hero layout stacks |
| Service card single column | `< 768px` | Integrations page service grid |
| Dashboard sidebar collapse | `768px – 1279px` | Sidebar icon-only mode |
| Dashboard sidebar hidden | `< 768px` | Sidebar replaced by bottom nav |
| Admin panel minimum | `≥ 1024px` | Admin panel only; shows mobile-blocked message below |
| Pagination text hidden | `< 640px` | Pagination component removes item range text |
| Pagination prev/next text | `< 480px` | Shows only `←` / `→` icons |

---

## 2. Touch Target Rules

All interactive elements must meet minimum touch target sizes on mobile (<768px):

| Element type | Minimum height | Minimum width |
|--------------|---------------|---------------|
| Buttons (all variants) | `44px` | `44px` |
| Input fields | `44px` | Auto (full-width on mobile) |
| Nav icons (bottom bar) | `44px` | `48px` (flex: 1/5 of screen) |
| Checkbox / Toggle labels | `44px` (include label in tap area) | Auto |
| Icon-only buttons | `44px` | `44px` |
| Dropdown trigger | `44px` | Auto |
| Table row actions | `36px` height minimum (table rows are not primarily touch targets) | `44px` per button |

Implementation: Use Tailwind's `min-h-[44px]` and `min-w-[44px]` classes on mobile breakpoint. Do NOT shrink interactive elements below these sizes on mobile.

---

## 3. Typography Scaling

All `clamp()` values ensure smooth scaling without breakpoint jumps for display text.

| Element | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| Landing hero headline | `clamp(36px, 8vw, 52px)` | `clamp(44px, 6vw, 64px)` | `clamp(56px, 6vw, 80px)` |
| Landing section heading | `clamp(24px, 5vw, 36px)` | `clamp(28px, 4vw, 40px)` | `clamp(28px, 3.5vw, 44px)` |
| Landing hero subheadline | `18px` | `20px` | `22px` |
| Dashboard stat value | `22px` (Archivo Expanded) | `24px` | `28px` |
| Auth card heading | `22px` | `24px` | `24px` |
| Page section heading | `20px` | `22px` | `24px` |
| Card heading | `16px` | `17px` | `18px` |
| Body copy | `15px` | `15px` | `16px` |
| Small / helper text | `13px` | `13px` | `13px` |
| Docs article body | `15px` | `16px` | `16px` |
| Step number (How It Works) | `52px` | `64px` | `80px` |

---

## 4. Global Layout Shell

### 4.1 Dashboard Shell (Sidebar + Main Area)

The dashboard shell (`app/(dashboard)/layout.tsx`) adapts as follows:

#### Desktop (≥ 1280px)

```
┌──────────────────────────────────────────────────────────────┐
│ [Sidebar 240px fixed] │ [TopBar 56px sticky]                 │
│                       │────────────────────────────────────── │
│                       │ [Main content area]                   │
│                       │  margin-left: 240px                   │
│                       │  padding: 32px                        │
│                       │  max-width of content: 1200px         │
└──────────────────────────────────────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Sidebar | `position: fixed`, `left: 0`, `top: 0`, `width: 240px`, `height: 100vh` |
| Main area | `margin-left: 240px`, `flex-direction: column` |
| TopBar | `height: 56px`, `position: sticky`, `top: 0`, `z-index: 30` |
| Page content padding | `padding: 32px` |
| Content max-width | `max-width: 1200px` within the `<main>` tag |

#### Tablet (768px – 1279px)

```
┌──────────────────────────────────────────────────────────────┐
│ [Sidebar 56px icons] │ [TopBar 56px sticky]                   │
│                      │──────────────────────────────────────  │
│                      │ [Main content area]                    │
│                      │  margin-left: 56px                     │
│                      │  padding: 24px                         │
└──────────────────────────────────────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Sidebar | Collapses to icon-only mode: `width: 56px` |
| Sidebar nav items | Icon only (20px), no label visible. Tooltip on hover shows label |
| Sidebar logo | Icon only (rocket), wordmark hidden |
| Main area | `margin-left: 56px` |
| Page content padding | `padding: 24px` |

**Sidebar icon-only mode class changes:**
```css
/* Applied at tablet breakpoint */
.sidebar { width: 56px; }
.sidebar .nav-label { display: none; }
.sidebar .logo-wordmark { display: none; }
.sidebar .logo-area { justify-content: center; padding: 0; }
.sidebar .nav-item { justify-content: center; padding: 0 8px; }
```

#### Mobile (< 768px)

```
┌─────────────────────────────┐
│ [Mobile TopBar 56px]        │  ← Hamburger icon | "Daimon" title | Tenant badge
│─────────────────────────────│
│ [Page content area]         │
│  padding: 16px              │
│                             │
│                             │
│─────────────────────────────│
│ [Bottom Nav Bar 56px]       │  ← 5 icons: Dashboard, Integrations, Billing, Settings, Docs
└─────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Sidebar | Hidden (`display: none`) |
| Main area | `margin-left: 0` |
| Page content padding | `padding: 16px`, `padding-bottom: 72px` (clears bottom nav bar) |
| Mobile TopBar height | `56px` |
| Bottom nav bar | Fixed, `height: 56px`, `position: fixed`, `bottom: 0`, `left: 0`, `right: 0`, `z-index: 40` |
| Bottom nav bar background | White (`#FFFFFF`) |
| Bottom nav bar border | `1px solid rgba(12,31,64,0.08)` top border |

**Bottom nav bar items (mobile):**

| Position | Icon | Label | Route |
|----------|------|-------|-------|
| 1 | HomeIcon 20px | Dashboard | `/dashboard` |
| 2 | PlugIcon 20px | Integrations | `/dashboard/integrations` |
| 3 | CreditCardIcon 20px | Billing | `/dashboard/billing` |
| 4 | SettingsIcon 20px | Settings | `/dashboard/settings` |
| 5 | BookOpenIcon 20px | Docs | `/docs` |

**Bottom nav item states:**

| State | Icon color | Label color | Background |
|-------|------------|-------------|------------|
| Default | Navy 45% opacity | Navy 45%, 10px Inter weight 500 | Transparent |
| Active | Navy 100% | Navy 100% | Transparent + aqua dot indicator above icon |
| Hover/tap | Navy 75% | Navy 75% | `rgba(12,31,64,0.04)` |

**Active indicator:** 2px × 16px aqua (`#B4E7DD`) bar above the icon, centered horizontally.

**MobileNav slide-over (`components/layout/MobileNav.tsx`):**

The hamburger button in the mobile TopBar triggers a full-screen overlay slide-over for secondary navigation (not the primary nav which uses the bottom bar). This is primarily for accessing account/tenant information.

| Property | Value |
|----------|-------|
| Width | `100vw` |
| Height | `100vh` |
| Background | White |
| Animation | Slide in from left: `transform: translateX(-100%)` → `transform: translateX(0)`, `300ms ease-out` |
| z-index | `50` |
| Close button | X icon, top-right, `aria-label="Close menu"` |
| Content | Logo, nav items (same as sidebar), tenant name, account links, sign out |

---

### 4.2 Public Shell (Landing / Docs / Auth)

Public pages do not use the dashboard sidebar. They use their own navigation.

**Landing page nav:** Sticky topbar with hamburger at ≤ 900px.
**Docs pages:** See Section 5.8.
**Auth pages:** Centered card layout, no nav. See Section 5.2.

---

## 5. Page-by-Page Responsive Behavior

### 5.1 Landing Page (`/`)

#### Breakpoints used: 900px (mobile cutoff), 768px (tablet intermediate)

---

**Navigation Bar**

| Element | Mobile (≤ 900px) | Desktop (> 900px) |
|---------|-----------------|------------------|
| Height | `56px` | `64px` |
| Container padding | `16px` horizontal | `32px` horizontal |
| Nav links | Hidden | Visible (center) |
| CTA button "Get Started Free" | Hidden | Visible (right) |
| Hamburger button | Visible (right) | Hidden |
| Logo wordmark | Visible | Visible |

**Mobile hamburger menu (slide-over):**
- Triggered by hamburger button
- Full-screen white overlay (`100vw × 100vh`)
- Animation: fade in + scale from `0.96` to `1.0`, `200ms ease`
- Content: Logo (top), nav links vertically stacked (24px gap), "Get Started Free" button (full-width, primary), social/footer links
- Close: X button top-right, `aria-label="Close menu"`, or clicking outside

---

**Hero Section**

| Property | Mobile (375px) | Tablet (768px) | Desktop (1280px) |
|----------|---------------|----------------|-----------------|
| Section padding top | `80px` | `100px` | `120px` |
| Section padding bottom | `48px` | `64px` | `80px` |
| Headline font size | `clamp(36px, 8vw, 52px)` | `clamp(44px, 6vw, 64px)` | `clamp(56px, 6vw, 80px)` |
| Headline max-width | `100%` | `600px` | `800px` |
| Subheadline font size | `18px` | `20px` | `22px` |
| Subheadline max-width | `100%` | `480px` | `600px` |
| CTA button group layout | `flex-direction: column`, buttons `width: 100%` | `flex-direction: row` | `flex-direction: row` |
| Social proof strip | `font-size: 12px` | `13px` | `14px` |
| Gradient blobs | Scale `0.6`, bleed outside viewport | Scale `0.7` | Scale `1.0` |
| Trusted by strip | Text + avatars stacked | Inline | Inline |

---

**How It Works Section**

| Property | Mobile | Tablet | Desktop |
|----------|--------|--------|---------|
| Section padding | `py-16` (64px) | `py-20` (80px) | `py-24` (96px) |
| Container padding | `px-4` (16px) | `px-6` (24px) | `px-8` (32px) |
| Step grid columns | `1 column` | `1 column` | `3 columns` |
| Step grid gap | `32px` | `32px` | `24px` |
| Step number size | `52px` | `64px` | `80px` |
| Section heading | `clamp(24px, 5vw, 36px)` | `clamp(28px, 4vw, 40px)` | `clamp(28px, 3.5vw, 44px)` |

---

**Features / Capabilities Grid**

| Property | Mobile | Tablet (≥ 600px) | Desktop |
|----------|--------|-----------------|---------|
| Grid columns | `1 column` | `2 columns` | `3 columns` |
| Grid gap | `16px` | `20px` | `24px` |
| Feature card padding | `20px` | `24px` | `24px` |
| Section padding | `py-16 px-4` | `py-20 px-6` | `py-24 px-8` |

---

**Integrations Strip**

| Property | Mobile | Desktop |
|----------|--------|---------|
| Layout | Horizontal scroll (overflow-x: auto, scrollbar hidden) | Single row, all logos visible |
| Logo size | `32px × 32px` | `40px × 40px` |
| Gap between logos | `24px` | `32px` |
| Strip padding | `12px 0` | `16px 0` |

---

**Pricing Section**

| Property | Mobile | Tablet | Desktop |
|----------|--------|--------|---------|
| Plan grid columns | `1 column` | `1 column` | `3 columns` |
| Plan card order | Free, Starter, Pro (vertical stack) | Same | Side-by-side |
| Pro card "Most Popular" badge | Visible | Visible | Visible |
| Section padding | `py-16 px-4` | `py-20 px-6` | `py-24 px-8` |
| Billing cycle toggle | Full-width, centered | Same | Centered |

---

**FAQ Section**

| Property | Mobile | Desktop |
|----------|--------|---------|
| Layout | Single column, full-width | Single column, max-width 720px, centered |
| Accordion item padding | `16px` | `20px` |
| Question font size | `16px` | `17px` |
| Answer font size | `15px` | `16px` |
| Section padding | `py-16 px-4` | `py-24 px-8` |

---

**Final CTA Banner**

| Property | Mobile | Desktop |
|----------|--------|---------|
| Layout | Stacked: heading above CTA | Horizontal: heading left, CTA right |
| CTA button | Full-width | Auto width |
| Padding | `py-12 px-4` | `py-20 px-8` |

---

**Footer**

| Property | Mobile | Desktop |
|----------|--------|---------|
| Grid columns | `2 columns` | `1.5fr 1fr 1fr 1fr 1fr` (5 columns) |
| Logo column | Full-width (spans both columns) | First column |
| Footer padding | `py-12 px-4` | `py-16 px-8` |
| Bottom strip | Stacked: copyright above, links below | Horizontal: copyright left, links right |
| Link font size | `13px` | `14px` |

---

### 5.2 Auth Pages (`/login`, `/signup`, `/reset-password`, `/reset-password/confirm`)

Auth pages use a single breakpoint: `900px` (custom, not the standard `768px`).

#### All Auth Pages — Both Breakpoints

```
<body bg="#F7F7F7">
  <div class="auth-shell" (min-h-screen, flex, items-center, justify-center, p-4)>
    <div class="auth-card" (bg-white, max-w-[440px], w-full, p-[40px])>
      …content…
    </div>
  </div>
</body>
```

| Property | Desktop (> 900px) | Mobile (≤ 900px) |
|----------|------------------|-----------------|
| Body background | White Soft `#F7F7F7` | White Soft `#F7F7F7` |
| Card max-width | `440px` | `100%` (fills screen minus `32px` padding: `calc(100vw - 32px)`) |
| Card padding | `40px` | `32px` |
| Card border | `1px solid rgba(12,31,64,0.08)` | `1px solid rgba(12,31,64,0.08)` |
| Logo icon size | `32px × 32px` | `28px × 28px` |
| Logo wordmark size | `20px` | `18px` |
| Logo margin-bottom | `8px` | `8px` |
| Card heading size | `24px` | `22px` |
| Form gap | `16px` | `12px` |
| Footer links | Inline, centered | Wrap, centered |
| Container padding | `16px` all sides | `16px` all sides |

**Form fields (both breakpoints):**
- All form fields: `width: 100%` at both breakpoints
- Input height: minimum `44px` (touch-friendly on mobile)
- Submit button: `width: 100%`, `height: 48px`, at both breakpoints
- No horizontal layout changes — everything is single-column on both breakpoints

**No nav bar on auth pages** — they are completely standalone with logo + form only.

---

### 5.3 Dashboard Home (`/dashboard`)

#### Desktop (≥ 1280px)

```
┌─────────────────────────────────────────────────────────────────────┐
│ [Sidebar 240px] │ [TopBar 56px]                                      │
│                 │─────────────────────────────────────────────────── │
│                 │ [Welcome Banner — full width, dismissible]          │
│                 │                                                     │
│                 │ [Onboarding Checklist — full width]                 │
│                 │                                                     │
│                 │ [Bot Status Card 60%]  [API Keys Card 40%]          │
│                 │                                                     │
│                 │ [Integrations Summary Card — full width]            │
│                 │                                                     │
│                 │ [Stats 33%] [Stats 33%] [Stats 33%]                 │
│                 │                                                     │
│                 │ [Recent Activity Feed — full width]                 │
└─────────────────────────────────────────────────────────────────────┘
```

| CSS property | Value |
|-------------|-------|
| Page padding | `32px` |
| Grid: Bot Status + API Keys | `grid-template-columns: 3fr 2fr`, `gap: 24px` |
| Grid: Stats | `grid-template-columns: repeat(3, 1fr)`, `gap: 24px` |
| Integrations icon grid | `7 columns` |
| Content max-width | `1200px` |

#### Tablet (768px – 1279px)

```
┌─────────────────────────────────────────────────────────────┐
│ [Sidebar 56px] │ [TopBar 56px]                               │
│                │──────────────────────────────────────────── │
│                │ [Onboarding Checklist — full width]          │
│                │ [Bot Status Card — full width]               │
│                │ [API Keys Card — full width]                 │
│                │ [Integrations — full width]                  │
│                │ [Stats 50%] [Stats 50%]                      │
│                │ [Stats — full width (3rd)]                   │
│                │ [Activity — full width]                      │
└─────────────────────────────────────────────────────────────┘
```

| CSS property | Value |
|-------------|-------|
| Page padding | `24px` |
| Grid: Bot Status + API Keys | `grid-template-columns: 1fr` (stacked) |
| Grid: Stats | `grid-template-columns: 1fr 1fr`, third card `grid-column: span 2` |
| Integrations icon grid | `4 columns`, wraps |

#### Mobile (< 768px)

```
┌─────────────────────────────┐
│ [Mobile TopBar 56px]        │
│─────────────────────────────│
│ [Onboarding Checklist]      │
│ [Bot Status Card]           │
│ [API Keys Card]             │
│ [Integrations Summary]      │
│ [Stat — full width]         │
│ [Stat — full width]         │
│ [Stat — full width]         │
│ [Activity Feed]             │
│─────────────────────────────│
│ [Bottom Nav Bar 56px]       │
└─────────────────────────────┘
```

| CSS property | Value |
|-------------|-------|
| Page padding | `16px`, `padding-bottom: 72px` |
| All cards | `grid-template-columns: 1fr` |
| Card padding | `16px` (from `24px` on desktop) |
| Bot status value font | Archivo Expanded `22px` (from `28px`) |
| Integrations icon grid | `4 columns`, wraps |
| Stats grid | `1 column`, all full-width |
| Sidebar | Hidden — replaced by bottom nav bar |

---

### 5.4 Integrations Page (`/dashboard/integrations`)

#### Desktop (≥ 1280px)

| Property | Value |
|----------|-------|
| Page padding | `32px` |
| Service grid | `grid-template-columns: repeat(2, 1fr)`, `gap: 24px` |
| Page header | Full-width, title left, filter/sort right |
| Service card | Full height, actions row horizontal (status badge left, button right) |

#### Tablet (768px – 1279px)

| Property | Value |
|----------|-------|
| Page padding | `24px` |
| Service grid | `grid-template-columns: repeat(2, 1fr)`, `gap: 20px` |
| Service card | Same as desktop layout |

#### Mobile (< 768px)

| Property | Value |
|----------|-------|
| Page padding | `16px`, `padding-bottom: 72px` |
| Service grid | `grid-template-columns: 1fr` (single column) |
| Service grid gap | `16px` |
| Service card | Full-width; actions row: status badge on top line, button full-width below |
| API key modal | Full-screen: `position: fixed`, `inset: 0`, `padding: 16px` |
| Confirmation dialog | Bottom sheet: slides up from bottom; `width: 100%`, `border-radius: 12px 12px 0 0` |
| Confirmation dialog animation | `transform: translateY(100%)` → `translateY(0)`, `300ms ease-out` |
| Tooltip (on disabled button) | Omitted on mobile (no hover events) |

---

### 5.5 Billing Page (`/dashboard/billing`)

#### Desktop (≥ 1280px)

| Property | Value |
|----------|-------|
| Page padding | `32px` |
| Plan comparison grid | `grid-template-columns: repeat(3, 1fr)`, `gap: 24px` |
| Current Plan Card | Full-width horizontal layout: plan info left, CTA right |
| ApiKeyRow | Inline row: name badge → hint box → "Update" button → "Delete" button |
| Billing cycle toggle | Positioned above plan grid, right-aligned |

#### Tablet (768px – 1279px)

| Property | Value |
|----------|-------|
| Page padding | `24px` |
| Plan comparison grid | `grid-template-columns: repeat(2, 1fr)` — Free + Starter side-by-side; Pro full-width below |
| Current Plan Card | Plan name + CTA stack vertically if text overflows |
| ApiKeyRow | Hint box full-width, buttons in a row below |

#### Mobile (< 768px)

| Property | Value |
|----------|-------|
| Page padding | `16px`, `padding-bottom: 72px` |
| Plan comparison grid | `grid-template-columns: 1fr` — all three cards stacked vertically |
| Current Plan Card | Full-width; CTA button below plan name + features |
| ApiKeyRow layout | Key name + badge → hint box → buttons all stacked vertically |
| ApiKeyRow buttons | "Update" + "Delete" horizontal row at bottom of section (`flex`, `gap: 8px`) |
| Billing cycle toggle | Full-width, centered above plan cards |
| Add/Update key modal | `width: 95vw`, `margin: auto 16px`, inputs full-width |
| Confirmation dialogs | `width: 95vw`, centered |
| All button heights | Minimum `44px` |

---

### 5.6 Settings Page (`/dashboard/settings`)

#### Desktop (≥ 1280px)

| Property | Value |
|----------|-------|
| Page padding | `32px` |
| Settings cards max-width | `800px` (centered within main content) |
| Form input rows | Horizontal: label + input (320px wide) + save button in same row |
| Discord connection row | Info (name, guild ID, status) left; action buttons right |
| Danger Zone row | Description text left, "Delete Account" button right |

#### Tablet (768px – 1279px)

| Property | Value |
|----------|-------|
| Page padding | `24px` |
| Settings cards | Full-width, no max-width restriction |
| Form input rows | Horizontal (still fits at tablet width) |
| Discord connection row | Horizontal |
| Danger Zone row | Horizontal |

#### Mobile (< 768px)

| Property | Value |
|----------|-------|
| Page padding | `16px`, `padding-bottom: 72px` |
| Settings cards padding | `16px 20px 20px 20px` |
| Form input rows | Stacked: label → input (full-width) → save button (full-width) |
| Input widths | `100%` |
| Discord connection row | Stacked: connection info above, action buttons below |
| Danger Zone row | Stacked: description text above, "Delete Account" button below (full-width) |
| Modal width | `calc(100vw - 32px)` |
| Modal position | Centered vertically in viewport |

---

### 5.7 Admin Panel (`/admin`, `/admin/tenants`, `/admin/tenants/[id]`)

**Desktop-only page.** The admin panel is intentionally restricted to large screens.

| Breakpoint | Behavior |
|------------|----------|
| ≥ 1280px | Full admin UI as specified |
| 1024px – 1279px | Admin UI still functional; some tables may require horizontal scroll |
| < 1024px | Full-screen blocking message displayed: "The admin panel is not available on mobile devices. Please use a desktop browser." |

**Mobile blocking screen (`< 1024px`):**

```html
<div class="admin-mobile-block">
  <!-- centered vertically and horizontally -->
  <div class="block-card">
    <MonitorIcon size={48} color="#0C1F40" opacity={0.4} />
    <h2>Desktop only</h2>
    <p>The admin panel is not available on mobile devices. Please use a desktop browser.</p>
    <a href="/dashboard">← Back to Dashboard</a>
  </div>
</div>
```

| Property | Value |
|----------|-------|
| Block card max-width | `400px` |
| Block card padding | `40px` |
| Block card background | White |
| Block card border | `1px solid rgba(12,31,64,0.08)` |
| Heading | Archivo Semi-Expanded, 20px, Navy |
| Body text | Inter, 15px, Navy 70% |
| Back link | Inter, 14px, Navy, underline |

**Admin panel desktop layout:**

```
┌──────────────────────────────────────────────────────────────────────┐
│ [Admin Header — "Admin Panel" title + breadcrumb + sign out]          │
│──────────────────────────────────────────────────────────────────────│
│ [Stats Row — 4 stat cards, equal width]                               │
│──────────────────────────────────────────────────────────────────────│
│ [Tenant Search + Filter row]                                          │
│ [Tenant Table — full width, horizontal scroll if needed]              │
│ [Pagination]                                                          │
└──────────────────────────────────────────────────────────────────────┘
```

Table overflow on `1024px – 1279px`:
- `<div class="overflow-x-auto">` wraps the table
- Table maintains minimum column widths; horizontal scroll appears if needed

---

### 5.8 Docs Pages (`/docs`, `/docs/[slug]`)

The docs pages have three distinct layouts across breakpoints.

#### Desktop (≥ 1280px)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ [Public TopBar — sticky, 64px]                                           │
│─────────────────────────────────────────────────────────────────────────│
│ [Docs Sidebar 260px fixed] │ [Article content]    │ [In-page TOC 240px] │
│  (scrollable, sticky)      │  (max-width: 780px)  │  (sticky, right)    │
│                             │  padding: 48px 32px   │                     │
└─────────────────────────────────────────────────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Docs sidebar width | `260px`, fixed left |
| Article content max-width | `780px` |
| Article content padding | `48px 32px 96px 32px` |
| In-page TOC | Visible; `width: 240px`, `position: sticky`, `top: 72px` |
| TOC heading font | Inter, 12px, weight 600, uppercase, Navy 50% |
| TOC link font | Inter, 13px, Navy 65% |
| TOC active link | Navy 100%, left border `2px solid #B4E7DD` |

#### Tablet (768px – 1279px)

```
┌────────────────────────────────────────────────────────────────────┐
│ [Public TopBar — sticky, 56px]                                      │
│────────────────────────────────────────────────────────────────────│
│ [Horizontal Tab Bar — scrollable, section tabs]                     │
│────────────────────────────────────────────────────────────────────│
│ [Article content — full width, padding: 24px]                       │
│  In-page TOC: hidden                                                │
└────────────────────────────────────────────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Sidebar | Replaced by horizontal tab bar below the topbar |
| Horizontal tab bar | `height: 44px`, overflow-x: auto, scrollbar hidden; each tab is a section name |
| Tab styling | Inter, 14px, Navy 65%; active: Navy 100%, `2px solid #B4E7DD` bottom border |
| Article content padding | `24px` |
| In-page TOC | Hidden |
| Article content | Full-width (no fixed max-width restriction) |

#### Mobile (< 768px)

```
┌──────────────────────────────────┐
│ [Public TopBar — 56px]           │
│  ← Back  │  "Documentation"  │ ☰ │
│──────────────────────────────────│
│ [Article content — padding: 16px]│
│  In-page TOC: hidden             │
│  Parameter tables: horiz. scroll │
└──────────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Sidebar | Hidden; replaced by hamburger icon in topbar (`☰`) |
| Hamburger → slide-over | Full-screen slide-over (same as dashboard MobileNav): `width: 100vw`, slides in from left |
| Slide-over contains | All docs sections with collapsible subsections |
| Article content padding | `16px` |
| In-page TOC | Hidden |
| Step number circles | `24px × 24px` (from `32px × 32px`) |
| Step number font | Inter, 12px, weight 700 |
| Parameter tables | `overflow-x: auto` wrapper; table scrolls horizontally |
| Code blocks | `overflow-x: auto`; horizontal scroll on narrow viewports |

**Mobile docs topbar:**

| Element | Value |
|---------|-------|
| Height | `56px` |
| Left | Back arrow (← icon, 20px) — navigates to `/docs` (section index) |
| Center | "Documentation" wordmark, Inter 15px weight 600, Navy |
| Right | Hamburger icon (☰, 24px) — opens slide-over sidebar |

---

## 6. Component-Level Responsive Rules

### 6.1 Sidebar (`components/layout/Sidebar.tsx`)

| Breakpoint | Width | Labels | Logo |
|------------|-------|--------|------|
| Desktop (≥ 1280px) | `240px` | Visible | Full (icon + wordmark) |
| Tablet (768–1279px) | `56px` | Hidden; tooltip on hover | Icon only |
| Mobile (< 768px) | `0px` (hidden) | N/A | N/A |

**Tablet icon-only sidebar tooltip:** On hover over any nav icon, show a `title` attribute tooltip with the nav label. The tooltip appears to the right of the sidebar.

### 6.2 DashboardTopbar (`components/layout/DashboardTopbar.tsx`)

| Element | Desktop | Tablet | Mobile |
|---------|---------|--------|--------|
| Height | `56px` | `56px` | `56px` |
| Page title | Visible | Visible | Visible (center) |
| Breadcrumbs | Visible (> 3 items) | Truncated to current page | Hidden |
| Tenant badge | Visible | Visible | Visible (right) |
| User avatar | Visible (right) | Visible | Hidden |
| Sign out button | Visible (icon, right) | Visible (icon) | Hidden (in hamburger) |
| Hamburger button | Hidden | Hidden | Visible (left) |

### 6.3 Table Component (`components/data/Table.tsx`)

| Breakpoint | Behavior |
|------------|----------|
| Desktop | Full table, all columns visible |
| Tablet | Table wrapped in `overflow-x: auto` div; columns may require horizontal scroll at 768px |
| Mobile | Table wrapped in `overflow-x: auto`; shows first 2–3 key columns; less important columns accessible via horizontal scroll. Minimum column width: `120px`. |

**No column hiding on mobile** — the table does not hide columns on small screens. It provides horizontal scroll so all data is accessible. The `overflow-x: auto` wrapper on the `<div>` surrounding `<table>` handles this.

### 6.4 Modal (`components/feedback/Modal.tsx`)

| Breakpoint | Width | Position | Animation |
|------------|-------|----------|-----------|
| Desktop | `480px` fixed | Centered in viewport | Fade in + scale from `0.95` to `1.0`, `200ms` |
| Tablet | `480px` or `90vw` (whichever is smaller) | Centered | Same |
| Mobile | `calc(100vw - 32px)` | Centered vertically, `margin: 16px auto` | Same, or bottom sheet for confirmations |

**Confirmation dialogs on mobile:** Use bottom sheet style.
- `position: fixed`, `bottom: 0`, `left: 0`, `right: 0`
- `border-radius: 12px 12px 0 0`
- Animation: `translateY(100%)` → `translateY(0)`, `300ms ease-out`
- `padding-bottom: env(safe-area-inset-bottom)` for iPhone notch

### 6.5 AlertBanner (`components/feedback/AlertBanner.tsx`)

| Breakpoint | Behavior |
|------------|----------|
| All | Full-width of containing element |
| Mobile | Stacked layout: icon + title on first line, body on second if needed |
| Desktop | Single-row if content is short enough; wraps if needed |

### 6.6 StatCard (`components/data/StatCard.tsx`)

| Breakpoint | Grid behavior |
|------------|--------------|
| Desktop | 3-column grid (`repeat(3, 1fr)`) |
| Tablet | 2-column grid; third spans full width |
| Mobile | Single column |

### 6.7 Pagination (`components/data/Pagination.tsx`)

| Breakpoint | Behavior |
|------------|----------|
| Desktop | Full: `[← Previous]` ... page numbers ... `[Next →]` + item range text |
| Tablet | Full |
| Mobile (< 640px) | Item range text hidden; only Prev/Next + "Page X of Y" shown |
| Very small (< 480px) | Prev/Next show only arrows (`←` / `→`), no text |

### 6.8 Button (`components/action/Button.tsx`)

| Breakpoint | Minimum height |
|------------|---------------|
| All | `sm` variant: `36px` |
| Mobile | `md` variant: `44px` (touch minimum) |
| Desktop | `md` variant: `44px`, `lg` variant: `52px` |

**Full-width buttons on mobile:** CTAs in forms and modals use `w-full` on mobile (`< 640px`) to make them easier to tap. Hero CTA buttons use `w-full` at `≤ 900px`.

### 6.9 DropdownMenu (`components/action/DropdownMenu.tsx`)

| Breakpoint | Behavior |
|------------|----------|
| Desktop | Dropdown panel appears below trigger, `min-width: 160px` |
| Mobile | Dropdown panel appears below trigger; if not enough space above, appears above trigger (auto-flip). On very small screens (< 375px), panel is `calc(100vw - 32px)` wide to prevent overflow |

### 6.10 Toast Notifications

| Breakpoint | Position | Width |
|------------|----------|-------|
| Desktop | Bottom-right, `margin: 24px` | `360px` |
| Tablet | Bottom-right, `margin: 16px` | `320px` |
| Mobile | Bottom-center, full-width with `margin: 0 16px 80px 16px` (clears bottom nav bar) | `calc(100vw - 32px)` |

The extra bottom margin on mobile (`80px`) ensures toasts appear above the bottom navigation bar.

---

## 7. Tailwind CSS Breakpoint Configuration

**File: `tailwind.config.ts`**

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    screens: {
      // Daimon custom breakpoints
      'sm': '640px',   // Fine-grained adjustments (pagination, footer, etc.)
      'md': '768px',   // Standard tablet breakpoint — sidebar collapses
      'lg': '1024px',  // Admin panel minimum / wider tablet
      'xl': '1280px',  // Standard desktop — sidebar full, multi-column layouts
    },
    extend: {
      // All other theme extensions (colors, fonts, spacing) are defined in design-system.md
    },
  },
  plugins: [],
}

export default config
```

**Key Tailwind classes used per breakpoint:**

| Pattern | Mobile default | md: (768px) | xl: (1280px) |
|---------|---------------|------------|-------------|
| Page padding | `p-4` | `p-6` | `p-8` |
| Grid columns (dashboard cards) | `grid-cols-1` | `grid-cols-1` | `grid-cols-[3fr_2fr]` |
| Grid columns (stats) | `grid-cols-1` | `grid-cols-2` | `grid-cols-3` |
| Grid columns (plan comparison) | `grid-cols-1` | `grid-cols-2` | `grid-cols-3` |
| Grid columns (service cards) | `grid-cols-1` | `grid-cols-2` | `grid-cols-2` |
| Grid columns (feature cards) | `grid-cols-1` | `grid-cols-2` | `grid-cols-3` |
| Sidebar margin | `ml-0` | `ml-14` (56px) | `ml-60` (240px) |
| Bottom padding (clears nav bar) | `pb-[72px]` | `pb-0` | `pb-0` |
| Nav links visibility | `hidden` | `hidden` | `flex` |
| Hamburger visibility | `flex` | `flex` | `hidden` |
| Bottom nav visibility | `flex` | `hidden` | `hidden` |

---

## 8. Viewport Meta Tag and Zoom Behavior

**File: `app/layout.tsx`** — root layout must include:

```tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  // ...other metadata
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,   // Allow user zoom up to 5× (accessibility requirement)
    userScalable: true,
  },
}
```

> **Do NOT use `user-scalable=no` or `maximum-scale=1`.** WCAG 1.4.4 (Resize Text) requires that users be able to zoom to 200% without loss of content or functionality. Setting `user-scalable=no` violates WCAG 2.1 Level AA.

**Content reflow at 200% zoom (mobile):**
- All text content must reflow to a single column at 200% zoom on a 375px device (effective 187px viewport width)
- Fixed-width elements must not overflow: Use `max-width: 100%` on images, tables, and code blocks
- The only acceptable horizontal scroll elements at 200% zoom: data tables and code blocks (wrapped in `overflow-x: auto` containers)

---

## Summary: Responsive Decisions by Page

| Page | Mobile nav | Mobile layout | Tablet layout | Desktop layout |
|------|-----------|---------------|---------------|----------------|
| Landing | Hamburger slide-over | Single column | Two column (some sections) | Multi-column |
| Login / Signup / Reset | N/A | Card fills screen | Card fills screen | Centered card 440px |
| Dashboard | Bottom bar | Single column | Sidebar 56px + two cols for some | Sidebar 240px + multi-col |
| Integrations | Bottom bar | Single column cards | Two column cards | Two column cards |
| Billing | Bottom bar | Single column | Two column plans | Three column plans |
| Settings | Bottom bar | Stacked form rows | Icon sidebar + horizontal rows | Full sidebar + horizontal rows |
| Admin | Blocked | Blocked (`< 1024px`) | Blocked (`< 1024px`) | Full admin UI |
| Docs | Hamburger slide-over | Full-width content | Horizontal tab bar | Sidebar + content + TOC |
