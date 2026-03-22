# Maceda Law Calculator — Design Spec

**Date:** 2026-03-22
**Status:** Approved
**Location:** `projects/maceda-calculator/`

## Overview

A standalone single-page calculator for Philippine residential real estate buyers to compute their Cash Surrender Value (CSV) and grace period eligibility under Republic Act 6552 (Maceda Law). The tool addresses a systematic information asymmetry: buyers can't verify the refund amounts developers owe them because the formula is buried in statute.

## Target Users

- **Free tier (v1):** Residential real estate buyers who purchased a condo, house-and-lot, or subdivision lot on installment. Need a dead-simple way to find out what they're owed.
- **Professional tier (future):** Real estate lawyers and paralegals advising clients on Maceda Law claims. Need detailed breakdowns, exportable documents.

## Scope — What's In v1

- Single-page calculator (no routing, no wizard)
- Contract details input (price, down payment, monthly installment, start date)
- Full payment history input (manual entry + "I paid regularly" auto-fill shortcut)
- Grace period history checkbox
- CSV computation (amount + percentage)
- Grace period eligibility + duration
- Timeline visualization showing CSV buildup over time
- Collapsible legal basis citations
- Responsive design (mobile-first)

## Scope — What's NOT in v1

- SOA upload (PDF/CSV parsing)
- Document generation (demand letters, worksheets)
- Auth / user accounts
- Saved computations
- Paid tier / billing (PayMongo)
- Mobile app

## Tech Stack

- **Framework:** Next.js (App Router), lightweight — no database, no API routes
- **Computation:** Client-side only, pure TypeScript functions
- **Styling:** Tailwind CSS + CSS custom properties for design tokens
- **Fonts:** Fraunces (serif headings), Source Sans 3 (body), JetBrains Mono (numbers)
- **Testing:** Vitest (unit), Playwright (e2e)
- **Deployment:** Vercel

## Design System

### Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--bg` | `#F5F0E8` | Page background (warm parchment) |
| `--bg-elevated` | `#FDFBF7` | Cards, form sections |
| `--text-primary` | `#2C2418` | Headings, primary text |
| `--text-secondary` | `#7A7062` | Body text, descriptions |
| `--text-tertiary` | `#A89E90` | Labels, placeholders |
| `--accent` | `#C4571A` | Accent color (burnt sienna) |
| `--accent-soft` | `#E8D5C4` | Accent backgrounds |
| `--border` | `#E2DCD2` | Borders |
| `--border-subtle` | `#EDE8E0` | Card borders |
| `--success` | `#5A8A50` | Eligibility badges |
| `--success-soft` | `#E8F0E6` | Success backgrounds |

### Typography

| Role | Font | Weight | Size |
|------|------|--------|------|
| Page title | Fraunces | 300 | 38px |
| Section labels | Fraunces | 600 | 13px uppercase |
| Body text | Source Sans 3 | 300–400 | 14–16px |
| Form labels | Source Sans 3 | 500 | 13px |
| Numbers/amounts | JetBrains Mono | 600 | 42px (hero), 18px (cards) |
| Buttons | Source Sans 3 | 600 | 15px |

### Visual Character

- Anthropic/Claude-inspired aesthetic: generous whitespace, light font weights, editorial confidence
- Subtle grain texture overlay on page background
- Thin borders, soft focus glow on inputs
- Dark charcoal CTA button (not accent-colored)
- Thin accent bar atop the hero result card
- Completely distinct from legal-interest-engine (no shared colors, fonts, or layout patterns)

## Computation Engine

### RA 6552 Rules

**Cash Surrender Value:**
- Buyer must have paid at least 2 years of installments
- Base: 50% of total payments made
- After year 2: +5% per year of additional payments
- Cap: 90% of total payments
- Formula: `CSV = totalPayments × min(0.90, 0.50 + 0.05 × max(0, yearsPaid - 2))`

**Grace Period:**
- 1 month per year of installments paid
- Can only be exercised once every 5 years
- Buyer must pay installments due during grace period (without additional interest)

**Cancellation Rules (informational display):**
- Developer must send notarial notice of cancellation
- 30-day waiting period after notice
- Developer must refund full CSV to buyer

### Engine Inputs

```typescript
interface MacedaInput {
  contractPrice: number;
  downPayment: number;
  monthlyInstallment: number;
  contractStartDate: string;       // ISO date
  payments: PaymentEntry[];        // { date: string, amount: number }
  previousGracePeriod: boolean;
  previousGracePeriodDate?: string; // ISO date, if applicable
}
```

