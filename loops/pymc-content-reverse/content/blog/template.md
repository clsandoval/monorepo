---
page: blog/template
title: Blog — Content Template & Index
status: complete
sources:
  - https://www.pymc-labs.com/blog-posts/ (Playwright, 2026-03-13)
  - https://www.pymc-labs.com/sitemap-0.xml (2026-03-13)
  - analysis/website-scrape/blog-index.md
  - https://www.pymc-labs.com/blog-posts/saving-the-world (individual post, 2026-03-14)
  - https://www.pymc-labs.com/blog-posts/2022-11-11-HelloFresh (individual post, 2026-03-14)
  - https://www.pymc-labs.com/blog-posts/pymc-marketing-vs-meridian-baseline-modeling-mmm (individual post, 2026-03-14)
  - https://www.pymc-labs.com/blog-posts/2023-01-12-Akili (individual post, 2026-03-14)
  - https://www.pymc-labs.com/blog-posts/bayes-is-slow-speeding-up-hellofreshs-bayesian-ab-tests-by-60x (individual post, 2026-03-14)
  - https://www.pymc-labs.com/blog-posts/AI-based-Customer-Research (individual post, 2026-03-14)
---

# Blog Page — Content Package

## Page URL
`/blog-posts` (current site) → likely `/blog` on new site

## SEO Metadata (current site)
- **Title tag:** "PyMC Labs Blog | Tutorials, Case Studies & Applied Bayesian Analytics"
- **Meta description:** "Posts covering MMM, causal modeling, forecasting, and advanced statistical methods"

---

## Hero / Featured Post Slot

Each page of the blog listing shows a full-width featured post with:
- Large hero image
- Post title (H1)
- Date string (e.g., "December 18, 2025")
- 2–3 sentence excerpt / teaser paragraph
- Clickable card → full post

**Current featured posts (most recent first):**

### Featured 1 (Page 1)
**Title:** PyMC-Marketing and Meridian Revisited: Approaches to Baseline Modeling for MMMs
**URL:** /blog-posts/pymc-marketing-vs-meridian-baseline-modeling-mmm
**Date:** December 18, 2025
**Excerpt:** "PyMC-Marketing still leads where MMM matters most: reliable attribution. We reran our benchmark against the latest Google Meridian update to see what changed and what didn't."

### Featured 2 (Page 2)
**Title:** Tracking Marketing Effectiveness Over Time Using Bayesian Media Mix Models
**URL:** /blog-posts/modelling-changes-marketing-effectiveness-over-time
**Date:** January 24, 2026
**Excerpt:** "This post shows why treating marketing performance as fixed over time leads to bad decisions, and how to fix it. By letting cost-per-acquisition change smoothly using Gaussian Processes, while keeping the model interpretable—we can track real shifts in channel effectiveness and avoid inflated CAC estimates."

---

## Filter / Category Bar

4 primary filters shown by default; "More Filters" reveals all 11:

| Label | Filter URL |
|---|---|
| Bayesian | /blog-posts/filters/bayesian |
| PyMC | /blog-posts/filters/pymc |
| Tutorials | /blog-posts/filters/tutorials |
| Marketing Measurement | /blog-posts/filters/marketing-measurement |
| Time Series | /blog-posts/filters/time-series |
| Energy Analytics | /blog-posts/filters/energy-analytics |
| Synthetic Consumers | /blog-posts/filters/synthetic-consumers |
| Bayesian Marketing Science | /blog-posts/filters/bayesian-marketing-science |
| Use Cases | /blog-posts/filters/use-cases |
| Customer Analytics | /blog-posts/filters/customer-analytics |
| PyMC Community | /blog-posts/filters/pymc-community |

Search input: "Search blog posts by title..."

---

## Blog Post Grid

Posts displayed as image + title cards. No date or excerpt shown in grid view.
2 pages total: Page 1 (47 posts), Page 2 (20 posts).

### Individual Blog Post Card Structure
- Thumbnail image (Cloudinary hosted)
- Post title (H2, linked)

### Individual Blog Post Page Structure

**Documented from 5 real post fetches (2026-03-14):**

