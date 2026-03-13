---
page: courses/bma
title: Bayesian Marketing Analytics
status: complete
sources:
  - analysis/website-scrape/courses.md
  - analysis/discord-courses-workshops-extraction.md
  - analysis/discord-marketing-extraction.md
---

# Bayesian Marketing Analytics (BMA)

## Hero / Header

**Course name:** Bayesian Marketing Analytics

**Tagline:** "Probabilistic MMMs, causal experiments, CLV — the full marketing measurement stack."

**Sub-tagline:** Domain-specific modeling frameworks for marketing teams who need uncertainty-aware decisions.

**Price:** $2,249 (previously $2,499)

**Format:** 4 weeks · 8 live sessions · 16 hours total instruction

**CTA:** Join waitlist / Enroll now

---

## Stats Bar

- 16 hrs live instruction
- 8 live sessions
- 4 expert instructors
- 22 participants in Feb 2026 cohort
- 77.7% rated experience Good or Excellent (post-course survey, Feb 2026)

---

## What You'll Learn (Learning Outcomes)

1. **Understand the marketing measurement ecosystem** — How MMM, quasi-experiments, CLV models, customer choice models, adoption modeling, and causal designs inform strategic decisions
2. **Build probabilistic models** — MMMs, causal inference designs, CLV models, customer choice models, and diffusion/adoption models using PyMC-Marketing and CausalPy
3. **Convert outputs to decisions** — Propagate uncertainty, simulate scenarios, evaluate channel efficiency, deliver risk-aware budget recommendations
4. **Operationalize measurement** — Implement refresh workflows, plan experiments, manage data governance, communicate uncertainty to stakeholders

---

## Course Description

"Probabilistic MMMs, quasi-experiments, CLV modeling, customer choice modeling and adoption forecasting" using PyMC-Marketing and CausalPy. Emphasis on developing uncertainty-aware decision rules that move beyond point estimates.

Taught by PyMC-Marketing core contributors who work on MMM for Fortune 500 clients. The curriculum covers the full marketing analytics stack — from building your first MMM to calibrating it with lift tests to optimizing budget allocation under uncertainty.

---

## Who Is This For

**Target audience:** Data scientists and analysts with marketing experience who work directly with marketing teams and need domain-specific modeling frameworks for real-world marketing challenges.

**Prerequisites:**

*Technical:*
- Intermediate Python proficiency
- Comfort running and modifying Jupyter or Colab notebooks

*Statistical:*
- Familiarity with linear regression
- Basic understanding of probability and distributions
- Causal inference intuition

*Domain:*
- Working familiarity with marketing and advertising

---

## Week-by-Week Curriculum

*(Feb 2026 cohort schedule — next cohort dates TBD)*

| Session | Date | Topic | Instructor(s) |
|---------|------|-------|--------------|
| Optional | Jan 29 | Pre-Course Install Session | — |
| 1 | Feb 2 | Introduction to Marketing Analytics; MMM fundamentals | Timothy McWilliams |
| 2 | Feb 4 | MMM Fundamentals cont.; Model config; Prior selection; Base Sales | Timothy McWilliams |
| 3 | Feb 9–11 | Hierarchical & Advanced MMM; Multi-channel; Nested dimensions | Timothy McWilliams, Carlos Trujillo |
| 4 | Feb 11–16 | Optimization & Scenario Planning; SLSQP; BudgetOptimizer; Variance-aware allocation | Timothy McWilliams, Carlos Trujillo |
| 5 | Feb 16 | Calibrating MMMs with quasi-experiments: CausalPy + PyMC-Marketing lift tests | Timothy McWilliams, Ben Vincent |
| 6 | Feb 18 | Customer Lifetime Value (CLV): BG/NBD models; Monetary value estimation | Timothy McWilliams, Colt Allen |
| 7 | Feb 23–25 | Bass Diffusion Models for product adoption; Priors from adoption curves | Timothy McWilliams, Colt Allen |
| 8 | Feb 25 | Customer Choice Modeling: Multivariate ITS; Discrete Choice models | Timothy McWilliams |

---

## Key Topics

- Marketing Mix Modeling (MMM) with PyMC-Marketing
- Adstock and saturation curves (geometric decay, Hill function)
- Hierarchical MMMs (multi-channel, multi-geo, multi-product)
- Budget optimization under posterior uncertainty (SLSQP)
- Lift test calibration (`add_lift_test_measurements`)
- Quasi-experimental designs with CausalPy
- Customer Lifetime Value (BG/NBD models)
- Bass Diffusion for product adoption forecasting
- Discrete choice modeling
- Model comparison and uncertainty quantification (ArviZ)

---

## Instructors

### Timothy McWilliams
Lead Instructor. 7+ years in marketing mix modeling and Bayesian analytics. Specializes in applying statistical methods to optimize media investments across diverse industries. Client testimonial: "Working with Tim has been a genuinely different experience" — Nathan Kafi, Haleon (from website).

### Carlos Trujillo
Marketing Scientist at PyMC Labs. Experience across Latin America, Europe, and Africa. Previously at Wise, Bolt, and Omnicom Media Group. Core contributor to PyMC-Marketing open-source project. Session focus: Optimization and scenario planning.

