# Analysis Log — PyMC Content Gathering

---

## 2026-03-14 — enrich-case-studies-web

**Aspect completed:** enrich-case-studies-web

**Findings:**
- Ran web searches for publicly available PyMC Labs case studies and client work
- Found 9 published blog post case studies: HelloFresh (3 posts), Colgate-Palmolive, Everysk, Indigo Ag, Akili, SALK, Alva Labs, Bayesian A/B testing at scale (unnamed streaming client)
- Found Expert Access Program page with testimonials: Fox Entertainment (Eugene Kwok), Haleon (Nathan Kafi), Fabletics (Kate Hirth), Ovative Group (Tim McWilliams)

**Key enrichments:**
- `colgate-synthetic-consumers.md`: Added full Iraklis Pappas testimonial, arxiv preprint URL (arxiv:2510.08338)
- `akili.md`: Resolved GAP — full verbatim Titi Alailima quote: "This is by far the most successful collaboration that I've seen."
- `fabletics.md`: Resolved GAP — Kate Hirth confirmed as Senior Data Scientist; full testimonial added from Expert Access Program page
- `fox-broadcasting.md`: Resolved GAP — full Eugene Kwok testimonial added from Expert Access Program page
- `haleon.md`: Updated testimonial with combined verbatim quotes from homepage + Expert Access Program page
- `indigo-ag.md`: Added Manu Martinet testimonial: "Additional expertise was helpful to get the model to the finish line and into production."
- `salk.md`: Added two additional Tarmo Jüristo verbatim quotes from blog post
- `everysk.md`: Added "This insight would not have been available from a standard machine learning analysis" quote
- `hellofresh-mmm.md`: Added 2 additional blog post URLs (MMM optimization + time-varying effectiveness)
- Created `streaming-ab-test.md`: New case study file for Bayesian A/B at scale (histogram approximation, 100M obs in 22s)

**Clients NOT found publicly:**
- L.L.Bean, Swarovski, Takeda, Live Nation, Real Madrid, Dodgers, Supercell, Syngenta, VisualVest, Wegmans — no published case studies or public confirmations found

**Ecosystem users found (not direct clients):**
- Bolt, Qonto, Wise, FREENOW — using PyMC-Marketing, presented at webinars but not consulting clients

---

## 2026-03-14 — enrich-industries-web

**Aspect completed:** enrich-industries-web

**Findings:**
- Ran web searches for all 5 partial industry pages: retail/ecommerce, agriculture, finance/insurance, gaming, sports analytics
- Fetched 3 published blog posts: Indigo Ag case study, Everysk case study, Chris Fonnesbeck sports analytics blog
- All 5 partial pages upgraded to status:complete

**Key enrichments by page:**

**Agriculture:**
- Confirmed Indigo Ag blog URL: https://www.pymc-labs.com/blog-posts/2022-08-11-indigo
- Added canonical blog quotes + business outcome framing
- Added July 2022 PyMC Discourse meetup info (regulatory substantiation angle)
- No public Syngenta+PyMC Labs content found (all Discord-sourced)

