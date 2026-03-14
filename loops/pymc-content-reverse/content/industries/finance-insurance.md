---
page: industries/finance-insurance
title: Finance & Insurance
status: partial
sources:
  - analysis/discord-case-studies-extraction.md
  - analysis/website-scrape/case-studies.md
  - analysis/discord-sales-extraction.md
  - analysis/discord-marketing-extraction.md
  - analysis/discord-competition-extraction.md
  - analysis/discord-partnerships-extraction.md
  - analysis/website-scrape/crawl-remaining.md
  - analysis/public/press.md
  - content/industries/_overview.md
---

# Finance & Insurance

## Page Purpose

Industry landing page for Finance & Insurance vertical. Target buyers: Quant Analysts, Risk Officers, Chief Risk Officers, VP of Data, CDAO, Head of Actuarial Science. Demonstrates PyMC Labs' credibility solving high-stakes financial modeling problems where uncertainty quantification is not optional — it's legally and commercially required.

---

## Hero Section

### Option A — From Halah FAQ (polished, reusable)
> "We solve high-stakes problems across diverse sectors, including Pharma (clinical trials), Aerospace (reliability), **Marketing (MMM/CLV), and Finance (risk)**. While our methods are universal, our experience spans from Fortune 500 giants to pioneering startups like SpaceX."

— Halah Joseph, #sales FAQ copy, 2026-01-16

### Option B — Rotating tagline (Halah home hero)
**"Bayesian Intelligence for [Finance / Marketing / Pharma / Sports]"**
(JS-animated rotation on Framer home hero — Finance is one of the four rotating sectors)

### Option C — Positioning framing (Thomas, internal)
> "we have quant finance clients and we'd be happy to talk to them about the value we're driving there by giving them unique modeling approaches no one else has"

— Thomas Wiecki, #sales, 2025-02-03

### Option D — Conference signal
Thomas Wiecki delivered **keynote at Insurance Data Science conference, June 2021** — early establishment of Finance/Insurance credibility.
(source: analysis/discord-marketing-extraction.md — conference table)

---

## Why Bayesian for Finance & Insurance

### Core Value Proposition

Finance and insurance decisions are fundamentally about **uncertainty over future outcomes** — portfolio risk, default probability, policy pricing, reserve adequacy. Bayesian methods make uncertainty first-class, not an afterthought.

From PyMC Labs' universal value proposition (Halah, #sales, 2025-09-03):
> "Bayesian AI lets us build models that are transparent about uncertainty, combine expert knowledge with data, and update as new information comes in."

### Finance-Specific Bayesian Advantages

1. **Full posterior over risk** — Not just "20% probability of default" but the full distribution, enabling expected loss AND tail risk in one model.
2. **Interpretable to regulators** — Regulators (SR 11-7, IFRS 9, Solvency II) require model explainability. Black-box ML fails regulatory validation; Bayesian models pass.
3. **Small-N problems** — Private equity, structured credit, and specialty insurance have sparse historical data. Bayesian priors let domain expertise fill gaps.
4. **Domain knowledge injection** — Actuarial tables, expert judgment, and structural assumptions can be encoded as priors — not discarded.
5. **Principled credible intervals** — For capital allocation and reserve calculations, intervals from a Bayesian model have valid probabilistic interpretation.

### From the Everysk Case Study
> "How can we figure out the unknown from the things we know? The answer lies with Bayesian Statistics."

— PyMC Labs team, Everysk case study, 2021-02-25

---

## Use Cases

### 1. Private Equity / Venture Capital Index Modeling
- Estimate returns from capital cash flows (no transaction-based prices)
- Time-varying value-added factor estimation
- Alignment with Cambridge Associates benchmarks
- **Reference:** Everysk engagement (Ravin Kumar, 2021)

### 2. Customer Lifetime Value (CLV) for Financial Services
- Contractual CLV: robo-advisors, wealth management, subscription banking
- Shifted Beta-Geometric (SBG) survival model for churn + variable payment amounts (% of AUM)
- Posterior predictive: lifetime value, expected fee, total value distributions
- Streamlit dashboard for interactive CLV exploration
- **Reference:** VisualVest engagement (Ben Vincent / Christian / Tomi, 2022–2023)

### 3. Insurance Risk Modeling
- Hierarchical Bayesian models for insurance risk pricing
- Biweekly SLA coaching model — client team upskilled on Bayesian actuarial methods
- **Reference:** Nürnberger Versicherung (Niall + Teemu Säilynoja, started May 2025)

