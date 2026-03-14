---
page: services/training-enablement
title: Training & Enablement
status: complete
sources:
  - analysis/website-scrape/services.md
  - analysis/website-scrape/courses.md
  - analysis/halah-draft-scrape.md
  - analysis/halah-draft-pricing.md
  - analysis/discord-courses-workshops-extraction.md
  - analysis/course-ai-assisted.md
  - analysis/discord-sales-extraction.md
  - analysis/discord-marketing-extraction.md
---

# Training & Enablement — PyMC Labs

## Page Purpose

Training & Enablement is the "We Teach" pillar. It covers all engagements where PyMC Labs transfers Bayesian modeling knowledge — open-enrollment cohort courses, custom corporate workshops, and in-person team intensives. The page should surface both the open courses (ABM/BMA/CI) and the corporate/custom workshop offering, plus the upcoming Agentic Data Science course.

---

## Hero Section

### Option A (Halah draft, home teaser)
**Headline:** Training & Workshops
**Subhead:** "Practical, hands-on sessions to equip your team with advanced Bayesian and probabilistic modeling skills."

### Option B (Halah draft, services page)
**Headline:** Training & Workshops
**Description:** "Hands-on training in Bayesian statistics and probabilistic modeling, empowering individuals and teams to tackle real-world business challenges with confidence."

### Option C (Current website, home page)
**Headline:** Courses & Speaking
**Description:** "Empower your teams with hands-on training and expert-led courses in Probabilistic AI modeling, AI, and advanced analytics, all tailored to real-world business challenges."

### Option D (Halah FAQ — strongest value prop statement)
**Body copy:**
> "Unlike generic courses, our workshops are custom-built for your team. We use your industry-specific data and real-world business problems to ensure your data scientists gain practical, immediately applicable Bayesian skills."

<!-- GAP: No dedicated hero headline written specifically for "Training & Enablement" as a service — Halah still calls it "Training & Workshops" -->

---

## Feature Bullets (from Halah draft services page)

- **Custom Programs:** Tailored to your team's needs and expertise level.
- **Hands-On Learning:** Work with real data and real business problems.
- **Expert Guidance:** Led by PyMC core contributors and Bayesian specialists.

---

## Two Delivery Modes

### 1. Open-Enrollment Cohort Courses

Live online cohorts, taught by PyMC Labs practitioners. Small cohort sizes (~17–22 participants). 8 sessions × 2 hours = 16 hours of instruction. Private GitHub repo, Discord Q&A, certificate on completion.

**Active courses:**

| Course | Price | Level | Primary Tool(s) |
|--------|-------|-------|-----------------|
| Applied Bayesian Modeling (ABM) | $1,499 | Foundational–Advanced | PyMC |
| Bayesian Marketing Analytics (BMA) | $2,249 | Intermediate–Advanced | PyMC-Marketing, CausalPy |
| Applied Bayesian Regression Modeling (ABRM / CI) | $1,499 | Intermediate | Bambi, PyMC, CausalPy |
| Applied Causal Inference for Business Impact | ~$2,249 (proposed) | Advanced | PyMC, Bambi, CausalPy |
| Agentic Data Science *(hidden, May 2026)* | $1,900 | Advanced | LLMs + Bayesian AI |

### 2. Custom Corporate Workshops

Tailored private sessions for enterprise teams. Delivered in-person or online.

