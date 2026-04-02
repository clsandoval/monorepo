# 2.14b — Relay Chain Latency vs. Range Tradeoff: Optimal Relay Density on an 8x8 Grid

**Aspect:** Mathematical analysis of relay configurations on an 8x8 grid. Short relay chains (low latency, limited coverage) vs. long relay chains (high latency, full coverage). Optimal relay density, coverage saturation points, and the collapse of the range dimension on small grids.

**Category:** Core Mechanic (Wave 2)
**Dependencies:** 2.14 (Spatial Routing), 2.14a (Dynamic Connectivity), 2.14c (Relay Destruction), 2.00f (No Global Coordinator), 3.03 (Skill Interactions), 3.10b (Signal Latency Legibility)

---

## The Core Mathematics

### Grid Geometry and Manhattan Distance

The 8x8 grid has 64 tiles. The maximum Manhattan distance between any two tiles is 14 (corner A1 to corner H8: |8-1| + |8-1| = 14). The average Manhattan distance between two randomly chosen tiles is approximately 5.3.

The critical parameters from the locked design:

| Unit | Transmission Range (Manhattan) | Reception Range | Buffer Slots |
|------|-------------------------------|-----------------|--------------|
| Scout | 3 tiles | 3 tiles | 6 |
| Relay | 7 tiles | 7 tiles | 12 |
| Striker | 2 tiles | 2 tiles | 8 |

A signal chain's maximum reach equals the sum of all transmission ranges in the chain. Each hop adds 1 tick of base latency. Each skill application (compress, filter, amplify) adds 1 additional tick at the processing node.

### Coverage as a Function of Relay Count

Define coverage C(n) as the fraction of tile-pairs on the 8x8 grid that can be connected by a chain of Scout (range 3) -> n Relays (range 7 each) -> Striker (range 2).

**Maximum chain reach per relay count:**

| Relays (n) | Max Reach (tiles) | Exceeds Grid Diameter? | Base Latency | With Full Processing |
|------------|-------------------|----------------------|--------------|---------------------|
| 0 | 3 + 2 = 5 | No (5 < 14) | 2 ticks | N/A |
| 1 | 3 + 7 + 2 = 12 | No (12 < 14) | 4 ticks | 5 ticks |
| 2 | 3 + 7 + 7 + 2 = 19 | Yes (19 > 14) | 6 ticks | 8 ticks |
| 3 | 3 + 7 + 7 + 7 + 2 = 26 | Yes (26 > 14) | 8 ticks | 11 ticks |

**The saturation finding:** A single relay placed at the grid center (D4 or E5) has a 7-tile Manhattan diamond that covers 100% of the 8x8 board. The relay can receive from any scout within 7 tiles (all tiles on the board from center) and transmit to any striker within 7 tiles (again, all tiles from center). Coverage saturates at n=1 for a centrally-placed relay.

But this is the best case. A relay at corner A1 covers only the tiles within Manhattan distance 7 -- roughly 28 of 64 tiles (44%). A relay at edge-center A4 covers roughly 46 tiles (72%). Placement matters enormously at n=1.

**Coverage by relay position (n=1):**

| Relay Position | Tiles in Range | Board Coverage | Scout Can Reach? | Striker Can Reach? |
|---------------|---------------|----------------|-----------------|-------------------|
| D4 (center) | 64 | 100% | Yes (all scouts within 7) | Yes (all strikers within 7) |
| D1 (edge) | ~42 | 66% | Scouts in south half only | Strikers in south half only |
| A1 (corner) | ~28 | 44% | Scouts in SW quadrant | Strikers in SW quadrant |
| C3 (off-center) | ~58 | 91% | Most scouts | Most strikers |

**The placement sensitivity theorem:** On an 8x8 grid with a single relay, moving the relay one tile from center reduces worst-case coverage by approximately 8-12%. Moving it two tiles reduces coverage by 15-25%. The single-relay architecture is not just a coverage question -- it is a placement precision question.

### The Latency Budget Framework

Rather than thinking in relay counts, the player should think in terms of a **latency budget**: the maximum acceptable signal age when it reaches the striker.

Define signal age A as the number of ticks between scout detection and striker awareness:

```
A = 1 (scout-to-first-hop) + sum(1 per relay hop) + sum(1 per skill applied) + 1 (final-hop-to-striker)
```

Simplified: A = 2 + n + p, where n = relay count and p = total processing ticks across all relays.

**What signal age means in gameplay terms:**