### 4. Marketing Mix Modeling for Financial Services
- Attribution for bank/insurance marketing channels (TV, digital, branch promotions)
- Bayesian MMM provides uncertainty-aware budget allocation
- Banking/insurance MMM scoping: €40,000–€70,000 range (from sales signals)
- **Reference:** MMM Pricing Deck sent to BNP Paribas (Kemble, 2024-09-25)

### 5. Portfolio Risk / Quantitative Strategy
- Causal DAG modeling for investment strategies (Thomas Wiecki blog, March 2026)
- Algorithmic trading / quant strategy uncertainty quantification
- Credit risk / default probability models
- **Reference:** Chicago Trading Company (inbound lead); Causal DAG blog post (Camilo, March 2026)

### 6. Causal Inference for Financial Analytics
- Interrupted time series and causal impact for policy/product changes
- CausalPy: quasi-experimental methods (Regression Discontinuity, DiD, Synthetic Control)
- **Reference:** CausalPy OSS project; applicable to rate changes, product launches, regulatory events

---

## Named Clients

### Everysk — PE Index Modeling ★ Published Case Study
**Industry:** Finance / Investment Management
**Engagement:** Custom Bayesian project, 2020–2021
**Project Lead:** Ravin Kumar (PyMC Labs co-founder)

**Problem:** Estimate private equity (specifically VC) returns from capital cash flow data. Unlike liquid equities, private equity lacks transaction-based performance benchmarks. Client needed statistical estimation of time-varying value-added factors.

**Approach:**
- Joint scoping with alignment on technical and business perspectives
- Review of existing code + reference paper
- Week of exploratory data analysis
- Initial Bayesian model development → improvements beyond reference paper (upgraded samplers)
- Philosophy: **interpretability over predictive accuracy**

**Results:**
- Bayesian VC index from capital flow data
- Index aligned with Cambridge Associates VC Index benchmarks
- Cumulative return visualizations (US stocks vs. modeled VC vs. Cambridge benchmark)

**Published case study:** https://www.pymc-labs.com/blog-posts/everysk (published 2021-02-25)

---

### VisualVest — CLV for Robo-Investment Platform ★ Named Client
**Industry:** FinTech / Robo-Investing / Wealth Management (Germany)
**Engagement:** Custom project, SOW 1 + SOW 2 (2022–2023)
**Team:** Christian (lead researcher), Tomi, Ben Vincent (advisor), Thomas Wiecki (PM), Larry, Ricardo

**Problem:**
- CLV for contractual customers whose payment = % of account balance (not fixed subscription)
- Shifted Beta Geometric (SBG) model needed modification for variable payment amounts
- GDPR constraint: data must not be stored in US

Ben Vincent: *"The standard SBG model treats income as a fixed quantity (like a subscription) but this will not be accurate here — we need to modify the basic model"*
— Discord, case study extraction

**Technical Approach:**
- Modified SBG survival model for variable AUM-based payments
- Hierarchical individual-level churn parameters: Logit GLM → θ per customer
- Censoring handled explicitly in likelihood
- Bernstein polynomial approach explored (Adrian)
- Non-hierarchical Geometric model delivered (more stable than hierarchical)
- Posterior predictive: lifetime, fee, and total value for future customers
- Streamlit dashboard built for interactive CLV exploration

**Results:**
- SOW 1 delivered November 2022
- SOW 2 signed for extended model with covariates
- Client (David): *"what we did is actually lots of work"* (internal appreciation)
- Blog post + webinar collaboration discussed

**Key testimonial signal:**
> "They really appreciated that we went a step further after the first 'final model'. They say it's not so common in consulting services (to challenge/keep improving something that's 'final')."

— Tomi's notes from post-SOW1 call with David (VisualVest), Discord case study extraction

> "David repeats all the time that we're very transparent, honest, and always looking to get the best result."

— Tomi, Discord case study extraction

---

### Nürnberger Versicherung — Insurance Analytics SLA ★ Active Client
**Industry:** Insurance / Financial Services (Germany)
**Engagement:** SLA/coaching (started May 2025, active)
**Team:** Niall (lead), Teemu Säilynoja (researcher), Sef M (account)

**Problem:** Bayesian statistical consulting for insurance risk modeling and probabilistic forecasting.

**Engagement Model:**
- SLA/coaching format
- Bayesian hierarchical models for insurance risk
- Biweekly calls with technical Q&A support

**Status:** Active SLA as of 2025–2026.

<!-- GAP: No specific results or testimonial from Nürnberger available in extracted Discord. Niall is lead. -->

---