#### Chrome/Navigation
- **Breadcrumb:** `Blog > [Category] > [Post Title]`
  - Category is omitted on some newer posts (e.g., Dec 2025 Meridian post has no category in breadcrumb)
  - Examples: `Blog > PyMC Community > Introducing PyMC Labs`, `Blog > Marketing Measurement > Bayesian Marketing Mix Models`
- **URL pattern:** `/blog-posts/{slug}` (current site)

#### Post Header
- **Title (H1):** Full post title
- **Byline:** `By [Author Name]` — no role or title shown
- **Date:** Full date string, e.g., `January 12, 2023` / `December 18, 2025`
- **Category tag:** Shown in breadcrumb only (e.g., "Use Cases", "Marketing Measurement", "PyMC Community")
- **No tags displayed** on the post itself (category visible only via breadcrumb)

#### Body Content
Three primary post formats observed:

**Format A — Video + Timestamps** (Akili, HelloFresh panel discussion):
- 1–2 paragraph intro
- YouTube video embed (iframe)
- Timestamps list (00:00 – HH:MM format with topic labels)
- Resources section with external links
- No code blocks

**Format B — Long-Form Technical Case Study** (HelloFresh 60x, Meridian benchmark):
- "At a Glance" summary section with 4–6 bullet points
- H2 sections with prose explanations and occasional rhetorical questions as sub-headings
- Figures/charts embedded (with captions)
- Tables (comparison metrics, results)
- Code blocks (Python/PyMC) — present but minimal in prose-heavy posts
- Table of Contents (linked, sidebar or inline) on longer posts
- Closing section: "Try It Yourself or Get in Touch" / "Find Out More" with GitHub link + contact CTA

**Format C — Research Highlight** (Colgate Synthetic Consumers):
- Research context setup (1–2 paragraphs)
- Problem → breakthrough → results narrative
- Inline stat callouts (e.g., "90% correlation attainment")
- "About the Research Team" section in body listing co-authors with affiliation
- "What's Next" roadmap section
- "Want to learn more?" section with 3 related PyMC Labs post links

#### Author Attribution
- `By [Name]` only — no title, no headshot, no bio block on any post
- For research papers: "About the Research Team" paragraph within body text names all co-authors
- Examples observed:
  - Thomas Wiecki — saving-the-world (Feb 18, 2021), 2022-11-11-HelloFresh (Nov 11, 2022), 2023-01-12-Akili (Jan 12, 2023)
  - Teemu Säilynoja + Luca Fiaschi — pymc-marketing-vs-meridian-baseline-modeling-mmm (Dec 18, 2025)
  - Benjamin Vincent — bayes-is-slow-speeding-up-hellofreshs-bayesian-ab-tests-by-60x (Jan 21, 2026)
  - Benjamin F. Maier — AI-based-Customer-Research (Oct 9, 2025)

#### In-Post CTAs
- Inline contextual CTAs embedded at bottom of post body:
  - "Reach out" / "Contact" → https://www.pymc-labs.com/contact
  - GitHub repo links (for reproducibility posts): e.g., `github.com/pymc-labs/mmm-param-recovery`
  - "Read the Full Preprint" → arxiv.org links
  - "Want to learn more?" sections with 2–4 related PyMC Labs post links
- Pattern: **1 contact CTA + 2–4 related post links** at bottom of post body

#### Related Posts Carousel (End of Post)
- 6 posts shown in horizontal scroll carousel
- No visible algorithm/logic — appears curated or category-based
- Example carousel (from Akili post): Bayesian MARCEL, Hierarchical Models for Sports Analytics, Akili, Survey Modeling, Item Response, Indigo Ag

#### Newsletter CTA (Footer of Post)
- Section heading: **"Subscribe to our newsletter"**
- Body copy: *"Stay connected with the latest developments in Bayesian AI Statistics and AI."*
- Form: Email input + "Subscribe" button
- Fine print: *"You can unsubscribe at any time. For more details, review our Privacy Policy page."*

