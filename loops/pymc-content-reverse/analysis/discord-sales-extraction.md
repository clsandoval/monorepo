# Discord Sales Extraction — PyMC Labs

Sources:
- `inbound-leads` channel (ID: 748522210091859978) — 3,815 msgs, 2020-08-27 → 2026-03-12
- `💁│sales` channel (ID: 1062705105872355370) — 1,043 msgs, 2023-01-11 → 2026-03-09

Date extracted: 2026-03-13

---

## 1. Why Clients Choose PyMC Labs

### OSS-to-Consulting Pipeline (Primary)
The dominant inbound pattern: leads already using PyMC, get stuck or want to scale, find PyMC Labs as the obvious expert.

- HelloFresh MMM case study and blog posts explicitly cited by Amtrak, American Express, Just Eat Takeaway, ASOS, VisualVest, and multiple marketing agency contacts
- Thomas: "Robyn and LWMMM are among our best sales channels" — frustrated users of Google/Meta's free tools sought paid help
- pymc-marketing GitHub stars mined for leads: "I created a repo for this. We can have same concepts for people creating issues, PRs, comments, reacting... starredAt already there." — Will Dean (UTC-4), 2025-01-08

### Named Lead Sources (with evidence)
1. **PyMC OSS / GitHub reputation** — most common
2. **HelloFresh case study / blog posts** — explicit citations from multiple companies
3. **Conference talks** — PyData, QWAFAFEW, ODSC East
4. **pymc-marketing book-a-call widget** — direct website conversion
5. **LinkedIn inbound** — especially after team member interviews posted
6. **Learning Bayesian Statistics podcast** — Alexandre's show drives inbound
7. **Personal referrals** from existing clients
8. **Meridian / Robyn frustration** — competitors became referral source

> "As things happen that build ones credibility (and nothing builds credibility like other peoples' recommendations) it attracts leads like crazy... got two good marketing leads in one week after my Labs interview went up."
— Ulf Aslak, #sales, 2024-11-19

---

## 2. Client Pain Points

### Technical Pain Points
- **Bayesian transition**: moving from frequentist/Stan to PyMC; don't know how
- **Scaling existing models**: have a working model, can't take it to production or new markets
- **Lack of in-house Bayesian expertise**: know they need it, can't hire it
- **Explainability / uncertainty quantification**: black-box ML not acceptable to stakeholders
- **MMM complexity**: open-source packages don't handle their edge cases
- **Dirty / sparse data**: non-standard data requiring bespoke modeling
- **Internal buy-in**: need outside validation to convince leadership

### Organizational Pain Points
- **In-house DS team gets bogged down / stuck**: need fractional senior expertise
> "value prop is also speed. In-house DS get bogged down or stuck, we help them develop, troubleshoot, and implement much faster"
— Evan (UTC -5), #sales, 2024-12-04

- **In-house model built but struggling to scale**:
> "Part of me thinks that we probably have a network of EAPs where they have a good in-house model but struggling to scale it. e.g Haleon is one we know for sure"
— Niall, #sales, 2025-11-24

### Top 5 Questions Heard From Sales Enquiries (compiled by Halah for website design)
> "1. Which industries do you specialize in?
> 2. Do you offer full technical implementation or just Advisory?
> 3. Can you help us optimize our existing models?
> 4. Can you provide training and workshop tailored to our company?
> 5. Can we hire your team to work alongside our internal staff?"
— Halah, #sales, 2026-01-16

---

## 3. Positioning & Value Propositions Used in Sales

### Core Philosophical Framing

**Competition is Excel / human intuition** (Thomas, foundational insight):
> "I always thought that we need to somehow delineate Bayes vs ML. But in reality, I don't think I encountered this on a single sales call where ML was even a consideration. Instead, our competition is intuitive-based human decision making and Excel spreadsheets. So I think it's helpful to think of arguments against that. One obvious one... is that human decision making is very biased. We're completely against that: we believe in a rigorous scientific approach that uses data and statistics to make optimal decisions."
— Thomas (UTC+7), #sales, 2023-04-21

**Insight-selling frame:**
> "Is the thing we're selling *insight* into your data? And (Bayesian) modeling provides the deepest level of insight."
— Thomas (UTC+7), #sales, 2023-04-24

