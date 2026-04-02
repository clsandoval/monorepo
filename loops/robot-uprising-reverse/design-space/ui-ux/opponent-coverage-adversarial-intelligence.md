# Opponent Coverage as Adversarial Intelligence

**Aspect:** 4.115 — Opponent coverage as adversarial intelligence: after a Gauntlet match, an optional "Opponent Coverage Estimate" panel showing the likely structural concentration of the opponent's config based on observable behavior — high concentration = one exploitable weakness; inferred from match replay analysis, not from running the opponent's config through full career analysis; interaction with 4.39 adversarial counterfactual and 4.65 pre-ranking poisoning

**Parent:** 4.68 — Coverage percentage as season health metric; 4.39 — Adversarial counterfactual mode
**Siblings:** 4.69b — Combined agent coverage score display; 4.65 — Pre-ranking adversarial surface
**Related:** 4.59 — Career minimum fix; 4.58 — Pre-ranking transparency panel; 2.12 — Deception signals; 7.10 — Config necropsy culture; 1.06c — Asynchronous PvP as design constraint

---

## The Core Concept

Career analysis produces a coverage score: the percentage of your recent matches that would have been improved by a single config change. High coverage means concentrated structural weakness — one element is your Achilles' heel. Low coverage means distributed robustness — no single element dominates your failures.

Your own coverage score is computed exhaustively. You run career analysis, it scans your match history, it finds the single element responsible for the largest share of losses.

But your opponent also has a coverage score. They also have structural concentrations, dominant failure modes, single elements that account for disproportionate shares of their losses. You have never seen that number. You never will — you do not have access to their career analysis history, and even if you did, you do not have the computational access to run career analysis on their config across their match history.

The Opponent Coverage Estimate solves a different problem than the adversarial counterfactual (4.39). Adversarial mode asks: "What single change to my opponent's config would have beaten me more decisively?" It runs simulations against a specific match. The Opponent Coverage Estimate asks a broader question: "Based on how my opponent's config behaved in this match, how concentrated is their structural weakness likely to be?" It does not identify the weakness. It estimates whether one exists.

This is the difference between a sniper scope and a thermal signature. The adversarial counterfactual is the scope — it finds the specific target. The coverage estimate is the thermal map — it tells you whether there is something worth aiming at.

### The Inference Method

The estimate is derived entirely from observable match behavior — the replay data that both players have access to after the match. No access to the opponent's career history. No simulation of their config across hypothetical scenarios. The inference uses three behavioral proxies:

**Proxy 1: State Concentration.** During the match, how many of the opponent's config elements exhibited high-volatility state changes versus stable behavior? If one element cycled through 14 distinct states while the others held steady, the config is likely structurally dependent on that element. High state concentration in one element correlates with high coverage — the element doing all the work is probably the element responsible for most failures.

**Proxy 2: Causal Chain Width.** How many independent causal chains led to the opponent's decisive moments? If the opponent's relay, scout, and striker all contributed to the outcome through three separate signal paths, the architecture is distributed — low estimated coverage. If every decisive signal flowed through a single relay before reaching any other agent, that relay is a bottleneck — high estimated coverage.

**Proxy 3: Recovery Pattern.** When the opponent's config was under pressure (contested zones, signal conflicts, buffer contention), how did it recover? Distributed architectures recover through multiple independent corrections — different agents compensating for different failures. Concentrated architectures recover through one mechanism — the same element stepping in every time. Repeated single-source recovery is a strong signal of structural concentration.

### Confidence Levels

The estimate is not a number. It is a confidence band.

**High confidence** (narrow band): The match ran long enough, with enough contested moments, that the behavioral proxies had sufficient data. The estimate reads: "Opponent Coverage Estimate: 55-65% — likely concentrated in RELAY-class element." Confidence is marked with a solid bar.

**Medium confidence** (wide band): The match provided some signal but not enough to narrow the range. The estimate reads: "Opponent Coverage Estimate: 30-60% — insufficient data to localize." Confidence is marked with a hatched bar.

**Low confidence / Inconclusive**: The match was too short, too one-sided, or the opponent's behavior was too uniform to generate meaningful proxies. The panel reads: "Insufficient match data for coverage estimate." No number is shown. The panel does not guess.