**Sports Analytics:**
- Confirmed Learning Bayesian Statistics Podcast Episode #125 with Chris Fonnesbeck
- Added GitHub repo: fonnesbeck/hierarchical_models_sports_analytics
- Confirmed Fonnesbeck's MLB career: Phillies (Principal Quant Analyst) + Yankees + Brewers
- Clarified: Dodgers = current PyMC Labs *client* (not Fonnesbeck's personal career)

**Gaming:**
- Confirmed Mobile Dev Memo podcast: Season 6, Ep 16, "Can an LLM Evaluate Ad Creative?", Nov 4, 2025
- Confirmed Luca Fiaschi title: Partner for the Generative AI vertical
- Added verbatim bio text used in podcast
- No public Appodeal or Supercell case study found
- Noted: Appodeal appears in PyMC Labs tech stack (ads on site) — distinct from client relationship

**Finance/Insurance:**
- Fetched full Everysk case study page
- Added 4 direct quotes from the published case study
- Added cumulative returns visualization description (US stocks / PyMC VC index / Cambridge Associates)

**Retail/E-Commerce:**
- Added hierarchical CLV blog post content: https://www.pymc-labs.com/blog-posts/hierarchical_clv
- Added Pareto/NBD blog reference: https://www.pymc-labs.com/blog-posts/pareto-nbd
- Confirmed BG/NBD model directly applicable to grocery/non-contractual retail scenarios (Wegmans context)
- No public Wegmans case study found

**Remaining gaps (unchanged):**
- Gaming, sports: no public testimonials or published case studies
- Finance: no direct testimonial quote from a client
- Retail: no public Wegmans content

---

## 2026-03-14 — industry-benchmarks-enrich

**Aspect completed:** industry-benchmarks-enrich

**Findings:**
- Upgraded content/resources/industry-benchmarks.md from status:partial → status:complete
- Fetched full content of 5 URLs: pymc-stan-benchmark, how-realistic-are-synthetic-consumers, pymc-marketing-vs-google-meridian (Part 1), pymc-marketing-vs-meridian-baseline-modeling-mmm (Part 2), can-llms-play
- **Benchmark 3 (PyMC vs Stan) — RESOLVED:** Full methodology added. 160,420 tennis matches. Wall time: 2.7 min (GPU vectorized) vs 20 min (Stan). 11× ESS/s improvement for GPU. JAX CPU: 2.9× speedup. GPU crossover at ~50k observations. All methods produce identical posteriors. Author: Martin Ingram, Dec 2021 / updated Feb 2026.
- **Benchmark 2 (Meridian) — ENRICHED:** Full quantitative tables added for Part 1 (PyMC 0.15.1 vs Meridian 1.1.6) and Part 2 (PyMC 0.17.0 vs Meridian 1.2.1). Detailed ESS/s, R², MAPE, Durbin-Watson, SRMSE by dataset scale. Part 2: Automated Knot Selection improved Meridian R² but degraded attribution accuracy due to spline absorbing seasonality.
- **Benchmark 1 (LLM Price Is Right) — ENRICHED:** Added Feb 2026 tournament data (90 models, o3=13.5% MAPE beating human ~18%, r=0.89 correlation, OpenAI top 14 Elo). Predecessor blog "can-llms-play" documented.
- **Benchmark 5 (Synthetic Consumers) — RESOLVED:** Full study design extracted. 9 models (5 large, 4 small), GSS data, MAE metric, 2 tasks (party ID + TV hours). Control experiment confirms demographic grounding essential. Main caveat: "some LLMs can perform worse than naive baseline."
- **Hero copy** — added candidate framing text from blog language.
- Remaining gaps: PyMC Skills (Benchmark 4) methodology still LinkedIn-only; live leaderboard JS-rendered; no industry-specific benchmarks found; SSR paper DOI not captured.

---

## 2026-03-14 — assemble-resources-benchmarks

**Aspect completed:** assemble-resources-benchmarks

**Findings:**
- Created content/resources/industry-benchmarks.md (status: partial)
- Documented 5 benchmarks: LLM Price Is Right (primary, full leaderboard), PyMC-Marketing vs. Meridian (Part 1 Sept 2025 + Part 2 Dec 2025, 2x-20x speed advantage), PyMC vs Stan sampling speed (#6 blog by traffic), PyMC Skills / AI Agent Reliability (60%→93% pass rate, Fonnesbeck lead), Synthetic Consumers Alignment (90% alignment, SSR methodology)
- LLM Price Is Right: full leaderboard table (Sep 25 2025), methodology, dataset (820 items), 3 metrics (Elo/MAPE/Overbid), submission process documented
- Meridian benchmark: headline results, LinkedIn copy (Halah/Teemu), webinar description, Mutinex controversy (used default priors on old version, benchmark unpublished)
- GAPS: PyMC vs Stan full post content not extracted; PyMC Skills benchmark task set incomplete; synthetic consumers paper citation/DOI missing; no hero copy for overview page; leaderboard is live/JS-rendered

---

## 2026-03-14 — assemble-case-studies

**Aspect completed:** assemble-case-studies

**Findings:**
- Created 26 case study files in content/case-studies/
- Sources: discord-case-studies-extraction.md (25 Discord channels) + website-scrape/case-studies.md (10 published blog posts) + halah-draft-scrape.md
- Case studies with published blog posts (complete/partial): hellofresh-mmm, akili, salk, indigo-ag, alva-labs, everysk, colgate-synthetic-consumers, colgate-cannibalization, colgate-shelf-optimization
- Discord-only case studies (partial): appodeal, erisyon, gain-theory, syngenta, fox-broadcasting, haleon, live-nation, fabletics, llbean, roche, wegmans, swarovski, takeda, visualvest
- Stub-level entries (confidential/thin): dodgers, real-madrid, supercell
- Key metrics documented: HelloFresh 60x A/B speedup + 10x MMM speedup, Swarovski MAE -20%, Wegmans MAPE 13-14%, Roche 34K params/250K obs in ~1hr, Colgate SSR 90% alignment, Colgate shelf GPU 4 chains/6hr
- Key testimonials captured: Eugene Kwok (Fox) "feels like part of their team", Nathan Kafi (Haleon) homepage quote, Tarmo Jüristo (SALK) homepage quote, VisualVest "not so common in consulting", Akili Titi Alailima homepage quote
- GAPS: Nuernberger and Appodeal have no engagement-level results to report publicly; Dodgers/Supercell details confidential; Roche exact problem domain (genomic vs. clinical) unconfirmed; no published case study for Roche, Erisyon, Gain Theory, Fox, Haleon, Live Nation, Swarovski, Wegmans, VisualVest, Takeda

## 2026-03-14 — assemble-course-abm (+ bma + ci)

**Aspects completed:** assemble-course-abm, assemble-course-bma, assemble-course-ci (all three in one run)

**Findings:**
- content/courses/abm.md and content/courses/bma.md were already created as `status: complete` during the discord-courses-workshops extraction aspect. No additional work needed.
- content/courses/ci.md was `status: partial` — enriched to `status: complete`:
  - Added stats bar for ABRM (Option A)
  - Added social proof / testimonials section for ABRM (no direct cohort testimonials available — March cohort cancelled; used instructor credibility quotes and cross-course audience signals)
  - Added Option B social proof section: Ben Vincent's market analysis ratings (Novelty 8/10, Interest 9/10, Pricing Power 8/10), Juan Orduz quote praising business-scenario framing, competitive gap analysis
  - Added developer note: do not advertise cancelled cohort; surface waitlist CTA
  - Added marketing lead-time note to CI timeline
  - Dual-interpretation structure (ABRM as current live course vs. new CI course in development) preserved — this ambiguity is real and needs Thomas/Halah confirmation before building the new sitemap page

**ABM course summary:**
- Price: $1,499 · 8 sessions · 16h · Instructors: Downey / Fonnesbeck / Leos Barajas
- 3 cohorts run: Aug 2025, Oct 2025, Jan 2026
- GitHub: pymc-labs/pymc-workshop
- Status: complete

**BMA course summary:**
- Price: $2,249 · 8 sessions · 16h · Instructors: McWilliams / Vincent / Allen / Trujillo
- 1 cohort run: Feb 2026 (22 participants, 77.7% Good/Excellent)
- GitHub: bayesian-marketing-analytics-course
- Status: complete

**CI/ABRM course summary:**
- ABRM: $1,499 · live on website · March 2026 cohort CANCELLED · Instructors: Orduz / Vincent / Forde
- New CI course (Option B): in development, ~$2,249, planned Jun 2026+, Ben Vincent primary architect
- Status: complete (with noted ambiguity about which course the "CI Course" sitemap slot refers to)

**GAPS:**
- No ABRM testimonials (cohort cancelled before running)
- New CI course curriculum is in private GitHub repo (pymc-labs/causal-inference-workshop) — full session plans unavailable
- Sitemap ambiguity: "CI Course" = ABRM (live) or new causal inference course (in development)? Needs Thomas/Halah confirmation.

---

## 2026-03-14 — assemble-about

**Aspect:** assemble-about
**Status:** Complete

`content/about/story-and-team.md` existed as `status: partial` (written during discord-org-team-extraction). This run enriched it to `status: complete` by adding:

1. **Full Origin Story** from `https://www.pymc-labs.com/blog-posts/saving-the-world` — Thomas left Quantopian 2020, assembled team from PyMC OSS community, early clients SpaceX/Roche/Netflix/Deliveroo/HelloFresh, "saving the world with Bayesian modeling" mission, original team composition (neuroscience PhDs + SpaceX rocket scientist + podcast host)

2. **Labs Principles** (5 principles from `https://www.pymc-labs.com/blog-posts/labs-principles`): Freedom / Transparency / Autonomy & Self-Organization / Flexibility & Fluid Hierarchies / Leadership & Community. Teal organization model documented. Core quote: "Work can not feel like work but has to feel like 'play'"

3. **Social Proof / Stats Section** — brand deck stats (100+ enterprise clients, 52 published articles), hard numbers (9,500+ PyMC stars, 1M+ pymc-marketing downloads, $8M 2025 revenue, 1,463 Decision Hub downloads in first week)

4. **Halah's Draft About Page** — Full timeline (2005 PyMC origins → 2020 Labs → 2023 pymc-marketing → 2025 Agentic AI), hero headline "Born from Open Source Built On Science", body copy with 3 featured team members

5. **Win-Win-Win Model** — Ravin Kumar's original framing: Labs wins + Clients win + OSS community wins

6. **Early Client Quotes** table — 5 founding-era testimonials (Erisyon/HelloFresh/Indigo/Roche/Erisyon CEO)

7. **Social/Community Channels** — all 7 active channels with follower counts

8. **Team Member Files** note — 32+ files in content/about/team-members/ with 30 complete bios, 2 stubs (Benjamin Maier, Erik Ringen)

GAPS remaining: Founding legal date unknown; Alexandre Andorra's current team status unclear; Joe Wilkinson Discord handle unconfirmed.

---

## 2026-03-14 — assemble-solution-decision-ai

**Aspect:** assemble-solution-decision-ai
**Status:** Complete

content/solutions/decision-ai.md was already partially assembled (created during discord-decision-ai mining). This run:
1. Upgraded status from `partial` → `complete`
2. Added "Live Website Content" section — full copy from pymc-labs.com/blog-posts/the-ai-mmm-agent (Luca Fiaschi, Feb 24 2025) and ai-mmm-agent-beta post (Nov 7 2025), including all 4 core capability groups, benefit framing per audience, and CTAs
3. Added "Halah Draft Framing" section — services page positioning of Decision AI as "Bayesian AI Solutions" (#3 of 5 pillars), with Simba/MMM Agent/CLV Agent named
4. Added "decision.ai Website Copy" section — LinkedIn launch post from Feb 26 2026

Key content: Full 3-layer ecosystem (Decision Packs / Decision Hub / Decision Orchestrator), 30+ MMM Agent features, Decision Hub (1,463 downloads in first week), CLV Agent alpha, 10 clients/pilots, pricing ($8k/mo EAP, $50-100k/yr SaaS), competitive vs Stella/Meridian, trust framework, full 21-person team table, roadmap Jan 2025 → May 2026.

GAPS noted: final 2026 pricing, Intuit/Mailchimp + BMW contract outcomes, Stakeholder mode (Jellyfish MVP) launch date, Decision Orchestrator public docs, full Stella competitive deck.

---

## 2026-03-14 — assemble-industry-sports

**Aspect**: assemble-industry-sports
**Output**: content/industries/sports-analytics.md
**Status**: partial

**Key findings:**
- 2 named sports clients: LA Dodgers (MLB, time series SLA, $5k/month, signed June 2025, active) and Real Madrid (CLV + sports analytics EAP, June–August 2025, ended due to Ancelotti→Xavi coaching change)
- Chris Fonnesbeck = primary sports analytics lead; creator of PyMC; 7 years MLB experience (Phillies/Yankees/Brewers); led both Dodgers and Real Madrid engagements
- Dodgers: exclusivity clause negotiated (month-to-month); logo usage rights secured; time series coaching format
- Real Madrid: CLV work completed (Pablo Roque merged PR #1815 adding covariate support to pymc-marketing MBG/NBD); football analytics stalled; no follow-up contract
- 5 sports analytics blog posts indexed: baseball MARCEL, BART swinging strikes, hockey goaltending spatial, NBA IRT foul analysis, hierarchical models for sports
- Sports is one of 4 named verticals in Halah draft home hero ("Bayesian Intelligence for Sports")
- GAP: No public testimonials from sports clients; no published case study pages; Dodgers contractual confidentiality; Real Madrid engagement ended without case study

---

## 2026-03-14 — assemble-industry-gaming

**Aspect**: assemble-industry-gaming
**Output**: content/industries/gaming.md
**Status**: partial

**Summary**: Assembled gaming industry page. 4 named clients: Supercell (mobile gaming — Clash of Clans/Brawl Stars; conference inbound from NY via Christian's presentation; "we want everything that Christian showed"; EAP engagement active; Databricks shared client), Appodeal (mobile ad mediation; early client 2020; Bayesian MMM for app developer acquisition attribution; ROAS with credible intervals; Niall led; completed SOW), Keywords Studios (AAA gaming services company; corporate workshop March 2026, 24h, 8 sessions), Game Data Pros (gaming consultant; Decision AI beta tester Aug 2025, access revoked Oct 2025). Key domain credibility: Luca Fiaschi's background as Chief Data & AI Officer at MistPlay; Mobile Dev Memo podcast appearance (Nov 2025) on LLM ad creative evaluation. Use cases: MMM for UA / Player LTV (CLV Agent) / A/B testing at scale / Ad creative evaluation / Corporate training. GAPS: No published testimonials from gaming clients; no public case study blog post for Appodeal or Supercell; Supercell engagement details internal; "Gaming" not in Halah's hero rotating tagline.

---

## 2026-03-14 — assemble-industry-agriculture

**Aspect**: assemble-industry-agriculture
**Output**: content/industries/agriculture.md
**Status**: partial

**Summary**: Assembled agriculture industry page. Two named clients: Indigo Ag (primary — spatial GP for field trial treatment effect estimation, zero-inflated lognormal yield modeling, hierarchical Bayesian across farms/regions; multi-year engagement 2020–2024; Manu Martinet testimonial in two versions; Thomas quote about "agricultural frequentists"; production deployment confirmed; team: Wiecki/Luciano Paz/Adrian/Bill Engels/Niall/Carlos) and Syngenta (SLA/coaching format; XC50 assay + dose-response + hierarchical GLM for crop protection research; SOW 1 Mar 2025 / SOW 2 Dec 2025; client: Guillaume; Virgile quote "Guillaume's last model is great"; Eric Ma account lead). Blog posts: 2022-08-11-indigo (case study) + spatial-gaussian-process-01 (tutorial). Indigo Carbon program (soil carbon credits) noted as strategic use case. Agriculture grouped with pharma/biotech internally but gets own sitemap page. Flagship Pioneering fund connection documented (Moderna + Indigo). GAPS: No Halah draft agriculture section exists; no dedicated agriculture landing page copy written yet; Syngenta also in pharma page (cross-reference noted).

---

## 2026-03-14 — assemble-industry-cpg

**Aspect**: assemble-industry-cpg
**Output**: content/industries/consumer-goods.md
**Status**: complete

**Summary**: Assembled CPG/FMCG industry page. Primary client: Colgate-Palmolive with 3 engagements (cannibalization ~$485K SOW + MSA; shelf optimization nested logit DCM / GPU 4 chains 6h / custom colgate-shelf-sow2 package; synthetic consumers 90% alignment). Iraklis Pappas (Global Head of AI, Colgate) testimonial. Bain/Coca-Cola Fuelight 360 ($3.25M combined budget, US/GB/BR production MMM). Procter & Gamble EAP + workshop reference. Nomad Foods Simba+Insight Agent RFP. Diageo synthetic consumers reference. Nestle LATAM + Unilever Prestige inbound leads. Full Innovation Lab CPG product documented (5-capability pipeline: briefs → AI evaluation → design refinement → synthetic testing → market simulation). SSR method stats: 90% alignment, 85% distributional similarity, <24h cycle. Competitive framing vs. Kantar RichMix and Fractal.ai (Colgate's prior vendor). GTM note: dedicated Notion "CPG-Offering-GTM" doc by Niall (Nov 2025). GAPS: P&G engagement details; Yum! Brands scope; Nomad RFP outcome; Diageo client vs. blog reference unclear; no public Bain/Coca-Cola case study.

---

## 2026-03-14 — assemble-industry-retail

**Aspect**: assemble-industry-retail
**Sources**:
- analysis/discord-case-studies-extraction.md
- analysis/discord-sales-extraction.md
- analysis/discord-marketing-extraction.md
- analysis/discord-partnerships-extraction.md
- analysis/discord-simba-extraction.md
- analysis/discord-channel-map.md
- content/industries/_overview.md
**Output**: content/industries/retail-ecommerce.md (status: partial)

**Key findings:**
- 5 active/completed retail client case studies with hard metrics: HelloFresh (60x A/B speedup), Wegmans (MAPE 13-14%, ~1% cannibalization), Swarovski (-20% MAE), L.L. Bean (50 DMA hierarchical capability build), Fabletics (PyMC3→PyMC5 upgrade, HSGP time-varying)
- Additional retail clients discovered: Lidl (Databricks shared, pricing optimization), MercadoLibre (early 2021), Deliveroo (early 2021), OpenStore (2022), Westwing (2025)
- Fivetran/Shopify native integration built into pymc-marketing (Sep 2025): "transforms Fivetran's standardized ad reporting into production-grade Bayesian MMMs in minutes, not weeks"
- Key inbound leads: Nomad Foods (RFP demo, "in with a pretty good chance"), Walmart (direct-to-CMO), ASOS, Just Eat Takeaway, Zalando, Decathlon, Panera
- Products: pymc-marketing (1,088★, 1M+ downloads), Simba SaaS (TechStyle trial, Nomad RFP), Decision AI (Databricks-hosted, Wegmans context)
- GAPS: No Retail-specific testimonial quote; Wegmans has no public case study; Nomad/Walmart conversion status unknown

---

## 2026-03-14 — assemble-services-overview

**Aspect**: assemble-services-overview
**Sources**:
- analysis/website-scrape/services.md
- analysis/halah-draft-scrape.md
- analysis/discord-sales-extraction.md
- analysis/discord-marketing-extraction.md
- analysis/website-scrape/home.md
**Output**: content/services/_overview.md (status: complete)

**Key findings:**
- New sitemap consolidates 5 old services into 4 pillars: Strategy & Advisory / Solution Delivery / Training & Enablement / Embedded Teams
- "We Advise. We Build. We Teach. We Work By Your Side." — Halah's crisp framework (Feb 2026) is the best one-liner for each pillar
- "Solution Delivery" is a new name not in old site or Halah draft — consolidates Custom Bayesian Models + Bayesian AI Solutions
- 3-step "Our Approach" (Discovery & Alignment → Solution Design → Integration & Growth) documented from Halah draft
- Full FAQ (5 questions) documented — based on top inbound sales questions, same block appears on home + services pages
- EAP is the primary CTA/entry point; pricing from $5k–$14k/month documented
- GAPS: No public pricing on services pages; logo carousel needs approved client list; /services/* URL structure TBD

---

## 2026-03-13 — discord-finances

**Aspect**: discord-finances
**Sources**:
- `💵│finances` channel (ID: 747388118256320582) — 4,385 msgs, 2020-08-24 → 2026-03-11
**Output**: analysis/discord-finances-extraction.md

**Key findings:**

- **50/50 revenue split**: 50% of all project revenue → contractor hours + bonus pool; 50% → Labs overhead/OSS/BD
- **Hourly rate trajectory**: $50/h (2021) → $75 → $80 → $85 (project, Feb 2024); OSS rate $50/h (capped 6–12h/month)
- **Rate modifiers**: +$25/h US bonus; +$50/h industry veteran (proposed Jan 2025 for Luca/Joe Wilkinson); PhD bonus (amount undisclosed); High Intensity 1.2x multiplier (Q3 2025)
- **Bonus pool trajectory**: $0 (Q2 2022) → $21–24k (Q3–Q4 2023) → ~$200k (Q2 2024) → ~$223k (Q3 2024) → ~$288k (Q3 2025)
- **Client-facing rates**: implied $140/h+ (Thomas 2024); market comps $300/h (Jesse) to $1K/h (Eric scare-off)
- **Top clients by value**: Bain/Coke $5M/year; Readystate $2M/year (started at $500k)
- **First contract**: ~$5k mid-2020; first year estimated $1.5M
- **Dec 2020 monthly revenue**: $85k (Roche $60k + Indigo $20k + Appgrowth $5k)
- **SLA/retainer = highest margin**: Audible + L.L. Bean cited; "5 SLAs would add $45k/quarter"
- **Billing**: independent contractors invoice Labs monthly via Toggl; Labs pays in USD; converts to local currency via Wise (conversion cost borne by Labs)
- **Payment terms**: Net 60–90 days; clients frequently pay late; only fully paid + completed SOWs enter bonus pool
- **Long-term vision**: $50M revenue over next 10 years from GenAI initiative (Thomas 2025-01-04)

---

## 2026-03-13 — discord-simba

**Aspect**: discord-simba
**Sources**:
- `🦁│simba` channel (ID: 1192432653916459008) — 292 msgs, 2024-01-04 → 2025-12-08
- `Simba integration into website` thread (4 msgs, empty)
- `Simba Deployment` thread (20 msgs, empty in archive)
**Output**: analysis/discord-simba-extraction.md + content/solutions/simba.md

**Key findings:**

- **Name origin**: Simba = "Simply Bayesian SimBa MMM" — Niall Oulton's product, started independently then brought into PyMC Labs
- **Product type**: SaaS web platform for enterprise MMM — upload data → configure → fit → compare → optimize → scenario plan
- **Core differentiator vs Decision AI**: Simba = managed services clients; MMM Agent = self-service + coaching clients
- **Features documented**: data upload, industry benchmark priors, model management, model comparison (MAE/LOO), budget optimization with risk controls, ROAs over time, holdout validation, lift test integration, full-funnel model connections, scenario planner
- **Pricing (Sep 2025)**: $2,000/month base + $500/additional user; free trial (shared instance); add-on to SLA ~$2,500–$3,000/month
- **Clients**: Coca-Cola (free trial Mar 2024), Cabify (free trial Apr 2024), TechStyle, Brilliant Earth (first paying sub Aug 2024, cancelled Oct 2025), TSB Bank, Nomad Foods demo
- **Domain**: simba-mmm.com (live Sep 2025); also referenced 1749.io for docs
- **Tech**: Lovable + v0 by Vercel for UI; Docker deployment; private GitHub repo (not open source)
- **Planned enhancements**: pymc-marketing engine integration, CausalPy lift test integration, EAP-style chatbot
- **Website integration**: Planned Oct 2025 but status unknown
- **Gaps**: simba-mmm.com live content not scraped; 2026 subscriber count unknown; no finalized marketing copy

---

## 2026-03-13 — discord-sales

**Aspect**: discord-sales
**Sources**:
- `inbound-leads` channel (ID: 748522210091859978) — 3,815 msgs, 2020-08-27 → 2026-03-12
- `💁│sales` channel (ID: 1062705105872355370) — 1,043 msgs, 2023-01-11 → 2026-03-09
**Output**: analysis/discord-sales-extraction.md

**Key findings:**

- **Revenue**: $8M in 2025 vs $5.5M in 2024; 20% baseline / 40% aspirational growth targets; Bain at $550–600k/month
- **Pricing documented**: EAP $5k–$14k/month (dynamic by client size); project staffing $37k–$90k/month; corporate workshops $10k/8hrs; MMM Agent pilots $10k–$50k/month; scoping projects €40k–€70k
- **ICP confirmed**: Companies with in-house DS capability hitting scale limits; CMO/VP Data buyers; marketing budgets $10M+; pharma, CPG, media, retail, finance, sports
- **Competition is Excel/intuition** (not ML) — Thomas's foundational insight from 2023 still in use
- **Tested pitches**: Halah's Sept 2025 short + long versions; Evan's technical-but-not-Bayesian version; 2026 "Agentic Data Science you can trust"
- **Service framework**: "We Advise / We Build / We Teach / We Work by Your Side" (Halah Feb 2026, approved by James Dodge)
- **Objection handling documented**: Meridian = red herring; Accenture = "back in 2 years to fix the mess"; SLA scope = $385/hr hands-on + named seats
- **Partners active**: Bain (primary revenue), Databricks (Built-on-DB pipeline), Fivetran (shared GTM list), Serviceplan, BCG (co-delivery), Snowflake (application submitted SPN-PID-752205)
- **70+ named companies** in pipeline history with dates and status
- **Top 5 inbound questions** (Halah, 2026-01-16) documented — key FAQ input
- **Lead sources ranked**: OSS/GitHub > HelloFresh blog > conferences > pymc-marketing widget > LinkedIn > LBS podcast > referrals > Meridian/Robyn frustration
- **GitHub stargazer mining**: `pymc-labs/github-leads` repo targeting pymc-marketing, PyMC, Robyn, lightweight_mmm stargazers

---

## 2026-03-13 — discord-website

**Aspect**: discord-website
**Sources**: input/discord/channels/747896472896274453.jsonl (3,477 messages, 2020-08-25 → 2026-03-13) + users.jsonl
**Output**: analysis/discord-website-extraction.md

**Key findings:**
- Tagline evolution: "Custom Bayesian models..." (2020) → "Better models. Better decisions." (2021) → "The Probabilistic AI Consultancy" (Christian, Jun 2025) → "Bayesian AI" pivot (Thomas, Nov 2025) — approved by Thomas/Halah/Christian
- Site stack history: Lektor (2020) → Next.js + Strapi CMS + Tailwind CSS (current)
- Services page deprecated Oct 2025; new EAP landing page being vibe-coded (Halah, Mar 2026)
- New website design agency (Mar 2026): Halah documented full requirements — Next.js + Strapi + Tailwind confirmed, sitemap confirmed matching new nav
- Client logo approvals: Bain, Colgate-Palmolive, Everysk, AppGrowth, Redhawk, Civiqs, Gain Theory, Alva Labs approved; P&G and Schwab require prior written consent
- Named testimonials on site: Iraklis Pappas (Colgate), Nathan Kafi (Haleon), Tim MacWilliams (Ovative Group), plus SALK/Akili/Indigo/Roche
- SEO engagement: Stephan Reiss conducted SEO audit; 15+ technical issues: /workshops → /courses redirect, sitemap exclusions, H-tag structure, image compression, rel=canonical, schema markup, Bing WMT, meta descriptions
- Courses: /workshops renamed to /courses (Jan 2026); ABM ($1,499), BMA ($2,249), ABR ($1,499), Agentic AI DS ($1,900) — promo code discussed
- Hub.decision.ai DNS setup; Synthetic Consumer Panel page; LLM Price Is Right benchmark
- Brand: Canva certificate template, cover image generation for blog posts, color blindness testing
- 16 notable threads indexed including "New-Website-Design" (20 msgs), "Adding Synthetic Consumers" (50 msgs), "Marimo notebooks on CMS" (43 msgs), "PyMC Labs - New website requirements" (18 msgs)

---

## 2026-03-13 — discord-general

**Aspect**: discord-general
**Sources**: input/discord/channels/745261710088339499.jsonl (3,095 messages, 2020-08-18 → 2026-03-09)
**Output**: analysis/discord-general-extraction.md

**Key findings:**
- Company founding: 2020-08-18, Discord as founding comms platform
- Original positioning (Ravin Kumar): "the missing puzzle piece" between Bayesian theory/code and real-world industry use
- Core value: "more valuable than a FTE" — diverse international collective beats a single hire
- Open-source + commercial "Win Win Win" model articulated from day 1
- 5 strong client testimonials: Erisyon ("couldn't have done in a year what you did in a month"), HelloFresh ("best model on the market right now"), Indigo ("love working with you"), Roche's Eoin ("wow, great amount covered in short time"), Erisyon CEO ("we're already buying, you don't need to sell us")
- 15+ named clients with first-mention dates: Everysk, Roche, Redhawk, Empyrical, Indigo, Civiqs, HelloFresh, Mercado Libre, Deliveroo, Netflix, Gates Foundation, Erisyon, Akili Interactive, Schwab, KBC Financials
- 15+ team member intro quotes documented
- YouTube channel: Dec 2021; Newsletter: Sep 2022; Online Meetup series: Jul 2022+; Intuitive Bayes course: beta 2022
- VC outreach: Tony (VC interested in open-core commercial plays) engaged May–Jun 2021
- Pricing signals: 5-figure+ projects by Jan 2021; workshops $6-25k range
- Conference appearances: Insurance Data Science 2021 (Wiecki keynote), PyData Virginia 2025, Bayesian Mixer London 2025

---

## 2026-03-13 — github-org-scan

**Aspect**: github-org-scan
**Sources**: github.com/pymc-labs (WebFetch), github.com/pymc-devs (WebFetch), WebSearch
**Output**: analysis/public/github-org.md

### What was found

**pymc-labs org — 15 total repos:**

Key active repos:
- **pymc-marketing** (1,088★, Apache 2.0) — Bayesian marketing toolbox: MMM (adstock, saturation, lift test integration, budget optimization), CLV (BG/NBD, Pareto/NBD, Gamma-Gamma), Customer Choice Analysis. 1,264 commits. 393 open issues.
- **CausalPy** (1,123★, Apache 2.0) — Causal inference in quasi-experimental settings. 10 methods: Synthetic Control, DiD, RDD, ITS, IPSW, Instrumental Variable, etc. v0.8.0 released March 3, 2026. 1,676 commits.
- **decision-hub** (37★, MIT) — Open-source AI agent skills registry. "Think npm, but for agent capabilities." 40+ agent integrations. Sandboxed evals. Trust grade scoring. Self-hostable at hub.decision.ai. **This is the Decision AI product.**
- **semantic-similarity-rating** (130★, Apache 2.0) — SSR algorithm implementation. Paper: Maier, Aslak, Fiaschi, Pappas, Wiecki (2025). Core technology behind Synthetic Consumers.
- **ai_decision_workshop** (52★) — 4 Jupyter notebooks on Bayesian decision-making under uncertainty. Runs in Google Colab.
- **PriceIsRightLLM** — LLM price estimation benchmark. 820 products, 19 featured models, Elo ratings. No Simba repo found.

**pymc-devs org — core OSS:**
- **PyMC** (9,500★, 2,200 forks) — Core probabilistic programming library. v6 active. NUTS, ADVI, PyTensor backend. NumFOCUS project, sponsored by PyMC Labs. 10,420+ commits.
- **PyTensor** (596★) — Math expression optimization backend for PyMC.

### Key content implications
- Resources > Open Source Libraries: PyMC (9.5K★), pymc-marketing (1.1K★), CausalPy (1.1K★) as three flagship OSS
- Solutions > Decision AI: decision-hub is the open-source product; hub.decision.ai
- About page: "Inventors of PyMC" claim validated — PyMC Labs = PyMC creator organization
- No dedicated Simba repo — Simba is proprietary/internal product

---

## 2026-03-13 — halah-draft-scrape
Playwright-scraped https://loyal-growth-093412.framer.app/ (JS-rendered Framer site — WebFetch returned only CSS). Captured 8 pages: home, /services, /work, /about, /work/hellofresh, /work/colgate-palmolive, /work/salk, /work/indigo.

**Key content found:**
- **Home page**: Hero "Bayesian Intelligence for [Marketing/Finance/Pharma/Sports]", 5 service tiles, 6 case study cards (incl. Ovative Group + Akili not yet on main site), testimonial from Nathan Kafi/Haleon, FAQ section.
- **Services**: Full descriptions for all 5 services with bullet features. "Bayesian AI Solutions" names Simba explicitly as "Enterprise-level Bayesian solution for end-to-end MMM workflows." Also names MMM Insights Agent and CLV Agent.
- **About**: Origin story timeline (2005→2020→2023→2025→Today), "In 2005 we came together as a team of scientists" (note: 2005=PyMC origin, 2020=Labs founding per timeline). Featured team: Wiecki (Founder), Luhmann (COO), Fiaschi (Partner-Gen AI).
- **HelloFresh case study**: Full narrative — problem (black box + computational wall), solution (principled MMM + vectorized inference), results (60x faster, saturation curves, foundation for PyMC-Marketing).
- **Colgate-Palmolive case study**: Full narrative — Synthetic Consumers, SSR methodology, 9,000+ human responses, 57 concepts, 90% reliability, 74% agreement, 74% "winner" identification.
- **SALK case study**: Hierarchical Bayesian for survey/sentiment data — credible intervals, multi-level models.
- **Indigo case study**: Hierarchical Bayesian causal models for agricultural field trial data — treatment effects, uncertainty quantification.

**Template issues noted**: Stats counters show "0+", footer email href still points to hello@aurazen.com, social links point to Dribbble/VK. These are template artifacts — actual values in Discord/website.

**Not yet captured**: /pricing (→ separate aspect halah-draft-pricing), /work/ovative-group, /work/akili, /old-home.

**Output:** analysis/halah-draft-scrape.md

---

## 2026-03-13 — website-crawl-remaining
Verified full sitemap (92 URLs via sitemap-0.xml). Identified 11 critical pages not yet scraped. Fetched all 11:

1. **Expert Access Program** (Aug 2025) — Two-tier ongoing engagement program: Base (Expert Lifeline: 1-day response, implementation guides) + Pro (Deep Partnership: bi-weekly coaching calls, bi-monthly Expert Exchange Sessions, early tool access, custom workshops, strategic consultation). New clients: Fox Entertainment (Eugene Kwok), Fabletics (Kate Hirth). CTA: calendly.com/niall-oulton.
2. **Labs Principles** (Jan 2022, Thomas Wiecki) — 5 open-source principles: Freedom, Transparency, Autonomy, Flexibility, Leadership. 50% profit share to employees. "Teal" organization per Laloux framework. Key quote: "work can not feel like work but has to feel like play."
3. **Origin Story** (Feb 2021, Thomas Wiecki) — Founded after leaving Quantopian 2020. Mission: "Saving the world with Bayesian modeling." Early clients: SpaceX, Roche, Netflix, Deliveroo, HelloFresh. Team: 3 neuroscience PhDs + mathematicians + social scientists + SpaceX rocket scientist + LBS podcast host.
4. **The AI MMM Agent** (Feb 2025, Luca Fiaschi) — Decision AI product. ~80% reduction in manual work. Hours not months. Data exploration + auto model config + Bayesian inference + insight delivery. Causal intelligence + experiment calibration. Contact PyMC for access.
5. **AI MMM Agent BETA** (Nov 2025) — BETA access program. Email [email protected]. 4 features. Upcoming: summary deck, budget optimization, causal DAG support.
6. **Synthetic Consumers overview** (Jun 2025, Rismal/Fiaschi) — Definition, use cases, validation approach. No "Simba" product name mentioned.
7. **Synthetic Consumers practical guide** (Feb 2026, Rismal/Swadi/Fiaschi) — 90% alignment with human data, 85% distributional similarity, <24h research cycles, 50%+ of market research by 2027. 5-step methodology. SSR + RAG + ResponseRater tools.
8. **Innovation Lab CPG** (Jun 2025, Nina Rismal) — Integrated platform: agentic workflows + synthetic consumers for CPG product development. 5 services: Intelligent Briefs, AI Expert Evaluation, Design Refinement, Synthetic Consumer Testing, Market Simulation. 90% alignment with real consumer responses.
9. **Colgate-Palmolive Part 2** (Oct 2025, Vincent/Vieira) — Nested Logit Discrete Choice Model. Incremental vs. cannibalistic sales in saturated CPG market. Proprietary PyMC tooling for arbitrary-depth nested logit with semi-automated priors.
10. **How Realistic Are Synthetic Consumers** (Jun 2025, Allen Downey) — GSS validation study. Large LLMs match random forest on party ID prediction. GPT-o3-mini + Gemini 2.0 Flash occasionally outperform supervised baseline. Demographic grounding essential.
11. **From Uncertainty to Insight** (Sep 2023, Tiaan Van Der Merwe) — Bayesian value prop vs. ML. Business applications. Company positioning.

**New clients discovered:** Fox Entertainment (coaching program), Fabletics (MMM).
**Key gap:** "Simba" product name not in any web content — needs Discord confirmation.
**Output:** analysis/website-scrape/crawl-remaining.md

---

## 2026-03-13 — website-contact
Fetched https://www.pymc-labs.com/contact/. Contact page has a form (First/Last Name, Email, Phone optional, Inquiry Category dropdown, Discovery Source dropdown, Message). Email: info@pymc-labs.com. No phone, no address, no calendar booking. 5 inquiry categories reveal product names: Expert Access Program, Workshop, Consulting And Custom Bayesian Models, MMM Insights Agent, General Inquiry. Social links: LinkedIn, GitHub, X, Bluesky, YouTube, Meetup. Wrote analysis/website-scrape/contact.md + content/contact.md (status: complete). Discovered new aspect: enrich-expert-access-program ("Expert Access Program" is in contact form dropdown but has no sitemap page).

---

## 2026-03-13 — website-courses

**Aspect**: website-courses
**Source**: https://www.pymc-labs.com/courses/ + /applied-bayesian-modeling/ + /bayesian-marketing-analytics/ + /applied-bayesian-regression-modeling/
**Output**: analysis/website-scrape/courses.md

### What was found

- **3 live courses** + Custom Workshops offering
- **ABM (Applied Bayesian Modeling)** — $1,499 (was $1,699); Jan–Feb 2026 cohort; instructors: Chris Fonnesbeck, Allen Downey, Vianey Leos Barajas; no prior Bayesian experience required
- **BMA (Bayesian Marketing Analytics)** — $2,249 (was $2,499); Feb 2026 cohort; instructors: Timothy McWilliams (lead), Colt Allen, Ben Vincent, Carlos Trujillo; intermediate Python + marketing domain required
- **ABR (Applied Bayesian Regression Modeling)** — $1,499 (was $1,699); Mar 2026 cohort; instructors: Juan Orduz, Ben Vincent, Nathaniel Forde; introductory Bayesian exposure required
- **CI Course from sitemap** — No /causal-inference/ course page found (404); CI likely maps to ABR (contains causal inference module in Week 4)
- **Shared format** — 4 weeks, 8×2h live sessions, recordings, private GitHub repo (8-week access post-course), Discord instructor support, LinkedIn certificate
- **Pricing contact**: [email protected] for invoices, [email protected] for team/corporate rates
- **Tools taught**: PyMC (ABM+ABR), Bambi (ABR), PyMC-Marketing (BMA), CausalPy (BMA+ABR), ArviZ (ABR)

### Key observations

- Full week-by-week curriculum captured for all 3 courses — sufficient for content/courses/ pages
- Course instructors overlap with team roster (all are PyMC Labs employees or close collaborators)
- Vianey Leos Barajas (ABM) is listed as U of Toronto professor — not on team page; may be guest instructor
- Custom Workshops section has no separate URL — content for that section must come from Discord or Halah draft

---

## 2026-03-13 — website-case-studies

**Aspect**: website-case-studies
**Source**: https://www.pymc-labs.com/sitemap-0.xml + individual blog post URLs
**Output**: analysis/website-scrape/case-studies.md

### What was found

- **No /case-studies/ page** exists (returns 404). Case studies are published as blog posts under /blog-posts/
- **Full sitemap discovered**: 92 URLs via sitemap-0.xml (home, contact, team, courses×4, blog×66, benchmarks×3, legal×2)
- **10 confirmed case studies** extracted from blog posts:
  1. **Akili** (2023-01) — Cognitive modeling for ADHD digital therapeutics; LANs + likelihood-free inference
  2. **Salk Institute** (2022-12) — Hierarchical Bayesian for public opinion survey data; MrP + Gaussian Processes
  3. **HelloFresh MMM overview** (2022-11) — Bayesian MMM with hierarchical GPs
  4. **HelloFresh Reducing CAC** (~2021) — 60% variance reduction, 10x speedup for MMM
  5. **HelloFresh A/B Tests** (~2022) — 60x speedup for overnight A/B test batch pipeline (5-6 hrs → 5-6 min)
  6. **Alva Labs** (2022-10) — Bayesian IRT / Graded Response Model for personality assessment
  7. **Indigo Ag** (2022-08) — Spatial Gaussian processes for agricultural field trials
  8. **Everysk** (2021-02) — Bayesian VC index from private equity cash flows; finance
  9. **Colgate-Palmolive Synthetic Consumers** (2025-10) — SSR methodology; 90% correlation with human surveys
  10. **Colgate-Palmolive Causal Sales** (2024-09) — Incremental vs cannibalistic sales analytics (follow-up post pending)
- **Clients mentioned without dedicated case study posts**: SpaceX, Roche, Netflix, Deliveroo, Ovative Group, Haleon
- **Sitemap gap confirmed**: No /services/, /industries/, /solutions/, /partners/, /resources/, /about/, /case-studies/ pages currently exist — all new

### Key observations

- Halah draft site (Framer) will be the primary source for new page structures not present on current site
- Discord channels for Roche (5,276 msgs), VisualVest (5,283), Live Nation (4,563) will be primary source for additional case studies
- Arc-Brown, Appodeal referenced in discord triage but no blog posts found

---

## 2026-03-13 — website-home

**Aspect**: website-home
**Source**: https://www.pymc-labs.com/
**Output**: analysis/website-scrape/home.md

### What was found

- **Hero**: Headline "Bayesian AI Consultancy", 3-sentence subheading emphasizing open-source, transparency, and solving problems where traditional ML fails
- **Services (5)**: Modeling & Optimization, AI Systems, Courses & Speaking, Strategy & Technical Advising, Roadmap Acceleration
- **Value prop**: Founded by creators of PyMC; interpretable solutions; requires significantly less data than conventional ML
- **6 testimonials**: Colgate-Palmolive (Iraklis Pappas, Global Head of AI), SALK (Tarmo Jüristo, CEO), Akili (Titi Alailima, VP Applied Data), Indigo (Manu Martinet, Lead Data Scientist), Ovative Group (Tim McWilliams, Sr. Manager Data Science), Haleon (Nathan Kafi, Principal Data Scientist)
- **3 OSS projects highlighted**: PyMC Marketing (MMM), CausalPy (causal inference), PyMC (probabilistic programming)
- **CTA**: "Let's talk about your next breakthrough!"
- **Nav**: Home, About, Blog, Courses, Resources, Contact us (no Services/Industries/Solutions/Partners/Case Studies in nav)
- **Footer socials**: Bluesky, X, Meetup, YouTube, LinkedIn

### Key observations

- Current nav does NOT match new sitemap — major restructuring planned
- No case studies on home page; no partner logos; no team section
- "Bayesian AI Consultancy" is the brand identity statement (footer also says "The Bayesian AI Consultancy")

---

## 2026-03-13 — website-about

**Aspect**: website-about
**Source**: https://www.pymc-labs.com/about/ + https://www.pymc-labs.com/team/
**Output**: analysis/website-scrape/about.md

### What was found

- **Company positioning**: "We are the inventors of PyMC, the leading platform for statistical data science. We have launched a consultancy to turn our expertise into your advantage."
- **Team composition**: "PhDs, mathematicians, neuroscientists, engineers, and social scientists"
- **32 team members** listed, 5 Partners + 27 team members
- **Partners**: Dr. Thomas Wiecki (PhD CompCogNeuro, Brown; ex-Quantopian VP), Dr. Christian Luhmann (PhD Psych, Vanderbilt; ex-Stony Brook Prof), Dr. Luca Fiaschi (PhD CS, Heidelberg; ex-HelloFresh VP DS, ex-Mistplay CDAIO), Niall Oulton (MSc Econometrics Bristol; PyMC-Marketing), Joe Wilkinson (BSc Econ Sheffield; ex-Gain Theory Senior Partner)
- **Key team bios captured**: Allen Downey (Olin Prof Emeritus, Think Python author), Christopher Fonnesbeck (PyMC creator, Vanderbilt Adjunct, ex-MLB), Colt Allen (Principal DS, CLV lead), Daniel Saunders (pricing/marketing Bayesian), Juan Orduz (PhD Math Berlin), Andrew Heusser (PhD CogNeuro NYU), Bernard Mares (PhD math physics MIT), Eliot Carlson (Yale+Columbia), Francesco Muia (PhD physics, Hawking Fellow), Halah Joseph (AI/consulting), Jake Piekarski (MMM), Kusti Skytén (Cambridge stats)
- **Individual team member pages** confirmed at /team/{slug}/ — contain richer bios
- **12 team members with no bio** in scraped content (Benjamin Maier, Erik Ringen, Kemble Fletcher, Maxim Laletin, Mengxing Baldour-Wang, Nina Rismal, Olivera Stojanovic, Oriol Abril Pla, Pablo de Roque, Purna Mansingh, Sandra Meneses, Teemu Säilynoja, Titi Alailima, Ulf Aslak)
- **No founding year** or company history narrative on site
- ~18 client logos on about page, unlabeled in HTML

### Key observations

- New aspect needed: website-team-individual-pages (scrape all 32 /team/ slugs for full bios)
- Company story must come from Discord or other source — not on website

---

## 2026-03-13 — discord-index

**Aspect**: discord-index
**Source**: input/discord/index.jsonl (6192 lines) + input/discord/users.jsonl (443 lines)
**Output**: analysis/discord-channel-map.md

### What was found

- **309 text/forum channels** across 18 category buckets
- **5883 threads** (public threads embedded in channels, lines 309-6192 of index.jsonl)
- **443 users** (non-bot), including ~15 bots

### Key findings

**Category structure** (18 categories identified):
- GENERAL: Social, tech, stats discussions (low relevance)
- INTERNAL OPS: org, website, competition, strategy channels (HIGH relevance)
- SALES/LEADS: inbound-leads with 3,815 msgs (HIGH relevance for value props)
- MARKETING & PARTNERSHIPS: marketing (5,956 msgs), sales, partner channels (HIGH)
- PYMC ECOSYSTEM: pymc-marketing (9,682 msgs), simba (292), causalpy (510), pymc-ecosystem
- PRODUCTS/SOLUTIONS: decision-ai (1,508), synthetic-consumers (3,036), decision-web-app-dev (1,128)
- TRAINING: open-cohort-workshop (1,110), bayesian-mktg-analytics-course (479)
- BAIN: bain-brand (10,111 msgs!) — major partner
- READYSTATE/RX: readystate (18,308 msgs!) — major product

**Industries discovered from client channels**:
- Pharma/Biotech: Roche, Takeda, Haleon, Erisyon, Akili
- CPG: Colgate (3+ projects), P&G, Swarovski, Nomad Foods, Hill's Pet
- Retail/E-com: HelloFresh, L.L.Bean, Fabletics, Lidl, Wegmans, MercadoLibre
- Finance/Insurance: VisualVest, Nuernberger, Everysk, PayPal, Schwab, Bondora
- Agriculture: Indigo, Syngenta
- Gaming: Supercell, Hard Rock, Appodeal
- Sports: Real Madrid, LA Dodgers
- Media/Marketing: Gain Theory, Live Nation, Fox, Audible, Bloomberg

**Team members identified** (from users.jsonl):
- Halah (lomjeh)
- Eric Ma (ericmjl)
- Oriol (oriolabril)
- Luciano (lucianopaz)
- Chris Fonnesbeck (fonnesbeck)
- Juan Orduz (juanitorduz)
- Gabriel Stechschulte (gstechschulte)
- Alexander Fengler (alexfengler)
- Tomi (tcapretto)
- Jesse Grabowski (diffyq.)
- Adrian Seyboldt (adrian.seyboldt)
- Thomas Pinder (thomas1338)
- Stephan Mai (stephan.mai.pymc)
- Can Karaoguz (ecankaraoguz)
- Jonas Ek (jonasekobe)
- McKenzie Folan (mfolan3)
- Tonya Waite (tonya.waite)
- Francisco Peredo (franciscoperedo)
- Mauricio Martinez L (mauriciomartinezl)

### Priority queue for Wave 2 mining

Top channels by msg_count and sitemap relevance:
1. readystate (18,308) — product
2. bain-brand (10,111) — major partner
3. pymc-marketing (9,682) — OSS
4. colgate-shelf-optim (8,387) — case study (CPG)
5. colgate-cannibalization (6,532) — case study (CPG)
6. core-only (6,693) — internal (restricted?)
7. roche (5,276) — case study (Pharma)
8. visualvest (5,283) — case study (Finance)
9. live-nation (4,563) — case study (Media)
10. rx-dashboard (4,649) — product
