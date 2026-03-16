# Three Orthogonal Optimization Axes: Speed / Efficiency / Elegance as Genuinely In-Tension Post-Mission Goals

**Aspect:** 7.07 — Three orthogonal optimization axes: speed / efficiency / elegance as genuinely in-tension post-mission goals
**Category:** multiplayer/community
**Wave:** 7 — Multiplayer & Community

---

## The Core Design Problem

Robot Uprising needs a multi-axis optimization system where improving along one axis requires sacrificing another. This is the engine that drives replayability, community competition, and the Zachtronics-style "four different solutions to the same puzzle" phenomenon.

The locked game design creates a specific optimization landscape. An attention architecture — blueprints, hooks, rules, channels, context configs, production queue — produces emergent behavior against a scenario. That behavior can be measured along multiple dimensions. The question is: **which dimensions, and how do they fight each other?**

The Opus Magnum insight is crucial: the axes must be **genuinely antagonistic**. If a player can improve all three simultaneously, they're not real axes — they're just a single composite "goodness" score wearing three hats. The sweet spot is when optimizing one axis *requires* degrading another, creating a Pareto frontier where different players occupy different regions of the space, and "best" becomes a matter of values rather than skill.

---

## Axis Definitions

### Axis 1: Speed (Ticks to Victory)

**What it measures:** The total number of ticks from battle start to win condition (enemy base destroyed or all enemies eliminated).

**What it rewards:** Aggressive architectures. Fast scout-to-striker information chains. Short signal latency. Early-game rushes. Minimal deliberation — agents that act on partial information rather than waiting for confirmation.

**What it punishes:** Defensive play. Deep relay chains (each hop = 1 tick latency). Cautious "wait for full context" rules. Redundant communication paths. Command agents that deliberate before rerouting.

**The mechanical driver:** Signal latency is the speed tax. Every relay hop between scout and striker adds ticks. A scout directly wired to a striker (2-tick latency) is faster than scout→relay→striker (4-tick latency). But the relay adds compression, filtering, amplification — intelligence. Speed asks: "Can you win with stupid-but-fast agents?"

**The degenerate extreme:** A naked rush — one scout, three strikers, zero relays, zero command agents. Strikers patrol toward the enemy base with no intelligence at all. They either stumble into enemies and kill them by proximity, or they die. It's fast when it works and catastrophic when it doesn't. The speed histogram shows a bimodal distribution: either you win in 20 ticks or you lose at tick 8.

**Comparable games:**
- **Opus Magnum cycles:** The number of discrete time steps to produce the required output. Cycle-optimal solutions use many arms working in parallel — expensive and space-hungry, but fast. The cycle histogram compresses to ~2× the theoretical minimum for most puzzles.
- **Factorio SPM (Science Per Minute):** Not exactly speed, but throughput — how quickly the factory produces output. Speed-optimized Factorio bases use direct insertion, short belts, and compact layouts at the cost of expandability and UPS.
- **StarCraft rush timing:** Zergling rush at 4:30, Marine push at 5:00. Speed creates commitment — resources spent on early aggression aren't available for economy. "When you rush, you bet the game on the first three minutes."
- **Into the Breach turns remaining:** Missions end after a fixed number of turns; finishing early isn't directly scored, but taking fewer actions to neutralize threats leaves more room for bonus objectives.

**Robot Uprising specifics:** Speed in this game is fundamentally about **information latency tolerance**. A fast architecture accepts stale, incomplete, or unverified data and acts on it. A slow architecture insists on confirmed, compressed, prioritized intelligence before committing. The real skill ceiling is building architectures that are fast *and* smart — short latency chains that still carry high-quality signals. This is where compress and filter skills on relays become speed multipliers: they let you transmit faster by transmitting less.

---

### Axis 2: Efficiency (Resource Cost of Victory)

**What it measures:** The total resource expenditure to achieve victory — materials spent producing units plus cumulative energy consumption across all ticks.

**Locked resource mechanics:**
| Unit | Material Cost | Energy/Tick |
|------|--------------|-------------|
| Scout | 3m | 1e/tick |
| Striker | 8m | 3e/tick |
| Relay | 5m | 2e/tick |
| Specialist | 7m | 2e/tick |
| Command | 10m | 4e/tick |

**Total cost formula:** `Σ(unit_material_cost) + Σ(unit_energy_per_tick × ticks_alive)`

**What it rewards:** Minimal armies. Fewer units that each carry more weight. Clever use of cheap scouts over expensive command agents. Short battles (which reduce cumulative energy cost). Agents that die early (they stop consuming energy).

**What it punishes:** Over-engineering. Redundant relays. Insurance units "just in case." Long battles (energy accumulates). Brute-force spam.

**The mechanical driver:** Material cost is a one-time investment; energy is ongoing. This creates a fascinating time-value-of-resources calculation. A Command agent (10m + 4e/tick) that wins in 30 ticks costs 10 + 120 = 130 total. Three scouts (9m + 3e/tick) that win in 60 ticks cost 9 + 180 = 189 total. The expensive unit was cheaper because it won faster. Efficiency and speed are partially aligned (shorter battles = less energy) but partially opposed (fast architectures use expensive aggressive units).

**The degenerate extreme:** A single scout with patrol and a prayer. Costs 3m + 1e/tick. If it somehow solos the mission in 40 ticks, total cost is 43 — unbeatable. The efficiency histogram would show a long tail of players who achieved absurdly low costs with minimalist configurations that barely worked. The community calls these "penny runs."

