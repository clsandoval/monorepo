# Match Duration as Community Health Signal

**Aspect:** 7.11 — Match duration as community health signal: season meta reports tracking average match length across the Gauntlet population; dropping average match length as indicator of a dominant strategy (stomps increasing); "match length as meta health indicator" as a designed ecosystem diagnostic; when to trigger season resets based on this signal

**Category:** multiplayer/competitive
**Wave:** 7 — Multiplayer & Community

---

## The Core Design Problem

Every competitive game generates a distribution of match durations. That distribution tells a story. When average match length drops suddenly, it usually means one side is winning faster — stomps are increasing, which means a dominant strategy is compressing games before the losing side can mount a response. When average match length rises, it can mean the meta has become defensive, passive, or stagnant — nobody can close games out. When the distribution narrows, it means games are becoming homogeneous — fewer wild outliers, fewer dramatic comebacks, less variance. When it widens, the meta is chaotic — anything can happen, which is exciting but may indicate balance instability.

Robot Uprising's Gauntlet — the asynchronous competitive endgame where player-designed attention architectures compete — needs an **ecosystem diagnostic system** that treats match duration as a first-class health signal. Not just a stat in a database, but a **player-visible, designer-actionable, community-readable** metric embedded in the game's social layer.

The fundamental question: **How does Robot Uprising surface match duration trends to players, designers, and the community in a way that creates healthy competitive behavior — and how does it use those trends to decide when intervention is needed?**

---

## Comparable Systems: How Real Games Use Match Duration

### League of Legends: The 30-Minute Target

Riot Games has spent over a decade engineering League of Legends toward a target average game length of roughly 25-30 minutes. The trend has been consistently downward — from ~34:40 in Season 5 Gold to ~30:00 today, with Challenger dropping from 31:00 to 25:54. This wasn't organic. Riot systematically increased gold generation, reduced item costs, and amplified damage faster than defensive itemization could compensate. Shorter fights. Faster snowballs. More decisive finishes.

**What LoL teaches Robot Uprising:**
- Match duration is a **design variable**, not just a measurement. Riot treats it as a tuning target. Robot Uprising should similarly have a "target match duration distribution" per mission tier, and deviation from that target is a diagnostic signal.
- **Rank stratification matters.** LoL's game length decreases monotonically as skill increases — better players close games faster. If Robot Uprising's Gauntlet shows the same pattern, that's healthy (skilled players exploiting advantages efficiently). If high-tier matches suddenly become *longer* than low-tier, something is broken — the meta may be defensive/stale at the top.
- **Pro play diverges from ladder.** LoL pro matches run 30-35 minutes despite Challenger solo queue at 26 minutes. The meta at the very top, where players respect each other's skill, plays differently. Robot Uprising's top-tier Gauntlet may similarly diverge from the population average.
- **Game length alone is not game health.** As one LoL player argued: "Using game length alone as an indicator of game health is a hilariously flawed interpretation." Extended average game length does not mean snowballing decreased — it may mean the game added arbitrary minutes of inevitable-but-slow losses. Robot Uprising must pair duration with other signals (outcome certainty, lead volatility, strategy diversity).

### StarCraft II: The All-In Compression Signal

StarCraft II's meta history is a textbook example of match duration as strategy indicator. In Wings of Liberty (2010-2013), the prevalence of 1-base and 2-base all-in attacks compressed game lengths dramatically — most games ended after a single decisive aggression. As the meta matured and players learned to defend all-ins, games lengthened into macro play. Spawning Tool's metagame reports track this shift across patches and seasons.

**What SC2 teaches Robot Uprising:**
- **Aggressive metas compress, defensive metas extend.** If Robot Uprising's Gauntlet sees average tick count dropping, it likely means a rush strategy is dominating — one player's architecture overwhelms before the other can deploy their full system. If tick count rises, it may mean both sides are turtling behind relays and command agents, creating stalemated information wars.
- **The "rush → defense → macro → rush" cycle is natural.** SC2's meta oscillated between these phases. Robot Uprising should expect similar oscillation and design its diagnostic to distinguish healthy oscillation from degenerate lock-in.
- **Build order diversity correlates with duration variance.** When SC2's meta supported many viable openings, match duration variance was high. When one build dominated, variance collapsed. Robot Uprising's equivalent: blueprint diversity (how many distinct configurations appear in the Gauntlet) should correlate with tick count variance.

### Into the Breach: Fixed Duration as Design Constraint

Into the Breach takes the radical opposite approach: every battle lasts exactly 5 turns. Match duration is not a variable — it's a constant. The game's depth comes entirely from what happens within those 5 turns, not from how many turns the game lasts.

