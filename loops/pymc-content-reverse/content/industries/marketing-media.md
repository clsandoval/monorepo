---
page: industries/marketing-media
title: Marketing & Media
status: complete
sources:
  - analysis/discord-marketing-extraction.md
  - analysis/discord-case-studies-extraction.md
  - analysis/discord-competition-extraction.md
  - analysis/discord-sales-extraction.md
  - analysis/halah-draft-scrape.md
  - analysis/website-scrape/case-studies.md
  - analysis/website-scrape/blog-index.md
  - analysis/discord-pymc-ecosystem-extraction.md
  - analysis/discord-partnerships-extraction.md
  - content/industries/_overview.md
---

# Marketing & Media

Marketing & Media is PyMC Labs' **commercial flagship vertical**. Media Mix Modeling (MMM)
originated here — the HelloFresh engagement (2021) spawned pymc-marketing (2023), now the
dominant open-source Bayesian marketing analytics library. More blog posts, client logos,
testimonials, and product investment exist here than in any other vertical.

---

## Hero / Page-Top Options

### Option A — Thomas's founding insight (origin story angle)
> "he said that as cookies are going away, a lot of marketing companies are not quite sure how
> to do this. he thinks that Bayes is the answer as it allows to cross-link different data sets.
> I think marketing could be the field ripe for Bayesian disruption."

— Thomas Wiecki, #marketing, 2021-05-17

### Option B — Positioning statement (Halah, #sales FAQ copy, 2026-01-16)
> "We solve high-stakes problems across diverse sectors, including Marketing (MMM/CLV).
> While our methods are universal, our experience spans from Fortune 500 giants to
> pioneering startups like SpaceX."

### Option C — Aggressive sales pitch (Luca, #sales, 2022-06-15)
> "What is our value proposition? We are the only PyMC + MMM experts in the open-source and
> in-house modeling advisory. If they don't work with us what are they going to do? Accenture?
> If they do Accenture they will come back in two years to fix the mess anyway."

### Option D — Halah home hero (rotating tagline)
**"Bayesian Intelligence for [Marketing / Finance / Pharma / Sports]"**
(JS-animated word rotation — Marketing is the first/default word)

---

## Why Marketing & Media Needs Bayesian AI

### The Cookie Crisis
> "as cookies are going away, a lot of marketing companies are not quite sure how to do this.
> he thinks that Bayes is the answer as it allows to cross-link different data sets."

— Thomas Wiecki, #marketing, 2021-05-17 (paraphrased from client call)

Traditional attribution (last-click, multi-touch) requires individual-level user tracking.
As third-party cookies disappear, these methods are failing. Bayesian MMM provides
**privacy-first attribution** — aggregate-level, no individual tracking required.

### The Speed Problem
> "What if we told you that you could compress weeks of Bayesian MMM work into minutes?
> Yes, you read that right."

— Thomas Wiecki, #marketing (announcing MMM Agent), ~2025

Before PyMC Labs' innovations, Bayesian MMM took weeks of computation per run, making
iterative budget optimization impractical. The HelloFresh A/B testing project achieved
a **60x speedup** through vectorized inference.

### The Competition Reality
> "I always thought that we need to somehow delineate Bayes vs ML. But in reality, I don't
> think I encountered this on a single sales call where ML was even a consideration. Instead,
> our competition is intuitive-based human decision making and Excel spreadsheets."

— Thomas Wiecki, #sales, 2023-04-21

Most marketing teams aren't choosing between Bayesian and deep learning — they're choosing
between principled probabilistic models and gut feel + spreadsheets.

### Large Budget Qualifier
> "pricing in marketing analytics can be done by size of marketing budget too — e.g. a client
> with a 100 million budget stands more to gain from understanding how marketing is performing
> than a client with 5-10m"

— #sales, 2026 (context: ICP qualification)

---

## Use Cases

### 1. Media Mix Modeling (MMM)
Primary commercial flagship. Attribution across TV, Social, Search, Digital, and emerging
channels without relying on cookies or individual tracking.

