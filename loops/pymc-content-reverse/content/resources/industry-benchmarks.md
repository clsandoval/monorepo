---
page: resources/industry-benchmarks
title: Industry Benchmarks
status: complete
sources:
  - analysis/website-scrape/resources.md
  - analysis/website-scrape/blog-index.md
  - analysis/discord-marketing-extraction.md
  - analysis/discord-competition-extraction.md
  - https://www.pymc-labs.com/benchmark/LLMPriceIsRight
  - https://www.pymc-labs.com/blog-posts/price-benchmark
  - https://www.pymc-labs.com/blog-posts/can-llms-play
  - https://www.pymc-labs.com/blog-posts/pymc-marketing-vs-google-meridian
  - https://www.pymc-labs.com/blog-posts/pymc-marketing-vs-meridian-baseline-modeling-mmm
  - https://www.pymc-labs.com/blog-posts/pymc-stan-benchmark
  - https://www.pymc-labs.com/blog-posts/how-realistic-are-synthetic-consumers
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

Candidate framing (from blog/marketing copy):
- "We don't just build models — we measure them."
- "Reproducible benchmarks that tell you what actually works."
- "Most comparisons online are high-level or use simplistic examples, leaving teams to rely on brand familiarity or anecdotal advice." — Halah Joseph, 2025-09-10

Hero copy candidates (synthesized from benchmark blog posts):
- "At PyMC Labs, we believe claims should be backed by data. Every benchmark we publish includes reproducible code, real-world datasets, and transparent methodology. Here's what the numbers actually show."
- "We publish the benchmarks we wish existed. Open source, reproducible, and designed for teams making real decisions."

Benchmarks overview text (from benchmark blog language):
> "Both promise state-of-the-art Bayesian inference, handle multi-geo hierarchical models, and come from credible teams. Yet, reliable, direct comparisons are non-existent." — PyMC Labs (on motivation for Meridian benchmark)

Navigation note: The current site's "Resources" nav points to `/benchmark/LLMPriceIsRight`. The new sitemap collects all benchmarks under a single "Industry Benchmarks" hub page.

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

### Leaderboard (as of September 25, 2025 snapshot — live at /benchmark/LLMPriceIsRight/leaderboard)

The leaderboard is JS-rendered and updates dynamically. The tables below reflect the September 25, 2025 snapshot. The website must either embed the live leaderboard component or link prominently to `/benchmark/LLMPriceIsRight/leaderboard` for current standings.

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

### Full Tournament Results (from February 2026 blog post — 90 models)

The "Can LLMs Play The Price Is Right?" blog post (Feb 25, 2026) expanded the benchmark to 90 models:

**Tournament structure:**
- 90 LLMs competed; 2 preliminary rounds eliminated lowest-MAPE performers
- Finals: Top 50 models, 50 random showcases each, paired against different competitors
- Each round: 10 reference prices provided from similar products

**Key headline stats:**
- OpenAI o3: **13.5% MAPE** (beats average human contestant ~18%)
- o3 bid correlation with actual prices: **r = 0.89**
- Llama4-scout: worst performer at **53.1% MAPE**; near-zero correlation
- Most conservative model: **2% overbid rate**
- Most aggressive model: **72% overbid rate**
- Human contestants overbid ~25% of the time
- OpenAI models occupied **top 14 Elo spots** and 16 of top 20
- Of 42 OpenAI models: 31 (74%) passed preliminary rounds
- Top-rated model beats lowest-rated ~90% of the time (Elo estimate)
- o3 ranked #21 on Elo (despite best MAPE) due to high overbid rate (42%)

**Key insight:** "Winning requires both accuracy and strategy. Models that overbid too often, even with precise price estimates, rank lower on the Elo leaderboard."

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

**GitHub:** Open-sourced benchmark code with standalone data-generation module for full reproducibility.

