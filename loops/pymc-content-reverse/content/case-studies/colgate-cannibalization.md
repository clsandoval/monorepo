---
page: case-studies/colgate-cannibalization
title: "Colgate-Palmolive: Bayesian Cannibalization Analysis for New Product Launches"
status: complete
sources:
  - url: https://www.pymc-labs.com/blog-posts/causal-sales-analytics-are-my-sales-incremental-or-cannibalistic
    label: "Blog post: causal sales analytics — incremental or cannibalistic?"
    date: 2024-09-19
  - label: "Discord: colgate-cannibalization channel"
  - label: "Halah draft website"
---

# Colgate-Palmolive: Bayesian Cannibalization Analysis for New Product Launches

## Client

**Colgate-Palmolive** — global consumer goods company, one of the world's largest manufacturers of oral care products.

- **Industry:** Consumer Goods / FMCG (Oral Care — Toothpaste)
- **Service:** Solution Delivery
- **Engagement period:** SOW 1 completed 2023; multi-SOW relationship ongoing

## Team

- **Ben Vincent** — Lead researcher / PM
- **Bill Engels** — Modeling
- **Luciano** — Modeling
- **Maxim** — Modeling
- **Adrian** — Modeling
- **Christian** — Modeling
- **Ricardo** — Modeling
- **Thomas Wiecki** — Principal oversight

## The Problem

Colgate-Palmolive needed to determine whether sales of newly launched products were **incremental** — drawing customers away from competitors — or **cannibalistic** — pulling revenue away from Colgate's own existing product lines.

### Innovation Horizon Framework

The analysis covered products across three innovation horizon types, each with different incrementality expectations:

- **Horizon 1 (minor variant):** Low incrementality expected — mostly takes from existing Colgate products
- **Horizon 2 (new variant):** Medium incrementality — some competitive steal possible
- **Horizon 3 (new category entry):** High incrementality expected — expands into new market space

### Data

- Nielsen market-level data spanning approximately 5 years
- ~25 SKUs per model run
- 50 markets
- Distribution measured as % ACV (All Commodity Volume) per product

### The Existing Model

Colgate's prior model, built by external vendor Fractal.ai, was PyMC3-based but had critical methodological flaws:

- Wrong constraints on parameters
- Poorly specified priors
- `find_MAP` initialization (a known anti-pattern for full Bayesian inference)
- Insufficient MCMC sampling

> "Their current model is awful... fundamentally flawed: they did not reason very much about causal relations, they did not think about adequate observational distributions"
> — Luciano

> "I think no one is doing what we'd be doing... I continue to be surprised at the lack of sophistication at these places"
> — Thomas Wiecki

## Approach

### Bayesian Multinomial Logit (Discrete Choice Model)

PyMC Labs rebuilt the model from scratch using a principled Bayesian Discrete Choice framework:

- **Multinomial Logit likelihood** via `log_softmax` / `Categorical` likelihood
- **ZeroSumNormal priors** for product utilities to ensure identifiability across SKUs
- **Distribution (% ACV) as availability mask** — products unavailable in a market have their utility adjusted to effectively zero probability
- **Mixed Logit** for customer-level preference heterogeneity
- **LKJ Cholesky covariance** for correlated preferences across product attributes
- **Brand hierarchy predictors:** brand, sub-brand, variant, package size encoded as structured predictors in the utility function
- **Innovation type (horizon)** as a predictor in the utility function — captures expected incrementality by product type

### Counterfactual Inference

The core deliverable was counterfactual: "If this product had not been launched, what would sales of all other products have been?"

- Masking zero-distribution products with `-Inf` adjusted utility (product unavailable = no sales)
- Posterior over the full 5-year window for each SKU introduction event
- Attribution of sales changes to individual products across the portfolio

### Contract

Approximately $485K total, structured as a multi-phase engagement.

> "The budget looks about right regarding the amount of work"
> — Kli (Colgate client)

## Results

- **Probabilistic cannibalization estimates per SKU** — for each new product introduction, a full posterior distribution over how much each existing product's sales increased or decreased
- **5-year retrospective analysis** — explained what happened across the full historical window when Colgate SKUs were introduced
- **Steve (Colgate)** ran the model internally after delivery, demonstrating successful knowledge transfer
- **Colgate signed a Master Services Agreement (MSA)** for an ongoing relationship
- **Led directly to follow-on shelf optimization SOW** (SOW 2)

> "We could lead the way in an area which possibly only exists locked down within large companies"
> — Ben Vincent

## Technologies

PyMC, Discrete Choice Modeling, Bayesian Multinomial Logit, ZeroSumNormal, LKJ Cholesky, Mixed Logit

<!-- GAP: need specific incrementality result numbers — e.g. "Horizon 3 products showed X% incremental sales vs Y% cannibalization" -->
<!-- GAP: need named Colgate client testimonial quote for use in marketing material -->
<!-- GAP: need confirmation of exact contract value ($485K) for public use -->
