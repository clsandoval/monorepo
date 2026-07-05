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
hours_done: 1.4
next_up: Rung 6 — Priors done PROPERLY (natural next click after prior-basics + hierarchy):
  weakly-informative vs tight, prior predictive checks (sanity-check assumptions BEFORE data),
  sensitivity, ZeroSumNormal/HalfNormal. Warm-up: shrinkage one-liner + the no-pooling/complete/
  partial trio. NOTE neglect-scan: Rung 8 (compute stack: PyTensor/JAX) & Rung 9 (causal/DAGs)
  untouched — pull one in within ~2 sessions so priors doesn't become a 3rd straight cluster.
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

- [x] **1. Bayesian vocabulary — the bedrock** (~5h) — prior, likelihood, posterior, prior/posterior predictive, "sampling," generative model. "prior" alone appears ~2,500×. *(everyone; Fonnesbeck, Vincent)*
- [x] **2. MMM — Marketing Mix Modeling** (~5h) — attribute sales to spend; **adstock** (lagged carryover), **saturation** (diminishing returns), channels, budget optimization, incrementality. Most-discussed applied topic. *(Vincent, Orduz, Säilynoja, Wiecki)*
- [x] **3. Hierarchical / multilevel models** (~4h) — **partial pooling** vs complete vs none, random effects, shrinkage, per-brand/geo structure. Default shape of nearly every model. *(Paz, Vincent; Fonnesbeck)*
- [x] **4. Sampling & the NUTS sampler** (~3h) — MCMC, chains/draws, NUTS/HMC, **nutpie**, target_accept, warmup. "It won't sample" lives here. *(Seyboldt, Vieira, Paz)*
- [x] **5. Convergence diagnostics** (~3h) — **divergences**, **R-hat**, **ESS**, ArviZ as the tool. The "is my model broken?" talk. *(Abril, Paz)*
- [ ] **6. Priors done properly** (~3h) — weakly-informative vs tight, prior predictive checks, sensitivity, ZeroSumNormal, HalfNormal. *(Vincent, Säilynoja, Seyboldt)*
- [x] **7. Reparameterization & geometry** (~3h) — centered vs **non-centered**, "funnel" geometry, transforms — why rewriting helps it sample. The fix after divergences. *(Seyboldt, Paz)*
- [ ] **8. The compute stack** (~3h) — PyMC builds a symbolic **PyTensor** graph; **JAX/NumPyro** are speed/GPU backends. Shapes, broadcasting, `mode="JAX"`. *(Vieira, Paz)*
- [ ] **9. Causal inference & DAGs** (~4h) — correlation≠causation, **DAGs**, confounders, interventions (`pm.do`), incrementality. Frames most MMM work. *(Vincent, Orduz, Luhmann)*
- [ ] **10. Model comparison** (~2h) — **LOO / ELPD / WAIC**, PSIS **k-hat**, "better predictive fit." *(Abril, Engels)*
- [ ] **11. Likelihoods, GLMs & regression** (~3h) — picking a likelihood (Normal/Poisson/Student-T/Binomial), link functions, marginalizing discrete latents. *(Vincent, Paz, Luhmann)*
- [ ] **12. Gaussian Processes & HSGP** (~3h) — GP = flexible prior over functions; lengthscale/kernel; **HSGP** fast approximation; spatial/smooth trends. *(Engels, Fonnesbeck)*
- [ ] **13. State-space & structural time series** (~3h) — trend+seasonality+regression components, **Kalman filter**, counterfactual forecasting. *(Grabowski, Fonnesbeck)*
- [ ] **14. Frontier / niche — know the words exist** (~2h) — **variational inference / normalizing flows**, **Laplace approximation**, **drift-diffusion/HSSM**, R2D2/PC priors. *(Seyboldt, Fengler)*

## Sessions (newest at top)

### 2026-07-05 · 9 min · Rung 3 (hierarchical / partial pooling / shrinkage)
- Ran straight on from the Rung 7 session (same day). Focus: hierarchical models.
- Covered via a 5-cities conversion-rate example: the trio — **no pooling** (each group alone,
  fooled by tiny samples) / **complete pooling** (one bucket, erases real differences) / **partial
  pooling** (the hierarchical in-between). Two-level structure: shared parent (mu, sigma) over
  per-group rate_c ~ Normal(mu, sigma).