### Charles Schwab — Corporate Workshop Client ★ Logo Requires Consent
**Industry:** Financial Services / Brokerage
**Engagement:** Corporate workshop
**Note:** Logo usage requires prior written consent (per #website Discord, Oct 2023 legal discussion)

<!-- GAP: Workshop topic, date, and results not found in extracted channels. Schwab listed as workshop reference in sales/training material. -->

---

### BNP Paribas — Inbound Lead (Prospect)
**Industry:** Global Banking
**Status:** MMM Pricing Deck sent (Kemble, Sep 2025)
**Note:** In sales pipeline as of late 2025; conversion status unknown

<!-- GAP: BNP Paribas conversion outcome unknown. -->

---

### Other Finance / Insurance Named Prospects
(from `analysis/discord-sales-extraction.md` — inbound leads, finance/insurance category)

| Company | Type | Signal |
|---------|------|--------|
| **Bondora** | FinTech / P2P Lending | Inbound lead |
| **Swisscard** | Credit Cards (UBS/AmEx JV, Switzerland) | Inbound lead |
| **KBC** | Belgian bank/insurer | Inbound lead |
| **Ethos Life** | InsurTech (life insurance) | Inbound lead |
| **PayPal** | Payments / FinTech | Inbound lead |
| **Chicago Trading Company** | Proprietary quant trading | Inbound lead |

---

## Blog & Content Evidence

### Published Finance Content
- **Everysk case study:** https://www.pymc-labs.com/blog-posts/everysk (2021-02-25) — PE index from capital cash flows
- **"Causal DAG + Functional Form for quant investing"** — Camilo, March 2026 (from `analysis/discord-marketing-extraction.md` blog index)

### Conference Appearances (Finance-Specific)
- **Insurance Data Science Conference** — Thomas Wiecki, keynote, June 2021
  (source: discord-marketing-extraction.md conference table)
- **QWAFAFEW** — conference mentioned as lead source for finance prospects (discord-sales-extraction.md)

<!-- GAP: Need URLs/recording for Insurance Data Science keynote and Causal DAG blog post -->

---

## Buyer Personas & ICP

### Primary Buyer
**Quant / Risk Officer** — needs probability distributions over outcomes, not point estimates. Regulatory defensibility (SR 11-7, Solvency II, IFRS 9 context) a key buying signal.

### Secondary Buyer
**Head of Data Science (Finance)** — hitting limits of frequentist/ML approaches for uncertainty-heavy problems. May have Stan background; upgrading to PyMC.

### ICP Signal (from Luca, #sales, 2026-03-05):
> "Our audience is companies that have some level of analytics and data science capabilities. They are interested in internalizing these capabilities."

### Pain Points Specific to Finance/Insurance
1. Black-box ML models fail regulatory validation (SR 11-7, model risk management)
2. Excel/Actuarial tables can't handle complex, multi-factor risk interactions
3. In-house DS team can build models but uncertainty quantification is ad hoc
4. Private equity / alternative asset valuation has no standard methodology
5. Insurance pricing relies on outdated actuarial assumptions; modern data available but modeling lagging
6. Bayesian transition from Stan/JAGS — know the concept, stuck on implementation

---

## Competitive Positioning for Finance

### vs. Traditional Quant / Actuarial Tools
> "our competition is intuitive-based human decision making and Excel spreadsheets"
— Thomas Wiecki, #sales, 2023-04-21

**PyMC differentiator vs. internal quant teams:** Faster delivery via PyMC ecosystem + consulting. Speed of implementation, not just modeling quality.

**Competitive framing (from `content/industries/_overview.md`):**
> Finance: Stan / Pyro / internal quant models → PyMC ecosystem + consulting = faster delivery

### vs. Large Consulting Firms (Accenture, McKinsey, Oliver Wyman)
> "If they do Accenture they will come back in two years to fix the mess anyway."
— Juan Orduz, #sales, 2024-12-04

### Unique OSS Credibility Angle (Thomas, #sales, 2025-02-03):
> "we have quant finance clients and we'd be happy to talk to them about the value we're driving there by giving them unique modeling approaches no one else has"

---

## Products & Solutions for Finance

### Expert Access Program (EAP) — Primary Entry
- **Base (Expert Lifeline):** Expert advisory, dedicated Discord channel, 24h response, named seats
- **Pro (Deep Partnership):** Extended hours, hands-on work, strategic advisory
- Typical rate: $5,000–$8,500/month; Nürnberger model = extended SLA
- Hands-on code work billed at $385/hour separately

### Custom Project Engagements
- Flat-fee SOW structure; delivered working model + documentation
- VisualVest: SOW 1 + SOW 2; Everysk: single SOW
- Scoping for banking/insurance MMM: €40,000–€70,000 range (sales signal)

### CausalPy (OSS)
Quasi-experimental methods applicable to financial analytics:
- Regression Discontinuity (for policy/rate changes)
- Difference-in-Differences (for product launches)
- Synthetic Control (portfolio comparison)
- 1,123★ on GitHub; v0.8.0 released March 2026

### pymc-marketing (OSS → Managed Services)
- MMM for financial services marketing attribution
- CLV modeling (SBG + BG/NBD models built in)
- 1,088★; 1M+ downloads

---

## Social Proof & Testimonials

### VisualVest (strongest finance testimonial signal)
> "They really appreciated that we went a step further after the first 'final model'. They say it's not so common in consulting services (to challenge/keep improving something that's 'final')."

— Tomi's notes from post-SOW1 call with David (VisualVest client), Discord case study extraction, 2022

> "David repeats all the time that we're very transparent, honest, and always looking to get the best result."

— Tomi, Discord case study extraction

> "He mentions he sees the tremendous amount of work we put here. Even though the final result may look simple, he values the process a lot."

— Tomi, Discord case study extraction

**Context:** VisualVest is a German robo-investment platform (innovation lab structure — "they want to do all the innovative things and show it to the world").

<!-- GAP: No direct quote from David (VisualVest client) captured verbatim — all quotes are Tomi's paraphrase from post-SOW call notes. A direct testimonial from VisualVest would be ideal here. -->

### From Homepage Testimonials (cross-reference)
Homepage testimonials do not include a finance client. Finance/Insurance needs a direct testimonial for this industry page.

<!-- GAP: No finance client testimonial on current website. VisualVest paraphrase is strongest signal but not a direct quote. Nürnberger too new. Everysk case study predates homepage testimonial structure. -->

---

## Page Structure Recommendation

```
Hero
  └─ Headline: "Bayesian Intelligence for Finance & Insurance"
  └─ Subheadline: Risk decisions under uncertainty require honest models.
  └─ CTA: "Talk to a Bayesian Expert"

Why Bayesian for Finance (3-column icons)
  ├─ Full posterior distributions — not point estimates
  ├─ Interpretable to regulators — auditable, SR 11-7 compatible
  └─ Works with sparse data — encode domain knowledge as priors

Use Cases (cards with icons)
  ├─ Private Equity / VC Index Modeling
  ├─ Customer Lifetime Value (CLV)
  ├─ Insurance Risk Pricing
  ├─ Marketing Mix Modeling (FS marketing)
  └─ Causal Inference for Finance

Case Studies
  └─ Everysk — Bayesian PE Index (published blog post)
  └─ VisualVest — CLV for Robo-Advisor (unpublished — case study writeup needed)
  └─ Nürnberger — Insurance Analytics SLA (active)

Client Logos
  └─ Everysk, VisualVest, Nürnberger Versicherung, Schwab (with consent)

Testimonial
  └─ VisualVest paraphrase (or seek direct quote from David/Lars)
  <!-- GAP: Direct finance testimonial needed -->

CTA
  └─ "Start with Expert Access" / "Talk to our quant finance team"
```

---

## Cross-References

- `content/services/strategy-advisory.md` — EAP as primary entry for finance clients
- `content/services/solution-delivery.md` — custom CLV/risk models
- `content/resources/open-source-libraries.md` — CausalPy, pymc-marketing
- `content/case-studies/everysk.md` — published case study (needs to be assembled)
- `content/case-studies/visualvest.md` — unpublished case study (client narrative available)

---

## Gaps

<!-- GAP: No direct testimonial from a finance/insurance client on the website. VisualVest paraphrase is best available. Reaching out to David (VisualVest) for a direct quote would fill this gap. -->
<!-- GAP: Nürnberger engagement details are sparse — no specific results, no testimonial, just "active SLA started May 2025." -->
<!-- GAP: BNP Paribas, Bondora, Swisscard, KBC — all inbound leads with unknown conversion status. -->
<!-- GAP: Chicago Trading Company (quant trading inbound) — scope and status unknown. -->
<!-- GAP: Thomas's Insurance Data Science keynote (Jun 2021) — no recording URL found. -->
<!-- GAP: "Causal DAG + Functional Form for quant investing" blog (Camilo, March 2026) — URL not yet published/available. -->
<!-- GAP: Schwab workshop topic, date, scope not captured. -->
