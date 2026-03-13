# Case Studies — Website Scrape Analysis
**Source:** https://www.pymc-labs.com/blog-posts/ + individual blog post URLs
**Date:** 2026-03-13
**Aspect:** website-case-studies

## Key Finding: No Dedicated Case Studies Section
There is NO `/case-studies/` page on pymc-labs.com (returns 404). Case studies exist as blog posts under `/blog-posts/`. The new sitemap's "Case Studies" section will need to be assembled from these blog post URLs.

Sitemap discovered via: https://www.pymc-labs.com/sitemap-0.xml (92 total URLs)

Blog categories relevant to case studies:
- `/blog-posts/filters/use-cases`
- `/blog-posts/filters/bayesian-marketing-science`

---

## Confirmed Case Studies (Published Blog Posts)

### 1. Akili Interactive — Cognitive Modeling for Digital Therapeutics
**URL:** https://www.pymc-labs.com/blog-posts/2023-01-12-Akili
**Date:** 2023-01-12
**Industry:** Pharma / Digital Health
**Service:** Solution Delivery, Training & Enablement

**Client:** Akili Interactive
**Product:** EndeavorRx (first FDA-approved prescription video game for ADHD)

**Problem:** Evaluate computational models of cognition for digital therapeutics applications (ADHD treatment). Traditional inference approaches were computationally infeasible for evaluating multiple cognitive models.

**Approach:**
- Likelihood Approximation Networks (LANs) + likelihood-free inference
- Neural networks to approximate likelihood functions
- Simulator-based inference (SBI)
- Parameter recovery validation
- Bayesian hierarchical modeling of NeuroRacer task (cognitive model)
- Predecessor toolbox: HDDM (Hierarchical Drift Diffusion Model)

**Results:**
- Accelerated inference speed for cognitive models
- Improved parameter recovery accuracy
- Enabled practical application of computational cognitive models to production use cases
- Knowledge transfer to Akili's research team
- Expanded applicability beyond ADHD to other behavioral health conditions

**Technologies:** PyMC, LANs, Neural networks, HDDM
**PyMC Labs Team:** Thomas Wiecki + Alex + Titi
**Akili Contact:** Andy (VP of Applied Data: Titi Alailima per homepage testimonial)

**Homepage Testimonial:** "Titi Alailima, VP of Applied Data, Akili"

---

### 2. Salk Institute — Hierarchical Bayesian Survey Modeling
**URL:** https://www.pymc-labs.com/blog-posts/2022-12-08-Salk
**Date:** 2022-12-08
**Industry:** Non-profit / Research / Public Opinion
**Service:** Solution Delivery

**Client:** Salk Institute (public opinion polling work)

**Problem:** Public opinion polls produce noisy, sparse data across population strata. Traditional methods struggle when certain demographic groups have limited survey responses.

**Approach:**
- Multilevel regression with post-stratification (MrP)
- Hierarchical Bayesian modeling of nested clusters/groups
- Gaussian Process integration for temporal/spatial patterns
- Interactive dashboard for results visualization
- Geospatial covariation extensions

**Results:**
- Stabilized estimates across demographic groups
- Meaningful predictions even with sparse data
- Actionable inference despite uneven survey distribution

**Technologies:** PyMC, Gaussian Processes, Dashboard visualization
**PyMC Labs Team:** Thomas Wiecki, Alex Andorra
**Salk Contact:** Tarmo Jüristo, CEO

**Homepage Testimonial:** "Tarmo Jüristo, CEO, SALK"
> "Makes inference possible – it makes it actionable, even [with] only a few data points for some demographics."

---

### 3. HelloFresh — Bayesian Media Mix Modeling (Overview)
**URL:** https://www.pymc-labs.com/blog-posts/2022-11-11-HelloFresh
**Date:** 2022-11-11
**Industry:** Retail / E-Commerce / Food Delivery
**Service:** Solution Delivery, Training & Enablement
**Related Posts:** reducing-customer-acquisition-costs (deep dive), bayesian-media-mix-modeling-for-marketing-optimization (intro)

**Client:** HelloFresh

**Problem:** Improve marketing budget allocation and forecasting. Move beyond traditional attribution to gain deeper insights into marketing effectiveness across channels (TV, social media, podcasts, daily deals).

**Approach:**
- Bayesian Marketing Mix Models (MMM)
- Hierarchical Gaussian Processes for time-varying effectiveness
- Adstock and saturation functions (diminishing returns)
- Calibration against incrementality measurements

