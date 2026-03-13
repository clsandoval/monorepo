---
page: resources/open-source-libraries
title: Open Source Libraries
status: complete
sources:
  - analysis/public/github-org.md
  - analysis/discord-pymc-ecosystem-extraction.md
  - analysis/discord-general-extraction.md
  - analysis/discord-marketing-extraction.md
  - analysis/website-scrape/home.md
---

# Open Source Libraries

## Hero / Intro

PyMC Labs is the company behind some of the most widely used open-source Bayesian tools in industry. The same libraries powering our client work are freely available — battle-tested on Fortune 500 projects and trusted by the global Bayesian community.

**Stat claims available for use:**
- PyMC: 9,500+ GitHub stars, 2,200+ forks
- pymc-marketing: 1,088 GitHub stars, 372 forks
- CausalPy: 1,123 GitHub stars, 97 forks
- pymc-marketing: 1M+ downloads (milestone confirmed in Discord)

**Positioning quote (Thomas Wiecki, internal):**
> "My main motivation is that I want us to build analytics packages that target certain verticals. Those consist of an open source package like pymc-marketing but can also be combined with an Insight Agent. These can be deployed locally, on the cloud, or on Databricks." — Thomas, #pymc-ecosystem, 2025-03-16

---

## Library 1: PyMC

**Tagline**: "The Bayesian inference engine"

- **GitHub**: https://github.com/pymc-devs/pymc
- **Stars**: ~9,500
- **Forks**: ~2,200
- **License**: Apache 2.0
- **Governance**: NumFOCUS non-profit
- **Version**: v6 (active development)
- **Install**: `pip install pymc`
- **Description**: "A Python package for Bayesian statistical modeling focusing on advanced Markov chain Monte Carlo (MCMC) and variational inference (VI) algorithms."

**PyMC Labs' relationship to PyMC:**
- PyMC Labs was founded by the inventors of PyMC
- Core team members are active PyMC contributors
- Official note from repo: "Professional consulting support available through PyMC Labs"
- PyMC Labs sponsors NumFOCUS governance

**Key features:**
- Intuitive model specification syntax (Python-native, probabilistic programming)
- No U-Turn Sampler (NUTS) — state-of-the-art MCMC
- Variational inference (ADVI)
- PyTensor backend (computation optimization, JAX compilation, GPU support)
- Missing value imputation
- Gradient-based inference

**Use cases:**
- Any domain requiring probabilistic inference
- Hierarchical models, time series, regression, classification
- Foundation for all PyMC Labs applied tools

---

## Library 2: pymc-marketing

**Tagline**: "Bayesian marketing toolbox — MMM, CLV, and more"

- **GitHub**: https://github.com/pymc-labs/pymc-marketing
- **Docs**: https://www.pymc-marketing.io/
- **Stars**: ~1,088
- **Forks**: ~372
- **License**: Apache 2.0
- **Install**: `pip install pymc-marketing` or `conda create -c conda-forge -n marketing_env pymc-marketing`
- **Official description**: "Bayesian marketing toolbox in PyMC. Media Mix (MMM), customer lifetime value (CLV), buy-till-you-die (BTYD) models and more."
- **JOSS paper**: Submitted Jan 2026 (Journal of Open Source Software)

**What it does:**

*Media Mix Modeling (MMM):*
- Adstock transformations: geometric, Weibull, delayed response
- Saturation effects: logistic, tanh, Hill functions
- Time-varying intercepts and media contributions
- Budget optimization using full posterior uncertainty
- Lift test integration (calibrate with geo-experiments)
- Counterfactual scenario planning
- Causal discovery integration
- GPU acceleration via BlackJax, NumPyro, Nutpie samplers

*Customer Lifetime Value (CLV):*
- BG/NBD model (Buy Till You Die)
- Pareto/NBD model
- Gamma-Gamma monetary value model
- Discrete and continuous transaction mode support
- Customer scoring and segmentation

*Customer Choice Analysis:*
- Discrete choice models
- Nested logit
- Bass Diffusion Model for product adoption
- Multivariate Interrupted Time Series (MVITS) for market share analysis

**Team quote on positioning:**
> "CausalPy + PyMC-marketing are meant to work together: we should always calibrate MMMs." — Juan Orduz (Lead Contributor), #causalpy

> "We should be pushing our clients to think 'causally' about MMMs. This is a big differentiator vs. competitor agencies." — Juan Orduz, #causalpy

