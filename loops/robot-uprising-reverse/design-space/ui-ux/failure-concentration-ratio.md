# Failure Concentration Ratio as Advanced Coverage Metric

**Aspect:** 4.113 — The HHI-adjacent multi-candidate coverage distribution metric; sum of squared coverage percentages across top-5 candidates; distinguishes "one dominant weakness" from "several near-equal weaknesses at similar coverage level"; unlockable after 5 career analyses; the FCR as a more precise measure of architectural debt distribution than top-1 coverage alone

**Parent:** 4.10 — Coverage Percentage as Career Diagnostic
**Siblings:** 4.25 — EDT Trajectory as Career Metric; 4.26 — False Pivot Gap as Standalone Metric; 4.114 — Debt Diffusion Index (inverse FCR)
**Related:** 4.04b — Two-Act Debrief Structure; 7.10 — Config Necropsy as Community Artifact; 5.22 — The Gauntlet as Third Act; 4.18 — Effective Outcome Timestamp

---

## The Core Concept

After a career analysis, a player sees their coverage percentage: the fraction of recent failures attributable to the dominant config element. If your attention router fails in 61% of your losses, coverage = 61%. That number is useful. It tells you where to look first.

But coverage collapses a distribution into a single maximum. Two architectures can have identical top-1 coverage while having fundamentally different failure shapes:

| Architecture | Top-1 | Top-2 | Top-3 | Top-4 | Top-5 | What's happening |
|---|---|---|---|---|---|---|
| Config A | 61% | 12% | 10% | 9% | 8% | One catastrophic weakness. Everything else is background noise. Fix the router and 61% of failures disappear. |
| Config B | 25% | 23% | 21% | 18% | 13% | Five weaknesses, roughly equal. No single fix solves more than a quarter of failures. Systemic architectural debt. |
| Config C | 40% | 38% | 10% | 7% | 5% | Two co-dominant weaknesses. Fixing one shifts load to the other. Tandem repair required. |

All three architectures might show "Coverage: 61%" or "Coverage: 40%" — but the *shape* of the distribution underneath that number determines the correct repair strategy. Config A needs a targeted fix. Config B needs a redesign. Config C needs coordinated repairs across two subsystems.

The **Failure Concentration Ratio (FCR)** captures this shape in a single number. It is the sum of squared coverage percentages across the top-5 failure candidates, normalized to a 0.00-1.00 scale:

```
FCR = sum(coverage_i^2) for i = 1..5
```

Where each `coverage_i` is expressed as a decimal (0.61, not 61%).

**Config A:** FCR = 0.61^2 + 0.12^2 + 0.10^2 + 0.09^2 + 0.08^2 = 0.3721 + 0.0144 + 0.0100 + 0.0081 + 0.0064 = **0.4110**

**Config B:** FCR = 0.25^2 + 0.23^2 + 0.21^2 + 0.18^2 + 0.13^2 = 0.0625 + 0.0529 + 0.0441 + 0.0324 + 0.0169 = **0.2088**

**Config C:** FCR = 0.40^2 + 0.38^2 + 0.10^2 + 0.07^2 + 0.05^2 = 0.1600 + 0.1444 + 0.0100 + 0.0049 + 0.0025 = **0.3218**

The theoretical bounds: a perfectly concentrated failure profile (100% from one candidate) gives FCR = 1.00. A perfectly distributed profile (20% from each of five candidates) gives FCR = 5 * 0.04 = 0.20. Real architectures fall somewhere in between.

**FCR above 0.35:** Concentrated. One or two elements dominate your failure profile. Targeted repair is viable. The architecture has a clear structural bottleneck.

**FCR between 0.22 and 0.35:** Mixed. Some concentration, some spread. Probably two or three meaningful weaknesses with diminishing tail elements. Repair requires prioritization but no single fix is transformative.

**FCR below 0.22:** Distributed. Failures come from everywhere roughly equally. No single fix moves the needle more than marginally. This is either a well-balanced architecture that's uniformly near its limits, or a poorly-designed system failing in every dimension simultaneously.