**Tomi's structured pitch:**
> "* Companies have problems
> * Sometimes they have data
> * Often the data contain information that can help to solve the problem
> * We're great at understanding complex problems and getting insights from data through a combination of techniques including mathematical (bayesian) modeling which provides the deepest level of insight."
— Tomi (UTC-3), #sales, 2023-04-24

### Tested Elevator Pitches

**Halah's short version (Sept 2025, for networking events):**
> "PyMC Labs is a data science consultancy that specializes in Bayesian AI. In plain terms, we help organizations continuously learn from data. Instead of treating analysis as a one-off answer, we build models that update as new information comes in — just like people naturally do."
— Halah, #sales, 2025-09-03

**Halah's long version:**
> "PyMC Labs is a data science consultancy that specializes in Bayesian AI. What that means is we help organizations make smarter, more reliable decisions when the future is uncertain. Traditional analytics and machine learning often gives you a black-box prediction with little room for nuance. Bayesian AI, on the other hand, lets us build models that are transparent about uncertainty, combine expert knowledge with data, and update as new information comes in."
— Halah, #sales, 2025-09-03

**Evan's technical-but-not-Bayesian pitch:**
> "We're a data science consultancy that specializes in Bayesian analytics. We really focus on understanding *how* and *why* things happen, and we build analytic models that help people make decisions based on that understanding."
— Evan (UTC -5), #sales, 2025-09-03

**2026 Agentic framing:**
> "vibe coding is the future, but you need to add validation and build it the right way or you'll just get slop. That's where we come in: Agentic Data Science you can trust"
— Thomas (UTC+7), #sales, 2026-01-29

### Levels-of-Analytics Framework (GPT-drafted, Thomas approved)
> "Level 0 - Intuition: You primarily rely on intuition and experience...
> Level 1 - Basic Analysis: Excel...
> Level 2 - Advanced Analysis: Python/R...
> Level 3 - Statistical Modeling: Bayesian modeling to build custom models that deliver deeper insights"
— Thomas (UTC+7), #sales, 2023-04-25

Thomas's comment: "There's a whole bunch of companies operating at level 0 and 1. Oh no! I'm only operating at level 0 and the dial goes up to 3. I'd better call PyMC Labs"

### The "Last 20%" Tagline Explorations (May 2024)
- "For when Pareto isn't Optimal: We take you to 100%"
- "PYMC: Solving the hardest 20% of your statistical problems, because we don't f**k around with the easy stuff."
- "PYMC: Where solving the last 20% of statistical problems makes 100% of the difference."

### Service Framework (agreed Nov 2025, reiterated Feb 2026)
> "Five pillars: Strategy and Technical Advisory, Custom Bayesian Models, Bayesian and Agentic AI Solutions, Embedded Teams, and Training and Workshops"
— Sales meeting summary (Evan), #sales, 2025-11-25

Simplified version (Halah, Feb 2026):
> "Strategy and Advisory > We Advise
> Solution Delivery > We Build
> Training and Enablement > We teach
> Embedded teams > We work by your side"
— Halah, #sales, 2026-02-21

> "I really like this framework! Consulting and advising is different than Building, is different than teaching, is different than side by side. From a crisp messaging perspective to a NON TECHNICAL audience, I like 'we advise, we build...' as the first, and likely most memorable, part of our narrative. Clean, accurate, memorable."
— James Dodge, #sales, 2026-02-21

---

## 4. Engagement Models & Pricing Signals

### EAP (Expert Access Program / Coaching)
The primary "foot in the door" product:
- **Base rate:** $5,000–$8,500/month (dynamic pricing by client size/urgency)
- **With coaching hours:** up to $14,000/month
- **Haleon example:** $8,500/month with $1,000 discount offered
- **Hands-on code work billed separately:** $385/hour
- **Rolling monthly terms** preferred; extended terms harder to sell even with discount
- **What's included:** Discord channel access, 24-hr response time, named seats on client side, no email — Discord only

> "The margins are by far the best from them... they should really be treated like a foot in the door to extend to new big projects"
— Niall, #sales, 2024-12-04

> "EAP program could be scaled way more... it sells like bread"
— Luca, #sales, 2025-12-22

### Project / Custom Build (Monthly Rate Card)
- **Junior data scientist:** ~$37,000–$40,000/month
- **Senior data scientist:** ~$50,000/month
- **Senior lead (Niall/Joe/Luca level):** ~$90,000/month
- Standard SOW + MSA structure

### Workshop (Corporate On-Site or Remote)
- **Rate:** $10,000 for 8 hours live instruction + Discord access between sessions
- Standard 24-hour live instruction format

