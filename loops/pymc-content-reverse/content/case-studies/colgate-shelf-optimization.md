---
page: case-studies/colgate-shelf-optimization
title: "Colgate-Palmolive: Bayesian Shelf Assortment Optimization"
status: complete
sources:
  - url: https://www.pymc-labs.com/blog-posts/causal-sales-analytics-discrete-choice-modeling
    label: "Blog post: causal sales analytics — discrete choice modeling (follow-up)"
  - label: "Discord: colgate-shelf-optim channel"
  - label: "Analysis: website-scrape/crawl-remaining.md (Colgate case study part 2)"
---

# Colgate-Palmolive: Bayesian Shelf Assortment Optimization

## Client

**Colgate-Palmolive** — global consumer goods company. This is SOW 2 of an ongoing multi-engagement relationship.

- **Industry:** Consumer Goods / FMCG (Oral Care, Dish Wash, Hand Soap)
- **Service:** Solution Delivery
- **Engagement period:** SOW 2, ~18 months, completed April 2025

## Team

- **Ben Vincent** — Lead researcher / PM
- **Christian** — Modeling, delivery lead
- **Luciano** — GPU performance engineering
- **Ricardo** — Modeling
- **Thomas Wiecki** — Principal oversight
- **Adrian** — Modeling
- **Tomi** — Modeling

## The Problem

Following the cannibalization analysis (SOW 1), Colgate-Palmolive wanted to operationalize the discrete choice models for **shelf assortment optimization**: given a retailer's shelf, which Colgate products should be stocked — and in what mix — to maximize revenue or margin?

### Three Core Prediction Objectives

1. **Baseline sales prediction** — predict unit sales for the current assortment with no changes
2. **Distribution increase** — predict sales uplift for an existing item if its distribution (% ACV) increases
3. **New-to-market item introduction** — predict the sales impact of adding a brand-new product to the shelf

### Benchmark

The model was benchmarked against **Kantar's RichMix** assortment optimization tool — Colgate's existing commercial solution.

### Data

- Nielsen market share data with distribution (% ACV) across multiple retailers
- Oral care, dish wash, and hand soap categories
- Multiple product hierarchies: item → description → brand

## Approach

### Nested Discrete Choice Model (Bayesian)

PyMC Labs implemented a Nested Logit (Nested DCM) in PyMC with a full Bayesian treatment:

- **`log_softmax` / Categorical likelihood** for product choice
- **Distribution (% ACV) as availability mask:** `adjusted_utility = utility + log(distribution)` — products with zero ACV are effectively unavailable
- **Partial pooling** over product descriptions and brand hierarchy (item → description → brand) for robust estimation of new-to-market items
- **ZeroSumNormal priors** for product utilities to ensure identifiability across the shelf
- **Nested logit structure** to model within-brand substitution effects (cannibalization at the brand level)
- **Complete pooling vs. partial pooling comparison:** partial pooling significantly outperformed complete pooling; complete pooling model failed to converge

### Optimization Layer

On top of the Bayesian model, an optimization layer generates actionable shelf recommendations:

- Iterates over add/remove decisions for each product
- Scores each candidate change by predicted revenue impact
- Outputs ranked recommendations as horizontal bar charts (revenue delta per assortment change)
- Handles portfolio-level tradeoffs between new item introduction gains and cannibalization losses

### GPU Acceleration

Luciano led a GPU sampling effort using `nutpie` + JAX:

> "nutpie with GPU was excellent! I managed to sample 4 chains in 6 hours total instead of 10 hours per chain"
> — Luciano

**Result:** 4 chains in 6 hours total vs. 10+ hours per chain without GPU — approximately a 6-7x end-to-end speedup.

## Results

- **Full optimization notebook suite delivered** — 30+ notebooks covering data prep, modeling, validation, and optimization
- **Partial pooling model successfully converged** where complete pooling failed
- **GPU acceleration:** 4 chains in 6 hours total vs. 10+ hours per chain on CPU
- **Optimization recommendations** generated as horizontal bar charts, ready for business review
- **Custom Python package** (`colgate-shelf-sow2`) delivered to Colgate with full documentation for internal use
- **Project completed April 2025**

> "I've finally have some results with the partial pooling model! Things look much better"
> — Luciano

> "With the correct indexing, the concentration parameter comes out large (as we expected) and the predictions are much more accurate and certain!"
> — Luciano

> "there are plots to show predicted changes in revenue IF you do a change around in shelf assortment"
> — Ben Vincent

> "all project work is complete"
> — Christian (April 2025)

## Technologies

PyMC, Discrete Choice Modeling, Nested Logit, nutpie, JAX (GPU), ZeroSumNormal, Partial Pooling

<!-- GAP: need quantitative results vs. Kantar RichMix benchmark — did the model outperform? By how much? -->
<!-- GAP: need named client-side quote for use in marketing material -->
<!-- GAP: need clarity on whether SOW 3 / further engagement followed -->
