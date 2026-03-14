---
page: services/solution-delivery
title: Solution Delivery
status: complete
sources:
  - analysis/website-scrape/services.md
  - analysis/halah-draft-scrape.md
  - analysis/website-scrape/crawl-remaining.md
  - analysis/discord-sales-extraction.md
  - analysis/discord-case-studies-extraction.md
  - analysis/discord-marketing-extraction.md
  - analysis/discord-decision-ai-extraction.md
  - analysis/discord-simba-extraction.md
  - analysis/discord-pymc-ecosystem-extraction.md
---

# Solution Delivery — PyMC Labs

## Page Purpose

Solution Delivery is the "We Build" pillar. It covers all engagements where PyMC Labs produces a tangible deliverable: custom Bayesian models, AI systems and agents, production-grade analytics infrastructure, and specialized analytical tooling. This pillar consolidates what the old site called "Modeling & Optimization" and "AI Systems," and what the Halah draft called "Custom Bayesian Models" and "Bayesian AI Solutions."

> "Solution Delivery > We Build"
> — Halah, #sales, 2026-02-21

> "I really like this framework! Consulting and advising is different than Building..."
> — James Dodge, #sales, 2026-02-21

---

## Hero Section

### Option A (Halah draft, home teaser — Custom Bayesian Models)
**Headline:** Custom Bayesian Models
**Subhead:** "Tailored probabilistic models that transform uncertainty into actionable insights for confident decision-making."

### Option B (Halah draft, services page)
**Headline:** Custom Bayesian Models
**Description:** "We build custom probabilistic models that turn uncertainty into actionable insight. From forecasting to causal analysis, our Bayesian solutions help organizations make confident, data-driven decisions."

### Option C (Halah draft — Bayesian AI Solutions tier)
**Headline:** Bayesian AI Solutions
**Description:** "We build intelligent, autonomous systems powered by Bayesian reasoning. Designed to acquire knowledge, plan, and act, our Bayesian AI solutions enable organizations to automate complex decisions with transparency and control."

### Option D (live site — Modeling & Optimization)
**Headline:** Modeling & Optimization
**Description:** "Unlock the value of your data with bespoke Bayesian AI models—designed, implemented, and optimized for precision, scalability, and clear business impact."
— pymc-labs.com, 2026-03-13

### Option E (live site — AI Systems)
**Headline:** AI Systems
**Description:** "Accelerate innovation with custom AI agents and systems that integrate state-of-the-art Bayesian AI and generative AI technologies for actionable insights and automation."
— pymc-labs.com, 2026-03-13

### Recommended one-liner (from FAQ):
> "We are builders, not just advisors. While we provide strategic guidance, our core strength lies in end-to-end implementation—from initial model architecture to deploying production-ready Bayesian systems within your existing tech stack."
— Halah draft FAQ

---

## What This Service Is

### Core Description (synthesized)

Solution Delivery encompasses everything PyMC Labs builds and deploys for clients:

1. **Custom Bayesian Models** — Bespoke probabilistic models built from scratch for a client's specific data, domain, and decision context. From hierarchical MMMs to causal inference engines to forecasting systems.

2. **Bayesian AI Agents & Systems** — Intelligent automated systems powered by Bayesian reasoning. The AI MMM Agent, CLV Agent, and Decision Hub are the flagship products. Built for automation of expert-level data work.

3. **Production Engineering** — Taking models from prototype to production: scalable architecture, GPU sampling optimization, reproducible pipelines, and integration into client tech stacks.

4. **Specialized Tooling** — Proprietary extensions beyond open-source PyMC-Marketing: custom adstock implementations, nested logit discrete choice models, Gaussian Process time-varying parameters, HSGP modulation, vectorized inference.

### From the sales playbook
> "Five pillars: Strategy and Technical Advisory, **Custom Bayesian Models, Bayesian and Agentic AI Solutions**, Embedded Teams, and Training and Workshops"
— Sales meeting summary (Evan), #sales, 2025-11-25

---

## Feature Bullets