**The tension with Speed:** Fast architectures tend to use expensive units (strikers, command agents) deployed in quantity. Efficient architectures use few cheap units that take longer. The Pareto frontier between speed and efficiency is a curve from "expensive blitz" to "cheap crawl," with the interesting middle region being "smart-cheap-and-fast" — the relay chain that makes a single striker as effective as three.

**The tension with Elegance:** Efficiency rewards minimal armies regardless of architectural complexity. You could have a single scout with 8 rules, 2 hooks, and a complex context config — a Byzantine contraption that costs almost nothing to deploy. Efficient but deeply inelegant.

**Comparable games:**
- **Opus Magnum cost:** The sum of all component prices. Cost-optimal solutions use a single arm on a rail, often taking hundreds of cycles. "A cheapest solution typically means using one bonding glyph and one arm, and a long list of instructions."
- **Factorio UPS:** Not a direct resource cost, but a meta-efficiency — how much computational overhead does your factory produce? UPS-efficient Factorio bases prioritize solar over nuclear, avoid unnecessary belt splits, and use beacons aggressively. It's a second-order efficiency metric the game doesn't explicitly track but the community obsesses over.
- **StarCraft worker count:** Saturating mineral patches with 16 workers per base is "efficient" in the textbook sense; 24 workers is over-saturated but produces marginally more income at the cost of army supply. Professional players track "army value vs. economy value" as a real-time efficiency ratio.
- **Into the Breach grid damage:** The primary optimization is minimizing civilian deaths — which is effectively resource preservation. Every building destroyed is a "spent" resource you can't recover.

---

### Axis 3: Elegance (Architectural Simplicity × Correctness)

**What it measures:** The inverse complexity of the winning architecture — fewer blueprints, fewer rules per blueprint, fewer hooks, fewer channels, simpler context configs — weighted against win reliability.

**Proposed formula options:**

**Option E1: "Inverse Complexity Count"**
```
Elegance = 1000 / (total_rules + total_hooks + total_blueprints + total_channels)
```
Simple to compute, easy to understand. A 2-blueprint, 4-rule, 2-hook, 1-channel architecture scores 1000/9 ≈ 111. A 6-blueprint, 20-rule, 8-hook, 5-channel architecture scores 1000/39 ≈ 26. Problem: doesn't distinguish between *necessary* complexity and *redundant* complexity. A 20-rule architecture where every rule fires at least once is more elegant than a 10-rule architecture where 5 rules never trigger.

**Option E2: "Active Component Ratio"**
```
Elegance = (components_that_fired_at_least_once / total_components) × weight
```
This rewards architectures where every piece contributes. An architecture with 20 rules where all 20 fire is more elegant than one with 10 rules where only 5 fire. Problem: incentivizes removing all "insurance" rules that only fire in rare scenarios — which is exactly what you want for robustness.

**Option E3: "The Rule-of-Sufficiency Score"**
```
Elegance = base_score - Σ(unused_rules × 10) - Σ(unused_hooks × 15) - Σ(redundant_channels × 20) + bonus(single_blueprint_victory × 50)
```
Punishes dead code, rewards minimalism, bonuses for extreme simplicity. This is the most "architectural code review" metric — it literally measures technical debt. An architecture with zero unused rules has zero elegance penalty regardless of total count.

**Option E4: "Kolmogorov-Inspired Compression"**
```
Elegance = serialized_config_size / victory_complexity
```
How much description does it take to specify this architecture, divided by the complexity of the scenario it solves? A complex scenario beaten by a short config spec is deeply elegant. A simple scenario beaten by a novel-length config is deeply inelegant. Problem: computing "victory complexity" is itself complex.

**Option E5: "Community-Readable Simplicity" (RECOMMENDED)**
```
Elegance = (100 - total_components) × (active_ratio) × (win_rate_bonus)

where:
  total_components = blueprints + rules + hooks + channels
  active_ratio = components_used_at_least_once / total_components
  win_rate_bonus = 1.0 + (0.5 × win_rate_above_50%)
```
This formula rewards small architectures (fewer components), penalizes dead code (active ratio), and gives a multiplier for reliability (win rate). A 10-component architecture with 100% active ratio and 90% win rate scores: (100-10) × 1.0 × 1.2 = 108. A 30-component architecture with 70% active ratio and 95% win rate scores: (100-30) × 0.7 × 1.225 = 60. The first is more elegant despite the lower win rate, because it's architecturally cleaner.

**What Elegance rewards:** Architectures that do more with less. Configurations where every rule carries weight, every hook transmits critical signals, every channel is necessary. The "I solved it with one blueprint and three rules" bragging-right moment.

**What Elegance punishes:** Over-engineering. Defensive redundancy. Insurance relays. "Just in case" rules. Configurations that look like enterprise Java — 47 rules across 8 blueprints to accomplish what could be done with 6 rules across 2 blueprints.

**The degenerate extreme:** A single scout blueprint with one rule ("if enemy adjacent, engage") and zero hooks. Elegance score through the roof. Win rate: 3%. The elegance histogram's right tail is populated by configs that are beautiful and useless.

**The tension with Speed:** Fast architectures often need redundant paths — parallel signal chains, backup relays, multiple strikers covering different zones. Each redundancy degrades elegance. An elegant architecture uses one perfectly placed relay; a fast architecture uses three covering all angles.

