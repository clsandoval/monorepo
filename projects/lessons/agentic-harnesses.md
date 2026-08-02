---
type: lesson
topic: Frontier of agentic harnesses & agent frameworks
started: 2026-07-05
goal: Stay at the FRONTIER and be able to referee it. Not intro material — Carlos owns Daimon (a
  managed-agents platform, i.e. Multica's sibling). Mastery = carry a framework-agnostic set of DESIGN
  AXES in his head, so he can read ANY harness/framework (pi, Hermes, Multica, Claude Code, Codex, …)
  and instantly locate its bets, its tradeoffs, its failure modes — and steal/reject design ideas for
  Daimon on the merits. Critic IN, design judgment OUT.
level: EXPERT practitioner. Diagnostic was strong across the board — defined the model/harness
  boundary precisely AND found the contested edge himself (provider-side reasoning = opaque rented
  harness); carves the space by stack layer (engine/vehicle/platform); genuine critic (steelmanned
  Hermes then found two real failure modes cold — legibility/audit + multi-tenant scoping). Gap is
  NOT judgment — it's (a) legible NAMES for patterns he already reasons about, (b) the horizontal
  design-axes frame to compare same-layer engines, (c) currency on specific frontier frameworks.
hours_estimate: 45    # 25 critic track + ~20 builder extension (rungs 10–14, added 7/31 at his
  request — he wants to author a specialized harness, not just referee them). Weighted toward
  Rung 12 (verifier design). Moving target (field ships weekly).
hours_done: 2.5
next_up: Rung 6 mid-rung — resume on the OPEN QUESTION he paused on: the move that partly breaks the
  value/cost identity of delegation (shared addressable context / progressive disclosure across the
  agent boundary — he ships it for tools already), and what it costs (staleness, concurrent writes,
  the subagent still has to KNOW to look). Then the rest of Rung 6: orchestrator topologies
  (supervisor vs peer vs pipeline), who holds the plan when N agents run, and skill COLLISION
  (deferred twice now — it's the union problem, fold it in here). NAMING REP IS RETIRED — he pushed
  back hard on cold decontextualized recall ("weird thing to have to remember, there's no context")
  and he's right: attach names IN USE while he grades something, never as a quiz. Cold framework
  grade for next session: pick one from Devin/Amp neighbors — Cursor agents or Factory/Droid — or go
  straight to Rung 7 material. Note: timer showed 70 min wall-clock, async gaps again; logged honest
  20 min. This is now the norm for his sessions — always discount wall-clock.
---

# Frontier of agentic harnesses & agent frameworks

The "sharpen the critic" track, in Carlos's wheelhouse. Core thesis of the field (2026): frontier
models have converged, so **the harness is the differentiator**. This lesson builds the durable
analytical spine — the axes along which harnesses vary — and uses live frameworks as case studies.

## Roadmap (time-based, breadth-first — survey goal, so sweep shallow then deepen)
- [x] Rung 1 — Landscape & the core thesis: who's who (pi/earendil, Hermes/Nous, Multica, Claude
      Code, Codex, OpenCode, Aider…), and the harness-vs-model boundary (~3h) — pi/Hermes/Multica/
      Codex mapped on both axes; core thesis (harness > converged model) established
- [~] Rung 2 — The agent loop: control flow designs (ReAct vs plan-execute vs while-tools; stop
      conditions; who holds the plan) (~4h) — CORE SPINE CLEARED 7/27 (4 points, all self-produced).
      Remaining: concrete loop-shape reps on real frameworks; multi-agent/subagent loops untouched.
- [x] Rung 3 — Context & memory: window packing, compaction/summarization, procedural vs episodic
      memory, the rolling-window problem (~5h) — CLEARED 7/29. Full spine: belief-state frame, pinned
      prefix, destructive vs recoverable eviction, compaction's four pathologies, eager/lazy memory,
      authorship-not-category as the eager test, read gate + write gate. Cross-session memory owned.
- [x] Rung 4 — Tool interface: tool-calling API vs code-as-action (CodeAct) vs bash/computer-use;
      tool search/deferral (~4h) — CLEARED 7/31. Full spectrum owned: eager tax + affordance bias,
      deferral/progressive disclosure (ships it in Daimon), CodeAct = compiled plan, SEE/BOUND
      tradeoff, capability injection convergence, bash = CodeAct minus safety, computer-use = bash
      for screens.