The confidence threshold is a function of match length, number of contested ticks, and the number of distinct opponent state transitions observed. Short stomps (EDT below 0.25) almost always produce low confidence — the opponent's config never had time to reveal its structural properties.

---

## Display Format

The Opponent Coverage Estimate appears as an optional panel in the Act 2 debrief, positioned below the adversarial mode toggle and above the standard results panel. It is collapsed by default — a single header line reading "Opponent Coverage Estimate" with a chevron to expand.

Expanded, the panel shows:

```
┌──────────────────────────────────────────────────────────────────┐
│  OPPONENT COVERAGE ESTIMATE                                      │
│                                                                  │
│  Estimated structural concentration: ████████░░░░  55-65%        │
│  Confidence: ██████████ HIGH                                     │
│                                                                  │
│  Behavioral basis:                                               │
│    State concentration:  High — RELAY-class element dominated    │
│    Causal chain width:   Narrow — single primary signal path     │
│    Recovery pattern:     Concentrated — same source, 4 of 5x    │
│                                                                  │
│  Interpretation: Opponent's architecture likely has a single     │
│  dominant weakness. Adversarial mode may find it with low        │
│  search cost.                                                    │
│                                                                  │
│  [Run Adversarial Mode →]                                        │
└──────────────────────────────────────────────────────────────────┘
```

The panel is color-coded by estimated concentration: amber-red for high coverage estimates (above 50% — concentrated, exploitable), neutral grey for mid-range (30-50% — ambiguous), and cool blue-green for low estimates (below 30% — distributed, resilient). The color is subtle — a thin left-border accent, not a full background wash. The intent is informational, not alarming.

---

## Player Journeys

### Journey 1: Scouting Before Committing — Yara, 31, Data Scientist, Specialist Tier

**Context:** Yara has been climbing the Specialist tier for three weeks. She runs adversarial mode selectively — it costs search budget (4.60), and she has learned to be strategic about when she spends that budget. She just won a match against an unfamiliar opponent, EDT 0.54. A contested match. She wants to know whether this opponent is worth adversarial analysis.

**Minute 0:00 — Act 2 Opens**

The debrief loads. EDT gold diamond at tick 65 of 120. Signal genealogy shows a complex mid-match exchange where Yara's scout detected a threat, relayed through her compression chain, and her striker responded with a burst that tipped presence score in her favor. Standard stuff. She glances at the "Opponent Coverage Estimate" header at the bottom of the panel. She clicks the chevron.

**Minute 0:15 — The Estimate**

The panel expands. Estimated structural concentration: 58-68%. Confidence: HIGH. Behavioral basis: the opponent's RELAY-class element accounted for 11 of the 14 state transitions observed in the contested window. Causal chain width: narrow — nearly every signal the opponent produced routed through the same relay before branching. Recovery pattern: concentrated — when Yara's striker created pressure at ticks 48, 55, and 62, the opponent's recovery each time originated from the same relay adjustment.

Yara reads the interpretation line: "Opponent's architecture likely has a single dominant weakness. Adversarial mode may find it with low search cost."

She considers. High coverage estimate means the adversarial explorer will probably find the attack vector quickly — the search space is concentrated, so even QUICK mode should surface it. Low search budget expenditure for a high-probability hit. She clicks "Run Adversarial Mode."

**Minute 0:45 — Adversarial Results Confirm the Estimate**

The adversarial explorer returns in four seconds — fast, as expected. One result: increasing the opponent's relay buffer from 5 to 6 would have changed the recovery dynamics at tick 55, cascading forward to reverse the presence score by tick 80.

Yara nods. The coverage estimate was right — concentrated weakness, easy to find. She files the result. If she faces this opponent again, she knows the relay is the pressure point.

**Minute 1:00 — The Strategic Decision**

Yara does not run "Find My Counter." She did not lose. The adversarial result tells her about the opponent's weakness, not her own. She makes a mental note: this opponent will either fix the relay weakness (in which case the next match is harder) or won't (in which case she can apply targeted pressure). She moves on.

