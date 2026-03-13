# Resources — Website Scrape Analysis
**Source:** https://www.pymc-labs.com/benchmark/LLMPriceIsRight + /leaderboard + /add-model + /blog-posts/price-benchmark
**Date:** 2026-03-13
**Aspect:** website-resources

---

## Key Finding: No Dedicated /resources Page

There is NO `/resources/` page on pymc-labs.com (returns 404). The nav link labeled "Resources" points to the **LLM Price Is Right benchmark** at `/benchmark/LLMPriceIsRight`. The new sitemap's "Resources" section (Industry Benchmarks + Open Source Libraries) will need to pull from:
1. The LLM Price Is Right benchmark (the only current benchmark on the site)
2. The 3 OSS projects mentioned on the home page (PyMC Marketing, CausalPy, PyMC)

Sitemap URLs in `/benchmark/` tree:
- `/benchmark/LLMPriceIsRight` — main benchmark page
- `/benchmark/LLMPriceIsRight/leaderboard` — live leaderboard (JS-rendered charts)
- `/benchmark/LLMPriceIsRight/add-model` — model submission form

---

## LLM Price Is Right Benchmark

### Page Title
"LLM Price Estimation Benchmark | Test Real-World Pricing, Strategy & Business Insights"

### Meta Description
"We test whether LLMs can estimate consumer product prices and reason strategically in a Price-is-Right style game, with results, metrics, and a full public leaderboard."

### What This Benchmark Is
PyMC Labs created a novel evaluation framework inspired by the "Showcase game in 'The Price is Right' TV show." The benchmark assesses whether language models can accurately estimate consumer product costs and make strategic bidding decisions under specific constraints.

**GitHub repo:** https://github.com/pymc-labs/PriceIsRightLLM/tree/main
**Blog post:** https://www.pymc-labs.com/blog-posts/price-benchmark
**Latest update:** September 25, 2025
**Blog post date:** September 17, 2025
**Blog post authors:** Maxim Laletin, Allen Downey

### What It Tests
- **Price Knowledge**: Can models accurately estimate the cost of everyday consumer products?
- **Strategy**: Can models bid strategically to avoid disqualification while maximizing accuracy?

### How the Game Works
- Two LLMs compete as contestants viewing the same showcase
- Each model bids on the price of an everyday item (toothpaste, snacks, cleaners, etc.)
- The closest bid **without going over** wins the round
- If both models overbid, neither wins
- Showcases typically total around $20 in value

### Example Products From the Dataset
- Kraft Cool Whip — 8oz dessert topping — $2.29
- Mezzetta Roasted Peppers — 16oz jar — $3.99
- Minute Maid Orange Juice — 1 gal container — $7.49

### Why This Benchmark Matters for Business
1. **Market Entry Research** — When expanding into new geographic regions or product categories, businesses need accurate price estimation capabilities.
2. **Price Elasticity Research** — AI models that understand pricing can analyze how pricing changes affect demand signals and consumer behavior.
3. **Economic Indicator Development** — Consumer price data serves as a leading indicator for broader economic trends and market conditions.
4. **Regulatory Compliance** — Accurate price estimation helps businesses maintain compliance with price discrimination and antitrust regulations.

### Evaluation Metrics
1. **Elo Rating** — Chess-inspired rating system where models gain points for wins and lose points for losses. Higher ratings indicate better overall performance.
2. **MAPE (Mean Absolute Percentage Error)** — Average percentage difference between bid and actual price (ignoring overbids).
3. **Overbid Rate** — Percentage of bids that exceeded the actual price (automatic disqualification).

### Data & Methodology
- **Dataset:** 820 real grocery items sourced from The Price is Right television program. West-coast manufacturer suggested retail prices. Static pricing in v1, planned updates.
- **Data source URL:** https://priceisright.fandom.com/wiki/Grocery_prices
- **Challenge sequence:** Every model undergoes 50–100 showcases. Each round: (1) send prompt with rules + output instructions, (2) provide 10 reference price examples from similar products, (3) parse bids and rationales with strict formatting, (4) compare to actual retail price, calculate APE, determine overbid.
- **Tournament structure:** Each model competes with every other model; Elo rating computed to rank models.
- **Output format required (JSON):**
  ```json
  {"bid": 1234.56, "rationale": "Brief explanation of how you estimated the value."}
  ```
- **API requirement:** OpenAI-compatible endpoint

