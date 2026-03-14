---
page: resources/industry-benchmarks
title: Industry Benchmarks
status: partial
sources:
  - analysis/website-scrape/resources.md
  - analysis/website-scrape/blog-index.md
  - analysis/discord-marketing-extraction.md
  - analysis/discord-competition-extraction.md
  - https://www.pymc-labs.com/benchmark/LLMPriceIsRight
  - https://www.pymc-labs.com/blog-posts/pymc-marketing-vs-google-meridian
  - https://www.pymc-labs.com/blog-posts/pymc-stan-benchmark
  - https://www.pymc-labs/benchmark/LLMPriceIsRight/leaderboard
---

# Industry Benchmarks

## Page Context / Nav

The current site's "Resources" nav item points directly to `/benchmark/LLMPriceIsRight` — there is no separate `/resources/` page. The new sitemap creates a dedicated **Industry Benchmarks** page that should aggregate all PyMC Labs benchmarks in one place.

Current sitemap URLs in `/benchmark/` tree:
- `/benchmark/LLMPriceIsRight` — main benchmark page
- `/benchmark/LLMPriceIsRight/leaderboard` — live leaderboard (JS-rendered)
- `/benchmark/LLMPriceIsRight/add-model` — model submission form

---

## Hero / Page Intro

<!-- GAP: No written hero copy for a "Benchmarks" overview page — need to write from scratch or pull from blog intro text -->

Candidate framing (from blog/marketing copy):
- "We don't just build models — we measure them."
- "Reproducible benchmarks that tell you what actually works."
- "Most comparisons online are high-level or use simplistic examples, leaving teams to rely on brand familiarity or anecdotal advice." — Halah Joseph, 2025-09-10

---

## Benchmark 1: LLM Price Is Right

### Metadata
- **URL:** https://www.pymc-labs.com/benchmark/LLMPriceIsRight
- **Blog post:** https://www.pymc-labs.com/blog-posts/price-benchmark
- **Authors:** Maxim Laletin, Allen Downey
- **Blog post date:** September 17, 2025
- **Last data update:** September 25, 2025
- **GitHub:** https://github.com/pymc-labs/PriceIsRightLLM

### Page Title / Meta
- **Title:** "LLM Price Estimation Benchmark | Test Real-World Pricing, Strategy & Business Insights"
- **Meta description:** "We test whether LLMs can estimate consumer product prices and reason strategically in a Price-is-Right style game, with results, metrics, and a full public leaderboard."

### What It Is
A novel evaluation framework inspired by the showcase game on "The Price is Right" TV show. Assesses whether language models can accurately estimate consumer product costs and make strategic bidding decisions under specific constraints.

From the page:
> "While the benchmark task description is very simple and easily understandable, it demonstrates a possibility to probe serious AI skills: using background knowledge and context to make constrained real-world decisions. By turning a game into a benchmark, we get a structured, repeatable way to measure models' real-world sensibility."

### How the Game Works
- Two LLMs compete as contestants viewing the same showcase
- Each model bids on the price of an everyday consumer item (toothpaste, snacks, cleaners, etc.)
- The closest bid **without going over** wins the round
- If both models overbid, neither wins
- Showcases typically total around $20 in value

### Example Products From the Dataset
- Kraft Cool Whip — 8oz dessert topping — $2.29
- Mezzetta Roasted Peppers — 16oz jar — $3.99
- Minute Maid Orange Juice — 1 gal container — $7.49

### Dataset
- **Size:** 820 real grocery items sourced from The Price is Right television program
- **Pricing:** West-coast manufacturer suggested retail prices. Static in v1, updates planned.
- **Data source:** https://priceisright.fandom.com/wiki/Grocery_prices
- **Challenge sequence:** Every model runs 50–100 showcases. Each round: (1) send prompt with rules + output instructions, (2) provide 10 reference price examples from similar products, (3) parse bids and rationales, (4) compare to actual retail price, calculate APE, determine overbid.
- **Required output format (JSON):** `{"bid": 1234.56, "rationale": "Brief explanation..."}`
- **API requirement:** OpenAI-compatible endpoint

