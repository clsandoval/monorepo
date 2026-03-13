# Website Crawl — Remaining Pages
**Aspect:** website-crawl-remaining
**Date:** 2026-03-13
**Sources:** sitemap-0.xml (92 URLs) + selective fetching of uncovered pages

---

## Sitemap Coverage Summary

Previously scraped pages:
- `/` → analysis/website-scrape/home.md ✓
- `/team` → analysis/website-scrape/about.md ✓
- `/team/{slug}` (32 pages) → analysis/website-scrape/team-members.md ✓
- `/contact` → analysis/website-scrape/contact.md ✓
- `/courses` + 3 course pages → analysis/website-scrape/courses.md ✓
- `/blog-posts` → analysis/website-scrape/blog-index.md ✓
- `/benchmark/LLMPriceIsRight` → analysis/website-scrape/resources.md ✓
- 10 case study blog posts → analysis/website-scrape/case-studies.md ✓

**New pages fetched this run:**
- `/blog-posts/expert-access-program` — EAP program details
- `/blog-posts/labs-principles` — company culture / org principles
- `/blog-posts/saving-the-world` — founding story (origin)
- `/blog-posts/the-ai-mmm-agent` — Decision AI product
- `/blog-posts/ai-mmm-agent-beta` — Decision AI beta access
- `/blog-posts/synthetic-consumers` — Simba/synthetic consumers overview
- `/blog-posts/synthetic-consumers-a-practical-guide` — practical methodology guide
- `/blog-posts/innovation-lab` — CPG Innovation Lab (agentic + synthetic consumers)
- `/blog-posts/causal-sales-analytics-discrete-choice-modeling` — Colgate case study part 2
- `/blog-posts/how-realistic-are-synthetic-consumers` — validation study (Allen Downey)
- `/blog-posts/from-uncertainty-to-insight-how-bayesian-data-science-can-transform-your-business` — general value prop

**Remaining uncovered (not relevant to new sitemap):**
- `/privacy-policy`, `/terms-and-conditions` — legal, not needed
- `/benchmark/LLMPriceIsRight/leaderboard` — JS-rendered, not fetchable via WebFetch; needs Playwright
- `/benchmark/LLMPriceIsRight/add-model` — model submission form
- `/blog-posts/filters/*` — JS-rendered filter pages
- ~60 individual blog posts (tutorials, cross-posts, etc.) — covered at index level in blog-index.md

---

## Expert Access Program (EAP)
**URL:** https://www.pymc-labs.com/blog-posts/expert-access-program
**Published:** August 26, 2025 | **Updated:** February 17, 2026

### Overview
PyMC Labs' ongoing engagement program for teams building advanced analytics models who need continuous expert guidance beyond initial project completion.

**Tagline (implied):** Ongoing expert guidance for teams with expertise gaps, without permanent headcount.

### Two-Tier Structure

**Base Package: Expert Lifeline**
- Direct expert communication channel (1 business day response priority)
- Growing library of implementation guides and best practices
- Access when roadblocks occur (diagnostics, sampling issues, modeling decisions)

**Pro Package: Deep Partnership & Strategic Guidance**
Everything in Base, plus:
- Bi-weekly coaching calls with domain-matched dedicated experts
- Bi-monthly Expert Exchange Sessions (case studies, emerging methods, industry trends)
- Priority access to new PyMC Labs tools and early feature previews
- Custom workshop development for specific modeling challenges
- Strategic consultation on measurement frameworks, analytics roadmaps, stakeholder alignment

### Target Audience
Teams that have completed projects with PyMC Labs (or independently) and need ongoing support. Addresses hiring gap: "Traditional consulting ends when projects finish; hiring is expensive and slow."

### Client Testimonials
- **Eugene Kwok, Fox Entertainment:** "The PyMC Labs Coaching program transformed our small Data Science team, enabling results matching a full-scale department. Sessions supported every delivery phase from research to deployment."
- **Nathan Kafi, Haleon:** "PyMC Labs significantly enhanced testing capabilities through Bayesian programming expertise. Their advisory role on feature requests and team training drove substantial operational improvements."
- **Kate Hirth, Fabletics:** "PyMC Labs implemented time-varying coefficients improving seasonality capture in marketing mix models. The team proved collaborative, insightful, and consistently supportive."