#### Post Footer
- Logo + tagline: "The Bayesian AI Consultancy" → /
- Nav: Home (/) | About (/team) | Blog (/blog-posts)
- Email: info@pymc-labs.com
- Social icons: Bluesky (bsky.app/profile/pymc-labs.bsky.social), X/Twitter (x.com/pymc_labs), Meetup (meetup.com/pymc-labs-online-meetup/), YouTube (@PyMCLabs), LinkedIn (linkedin.com/company/pymc-labs)
- Copyright: © 2026 PyMC Labs. All Rights Reserved.

---

## Complete Post List (69 visible + ~6 unlisted = 75 in sitemap)

### Grouped by Content Theme

#### Marketing Mix Modeling (MMM) — ~15 posts
| Title | Slug | Date |
|---|---|---|
| PyMC-Marketing and Meridian Revisited: Approaches to Baseline Modeling for MMMs | pymc-marketing-vs-meridian-baseline-modeling-mmm | Dec 2025 |
| Tracking Marketing Effectiveness Over Time Using Bayesian Media Mix Models | modelling-changes-marketing-effectiveness-over-time | Jan 2026 |
| Marketing Mix Modeling: A Complete Guide | marketing-mix-modeling-a-complete-guide | — |
| PyMC-Marketing vs. Meridian: A Quantitative Comparison of Open Source MMM Libraries | pymc-marketing-vs-google-meridian | — |
| From Weeks to Minutes: Accelerate building your Bayesian MMM using Fivetran & PyMC-Marketing | accelerating-bayesian-mmm-fivetran-pymc-marketing | — |
| The AI MMM Agent, An AI-Powered Shortcut to Bayesian Marketing Mix Insights | the-ai-mmm-agent | — |
| Introducing the BETA Release of Our MMM Agent - Powered by PyMC-Marketing | ai-mmm-agent-beta | — |
| Media Mix Model Calibration with Lift Tests and Bayesian Priors in PyMC-Marketing | mmm_roas_lift | — |
| Bayesian Marketing Mix Models: State of the Art and their Future | 2022-11-11-HelloFresh | — |
| Improving the Speed and Accuracy of Bayesian Media Mix Models for Marketing Optimization | reducing-customer-acquisition-costs-how-we-helped-optimizing-hellofreshs-marketing-budget | 2021 |
| Bayesian Media Mix Modeling for Marketing Optimization | bayesian-media-mix-modeling-for-marketing-optimization | 2021 |
| Mastering Marketing Effectiveness: A Comprehensive Guide for Digital Marketers | 2023-19-11-marketing-effectiveness | Nov 2023 |
| Bayesian Methods in Modern Marketing Analytics | 2023-06-20-juan-marketing-analytics | Jun 2023 |
| Building an in-house marketing analytics solution | 2023-07-18-niall-In-house-marketing | Jul 2023 |
| Bayesian Causal Analysis in PyMC: Using the `do` operator to uncover true marketing impact | causal-analysis-with-pymc-answering-what-if-with-the-new-do-operator | — |
| PyMC-Marketing: A Bayesian Approach to Marketing Data Science | pymc-marketing-a-bayesian-approach-to-marketing-data-science | — |

#### Synthetic Consumers — ~8 posts
| Title | Slug | Date |
|---|---|---|
| Synthetic Consumers in Market Research - A Practical Guide (2026) | synthetic-consumers-a-practical-guide | 2026 |
| AI-based Customer Research: Faster & Cheaper Surveys with Synthetic Consumers | AI-based-Customer-Research | Oct 2025 |
| Synthetic Consumers: The Promise, The Reality, and The Future | synthetic-consumers | — |
| Can LLMs Replace Human Survey Respondents? Evaluating Synthetic Consumers on Political and Lifestyle Questions | how-realistic-are-synthetic-consumers | — |
| Can Synthetic Consumers Answer Open-Ended Questions? | synthetic-consumers-open-ended-responses | — |
| AI Innovation Lab: Reimagining Product Innovation with Synthetic Consumers and Agentic Workflows | innovation-lab | — |
| Do LLMs Understand Real-World Prices? A Price Is Right Benchmark for Synthetic Consumers | can-llms-play | — |
| LLMs and Price Reasoning: Toward an Industry Benchmark | price-benchmark | — |

