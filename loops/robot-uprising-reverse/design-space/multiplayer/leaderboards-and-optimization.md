# Leaderboards and Optimization: Zachtronics-Style Histograms, Community Competition, and the Metagame of Metrics

**Aspect:** 7.05 — Leaderboards and optimization: Zachtronics-style histograms, community competition
**Category:** multiplayer/community
**Wave:** 7 — Multiplayer & Community

---

## The Core Design Problem

Robot Uprising occupies an unusual competitive niche: the player's artifact is neither a score (Tetris), a time (speedrun), a replay (chess), nor a blueprint (Factorio) — it's an **attention architecture**. A complete set of blueprints, hooks, channel wiring, rules, context configs, and production queues that together produce emergent behavior when executed against a scenario.

This creates a leaderboard design challenge with no exact precedent:

1. **What do you measure?** A configuration doesn't have a single "score." It has a pass rate across scenarios, a match win rate against opponents, a resource efficiency, an architectural complexity, a signal latency profile, a buffer utilization curve, a production throughput — all partially correlated, partially antagonistic.
2. **When do you measure?** Campaign completion? Per-mission? Per-Gauntlet-season? Per-deploy? Lifetime?
3. **Who are you comparing against?** Friends? Global? Players at similar campaign progress? Players with similar architectural style? Yourself-last-week?
4. **What does "better" mean?** A config that wins 90% of matches but uses brute-force relay spam is "better" by win rate but "worse" by elegance. The game's educational goal — teaching transferable agentic AI engineering skills — conflicts with a pure-win-rate optimization incentive.

The fundamental design question: **how does Robot Uprising's competitive surface reward depth, elegance, and learning rather than just winning?**

---

## The Zachtronics Histogram Pattern: Why It Matters

Zach Barth's histogram innovation — replacing traditional ranked leaderboards with anonymous bell curves showing the full player distribution — solved two problems that apply directly to Robot Uprising:

**Problem 1: Cheating incentive.** Traditional leaderboards create a single prize (#1 position) that incentivizes exploitation. Histograms show where you sit in the population, making the question "how good am I relative to everyone?" rather than "am I the best?"

**Problem 2: The "you suck" message.** A global leaderboard tells most players they're in position 47,382 of 50,000. A histogram shows them they're in the 70th percentile — suddenly they're above average, and the curve ahead is visible. The shape communicates both "you're doing fine" and "here's how far you could go."

**The Opus Magnum extension:** Three antagonistic metrics (cost, cycles, area) means no single histogram tells the full story. Optimizing one axis requires trading off another. This creates a Pareto frontier where different players occupy different regions of the optimization space, and "best" is a choice rather than a fact.

**The community extension (MechA and beyond):** The Opus Magnum community invented novel metrics for tournament play — MechA (Mechanism Area), Sum (Cost + Cycles + Area), LexC (lexicographic cycle ordering), Period — each revealing different aspects of solution quality. The game didn't ship with these metrics. The community created them because the game's three-axis design made the metric space itself a creative playground.

**What this tells us for Robot Uprising:** The game should ship with 3-5 metrics that create genuine tension, then design the system to be extensible so the community can invent more. The metrics ARE the competitive content.

---

## Six Leaderboard Models

### Model A: "The Histogram Democracy" (Zachtronics Direct)

**How it works:** After every mission completion or Gauntlet deploy, the player sees their score on 3-4 bell curve histograms drawn from the full player population for that mission/scenario. Each histogram shows the player's position as a bright vertical line against the smoky silhouette of the population distribution. No names, no ranks, no top-10 — just your position in the crowd.

**The metrics (3 core + 1 derived):**

| Metric | What It Measures | Optimization Tension |
|--------|-----------------|---------------------|
| **Win Rate** | % of scenarios/matches passed | Encourages reliable configs, punishes experimental ones |
| **Efficiency** | Total resource cost of victory (materials spent + energy consumed) | Encourages minimal armies, punishes redundancy |
| **Elegance** | Inverse complexity score: fewer blueprints × fewer hooks × fewer rules = higher elegance | Encourages simple architectures, punishes over-engineering |
| **Speed** | Average ticks to victory | Encourages aggressive configs, punishes defensive play |

Each metric naturally conflicts with at least one other. A high-elegance config uses few rules and hooks but may have low win rate because it can't handle edge cases. A high-win-rate config brute-forces with redundant relays but scores poorly on efficiency and elegance. A high-speed config blitzes early but collapses against careful opponents.

**What the screen looks like:**
The post-mission debrief (after the Inspector's Act 2) transitions to a results screen. The background dims to deep charcoal. Four translucent histogram panels materialize one by one, left to right, each taking 0.4 seconds with a soft crystallization sound — like ice forming on glass. Each histogram is a smooth bell curve rendered as a gradient fill: cool teal at the left (worse) fading to warm gold at the right (better). The player's position is a sharp vertical line in bright cyan with a subtle glow, and a numeric value displayed above it in a clean monospace font: "87th percentile — 142 ticks."

The histograms use the same isometric pixel art style as the rest of the game — the curves are not smooth mathematical functions but jagged pixel-stepped silhouettes, as if drawn on graph paper with a fat marker. Each histogram has a tiny icon in its corner: ⚔ for win rate, ⚡ for efficiency, 🎯 for elegance, ⏱ for speed.

Below the four histograms, a single line reads: "Your architecture is in the top 13% for elegance but bottom 40% for speed." This natural language summary is generated from the histogram positions and uses comparative framing — always mentioning the player's best metric first.

**The friends overlay:** A toggle in the top-right corner reads "FRIENDS" with a small toggle switch. When activated, the anonymous population histograms gain colored dots — each friend's position marked with their avatar thumbnail (8×8 pixel portrait) sitting on the curve. The dots have subtle hover tooltips showing the friend's exact values. This is the Opus Magnum friends list mechanic: you don't compete against the world, you compete against the people you know.

**What the player sees when they hover a histogram:**
A translucent info panel slides out from the right edge, showing:
- **Your value:** "Efficiency: 47 materials, 12 energy/tick = 59 total cost"
- **Population median:** "Median: 83 total cost"
- **Your percentile:** "Better than 78% of players on this mission"
- **Distribution shape:** A text description — "Most players cluster around 70-90 total cost. The long tail to the right includes brute-force relay-spam configs."
- **Improvement hint (optional, togglable):** "Your main cost driver is RELAY-B (23 materials). Consider whether a single relay with compress+filter could replace it."

**Strengths:**
- Universally legible — works for every player from total beginner to veteran
- Non-toxic — no single "winner," everyone sees their relative position
- Self-motivating — the curve ahead is visible, the gap between "you" and "better" is concrete
- Anti-cheat — no name on a leaderboard to fight over
- Axis tension creates genuine "what do I optimize?" decisions that mirror real engineering tradeoffs

**Weaknesses:**
- Imprecise at extremes — when you're in the 99th percentile, the histogram can't show whether you're 1st or 50th
- No persistent identity — you can't "be known" for your optimization skill
- The improvement hints risk being prescriptive rather than exploratory
- No sense of progression — histograms reset per mission, no "career" view
- Vulnerable to the "spike problem": as the game matures, histograms compress toward optimal values and lose their bell curve shape

---

#### Journey: Tomás, 16, First Strategy Game Player

**Context:** Mission 3, "First Relay." Tomás just completed his first relay configuration — a scout feeding observations to a relay that compresses and forwards to a striker. He passed the mission but his relay dropped 4 signals.

**Minute 0:00 — The Reveal**
The Inspector's Act 2 fades. The screen darkens. Four panels materialize left to right — crystallization sounds, like someone tapping glass rods in sequence. Tomás watches the first histogram form: WIN RATE. His bright cyan line sits at the 65th percentile mark. "I passed," he thinks. "And I'm above average. Cool."

The second histogram: EFFICIENCY. His line is at the 40th percentile. He frowns slightly. "I used a lot of materials?" The third: ELEGANCE. 82nd percentile. His config was simple — one scout, one relay, one striker, three rules total. "Wait, being simple is good?" The fourth: SPEED. 25th percentile. "142 ticks. That's slow?"

**Minute 0:15 — The Tension Discovery**
Tomás notices the pattern. He's high on elegance but low on speed. He hovers over the speed histogram. The info panel slides out: "Your main bottleneck is signal latency. Scout→Relay→Striker = 4 ticks per observation. Consider reducing the relay chain or placing units closer together."

He looks at the elegance histogram. "But if I add more relays to cover more area, my elegance drops..." For the first time, he grasps that optimization has axes, and moving along one means moving against another. This is not a single score to maximize. This is a *choice*.

**Minute 0:30 — The Friend Dot**
He toggles FRIENDS. A single dot appears on the win rate histogram — his older cousin Marta, who introduced him to the game. She's at the 88th percentile for win rate but only 45th for elegance. "She brute-forced it with extra relays," he realizes. "My way is cleaner but slower." He screenshots the histograms and sends them to her with the message: "elegance > speed 😤"

**Minute 0:45 — The Return**
He hits RETRY. Not because he failed — he passed. Because he wants to see if he can keep his elegance score while pushing speed up. He noticed the histogram shows a cluster of players who are high on both elegance AND speed — a thin region in the upper right. "What are they doing that I'm not?"

**UI Annotations:**
- Histogram panels: 4 panels, each 200×120px, horizontal layout below the 8×8 board
- Player position line: 2px wide, cyan (#00E5FF), 8px glow radius
- Friend dots: 8×8 pixel portraits, sitting on the curve, hover for tooltip
- Info panel: slides from right edge, 300px wide, semi-transparent dark background
- Natural language summary: single line, below all histograms, white text on dark, best metric in gold

---

#### Journey: Dr. Priya, 38, Staff ML Engineer

**Context:** Mission 7, her second attempt. She rebuilt her command agent architecture to use prioritize→reroute as a dynamic load balancer. Her first attempt failed at 60% pass rate; this one hits 94%.

**Minute 0:00 — The Percentile Shock**
Histograms materialize. Win Rate: 94th percentile. Efficiency: 71st. Elegance: 12th percentile. Speed: 55th.

Her elegance is terrible. She stares at it. "Twelve percent? I have... a lot of rules." She hovers. The info panel shows: "Your architecture uses 47 rules across 8 blueprints. The median player at this mission uses 19 rules across 4 blueprints." She winces. "That's... a code smell."

**Minute 0:20 — The Professional Recognition**
She recognizes this pattern from work. She's over-engineered the system. Her command agent has rules for edge cases that never fire. She has hooks monitoring channels that carry no traffic. She built a microservice architecture when a monolith would do.

She scrolls through the elegance histogram and sees the 90th-percentile region. Those players solved Mission 7 with ~12 rules. "How?" She toggles FRIENDS and sees her colleague James at the 80th percentile for elegance — but only 60th for win rate. "He sacrificed robustness for simplicity. I did the opposite."

**Minute 0:40 — The Refactoring Decision**
She opens her workbench alongside the histogram (split screen available in post-debrief). She starts deleting rules. Rule 14 on COMMAND-A: "IF buffer > 80% AND channel:echo active → reroute to RELAY-D." She checks her Inspector data — this rule fired exactly once in 100 ticks. She deletes it. Rule 22: never fired at all. Deleted.

She re-deploys. Win rate drops to 91% but elegance jumps to 58th percentile. "Okay. Now it's a conversation." She sees the Pareto frontier: the set of architectures that are maximally good at one thing without being worse at everything else. She's trying to reach that frontier.

**Minute 1:10 — The Metric As Teacher**
She messages her team Slack: "This game just taught me why we over-provision our inference pipeline. Same instinct — add rules for edge cases until the system works, never go back and prune." The histogram was the teacher. Not a tooltip, not a tutorial — a mirror.

**UI Annotations:**
- Split screen mode: histogram panel + workbench side by side, accessible via drag-to-resize divider
- Rule fire count: shown in workbench when accessed from debrief context, grey "(0×)" suffix
- Pareto visualization: not in base game — see Model D below for this extension

---

#### Journey: Kai, 11, Minecraft Builder

**Context:** Mission 5, first factory mission. Kai built a production queue with three scout blueprints and one striker. He tagged 6 of 8 resource nodes but lost 3 scouts.

**Minute 0:00 — The Numbers**
The histograms appear. Kai doesn't know what "percentile" means. But he sees his bright line on the WIN RATE histogram is past the middle, and on EFFICIENCY it's way to the left. He understands: right = good, left = bad. He's good at winning but bad at... the lightning bolt one?

**Minute 0:10 — The Emoji Language**
He hovers over EFFICIENCY. The info panel says: "You spent 47 materials. Median: 28." He gets it now. He used too many scouts. Three scouts, and he lost them, so they cost materials for nothing. "Oh. The dead ones are waste."

He looks at SPEED. He's at the 70th percentile. "That's pretty good!" He doesn't care about elegance because the word means nothing to him. But he notices the ⏱ icon next to speed — a clock. "Faster is better, I did it in 88 ticks." He looks at the left side of the speed histogram where the fastest players are. "Someone did it in 31 ticks?! How?!"

**Minute 0:20 — The Screenshot**
He screenshots the histograms and posts them to his friend group. "I got 70th in speed!! try to beat me." He doesn't care about the other metrics. He's picked his axis. For Kai, the leaderboard isn't four metrics — it's one: the one he chose.

**UI Annotations:**
- Icon-first labeling: each histogram's primary label is the icon (⚔⚡🎯⏱), with text secondary
- Left-right directionality: universally readable even without numerical literacy
- Natural language summary uses simple vocabulary: "faster than 70% of players" not "70th percentile"

---

### Model B: "The Three-Axis Radar" (Multi-Dimensional Profile)

**How it works:** Instead of separate histograms, the player's performance is shown as a radar chart (spider diagram) with 3-5 axes. The chart superimposes the player's shape against the population median shape and optionally against friends. The shape itself becomes the player's identity — you're not "good" or "bad," you're a *shape*. A wide-right-narrow-top shape means aggressive-but-fragile. A balanced pentagon means well-rounded.

**The five axes:**

| Axis | Full Name | What It Captures |
|------|-----------|-----------------|
| **W** | Win Reliability | Pass rate × scenario variance coverage |
| **E** | Economy | Inverse total resource expenditure |
| **A** | Architecture | Inverse complexity (fewer primitives = higher) |
| **S** | Speed | Inverse average ticks to victory |
| **D** | Depth | Meta-level usage (command agents, dynamic rerouting, runtime adaptation) |

The fifth axis, **Depth**, is unique to Robot Uprising. It measures not just whether you won, but whether you used the game's distinctive mechanics — command agents, runtime hook rerouting, dynamic blueprint swapping. A player who wins every mission with static scout-striker pairs scores 0 on Depth. A player who builds self-modifying attention architectures with command agents that reassign subordinate skills mid-battle scores high. This axis rewards engagement with the game's educational core.

**What the screen looks like:**
A single radar chart, 300×300px, centered on screen. The population median is rendered as a translucent grey pentagon. The player's shape is rendered as a bright cyan polygon with slight glow, animated from center outward (0.5s expansion). Each vertex has a small icon and percentage. The difference between the player's shape and the median is highlighted: regions where the player exceeds the median glow gold; regions where they fall below glow a subtle red.

**What the shape names look like:**
The game automatically names the player's shape based on its profile:
- **The Brute:** High W, high S, low A, low E. "You win fast but wastefully."
- **The Architect:** High A, high D, medium W, low S. "Your designs are elegant but take time to unfold."
- **The Economist:** High E, medium W, low D. "You squeeze every material for value."
- **The Speedrunner:** High S, low everything else. "You finish fast. The wreckage you leave behind is someone else's problem."
- **The Polymath:** All axes above 60th percentile. "You do everything well. Are you doing anything brilliantly?"

The shape name appears below the chart in a stylized font: "YOUR PROFILE: THE ARCHITECT" with the description in smaller italics beneath.

**Strengths:**
- Creates player identity through shape — "I'm an Architect" is memorable and shareable
- The Depth axis rewards engagement with the game's unique mechanics
- Shape comparison between friends is visually immediate
- Named profiles create aspiration targets and community vocabulary
- The "Polymath challenge" — all axes above 60% — creates a meta-goal

**Weaknesses:**
- Radar charts are notoriously hard to read accurately — area comparisons are misleading
- Shape names can feel reductive or annoying if misassigned
- The Depth axis is paternalistic — it rewards the designer's intended play style, not the player's
- Five axes create analysis paralysis for new players
- Radar charts don't show population distribution, only median comparison

---

#### Journey: Marcus, 52, History Teacher and Chess Player

**Context:** Mission 8, deep campaign. Marcus has been playing for two weeks, averaging one mission per evening. He favors clean, minimal architectures — two scouts, one relay, one striker, tight rules.

**Minute 0:00 — The Shape**
The radar chart expands from center. His shape is dramatically asymmetric: Architecture at 94%, Win Reliability at 78%, Economy at 82%, Speed at 35%, Depth at 18%. The game names him: "YOUR PROFILE: THE MINIMALIST."

He reads the description: "You build with surgical precision. Every rule serves a purpose. But your architectures don't adapt — they execute a fixed plan." He nods. This is how he plays chess. Pre-prepared openings, clean execution, no improvisation.

**Minute 0:15 — The Depth Sting**
His Depth score glows red: 18th percentile. He hovers. "Depth measures use of runtime adaptation mechanics: command agents, dynamic rerouting, live skill reassignment." He hasn't used a command agent. He hasn't used reroute. His configs are static — they do exactly what he planned, every time.

He feels defensive. "My way works." But the radar chart is patient. It doesn't say he's wrong. It shows him a shape, and the shape has a concavity where Depth should be. The concavity is a question, not an accusation.

**Minute 0:30 — The Aspiration**
He clicks "Compare to: Top 10% Players" (a toggle available after Mission 5). The top-10% shape appears: a near-perfect pentagon, with Depth as the most consistently high axis. "So the best players all use command agents..." He starts thinking about what a minimalist command agent would look like. Not a complex bureaucracy — a single command unit with one rule: "IF any subordinate's buffer > 80%, reroute their least-priority channel." Minimal. Elegant. But adaptive.

**Minute 0:45 — The Identity Shift**
He's no longer trying to improve a number. He's trying to change his *shape*. He wants to evolve from "The Minimalist" to "The Architect" — same high Architecture and Economy, but with Depth above 60%. The shape is the goal, not the score.

**UI Annotations:**
- Radar chart: 5-axis, 300×300px, cyan player polygon over grey median
- Shape name: centered below chart, stylized monospace, 24px, with italic description
- "Compare to" toggle: dropdown in top-right — Median / Friends / Top 10% / Your Best
- Red glow on below-median axes: subtle pulsing, 0.5Hz, non-alarming
- Gold glow on above-median axes: steady, warm, affirming

---

### Model C: "The Season Ladder" (TFT/Gladiabots Ranked)

**How it works:** A traditional competitive rating system for the Gauntlet (PvP/async mode). Players deploy configs, earn/lose rating points based on match results, and progress through named tiers. The ladder resets each season (8-12 weeks). Campaign has no ladder — it uses histograms (Model A) or radar (Model B).

**The tier system:**

| Tier | Name | Rating Range | Icon | Population % |
|------|------|-------------|------|-------------|
| 1 | **Wire** | 0–799 | Single copper wire, unlit | 20% |
| 2 | **Circuit** | 800–1199 | Simple PCB trace, green | 25% |
| 3 | **Board** | 1200–1599 | Full circuit board, amber LEDs | 25% |
| 4 | **Processor** | 1600–1999 | CPU die, glowing channels | 18% |
| 5 | **Architect** | 2000–2399 | Full chip architecture, pulsing | 8% |
| 6 | **Overmind** | 2400+ | Neural mesh, breathing light | 4% |

Tiers are named for the game's progression from simple wiring to complex systems architecture. The visual icon appears on the player's profile, in match history, on shared configs, and in community posts. The icon evolves through the tier's rating range — a Wire at 0 looks different from a Wire at 799 (thicker, brighter, more strands).

**What the ladder screen looks like:**
Full-screen dark panel with the current tier icon large and centered (128×128px), glowing with the tier's signature color. Below it: the player's exact rating in large numerals. Below that: a progress bar showing distance to next tier. Below that: a 20-match rolling history shown as a horizontal strip of tiny squares — green for wins, red for losses, gold for "interesting" matches (high false-pivot-gap or unusual EDT). The strip reads left to right, most recent on the right.

To the left, a vertical sidebar shows the full tier ladder with the player's current position marked. To the right, a "Recent Matches" panel shows the last 5 matches with opponent tier, result, and rating change (+12, -8, etc.).

**Season reset mechanics:**
At season end, all players are soft-reset: their new starting rating is `(old_rating * 0.6) + 400`. This prevents eternal stratification while giving high-rated players a head start. The first 10 matches of a new season are "placement matches" with 2× rating volatility, creating a heightened stakes period that generates community buzz.

**Strengths:**
- Creates persistent identity and aspiration — "I'm an Architect" means something
- The circuit-to-overmind metaphor aligns with the game's theme
- Seasonal resets create renewal moments and community events
- Match history strip provides at-a-glance momentum reading
- Familiar to players from TFT, Valorant, etc.

**Weaknesses:**
- Ladder anxiety — some players avoid ranked play entirely to protect their rating
- Single-axis (win rate) ignores the elegance/efficiency dimensions the game should reward
- Encourages copying "meta" configs rather than experimentation
- The rating system may be gamed by deploy-timing (avoid deploying when strong players are active)
- Requires a healthy player population to avoid long match waits at extreme tiers

---

#### Journey: Zara, 24, Competitive Gauntlet Player

**Context:** Late season. Zara is at Processor tier (1,780 rating), trying to break into Architect. She's been stuck for a week.

**Minute 0:00 — The Deploy Ritual**
Zara opens the Gauntlet screen. Her Processor icon pulses amber — the channels on the CPU die are 78% filled, representing her progress through the tier. She's designed a new config overnight: an experimental three-relay compression chain that she believes will counter the scout-rush meta that's dominated this week.

She hits DEPLOY. The config crystallizes — the familiar flash, her configuration recorded as a ghost. "Configuration deployed. Searching for opponent..." The status ribbon updates: "Rating: 1,780 | Ghost active | 0 matches pending."

**Minute 0:30 — The Notification**
She's browsing the campaign when the notification arrives. The screen border flashes a subtle amber pulse. A small toast notification slides up from the bottom: "SEALED ████ vs. Circuit-tier opponent ready to watch." She taps it.

**Minute 0:45 — The Sealed Watch**
The Sealed Watch plays. She doesn't know the result. Her three-relay chain fires beautifully — scouts feed observations, the first relay compresses, the second filters, the third amplifies and broadcasts. Her strikers respond with coordinated movement. But the enemy sends two strikers directly at her second relay. Tick 34: RELAY-B is eliminated. The signal chain breaks. Her striker formation loses coordination. Tick 45: she sees the cascade failure beginning.

Tick 68: the match ends. "VICTORY." Relief. She hadn't been sure after the relay loss. The match history strip gains a new green square on the right.

**Minute 1:00 — The Rating Update**
Rating: 1,780 → 1,793. The progress bar inches forward. The Processor icon's channels fill slightly — 82% now. She needs 2,000 for Architect. "207 more points. Maybe 15-20 wins if I don't lose."

She checks the match's metrics in the Inspector. Her efficiency was poor — she lost a relay, so materials wasted. But her resilience was notable: the system degraded gracefully rather than collapsing. She adds a note to her config: "v4.2 — relay loss resilient but efficiency suffers. Consider backup routing path."

**Minute 1:30 — The Plateau Question**
She opens her 20-match history. Green-green-red-green-red-green-green-red-green-green-red. She's winning ~65% — enough to climb, but slowly. The rating gains per win (+12 to +15) are smaller than the losses (-18 to -22) because she's being matched against lower-rated opponents at this stage.

She wonders: "Should I copy the relay-chain config that's dominating Architect tier this week? Or keep iterating on my own design?" The ladder creates this pressure. The histogram wouldn't.

**UI Annotations:**
- Tier icon: 128×128px centered, tier color glow, internal progress animation
- Rating number: 48px monospace, below icon, updates with +/- animation
- Match history strip: 20 squares, 12×12px each, colored fill, horizontal, most recent right
- Notification toast: 300×40px, bottom-center, amber border, "SEALED ████" in masked text
- Progress bar: horizontal, below rating, tier color gradient fill, next-tier icon at right end

---

### Model D: "The Pareto Gallery" (Community Frontier)

**How it works:** Instead of a leaderboard, the game maintains a **Pareto frontier** for each mission — the set of configurations that are not dominated by any other config on all metrics simultaneously. If your config has the best efficiency among all configs with ≥90% win rate, you're on the frontier. The frontier is displayed as a gallery: not a ranked list, but a constellation of configs that represent different optimization philosophies.

This is inspired by the Opus Magnum community's evolution from individual record-tracking to collective Pareto frontier maintenance. The community stopped asking "who's #1?" and started asking "what are all the different ways to be excellent?"

**What the screen looks like:**
A 2D scatterplot occupying the full screen. X-axis: Efficiency (left = expensive, right = cheap). Y-axis: Speed (bottom = slow, top = fast). Each dot is a config. Most dots are grey (the general population). The Pareto frontier — the outermost curve of non-dominated configs — is rendered as a series of gold dots connected by a faint gold line. The player's config is a bright cyan dot.

The gold frontier dots are interactive. Hover reveals: "This config uses 2 scouts + 1 relay + 1 striker (19 materials, 44 ticks). Submitted by: anonymous / [username if opted in]." Click opens a **Config Sketch** — a simplified, anonymized version of the architecture showing unit types, rough channel topology, and rule count per unit, but NOT exact rules or hook parameters. Enough to understand the strategy, not enough to copy it verbatim.

A dropdown at the top lets the player choose which two metrics define the axes. Switch to Speed × Elegance and the frontier reshapes — different configs are on the edge, different optimization tradeoffs become visible.

**The "frontier claim" mechanic:**
When a player's config lands on the Pareto frontier (not dominated by any existing config), the game celebrates with a distinctive sound — a resonant chime like a tuning fork being struck, different from all other game sounds. The screen briefly flashes gold at the edges. A toast notification: "🏆 NEW FRONTIER POSITION: Your config is Pareto-optimal for Efficiency × Speed on Mission 7." The config is automatically added to the gallery.

Frontier positions are impermanent. If another player submits a config that dominates yours (better on all plotted axes), your dot silently drops off the frontier. No notification — the loss is quiet, the gain is loud. This asymmetry encourages exploration without punishing being surpassed.

**Strengths:**
- Eliminates the single-winner problem — there are dozens of frontier positions per mission
- Visualizes the shape of the optimization space — players can see trade-offs physically
- The Config Sketch system enables learning without enabling copying
- Frontier claims create dopamine moments without toxicity
- The axis-switching dropdown reveals that "best" is relative to what you're optimizing
- Deeply aligned with the game's educational mission: this IS how real engineering optimization works

**Weaknesses:**
- Scatterplots are intimidating for non-technical players
- The "anonymous sketch" system is hard to design — too much detail = copying, too little = useless
- Pareto frontiers are hard to compute efficiently at scale
- The impermanent nature means invested effort can be quietly obsoleted
- Not directly comparable to friends (you can't easily see "am I better than my friend on this axis?")

---

#### Journey: Sofia, 31, Backend Engineer and Factorio Veteran

**Context:** Mission 9, late campaign. Sofia has been optimizing her Mission 7 config for a week, iterating through 12 versions. She knows the Pareto Gallery from earlier missions but hasn't landed on the frontier yet.

**Minute 0:00 — The Scatterplot**
She opens the Pareto Gallery for Mission 7. Axis: Efficiency × Speed. The grey dots fill the lower-left quadrant — expensive and slow configs, the general population. The gold frontier traces a curve in the upper-right: configs that are both cheap and fast. Her cyan dot is close to the frontier but not on it — slightly below a gold dot that represents a config using 3 fewer materials and finishing 2 ticks faster.

She switches axes to Efficiency × Elegance. Now the frontier reshapes. Her dot jumps closer to the frontier — her config is simple (12 rules) compared to most efficient configs (which average 25 rules). On this axis pair, she's almost Pareto-optimal.

**Minute 0:20 — The Sketch Study**
She clicks the gold dot nearest to her position on Efficiency × Elegance. The Config Sketch opens: "2 scouts, 1 relay (compress+filter), 2 strikers. 9 rules. 3 hooks. 2 channels." She sees it: this config uses one fewer relay than hers. The sketch shows the relay has both compress AND filter, where Sofia uses two relays — one for each. "Oh. I never tried stacking skills on the same relay."

She doesn't have the exact rules. But she has the architecture. She goes to her workbench and experiments with a single-relay dual-skill design. It takes 20 minutes of iteration, but she arrives at v13: 2 scouts, 1 relay (compress+filter), 2 strikers. 11 rules. 2 hooks. 2 channels.

**Minute 0:40 — The Frontier Claim**
She deploys v13. Win rate: 91%. Efficiency: 23 materials. Speed: 52 ticks. Elegance: 11 rules.

She opens the Pareto Gallery. Efficiency × Elegance axes. Her cyan dot is... on the gold line. The resonant chime rings — a clear, pure tone that hangs in the air for 2 seconds, unlike any other sound in the game. The screen edges flash gold. The toast appears: "🏆 NEW FRONTIER POSITION."

She exhales. This isn't a #1 ranking. There are 14 other gold dots on this frontier. But she's one of them. She found a configuration that represents one of the many different ways to be excellent at this mission.

**Minute 1:00 — The Community Moment**
She screenshots her frontier position and posts it to the game's subreddit: "Finally hit Pareto on M7 Efficiency × Elegance. Key insight: single relay with dual skills is underrated." Three comments within an hour, one from a player who's been on the frontier for a different axis pair: "Nice! I'm on the Speed × Depth frontier with a completely different approach — command agent that dynamically reassigns scouts to striker duty mid-battle."

Sofia clicks through to their Sketch. A totally different architecture. Both are on the frontier. Neither is "better." They're solving different optimization problems. The Pareto Gallery made them peers, not competitors.

**UI Annotations:**
- Scatterplot: full-screen, dark background, grey dots (population), gold dots (frontier), cyan dot (player)
- Frontier line: gold, 1px, connecting frontier dots in order
- Axis dropdown: top-left, two dropdowns for X and Y axis metric
- Config Sketch panel: slides from right, 400px wide, shows unit types + counts + rough topology
- Frontier claim chime: unique resonant tone, 2s decay, no other game sound uses this frequency
- Gold edge flash: 0.3s duration, 50% opacity, fades from edges inward

---

### Model E: "The Community-Invented Metric" (Extensible Metric System)

**How it works:** The game ships with 4-5 core metrics (win rate, efficiency, elegance, speed, depth) but exposes a **metric definition API** that allows players to define, share, and compete on custom metrics. Inspired by the Opus Magnum community's invention of MechA, Sum, LexC, and other novel scoring systems for tournament play.

**What the metric definition looks like:**
A metric is a formula that takes a match result (tick log, resource expenditure, unit count, buffer states, channel traffic, production timeline) and outputs a single number. The game provides a visual formula builder — a simple expression editor where the player can combine built-in variables with arithmetic:

```
METRIC: "Signal Purity"
FORMULA: (total_signals_delivered / total_signals_sent) * 100
DESCRIPTION: "Percentage of signals that reached their intended recipient without being dropped, compressed, or corrupted."
```

```
METRIC: "Dark Network Score"
FORMULA: win_rate * (1 / (total_em_emissions + 1))
DESCRIPTION: "Win rate weighted by stealth. High score = winning while staying invisible."
```

```
METRIC: "The Brutalist"
FORMULA: (kills / total_units_produced) * speed_percentile
DESCRIPTION: "Kill efficiency times speed. Reward configs that waste nothing and finish fast."
```

Custom metrics can be published to the community Workshop. Other players can "subscribe" to a metric, which adds it to their personal debrief as an additional histogram/axis. Popular metrics float to the top. The game doesn't validate whether a metric is "good" — the community curates through usage.

**The tournament system:**
Weekly community tournaments can specify any metric — core or custom — as the scoring axis. A tournament host creates a puzzle (a scenario + a metric + a submission deadline). Players submit configs. After the deadline, all submissions are ranked on the specified metric, and the full distribution is shown as a histogram.

The tournament screen shows:
- This week's puzzle: scenario name, metric name (with formula visible), deadline countdown
- Current submissions: N players entered (no scores visible until deadline)
- Past tournaments: gallery of previous weeks, winning configs' Sketches, winning player profiles
- "Host a Tournament" button (available to all players, with a moderation queue for featured tournaments)

**Strengths:**
- Infinite competitive longevity — the community generates its own competition
- Teaches that optimization is always relative to what you're measuring
- The formula builder teaches data analysis skills (another transferable real-world skill)
- Tournaments create scheduled community events with social energy
- Aligns with the Opus Magnum model that produced years of post-release community engagement

**Weaknesses:**
- Formula builder UI is hard to make accessible
- Custom metrics can be exploitable (define a metric that only your config scores well on)
- Curation problem: 500 community metrics, 495 of which are garbage
- Tournament hosting requires moderation infrastructure
- Risk of metric proliferation reducing shared competitive vocabulary

---

#### Journey: Chen, 58, Retired Computer Science Professor

**Context:** Post-campaign, deep in Gauntlet. Chen has been playing for three months. He's at Architect tier but bored of pure win-rate optimization. He wants to explore the game's deeper systems.

**Minute 0:00 — The Metric Idea**
Chen has noticed that his configs produce beautiful signal flow patterns — information moving through his relay chains in rhythmic waves. He wonders: can he measure that? He opens the Metric Workshop.

The visual formula builder shows available variables on the left: `tick_count`, `signals_sent`, `signals_delivered`, `signals_dropped`, `buffer_fill_mean`, `buffer_fill_variance`, `em_emissions`, `channel_count`, `units_alive`, `units_lost`, `resources_spent`, `production_cycles`, `tags_controlled`, `kill_count`, and dozens more.

He drags `buffer_fill_variance` into the formula area. This measures how much his units' buffer utilization fluctuates over the course of a match. Low variance = steady state, high variance = chaotic spiking.

He constructs: `METRIC: "Flow State" = win_rate * (1 / (buffer_fill_variance + 0.01))`. Win rate weighted by buffer stability. A high Flow State score means winning while maintaining smooth, even information flow — no buffer overloads, no idle buffers, just steady throughput.

**Minute 0:20 — The Publication**
He writes a description: "Flow State measures how smoothly your attention architecture processes information. High Flow State = winning with a calm system, not a panicking one. Think of it as CPU utilization with no spikes." He publishes it to the Workshop.

**Minute 1:00 — The First Subscriber**
A player named "relay_queen" subscribes to Flow State. Then two more. By the next day, 40 players have added it to their debrief. Chen sees his metric appearing in community posts: "My Flow State on M7 is 0.83, anyone higher?"

**Minute Day 3 — The Tournament**
Chen hosts a tournament: "The Flow State Classic — Mission 7, scored by Flow State, submissions due Sunday." 28 players enter. The winning config (not Chen's — he places 7th) uses a clever technique: a command agent that monitors buffer fill rates and dynamically adjusts eviction priorities to smooth variance. Chen has never seen this technique. The metric he invented revealed a strategy he didn't know existed.

**UI Annotations:**
- Metric Workshop: full-screen editor, variable list on left, formula area center, preview chart right
- Variable drag: drag from list to formula area, auto-inserts with operator suggestions
- Preview chart: shows metric value calculated against player's last 5 matches as sample data
- Publish flow: name + formula + description + category tag → moderation queue → live within 1 hour
- Tournament creation: scenario picker + metric picker + deadline picker + featured/unfeatured toggle

---

### Model F: "The Optimization Garden" (Long-Arc Personal Growth)

**How it works:** Instead of competing against others, the player competes against themselves over time. The game tracks every config version the player has ever deployed for each mission and presents their personal optimization history as a **garden** — a visual metaphor where each metric is a plant, and the plant's growth over time reflects the player's improvement.

**What the garden looks like:**
A small isometric plot (4×4 grid) with pixel art plants. Each plant represents one metric for one mission. A win-rate plant for Mission 3 might be a small bamboo shoot after the first attempt, a tall stalk after five attempts, and a flowering bamboo grove after twenty. The garden uses the game's SE Asian cyberpunk aesthetic — plants are digital-organic hybrids, with circuit traces running through leaves and bioluminescent flowers pulsing at buffer-utilization-correlated frequencies.

The garden grows passively as the player plays. Each successful optimization — a config that scores better on any metric than their previous best — triggers a growth animation. The plant extends a new branch, opens a new bud, adds a new leaf. Each regression (a deploy that scores worse) causes no visual change — plants don't shrink. This is a ratchet mechanic: the garden only shows your peaks, never your valleys.

**The mission rosette:**
For each mission, the garden shows a "rosette" — a circular arrangement of plants, one per metric. A balanced rosette (all plants similar height) represents a well-rounded optimization. A lopsided rosette (one tall plant, others stunted) represents a specialist. The player's full garden — all missions' rosettes arranged on the 4×4 plot — represents their complete optimization personality.

**Strengths:**
- Zero anxiety — no comparison to others, no rating to protect
- The ratchet mechanic means the garden only improves, creating pure positive reinforcement
- Beautiful aesthetic opportunity with the SE Asian cyberpunk plant hybrids
- Long-term engagement through slow-growing plants (some plants take 50 optimizations to reach full bloom)
- Pairs well with any other model — the garden can coexist alongside histograms or ladders
- The garden IS the player's legacy, visible on their profile

**Weaknesses:**
- No competitive tension — players who want to compete need another model
- The "always growing" ratchet can feel dishonest if the player's actual skill has regressed
- Garden visualization is expensive to render and hard to read precisely
- The metaphor may confuse players looking for actual performance data
- Risk of becoming decoration that's ignored after the initial novelty

---

#### Journey: Lena, 14, First-Time Strategy Game Player

**Context:** She's completed 6 missions over two weeks, playing casually after school. She returns to her garden between sessions as a way to see how she's doing.

**Minute 0:00 — The Garden Visit**
Lena opens her profile. The garden fills the screen — a small isometric plot with six rosettes, one per completed mission. Mission 1's rosette is a full bloom — all five plants tall and flowering, because Mission 1 is simple and she optimized it thoroughly. Mission 6's rosette is sparse — one tall plant (win rate) and four seedlings (she passed but didn't optimize).

She notices Mission 3's rosette has four tall plants but one stunted one: Speed. "I should go back and make M3 faster," she thinks. The stunted plant is a visual itch — an unfinished piece of her garden that she can see every time she visits.

**Minute 0:15 — The Growth Moment**
She replays Mission 3 with a modified config — moved her relay closer to the front line to reduce signal latency. She shaves 18 ticks off her best time. When she returns to the garden, Mission 3's Speed plant extends three new branches with a gentle unfurling animation — each branch takes 0.3 seconds, accompanied by a soft organic-digital chime, like a plant growing through fiber optic cable. The bioluminescent veins in the new branches pulse once, then settle into a slow rhythm.

**Minute 0:20 — The Screenshot**
She screenshots her garden and sets it as her phone wallpaper. Not because of any number. Because it's pretty, and it's hers, and it grew because she played.

**UI Annotations:**
- Garden: isometric 4×4 plot, SE Asian cyberpunk plants, per-mission rosettes
- Plant growth animation: 0.3s per branch, organic unfurling, fiber-optic chime
- Bioluminescent veins: pulse at 0.25Hz when new, settle to 0.1Hz after 5 seconds
- No numbers visible by default — hover any plant for exact metric value and percentile
- Profile integration: garden visible on player profile, community posts, shared configs

---

## Interaction Effects Across Models

### Combining Models

The six models are not mutually exclusive. The recommended combination:

| Context | Model | Rationale |
|---------|-------|-----------|
| Campaign mission debrief | **A (Histogram)** | Low-stakes, educational, everyone sees where they stand |
| Player profile | **B (Radar) + F (Garden)** | Identity (shape) + progress (growth) |
| Gauntlet ranked | **C (Ladder)** | Competitive players want stakes and tiers |
| Mission deep-dive | **D (Pareto Gallery)** | Optimization-minded players explore the frontier |
| Community events | **E (Custom Metrics)** | Infinite replayability through community-invented competition |
| Personal motivation | **F (Garden)** | Always-positive long-arc feedback |

### Metric Axes × Game Design

The choice of metrics has profound gameplay consequences:

**If Elegance is a core metric:** Players are rewarded for simplicity. This encourages learning the minimum viable architecture for each mission — aligned with the game's educational goal (transferable engineering skill = knowing what's necessary vs. what's noise). But it punishes creative experimentation with complex systems.

**If Depth is a core metric:** Players are rewarded for using command agents and runtime adaptation. This pushes everyone toward the meta-level — aligned with the game's "building systems that build systems" thesis. But it can feel coercive ("the game is grading me on playing the way it wants me to play").

**If only Win Rate exists:** Players optimize for reliability, which means copying the most robust known config. No exploration, no identity, no learning. This is the degenerate case.

**If Speed is a core metric:** Players discover aggressive strategies that the designer may not have intended. Speedrun culture creates its own community — entirely separate from win-rate optimizers. This is rich and healthy but can feel like "playing a different game."

### Metrics × Sealed Watch

The Sealed Watch (locked: no skip, no pause, no tools) means the player watches the match without knowing the final metrics. This creates a tension: during the watch, the player is forming a *subjective* assessment of how their config performed. The histograms then provide an *objective* assessment. The gap between subjective and objective is where learning happens.

If the player thought "that went great" and the histograms show 40th percentile efficiency, they learn that their perception of "great" was calibrated wrong. If they thought "that was a disaster" and the histograms show 75th percentile win rate, they learn that their standards are higher than the population's.

### Metrics × Community Culture

The choice of metrics shapes the community's vocabulary. In Opus Magnum, "cycles" became a shorthand for "how fast." "Sum" (cost + cycles + area) became shorthand for "balanced." "MechA" became shorthand for "mechanically creative." Robot Uprising's community will develop similar shorthand:

- "What's your Flow State on M7?" → asking about information throughput smoothness
- "She's a Pareto player" → someone who optimizes for frontier positions, not ladder rank
- "The Brutalist meta" → a period when kill-efficient aggressive configs dominate
- "Garden-maxing" → playing for personal growth, not competition

This vocabulary is the game's long-term cultural artifact. It outlasts any individual match or season.

---

## Comparable Games and What They Teach

### Opus Magnum — The Histogram Democracy
Three antagonistic metrics (cost, cycles, area). Histograms replace leaderboards. Community-invented MechA, Sum, LexC metrics. Annual tournaments with novel metric challenges. Pareto frontier record-keeping by community bot. The key lesson: **when you give players multiple axes, the axes become the content.** Players don't just play the game — they play the metrics.

### Gladiabots — The Quiet Ladder
Async PvP with Elo rating. Ghost system. Seasonal resets. The key lesson: **small communities need rating systems that feel alive even with few matches.** Gladiabots' 200-ghost pool means you're always fighting someone, even if the community is small. Robot Uprising's Gauntlet needs the same: ghost configs as permanent sparring partners.

### Teamfight Tactics — The Seasonal Reset as Content
Tier system (Iron through Challenger). Seasonal resets with new mechanics. The key lesson: **seasonal resets are content, not maintenance.** Each new season creates a "fresh start" excitement that brings players back. The first week of a new season — when everyone's rating is compressed and the meta is unsettled — is the most exciting week.

### Factorio — The Emergent Metric (SPM)
No official leaderboard. The community invented "Science Per Minute" (SPM) as the de facto optimization metric — measuring how fast your factory produces research. Factories are classified by SPM: a "1K SPM factory" is a meaningful achievement tier. The key lesson: **if you don't provide metrics, the community will invent one, and it might not be the one you want.** Robot Uprising should provide enough metrics to channel this energy constructively.

### Slay the Spire — The Ascension Ladder as Difficulty Currency
20 ascension levels as a personal difficulty ladder. No PvP. The key lesson: **self-competition with clear milestones is deeply motivating.** Each ascension level is a visible step. Players say "I'm on Ascension 15" as identity. Robot Uprising's Garden (Model F) captures this same energy.

### Screeps — The Persistent Rating as Reputation
GCL (Game Control Level) as persistent progression. Leaderboard by territory controlled. Open-source bot code as community currency. The key lesson: **in programming games, code quality IS reputation.** Players who publish clean, well-documented bots earn community respect independent of their win rate. Robot Uprising's Config Sketch sharing captures some of this — but full config sharing (opt-in) would capture more.

---

## The TikTok Clip Test

**Model A (Histogram):** The player's cyan line lands at the 99th percentile on Elegance. They solved the mission with 4 rules. The histogram shows a massive population hump at 20-30 rules, and one tiny spike at 4. They're alone out there. The crystallization sound plays. "Four rules. Everyone else uses twenty."

**Model C (Ladder):** The player's rating ticks from 1,998 to 2,012. The Processor tier icon dissolves. The Architect icon materializes — full chip architecture, pulsing channels, warm gold glow. A celebration chime plays, different from all other game sounds. "Finally. Architect."

**Model D (Pareto):** The player's cyan dot slides onto the gold frontier line. The resonant chime. The edge flash. "🏆 NEW FRONTIER POSITION." They look at the scatterplot: 200 grey dots, 15 gold dots, and one cyan dot that just joined the gold. "I'm one of fifteen. In the world."

**Model F (Garden):** Time-lapse of a garden growing over 30 days. One plant per second, each rosette filling in. The garden goes from empty dirt to a lush bioluminescent cyberpunk ecosystem. The final frame shows the full garden, glowing. "Thirty days of Robot Uprising."

---

## Sensory Summary

| Element | Visual | Audio | Haptic (DualSense) |
|---------|--------|-------|-------------------|
| Histogram reveal | Crystallization animation, teal→gold gradient, jagged pixel curve | Glass-rod tap per panel (4 ascending tones) | Light tick per panel materialization |
| Player position line | Cyan (#00E5FF), 2px, 8px glow | Soft placement tone | — |
| Frontier claim | Gold edge flash, 0.3s | Resonant tuning fork chime, 2s decay | Strong double-pulse |
| Tier promotion | Old icon dissolves, new icon materializes from circuit traces | Distinctive celebration chime (unique per tier) | Ascending vibration pattern, 1.5s |
| Garden growth | Branch unfurling, 0.3s per branch, bioluminescent pulse | Organic-digital chime | Gentle pulse per branch |
| Rating change (+) | Green "+12" floats up from number, 0.5s | Ascending two-note ping | Light upward sweep |
| Rating change (−) | Red "−8" sinks down, 0.5s | Descending two-note tone | Soft downward thud |
| Season reset | All icons dim → "NEW SEASON" title card → icons re-illuminate | Dramatic orchestral hit → silence → new theme | Long fade-out rumble → sharp restart pulse |
| Custom metric creation | Formula compiles → preview chart animates with real data | Click-clack of mechanical typewriter for formula entry | — |

---

## New Aspects Discovered

- **7.05a — Elegance metric definition deep dive:** Exactly how is "elegance" computed? Rule count × hook count × blueprint count? Or structural analysis (dead rules, redundant hooks, unused channels)? The elegance metric's definition determines what the game rewards — mechanical simplicity or architectural cleanliness.
- **7.05b — The "metric corruption" problem:** When a metric becomes a target, it ceases to be a good metric (Goodhart's Law applied to game design). Players who optimize for elegance score may build deliberately minimal configs that pass missions but don't teach the intended lessons. How does the game resist Goodhart's Law?
- **7.05c — Histogram population health over time:** As the game matures, histograms compress toward optimal values. Early histograms are wide bell curves; late histograms are narrow spikes. How does the game maintain histogram diversity? Seasonal scenario rotations? Mission variants? Population segmentation (show histogram only for players within ±2 missions of your progress)?
- **7.05d — The "optimization identity" as community role:** Players self-sorting into optimization archetypes (speedrunner, elegance purist, Pareto hunter, garden-maxer) as a social phenomenon. Designing for archetype emergence and recognition. Profile badges for "most frontier claims" or "highest garden bloom" or "most custom metrics published."
- **7.05e — Config Sketch design constraints:** The Pareto Gallery's Config Sketch must reveal enough to learn from but not enough to copy verbatim. What's the right level of abstraction? Unit types + counts + channel topology? Or just unit types + metric values? The "learning gap" — the distance between sketch and working config — IS the game.