### Sub-service: Custom Bayesian Models (from Halah draft)
- **Predictive Modeling:** Forecast outcomes with quantified uncertainty.
- **Causal Inference:** Understand drivers, not just correlations.
- **Probabilistic Forecasting:** Plan for multiple scenarios with confidence.

### Sub-service: Bayesian AI Solutions (from Halah draft)
- **MMM Insights Agent:** End-to-end agent for Marketing Mix Modeling built on Bayesian frameworks.
- **CLV Agent:** Specialized agent for full Customer Lifetime Value modeling with probabilistic rigor.
- **Simba:** Enterprise-level Bayesian solution for end-to-end MMM workflows.

### Sub-service: Modeling & Optimization (from live site)
> "Unlock the value of your data with bespoke Bayesian AI models—designed, implemented, and optimized for precision, scalability, and clear business impact."
— pymc-labs.com

---

## What Types of Problems PyMC Labs Builds For

### Media Mix Modeling (MMM)
The core offering. Full custom builds using PyMC-Marketing:
- Time-varying media effectiveness via Gaussian Processes
- Hierarchical MMM across markets, brands, regions
- Adstock + saturation transformations
- Lift test / holdout integration for calibration
- Budget optimization under posterior uncertainty
- Saturation curves for spend allocation decisions

> "Principled MMM: Implemented Bayesian Media Mix Model using custom priors that allowed HelloFresh to bake 'expert knowledge' directly into the math. Used Gaussian Processes to allow the model to adapt dynamically to market shocks."
— Halah draft, /work/hellofresh

**Key result:** 60x faster insights (HelloFresh) — transforming hours of computation into minutes.

### Customer Lifetime Value (CLV)
- BG/NBD and Pareto/NBD survival models
- Probabilistic CLV with full uncertainty quantification
- Segment-level forecasting for acquisition/retention decisions
- CLV Agent (alpha, Oct 2025): automated end-to-end CLV pipeline

### Causal Inference
- Quasi-experimental methods via CausalPy (10 methods: Diff-in-Diff, SCM, RDD, Interrupted Time Series, etc.)
- Bayesian structural equation modeling
- Spatial Gaussian Process models (Indigo Agriculture: field trial analysis)
- A/B test analysis with Bayesian inference
- Discrete choice modeling for causal sales analytics (Colgate: nested logit)

### Bayesian AI Agents
**AI MMM Agent (flagship, now Decision AI):**
- End-to-end: raw data → data exploration → model config → Bayesian inference → insight delivery
- ~80% reduction in manual grunt work
- Hours not months for a full MMM run
- Interactive expert analysis translating posterior estimates to actionable recommendations
- GPU-optimized sampling
- "Facebook ads drove 20% of sales with 4.5× ROI. Consider shifting budget from print to Facebook." — example output

**CLV Agent (alpha):**
- Automated Customer Lifetime Value modeling
- Full probabilistic rigor

### Forecasting & Simulation
- Probabilistic forecasting for demand, supply chain, capacity
- Scenario planning under uncertainty
- Bayesian hierarchical models for time series
- State space models

### Specialized Domains
- **Pharmaceutical / Clinical**: hierarchical Bayesian clinical trial analysis (Roche: 34K params / 250K obs)
- **Agriculture**: spatial Gaussian Process models for field trials (Indigo: variability-aware experimental results)
- **Consumer Research**: Synthetic Consumers / SSR methodology (Colgate: 9K human responses, 90% alignment)
- **Sports Analytics**: hierarchical Bayesian player/goaltender performance models (Dodgers, Real Madrid)
- **Gaming**: Bayesian game analytics (Supercell, Appodeal)
- **Finance**: Bayesian risk modeling, portfolio analysis (VisualVest, Everysk, Nürnberger)

---

## Client Examples with Results