#### Case Studies — ~11 posts
| Title | Slug | Client |
|---|---|---|
| Likelihood Approximations for Cognitive Modeling with PyMC | 2023-01-12-Akili | Akili Interactive |
| Hierarchical Bayesian Modeling of Survey Data with Post-stratification | 2022-12-08-Salk | Salk Institute |
| Bayesian Marketing Mix Models: State of the Art and their Future | 2022-11-11-HelloFresh | HelloFresh |
| How HelloFresh Scaled Bayesian A/B Testing with a 60× Speedup | bayes-is-slow-speeding-up-hellofreshs-bayesian-ab-tests-by-60x | HelloFresh |
| Improving the Speed and Accuracy of Bayesian Media Mix Models | reducing-customer-acquisition-costs-... | HelloFresh |
| Bayesian Item Response Modeling in PyMC | 2022-10-26-AlvaLabs | Alva Labs |
| Bayesian Modeling in Biotech: Using PyMC to Analyze Agricultural Data | 2022-08-11-indigo | Indigo Ag |
| Bayesian model to infer private equity returns from capital in and outflows | everysk | Everysk |
| AI-based Customer Research: Faster & Cheaper Surveys with Synthetic Consumers | AI-based-Customer-Research | Colgate-Palmolive |
| Causal sales analytics: Are my sales incremental or cannibalistic? | causal-sales-analytics-are-my-sales-incremental-or-cannibalistic | Colgate-Palmolive |
| Causal sales analytics: A deep-dive on discrete choice modeling | causal-sales-analytics-discrete-choice-modeling | Colgate-Palmolive |

#### Sports Analytics — ~5 posts
| Title | Slug |
|---|---|
| Modeling Swinging Strikes with Bayesian Additive Regression Trees (BART) | bayesian-additive-regression-tree-swinging-strikes |
| Bayesian Spatial Modeling for Evaluating Hockey Goaltending Performance | bayesian-spatial-modeling-for-evaluating-hockey-goaltending-performance |
| Developing Hierarchical Models for Sports Analytics | 2023-09-15-Hierarchical-models-Chris-Fonnesbeck |
| Bayesian MARCEL: Probabilistic Baseball Player Projections with PyMC | bayesian-marcel |
| NBA Foul Analysis with Item Response Theory using PyMC | 03-xpost-ar-nba-irt |

#### Causal Inference — ~6 posts
| Title | Slug |
|---|---|
| Congratulations, You Have a DAG. Now What? | causal-dag-functional-form-bayesian-investing |
| Unraveling Cause-and-Effect With AI: A Step Towards Automated Intelligent Causal Discovery | ai-for-causal-discovery |
| Causal sales analytics: Are my sales incremental or cannibalistic? | causal-sales-analytics-are-my-sales-incremental-or-cannibalistic |
| Causal sales analytics: A deep-dive on discrete choice modeling | causal-sales-analytics-discrete-choice-modeling |
| Introducing CausalPy: Bayesian Causal Inference for Quasi-Experimental Data | causalpy-a-new-package-for-bayesian-causal-inference-for-quasi-experiments |
| Counterfactual Causal Inference in PyMC: Estimating Excess Deaths with Bayesian Models | causal-inference-in-pymc |
| Bayesian Causal Analysis in PyMC: Using the `do` operator | causal-analysis-with-pymc-answering-what-if-with-the-new-do-operator |

#### Customer Analytics / CLV — ~3 posts
| Title | Slug |
|---|---|
| Hierarchical Bayesian Models for Customer Lifetime Value | hierarchical_clv |
| Pareto/NBD Model for Customer Lifetime Value: A Bayesian Approach with PyMC-Marketing | pareto-nbd |
| Complete Guide to Cohort Revenue & Retention Analysis: Bayesian Modeling Approach | cohort-revenue-retention |

#### AI / LLM — ~4 posts
| Title | Slug |
|---|---|
| Measuring Reliability in AI-Assisted Bayesian Modeling | improving-ai-agent-performance-with-domain-skills |
| Unraveling Cause-and-Effect With AI | ai-for-causal-discovery |
| Write Me a PyMC Model | write-me-a-pymc-model |
| AI Innovation Lab | innovation-lab |

