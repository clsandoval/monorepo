# Discord #competition Channel — Competitive Intelligence Extraction

**Channel:** `#competition` (777562141250027561)
**Messages analyzed:** 1,366
**Date range:** 2020-11-15 → 2026-03-13
**Also reviewed:** [Done] Unfair competition thread (63 msgs, Aug 2025) — no separate file found

---

## 1. Named Competitors — Full Roster

### MMM Open-Source Tools

| Competitor | Type | Status |
|---|---|---|
| **Robyn** (Meta/Facebook) | Open-source MMM in R | Declining — last PR 4 months old as of Oct 2025 |
| **Lightweight MMM** (Google) | Open-source MMM in JAX | Dead — "seems like lightweight-mmm isn't even developed anymore" (Thomas, Nov 2023) |
| **Meridian** (Google) | Proprietary MMM framework | Active but contested |

### MMM SaaS / Commercial Platforms

| Competitor | Type | Notes |
|---|---|---|
| **Recast** | Bayesian MMM SaaS | Most-tracked competitor; founder Tom Vladeck = personal friend of Thomas Wiecki |
| **Analytic Partners** | Legacy MMM agency/software | Largest by revenue ($60–100M/yr); models in Excel or R |
| **Gain Theory** | MMM consultancy/SaaS | Forrester Wave participant; DoorDash client noted |
| **Ekimetrics** | MMM consultancy/platform | Mentioned Jul 2023 |
| **Mass Analytics** | MMM SaaS | Writing on Google blog; seen as differentiated niche |
| **Aryma Labs** | MMM SaaS/tools | Self-described "world's most innovative Marketing Science company"; dismissed by PyMC Labs team |
| **Nielsen MMM** | Legacy MMM | Acquired by Circana (Aug 2024) |
| **Sellforte** | MMM SaaS (Finland) | Stan-based; no custom priors/adstock exposed; "displays results only" |
| **Mutinex** | MMM SaaS (Australia) | Claimed PyMC-Marketing "performs worst" in benchmark — using default priors on old version; benchmark later unpublished |
| **Kipi.ai** | MMM SaaS | On Snowflake Marketplace |
| **Cassandra** | MMM app on Meridian | Raised $2M (Mar 2025) |
| **INCRMNTAL** | Incrementality measurement | Anti-MMM positioning; "replaces MMM guesswork with live causal measurement" |
| **Lifesight** | MTA/marketing data platform | Trusted by 500+ brands incl. GroupM, Accenture, McDonald's |

### Consulting / Big 4 / Strategy Firms

| Competitor | Notes |
|---|---|
| **BCG (BCG Gamma)** | "Fabriq" MMM product; "Marketing Catalyst" optimizer; Python-to-Stan-back-to-Python; seen at Diageo — "wasn't too good but looked a bit fancy" |
| **McKinsey** | Has dedicated causal inference function; open-sourced "CausalNex" library |
| **Accenture** | Mentioned as Lifesight client; indirect overlap |
| **Fractal Data** | Australian Bayesian consultancy; charges starting at $80K; CEO Gireesh reached out to PyMC Labs to upskill his team |

### Experimentation / Adjacent Platforms

| Competitor | Notes |
|---|---|
| **Eppo** | Geo-lift experimentation SaaS; raised Snowflake Ventures Series B (Oct 2024); a presenter at their webinar uses pymc-marketing; potential partner |
| **Statsig** | Eppo's main competitor for A/B testing |
| **Lift Lab** | Quasi-competitor; head of data science "in love with us" |
| **Pecan.ai** | ML prediction SaaS; ChatGPT-style interface; advertising heavily on LinkedIn |

### Other Named Entities

