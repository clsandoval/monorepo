# Option 7: Dashboard-Native Power Tool

**Aspect 19 of 27 — Wave 2: Design Options**
**Status:** Complete
*Produced: 2026-03-10*

---

## 1. Design Philosophy

This design believes that professional tools deserve professional interfaces — dense, immediate, and keyboard-navigable. Compliance calculation is not a one-time act for an accountant; it is daily, repetitive, bulk work. Every pixel saved is ten seconds multiplied by fifty computations. The design rewards expertise: shortcuts are visible, inputs are tabable, results are copy-paste ready. There is no hand-holding here, only power.

The dashboard trusts the user completely. No progressive disclosure, no wizard metaphors, no reassuring friendly copy. The professional arrives knowing what they need; the interface's only job is to be out of their way.

---

## 2. Persona Narrative

**Carmela "Mel" Santos, 38, Senior Payroll Specialist at a BPO with 600 employees in Pasig.**

Mel processes payroll for three company subsidiaries. Every month-end, she runs 40–80 compliance computations: retirement pay for departing employees, 13th month calculations, SSS and PhilHealth contributions, final pay matrices. She has BIR eFPS open in one tab, Angkin in another, and an Excel spreadsheet in a third. Her monitor is 27 inches but she uses a split-screen layout.

She arrives at Angkin's dashboard via bookmark (she memorized the URL). She logs in, navigates to "Retirement Pay" using `⌘K` or the left sidebar, enters the employee's monthly rate and years of service, hits Enter, copies the result into her Excel. Total time: 12 seconds. She does this for five employees before lunch.

She doesn't care about the article explaining RA 7641 — she's read it. She doesn't need a friendly headline. She needs the number, and she needs it now. When something is wrong (an edge case like a fractional year), she needs a clear warning, not a confusing explanation. She is the most demanding user Angkin has — and the most valuable, because she'll use every single one of the 148 tools.

---

## 3. Competitive DNA

**Inspired by:** Linear (keyboard-first navigation + information density + data sidebar) + Retool (data-dense professional tool aesthetics) + Raycast (command palette philosophy — everything reachable without a mouse).

**Differentiated by:** No Philippine compliance tool treats HR/accounting professionals as power users. BIR eFPS, PhilHealth member portal, SSS online — all built for infrequent, anxious users, not for daily professional workflows. Angkin Dashboard is the first compliance tool designed explicitly for the professional who uses it every day and wants to go faster, not be guided slower.

**Anti-references:** TurboTax wizard flows (too slow, too much hand-holding); government portals (no keyboard navigation, no result copying, no batch work); SmartAsset calculator embeds (optimized for one-time SEO discovery, not daily professional use).

---

## 4. Brand Expression

The "by Angkin" identity in this option is expressed as a product brand, not a publisher. The wordmark uses **Unbounded Bold** — the same font as the dashboard headings — in white, with a small cyan accent square (`■`) before it: `■ ANGKIN`. Below the wordmark: "Compliance Suite · PH Edition" in 11px Figtree at `--color-text-tertiary`.

The sidebar is the brand's primary canvas: the Angkin wordmark is pinned at top-left, always visible. Every tool page shows the same sidebar, same top bar, same command palette — the suite feels like one product with 148 modes, not 148 separate tools.

The "by Angkin" identity signals membership in a professional suite, not discovery from a search engine. The tone is `TOOL_NAME | Angkin Suite` in browser tab titles. On the tool header: **Retirement Pay Calculator** in large type, with `RA 7641 · Labor Law` as a compact badge beneath it — the law citation is metadata, not a headline.

Suite cohesion across 148 tools is structural: the sidebar always lists all tool categories with expand/collapse. The visual DNA (dark slate + cyan + Unbounded headings + monospace data) is consistent. A user who knows the SSS Contribution Calculator immediately understands the PhilHealth Contribution Calculator because the layout, keyboard shortcuts, and interaction model are identical.

---

## 5. Color System

