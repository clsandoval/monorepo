---
page: case-studies/everysk
title: "Everysk: Bayesian Private Equity Index from Capital Cash Flows"
status: partial
sources:
  - url: https://www.pymc-labs.com/blog-posts/everysk
    label: "Blog post: Everysk VC index"
    date: 2021-02-25
---

# Everysk: Bayesian Private Equity Index from Capital Cash Flows

## Client

**Everysk** — leading provider of risk workflow software for multi-asset, global portfolios.

- **Industry:** Finance / Investment Management / FinTech
- **Service:** Solution Delivery
- **Engagement:** 2021

## Team

- **Ravin Kumar** — Lead

## The Problem

Private equity and venture capital funds present a fundamental measurement challenge: unlike liquid public markets, there are no transaction-based performance measures. Fund returns are reported infrequently, and capital flows (contributions and distributions) are the only observable data.

Everysk needed a statistical method to:
- Estimate private equity and VC returns from capital cash flow data alone
- Model time-varying value-added factors and investment exposure
- Produce an index comparable to established benchmarks (Cambridge Associates VC Index)
- Maintain **interpretability** — the model needed to be explainable to investment professionals, not just optimized for predictive accuracy

## Approach

The engagement followed a structured, collaborative process:

1. **Joint scoping meeting** — align technical and business perspectives on the problem
2. **Code and literature review** — review Everysk's existing code and reference academic paper
3. **Exploratory data analysis** — one week of structured EDA on capital flow data
4. **Initial Bayesian model development** — build baseline model in PyMC
5. **Model improvements** — extend beyond reference paper with upgraded samplers and reparameterizations
6. **Collaborative interpretation** — iterate on results with Everysk's team

**Key modeling elements:**
- Time-varying factor model estimated from capital cash flow observations
- Bayesian inference for unobserved return series
- MCMC sampling with upgraded samplers beyond reference paper baseline

**Core philosophy:** interpretability over predictive accuracy — the model's value was in producing understandable, defensible estimates, not black-box predictions.

> "How can we figure out the unknown from the things we know? The answer lies with Bayesian Statistics."

> "This insight would not have been available from a standard machine learning analysis."
> (Source: pymc-labs.com blog post)

## Results

- Successfully produced a Bayesian VC index estimated from capital flow data alone
- Index aligned with Cambridge Associates VC Index benchmarks, validating the approach
- Cumulative return visualizations comparing US public stocks vs. modeled VC vs. Cambridge Associates reference index
- Delivered within a structured, time-boxed engagement

<!-- GAP: need Everysk client-side quote or testimonial -->
<!-- GAP: need quantitative details — how closely did the index track Cambridge Associates (correlation, tracking error)? -->
<!-- GAP: need information on whether this went to production in Everysk's risk platform -->
<!-- GAP: need Ravin Kumar technical quote on the modeling approach -->
<!-- GAP: need the reference paper citation that the model was built on top of -->

## Technologies

PyMC, MCMC samplers, Python
