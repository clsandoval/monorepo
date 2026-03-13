---
page: solutions/simba
title: Simba
status: partial
sources:
  - analysis/discord-simba-extraction.md
  - analysis/halah-draft-scrape.md
  - analysis/discord-sales-extraction.md
  - analysis/discord-marketing-extraction.md
  - analysis/discord-website-extraction.md
  - analysis/website-scrape/crawl-remaining.md
---

# Simba — Page Content

## Product Identity

**Name:** Simba
**Full meaning:** **Si**mply Baye**s**ian M**M**M
**Tagline (draft):** Enterprise-level Bayesian solution for end-to-end MMM workflows
**Type:** SaaS platform
**Domain:** https://simba-mmm.com/
**Creator:** Niall Oulton (PyMC Labs Partner)
**Origin:** Built independently by Niall Oulton, then brought into PyMC Labs as a joint product

---

## Hero Section

**Headline candidates:**
- "Enterprise MMM, without the engineering overhead"
- "Simply Bayesian MMM — built for marketing teams, not just data scientists"
- "The Bayesian MMM platform your team can actually use"

**Sub-headline:**
Simba wraps PyMC Labs' enterprise-grade Bayesian modeling in a clean SaaS interface. Marketing teams can run, compare, and optimize MMM models — without touching Python.

<!-- GAP: Confirm hero copy with Niall / Halah — the above is constructed from Discord signals, not finalized copy -->

---

## What Is Simba

Simba is a SaaS platform that makes Marketing Mix Modeling accessible to marketing teams and agencies. Built on the same Bayesian modeling foundations as PyMC Labs' consulting work, Simba lets users:

1. Upload their media spend data
2. Configure the model with industry-specific priors
3. Fit a Bayesian MMM model
4. Compare and manage multiple model runs
5. Run budget optimizations with uncertainty-aware planning
6. Explore scenario planning and lift tests

The platform is powered by PyMC Labs' proprietary modeling engine (separate from, but compatible with, `pymc-marketing`).

---

## Simba vs. Decision AI (Key Differentiator)

Two PyMC Labs products serve different buyer types:

| | Simba | Decision AI (MMM Agent) |
|--|-------|------------------------|
| **Best for** | Clients wanting managed services | Clients wanting self-service + coaching |
| **Interface** | Web SaaS platform | AI agent workflow |
| **Delivery model** | Subscription SaaS | Monthly subscription / EAP |
| **Human oversight** | PyMC Labs team manages modeling | Client-driven with PyMC Labs coaching |

> "SIMBA will be primarily to sell to clients who want managed services, and MMM agent will be sold to clients who want self service + coaching...that seems like the most important differentiation between these two products."
— #simba, 2025-09-01

> "In many cases introductions to MMM Decision Agent led to demos/convos about SIMBA"
— Kemble, #sales, 2025-12-22

---

## Features

### Core Capabilities

**Data Input & Model Configuration**
- Upload structured media spend datasets (with associated channel costs required)
- Column mapping and media channel selection
- Industry benchmark priors ("AI Priors") for fast model setup

**Model Fitting & Management**
- Bayesian MMM fitting via PyMC Labs' engine
- Model management system — save, name, compare multiple model runs
- Model comparison view with key metrics (MAE, LOO) side-by-side
- Convergence indicators

**Optimization & Planning**
- Budget optimization with Bayesian posterior uncertainty controls
- Risk tolerance slider (grounded in utility theory — minimize risk, not just maximize revenue)
- ROAs over time: incremental revenue / actual spend per channel, rolled up monthly
- Scenario planner — edit media plans and model controls interactively

**Validation & Testing**
- Holdout validation
- Lift test integration (in-platform analysis)
- Smart linking for channel relationships

**Full-Funnel Modeling**
- Model connections for full-funnel models across multiple media tiers

### Planned Enhancements
- AI chatbot integration (Basic tier without bot / Premium tier with chatbot)
- `pymc-marketing` library integration as alternative modeling engine
- Multidimensional model class support for advanced customization

---

## Use Cases

- **Marketing agencies** running MMM across multiple clients (per-user seat pricing)
- **Enterprise marketing teams** who have existing Bayesian models in production and want a UI layer for ad hoc exploration and scenario planning
- **Companies with in-house data science teams** that hit limits running MMM at scale — want managed service with SaaS access included
- **Clients with SLA contracts** — Simba offered as an add-on to existing PyMC Labs service retainers

---

## Pricing

<!-- GAP: Confirm current pricing — below is from Sep 2025 Discord signals, may be outdated -->

**Pricing model:** Monthly subscription + per-user seats
- Base: ~$2,000/month
- Additional users: ~$500/user/month
- Free trial: available (shared instance, time-limited)
- SLA add-on: $2,500–$3,000/month on top of existing engagement

**Agency pricing:** Under discussion — potential media-spend-based model (scaled to total billings under management), similar to Sellforte.

> "I think go for 2k per month, 500 per additional user"
— Niall, #simba, 2025-09-09

---

## Clients & Traction

- **Coca-Cola** — Free trial (Mar 2024): "pretty mad if the first client signed up to a SaaS platform is coca-cola"
- **Cabify** — Free trial (Apr 2024)
- **Brilliant Earth** (jewelry) — First paying subscriber (Aug 2024); cancelled Oct 2025
- **TechStyle Group** — Simba added to SLA ($2,500/month add-on, Mar 2024)
- **TSB Bank** — Pricing reference for agency quote (Sep 2025)
- **Nomad Foods** — Demo with Simba + Insight Agent (Nov 2025)
- **Found Search Marketing** — Agency prospect ($15M rev), quoted $2k/month (Sep 2025)

---

## Relationship to PyMC Ecosystem

> "I was thinking about when the right time will be to integrate pymc-marketing into Simba. I was thinking like a forvio style approach where you can select simba classic or pymc marketing dropdown and then that becomes the 'engine'..."
— Niall, #simba, 2024-05-14

- **pymc-marketing**: Potential future back-end engine swap (currently separate custom engine)
- **CausalPy**: Proposed integration for lift test analysis inputs
- **Decision AI (MMM Agent)**: Complementary product — serves different buyer persona
- **Expert Access Program (EAP)**: Sales conversations often bridge both products

---

## Pull Quotes for Page

> "Simply Bayesian SimBa MMM — we've been working on (Simply Bayesian SimBa MMM)"
— Niall Oulton, #simba, 2024-01-04

> "Enterprise-level Bayesian solution for end-to-end MMM workflows."
— PyMC Labs services description, Halah draft site, 2025

> "If it seams like the only thing a lead will go for — based on what we currently do — we'll offer it them."
— Niall Oulton, #simba, 2024-01-26

> "Adding a chatbot feature, similar to the EAP one, to SIMBA would be really neat and could help users with questions about the platform and how to set it up"
— Tim McWilliams, #simba, 2025-10-06

---

## Content Gaps

<!-- GAP: Live simba-mmm.com content not scraped — use Playwright to capture current marketing copy, feature list, and pricing page -->
<!-- GAP: No finalized hero copy — all above is constructed from Discord signals -->
<!-- GAP: Screenshots/product UI not captured -->
<!-- GAP: Current subscriber count and case studies not confirmed for 2026 -->
<!-- GAP: Simba website integration into pymc-labs.com — planned Oct 2025; status unknown -->
<!-- GAP: Competitive differentiator copy vs Recast, Meridian, Rockerbox — partial from Discord but no finalized positioning statement -->