### Open Cohort Workshops (per cohort revenue)
- Applied Bayesian Modeling, Jan 2026: 17 registrants, $25,008 revenue
- Bayesian Marketing Analytics: ~$30,000/cohort at ~27 students

### MMM Decision Agent / Insight Agent (SaaS Pilot Tiers)
- **MMM Agent Access + Developer Support:** $10,000/month (for teams with internal capacity)
- **Guided Pilot with Dedicated Data Scientist:** $50,000/month, 2-month minimum (recommended)

### Causal Inference / Experimentation (Standalone Projects)
- $5,000–$10,000 per experiment analysis (noted as "no brainer for near-term revenue")

### Scoping / Discovery Projects
- Banking/insurance MMM scoping: €40,000–€70,000 range

---

## 5. Competitive Differentiation

**vs. large consultancies (Accenture, McKinsey, BCG):**
> "What is our value proposition? We are the only PyMC + MMM experts in the OOS [open-source] and in-house modeling advisory. If they don't work with us what are they going to do? Accenture? If they do Accenture they will come back in two years to fix the mess anyway."
— Juan Orduz, #sales, 2024-12-04

**vs. Meridian (Google MMM tool) — primary competitive objection:**
> "Don't get drawn into the comparison — which is a red herring, focus on outcomes of what value we will deliver for the client."
— Niall, #sales, 2026-01-13

**vs. Adobe Mix Modeler:**
> "we have competed with them in the past on RFPs"
— Niall, #sales, 2025-12-02

**Speed advantage:**
- In-house DS get bogged down; PyMC Labs delivers faster
- Bayesian models: 2x–20x faster than Meridian (from marketing analysis)

**Open-source credibility:**
> "we have quant finance clients and we'd be happy to talk to them about the value we're driving there by giving them unique modeling approaches no one else has"
— Thomas (UTC+7), #sales, 2025-02-03

**Bain partnership as enterprise credibility signal:**
> "it could help, probably more if we float the Bain partnership with Roy's quote"
— Thomas (UTC+7), #sales, 2025-03-27

**Competitors / comparisons seen in inbound-leads:**
- Robyn (Meta) — top comparison; became referral source
- Google Lightweight MMM — frustrated users become leads
- Nielsen/Kantar/Northbeam (traditional vendors)
- Stan/PyStan (historical)
- Pyro/NumPyro

---

## 6. Objection Handling

**Meridian:**
> "Don't treat objections as pushback, but as real problems to solve — hear out their objection, feed the objection back, give an opportunity for them to answer their own objections (jedi move) and then finally answer their objection (and never argue)"
— Niall, #sales, 2026-01-13

**Unlimited scope creep (SLA/EAP):**
> "We limit the number of people asking. And set the level of expectation on a 'reasonable time to respond'... The other thing I like to impose is no emails. Keep everything strictly to Discord... Hands on keyboards is $385 per hour."
— Niall + Evan, #sales, 2024-11-19

**"We can do it in-house" / use Accenture:**
> "If they do Accenture they will come back in two years to fix the mess anyway"
— Juan Orduz, #sales, 2024-12-04

**MMM Decision Agent feature parity (product-specific):**
> "The main reason why people didn't buy it was either due to cost and/or feature parity with most recent version of pymc-marketing... in many cases introductions to MMM Decision Agent led to demos/convos about SIMBA"
— Kemble, #sales, 2025-12-22

**Budget / procurement discovery technique:**
> "Been working on strategies recently to try and tease budgets out of potential leads. One recently: 'At what level of budget do procurement have to come in to get approval?'"
— Niall, #sales, 2026-01-16

---

## 7. Ideal Customer Profile (ICP)

### Primary Signals

**Companies with in-house data science capability hitting limits:**
> "Our audience is companies that have some level of analytics and data science capabilities. They are interested in internalizing these capabilities."
— Luca, #sales, 2026-03-05

**Large marketing budget as qualifier:**
> "pricing in marketing analytics can be done by size of marketing budget too — e.g. a client with a 100 million budget stands more to gain from understanding how marketing is performing than a client with 5-10m"
— Niall, #sales, 2023-09-07

**Buyer personas:**
- CMO/VP Marketing (primary marketing analytics buyer)
- Head/VP/Director of Data Science (technical capability buyer)
- CDAO (enterprise data transformation buyer)

