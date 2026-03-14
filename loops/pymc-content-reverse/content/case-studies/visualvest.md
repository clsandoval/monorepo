---
page: case-studies/visualvest
title: "VisualVest: Probabilistic Customer Lifetime Value for a Robo-Investment Platform"
status: complete
sources:
  - label: "Discord: visualvest channel"
---

# VisualVest: Probabilistic Customer Lifetime Value for a Robo-Investment Platform

## Client

**VisualVest** — German robo-investment platform offering automated wealth management services to retail investors.

- **Industry:** FinTech / Robo-investing / Wealth Management
- **Service:** Solution Delivery
- **Engagement period:** SOW 1 (November 2022), SOW 2 (2023)

## Team

- **Christian** — Lead researcher, SOW 1
- **Tomi** — Modeling
- **Ben Vincent** — Advisor
- **Thomas Wiecki** — PM
- **Larry** — Modeling
- **Ricardo** — Modeling

## The Problem

VisualVest needed a **probabilistic Customer Lifetime Value (CLV) model** to understand the long-run value of their investor customer base. CLV models power acquisition budget decisions, customer segmentation, and long-term financial planning.

### Why Standard CLV Approaches Didn't Fit

VisualVest's setting has several features that break standard CLV models:

1. **Contractual, discrete-time setting** — customers are active subscribers on a monthly basis (unlike non-contractual retail purchase models)
2. **Variable payment amounts** — revenue is a percentage of Assets Under Management (AUM), not a fixed subscription fee. A customer's payment grows or shrinks with their account balance over time.
3. **Standard Pareto/NBD and BG/NBD models** don't apply — those are designed for non-contractual settings with fixed transaction values
4. **GDPR compliance** — data could not be stored in US-based infrastructure, constraining tooling choices

### The Core Modeling Challenge

The combination of **contractual churn** (Shifted Beta-Geometric) with **variable payment amounts** (% of AUM) required a custom Bayesian model that doesn't exist off the shelf.

## Approach

### Shifted Beta-Geometric (SBG) Survival Model

The Shifted Beta-Geometric (SBG) model — the standard approach for contractual CLV — was adopted as the foundation and extended for VisualVest's variable-payment setting:

- **SBG model** for monthly customer churn probability — each period, a customer either churns (with probability θ) or stays
- **Hierarchical individual-level churn parameters:** `θ` per customer estimated via a Logit GLM with customer-level covariates
- **Censoring handled explicitly** in the likelihood — customers who haven't yet churned are right-censored, not excluded
- **Variable payment modification** — revenue per period modeled as a function of AUM rather than a fixed fee, allowing the CLV integral to account for investment return dynamics
- **Log-Normal survival model** explored as an alternative parameterization to the Geometric distribution
- **Bernstein polynomial approach** explored for a fully flexible survival function (Adrian), ultimately not used in final delivery
- **Non-hierarchical Geometric model delivered** for SOW 1 — hierarchical version had convergence issues at the available sample size

### Streamlit Dashboard

An interactive **Streamlit dashboard** was built for VisualVest's internal team to explore CLV estimates:

- Posterior predictive lifetime, fee, and total value for future customers
- Segmentation by cohort, acquisition channel, or customer attributes
- Visual exploration of uncertainty in lifetime and value estimates

## Results

- **SOW 1 delivered November 2022** — client extremely positive about delivery quality
- **SOW 2 signed** for model extension with additional covariates
- Client noted that PyMC Labs' approach of continuing to challenge and improve a model after reaching "final" status was unusual and valued in the consulting space

> "They really appreciated that we went a step further after the first 'final model'. They say it's not so common in consulting services (to challenge/keep improving something that's 'final')"
> — Tomi

> "He mentions he sees the tremendous amount of work we put here. Even though the final result may look simple, he values the process a lot"
> — Tomi

> "David repeats all the time that we're very transparent, honest, and always looking to get the best result (given project scope)"
> — Tomi

## Technologies

PyMC, Shifted Beta-Geometric (SBG) model, Bayesian CLV, Streamlit, Logit GLM, Log-Normal survival model, Bernstein polynomials (explored)

<!-- GAP: need quantitative CLV accuracy results — e.g., held-out cohort validation metrics -->
<!-- GAP: need named client quote from David (VisualVest) for use in marketing material -->
<!-- GAP: need clarification on whether hierarchical version was eventually delivered in SOW 2 -->
<!-- GAP: need clarification on exact GDPR data residency solution used -->
<!-- GAP: need engagement financials / contract value if available for internal reference -->
