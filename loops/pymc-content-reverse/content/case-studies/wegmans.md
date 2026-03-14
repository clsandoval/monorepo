---
page: case-studies/wegmans
title: "Wegmans: Bayesian New Store Site Selection and Cannibalization Modeling"
status: partial
sources:
  - label: "Discord: wegmans channel"
  - label: "Analysis: discord-case-studies-extraction.md"
---

# Wegmans: Bayesian New Store Site Selection and Cannibalization Modeling

## Client

**Wegmans Food Markets** — premium US grocery chain, known for exceptional customer experience, operating primarily in the Northeast and Mid-Atlantic US.

- **Industry:** Grocery Retail / Supermarket Chain
- **Service:** Solution Delivery
- **Engagement period:** SOW 1 completed October 2025; SOW 2 / EAP active
- **Partner connection:** Fivetran (Wegmans is a shared client through Databricks partnership)

## Team

- **Luca Fiaschi** — Account Manager
- **Sef M** — Account
- **Multiple researchers** — Modeling

## The Problem

When Wegmans considers opening a new store, they face two tightly coupled questions:

1. **How much will the new store sell?** — Site selection requires predicting incremental sales for the new location
2. **How much will nearby Wegmans stores lose?** — Every new Wegmans cannibalizes some sales from existing "sister stores" in overlapping trade areas

Standard retail site selection models treat these as separate problems or ignore the cannibalization effect entirely. Wegmans needed a unified model that quantifies both effects jointly.

### Key Modeling Challenges

- Quantify the "sister store cannibalization" effect with uncertainty bounds
- Incorporate demographic and geographic covariates (trade area composition, population density, income)
- Validate against historical store openings (limited ground truth events)
- Achieve useful predictive accuracy (MAPE target)

## Approach

### Bayesian Spatial Hierarchical Model

- **Bayesian spatial model** integrating Nielsen/census data and trade area data
- **Hierarchical structure** across store locations and demographic segments
- **Cannibalization term:** negative intercept adjustment for stores within overlapping trade areas of the new location
- **MAPE** used as primary evaluation metric
- **Model validation** against historical store openings

## Results

- **Sister store cannibalization effect: ~1%** — new stores cause approximately 1% sales reduction in nearby existing Wegmans locations (smaller than many industry practitioners would expect)
- **MAPE of 13–14%** on sales prediction — acceptable accuracy for a site selection decision support tool
- **SOW 1 completed October 2025**
- **Strong client satisfaction** — led directly to SOW 2 (EAP support package)

> "We appreciate your efforts thus far"
> — Rob (Wegmans client)

> "Good job wrapping up this phase of the wegmans project. Seems like they are very keen to keep working with us 💪"
> — Luca Fiaschi

> "The sister store cannibalization effect is around 1% — smaller than many would expect"
> — Team

## Technologies

PyMC, Bayesian spatial modeling, hierarchical models, Nielsen data integration

<!-- GAP: need clarification on exact spatial model architecture — GP over space? Distance decay function? Trade area overlap metric? -->
<!-- GAP: need clarification on what demographic/geographic covariates were used -->
<!-- GAP: need confirmation of whether model drives live site selection decisions or is advisory -->
<!-- GAP: need detail on SOW 2 / EAP scope -->
<!-- GAP: Fivetran/Databricks partnership connection — clarify how this influenced the engagement or data infrastructure -->