The insight that separates FCR from top-1 coverage: **FCR tells you whether repair is surgical or structural.** Top-1 coverage tells you where to look. FCR tells you whether looking there is sufficient.

---

## The Formula's Heritage

FCR is a direct adaptation of the Herfindahl-Hirschman Index (HHI), the standard measure of market concentration in industrial economics. The US Department of Justice uses HHI to evaluate mergers: an HHI above 2500 (on a 10,000-point scale) indicates a highly concentrated market where a single firm dominates. An HHI below 1500 indicates a competitive market with many players sharing roughly equal market share.

The intellectual move is clean: replace "market share of firms" with "coverage share of failure candidates." Replace "is this market too concentrated for fair competition?" with "is this failure profile too concentrated for distributed repair?" The mathematics are identical. The interpretation inverts: in markets, high concentration is bad (monopoly). In failure profiles, high concentration is *actionable* — a concentrated failure is easier to fix than a distributed one.

This inversion is important for player psychology. In economics, HHI rising is a warning. In Robot Uprising, FCR rising is a *simplification* — it means your failure profile is becoming more legible, more fixable, more amenable to targeted repair. FCR falling is the subtle warning: your failures are becoming diffuse, and diffuse failures resist individual fixes.

---

## When FCR Unlocks

FCR requires 5 completed career analyses to unlock. This gate exists for three reasons:

**1. Statistical validity.** A single career analysis produces one coverage distribution. FCR computed from a single distribution is noisy — it reflects one match set, not a structural pattern. Five analyses produce five distributions, and the FCR shown is the average across the most recent five. This smooths noise and reveals structural tendency.

**2. Cognitive readiness.** A player who has run 5 career analyses has seen coverage percentages at least five times. They've developed an intuition for "my attention router keeps appearing at the top" or "it's different every time." FCR names what they've already been observing informally. Introducing it before this intuition exists would make it inert — a number without referent.

**3. Reward pacing.** Veteran players who have mastered top-1 coverage need a new diagnostic layer to remain engaged. FCR arriving at analysis 5 provides exactly this: a second-order metric that reframes everything they've been doing. The unlock moment should feel like gaining a new lens, not a new burden.

The unlock notification appears after the fifth career analysis completes:

> **New metric unlocked: Failure Concentration Ratio**
> Your failure profiles now include FCR — a measure of how concentrated or distributed your architectural weaknesses are. High FCR = one dominant weakness. Low FCR = many equal weaknesses.
> FCR: 0.34 (averaged across your last 5 analyses)

---

## Player Journeys

### Journey: Tomoko, 28, Methodical optimizer, 14 career analyses

**Context:** Tomoko has been running career analyses after every significant config change for six weeks. She understands coverage well — her attention router has appeared as the top-1 failure candidate in 9 of 14 analyses, always between 48% and 63%. She considers this her "known weakness" and has been iterating on the router design, shaving coverage down from 63% to 52% over three weeks.

**The unlock moment:**

After her 5th analysis, FCR appears for the first time. She sees: `FCR: 0.38`. She hovers. The tooltip explains the sum-of-squares formula. She looks at the distribution bar beneath it: a tall bar for her attention router at 52%, then four short bars between 8% and 15%.

She thinks: "OK, 0.38, concentrated. That matches — my router is still the big one."

She doesn't think much more about it. Coverage told her the same thing.

**Analysis 8 — The shift:**

Tomoko finally redesigns her attention router. A radical change: different priority queue, new signal weighting. She runs a career analysis on the first 20 matches with the new router.

Coverage: 31% (attention router, still the top-1 candidate). She frowns — 31% is lower than 52%, but it's still the dominant element. Has she improved, or just rearranged?

Then she looks at FCR: **0.24**.

She stares. Three analyses ago, FCR was 0.38. Now it's 0.24. The distribution bar has changed shape: the attention router bar is shorter, but the four bars behind it are *taller*. Buffer manager: 22%. Relay chain: 19%. Scout priority: 16%. Spawn timing: 12%.