**What this journey illustrates:** The coverage estimate as triage tool. Not every match warrants full adversarial analysis. The estimate lets the player decide where to spend analytical budget before committing. Yara used the estimate as a cost-benefit gate — high estimated concentration meant high expected return on adversarial analysis.

---

### Journey 2: Acting on a Wrong Estimate — Tomas, 24, Game Designer, Commander Tier

**Context:** Tomas is a meticulous player who logs every adversarial run. He keeps a spreadsheet of coverage estimates versus actual adversarial results. He has noticed the estimates are usually within 10 percentage points of the adversarial mode's actual findings — but not always.

He just lost a match to an opponent he has faced twice before. Both previous losses were close — EDT 0.58 and 0.62. He has run the coverage estimate on both previous matches: estimated concentration 25-40% both times. Medium confidence. Distributed architecture, hard to exploit.

**Minute 0:00 — The Third Match Coverage Estimate**

This match: EDT 0.67 — his worst loss against this opponent. He opens the coverage estimate panel. Estimated structural concentration: 22-35%. Confidence: MEDIUM. Behavioral basis: the opponent's state transitions were spread across four distinct elements. Causal chain width: wide — three independent signal paths contributed to the outcome. Recovery pattern: distributed — different elements compensated at ticks 30, 52, and 78.

The interpretation: "Opponent's architecture appears structurally distributed. Adversarial mode may require THOROUGH search to identify exploitable weaknesses."

Tomas trusts the estimate. He decides to skip adversarial mode — budget is tight before his next career analysis run. He focuses on his own config instead.

**Minute 1:00 — Three Days Later**

Tomas faces the same opponent a fourth time. Loses again, EDT 0.59. Frustrated, he overrides his usual protocol and runs adversarial mode in THOROUGH. It takes 22 seconds. Result: one element — the opponent's SCOUT attention filter — accounts for a clean flip in three of the four matches. Changing the filter threshold from 0.70 to 0.65 would have reversed the outcome in all three losses.

Coverage: the opponent's actual structural concentration was roughly 75% across the matches Tomas lost against them. The single-match behavioral estimate had been wildly wrong every time — 25-35% estimated versus 75% actual.

**Minute 2:00 — Why the Estimate Failed**

Tomas reconstructs: the opponent's SCOUT attention filter was a quiet element. Low volatility — it evaluated one rule per tick, producing binary outputs (pass/reject). Low state concentration — the binary output did not look like the dominant element. Its causal influence was real but *indirect*: the signals it rejected never reached the relay, so the relay appeared to be doing the work. The causal chain width looked wide because the downstream effects were distributed across multiple agents — but the upstream gate was a single chokepoint.

The behavioral proxies were fooled by an architecture where the critical element was a silent gatekeeper rather than a busy hub. The opponent had not intentionally poisoned their config (4.65). They simply had a config whose structural properties did not map cleanly onto the behavioral signals the estimate uses.

Tomas adds to his spreadsheet: "Coverage estimate unreliable for gatekeeper-pattern architectures. Silent binary filters produce low state concentration and low volatility but can still dominate coverage."

**What this journey illustrates:** The estimate is a heuristic built on observable behavior. It can be wrong — not just from deliberate poisoning, but from architectural patterns that naturally produce misleading behavioral signatures. The player must learn the estimate's failure modes through experience. The spreadsheet habit is the player teaching themselves the meta-lesson.

---

### Journey 3: Weaponizing the Opponent's Estimate — Lian, 27, Security Researcher, Overseer Tier

**Context:** Lian has read every design document she can find on the pre-ranking heuristic. She understands the three behavioral proxies that feed the Opponent Coverage Estimate. She has spent three sessions building a config specifically designed to produce a misleading coverage estimate for opponents who scan her.

Her config has a genuine weakness: her STRIKER's burst timing is off by 2 ticks against configs with relay compression chains. This accounts for roughly 60% of her losses. High coverage. Concentrated. Exploitable.

She has engineered a canary — a secondary RELAY-D element that serves no strategic purpose but is designed to produce extreme behavioral signatures: 18 distinct state transitions per match, active at the pivot tick window, recently modified (she tweaked its buffer size last session). The canary routes signals into a dead-end chain that resolves harmlessly.

**Minute 0:00 — The Poisoned Match**

