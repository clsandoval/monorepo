---
page: case-studies/gain-theory
title: "Gain Theory: Hierarchical Bayesian MMM and Bass Diffusion for a WPP Marketing Science Consultancy"
status: partial
sources:
  - label: "Discord: gain-theory channel"
---

# Gain Theory: Hierarchical Bayesian MMM and Bass Diffusion for a WPP Marketing Science Consultancy

## Client

**Gain Theory** — WPP marketing science consultancy serving major CPG and media clients.

- **Industry:** Marketing Consultancy / CPG / Multi-client
- **Service:** Solution Delivery, Training & Enablement
- **Engagement period:** ~2024–2025

## Team

- **Joe Wilkinson** — Technical lead (ex-Gain Theory, joined PyMC Labs; primary bridge between PyMC and marketing science worlds)
- **Niall Oulton** — PM
- **Thomas Wiecki** — Principal oversight
- **Bill Engels** — Modeling
- **Carlos Trujillo** — Support

## The Problem

Gain Theory engaged PyMC Labs across several interconnected workstreams:

1. **Technical review and upskilling** on Bayesian MMM methodology for their internal team
2. **Custom MMM implementations** for Gain Theory's clients (CPG, media)
3. **PyMC-Marketing integration** and best practices
4. **Multi-market hierarchical MMMs**, including integrating lift tests into model likelihood
5. **Bass Diffusion modeling** for TV viewership prediction (Amazon Prime Video shows)

The Bass Diffusion workstream was a novel application: modeling show viewership dynamics using the classic innovation diffusion framework (fans/early adopters driving word-of-mouth among persuadables) to predict total audience size and its drivers.

## Approach

### Hierarchical Bayesian MMM

- PyMC-Marketing as core framework
- Hierarchical structure across geographies and markets
- HSGP for time-varying parameters
- Lift test calibration integrated directly into model likelihood
- Budget optimization via PyMC-Marketing optimizer
- Model comparison: ECDF-CRPS, LOO, R²

### Media "Cover" Transformation

> "We would transform the media into what we termed 'cover' -> essentially the % of the target audience that meets some exposure requirements."
> — Joe Wilkinson

### Bass Diffusion Model for Prime Video

Gain Theory built cross-sectional models of Bass Diffusion parameters to decompose the drivers of show viewership:

- **p** = Fans / Early Engagers (innovation coefficient)
- **q** = Persuadables (imitation coefficient)
- **m** = Total potential audience size

> "For Prime Video, we fit a Bass Diffusion model on show viewership. p = Fans/Early Engagers, q = persuadables, m = audience size. We then built cross-sectional models of these parameters to breakdown their drivers."
> — Joe Wilkinson

## Results

- Gain Theory team upskilled on Bayesian MMM methodology
- Multiple client MMM models delivered
- Bass Diffusion model for Amazon Prime Video show viewership
- Joe Wilkinson's prior experience at Gain Theory enabled unusually effective knowledge transfer

> "Joe is great at bridging the gap between the technical PyMC world and the marketing science world that Gain Theory lives in."
> — Niall Oulton

## Technologies

PyMC-Marketing, Bass Diffusion Model, HSGP, hierarchical Bayesian MMM, ECDF-CRPS model comparison

<!-- GAP: need public blog post or case study writeup -->
<!-- GAP: need named client-side quote or testimonial from Gain Theory -->
<!-- GAP: need quantitative results from client MMMs (ROAS lift, allocation changes) -->
<!-- GAP: need clarification on whether Bass Diffusion / Prime Video work is separately attributable to Gain Theory or a shared deliverable -->
<!-- GAP: need engagement timeline confirmation -->
