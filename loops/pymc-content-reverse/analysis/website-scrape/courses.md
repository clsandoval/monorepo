# PyMC Labs Courses — Website Scrape
Source: https://www.pymc-labs.com/courses/ (and individual course pages)
Scraped: 2026-03-13

## Courses Overview Page (/courses/)

Four offerings listed:
1. Applied Bayesian Modeling — foundational to advanced Bayesian using PyMC
2. Bayesian Marketing Analytics — probabilistic MMM, CLV, causal inference for marketing
3. Applied Bayesian Regression Modeling — hierarchical, GP, causal models with Bambi/PyMC
4. Custom Workshops — tailored team sessions

### Shared Format (all courses)
- 4 weeks, 8 live sessions (2×2h per week) = 16 hours total instruction
- Online cohort with recordings available throughout course
- Private GitHub repo with all code; 8-week post-course access
- Discord access to instructors between sessions
- Certificate of completion (shareable on LinkedIn)
- Refund: full if cancelled 7+ days before start; 14-day withdrawal right from registration

### Sitemap Mapping Note
The sitemap lists: ABM Course, BMA Course, CI Course.
- ABM = Applied Bayesian Modeling ✓
- BMA = Bayesian Marketing Analytics ✓
- CI = Likely Applied Bayesian Regression Modeling (contains causal inference module; no dedicated /causal-inference/ course page found — 404)
<!-- GAP: Confirm whether "CI Course" = Applied Bayesian Regression Modeling or a separate upcoming course -->

---

## Course 1: Applied Bayesian Modeling (ABM)

**URL:** https://www.pymc-labs.com/courses/applied-bayesian-modeling/
**Price:** $1,499 (was $1,699)
**Status:** Enrollment via waitlist
**Schedule:** 11am–1pm ET, Jan–Feb 2026 cohort (Jan 12 – Feb 4, 2026)

### Description
Interactive, hands-on cohort teaching practical Bayesian modeling using PyMC. Emphasizes "practical use over academic formality." Moves participants "from foundational Bayesian thinking to advanced modeling techniques."

**Target audience:** "Ideal for software engineers, data analysts, and data scientists who want to move beyond black-box models" and build interpretable Bayesian solutions.

### Prerequisites
- Basic Python programming experience
- Familiarity with NumPy
- Comfort with Jupyter Notebooks
- **No prior Bayesian experience required**

### Week-by-Week Curriculum

| Date | Topic | Instructor |
|------|-------|-----------|
| Jan 8 (optional) | Pre-Course Install Session | — |
| Jan 12 | Intro to Bayesian modeling and PyMC | Allen Downey |
| Jan 14 | Priors and Likelihood Choices | Vianey Leos Barajas |
| Jan 19 | Building Models in PyMC | Chris Fonnesbeck |
| Jan 21 | Bayesian Regression | Vianey Leos Barajas |
| Jan 26 | Hierarchical Models | Chris Fonnesbeck |
| Jan 28 | MCMC | Vianey Leos Barajas |
| Feb 2 | Causal Inference Models | Chris Fonnesbeck |
| Feb 4 | Time Series Models | Allen Downey |

### Topics
- Bayesian Thinking & Model Building
- Hands-On MCMC & Inference Techniques
- Hierarchical, Causal, & Time Series Models
- Model debugging, improvement, and scaling

### Learning Outcomes
- "Build and interpret Bayesian models to solve real-world problems"
- "Run and diagnose MCMC workflows for reliable, interpretable results"
- Apply PyMC to "model uncertainty and understand complex systems"
- Debug and scale models for practical applications

### Instructors

**Chris Fonnesbeck**
Principal Quantitative Analyst at PyMC Labs; Adjoint Associate Professor at Vanderbilt University Medical Center. 20 years experience in academic, industry, and government data science roles. Ph.D. from University of Georgia.

**Allen Downey**
Principal Data Scientist at PyMC Labs; Professor Emeritus at Olin College. Author of *Think Python*, *Think Bayes*, and *Probably Overthinking It*.

**Vianey Leos Barajas**
Assistant Professor at University of Toronto (Department of Statistical Sciences and School of the Environment). Specializes in ecological statistics, time series modeling, and Bayesian methods.