The router isn't fixed. She *spread the debt.* The redesign solved the router's worst failure mode but exposed four secondary weaknesses that were previously masked by the router's dominance. Her architecture's failures are now coming from everywhere roughly equally.

**The diagnostic realization:**

"Wait. My coverage went from 52% to 31%, which looks like progress. But my FCR went from 0.38 to 0.24, which means... the remaining failures are more evenly distributed. I don't have one thing to fix anymore. I have five things to fix."

She opens her config notes and writes: "Router redesign succeeded mechanically but shifted failure distribution from concentrated to diffuse. Next step is NOT another router iteration — it's triaging the newly-exposed secondary weaknesses. FCR is saying: stop optimizing the biggest bar and look at the shape."

**The career arc shape:**

Over the next 4 analyses, Tomoko works on buffer management and relay chain timing. FCR moves: 0.24 -> 0.26 -> 0.29 -> 0.33. Coverage shifts: buffer manager rises to 38% as she fixes the other elements. She's *reconcentrating* her failure profile deliberately — eliminating the distributed weaknesses so the remaining debt consolidates into one fixable target.

The FCR trajectory tells the story: concentrated (router dominated) -> diffuse (router fixed, everything exposed) -> reconcentrating (secondary fixes consolidating remaining debt). This is the shape of systematic repair work, and FCR makes it visible.

---

### Journey: Amir, 35, Competitive Gauntlet player, 22 career analyses

**Context:** Amir is top-100 in the Gauntlet. He runs career analyses religiously. His coverage has been stable at 28-32% for weeks — no single element dominates his failure profile. He considers this a strength. His architecture is "balanced."

**The FCR challenge:**

FCR unlocked three weeks ago at 0.22 — low, distributed, matching his intuition that his failures are well-balanced. He wore this like a badge: "no single point of failure."

Then a Discord community member posts a thread: "Is low FCR actually good?" The argument: a player with FCR 0.21 and coverage 24% has no surgical repair path. Every fix improves things by at most 24%. Meanwhile, a player with FCR 0.42 and coverage 55% can fix one element and eliminate more than half their failures in a single iteration.

The thread concludes: "High FCR = easy to improve. Low FCR = near your ceiling OR fundamentally broken in every dimension. The metric doesn't tell you which."

Amir re-examines his profile. FCR 0.22. Win rate 61%. He hasn't improved his win rate in three weeks despite constant analysis. He's been tweaking every element by 1-2% and nothing moves the needle.

**The reframe:**

"My low FCR isn't balance. It's a plateau. I've optimized away every concentrated weakness, and what's left is a uniform field of small weaknesses that individually resist improvement. I'm at the local maximum of incremental repair."

He looks at Config C from a community necropsy — FCR 0.32, with two co-dominant weaknesses (40% and 38%). That player fixed both simultaneously and jumped 4 rank positions. The high FCR made the repair path legible.

Amir realizes he needs a structural change — not iterating on existing elements but replacing an entire subsystem to *create* a new concentrated weakness that he can then surgically fix. He tears out his relay chain and rebuilds it from scratch. First analysis post-rebuild: coverage 47% (relay chain), FCR 0.31.

He smiles. "Now I have something to fix."

**The community vocabulary:**

Amir posts: "Deliberately increased my FCR from 0.22 to 0.31 by rebuilding relay chain. Counterintuitive but necessary — low FCR was a plateau signal, not a health signal. Higher FCR = legible repair path. Currently at coverage 47% on the new relay, expect to drive that down to 25% over the next week, at which point FCR drops again and I reassess."

The thread gets pinned. "FCR plateau" becomes community vocabulary for architectures that are uniformly mediocre.

---

### Journey: Suki, 19, New to career analysis, 5 career analyses exactly

**Context:** Suki just completed her 5th career analysis. She's been playing for a month, entered the Gauntlet two weeks ago. She understands coverage as "the percentage next to the thing that keeps breaking." FCR just appeared on her analysis screen for the first time.

**First encounter:**

The unlock notification plays. A new row appears in her career analysis panel:

