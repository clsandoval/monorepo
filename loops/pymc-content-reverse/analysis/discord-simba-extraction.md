# Discord #simba — Extraction
**Channel:** `🦁│simba` (ID: 1192432653916459008)
**Category:** PYMC ECOSYSTEM (1366451442491330610)
**Messages:** 333 (292 non-empty)
**Date range:** 2024-01-04 → 2025-12-08
**Mined:** 2026-03-13

---

## Product Identity

**Full name:** Simba (acronym: **Si**mply Baye**s**ian M**M**M)
**Product type:** SaaS platform for Marketing Mix Modeling
**Domain:** https://simba-mmm.com/ (announced 2025-09-02)
**Landing page:** https://simba-mmm-website.vercel.app/ (early WIP, Jan 2024)
**Companion docs site:** https://1749.io/resource-center/f/simba-marketing-mix-modeling-saas-required-file-structure
**Creator/owner:** Niall Oulton (PyMC Labs partner)
**Origin:** Built by Niall independently, then brought into PyMC Labs as a joint project

### Naming Definition
> "Simba is the name of the new SaaS platform we've been working on (Simply Bayesian SimBa MMM). I'll start loading more info in here when I'm fighting fit aha."
— Niall, #simba, 2024-01-04

---

## Product Description

Simba is an enterprise-level SaaS platform for end-to-end Marketing Mix Modeling workflows. It wraps PyMC-based MMM modeling in a managed web interface, allowing marketing teams and clients to run, evaluate, and optimize MMM without needing Python skills.

**Core value proposition:** Give marketing teams (not just data scientists) the ability to run and explore MMM models — upload data, configure model, run, compare models, run budget optimization, plan scenarios.

### Target Users
- Marketing teams at companies with in-house data science capability or existing PyMC models in production
- Agencies with multiple client MMM needs (pricing: per-user per subscription)
- Companies that want managed services with SaaS access included ("add-on to SLA")

### Positioning vs. Decision AI (MMM Agent)
A key differentiation clarified in Sep 2025:
> "So SIMBA will be primarily to sell to clients who want managed services, and MMM agent will be sold to clients who want self service + coaching...that seems like the most important differentiation between these two products."
— #simba, 2025-09-01

Thomas: "The one they want to buy 😎" — Niall: "aha 100%"

---

## Feature Set (Documented in Channel)

### Core MMM Features
1. **Data upload** — Structured data input with media channel columns + cost columns (required)
2. **Model configuration** — Column mapping, channel selection
3. **Prior selection** — "AI Priors" (renamed consideration: "benchmark priors") — auto-selects priors from industry benchmarks
4. **Model fitting** — PyMC-based Bayesian MMM (custom engine, not yet integrated with pymc-marketing)
5. **Model management system** — V2 feature: save, compare, manage multiple model runs
6. **Model comparison** — Side-by-side metrics (MAE, LOO); metric hover-over on saved models
7. **Budget optimization** — With posterior uncertainty/HDI controls; risk tolerance slider (based on utility theory)
8. **ROAs over time** — Graph of ROAs at time t; defined as incremental revenue / actual spend, rolled up to months
9. **Holdout validation** — "New holdout feature" (Mar 2025)
10. **Smart linking** — (Mar 2025)
11. **Full-funnel model connections** — "Model connections for full-funnel models" (Mar 2025)
12. **Lift test integration** — "Lift tests integrated" (Mar 2025); potential future: CausalPy integration for lift analysis
13. **Scenario planner** — "Scenario planner tab to play with media plans and edit controls" (planned/built Mar 2025)
14. **Prior preview** — "Prior-preview upgrade" (Nov 2024)

### Planned/Discussed Features
- Integration with pymc-marketing library (discussed May 2024, v0.7+)
- Multidimensional class integration (discussed Sep 2025)
- Chatbot integration (similar to EAP chatbot) with paid tiers: Basic (no bot) / Premium (with chatbot)
- Custom MuEffect text input for advanced model customization

### Tech Stack
- Frontend: Built using tools like **v0 by Vercel** for component generation, **Lovable** (lovable.dev) for building/editing UI
- Demo tool: **Supademo** (with AI feature for demo generation)
- Auth: User email approval flow (sign up → auto-blocked → admin approves)
- Deployment: Docker + proxy (nginx/traefik); Bernard (maresb) gave architecture advice
- Code: Private repo (not on GitHub)

---

## Business Model

### Pricing
- **Trial period**: Free trial, shared instance, access time-limited
- **Subscription**: Monthly recurring; isolated containers per paid client
- **Early pricing exploration (Jan 2024):**
  - "Premium+" tier: $8,000/month
  - Simba as add-on to existing $5k/month SLA: discussed at +$2,500/month
  - Thomas suggested $5k add-on
  - Settled at ~$2,500–$3,000 introductory rate
