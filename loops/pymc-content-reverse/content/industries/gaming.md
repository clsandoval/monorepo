---
page: industries/gaming
title: Gaming Industry
status: partial
sources:
  - analysis/discord-case-studies-extraction.md
  - analysis/discord-partnerships-extraction.md
  - analysis/discord-sales-extraction.md
  - analysis/discord-org-team-extraction.md
  - analysis/discord-decision-ai-extraction.md
  - analysis/discord-courses-workshops-extraction.md
  - analysis/public/press.md
  - analysis/website-scrape/blog-index.md
  - analysis/industries/_overview.md
---

# Gaming Industry

<!-- GAP: No dedicated Gaming case study page confirmed. No public-facing gaming testimonials found. Supercell engagement details are internal. Appodeal case study exists in Discord only — no published blog post. -->

---

## Hero / Positioning Options

### Option A — Ad Attribution framing
Gaming companies run massive multi-channel user acquisition campaigns across social, programmatic, rewarded video, and influencer. Standard last-touch attribution fails. Bayesian MMM gives ROAS distributions, not just point estimates — enabling budget decisions that account for uncertainty.

### Option B — Mobile-first framing
Mobile gaming is one of the most data-rich, fast-moving industries in the world. PyMC Labs built its marketing analytics offering partly from deep mobile ad tech roots: Luca Fiaschi (Partner) was previously Chief Data & AI Officer at MistPlay (a leading mobile gaming rewards platform), bringing direct domain expertise.

### Option C — Scale framing (Halah rotating tagline)
> "Bayesian Intelligence for [Marketing / Finance / Pharma / Sports]"
(JS-animated word rotation; "Gaming" is not currently in the Halah rotation — may need to be added)

---

## Why PyMC Labs for Gaming

**Luca Fiaschi's background** is the primary credibility hook:
- Former Chief Data & AI Officer at **MistPlay** (mobile gaming rewards platform)
- Former VP Data Science at **HelloFresh** and **Stitch Fix**
- MistPlay domain = user acquisition for mobile games + player LTV modeling

**November 2025 — Mobile Dev Memo Podcast:**
Luca appeared on "Mobile Dev Memo" (Eric Benjamin Seufert, a top mobile ad tech journalist/analyst):
- Topic: "Can an LLM Evaluate Ad Creative?"
- Covered: synthetic consumer methodology, LLM vs. human score distributions, statistical approaches, implications for gaming/mobile ad creative development
- URL: https://mobiledevmemo.com/podcast-can-an-llm-evaluate-ad-creative-with-luca-fiaschi/
- Bio used: "machine learning expert; previously executive data science roles at MistPlay, Stitch Fix, HelloFresh; now Partner for Generative AI at PyMC Labs — consultancy specializing in Bayesian methods, maintains open-source PyMC library"

This podcast appearance is the clearest public signal of PyMC Labs' gaming/mobile credibility.

---

## Use Cases

### 1. Media Mix Modeling (MMM) for User Acquisition
Gaming studios spend heavily on paid UA across Facebook/Meta, Google UAC, TikTok, rewarded video networks, influencer, and OOH. Standard attribution tools undercount cross-channel effects.

**PyMC approach:**
- Hierarchical Bayesian MMM across acquisition channels
- Adstock (geometric decay) and saturation functions
- Time-varying intercept via GP for trend/seasonality
- Posterior ROAS estimates with credible intervals per channel
- Budget optimization accounting for full posterior uncertainty

**Client evidence:** Appodeal (completed SOW, 2020); Supercell (EAP engagement, active 2025)

### 2. Customer / Player Lifetime Value (LTV)
Probabilistic LTV modeling is a core Decision AI use case. The CLV Agent (alpha, announced Oct 2025) automates:
- Data ingestion and cleaning
- Bayesian modeling: churn, repeat engagement, retention
- Pareto/NBD and BG/NBD variants via pymc-marketing
- Use cases: "marketing managers (CAC/LTV), PE analysts (portfolio health), CFOs (revenue/cash flow)"
  — Thomas Wiecki, #decision-ai, Oct 2025

### 3. In-App Purchase & Ad Revenue Optimization
Mix optimization across IAP, ads (rewarded/interstitial/banner), and subscription revenue. Bayesian portfolio models quantify uncertainty in each monetization lever.