### Evaluation Metrics

| Metric | Description |
|--------|-------------|
| **Elo Rating** | Chess-inspired rating; models gain points for wins, lose for losses. Higher = better overall performance. |
| **MAPE** | Mean Absolute Percentage Error — average % difference between bid and actual price (ignoring overbids). |
| **Overbid Rate** | % of bids that exceeded the actual price (auto-disqualification). |

### Leaderboard (as of September 25, 2025)

**Best Elo Rating:**
| Rank | Model | Elo |
|------|-------|-----|
| #1 | qwen3-30b-a3b | 1239 |
| #2 | gpt-5 | 1207 |
| #3 | gpt-4o | 1178 |
| #4 | grok-4 | 1170 |
| #5 | o3 | 1129 |

**Lowest MAPE (best accuracy):**
| Rank | Model | MAPE |
|------|-------|------|
| #1 | o3 | 13.78% |
| #2 | o1 | 14.49% |
| #3 | gpt-5 | 17.06% |
| #4 | grok-4 | 19.47% |
| #5 | qwen3-30b-a3b | 22.84% |

**Lowest Overbid Rate:**
| Rank | Model | Overbid Rate |
|------|-------|-------------|
| #1 | qwen3-30b-a3b | 18.37% |
| #2 | gpt-3.5-turbo | 20% |
| #3 | gpt-4o | 28% |
| #4 | gpt-4o-2024-08-06 | 40% |
| #5 | gpt-5-mini | 40.82% |

<!-- GAP: Leaderboard is JS-rendered and live — the table above is from Sep 25 2025 scrape. Need to surface it dynamically or note that live leaderboard is at /benchmark/LLMPriceIsRight/leaderboard -->

### Key Findings
- Elo ratings vary significantly between models, reflecting different skill levels
- Strategic behavior emerges in top models that balance accuracy with overbid avoidance
- Price knowledge correlates with model size and training quality
- Winning requires both accurate estimation and strategic risk management

### Business Applications
1. **Market Entry Research** — When expanding into new geographic regions or product categories, businesses need accurate price estimation capabilities.
2. **Price Elasticity Research** — AI models that understand pricing can analyze how pricing changes affect demand signals and consumer behavior.
3. **Economic Indicator Development** — Consumer price data serves as a leading indicator for broader economic trends and market conditions.
4. **Regulatory Compliance** — Accurate price estimation helps businesses maintain compliance with price discrimination and antitrust regulations.

### Caveats
- Game mechanics introduce constraints beyond basic price estimation tasks
- Static pricing doesn't capture market dynamics or regional variations
- Elo ratings can vary when tournaments use few showcases due to random pairings

### Submit a Model
**URL:** `/benchmark/LLMPriceIsRight/add-model`

Form fields:
- Model Name (required)
- API Endpoint URL (required)
- API Key (required) — "Your API key will be encrypted and used only for benchmark testing"
- Description (optional)

Review process:
1. Initial Validation: Test endpoint with sample requests
2. Benchmark Testing: Model competes in 50 showcase rounds
3. Results & Publication: Added to public leaderboard if meets quality standards

---

## Benchmark 2: PyMC-Marketing vs. Google Meridian

### Metadata
- **Part 1 URL:** https://www.pymc-labs.com/blog-posts/pymc-marketing-vs-google-meridian
- **Part 2 URL:** https://www.pymc-labs.com/blog-posts/pymc-marketing-vs-meridian-baseline-modeling-mmm
- **Part 1 date:** September 2025
- **Part 2 date:** December 18, 2025
- **Part 1 authors:** Jake, Teemu Säilynoja, Luca Fiaschi
- **Part 2 authors:** Teemu Säilynoja, Luca Fiaschi (confirmed from blog-template aspect)
- **Traffic:** Part 1 = ~2,498 sessions (top-10 blog post)

### What It Is
A rigorous, reproducible quantitative comparison of PyMC-Marketing vs. Google's Meridian MMM library. The most comprehensive apples-to-apples comparison published, using real-world synthetic datasets spanning single-market startups to global enterprises like Nike and Colgate.