**Used in production by:**
- HelloFresh (MMM, 60x faster runs vs. prior tooling)
- Colgate-Palmolive (multiple models: MMM, cannibalization, shelf optimization)
- Wegmans (MMM, MAPE 13-14%)
- Indigo Ag (causal field trial modeling)
- And many more (Swarovski, Bain/Coca-Cola, etc.)

**Professional services note (from GitHub README):**
> "PyMC Labs offers custom model development, dedicated coaching, and SaaS solutions for enterprise implementation."

**Competitive differentiation vs. Google Meridian / Lightweight MMM:**
- Full posterior uncertainty (not just point estimates)
- 2x–20x faster than Meridian (from internal benchmarks)
- Bayesian credible intervals → actionable uncertainty for budget decisions
- Fully extensible — add custom components, likelihoods, priors
- Apache 2.0 — clients own and can audit their model code

**Planned evolution (monorepo):**
pymc-marketing is being split into independently installable sub-packages:
- `pymc-mmm` — Media Mix Modeling
- `pymc-clv` — Customer Lifetime Value
- `pymc-choice` — Customer Choice Models

---

## Library 3: CausalPy

**Tagline**: "Causal inference for the experiments you can't run"

- **GitHub**: https://github.com/pymc-labs/CausalPy
- **Stars**: ~1,123
- **Forks**: ~97
- **License**: Apache 2.0
- **Version**: 0.8.0 (released March 3, 2026)
- **Install**: `pip install CausalPy` or `conda install -c conda-forge causalpy`
- **Official description**: "A Python package for causal inference in quasi-experimental settings"
- **Academic citation**: Cited in ICML 2025 (https://icml.cc/virtual/2025/poster/44167)

**What it does:**

CausalPy enables rigorous causal effect estimation when randomized experiments aren't possible or ethical. Built on PyMC, it combines Bayesian inference with modern quasi-experimental designs.

**10 quasi-experimental methodologies:**
1. **Synthetic Control** — weighted combinations of control units to form counterfactuals
2. **Geographical Lift** — measure intervention impact across geographic regions
3. **ANCOVA** — control for quantitative covariates in experimental settings
4. **Differences-in-Differences** — compare treatment/control groups over time
5. **Staggered Differences-in-Differences** — staggered treatment adoption across units
6. **Regression Discontinuity** — threshold-based treatment assignment
7. **Regression Kink Designs** — detect slope changes at thresholds
8. **Interrupted Time Series** — measure intervention effects on temporal data
9. **Instrumental Variable Regression** — handle endogeneity concerns
10. **Inverse Propensity Score Weighting** — adjust for confounding in observational studies

**Why Bayesian causal inference?**
- Credible intervals on treatment effects — not just "did it work" but "by how much, and how sure are we"
- Incorporate prior knowledge (historical baselines, domain expertise)
- Works well with small samples where frequentist methods fail
- Natural calibration bridge to pymc-marketing MMM priors

**Integration with pymc-marketing:**
- CausalPy geo-lift results → pymc-marketing MMM priors (planned automatic calibration)
- Combined workflow: run geo experiment → estimate lift → feed into MMM as informative prior
- "CausalPy + PyMC-marketing are meant to work together" — Juan Orduz

**Use cases:**
- Geo-lift testing for marketing campaigns
- Incrementality testing when A/B test isn't possible
- Policy impact assessment
- Medical intervention analysis
- Any scenario where treatment assignment is non-random

**Lead maintainer:**
> "There is considerable scope to improve CausalPy as a lead generator. One aspect would be to move away from emphasising features, and instead present it as a solution to business problems where you can't perform experiments." — Ben Vincent (Lead Maintainer), #causalpy, 2025-04-29

> "CausalPy closing in rapidly on 1000 stars. Though I think there's much more that can be done here — especially in making it into a lead generator." — Ben Vincent, #causalpy, 2026-01-25

**Roadmap:**
- BSTS (Bayesian Structural Time-Series) — feature parity with Google's CausalImpact
- Synthetic Difference-in-Differences implementation
- Power analysis and test design tooling

---

## Library 4: decision-hub

**Tagline**: "npm for AI agent capabilities"

- **GitHub**: https://github.com/pymc-labs/decision-hub
- **Website**: https://hub.decision.ai
- **Stars**: 37
- **License**: MIT (self-hostable)
- **Downloads in first week (Feb 2026 launch)**: 1,463

**What it does:**
Open-source registry and package manager for AI agent "skills" (packages of prompts + code). Enables publishing, discovering, and installing modular capabilities for AI coding agents.

**Key features:**
- 40+ agent integrations: Claude Code, Cursor, Codex, Windsurf, GitHub Copilot, etc.
- Automated evaluations — skills ship with sandboxed test cases; results publicly reported
- Security scanning — trust grades (A/B/C/F) based on pattern analysis
- Private skills — scope to GitHub org with cross-org access control
- Auto-tracking — republish when GitHub repo updates
- MIT licensed and self-hostable

**Context**: decision-hub is the open-source component of Decision AI (see Solutions > Decision AI). PyMC Labs uses it to distribute its proprietary analytics agent skills to enterprise clients.

---

## Library 5: semantic-similarity-rating

**Tagline**: "Measure what LLMs think"

- **GitHub**: https://github.com/pymc-labs/semantic-similarity-rating
- **Stars**: ~130
- **License**: Apache 2.0
- **Paper**: Maier, B.F., Aslak, U., Fiaschi, L., Pappas, K., & Wiecki, T. (2025). "Measuring Synthetic Consumer Purchase Intent Using Embeddings-Similarity Ratings."

**What it does:**
Implementation of the SSR (Semantic Similarity Rating) algorithm. Converts textual LLM responses into Likert-scale probability distributions using embedding cosine similarity — without asking the LLM to output a number directly.

**Algorithm (4 steps):**
1. Reference Definition — establish reference statements per Likert scale point
2. Similarity Computation — cosine similarity between LLM response + reference embeddings
3. Distribution Conversion — transform similarities → probability distributions
4. Temperature Scaling — adjust certainty levels

**Core use case:** Measuring synthetic consumer purchase intent at scale. Powers the Synthetic Consumers product.
- 90% alignment with human survey responses
- 85% distributional similarity
- <24h research cycles (vs. weeks for traditional surveys)

---

## Related: PyTensor

- **GitHub**: https://github.com/pymc-devs/pytensor
- **Stars**: ~596
- **Forks**: ~179
- **Description**: "Define, optimize, and evaluate mathematical expressions involving multi-dimensional arrays."
- Backend computation engine for PyMC (successor to Theano/Aesara)
- Core dependency for all PyMC Labs OSS tools

---

## The OSS Strategy

PyMC Labs' open-source-first approach is intentional and strategic:

1. **"Win Win Win" model** (Thomas Wiecki, #general): OSS community wins access to cutting-edge tools → PyMC Labs wins talent pipeline + brand credibility → clients win battle-tested production code

2. **Lead generation**: Companies discover PyMC Labs through OSS → become consulting clients or SaaS subscribers

3. **Vertical stack**: Each OSS library targets a vertical (marketing, causal) and is the foundation for a corresponding paid product/service tier:
   ```
   PyMC (core inference)
     └── pymc-marketing (MMM + CLV)
           └── CausalPy (calibration + incrementality)
                 └── MMM Agent / Insight Agent (AI layer)
                       └── Simba SaaS / Decision AI SaaS
   ```

4. **Competitive moat**: Clients who build on PyMC Labs' OSS are stickier — they've standardized on the tooling and can get expert help from the creators

---

## Content for Website Sections

### Hero Section
- Stat bar: "9,500+ stars on PyMC · 1,100+ stars on pymc-marketing · 1,100+ stars on CausalPy"
- Tagline options: "Battle-tested in production. Open to the world." / "We built the tools. Now we help you use them."
- CTAs: [View on GitHub] [Get Expert Help]

### Library Cards (grid)
Each card: icon / library name / one-line description / GitHub stars / install command / [GitHub] [Docs] buttons

### "Professional Services" CTA Block
Cross-reference to Services and EAP:
- "Need help implementing? Our experts built these libraries."
- Links to Expert Access Program and Solution Delivery service

### Blog/Resources Cross-Reference
Relevant blog posts for OSS section:
- Causal Discovery blog posts (Juan Orduz)
- "MMM vs. Meridian benchmark" (competitive)
- Budget optimization tutorials
- CLV modeling tutorials

---

## Gaps

<!-- GAP: Exact pymc-marketing download count (1M+ confirmed but exact number + date needed) -->
<!-- GAP: JOSS paper DOI/URL — submitted Jan 2026, publication status unclear -->
<!-- GAP: CausalPy v0.8.0 full release notes / what changed -->
<!-- GAP: pymc-extras repo — referenced as shared dependency but not in GitHub org scan -->
<!-- GAP: Total contributor count across all repos (for "X contributors" stat on page) -->
<!-- GAP: pymc-marketing docs site (pymc-marketing.io) page count / example notebooks count -->
<!-- GAP: Any public usage numbers for decision-hub beyond 1,463 first-week downloads -->
