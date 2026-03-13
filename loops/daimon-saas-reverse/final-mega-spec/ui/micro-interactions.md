# Micro-Interactions, Transitions & Animation — Complete Specification

> File: `final-mega-spec/ui/micro-interactions.md`
> Last updated: 2026-03-13
> Cross-references:
>   - Component library: [../frontend/component-library.md](../frontend/component-library.md)
>   - Brand guidelines: [../source/brand-guidelines.md](../source/brand-guidelines.md)
>   - Loading/empty states: [../frontend/loading-and-empty-states.md](../frontend/loading-and-empty-states.md)
>   - Error states: [../frontend/error-states.md](../frontend/error-states.md)

---

## Overview

This document specifies every micro-interaction and animation in the Daimon SaaS website — from button hovers to page navigation loading bars to real-time status transitions. Each specification is concrete and implementation-ready. A developer reading this file plus `component-library.md` should never need to make a judgment call about animation timing or behavior.

**Design principles:**
- Animations serve feedback, not decoration. Every animation communicates state.
- Duration is proportional to distance and importance: 100–150ms for tiny hover state changes; 200–300ms for component enter/exit; never more than 400ms for single transitions.
- Easing: `ease` for hover state changes; `cubic-bezier(0.22, 1, 0.36, 1)` (overshoot decelerate) for element enters; `ease-in` for element exits.
- PyMC brand rule: zero border-radius everywhere — no "rounded" animation artifacts.
- Respect `prefers-reduced-motion` — all decorative animations disabled; functional feedback (button loading state, form validation) remains.

---

## 1. Global Animation Token System

These CSS custom properties are defined in `app/globals.css` and used throughout the application. Tailwind classes reference these via the config.

### 1.1 CSS Custom Properties

```css
/* app/globals.css — Animation token system */
:root {
  /* Duration scale */
  --duration-instant:  100ms;   /* Hover state changes on small elements */
  --duration-fast:     150ms;   /* Hover state changes on larger elements, icon swaps */
  --duration-base:     200ms;   /* Standard component state transitions (buttons, borders) */
  --duration-slow:     250ms;   /* Component enter/exit animations (modal backdrop, nav open) */
  --duration-enter:    250ms;   /* Alias for component enter */
  --duration-exit:     200ms;   /* Alias for component exit */
  --duration-collapse: 400ms;   /* Layout changes (checklist fade-out, alert banner dismiss) */

  /* Easing scale */
  --ease-standard:     ease;                          /* Default state changes */
  --ease-enter:        cubic-bezier(0.22, 1, 0.36, 1); /* Element enters (overshoot decelerate) */
  --ease-exit:         ease-in;                       /* Element exits */
  --ease-spring:       cubic-bezier(0.34, 1.56, 0.64, 1); /* Bounce effect (NOT used — for reference only) */

  /* Reduced motion override (MUST be applied to every animation) */
}

@media (prefers-reduced-motion: reduce) {
  :root {
    --duration-instant:  0ms;
    --duration-fast:     0ms;
    --duration-base:     0ms;
    --duration-slow:     0ms;
    --duration-enter:    0ms;
    --duration-exit:     0ms;
    --duration-collapse: 0ms;
  }

  /* Pulse/continuous animations disabled */
  .status-dot-connecting,
  .status-dot-connected-ring,
  .skeleton {
    animation: none !important;
  }
}
```

### 1.2 Tailwind Config Mapping

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  theme: {
    extend: {
      transitionDuration: {
        'instant': '100ms',
        'fast':    '150ms',
        'base':    '200ms',
        'slow':    '250ms',
        'enter':   '250ms',
        'exit':    '200ms',
        'collapse':'400ms',
      },
      transitionTimingFunction: {
        'standard': 'ease',
        'enter':    'cubic-bezier(0.22, 1, 0.36, 1)',
        'exit':     'ease-in',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        'status-pulse': {
          '0%':   { transform: 'scale(1)',   opacity: '0.7' },
          '70%':  { transform: 'scale(2.2)', opacity: '0' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        },
        'status-fade': {
          '0%, 100%': { opacity: '0.4' },
          '50%':      { opacity: '1' },
        },
        'spin': {
          '0%':   { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'progress-drain': {
          '0%':   { width: '100%' },
          '100%': { width: '0%' },
        },
      },
      animation: {
        'shimmer':        'shimmer 1.5s ease-in-out infinite',
        'status-pulse':   'status-pulse 2s infinite ease-out',
        'status-fade':    'status-fade 1.5s infinite ease-in-out',
        'spin':           'spin 1s linear infinite',
        'progress-drain': 'progress-drain linear',  // Duration set inline via style prop
      },
    },
  },
}
```

---

## 2. Page Navigation Loading Bar

Next.js App Router does not natively show a progress indicator during route transitions. Daimon uses a thin top-bar progress indicator (similar to NProgress) implemented via the `next-nprogress-bar` package.

### 2.1 Implementation

**Package:** `next-nprogress-bar` (or equivalent — `nprogress` + custom App Router wrapper)

**File:** `app/layout.tsx` (root layout) — wraps the entire app.

```typescript
// app/layout.tsx
import { AppProgressBar as ProgressBar } from 'next-nprogress-bar'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <ProgressBar
          height="2px"
          color="#B4E7DD"       // Aqua — PyMC primary
          options={{ showSpinner: false }}
          shallowRouting
        />
      </body>
    </html>
  )
}
```

### 2.2 Visual Specification

| Property | Value |
|----------|-------|
| Height | `2px` |
| Color | Aqua (`#B4E7DD`) |
| Position | Fixed, top: 0, left: 0, z-index: 9999 |
| Behavior | Bar starts at 20% immediately, progresses to ~80% while route is loading, completes to 100% when new page renders |
| Spinner | **Disabled** (`showSpinner: false`) |
| Shallow routing | `true` — does NOT trigger for `?` query param changes (used by Stripe success params) |

### 2.3 When It Triggers

| Navigation Type | Bar Shows | Notes |
|----------------|-----------|-------|
| `<Link>` click (App Router) | Yes | `next-nprogress-bar` hooks into Router events |
| `router.push()` | Yes | Same hook |
| `router.replace()` | Yes | Except for shallow param cleanup (e.g., `router.replace('/dashboard/billing')`) |
| Back/forward browser buttons | Yes | History pop events |
| External link | No | New tab/window, not App Router |
| Form submit (server action) | No | Use button `isLoading` state instead |
| Real-time Realtime update | No | No navigation, just state update |

### 2.4 Reduced Motion

When `prefers-reduced-motion` is active, the bar still appears (it serves a functional purpose — showing loading is in progress) but animation is instant: bar jumps to position rather than animating smoothly.

---

## 3. Button Micro-Interactions

**Source of truth:** [../frontend/component-library.md — Section 5.1 Button](../frontend/component-library.md)

