---
page: industries/agriculture
title: Agriculture & AgTech
status: complete
sources:
  - analysis/discord-case-studies-extraction.md
  - analysis/discord-general-extraction.md
  - analysis/discord-marketing-extraction.md
  - analysis/halah-draft-scrape.md
  - analysis/website-scrape/case-studies.md
  - analysis/website-scrape/blog-index.md
  - content/industries/_overview.md
  - web: https://www.pymc-labs.com/blog-posts/2022-08-11-indigo (fetched 2026-03-14)
  - web: https://discourse.pymc.io/t/online-meetup-bayesian-modeling-in-biotech-using-pymc-to-analyze-agricultural-data-july-27-2022/9999
---

# Agriculture & AgTech

<!-- GAP: No dedicated agriculture section in Halah draft; no standalone agriculture landing page copy written. This vertical inherits from pharma/biotech framing. Consider whether to position as "Life Sciences & AgTech" or keep separate page. -->

---

## Hero / Page Framing Options

### Option A — Interpretability angle (Thomas, 2022-01-30)
> "Healthcare, pharma, and agriculture all need to explain their predictions, not just make them."

— Thomas Wiecki, #marketing, 2022-01-30

**Positioning:** Agriculture uses Bayesian methods because predictions must be defensible to agronomists, regulators, and investors — not just accurate.

### Option B — Uncertainty angle
High environmental and experimental noise in agriculture (weather, soil variation, pest pressure) makes point estimates dangerous. PyMC Labs builds models that quantify what they don't know.

### Option C — Field trial authority
PyMC Labs has delivered production-grade Bayesian causal models for field trials — the core statistical challenge of modern AgTech. The Indigo Ag engagement is the canonical case.

---

## PyMC Labs Relevance to Agriculture

Agriculture is one of PyMC Labs' original industry verticals, active since 2020 (Indigo Ag was among the first 5 clients). Core applications:

1. **Field trial analysis** — isolating treatment effects (e.g. microbial additives, fertilizers, seed genetics) from spatial field variability and environmental noise using Bayesian causal models
2. **Crop yield modeling** — probabilistic yield prediction under uncertainty (zero-inflated models for bad crop years, hierarchical across farms/regions)
3. **Spatial Gaussian Process modeling** — decomposing spatial variation in yields to separate field-level signal from noise
4. **Crop protection research** — Bayesian dose-response models for chemical efficacy (XC50 assay modeling), supporting agrochemical R&D pipelines
5. **Soil carbon / sustainability** — rigorous causal measurement for carbon credit programs

**Why Bayesian in Agriculture:**
- Field trials are expensive and small-N — Bayesian partial pooling borrows strength across farms in similar regions even when individual farm data is sparse
- Environmental and experimental noise is high — posterior distributions communicate uncertainty honestly to agronomists and stakeholders
- Treatment effects are subtle — spatial confounding must be explicitly modeled, not ignored
- Regulatory and investment audiences require interpretable, defensible conclusions

---

## Named Clients

### 1. Indigo Ag (Primary Case Study)

**Company:** Indigo Agriculture / Indigo Ag
**Website:** https://www.indigoag.com/
**Industry:** Agricultural Biotechnology / AgTech
**Client contact:** Manu Martinet, Lead Data Scientist
**Engagement duration:** 2020–2024 (multi-SOW, multi-year)
**Service type:** Custom Bayesian Models + Strategy & Technical Advisory + Embedded Teams
**Tags (Halah draft):** Custom Bayesian Models, Strategy & Technical Advisory, Embedded Teams, Hierarchical Bayesian Modeling, Bayesian Causal

**Company context:**
Indigo Ag is an agricultural biotechnology company that develops microbial seed treatments to improve crop yields and operates the "Indigo Carbon" program — a soil carbon credit marketplace requiring statistically rigorous measurement of crop interventions at scale. Their core scientific challenge: measuring whether microbial treatments actually improve plant yield, when field trial data is noisy, spatially structured, and limited.

**Problem:**
Measure treatment effects of microbes on plant yield in agricultural field trials with limited data. The core challenge: isolating genuine treatment effects from underlying spatial patterns in field variability.

