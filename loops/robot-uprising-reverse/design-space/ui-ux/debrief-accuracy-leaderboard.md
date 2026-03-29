# The Complexity Mirror — Accuracy Leaderboard Opt-In

**Aspect:** 4.95 — Accuracy leaderboard opt-in: an optional community leaderboard showing aggregate pre-ranking accuracy distributions by config complexity tier; players can compare "how does my accuracy compare to players with similar architectural complexity?"; requires a complexity metric (perhaps: number of active hooks x number of agents); surfaces that accuracy is not universally better-is-higher — high-complexity expert configs have lower accuracy.

**Parent:** 4.64 — Pre-ranking accuracy as displayed stat
**Siblings:** 4.93 — Accuracy stat confidence interval display; 4.94 — "Committed to QUICK" sessions only accuracy; 4.96 — Accuracy-vs.-complexity scatter plot in career stats
**Related:** 4.25 — EDT trajectory as career metric; 4.63 — Player-configurable pre-ranking weights; 4.65 — Pre-ranking adversarial surface; 4.68 — Coverage percentage as season health metric; 5.22 — Gauntlet as third act; 7.10 — Config necropsy culture; 8.07 — Robustness vs. efficiency tension

---

## The Core Concept

A vertical strip of frosted cards, each representing a complexity tier, stacked like poker chips — your tier pulses with a soft cyan border, showing a bell curve where your dot sits among anonymous gray dots, the distribution rendered as a shimmering gradient from deep purple (low accuracy) to blazing gold (high). This is The Complexity Mirror: an opt-in community panel accessible from the career stats screen that aggregates anonymized pre-ranking accuracy data from all participating players and stratifies it by **config complexity tier**.

The central insight it teaches: accuracy is not a universal grade where higher is better. It is a function of how complex your architecture is. A player running three agents with two hooks who sees 88% accuracy is not "better" than a player running eight agents with fourteen hooks who sees 57% accuracy. They are operating in fundamentally different complexity regimes. The Mirror shows you this by placing your dot inside a distribution of architecturally similar peers — not by ranking you on a ladder.

The leaderboard does not rank players against each other. It shows distributions. You are a luminous point in a cloud, not a name on a scoreboard.

### The Complexity Metric: Wiring Density

The complexity metric must be simple to compute, legible to players, and genuinely correlated with diagnostic difficulty. The proposed metric is **Wiring Density**:

```
Wiring Density = active_hooks x active_agents
```

A config with 3 agents and 4 hooks has wiring density 12. A config with 7 agents and 11 hooks has wiring density 77. A config with 2 agents and 1 hook has wiring density 2.

Why this metric works:
- **Hooks are the unit of cross-agent coupling.** Each hook creates a causal dependency between agents. More hooks means more possible causal paths the pre-ranking heuristic must disambiguate.
- **Agent count multiplies the search space.** Each agent adds context window state, rule evaluations, and skill activations. The pre-ranking heuristic has more candidates to rank.
- **The product captures the interaction surface.** 3 agents with 10 hooks (density 30) is structurally different from 10 agents with 3 hooks (density 30), but both produce approximately the same diagnostic difficulty for the pre-ranking heuristic. The product is a reasonable proxy.

Why not something more sophisticated? Because the metric must be explainable in a single tooltip: "Your wiring density is hooks times agents." A spectral-norm graph metric would be more accurate but opaque. Legibility wins.

### The Complexity Tiers

Five tiers, labeled architecturally rather than by skill:

| Tier | Label | Wiring Density | Typical Campaign Phase | Expected Accuracy Range |
|------|-------|---------------|----------------------|----------------------|
| 1 | **Minimal** | 1-10 | Missions 1-4 (tutorial) | 82-95% |
| 2 | **Modular** | 11-30 | Missions 5-6 (first factory) | 72-86% |
| 3 | **Networked** | 31-60 | Missions 7-8 (command agent) | 62-78% |
| 4 | **Dense** | 61-100 | Missions 9-10 + early Gauntlet | 55-72% |
| 5 | **Hyperconnected** | 101+ | Deep Gauntlet / experimental | 40-65% |

"Hyperconnected" does not mean "better." It means "your architecture has many cross-agent dependencies." The vocabulary reinforces that complexity is a design choice, not a progression.

### What the Player Sees

When the leaderboard panel opens, a brief loading animation plays: three horizontal dots travel left to right across the panel header, teal, trailing a faint motion blur. The dots move at slightly different speeds — the first arrives before the second, which arrives before the third — like signal packets arriving from different nodes in a distributed system. Duration: 600-900ms.