| Signal Age | Meaning | Enemy Movement at Speed 1 | Practical Impact |
|-----------|---------|--------------------------|------------------|
| 2 ticks | Direct (no relay) | Enemy moved 2 tiles | Striker engages adjacent tile |
| 4 ticks | 1 relay, no processing | Enemy moved 4 tiles | Striker engages within 1-2 tiles |
| 5 ticks | 1 relay + compress | Enemy moved 5 tiles | Striker must predict direction |
| 6 ticks | 2 relays, no processing | Enemy moved 6 tiles | Interception requires 2 ticks of movement |
| 8 ticks | 2 relays + 2x processing | Enemy moved 8 tiles | Information may be fully stale on 8x8 grid |

**The staleness threshold:** On an 8x8 grid, an enemy moving at speed 1 traverses the entire board diagonal in 14 ticks. A signal age of 8 ticks means the enemy has potentially moved more than half the board since detection. At signal age 10+, the information is almost certainly stale -- the enemy is no longer where the scout saw it.

This creates a hard ceiling on useful chain length: **any chain producing signal age > 8 is delivering expired intelligence on an 8x8 grid against speed-1 enemies.** Against faster enemies (speed 2), the ceiling drops to signal age 4-5.

### The Real Tradeoff Space

Because coverage saturates at n=1, the traditional "latency vs. range" framing collapses on an 8x8 grid. The actual tradeoff the player navigates is three-dimensional:

**Dimension 1: Latency vs. Processing Quality**
Each relay in the chain can apply one skill per tick. More relays = more processing stages = cleaner data at the striker. A 2-relay chain with compress-then-filter delivers pristine intelligence but 6+ ticks late. A 0-relay direct link delivers noisy, uncompressed data in 2 ticks.

**Dimension 2: Latency vs. Resilience**
Each additional relay provides a potential alternate routing path. If Relay-A at D4 dies, Relay-B at F6 may still cover the same scouts and strikers. Redundancy costs latency (if signals must traverse both) or minerals (if both are independent parallel paths).

**Dimension 3: Latency vs. Emissions Footprint**
Each relay hop produces EM emissions at the relay's position. A 3-relay chain creates 3 emission points that the enemy can triangulate. A 1-relay chain has one emission point. A direct link has zero relay emissions (but the scout and striker still emit). The emissions footprint scales linearly with chain length.

### Optimal Relay Density

Given the grid size and the parameters above, the mathematical optimum depends on the enemy profile:

**Against slow enemies (speed 1, passive targeting):**
- 1 central relay, compress active. Signal age: 5 ticks. Full coverage. Minimal emissions. Optimal.
- Adding a 2nd relay for resilience is justified only if the mission includes relay-targeting enemies.

**Against fast enemies (speed 2, aggressive flanking):**
- Direct scout-to-striker links for emergency data (signal age 2). 1 relay for processed data (signal age 5). Dual-path architecture.
- 2 relays only if one is a backup (not in series).

**Against relay-hunting enemies (any speed, EM-targeting):**
- 2 relays minimum (redundant mesh). Decoy relay with amplify to draw fire. Real relay with filter to minimize EM.
- 3 relays justified for triple redundancy in long missions.

**The density formula:** For an 8x8 grid, optimal relay count R is:

```
R = 1 (base coverage) + D (redundancy against relay-targeting, 0 or 1) + P (processing stages needed, 0-2)
```

Where D = 1 if the mission includes relay-targeting enemies, and P = number of processing stages required to prevent striker buffer overflow. In practice, R ranges from 1 to 3. R=4+ is never optimal on an 8x8 grid -- the latency cost exceeds the processing benefit.

---

## Player Journeys

### Journey 1: Lena, 24, Applied Math student, first campaign playthrough

**Context:** Mission 5. Lena just unlocked the factory system. She has a notebook open next to her laptop where she's been sketching signal chain diagrams. She saw the relay's 7-tile range in the unit codex and immediately calculated that a center-placed relay covers the entire board. She thinks this is solved.

**Minute 0:00 -- The Elegant Solution**

Lena opens the Plan screen. The 8x8 grid glows with terrain hexes. She places one relay blueprint at D4. She hovers over it -- the cyan Manhattan diamond fills the entire board. Every tile is covered. She writes in her notebook: "n=1, center placement, C=100%, A=5 ticks with compress. Done."

Her production queue: Scout, Scout, Relay, Striker, Striker. She wires scout broadcasts on `raw` to the relay, relay compresses and forwards on `intel`, strikers listen on `intel`. Clean star topology.

She hits EXECUTE.

**Minute 0:20 -- The Sealed Watch**

