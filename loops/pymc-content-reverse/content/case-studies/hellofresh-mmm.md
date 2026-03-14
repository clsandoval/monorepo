---
page: case-studies/hellofresh-mmm
title: "HelloFresh: Time-Varying Marketing Mix Modeling & A/B Testing at Scale"
status: complete
sources:
  - url: https://www.pymc-labs.com/blog-posts/2022-11-11-HelloFresh
    label: "Blog post 1: MMM overview"
    date: 2022-11-11
  - url: https://www.pymc-labs.com/blog-posts/reducing-customer-acquisition-costs-how-we-helped-optimizing-hellofreshs-marketing-budget
    label: "Blog post 2: CAC deep dive"
    date: 2026-02-18
  - url: https://www.pymc-labs.com/blog-posts/bayesian-media-mix-modeling-for-marketing-optimization
    label: "Blog post 2b: MMM optimization deep dive"
  - url: https://www.pymc-labs.com/blog-posts/modelling-changes-marketing-effectiveness-over-time
    label: "Blog post 2c: Time-varying marketing effectiveness"
  - url: https://www.pymc-labs.com/blog-posts/bayes-is-slow-speeding-up-hellofreshs-bayesian-ab-tests-by-60x
    label: "Blog post 3: A/B testing speedup"
    date: ~2022
  - label: "Discord: hellofresh-mmm channel"
  - label: "Discord: hellofresh-se channel"
  - label: "Halah draft: /work/hellofresh page"
---

# HelloFresh: Time-Varying Marketing Mix Modeling & A/B Testing at Scale

## Client

**HelloFresh** — global food delivery subscription company, operating across 15+ markets worldwide.

- **Industry:** Retail / E-Commerce / Food Delivery
- **Services:** Solution Delivery, Training & Enablement
- **Engagement period:** 2022–2026 (ongoing)

## Team

- **Luca Fiaschi** — Account Manager (formerly HelloFresh's internal data science lead; later joined PyMC Labs as a Partner)
- **Niall Oulton** — Lead researcher, MMM
- **Bill Engels** — Modeling
- **Thomas Wiecki** — Principal oversight
- **Benjamin Vincent** — A/B testing lead

## The Problem

HelloFresh faced three interconnected challenges as they sought to optimize marketing spend across global markets:

### 1. Time-Varying Customer Acquisition Cost (CAC)

CAC was not static — it shifted quarter to quarter across markets and channels. HelloFresh needed to understand *why* CAC changed over time, not just measure attribution at a point in time. Static MMM approaches couldn't explain seasonal, market, or channel-driven dynamics.

Key client metrics context: ~140K weekly US acquisitions, ~$130–140 customer lifetime value (CLV), ~$100 blended CAC, CCV/CAC ratio of 1.2–1.3.

### 2. MMM Computational Performance

Each MMM model run took approximately 20 minutes, making rapid iteration and experimentation impractical. Analysts couldn't explore model variants or quickly respond to business questions.

### 3. A/B Testing Pipeline Throughput

HelloFresh runs thousands of concurrent A/B, ABC, and ABCD tests globally. The overnight batch pipeline took 5–6 hours to complete, creating a significant lag in decision-making.

## Approach

### Time-Varying CAC with Gaussian Process MMM

PyMC Labs built a hierarchical Bayesian Marketing Mix Model using PyMC, with the key innovation of modeling CAC as a time-varying parameter rather than a fixed coefficient.

**Technical architecture:**
- Hierarchical structure across markets and channels
- Time-varying marketing effectiveness modeled via **Hilbert Space Gaussian Process (HSGP)** modulation on the CAC parameter
- Adstock and saturation transformations on media variables
- Lift test integration to calibrate model priors
- JAX sampling via `sample_numpyro_nuts` for performance
- ECDF-CRPS scoring for model comparison and selection

> "The time-varying intercept via GP is the key innovation here — lets us see when CAC is improving or getting worse and attribute it to channels."
> — Niall Oulton

> "The whole point of the time-varying model is to be able to say 'CAC went up in Q3 — here's how much was TV, how much was paid social, how much was just market saturation'."
> — Niall Oulton

> "This is one of the most technically sophisticated MMMs we've built."
> — Thomas Wiecki

### MMM Performance Optimization (10x Speedup)

To address the 20-minute inference bottleneck, the team applied a series of targeted optimizations:

- Log-transformed the outcome variable for better numerical behavior
- Replaced Normal likelihood with **Student-T** for robust outlier handling
- Rewrote adstock kernel from O(n²) to O(n) complexity
- Implemented **custom Theano operator with Numba JIT compilation** for adstock
- Reparameterized reach function using saturation user count (β) and initial cost per user (c₀)

**Result:** 10x speedup — model runtime dropped from 20 minutes to ~2 minutes. 60% reduction in prediction variance.

### A/B Testing Pipeline (60x Speedup)

The overnight batch A/B testing pipeline was restructured fundamentally:

- **Problem:** Thousands of concurrent tests processed sequentially, 5–6 hour overnight batch
- **Solution:** Consolidated all test datasets into a single large unpooled PyMC model, enabling parallelization across the full test inventory

**Result:** ~60x speedup — pipeline runtime dropped from 5–6 hours to 5–6 minutes.

### HelloFresh SE Follow-On (2026)

A follow-on engagement began in February 2026 under an Early Access Program (EAP) at $8,000/month, extending the partnership into new technical territory:

- **Bayesian VAR (BVAR) brand equity models** for measuring above-the-line (ATL) media impact on brand KPIs: activations, reactivations, and referrals
- **MMM agent deployment** scaling across 15 markets × 7 product lines = 315+ model combinations

## Results

| Metric | Before | After |
|--------|--------|-------|
| MMM inference runtime | 20 min | ~2 min (10x) |
| A/B test pipeline runtime | 5–6 hours | 5–6 min (~60x) |
| MMM prediction variance | baseline | −60% |
| Time-varying CAC visibility | none | full channel attribution |

- Time-varying CAC model reveals per-channel contributions to CAC shifts quarter over quarter
- Follow-on SOW and EAP ($8K/month, 2026) demonstrates multi-year partnership depth
- Luca Fiaschi's transition from HelloFresh's internal data science lead to PyMC Labs Partner reflects the depth of the relationship

> "I love this company — spent a big part of my life working with them."
> — Luca Fiaschi, Account Manager, PyMC Labs

## Technologies

PyMC, PyMC-Marketing, Gaussian Processes (HSGP), JAX/NumPyro, Theano, Numba, ArviZ, Bayesian VAR (BVAR)

<!-- GAP: need specific HelloFresh-side quote or testimonial (no named HelloFresh spokesperson quote currently available) -->
<!-- GAP: need confirmation of exact blog post 3 date (~2022 approximate) -->
<!-- GAP: need detail on Training & Enablement deliverables — what was transferred to HelloFresh's team -->
<!-- GAP: need HelloFresh SE engagement specifics — which markets, product lines, timeline milestones -->
