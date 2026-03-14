---
page: industries/sports-analytics
title: Sports Analytics
status: partial
sources:
  - analysis/discord-case-studies-extraction.md (Real Madrid, Dodgers sections)
  - analysis/discord-marketing-extraction.md
  - analysis/discord-sales-extraction.md
  - analysis/website-scrape/blog-index.md
  - analysis/website-scrape/team-members.md
  - analysis/halah-draft-scrape.md
  - content/industries/_overview.md
  - content/about/team-members/christopher-fonnesbeck.md
---

# Sports Analytics

<!-- GAP: No dedicated sports case study page on current site or Halah draft. LA Dodgers/Real Madrid have no published case study posts. No testimonials yet public. Much of this engagement detail is internal-only. -->

---

## Hero / Page Framing

### Tagline Options

**Option A — From Halah home hero rotating tagline:**
> "Bayesian Intelligence for Sports"
(rotates with Marketing / Finance / Pharma)
— Halah Joseph, Framer draft site, scraped 2026-03-13

**Option B — Thought leadership angle:**
Probabilistic models for sports analytics: from player performance to fan lifetime value. Where gut instinct meets rigorous uncertainty quantification.

**Option C — Blog-driven authority:**
PyMC Labs has published 5+ sports analytics blog posts spanning baseball, basketball, and hockey — demonstrating technical depth across sports domains.

---

## PyMC Labs' Relevance to Sports Analytics

### Founding Connection: Chris Fonnesbeck

PyMC Labs employs the **creator of PyMC** — Christopher Fonnesbeck — who spent **7 years in professional baseball research** with three MLB franchises:
- Philadelphia Phillies
- New York Yankees
- Milwaukee Brewers

Fonnesbeck's specializations include **Sports** (alongside Gaussian Processes, Time-Series, Teaching, Modeling).

> "The creator of PyMC and an Adjoint Associate Professor at the Vanderbilt University Medical Center, with 20 years of experience as a data scientist in academia, industry, and government, including 7 years in pro baseball research with the Philadelphia Phillies, New York Yankees, and Milwaukee Brewers."

— Christopher Fonnesbeck bio, https://www.pymc-labs.com/team/christopher-fonnesbeck/, scraped 2026-03-13

### Why Bayesian Methods Win in Sports

Sports analytics has the same structural problems Bayesian methods solve everywhere:
- **Small sample sizes** — early-season player performance, rare events (e.g., goalie save patterns)
- **Hierarchical structure** — players within teams within leagues, each borrowing statistical strength from peers
- **Uncertainty matters** — contract valuations and roster decisions require probability distributions, not point estimates
- **Prior knowledge is abundant** — career statistics, physical measurements, and domain heuristics are natural priors
- **Interpretability required** — coaching staff and GMs need explainable outputs, not black-box predictions

---

## Named Clients

### 1. Los Angeles Dodgers (MLB)

**Engagement type:** Time series analytics — SLA coaching ($5,000/month)
**Start date:** Contract signed June 2025
**Status:** Active EAP as of late 2025
**Lead team:** Chris Fonnesbeck (technical), Evan (AM)

**Background:**
Inbound referral through an internal connection who had worked at PyMC Labs and was client-side at the Dodgers. The Dodgers' analytics team needed **time series modeling assistance**.

**Contract negotiation detail (internal):**
The Dodgers initially required a full MLB exclusivity clause:
> "Throughout the term of this Agreement, Consultant shall not work with, consult for, or provide any services of any nature to, any professional baseball team other than Dodgers, including, without limitation, any Major League Baseball team or any Minor League Baseball team."

Thomas Wiecki (internal):
> "for $5k/mo they want exclusivity? that's insane"
— Thomas Wiecki, #dodgers Discord channel

Niall (internal humor):
> "If they take off their gloves in the outfield and learn how to catch properly, they can have exclusivity"
— Niall Oulton, #dodgers Discord channel

Evan (internal):
> "Hopefully just their admin and legal folks, and it'll be worth it once we start helping Ohtani with his swing"
— Evan, #dodgers Discord channel

**Resolution:** PyMC Labs accepted month-to-month exclusivity (no current competing baseball clients), negotiated for **logo usage rights** in exchange.

**Conversion note:** Sef M: "this is sold / converted! Congrats!" — #dodgers Discord, June 2025

**Technical scope:** Time series modeling (specific methods not disclosed in contracting channel).

<!-- GAP: No detailed technical narrative for Dodgers engagement. Contract signed but project content not captured in Discord extraction. -->

---

### 2. Real Madrid C.F. (La Liga / UEFA)

**Engagement type:** Customer Lifetime Value (CLV) + sports analytics — EAP engagement
**Engagement dates:** June–August 2025 (2-month initial EAP)
**Status:** Ended August 2025. Channel archived December 2025. No follow-up contract signed.
**Lead team:** Juan Orduz, Chris Fonnesbeck (technical), Pablo Roque (CLV model dev), Colt (CLV specialist), Evan (AM)

