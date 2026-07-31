# Inheritance Frontend — Design Synthesis
*Synthesised from 8 surface critiques · sanity-checked against `apps/inheritance/specs/inheritance-frontend-design.md` and `frontend/src/index.css` · 2026-07-31*

## The one-line read

The theme is right and the components ignore it: `index.css` defines a genuinely appropriate navy/gold/forest legal palette with chart tokens, semantic status colors, and a serif display face — but the serif font never actually loads, the gold is systematically used where it can't be read, and roughly a dozen components hardcode generic Tailwind brights instead of the tokens sitting one file away. **This is not eight surfaces with eight problems; it is five systemic drifts wearing forty costumes.** Enforce the token system and most of the individual findings dissolve.

---

## Systemic fixes (do these first)

Ranked by felt-quality-per-effort. The first four are the whole ballgame.

### 1. Make the serif font actually render — **trivial**
`main.tsx:6` imports `@fontsource-variable/lora`, which registers the family **`'Lora Variable'`**. `index.css:53` declares `--font-serif: 'Lora', 'Georgia', ...` — so every `font-serif` element in the app (sidebar wordmark, page h1s, marketing hero, ReviewStep heading) has been silently rendering **Georgia** since day one. I verified this in the tree; it is real.

**Fix:** `index.css:53` → `--font-serif: 'Lora Variable', 'Lora', 'Georgia', ui-serif, serif;`. One line, app-wide payoff, and it's a precondition for every heading recommendation below.

### 2. Fix the gold: never as small text on light, never under white text — **trivial + small**
The single most repeated finding (5 of 8 surfaces). Gold `#c5a44e` is ~2.3:1 on light surfaces and ~2.2:1 under white text — it fails everywhere it's currently doing work:

- `button.tsx:16,20` — outline/ghost variants keep stock shadcn `hover:bg-accent hover:text-accent-foreground`. Stock shadcn assumes accent is a near-neutral grey; here it's saturated gold with white foreground, so **every secondary button in the entire app flashes illegible solid gold on hover** (verified in the tree). Change both to `hover:bg-muted hover:text-foreground`. *This one edit fixes auth, onboarding, intake, wizard, results, settings, and tax simultaneously — the highest-leverage two lines in this document.*
- The landing eyebrow `text-[#c5a44e]` (4 call sites), PersonCard's spouse badge (`text-[#c5a44e]` on `bg-accent/10`, ~1.9:1), ReviewStep's `bg-accent text-white` Compute CTA and scenario badge, WizardContainer's current-step pill.

**Fix policy:** add one text-safe token in `index.css` — `--accent-strong: #8a6d2f` (≈4.9:1 on `#f8fafc`) plus `--color-accent-strong` in `@theme inline` — and use it wherever gold must be *text* on light. Gold `#c5a44e` stays for fills on navy, borders, tints (`bg-accent/15`), and chart use. High-emphasis fills (Compute CTA, step pill) become **navy** (`bg-primary text-primary-foreground`) — navy is the authority color; gold is the garnish. Also flip `--accent-foreground` from white to a dark value so any future gold fill stays legible.

### 3. Kill the parallel palette: retoken every raw Tailwind color — **small, mechanical**
The theme defines `--success #166534`, `--warning #92400e`, `--destructive`, and `--chart-1..5` (navy/gold/forest/slate/amber — verified). Almost nothing uses them. The same off-palette leak appears on 6 surfaces:

| Where | Currently | Should be |
|---|---|---|
| `CaseCard.tsx:9-14` status badges | `blue-100/700`, `green-100/700`, two different greys | `bg-primary/10 text-primary`, `bg-success/10 text-success`, `bg-muted text-muted-foreground` (+ label map, not raw enum text) |
| `DistributionSection.tsx:31-45` pie + category badges | `#3b82f6/#a855f7/#22c55e/#f97316` + rainbow `-100` chips | `var(--chart-1..5)` as Cell fills; muted token tints for chips |
| `ResultsHeader.tsx:27-32`, `DonationsSummaryPanel.tsx:21-30` | blue-50/emerald-100 chips | same token tints |
| Intake: `ConflictCheckStep.tsx:132-140`, `IntakeReviewStep.tsx:48-54`, `lib/conflict-check.ts:45-53` | green-100/amber-100/red | `bg-success/10 text-success`, `bg-warning/10 text-warning`, `bg-destructive/10 text-destructive` |
| Tax: `SensitivityPanel.tsx:61-67`, `WhatIfPanel.tsx:134-141`, `ComparisonView.tsx:122-130`, `AdvisorPanel.tsx:43-53` | `text-green-600` (fails AA at text-sm) / `text-red-600` | `text-success` / `text-destructive` |
| Tree: `tree-utils.ts:45-55` | violet/sky/yellow/orange-600 node borders | primary/accent/destructive/muted mapping (see per-surface) |
| ~14 tax files | `text-[#1e3a5f]`, `bg-[#c5a44e]/10` arbitrary hexes | `text-primary`, `bg-accent/10` — pure find-and-replace; several are no-ops duplicating Button's default variant |

