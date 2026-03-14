---
page: case-studies/indigo-ag
title: "Indigo Ag: Spatial Gaussian Process Modeling for Agricultural Treatment Effects"
status: complete
sources:
  - url: https://www.pymc-labs.com/blog-posts/2022-08-11-indigo
    label: "Blog post: Spatial GP for field trial treatment effects"
    date: 2022-08-11
  - label: "Discord: indigo channel"
  - label: "Website homepage testimonial (Manu Martinet)"
  - label: "Halah draft: Indigo listed as 2024 Custom Bayesian Models / Embedded Teams project"
---

# Indigo Ag: Spatial Gaussian Process Modeling for Agricultural Treatment Effects

## Client

**Indigo Ag** — agricultural biotechnology company developing microbial seed treatments to improve crop yield sustainably.

- **Industry:** Agriculture / AgTech
- **Service:** Solution Delivery, Embedded Teams
- **Contact:** Manu Martinet, Lead Data Scientist
- **Engagement:** ~2022–2024

## Team

- **Thomas Wiecki** — Principal
- **Bill Engels** — Lead modeling
- **Niall Oulton** — Modeling
- **Carlos Trujillo** — Modeling

## The Problem

Indigo Ag's core scientific challenge: measuring whether their microbial seed treatments genuinely improve crop yields, and by how much.

Field trial data presents a fundamental confounding problem — agricultural fields have natural spatial variation in soil quality, moisture, drainage, and microclimate. This spatial structure means that adjacent plots are more similar to each other than distant plots, regardless of treatment assignment. Naive comparisons of treatment vs. control plots absorb this spatial signal as noise, obscuring true treatment effects.

Additional data challenges:
- **Limited data** across multiple geographies, crop types, and growing conditions
- **Extensive zero-inflation** — in bad years, a significant fraction of fields have near-zero yields, and standard log-normal models fail to account for this

> "The goal of the project was to identify the underlying spatial pattern and remove it in order to measure more accurately the treatment effect."

## Approach

### Spatial Signal Decomposition with Gaussian Processes

The core insight: model field yields as a sum of separable components:

- **Treatment effect** — the signal of interest
- **Spatial effects** — captured by a Gaussian Process over field coordinates
- **Noise** — residual variation

By explicitly modeling the spatial structure with a GP, the treatment effect estimate is isolated from the confounding spatial heterogeneity.

### Zero-Inflated Crop Yield Modeling

Standard log-normal models assumed all fields had non-trivial yields. Field data showed this was wrong.

- **Zero-inflated log-normal distribution** for crop yield — a mixture model combining a point mass at (near) zero with a log-normal for productive fields
- Significantly improved distributional fit over naive log-normal

> "The zero-inflated lognormal is really the key here — you can't ignore that a significant fraction of fields have near-zero yield in bad years."

### Full Hierarchical Architecture

- **Hierarchical Bayesian structure** across farms, regions, and crop types
- **Weather covariates** — precipitation and temperature as predictors of baseline yield
- GP components for both spatial and temporal variation
- PyMC/PyMC5 migration work during engagement
- NUTS sampler with JAX backend for performance
- Posterior predictive checks to validate model behavior against holdout crop cycles

> "The hierarchical structure lets us borrow strength across farms in similar regions even when individual farm data is sparse."

## Results

- Successfully isolated microbial treatment effects by explicitly modeling and removing spatial confounds
- Zero-inflated model substantially improved fit and credibility of effect estimates in low-yield scenarios
- Enabled more accurate and defensible measurement of treatment contributions to crop yield
- Model validated against holdout crop cycles
- Embedded Teams service delivery — sustained collaboration over multiple growing seasons

<!-- GAP: need specific quantitative treatment effect estimates or % yield improvement figures -->
## Client Testimonial

> "Additional expertise was helpful to get the model to the finish line and into production."
> — Manu Martinet, Lead Data Scientist, Indigo Ag
> (Source: pymc-labs.com blog post 2022-08-11)

<!-- RESOLVED: Manu Martinet testimonial found in web research -->
<!-- GAP: need confirmation of which crop types were modeled -->
<!-- GAP: need clarity on scope of PyMC5 migration work within the engagement -->

## Technologies

PyMC, PyMC5, Gaussian Processes, Bayesian hierarchical models, JAX, Zero-inflated models, ArviZ
