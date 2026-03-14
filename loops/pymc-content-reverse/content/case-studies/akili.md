---
page: case-studies/akili
title: "Akili Interactive: Bayesian Cognitive Assessment Scoring for Digital Therapeutics"
status: complete
sources:
  - url: https://www.pymc-labs.com/blog-posts/2023-01-12-Akili
    label: "Blog post: Akili engagement overview"
    date: 2023-01-12
  - label: "Discord: akili channel"
  - label: "Website homepage testimonial (Titi Alailima)"
---

# Akili Interactive: Bayesian Cognitive Assessment Scoring for Digital Therapeutics

## Client

**Akili Interactive** — maker of EndeavorRx, the first FDA-approved prescription video game treatment for ADHD in children.

- **Industry:** Digital Therapeutics / Healthcare / Pharma
- **Service:** Solution Delivery
- **Engagement period:** 2023–2024 (multi-SOW)

## Team

- **Eric Ma** — Lead
- **Thomas Wiecki** — Principal oversight
- **Maxim** — Modeling
- **Virgile** — Modeling
- **Adrian** — Modeling
- **Titi Alailima** — VP of Applied Data, Akili (client contact)

## The Problem

Akili needed rigorous, uncertainty-quantified methods for scoring cognitive assessment instruments and validating the digital biomarkers derived from gameplay data in clinical trials.

Four interconnected challenges:

1. **Ordinal response scoring** — Clinical assessment instruments produce Likert-scale and ordered categorical data; treating them as continuous variables introduces systematic bias
2. **Digital biomarker validation** — Gameplay-derived cognitive metrics needed statistical validation against established clinical standards
3. **Longitudinal outcome tracking** — Measuring patient cognitive improvement over treatment courses required models robust to missing data and variable follow-up schedules
4. **Computational feasibility** — Traditional inference approaches were too slow to evaluate the range of cognitive models required across clinical trial scales

## Approach

### Ordinal Regression for Clinical Assessment

The team modeled clinical assessment data using proper ordinal methods rather than treating scores as continuous:

- **Ordinal regression with cutpoints** — Respects the ordered but non-interval nature of Likert-scale clinical data
- **Item Response Theory (IRT)-style modeling** — Estimates latent cognitive constructs from observed item responses
- Latent variable modeling for cognitive constructs underlying multiple assessment items
- ZeroSumNormal priors for identifiability of cutpoint parameters

> "The ordinal regression approach is the right one here — we shouldn't be treating Likert scales as continuous variables."
> — Eric Ma

> "What's powerful about the Bayesian approach is that we get uncertainty on the latent cognitive score, not just a point estimate."

### Hierarchical Models for Clinical Trial Structure

- Hierarchical Bayesian structure across patients, assessors, and time points
- Bayesian mixed-effects models for longitudinal treatment outcomes
- Prior predictive checks to verify clinical plausibility before fitting

### Likelihood Approximation Networks (LANs) for Cognitive Modeling

For computationally intensive cognitive process models (building on the HDDM tradition):

- **Likelihood Approximation Networks (LANs)** — Neural networks trained to approximate intractable likelihood functions for cognitive models
- Simulator-based inference (SBI) / likelihood-free inference pipeline
- Parameter recovery validation to confirm identifiability
- Accelerated inference relative to naive MCMC on complex cognitive models
- Predecessor toolbox context: **HDDM** (Hierarchical Drift Diffusion Model), PyMC Labs' prior work in this space

## Results

- Delivered a validated Bayesian scoring pipeline for clinical assessment instruments
- Models produce credible intervals on cognitive improvement metrics, enabling principled clinical trial analysis
- Accelerated inference speed for cognitive process models via LANs
- Improved parameter recovery accuracy relative to prior approaches
- Knowledge transfer to Akili's internal research team
- Expanded applicability of the methodology beyond ADHD to other behavioral health conditions

> "Most successful collaboration I've seen."
> — Titi Alailima, VP of Applied Data, Akili Interactive

<!-- GAP: need full verbatim quote from Titi Alailima homepage testimonial — current text is paraphrase from homepage analysis -->
<!-- GAP: need specifics of which assessment instruments were scored (proprietary vs. standard clinical tools) -->
<!-- GAP: need quantitative speedup figures for LAN-based inference vs. baseline -->
<!-- GAP: need confirmation of which conditions beyond ADHD were explored -->

## Technologies

PyMC, Likelihood Approximation Networks (LANs), Neural networks, HDDM, Bayesian hierarchical modeling, ArviZ
