# Pipelined Agent Execution

**Aspect:** 2.15 — Pipelined agent execution
**Wave:** 2 (Core Mechanic Variations)
**Category:** core-mechanic

---

## The Design Question

In Robot Uprising, the player configures blueprints and queues them for production. Units spawn, execute their skills, process their context windows, fire hooks, and act — all within the discrete tick system. The question: **can players design configurations where agents overlap their work on sequential tasks, and should the game reward this?**

The concept comes directly from Opus Magnum, where the distinction between a sequential solution (arm A completes product 1, then starts product 2) and a pipelined solution (arm A starts product 2 while arm B finishes product 1) is the central optimization axis. In Robot Uprising, the equivalent is: **can a player design an agent architecture where the scout-relay-striker chain processes multiple threats simultaneously, with each unit handling a different stage of a different threat at the same time?**

This is not trivial. The locked 1-tick-per-hop signal latency means a scout detecting an enemy at tick T produces a striker response at tick T+2 (scout→relay→striker, minimum). During those 2 ticks of latency, a well-pipelined architecture has the scout already scanning the next sector, the relay already compressing the previous signal while forwarding the current one, and a second striker already closing on the previous target. The architecture processes threats like an assembly line, not a batch processor.

The critical insight: **cycle-optimal and cost-optimal solutions diverge.** A pipelined architecture that eliminates 3 enemies in 6 ticks costs more units (multiple strikers, multiple scouts) than a sequential architecture that eliminates 3 enemies in 12 ticks with one scout and one striker. The game's resource system — minerals for production, energy per tick — creates a genuine tradeoff. Pipeline harder = spend more = eliminate faster. The player must decide: is throughput or efficiency the winning strategy for this mission?

---

## The Pipeline Vocabulary

### "The Assembly Line" — Core Concept

A pipelined agent architecture has three properties:

1. **Stage separation.** Each agent handles one stage of a multi-stage process. The scout DETECTS. The relay ROUTES. The striker ELIMINATES. No agent does two stages.
2. **Temporal overlap.** While the striker eliminates target A, the scout is already detecting target B. The pipeline is always full — every agent is busy every tick.
3. **Throughput vs. latency distinction.** Latency (time from detection to elimination for ONE target) stays the same: 2+ ticks. But throughput (targets eliminated per tick) increases: from 1 every 4 ticks (sequential) to 1 every 1-2 ticks (fully pipelined).

### "The Stall" — Pipeline Hazards

Pipelines break. In CPU architecture, these are called hazards. In Robot Uprising, the equivalent hazards are:

- **Context stall.** The relay's context window fills up because it's receiving faster than it can compress. The pipeline backs up. Subsequent scout signals queue or get evicted. The player must size context windows and eviction policies to prevent stalls.
- **Target stall.** The striker arrives at the target location, but the target has moved. The striker wasted a tick on a stale signal. The pipeline produced a "stale result." Prevention: fresher signals in context, faster striker movement, or predictive rules.
- **Resource stall.** The factory can't produce units fast enough to keep all pipeline stages staffed. A striker gets eliminated, and the replacement takes 3 ticks to build. The pipeline runs with an empty stage.
- **Collision stall.** Two pipeline instances try to send their strikers to the same target simultaneously. One striker's kill renders the other's movement wasted. Prevention: deconfliction rules or tagging to claim targets.

### "The Throughput Number" — Player-Visible Metric

In the Inspector, after a mission, the player sees a metric: **threats processed per tick** (TPT). A sequential architecture scores 0.15-0.25 TPT. A cleanly pipelined architecture scores 0.5-1.0 TPT. The number is displayed as a horizontal bar chart alongside cycle count and cost, making the pipeline-vs-sequential tradeoff visible and comparable — exactly like Opus Magnum's histograms.

---

## Five Pipeline Models

### Model A: "The Single Lane" (No Pipeline)

The simplest architecture. One scout, one relay, one striker. The scout finds a target, the relay forwards, the striker engages. While the striker moves to engage, the scout waits. After the kill, the scout resumes scanning.

**How it works tick by tick:**
- T1: Scout detects enemy at E5. Fires on `threat-net`.
- T2: Relay receives, compresses, forwards on `strike-orders`.
- T3: Striker receives orders. Begins moving toward E5.
- T5: Striker arrives at E5. Eliminates enemy.
- T6: Scout resumes patrol. Detects next enemy at G3.
- T7: Relay forwards...

**Throughput:** ~0.2 TPT. One kill every 5 ticks.
**Cost:** 16 minerals (3 scout + 5 relay + 8 striker). Minimal energy: 6e/tick.
**When it wins:** Missions with sparse, slow-moving enemies. Low resource budgets (Missions 5-6). When the player's context window management isn't sophisticated enough for overlapping signals.

---

### Model B: "The Double Barrel" (Duplicated Pipeline)

Two complete, independent pipelines. Pipeline Alpha (scout-A, relay-A, striker-A) handles the west half of the board. Pipeline Beta (scout-B, relay-B, striker-B) handles the east. Each pipeline is single-lane internally, but the overall system processes two threats simultaneously.

**How it works:**
- T1: Scout-A detects enemy at B3 (west). Scout-B detects enemy at G6 (east).
- T2: Both relays forward simultaneously on separate channels (`threat-west`, `threat-east`).
- T3: Both strikers begin moving.
- T5: Both strikers eliminate targets simultaneously.

