---
page: case-studies/salk
title: "SALK: Multilevel Regression & Post-Stratification for Public Opinion Polling"
status: partial
sources:
  - url: https://www.pymc-labs.com/blog-posts/2022-12-08-Salk
    label: "Blog post: SALK MrP engagement"
    date: 2022-12-08
  - label: "Website homepage testimonial (Tarmo Jüristo)"
  - label: "Halah draft: SALK listed as 2025 Custom Bayesian Models project"
---

# SALK: Multilevel Regression & Post-Stratification for Public Opinion Polling

## Client

**SALK** (Salk Institute — public opinion polling context)

- **Industry:** Non-profit / Research / Public Opinion
- **Service:** Solution Delivery
- **Contact:** Tarmo Jüristo, CEO

<!-- GAP: need to confirm SALK's full organization name and whether "Salk Institute" is correct or if SALK is a separate Estonian/European polling organization — the CEO name "Tarmo Jüristo" suggests the latter -->

## Team

- **Thomas Wiecki** — Lead
- **Alexandre Andorra** — Lead

## The Problem

Public opinion polls produce noisy, sparse data — especially across smaller demographic strata and geographic subgroups. When certain population segments have too few survey respondents, traditional aggregation methods produce unstable estimates or simply fail to generate actionable numbers.

SALK needed a principled statistical approach that could produce reliable, actionable inference across all demographic groups, even when individual strata had very limited data.

## Approach

### Multilevel Regression with Post-Stratification (MrP)

MrP is a principled Bayesian technique for generating population-level estimates from survey data by:

1. Fitting a multilevel regression model with demographic and geographic predictors
2. Post-stratifying predictions to known population cell counts

**Technical architecture:**
- Hierarchical Bayesian modeling of nested clusters and demographic groups
- Partial pooling across strata — borrows statistical strength from adjacent groups when individual cell counts are small
- **Gaussian Process** integration for temporal and/or spatial variation patterns
- Geospatial covariation extensions for geographic estimates
- Interactive dashboard for communicating results to non-technical stakeholders

## Results

- Stabilized estimates across all demographic groups, including sparse strata
- Meaningful predictions even for population segments with very few survey respondents
- Actionable inference from uneven survey distributions

> "Makes inference possible — it makes it actionable, even [with] only a few data points for some demographics."
> — Tarmo Jüristo, CEO, SALK

## Technologies

PyMC, Gaussian Processes, Bayesian hierarchical modeling, Dashboard visualization

<!-- GAP: need specifics on which survey topics or policy domains were modeled -->
<!-- GAP: need quantitative validation metrics — how were estimates validated against ground truth -->
<!-- GAP: need detail on the dashboard technology/platform used -->
<!-- GAP: need to clarify whether the 2025 Halah draft reference indicates a follow-on engagement or just delayed publication -->
<!-- GAP: need Alexandre Andorra quote or technical color on the GP component -->
