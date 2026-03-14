---
page: industries/_overview
title: Industries Overview
status: complete
sources:
  - analysis/discord-marketing-extraction.md
  - analysis/discord-sales-extraction.md
  - analysis/discord-case-studies-extraction.md
  - analysis/halah-draft-scrape.md
  - analysis/website-scrape/home.md
  - analysis/discord-competition-extraction.md
---

# Industries Overview

This page bridges the sitemap's 8 industry verticals with raw material for populating
each industry landing page. Also covers cross-cutting positioning, the origin story of
PyMC Labs' industry focus, and the client roster organized by vertical.

---

## Hero / Top-of-Page Options

### Option A — Halah FAQ copy (polished, reusable)
> "We solve high-stakes problems across diverse sectors, including Pharma (clinical trials),
> Aerospace (reliability), Marketing (MMM/CLV), and Finance (risk). While our methods are
> universal, our experience spans from Fortune 500 giants to pioneering startups like SpaceX."

— Halah Joseph, #sales FAQ copy, 2026-01-16

### Option B — Rotating tagline (from Halah home page draft)
**"Bayesian Intelligence for [Marketing / Finance / Pharma / Sports]"**
(JS-animated word rotation on Framer home hero)

### Option C — Thomas's founding insight
> "on a call this morning which 🤯 my mind: we basically have clients in two industries:
> 1. marketing (appodeal, GT, twitch, hellofresh, sweeplift, resident), and
> 2. biotech (indigo, erisyon, roche, p&g, akili)"

— Thomas Wiecki, #marketing, 2022-01-25

---

## Why Industry Pages Exist

The new sitemap adds industry pages for the first time. Context from internal discussions:

- **ICP signal:** companies with in-house DS capability hitting limits (Luca, #sales, 2026-03-05)
- **Buyer variance:** CMO/VP Marketing vs. Head of Data Science vs. CDAO — industries shape buyer persona
- **GTM specificity:** Dedicated CPG GTM plan written by Niall (Notion "CPG-Offering-GTM", Nov 2025)
- **Social proof alignment:** clients want to see industry peers on the website before engaging

Thomas:
> "I always thought that we need to somehow delineate Bayes vs ML. But in reality, I don't think I
> encountered this on a single sales call where ML was even a consideration. Instead, our competition
> is intuitive-based human decision making and Excel spreadsheets."

— Thomas Wiecki, #sales, 2023-04-21

---

## Industry Roster (Sitemap-Mapped)

### 1. Marketing & Media

**PyMC relevance:**
Media Mix Modeling (MMM) is the primary commercial flagship. MMM emerged from the HelloFresh
engagement (2021) and became a public offering with pymc-marketing launch (~April 2023).

**Use cases:**
- Media Mix Modeling (MMM) — attribution across TV/Social/Search/Digital
- Customer Lifetime Value (CLV) — probabilistic, cohort-aware models
- A/B testing / Bayesian experimentation (vectorized / high-volume)
- Marketing budget optimization (posterior uncertainty-aware)
- Attribution modeling (cookieless, privacy-first)

**Key insight (Thomas, 2021-05-17):**
> "he said that as cookies are going away, a lot of marketing companies are not quite sure how to
> do this. he thinks that Bayes is the answer as it allows to cross-link different data sets.
> I think marketing could be the field ripe for Bayesian disruption."

**Named clients:**
- **HelloFresh** — MMM + A/B testing (60x speed, saturation curves; → case study page)
- **Ovative Group** — pymc-marketing for custom MMMs across multiple clients; Tim McWilliams testimonial
- **Gain Theory** — MMM (named in early client roster + partnership mentions)
- **Fox Broadcasting Company** — EAP client; Eugene Kwok testimonial
- **NBCUniversal** — inbound lead; MMM Pricing Deck sent
- **CNN, Bloomberg, Audible** — inbound leads
- **Live Nation** — inbound lead
- **Appodeal** — early client (mobile ad attribution)
- **Sweeplift** — early client
- **Twitch** — early client

**Social proof pull quote (Tim McWilliams, Ovative Group — on pymc-marketing):**
> "At Ovative Group, PyMC-Marketing is our go-to for building custom MMMs. Its flexibility and
> customizability let us tailor robust models to each client's needs. It's a powerful tool that
> helps us deliver deeper insights and smarter media strategies."

— Tim McWilliams, Sr. Manager Data Science, Ovative Group
(source: https://www.pymc-labs.com/, scraped 2026-03-13)

**Content file:** `content/industries/marketing-media.md`

---

### 2. Retail & E-Commerce

**PyMC relevance:**
High-volume transaction data + multi-channel marketing + seasonal complexity = ideal Bayesian
use case. MMM, CLV, demand forecasting, and inventory optimization.

**Use cases:**
- MMM for multi-brand, multi-region retailers
- CLV modeling with probabilistic churn estimates
- Demand forecasting with uncertainty quantification
- A/B / holdout test analysis
- Personalization model development

**Named clients:**
- **HelloFresh** — meal-kit delivery; flagship case study
- **Wegmans** — multiple SOWs; MAPE 13-14%; Databricks shared client
- **L.L. Bean** — EAP client; cited as retail reference in sales
- **TechStyle** — e-commerce; corporate workshop client + Simba trial
- **Lidl** — Databricks shared client
- **Panera** — inbound retail lead
- **Decathlon** — inbound retail lead
- **Zalando, ASOS, Marks & Spencer, Just Eat Takeaway** — inbound leads
- **Walmart** — direct-to-CMO team; noted as "massive scaling potential" inbound
- **Nomad Foods** — Simba + Insight Agent RFP demo; "in with a pretty good chance"

**Key stat:** Wegmans MAPE 13-14% (demand forecasting)

**Content file:** `content/industries/retail-ecommerce.md`

---

### 3. Consumer Goods (CPG / FMCG)

**PyMC relevance:**
CPG is an explicit priority vertical with dedicated GTM plan. Problems: MMM across SKU
complexity, synthetic consumer testing for innovation, shelf placement optimization, causal
sales analytics, discrete choice modeling.

**Use cases:**
- Media Mix Modeling for global CPG campaigns
- Synthetic consumer research (AI personas vs. human panels)
- Shelf optimization & discrete choice modeling
- CLV / purchase frequency modeling
- Causal sales attribution (incremental revenue)

**Dedicated GTM:** "CPG-Offering-GTM" Notion doc by Niall (Nov 2025) — combines Decision AI
SaaS + managed services for CPG clients.

**Named clients:**
- **Colgate-Palmolive** — synthetic consumers (SSR method, 90% reliability, 9K+ responses) + shelf optimization (nested logit); Iraklis Pappas testimonial
- **Procter & Gamble** — EAP client; corporate workshop client; CPG reference
- **Unilever Prestige** — Fivetran shared client
- **Nestle LATAM** — inbound lead
- **Nomad Foods** — Simba + Insight Agent RFP demo
- **Bain/Coca-Cola Fuelight 360** — production MMM system; US/GB/BR markets; $3.25M combined budget
- **Bain/Yum! Brands** — Bain sub-contract

**Pull quote (Iraklis Pappas, Colgate-Palmolive):**
> "At Colgate-Palmolive, we really value the relationship we've built with PyMC Labs. They continue
> to deliver truly unmatched quality work on the hardest and most cutting edge problems we encounter.
> Their blend of deep Bayesian expertise, GenAI, and domain knowledge makes them an essential partner
> for delivering innovative, practical, and impactful solutions."

— Iraklis Pappas, Global Head of AI, Colgate-Palmolive
(source: https://www.pymc-labs.com/, scraped 2026-03-13)

**Content file:** `content/industries/consumer-goods.md`

---

### 4. Pharma / Biotech

**PyMC relevance:**
One of the original two industry verticals (Thomas, Jan 2022). Pharma requires interpretability,
uncertainty quantification, and regulatory defensibility that Bayesian methods provide natively.
Clinical trial modeling, drug response, patient outcomes.

**Thomas (2022-01-30, paraphrased):**
> "biotech requires interpretability; Bayesian methods provide it naturally. Healthcare, pharma,
> and agriculture all need to explain their predictions, not just make them."

**Blog headline (Halah, 2025-11-28):**
> "Bayesian Modeling: The Missing Layer in Pharma Data Analysis"

**Use cases:**
- Clinical trial analysis (hierarchical Bayesian models)
- Biomarker / treatment effect estimation
- Drug response / patient outcome modeling
- Pharmacokinetics / pharmacodynamics
- Regulatory-defensible uncertainty quantification
- Digital therapeutics (cognitive modeling)
- Survey / sentiment analysis for patient research

**Named clients:**
- **Roche** — 34K parameters, 250K observations, ~1hr inference; hierarchical Bayesian models
- **Akili Interactive** — cognitive modeling for digital therapeutics (video-game-based ADHD treatment); Titi Alailima testimonial
- **Erisyon** — biotech; early client (sequencing data)
- **Haleon** — EAP client; Nathan Kafi testimonial; "in-house model struggling to scale"
- **Syngenta** — EAP reference for agriculture/pharma
- **Takeda** — pharma; inbound leads (multiple contacts)
- **Novartis** — inbound lead (Thomas had connections through Moderna)
- **IQVIA** — corporate workshop client

**Pull quote (Titi Alailima, Akili):**
> "We wanted to be able to draw some big conclusions out of a big set of data. So, that's why we
> came to PyMC Labs for help. It was very successful collaboration. I've had many, many consultants
> working with in the past, and I think this is by far the most successful Collaboration that I've seen."

— Titi Alailima, MSE, VP of Applied Data, Akili Interactive
(source: https://www.pymc-labs.com/, scraped 2026-03-13)

**Pull quote (Nathan Kafi, Haleon):**
> "PyMC Labs has significantly enhanced our testing capabilities by leveraging the full power of
> Bayesian programming, maximizing the potential of the PyMC software. Their advisory role in
> delivering new feature requests and training our team has been invaluable, driving substantial
> improvements in our operations."

— Nathan Kafi, Principal Data Scientist, Haleon
(source: https://www.pymc-labs.com/, scraped 2026-03-13)

**Content file:** `content/industries/pharma-biotech.md`

---

### 5. Agriculture

**PyMC relevance:**
Agriculture is treated as a sub-vertical under Pharma/Biotech in some framings but gets
its own sitemap page. Core use case: field trial analysis with high environmental noise —
Bayesian causal models for treatment effect estimation under uncertainty. Precision agriculture
applications.

**Use cases:**
- Field trial analysis (causal Bayesian, treatment effects)
- Crop yield modeling / prediction
- Spatial Gaussian Process models for yield variation
- Precision agriculture decision support
- Sustainability / carbon sequestration modeling

**Named clients:**
- **Indigo Ag** — primary case study; hierarchical causal Bayesian models for field trials; spatial GP; Manu Martinet testimonial; Embedded Teams delivery; "high environmental and experimental noise"
- **Syngenta** — EAP client; pharma + agriculture crossover

**From Indigo Discord channel:**
Project involved spatial Gaussian Process modeling for field-level treatment effect estimation.
Indigo operates the "Indigo Carbon" program — a soil carbon credit marketplace requiring
statistically rigorous measurement of crop interventions at scale.

**Pull quote (Manu Martinet, Indigo):**
> "I have some solid basis, but I'd say like, I'm sort of like random data scientist, not an expert
> in Bayesian AI statistics and so, there was so much that i could do by myself. I was able to set
> up an initial model and get some interesting results and get buy-in internally to go further and
> that's where additional expertise. It was very helpful to get the model to the finish line and
> to production."

— Manu Martinet, PhD, Lead Data Scientist, Indigo Ag
(source: https://www.pymc-labs.com/, scraped 2026-03-13)

**Content file:** `content/industries/agriculture.md`

---

### 6. Finance / Insurance

**PyMC relevance:**
Quantitative finance, insurance pricing, risk modeling, causal investing. Bayesian methods
provide principled uncertainty quantification for risk decisions. Early client Everysk was
a PE/quant finance application.

**Use cases:**
- Portfolio risk modeling / uncertainty quantification
- Insurance pricing / actuarial models
- Algorithmic trading / quant strategy
- CLV for financial services
- Causal DAG modeling for investment strategies
- MMM for financial services marketing
- Credit risk / default probability models

**Named clients:**
- **Everysk** — PE benchmark index modeling; quant finance; early client (2020–2021); blog case study
- **Nürnberger Versicherung** — insurance; extended EAP model; cited as finance reference
- **Bondora** — fintech; inbound lead
- **Schwab** — corporate workshop client; logo requires prior written consent
- **BNP Paribas** — inbound lead; MMM Pricing Deck sent
- **Swisscard** — inbound lead
- **KBC** — inbound lead
- **Ethos Life** — inbound lead (insurance/fintech)
- **VisualVest** — robo-advisor; MMM; quote "not so common in consulting to challenge us"
- **PayPal** — inbound lead
- **Chicago Trading Company** — inbound lead (quant trading)

**Blog post (March 2026):** Causal DAG / Bayesian investing blog by Thomas Wiecki

**Content file:** `content/industries/finance-insurance.md`

---

### 7. Gaming

**PyMC relevance:**
Mobile gaming and AAA gaming studios use probabilistic modeling for player LTV, ad revenue
optimization, churn prediction, A/B testing at scale, and synthetic player research.

**Use cases:**
- Player / user LTV (CLV) modeling
- Advertising attribution & MMM for games
- A/B testing at massive scale
- Churn prediction with uncertainty
- Synthetic player/consumer research
- In-app purchase (IAP) optimization
- Ad creative performance modeling

**Named clients:**
- **Supercell** — mobile gaming (Clash of Clans, Brawl Stars); Databricks shared client; inbound
- **Appodeal** — mobile ad mediation; early client (2021–2022); ad attribution modeling
- **Luca Fiaschi blog (Nov 2025):** "LLM ad creative" on Mobile Dev Memo — gaming adjacent

**Industry context:**
Supercell is one of the most data-driven gaming studios in the world. Databricks partnership
includes Supercell as a shared client (from partnerships extraction). Appodeal was one of
PyMC Labs' early clients when the studio was building its marketing analytics offering.

<!-- GAP: No dedicated Gaming case study found. Supercell/Appodeal client narratives not fully extracted from Discord. Need to check if there are specific Discord channels for these clients. -->

**Content file:** `content/industries/gaming.md`

---

### 8. Sports Analytics

**PyMC relevance:**
Sports analytics emerged as a blog-driven vertical (~2023–2026). Bayesian methods enable
player performance modeling with principled uncertainty, injury risk, contract valuation.
Two major sports franchises are named clients.

**Use cases:**
- Player performance modeling (hierarchical Bayesian)
- Injury risk probability models
- Contract valuation under uncertainty
- Venue / fan revenue forecasting
- Betting / odds modeling
- Scouting / draft model development
- In-game strategy optimization

**Named clients:**
- **LA Dodgers** — named client; cited as sports analytics credibility reference in sales
- **Real Madrid C.F.** — named client; cited alongside Dodgers for sports credibility
- See also: **Supercell** (gaming/esports crossover)

**Blog evidence:**
- "Bayesian Spatial Modeling for Evaluating Hockey Goaltending Performance" — Halah draft blog, Jan 15 2026
- Sports analytics ~5 blog posts indexed in blog index scrape
- Sports Analytics listed as a blog category on pymc-labs.com

**Internal note (Thomas, 2022):**
Blog posts on sports have consistently driven organic traffic and social shares;
part of "OSS lead generator" strategy.

<!-- GAP: No dedicated Sports case study page confirmed. LA Dodgers and Real Madrid have no case study pages on current site or Halah draft. Narrative details for these engagements not found in extracted channels. -->

**Content file:** `content/industries/sports-analytics.md`

---

## Cross-Cutting Themes for All Industry Pages

### The Universal Bayesian Value Proposition
(to adapt per industry)

1. **Uncertainty is native** — "Instead of treating analysis as a one-off answer, we build models
   that update as new information comes in — just like people naturally do."
   — Halah, #sales elevator pitch, 2025-09-03

2. **Domain knowledge + data** — "Bayesian AI, on the other hand, lets us build models that are
   transparent about uncertainty, combine expert knowledge with data, and update as new
   information comes in."
   — Halah, #sales long pitch, 2025-09-03

3. **Interpretable to regulators/executives** — needed in pharma, finance, agriculture; implied
   in marketing (CMO dashboards)

4. **Less data required** — "greater accuracy while requiring significantly less data than
   conventional Machine Learning techniques"
   — website home, scraped 2026-03-13

5. **Open-source foundation** — "our competition is intuitive-based human decision making and
   Excel spreadsheets" (Thomas) — not ML; this is a Bayesian vs. status-quo story

### ICP Signals by Industry

| Industry | Buyer Persona | Primary Pain Point |
|---|---|---|
| Marketing & Media | CMO / VP Marketing / VP Data | Attribution loss post-cookie; MMM too slow |
| Retail | Head of Data Science | Demand forecasting noise; inventory uncertainty |
| Consumer Goods | VP Data / Global Head of AI | Innovation lead time; SKU complexity |
| Pharma / Biotech | Lead DS / VP Data | Interpretability for regulation; trial uncertainty |
| Agriculture | Lead DS / Research Scientist | Field trial noise; treatment effect estimation |
| Finance / Insurance | Quant / Risk Officer | Risk quantification; actuarial precision |
| Gaming | VP Data / Growth Lead | Player LTV; ad attribution at scale |
| Sports Analytics | Director of Analytics | Performance uncertainty; contract decisions |

### Pricing Signals for Industry Pages

All internal / do not publish. Cross-reference: `content/services/strategy-advisory.md` for EAP pricing.

- EAP Base: $5,000–$8,500/month (foot in door for all industries)
- CPG/Retail: dedicated Decision AI SaaS pilot $10k–$50k/month (Nomad RFP, NBCU deck)
- Pharma: scoping projects €40,000–€70,000 range (banking/insurance reference; pharma similar)

### Competitor Framing by Industry

| Industry | Primary Competitor | PyMC Differentiator |
|---|---|---|
| Marketing/Media | Meridian (Google), Robyn (Meta), Recast | Open-source, flexible, 2x–20x faster, out-of-sample |
| Retail | Excel / internal DS teams | Production-grade uncertainty, MAPE improvement |
| Consumer Goods | Traditional market research (focus groups) | 90% reliability at fraction of cost + time |
| Finance | Stan / Pyro / internal quant models | PyMC ecosystem + consulting = faster delivery |
| All | Accenture / McKinsey / BCG | "If they do Accenture they will come back in 2 years to fix the mess" |

---

## Client Count Reference

**Halah draft stat placeholder:** "Industries Served" (animated from 0 — actual number not set)
**Brand deck claim:** "100+ enterprise clients" (unverified; treat as marketing claim)

From sales channel and Discord:
- Named clients with active/completed engagements: ~25–30
- Named inbound leads (qualified, not all converted): 70+
- Partners with co-delivery clients: Bain (enterprise scale)

---

## Cross-References

- Each industry page should reference relevant case studies: `content/case-studies/{name}.md`
- Services relevant to all industries: `content/services/_overview.md`
- Solutions with industry fit: Simba (Marketing/Retail/CPG) → `content/solutions/simba.md`;
  Decision AI (Marketing/CPG/Retail) → `content/solutions/decision-ai.md`
- EAP as industry-agnostic entry point: `content/services/strategy-advisory.md`
