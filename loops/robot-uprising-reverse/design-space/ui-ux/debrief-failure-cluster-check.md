# The "Failure Cluster Check" — Zero-Cost Pre-MSMFE Diagnostic

**Aspect:** 4.73 — The "Failure Cluster Check" zero-cost pre-MSMFE diagnostic: a free, instant analysis that classifies remaining failures as "clustered" (sharing a structural pattern — MSMFE likely to find a universal fix) or "distributed" (varied causes — MSMFE unlikely to help); teaches the player when exhaustive multi-scenario search is worth its cost; interaction with 4.36 MSMFE and 4.60 search budget.

**Parent:** 4.36 — Multi-Scenario Minimum Fix Explorer
**Siblings:** 4.60 — Search budget as player resource; 4.61 — QUICK vs. THOROUGH explainer
**Related:** 4.36 (MSMFE), 4.60 (search budget), 4.69i (combined coverage gate), 4.49 (cross-mission pattern detection)

---

## The Core Problem

The MSMFE (4.36) is the most expensive diagnostic in the game. Under the search budget resource model (4.60), it costs 3 tokens in the fixed-allowance variant or 40 credits in the earned-budget variant. It takes 42 seconds of Phase 2 wall-clock time, followed by minutes of Phase 3 background validation. It is, by design, the big gun — the one the player saves for the moment it matters.

But the MSMFE has a failure mode the player cannot predict without experience: **it only works when failures are clustered.** If 30 failing scenarios all share a common root cause — the same directional trigger assumption, the same buffer overflow condition, the same routing dead end — then the MSMFE will find the single config change that closes the cluster. That is what it is built for.

When failures are *distributed* — 30 scenarios fail for 15 different reasons, each affecting 2 scenarios — the MSMFE returns a flat list of marginal improvements. The top candidate resolves 4/30 failures. The second resolves 3/30. There is no dominant fix. The player spent 40 credits and 42 seconds to learn something they could have inferred for free: these failures have no common cause.

The problem is that the player cannot tell, before running the MSMFE, whether their failure set is clustered or distributed. The failure scenarios present as a wall of red — 30 red cells in the scenario grid, each showing a different final board state, each with its own failure tick and failure location. The human eye cannot, from the debrief screen, detect whether 22 of those 30 red cells share a hidden structural variable.

This is the information asymmetry the Failure Cluster Check resolves. It answers the question: **"Before I spend my expensive MSMFE tokens, is this failure set the kind that MSMFE is good at?"**

The answer is free. The answer is instant. The answer is binary: clustered or distributed. And it teaches the player, over dozens of uses, to develop their own intuition about failure structure — the same intuition a senior engineer develops after years of staring at test suite results.

---

## The Design

### The Clustering Algorithm

The Failure Cluster Check does not run any new simulations. It operates entirely on data the game has already computed during the initial scenario evaluation. When the player ran their 100-scenario robustness mission and 30 scenarios failed, the debrief system stored the following per-failure metadata:

1. **Failure tick** — the simulation tick at which the outcome diverged from passing
2. **Failure agent** — the agent whose action at the failure tick was most correlated with the bad outcome
3. **Failure variable** — the specific config element (trigger condition, buffer size, hook target, priority rule) whose value at the failure tick was most divergent from its value in the closest passing scenario
4. **Failure context** — the scenario parameters that distinguish this scenario from passing scenarios (enemy count range, approach direction, budget tier, timing offset)

These four dimensions define a **failure fingerprint** for each failing scenario. The Failure Cluster Check computes pairwise similarity across all failing scenarios using the fingerprint:

```
For each pair of failing scenarios (i, j):
  similarity(i, j) = weighted_match(
    agent_match:     0.35  (same failure agent?)
    variable_match:  0.35  (same failure variable?)
    tick_proximity:  0.15  (failure ticks within 10% of each other?)
    context_overlap: 0.15  (shared scenario parameters?)
  )
```

This produces a similarity matrix. The algorithm then applies single-linkage agglomerative clustering with a threshold of 0.60: scenarios whose similarity exceeds 0.60 are joined into the same cluster. The output is a cluster assignment for every failing scenario.

The classification rule:

