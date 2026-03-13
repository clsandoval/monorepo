# Discord PyMC Ecosystem Extraction
_Channels: #pymc-marketing (948587000464834580, 9,682 msgs), #causalpy (1366439732304805948, 510 msgs), #pymc-ecosystem (1350662557161095168, 127 msgs)_
_Date: 2026-03-13_

---

## Channel Stats

| Channel | ID | Messages | Date Range |
|---|---|---|---|
| 🚀│pymc-marketing | 948587000464834580 | 9,682 | 2022-03 → 2026-03 |
| 🚀│causalpy | 1366439732304805948 | 510 | 2025-04 → 2026-03 |
| 🚀│pymc-ecosystem | 1350662557161095168 | 127 | 2025-03 → 2026-03 |

---

## pymc-marketing (#pymc-marketing)

### Description & Positioning

Official: "Bayesian marketing toolbox in PyMC. Media Mix (MMM), customer lifetime value (CLV), buy-till-you-die (BTYD) models and more."

Thomas's strategic framing:
> "my main motivation is that I want us to build analytics packages that target certain verticals. those consist of an open source package like pymc-marketing but can also be combined with an Insight Agent. these can be deployed locally, on the cloud, or on databricks" — Thomas, #pymc-ecosystem, 2025-03-16

### GitHub Stats (as of March 2026)
- **URL**: https://github.com/pymc-labs/pymc-marketing
- **Stars**: ~1,088
- **Forks**: ~372
- **License**: Apache 2.0
- **Commits**: 1,264+ on main
- **Open Issues**: 393 | **Open PRs**: 29
- **Install**: `pip install pymc-marketing` or `conda create -c conda-forge -n marketing_env pymc-marketing`
- **Docs**: https://www.pymc-marketing.io/

### Key Feature Modules

**Media Mix Modeling (MMM):**
- Adstock transformations (geometric, weibull, delayed)
- Saturation effects (logistic, tanh, hill)
- Time-varying intercepts and media contributions
- Budget optimization with posterior uncertainty
- Lift test integration and scenario planning
- Counterfactual analysis
- GPU acceleration (BlackJax, NumPyro, Nutpie samplers)
- Causal discovery integration

**Customer Lifetime Value (CLV):**
- BG/NBD model (Buy Till You Die)
- Pareto/NBD model
- Gamma-Gamma model (monetary value)
- Discrete and continuous transaction modes
- Customer segmentation and scoring

**Customer Choice Analysis (CSA):**
- Discrete choice models
- Nested logit
- Bass Diffusion Model for product adoption
- Multivariate Interrupted Time Series (MVITS)

### Notable Team Members / Contributors
- **Juan Orduz** — Primary architect and lead contributor (~1,890 msgs in channel)
- **Ricardo** — Core developer (~1,080 msgs)
- **Will Dean** — Contributor (~769 msgs)
- **Thomas Wiecki** — Strategy/founder (~1,165 msgs)
- **Ben Vincent** — Reviewer/contributor (~991 msgs)
- **Carlos Trujillo** — Contributor (~1,271 msgs)

### Version Milestones (from Discord)
- v0.2.0, v0.3.0 — early releases (2023)
- PyMC 3→4→5 migration
- PyTensor backend migration (from Theano/Aesara)
- Numba default backend testing
- PyMC.dims integration (in progress, Feb 2026)
- JOSS paper submission (Jan 2026): `pymc-marketing JOSS paper` thread
- 1M+ downloads milestone
- Monorepo migration in progress (splitting MMM / CLV / Customer Choice into sub-packages)

### Key Quotes

> "CausalPy + PyMC-marketing are meant to work together: we should always calibrate mmms" — Juan Orduz, #causalpy, 2025-04-29

> "We should be pushing our clients to think 'causally' about MMMs. This is a big differentiator vs. competitor agencies." — Juan Orduz, #causalpy

> "Having these type of models in our 'pymc marketing package' would be really amazing!" — contributor, #pymc-marketing, 2022-03-22

> "PyMC Labs offers custom model development, dedicated coaching, and SaaS solutions for enterprise implementation." — GitHub README copy

### Use Cases (from discussions)
- Budget allocation across marketing channels
- Marketing attribution and incrementality testing
- Customer lifetime value prediction
- Funnel optimization (upper and lower funnel)
- Cannibalization effects modeling
- Seasonal and time-varying ROI analysis
- Multi-market simulations and counterfactual analysis
- CAC (customer acquisition cost) optimization
- Integration testing with real client projects (HelloFresh, Colgate, Wegmans)

### Integration with Products
- **Simba (MMM SaaS)**: Uses pymc-marketing as engine; planned swap to newer version
- **Decision AI / MMM Agent**: Runs on pymc-marketing; Databricks deployment via MLflow
- **CausalPy**: Calibration bridge — CausalPy geo-lift results → pymc-marketing priors
- **Insight Agents**: Layered on top for natural language querying of model results

