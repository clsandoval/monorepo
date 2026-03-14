---
page: case-studies/colgate-synthetic-consumers
title: "Colgate-Palmolive: Synthetic Consumer Research via Semantic Similarity Rating"
status: complete
sources:
  - url: https://www.pymc-labs.com/blog-posts/AI-based-Customer-Research
    label: "Blog post: AI-based customer research / SSR methodology"
    date: 2025-10-09
  - label: "Discord: synthetic-consumers channel"
  - label: "Website: Innovation Lab CPG page (website-scrape/crawl-remaining.md)"
  - label: "Website homepage testimonial (Iraklis Pappas)"
  - label: "Halah draft: Colgate-Palmolive case study"
---

# Colgate-Palmolive: Synthetic Consumer Research via Semantic Similarity Rating

## Client

**Colgate-Palmolive** — global consumer goods company, with this engagement led by the AI function.

- **Industry:** Consumer Goods / FMCG
- **Service:** Solution Delivery, Research
- **Client contact:** Iraklis Pappas, Global Head of AI, Colgate-Palmolive
- **Engagement:** 2025

## Team

- **Benjamin F. Maier** — Lead researcher
- **Ulf Aslak** — Modeling
- **Luca Fiaschi** — Partner
- **Nina Rismal** — Research
- **Kemble Fletcher** — Research
- **Christian Luhmann** — Research
- **Robbie Dow** — Research
- **Thomas Wiecki** — Principal oversight
- **Kli Pappas (Iraklis Pappas)** — Colgate-Palmolive (client)

## The Problem

Consumer research panels are expensive, slow (weeks of turnaround), and increasingly difficult to recruit for. LLMs seemed like an obvious replacement — but they don't work out of the box for survey research.

**The core problem with naive LLM surveys:** When asked directly to produce numerical ratings (e.g., "Rate this product 1–5"), LLMs produce unrealistic score distributions:
- Clustering around neutral responses
- Insufficient variance across products and conditions
- Systematic positivity bias in some configurations
- Distributions that don't match real human survey patterns

Colgate-Palmolive needed a scalable, statistically valid alternative to human consumer panels — one that could produce realistic rating distributions matching actual consumer behavior.

## Approach: Semantic Similarity Rating (SSR)

The team developed and validated a novel two-step methodology called **Semantic Similarity Rating (SSR)**:

### Step 1: Natural Language Elicitation
- Demographically-conditioned AI personas generate *free-text* responses to product stimuli
- Personas are conditioned on demographic attributes (age, gender, income, geography) to simulate population diversity
- Natural language responses avoid the direct numerical rating problem

### Step 2: Semantic Similarity Mapping
- Free-text responses are mapped to numerical rating scales (e.g., 1–5) via **semantic similarity** against reference anchor statements
- Anchors are calibrated exemplars for each point on the scale (e.g., what does a "5" response sound like vs. a "2"?)
- Cosine similarity between response embeddings and anchor embeddings produces the final rating

### Validation at Scale

The methodology was validated against a substantial empirical dataset:
- **57 real consumer surveys**
- **9,300 human responses**
- Comparison on distributional similarity and product ranking accuracy

### Open Source

The methodology was open-sourced:
- GitHub: **pymc-labs/semantic-similarity-rating** (130+ stars)
- Academic paper: Maier et al. 2025

## Innovation Lab CPG Platform Context

Synthetic Consumers is one component of a broader 5-capability CPG innovation pipeline:

1. **Brief generation** — AI-assisted product brief creation
2. **AI evaluation** — synthetic panel assessment of concepts
3. **Design refinement** — iterative concept improvement
4. **Synthetic testing** — SSR-based consumer simulation
5. **Market simulation** — demand forecasting from synthetic data

Competitive positioning: differentiated vs. Kantar RichMix and Fractal.ai.

## Results

- **90%** correlation with human product rankings (across 57 surveys)
- **85%+** distributional similarity to actual human survey responses
- **Less positivity bias** than traditional human panels
- **<24 hour** cycle time vs. weeks for traditional consumer research panels
- Validated at scale: 57 surveys, 9,300 human responses
- Open-source methodology with 130+ GitHub stars
- Peer-reviewed paper: Maier et al. 2025

> From Halah draft: "9K responses, 90% reliability, 74% agreement"

## Client Testimonial

> "At Colgate-Palmolive, we really value the relationship we've built with PyMC Labs. They continue to deliver truly unmatched quality work on the hardest and most cutting edge problems we encounter. Their blend of deep Bayesian expertise, GenAI, and domain knowledge makes them an essential partner for delivering innovative, practical, and impactful solutions."
> — Iraklis Pappas, Global Head of AI, Colgate-Palmolive
> (Source: pymc-labs.com homepage testimonial)

## Preprint Citation

Maier, B.F., Pappas, K., et al. (2025). *Semantic Similarity Rating: Using LLMs to Simulate Consumer Research Panels*. arXiv:2510.08338
- URL: https://arxiv.org/abs/2510.08338
- Published: October 2025

<!-- GAP: clarify the "74% agreement" figure from Halah draft — which metric does this correspond to vs. the "90% correlation" and "85% distributional similarity" figures? -->
<!-- RESOLVED: arxiv link is https://arxiv.org/abs/2510.08338 -->
<!-- GAP: need confirmation of whether SSR is now in production use at Colgate-Palmolive -->
<!-- RESOLVED: oral-care category explicitly validated in blog post and innovation lab page -->

## Technologies

LLMs, Python, SSR methodology, semantic embeddings, demographic conditioning

**GitHub:** [pymc-labs/semantic-similarity-rating](https://github.com/pymc-labs/semantic-similarity-rating)
