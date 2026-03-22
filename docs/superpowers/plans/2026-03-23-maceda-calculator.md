# Maceda Law Calculator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone single-page calculator that computes Cash Surrender Value and grace period eligibility under RA 6552 (Maceda Law) for Philippine residential real estate buyers.

**Architecture:** Client-side Next.js app with pure TypeScript computation engine. No database, no API routes, no auth. All computation happens in the browser. Tailwind v4 with CSS custom properties for the Anthropic-inspired design system.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind v4, date-fns, zod, Vitest, Playwright

**Spec:** `docs/superpowers/specs/2026-03-22-maceda-calculator-design.md`
**Mockup:** `.superpowers/brainstorm/624804-1774183357/anthropic-feel.html`

---

## File Map

```
projects/maceda-calculator/
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
├── eslint.config.mjs
├── vitest.config.ts
├── playwright.config.ts
├── app/
│   ├── layout.tsx                  — Root layout, font loading, metadata
│   ├── page.tsx                    — Single-page calculator (orchestrates form + results)
│   └── globals.css                 — @theme inline tokens, base styles, grain texture
├── components/
│   ├── header.tsx                  — Logo + title + subtitle
│   ├── calculator-form.tsx         — Orchestrates contract-details + payment-table + grace-period
│   ├── contract-details.tsx        — Contract price, down payment, installment, start date
│   ├── payment-table.tsx           — Payment row CRUD + auto-fill toggle
│   ├── grace-period-input.tsx      — Checkbox + conditional date picker
│   ├── results.tsx                 — Switches between Section 3 and Section 4 results
│   ├── results-eligible.tsx        — Hero card + grace card (Section 3)
│   ├── results-ineligible.tsx      — Info card + progress indicator (Section 4)
│   ├── timeline.tsx                — CSV buildup bar visualization
│   └── legal-basis.tsx             — Collapsible legal citations
├── lib/
│   └── engine/
│       ├── types.ts                — MacedaInput, MacedaResult, PaymentEntry, TimelineEntry
│       ├── csv.ts                  — computeCsv(totalPayments, yearsPaid) → { percentage, amount }
│       ├── grace-period.ts         — computeGracePeriod(yearsPaid, previous?) → GracePeriodResult
│       ├── validation.ts           — validateInput(input) → ValidationResult (zod)
│       ├── compute.ts              — compute(input) → MacedaResult (orchestrator)
│       └── __tests__/
│           ├── csv.test.ts
│           ├── grace-period.test.ts
│           ├── validation.test.ts
│           └── compute.test.ts
└── e2e/
    └── calculator.spec.ts          — Playwright E2E tests
```

---

## Task 1: Project Scaffold