**What ItB teaches Robot Uprising:**
- **Fixed duration eliminates the snowball problem entirely.** If Robot Uprising's campaign missions have fixed tick limits (and they do — the sealed watch runs for a set number of ticks per mission), then match duration as a health signal is only relevant for the Gauntlet, where battles run to completion (base destroyed or all enemies eliminated).
- **Turn count as a signal within fixed bounds still works.** Even in ItB, a player who wins on turn 3 of 5 (all Vek eliminated early) is playing a very different game than one who barely survives to turn 5. "How early did the outcome become inevitable?" is a more interesting question than "how many ticks did the match last?" — and this connects directly to the EDT (Effective Determination Timestamp) from the Find the Pivot format (7.13).

### Chess: Draw Rate as Duration's Shadow

In chess, deeper opening theory correlates with higher draw rates and more predictable game lengths at the top level. Computer chess testing shows that "the longer the opening lines, the more draws — 9% more draws from 4 to 30 plies." The meta becoming "solved" manifests as games converging toward a narrow duration band with predictable outcomes.

**What chess teaches Robot Uprising:**
- **Convergent match duration = convergent strategy.** If Gauntlet matches cluster tightly around the same tick count, it means most games are following the same trajectory — the meta has collapsed to a narrow set of architectures. Healthy metas produce wide duration distributions.
- **The draw problem.** Chess's draw rate at the grandmaster level is extremely high — sometimes exceeding 70% in classical time controls. If Robot Uprising's Gauntlet ever shows a high rate of "mutual destruction" or "timeout" outcomes at high tiers, that's the equivalent of a chess draw crisis.

### TFT: Elimination Order as Duration Proxy

In TFT, "match length" is measured not in round count (everyone plays the same number of rounds) but in **elimination order** — when you're knocked out. A healthy TFT meta shows a wide range of viable comps reaching top 4 finishes. A stale meta shows the same 2-3 comps consistently placing 1st-3rd while everything else dies by stage 4. Riot uses comp diversity at each elimination stage as a health metric, not raw match duration.

**What TFT teaches Robot Uprising:**
- **Elimination order > raw duration** when matches have a fixed maximum length. If Robot Uprising's Gauntlet uses a tick limit (say 120 ticks), then the interesting metric is *when the game was decided*, not whether it reached the limit.
- **Composition diversity at each stage is the real signal.** What blueprint architectures appear in the Gauntlet top 100? Top 1000? Do the same 3 architectures dominate, or is there genuine diversity? This is more actionable than average match length alone.

### Fighting Games: Round Length as Damage Creep Detector

In the FGC, when a new character is overpowered, average round length drops — the character kills faster than the game intended. Street Fighter's Sagat in SF4 vanilla, Marvel 3's Zero/Vergil/Dante — these characters compressed round times because their damage output exceeded the game's intended survival time. Tournament organizers and balance designers watch round length distributions as an implicit signal of damage balance.

**What fighting games teach Robot Uprising:**
- **Duration compression = one-sided dominance.** If Gauntlet matches are ending in 20 ticks when they used to end in 60, someone found an architecture that kills before the opponent can respond. This is the "rush" signal — and it's the most urgent intervention trigger.
- **Duration expansion = defensive stagnation.** If matches are lasting 100+ ticks when they used to end in 60, the meta is turtling. Both sides are building relay networks and command agents that perfectly counter each other's attacks, creating attritional stalemates. Less urgent than rush dominance but still unhealthy.

---

## The Match Duration Dashboard: "The Pulse"

Robot Uprising's match duration system is called **The Pulse** — a community-visible ecosystem health dashboard accessible from the Gauntlet lobby. The name evokes vital signs, heartbeat monitors, the rhythm of a living system. The Pulse is not a secret designer tool — it's a player-facing feature that makes the community collectively aware of the meta's health.

### What The Pulse Shows

**The Heartbeat Line:** A horizontal sparkline showing the rolling 7-day average match duration (in ticks) for the current Gauntlet season. The line pulses gently — literally animated with a subtle heartbeat rhythm, each pulse corresponding to the latest data point. The Y-axis is tick count. The X-axis is calendar days. The line is rendered in the game's cyan accent color against a dark background.

**The Distribution Heatmap:** Below the heartbeat line, a vertical heatmap showing the full match duration distribution for the last 7 days. Each column is one day. Each row is a 5-tick bin (0-5, 5-10, 10-15, etc.). Color intensity = number of matches in that bin. A healthy meta shows a wide, bell-shaped distribution (many different match lengths). A sick meta shows a narrow, spike-shaped distribution (all matches clustering around the same length).