The tick clock begins. Units spawn in sequence. By tick 5, the relay is online at D4. The cyan range diamond pulses once -- its activation wave. Signal lines connect scouts to relay, relay to strikers. The relay's antenna rotates slowly, a steady cyan glow at its base.

Tick 8: A scout at B6 spots an enemy entering from the east edge. Green flash -- signal fires on `raw`. A dashed cyan line snaps from scout to relay, pulsing once. Tick 9: the relay's buffer bar gains a pip. The compress gear icon spins above the relay sprite for half a second. Tick 10: the relay fires on `intel`. Another dashed line, relay to striker at F3. Tick 11: the striker's buffer updates. The striker pivots east and begins moving to intercept.

Lena counts on her fingers. "Scout detected at tick 8, striker aware at tick 11. Three ticks of latency after detection. Signal age is... 2 base + 1 relay hop + 1 compress = 4 ticks total from the event happening to the striker knowing." She pauses. "Wait, the enemy moved 3 tiles in that time." She watches the striker engage -- but the enemy is one tile north of where the scout reported. The striker adjusts, loses a tick, and engages at tick 13.

**Minute 0:45 -- The Buffer Problem**

By tick 20, all three scouts are reporting through the single relay. The relay's buffer bar is climbing: 4 pips, 6 pips, 8 pips out of 12. Each scout sends 1-2 signals per tick cycle. The relay compresses 3 signals into 1, but the input rate exceeds the processing rate.

Tick 24: the relay's buffer hits 11/12. The bar turns amber. Tick 25: 12/12. The bar pulses red. The relay cannot accept new signals -- its buffer is full. A scout fires on `raw`, the dashed line appears, but the relay sprite flashes a small red X above its antenna. Signal dropped.

Lena stares. "Buffer overflow. I have three scouts feeding one relay and it can't keep up." She scribbles furiously: "Throughput bottleneck. 3 inputs/cycle, 1 compress output/cycle. Need eviction policy or second relay to split the load."

**Minute 1:10 -- The Throughput Insight**

The battle continues with degraded performance. Signals drop intermittently. The strikers act on incomplete data -- they engage some threats and miss others. Lena's army wins, but barely, with one striker destroyed by an enemy that was never reported (its signal was dropped at the relay).

In the debrief, Lena opens the relay's buffer timeline. She sees the throughput chart: input rate 2.4 signals/tick, output rate 1.0 signals/tick (limited by compress processing time). The buffer filled at tick 24 and stayed saturated until tick 35 when a scout was destroyed (reducing input rate).

She writes in her notebook: "The relay density question isn't about coverage. It's about THROUGHPUT. One relay covers the board but can't process all the data. Two relays split the load: east scouts feed Relay-A, west scouts feed Relay-B. Each relay processes 1-2 signals/tick instead of 3. No overflow."

She redesigns: two relays at C3 and F5, each serving a hemisphere of scouts. Coverage: still 100% (both relay diamonds span most of the board). Throughput: doubled. Latency: unchanged (still 1 relay hop per path). Cost: 5 more minerals.

**What Lena discovered:** The n=1 relay is a coverage optimum but a throughput bottleneck. The reason to add relays on an 8x8 grid is not range but bandwidth. This is the mathematical insight the game teaches: coverage and throughput are different axes, and the grid is small enough that throughput saturates before coverage does.

---

### Journey 2: Davi, 31, Screeps veteran, competitive mindset

**Context:** Mission 8. Factory vs. factory. Davi has been optimizing relay architectures since Mission 5. He streams his games and his chat has been debating whether a 2-relay or 3-relay chain is optimal. Davi wants to settle it with hard data.

**Minute 0:00 -- The Experiment**

Davi sets up two identical flanks. Left flank: Scout -> Relay-A (compress) -> Striker. Right flank: Scout -> Relay-B (compress) -> Relay-C (filter) -> Striker. Same scouts, same strikers, same enemy pressure. The only variable is chain length.

Left flank signal age: 2 + 1 + 1 = 4 ticks. Right flank signal age: 2 + 2 + 2 = 6 ticks (two relay hops + compress + filter).

He labels them on stream: "FAST LANE" and "CLEAN LANE."

His production queue is heavy: Scout, Scout, Relay, Relay, Relay, Striker, Striker, Striker. 15 minerals on relays. His chat spams "mineral diff" -- he's spending more on infrastructure than combat.

**Minute 0:30 -- Execution Begins**

EXECUTE. Both flanks spin up simultaneously. Left flank fires first -- Scout-L detects an enemy at tick 9, Relay-A compresses and forwards, Striker-L receives at tick 13, engages at tick 14. Four ticks detection-to-engagement. The enemy is one tile from where it was detected. Clean kill.