Lian wins a match against a Commander-tier player, EDT 0.41. The opponent opens their coverage estimate panel. They see: Estimated structural concentration: 60-72%. Confidence: HIGH. Behavioral basis: RELAY-class element dominated with 18 state transitions. The estimate points directly at RELAY-D — the canary.

The opponent runs adversarial mode in QUICK. Pre-ranking surfaces RELAY-D as the top candidate. The adversarial explorer spends its budget probing RELAY-D variations. Results: "Increasing RELAY-D buffer from 6 to 7 would have allowed one additional signal to propagate through the secondary chain." The opponent reads this and thinks they have found the attack vector.

They have not. The secondary chain is a dead end. The real vulnerability — STRIKER burst timing — scores low on all three behavioral proxies. It is stable (2 state transitions per match), operates before the pivot tick, and has not been modified in five sessions.

**Minute 1:00 — The Next Match**

The opponent deploys a config tuned to exploit RELAY-D. They have added pressure hooks targeting the secondary chain, expecting to overwhelm Lian's relay capacity. Lian's RELAY-D absorbs all of it — it was designed to absorb pressure harmlessly. Meanwhile, her STRIKER's burst timing is unchanged, and the opponent, having focused their config changes on the wrong target, has not addressed the actual threat.

Lian wins again. EDT 0.33.

**Minute 2:00 — The Counter-Intelligence Lesson**

The opponent runs adversarial mode again — this time in THOROUGH, suspicious that the QUICK results were misleading. THOROUGH mode ignores the pre-ranking, testing all elements equally. In 35 seconds, it finds the real vulnerability: STRIKER burst timing. The opponent realizes they were poisoned.

They open the coverage estimate from the previous match. The estimate said 60-72% concentration in RELAY-class. The actual concentration was in STRIKER-class. The behavioral proxies were right about *concentration existing* but wrong about *where*. The canary had successfully redirected.

The opponent adjusts their pre-ranking weights (4.63), down-weighting volatility — the signal most easily faked. They make a note: "Lian runs canary configs. Always use THOROUGH against her."

**What this journey illustrates:** The coverage estimate is a surface that can be attacked. Players who understand the inference method can engineer configs that produce misleading estimates. This creates an arms race between estimation and counter-estimation — a layer of competitive depth that rewards understanding the system's internals. The counter is always available: THOROUGH mode bypasses the pre-ranking entirely. The cost is search budget. The meta-game question becomes: is the information advantage worth the budget?

---

## Strengths

**Bridges the gap between match-level and career-level analysis.** The coverage estimate gives the player a career-level intuition (structural concentration) from a single match's data. It is not as accurate as running full career analysis, but it is available immediately and cheaply.

**Creates a natural triage workflow.** Players cannot afford to run adversarial mode on every match. The coverage estimate provides the decision input: high estimate means adversarial mode is likely to find something quickly. Low estimate means the opponent is probably robust and adversarial mode may be a waste of budget.

**Teaches the concept of structural concentration without requiring career analysis access.** A player who has never run career analysis on their own config still encounters the coverage concept through the opponent estimate panel. The vocabulary — concentration, distribution, structural weakness — propagates through the competitive experience before the player formally encounters it in their own diagnostic tools.

**Adds a scouting dimension to competitive play.** Knowing that an opponent has concentrated structural weakness is actionable intelligence even without knowing the specific weakness. It changes how you build your config for a rematch: against a concentrated opponent, you try many different pressure vectors to find the one they are weak to. Against a distributed opponent, you optimize for general efficiency rather than targeted exploitation.

---

## Weaknesses

**Accuracy is fundamentally bounded.** The estimate uses behavioral proxies, not exhaustive simulation. It will be wrong. The failure mode in Tomas's journey — gatekeeper architectures that produce misleading behavioral signatures — is inherent to the method, not a fixable bug. Players must learn to treat the estimate as a probability, not a measurement.

**Susceptible to deliberate poisoning.** As Lian's journey demonstrates, the estimate inherits the same adversarial surface as the pre-ranking heuristic (4.65). Any player who understands the behavioral proxies can engineer a config that produces a misleading coverage estimate. This is a feature (competitive depth through deception) and a weakness (the estimate becomes unreliable at high tiers where poisoning is common).

