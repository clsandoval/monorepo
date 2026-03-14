---
page: case-studies/fox-broadcasting
title: "Fox Broadcasting: Show-Level MMM and NFL Promo ROI Analysis"
status: partial
sources:
  - label: "Discord: fox-broadcasting-company channel"
---

# Fox Broadcasting: Show-Level MMM and NFL Promo ROI Analysis

## Client

**Fox Broadcasting Company** — major US broadcast television network.

- **Industry:** Broadcast Media / Entertainment
- **Service:** Strategy & Advisory, Training & Enablement (SLA coaching on building their own MMM)
- **Contacts:** Eugene Kwok (client lead), Nithin (data scientist)
- **Engagement period:** Contract started April/May 2025; EAP from September 2025

## Team

- **Joe Wilkinson** — Lead researcher
- **Bill Engels** — Modeling
- **Carlos Trujillo** — Support
- **Sef M** — Account support
- **Thomas Wiecki** — Principal oversight

## The Problem

Fox Broadcasting ran two parallel projects under the SLA engagement:

### Project 1: Show-Level MMM for Advertising Revenue

Building an MMM for TV show advertising revenue required solving a structurally unusual problem: **revenue is structurally zero before a show's premiere date**. Standard adstock models assume continuous spend-response dynamics, which breaks down when a channel simply cannot have generated revenue yet.

Additional complexity:
- **Multicollinearity** between National Cable, On-Air, and Synergy spend (VIFs: 4.16, 3.78, 2.44; Pearson r up to 0.85)
- Multi-show hierarchical structure across the broadcast portfolio

### Project 2: NFL In-House Promo ROI Analysis

Counterfactual analysis of NFL promotional spend ROI using causal inference methods.

## Approach

### Show-Level MMM

- **PyMC-Marketing MMM** as core framework
- **`MaskedPrior` class** to handle zero-revenue periods before show launch — channels masked out before premiere date
- **`add_cost_per_target_calibration()`** for ROAS calibration using cost-per-impression data
- **Bayesian handling of multicollinearity** via regularizing priors on correlated spend variables
- **Bass Diffusion model** proposed as complement to MMM for show viewership trajectory
- **Hierarchical model** across shows

### NFL Promo ROI Analysis

- **`CounterfactualAnalysis`** using the do-operator for scenario-based NFL promo analysis
- Bayesian posterior inference on counterfactual promotional lift

### Operational Innovation

The Daimon AI bot was activated for the Fox client channel to handle routine technical questions, allowing the research team to focus on higher-complexity work.

## Results

- Client team expanded in September 2025 (added Ellen Lee and Brigitte Vargas)
- Follow-on EAP signed September 2025 (monthly ongoing) — demonstrating the engagement deepened rather than concluded
- Relationship characterized as embedded partnership rather than consulting project

> "feels like we are part of their team"
> — Eugene Kwok, Fox Broadcasting, #fox-broadcasting-company, 2025

> "really good job today. props from Eugene about how he 'feels like we are part of their team'"
> — internal PyMC Labs channel

## Technologies

PyMC-Marketing, Bayesian MMM, `MaskedPrior`, `CounterfactualAnalysis`, Bass Diffusion Model, do-operator

<!-- GAP: need full Eugene Kwok testimonial text — not fully captured in Discord -->
<!-- GAP: need public blog post or case study writeup -->
<!-- GAP: need quantitative results (ROAS estimates, budget allocation recommendations, NFL promo lift) -->
<!-- GAP: need detail on MaskedPrior implementation — whether this became a PyMC-Marketing contribution -->
