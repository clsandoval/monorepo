# Analysis Log — PyMC Content Gathering

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
