---
page: case-studies/takeda
title: "Takeda: Bayesian State Space Modeling for CAR-NK Cell Therapy Manufacturing"
status: complete
sources:
  - label: "Discord: takeda channel"
  - label: "Analysis: discord-case-studies-extraction.md"
---

# Takeda: Bayesian State Space Modeling for CAR-NK Cell Therapy Manufacturing

## Client

**Takeda Pharmaceutical Company** — one of the world's largest pharmaceutical companies, headquartered in Tokyo.

- **Product focus:** TAK-007 and TAK-808 (CAR-NK cell therapy for cancer treatment)
- **Industry:** Pharmaceutical / Cell Therapy Manufacturing / Biotech
- **Service:** Solution Delivery
- **Engagement period:** SOW 1, ~15 months, April 2023 – September 2024

## Team

- **Eric Ma** — PM / Account Lead
- **Maxim** — Modeling
- **Adrian** — Modeling
- **Virgile** — Modeling
- **Junpeng** — Modeling
- **Aziz** — Modeling
- **Thomas Wiecki** — Advisor

## The Problem

CAR-NK (chimeric antigen receptor natural killer) cell therapy is a promising cancer treatment, but manufacturing it is extraordinarily complex. Each batch of therapy is derived from a **human donor** and goes through a ~**28-day manufacturing pipeline** with multiple stages: expansion in bioreactors, quality testing, and final product preparation.

Takeda needed to model this pipeline to answer three interconnected questions:

1. **Retrospective analysis:** Given a completed batch, what happened at each stage and why?
2. **Real-time monitoring:** Given early-stage measurements (e.g., day 6), predict final product quality so manufacturing decisions can be made proactively
3. **Prospective optimization:** Given target output specifications, what input parameters (seeding density, bioreactor settings) maximize yield?

### The Data Constraint

Only **17 donors** — meaning the model must operate in an extremely sample-sparse regime where Bayesian methods' ability to encode prior knowledge is not just useful but essential.

### Cell Quality Attributes (CQAs) Tracked

- **Total cell counts** — overall proliferation
- **Viable cell counts** — live cells only (viability %)
- **CD45 expression** — surface marker for NK cell identity and purity

These are measured via flow cytometry at multiple manufacturing stages.

## Approach

### Stage-by-Stage Bayesian State Space Model

PyMC Labs built a Bayesian state space model that tracks cell population dynamics through each manufacturing stage:

- **State definition:** `{total_counts, viable_counts, CD45}` — the full cell population descriptor at each stage
- **LogNormal likelihood** for cell counts — always positive, right-skewed, appropriate for count-like biological quantities
- **Hierarchical donor-level model** — individual differences in growth rates modeled as partial pooling across the 17 donors
- **Non-centered parameterization** throughout for sampling efficiency in sparse-data regime

### Sampling Infrastructure

> "MCMC sampling with numpyro or blackjax is definitely better than using the builtin pymc NUTS sampler"
> — Eric Ma

- **JAX/NumPyro backend** (`sample_numpyro_nuts`) for efficient sampling
- Vectorized implementation for each manufacturing stage

### Three Inference Modes

> "The ability to condition on full GMP data allows for retrospective comparisons; partial conditioning is useful for real-time following of the experiment live, and naive predict() for future-looking planning"
> — Eric Ma

1. **Full GMP data conditioning** — retrospective analysis of a completed batch
2. **Partial conditioning** — real-time monitoring using measurements available through day N
3. **Naive predict()** — prospective planning before any new batch measurements exist

**Importance sampling** was implemented for efficient real-time prediction without rerunning full MCMC.

### Deployment Infrastructure

- **MLflow** integration for experiment tracking, model versioning, and deployment documentation
- **Databricks** deployment for integration with Takeda's existing data infrastructure
- Full MLflow deployment documentation written for Takeda's internal team

## Results

- **TAK-807 and TAK-808 stage models delivered** — full manufacturing pipeline modeled for both cell therapy products
- **Predictive engine framework delivered** — pre-day-6 model plus full framework for the 28-day process
- **MLflow deployment documentation** written for Databricks
- **SOW 1 completed September 2024**

> "TAK808 marked complete - i think this is a good milestone"
> — Junpeng

> "together, we've done a great job collectively building goodwill"
> — Eric Ma

## Technologies

PyMC, JAX/NumPyro, MLflow, Databricks, State Space Models, LogNormal likelihood, Non-centered parameterization, Importance sampling

<!-- GAP: need quantitative model accuracy metrics — e.g., predictive MAPE on held-out donors, posterior predictive coverage -->
<!-- GAP: need clarification on whether SOW 2 or follow-on engagement occurred -->
<!-- GAP: need client-side testimonial quote from Takeda for marketing use -->
<!-- GAP: need clarification on what "optimization" deliverable looked like — was a Bayesian optimization / design of experiments layer included? -->
