---
page: industries/pharma-biotech
title: Pharma / BioTech Industry Page
status: complete
sources:
  - analysis/discord-case-studies-extraction.md
  - analysis/discord-marketing-extraction.md
  - analysis/discord-sales-extraction.md
  - analysis/website-scrape/home.md
  - analysis/website-scrape/case-studies.md
  - analysis/halah-draft-pricing.md
  - analysis/discord-general-extraction.md
  - content/industries/_overview.md
---

# Pharma / BioTech — Content Package

---

## Hero / Page Positioning

### Option A — Halah FAQ copy (polished, reusable)
> "We solve high-stakes problems across diverse sectors, including Pharma (clinical trials),
> Aerospace (reliability), Marketing (MMM/CLV), and Finance (risk). While our methods are
> universal, our experience spans from Fortune 500 giants to pioneering startups like SpaceX."

— Halah Joseph, #sales FAQ copy, 2026-01-16

### Option B — Rotating hero tagline (Halah Framer home draft)
**"Bayesian Intelligence for [Marketing / Finance / Pharma / Sports]"**
(JS-animated word rotation on home hero — Pharma is one of the four primary verticals)

### Option C — Thomas's founding insight
> "on a call this morning which 🤯 my mind: we basically have clients in two industries:
> 1. marketing (appodeal, GT, twitch, hellofresh, sweeplift, resident), and
> 2. biotech (indigo, erisyon, roche, p&g, akili)"

— Thomas Wiecki, #marketing, 2022-01-25

### Option D — Thomas on interpretability (paraphrased 2022-01-30)
> "biotech requires interpretability; Bayesian methods provide it naturally. Healthcare, pharma,
> and agriculture all need to explain their predictions, not just make them."

### Option E — Blog headline (Halah, 2025-11-28, unpublished)
**"Bayesian Modeling: The Missing Layer in Pharma Data Analysis"**

---

## Why Pharma/Biotech Needs Bayesian Methods

Pharma/Biotech is one of PyMC Labs' two **original industry verticals** (alongside Marketing, as documented by Thomas in Jan 2022). Key reasons Bayesian is a natural fit:

1. **Regulatory defensibility** — FDA/EMA require uncertainty quantification; credible intervals are native to Bayesian output
2. **Small sample efficiency** — "We only have 17 donors — any model has to be extremely sample-efficient" (Takeda, 2023)
3. **Interpretability** — biotech and pharma need to explain predictions to regulators and clinicians
4. **Clinical trial modeling** — hierarchical designs, dose-response curves, adaptive trial analysis
5. **Manufacturing process optimization** — digital twins, real-time prediction with partial data
6. **Digital therapeutics** — Bayesian cognitive modeling for FDA-cleared therapeutic software

---

## Use Cases

### Clinical Trial Analysis
- Clinical trial modeling with hierarchical Bayesian designs
- Dose-response / pharmacokinetic / pharmacodynamic (PK/PD) modeling
- Patient outcome modeling with longitudinal data
- Biomarker and treatment effect estimation
- Regulatory-defensible uncertainty quantification

### Drug Manufacturing & Digital Twins
- Cell therapy manufacturing process modeling (cell viability, expansion, CQA tracking)
- Real-time prediction from early-stage measurements (e.g., day 6 → day 28 outcome)
- Manufacturing input optimization (seeding density, bioreactor parameters)
- Stage-by-stage Bayesian state space models

### Genomics / Large-Scale Bio Data
- Large-scale hierarchical Bayesian models (validated at 34K parameters, 250K observations)
- GPU-accelerated inference via JAX/NumPyro for genomic datasets
- ~1 hour inference on datasets that would take days with standard samplers

### Digital Therapeutics & Cognitive Modeling
- Ordinal regression for clinical assessment instruments (Likert / IRT data)
- Bayesian psychometric modeling for cognitive constructs
- Latent variable modeling for digital biomarkers from gameplay data
- Longitudinal outcome tracking across patient cohorts

### Protein Sequencing / Life Sciences
- Bayesian Hidden Markov Models for fluorescence signal decoding
- Protein identification with credible intervals
- Custom JAX likelihoods for high-throughput proteomics data