All buttons use `transition: all 0.2s ease` (`--duration-base`, `--ease-standard`) on:
- `background-color`
- `color`
- `border-color`
- `opacity`

### 3.1 State Transition Summary

| State | Trigger | Duration | Easing | What Changes |
|-------|---------|----------|--------|--------------|
| Default → Hover | `mouseenter` | `200ms` | `ease` | Background, border-color, text-color per variant |
| Hover → Default | `mouseleave` | `200ms` | `ease` | Reverses above |
| Hover → Active | `mousedown` | `100ms` | `ease` | `filter: brightness(0.93)` applied |
| Active → Hover | `mouseup` | `100ms` | `ease` | `filter: brightness(1)` |
| Default → Focus | Tab key | Instant | — | `outline: 2px solid #B4E7DD; outline-offset: 2px` appears |
| Focus → Default | Tab away or click | Instant | — | Outline removed |
| Default → Loading | `isLoading = true` | Instant | — | Spinner replaces/prepends leftIcon; pointer-events disabled |
| Default → Disabled | `disabled = true` | Instant | — | `opacity: 0.45`; `cursor: not-allowed` |

**Width stability during loading:** When `isLoading` becomes true, the button's dimensions do NOT change. The spinner occupies the space of `leftIcon` (or appears before the label if no leftIcon). This prevents layout shift.

### 3.2 Loading Spinner Animation

```typescript
// LoadingSpinner — spins at 1 revolution per second
// CSS class: animate-spin (Tailwind) = animation: spin 1s linear infinite
// Size: 16px (matches icon size for sm/md buttons); 20px for lg
// Color: currentColor (inherits button text color)
```

**Full LoadingSpinner SVG implementation** — see [../frontend/component-library.md — Button Section](../frontend/component-library.md) (lines 4616–4638).

---

## 4. Sidebar Navigation Micro-Interactions

### 4.1 Nav Item Active State Transition

When the user navigates to a new route, the active nav item changes.

| Property | Value |
|----------|-------|
| Active indicator | `3px left border`, Aqua (`#B4E7DD`) |
| Transition when active changes | Instant (no animation — the old item loses border immediately, new item gains it immediately) |
| Background transition | `200ms ease` — `transparent` → `rgba(255,255,255,0.08)` |
| Text transition | `200ms ease` — `rgba(255,255,255,0.65)` → `#FFFFFF` |

**Rationale for instant active indicator change:** The user clicked a link and navigated. Animating the indicator bar would feel like the page is lagging. The content transition (via `next-nprogress-bar`) provides the navigation feedback.

### 4.2 Nav Item Hover Transition

| Property | Before | After | Duration | Easing |
|----------|--------|-------|----------|--------|
| Background | `transparent` | `rgba(255,255,255,0.06)` | `200ms` | `ease` |
| Text color | `rgba(255,255,255,0.65)` | `#FFFFFF` | `200ms` | `ease` |
| Left border | none | none | — | — |

### 4.3 Sidebar Collapse Animation (Tablet 768–1023px)

On tablets, the sidebar collapses from full width (240px) to icon-only width (56px). This is triggered by `window.innerWidth` falling below 1024px — it's a CSS media query change, not a user toggle.

| Property | Value |
|----------|-------|
| Transition | `width 250ms cubic-bezier(0.22, 1, 0.36, 1)` |
| From | `240px` |
| To | `56px` |
| Label visibility | Nav item labels fade out: `opacity: 0, width: 0` with `150ms ease` |
| Main content offset | `ml-[56px]` — transitions simultaneously: `margin-left 250ms cubic-bezier(0.22, 1, 0.36, 1)` |

**Collapsed sidebar shows:** Icons only (20px), centered. Tooltips appear on hover (see Section 14 — Tooltips). Logo becomes icon-only (24px rocket icon, centered).

**Tooltip on collapsed sidebar icon hover:**
- Appears after 300ms hover delay
- Position: right of icon, offset 8px
- Content: nav item label (e.g., "Integrations")
- Style: dark tooltip (Navy background, White text, 11px Inter, `4px 8px` padding, 0 border-radius, box-shadow `0 2px 8px rgba(12,31,64,0.20)`)
- Enter animation: `opacity: 0 → 1`, `translateX(-4px) → translateX(0)`, `150ms ease`
- Exit animation: `opacity: 1 → 0`, `100ms ease-in`

### 4.4 Mobile Nav Overlay Animation

**File:** `components/layout/MobileNav.tsx`

The MobileNav is an off-canvas panel that slides in from the left on mobile (<768px).

| Event | Animation | Duration | Easing |
|-------|-----------|----------|--------|
| Hamburger click (open) | Panel slides in from left: `translateX(-100%)` → `translateX(0)` | `250ms` | `cubic-bezier(0.22, 1, 0.36, 1)` |
| Close button or backdrop click (close) | Panel slides out to left: `translateX(0)` → `translateX(-100%)` | `200ms` | `ease-in` |
| Backdrop appear | `opacity: 0` → `rgba(12,31,64,0.55)` | `200ms` | `ease` |
| Backdrop disappear | `opacity: rgba(12,31,64,0.55)` → `0` | `200ms` | `ease` |

**Scroll lock:** When MobileNav is open, `document.body` gets `overflow: hidden`.

**Nav item tap feedback:** On mobile, tapping a nav item shows an immediate background flash (`rgba(255,255,255,0.12)`, 100ms ease) before navigating.

---

## 5. Form Field Micro-Interactions

**Source of truth:** [../frontend/component-library.md — Section 2 Form Components](../frontend/component-library.md)

### 5.1 FormInput Focus Transition

| Property | Default | Focus | Duration | Easing |
|----------|---------|-------|----------|--------|
| Border width | `1px` | `1.5px` | Instant (border-width change) | — |
| Border color | `rgba(12,31,64,0.20)` | Navy (`#0C1F40`) | `150ms` | `ease` |
| Box-shadow | None | `0 0 0 3px rgba(180,231,221,0.30)` | `150ms` | `ease` |

**CSS transition declaration:**
```css
.form-input {
  transition: border-color 150ms ease, box-shadow 150ms ease;
}
```

### 5.2 FormInput Error State Transition

When a validation error is shown (after form submit or on-blur with value):

| Property | Valid State | Error State | Duration | Easing |
|----------|------------|-------------|----------|--------|
| Border color | `rgba(12,31,64,0.20)` (default) or Navy (focus) | `#EF4444` | `150ms` | `ease` |
| Box-shadow (when focused) | `0 0 0 3px rgba(180,231,221,0.30)` | `0 0 0 3px rgba(239,68,68,0.15)` | `150ms` | `ease` |
| Error message appearance | Hidden | Visible (`opacity: 0` → `1`, slide down `4px` → `0`) | `150ms` | `ease` |

