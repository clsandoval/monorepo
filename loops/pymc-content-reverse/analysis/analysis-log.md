# Analysis Log — PyMC Content Gathering

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
