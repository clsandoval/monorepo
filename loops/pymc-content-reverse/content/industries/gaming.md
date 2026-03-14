---
page: industries/gaming
title: Gaming Industry
status: complete
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
  - web: https://mobiledevmemo.com/podcast-can-an-llm-evaluate-ad-creative-with-luca-fiaschi/ (fetched 2026-03-14)
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

## Web Research Enrichments (2026-03-14)

### Confirmed: Mobile Dev Memo Podcast Appearance

**Episode: "Can an LLM Evaluate Ad Creative?" — Mobile Dev Memo**
- Season 6, Episode 16
- Published: **November 4, 2025**
- Host: Eric Seufert (Eric Benjamin Seufert) — top mobile ad tech journalist/analyst
- Guest: **Luca Fiaschi**, Partner for Generative AI at PyMC Labs
- Article URL: https://mobiledevmemo.com/podcast-can-an-llm-evaluate-ad-creative-with-luca-fiaschi/
- Spotify: https://creators.spotify.com/pod/profile/mobile-dev-memo/episodes/Season-6--Episode-16-Can-an-LLM-evaluate-ad-creative--with-Luca-Fiaschi-e3ag5t8

**Guest bio used (verbatim):**
> "machine learning expert who previously held executive data science roles at MistPlay, StitchFix, and HelloFresh. He is now a Partner for the Generative AI vertical at PyMC Labs, a consultancy that specializes in the application of Bayesian methods to business problems and which maintains the open source PyMC library for Bayesian statistical modeling as well as the open source PyMC Marketing media mix modeling library."

**Paper discussed:** "LLMs Reproduce Human Purchase Intent via Semantic Similarity Elicitation of Likert Ratings"
- Authors: PyMC Labs team + Colgate
- Methodology: LLMs as synthetic consumer panels scoring product concepts; LLM-produced score distributions comparable to human panels
- Additional experiments: Quantified impact of disclosing generative AI authorship; field experiment (Google Display Network impressions); lab study with qualitative data
- Key finding: Generative AI tools benefit from "total control" in visual modality, while text generation performs better with structured chain-of-thought

**Why this matters for gaming page:**
- Mobile Dev Memo is the highest-credibility media outlet in mobile ad tech — used by Supercell, Applovin, Unity, and every major mobile publisher's UA teams
- Luca's MistPlay background + this publication = the strongest public signal that PyMC Labs has direct mobile gaming domain expertise
- The LLM creative evaluation methodology is directly applicable to gaming UA creative testing

### Luca Fiaschi's Role Confirmed
- Title: **Partner for the Generative AI vertical at PyMC Labs**
- Prior roles: MistPlay (Chief Data & AI Officer), StitchFix (VP Data Science), HelloFresh (executive)
- MistPlay = "mobile gaming rewards app where players earn points for playing games" — core business: UA efficiency + player engagement modeling

### No Public Appodeal or Supercell Case Study Found
Web searches did not surface any published blog post, case study, or public mention of PyMC Labs working with Appodeal or Supercell. All engagement detail remains Discord-sourced (internal).

### Note on "Appodeal" in PyMC Labs Tech Stack
One search result noted Appodeal appears in PyMC Labs' website technology stack — likely used for ad monetization on the PyMC Labs site itself, not a client relationship. This is distinct from the Appodeal *client engagement* documented in Discord.

---

## Cross-References

### Case Studies
- `content/case-studies/supercell.md` — Bayesian MMM for mobile game UA; EAP client
- `content/case-studies/appodeal.md` — Mobile ad attribution MMM; completed SOW (also in `content/industries/marketing-media.md`)

### Products
- `content/solutions/decision-ai.md` — CLV Agent, MMM Agent (primary products for gaming)
- `content/solutions/simba.md` — Simba MMM SaaS (alternative delivery)

### Services
- `content/services/training-enablement.md` — Keywords Studios corporate workshop (Mar 2026)

### Related Industry
- `content/industries/marketing-media.md` — overlapping MMM use cases; Appodeal also appears there

### Team
- `content/about/team-members/luca-fiaschi.md` — domain expertise anchor for gaming pitch (MistPlay background)