### Headline Results
- PyMC-Marketing is **2x–20x faster** than Meridian
- PyMC-Marketing is **more accurate** and **more scalable**
- Only PyMC-Marketing successfully handled enterprise-scale data (Meridian failed to converge)
- Luca's conclusion: *"There is no scenario in which I would recommend Meridian"* — Luca Fiaschi, 2025

### Part 1 Methodology (September 8, 2025)

**Authors:** Teemu Säilynoja, Luca Fiaschi, Jake Piekarski
**Versions tested:** PyMC-Marketing 0.15.1, Meridian 1.1.6
**Hardware:** n1-standard-32 Google Compute Engine machine (CPU; GPU benchmarks pending)
**MCMC config:** 4 chains, 2,000 draws, 0.9 acceptance probability

**Dataset scales tested:**

| Scale | Timespan | Markets | Channels | Controls | Size | Example |
|-------|----------|---------|----------|----------|------|---------|
| Startup | 2 yrs | 1 | 4 | 2 | 104×8 | Early D2C brands |
| Growth | 2 yrs | 2 | 6 | 2 | 262×11 | Multi-market D2C |
| Mature | 3 yrs | 8 | 8 | 4 | 1,248×15 | Multi-region digital brands |
| Enterprise | 4 yrs | 50 | 30 | 8 | 10,400×43 | Global CPG (Nike/Colgate scale) |

**Architectural differences:**
- PyMC-Marketing: flexible samplers (NumPyro, BlackJAX, Nutpie), Fourier transformations for seasonality, 36 params (startup) / 1,931 (enterprise)
- Meridian: fixed TensorFlow Probability backend, splines for baseline, 29 params (startup) / 2,229 (enterprise)

### Part 1 Quantitative Results

**Sampling Efficiency (ESS/s — higher is better):**

| Sampler | Startup | Growth | Mature | Enterprise |
|---------|---------|--------|--------|------------|
| PyMC (NumPyro) | 110.00 | 4.38 | Failed | Failed |
| PyMC (BlackJAX) | 83.19 | 5.42 | Failed | Failed |
| PyMC (Default) | 25.04 | 4.48 | 5.30 | 0.10 |
| PyMC (Nutpie) | 22.97 | 5.86 | 17.44 | 0.19 |
| Meridian (TFP) | 5.66 | 2.18 | 3.58 | **Failed** |

**In-Sample Accuracy (R²):**

| Scale | PyMC-Marketing | Meridian |
|-------|---------------|---------|
| Startup | 0.87 ± 0.02 | 0.73 ± 0.02 |
| Growth | 0.88 ± 0.02 | 0.89 ± 0.01 |
| Mature | 0.95 ± 0.01 | 0.74 ± 0.01 |
| Enterprise | 0.99 ± 0.01 | N/A (failed) |

**In-Sample MAPE (lower is better):**

| Scale | PyMC-Marketing | Meridian |
|-------|---------------|---------|
| Startup | 7.2 ± 0.6% | 10.4 ± 0.5% |
| Growth | 6.8 ± 0.6% | 6.6 ± 0.3% |
| Mature | 5.0 ± 0.3% | 12.3 ± 0.4% |
| Enterprise | 2.6 ± 0.2% | N/A (failed) |

**Durbin-Watson (residual autocorrelation, optimal ~2.0):**
- PyMC: 1.71–1.96 (near-optimal across all scales)
- Meridian: 0.40–1.13 (systematic autocorrelation — model misses important data patterns)

**Channel Contribution Recovery (Scaled RMSE — lower is better):**

| Scale | PyMC-Marketing | Meridian |
|-------|---------------|---------|
| Startup | 0.41 ± 0.22 | 0.70 ± 0.39 |
| Growth | 0.44 ± 0.41 | 0.70 ± 0.64 |
| Mature | 0.15 ± 0.08 | 0.59 ± 0.40 |

**Key bias finding:** Meridian positive bias at mature scale = –2390 ± 11231 (vs PyMC slight negative bias).