From the website case study blog:
> "The goal of the project was to identify the underlying spatial pattern and remove it in order to measure more accurately the treatment effect."

Indigo also needed probabilistic models for crop yield prediction across multiple geographies, crop types, and growing conditions. The data had extensive zero-inflation (many zero/near-zero yields in bad years) and required accounting for weather covariates, soil data, and farm-level heterogeneity.

**Technical Approach:**
- **Spatial Gaussian Process (GP) modeling** — decomposing field-level signals: treatment effect + spatial effects + noise
- **Zero-inflated log-normal distribution** for crop yield (addressing many-zeros problem in agricultural data)
- **Hierarchical Bayesian structure** across farms, regions, crop types — borrows strength when individual farm data is sparse
- Gaussian Process components for both spatial and temporal variation
- Weather covariates (precipitation, temperature) as predictors
- PyMC / PyMC3-to-PyMC5 migration work (multi-year engagement)
- NUTS sampler; JAX backend for performance
- Posterior predictive checks to validate model behavior against observed yield distributions

Team note from Discord:
> "The zero-inflated lognormal is really the key here — you can't ignore that a significant fraction of fields have near-zero yield in bad years"

> "The hierarchical structure lets us borrow strength across farms in similar regions even when individual farm data is sparse"

**Results:**
- Successfully isolated treatment effects by modeling spatial patterns, enabling more accurate measurement of microbial treatment contributions to crop yield
- Zero-inflated model significantly improved fit over naive lognormal
- Model validated against holdout crop cycles
- Production deployment achieved (Manu: "get the model to the finish line and to production")
- Multi-year relationship: 2020 initial project → ongoing collaboration through 2024

**PyMC Labs team:** Thomas Wiecki, Luciano Paz, Adrian (statistical lead), Bill Engels (GP specialist), Niall, Carlos Trujillo
Published blog post: https://www.pymc-labs.com/blog-posts/2022-08-11-indigo

**Thomas on delivery (Dec 2020):**
> "Luciano and I just delivered the final presentation for the indigo project and it went super well. big kudos to Adrian who obviously solved all the statistical problems with ease but really understood what they actually wanted to know and then came up with a story and strong examples to communicate this to a bunch of agricultural frequentists without them getting upset."

— Thomas Wiecki, #general, 2020-12-17

**Client quote (2021):**
> "We love working with you and just hope that you will have bandwidth for us going forward."

— Indigo Ag team, quoted by Thomas Wiecki in #general, 2021-08-26

---

## Testimonial: Manu Martinet, Lead Data Scientist, Indigo Ag

**Version 1 (website/live site — scraped 2026-03-13):**
> "I have some solid basis, but I'd say like, I'm sort of like random data scientist, not an expert in Bayesian AI statistics and so, there was so much that i could do by myself. I was able to set up an initial model and get some interesting results and get buy-in internally to go further and that's where additional expertise. It was very helpful to get the model to the finish line and to production."

