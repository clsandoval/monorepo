---
page: case-studies/streaming-ab-test
title: "Large Video Streaming Service: Bayesian A/B Testing at Scale (100M+ Observations)"
status: partial
sources:
  - url: https://www.pymc-labs.com/blog-posts/bayesian-inference-at-scale-running-ab-tests-with-millions-of-observations
    label: "Blog post: Bayesian A/B testing at scale with histogram approximation"
---

# Large Video Streaming Service: Bayesian A/B Testing at Scale

## Client

**Unnamed large video streaming service** — client name not disclosed.

- **Industry:** Digital Media / Entertainment / Streaming
- **Service:** Solution Delivery

## The Problem

Standard Bayesian A/B testing became computationally impractical at scale: the client ran tests with 1–10 million observations, and at that scale, evaluating every individual observation at each MCMC step was prohibitively slow.

## Approach

### Histogram Approximation for Bayesian A/B Testing

- Traditional MCMC evaluates every observation at each NUTS step — complexity scales linearly with observations
- **Histogram approximation:** bin observations into a fixed number of bins (e.g., 500), evaluate only bin centers weighted by observation counts
- Complexity now scales with bin count, not observation count — enabling 100M+ observation tests on commodity hardware
- New `histogram_approximation` distribution contributed to the `pymc-experimental` repository

## Results

| Metric | Standard | Histogram (~500 bins) |
|--------|----------|-----------------------|
| 500K observations | 75 sec | 13 sec (~6x faster) |
| 100M observations | impractical | 22 sec (standard iMac) |

- Posterior estimates aligned closely between fast and standard models — no accuracy loss
- Open-source contribution: `histogram_approximation` distribution in `pymc-experimental`

## Technologies

PyMC, pymc-experimental, histogram approximation, MCMC/NUTS

<!-- GAP: need client name (not disclosed in blog) -->
<!-- GAP: need team member attribution — blog post author not captured -->
<!-- GAP: need blog post publication date -->