### HelloFresh — MMM + Vectorized A/B Testing
**Services:** Custom Bayesian Models, MMM, A/B Testing
**Problem:** "Black Box Struggle" with Adstock/Saturation; "Computational Wall" with slow Bayesian A/B testing as data scaled to millions of observations.
**Solution:** Custom hierarchical Bayesian MMM with GP time-varying CAC; vectorized/parallelized A/B inference turning sequential into broadcasting.
**Results:**
- **60x faster insights** — hours to minutes
- **Saturation Curves** enabling precise spend allocation
- **From internal tool to industry standard** — HelloFresh work pioneered pymc-marketing
- Follow-up EAP signed at $8,000/month
— Halah draft /work/hellofresh + analysis/discord-case-studies-extraction.md

### Indigo Agriculture — Spatial Causal Models
**Services:** Custom Bayesian Models, Hierarchical Bayesian Causal, Embedded Teams
**Problem:** High environmental and experimental noise masked treatment effects; conventional models unreliable.
**Solution:** Hierarchical Bayesian causal models with credible intervals; GP spatial structure.
**Results:** Reliable treatment effect estimates; operational planning inputs with uncertainty quantification.
— Halah draft /work/indigo

### Roche — Large-Scale Pharmaceutical Modeling
**Technical highlight:** 34,000 parameters, 250,000 observations, ~1 hour per model run
— analysis/discord-case-studies-extraction.md

### Wegmans — Retail Demand Forecasting
**Technical highlight:** MAPE 13–14% on demand forecasting; multiple SOWs; Databricks shared client.
— analysis/discord-case-studies-extraction.md

### Colgate-Palmolive — Synthetic Consumers + Causal Sales Analytics
**Services (Part 1):** Synthetic Consumer research using SSR methodology
- 9,000+ human responses benchmarked across 57 personal care concepts
- **90% reliability** vs. human test-retest
- **74% agreement** with human panels on concept winners
- 85% distributional similarity

**Services (Part 2):** Nested Logit Discrete Choice Modeling for causal sales analytics
- Custom proprietary tooling: nested logit extended to arbitrary depth
- Identified cannibalization vs. incremental new product sales
- Counterfactual scenario analysis for product launch decisions
— Halah draft /work/colgate-palmolive + crawl-remaining.md

### Swarovski — Anomaly Detection / Modeling
**Technical highlight:** MAE improvement of 20% (Swarovski: −20% MAE)
— analysis/discord-case-studies-extraction.md

### Bain / Coca-Cola — Fuelight 360 MMM Production System
**Scale:** Full production MMM system for US, GB, BR markets ($3.25M combined budget)
**Monthly retainer:** Growing to $550–600k/month (Jan 2026)
— analysis/discord-partnerships-extraction.md + discord-finances-extraction.md

### Akili — Cognitive Modeling
**Services:** Custom Bayesian Models, cognitive science application
**Details:** Bayesian cognitive assessment scoring for ADHD treatment using Likelihood Approximation Networks (LANs); digital therapeutics domain.
— analysis/website-scrape/case-studies.md, content/case-studies/akili.md

### Appodeal — Gaming Analytics
**Services:** Custom Bayesian Models for gaming metrics
**Details:** Bayesian MMM for mobile app developer acquisition with adstock/saturation curves.
— analysis/discord-case-studies-extraction.md, content/case-studies/appodeal.md

### Supercell — Gaming (Databricks shared client)
**Services:** MMM and gaming analytics
**Details:** Bayesian MMM for mobile game user acquisition; EAP initiated from conference lead; Databricks shared client.
— analysis/discord-partnerships-extraction.md, content/case-studies/supercell.md

### Live Nation — Hierarchical MMM at Scale
**Services:** Custom Bayesian Models, Solution Delivery
**Problem:** Modeling concert tour ticket sales ROI across a vast artist portfolio.
**Solution:** Hierarchical Bayesian MMM applied across 125+ artists (SOW 1 & 2).
**Technical highlight:** Hierarchical partial pooling to estimate media effects across hundreds of artists simultaneously.
— content/case-studies/live-nation.md

