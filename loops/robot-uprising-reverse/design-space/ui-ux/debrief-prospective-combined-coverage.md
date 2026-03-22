# Prospective Combined Coverage — Forward-Looking Ceiling Estimates

**Aspect:** 4.69q — Prospective combined coverage: computing the combined coverage not from match history but from a simulated future match set based on the player's current config and upcoming opponents; forward-looking vs. historical ceiling estimates; interacts with scenario fingerprinting (2.28); the difference between "this agent failed here" and "this agent will likely fail there."

**Parent:** 4.69 — Agent multi-cluster detection in career analysis
**Siblings:** 4.69b — Combined coverage display; 4.69r — Coverage sensitivity to window size; 4.69a — Multi-cluster threshold configurability; 4.69d — Multi-cluster persistence tracking
**Related:** 2.28 — Scenario fingerprinting; 4.59 — Career minimum fix; 4.36 — Multi-scenario fix explorer; 4.68 — Coverage percentage as season health; 4.60 — Search budget as player resource

---

## The Core Problem

Every coverage metric in the Inspector is a **postmortem**. The career analysis runner-up list says "RELAY-C was causal in 62% of your last 45 losses." The combined cluster coverage (4.69b) says "fixing all RELAY-C elements would have addressed 71% of those losses." Both are backward-looking. They describe the wreckage behind the player. They do not describe the road ahead.

This matters because the player's next 20 matches are not drawn from the same distribution as their last 45. The Gauntlet matchmaking ladder adjusts. New opponents enter the bracket. The scenario mix shifts as the player progresses through campaign tiers. A cluster that explains 71% of historical losses may explain 30% of future losses — or 90%. The backward-looking ceiling is a fact about the past masquerading as a prediction about the future.

The prospective combined coverage system replaces the question "what would have helped?" with "what will help?" It takes the player's current config, the detected multi-cluster, and a **simulated future match set** drawn from the player's upcoming matchmaking context, and computes the combined coverage against that projected set. The result is a forward-looking ceiling estimate: "if you fix all three RELAY-C elements, your projected coverage against likely upcoming opponents is 58%."

The gap between historical and prospective coverage is the design's core information payload. If historical coverage is 71% and prospective coverage is 58%, the player learns that their RELAY-C weakness is **partially environment-specific** — 13pp of the historical ceiling came from opponents or scenarios they are unlikely to face again. If historical is 71% and prospective is 84%, the weakness is **getting worse** — future opponents will exploit the RELAY-C architecture even harder than past ones did.

This is the difference between an autopsy and a prognosis. The autopsy tells you what killed the patient. The prognosis tells you what will kill the patient next.

---

## The Design

### The Simulated Future Match Set (The "Forecast Deck")

The prospective coverage system generates a synthetic match set called the **Forecast Deck**. The Forecast Deck is not real matches — it is a collection of 30-50 simulated confrontations drawn from the player's probable near-future matchmaking context.

The Forecast Deck is constructed from three sources:

**Source 1 — Matchmaking Projection.** The matchmaking system provides a probability-weighted list of likely next opponents based on the player's current ELO band, recent trajectory, and active season. If the player is at ELO 1340 and climbing, the projection skews toward 1350-1400 opponents. If the player is plateau'd at 1340, it samples broadly across 1300-1380. The system draws 15-25 opponent configs from this distribution.

**Source 2 — Scenario Fingerprint Distribution (2.28).** The upcoming campaign tier or Gauntlet bracket has a known scenario-type distribution. If the next bracket features 40% Relay Flood, 30% Ambush Corridor, and 30% Standard Patrol, the Forecast Deck allocates its simulated matches proportionally. This is where 2.28 scenario fingerprinting directly feeds prospective coverage — the fingerprint taxonomy defines the scenario types, and the bracket metadata defines their expected frequencies.

**Source 3 — Adversarial Drift Extrapolation.** The system examines the player's last 10-20 opponents and identifies trending config patterns — are opponents increasingly running high-hook-density configs? Are flash-shield strategies rising in the bracket? The drift extrapolation nudges the Forecast Deck toward the emerging meta, not just the static matchmaking table. This is lightweight trend detection, not predictive AI — it counts "X% of recent opponents ran strategy Y" and extrapolates linearly.

The Forecast Deck is generated on-demand, not pre-computed. It takes 2-4 seconds to construct (mostly spent on the 30-50 quick simulations against projected opponents). The result is cached for the session — re-opening the prospective panel does not re-generate the deck unless the player explicitly refreshes it.