- [x] Rung 5 — Skills & self-improvement (~4h) — CLEARED 7/31 pt2. Spine: skill = conditional with
      erased antecedent; three write-triggers (superstition / unverified necessity / curation=compaction);
      verifier design: write-time ablation, skill ships its check, CI-for-skills, checks-union = verified
      scope. Skill COLLISION deferred → fold into Rung 6 or 9.
- [ ] Rung 6 — Multi-agent orchestration: subagents, fan-out, delegation — when it helps vs hurts
      (the Daimon/Multica lens) (~5h)
- [ ] Rung 7 — Execution & safety: sandboxing, worktrees, permissions, VMs (~4h)
- [ ] Rung 8 — Evals: how you actually know a harness is good (SWE-bench, terminal-bench, harness
      ablations, the measurement traps) (~5h)
- [ ] Rung 9 — Frontier synthesis: read & referee 2-3 specific frameworks end-to-end against ALL
      axes; extract design moves for Daimon (~6h)

### Builder extension (added 2026-07-31 — goal upgrade: critic → author. Prereq: finish 5–9, esp. 8.
Core thesis: a specialized harness = domain verifier + domain-shaped context policy + opinionated
loop; everything else is commodity. ~20h, weighted toward Rung 12.)
- [ ] Rung 10 — The naked loop: a harness is ~300–500 lines around an API call (while-loop, tool
      dispatch, context assembly, stop condition). Read one for real (pi / Claude Agent SDK
      internals), then write a minimal one (~3h)
- [ ] Rung 11 — Context assembly as a compiler pass: emit the window every turn — system prompt
      layout, pinned prefix, and prompt-cache alignment (append-only prefixes, cache breakpoints;
      editing early context multiplies the bill) (~3h)
- [ ] Rung 12 — Verifier design: loop length is bounded by verifier quality, read forwards — for a
      specialized harness the verifier IS the product; niche domains get no free compiler/tests, so
      build the thing that tells the loop it's done (~6h)
- [ ] Rung 13 — State, resumability & interruption: checkpointing, journaling, crash recovery,
      mid-run steering, approvals — production harnesses are mostly this (~4h)
- [ ] Rung 14 — Eval-driven harness development: run your own ablations as the dev loop — change the
      harness, hold the model constant, measure; sits on Rung 8 (~4h)

## Sessions (newest at top)
### 2026-08-01 · 20 min (honest; timer showed 70 min wall-clock, async gaps) · Rung 6 — multi-agent (opened) + Amp cold
- **He killed the naming rep, correctly.** Verbatim: "why are you asking me what questions I asked...
  there's no context, what the fuck are you asking me." Cold decontextualized recall is the wrong
  exercise for a vocab-attachment gap — the names have to land while he's USING them on a live object.
  Rep retired; gave him the three names outright (SEE/BOUND, verifier-bounds-loop-length,
  authorship+review-decide-eager-lazy) and moved to application. Do not reinstate.
- **Amp cold (never used).** Oracle bet, self-produced and right: the loop fails at REPLAN time, not
  action time — "the executor has the reason and ends up making divergent decisions mid-execution."
  That's his own Rung 2 heuristic (when may it revise?) one level down; the Oracle makes replanning
  explicit, expensive and out-of-band vs ReAct's implicit-every-turn-for-free. Gifted two he missed:
  (1) no hands = you can afford to trust it less (advice is defeasible, actions aren't — same gradient
  as checkless-skills-are-advisories from Rung 5); (2) **the Oracle gets a CLEAN WINDOW** — part of
  what "call the smarter model" buys is the fresh context, not the model. Testable ablation: same
  model, curated question, polluted vs clean window. Harness-side explanation for a model-side myth.
- **Subagent SEE:** he got the core — summary is lossy, what survives depends on what you chose to
  persist, "if you write into a file you can't return it because it's summarized." Named for him:
  **A SUBAGENT IS A COMPACTION WITH A DIFFERENT LABEL** — every Rung 3 pathology applies across the
  agent boundary (drift, biased erosion, tense bug, and laundering). Parent can't distinguish "I
  verified" from "I inferred." His 7/29 provenance line is the diagnosis: a subagent report is
  INJECTED, so provenance is erased by construction. His file instinct is the fix = output should be
  an ARTIFACT not a message (parent holds a pointer, raw work stays addressable) — his own eager/lazy
  rule one layer up. Design question it becomes: does a subagent return conclusions or citations?