### Statistical Consulting & Code Review
- Probabilistic pipeline review for internal modeling teams
- XC50 assay modeling (dose-response, relative potency)
- Hierarchical GLM binomial models for agricultural/pharma assay data
- Deployment review for production environments (Databricks, Dataiku DSS)

---

## Named Clients

### Roche — Pharmaceutical/Biotech (Switzerland)
**Engagement:** Custom large-scale hierarchical Bayesian model — clinical/genomic data
**Status:** Completed. One of PyMC Labs' first major clients (2020).

**Problem:** Needed Bayesian models for analyzing extremely large genomic or clinical trial datasets — 250K observations, ~34K parameters — requiring GPU-accelerated inference to be tractable.

**Technical Approach:**
- Hierarchical Bayesian model with ~34K parameters on 250K observations
- JAX/NumPyro sampling (`sample_numpyro_nuts`) for GPU-accelerated inference
- Non-centered parameterization throughout for sampling efficiency
- ArviZ for posterior predictive checks and diagnostics

**Results:**
- Successfully fit 34K-parameter model on 250K observations in just over 1 hour
- "It's really amazing that we fit a model with 34K parameters, on 250K observations in just over 1 hour" — PyMC Labs team
- "The JAX backend is what makes this possible — pure NUTS on CPU would have taken days"

**Team:** Thomas, Maxim, Adrian, Niall

**Origin quote (Thomas, 2020-12-04):**
> "Roche and Indigo projects going super well with great customer feedback so far, roche already
> talking about extending to next projects."

**Follow-up (Thomas, 2020-12-14):**
> "really good news: we just did the second half of the presentation for Roche and it went super
> well... we'll talk about follow-up projects (which I think are very likely) in January."

**Client feedback (Eoin, Roche team, 2021-06-04):**
> "At a first glance, wow, a great amount has been covered in this short time and great to have
> this so well documented - really impressive."

---

### Takeda — Pharmaceutical / Cell Therapy Manufacturing (Japan)
**Engagement:** Bayesian "digital twin" for CAR-NK cell therapy manufacturing — ~15 months (April 2023 – September 2024)
**Status:** SOW 1 completed. Relationship warm.

**Product context:** TAK-007 and TAK-808 — CAR-NK cell therapy products for cancer treatment.

**Problem:** Needed Bayesian models for a ~28-day cell manufacturing pipeline:
- Model each stage (cell viability, expansion, quality attributes / CQAs)
- Enable real-time prediction: given day-6 measurements, predict final product quality at day 28
- Optimize manufacturing inputs (seeding density, bioreactor parameters) to maximize yield
- Sample-efficiency constraint: only 17 donors in dataset

**Technical Approach:**
- Stage-by-stage Bayesian state space model
- State = `{total_counts, viable_counts, CD45}` (from flow cytometry measurements)
- Hierarchical donor-level model (individual differences in growth rates)
- LogNormal likelihood for cell counts (positive, right-skewed)
- Non-centered parameterization throughout
- JAX/NumPyro sampling for performance: "MCMC sampling with numpyro or blackjax is definitely better than using the builtin pymc NUTS sampler" — Eric Ma
- Importance sampling for real-time prediction from existing MCMC samples
- MLflow integration for experiment tracking; deployed on Databricks
- Three prediction modes: retrospective (full GMP data) / real-time (partial conditioning) / planning (`naive .predict()`)

**Key technical challenge:** SequentialGraphRewriter performance issue at scale (2M node graph, 2848 seconds) — resolved with PyTensor team guidance.

**Results:**
- TAK-007 stage model delivered
- TAK-808 stage model completed June 2024; Junpeng: "TAK808 marked complete - i think this is a good milestone"
- Predictive engine framework: pre-day-6 model + full 28-day process framework
- MLflow deployment documentation for Databricks written
- Eric Ma on relationship: "we've done a great job collectively building goodwill... I think the future of this SOW is brighter"