### The Prospective Coverage Computation

Once the Forecast Deck exists, the prospective combined coverage computation mirrors the historical version (4.69b) exactly — but runs against the synthetic match set instead of the historical match set.

For each multi-cluster member, the system simulates the player's current config *with that element fixed* against each Forecast Deck match. It records which simulated matches flip from loss to win. Then it unions the flip sets across all cluster members. The result is the prospective combined coverage percentage.

```
Historical combined coverage (last 45 real matches):
  RELAY-C cluster (3 elements) → 71% coverage (32/45 matches addressed)

Prospective combined coverage (Forecast Deck, 40 simulated matches):
  RELAY-C cluster (3 elements) → 58% coverage (23/40 matches addressed)

Delta: -13pp
Interpretation: RELAY-C fixes are less impactful against projected future opponents.
               13pp of historical coverage was environment-specific.
```

### The Delta Display — "The Drift Gauge"

The prospective panel's signature element is the **Drift Gauge** — a horizontal bar that shows historical coverage on the left and prospective coverage on the right, connected by a colored gradient.

```
┌──────────────────────────────────────────────────────────────────────┐
│  RELAY-C — Prospective Coverage Analysis                            │
│                                                                      │
│  Historical ceiling:  ████████████████████████████████░░░░░░  71%   │
│  Prospective ceiling: ██████████████████████████░░░░░░░░░░░░  58%   │
│                                                ◄── -13pp ──►        │
│                                                                      │
│  Drift Gauge:  [COOLING ▼]  Weakness is environment-specific.       │
│                                                                      │
│  Forecast Deck: 40 simulated matches                                │
│    Relay Flood (16)  •  Ambush Corridor (12)  •  Standard Patrol (12)│
│    Avg opponent ELO: 1,372  (your ELO: 1,340)                       │
│                                                                      │
│  [Regenerate Forecast →]  [View Match-by-Match →]  [Close]          │
└──────────────────────────────────────────────────────────────────────┘
```

The Drift Gauge has three labeled states:

- **COOLING** (prospective < historical by 5pp+): The weakness is losing relevance. Future opponents are less likely to exploit this cluster. The gauge bar turns **slate blue**, tapering rightward. The label says "Weakness is environment-specific" or "Weakness is receding."
- **HOLDING** (prospective within +/- 5pp of historical): The weakness is stable. What hurt you before will hurt you again. The gauge bar is **amber**, flat. The label says "Weakness is persistent."
- **HEATING** (prospective > historical by 5pp+): The weakness is getting worse. Future opponents are more likely to exploit this cluster than past ones were. The gauge bar turns **burnt orange fading to red**, expanding rightward. The label says "Weakness is intensifying" or "Emerging vulnerability."

The HEATING state is the most actionable. It tells the player: "even if you survived so far, the meta is moving toward exploiting exactly this part of your architecture. Fix it now or it will define your losses going forward."

### Scenario-Typed Breakdown

Because the Forecast Deck is tagged with scenario fingerprints (2.28), the prospective panel can break down coverage by scenario type:

```
  Prospective coverage by scenario type:
    Relay Flood (16 matches):      81%   ████████████████████████████████████  HEATING
    Ambush Corridor (12 matches):  42%   ████████████████░░░░░░░░░░░░░░░░░░░  COOLING
    Standard Patrol (12 matches):  33%   ████████████░░░░░░░░░░░░░░░░░░░░░░░  COOLING
```

This breakdown reveals **which future scenario types the cluster weakness concentrates in**. A player who sees 81% prospective coverage in Relay Flood knows exactly where the pain is coming from. If the upcoming bracket is 40% Relay Flood, this is a crisis. If the bracket after this one drops Relay Flood entirely, it is a temporary problem.

### Confidence Bands — "The Fog of War"

Prospective coverage is inherently uncertain. The Forecast Deck is a projection, not a prophecy. The system communicates uncertainty via **confidence bands** — thin semi-transparent wings flanking each coverage bar:

```
  Prospective ceiling: ░░██████████████████████████░░░░░░░░░░░░░░  58% (±9pp)
                        ▲                                    ▲
                       49%                                  67%
                    (pessimistic)                       (optimistic)
```

The confidence band is computed from the variance across Forecast Deck match results. If 38 of 40 simulated matches agree on the cluster's impact, the band is narrow (±3pp). If results are scattered — some matches show high cluster impact, others show none — the band is wide (±12pp). Wide bands mean the Forecast Deck's scenario mix matters a lot; small changes in the opponent distribution could swing the coverage number significantly.

