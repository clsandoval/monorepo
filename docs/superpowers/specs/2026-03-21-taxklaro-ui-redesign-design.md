# TaxKlaro UI Redesign — Design Spec

**Date:** 2026-03-21
**Status:** Draft
**Scope:** Complete frontend UI overhaul — visual language, layout, wizard, results, all pages

## Problem

The current TaxKlaro UI has three core issues:
1. **Visual clutter** — too many boxes, borders, shadows, competing elements
2. **Wizard friction** — 17 granular steps feels slow and tedious
3. **Overwhelming results** — hard to find the answer in a wall of data

## Design Direction

**Focused Flow** — Linear/Vercel-inspired monochrome minimalism. No sidebar. Minimal top bar. Single centered content column. Get in, compute, get out.

## Visual Foundation

### Color Palette

Dark-first, Tailwind Zinc scale. No brand accent — the monochrome is the brand.

| Token | Value | Usage |
|-------|-------|-------|
| Background | `#09090B` (zinc-950) | Page background |
| Foreground | `#FAFAFA` (zinc-50) | Primary text |
| Card/Surface | `#18181B` (zinc-900) | Elevated surfaces, rows |
| Border | `#27272A` (zinc-800) | Borders, dividers |
| Muted text | `#A1A1AA` (zinc-400) | Secondary text, labels |
| Savings/Good | `#22C55E` (green-500) | Recommended regime, savings amounts |
| Due/Warning | `#EF4444` (red-500) | Tax due highlights, deadline urgency |

Light mode is out of scope for this redesign. Dark only.

### Typography

Single font family: **Inter**. No decorative/serif fonts. Hierarchy through weight and size only.

| Role | Size | Weight | Notes |
|------|------|--------|-------|
| Hero number | 52px | 700 | `font-variant-numeric: tabular-nums; letter-spacing: -0.02em` |
| Page heading | 24px | 600 | |
| Section heading | 18px | 600 | |
| Section label | 13px | 500 | `text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.4` |
| Body | 14px | 400 | |
| Small/meta | 12px | 400 | `opacity: 0.4` for tertiary info |

### Spacing & Layout

- Form pages use a centered column: `max-width: 560px` with `padding: 40px 24px`
- Results and detail pages use a wider column: `max-width: 720px` to accommodate tables
- No cards wrapping forms — fields sit directly on the background
- Sections separated by `1px` borders (`border-color: zinc-800`) or `gap: 1-2px` for stacked rows
- Border radius: `6px` for inputs, rows, buttons. `999px` for pills/badges only.
- No shadows. Elevation through subtle background color difference only (`zinc-900` on `zinc-950`).

## App Shell

### Navigation

Thin top bar replacing the current sidebar:
- **Left:** Logo text ("TaxKlaro", font-weight 700) + flat text nav links (Computations, Clients, Deadlines, Settings)
- **Right:** User email (13px, muted) + avatar circle (28px)
- **Active state:** Full opacity on active link, 0.5 opacity on inactive
- **Mobile:** Nav links collapse to a hamburger menu (Sheet)
- **Height:** ~48px, `border-bottom: 1px solid zinc-800`, `background: rgba(255,255,255,0.02)`

### No sidebar, no dashboard

- The sidebar is removed entirely
- The dashboard page is removed — computations list is the authenticated home page
- One fewer click to reach the primary task

## Wizard → Consolidated Form

### Section Grouping

17 wizard steps consolidated into 5 sections:

| Section | Name | Former Steps | Fields |
|---------|------|-------------|--------|
| 1 | Taxpayer Profile | WS-00, WS-01, WS-02 | Mode (self/client), name, business type |
| 2 | Period & Income | WS-03, WS-04, WS-05 | Tax year, filing period, gross receipts, compensation (if mixed income) |
| 3 | Deductions & Expenses | WS-06, WS-07A/B/C/D | Expense method (OSD/itemized), itemized details, NOLCO |
| 4 | Tax Credits & Payments | WS-08, WS-09, WS-13 | CWT/Form 2307, prior quarterly payments, prior-year credits |
| 5 | Regime & Filing | WS-10, WS-11, WS-12 | Registration details, 8% eligibility, regime selection, filing details |

### Form Behavior