- **CLUSTERED:** The largest cluster contains >= 50% of all failing scenarios. The MSMFE is likely to find a dominant fix.
- **PARTIALLY CLUSTERED:** The largest cluster contains 30-49% of failing scenarios. The MSMFE may find a useful but non-dominant fix.
- **DISTRIBUTED:** No cluster exceeds 30% of failing scenarios. The MSMFE is unlikely to find a high-impact single fix.

The entire computation runs in under 200ms on a 30-failure set. No simulations. No candidate evaluation. Just fingerprint comparison across already-stored metadata.

### The UI: The Cluster Gauge

The Failure Cluster Check appears as a widget in the debrief panel, positioned directly above the MSMFE launch button. It is always visible when the player has failing scenarios. It costs nothing. It runs automatically the moment the debrief loads — the player does not even need to click.

```
┌──────────────────────────────────────────────────────────────────┐
│  FAILURE CLUSTER CHECK                                          │
│                                                                 │
│  ████████████████████████░░░░░░░░  73% CLUSTERED                │
│                                                                 │
│  22 of 30 failures share a structural pattern:                  │
│  "Direction-specific trigger" — SCOUT-01 trigger fires only     │
│  for NORTH approach; south/east/west approaches unhandled.      │
│                                                                 │
│  ✓ MSMFE is likely to find a universal fix for this cluster.    │
│                                                                 │
│  [Run MSMFE — 3 tokens]                [Dismiss]                │
└──────────────────────────────────────────────────────────────────┘
```

When failures are distributed:

```
┌──────────────────────────────────────────────────────────────────┐
│  FAILURE CLUSTER CHECK                                          │
│                                                                 │
│  ████░░░░░░░░░░░░░░░░░░░░░░░░░░░  14% DISTRIBUTED              │
│                                                                 │
│  30 failures have no dominant pattern.                           │
│  Largest group: 4 failures (buffer exhaustion, COMMAND unit).    │
│  15 distinct failure causes detected across 30 scenarios.        │
│                                                                 │
│  ✗ MSMFE is unlikely to find a high-impact fix.                 │
│  Consider: QUICK-mode individual analysis on worst scenarios.    │
│                                                                 │
│  [Run MSMFE anyway — 3 tokens]         [Dismiss]                │
└──────────────────────────────────────────────────────────────────┘
```

The partially clustered state:

```
┌──────────────────────────────────────────────────────────────────┐
│  FAILURE CLUSTER CHECK                                          │
│                                                                 │
│  ████████████░░░░░░░░░░░░░░░░░░░  38% PARTIALLY CLUSTERED      │
│                                                                 │
│  11 of 30 failures share a pattern:                             │
│  "Routing dead end" — RELAY-B hook target unavailable            │
│  when STRIKER-B is destroyed before tick 40.                     │
│                                                                 │
│  ~ MSMFE may find a partial fix covering ~11 scenarios.          │
│  Remaining 19 failures are distributed across 9 causes.          │
│                                                                 │
│  [Run MSMFE — 3 tokens]                [Dismiss]                │
└──────────────────────────────────────────────────────────────────┘
```

### The Cluster Gauge Bar

The gauge bar is the centerpiece visual element. It is a horizontal bar, 280 pixels wide in the standard panel width, that fills from left to right proportional to the percentage of failures in the dominant cluster.

- **0-29% (distributed):** The bar is rendered in a cold steel-blue (`#5B7B94`). The filled portion is short, clearly under a third of the total. The bar pulses once, dimly, when it appears — a brief "scan complete" flash.
- **30-49% (partially clustered):** The bar is a muted amber (`#B8964A`). The filled portion reaches roughly the midpoint. A single slow pulse on appearance.
- **50-100% (clustered):** The bar is a warm signal-green (`#4A9B6E`). The filled portion dominates. Two pulses on appearance — the visual rhythm says "this is actionable."

The transition between categories is not hard-edged. The bar color interpolates smoothly across the full range, with the category labels ("CLUSTERED," "DISTRIBUTED") snapping at the thresholds. A failure set at 48% is visually almost identical to one at 52% — the color is nearly the same amber-green — but the label flips. This communicates that the thresholds are guidelines, not walls.

### The Cluster Description Line

Below the gauge, a single natural-language sentence describes the dominant cluster. This sentence is generated from the failure fingerprint data:

- The **failure variable** provides the noun: "Direction-specific trigger," "Buffer exhaustion," "Routing dead end."
- The **failure agent** provides the subject: "SCOUT-01," "COMMAND," "RELAY-B."
- The **failure context** provides the qualifier: "for NORTH approach," "when STRIKER-B is destroyed before tick 40," "in high-density enemy scenarios."