Right flank: Scout-R detects a different enemy at tick 9. Signal reaches Relay-B at tick 10. Relay-B compresses (tick 11). Signal reaches Relay-C at tick 12. Relay-C filters (tick 13). Signal reaches Striker-R at tick 14. Striker-R engages at tick 15. The enemy has moved two tiles since detection. Striker-R must spend an extra tick closing distance. Engagement at tick 16.

Davi narrates: "Left flank: 5 ticks total. Right flank: 7 ticks. Two extra ticks for the filter step. But look at the buffer state."

He toggles the buffer overlay. Striker-L's buffer: 6/8 slots filled, 2 of them noise (uncompressed fragments that passed through only compress, not filter). Striker-R's buffer: 4/8 slots filled, 0 noise entries. The filter relay stripped the irrelevant signals before they reached the striker.

**Minute 1:15 -- The Stress Test**

Tick 25: the enemy factory ramps up. Three enemies approach the left flank simultaneously. Scout-L fires three signals in rapid succession. Relay-A compresses them but can only output one compressed signal per tick. Striker-L receives them sequentially -- by the time it gets signal 3, the first enemy has already moved. Striker-L engages enemy 1, but enemies 2 and 3 flank it. Striker-L is destroyed.

Right flank faces the same pressure at tick 27. Three enemies. Scout-R fires three signals. Relay-B compresses. Relay-C filters -- and this is where the magic happens. The filter relay examines the three compressed signals, identifies that two reference the same enemy cluster (redundant), and drops one. Only two signals reach Striker-R instead of three. Striker-R's buffer isn't overwhelmed. It processes both, identifies the cluster, and engages methodically. Striker-R survives.

Davi's chat goes silent for a moment. Then: "CLEAN LANE WON." "2-relay meta confirmed." "THROUGHPUT NOT LATENCY."

**Minute 2:00 -- The Debrief Comparison**

Davi opens the Inspector side-by-side. Left flank stats: 14 signals delivered, 3 noise signals, 1 buffer overflow event, 1 striker lost. Right flank stats: 11 signals delivered, 0 noise signals, 0 overflow events, 0 units lost. The 2-relay chain delivered fewer signals but every signal was actionable. The 1-relay chain delivered more signals but some were junk.

He calculates on stream: "Signal quality = actionable signals / total signals. Left flank: 11/14 = 78%. Right flank: 11/11 = 100%. The filter relay achieved 100% signal quality at the cost of 2 extra ticks of latency."

He then calculates the latency-adjusted value: "Against speed-1 enemies on an 8x8 grid, the 2-tick latency penalty costs about 1 tile of positional accuracy. But the 22% noise reduction saves buffer space that prevents overflow-induced paralysis. Net value: positive for 2-relay, negative for 3-relay (where the latency penalty exceeds the quality gain)."

**What Davi proved on stream:** The optimal chain length is context-dependent. Against low enemy counts, the 1-relay chain wins on speed. Against high enemy counts, the 2-relay chain wins on signal quality. The 3-relay chain is never optimal on an 8x8 grid because the latency penalty (8+ ticks) makes all intelligence stale before arrival. The community names this "Davi's Law": on an 8x8 grid, never exceed 2 relays in series.

---

### Journey 3: Rena, 46, Into the Breach completionist, playing with her partner Jun

**Context:** Mission 7. Rena and Jun take turns designing architectures and watching the sealed execution. They've developed a ritual: Rena handles relay placement, Jun handles scout patrol routes, and they argue about everything in between. Tonight they're testing whether to invest in a second relay or a third striker.

**Minute 0:00 -- The Argument**

The Plan screen is open. Rena has placed one relay at E4 with compress. Jun has drawn two scout patrol routes -- a north arc and a south arc. Two strikers listen on `intel`. The architecture works but they lost last mission when the relay died.

Rena: "We need a second relay. Put it at C6 so if E4 dies, C6 covers the west half."

Jun: "A second relay is 5 minerals. That's a whole striker. If we have three strikers instead of two, we kill threats before they reach the relay. Defense by offense."

Rena: "And if one striker dies? Two strikers against three enemies from different angles. We saw what happens."

Jun: "If one relay dies with your plan? The second relay is at C6 -- that's 4 tiles from E4. It covers different tiles. The east flank scouts might be out of range of C6."