### Takeda — Pharma Manufacturing State Space Models
**Services:** Custom Bayesian Models, Solution Delivery
**Problem:** Optimize CAR-NK cell therapy manufacturing across a 28-day pipeline.
**Solution:** Bayesian state space modeling for cell therapy manufacturing optimization.
**Engagement:** 15-month SOW (ongoing as of Mar 2026).
— content/case-studies/takeda.md

### Streaming A/B Test — Scale Bayesian Testing to 100M+ Observations
**Services:** Custom Bayesian Models, Solution Delivery
**Client:** Large video streaming service (unnamed)
**Problem:** Standard Bayesian A/B testing was computationally infeasible at 100M+ observation scale.
**Solution:** Histogram approximation approach making large-scale Bayesian inference tractable; contributed to open-source infrastructure.
— content/case-studies/streaming-ab-test.md

### SALK — Multilevel Regression & Post-Stratification (MrP)
**Services:** Custom Bayesian Models, Solution Delivery
**Client:** SALK (Liberal Citizen Foundation), Estonia
**Problem:** Public opinion polling estimation from complex survey data.
**Solution:** MrP (multilevel regression + poststratification) for representative public opinion estimates.
**Technical note:** Direct application of the methodology taught in ABRM course (Session 6).
— content/case-studies/salk.md

### VisualVest — Probabilistic CLV Modeling
**Services:** Custom Bayesian Models, Solution Delivery
**Client:** VisualVest (FinTech / robo-investing)
**Problem:** Customer Lifetime Value modeling for a subscription investment product.
**Solution:** Shifted Beta-Geometric (sBG) survival model for probabilistic CLV with full uncertainty quantification.
— content/case-studies/visualvest.md

### Erisyon — Bayesian HMM for Protein Sequencing
**Services:** Custom Bayesian Models, Solution Delivery
**Client:** Erisyon (Biotech / Proteomics)
**Problem:** Bayesian inference for single-molecule protein sequencing with complex likelihood.
**Solution:** Bayesian Hidden Markov Model (HMM) with JAX-based likelihood for scalable single-molecule proteomics.
**Technical note:** Demonstrates PyMC Labs' JAX/NumPyro capability for custom likelihoods in novel domains.
— content/case-studies/erisyon.md

### Alva Labs — Bayesian Psychometric Modeling
**Services:** Custom Bayesian Models, Solution Delivery
**Client:** Alva Labs (HR Tech / hiring assessments)
**Problem:** Validate personality assessment reliability and construct validity at scale.
**Solution:** Bayesian psychometric modeling using Item Response Theory / Graded Response Model (IRT/GRM).
— content/case-studies/alva-labs.md

### Everysk — Private Equity Index from Cash Flows
**Services:** Custom Bayesian Models, Solution Delivery
**Client:** Everysk (Finance / investment management)
**Problem:** Construct a private equity performance index from sparse capital cash flow data.
**Solution:** Bayesian private equity index estimation from capital cash flows with full uncertainty propagation.
— content/case-studies/everysk.md

### Real Madrid — Fan CLV Modeling
**Services:** Custom Bayesian Models, Solution Delivery (EAP, incomplete)
**Client:** Real Madrid (Sports / Football)
**Details:** Fan CLV modeling using PyMC-Marketing BG/NBD; EAP engagement initiated; incomplete as of Mar 2026.
— content/case-studies/real-madrid.md

### Gain Theory — MMM + Bass Diffusion
**Services:** Custom Bayesian Models, Solution Delivery; also Training & Enablement
**Client:** Gain Theory (Marketing consultancy)
**Problem:** TV viewership prediction and MMM for a marketing consultancy upskilling their internal team.
**Solution:** Hierarchical Bayesian MMM + Bass Diffusion modeling; delivered as both a custom build and as a training/upskilling engagement.
**Cross-reference:** Also see Training & Enablement — Gain Theory appears as both a solution delivery case and a corporate workshop client.
— content/case-studies/gain-theory.md

---

## Testimonials

**Iraklis Pappas, Senior Data Scientist, Colgate-Palmolive:**
> "Working with PyMC Labs was a pleasure. They are knowledgeable and responsive."
— pymc-labs.com testimonials