The sentence is templated, not generated by LLM. Templates:

```
"{cluster_label}" — {agent} {variable_description} {context_qualifier}.
```

Examples:
- "Direction-specific trigger" — SCOUT-01 trigger fires only for NORTH approach; south/east/west approaches unhandled.
- "Buffer exhaustion" — COMMAND buffer fills before tick 50 in scenarios with 8+ enemies.
- "Routing dead end" — RELAY-B hook target unavailable when STRIKER-B destroyed early.

### The MSMFE Cost Reminder

The cluster check widget always shows the MSMFE cost inline with its launch button: `[Run MSMFE — 3 tokens]`. This creates a natural decision moment. The player reads the cluster classification, sees the cost, and decides. In the distributed case, the button text subtly changes to `[Run MSMFE anyway — 3 tokens]` — the word "anyway" communicates that the system is advising against it without blocking the action.

The player is never prevented from running the MSMFE on a distributed failure set. The Failure Cluster Check is advisory, not gatekeeping. Experienced players may have reasons to override the advice — perhaps they suspect the clustering algorithm missed a subtle pattern, or they want to confirm their hypothesis that the failures are truly independent.

---

## Player Journey 1 — The Confident Spend

**Context:** Mid-campaign player, Chapter 4. Mission: Perimeter Defense robustness (80/100 pass gate). Current result: 68/100. 32 failing scenarios. Player has 7/12 THOROUGH tokens remaining.

**0:00 — Debrief loads.** The scenario grid appears: 68 green cells, 32 red cells. The red cells are scattered across the grid but the player notices a diagonal band of red in the south/east quadrant. They suspect a directional issue.

**0:02 — Cluster Check widget appears.** The gauge bar fills to 78%, glowing signal-green. The label reads: `78% CLUSTERED`. Below it: *"25 of 32 failures share a structural pattern: 'Direction-specific trigger' — SCOUT-01 trigger fires only for NORTH approach; south/east/west approaches unhandled."*

**0:04 — Player reads the recommendation.** The green checkmark line: *"MSMFE is likely to find a universal fix for this cluster."* The player glances at their token count in the header: 7/12.

**0:06 — Player clicks [Run MSMFE — 3 tokens].** The MSMFE launches. Token count drops to 4/12. The Phase 2 progress bar begins.

**0:48 — Phase 2 results arrive.** Top fix: SCOUT-01 trigger generalization, resolves 23/32 failing scenarios. The player's suspicion was right — the directional trigger was the structural cause. The Cluster Check's 78% prediction closely matched the MSMFE's actual resolution rate (72%).

**0:52 — Player applies the fix.** Pass rate jumps to 91/100. The remaining 9 failures are distributed (the Cluster Check for the residual set shows 22% DISTRIBUTED). The player decides not to spend another 3 tokens on the long tail — they're above the 80/100 gate. Mission passed.

**What the player learned:** The Cluster Check correctly predicted that the MSMFE would be productive. The 3-token spend was justified. The player begins to associate "high cluster percentage" with "good time to run MSMFE."

---

## Player Journey 2 — The Saved Tokens

**Context:** Same player, same chapter, next mission. Escort robustness (75/100 pass gate). Current result: 62/100. 38 failing scenarios. Player has 4/12 tokens remaining.

**0:00 — Debrief loads.** 38 red cells scattered evenly across the grid. No visible pattern. The player's gut says "this looks messy."

**0:02 — Cluster Check widget appears.** The gauge bar fills to 11%, cold steel-blue. The label reads: `11% DISTRIBUTED`. Below it: *"38 failures have no dominant pattern. Largest group: 4 failures (buffer exhaustion, COMMAND unit). 17 distinct failure causes detected across 38 scenarios."*

**0:04 — Player reads the recommendation.** The red X line: *"MSMFE is unlikely to find a high-impact fix. Consider: QUICK-mode individual analysis on worst scenarios."* The button reads `[Run MSMFE anyway — 3 tokens]`.

**0:06 — Player pauses.** They have 4 tokens left. The MSMFE would cost 3, leaving 1 for the rest of the chapter. The Cluster Check is telling them the spend is likely wasted. Seventeen distinct causes means the best fix might resolve 4 of 38 failures — barely moving the needle.