This is one afternoon of find-and-replace and it removes the "consumer dashboard pasted into a legal tool" feel that four separate critics independently landed on. It's also the prerequisite for any future dark mode.

### 4. One money treatment, everywhere — **trivial**
Peso amounts are currently typeset at least four ways (left-aligned proportional in HeirTable, `font-mono` in ComparisonPanel and Form1801, muted-grey in ShareBreakdown triggers, spinner-arrowed `type="number"` inputs in QuickCalc). For a product whose entire output is money, adopt one rule:

> **Money is right-aligned, `tabular-nums`, regular Inter.** `font-mono` is reserved for code-like identifiers only (scenario codes like "T5a", IBP/PTR/MCLE reference numbers). The most important amount in any row/table is `font-semibold text-foreground`; never `text-muted-foreground`.

Apply in: `DistributionSection.tsx` (HeirTable money columns → `text-right tabular-nums`), `ShareBreakdownSection.tsx:45-47` (promote the net-share trigger amount), `ComparisonPanel.tsx:137-148` and `Form1801View.tsx` (drop `font-mono`), `QuickCalcResults.tsx:46`, `CaseCard.tsx:32-39` (estate value → `font-medium text-foreground tabular-nums`; DOD stays muted). Suppress spinner arrows on the QuickCalc estate input (`[appearance:textfield]` + webkit variants, `inputMode="decimal"`).

### 5. Fix the three `__root.tsx` layout-routing seams — **small**
Three agents found the same class of bug: the wrong chrome around the right content.
- Logged-out `/` (the primary first impression) renders the marketing hero inside a 256px navy app sidebar whose only item is "Sign In". Extend the existing `isContentRoute` branch with `(pathname === '/' && !user)`.
- `/onboarding` renders the "full-screen" welcome ritual squashed inside the app shell. Add it to the `isAuthRoute` branch — zero component changes needed.
- The auth family (sign-in, reset, reset-confirm, callback, invite) each improvises its own geometry because MinimalLayout's `min-h-screen` defeats the centering wrapper. Drop that `min-h-screen`, standardise all auth-family pages on `w-full max-w-md px-4`, and give every one the same skeleton: Scale-icon + serif wordmark above a Card, errors inside as `<Alert variant="destructive">` (the pattern already exists in `auth.tsx` and `onboarding.tsx` — copy, don't invent).

### 6. One heading system — **small**
Currently: sr-only h2s on four wizard steps, an invalid `text-[hsl(var(--primary))]` (silent no-op — `--primary` holds a hex) in `DonationsStep.tsx:65`, serif used exactly once in the wizard, sans h3s in results, `team.tsx` breaking the app's h1 pattern, and two results sections (the pie chart and the breakdown — the centerpiece) with **no heading at all**. Commit to serif for structure:

- **Page h1:** `font-serif text-2xl font-semibold tracking-tight text-primary` (drop the decorative lucide icon glued to h1s on Dashboard/Cases; the sidebar already shows it).
- **Section h2:** `font-serif text-lg font-semibold text-primary tracking-tight` — every results section gets one, including "Distribution of the Estate" and "Per-Heir Share Computation".
- **Sub-heads:** `text-base font-semibold text-foreground`, sans.
- Every wizard/intake step gets a *visible* title in the recipe; strip "Step N:" prefixes (the stepper already counts).

### 7. One-level containment rule — **small–medium**
Two surfaces have opposite problems that share one cure. QuickCalcWidget (the hero's proof-of-competence) floats unframed on the page background with *less* visual weight than the link boxes below it; meanwhile the tax wizard and share page nest Card-inside-Card-inside-Card. The rule: **exactly one card surface per region.**
- Wrap QuickCalcWidget in `rounded-xl border bg-card p-6 shadow-sm` at both call sites; give its paywall overlay and gated state contained card surfaces too.
- Tax wizard: delete the outer `<Card>` wrapper in `EstateTaxWizard.tsx:186-239` (tabs keep their own Cards), wrap the whole wizard in one `rounded-xl border bg-card shadow-sm overflow-hidden` shell, and change its three `bg-white` bars to `bg-card`.
- Share page: drop the outer Card, render the section stack directly on `bg-background` matching ResultsView, and suppress ClientTimeline's duplicate "Estate of …" h1 (the title currently appears three times on the client's one screen).
- Settings sections *gain* a Card each (white inputs currently sit near-invisibly on slate-50) — consistent with the rule, since they have none today.