### Expert Perspectives on EAP
- **Juan Orduz:** "EAP provides actionable mentorship on statistical models for efficient decision-making while enabling PyMC to learn from real-world user needs."
- **Tim McWilliams:** "The collaborative nature helps clients overcome obstacles and build modeling confidence, creating sustained, impactful model development."
- **Daniel Saunders:** "Deep Bayesian expertise clears roadblocks consuming weeks, freeing client data scientists to focus on domain expertise."
- **Carlos Trujillo:** "Advanced statistical thinking bridges real-world decision-making, transforming uncertainty into clarity."
- **Teemu Säilynoja:** "Teaching fundamentals enables clients to diagnose and solve problems independently."
- **Bill Engels:** "The goal involves teaching clients model fundamentals so they can troubleshoot independently while collaborating on complex problems."
- **Kemble Fletcher:** "PyMC brings cross-disciplinary expertise spanning statistics, physics, engineering, economics, marketing analytics, neuroscience, programming, and business strategy."

### CTA
"Book a conversation with us here" → Calendly: calendly.com/niall-oulton

### New Clients Discovered
- **Fox Entertainment** (Eugene Kwok) — coaching program
- **Fabletics** (Kate Hirth) — MMM time-varying coefficients

---

## Labs Principles (Company Culture)
**URL:** https://www.pymc-labs.com/blog-posts/labs-principles
**Published:** January 10, 2022
**Author:** Thomas Wiecki
**Title:** "Building PyMC Labs: Five Principles from Open Source that Boost Innovation at any Company"

### Five Principles

**1. Freedom**
- Contractors paid hourly; flexible work arrangements
- Remote-only; work from anywhere
- Side projects welcomed; lifestyle-first
- "4 hours of inspired work outweighs 40 hours of routine tasks"

**2. Transparency**
- Standardized, formulaic compensation visible to all employees
- Base-rate + bonuses for PhDs or US-based living costs
- 50% profit distribution to employees
- All client contracts and values visible company-wide

**3. Autonomy & Self-Organization**
- Take initiative without seeking permission
- Communicate intent, not detailed instructions
- Emphasis on "why" over "how"

**4. Flexibility & Fluid Hierarchies**
- No permanent hierarchical roles
- Project leadership rotates based on suitability and motivation
- Easy restructuring; knowledge cross-pollination

**5. Leadership & Community**
- Leadership as coaching / removing blockers
- Inverted pyramid: senior people enable others
- Leader absorbs external stress to protect team enjoyment

### Org Framework Reference
References "Reinventing Organizations" by Frederic Laloux — PyMC Labs operates as a "Teal" organization (self-organizing with fluid hierarchies).

### Core Quote
"Work can not feel like work but has to feel like 'play'" — Thomas Wiecki

"What's better than working with friends on challenging problems in a fun environment?"

---

## Origin Story
**URL:** https://www.pymc-labs.com/blog-posts/saving-the-world
**Published:** February 18, 2021
**Author:** Thomas Wiecki
**Title:** "Introducing PyMC Labs"

### Founding Narrative
Thomas Wiecki left Quantopian in 2020. Received multiple consulting inquiries for PyMC3 models; unable to handle alone; assembled specialized team.

**Mission:** "Saving the world with Bayesian modeling" — addressing climate change, COVID-19, education, poverty.

### Original Team Description
- Three neuroscience PhDs
- Mathematicians
- Social scientists
- A SpaceX rocket scientist
- Host of the "Learning Bayesian Statistics" podcast (Alex Andorra)

### Early Clients (2021)
SpaceX, Roche, Netflix, Deliveroo, HelloFresh

**Project types:**
- Complex finance models
- Supply chain optimization (food delivery)
- Pharmaceutical software development
- Farm technology model enhancement
- Data science team training

### Key Stats (at founding)
- PyMC3 paper: 930+ citations; top 10 PeerJ most-cited articles
- 20+ active framework developers

### Key Quotes
- "Assembling a team of the most badass Bayesian modelers"
- "Most data science problems are not simple prediction but rather inference problems"
- "Rather than changing our problem to fit the solution...tailor the solution to best solve the problem at hand"

### Scientific Applications Cited
- COVID-19 spread prediction (Science journal)
- Exoplanet discovery
- Earthquake analysis
- Electoral/political forecasting

---

## The AI MMM Agent (Decision AI — Core Product)
**URL:** https://www.pymc-labs.com/blog-posts/the-ai-mmm-agent
**Published:** February 24, 2025 | **Updated:** November 27, 2025
**Author:** Luca Fiaschi
**Category:** Marketing Measurement