**0:08 — Player clicks [Dismiss].** They switch to QUICK mode and run individual analyses on the five worst-performing scenarios, spending 0 tokens (QUICK is free). Over the next four minutes, they identify three separate small fixes — each addressing 3-5 scenarios — and apply them manually. Pass rate climbs to 77/100. Gate cleared.

**0:12 — Mission complete.** The player still has 4 tokens for the chapter's final mission, which they suspect will be harder.

**What the player learned:** The Cluster Check saved them from a 3-token spend that would have yielded marginal results. They developed a manual debugging workflow (QUICK on individual worst scenarios) as an alternative to MSMFE for distributed failure sets. The Cluster Check taught them *when not to use the power tool*.

---

## Player Journey 3 — The Override

**Context:** Late-campaign player, Chapter 7. Gauntlet qualifying mission. 100-scenario robustness, 90/100 gate. Current result: 83/100. 17 failing scenarios. Player has 11/12 tokens.

**0:00 — Debrief loads.** 17 red cells. The player has been iterating on this mission for three sessions. They previously closed the direction cluster and the routing cluster. These 17 are the residual failures — the ones that survived both rounds of fixes.

**0:02 — Cluster Check widget appears.** The gauge bar fills to 29%, muted amber bleeding toward steel-blue. The label reads: `29% PARTIALLY CLUSTERED`. Below it: *"5 of 17 failures share a pattern: 'Late-tick priority inversion' — COMMAND priority queue reorders incorrectly when 3+ signals arrive in the same tick window."*

**0:04 — Player reads the advisory.** The tilde line: *"MSMFE may find a partial fix covering ~5 scenarios. Remaining 12 failures are distributed across 8 causes."* The player is 7 scenarios short of the 90/100 gate. Five scenarios from the cluster plus manual fixes for the remaining 12 might get them there.

**0:06 — Player runs MSMFE.** They have tokens to spare (11/12) and the partial cluster, while below the 50% "clustered" threshold, still represents 5 scenarios — enough to matter when the margin is 7. This is a strategic override: the Cluster Check said "partially clustered," and the player judged the partial cluster worth investigating given their tight margin.

**0:48 — MSMFE returns.** Top fix: COMMAND priority depth +1, resolves 5/17 failures. Pass rate would jump to 88/100. Not enough — still 2 short. Second fix: SCOUT-A timing offset -2 ticks, resolves 3/17 failures (partially overlapping with fix 1). Combined: 7/17 resolved. Pass rate: 90/100. Exactly at the gate.

**0:55 — Player applies both fixes.** 90/100. Gate cleared. The Gauntlet unlocks.

**What the player learned:** The Cluster Check's "partially clustered" verdict was accurate — the MSMFE found a real but non-dominant cluster. The player learned to read the partial state as "worth investigating if the margin is tight and tokens are abundant." The override was informed, not reckless.

---

## Player Journey 4 — The Intuition Builder

**Context:** New player, Chapter 2, third mission. 25-scenario robustness, 16/25 pass gate. Current result: 12/25. 13 failing scenarios. Player has 8/8 tokens (full budget, early chapter).

**0:00 — Debrief loads.** First time seeing more than 5 red cells. The player is overwhelmed by the wall of failures.

**0:02 — Cluster Check widget appears.** The gauge bar fills to 85%, bright signal-green with two confident pulses. Label: `85% CLUSTERED`. Description: *"11 of 13 failures share a structural pattern: 'Missing fallback' — RELAY-A has no fallback target when primary target is out of range."*

**0:05 — Player reads the description.** They don't fully understand "fallback target" yet — they're in Chapter 2. But the Cluster Check's language is concrete enough: RELAY-A has a problem, and it's the same problem in 11 of 13 failures. The green bar and checkmark communicate confidence.

**0:07 — Player clicks [Run MSMFE — 3 tokens].** They don't have a strong sense of token economy yet, but the green signal encouraged them.

**0:49 — MSMFE returns.** Top fix: Add fallback hook from RELAY-A to SCOUT-B. Resolves 11/13 failures. The player applies it. Pass rate: 23/25.

**0:52 — Player stares at the result.** One fix resolved 11 failures. They look back at the Cluster Check, which had predicted this. The connection forms: *"When the bar is green and high, there's a single fix hiding in the data."* This is the first seed of diagnostic intuition.