**Background:**
Real Madrid Football Club engaged PyMC Labs for:
1. **Fan/customer CLV modeling** using PyMC-Marketing BG/NBD and related models
2. **Football/player analytics** (sensor data, performance metrics) — intended for SOW 2
3. Hierarchical CLV models for fan cohort segments

**Why engagement ended:**
The football-side project was delayed due to **management change**: the Ancelotti → Xavi coaching transition required internal Real Madrid conversations about what the new regime wanted.

Chris Fonnesbeck (internal):
> "Sounds like the football side of the project is in a holding pattern due to the Ancelotti → Xavi coaching change. Sounds like there is still a lot of interest"
— Chris Fonnesbeck, #real-madrid Discord channel, 2025

Juan Orduz (internal):
> "August is kind of death in Spain [because of vacations]"
— Juan Orduz, #real-madrid Discord channel, 2025

Chris Fonnesbeck (on future opportunity):
> "I assume there is no word from Edo yet? The sensor data component seems a prime candidate to be exposed to the Decision.AI platform"
— Chris Fonnesbeck, #real-madrid Discord channel, September 2025

**Technical work completed:**
- CLV modeling using PyMC-Marketing `modified_beta_geo` (MBG/NBD) model
- Pablo Roque discovered MBG/NBD lacked covariate support → **wrote and merged PR #1815** to add covariate support to pymc-marketing MBG/NBD model (direct OSS contribution from client engagement)
- Hierarchical CLV models for RFM segment hierarchy under consideration
- Colt: "I've been contemplating experimenting with hierarchical support for RFM segments in the current CLV models"

**Future potential (not signed):**
- Player sensor data analytics
- Decision.AI platform exposure for football analytics
- SOW 2 with new coaching regime

<!-- GAP: No testimonial captured from Real Madrid. Engagement ended without public case study. Opportunity to revisit with new coaching regime. -->

---

## Use Cases for Sports Organizations

### 1. Fan / Customer Lifetime Value (CLV)
- **Problem:** Sports clubs have millions of fans across ticket buyers, merchandise, streaming, and loyalty programs. Predicting which fans will upgrade, churn, or expand spend is critical for revenue planning.
- **PyMC approach:** Probabilistic BG/NBD and Pareto/NBD models via pymc-marketing. Hierarchical models across fan cohort segments (season ticket holders vs. casual buyers vs. streaming-only).
- **Evidence:** Real Madrid engagement (CLV with covariate support added to pymc-marketing MBG/NBD)
- **Related product:** pymc-marketing CLV module (1M+ downloads)