Then the main display resolves: a histogram of 20 vertical bars spanning the accuracy range for the player's current tier. Each bar is 8px wide with 2px gaps, filled solid teal (#3ECFB4) at 85% opacity. Bar heights range from 2px (outlier bins) to 48px (the modal bin). The histogram has a soft bottom shadow (2px, 10% black) grounding it to the baseline axis.

The player's position is marked by a white horizontal arrow at the left edge of the histogram, pointing rightward into the distribution. Where the arrow's line intersects histogram bars, those bars brighten by 10% — a white overlay on the teal, as though the arrow is a flashlight sweeping across the data. The accuracy percentage is rendered in white, 14px, medium weight, at the arrowhead tip. Below it, in 10px light grey: the percentile.

Below the main histogram, a smaller comparison strip shows all five tiers stacked vertically — five horizontal bars, each labeled with the tier name on the left and the median accuracy on the right. The bars fill with a gradient from dark teal (left edge) to bright teal (at the fill point). The current tier's bar has a thin white border (1px) and white label text. Non-current tiers have grey labels and no border. Between tiers, faint separator lines (0.5px, 15% white). The strip reads like a thermometer lying on its side — the temperature of diagnostic clarity falling as complexity rises.

This strip is the teaching moment. The player can see with their eyes that median accuracy drops as wiring density increases. The 88% Minimal player is not "better at diagnostics" than the 52% Hyperconnected player — they are working with architectures that are fundamentally different in diagnostic legibility. The strip makes the inverse relationship visible and undeniable.

### The No-Backend Problem

The locked tech stack says "no backend." A community leaderboard requires aggregate data from multiple players. This is a fundamental architectural tension, and the design must address it honestly.

**Option A — Static Community Datasets (Recommended):** The game ships with 3-4 curated aggregate datasets baked into the client bundle, each generated from playtesting populations. These static distributions provide the bell curves and tier medians. Players compare against a frozen snapshot, not a live population. The datasets are updated with game patches (monthly or quarterly). This requires zero infrastructure — the aggregate data is just a JSON file in the build. The trade-off: the distributions are stale between patches. But for the pedagogical purpose (teaching the complexity-accuracy trade-off), static data is sufficient. The player does not need real-time community data to learn that HYPERCONNECTED accuracy is lower than MINIMAL accuracy. They need a plausible distribution to position themselves within.

**Option B — Peer-to-Peer Export/Import:** Players can export their anonymized accuracy profile as a small JSON file and share it via Discord, forums, or a community-hosted aggregator. A community member maintains a public aggregator (a static site that ingests these JSON files and publishes updated distributions as downloadable datasets). The game can import community datasets from a URL. This is fully decentralized — no game-operated backend — but requires community infrastructure to emerge organically.

**Option C — Hybrid Opt-In Ping:** On opt-in, the game sends a single anonymized POST to a lightweight endpoint (a Cloudflare Worker or Netlify Function — serverless, near-zero cost). The endpoint aggregates incoming data and serves a public JSON file. This is technically "a backend," but the surface area is a single stateless function that costs pennies per month. If the no-backend constraint is interpreted as "no persistent server infrastructure," a serverless function may be acceptable.

The design proceeds assuming Option A for launch, with Option B as a community-driven enhancement and Option C as a post-launch upgrade if demand warrants.

### The Opt-In Mechanism