The confidence band prevents players from treating the prospective number as gospel. "58% ±9pp" communicates a range. The player can see that the true value is likely between 49% and 67% — still well below the historical 71% in this example, reinforcing the COOLING interpretation.

---

## Player Journeys

#### Journey: Marcus, 28, Software Engineer (Backend)

**Context:** Season 3 Gauntlet, ELO 1,340, RELAY-C multi-cluster detected after 45 matches.

**Minute 0:00 — The Historical Report**
Marcus opens the Inspector after a 3-match losing streak. The career analysis flags RELAY-C as a multi-cluster: 3 elements, combined historical coverage 71%. He has seen this flag before and has been applying element-by-element fixes for the last 15 matches. The Whack-A-Mole pattern is visible in the cluster persistence timeline — RELAY-C has been flagged in 4 of his last 5 career analysis runs.

**Minute 0:15 — The Prospective Tab**
Marcus notices a new sub-tab below the cluster flag header: `[Prospective ▶]`. He clicks it. A 3-second loading animation plays — a thin progress bar with the label "Generating Forecast Deck (37 simulated matches)..." The bar fills smoothly. The Drift Gauge appears.

**Minute 0:22 — The Gut Punch**
The Drift Gauge reads HEATING. Historical: 71%. Prospective: 84%. Delta: +13pp. The gauge bar is burnt orange bleeding into red on the right edge. The label says: "Weakness is intensifying." Marcus's stomach drops. He has been treating the RELAY-C cluster as a maintenance problem — patching one element per session, assuming the overall impact was stable. The prospective panel says the opposite: the meta is shifting toward opponents that exploit RELAY-C even harder than his historical opponents did.

**Minute 0:35 — The Scenario Breakdown**
Marcus expands the scenario-type breakdown. Relay Flood: 91% prospective coverage. Ambush Corridor: 78%. Standard Patrol: 62%. The upcoming bracket metadata shows Relay Flood at 45% of expected matches — up from 30% in his current bracket. The meta is flooding relays, and his RELAY-C architecture is the worst possible config to face that trend.

**Minute 0:50 — The Decision**
Marcus clicks `[View Agent Audit →]` from the prospective panel. For the first time, he stops looking at individual elements and starts looking at RELAY-C as a whole system. He opens the Agent Redesign Mode (4.69c) and begins drafting a new relay architecture from scratch. The prospective coverage gave him the urgency that 45 matches of historical postmortem never did.

---

#### Journey: Suki, 19, Art Student with a Data Visualization Minor

**Context:** Early campaign, just unlocked the Inspector. First time seeing a multi-cluster flag. 22 career matches total.

**Minute 0:00 — Confusion at the Flag**
Suki sees her first multi-cluster flag: SCOUT-A, 3 elements, combined historical coverage 55%. She is not sure what this means. She reads the plain-language tooltip (4.69j): "Your SCOUT-A agent keeps appearing as a fix target. This might mean the whole agent needs rethinking, not just one piece." She gets the gist.

**Minute 0:12 — Exploring the Prospective Tab**
She clicks `[Prospective ▶]` out of curiosity. The Forecast Deck generates — only 20 simulated matches because her ELO band is narrow and opponent diversity is low. The Drift Gauge reads COOLING. Historical: 55%. Prospective: 38%. Delta: -17pp. The gauge is slate blue, tapering off.

**Minute 0:20 — Relief, Then Understanding**
Suki's first reaction is relief — the problem is getting smaller. Then she reads the scenario breakdown. Her historical losses were concentrated in Ambush Corridor scenarios (which she has now mostly passed in the campaign). The upcoming campaign tier has no Ambush Corridor missions. Her SCOUT-A weakness was real, but it was tied to a scenario type she is leaving behind.

**Minute 0:30 — The Smart Skip**
Suki decides not to redesign SCOUT-A. She applies the #1 fix (SCOUT-A hook threshold) as a quick patch and moves on. The prospective panel told her this was a reasonable choice: the weakness is receding, so a minimal fix is proportionate. Without the prospective data, she might have spent 20 minutes in a full agent audit for a problem that was already solving itself through campaign progression.

**Minute 0:40 — A Seed of Literacy**
The experience plants a concept: "the future opponent distribution matters as much as my past losses." Suki does not articulate it this way, but the next time she sees a multi-cluster flag, she reaches for the Prospective tab before the Agent Audit. She is learning to read the battlefield forward, not backward.