This stops them both. Rena pulls up the range overlay. She places the cursor on C6. The cyan diamond appears. She traces its edge -- it reaches G6 to the east (Manhattan distance 4 from C6) but not H-anything. A scout at H3 is 7 tiles from C6 -- exactly at the edge of range. Any movement east pushes the scout out of range.

"You're right. C6 doesn't fully cover the east. I need to put the backup at F6 instead."

She moves the relay ghost to F6. Now the east scout at H3 is 4 tiles from F6 -- comfortably in range. But the west scout at B2 is 6 tiles from F6 -- still in range but barely. If the west scout patrols to A1, it's 7 tiles from F6 -- edge of range, likely to drop out during patrol.

**Minute 0:45 -- The Compromise**

Jun suggests: "What if the backup relay isn't a backup? Put it at B4. West scouts feed B4, east scouts feed F5. Each relay serves half the board. If one dies, the other still serves its half. We lose coverage on the dead relay's side but keep the other side operational."

Rena draws it out. Two relays, split coverage. Each relay processes half the scout traffic (throughput advantage). If one dies, half the board goes dark (partial degradation instead of total collapse). Latency stays at 4-5 ticks per path.

They compare the three options:

```
Option A: 1 relay (E4) + 3 strikers
  Coverage: 100%. Throughput: bottlenecked. Resilience: total collapse on relay death.
  Cost: 5m relay + 24m strikers = 29m

Option B: 2 relays (E4 + F6, redundant) + 2 strikers  
  Coverage: 100%. Throughput: shared. Resilience: full coverage survives 1 relay death.
  Cost: 10m relays + 16m strikers = 26m

Option C: 2 relays (B4 + F5, split) + 2 strikers
  Coverage: 100% (split). Throughput: optimal (halved per relay). Resilience: 50% coverage survives.
  Cost: 10m relays + 16m strikers = 26m
```

Jun argues for Option A (more combat power). Rena argues for Option C (throughput + partial resilience). They compromise on Option B -- full redundancy -- because "we'd rather lose a striker than lose the network."

**Minute 1:30 -- The Sealed Watch**

EXECUTE. Both relays deploy. Signal chains illuminate the board with two overlapping sets of dashed cyan lines -- one set from E4, one from F6. The overlapping coverage creates a brighter zone in the center where both relays can reach the same units.

Tick 14: an enemy flanks south and reaches E4. Relay-E4 dies in a burst of sparks. The signal lines from E4 fade to grey and dissolve. Jun flinches. But the lines from F6 remain bright. The strikers' buffer bars flicker -- one tick of reduced input -- then stabilize. Signals flow through F6. The army keeps fighting.

Rena squeezes Jun's arm. "See? The backup."

Tick 22: a second enemy approaches F6. Jun's eyes widen. Both relays down would mean total darkness. But Striker-A, now repositioned after engaging the first enemy, intercepts the second enemy two tiles from F6. One-shot kill. F6 survives.

Victory at tick 34.

**Minute 2:30 -- The Debrief Conversation**

They scrub the Inspector together. At the relay-death tick, Rena points at the connectivity timeline: green bar until tick 14, then amber (degraded -- one relay down, one surviving). Never red (total collapse). Jun points at the combat timeline: Striker-A engaged 4 enemies, Striker-B engaged 2. "With three strikers and one relay, we might have killed enemies faster but lost the whole network at tick 14."

Jun concedes: "Two relays. I get it now. It's not about the range -- the range was always fine. It's about not dying when one breaks."

They save the 2-relay redundant template as their default architecture for future missions.

**What Rena and Jun discovered together:** The relay density decision is fundamentally about risk tolerance, not coverage geometry. On an 8x8 grid, one relay covers everything. Two relays cover everything with a safety net. The mineral cost of the second relay (5m) is almost always cheaper than the cost of total network collapse (mission failure). The social experience of arguing through the tradeoff, testing it, and watching the backup save them created a shared "aha" moment that neither would have reached alone.

---

## Strengths and Weaknesses of Different Relay Densities

### 0 Relays (Direct Links Only)

**Strengths:** Fastest possible signal age (2 ticks). Zero relay maintenance cost. Zero emissions from relay infrastructure. No single point of failure in the relay layer.

**Weaknesses:** Scout range 3 + striker range 2 = 5 tiles maximum reach. On an 8x8 grid, this covers 14% of possible scout-striker pairs. Scouts and strikers must be clustered within 5 tiles of each other, eliminating wide reconnaissance. No signal processing -- strikers receive raw, noisy data that fills their 8-slot buffers rapidly. Practical only for very tight formations in early missions.

### 1 Relay (Star Topology)