**Error message animation:**
```css
.field-error {
  animation: fieldErrorAppear 150ms ease forwards;
}

@keyframes fieldErrorAppear {
  from { opacity: 0; transform: translateY(-4px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

When error is cleared (field becomes valid): error message fades out `opacity: 1 → 0, 100ms ease-in`, then `display: none`.

### 5.3 PasswordInput Eye Toggle Transition

When the user clicks the eye icon to toggle password visibility:

| Property | Value |
|----------|-------|
| Icon swap | `EyeIcon` ↔ `EyeOffIcon` — instant swap, no cross-fade |
| `type` attribute change | `password` → `text` (or reverse) — instant |
| Button color transition | `rgba(12,31,64,0.40)` → hover: `rgba(12,31,64,0.80)`, `150ms ease` |

### 5.4 PasswordStrengthBar Animation

The strength bar under password inputs animates as the user types.

| Property | Value |
|----------|-------|
| Width transition | `width 300ms ease` — bar width animates to new percentage as score changes |
| Color transition | `background-color 300ms ease` — smoothly changes between strength levels |
| Score 0 (empty) | Width: 0%, color: transparent |
| Score 1 (weak) | Width: 25%, color: `#EF4444` (red) |
| Score 2 (fair) | Width: 50%, color: `#F59E0B` (amber) |
| Score 3 (good) | Width: 75%, color: `#22C55E` (green, lighter shade) |
| Score 4 (strong) | Width: 100%, color: `#16A34A` (green, stronger) |

### 5.5 Toggle (Switch) Thumb Animation

The Toggle component uses a sliding thumb animation.

| Property | Off → On | On → Off | Duration | Easing |
|----------|----------|----------|----------|--------|
| Thumb `translateX` | `0px` → `20px` | `20px` → `0px` | `200ms` | `ease` |
| Track background | `rgba(12,31,64,0.20)` → Aqua `#B4E7DD` | Aqua → `rgba(12,31,64,0.20)` | `200ms` | `ease` |

**CSS transition declaration:**
```css
.toggle-track {
  transition: background-color 200ms ease;
}
.toggle-thumb {
  transition: transform 200ms ease;
}
```

### 5.6 Checkbox Check Animation

When the user checks a checkbox:

| State | Animation |
|-------|-----------|
| Unchecked → Checked | Background fills to Navy (`200ms ease`); white checkmark SVG path `stroke-dasharray` animates from 0 to full length (`150ms ease-in`) |
| Checked → Unchecked | Checkmark disappears instantly; background drains to white (`150ms ease`) |

**Stroke-dasharray animation for checkmark:**
```css
.checkbox-checkmark {
  stroke-dasharray: 24;
  stroke-dashoffset: 24;
  transition: stroke-dashoffset 150ms ease-in;
}
.checkbox-input:checked ~ .checkbox-box .checkbox-checkmark {
  stroke-dashoffset: 0;
}
```

### 5.7 ApiKeyInput Validation Badge Transition

When an API key is being validated (async validation call):

| Phase | Badge Display | Duration |
|-------|--------------|----------|
| User is typing | No badge | — |
| 500ms after last keystroke | Validation starts: `ApiKeyValidationBadge` shows "Validating…" with `Loader2` spinner (`16px`, amber `#D97706`) | Instant appear |
| Valid result received | Badge transitions to "Valid" (green `#16A34A`, `CheckCircle` icon) | `150ms ease` cross-fade |
| Invalid result received | Badge transitions to "Invalid" (red `#EF4444`, `XCircle` icon) | `150ms ease` cross-fade |

**Badge appear/disappear animation:**
```css
.api-key-validation-badge {
  animation: fadeIn 150ms ease;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
```

---

## 6. Status Indicator Animations

**Source of truth:** [../frontend/component-library.md — Section 4.2 StatusIndicator](../frontend/component-library.md)

### 6.1 Connected State — Pulse Ring

```css
@keyframes status-pulse {
  0%   { transform: scale(1);   opacity: 0.7; }
  70%  { transform: scale(2.2); opacity: 0; }
  100% { transform: scale(2.2); opacity: 0; }
}

.status-dot-connected-ring {
  animation: status-pulse 2s infinite ease-out;
  background: #B4E7DD;  /* Aqua */
  /* positioned as ::after pseudo-element behind the dot */
}
```

The ring radiates outward from the center of the dot, creating a "heartbeat" effect that communicates active, live connectivity.

### 6.2 Connecting State — Fade Oscillation

```css
@keyframes status-dot-connecting-fade {
  0%, 100% { opacity: 0.4; }
  50%       { opacity: 1; }
}

.status-dot-connecting {
  animation: status-dot-connecting-fade 1.5s infinite ease-in-out;
  background: #F59E0B;  /* Amber */
}
```

The dot pulsates in brightness to communicate "trying to connect" — not static, not definitively online.

### 6.3 Status Change Transition (Real-Time)

When the bot status changes via Supabase Realtime (e.g., `disconnected` → `connecting` → `connected`):

| Change | Visual Transition |
|--------|-----------------|
| Any status → different status | Dot color cross-fades: `background-color 300ms ease` |
| Label text changes | Fade out old text + fade in new text: `opacity 150ms ease` (cross-fade pattern with absolute positioning) |
| Ring animation start | Begins `2s` after `connected` state is set (delayed start prevents jarring immediate pulse) |
| Ring animation stop | When status changes away from `connected`, ring's animation-iteration-count completes current cycle then stops |

---

## 7. Onboarding Checklist Animations

### 7.1 Progress Bar Width Transition

```css
.onboarding-progress-fill {
  transition: width 400ms ease;
}
```

When a checklist step is completed (detected via Realtime update to `discord_connections`):
- Progress bar fill width animates from `(n/4) * 100%` to `((n+1)/4) * 100%` over `400ms ease`.
- The text label above ("Step 2 of 4") updates immediately (no animation).

### 7.2 Step Row Completion Animation

When an individual step is completed:

| Phase | Animation |
|-------|-----------|
| Step was incomplete (circle outline icon) | Immediate: circle icon → check circle icon (`CheckCircle`, Lucide, 20px, Aqua `#B4E7DD`) |
| Step title text | `color: rgba(12,31,64,0.45)` → `color: rgba(12,31,64,0.45)` (already dimmed); text decoration: `line-through` adds with `200ms ease` |
| Row background | Subtle flash: `rgba(180,231,221,0.10)` for `300ms`, then fades out |

### 7.3 Checklist Completion Sequence

When all 4 steps are completed (triggered by bot status changing to `connected` via Realtime):

```
T+0ms:    All step icons show CheckCircle, progress bar reaches 100%
T+1500ms: Entire checklist card begins fade-out:
           opacity: 1 → 0 (400ms ease)
           height: current → 0 (400ms ease, overflow: hidden)
           margin-bottom: 24px → 0 (400ms ease)
T+1900ms: Animation completes, component unmounts from DOM
T+1900ms: Success toast appears: "Your bot is online! Daimon is now active in your Discord server."
           variant: 'success', duration: 6000ms
```