```
COVERAGE (TOP-1)        FAILURE CONCENTRATION RATIO
     54%                        0.37
  attention router          ||||.......
```

The bar beneath FCR is a miniature stacked visualization — five segments, the leftmost tall (attention router), the rest short. The whole bar glows faintly in a warm amber.

She hovers over FCR. Tooltip: "How concentrated your failure profile is. High = one dominant weakness (easier to fix). Low = many equal weaknesses (harder to fix individually). Computed from your last 5 analyses."

She reads it twice. Looks at the number: 0.37. Looks at the bar. The big segment on the left is obviously her router. The four small segments behind it are things she's never focused on.

She thinks: "So... 0.37 means my failures are pretty concentrated in one place? And that's... easier to fix?"

She looks at her coverage: 54%. Back at FCR: 0.37. She connects them: "My router is 54% of my failures. That's why FCR is highish. Most of my problems are in one place."

She doesn't change her behavior yet. She was already going to fix the router. But something shifts in how she thinks about it: fixing the router isn't just removing 54% of failures. It's going to *change the shape* of the remaining failures. The four small bars will grow proportionally. FCR will drop. The failure profile will flatten.

She doesn't have the vocabulary for this yet. But the visual — five bars, one tall, four short, and the knowledge that fixing the tall one will make the short ones grow — plants the seed of distributional thinking.

**Analysis 7 — The shape change:**

Two analyses later, she's iterated on her router. Coverage drops to 35%. She looks at FCR: 0.27. The bar has changed: the leftmost segment shrank, but the second and third segments grew. Buffer manager is now at 24%. Relay chain at 18%.

She types in her match notes: "FCR dropped from 0.37 to 0.27. Router is less dominant but now buffer and relay are showing up. Is that good or bad?"

She opens the tooltip again. Re-reads: "Low = many equal weaknesses (harder to fix individually)."

"Harder to fix individually. OK. So I fixed one thing and now I have two things. That tracks."

She doesn't know about Amir's "FCR plateau" concept yet. But she's reasoning about it independently. The metric is teaching her distributional thinking through repeated exposure and shape-watching.

---

## Strengths

**Distinguishes actionable from diffuse debt.** Top-1 coverage says "here's your biggest problem." FCR says "is fixing your biggest problem going to make a meaningful dent, or are there four more problems of nearly equal size behind it?" This distinction determines the correct repair strategy: surgical vs. structural. Without FCR, players discover this distinction by trial and error — fix the top-1 element, run another analysis, notice the second element is now almost as large. FCR lets them anticipate this before investing the repair work.

**Captures the full failure distribution in one number.** Five coverage percentages are hard to hold in working memory and harder to compare across analyses. FCR compresses the distribution shape into a single scalar that's directly comparable across time, across configs, across players. A player can say "my FCR was 0.38 last week and 0.24 this week" and immediately know the shape changed from concentrated to distributed, without remembering five individual percentages.

**Creates a meaningful career trajectory.** FCR over time tells a story that coverage over time cannot. Coverage trending down says "your biggest weakness is shrinking." FCR trending down says "your failure profile is flattening — either you're eliminating concentrated weaknesses or you're exposing distributed ones." The FCR trajectory reveals architectural maturation: the oscillation between concentrated (identifiable, fixable) and distributed (systemic, requiring redesign) is the rhythm of expert-level config development.

**Teaches distributional thinking.** Players who engage with FCR learn to think about failure distributions rather than failure instances. This is a transferable analytical skill — the same reasoning applies to incident postmortems, investment portfolios, and organizational risk assessment. The game teaches it through repeated visual exposure to the stacked bar and the single number.

**Reward for veteran engagement.** The 5-analysis unlock gate ensures FCR arrives when players are ready for it and hungry for it. By analysis 5, a player has seen the same element appear at the top multiple times. They're thinking "I know my router is the problem, what else is there?" FCR answers exactly this question at exactly the right moment.

---

## Weaknesses

