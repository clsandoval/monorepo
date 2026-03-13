# GitHub Org Scan — PyMC Labs
_Source: github.com/pymc-labs + github.com/pymc-devs | Scraped 2026-03-13_

---

## Organization Overview

- **GitHub org**: https://github.com/pymc-labs
- **Total repos**: ~15 (as of March 2026)
- **Description on profile**: None visible / "The Bayesian Consultancy"
- **Related org**: https://github.com/pymc-devs (PyMC open-source project, 39 repos)

---

## Active Repositories (pymc-labs org)

### 1. pymc-marketing ⭐ FLAGSHIP
- **URL**: https://github.com/pymc-labs/pymc-marketing
- **Stars**: ~1,088
- **Forks**: ~372
- **License**: Apache 2.0
- **Language**: Python
- **Topics**: `python`, `marketing`, `data-science`, `mmm`, `customer-lifetime-value`, `clv`, `btyd`, `marketing-mix-modeling`, `media-mix-modeling`, `buy-till-you-die`
- **Description**: "Bayesian marketing toolbox in PyMC. Media Mix (MMM), customer lifetime value (CLV), buy-till-you-die (BTYD) models and more."
- **Commits**: 1,264+ on main
- **Open Issues**: 393 | **Open PRs**: 29
- **Install**: `conda create -c conda-forge -n marketing_env pymc-marketing`

**Key features:**
- Marketing Mix Modeling (MMM): adstock transformations, saturation effects, time-varying intercepts, budget optimization, lift test integration, scenario planning
- Customer Lifetime Value (CLV): BG/NBD, Pareto/NBD, Gamma-Gamma models; discrete + continuous transaction modes
- Customer Choice Analysis (CSA): discrete choice models
- Bass Diffusion Model for product adoption
- Multivariate Interrupted Time Series (MVITS) for market share analysis
- Multiple NUTS samplers (BlackJax, NumPyro, Nutpie); GPU acceleration
- Recent additions: causal discovery with PyMC-Marketing, model merging utilities, MaskedPrior class, MMM optimizer improvements

**Professional services note**: "PyMC Labs offers custom model development, dedicated coaching, and SaaS solutions for enterprise implementation."

---

### 2. CausalPy ⭐ FLAGSHIP
- **URL**: https://github.com/pymc-labs/CausalPy
- **Stars**: ~1,123
- **Forks**: ~97
- **License**: Apache 2.0
- **Language**: Python (99.4%)
- **Topics**: `pymc`, `causal-inference`, `quasi-experimental`, `quasi-experiments`
- **Description**: "A Python package for causal inference in quasi-experimental settings"
- **Version**: 0.8.0 (March 3, 2026)
- **Commits**: 1,676
- **Open Issues**: 107
- **Install**: `pip install CausalPy` or `conda install -c conda-forge causalpy`

**10 quasi-experimental methodologies:**
1. Synthetic Control — weighted combinations of control units
2. Geographical Lift — intervention impact across regions
3. ANCOVA — control for quantitative covariates
4. Differences-in-Differences — compare treatment/control over time
5. Staggered Differences-in-Differences — staggered treatment adoption
6. Regression Discontinuity — threshold-based treatment assignment
7. Regression Kink Designs — slope changes at thresholds
8. Interrupted Time Series — intervention effects on temporal data
9. Instrumental Variable Regression — endogeneity concerns
10. Inverse Propensity Score Weighting — confounding in observational studies

**Use cases**: marketing campaign evaluation, policy impact assessment, medical intervention analysis, economic studies with non-randomized data.

---

### 3. decision-hub
- **URL**: https://github.com/pymc-labs/decision-hub
- **Stars**: 37
- **License**: MIT
- **Description**: Open-source registry and package manager for AI agent skills, focused on data science, statistics, and ML workflows.

**What it does**: Enables publishing, discovering, and installing modular packages of prompts + code ("skills") that extend AI coding agents. Tagline: "Think npm, but for agent capabilities."

**Key features:**
- 40+ agent support (Claude Code, Cursor, Codex, Windsurf, GitHub Copilot, etc.)
- Automated evaluations — skills ship with sandboxed test cases; results publicly reported
- Security scanning — trust grade (A/B/C/F) based on pattern analysis
- Private skills — scope to GitHub org with cross-org access control
- Auto-tracking — republish when GitHub repo updates
- Self-hostable (MIT) at hub.decision.ai

**Relevance to sitemap**: This is Decision AI's public product / the "Solutions > Decision AI" page.

---

### 4. semantic-similarity-rating
- **URL**: https://github.com/pymc-labs/semantic-similarity-rating
- **Stars**: 130
- **License**: Apache 2.0
- **Description**: "Implementation of the SSR algorithm of the paper 'LLMs Reproduce Human Purchase Intent via Semantic Similarity Elicitation of Likert Ratings'"

**Paper reference**: Maier, B.F., Aslak, U., Fiaschi, L., Pappas, K., & Wiecki, T. (2025). "Measuring Synthetic Consumer Purchase Intent Using Embeddings-Similarity Ratings."

**Algorithm (4 steps):**
1. Reference Definition — establish reference statements per Likert scale point
2. Similarity Computation — cosine similarity between LLM response embeddings + reference embeddings
3. Distribution Conversion — transform similarities → probability distributions
4. Temperature Scaling — adjust certainty levels

**Use case**: Measuring synthetic consumer purchase intent from LLM textual responses. Core technology behind Synthetic Consumers product.

---

### 5. ai_decision_workshop
- **URL**: https://github.com/pymc-labs/ai_decision_workshop
- **Stars**: 52
- **Description**: "Notebooks for AI-Powered Decision Making Under Uncertainty"