**The tension with Efficiency:** Partially aligned — both reward minimalism. But efficiency cares about *cost*, elegance cares about *complexity*. A single Command agent (10m, 4e/tick, 14-slot buffer, 6 hook slots) using all 6 hooks with 8 rules is expensive but potentially elegant if every component fires. Three scouts (9m, 3e/tick total) each with 2 dumb rules are cheap but architecturally redundant.

**Comparable games:**
- **Opus Magnum area:** The number of hexes the solution's moving parts touch. Area-optimal solutions are compact — every arm, track, and glyph precisely placed. The "bonsai" of machine design.
- **Zachtronics symbol/instruction count:** In Shenzhen I/O and TIS-100, the number of instructions used. Instruction-minimal solutions are often slow but architecturally beautiful — every line does essential work.
- **Factorio "spaghetti vs. main bus":** The community aesthetic preference for clean, organized factories over chaotic tangles. Not scored by the game, but deeply felt by players. A clean main bus is "elegant" even if it's not the most efficient design.
- **Slay the Spire deck thinning:** Removing cards makes the deck smaller and more consistent. A 15-card deck where every draw is useful is more "elegant" than a 30-card deck with dead draws. The game doesn't score this directly, but experienced players pursue it obsessively.

---

## The Antagonism Matrix

This is the key design validation. Each axis pair must be genuinely in tension:

| Axis Pair | Tension Mechanism | Why You Can't Have Both |
|-----------|------------------|------------------------|
| Speed ↔ Efficiency | Fast configs use expensive units (strikers, command) deployed in quantity; efficient configs use few cheap units (scouts, single relay) | Winning in 20 ticks requires 3+ strikers (24m+) vs. winning in 60 ticks with 1 scout + 1 striker (11m) |
| Speed ↔ Elegance | Fast configs need parallel redundant signal paths (backup relays, multiple channels) to avoid single-point-of-failure delays | A 2-relay architecture with fail-over is fast and robust but has "unnecessary" components that degrade elegance |
| Efficiency ↔ Elegance | Efficient configs can be architecturally complex if the complexity reduces unit count; elegant configs may waste resources by under-deploying | A complex relay config (8 rules, 4 hooks) that eliminates the need for a second relay is efficient but inelegant; two simple relays (2 rules each) is elegant but costs 10m instead of 5m |

**The Pareto Frontier Prediction:** If these tensions are real, no configuration can be in the top 10% of all three axes simultaneously. The histogram distributions should show:

- **Speed-optimized configs** cluster at high cost, medium-low elegance
- **Efficiency-optimized configs** cluster at medium speed, variable elegance
- **Elegance-optimized configs** cluster at low cost (often), low speed, lower win rates

The interesting players — the ones the community talks about — are those who find configurations in the "Pareto corner" where two axes are high without the third collapsing. "She got 90th percentile speed AND efficiency with only 12 components" is the kind of statement that drives community competition.

---

## The Fourth Dimension: Win Rate as Gatekeeper

Win rate is not a fourth optimization axis — it's a **gate**. A configuration with 100 elegance and 3% win rate is not "optimized for elegance." It's broken.

**Design options for the gate:**

**G1: No gate.** All three axes are computed regardless of win rate. The histograms include everyone. Problem: the elegance histogram gets polluted by broken configs that happen to be simple.