**The Variance Band:** A shaded region around the heartbeat line showing the interquartile range (25th to 75th percentile). Wide band = diverse meta (healthy). Narrow band = homogeneous meta (concerning). The band color shifts from green (wide) through amber (moderate) to red (narrow) using the same color language as context window utilization.

**The Archetype Breakdown:** A stacked area chart below the heatmap showing what percentage of top-100 Gauntlet deploys use each major archetype (relay-chain, scout-swarm, command-fortress, striker-rush, hybrid). When one archetype's area dominates, the meta is centralized. When multiple archetypes share space, the meta is diverse.

**The Stomp Index:** A single number displayed prominently — the percentage of Gauntlet matches in the last 7 days that ended before tick 30 (or whatever "early" means for the current season map). Displayed as a bold percentage with color coding: <15% = green ("Healthy — few stomps"), 15-30% = amber ("Watch — increasing stomps"), >30% = red ("Alert — dominant rush strategy detected"). The number pulses red when above threshold, creating urgency.

**The Stalemate Index:** The inverse — percentage of matches that hit the tick limit without decisive resolution. Same color coding. High stalemate index = defensive meta. Displayed next to the stomp index so both extremes are visible simultaneously.

### What The Pulse Sounds Like

When a player opens the Gauntlet lobby and The Pulse loads, a low, rhythmic bass note plays — a heartbeat. The tempo of the heartbeat corresponds to the current average match duration: faster heartbeat = shorter matches (aggro meta), slower heartbeat = longer matches (defensive meta). At healthy equilibrium, the heartbeat is a calm, steady 72 BPM — literally a resting heart rate. When the stomp index crosses red threshold, the heartbeat accelerates to 120 BPM — a stressed heart rate. When the stalemate index spikes, the heartbeat slows to 40 BPM — bradycardia. The player unconsciously absorbs the meta's state through ambient audio before reading a single number.

Hovering over the heartbeat line produces a soft *blip* at each data point — the same tone used for signal delivery in the sealed watch, creating an auditory bridge between "watching your match" and "watching the ecosystem."

### What The Pulse Looks Like

The Pulse occupies a collapsible panel on the right side of the Gauntlet lobby screen. When collapsed, only the heartbeat line is visible — a thin cyan sparkline at the edge of the screen, pulsing gently. When expanded, the full dashboard slides out with a smooth 300ms ease-out animation, the background dimming slightly to focus attention. The panel is styled like a medical monitor — dark background, bright data lines, grid lines at regular intervals, clinical sans-serif labels. The aesthetic is deliberately different from the game's cyberpunk style — this is a *diagnostic tool*, not entertainment. It looks like something an engineer would build to monitor a production system, because that's exactly what the Gauntlet IS — a production system of competing AI architectures.

---

## Three Models for Using Duration as Intervention Trigger

### Model A: "The Thermostat" — Automatic Seasonal Modifiers

When The Pulse detects unhealthy duration trends, the system automatically activates mid-season modifiers from the seasonal modifier pool (7.09a) to correct the imbalance. No designer intervention required.

**How it works:**
- **Rush detection:** If the stomp index exceeds 30% for 72 consecutive hours, the system activates a "fortification" modifier — e.g., +2 ticks of spawn invulnerability for newly produced units, or +1 base HP (normally 1-hit). This slows rushes without changing the vocabulary.
- **Stalemate detection:** If the stalemate index exceeds 25% for 72 hours, the system activates an "entropy" modifier — e.g., all units lose 1 context slot per 20 ticks (progressive degradation), or EM detection range increases by 1 each 30 ticks. This forces eventual confrontation.
- **Homogeneity detection:** If the archetype breakdown shows any single archetype exceeding 60% for 72 hours, the system activates a targeted modifier — e.g., if relay-chain dominates, "signal interference" reduces relay perception range by 1. If striker-rush dominates, "reinforced structures" gives bases 2-hit durability.

**Strengths:**
- Responsive. Corrections happen within days, not patches.
- Transparent. Players can see exactly what modifier activated and why (The Pulse shows trigger conditions).
- Self-correcting. Modifiers deactivate automatically when the metric returns to healthy range.

**Weaknesses:**
- Exploitable. Players could intentionally manipulate the meta to trigger favorable modifiers. "If we all rush for 3 days, the game gives us fortification, which favors our relay-chain backup strat."
- Feels automated and soulless. Players may resent being "managed by an algorithm" rather than by designers who understand context.
- Can overcorrect. A 72-hour spike might be a temporary fad, not a structural problem. The thermostat activates too fast for blips, too slow for genuine crises.

**Comparable:** SC2's automated map pool rotation based on winrate data. When maps showed extreme racial imbalance, they were rotated out mid-season.