**Implementation note:** The fade-out uses a CSS class `.checklist-completing` toggled at T+1500ms via a `setTimeout`. The class applies the transition. After transition ends (via `transitionend` event), the component sets `visible: false` to unmount.

---

## 8. Dashboard Real-Time Status Transitions

The Bot Status Card receives Supabase Realtime updates. When `discord_connections` row changes, the card transitions between states.

### 8.1 Status Change Cross-Fade

| Property | Transition |
|----------|-----------|
| StatusIndicator dot color | `background-color 300ms ease` |
| Status label text | Text swaps with cross-fade: old text `opacity: 1 → 0` (150ms), new text `opacity: 0 → 1` (150ms, starts after old fades) |
| Status sub-label/description | Same cross-fade pattern as label |
| Error message (appears/disappears) | Appear: `opacity: 0 → 1, translateY: -4px → 0, 200ms ease`. Disappear: `opacity: 1 → 0, 150ms ease-in` |

### 8.2 `connected` → `disconnected` Transition (Bot Goes Offline)

```
T+0ms:    Realtime event received: status = 'error' or status = 'disconnected'
T+0ms:    StatusIndicator transitions: green pulse → red dot (300ms color transition)
T+0ms:    Status label cross-fades from "Connected" to "Offline" / "Error"
T+0ms:    Error message block fades in if error_message is set
T+500ms:  Toast appears: "Bot went offline — Check the integrations page for details."
           variant: 'error', duration: 0 (persistent — user must dismiss)
```

### 8.3 `disconnected` → `connecting` Transition (Bot Reconnecting)

```
T+0ms:    Realtime event received: status = 'connecting'
T+0ms:    StatusIndicator transitions: red → amber fading dot
T+0ms:    Status label cross-fades to "Connecting…"
T+0ms:    Toast appears: "Bot reconnecting…"
           variant: 'info', duration: 4000ms
```

### 8.4 `connecting` → `connected` Transition (Bot Comes Online)

```
T+0ms:    Realtime event received: status = 'connected'
T+0ms:    StatusIndicator transitions: amber fading → green pulsing
T+300ms:  Toast appears: "Bot is online"
           variant: 'success', duration: 4000ms
```

---

## 9. Dropdown Menu Animations

**Source of truth:** [../frontend/component-library.md — Section 5.4 DropdownMenu](../frontend/component-library.md)

### 9.1 Open Animation

```css
/* Panel enter */
@keyframes dropdownEnter {
  from { opacity: 0; transform: translateY(-4px); }
  to   { opacity: 1; transform: translateY(0); }
}

.dropdown-panel[data-state="open"] {
  animation: dropdownEnter 150ms ease-out;
}
```

| Property | From | To | Duration | Easing |
|----------|------|-----|----------|--------|
| Opacity | `0` | `1` | `150ms` | `ease-out` |
| TranslateY | `-4px` | `0` | `150ms` | `ease-out` |

### 9.2 Close Animation

```css
/* Panel exit */
@keyframes dropdownExit {
  from { opacity: 1; }
  to   { opacity: 0; }
}

.dropdown-panel[data-state="closed"] {
  animation: dropdownExit 100ms ease-in;
}
```

| Property | From | To | Duration | Easing |
|----------|------|-----|----------|--------|
| Opacity | `1` | `0` | `100ms` | `ease-in` |

**Note:** Radix UI's `DropdownMenu.Content` handles the `data-state="open|closed"` attribute automatically. The CSS above applies to those states.

### 9.3 Item Hover Transition

```css
.dropdown-item {
  transition: background-color 100ms ease;
}
```

| State | Background | Duration |
|-------|-----------|----------|
| Default | Transparent | — |
| Hover | `rgba(12,31,64,0.05)` | `100ms ease` |
| Focus (keyboard) | `rgba(180,231,221,0.20)` | Instant |

---

## 10. Modal & ConfirmDialog Animations

**Source of truth:** [../frontend/component-library.md — Sections 3.3 ConfirmDialog and 3.4 Modal](../frontend/component-library.md)

### 10.1 Backdrop Animation

| State | Animation |
|-------|-----------|
| Enter | `opacity: 0 → rgba(12,31,64,0.55)`, `150ms ease` |
| Exit | `opacity: rgba(12,31,64,0.55) → 0`, `150ms ease-in` |

**Backdrop filter:** `blur(4px)` — applied instantly (no transition on blur, to avoid visual artifacts in Safari).

### 10.2 Dialog/Modal Panel Animation

| State | Animation |
|-------|-----------|
| Enter | `scale(0.96) opacity(0)` → `scale(1) opacity(1)`, `200ms cubic-bezier(0.22, 1, 0.36, 1)` |
| Exit | `scale(1) opacity(1)` → `scale(0.96) opacity(0)`, `150ms ease-in` |

**Scroll lock:** `document.body` gets `overflow: hidden` when any modal/dialog is open. Restored on close.

**Focus management:**
- **ConfirmDialog:** Focus moves to `CancelButton` on open (safe default — not destructive)
- **Modal:** Focus moves to first focusable element in `ModalBody`, or `CloseButton` as fallback

### 10.3 ConfirmDialog Loading State

When `onConfirm` returns a Promise:
- Confirm button immediately shows `Loader2` spinner + `opacity: 0.75` (no animation on the opacity — instant)
- Cancel button disabled instantly
- Backdrop becomes non-interactive (but still visible)
- On Promise resolve: dialog calls `onOpenChange(false)` → exit animation plays

---

## 11. Toast Animations

**Source of truth:** [../frontend/component-library.md — Section 3.2 Toast](../frontend/component-library.md)

Summary of toast animations (full spec in component-library.md):

| State | Animation | Duration | Easing |
|-------|-----------|----------|--------|
| Enter | Slide in from right (`translateX(calc(100% + 24px)) → 0`) + fade in (`opacity: 0 → 1`) | `250ms` | `cubic-bezier(0.22, 1, 0.36, 1)` |
| Exit (dismiss) | Slide out right + fade out | `200ms` | `ease-in` |
| Stack reflow | Remaining toasts shift: `transform 200ms ease` | `200ms` | `ease` |

**Progress bar:** Horizontal bar at toast bottom, drains from 100% → 0% over the toast's `duration` ms. Pauses on hover.

**Complete toast trigger inventory** is in [../frontend/component-library.md — Section 3.2 Toast Complete Trigger Inventory](../frontend/component-library.md).

---

## 12. Skeleton Loader Animations

**Source of truth:** [../frontend/loading-and-empty-states.md](../frontend/loading-and-empty-states.md)

All skeleton blocks use the `.skeleton` CSS class:

```css
@keyframes shimmer {
  0%:   { background-position: -200% center; }
  100%: { background-position:  200% center; }
}

.skeleton {
  background: linear-gradient(
    90deg,
    rgba(12, 31, 64, 0.04) 25%,
    rgba(12, 31, 64, 0.08) 50%,
    rgba(12, 31, 64, 0.04) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: 0px;
}
```