— Manu Martinet, PhD, Lead Data Scientist, Indigo Ag
(source: https://www.pymc-labs.com/, scraped 2026-03-13)

**Version 2 (Sangam testimonial, 2023-06-21):**
> "As a data scientist without expertise in Bayesian statistics, I had a solid foundation but recognized the limitations of my abilities. Setting up an initial model and obtaining interesting results were within my scope, but it was the invaluable additional expertise that proved instrumental in validating and improving the initial prototype. Working together for the past two years, we continued building and iterating on models, particularly focusing on the estimation of treatment effects for Agriculture."

— Manu Martinet, PhD, Lead Data Scientist, Indigo Ag
(source: analysis/discord-marketing-extraction.md, Sangam, 2023-06-21)

---

### 2. Syngenta

**Company:** Syngenta Group
**Industry:** Agrochemicals / Crop Protection Research
**Client contact:** Guillaume (lead modeler, Syngenta Crop Protection Research)
**Engagement type:** SLA / Coaching — Bayesian code review and model advisory
**Service:** Strategy & Advisory (EAP-style)
**Status:** SOW 1 completed March 2025; SOW 2 completed December 2025

**Company context:**
Syngenta is one of the world's largest agrochemical companies. Their Crop Protection Research team develops and tests chemical formulations at massive scale, requiring rigorous probabilistic modeling of dose-response relationships (XC50 assays) for every compound.

**Problem:**
Syngenta's Crop Protection Research team needed expert review of their probabilistic modeling pipeline for:
1. XC50 assay modeling (chemical potency measurement)
2. Relative potency models
3. Hierarchical GLM binomial models for desirability functions
4. Production deployment review for Dataiku DSS environment

Challenge: scaling probabilistic models to every XC50 assay at Syngenta-scale production.

**Technical Approach:**
- SLA/coaching format: PyMC Labs reviews Syngenta's own models and provides expert technical feedback (client does their own implementation)
- Binomial GLM models for dose-response data
- Hierarchical Bayesian models for relative potencies
- Zero-inflated models explored for assay data
- Code architecture review for production deployment on Dataiku DSS
- Model comparison methodology (Guillaume noted R² diminished when adding multi-year data)

**Results:**
- SOW 1 completed March 2025; SOW 2 completed December 2025
- Two full SLA cycles delivered
- Both engagements driven by positive client feedback → follow-on contract

**Key quotes:**
> "Guillaume's last model is great, I would be hard pressed to find a critique."

— Virgile (PyMC Labs, technical reviewer), #syngenta channel

> "The feedback has been overwhelmingly positive, mostly thanks to your technical review."

— Eric Ma (PyMC Labs, account lead), #syngenta channel

> "I think together, we've done a great job! The value delivered, especially for the technical dives that you've done, should help us in securing the next round contract."

— Eric Ma, end of SOW 1, #syngenta channel

**PyMC Labs team:** Eric Ma (account lead, GMT-5), Virgile (technical reviewer SOW 1), Junpeng (technical reviewer SOW 2), Thomas Wiecki

---

## Use Cases by Application

| Application | Method | Relevant Client |
|---|---|---|
| Field trial treatment effects | Spatial GP + hierarchical causal Bayesian | Indigo Ag |
| Crop yield prediction (multi-year) | Zero-inflated lognormal + hierarchical Bayes | Indigo Ag |
| Chemical dose-response (XC50) | Binomial GLM + hierarchical Bayesian | Syngenta |
| Relative potency modeling | Hierarchical Bayesian | Syngenta |
| Spatial variation decomposition | Gaussian Process signal decomposition | Indigo Ag |
| Yield uncertainty quantification | Posterior predictive distributions | Indigo Ag |
| Soil carbon / carbon credits | Causal measurement at scale | Indigo Ag (Indigo Carbon program) |

---

## Value Propositions for Agriculture

1. **Field trials are expensive — Bayesian makes them count more**
   Partial pooling across farm/region hierarchy extracts maximum signal from limited experimental data. No need for massive sample sizes.

2. **Spatial confounding is the #1 analysis failure in field trials**
   PyMC Labs has purpose-built spatial GP models that decompose field-level variation — isolating what the treatment did from what the field was already doing.

3. **Uncertainty is the output, not a side effect**
   Posterior distributions over treatment effects let agronomists and investors understand the range of plausible outcomes, not just a point estimate.

4. **Interpretable to agricultural audiences**
   Models communicate clearly to domain experts ("agricultural frequentists") — the evidence, the assumptions, and the uncertainty.

5. **Production deployment included**
   PyMC Labs delivers models that reach production, not just notebooks — as Manu Martinet noted at Indigo.

---

## Positioning Notes

- Agriculture is often grouped with Pharma/Biotech in internal PyMC Labs framing (Thomas, Jan 2022: "two industries: 1. marketing, 2. biotech [which includes indigo, erisyon, roche, p&g, akili]")
- Agriculture gets its own sitemap page per the new site architecture — this is a differentiating choice
- Indigo Ag is one of the original ~5 PyMC Labs clients (engagement started Sep 2020)
- Flagship Pioneering (biotech/ag fund) noted as strategic target given Indigo/Moderna connections: "there's Flagship Pioneering, a fund of biotech that would be amazing to get into — we already have connections there through Moderna (Eric) and Indigo" — Thomas, #marketing, 2022
- Syngenta also appears in pharma context (agrochemicals/crop protection is pharma-adjacent)

---

## Buyer Persona

| Persona | Pain Point | PyMC Entry Point |
|---|---|---|
| Lead Data Scientist (AgTech startup) | "I can build a model but can't get it to production or prove it works" | Custom project / Embedded Teams |
| Research Scientist (agrochemical R&D) | "I need Bayesian code review for my dose-response pipeline" | EAP / SLA coaching |
| Director of Data Science (large AgTech) | "Our field trial analyses lack rigor and our statisticians don't agree" | Strategy & Advisory + custom models |
| Sustainability / Carbon Program Lead | "We need statistically defensible impact measurement for carbon credits" | Custom Bayesian causal models |

---

## Blog Posts & Content

### Published Case Study
- **"Bayesian Modeling in Biotech: Using PyMC to Analyze Agricultural Data"**
  URL: https://www.pymc-labs.com/blog-posts/2022-08-11-indigo
  Date: 2022-08-11
  Client: Indigo Ag
  Author: Thomas Wiecki + Bill Engels (GP specialist)
  Topic: Spatial Gaussian Processes for field trial treatment effect estimation

### Tutorial Blog Post (Agriculture-adjacent)
- **"Gaussian Process Geospatial Modeling in PyMC: Beyond Hierarchical Models"**
  URL: https://www.pymc-labs.com/blog-posts/spatial-gaussian-process-01
  Date: [see blog-index.md]
  Topic: GP geospatial modeling tutorial — directly applicable to agriculture/field trial use case

---

## Web Research Enrichments (2026-03-14)

### Confirmed: Indigo Ag Blog Post & Meetup

**Blog post:** "Bayesian Modeling in Biotech: Using PyMC to Analyze Agricultural Data"
- URL confirmed: https://www.pymc-labs.com/blog-posts/2022-08-11-indigo
- Canonical quote from blog post: "PyMC Labs were consultants on this project which had limited data and which used Bayesian analyses and Gaussian processes to identify the treatment effect."
- Goal statement (from blog): "The goal of the project was to identify the underlying spatial pattern and remove it in order to measure more accurately the treatment effect."

**Associated online meetup (July 27, 2022):**
- Title: "Bayesian Modeling in Biotech: Using PyMC to Analyze Agricultural Data"
- Forum: PyMC Discourse
- URL: https://discourse.pymc.io/t/online-meetup-bayesian-modeling-in-biotech-using-pymc-to-analyze-agricultural-data-july-27-2022/9999
- Panel discussion: Why Bayesian modeling is a powerful tool for solving problems in biotechnology
- Key question addressed: **"How to effectively use Bayesian methods to substantiate product claims to regulatory bodies?"** — directly relevant to Indigo Ag's need to validate microbial product efficacy for farmers and regulators.
- Context: "Experiments are often complex, it is important to build custom and causal models that accurately represent the structure of the experiment in the statistical model — and since important decisions are made based on limited data, quantifying uncertainty at every level becomes critical."

**Business outcome (confirmed from blog):**
The methodology enabled Indigo Ag to substantiate product efficacy claims more rigorously, supporting regulatory communication and farmer adoption decisions. The Bayesian spatial GP approach isolates genuine treatment effects from field spatial confounding — a fundamental problem in agricultural field trials that frequentist methods fail to address adequately.

### Syngenta — No Public PyMC Labs Case Study Found
Web search for Syngenta + PyMC Labs did not surface any public content. Syngenta AI agriculture work is documented in non-PyMC sources. All Syngenta detail remains Discord-sourced (internal).

---

## Cross-References

- Full Indigo Ag case study narrative: `content/case-studies/indigo-ag.md` <!-- to be assembled -->
- Syngenta also in: `content/industries/pharma-biotech.md` (agrochemical/pharma crossover)
- Spatial GP capability: `content/resources/open-source-libraries.md` (PyMC GP module)
- Strategy & Advisory service (EAP model used by Syngenta): `content/services/strategy-advisory.md`
- Embedded Teams service (used by Indigo): `content/services/embedded-teams.md`
- Solution Delivery (custom models): `content/services/solution-delivery.md`
