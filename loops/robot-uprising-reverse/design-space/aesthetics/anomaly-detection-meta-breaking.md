# Anomaly Detection for Meta-Breaking Discoveries

**Aspect:** 7.11d — Anomaly detection for meta-breaking discoveries: rate-of-change in duration metrics to detect sudden shifts indicating a broken discovery; "the spike detector"; auto-flagging configs at inflection points for designer review

**Category:** aesthetics/community
**Wave:** 7 — Cross-Cutting Synthesis
**Parent:** 7.11 — Match duration as community health signal ("The Pulse")

---

## The Core Design Problem

The Pulse tracks match duration across the Gauntlet population as a community health metric. But raw averages are lagging indicators — by the time the 7-day rolling average visibly drops, a broken strategy has already been in circulation for days, warping matchmaking, demoralizing opponents, and potentially damaging retention. The spike detector is the immune system that supplements The Pulse's vital signs: a real-time anomaly detection layer that watches not the *value* of duration metrics but their *rate of change*, flagging sudden inflection points the moment they occur rather than after the damage is done.

The design challenge is multifaceted: How does the system distinguish between a genuine meta-breaking discovery (a single player finds a relay-striker hook pattern that ends games in 15 ticks) and normal meta oscillation (rush strategies gain popularity for a week, then defenses adapt)? How does it surface these detections to designers without creating alert fatigue? And — most importantly for an aesthetics exploration — what does this system *look like* to the community? Is the spike detector invisible infrastructure, or is it a visible part of the game's living meta narrative?

---

## How Live-Service Games Detect Meta Shifts

### Riot Games: The Balance Framework as Quantified Immune Response

Riot's Champion Balance Framework stratifies champion performance across four player groups — Average, Skilled, Elite, and Professional — and defines explicit thresholds for when a champion is "overpowered" or "underpowered" based on win rate and pick/ban rate within each tier. This is not anomaly detection per se; it is threshold-based monitoring. A champion crosses a line (e.g., 54% win rate at Elite with >5% pick rate), and it enters the queue for nerfs. The framework is publicly documented and transparent — players can predict which champions will be nerfed by applying the same thresholds Riot publishes.

What makes this relevant to Robot Uprising: Riot is *data-informed, not data-driven* — they incorporate data but never let it dictate decisions unilaterally. The Balance Framework is a triage system, not an automated nerf gun. Robot Uprising's spike detector should similarly flag anomalies for designer review rather than triggering automatic balance changes.

Riot also tracks **meta diversity targets** — how many viable champions exist at each tier. When diversity drops below target, that itself is a signal. This parallels Robot Uprising's need to track blueprint archetype diversity alongside raw duration metrics.

### AWS Lookout for Metrics: Machine Learning Anomaly Detection in Games

Amazon's Lookout for Metrics, integrated with their Game Analytics Pipeline, uses machine learning to detect anomalies in game telemetry without requiring ML expertise. The system learns baseline patterns from historical data and flags deviations that exceed expected variance. Critically, it performs **root cause analysis** — not just "something is anomalous" but "this anomaly correlates with this specific variable." For Robot Uprising, this maps to: "Match duration spiked down → correlated with a specific blueprint configuration that appeared 48 hours ago."

### Clash Royale: Win Rate Monitoring at Card Level

Supercell monitors individual card usage rates and win rates, expecting healthy cards to sit between 5-15% usage across ranking tiers. When a card breaks out of this band — usage spikes to 40% while win rate climbs to 60% — the balance team intervenes. The key insight: they watch *usage rate AND win rate together*, because high usage with average win rate is different from high usage with high win rate. The former means "popular but balanced." The latter means "broken."

For Robot Uprising, the equivalent is: a specific skill/hook/rule combination appearing in 40% of Gauntlet configs with a 65% win rate AND compressing match duration by 30%. All three signals converging on the same configuration is the strongest possible "broken discovery" indicator.

### Zachtronics Histograms: The Distribution as the Signal

Opus Magnum's leaderboard histograms show the full distribution of player solutions across cost, cycles, and area. The histogram IS the diagnostic — when the community discovers a new optimization technique, the histogram shifts visibly. A new cluster forms below the previous minimum. The old bell curve develops a secondary peak. The shape of the distribution tells the story of what the community has discovered.

This is the most aesthetically relevant precedent for Robot Uprising. The Pulse already shows a histogram of match durations. The spike detector watches for changes in the *shape* of that histogram — not just the mean, but the skew, the kurtosis, the emergence of secondary modes.

### Speedrun Communities: Statistical Improbability as Fraud Detection

The Dream speedrun controversy demonstrated that anomaly detection via statistical analysis — showing that a player's RNG luck was billions-to-one improbable — is a powerful forensic tool. The academic framework Tracer (Tamper Recognition via Analysis of Continuity and Events in game Runs) formalizes this into a modular forensic pipeline. For Robot Uprising, this has a narrower application: detecting not cheating but *exploitation* — a configuration so effective that its results look statistically implausible given the game's intended balance targets.