**Cognitive load on introduction.** "Sum of squared coverage percentages" is not an intuitive formula. Players who hover over the tooltip and see the mathematical definition may feel alienated rather than informed. The tooltip should lead with the interpretation ("how concentrated your failures are") and offer the formula only on a secondary "how is this calculated?" expansion. The visual bar does more teaching than the number — but some players will fixate on understanding the math before trusting the metric.

**Ambiguity at low FCR.** Low FCR means distributed failures, but distributed failures can mean two very different things: (1) a well-balanced architecture that's uniformly strong and only failing at the margins, or (2) a poorly-designed architecture that's failing everywhere simultaneously. FCR doesn't distinguish between these cases. A player with FCR 0.21 and win rate 75% is in case 1. A player with FCR 0.21 and win rate 35% is in case 2. FCR must be read alongside win rate to be meaningful — and the UI should make this pairing visible.

**The 5-analysis gate may frustrate eager learners.** Some analytically-minded players will notice coverage distributions on their first or second analysis and want the concentration metric immediately. The 5-analysis gate will feel arbitrary to them. Mitigation: the stacked coverage bar (showing all five candidates, not just the top-1) should be visible from analysis 1. FCR is just the number that summarizes the bar — the bar teaches the concept before the number arrives.

**Squared percentages exaggerate concentration.** Because FCR uses squared terms, a single dominant element at 60% contributes 0.36 to FCR, while five elements at 12% each contribute only 0.072 total. This means FCR is very sensitive to top-heavy distributions and relatively insensitive to differences in the tail. A player who moves their top-1 from 60% to 55% sees a large FCR drop (0.36 to 0.30 from that term alone), while a player who eliminates their 5th-ranked element entirely (from 8% to 0%) barely moves FCR. This sensitivity profile is correct for the metric's purpose (distinguishing concentrated from distributed) but may feel unfair to players doing careful tail optimization.

**Not useful for configs with fewer than 5 failure candidates.** Some simplified architectures have only 2-3 config elements. FCR across the "top-5" would include padding zeros or require a different normalization. The formula should gracefully handle N < 5 by computing across however many candidates exist, but the interpretation changes: FCR for a 2-element architecture is always high (one of them must be dominant), which doesn't carry the same information as FCR for a 10-element architecture.

---

## Interaction Effects

### FCR + Coverage Percentile (4.10)

Coverage percentile tells a player "your dominant weakness is bigger than 73% of players at your rank." FCR adds a second dimension: "and your failure distribution is more concentrated than 81% of players at your rank." A player with high coverage AND high FCR has a single catastrophic weakness that's worse than most peers. A player with high coverage but LOW FCR has a dominant weakness AND several secondary ones — a deeper architectural problem than coverage alone suggests. The two metrics together create a four-quadrant diagnostic space:

| | High FCR (concentrated) | Low FCR (distributed) |
|---|---|---|
| **High coverage** | One catastrophic weakness. Fix it. | Dominant weakness + systemic issues. Redesign. |
| **Low coverage** | No single dominant weakness, but slight concentration. Fine-tuning territory. | Uniformly strong. Near ceiling or plateau. |

### FCR + Career Trajectory (4.25, eEDT)

eEDT tracks architectural improvement through match duration. FCR tracks architectural improvement through failure distribution shape. Together they tell a richer story: a player whose eEDT is rising (longer, more contested matches) while FCR is falling (failure profile flattening) is building a more complete architecture that's harder to defeat quickly but has no single catastrophic weakness left to exploit. This is the shape of a maturing architect.

Conversely, a player whose eEDT is falling while FCR is rising is developing a concentrated weakness that opponents are exploiting for fast wins. The eEDT/FCR divergence signals "something specific broke" — an alert to investigate.

### FCR + Architect Profiles

Different architect archetypes have characteristic FCR signatures:

- **The Specialist** (high FCR, 0.35+): Builds around one core strategy with known failure modes. When it fails, it fails the same way. Repair is targeted and predictable. These players iterate fast.
- **The Generalist** (low FCR, <0.25): Builds broad, balanced architectures with no single point of failure. Repair is slow and incremental. These players plateau earlier but are harder to exploit.
- **The Oscillator** (FCR swings between 0.20 and 0.40): Constantly rebuilding subsystems, creating new concentrated weaknesses, fixing them, exposing new ones. FCR trajectory looks like a sawtooth wave. These are the most active learners.

