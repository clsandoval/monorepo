---
page: case-studies/fabletics
title: "Fabletics: MMM Upgrade from PyMC3 to PyMC-Marketing with HSGP"
status: partial
sources:
  - label: "Discord: fabletics / techstyle channel"
---

# Fabletics: MMM Upgrade from PyMC3 to PyMC-Marketing with HSGP

## Client

**TechStyle Fashion Group / Fabletics** — fashion and e-commerce group operating subscription and direct retail brands.

- **Industry:** Fashion / E-commerce / Retail
- **Service:** Training & Enablement (SLA coaching, PyMC upgrade)
- **Contact:** Kate (internal data scientist, promoted during engagement)
- **Engagement period:** SOW 1 May–November 2024; SOW 2 proposed March 2025
- **Pricing:** $5,000/month

## Team

- **Niall Oulton** — PM
- **Bill Engels** — Modeling
- **Juan Orduz** — Technical guidance
- **Will Dean** — Support
- **Luciano** — Support
- **Jesse Grabowski** — Performance optimization

## The Problem

Fabletics had a working in-house MMM built on PyMC3 — but the original author had left the company. The model needed:

1. **Migration from PyMC3 to PyMC5/PyMC-Marketing** — a substantial API and paradigm change
2. **HSGP addition** — time-varying parameters to capture evolving marketing effectiveness
3. A path to future capabilities: MLflow integration, geo testing, causal inference

The engagement was structured as coaching and enablement — Kate and the internal team would build the upgraded model with expert guidance.

## Approach

- **PyMC-Marketing upgrade** from PyMC3 to PyMC5 API
- **HSGP for time-varying parameters (TVPs)** on key marketing coefficients
- **Performance fix:** Jesse Grabowski identified that vectorized `geometric_adstock` was ~6x slower due to a JAX dynamic slice issue; resolved with `freeze_dims_and_data` workaround
- **MLflow integration** discussed as a three-phase plan for production deployment
- **Geo testing with CausalPy** identified as a future project: synthetic control for market-level lift tests

## Results

- Kate's upgraded model was "looking very good" by the September 2024 progress call
- Kate was promoted during the engagement — recognition of her modeling work
- SOW 1 completed November 2024

> "The model Kate showed us today is looking very good! Maybe we could think about writing a blog post with them about how we have helped them improve the model."
> — Juan Orduz

> "i think thats a great idea, itd be a great success story."
> — Bill Engels

> "nice work! It's great to hear such pleased clients."
> — Niall Oulton

> "I think there is a big opportunity to work together on geo tests and integrate this into their MMM."
> — Juan Orduz

## Technologies

PyMC-Marketing, HSGP, JAX, MLflow, `freeze_dims_and_data` workaround, CausalPy (geo testing, future)

<!-- GAP: need public blog post — team discussed writing one but unclear if completed -->
<!-- GAP: need Kate's last name for attribution -->
<!-- GAP: need SOW 2 status — was it signed in March 2025? -->
<!-- GAP: need quantitative model improvement metrics (e.g., fit quality before/after HSGP) -->
<!-- GAP: need whether freeze_dims_and_data fix was contributed upstream to PyMC-Marketing -->
