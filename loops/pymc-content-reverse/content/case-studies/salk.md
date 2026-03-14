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
  - url: https://news.err.ee/1609387604/salk-expands-beyond-estonia-s-borders-aims-to-boost-revenues-further
    label: "ERR News: SALK expands beyond Estonia"
  - url: https://news.err.ee/1164595/head-of-praxis-think-tank-establishes-liberal-citizen-foundation
    label: "ERR News: Tarmo Jüristo establishes Liberal Citizen Foundation"
  - url: https://www.caucasianjournal.org/2022/04/tarmo-juristo-founder-of-salk-estonia.html
    label: "Caucasian Journal: Tarmo Jüristo, founder of SALK"
---

# SALK: Multilevel Regression & Post-Stratification for Public Opinion Polling

## Client

**SALK** — **SA Liberaalne Kodanik** (Estonian: Liberal Citizen Foundation)

> **IDENTITY RESOLVED:** SALK is NOT the Salk Institute in San Diego (the biomedical research institute). SALK is an **Estonian NGO and political data consultancy** founded by Tarmo Jüristo. The name is an Estonian acronym for "SA Liberaalne Kodanik" (Liberal Citizen Foundation). The CEO title on the PyMC Labs homepage testimonial likely refers to a prior role or is used loosely — Jüristo's official title is **founder and director** of SALK.

- **Full Name:** SA Liberaalne Kodanik (Liberal Citizen Foundation) — abbreviated SALK
- **Country:** Estonia (Tallinn-based; expanding across Central/Eastern Europe)
- **Industry:** Political consultancy / Civic data / Public opinion research
- **Mission:** "Defending democracy with data" — supports liberal democratic parties with data analysis, polling, and campaign support
- **Geographic reach:** Estonia + 7 other nations: Croatia, Lithuania, Romania, Slovakia, Czech Republic, and more
- **Founded by:** Tarmo Jüristo (former head of Praxis think tank)
- **Notable backers:** Bolt CEO Markus Villig, Bolt company, Sten Tamkivi (tech), Taavet Hinrikus (Wise co-founder)
- **Revenue (2023):** ~€200,000 (doubled from prior year; ~€194,000 from donations)
- **Service:** Solution Delivery
- **Contact:** Tarmo Jüristo, Founder & Director

### About Tarmo Jüristo

Estonian civil society activist and opinion leader. Born 1971 in the Soviet Union. Finance degree from Tartu University. Career in investment banking and finance until 2009 financial crisis. Pursued doctorate in cultural studies; wrote for theater and TV; taught literature, anthropology, and philosophy. Former CEO of **Hansa Asset Management** and former head of **Praxis** think tank. Founded SALK to apply data science to democratic participation.

### SALK's Work

SALK conducts public opinion polls and electoral forecasting — particularly notable for demographic breakdowns needed in election analysis. Their polling requires reliable estimates even for demographic strata with very sparse survey responses (e.g., rural minorities, small age cohorts), which led to the PyMC Labs engagement.

**Known projects:**
- Estonian parliamentary elections (March 2023) — provided data/analysis to Reform, Eesti 200, SDE parties
- Tallinn local elections forecasting (predicted seat allocations per party)
- Expansion into 7+ European countries for similar electoral data work

## Team

- **Thomas Wiecki** — Lead (PyMC Labs)
- **Alexandre Andorra** — Lead (PyMC Labs)
- **Tarmo Jüristo** — Client lead / practitioner (SALK)

## The Problem

Public opinion polls produce noisy, sparse data — especially across smaller demographic strata and geographic subgroups. When certain population segments have too few survey respondents, traditional aggregation methods produce unstable estimates or simply fail to generate actionable numbers.

> "Data can be sparse in some strata of the population, making the model's job harder, precisely for the demographics you're the most interested in."
> — Tarmo Jüristo, SALK (from PyMC Labs blog post, 2022-12-08)

SALK needed a principled statistical approach that could produce reliable, actionable inference across all demographic groups, even when individual strata had very limited data. This is especially important for electoral analysis where minority groups and sparse geographic areas are exactly the demographics you most need to understand.

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