### What It Is
"The AI MMM Agent, An AI-Powered Shortcut to Bayesian Marketing Mix Insights"
An intelligent automation system that transforms raw spending data into strategic business insights in hours rather than months by leveraging PyMC-Marketing.

### Core Features

**Data Exploration:**
- Automated data access and cleaning
- Customized visualizations and diagnostics
- Insight discovery combining data science expertise with context awareness

**Model Configuration:**
- Automatic optimal model structure selection based on data characteristics
- Dynamic component selection (carryover, saturation, seasonality, time-varying baselines)
- Eliminates extensive manual coding

**Bayesian Inference:**
- Efficient sampling using PyMC methods
- GPU sampling optimization
- Linear-time adstock calculations

**Insight Delivery:**
- Interactive expert analysis translating posterior estimates into actionable recommendations
- Example output: "Facebook ads drove 20% of sales with 4.5× ROI. Consider shifting budget from print to Facebook"
- Real-time scenario testing

### Technical Capabilities
- Causal intelligence: incorporates control variables and causal DAGs; accounts for economic trends and competitive factors
- Experiment calibration: integrates lift test results directly into modeling; corrects for confounding
- Scenario integration with other agents (inventory management, sales promotion)

### Benefits by Audience
**For Data Scientists:** ~80% reduction in manual grunt work; instant scenario analysis; adaptive strategy adjustments
**For Executives:** Weekly budget updates instead of quarterly cycles; boardroom-ready recommendations without technical jargon

### Access
No pricing disclosed. "Contact us today to access this cutting-edge solution."

---

## AI MMM Agent BETA
**URL:** https://www.pymc-labs.com/blog-posts/ai-mmm-agent-beta
**Published:** November 7, 2025 | **Updated:** February 17, 2026
**Author:** PyMC Labs

### Beta Program Description
"Introducing the BETA Release of Our MMM Agent - Powered by PyMC-Marketing"
Turns "what used to be a multi-month modeling effort into an interactive, informative, and insightful workflow in hours."

**Target users:** Data scientists, media analysts, CMOs

### Core Features (Beta)
1. Automated data wrangling
2. Smart Bayesian modeling (auto-selects carryover, saturation, trend detection)
3. Instant scenario simulation — budget allocation what-if with ROI impact visualization
4. Causal analysis — experiments and interventions for causally robust recommendations

### Recent Improvements (Since Alpha)
- Inline code and charts in chat interface
- Persistent visualizations stored in MLflow
- Enhanced diagnostic and debugging capabilities

### Upcoming Features
- One-click summary deck generation
- Budget optimization agent
- Custom model priors and functions
- Causal DAG definition capability

### Access
Email: **[email protected]**

---

## Synthetic Consumers Overview
**URL:** https://www.pymc-labs.com/blog-posts/synthetic-consumers
**Published:** June 3, 2025 | **Updated:** February 3, 2026
**Authors:** Nina Rismal, Luca Fiaschi

### Core Concept
"AI-generated personas that simulate human consumer behavior" — enables experimentation and feedback collection at scale without recruiting human participants.

**Distinctions:**
- Not digital twins (those mirror specific real-world entities)
- Not synthetic respondents (broader term, not consumer-domain specific)
- Not human simulacra (no primary consumer research focus)

### Use Cases
1. Product testing: simulate reactions to new products/variants
2. Innovation screening: explore ideas, positioning, promising directions
3. Data augmentation: expand datasets with synthetic responses
4. Consumer insights: scalable, repeatable preference/behavior insights

### Performance
- Faster research cycles
- Lower costs for exploratory work
- Scale across concepts and segments

### Validation Approach
"Performance depends on alignment with human data and must be measured, not assumed."

### PyMC Labs Positioning
"Combining advanced Generative AI with science-based benchmarking" through "rigorous and transparent methods."

---

## Synthetic Consumers — Practical Guide
**URL:** https://www.pymc-labs.com/blog-posts/synthetic-consumers-a-practical-guide
**Published:** February 9, 2026 | **Updated:** March 6, 2026
**Authors:** Nina Rismal, Sangam Swadi K, Luca Fiaschi

### Key Metrics
- **Up to 90% alignment** with human survey data
- **85% distributional similarity** in concept and pricing studies
- Research cycles compressed from weeks to **under 24 hours**
- Market projection: synthetic data to represent **over 50% of market research inputs by 2027**

