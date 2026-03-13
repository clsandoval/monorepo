# Discord Courses & Workshops — Extraction

**Sources:**
- `826452827693514762` — 🏫│general (TRAINING category, 1,892 msgs, 2021-03 → 2026-03)
- `1364653012743618590` — 🏫│open-cohort-workshop (1,110 msgs, 2025-04 → 2026-03)
- `1450155528419278939` — 📈│bayesian-mktg-analytics-course (479 msgs, 2025-12 → 2026-03)
- `1466897512223997962` — 🔭│applied-bayesian-regression-modeling (38 msgs, 2026-01 → present)
- `1466898505435058369` — 📈│casual-inference (61 msgs, 2026-01 → 2026-03)
- `1474139161232408719` — 🧑‍🏫│applied-bayesian-modeling (6 msgs, 2026-02)
- `1399000602482053201` — workshop-alumni (79 msgs, 2025-09 → 2026-03)
- `1457377745012002847` — bayesian-modeling-workshop-jan-2026 (417 msgs, 2026-01 → 2026-02)
- `1465754624685510926` — bayesian-mktg-analytics-feb-2026 (101 msgs, 2026-01 → 2026-03)
- `1399000312580407408` — applied-bayesian-modeling-workshop-august-2025 (602 msgs)
- `1422504386466418699` — applied-bayesian-modeling-workshop-october-2025 (483 msgs)
- `1474430257099702293` — keyword-studios-workshop (29 msgs, 2026-03)
- `1466531449619480749` — sixt-workshop (79 msgs, 2026-01 → 2026-02)
- `1476692680246431906` — london-workshop (40 msgs, 2026-02 → 2026-03)

**Extracted:** 2026-03-13

---

## 1. Course Portfolio Overview

### Active Open-Enrollment Courses (as of March 2026)

| Course | Price | Early Bird | Status | Cohort Dates |
|--------|-------|------------|--------|--------------|
| Applied Bayesian Modeling (ABM) | $1,499 | — | Waitlist | Jan 2026 cohort ended; next TBD |
| Bayesian Marketing Analytics (BMA) | $2,249 | — | Waitlist | Feb 2026 cohort ended; next TBD |
| Applied Bayesian Regression Modeling (ABRM) | $1,499 | — | March cohort CANCELLED (2 registrations); next TBD | Mar 2026 planned |
| Applied Causal Inference for Business Impact (CI) | ~$2,249 (proposed) | ~$1,999 | In development | May–Jun 2026 (planned) |
| Agentic Data Science | $1,900 | — | Landing page live, hidden | May 12–21, 2026 |