### 4. A/B Testing at Scale
Gaming companies run hundreds of experiments simultaneously (matchmaking, pricing, UX, ad creative, level design). Bayesian A/B testing frameworks handle:
- Multiple simultaneous comparisons without alpha inflation
- Early stopping with principled Bayesian decision rules
- Hierarchical pooling across segments/cohorts

### 5. Synthetic Player Research (Ad Creative Evaluation)
From Luca's Mobile Dev Memo appearance:
- LLMs as synthetic respondents for evaluating ad creative
- Statistical validation: comparing LLM vs. human score distributions
- Implications: faster, cheaper creative testing before real-world UA spend
- Methodology overlaps with Colgate/CPG synthetic consumers work but applied to creative/UA context

### 6. Corporate Training for Gaming Data Science Teams
**Keywords Studios** (one of the world's largest gaming service providers — 70+ studios) ran a corporate Bayesian workshop with PyMC Labs:
- Date: March 2026
- Duration: 24 hours, 8 sessions
- Context: training internal data science teams on Bayesian methods

---

## Named Clients

### Supercell
- **Type:** Mobile Gaming Studio (Clash of Clans, Brawl Stars, Clash Royale)
- **Engagement:** EAP engagement initiated after conference inbound
- **Origin:** NY industry conference presentation by Christian (PyMC Labs); client rep: **"we want everything that Christian showed"**
- **Scope:** Hierarchical Bayesian MMM; market-level hierarchical structure; ROAS + budget optimization
- **Status:** Converted from conference lead → Active EAP client (as of 2025)
- **Partner connection:** Databricks shared client (Supercell + Fox Sports + Lidl + Wegmans in Databricks partner network)
- **Source:** analysis/discord-case-studies-extraction.md

**Niall on the Supercell inbound:**
> "This is one of our best inbound leads from a conference presentation"
— Niall Oulton, Discord, #supercell channel

**Client rep (NY conference):**
> "we want everything that Christian showed"
— Supercell representative, via #supercell channel

### Appodeal
- **Type:** Mobile Ad Mediation & Monetization Platform (app developer-facing)
- **Engagement:** Custom Bayesian MMM project — completed SOW
- **Origin:** One of PyMC Labs' first clients (2020, alongside Roche, Everysk, Arc Brown)
- **Problem:** Needed attribution modeling across marketing channels driving app developer acquisition; standard attribution inadequate for multi-touch paths + data noise
- **Technical approach:**
  - Bayesian MMM with adstock (geometric decay) and saturation functions
  - PyMC-Marketing framework extended with custom components
  - Hierarchical structure across acquisition channels
  - Time-varying intercept via GP (trend/seasonality)
  - LOO-CV and posterior predictive checks
  - ROAS estimation with credible intervals
- **Results:**
  - Channel contribution decomposition delivered
  - Posterior ROAS estimates with uncertainty quantification per channel
  - Client able to make media allocation decisions from model output
- **Status:** Completed SOW
- **Team:** Niall (lead), Thomas, Bill, Sef M
- **Source:** analysis/discord-case-studies-extraction.md

**Niall on Bayesian ROAS for Appodeal:**
> "The Bayesian approach is really valuable here because we're not just giving them a point ROAS, we're giving them a distribution — they can see which channels have high expected return but also high uncertainty"
— Niall Oulton, #appodeal channel

### Keywords Studios
- **Type:** AAA Game Services Company (one of the world's largest; 70+ studios globally)
- **Engagement:** Corporate Bayesian workshop
- **Date:** March 2026
- **Duration:** 24 hours, 8 sessions
- **Training type:** Internal data science team upskilling in Bayesian methods
- **Source:** analysis/discord-courses-workshops-extraction.md (channel: keyword-studios-workshop)

### Game Data Pros
- **Type:** Gaming analytics consultancy
- **Engagement:** Decision AI beta tester (Phase 2, August 2025)
- **Status:** Access revoked October 6, 2025 (along with Publicis and DPG in same wave)
- **Source:** analysis/discord-decision-ai-extraction.md

---

## ICP Profile

| Signal | Detail |
|--------|--------|
| **Buyer persona** | VP Data / Head of Growth / Director of Analytics / Head of UA |
| **Company type** | Mobile gaming studio; AAA publisher; gaming services company |
| **Primary pain** | UA attribution black-box; point ROAS estimates without uncertainty; player LTV inaccurate |
| **Secondary pain** | Creative testing is slow/expensive; A/B testing doesn't scale to hundreds of experiments |
| **Budget signal** | $10M+ UA spend (Supercell scale); gaming studios with data science teams in-house hitting limits |
| **Preferred entry** | EAP / advisory retainer (Supercell model); corporate workshop for team training (Keywords Studios model) |

---

## Competitive Positioning in Gaming

| Competitor | How PyMC Labs Positions Against Them |
|-----------|---------------------------------------|
| AppsFlyer / Adjust (mobile MMAs) | Last-touch attribution; no uncertainty quantification; no budget optimization |
| Meta Advantage+ / Google Performance Max | Black-box; can't audit; no channel decomposition |
| Internal DS teams | "Our competition is Excel and intuition" (Thomas) — also applies to gaming: most gaming DS teams use homegrown heuristic models |
| Meridian (Google MMM) | Relevant for gaming studios running multi-channel; same PyMC-vs-Meridian arguments apply: flexibility, speed, open-source |

---

## Products Relevant to Gaming

| Product | Gaming Use Case |
|---------|----------------|
| **pymc-marketing** | MMM framework; Bayesian A/B; CLV models (Pareto/NBD, BG/NBD) |
| **Decision AI / MMM Agent** | Automated UA attribution + budget optimization for gaming studios |
| **CLV Agent** (alpha Oct 2025) | Player LTV modeling; CAC/LTV ratio automation |
| **Simba** | SaaS MMM; could serve gaming studios that prefer managed service over custom build |
| **Training & Enablement** | Keywords Studios workshop; open-enrollment ABM/BMA courses |

---

## Domain Expertise Evidence

**Luca Fiaschi's MistPlay background:**
MistPlay is a mobile gaming rewards app where players earn points for playing games. As Chief Data & AI Officer, Luca would have worked on:
- Player engagement / retention modeling
- Reward optimization
- UA efficiency
- Ad revenue modeling

This makes Luca the primary domain expert for gaming client pitches.

**Blog content relevant to gaming:**
- "Hierarchical Bayesian Models for Customer Lifetime Value: Beyond Traditional CLV Prediction" (`hierarchical_clv`) — directly applicable to player LTV
- "Pareto/NBD Model for Customer Lifetime Value: A Bayesian Approach with PyMC-Marketing" (`pareto-nbd`) — gaming industry standard for monetization
- "Complete Guide to Cohort Revenue & Retention Analysis: Bayesian Modeling Approach" (`cohort-revenue-retention`) — cohort-based player monetization
- Multiple MMM blog posts (calibration, lift tests, budget optimization) — all applicable to UA

---

## Social Proof / Quotes Available

**Primary:** Niall Oulton on Appodeal ROAS (internal; not published)
> "we're not just giving them a point ROAS, we're giving them a distribution — they can see which channels have high expected return but also high uncertainty"

**Secondary:** Supercell client on conference presentation (internal; not published)
> "we want everything that Christian showed"

<!-- GAP: No published testimonials from gaming clients. No public case study blog post for Appodeal or Supercell. Luca's Mobile Dev Memo appearance is the strongest public social proof for gaming/mobile. Need to check if any gaming clients approved logo usage. -->

---

## Suggested Page Sections (for developer)

1. **Hero** — "Bayesian Intelligence for Gaming" / UA attribution + player LTV angle
2. **Why Bayesian for Gaming** — 3 bullets: uncertainty-native ROAS / principled A/B at scale / LTV with churn confidence
3. **Use Cases** — 5 cards: MMM for UA / Player LTV / A/B Testing / Ad Creative Evaluation / Team Training
4. **Client Logos** — Supercell, Appodeal, Keywords Studios (confirm logo approval before publishing)
5. **Domain Credibility** — Luca's MistPlay background; Mobile Dev Memo podcast feature
6. **Products** — pymc-marketing / Decision AI CLV Agent / Simba / Training
7. **CTA** — EAP retainer (for studios) / Workshop inquiry (for training buyers)

---

## Cross-References

- `content/solutions/decision-ai.md` — CLV Agent, MMM Agent (primary products for gaming)
- `content/solutions/simba.md` — Simba MMM SaaS (alternative delivery)
- `content/services/training-enablement.md` — Keywords Studios model
- `content/industries/marketing-media.md` — overlapping MMM use cases; Appodeal also appears there
- `content/about/team-members/luca-fiaschi.md` — domain expertise anchor for gaming pitch