**Workshop topics (3 phases):**
- Phase 1: Probability/uncertainty fundamentals, informative priors, sparse data, credible intervals
- Phase 2: Probabilistic A/B testing, hierarchical models, risk evaluation, stakeholder communication
- Phase 3: Posterior predictive distributions, model validation, Bayesian reasoning in pipelines

**Authors**: PyMC Labs; incorporates examples from Allen Downey's "Think Bayes."
**Access**: 4 Jupyter notebooks, runnable via Google Colab or local (Conda/pixi/uv).

---

### 6. python-analytics-skills
- **URL**: https://github.com/pymc-labs/python-analytics-skills
- **Stars**: 26
- **Description**: "About AI agent tooling for Python data science workflows"

---

### 7. PriceIsRightLLM
- **URL**: https://github.com/pymc-labs/PriceIsRightLLM
- **Stars**: (listed as archived/legacy in repo listing)
- **Description**: Benchmark for evaluating LLMs on pricing estimation tasks.

**Methodology:**
- 100+ deterministic showcases using random seeds
- 10 training items with known prices for context; 3 test items to estimate
- Backends: OpenAI, Anthropic, Google, Groq, xAI, Fireworks
- Metrics: MAPE (accuracy), over-bid rates, Elo ratings
- Data source: FandomWiki Price is Right prices

**Leaderboard**: 19 featured models, outputs `leaderboard.csv` + `leaderboard.json`
**Key finding**: "None of the models are so accurate that it seems likely they are cheating."
**Relevance**: Powers the `/benchmark/LLMPriceIsRight` page (Resources > Industry Benchmarks).

---

### 8. project-starter (Template)
- **URL**: https://github.com/pymc-labs/project-starter
- **Stars**: 5
- **License**: Apache 2.0
- **Description**: "The PyMC-Labs default project starter"

---

### 9. mmm-param-recovery
- **Stars**: 9
- **License**: Apache 2.0
- **Language**: Jupyter Notebook
- **Last updated**: January 2026
- **Description**: Parameter recovery studies for MMM models.

---

### 10. pymc-labs.github.io (Archived)
- **Description**: "PyMC Labs Website" — legacy website repo.

---

### Other / Archived Repos
- `agent-skills` (archived)
- `congrats_you_have_a_dag` — causal DAG tool
- `labs-sphinx-theme` — Sphinx documentation theme for PyMC Labs projects
- `gpt-bayes` — early GPT + Bayes experiment
- `pymc-server-prerelease` — cloud deployment tool
- `vllm` (fork)
- `pymc-labs.com` — website repo
- `pymc-labs` — org profile
- `video-timestamps` — crowd-sourced timestamps for PyMC YouTube videos
- `lucius-ltv` — LTV modeling

---

## Related Org: pymc-devs (PyMC Core)

PyMC Labs founded and actively maintains the PyMC open-source project:

### PyMC (pymc-devs/pymc) ⭐ CORE OSS
- **URL**: https://github.com/pymc-devs/pymc
- **Stars**: ~9,500
- **Forks**: ~2,200
- **Commits**: 10,420+ (v6 branch)
- **Open Issues**: 310 | **Open PRs**: 180
- **Description**: "A Python package for Bayesian statistical modeling focusing on advanced Markov chain Monte Carlo (MCMC) and variational inference (VI) algorithms"
- **Current version**: v6 (active development)
- **License**: Apache 2.0
- **Governance**: NumFOCUS non-profit; sponsored by NumFOCUS, PyMC Labs, Open Wound Research

**Key features:**
- Intuitive model specification syntax
- No U-Turn Sampler (NUTS) — state-of-the-art MCMC
- Variational inference (ADVI)
- PyTensor backend (computation optimization, JAX compilation)
- Missing value imputation

**Connection to PyMC Labs**: "Professional consulting support available through PyMC Labs." PyMC Labs team members are core contributors.

### Other pymc-devs repos
- **PyTensor** — 596 stars, 179 forks. "Define, optimize, and evaluate mathematical expressions involving multi-dimensional arrays." Backend for PyMC.
- **nuts-rs** — Rust implementation of NUTS sampler
- **mcbackend** — AGPL-3.0 backend for storing MCMC draws
- Expert prior elicitation tool

---

## Summary for Content Pages

### Resources > Open Source Libraries
Three primary libraries to highlight:
1. **PyMC** (pymc-devs) — 9,500 stars — core Bayesian inference engine. "Inventors of PyMC."
2. **pymc-marketing** (pymc-labs) — 1,088 stars — Bayesian marketing toolbox (MMM, CLV, CLV)
3. **CausalPy** (pymc-labs) — 1,123 stars — causal inference in quasi-experimental settings

Additional tools:
- **decision-hub** — AI agent skills registry (hub.decision.ai)
- **semantic-similarity-rating** — SSR algorithm for synthetic consumer research
- **PriceIsRightLLM** — LLM price reasoning benchmark

### Solutions > Decision AI
decision-hub repo is the open-source component of Decision AI product.
Hub: hub.decision.ai (MIT licensed, self-hostable)

### About > Story & Team
PyMC Labs founded by Thomas Wiecki and team. "Inventors of PyMC." PyMC has 9,500+ GitHub stars, one of the most widely-used Bayesian libraries in Python.

---

## Gaps
<!-- GAP: decision-hub vs Simba relationship unclear — need Discord to confirm which is which -->
<!-- GAP: No dedicated Simba GitHub repo found — likely internal/proprietary -->
<!-- GAP: python-analytics-skills description thin — may be related to decision-hub or agent skills -->
<!-- GAP: Total contributor counts across all OSS repos not captured -->