**Throughput:** ~0.4 TPT. Two kills every 5 ticks.
**Cost:** 32 minerals. Double energy: 12e/tick.
**The tradeoff:** Twice the throughput, twice the cost. No efficiency gain — just brute force parallelism. This is the "wide pipeline" approach: more lanes, same depth.

**When it wins:** Missions with enemies attacking from multiple directions simultaneously. When the player has abundant resources and needs to defend a wide front.

---

### Model C: "The True Pipeline" (Overlapping Stages)

One scout, one relay, TWO strikers. The scout scans continuously, firing a new threat signal every 2 ticks. The relay forwards each signal to whichever striker is idle. Striker-A engages target 1 while Striker-B is already receiving orders for target 2.

**How it works:**
- T1: Scout detects enemy-1 at C4. Fires on `threat-net`.
- T2: Relay forwards to `strike-orders`. Scout continues patrol.
- T3: Striker-A receives, begins moving to C4. Scout detects enemy-2 at F6. Fires on `threat-net`.
- T4: Relay forwards enemy-2 signal. Striker-A still en route to C4.
- T5: Striker-A eliminates enemy-1. Striker-B receives enemy-2 orders, begins moving to F6.
- T6: Scout detects enemy-3. Striker-B en route to F6.
- T7: Striker-B eliminates enemy-2. The pipeline has now killed 2 enemies in 7 ticks with overlap.

**Throughput:** ~0.5 TPT with two strikers. ~0.75 TPT with three.
**Cost:** 24 minerals (one extra striker). Energy: 9e/tick.
**The insight:** This is TRUE pipelining. The scout never waits. The relay never waits. Only one striker is ever idle (the one between kills). The throughput gain comes from eliminating the idle time in the kill stage — the bottleneck.

**When it wins:** Missions with steady streams of enemies from one direction. The player has identified the bottleneck (striker travel time) and solved it by duplicating only that stage. This is the Opus Magnum lesson: **don't duplicate the whole machine — duplicate the slow part.**

---

### Model D: "The Wavefront" (Speculative Execution)

The scout fires threat signals immediately upon detection — but also fires a PREDICTIVE signal based on enemy movement patterns. The relay forwards both real and predicted signals. Strikers pre-position based on predictions and correct course when the real signal arrives.

**How it works:**
- T1: Scout detects enemy at D4 moving east. Fires `threat-net: D4` AND `predict-net: E4-next-tick`.
- T2: Relay forwards both. Striker-A begins moving toward E4 (predicted position).
- T3: Enemy is at E4 (prediction correct). Striker-A is adjacent. Eliminates immediately.

With bad prediction:
- T3: Enemy moved to D5 instead (prediction wrong). Striker-A is at E4, wrong position. Must correct.
- T4: Scout updates: `threat-net: D5`. Striker-A redirects.
- T5: Striker-A eliminates at D5. One tick of wasted movement.

**Throughput:** ~0.7 TPT when predictions are correct. ~0.3 TPT when wrong.
**Cost:** Same unit count as Model C, but the scout needs a "predict" skill (or a rule that infers movement direction from observation history). More context window slots consumed by predictions.
**The tradeoff:** Speculative execution trades context window space for latency reduction. The prediction fills a context slot. If wrong, that slot was wasted — and in a 6-slot scout buffer, wasting one slot is a 16% capacity hit.

**When it wins:** Missions with predictable enemy movement (patrol routes, straight-line approaches). Punishes the player hard when enemy movement is erratic. This is the CPU branch prediction analogy — correct speculation is free performance, wrong speculation is expensive.

---

### Model E: "The Dataflow Architecture" (Event-Driven Pipeline)

No fixed pipeline stages. Every agent reacts to whatever arrives in its context window. A scout that receives a `strike-complete` acknowledgment on its context immediately begins scanning the area around the kill for follow-up threats. A striker that receives a `retreat` signal from a relay immediately redirects. The pipeline emerges from the event flow, not from a pre-planned sequence.

**How it works:**
- No fixed order. The system self-organizes based on hook wiring and rules.
- The player configures: "When `strike-complete` arrives in context, trigger patrol-mode for nearest quadrant." "When more than 2 `threat` signals are in context simultaneously, trigger `priority-target` on the highest-fidelity one."
- The pipeline structure is implicit in the rules. It might be a single lane when threats are sparse, automatically widening to a 3-lane pipeline when 3 simultaneous threats arrive.

**Throughput:** Variable. 0.2-1.0 TPT depending on threat density.
**Cost:** Moderate unit count, but HIGH context window pressure. Every agent must listen to more channels, filling their buffers faster.
**The tradeoff:** Maximum adaptability, maximum context window pressure. The architecture that handles everything also risks overloading on everything. Context overload → stun → the pipeline collapses precisely when it's most needed.

**When it wins:** Missions with unpredictable, variable threat patterns. The player who builds a rigid Model C pipeline gets destroyed when enemies attack from an unexpected direction; the Model E architecture adapts. But the Model E player who doesn't manage context windows carefully gets stun-locked by their own flexibility.

---

## Strengths and Weaknesses

### Strengths

