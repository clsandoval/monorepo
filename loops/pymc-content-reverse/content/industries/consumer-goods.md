---
page: industries/consumer-goods
title: Consumer Goods (CPG / FMCG)
status: complete
sources:
  - analysis/discord-case-studies-extraction.md
  - analysis/discord-marketing-extraction.md
  - analysis/discord-sales-extraction.md
  - analysis/discord-partnerships-extraction.md
  - analysis/website-scrape/crawl-remaining.md
  - analysis/halah-draft-scrape.md
  - analysis/website-scrape/home.md
  - analysis/discord-simba-extraction.md
  - analysis/discord-decision-ai-extraction.md
---

# Consumer Goods (CPG / FMCG)

CPG is an explicit priority vertical with a dedicated GTM plan ("CPG-Offering-GTM" Notion doc, Niall Oulton, Nov 2025). The playbook combines Decision AI SaaS + managed services. Key problems: SKU complexity in shelf optimization, innovation pipeline lead time, cannibalization measurement, and the cost of traditional market research.

---

## Hero / Framing Options

### Option A — Innovation Lab framing (from live website)
**"Rethinking Product Innovation: Agentic AI & Synthetic Consumers for CPG"**
> "Transforms slow, intuition-driven processes into evidence-based workflows."

— Nina Rismal, /blog-posts/innovation-lab, June 2025

### Option B — Thomas founding insight
> "I continue to be surprised at the lack of sophistication at these places."

— Thomas Wiecki, #colgate-cannibalization Discord, 2023

### Option C — Ben Vincent positioning
> "We could lead the way in an area which possibly only exists locked down within large companies."

— Ben Vincent, #colgate-cannibalization Discord, 2023

### Option D — Competitive framing
Traditional market research (focus groups, panels, field studies) is too slow and too expensive for modern innovation cycles. AI-powered synthetic consumer testing cuts turnaround from weeks to under 24 hours — at 90% alignment with real consumer data.

---

## Why CPG / FMCG

### The Core Problems

**1. Shelf & SKU Complexity**
Global CPG brands manage thousands of SKUs across hundreds of retail partners. Answering "which products should be on which shelf to maximize revenue?" requires discrete choice modeling that captures cannibalization within brands and incrementality against competitors. Existing tools (e.g., Kantar RichMix) use outdated methods. PyMC Labs' nested logit DCM approach is more rigorous and custom-fit.

**2. Innovation Pipeline Lead Time**
Traditional concept testing (human panels, focus groups) takes weeks and costs substantial budgets. Synthetic consumers — AI-generated personas benchmarked against real human survey data — enable hundreds of concept tests in hours at a fraction of the cost.

**3. Cannibalization vs. Incrementality**
When a CPG company launches a new SKU, what percentage of sales is incremental vs. cannibalizing existing products vs. stealing from competitors? Standard interrupted time series models can't answer this. Bayesian discrete choice modeling with counterfactual inference can.

**4. MMM for Global Campaigns**
Measuring ROI across TV/digital/trade for global campaigns spanning dozens of markets requires hierarchical Bayesian models that can pool information across markets while respecting local differences.

### Thomas's Industry Assessment
> "I think no one is doing what we'd be doing... The chance that Apple is not analysing this is near zero. But all that DS knowledge is locked down and proprietary."

— Thomas Wiecki, #colgate-cannibalization Discord, 2023 (quoting Ben Vincent)

---

## Use Cases

1. **Synthetic Consumer Testing** — AI-generated personas simulate product reactions, pricing sensitivity, and concept ranking; replaces or augments slow/expensive human panels
2. **Shelf Optimization & Assortment Planning** — Nested logit discrete choice models predict sales impact of adding/removing SKUs; optimizes margin/revenue per shelf configuration
3. **Cannibalization & Incrementality Modeling** — Bayesian DCM quantifies how new product launches redistribute sales across own-brand vs. competitor SKUs
4. **Media Mix Modeling (MMM) for CPG** — Hierarchical Bayesian MMM across markets, channels, and seasonality; budget optimization with posterior uncertainty
5. **Innovation Lab Platform** — End-to-end agentic pipeline: brief generation → AI expert evaluation → synthetic consumer testing → market simulation → closed-loop MMM optimization
6. **Customer Lifetime Value (CLV)** — Purchase-frequency models for loyalty program design and retention marketing
7. **Pricing Elasticity Analysis** — Bayesian models for price sensitivity across consumer segments