**Strengths:** Full board coverage from center placement. Simple to configure. Minimal mineral cost (5m). Single processing node for compress/filter/amplify. Low emissions footprint (one point source). Easy to bodyguard (one tile to defend).

**Weaknesses:** Throughput bottleneck with 3+ scouts reporting simultaneously. Total network collapse on relay destruction. 12-slot buffer fills under sustained scout reporting. Single point of failure for the entire information architecture. Processing limited to one skill per tick -- compress OR filter, not both simultaneously (unless the relay alternates between them, costing additional ticks).

### 2 Relays (Redundant or Split)

**Strengths:** Survives single relay destruction (redundant mode). Doubles throughput (split mode). Enables 2-stage processing (compress at Relay-A, filter at Relay-B in series) or parallel processing (both compress independently in parallel). Moderate emissions footprint. The sweet spot for 8x8 grid play.

**Weaknesses:** 10 minerals committed to infrastructure. Two tiles occupied. Two emission points for enemy triangulation. In series mode, signal age rises to 6-8 ticks (approaching staleness threshold). In parallel mode, strikers may receive duplicate signals from both relays (buffer waste). Requires more sophisticated channel wiring to prevent signal duplication.

### 3+ Relays (Deep Chain or Mesh)

**Strengths:** Maximum processing depth (3-stage pipeline: compress -> filter -> amplify). Triple redundancy in mesh configuration. Can create isolated network segments for operational security (east relay handles east scouts only, no cross-contamination).

**Weaknesses:** Signal age of 8-11 ticks -- effectively stale on arrival against speed-1 enemies. 15+ minerals on infrastructure, severely limiting combat unit count. Three emission points create a readable pattern that reveals the network's spine to enemy triangulation. Throughput gains are marginal past 2 relays (diminishing returns on splitting scout assignments). Complexity of channel wiring increases combinatorially. Almost never optimal on an 8x8 grid except in specialized scenarios (very long missions with slow enemies and high scout density).

---

## Interaction Effects

### With Production Economy (2.17 -- Fabrication as Tactical Resource)

Every relay costs 5 minerals from a fixed per-mission budget. The relay density decision directly competes with combat unit production. A player choosing 2 relays over 1 is choosing network resilience over one additional striker (8m) or scout (3m). The economic pressure creates a natural ceiling on relay investment: spending more than 30% of the mineral budget on relays usually means insufficient combat power to survive the mission regardless of network quality.

The production queue also imposes ordering constraints. Relays that deploy early establish the network backbone but delay combat unit production. Relays queued late arrive after the first enemy waves, leaving a window where the network is incomplete. The queue position of relays is itself a latency decision -- not signal latency but deployment latency.

### With Enemy Tactics (AI Adversary Configurations)

Enemy profiles radically shift optimal relay density:

- **Passive enemies** (patrol only, no relay targeting): n=1 is optimal. No need for redundancy.
- **Aggressive flankers** (speed 2, multi-axis approach): n=1 with dual-path architecture (direct fast lane + relay slow lane). The fast lane handles emergencies, the relay handles processed intelligence.
- **Relay hunters** (EM-targeting, dedicated anti-infrastructure units): n=2 minimum (redundant mesh). Decoy relay absorbs the first strike.
- **Swarm enemies** (many weak units, high scout report volume): n=2 in split configuration for throughput. Buffer overflow is the primary threat, not relay destruction.

The player learns to read the mission briefing and enemy profile as a relay density prescription. "Relay-targeting enemies detected" means "build a backup relay." "High unit density expected" means "split your relay load."

### With Buffer Management (2.03 -- Buffer Models)

Relay chain length directly affects buffer pressure at every node in the chain. A 2-relay series chain means three buffers in sequence (Relay-A buffer -> Relay-B buffer -> Striker buffer). If Relay-A's compress reduces 3 signals to 1, Relay-B's filter may further reduce to 0.5 effective signals (dropping irrelevant data). The striker receives clean, sparse data that fits comfortably in its 8-slot buffer.

But if the chain is too short (n=0, direct), the striker receives raw scout data at full volume. Three scouts reporting 2 signals each per tick cycle = 6 signals per cycle. The striker's 8-slot buffer fills in 1.3 cycles. Without relay processing, buffer overflow and eviction become the dominant problem.

This creates a minimum relay count based on scout density, independent of coverage or resilience:

```
Minimum relays for buffer health = ceil(scout_count * signals_per_scout / relay_compress_ratio / striker_buffer_size)
```

