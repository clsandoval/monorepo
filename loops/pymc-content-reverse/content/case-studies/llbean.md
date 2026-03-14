---
page: case-studies/llbean
title: "L.L. Bean: Building In-House Hierarchical MMM Capability Across 50 US DMAs"
status: partial
sources:
  - label: "Discord: llbean channel"
---

# L.L. Bean: Building In-House Hierarchical MMM Capability Across 50 US DMAs

## Client

**L.L. Bean** — US outdoor apparel and catalog/e-commerce retailer.

- **Industry:** Retail / Outdoor Apparel / Catalog / E-commerce
- **Service:** Training & Enablement (SLA coaching on building in-house capability)
- **Contact:** Kelsey (internal data scientist)
- **Engagement period:** SLA February 2024 – November 2024 (extended twice)
- **Pricing:** $5,000/month

## Team

- **Niall Oulton** — Lead PM
- **Ben Vincent** — Lead researcher / technical
- **Will Dean** — Support
- **Joe Wilkinson** — Late addition to team
- **Carlos Trujillo** — Support

## The Problem

L.L. Bean had an existing vendor-provided hierarchical MMM (50 DMAs, 70 variables, 5 purchase channels) — but they couldn't see inside it. The vendor model was a black box. Their goals:

1. **Understand their existing vendor model** — what it was doing and whether to trust it
2. **Build their own** — so they could control methodology and reduce vendor dependency
3. **Scale to 50 US DMAs** — geographic hierarchy across all their major markets
4. **Model catalog as a channel** — L.L. Bean's catalog-to-search-to-purchase funnel is a distinctive attribution challenge

> "essentially all they want from their models is to obtain response curves... they don't even care as much about contribution/key driver plots."
> — Niall Oulton

## Approach

- **Custom hierarchical Bayesian MMM** (PyMC-Marketing wasn't fit for purpose at the start of the engagement)
- **Hierarchical structure across 50 DMA regions**
- **HSGP for time-varying parameters**
- **Geo testing / lift test integration** using CausalPy synthetic control methodology
- **Affiliate click / catalog funnel modeling:** causal funnel model (Media → Affiliate clicks → Sales) to handle catalog attribution

Engagment extended twice as L.L. Bean's team progressed from single-region to full DMA-level hierarchical model.

## Results

- L.L. Bean team progressed from single-region model to hierarchical 50-DMA model
- SLA extended twice — October 2024 and November 2024
- Potential upsell identified: lift test integration and production packaging

> "if they are happy with what they have managed to achieve, they will not renew their contract with their MMM vendor."
> — Niall Oulton

> "There's a big opportunity here — if they succeed, they drop their MMM vendor and potentially expand work with us."
> — Ben Vincent

> "I may have upsold them on either a more intense SLA or potentially even project work."
> — Ben Vincent

## Technologies

PyMC, PyMC-Marketing, CausalPy (geo testing / synthetic control), HSGP, hierarchical Bayesian MMM

<!-- GAP: need public blog post or case study writeup -->
<!-- GAP: need named client quote (Kelsey or other L.L. Bean spokesperson) -->
<!-- GAP: need clarification on engagement status after November 2024 pause (data pipeline issues) -->
<!-- GAP: need confirmation of whether L.L. Bean dropped their MMM vendor -->
<!-- GAP: need Kelsey's last name for attribution -->
