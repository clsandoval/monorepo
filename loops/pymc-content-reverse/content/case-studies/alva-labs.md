---
page: case-studies/alva-labs
title: "Alva Labs: Bayesian Psychometric Modeling for Hiring Assessment Validity"
status: complete
sources:
  - url: https://www.pymc-labs.com/blog-posts/2022-10-26-AlvaLabs
    label: "Blog post: Alva Labs personality modeling"
    date: 2022-10-26
  - label: "Discord: alva-labs channel"
---

# Alva Labs: Bayesian Psychometric Modeling for Hiring Assessment Validity

## Client

**Alva Labs** — Swedish HR tech company providing psychometric assessments (cognitive ability and personality) for hiring decisions.

- **Industry:** HR Technology / B2B SaaS
- **Service:** Solution Delivery
- **Engagement:** ~2022

## Team

- **Thomas Wiecki** — Principal
- **Morgan** — Lead (blog post)
- **Tomi** — Modeling (Discord)
- **Christian** — Modeling (Discord)
- **Niall Oulton** — Modeling (Discord)

## The Problem

Two related but distinct challenges:

### 1. Personality Trait Estimation (Blog Focus)

Alva Labs' existing personality model had emerging limitations. They needed more sophisticated statistical methods for combining item-level responses and quantifying personality traits with appropriate uncertainty, rather than producing point estimates from simple aggregations.

### 2. Predictive Validity & Enterprise Sales Evidence (Discord Focus)

To win and retain enterprise clients, Alva Labs needed to demonstrate that their assessments actually predict job performance. This is harder than it sounds:

- **Selection bias / restricted range problem** — performance data only exists for candidates who were hired; this censors the distribution and artificially deflates observed validity correlations
- **Small per-client samples** — individual enterprise clients have too few hires to estimate validity independently
- **Ordinal performance outcomes** — manager-rated job performance is inherently ordered categorical, not continuous

> "The challenge with validating HR assessments is that you only have performance data for people you hired — so you have selection bias baked in from the start."

## Approach

### Bayesian Workflow

The engagement followed a principled Bayesian workflow:

1. Problem understanding and framing
2. Data simulation to validate modeling assumptions
3. Model building and parameterization testing
4. Inference engine comparison
5. Real data validation
6. Benchmarking against Alva Labs' existing system

### Item Response Theory in PyMC

- **Graded Response Model (GRM)** — the IRT model for ordered categorical responses, appropriate for personality assessment items with 5-point response scales
- Latent trait estimation with full posterior uncertainty
- Prior predictive checks to validate score-response relationships

### Hierarchical Validity Modeling

- **Ordinal regression** for Likert-scale job performance outcomes
- **Hierarchical Bayesian model** across companies and roles — pools information across clients while allowing company-specific effects
- **Selection-on-observables correction** for the restricted range / selection bias problem
- **Bayesian partial pooling** across client companies to generate meaningful validity estimates even when individual client N is small

> "Bayesian partial pooling across companies is what allows us to say something meaningful even when individual client sample sizes are small."

### Implementation

- PyMC implementation with ArviZ diagnostics
- Posterior predictive checks validating score-to-performance relationships
- Production-ready pipeline for personality trait estimation
- Evidence package developed for enterprise sales use

## Results

- New Bayesian model substantially outperformed Alva Labs' original system on key metrics
- Faster sampling computations
- Improved memory efficiency
- Enhanced model reliability and validity evidence
- Production-ready personality trait estimation with credible intervals
- Successfully demonstrated predictive validity with uncertainty quantification
- Validity evidence package developed for enterprise sales conversations

<!-- GAP: need specific quantitative improvement figures — e.g., % improvement in predictive validity, sampling speed numbers -->
<!-- GAP: need client-side quote or testimonial from Alva Labs -->
<!-- GAP: need confirmation of whether the model went to production and at what scale -->
<!-- GAP: need detail on which personality framework (Big Five / HEXACO / proprietary) underlies the model -->

## Technologies

PyMC, Python, Item Response Theory (IRT), Graded Response Model (GRM), ArviZ, Bayesian hierarchical modeling