**Skeleton → Content transition:**
When server component resolves and content replaces skeleton (Next.js streaming SSR):
- This is handled by Next.js automatically via Suspense. The `loading.tsx` skeleton is unmounted and the page content is inserted. No explicit transition — the switch is instant.
- **Why no fade:** Adding a fade-in on every page load would introduce noticeable delay. The skeleton already provides context so the switch is not jarring.

---

## 13. Alert Banner Dismiss Animation

**Source of truth:** [../frontend/component-library.md — Section 3.1 AlertBanner](../frontend/component-library.md)

When a dismissible `AlertBanner` is dismissed (user clicks X button):

```css
.alert-banner-dismissing {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
  overflow: hidden;
  transition:
    opacity 200ms ease-in,
    max-height 200ms ease-in,
    padding 200ms ease-in;
}
```

| Phase | Value | Duration |
|-------|-------|----------|
| T+0ms | `opacity: 1 → 0`, `max-height: current → 0`, `padding: current → 0` | `200ms ease-in` |
| T+200ms | Component calls `onDismiss()`, React unmounts component | — |

**Do NOT unmount before animation completes.** The component tracks a `dismissing` boolean state. `onDismiss` is called after the `transitionend` event fires.

---

## 14. Copy Button State Transitions

**Source of truth:** [../frontend/component-library.md — Section 4.7 CopyToClipboard](../frontend/component-library.md)

When a `CopyToClipboard` button is clicked:

| Phase | Duration | Icon | Background |
|-------|----------|------|-----------|
| Default state | — | `CopyIcon` (14px, Navy 45%) | Transparent |
| Click → Success (0–2000ms) | Instant swap | `CheckIcon` (14px, green `#22C55E`) | `rgba(34,197,94,0.12)` |
| Success → Default (at 2000ms) | `150ms ease` fade | `CopyIcon` returns | Transparent |
| Click → Error | Instant swap | `XIcon` (14px, red `#EF4444`) | `rgba(239,68,68,0.12)` |
| Error → Default (at 2000ms) | `150ms ease` fade | `CopyIcon` returns | Transparent |

**Icon swap implementation:** Use `AnimatePresence` from Framer Motion or a simple opacity cross-fade:
```tsx
// Two icons, cross-fade between them
<span style={{ transition: 'opacity 150ms ease' }}>
  {state === 'success' ? <CheckIcon /> : state === 'error' ? <XIcon /> : <CopyIcon />}
</span>
```

**No size jump during icon swap:** All three icon sizes are identical (14px or 16px depending on variant) to prevent layout shift.

---

## 15. Table Row Hover

**Source of truth:** [../frontend/component-library.md — Section 4.3 Table](../frontend/component-library.md)

| State | Background | Transition |
|-------|-----------|-----------|
| Default | White (`#FFFFFF`) | — |
| Hover | `rgba(12,31,64,0.025)` | `background-color 100ms ease` |
| Active (mousedown) | `rgba(12,31,64,0.05)` | `background-color 100ms ease` |
| Clickable row | `cursor: pointer` | — |

For clickable rows in the Admin panel (tenant list row click → tenant detail):
- Row hover also shows a subtle right-arrow indicator in the rightmost column: `opacity: 0 → 0.45` on hover (`150ms ease`).

---

## 16. Tabs Active Indicator Transition

**Source of truth:** [../frontend/component-library.md — Section 5.5 Tabs](../frontend/component-library.md)

### 16.1 Underline Variant

The active tab's `2px solid #B4E7DD` bottom border is an `outline`-style border on the tab itself, not a sliding indicator element. When the user clicks a different tab:

| Property | Transition |
|----------|-----------|
| New active tab border-bottom | Appears instantly |
| Old active tab border-bottom | Disappears instantly |
| Tab text color (inactive → active) | `rgba(12,31,64,0.55) → #0C1F40`, `200ms ease` |
| Tab background (hover) | `transparent → rgba(12,31,64,0.04)`, `200ms ease` |

**Rationale for instant border swap:** Sliding underline indicators (using `translateX` on a pseudo-element) require measuring DOM positions and are complex to implement correctly in React. The instant swap is simpler and consistent with the PyMC brand's crisp, sharp style.

### 16.2 Pills Variant

The active pill background switches from transparent to white. Transition:
```css
.tab-pill {
  transition: background-color 150ms ease, border-color 150ms ease, box-shadow 150ms ease;
}
```

---

## 17. Landing Page Animations

### 17.1 Gradient Blob Animations (Hero Section)

The hero section background features two animated blobs (`before:` and `after:` pseudo-elements on the hero container). These are decorative — they must be disabled when `prefers-reduced-motion` is active.

**Blob 1 (left-center):**
```css
@keyframes blob-drift-1 {
  0%   { transform: translate(0, 0)    scale(1); }
  33%  { transform: translate(30px, -20px) scale(1.05); }
  66%  { transform: translate(-20px, 15px) scale(0.98); }
  100% { transform: translate(0, 0)    scale(1); }
}

.hero-blob-1 {
  animation: blob-drift-1 12s ease-in-out infinite;
  background: radial-gradient(circle, rgba(180,231,221,0.35) 0%, transparent 70%);
  width: 600px;
  height: 600px;
  position: absolute;
  top: -100px;
  left: -200px;
  border-radius: 50%; /* Exception to zero-radius rule — blobs are intentionally organic */
}
```

**Blob 2 (right-bottom):**
```css
@keyframes blob-drift-2 {
  0%   { transform: translate(0, 0)     scale(1); }
  33%  { transform: translate(-25px, 20px)  scale(1.03); }
  66%  { transform: translate(20px, -15px) scale(0.97); }
  100% { transform: translate(0, 0)     scale(1); }
}

.hero-blob-2 {
  animation: blob-drift-2 15s ease-in-out infinite;
  background: radial-gradient(circle, rgba(180,231,221,0.20) 0%, transparent 70%);
  width: 500px;
  height: 500px;
  position: absolute;
  bottom: -150px;
  right: -150px;
  border-radius: 50%;
}
```

**Peach Orange blobs (do NOT use):** The PyMC brand deck includes Peach Orange (`#FFAF76`) blob drift animations. For Daimon, **Peach Orange is excluded from all UI** per brand compliance matrix R7 in component-library.md. Use only Aqua/Navy gradient blobs.

### 17.2 Hero CTA Button Pulse

The primary CTA "Get Started Free" button on the landing page has a subtle ring pulse animation to draw attention on initial load. This fires once (not on repeat) when the hero section first renders.

```css
@keyframes ctaPulse {
  0%   { box-shadow: 0 0 0 0   rgba(180,231,221,0.60); }
  70%  { box-shadow: 0 0 0 12px rgba(180,231,221,0); }
  100% { box-shadow: 0 0 0 0   rgba(180,231,221,0); }
}

.hero-cta-primary {
  animation: ctaPulse 1.5s ease-out 1;  /* Fires once after 400ms delay */
  animation-delay: 400ms;
}
```