For 3 scouts at 2 signals/tick, compress ratio 3:1, striker buffer 8: min relays = ceil(6 / 3 / 8) = 1. For 5 scouts: ceil(10 / 3 / 8) = 1. For 8 scouts: ceil(16 / 3 / 8) = 1. The 3:1 compress ratio is powerful enough that even 8 scouts can funnel through one relay without overflowing a striker buffer -- but barely. In practice, signal bursts (multiple scouts detecting simultaneously) create momentary spikes that overflow the relay's own 12-slot buffer before compress can process them.

### With Dynamic Connectivity (2.14a)

Mobile scouts on patrol paths drift in and out of relay range. A scout at the far end of its patrol may exit the relay's 7-tile diamond for 2-3 ticks per cycle. During those dark ticks, no signals flow from that scout. If the relay density is n=1, the dark-tick problem is manageable (the relay's central position minimizes dark windows). With n=2 in split configuration, each relay covers a hemisphere -- scouts patrolling near the boundary between hemispheres may oscillate between relays, creating handoff gaps.

The interaction is subtle: relay density affects the spatial rhythm of connectivity. More relays = more coverage overlap = fewer dark ticks = smoother information flow. But more relays also = more configuration complexity (which scout reports to which relay?) and more latency if the architecture routes signals through multiple relays in series.

---

## Comparable Games

### Screeps -- CPU Budget as Bandwidth Analog

In Screeps, players write JavaScript that runs on each game tick. Every operation costs CPU. Creeps communicating through Memory objects cost CPU proportional to the data written and read. Players who over-architect their communication (writing detailed reports to Memory every tick) hit CPU caps. The solution: compress reports, filter irrelevant data, aggregate before writing.

This maps directly to Robot Uprising's relay throughput problem. Screeps players learn that communication bandwidth is finite and processing (aggregation, filtering) is worth the CPU cost because it prevents the downstream consumer from being overwhelmed. The relay is Robot Uprising's version of Screeps' CPU-conscious communication manager.

The key difference: Screeps' CPU cost is invisible (a number in a dashboard). Robot Uprising's relay processing is visible (the compress gear animation, the filter pulse, the buffer bar climbing). The game externalizes what Screeps keeps abstract.

### Factorio -- Logistics Network Throughput

Factorio's logistics bots carry items between chests. A logistics network with one roboport handles a limited number of bot flights per tick. Adding roboports increases throughput (more bots, more parallel flights). The parallel to relay density is direct: one roboport = one relay, limited throughput. Two roboports = doubled capacity.

Factorio players discover the throughput ceiling when their factory grows beyond one roboport's capacity -- items pile up in provider chests, bots queue for flight slots, and production stalls. Robot Uprising players discover the same ceiling when scout reports pile up in relay buffers and signals start dropping.

Factorio's solution (add more roboports) maps to Robot Uprising's solution (add more relays in parallel). But Factorio's roboports have no latency cost -- bots just fly faster with more roboports. Robot Uprising's relays in series add latency. This distinction is what makes Robot Uprising's relay density a genuine tradeoff rather than a pure scaling problem.

### StarCraft -- Sensor Towers and Information Economy

StarCraft's Terran sensor towers provide vision in a radius around the tower. One tower covers a region; multiple towers provide overlapping coverage. The parallel to relay placement is spatial: a sensor tower at the wrong position reveals useless terrain. A relay at the wrong position covers tiles no scouts or strikers occupy.

But StarCraft's sensor towers have zero latency -- information is instant. Robot Uprising's relays introduce latency proportional to chain depth. This transforms the relay from a passive sensor (StarCraft) into an active processing node (Robot Uprising). The player isn't just deciding where to see -- they're deciding how deeply to process what they see, at what time cost.

### Pandemic -- Infection Chain Length

Pandemic's disease spreads through chains of connected cities. Longer chains (more infected cities in sequence) spread the disease farther but take more turns. Players curing disease must decide whether to treat nearby cities (short chain, immediate impact) or travel to distant outbreak sources (long chain, higher strategic value).

This maps to the relay chain length decision: short chains (1 relay) deliver fast, local impact. Long chains (2-3 relays) deliver processed, strategic intelligence at the cost of turns (ticks). The Pandemic player who always treats the nearest city loses to cascading outbreaks. The Robot Uprising player who always uses the shortest chain loses to buffer overflow and signal noise.

---

## Sensory Descriptions: What Relay Chains Feel Like During Sealed Watch

### The Single-Relay Heartbeat