---

#### Journey: Takeshi, 34, Competitive FPS Player Transitioning to Strategy Games

**Context:** High Gauntlet, ELO 1,580, running a meta-optimized config. Multi-cluster detected for STRIKER-B with 4 elements.

**Minute 0:00 — The Meta Read**
Takeshi opens the Inspector not because he lost, but because he wants to stay ahead. His win rate is 61%, but he tracks his cluster flags as leading indicators of meta shifts. STRIKER-B has been flagged for two sessions running. Combined historical coverage: 48% across the last 60 matches.

**Minute 0:08 — The Forecast Deck Customization**
Takeshi clicks `[Prospective ▶]` and immediately hits `[Regenerate Forecast →]`. He adjusts the projection parameters: he sets the opponent ELO band to 1,560-1,620 (his realistic competitive range) and overrides the scenario distribution to match the upcoming tournament format — 50% Standard Patrol, 50% Relay Flood, 0% Ambush Corridor. The deck regenerates in 4 seconds.

**Minute 0:18 — The Tournament Lens**
The Drift Gauge reads HOLDING. Historical: 48%. Prospective: 51%. Delta: +3pp. Within the confidence band (±6pp). The weakness is stable — not great, not worsening. But Takeshi drills into the scenario breakdown. Standard Patrol: 34% prospective. Relay Flood: 68% prospective. The STRIKER-B cluster is heavily scenario-typed: it is almost irrelevant in patrols but devastating in relay floods.

**Minute 0:30 — The Conditional Fix**
Takeshi does not redesign STRIKER-B wholesale. Instead, he opens the Agent Audit and adds a **conditional hook** — a context-dependent behavior that activates only in relay-heavy board states. He is not fixing the agent; he is branching its behavior by scenario fingerprint. The prospective coverage showed him exactly where the weakness lives (Relay Flood) and where it does not (Standard Patrol), enabling a surgical intervention that preserves his patrol performance while patching the relay vulnerability.

**Minute 0:45 — The Re-Forecast**
Takeshi regenerates the Forecast Deck with his new config (the conditional hook applied). Prospective STRIKER-B coverage drops from 51% to 29%. The Drift Gauge shifts from HOLDING to COOLING. He has cut the cluster's prospective impact by 22pp. He saves the config and queues three practice matches against relay-heavy opponents to validate the simulation.

---

## Strengths and Weaknesses

### Strengths

**Forward-looking decision support.** The most important advantage. Historical coverage tells the player where they have been. Prospective coverage tells them where they are going. Every architectural decision is implicitly a bet on the future — prospective coverage makes that bet explicit.

**Meta-awareness as a skill.** Competitive players already think about the meta — which strategies are rising, which are falling. Prospective coverage gives that intuition a number. It rewards players who understand the matchmaking ecosystem, not just their own config.

**Prevents over-engineering.** The COOLING state is as valuable as the HEATING state. When a cluster weakness is receding — because the player is leaving a scenario type behind, or because the meta is shifting away from the exploit — the prospective panel tells the player not to waste time on a full redesign. This saves 10-20 minutes of agent audit work that would have produced no competitive value.

**Natural interaction with scenario fingerprinting (2.28).** The Forecast Deck's scenario-type composition is drawn directly from the fingerprint taxonomy. This makes scenario fingerprinting useful beyond its original categorization purpose — it becomes a predictive input to coverage analysis.

### Weaknesses

**Simulation fidelity.** The Forecast Deck is synthetic. Simulated matches are not real matches. If the simulation engine has systematic biases (e.g., it underestimates the impact of timing-dependent hooks), the prospective coverage will be systematically wrong. Players who trust the number and discover it was inaccurate will lose trust in the entire Inspector.

**Computational cost.** Generating the Forecast Deck requires 30-50 full match simulations. At 200ms per simulation, that is 6-10 seconds on top of the career analysis computation. For a feature that most players will check occasionally, this is acceptable. For competitive players who regenerate the deck 3-4 times per session with different parameters, it adds up.

**False precision risk.** A number like "58% ±9pp" looks precise even with the confidence band. Players may anchor on the point estimate and ignore the band. The difference between 58% and 55% is noise, but it reads as signal. The Drift Gauge labels (COOLING / HOLDING / HEATING) help by bucketing the result, but the exact percentage is still prominent.

**Opponent modeling is shallow.** The Forecast Deck draws from known opponent configs in the matchmaking database. It does not model opponent adaptation — if Takeshi's opponents see his new conditional hook and counter it, the Forecast Deck's projection is immediately stale. The system predicts a static future, but the competitive meta is dynamic.