### Key Findings (from page)
- Elo ratings vary significantly between models, reflecting different skill levels in the game
- Strategic behavior emerges in top models that balance accuracy with overbid avoidance
- Price knowledge correlates with model size and training quality
- Winning requires both accurate estimation and strategic risk management
- *"While the benchmark task description is very simple and easily understandable, it demonstrates a possibility to probe serious AI skills: using background knowledge and context to make constrained real-world decisions. By turning a game into a benchmark, we get a structured, repeatable way to measure models' real-world sensibility."*

### Caveats
- Game mechanics introduce constraints beyond basic price estimation tasks
- Dataset limitations exist with static pricing that doesn't capture market dynamics or regional variations
- Elo ratings can vary when tournaments use few Showcases due to random pairings

---

## Top Performing Models (as of September 25, 2025)

### Best Elo Rating
| Rank | Model | Elo |
|------|-------|-----|
| #1 | qwen3-30b-a3b | 1239 |
| #2 | gpt-5 | 1207 |
| #3 | gpt-4o | 1178 |
| #4 | grok-4 | 1170 |
| #5 | o3 | 1129 |

### Lowest MAPE (best accuracy)
| Rank | Model | MAPE |
|------|-------|------|
| #1 | o3 | 13.78% |
| #2 | o1 | 14.49% |
| #3 | gpt-5 | 17.06% |
| #4 | grok-4 | 19.47% |
| #5 | qwen3-30b-a3b | 22.84% |

### Lowest Overbid Rate
| Rank | Model | Overbid Rate |
|------|-------|-------------|
| #1 | qwen3-30b-a3b | 18.37% |
| #2 | gpt-3.5-turbo | 20% |
| #3 | gpt-4o | 28% |
| #4 | gpt-4o-2024-08-06 | 40% |
| #5 | gpt-5-mini | 40.82% |

---

## Model Submission Process

**URL:** `/benchmark/LLMPriceIsRight/add-model`

**Form fields:**
- Model Name (required)
- API Endpoint URL (required)
- API Key (required) — "Your API key will be encrypted and used only for benchmark testing"
- Description (optional)

**Review process:**
1. Initial Validation: Test endpoint with sample requests to ensure compatibility
2. Benchmark Testing: Model will compete in 50 showcase rounds
3. Results & Publication: Add to public leaderboard if it meets quality standards

**Requirements:** Valid JSON responses in specified format; approximately 50–100 test requests for full benchmark; API keys encrypted and never shared publicly.

---

## Open Source Libraries (from Home Page)

These are the 3 OSS projects highlighted on pymc-labs.com. No dedicated OSS page exists — they appear in the home page section.

### PyMC Marketing
- **Description:** "The premier open-source solution for Bayesian AI Media Mix Modeling and marketing analytics."
- **GitHub:** https://github.com/pymc-labs/pymc-marketing
- **Discord channel:** #pymc-marketing (CRITICAL priority)
- **Use cases:** MMM, attribution, customer lifetime value

### CausalPy
- **Description:** "A powerful Python package enabling Bayesian AI causal inference in quasi-experimental settings."
- **GitHub:** https://github.com/pymc-labs/CausalPy
- **Discord channel:** #causalpy
- **Use cases:** A/B testing alternatives, regression discontinuity, difference-in-differences

### PyMC
- **Description:** "A cutting-edge probabilistic programming framework in Python, purpose-built for Bayesian AI."
- **GitHub:** https://github.com/pymc-devs/pymc
- **Discord channel:** #pymc-ecosystem
- **Note:** PyMC Labs was founded by creators of PyMC — this is the core differentiator.

---

## Notes for Content Assembly

- `content/resources/industry-benchmarks.md` should prominently feature the LLM Price Is Right benchmark as the key public benchmark PyMC Labs has created. Gap: no industry-specific benchmarks (MMM accuracy, etc.) found yet.
- `content/resources/open-source-libraries.md` should cover PyMC Marketing, CausalPy, and PyMC. Richer content on each will come from Discord channels (#pymc-marketing, #causalpy, #pymc-ecosystem).
- The Resources nav item currently links ONLY to the benchmark — no separate OSS libraries page exists on current site.
- <!-- GAP: Need descriptions of PyMC Marketing features, CausalPy features, PyMC features — pull from Discord Wave 2 -->
- <!-- GAP: Need any other benchmarks beyond LLM Price Is Right -->
- <!-- GAP: No separate "Industry Benchmarks" page exists yet — new sitemap item will need significant content creation -->