A well-functioning 1-relay architecture has a visual rhythm. Every few ticks, a scout detects -- green flash on a tile somewhere on the board. A dashed cyan line snaps from scout to the relay at center-board. The relay's antenna pulses once (receiving). A tiny gear icon spins above the relay for half a second (compress). Then the relay fires -- another cyan line snaps from relay to a striker. The striker's buffer bar gains a pip.

This cycle repeats like a heartbeat: flash-snap-spin-snap. Flash-snap-spin-snap. The tempo matches the scout patrol rhythm. When two scouts detect simultaneously, the heartbeat doubles -- two flashes, two incoming lines, the relay's buffer bar ticking up two pips in one tick. The gear spins for two beats. Two outgoing lines fire in sequence (one per tick). The rhythm becomes syncopated.

The sound design reinforces the heartbeat. Each incoming signal is a soft electronic chirp -- high-pitched, brief. The compress processing is a brief crunching sound, like data being squeezed through a filter. The outgoing signal is a clean ping -- lower-pitched, more resonant. The full cycle sounds like: *chirp -- crunch -- ping*. With two scouts: *chirp-chirp -- crunch-crunch -- ping -- ping*. The relay is an audio node -- you can hear the network's health by listening to the rhythm. Steady rhythm = healthy. Accelerating rhythm = rising threat. Silence = the relay is dead.

### The Two-Relay Cascade

A 2-relay series chain (Scout -> Relay-A -> Relay-B -> Striker) animates as a wave. Green flash on the scout. Cyan line draws from scout to Relay-A (0.3 seconds). Relay-A's antenna pulses. Gear spins. Relay-A fires. New cyan line draws from Relay-A to Relay-B (0.3 seconds). Relay-B's antenna pulses. A different animation -- a pulsing filter icon instead of a spinning gear (filter skill instead of compress). Relay-B fires. Final cyan line to the striker.

The visual effect is a ripple across the board -- a cascade of flashes and line-draws that takes 4-6 ticks of real time. The player can literally trace the signal's journey by following the cascade. Longer chains produce longer cascades. The visual length of the cascade IS the latency -- you can see how long the information takes to travel.

The sound of a 2-relay chain is a musical phrase: *chirp -- crunch -- ping -- [beat] -- whoosh -- ping*. The "whoosh" is the filter sound -- a softer, breathy sound that suggests data being stripped down. The beat between the first relay's output and the second relay's processing is a half-second of silence -- the signal in transit. Players learn to hear the gap. A short gap means the relays are close (low inter-relay latency). A long gap means the relays are far apart on the board.

### The Redundant Mesh in Crisis

When a relay in a 2-relay redundant mesh is destroyed, the visual shift is immediate and dramatic. The destroyed relay's sprite collapses -- sparks, the antenna toppling, a red flash. Every signal line passing through that relay dissolves from the relay outward, like ink lines washing away in rain. Half the board's signal web disappears in 300 milliseconds.

But the surviving relay's lines remain. And in the next tick, those lines brighten -- subtly at first, then noticeably. The surviving relay is now handling all traffic. Its buffer bar climbs faster. Its compress gear spins more frequently. The heartbeat accelerates. The sound shifts: where there were two sources of *chirp-crunch-ping*, now there's one, and it's firing at double tempo. The pitch rises slightly -- the relay is working harder. A faint amber glow appears at the relay's base -- heat, strain, the visual equivalent of a CPU usage gauge.

The feeling is of a system under pressure but holding. The player watches the surviving relay's buffer bar anxiously -- amber at 8/12, creeping toward red. The tempo of the heartbeat indicates how close the system is to overload. If the buffer hits 12/12, the heartbeat stops. Signals drop. The surviving relay is overwhelmed.

This is the moment where relay density pays off -- or doesn't. A player who invested in 2 relays watches the system bend but not break. A player who skimped watches the system snap.

---

## Key Design Insight

The relay chain latency vs. range tradeoff is, on an 8x8 grid, a **solved problem on one axis and an open problem on two others**. Range is solved: one central relay covers everything. The open axes are throughput (how much data can the relay chain process before buffers overflow) and resilience (how many relay deaths can the network survive before total collapse). The game's depth comes from players discovering that the obvious question ("how many relays do I need for coverage?") has a trivial answer, while the real questions ("how many relays do I need for bandwidth?" and "how many relays do I need to survive?") require mission-specific analysis, enemy profiling, and iterative experimentation.

This is the mathematical beauty of the 8x8 constraint. A larger grid (16x16, 32x32) would make the range axis dominant -- players would be solving a graph-connectivity problem. The small grid collapses range into irrelevance and surfaces the deeper engineering questions that make Robot Uprising feel like distributed systems design, not tower placement.