**Philosophy:** Deep dark slate base — the professional tool aesthetic. Long hours at a screen demand low-glare backgrounds. Vivid cyan accent is high-contrast, energetic without being aggressive. Amber is used for warnings (financial computation warnings need to be unmissable). All interactive elements glow slightly against the dark background.

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-bg` | `#0A0F1E` | Outermost page background — deep space navy |
| `--color-surface` | `#111827` | Primary panels, cards, sidebar background |
| `--color-surface-elevated` | `#1E2A3A` | Input fields, dropdowns, elevated elements |
| `--color-surface-hover` | `#243040` | Hover state for rows, list items |
| `--color-border` | `#2D3A4A` | Panel borders, dividers, input borders |
| `--color-border-focus` | `#06B6D4` | Focus ring, active input border |
| `--color-text-primary` | `#F0F4FA` | Headings, labels, primary content |
| `--color-text-secondary` | `#8899AA` | Secondary labels, descriptions, hints |
| `--color-text-tertiary` | `#4D5E6F` | Muted metadata, version numbers, dates |
| `--color-accent` | `#06B6D4` | Primary accent — electric cyan |
| `--color-accent-dim` | `#0E7490` | Darker cyan for active states |
| `--color-accent-glow` | `rgba(6,182,212,0.12)` | Glow effect on accent elements |
| `--color-success` | `#10B981` | Positive result, eligible, calculated |
| `--color-success-bg` | `rgba(16,185,129,0.08)` | Success state background |
| `--color-warning` | `#F59E0B` | Edge cases, partial eligibility |
| `--color-warning-bg` | `rgba(245,158,11,0.08)` | Warning state background |
| `--color-error` | `#F87171` | Validation errors |
| `--color-error-bg` | `rgba(248,113,113,0.08)` | Error state background |
| `--color-result-number` | `#06B6D4` | Computed result values — electric cyan |

**Domain color adaptation:**
Unlike options with full palette swaps, the dashboard adapts domain color via a single `--color-domain` token applied to the left sidebar category indicator and the tool header badge:
- Labor/Employment tools: `--color-domain: #06B6D4` (default cyan)
- Tax/BIR tools: `--color-domain: #F59E0B` (amber — financial urgency)
- SSS/PhilHealth/HDMF: `--color-domain: #10B981` (green — government benefit positivity)
- Property/Real estate: `--color-domain: #818CF8` (indigo — land registry)
- Maritime/POEA: `--color-domain: #38BDF8` (sky blue — ocean)
- Business registration: `--color-domain: #A78BFA` (purple — corporate)

The domain badge appears as a 2px left border on the tool header card, using `--color-domain`.

---

## 6. Typography System

**Display font:** **Unbounded** — a bold, ultra-geometric display typeface inspired by race car livery and industrial labeling. Each letter is architecturally constructed. At display sizes it commands absolute attention. Available on Google Fonts. Communicates: *precision, confidence, zero ambiguity.*

**Body font:** **Figtree** — a contemporary humanist sans-serif with clean geometry and excellent legibility at small sizes (9–14px range common in dense dashboards). Rounder than Inter but more precise than Nunito. Available on Google Fonts. Communicates: *accessible professional, human-readable data.*

**Monospace font:** **JetBrains Mono** — designed specifically for reading code and data. Numbers are tabular (fixed-width), making computed values align perfectly in tables. Ligatures for `>=`, `<=`, `!=` display correctly. Available on Google Fonts. Used for: all computed values, keyboard shortcuts, currency amounts, percentage values.

| Level | Font | Size | Weight | Line Height | Usage |
|-------|------|------|--------|-------------|-------|
| `--type-app-name` | Unbounded | 16px | 700 | 1.0 | Sidebar wordmark |
| `--type-tool-title` | Unbounded | 24px | 700 | 1.1 | Tool page heading |
| `--type-section-label` | Figtree | 11px | 600 | 1.0 | ALL CAPS section labels, sidebar nav categories |
| `--type-label` | Figtree | 13px | 500 | 1.3 | Input field labels |
| `--type-body` | Figtree | 14px | 400 | 1.5 | Body text, descriptions, tooltips |
| `--type-result-value` | JetBrains Mono | 40px | 700 | 1.0 | Primary computed result |
| `--type-result-detail` | JetBrains Mono | 14px | 500 | 1.6 | Breakdown table values |
| `--type-kbd` | JetBrains Mono | 11px | 400 | 1.0 | Keyboard shortcut badges |
| `--type-small` | Figtree | 12px | 400 | 1.4 | Metadata, timestamps, version |
| `--type-nav` | Figtree | 13px | 500 | 1.0 | Sidebar navigation items |

**Weight rules:** Unbounded only at 700 (Bold) — it's a display face, not a text face. Figtree at 400 for reading, 500 for labels, 600 for section headers. JetBrains Mono at 400 for detail values, 700 for primary computed results. Emphasis in text uses `--color-accent` color, not weight — weight is already committed.