### Headline Results
- PyMC-Marketing is **2x–20x faster** than Meridian
- PyMC-Marketing is **more accurate** and **more scalable**
- Luca's conclusion: *"There is no scenario in which I would recommend Meridian"* — Luca Fiaschi, 2025

### Halah's LinkedIn announcement copy (2025-09-22):
> "Last week, 𝐰𝐞 𝐩𝐮𝐛𝐥𝐢𝐬𝐡𝐞𝐝 𝐭𝐡𝐞 𝐦𝐨𝐬𝐭 𝐜𝐨𝐦𝐩𝐫𝐞𝐡𝐞𝐧𝐬𝐢𝐯𝐞 𝐏𝐲𝐌𝐂-𝐌𝐚𝐫𝐤𝐞𝐭𝐢𝐧𝐠 𝐯𝐬. 𝐌𝐞𝐫𝐢𝐝𝐢𝐚𝐧 benchmark ever conducted — with reproducible code, real-world sims, and clear winners on speed, accuracy, and scale."

Teemu's social copy (2025-09-11):
> "We just dropped the most rigorous quantitative comparison of PyMC-Marketing vs. Meridian you have seen! With reproducible code, real-world sims, and clear winners on speed, accuracy, and scale."

### Webinar (September 18, 2025)
Title: "PyMC-Marketing vs. Google Meridian: A Scientific Benchmark for Marketing Mix Models"

Description:
> "Many teams building Marketing Mix Models (MMMs) today must decide between open source tools, and two of the top contenders are PyMC-Marketing and Google's Meridian. In this webinar, the PyMC Labs team will share the results of a rigorous, apples-to-apples benchmark between the two: default priors, model structures, and synthetic datasets that simulate everything from startups to global enterprises."

Attendees learned:
- How the two libraries compare in speed, accuracy, and scalability
- When each library is appropriate for a given use case
- Practical guidance for teams already building MMMs

### Part 2: Baseline Modeling (December 2025)
Featured post excerpt:
> "PyMC-Marketing still leads where MMM matters most: reliable attribution. We reran our benchmark against the latest Google Meridian update to see what changed and what didn't."

Luca's intro quote:
> "Most MMM conversations focus on channels, curves, and budget shifts. But the part that often decides the entire story sits quietly in the background: the baseline."

### Mutinex Controversy (December 2025)
A competing benchmarker (Mutinex) published a benchmark claiming PyMC-Marketing "performs worst." PyMC Labs contacted Mutinex CEO and established that the benchmark:
- Used default priors on an older version of pymc-marketing
- Was subsequently **unpublished** by Mutinex

> "Interesting these guys now claiming our library perform the worst but they unpublished their open source benchmark." — Luca Fiaschi, December 2025

> "He has clarified that in the presentation he had specified that PyMC Marketing was run using default priors (and probably in an older version)." — Luca Fiaschi, December 2025

---

## Benchmark 3: PyMC vs. Stan Sampling Speed