- **Single scrollable page** with accordion sections (`type="single"` — only one section open at a time)
- **Completed sections** collapse to a one-line summary (e.g., "Juan Dela Cruz · Sole Prop") with a green check
- **Active section** is expanded showing all fields
- **Upcoming sections** show title only, dimmed (opacity 0.3)
- **Click any section** to expand it (closes the current open section). Completed sections can be re-opened for editing.
- **Progress bar:** Thin 5-segment line at the top of the form. Fills left-to-right as sections complete. Not sticky.
- **Conditional fields** appear/disappear within sections (e.g., compensation fields only if "Mixed Income" selected). All 5 sections are always visible — no section-level hiding.
- **No review step.** The collapsed summary lines serve as the review. Scan them, then hit "Compute Tax."
- **Compute button:** Always visible at the bottom, disabled (opacity 0.3) until all required fields are filled. Single button: "Compute Tax" (white on black when active).
- **Auto-save:** Keeps 1500ms debounce. Indicator becomes a subtle dot in the top bar (green = saved, amber = saving, red = error). No banner or text.

### Validation

- Inline validation on blur, same as current (zod schemas unchanged)
- Error state: red border on input + error message below in red-500
- Section-level: if a completed section has validation errors after editing, the check reverts to an error indicator

## Results View

### Layout

Centered column at `max-width: 720px` (wider than form to accommodate tables).

1. **Hero number** — centered, 52px bold: "₱42,350.00" with label above ("Total Tax Due", uppercase, muted)
2. **Recommendation pill** — green badge below hero: "Graduated rates recommended · saves ₱18,200"
3. **Regime comparison** — always visible, compact two-row block:
   - Recommended regime: green-tinted row with green dot, amount + effective rate
   - Alternative regime: neutral row, muted text
4. **Detail sections** — stacked collapsible rows, all collapsed by default:
   - Tax Breakdown (includes income tax computation steps + percentage tax summary)
   - Quarterly Installments
   - Balance Payable
   - Penalties & Surcharges
   - BIR Form Recommendation
   - Manual Review Flags (only shown if flags exist — amber tint, similar to warnings)
   - Regime Detail (path detail accordion content — expanded breakdown per regime)
5. **Actions bar** — three equal buttons: Download PDF, Share Link, Edit Inputs
6. **Warnings** — if present (late filing, etc.), amber banner above the hero number. Warnings must be seen, not hidden.

### Detail Section Content

When expanded, each section shows the same data as today's result components, just restyled to match the new visual language:
- Monochrome tables with subtle row alternation
- Peso amounts right-aligned with tabular-nums
- Section collapses back on click

## Remaining Pages

### Computations List (Home)

- Page heading "Computations" + "+ New" button (white bg, dark text)
- Stacked rows: client name + period on first line, regime + amount + date on second line (muted)
- Click row to open computation detail
- Computation detail page has two tabs: Input (flat wizard form) and Results. Tabs styled as underline tabs (text + 2px bottom border on active, muted text on inactive). Sits below the page heading.

### Clients List

- Same pattern: heading + "+ Add Client" button + stacked rows
- Rows: client name, business type + computation count
- Client detail: client info card + list of their computations

### Deadlines

- Heading + stacked rows
- Each row: deadline name, unfiled/pending count, date
- Upcoming deadlines with red tint on row background + red date text
- Future deadlines neutral

### Settings

- Single scrollable page, stacked form sections
- Personal settings, team members, firm branding
- No tabs — just scroll

### Landing / Auth

- Centered vertically and horizontally
- Logo text (28px, bold), one-line description (14px, muted), sign-in form below
- Form: email input, password input, "Sign In" button (white bg), "Sign up" link
- No marketing content, no feature lists, no hero images
- **Password reset pages** (`/auth/reset`, `/auth/reset-confirm`): Same centered layout. Single input (email or new password) + submit button. Minimal copy.
- **Auth callback** (`/auth/callback`): Redirect-only route. Shows a centered spinner during redirect, no other UI.

### Invite Page (`/invite/$token`)

- Public page (no top bar nav)
- Minimal header: "TaxKlaro" logo + "Team Invite" label
- Centered card: org name, inviter name, "Accept Invite" button (white bg) + "Decline" text link
- Error/expired states: same centered layout with message text
- On accept → redirect to `/computations`

### Add Client (`/clients/new`)

- Same centered column as other form pages
- Simple stacked form: client name, business type, TIN, contact info
- "Save Client" button at bottom
- On save → redirect to client detail page

### Onboarding

- Same centered column as wizard
- Firm setup fields in a simple stacked form
- Complete → redirect to computations list