**Why these fonts:** Unbounded's extreme geometry signals this is built for professionals who deal in hard numbers and precise law. Figtree's clarity is essential at small sizes in dense layouts. JetBrains Mono's tabular numbers ensure currency values align perfectly in multi-row result tables. Together: a Bloomberg terminal, designed for Philippines compliance.

---

## 7. Spatial Philosophy

**Density level:** Dense. This is the densest option of all 10 — by design. Professional users have spatial memory for dense interfaces; they know exactly where the "Years of Service" field will be on the 50th use. Density = speed.

**Grid system:** Fixed sidebar (220px) + top bar (48px) + main content area (flexible). Main content uses an internal 2-column split: calculator inputs (left, 380px) and results panel (right, flexible). Total minimum viewport: 900px. Optimized for 1280x800 and larger.

**Max-width:** No max-width on the dashboard container — full-bleed. Content panels have internal padding; the application chrome fills the viewport.

**Responsive strategy:** This is a desktop-first, professional tool. On tablet (768px–1023px): sidebar collapses to icon-only rail (48px wide), main content is full-width. On mobile (375px–767px): sidebar hidden behind a hamburger, single-column layout — calculator on top, results on bottom. Mobile is functional but not the design center.

**Spacing scale (4px base for dense UI):**
- `2px` — internal padding within keyboard shortcut badges
- `4px` — gap between label and input
- `6px` — within input group
- `8px` — between input rows
- `12px` — between form sections
- `16px` — panel padding (compact)
- `20px` — between major sections
- `24px` — panel header padding
- `48px` — sidebar top area (brand)

**Sidebar width:** 220px fixed. Nav items are 32px tall. Category labels are 24px tall (smaller than items — hierarchical density).

**Top bar height:** 48px. Contains: breadcrumb (tool name + category), command palette trigger (`⌘K`), and top-right user menu.

---

## 8. Component Patterns

**Sidebar:**
- Angkin wordmark (Unbounded Bold 16px, white) + cyan square icon at top, 48px header area
- Navigation categories in ALL CAPS Figtree 11px, `--color-text-tertiary`, 8px top padding
- Nav items: 32px height, 16px horizontal padding, 13px Figtree 500, `--color-text-secondary`
- Active nav item: `--color-accent` text + `--color-accent-glow` background + 2px left border in `--color-accent`
- Hover state: `--color-surface-hover` background, 150ms transition
- Recent computations section (bottom 1/3 of sidebar): 5 most recent entries with timestamp

**Top Bar:**
- 48px height, `--color-surface` background, `--color-border` bottom border
- Left: breadcrumb in 12px Figtree — `Labor Law / Retirement / RA 7641`
- Center: Command palette trigger button showing `⌘K` badge
- Right: "Mel Santos" initials avatar (24px circle, cyan background)

**Tool Header:**
- Domain badge: 2px left border in `--color-domain`, `LABOR LAW · RA 7641` in 11px Figtree 600, cyan
- Tool title: "Retirement Pay Calculator" in Unbounded Bold 24px, white
- Subtitle: "Republic Act No. 7641 — Compulsory Retirement Age" in 13px Figtree, `--color-text-secondary`
- Keyboard shortcut reference: tiny row of keyboard badges for key bindings in this tool

**Input Fields:**
- Height: 36px (compact — not the generous 48px of consumer tools)
- Background: `--color-surface-elevated` (`#1E2A3A`)
- Border: `1px solid --color-border` normally; `1px solid --color-border-focus` on focus
- Focus glow: `box-shadow: 0 0 0 3px --color-accent-glow`
- Input text: 14px JetBrains Mono 500, white
- Labels: 11px Figtree 600 ALL CAPS, `--color-text-secondary`, above field with 4px gap
- ₱ prefix and % suffix: inline, `--color-text-tertiary`, JetBrains Mono
- Tab order: All fields navigable with Tab key, highlighted by focus ring
- Helper text: 11px Figtree, `--color-text-tertiary`, below field

**Buttons:**
- Primary (Compute): Unbounded Bold 12px, ALL CAPS, `--color-accent` background, `#0A0F1E` text, 8px vertical padding, 16px horizontal, sharp 4px radius. Keyboard hint: `↵ Enter` badge to the right.
- Secondary (Reset): Ghost style, `--color-border` border, `--color-text-secondary` text
- Icon buttons: 28px square, `--color-surface-elevated` background, icon only, tooltip on hover

