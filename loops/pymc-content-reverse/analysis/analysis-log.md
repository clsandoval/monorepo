# Analysis Log — PyMC Content Gathering

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