**Key capabilities:**
- Hierarchical MMM across markets/channels
- Time-varying CAC via Gaussian Processes (HSGP)
- Adstock (geometric decay) + saturation curves
- Lift test calibration integrated into model likelihood
- Budget optimization with posterior uncertainty (not just point ROAS)
- Out-of-sample forecasting (a key differentiator vs. Meridian)
- LOO-CV, WAIC, ECDF-CRPS for model comparison

**pymc-marketing description:**
> "PyMC-Marketing is an open source software project that offers a powerful set of tools for
> data scientists and senior decision makers in the marketing analytics space... why using an
> open source package like this can be advantageous for your marketing analytics needs."

— #marketing, 2024 (Sangam, for LinkedIn post)

**One-liner for out-of-sample advantage:**
> "one of the core reasons why people go towards pymc-marketing: because it supports out of
> sample prediction — I had a call yesterday with a client who was migrating because meridian
> doesn't support forecasting"

— Thomas, #marketing, 2026-03 (quoting sales call)

### 2. A/B Testing at Scale
Bayesian A/B testing allows simultaneous inference on hundreds or thousands of experiments.
HelloFresh case: **60x speedup** on batch pipeline (5-6 hour overnight → minutes).
Key technique: vectorized inference (parameter broadcasting) replacing sequential sampling.

### 3. Customer Lifetime Value (CLV)
Probabilistic, cohort-aware CLV modeling. Pareto/NBD + GammaGamma framework implemented
in pymc-marketing. Provides full CLV distribution (not a point estimate) — enabling
segmentation by uncertainty, not just expected value.

**Blog post:** "Hierarchical Bayesian Models for Customer Lifetime Value: Beyond Traditional
CLV Prediction" — `/blog-posts/hierarchical_clv`

**CLV Agent:** AI copilot for full CLV modeling workflow (alpha, Oct 2025, PyMC Labs)

### 4. Marketing Attribution (Cookieless)
Build models that attribute revenue across touchpoints without individual tracking.
Privacy-first by design — aggregate-level causal inference. CausalPy for quasi-experimental
designs; Bayesian do-calculus for "what if" analysis.

**Blog post:** "Bayesian Causal Analysis in PyMC: Using the `do` operator to uncover true
marketing impact" — `/blog-posts/causal-analysis-with-pymc-answering-what-if-with-the-new-do-operator`

### 5. Marketing Budget Optimization
Given posterior uncertainty over ROAS curves, what is the optimal budget allocation?
PyMC-marketing's budget optimizer works on the full posterior — not point estimates.
Decision AI's MMM Agent automates this workflow end-to-end.

### 6. Experimentation Infrastructure
For teams running hundreds of concurrent experiments (like HelloFresh), Bayesian methods
enable principled multi-experiment inference without inflating false positive rates.
Vectorized MCMC sampling enables scaling to millions of observations.

---

## Named Clients

| Client | Engagement Type | Status | Notes |
|--------|----------------|--------|-------|
| **HelloFresh** | MMM + A/B Testing (SOW 1) + EAP (hellofresh-se, 2026) | Active | Flagship case study; $8k/mo EAP |
| **Ovative Group** | pymc-marketing deployment for multi-client MMMs | Active | Tim McWilliams testimonial |
| **Gain Theory** | SLA / coaching + custom MMM builds | Active | Joe Wilkinson (ex-GT) is now a PyMC Labs team member |
| **Fox Broadcasting Company** | EAP client | Active | Eugene Kwok testimonial; Embedded Teams delivery |
| **Appodeal** | Bayesian MMM / attribution (SOW) | Completed | Mobile ad mediation; early client 2021–2022 |
| **Sweeplift** | Early client | Completed | Named in Thomas's 2022 ICP analysis |
| **Twitch** | Early client | Completed | Named in Thomas's 2022 ICP analysis |
| **NBCUniversal** | Inbound lead | Qualified | MMM Pricing Deck sent |
| **CNN** | Inbound lead | Qualified | — |
| **Bloomberg** | Inbound lead | Qualified | — |
| **Audible** | Inbound lead | Qualified | — |
| **Live Nation** | Inbound lead | Qualified | — |
| **DISH US** | Inbound lead | Qualified | ~$300M marketing budget |
| **Serviceplan/Plan.Net** | Strategic partner (BMW pilot) | Active | ~€1.61M proposed 2026 contract; 100 MMMs, 20+ markets |

