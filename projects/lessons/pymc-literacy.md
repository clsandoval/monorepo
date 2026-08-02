---
type: lesson
topic: PyMC Labs Discord literacy
started: 2026-07-05
goal: Become a Bayesian modeling DIRECTOR + CRITIC (not an author). Carlos works fully agentically —
  never hand-writes code — so mastery = specify a model in words/pseudocode, direct an agent to build
  it in PyMC, then READ & REFEREE the output (catch a missing observation layer, the funnel,
  non-identifiability, an r-hat you shouldn't trust). Reading fluency IN, authoring fluency OUT.
  Phase 1 = literacy (follow the Discord). Phase 2 = build the real Mama Sita's model, agentically.
phase: 2-mastery
level: Strong structural intuition (prior, hierarchy, generative thinking — has ML/stats reflexes),
  learns concepts FAST; gap is vocab (word lags mechanism) + hands-on judgment, not raw ability.
hours_estimate: 200   # Phase 1 literacy REVISED DOWN to ~15h (crushing it — 6 rungs in 1.4h; only
  needs vocab mapped onto owned structure). Phase 2 ~185h = agentic modeling of Mama Sita's, where the
  real unknown is his director/critic pace (no read yet — he hasn't specified+refereed a live model).
hours_done: 8.3
next_up: **REVERSE THE 8/01 DECISION — the blanks-skeleton is LOAD-BEARING, not a crutch. 8/02
  dictation #2 ran with NO skeleton and production collapsed completely: he never wrote a single
  correct line unaided. 8/01 (skeleton with blanks) he assembled the whole lam line + hierarchy.
  Same learner, one week apart — the difference was the skeleton. Ratchet the blanks DOWN one line
  at a time; do not remove them wholesale again.**
  (A) **Next session — do NOT run dictation #3 first. Run a discrimination drill.** Three errors
  repeated so often on 8/02 that dictation can't land until they're fixed, and all three are
  FAULT-FINDING shaped (his strength), not production shaped:
  (1) **Exposure placement — wrong 3× in one session.** Put `flights` inside the exp as a fitted
  coefficient, then re-multiplied by it a 2nd time after being handed `lam = exp(log_rate)*flights`.
  The 8/01 rule ("counted-data multiplies OUTSIDE") does NOT discriminate for him. **REPLACED with:
  "do I need to LEARN how much this column matters? yes→inside w/ coefficient, no, I know it
  exactly→outside × 1."** Drill as a table fill-in: hand a column list, he marks each
  inside/outside/observed. Cheap, mechanical, targets it head-on.
  (2) **NEW ERROR, serious: outcome variable on the RHS.** Wrote `exp(...) + strikes + flights` and
  later `strikes = lam × flights`. Cleared only by the forecasting test ("it's next January — which
  columns do you actually have?"). Retest as a BUG HUNT: hand him a model with the outcome on the
  right-hand side, ask him to find the bug. Referee framing, not production framing.
  (3) **No likelihood line, ever.** Never produced `pm.Poisson(..., observed=)` across the whole
  session. He tried `strikes = lam`, i.e. expected value == observed count, no noise layer. Tie it
  to the lam-vs-posterior-predictive distinction (also confused 8/02: asked "is lam the posterior
  for bird strikes?").
  (B) **Shrinkage: direction NOT owned — retest cold, this was 8/02's clean miss.** He got the
  easy half (B: partial pooling pulls the sparse unit toward the group ✓, unaided) but then said
  **`mu_a`** controls pull strength (it's `sigma_a`), and on the transfer question — 30 clinics,
  `sigma=0.03`, 3 bad outcomes — said **"dangerous"** when the answer is *shrugged off*. He has the
  mechanism and inverts the knob. Retest both cold: which knob, and which direction.
  Payload delivered that he should own next time: **small sigma = strong pull = outliers flattened;
  a model that learns a tiny sigma CANNOT flag a genuinely bad unit** (referee catch: check sigma
  before believing "found nothing anomalous").
  (C) **NEW SCAFFOLD, his own pushback earned it — the sigma→percent card.** He correctly refused
  `sigma=0.03` as unreadable ("what am I supposed to do with .03, I'm not a calculator") — a
  legitimate critic move, and my miss: a sigma is only small relative to a scale. Delivered the
  card, now merge warm-up item (2) into it and flashcard as ONE thing:
  **σ 0.03→±3% · 0.1→±10% · 0.3→±35% · 0.7→2× · 2.3→10×** (under ~0.3, read log-scale sigma as a
  plain percentage). Cold check next session.
  (D) **NAME RETENTION is a real gap, not deferral.** Four definition questions on 8/02 — `lam`,
  `log_rate`, `mu`/`sigma` — and `lam`/`log_rate` were BOTH already defined on 8/01. The words are
  not sticking between sessions even when the mechanism does. Open every session with a 30-second
  cold vocab ping on the count-model names before any drill.
  (E) **Warm-up bank (END of session, ≤5 min, 2 max):**
  (1) **"Tight prior hides a ridge" — NOW 0/4** (declined 7/30, name-swapped 8/01, not reached 8/02).
  Prose has failed 3×, so per the twice-failed rule: RENDER IT next time — plot posterior-on-prior
  overlay for HalfNormal(0.001) vs HalfNormal(0.01) (identical posteriors chasing the prior), send to
  Telegram, then retest. The two tests to elicit: did-the-posterior-move; refit-10×-wider.
  (2) **Rung 2 MMM core** (adstock knob / within-channel saturation / equal marginal slopes) — not
  directly retested since the 7/29 decay; keep cycling it.
  **WATCH (8/01, WORSE on 8/02): questions-as-deferral.** His referee questions mid-drill were excellent
  (incl. an unprompted mediator catch — "do cameras affect traffic?") but they also postponed the
  writing indefinitely. Had to declare "last concept question" to force production. Answer the good
  ones briefly, then immediately re-demand the pending line. Production first, curiosity second.
  **R2D2/joint-prior: STOP cold-drilling (decided 7/31, 3rd pass).** He finally produced the mechanism
  ("variances add, it blows up") with scaffold; arithmetic still slips (used 1 for the variance, not
  sd²=9). Practice it as prior predictive checks inside Phase-2 builds instead of as a quiz item.
  **Adstock referee list is now 3-of-4 his** (resolution ✓ 7/31, posterior-moved in spirit ✓ 7/31,
  absorbed ✓ 7/30; dark-weeks/spend-variation was delivered, not produced — it's the one to re-check,
  framed as "no variation → ridge").
  WATCH: he swaps questions under pressure — answers the adjacent question, not the asked one.
  Happened 3×. Re-ask VERBATIM and demand yes/no; that is what finally separated bias-vs-fixability
  on 7/29.
  **METAPHORS HURT HIM, NUMBERS FIX HIM (2× validated 7/29, both in one session).** When he says he's
  confused, do NOT explain again at more length — that made it worse twice. Strip ALL domain vocabulary
  and go to concrete arithmetic: "two numbers multiply to 12, now they also add to 7" cleared
  identifiability in 5 lines after two full explanations failed; a 3-row table of parameter values all
  predicting 95% cleared "ridge" after the hill metaphor stalled for 10 min. Words like "ridge", "walk
  for free", "flat direction" are jargon disguised as plain English — define them with numbers on first
  use or don't use them.
  VISUALS UNLOCK HIM — but the figure's QUANTITY must match the words (7/29: a sample-cloud labeled with
  curvature eigenvalues confused him, since wide spread = LOW curvature; redrawing as a topo contour map
  of the log-likelihood fixed it). Generate the plot, don't describe geometry. Recipe:
  `uv run --with matplotlib --with numpy python <script>` (no global matplotlib), then Telegram via
  `set -a; . ~/cs/monorepo/.env; set +a; curl -sF chat_id=$TELEGRAM_CHAT_ID -F caption=... -F
  photo=@shot.png https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendPhoto`. Assets:
  `assets-pairplots.py`, `assets-omitted-confounder.py`, `assets-sumtozero.py`.
  PHASE-2 RULE (validated 7/28): answering derivation-depth questions he ASKS is fine if flagged
  read-only; volunteering machinery and then quizzing on it is what broke him on HSGP 7/26.
  DO NOT use Mama Sita's for teaching examples (durable feedback, 2026-07-05) — high-variance domains only.
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
- [~] **2. MMM — Marketing Mix Modeling** (~5h) — attribute sales to spend; **adstock** (lagged carryover), **saturation** (diminishing returns), channels, budget optimization, incrementality. Most-discussed applied topic. *(Vincent, Orduz, Säilynoja, Wiecki)* — PASSED 7/05, **DECAYED on the 7/29 retest** (all three items partial: adstock→"recall?", saturation confused with cross-channel comparison, optimization vague). Re-taught + visual. Retest cold; this is the highest-volume topic in the Discord, don't let it rot again.
- [x] **3. Hierarchical / multilevel models** (~4h) — **partial pooling** vs complete vs none, random effects, shrinkage, per-brand/geo structure. Default shape of nearly every model. *(Paz, Vincent; Fonnesbeck)*
- [x] **4. Sampling & the NUTS sampler** (~3h) — MCMC, chains/draws, NUTS/HMC, **nutpie**, target_accept, warmup. "It won't sample" lives here. *(Seyboldt, Vieira, Paz)*
- [x] **5. Convergence diagnostics** (~3h) — **divergences**, **R-hat**, **ESS**, ArviZ as the tool. The "is my model broken?" talk. *(Abril, Paz)*
- [x] **6. Priors done properly** (~3h) — weakly-informative vs tight, prior predictive checks, sensitivity, ZeroSumNormal, HalfNormal. *(Vincent, Säilynoja, Seyboldt)*
- [x] **7. Reparameterization & geometry** (~3h) — centered vs **non-centered**, "funnel" geometry, transforms — why rewriting helps it sample. The fix after divergences. *(Seyboldt, Paz)*
- [x] **8. The compute stack** (~3h) — PyMC builds a symbolic **PyTensor** graph; **JAX/NumPyro** are speed/GPU backends. Shapes, broadcasting, `mode="JAX"`. *(Vieira, Paz)*
- [x] **9. Causal inference & DAGs** (~4h) — correlation≠causation, **DAGs**, confounders, interventions (`pm.do`), incrementality. Frames most MMM work. *(Vincent, Orduz, Luhmann)*
- [x] **10. Model comparison** (~2h) — **LOO / ELPD / WAIC**, PSIS **k-hat**, "better predictive fit." *(Abril, Engels)*
- [x] **11. Likelihoods, GLMs & regression** (~3h) — picking a likelihood (Normal/Poisson/Student-T/Binomial), link functions, marginalizing discrete latents. *(Vincent, Paz, Luhmann)*
- [~] **12. Gaussian Processes & HSGP** (~3h) — GP = flexible prior over functions; lengthscale/kernel; **HSGP** fast approximation; spatial/smooth trends. *(Engels, Fonnesbeck)* — PARTIAL 7/26: GP conceptual half CLEARED (prior-on-functions, kernel, lengthscale + both failure directions). HSGP at literacy level delivered as one sentence; the basis-function machinery bounced hard and is DEFERRED TO PHASE 2. Do not reopen it in Phase 1.
- [x] **13. State-space & structural time series** (~3h) — trend+seasonality+regression components, **Kalman filter**, counterfactual forecasting. *(Grabowski, Fonnesbeck)* — CLEARED 7/29: components ✓, identifiability/ridge ✓, observation layer ✓ (cold, durations), Kalman marginalization ✓ (mechanism), **sum-to-zero ✓** (3rd attempt, via visual + novel transfer variant), **counterfactual forecasting ✓** (produced "two equations, graph the difference" after one micro-step). Residual retest items, not blockers: the re-fit trap *mechanism* (level absorbs the lift) and per-draw → distribution.
- [x] **14. Frontier / niche — know the words exist** (~2h) — **variational inference / normalizing flows**, **Laplace approximation**, **drift-diffusion/HSSM**, R2D2/PC priors. *(Seyboldt, Fengler)* — CLEARED 7/29. All six words delivered + quizzed; Laplace/VI/flows nailed cold. **PHASE 1 LADDER COMPLETE.**

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

TOOL NOTE (2026-07-05): the PyMC ecosystem maps 1:1 to the rungs. PyTensor=Rung8, PyMC core=most
rungs, nutpie=4, ArviZ=5, Pathfinder(pymc-extras)=14, PyMC-Marketing=2/3/9, CausalPy=9 (retrospective
quasi-experiment), **pathmc** (pymc-labs, new June-2026 beta)=9: structural DAG→do() PLUS identifiability
checks & unmeasured-confounding SENSITIVITY. pathmc is a strong candidate Phase-2 tool for the latent-
bias/true-demand model — it does exactly the do-operator + confounding-sensitivity we flagged as the crux.
Org split: core (PyMC/PyTensor/pymc-extras/nutpie) = pymc-devs (community); applied (marketing/causalpy/
pathmc) = pymc-labs (company Carlos works at).

HOW TO USE THIS (Carlos, revised 2026-07-05): do NOT pre-pick a spine or 10-point an exercise up
front, and — per his explicit feedback later that day — do NOT re-skin teaching examples in Mama
Sita's. Keep examples brief, concise, and HIGH-VARIANCE across domains (he wants to avoid overfitting
his assumptions to one business). Mama Sita's remains the Phase 2 BUILD target only; he'll flag
real-world wrinkles himself when relevant. The six below are a MENU for Phase 2, not for Phase 1
teaching:
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

### 2026-08-02 · 18 min · Dictation drill #2 (no skeleton) — **production collapsed; skeleton was load-bearing**

Ran the 8/01 plan as written: new domain (bird strikes vs laser deterrents — 14 airports, 36 months,
`flights` as exposure, `lasers`, `t`, count outcome), the two sorting rules as the only scaffold, no
blanks skeleton. **The success bar was 7 lines from the problem statement alone. He wrote zero correct
lines unaided.** This is a sharp regression from 8/01, where the blanks skeleton got him the full `lam`
line and the hierarchy. Conclusion: **removing the skeleton was the wrong call — it's load-bearing at
this stage.** Reverting; ratchet blanks down one line at a time instead.

**What was his (unaided):**
- **The trend term, cold.** Read "bird populations have been drifting" off the problem statement and
  produced *"decline rate × time"* — correct term, correct column, unprompted. 8/01 he'd put the trend
  *outside* the exp; this time he placed it right.
- **exp with additive terms inside it** — knew that shape exists and reached for it first.
- **Asked whether `beta_lasers` should allow negatives** — right question, right instinct (symmetric
  prior at 0, let the data pick the sign).
- **Partial-pooling direction (B)** — sparse desert airport gets pulled toward the group average, not
  left at its own 2 quiet months. Unaided, multiple-choice.
- **Refused an unreadable number.** *"what am I supposed to do with .03 to know, I'm not a calculator"*
  — legitimate critic move and my error, not his: a sigma is only small relative to a scale. Earned
  the sigma→percent card.

**What failed:**
- **Exposure placement, wrong 3×.** Put `flights` inside the exp as a fitted coefficient; after the
  numeric refutation (tune β so 10→20 doubles, then 40 gives 4× and 80 gives 16× — exp turns doubling
  into squaring) he put it back inside again, then after being *handed* `lam = exp(log_rate)*flights`
  re-multiplied by flights a second time. **The 8/01 rule "counted-data multiplies OUTSIDE" does not
  discriminate for him.** Replaced it with *"do I need to LEARN how much this column matters?"* — yes
  → inside with a coefficient, no, I know it exactly → outside × 1. Untested; that's next session's
  drill.
- **Outcome variable on the RHS — new error, serious.** Wrote `exp(airport, laser) + strikes + flights`,
  and later `strikes = lam × flights`. Cleared only by the forecasting test: *"it's next January, the
  airport just installed 4 lasers — which columns do you actually have?"* `flights`✓ `lasers`✓ `t`✓
  `strikes`✗. Data-as-input needs a cold bug-hunt retest.
- **No likelihood line, ever.** Never produced `pm.Poisson(..., observed=)`. His attempt was
  `strikes = lam` — expected value equals observed count, no noise layer at all.
- **No hierarchy produced.** Gestured at "priors for the distribution of risk per airport" with a flat
  `Normal(0, 3)`, never wrote `mu_a`/`sigma_a`/`a[idx]` — despite rule 2 being nominally his. Had to
  hand the whole model, then take the hierarchy back as a separate exercise.
- **Shrinkage knob inverted.** After getting B right, said **`mu_a`** controls pull strength (it's
  `sigma_a`); needed a 2×2 table varying both to separate destination from strength. Then the transfer
  question — 30 clinics, `sigma=0.03`, 3 bad outcomes — he said **"dangerous"**; answer is *shrugged
  off*. He owns the mechanism and inverts the knob.
- **Four definition questions, two of them repeats from 8/01** (`lam`, `log_rate`, then `mu`/`sigma`),
  plus *"is lam the posterior for bird strikes?"* Names are not surviving between sessions even where
  the mechanism does. Had to declare "last concept question" (2nd session running) and he still asked
  two more.

**Delivered (payload to retest, not credit):** `lam` = expected count per row, PyMC keyword is `mu`;
`log_rate` = the additive sum on the log scale, `log(0.5)=−0.69`; lam vs posterior-vs-posterior-
predictive (parameters → lam → Poisson noise → observed); the full 9-line bird-strike model with a
per-column role table; **the sigma→percent card (0.03→±3%, 0.1→±10%, 0.3→±35%, 0.7→2×, 2.3→10×)**;
and the referee catch — *a model that learns a tiny sigma is structurally incapable of flagging a
genuinely bad unit, so check sigma before believing "nothing anomalous."*

- **Stopped at:** the clinic transfer question, answered wrong, corrected with the strength-of-evidence
  table.
- **Next:** discrimination drill (column role table + outcome-on-RHS bug hunt + likelihood line), then
  dictation #3 *with* a blanks skeleton. Cold retests: which shrinkage knob + which direction, the
  sigma→percent card, count-model vocab ping.
- **Housekeeping:** reconciled the lesson file — this branch (`gsd/deletion-milestone`) was 65 lines
  behind `main` and missing the 8/01 session entirely; took main's copy. Also cleared a dead
  `session_start` left over from the 8/01 run.
### 2026-08-01 · 30 min (timer) · Dictation drill #1 — red-light cameras, full model dictated (with scaffolding)
- Domain: 40 intersections, staggered red-light-camera rollout (worst first), monthly accident counts,
  traffic as exposure (50k–2M vehicles/mo), citywide decline from safer cars. Flawed flat-Poisson with
  beta_traffic and Normal(0,10) priors handed over; task = dictate the corrected model.
- **Opened by refereeing again, not dictating** — flagged the exploding priors ("effect in the 10,000s
  doesn't hold up"), trend = rate × time, per-intersection normal — all in prose, zero lines written.
  Named the pattern; forced a fill-in skeleton.
- **The grind (rounds needed): vocab floor is lower than the structure.** Didn't know `lam` (taught:
  the Poisson's expected count) or `log_rate`; asked "why are there exps" — re-taught via negative-lam
  breakage (2 + (−3) = −1 accidents) + the two-intersections doubling table (one −0.7 halves both 0.2
  and 6.0). Put the **trend OUTSIDE the exp** — fixed via the sorting rule that then carried the rest
  of the session: **learned-additive INSIDE, counted-data multiplied OUTSIDE** (plus the t=0 → lam=0
  breakage). At the end tried to put mu+sigma inside the exp — fixed: their job ends at line 3;
  alpha_i already carries them.
- **Offset, 3rd exposure:** needed the full micro-step chain again (2/100k × 500k → "10 multiply")
  but then PRODUCED the assembled line himself: "alpha, beta cam on, beta decline, outside traffic."
  Not fluent, clearly closer.
- **Hierarchy:** couldn't assign the roles cold ("why does intersection get alpha", "how does sigma
  come from mu" — pictured a chain). Taught via the 5-intersection rate table (personal numbers /
  center / spread = two dials in, cloud of 40 out) + the **two-step recipe: what varies per unit →
  subscript; subscripted → parent (mu, sigma)**. Tried `Normal(0, sigma_a)` for mu's prior — taught
  fixed-constant-you-type vs learned-parameter. **Picked the prior width HIMSELF off the multiplier
  table ("factor of 3–10" → width 1–2 ✓)** — the multiplier table is now his working interface to
  the log scale.
- **Referee questions mid-drill were the session's high point:** (1) "can't someone just do that with
  the accident rate?" → rate-division throws away n (he'd caught this in bear spec, connected it);
  (2) "why not compute the decline from year totals?" → confounding from the other side (1000→850
  with 10 cameras installed = credit already spent); (3) **"do cameras affect traffic?" — unprompted
  mediator/post-treatment catch**, answered read-only (per-vehicle vs total-accidents are different
  questions). That's a Rung-9 instinct firing in the wild.
- **NEW WATCH ITEM: questions-as-deferral.** The good questions also postponed the writing all
  session; had to declare "last concept question" before the lines appeared. Answer briefly,
  re-demand the line.
- **Warm-up 1 (tight prior hides ridge): MISSED, 3rd time** — answered "prior predictive", the exact
  7/31 name-swap. Delivered the distinction again (forward-simulate-before-fit vs
  did-the-posterior-move-after) + refit-10×-wider + "precise the way a photocopy is accurate."
  Prose is 0/3 → next time render the overlay plot first.
- **Warm-up 2 (exp coefficient): structure COLD ✓** — "reduced by a factor of exp(−0.7)" — but no
  clue it ≈ half. Gave the two anchors: ±0.7 ≈ 2×/half, ±2.3 ≈ 10×/tenth.
- Stopped at: full 7-line model on the board, warm-ups done.

### 2026-07-31 · ~90 min active (timer wall-clock 188 min — cadence clearly intermittent, gaps docked) · **PHASE 2 KICKOFF** — bear-locker director drill, full arc: spec → referee → dictate
- Scenario: 25 campgrounds, staggered bear-locker rollout (worst sites first), monthly incident counts,
  national downtrend since 2021. Deliberately NOT Mama Sita's.
- **SPEC (strong):** Poisson cold ✓. "Something in between" for site baselines ✓ — but for the wrong
  reason (said "campers vary"; real reason = unmeasured per-site stuff; corrected). Found the rate
  himself from the Feb/July rows (400:1 vs 9000:9 → "February, divide nights by incidents") ✓. Both
  rate-as-Normal breakages cold: throws away n ✓, predicts negative ✓.
- **REFEREE (the headline):** handed flawed flat-Poisson code. **Caught the worst-sites-first +
  downtrend confounding UNPROMPTED** — the exact question he missed 3× in July, produced cold. Also
  ASKED the coefficient-trading question himself ("what stops beta_lockers and beta_nights from one
  eating all the variance?") — answered: nothing in the model; separable only if install timing is
  uncorrelated with volume; check the posterior correlation/pairplot. Flagged the priors as
  uncheckable-without-data (right instinct). Missed the hierarchy until pointed back at his own spec,
  then caught it ("this equation assumes just one site").
- **DICTATE (the gap, and the pace-read for hours_estimate):** knows what's wrong, can't yet produce
  fixes. Conflated offset with trend; **"offset" the word blew up twice** — fixed only by rate ×
  exposure arithmetic (1/1000 × 400 = 0.4). Got angry-confused ("are you fucking stupid, they ARE
  using the data") = conflating *using a column* with *learning a coefficient on it*; broke it with the
  two-sites-doubling table (additive adds the same bump to a 0.2 site and a 6.0 site; multiplication
  doubles each for free). Couldn't produce the hierarchy structure ("alpha times another parameter?")
  — delivered mu_a/sigma_a/alpha_site pseudocode; **shrinkage check then PASSED cold** (new site,
  8 months, 0 incidents → pulled toward parent, right mechanism in his own words). Trend: "multiplies
  by the decline rate" — right instinct, couldn't formalize; delivered beta_year·t + the payoff
  (staggered installs are exactly what separate the step from the drift).
- **NEW FOUNDATION GAP: exp().** Didn't know the word at all. Taught as "the undo button for log";
  multiplier table (0→1×, 0.7→2×, −0.7→0.5×, 10→22,000×) landed it; Normal(0,10) → "above one it's
  basically some crazy number" — reached the answer AND PHRASED IT AS A QUESTION again; named the
  trust-your-number pattern to him mid-session.
- Asked for a full context restatement once, got it, worked — standing rule validated again.
- **Warm-up 1, R2D2 3rd pass — best yet, still not clean.** Produced the mechanism ("variances add,
  blows up") with scaffold; arithmetic slipped (8×1 not 8×9=72, sd 8.5 vs sales sd 10 → prior claims
  marketing explains ~72%). Punchline half-formed. Decision: stop cold-drilling, fold into Phase-2
  prior predictive practice.
- **Warm-up 2, adstock referee list:** produced the resolution check himself (new) and
  posterior-vs-prior in spirit but **named it wrong** ("prior predictive check" for the overlay);
  taught the distinction (forward-simulate-before-fit vs did-the-posterior-move). Delivered
  dark-weeks/spend-variation framed as a ridge (flat spend → decay 0 and 0.9 fit identically).
  List is now 3-of-4 his across two passes.
- Stopped at: bear model fully dictated (offset ✓ priors ✓ hierarchy ✓ trend ✓), warm-ups done, his call.

### 2026-07-30 · ~25 min (est — **no timer, his call: watching TV**) · PHASE 1 EXIT CHECK · 3/6 clean
- Divided attention by design ("no timer im watching a tv show"). Exit check was the right format for it —
  cold retrieval, short questions, no dense new teaching. **Use this mode again when he's half-attending.**
- **PASSED cold:**
  - **Budget optimization (Rung 2)** — slopes across channels, equal = no arbitrage left. The item that
    DECAYED on 7/29 now holds. Adstock/saturation not directly retested this pass.
  - **Identifiability, 3-row table (Rungs 13/14)** — best answer of the session and it survived a week:
    *"depends what the rank is; if we don't have enough rank then nothing changes, the data is just
    stretching the vector."* Produced in linear algebra unprompted. **Confirms the standing note: lean on
    linear algebra, it's his native frame.** This one is locked; stop retesting it.
  - **Prediction vs attribution under a ridge** — he didn't answer it (see below) but owns the principle
    from 7/29; re-delivered: every point on the ridge predicts identically, tightening only picks WHICH
    point, so prediction is unaffected and attribution is what's fabricated.
- **STILL SOFT (3):**
  - **R2D2 / joint prior — MISSED A 2ND TIME.** Same failure shape as 7/29: got the count intuition
    ("too many coefficients") and stalled, then said something garbled about "you care about the few that
    are weakly informative" — which is backwards; the point is the JOINT. Could not name the fix.
  - **"A tight prior hides a ridge" — DECLINED OUTRIGHT** ("i don't know what a circumstance, i don't
    want to try"). Delivered a 2nd time with numbers (HalfNormal(0.01) → posterior 0.004 [0.001,0.009],
    100% prior) plus the two tests: did the posterior move; refit 10× wider.
  - **Near-zero adstock referee list — 1 of 4.** Gave "another thing in the equation ate it," stopped.
- **MY QUESTION WAS BROKEN AND HE CAUGHT IT.** Asked about "your sigma_trend prior *fix* from #3" when #3
  had framed the tight prior as the VILLAIN. He refused: *"i don't know what sigma trend prior fix you're
  talking about."* Correct referee call — 3rd time he's caught my error unprompted (invented numbers 7/29,
  "three channels" slip 7/29, this). **Own these immediately, never smooth them over; it's the Phase-2 reflex.**
- **HE ASKED FOR THE FULL RESTATEMENT** — "give me more context the whole problem, don't just say same as
  one but different." Right call and worth generalizing: **a transfer variant that says "same setup but N=3"
  doesn't work on him. Restate the whole problem each time**, even when it feels redundant.
- **The joint-prior arithmetic half-landed via a TABLE, per the standing rule.** Rows for 1/3/14
  channels → total variance 25/75/350 → sd 5.0/8.7/18.7 → implied prior R² 6%/19%/88% against sales sd 20.
  He got to 8.7 himself ("9") **and then talked himself out of it** — the recurring pattern is that he
  reaches the right number and doesn't trust it. Name that when it happens.
  Landed principle: *the per-coefficient prior never changed; the joint claim grew with √(#channels)*.
  Flagged the spend-standardized-to-sd-1 assumption explicitly, since he audits invented numbers.
- Read: the two misses are the SAME failure — a prior that looks innocent per-parameter but is doing all
  the work jointly. Both are prior-side (Rung 6), not model-structure. That's the one soft edge left after
  a complete ladder.
- Stopped at: exit check finished, Phase-2 kickoff not started.

### 2026-07-29 (part 3) · 40 min · Rung 14 — frontier vocab · **PHASE 1 LADDER COMPLETE**
- Ran the rung FIRST with zero warm-ups, per the standing instruction. It worked — the rung that had been
  scheduled 3 sessions running finally landed. **Keep this rule: teach first, warm up only with leftover time.**
- Taught in two blocks (chunking, not one dump — the HSGP-7/26 failure mode avoided). Block 1 framed the
  four approximate-inference words as ONE ladder off NUTS ("MCMC is too slow, what else?"): Laplace →
  VI → normalizing flows → Pathfinder. Block 2 = the two orphans, HSSM and R2D2/PC.
- **3/3 cold on block 1.** Laplace-on-a-funnel ("only if Gaussian-shaped, else wrong"), mean-field VI
  ("you threw away uncertainty"), and flows-as-geometry-fixer for NUTS. Under-answered the funnel
  *specific* (no single scale; mode sits in the neck → absurdly narrow Gaussian, confidently wrong in the
  "everything is fine" direction) — supplied, not re-asked, since this is a vocab rung.
- Block 2 was weaker, as expected — no prior hooks for either.
  - Asked to rephrase the DDM identifiability question (fair — it was posed obliquely). Recast as
    accuracy-alone-can't-separate-high-drift-from-wide-boundaries, i.e. the same ridge as Rung 13. That
    framing is the one to reuse.
  - #3 (which two words = "learned approximation replacing an exact thing") — said flows + Pathfinder.
    Half right. Corrected: the operative word is LEARNED, i.e. a trained neural net → flows + HSSM's
    surrogate likelihood. Pathfinder/Laplace/VI are cheap ANALYTIC fits, nothing is trained.
  - Asked for a one-line recap of all six mid-quiz — good self-directed move, gave the glossary.
- **The R2D2 question is the retest item.** Got the fix word instantly ("r2d2") but could not produce the
  objection even after a direct push; landed on "14 is a lot of coefficients" and stopped. Delivered:
  variances ADD, so 14 × Normal(0,5) implies prior R² mass piled near 1 = "marketing explains all of
  sales." Rule given: **"weakly informative" is a property of the JOINT, not of one prior, and it degrades
  with dimension** — and the prior predictive check (Rung 6) is how you catch it. RETEST THIS COLD.
- Wound down mid-quiz (short answers, "i don't know") but then **re-engaged hard on his own** and drove
  the last 9 min himself — the 7/27-harness pattern again. Do not read a fade as the end.
- **TEACHING FAILURE + RECOVERY, worth keeping.** I introduced drift rate / boundary separation / RT with
  no experimental setup and he blew up ("what the fuck is drift rate... are you racing"). Entirely fair —
  I gave the abstraction before the concrete referent. Recovery sequence that worked, in order:
  1. The actual experiment in plain words (dots on a screen, press left/right, record button + milliseconds).
  2. **The visual** (`assets-ddm.py` → Telegram): two panels, sharp subject (steep drift, narrow bounds,
     95% @ 0.21s) vs cautious (flat drift, wide bounds, 93% @ 1.09s). Same accuracy, different reason.
     Visuals-unlock-him confirmed a THIRD time.
  3. He then asked the good generalizing question — "so #parameters must equal #observables?" — and was
     still confused after a full answer. **What finally landed was pure arithmetic, zero vocabulary:**
     "two numbers multiply to 12" (ridge) → "they also add to 7" (identified) → "they really really
     multiply to 12, measured 1000×" (learned nothing). More facts ≠ different facts.
  LESSON: when he's lost, strip ALL domain vocab and go to arithmetic. Adding more correct explanation
  made it worse; the 5-line numeric analogy fixed it instantly.
- **He closed it himself with "so it's like diagonalizing a matrix"** — right instinct, and the payoff was
  good: exact word is RANK / null space (Ax=b, redundant row doesn't raise rank = linear independence IS
  "different facts"), AND eigendecomposing the Hessian/posterior covariance is literally how you find the
  flat direction — near-zero eigenvalue = ridge, its eigenvector names WHICH parameter combination is
  unidentified. Pairplot banana = that direction drawn. Gave structural (exactly flat) vs practical
  (nearly flat) as the closing vocab. **Lean on linear algebra with him — it's his native frame.**
- Net: identifiability is now owned at a deeper level than Rung 13 left it, via linear algebra rather
  than via Bayesian phrasing.
- **Then he kept going for another 15 min on foundations, all self-directed.** Asked in sequence: "what's
  an eigenvalue/vector again", "what's a Hessian and a log-likelihood", "wtf does ridge / walk for free
  mean", "so the goal is to always have no ridge?". He will ask for the floor when he needs it — never
  assume a foundation is present, but also don't pre-teach it; he flags the gap himself.
  - Delivered: likelihood as "how probable is the data I saw, if the parameters were THIS" (coin, 7/10
    heads, curve peaks at 0.7); log purely for underflow + differentiability + monotonicity; gradient =
    slope vs Hessian = curvature; **why the Hessian and not the gradient — at the peak the gradient is
    ZERO for every model, so only curvature carries information about confidence**; and the loop closure
    that inverse-Hessian-at-the-mode IS the Laplace approximation from the top of the same session.
  - **VISUAL FAILURE worth logging.** First eigen figure used a SAMPLE CLOUD labeled with CURVATURE
    eigenvalues — wide spread = low curvature, an inversion I never stated. He said "the picture doesn't
    make sense" and he was right. Redrew as a **topographic contour map of the log-likelihood** (hill,
    contour spacing, walk each way and record height). That worked. RULE: match the figure's quantity to
    the words — don't label a spread picture with curvature numbers.
  - **"Ridge" and "walk for free" are jargon disguised as plain English and they cost ~10 min.** What
    finally landed was a 3-row TABLE of concrete parameter values (drift 3.0/boundary 0.8, 1.5/1.6,
    0.9/2.5) all predicting 95% accuracy, plus a contrasting row that breaks the fit. Second confirmation
    of the day's meta-lesson: **when he's lost, kill the metaphor and show numbers.** Metaphors (hill,
    ridge, walking) actively hurt him; tables and arithmetic fix it instantly.
  - Closed on his own good question — "so the goal is always no ridge?" Answer given: no, only in the
    quantities you'll make claims about; prediction can be identified while attribution isn't (the MMM
    case); three fixes (new measurement / reparameterize to the identified combination / report honestly);
    and the real goal is **knowing where your ridges are**, because the danger isn't a wide interval, it's
    a confident point estimate parked arbitrarily. **Landed the key trap: a tight prior HIDES a ridge** —
    posterior looks narrow and beautiful, and the confidence is 100% prior. Same failure as the R2D2
    question he missed earlier, which makes that retest more valuable.


### 2026-07-29 (part 2) · 16 min · Rung 13 CLOSED + Rung 2 MMM found decayed — he refereed ME twice
- His call to run a 3rd topic in one sitting; warned him about the documented fade and went anyway.
- **Counterfactual forecasting: swapped the question AGAIN (4th time)** — asked for the *procedure*,
  described the model *equation*. Re-asked verbatim with a micro-step ("the March weeks were fit with
  promo_on=1; what one number do you change?") → **"you make two equations and graph the difference."**
  That's the core; Rung 13's last open item is done and the rung is now [x].
- **The re-fit trap: right verdict, wrong mechanism.** Asked whether re-fitting without the promo term
  gives the same answer — he said no, but because "either the promo was on or not for a given week."
  Real reason: **level and trend ABSORB the lift** when the term is gone, so you compare attributions,
  not effects. Same disease as the omitted confounder. Supplied the two missing pieces: replay (don't
  re-fit) reusing the inferred level path, and once per draw → a distribution.
- **Decision framing landed as new material.** Given median +240, 94% CI [−30, +510] → he said "go."
  Taught: the uplift posterior is the INPUT, the breakeven is what makes it a decision;
  `(uplift_draws > be).mean()` is the whole move. Also explicitly warned him OFF the frequentist reflex
  ("CI crosses zero → no effect") — crossing zero means can't-rule-out-zero, not zero.
- **HE CAUGHT MY INVENTED NUMBERS** — "whered u get 100 units and 81/19%." Both were fabricated
  illustration. Owned it, then actually computed it (Normal(240,144) implied by the interval →
  P(>100) = 0.84, not 0.81) and showed the sensitivity table: same posterior, breakeven 0/100/240/300
  → 0.95/0.84/0.50/0.34. **This is the single best thing he did today** — it's precisely the Phase-2
  referee reflex, aimed at me unprompted. He also caught a second slip ("what three channels?" — I'd
  said three, the example had two). Praise this behavior when it happens; don't smooth over the errors.
- **Rung 2 MMM retest: DECAYED on all three** (untouched since 7/05). adstock → "recall??" (right
  intuition, missing the modeling statement + decay-rate knob); saturation → described the
  cross-channel comparison instead of within-channel diminishing returns; budget optimization →
  "optimizing the saturation across channels," circling but not the equal-marginal-slopes condition.
  Re-taught + plotted (`assets-saturation.py`, sent to Telegram): FB slope 0.43 vs TV 4.33 at the
  current split = the arbitrage; the ₱300k allocation curve peaking at 96/204 and the current split
  leaving 305 sales on the table. Added the honest caveat that the peak is FLAT — MMM finds big
  misallocations, not the last peso.
- **Faded exactly as documented.** Referee question on a near-zero fitted TV adstock: "something is
  wrong idk what to ask." Gave the 4-item list (does spend vary / dark weeks · did the posterior move
  off the prior · time resolution vs carryover length · what else absorbed it) and closed the session.
- **Unifying line handed to him:** three of those four are one question — *did the data contain the
  variation needed to answer this, or did another term take the credit?* That question closed the
  confounder, the sum-to-zero, and the counterfactual today.
- **PROCESS FIX (recorded in next_up): warm-ups ate BOTH sittings today and Rung 14 has now been
  scheduled 3 sessions without being reached.** Next session opens with Rung 14; warm-ups move to the
  end and get ~5 min, 2 items max.

### 2026-07-29 · 30 min · Both standing misses CLOSED — Rung 9 regression + sum-to-zero, both via visuals
- **Rung 9 omitted-confounder retest #2: FAILED again, third time.** Fresh domain (opt-in university
  tutoring, prior GPA in the registrar's DB but not a model term, b = +4.5). He said **"yes, jts still
  fit on observation"** — verbatim the same error as 7/28 ("yes cause its observed"). Prose had now
  failed twice, so: numbers, then a plot.
- Killed it with arithmetic: two groups (GPA 2.5 → 2h → 62; GPA 3.7 → 10h → 100), true effect +1/hr,
  pooled slope = 38/8 = **+4.75 ≈ 5× the truth**. The fit hands GPA's 30-point gap to the only column
  standing there.
- **Follow-up check exposed a SECOND misconception:** asked which is more trustworthy, (A) confounder
  observed-but-omitted vs (B) never measured — he said **"A, its quantitative."** Wrong. Corrected:
  both fit the *identical* model to the *identical* columns, so `b` is identically biased. **Bias:
  same. Fixability: (A) trivial, (B) hard.** Trustworthiness is a property of the model you fit, not
  of data sitting on some other server. Also flagged: no ArviZ diagnostic catches this — r-hat/ESS/LOO
  are all clean because the model samples a well-posed *wrong* question perfectly.
- **Generated the visual** (`assets-omitted-confounder.py`): left = one gray cloud + one steep line
  (b=+4.44); right = same 120 points with GPA revealed, two clouds, within-group slopes ≈ +1, the
  omitted fit ghosted over reality as the line connecting two group means. Sent to Telegram.
- **CLEARED after the picture** — re-asked verbatim with a forced yes/no, and he produced both:
  (A) biased, fix = add the term and re-fit; (B) biased, **"because its not in the equation."** That
  phrasing IS the discriminator. Rung 9 regression closed.
- **Sum-to-zero retest #2: FAILED cold** ("things just go up and up and up" — that's trend drift, wrong
  mechanism). 0 for 2 going in. Re-taught with the 3-row table (level 100/0/250 with the matching
  seasonal offsets → byte-identical y), then plotted it (`assets-sumtozero.py`, 3 panels: the observed
  series / two decompositions through the same points / the r=−1 posterior ridge with the constrained
  point marked). Sent to Telegram.
- **CLEARED, and on a novel transfer variant.** Asked: level now known and fixed at 100 — still need
  sum-to-zero? He said **"no, no more trading of free constant."** Correct, and it's the general
  principle (the constraint has to land on one side or the other), not the memorized rule.
- **METHOD FINDING (twice-validated in one session): when a concept has failed twice in prose, go
  straight to a generated plot.** Both blocks broke open immediately after the image, in the same
  pattern as the 7/27 pair plot. This is now three-for-three. Stop re-explaining; render it.
- **Question-swapping recurred (3rd time)** — answered the fixability question when asked about bias.
  The fix that worked: re-ask verbatim and demand one word. Do that by default now.
- Stopped at: warm-ups done, Rung 14 not started (3rd topic = his documented fade point).

### 2026-07-28 · 17 min · Rung 13 close-out — observation layer CLEARED, Rung 9 regression found
- Warm-up FAILED cold ("idk"): the third ridge fix, **sum-to-zero on the seasonal component**. Re-locked
  with numbers (quarterly [+10,-5,+2,-7] + 100 to each, -100 to level = identical fit → the ridge is a
  constant offset sliding between components; sum-to-zero leaves exactly one decomposition). Tied to
  `ZeroSumNormal`, the Rung 6 name he'd seen without knowing why it existed. **Retest this again — 0/1.**
- **Observation-layer retest #1 (close rate, k of n): needed 2 micro-steps.** Answered "the outcome is
  closed rate" — the derived number, not the physical count. Nudge ("what did somebody actually count?")
  → Bernoulli → given Binomial. Gaussian failures: got **negative** ✓, but said "fractional values"
  which is wrong (proportions ARE fractional; the leak is **>1**). Taught the two he missed: variance is
  `n·p·(1-p)` not constant, and modeling the *rate* throws away n so 2-of-3 outweighs nothing —
  Binomial keeps n so thin reps auto-shrink under the Rung 3 hierarchy.
- **He asked for the full likelihood table** (same as 7/05 — he likes the reference). Gave 13 rows:
  support / use / tell.
- **SWAPPED QUESTIONS AGAIN** on the duration rep — answered "seasonality, work vs non-work days" to an
  observation-layer question. Named the repeat and drew the two-slot picture: `mu_t = level+trend+
  seasonal+regressors` (where seasonality lives) vs `y_t ~ Dist(mu_t)` (the observation layer). Watch
  for this a third time; it's his most reliable failure mode.
- **Observation-layer retest #2 (time-to-resolution, hours): CLEARED COLD.** Gamma, then unprompted
  "negative values and constant variance." Added symmetry (mean>median for durations; a symmetric
  likelihood only fits the tail by inflating sigma, which then predicts negative hours — same failure).
  **Rung 13's stated gap is closed.**
- **Kalman filter taught (literacy):** predict → correct, gain K as a trust dial (obs noise R big → K→0
  keep the prediction; innovation Q big → K→1 believe the data). The payoff framing: it **marginalizes
  the whole latent state path** so NUTS samples only the variance params instead of a 1,100-dim
  correlated snake. Asked what that move was called on Rung 11 — **mechanism produced, word gone**
  ("when we multiplied a different distribution... the steps"). Vocab lag, exactly as recorded. Locked
  the parallel: discrete latent → sum, continuous state path → integral; linear+Gaussian is the one
  family closed under linear maps AND conditioning, which is *why* state-space models are stated that way.
- **He asked for the closed-form Kalman equations** — Phase-2 depth. Gave them explicitly flagged
  read-only/not-retested, one screen, with only K-as-trust-dial marked as the keeper. **This worked —
  no blow-up, unlike the 7/26 HSGP failure. The rule that distinguishes them: answering a Phase-2
  question he ASKS is fine; volunteering the machinery and then quizzing him on it is what broke him.**
- Counterfactual forecasting: he invoked /discretize ("toy example step by step"), got the 5-week
  walkthrough — fit → level path with promo stripped → replay with promo=0 → uplift 26 → once per
  posterior draw = a distribution. Exposition, not demonstrated.
- **REGRESSION on Rung 9.** Check: price was cut in the same weeks as the promo and is not in the model
   — is the 26 trustworthy? He said **"yes cause its observed."** Wrong, and it's the confounder/latent
  conflation flagged on 7/05 resurfacing. Locked the discriminator: **observed is not the test —
  "is it a term in the model" is.** Observed-but-omitted is exactly as broken as unobserved; being
  observed only helps if you use it. Omit the confounder → over-attribute (his own Rung 9 rule).

### 2026-07-27 (part 2) · 19 min · Rung 13 — identifiability, made visual + director drill
- **365-lengthscale retest: PASSED cold** ("it's modeling the year").
- **He didn't know what a pair plot IS** — asked directly, good question. Generated a 3-panel matplotlib
  figure (identified blob / non-identified ridge / Neal's funnel) and sent it to Telegram.
  **VISUALS ARE A REAL UNLOCK FOR HIM — he went from blocked to fluent immediately after seeing it.
  Generate diagnostic plots on demand for this topic; don't try to describe geometry in prose.**
  Reusable script: `projects/lessons/assets-pairplots.py` (needs a venv w/ matplotlib+numpy).
- **Post-image, answered the ridge question well:** more data "just magnifies the same shape" (correct —
  the ridge is structural, not sampling noise), and the fix is to "bake in more assumptions / change the
  model / decorrelate the terms" = priors + reparameterization, both unprompted.
- Taught: **structural vs weak non-identifiability**; the three levers (tight prior on sigma_trend /
  reparameterize as sum+ratio / **sum-to-zero on the seasonal component** — the named standard fix he
  didn't have); and the principle **non-identifiability is a property of the MODEL, not the data.**
- **Director drill on a fresh domain (daily ER admissions — deliberately not Mama Sita's).** Components
  correct cold: level, trend, seasonal, regressors, noise; weather as regressor; and BOTH seasonal
  periods unprompted (7-day weekly + yearly pollen/flu).
- **STANDOUT: he found the weather x yearly-seasonality collinearity himself**, one question before it
  was asked — "you won't know if the effect is the weather or the season." That is today's ridge lesson
  applied cold to a domain he'd never seen. Transfer is happening, not just recall.
- **GAP — the observation layer.** Asked for the count distribution he swapped questions and answered
  the confounding one instead. Had to be taught: log link + NegBinomial, the three Gaussian failures
  (negative predictions / constant variance vs var-grows-with-mean / additive when reality is
  multiplicative), overdispersion as the Poisson->NegBin tell. Heuristic given: **look at what the
  outcome physically IS — count, proportion, duration, strictly positive — before anything else.**
  He did NOT produce this; it is the retest target.


### 2026-07-27 · 11 min · HSGP check + state-space entry (Rung 13, partial)
- **HSGP literacy: PASSED cold.** Unprompted: "different representation using close-enough sine waves
  instead of the expensive n x n matrix compute, speed." Correct. Sharpened for him: Laplacian
  eigenfunctions, O(n^3)->O(nm), knobs m and c, and the referee item — **too-small m silently
  oversmooths short lengthscales**, no error thrown. Ask "what's your m vs the fitted lengthscale?"
- **The 7-day lengthscale hook: PASSED cold and fast.** Said it's modeling weekly cadence, so factor
  the assumption in explicitly and free the GP's flexibility for something else. Exactly right.
  Named the principle for him: a GP is a nonparametric stand-in for structure you DON'T know; known
  calendar structure goes in deterministically. Diagnostic tell he now owns: **a fitted lengthscale
  landing on 7/30/365 means the model is faking seasonality.**
- Then faded hard. The director drill (specify the replacement model) returned a garbled non-answer;
  micro-stepped to giving him the component list (level/trend/seasonal/regression/noise + innovation
  variance as the state-space part). He then asked what "fight over the same variance" meant —
  answered with the Monday +100 example, four identical-fit decompositions, ridge in the posterior,
  same fit / opposite forecast, fix = tighten the trend prior not collect more data.
- **CAVEAT: the entire back half was exposition. He demonstrated nothing on identifiability.** Do not
  count it as cleared — retest cold next session before moving on.
- Pace note: 3rd topic in one sitting (~42 min across all three). Drop-off was sharp and obvious;
  his ceiling looks like ~2 topics per sitting. Don't schedule a 4th.

### 2026-07-26 · 18 min · Rung 12 (GPs) — GP half cleared, HSGP over-taught and bounced
- Warm-up, both stale and both partial: non-centering ("adjusting the geometry so sharp peaks/valleys
  are more manageable") — right instinct, mechanism fuzzy; re-locked as **sever the dependency → the
  space is the same scale everywhere → ONE step size works**. LOO: he said "out of DISTRIBUTION data" —
  corrected to out-of-**sample** (same distribution; OOD is a different problem). Remembered there was a
  threshold number but not `k-hat` / >0.7. Vocab-lag pattern holding exactly as recorded.
- GP taught: regression forces a functional form → GP puts the prior on the FUNCTION; kernel sets
  covariance by distance → smoothness falls out; knobs = lengthscale (the knob), amplitude, kernel family.
- **Cleared cold:** soil-nitrogen → short lengthscale, with the right reason AND framed as "something
  you're forcing" (Rung 6 prior-as-assumption reflex, unprompted). Added both failure directions
  (oversmoothing vs chasing noise).
- **Missed:** GP on daily traffic with ~7-day lengthscale → he said "highly correlated across time, want
  a smoother kernel". Real answer: 7 days = day-of-week PERIODICITY the smooth kernel is faking; want
  Periodic (or Periodic × ExpQuad). Transferable tell taught: lengthscale landing near a calendar cycle =
  model the seasonality explicitly. Untested — retest next session.
- **BLEW UP — my miscalibration, not his.** I taught the HSGP bridge (fixed sine basis, weight variances
  from the kernel, "spectral density", "eigenfunctions of the Laplacian") — i.e. Phase-2 derivation
  material — to a stated Phase-1 LITERACY goal. He pushed back twice ("explain at my level, step by
  step"), I invoked /discretize and rebuilt it with 5-point numbers + the Cholesky→non-centering hook
  (`curve = L @ z` is Rung 7 with a matrix). He then asked the best question of the session — "what are
  we basing the assumptions on?" — which I answered (sines are generic/assumption-free; the assumption
  stays in kernel+lengthscale; lengthscale is still INFERRED, only the basis is precomputed). Landed
  briefly, then collapsed entirely on the retry of C/D: "i'm so fucking confused, i don't know what's
  going on." Withdrew both questions, reset HSGP to the one-sentence literacy version, ended session.
- Stopped at: HSGP = "GP too slow past a few thousand points; m = can capture faster wiggles, c = edge
  padding; too smooth → raise m." That is the entire Phase-1 requirement. Machinery deferred to Phase 2.
- Next: Rung 13 state-space, entered via the 7-day-periodicity hook (live, unresolved, his own miss).

### 2026-07-10 · 0 min · ABORTED — no content
- Timer was started (`session_start` 1783678684 = Jul 10 10:18 UTC) and the session never ran; no
  teaching happened and nothing was logged. Timer left running 16 days, cleared 2026-07-26.
- 0h credited — nothing was demonstrated. Recorded only so the gap in the log is explained.

### 2026-07-08 · 29 min · Marginalization remediation (Rung 11 follow-up) — cleared cold
- He opened with "still struggling with that last one" → full session of mapping reps, 5 fresh
  domains (ER waits, support tickets, loan defaults, vineyard fungus, noise complaints). No GPs.
- Reps 1–3 (mapping only): latent/data/w slots. Key correction rep 2: he justified the decoy
  (escalated y/n) as "unrelated to resolution time" — WRONG test. Locked the real discriminator:
  **latent vs data is about VISIBILITY, not relevance** — "is this column in my spreadsheet?"
  Rep 3 caught him listing only one of two recorded columns as data (default y/n is data too, even
  though the latent causes it — the outcome most caused by the latent always feels latent-ish).
- Rep 4 (equation): two slips — (w−1) for (1−w), and w·P(branch) instead of w·P(data|branch)
  (double-counts the branch, never touches data). "P(sugar|fungus) = ?" drew "no idea" → micro-step
  with numbers: it's a Rung-11 bell-curve lookup, height of Normal(15,2) at the observed 16. Landed.
- Capstone (noise complaints, no scaffolding): all five parts cold. Bonus: for "where does w come
  from" he gave the identifiability answer unprompted (branches predict different shapes → data
  forces w) — deeper than the asked-for "a parameter the model infers." Both now locked.
- Watch: (w−1) sign slip recurred twice; killed via "negative weight = nonsense" hook, but re-check.
- ~2 min GitHub PAT detour docked from timer.
- Next: Rung 12 GPs/HSGP for real this time; warm-up = funnel/non-centered (Rung 7) + LOO one-liner.

### 2026-07-05 · 35 min · Rungs 11 (likelihoods/GLMs) + 10 (model comparison), Rung 9 warm-up
- Warm-up (his own question): PyMC vs CausalPy vs pathmc — locked the discriminator: CausalPy =
  retrospective/design-based ("event happened, measure it"), pathmc = prospective/structure-based
  ("here's my DAG — simulate do(), check identifiability, stress unmeasured confounding"). Re-locked
  do-operator = arrow surgery (severs arrows INTO X). He nailed Ramadan=confounder; corrected his
  Q2 miss (distributor-bias worry → pathmc identifiability check, NOT CausalPy — no event to
  difference around). New pair taught: statistical (condition on the fork) vs surgical (randomize /
  do()) backdoor closing.
- Rung 11: likelihood matches data's shape (Normal/Student-T/Poisson/NegBinomial/Bernoulli table
  given at his request); Student-T robustness mechanism ✓ (his words: Normal forced to drag μ/σ
  toward spikes, T already prices them in); GLM = likelihood + link + linear part; log/logit links —
  no-link Poisson time bomb ✓ after correction (breaks on negative-line counterfactuals like
  spend→0, NOT on Christmas spikes); Bernoulli+logit blank-fill ✓.
- **Marginalizing discrete latents was a 3-round fight** — mixture equation and factory example both
  bounced; breakthrough came from micro-stepping (he spontaneously wrote full total-probability for
  the bike/drive setup — mechanics were never the block, the MAPPING was). Landed via the mapping
  table: latent = invisible cause / data = visible effect / w = its odds. His swap error (mapped
  hit-vs-miss to the DATA role) was the crux. Cleared the fresh-domain test (insurance fraud) incl.
  "odds = the thing we calculate" unprompted. Then asked THE question — "how do we get w without the
  labels?" → answered via bump-shapes forcing w, and the flip side: identical branch predictions =
  non-identifiable = pathmc's check = the true-demand-vs-skimming crux. Best moment of the session.
- Rung 10 (fast, 8 min): ELPD = predict-unseen score; LOO = extreme CV; PSIS-LOO = free from one
  fit; k-hat = per-point lie detector (>0.7 don't trust); diff vs 2×SE rule ✓ unprompted; tie →
  take simpler model; WAIC = older, prefer LOO; raw-likelihood-picks-overfitter one-liner ✓.
- **Feedback (durable): STOP re-skinning examples in Mama Sita's** — he wants brief, high-variance
  domains to avoid overfitting his assumptions. Frontmatter + Phase-2 note updated.
- Next: Rung 12 GPs/HSGP; warm-up = marginalization mapping on a fresh domain + LOO one-liner.

### 2026-07-05 · 14 min · Rung 9 (causal inference & DAGs) — the hardest rung, cleared
- Continued same-day from Rungs 6+8. Covered: data fits correlation, only the DAG encodes causal
  direction (arrows = your assumption). Confounder/fork (Promo←Season→Sales) = common cause, INCLUDE
  it (close the backdoor) or the treatment over-attributes. Collider (Quality→Shelf←AdSpend) = common
  effect, EXCLUDE it — controlling it invents a fake relationship between its causes. The asymmetry:
  confounder open-by-default (control closes), collider closed-by-default (control opens) — same action,
  opposite effect, so you MUST have the DAG. pm.do = intervention P(y|do(x)), severs incoming arrows =
  the real budget question vs contaminated P(y|x observed).
- He GOT the mechanisms cold (stated collider bias correctly unprompted; nailed both re-lock checks:
  omit confounder→over-attribute, control collider→invent relationship). Needed the "why is it *bad*"
  grounded in a concrete false-business-belief (quality & adspend look like substitutes) to click.
- Flagged (deferred to Phase 2): he kept conflating confounder (observed→include) with latent variable
  (unobserved→model). Both live in the DAG, different roles. Untangle when building Mama Sita's model.
- Next: Rung 11 likelihoods/GLMs.

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