**What the player learned:** The Cluster Check planted the mental model that failure sets have *structure*. Sometimes most failures share a cause. The green bar predicted this. Over many missions, this association deepens into genuine diagnostic reasoning — the player starts to predict the Cluster Check's result before it appears.

---

## Strengths and Weaknesses

### Strengths

**Zero marginal cost to the player.** The Cluster Check never consumes tokens, credits, or time. It runs on pre-existing data in under 200ms. This is critical for its pedagogical function — a tool that costs nothing gets used every time, which means the player develops intuition through repeated exposure.

**Converts a vague decision into a legible one.** Without the Cluster Check, the decision to run MSMFE is: "I have failures. Should I spend tokens?" With it, the decision becomes: "I have clustered failures at 78%. Should I spend tokens?" The second question is answerable. The first is a coin flip.

**Teaches a transferable engineering concept.** The clustered-vs-distributed distinction maps directly to real-world test suite analysis. Senior engineers learn to look at a wall of failing tests and ask: "Is there a common cause, or are these independent?" The Cluster Check makes this professional skill an explicit, visible game mechanic.

**Creates a natural funnel toward MSMFE.** When the Cluster Check shows high clustering, the player is primed to run MSMFE. When it shows distribution, the player is redirected to QUICK-mode individual analysis. The game's diagnostic toolkit has a natural workflow: Cluster Check first, then choose your tool.

**Respects player agency.** The player can always override the advice. The "Run MSMFE anyway" button on distributed sets communicates that the system is advising, not gatekeeping. Expert players who disagree with the clustering algorithm — perhaps because they see a pattern the fingerprint comparison missed — can proceed without friction.

### Weaknesses

**The clustering algorithm can be wrong.** Fingerprint-based pairwise similarity is an approximation. Two failures might share the same failure agent and failure variable (high similarity) but have different root causes that require different fixes. The Cluster Check would classify them as clustered; the MSMFE would find that no single fix resolves both. False positive rate depends on fingerprint quality.

**The 50%/30% thresholds are arbitrary.** Why does "clustered" start at 50% of failures? Why not 40%? Why not 60%? The thresholds will need tuning based on playtest data. If the 50% threshold is too high, the player misses opportunities to run productive MSMFEs on moderately clustered sets. If too low, the "clustered" label becomes unreliable.

**Risk of over-reliance.** A player who trusts the Cluster Check completely will never run MSMFE on a distributed set. But some distributed sets contain small, high-value clusters that the MSMFE could find. A player who always follows the advice misses these opportunities. The "Run MSMFE anyway" button mitigates this, but behavioral design suggests most players will follow the default recommendation.

**Adds another widget to a crowded debrief panel.** The debrief screen already contains the scenario grid, the fix explorer, the signal genealogy, the scenario parameter panel, and the pre-ranking transparency panel. The Cluster Check adds a sixth element. Screen real estate in the debrief is finite. The widget needs to be compact enough to earn its space.

**The description sentence can be misleading.** The natural-language cluster description is templated, not analyzed. It says "Direction-specific trigger" because the failure variable is a directional trigger — but it does not verify that fixing the directionality is the actual MSMFE solution. The description is a label for the cluster, not a prediction of the fix. Players might conflate the two.

---

## Interaction Effects

### Interaction with 4.36 — MSMFE

The Failure Cluster Check is architecturally a **pre-filter for the MSMFE**. It uses Phase 1 data (the cluster identification pass that the MSMFE itself performs in its first 2 seconds) but runs it instantly on pre-existing metadata rather than waiting for the player to launch the full MSMFE pipeline.

This raises a design question: **should the MSMFE skip its own Phase 1 if the Cluster Check already ran?** The answer is no. The MSMFE's Phase 1 uses the full simulation data, not just the fingerprint metadata. The Cluster Check's fingerprint-based clustering is a fast approximation; the MSMFE's Phase 1 is a precise analysis. They may disagree — and when they do, the MSMFE's Phase 1 result takes precedence.

However, the Cluster Check result can **seed** the MSMFE's Phase 1 — providing an initial cluster hypothesis that the Phase 1 analysis can confirm or refine. This reduces Phase 1 time from 2 seconds to under 1 second in cases where the Cluster Check's hypothesis is correct.

### Interaction with 4.60 — Search Budget