A modal overlay, 360px wide, centered. Background blur on the game screen behind it (8px Gaussian, 40% dark overlay). The modal has a clean white border (1px), dark background (#1A1A1A), and text rendered in the game's standard body font (14px, #CCCCCC):

```
COMMUNITY ACCURACY DATA (optional)
────────────────────────────────────
Compare your accuracy against players with
similar architectural complexity, using
anonymized aggregate distributions.

What is used: accuracy %, wiring density, tier.
What is NOT shared: config details, session logs,
player identity.

  [ Opt In ]     [ No Thanks ]
```

Two buttons, equal width, side by side. "Opt In" in teal background with dark text. "No Thanks" in transparent with a grey border. Neither is visually dominant. The prompt does not persuade; it presents. No nudging, no persistent banner. If the player declines, the prompt never reappears unless they navigate to Settings > Community Data.

When "Opt In" is clicked: the modal fades out (200ms), and a small teal checkmark appears briefly next to the "Community Accuracy" sidebar entry. No confetti, no celebration. Just acknowledgment.

---

## What the Complexity Mirror Teaches

### Insight 1: Accuracy Is Complexity-Relative

The central lesson. A player who sees their 71% accuracy in the NETWORKED tier, then scrolls down and sees that MINIMAL players average 88%, does NOT think "I should simplify my config to get 88%." They think: "71% is above the median for configs with my complexity. The heuristic is doing well given what it has to work with." The leaderboard reframes the accuracy stat from an absolute performance metric to a relative calibration signal.

### Insight 2: Complexity Has a Diagnostic Cost

The all-tiers comparison strip shows an unmistakable downward slope. Adding hooks and agents makes your architecture more capable but harder to diagnose. This is the same trade-off as "more microservices = more capability but harder to debug" in real systems engineering. The game never lectures — it just shows the aggregate data and lets the player draw the conclusion.

### Insight 3: Within-Tier Rank Matters More Than Absolute Number

A player at the 85th percentile in the DENSE tier (accuracy 69%) has built a complex architecture that is unusually diagnostic-friendly. That is a more interesting achievement than being at the 50th percentile in MINIMAL (accuracy 88%). The Mirror surfaces this nuance: within-tier rank is the meaningful comparison.

### Insight 4: The Expert Paradox

The deepest players — those in the HYPERCONNECTED tier — have the lowest accuracy numbers and, on average, the highest pass rates and most sophisticated architectures. The leaderboard makes visible what seems paradoxical: the best players have the worst diagnostic legibility. They have outgrown the heuristic's ability to isolate causes in their highly coupled systems. This is the "you've become too complex for your tools" insight — the same lesson senior engineers learn when their distributed systems outgrow their observability stack.

---

## Player Journeys

#### Journey: Tomoko, 33, Data Analyst from Osaka

**Context:** 120 hours in. Deep into Gauntlet mode with a NETWORKED-tier architecture (wiring density 47). Pre-ranking accuracy has been hovering around 66% for the last 15 sessions. She opted in three weeks ago without thinking much about it. She has never opened the leaderboard.

**Minute 0:00 — Idle Curiosity**

Tomoko finishes a Gauntlet match — 78/100 pass rate, decent but not her best. She opens the debrief, runs QUICK mode, gets her fix suggestion. Then she navigates to the career stats screen to check her EDT trajectory. In the left sidebar, below "EDT Trajectory" and "Coverage History," a new entry she hasn't noticed before: "Community Accuracy." The icon is three small dots arranged in a loose triangle — abstract, evocative of a scatter plot. When she hovers, the dots animate: they drift apart slightly and settle back, like data points finding their equilibrium. A faint teal pulse, 400ms period. She clicks.

The panel loads. Three dots pulsing left to right in teal, trailing a soft blur — like signals propagating through relay nodes — play for 800ms while the static aggregate dataset is loaded from the client bundle. Then the distribution resolves.

A histogram of 20 vertical bars in solid teal, each casting a faint bottom shadow, fills the panel. Her position is marked by a white horizontal arrow at 66%, the bars behind the arrow brightened as if the line were a searchlight. The tier label reads "NETWORKED (WD: 47)" in the header.

**Minute 0:30 — The Sting**

She reads the summary line rendered below the histogram in the game's monospace UI font:

```
Your accuracy: 66%  |  Tier median: 69%  |  Percentile: 38th
```

38th percentile. A small competitive sting. She's a data analyst — she knows what that number means. She's in the lower half of NETWORKED players. Her eyes drop to the all-tiers comparison strip below. Five horizontal bars, cascading from 88% (MINIMAL, grey label) down to 52% (HYPERCONNECTED, grey label). Her tier — NETWORKED — glows with a thin white border, the label bright against the dark background. She traces the descending staircase of bars with her eyes. The bars get shorter. Accuracy falls as complexity rises.

She looks at the MINIMAL bar: 88%. She remembers her early missions — two scouts, one striker, one hook. She was probably at 90%+ back then. Of course she was. There was almost nothing for the heuristic to confuse.

**Minute 1:30 — The Reframe**

Tomoko opens her current config in the Plan screen (career stats and Plan can be opened side by side). She counts: 7 agents, 11 hooks. Wiring density 77. Wait — 77 would put her in the DENSE tier, not NETWORKED. She re-reads the panel header: "NETWORKED (WD: 47)." She realizes: the leaderboard uses her 30-session rolling average density, not her current config. Her recent expansions pushed her current density higher than her historical average.

She hovers over "WD: 47" and a tooltip slides in after 180ms: "Wiring density is your 30-session rolling average of hooks x agents. Your current config: WD 77 (DENSE tier)." The tooltip is dark-backed, white-bordered, with a small upward-pointing triangle connecting it to the number. The "DENSE" in the tooltip is rendered in warm amber — the color of that tier in the comparison strip.

A hypothesis forms: her accuracy dropped from ~72% to ~66% as she added hooks over the last 10 sessions. But the leaderboard is comparing her to NETWORKED players because her rolling average hasn't caught up. Once it does, she'll move to DENSE, where the median is 61%. Her 66% would then be at the 62nd percentile — above median, not below.

She's not bad. She's been mis-tiered by the averaging lag.

**Minute 3:00 — The Patient Wait**

Tomoko closes the leaderboard. She doesn't change her config. The leaderboard didn't tell her to do anything — it gave her context for a number she already had. Her 66% accuracy is not a problem to solve. It's a natural consequence of architectural complexity.

She plays two more Gauntlet matches. After the second, she checks again. Her rolling average has ticked up to WD 52. Still NETWORKED, but closer to the boundary. In 10 more sessions, the average will cross into DENSE. She'll confirm her hypothesis then.

**Minute 5:00 — Resolution**

Tomoko exits career stats and queues another Gauntlet match. The leaderboard functioned not as a call to action but as a lens — she saw the same 66% she already knew, but now she saw it in context. The number didn't change. Her interpretation of it did entirely.

**UI Annotations:**
- **Sidebar entry "Community Accuracy"**: icon is 3 dots in triangular formation; appears only for opted-in players; hover triggers drift-and-settle animation (dots move 2px outward, return over 300ms); teal pulse on hover, 400ms period
- **Loading animation**: 3 horizontal dots traveling L-to-R, teal with motion blur trail, 600-900ms; dots arrive at slightly staggered intervals (80ms apart)
- **Histogram**: 20 vertical bars, 8px wide, 2px gaps, teal (#3ECFB4) at 85% opacity, 2px bottom shadow at 10% black; bar heights 2-48px
- **Player arrow**: 1.5px white horizontal line with arrowhead, intersected bars get 10% white overlay; accuracy number in white 14px at arrowhead; percentile in grey 10px below
- **Tier comparison strip**: 5 horizontal bars, 200px wide total, tier labels left-aligned, median % right-aligned; current tier has 1px white border and white labels; non-current tiers have grey labels
- **WD tooltip**: 180ms hover delay, dark background with white 1px border, upward-pointing triangle anchor; tier name in that tier's accent color

---

#### Journey: Marcus, 19, Game Design Student from Quezon City

**Context:** 40 hours in, midway through the campaign (Mission 7). Just unlocked the Command agent. Architecture is simple — 4 agents, 3 hooks, wiring density 12 (MINIMAL tier). He heard about the accuracy leaderboard from a YouTube video where a competitive player mentioned "my accuracy is 54% but that's actually good for my tier." Marcus wants to understand what that statement means.

**Minute 0:00 — The Opt-In Encounter**

Marcus opens the career stats screen. The opt-in modal appears — frosted glass overlay, 360px wide, centered over the blurred career stats background. He reads it carefully. He's studying game design; he notices consent patterns in interfaces. The prompt lists what's shared (accuracy %, wiring density, tier) and what isn't (config details, session logs, identity). Two buttons at the bottom: "Opt In" in teal, "No Thanks" in transparent grey border. Neither is larger or brighter than the other. No dark patterns.

He clicks "Opt In." The modal fades out over 200ms. A small teal checkmark winks into existence next to the "Community Accuracy" sidebar entry and then fades after 1.5 seconds. No celebration, no reward sound. Just a quiet confirmation.

**Minute 0:20 — The First Distribution**

The leaderboard loads instantly — the static dataset is already in the client bundle, no network call needed. The histogram appears: a cluster of teal bars bunched in the 82-95% range, tightly grouped. His MINIMAL tier distribution is narrow because simple architectures produce consistently high accuracy. His white arrow sits at 91%, right of center. The summary line reads:

```
Your accuracy: 91%  |  Tier median: 88%  |  Percentile: 71st
```

91%. 71st percentile. A small flush of satisfaction. He's above median. His simple architecture is highly legible to the heuristic. The histogram bars around his arrow are tall — many players cluster near his position. The distribution is a tight peak, almost Gaussian, with thin tails tapering below 82% and above 95%.

**Minute 0:45 — The Descending Staircase**

Marcus scrolls down to the all-tiers comparison strip. Five horizontal bars, each filling to its median accuracy. MINIMAL at 88% fills nearly the entire bar width. MODULAR at 78% — shorter. NETWORKED at 69% — noticeably shorter. DENSE at 61%. HYPERCONNECTED at 52% — barely past the halfway point.

The cascading bars form a staircase descending to the right. Marcus stares at the HYPERCONNECTED bar. 52%. He thinks about the YouTube player who said "54% is good for my tier." Now he understands. That player was in the HYPERCONNECTED tier. Their 54% sits above the 52% median. They have a complex build where the diagnostic heuristic is right barely half the time — and that's above average for that level of architectural density.

He hovers over the HYPERCONNECTED bar. A ghost arrow fades in at 60% opacity — a semi-transparent white marker showing where his 91% accuracy would land within that tier's range. A tooltip appears: "With your 91% accuracy, you'd be at the 99th percentile in HYPERCONNECTED." The ghost arrow sits far to the right of the HYPERCONNECTED distribution, outside the bell curve entirely. His accuracy is meaningless in that context — he simply doesn't have the architectural complexity that would challenge the heuristic.

**Minute 1:30 — The Design Student's Observation**

Marcus thinks about this as a game design student. The leaderboard is teaching something about system complexity that no lecture could: as you add interconnections, each component becomes harder to diagnose in isolation. The heuristic, which examines surface-level signals (activity at the pivot tick, recency, volatility), is great at finding obvious causes in clean architectures. It's mediocre at isolating root causes in densely interconnected ones because everything is active, everything was recently touched, everything is volatile.

He takes a screenshot. A small camera icon sits in the top-right corner of the leaderboard panel; clicking it triggers a 200ms white flash (like a camera shutter) that fades to transparent, and saves a PNG to Downloads. He'll use it in his game design class presentation next week.

**Minute 2:30 — The Prophylactic**

Marcus thinks: "When I add more hooks and agents for Missions 8-10, my accuracy will drop. The leaderboard is showing me my future." He scrolls back up and looks at his 91%. He knows this number will fall as he wires Command agent chains and multi-relay architectures. The MODULAR median is 78%. The NETWORKED median is 69%.

But the leaderboard has already shown him: that drop is expected. It's the natural cost of building more powerful systems. The bars get shorter because the architectures get more tangled, not because the players get worse.

**Minute 4:00 — Resolution**

Marcus closes the leaderboard and returns to Mission 7. He doesn't change his approach. But he's been inoculated against a future misinterpretation: when his accuracy drops from 91% to 72% over the next 20 sessions, he won't panic. He'll check the Mirror, see that 72% is normal for his new complexity tier, and keep building.

He texts his roommate: "This game has a thing where it shows you that grandmasters have LOWER diagnostic accuracy than beginners. Not because they're worse — because their systems are too complex for the tool to keep up. It's like how debugging a monolith is easier than debugging microservices."

**UI Annotations:**
- **Opt-in modal**: 360px wide, centered; 8px Gaussian background blur at 40% dark overlay; 1px white border, #1A1A1A background; body text 14px #CCCCCC; buttons equal width, "Opt In" teal bg (#3ECFB4) with dark text, "No Thanks" transparent with grey border (#666)
- **Opt-in confirmation**: teal checkmark appears next to sidebar entry, fades over 1.5s; no sound, no animation beyond the fade
- **Ghost arrow on tier hover**: 60% opacity white arrow marker; tooltip shows hypothetical percentile in that tier; 120ms fade-in; only visible while hovering the non-current tier bar
- **Screenshot button**: camera icon, 16px, top-right of panel; click triggers 200ms white flash overlay; saves PNG with player position and tier highlighted; crisp 50ms click sound at 20% volume
- **MINIMAL distribution shape**: narrow bell curve, bars tightly clustered between 82-95%; modal bin ~88%; thin tails; visually reads as "simple architectures produce consistent results"

---

#### Journey: Adaeze, 37, Staff Engineer at a Fintech Company in Lagos

**Context:** 310 hours in. One of the deepest players in the game. HYPERCONNECTED tier for over 100 sessions. Current config: 9 agents, 18 hooks, wiring density 162. Pre-ranking accuracy: 48%. She uses THOROUGH mode almost exclusively because she long ago stopped trusting QUICK for her architecture. She opted into the leaderboard on day one and checks it weekly as part of a Sunday ritual.

**Minute 0:00 — The Weekly Ritual**

Sunday evening. Adaeze opens career stats: EDT trajectory first, then coverage history, then Community Accuracy. The sidebar entry pulses with its familiar teal dot-cluster icon. She clicks. The loading dots travel left to right — she's seen this animation hundreds of times, but the staggered arrival of the three dots still reads to her like packets arriving from distributed nodes. It's a nice touch.

The histogram resolves. The HYPERCONNECTED distribution is wider and flatter than the tighter tiers — the bars spread across a broad range from 40% to 65%, with no sharp peak. The modal bin sits around 52-54%, but the bars on either side are nearly as tall. This is a population of diverse architectures — mesh topologies, hub-and-spoke, hybrid chains — all producing wildly different diagnostic profiles despite similar wiring densities.

Her white arrow points at 48%. Below median again. The summary:

```
Your accuracy: 48%  |  Tier median: 52%  |  Percentile: 34th
```

34th percentile. She's been in the 30th-40th percentile range for weeks. She's not bothered — she knows why.

**Minute 0:30 — The Drill-Down**

Adaeze clicks anywhere on the histogram. The histogram slides upward 80px with a smooth ease-out animation (280ms), and a scatter plot expands below it. The plot area is 300x200px — dark teal background (#0A2621) with a subtle grid (10% white lines at major axis values). The x-axis reads "Wiring Density" (101-250), the y-axis reads "Accuracy %" (35-70%).

Each player is a 4px diameter dot, teal at 30% opacity — so a single dot is barely visible, but clusters of five or more create clearly saturated teal pools. Her own dot is 6px, solid white, with a faint pulsing glow (1px white halo, 1.5s period). It sits at (162, 48%) — right on the trend line. The scatter shows a clear downward slope within the tier. Players at WD 110 cluster around 55-60%. Players at WD 150+ cluster around 42-52%.

She hovers over her dot. A floating card appears:

```
Your position: WD 162, Accuracy 48%
Among WD 150+ players (n=31): 58th percentile
The trend line at WD 162 predicts: 46%
You are 2pp above the local trend.
```

She's not below average because she's doing something wrong. She's below the tier median because her config is more complex than the median HYPERCONNECTED player's. Within her sub-range (WD 150+), she's actually above the local trend by 2 percentage points.

**Minute 1:30 — The Anomaly Hunt**

Adaeze notices a cluster of three dots significantly above the trend line — rendered in warm gold (#D4A843) at 50% opacity instead of teal, because they're more than 1.5 standard deviations above the regression. They sit at WD 130-140, accuracy 62-65%. She hovers over the cluster.

A tooltip appears after 250ms:

```
Cluster: 3 players, WD 130-142
Average accuracy: 63%
Detected topology: hub-and-spoke
(1 command agent, 2 relay agents, 6+ edge agents)
```

Hub-and-spoke. The architecture where one command agent routes everything through two relay hubs. Each edge agent connects only to a relay, not to other edge agents. The total hook count is high (hence the wiring density), but the graph structure is hierarchical, not mesh. The pre-ranking heuristic can isolate causes because failures propagate through the hubs, which light up at the pivot tick like traffic bottlenecks.

Adaeze's architecture is a full mesh — every agent can signal every other agent through shared channels. Her graph has no clear hierarchy. The heuristic has no causal bottleneck to identify because every agent is equally connected. The hub-and-spoke players have high wiring density but low graph entropy. Their hooks are numerous but structurally organized.

**Minute 3:00 — The Architectural Hypothesis**

Adaeze considers restructuring toward hub-and-spoke. Her mesh has a 95% pass rate in Gauntlet — it's her best-performing build. But she can barely diagnose it when it fails. QUICK is useless, and even THOROUGH takes 40+ seconds because the exhaustive search has 162 candidate elements to evaluate.

She decides against a full restructure. Instead, she conceives of a smaller intervention: a "diagnostic relay" — a relay agent that doesn't participate in the main architecture but instead observes the mesh and produces a simplified causal summary on its own channel. A relay whose sole purpose is to make the pre-ranking heuristic's job easier.

This is a meta-architectural move: adding an agent not for battlefield performance but for diagnostic transparency. The gold anomaly dots in the scatter — hub-and-spoke players with high accuracy — gave her the idea. If she can't restructure the whole mesh, she can at least give the heuristic a single bottleneck to observe.

**Minute 5:00 — The Community Contribution**

Adaeze writes a Discord post: "HYPERCONNECTED players: the Complexity Mirror shows hub-and-spoke configs have 10pp higher accuracy than mesh configs at the same wiring density. Here's why, and a hybrid approach that keeps mesh performance with better diagnostics."

She attaches the scatter plot screenshot with the gold anomaly cluster circled. The camera icon in the panel's top-right corner captures the full scatter view including her position and the anomaly dots.

**Minute 7:00 — Resolution**

Three sessions later with the diagnostic relay, her accuracy rises from 48% to 53%. She reopens the Mirror. Her white dot in the scatter has moved — from (162, 48%) to (171, 53%), because the diagnostic relay added wiring density. But she's now further above the trend line than before. The local trend at WD 171 predicts 44%. She's at 53%. Nine points above the trend.

The Mirror showed her an anomaly in the community data. She reverse-engineered the cause (hub-and-spoke topology). She adapted the principle to her own architecture (diagnostic relay). And the Mirror confirmed the improvement. The aggregate data created a research loop that no solo stat could have triggered.

**UI Annotations:**
- **Scatter plot drill-down**: 280ms slide-down ease-out below the histogram; 300x200px plot area; background #0A2621 with 10% white grid; x-axis "Wiring Density", y-axis "Accuracy %"; axis labels 9px grey, rotated as appropriate
- **Player dots in scatter**: 4px diameter, teal (#3ECFB4) at 30% opacity; overlapping dots create darker pools through additive opacity; player's own dot 6px solid white with 1px pulsing halo (1.5s period)
- **Anomaly dots**: warm gold (#D4A843) at 50% opacity; triggered when a dot is >1.5 standard deviations above the within-tier regression line; visually distinct from the teal population but not attention-grabbing
- **Cluster tooltip**: 250ms hover delay; shows player count, WD range, accuracy range, and detected graph topology (hub-and-spoke, mesh, chain, star, ring); topology detected from anonymized hook-graph structure in the aggregate dataset
- **Trend line**: faint dashed line (2px dash, 4px gap) in 25% opacity white; linear regression through the scatter; provides the baseline against which the player's above/below-trend status is computed

---

## Strengths

**Solves the "71% is bad" problem from 4.64.** The accuracy stat (4.64) has a core weakness: players without context read 71% as a mediocre grade. The Complexity Mirror provides the denominator the solo stat was missing. A player who sees "71%, 62nd percentile in NETWORKED" immediately recalibrates. The misinterpretation risk collapses.

**Teaches the complexity-accuracy trade-off without lecturing.** No in-game text says "complex architectures have lower diagnostic accuracy." The all-tiers comparison strip shows descending bars from 88% to 52%. The player draws the conclusion themselves. Self-discovered insights stick; lectures don't.

**Creates meaningful peer comparison without toxicity.** Traditional leaderboards rank players against each other, creating winners and losers. The Complexity Mirror shows distributions. You are a point in a cloud, not a name on a list. The distribution framing prevents the competitive toxicity that absolute rankings generate.

**Generates emergent community research.** Adaeze's anomaly discovery — hub-and-spoke architectures having higher accuracy at the same wiring density — is not something the game explicitly teaches. It emerged from aggregate data. The Mirror is a research instrument: it gives the community raw data and lets patterns surface socially. This creates forum posts, YouTube analyses, and Discord threads that extend the game's lifespan beyond the designers' planning horizon.

**Provides prophylactic framing for new players.** Marcus saw the complexity-accuracy curve before he reached the complex tiers. When his accuracy drops as he advances, he already has the mental model to interpret the decline correctly. The Mirror inoculates against future despair.

**Validates expert play as different, not worse.** Hyperconnected players see their low accuracy shared by peers. The Mirror normalizes the expert experience: low accuracy with high battlefield performance is a recognized pattern, not an anomaly. This keeps advanced players engaged rather than frustrated by a stat that seemingly penalizes their sophistication.

---

## Weaknesses

**The no-backend constraint is real and unsolved elegantly.** The recommended approach (static datasets baked into the client) works pedagogically but feels hollow to competitive players who want to compare against a live population. Static data is educational; live data is motivational. The compromise is visible — a player who realizes the "community" data is a frozen playtest snapshot may feel deceived. Clear labeling ("Based on Season 1 playtest data — updated quarterly") mitigates but doesn't eliminate the disappointment.

**The complexity metric is coarse.** Wiring density treats all hooks and all agents as equal. A hook from a Scout to a Relay is not the same diagnostic challenge as a hook from a Command to a chain of three Relays. Hub-and-spoke vs. mesh at WD 140 can differ by 10+ percentage points in accuracy, as Adaeze discovered. The tier system groups structurally different architectures together. A topology-aware metric would be more accurate but harder to explain.

**Small populations in extreme tiers.** The HYPERCONNECTED tier may have only 30-50 data points during the first months after launch. The distribution with 30 data points is noisy, percentile rankings are volatile, and a player who swings from 34th to 52nd percentile between sessions might be seeing noise, not improvement. The Mirror should show a sample-size caveat: "n=47 — distribution is approximate."

**Opt-in bias skews the data.** Players who opt in are systematically different from those who don't. Competitive players over-represent; casual players under-represent. A casual player who opts in might find themselves below-median not because their architecture is poor but because the comparison population is competition-focused. With static datasets (Option A), this bias is controlled by the playtest population composition — but still present.

**The rolling-average tier lag creates confusion.** Tomoko's journey demonstrated the problem: her current config is DENSE (WD 77) but the Mirror shows NETWORKED (WD 47). Mitigation: show both the rolling-average tier and the current-config tier side by side, with a tooltip explaining the discrepancy. But this adds complexity to an already information-dense panel.

**Privacy perception risk even with static data.** If Option C (serverless endpoint) is adopted post-launch, some players will be uncomfortable sharing any game data. Even the opt-in prompt itself creates a moment of friction that some players will find off-putting. The consent interface must be minimal and non-manipulative — no "are you sure?" when declining.

---

## Interaction Effects

**With 4.64 (Pre-ranking accuracy as displayed stat):** The Mirror is the community contextualization layer for the solo accuracy stat. The stat says "71%." The Mirror says "71% is 62nd percentile in NETWORKED." Without the Mirror, the stat is an ungrounded number requiring the player to develop their own calibration. With the Mirror, calibration arrives pre-built from aggregate data.

**With 4.96 (Accuracy-vs.-complexity scatter plot in career stats):** The career scatter plot shows the player's own history: each config version as a dot. The Mirror scatter shows the community's positions on the same plane. The game could allow overlaying the personal scatter on the community scatter — personal dots moving through the community cloud.

**With 4.93 (Accuracy stat confidence interval display):** The Mirror should show confidence intervals on tier medians and percentile estimates. "62nd percentile (95% CI: 48th-76th)" is more honest than "62nd percentile." If the confidence interval spans 28 points, the ranking is noise. This prevents over-interpretation.

**With 5.22 (Gauntlet as third act):** The Mirror is most meaningful in Gauntlet mode, where varied scenarios test architectural quality. Campaign accuracy is partly mission-specific; Gauntlet accuracy reflects architectural quality in the wild. A "Gauntlet only" filter would give competitive players a purer comparison.

**With 7.10 (Config necropsy culture):** The Mirror generates data points that become necropsy fodder. Adaeze's anomaly cluster prompted a community investigation: "Share your build. How did you get 63% accuracy at WD 140?" The Mirror creates the questions; config necropsies provide the answers.

**With 4.65 (Pre-ranking adversarial surface):** In competitive Gauntlet, the Mirror is a strategic intelligence source. If a player knows HYPERCONNECTED players have ~52% QUICK accuracy, they can design enemy strategies that exploit QUICK-mode misdiagnosis — creating scenarios where the heuristic points at the wrong element. The Mirror reveals the population-level vulnerability surface.

**With 8.07 (Robustness vs. efficiency tension):** The all-tiers comparison strip is a literal visualization of the robustness-efficiency trade-off. Minimal-tier players have robust diagnostics but simple architectures. Hyperconnected players have efficient battlefield performance but fragile diagnostics. The descending bars encode the tension directly.

---

## Comparable Games and Media

**Chess.com accuracy distributions:** Chess.com shows per-game accuracy scores (how many moves matched the engine's top choice) and includes percentile context. The community has calibrated what "good" accuracy looks like at different Elo ranges — grandmasters average 88-92%, 1500-rated players average 70-78%. The Complexity Mirror performs the same calibration for pre-ranking accuracy across complexity tiers. The chess precedent proves this community norming works: players learn what numbers mean through aggregate context, not through explanation.

**Overwatch/Valorant rank distributions:** Blizzard and Riot publish rank distributions showing what percentage of players are in each tier. These are widely discussed. But Robot Uprising's tiers are not skill-based — anyone can be in any tier by choosing their complexity level. You can't "climb" complexity tiers the way you climb ranked ladders. The tiers are architectural choices, not achievements.

**Strava segment leaderboards with age/weight categories:** Strava lets runners and cyclists compare segment times filtered by age group and weight class. A 45-year-old competing against other 45-year-olds gets a more meaningful comparison than against the overall field. Complexity tiers are the equivalent of age groups — a structural category that changes expected performance, not a skill differentiator.

**Lichess puzzle storm histograms:** Lichess shows a histogram of puzzle storm scores across all participants, with the player's score marked on the distribution. The visual is nearly identical to the Mirror's accuracy distribution — a histogram with a personal marker. Lichess proves the format is legible without explanation: players immediately understand their position in a crowd.

**F1 telemetry overlays:** F1 teams overlay their car's telemetry against competitors' data to identify where they're gaining or losing time. The comparison is meaningful only when both cars are on the same track in the same conditions. The Mirror applies the same principle: compare diagnostic accuracy only against players with similar architectural complexity. Cross-tier comparison is as misleading as comparing wet-weather lap times against dry-weather ones.

**Stack Overflow reputation by tag:** A user with 2,000 reputation in a niche tag (COBOL) is more notable than a user with 5,000 in a broad tag (JavaScript). The tag context changes the meaning of the number. Complexity tiers function the same way: 65% in HYPERCONNECTED is more notable than 88% in MINIMAL. The tier is the tag.

---

## Audio Cues

- **Opening the leaderboard panel**: a soft ascending chime — three notes, C-E-G, each 80ms, played on a digital marimba. Light, data-oriented, not dramatic. Volume: 20% of game audio.
- **Tier transition** (when rolling average crosses a tier boundary): a low sustained tone (200ms) followed by the new tier label appearing with a brief glow. The tone is lower for upward transitions (moving to a more complex tier) and higher for downward transitions. The pitch direction is counterintuitive — moving "up" in complexity produces a lower sound, because the lower sound feels heavier, denser. The higher sound for simplification feels lighter, cleaner.
- **Screenshot capture**: a single crisp click, 50ms, at 20% volume. The camera metaphor is universal.
- **Scatter plot drill-down expanding**: a soft whoosh, 200ms, descending pitch — like a drawer sliding open. Volume: 15%.