**G2: Minimum win rate threshold.** Only configs with ≥50% win rate (against the mission's scenario distribution) appear on histograms. Problem: discourages experimentation — players won't submit configs they know might fail.

**G3: Win rate as multiplier (RECOMMENDED).** All three axes are scaled by win rate. Speed × win_rate, Efficiency × win_rate, Elegance × win_rate. A blazing-fast config that only wins 40% of the time gets a 40% haircut on its speed score. This naturally rewards reliability without creating a hard cutoff. The histograms still include everyone, but unreliable configs sink toward the bottom.

**G4: Separate histogram for win rate.** Four histograms total — speed, efficiency, elegance, and win rate. Win rate is shown but doesn't modify the other three. Players see all four independently and make their own judgments. This is the Opus Magnum model: three independent axes, no composite.

**Recommendation:** G4 for the main histogram view (purest, most comparable to Opus Magnum), with G3 available as a "weighted" toggle for players who want a single ranking that factors reliability.

---

## How the Axes Interact with Locked Design Decisions

### Signal Latency (1 tick per hop)
The speed tax is linear: every relay in the chain adds exactly 1 tick of observation delay. Speed-optimized configs minimize relay hops. Elegance-optimized configs may use relays for their compression/filter skills but keep the count low. Efficiency-optimized configs may use one relay with many rules rather than two relays with simple rules — trading elegance for economy.

### One-Shot One-Kill
With no HP, every tick matters. A 1-tick stun from context overload can be fatal. This amplifies the speed axis — shaving 5 ticks off your victory time might mean the difference between winning and losing to a flanking striker. It also amplifies elegance — unused rules waste context window processing time (if rules consume evaluation ticks, which is a micro-design decision).

### Context Overload → 1 Tick Stunned
Context overload punishes chatty architectures. Speed-optimized configs with minimal relay filtering are vulnerable to overload — they're fast but fragile. Elegance-optimized configs with tight context configs and aggressive eviction are overload-resistant. This creates a hidden synergy between elegance and robustness that rewards clean architectural thinking.

### Factory Production Queue
The production queue creates an efficiency puzzle. Building a Command agent (10m) early means you wait longer before fielding combat units. Building three scouts (9m total) immediately gives you map presence but no intelligence infrastructure. Speed wants combat units fast; efficiency wants cheap units first; elegance wants the minimum number of unique blueprints.

### EM Emissions
Deep hook architectures are louder — more hooks = more emissions = more detectable. Speed doesn't care about emissions (win before detection matters). Efficiency doesn't care directly. Elegance benefits — fewer hooks = less noise = a stealth bonus that happens to align with architectural minimalism.

---

## Five Presentation Models for the Three Axes

### P1: "Triple Histogram" (Opus Magnum Direct)

Three side-by-side bell curve histograms, one per axis. Each shows the full player population as a smooth curve with the player's position marked by a bright vertical line.

**What it looks like:** After the Inspector's Act 2 debrief, the screen dims. Three translucent panels crystallize left to right: SPEED (⏱ icon, teal-to-gold gradient), EFFICIENCY (⚡ icon, green-to-gold gradient), ELEGANCE (🎯 icon, purple-to-gold gradient). Each curve is rendered in the game's pixel art style — jagged stepped silhouettes, not smooth mathematical functions. The player's position is a 2px cyan line with a soft glow. Below, a natural language summary: "Your architecture is fast (82nd percentile) but expensive (34th percentile) and over-engineered (28th percentile)."

**Strengths:** Proven pattern, universally legible, non-toxic, self-motivating.
**Weaknesses:** Three separate histograms don't show the *relationship* between axes. A player might not realize that improving speed necessarily degrades efficiency.

### P2: "Triangle Radar Chart"

A single radar chart with three vertices: Speed, Efficiency, Elegance. The player's config is plotted as a colored triangle within. Larger area = better overall, but the shape communicates the profile. A long thin triangle stretching toward Speed is a rush config. A balanced equilateral triangle is a generalist.

**What it looks like:** A single translucent panel centers on screen. Three labeled vertices form a large triangle. The player's config is a filled cyan polygon within it. Small dots on each vertex axis show friend positions. The population average is rendered as a faint grey polygon underneath — the player sees whether their triangle is bigger or smaller than average, and which way it leans.

**Strengths:** Shows profile at a glance. Makes the tradeoff visible — stretching one vertex shrinks another. Beautiful.
**Weaknesses:** Radar charts are notoriously misleading — area depends on axis ordering, and the visual impression changes if you swap two axes. Hardcore data visualization people will complain.

### P3: "Pareto Gallery"

Instead of showing the player's position on individual axes, show their position on the **Pareto frontier**. A 2D scatter plot (e.g., Speed vs. Efficiency) with every player's config as a dot. The Pareto-optimal configs (those not dominated on either axis) form a curve along the edge. The player's dot is highlighted. A toggle lets them switch between three views: Speed/Efficiency, Speed/Elegance, Efficiency/Elegance.

**What it looks like:** A dense cloud of semi-transparent dots on a 2D plot. Axes labeled clearly. The Pareto frontier is a glowing line connecting the non-dominated dots along the top-right edge. The player's dot is large, bright cyan, pulsing gently. Dots near the frontier glow gold. Dots far from it are dim grey. Friend dots are colored.

**Strengths:** Shows the actual tradeoff landscape. Makes Pareto optimality viscerally visible. Teaches optimization theory through gameplay. The community loves these — Opus Magnum's community spent years mapping Pareto frontiers.
**Weaknesses:** Requires choosing which two axes to display at once. Less immediately readable than histograms. The concept of "Pareto optimal" needs teaching.

### P4: "The Podium" (Three Leaderboards)

Three separate ranked leaderboards, one per axis. Each shows the top 100 globally, plus the player's local rank. No histograms — pure competition.

**What it looks like:** Three columns, each headed by an axis icon and name. Gold/silver/bronze for top 3. The player's row is highlighted wherever they appear. If they're not in the top 100, a "Your rank: #4,782 of 12,000" line appears at the bottom.

**Strengths:** Crystal clear motivation. The competitive players know exactly where they stand.
**Weaknesses:** Incentivizes cheating (as Zach Barth diagnosed). Tells most players "you suck." Loses the bell-curve "I'm above average" comfort. Not recommended for the default view.

### P5: "The Constellation" (RECOMMENDED — Hybrid Approach)

Combine P1 (Triple Histogram) as the default post-mission view with P3 (Pareto Gallery) as an unlockable deep-dive accessible from the Inspector's analytical sidebar. The radar chart (P2) appears as a small thumbnail on the player's profile/Gauntlet card.

**Post-mission default (P1):** Three histograms with natural language summary. Accessible to every player. "Your architecture is in the top 15% for elegance."

**Deep-dive (P3):** Accessible from Inspector or Campaign Map stats panel. Three 2D scatter plots showing the full Pareto landscape. Toggle between axis pairs. Pin your config and compare against friends. Unlocked after Mission 7 (once the player has enough data to make the plots meaningful).

**Profile thumbnail (P2):** A small radar triangle on the player's Gauntlet card and config export screen. Shows at a glance what kind of architect they are — speed-focused, efficiency-focused, balanced. Other players see this in async challenges and Ghost Ladder profiles.

**What the transition looks like:** The three histograms (post-mission) are the warm, emotional response — "how did I do?" The Pareto scatter plots (Inspector deep-dive) are the analytical response — "where does my config sit in the optimization landscape?" This follows the locked two-act debrief principle: emotional first, then analytical.

---

## Player Journeys

#### Journey: Tomás, 16, First Strategy Game Player

**Context:** Mission 4, "The Relay Chain." Tomás just built his first relay network — scout→relay→striker. He passed the mission on his third attempt with a functional but bloated configuration: 3 blueprints, 11 rules, 4 hooks, 2 channels.

**Minute 0:00 — The Histograms Appear**
The Inspector fades. Screen dims to charcoal. Three panels crystallize from left: SPEED, EFFICIENCY, ELEGANCE. Each takes 0.4 seconds with a thin glass-chime sound. Tomás watches his cyan line appear on SPEED — 45th percentile. "Average," he thinks. EFFICIENCY — 38th percentile. "Below average?" He looks at ELEGANCE — 22nd percentile. The natural language summary appears below: "Your architecture is in the bottom 22% for elegance. Most players solve this mission with fewer rules."

**Minute 0:15 — The Sting**
"Fewer rules?" He scrolls back mentally through his config. He added three rules to his relay that never fired — defensive rules for scenarios that didn't happen. He added a second channel that only carried one signal the entire battle. He knows this because the Inspector just showed him — the event log listed only 4 entries on Channel B.

He hovers over the ELEGANCE histogram. The info panel slides out: "Your architecture has 11 rules. 4 never evaluated to true during any scenario. The median architecture for this mission uses 6 rules with 90%+ activation." A small "?" icon leads to a tooltip: "Elegance measures how much of your architecture does real work. Unused rules are like unread books on a shelf — they take up space without contributing."

**Minute 0:30 — The Tradeoff Moment**
He looks at SPEED again. 45th percentile. If he removes the 4 dead rules and the spare channel, his elegance will jump — but will his speed change? He thinks about it. The dead rules don't slow anything down (they're never true, so they're skipped). The spare channel has no listeners. Removing them should improve elegance without affecting speed or efficiency. "Free elegance," he thinks.

But then he notices something. The histogram overlay shows a cluster of players in the 80th+ percentile for BOTH speed and elegance. They're solving the mission with 3-4 rules total. Not just removing dead rules — they're using *fundamentally fewer rules*. "How do you win with 3 rules?" He hits RETRY. Not because he failed — because the histograms showed him there's a shorter path he hasn't found.

**Minute 1:00 — The Screenshot**
Before retrying, he screenshots the three histograms and posts them to the game's Discord channel. "How do you get 80th percentile on both speed AND elegance on Mission 4? I'm stuck at 45/22." Three replies arrive within minutes, each describing a different approach. He's now part of the optimization community.

**UI Annotations:**
- Three histogram panels: 200×120px each, horizontal row below main screen
- Cyan position line: 2px wide, #00E5FF, 8px glow radius
- Info panel on hover: 280px wide, slides from right, dark semi-transparent bg
- Natural language summary: single line below histograms, best metric in gold text, worst in amber
- "?" tooltip icons: 12×12px, grey until hovered, reveal explanatory text

---

#### Journey: Dr. Amara, 41, Staff ML Engineer

**Context:** Mission 8, "Factory vs. Factory." Dr. Amara has been optimizing for elegance throughout the campaign — she finds aesthetic pleasure in minimal architectures. Her Mission 8 config uses 2 blueprints (scout + striker), 8 rules total, 3 hooks, 1 channel. Clean. Minimal.

**Minute 0:00 — The Elegant Failure**
She passes Mission 8 on her second attempt — 72% win rate across the invisible randomization variants. Histograms appear. SPEED: 29th percentile. She winces. EFFICIENCY: 67th percentile. Decent. ELEGANCE: 94th percentile. The gold glow on her position line feels warm.

But the natural language summary reads: "Your architecture is among the most elegant for this mission, but one of the slowest. Most players in the 90th+ elegance percentile use a relay to accelerate intelligence delivery."

**Minute 0:20 — The Reluctant Compromise**
She opens the Pareto scatter view (unlocked at Mission 7). Speed (X-axis) vs. Elegance (Y-axis). Her dot sits in the upper-left corner — high elegance, low speed. The Pareto frontier curves from upper-left to lower-right. She traces it with her eyes. The "sweet spot" — the point where the frontier bends, giving the most speed per unit of elegance lost — is at about the 70th/70th intersection.

She examines the configs near that bend point. Most use a relay with compress. Adding one relay (1 more blueprint, 2 more hooks, 2 more rules) would add ~12 components to her architecture but cut signal latency from 4 ticks to 2 ticks for scout→striker communication.

"That's... a big speed gain for a moderate elegance hit." She does the mental math. Her elegance would drop from 94th to maybe 60th percentile. Her speed might jump from 29th to 65th. The Pareto chart suggests this is a net-positive move along the frontier.

**Minute 0:45 — The Professional Parallel**
She stares at the scatter plot and laughs quietly. "This is literally the premature optimization argument." In her ML work, she's constantly balancing model simplicity against inference speed. A small model (elegant, cheap) is slow; a large model (complex, expensive) is fast. The relay is her GPU — it costs something, but the throughput gain is worth it. The game just taught her something about her own engineering values by making her feel the tradeoff.

**Minute 1:00 — The Config Code Export**
She exports her 94th-percentile elegance config as a Config Code string and posts it to the community forum with the title: "Mission 8, 94th elegance, 29th speed. Can anyone beat this elegance score?" Within hours, someone responds with a 96th-percentile elegance config using a single-blueprint scout-striker hybrid — a unit type she hadn't considered. The optimization community has found a deeper minimum.

**UI Annotations:**
- Pareto scatter: 600×400px panel, dark bg, semi-transparent dots (#FFFFFF at 15% opacity)
- Player's dot: 8px diameter, cyan, pulsing glow
- Pareto frontier: 2px gold line connecting non-dominated dots
- Axis labels: monospace, white, positioned at axis endpoints
- "Sweet spot" region: faint amber highlight where the frontier bends most steeply
- Config Code export: clipboard icon in top-right of stats panel, copies alphanumeric string

---

#### Journey: Kwame, 32, Twitch Streamer

**Context:** Gauntlet Season 2, Week 6. Kwame has been streaming his Gauntlet runs to 400-800 viewers. He's known for aggressive speed-optimized architectures — his playstyle is "blitz first, analyze later." His radar chart profile on his Gauntlet card shows a long spike toward Speed and a tiny nub toward Elegance. Chat regularly mocks his elegance score.

**Minute 0:00 — The Speed King's Dilemma**
Post-match histograms. SPEED: 97th percentile. Chat erupts: "NINETY SEVEN" "speed demon" "goated." EFFICIENCY: 41st percentile. "lol expensive" "he's paying rent for those strikers." ELEGANCE: 8th percentile. "EIGHT PERCENT" "spaghetti architect" "his config file is longer than his stream bio."

Kwame laughs. "Eight percent elegance. That's a personal best. Wait — personal worst? Both?" He hovers over the elegance histogram. The info panel shows: "Your architecture uses 34 rules across 6 blueprints. 12 rules never activated. 3 channels carry no traffic." Chat starts chanting: "REFACTOR REFACTOR REFACTOR."

**Minute 0:30 — The Community Challenge**
A subscriber donates with the message: "I bet you can't get 50th percentile elegance on this map without dropping below 80th speed." Kwame stares at the Pareto chart. The 80th-speed/50th-elegance region is populated but sparse — maybe 15 dots. "That's achievable," he says. "Let me try something."

He enters the Plan screen. Chat watches him delete rules one by one. Each deletion is accompanied by a tiny "snip" sound effect and the rule strip dissolving into pixels. "Does this rule fire? No. Gone. This one? Let me check the replay... it fired once on tick 47. Keep it." He's performing live code review on his attention architecture. The stream clip — "Twitch streamer refactors robot AI live" — gets 12,000 views.

**Minute 2:00 — The Pareto Walk**
After three iterations, Kwame's new config scores: SPEED 84th, EFFICIENCY 55th, ELEGANCE 47th. He's walked along the Pareto frontier from the speed extreme toward the center. His radar chart profile is now a more balanced triangle. "I didn't get worse," he tells chat. "I just got differently good."

The Pareto scatter shows his journey — his three dots (original, iteration 2, iteration 3) form a trail from upper-left to center. A viewer screenshots this and posts it to Reddit: "Kwame's optimization journey in one image." 3,400 upvotes.

**Minute 3:00 — The New Content Format**
Kwame realizes the optimization axes are content. He announces a new weekly series: "Pareto Walks" — each week he takes a config optimized for one extreme and walks it along the frontier toward another axis, explaining every decision. The community creates a #pareto-walks Discord channel. The optimization axes have become a social experience.

**UI Annotations:**
- Gauntlet card radar chart: 80×80px equilateral triangle with three labeled vertices
- Pareto trail: when a player has multiple attempts, previous positions shown as faded dots connected by thin lines
- Rule deletion animation: strip dissolves into 4×4 pixel fragments that drift downward, 300ms, "snip" audio
- Channel traffic indicator: tiny green/amber/red pip next to each channel name in the channel map panel
- Export trail: "Export optimization journey" option in stats panel, creates shareable image of the Pareto walk

---

#### Journey: Sofia, 15, Casual Player

**Context:** Mission 6, first factory mission. Sofia plays for the story — she loves the Predecessor's voice and the boot log narrative. She doesn't care about optimization. She builds architectures that "feel right" rather than optimizing for any metric. Her Mission 6 config is 4 blueprints, 14 rules, 5 hooks, 3 channels — a sprawling, redundant, working mess.

**Minute 0:00 — The Histograms She Almost Ignores**
Post-mission histograms appear. Sofia's eyes go to the natural language summary first: "Your architecture is reliable (78th percentile win rate) but complex (15th percentile elegance)." She shrugs. "It works."

But then she notices the ELEGANCE histogram shape. It's not a bell curve — it's bimodal. There's a cluster of players at the far left (complex configs like hers) and a cluster at the far right (minimal configs). The valley between them is empty. "Why is nobody in the middle?" she wonders aloud.

**Minute 0:15 — The Accidental Insight**
She hovers over the right cluster. The tooltip reads: "Players in the 80th+ elegance percentile for this mission typically use 2 blueprints and 1 channel." Two blueprints. She used four. She thinks about it. Her Relay-A and Relay-B are doing essentially the same job — compressing scout data. She built two because the first one's context window kept filling up. But what if she changed the eviction priority so old data is dropped more aggressively?

She's not trying to optimize. She's just *curious* about the bimodal distribution. The histogram's shape — not the score — taught her something about the design space. There's a structural reason the middle is empty: either you solve the factory mission with a clean 2-blueprint design or you sprawl into 4+ blueprints when the clean approach doesn't immediately work. The valley represents a design cliff.

**Minute 0:30 — The Non-Retry**
Sofia doesn't retry. She moves to Mission 7. But something has shifted — next time she builds, she'll think about whether her second relay is necessary or whether she should fix the first one. The elegance histogram planted a seed without demanding action. The game respected her playstyle while making the optimization dimension visible.

**UI Annotations:**
- Bimodal histogram: pixel-art curve with visible gap in the middle, distinctive two-hump shape
- Hover tooltip for distribution regions: explains what configs in this region look like
- Natural language summary: uses "reliable" (positive) before "complex" (neutral-negative), respecting the player
- No "retry" prompt: the histograms are informational, not prescriptive. No button says "Optimize?"

---

## Interaction Effects

### With Campaign Progression (5.04, 5.05)
The three axes don't all matter from the start. Missions 1-4 (pre-placed units) barely have efficiency variation — everyone spends the same resources. Speed varies slightly. Elegance starts mattering when players write their own rules (Mission 3+). The factory (Mission 5+) is when efficiency becomes a real axis. The full three-axis system doesn't activate until Mission 5.

**Design implication:** Missions 1-4 show only one histogram (elegance or speed). Mission 5 introduces the efficiency histogram with a boot log message: "RESOURCE ALLOCATION SUBSYSTEM: ONLINE. Tracking material and energy expenditure across all deployed units. New metric: EFFICIENCY." The third histogram materializes next to the first two.

### With Gauntlet Competitive (5.22, 7.09)
In the Gauntlet, the three axes become the basis for player identity. Speed players, efficiency players, and elegance players occupy different regions of the meta. Seasonal modifiers (7.09a) can shift which axis matters most — a "double energy cost" season modifier makes efficiency twice as important, pushing the meta toward lean architectures.

**Design implication:** Gauntlet ELO should be based purely on win rate. The three axes are *separate* from competitive rating. A player can be Diamond-tier (high win rate) with terrible elegance. The axes measure *how* you win, not *whether* you win. This prevents the optimization system from distorting competitive matchmaking.

### With Community Sharing (7.03, 7.10)
Config exports should include all three axis scores as metadata. When browsing community configs, players can filter by axis profile: "Show me configs in the 80th+ speed percentile" or "Sort by elegance." Config necropsies (7.10) gain a new dimension: "This config's elegance dropped from 85th to 40th percentile between v2 and v5 — was the added complexity worth the win rate gain?"

### With Inspector Debrief (Locked)
The Inspector can overlay optimization-relevant annotations on the timeline scrubber:
- **Speed overlay:** Marks the "kill tick" and "could-have-killed-earlier tick" — the gap between when a striker was in position and when it actually engaged (due to signal delay).
- **Efficiency overlay:** Marks energy consumption per tick as a running total line.
- **Elegance overlay:** Highlights rules that never fired during this run (greyed-out rule entries in the decision trace).

### With the Blueprint Codex (Locked)
Each skill, hook trigger, and rule type in the Codex could show community statistics: "Compress is used in 78% of configs in the 90th+ speed percentile but only 34% of configs in the 90th+ elegance percentile." This turns the Codex into a meta-reference — not just what a skill does, but how the community uses it.

### With Meta-Evolution (7.09)
If the three axes create distinct player archetypes (speed player, efficiency player, elegance player, Pareto hunter), the Gauntlet meta evolves along multiple dimensions simultaneously. A dominant "speed rush" meta can be countered by efficiency-focused defensive architectures that absorb the rush cheaply. An "elegance purist" meta can be exploited by brute-force complexity that handles edge cases the elegant config can't. The three axes create a non-transitive meta-rock-paper-scissors.

---

## The Community Invention Space

The most important design decision may be **what the game does NOT define**. Opus Magnum shipped with three metrics. The community invented dozens more:

| Community Metric | Definition | What It Rewards |
|-----------------|------------|-----------------|
| **MechA** (Mechanism Area) | Area occupied only by moving parts | Compact mechanisms, not just compact footprint |
| **Sum** | Cost + Cycles + Area | Overall "goodness" without weighting |
| **Product** | Cost × Cycles × Area | Penalizes being bad at any one axis more harshly |
| **Period** | Cycles per output unit (for multi-output puzzles) | Throughput optimization, not total time |
| **Lexicographic** | Sort by primary axis, break ties with secondary | Sharp competition within a single axis |

**Robot Uprising equivalents the community might invent:**

| Potential Community Metric | Definition | What It Teaches |
|---------------------------|------------|-----------------|
| **Signal-to-Noise Ratio** | Useful signals delivered / total EM emissions | Stealthy architecture design |
| **Relay Amplification** | Kill count / number of relays used | Whether relays are pulling their weight |
| **Context Utilization** | Average context window fill across all units / total context slots | Whether you sized your buffers right |
| **Architectural Entropy** | Information-theoretic complexity of the channel topology | Whether the wiring is structured or chaotic |
| **Dead Code Ratio** | Unused components / total components | Code cleanliness (overlaps with elegance but is harsher) |
| **Recovery Time** | Ticks from worst moment (most units stunned/lost) to stabilization | Resilience and graceful degradation |
| **First Blood** | Tick of first enemy elimination | Early-game pressure |
| **Tick Efficiency** | Enemy units eliminated / total ticks | Kill rate per unit time |

**Design implication:** The game should expose raw per-tick data in a machine-readable format (JSON export from Inspector) so that community tools can compute arbitrary metrics. The game defines the three canonical axes; the community defines everything else. This is the Opus Magnum tournament infrastructure model — the game provides the canvas, the community paints on it.

---

## Sensory Design

### The Histogram Reveal

**Visual:** Three panels materialize left to right, each taking 0.4 seconds. Each panel starts as a thin horizontal line that grows vertically into the bell curve shape — like a time-lapse of stalagmites growing. The curve is rendered in the game's pixel-art style: jagged, stepped, organic. The background gradient goes from cool teal (left/worse) to warm gold (right/better). The player's position line drops in from above like a plumb bob — a thin cyan thread that stretches taut with a soft "ting" when it hits the curve.

**Audio:** Each histogram's arrival is marked by a rising chime in a different register — low (speed, a deep bell tone), mid (efficiency, a clean sine tone), high (elegance, a crystal glass tone). The three chimes form a chord when all three are present. If the player is in the 80th+ percentile on an axis, that chime sustains slightly longer. If below 20th, the chime is shorter and slightly detuned.

**The Pareto Chart:**
A swarm of dots coalescing from random positions into their true coordinates — like watching stars resolve through a focusing telescope. The player's dot arrives last, a bright cyan comet that streaks across the chart to its final position and lands with a soft impact ripple. The Pareto frontier line draws itself from left to right, a golden thread connecting the non-dominated dots with a warm pulse traveling along it.

### Axis-Specific Feedback During Sealed Watch

Speed: A faint tick counter in the top-right corner. As ticks accumulate, the counter subtly shifts from green to amber to red — not alarming, but visible. This is the player's speed score counting down in real-time.

Efficiency: A tiny running cost counter next to the factory. Each unit deployed adds to the counter with a soft "ka-ching" sound. Energy accumulation is shown as a slowly filling bar beneath the cost number.

Elegance: No direct feedback during sealed watch. Elegance is measured post-hoc. This is intentional — elegance is about the architecture's design, not its execution. You can't see elegance during the battle; you see it in the Inspector when you realize three of your rules never fired.

---

## Failure Modes and Mitigations

### FM1: "The Spike Problem"
As the community matures, optimal solutions are discovered. Histograms compress from bell curves into spikes. When 90% of players achieve 95th+ percentile on speed for a given mission, the histogram is useless.

**Mitigation:** Invisible randomization (locked design decision) means no single config dominates across all scenario variants. The histograms are computed across the full variant distribution, so even if a config is perfect for variant A, it may struggle on variant B. The distribution stays wide because the scenario space stays wide.

### FM2: "The Elegance Trap"
Players optimize for elegance by removing necessary components, creating fragile configs that fail on rare variants. The elegance histogram rewards minimalism even when minimalism is wrong.

**Mitigation:** Win rate as multiplier (G3) or win rate as fourth histogram (G4). Elegance without reliability is visibly punished — you can see your beautiful 95th-percentile elegance config sitting at 30th-percentile win rate. The natural language summary explicitly calls this out: "Your architecture is elegant but unreliable."

### FM3: "The Goodhart Problem"
When a metric becomes a target, it ceases to be a good metric. Players optimize for the elegance *formula* rather than for genuinely clean architecture. If elegance = 1000/components, players will minimize component count even at the cost of readability.

**Mitigation:** Use the Active Component Ratio (E2) as part of the elegance formula. This rewards architectures where every piece fires, not just architectures with few pieces. A 20-rule config where all 20 rules activate regularly is more elegant than a 5-rule config where only 3 fire. This is harder to game because it requires *understanding* rather than mere minimization.

### FM4: "The Apathy Response"
Casual players see three histograms and feel overwhelmed. They don't care about optimization. They just want to pass the mission and continue the story.

**Mitigation:** The histograms are on a post-debrief screen that the player can skip with a single button press ("CONTINUE →"). The natural language summary is the minimum-viable information: one sentence, best metric first, encouraging tone. Players who don't care about optimization see "Your architecture is elegant (78th percentile). Continue?" and move on. Players who do care linger and explore.

---

## New Aspects Discovered

- [ ] **7.07a — Elegance formula calibration and edge cases:** Detailed design of the elegance computation — how to count "activations" (once per run vs. once per tick vs. per-variant), how to handle rules that fire only in rare variants (are they "dead code" or "insurance"?), how to prevent elegance from collapsing to "use one blueprint and pray"
- [ ] **7.07b — Axis-specific seasonal modifiers in Gauntlet:** Season modifiers that double one axis's weight ("Efficiency Season" where energy costs are doubled, pushing the meta toward lean architectures) or introduce a fourth temporary axis ("Stealth Season" where EM emissions become a scored axis)
- [ ] **7.07c — The "Pareto Walk" as designed community content format:** Tooling for recording and sharing optimization journeys (series of configs walking along the Pareto frontier), replay trails as shareable artifacts, community challenges ("walk from 90th speed to 50th elegance in 3 steps")
- [ ] **7.07d — Axis profile as matchmaking signal in async PvP:** Using radar chart profiles to match players against opponents with similar or contrasting optimization styles; "speed vs. elegance" matchups as a designed competitive experience
- [ ] **7.07e — Inspector overlay per optimization axis:** Dedicated Inspector visualization modes for each axis (speed overlay showing latency bottlenecks, efficiency overlay showing cost accumulation, elegance overlay highlighting unused components) as analytical tools for targeted improvement