**Reduced motion:** Animation not applied when `prefers-reduced-motion`.

### 17.3 Section Scroll Reveal Animations

The landing page sections below the hero ("How It Works", "Features", "Pricing") use scroll-triggered fade-in animations via the Intersection Observer API.

**Implementation:**
```typescript
// hooks/useScrollReveal.ts
// Uses IntersectionObserver with threshold: 0.1 (10% visible triggers animation)

const REVEAL_CLASS = 'reveal-visible'

// Applied to section containers:
// Initial state: opacity: 0; transform: translateY(20px)
// After intersection: opacity: 1; transform: translateY(0); transition: 400ms ease
```

**Per-section reveal:**

| Section | Delay | Animation |
|---------|-------|-----------|
| How It Works | 0ms | Container fades in + slides up 20px |
| Feature grid items | 0ms, 80ms, 160ms, 240ms... (stagger per card) | Each card fades in + slides up |
| Pricing cards | 0ms, 100ms, 200ms (stagger per card) | Each card fades in + slides up |
| Integrations strip | 0ms | Strip fades in |
| FAQ items | 0ms, 50ms per item | Each item fades in |
| CTA banner | 0ms | Banner fades in + slides up |

**CSS base styles (before reveal):**
```css
.reveal-section {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 400ms ease, transform 400ms ease;
}

.reveal-section.reveal-visible {
  opacity: 1;
  transform: translateY(0);
}
```

**Reduced motion:** Intersection Observer still fires, but transition duration is 0ms — elements appear instantly.

---

## 18. Service Card Connect/Disconnect Transitions (Integrations Page)

### 18.1 Connect Button → Loading → Connected

When a user initiates a service connection:

**OAuth services (GitHub, Google, Linear):**
```
User clicks "Connect":
  T+0ms:  Button → isLoading=true (spinner appears, button disabled)
  T+0ms:  Modal opens: "Connecting {service}..." (scale-in animation per Section 10.2)
  T+~1s:  Browser redirected to OAuth authorization URL
          (modal stays until redirect fires)
  [OAuth complete, callback received]
  T+0ms:  Page refreshes (router.refresh())
  T+0ms:  ServiceCard updates: button changes to "Disconnect", status badge "CONNECTED"
          Transition: badge appears with opacity: 0 → 1, 200ms ease
  T+200ms: Success toast: "{Service} connected"
```

**API key services (Toggl):**
```
User clicks "Connect" (or already connected):
  T+0ms:  Modal opens (scale-in animation per Section 10.2)
  User enters API key:
  T+0ms:  After 500ms debounce: validation begins
  T+0ms:  Validation badge: "Validating…" (see Section 5.7)
  [Validation complete]
  T+0ms:  Badge transitions to "Valid" or "Invalid"
  User clicks "Save":
  T+0ms:  Save button → isLoading=true
  [Save complete]
  T+0ms:  Modal closes (scale-out animation per Section 10.2)
  T+0ms:  ServiceCard updates: status badge "CONNECTED"
  T+200ms: Success toast: "API key saved — {Service} is now connected."
```

### 18.2 Disconnect Flow

```
User clicks "Disconnect":
  T+0ms:  ConfirmDialog opens (scale-in animation per Section 10.2)
  User clicks "Disconnect" in dialog:
  T+0ms:  Dialog confirm button → isLoading=true
  [DELETE request completes]
  T+0ms:  Dialog closes (scale-out animation)
  T+0ms:  ServiceCard updates: status badge "DISCONNECTED", button reverts to "Connect"
  T+200ms: Success toast: "{Service} disconnected"
```

### 18.3 Service Card Status Badge Transition

When the service card's connected status changes (via page refresh or optimistic update):

```css
.service-status-badge {
  transition: opacity 200ms ease;
}
/* During update: old badge fades out, new badge fades in */
```

The badge variant changes (e.g., `connection-connected` → `connection-disconnected`) do not animate the badge colors directly — instead, the entire badge element cross-fades (opacity 0 → 1 on the new badge).

---

## 19. Billing Page Transitions

### 19.1 API Key Modal Save Flow

When a user saves/updates an API key:
```
User clicks "Save":
  T+0ms:  Save button → isLoading=true (spinner)
  [Edge Function call + Vault write]
  T+0ms:  Modal closes (exit animation, 150ms)
  T+150ms: ApiKeyRow updates: badge changes from "Unconfigured"/"Invalid" → "Valid"
            Badge transition: opacity cross-fade 200ms
  T+200ms: Toast: "API key saved — Your Anthropic key has been stored securely."
```

### 19.2 Plan Toggle (Monthly/Annual)

The billing cycle toggle on the Pricing section of the billing page:

```
User clicks toggle:
  T+0ms:  Toggle switches (200ms thumb slide per Section 5.5)
  T+0ms:  Price display updates: old price fades out (opacity 0, 150ms), new price fades in (opacity 1, 150ms)
          The fade-out and fade-in overlap slightly (cross-fade pattern)
  T+0ms:  Savings badge (annual only) appears/disappears: opacity 0→1 or 1→0, 200ms ease
```

### 19.3 Stripe Checkout Redirect

```
User clicks "Upgrade to Pro":
  T+0ms:  Button → isLoading=true (spinner)
          "Redirecting to checkout…" text replaces button label
  [Server action creates Checkout Session]
  T+~1s:  window.location.href set to Stripe Checkout URL
          (browser navigates — no further Daimon UI)
  [User completes/cancels checkout on Stripe]
  [Stripe redirects to /dashboard/billing?success=1 or ?canceled=1]
  T+0ms:  Page renders with fresh server-side data
  T+300ms: Toast appears based on URL param (success or canceled)
           URL param cleaned via router.replace
```

---

## 20. Settings Page Transitions

### 20.1 Workspace Name Save Flow

```
User edits name, clicks "Save Changes":
  T+0ms:  Save button → isLoading=true
  [PATCH request]
  T+0ms:  Button returns to default
  T+200ms: Toast: "Settings saved"
  T+200ms: Sidebar workspace name (if shown) updates without animation
```

### 20.2 Danger Zone — Delete Workspace Flow

```
User clicks "Delete Workspace":
  T+0ms:  ConfirmDialog opens with typed confirmation input
  User types workspace name exactly:
  T+0ms:  "Delete" confirm button transitions from disabled (opacity 0.45) to enabled
            Transition: opacity 0.45 → 1, 200ms ease
  User clicks "Delete":
  T+0ms:  Confirm button → loading state
  [Sequential deletion: subscriptions → service connections → API keys → discord connections → members → tenant]
  T+0ms:  Dialog closes
  T+0ms:  Supabase sign-out
  T+0ms:  router.push('/') — navigates to landing page
  Landing page: ?deleted=1 query param shows success banner
```

---

## 21. Global Cross-Cutting Transitions