### Custom Corporate Workshops
- Priced at ~$20–30k per engagement (Thomas confirmation in #casual-inference, 2026-03-11)
- Ben Vincent market analysis suggested $40–70k but Thomas called that an overestimate
- Customizable content, can be delivered in-person
- Contact: [email protected]

---

## 2. Applied Bayesian Modeling (ABM) — Full Extraction

### GitHub Repository
- https://github.com/pymc-labs/pymc-workshop

### Cohorts Run
- August 2025 (cohort in `applied-bayesian-modeling-workshop-august-2025`)
- October 2025 (cohort in `applied-bayesian-modeling-workshop-october-2025`)
- January 2026 (cohort in `bayesian-modeling-workshop-jan-2026`)

### Format (confirmed from cohort channels)
- 8 sessions × 2h = 16 hours total
- Mon/Wed schedule, 11am–1pm ET
- Google Meet (live video)
- Private GitHub repo (code + notebooks)
- Recordings available 8 weeks post-course
- Discord channel for Q&A between sessions
- Certificate of completion (LinkedIn shareable)
- Pre-course install session (optional, 2h)

### Instructors
- **Allen Downey** — led Session 1 (Bayesian A/B testing / Thompson sampling), Session 3 (distributions), Session 8 (time series/GPs). Principal Data Scientist, author of *Think Bayes*.
- **Chris Fonnesbeck** — led sessions on PyTensor/distributions, pooling/regression, hierarchical models, causal inference intro. Principal Quantitative Analyst. Adjoint Associate Professor, Vanderbilt.
- **Vianey Leos Barajas** — co-instructor for multiple sessions. Assistant Professor at University of Toronto.

### Confirmed Curriculum (from Oct 2025 cohort sessions)
| Session | Topic | Lead |
|---------|-------|------|
| 1 | Intro to Bayesian Modeling, PyMC; Beta-Binomial; Thompson Sampling for A/B tests | Allen Downey |
| 2 | PyTensor, distributions deep-dive | Chris Fonnesbeck + Vianey |
| 3 | Distributions deep-dive; MCMC intro | Allen Downey |
| 4 | Distributions cont.; Student-t, negative binomial | Allen Downey + Vianey |
| 5 | Partial pooling, regression, model comparison | Chris Fonnesbeck + Vianey |
| 6 | Hierarchical models (sports outcome example, Croatia/France goals) | Chris Fonnesbeck + Allen |
| 7 | Causal inference with PyMC (DAGs, `do` operator, CausalPy) | Chris Fonnesbeck + Vianey |
| 8 | Time series, Gaussian Processes | Allen Downey |

### Jan 2026 Curriculum (confirmed from website + discord)
| Date | Topic | Instructor |
|------|-------|-----------|
| Jan 12 | Intro to Bayesian modeling and PyMC | Allen Downey |
| Jan 14 | Priors and Likelihood Choices | Vianey Leos Barajas |
| Jan 19 | Building Models in PyMC | Chris Fonnesbeck |
| Jan 21 | Bayesian Regression | Vianey Leos Barajas |
| Jan 26 | Hierarchical Models | Chris Fonnesbeck |
| Jan 28 | MCMC | Vianey Leos Barajas |
| Feb 2 | Causal Inference Models | Chris Fonnesbeck |
| Feb 4 | Time Series Models | Allen Downey |

### Session Q&A Highlights (shows course depth)
From Oct 2025 cohort:
- "Come for the math, stay for the etymology" — darthmaluus (participant, lighthearted testimonial)
- Extensive PSIS-LOO / model comparison thread (Sessions 5-6): Teemu Säilynoja hopped in from the team to answer survival model ELPD comparison question
- Chris: "We probably need to introduce an advanced course someday!" (responding to advanced BART/LOO questions)
- Chris on MMM-GPT connection: "PyMC -> PyMC-Marketing -> MMM-GPT. What we are learning in this workshop is how to generally build Bayesian models in PyMC." (2025-10-28)
- Allen on MCMC: "When there is a closed form, it is sometimes easier to work with than a random sample... but there are only closed forms for a few simple problems, so if we know we're going to solve a more complex problem, we might move immediately to sampling." (2025-10-13)

### Post-Course Feedback
Post-course survey (Oct 2025, ~12 respondents):
- Format well-received
- Notable critique (from one participant, Jan 2026): "too textbook-driven, repeated content that's readily available elsewhere; not applied enough; lacked project/problem-based learning; felt like some teaching wasn't engaging enough" — NOTE: This person (Lucas) paid out of pocket + had 10+ years of DS experience, per Sarah Bakanosky context
- Testimonial bait: "This is busy breaking my brain" — Nick (participant, Oct 2025)
- Testimonial bait: "Thank you for another great session! I'm curious about hierarchical approaches to time-series models." — Chris Hires (Oct 2025)
- "This has been great!" — kyle (Oct 2025)

### March ABM Cohort Cancellation
Applied Bayesian Regression Modeling March cohort was cancelled (only 2 registrations received). One participant was offered ABM recordings + 2× 1:1 sessions as an alternative. Allen Downey and Vianey declined 1:1 sessions due to lack of bandwidth.

---

## 3. Bayesian Marketing Analytics (BMA) — Full Extraction

### GitHub Repository
- https://github.com/pymc-labs/bayesian-marketing-analytics-course

### Cohorts Run
- February 2026 (`bayesian-mktg-analytics-feb-2026`, 22 participants enrolled)

### Format
- 8 sessions × 2h = 16 hours total
- Mon/Wed, 3–5pm EST
- Optional pre-course install session (2h)
- Live via Google Meet
- Private GitHub repo + 8-week recording access post-course
- Discord for between-session Q&A (very active: Tim answered 15+ detailed technical questions between sessions)

### Instructors
- **Timothy McWilliams** — lead instructor, 7+ years MMM/Bayesian analytics
- **Carlos Trujillo** — marketing scientist, PyMC-Marketing core contributor, previously Wise/Bolt/Omnicom
- **Ben Vincent** (DPhil) — calibration/lift tests session lead, CausalPy core contributor
- **Colt Allen** — CLV + Bass Diffusion sessions lead, PyMC-Marketing CLV lead dev

### Feb 2026 Cohort Session Details
| Session | Topic | Instructor(s) |
|---------|-------|--------------|
| 1 (Feb 2) | Introduction to Marketing Analytics + MMM fundamentals | Timothy McWilliams |
| 2 (Feb 4) | MMM Fundamentals cont. | Timothy McWilliams |
| 3 (Feb 9–11) | Hierarchical & Advanced MMM | Timothy McWilliams + Carlos Trujillo |
| 4 (~Feb 14–16) | Optimization and Scenario Planning (SLSQP, BudgetOptimizer) | Timothy McWilliams + Carlos Trujillo |
| 5 (~Feb 18–19) | Calibrating MMMs with quasi-experiments: CausalPy + PyMC-Marketing | Timothy McWilliams + Ben Vincent |
| 6 (~Feb 23) | Customer Lifetime Value (BG/NBD models) | Timothy McWilliams + Colt Allen |
| 7 (~Feb 25) | Bass Diffusion Models for product adoption | Timothy McWilliams + Colt Allen |
| 8 | Customer Choice Modeling; Multivariate ITS; Discrete Choice | Timothy McWilliams |

### Marketing Activity (from #bayesian-mktg-analytics-course)
- Promo codes used: `BMAFEB15` (15% off), `PyMC15` (15% off), custom 50% codes for high-value leads (e.g., BMW/Florian)
- Paid LinkedIn ads: $199.27 spend, 0 direct conversions
- Carlos's LinkedIn video: 5 direct sales (most effective single marketing action)
- Most signups: organic social
- 22 participants enrolled

### Post-Course Survey Results (9 responses from ~22 participants)
- 77.7% rated experience Good or Excellent
- Survey done via Google Forms
- Post-course summary generated via NotebookLM from session notes + Discord Q&A

### Notable Q&A Threads (shows curriculum depth)
- **Intercept interpretation**: Tim explained intercept = "Base Sales" (sales with zero media spend); removing it causes inflated ROI. Cannot remove in PyMC-Marketing.
- **Optimizer**: Carlos explained SLSQP vs Bayesian Optimization vs Genetic Algorithms: "Using BO here would be like hiring a search helicopter to find your keys on the kitchen table." Core solver = scipy.optimize.minimize SLSQP (gradient-based SQP).
- **Lift test calibration**: `add_lift_test_measurements` targets saturation curve. Ben: if `time_varying_media=True`, predicted delta_y(t) = m_t * [sat(x + delta_x) - sat(x)]; must include date in df_lift_test.
- **Multidimensional MMM**: Tim recommended migration to new multidim class (legacy single-model deprecated).
- **CLV BG/NBD**: Colt explained frequency counting logic — two purchases in same week count as 1 because model assumptions involve time periods between transactions.
- **Bass Diffusion for priors**: Colt noted early research stage exploring using Bass Diffusion to guide prior selection for MMM lag/saturation effects.
- **B2B MMM**: discussed in session; distinct challenges noted.

### Verbatim Pull Quotes (for testimonials / social proof)
- "Carlos, I found your explanation of SLSQP vs. BO vs. GA really clarifying." — Mark Nguyen (participant, #bayesian-mktg-analytics-feb-2026)
- "Thank you Ben! Very thorough answer!" — Jie Gao (participant, 2026-03-03, after detailed lift test explanation)
- "I'm pretty familiar with hierarchical models and use them pretty often (different parks, different rides, etc)" — Dr. DumbDumb (participant intro, themed background)
- Post-course survey NPS implied: 77.7% Good/Excellent

---

## 4. Applied Causal Inference for Business Impact (CI Course) — Full Extraction

### Status
- In development as of March 2026
- Channel: `#casual-inference` (sic — named causal-inference on website)
- GitHub (private): https://github.com/pymc-labs/causal-inference-workshop
- Market analysis doc: https://github.com/pymc-labs/causal-inference-workshop/blob/main/plans/market_analysis_causal_courses.md

### Timeline (from #casual-inference, March 2026)
- Course blueprint and session plans in GitHub repo as of Feb 17, 2026
- Sarah Bakanosky proposed dates:
  - Course kickoff: May 4, 2026
  - Marketing start (6-week lead): March 23, 2026
  - Webpage finalized: March 20, 2026
- BUT: Agentic Data Science course (Thomas/Luca/Hugo, May 12–21) announced March 11, 2026 — would conflict
- Options discussed: push to June or post-summer
- Ben Vincent: "I would be fine if we defer the Causal workshop a bit" (2026-03-12)

### Instructors (confirmed)
- **Ben Vincent** (DPhil) — primary course architect; led all planning
- **Juan Orduz** (PhD, Humboldt Universität) — confirmed participant: "Im in"
- **Nathaniel Forde** — limited capacity (mortgage + personal issues); willing if he can
- Halah also mentioned for logistics/marketing

### Course Name
Full name: **"Applied Causal Inference for Business Impact"**

### Ben Vincent's Market Analysis Summary (verbatim excerpt)
> "Our business-focused, decision-oriented approach has high novelty and strong market differentiation. While quasi-experimental methods courses are well-served by established players (Mixtape Sessions, Harvard CAUSALab), there is a notable gap in business-focused causal inference training using modern Bayesian tools."
> — Ben Vincent, #casual-inference, 2026-02-17

> "No existing course combines business-problem-first organisation, modern Bayesian tools (Bambi, CausalPy, PyMC), and comprehensive coverage across experiments, quasi-experiments, and observational methods."

**Market ratings:** Novelty 8/10, Likely interest 9/10, Pricing power 8/10

### Proposed Pricing (from #casual-inference, 2026-03-11)
- Sticker: $2,249
- Early bird: $1,999
- Sarah: "could also argue pricing this course at $2,249 to start (early bird of $1,999?)"
- Evan confirmed: "Yes I like the 2249 with 1999 early bird pricing. Just my intuition... the more specific and narrow the focus, the smaller the potential pool of registrants but the more they're willing to pay."

### Curriculum Structure (from course blueprint)
Sessions named by **business scenario** (not method) — Juan Orduz specifically praised this approach:
> "I like that the section names are not tied to methods (like: linear regression), but to business scenarios (like: Price Elasticity and Revenue Optimization)" — Juan Orduz, 2026-03-12

Juan's review noted the curriculum was comprehensive but may cover too much material — suggestion to mark some topics as optional with resources.

### Planned Tools
- PyMC (Bayesian modeling)
- Bambi (regression interface)
- CausalPy (quasi-experimental designs)
- Ben's new package (announced March 16, 2026 — unnamed at time of channel messages)
- DAG-based analysis

### Corporate Workshop Potential
Ben's analysis: corporate workshops ($42K–$75K per engagement) represent the highest-margin channel. Three tiers: standard team training → strategic enablement with implementation support. Target industries: e-commerce, SaaS, financial services, healthcare.
- Ben: "adaptation to corporate workshops should be low effort"
- Self-paced online course also planned but lower priority: "ideally high volume, low cost thing"

---

## 5. Agentic Data Science Course — Summary (from analysis/course-ai-assisted.md)

- **Full name:** Master Agentic Data Science
- **URL:** https://www.pymc-labs.com/courses/agentic-ai-data-science (live but hidden)
- **Price:** $1,900
- **Format:** 4 sessions × 3h = 12 hours, May 12–21, 2026
- **Cap:** 20 participants
- **Co-brand:** PyMC Labs × Vanishing Gradients (Hugo Bowne-Anderson)
- **Instructors:** Hugo Bowne-Anderson (educator), Thomas Wiecki (scientist), Luca Fiaschi (strategist)
- **Tagline:** "the framework for going from raw data to real decisions at 10× speed"
- **NOT in current sitemap** — this is a new offering not yet surfaced in nav

---

## 6. Corporate / Custom Workshops — Historical Record

### Recent Corporate Workshops
| Client | Channel | Details |
|--------|---------|---------|
| SIXT | `sixt-workshop` | 2-day, 8h total; instructors: Teemu Säilynoja, Oriol, Juan Orduz; 2026-01 to 2026-02 |
| Keywords Studios | `keyword-studios-workshop` | 24h, 8 sessions; gaming company; 2026-03 |
| London workshop | `london-workshop` | In-person, June 8-10, WeWork Shoreditch; ~$3k price point per person; 2026-02 → 2026-03 |
| Schwab | `schwab-workshops` | 437 msgs; 2025-01 → 2026-01 |

### Historical Workshops (from #general-training, 2021-2024)
| Client | Date | Notes |
|--------|------|-------|
| HelloFresh | 2021 | Early workshop, HelloFresh_workshop channel |
| Gain Theory | 2022 | Gain Theory MMM workshop |
| Vinted | 2022 | Vinted workshop |
| BP (British Petroleum) | 2023 | Ben Vincent declined due to fossil fuel ethics — "I refuse to teach BP" |
| IQVIA | 2023 | Pharma CRO; recordings access later revoked |
| Progressive Insurance | 2023 | Workshop channel exists |
| 1848 Ventures | 2023 | |

### Corporate Workshop Pricing
- Thomas Wiecki confirmed in #casual-inference (2026-03-11): "I lack context but yes, that's usually what our workshops cost" (re: ~$20–30k)
- Wärtsilä negotiation documented in #general (2022): offer of 20k EUR
- P&G workshop (Jun 2022): ran 7-10 June
- LinkedIn workshop marketing and organic queries mentioned as primary channels

---

## 7. Workshop Alumni Program

### Channel: workshop-alumni
- Created Sept 2025
- Participants from ABM cohorts move here after course ends
- 79 msgs in the alumni channel itself
- Purpose: ongoing community, networking, continued learning

### Jan 2026 ABM Cohort
- 17 participants
- Channel `bayesian-modeling-workshop-jan-2026` (417 msgs)
- Notable feedback (post-survey, from Sarah Bakanosky): Lucas had paid out of pocket, 10+ years DS experience — felt course was too textbook, not applied enough
- This feedback flagged for ABM course improvement

### Oct 2025 ABM Cohort
- Channel `applied-bayesian-modeling-workshop-october-2025` (483 msgs)
- High engagement: BrentRoth provided most technically advanced questions in any cohort (BART serialization, survival models, LOO-CV, non-parametric approaches)

### Feb 2026 BMA Cohort
- 22 participants
- Channel `bayesian-mktg-analytics-feb-2026` (101 msgs)
- Cohort intros available: Nazar Maidanenko (analytics lead, MMM background, F1 + crypto interests)

---

## 8. Key Quotes for Course Pages

### For ABM Course Page
- "This is busy breaking my brain" — participant, Oct 2025 ABM cohort (#workshop channel)
- "Do you know about this [PyMC do function]? Uhhh yeah time to rewrite some of my projects" — BrentRoth, Oct 2025 (showing practical learning impact)
- "This has been great!" — kyle, Oct 2025 ABM cohort
- Chris Fonnesbeck: "We probably need to introduce an advanced course someday!" (response to advanced learner questions)

### For BMA Course Page
- "77.7% rated experience Good or Excellent" — post-course survey, Feb 2026 cohort (9 respondents)
- "Thank you Ben! Very thorough answer!" — Jie Gao, Feb 2026 BMA cohort
- Nazar Maidanenko intro: "I've been building custom MMM solutions and recently diving deeper into causal inference."

### For CI Course Page
- "No existing course combines business-problem-first organisation, modern Bayesian tools (Bambi, CausalPy, PyMC), and comprehensive coverage across experiments, quasi-experiments, and observational methods." — Ben Vincent, 2026-02-17
- "I like that the section names are not tied to methods... but to business scenarios (like: Price Elasticity and Revenue Optimization)" — Juan Orduz, 2026-03-12
- Market ratings: Novelty 8/10, Likely interest 9/10, Pricing power 8/10

---

## 9. Operational Details

### Registration & Logistics (confirmed across cohorts)
- GitHub invite required (username to Sarah Bakanosky)
- Discord channel created per cohort
- Optional install session 2h before course start
- Promo codes for discounts (15% off standard; up to 50% for strategic leads)
- Certificates available post-course (LinkedIn shareable)
- 8-week recording access post-course
- Team rates available via [email protected]
- Invoice available via [email protected]

### Tools Required (confirmed)
- pixi (recommended for environment setup — faster than conda/mamba)
- Google Colab as fallback for Windows users
- Google Meet (live sessions)
- Discord (Q&A between sessions)
- GitHub (notebooks)

---

## 10. Sitemap Mapping Clarification

| Sitemap Entry | Maps To | Status |
|---------------|---------|--------|
| ABM Course | Applied Bayesian Modeling | Active, multiple cohorts completed |
| BMA Course | Bayesian Marketing Analytics | Active, Feb 2026 cohort completed |
| CI Course | TWO possible interpretations: (1) Applied Bayesian Regression Modeling (in development, March cohort cancelled) OR (2) upcoming "Applied Causal Inference for Business Impact" (planned May–Jun 2026, Ben Vincent leading) | ABRM is technically live on website; Causal Inference is in development |

<!-- GAP: Confirm which course "CI Course" maps to in the new sitemap — ABRM (already live) or the new causal inference course (coming May-Jun 2026) -->