#### Finance — ~3 posts
| Title | Slug |
|---|---|
| Application of Bayesian Computation in Finance | bayesian-computation-in-finance |
| Bayesian model to infer private equity returns | everysk |
| Stochastic Volatility Model with PyMC | 01-xpost-tw-stochastic-volatility |
| Congratulations, You Have a DAG. Now What? (investing) | causal-dag-functional-form-bayesian-investing |

#### Time Series / Forecasting — ~4 posts
| Title | Slug |
|---|---|
| Probabilistic Time Series Analysis: Opportunities and Applications | probabilistic-forecasting |
| Latent Calendar: Modeling Weekly Behavior with Latent Components | 2023-10-27-Latent-calendar-Will |
| Building Time-Series Models With Known Data Structure | 04-xpost-be-time-series-volcano |
| Bayesian Vector Autoregression (BVAR) with PyMC | bayesian-vector-autoregression |

#### Company / About — ~4 posts
| Title | Slug |
|---|---|
| Introducing PyMC Labs | saving-the-world |
| Building PyMC Labs: Five Principles from Open Source | labs-principles |
| Announcing the Expert Access Program (EAP) | expert-access-program |
| From Uncertainty to Insight: How Bayesian Data Science Can Transform Your Business | from-uncertainty-to-insight-... |
| Solving Real-World Business Problems with Bayesian Modeling | Thomas_PyData_London |

#### PyMC Tutorials / Technical — ~12 posts
| Title | Slug |
|---|---|
| Likelihood-Free Inference in PyMC: Using Flax Neural Networks | likelihood-approximations-through-neural-networks |
| JAX Functions in PyMC: Three Quick Examples Using PyTensor Ops | jax-functions-in-pymc-3-quick-examples |
| PyMC, Aesara and AePPL: The New Kids on The Block | 2022-07-10-ricardo-video |
| MCMC sampling for dummies | 02-xpost-tw-MCMC-sampling |
| Running PyMC in the Browser with PyScript | pymc-in-browser |
| Out of model predictions with PyMC | out-of-model-predictions-with-pymc |
| Simulating data with PyMC | simulating-data-with-pymc |
| The Quickest Migration Guide Ever from PyMC3 to PyMC v4.0 | the-quickest-migration-guide-ever-from-pymc3-to-pymc-v40 |
| MCMC for Big Datasets: How Much Faster Is JAX and GPU Sampling with PyMC? | pymc-stan-benchmark |
| Bayesian A/B Testing at Scale: A Histogram Approximation Approach | bayesian-inference-at-scale-running-ab-tests-with-millions-of-observations |
| Gaussian Process Geospatial Modeling in PyMC | spatial-gaussian-process-01 |
| Estimating a Candidate's Popularity over Time with Markov Processes | markov-process |

---

## Bottom-of-Page CTA
- **Newsletter signup:** "Stay connected with latest developments in Bayesian AI Statistics and AI. You can unsubscribe at any time."
  - Email input + Subscribe button
  - Privacy Policy link

---

## Footer Elements (blog page)
- Logo + tagline: "The Bayesian AI Consultancy"
- Nav: Home | About | Blog
- Email: info@pymc-labs.com
- Social: Bluesky (bsky.app/profile/pymc-labs.bsky.social), X/Twitter (x.com/pymc_labs), Meetup (meetup.com/pymc-labs-online-meetup/), YouTube (@PyMCLabs), LinkedIn (linkedin.com/company/pymc-labs)
- Copyright: "© 2026 PyMC Labs. All Rights Reserved."

---

---

## Author & Date Reference (confirmed from individual post fetches)

| Slug | Author | Date |
|---|---|---|
| saving-the-world | Thomas Wiecki | Feb 18, 2021 |
| bayesian-media-mix-modeling-for-marketing-optimization | Thomas Wiecki | 2021 (est.) |
| 2022-08-11-indigo | — | Aug 11, 2022 |
| 2022-10-26-AlvaLabs | — | Oct 26, 2022 |
| 2022-11-11-HelloFresh | Thomas Wiecki | Nov 11, 2022 |
| 2022-12-08-Salk | — | Dec 8, 2022 |
| 2023-01-12-Akili | Thomas Wiecki | Jan 12, 2023 |
| AI-based-Customer-Research | Benjamin F. Maier | Oct 9, 2025 |
| pymc-marketing-vs-meridian-baseline-modeling-mmm | Teemu Säilynoja, Luca Fiaschi | Dec 18, 2025 |
| bayes-is-slow-speeding-up-hellofreshs-bayesian-ab-tests-by-60x | Benjamin Vincent | Jan 21, 2026 |
| modelling-changes-marketing-effectiveness-over-time | — | Jan 24, 2026 |
| causal-dag-functional-form-bayesian-investing | — | Mar 2026 (est.) |