### FAQs
- **Will MMMs be covered?** No, but foundational tools for Bayesian MMM will be taught.
- **Can I miss sessions?** Yes; recordings available throughout, Discord for instructor support.
- **Refund?** Full refund if cancelled 7+ days before start; 14-day withdrawal right.
- **Outside time commitment?** Notebooks + Discord available between sessions for practice.

---

## Course 2: Bayesian Marketing Analytics (BMA)

**URL:** https://www.pymc-labs.com/courses/bayesian-marketing-analytics/
**Price:** $2,249 (was $2,499)
**Status:** Enrollment via waitlist
**Schedule:** 3–5pm EST, Feb 2–25, 2026 cohort

### Description
"Probabilistic MMMs, quasi-experiments, CLV modeling, customer choice modeling and adoption forecasting" using PyMC-Marketing and CausalPy. Emphasis on developing uncertainty-aware decision rules.

**Target audience:** Data scientists and analysts with marketing experience who work directly with marketing teams seeking "domain-specific modeling frameworks to real-world marketing challenges."

### Prerequisites
**Technical:**
- Intermediate Python proficiency
- Comfort running and modifying Jupyter or Colab notebooks

**Statistical:**
- Familiarity with linear regression
- Basic understanding of probability and distributions
- Causal inference intuition

**Domain:**
- Working familiarity with marketing and advertising

### Week-by-Week Curriculum

| Date | Topic | Instructor(s) |
|------|-------|--------------|
| Jan 29 (optional) | Pre-Course Install Session | — |
| Feb 2 | Introduction to Marketing Analytics | Timothy McWilliams |
| Feb 4 | MMM Fundamentals | Timothy McWilliams |
| Feb 9 | Hierarchical & Advanced Modeling Methods for MMMs | Timothy McWilliams |
| Feb 11 | Optimization and Scenario Planning | Timothy McWilliams, Carlos Trujillo |
| Feb 16 | Calibrating MMMs with quasi-experiments: CausalPy & PyMC Marketing | Timothy McWilliams, Ben Vincent |
| Feb 18 | Customer Lifetime Value: Estimating Monetary Value of Each Customer | Timothy McWilliams, Colt Allen |
| Feb 23 | Capturing Product Adoption with Bass Diffusion Models | Timothy McWilliams, Colt Allen |
| Feb 25 | Customer Choice Modeling: Multivariate Interrupted Time-series and Discrete Choice Models | Timothy McWilliams |

### Learning Outcomes
1. **Understand the marketing measurement ecosystem** — How MMM, quasi-experiments, CLV models, customer choice models, adoption modeling, and causal designs inform strategic decisions
2. **Build probabilistic models** — MMMs, causal inference designs, CLV models, customer choice models, and diffusion/adoption models using PyMC-Marketing and CausalPy
3. **Convert outputs to decisions** — Propagate uncertainty, simulate scenarios, evaluate channel efficiency, deliver risk-aware recommendations
4. **Operationalize measurement** — Implement refresh workflows, plan experiments, manage data governance, communicate uncertainty to stakeholders

### Instructors

**Timothy McWilliams**
Lead instructor. 7+ years experience in marketing mix modeling and Bayesian analytics. Specializes in applying statistical methods to optimize media investments across diverse industries.

**Colt Allen**
Principal Data Scientist at PyMC Labs. 10+ years across marketing analytics, renewable energy, logistics, and manufacturing. Lead developer for CLV modeling in PyMC-Marketing. MS in Mineral & Energy Economics, BS in Industrial Engineering; Six-Sigma Greenbelt and INFORMS Certified Analytics Professional.

**Ben Vincent** (DPhil)
Principal Data Scientist at PyMC Labs. Bayesian and causal data analysis specialist. 15+ years in academia; core contributor to CausalPy Python package. "Focuses on making rigorous inference accessible in practical contexts."

**Carlos Trujillo**
Marketing Scientist at PyMC Labs. Experience across Latin America, Europe, and Africa. Previously at Wise, Bolt, and Omnicom Media Group. Core contributor to PyMC-Marketing open-source project.