---

## Named Clients

### Colgate-Palmolive (Primary CPG Client)
Three separate engagements — longest active client relationship in CPG.

#### Engagement 1: Cannibalization Modeling (SOW 1, 2023)
**Problem:** Colgate needed probabilistic measurement of cannibalization when launching new toothpaste SKUs. Three "innovation horizons" (minor variant / new variant / new category entry) expected different incrementality. Existing model by Fractal.ai was fundamentally flawed — wrong priors, wrong sampling, poor causal structure.

**Team:** Ben Vincent (lead), Luciano, Bill, Maxim, Adrian, Christian, Ricardo, Thomas

**Technical Approach:**
- Bayesian Multinomial Logit (Discrete Choice Model) with `log_softmax` / Categorical likelihood
- ZeroSumNormal priors for product utilities
- Distribution (% ACV) as product availability mask
- Customer preference heterogeneity via Mixed Logit (LKJ Cholesky covariance)
- Innovation type (horizon) as predictor in utility function
- Counterfactual inference: "if this product had not been launched, what would sales have been?"
- Data: Nielsen market-level data (~5 years), ~25 SKUs per model run, 50 markets

**Results:**
- Probabilistic cannibalization estimates per SKU introduction delivered
- Colgate ran model internally after delivery
- Contract value: ~$485K total (multi-phase)
- Colgate signed Master Services Agreement (MSA) for ongoing relationship — unusual; normally just SOWs

> "Their current model is awful... Their modelling approach is fundamentally flawed: they did not reason very much about causal relations, they did not think about adequate observational distributions."

— Luciano, #colgate-cannibalization Discord, 2023 (on Fractal.ai's existing model)

#### Engagement 2: Shelf Optimization (SOW 2, ~18 months, 2023–2025)
**Problem:** Which Colgate products should be on shelves at which retailers to maximize margin/revenue? Three model objectives: (1) predict baseline unit sales, (2) predict sales with increased distribution, (3) predict impact of introducing a new-to-market item.

**Benchmark:** Kantar's RichMix assortment optimization tool

**Technical Approach:**
- Nested Discrete Choice Model (Nested Logit / DCM) — Bayesian in PyMC
- Partial pooling over product descriptions (item → description → brand hierarchy)
- Distribution (% ACV) as availability mask with log-utility adjustment
- ZeroSumNormal priors for identifiability
- GPU sampling: nutpie+JAX — **4 chains in 6 hours total** vs. 10+ hours per chain without GPU
- Optimization layer: recommend products to add/remove to maximize predicted revenue
- Custom Python package (`colgate-shelf-sow2`) delivered

**Results:**
- Partial pooling model significantly outperformed complete pooling
- Full optimization notebook suite (30+ notebooks) delivered
- Client (Steve) ran model hands-on internally
- Project completed April 2025

> "nutpie with GPU was excellent! I managed to sample 4 chains in 6 hours total instead of 10 hours per chain"

— Luciano, #colgate-shelf-optim Discord, 2024

> "With the correct indexing, the concentration parameter comes out large (as we expected) and the predictions are much more accurate and certain!"

— Luciano, #colgate-shelf-optim Discord, 2024

**Published case study:** "Causal Sales Analytics: Discrete Choice Modeling" (Benjamin Vincent & Ricardo Vieira, pymc-labs.com, October 17, 2025)
- Simple logit → captured general trends but failed to model realistic cannibalization
- Nested logit → improved posterior predictive fit; demonstrated preferential within-segment cannibalization; meaningful counterfactual scenarios
- PyMC Labs built **proprietary tooling** extending nested logit to arbitrary depth levels with numerical stability + semi-automated prior specifications

#### Engagement 3: Synthetic Consumers (ongoing)
**Published case study:** Halah draft site + live website testimonial

> "At Colgate-Palmolive, we really value the relationship we've built with PyMC Labs. They continue to deliver truly unmatched quality work on the hardest and most cutting edge problems we encounter. Their blend of deep Bayesian expertise, GenAI, and domain knowledge makes them an essential partner for delivering innovative, practical, and impactful solutions."