The Cluster Check's primary economic function is **protecting the search budget**. Every distributed failure set that the player does not run MSMFE on saves 3 tokens (or 40 credits). Over a chapter with 8-10 missions, a player who uses the Cluster Check to triage might save 6-9 tokens — enough for two additional MSMFE runs on the missions where clustering is high.

This creates a positive feedback loop: the Cluster Check helps the player spend tokens wisely, which means they have more tokens for productive MSMFE runs, which means they get more fixes per chapter, which means they perform better, which (under Model B) earns more credits.

The interaction also has a balancing function. Under Model A (fixed weekly budget), the Cluster Check prevents the frustration of spending 3 of 7 tokens on a diagnostic that returns marginal results. Without the Cluster Check, the budget system punishes uninformed decisions. With it, the budget system rewards informed ones.

### Interaction with 4.69i — Combined Coverage Gate

The Cluster Check's clustering algorithm and the combined coverage gate (4.69i) both involve cluster detection, but they operate on different data and answer different questions. The coverage gate asks: "Is this multi-cluster detection flag a false positive?" The Cluster Check asks: "Is this failure set suitable for MSMFE?"

However, the two systems share a philosophical alignment: both exist to prevent the player from spending resources on diagnostics that will not yield actionable results. The coverage gate prevents false cluster flags from wasting the player's attention. The Cluster Check prevents distributed failure sets from wasting the player's MSMFE tokens. They are both **noise filters** at different stages of the diagnostic pipeline.

A future refinement could share clustering data between the two systems — if the career analysis detects a persistent cluster (4.69d) and the Cluster Check detects the same cluster in the current mission's failures, the Cluster Check could display a "recurring pattern" annotation linking to the career view.

### Interaction with 4.49 — Cross-Mission Pattern Detection

The cross-mission pattern detection system (4.49) identifies failure patterns that recur across multiple missions. The Cluster Check operates within a single mission. When the Cluster Check identifies a dominant cluster — say, "Direction-specific trigger" — and that same cluster label has appeared in the player's last three missions, the cross-mission detector can annotate the Cluster Check widget:

```
"Direction-specific trigger" — recurring pattern (seen in 3 of last 5 missions).
```

This transforms the Cluster Check from a single-mission diagnostic into a **career-level early warning system**. The player is not just seeing "your current failures are clustered" — they're seeing "your current failures are clustered in the same way your failures have been clustered for three missions." That is a stronger signal: the fix is not mission-specific, it is architectural.

---

## Comparable Games and Media

**Slay the Spire's damage calculator.** Before committing to a card play, the player can hover to see projected damage. The damage calculator is free, instant, and advisory — it tells the player "this is what will happen if you proceed." The Failure Cluster Check serves the same function: free preview of whether the expensive action (MSMFE) will be productive. Neither tool makes the decision for the player. Both reduce uncertainty at zero cost.

**Factorio's pollution map overlay.** Factorio lets the player toggle a pollution heat map that shows which areas of the factory are generating the most pollution and attracting biters. The map is free to view, always available, and helps the player decide where to invest their limited defensive resources. The Cluster Check is the equivalent overlay for failure data: where is the "pollution" concentrated? Is it one source (clustered) or diffuse (distributed)?

**IDE test runner summaries.** JetBrains IntelliJ, Visual Studio, and other IDEs show test suite results grouped by failure type. When 30 tests fail, the IDE often groups them: "18 failures: NullPointerException in DatabaseConnection.open()" and "12 failures: TimeoutException in APIClient.fetch()." This grouping is the same information the Cluster Check provides — it tells the developer whether there is a dominant failure pattern before they start debugging individual tests.

**Chess engine evaluation bars.** Modern chess interfaces show a position evaluation bar ("+2.3 for White") before the player makes a move. The bar is free, instant, and diagnostic — it tells the player the engine's assessment of the current position. The Cluster Check's gauge bar serves an analogous function: it is a quick visual read on the "health" of the failure set's structure, presented before the player decides whether to invest in deeper analysis.

**Medical triage color coding.** Emergency departments use red/yellow/green triage tags to classify patients by urgency before committing diagnostic resources (CT scans, MRIs, specialist consultations). The Failure Cluster Check's three-tier classification (distributed/partially clustered/clustered) mirrors this triage function: classify the failure set's amenability to treatment before spending expensive diagnostic resources.

---

## Sensory Description

### Visual Language