The architect profile could be detected from FCR trajectory and displayed as a career identity — alongside eEDT trajectory and win rate. "Specialist" is not better or worse than "Generalist" — but knowing which pattern you follow helps you choose repair strategies.

### FCR + Config Necropsy Culture (7.10)

Community necropsy posts gain a new shorthand: "FCR: 0.41 — single bottleneck analysis" or "FCR: 0.21 — systemic review." The FCR number in a necropsy header immediately tells readers what kind of analysis to expect. High-FCR necropsies are surgical case studies: one element, deep dive, specific fix. Low-FCR necropsies are architectural reviews: broad sweep across multiple subsystems, structural recommendations. The community learns to read FCR as a genre label for the necropsy that follows.

### FCR + Search Budget (4.112)

If career analyses consume a search budget resource, FCR helps players decide whether to spend budget on another analysis or on repair work. High FCR after an analysis says "you know where the problem is — go fix it, don't analyze further." Low FCR says "analysis revealed distributed debt — another analysis targeting a different match subset might reveal more structure." FCR becomes a meta-diagnostic: it tells you whether the analysis itself was productive enough to act on.

---

## Comparable Games and Media

### HHI in Antitrust Economics

The Herfindahl-Hirschman Index is the direct ancestor. When the DOJ evaluates a proposed merger, they compute HHI for the relevant market before and after the merger. An HHI increase of more than 200 points in a market with HHI above 2500 triggers antitrust scrutiny. The interpretation is mechanical: concentration above a threshold means one firm has too much market power.

FCR borrows the formula and inverts the valence. In economics, high concentration is a problem to be prevented. In Robot Uprising, high concentration is a *diagnosis to be acted on* — concentrated failures are fixable failures. The inversion means players develop an unusual relationship with concentration: they *want* to see FCR rise after a structural change, because it means the remaining debt has consolidated into something they can name and fix.

### Baseball Sabermetrics: OPS+ and the Composite Stat

Baseball moved from batting average (a single number capturing one dimension of hitting) to OPS+ (a composite of on-base percentage and slugging percentage, normalized to league average). OPS+ captures more of the hit-quality distribution than batting average alone. The transition from ".310 hitter" to "142 OPS+" was controversial — fans resisted the more complex metric — but it became standard because it was more predictive of run production.

FCR is the Robot Uprising equivalent of OPS+ relative to batting average: coverage is the simple single-number metric that everyone understands. FCR is the composite metric that captures more information but requires more interpretation. The adoption curve will follow the same pattern: initial resistance from players comfortable with coverage, gradual adoption by competitive players who notice FCR predicts repair outcomes better, eventual community standard vocabulary.

The key lesson from sabermetrics: **the composite metric must be displayed alongside the simple metric, not replace it.** OPS+ works because batting average is still shown on every stat line. FCR works because coverage is still the primary number — FCR is the advanced companion, not the replacement.

### Portfolio Theory: Diversification Measurement

In finance, portfolio concentration is measured by similar sum-of-squares metrics. A portfolio with 80% in one stock is "concentrated" — high expected return but high risk. A portfolio with 5% in each of 20 stocks is "diversified" — lower expected return but lower risk. The efficient frontier maps the tradeoff.