### Share Page (Public)

- Same results layout but read-only
- No top bar nav (not authenticated)
- Minimal header: "TaxKlaro" logo + "Shared Computation" label
- No Edit Inputs button in actions bar

### Quarterly View

- The dedicated `/computations/$compId/quarterly` route is removed
- Quarterly installment data is folded into the "Quarterly Installments" collapsible section in the results view
- If more detail is needed, the section expands to show the full quarterly breakdown inline

## States

### Loading

- Page-level loading: centered spinner (16px, zinc-400, CSS animation) with no text
- List loading: 3 skeleton rows (zinc-900 shimmer on zinc-950 background, 200ms stagger)
- Form loading: skeleton placeholders matching input heights
- Computation in progress: "Compute Tax" button shows inline spinner, stays disabled

### Empty

- **Computations list (zero):** Centered message: "No computations yet" (muted) + prominent "+ New Computation" button
- **Clients list (zero):** "No clients yet" + "+ Add Client" button
- **Deadlines (none upcoming):** "No upcoming deadlines" (muted text, no action button)
- All empty states use the same pattern: centered text + optional CTA, no illustrations or icons

### Error

- **Page-level error:** Centered message: "Something went wrong" + "Try again" button (outline style). Muted description below if available.
- **Network/computation error:** Same pattern but with specific message ("Couldn't load computation", "Computation failed")
- **Form validation errors:** Handled inline per field (red border + message)
- **Dialogs (delete confirmation, etc.):** Dark surface (zinc-900), border (zinc-800). Destructive action button in red-500 bg. Cancel button in outline style.

### Animations

- **Accordion open/close:** 200ms ease-out height transition (shadcn Accordion default)
- **Progress bar fill:** 300ms ease-out width transition
- **Page transitions:** None — instant route changes
- **No other animations.** No hover lifts, no entrance animations, no scale effects. Static and fast.

## Accessibility & Keyboard

- Tab order follows visual order: top bar nav → form sections top-to-bottom → compute button
- Accordion sections are keyboard navigable (Enter/Space to toggle)
- Focus ring: 2px offset, zinc-400 outline on all interactive elements
- All form inputs have associated labels (explicit `<label>` or `aria-label`)
- Results detail sections use `<button>` for expand/collapse triggers with `aria-expanded`

## Organization Context

- Top bar shows org name next to user avatar (if user belongs to an org): "Firm Name · carlos@firm.com"
- No org switcher (single org per account in current data model)
- Team management stays in Settings page as a scrollable section

## Tech Stack

- **Keep:** Tailwind CSS v4, shadcn/Radix primitives, TanStack Router, react-hook-form, zod, lucide-react
- **Restyle:** shadcn components get new theme tokens. No structural replacement needed.
- **Replace font:** DM Sans / DM Serif Display → Inter (via `@fontsource-variable/inter`)
- **Remove:** DM Serif Display font dependency
- **Unchanged:** WASM engine, Supabase integration, auto-save hook, PDF generation, Sentry, all business logic

## What's NOT Changing

- Route structure (paths stay the same, just `/dashboard` redirects to `/computations`, `/computations/$compId/quarterly` removed)
- Data model, types, schemas, zod validation
- WASM tax engine integration
- Supabase auth flow, database queries
- Auto-save debounce logic
- PDF generation (@react-pdf)
- Share token system
- Wizard routing logic (`computeActiveSteps()`) — still used for conditional field visibility within sections

## Migration Notes

- This is a visual overhaul, not a rewrite. Component structure can be refactored but business logic hooks and lib/ files stay as-is.
- The 5-section grouping is a UI concern — the underlying `WizardFormData` type with 14 step fields remains. Sections just group which fields are shown together.
- `computeActiveSteps()` still determines which fields are active — it just maps to "which fields show within a section" instead of "which page to show."
- WS-10 (Registration) moved to Section 5 (Regime & Filing) because registration fields may depend on business type and income data from earlier sections. Verify `computeActiveSteps()` dependencies work with this ordering.
- E2E tests will need significant rework — the 17-page wizard → accordion transformation changes the interaction model fundamentally (no more next/back navigation, section expand/collapse instead). Plan for near-complete E2E rewrite, not just selector updates.
- The quarterly route removal means any deep links to `/computations/$compId/quarterly` should redirect to `/computations/$compId` (results tab, Quarterly Installments section).