### 8. Always the primitive, never the hand-roll — **small, scattered**
The same drift on 5 surfaces: hand-rolled dropdowns (`QuickCalcWidget.tsx:145`, `TeamMemberList.tsx` with hardcoded `bg-white` and a typed `···` glyph), raw `<button>`s (team invite, `FamilyTreeTab.tsx:52-81` zoom controls with text `−`/`+`), a hand-styled CTA anchor in `BlogLayout.tsx:58-63`, two spinner designs alternating within one flow, native checkboxes/radios in intake beside Radix ones in the wizard (focus rings literally change weight, 1px vs 3px, between consecutive steps), typed ASCII arrows (`← Back`, `Continue →`) beside lucide chevrons, and two stepper designs between intake and wizard. Policy: shadcn `Button`/`Checkbox`/`RadioGroup`/menu recipe and lucide icons, no exceptions; port the WizardContainer stepper into GuidedIntakeForm; standardise on `Loader2`. Each fix is trivial; the theme is "the demo-able moments are exactly where the prototype bits sit."

### 9. PDF: unbreak the peso sign, then add document furniture — **small**
The PDF uses built-in Times-Roman with no `Font.register` anywhere in `components/pdf/`, and `formatPeso()` emits U+20B1 — which WinAnsi-encoded standard fonts don't contain. **Every amount in the one artifact a lawyer actually files is at risk of rendering as a broken glyph.** Fix first (register an embedded TTF, or a `formatPesoPDF()` emitting "PHP 1,234,567.00" per BIR convention — verify with one generated PDF). Then: fixed `Page n of N` footer with the estate name, a closing rule + Times-Bold total row on the distribution table (a lawyer's first act is checking the sum), section headings with `marginTop` + hairline rule, and narrative body raised to 10pt so the prose outranks the metadata.

---

## Per-surface specifics

Items not absorbed by the systemic fixes above, ranked within surface.

**Marketing / blog / QuickCalc**
- Hero standfirst: raise to `text-base sm:text-lg`, widen `max-w-md`/`max-w-lg`, `leading-relaxed` — the current `text-sm max-w-sm` under a 60px headline is a 4× scale jump wrapping into four cramped lines *(trivial)*.

**Auth / onboarding**
- Step-progress dots: `bg-muted` on `bg-background` is invisible — use `bg-border`, widen the active dot to `w-6 rounded-full` *(trivial)*.
- Unify inline-error size (`text-sm text-destructive`) and link style (`text-primary hover:underline`) across `auth.tsx`/`reset-confirm.tsx` *(trivial)*.