**Key Quotes:**
- Eric Ma: "The ability to condition on full GMP data allows for retrospective comparisons; partial conditioning is useful for real-time following of the experiment live, and naive `.predict()` for future-looking planning"

**Team:** Eric Ma (PM/account lead), Maxim, Adrian, Virgile, Junpeng, Aziz, Thomas (advisor)

<!-- GAP: No published case study for Takeda. SOW 1 completed Sep 2024 — follow-on status not confirmed -->

---

### Akili Interactive — Digital Therapeutics / FDA-Cleared Software (Boston, MA)
**Engagement:** Bayesian psychometric/clinical assessment modeling — multi-SOW (2023–2024)
**Status:** Completed. Published case study: https://www.pymc-labs.com/blog-posts/2023-01-12-Akili
**Client contact:** Titi Alailima, MSE, VP of Applied Data

**Product context:** EndeavorRx — first FDA-approved prescription video game for ADHD treatment.

**Problem:** Needed Bayesian models to:
1. Score cognitive assessment instruments from ordinal/Likert clinical data (not continuous)
2. Validate digital biomarkers derived from gameplay
3. Track patient outcomes over treatment courses with credible intervals

**Technical Approach:**
- Ordinal regression with cutpoints — modeling Likert-scale and ordinal clinical assessment data
- Item Response Theory (IRT) style modeling in PyMC
- Hierarchical models across patients, assessors, time points
- Latent variable modeling for cognitive constructs
- Bayesian mixed-effects models for longitudinal treatment outcomes
- Prior predictive checks for clinical plausibility
- ZeroSumNormal for identifiability

**Results:**
- Validated Bayesian scoring pipeline for clinical assessments
- Credible intervals on cognitive improvement metrics
- Models used for clinical trial analysis
- "What's powerful about the Bayesian approach is that we get uncertainty on the latent cognitive score, not just a point estimate"

**Team:** Eric Ma (lead), Maxim, Thomas, Virgile, Adrian

**Homepage Testimonial (Titi Alailima, VP of Applied Data, Akili):**
> "We wanted to be able to draw some big conclusions out of a big set of data. So, that's why
> we came to PyMC Labs for help. It was very successful collaboration. I've had many, many
> consultants working with in the past, and I think this is by far the most successful
> Collaboration that I've seen."

