---
page: case-studies/erisyon
title: "Erisyon: Bayesian HMM for Single-Molecule Protein Sequencing"
status: partial
sources:
  - label: "Discord: erisyon channel"
---

# Erisyon: Bayesian HMM for Single-Molecule Protein Sequencing

## Client

**Erisyon** — single-molecule protein sequencing startup developing fluorescence-based proteomics technology.

- **Industry:** Biotech / Proteomics / Life Sciences
- **Service:** Solution Delivery
- **Engagement period:** ~2024–2025

## Team

- **Adrian** — Lead researcher
- **Maxim** — Modeling support
- **Thomas Wiecki** — Principal oversight

## The Problem

Erisyon's technology generates noisy fluorescence signals from individual protein molecules. Decoding these signals to identify protein sequences requires solving a computationally intensive inference problem:

1. **High dimensionality:** The space of possible peptides and proteins is enormous
2. **Noisy observations:** Fluorescence signals are stochastic and overlap across amino acids
3. **Uncertainty quantification:** Protein identification must carry calibrated confidence estimates, not just point predictions
4. **Throughput:** The pipeline must handle high-throughput experimental data

Standard PyMC implementations would be too slow for the dimensionality of the protein identification problem.

## Approach

PyMC Labs built a Bayesian Hidden Markov Model (HMM) pipeline with a custom JAX-based likelihood integrated into PyMC:

- **Model:** Bayesian HMM as a state space model over protein sequence observations
- **Custom likelihood:** Forward algorithm for the HMM written in JAX, integrated into PyMC via `pm.Potential`
- **Sampling:** NUTS via JAX backend (`sample_numpyro_nuts`) for GPU-accelerated inference
- **Validation:** Extensive prior predictive checking to validate the fluorescence signal model
- **Implementation:** Vectorized for high-throughput batch processing

The key technical insight was that the standard PyMC op-based approach would be prohibitively slow at this scale. Writing the HMM forward algorithm directly in JAX and plugging it in as a custom potential gave the necessary speedup.

> "The JAX likelihood is the key — the standard PyMC approach would be too slow for the dimensionality of the protein identification problem."

> "The trick is writing the forward algorithm for the HMM in JAX and plugging it in as a custom Op."
> — Adrian

## Results

- Working Bayesian protein identification pipeline delivered
- Custom JAX HMM likelihood achieved significant speedup versus a pure PyMC implementation
- Credible intervals on protein identification probabilities — enabling calibrated confidence in sequence calls
- Client reported: "couldn't have done in a year what you did in a month"

## Technologies

PyMC, JAX, Hidden Markov Model (HMM), custom JAX likelihood via `pm.Potential`, `sample_numpyro_nuts`

<!-- GAP: need public blog post or technical writeup -->
<!-- GAP: need named client quote with attribution -->
<!-- GAP: need quantitative speedup figure (e.g., Nx faster than pure PyMC) -->
<!-- GAP: need engagement date range confirmation -->
<!-- GAP: need clarification on whether "couldn't have done in a year" quote is direct or paraphrased -->
