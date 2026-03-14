---
page: courses/ci
title: Applied Causal Inference for Business Impact (+ ABRM)
status: complete
sources:
  - analysis/website-scrape/courses.md
  - analysis/discord-courses-workshops-extraction.md
  - analysis/discord-competition-extraction.md
---

# CI Course — Two Possible Interpretations

<!-- GAP: The sitemap entry "CI Course" is ambiguous. Two courses map to it:
1. Applied Bayesian Regression Modeling (ABRM) — live on website at /courses/applied-bayesian-regression-modeling/, $1,499, March 2026 cohort CANCELLED due to only 2 registrations. THIS IS THE CURRENT LIVE COURSE.
2. Applied Causal Inference for Business Impact — in development, planned May–Jun 2026, Ben Vincent leading. More targeted causal inference course. NOT YET LIVE.

Recommendation: The new website sitemap "CI Course" likely refers to the upcoming Applied Causal Inference course (Ben Vincent's course), as it represents a more focused, standalone causal inference offering. The ABRM course is more of a general regression course that includes a causal session. However, this needs confirmation from Thomas/Halah/Sarah.
-->

---

## OPTION A: Applied Bayesian Regression Modeling (ABRM)
*(Currently live on website — use this content until CI course launches)*

### Hero

**Course name:** Applied Bayesian Regression Modeling

**Tagline:** "Bridges statistical foundations to real-world practice."

**Sub-tagline:** Build hierarchical, Gaussian process, and causal models — and translate outputs into practical, decision-ready insights.

**Price:** $1,499 (previously $1,699)

**Format:** 4 weeks · 8 live sessions · 16 hours total instruction

### Stats Bar

- 16 hrs live instruction
- 8 live sessions
- 3 expert instructors
- Bambi · PyMC · CausalPy · ArviZ

### Who Is This For

Data analysts and scientists with a statistics or ML background who want to go deeper on Bayesian regression.

**Prerequisites:**
- Comfort and familiarity with Python
- Understanding of basic regression analysis
- Introductory exposure to Bayesian statistics

### Week-by-Week Curriculum

*(March 2026 cohort — next cohort dates TBD after March cancellation)*

| Session | Date | Topic | Instructor(s) |
|---------|------|-------|--------------|
| 1 | Mar 3 | Introduction to Regression Modeling | Juan Orduz |
| 2 | Mar 5 | Introduction to Bambi | Ben Vincent, Juan Orduz |
| 3 | Mar 10 | Model Interpretation and Communication | Juan Orduz |
| 4 | Mar 12 | Hierarchical Models | Ben Vincent, Nathaniel Forde |
| 5 | Mar 17 | Gaussian Processes and Splines | Juan Orduz |
| 6 | Mar 19 | Multilevel Regression and Post-stratification (MRP) | Juan Orduz, Nathaniel Forde |
| 7 | Mar 24 | Causal Inference | Ben Vincent |
| 8 | Mar 26 | Survival Analysis | Nathaniel Forde |

### Learning Outcomes

- Specify, fit, and evaluate Bayesian regression models using Bambi
- Translate posterior outputs into actionable insights through predictions and counterfactuals
- Apply hierarchical modeling to real-world problems including price elasticity
- Model complex relationships using splines and Gaussian processes
- Use regression for causal inference and Bayesian survival analysis

### Key Topics

- Bayesian regression fundamentals with Bambi interface
- Model diagnostics and interpretation using ArviZ
- Hierarchical and multilevel regression (MRP)
- Nonlinear modeling with Gaussian processes and splines
- Causal inference methodology
- Survival analysis for churn and retention prediction

### Instructors

**Juan Orduz**
Mathematician, Ph.D. Humboldt Universität zu Berlin. 9+ years industry experience in Tech. Specializes in time series analysis, Bayesian methods, and causal inference.

**Ben Vincent** (DPhil)
Principal Data Scientist at PyMC Labs. 15+ years in academia. Core contributor to CausalPy. Specializes in Bayesian and causal data analysis.

**Nathaniel Forde**
Data Scientist. 10+ years delivering ML products in high-growth tech and regulated industries. Active open-source contributor to PyMC, Bambi, CausalPy, and PyMC-Marketing.

### Social Proof / Testimonials

<!-- GAP: No ABRM cohort testimonials available — March 2026 cohort was cancelled before running. Can use instructor credibility quotes and cross-course testimonials instead. -->

- Chris Fonnesbeck (ABM lead): "We probably need to introduce an advanced course someday!" — spoken to ABM participants asking about Bambi and advanced regression (Oct 2025)
- Ben Vincent (BMA + ABRM instructor): "Focuses on making rigorous inference accessible in practical contexts." — website bio
- "I've been building custom MMM solutions and recently diving deeper into causal inference." — Nazar Maidanenko, BMA participant intro (Feb 2026; illustrates crossover audience)

### Operational Notes
- March 2026 cohort CANCELLED — only 2 registrations received (per #applied-bayesian-modeling channel, 2026-02-20)
- One registrant offered ABM recordings + 2× 1:1 sessions as alternative
- No replacement cohort date set as of 2026-03-13
- **Developer note:** Do NOT advertise the cancelled cohort; surface a waitlist CTA instead

---

---

## OPTION B: Applied Causal Inference for Business Impact
*(In development — Ben Vincent, Juan Orduz, Nathaniel Forde — planned May–Jun 2026)*

### Hero

**Course name:** Applied Causal Inference for Business Impact

**Tagline:** "Business-first causal inference — the only course that combines Bayesian tools with real decision problems."

**Price (proposed):** $2,249 (early bird $1,999)

**Format:** 4 weeks · 8 live sessions · 16 hours total (standard format)

### Market Positioning (from Ben Vincent's analysis)

> "Our business-focused, decision-oriented approach has high novelty and strong market differentiation. While quasi-experimental methods courses are well-served by established players (Mixtape Sessions, Harvard CAUSALab), there is a notable gap in business-focused causal inference training using modern Bayesian tools."
> — Ben Vincent, #casual-inference, 2026-02-17

> "No existing course combines business-problem-first organisation, modern Bayesian tools (Bambi, CausalPy, PyMC), and comprehensive coverage across experiments, quasi-experiments, and observational methods."

**Market ratings:** Novelty 8/10 · Likely interest 9/10 · Pricing power 8/10

### Who Is This For

Data scientists and analysts who need to make causal claims from observational data — and turn those claims into business decisions. Target industries: e-commerce, SaaS, financial services, healthcare.

**Not just quasi-experiments:** the course takes a business-first approach — session titles are named after business scenarios (e.g., "Price Elasticity and Revenue Optimization"), not statistical methods.

### Proposed Curriculum Structure

*Note: Session-level plans are in GitHub. Curriculum organized around business scenarios (praised by Juan Orduz: "I like that the section names are not tied to methods... but to business scenarios")*

Business-scenario topics planned include:
- Price Elasticity and Revenue Optimization
- Marketing Incrementality and Attribution
- A/B Testing and Experiment Design
- Observational causal inference (DiD, ITS, RDD)
- Mediation and mechanisms
- Survival analysis for churn
- DAG-based causal reasoning (with LLM as brainstorming partner for identifying colliders)

Tools:
- PyMC (Bayesian modeling)
- Bambi (regression interface)
- CausalPy (quasi-experimental designs)
- Ben Vincent's new library (announced 2026-03-16 — unnamed at time of writing)

<!-- GAP: Full session-level plan is in private GitHub repo (pymc-labs/causal-inference-workshop). Need to extract plan_causal_inference.md content for complete curriculum. -->

### Instructors (confirmed)

**Ben Vincent** (DPhil) — primary architect
**Juan Orduz** (PhD, Humboldt) — confirmed
**Nathaniel Forde** — confirmed at limited capacity

### Pricing Rationale (from #casual-inference, 2026-03-11)
- Sarah Bakanosky: "could also argue pricing this course at $2,249 to start (early bird of $1,999?)"
- Evan: "Yes I like the 2249 with 1999 early bird pricing... the more specific and narrow the focus, the smaller the potential pool of registrants but the more they're willing to pay. And there aren't as many alternatives for a causal inference course."

### Corporate Workshop Potential
Ben's market analysis projected corporate workshops at $42K–$75K per engagement (three tiers). Ben: "adaptation to corporate workshops should be low effort."
Thomas's actual historical pricing: ~$20–30k per engagement.
Target industries: e-commerce, SaaS, financial services, healthcare.

### Social Proof / Market Validation (from Ben Vincent's analysis)

- Market ratings: **Novelty 8/10 · Likely interest 9/10 · Pricing power 8/10**
- "No existing course combines business-problem-first organisation, modern Bayesian tools (Bambi, CausalPy, PyMC), and comprehensive coverage across experiments, quasi-experiments, and observational methods." — Ben Vincent, #casual-inference, 2026-02-17
- "I like that the section names are not tied to methods (like: linear regression), but to business scenarios (like: Price Elasticity and Revenue Optimization)" — Juan Orduz, 2026-03-12
- Competitive gap confirmed: Mixtape Sessions and Harvard CAUSALab serve quasi-experiments well, but no course covers the full stack with modern Bayesian tools + business framing

### Timeline
- Original target: May 4, 2026
- Potential conflict with Agentic Data Science course (May 12-21)
- Discussion: push to June or post-summer
- Status as of 2026-03-13: deferred, timeline TBD
- Marketing start (6-week lead) would need to begin by ~late March for a June launch

---

## Shared Elements (for either CI course page)

### What's Included (standard for all courses)
- 8 live 2-hour sessions (Mon/Wed)
- Private GitHub repository with all notebooks
- Session recordings throughout course + 8 weeks post-course
- Discord: direct instructor access between sessions
- Certificate of completion (LinkedIn shareable)
- Optional pre-course install session

### FAQs

**Is this related to the Bayesian Marketing Analytics course?**
BMA covers causal inference as one module (calibrating MMMs with quasi-experiments). This course goes much deeper — covering observational methods, mediation, DAGs, survival analysis, and the full range of causal tools.

**What distinguishes this from other causal inference courses?**
Most causal inference courses focus on quasi-experimental methods (Mixtape Sessions, Harvard CAUSALab). This course uniquely combines modern Bayesian tools (Bambi, CausalPy, PyMC) with a business-first framing and covers experiments, quasi-experiments, and observational methods in one cohort.

**Corporate training?**
Available — contact [email protected]. Potential for in-person delivery; see corporate workshop options.

---

## Cross-References

- CausalPy (OSS) → content/resources/open-source-libraries.md
- PyMC (OSS) → content/resources/open-source-libraries.md
- Applied Bayesian Regression Modeling (current live course) → same page
- Bayesian Marketing Analytics course (causal module) → content/courses/bma.md
- Ben Vincent bio → content/about/team-members/ben-vincent.md
- Juan Orduz bio → content/about/team-members/juan-orduz.md
- Nathaniel Forde bio → content/about/team-members/nathaniel-forde.md