### FAQs
- **Registration:** Payment confirmation immediately; welcome email with materials within 2 business days.
- **Live attendance required?** No; recordings + Discord support available.
- **Invoice?** Contact [email protected] with purchaser name, billing address, tax ID.
- **Team rates?** Contact [email protected] for group pricing; customized corporate courses available (beginner/intermediate/advanced).
- **Refund?** Full if cancelled 7+ days before start; 14-day withdrawal right.

---

## Course 3: Applied Bayesian Regression Modeling (CI / ABR)

**URL:** https://www.pymc-labs.com/courses/applied-bayesian-regression-modeling/
**Price:** $1,499 (was $1,699)
**Status:** Accepting registrations via waitlist (March 2026 cohort)
**Schedule:** 3–5pm EST, Mar 3–26, 2026

### Description
Bridges statistical foundations to real-world practice. Using Bambi and PyMC, participants "build hierarchical, Gaussian process, and causal models and translate outputs into practical, decision-ready insights."

**Target audience:** Data analysts and scientists with statistics/ML background.

### Prerequisites
- Comfort and familiarity with Python
- Understanding of basic regression analysis
- Introductory exposure to Bayesian statistics

### Week-by-Week Curriculum

| Date | Topic | Instructor(s) |
|------|-------|--------------|
| Mar 3 | Introduction to Regression Modeling | Juan Orduz |
| Mar 5 | Introduction to Bambi | Ben Vincent, Juan Orduz |
| Mar 10 | Model Interpretation and Communication | Juan Orduz |
| Mar 12 | Hierarchical Models | Ben Vincent, Nathaniel Forde |
| Mar 17 | Gaussian Processes and Splines | Juan Orduz |
| Mar 19 | Multilevel Regression and Post-stratification (MRP) | Juan Orduz, Nathaniel Forde |
| Mar 24 | Causal Inference | Ben Vincent |
| Mar 26 | Survival Analysis | Nathaniel Forde |

### Learning Outcomes
- Specifying, fitting, and evaluating Bayesian regression models using Bambi
- Translating posterior outputs into actionable insights through predictions and counterfactuals
- Applying hierarchical modeling to real-world problems including price elasticity
- Modeling complex relationships using splines and Gaussian processes
- Using regression for causal inference and Bayesian survival analysis

### Key Topics
- Bayesian regression fundamentals with Bambi interface
- Model diagnostics and interpretation using ArviZ
- Hierarchical and multilevel regression approaches
- Nonlinear modeling with Gaussian processes and splines
- Causal inference methodology
- Survival analysis for churn and retention prediction

### Instructors

**Juan Orduz**
Mathematician, Ph.D. Humboldt Universität zu Berlin. 9+ years industry experience in Tech. Specializes in time series analysis, Bayesian methods, and causal inference.

**Ben Vincent** (DPhil)
Principal Data Scientist at PyMC Labs. 15+ years in academia; core contributor to CausalPy. Specializes in Bayesian and causal data analysis.

**Nathaniel Forde**
Data Scientist. 10+ years delivering ML products in high-growth tech and regulated industries. Open-source contributor to PyMC, Bambi, and CausalPy.

### FAQs
- **Recording?** Sessions recorded, available throughout course.
- **Code access?** Private repo, 8-week post-course access.
- **Attendance?** "No worries — recordings are available for the duration of the course, and you'll still have access to instructors via Discord for help."
- **Refund?** Full if cancelled 7+ days before start; 14-day withdrawal right.
- **Team training?** Corporate training available; beginner/intermediate/advanced levels.

---

## Custom Workshops

Listed on /courses/ but no dedicated page found (no separate URL).
Described as: "Tailored sessions designed for team-specific challenges in experimentation, forecasting, and causal analysis."
Contact: [email protected] for corporate/team rates.

---

## Cross-Reference Notes
- Instructors who appear across multiple courses: Ben Vincent (BMA + ABR), Timothy McWilliams (BMA lead), Juan Orduz (ABR lead), Chris Fonnesbeck (ABM), Allen Downey (ABM), Vianey Leos Barajas (ABM), Nathaniel Forde (ABR), Colt Allen (BMA), Carlos Trujillo (BMA)
- PyMC-Marketing is central tool in BMA course → link to solutions/open-source pages
- CausalPy appears in BMA (calibration session) and ABR (causal inference session) → link to OSS resources page
- Bambi is key tool in ABR course → link to OSS resources page