**Results:**
- Budget optimization via what-if scenario analysis
- Forecasting capabilities for marketing performance
- Alignment between business stakeholders and data science teams
- Ability to quantify saturation with statistical confidence

**Technologies:** PyMC, Bayesian methods, Gaussian Processes
**PyMC Labs Team:** Thomas Wiecki, Alex Andorra, Luca Fiaschi (internal HelloFresh lead → later joined PyMC Labs as Partner)

---

### 4. HelloFresh — Reducing Customer Acquisition Costs (MMM Deep Dive)
**URL:** https://www.pymc-labs.com/blog-posts/reducing-customer-acquisition-costs-how-we-helped-optimizing-hellofreshs-marketing-budget
**Date:** 2021 (updated 2026-02-18)
**Industry:** Retail / E-Commerce / Food Delivery
**Service:** Solution Delivery, Training & Enablement

**Client:** HelloFresh

**Problem:** Three critical MMM limitations:
1. Lack of prediction precision (model overreacted to large spikes in customer counts)
2. Extended computation time (20 min per run), restricting experimentation
3. Difficulty interpreting model parameters in actionable business terms

**Approach:**
1. **Accuracy:** Log-transform outcome variable; replaced Normal with Student-T distribution for outlier handling
2. **Computation:** Rewrote adstock from O(n²) to O(n); custom Theano operator with Numba JIT compilation
3. **Interpretability:** Reparameterized reach function using saturation user count (β) and initial cost per user (c₀)
4. **Enablement:** Weekly collaboration calls, Jupyter notebook docs, pre-release PyMC3 features access

**Results:**
- **60% reduction** in prediction variance
- **10x speedup** in inference time (20 min → 2 min)
- Team gained capability to optimize marketing budgets independently
- Improved channel efficiency measurement

**Technologies:** PyMC3, Theano, Numba, Jupyter Notebooks, Python
**PyMC Labs Team:** Benjamin Vincent (author/lead)
**HelloFresh Team:** Data science team

**Key Metric:** 60% reduction in prediction variance; 10x speedup

---

### 5. HelloFresh — Speeding Up Bayesian A/B Tests by 60x
**URL:** https://www.pymc-labs.com/blog-posts/bayes-is-slow-speeding-up-hellofreshs-bayesian-ab-tests-by-60x
**Date:** ~2022
**Industry:** Retail / E-Commerce
**Service:** Solution Delivery

**Client:** HelloFresh

**Problem:** Thousands of concurrent A/B, ABC, ABCD tests running simultaneously. Full batch pipeline took 5-6 hours overnight. Poor sampling efficiency due to parameter correlations and high chain autocorrelation.

**Approach:**
1. Model redesign: one fewer parameter, revised priors, consistent A/B/ABC/ABCD structure
2. Tuning reduction (1,000 → 100 steps) — minor gains
3. pm.Data containers — negligible gains
4. **Breakthrough:** Consolidated all datasets into single large unpooled PyMC model

**Results:**

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Batch Runtime | 5–6 hours | 5–6 minutes | ~60x |
| A/B Test Speed | baseline | 1.2x | 1.2x |
| ABC/ABCD Speed | baseline | 2x | 2x |

**Technologies:** PyMC, MCMC, pm.Data, Python
**PyMC Labs Team:** Benjamin Vincent (author/lead)

**Key Quote:** "Strong parameter correlations and high chain autocorrelation meant that compute resources were not being translated efficiently into information about conversion probabilities."

---

### 6. Alva Labs — Bayesian Item Response Theory for Personality Assessment
**URL:** https://www.pymc-labs.com/blog-posts/2022-10-26-AlvaLabs
**Date:** 2022-10-26
**Industry:** HR Tech / SaaS
**Service:** Solution Delivery

**Client:** Alva Labs (personality assessment / pre-employment testing company)

**Problem:** Existing personality model had emerging challenges. Needed more sophisticated methods for combining data points and quantifying personality traits.

**Approach:**
- Bayesian workflow: problem understanding → data simulation → model building → parameterization testing → inference engine comparison → real data validation → benchmarking
- Item Response Theory (IRT): mathematical models for latent traits and observed responses
- Graded Response Model (GRM): ordered categorical responses in personality assessments
- PyMC as primary framework