- **Directly teaches a real engineering concept.** Pipelining is fundamental to CPU design, manufacturing, DevOps (CI/CD pipelines), and distributed systems. The 1:1 vocabulary mapping (stall, hazard, throughput, latency, speculative execution) means players learn transferable concepts.
- **Creates a natural difficulty curve.** Model A (single lane) works for Missions 5-6. Model B (brute force) works for 7. Model C (true pipeline) is needed for 8-9. Model D/E are mastery-level optimizations for Mission 10 and Gauntlet.
- **Multiple optimization axes prevent solved states.** A mission might be completable with a cheap-but-slow Model A, an expensive-but-fast Model C, or a risky-but-adaptive Model E. Different approaches to the same mission create histogram-worthy variation.
- **Pipeline failures are visually spectacular.** A context stall cascading through a relay chain, stun-locking three units simultaneously, is a memorable sealed-watch moment. The player SEES the backup happen — signals stacking, context bars filling, the amber glow shifting to angry red, then the sparking jitter of overload.
- **The throughput metric creates a second scoreboard.** Even after winning, the player asks: "Can I win FASTER?" The TPT histogram next to the cost histogram creates a two-axis optimization space where solutions that are cheap aren't fast and solutions that are fast aren't cheap.

### Weaknesses

- **Cognitive overhead for beginners.** Temporal overlap is hard to reason about. A new player watching a pipelined sealed watch sees chaos — too many things happening simultaneously. The single-lane model must be presented as completely valid, not as a lesser solution.
- **Debugging pipelined architectures is brutal.** When a 3-stage pipeline stalls, the root cause might be 4 ticks and 3 agents upstream. The Inspector's decision trace must support tracing backward through a pipeline: "Striker-B was idle at T14 because Relay-A was stun-locked at T12 because Scout-C overloaded its context at T10 because..." This is a multi-hop causal chain.
- **Risk of a dominant strategy.** If Model C (true pipeline) is always better than Model A (sequential) once the player has enough resources, the "choice" is illusory — it's just "save up minerals, then pipeline." The game must create missions where sequential is genuinely better: tight maps where two strikers get in each other's way, low-resource missions, missions where silence (fewer EM emissions) matters more than speed.
- **The speculative execution model (D) might be too advanced.** Prediction-based positioning requires the player to reason about what the enemy will do, configure rules based on that prediction, and accept the cost when wrong. This is graduate-level game design in a game that also needs to onboard 14-year-olds.

---

## Player Journeys

### Journey: Sofia, 15, High School Student, First Strategy Game