**Information asymmetry concerns.** The estimate gives you intelligence about your opponent that they may not have about themselves — a player who has never run career analysis does not know their own coverage score, but their opponent can estimate it from a single match. This creates an uncomfortable dynamic where the observer knows more about the subject than the subject knows about themselves.

**Risk of over-reliance on a single match's data.** Coverage is a career-level metric. Estimating it from one match is inherently noisy. A player who makes strategic decisions based on a single-match estimate is building on sand. The panel should aggressively communicate its uncertainty — but players who see "55-65%, HIGH confidence" may not internalize that "high confidence" means "the proxies had enough data to produce a range" rather than "this number is accurate."

---

## Interaction Effects

**4.39 Adversarial counterfactual mode.** The coverage estimate feeds directly into the adversarial mode workflow. A high coverage estimate suggests that adversarial mode's QUICK search will succeed — the weakness is concentrated and therefore likely to be found within the pre-ranked candidate list. A low coverage estimate suggests THOROUGH mode is needed. The estimate becomes the input to the QUICK-vs-THOROUGH decision, replacing pure intuition with data.

**4.65 Pre-ranking poisoning.** The coverage estimate uses the same behavioral proxies that the pre-ranking uses — state concentration, volatility, causal chain width. If an opponent has built a poisoned config to fool the pre-ranking, the same poison will fool the coverage estimate. The two features share an adversarial surface. A player who detects poisoning in adversarial mode (THOROUGH results contradict QUICK results) should retroactively distrust the coverage estimate from that match.

**4.68 Coverage percentage as season health.** The opponent coverage estimate panel introduces the vocabulary of coverage to players who may not have run career analysis yet. When they later encounter their own coverage trend in the career analysis panel, the concept is already familiar: "Oh, coverage is the thing I estimated about my opponents — now I am seeing my own." The opponent panel serves as an implicit tutorial for the career-level metric.

**Matchmaking and architect profiles.** If the game tracks per-player coverage estimate history (the estimates others have produced about you), this creates a de facto scouting report. An opponent with consistently high coverage estimates across many matches is known to be structurally concentrated. This information could feed into matchmaking transparency — "Your next opponent has been estimated at high concentration by 4 of their last 6 opponents" — or it could be kept private. The privacy decision matters: public scouting reports change the meta toward deception configs. Private reports preserve the value of individual analysis.

**Deception strategies (2.12).** The coverage estimate adds another target for deception engineering. Beyond poisoning the pre-ranking heuristic, a player can now engineer their config to produce specific coverage estimate readings. A player who wants to appear distributed (low coverage) engineers multiple independent behavioral chains. A player who wants to appear concentrated (high coverage, but in the wrong element) engineers a canary. The estimate becomes a channel through which deception operates, alongside signal fidelity and hook behavior.

---

## Comparable Games

**Poker hand reading.** After a poker hand, an experienced player reconstructs their opponent's likely range based on observed betting patterns. The opponent's actual hand is revealed at showdown — but the *range estimate* is what guided in-hand decisions. The coverage estimate works identically: you observe behavioral patterns (betting = state transitions), you infer structural properties (hand range = coverage concentration), and the inference may be wrong because the opponent can deliberately misrepresent (bluffing = canary configs). The key parallel is that hand reading is a *skill* — it gets better with experience, and the best players read hands that others cannot.

**StarCraft scouting.** Early-game scouting in StarCraft reveals partial information about the opponent's build: number of barracks, gas timing, expansion placement. From these fragments, an experienced player infers the full build order and its weaknesses. The inference is probabilistic — the same opening can lead to multiple mid-game compositions. The coverage estimate works the same way: from partial behavioral data (one match), infer a structural property (coverage concentration) that requires far more data to compute exactly. StarCraft scouting is also gameable — proxy barracks, hidden tech switches — exactly as the coverage estimate is gameable through canary engineering.

**Fighting game adaptation.** In a best-of-three fighting game set, the second and third matches are shaped by the first. Players observe their opponent's habits — do they always wake up with a reversal? Do they jump when cornered? — and build a mental model of the opponent's tendencies. The model is not exhaustive; it is a coverage estimate in disguise. High coverage: "this player does the same thing in every situation" — exploitable. Low coverage: "this player mixes unpredictably" — must be outplayed generally rather than specifically. The FGC concept of "downloading" an opponent is precisely what the coverage estimate formalizes as a game system.

