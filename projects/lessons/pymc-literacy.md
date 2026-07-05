---
type: lesson
topic: PyMC Labs Discord literacy
started: 2026-07-05
goal: MASTERY of the PyMC Labs stack, reached literacy-first. Phase 1 = follow the technical
  channels (recognize the vocab/concepts). Phase 2 = actually build it (specify, sample, diagnose,
  ship the models the experts do). Climb literacy across the whole tree, then a mastery pass per rung.
phase: 1-literacy
level: Strong structural intuition (prior, hierarchy, generative thinking — has ML/stats reflexes);
  blank on operational vocab — diagnostics (r-hat/divergences), sampler mechanics, MMM jargon.
hours_estimate: 350   # Phase 1 literacy ~40h + Phase 2 mastery ~300h (hands-on modeling across the tree)
hours_done: 0.3
next_up: Rung 4+5 — Sampling & diagnostics ("why won't it sample / is it broken"): MCMC/NUTS,
  chains & draws, nutpie, then r-hat, divergences, ESS, ArviZ. Biggest blank from the diagnostic.
  Quick spot-check Rung 3 (hierarchical) first — intuition already there, just attach terms.
---

# PyMC Labs Discord literacy

North star: open the technical channels and the chat stops being gibberish. Target = **literacy**
(recognize the term, know roughly what it means and why it matters), NOT the ability to implement it.

The community's center of gravity (by message volume): **hierarchical Bayesian modeling, MMM/marketing
science, sampler & compiler internals, and diagnostics.** Rungs 1–4 below are what everyone here has
internalized; 5–7 are the working core of most projects; 8–12 are where specialists pull away.

## Learner context (who Carlos is at Labs — from Discord archive)

AI engineer at PyMC Labs (since Oct 2025, UTC+8/Philippines). **Owns Daimon** — the company's
agentic-teammate platform — end to end: architecture, Fly.io infra, MCP tools, memory/ingestion,
the EAP client-support + Insighta agents, and the public open-source launch he's presenting.
Reports into Luca; the whole org routes Daimon questions to him.

- **Strong:** agentic/LLM systems architecture, infra glue, product/GTM judgment. Builds fast by
  orchestrating agents (incl. Daimon itself), not hand-coding everything.
- **Not his lane (yet):** deep Bayesian stats — that's Thomas/Ricardo/Juan/Chris/Christian. His own
  early questions were MMM mechanics ("how do I choose alpha?", "set backend to JAX?").
- **Why this course exists:** he builds the tooling *around* the modeling and wants to actually
  follow (Phase 1) then do (Phase 2) the Bayesian work the rest of the room lives in.

Implication for pacing: he has strong systems/ML reflexes and learns concepts fast — the gap is
domain vocabulary and hands-on modeling, not raw ability. Lean on his engineering intuition when
explaining (analogies to graphs, compute, pipelines land well).

## Roadmap

Two phases over the same 14-rung tree:
- **Phase 1 — Literacy (~40h, in progress):** climb the ladder below for comprehension. Recognize
  the term, know roughly what it means and why it matters. Checkboxes track this pass.
- **Phase 2 — Mastery (~300h, later):** revisit each rung hands-on — build it in PyMC, make it
  sample, diagnose it, ship it. A second pass over the same rungs, deep instead of wide.

### Phase 1 ladder (comprehension — ordered by how-often-it-comes-up × how-foundational)

Learn top-down and the chat stops being gibberish fastest.

- [ ] **1. Bayesian vocabulary — the bedrock** (~5h) — prior, likelihood, posterior, prior/posterior predictive, "sampling," generative model. "prior" alone appears ~2,500×. *(everyone; Fonnesbeck, Vincent)*
- [x] **2. MMM — Marketing Mix Modeling** (~5h) — attribute sales to spend; **adstock** (lagged carryover), **saturation** (diminishing returns), channels, budget optimization, incrementality. Most-discussed applied topic. *(Vincent, Orduz, Säilynoja, Wiecki)*
- [ ] **3. Hierarchical / multilevel models** (~4h) — **partial pooling** vs complete vs none, random effects, shrinkage, per-brand/geo structure. Default shape of nearly every model. *(Paz, Vincent; Fonnesbeck)*
- [ ] **4. Sampling & the NUTS sampler** (~3h) — MCMC, chains/draws, NUTS/HMC, **nutpie**, target_accept, warmup. "It won't sample" lives here. *(Seyboldt, Vieira, Paz)*
- [ ] **5. Convergence diagnostics** (~3h) — **divergences**, **R-hat**, **ESS**, ArviZ as the tool. The "is my model broken?" talk. *(Abril, Paz)*
- [ ] **6. Priors done properly** (~3h) — weakly-informative vs tight, prior predictive checks, sensitivity, ZeroSumNormal, HalfNormal. *(Vincent, Säilynoja, Seyboldt)*
- [ ] **7. Reparameterization & geometry** (~3h) — centered vs **non-centered**, "funnel" geometry, transforms — why rewriting helps it sample. The fix after divergences. *(Seyboldt, Paz)*
- [ ] **8. The compute stack** (~3h) — PyMC builds a symbolic **PyTensor** graph; **JAX/NumPyro** are speed/GPU backends. Shapes, broadcasting, `mode="JAX"`. *(Vieira, Paz)*
- [ ] **9. Causal inference & DAGs** (~4h) — correlation≠causation, **DAGs**, confounders, interventions (`pm.do`), incrementality. Frames most MMM work. *(Vincent, Orduz, Luhmann)*
- [ ] **10. Model comparison** (~2h) — **LOO / ELPD / WAIC**, PSIS **k-hat**, "better predictive fit." *(Abril, Engels)*
- [ ] **11. Likelihoods, GLMs & regression** (~3h) — picking a likelihood (Normal/Poisson/Student-T/Binomial), link functions, marginalizing discrete latents. *(Vincent, Paz, Luhmann)*
- [ ] **12. Gaussian Processes & HSGP** (~3h) — GP = flexible prior over functions; lengthscale/kernel; **HSGP** fast approximation; spatial/smooth trends. *(Engels, Fonnesbeck)*
- [ ] **13. State-space & structural time series** (~3h) — trend+seasonality+regression components, **Kalman filter**, counterfactual forecasting. *(Grabowski, Fonnesbeck)*
- [ ] **14. Frontier / niche — know the words exist** (~2h) — **variational inference / normalizing flows**, **Laplace approximation**, **drift-diffusion/HSSM**, R2D2/PC priors. *(Seyboldt, Fengler)*

## Sessions (newest at top)

### 2026-07-05 · ~20 min · Diagnostic + Rung 2 (MMM)
- Diagnostic: strong structural intuition (prior, hierarchy, generative thinking); blank on ops
  vocab (r-hat, divergences, non-centered, adstock/saturation). Knew "MMM" = marketing mix model.
- Covered: adstock (carryover over time, knob = decay rate), saturation (diminishing returns,
  bendy curve), budget optimization = equalize marginal return (slope) across channels.
- Cleared: read a real MMM chat sentence cold and translated it correctly (self-corrected the
  one wobble — that slopes being *unequal* is the arbitrage).
- Misconception fixed: "non-centered" is a re-writing trick, NOT about non-normal distributions.
- Next: Rung 4+5 sampling & diagnostics. Spot-check Rung 3 (hierarchical) first.