**Dependency on matchmaking data.** The Forecast Deck quality depends on the matchmaking projection. Early-career players with few matches have thin matchmaking data, producing low-diversity Forecast Decks. The confidence bands will be wide, and the prospective number will be noisy. The feature is most useful for players who least need it (experienced players with rich matchmaking histories) and least useful for players who most need it (new players facing unfamiliar opponents).

---

## Interaction Effects

**With 4.69b (Combined coverage display).** The prospective panel is a direct companion to the historical combined coverage. They share the same visual language — percentage bars, coverage numbers, cluster member lists — but answer different temporal questions. The two numbers should always be visible together when the prospective tab is open, never in isolation. The delta between them is the primary information payload.

**With 2.28 (Scenario fingerprinting).** This is the deepest interaction. Scenario fingerprinting provides the taxonomy that structures the Forecast Deck. Without 2.28, the Forecast Deck is an undifferentiated bag of simulated matches. With 2.28, it becomes a structured projection segmented by scenario type. The scenario-typed breakdown in the prospective panel is only possible because 2.28 assigns each simulated match a fingerprint. If 2.28's classification accuracy is poor, the prospective breakdown inherits those errors.

**With 4.69r (Coverage sensitivity to window size).** The historical coverage is sensitive to the analysis window — "last 45 matches" yields a different number than "last 20 matches." The prospective coverage is sensitive to the Forecast Deck size — "40 simulated matches" yields a different confidence band than "20 simulated matches." The two sensitivities are cousins. A player who understands window size effects on historical coverage will intuitively understand deck size effects on prospective coverage. If 4.69r teaches the player about sample-size sensitivity, 4.69q benefits.

**With 4.59 (Career minimum fix).** The career minimum fix identifies the single best historical change. The prospective coverage evaluates whether that change is still relevant going forward. A career minimum fix with high historical coverage but low prospective coverage is a fix for yesterday's problem. The two features together answer: "what was the best fix?" and "is it still the best fix?"

**With 4.68 (Coverage percentage as season health).** Season health tracks coverage trends across the full season. Prospective coverage provides a point-in-time projection. If season health is trending downward (rising coverage = more matches addressable by fixes = more losses caused by known weaknesses) and prospective coverage confirms HEATING, the player has converging evidence of architectural decay.

**With 4.37 (Fork-and-deploy).** A player who sees HEATING on their multi-cluster may want to test a redesigned agent without committing to it. Fork-and-deploy lets them branch their config, apply the cluster fix to the fork, and deploy the fork for 5-10 matches to see if the prospective improvement materializes in real results. Prospective coverage provides the hypothesis; fork-and-deploy provides the experiment.

---

## Comparable Games/Media

**XCOM 2 — Resistance Scan Intel.** XCOM's strategic layer shows the player upcoming threats on the world map — ADVENT facilities under construction, Dark Events in progress. These are forward-looking threats that the player can choose to address or ignore. Prospective coverage serves the same function: it is not a mandate to act, but a preview of what the future holds if the player does not act.