---

## Sensory Description

**The panel at rest.** Collapsed, the "Opponent Coverage Estimate" header sits below the adversarial mode toggle. The text is a muted warm grey — present but not demanding attention. A small radar-pulse icon sits to the left of the header, rendered as a single concentric arc. It does not animate until hovered.

**The expansion.** Clicking the chevron unfolds the panel downward. The radar-pulse icon completes a single slow rotation as the panel opens — a two-second sweep from 12 o'clock back to 12 o'clock. The concentration bar fills from left to right in sync with the sweep. The confidence indicator fades in a half-second after the bar completes. The behavioral basis lines appear one at a time, top to bottom, each preceded by a small dash-mark animation. The whole expansion takes three seconds. It feels like the system is assembling an intelligence report from fragments.

**The confidence indicator.** A horizontal bar below the concentration estimate. Solid fill for HIGH confidence — the bar is unbroken, steady, the color matching the concentration accent (amber-red, grey, or blue-green). Hatched fill for MEDIUM confidence — the bar is filled with diagonal lines, visually communicating incompleteness. For LOW/INCONCLUSIVE, the bar is absent — replaced by the text "Insufficient data" in italic warm grey.

**The concentration bar.** A horizontal segmented bar, 12 segments. Filled segments represent the estimated concentration range. A bar showing 7 of 12 filled segments with 1 additional segment in lighter fill represents "55-65%." The unfilled segments are dark, not empty — they read as "the rest of the architecture" rather than "nothing." The visual metaphor is a thermal scan: the filled segments glow warm (amber-red above 50%, neutral grey 30-50%, cool blue-green below 30%), the unfilled segments stay dark. You are reading heat.

**The behavioral basis lines.** Three lines, each prefixed by a small icon. State concentration: a cluster of dots (tight cluster = high, scattered dots = low). Causal chain width: parallel lines (few lines = narrow, many lines = wide). Recovery pattern: a single arrow (concentrated = one arrow, distributed = branching arrows). The icons are monochrome warm grey, not colored — the color information lives in the concentration bar above. The basis lines are explanatory, not emphatic.

**The "Run Adversarial Mode" call-to-action.** A small button at the bottom of the panel, styled to match the adversarial mode's amber-red. It only appears when the concentration estimate is above 40% and confidence is MEDIUM or higher. Below those thresholds, the button is replaced by text: "Coverage too distributed or uncertain for targeted analysis." This is not a hard gate — the player can still activate adversarial mode from the main toggle. The button is a convenience shortcut that only appears when the estimate suggests the analysis will be productive.

---

## New Aspects Discovered

- **4.116 — Cross-match opponent coverage aggregation**: tracking coverage estimates for the same opponent across multiple matches to refine the estimate — three matches against the same player produce a tighter confidence band than one; the opponent's coverage estimate becomes more reliable as you accumulate head-to-head data; interaction with rematch dynamics and persistent opponent identity
- **4.117 — Coverage estimate accuracy feedback loop**: after running adversarial mode, compare the actual structural concentration found to the estimated concentration — display "Estimate accuracy: estimated 55-65%, actual concentration ~62%" as a calibration signal; teaches the player when to trust the estimate and when to override it; interaction with 4.64 pre-ranking accuracy stat
- **4.118 — Silent gatekeeper detection heuristic**: a supplementary proxy designed to catch gatekeeper-pattern architectures that fool the standard behavioral proxies — track signal rejection rates (signals that entered an element and did not propagate) as a fourth proxy; high rejection rate + low volatility = likely gatekeeper; addresses the failure mode in Tomas's journey
- **4.119 — Coverage estimate as matchmaking signal**: using aggregate opponent coverage estimates (what others have estimated about a player) as a soft matchmaking input — matching high-concentration players against each other creates exploitable-vs-exploitable dynamics; matching distributed-vs-distributed creates grinding wars of attrition; the matchmaking layer responds to architectural diversity rather than just win rate