### Thread Topics (notable)
- "JOSS paper" (Jan 2026) — academic publication of pymc-marketing
- "Causal Discovery into pymc-marketing" (Feb 2025)
- "CausalPy issue of interest to pymc-marketing" (Feb 2026)
- "solution for serializations issues" (Mar 2026)
- "Levels of novelty in pymc-marketing!" — feature novelty taxonomy
- "best community resources around pymc-marketing" (Oct 2025)
- "pymc-marketing MMM" — product direction thread (Dec 2024)

---

## CausalPy (#causalpy)

### Description & Positioning

Official: "A Python package for causal inference in quasi-experimental settings."

Ben Vincent's strategic framing:
> "There is considerable scope to improve CausalPy as a lead generator. One aspect would be to move away from emphasising features, and instead present it as a solution to business problems where you can't perform experiments." — Ben Vincent, #causalpy, 2025-04-29

### GitHub Stats (as of March 2026)
- **URL**: https://github.com/pymc-labs/CausalPy
- **Stars**: ~1,123 (approaching 1,000 milestone as of Jan 2026, now past it)
- **Forks**: ~97
- **License**: Apache 2.0
- **Version**: 0.8.0 (released March 3, 2026)
- **Commits**: 1,676
- **Open Issues**: 107
- **Codebase**: ~24,000 lines Python + ~8,146 lines in 30 notebooks = ~32,000 total
- **Install**: `pip install CausalPy` or `conda install -c conda-forge causalpy`

> "CausalPy closing in rapidly on 1000 stars. Though I think there's much more that can be done here - especially in making it into a lead generator." — Ben Vincent, #causalpy, 2026-01-25

### 10 Quasi-Experimental Methodologies
1. **Synthetic Control** — weighted combinations of control units to form counterfactual
2. **Geographical Lift** — intervention impact across geographic regions
3. **ANCOVA** — control for quantitative covariates in experimental settings
4. **Differences-in-Differences** — compare treatment/control groups over time
5. **Staggered Differences-in-Differences** — staggered treatment adoption across units
6. **Regression Discontinuity** — threshold-based treatment assignment
7. **Regression Kink Designs** — slope changes at thresholds
8. **Interrupted Time Series** — intervention effects on temporal data
9. **Instrumental Variable Regression** — handle endogeneity concerns
10. **Inverse Propensity Score Weighting** — adjust for confounding in observational studies

### Notable Team Members / Contributors
- **Ben Vincent** — Lead maintainer/architect (~320 msgs in channel)
- **Carlos Trujillo** — Key contributor (~152 msgs)
- **Thomas Wiecki** — Strategy (~61 msgs)
- **NathanielF** — Contributor (~43 msgs)

### Roadmap (from Discord)
**Priority 1 — BSTS (Bayesian Structural Time-Series):**
- Goal: Feature parity with Google's CausalImpact
- Technical: Use pymc-marketing custom components as basis
- Status: In planning (2025 Q2 discussion)

> "B) proper time series models (bsts for example). We then be at feature parity with CausalImpact" — Ben Vincent, #causalpy, 2025-04-28

> "BSTS (not state‐space) it's actually very simple with pymc-marketing, I see a nice opportunity to use pymc-marketing custom components into causalpy to add BSTS easily, and connect even more libraries." — Carlos Trujillo, #causalpy, 2025-04-28

**Priority 2 — Synthetic Difference-in-Differences:**
- Implementation planned

**In Progress:**
- Power analysis and test design optimization
- Improved experimental planning tools

**Stalled:**
- Geo selection for treatment assignment (has custom implementation available)

**Proposed:**
- Automatic PyMC calibration from causal results into pymc-marketing MMM priors

### Use Cases (from discussions)
- Geo-lift testing for marketing campaigns (multiple geographic test units)
- Incrementality testing for airline marketing campaigns
- Business problems where experiments cannot be performed (observational data)
- A/B testing validation and post-hoc analysis
- Multi-market marketing effectiveness analysis
- Policy impact assessment
- Medical intervention analysis

### Client Applications
- **Airline marketing** (unnamed client): Hungarian market testing; concern about generalizing geo-lift results across countries
- Cross-calibration with MMM: "CausalPy + PyMC-marketing are meant to work together"
- Used internally for client project validation

### Academic Citations
- Cited in ICML 2025: https://icml.cc/virtual/2025/poster/44167

> "Someone cited causalpy: https://icml.cc/virtual/2025/poster/44167" — Ben Vincent, #causalpy, 2026-02-17

### Key Quotes

> "CausalPy closing in rapidly on 1000 stars. Though I think there's much more that can be done here - especially in making it into a lead generator." — Ben Vincent, #causalpy, 2026-01-25

> "There is considerable scope to improve CausalPy as a lead generator. One aspect would be to move away from emphasising features, and instead present it as a solution to business problems where you can't perform experiments." — Ben Vincent, #causalpy, 2025-04-29