<!-- GAP: Dates and authors still missing for ~55 posts — only 12/75 confirmed -->
<!-- GAP: ~6 posts in sitemap not visible in listing (unlisted/draft?) — slugs unknown -->
<!-- GAP: Category mapping for most posts requires individual fetches — only 3 confirmed: "PyMC Community" (saving-the-world), "Marketing Measurement" (2022-11-11-HelloFresh), "Use Cases" (2023-01-12-Akili, bayes-is-slow) -->

---

## Blog Content Strategy Notes (from discord-marketing-extraction.md)

### Top Posts by Sessions (Dec 2025 analytics — Thomas shared)
The blog is a primary SEO driver. Top 10 posts by traffic concentrated on MMM content.
Key traffic drivers:
- "Marketing Mix Modeling: A Complete Guide" (marketing-mix-modeling-a-complete-guide) — high organic traffic
- Meridian benchmark posts — #1 and #2 traffic peaks on publication
- HelloFresh case studies — evergreen traffic
- "From Uncertainty to Insight" — thought leadership entry point
- Synthetic Consumers posts — rising traffic cluster (2025)
- Sports Analytics posts — niche SEO

### Blog as Sales Funnel
- Blog posts drive EAP signups and workshop registrations
- CausalPy and pymc-marketing OSS posts drive developer awareness → enterprise pipeline
- Meridian benchmark posts specifically cited in sales conversations (proof of technical superiority)
- "Announcing the Expert Access Program" (expert-access-program) = commercial conversion post

### Post Formats Used
1. **Panel Discussion / Video post** — YouTube embed + timestamps (older format, 2021–2023)
2. **Case Study post** — detailed narrative of client engagement (Colgate, HelloFresh, Indigo, Akili)
3. **Technical Tutorial** — step-by-step PyMC/pymc-marketing code walkthrough
4. **Benchmark / Comparison** — data-driven comparison (Meridian benchmark series)
5. **Product Announcement** — EAP, MMM Agent beta, Decision Hub (company news)
6. **Research Highlight** — academic paper summary (SSR/Synthetic Consumers, Maier et al. 2025)
7. **Thought Leadership** — "From Uncertainty to Insight", "Solving Real-World Problems"

### Newsletter Integration
- Blog footer newsletter CTA on every post
- Newsletter launches announced via blog (Discord evidence)
- Newsletter copy mirrors blog content themes

---

## SEO & URL Notes

- **Current URL pattern:** `/blog-posts/{slug}`
- **New site URL pattern:** Likely `/blog/{slug}` — confirm with dev team
- **Sitemap:** `sitemap-0.xml` lists all 75 blog post URLs
- **Redirects needed:** `/blog/` → `/blog-posts/` on current site returns 404
- **Cloudinary CDN:** Hero images hosted on Cloudinary (all posts)
- **Filter URLs:** `/blog-posts/filters/{slug}` — 11 category filters

---

## Gap Flags

<!-- GAP: Dates and authors confirmed for only 12/75 posts — remaining 63 need individual fetches or metadata API -->
<!-- GAP: ~6 posts in sitemap not visible in listing (unlisted/draft?) — slugs unknown -->
<!-- GAP: Category/tag mapping for most posts is unconfirmed — only 3 confirmed categories -->
<!-- GAP: No comments system visible — confirm whether blog has comments/Disqus/none -->
<!-- GAP: Social sharing buttons on individual posts — present/absent? -->
<!-- GAP: "Energy Analytics" category in filter bar — no posts in this category visible in listing; may be a filter for future content or legacy tag -->