- **Delegation loss case — he answered "its exact context" in three words, which is the right answer.**
  Payload delivered on top: **the value of delegation and the cost of delegation are the same
  quantity** (the saving IS the untransferred context, so there's no free-isolation dial); the parent
  is the wrong author for the handoff (lossy compression written by the one party that can't tell
  what's load-bearing — rhymes with his 7/29 model-compression counterpoint); **pruning doesn't
  transfer** (subagent rediscovers approach B the parent killed; fan-out re-explores pruned branches
  N times); **integration can't arbitrate** (N coherent contradictory reports, parent watched none of
  the work, picks the confident one — assertion-vs-citation as a selection bug). Rule landed:
  **fan-out wins when subtasks are context-poor and verifier-rich; loses when context-rich and
  verifier-poor.**
- Stopped at: mid-rung, on the open question (shared addressable context as the partial fix). His
  call — jumped to the PyMC track.
- Next: that open question, then orchestrator topologies + skill collision.

### 2026-07-31 (pt 2) · 28 min (honest est; timer showed 6.4h wall-clock, async gaps) · Rung 5 — skills (CLEARED) + Devin warm-up
- **Naming rep: 3 of 6.** Got reversibility-vs-containment, perimeter-vs-working-set, permissions
  (≈action-surface half). MISSED SEE/BOUND — his first coined lens, failed two sessions running —
  plus verifier-bounds-loop-length and authorship-decides-eager-lazy. Keep the rep; demand SEE/BOUND.
- **Warm-up, Devin cold** (never used; described mechanically). Spectrum: "full person at a computer"
  — right bet-read; sharpened to spans-bash-AND-pixels, timeline-replay = compensating SEE mechanism
  (flight recorder when you can't bound). Codex comparison: found network-on as the dial, produced
  keeper line "the boundary isn't what you define, it's what's accessible by the internet, which is
  anything." Gifted browser-vs-curl (rendered composite of unenumerated third-party content; ingress
  of instructions + egress of data in one tool). Knowledge-vs-Playbooks: passed Playbooks correctly,
  wrongly passed Knowledge on "human-gated" — missed that thumbs-up-at-write-time ≠ review, and
  auto-injection violates his own authorship rule.
- **Antecedent erasure (rung core):** asked what the confirmed note is missing — gave "temporal
  context" + "identity" (two instances); named the general form for him: the ANTECEDENT/validity
  condition. Skill = induction from n=1 stored as universal. Staleness = condition was true, world
  changed; wrong-generalization = condition never held but context looks similar. Key mechanism:
  retrieval fires on surface similarity but validity depends on antecedent → lookalike contexts are
  when the wrong skill looks most relevant (grounds his 7/29 "lazy fixes noise not wrongness").
- **Three write-triggers:** #1 at-friction — he reused antecedent point; gifted the distinct failure:
  SUPERSTITION (writes last-thing-tried at moment of max relief / min understanding; store fills with
  failure-shaped knowledge only). #2 at-success — he claimed "strictly better than #1" (success ⊇
  overcome frictions); refereed: fails on credit assignment. #3 offline curation — he gestured
  (bias, noise, "result leaks into predictors"); delivered the payload: CURATION IS COMPACTION of the
  skill store — merge erases antecedents (n conditionals → one unconditional), biased erosion drops
  specifics which ARE the antecedents, merging launders citations (undoes his cited-proposals move),
  plus delay.
