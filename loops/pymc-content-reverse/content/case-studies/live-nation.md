---
page: case-studies/live-nation
title: "Live Nation: Hierarchical Bayesian MMM for Concert Tour Ticket Sales Across 125+ Artists"
status: partial
sources:
  - label: "Discord: live-nation channel"
---

# Live Nation: Hierarchical Bayesian MMM for Concert Tour Ticket Sales Across 125+ Artists

## Client

**Live Nation** — global live entertainment company managing concert tours, venues, and ticketing.

- **Industry:** Live Entertainment / Concert/Tour Promotion
- **Service:** Solution Delivery
- **Engagement period:** SOW 1 and SOW 2 completed

## Team

- **Niall Oulton** — PM / lead
- **Maxim** — Lead researcher
- **Bill Engels** — Modeling
- **Aziz** — Support
- **Thomas Wiecki** — Principal oversight
- **Juan Orduz** — Support

## The Problem

Live Nation needed a Marketing Mix Model for concert tour ticket sales — a domain with uniquely complex dynamics that standard MMM frameworks cannot handle:

1. **Phase-driven sales:** Ticket sales follow distinct phases (Announce, Pre-Sale, On-Sale, Maintenance), each with different marketing response curves and decay dynamics
2. **Structural zeros:** Many days between phase transitions have zero ticket sales — not missing data, but structurally zero observations
3. **Scale:** 100+ artists with heterogeneous marketing budgets, venues, and audience profiles
4. **Spend optimization:** Response curves needed for budget allocation across channels

> "What makes an artist perform differently from another? What features or factors contribute to one artist's presale and onsale performing differently from another artist?"
> — Cathy, Live Nation

## Approach

### SOW 1 — Proof of Concept (Single Artist)

- GP for organic trend
- Tanh saturation function
- Phase effects modeling
- Zero-inflated / Hurdle likelihood for days with zero ticket sales

### SOW 2 — Hierarchical Scale (100+ Artists)

The full hierarchical model introduced several novel techniques:

**Structural:**
- Vectorized hierarchical HSGP for scalable time-varying parameters
- Hierarchical phase effects (decay magnitude, retention) across artists
- Hierarchical adstock across artists and channels
- Channels: Meta, Paid Search, On-Air (TV), Synergy

**Identifiability:**
- ZeroSumNormal priors for identifiability across hierarchical dimensions

**Novel technique — Reverse Adstock:**
- Maxim developed a "reverse adstock" approach to handle post-trough dynamics in ticket sales — modeling how marketing effects propagate backward from an on-sale spike

**Likelihood:**
- LogNormal likelihood chosen over NegBinomial after testing — superior convergence and model fit

> "the model is 🔥"
> — Maxim (after switching to LogNormal likelihood)

**Non-centered parameterization** throughout for sampling efficiency

## Results

- Hierarchical model ran successfully across **125+ artists**
- Interactive spend optimization tool built for the client team
- Spend response curves per channel delivered

> "1% is what I constantly get under many priors — out of the mean prediction only 1% is marketing."
> — Maxim (on overall marketing contribution)

> "It's more like 20% of the predicted distribution in first few weeks [during on-sale phase]."
> — Niall (on phase-specific marketing attribution)

> "despite a lot of work is being done, the work is so packed and dense, we are ahead of schedule."
> — Maxim

## Technologies

PyMC, PyMC-Marketing, HSGP, ZeroSumNormal priors, hierarchical Bayesian MMM, LogNormal likelihood, reverse adstock (novel)

<!-- GAP: need public blog post or case study writeup -->
<!-- GAP: need named client-side quote with attribution -->
<!-- GAP: need quantitative business outcome (budget reallocation, revenue impact) -->
<!-- GAP: need clarification on whether "reverse adstock" became a PyMC-Marketing contribution -->
<!-- GAP: need Cathy's last name for attribution -->
