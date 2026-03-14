---
page: case-studies/real-madrid
title: "Real Madrid: Fan CLV Modeling with PyMC-Marketing"
status: partial
sources:
  - label: "Discord: real-madrid channel"
---

# Real Madrid: Fan CLV Modeling with PyMC-Marketing

## Client

**Real Madrid Football Club** — Spanish and European football club.

- **Industry:** Sports / Football
- **Service:** Solution Delivery (Customer/fan CLV modeling)
- **Engagement period:** 2-month EAP started June 2025; ended August 2025

## Team

- **Juan Orduz** — Researcher
- **Chris Fonnesbeck** — Technical lead
- **Colt** — CLV specialist
- **Pablo Roque** — Researcher (CLV PR)
- **Evan** — Account Manager
- **Sef M** — Account support

## The Problem

Two planned workstreams:

1. **Fan CLV modeling** — using PyMC-Marketing BG/NBD and related models to estimate fan lifetime value and support retention/engagement decisions
2. **Football/player analytics** — sensor data and player performance metrics (planned for SOW 2)

The football analytics workstream was delayed by a coaching transition: the project was scoped under Carlo Ancelotti, but a management change to Xavi disrupted the internal stakeholders and priorities.

## Approach

### Fan CLV

- PyMC-Marketing CLV models: BG/NBD (Beta-Geometric / Negative Binomial Distribution) and Modified Beta-Geometric / NBD
- Pablo Roque opened PyMC-Marketing PR #1815 to add covariate support to MBG/NBD — discovering mid-engagement that this feature did not yet exist in the library
- Hierarchical CLV models planned for RFM (Recency, Frequency, Monetary) segment hierarchy

### Football Analytics (Planned — Not Started)

- Sensor data processing identified as a candidate for the Decision.AI platform
- Stalled due to the Ancelotti → Xavi coaching transition

## Results

- CLV work progressed; covariate PR #1815 merged into PyMC-Marketing
- Football analytics component not started before EAP ended

> "Sounds like the football side of the project is in a holding pattern due to the Ancelotti → Xavi coaching change. Sounds like there is still a lot of interest."
> — Chris Fonnesbeck

> "August is kind of death in Spain [because of vacations]."
> — Juan Orduz

> "Happy to help out on the CLV stuff if they want to go deeper into it."
> — Colt

## Technologies

PyMC-Marketing, CLV models (BG/NBD, MBG/NBD), covariate support (PR #1815)

<!-- GAP: engagement ended incomplete — football analytics never started -->
<!-- GAP: need named client-side quote or testimonial -->
<!-- GAP: need clarification on whether follow-on engagement was agreed after coaching transition resolved -->
<!-- GAP: need quantitative CLV results from the fan modeling work -->