— Titi Alailima, MSE, VP of Applied Data, Akili Interactive
(source: https://www.pymc-labs.com/, scraped 2026-03-13)

---

### Erisyon — Biotech / Proteomics / Life Sciences
**Engagement:** Bayesian protein sequencing — custom project (2021)
**Status:** Completed.

**Company context:** Erisyon — single-molecule protein sequencing startup (now acquired / pivoted).

**Problem:** Decode protein sequences from noisy fluorescence signals:
- Handle high dimensionality (many possible peptides/proteins)
- Quantify uncertainty in protein identification
- Computationally tractable for high-throughput data

**Technical Approach:**
- Bayesian Hidden Markov Model (HMM) with custom JAX likelihood for fluorescence signal decoding
- State space model over protein sequence observations
- Custom JAX-based likelihood function integrated into PyMC via `pm.Potential`
- NUTS sampling with JAX backend (`sample_numpyro_nuts`)
- Extensive prior predictive checking to validate signal model
- Vectorized implementation for throughput

**Results:**
- Working Bayesian protein identification pipeline
- Custom JAX HMM likelihood achieved significant speedup vs. pure PyMC
- Credible intervals on protein identification probabilities
- "The JAX likelihood is the key — the standard PyMC approach would be too slow for the dimensionality of the protein identification problem"
- Adrian: "The trick is writing the forward algorithm for the HMM in JAX and plugging it in as a custom Op"

**Team:** Adrian (lead), Maxim, Thomas

**Client CEO reaction at pitch (Thomas, 2021-05-27):**
> "this. was. awesome!!! with Adrian and Eric we just got off the Erysion pitch...
> when I took over the last part of the presentation I first talked about why we are the
> perfect fit, which was cut short by the CEO saying 'we're already buying, you don't need
> to sell us', then on to the final budget slide 'this might be higher than what you were
> expect...' -- CEO: 'we'll take it, what I want to know is how we can lock you in for 6-12 months'"

**One-year anniversary testimonial (Thomas, 2021-08-26):**
> "Erisyon ('we couldn't have done in a year what you did in a month')"

---

### Haleon — Consumer Healthcare / Pharma (Sensodyne, Panadol, Voltaren brands)
**Parent:** Spinoff from GlaxoSmithKline (GSK)
**Engagement:** Bayesian code review SLA + coaching (EAP ongoing)
**Status:** SOW 1 completed Jan/Feb 2025. EAP engagement active.
**Client contacts:** Nathan Kafi (Principal Data Scientist), Chris

**Problem:** Haleon's internal Bayesian modeling team was building hierarchical models but needed:
1. Code audit and architectural review
2. Technical guidance on missing values in hierarchical models with unbalanced panel data
3. GPU acceleration advice for Databricks (JAX/NumPyro sampler setup)

**Technical Approach:**
- SLA/coaching format: PyMC Labs reviews Haleon's own code and provides expert feedback
- Hierarchical model review and optimization
- JAX/NumPyro sampler configuration on Databricks

**Results:**
- Juan Orduz (end of SOW): "I think this one is over. They might contact us later in the year"
- "They invited me to an internal call next week where they will present the work they have done with us... this can open other projects with haleon (other business units)"
- Juan: "Presenting PyMC Labs to the whole Haleon analytics team"
- "The client seems very happy with the help, tips and collaboration"
- Internal Haleon team presentation delivered; potential follow-up with other business units
- EAP engagement active at $8,500/month (with $1,000 discount offered)

**Team:** Juan Orduz (researcher/lead), Oriol, Adrian, Thomas

**Homepage Testimonial (Nathan Kafi, Principal Data Scientist, Haleon):**
> "PyMC Labs has significantly enhanced our testing capabilities by leveraging the full power
> of Bayesian programming, maximizing the potential of the PyMC software. Their advisory role
> in delivering new feature requests and training our team has been invaluable, driving
> substantial improvements in our operations."

— Nathan Kafi, Principal Data Scientist, Haleon
(source: https://www.pymc-labs.com/, scraped 2026-03-13)

**Internal signal (Niall, #sales, 2025-11-24):**
> "Part of me thinks that we probably have a network of EAPs where they have a good in-house
> model but struggling to scale it. e.g Haleon is one we know for sure"

---

### Syngenta — Agrochemical / Crop Protection Research (Pharma-adjacent)
**Engagement:** Bayesian statistical consulting / code review SLA — SOW 1 (completed March 2025) + SOW 2 (completed December 2025)
**Status:** Completed. Channel archived.
**Client contact:** Guillaume (lead modeler at Syngenta)

**Problem:** Syngenta's Crop Protection Research team needed expert review of their probabilistic pipeline:
- XC50 assay modeling (chemical potency measurement)
- Relative potency models
- Hierarchical GLM binomial models for desirability functions
- Deployment review for Dataiku DSS environment
- Scale: every XC50 assay across Syngenta global operations

**Technical Approach:**
- SLA/coaching: PyMC Labs reviews Syngenta's own models
- Binomial GLM models for dose-response data
- Hierarchical Bayesian models for relative potencies
- Zero-inflated models explored for assay data
- Code architecture review for Dataiku DSS production deployment

**Results:**
- Virgile: "Guillaume's last model is great, I would be hard pressed to find a critique"
- Eric Ma: "The feedback has been overwhelmingly positive, mostly thanks to your technical review"
- Thomas: "niiiice! that's the best feedback you can get"
- SOW 2 delivered December 2025

**Team:** Eric Ma (account lead), Virgile (lead SOW 1), Junpeng (SOW 2), Thomas

---

### IQVIA — Contract Research Organization / Pharma Services
**Engagement:** Corporate workshop
**Status:** Past workshop client (referenced in training materials)
**Source:** analysis/discord-courses-workshops-extraction.md (corporate workshop past client list)

<!-- GAP: No detail on IQVIA workshop scope, date, curriculum, or outcome -->

---

## Targeted / Inbound Prospects

| Company | Type | Status | Notes |
|---------|------|--------|-------|
| Novartis | Pharma (CH) | Inbound target | Thomas has connections through Moderna network |
| Takeda | Pharma (JP) | Multiple contacts | Active leads documented in #inbound-leads |

---

## Testimonials (Ready to Use)

### Tier 1 — Homepage Featured

**Titi Alailima, MSE, VP of Applied Data, Akili Interactive:**
> "We wanted to be able to draw some big conclusions out of a big set of data. So, that's why
> we came to PyMC Labs for help. It was very successful collaboration. I've had many, many
> consultants working with in the past, and I think this is by far the most successful
> Collaboration that I've seen."

**Nathan Kafi, Principal Data Scientist, Haleon:**
> "PyMC Labs has significantly enhanced our testing capabilities by leveraging the full power
> of Bayesian programming, maximizing the potential of the PyMC software. Their advisory role
> in delivering new feature requests and training our team has been invaluable, driving
> substantial improvements in our operations."

### Tier 2 — Industry Page / Case Study

**Erisyon CEO (at sales pitch, Thomas paraphrasing, 2021-05-27):**
> "we're already buying, you don't need to sell us"

**Erisyon (post-delivery, Thomas, 2021-08-26):**
> "we couldn't have done in a year what you did in a month"

**Eoin, Roche team (2021-06-04):**
> "At a first glance, wow, a great amount has been covered in this short time and great to have
> this so well documented - really impressive."

---

## Social Proof / Stats for Pharma Page

- 34,000 parameters, 250,000 observations — Roche engagement, ~1 hour inference (JAX/GPU)
- FDA-approved digital therapeutic (EndeavorRx) modeled — Akili case study
- CAR-NK cell therapy digital twin delivered — Takeda (15-month engagement)
- EAP engagement at Haleon: full-team analytics presentation + multi-business-unit expansion potential
- Erisyon: "we couldn't have done in a year what you did in a month"
- Early clients include SpaceX, Roche, Netflix, Deliveroo, HelloFresh (from origin story page)

---

## Competitive Positioning for Pharma

### Vs. Traditional consulting (Accenture, McKinsey, etc.)
- PyMC Labs builds production-grade models; consulting firms advise
- Halah's "builders not advisors" framing applies
- "We Work By Your Side" — embedded teams co-deliver with pharma data scientists

### Why Bayesian over ML for pharma
- Uncertainty quantification is native (required for FDA/EMA submissions)
- Small-n performance: Bayesian hierarchical models work with 17 donors (Takeda)
- Interpretable to regulators, clinicians, and executives
- Prior knowledge can be formally incorporated (clinical prior beliefs)
- Thomas: "our competition is intuitive-based human decision making and Excel spreadsheets" — the pharma version is: incumbent stats consultants using frequentist methods with no uncertainty

### Speed claim (JAX/GPU)
- Roche: 34K params / 250K obs in ~1 hour ("pure NUTS on CPU would have taken days")
- Takeda: "fitting is pretty fast" after JAX sampling fix
- Erisyon: custom JAX HMM "significant speedup vs. pure PyMC implementation"

---

## Engagement Model for Pharma

### Expert Access Program (EAP)
- Base rate: $5,000–$8,500/month
- Haleon example: $8,500/month (with $1,000 discount offered)
- Includes coaching hours, code review, architecture guidance
- Hands-on code work billed separately at $385/hour
- Haleon use case: in-house modeling team "struggling to scale"

### Custom Project / SOW
- Roche: large-scale hierarchical modeling — flat fee, ~$50K–$500K range
- Takeda: ~15-month SOW (April 2023 – September 2024)
- Erisyon: custom biotech project — exact value not documented
- Thomas's principle: "a 5-figure project minimum makes sense for bespoke work"

### Corporate Workshops
- IQVIA: confirmed past workshop client
- P&G: confirmed workshop client (referenced in training/enablement docs)
- ~$20–30k/engagement (confirmed by Thomas)

### Pricing reference (from finance/insurance comparable):
- Scoping projects in pharma likely in €40,000–€70,000 range (banking reference; pharma similar)

---

## Team Pharma Expertise

### Eric Ma — primary pharma/biotech account lead
- Background: Novartis / Moderna
- Led Takeda (15-month cell therapy engagement), Akili, Erisyon, Syngenta
- Quote context: "Eric just did the Gates Foundation final presentation and knocked it out of the park"

### Thomas Wiecki — scientific lead, connections
- Akili is Thomas's original PhD lab connection (Michael Frank at Brown / Alex Fengler)
- Led Roche, advisory on Takeda, Akili, Erisyon
- Thomas on cell therapy problem: "stream blood | filter cells we want to manipulate | manipulate | count successful samples"

### Juan Orduz — Haleon engagement lead
- Led Bayesian code review for Haleon
- Presented PyMC Labs to Haleon's full analytics team

### Adrian — technical lead for biotech
- Erisyon JAX HMM implementation
- Roche: sampling configuration
- Haleon: GPU acceleration advice (Databricks)

---

## Blog Posts & Content Assets

### Published Case Studies (blog posts)
1. **Akili Interactive** — https://www.pymc-labs.com/blog-posts/2023-01-12-Akili
   - Cognitive modeling, digital therapeutics, ordinal regression, clinical trial analysis

<!-- GAP: No Roche public case study -->
<!-- GAP: No Takeda public case study -->
<!-- GAP: No Erisyon public case study -->
<!-- GAP: No Haleon public case study -->

### Unpublished Blog Headline (Halah, 2025-11-28)
- "Bayesian Modeling: The Missing Layer in Pharma Data Analysis" — drafted but not published

### Related Published Posts
- Colgate synthetic consumers (90% correlation with human surveys) — adjacent to pharma/consumer health R&D
- "From Uncertainty to Insight" — general value prop piece applicable to pharma

---

## Summary Client Table

| Client | Type | Problem | Key Result | Status |
|--------|------|---------|------------|--------|
| **Roche** | Pharma (CH) | Large-scale genomic/clinical Bayesian model | 34K params / 250K obs / ~1hr inference | Completed 2021+ |
| **Takeda** | Pharma / Cell Therapy (JP) | CAR-NK manufacturing digital twin | Full 28-day pipeline modeled, real-time prediction | SOW 1 completed Sep 2024 |
| **Akili Interactive** | Digital Therapeutics (US) | Clinical cognitive assessment scoring | FDA-cleared product; "most successful collaboration I've seen" | Completed 2023–2024 |
| **Erisyon** | Biotech / Proteomics (US) | Protein sequence decoding from fluorescence | "Couldn't have done in a year what you did in a month" | Completed 2021 |
| **Haleon** | Consumer Healthcare (UK) | Hierarchical model scaling + GPU acceleration | Full analytics team presentation; EAP ongoing | Active EAP |
| **Syngenta** | Agrochemical / Research (CH) | XC50 assay + dose-response pipeline | "I would be hard pressed to find a critique" | SOW 2 completed Dec 2025 |
| **IQVIA** | CRO / Pharma Services | Corporate workshop | — | Past workshop client |

---

## Cross-References

- `content/services/strategy-advisory.md` — EAP model, Haleon testimonial
- `content/services/embedded-teams.md` — Haleon engagement model
- `content/services/training-enablement.md` — IQVIA corporate workshop, P&G workshop
- `content/services/solution-delivery.md` — Roche (34K params), Takeda digital twin
- `content/about/team-members/eric-ma.md` — Novartis/Moderna background, pharma lead
- `content/industries/agriculture.md` — Syngenta overlaps; Indigo Ag in same original biotech vertical

<!-- GAP: Need published Roche or Takeda case study for full pharma narrative -->
<!-- GAP: Takeda follow-on / SOW 2 status unknown (warm relationship) -->
<!-- GAP: Novartis / additional inbound pharma conversion rates not documented -->
<!-- GAP: P&G workshop content not fully captured (referenced in training) -->