**GitHub stargazer mining for ICP:**
> "I created a repo for this. We can have same concepts for people creating issues, PRs, comments, reacting... starredAt already there."
— Will Dean (UTC-4), #sales, 2025-01-08 (re: `pymc-labs/github-leads` targeting pymc-marketing, PyMC, Robyn, lightweight_mmm stargazers)

### Industries Actively Targeted
| Industry | Evidence |
|---|---|
| CPG / FMCG | Dedicated GTM plan (Notion doc "CPG-Offering-GTM", Nov 2025) |
| Media / Broadcasting | NBCU, NBC, CNN, Fox, Live Nation |
| Retail | Walmart, Wegmans, L.L. Bean, Panera, TechStyle, Lidl |
| Pharma / Life Sciences | Novartis, Syngenta, Haleon, Takeda |
| Finance / Insurance | Bondora, Nürnberger, Schwab, BNP Paribas, Swisscard |
| Sports | LA Dodgers, Real Madrid, Supercell |
| Food & Beverage | Yum! Brands via Bain, Nestle, Colgate-Palmolive |
| Aviation | KLM lead; connection risk Bayesian modeling |

---

## 8. Lead Sources & Named Companies from Inbound-Leads

### High-Signal Companies That Came Inbound (by industry)

**Retail/E-com:**
- Zalando, ASOS, Marks & Spencer, Just Eat Takeaway, Panera, TechStyle, Decathlon
- Walmart (direct-to-CMO team; "massive scaling potential")

**CPG:**
- Colgate-Palmolive, Procter & Gamble, Unilever (Prestige), Nestle LATAM, Nomad Foods

**Pharma/Life Sciences:**
- Novartis, Syngenta, Takeda (multiple contacts), Haleon

**Finance/Insurance:**
- Bondora, Nürnberger, Schwab, BNP Paribas, Swisscard, KBC, Ethos Life, VisualVest, Everysk, PayPal

**Media/Entertainment:**
- NBCUniversal, CNN, Fox Broadcasting, Audible, Bloomberg, Live Nation

**Sports:**
- LA Dodgers, Real Madrid C.F.

**Tech:**
- Amazon, Chicago Trading Company, Mode Mobile

**Transportation/Other:**
- KLM Royal Dutch Airlines, Amtrak (moved to dead), Carnival Maritime

**Biotech/Health:**
- Akili, Erisyon, Curology, Flo Health, IQVIA

**Revenue scale indicators seen:**
- Loblaw: $40B revenue
- DISH US: ~$300M marketing budget
- Bain engagement: grew to $550–600k/month by Jan 2026

---

## 9. Case Study References Used in Sales

| Client | Why Cited |
|---|---|
| **Bain & Company** (Coca-Cola, Yum!) | Multi-year partnership; credibility for enterprise scale |
| **Procter & Gamble** | EAP reference for CPG/pharma prospects |
| **Haleon** | Re-engagement opportunity; "in-house model, struggling to scale" |
| **Colgate-Palmolive** | MMM + Insight Agent showcase |
| **L.L. Bean** | EAP reference for retail |
| **Syngenta** | EAP reference for agriculture/pharma |
| **LA Dodgers + Real Madrid** | Sports analytics credibility |
| **Nürnberger** | Extended EAP model for insurance |
| **Wegmans** | Multiple SOWs for retail |

---

## 10. Partners in Sales

### Bain & Company (Primary Revenue Partner)
- Revenue: $550–600k/month (Jan 2026)
- Co-delivery on Coca-Cola, Yum! Brands, Burberry (via BCG), SKLUM
- Key Bain contacts: Mike, Noah, Nathan/Nate-Dog, Roy
- Bain-team Discord members: Nikhil Prasad, Apoorv Sharma, Saimon

> "'transformation' is what all the big players seem to sell. That's where the $$ is. I never dared to suggest that. We could more credibly offer this with Bain."
— Thomas (UTC+7), #sales, 2026-01-29

### Databricks
- Contact: Bryan Smith (Head of Partner Solutions, Consumer Industries), Dan Morris, Anoop, Rakesh
- Pilot: paid media optimization agent, $10k–$50k/month
- "Built on Databricks" partnership track active

### Fivetran
- Shared client GTM list (Unilever Prestige, Amerisave Mortgage, Kaplan North America)
- Partner program being formalized (Halah, Oct 2025)

### Serviceplan / Planet Group
- Marketing agency partner; generating deals (Nov 2025)

