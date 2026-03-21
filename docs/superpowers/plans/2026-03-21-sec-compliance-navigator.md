# SEC Compliance Navigator — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone web app that computes SEC compliance penalties for Philippine corporations and guides them through remediation.

**Architecture:** Next.js app with an in-process pure-function computation engine. Supabase for auth and database. The engine is the core — a pure TypeScript module that takes corporation data and returns penalty breakdowns. The frontend is a wizard → results → remediation flow with a signup gate between results and remediation.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Supabase (auth + Postgres), Vitest (unit), Playwright (e2e). Fonts: Newsreader + Public Sans. Colors: Charcoal (#1C1C1E) + SEC Blue (#1B4F72) + Crimson (#A63232).

**Spec:** `docs/superpowers/specs/2026-03-21-sec-compliance-navigator-design.md`

---

## File Structure

```
apps/sec-compliance/
├── package.json
├── next.config.ts
├── tsconfig.json
├── postcss.config.mjs
├── components.json                    # shadcn/ui config
├── fly.toml
├── Dockerfile
├── .env.local.example
├── vitest.config.ts
├── playwright.config.ts
│
├── supabase/
│   ├── config.toml
│   └── migrations/
│       └── 001_schema.sql             # users, corporations, filing_records, computations
│
├── src/
│   ├── app/
│   │   ├── layout.tsx                 # root layout (fonts, metadata, providers)
│   │   ├── globals.css                # tailwind + design tokens
│   │   ├── page.tsx                   # landing/homepage
│   │   ├── wizard/
│   │   │   └── page.tsx               # multi-step wizard (client component)
│   │   ├── results/
│   │   │   └── page.tsx               # penalty results (reads from URL params)
│   │   ├── login/
│   │   │   └── page.tsx               # login page
│   │   ├── signup/
│   │   │   └── page.tsx               # signup page
│   │   ├── remediation/
│   │   │   └── page.tsx               # gated behind auth — guide + docs + cost estimate
│   │   └── api/
│   │       ├── compute/
│   │       │   └── route.ts           # POST: run computation engine
│   │       └── auth/
│   │           └── callback/
│   │               └── route.ts       # Supabase OAuth callback
│   │
│   ├── engine/                        # pure computation — no framework deps
│   │   ├── types.ts                   # all input/output types
│   │   ├── penalty-schedule.ts        # penalty lookup tables as typed data
│   │   ├── timeline.ts               # generate expected filing timeline
│   │   ├── penalties.ts              # compute penalties per missed filing
│   │   ├── status.ts                 # determine compliance status
│   │   ├── reinstatement.ts          # compute reinstatement cost estimate
│   │   ├── amnesty.ts               # amnesty program config + comparison
│   │   └── compute.ts               # orchestrator — takes inputs, returns full result
│   │
│   ├── components/
│   │   ├── ui/                        # shadcn/ui primitives
│   │   ├── wizard/
│   │   │   ├── corp-type-step.tsx     # step 1: domicile + corp type
│   │   │   ├── details-step.tsx       # step 2: incorporation date + RE bracket + MC28
│   │   │   ├── filings-step.tsx       # step 3: filing checklist grid
│   │   │   ├── suspension-step.tsx    # step 4: suspension/revocation
│   │   │   └── wizard-shell.tsx       # step navigation + progress bar
│   │   ├── results/
│   │   │   ├── compliance-timeline.tsx # hero: horizontal timeline visualization
│   │   │   ├── penalty-table.tsx      # itemized penalty breakdown table
│   │   │   ├── status-badge.tsx       # Active/Delinquent/Suspended/Revoked badge
│   │   │   ├── risk-flag.tsx          # delinquency/revocation risk warning
│   │   │   └── results-summary.tsx    # total + CTA to remediation
│   │   ├── remediation/
│   │   │   ├── cost-estimate.tsx      # reinstatement cost breakdown
│   │   │   ├── amnesty-comparison.tsx # amnesty vs. standard path (when active)
│   │   │   ├── document-checklist.tsx # required documents list
│   │   │   ├── petition-generator.tsx # template-fill petition cover letter
│   │   │   └── step-guide.tsx         # step-by-step remediation guide
│   │   └── layout/
│   │       ├── header.tsx             # site header/nav
│   │       └── footer.tsx             # site footer + disclaimer
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts             # browser client
│   │   │   ├── server.ts             # server client
│   │   │   └── middleware.ts          # auth middleware
│   │   └── utils.ts                   # cn() helper, formatCurrency, etc.
│   │
│   └── middleware.ts                  # Next.js middleware (auth redirect for /remediation)
│
└── __tests__/
    ├── engine/
    │   ├── timeline.test.ts
    │   ├── penalties.test.ts
    │   ├── status.test.ts
    │   ├── reinstatement.test.ts
    │   └── compute.test.ts            # integration: full worked example
    └── e2e/
        ├── wizard-flow.spec.ts
        ├── results-page.spec.ts
        └── auth-gate.spec.ts
```

---

## Task 1: Project Scaffold

**Files:**
- Create: `apps/sec-compliance/package.json`
- Create: `apps/sec-compliance/next.config.ts`
- Create: `apps/sec-compliance/tsconfig.json`
- Create: `apps/sec-compliance/postcss.config.mjs`
- Create: `apps/sec-compliance/vitest.config.ts`
- Create: `apps/sec-compliance/.env.local.example`
- Create: `apps/sec-compliance/src/app/layout.tsx`
- Create: `apps/sec-compliance/src/app/globals.css`
- Create: `apps/sec-compliance/src/app/page.tsx`
- Create: `apps/sec-compliance/src/lib/utils.ts`

- [ ] **Step 1: Create directory and package.json**

```bash
mkdir -p apps/sec-compliance
```

```json
{
  "name": "sec-compliance",
  "private": true,
  "version": "0.1.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@supabase/ssr": "^0.9.0",
    "@supabase/supabase-js": "^2.99.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lucide-react": "^0.577.0",
    "next": "16.1.6",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "react-hook-form": "^7.71.0",
    "shadcn": "^4.0.7",
    "tailwind-merge": "^3.5.0",
    "zod": "^4.3.0"
  },
  "devDependencies": {
    "@playwright/test": "^1.58.0",
    "@tailwindcss/postcss": "^4",
    "@testing-library/jest-dom": "^6.9.0",
    "@testing-library/react": "^16.3.0",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@vitejs/plugin-react": "^6.0.0",
    "jsdom": "^28.1.0",
    "tailwindcss": "^4",
    "typescript": "^5",
    "vitest": "^4.1.0"
  }
}
```

- [ ] **Step 2: Create config files**

`next.config.ts`:
```ts
import type { NextConfig } from "next";
const nextConfig: NextConfig = { output: "standalone" };
export default nextConfig;
```

`tsconfig.json`:
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
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

`postcss.config.mjs`:
```js
const config = { plugins: { "@tailwindcss/postcss": {} } };
export default config;
```

`vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    include: ["__tests__/**/*.test.ts"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
```

`.env.local.example`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

- [ ] **Step 3: Create root layout with fonts and design tokens**

`src/app/globals.css`:
```css
@import "tailwindcss";

@theme {
  --color-charcoal: #1C1C1E;
  --color-sec-blue: #1B4F72;
  --color-crimson: #A63232;
  --color-gray-secondary: #6B7280;
  --color-gray-muted: #9CA3AF;
  --color-divider: #F0F0F0;

  --font-display: "Newsreader", serif;
  --font-body: "Public Sans", sans-serif;
}
```

`src/app/layout.tsx` — root layout loading Newsreader + Public Sans from Google Fonts, setting metadata for "SEC Compliance Navigator", wrapping children in body with `font-body` class.

`src/app/page.tsx` — placeholder homepage with "Is your corporation in trouble with the SEC?" heading and a link to `/wizard`.

`src/lib/utils.ts` — `cn()` helper (clsx + tailwind-merge) and `formatCurrency(amount: number)` that formats as ₱X,XXX.

- [ ] **Step 4: Install dependencies and verify dev server starts**

```bash
cd apps/sec-compliance && npm install && npm run dev
```

Expected: Next.js dev server starts on localhost:3000, homepage renders.

- [ ] **Step 5: Commit**

```bash
git add apps/sec-compliance/
git commit -m "feat(sec-compliance): scaffold Next.js project with design tokens"
```

---

## Task 2: Engine Types & Penalty Schedule Data

**Files:**
- Create: `apps/sec-compliance/src/engine/types.ts`
- Create: `apps/sec-compliance/src/engine/penalty-schedule.ts`
- Test: `apps/sec-compliance/__tests__/engine/penalty-schedule.test.ts`

- [ ] **Step 1: Write failing test for penalty lookup**

```ts
// __tests__/engine/penalty-schedule.test.ts
import { describe, it, expect } from "vitest";
import { lookupPenalty } from "@/engine/penalty-schedule";

describe("lookupPenalty", () => {
  it("returns correct penalty for domestic stock, non-filing, 100k-500k bracket, 1st offense", () => {
    const result = lookupPenalty({
      domicile: "domestic",
      corpType: "stock",
      violationType: "non_filing",
      reBracket: "100k_500k",
      offenseNumber: 1,
    });
    expect(result).toEqual({ penaltyAmount: 15000, monthlySurcharge: 1000 });
  });

  it("returns correct penalty for domestic non-stock, late filing, negative bracket, 3rd offense", () => {
    const result = lookupPenalty({
      domicile: "domestic",
      corpType: "non_stock",
      violationType: "late_filing",
      reBracket: "negative",
      offenseNumber: 3,
    });
    expect(result).toEqual({ penaltyAmount: 7000, monthlySurcharge: 500 });
  });

  it("returns zero surcharge for capital deficiency", () => {
    const result = lookupPenalty({
      domicile: "domestic",
      corpType: "stock",
      violationType: "non_filing",
      reBracket: "capital_deficiency",
      offenseNumber: 1,
    });
    expect(result).toEqual({ penaltyAmount: 10000, monthlySurcharge: 0 });
  });

  it("caps offense number at 5 for offenses 5+", () => {
    const result = lookupPenalty({
      domicile: "domestic",
      corpType: "stock",
      violationType: "non_filing",
      reBracket: "above_10m",
      offenseNumber: 5,
    });
    expect(result).toEqual({ penaltyAmount: 54000, monthlySurcharge: 1000 });
  });

  it("returns 6th offense with 100% surcharge on total assessed fines", () => {
    // 6th offense = 5th offense penalty + 100% surcharge flag
    const result = lookupPenalty({
      domicile: "domestic",
      corpType: "stock",
      violationType: "non_filing",
      reBracket: "above_10m",
      offenseNumber: 6,
    });
    // 6th offense returns 5th offense values + revocationSurcharge flag
    expect(result.penaltyAmount).toBe(54000);
    expect(result.monthlySurcharge).toBe(1000);
    expect(result.revocationSurcharge).toBe(true);
  });

  it("uses stock table for OPC", () => {
    const stockResult = lookupPenalty({
      domicile: "domestic",
      corpType: "stock",
      violationType: "non_filing",
      reBracket: "100k_500k",
      offenseNumber: 1,
    });
    const opcResult = lookupPenalty({
      domicile: "domestic",
      corpType: "opc",
      violationType: "non_filing",
      reBracket: "100k_500k",
      offenseNumber: 1,
    });
    expect(opcResult).toEqual(stockResult);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd apps/sec-compliance && npx vitest run __tests__/engine/penalty-schedule.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement types.ts**

`src/engine/types.ts` — define all types:
- `Domicile = "domestic"` (foreign deferred)
- `CorpType = "stock" | "non_stock" | "opc"`
- `ReportType = "GIS" | "AFS" | "BO"`
- `ViolationType = "late_filing" | "non_filing"`
- `REBracket = "capital_deficiency" | "negative" | "0_100k" | "100k_500k" | "500k_5m" | "5m_10m" | "above_10m"`
- `ComplianceStatus = "active" | "delinquent" | "suspended" | "revoked"`
- `FilingRecord = { reportType: ReportType; year: number; status: "not_filed" | "filed_late" | "filed_on_time" }`
- `ComputationInput` — all wizard inputs
- `PenaltyLineItem` — per-filing penalty result (year, reportType, offenseNumber, basePenalty, surchargeMonths, surchargeRate, totalPenalty)
- `ComputationResult` — full output (status, lineItems, totalPenalty, riskAssessment, reinstatementEstimate)

- [ ] **Step 4: Implement penalty-schedule.ts**

Encode all 4 penalty tables from the spec as typed lookup data. Export `lookupPenalty(params) => { penaltyAmount, monthlySurcharge, revocationSurcharge }`. OPC uses the same table as stock. For offense 1-5: lookup directly. For offense 6+: return 5th offense values with `revocationSurcharge: true` (signals the 100% surcharge on total assessed fines per spec).

- [ ] **Step 5: Run tests to verify they pass**

```bash
cd apps/sec-compliance && npx vitest run __tests__/engine/penalty-schedule.test.ts
```

Expected: All 7 tests PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/sec-compliance/src/engine/ apps/sec-compliance/__tests__/
git commit -m "feat(sec-compliance): engine types and penalty schedule lookup"
```

---

## Task 3: Filing Timeline Generator

**Files:**
- Create: `apps/sec-compliance/src/engine/timeline.ts`
- Test: `apps/sec-compliance/__tests__/engine/timeline.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// __tests__/engine/timeline.test.ts
import { describe, it, expect } from "vitest";
import { generateExpectedFilings } from "@/engine/timeline";

describe("generateExpectedFilings", () => {
  it("generates GIS and AFS for every year from incorporation to present", () => {
    const result = generateExpectedFilings({
      incorporationYear: 2020,
      currentYear: 2024,
    });
    const gisFilings = result.filter((f) => f.reportType === "GIS");
    const afsFilings = result.filter((f) => f.reportType === "AFS");
    expect(gisFilings).toHaveLength(5); // 2020, 2021, 2022, 2023, 2024
    expect(afsFilings).toHaveLength(5);
  });

  it("includes BO only from 2019 onward", () => {
    const result = generateExpectedFilings({
      incorporationYear: 2015,
      currentYear: 2024,
    });
    const boFilings = result.filter((f) => f.reportType === "BO");
    expect(boFilings).toHaveLength(6); // 2019, 2020, 2021, 2022, 2023, 2024
    expect(boFilings[0].year).toBe(2019);
  });

  it("returns no BO for corps incorporated before 2019 with currentYear before 2019", () => {
    const result = generateExpectedFilings({
      incorporationYear: 2015,
      currentYear: 2018,
    });
    const boFilings = result.filter((f) => f.reportType === "BO");
    expect(boFilings).toHaveLength(0);
  });

  it("includes correct deadlines", () => {
    const result = generateExpectedFilings({
      incorporationYear: 2023,
      currentYear: 2023,
    });
    const gis = result.find((f) => f.reportType === "GIS");
    const afs = result.find((f) => f.reportType === "AFS");
    expect(gis?.deadline).toBe("2023-05-31");
    expect(afs?.deadline).toBe("2023-04-30");
  });
});
```

- [ ] **Step 2: Run to verify failure**

```bash
cd apps/sec-compliance && npx vitest run __tests__/engine/timeline.test.ts
```

- [ ] **Step 3: Implement timeline.ts**

`generateExpectedFilings({ incorporationYear, currentYear })` returns array of `{ reportType, year, deadline }`. GIS deadline = May 31, AFS = April 30, BO = May 31. BO starts from `max(incorporationYear, 2019)`.

- [ ] **Step 4: Run tests to verify pass**

- [ ] **Step 5: Commit**

```bash
git add apps/sec-compliance/src/engine/timeline.ts apps/sec-compliance/__tests__/engine/timeline.test.ts
git commit -m "feat(sec-compliance): filing timeline generator with deadline dates"
```

---

## Task 4: Penalty Computation Engine

**Files:**
- Create: `apps/sec-compliance/src/engine/penalties.ts`
- Test: `apps/sec-compliance/__tests__/engine/penalties.test.ts` (extend)

- [ ] **Step 1: Write failing tests for penalty computation**

Add to `penalties.test.ts`:

```ts
import { computePenalties } from "@/engine/penalties";

describe("computePenalties", () => {
  it("computes correct penalties for the worked example from spec", () => {
    // Domestic stock, incorporated 2018, RE 100k-500k
    // Missed GIS 2020-2023, missed AFS 2022-2023, MC28 non-compliant
    const result = computePenalties({
      domicile: "domestic",
      corpType: "stock",
      reBracket: "100k_500k",
      mc28Compliant: false,
      filedReports: [
        // GIS filed: 2018, 2019 only
        { reportType: "GIS", year: 2018, status: "filed_on_time" },
        { reportType: "GIS", year: 2019, status: "filed_on_time" },
        // AFS filed: 2018, 2019, 2020, 2021 only
        { reportType: "AFS", year: 2018, status: "filed_on_time" },
        { reportType: "AFS", year: 2019, status: "filed_on_time" },
        { reportType: "AFS", year: 2020, status: "filed_on_time" },
        { reportType: "AFS", year: 2021, status: "filed_on_time" },
      ],
      incorporationYear: 2018,
      currentDate: new Date("2026-03-21"),
    });

    // GIS 2020 = 1st offense non-filing: ₱15,000 base
    const gis2020 = result.lineItems.find(
      (i) => i.reportType === "GIS" && i.year === 2020
    );
    expect(gis2020?.basePenalty).toBe(15000);
    expect(gis2020?.offenseNumber).toBe(1);

    // GIS 2021 = 2nd offense: ₱18,000
    const gis2021 = result.lineItems.find(
      (i) => i.reportType === "GIS" && i.year === 2021
    );
    expect(gis2021?.basePenalty).toBe(18000);
    expect(gis2021?.offenseNumber).toBe(2);

    // MC28 penalty = ₱20,000
    expect(result.mc28Penalty).toBe(20000);

    // Total should include base + surcharges for all missed filings + MC28
    expect(result.totalPenalty).toBeGreaterThan(300000);
  });

  it("returns zero penalties when all filings are on time", () => {
    const result = computePenalties({
      domicile: "domestic",
      corpType: "stock",
      reBracket: "0_100k",
      mc28Compliant: true,
      filedReports: [
        { reportType: "GIS", year: 2023, status: "filed_on_time" },
        { reportType: "AFS", year: 2023, status: "filed_on_time" },
        { reportType: "BO", year: 2023, status: "filed_on_time" },
      ],
      incorporationYear: 2023,
      currentDate: new Date("2024-01-15"),
    });
    expect(result.lineItems).toHaveLength(0);
    expect(result.totalPenalty).toBe(0);
  });

  it("treats current-year missed filings as late_filing, prior years as non_filing", () => {
    // Corp incorporated 2023, checking in Nov 2024
    // 2023 GIS missed (>1 year since May 31 2023 deadline) = non_filing
    // 2024 GIS missed (<1 year since May 31 2024 deadline) = late_filing
    const result = computePenalties({
      domicile: "domestic",
      corpType: "stock",
      reBracket: "0_100k",
      mc28Compliant: true,
      filedReports: [],
      incorporationYear: 2023,
      currentDate: new Date("2024-11-15"),
    });
    const gis2023 = result.lineItems.find(
      (i) => i.reportType === "GIS" && i.year === 2023
    );
    const gis2024 = result.lineItems.find(
      (i) => i.reportType === "GIS" && i.year === 2024
    );
    expect(gis2023?.violationType).toBe("non_filing");
    expect(gis2024?.violationType).toBe("late_filing");
    // Late filing base penalty should be lower than non-filing for same bracket
    expect(gis2024!.basePenalty).toBeLessThan(gis2023!.basePenalty);
  });

  it("computes BO daily penalties with 2M cap", () => {
    // Corp incorporated 2020, missed BO for 2020 — check in 2026
    // BO 2020 deadline = May 31, 2020. Days to March 21, 2026 ≈ 2121 days
    // ₱1,000/day × 2121 = ₱2,121,000 → capped at ₱2,000,000
    const result = computePenalties({
      domicile: "domestic",
      corpType: "stock",
      reBracket: "0_100k",
      mc28Compliant: true,
      filedReports: [
        // File everything except BO
        { reportType: "GIS", year: 2020, status: "filed_on_time" },
        { reportType: "AFS", year: 2020, status: "filed_on_time" },
      ],
      incorporationYear: 2020,
      currentDate: new Date("2026-03-21"),
    });
    const bo2020 = result.boPenalties.find((i) => i.year === 2020);
    expect(bo2020?.totalPenalty).toBe(2000000); // capped
  });

  it("applies 6th offense revocation surcharge to total", () => {
    // 6 missed GIS filings = 6th is revocation with 100% surcharge
    const result = computePenalties({
      domicile: "domestic",
      corpType: "stock",
      reBracket: "0_100k",
      mc28Compliant: true,
      filedReports: [],
      incorporationYear: 2018,
      currentDate: new Date("2026-03-21"),
    });
    // GIS offenses: 2018=1st, 2019=2nd, 2020=3rd, 2021=4th, 2022=5th, 2023=6th
    const gis2023 = result.lineItems.find(
      (i) => i.reportType === "GIS" && i.year === 2023
    );
    expect(gis2023?.offenseNumber).toBe(6);
    expect(gis2023?.revocationSurcharge).toBe(true);
  });
});
```

- [ ] **Step 2: Run to verify failure**

- [ ] **Step 3: Implement penalties.ts**

`computePenalties(input)` — the core engine:
1. Call `generateExpectedFilings` to get expected timeline
2. Diff against `filedReports` to find missed filings
3. For GIS/AFS: count offenses per report type chronologically, lookup penalty + surcharge, compute surcharge months from deadline to `currentDate`
4. For BO: compute ₱1,000/day from deadline, cap at ₱2,000,000 each
5. Add MC28 penalty if non-compliant (₱20,000)
6. Return `{ lineItems, mc28Penalty, boPenalties, totalPenalty }`

- [ ] **Step 4: Run tests to verify pass**

- [ ] **Step 5: Commit**

```bash
git add apps/sec-compliance/src/engine/penalties.ts apps/sec-compliance/__tests__/engine/penalties.test.ts
git commit -m "feat(sec-compliance): penalty computation engine with surcharge calculation"
```

---

## Task 5: Compliance Status & Reinstatement Estimate

**Files:**
- Create: `apps/sec-compliance/src/engine/status.ts`
- Create: `apps/sec-compliance/src/engine/reinstatement.ts`
- Create: `apps/sec-compliance/src/engine/compute.ts`
- Test: `apps/sec-compliance/__tests__/engine/status.test.ts`
- Test: `apps/sec-compliance/__tests__/engine/reinstatement.test.ts`
- Test: `apps/sec-compliance/__tests__/engine/compute.test.ts`

- [ ] **Step 1: Write failing tests for status determination**

```ts
// __tests__/engine/status.test.ts
import { describe, it, expect } from "vitest";
import { determineStatus } from "@/engine/status";

describe("determineStatus", () => {
  it("returns active when no missed filings", () => {
    const result = determineStatus({ missedFilingYears: [], suspensionDate: null, revocationDate: null });
    expect(result.status).toBe("active");
    expect(result.riskLevel).toBe("none");
  });

  it("returns delinquent after 3 consecutive years of non-filing", () => {
    // GIS missed 2021, 2022, 2023 = 3 consecutive
    const result = determineStatus({
      missedFilingYears: [2021, 2022, 2023],
      suspensionDate: null,
      revocationDate: null,
    });
    expect(result.status).toBe("delinquent");
    expect(result.riskMessage).toContain("3 consecutive");
  });

  it("returns delinquent after 5 intermittent years of non-filing", () => {
    // Missed 2016, 2018, 2020, 2022, 2024 = 5 intermittent
    const result = determineStatus({
      missedFilingYears: [2016, 2018, 2020, 2022, 2024],
      suspensionDate: null,
      revocationDate: null,
    });
    expect(result.status).toBe("delinquent");
    expect(result.riskMessage).toContain("5");
  });

  it("does NOT return delinquent for 2 consecutive years", () => {
    const result = determineStatus({
      missedFilingYears: [2022, 2023],
      suspensionDate: null,
      revocationDate: null,
    });
    expect(result.status).not.toBe("delinquent");
  });

  it("returns suspended when suspension date is provided", () => {
    const result = determineStatus({
      missedFilingYears: [2020, 2021, 2022],
      suspensionDate: new Date("2023-06-15"),
      revocationDate: null,
    });
    expect(result.status).toBe("suspended");
  });

  it("returns revoked when revocation date is provided", () => {
    const result = determineStatus({
      missedFilingYears: [2018, 2019, 2020, 2021, 2022, 2023],
      suspensionDate: null,
      revocationDate: new Date("2024-01-10"),
    });
    expect(result.status).toBe("revoked");
  });

  it("flags revocation risk when max offense count reaches 4-5", () => {
    const result = determineStatus({
      missedFilingYears: [2019, 2020, 2021, 2022],
      suspensionDate: null,
      revocationDate: null,
      maxOffenseCount: 5,
    });
    expect(result.riskLevel).toBe("high");
    expect(result.riskMessage).toContain("revocation");
  });
});
```

- [ ] **Step 2: Run to verify failure**

- [ ] **Step 3: Implement status.ts**

`determineStatus(missedFilings, suspensionDate, revocationDate)` → `{ status, riskLevel, riskMessage }`. Checks Sec. 177 rules: 3 consecutive years OR 5 intermittent years → delinquent. Suspension/revocation from user input override.

- [ ] **Step 4: Run tests to verify pass**

- [ ] **Step 5: Write failing tests for reinstatement**

```ts
// __tests__/engine/reinstatement.test.ts
describe("computeReinstatement", () => {
  it("returns correct cost breakdown", () => {
    const result = computeReinstatement({ totalPenalties: 375000 });
    expect(result.petitionFee).toBe(3060);
    expect(result.publicationEstimate).toEqual({ min: 3000, max: 5000 });
    expect(result.professionalFeesEstimate).toEqual({ min: 30000, max: 100000 });
    expect(result.totalEstimate.min).toBe(375000 + 3060 + 3000 + 30000);
  });
});
```

- [ ] **Step 6: Implement reinstatement.ts**

- [ ] **Step 7: Run tests**

- [ ] **Step 8: Write integration test for full compute orchestrator**

```ts
// __tests__/engine/compute.test.ts
describe("computeCompliance — worked example from spec", () => {
  it("matches the spec worked example end-to-end", () => {
    // Full scenario: domestic stock, 2018, 100k-500k, missed GIS 2020-2023, etc.
    const result = computeCompliance({ ... });
    expect(result.status).toBe("delinquent");
    expect(result.totalPenalty).toBeGreaterThan(300000);
    expect(result.lineItems.length).toBeGreaterThan(0);
    expect(result.reinstatement.petitionFee).toBe(3060);
  });
});
```

- [ ] **Step 9: Implement compute.ts** — thin orchestrator calling timeline → penalties → status → reinstatement

- [ ] **Step 10: Run all engine tests**

```bash
cd apps/sec-compliance && npx vitest run __tests__/engine/
```

Expected: All PASS.

- [ ] **Step 11: Commit**

```bash
git add apps/sec-compliance/src/engine/ apps/sec-compliance/__tests__/engine/
git commit -m "feat(sec-compliance): status, reinstatement, and full computation orchestrator"
```

---

## Task 6: Supabase Schema & Auth Setup

**Files:**
- Create: `apps/sec-compliance/supabase/config.toml`
- Create: `apps/sec-compliance/supabase/migrations/001_schema.sql`
- Create: `apps/sec-compliance/src/lib/supabase/client.ts`
- Create: `apps/sec-compliance/src/lib/supabase/server.ts`
- Create: `apps/sec-compliance/src/lib/supabase/middleware.ts`
- Create: `apps/sec-compliance/src/middleware.ts`

- [ ] **Step 1: Create Supabase config and migration**

`supabase/config.toml` — standard Supabase config (copy from `apps/taxklaro/supabase/config.toml` and update project name).

`supabase/migrations/001_schema.sql`:
```sql
-- Users handled by Supabase Auth

create table corporations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  domicile text not null default 'domestic' check (domicile in ('domestic', 'foreign')),
  corp_type text not null check (corp_type in ('stock', 'non_stock', 'opc')),
  re_bracket text not null,
  registration_date date not null,
  sec_registration_number text,
  mc28_compliant boolean not null default false,
  suspension_date date,
  revocation_date date,
  created_at timestamptz not null default now()
);

create table filing_records (
  id uuid primary key default gen_random_uuid(),
  corporation_id uuid not null references corporations(id) on delete cascade,
  report_type text not null check (report_type in ('GIS', 'AFS', 'BO')),
  year integer not null,
  status text not null check (status in ('not_filed', 'filed_late', 'filed_on_time')),
  filed_date date,
  unique(corporation_id, report_type, year)
);

create table computations (
  id uuid primary key default gen_random_uuid(),
  corporation_id uuid not null references corporations(id) on delete cascade,
  computed_at timestamptz not null default now(),
  result_json jsonb not null,
  total_penalty numeric not null
);

-- RLS policies
alter table corporations enable row level security;
alter table filing_records enable row level security;
alter table computations enable row level security;

create policy "Users can read own corporations"
  on corporations for select using (auth.uid() = user_id);
create policy "Users can insert own corporations"
  on corporations for insert with check (auth.uid() = user_id);

create policy "Users can read own filing records"
  on filing_records for select using (
    corporation_id in (select id from corporations where user_id = auth.uid())
  );
create policy "Users can insert own filing records"
  on filing_records for insert with check (
    corporation_id in (select id from corporations where user_id = auth.uid())
  );

create policy "Users can read own computations"
  on computations for select using (
    corporation_id in (select id from corporations where user_id = auth.uid())
  );
create policy "Users can insert own computations"
  on computations for insert with check (
    corporation_id in (select id from corporations where user_id = auth.uid())
  );
```

- [ ] **Step 2: Create Supabase client helpers**

`src/lib/supabase/client.ts` — browser client using `@supabase/ssr` `createBrowserClient`.
`src/lib/supabase/server.ts` — server client using `createServerClient` with cookies.
`src/lib/supabase/middleware.ts` — refreshes auth tokens.

- [ ] **Step 3: Create middleware**

`src/middleware.ts` — protect `/remediation` route (redirect to `/login` if not authenticated). All other routes are public.

- [ ] **Step 4: Commit**

```bash
git add apps/sec-compliance/supabase/ apps/sec-compliance/src/lib/supabase/ apps/sec-compliance/src/middleware.ts
git commit -m "feat(sec-compliance): Supabase schema, auth helpers, and route protection"
```

---

## Task 7: Wizard UI

**Files:**
- Create: `apps/sec-compliance/src/components/wizard/wizard-shell.tsx`
- Create: `apps/sec-compliance/src/components/wizard/corp-type-step.tsx`
- Create: `apps/sec-compliance/src/components/wizard/details-step.tsx`
- Create: `apps/sec-compliance/src/components/wizard/filings-step.tsx`
- Create: `apps/sec-compliance/src/components/wizard/suspension-step.tsx`
- Create: `apps/sec-compliance/src/app/wizard/page.tsx`

- [ ] **Step 1: Install shadcn/ui and init**

```bash
cd apps/sec-compliance && npx shadcn@latest init
```

Configure: New York style, `src/components/ui`. **Important:** shadcn init may overwrite `globals.css`. After init, re-apply the design tokens (`--color-charcoal`, `--color-sec-blue`, `--color-crimson`, `--font-display`, `--font-body`) from Task 1 Step 3 into the generated `globals.css`.

- [ ] **Step 2: Add required shadcn components**

```bash
npx shadcn@latest add button card select radio-group checkbox label
```

- [ ] **Step 3: Build wizard-shell.tsx**

Client component. 4 steps with a progress indicator bar. Holds wizard state in React state (not URL). Step navigation (back/next). On final step completion, serializes state to URL params and navigates to `/results?data=<base64-encoded-json>`.

- [ ] **Step 4: Build corp-type-step.tsx**

Step 1: Radio group for corp type (Stock / Non-Stock / OPC). Note below OPC: "Only available for domestic corporations." Since MVP is domestic-only, domicile is hardcoded.

- [ ] **Step 5: Build details-step.tsx**

Step 2: Date picker for incorporation date. Select dropdown for RE bracket (7 options, labels match the bracket names from spec). Checkbox for MC 28 compliance.

- [ ] **Step 6: Build filings-step.tsx**

Step 3: Grid of checkboxes — rows = years (from incorporation to present), columns = GIS, AFS, BO (BO only from 2019+). Each unchecked box = not filed.

**UX details:**
- At the top: a "Filed all reports through" dropdown with year options. Selecting 2020 checks all GIS+AFS boxes for incorporation year through 2020 (and BO for 2019-2020 if applicable). Individual boxes can still be toggled after.
- If the grid has 10+ years, group into 5-year blocks (e.g., "2010-2014", "2015-2019", "2020-2024") with collapse/expand. Most recent block expanded by default.
- BO column only renders for years >= 2019. For earlier years, that cell is empty/grayed.
- Default state: all boxes unchecked (assume non-filing). The shortcut makes it easy to mark compliant years in bulk.

- [ ] **Step 7: Build suspension-step.tsx**

Step 4: "Have you received a suspension or revocation order?" Yes/No radio. If yes, date picker for order date.

- [ ] **Step 8: Wire wizard page**

`src/app/wizard/page.tsx` — renders `<WizardShell />`.

- [ ] **Step 9: Verify wizard renders and navigates between steps**

```bash
cd apps/sec-compliance && npm run dev
```

Manually navigate to `/wizard`, fill steps, verify forward/back works.

- [ ] **Step 10: Commit**

```bash
git add apps/sec-compliance/src/components/wizard/ apps/sec-compliance/src/app/wizard/ apps/sec-compliance/src/components/ui/
git commit -m "feat(sec-compliance): 4-step wizard UI with filing checklist grid"
```

---

## Task 8: Results Page & Compliance Timeline

**Files:**
- Create: `apps/sec-compliance/src/app/results/page.tsx`
- Create: `apps/sec-compliance/src/app/api/compute/route.ts`
- Create: `apps/sec-compliance/src/components/results/compliance-timeline.tsx`
- Create: `apps/sec-compliance/src/components/results/penalty-table.tsx`
- Create: `apps/sec-compliance/src/components/results/status-badge.tsx`
- Create: `apps/sec-compliance/src/components/results/risk-flag.tsx`
- Create: `apps/sec-compliance/src/components/results/results-summary.tsx`

- [ ] **Step 1: Create compute API route**

`src/app/api/compute/route.ts` — POST endpoint. Validates input with Zod, calls `computeCompliance()` from engine, returns JSON result. No auth required (anonymous users can compute).

- [ ] **Step 2: Build status-badge.tsx**

Renders status as colored badge. Active = green, Delinquent = amber, Suspended = crimson, Revoked = dark crimson. Uses `font-display` (Newsreader) for the label.

- [ ] **Step 3: Build penalty-table.tsx**

Table with columns: Year, Report Type, Violation, Offense #, Base Penalty, Surcharge, Total. Rows from `lineItems`. Footer row with grand total. Penalty amounts in crimson. Uses `font-body` (Public Sans) for data.

- [ ] **Step 4: Build risk-flag.tsx**

Warning banner. If delinquent: "Your corporation has been declared delinquent. N more offenses could result in revocation." If near-revocation (5th offense): "Your corporation is at immediate risk of revocation." Crimson background, white text.

- [ ] **Step 5: Build compliance-timeline.tsx — the signature element**

Horizontal timeline from incorporation year to present. Each year is a column, subdivided into 3 rows (GIS, AFS, BO). Color coding: green (#16a34a) = filed on time, amber (#d97706) = filed late, red (#A63232) = not filed, gray = not yet required (BO before 2019). On hover, tooltip shows penalty for that cell. This is the hero visual — give it generous vertical space and make it the first thing below the status badge.

- [ ] **Step 6: Build results-summary.tsx**

Shows total penalty amount (large, Newsreader, charcoal), MC28 penalty if applicable, BO penalty subtotal. CTA button: "How do I fix this? →" linking to `/signup` (or `/remediation` if already logged in).

- [ ] **Step 7: Build results page**

`src/app/results/page.tsx` — client component.

**Data flow:** The wizard serializes its state as JSON, base64-encodes it, and puts it in `?data=<base64>`. The results page decodes this on mount, calls `POST /api/compute` with the decoded JSON, and renders the response.

**Encoding utility:** Add `encodeWizardData(data: ComputationInput): string` and `decodeWizardData(encoded: string): ComputationInput` to `src/lib/utils.ts`. Used by wizard (encode) and results page (decode).

**Renders:** disclaimer → status badge → compliance timeline → penalty table → risk flag → results summary with CTA.

**Congratulations screen:** If the computation returns zero penalties (all filings on time), render a green "All Clear" badge, a short congratulations message ("Your corporation appears to be in good standing with the SEC"), and a note to keep filing on time. Do NOT show the penalty table or risk flag.

- [ ] **Step 8: Build legal disclaimer component**

Prominent disclaimer bar at top of results: "This is an estimate based on publicly available SEC penalty schedules. It is not legal advice. Consult a lawyer or corporate secretary for your specific situation." Light gray background, visible without scrolling.

- [ ] **Step 9: End-to-end manual test**

Navigate wizard → fill in worked example data → verify results page shows correct penalties matching spec.

- [ ] **Step 10: Commit**

```bash
git add apps/sec-compliance/src/app/results/ apps/sec-compliance/src/app/api/ apps/sec-compliance/src/components/results/
git commit -m "feat(sec-compliance): results page with compliance timeline and penalty table"
```

---

## Task 9: Auth Pages (Login + Signup)

**Files:**
- Create: `apps/sec-compliance/src/app/login/page.tsx`
- Create: `apps/sec-compliance/src/app/signup/page.tsx`
- Create: `apps/sec-compliance/src/app/api/auth/callback/route.ts`

- [ ] **Step 1: Create auth callback route**

`src/app/api/auth/callback/route.ts` — handles Supabase OAuth redirect. Exchanges code for session, redirects to `/remediation`.

- [ ] **Step 2: Build signup page**

Email + password form with Zod validation. Google OAuth button.

**Data persistence through signup gate:** The CTA on the results page links to `/signup?data=<same-base64-encoded-data>`. The signup page preserves this `data` param through the auth flow (pass it as `redirectTo` query param to Supabase auth, or store in `sessionStorage` before initiating signup). On successful signup, decode the data, save to Supabase (insert corporation + filing_records rows, run computation, insert computation row), then redirect to `/remediation`.

- [ ] **Step 3: Build login page**

Email + password form. Google OAuth button. On login, redirect to `/remediation`.

- [ ] **Step 4: Verify auth flow**

Sign up → verify redirect to remediation. Log out → verify `/remediation` redirects to `/login`.

- [ ] **Step 5: Commit**

```bash
git add apps/sec-compliance/src/app/login/ apps/sec-compliance/src/app/signup/ apps/sec-compliance/src/app/api/auth/
git commit -m "feat(sec-compliance): auth pages with signup gate and computation persistence"
```

---

## Task 10: Remediation Page (Gated)

**Files:**
- Create: `apps/sec-compliance/src/app/remediation/page.tsx`
- Create: `apps/sec-compliance/src/components/remediation/cost-estimate.tsx`
- Create: `apps/sec-compliance/src/components/remediation/document-checklist.tsx`
- Create: `apps/sec-compliance/src/components/remediation/step-guide.tsx`

- [ ] **Step 1: Build cost-estimate.tsx**

Table showing reinstatement cost breakdown: petition fee (₱3,060), accumulated penalties (from computation), newspaper publication (₱3K-5K range), professional fees (₱30K-100K+ range), total estimate range.

- [ ] **Step 2: Build document-checklist.tsx**

Interactive checklist of 10 required documents (from spec). Each item has a checkbox, document name, and brief description. Checkboxes are local state only (tracking progress).

- [ ] **Step 3: Build amnesty-comparison.tsx**

Conditionally rendered — only shows when an amnesty program is active (check `amnesty_config` or hardcoded config). When no amnesty active (current state): render nothing. When active: side-by-side comparison table showing amnesty cost vs. standard reinstatement cost. The component reads amnesty config from the computation result and renders the comparison.

For MVP, the amnesty config is empty so this component renders a "No amnesty program is currently active" note. The structure is in place for when SEC launches a new ECIP.

- [ ] **Step 4: Build petition-generator.tsx**

A "Generate Petition Cover Letter" button that produces a basic template-filled HTML document. Template includes: corporation name (from wizard data), SEC registration number (if provided), list of unfiled reports, total penalties, and a standard petition cover letter structure. Rendered as a printable HTML page opened in a new tab (CSS `@media print` styles). No server-side PDF generation needed at MVP — the user can print-to-PDF from their browser.

- [ ] **Step 5: Build step-guide.tsx**

Static content organized by compliance status:
- **Delinquent**: 5-step guide (gather documents → settle penalties → file backlog reports → register MC28 → confirm active status)
- **Suspended**: 7-step guide (same + file petition to lift suspension → newspaper publication → wait for SEC order)
- **Revoked**: note that revival requires separate petition process, recommend professional assistance

- [ ] **Step 4: Build remediation page**

`src/app/remediation/page.tsx` — server component. Reads user's latest computation from Supabase. Renders: cost estimate → step guide → document checklist. If no computation found, redirect to `/wizard`.

- [ ] **Step 5: Verify gated flow**

Anonymous → results → CTA → signup → auto-redirect to remediation with correct data.

- [ ] **Step 6: Commit**

```bash
git add apps/sec-compliance/src/app/remediation/ apps/sec-compliance/src/components/remediation/
git commit -m "feat(sec-compliance): gated remediation page with cost estimate and step guide"
```

---

## Task 11: Landing Page & Layout Polish

**Files:**
- Modify: `apps/sec-compliance/src/app/page.tsx`
- Create: `apps/sec-compliance/src/components/layout/header.tsx`
- Create: `apps/sec-compliance/src/components/layout/footer.tsx`
- Modify: `apps/sec-compliance/src/app/layout.tsx`

- [ ] **Step 1: Build header**

Minimal header: site name "SEC Compliance Navigator" in Newsreader, nav links (Home, Check Status). No logo at MVP. Charcoal text on white.

- [ ] **Step 2: Build footer**

Footer with legal disclaimer (always visible), "Not affiliated with the Securities and Exchange Commission", copyright.

- [ ] **Step 3: Build landing page**

`src/app/page.tsx`:
- Hero: "Is your corporation in trouble with the SEC?" (Newsreader, large)
- Subtext: "117,000+ corporations were suspended in a single SEC batch order. Check your compliance status and penalties in 2 minutes — free, no signup required."
- CTA button: "Check Your Status →" → `/wizard`
- Below: 3 value props (free penalty computation, plain-language guide, compare remediation options)
- Social proof: "Based on SEC MC No. 6, Series of 2024 — the current penalty schedule"

Apply design direction: Newsreader headings, Public Sans body, charcoal text, SEC blue accents, white background. Institutional, authoritative, clean.

- [ ] **Step 4: Add header + footer to root layout**

- [ ] **Step 5: Visual review in browser**

Navigate all pages. Verify typography, colors, spacing match design direction.

- [ ] **Step 6: Commit**

```bash
git add apps/sec-compliance/src/app/ apps/sec-compliance/src/components/layout/
git commit -m "feat(sec-compliance): landing page and layout with institutional design"
```

---

## Task 12: E2E Tests

**Files:**
- Create: `apps/sec-compliance/playwright.config.ts`
- Create: `apps/sec-compliance/__tests__/e2e/wizard-flow.spec.ts`
- Create: `apps/sec-compliance/__tests__/e2e/results-page.spec.ts`
- Create: `apps/sec-compliance/__tests__/e2e/auth-gate.spec.ts`

- [ ] **Step 1: Configure Playwright**

```ts
// playwright.config.ts
import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./__tests__/e2e",
  use: { baseURL: "http://localhost:3000" },
  webServer: { command: "npm run dev", port: 3000, reuseExistingServer: true },
});
```

- [ ] **Step 2: Install Playwright browsers**

```bash
cd apps/sec-compliance && npx playwright install
```

- [ ] **Step 3: Write wizard flow test**

Navigate to `/wizard` → fill all 4 steps with worked example data → submit → verify redirect to `/results` → verify penalty total is visible and > ₱300,000.

- [ ] **Step 4: Write results page test**

Navigate directly to `/results` with pre-encoded data → verify: status badge shows "Delinquent", compliance timeline renders, penalty table has rows, total is displayed, CTA button links to signup.

- [ ] **Step 5: Write auth gate test**

Navigate to `/remediation` without auth → verify redirect to `/login`. (Full auth E2E with Supabase deferred — too complex for initial E2E.)

- [ ] **Step 6: Run E2E tests**

```bash
cd apps/sec-compliance && npx playwright test
```

Expected: All PASS.

- [ ] **Step 7: Commit**

```bash
git add apps/sec-compliance/__tests__/e2e/ apps/sec-compliance/playwright.config.ts
git commit -m "test(sec-compliance): e2e tests for wizard flow, results, and auth gate"
```

---

## Task 13: Deployment Setup

**Files:**
- Create: `apps/sec-compliance/Dockerfile`
- Create: `apps/sec-compliance/fly.toml`

- [ ] **Step 1: Create Dockerfile**

Standard Next.js multistage Docker build (node:20-alpine base, standalone output).

- [ ] **Step 2: Create fly.toml**

```toml
app = "sec-compliance"
primary_region = "sin"

[build]

[http_service]
  internal_port = 3000
  force_https = true

[env]
  NODE_ENV = "production"
```

- [ ] **Step 3: Verify Docker build locally**

```bash
cd apps/sec-compliance && docker build -t sec-compliance .
```

Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add apps/sec-compliance/Dockerfile apps/sec-compliance/fly.toml
git commit -m "feat(sec-compliance): Dockerfile and Fly.io deployment config"
```

---

## Summary

| Task | What | Engine Tests | E2E Tests |
|------|------|:---:|:---:|
| 1 | Project scaffold | — | — |
| 2 | Types + penalty schedule lookup | 7 | — |
| 3 | Filing timeline generator | 4 | — |
| 4 | Penalty computation engine | 6 | — |
| 5 | Status + reinstatement + orchestrator | 8+ | — |
| 6 | Supabase schema + auth | — | — |
| 7 | Wizard UI (4 steps) | — | — |
| 8 | Results page + compliance timeline | — | — |
| 9 | Auth pages (login + signup) | — | — |
| 10 | Remediation + amnesty + doc gen | — | — |
| 11 | Landing page + layout polish | — | — |
| 12 | E2E tests | — | 3 |
| 13 | Deployment setup | — | — |

**Build order rationale:** Engine first (tasks 2-5), then infrastructure (task 6), then UI consuming the engine (tasks 7-11), then verification (task 12), then deployment (task 13). Engine is pure functions with no deps — fastest to build and test. UI depends on engine types and output shapes.

**Architectural note — penalty data as code, not DB:** The penalty schedule is encoded as typed TypeScript data in `penalty-schedule.ts`, not as database config tables. This is simpler for MVP (no seed migration, no admin UI, penalty data is version-controlled). The spec's `penalty_schedule`, `bo_penalty_schedule`, `mc28_penalty`, and `amnesty_config` DB tables are deferred to when an admin needs to update rates without a code deploy.