The Cluster Check widget occupies a 320x140 pixel region in the debrief panel, positioned between the scenario grid summary and the MSMFE launch controls. Its background is a slightly recessed panel — 2 pixels of inset shadow, darker than the surrounding debrief surface by approximately 8% luminance. The panel border is a single-pixel line in mid-gray (`#3D4450`), matching the debrief panel's standard chrome.

**The gauge bar** is the dominant visual element: 280 pixels wide, 12 pixels tall, with 2-pixel rounded corners. The unfilled portion is a dark neutral (`#2A2E35`). The filled portion uses the three-tier color system:

- **Distributed (0-29%):** Steel-blue fill (`#5B7B94`). Cold. Clinical. The color says "there is nothing here worth chasing."
- **Partially clustered (30-49%):** Muted amber (`#B8964A`). Warm but cautious. The color says "there is something here, but it is not dominant."
- **Clustered (50-100%):** Signal-green (`#4A9B6E`). Alive. Actionable. The color says "there is a target."

The fill transition is smooth — no hard color boundaries at the thresholds. At 45%, the color is a warm amber-green transitional hue. At 55%, it is a green with a faint amber warmth. The label text ("CLUSTERED," "DISTRIBUTED," "PARTIALLY CLUSTERED") snaps at the thresholds, but the visual gradient does not.

**The percentage number** is displayed at the right end of the gauge bar in the same color as the fill, 16px monospace weight. It updates in a rapid 400ms count-up animation when the widget first appears — the number rolls from 0% to its final value like a dial settling.

**The cluster description text** is rendered in the debrief panel's standard body font, 13px, light gray (`#B0B8C4`). The cluster label (e.g., "Direction-specific trigger") is rendered in the gauge bar's fill color and in medium weight — it stands out as the identifiable name of the pattern.

**The recommendation line** uses an icon prefix: a green checkmark (`#4A9B6E`) for clustered, a tilde (`#B8964A`) for partially clustered, and a red X (`#94525B`) for distributed. The icon is 14px, vertically centered with the text.

### Animation

**On appearance (debrief load):** The widget panel fades in over 300ms (opacity 0 to 1), then the gauge bar fills from left to right over 600ms with an ease-out curve. The percentage counter rolls up during the fill animation. The cluster description text fades in 200ms after the gauge bar finishes filling. The total entrance animation is 1100ms.

**Pulse on completion:** After the gauge bar reaches its final width, it pulses — a brief brightness increase of approximately 15% luminance, over 400ms, with an ease-in-out curve. Distributed sets pulse once. Partially clustered sets pulse once. Clustered sets pulse twice (400ms pulse, 200ms gap, 400ms pulse). The double pulse is a subtle urgency signal: "this is actionable."

**On dismiss:** The widget panel slides down by 8 pixels and fades out over 250ms. The space is reclaimed by the elements below it.

**On MSMFE launch:** When the player clicks the MSMFE button, the Cluster Check widget does not disappear. Instead, the gauge bar's fill transitions from its current color to a neutral mid-gray (`#606878`) over 400ms — a desaturation that communicates "this diagnostic has been consumed; the MSMFE is now running." The description text remains visible as reference while the MSMFE processes.

### Audio

**Gauge fill sound:** A soft ascending tone — a filtered sawtooth wave swept from 220Hz to 440Hz over 600ms, matching the gauge bar fill duration. Volume: 15% of master. The pitch ceiling varies with the cluster percentage: distributed sets sweep to 330Hz (a musical fifth, unresolved), partially clustered to 380Hz (approaching but not reaching the octave), clustered to 440Hz (the full octave, resolved). The player subconsciously associates the higher-pitched completion with a better diagnostic result.

**Pulse sound:** A single soft ping — a sine wave at the gauge's final pitch, 80ms duration, with a fast attack and medium decay. The ping coincides with the luminance pulse. Distributed: one low ping. Clustered: two higher pings. The double ping at the octave is satisfying. The single low ping is neutral.

**MSMFE launch confirmation:** When the player clicks the MSMFE button from the Cluster Check widget, a confirmation click sound — a sharp 40ms burst at 880Hz (one octave above the clustered gauge tone) — followed by the MSMFE's own processing hum beginning. The click bridges the Cluster Check's audio space into the MSMFE's audio space, connecting the two tools sonically.

**No sound on dismiss.** Dismissing the Cluster Check is a non-event. Silence reinforces that the player chose not to act — no fanfare, no penalty sound.