- **Sep 2025 pricing context:**
  - Niall to agency (Found Search Marketing, ~$15M rev): $2,000/month + $500/additional user
  - Discussion of media spend-based pricing ("scale based media budget")
  - Agency model: total billings under management as pricing basis
  - Competitor reference: [Sellforte pricing](https://sellforte.com/pricing) — media spend-based
- **TSB Bank pricing** referenced as a benchmark for "went with the price we went for"

### Revenue Status
- **First free trial user:** Coca-Cola (Mar 2024) — "pretty mad if the first client signed up is coca-cola"
- **First subscription client:** Brilliant Earth (jewelry) — signed Aug 2024
  - Used weekly per user report
  - Cancelled Oct 2025 (gave notice Oct 7, 30-day notice term = charged through Nov 19)
  - Follow-up: client likely wanted a different PyMC Labs service
- **Ongoing subscriber:** Invoice chain via 1749 OÜ → PyMC OÜ (Niall's company → PyMC Labs entity)
- **Cabify** signed up for free trial, Apr 2024

---

## Competitive Context

Competitors discussed in the channel:
- **Recast** — "interface speed and functionality was awful — I think Ulf said it's all just a basic streamlit app" (Oct 2024)
  - Recast launched new overview dashboard (Nov 2024)
- **Meridian** (Google) — addressed primarily in #competition and #decision-ai
- **Forvio** — mentioned as comparable approach (select engine type: "simba classic or pymc marketing dropdown")
- **Sellforte** — cited for media-spend-based pricing model (Sep 2025)

---

## Key Quotes

> "Although Simba is the name of the new SaaS platform we've been working on (Simply Bayesian SimBa MMM)."
— Niall Oulton, #simba, 2024-01-04

> "If it seems like the only thing a lead will go for — based on what we currently do — we'll offer it them."
— Niall, #simba, 2024-01-26 (soft-launch approach)

> "Coca-cola want trial access... it'll be pretty mad if the first client signed up to a SaaS platform is coca-cola ha"
— Niall, #simba, 2024-03-27

> "The main reason why people didn't buy it was either due to cost and/or feature parity with most recent version of pymc-marketing... in many cases introductions to MMM Decision Agent led to demos/convos about SIMBA"
— Kemble (via #sales), 2025-12-22

> "SIMBA will be primarily to sell to clients who want managed services, and MMM agent will be sold to clients who want self service + coaching"
— Anonymous (#simba), 2025-09-01

> "Is Simba using the Multidimensional class? The `build_model_from_yaml` method could work nicely, if one wants to make a very customized MMM, but then use Simba as the platform for evaluating the results and also giving something easier to use for the marketing team to run budget planning with."
— Teemu Säilynoja, #simba, 2025-09-29

> "Adding a chat bot feature, similar to the EAP one, to SIMBA would be really neat and could help users with questions about the platform and how to set it up"
— Tim McWilliams, #simba, 2025-10-06

> "It's on my private repo. It's something I worked on separate to labs then brought into labs to sell as a joint project"
— Niall, #simba, 2024-01-26

---

## Halah Draft Reference (from analysis/halah-draft-scrape.md)

From the Framer draft services page, Simba is listed explicitly:
> "Simba: Enterprise-level Bayesian solution for end-to-end MMM workflows."

Listed under the "Bayesian AI Solutions" service tile, alongside MMM Insights Agent and CLV Agent.

---

## Relationship to Other Products

| Product | Relationship |
|---------|-------------|
| pymc-marketing | Backend can potentially be swapped in (proposed "forvio-style" engine selection) |
| Decision AI (MMM Agent) | Competing product — Simba = managed services clients, MMM Agent = self-service + coaching clients |
| Synthetic Consumers | Separate product; both under PyMC Labs umbrella |
| EAP (Expert Access Program) | Sales conversations often mention both; inbound leads sometimes pivot between products |
| CausalPy | Proposed future integration for lift test analysis |

---

## Gaps / Unknown

- Exact current pricing (2026) — last confirmed: $2k/month base + $500/user (Sep 2025 quote to agency)
- Number of current active subscribers (Brilliant Earth cancelled Oct 2025; others unknown)
- Full feature list from current production version (channel goes dark Dec 2025)
- Marketing copy and landing page content (simba-mmm.com) — not scraped
- Website integration status — planned Oct 2025 ("Simba integration into website" thread, 4 msgs), outcome unknown

<!-- GAP: simba-mmm.com live content not scraped — use Playwright to capture current landing page and pricing page -->
<!-- GAP: No confirmed 2026 status; channel last message Dec 2025 -->
<!-- GAP: Number of active subscribers in 2026 unknown -->