- **Jumping Rivers** — R-based Bayesian consultancy; cited as early inspiration for PyMC Labs business model (Nov 2020)
- **App Orchid** — LLM-branded Bayesian consulting firm; actually hires data scientists to build in NuMPyro; "a Bayesian consulting firm under the hood w/ LLMs as a flashy tool to draw investment dollars" — Daniel, Apr 2024
- **RxInfer / Lazy Dynamics** — Dutch startup; Julia-based Bayesian inference claiming "300x faster" — team skeptical ("Saw '300x faster' and I was like, there's gotta be a tradeoff there" — Eric Ma, Apr 2025)
- **Mutinex** — Also launched "Hendren" product (LLM connected directly to MMM); patent-pending campaign-varying model
- **Scanmar** — Mentioned Jan 2026; acquisition context; potentially reaching out to PyMC Labs for capability building
- **Relex** — Supply chain SaaS; clients (DoorDash, Deliveryhero) left because it was "too expensive and backboxy" — Juan Orduz, Feb 2026
- **Probabl.ai** — sklearn consultancy (noted Sep 2024)
- **Ebiquity** — Major agency now publishing Bayesian MMM (Jul 2023)
- **Retina.ai** — CLV SaaS; Starter package $3,999/month (<2M customers)

---

## 2. Meridian (Google) — Detailed Intel

- **Architecture direction:** "From what I'm reading online, Meridian seems to move towards more of a custom MMM programming language, rather than a plug and play model." — Niall, Mar 2024
- **Google doesn't prioritize it:** "Meridian is probably less than 0.000001% of their revenue stream…and that's being generous." — unnamed community member, Jul 2024
- **Failure signals:** "More indications Meridian is failing? Maybe" — Niall, Jul 2024, after Google scrapped cookie deprecation plans
- **Access-gated:** Required invite/beta access; Luca requested access through Mistplay account (Nov 2024)
- **No public comparison published:** "Given that no one really knows what Meridian is, no [we don't have a head-to-head comparison]." — Christian, Nov 2024
- **Prior parameterization** = main technical distinction; Thomas noted "the main thing is the prior parameterization via ROI"
- **PyMC-Marketing response strategy (Feb 2026):** Juan Orduz created a notebook replicating Meridian's core MMM using PyMC-Marketing splines: "So if we are ever asked 'how do we compare?' We could kind of answer 'well, that is irrelevant because we can easily build a similar model with our PyMC-Marketing stack, see here'" — Juan Orduz, Feb 2026. "In the notebook we do not mention anything about meridian or alternative models."
- **Copycat dynamic:** A PyMC Labs blog post was being circulated in Meridian's Discord (Dec 2025) with positive reception. Luca: "these guys are really copying us step by step."
- **Ecosystem activity:** Cassandra raised $2M to build an MMM app on top of Meridian (Mar 2025). Juan noted Meridian is "very active" in PRs/features as of Oct 2025.

---

## 3. Robyn (Meta) — Intel

- **Declining:** "Is Facebook Robyn out of the game? PyMC-Marketing and Google Meridian are very active, while the latest PR in Robyn was merged 4 months ago, and there are no real active PRs. Also, no more buzz nor more features." — Juan Orduz, Oct 2025
- **Python implementation** announced Nov 2023; team noted the name "robyn" was already taken on PyPI
- **Strategic opportunity:** "Every Robyn user and marketer is going to be exposed to pymc-marketing in an event we don't have to push" — Niall, Nov 2023
- **Facebook axed its entire probability team** (including Bean Machine people) — Nov 2022 — seen as potential influx of open-source developers to PyMC and signal that consulting is more cost-effective than in-house

---

## 4. Recast — Detailed Intel

Most-tracked competitor. Tom Vladeck (founder) has a personal relationship with Thomas (PyMC Labs CEO), having worked together on the Kevin Systrom COVID model.

**What Recast is:** Bayesian MMM SaaS; $3.4M raised (Jan 2023)

**Key weaknesses observed:**
- "Recast have gone really weird recently. Seem to have gone bold in their opinions on what's right/wrong. But they're talking absolute nonsense in what they're saying to make themselves a niche. Push the rhetoric that models should only include media and nothing else — which gives a cost advantage for them if they manage to sell that idea." — Niall, Oct 2023
- "Recast have a very negative approach to sales, which will only get you clients who are also quite negative, so probably aren't the most fun to work with." — Niall, Oct 2024
- Backend unknown ("Stan, pymc, the BOOM library?" — Daniel, Oct 2024)