**Poker HUDs (PokerTracker, Hold'em Manager).** Competitive poker players use heads-up display overlays that project opponent tendencies based on historical hand data. The HUD says "this opponent folds to 3-bets 72% of the time" — a backward-looking stat used as a forward prediction. Prospective coverage is the same genre of tool: historical patterns extrapolated into predictive guidance. The poker parallel also highlights the weakness — opponents adapt, and the HUD's projection becomes stale exactly when the opponent changes strategy.

**Baseball Sabermetrics — WAR Projections (ZiPS, Steamer, PECOTA).** Projection systems in baseball generate forward-looking player value estimates using aging curves, park factors, and league trend data. A player might have been worth 4.0 WAR last year but is projected for 2.5 WAR next year due to age regression. The delta between historical and projected performance is the core information — exactly analogous to the Drift Gauge's delta between historical and prospective coverage.

**Weather Forecasting (Ensemble Models).** Meteorological forecast models run multiple simulations with slightly different initial conditions and present the spread of outcomes as confidence bands. The Forecast Deck's confidence bands work identically — multiple simulated futures, variance as uncertainty. The analogy extends to the user experience: weather forecasts are probabilistic but consumed as deterministic ("it will rain tomorrow"), just as prospective coverage will be probabilistic but consumed as a point estimate.

---

## Sensory Description

### Visual Language

The Prospective tab slides in from the right when activated, overlaying the historical coverage panel rather than replacing it — both panels are visible simultaneously, the historical one dimmed to 60% opacity behind the prospective panel's frosted glass surface. The frosted glass effect is deliberate: it communicates "this is an overlay on reality, not reality itself." The historical panel is solid and grounded; the prospective panel is translucent and speculative.

The **Drift Gauge** is the visual centerpiece. It renders as two horizontal bars stacked vertically — historical on top, prospective below — with a connecting gradient strip between them. When the prospective value is lower than historical (COOLING), the gradient strip is **slate blue**, cool and receding, with a subtle leftward particle drift — tiny translucent dots flowing left like data evaporating. When the values are close (HOLDING), the strip is **amber**, steady, with particles suspended in place, vibrating slightly. When prospective exceeds historical (HEATING), the strip is **burnt orange fading to ember red**, with particles flowing rightward and intensifying, like sparks being drawn toward a fire on the right edge. The particle animation is slow — 3-4 second cycle — never frenetic.

The **confidence bands** render as semi-transparent wings extending from the end of the prospective coverage bar. They pulse gently — a 6-second breathing animation where the wing edges expand 2px and contract 2px — communicating that the boundaries are soft, not hard. The wings are colored a lighter tint of the Drift Gauge's current state color: pale blue for COOLING, pale gold for HOLDING, pale orange for HEATING.

The **Forecast Deck composition** is shown as a segmented ring below the Drift Gauge — a thin donut chart where each scenario type (2.28 fingerprint) gets a proportional arc. Relay Flood might be a deep teal arc spanning 40% of the ring, Ambush Corridor a muted violet at 30%, Standard Patrol a warm gray at 30%. The ring rotates slowly — one full revolution every 30 seconds — to communicate that the deck is a dynamic projection, not a fixed snapshot.

### Audio Design

When the Prospective tab opens, a soft **metallic chime with a rising pitch** plays — a tone that suggests "looking upward/forward," distinct from the Inspector's usual descending diagnostic tones that suggest "looking downward/backward into history." The chime has a slight reverb tail, implying distance — the future is far away.

The Drift Gauge state transition emits a subtle tonal cue:
- **COOLING:** A soft descending two-note tone, like a pressure valve releasing. Faint hiss undertone. The sound says "this is deflating."
- **HOLDING:** A flat, sustained hum — a single note held for 1 second. Neutral. The sound says "steady state."
- **HEATING:** A rising two-note tone with a faint crackling undertone, like static building. The sound says "something is building up." Not alarming — informational. A weather report, not a fire alarm.

When the Forecast Deck regenerates (after the player adjusts parameters and clicks `[Regenerate Forecast →]`), a rapid series of soft clicks plays — like shuffling cards — over 2-3 seconds, matching the simulation progress bar. Each click represents a simulated match completing. The clicks accelerate slightly as the bar fills, creating a sense of momentum.

### Tactile / Controller Feel

On controller, the Drift Gauge is the default focus element when the Prospective tab opens. The left stick scrolls between Drift Gauge, scenario breakdown, and Forecast Deck composition. The A button on the Drift Gauge opens the match-by-match detail view. The X button triggers `[Regenerate Forecast →]`.

When the Drift Gauge state is HEATING, a subtle controller vibration pulses once — a single low-frequency thrum lasting 200ms — when the tab first renders. It is a haptic exclamation point: "pay attention to this." COOLING and HOLDING states produce no vibration. The asymmetry is intentional — HEATING is the only state that demands action, so it is the only state that claims the player's physical attention.

### The Moment of Recognition

The most important sensory beat is the **delta reveal**. When the prospective coverage number first appears, it renders as a counter spinning from the historical value to the prospective value — counting down from 71 to 58, or counting up from 71 to 84. The counter animation takes 1.2 seconds, and the number color shifts smoothly from the historical bar's white to the Drift Gauge state color (slate blue for down, amber for neutral, ember red for up). The delta itself — "+13pp" or "-13pp" — fades in 0.4 seconds after the counter settles, appearing between the two bars with a gentle scale-up animation from 80% to 100% size.

This 1.6-second sequence is the feature's emotional payload. The counter spinning up toward a HEATING value is the "oh no" moment. The counter spinning down toward a COOLING value is the "I can relax" moment. Neither is automated action — the game is showing the player a number, not making a decision for them. But the sensory design ensures the number lands with weight, not as a flat statistic but as a felt shift in the player's understanding of their competitive position.