### 21.1 Session Expiry Modal

When a Supabase session expires while the user is on an authenticated page:

```
T+0ms:  onAuthStateChange fires with event 'SIGNED_OUT'
T+0ms:  Session expiry modal opens (scale-in per Section 10.2)
        Title: "Session Expired"
        Body: "Your session has timed out for security. Please sign in again."
        Button: "Sign In" (primary variant)
        No close button — cannot dismiss without signing in
T+0ms:  Any pending form submission is cancelled
[User clicks "Sign In"]
T+0ms:  router.push('/login?expired=1')
T+0ms:  Modal exit animation plays (150ms)
```

### 21.2 Free Plan Gate Modal

When a user on the Free plan attempts to use a Starter/Pro-only feature:

```
T+0ms:  ConfirmDialog opens (variant: 'default')
        Title: "Upgrade required"
        Description: "This feature is available on Starter and above."
        confirmLabel: "Upgrade plan"
        cancelLabel: "Not now"
[User clicks "Upgrade plan"]
T+0ms:  router.push('/dashboard/billing')
T+0ms:  Dialog exits (150ms animation)
```

### 21.3 Network Error Toast

When any `fetch` call fails due to network error (not HTTP error — caught in the catch block):

```
T+0ms:  Button loading state ends (isLoading → false)
T+0ms:  Toast: "Connection error — Check your internet connection and try again."
        variant: 'error', duration: 0 (persistent)
```

### 21.4 Optimistic Updates vs Server Confirmation

| Action | Pattern |
|--------|---------|
| Workspace name save | Wait for server: button loading → toast on success |
| Discord connection save | Wait for server: button loading → toast → Realtime triggers BotStatusCard update |
| Integration connect (OAuth) | Wait for OAuth redirect: modal loading state until redirect fires |
| Integration connect (API key) | Wait for server: modal button loading → modal closes → card updates |
| Integration disconnect | Wait for server: confirm dialog loading → dialog closes → card updates |
| Plan upgrade (Stripe) | Wait for redirect: button loading until Stripe redirect fires |
| API key save/delete | Wait for server: button loading → modal closes → card updates |
| Table pagination | Wait for server: table rows show LoadingRows skeleton (not full page skeleton) |
| Admin search filter | Wait for server: 300ms debounce, then results load; skeleton overlaid on existing rows |

**No optimistic updates are used.** The Daimon SaaS platform prioritizes data consistency over perceived speed. Every mutation waits for server confirmation before updating UI. Server actions provide sufficient speed for small-scale multi-tenant SaaS.

---

## 22. Confirmation Dialog Complete Inventory

All `ConfirmDialog` instances in the application, with exact copy and configuration:

| # | Location | Variant | Title | Description | `confirmLabel` | `cancelLabel` | `confirmationText` |
|---|----------|---------|-------|-------------|---------------|--------------|-------------------|
| 1 | Settings → Discord → Remove connection | `danger` | "Disconnect bot?" | "Your Discord bot will go offline immediately. Any active conversations will be interrupted. You can reconnect at any time." | "Disconnect" | "Cancel" | — |
| 2 | Settings → Danger Zone → Delete Account | `danger` | "Delete your account?" | "This permanently deletes your Daimon account, all tenant data, Discord connections, API keys, and cancels your subscription. This cannot be undone." | "Delete account" | "Cancel" | `"delete my account"` |
| 3 | Admin → Delete Tenant | `danger` | "Delete tenant?" | "This permanently deletes the tenant "{name}" and all associated data. The bot will go offline immediately. This cannot be undone." | "Delete tenant" | "Cancel" | Tenant slug (e.g., `"acme-corp"`) |
| 4 | Integrations → Disconnect service | `warning` | "Disconnect {ServiceName}?" | "Disconnecting {ServiceName} will disable all {ServiceName} tools in Decision Orchestrator. You can reconnect at any time." | "Disconnect" | "Cancel" | — |
| 5 | Billing → Downgrade to Free | `warning` | "Downgrade to Free?" | "You will lose access to all Starter features at the end of your current billing period. Usage above Free limits will be disabled." | "Downgrade" | "Keep plan" | — |
| 6 | Admin → Suspend Tenant | `warning` | "Suspend tenant?" | "The tenant "{name}" will be suspended immediately. Their bot will go offline and they will not be able to log in." | "Suspend" | "Cancel" | — |
| 7 | Admin → Unsuspend Tenant | `default` | "Unsuspend tenant?" | "The tenant "{name}" will be reactivated. Their bot will reconnect automatically." | "Unsuspend" | "Cancel" | — |
| 8 | Admin → Impersonate (inline confirm, pre-session) | `warning` | "Impersonate tenant?" | "You will view Daimon as the tenant "{name}". All mutations are blocked during impersonation. Your session will return to admin after 30 minutes." | "Impersonate" | "Cancel" | — |

---

## 23. Modal Complete Inventory

All `Modal` instances in the application:

| # | Location | Size | Title | Purpose | Footer |
|---|----------|------|-------|---------|--------|
| 1 | Integrations → Connect API key service (Toggl) | `sm` | "Connect {ServiceName}" | Form: API key input + validate + save/cancel buttons | `Save` (primary) + `Cancel` (secondary) |
| 2 | Integrations → OAuth connecting (loading state) | `sm` | "Connecting {ServiceName}…" | Loading state with spinner while OAuth redirect fires | None (no close — redirect is in progress) |
| 3 | Admin → View audit log entry | `md` | "Audit Log Entry" | Full JSON metadata of a single audit event, formatted with code block | `Close` button (secondary) |
| 4 | Admin → Impersonate tenant (loading/initiate) | `sm` | "Impersonate Tenant?" | Warning message + confirm + cancel (same as ConfirmDialog #8 above — implemented as Modal due to custom layout) | `Impersonate` (danger) + `Cancel` (secondary) |
| 5 | Billing → Update API key | `sm` | "Update {KeyType} API Key" | Form: new key input + show/hide toggle + validate badge + save/cancel | `Save key` (primary) + `Cancel` (secondary) |
| 6 | Settings → Update Discord bot token | `sm` | "Update Bot Token" | Form: new bot token input + validate badge + update/cancel | `Update token` (primary) + `Cancel` (secondary) |

---

## 24. Complete Animation Reference Table

All animations in the application, consolidated for quick reference:

| Animation | Element | Keyframes / Transition | Duration | Easing | Trigger |
|-----------|---------|----------------------|----------|--------|---------|
| Button hover | Background, border, text | `transition: all` | `200ms` | `ease` | `mouseenter` |
| Button active press | Brightness | `filter: brightness(0.93)` | `100ms` | `ease` | `mousedown` |
| Button loading spinner | Rotation | `spin 1s` | `1s` | `linear infinite` | `isLoading=true` |
| Toast enter | Slide right + fade | `translateX → 0, opacity → 1` | `250ms` | `cubic-bezier(0.22,1,0.36,1)` | Toast triggered |
| Toast exit | Slide right + fade | `translateX → offscreen, opacity → 0` | `200ms` | `ease-in` | Dismiss / auto-dismiss |
| Toast progress bar | Width drain | `width 100% → 0%` | `{duration}ms` | `linear` | Auto-dismiss countdown |
| Toast stack reflow | Position | `transform: translateY` | `200ms` | `ease` | Toast removed |
| ConfirmDialog backdrop | Fade | `opacity 0 → rgba(12,31,64,0.55)` | `150ms` | `ease` | Dialog opens |
| ConfirmDialog panel | Scale + fade | `scale(0.96) → 1, opacity 0 → 1` | `200ms` | `cubic-bezier(0.22,1,0.36,1)` | Dialog opens |
| Modal open | Scale + fade (same) | Same as ConfirmDialog | `200ms` | `cubic-bezier(0.22,1,0.36,1)` | Modal opens |
| DropdownMenu open | Translate + fade | `translateY(-4px) → 0, opacity 0 → 1` | `150ms` | `ease-out` | Trigger click |
| DropdownMenu close | Fade | `opacity 1 → 0` | `100ms` | `ease-in` | Escape/click outside |
| Dropdown item hover | Background | `transparent → rgba(12,31,64,0.05)` | `100ms` | `ease` | `mouseenter` |
| Skeleton shimmer | Background position | `shimmer 1.5s` | `1.5s` | `ease-in-out infinite` | During loading |
| FormInput focus | Border color + shadow | `border-color, box-shadow` | `150ms` | `ease` | `focus` |
| FormInput error | Border color | `border-color 150ms` | `150ms` | `ease` | Validation fail |
| Field error message | Slide down + fade | `translateY(-4px) → 0, opacity 0 → 1` | `150ms` | `ease` | Error set |
| Toggle thumb | Translate | `translateX: 0 ↔ 20px` | `200ms` | `ease` | Click/space |
| Toggle track | Background | `color transition` | `200ms` | `ease` | Click/space |
| Password strength bar | Width + color | `width, background-color` | `300ms` | `ease` | Each keystroke |
| StatusIndicator (connected) | Pulse ring | `status-pulse 2s infinite` | `2s` | `ease-out infinite` | Status = connected |
| StatusIndicator (connecting) | Fade | `status-fade 1.5s infinite` | `1.5s` | `ease-in-out infinite` | Status = connecting |
| Status change transition | Dot color + label | `background-color 300ms, opacity 150ms` | `150ms–300ms` | `ease` | Realtime event |
| Alert banner dismiss | Opacity + max-height | `opacity 0, max-height 0, padding 0` | `200ms` | `ease-in` | Dismiss click |
| Copy button success | Icon swap + bg | Instant + `opacity 150ms` on reset | `150ms` | `ease` | Copy success/timeout |
| Nav item hover (sidebar) | Background + text | `background, color` | `200ms` | `ease` | `mouseenter` |
| Sidebar collapse | Width + label | `width 250ms, opacity 150ms` | `250ms` | `cubic-bezier(0.22,1,0.36,1)` | Viewport < 1024px |
| Mobile nav open | Slide + backdrop | `translateX(-100%) → 0, backdrop fade` | `250ms` | `cubic-bezier(0.22,1,0.36,1)` | Hamburger click |
| Mobile nav close | Slide out | `translateX(0) → -100%` | `200ms` | `ease-in` | Close click |
| Sidebar tooltip | Fade + slide | `opacity 0 → 1, translateX(-4px) → 0` | `150ms` | `ease` | Hover (300ms delay) |
| Tab active (underline) | Instant indicator | None — instant swap | Instant | — | Tab click |
| Tab text color | Color | `color transition` | `200ms` | `ease` | Tab click |
| Tabs pills active | Background + shadow | `background, box-shadow` | `150ms` | `ease` | Tab click |
| Hero blob drift | Float | `blob-drift-1/2, 12–15s` | `12–15s` | `ease-in-out infinite` | Page load |
| Hero CTA pulse | Ring expand | `ctaPulse 1.5s, once` | `1.5s` | `ease-out` | Initial render |
| Scroll reveal sections | Fade + slide | `opacity 0→1, translateY 20px→0` | `400ms` | `ease` | Intersection |
| Checklist progress bar | Width | `width 400ms` | `400ms` | `ease` | Step complete |
| Checklist step complete | Row flash | `rgba(180,231,221,0.10) → transparent, 300ms` | `300ms` | `ease` | Step complete |
| Checklist completion | Opacity + height | `opacity 0, height 0 (400ms, after 1500ms)` | `400ms` | `ease` | All steps done |
| Page nav loading bar | Indeterminate progress | NProgress-style | `~1s` | Library-managed | Route change |
| Table row hover | Background | `background-color 100ms` | `100ms` | `ease` | `mouseenter` |
| Confirm typed text enable | Button opacity | `opacity: 0.45 → 1` | `200ms` | `ease` | Input matches text |
| ApiKeyInput validation | Badge cross-fade | `opacity 150ms` | `150ms` | `ease` | Debounced keyup |
| Service card update | Badge opacity | `opacity cross-fade 200ms` | `200ms` | `ease` | Mutation complete |
| Plan price toggle | Price cross-fade | `opacity 0→1 staggered` | `150ms` | `ease` | Billing cycle toggle |

---

## 25. `prefers-reduced-motion` Implementation Checklist

Every animation in the app must be audited against this checklist:

| Category | Applies Reduced Motion | Method |
|----------|----------------------|--------|
| CSS transitions (hover, focus, form) | ✅ Yes — duration → 0ms via CSS var override | `--duration-*: 0ms` in `@media (prefers-reduced-motion)` |
| CSS keyframe animations (shimmer, pulse, blob, spin) | ✅ Yes — `animation: none !important` | Class-level media query |
| NProgress bar | ✅ Yes — jumps to position instead of smooth | Library config |
| React state transitions (modal scale-in) | ✅ Yes — duration → 0ms | `useReducedMotion()` hook reads CSS var |
| Scroll reveal | ✅ Yes — elements start visible (no initial opacity/transform) | CSS class removed in `@media (prefers-reduced-motion)` |
| Status indicator animations | ✅ Yes — `animation: none !important` | CSS override |
| Toast slide animation | ✅ Yes — toast appears instantly at position | `--duration-enter: 0ms` |
| Hero CTA pulse (once) | ✅ Yes — `animation: none` | CSS override |
| Functional loading spinners | ✅ Kept — users need to know loading is happening | NOT disabled — functional, not decorative |

**`useReducedMotion` React hook:**
```typescript
// hooks/useReducedMotion.ts
import { useEffect, useState } from 'react'

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return reduced
}
```

**Usage in components that compute animation duration programmatically (e.g., Toast countdown):**
```typescript
const reducedMotion = useReducedMotion()
const duration = reducedMotion ? 0 : 250  // Enter animation duration
```