- **Pricing:** ~$20,000–$30,000 per engagement (confirmed by Thomas Wiecki, #casual-inference, 2026-03-11)
- **Length:** Typically 2 days / 8–24 hours total
- **Content:** Customized to client stack, data, and business problems
- **Past clients:** SIXT, Keywords Studios, Schwab, HelloFresh, Gain Theory, Vinted, IQVIA, Progressive Insurance, P&G, Wärtsilä

---

## Course Detail: Applied Bayesian Modeling (ABM)

**URL:** https://www.pymc-labs.com/courses/applied-bayesian-modeling/
**Price:** $1,499 (was $1,699)
**Format:** 8 sessions × 2h = 16 hours, Mon/Wed, 11am–1pm ET
**GitHub:** https://github.com/pymc-labs/pymc-workshop
**Status:** Waitlist (next cohort TBD after Jan 2026)

### Target Audience
"Ideal for software engineers, data analysts, and data scientists who want to move beyond black-box models" and build interpretable Bayesian solutions.

### Prerequisites
- Basic Python + NumPy; Jupyter Notebooks; no prior Bayesian experience required

### Curriculum (Jan 2026 cohort, from live site)

| Session | Topic | Instructor |
|---------|-------|-----------|
| 1 | Intro to Bayesian modeling and PyMC | Allen Downey |
| 2 | Priors and Likelihood Choices | Vianey Leos Barajas |
| 3 | Building Models in PyMC | Chris Fonnesbeck |
| 4 | Bayesian Regression | Vianey Leos Barajas |
| 5 | Hierarchical Models | Chris Fonnesbeck |
| 6 | MCMC | Vianey Leos Barajas |
| 7 | Causal Inference Models | Chris Fonnesbeck |
| 8 | Time Series Models | Allen Downey |

### Learning Outcomes
- Build and interpret Bayesian models to solve real-world problems
- Run and diagnose MCMC workflows for reliable, interpretable results
- Apply PyMC to model uncertainty and understand complex systems
- Debug and scale models for practical applications

### Instructors

**Chris Fonnesbeck** — Principal Quantitative Analyst, PyMC Labs; Adjoint Associate Professor, Vanderbilt University Medical Center; 20 years experience; Ph.D. University of Georgia.

**Allen Downey** — Principal Data Scientist, PyMC Labs; Professor Emeritus, Olin College; author of *Think Python*, *Think Bayes*, and *Probably Overthinking It*.

**Vianey Leos Barajas** — Assistant Professor, University of Toronto (Statistical Sciences + School of the Environment); specializes in ecological statistics, time series modeling, Bayesian methods.

### Testimonials / Social Proof
- "This is busy breaking my brain" — participant, Oct 2025 ABM cohort
- "This has been great!" — kyle, Oct 2025 ABM cohort
- "Thank you for another great session! I'm curious about hierarchical approaches to time-series models." — Chris Hires, Oct 2025
- "Do you know about this [PyMC do function]? Uhhh yeah time to rewrite some of my projects" — BrentRoth, Oct 2025 (shows practical learning impact)
- Chris Fonnesbeck: "We probably need to introduce an advanced course someday!" — responding to advanced learner questions, Oct 2025

### FAQs (from live site)
- **Will MMMs be covered?** No, but foundational tools for Bayesian MMM will be taught.
- **Can I miss sessions?** Yes; recordings available throughout, Discord for instructor support.
- **Refund?** Full refund if cancelled 7+ days before start; 14-day withdrawal right.
- **Outside time commitment?** Notebooks + Discord available between sessions for practice.

---

## Course Detail: Bayesian Marketing Analytics (BMA)

**URL:** https://www.pymc-labs.com/courses/bayesian-marketing-analytics/
**Price:** $2,249 (was $2,499)
**Format:** 8 sessions × 2h = 16 hours, Mon/Wed, 3–5pm EST
**GitHub:** https://github.com/pymc-labs/bayesian-marketing-analytics-course
**Status:** Waitlist (next cohort TBD after Feb 2026)

### Target Audience
Data scientists and analysts with marketing experience who work directly with marketing teams, seeking "domain-specific modeling frameworks to real-world marketing challenges."

### Prerequisites
- Intermediate Python; linear regression familiarity; basic probability; marketing domain knowledge

### Curriculum (Feb 2026 cohort, from live site)

| Session | Topic | Instructor(s) |
|---------|-------|--------------|
| 1 | Introduction to Marketing Analytics | Timothy McWilliams |
| 2 | MMM Fundamentals | Timothy McWilliams |
| 3 | Hierarchical & Advanced Modeling Methods for MMMs | McWilliams + Carlos Trujillo |
| 4 | Optimization and Scenario Planning | McWilliams + Trujillo |
| 5 | Calibrating MMMs with quasi-experiments: CausalPy & PyMC Marketing | McWilliams + Ben Vincent |
| 6 | Customer Lifetime Value: BG/NBD models | McWilliams + Colt Allen |
| 7 | Capturing Product Adoption with Bass Diffusion Models | McWilliams + Colt Allen |
| 8 | Customer Choice Modeling: Multivariate ITS + Discrete Choice | Timothy McWilliams |

### Learning Outcomes
1. **Understand the marketing measurement ecosystem** — MMM, quasi-experiments, CLV, customer choice, adoption models, causal designs
2. **Build probabilistic models** — MMMs, causal inference designs, CLV, customer choice, diffusion models using PyMC-Marketing and CausalPy
3. **Convert outputs to decisions** — propagate uncertainty, simulate scenarios, evaluate channel efficiency
4. **Operationalize measurement** — refresh workflows, experiment planning, data governance, stakeholder communication

### Instructors

**Timothy McWilliams** — Lead instructor; 7+ years MMM/Bayesian analytics; specializes in applying statistical methods to optimize media investments across diverse industries.

**Colt Allen** — Principal Data Scientist, PyMC Labs; 10+ years across marketing analytics, renewable energy, logistics, manufacturing; lead CLV developer for PyMC-Marketing; MS Mineral & Energy Economics, BS Industrial Engineering; INFORMS CAP.

**Ben Vincent** (DPhil) — Principal Data Scientist, PyMC Labs; 15+ years in academia; core contributor to CausalPy; "focuses on making rigorous inference accessible in practical contexts."

**Carlos Trujillo** — Marketing Scientist, PyMC Labs; experience across Latin America, Europe, Africa; previously at Wise, Bolt, Omnicom Media Group; core contributor to PyMC-Marketing.

### Testimonials / Social Proof
- 77.7% rated experience Good or Excellent (post-course survey, Feb 2026 cohort, 9 respondents)
- "Carlos, I found your explanation of SLSQP vs. BO vs. GA really clarifying." — Mark Nguyen, #bayesian-mktg-analytics-feb-2026
- "Thank you Ben! Very thorough answer!" — Jie Gao, Feb 2026 cohort, 2026-03-03

### FAQs (from live site)
- **Registration:** Payment confirmation immediately; welcome email with materials within 2 business days.
- **Live attendance required?** No; recordings + Discord support available.
- **Invoice?** Contact [email protected] with purchaser name, billing address, tax ID.
- **Team rates?** Contact [email protected] for group pricing; customized corporate courses available.
- **Refund?** Full if cancelled 7+ days before start; 14-day withdrawal right.

---

## Course Detail: Applied Bayesian Regression Modeling (ABRM / "CI Course")

**URL:** https://www.pymc-labs.com/courses/applied-bayesian-regression-modeling/
**Price:** $1,499 (was $1,699)
**Format:** 8 sessions × 2h = 16 hours, Mon/Wed, 3–5pm EST
**Status:** Waitlist (March 2026 cohort cancelled — 2 registrations only; next cohort TBD)

### Description
Bridges statistical foundations to real-world practice. Using Bambi and PyMC, participants "build hierarchical, Gaussian process, and causal models and translate outputs into practical, decision-ready insights."

### Curriculum

| Session | Topic | Instructor(s) |
|---------|-------|--------------|
| 1 | Introduction to Regression Modeling | Juan Orduz |
| 2 | Introduction to Bambi | Ben Vincent + Juan Orduz |
| 3 | Model Interpretation and Communication | Juan Orduz |
| 4 | Hierarchical Models | Ben Vincent + Nathaniel Forde |
| 5 | Gaussian Processes and Splines | Juan Orduz |
| 6 | Multilevel Regression and Post-stratification (MRP) | Orduz + Forde |
| 7 | Causal Inference | Ben Vincent |
| 8 | Survival Analysis | Nathaniel Forde |

### Learning Outcomes
- Specify, fit, and evaluate Bayesian regression models using Bambi
- Translate posterior outputs into actionable insights
- Apply hierarchical modeling to real-world problems (e.g., price elasticity)
- Model complex relationships using splines and Gaussian processes
- Use regression for causal inference and Bayesian survival analysis

### Instructors

**Juan Orduz** — Mathematician, Ph.D. Humboldt Universität zu Berlin; 9+ years industry experience; specializes in time series analysis, Bayesian methods, causal inference.

**Ben Vincent** (DPhil) — Principal Data Scientist, PyMC Labs; core contributor to CausalPy; 15+ years in academia.

**Nathaniel Forde** — Data Scientist; 10+ years delivering ML products in high-growth tech and regulated industries; open-source contributor to PyMC, Bambi, CausalPy.

---

## Upcoming Course: Applied Causal Inference for Business Impact

**Status:** In development as of March 2026
**Proposed price:** $2,249 (early bird: $1,999)
**Planned dates:** May–June 2026 (may defer post-Agentic DS course conflict)
**GitHub:** https://github.com/pymc-labs/causal-inference-workshop (private)
**Lead:** Ben Vincent (DPhil)

### Differentiator
> "No existing course combines business-problem-first organisation, modern Bayesian tools (Bambi, CausalPy, PyMC), and comprehensive coverage across experiments, quasi-experiments, and observational methods."
> — Ben Vincent, #casual-inference, 2026-02-17

> "I like that the section names are not tied to methods (like: linear regression), but to business scenarios (like: Price Elasticity and Revenue Optimization)"
> — Juan Orduz, 2026-03-12

### Market Analysis (Ben Vincent)
- Novelty: 8/10; Likely interest: 9/10; Pricing power: 8/10
- Gap: "business-focused, decision-oriented approach has high novelty and strong market differentiation"

### Tools
PyMC, Bambi, CausalPy, DAG-based analysis

### Instructors (confirmed)
- Ben Vincent (primary architect)
- Juan Orduz ("Im in")
- Nathaniel Forde (limited capacity)

---

## Upcoming Course: Agentic Data Science *(Hidden — not yet in nav)*

**URL:** https://www.pymc-labs.com/courses/agentic-ai-data-science
**Price:** $1,900
**Format:** 4 sessions × 3h = 12 hours, May 12–21, 2026
**Cap:** 20 participants
**Co-brand:** PyMC Labs × Vanishing Gradients (Hugo Bowne-Anderson)

### Tagline
"the framework for going from raw data to real decisions at 10× speed"

### Instructors
- **Hugo Bowne-Anderson** (The Educator) — Vanishing Gradients, formerly DataCamp
- **Thomas Wiecki** (The Scientist) — PyMC Labs CEO/co-founder
- **Luca Fiaschi** (The Strategist) — PyMC Labs Partner

### Dual-track curriculum
- **Data Science ladder:** Descriptive → Bayesian reasoning
- **Agent Skills:** Spec-driven development, adversarial QA, orchestration

<!-- GAP: Full session-by-session curriculum not yet public — awaiting course announcement -->

---

## Custom Corporate Workshops

### Value Proposition (from Halah FAQ)
> "Unlike generic courses, our workshops are custom-built for your team. We use your industry-specific data and real-world business problems to ensure your data scientists gain practical, immediately applicable Bayesian skills."

### Pricing
- ~$20,000–$30,000 per engagement (Thomas Wiecki confirmed, #casual-inference, 2026-03-11)
- Ben Vincent's market analysis suggested $42K–$75K for multi-day strategic enablement packages — Thomas called the $40-70k estimate an overestimate
- London in-person public workshop: ~$3k/person

### Format Options
- 1-day intensives
- 2-day deep dives (e.g., SIXT 2-day, 8h total)
- Multi-day extended (e.g., Keywords Studios 24h, 8 sessions)
- In-person available (e.g., WeWork Shoreditch, London, June 8-10 2026)

### Recent Corporate Workshop Clients
| Client | Details |
|--------|---------|
| SIXT | 2-day workshop, Jan–Feb 2026; instructors: Teemu Säilynoja, Oriol Abril Pla, Juan Orduz |
| Keywords Studios | 24h / 8 sessions, gaming company, March 2026 |
| Schwab (Charles Schwab) | 437 msgs, 2025–2026 |
| HelloFresh | Early workshop 2021 |
| Gain Theory | MMM workshop, 2022 |
| Vinted | 2022 |
| IQVIA | Pharma CRO, 2023 |
| Progressive Insurance | 2023 |
| P&G | Jun 2022 (7–10 June) |
| Wärtsilä | ~20k EUR offer negotiated, 2022 |

### Contact
Email [email protected] for group pricing; team rates available; beginner/intermediate/advanced levels.

---

## Shared Format / Logistics (All Cohort Courses)

From live website — all courses share these logistics:
- 4 weeks, 8 live sessions (2 × 2h per week) = 16 hours total instruction
- Online via Google Meet
- Private GitHub repo; 8-week post-course access
- Discord access to instructors between sessions
- Certificate of completion (shareable on LinkedIn)
- Optional pre-course install session (2h)
- Refund: full if cancelled 7+ days before start; 14-day withdrawal right from registration
- Tools: pixi for environment setup (faster than conda/mamba); Google Colab fallback for Windows users

---

## Alumni Program

- **workshop-alumni** Discord channel created September 2025
- Participants from ABM cohorts migrate here after course completion
- Purpose: ongoing community, networking, continued learning

---

## Social Proof / Statistics

- 77.7% of Feb 2026 BMA participants rated experience "Good or Excellent"
- 22 participants in Feb 2026 BMA cohort; 17 in Jan 2026 ABM cohort
- Cohorts completed: ABM (Aug 2025, Oct 2025, Jan 2026), BMA (Feb 2026)
- Corporate workshops delivered to 10+ companies historically

---

## Client Case Studies (Training & Enablement as Primary Service)

These case studies represent engagements where training, coaching, or upskilling was the primary deliverable:

### L.L. Bean — In-House MMM Capability via SLA Coaching
**Service:** SLA coaching (Training & Enablement primary)
**Engagement:** Building in-house hierarchical MMM capability across 50 US DMAs
**Outcome:** Client team independently owns and runs their MMM workflow
— content/case-studies/llbean.md

### Fabletics — MMM Upgrade Coaching (PyMC3 → PyMC5)
**Service:** SLA coaching (Training & Enablement primary)
**Client:** TechStyle/Fabletics (Fashion / E-Commerce)
**Engagement:** PyMC3 to PyMC5/PyMC-Marketing migration + time-varying parameter coaching
**EAP testimonial:** "PyMC Labs implemented time-varying coefficients improving seasonality capture in marketing mix models. The team proved collaborative, insightful, and consistently supportive." — Kate Hirth, Fabletics
— content/case-studies/fabletics.md

### Gain Theory — MMM Workshop + Consultancy Upskilling
**Service:** Training & Enablement + Solution Delivery (dual)
**Client:** Gain Theory (Marketing consultancy)
**Engagement:** MMM workshop (2022) + Hierarchical Bayesian MMM + Bass Diffusion build
**Note:** Dual-service case — both custom build and training/upskilling for a consultancy's own team
— content/case-studies/gain-theory.md

### Fox Broadcasting — EAP Coaching Across Full Delivery Lifecycle
**Service:** Training & Enablement (EAP SLA coaching) + Strategy & Advisory
**Client:** Fox Broadcasting / Fox Entertainment
**Engagement:** Ongoing EAP coaching for a small DS team spanning full delivery cycle: research → implementation → deployment → roadmapping
**EAP testimonial:** "The PyMC Labs Coaching program has been transformative for our small Data Science team, enabling us to deliver results at the level of a full-scale department." — Eugene Kwok, Fox Entertainment
— content/case-studies/fox-broadcasting.md

### HelloFresh — Early Workshop (2021) + Ongoing EAP
**Service:** Training & Enablement (workshop) + Solution Delivery (custom MMM)
**Engagement:** Early corporate workshop (2021) that seeded a deeper Solution Delivery relationship; followed by EAP at $8,000/month
**Note:** Shows the workshop → project upsell path
— content/case-studies/hellofresh-mmm.md

---

## Cross-References

- Courses use PyMC-Marketing → link to `content/resources/open-source-libraries.md`
- Courses use CausalPy → link to `content/resources/open-source-libraries.md`
- BMA course instructs on tools also covered in `content/services/solution-delivery.md`
- Embedded Teams service (knowledge transfer via daily collaboration) → link to `content/services/embedded-teams.md`
- Halah Nathan Kafi testimonial mentions "advisory role and team training" → cross-ref `content/services/strategy-advisory.md`
- **Case Studies** (`/case-studies/*`): Training & Enablement primary cases — L.L. Bean, Fabletics, Fox Broadcasting; dual cases — Gain Theory, HelloFresh
- Corporate workshop clients (not full case studies): SIXT, Keywords Studios, Schwab, HelloFresh, Gain Theory, Vinted, IQVIA, Progressive Insurance, P&G, Wärtsilä

---

## Gaps

<!-- GAP: Agentic Data Science full session-by-session curriculum not yet public -->
<!-- GAP: CI course final dates not confirmed — Agentic DS conflict may push to June 2026 or post-summer -->
<!-- GAP: ABRM (CI Course in sitemap) — confirm new sitemap "CI" = ABRM or the upcoming causal inference course (Ben Vincent, May-Jun 2026) -->
<!-- GAP: No named testimonials from corporate workshop clients (logos only — no quotes from SIXT, Schwab, Keywords) -->
<!-- GAP: No case study pairing for training → what measurable outcomes did trained teams achieve? -->
<!-- GAP: No detail on what ABM "advanced course" would look like (Chris Fonnesbeck mentioned the idea) -->