**Context:** Mission 6, Palawan jungle. Sofia just survived the spawn storm in Mission 5 (barely — she used the "Spawn Governor" fix from the predecessor's config). She has two scout blueprints, one relay, and one striker. Her previous missions used single-lane architectures exclusively. She's never had to process more than one threat at a time.

**Minute 0:00 — The Briefing**
The campaign map pulses gold over Palawan. The boot log types: `THREAT ASSESSMENT: multiple hostiles inbound from northeast and southwest simultaneously. Single-lane signal chain inadequate. Recommend parallel processing.` Sofia reads this twice. "Parallel processing?" She's heard the term in her computer science class but has no idea how to configure it.

The plan screen appears. Board on the left: dense jungle terrain (dark green tiles with vine overlays), her factory at C2 (glowing cyan), enemy spawners at A7 and H1 (pulsing red). Two directions. Her single scout-relay-striker chain can only face one direction at a time.

**Minute 0:45 — The First Attempt**
Sofia keeps her existing single-lane config. Scout patrols northeast. Relay at D4. Striker follows scout signals. She hits EXECUTE. The sealed watch begins.

Tick 1-5: Scout detects Enemy-1 approaching from A7. Signal fires. Relay compresses. Striker moves to intercept. The signal chain glows green — dashed cyan lines trace scout→relay→striker. So far, so good.

Tick 6: Enemy-2 appears at H1 — the opposite corner. No scout coverage there. The context bars on Sofia's scout show 4/6 slots filled with northeast observations. The southwest is invisible.

Tick 10: Striker eliminates Enemy-1 at B5. But Enemy-2 has advanced to F3, completely undetected. Enemy-3 spawns at A7.

Tick 14: Enemy-2 reaches D3. Adjacent to the relay. One-shot kill. The relay's context bar — a gentle row of five cyan pips — suddenly blinks out. A tiny orange spark, a debris scatter, and silence. Every signal line connected to that relay goes dark simultaneously. The scout keeps detecting, keeps firing hooks, but the signals go nowhere. The striker stands idle, context window empty, waiting for orders that will never come.

Tick 18: Enemy-2 reaches C2. Factory destroyed. Mission failed.

Sofia stares at the defeat screen. The tick counter reads 18. Total kills: 1.

**Minute 2:30 — The Inspector**
The Inspector opens on tick 14 — the relay death. Sofia clicks the relay's ghost tile. The context window display shows its last state: 8/12 slots filled, all northeast threat data. The decision trace shows the relay was compressing and forwarding normally. It just... didn't see the striker coming from the south.

She scrubs backward to tick 6. Enemy-2's first appearance. Her scout was at B6, facing northeast. Perception radius: the faint cyan cone reaching 5 tiles — all pointing the wrong way. The southwest approach was completely dark.

**Minute 3:45 — The Redesign**
Back on the plan screen. Sofia stares at the board. Two enemy spawners. One scout. She drags a second scout blueprint from the Codex into her production queue. `Cost: 3 minerals. Queue position: 2nd.` She configures this scout to patrol southwest, firing on a new channel she types: `threat-south`.

Her relay already listens on `threat-net` (northeast). She adds `threat-south` to its listen config. Now the relay will receive signals from both scouts. She pauses. The relay has 12 context slots. With two scouts feeding it, those slots will fill faster. She adjusts the eviction priority: oldest entries evicted first.

She considers adding a second striker. Cost: 8 minerals. Total army cost would jump from 16 to 27. She checks the mission's starting minerals: 30. Tight, but possible. She adds a second striker, listening on `strike-orders`. Both strikers will receive the same orders — whichever is closer will arrive first.

**Minute 5:30 — The Second Attempt**
EXECUTE. The sealed watch begins again. Two scouts fan out in opposite directions — northeast and southwest — their perception cones sweeping like searchlights. The board has twice as many signal lines now: green dashes crisscross from both scouts to the central relay.

Tick 4: Scout-A detects Enemy-1 from A7. Scout-B detects Enemy-2 from H1. Both fire simultaneously. Two signal flashes — one from each corner of the board, both converging on the relay at D4.

Tick 5: The relay's context bar jumps. Two new entries land in the same tick. The bar was at 3/12 — now 5/12. The relay compresses both signals and forwards on `strike-orders`. Two signal lines fire outward to both strikers.

Tick 6: Striker-A moves toward Enemy-1. Striker-B moves toward Enemy-2. The board shows two simultaneous intercept vectors — cyan arrows pointing in opposite directions. Sofia's eyes go wide. "It's doing TWO things at once."

Tick 9: Striker-A eliminates Enemy-1. Striker-B eliminates Enemy-2. Two red flashes, two debris scatters, same tick. The kill feed at the bottom shows both entries stacked.

Tick 10: Both scouts have already detected Enemy-3 and Enemy-4. The relay is forwarding again. The pipeline never stopped.

Tick 22: Mission complete. All enemies eliminated. Zero losses. The throughput number in the debrief reads: **0.41 TPT**. The histogram shows her previous attempt at 0.06 TPT. The bar is seven times longer.

Sofia screenshots the histogram and texts it to her friend: "I made a pipeline."

**Minute 8:00 — Resolution**
Sofia has discovered Model B (Double Barrel). She duplicated the entire chain. It's not the most efficient solution — she could have used one scout with wider patrol coverage — but it WORKS. She doesn't know yet that duplicating only the bottleneck stage (Model C) would be cheaper. That discovery waits for Mission 7, when her mineral budget forces her to be more economical.

**UI Annotations:**
- **Signal lines:** Dashed cyan lines connecting hook-transmitting units to listeners. Flash green on signal delivery. Two simultaneous flashes from opposite corners = visual confirmation of parallelism.
- **Context bar multi-fill:** When 2+ entries arrive in the same tick, the bar's pips illuminate in rapid sequence (left to right, 50ms per pip) rather than simultaneously, creating a "filling up" micro-animation.
- **TPT histogram:** Horizontal bar chart in the Inspector, positioned below the cost histogram. Scale 0.0-1.0. Sofia's 0.41 bar is amber; under 0.2 is red, over 0.6 is green.
- **Kill feed:** Bottom-center, 200px wide, auto-fading text entries. Format: `T9: ⚔ STRIKER-A → ENEMY-1 [B5]`. Two entries in the same tick stack vertically with a shared tick label.

---

### Journey: Marcus, 42, DevOps Engineer, Factorio Veteran

**Context:** Mission 8. Marcus has been playing for three sessions. He's discovered Model C (true pipeline) independently and has been refining it. His current architecture: 2 scouts (overlapping patrol routes), 1 relay (central), 3 strikers (rotating). He's consistently hitting 0.6 TPT. Mission 8 introduces a new challenge: enemy relay units that flood his channels with noise, threatening context overload on his relay.

**Minute 0:00 — The Optimization Itch**
Marcus opens the plan screen. His workbench shows a refined architecture. He's named his blueprints with clinical precision: `RECON-WIDE`, `RELAY-CORE`, `STRIKE-ALPHA`, `STRIKE-BRAVO`, `STRIKE-CHARLIE`. His production queue: RECON-WIDE, RELAY-CORE, STRIKE-ALPHA, RECON-WIDE, STRIKE-BRAVO. The conveyor belt of blueprint icons scrolls left to right, a miniature assembly line.

He studies the mission brief. Enemy count: 12, including 2 enemy relays. The boot log warns: `HOSTILE SIGNAL EMITTERS DETECTED. EXPECT CHANNEL POLLUTION.` Marcus nods. He knows what this means — enemy relays will broadcast garbage on common frequencies, filling his relay's context window with noise.

His RELAY-CORE has 12 context slots. Currently listens on `recon-net` and `strike-ack`. With enemy noise, he expects 3-4 garbage entries per tick flooding in. At that rate, his relay will overload in 3 ticks. The pipeline stalls. Everything downstream starves.

**Minute 1:30 — The Filter Strategy**
Marcus equips the `filter` skill on RELAY-CORE. He configures a rule: "IF source is not tagged-friendly, THEN evict from context immediately." This should strip enemy noise before it consumes slots. But he hesitates. The filter takes one tick to process. During that tick, the slot is occupied. With 3 garbage entries per tick and 1 tick to filter each, he's losing 3 slots to garbage processing at all times. His effective buffer drops from 12 to 9. Still functional, but tighter.

He considers an alternative: the `compress` skill. Instead of filtering noise, compress legitimate signals to take fewer slots, leaving room for garbage to coexist. But compressed signals lose fidelity — the striker might get "enemy somewhere near E-row" instead of "enemy at E4." Less precise targeting means more wasted movement ticks. The pipeline's throughput drops because the kill stage takes longer.

Marcus runs the numbers in his head. Filter: 9 effective slots, full-fidelity signals. Compress: 12 slots, reduced-fidelity signals. The pipeline bottleneck shifts: with filter, the bottleneck is context capacity. With compress, the bottleneck is striker targeting precision.

**Minute 3:00 — The Two-Relay Solution**
Marcus has a third idea. Add a second relay. RELAY-INTAKE handles incoming scout signals and performs filtering. RELAY-CORE handles compression and forwarding to strikers. The pipeline gains a new stage: Scout → RELAY-INTAKE (filter) → RELAY-CORE (compress + forward) → Striker.

He drags a new relay blueprint into the queue. Types the blueprint name: `RELAY-INTAKE`. Configures it: listen on `recon-net`, filter skill active, forward clean signals on `clean-net`. RELAY-CORE now listens on `clean-net` instead of `recon-net`. The enemy noise hits RELAY-INTAKE, gets filtered, and never reaches RELAY-CORE.

The cost: 5 additional minerals, 2 additional energy/tick. The latency: +1 tick (scout→intake→core→striker = 3 hops instead of 2). His throughput per threat stays the same, but the pipeline is more resilient to noise.

Marcus stares at the channel map. The auto-generated panel shows: `recon-net [RECON-WIDE × 2 → RELAY-INTAKE]`, `clean-net [RELAY-INTAKE → RELAY-CORE]`, `strike-orders [RELAY-CORE → STRIKE-ALPHA, STRIKE-BRAVO, STRIKE-CHARLIE]`. Three stages. A proper pipeline diagram. He recognizes the pattern — it's a message queue with a dead-letter filter. He's built this exact architecture in Kafka.

**Minute 4:30 — The Sealed Watch**
EXECUTE. The battlefield renders: Cebu urban cyberpunk. Neon-lit vertical structures, exposed fiber optic cables glowing amber along building edges, a jeepney-shaped drone hovering over the player factory. Marcus watches his pipeline spin up.

Tick 3: RECON-WIDE-1 detects the first enemy. Signal fires on `recon-net`. A green flash from the scout to RELAY-INTAKE. RELAY-INTAKE's context bar ticks up: 1/12. Next tick, it forwards a clean signal on `clean-net`. Another green flash, this time from RELAY-INTAKE to RELAY-CORE.

Tick 6: Enemy relay at G5 begins broadcasting. Suddenly, RELAY-INTAKE's context bar jumps — 4/12, 7/12, 9/12 in three ticks. The bar shifts from cool cyan to warm amber. Marcus watches the filter work: each garbage entry appears as a bright pip, then fades to grey and vanishes as the filter evicts it. The bar oscillates between 8 and 10, never hitting 12. The filter holds.

Meanwhile, RELAY-CORE's context bar sits at a calm 3/12. Steady cyan. Only clean signals arrive. The pipeline downstream is unaffected. STRIKE-ALPHA moves to intercept. Kill at tick 9. STRIKE-BRAVO receives the next target. Kill at tick 12. The rhythm is steady: one kill every 3 ticks. TPT: 0.33 per striker, 0.66 aggregate.

Tick 15: Both enemy relays are broadcasting. RELAY-INTAKE's bar hits 11/12. The amber glow intensifies. One more garbage entry and it overloads. Marcus leans forward. The context bar holds at 11 for two ticks — the filter evicts each entry just before the next arrives. The timing is razor-thin. A single additional signal source would break it.

Tick 18: STRIKE-CHARLIE eliminates one enemy relay. The noise drops by half. RELAY-INTAKE's bar drops to 7/12. Cool cyan again. Marcus exhales. The pipeline survived.

Tick 28: Mission complete. Zero losses. TPT: 0.54. Cost: 34 minerals. The histogram shows his solution in the middle of both axes — not the cheapest, not the fastest, but the most resilient.

**Minute 7:00 — The Inspector Deep Dive**
Marcus scrubs to tick 15 — the near-overload moment. He clicks RELAY-INTAKE. The context window detail shows 11 slots occupied: 3 legitimate scout signals (green border), 8 enemy noise entries (red border, each tagged `[FILTERED — evicting]`). The filter was processing 8 garbage entries per tick while passing 3 legitimate entries. He notes: if the filter were 1 tick slower, or the enemy noise 1 entry stronger, the relay would have stalled.

He opens the context window chart — the sparkline across all ticks. RELAY-INTAKE's chart looks like a mountain range: spikes at tick 6, 10, 15, dips at 18 (enemy relay destroyed). RELAY-CORE's chart is flat — a gentle plateau at 3-4/12. The two charts together tell the story: the intake relay absorbed all the volatility so the core relay could operate in peace.

Marcus screenshots both charts side-by-side. Posts to the community forum: "Built a dead-letter queue in a video game. Here's the before and after." The post gets 847 upvotes.

**UI Annotations:**
- **Filter animation on context bar:** Garbage entries appear as bright pips, flash red, then dissolve with a tiny scatter of particles. Legitimate entries appear green and stay solid. The bar's color reflects the ratio: mostly garbage = amber/red tint, mostly clean = cyan.
- **Channel map:** Auto-generated panel in bottom-left of plan screen. Shows channels as labeled arrows between blueprint icons. `recon-net → RELAY-INTAKE → clean-net → RELAY-CORE → strike-orders → STRIKE-*`. The topology is visible at a glance.
- **Context window chart (Inspector):** Sparkline, 200px wide, one pixel per tick. Y-axis: 0 to max buffer size. Color bands: green (0-50%), amber (50-75%), red (75-100%). Multiple unit charts stack vertically for comparison.

---

### Journey: Dr. Amara, 38, ML Researcher, Mission 10 Veteran

**Context:** Mission 10 (Taal volcano, final boss). Dr. Amara has beaten the campaign once and is replaying for histogram optimization. Her previous best: 0.72 TPT, 45 minerals. She wants sub-40 minerals with 0.8+ TPT. This requires Model D — speculative execution — which she's theorized but never successfully implemented.

**Minute 0:00 — The Theory**
Dr. Amara's workbench is dense. Six blueprints. The production queue is a conveyor belt of tightly ordered icons. She's added a new rule to her scout blueprint: "IF enemy movement vector is detectable (two consecutive observations of same enemy), THEN fire PREDICTIVE signal on `predict-net` with estimated next-tick position."

The scout has 6 context slots. Two consecutive observations of the same enemy take 2 slots. The prediction calculation takes a third (the rule fires a hook, consuming one slot for the outgoing signal). Half the scout's context is consumed by the prediction system. This means the scout can only track predictions for one enemy at a time — any additional enemy observations will evict the prediction data.

She configures STRIKE-ALPHA with a new rule: "IF `predict-net` signal received, THEN move toward predicted position. IF `threat-net` signal received for same target with ACTUAL position, THEN correct course." The striker acts on predictions but self-corrects when reality arrives.

**Minute 2:00 — The Risk Calculation**
Dr. Amara studies the locked mission layout. Taal volcano terrain: the central caldera creates a narrow approach channel. Enemies funnel through predictable paths. Prediction accuracy should be high — maybe 80% — because the terrain constrains movement. On open terrain, predictions would be worse.

She considers the cost: no additional units needed beyond her standard Model C setup (2 scouts, 1 relay, 2 strikers). The prediction is free in terms of minerals and energy. The cost is context window space on the scout and latency risk on the striker.

If a prediction is wrong, the striker wastes 1-2 ticks moving to the wrong position. In a one-shot-one-kill game, 2 wasted ticks means the enemy advances 2 tiles. If that enemy reaches the relay or factory, it's catastrophic. She adds a safety rule to the striker: "IF current position is within 2 tiles of factory, THEN abandon current target and defend." The insurance policy costs one rule slot.

**Minute 3:30 — The Speculative Pipeline in Action**
EXECUTE. The Taal caldera battlefield renders: dark volcanic rock tiles with veins of orange lava glow, the factory nestled against the crater wall, steam vents creating terrain obstacles. The sealed watch begins.

Tick 1: Scout-A spots Enemy-1 at H6, moving west. Context bar: 1/6.
Tick 2: Scout-A spots Enemy-1 at G6. Two observations. Context bar: 3/6 (two observations + prediction calculation). The scout fires TWO signals simultaneously: `threat-net: G6` (actual) and `predict-net: F6` (predicted next position). Two signal flashes — one green (actual), one gold (predicted). The gold line is dashed differently: shorter dashes, slightly transparent, pulsing. The visual language immediately communicates "this is a guess."

Tick 3: Relay forwards both signals. Striker-A receives the prediction and begins moving toward F6 — one tick BEFORE the actual signal arrives.

Tick 4: Enemy-1 is at F6. Prediction correct. Striker-A is adjacent. Elimination. Total latency from first detection to kill: 3 ticks instead of the usual 5. The throughput gain: 40%.

A gold starburst effect overlays the kill — the game's way of marking a "speculative kill," a target eliminated using predictive positioning. The kill feed shows: `T4: ⚔ STRIKER-A → ENEMY-1 [F6] ★PREDICTED★`

Tick 8: Scout-A spots Enemy-3 at H4, moving... south? The terrain should funnel it west. Scout fires prediction: `predict-net: H3`. But Enemy-3 is an enemy specialist — it has an `evade` skill. At tick 9, it's at G5, not H3. Prediction wrong.

Striker-B moved toward H3. Wrong position. The gold signal line turns from gold to dull grey — the visual mark of a failed prediction. Striker-B must redirect. Cost: 2 wasted ticks.

Tick 11: Striker-B finally reaches G5 and eliminates Enemy-3. Total latency: 5 ticks — same as a non-speculative pipeline. The prediction cost nothing in units but wasted 2 ticks. For enemies with `evade`, speculation is neutral at best.

Dr. Amara notes this in her mental model: predictions work against dumb enemies in constrained terrain, fail against smart enemies on open terrain. The optimization has a natural boundary.

**Minute 6:00 — The Final Tally**
Mission complete. TPT: 0.81. Cost: 37 minerals. Both numbers are improvements over her previous best. The speculative kills were responsible for 4 of the 12 total eliminations finishing 2 ticks faster than non-speculative. The failed predictions cost 6 wasted movement ticks total.

In the Inspector, she opens the "prediction accuracy" breakdown (a sub-section of the TPT histogram). 8/12 predictions correct (66%). The 4 failures were all against enemies with `evade` or on open terrain. She sees the pattern immediately: add a rule to the scout — "IF enemy has been tagged as EVASIVE (observed non-linear movement), THEN suppress prediction signal." This would prevent bad predictions at the cost of slightly lower throughput against predictable enemies.

She jots the rule change on paper, closes the Inspector, and opens the plan screen. Iteration 47 begins.

**Minute 8:00 — Resolution**
Dr. Amara has discovered the key insight of speculative execution: **the value of prediction depends on the predictability of the target.** Against stupid enemies on narrow terrain, prediction is nearly free throughput. Against smart enemies on open terrain, it's a trap. The optimal architecture is conditional — speculate on easy targets, play it safe on hard ones. This mirrors real ML deployment: use the fast model for easy inputs, fall back to the expensive model for hard ones.

**UI Annotations:**
- **Prediction signal visual:** Gold dashed line, shorter dashes than normal signal lines, 70% opacity, gentle pulse animation (expand/contract over 500ms). Clearly distinct from green actual-signal lines.
- **Speculative kill marker:** Gold starburst overlay on the kill tile, 300ms duration. Kill feed entry includes `★PREDICTED★` suffix in gold text.
- **Failed prediction visual:** Gold signal line fades to grey. A subtle "miss" indicator: a grey X appears at the predicted tile that the enemy didn't occupy. Visible for 2 ticks, then fades.
- **Prediction accuracy panel (Inspector):** Pie chart, gold/grey sectors, showing correct/incorrect prediction ratio. Below it, a per-enemy breakdown: "Enemy-1: predicted correct (constrained terrain), Enemy-3: predicted wrong (evade skill)."

---

## Interaction Effects

- **×Context window sizing (2.02, 2.03).** Pipelined architectures consume more context per unit because signals arrive faster. A relay in a pipeline receives a new signal every 1-2 ticks; in a sequential architecture, every 4-5 ticks. The context window size directly determines how deep a pipeline the relay can sustain before stalling. A 12-slot relay can handle a 3-stage pipeline; a 6-slot scout cannot be a relay.
- **×EM emissions (locked).** Deeper pipelines are louder. A 3-stage pipeline with 2 relays emits twice as much EM noise as a 1-relay architecture. The enemy can detect and target the noisiest part of the pipeline — typically the relay chain. Stealth and throughput are fundamentally at odds.
- **×Spatial routing (2.14).** Range-limited channels make pipelining harder. If a relay can only reach units within 7 tiles, the pipeline stages must be geographically close. A pipeline that spans the entire 8x8 board needs relay chains, adding latency and cost. The spatial constraint creates a tradeoff: clustered pipelines are fast but vulnerable to area attacks; spread pipelines are resilient but slow.
- **×One-shot-one-kill (locked).** The stakes of pipeline failure are extreme. A stalled pipeline doesn't just lose throughput — it loses units. An idle striker that missed its orders because the relay overloaded is standing still on the battlefield, one tile from an enemy that nobody warned it about. Pipeline stalls are lethal.
- **×Tagging (locked).** Tags could prevent collision stalls. If Striker-A tags Enemy-1 as "claimed," Striker-B's rules can skip that target and move to Enemy-2. Tagging as deconfliction primitive. Without tags, two strikers might converge on the same enemy, wasting one striker's tick.
- **×Inspector decision trace (locked).** Pipeline debugging requires multi-hop trace-back. The Inspector must support "follow this signal backward through the pipeline" — click the striker's action, see which relay forwarded the order, see which scout originated the detection. Each hop is one click backward through the causal chain.
- **×Opus Magnum histograms (1.03).** The TPT metric creates a second histogram axis alongside cost. Opus Magnum has cycles/cost/area. Robot Uprising has ticks/cost/TPT. The three-axis histogram space means no single "best" solution — only Pareto-optimal tradeoffs.
- **×Sealed watch drama.** Pipelined architectures are more visually dynamic during sealed watch. Multiple signal lines firing simultaneously, strikers moving in different directions, relays processing overlapping signals — the board is alive with activity. Sequential architectures are calmer but less dramatic. Pipeline architectures make better TikTok clips.
- **×Campaign progression (locked).** Missions 5-6 are completable with Model A. Missions 7-8 push toward Model B/C. Mission 9-10 reward Model D/E. The pipeline complexity tracks the campaign's difficulty curve.

---

## Comparable Games

### Opus Magnum — The Direct Ancestor

Opus Magnum's optimization space is defined by three axes: cycles (speed), cost (arms used), area (board space consumed). The pipeline-vs-sequential tradeoff is the cycles axis. A sequential solution uses one arm to do everything — cheap, small, slow. A pipelined solution uses multiple arms, each handling one step, overlapping their work — expensive, large, fast.

**What translates directly:** The feeling of watching a machine you designed hum along, every part busy, no wasted motion. The satisfaction of seeing your throughput number jump when you add a second striker. The histogram comparison that reveals your pipeline is fast but expensive.

**What doesn't translate:** Opus Magnum's pipeline is spatial — arms physically overlap their reach zones. Robot Uprising's pipeline is temporal — signals overlap in the tick timeline. Opus Magnum lets you see the entire machine at once; Robot Uprising requires the Inspector to see the full pipeline state. The sealed watch shows the EFFECT of the pipeline (multiple kills), not the pipeline itself (signal routing).

### Factorio — The Throughput Obsession

Factorio players optimize throughput per second of every belt, inserter, and assembler. The key insight: identify the bottleneck, upgrade only that stage. A copper wire assembler running at 2x speed feeding a green circuit assembler running at 1x speed — the circuit assembler is the bottleneck. Adding a second circuit assembler doubles throughput. Adding a second wire assembler does nothing.

**What translates:** The bottleneck identification skill. In Robot Uprising, if the striker kill stage takes 3 ticks and the scout detection stage takes 1 tick, adding more scouts doesn't help. Adding more strikers does. Same principle, different domain.

### CPU Pipeline Architecture — The Real-World Parallel

The game's pipeline vocabulary maps directly to CPU design concepts: instruction fetch → decode → execute → write-back. Pipeline hazards (data hazards, control hazards, structural hazards) map to context stalls, target stalls, and resource stalls. Speculative execution (Model D) IS branch prediction. The flush penalty of a mispredicted branch IS the wasted-movement penalty of a wrong prediction.

This mapping is not accidental — it's the educational payload. A player who masters Model D in Robot Uprising has an intuitive understanding of why Intel CPUs predict branches and what happens when they predict wrong.

---

## Sensory Description

**The sound of a healthy pipeline:** A steady rhythmic pulse. Each tick, a soft percussive hit — like a metronome. Signal transmissions add melodic tones: a rising chime for scout→relay, a descending tone for relay→striker. When the pipeline is flowing, these tones overlap into a chord that repeats every 2-3 ticks. The rhythm is steady. The player hears the pipeline working even without watching the screen.

**The sound of a stalling pipeline:** The rhythm breaks. A relay overloading produces a rising whine — a capacitor charging. The chime-chord staggers — one note missing, then two. When the relay stun-locks, a harsh electronic buzz replaces the chime. Silence from the downstream striker. The absence of the kill percussion is the loudest indicator: something upstream broke.

**The visual signature of a pipelined vs. sequential architecture during sealed watch:** Sequential: signal lines light up one at a time, in sequence, like dominos. Pipeline: multiple signal lines active simultaneously, a web of green dashes pulsing in overlapping patterns. The board looks like a circuit board — signals flowing in multiple directions, relays blinking as they process, strikers converging from different angles. The visual density IS the pipeline. A novice's board has one signal line at a time. A veteran's board has five.

**The color of throughput:** The TPT histogram bar shifts color like the context bars: red (0.0-0.2), amber (0.2-0.5), green (0.5-0.8), gold with a subtle shimmer (0.8+). The gold shimmer is reserved for truly pipelined solutions — a visual trophy for solving the throughput puzzle.

**The TikTok clip:** A split screen. Left: a novice's Mission 8 sealed watch. One signal line, one striker moving, one kill every 5 ticks. Quiet. Calm. Right: a veteran's same mission. Five simultaneous signal lines, two strikers moving in opposite directions, kills overlapping with gold starburst effects, the audio chord humming with activity. Kill feed scrolling. TPT histogram comparison at the end: 0.18 vs. 0.81. Caption: "Same mission. Different pipeline."

---

## Design Risks and Mitigations

**Risk: Pipeline pressure becomes the only optimization axis.** If TPT is prominently displayed and compared, players might over-optimize for throughput at the cost of robustness. A 0.9 TPT pipeline that collapses when one relay dies is worse than a 0.4 TPT sequential architecture that gracefully degrades.

**Mitigation:** The histogram should show MULTIPLE axes: TPT, cost, losses, and a new metric — **resilience** (how much throughput degrades when one unit is eliminated). A fragile pipeline with high TPT but low resilience sits in a different quadrant than a robust sequential architecture with low TPT but high resilience.

**Risk: Beginners feel Model A is "wrong."** If the game celebrates high TPT numbers and pipeline architectures, players who prefer simple sequential solutions feel like they're playing incorrectly.

**Mitigation:** Mission design. Create missions where Model A is genuinely optimal — tight maps, low resources, stealth requirements. Show histogram distributions where sequential solutions cluster near the cost-optimal end. "Cheapest solution" is its own achievement.

**Risk: Pipeline debugging is too hard for the Inspector.** A 4-stage pipeline stall requires tracing backward through 4 agents across 4 ticks. The Inspector's decision trace must support this without overwhelming the player.

**Mitigation:** The "Autopsy" debrief pattern (4.04 Model E). When a pipeline stalls and causes a loss, the Inspector's trace-back feature automatically identifies the root cause and walks the player backward through the causal chain. The player doesn't have to find the broken link — the game points them to it. Deeper investigation is available but not required.