- **HE PUSHED BACK TWICE and built the last third of the rung doing it (catches #6, #7):**
  - #6: "a good distiller can tell which steps mattered, come on, be realistic" — conceded the
    strawman half (proximate legible chains attribute fine), held the core: A SINGLE TRAJECTORY
    CONTAINS ZERO COUNTERFACTUALS; necessity needs ablations never run; distiller substitutes prior
    for experiment (= his PyMC omitted-confounder setup, cross-track rhyme flagged). Sharpened claim:
    attribution reliability inversely correlated with skill value (skills worth storing are the
    surprising ones = where the prior is wrong).
  - He doubled down: "Fable will run the ablation, it's a smart model" — flipped it: run it WHERE?
    Transcript has no environment; ablation needs repro env + checkpointed state + pass/fail check =
    A VERIFIER LOOP. "Smart model" is a model-side answer to a harness-side problem (course thesis).
    In losing the argument he answered the open verifier question.
  - #7: "ship the check inside the skill — if the skill is general enough that makes no sense" —
    correct; forced the refinement: A SKILL'S VERIFIED SCOPE IS THE UNION OF ITS CHECKS; beyond that
    is prior, not knowledge. Gradient: narrow skills get check-per-skill; general skills are EARNED
    (born narrow, generalization = accumulated independent instances each with check+citation =
    merge with preserved antecedents); checkless skills are advisories (defeasible, lazy, human-gated).
- **Verifier design (rung summit, assembled):** (1) write-time ablation — necessity demonstrated not
  asserted; (2) skill ships its check = antecedent made executable; (3) staleness = re-run the check,
  CI for the skill store, skills retire themselves; (4) telemetry for the checkless residue. His
  7/29 (a)/(b) split appeared 3× today.
- Stopped at: Rung 5 summit clean. Skill collision NOT covered (deferred).
- Next: Rung 6 multi-agent (his home turf — Daimon lens), Amp as cold grade, SEE/BOUND naming rep.

### 2026-07-31 · 22 min · Rung 4 — tool interface (CLEARED) + OpenCode warm-up
- **Warm-up, OpenCode cold** (never used; described mechanically). Graded 1 & 2 correctly — "liberal,
  nothing assumed, dials not assumptions" = the Claude-Code-family bet. **Missed plan mode** even though
  it was in the description — but when pointed at it, his own 7/27 criterion graded it instantly
  (in-context, no artifact → plan-execute in disguise). LSP-eager call correct WITH the right rule
  (deterministic-verifier authorship → safe to eager-push, his own 7/29 authorship rule); missed the
  filter/noise referee question (400 diagnostics mid-refactor → recency dominance). Gifted:
  shareable server-side sessions = his SEE lens shipped as a feature.
- **Tool cost:** answered with Daimon's fix instead of the failure — he already ships tool search +
  an eager cluster manifest, i.e. progressive disclosure rederived in production. Missed the
  model-side cost under infinite context; claimed orthogonality is "on the MCP implementation" —
  countered with the **composition/union argument** (each vendor designs locally; the collision space
  is the union nobody designed; the harness is the only party that sees the set → harness owns the
  namespace; collision surface enumerable offline = his own 7/29 move one level down). Second cost
  delivered: **schemas are affordances, not data** — visible tools shift the action policy even when
  no tool is right.
- **HE FACT-CHECKED ME (5th referee catch across both tracks):** "Toggl doesn't have an MCP server,
  their API is shit, I built my own." Correct — and the correction PROVED the thesis: Daimon's tools
  are orthogonal because ONE author (him, harness-side) designed the whole surface. He's the
  existence proof of harness-owns-the-union, not the counterexample. Own these instantly, as always.
- **CodeAct:** produced the real discriminator cold — deterministic known-steps → script,
  unknown intermediate steps → reason between calls. Named for him: that's **compiled plan vs ReAct**,
  Rung 2's "when may it replan" one level down (a script's answer: never, until exit). **Vocab lag
  explicit and verbatim: "I don't know what axes you're talking about" — about his OWN coined
  lenses.** He reasons with them and can't reach for the names; add a naming rep per session.
  Missed the working-set demolition (framed context-transit as a *benefit*); delivered: model doing
  group-bys in tokens = learning what arithmetic already knows (same-day rhyme with the bear-model
  offset).
- **SEE/BOUND on CodeAct:** got both, thin (permission scope harder; "look at logs and files").
  Sharpened: structured ledger vs forensic archaeology; "may run code" = one permission containing
  all permissions. Then delivered the frontier synthesis — **capability injection**: sandbox with no
  ambient access, action surface = the injected bindings → tools recreated inside the interpreter →
  the two designs CONVERGE (control plane = tool calls, data plane = code over scoped bindings).