### BCG
- Co-delivery (Burberry, SKLUM); administratively complex
- New BCG lead Nov 2025

### Snowflake
- Partner application submitted: SPN-PID-752205 (Dec 2024)
- Talk proposal for Snowflake Summit submitted Feb 2025

---

## 11. Sales Process & CRM

### Funnel Stages
`Lead → Qualified → Proposing → Client (Closed-Won) / Dead Lead`

### Discovery / Qualification
- MEDDIC sales qualification process (Christian, 2024-06-16)
- Pair technical person with sales person on discovery calls
- Sales process documented in Notion: `pymc-labs/Handling-Leads`

### CRM
- HubSpot (migrated from Notion, Oct 2025)
- Demo repo: `https://github.com/pymc-labs/demos`

### 2026 Agency-Style Approach
> "Continuing on with the concept of an *Agency-style* approach to the sales team — proactive initiative-taking rather than reactive, with team members taking ownership of their segments."
— Summary of Jan 6 2026 sales meeting (Christian)

### Revenue Benchmarks
> "The company achieved $8 million in revenue in 2025 compared to $5.5 million in 2024, with significant growth coming from upselling existing clients like Bain (now running at $550–600k monthly)"
— Sales meeting summary (Christian), #sales, 2026-01-06

> "Sales targets aim for 20% growth as baseline and 40% as aspirational goal"
— Sales meeting summary (Christian), #sales, 2026-01-06

---

## 12. Sales Materials Created

| Material | Creator | Date | Notes |
|---|---|---|---|
| Prospectus v1 + v2 | Thomas (GPT-assisted) | 2024-05-24/30 | "Makes PyMC Labs seem like a real company" |
| MMM Pricing Deck (slides 14-19) | Kemble | 2024-09-25 | Client-facing; sent to NBCU and BNP Paribas |
| Project Complexity Scorecard | Luca | 2024-11-11 | Google Sheets; estimates complexity/timelines |
| Internal Sales Enablement Deck | Kemble | 2025-11-13 | Gamma.app; covers Decision AI, MMM Agent, Simba |
| CPG Offering GTM Plan | Niall | 2025-11-18 | Notion; custom Decision AI + SaaS/managed services |
| Partner Offering Overview | Halah | 2026-01-29 | PDF for Bain/Accenture-type outreach |
| "Voices of Labs" EAP Content | Niall/Evan/Kemble | 2025-08-20 | Short interview videos of researchers for EAP marketing |

---

## 13. Testimonials & Positive Signals from Leads/Clients

> "It's actually what partly won us the Bain contract at the start too, as all the people at Bain got to feel a vibe of all the people we put forward in proposals"
— Niall, #sales, 2025-08-21 (on team interview videos)

> Nomad Foods RFP: "Simba + Insight Agent demo; 40 minutes; positive feedback" (noted as "in with a pretty good chance")
— sales channel context, 2025-11-11

Named testimonials referenced in inbound-leads:
- Iraklis Pappas (Colgate) — cited in #website and #general
- Nathan Kafi (Haleon) — cited in #website
- Tim MacWilliams (Ovative) — cited in #website

Cross-reference: 18 pull-quote testimonials documented in `analysis/discord-marketing-extraction.md`

---

## Key Sitemap Implications

| Sitemap Page | Key Findings |
|---|---|
| **Home** | Competition = Excel/intuition. ICP = companies with DS capability hitting limits. Buyer = CMO/VP Data. |
| **Services / Strategy & Advisory** | "We advise" — help companies with in-house capability optimize and scale models |
| **Services / Solution Delivery** | "We build" — custom Bayesian models, MMM Agent, Decision Agent |
| **Services / Training** | "We teach" — workshops at $10k/8hrs, open cohorts $1,499–$2,249 |
| **Services / Embedded Teams** | "We work by your side" — Carlos example; fractional senior DS |
| **Solutions / Simba** | TSB and Nomad RFP demos; EAP conversations pivot to Simba; SaaS angle |
| **Solutions / Decision AI** | MMM Agent $10k–$50k/month pilots; feature parity objections → pivot to Simba |
| **Partners** | Bain (primary revenue), Databricks (Built on DB), Fivetran, Serviceplan, BCG, Snowflake |
| **Contact** | Top 5 questions from leads → website FAQ/CTA; EAP as primary entry point |
| **Industries** | CPG, Media, Retail, Pharma, Finance, Sports, Agriculture most active from leads |