### Metadata
- **URL:** https://www.pymc-labs.com/blog-posts/pymc-stan-benchmark
- **Theme:** Tutorial / Performance
- **Traffic:** ~2,300 sessions (top-10 blog post, #6)

### What It Tests
How much faster JAX and GPU sampling are with PyMC compared to Stan for large-scale Bayesian inference.

<!-- GAP: Need to fetch and extract the full content of this post to get specific benchmark numbers, methodology, and conclusions -->

---

## Benchmark 4: PyMC Skills / AI Agent Reliability

### Metadata
- **LinkedIn post:** Feb 26, 2026
- **Authors:** Christopher Fonnesbeck (benchmark lead), Halah Joseph (announcement)
- **Related product:** Decision Hub (PyMC modeling skill)

### What It Tests
Whether domain-specific expertise (a PyMC "skill" encoding best practices) can improve an AI coding agent's reliability for Bayesian modeling tasks.

### Results
- Baseline (no skill): **60% pass rate**
- With PyMC skill: **93% pass rate**
- Convergence improved on technically challenging models
- Best practices (coords/dims, nutpie) applied far more consistently

Halah's LinkedIn post (2026-02-26):
> "We Taught Claude Bayesian Best Practices. Pass Rates Jumped From 60% to 93%.
>
> In our latest benchmark led by Christopher Fonnesbeck, we compared an AI coding agent operating with base knowledge against the same agent augmented with a PyMC-specific modeling skill.
>
> The difference was significant."

Daimon paraphrase (2026-02-26):
> "We gave Claude a 15-page cheat sheet on Bayesian modeling. Pass rates jumped from 60% to 93%."

<!-- GAP: Full benchmark methodology, task set, and detailed results not yet extracted — needs full post fetch or Discord thread -->

---

## Benchmark 5: Synthetic Consumers Alignment Study

### Metadata
- **Related blog:** https://www.pymc-labs.com/blog-posts/how-realistic-are-synthetic-consumers
- **Authors:** Allen Downey, (others TBC)
- **Study:** GSS (General Social Survey) evaluation

### What It Tests
Whether LLM-simulated survey respondents ("synthetic consumers") accurately replicate human survey responses on political and lifestyle questions.

### Key Stats (from live site and Discord)
- **90% alignment** with human survey data (synthetic vs. real responses)
- **85% distributional similarity** across demographic groups
- **<24-hour** cycle from brief to synthetic results (vs. weeks for traditional surveys)
- **9,000 responses** generated for Colgate-Palmolive synthetic shelf-test

Methodology: Semantic Similarity Rating (SSR) algorithm — see GitHub: `pymc-labs/semantic-similarity-rating` (130★)

Associated paper: Maier et al. 2025 (Benjamin F. Maier lead author) — SSR paper

<!-- GAP: Exact blog post content for how-realistic-are-synthetic-consumers not yet fully extracted — partial content from crawl-remaining.md -->

---

## Section: About Our Benchmarks

### Philosophy
PyMC Labs' approach to benchmarking (from marketing copy and Discord):
- Reproducible: code always published on GitHub
- Apples-to-apples: same datasets, same conditions
- Transparent about limitations and caveats
- Open for community submission (LLM Price Is Right allows model submissions)

Juan Orduz on benchmarking strategy (Feb 2026):
> "So if we are ever asked 'how do we compare?' We could kind of answer 'well, that is irrelevant because we can easily build a similar model with our PyMC-Marketing stack, see here'." — Juan Orduz, #competition channel, Feb 2026

---

## CTA Section

<!-- GAP: Need specific CTA for benchmarks page — candidates: -->
- Submit your model to the LLM Price Is Right leaderboard
- Read the full MMM benchmark report
- Talk to our team about benchmarking your current toolstack
- Download the reproducible benchmark code

---

## Related Content / Cross-References

- `content/resources/open-source-libraries.md` — PyMC-Marketing, CausalPy, PyMC
- `content/solutions/decision-ai.md` — Decision Hub (PyMC skill distribution)
- `content/industries/marketing-media.md` — Meridian benchmark in competitive context
- `content/blog/template.md` — benchmark blog posts follow research highlight format

---

## GAPS Summary

<!-- GAP: PyMC vs Stan benchmark post content not extracted — need full fetch of /blog-posts/pymc-stan-benchmark -->
<!-- GAP: PyMC Skills benchmark full methodology/task set not documented — partial from LinkedIn post only -->
<!-- GAP: Synthetic consumers study full content from /how-realistic-are-synthetic-consumers not fully extracted -->
<!-- GAP: No hero/intro copy written for benchmarks overview page (new page, no existing copy) -->
<!-- GAP: Live leaderboard is JS-rendered — table above reflects Sep 25 2025 snapshot, needs dynamic update strategy -->
<!-- GAP: No industry-specific benchmarks documented (e.g., MMM accuracy across industries, CLV model accuracy) -->
<!-- GAP: Maier et al. 2025 SSR paper citation/DOI not captured -->