**Manu Martinet, Indigo Agriculture:**
> "I was able to set up an initial model and get some interesting results and get buy-in internally to go further... that's where additional expertise was very helpful to get the model to the finish line and to production."
— pymc-labs.com testimonials

**HelloFresh (via Halah draft):**
> "Before collaboration, HelloFresh hit a 'technical ceiling' as they scaled."
— Halah draft /work/hellofresh context

**VisualVest (via Discord):**
> "not so common in consulting to challenge [the client]"
— analysis/discord-case-studies-extraction.md

**Nathan Kafi, Haleon:**
> "PyMC Labs has significantly enhanced our testing capabilities by leveraging the full power of Bayesian programming, maximizing the potential of the PyMC software."
— pymc-labs.com + EAP page

<!-- GAP: Need to confirm specific Colgate testimonial (Iraklis Pappas) full verbatim quote — partial in discord-website-extraction -->
<!-- GAP: Fox Entertainment result quote (Eugene Kwok) is advisory-focused, not delivery-focused -->

---

## Why PyMC Labs for Solution Delivery

### Creators of the tools they build with
> "PyMC Labs, founded by the creators of PyMC, delivers unmatched expertise in Bayesian AI, empowering organizations to tackle complex challenges beyond the reach of traditional methods."
— pymc-labs.com

> "Our approach provides interpretable solutions that integrate domain knowledge, achieving greater accuracy while requiring significantly less data than conventional Machine Learning techniques."
— pymc-labs.com

### End-to-end, not just advisory
> "We are builders, not just advisors. While we provide strategic guidance, our core strength lies in end-to-end implementation—from initial model architecture to deploying production-ready Bayesian systems within your existing tech stack."
— Halah draft FAQ

### Production track record
- Bain/Coca-Cola: multi-market production MMM system at $500k+/month scale
- HelloFresh: work pioneered pymc-marketing (now powering global brands)
- 34K params / 250K obs at Roche (~1hr runtimes)
- GPU-optimized sampling for 10x+ speedups

### OSS foundation = no black box
> "open-source vs. black-box, full flexibility vs fixed models"
— Competitive differentiation, analysis/discord-competition-extraction.md

### Academic + commercial hybrid
> "PyMC brings cross-disciplinary expertise spanning statistics, physics, engineering, economics, marketing analytics, neuroscience, programming, and business strategy."
— Kemble Fletcher, EAP page

---

## Technology Stack Used in Deliveries

- **PyMC** — Core probabilistic programming (9,500+ GitHub stars)
- **pymc-marketing** — MMM + CLV + Choice models (1,088+ stars, 1M+ downloads)
- **CausalPy** — Quasi-experimental / causal inference (1,123+ stars)
- **JAX / NumPyro** — GPU-accelerated sampling (via `sample_numpyro_nuts`)
- **PyTensor** — Tensor computation backend
- **ArviZ** — Model diagnostics and comparison
- **MLflow** — Model tracking and persistence (in Decision AI)
- **Databricks** — Production ML platform for scaling (partnership)
- **Python ecosystem** — Polars, scikit-learn, PyTorch, LangGraph (for agentic systems)

---

## Pricing Signals (from Discord — NOT for public page)

| Engagement Type | Rate |
|---|---|
| Junior data scientist (project) | ~$37,000–$40,000/month |
| Senior data scientist (project) | ~$50,000/month |
| Senior lead (Niall/Joe/Luca level) | ~$90,000/month |
| MMM Agent pilot (developer) | $10,000/month |
| MMM Agent guided pilot | $50,000/month (2-month min) |
| Causal inference standalone | $5,000–$10,000/experiment |
| MMM scoping / discovery | €40,000–€70,000 |

> Standard SOW + MSA structure. Rates above are NOT for public display.

<!-- GAP: Public pricing = "contact us" — do NOT publish rate card on this page -->

---

## Process / How It Works

### Step 01: Discovery and Alignment
"We start by exploring your decisions, data, and uncertainty. This helps identify high-impact opportunities and guides every step of our Bayesian approach."
— Halah draft "Our Approach" section