**Results:**
- New Bayesian model substantially outperformed original Alva Labs system
- Faster sampling computations
- Improved memory efficiency
- Enhanced model reliability and validity
- Production-ready personality trait estimation

**Technologies:** PyMC, Python, multiple inference engines
**PyMC Labs Team:** Thomas Wiecki (author), Morgan

---

### 7. Indigo Ag — Spatial Gaussian Processes for Agricultural Biotech
**URL:** https://www.pymc-labs.com/blog-posts/2022-08-11-indigo
**Date:** 2022-08-11
**Industry:** Agriculture / AgriTech
**Service:** Solution Delivery

**Client:** Indigo Ag (agricultural biotechnology company)

**Problem:** Measure treatment effects of microbes on plant yield in agricultural field trials with limited data. Challenge: isolating genuine treatment effects from underlying spatial patterns in field variability.

**Approach:**
- Bayesian spatial modeling using Gaussian processes
- Signal decomposition: treatment effect + spatial effects + noise
- Limited data analysis leveraging Bayesian frameworks

**Results:**
- Successfully isolated treatment effects by modeling spatial patterns
- Enabled more accurate measurement of microbial treatment contributions to crop yield

**Technologies:** PyMC, Gaussian Processes, Bayesian methods
**PyMC Labs Team:** Thomas Wiecki, Bill Engels
**Indigo Contact:** Manu Martinet, Lead Data Scientist

**Homepage Testimonial:** "Manu Martinet, Lead Data Scientist, Indigo"
**Key Quote:** "The goal of the project was to identify the underlying spatial pattern and remove it in order to measure more accurately the treatment effect."

---

### 8. Everysk — Bayesian Private Equity Index Modeling
**URL:** https://www.pymc-labs.com/blog-posts/everysk
**Date:** 2021-02-25
**Industry:** Finance / Investment Management
**Service:** Solution Delivery

**Client:** Everysk (leading provider of risk workflows for multi-asset, global portfolios)

**Problem:** Estimate private equity returns from capital cash flows. Unlike liquid markets, private equity lacks transaction-based performance measures. Needed statistical estimation of time-varying value-added factors and investment exposure.

**Approach:**
- Joint scoping meeting: align technical and business perspectives
- Review existing code and reference paper
- Week of exploratory data analysis
- Initial Bayesian model development
- Model improvements beyond reference paper (upgraded samplers)
- Collaborative result interpretation and iteration
- **Key philosophy:** interpretability over predictive accuracy

**Results:**
- Successfully produced a Bayesian VC index from capital flow data
- Index aligned with Cambridge Associates VC Index benchmarks
- Cumulative return visualizations (US stocks vs. modeled VC vs. Cambridge Associates)

**Technologies:** PyMC, MCMC samplers, Python
**PyMC Labs Lead:** Ravin Kumar
**Key Quote:** "How can we figure out the unknown from the things we know? The answer lies with Bayesian Statistics."

---

### 9. Colgate-Palmolive — Synthetic Consumers Validation
**URL:** https://www.pymc-labs.com/blog-posts/AI-based-Customer-Research
**Date:** 2025-10-09
**Industry:** Consumer Goods / FMCG
**Service:** Solution Delivery, Research

**Client:** Colgate-Palmolive (collaboration with Iraklis Pappas, Global Head of AI → leading consumer products company)

**Problem:** LLMs asked directly for numerical survey responses produce unrealistic distributions (too many neutral responses, insufficient variation).

**Approach:** Semantic Similarity Rating (SSR) — two-step process:
1. Elicit natural language text responses from demographically-conditioned AI personas
2. Map responses to 1-5 rating scales via semantic similarity against reference anchors

**Results:**
- **90% correlation** with human product rankings
- **85%+ distributional similarity** to actual surveys
- Less positivity bias than human panels
- Validated against 57 real consumer surveys, 9,300 human responses

**Technologies:** LLMs, Python SSR methodology (open-sourced on GitHub)
**Team:** Benjamin F. Maier, Kli Pappas (Colgate-Palmolive), Ulf Aslak, Luca Fiaschi, Nina Rismal, Kemble Fletcher, Christian Luhmann, Robbie Dow, Thomas Wiecki

**Homepage Testimonial:** "Iraklis Pappas, Global Head of AI, Colgate-Palmolive"

---