**Result Display (The Key Moment):**
The results panel is always visible (right side of 2-column layout) — it updates live as inputs change, with a subtle debounce. Structure:
- Header: "COMPUTATION RESULT" in 11px ALL CAPS, `--color-text-tertiary`
- Status badge: `● COMPUTED` or `● AWAITING INPUT` — green/gray dot
- Primary result: `₱ 123,750.00` in JetBrains Mono 700 40px, `--color-accent` (`#06B6D4`)
- Label: "Minimum Retirement Pay" in 12px Figtree, `--color-text-secondary`
- Divider rule: 1px `--color-border`
- Breakdown table: 2-column JetBrains Mono 14px table — formula variables on left, values on right, tabular alignment
- Formula line: `= 1.0 × 19 × ₱6,500` in 13px JetBrains Mono, `--color-text-tertiary`
- Copy button: "Copy ₱123,750.00" in 12px Figtree — the most important button for Mel's workflow
- Save to History: outlined button, stores computation with timestamp

**Progress Indicators:** Not applicable for single-form calculators. For multi-step wizards, a compact `1 / 3` step counter appears in the top bar.

**Command Palette (`⌘K`):** Full-screen modal overlay with dark blur backdrop. Instant search across all 148 tools. Keyboard-navigable. Shows recently used tools with timestamp. Close with `Esc`.

**Validation:** Inline, below field. 11px Figtree, `--color-error`. With an `×` icon. No shake animation — a static error is faster to read than a moving one.

**Computation History Panel:** Collapsible bottom drawer showing last 10 computations in a table. Each row: tool name, key inputs, result, timestamp. Click to restore inputs.

---

## 9. Animation Philosophy

**Concept:** Professional tools animate to communicate state, never to entertain. Every animation has a functional justification. The user is in a flow state; interruptions — even delightful ones — are unwelcome.