### Model B: "The Town Crier" — Community-Visible Alerts, Designer Action

The Pulse surfaces alerts to the community, but only designers can take action. The community's role is awareness and discussion, not correction.

**How it works:**
- When any metric crosses a threshold, The Pulse displays a public alert banner in the Gauntlet lobby: **"META ALERT: Stomp index has reached 34%. The development team is monitoring."** The banner is informational, not interventional.
- The development team reviews the data and decides whether to:
  - Deploy a mid-season modifier (manual, not automatic)
  - Adjust the upcoming season's parameters
  - Post a "State of the Gauntlet" community report explaining the trend
  - Do nothing (the meta may self-correct as counter-strategies emerge)

**Strengths:**
- Preserves designer agency. Humans make the call, not algorithms.
- Creates community conversation. Players discuss the alert, theorize about the dominant strategy, propose counter-strategies. This IS the metagame — the game about the game.
- Avoids overreaction. A designer can look at the data and say "this is a temporary fad, let it play out" in a way an algorithm can't.

**Weaknesses:**
- Slow. If the designer is on vacation, the alert sits unanswered for a week.
- Creates expectations. Once players see the alert, they expect action. If the designer does nothing, players feel ignored.
- Requires ongoing investment. Someone must monitor and respond. For an indie game, this may be unsustainable.

**Comparable:** Riot's "/dev" blog posts about the state of League's meta, which respond to community concerns about balance. The developer acknowledges the problem publicly, which defuses community frustration even before fixes ship.

### Model C: "The Immune System" — Player-Driven Counter-Meta Incentives

The system doesn't correct the meta directly. Instead, it **incentivizes players** to counter the dominant strategy by offering rewards for successfully beating it.

**How it works:**
- When The Pulse detects a dominant archetype (>50% representation at a given tier), it creates a **"Bounty Target"** — a challenge displayed in the Gauntlet lobby: **"BOUNTY: Defeat a relay-chain architecture. Reward: 500 circuit tokens."**
- Players who defeat the dominant archetype with a *non-dominant* archetype (verified by config classification) earn the bounty. The bounty scales with the dominance — the more prevalent the archetype, the higher the reward.
- This creates an economic incentive to innovate. Instead of the system telling players what to play, it pays them to solve the problem. The meta becomes self-correcting through player creativity.

**Strengths:**
- Leverages player intelligence. The best counter-strategy comes from players, not algorithms or designers.
- Creates a metagame about the metagame. "The meta is relay-chain. What counters relay-chain? Let me build that." This is the exact strategic reasoning the game wants to teach.
- Scales without designer intervention. The bounty system is parametric — it responds automatically to the data without requiring human judgment.

**Weaknesses:**
- Can be gamed. Players could create smurf accounts running the dominant strategy to feed bounties to their main account.
- Creates perverse incentives. If the bounty is generous enough, players may intentionally lose games to inflate the dominant archetype's representation, then collect bounties by countering it.
- May not address structural imbalance. If relay-chain is dominant because it's genuinely overpowered, no amount of bounty will produce a viable counter. The system rewards fruitless effort.

**Comparable:** Gladiabots' community-driven meta, where top players actively published counter-strategies to dominant builds. But this was organic, not incentivized — the question is whether explicit incentives help or distort.

### Recommended: Model B+C Hybrid — "The Town Crier with Bounties"