**Team attrition signals (competitive instability):**
- Demetri Pananos left Recast (Oct 2024)
- Chelsea Parlett left Recast (Oct 2025)
- Taylor Rock left Recast (Feb 2026) — "one of the main guys"

**Recast's page about PyMC Labs (Mar 2023, since taken down):**
"So basically Recast wrote a press release for us and suggests that you can either use pymc-marketing to roll your own MMM (if you know what your doing/you're willing to 'roll up your sleeves'), but that many would need some help/guidance — and instead of a call to action for Labs, it finishes with an invite to get in touch with Recast." — Christian, Mar 2023

"Pretty high praise from a competitor with a for-pay (and mysteriously blackboxed) alternative." — Christian, Mar 2023

**New products:** Recast launched "GeoLift by Recast" (Sep 2025); Tom Vladeck published Recast's key priors (Oct 2024 LinkedIn post)

---

## 5. Analytic Partners — Intel

- **Largest by revenue:** "$60–100 million a year" — Niall, Jun 2023
- **Weakness:** "Generally their software is pretty crap though. Their modeling either done in excel or R." — Niall, Jun 2023
- **Forrester Wave:** Featured prominently; Niall describing Forrester as "a made up club where you pay a company 80k a year to evaluate you and say you're good. But the evaluators also don't know what they're talking about." — Niall, Aug 2024

---

## 6. BCG (BCG Gamma) — Intel

- "Fabriq" = BCG's productionized MMM framework; "Marketing Catalyst" = their optimizer tool
- Solution is "very disjointed, e.g. python to stan back to python" — Niall, May 2023
- Niall saw it at Diageo: "wasn't too good but looked a bit fancy"

---

## 7. Nielsen → Circana — Intel

- Nielsen's Marketing Mix Modeling business acquired by Circana (August 2024)
- Team saw this as further market disruption favoring the Bayesian/open-source approach

---

## 8. Mutinex Benchmark Controversy (Dec 2025)

- Mutinex presented benchmark claiming PyMC-Marketing "performs worst"
- Upon contact with Mutinex CEO, clarification: benchmark used default priors on an older version
- Benchmark was subsequently **unpublished**
- Luca: "their code is actually still online and he pointed me out to [the eval notebook] but they do not publish the data nor the configuration of the models they use so it is kind of pointless."
- Luca: "Interesting these guys now claiming our library perform the worst but they unpublished their open source benchmark."

---

## 9. Competitive Positioning — How PyMC Labs Differentiates

### Open Source vs. Black Box
- "It's powerful, especially in a world drowning in black box ML." — Christian, Jun 2023
- Recast: "mysteriously blackboxed alternative" — Christian
- Sellforte: "doesn't seem to expose custom priors, adstock, EDA, etc. Seems to only display the results" — Kusti Skytén, Sep 2025

### Full Flexibility vs. Fixed Models
- PyMC-Marketing allows custom priors, adstock functions, full EDA — vs. SaaS tools that give you only their model
- Meridian going toward "custom MMM programming language rather than a plug and play model" — framed as their limitation

### Consulting + Open Source = Unique Model
- "This problem [open-source tools require technical skill] is literally our value proposition." — Jesse Grabowski, Sep 2024
- PyMC Labs bridges open-source power with expert consulting
- Fractal Data competitor CEO reached out wanting to upskill their own team on Bayesian/Causal Inference

### Scientific Rigor / Bayesian Advantage
- "We have the Bayesian angle which is unique." — Andy Heusser, May 2025
- CausalPy "competitive advantage if we can make CausalPy use previous experiments to gain precision and power" — Juan Orduz, Sep 2025
- "He sees us as laying down the infrastructure and that our decisions will decide the future of marketing analytics." — Christian (quoting Jon Lorenzini, Lift Lab head of DS), Oct 2024