- **Bash graded well by him:** unbounded catch-all, harness gives up bounding at grant-time, and his
  own observation that bash subsumes everything ("treat the MCP server as an API and script it").
  Named: **bash = CodeAct minus the safety features (ambient authority vs injected capability)**;
  Claude Code's containment must live AROUND bash because it can't live inside it. Computer-use
  one-liner: bash-for-screens, worst SEE/BOUND, exists because most software has no API.
- **Spectrum slogan:** structured calls → injected capabilities → bash → pixels; power up, SEE/BOUND down.
- Stopped at: Rung 4 summit, clean. His call.

### 2026-07-29 (part 2) · 14 min · Design dialogue — applying Rung 3 to Daimon's MCP read tools
- He drove this one entirely; came back unprompted with three ideas after the session closed. Confirms
  the pattern: the rung lands, then he immediately re-derives it against his own system. Best mode for him.
- **His idea 1 — compression improves with model capability** (missing-letters analogy; intent gaps vs
  pattern gaps). Counterpoint issued and it's the sharpest thing I gave today: reconstruction is
  interpolation, so **model-driven compression works on exactly the tokens that don't matter and fails on
  exactly the ones that do** — the anomaly is by definition unpredictable from the pattern, and a BETTER
  model papers over it more smoothly. Same phenomenon as erosion-keeps-narrative. Argues for structural
  eviction over semantic eviction.
- **His idea 2 — the lazy read path confers epistemic status.** This was genuinely good and I didn't have
  it. Named: **retrieval carries provenance, injection erases it.** It's the de-laundering mechanism for
  the compaction-launders-speculation problem from part 1. Caveat issued: the effect is weak, models don't
  reliably treat retrieved content as more defeasible — make it structural (source+timestamp+query in the
  envelope, staleness policy in the pinned prefix, and STOP pre-injecting MCP resources).
- **His idea 3 — the real problem he brought:** Daimon's internal memory is gated by PR review, but the
  MCP read tools (Toggl, HubSpot) are not, and the "tribal knowledge" of those platforms is inaccessible.
  - Reframe given: he was conflating two unknowns. **(a) tool competence** (how to drive the API — static,
    vendor-side, VERIFIABLE) vs **(b) org semantics** (what a label means at a tenant — per-tenant,
    undocumented, UNVERIFIABLE). One gate can't serve both.
  - (a): his own 7/27 rule applies — verifier exists (golden questions vs read-only account), so the loop
    can run. Bottleneck isn't the gate, it's evidence-to-propose. Gave the friction-mining list: retry/
    reformulation, empty-read→abandonment, over-fetch, tool oscillation, and **conversational repair**.
    Pushed repair hard as denser than thumbs — frequent, specific, adjacent to the failing call, already
    in his transcripts.
  - (b): the crux question I posed — how do you detect ambiguity when the model isn't confused? Answer
    given after he swung: **you don't detect it, you enumerate it.** Every ambiguous value is an
    ORG-DEFINED LABEL (tenant-typed strings: stages, custom fields, tags, project names) vs vendor-defined
    fields which mean what the docs say. Walk the schema → that list IS the complete ambiguity surface,
    computed offline, zero model uncertainty. Unknown-unknowns → known-unknowns mechanically.
  - **His counter was better than my question**: the answers are already in their Discord archive. Fused
    into a pipeline: enumerate → rank by telemetry + distribution anomalies → resolve via `archive_recall`
    (targeted, not open RAG) → ask human only for the residue → merge to tenant pinned prefix, TENANT
    reviews (no cross-principal coupling, per his 7/05 thesis).
  - Architecture upgrade delivered: **cited proposals make the review gate cheap.** Link the Discord msg /
    schema row / stat, and review drops from "is this true" to "yes that's right" — which directly attacks
    the review-throughput bound he accepted as a permanent cost on 7/05. Provenance showed up 3× today from
    3 directions; that's the through-line of the whole session.
- Shipped: pymc-labs/daimon-internal#815 with the full (a)/(b) split, provenance section, and a 7-item
  work breakdown.