**Storage Note:** PyMC-Marketing stores more MB (includes original data for reproducibility) but uses *less* memory during fitting (900MB–2.5GB vs Meridian's 5GB minimum).

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

### Part 2: Baseline Modeling (December 18, 2025)

**Authors:** Teemu Säilynoja, Luca Fiaschi
**Versions:** PyMC-Marketing v0.17.0 vs Meridian v1.2.1
**Updated:** January 8, 2026

Featured post excerpt:
> "PyMC-Marketing still leads where MMM matters most: reliable attribution. We reran our benchmark against the latest Google Meridian update to see what changed and what didn't."

Luca's intro quote:
> "Most MMM conversations focus on channels, curves, and budget shifts. But the part that often decides the entire story sits quietly in the background: the baseline."

**What changed in Meridian v1.2.1:** Automated Knot Selection for spline baseline — enables baseline to track sales fluctuations more closely.

**Methodology change:** Both libraries shifted to neutral priors (vs spend-share informed). "In synthetic datasets, historical spend does not reflect true effectiveness." — isolates ability to recover effects from data alone.

**Part 2 Sampling Efficiency (ESS/s):**

| Dataset Size | PyMC Best | Meridian TFP |
|---|---|---|
| Small | 28.82 | 2.28 |
| Growing | 1.74 | 0.99 |
| Medium | 1.71 | 1.10 |

**Part 2 In-Sample Fit:** Meridian's Automated Knot Selection delivered real gains:
- Small business R²: Meridian 0.930 vs PyMC 0.871
- MAPE decreased significantly for Meridian

**Critical Trade-off:** Despite better predictive R², Meridian's Durbin-Watson = 1.42–1.89 (vs PyMC 1.85–1.97) — spline baseline absorbs short-term variation rather than explicitly modeling seasonality, degrading causal separation.

**Attribution accuracy (Part 2 — PyMC still wins):**
- Bias (Small): PyMC 82±207 vs Meridian 219±259
- SRMSE (Growing): PyMC 0.42±0.34 vs Meridian 0.54±0.49
- CRPS (Small): PyMC 145±171 vs Meridian 229±311

**Core insight:**
> "A flexible spline baseline can improve in-sample accuracy while degrading causal separation." — Säilynoja & Fiaschi, December 2025

**PyMC recommendation:** "PyMC-Marketing's explicit Fourier-based seasonality remains the more robust choice" for practitioners prioritizing robust attribution.

**Identifiability challenge (both libraries):** Early-saturating channels become "confounded with the intercept" — recovery requires spend variation within non-saturated regions.

### Mutinex Controversy (December 2025)
A competing benchmarker (Mutinex) published a benchmark claiming PyMC-Marketing "performs worst." PyMC Labs contacted Mutinex CEO and established that the benchmark:
- Used default priors on an older version of pymc-marketing
- Was subsequently **unpublished** by Mutinex

> "Interesting these guys now claiming our library perform the worst but they unpublished their open source benchmark." — Luca Fiaschi, December 2025

> "He has clarified that in the presentation he had specified that PyMC Marketing was run using default priors (and probably in an older version)." — Luca Fiaschi, December 2025

---

## Benchmark 3: PyMC vs. Stan Sampling Speed (MCMC at Scale)

### Metadata
- **URL:** https://www.pymc-labs.com/blog-posts/pymc-stan-benchmark
- **Full title:** "MCMC at Scale: How JAX and GPUs Make Bayesian Inference Fast"
- **Alt title:** "MCMC for Big Datasets: How Much Faster Is JAX and GPU Sampling with PyMC?"
- **Author:** Martin Ingram
- **Published:** December 22, 2021 (Updated: February 18, 2026)
- **Theme:** Tutorial / Performance
- **Traffic:** ~2,300 sessions (top-10 blog post, #6)
- **Code repo:** https://github.com/martiningram/mcmc_runtime_comparison

### What It Tests
How much faster JAX and GPU sampling are with PyMC compared to Stan for large-scale Bayesian inference. Uses professional tennis match data as a realistic hierarchical model benchmark.

### Methodology

**Dataset:** 160,420 professional tennis matches (Open Era, 1968–present)
**Model:** Bradley-Terry pairwise comparison model with hierarchical structure
- Player skill: θᵢ ~ N(0, σ²), σ ~ HalfNormal(1)
- Non-centered parameterization for better sampler geometry

**Hardware:** Razer Blade Advanced 15 (2019) — Intel i7-9750H CPU + NVIDIA RTX 2070 GPU, 16GB RAM, Ubuntu

**Sampling config:** 1,000 warm-up steps, 1,000 samples, 4 parallel chains

**Variable dataset sizes:** Start year varied from 2020 back to 1968 (increasing match count)

**Methods compared:**

| Method | Backend |
|--------|---------|
| pymc (standard) | CPU |
| pymc_jax_cpu_parallel | CPU (NumPyro NUTS) |
| pymc_jax_gpu_parallel | GPU (sequential chains) |
| pymc_jax_gpu_vectorized | GPU (parallel chains) |
| cmdstanpy (Stan) | CPU |

### Key Results (Full 160,420 matches)

**Wall time comparison:**
- pymc_jax_gpu_vectorized: **2.7 minutes**
- pymc_jax_gpu_parallel: ~4.5 minutes
- pymc_jax_cpu_parallel: ~7.5 minutes
- pymc (standard): ~12 minutes
- cmdstanpy (Stan): ~**20 minutes**

**ESS/second improvement:**
- Vectorized GPU vs PyMC standard: **~11× improvement**
- JAX on CPU vs PyMC standard: **~2.9× improvement**
- Stan and PyMC standard: comparable

**GPU crossover point:** GPU outperforms CPU only above ~50,000 observations. Below that, GPU overhead makes CPU methods faster.

**Accuracy validation:** All methods produced effectively identical posteriors — GPU is not trading accuracy for speed.

### Key Quotes
> "Moving from a 20-minute to a 2.7-minute iteration cycle fundamentally changes how quickly a modeller can diagnose and refine a model."

> "Wall time alone is misleading. A sampler that runs faster but produces lower-quality samples delivers less value. Effective sample size per second (ESS/second) is the correct metric."

> "MCMC handles much larger datasets than its reputation suggests."

### Top Tennis Player Rankings (Posterior Skill Estimates — benchmark byproduct)

| Rank | Player | Skill Mean |
|------|--------|-----------|
| 1 | Novak Djokovic | 3.54 |
| 2 | Rafael Nadal | 3.43 |
| 3 | Roger Federer | 3.31 |
| 4 | Bjorn Borg | 3.25 |
| 5 | Ivan Lendl | 3.23 |

### Future Directions (from post)
- Single-precision GPU: RTX 2070 theoretical 32× speedup (7.465 TFLOPS vs 233 GFLOPS double precision) — pending stability validation
- BlackJAX identified as promising next comparison point
- Stan OpenCL GPU backend not yet tested against PyMC/JAX GPU

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

Note: Full methodology/task set not yet publicly available via blog post — announcement via LinkedIn only. Additional Discord threads or a blog post may contain further detail. The "PyMC modeling skill" is distributed via Decision Hub — see `content/solutions/decision-ai.md`.

**Related product context:** The skill encodes PyMC best practices (coords/dims, nutpie sampler, non-centered parameterization) in a 15-page structured format fed to the AI agent as context.

---

## Benchmark 5: Synthetic Consumers Alignment Study

### Metadata
- **Blog URL:** https://www.pymc-labs.com/blog-posts/how-realistic-are-synthetic-consumers
- **Full title:** "Can LLMs Replace Human Survey Respondents? Evaluating Synthetic Consumers on Political and Lifestyle Questions"
- **Author:** Allen Downey
- **Published:** June 3, 2025 (Updated: February 18, 2026)
- **Models tested:** GPT-4o, GPT-o3-mini, Claude 3.7 Sonnet, DeepSeek R1 Distill, Gemini 2.0 Flash (larger); GPT-4o mini, Claude 3 Opus, Mixtral 8x7b, Meta Llama 3 8b Instruct (smaller)

### What It Tests
Whether LLM-simulated survey respondents ("synthetic consumers") accurately replicate human survey responses on political and lifestyle questions from the GSS (General Social Survey).

**Evaluation metric:** Mean Absolute Error (MAE) across 100 randomly selected test respondents

**Comparison baselines:**
- Naive classifier (always predicts median response)
- Random forest trained on GSS data (3,000 respondents for party ID; 2,000 for TV hours)

**Tasks:**
1. Political Party Identification (7-point scale: Strong Democrat → Strong Republican)
2. Daily Television Hours (5 categories: 1 or fewer → 6+ hours)

### Key Findings

**Political Party ID:**
- Most large LLMs: comparable to supervised random forest
- GPT-o3-mini and Gemini 2.0 Flash: occasionally outperformed random forest
- DeepSeek R1 Distill: consistently underperformed, sometimes below naive baseline
- Smaller models: competitive; Claude performed well overall
- GPT-4o mini and Llama 3 8b: less consistent

**Television Viewing:**
- Performance "more variable than on party identification"
- Most models landed within baseline-to-random-forest range
- No consistent best performer across both tasks
- Mixtral performed particularly poorly
- Rankings shifted meaningfully between tasks

**Control experiment (demographic info removed):**
Performance "collapse consistently below the naive baseline across all models" — confirming LLMs encode statistically valid demographic-behavior relationships, not just pattern-matching.

### Key Stats (from live site and Discord context)
- **90% alignment** with human survey data (synthetic vs. real responses) — from marketing copy
- **85% distributional similarity** across demographic groups — from marketing copy
- **<24-hour** cycle from brief to synthetic results (vs. weeks for traditional surveys)
- **9,000 responses** generated for Colgate-Palmolive synthetic shelf-test

Methodology: Semantic Similarity Rating (SSR) algorithm — GitHub: `pymc-labs/semantic-similarity-rating` (130★)
Associated paper: Maier et al. 2025 (Benjamin F. Maier lead author) — SSR paper

### Conclusions
> "Synthetic consumers based on LLMs have a lot of potential." — Allen Downey, June 2025

- Some LLMs match ML algorithms trained on large datasets for task performance
- "Some LLMs can perform worse than a naive baseline" — requires model selection care
- Task predictability matters: less demographically predictable behaviors → weaker results
- Demographic grounding is essential: removing it destroys performance
- **Future:** Ensemble methods, open-ended response testing, client-specific panels

### Practical Applications for Marketing
- Faster, lower-cost alternative to human survey panels
- Immediate deployment without additional data collection
- Reliability depends on task characteristics — requires model selection or ensemble approaches

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

<!-- GAP: PyMC Skills (Benchmark 4) — full benchmark methodology, test suite, and detailed results not publicly available; only LinkedIn announcement. A blog post may be forthcoming. -->
<!-- GAP: Live leaderboard is JS-rendered — tables above reflect Sep 25 2025 snapshot + Feb 2026 blog data. The website should embed or link to /benchmark/LLMPriceIsRight/leaderboard for live standings. -->
<!-- GAP: No industry-specific benchmarks documented (e.g., MMM accuracy across industries, CLV model accuracy, pharma/finance specific) — these may not exist yet -->
<!-- GAP: Maier et al. 2025 SSR paper citation/DOI not captured — no public DOI found -->
<!-- GAP: CTA copy not finalized — see CTA Section above for candidates -->
