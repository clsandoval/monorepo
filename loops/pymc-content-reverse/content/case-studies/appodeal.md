---
page: case-studies/appodeal
title: "Appodeal: Bayesian MMM for Mobile App Developer Acquisition"
status: partial
sources:
  - label: "Discord: appodeal channel"
---

# Appodeal: Bayesian MMM for Mobile App Developer Acquisition

## Client

**Appodeal** — mobile app monetization platform serving app developers with programmatic ad mediation and growth tools.

- **Industry:** Mobile Ad Tech / Marketing Technology
- **Service:** Solution Delivery
- **Engagement period:** ~2024–2025

## Team

- **Niall Oulton** — Lead researcher
- **Thomas Wiecki** — Principal oversight
- **Bill Engels** — Modeling
- **Sef M** — Support

## The Problem

Appodeal needed to understand which marketing channels were actually driving acquisition of new app developers onto their platform. Standard multi-touch attribution was inadequate: developer acquisition journeys span multiple channels and touchpoints, and the underlying data contained significant noise.

Key challenges:
- Multi-touch attribution paths obscuring true channel contribution
- Data noise making point-estimate ROAS unreliable for media allocation decisions
- Need for uncertainty quantification alongside channel contribution estimates

## Approach

PyMC Labs built a Bayesian Marketing Mix Model using PyMC-Marketing as a baseline, extended with custom components:

- **Adstock:** Geometric decay transformation per channel
- **Saturation:** Custom saturation functions for diminishing returns
- **Hierarchical structure** across acquisition channels
- **Time-varying intercept** via Gaussian Process to capture trend and seasonality
- **Validation:** LOO cross-validation and posterior predictive checks
- **ROAS estimation** with full credible intervals per channel

The PyMC-Marketing framework provided the structural baseline; custom components were added to handle Appodeal's specific data characteristics and channel mix.

## Results

- Delivered complete MMM with channel contribution decomposition
- Posterior ROAS estimates with uncertainty quantification per channel — not point estimates
- Client able to make media allocation decisions informed by both expected return and uncertainty

> "The Bayesian approach is really valuable here because we're not just giving them a point ROAS, we're giving them a distribution — they can see which channels have high expected return but also high uncertainty."
> — Niall Oulton

## Technologies

PyMC-Marketing, Bayesian MMM, Gaussian Processes, adstock/saturation transformations

<!-- GAP: need public blog post or case study writeup -->
<!-- GAP: need client-side quote or named testimonial -->
<!-- GAP: need quantitative results (e.g., budget reallocation outcome, ROAS lift) -->
<!-- GAP: need engagement date range confirmation -->