Failure profiles have an analogous frontier: concentrated failure profiles are easy to improve (high expected repair value) but fragile (if the fix doesn't work, no fallback). Distributed failure profiles are hard to improve (low expected repair value per fix) but robust (no single failure mode dominates). FCR maps where a player's architecture sits on this frontier.

---

## Sensory Description

### The FCR Display

The FCR number appears in the career analysis panel as a three-element cluster:

**The number:** `0.34` in a medium-weight sans-serif, 20pt, colored on a gradient from cool blue (0.20, fully distributed) through neutral grey (0.28) through warm amber (0.35) through deep red-orange (0.45+, highly concentrated). The color communicates concentration-as-heat: concentrated failures glow warm, distributed failures read cool.

**The stacked bar:** Directly beneath the number, a horizontal bar 240px wide shows the top-5 coverage candidates as proportional segments. The dominant segment is colored to match the FCR gradient. Secondary segments are progressively more desaturated. The bar has no borders between segments — they blend at the edges, giving the impression of a continuous distribution rather than discrete categories. For high-FCR profiles, the bar is visually dominated by one wide, warm segment with narrow cool slivers behind it. For low-FCR profiles, the bar looks like five roughly-equal segments in muted, similar tones.

**The trend arrow:** To the right of the number, a small arrow shows FCR change from the previous analysis. An upward arrow (FCR rising, concentration increasing) is drawn in amber. A downward arrow (FCR falling, distribution spreading) is drawn in blue. No arrow if the change is less than 0.02 — noise suppression.

### The Unlock Animation

When FCR first appears after the 5th career analysis, the stacked bar materializes first — the five coverage segments sliding in from the left, each one appearing with a soft click sound (the same tonal register as the eEDT spark-line unlock). The segments land in sequence, tallest first, each one a quarter-beat apart. After all five are placed, the bar pulses once and the FCR number fades in above it, taking 0.8 seconds to reach full opacity. A single line of explanatory text appears below: "Failure Concentration Ratio: how focused or spread your architectural weaknesses are."

The sound design is deliberately understated — five quiet clicks, a brief warm tone as the number appears, then silence. The unlock should feel like a new instrument panel lighting up, not a celebration. The information is the reward.

### The Comparison View

When a player opens their FCR history (available after 8+ analyses), they see a vertical timeline of FCR values, each one accompanied by its miniature stacked bar. The visual effect is a column of bars changing shape over time — tall-left-segment bars (concentrated) alternating with or transitioning to flat-equal bars (distributed). The shape progression tells the repair story at a glance: a sequence of tall-short-tall-short bars is an Oscillator architect. A sequence that trends from tall to flat is a Generalist converging on balance. A sequence that stays uniformly tall is a Specialist iterating on the same bottleneck.

The bars are spaced vertically with date labels on the left margin and FCR numbers on the right. No connecting lines — the visual rhythm of the bar shapes is the data. Hovering over any bar expands it to show the five candidate names and their coverage percentages.

---

## Open Questions / Discovered Aspects

**4.114 — Debt Diffusion Index as inverse-FCR complement:** Should the game display `1.00 - FCR` as a separate "diffusion" metric that measures how spread-out failures are? High diffusion = distributed debt = plateau risk. Naming the inverse separately creates vocabulary for the community: "my concentration dropped but my diffusion rose" is redundant mathematically but may be clearer linguistically for players who think in terms of "spread" rather than "concentration."

**4.115 — FCR-adjusted coverage as composite repair priority:** Multiply top-1 coverage by FCR to get "concentrated coverage" — a number that's high only when the dominant weakness is large AND the failure profile is concentrated. This composite would be a better predictor of repair ROI than either metric alone. How does it display? Does it replace coverage on some surfaces?

**4.116 — FCR divergence alert between Gauntlet tiers:** If a player's FCR is significantly different from the average FCR at their Gauntlet rank, is that diagnostic? High-ranked players with unusually low FCR may have hit the plateau that Amir discovered. Low-ranked players with unusually high FCR may be one fix away from a rank jump. Should the game surface "your FCR is higher/lower than typical for your rank" as a nudge?

**4.117 — FCR as config workshop filter:** When browsing community configs, can players filter by FCR range? A player looking for a "clean, fixable" config might filter for FCR > 0.35. A player looking for a "robust, balanced" config might filter for FCR < 0.25. This creates a new browsing dimension orthogonal to win rate and eEDT.

**4.118 — The FCR sawtooth as Oscillator identity:** Detecting and naming the sawtooth FCR pattern (concentrated -> fix -> distributed -> rebuild -> concentrated) as a formal architect archetype. Should the game detect this pattern and offer the "Oscillator" label as a career identity badge? What's the detection threshold?