### 10. Colgate-Palmolive — Causal Sales Analytics (Incremental vs. Cannibalistic)
**URL:** https://www.pymc-labs.com/blog-posts/causal-sales-analytics-are-my-sales-incremental-or-cannibalistic
**Date:** 2024-09-19
**Industry:** Consumer Goods / FMCG
**Service:** Solution Delivery

**Client:** Colgate-Palmolive

**Problem:** Determine whether new product sales were incremental (from competitors) or cannibalistic (from own existing products) in a saturated, competitive market.

**Approach:**
- Exploratory data analysis on retail sales datasets
- Multivariate interrupted time series model (initial solution — found insufficient)
- Causal and counterfactual modeling approach (developed when simple model failed)
- Framework handles overlapping product launches from multiple companies

**Results:**
- Demonstrated that simple multivariate ITS model fails in complex scenarios
- Causal solution developed (detailed in follow-up post)
- Model to be open-sourced

**Note:** Follow-up post with full results was planned (may be: `causal-sales-analytics-discrete-choice-modeling`)
**PyMC Labs Team:** Benjamin Vincent

---

## Bayesian MMM Intro/Overview Post
**URL:** https://www.pymc-labs.com/blog-posts/bayesian-media-mix-modeling-for-marketing-optimization
**Date:** 2021-09-17 (updated 2026-02-18)
**Author:** Benjamin Vincent
**Type:** Technical overview (also serves as intro to HelloFresh MMM engagement)

---

## Company Origin Story (Not a Client Case Study)
**URL:** https://www.pymc-labs.com/blog-posts/saving-the-world
**Type:** Founding narrative / Mission statement
**Title:** "Saving the world with Bayesian modeling"

**Key content:**
- Founded by Thomas Wiecki after leaving Quantopian (2020)
- Mission: Apply Bayesian statistics to critical global problems
- **Early clients mentioned:** SpaceX, Roche, Netflix, Deliveroo, HelloFresh
- Team: 3 neuroscience PhDs, mathematicians, social scientists, SpaceX rocket scientist, host of "Learning Bayesian Statistics" podcast
- PyMC3 paper: 930+ citations, top 10 PeerJ articles
- Scientific applications: COVID-19 spread prediction (Science journal), exoplanet detection, earthquake analysis, electoral forecasting

---

## Client Mentions (No Dedicated Case Study Post Yet)
From homepage testimonials and origin story:
- **Ovative Group** — Tim McWilliams, Sr. Manager Data Science (testimonial only)
- **Haleon** — Nathan Kafi, Principal Data Scientist (testimonial only)
- **SpaceX** — mentioned in founding post
- **Roche** — mentioned in founding post; also known as client from Discord channel roster
- **Netflix** — mentioned in founding post
- **Deliveroo** — mentioned in founding post

---

## Blog Post Sitemap Summary (92 URLs)
Full sitemap at: https://www.pymc-labs.com/sitemap-0.xml

### Pages to build content for:
- `/` — Home
- `/contact` — Contact
- `/team` — Team listing
- `/courses` — Courses hub
- `/courses/applied-bayesian-modeling` — ABM course
- `/courses/applied-bayesian-regression-modeling` — ABM Regression course
- `/courses/bayesian-marketing-analytics` — BMA course
- `/blog-posts` — Blog hub
- `/blog-posts/filters/` — 10 category filters
- `/benchmark/LLMPriceIsRight` — LLM Price benchmark (resource)
- `/privacy-policy`, `/terms-and-conditions` — Legal

**Note:** NO pages exist for:
- `/about/` (team at `/team`)
- `/services/` (services only on homepage)
- `/industries/` (not present on current site)
- `/solutions/` (not present)
- `/partners/` (not present)
- `/resources/` (benchmarks at `/benchmark/`)
- `/case-studies/` (exists only as blog posts)

These are all NEW pages that will need to be created for the new website.

---

## Gap Flags
<!-- GAP: Need to fetch causal-sales-analytics-discrete-choice-modeling (likely Colgate follow-up) -->
<!-- GAP: Roche case study — client mentioned but no blog post found -->
<!-- GAP: Netflix, Deliveroo, SpaceX — mentioned as clients but no case study content -->
<!-- GAP: Ovative Group, Haleon — testimonials only, no case study content -->
<!-- GAP: /blog-posts/filters/use-cases page content inaccessible (JavaScript-rendered) -->
<!-- GAP: Arc-Brown, Appodeal (Discord client channels) — no blog post case studies found -->