### 2. Player Performance Modeling
- **Problem:** Player performance varies with age, injuries, team context, and small sample sizes — especially early in careers.
- **PyMC approach:** Hierarchical Bayesian models pool information across players with similar profiles. Credible intervals communicate genuine uncertainty to GMs and coaching staff.
- **Blog evidence:**
  - "Bayesian MARCEL: Probabilistic Baseball Player Projections with PyMC" ([/blog-posts/bayesian-marcel](https://www.pymc-labs.com/blog-posts/bayesian-marcel))
  - "Developing Hierarchical Models for Sports Analytics" — Chris Fonnesbeck, Sep 2023 ([/blog-posts/2023-09-15-Hierarchical-models-Chris-Fonnesbeck](https://www.pymc-labs.com/blog-posts/2023-09-15-Hierarchical-models-Chris-Fonnesbeck))
  - "Modeling Swinging Strikes with Bayesian Additive Regression Trees (BART)" ([/blog-posts/bayesian-additive-regression-tree-swinging-strikes](https://www.pymc-labs.com/blog-posts/bayesian-additive-regression-tree-swinging-strikes))

### 3. Spatial / Positional Analytics
- **Problem:** Player position, ball placement, and field zone data require spatial statistical models.
- **PyMC approach:** Bayesian spatial models using Gaussian Processes over 2D playing surfaces.
- **Blog evidence:** "Bayesian Spatial Modeling for Evaluating Hockey Goaltending Performance" ([/blog-posts/bayesian-spatial-modeling-for-evaluating-hockey-goaltending-performance](https://www.pymc-labs.com/blog-posts/bayesian-spatial-modeling-for-evaluating-hockey-goaltending-performance))

### 4. In-Game Decision Analytics / Officiating
- **Problem:** Referee/umpire behavior, foul calling patterns, and officiating consistency.
- **PyMC approach:** Item Response Theory (IRT) models for measuring latent consistency across officials.
- **Blog evidence:** "NBA Foul Analysis with Item Response Theory using PyMC" ([/blog-posts/03-xpost-ar-nba-irt](https://www.pymc-labs.com/blog-posts/03-xpost-ar-nba-irt))

### 5. Time Series Forecasting
- **Problem:** Injuries, game outcomes, player development trajectories all evolve over time with non-stationarity.
- **PyMC approach:** Bayesian time series models with Gaussian Process components for flexible trend modeling.
- **Evidence:** LA Dodgers engagement (time series coaching, $5k/month SLA)

### 6. Marketing Mix Modeling for Sports Organizations
- **Problem:** Sports clubs run multi-channel campaigns for ticket sales, merchandise, and subscriptions. MMM measures channel effectiveness.
- **PyMC approach:** Full pymc-marketing MMM suite + CLV + budget optimization.
- **Related crossover:** Live Nation (concert tour MMM — venue/ticketing adjacent), Fan engagement CLV at Real Madrid

### 7. Contract Valuation Under Uncertainty
- **Problem:** Multi-year contracts require forecasting player performance over an uncertain future.
- **PyMC approach:** Posterior predictive distributions for future performance scenarios; Monte Carlo contract value simulations.
<!-- GAP: No specific engagement evidence for contract valuation. Logical use case. -->

---

## Blog Content Inventory (5 Published Sports Posts)

All posts at https://www.pymc-labs.com/blog-posts/

| Title | Slug | Sport | Key Method |
|---|---|---|---|
| Developing Hierarchical Models for Sports Analytics | 2023-09-15-Hierarchical-models-Chris-Fonnesbeck | Multi-sport | Hierarchical Bayesian |
| NBA Foul Analysis with Item Response Theory using PyMC | 03-xpost-ar-nba-irt | Basketball | IRT |
| Bayesian MARCEL: Probabilistic Baseball Player Projections with PyMC | bayesian-marcel | Baseball | MARCEL projection system |
| Bayesian Spatial Modeling for Evaluating Hockey Goaltending Performance | bayesian-spatial-modeling-for-evaluating-hockey-goaltending-performance | Hockey | Spatial Bayesian / GP |
| Modeling Swinging Strikes with Bayesian Additive Regression Trees (BART) | bayesian-additive-regression-tree-swinging-strikes | Baseball | BART |

**Blog category filter:** Sports Analytics listed as a category on pymc-labs.com blog (via blog-index analysis)

**Content strategy note:** Sports analytics blog posts are part of the "OSS lead generator" strategy — driving organic search traffic from sports data scientists who become aware of PyMC capabilities.

---

## Key Team Member

### Christopher Fonnesbeck — Primary Sports Analytics Lead

- **Role:** Researcher / Principal
- **Background:** 7 years in MLB research (Phillies, Yankees, Brewers) + creator of PyMC
- **Specializations:** Sports, Time-Series, Gaussian Processes, Modeling, Teaching
- **Led:** Dodgers engagement (technical), Real Madrid engagement (technical)
- **Blog:** "Developing Hierarchical Models for Sports Analytics" (Sep 2023)
- **Profile:** https://www.pymc-labs.com/team/christopher-fonnesbeck/

---

## Positioning / ICP

**Buyer persona:** Director of Analytics / Head of Data Science at professional sports franchise
**Primary pain:** Player performance models with no uncertainty quantification; contract decisions based on point estimates; fan LTV modeling not connected to probabilistic churn

**From sales channel ICP table:**
> Director of Analytics — Performance uncertainty; contract decisions

**Competitive context:**
Sports analytics is not a crowded consulting market for Bayesian methods — most sports analytics work uses frequentist regression or simple ML. PyMC Labs offers rare combination of:
1. Domain credibility (Fonnesbeck's MLB background)
2. OSS track record (5 published sports analytics blog posts)
3. Proprietary Bayesian tooling (pymc-marketing CLV, BART models, spatial GPs)

<!-- GAP: No competitor names for sports analytics vertical specifically. -->

---

## Social Proof

<!-- GAP: No public testimonials from sports clients (Dodgers/Real Madrid). Contractual confidentiality likely for Dodgers (MLB exclusivity clause). Real Madrid engagement ended without case study. -->

**Available for use (generic, not sport-specific):**
- Halah draft home page: "Bayesian Intelligence for Sports" — sports is one of 4 named verticals

**Internal (not for publication):**
- Dodgers: converted from inbound referral; exclusivity accepted; active as of late 2025
- Real Madrid: "still a lot of interest" (post-Ancelotti departure)

---

## Cross-References

- **Team:** Chris Fonnesbeck → `content/about/team-members/christopher-fonnesbeck.md`
- **Services:** EAP as entry point for sports orgs → `content/services/strategy-advisory.md`
- **Solutions:** pymc-marketing CLV module (Real Madrid use case) → `content/resources/open-source-libraries.md`
- **Related case studies:** `content/case-studies/` (no dedicated sports case study files yet)
- **Blog posts:** All 5 sports posts indexed above
- **Industries overview:** `content/industries/_overview.md` (section 8)