**Files:**
- Create: `projects/maceda-calculator/package.json`
- Create: `projects/maceda-calculator/tsconfig.json`
- Create: `projects/maceda-calculator/next.config.ts`
- Create: `projects/maceda-calculator/postcss.config.mjs`
- Create: `projects/maceda-calculator/eslint.config.mjs`
- Create: `projects/maceda-calculator/vitest.config.ts`
- Create: `projects/maceda-calculator/app/layout.tsx`
- Create: `projects/maceda-calculator/app/page.tsx`
- Create: `projects/maceda-calculator/app/globals.css`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "maceda-calculator",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test"
  },
  "dependencies": {
    "next": "16.2.1",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "date-fns": "^4.1.0",
    "zod": "^4.3.6"
  },
  "devDependencies": {
    "@playwright/test": "^1.58.2",
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.2.1",
    "tailwindcss": "^4",
    "typescript": "^5",
    "vitest": "^4.1.0"
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Create next.config.ts**

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export default nextConfig;
```

- [ ] **Step 4: Create postcss.config.mjs**

```javascript
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
export default config;
```

- [ ] **Step 5: Create eslint.config.mjs**

```javascript
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;
```

- [ ] **Step 6: Create vitest.config.ts**

```typescript
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
```

- [ ] **Step 7: Create globals.css with design tokens**

Reference the mockup at `.superpowers/brainstorm/624804-1774183357/anthropic-feel.html` for exact CSS values.

```css
@import "tailwindcss";

@theme inline {
  --color-bg: #F5F0E8;
  --color-bg-elevated: #FDFBF7;
  --color-text-primary: #2C2418;
  --color-text-secondary: #7A7062;
  --color-text-tertiary: #A89E90;
  --color-accent: #C4571A;
  --color-accent-soft: #E8D5C4;
  --color-accent-glow: rgba(196, 87, 26, 0.08);
  --color-border: #E2DCD2;
  --color-border-subtle: #EDE8E0;
  --color-success: #5A8A50;
  --color-success-soft: #E8F0E6;
  --font-heading: 'Fraunces', Georgia, serif;
  --font-body: 'Source Sans 3', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', 'Courier New', monospace;
}

body {
  background-color: var(--color-bg);
  color: var(--color-text-primary);
  font-family: var(--font-body);
  -webkit-font-smoothing: antialiased;
}

/* Subtle grain texture overlay */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  opacity: 0.025;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  pointer-events: none;
  z-index: 999;
}
```

- [ ] **Step 8: Create app/layout.tsx with font loading**

```tsx
import type { Metadata } from "next";
import { Fraunces, Source_Sans_3, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Maceda Calculator — Know Your Rights Under RA 6552",
  description:
    "Calculate your Cash Surrender Value and grace period rights under the Maceda Law (Republic Act 6552). Free tool for Philippine residential real estate buyers.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${sourceSans.variable} ${jetbrainsMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 9: Create stub app/page.tsx**

```tsx
export default function Home() {
  return (
    <main className="mx-auto max-w-[600px] px-6 py-12">
      <h1 className="font-heading text-4xl font-light tracking-tight text-text-primary">
        Know your <em className="italic font-normal">rights</em> under the Maceda Law
      </h1>
    </main>
  );
}
```

- [ ] **Step 10: Install dependencies and verify dev server starts**

Run:
```bash
cd projects/maceda-calculator && npm install
```

Then:
```bash
cd projects/maceda-calculator && npm run dev &
```

Expected: Dev server starts on localhost:3000, page renders the heading.

- [ ] **Step 11: Commit**

```bash
git add projects/maceda-calculator/
git commit -m "feat(maceda): scaffold Next.js project with design tokens and fonts"
```

---

## Task 2: Engine Types

**Files:**
- Create: `projects/maceda-calculator/lib/engine/types.ts`

- [ ] **Step 1: Create types.ts with all type definitions**

```typescript
export interface PaymentEntry {
  date: string; // ISO date string YYYY-MM-DD
  amount: number; // in centavos (integer)
}

export interface MacedaInput {
  contractPrice: number; // centavos
  downPayment: number; // centavos
  monthlyInstallment: number; // centavos
  contractStartDate: string; // ISO date YYYY-MM-DD
  payments: PaymentEntry[];
  previousGracePeriod: boolean;
  previousGracePeriodDate?: string; // ISO date — required when previousGracePeriod is true
}

export interface GracePeriodResult {
  eligible: boolean;
  months: number; // floor(yearsPaid), 1 month per full year
  canExercise: boolean; // false if exercised within last 5 years
  nextEligibleDate?: string; // ISO date, if canExercise is false
  section4GraceDays?: number; // 60 if section4 applies
}

export interface TimelineEntry {
  year: number;
  cumulativePayments: number; // centavos
  csvPercentage: number; // 0–0.90
  csvAmount: number; // centavos
  milestone?: string; // "2-year threshold", "5-year bonus start", "cap reached"
}

export interface MacedaResult {
  eligible: boolean; // met 2-year threshold (Section 3)?
  section4: boolean; // under 2 years (Section 4 applies)
  totalPayments: number; // centavos: downPayment + sum(payments[].amount)
  yearsPaid: number; // floor(months from contractStartDate to latest payment / 12)
  csvPercentage: number; // 0.50–0.90 (0 if section4)
  csvAmount: number; // centavos: totalPayments × csvPercentage
  gracePeriod: GracePeriodResult;
  timeline: TimelineEntry[];
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}
```

- [ ] **Step 2: Verify types compile**

Run:
```bash
cd projects/maceda-calculator && npx tsc --noEmit lib/engine/types.ts
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add projects/maceda-calculator/lib/engine/types.ts
git commit -m "feat(maceda): add engine type definitions"
```

---

## Task 3: CSV Computation

**Files:**
- Create: `projects/maceda-calculator/lib/engine/csv.ts`
- Create: `projects/maceda-calculator/lib/engine/__tests__/csv.test.ts`

- [ ] **Step 1: Write failing tests for CSV computation**

```typescript
import { describe, it, expect } from "vitest";
import { computeCsv } from "../csv";

describe("computeCsv", () => {
  // All amounts in centavos (1 peso = 100 centavos)

  it("returns 0% for under 2 years", () => {
    const result = computeCsv(100_000_00, 1);
    expect(result.percentage).toBe(0);
    expect(result.amount).toBe(0);
  });

  it("returns 50% for exactly 2 years", () => {
    const result = computeCsv(100_000_00, 2);
    expect(result.percentage).toBe(0.5);
    expect(result.amount).toBe(50_000_00);
  });

  it("returns 50% for 3 years (flat until year 5)", () => {
    const result = computeCsv(100_000_00, 3);
    expect(result.percentage).toBe(0.5);
    expect(result.amount).toBe(50_000_00);
  });

  it("returns 50% for 5 years (last flat year)", () => {
    const result = computeCsv(100_000_00, 5);
    expect(result.percentage).toBe(0.5);
    expect(result.amount).toBe(50_000_00);
  });

  it("returns 55% for 6 years (first bonus year)", () => {
    const result = computeCsv(100_000_00, 6);
    expect(result.percentage).toBe(0.55);
    expect(result.amount).toBe(55_000_00);
  });

  it("returns 60% for 7 years", () => {
    const result = computeCsv(100_000_00, 7);
    expect(result.percentage).toBe(0.6);
    expect(result.amount).toBe(60_000_00);
  });

  it("caps at 90% for 13+ years", () => {
    const result = computeCsv(100_000_00, 13);
    expect(result.percentage).toBe(0.9);
    expect(result.amount).toBe(90_000_00);
  });

  it("caps at 90% for 20 years", () => {
    const result = computeCsv(100_000_00, 20);
    expect(result.percentage).toBe(0.9);
    expect(result.amount).toBe(90_000_00);
  });

  it("handles realistic amounts", () => {
    // ₱1,248,000 total payments, 7 years → 60%
    const result = computeCsv(1_248_000_00, 7);
    expect(result.percentage).toBe(0.6);
    expect(result.amount).toBe(748_800_00);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:
```bash
cd projects/maceda-calculator && npx vitest run lib/engine/__tests__/csv.test.ts
```

Expected: FAIL — `computeCsv` not found.

- [ ] **Step 3: Implement csv.ts**

```typescript
interface CsvResult {
  percentage: number; // 0–0.90
  amount: number; // centavos
}

/**
 * Compute Cash Surrender Value per RA 6552 Section 3.
 *
 * - Under 2 years: 0% (Section 4 applies, no CSV)
 * - Years 2–5: 50% flat
 * - Years 6+: 50% + 5% per year beyond 5, capped at 90%
 *
 * @param totalPayments - total payments in centavos (downPayment + all installments)
 * @param yearsPaid - floor(months from contract start to latest payment / 12)
 */
export function computeCsv(
  totalPayments: number,
  yearsPaid: number
): CsvResult {
  if (yearsPaid < 2) {
    return { percentage: 0, amount: 0 };
  }

  const bonusYears = Math.max(0, yearsPaid - 5);
  const percentage = Math.min(0.9, 0.5 + 0.05 * bonusYears);
  const amount = Math.round(totalPayments * percentage);

  return { percentage, amount };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run:
```bash
cd projects/maceda-calculator && npx vitest run lib/engine/__tests__/csv.test.ts
```

Expected: All 9 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add projects/maceda-calculator/lib/engine/csv.ts projects/maceda-calculator/lib/engine/__tests__/csv.test.ts
git commit -m "feat(maceda): CSV computation with tests — RA 6552 Section 3"
```

---

## Task 4: Grace Period Computation

**Files:**
- Create: `projects/maceda-calculator/lib/engine/grace-period.ts`
- Create: `projects/maceda-calculator/lib/engine/__tests__/grace-period.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
import { describe, it, expect } from "vitest";
import { computeGracePeriod } from "../grace-period";

describe("computeGracePeriod", () => {
  it("returns section4 grace for under 2 years", () => {
    const result = computeGracePeriod(1, false);
    expect(result.eligible).toBe(false);
    expect(result.section4GraceDays).toBe(60);
    expect(result.months).toBe(0);
  });

  it("returns 2 months for 2 years", () => {
    const result = computeGracePeriod(2, false);
    expect(result.eligible).toBe(true);
    expect(result.months).toBe(2);
    expect(result.canExercise).toBe(true);
  });

  it("returns 5 months for 5 years", () => {
    const result = computeGracePeriod(5, false);
    expect(result.months).toBe(5);
  });

  it("returns 7 months for 7 years", () => {
    const result = computeGracePeriod(7, false);
    expect(result.months).toBe(7);
  });

  it("floors fractional years", () => {
    // 3.9 years → 3 months
    const result = computeGracePeriod(3.9, false);
    expect(result.months).toBe(3);
  });

  it("can exercise if no previous grace period", () => {
    const result = computeGracePeriod(5, false);
    expect(result.canExercise).toBe(true);
    expect(result.nextEligibleDate).toBeUndefined();
  });

  it("cannot exercise if previous grace period within 5 years", () => {
    // Previous exercised 2024-01-15, "today" is 2026-03-23
    const result = computeGracePeriod(
      5,
      true,
      "2024-01-15",
      "2026-03-23"
    );
    expect(result.canExercise).toBe(false);
    expect(result.nextEligibleDate).toBe("2029-01-15");
  });

  it("can exercise if previous grace period over 5 years ago", () => {
    // Previous exercised 2020-01-01, "today" is 2026-03-23
    const result = computeGracePeriod(
      5,
      true,
      "2020-01-01",
      "2026-03-23"
    );
    expect(result.canExercise).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:
```bash
cd projects/maceda-calculator && npx vitest run lib/engine/__tests__/grace-period.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement grace-period.ts**

```typescript
import { addYears, isAfter, parseISO } from "date-fns";
import type { GracePeriodResult } from "./types";

/**
 * Compute grace period eligibility per RA 6552.
 *
 * Section 3 (2+ years): floor(yearsPaid) months, once every 5 years.
 * Section 4 (under 2 years): 60-day grace period from default.
 *
 * @param yearsPaid - years of installments paid
 * @param previousGracePeriod - whether buyer previously exercised grace period
 * @param previousGracePeriodDate - ISO date when previously exercised
 * @param asOfDate - reference date for 5-year cooldown check (defaults to today)
 */
export function computeGracePeriod(
  yearsPaid: number,
  previousGracePeriod: boolean,
  previousGracePeriodDate?: string,
  asOfDate?: string
): GracePeriodResult {
  if (yearsPaid < 2) {
    return {
      eligible: false,
      months: 0,
      canExercise: false,
      section4GraceDays: 60,
    };
  }

  const months = Math.floor(yearsPaid);

  let canExercise = true;
  let nextEligibleDate: string | undefined;

  if (previousGracePeriod && previousGracePeriodDate) {
    const prevDate = parseISO(previousGracePeriodDate);
    const eligible = addYears(prevDate, 5);
    const now = asOfDate ? parseISO(asOfDate) : new Date();

    if (isAfter(eligible, now)) {
      canExercise = false;
      nextEligibleDate = eligible.toISOString().split("T")[0];
    }
  }

  return {
    eligible: true,
    months,
    canExercise,
    nextEligibleDate,
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run:
```bash
cd projects/maceda-calculator && npx vitest run lib/engine/__tests__/grace-period.test.ts
```

Expected: All 8 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add projects/maceda-calculator/lib/engine/grace-period.ts projects/maceda-calculator/lib/engine/__tests__/grace-period.test.ts
git commit -m "feat(maceda): grace period computation with tests — Section 3 & 4"
```

---

## Task 5: Input Validation

**Files:**
- Create: `projects/maceda-calculator/lib/engine/validation.ts`
- Create: `projects/maceda-calculator/lib/engine/__tests__/validation.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
import { describe, it, expect } from "vitest";
import { validateInput } from "../validation";

describe("validateInput", () => {
  const validInput = {
    contractPrice: 2_500_000_00,
    downPayment: 250_000_00,
    monthlyInstallment: 15_000_00,
    contractStartDate: "2019-01-15",
    payments: [
      { date: "2019-02-15", amount: 15_000_00 },
      { date: "2019-03-15", amount: 15_000_00 },
    ],
    previousGracePeriod: false,
  };

  it("accepts valid input", () => {
    const result = validateInput(validInput);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("rejects zero contract price", () => {
    const result = validateInput({ ...validInput, contractPrice: 0 });
    expect(result.valid).toBe(false);
    expect(result.errors[0].field).toBe("contractPrice");
  });

  it("rejects negative down payment", () => {
    const result = validateInput({ ...validInput, downPayment: -100 });
    expect(result.valid).toBe(false);
    expect(result.errors[0].field).toBe("downPayment");
  });

  it("rejects empty payments array", () => {
    const result = validateInput({ ...validInput, payments: [] });
    expect(result.valid).toBe(false);
    expect(result.errors[0].field).toBe("payments");
  });

  it("rejects invalid contract start date", () => {
    const result = validateInput({
      ...validInput,
      contractStartDate: "not-a-date",
    });
    expect(result.valid).toBe(false);
    expect(result.errors[0].field).toBe("contractStartDate");
  });

  it("rejects when previousGracePeriod is true but no date given", () => {
    const result = validateInput({
      ...validInput,
      previousGracePeriod: true,
    });
    expect(result.valid).toBe(false);
    expect(result.errors[0].field).toBe("previousGracePeriodDate");
  });

  it("accepts previousGracePeriod with date", () => {
    const result = validateInput({
      ...validInput,
      previousGracePeriod: true,
      previousGracePeriodDate: "2022-06-01",
    });
    expect(result.valid).toBe(true);
  });

  it("collects multiple errors", () => {
    const result = validateInput({
      ...validInput,
      contractPrice: 0,
      monthlyInstallment: -1,
      payments: [],
    });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(3);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:
```bash
cd projects/maceda-calculator && npx vitest run lib/engine/__tests__/validation.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement validation.ts**

```typescript
import { isValid, parseISO } from "date-fns";
import type { MacedaInput, ValidationResult, ValidationError } from "./types";

function isValidIsoDate(s: string): boolean {
  const d = parseISO(s);
  return isValid(d);
}

export function validateInput(input: MacedaInput): ValidationResult {
  const errors: ValidationError[] = [];

  if (!input.contractPrice || input.contractPrice <= 0) {
    errors.push({
      field: "contractPrice",
      message: "Contract price must be greater than zero",
    });
  }

  if (input.downPayment < 0) {
    errors.push({
      field: "downPayment",
      message: "Down payment cannot be negative",
    });
  }

  if (!input.monthlyInstallment || input.monthlyInstallment <= 0) {
    errors.push({
      field: "monthlyInstallment",
      message: "Monthly installment must be greater than zero",
    });
  }

  if (!input.contractStartDate || !isValidIsoDate(input.contractStartDate)) {
    errors.push({
      field: "contractStartDate",
      message: "Valid contract start date is required",
    });
  }

  if (!input.payments || input.payments.length === 0) {
    errors.push({
      field: "payments",
      message: "At least one payment is required",
    });
  }

  if (input.previousGracePeriod && !input.previousGracePeriodDate) {
    errors.push({
      field: "previousGracePeriodDate",
      message: "Date is required when grace period was previously exercised",
    });
  }

  return { valid: errors.length === 0, errors };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run:
```bash
cd projects/maceda-calculator && npx vitest run lib/engine/__tests__/validation.test.ts
```

Expected: All 8 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add projects/maceda-calculator/lib/engine/validation.ts projects/maceda-calculator/lib/engine/__tests__/validation.test.ts
git commit -m "feat(maceda): input validation with tests"
```

---

## Task 6: Compute Orchestrator

**Files:**
- Create: `projects/maceda-calculator/lib/engine/compute.ts`
- Create: `projects/maceda-calculator/lib/engine/__tests__/compute.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
import { describe, it, expect } from "vitest";
import { compute } from "../compute";
import type { MacedaInput } from "../types";

// Helper: generate N months of regular payments starting from a date
function makeRegularPayments(
  startDate: string,
  monthlyAmount: number,
  months: number
) {
  const payments = [];
  const [year, month] = startDate.split("-").map(Number);
  for (let i = 0; i < months; i++) {
    const m = ((month - 1 + i) % 12) + 1;
    const y = year + Math.floor((month - 1 + i) / 12);
    payments.push({
      date: `${y}-${String(m).padStart(2, "0")}-15`,
      amount: monthlyAmount,
    });
  }
  return payments;
}

describe("compute", () => {
  it("computes Section 3 result for 7 years of payments", () => {
    const input: MacedaInput = {
      contractPrice: 2_500_000_00,
      downPayment: 250_000_00,
      monthlyInstallment: 15_000_00,
      contractStartDate: "2019-01-15",
      payments: makeRegularPayments("2019-02-15", 15_000_00, 84), // 7 years
      previousGracePeriod: false,
    };

    const result = compute(input);

    // totalPayments = 250_000_00 + (84 × 15_000_00) = 250_000_00 + 1_260_000_00 = 1_510_000_00
    expect(result.totalPayments).toBe(1_510_000_00);
    expect(result.yearsPaid).toBe(7);
    expect(result.eligible).toBe(true);
    expect(result.section4).toBe(false);
    // 7 years → 50% + 5% × (7-5) = 60%
    expect(result.csvPercentage).toBe(0.6);
    expect(result.csvAmount).toBe(906_000_00);
    // Grace: 7 months
    expect(result.gracePeriod.eligible).toBe(true);
    expect(result.gracePeriod.months).toBe(7);
    expect(result.gracePeriod.canExercise).toBe(true);
  });

  it("computes Section 4 result for under 2 years", () => {
    const input: MacedaInput = {
      contractPrice: 2_500_000_00,
      downPayment: 250_000_00,
      monthlyInstallment: 15_000_00,
      contractStartDate: "2025-06-15",
      payments: makeRegularPayments("2025-07-15", 15_000_00, 8), // 8 months
      previousGracePeriod: false,
    };

    const result = compute(input);

    expect(result.eligible).toBe(false);
    expect(result.section4).toBe(true);
    expect(result.csvPercentage).toBe(0);
    expect(result.csvAmount).toBe(0);
    expect(result.gracePeriod.eligible).toBe(false);
    expect(result.gracePeriod.section4GraceDays).toBe(60);
  });

  it("computes exactly 2 years — Section 3 applies", () => {
    const input: MacedaInput = {
      contractPrice: 2_500_000_00,
      downPayment: 250_000_00,
      monthlyInstallment: 15_000_00,
      contractStartDate: "2024-01-15",
      payments: makeRegularPayments("2024-02-15", 15_000_00, 24),
      previousGracePeriod: false,
    };

    const result = compute(input);

    expect(result.yearsPaid).toBe(2);
    expect(result.eligible).toBe(true);
    expect(result.csvPercentage).toBe(0.5);
  });

  it("caps CSV at 90% for 15 years", () => {
    const input: MacedaInput = {
      contractPrice: 5_000_000_00,
      downPayment: 500_000_00,
      monthlyInstallment: 20_000_00,
      contractStartDate: "2011-01-15",
      payments: makeRegularPayments("2011-02-15", 20_000_00, 180), // 15 years
      previousGracePeriod: false,
    };

    const result = compute(input);

    expect(result.csvPercentage).toBe(0.9);
  });

  it("generates timeline entries", () => {
    const input: MacedaInput = {
      contractPrice: 2_500_000_00,
      downPayment: 250_000_00,
      monthlyInstallment: 15_000_00,
      contractStartDate: "2019-01-15",
      payments: makeRegularPayments("2019-02-15", 15_000_00, 84),
      previousGracePeriod: false,
    };

    const result = compute(input);

    expect(result.timeline.length).toBe(7);
    expect(result.timeline[0].year).toBe(1);
    expect(result.timeline[1].year).toBe(2);
    // Year 2 should have "2-year threshold" milestone
    const year2 = result.timeline.find((e) => e.year === 2);
    expect(year2?.milestone).toBe("2-year threshold");
    // Year 6 should have "5-year bonus start" milestone
    const year6 = result.timeline.find((e) => e.year === 6);
    expect(year6?.milestone).toBe("5-year bonus start");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:
```bash
cd projects/maceda-calculator && npx vitest run lib/engine/__tests__/compute.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement compute.ts**

```typescript
import { differenceInMonths, parseISO } from "date-fns";
import type { MacedaInput, MacedaResult, TimelineEntry } from "./types";
import { computeCsv } from "./csv";
import { computeGracePeriod } from "./grace-period";

/**
 * Orchestrator: takes full MacedaInput, returns complete MacedaResult.
 * Pure function — no side effects.
 */
export function compute(input: MacedaInput): MacedaResult {
  const totalPayments =
    input.downPayment +
    input.payments.reduce((sum, p) => sum + p.amount, 0);

  // Find latest payment date
  const sortedDates = input.payments
    .map((p) => p.date)
    .sort()
    .reverse();
  const latestPaymentDate = sortedDates[0];

  // yearsPaid = floor(months from contractStartDate to latest payment / 12)
  const contractStart = parseISO(input.contractStartDate);
  const latestPayment = parseISO(latestPaymentDate);
  const monthsDiff = differenceInMonths(latestPayment, contractStart);
  const yearsPaid = Math.floor(monthsDiff / 12);

  const csv = computeCsv(totalPayments, yearsPaid);
  const gracePeriod = computeGracePeriod(
    yearsPaid,
    input.previousGracePeriod,
    input.previousGracePeriodDate
  );

  const eligible = yearsPaid >= 2;
  const section4 = !eligible;

  // Build timeline: one entry per year
  const timeline: TimelineEntry[] = [];
  const monthlyAmount = input.monthlyInstallment;

  for (let y = 1; y <= yearsPaid; y++) {
    const cumulativePayments = input.downPayment + monthlyAmount * 12 * y;
    const yearCsv = computeCsv(cumulativePayments, y);

    let milestone: string | undefined;
    if (y === 2) milestone = "2-year threshold";
    if (y === 6) milestone = "5-year bonus start";
    if (yearCsv.percentage >= 0.9 && computeCsv(cumulativePayments, y - 1).percentage < 0.9) {
      milestone = "cap reached";
    }

    timeline.push({
      year: y,
      cumulativePayments,
      csvPercentage: yearCsv.percentage,
      csvAmount: yearCsv.amount,
      milestone,
    });
  }

  return {
    eligible,
    section4,
    totalPayments,
    yearsPaid,
    csvPercentage: csv.percentage,
    csvAmount: csv.amount,
    gracePeriod,
    timeline,
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run:
```bash
cd projects/maceda-calculator && npx vitest run lib/engine/__tests__/compute.test.ts
```

Expected: All 5 tests PASS.

- [ ] **Step 5: Run all engine tests together**

Run:
```bash
cd projects/maceda-calculator && npx vitest run
```

Expected: All tests across csv, grace-period, validation, compute PASS.

- [ ] **Step 6: Commit**

```bash
git add projects/maceda-calculator/lib/engine/compute.ts projects/maceda-calculator/lib/engine/__tests__/compute.test.ts
git commit -m "feat(maceda): compute orchestrator with tests — full engine complete"
```

---

## Task 7: Header Component

**Files:**
- Create: `projects/maceda-calculator/components/header.tsx`

- [ ] **Step 1: Create header.tsx**

Reference the mockup's header section. The header has:
- Logo mark (burnt sienna square with "M") + wordmark "Maceda"
- Title with italic emphasis on "rights"
- Subtitle paragraph

```tsx
export function Header() {
  return (
    <header className="mb-12">
      <div className="mb-8 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent font-heading text-base font-semibold text-white">
          M
        </div>
        <span className="font-heading text-lg font-semibold tracking-tight text-text-primary">
          Maceda
        </span>
      </div>
      <h1 className="mb-3 font-heading text-4xl font-light leading-tight tracking-tight text-text-primary">
        Know your <em className="font-normal italic">rights</em> under
        <br />
        the Maceda Law
      </h1>
      <p className="max-w-md text-base font-light leading-relaxed text-text-secondary">
        Calculate your Cash Surrender Value and grace period eligibility under
        Republic Act 6552 — the law that protects Filipino homebuyers paying in
        installments.
      </p>
    </header>
  );
}
```

- [ ] **Step 2: Wire header into page.tsx**

```tsx
import { Header } from "@/components/header";

export default function Home() {
  return (
    <main className="mx-auto max-w-[600px] px-6 py-12">
      <Header />
    </main>
  );
}
```

- [ ] **Step 3: Verify in browser**

Run dev server, open localhost:3000. Header should render with Fraunces serif font, warm parchment background, correct accent color on the logo mark.

- [ ] **Step 4: Commit**

```bash
git add projects/maceda-calculator/components/header.tsx projects/maceda-calculator/app/page.tsx
git commit -m "feat(maceda): header component with logo, title, and subtitle"
```

---

## Task 8: Contract Details Component

**Files:**
- Create: `projects/maceda-calculator/components/contract-details.tsx`

- [ ] **Step 1: Create contract-details.tsx**

This is a controlled form section with 4 fields in a 2×2 grid. Currency fields have a ₱ prefix. Uses the section-card pattern from the mockup.

```tsx
"use client";

interface ContractDetailsProps {
  contractPrice: string;
  downPayment: string;
  monthlyInstallment: string;
  contractStartDate: string;
  onChange: (field: string, value: string) => void;
  errors: Record<string, string>;
}

export function ContractDetails({
  contractPrice,
  downPayment,
  monthlyInstallment,
  contractStartDate,
  onChange,
  errors,
}: ContractDetailsProps) {
  return (
    <div className="rounded-xl border border-border-subtle bg-bg-elevated p-7">
      <div className="mb-5 font-heading text-[13px] font-semibold uppercase tracking-wider text-text-tertiary">
        Contract Details
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field
          label="Contract Price"
          prefix="₱"
          value={contractPrice}
          onChange={(v) => onChange("contractPrice", v)}
          error={errors.contractPrice}
        />
        <Field
          label="Down Payment"
          prefix="₱"
          value={downPayment}
          onChange={(v) => onChange("downPayment", v)}
          error={errors.downPayment}
        />
        <Field
          label="Monthly Installment"
          prefix="₱"
          value={monthlyInstallment}
          onChange={(v) => onChange("monthlyInstallment", v)}
          error={errors.monthlyInstallment}
        />
        <Field
          label="Contract Start Date"
          value={contractStartDate}
          onChange={(v) => onChange("contractStartDate", v)}
          placeholder="YYYY-MM-DD"
          error={errors.contractStartDate}
        />
      </div>
    </div>
  );
}

function Field({
  label,
  prefix,
  value,
  onChange,
  placeholder,
  error,
}: {
  label: string;
  prefix?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-medium text-text-secondary">
        {label}
      </label>
      <div className="relative">
        {prefix && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-text-tertiary">
            {prefix}
          </span>
        )}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-lg border bg-bg px-3.5 py-2.5 font-body text-sm text-text-primary transition-all focus:border-accent focus:bg-bg-elevated focus:shadow-[0_0_0_3px_var(--color-accent-glow)] focus:outline-none ${
            prefix ? "pl-7" : ""
          } ${error ? "border-red-400" : "border-border"}`}
        />
      </div>
      {error && (
        <span className="text-xs text-red-500">{error}</span>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add projects/maceda-calculator/components/contract-details.tsx
git commit -m "feat(maceda): contract details form component"
```

---

## Task 9: Payment Table Component

**Files:**
- Create: `projects/maceda-calculator/components/payment-table.tsx`

- [ ] **Step 1: Create payment-table.tsx**

This is the most complex form component. Features:
- Toggle for "I paid regularly" auto-fill
- Table rows with date + amount inputs
- Add/remove payment rows
- When auto-fill is on, generates rows from contract start date + monthly installment

```tsx
"use client";

import { useState, useEffect } from "react";

interface PaymentRow {
  date: string;
  amount: string;
}

interface PaymentTableProps {
  payments: PaymentRow[];
  onPaymentsChange: (payments: PaymentRow[]) => void;
  contractStartDate: string;
  monthlyInstallment: string;
  error?: string;
}

export function PaymentTable({
  payments,
  onPaymentsChange,
  contractStartDate,
  monthlyInstallment,
  error,
}: PaymentTableProps) {
  const [autoFill, setAutoFill] = useState(false);

  useEffect(() => {
    if (!autoFill || !contractStartDate || !monthlyInstallment) return;

    const start = new Date(contractStartDate);
    if (isNaN(start.getTime())) return;

    const now = new Date();
    const rows: PaymentRow[] = [];
    const current = new Date(start);
    current.setMonth(current.getMonth() + 1); // First payment is month after contract start

    while (current <= now) {
      const y = current.getFullYear();
      const m = String(current.getMonth() + 1).padStart(2, "0");
      const d = String(current.getDate()).padStart(2, "0");
      rows.push({ date: `${y}-${m}-${d}`, amount: monthlyInstallment });
      current.setMonth(current.getMonth() + 1);
    }

    onPaymentsChange(rows);
  }, [autoFill, contractStartDate, monthlyInstallment]);

  const addRow = () => {
    onPaymentsChange([...payments, { date: "", amount: "" }]);
  };

  const updateRow = (index: number, field: "date" | "amount", value: string) => {
    const updated = [...payments];
    updated[index] = { ...updated[index], [field]: value };
    onPaymentsChange(updated);
  };

  const removeRow = (index: number) => {
    onPaymentsChange(payments.filter((_, i) => i !== index));
  };

  // For display: show first 3, ellipsis, last 1 when auto-filled with many rows
  const showCollapsed = autoFill && payments.length > 6;
  const visibleRows = showCollapsed
    ? [...payments.slice(0, 3), ...payments.slice(-1)]
    : payments;
  const hiddenCount = showCollapsed ? payments.length - 4 : 0;

  return (
    <div className="rounded-xl border border-border-subtle bg-bg-elevated p-7">
      <div className="mb-5 font-heading text-[13px] font-semibold uppercase tracking-wider text-text-tertiary">
        Payment History
      </div>

      <div
        className="mb-4 flex cursor-pointer items-center gap-2.5 rounded-lg border border-accent-soft bg-accent-glow px-4 py-3"
        onClick={() => setAutoFill(!autoFill)}
      >
        <div
          className={`relative h-[18px] w-[34px] flex-shrink-0 rounded-full transition-colors ${
            autoFill ? "bg-accent" : "bg-border"
          }`}
        >
          <div
            className={`absolute top-[2px] h-[14px] w-[14px] rounded-full bg-white transition-transform ${
              autoFill ? "right-[2px]" : "left-[2px]"
            }`}
          />
        </div>
        <span className="text-[13px] font-medium text-accent">
          I paid regularly — auto-fill payments
        </span>
      </div>

      <div className="space-y-0.5">
        {/* Header row */}
        <div className="mb-1 grid grid-cols-[28px_1fr_1fr_28px] gap-2 border-b border-border-subtle pb-2.5">
          <div />
          <div className="text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">
            Date
          </div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">
            Amount
          </div>
          <div />
        </div>

        {visibleRows.map((row, i) => {
          const actualIndex =
            showCollapsed && i === visibleRows.length - 1
              ? payments.length - 1
              : i;
          return (
            <div
              key={actualIndex}
              className="grid grid-cols-[28px_1fr_1fr_28px] items-center gap-2 py-1.5"
            >
              <div className="pr-1 text-right text-[11px] font-medium text-text-tertiary">
                {actualIndex + 1}
              </div>
              <input
                type="text"
                value={row.date}
                onChange={(e) => updateRow(actualIndex, "date", e.target.value)}
                placeholder="YYYY-MM-DD"
                className="rounded-md border border-border bg-bg px-2.5 py-2 font-body text-[13px] text-text-primary focus:border-accent focus:outline-none"
                readOnly={autoFill}
              />
              <input
                type="text"
                value={row.amount}
                onChange={(e) => updateRow(actualIndex, "amount", e.target.value)}
                placeholder="₱0"
                className="rounded-md border border-border bg-bg px-2.5 py-2 font-body text-[13px] text-text-primary focus:border-accent focus:outline-none"
                readOnly={autoFill}
              />
              {!autoFill && (
                <button
                  onClick={() => removeRow(actualIndex)}
                  className="text-[11px] text-text-tertiary hover:text-red-400"
                >
                  ×
                </button>
              )}
            </div>
          );
        })}

        {showCollapsed && hiddenCount > 0 && (
          <div className="py-2 text-center text-[12px] italic text-text-tertiary">
            … {hiddenCount} auto-filled payments …
          </div>
        )}
      </div>

      {!autoFill && (
        <button
          onClick={addRow}
          className="mt-3 font-body text-[13px] font-medium text-accent hover:underline"
        >
          + Add a payment
        </button>
      )}

      {error && (
        <p className="mt-2 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add projects/maceda-calculator/components/payment-table.tsx
git commit -m "feat(maceda): payment table component with auto-fill toggle"
```

---

## Task 10: Grace Period Input Component

**Files:**
- Create: `projects/maceda-calculator/components/grace-period-input.tsx`

- [ ] **Step 1: Create grace-period-input.tsx**

Simple checkbox + conditional date picker.

```tsx
"use client";

interface GracePeriodInputProps {
  previousGracePeriod: boolean;
  previousGracePeriodDate: string;
  onChange: (field: string, value: string | boolean) => void;
  error?: string;
}

export function GracePeriodInput({
  previousGracePeriod,
  previousGracePeriodDate,
  onChange,
  error,
}: GracePeriodInputProps) {
  return (
    <div className="rounded-xl border border-border-subtle bg-bg-elevated p-7">
      <div className="mb-5 font-heading text-[13px] font-semibold uppercase tracking-wider text-text-tertiary">
        Grace Period History
      </div>
      <label className="flex cursor-pointer items-center gap-2.5">
        <input
          type="checkbox"
          checked={previousGracePeriod}
          onChange={(e) => onChange("previousGracePeriod", e.target.checked)}
          className="h-[18px] w-[18px] accent-accent"
        />
        <span className="text-sm text-text-secondary">
          I have previously exercised my grace period
        </span>
      </label>
      {previousGracePeriod && (
        <div className="mt-4 flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-text-secondary">
            When was it exercised?
          </label>
          <input
            type="text"
            value={previousGracePeriodDate}
            onChange={(e) =>
              onChange("previousGracePeriodDate", e.target.value)
            }
            placeholder="YYYY-MM-DD"
            className={`w-48 rounded-lg border bg-bg px-3.5 py-2.5 font-body text-sm text-text-primary transition-all focus:border-accent focus:bg-bg-elevated focus:shadow-[0_0_0_3px_var(--color-accent-glow)] focus:outline-none ${
              error ? "border-red-400" : "border-border"
            }`}
          />
          {error && <span className="text-xs text-red-500">{error}</span>}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add projects/maceda-calculator/components/grace-period-input.tsx
git commit -m "feat(maceda): grace period input component"
```

---

## Task 11: Calculator Form (Orchestrator) + Page Wiring

**Files:**
- Create: `projects/maceda-calculator/components/calculator-form.tsx`
- Modify: `projects/maceda-calculator/app/page.tsx`

- [ ] **Step 1: Create calculator-form.tsx**

This component owns the form state, calls the engine on submit, and passes results up to the page.

```tsx
"use client";

import { useState } from "react";
import { ContractDetails } from "./contract-details";
import { PaymentTable } from "./payment-table";
import { GracePeriodInput } from "./grace-period-input";
import { validateInput } from "@/lib/engine/validation";
import { compute } from "@/lib/engine/compute";
import type { MacedaInput, MacedaResult } from "@/lib/engine/types";

interface CalculatorFormProps {
  onResult: (result: MacedaResult) => void;
}

function parseCentavos(s: string): number {
  const cleaned = s.replace(/[^0-9.]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : Math.round(num * 100);
}

export function CalculatorForm({ onResult }: CalculatorFormProps) {
  const [contractPrice, setContractPrice] = useState("");
  const [downPayment, setDownPayment] = useState("");
  const [monthlyInstallment, setMonthlyInstallment] = useState("");
  const [contractStartDate, setContractStartDate] = useState("");
  const [payments, setPayments] = useState<{ date: string; amount: string }[]>([
    { date: "", amount: "" },
  ]);
  const [previousGracePeriod, setPreviousGracePeriod] = useState(false);
  const [previousGracePeriodDate, setPreviousGracePeriodDate] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleContractChange = (field: string, value: string) => {
    if (field === "contractPrice") setContractPrice(value);
    if (field === "downPayment") setDownPayment(value);
    if (field === "monthlyInstallment") setMonthlyInstallment(value);
    if (field === "contractStartDate") setContractStartDate(value);
  };

  const handleGraceChange = (field: string, value: string | boolean) => {
    if (field === "previousGracePeriod")
      setPreviousGracePeriod(value as boolean);
    if (field === "previousGracePeriodDate")
      setPreviousGracePeriodDate(value as string);
  };

  const handleSubmit = () => {
    const input: MacedaInput = {
      contractPrice: parseCentavos(contractPrice),
      downPayment: parseCentavos(downPayment),
      monthlyInstallment: parseCentavos(monthlyInstallment),
      contractStartDate,
      payments: payments
        .filter((p) => p.date && p.amount)
        .map((p) => ({
          date: p.date,
          amount: parseCentavos(p.amount),
        })),
      previousGracePeriod,
      previousGracePeriodDate: previousGracePeriod
        ? previousGracePeriodDate
        : undefined,
    };

    const validation = validateInput(input);
    if (!validation.valid) {
      const errMap: Record<string, string> = {};
      validation.errors.forEach((e) => {
        errMap[e.field] = e.message;
      });
      setErrors(errMap);
      return;
    }

    setErrors({});
    const result = compute(input);
    onResult(result);
  };

  const hasRequiredFields =
    contractPrice && monthlyInstallment && contractStartDate;

  return (
    <div className="space-y-4">
      <ContractDetails
        contractPrice={contractPrice}
        downPayment={downPayment}
        monthlyInstallment={monthlyInstallment}
        contractStartDate={contractStartDate}
        onChange={handleContractChange}
        errors={errors}
      />
      <PaymentTable
        payments={payments}
        onPaymentsChange={setPayments}
        contractStartDate={contractStartDate}
        monthlyInstallment={monthlyInstallment}
        error={errors.payments}
      />
      <GracePeriodInput
        previousGracePeriod={previousGracePeriod}
        previousGracePeriodDate={previousGracePeriodDate}
        onChange={handleGraceChange}
        error={errors.previousGracePeriodDate}
      />
      <button
        onClick={handleSubmit}
        disabled={!hasRequiredFields}
        className="w-full rounded-xl bg-text-primary py-4 font-body text-[15px] font-semibold tracking-tight text-bg transition-all hover:-translate-y-px hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-40"
      >
        Calculate my rights
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Wire everything into page.tsx**

```tsx
"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { CalculatorForm } from "@/components/calculator-form";
import type { MacedaResult } from "@/lib/engine/types";

export default function Home() {
  const [result, setResult] = useState<MacedaResult | null>(null);

  return (
    <main className="mx-auto max-w-[600px] px-6 py-12">
      <Header />
      <CalculatorForm onResult={setResult} />
      {result && (
        <div className="mt-10">
          {/* Results components wired in next tasks */}
          <pre className="rounded-lg bg-bg-elevated p-4 text-xs">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </main>
  );
}
```

- [ ] **Step 3: Verify in browser**

Open localhost:3000. Fill in contract details, use auto-fill toggle, click Calculate. Should see raw JSON result below the form.

- [ ] **Step 4: Commit**

```bash
git add projects/maceda-calculator/components/calculator-form.tsx projects/maceda-calculator/app/page.tsx
git commit -m "feat(maceda): calculator form orchestrator — form to engine wiring complete"
```

---

## Task 12: Results Components (Section 3 — Eligible)

**Files:**
- Create: `projects/maceda-calculator/components/results.tsx`
- Create: `projects/maceda-calculator/components/results-eligible.tsx`

- [ ] **Step 1: Create results-eligible.tsx**

Hero card + grace period card for eligible buyers. Reference mockup's result-hero and result-row styling.

```tsx
import type { MacedaResult } from "@/lib/engine/types";

function formatPeso(centavos: number): string {
  const pesos = centavos / 100;
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(pesos);
}

interface ResultsEligibleProps {
  result: MacedaResult;
}

export function ResultsEligible({ result }: ResultsEligibleProps) {
  return (
    <>
      {/* Hero Card */}
      <div className="relative overflow-hidden rounded-xl border border-border-subtle bg-bg-elevated text-center shadow-sm">
        {/* Accent bar */}
        <div className="h-[3px] bg-accent" />
        <div className="px-7 py-9">
          <div className="mb-2.5 font-heading text-xs font-semibold uppercase tracking-widest text-accent">
            You are owed
          </div>
          <div className="font-mono text-[42px] font-semibold leading-none tracking-tighter text-text-primary">
            {formatPeso(result.csvAmount)}
          </div>
          <div className="mt-2 text-sm font-light text-text-secondary">
            {(result.csvPercentage * 100).toFixed(1)}% of{" "}
            {formatPeso(result.totalPayments)} in total payments
          </div>
          <span className="mt-3.5 inline-block rounded-full bg-success-soft px-3.5 py-1 text-xs font-semibold text-success">
            Eligible for CSV refund
          </span>
        </div>
      </div>

      {/* Grace Period Card */}
      <div className="mt-4 flex items-center justify-between rounded-xl border border-border-subtle bg-bg-elevated px-6 py-5">
        <div>
          <div className="text-[13px] text-text-secondary">Grace Period</div>
          <div className="mt-0.5 text-sm text-text-primary">
            You may delay payments for up to
          </div>
        </div>
        <div className="font-mono text-lg font-semibold text-success">
          {result.gracePeriod.months} mo
        </div>
      </div>

      {!result.gracePeriod.canExercise && result.gracePeriod.nextEligibleDate && (
        <div className="mt-2 rounded-lg border border-border-subtle bg-bg-elevated px-6 py-3 text-xs text-text-secondary">
          Grace period was previously exercised. Next eligible date:{" "}
          <span className="font-semibold">{result.gracePeriod.nextEligibleDate}</span>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 2: Create results.tsx switcher**

```tsx
import type { MacedaResult } from "@/lib/engine/types";
import { ResultsEligible } from "./results-eligible";
import { ResultsIneligible } from "./results-ineligible";

interface ResultsProps {
  result: MacedaResult;
}

export function Results({ result }: ResultsProps) {
  return (
    <div>
      {/* Divider */}
      <div className="relative my-10">
        <div className="h-px bg-border" />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-bg px-4 font-heading text-xs font-semibold uppercase tracking-widest text-text-tertiary">
          Results
        </span>
      </div>

      {result.eligible ? (
        <ResultsEligible result={result} />
      ) : (
        <ResultsIneligible result={result} />
      )}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add projects/maceda-calculator/components/results.tsx projects/maceda-calculator/components/results-eligible.tsx
git commit -m "feat(maceda): Section 3 results — hero card and grace period"
```

---

## Task 13: Results Components (Section 4 — Ineligible)

**Files:**
- Create: `projects/maceda-calculator/components/results-ineligible.tsx`

- [ ] **Step 1: Create results-ineligible.tsx**

Info card explaining Section 4 rights + progress toward 2-year threshold.

```tsx
import type { MacedaResult } from "@/lib/engine/types";

interface ResultsIneligibleProps {
  result: MacedaResult;
}

export function ResultsIneligible({ result }: ResultsIneligibleProps) {
  const progressPercent = Math.min(100, (result.yearsPaid / 2) * 100);
  const monthsToThreshold = Math.max(0, 24 - result.yearsPaid * 12);

  return (
    <>
      {/* Info Card */}
      <div className="rounded-xl border border-border-subtle bg-bg-elevated px-7 py-6">
        <div className="mb-2 font-heading text-xs font-semibold uppercase tracking-widest text-text-tertiary">
          Section 4 — Under 2 Years
        </div>
        <p className="text-sm leading-relaxed text-text-secondary">
          You have not yet reached the 2-year payment threshold for a Cash
          Surrender Value refund. However, under{" "}
          <strong className="font-semibold text-text-primary">
            Section 4 of RA 6552
          </strong>
          , you are entitled to a{" "}
          <strong className="font-semibold text-accent">
            60-day grace period
          </strong>{" "}
          from the date of default to catch up on missed payments without
          additional interest.
        </p>
      </div>

      {/* Progress toward threshold */}
      <div className="mt-4 rounded-xl border border-border-subtle bg-bg-elevated px-7 py-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[13px] text-text-secondary">
            Progress to CSV eligibility
          </span>
          <span className="font-mono text-sm font-medium text-text-primary">
            {result.yearsPaid} of 2 years
          </span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-accent transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        {monthsToThreshold > 0 && (
          <p className="mt-2 text-xs text-text-tertiary">
            ~{monthsToThreshold} more months of payments until you qualify for a
            CSV refund under Section 3.
          </p>
        )}
      </div>
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add projects/maceda-calculator/components/results-ineligible.tsx
git commit -m "feat(maceda): Section 4 results — info card and progress indicator"
```

---

## Task 14: Timeline Visualization

**Files:**
- Create: `projects/maceda-calculator/components/timeline.tsx`

- [ ] **Step 1: Create timeline.tsx**

Horizontal segmented bar showing base 50% / bonus / remaining. Year labels and milestone markers.

```tsx
import type { MacedaResult } from "@/lib/engine/types";

interface TimelineProps {
  result: MacedaResult;
}

export function Timeline({ result }: TimelineProps) {
  if (!result.eligible || result.timeline.length === 0) return null;

  const basePct = 50;
  const bonusPct = (result.csvPercentage - 0.5) * 100;
  const remainingPct = Math.max(0, 90 - basePct - bonusPct);

  return (
    <div className="mt-4 rounded-xl border border-border-subtle bg-bg-elevated p-7">
      <div className="mb-5 font-heading text-[13px] font-semibold uppercase tracking-wider text-text-tertiary">
        CSV Buildup Over Time
      </div>

      {/* Segmented bar */}
      <div className="mb-2.5 flex h-9 overflow-hidden rounded-lg">
        <div
          className="flex items-center justify-center bg-accent text-[11px] font-semibold text-white"
          style={{ flex: basePct }}
        >
          Base 50%
        </div>
        {bonusPct > 0 && (
          <div
            className="flex items-center justify-center text-[11px] font-semibold text-white"
            style={{ flex: bonusPct, backgroundColor: "#D88A5C" }}
          >
            +{bonusPct.toFixed(1)}%
          </div>
        )}
        <div
          className="flex items-center justify-center bg-border text-[11px] font-normal text-text-tertiary"
          style={{ flex: remainingPct }}
        >
          {remainingPct > 10 ? "remaining" : ""}
        </div>
      </div>

      {/* Year labels */}
      <div className="mb-4 flex justify-between text-[11px] text-text-tertiary">
        <span>Year 1</span>
        <span className="font-semibold text-accent">2-yr threshold</span>
        {result.yearsPaid >= 5 && <span>Year 5</span>}
        <span>Year {result.yearsPaid} (now)</span>
      </div>

      {/* Explanatory note */}
      <div className="border-t border-border-subtle pt-3.5 text-[13px] font-light leading-relaxed text-text-secondary">
        After 2 years of payments, you unlock a 50% base refund. Each additional
        year beyond year 5 adds 5%, capped at 90% of total payments made.
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Wire timeline into results-eligible.tsx**

Add `import { Timeline } from "./timeline"` and render `<Timeline result={result} />` after the grace period card.

- [ ] **Step 3: Commit**

```bash
git add projects/maceda-calculator/components/timeline.tsx projects/maceda-calculator/components/results-eligible.tsx
git commit -m "feat(maceda): timeline visualization — CSV buildup bar"
```

---

## Task 15: Legal Basis Component

**Files:**
- Create: `projects/maceda-calculator/components/legal-basis.tsx`

- [ ] **Step 1: Create legal-basis.tsx**

Collapsible card with RA 6552 citations. Shows Section 3 or Section 4 citations depending on eligibility.

```tsx
"use client";

import { useState } from "react";

interface LegalBasisProps {
  section4: boolean;
}

export function LegalBasis({ section4 }: LegalBasisProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-4 rounded-xl border border-border-subtle bg-[#fafaf9] px-6 py-5">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between"
      >
        <span className="text-[13px] font-medium text-text-secondary">
          Legal basis
        </span>
        <span
          className={`text-xs text-text-tertiary transition-transform ${
            open ? "rotate-180" : ""
          }`}
        >
          ▼
        </span>
      </button>

      {open && (
        <div className="mt-4 border-t border-border-subtle pt-4 text-[13px] font-light leading-relaxed text-text-secondary">
          {section4 ? (
            <>
              <p className="mb-2.5">
                <strong className="font-semibold text-text-primary">
                  Section 4, RA 6552:
                </strong>{" "}
                &ldquo;In case where less than two years of installments were
                paid, the seller shall give the buyer a grace period of not less
                than sixty days from the date the installment became due.&rdquo;
              </p>
              <p className="mb-2.5">
                If the buyer fails to pay the installments due at the expiration
                of the grace period, the seller may cancel the contract after
                thirty days from receipt by the buyer of the notice of
                cancellation or the demand for rescission of the contract by a
                notarial act.
              </p>
            </>
          ) : (
            <>
              <p className="mb-2.5">
                <strong className="font-semibold text-text-primary">
                  Section 3, RA 6552:
                </strong>{" "}
                &ldquo;…the actual cash surrender value of the payments on the
                property equivalent to fifty percent of the total payments
                made…&rdquo;
              </p>
              <p className="mb-2.5">
                <strong className="font-semibold text-text-primary">
                  Section 3(b):
                </strong>{" "}
                &ldquo;…an additional five percent every year but not to exceed
                ninety percent of the total payments made…&rdquo;
              </p>
            </>
          )}
          <p className="text-xs italic text-text-tertiary">
            Republic Act No. 6552, &ldquo;An Act to Provide Protection to Buyers
            of Real Estate on Installment Payments&rdquo; (1972)
          </p>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Wire legal-basis into results-eligible.tsx and results-ineligible.tsx**

Add `<LegalBasis section4={false} />` at the bottom of results-eligible.tsx and `<LegalBasis section4={true} />` at the bottom of results-ineligible.tsx.

- [ ] **Step 3: Wire Results component into page.tsx**

Replace the `<pre>` JSON debug output with `<Results result={result} />`.

- [ ] **Step 4: Verify full flow in browser**

Run dev server, fill form, click Calculate. Should see the full results: hero card, grace period, timeline, legal basis. Test both eligible (2+ years) and ineligible (under 2 years) cases.

- [ ] **Step 5: Commit**

```bash
git add projects/maceda-calculator/components/legal-basis.tsx projects/maceda-calculator/components/results-eligible.tsx projects/maceda-calculator/components/results-ineligible.tsx projects/maceda-calculator/app/page.tsx
git commit -m "feat(maceda): legal basis component + full page wiring complete"
```

---

## Task 16: Footer + Disclaimer

**Files:**
- Modify: `projects/maceda-calculator/app/page.tsx`

- [ ] **Step 1: Add footer to page.tsx**

After the results section, add:

```tsx
<footer className="mt-12 border-t border-border pt-6 text-center text-xs leading-relaxed text-text-tertiary">
  This tool provides estimates based on RA 6552. It is not legal advice.
  <br />
  Consult a licensed attorney for guidance on your specific situation.
</footer>
```

- [ ] **Step 2: Commit**

```bash
git add projects/maceda-calculator/app/page.tsx
git commit -m "feat(maceda): footer with legal disclaimer"
```

---

## Task 17: Playwright E2E Setup + Tests

**Files:**
- Create: `projects/maceda-calculator/playwright.config.ts`
- Create: `projects/maceda-calculator/e2e/calculator.spec.ts`

- [ ] **Step 1: Create playwright.config.ts**

```typescript
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
```

- [ ] **Step 2: Create calculator.spec.ts with E2E tests**

```typescript
import { test, expect } from "@playwright/test";

test.describe("Maceda Calculator", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("renders header and form", async ({ page }) => {
    await expect(
      page.getByText("Know your rights under the Maceda Law")
    ).toBeVisible();
    await expect(page.getByText("Contract Details")).toBeVisible();
    await expect(page.getByText("Payment History")).toBeVisible();
    await expect(page.getByText("Calculate my rights")).toBeVisible();
  });

  test("calculates CSV for 7 years of regular payments", async ({ page }) => {
    // Fill contract details
    const contractPrice = page.locator('input').first();
    await contractPrice.fill("2500000");

    const downPayment = page.locator('input').nth(1);
    await downPayment.fill("250000");

    const installment = page.locator('input').nth(2);
    await installment.fill("15000");

    const startDate = page.locator('input').nth(3);
    await startDate.fill("2019-01-15");

    // Enable auto-fill
    await page.getByText("I paid regularly").click();

    // Click calculate
    await page.getByText("Calculate my rights").click();

    // Verify results
    await expect(page.getByText("You are owed")).toBeVisible();
    await expect(page.getByText("Eligible for CSV refund")).toBeVisible();
    await expect(page.getByText("Grace Period")).toBeVisible();
  });

  test("shows Section 4 for under 2 years", async ({ page }) => {
    const contractPrice = page.locator('input').first();
    await contractPrice.fill("2500000");

    const downPayment = page.locator('input').nth(1);
    await downPayment.fill("250000");

    const installment = page.locator('input').nth(2);
    await installment.fill("15000");

    const startDate = page.locator('input').nth(3);
    await startDate.fill("2025-06-15");

    // Enable auto-fill (will generate <2 years of payments)
    await page.getByText("I paid regularly").click();

    await page.getByText("Calculate my rights").click();

    await expect(page.getByText("Section 4")).toBeVisible();
    await expect(page.getByText("60-day grace period")).toBeVisible();
    await expect(page.getByText("Progress to CSV eligibility")).toBeVisible();
  });

  test("calculate button is disabled without required fields", async ({
    page,
  }) => {
    const btn = page.getByText("Calculate my rights");
    await expect(btn).toBeDisabled();
  });
});
```

- [ ] **Step 3: Install Playwright browsers**

Run:
```bash
cd projects/maceda-calculator && npx playwright install chromium
```

- [ ] **Step 4: Run E2E tests**

Run:
```bash
cd projects/maceda-calculator && npx playwright test
```

Expected: All 4 tests PASS. If any fail, fix the selectors or component wiring as needed.

- [ ] **Step 5: Commit**

```bash
git add projects/maceda-calculator/playwright.config.ts projects/maceda-calculator/e2e/
git commit -m "feat(maceda): Playwright E2E tests — full calculator flow"
```

---

## Task 18: Final Visual Polish + Mobile Responsiveness

**Files:**
- Modify: `projects/maceda-calculator/app/globals.css`
- Modify: various components as needed

- [ ] **Step 1: Open the app in browser side-by-side with the mockup**

Open `localhost:3000` and `.superpowers/brainstorm/624804-1774183357/anthropic-feel.html` side by side. Compare spacing, typography, colors, and overall feel.

- [ ] **Step 2: Fix any visual discrepancies**

Common issues to check:
- Font weights matching the mockup (h1 should be font-light/300, not heavier)
- Section labels using Fraunces at 13px uppercase with correct letter-spacing
- Input focus states with accent-glow shadow
- Border colors matching (border-subtle for cards, border for inputs)
- Grain texture overlay rendering

- [ ] **Step 3: Test mobile viewport**

Resize browser to 375px width. Verify:
- Form fields stack to single column on mobile (update grid-cols-2 to use responsive breakpoints: `grid-cols-1 sm:grid-cols-2`)
- All text is readable
- Buttons are full-width and easy to tap
- Timeline bar is still visible

- [ ] **Step 4: Run all tests**

Run:
```bash
cd projects/maceda-calculator && npm test && npx playwright test
```

Expected: All unit tests and E2E tests PASS.

- [ ] **Step 5: Commit**

```bash
git add -A projects/maceda-calculator/
git commit -m "feat(maceda): visual polish and mobile responsiveness"
```

---

## Task 19: Final Verification

- [ ] **Step 1: Run full test suite**

```bash
cd projects/maceda-calculator && npm test
```

Expected: All unit tests PASS.

- [ ] **Step 2: Run E2E tests**

```bash
cd projects/maceda-calculator && npx playwright test
```

Expected: All E2E tests PASS.

- [ ] **Step 3: Run build**

```bash
cd projects/maceda-calculator && npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 4: Visual verification in browser**

Open localhost:3000 and verify:
1. Header renders with correct fonts and colors
2. Form accepts input, auto-fill works
3. Section 3 results display correctly for 7+ years
4. Section 4 results display correctly for <2 years
5. Timeline visualization renders
6. Legal basis expands/collapses
7. Mobile layout works at 375px
8. Grain texture visible on background

- [ ] **Step 5: Final commit if any fixes were needed**

```bash
git add -A projects/maceda-calculator/
git commit -m "feat(maceda): final verification and fixes"
```