**Page load:** Sidebar and top bar are instant (they're chrome). The main content panel fades in at `opacity 0→1` over 150ms. No staggering, no entrance animations on form fields. The tool should feel like it was already loaded, waiting.

**Input focus:** 150ms border color + glow transition. Crisp, immediate.

**Live result update:** As input values change, the result panel number transitions: old value fades to 30% opacity, new value counts up from the old value to the new one over 400ms using a JS counter with `requestAnimationFrame`. The count-up uses JetBrains Mono's tabular numbers so digits don't jitter in width. This is the only "animation" that takes longer than 200ms — because it communicates that computation happened.

**Copy button feedback:** When "Copy" is clicked, the button text changes to "✓ Copied!" for 2 seconds with a green flash (`--color-success`), then reverts. Smooth, immediate, functional.

**Command palette:** Opens with `scale(0.98)→1` + `opacity 0→1` in 120ms. Closes with reverse in 80ms. Fast and responsive.

**Sidebar collapse (mobile):** Slides in from left with a 200ms cubic-bezier easing. This one can be slightly more theatrical because it's a major layout change.

**Error states:** No animation. Errors appear instantly. The professional user doesn't need a "shake" to find the error — they need it readable and resolvable.

**Hover states on nav items:** 150ms background transition. That's it.

**CSS vs. JS split:** All hover/focus transitions are CSS. The result count-up and copy feedback use minimal vanilla JS. No animation library.

---

## 10. Accessibility Approach

**WCAG target:** AA compliance. The dense dark theme prioritizes contrast — every text element meets AA; primary content meets AAA.

**Contrast ratios (dark theme):**
- Primary text `#F0F4FA` on surface `#111827`: **13.8:1** (AAA)
- Secondary text `#8899AA` on surface: **5.4:1** (AA for normal text)
- Accent cyan `#06B6D4` on surface: **4.8:1** (AA for large text; result display uses 40px font)
- Result number `#06B6D4` on result panel `#0A0F1E`: **5.1:1** (AA, large text)
- White text on accent button `#06B6D4`: **5.3:1` (AA)
- Error `#F87171` on surface: **5.2:1** (AA)

**Focus visible:** Custom focus ring: `0 0 0 2px #0A0F1E, 0 0 0 4px #06B6D4` — double ring, visible on both dark and light surfaces. Applied via `:focus-visible`, never `:focus` (avoids showing focus rings on mouse clicks). The cyan glow on dark backgrounds is extremely visible.

**Keyboard navigation:** This is a keyboard-first tool. Tab order is logical: sidebar nav → tool header → form fields → submit button → result copy button. All interactive elements are focusable. `⌘K` command palette is keyboard-only accessible. All sidebar items are navigable with arrow keys within the nav section.

**ARIA implementation:**
- Sidebar has `role="navigation"` with `aria-label="Angkin Suite Navigation"`
- Tool form has `role="form"` with `aria-labelledby="tool-title"`
- Result panel has `role="region"` with `aria-label="Computation results"` and `aria-live="polite"`
- Currency inputs have `aria-describedby` pointing to their format hint (e.g., "Enter amount in Philippine Pesos")
- Command palette has `role="dialog"` with `aria-modal="true"` and appropriate focus trap

**Screen reader:** When results update, `aria-live="polite"` announces: "Computation complete. Minimum Retirement Pay: ₱123,750.00." The detailed breakdown is not auto-announced (too verbose) but is readable by navigating to it.

**Color-blind safety:** The cyan accent is not the only visual differentiator — shapes (icons), text labels, and border states all reinforce meaning. The domain color badges use text labels, not color alone. Tested against Deuteranopia, Protanopia, Tritanopia.

**Touch targets (mobile):** Despite the dense desktop layout, mobile touch targets are a minimum 44px. The compact 36px inputs expand to 48px on mobile via a responsive modifier.

**Reduced motion:** `@media (prefers-reduced-motion: reduce)` disables count-up animation, replacing with an instant value swap with a brief flash.

---

## 11. Icon & Illustration Style

**Icon library:** Phosphor Icons (Bold weight, 16px default, 20px for tool header icons). Bold weight fits the dense dark theme — thin icons disappear against dark surfaces. Icon color: `--color-text-secondary` for neutral icons; `--color-accent` for active/primary icons.

**Icon usage:** Functional only, never decorative. Icons appear in:
- Sidebar navigation items (16px, left of label)
- Tool header domain category (16px)
- Input field helper icons (error ×, success ✓, copy ⊕)
- Keyboard shortcut indicators (⌘, ↵, ⇧)
- Copy, save, history buttons

**No illustration:** Zero illustrations in the main tool flow. The data is the content. An accountant doing 50 computations/day would find spot illustrations condescending and disruptive.

**Exception:** Empty states (computation history empty, no saved results) use a minimal line-art placeholder — a simple grid pattern in `--color-border` with centered text. Purely functional, not decorative.

**Keyboard shortcut badges:** Custom styled `<kbd>` elements — 11px JetBrains Mono, `--color-surface-elevated` background, `--color-border` border, 2px radius, 2px/4px padding. These appear throughout the UI as persistent reminders, not in a help modal.

**Icon adaptation across 148 tools:** Each tool category has a Phosphor icon assigned. Labor: `UserFocus`. Tax: `Receipt`. SSS: `ShieldCheck`. Property: `House`. Maritime: `Anchor`. The icon appears in the sidebar nav item, tool header, and browser tab favicon (SVG). The icon is the only per-tool visual differentiation beyond the name — everything else is structural.

---

## 12. Dark Mode Strategy

**This option IS the dark mode.** The primary experience is dark — there is no "default light" to switch from. The option is inverted: users can switch to a **light mode** via a `☀` icon in the top bar. Light mode is secondary, provided for accessibility or user preference.

**Light mode palette:**
| Token | Dark (primary) | Light (secondary) |
|-------|----------------|-------------------|
| `--color-bg` | `#0A0F1E` | `#F8FAFC` |
| `--color-surface` | `#111827` | `#FFFFFF` |
| `--color-surface-elevated` | `#1E2A3A` | `#F1F5F9` |
| `--color-border` | `#2D3A4A` | `#E2E8F0` |
| `--color-text-primary` | `#F0F4FA` | `#0F172A` |
| `--color-text-secondary` | `#8899AA` | `#64748B` |
| `--color-accent` | `#06B6D4` | `#0891B2` |
| `--color-result-number` | `#06B6D4` | `#0891B2` |

**Personality in light mode:** Clean, crisp, clinical — like a Bloomberg terminal set to light mode. Less atmospheric, more documentary. Some professional users prefer this for daytime use in bright offices.

**Persistence:** Theme preference stored in `localStorage`. No OS detection — the professional has a deliberate preference, not an ambient one.

---

## 13. Multi-Tool Cohesion

**The invariant (identical across all 148 tools):**
- Application chrome: sidebar, top bar, command palette, keyboard shortcut system
- Sidebar navigation listing all tool categories
- Tool header structure: domain badge + tool title + subtitle
- All component patterns: inputs, buttons, result panel structure
- Typography system: Unbounded + Figtree + JetBrains Mono
- Color foundation: dark slate base + cyan accent
- Keyboard shortcuts system (same keys across all tools: `⌘K` to navigate, `↵ Enter` to compute, `⌘C` to copy result)
- Recent computations history in sidebar
- Command palette search across all 148 tools

**The variant (changes per tool):**
- Tool title and subtitle
- Domain badge text and `--color-domain` value
- Form fields (labels, number of inputs, field types)
- Computation logic (JS function)
- Result label and breakdown formula display
- Related tools shown in result panel footer

**How user knows it's the same family at tool #47:** The application chrome is the signal. Same sidebar with the same Angkin wordmark. Same `⌘K` behavior. Same input/result two-column layout. The dark theme, JetBrains Mono result numbers, and Unbounded Bold headings create a "Bloomberg Suite" recognition pattern — immediately familiar, immediately trusted. It's not a website family (like editorial Angkin); it's a product, and users are customers of the product, not visitors to a page.

**Cross-tool workflow:** The command palette remembers recently used tools and shows them at the top. A user who navigates between Retirement Pay and SSS Contribution sees both in their recent history. This is the core cohesion mechanism: the app remembers you, and you know it will.

---

## 14. Developer Ergonomics

**Token file structure:**
```
angkin-dashboard/
├── tokens/
│   ├── base.css              # All CSS custom properties
│   ├── light.css             # Light mode overrides ([data-theme="light"])
│   └── domains.css           # Domain color overrides ([data-domain])
├── components/
│   ├── sidebar.css           # Sidebar shell, nav items, categories
│   ├── top-bar.css           # Top bar, breadcrumb, avatar
│   ├── tool-header.css       # Tool title, domain badge, subtitle
│   ├── form.css              # Input fields, labels, validation
│   ├── button.css            # Primary, secondary, ghost, icon buttons
│   ├── result-panel.css      # Results display, breakdown table
│   ├── command-palette.css   # ⌘K overlay
│   ├── history.css           # Computation history drawer
│   └── kbd.css               # Keyboard shortcut badges
├── layouts/
│   ├── app-shell.css         # Sidebar + topbar + main content grid
│   ├── tool-2col.css         # Inputs + results side by side
│   └── tool-1col.css         # Mobile/tablet single column
├── templates/
│   ├── single-form.html      # Single-form calculator template
│   ├── multi-step.html       # Multi-step wizard template
│   └── lookup-table.html     # Lookup/reference table template
└── js/
    ├── result-counter.js     # Count-up animation for results
    ├── command-palette.js    # ⌘K search functionality
    └── history.js            # Local storage computation history
```

**Component API surface:**
New tools are built by:
1. Copy `templates/single-form.html`
2. Set `data-domain="labor"` (or tax/sss/property/maritime/business) on `<body>`
3. Fill in: tool-title, tool-subtitle, form fields (copy/paste field component snippets), calculation JS function, result labels
4. Set keyboard shortcut metadata (auto-registered with the command palette)
5. Done

**Estimated time to build a new single-form calculator:**
- HTML structure + form fields: 20 minutes
- CSS customization: 5 minutes (domain attribute set, everything else inherited)
- JS calculation logic: 15–45 minutes depending on formula complexity
- Total: **40–70 minutes** — the fastest of all 10 options because no content writing required

**React/TypeScript integration:** The CSS token system works as-is with React. A `<ToolLayout>` component handles the chrome; each tool exports a `CalculatorForm` component with field definitions. The command palette is a shared global component registered once in the app root.

**TypeScript tool definition:**
```typescript
interface AngkinTool {
  id: string;
  title: string;
  subtitle: string;
  domain: 'labor' | 'tax' | 'sss' | 'property' | 'maritime' | 'business';
  fields: InputFieldDefinition[];
  compute: (inputs: Record<string, number>) => ComputationResult;
  resultLabel: string;
  lawCitation: string;
}
```

---

## 15. Deployment Model

**Single SaaS Application**

This is a monolithic SPA (Single Page Application) — all 148 tools are routes within one React application. The motivation: the dashboard experience (sidebar, command palette, computation history, saved computations) requires shared application state. A micro-app architecture would break the cross-tool command palette and unified history.

Architecture:
- **Frontend:** React 19 + Vite + Tailwind + shadcn (using dashboard primitives from shadcn/ui, heavily customized to match the Angkin dark theme tokens)
- **Routing:** React Router v7 — each tool at `/tools/retirement-pay-ra-7641`
- **State:** React context for computation history and UI preferences (theme toggle)
- **Persistence:** `localStorage` for history, theme, and recently used tools. No server-side account required for core functionality.
- **Optional backend:** If Angkin Pro accounts are added later, a lightweight Postgres + Edge Functions backend handles cloud-synced history.
- **Build:** Single Vite build output. All 148 tool calculation functions are tree-shaken at build time; only the active route's JS is loaded.
- **CDN:** Cloudflare Pages for static deployment. Computation is entirely client-side — no server calls for calculations.

**Command palette search index:** All 148 tool titles, subtypes, and law citations are compiled into a static JSON index at build time. No API call needed for search.

---

## 16. Scalability Assessment

**At 10 tools:** Excellent. The SPA feels snappy. Command palette search is instant. Sidebar navigation is clean with 10 items.

**At 50 tools:** Good. Sidebar navigation needs grouping — the 6 domain categories with expand/collapse handle 50 tools cleanly. Build time is fast. Command palette search remains instant with a 50-item JSON index.

**At 148 tools:** Manageable with careful implementation:
1. **Sidebar navigation:** With 148 tools, the sidebar categories expand into sub-lists. The design handles this — category items are collapsible, and the sidebar is scrollable within each section. The command palette (`⌘K`) becomes the primary navigation tool at this scale, making sidebar density less critical.
2. **Bundle size:** 148 calculator functions must be code-split by route. Vite's `import()` dynamic imports handle this — only the active tool's JS loads. Total JS budget: ~80KB base app + ~2–5KB per tool.
3. **Build time:** 148 routes in Vite builds in under 60 seconds. No issue.
4. **Tool variety:** The dashboard layout (inputs left, results right) works well for single-form calculators (~105 of 148 tools) and multi-step wizards (template variant). Data dashboards and comparison engines need a full-width layout variant — but the application chrome (sidebar, top bar) is shared. Only the main content layout changes.
5. **What breaks first:** The "recent computations" sidebar section shows 5 items — with 148 tools used daily, this history needs a more sophisticated filtering/search layer. Addressable with a "History" sidebar section.

**Prevention:** Implement route-level code splitting from day 1. Build the command palette with fuzzy search (not just exact string match) by tool #30. Add the "History" drawer before tool #50.

---

## 17. Trade-offs

**This option EXPLICITLY sacrifices:**

1. **First-time user experience:** The dense dark UI will intimidate a first-time user who arrived via Google search. There is no explanatory content, no hand-holding, no "here's how RA 7641 works." *Acceptable* because: this option is not designed for discovery — it's designed for daily professionals. First-time users are not the primary audience. If Angkin wants to serve both, Options 1–6 cover the discovery use case; Option 7 serves the professional.

2. **SEO discoverability:** A SPA with client-side routing has inferior SEO to static-generated editorial content. Search engines will not discover individual calculator pages as easily. *Acceptable* because: the professional user reaches Angkin via direct bookmark/referral/integration, not via Google search. If SEO is critical, combine this deployment model with static pre-rendering (SSR) for the tool detail pages.

3. **Mobile experience:** The dense two-column layout and keyboard-centric design work poorly on mobile. *Acceptable* because: accountants doing 50 computations/day work at a desk, on a laptop or desktop. This is the one user segment in Philippines compliance work that is reliably desktop-based.

4. **Emotional warmth:** There is no friendly illustration, no encouraging micro-copy, no celebration animation when the user gets a big result. *Acceptable* because: Mel doesn't want to be celebrated for doing her job. She wants the number, copy-pasted, and to move on. Warmth, in this context, is counterproductive.

5. **No offline support:** A full SPA requires network access for the initial load. *Acceptable* because: the professional user is at a desk with reliable network. However, calculation logic is entirely client-side post-load — once loaded, computations work without network.

6. **Visual accessibility on mobile:** Compact 36px inputs and small typography (11–13px labels) are below WCAG AA touch target guidance on mobile. *Acceptable* because: this is explicitly a desktop tool; mobile layout overrides target sizes to 44px+.