### Market Timing / Thought Leadership
- "Major MMM agencies are now openly pushing and publishing Bayesian MMM. Before these types of agencies generally would be secretive or discredit it, as their systems couldn't do it." — Niall, Jul 2023
- "I think we really are shaking up the market now." — Niall, Sep 2024

### OSS as Distribution Moat
- Competitors write about pymc-marketing; Robyn users discover it; Eppo webinar presenters use it — all organic
- "Every Robyn user and marketer is going to be exposed to pymc-marketing in an event we don't have to push" — Niall, Nov 2023
- Recast's own page drove traffic/validation to PyMC-Marketing

---

## 10. Pricing Comparisons

| Entity | Price Point | Source |
|---|---|---|
| **Fractal Data** (Bayesian consultancy, Australia) | Starts at $80K | Thomas, Oct 2023 |
| **Retina.ai** (CLV SaaS) | $3,999/month starter | Christian, Jun 2023 |
| **Forrester Wave inclusion** | ~$70–80K/year | Niall, Aug 2024 |

---

## 11. Objection Handling — "Why Not Use X Instead?"

**vs. Meridian:**
"So if we are ever asked 'how do we compare?' We could kind of answer 'well, that is irrelevant because we can easily build a similar model with our PyMC-Marketing stack, see here'" — Juan Orduz, Feb 2026 (pointing to Meridian-replication notebook that doesn't mention Meridian)

**vs. Recast:**
Thomas (Oct 2023): "we're still friends with him [Tom Vladeck]… he's actually a friend of Labs. We're not really competition per se because we don't sell anything." (Positioning Labs as non-competing on the SaaS axis when they weren't yet charging for software)

**vs. Open-Source tools generally:**
Jesse Grabowski (Sep 2024): "This problem is literally our value proposition." — in response to SaaS argument that open-source requires too much technical skill

**vs. BCG/Big Consulting:**
BCG solution: "disjointed" and "fancy but not too good" — quality differentiation, not price competition

---

## 12. Win/Loss Signals

### Wins
- **Website traffic:** Thomas (Aug 2023): "Wow, interesting that we beat them" — comparing SimilarWeb traffic against unnamed competitor
- **Eppo webinar:** "The data scientist from the Eppo webinar uses pymc marketing." — Juan Orduz, Nov 2024 (organic adoption signal)
- **Recast's press release:** Recast's own page about PyMC Labs drove traffic/validation to PyMC-Marketing (Mar 2023)
- **Gain Theory Forrester win:** Niall's Bayesian approach for DoorDash landed Gain Theory in Forrester's top quadrant
- **CLV vendor built on pymc-marketing:** Two years before Aug 2025, a vendor pitched a CLV product built with pymc-marketing — Colt, Aug 2025
- **1749 client** uses PyMC-Marketing and writes positive blogs about it — Niall, May 2024

### Losses
- **Stan loss (Apr 2023):** After a PyMC workshop, Lidl decided to go with Stan for their team — Ben Vincent (semi-joking, sourced from a LinkedIn post by Rebecca Taylor)
- **Cassandra raising $2M on Meridian** (Mar 2025): Ecosystem momentum going to Meridian-based tools

### Near-Miss / Competitive Intel
- **Fractal Data (Oct 2023):** Could "help us more than hurt us" — CEO reached out wanting to upskill team
- **Lift Lab (Oct 2024):** Head of DS "in love with us even though we are quasi-competitors"

---

## 13. Key Verbatim Quotes for Content Use

> "Analytic partners probably the largest in terms of revenue, about 60–100 million a year. Generally their software is pretty crap though. Their modeling either done in excel or R." — **Niall**, Jun 2023

> "Recast have gone really weird recently… talking absolute nonsense in what they're saying to make themselves a niche. Push the rhetoric that models should only include media and nothing else — which gives a cost advantage for them if they manage to sell that idea." — **Niall**, Oct 2023

> "Recast have a very negative approach to sales, which will only get you clients who are also quite negative, so probably aren't the most fun to work with. It's why I think it's important to always focus on your own positives and what you can deliver in value to the client when doing sales, you generally attract the right clients people enjoy working with." — **Niall**, Oct 2024

> "Given that no one really knows what Meridian is, no [we don't have a head-to-head comparison]." — **Christian**, Nov 2024

> "Meridian is probably less than 0.000001% of their revenue stream…and that's being generous." — anonymous community member, Jul 2024

> "More indications meridian is failing? Maybe." — **Niall**, Jul 2024

> "So basically Recast wrote a press release for us and suggests that you can either use pymc-marketing to roll your own MMM (if you know what your doing/you're willing to 'roll up your sleeves'), but that many would need some help/guidance — and instead of a call to action for Labs, it finishes with an invite to get in touch with Recast." — **Christian**, Mar 2023

> "Pretty high praise from a competitor with a for-pay (and mysteriously blackboxed) alternative." — **Christian** (about Recast's page on PyMC Labs), Mar 2023

> "This problem is literally our value proposition." — **Jesse Grabowski**, Sep 2024 (in response to SaaS competitor argument that open-source is too hard)

> "Every Robyn user and marketer is going to be exposed to pymc-marketing in an event we don't have to push." — **Niall**, Nov 2023

> "Seems like lightweight-mmm isn't even developed anymore." — **Thomas**, Nov 2023

> "He sees us as laying down the infrastructure and that our decisions will decide the future of marketing analytics." — **Christian** (quoting Jon Lorenzini, head of DS, Lift Lab), Oct 2024

> "I think we really are shaking up the market now." — **Niall**, Sep 2024

> "So if we are ever asked 'how do we compare?' We could kind of answer 'well, that is irrelevant because we can easily build a similar model with our PyMC-Marketing stack, see here'." — **Juan Orduz**, Feb 2026

> "Interesting these guys now claiming our library perform the worst but they unpublished their open source benchmark." — **Luca** (about Mutinex), Dec 2025

> "He has clarified that in the presentation he had specified that PyMC Marketing was run using default priors (and probably in an older version)." — **Luca**, Dec 2025

> "So sounds like a Bayesian consulting firm under the hood w/ LLMs as a flashy tool to draw investment dollars." — **Daniel** about App Orchid, Apr 2024

> "Major MMM agencies are now openly pushing and publishing Bayesian MMM. Before these types of agencies generally would be secretive or discredit it, as their systems couldn't do it." — **Niall**, Jul 2023

> "It's powerful, especially in a world drowning in black box ML." — **Christian**, Jun 2023

> "A made up club where you pay a company 80k a year to evaluate you and say you're good. But the evaluators also don't know what they're talking about." — **Niall** on Forrester Wave, Aug 2024

> "Saw '300x faster' and I was like, there's gotta be a tradeoff there." — **Eric Ma**, Apr 2025 (about RxInfer/Lazy Dynamics)

> "We have the Bayesian angle which is unique." — **Andy Heusser**, May 2025

---

## 14. Structural Observations

- **Recast = primary tracked SaaS competitor** — monitored across 2022–2026; significant team attrition visible
- **Meridian = market-validation signal, not direct threat** — Google doesn't prioritize it; no head-to-head needed
- **Robyn effectively dead** as of late 2025; Lightweight MMM died ~Nov 2023
- **BCG/big consulting = technically inferior** but have enterprise distribution; PyMC Labs responds with quality differentiation
- **Analytic Partners = incumbent legacy player** (Excel/R, $60–100M revenue) — clearest "we're better" positioning
- **Open-source strategy = distribution and lead-generation moat** — competitors write about pymc-marketing, driving organic discovery
- **Eppo = potential partner**, not competitor, in experimentation/geo-lift space
- **Nielsen acquisition by Circana (Aug 2024)** = further market disruption favoring PyMC Labs' approach
- **Forrester Wave** = team views it skeptically ("made up club, $80K/year"); not a priority certification target