### Ben Vincent (DPhil)
Principal Data Scientist at PyMC Labs. Bayesian and causal data analysis specialist. 15+ years in academia. Core contributor to CausalPy Python package. Session focus: Calibrating MMMs with quasi-experiments.

### Colt Allen
Principal Data Scientist at PyMC Labs. 10+ years across marketing analytics, renewable energy, logistics, and manufacturing. Lead developer for CLV modeling in PyMC-Marketing. MS in Mineral & Energy Economics; BS in Industrial Engineering; Six-Sigma Greenbelt; INFORMS Certified Analytics Professional. Session focus: CLV + Bass Diffusion.

---

## What's Included

- 8 live 2-hour sessions (Mon/Wed, 3–5pm EST)
- Private GitHub repository with all notebooks and code: https://github.com/pymc-labs/bayesian-marketing-analytics-course
- Session recordings available throughout course + 8 weeks post-course
- Discord channel: direct access to instructors between sessions (very active — 15+ detailed technical Q&As between sessions in Feb 2026 cohort)
- Certificate of completion (shareable on LinkedIn)
- Optional pre-course environment setup session (2h)

---

## Technical Depth Signals (for course page / SEO)

The Feb 2026 cohort Discord shows the extraordinary depth of between-session Q&A. Sample topics covered:

- Why the intercept = Base Sales and cannot be removed (inflated ROI if removed)
- Time-slice cross-validation for MMM
- Multidimensional MMM: migration from legacy single-model to new multidim class
- SLSQP vs Bayesian Optimization vs Genetic Algorithms for budget allocation — Carlos: "Using BO here would be like hiring a search helicopter to find your keys on the kitchen table — vastly overpowered for the wrong problem."
- Geo-test calibration: generalizing geo-test results to national level
- `add_lift_test_measurements` with `time_varying_media=True`: predicted delta_y(t) = m_t × [sat(x + delta_x) − sat(x)]
- BG/NBD frequency counting: why two purchases in the same week count as 1
- B2B MMM: distinct challenges vs. B2C

---

## Participant Testimonials / Social Proof

- "77.7% rated experience Good or Excellent" — post-course survey, Feb 2026 cohort (9 respondents)
- "Thank you Ben! Very thorough answer!" — Jie Gao, Feb 2026 BMA cohort (#bayesian-mktg-analytics-feb-2026, 2026-03-03)
- "This research [Bass Diffusion for priors] is still in the early proposal stages, but... garnered considerable interest." — Colt Allen (showing course covers cutting-edge research)
- "I've been building custom MMM solutions and recently diving deeper into causal inference." — Nazar Maidanenko (participant intro, analytics lead, Feb 2026)

<!-- GAP: Need more named testimonials with job title + company. Post-course survey data available (9 respondents, 77.7% Good/Excellent) but no verbatim quotes extracted. -->

---

## FAQs

**Do I need marketing experience?**
Yes — working familiarity with marketing and advertising is a prerequisite. This is not an intro to marketing; it's an advanced statistics course for marketing practitioners.

**What's the difference between this and the Applied Bayesian Modeling course?**
ABM teaches general-purpose Bayesian modeling with PyMC. BMA applies those tools specifically to marketing analytics (MMM, CLV, causal experiments, optimization). We recommend ABM first if you have no Bayesian background.

**Is MMM-Agent (Decision AI) covered?**
No — this course covers the open-source PyMC-Marketing library. Our Decision AI product automates much of this workflow; this course teaches you to understand what's under the hood.

**Will attendance be required?**
No — recordings are available throughout the course, and you have Discord access to instructors for help.

**Can I get an invoice?**
Contact [email protected] with purchaser name, billing address, and tax ID.

**Team rates?**
Contact [email protected] for group pricing. Customized corporate courses available at beginner/intermediate/advanced levels.

**Refund policy?**
Full refund if cancelled 7+ days before start. 14-day withdrawal right from registration.

---

## Related Courses

- **Applied Bayesian Modeling** — foundational course; recommended prerequisite for those without Bayesian background
- **Applied Bayesian Regression Modeling** — hierarchical models, GPs, causal inference; different angle from BMA
- **Decision AI (MMM Agent)** — the productized version of what this course teaches; self-service tool for enterprise teams

---

## Cross-References

- PyMC-Marketing (open source) → content/resources/open-source-libraries.md
- CausalPy (open source) → content/resources/open-source-libraries.md
- Decision AI → content/solutions/decision-ai.md
- HelloFresh case study (MMM) → content/case-studies/hellofresh-mmm.md
- Ovative Group testimonial (Tim McWilliams client) → content/about/team-members/timothy-mcwilliams.md

---

## Operational Notes (internal)

- GitHub repo: https://github.com/pymc-labs/bayesian-marketing-analytics-course
- Feb 2026 cohort: 22 participants; 9 survey respondents; 77.7% Good/Excellent
- Promo codes used: `BMAFEB15` (15% off), `PyMC15` (15% off), custom 50% for strategic leads (e.g., BMW)
- Paid LinkedIn ads: $199.27 spend, 0 conversions; organic/Carlos's LinkedIn video drove most signups
- daimon bot generated post-course Q&A summary from session notes + Discord threads