---

## Case Studies

### HelloFresh — Bayesian Media Mix Modeling
**URL:** https://www.pymc-labs.com/blog-posts/2022-11-11-HelloFresh
**Tags:** MMM, Bayesian Marketing Science

**Client:** HelloFresh — world's leading meal-kit provider (food delivery, global scale)

**Problem:**
Operating at massive global scale, HelloFresh needed to move marketing attribution and product
experimentation from traditional heuristic models to a high-performance, Bayesian-first framework.

Three critical challenges:
1. **Attribution black box:** Standard models struggled with adstock (lingering ad effects)
   and saturation (diminishing returns). Post-pandemic volatility made them unreliable.
2. **Computational wall:** Bayesian A/B testing was robust but slow. As data volume grew to
   millions of observations, pipeline took 5-6 hours overnight.
3. **Budget clarity:** Leadership needed to see exactly where to prune spend and where to
   double down for maximum ROI.

**Approach (Halah draft narrative):**
- **Principled MMM:** Bayesian Media Mix Model with custom priors allowing HelloFresh to bake
  "expert knowledge" directly into the math. Gaussian Processes for dynamic adaptation to
  market shocks.
- **Vectorized Inference:** Re-engineered A/B testing to massively parallelized, vectorized
  approach — turning "sequential" process into "broadcasting" one.
- **Time-varying CAC:** HSGP modulation on marketing effectiveness parameter — tracks how CAC
  changes over time and attributes changes to specific channels.

**Technical approach (Discord):**
- Hierarchical Bayesian MMM using PyMC
- Time-varying CAC modeled via Gaussian Process (HSGP)
- Hierarchical structure across markets/channels
- Adstock + saturation transformations
- Lift test integration to calibrate model
- JAX sampling via `sample_numpyro_nuts` for performance
- ECDF-CRPS, LOO-CV, WAIC for model comparison

**Results:**
- **60x faster insights:** 60-fold increase in A/B test speed — transforming hours into minutes
- **Saturation curves:** Clear visualization of where to prune spend and where to double down
- **Industry standard:** Work pioneered at HelloFresh became the foundation for pymc-marketing,
  now powering marketing science for companies globally

**Internal quote (Niall):**
> "The time-varying intercept via GP is the key innovation here — lets us see when CAC is
> improving or getting worse and attribute it to channels"

— Niall, #hellofresh-mmm Discord channel

**Internal quote (Thomas):**
> "This is one of the most technically sophisticated MMMs we've built"

— Thomas, #hellofresh-mmm Discord channel

**Halah draft summary:**
> "We partnered with HelloFresh to replace 'black-box' attribution with a high-performance
> Bayesian framework for Media Mix Modeling and A/B testing. This collaboration unlocked a
> 60x increase in experimentation speed and provided a transparent, data-driven map for
> optimizing global marketing spend."

— Halah Joseph, https://loyal-growth-093412.framer.app/work/hellofresh

**Blog posts (3 published):**
1. "Bayesian Marketing Mix Models: State of the Art and their Future" (overview) — `/blog-posts/2022-11-11-HelloFresh`
2. "Improving the Speed and Accuracy of Bayesian Media Mix Models" (MMM deep dive) — `/blog-posts/reducing-customer-acquisition-costs-how-we-helped-optimizing-hellofreshs-marketing-budget`
3. "How HelloFresh Scaled Bayesian A/B Testing with a 60× Speedup" (A/B testing) — `/blog-posts/bayes-is-slow-speeding-up-hellofreshs-bayesian-ab-tests-by-60x`