### 2026-07-29 · 18 min · Rung 3 — context & memory (CLEARED) + Codex cloud warm-up
- **Warm-up, Codex cloud** (had to describe it — he'd never heard of it; framework currency is the real
  gap, not judgment). Graded it correctly cold: containment not reversibility, and correctly read the bet
  ("you already have perfect instructions or you trust the container context"). Named ingress/egress as
  what the network cut governs.
  - Correction issued: the network cut bounds **blast radius**, not action surface — behavior inside is
    totally unbounded, it just doesn't matter because the container is disposable. Containment of
    *consequences* vs containment of *behavior*, both sold as "sandboxing."
  - Gifted: no-network = no untrusted content enters mid-run = prompt-injection surface amputated. That's
    a *reason* for the isolation, not a side effect.
  - **New axis named — perimeter vs working set.** Two things people both call "bounding context." Codex
    bounds the perimeter (one container, network off) and the working set NOT AT ALL. Aider is the exact
    inverse: perimeter wide open, working set hand-curated via /add. Different dials → Codex is a genuine
    third position, which was his instinct before he talked himself out of it.
- **Eviction taxonomy** — produced 3 of 4 unprompted: sliding window, targeted deletion (and split it
  himself into deterministic vs model-driven — that's the real "who chooses what dies" axis), and
  summarization. Named for him: positional eviction / targeted eviction (tool-result nulling is the
  production version) / compaction.
- **Belief-state frame delivered**: the window IS the agent's belief state; context management is not an
  efficiency problem, it's a belief-management problem. Ask "what must it still believe at turn 40" and
  pinning falls out. Gave the pinned-prefix / middle / tail window shape.
- **Goal drift, cold**: instantly saw sliding window evicts the task itself — "before you know it you're
  chasing the newest big thing." Named recency dominance, and connected it to the ReAct drift he
  diagnosed cold on 7/27 — same mechanism, he'd already seen the symptom.
- **Compaction pathologies**: produced both halves of the text failure himself with a good illustration
  (1..10 → 1,4,7,9,10). Named drift + erosion; gifted the two non-obvious parts — compaction **launders
  speculation into fact** (provenance dies with the raw turns), and erosion is *biased*, keeping narrative
  and dropping specifics, which is backwards for a coding agent. Timing failure he only half-got; gifted
  the tense bug (in-flight intent → past tense → "all set!" on unfinished work) and the two platform costs
  (evals non-comparable; incidents irreproducible because compaction erases its own forensic trail).
- **Slogan landed**: checkpoint at task boundaries, not token boundaries. He'd derived the same
  requirement on 7/27 from re-injection cost — flagged the two-independent-paths convergence to him.
- **Cross-session memory — his best work.** Gave the principle unprompted and correctly: pin invariants,
  everything else accessible but not resident. Named eager vs lazy memory; flagged that this is his 7/05
  "automatic compounding is a bug" thesis one scale down — 3 sessions, 3 entry points, same spine.
- **Hermes learned-skill-docs referee (closing)**: said lazy, with the right reason ("not all frictions
  encountered are invariant" = a skill is a conditional). Then **inverted what gets pinned on his own** —
  eager-load the store's protocol and retrieve/update/create tools, lazy-load the skill bodies. That is
  progressive disclosure / the actual Anthropic skills design, rederived cold. Told him so (currency win).
  - Gap closed for him: lazy fixes NOISE, not WRONGNESS — a bad skill retrieved at the moment it looks
    relevant is worse than one sitting unread. Missing half is his own 7/05 answer: **read gate = lazy,
    write gate = reviewed PR into a versioned store.** Both required, different problems. He has now
    derived both halves of Daimon's memory architecture independently, 3 weeks apart.
  - Rule to carry: the memory *category* never decides eager-vs-lazy. **Authorship and review decide it.**
- Stopped at: end of Rung 3, clean summit. Answers got terse in the middle third (voice input, likely
  mobile) — pushing through was correct, the closing two answers were the strongest of the session.

### 2026-07-27 (part 2) · 15 min · Rung 2 — the agent loop (core spine cleared)
- Ran Aider-vs-Claude-Code (human gate vs while-tools) as the live hook. Every payload below was HIS,
  named by me after the fact — the Socratic-first protocol is confirmed as the right mode for him.
- **Human gate tradeoff:** got control/safety vs autonomy immediately, then found the hard
  discriminator himself — **CI**. Correctly framed it as a capability line, not a preference.
- **Verifier as the human's replacement:** ranked the substitute ladder unprompted — prompt guidance
  weakest, hooks middling, "at the end of the day the only thing you can do is tests and verification
  criteria." Named for him: **loop length is bounded by verifier quality**, and why coding agents ran
  ahead of all others (free verifiers: compiler/types/tests/lint).
- **Loop shapes:** picked plan-execute as worse on long tasks. Premise correction issued — plan-execute
  DOES observe, it just won't REVISE; the failure is commitment, not blindness. Referee heuristic given:
  ask *when is it allowed to replan*, not whether it observes.
- **ReAct failure, cold:** "jitter, drift, and lumps tend to go narrowly into one path" — that's
  goal drift + depth-first tunneling from firsthand observation. Named both.
- **Closing question landed perfectly:** cost of re-injecting a plan every turn → he said context bloat
  AND staleness if the plan needs to change, concluding "plans should be written to an artifact with
  guarantees, not just context storage." That's the callback (read-only re-injection = plan-execute in
  disguise) plus the design requirement (the artifact must be MUTABLE) in one answer.
- Spine now owned: control flow / who holds the plan / stop condition = verifier / mutable artifact.
- PACE CORRECTION from the user: he wants 20-30 min PER TOPIC, not short rounds. The earlier read that
  he fades after ~2 topics was WRONG — he re-engaged completely and produced his best work of the day
  in part 2. Do not cut sessions short on a perceived fade; push.

### 2026-07-27 (part 1) · 6 min · Aider case study — bounding axes (22-day gap)
- Warm-up: graded Aider cold on his two coined lenses. Had to describe Aider first (never used it):
  manual /add context curation, tree-sitter repo map ranked by centrality, SEARCH/REPLACE text edits
  (not tool-calls), architect/editor split, git auto-commit as state layer, turn-based + human gate.
- First answer "yes to both, relies on git" — collapsed both lenses onto one mechanism. One counter-
  question (what does a commit actually PREVENT?) and he self-corrected immediately and unprompted,
  landing on the right answer: the real bound is /add, i.e. control over surface area of actions.
- **Two reusable axes named** (exactly the vocab gap his level note calls out):
  1. **Reversibility vs containment** — recovery-after vs prevention. Harnesses market #1 as #2.
  2. **Context surface vs action surface** — separately bounded. Aider bounds context (manual /add),
     leaves actions unbounded (arbitrary shell via test/lint). Claude Code is the near-exact inverse:
     unbounded autonomous search, bounded per-tool permission gates.
- Daimon tie-in: multi-tenant needs BOTH surfaces bounded; neither single-user design is a template,
  and git-style reversibility is worthless as a tenancy answer.

### 2026-07-05 · 22 min · Diagnostic + Rung 1 (landscape)
- Covered: full diagnostic (nailed model/harness boundary + found the provider-reasoning edge;
  carves space by stack layer; strong critic — steelmanned Hermes, found audit + multi-tenant
  failure modes cold). Rung 1 landscape: pi (engine/SDK), Hermes (vehicle, SQLite+skills+curator),
  Multica (platform, workspace-scoped skills, runs the others as agents), Codex (isolated sessions,
  OS sandbox) mapped on engine/vehicle × design axes (context/memory, tools, self-improvement).
- Design dialogue: pressure-tested his Daimon vision against the field. His architecture =
  COMPOSITION over inheritance (agent = fully-materialized bundle; no shared mutable memory → both
  failure modes dissolve). Propagation = git PRs to pinned repos (reuses version control as the
  compounding substrate — audit + scope + revert for free). Residual cost he accepted on purpose:
  compounding bounded by review throughput; long-tail cheap learnings re-paid every session.
- Coined TWO reusable referee lenses (his own, from the diagnostic): "can I SEE it (audit/
  provenance)?" + "can I BOUND it (scope/tenancy)?". Closing thesis: in a multi-team non-flat org,
  automatic compounding = a bug (uncontrolled cross-principal coupling); explicit reviewed transfer
  = the feature.
- Stopped at: end of Rung 1, design loop closed. Next: Rung 2 agent-loop shapes.
- Next: warm-up = apply the two lenses to a NEW framework (OpenCode/Aider), then Rung 2 control flow.
