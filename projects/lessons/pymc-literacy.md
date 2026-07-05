---
type: lesson
topic: PyMC Labs Discord literacy
started: 2026-07-05
goal: Become a Bayesian modeling DIRECTOR + CRITIC (not an author). Carlos works fully agentically —
  never hand-writes code — so mastery = specify a model in words/pseudocode, direct an agent to build
  it in PyMC, then READ & REFEREE the output (catch a missing observation layer, the funnel,
  non-identifiability, an r-hat you shouldn't trust). Reading fluency IN, authoring fluency OUT.
  Phase 1 = literacy (follow the Discord). Phase 2 = build the real Mama Sita's model, agentically.
phase: 1-literacy
level: Strong structural intuition (prior, hierarchy, generative thinking — has ML/stats reflexes),
  learns concepts FAST; gap is vocab (word lags mechanism) + hands-on judgment, not raw ability.
hours_estimate: 200   # Phase 1 literacy REVISED DOWN to ~15h (crushing it — 6 rungs in 1.4h; only
  needs vocab mapped onto owned structure). Phase 2 ~185h = agentic modeling of Mama Sita's, where the
  real unknown is his director/critic pace (no read yet — he hasn't specified+refereed a live model).
hours_done: 1.7
next_up: Rung 9 — Causal inference & DAGs (started same-day right after Rung 8; heavier rung, frames
  the promo-vs-forward-buying business problem). confounders, colliders, backdoor paths, pm.do /
  interventions, correlation≠causation. Warm-up: graph=compile-target one-liner + prior flat-vs-weak.
  NEGLECT-SCAN remaining: 10 (model comparison/LOO), 11 (likelihoods/GLMs), 12 (GP/HSGP),
  13 (state-space), 14 (frontier). 11 is foundational — slot soon.
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
- [x] **6. Priors done properly** (~3h) — weakly-informative vs tight, prior predictive checks, sensitivity, ZeroSumNormal, HalfNormal. *(Vincent, Säilynoja, Seyboldt)*
- [x] **7. Reparameterization & geometry** (~3h) — centered vs **non-centered**, "funnel" geometry, transforms — why rewriting helps it sample. The fix after divergences. *(Seyboldt, Paz)*
- [x] **8. The compute stack** (~3h) — PyMC builds a symbolic **PyTensor** graph; **JAX/NumPyro** are speed/GPU backends. Shapes, broadcasting, `mode="JAX"`. *(Vieira, Paz)*
- [ ] **9. Causal inference & DAGs** (~4h) — correlation≠causation, **DAGs**, confounders, interventions (`pm.do`), incrementality. Frames most MMM work. *(Vincent, Orduz, Luhmann)*
- [ ] **10. Model comparison** (~2h) — **LOO / ELPD / WAIC**, PSIS **k-hat**, "better predictive fit." *(Abril, Engels)*
- [ ] **11. Likelihoods, GLMs & regression** (~3h) — picking a likelihood (Normal/Poisson/Student-T/Binomial), link functions, marginalizing discrete latents. *(Vincent, Paz, Luhmann)*
- [ ] **12. Gaussian Processes & HSGP** (~3h) — GP = flexible prior over functions; lengthscale/kernel; **HSGP** fast approximation; spatial/smooth trends. *(Engels, Fonnesbeck)*
- [ ] **13. State-space & structural time series** (~3h) — trend+seasonality+regression components, **Kalman filter**, counterfactual forecasting. *(Grabowski, Fonnesbeck)*
- [ ] **14. Frontier / niche — know the words exist** (~2h) — **variational inference / normalizing flows**, **Laplace approximation**, **drift-diffusion/HSSM**, R2D2/PC priors. *(Seyboldt, Fengler)*

## Phase 2 project — Mama Sita's (the family business, real application domain)

Decided 2026-07-05: drop toy examples. Carlos's family runs **Mama Sita's** (Marigold Manufacturing
Corp.) — premium/heritage Filipino sauces & condiment mixes (oyster sauce, sinigang/kare-kare mixes,
vinegars), diaspora-first export brand. **Middle East is the single biggest market**; also US/Canada/
AU-NZ/Europe/Asia. **Division of labor (Carlos, confirmed 2026-07-05): Monde Nissin handles LOCAL PH
distribution; the family/Marigold handles EXPORT directly.** So the entire modeling domain of interest
(overseas distributors, per-country hierarchy, reporting bias, diaspora seasonality) sits on data the
family OWNS — no master-marketer curtain. Kills the "is this modelable" risk. **Still-OPEN Q: what's
the clean anchor** — a channel/period/audited number they trust — needed to make the latent-bias model
identifiable (else "low true demand" vs "distributor skimming" can't be separated). He likely can't share real
data but will recognize a real problem instantly (it's his brand) — that recognition is the teaching
lever. Every remaining literacy rung gets re-skinned in Mama Sita's; Phase 2 builds one running model.

HOW TO USE THIS (Carlos, 2026-07-05): do NOT pre-pick a spine or 10-point an exercise up front. Just
run the normal rung-by-rung plan with generic examples; when one comes up, Carlos flags the real-world
Mama Sita's nuance ("this is fine, but in the real world here's the wrinkle") and you fit it in on the
fly. The six below are a MENU for opportunistic grounding, not a committed project:
1. **True demand vs biased distributor sell-through reporting** (latent-variable / measurement model):
   reported = true_demand × per-distributor bias × noise. Recover true demand, rank distributor
   reliability. Maps to the real sell-in/sell-through visibility cliff.
2. **Hierarchical demand: SKU → distributor → country → region** (partial pooling) — sparse cells
   (niche mix in Kuwait) borrow strength; new distributors shouldn't be trusted at face value.
3. **Promo uplift vs forward-buying, under-the-table discount as confounder** (causal/DAG) — post-promo
   sell-in trough reveals pantry-loading; recover true incremental demand.
4. **Dual-calendar diaspora seasonality** (structural time series) — fixed-Q4 Noche Buena (West) +
   lunar-drifting Ramadan/Eid (Gulf); why month-dummies fail for Ramadan.
5. **Sell-in → sell-through reconciliation, distributor inventory as hidden state** (state-space):
   inv_t = inv_{t-1} + sell-in − true-demand. Plays to his systems/pipeline intuition.
6. **Oyster-extract supply/cost shock → price pass-through & diaspora price-elasticity** (regression
   w/ exogenous shock).

## Sessions (newest at top)

### 2026-07-05 · 19 min · Rungs 6 (priors done properly) + 8 (compute stack)
- Warm-up: partial-pooling → Qatar(thin data) leans on group, = shrinkage ✓.
- Rung 6: the flat→weakly-informative→tight spectrum (knob = the prior's width/2nd number); flat≠
  objective, it's a TRAP (weight on absurd values + bad sampling); thin data leans on prior (=
  shrinkage's engine); prior predictive check = run model forward on priors only, sanity-check the
  fake data BEFORE fitting; prior sensitivity = if reasonable priors disagree, answer is prior-driven.
  Checks nailed: diagnosed Normal(0,10000) as absurd-range flat prior; caught that neg sales→HalfNormal
  (shape) AND 10M→tighten scale (2 separate fixes); "two priors disagree → we don't have enough data" ✓.
- Rung 8 (his home turf — fast): PyMC = a COMPILER front-end. You write a symbolic PyTensor graph
  (nodes=ops, not numbers), autodiff walks it → gradients → which is what NUTS requires. Backend
  (C / JAX-NumPyro / Numba) = the codegen target you point the SAME graph at; JAX = XLA→GPU/TPU.
  "set backend to JAX" changes machine code, not the model. Shape/broadcast bugs = type-checking an IR.
- Checks: Q2 (JAX changes compile target not graph) perfect. Q1 corrected: he said "needs data" — real
  reason for the GRAPH specifically is GRADIENTS (autodiff), data-deferral is just a side effect.
- Detour: asked to disable Claude Code prompt autocomplete (spoiling quiz answers). Confirmed can't be
  skill-scoped (no skill-lifecycle hook, static settings); global toggle only —
  CLAUDE_CODE_ENABLE_PROMPT_SUGGESTION=false in ~/.claude/settings.json. He'll set it later. Docked
  ~4min detour from timer.
- Next: Rung 9 causal/DAGs (going straight into it same day).

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