— **Iraklis Pappas, Global Head of AI, Colgate-Palmolive**
(source: https://www.pymc-labs.com/, scraped 2026-03-13)

**Synthetic Consumers Stats (Colgate engagement):**
- Study: hundreds of products, thousands of real consumer responses
- Synthetic panel replication rate: **up to 90% alignment** with real consumer responses
- 9,000+ synthetic responses generated in Halah draft narrative
- **SSR method** (Semantic Similarity Rating): converts free-text responses into Likert distributions using semantic embeddings

**From Halah draft case study:**
> "Colgate used synthetic consumers to test product concepts. PyMC Labs validated the results with 90% reliability across 9K synthetic responses — at a fraction of the time and cost of traditional panels."

---

### Procter & Gamble
- EAP (Expert Access Program) client
- Corporate workshop client
- Named in sales as reference for CPG/pharma prospects
- Listed in early client roster in marketing extraction

<!-- GAP: No case study or engagement narrative found for P&G. No named contact. Workshop content and EAP scope unknown. -->

---

### Bain / The Coca-Cola Company — Fuelight 360 (2024–present)
**Structure:** Three-party subcontract: TCCC → Bain & Company → PyMC Labs (exclusive technical/modeling partner)

**Product:** Fuelight 360 — production Bayesian MMM system running across US, GB, and Brazil markets
- Active model versions (Aug 2025): US sellout v413, GB sellout v382, BR sellout v59
- Public repo: `github.com/The-Coca-Cola-Company/tccc-dna-marketing-mai-fuelight360`

**Technical Approach:**
- Hierarchical Bayesian MMM using PyMC-Marketing components
- Infrastructure: Azure ML / Synapse
- PyTensor-compiled budget optimizer: < 5 second solve time on 2,000 posterior draws
- Multi-market hierarchical structure (US / GB / BR)
- In-person workshop at Coca-Cola HQ, Atlanta (Jan–Feb 2024)

**Team (SOW 1):** Niall, Will Dean, Carlos Trujillo, Ulf Aslak

**Revenue:**
- SOW 1: $400,000 / 10 weeks / 4 people (Jan 2024)
- Combined Fuelight 360 + Red Cities budget: **$3.25 million** (Niall, Sep 2024)
- By Jan 2026: Bain engagement at **$550–600k/month** (includes all Bain work)

> "Coca Cola just gave feedback to Bain and said we've really sent the A-team on this one from both a tech and analytics standpoint."

— Niall Oulton, #bain-brand Discord, February 2024

> "We stressed to Coca-Cola that we are ONE team (TCCC, Bain and PyMC) — we have not been talking about a 'Bain team' and a 'PyMC team' — we are using the talk track of one analytics team."

— Niall Oulton, #bain-brand Discord, January 2024

---

### Bain / Yum! Brands
- Bain subcontract (same partnership structure as TCCC)
- Named in partnerships extraction

<!-- GAP: No engagement details, project scope, or timeline found for Yum! Brands. -->

---

### Nomad Foods
- Simba MMM platform evaluation + MMM Insight Agent RFP demo
- Internal note: "in with a pretty good chance"
- Frozen foods CPG brand (Birds Eye, Findus, etc.)

<!-- GAP: RFP outcome unknown. No named contact or engagement details. -->

---

### Diageo
- Synthetic consumers use case: tracked flavor preferences through online menus, reviews, and social media for product innovation
- Named in Synthetic Consumers Practical Guide blog post (Feb 9, 2026)

<!-- GAP: Engagement type (client project vs. illustrative example) not confirmed. -->

---

### Nestle LATAM
- Inbound lead (qualified)
- Named in sales extraction CPG section

<!-- GAP: No conversion, contact, or engagement scope documented. -->

---

### Unilever Prestige
- Fivetran shared client
- Named in partnerships extraction

<!-- GAP: Engagement type and scope unknown. -->

---

## Products & Solutions for CPG

### 1. Synthetic Consumers Platform (Innovation Lab CPG)
**URL:** https://www.pymc-labs.com/blog-posts/innovation-lab
**Published:** June 2025 (updated Feb 2026)

End-to-end agentic pipeline for CPG product development:
1. **Intelligent Briefs** — Generated using trend data, competitive intelligence, historical performance
2. **AI Expert Evaluation** — Multi-agent review: feasibility, regulatory compliance, strategic alignment
3. **Design Refinement** — Multimodal iteration of visuals, colors, typography, messaging
4. **Synthetic Consumer Testing** — Rapid feedback on uniqueness, appeal, relevance, purchase intent
5. **Market Simulation** — Price sensitivity modeling, sizing forecasts, competitive scenario analysis

**Future roadmap:** Integration with MMM Insight Agent for closed-loop marketing optimization; expansion into creative asset testing.

**Key metrics:**
- Up to **90% alignment** with human survey data
- **85% distributional similarity** in concept and pricing studies
- Research cycles: weeks → **under 24 hours**
- Market projection: synthetic data to represent **over 50% of market research inputs by 2027**

**SSR (Semantic Similarity Rating) methodology:**
> Core innovation: converts free-text LLM responses into numeric Likert-scale distributions using semantic embeddings. Enables rigorous benchmarking of AI responses against human survey data.

— Source: pymc-labs/semantic-similarity-rating GitHub (130★)

**Validation study:** Allen Downey benchmarked 9 frontier LLMs against GSS (General Social Survey) human data. GPT-o3-mini and Gemini 2.0 Flash "occasionally outperform the random forest" baseline. Large LLMs match random forest performance on high-predictability tasks.

### 2. Shelf Optimization Tooling (Custom / Proprietary)
- Nested Logit DCM implemented in PyMC
- Arbitrary hierarchy depth with numerical stability
- Semi-automated prior specifications
- Custom Python package delivery model
- GPU-accelerated sampling (nutpie+JAX)

### 3. MMM Insight Agent / Decision AI
- AI-powered MMM for CPG global marketing
- Used in Fuelight 360 (Coca-Cola) + Nomad Foods RFP demo
- Turns weeks of modeling into hours
- See `content/solutions/decision-ai.md`

### 4. Simba MMM Platform
- SaaS MMM for managed services clients
- Evaluated by Nomad Foods (RFP)
- See `content/solutions/simba.md`

---

## Blog Content (CPG-Relevant)

| Title | URL | Date | Focus |
|---|---|---|---|
| Rethinking Product Innovation: Agentic AI & Synthetic Consumers for CPG | /blog-posts/innovation-lab | Jun 2025 | Innovation Lab platform overview |
| Synthetic Consumers Overview | /blog-posts/synthetic-consumers | Jun 2025 | Core concept + use cases |
| Synthetic Consumers — A Practical Guide | /blog-posts/synthetic-consumers-a-practical-guide | Feb 2026 | Methodology, metrics, tools |
| How Realistic Are Synthetic Consumers? | /blog-posts/how-realistic-are-synthetic-consumers | Jun 2025 | Allen Downey validation study |
| Causal Sales Analytics: Discrete Choice Modeling | /blog-posts/causal-sales-analytics-discrete-choice-modeling | Oct 2025 | Colgate cannibalization case study |
| From Uncertainty to Insight | /blog-posts/from-uncertainty-to-insight | Sep 2023 | General Bayesian value prop |

---

## Social Proof / Pull Quotes

**Primary (homepage-featured):**
> "At Colgate-Palmolive, we really value the relationship we've built with PyMC Labs. They continue to deliver truly unmatched quality work on the hardest and most cutting edge problems we encounter. Their blend of deep Bayesian expertise, GenAI, and domain knowledge makes them an essential partner for delivering innovative, practical, and impactful solutions."

— **Iraklis Pappas, Global Head of AI, Colgate-Palmolive**

**Enterprise credibility (Bain/Coca-Cola):**
> "Coca Cola just gave feedback to Bain and said we've really sent the A-team on this one from both a tech and analytics standpoint."

— Niall Oulton, internal, #bain-brand Discord, February 2024

**Methodology positioning (Thomas):**
> "I think no one is doing what we'd be doing... I continue to be surprised at the lack of sophistication at these places."

— Thomas Wiecki, #colgate-cannibalization Discord, 2023

---

## Competitive Positioning for CPG

| Competitor | Weakness | PyMC Labs Advantage |
|---|---|---|
| Kantar RichMix | Static assortment tool; limited to pre-set models | Custom nested logit; arbitrary hierarchy; full uncertainty quantification |
| Fractal.ai (Colgate's prior vendor) | Fundamentally flawed priors, no causal structure, wrong constraints | Principled Bayesian causal DAG approach; proper uncertainty |
| Traditional focus groups / panels | Weeks of lead time; expensive; limited scale | Synthetic consumers: <24h, 90% alignment, pennies per response |
| Excel-based MMM | No uncertainty; aggregated markets; no out-of-sample validation | Hierarchical Bayesian; posterior-informed budget optimization |

**Key differentiator (from Halah FAQ):**
> "Bayesian AI lets us build models that are transparent about uncertainty, combine expert knowledge with data, and update as new information comes in — the opposite of black-box ML."

---

## ICP for CPG

**Buyer persona:** VP of Data / Global Head of AI / Director of Analytics
**Company profile:** Global CPG brand with dedicated internal DS team hitting limits on model sophistication
**Primary pain points:**
- Existing shelf optimization tools are black-box and inflexible
- Traditional consumer research is too slow for fast innovation cycles
- Cannot measure true incrementality of new SKU launches
- In-house DS team has PyMC experience but needs Bayesian expertise at frontier edge

**GTM note (Niall, Nov 2025):** Dedicated "CPG-Offering-GTM" plan combines Decision AI SaaS pilot + managed services. Initial entry via EAP or scoping project, then expand to Decision AI subscription.

---

## Stats for CPG Page

| Stat | Number | Source |
|---|---|---|
| Synthetic consumer alignment with human data | Up to 90% | crawl-remaining.md, Feb 2026 |
| Distributional similarity in concept/pricing studies | 85% | crawl-remaining.md, Feb 2026 |
| Research cycle compression | Weeks → <24 hours | crawl-remaining.md, Feb 2026 |
| Market projection: synthetic data as % of research inputs | >50% by 2027 | crawl-remaining.md, Feb 2026 |
| Shelf optimization GPU speedup | 4 chains in 6 hours total vs. 10+ hours per chain | case-studies-extraction.md, 2024 |
| Colgate Cannibalization contract value | ~$485K (multi-phase SOW) | case-studies-extraction.md, 2023 |
| Bain/Coca-Cola combined budget | $3.25 million | partnerships-extraction.md, 2024 |

---

## Case Studies Cross-References

- **Colgate cannibalization/incrementality:** → `content/case-studies/colgate-cannibalization.md`
- **Colgate shelf optimization:** → `content/case-studies/colgate-shelf-optimization.md`
- **Colgate synthetic consumers:** → `content/case-studies/colgate-synthetic-consumers.md`
- **Swarovski (Luxury Retail / Consumer Goods crossover):** → `content/case-studies/swarovski.md` (also in `content/industries/retail-ecommerce.md`)
- **Haleon (Consumer Healthcare):** → `content/case-studies/haleon.md` (also in `content/industries/pharma-biotech.md`)
- **Fuelight 360/Coca-Cola:** → confidential (no public case study; Bain is client-facing)

---

## Service Cross-References

- **Custom models + tooling:** `content/services/solution-delivery.md`
- **Strategy & advisory (EAP):** `content/services/strategy-advisory.md`
- **Embedded Teams:** `content/services/embedded-teams.md` (Colgate team ran models independently after delivery)
- **Decision AI SaaS:** `content/solutions/decision-ai.md`
- **Simba:** `content/solutions/simba.md`

---

<!-- GAP: P&G engagement details (workshop topic, EAP scope, named contact) not found -->
<!-- GAP: Yum! Brands engagement scope/timeline not documented -->
<!-- GAP: Nomad Foods RFP outcome unknown (Simba + Insight Agent demo) -->
<!-- GAP: Diageo status — client engagement vs. illustrative reference in blog post unclear -->
<!-- GAP: Unilever Prestige engagement scope unknown (Fivetran shared client only) -->
<!-- GAP: No Bain/Coca-Cola public case study — confidential subcontract structure -->
<!-- GAP: CPG-Offering-GTM Notion doc by Niall (Nov 2025) — full content not accessed -->