### Methodology Steps
1. **Data Foundation** — Real behavioral/demographic data from surveys, purchase histories, CRM records
2. **Persona Generation** — LLMs create digital personas with assigned characteristics
3. **Simulation Layer** — Personas tested in product evaluations, pricing studies, concept assessments
4. **Validation** — Benchmarked against human data using Bayesian techniques
5. **Iteration** — Continuous improvement through feedback loops

### Tools & Technologies
- **Semantic Similarity Rating (SSR)** — Converts free-text responses into Likert distributions using semantic embeddings
- **Retrieval-Augmented Generation (RAG)** — Improves contextual accuracy
- **Agentic search** — Extends synthetic consumer use to market prediction
- **ResponseRater class** — Python implementation for multi-scale validation
- **Polars library** — Data processing

### Use Cases
- Product testing and innovation
- Data augmentation for underrepresented demographic segments
- Pricing elasticity analysis (Ford Lumina case study)
- Concept ranking and evaluation
- B2B professional decision-maker simulation
- Diageo: tracked flavor preferences through online menus, reviews, social media for product innovation

### Strengths
- Quantitative accuracy in concept ranking
- Preservation of response variability
- Semantic coherence with interpretable rationales
- Demographic sensitivity and market segmentation
- Zero-shot deployment without training requirements

### Limitations
- Struggle with emotional and cultural nuances
- Sensitive to semantic anchor design and embedding choices
- Represent training-data patterns, not lived experience
- Inconsistent reproduction of subgroup effects (gender, regional)

### Note on "Simba"
No "Simba" product name mentioned in any synthetic consumers articles. Simba may be the internal/product name — needs Discord confirmation.

---

## Innovation Lab (CPG)
**URL:** https://www.pymc-labs.com/blog-posts/innovation-lab
**Published:** June 3, 2025 | **Updated:** February 3, 2026
**Author:** Nina Rismal
**Title:** "Rethinking Product Innovation: Agentic AI & Synthetic Consumers for CPG"

### What Is It
An integrated platform that combines synthetic consumers and agentic workflows to modernize CPG product development. Transforms slow, intuition-driven processes into evidence-based workflows.

### Services/Capabilities
1. **Intelligent Briefs** — Generated using trend data, competitive intelligence, historical performance
2. **AI Expert Evaluation** — Multi-agent review assessing feasibility, regulatory compliance, strategic alignment
3. **Design Refinement** — Multimodal iteration of visuals, colors, typography, messaging
4. **Synthetic Consumer Testing** — Rapid feedback on uniqueness, appeal, relevance, purchase intent
5. **Market Simulation** — Price sensitivity modeling, sizing forecasts, competitive scenario analysis

### Validation
- Tested with major international CPG brand
- Synthetic panel replication rate: **up to 90% alignment** with real consumer responses
- Study: hundreds of products, thousands of real consumer responses

### Future Roadmap
- Integration with MMM Insight Agent for closed-loop marketing optimization
- Expansion into creative asset testing

---

## Colgate-Palmolive — Causal Sales Analytics Part 2 (Discrete Choice Modeling)
**URL:** https://www.pymc-labs.com/blog-posts/causal-sales-analytics-discrete-choice-modeling
**Published:** October 17, 2025 | **Updated:** November 27, 2025
**Authors:** Benjamin Vincent, Ricardo Vieira
**Client:** Colgate-Palmolive

### Problem
Estimate whether new product sales were incremental (from competitors) or cannibalistic (from own products) in a saturated consumer goods market. Traditional interrupted time series models were inadequate.

### Approach

**Initial:** Simple Multinomial Discrete Choice Model
- Models sales as multinomial distribution
- Converts product utilities to choice probabilities via softmax
- Incorporates price and ACV (All Commodity Volume availability)
- Limitation: assumes independent unobserved preferences → unrealistic proportional substitution

**Advanced Solution:** Nested Logit Discrete Choice Model
- Organizes products hierarchically into "nests" (by segment, brand, etc.)
- Captures correlations in unobserved consumer preferences within nests
- Predicts preferential cannibalization among similar products
- Arbitrary hierarchy depths with numerical stability

**Math:** Combines marginal probability (choosing a nest) with conditional probability (product within nest)

### Data Structure
- Unbalanced panel data; weekly aggregated sales by product
- Variables: Price, ACV, date, brand, manufacturer, SKU
- Outcome: Sales volume (units sold, aggregated)

