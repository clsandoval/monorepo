---
page: case-studies/swarovski
title: "Swarovski: Bayesian MMM with Time-Varying Intercept for Luxury Retail"
status: partial
sources:
  - label: "Discord: swarovski channel"
  - label: "Analysis: discord-case-studies-extraction.md"
---

# Swarovski: Bayesian MMM with Time-Varying Intercept for Luxury Retail

## Client

**Swarovski** — Austrian luxury brand known for precision-cut crystal, fashion jewelry, and home decor.

- **Industry:** Luxury Retail / Fashion / Consumer Goods
- **Service:** Solution Delivery

## Team

- **Maxim** — Lead researcher
- **Niall** — Modeling
- **Thomas Wiecki** — Principal oversight

## The Problem

Swarovski's existing Marketing Mix Model had two persistent issues:

1. **High MAE** — the model's predictions were too imprecise to be actionable for budget allocation decisions
2. **Poor seasonality and base sales capture** — luxury fashion marketing has strong seasonal patterns (holiday gifting, Valentine's Day, etc.) and a time-varying organic baseline. Standard static intercept models cannot capture these dynamics, causing systematic attribution errors.

When base sales vary over time but the model assumes a fixed intercept, media contributions absorb the unexplained variation — leading to biased channel attribution.

## Approach

### Bayesian MMM with Time-Varying Intercept

PyMC Labs applied **PyMC-Marketing** with a targeted structural improvement:

- **Time-varying intercept via Gaussian Process (HSGP)** — models the organic/seasonal baseline as a smooth function of time rather than a fixed constant. The HSGP (Hilbert Space Gaussian Process) approximation enables efficient inference over long time series.
- **Semi-additive parameterization** — media contributions add to the time-varying base, rather than multiplying it. This ensures that media effects are properly isolated from baseline trend and seasonality variation.
- **Adstock and saturation transformations** per channel — standard carryover and diminishing returns modeling
- **Prior calibration** to match Swarovski's revenue scale and marketing budget magnitudes
- **Model validation:** MAE comparison against the client's existing baseline model

## Results

- **20% MAE reduction** after introducing the time-varying intercept and semi-additive parameterization
- Cleaner attribution of media contributions vs. organic/seasonal baseline
- Demonstrates that structural model improvements — not just more data or more channels — drive meaningful accuracy gains in luxury retail MMM

> "I've added the time varying intercept, changed the parameterization to semi additive and reduced their MAE by 20%"
> — Maxim

## Technologies

PyMC-Marketing, HSGP (Hilbert Space Gaussian Processes), Bayesian MMM, Adstock, Saturation transformations

<!-- GAP: need full engagement timeline and contract details -->
<!-- GAP: need client-side quote or testimonial -->
<!-- GAP: need detail on what channels were modeled (TV, digital, OOH?) -->
<!-- GAP: need detail on time series length and data frequency (weekly? monthly?) -->
<!-- GAP: need clarification on whether follow-on SOW or ongoing engagement occurred -->
<!-- GAP: need confirmation of whether results were used to reallocate media budget and what the outcome was -->