**Team:** Niall (lead/PM), Bill, Thomas (technical advisor), Sef M (account management), Luca Fiaschi (client-side lead at HelloFresh, later joined PyMC Labs as Partner)

**Follow-up:** hellofresh-se EAP engagement started February 2026, $8,000/month.

---

### Gain Theory — Multi-Client Bayesian MMM SLA
**Client:** Gain Theory (WPP marketing science consultancy)
**Engagement type:** SLA / coaching + custom model builds
**Industry context:** Gain Theory appears in Forrester Wave for MMM; DoorDash is a named GT client.

**Problem:**
1. Technical review and upskilling on Bayesian MMM methodology
2. Custom MMM implementations for their clients
3. PyMC-Marketing integration and best practices

**Technical approach:**
- PyMC-Marketing framework deployment for client MMMs
- Hierarchical Bayesian MMM with geographic/market dimensions
- **Bass Diffusion Model** for show viewership:
  > "For Prime Video, we fit a Bass Diffusion model on show viewership. p = Fans/Early Engagers,
  > q = persuadables, m = audience size. We then built cross-sectional models of these parameters
  > to breakdown their drivers. p parameter was influenced by media prior to launch. q influenced
  > by media post-launch."
  > — Joe Wilkinson, #gain-theory-mmm Discord channel
- HSGP for time-varying parameters
- Lift test calibration integrated into model likelihood
- Budget optimization via PyMC-Marketing optimizer

**Media "cover" transformation (Joe Wilkinson):**
> "We would transform the media into what we termed 'cover' -> essentially the % of the target
> audience that meets some exposure requirements"

— Joe Wilkinson, #gain-theory-mmm Discord channel

**Status:** Active SLA / ongoing engagement. Joe Wilkinson (ex-Gain Theory) now a PyMC Labs team member — bridges the PyMC technical world with the marketing science world.

---

### Appodeal — Mobile Ad Attribution MMM
**Client:** Appodeal (mobile app monetization platform)
**Engagement type:** Custom Bayesian MMM project (SOW)

**Problem:**
Mobile ad mediation required understanding which marketing channels were driving app developer
acquisition. Standard attribution inadequate due to multi-touch paths and significant data noise.

**Approach:**
- Bayesian MMM with adstock (geometric decay) + saturation
- PyMC-Marketing extended with custom components
- Hierarchical structure across acquisition channels
- Time-varying intercept via GP for trend/seasonality
- ROAS estimation with **credible intervals** (distribution, not point estimate)

**Key insight (Niall):**
> "The Bayesian approach is really valuable here because we're not just giving them a point ROAS,
> we're giving them a distribution — they can see which channels have high expected return but
> also high uncertainty"

— Niall, #appodeal Discord channel

**Status:** Completed. One of the earliest MMM clients (2021–2022).

---

## Testimonials

### Tim McWilliams — Ovative Group
> "At Ovative Group, PyMC-Marketing is our go-to for building custom MMMs. Its flexibility and
> customizability let us tailor robust models to each client's needs. It's a powerful tool that
> helps us deliver deeper insights and smarter media strategies."