### Engine Outputs

```typescript
interface MacedaResult {
  eligible: boolean;               // met 2-year threshold?
  totalPayments: number;           // sum of all payments
  yearsPaid: number;               // computed from payment history
  csvPercentage: number;           // 0.50–0.90
  csvAmount: number;               // totalPayments × csvPercentage
  gracePeriod: {
    eligible: boolean;
    months: number;                // 1 per year paid
    canExercise: boolean;          // false if exercised within last 5 years
    nextEligibleDate?: string;     // if canExercise is false
  };
  timeline: TimelineEntry[];       // for visualization
}

interface TimelineEntry {
  year: number;
  cumulativePayments: number;
  csvPercentage: number;
  csvAmount: number;
  milestone?: string;              // "2-year threshold", "cap reached"
}
```

### Engine Architecture

All pure functions, no side effects, fully testable:

```
lib/engine/
├── types.ts          — Input/output type definitions
├── csv.ts            — CSV percentage + amount calculation
├── grace-period.ts   — Grace period eligibility + duration
├── validation.ts     — Input validation (2-year check, required fields)
├── compute.ts        — Orchestrator: inputs → full MacedaResult
└── __tests__/        — Unit tests for each module
```

## Page Layout

Single page, three zones stacked vertically:

### Zone 1 — Header
- Logo mark (coral square with "M") + wordmark "Maceda"
- Title: "Know your *rights* under the Maceda Law" (Fraunces, light weight, italic emphasis)
- Subtitle explaining what the tool does

### Zone 2 — Input Form
Three card sections stacked:

1. **Contract Details** — 2×2 grid: contract price, down payment, monthly installment, contract start date. Peso prefix on currency fields.
2. **Payment History** — Toggle for "I paid regularly" auto-fill. Table with row number, date, amount. "Add a payment" link button. Ellipsis for collapsed auto-filled rows.
3. **Grace Period History** — Single checkbox with label.
4. **Calculate button** — Full-width, dark charcoal (#2C2418), "Calculate my rights"

### Zone 3 — Results (appears after calculation)
1. **Hero card** — Accent bar top, centered: "You are owed" label, large peso amount in JetBrains Mono, percentage breakdown, green eligibility badge
2. **Grace period card** — Row layout: label + description on left, duration in green mono on right
3. **Timeline** — Horizontal segmented bar (base / bonus / remaining) with year labels and 2-year threshold marker. Explanatory note below.
4. **Legal basis** — Collapsible card with RA 6552 section citations

### Responsive Behavior
- Single column on all breakpoints
- Form inputs go full-width on mobile
- Timeline bar remains horizontal, segments reflow labels if needed

## Project Structure

```
projects/maceda-calculator/
├── app/
│   ├── layout.tsx            — Root layout, fonts, metadata
│   ├── page.tsx              — Single-page calculator
│   └── globals.css           — CSS variables, base styles, grain texture
├── components/
│   ├── calculator-form.tsx   — Contract details + payment history + grace period
│   ├── payment-table.tsx     — Payment row management + auto-fill toggle
│   ├── results.tsx           — Hero card + grace card container
│   ├── timeline.tsx          — CSV buildup bar visualization
│   └── legal-basis.tsx       — Collapsible legal citations
├── lib/
│   └── engine/
│       ├── types.ts
│       ├── csv.ts
│       ├── grace-period.ts
│       ├── validation.ts
│       ├── compute.ts
│       └── __tests__/
├── package.json
├── tsconfig.json
├── next.config.ts
└── tailwind.config.ts
```

## Testing Strategy

### Unit Tests (Vitest)
- CSV calculation: 2-year threshold, percentage progression, 90% cap, edge cases
- Grace period: eligibility, 5-year cooldown, month-per-year calculation
- Validation: missing fields, insufficient payments, invalid dates
- Orchestrator: end-to-end computation with known inputs/outputs

### E2E Tests (Playwright)
- Full calculator flow: fill form → calculate → verify results
- Auto-fill toggle: enable → verify payment rows populated
- Edge cases: exactly 2 years, under 2 years (ineligible), at 90% cap
- Mobile viewport: form and results render correctly

## Mockup Reference

The approved visual mockup is saved at:
`.superpowers/brainstorm/624804-1774183357/anthropic-feel.html`
