# Deferred Community Metric Invention: The Opus Magnum "MechA" Pattern Applied to Robot Uprising

**Aspect:** 7.08 — Deferred community metric invention: designing the scoring system to be extensible so the community can invent new evaluation axes
**Category:** multiplayer/community
**Wave:** 7 — Cross-Cutting Synthesis

---

## The Core Design Problem

Robot Uprising ships with three locked optimization axes (Speed, Efficiency, Elegance — see 7.07) and a histogram system that displays player distribution across each (see 7.06). The question is not "what metrics should the game ship with" — that's answered. The question is: **how do you design the metric infrastructure so the community can invent metrics the developers never imagined?**

This is the MechA problem. In 2025, seven years after Opus Magnum's release, community member biggiemac42 invented MechA (Mechanism Area) — a metric that strips atoms and glyphs from the area calculation, isolating the footprint of the mechanical arms alone. MechA asks a fundamentally different question than Area: not "how much space does your solution occupy?" but "how much space do your *tools* occupy?" The distinction creates an entirely new optimization puzzle. The ideal MechA solution uses one arm and as few access points as physically possible — a constraint that produces solutions radically different from Area-optimal ones.

MechA wasn't designed by Zachtronics. It was designed by a player, seven years after launch, because the game's metric system was legible enough and the solution export format was rich enough that the community could compute novel metrics from existing replay data. The Opus Magnum tournament community subsequently invented Sum (Cost + Cycles + Area), Sum4 (Cost + Cycles + Area + Instructions), LexC (lexicographic cycle ordering), Period (steady-state cycle length for repeating solutions), and Height (vertical footprint only) — each revealing different facets of solution quality. Tournament scoring evolved from rank-based (position in leaderboard) to metric-based (inverse of the winner's score), to the current 300/(rank+29) formula that rewards improvement at every level.

The Factorio community independently invented SPM (Science Per Minute), RPM (Rockets Per Minute), SPM×UPS (throughput × simulation performance — a composite measuring real-world production rate), and the "UPS Wars" format where factories compete not on output but on computational efficiency. Screeps players invented "Control Points / GCL / Day" and "Control Points / Room Used" as community metrics for bot efficiency. None of these metrics exist in the games' UIs. They live in spreadsheets, Discord bots, and community tools.

**The fundamental design question: what must Robot Uprising's architecture expose — in terms of data, export format, and API surface — so that the community can compute metrics the developers never anticipated?**

---

## The Metric Invention Lifecycle

Community metrics don't appear spontaneously. They follow a lifecycle:

### Phase 1: Frustration with Existing Metrics
A player encounters a situation where the shipped metrics don't capture what they care about. "My config wins 85% of matches but uses a brute-force 6-relay mesh. According to the game, I'm good. But I *know* this is ugly. Elegance doesn't capture it because elegance counts rules and hooks, not relay topology." The mismatch between felt quality and measured quality creates the itch.

### Phase 2: Informal Language
Players start describing the dimension informally. "Relay density." "Hook cascade depth." "Signal-to-noise ratio." These phrases appear in Discord, Reddit, stream commentary. They don't have formal definitions yet — they're vibes.

### Phase 3: Formalization
A technically inclined community member writes a blog post or a Discord bot that computes the metric from exported match data. They propose a formula. Others test it against their configs. Edge cases emerge. The formula iterates. This is the MechA moment.

### Phase 4: Tournament Adoption
A tournament organizer includes the community metric in their scoring. Now players optimize for it deliberately. The metric becomes a skill axis. Players who were previously ranked "mediocre" by shipped metrics discover they're excellent on the community axis. New identities form.

### Phase 5: Cultural Integration
The metric gets a name, an abbreviation, a community lore. Players self-sort into optimization archetypes. "I'm an RDI purist" (Relay Density Index). The metric becomes part of the community's shared language, as natural as "APM" in StarCraft or "SPM" in Factorio.

---

## What Robot Uprising Must Expose

For the community metric lifecycle to function, the game needs three infrastructure layers:

### Layer 1: Rich Match Replay Data (The Raw Material)

Every completed match must export a complete replay file containing:

| Data Category | Contents | Community Metric Potential |
|--------------|----------|--------------------------|
| **Tick-by-tick unit state** | Position, context window contents (every slot), active rule, action taken, hook fires, stun ticks | Enables temporal metrics (when things happen, how behaviors change over time) |
| **Signal graph** | Every signal sent: source unit, channel, tick, payload type, received-by list, dropped-by list | Enables information-flow metrics (signal efficiency, dead channels, cascade depth) |
| **Production log** | Every unit spawned: blueprint ID, tick, cost, alive-until-tick | Enables economic metrics (cost-per-kill, spawn timing efficiency, unit lifespan) |
| **Context events** | Every context entry: arrival tick, source, type, slot assigned, eviction tick, eviction reason, whether it influenced a rule | Enables information quality metrics (context utilization, signal relevance, eviction waste) |
| **Combat events** | Every kill: attacker, target, tick, position | Enables tactical metrics (kill clustering, time-to-first-kill, positional advantage) |
| **Configuration snapshot** | Complete blueprint definitions, channel map, production queue | Enables structural metrics (complexity counts, topology analysis, redundancy detection) |

The replay file format should be a well-documented JSON schema with semantic versioning. The Opus Magnum community's success was partly because the solution format was a flat file that anyone could parse. Robot Uprising's `.uprising` replay format (see 6.11d-v-i) must be designed with community tooling as a first-class use case. Field names should be self-documenting. No proprietary encoding. Published schema at launch.

### Layer 2: The Metric Definition Interface (The Calculator)

The game should ship with an in-game custom metric editor — but deliberately NOT in v1. Why? Because forcing the community to build external tools first ensures only metrics with genuine community demand get formalized. The editor arrives in a post-launch update after the community has already invented 3-5 metrics externally.

When the editor does ship, it should support:
- **Arithmetic expressions** over match data fields: `total_signals_sent / total_ticks` (Signal Rate)
- **Aggregation functions**: `max()`, `min()`, `sum()`, `count()`, `avg()` over tick sequences
- **Filter predicates**: `signals WHERE channel = 'threat'` or `units WHERE type = 'relay'`
- **Temporal operators**: `first_tick_where(...)`, `duration_between(...)`, `count_ticks_where(...)`
- **A test mode** that computes the metric against the player's last 10 matches to see the distribution

This is NOT a programming language. It's a structured formula builder — dropdown fields, operators, a preview panel. Think spreadsheet formula bar, not IDE.

### Layer 3: The Social Distribution Layer (The Leaderboard)

When a community metric gains traction, it needs to become histogrammable. The game should support:
- **Custom histogram channels**: A player publishes a metric definition. Others subscribe. Their post-match debrief now includes an additional histogram tab for that metric.
- **Metric popularity tracking**: The game tracks how many subscribers each custom metric has. Popular metrics get surfaced to new players.
- **Tournament integration**: Custom metrics can be selected as scoring axes in community tournaments.
- **Developer "blessing"**: Metrics that reach critical mass (>5% of active players subscribed) get promoted to the official metric list with developer-quality histogram UI.

---

## Six Models for Community Metric Infrastructure

### Model A: "The Open Export" (Minimum Viable)

**How it works:** The game exports rich replay data in documented JSON. Period. No in-game metric tools. The community builds everything externally — Discord bots, websites, spreadsheets.

**What it enables:** Maximum flexibility. Any metric computable from the data is possible. No UI constraints on formula complexity. External tools can evolve faster than in-game features.

**What it doesn't:** No integration with the histogram system. No in-game visibility. Community metrics live in a parallel universe from the game UI. New players never discover them organically.

**Sensory description:** The replay export is a "download" button in the Inspector — a small disk icon in the top-right corner of the debrief screen. Pressing it produces a brief *mechanical click* (typewriter carriage return) and a *cyan download arrow animation* that sweeps from the screen into the button. The exported `.uprising` file appears in the player's downloads folder. The game never mentions it again. The community does the rest.

**Comparable:** Factorio's raw game data. No official SPM metric exists in-game — the community computed it from production statistics. Bitburner's NS API exposing all game state for scripting. Screeps' Memory object.

**The TikTok clip:** A player opens a Discord bot, types `/analyze relay-density`, and a chart appears showing their relay density score trending upward over 20 matches. "I didn't know I was getting better at THIS." The bot wasn't made by the developer. Cut to the game with a relay-heavy config running a flawless elimination. "She built it for relay density optimization. I built the tool to prove it."

**Strengths:** Zero engineering cost. Ships at launch. Doesn't constrain future community innovation.
**Weaknesses:** Discovery problem — only technically sophisticated players find external tools. Casual players never encounter community metrics. Fragmented tooling ecosystem.

---

### Model B: "The Formula Bar" (Spreadsheet-in-Game)

**How it works:** The debrief screen includes a "Custom Metrics" tab with a formula editor. Players write expressions like `count(signals WHERE dropped = true) / count(signals)` to define a "Signal Drop Rate" metric. The metric is computed against the current match and displayed as a number. Players can save named metrics and share them via Config Code–style text strings.

**What it enables:** In-game metric invention with zero external tooling. Immediate feedback — define a metric, see your score instantly. Sharable metric definitions.

**What the screen looks like:** The Custom Metrics tab opens a split panel. Left side: a formula editor with syntax highlighting in a monospace font — field names autocomplete from a dropdown (cyan text for data fields, amber for operators, white for literals). Right side: a "Preview" panel showing the metric's value for the current match, a sparkline of values across the last 10 matches, and a mini-histogram of friend values if friends have the same metric installed. Below: a "Save & Share" button that generates a metric code string like `MTR:SDR:count(sig.dropped)/count(sig)*100`.

**Sensory description:** Typing in the formula bar produces soft *keyboard clatter* (mechanical switch sounds, low-pitched). Each valid formula fragment turns from red to cyan as it parses. When the formula is complete and valid, the Preview panel *fades in* (200ms) with the computed value in large white numerals, and the sparkline *draws itself left to right* (400ms) with a thin gold line. An invalid formula shows the Preview panel in dim red with a pulsing error indicator — a small broken-circuit icon.

**Comparable:** Excel's formula bar. Google Sheets' QUERY function. Grafana's metric editor. Prometheus's PromQL.

**Strengths:** In-game discoverability. No external tools needed. Immediate feedback loop.
**Weaknesses:** Formula languages are intimidating for non-technical players. Edge cases and bad formulas produce meaningless numbers. Supporting a formula language is a significant engineering investment. Parsing, validation, error messages, documentation.

---

### Model C: "The Metric Marketplace" (Community Curation)

**How it works:** Combines Model A's export with a community platform. Players publish metric definitions to a Workshop-like marketplace. Other players subscribe to metrics with one click. Subscribed metrics appear as additional histogram tabs in the debrief. Popular metrics rise in the marketplace. Developers can "bless" metrics — promoting them to official status.

**What it enables:** Social metric discovery. Low-effort adoption (subscribe, don't invent). Metric popularity as quality signal. A path from community invention to official integration.

**What the screen looks like:** A "Metric Workshop" accessible from the main menu. The screen is a scrollable grid of metric cards, each showing: metric name in bold (e.g., "Relay Density Index"), creator handle, subscriber count, a one-line description, and a miniature histogram preview showing the population distribution. Cards are sorted by subscriber count by default, with filter tabs for "New," "Trending," "Developer Picks." Clicking a card opens a detail panel showing the full formula, the creator's explanation blog-post-style, example values ("Elite: <2.0, Average: 4.5-6.0, Sprawl: >8.0"), and a green "Subscribe" button.

**Sensory description:** Entering the Metric Workshop triggers a brief *library ambience shift* — the background darkens to deep navy, and metric cards float in from the right with a gentle *paper-slide* sound, each card casting a faint cyan glow. Subscribing to a metric produces a satisfying *click-lock* (like snapping a circuit board component into place) and the card's border shifts from grey to glowing cyan. The subscriber count increments with a tiny *tink*.

**Comparable:** Steam Workshop. npm registry. Grafana dashboard marketplace. VS Code extension marketplace.

**The TikTok clip:** A player scrolls the Metric Workshop. "Hook Cascade Depth — 12,847 subscribers." They subscribe. Cut to their next debrief: four histograms where there used to be three. Their Hook Cascade Depth is 7. The histogram shows most players at 3-4. "Wait. Am I OVER-ENGINEERING?" Freeze frame. Text: "The community saw what the developers couldn't."

**Strengths:** Social discovery solves Model A's visibility problem. Low barrier to adoption. Natural quality filtering via subscriber counts. Creates a "metric creator" community role.
**Weaknesses:** Requires a backend service (marketplace hosting, subscription tracking, metric computation). Tension with the "no backend" locked constraint — unless marketplace is purely a Config Code exchange forum with client-side computation. Moderation burden (offensive metric names, deliberately misleading formulas).

---

### Model D: "The Derived Histogram" (Developer-Curated Expansion)

**How it works:** The developers watch community forums, Discord, and streams for emerging informal metrics. When a community metric reaches critical mass, the developers implement it as an official histogram — computed server-side (or client-side in the no-backend model), with full visual polish. No community tooling. The developers are the metric pipeline.

**This is the Slay the Spire approach:** Mega Dead Branch didn't ship at launch. It was added because the community proved the interaction was interesting. Developers watched what players cared about and responded.

**Cadence:** One new official metric per major update (quarterly). Each addition is a community event — announced with a dev blog explaining the metric's community origin story, naming the player(s) who invented it, and showing the first-ever histogram distribution.

**Sensory description:** The new metric's first appearance is a ceremony. On the first debrief after the update, the standard histogram panel plays normally — then a fourth (or fifth) panel *tears through* from behind, accompanied by a *ripping paper* sound and a brief *camera flash*. The new histogram label pulses gold for 5 seconds. A tooltip reads: "NEW METRIC — [Name], invented by community member [Handle]. [One-line description]." After the first encounter, it integrates silently with the other histograms.

**Comparable:** Into the Breach's post-launch squad additions (developer-curated community requests). Dota 2's community item workshop → official promotion pipeline. Fortnite's community-inspired map additions.

**Strengths:** Maximum UI polish. No user-facing tooling to build. Each metric addition is a community event. Developers maintain quality control.
**Weaknesses:** Slow pipeline (quarterly at best). Developers are the bottleneck. Many interesting community metrics never get promoted. Doesn't empower the community to compute their own metrics in the interim. Depends on community being vocal enough to surface metrics.

---

### Model E: "The Metric Algebra" (Composable Primitives)

**How it works:** Instead of a freeform formula language (Model B), the game ships 10-15 pre-computed "metric primitives" — individual numbers computed from every match. Players combine primitives using basic arithmetic (+, -, ×, ÷) to create custom composite metrics. The UI is a drag-and-drop equation builder, not a text editor.

**Pre-computed primitives (shipped at launch):**

| Primitive | What It Measures |
|-----------|-----------------|
| `ticks_to_win` | Total ticks from start to victory |
| `total_material_spent` | Sum of all unit material costs |
| `total_energy_consumed` | Sum of energy across all unit-ticks |
| `units_produced` | Total units spawned |
| `units_lost` | Total units destroyed |
| `signals_sent` | Total hook fires |
| `signals_dropped` | Signals that couldn't fit in recipient's buffer |
| `stun_ticks` | Total ticks spent in context overload stun |
| `rules_total` | Sum of all rules across all blueprints |
| `hooks_total` | Sum of all hooks across all blueprints |
| `channels_active` | Number of channels with at least one sender and one receiver |
| `max_cascade_depth` | Deepest signal chain (scout→relay→relay→striker = 3) |
| `context_utilization_avg` | Average context window fill percentage across all units |
| `tags_placed` | Total tagging events |
| `kill_ratio` | Enemies killed / own units lost |

**What the screen looks like:** A "Metric Lab" accessible from the debrief or main menu. The screen shows two rows: the top row is a "shelf" of metric primitive cards (small rounded rectangles, each showing the primitive name and its value for the current match in a bold numeral). The bottom row is a "workbench" — an equation slot where the player drags primitives and operator tokens (+, -, ×, ÷, parentheses) to compose a formula. The result appears live in a large numeral at the right end of the equation. Below the workbench: a "Name It" text field and a "Save" button.

**Example community metrics built from primitives:**

| Community Name | Formula | What It Reveals |
|---------------|---------|-----------------|
| "Signal Efficiency" | `signals_sent / (signals_sent + signals_dropped)` | Information architecture reliability |
| "Stun Tax" | `stun_ticks / ticks_to_win × 100` | Cost of context overload as % of battle |
| "Relay Density" | `channels_active / units_produced` | Communication complexity per unit |
| "Kill Economy" | `kill_ratio / total_material_spent × 1000` | Combat effectiveness per resource |
| "Cascade Factor" | `max_cascade_depth × signals_sent / ticks_to_win` | Information architecture bandwidth |
| "Whisper Score" | `kill_ratio / hooks_total` | Effectiveness per unit of communication complexity — the "do more with less noise" metric |

**Sensory description:** Dragging a primitive card from the shelf to the workbench triggers a *satisfying magnetic snap* — the card slides across a glowing track rail and clicks into place with a brief *chink* (glass-on-metal). Operator tokens are small hexagonal chips that slot between primitive cards with a *click-whir* (like inserting a circuit board). The live result numeral updates with each change — swooping from old value to new with a *digital counter roll* animation (numbers cascading like an odometer).

**Comparable:** Opus Magnum's three built-in metrics enabling Sum (the simplest possible composite: just add them). Grafana's visual query builder. Scratch's block-based programming.

**The TikTok clip:** A player drags "stun_ticks" and "ticks_to_win" into the equation builder. Types "÷". The number "0.38". "38% of my battle was spent stunned." Dramatic zoom. They redesign the context config. Run again. The number drops to "0.04". "I didn't optimize for speed. I didn't optimize for elegance. I optimized for consciousness." Cut to black. "Invent your own metric. Change your own game."

**Strengths:** No text programming required. Discoverable and tactile. Bounded complexity (15 primitives, 4 operators). New primitives can be added in updates without changing the UI. The drag-and-drop interface IS the game's aesthetic.
**Weaknesses:** Limited expressiveness — can't do temporal queries ("signals in first 10 ticks"), filters ("only relay signals"), or conditional logic. Some interesting community metrics can't be expressed. The primitive set constrains the metric space.

---

### Model F: "The Layered Stack" (Recommended — Progressive Disclosure)

**How it works:** All five previous models exist as layers, unlocked progressively:

| Layer | When It Unlocks | What It Provides | Who Uses It |
|-------|----------------|-------------------|-------------|
| **Raw Export** (Model A) | Launch day | `.uprising` JSON replay files | Modders, Discord bot builders, data scientists |
| **Metric Algebra** (Model E) | Mission 5 complete | Drag-and-drop primitive compositor | Curious players, intermediate optimizers |
| **Metric Sharing** | First composite metric saved | Share metric definitions via Config Code | Social players, streamers |
| **Metric Workshop** (Model C) | 10+ matches completed | Browse, subscribe to community metrics | All players seeking new optimization axes |
| **Developer Blessing** (Model D) | Quarterly updates | Officially promoted community metrics with full histogram integration | Everyone |

The Formula Bar (Model B) is deliberately excluded from the in-game experience. It exists only as an external tool — a web page at `metrics.robotuprising.gg` that accepts `.uprising` files and lets advanced users write arbitrary metric queries. This keeps the in-game experience clean and tactile while giving power users unlimited expressiveness.

**The critical design insight:** The Metric Algebra (Layer 2) ships with the game. The Metric Workshop (Layer 4) ships 3-6 months post-launch, after the community has organically discovered which metrics matter. The developers DON'T build the Workshop until they can see what the community actually wants to track. This is the "deferred" in "deferred community metric invention" — the infrastructure is there from day one, but the social layer waits for community signal.

---

## Predicted Community Metrics

Based on Robot Uprising's locked mechanical systems, here are metrics the community will likely invent (the developers should NOT ship these — they should wait for the community to discover them):

### "Whisper Score" (Effectiveness-per-Communication)
**Formula:** `kill_ratio / hooks_total`
**What it reveals:** How much combat value each unit of communication complexity produces. High Whisper Score = lean, quiet architectures that achieve objectives with minimal signal traffic. Low Whisper Score = noisy, over-communicated systems.
**Why the community will care:** It captures the "elegant silence" that advanced players pursue — the feeling that a well-designed system needs LESS communication, not more. It will become the sophistication metric, distinct from the shipped Elegance axis (which counts structural complexity, not communication efficiency).
**Expected histogram shape:** Bimodal. Beginners cluster at low Whisper (too many hooks, too few kills). Veterans cluster at high Whisper (lean architectures). The middle is sparse — there's a phase transition where players learn to communicate less.

### "Consciousness Ratio" (Context Utilization vs. Stun)
**Formula:** `(ticks_total - stun_ticks) / ticks_total × context_utilization_avg`
**What it reveals:** What fraction of the battle your units were both awake AND using their context windows effectively. High CR = units that are always conscious and always processing relevant information. Low CR = units that are either stunned or awake-but-empty.
**Why the community will care:** It's the single metric that most directly maps to "how well did I design the information architecture?" It punishes both overload (stun) and underload (empty buffers). The sweet spot is narrow and shifts with enemy tactics.

### "Relay Dependency Index" (Network Fragility)
**Formula:** Requires temporal data — fraction of signal chains that pass through a single relay. Not expressible with basic primitives.
**What it reveals:** How much of your communication infrastructure depends on one relay. High RDI = fragile network with single points of failure. Low RDI = redundant mesh with graceful degradation.
**Why the community will care:** After the first wave of "my relay died and my whole army went deaf" disasters in Gauntlet, this becomes the resilience metric that architects obsess over. It maps directly to real infrastructure engineering (the "bus factor" for relay nodes).

### "Ghost Ratio" (Tactical Waste)
**Formula:** `units_lost / units_produced`
**What it reveals:** What fraction of your factory's output was destroyed before contributing meaningfully. A unit that dies on tick 3 with an empty context window was pure waste. One that dies on tick 40 after 12 kills was not.
**Why the community will care:** It captures production efficiency in a way that the shipped Efficiency metric (which counts total resource cost) doesn't — Ghost Ratio specifically measures whether units LIVED long enough to justify their existence.

### "First Blood" (Temporal Aggression)
**Formula:** `tick of first enemy kill / ticks_to_win × 100`
**What it reveals:** How early in the battle the first kill happens, as a percentage of total battle length. Low First Blood = aggressive opener. High First Blood = slow buildup.
**Why the community will care:** It creates an archetype axis orthogonal to Speed. A player can have slow Speed (many total ticks) but early First Blood (aggressive opener followed by methodical cleanup). It reveals tempo — does the architecture seize initiative or react?

### "Cascade Depth × Width" (Network Intelligence)
**Formula:** `max_cascade_depth × channels_active`
**What it reveals:** The total "intelligence surface" of the communication network. Deep cascades with many channels = sophisticated multi-hop processing. Shallow cascades with few channels = direct, simple communication.
**Why the community will care:** It becomes the "architecture size" metric — the equivalent of code line count but for attention systems. The community debate will be: "Is deep+wide architecturally sophisticated or over-engineered?" This debate IS the game.

---

## Player Journeys

#### Journey: Anya, 26, Data Analyst at a Manila Tech Startup

**Context:** Has completed the campaign (all 10 missions) and played 40+ Gauntlet matches. Her relay-chain architecture consistently scores top 20% on Speed but bottom 40% on Elegance. She KNOWS her architecture is good — the elegance metric just doesn't capture why.

**Minute 0:00 — The Frustration**
Anya finishes a Gauntlet match. The debrief histograms appear: Speed 82nd percentile (gold line slides into the upper tail with a bright *whoosh*), Efficiency 55th percentile (line settles in the middle with a neutral *thud*), Elegance 38th percentile (line lands in the lower half with a deflating *pff*). She stares at Elegance. Her architecture uses 4 hooks and 3 rules per blueprint — more than the elegance metric rewards. But those hooks are doing *different things*. Her relay compresses, filters, AND amplifies for different channels. That's not inelegance — that's sophistication.

**Minute 0:30 — The Discovery**
She clicks the "Metric Lab" tab (unlocked after Mission 5). The shelf of 15 metric primitives appears — small rounded cards with cyan borders, each showing a value: `signals_sent: 847`, `signals_dropped: 12`, `channels_active: 6`, `hooks_total: 14`. She's never used this before. She drags `signals_sent` to the workbench. Then `/`. Then `signals_dropped`. The live result reads: **70.6**. She names it "Relay Throughput" — how many signals get through per signal dropped. She saves it.

**Minute 1:00 — The Share**
A Config Code appears: `MTR:RT:sig_sent/sig_drop`. She copies it and pastes it into her office Discord's #gaming channel. "New metric. Relay Throughput. Mine's 70.6. What's yours?" Three coworkers paste the code into their games. Their values: 23.1, 45.8, 11.3. Anya's is the highest by far. For the first time, she has PROOF that her relay architecture is exceptional — not despite its complexity, but because of it.

**Minute 2:00 — The Rivalry**
Her coworker Ben (45.8) rebuilds his relay config that evening. He adds a compress skill to his central relay. His Relay Throughput jumps to 58.2. He screenshots the result and posts it with "Coming for you @anya." She laughs, opens her workbench, and starts optimizing. She hasn't touched her config in 2 weeks. The shipped metrics had told her she was done. Her own metric tells her she's not.

**Minute 5:00 — The Realization**
Three weeks later, Anya's "Relay Throughput" has 340 subscribers in the Metric Workshop. A streamer featured it on a tier list of community metrics. The histogram shows a long tail — most players cluster between 10-30, with a small peak at 50-80 for relay specialists. Anya is in the 95th percentile of a metric she invented. She has found her optimization identity.

**UI Annotations:**
- **Metric Lab tab:** Fourth tab in debrief panel, icon = beaker with formula inside, unlocked after M5
- **Primitive shelf:** Horizontal scrollable row, 15 cards, each 80×60px, cyan border, name above, value below in bold white
- **Workbench equation:** Horizontal slot rail with magnetic snap points, operator tokens are hexagonal
- **Live result:** Large 48px numeral at right end of equation, updates with odometer roll animation
- **Save/Share:** Generates Config Code string, copies to clipboard with *snap* sound

---

#### Journey: Kwame, 27, Twitch Streamer with 3,200 Followers

**Context:** Full-time streamer who plays Robot Uprising as part of a weekly rotation. He's been covering the Gauntlet for 2 months. His community has invented 4 custom metrics and argues about them constantly.

**Minute 0:00 — The Segment**
Kwame launches his "Metric Monday" stream segment. He opens the Metric Workshop from the main menu. The screen fills with metric cards — a scrollable grid on dark navy background, each card casting a faint cyan glow. He sorts by "Trending." The top card reads: **"Consciousness Ratio" — by relay_queen_88 — 2,847 subscribers.** "Chat, look at this. Consciousness Ratio. It's context utilization multiplied by uptime. Let's see where I land."

**Minute 0:30 — The Calculation**
He clicks the card. The detail panel slides in from the right with a *paper-slide* sound. The formula is displayed in clean monospace: `(ticks_total - stun_ticks) / ticks_total × context_util_avg / 100`. The explanation reads: "Measures how much of the battle your units were both awake AND thinking. Punishes stun AND empty buffers. The sweet spot is 0.60-0.75 for most architectures." Kwame hits "Subscribe" — *click-lock* — and his subscriber count for the metric increments from 2,847 to 2,848.

**Minute 1:00 — The Debrief**
He runs a Gauntlet match. After the sealed watch and Inspector, the debrief screen now has FOUR histogram tabs instead of three. The fourth, "Consciousness Ratio," shows a new histogram — the population curve is slightly lopsided, peaking around 0.45 with a tail extending to 0.80. Kwame's line lands at **0.31**. The audience erupts. "0.31?! Chat, I am UNCONSCIOUS. My units are sleepwalking through battle."

**Minute 2:00 — The Live Optimization**
"Okay, let's fix this live." He opens the workbench. His relay has `listen: all` in context config — it's receiving everything. He toggles off enemy movement signals (low priority, high volume). He adds a compress skill. He runs again. The Consciousness Ratio jumps to **0.52**. The histogram line slides rightward with an audible *whoosh*. "FIFTY-TWO! We went from unconscious to... semiconscious. Progress!"

**Minute 5:00 — The Clip**
His editor clips the 0.31 → 0.52 transition. It trends on Twitter/X with the caption "My robots were literally sleepwalking and I didn't know until a viewer's metric caught it." 2,400 impressions. 80 new Metric Workshop subscribers for Consciousness Ratio. relay_queen_88 gets a "Metric Pioneer" badge in the Workshop.

**UI Annotations:**
- **Metric Workshop grid:** Cards are 200×120px, subtle parallax on hover, subscriber count in bottom-right
- **Subscribe button:** Green, click produces *click-lock* sound + cyan border glow
- **Fourth histogram:** Identical visual treatment to shipped histograms, but with a small "Community" badge icon (hexagonal, cyan) in the top-left corner
- **Metric Pioneer badge:** Small hexagonal icon next to creator name, gold with circuit pattern, visible on Workshop card and in-game profile

---

#### Journey: Prof. Reyes, 48, Computer Science Department Chair

**Context:** Using Robot Uprising in her graduate seminar on multi-agent systems. She's interested in community metrics as a teaching tool for evaluation design.

**Minute 0:00 — The Assignment**
Prof. Reyes assigns her 18 graduate students: "Design a custom metric using Robot Uprising's Metric Lab. Your metric must capture something the three shipped metrics don't. Write a 2-page justification explaining what your metric measures, why the shipped metrics miss it, and how optimizing for your metric produces different architectural decisions than optimizing for Speed, Efficiency, or Elegance."

**Minute 0:15 — The Lab**
Students cluster in the CS lab, each with Robot Uprising open on a Chromebook. One student, Jun, drags `max_cascade_depth` and `channels_active` to the workbench. Multiplies them. Names it "Network Intelligence." He runs three matches with different architectures: a direct scout→striker config scores 4 (depth 2 × 2 channels), a relay-chain scores 18 (depth 3 × 6 channels), a command-heavy architecture scores 42 (depth 7 × 6 channels). "The relay chain is 4.5× more intelligent than the direct line," he writes. "But is intelligence correlated with win rate? Let me check."

**Minute 1:00 — The Discovery**
Another student, Maria, creates "Signal Waste" — `signals_dropped / signals_sent`. She finds that her highest-win-rate config has 23% Signal Waste — nearly a quarter of all signals are dropped because recipients' context windows are full. "The shipped Efficiency metric counts resources. My metric counts information waste. These are ORTHOGONAL." She graphs Signal Waste vs. Win Rate across her 20 matches and finds an inverted-U: some signal waste is OPTIMAL because it means the architecture is generating more intelligence than it can consume, and the eviction policy is correctly prioritizing.

**Minute 3:00 — The Class Discussion**
In seminar, Prof. Reyes projects Jun's and Maria's metrics. "Jun's Network Intelligence correlates with win rate for complex missions but INVERSELY correlates for simple missions — you can over-engineer. Maria's Signal Waste shows an optimal range of 15-25%. This is exactly Goodhart's Law: optimizing for Signal Waste = 0% produces architectures that under-communicate. The metric is most useful as a DIAGNOSTIC, not an OPTIMIZATION TARGET."

She introduces the concept of metric design as a parallel to system design. "In real agent engineering, you'll choose what to measure. Your metrics will shape the systems your team builds. If you measure latency, you get fast systems. If you measure throughput, you get high-capacity systems. If you measure both, you get systems that make tradeoffs — and the tradeoff IS the design."

**Minute 5:00 — The Publication**
Three students publish their metrics to the Workshop. One — "Eviction Regret" (context entries that were evicted but would have triggered a rule on a future tick) — reaches 890 subscribers within a month. Prof. Reyes cites it in her conference paper on gamified multi-agent system evaluation.

**UI Annotations:**
- **Metric Lab in classroom:** Each student's Chromebook shows the same primitive shelf but different workbench compositions
- **Metric export as assignment artifact:** Screenshot of Metric Lab formula + sparkline + mini-histogram = assignment submission
- **Workshop publication:** Student metrics appear with educational institution tag (optional)

---

#### Journey: Tomás, 68, Retired Electrical Engineer, Colorblind (Deuteranomaly)

**Context:** Completed the campaign slowly over 3 months. Plays Gauntlet casually, 2-3 matches per week. Prefers the Inspector to live battle. Has never opened the Metric Workshop.

**Minute 0:00 — The Accidental Encounter**
After a Gauntlet debrief, Tomás notices a fourth histogram tab he's never seen before. The game has quietly added a Developer Blessed metric — "Signal Coherence" — invented by the community 4 months ago, now promoted to official status. The first-encounter ceremony plays: the fourth histogram *tears through* from behind the others with a brief *ripping paper* sound and a *camera flash*. The label "SIGNAL COHERENCE" pulses gold for 5 seconds. A tooltip appears: "NEW METRIC — Signal Coherence, inspired by community member Anya_MNL. Measures how much of the information entering your units' context windows actually influences their decisions."

**Minute 0:30 — The Curiosity**
Tomás's Signal Coherence score is 0.43. The histogram shows the population clustering around 0.35-0.50 with a tail to 0.80. He's average. For the first time in weeks, he's curious about a metric. He clicks the histogram for details. A panel expands showing: "Your units received 1,247 context entries. 537 of those (43%) influenced at least one rule decision. The remaining 710 were stored but never read before eviction." Tomás stares at this. "710 entries my units never used. That's... waste."

**Minute 1:00 — The Insight**
He opens the Inspector's context window chart for his central relay. The sparkline shows context fill at 90%+ for most of the battle — nearly full, constantly evicting. But the "decision influence" overlay (a thin gold line atop the green fill) shows that only 3 of the relay's 12 context slots are ever read by rules. "Nine slots are just... noise. My relay is drowning in data it doesn't need." He opens the workbench and adjusts the relay's context config: `listen: threat, relay-compressed` (ignoring raw scout reports and movement signals).

**Minute 3:00 — The Improvement**
He runs another match. Signal Coherence jumps to 0.61. The histogram line slides rightward. The relay's context chart now shows only 6-7 slots filled, with 4-5 influencing decisions. The relay is calmer. Fewer stun ticks. Faster responses. Tomás didn't optimize for Speed or Elegance — he optimized for a community metric, and it incidentally improved both.

**Minute 5:00 — The Reflection**
"In forty years of circuit design," he mutters, "I learned that the signal-to-noise ratio is everything. This game just taught it back to me with a metric someone else invented." He opens the Workshop for the first time.

**UI Annotations:**
- **Developer Blessed ceremony:** 800ms total — tear-through (300ms) + flash (100ms) + gold pulse (400ms)
- **First-time tooltip:** White text on translucent dark panel, 200px wide, auto-dismisses after 8 seconds or on click
- **Decision influence overlay:** Thin gold line atop the green context fill sparkline in Inspector, toggled on by default for the new metric's first encounter

---

## Interaction Effects

### × 7.07 (Three Orthogonal Optimization Axes)
The shipped axes create the foundation. Community metrics extend the space in directions the developers couldn't predict. The critical design constraint: community metrics must NOT be histogrammed on the same screen as shipped metrics until developer-blessed — otherwise the debrief screen becomes cluttered and the hierarchy between official and community metrics collapses.

### × 7.06 (Histogram as Social Loop)
Community metrics feed into the histogram social loop exactly as shipped metrics do — but with an additional social layer (the metric creator as community celebrity). The histogram is the visualization; the metric is the axis. Decoupling them means any metric (shipped or community) can use the same histogram infrastructure.

### × 7.05 (Leaderboards and Optimization)
Community metrics expand the Pareto frontier from 3D to N-dimensional. The "optimization identity" concept from 7.05d becomes richer when players can self-sort not just into Speed/Efficiency/Elegance archetypes but into Whisper Score purists, Consciousness Ratio specialists, Signal Coherence optimizers. The identity vocabulary grows with the metric vocabulary.

### × 4.xx (Inspector / Debrief)
Community metrics create demand for new Inspector overlays. If "Signal Coherence" becomes popular, the community will want an Inspector mode that highlights which context entries influenced decisions vs. which were ignored. The Inspector's extensibility becomes a metric-serving surface.

### × 7.10 (Config Necropsy Culture)
Necropsy discussions (post-mortem analysis of why a config failed) become richer when they can reference community metrics. "Your RDI was 0.87 — a single relay failure would disconnect 87% of your signal chains. That's why you lost when the relay was sniped on tick 14." Community metrics provide the diagnostic vocabulary for necropsy conversations.

### × 8.04e (MVG as Web Demo)
The demo should expose 2-3 metric primitives (ticks_to_win, signals_sent, signals_dropped) even without the full Metric Lab. This plants the seed: "Wait, I can see how many signals were dropped? Can I compute a ratio?" The metric curiosity begins before the player buys the game.

### × 1.03 (Opus Magnum Competitive Analysis)
The MechA pattern is the direct ancestor. Robot Uprising's Metric Algebra (drag-and-drop primitives) is the evolution: where MechA required external computation, Robot Uprising makes metric invention an in-game activity. The 7th annual Opus Magnum tournament happened because the community had 7 years of tooling. Robot Uprising should aim for community metric invention within 3 months by providing better primitives.

---

## Comparable Games and Systems

| Game/System | How Metrics Are Extended | What Robot Uprising Can Learn |
|------------|------------------------|------------------------------|
| **Opus Magnum** | Community invented MechA, Sum, Sum4, LexC, Period, Height from exported solution data. Tournament hosts select custom metrics per week. 300/(rank+29) scoring formula evolved over 7 tournaments. | Ship rich export data. Let tournaments drive metric formalization. The tournament host as metric curator is a proven role. |
| **Factorio** | SPM, RPM, SPM×UPS invented by community with no official support. Production statistics panel provides raw data. UPS Wars as a community-invented competitive format. 1M SPM world record required custom monitoring via Grafana. | Players will compute metrics from whatever data you expose. The game doesn't need to support custom metrics — it needs to support custom data export. |
| **Screeps** | "Control Points / GCL / Day," "CPU per operation" as community efficiency metrics. Player code can compute arbitrary metrics from game API. | The most extensible metric system is one where the player has full programmatic access. Robot Uprising's no-code approach (Metric Algebra) trades expressiveness for accessibility. |
| **Slay the Spire** | Built-in score system widely criticized as "just a tally of luck." Community values win rate, win streak, and Ascension 20 heart-kill rate instead. Informal metrics replaced the official one. | If your shipped metrics don't capture what players care about, they'll invent replacements. Better to design for this than fight it. |
| **StarCraft** | APM (Actions Per Minute) as the iconic community metric — not displayed in-game until years after the community established it. EAPM (Effective APM) as a community refinement filtering out spam. | Some community metrics become so iconic they define the game's competitive identity. "What's your APM?" preceded "What's your rank?" Robot Uprising's equivalent might be "What's your Whisper Score?" |
| **Grafana / Prometheus** | Real-world monitoring systems where teams define custom metrics via PromQL expressions over time-series data. Dashboard sharing via JSON export. | The Metric Workshop is essentially a game-ified Grafana marketplace. The parallel is deliberate — players who learn metric design here learn transferable observability skills. |

---

## Anti-Patterns to Avoid

### "The Vanity Metric Trap"
If community metrics are too easy to create and histogram, the Workshop fills with meaningless metrics — "Total Hook Fires / Pi" — that nobody subscribes to but clutter discovery. **Mitigation:** Only metrics with >50 subscribers appear in Workshop discovery. Below that, they're private/shared-by-link only.

### "The Goodhart Collapse"
When a community metric becomes popular enough to be a de facto leaderboard, players optimize for it specifically, producing architectures that score well on the metric but play badly. **Mitigation:** The game should surface metric-metric correlations. "Players who optimize for Relay Density Index tend to have lower Win Rates." Let the data speak — don't hide the tradeoffs.

### "The Metric Creator Celebrity Problem"
If metric creators get too much social status, players create metrics for clout rather than insight. **Mitigation:** Metric creator attribution is visible but low-key — a small name on the Workshop card, not a prominent profile badge. The metric's usefulness, not its creator's fame, should drive adoption.

### "The Fragmentation Problem"
If 200 community metrics all measure slightly different things, the shared language fractures. Players can't compare because they're on different metrics. **Mitigation:** The Developer Blessing pipeline (quarterly promotion of 1-2 metrics to official status) creates convergence points. The blessed metrics become the lingua franca.

---

## Sensory Summary

| Element | Visual | Audio | Feel |
|---------|--------|-------|------|
| **Metric Lab open** | Dark workspace with cyan-edged primitive cards on shelf | Library ambience — quiet hum, distant data processing | Contemplative, analytical |
| **Primitive drag** | Card slides along glowing track rail | *Magnetic snap* — brief metallic *chink* | Satisfying, physical |
| **Operator insert** | Hexagonal chip clicks between cards | *Click-whir* — circuit insertion | Modular, building |
| **Live result update** | Odometer roll animation, numeral cascading | *Digital counter roll* — rapid soft ticks | Immediate, responsive |
| **Save metric** | Cyan confirmation flash, Config Code generates | *Typewriter carriage return* — decisive | Authorial, permanent |
| **Workshop browse** | Floating cards on navy, parallax hover | *Paper slides* — gentle shuffling | Curated, library |
| **Subscribe** | Border shift grey→cyan, count increment | *Click-lock* — snap into place | Commitment, collection |
| **Developer Blessing ceremony** | Fourth histogram tears through, gold pulse | *Rip + camera flash + crystallization* | Event, revelation |
| **Community histogram** | Same as shipped + hexagonal "Community" badge | Same swoosh + distinct *tink* on badge | Familiar but extended |

---

## New Aspects Discovered

- **7.08a — Metric primitive selection as game balance lever:** Which 15 primitives ship determines which metrics are easy vs. hard to compute. Adding "context_entries_that_influenced_decisions" as a primitive makes Signal Coherence trivial; omitting it forces external tooling. The primitive set IS the metric design space boundary.
- **7.08b — Metric Workshop moderation and quality signals:** Beyond subscriber count — upvote/downvote, "misleading metric" reports, seasonal metric validity decay, metric creator trust scores. The curation problem for user-generated analytical tools.
- **7.08c — Cross-metric correlation discovery tool:** An in-game panel showing Pearson correlations between all subscribed metrics. "Your Signal Coherence and Win Rate have r=0.72. Your Relay Density and Elegance have r=-0.89." Teaches correlation ≠ causation through lived experience.
- **7.08d — Metric-as-challenge-constraint:** Community tournaments that require optimizing for a specific community metric rather than shipped ones. "This week's Gauntlet Bounty: highest Whisper Score on Mission 7." Metrics become content.
- **7.08e — The "metric archaeology" pattern:** When the Developer Blessing pipeline promotes a community metric, publishing a retrospective blog showing how the metric evolved — from informal Discord language to formalization to adoption to official status. The metric's lifecycle as community narrative.