### Key Results
- Simple logit: captured general trends but failed to model realistic cannibalization
- Nested logit: improved posterior predictive fit; demonstrated preferential within-segment cannibalization; meaningful counterfactual scenarios
- PyMC Labs built **proprietary tooling** extending nested logit to arbitrary depth levels with maintained numerical stability + semi-automated prior specifications

### Technologies
PyMC, Python, Multinomial likelihood functions, Graphviz, Posterior predictive sampling

### Key Quotes
"Individual consumers consider a menu of options and choose that which maximizes their utility."
"This innovation represents a significant advancement in causal sales analytics, providing clients with powerful tools for better product launch decisions."

---

## How Realistic Are Synthetic Consumers (Validation Study)
**URL:** https://www.pymc-labs.com/blog-posts/how-realistic-are-synthetic-consumers
**Published:** June 3, 2025 | **Updated:** February 18, 2026
**Author:** Allen Downey
**Title:** "Can LLMs Replace Human Survey Respondents? Evaluating Synthetic Consumers on Political and Lifestyle Questions"

### Methodology
- **Data:** General Social Survey (GSS) — public US adult attitudes dataset
- **Tasks:** (1) Political party ID (7-point scale); (2) Daily TV hours (5 categories)
- **Evaluation metric:** Mean Absolute Error (MAE) across 100 randomly selected respondents
- **Benchmarks:** Naive baseline (always predicts median), Random forest (trained on 2-3k respondents), 5 frontier LLMs

### Models Tested
Larger: GPT-4o, GPT-o3-mini, Claude 3.7 Sonnet, DeepSeek R1 Distill, Gemini 2.0 Flash
Smaller: GPT-4o mini, Claude 3 Opus, Mixtral 8x7b, Meta Llama 3 8b Instruct

### Key Findings
| Finding | Implication |
|---------|------------|
| Large LLMs match random forest on party ID | LLMs encode valid demographic–behavior relationships |
| Performance degrades on less predictable tasks | Task predictability determines reliability |
| Model rankings shift between tasks | No single LLM dominates |
| Removing demographics collapses performance | Demographic grounding in prompts is essential |
| Smaller models underperform on average | Scale matters, but task fit also determines outcomes |

**GPT-o3-mini and Gemini 2.0 Flash "occasionally outperform the random forest"**
**DeepSeek R1 Distill consistently underperformed**
**Removing demographics → performance "collapsed consistently below naive baseline"**

### Conclusion
"Synthetic consumers based on LLMs have a lot of potential" — performance comparable to supervised ML on some tasks. Future: ensemble methods, failure case analysis, client-specific demographic panels.

---

## From Uncertainty to Insight (Value Prop Post)
**URL:** https://www.pymc-labs.com/blog-posts/from-uncertainty-to-insight-how-bayesian-data-science-can-transform-your-business
**Published:** September 25, 2023 | **Updated:** November 27, 2025
**Author:** Tiaan Van Der Merwe

### Core Value Proposition
Bayesian data science addresses: quantifying marketing value, predicting demand amid complexity, calculating prediction uncertainty, leveraging limited data sources.

### Key Differentiators vs. ML
- ML = "black box models" that resist interrogation
- Bayesian = "think before you fit" — requires explicit assumptions about data-generating process
- Bayesian advantages: prior knowledge integration, uncertainty quantification, causal inference, small data capability, hierarchical modeling

### Business Applications Cited
- Insurance: risk modeling for natural disasters, accident probability
- Healthcare: clinical trial design incorporating prior treatment knowledge
- Marketing: campaign effectiveness, customer behavior, budget allocation
- General: demand forecasting, fraud detection, churn prediction, recommendation systems, risk management

### Company Positioning
"Consulting services for Bayesian modeling expertise; worked with some of the world's leading brands; developed specialized marketing optimization products."

---

## Gaps Identified

<!-- GAP: `/benchmark/LLMPriceIsRight/leaderboard` — full leaderboard requires JavaScript; only fetched in static WebFetch. Use Playwright to capture full table. -->
<!-- GAP: "Simba" product name not confirmed in any web article — needs Discord channel mining to confirm product name and details -->
<!-- GAP: Fox Entertainment (Eugene Kwok) — new client from EAP post, no case study -->
<!-- GAP: Fabletics (Kate Hirth) — new client from EAP post, no case study -->
<!-- GAP: Full blog post content for ~60 posts not fetched — covered at index level only -->
<!-- GAP: `/blog-posts/filters/` pages are JS-rendered — category filter content not extractable via WebFetch -->