**Shell / dashboard**
- CaseCard doubled padding: `py-0` on the Card, keep `CardContent p-4` — also makes the `h-24` skeletons match loaded height, killing the grid jump *(trivial, high payoff)*.
- Wire the dead designed CSS: `shadow-(--shadow-sidebar)` in AppLayout instead of the duplicated arbitrary shadow; make `Skeleton` render the `.skeleton` shimmer class instead of generic `animate-pulse` *(trivial)*.
- EmptyState title: `text-base font-semibold` (currently whisper-quiet `text-sm font-medium` on a fresh account's dominant element) *(trivial)*.

**Wizard / intake**
- Shared empty-state treatment for FamilyTreeStep/DonationsStep: dashed-border panel containing message *and* the Add button, via existing `ui/empty-state.tsx` *(small)*.
- Extract PersonCard's select recipe as the one select style for intake + wizard *(small)*.

**Results**
- Widen the results container: `max-w-3xl` forces the 8-column HeirTable to scroll horizontally on desktop with dead space either side — conditionally `max-w-5xl` when `phase === 'results'` in `$caseId.tsx` (mirror on share and tax routes) *(trivial)*.
- Section rhythm: keep the flat document feel but add memorandum rule lines (`divide-y divide-border`, sections `pt-8`) so borderless panels stop bleeding into neighbours *(small)*.
- WarningsPanel titles: human labels per category ("Preterition — Manual Review"), not tiny-caps "ERROR" — a card headed ERROR reads as a system fault, not a flagged legal issue *(small)*.
- ComparisonPanel: give it its section header in every state; `text-red-600` → `text-destructive`; skeleton not sentence for loading *(small)*.
- Tree nodes: re-map onto theme (decedent `border-primary bg-primary/5` with serif †, spouse `border-accent bg-accent/10` matching its chart slice, disinherited `border-destructive/60`, predeceased `bg-muted`); bump node height to 96 so three lines stop clipping; update legend *(medium)*.
- Pie: `stroke="var(--card)" strokeWidth={2}` slice separation; Tooltip `formatter={formatPeso}` + bordered contentStyle (raw centavo integers currently show in the default white box) *(trivial)*.

**Estate tax**
- Form 1801: render structurally-N/A cells as muted em-dashes, not "0.00" (a lawyer who knows the form reads those as *asserted zeros*); add full-width section rows (Gross Estate / Ordinary Deductions / Special Deductions / Tax Computation); anchor the Net Estate Tax Due row with `border-t-2` and larger weight *(medium — the most trust-critical single table in the product)*.
- Header hierarchy is inverted: raise the wizard h1 to `text-lg`, demote/drop the per-tab h2s that repeat the lit-up tab label *(trivial)*.
- `space-y-6` on the `$caseId.tax.tsx` wrapper; drop the `pt-6` CardContent override *(trivial)*.

**Settings**
- `team.tsx` adopts the exact header + container + TabsList from `settings/index.tsx` — currently the "Team" tab you click ceases to exist on arrival *(small)*.
- FirmProfileForm: three groups (Firm / Counsel of Record / Bar Credentials) split by `Separator`, credential numbers on one `font-mono` row *(small)*.
- Retitle the first section so it stops duplicating the tab label; `text-amber-600` → `text-warning`; file-input pseudo-button demoted to secondary *(trivial)*.

**Share / PDF**
- ClientTimeline: format the raw ISO date via `formatDateOfDeath` *(trivial)*.
- Share loading state: skeletons in the same `max-w` as content (currently spinner in a differently-sized card → hard layout jump) *(small)*.

---

## Needs your taste

Mechanical fixes end here; these need the owner's eye:

1. **The exact dark-gold hex.** Agents proposed `#8a6d2f` and `#8a6b2d`. Pick one against the actual `#f8fafc` background and navy — this token will appear on every marketing page.
2. **How hard to commit to the serif.** The synthesis says serif for page h1 + section h2 (the "legal memorandum" register). The alternative — serif for page h1 only, sans sections — is calmer but blander. Decide after fix #1 lands, because you have never actually seen Lora render in this app.
3. **The letterhead preview in Brand Colors.** Whether to build it, and what it looks like — it's the only *new* UI element proposed anywhere in this document (a static preview band with luminance-picked foreground). Worth it: it's currently the only place a firm's arbitrary color choice goes straight to a filed PDF unseen.
4. **Results-as-document styling.** The memorandum rule-lines direction vs. card-per-section. The critics converged on rule-lines (flat, print-like, calm); confirm you agree before it's applied to 9 sections.
5. **PDF peso strategy.** Embedded font (keeps ₱, requires shipping a TTF asset) vs. "PHP" prefix (BIR convention, zero risk). This is a judgment about what a Philippine lawyer expects on a filed document — closer to your lawyer collaborator's call than a designer's.
6. **Tree node palette semantics** — whether disinherited/renounced/predeceased each deserve distinct hues or collapse to two states (active vs. inert). Fewer is calmer; your call on how much the tree must encode.

---

## Departures from the design spec

`specs/inheritance-frontend-design.md` (2026-02-24, "Approved") describes a **serverless wizard-only app** — no auth, no dashboard, no intake, no estate tax, no settings, no share links, no marketing pages, and it names components (`HeirCard.tsx`, `DistributionChart.tsx`) that no longer exist. Three of the eight critics independently concluded the same thing: **the de facto design contract is `index.css`, not the spec.** This synthesis therefore *extends* the spec's stated intent (pie chart, scenario badge, amber warnings, collapsible log — all preserved) and treats the token system as the binding contract. Actual departures, all minor:

1. **Chromeless logged-out `/`** — the spec's successor behavior ("dashboard if signed in, marketing hero if not") says nothing about chrome; removing the sidebar changes frame, not content. Justified: a near-empty navy admin sidebar is the wrong first impression for the audience.
2. **"Amber" warnings** — the spec says warning cards "in amber." The token `--warning: #92400e` *is* amber-brown, so routing warnings through the token satisfies the spec more faithfully than the current bright `amber-100` chips do.
3. **Pie chart kept, retinted** — spec-mandated; only the palette moves from generic brights to `--chart-1..5`.
4. **Per-heir "bar segments"** (spec §Results) were apparently never built as specced; nothing here removes or adds them — out of scope for an aesthetics pass, noted for completeness.

One process note: the spec is stale enough to mislead future agents. Worth a one-line owner decision to either update it or mark it superseded by `index.css` + this document.

*Non-aesthetic items surfaced by the critics that exceed one line of importance: string-centavo `Number()` coercion in four results/PDF files (the exact precision-loss pattern `apps/inheritance/CLAUDE.md` flags); share page hardcoding a fictional 0% "ejs" timeline for every client; PDF export options that are silent no-ops; onboarding silently discarding firmPhone/firmAddress. All logged in the per-surface critiques; none addressed here.*