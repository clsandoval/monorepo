# BetterGov.ph Open Source Deep Dive

**Date:** 2026-03-21
**Purpose:** Exhaustive analysis of BetterGov.ph's open source presence, deployed products, and overlap with Philippine compliance computation tools.

---

## 1. Organization Overview

- **Founded:** September 2025 (viral launch)
- **Founder:** Jason Torres (Filipino entrepreneur, based in London)
- **Core team:** Jason Torres, Christopher Star, Christian Blanquera, Paul Amerigo Pajo, Francis Plaza, Ray Edison Refundo
- **Model:** Volunteer-driven, open-source, no disclosed funding or commercial model
- **License:** CC0 (public domain) for most repos; MIT for some
- **Parent initiative:** OpenBayan (openbayan.org) — umbrella community for PH civic tech
- **Legal status:** Not an official government portal; community-led
- **GitHub org:** https://github.com/bettergovph (399 followers)
- **Discord:** ~2,000 members (https://discord.com/invite/mHtThpN8bT)
- **Community size:** 710+ participants as of Sep 2025; likely grown since
- **Contact:** volunteers@bettergov.ph

---

## 2. Complete Repository Inventory (28 repos)

### Tier 1 — Active, High-Profile

| Repo | Description | Stack | Stars | Forks | Last Push | Activity |
|------|-------------|-------|-------|-------|-----------|----------|
| **bettergov** | Main portal (bettergov.ph) | TypeScript, React, Vite, Tailwind, Cloudflare Workers | 442 | 205 | Mar 21, 2026 | Very active (374 merged PRs, 25 open) |
| **open-data-portal** | Community-run dataset explorer | TypeScript, Cloudflare D1, Vite, pnpm | 15 | 10 | Mar 11, 2026 | Active |
| **hotlines** | PH emergency hotlines directory | TypeScript | 5 | 22 | Mar 17, 2026 | Active |
| **kapwa** | Design system for gov portals | React, TypeScript, Tailwind, Storybook | 13 | 15 | Mar 1, 2026 | Active (104 commits, 7 releases) |
| **govchain** | Blockchain for gov datasets (OCDS/OC4IDS) | TypeScript | 23 | 9 | Feb 16, 2026 | Active |
| **govchaind** | GovChain daemon | Go | 2 | 5 | Feb 16, 2026 | Active |
| **transparency-dashboard** | PhilGEPS procurement search & analytics | React 19, Vite, MeiliSearch, Tailwind, shadcn/ui | 6 | 4 | Feb 15, 2026 | Active |

### Tier 2 — Moderate Activity

| Repo | Description | Stack | Stars | Forks | Last Push | Activity |
|------|-------------|-------|-------|-------|-----------|----------|
| **docs** | Platform docs (Fumadocs + Next.js) | TypeScript | 0 | 2 | Feb 2, 2026 | Moderate |
| **petition** | Civic petition platform | React 19, TypeScript, Cloudflare D1, Playwright | 14 | 14 | Jan 7, 2026 | Moderate (107 commits) |
| **open-data-visualization** | Data viz site | HTML | 3 | 4 | Jan 14, 2026 | Moderate |
| **oc4ids-registry** | Infrastructure data standard registry | — | 0 | 1 | Jan 6, 2026 | Low |
| **2026-budget** | FY2026 budget dashboard | TypeScript | 5 | 2 | Dec 14, 2025 | Moderate |
| **ph-tax-directory** | Tax directory & calculators | Vue.js, TypeScript, Vite, Tailwind | 6 | 5 | Dec 2, 2025 | Moderate (44 commits) |

### Tier 3 — Lower Activity / Early Stage

| Repo | Description | Stack | Stars | Forks | Last Push | Activity |
|------|-------------|-------|-------|-------|-----------|----------|
| **security** | (No description) | TypeScript | 0 | 0 | Dec 20, 2025 | Low |
| **logo** | Centralized logo assets | Shell | 2 | 3 | Dec 13, 2025 | Low |
| **openbayan.org** | OpenBayan community site | Svelte | 17 | 7 | Nov 22, 2025 | Moderate |
| **scamcheck** | AI spam/phishing detection API | Cloudflare Workers, Hugging Face | 4 | 0 | Nov 13, 2025 | Low |
| **saln-tracker-ph** | SALN tracker for officials | TypeScript | 0 | 9 | Nov 2, 2025 | Low |
| **open-congress-api** | REST API for PH Congress data | Deno, Hono, Neo4j, Zod | 10 | 6 | Oct 25, 2025 | Low |
| **open-budget-data** | Budget data → graph DB pipeline | Python | 6 | 5 | Oct 24, 2025 | Low |
| **open-congress-data** | Open data for PH Congress | Python | 12 | 8 | Oct 15, 2025 | Low |
| **open-data** | ODPH Mirror | Python | 0 | 0 | Oct 9, 2025 | Dormant |
| **open-budget-browser** | (No description) | — | 0 | 0 | Oct 7, 2025 | Dormant |
| **govchain-ts** | GovChain TypeScript variant | TypeScript | 0 | 0 | Oct 6, 2025 | Dormant |
| **open-budget-api** | Budget REST API | NestJS, TypeScript, Neo4j | 8 | 6 | Oct 6, 2025 | Low |
| **open-philgeps-data** | PhilGEPS data pipeline | — | 0 | 0 | Oct 5, 2025 | Dormant |
| **healthcare-providers-api** | Healthcare providers API | NestJS, TypeScript, Docker | 2 | 2 | Sep 28, 2025 | Early/TBD |
| **openverify** | PhilSys/eGovPH ID verification | Next.js, TypeScript, jsQR | 9 | 1 | Sep 25, 2025 | Low |

---

## 3. Deployed Sites Analysis

### bettergov.ph (Main Portal)
- **What:** Modern government services directory organized by citizen needs
- **Features:** Service search/filter, government branch directory, real-time widgets (weather, forex), news, "Ideas" submissions, multilingual (EN/Filipino)
- **Tech:** React, TypeScript, Vite, Tailwind CSS, Cloudflare Workers/Pages
- **Status:** Active, flagship product

### saln.bettergov.ph (SALN Tracker)
- **What:** Financial disclosure tracker for PH public officials (Statements of Assets, Liabilities, and Net Worth)
- **Features:** Official tracking across executive/legislative/constitutional branches, net worth/assets/liabilities display, year-over-year trends, sortable tables
- **Status:** Active, data-dependent on public submissions

### visualizations.bettergov.ph (Data Visualizations)
- **What:** Hub for government data analysis
- **Features:** NEP budget tracking, AI-powered GAA analysis, PhilGEPS procurement (2013-2025), DIME infrastructure projects (12,870+ projects, 740B+), flood control project maps, political dynasty analysis, integrated multi-source analysis
- **Status:** Active, most feature-rich subdomain

### philgeps.bettergov.ph (PhilGEPS Awards Explorer)
- **What:** Procurement data browser for Philippine Government Electronic Procurement System
- **Features:** Full-text search, filtering, award data exploration
- **Status:** Active

### govchain.bettergov.ph (OpenGovChain)
- **What:** Blockchain platform for government data transparency
- **Features:** OCDS procurement lifecycle tracking, OC4IDS infrastructure monitoring, proposed national budget module, IPFS document storage
- **Status:** Active development

### data.bettergov.ph (Open Data Portal)
- **What:** Centralized dataset discovery and access
- **Features:** Dataset search, publisher/category browsing, REST API with OpenAPI docs, Swagger UI
- **Tech:** Cloudflare D1 (SQLite)
- **Status:** Active

### taxdirectory.bettergov.ph (Tax Directory)
- **What:** Tax information and calculators
- **Features:** Compensation income tax calculator (with SSS/PhilHealth/Pag-IBIG deductions), VAT calculator, BIR forms library, filing calendar, tax rates/brackets, FAQs
- **Status:** Active but limited scope (only 2 calculators)

### price-guides.bettergov.ph (Price Guides)
- **What:** Economic and governance indicators dashboard
- **Features:** World Governance Indicators (6 dimensions), aid flows, poverty/inequality metrics, debt metrics, education data
- **Status:** Active, primarily a data viewer (NO calculators)

### transparency.bettergov.ph (Transparency Dashboard)
- **What:** Government records search engine
- **Features:** Procurement data search, tax records, budget information, CSV export, analytics visualizations
- **Tech:** React 19, MeiliSearch, Recharts
- **Status:** Active

### 2026-budget.bettergov.ph (Budget Dashboard)
- **What:** FY2026 Philippine budget visualization
- **Features:** Budget allocation charts, department breakdowns, spending analysis
- **Status:** Active

---

## 4. Compliance & Computation Tools — What They Have

### EXISTING (Built & Deployed)

| Tool | Scope | Location |
|------|-------|----------|
| **Compensation Income Tax Calculator** | Monthly/annual income tax with SSS, PhilHealth, Pag-IBIG deductions | taxdirectory.bettergov.ph |
| **VAT Calculator** | 12% VAT inclusive/exclusive | taxdirectory.bettergov.ph |

### IN PROGRESS (Open PRs)

| Tool | Status | Location |
|------|--------|----------|
| **Freelancer Tax Calculator** | Open PR #19 since Oct 4, 2025 (stale, 5+ months) | ph-tax-directory |
| **BOC Tax Estimator** | Merged PR #12, Sep 30, 2025 (may be live) | ph-tax-directory |

### PLANNED / REQUESTED (Open Issues)

| Tool | Status | Location |
|------|--------|----------|
| **User Reporting System for Calculator Issues** | Open issue #21 | ph-tax-directory |

### MENTIONED IN DOCS ROADMAP (No Implementation)

| Feature | Source |
|---------|--------|
| Government authentication integration | docs.bettergov.ph |
| Real-time application status tracking | docs.bettergov.ph |
| Mobile app | docs.bettergov.ph |
| AI-powered chatbot for service recommendations | docs.bettergov.ph |
| Digital payment system integration | docs.bettergov.ph |

---

## 5. Overlap Analysis with PH Compliance Computation Domains

### Coverage vs. 41-tool ph-compliance-moats list & 107-tool ph-regulatory-atlas list

| Domain | BetterGov Coverage | Gap |
|--------|-------------------|-----|
| **Income Tax (compensation)** | YES — basic calculator with TRAIN law | Limited: no annualization, no mixed-income, no substituted filing |
| **Income Tax (freelancer/self-employed)** | IN PROGRESS — stale PR | Not live |
| **VAT** | YES — basic 12% calculator | No VAT compliance (quarterly returns, exempt vs zero-rated, etc.) |
| **Documentary Stamp Tax** | NONE | Full gap |
| **Donor's Tax** | NONE | Full gap |
| **Estate Tax** | NONE | Full gap |
| **Excise Tax** | NONE | Full gap |
| **Capital Gains Tax** | NONE | Full gap |
| **BOC/Customs Tariff** | MAYBE — PR #12 merged (BOC Tax Estimator) | Unclear if deployed |
| **Labor: Payroll computation** | PARTIAL — income tax calc includes SSS/PhilHealth/Pag-IBIG deductions | Not a standalone payroll tool |
| **Labor: Separation pay** | NONE | Full gap |
| **Labor: Retirement pay** | NONE | Full gap |
| **Labor: Final pay** | NONE | Full gap |
| **Labor: Back wages** | NONE | Full gap |
| **Labor: 13th month pay** | NONE | Full gap |
| **Labor: OT/night differential/holiday pay** | NONE | Full gap |
| **Corporate: SEC filings (AFS, GIS)** | NONE | Full gap |
| **Property: Real Property Tax** | NONE | Full gap |
| **Property: Capital Gains Tax (real estate)** | NONE | Full gap |
| **Property: Transfer tax** | NONE | Full gap |
| **Property: Maceda Law** | NONE | Full gap |
| **Social Insurance: SSS benefits** | NONE (only contribution computation) | Full gap on benefits side |
| **Social Insurance: SSS maternity/sickness** | NONE | Full gap |
| **Social Insurance: PhilHealth benefits** | NONE | Full gap |
| **Social Insurance: Pag-IBIG housing loan** | NONE | Full gap |
| **Social Insurance: GSIS** | NONE | Full gap |
| **Professional: PRC licensing** | NONE | Full gap |
| **Professional: CPD** | NONE | Full gap |
| **Transport: LTO** | NONE | Full gap |
| **Transport: MARINA** | NONE | Full gap |
| **Transport: LTFRB** | NONE | Full gap |
| **Legal: Interest computation** | NONE | Full gap |
| **Legal: Prescriptive periods** | NONE | Full gap |
| **Legal: LEC** | NONE | Full gap |

**Summary: BetterGov covers ~2-3 out of 41+ compliance computation tools (income tax, VAT, possibly BOC). The remaining 38+ domains are completely unaddressed.**

---

## 6. Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vue.js (tax directory only), TypeScript, Tailwind CSS v4, Vite |
| **Design system** | Kapwa (custom), shadcn/ui, Radix UI, Lucide icons |
| **Backend** | Cloudflare Workers, Cloudflare Pages Functions, NestJS, Deno/Hono |
| **Database** | Cloudflare D1 (SQLite), Neo4j (graph DB for budget/congress), MeiliSearch |
| **Blockchain** | Custom GovChain (Go daemon + TypeScript frontend), IPFS |
| **Data pipeline** | Python (pandas, PyArrow), DuckDB, Parquet files |
| **AI/ML** | Hugging Face (ScamCheck), "AI-powered analysis" (budget) |
| **Hosting** | Cloudflare (primary), Netlify, Docker |
| **Testing** | Playwright E2E |
| **Docs** | Fumadocs + Next.js, Storybook (Kapwa), Swagger/OpenAPI |
| **Package managers** | npm, pnpm, Bun |

---

## 7. Community & Contributor Profile

| Metric | Value |
|--------|-------|
| **GitHub org followers** | 399 |
| **Discord members** | ~2,000 |
| **Community participants** | 710+ (as of Sep 2025) |
| **Main repo contributors** | Not disclosed (205 forks suggest broad interest) |
| **Main repo PRs** | 374 merged, 25 open |
| **Total repos** | 28 |
| **Funding** | None disclosed; purely volunteer |
| **Revenue model** | None |
| **Named contributors** | Jason Torres (founder), Christopher Star, Christian Blanquera, Paul Amerigo Pajo, Francis Plaza, Ray Edison Refundo |
| **Contributor roles** | Developers, designers, writers, translators, accessibility advocates, Discord admins |
| **Press coverage** | TechNode Global, Newsbytes.PH, BitPinas, PHCorner, DEV.to |

---

## 8. Key Findings & Strategic Assessment

### What BetterGov Does Well
1. **Government transparency data** — procurement, budget, SALN, congress, infrastructure projects
2. **Data visualization** — rich dashboards with millions of records
3. **Open data infrastructure** — APIs, portals, standardized data formats (OCDS, OC4IDS)
4. **Community building** — 2,000+ Discord, viral growth, active contributor base
5. **Modern tech stack** — Cloudflare-first, React 19, TypeScript, graph databases

### What BetterGov Does NOT Do
1. **Compliance computation tools** — Almost entirely absent
2. **Citizen-facing calculators** — Only 2 basic calculators (income tax, VAT)
3. **Labor law tools** — Zero coverage
4. **Property/real estate tools** — Zero coverage
5. **Social insurance benefits** — Zero coverage
6. **Professional licensing** — Zero coverage
7. **Corporate compliance** — Zero coverage
8. **Legal computation** — Zero coverage

### Competitive Positioning
BetterGov.ph is a **government transparency and data platform**, NOT a compliance computation platform. Their mission is "making government data accessible" — they show you data, not compute outcomes from it. The tax directory is a small side project (6 stars, 44 commits, 1 active maintainer) with just 2 basic calculators and a stale freelancer calculator PR.

**There is virtually no overlap between BetterGov.ph and a Philippine compliance computation toolset.** They occupy completely different niches:
- **BetterGov** = "What did the government spend?" (transparency, accountability, data access)
- **Compliance tools** = "What do I owe / what am I entitled to?" (computation, regulation, personal/business finance)

The only thin overlap is the income tax + VAT calculator on taxdirectory.bettergov.ph, which is basic and likely not actively maintained.