— Tim McWilliams, Sr. Manager Data Science, Ovative Group
(source: https://www.pymc-labs.com/, scraped 2026-03-13)

**Context:** Ovative Group is a digital marketing agency using pymc-marketing for multiple
client MMM engagements. Tim McWilliams also taught the BMA course (Feb 2026 cohort).

<!-- GAP: Eugene Kwok (Fox Entertainment) testimonial referenced in website-crawl-remaining but full text not captured — check analysis/website-scrape/crawl-remaining.md -->

---

## Products & Solutions for This Industry

### pymc-marketing (OSS)
- **Stars:** 1,088★, 1M+ downloads (as of early 2026)
- **JOSS paper:** Submitted January 2026
- **Core modules:** MMM, CLV, Choice (discrete choice modeling)
- **Production users:** HelloFresh, Colgate, Wegmans (Databricks shared client), Ovative Group
- **URL:** https://github.com/pymc-labs/pymc-marketing

### MMM Agent / Decision AI
AI copilot for MMM workflows — turns raw media spend data into strategic guidance in hours.
> "MMM Insights Agent — An AI copilot for MMM that turns raw media spend data into strategic
> guidance in hours — giving you fast, clear answers to 'what if' questions and helping you
> optimize spending for better ROI."

— Halah Joseph, #marketing, ~2025

- **Feature:** end-to-end agent: data handling → modeling → budget optimization
- **Pricing:** $10k/mo (teams with internal capacity) to $50k/mo (Databricks enterprise quote)
- **Decision Hub:** Launched Feb 26 2026 — 1,463 downloads in first week
- **Built on:** GCP/K8s/LangGraph/E2B/PostgreSQL/MLflow/PostHog

### Simba (MMM SaaS)
- Managed-service MMM platform for clients who want results without running models themselves
- **Differentiator:** Simba = managed services clients; Decision AI = self-service + coaching
- **Feature set:** data upload → benchmark priors → model fitting → budget optimization → ROAs over time → holdout/lift tests → scenario planner
- **Pricing:** $2k/month base + $500/user
- See: `content/solutions/simba.md`

### CLV Agent
- AI copilot for Customer Lifetime Value modeling
- Alpha launched October 2025
- Probabilistic CLV with full uncertainty quantification

### Fivetran Integration
> "We partnered with Fivetran to solve the biggest Marketing Mix Modeling bottleneck: data
> wrangling consumes the majority of #MMM efforts, leaving little time for insights that drive
> decisions."

— PyMC Labs announcement, #marketing, Sep 2025

- **Blog:** "From Weeks to Minutes: Accelerate building your Bayesian MMM using Fivetran & PyMC-Marketing"
- **URL:** https://www.pymc-labs.com/blog-posts/accelerating-bayesian-mmm-fivetran-pymc-marketing
- 600+ Fivetran connectors → pymc-marketing; joint webinar Oct 2025

---

## Competitive Landscape

### vs. Meridian (Google)
**Position:** Validate it, don't fight it. Meridian is market-validation signal, not direct threat.

Key differentiators:
- pymc-marketing supports **out-of-sample forecasting** (Meridian does not)
- pymc-marketing: **fully flexible, open-source** (Meridian moving toward "custom MMM programming language")
- Speed: **2x–20x faster** than Meridian in benchmark testing
- Luca: **"no scenario I would recommend Meridian"** — (from discord-competition)

Response strategy (Juan Orduz, Feb 2026):
> "So if we are ever asked 'how do we compare?' We could kind of answer 'well, that is irrelevant
> because we can easily build a similar model with our PyMC-Marketing stack, see here'"

Juan created a notebook replicating Meridian's core MMM using PyMC-Marketing splines — doesn't
mention Meridian by name.

**Competitive content:**
- Blog part 1: "PyMC-Marketing vs. Meridian: A Quantitative Comparison" — `/blog-posts/pymc-marketing-vs-google-meridian` (2,498 monthly sessions)
- Blog part 2: "PyMC-Marketing and Meridian Revisited: Approaches to Baseline Modeling for MMMs" — `/blog-posts/pymc-marketing-vs-meridian-baseline-modeling-mmm`
- Webinar: "Most MMM conversations focus on channels, curves, and budget shifts. But the part that often decides the entire story sits quietly in the background: the baseline."

### vs. Robyn (Meta/Facebook)
**Position:** Opportunity. Robyn is effectively dead as of late 2025 (last PR merged 4+ months ago).
> "Every Robyn user and marketer is going to be exposed to pymc-marketing in an event we don't
> have to push"
— Niall, #competition, Nov 2023

Strategic play: blog posts targeting Robyn search terms; GitHub stars of Robyn repo = qualified leads.

### vs. Recast (Bayesian MMM SaaS, $3.4M raised)
**Position:** Most closely tracked SaaS competitor. Framed as "mysteriously blackboxed alternative."
> "Pretty high praise from a competitor with a for-pay (and mysteriously blackboxed) alternative."
— Christian, #competition, Mar 2023 (after Recast's own page endorsed pymc-marketing)

Team attrition at Recast is visible: Demetri Pananos (Oct 2024), Chelsea Parlett (Oct 2025),
Taylor Rock (Feb 2026 — "one of the main guys") all departed.

### vs. Analytic Partners (Legacy incumbents)
- ~$60-100M/yr revenue; models in **Excel or R**
- PyMC Labs differentiator: production-grade Bayesian vs. legacy statistical methods
- "Legacy MMM agency" positioning opportunity

### vs. Accenture/McKinsey (General consultancies)
> "If they do Accenture they will come back in two years to fix the mess anyway."
— Luca, #sales

**Standard response to Accenture objection:** "We are the only PyMC + MMM experts in the
open-source and in-house modeling advisory. If they don't work with us what are they going to do?"

---

## Blog Content for This Industry

Marketing is the most-blogged vertical. ~15 MMM posts indexed.

**Top-performing (by monthly sessions, Dec 2025):**

| Rank | Title | URL slug | Sessions |
|------|-------|----------|---------|
| 3 | The AI MMM Agent | the-ai-mmm-agent | 2,600 |
| 4 | PyMC Marketing vs Google Meridian | pymc-marketing-vs-google-meridian | 2,498 |
| 9 | Bayesian Media Mix Modeling for Marketing Optimization | bayesian-media-mix-modeling-for-marketing-optimization | 1,636 |
| 11 | Marketing Mix Modeling: A Complete Guide | marketing-mix-modeling-a-complete-guide | 1,325 |

**Full blog list for Marketing & Media page (chronological, newest first):**
1. Tracking Marketing Effectiveness Over Time Using Bayesian MMMs (Jan 2026) — time-varying CPA / GP
2. PyMC-Marketing and Meridian Revisited: Baseline Modeling (Dec 2025)
3. MMM Calibration with Lift Tests and Bayesian Priors (2025) — `/blog-posts/mmm_roas_lift`
4. Introducing the BETA Release of Our MMM Agent (2025) — `/blog-posts/ai-mmm-agent-beta`
5. Accelerating Bayesian MMM using Fivetran & PyMC-Marketing (Sep 2025)
6. PyMC-Marketing vs. Meridian: Quantitative Comparison (Sep 2025)
7. The AI MMM Agent: AI-Powered Shortcut to Bayesian Marketing Mix Insights — `/blog-posts/the-ai-mmm-agent`
8. Marketing Mix Modeling: A Complete Guide — `/blog-posts/marketing-mix-modeling-a-complete-guide`
9. Bayesian Causal Analysis: Using the `do` operator for marketing impact
10. How HelloFresh Scaled Bayesian A/B Testing with a 60× Speedup
11. Bayesian Marketing Mix Models: State of the Art and their Future (HelloFresh MMM overview)
12. Improving the Speed and Accuracy of Bayesian MMMs (HelloFresh MMM deep dive)
13. Bayesian Media Mix Modeling for Marketing Optimization

**Halah (Feb 2026) on the MMM Complete Guide:**
> "performing exceptionally well and has quickly become one of our top-performing pieces in
> terms of impressions, visibility and Clicks."

**Draft post (Mar 2026):** MMM + Chronos (time series foundation model) — `/draft-post/mmm_chronos`

---

## SEO Keywords for This Page

From Thomas's 14-tab keyword research (discord-marketing):
- `bayesian marketing mix modeling` / `bayesian MMM`
- `media mix modeling`
- `marketing mix modeling guide`
- `bayesian marketing analytics`
- `MMM calibration`
- `pymc-marketing vs meridian`
- `ai marketing mix modeling`
- `bayesian attribution` / `cookieless attribution`
- `customer lifetime value model`
- `bayesian AB testing`

---

## ICP for This Industry

**Primary buyer personas:**
- CMO / VP Marketing — wants to know "which channels are actually working"
- VP of Data / Head of Data Science — owns the modeling capability
- Marketing Analytics Lead — hands-on practitioner who found pymc-marketing

**Pain points:**
1. Cookie deprecation destroying attribution models
2. Google's Meridian lacks forecasting; Meta's Robyn is dead
3. MMM took weeks to run (speed kills adoption)
4. Excel-based models can't handle hierarchy/uncertainty
5. Multiple markets, SKUs, channels — complexity exceeds legacy tools
6. Marketing budget $10M+ — every % improvement is meaningful

**Qualifying signal:**
> "pricing in marketing analytics can be done by size of marketing budget too — e.g. a client
> with a 100 million budget stands more to gain from understanding how marketing is performing
> than a client with 5-10m"

**In-house DS team qualifier:**
> "ICP confirmed: companies with in-house DS capability hitting limits"
— Luca, #sales, 2026-03-05

---

## Value Propositions (Marketing-Industry-Specific)

1. **Speed:** 60x faster A/B testing (HelloFresh). MMM Agent: "compress weeks into minutes."
2. **Privacy-first attribution:** No cookies required — aggregate-level causal inference.
3. **Honest uncertainty:** "We're not giving them a point ROAS, we're giving them a distribution."
4. **Flexible/open-source:** pymc-marketing is fully customizable — not a black box.
5. **Forecasting capability:** Out-of-sample prediction (Meridian doesn't support this).
6. **Production-grade:** pymc-marketing in production at HelloFresh, Colgate, Wegmans.
7. **Expert knowledge integration:** Priors allow encoding domain expertise directly into models.

---

## Engagement Entry Points

For Marketing & Media clients, typical funnel:
1. **OSS/blog discovery** → pymc-marketing stars, MMM blog posts → book-a-call widget
2. **EAP (Expert Access Program)** — $5,000–$8,500/month — advisory/upskilling entry point
3. **Custom MMM project** — full model build + delivery; SOW-based
4. **MMM Agent SaaS pilot** — $10k–$50k/month for automated Bayesian workflows
5. **Simba** — managed MMM service for clients who want results without the DS overhead
6. **Corporate workshop** — $20–30k; targeted at marketing analytics teams

**EAP pricing for this vertical:**
- EAP Base (Expert Lifeline): $5,000/month
- EAP Pro (Deep Partnership): up to $8,500/month
- HelloFresh EAP follow-on: $8,000/month (hellofresh-se, 2026)

---

## Cross-References

- **Case study detail pages:**
  - `content/case-studies/hellofresh-mmm.md` (to be created in assemble-case-studies)
  - `content/case-studies/hellofresh-ab-testing.md`
  - `content/case-studies/gain-theory-mmm.md`
  - `content/case-studies/appodeal.md`
- **Products:**
  - `content/solutions/decision-ai.md` (MMM Agent / Decision Hub)
  - `content/solutions/simba.md` (managed MMM SaaS)
- **OSS:**
  - `content/resources/open-source-libraries.md` → pymc-marketing
- **Services:**
  - `content/services/solution-delivery.md` (custom MMM builds)
  - `content/services/strategy-advisory.md` (EAP)
  - `content/services/training-enablement.md` (BMA course, corporate workshops)
- **Partners:**
  - `content/partners.md` → Fivetran (MMM data integration), Databricks (MMM Agent runtime)

---

<!-- GAP: Eugene Kwok (Fox Broadcasting) testimonial — referenced in website-crawl-remaining but full quote text not captured -->
<!-- GAP: Ovative Group case study — Tim McWilliams testimonial exists but no case study narrative found; Halah labels it "Bayesian Agentic Solutions" which is a new label not in the taxonomy -->
<!-- GAP: Gain Theory full client list (WPP clients) not documented — Joe Wilkinson may have details -->
<!-- GAP: Specific Serviceplan/Plan.Net and BMW campaign results not available (contract not yet signed as of Feb 2026) -->
<!-- GAP: Live Nation, CNN, Bloomberg, NBCU — all qualified leads; conversion status unknown -->