### Step 02: Solution Design
"We turn insights into solutions. Using Bayesian thinking, technical expertise, and domain knowledge, we design models, systems, or teams that deliver real impact."
— Halah draft "Our Approach" section

### Step 03: Integration & Growth
"We integrate solutions into workflows, enable your teams, and continuously refine models, systems, and processes to ensure lasting impact and growth."
— Halah draft "Our Approach" section

### Typical SOW Structure (from Discord)
- Scoping project → Full build SOW
- Ongoing EAP or Embedded Teams as follow-on
- Model audit → optimization sprint → production
- Workshop → build engagement (upsell path)

---

## CTA Section

### Primary CTA (from live site)
- **Headline:** "Ready to Transform Your Data Strategy?"
- **Body:** "Unlock the full potential hidden in your data. Partner with PyMC Labs and experience firsthand how Bayesian AI can drive smarter decisions, clearer insights, and measurable growth."
- **Button:** "Let's talk about your next breakthrough!"

### Origin framing (relevant for solution delivery)
> "Assembling a team of the most badass Bayesian modelers"
> "Most data science problems are not simple prediction but rather inference problems"
> "Rather than changing our problem to fit the solution...tailor the solution to best solve the problem at hand"
— Thomas Wiecki, origin post (2021), pymc-labs.com/blog-posts/saving-the-world

<!-- GAP: No dedicated "Solution Delivery"-specific CTA copy from Halah yet -->

---

## Cross-References

- **Strategy & Advisory** (`/services/strategy-advisory`): Often precedes a solution delivery engagement; EAP advisory can evolve into a build SOW
- **Embedded Teams** (`/services/embedded-teams`): When the build requires sustained in-house co-working
- **Training & Enablement** (`/services/training-enablement`): Knowledge transfer alongside or after delivery
- **Solutions / Decision AI** (`/solutions/decision-ai`): AI MMM Agent + Decision Hub = the flagship agentic delivery product
- **Solutions / Simba** (`/solutions/simba`): Managed service MMM platform, often sold alongside or instead of custom builds
- **Case Studies** (`/case-studies/*`): All 19 solution delivery cases — HelloFresh, Indigo Ag, Roche, Wegmans, Colgate (×3: cannibalization, shelf-optimization, synthetic-consumers), Swarovski, Akili, Appodeal, Supercell, Live Nation, Takeda, Streaming A/B Test, SALK, VisualVest, Erisyon, Alva Labs, Everysk, Real Madrid, Gain Theory (also Training)
- **Fox Broadcasting** (`/case-studies/fox-broadcasting`): Show-level MMM component is solution delivery; EAP/coaching component is Strategy & Advisory — dual-service case
- **OSS Libraries** (`/resources/open-source-libraries`): pymc-marketing + CausalPy = the open-source foundation of nearly every delivery
- See also: `content/about/story-and-team.md` for team technical pedigree

---

## Gaps

<!-- GAP: No single "Solution Delivery" brand name copy from Halah draft — Halah draft uses "Custom Bayesian Models" + "Bayesian AI Solutions" as separate services; the consolidation to "Solution Delivery" is new sitemap naming only -->
<!-- GAP: Need confirmation on what specific deliverables fall under "Solution Delivery" vs. "Embedded Teams" when both involve code — boundary is unclear from sources -->
<!-- GAP: Full Roche case study needed — only technical highlights captured (34K params, 250K obs); no client quote, business outcome, or use case narrative -->
<!-- GAP: Full Wegmans case study narrative needed — MAPE 13-14% captured but problem/approach/full story not yet assembled -->
<!-- GAP: Bain/Coca-Cola Fuelight case study is likely not publicly available — confirm with team before featuring -->
<!-- GAP: "Agentic Data Science" framing from Thomas (Jan 2026) may become the new hero concept for this page: "vibe coding is the future, but you need to add validation and build it the right way or you'll just get slop. That's where we come in: Agentic Data Science you can trust" -->