> "CausalPy + PyMC-marketing are meant to work together: we should always calibrate mmms" — Juan Orduz, #causalpy, 2025-04-29

---

## PyMC Ecosystem (#pymc-ecosystem)

### Channel Purpose
Strategy and architecture channel for the broader PyMC Labs OSS ecosystem. Focus on coordination across libraries, monorepo migration, and vertical product strategy.

### OSS Strategy Vision (Thomas)

> "my main motivation is that I want us to build analytics packages that target certain verticals. those consist of an open source package like pymc-marketing but can also be combined with an Insight Agent. these can be deployed locally, on the cloud, or on databricks" — Thomas, #pymc-ecosystem, 2025-03-16

**Three deployment/service models:**
1. "We build custom for you" (managed services)
2. "You build, we coach" (EAP / expert access)
3. Self-serve SaaS (Simba / Decision AI)

**Vertical analytics packages being planned:**
- `pymc-marketing` → Marketing vertical (shipped)
- `pymc-pharma` or similar → Pharma/biotech vertical (discussed)
- Others TBD

### Monorepo Architecture Migration

Led by Juan Orduz + Ricardo.

> "I think we should move (as suggested) as an ArviZ model. Step 1. Split and refactor the website. Step 2. Mimic the ArviZ approach of a monorepo to split the packages (we kind of have this)" — Juan Orduz, #pymc-ecosystem, 2025-03-20

**Plan:**
- Model after ArviZ's monorepo approach
- Merge repos with git history retained
- pymc-marketing → split into independently installable sub-packages:
  - `pymc-mmm` (Media Mix Modeling)
  - `pymc-clv` (Customer Lifetime Value)
  - `pymc-choice` (Customer Choice Models)
- Status: "Three repos merged with git history retained" (March 2026)

### Package Interdependencies

All PyMC Labs packages depend on core stack:
- **PyMC** (core inference engine)
- **ArviZ** (posterior analysis)
- **PyTensor** (tensor computations; migration from Theano/Aesara complete)
- **xarray** (data handling)
- **pymc-extras** (shared utilities across all packages)

### Notebook Maintenance Challenge

> "To test out a deep-agent approach to write code in the pymc-ecosystem, I've developed a CLI that migrates pymc-example notebooks... only 60 out of 136 notebooks ran without error." — Ben Maier, #pymc-ecosystem, 2025-10-31

- 60/136 PyMC example notebooks currently runnable
- Automated AI agent migration tool developed for PyMC 3→5 updates
- Proposed: Lower reviewer requirements for library version update PRs + automated testing

### Key Contributors in Channel
- **Ricardo** — Core architect (~62 msgs)
- **Ben Maier** — Notebook migration automation (~22 msgs)
- **Thomas** — Strategy/founder (~9 msgs)
- **Oriol** — Technical reviewer (~9 msgs)

---

## Expert Access Program (#expert-access-program)

_Channel ID: 1391274390050738187 | 49 msgs | 2025-06 → 2026-01_

Separate channel within PYMC ECOSYSTEM category. Not mined in full this run but noted:
- EAP is a service tier (not pure OSS)
- Connects OSS users to PyMC Labs experts
- Pricing: Base tier = Expert Lifeline; Pro tier = Deep Partnership

---

## Cross-Library Themes

### The "OSS as Lead Generator" Philosophy
Multiple discussions across channels confirm that OSS libraries (pymc-marketing, CausalPy) are explicitly positioned as lead generators for consulting services:

- Companies discover PyMC Labs through OSS → become paying clients
- "Win Win Win" model: OSS community wins → PyMC Labs wins → clients win
- Strategy: Make the libraries the best in class, add premium services on top

### Integration Roadmap
```
PyMC (core inference)
    └── pymc-marketing (MMM + CLV + Choice)
            └── CausalPy (calibration: geo-lift → MMM priors)
                    └── Insight Agent / MMM Agent (natural language layer)
                            └── Simba SaaS / Decision AI SaaS
```

### Competitive Differentiation (from discussions)
- vs. Google Lightweight MMM: More flexibility, Bayesian uncertainty, full posterior
- vs. Meridian: 2x-20x speed advantage; Bayesian credible intervals vs. point estimates
- vs. PyMC itself: Applied marketing/causal layer on top of raw inference
- vs. traditional consulting: OSS means clients can inspect, extend, and maintain the model

---

## Gaps Found

<!-- GAP: pymc-marketing 1M+ downloads — need exact number and date for milestone claim -->
<!-- GAP: JOSS paper status — submitted or published? DOI? -->
<!-- GAP: CausalPy v0.8.0 release notes — what changed since v0.5.0? -->
<!-- GAP: pymc-extras repo details — not found in GitHub org scan -->
<!-- GAP: Planned vertical packages beyond pymc-marketing (pharma?) — need confirmation -->
<!-- GAP: expert-access-program channel not fully mined — partial EAP context only -->