### Academic Meta Prediction Frameworks

A 2024 framework for predicting the impact of game balance changes through meta discovery uses reinforcement learning to simulate how a meta evolves after a balance patch. The system plays thousands of matches with AI agents to forecast which strategies will emerge as dominant before the patch goes live. This is *proactive* anomaly detection — finding the spike before it happens. For Robot Uprising's deterministic tick-based engine, this is particularly tractable: the game could simulate thousands of Gauntlet matchups overnight to test whether a newly popular configuration is genuinely broken or just unexplored counter-play territory.

---

## The Spike Detector: Mechanical Design

### What It Watches

The spike detector monitors six primary metrics, each computed as a sliding window with 1-hour, 6-hour, 24-hour, and 7-day granularity:

1. **Mean match duration** (in ticks) — the headline number. Sudden drops indicate rush dominance; sudden rises indicate defensive stagnation.
2. **Duration variance** (standard deviation) — measures how spread out match lengths are. Variance collapse means the meta is converging on a single game plan. Variance explosion means something chaotic entered the ecosystem.
3. **Duration skew** — a left-skewed distribution (long tail of short games) indicates rush strategies proliferating. Right-skewed (long tail of long games) indicates defensive metas.
4. **Blueprint archetype concentration** — the Herfindahl-Hirschman Index (HHI) of configuration archetypes. HHI approaching 1.0 means one archetype dominates. HHI near 0 means high diversity.
5. **Win rate by configuration cluster** — K-means clustering of configurations by their skill/hook/rule signatures, with per-cluster win rates tracked over time.
6. **New configuration adoption rate** — how quickly a novel configuration (one that didn't exist 48 hours ago) spreads through the population. Viral adoption is itself an anomaly signal.

### How It Detects Spikes

The detector uses a **derivative-threshold model** — it computes the first and second derivatives of each metric over time and flags when the rate of change exceeds historical norms:

- **First derivative spike:** "Match duration is dropping faster than any 24-hour period in the last 30 days." This catches linear trends — the meta is shifting steadily in one direction.
- **Second derivative spike (inflection point):** "The *acceleration* of duration change just reversed — it was dropping slowly and is now dropping fast." This catches the *moment of discovery* — the inflection point where a new strategy goes from niche experiment to viral adoption.
- **Distribution shape change:** Using the Kolmogorov-Smirnov test, the detector compares the current 24-hour duration distribution against the 7-day baseline. A statistically significant shape change (p < 0.01) triggers a flag even if the mean hasn't moved much — because bimodal distributions (stomps + drawn-out games) can have the same mean as a healthy unimodal one.

### What Happens When a Spike Is Detected

The spike detector does NOT trigger automatic balance changes. It generates a **Meta Anomaly Report** — a structured document sent to the design team (and optionally surfaced to the community) containing:

1. **The spike signature:** Which metrics deviated, by how much, when the inflection point occurred.
2. **The suspect configurations:** The top 5 blueprint configurations most correlated with the anomaly, ranked by (a) win rate, (b) adoption velocity, (c) duration compression.
3. **The matchup matrix:** How the suspect configurations perform against each other and against the previous meta's dominant archetypes.
4. **The counter-play assessment:** Whether any existing configurations in the population show a positive win rate against the suspect. If yes, the meta may self-correct. If no, intervention is likely needed.
5. **The timeline:** A tick-by-tick narrative of when the configuration first appeared, who invented it, how it spread.

---

## The Aesthetics: What the Community Sees

### The Seismograph

On The Pulse dashboard, the spike detector manifests as a **seismograph trace** — a horizontal line running across the bottom of the main Pulse display, normally flat with gentle low-amplitude waves (healthy meta oscillation), that spikes dramatically when an anomaly is detected. The seismograph traces the second derivative of match duration — the *acceleration* of meta change.

**Visual treatment:** The seismograph line is rendered in a dim teal during quiet periods, barely visible against the dashboard's dark background — just a gentle heartbeat confirming the system is alive. When the first derivative exceeds the 1-sigma threshold, the line shifts to amber and its amplitude increases, the trace becoming more visible. At the 2-sigma threshold (a genuine spike), the line turns bright coral and the peaks become dramatic — the seismograph looks like it's recording an earthquake. The line has a phosphor-glow persistence effect, so each spike leaves a fading afterimage that decays over ~3 seconds, creating a visual history of recent volatility.

**Sound treatment:** The seismograph has an optional audio mode — a low, rhythmic pulse synchronized with each data point (once per hour in the default view). During quiet periods, this pulse is barely audible, a deep sub-bass thud like a distant heartbeat. As the detector enters amber territory, the pulse quickens and gains mid-range harmonics — it sounds increasingly urgent without being alarming. At spike detection, a sharp crystalline chime cuts through — the "discovery bell" — a single bright tone that says *something just happened.*

### The Anomaly Pin

When a spike is confirmed (2-sigma sustained for 6+ hours), a **pin** appears on The Pulse's timeline — a vertical marker with a diamond icon at the top, colored coral. Hovering over the pin reveals a tooltip: "Meta Anomaly Detected — [timestamp]. Tap to explore." Tapping opens the Anomaly Detail Panel.

### The Anomaly Detail Panel

A slide-out panel from the right side of the screen, showing the Meta Anomaly Report in player-readable form:

- **Header:** "ANOMALY: Duration Compression Detected" with a coral accent bar.
- **The Spike Chart:** A zoomed-in view of the duration metric around the inflection point, with the exact moment of the spike marked by a vertical dashed line. Before the line: the old baseline. After: the new regime. The visual difference should be immediately legible — this is not a subtle statistical detail, it's a visible cliff or ramp in the data.
- **The Suspect Configs:** Anonymized blueprint summaries (showing skill/hook/rule composition but not player names) of the top 3 configurations correlated with the spike. Each config is rendered as a miniature blueprint card — the same visual language used in the Plan screen's workbench. Players who recognize the configuration from their own Gauntlet matches will have an "aha" moment.
- **The Ecosystem Impact:** A before/after archetype diversity chart — a stacked bar showing the percentage of Gauntlet configs belonging to each archetype cluster, comparing the 7-day-ago baseline to the current state. If the spike corresponds to one archetype growing from 8% to 45%, it's visually obvious.
- **The Counter-Play Signal:** A green/amber/red indicator. Green: "Counter-strategies exist in the population — meta may self-correct." Amber: "Limited counter-play detected — monitoring." Red: "No effective counter-strategies found — designer review recommended."

### The Community Narrative

The spike detector is not hidden infrastructure. It is a *character* in the meta narrative — "The Sentinel," a subsystem of the game's AI that monitors the Gauntlet ecosystem. When an anomaly is detected, The Sentinel can optionally post a message to the community feed:

> **[SENTINEL]** Anomaly detected at T+72:14:00. Duration variance increased 340% over the last 24 hours. Three new configuration patterns are under observation. The ecosystem is adapting.

This framing — the game's AI watching the meta and reporting on it — reinforces the core fantasy of Robot Uprising (you are an AI managing systems) while making balance monitoring feel diegetic rather than administrative. The Sentinel does not judge or punish. It observes and reports. The community decides whether the anomaly is exciting (a genuine discovery) or problematic (a broken exploit).

---

## Player Journeys

### Journey: Mara, 28, Data Engineer & Gauntlet Enthusiast

**Context:** Mara has been playing Robot Uprising for 3 months. She reached Diamond tier in the Gauntlet last season with a relay-heavy information warfare architecture. She checks The Pulse every morning like a stock ticker. It's Tuesday, mid-season.

**Minute 0:00 — The Morning Pulse Check**
Mara opens the Gauntlet lobby. The Pulse dashboard fills the screen — the familiar heartbeat line of mean match duration trending smoothly around 58 ticks for the past two weeks. But today, the seismograph at the bottom catches her eye. The trace is amber, its amplitude visibly elevated compared to yesterday. The phosphor-glow afterimages show repeated medium spikes over the last 12 hours. Something is stirring.

She hovers over the seismograph. A tooltip reads: "Meta Velocity: 1.4σ above baseline. Elevated rate of change in match duration detected over the last 18 hours." Not a full anomaly yet — amber, not coral. But trending.

**Minute 0:30 — The Duration Drop**
She scrolls to the duration histogram. The familiar bell curve centered at 58 ticks now has a faint secondary bump forming at 22-25 ticks. Games are ending much faster than the baseline. The bump is small — maybe 8% of matches — but it wasn't there yesterday. Mara's data engineering instincts fire: that's a bimodal distribution forming. Something new entered the ecosystem.

She taps the histogram's 22-25 tick region. A filter applies, showing recent matches that ended in that range. The win rates are lopsided — 78% win rate for the attacker in those short matches. Whatever is causing this, it's not a close game that happens to end quickly. It's a stomp.

**Minute 1:30 — The Suspect**
Mara navigates to the archetype concentration panel. The HHI index has climbed from 0.12 (healthy diversity) to 0.19 over 18 hours. One archetype cluster — labeled "Scout-Swarm-Hook-Chain" by the system's clustering algorithm — has grown from 4% to 14% of the population. She taps the cluster label. A miniature blueprint card appears: 3 scouts with overlapping perception radii, each wired to a shared "flood" channel, a single striker with a rule that says "if flood channel has 3+ entries, engage nearest tagged enemy." The scouts flood the channel with positional data, the striker gets a guaranteed lock within 20 ticks, and the game ends before the defender's relay network can establish information superiority.

Mara thinks: *That's clever. Three scouts are cheap — 9 minerals total — and the striker only needs one clean signal to kill. The defender's relays are still booting up when the striker already has target lock.*

**Minute 2:30 — The Counter-Play Question**
She checks her own match history. Two of her last five matches were against this archetype. She lost both — her relay-heavy build takes 30 ticks to establish full coverage, by which point the scout swarm has already fed the striker everything it needs. Her architecture is optimized for the 50-70 tick game. The 22-tick game doesn't give her time to play her game.

She opens her workbench and starts theorycrafting a counter: a scout with an "ignore flood" context filter (to avoid being overwhelmed by the swarm's noise), paired with a striker positioned defensively near her base. If she can survive the initial rush, her relay network takes over. She queues three Gauntlet matches to test.

**Minute 5:00 — Resolution**
By the time she finishes her test matches (1 win, 2 losses — her counter needs refinement), The Pulse has updated. The seismograph trace is deeper amber now, approaching coral. The scout swarm archetype has grown to 17%. Mara checks the counter-play indicator: amber — "Limited counter-play detected — monitoring." She shares her counter-build attempt in the community feed, tagging it with the anomaly timestamp. Other players are already discussing the scout swarm — some excited by the new discovery, others frustrated by the stomps. The Sentinel's next community post reads:

> **[SENTINEL]** Duration anomaly sustained. Mean match duration has decreased 12% in the last 24 hours. Configuration diversity index declining. Counter-strategy adoption rate: 3.2%. Observation continues.

Mara grins. This is exactly why she plays the Gauntlet — the ecosystem is alive, and she's part of the immune response.

**UI Annotations:**
- **Seismograph trace:** Horizontal line at bottom of Pulse dashboard, ~20px tall, teal/amber/coral color states, phosphor-glow persistence on spikes
- **Duration histogram:** Interactive — tappable regions filter to matches in that duration band, showing win rates and archetype breakdown
- **Archetype concentration panel:** HHI index displayed as a single number with a trend arrow, archetype list sortable by growth rate
- **Counter-play indicator:** Circular badge, green/amber/red, with hover tooltip explaining the assessment
- **Sentinel messages:** Styled as system log entries — monospaced font, bracketed sender tag, no avatar, teal text on dark background

---

### Journey: Dev Team (Riku, 35, Lead Designer), Internal Dashboard

**Context:** Riku leads balance design for Robot Uprising. It's Wednesday morning. The spike detector has escalated from amber to coral overnight — a full anomaly flag. Riku opens the internal designer dashboard, which shows everything the player-facing Pulse shows plus additional data: player IDs, retention impact, and the full Meta Anomaly Report.

**Minute 0:00 — The Alert**
Riku's Slack has a message from the automated monitoring bot: "SPIKE DETECTOR: Coral flag triggered at 03:47 UTC. Mean duration 1st derivative: -2.3σ. 2nd derivative inflection detected at 22:15 UTC yesterday. Suspect cluster: Scout-Swarm-Hook-Chain (ID: cluster_0847). Full report attached."

He opens the internal dashboard. The Meta Anomaly Report is already generated. The spike chart shows the inflection point clearly — a smooth baseline at 58 ticks, then a visible knee at 22:15 UTC yesterday where the decline accelerates. The acceleration is the key — duration was already drifting down slightly (normal end-of-week pattern as competitive players push harder), but at 22:15, the slope doubled. Something specific happened at that moment.

**Minute 1:00 — Patient Zero**
The internal dashboard shows what the player-facing version does not: the identity of "patient zero" — the first player to deploy the scout swarm configuration in the Gauntlet. The timeline shows: Player ID 7742 ("TinkerBot") deployed the configuration at 21:50 UTC. Won 4 consecutive matches in 18-24 ticks. By 22:15, two opponents they beat had copied the configuration (the inspector's config-sharing feature makes this easy). By midnight, 14 players were running variants. By 06:00, 89 players. The viral coefficient is 2.3 — each adopter spawns 2.3 new adopters per 6-hour window.

Riku notes that TinkerBot is a Silver-tier player. The configuration isn't a high-skill exploit — it's a simple, cheap build that works because nobody has adapted to it yet. This is exactly the kind of discovery the spike detector was designed to catch: not a bug, not a cheat, but a legitimate strategy that the meta hasn't yet developed antibodies for.

**Minute 3:00 — The Intervention Decision**
Riku consults the counter-play assessment. The automated system has simulated 10,000 matchups between the scout swarm and every archetype in the current top 100. Results: 23 existing archetypes have a positive win rate against the swarm. The best counter — a "silent striker" build with no hooks (emitting zero EM noise, invisible to the scouts' perception) — wins 71% of the time. But only 2 players in the entire Gauntlet are currently running anything close to that build.

This tells Riku: the counter exists but hasn't been discovered yet. The meta *can* self-correct if given time. His options:

1. **Do nothing.** Let the meta adapt. The counter exists. Players like Mara are already theorycrafting. Estimated self-correction time: 3-7 days based on historical precedents.
2. **Nudge.** Surface a hint in the Sentinel's community post: "Counter-strategies involving reduced EM emissions show promise against high-scout configurations." Not a direct answer, but a directional clue. This accelerates self-correction without robbing players of the discovery moment.
3. **Intervene.** Adjust scout perception range from 5 to 4, making the swarm pattern less reliable. This is a balance patch — heavy-handed, but justified if the anomaly persists for 7+ days without self-correction.

Riku chooses option 2 — the nudge. He drafts a Sentinel message and schedules it for the next community update. He sets a 7-day watchdog: if the anomaly hasn't resolved by next Wednesday, the detector will escalate to "intervention recommended" and he'll revisit option 3.

**Minute 5:00 — Resolution**
Riku logs his decision in the anomaly response history. The internal dashboard now shows a timeline of every anomaly flag, the decision made, the outcome. Three months of data show that 7 of 9 previous anomalies self-corrected within 5 days. One required a nudge (which worked in 3 days). One required a balance patch (a relay compression loop that created an infinite information amplification chain — a genuine bug, not a strategy). The spike detector's track record gives Riku confidence that the scout swarm will resolve organically.

**UI Annotations:**
- **Internal dashboard:** Same layout as player-facing Pulse, with additional "Designer Mode" toggle that reveals player IDs, viral coefficient graph, simulated counter-play results
- **Patient zero timeline:** Horizontal timeline showing the first instance of the configuration, each subsequent adoption as a dot on the line, with branching showing who copied from whom — a viral spread tree
- **Counter-play simulation results:** Matrix of suspect config vs. top 100 archetypes, color-coded cells (green = counter wins, red = suspect wins), sortable by win rate
- **Decision logging:** Structured form — anomaly ID, decision (observe/nudge/intervene), rationale text field, watchdog timer setting
- **Anomaly response history:** Table of all past anomalies with outcome columns (self-corrected, nudged, patched, false positive)

---

### Journey: Felix, 16, Casual Player, Bronze Tier

**Context:** Felix has been playing Robot Uprising for 2 weeks. He just unlocked the Gauntlet (Mission 5 complete) and has played about 15 Gauntlet matches with a simple scout-striker pair — nothing fancy. He doesn't know what The Pulse is. He's losing a lot this week and isn't sure why.

**Minute 0:00 — The Losing Streak**
Felix queues another Gauntlet match. The sealed watch begins. His scout moves out to patrol. A swarm of three enemy scouts floods the board — he can see them spreading across the grid, their perception radii overlapping in a dense web. His single scout's context window fills almost instantly with noise — three scouts broadcasting position data on overlapping channels. His scout is stunned in tick 8, context overloaded. By tick 14, an enemy striker appears at his base, already locked on. His lone striker is still two tiles away. Tick 18: game over.

Felix frowns. This is the third match in a row that ended before tick 25. His matches used to last 50-60 ticks. He doesn't understand what changed.

**Minute 0:30 — Discovering The Pulse**
In the post-match inspector, Felix notices a small icon in the top-right corner he hasn't seen before — a tiny coral diamond with a pulse line through it. It's pulsing gently. He taps it. The Pulse dashboard opens for the first time. He sees the duration histogram with its bimodal bump at 20-25 ticks and the seismograph trace in coral.

At the top of the dashboard, a Sentinel message is pinned:

> **[SENTINEL]** An unusual pattern has been detected in the Gauntlet ecosystem. Some configurations are ending matches significantly faster than the historical average. The meta is shifting. Counter-strategies involving reduced EM emissions show promise.

Felix doesn't fully understand "reduced EM emissions," but the phrase "counter-strategies" grabs him. He taps the Sentinel message. It expands to show the Anomaly Detail Panel — the suspect configs rendered as miniature blueprint cards. He recognizes the three-scout pattern from his last three losses.

**Minute 1:30 — The Learning Moment**
The Anomaly Detail Panel has a "Learn More" button at the bottom. Felix taps it. A brief explainer appears — not a tutorial, but a contextual hint:

> "Scout swarms generate high EM noise. Units that minimize their own transmissions become harder for scouts to detect. Consider blueprints with fewer hook slots used, or context filters that ignore noisy channels."

Felix thinks: *My scout has both its hook slots broadcasting position data. That's making it a target. What if I made a striker that doesn't broadcast anything — just listens?*

He returns to the workbench. He creates a new striker blueprint: no hooks equipped (both hook slots empty), context filter set to "listen: all / ignore: none," rule: "if enemy in perception range, engage." No signals in, no signals out. A silent predator.

**Minute 3:00 — The Counter-Discovery**
Felix queues a match with his new "silent striker" build. The enemy scout swarm deploys as usual. But this time, Felix's striker emits zero EM noise. The swarm's scouts can see it when it's in their perception range (2 tiles), but they can't detect it from across the map the way they could with a broadcasting unit. Felix's striker reaches the enemy's base by tick 30 — the swarm was looking for signals, not watching for silent approaches. He wins.

Felix pumps his fist. He doesn't know it, but he just independently discovered the same "silent striker" counter that the automated system identified. He feels like a genius. He queues three more matches.

**Minute 5:00 — Resolution**
Felix wins 2 of 3 matches with his silent striker build. He's excited. He opens the community feed and posts: "silent striker with NO hooks beats the scout spam. just don't transmit anything lol." He doesn't realize he's contributing to the meta's immune response — he's just sharing something that worked. But his post, combined with the Sentinel's nudge and Mara's earlier theorycrafting, accelerates the adoption of counter-strategies. The spike detector's 24-hour update shows the scout swarm's win rate has dropped from 78% to 61%. The self-correction is underway.

**UI Annotations:**
- **Anomaly indicator icon:** 16x16 coral diamond with embedded pulse line, positioned top-right of inspector screen, pulses when an active anomaly exists, static when no anomaly
- **Sentinel pinned message:** Elevated position at top of Pulse dashboard during active anomalies, coral left-border accent, expandable
- **Learn More button:** Bottom of Anomaly Detail Panel, styled as a secondary action (outline button, not filled), opens contextual hint — not a full tutorial
- **Contextual hint:** 2-3 sentences maximum, uses game vocabulary the player has already learned, ends with a concrete suggestion ("Consider blueprints with...")
- **Silent striker blueprint:** Visible empty hook slots (dashed outlines, unfilled) communicate the "no signals" strategy visually — the absence of hooks IS the design

---

### Journey: Anika, 42, Community Manager & Streamer

**Context:** Anika streams Robot Uprising Gauntlet matches three times a week. She has 2,000 concurrent viewers. It's Thursday — the scout swarm anomaly is 48 hours old. She's doing a "Meta Report" stream where she analyzes The Pulse live on camera.

**Minute 0:00 — The Stream Opens**
Anika shares her screen showing The Pulse dashboard. The seismograph is in full coral — dramatic spikes filling the trace, phosphor-glow afterimages creating a wall of orange-red intensity. Chat immediately reacts: "THE SEISMOGRAPH IS ON FIRE" and "scout spam meta lmao."

She zooms into the spike chart. The inflection point at 22:15 UTC two days ago is clearly visible — the moment the meta cracked. She narrates: "Look at this knee in the curve. Right here — Tuesday night. Before this point, average match duration was flat at 58 ticks for two weeks. Then someone figured something out, and within 24 hours we're down to 44 ticks average. The seismograph caught it within 6 hours."

**Minute 1:00 — The Suspect Analysis**
She opens the Anomaly Detail Panel. The three suspect configs are displayed as blueprint cards. She clicks the top one — the classic three-scout-one-striker pattern. "This is 'The Locust' — that's what the community is calling it. Three scouts, overlapping perception, shared flood channel, one striker waiting for the triple-confirm signal. It costs 17 minerals total. That's insanely cheap. And it ends games in 18-22 ticks."

She pulls up the archetype concentration chart. "Look at this. The Locust went from 4% of the Gauntlet population to 31% in 48 hours. That's viral. The HHI index jumped from 0.12 to 0.24. We haven't seen concentration this high since the Relay Loop exploit in Season 1."

**Minute 2:30 — The Counter-Play Dashboard**
She navigates to the counter-play indicator — it's shifted from amber to green overnight. "Oh! The counter-play indicator just went green. That means the system has detected viable counter-strategies in the wild. Let's see..." She taps to expand. "Silent striker builds — no hooks, no EM noise — are showing a 67% win rate against The Locust. And look at the adoption curve here — Felix_Bronze posted about it yesterday and now 140 players are running variants. The meta is healing itself."

Chat explodes: "FELIX SAVED THE META" and "silent striker gaming."

**Minute 4:00 — The Seismograph Narrative**
Anika pulls the seismograph view to full screen. "I want to show you something beautiful. Watch the trace over the last 48 hours." She scrubs the timeline slowly. "Here's the initial spike — that's The Locust entering the ecosystem. The amplitude goes from nothing to massive in 6 hours. Then here — about 24 hours in — the spike amplitude starts decreasing. Not because The Locust went away, but because counter-strategies are appearing. The rate of change is slowing. The second derivative is approaching zero again. The ecosystem found its antibodies."

She pauses. "This is what I love about this game. The spike detector isn't a balance tool. It's a *narrative engine*. It's telling us a story about discovery, adaptation, and evolution — in real time. Every season has these moments, and The Pulse makes them visible."

**Minute 5:00 — Resolution**
Anika ends the segment by showing the Anomaly Detail Panel's timeline — from patient zero's first deployment to the counter-strategy emergence. "The whole arc — discovery, viral spread, community response, self-correction — played out in 48 hours. No balance patch needed. The Sentinel flagged it, nudged the community toward counter-play, and the players did the rest. That's good game design."

She queues a Gauntlet match to test her own Locust counter-build on stream. The next Meta Report stream will show whether the anomaly fully resolved or if the designer team needed to intervene.

**UI Annotations:**
- **Seismograph full-screen mode:** Expandable to fill the Pulse dashboard's main panel, with timeline scrubbing (drag horizontally to move through time), amplitude scaled to show historical context
- **Anomaly timeline:** Horizontal lane below the spike chart showing key events as labeled markers — "First deployment," "10 adopters," "100 adopters," "Counter discovered," "Counter spreading" — each with timestamps
- **Archetype concentration chart:** Stacked horizontal bar, smoothly animated transitions when scrubbing through time, dominant archetype highlighted with a glow outline
- **Counter-play indicator transition:** Animated shift from amber to green includes a brief "pulse" effect — the indicator ring expands and contracts once, drawing attention to the state change

---

## Strengths and Weaknesses

### Strengths

**Turns balance monitoring into content.** Most games hide their balance monitoring behind closed doors. The spike detector makes meta-anomaly detection a visible, communal experience — something streamers narrate, community members discuss, and casual players learn from. This is a content generation engine that requires zero developer-produced content.

**Preserves player agency in the meta.** By defaulting to observation and nudges rather than automatic nerfs, the system respects the community's ability to self-correct. Players who discover counter-strategies feel like heroes of the meta narrative, not beneficiaries of developer intervention.

**Creates a legible meta-narrative.** The seismograph, the Sentinel messages, the anomaly pins on the timeline — these create a *story* of each season's meta evolution that is readable by any player, not just analysts. "Remember when The Locust broke the meta for 48 hours?" becomes a shared community memory.

**Teaches real anomaly detection skills.** The spike detector's vocabulary — rate of change, inflection points, distribution shape, derivative thresholds — maps directly to real data science and monitoring concepts. Players absorb these ideas through gameplay without a lecture.

### Weaknesses

**Alert fatigue risk.** If the system flags too many anomalies that self-correct harmlessly, players will learn to ignore the seismograph. The thresholds must be calibrated so that coral flags are genuinely rare (1-2 per season) and amber flags don't persist for more than 48 hours without resolving.

**Streisand effect on exploits.** By publicly flagging anomalous configurations, the spike detector effectively broadcasts "this strategy is powerful" to the entire community, potentially accelerating adoption of broken strategies before counters emerge. The design relies on counter-strategies emerging faster than exploit adoption, which may not always hold.

**Cold start problem.** The detector needs historical baseline data to calibrate its thresholds. In the first season, every meta shift is technically an anomaly because there's no established baseline. The system needs a burn-in period before its signals are meaningful.

**Clustering accuracy.** The archetype clustering (K-means or equivalent) must be tuned carefully. If the clustering is too coarse, distinct strategies get lumped together and the detector misses targeted anomalies. If too fine, every minor variation creates a new "archetype" and the concentration metrics become noise.

---

## Interaction Effects

**With The Pulse (7.11):** The spike detector is a layer on top of The Pulse's existing duration metrics. It adds the seismograph trace, anomaly pins, and the Sentinel narrative to the dashboard. Without The Pulse, the spike detector has no surface to display on. Without the spike detector, The Pulse is a lagging indicator that shows trends after they've already played out.

**With the Historical Pulse Archive (7.11c):** Every anomaly is automatically archived as a labeled event in the season history. The "Meta History Museum" gains a collection of anomaly case studies — each one a complete narrative arc with discovery, spread, counter-play, and resolution. This becomes educational material for new players: "In Season 3, The Locust dominated for 48 hours before the Silent Striker counter emerged."

**With Per-Tier Pulse Decomposition (7.11e):** Anomalies may manifest differently at different tiers. A strategy that dominates Bronze (where players don't know the counter) may be irrelevant in Diamond (where everyone already runs defenses). The spike detector must run per-tier to avoid population-level averaging that masks tier-specific problems.

**With the Inspector (locked):** The Inspector's decision trace and context window replay are the *forensic tools* players use to understand WHY a flagged configuration works. The spike detector says "this is anomalous." The Inspector shows "here's exactly how it wins." Together, they create the full investigation loop.

**With the Blueprint Codex (locked):** When a new configuration archetype is flagged by the spike detector, the Codex could highlight the specific skills and hooks that compose it — helping players understand the building blocks of the anomalous strategy so they can theorize counters without reverse-engineering the full blueprint from match replays.

---

## Comparable Games/Media

**Riot Games' Balance Framework:** The closest real-world equivalent — stratified win rate/pick rate thresholds triggering designer review. Robot Uprising's spike detector goes further by watching *rate of change* rather than absolute thresholds, catching the inflection point rather than waiting for sustained overshoot.

**Zachtronics Leaderboard Histograms:** The visual precedent for showing the *distribution* of outcomes, not just averages. When the community discovers a new optimization, the histogram shifts visibly. Robot Uprising's duration histogram serves the same role — the bimodal bump at 22 ticks IS the anomaly, visible in the shape of the data.

**Stock Market Circuit Breakers:** Financial markets use automated detection of rapid price changes to trigger trading halts — giving the market time to absorb information before panic cascades. The spike detector's escalation tiers (amber → coral → designer intervention) function similarly: increasing levels of attention and response as the rate of change intensifies.

**Epidemiological Surveillance:** The CDC's syndromic surveillance system watches for unusual patterns in emergency department visits — not absolute numbers, but rate-of-change spikes that might indicate a disease outbreak. The spike detector applies the same logic to meta-health: a sudden shift in the "symptoms" (match duration, archetype concentration) may indicate a new "pathogen" (broken strategy) entering the ecosystem.

**Dream Speedrun Controversy:** Statistical anomaly detection applied post-hoc to demonstrate that observed outcomes were implausibly lucky. The spike detector applies similar statistical reasoning in real-time: if a configuration's win rate is so high that it falls outside the expected distribution, the system flags it — not as cheating, but as a potential balance issue.

---

## Sensory Description

**The Seismograph in Quiet Mode:** A thin teal line at the bottom of The Pulse dashboard, barely 12 pixels tall, with the gentlest of undulations — like watching a sleeping person's breathing monitor. The glow is soft, almost subliminal, the kind of thing you stop noticing after 10 seconds. The ambient sound (if audio is on) is a sub-bass pulse every few seconds, felt more than heard, like a building's HVAC system humming through the floor.

**The Seismograph in Amber Mode:** The line thickens to 20 pixels, the color shifting from teal to warm amber. The undulations are larger now — visible peaks and troughs that draw the eye. The phosphor-glow persistence kicks in, each peak leaving a fading amber ghost that takes 2 seconds to decay, creating a streaky, urgent trail. The audio pulse quickens, gains a mid-range click component — the heartbeat is elevated, alert but not panicked. Players who glance at The Pulse will notice immediately: something is off.

**The Seismograph in Coral Mode:** The line expands to 32 pixels, dominating the bottom of the dashboard. Bright coral spikes punch upward like an EKG during cardiac arrest — sharp, dramatic, impossible to ignore. The phosphor persistence is now 4 seconds, creating overlapping ghost-spikes that blend into a glowing coral smear. The discovery bell chimes — a single crystalline tone, high and clear, cutting through any ambient audio like a notification you can't silence. The entire Pulse dashboard's border gains a subtle coral glow, as if the dashboard itself is blushing with alarm. Players who open the Gauntlet lobby cannot miss it.

**The Anomaly Pin:** A tiny coral diamond, 8 pixels wide, sitting on The Pulse's timeline like a jewel pinned to a ribbon. It catches light — a subtle specular highlight animation rotates around it every 3 seconds, ensuring it's visible against the dark timeline background. Hovering makes it bloom to 16 pixels, revealing a tooltip rendered in the same monospaced font as the Sentinel's messages.

**The Sentinel Message:** Monospaced type in pale teal on a near-black background, left-aligned with a coral vertical rule at the left margin. The text appears letter-by-letter at console speed — not instant, but typed out over 1.5 seconds, as if the AI is composing its observation in real time. The `[SENTINEL]` tag glows slightly brighter than the body text. The overall effect is of reading a log entry from a machine intelligence — clinical, precise, unsentimental, but with an undertone of genuine concern for the ecosystem it monitors.

---

## The TikTok Clip

Fifteen seconds: A streamer has The Pulse open. The seismograph is in full coral mode, spiking dramatically. They zoom into the spike chart, showing the exact moment the meta broke — a visible cliff in the duration line. They flip to the suspect config — three scouts, one striker, absurdly cheap. They flip to the counter-play indicator — it just turned green. They react: "The meta healed itself in 48 hours. No patch needed. The players ARE the balance team." Cut to the seismograph trace calming from coral back to amber — the ecosystem breathing again.

The clip sells the game's thesis: this is a living system, not a static puzzle. The meta is an organism. The spike detector is its immune system. And the players are the antibodies.