The strongest approach combines Models B and C:
- The Pulse surfaces data and alerts publicly (Model B's transparency).
- Bounties activate automatically when thresholds are crossed (Model C's self-correction).
- Designers retain the ability to deploy manual modifiers for extreme cases (Model A's responsiveness, but human-gated).
- A "State of the Gauntlet" report is auto-generated from Pulse data each week, requiring only designer sign-off before publication.

---

## Beyond Average: Derived Duration Metrics

Average match duration is the simplest metric, but the richest signals come from derived metrics:

### EDT Ratio (Effective Determination Timestamp / Total Duration)

The EDT — the tick at which the outcome was effectively determined (from 7.13's pivot system) — divided by total match duration. An EDT ratio near 0 means the game was decided almost immediately (one-sided stomp). A ratio near 1 means the game was competitive until the final tick. A healthy meta has a **mean EDT ratio between 0.5 and 0.8** — outcomes are uncertain through the middle of the match but not completely random at the end.

**Display:** A second sparkline below the heartbeat, labeled "Decisiveness," showing the rolling average EDT ratio. Color coding: green when 0.5-0.8, amber when drifting toward either extreme, red at <0.3 (stomps) or >0.95 (coin flips).

### Duration Bimodality

A single average can hide a bimodal distribution — half of games end at tick 20 (rush wins), half end at tick 80 (successful defense → macro game). The average is tick 50, which looks "healthy," but the actual player experience alternates between frustrating stomps and grinding attrition. Bimodality detection (using a Hartigan's dip test or similar) catches this.

**Display:** When bimodality is detected, the heartbeat line splits into two dotted lines — one for each mode — with the average shown as a dimmer line between them. Visually striking: the single heartbeat becomes two heartbeats, like an arrhythmia. The accompanying text reads: **"Split meta detected — games clustering at tick 22 and tick 74."**

### Streak Duration Divergence

Do winning streaks correlate with shorter match durations? If a player on a 10-game winning streak averages 25 ticks per game while a player on a 10-game losing streak averages 55 ticks, the meta rewards early aggression disproportionately. Winning players stomp; losing players endure slow defeats.

**Display:** A scatter plot in the expanded Pulse dashboard — X axis is win streak length, Y axis is average match duration. If the correlation is negative (longer streaks → shorter games), the plot shows a warning: **"Winners are winning faster — advantage snowball detected."**

### First-Blood Timing Distribution

The tick at which the first unit is eliminated in each match. If first-blood timing is clustering earlier across the season, it means the meta is becoming more aggressive — and early aggression may be unrecoverable (correlating with the winner-takes-first-blood statistic).

**Display:** A histogram overlay on the distribution heatmap, showing first-blood tick as a highlighted row. If the first-blood row migrates upward (earlier) over time, the visual is unmistakable.

---

## Player Journeys

### Journey: Priya, 29, Data Engineer, Diamond-tier Gauntlet Player

**Context:** Priya is a competitive Gauntlet player in her third season. She reached Diamond by running a hybrid relay-command architecture — a signature build she's iterated on across 200+ matches. She's noticed her win rate dropping from 62% to 51% over the last two weeks and suspects the meta has shifted.

**Minute 0:00 — Opening the Gauntlet Lobby**
Priya opens the Gauntlet lobby. The collapsed Pulse sparkline in the right margin catches her eye — it's lower than she remembers. The heartbeat tone playing on entry is notably faster than last week. She taps the sparkline to expand The Pulse.

**Minute 0:15 — Reading The Pulse**
The full dashboard slides out. The heartbeat line shows a clear downward trend over the last 10 days — average match duration has dropped from 58 ticks to 41 ticks. The variance band has narrowed from ±18 ticks to ±9 ticks. The stomp index reads **27%** in amber. The archetype breakdown shows "striker-rush" climbing from 22% to 47% of top-500 deploys. Priya's stomach drops. She's been losing to rush architectures — configs that deploy 3 strikers immediately, push aggressively, and end the game before her relay network comes online.

**Minute 0:30 — Analyzing the Distribution**
She studies the heatmap. Two weeks ago, the distribution was a broad bell centered at tick 55. Now it's bimodal — a sharp peak at tick 25 (rush wins) and a smaller peak at tick 70 (the games where the rush failed and the defender's macro took over). The Pulse has detected this: the heartbeat line has split into two dotted lines with a warning label: **"Split meta — tick 25 / tick 70."** Priya realizes her architecture is in the second peak — she wins the long games but dies in the short ones, and the short ones are becoming more common.

**Minute 0:45 — Checking the Bounty**
Below the dashboard, a gold banner reads: **"BOUNTY: Defeat a striker-rush architecture (3+ strikers, <30 tick avg). Reward: 350 circuit tokens. Active since 2 days ago."** Priya considers this. She could redesign her build to survive the rush — add early scouts with evade skills, reduce her relay network's setup time, accept weaker mid-game for better early defense. The bounty would pay for the diagnostic tokens she spent last week on career analysis.

**Minute 1:00 — Decision**
She opens her workbench. Rather than queuing a Gauntlet match, she enters redesign mode on her relay blueprint. She strips one hook slot from the relay (reducing mid-game signal capacity) and replaces it with a faster deploy timing. She creates a new "anti-rush scout" blueprint — minimal buffer, maximum perception, an early-warning hook that broadcasts on the `threat-alert` channel. Her revised architecture sacrifices late-game depth for early-game survival. She'll test it against practice scenarios tonight and deploy to the Gauntlet tomorrow.

**UI Annotations:**
- Pulse sparkline (collapsed): 120px wide, 20px tall, bottom-right of lobby screen, pulsing cyan
- Pulse dashboard (expanded): 360px wide panel, dark background, sliding from right edge
- Heartbeat line: 2px thick, cyan, animated pulse at 108 BPM (elevated)
- Stomp index: 48pt bold number, amber glow, positioned top-left of dashboard
- Bounty banner: Full-width gold banner below dashboard, 40px tall, pulsing border

---

### Journey: Tomás, 17, High School Student, Silver-tier Gauntlet Player

**Context:** Tomás started playing Robot Uprising three weeks ago and just unlocked the Gauntlet. He doesn't follow the meta. He doesn't know what "The Pulse" is. He just wants to play.

**Minute 0:00 — First Gauntlet Match**
Tomás queues his first Gauntlet match with a config he built during the campaign — a balanced mix of scouts and strikers with basic hooks. He expects something like the campaign missions. He hits EXECUTE.

**Minute 0:05 — The Sealed Watch**
The sealed watch begins. His factory starts producing units. At tick 8, three enemy strikers appear at the edge of his perception range. At tick 10, they're adjacent to his base. At tick 12, his base is destroyed. The sealed watch ends. Total match: 12 ticks. Tomás stares at the screen. "What just happened?"

**Minute 0:20 — The Inspector**
The inspector loads. The timeline scrubber shows 12 ticks. He clicks through them. At tick 5, the enemy factory spawned three strikers simultaneously (a production queue optimized for maximum early pressure). By tick 8, they'd crossed the board. His scouts saw them at tick 6 but had no hook to broadcast a warning. His factory was still producing scout #2 when the strikers arrived. The decision trace shows his first striker wasn't queued to build until position 4 in the production queue — too late.

**Minute 0:40 — Noticing The Pulse**
Back in the lobby, Tomás notices the collapsed sparkline for the first time. He taps it. The dashboard expands. The stomp index reads **31%** in red. A label at the top reads: **"META ALERT: High early-game aggression detected. Consider adjusting your production queue to prioritize defensive units."** This is Tomás's first encounter with the concept that the game has an ecosystem and that ecosystem has a measurable state. He reads the archetype breakdown and sees "striker-rush: 49%." Almost half the Gauntlet is running the strategy that just killed him in 12 ticks.

**Minute 1:00 — Learning from the Data**
Below the archetype breakdown, a small "Learn More" link leads to a community-generated guide: "Surviving the Rush Meta" — posted by a Diamond player three days ago. The guide explains production queue prioritization, early-warning hook patterns, and the importance of scout perception in the first 10 ticks. Tomás reads the first two paragraphs, returns to his workbench, and moves his striker to position 1 in the production queue. He doesn't understand hooks yet, but he learned something: the meta matters, his config exists in an ecosystem, and other players' strategies affect what he needs to build.

**UI Annotations:**
- Post-match lobby: Pulse sparkline visible at right edge, pulsing faster than before (stressed heartbeat)
- META ALERT banner: Red text, positioned above the heartbeat line, visible only when expanded
- "Learn More" link: Small cyan text below archetype breakdown, leads to community guide hub
- Community guide: Opens in overlay panel, markdown-formatted, player-authored with edit history

---

### Journey: Reina, 42, Game Designer at a Mid-Size Studio, Casual Player

**Context:** Reina plays Robot Uprising casually — a few matches per week after her kids go to bed. She's in Gold tier, doesn't follow the competitive scene, but is professionally interested in the game's systems design. She's been tracking The Pulse as a case study for a presentation at her studio.

**Minute 0:00 — Weekly Check-In**
Reina opens the Gauntlet lobby on Tuesday evening. She immediately expands The Pulse — not to inform her play, but to study the system. This week, she notices something new: the heartbeat line has split into two dotted lines. The label reads **"Split meta — tick 28 / tick 71."** She recognizes this as bimodality detection. "They're using a dip test," she murmurs, impressed.

**Minute 0:15 — Studying the Archetype Evolution**
She scrolls down to the archetype breakdown and switches to the 30-day view. Over the last month: striker-rush rose from 15% to 48%, relay-chain dropped from 35% to 18%, and a new archetype — "anti-rush scout-swarm" — has appeared at 12% and is climbing. She watches the stacked area chart animate: the rush archetype growing, the relay archetype shrinking, and the counter-archetype emerging from nothing. "That's a healthy immune response," she thinks. The meta is self-correcting — players are building counter-strategies without designer intervention.

**Minute 0:30 — Checking the Bounty's Effect**
The bounty for defeating striker-rush has been active for 5 days. Reina checks the bounty stats (visible in the expanded dashboard): 847 bounty claims in 5 days. The anti-rush scout-swarm archetype appeared 2 days after the bounty activated. Correlation, but suggestive. She screenshots the timeline for her presentation — "The Bounty system as immune stimulant."

**Minute 0:45 — Meta Prediction**
Based on the archetype trend, Reina predicts: the rush will peak at ~55% this week as more players copy the strategy, then decline over the next 10 days as the counter-strategy proliferates. Average match duration will bottom out at ~38 ticks, then recover to ~50 ticks. The variance band will widen again. She types this prediction into her notes app, planning to check back next Tuesday.

**Minute 1:00 — Playing a Match**
She queues a match with her usual Gold-tier build. She doesn't modify it for the rush meta — she's not competitive enough to care. Her match lasts 52 ticks. She loses, but it was close. In the post-match inspector, she notices the EDT was at tick 44 — the game was competitive for 85% of its duration. She's satisfied. The meta at Gold is less warped than at Diamond. She closes the game, saves her screenshots, and starts drafting her presentation slide.

**UI Annotations:**
- 30-day view toggle: Small tab group above archetype chart — "7d | 30d | Season"
- Archetype trend animation: Smooth stacked area chart, 60fps transition between daily snapshots
- Bounty stats panel: Expandable sub-section below bounty banner, shows claims/day graph
- Screenshot button: Small camera icon in dashboard header, saves PNG with The Pulse branding

---

### Journey: Marcus, 54, Retired Software Architect, Platinum-tier, Community Contributor

**Context:** Marcus is a top-100 contributor to Robot Uprising's community guides. He writes weekly meta reports for the game's Discord. The Pulse is his primary data source.

**Minute 0:00 — Sunday Evening Meta Report**
Marcus opens The Pulse and switches to the full-season view. He's writing his weekly "State of the Gauntlet" report. He exports the week's data (CSV download available from the dashboard) and opens it in a spreadsheet.

**Minute 0:10 — Duration Trend Analysis**
He calculates: mean duration dropped 4.2 ticks this week (from 45.3 to 41.1). Standard deviation narrowed from 16.8 to 12.4. The EDT ratio dropped from 0.71 to 0.58 — games are being decided earlier. First-blood timing shifted from tick 14 to tick 9 — engagements are happening faster. All signals point the same direction: the rush meta is accelerating.

**Minute 0:25 — Writing the Report**
Marcus drafts: "Week 7 Gauntlet Report: The Rush Deepens. Average match duration fell to 41.1 ticks (season low). EDT ratio at 0.58 — outcomes determined by the midpoint. Striker-rush representation climbed to 51%, crossing the majority threshold for the first time this season. Counter-strategies emerging (anti-rush scout-swarm at 14%) but too early to call a reversal. Recommendation: if you're running relay-chain, add early-warning scouts or accept a sub-50% win rate until the meta shifts."

**Minute 0:35 — Community Discussion**
He posts the report to Discord. Within 10 minutes, three replies: one player sharing a specific anti-rush hook pattern that's working at Diamond, one complaining that the bounty reward should be higher, and one asking whether this is the right time to trigger a designer-level intervention. Marcus replies to each, citing specific Pulse metrics. The conversation he's facilitating IS the meta — players collectively analyzing and responding to the ecosystem's health, using The Pulse's data as shared ground truth.

**UI Annotations:**
- CSV export button: Download icon in dashboard header, exports all visible data as timestamped CSV
- Season view: Zoomed-out timeline showing all weeks of the current season
- Tooltip on any data point: Shows exact values — "Week 7, Day 3: Mean 41.1 ticks, SD 12.4, Stomp 31%, EDT 0.58"

---

## Intervention Trigger Design: When to Pull the Lever

The hardest design question: at what thresholds should the system recommend (or automatically apply) corrective action?

### Tier 1: "Awareness" (Community Alert Only)
- **Trigger:** Any single metric crosses 1.5 standard deviations from the season mean for 48+ hours.
- **Action:** META ALERT banner in Gauntlet lobby. No mechanical change.
- **Purpose:** Inform the community. Let players self-correct through counter-strategy innovation.

### Tier 2: "Incentive" (Bounty Activation)
- **Trigger:** Archetype concentration >45% for 72+ hours, OR stomp index >25% for 48+ hours.
- **Action:** Bounty target activated for the dominant archetype. Reward scales with concentration (50% = 200 tokens, 60% = 400 tokens, 70% = 600 tokens).
- **Purpose:** Economic incentive for innovation. Accelerate the natural counter-meta cycle.

### Tier 3: "Adjustment" (Mid-Season Modifier)
- **Trigger:** Archetype concentration >65% for 7+ days AND no counter-archetype has crossed 10% representation.
- **Action:** Designer-approved mid-season modifier from the seasonal pool (7.09a). The Pulse displays: **"SEASONAL ADJUSTMENT: [modifier name] active until [end of season]."**
- **Purpose:** Structural correction when player self-correction has failed.

### Tier 4: "Emergency" (Season Reset)
- **Trigger:** Archetype concentration >80% for 14+ days, OR average match duration drops below 50% of the season's target, OR multiple metrics simultaneously in red for 7+ days.
- **Action:** Emergency season reset — ratings soft-reset, new map/modifier deployed, Gauntlet leaderboard archived. Announcement: **"EMERGENCY RESET: Season 3 ended early due to meta instability. Season 4 begins now."**
- **Purpose:** Nuclear option. Used only when the meta is genuinely broken and no other intervention will fix it. This should happen at most once per year; if it happens more often, the game's balance is fundamentally flawed.

---

## Interaction Effects

### With Seasonal Modifiers (7.09a)
The Pulse directly informs which seasonal modifiers to deploy. If the duration data shows rush dominance, defensive modifiers are appropriate. If the data shows stalemate, aggressive modifiers are needed. The Pulse is the diagnostic; seasonal modifiers are the treatment.

### With Find the Pivot (7.13)
The EDT metric used in The Pulse is the same EDT computed for the Find the Pivot tournament format. The Pulse makes EDT a population-level metric; Find the Pivot makes it a per-match diagnostic skill test. They share infrastructure.

### With Arms Race Meta-Evolution (7.09)
The Pulse is the quantitative backbone of the meta-evolution system described in 7.09. Where 7.09 describes the qualitative dynamics (rush → defense → macro → rush), The Pulse provides the numbers that track those dynamics in real time.

### With Config Necropsy (7.10)
When The Pulse shows a dominant archetype, the community's config necropsy culture (7.10) focuses on that archetype — dissecting winning rush configs to find weaknesses. The Pulse creates the target; necropsy provides the counter-intelligence.

### With Career Analysis (4.70)
Players can filter their career analysis by the meta state at the time of each match. "Show me my win rate during the rush meta vs. the balanced meta." This connects individual performance to ecosystem dynamics.

### With Sealed Watch (Locked)
The sealed watch's "no tools" constraint means players can't see The Pulse during a match. The meta-awareness exists between matches, not during them. This separation is important — the sealed watch is about emotional experience, The Pulse is about analytical reflection.

---

## Sensory Summary

**Visual:** Dark medical-monitor aesthetic. Cyan sparklines pulsing against charcoal backgrounds. Amber and red warnings appearing as threshold crossings. The split heartbeat line when bimodality is detected — visually arresting, like an ECG arrhythmia. Gold bounty banners creating urgency. The distribution heatmap shifting from a healthy bell to a sick spike over days, visible as a time-lapse of decay.

**Audio:** The heartbeat — always present as ambient sound in the Gauntlet lobby. Faster when the meta is aggressive, slower when defensive. The *blip* of data points on hover. A rising minor chord when a new META ALERT appears. A triumphant major arpeggio when a bounty is claimed. Silence when The Pulse is collapsed — the heartbeat fades, returning the lobby to its normal ambient track.

**Feel:** Clinical. Diagnostic. The Pulse doesn't editorialize — it shows data and lets the community interpret. It feels like monitoring a patient, not playing a game. But the bounty system adds a layer of agency: you're not just watching the patient's vital signs, you're one of the doctors. The meta's health is everyone's responsibility.

---

## New Aspects Discovered

- **7.11a — The Pulse as spectator broadcast overlay:** The Pulse's heartbeat line and stomp index displayed as an overlay during tournament streams; casters reference it to contextualize matches ("this matchup is right at the bimodal split — we're either getting a 25-tick stomp or a 70-tick marathon"); the overlay creates meta-literacy in casual viewers
- **7.11b — Duration-based matchmaking weighting:** using a player's average match duration as a matchmaking factor — pairing rush players against rush players and macro players against macro players at the same rating; the "play style ELO" concept; risk of creating meta echo chambers vs. benefit of player experience quality
- **7.11c — Historical Pulse archive as community memory:** a full season-by-season archive of Pulse data accessible as a "Meta History Museum"; players can scrub through past seasons and see how the meta evolved; the archive as educational tool ("here's when the relay meta collapsed in Season 2") and as competitive intelligence ("this seasonal modifier historically favors scout-swarm")
- **7.11d — Anomaly detection for meta-breaking discoveries:** using rate-of-change in duration metrics (not just absolute values) to detect sudden shifts that indicate a player discovered something broken; "the spike detector" — if duration variance suddenly doubles in 24 hours, something new entered the ecosystem; auto-flagging the configs that appeared at the inflection point for designer review
- **7.11e — Per-tier Pulse decomposition:** separate Pulse dashboards for Bronze, Silver, Gold, Platinum, Diamond tiers; the meta at each tier is different (Bronze may be dominated by basic builds while Diamond has the rush meta); per-tier analysis prevents population-level averages from hiding tier-specific problems; comparable to LoL's rank-stratified balance data
