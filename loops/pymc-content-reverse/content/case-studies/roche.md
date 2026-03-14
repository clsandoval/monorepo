---
page: case-studies/roche
title: "Roche: Scalable Hierarchical Bayesian Models for Pharmaceutical-Scale Genomic Data"
status: partial
sources:
  - label: "Discord: roche channel"
  - label: "Analysis: discord-case-studies-extraction.md"
  - label: "Blog post: saving-the-world (company origin story — Roche mentioned as first client)"
---

# Roche: Scalable Hierarchical Bayesian Models for Pharmaceutical-Scale Genomic Data

## Client

**Roche** — one of the world's largest pharmaceutical and biotech companies, headquartered in Basel, Switzerland.

- **Industry:** Pharmaceutical / Biotech
- **Service:** Solution Delivery
- **Engagement period:** 2020 (first client, mentioned in PyMC Labs founding story); project channel active through ~2022

Roche is notable as **PyMC Labs' first client**, engaged at the company's founding in 2020.

## Team

- **Thomas Wiecki** — Lead
- **Maxim** — Modeling
- **Adrian** — Modeling
- **Niall** — Modeling

## The Problem

Roche required Bayesian models capable of analyzing **large-scale genomic or clinical trial data** — datasets that present a fundamental challenge for standard Bayesian computation: when parameter counts and observation counts reach pharmaceutical scale, standard MCMC approaches become impractically slow.

### The Scale Challenge

- ~34,000 parameters
- ~250,000 observations
- Standard NUTS sampling on CPU: estimated days to converge
- Practical requirement: results in hours, not days

## Approach

### Hierarchical Bayesian Model with JAX Backend

PyMC Labs built a hierarchical Bayesian model designed from the ground up for computational efficiency at pharmaceutical scale:

- **Hierarchical structure** with ~34K parameters across genomic or clinical groupings
- **Non-centered parameterization** throughout — critical for sampling efficiency in hierarchical models with many groups
- **JAX/NumPyro backend** via `sample_numpyro_nuts` for GPU-accelerated inference
- **Posterior predictive checks** and model diagnostics via ArviZ

### Key Computational Result

> "It's really amazing that we fit a model with 34K parameters, on 250K observations in just over 1 hour"
> — Team member

> "The JAX backend is what makes this possible — pure NUTS on CPU would have taken days"

**Runtime:** Just over 1 hour for 34K parameters on 250K observations — a result that demonstrated Bayesian methods are practical at pharmaceutical data scale when implemented with GPU acceleration and non-centered parameterizations.

## Results

- Successfully fit a 34K-parameter hierarchical Bayesian model on 250K observations in approximately 1 hour
- Demonstrated practical scalability of Bayesian methods to pharmaceutical-scale datasets
- Established PyMC Labs' capability in large-scale life sciences applications, contributing to subsequent pharma engagements (Takeda, Salk)

## Technologies

PyMC, JAX/NumPyro, Non-centered parameterization, ArviZ

<!-- GAP: need clarification on exact problem domain — genomics, clinical trial analysis, or pharmacokinetics? -->
<!-- GAP: need specific deliverable description — what did the model output? What decision did Roche make with it? -->
<!-- GAP: need client-side quote or testimonial -->
<!-- GAP: need confirmation of contract scope and whether follow-on SOWs occurred -->
<!-- GAP: quotes sourced from Discord are unattributed — need named attribution or confirmation they are suitable for use -->