- **Shrinkage** landed: each group's estimate pulled from its raw number toward the group mean; the
  gap shrinks. Pull strength = f(how little data, how far from the crowd). Correctly predicted
  Baguio (0% off 30) shrinks hard, Manila (10% off 1000) barely moves — and named both drivers.
- Cross-link nailed unprompted: recognized `rate_c ~ Normal(mu, sigma)` IS the funnel setup →
  hierarchical models get non-centered in practice. Rungs 3+7 now connected.
- Read: vocab lag persists (fumbled the *word* "shrinkage" while clearly grasping the *mechanism*) —
  keep handing him the crisp definition after he reasons it out; concept-first, term-second works.
- Next: Rung 6 priors-done-properly.

### 2026-07-05 · 19 min · Rung 7 (reparameterization) + Rung 1 bedrock (priors)
- Warm-up: divergences = don't-trust-it even if r-hat/ESS fine ✓; likelihood = P(data|params) ✓.
- Planned focus was Rung 7, but hit a real gap mid-session: "where do Normal/HalfNormal even come
  from?" — no stats background. Backed up to Rung 1 bedrock and rebuilt from there.
- Covered (bedrock): a prior = an assumption YOU write (`~` = "is distributed as" = "shape I assume");
  a distribution = a *shape of plausible values*, not a 4th object. Normal = symmetric, can go
  negative; HalfNormal = positive-only. Decision rule locked: **can it be negative? yes→Normal,
  no→HalfNormal.** (nailed height=Normal, self-corrected temp-change=Normal, SD=HalfNormal ✓)
- Covered (Rung 7): the funnel = theta's width depends on sigma, sigma slides toward 0 → needle →
  one step-size can't fit both needle & bell → divergences OR low ESS. Fix = non-centered: sample a
  fixed helper `z ~ Normal(0,1)` + `sigma` separately, then `theta = mu + z*sigma`. Same model
  (algebra identity: z*sigma is exactly Normal(0,sigma)), friendlier coordinates. Sampler walks the
  fixed shapes, reconstructs theta by multiplication each draw.
- Big unlocks: distributions are assumptions we choose, not discoveries; non-centering loses ZERO
  expressiveness (same landscape, different street-grid); "stretch a standard bell into the assumed
  shape" — and that this works because Normal is location-scale.
- Needed /discretize once (funnel) — dense at first, landed after numbers.
- Next: Rung 3 hierarchical (the structure the funnel lives in). Interleave Rung 6 prior-depth soon.

### 2026-07-05 · 41 min · Rungs 4+5 (sampling & diagnostics)
- Warm-up (interleaved): retested MMM adstock/saturation ✓ and partial pooling ✓.
- Covered: why we sample (posterior has no closed form → Monte Carlo); MCMC/chains/draws; NUTS/HMC
  = gradient-guided walker (vs dumb random-walk), nutpie = fast Rust NUTS; tuning/target_accept.
  Diagnostics: divergences (puck flew off at tight geometry), r-hat (chain agreement ≈1.0), ESS
  (effective independent samples), ArviZ = the dashboard.
- Big unlocks: **sampling ≠ optimization** (map the whole distribution, don't hunt a peak);
  **likelihood = P(data | params)** (self-corrected the reversal); params = a length-D vector, D =
  count of unknowns; the matmul is X@β (data matrix × param vector) → predictions → likelihood.
- Cleared: read r-hat/ESS/divergence numbers and gave the right "inefficient vs broken" verdict.
- Next: Rung 7 reparameterization — the fix for the divergences/low-ESS he can now diagnose.

### 2026-07-05 · ~20 min · Diagnostic + Rung 2 (MMM)
- Diagnostic: strong structural intuition (prior, hierarchy, generative thinking); blank on ops
  vocab (r-hat, divergences, non-centered, adstock/saturation). Knew "MMM" = marketing mix model.
- Covered: adstock (carryover over time, knob = decay rate), saturation (diminishing returns,
  bendy curve), budget optimization = equalize marginal return (slope) across channels.
- Cleared: read a real MMM chat sentence cold and translated it correctly (self-corrected the
  one wobble — that slopes being *unequal* is the arbitrage).
- Misconception fixed: "non-centered" is a re-writing trick, NOT about non-normal distributions.
- Next: Rung 4+5 sampling & diagnostics. Spot-check Rung 3 (hierarchical) first.
