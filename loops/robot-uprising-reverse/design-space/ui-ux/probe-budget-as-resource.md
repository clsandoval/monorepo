# 4.107 — Probe Budget as Resource

*Design-space exploration — Robot Uprising Inspector system*

**Aspect ID:** 4.107
**Dependencies:** 4.60 (search budget), Inspector system, Probe mechanic, research tree
**Pattern name:** **Observability Tax**
**One-liner:** You can't watch everything. Choose what matters.

---

## 1. The Mechanic

### Core Concept

Probes are diagnostic hooks that capture agent internal state (context window contents, signal queue, decision weights, hook firing history) at specific ticks during Sealed Watch replays. They are the primary tool for understanding *why* an agent did what it did. But probes are expensive — they represent compute and attention, and the game makes that cost tangible.

**Probe budget** limits the number of simultaneously active probes a player can have placed during any single Inspector session. This is not per-battle — it is per *session*, meaning each time the player enters the Inspector to analyze a completed battle, they get a fixed number of probe slots.

### Exact Rules

**Slot Progression:**
- **Early game (Missions 1–8):** 2 probe slots
- **Mid game (Missions 9–18):** 4 probe slots
- **Late game (Mission 19+ or research unlock):** Unlimited slots, gated behind the "Deep Telemetry" node in the research tree

**Slot Mechanics:**
- Each active probe occupies exactly 1 slot, regardless of probe type (tick probe, conditional probe, signal-trace probe)
- Placing a probe when all slots are full requires **evicting** an existing probe — the player must explicitly choose which probe to remove
- Evicted probes lose their captured data immediately (no background caching)
- Probes can be moved to different ticks or different units freely within a slot — the slot tracks *active capture points*, not historical ones
- A probe placed on tick 14 of Unit A and then moved to tick 37 of Unit B still occupies 1 slot, but the tick-14 data is gone

**Interaction with Search Budget (4.60):**
- Search budget (4.60) governs Fix Explorer compute — QUICK vs THOROUGH analysis of what went wrong
- Probe budget governs *what you can observe* to feed into that analysis
- They are parallel but non-fungible: you cannot convert probe slots into search budget or vice versa
- However, probe data *improves Fix Explorer accuracy*. A QUICK search with 4 well-placed probes often yields better results than a THOROUGH search with 0 probes. The Fix Explorer explicitly surfaces this: "Analysis confidence: HIGH (3 probe data points in causal chain)" vs "Analysis confidence: LOW (no probe data near tick of failure)"
- Late-game research tree node "Instrumented Fix Search" allows one probe slot to be temporarily allocated as bonus search budget (and vice versa), creating a genuine tradeoff at the resource layer

**What Probes Capture:**
- Full context window snapshot at the target tick (what the agent "saw")
- Signal queue state (pending signals, priorities, dropped signals)
- Decision weight vector (which skill/rule fired and why)
- Hook channel activity (what was being transmitted to/from other units)
- Buffer utilization percentage

### Why This Exists (Design Intent)

Real observability systems (Datadog, Grafana, OpenTelemetry) have hard constraints: you cannot trace every request at full fidelity, you cannot log every variable at every moment, and adding instrumentation has performance cost. Engineers must decide *what* to monitor and at *what granularity*. This is one of the most important and least-taught skills in production systems.

The probe budget turns this into a game mechanic. With only 2 slots, the player must think: "Where did it go wrong? What's my hypothesis? Which two moments will confirm or deny it?" This is the scientific method applied to debugging — forming hypotheses, choosing observations, iterating.

---

## 2. Player Journeys

#### Journey: Mateo, 24, CS student who just finished an OS class
**Context:** Mission 5 (early game, 2 probe slots). His Striker unit ignored a flanking enemy and walked into a kill zone. He's in the Inspector trying to understand why.

**Minute 0:00 — The Replay Screen**
Mateo hits "Inspect" after watching his squad get demolished. The replay timeline loads — an 8x8 grid with ghost trails showing unit movement. His Striker's path is highlighted in pale blue, and the moment of death is marked with a red X at tick 41. The timeline bar at the bottom shows 60 ticks total. He can see two empty probe slot indicators in the top-right corner: two small diamond shapes, hollow, glowing faintly with a cool cyan outline. They pulse slowly, like they're waiting.

**Minute 0:30 — First Hypothesis**
He scrubs the timeline back to tick 30, where the Striker turned north instead of east. "Why did it turn? It should have seen the enemy at grid E4." He clicks on the Striker at tick 30 and drags a probe from the slot tray onto it. The first diamond fills with cyan light and a small "T30" label appears. The probe deploys with a soft chime — like a sonar ping — and the context window snapshot blooms open in a side panel. He can see the Striker's working memory: it contains the movement order from the Relay, a stale enemy position from tick 22, and... nothing about E4. The enemy at E4 isn't in the context window at all.

**Minute 1:15 — "But why doesn't it see E4?"**
Now he needs to know what happened at tick 28-29, when the E4 enemy should have been detected. But he only has one slot left. He could probe the Striker at tick 28, or he could probe the *Scout* unit that was supposed to be relaying enemy positions. He hovers over the Scout at tick 28 — a tooltip shows "Signal output: 3 signals transmitted this tick." That's useful. He hovers over the Striker at tick 28 — tooltip shows "Signal input: 1 signal received." Three sent, one received. Something got dropped.

He places the second probe on the Scout at tick 28. The second diamond fills. The side panel splits — now he has two probe readouts side by side. The Scout's signal queue shows it transmitted enemy positions for E4, D6, and C3 on its hook channel. All three went out. So the Scout did its job.

**Minute 2:00 — The Eviction Decision**
The problem is between the Scout's output and the Striker's input. He wants to probe the Relay unit that sits between them — but he's out of slots. He stares at the two filled diamonds. The tick-30 Striker data told him the context window was missing E4 data. That's confirmed. He doesn't need it anymore. He clicks the first probe and drags it off — it dissolves with a descending tone, the diamond going hollow again. He feels a small pang. That data is gone. But he knows what it said.

He places the freed slot on the Relay at tick 28. Now he sees it: the Relay's context window was *full*. Buffer utilization: 100%. The E4 signal arrived but was dropped because the Relay had prioritized a movement coordination signal that was marked URGENT. The E4 enemy position, marked ROUTINE, was evicted from the buffer.

**Minute 2:45 — The Fix**
He didn't need the Fix Explorer at all. Two probes (well, three placements across two slots) told the whole story. He goes back to the Plan screen and changes the Relay's signal priority rules: enemy positions within 2 tiles of any friendly unit get bumped to URGENT. He re-runs the battle.

**What Mateo learned:** Hypothesis-driven debugging. Probe placement as experiment design. The eviction mechanic forced him to think about which data he'd already extracted versus what he still needed. He used probes like breakpoints — place, read, move.

---

#### Journey: Dani, 31, SRE at a fintech company, plays strategy games
**Context:** Mission 14 (mid game, 4 probe slots). She's analyzing a battle where her formation held for 40 ticks then collapsed catastrophically in ticks 41-45. All four units died within 5 ticks. She suspects a cascade failure — one unit's death broke the signal chain for the others.

**Minute 0:00 — The Carnage Overview**
The Inspector replay shows a clean formation for 40 ticks, then chaos. Death markers at ticks 41, 42, 43, 45. Four diamonds glow in the slot tray — she's got room to work. The timeline has a "heat zone" visualization: a gradient bar beneath the timeline that shifts from cool blue (low activity) to hot orange (high activity). Ticks 40-45 are blazing orange. She hovers over the heat zone and sees a tooltip: "Signal activity spike: 340% above baseline."

**Minute 0:45 — Staking Out the Cascade**
She places all four probes at once, one on each unit, all at tick 41 — the first death. Each diamond fills with a different color matching the unit's color coding (blue, green, gold, red). Four side panels stack vertically. She's looking for which unit died first and what its death did to the others.

Unit 2 (green) is already dead at tick 41. Its context window is marked "[DESTROYED — no state]". That's the trigger. Units 1, 3, and 4 are alive but their signal queues all show "CHANNEL: relay-mesh — STATUS: DEGRADED" in amber text. Unit 2 was a Relay. When it died, the mesh lost a node, and suddenly signal routing changed.

**Minute 1:30 — Tracing Backward**
She needs to see Unit 2 before it died. But all four slots are occupied. She evicts the probes on Units 3 and 4 at tick 41 — she saw enough to know they were reacting to the mesh degradation, and the specific contents can be re-derived. Two diamonds go hollow with that descending tone. She feels the trade: she's losing the exact decision weight vectors for Units 3 and 4, but she's betting those aren't the root cause.

She places one freed probe on Unit 2 at tick 39 (two ticks before death) and another on Unit 2 at tick 40 (one tick before). Now she has: Unit 1 at tick 41, Unit 2 at tick 39, Unit 2 at tick 40, and one empty slot held in reserve.

**Minute 2:15 — The Root Cause**
Tick 39: Unit 2's context window is full but stable. It sees an enemy approaching from the south. Tick 40: Unit 2's context window has *changed its skill allocation* — it shifted from "relay-priority" mode to "self-defense" mode because the enemy was adjacent. In self-defense mode, the relay hooks stop transmitting for one tick while the unit processes combat. That one tick of silence caused Units 1, 3, and 4 to lose a critical coordination signal. Unit 3, receiving no orders, defaulted to its fallback behavior (advance), which moved it out of formation and into a crossfire.

She uses her reserved fourth slot to probe Unit 3 at tick 40 to confirm: yes, the fallback behavior fired because the relay signal was missing. One tick of silence = total formation collapse.

**Minute 3:30 — Fix Explorer Integration**
She opens Fix Explorer with her 4 probes still active. The analysis comes back: "Confidence: VERY HIGH (4 probe data points spanning causal chain). Root cause: Relay unit context switch to self-defense dropped mesh heartbeat. Suggested fix: Add 'relay-heartbeat-persist' rule to maintain minimum signal output during mode transitions." She grins. The probes paid off — four well-placed observations turned a mysterious cascade into a clear causal chain.

**What Dani learned:** Cascade failure analysis. The 4-slot budget forced her to be strategic about temporal coverage — she couldn't just blanket every tick. She learned to place probes at the *boundaries* of state changes (the tick before death, the tick of death) rather than randomly. She also learned to hold a probe in reserve, which mirrors real-world incident response: keep one observability channel open for the unexpected.

---

#### Journey: Tomás, 17, plays Factorio and Zachtronics games, no programming experience
**Context:** Mission 3 (early game, 2 probe slots). His very first Inspector session. He lost a battle and the game told him to "Inspect" the results. He has no idea what probes are.

**Minute 0:00 — Tutorial Nudge**
The Inspector opens with the replay and a pulsing tooltip arrow pointing at the two empty probe diamonds: "Place probes on units to see what they were thinking. You have 2 probe slots." The timeline shows his two units — a Scout and a Striker. The Striker walked in circles for the entire battle and accomplished nothing. Tomás finds this hilarious and infuriating.

**Minute 0:20 — First Probe, Blind Placement**
He clicks a diamond and the cursor changes to a probe icon (a small glowing pin). He clicks on the Striker at tick 1. The probe deploys with the sonar chime. The context window panel opens and he sees... a nearly empty working memory. The Striker has one entry: "AWAIT ORDERS." There's a small annotation: "No signals received. Unit is idle." The panel has a warm amber background to indicate an idle/empty state, contrasting with the cool blue of an active state.

**Minute 0:45 — "It was waiting the whole time?"**
He scrubs to tick 30. Same thing. "AWAIT ORDERS." He starts laughing. "It literally did nothing because nobody told it to do anything." He places the second probe on the Scout at tick 10. The Scout's context window is packed: enemy positions, terrain data, movement vectors. But the signal queue shows "OUTPUT CHANNEL: command — LISTENERS: 0." The Scout was broadcasting, but the Striker wasn't hooked up to receive. Nobody wired the connection.

**Minute 1:15 — The Aha**
Tomás doesn't need to evict anything. Two probes told the entire story: the Scout was talking, the Striker wasn't listening, because in the Plan screen he never connected the Scout's output hook to the Striker's input hook. He goes back to Plan, draws the hook connection (a glowing line from Scout output to Striker input), and re-runs. The Striker now receives orders and actually fights.

**Minute 1:30 — Emotional Beat**
He only used 2 probes. He didn't need more. But the *constraint* is what made it work — if he'd had 10 probes, he might have placed them randomly across the timeline and drowned in data. With 2, he placed them where it mattered and got a clean answer. The game taught him signal flow debugging in 90 seconds without ever using the word "debugging."

**What Tomás learned:** That agents don't magically know things — they need explicit signal wiring. The 2-probe limit prevented information overload and forced a focused investigation. He also learned the basic probe interaction model (place, read, move) that will scale as he gets more slots.

---

## 3. Strengths and Weaknesses

### Strengths

**"Scarcity Breeds Ingenuity" (core strength).** The 2-slot early limit is the best teacher in the game. Players cannot brute-force the Inspector by placing probes on every unit at every tick. They must form hypotheses first and then test them. This mirrors real engineering debugging: you can't `console.log` every variable — you have to reason about where the bug is and then verify.

**Clean progression curve.** 2 → 4 → unlimited maps naturally to player skill. Early players are overwhelmed by even 2 probes of data. Mid-game players can handle 4 concurrent data streams. Late-game players have earned unlimited access through the research tree, and by that point they've internalized the *habit* of strategic placement even when the limit is gone.

**Teaches cost-of-observability.** Real monitoring systems charge per metric, per log line, per trace span. Datadog bills by host. Honeycomb bills by event. The probe budget teaches this intuitively: observability is not free, and you must choose what to observe. Players who internalize this will make better engineering decisions later.

**Eviction creates emotional stakes.** Losing probe data when you evict is a small loss moment — the descending tone, the diamond going hollow. It's not punishing (you chose to evict), but it creates a feeling of "I'd better be sure I've extracted what I need before I move this." This mirrors the real feeling of tearing down a monitoring dashboard to make room for a new one.

**Synergy with search budget (4.60).** The two systems create a 2D resource space: observation breadth (probes) × analysis depth (search budget). A player might choose wide observation + shallow analysis, or narrow observation + deep analysis. This creates genuine strategic variety in how players approach the Inspector.

**Natural TikTok moment.** A player with 2 slots, placing one probe, reading it, evicting, placing on a different unit, reading, going "OH! The Relay dropped the signal!" — that's a 15-second clip that tells a complete detective story. The constraint creates narrative compression.

### Weaknesses

**Risk of frustration at 2 slots.** Some players may find 2 slots actively painful, especially if they're used to unlimited debugging tools. If a causal chain spans 4 units, 2 probes requires multiple rounds of evict-and-replace, which could feel tedious rather than strategic. Mitigation: ensure early-game battles have simple causal chains (1-2 units involved).

**Unlimited late-game may remove the teaching.** Once players unlock "Deep Telemetry," the constraint vanishes. Players who rushed the research tree might get unlimited probes before they've internalized strategic placement habits. Mitigation: the research node should be deep in the tree (not an early unlock), and the game could track "probe efficiency" as a score metric to encourage continued discipline.

**Eviction data loss feels arbitrary.** In real monitoring, you can usually look at historical data — you're choosing what to *collect going forward*, not destroying past observations. The eviction mechanic is gamified beyond realism. Mitigation: this is an acceptable abstraction for gameplay purposes, and it creates better tension than a "you can look at old data but can't place new captures" model.

**Cognitive load stacking.** Probe budget + search budget + signal priority levels + context window management = a lot of systems to track simultaneously. New players may feel overwhelmed. Mitigation: introduce probe budget before search budget in the mission sequence, so players learn one resource system at a time.

**Ambiguous value of "unlimited."** If unlimited probes are available late-game, what stops a player from placing 30 probes and creating an unreadable wall of data? The UI needs to gracefully handle many simultaneous probe panels. Mitigation: even with unlimited slots, the *screen real estate* is finite. Side panels stack, and beyond 6-8, the player has to scroll. Physical UI constraints provide soft limits even when the mechanical limit is removed.

---

## 4. Interaction Effects with Other Systems

### 4.60 — Search Budget
The primary interaction. Probes feed data into the Fix Explorer, improving its confidence scores. A player who spends all their probe slots gathering data and then runs a QUICK search may get better results than someone who runs a THOROUGH search blind. This creates a **substitution dynamic**: probe investment can partially compensate for search budget scarcity, and vice versa. The late-game "Instrumented Fix Search" research node that allows slot conversion makes this explicit.

### Signal Genealogy System
Probes capture signal queue state, which feeds into the genealogy view (tracing a signal from its origin through relay chains to its destination). With limited probes, the player can only illuminate *segments* of a genealogy chain. The genealogy view should visually show which segments have probe data (bright, detailed) versus which are inferred (dim, dotted lines). This creates a "fog of war" in the genealogy view that clears as probes are placed — a satisfying visual metaphor.

### Context Window / Buffer Mechanics
Probes reveal buffer utilization, which is the core mechanic of the game. A probe placed on a unit with 100% buffer utilization tells a different story than one at 40%. The probe budget ensures players can't just monitor every unit's buffer at every tick — they have to predict *which* unit is likely to overflow and verify. This reinforces the buffer management gameplay loop.

### Sealed Watch (No-Pause Battle)
Since probes are placed in the Inspector *after* the battle, not during it, the Sealed Watch's no-pause constraint is preserved. However, players who anticipate needing probes during the Plan phase might design their agent configurations to be more "debuggable" — e.g., adding self-reporting hooks that write to a log channel even during battle. This is an advanced technique that the probe budget subtly encourages: if probes are scarce, make your agents self-documenting.

### Research Tree Progression
The "Deep Telemetry" unlock creates a research tree decision point. Players choosing between "Deep Telemetry" (unlimited probes) and other research nodes (better signal routing, larger context windows, new unit types) must weigh observability investment against direct combat power. This mirrors real engineering team decisions: invest in monitoring infrastructure or ship new features?

### Probe Placement + Tick Scrubbing
The timeline scrubber and probe placement are tightly coupled UI elements. Scrubbing to a tick and then placing a probe should feel fluid — a single gesture, not two separate clicks. The interaction should be: scrub to tick, hover over unit, click to place. If the slot tray is full, the eviction dialog should appear *at the cursor*, not in a separate modal, to maintain flow.

---

## 5. Comparable Games and Media

**Outer Wilds — Rumor Map:** Outer Wilds limits player tools (no weapons, no upgrades) and instead gives you pure observation + hypothesis-testing. The "rumor map" that fills in as you learn things is analogous to probes illuminating the genealogy view. Both games teach through *constrainted observation*.

**Return of the Obra Dinn — Deduction with Limited Frames:** Each death scene in Obra Dinn gives you a single frozen moment to extract all your information. You can't rewind within it or get more angles. This is the same pressure as 2 probe slots: you see what you see, and you must deduce the rest.

**Factorio — Logistic Network Debugging:** Factorio players debugging throughput bottlenecks face the same "where do I put my measurement?" problem. You can only watch one part of the belt system at a time, and inserting measurement (splitters, circuit network readers) has physical cost and space. Probe budget is this, made explicit.

**Into the Breach — Perfect Information, Limited Actions:** Into the Breach shows you exactly what the enemy will do, but you only have 3 actions to respond. Probe budget is the inverse: you have the full replay, but limited *observation bandwidth*. Both create strategic depth through constraining one axis while freeing another.

**Real-world: Datadog Pricing Tiers:** Datadog's pricing model (per host, per metric, per log GB) is literally the probe budget mechanic applied to SaaS billing. Engineers who've played Robot Uprising will recognize the pattern instantly when they encounter their first monitoring bill.

**Real-world: Heisenberg's Uncertainty Principle (metaphorical).** You can observe position precisely or momentum precisely, but not both. The probe budget creates a similar trade: you can observe one unit's tick-by-tick state in detail, or sample across multiple units at key ticks, but not both with 2 slots.

---

## 6. Sensory Design

### Visual Language

**Probe Slots (Empty):** Hollow diamond shapes with a 1px cyan (#00D4FF) outline, pulsing slowly (2-second cycle, 60% → 100% opacity). Positioned in the Inspector's top-right corner, horizontally arranged. Background: transparent. They should feel like empty gem sockets — inviting, waiting to be filled.

**Probe Slots (Filled):** The diamond fills with the associated unit's color (each unit has a distinct hue — blue, green, gold, red). A small tick number appears inside ("T30"). The pulse stops and the diamond glows steadily. A thin line connects the filled diamond to the probe's position on the timeline, drawing a visual link between the slot tray and the data source.

**Probe Placement Animation:** When a probe is placed, a vertical scan line sweeps down from the probe point on the timeline, illuminating the grid square of the target unit with a brief flash (200ms). The side panel slides in from the right with a slight bounce (ease-out-back, 300ms). Data populates line by line with a typewriter effect (50ms per line), reinforcing the feeling of *capturing* information.

**Eviction Animation:** The filled diamond cracks (a thin fracture line appears), then shatters into 4-6 small fragments that drift downward and fade (400ms). The side panel for that probe collapses inward to a point and vanishes (200ms). The background behind the panel briefly flashes a warm amber (#FFA500, 100ms, 10% opacity) as a subtle "data lost" signal.

**Slot Full State:** When all slots are occupied and the player tries to place a new probe, the filled diamonds briefly shake (horizontal jitter, 100ms, 2px amplitude) and a red tint (#FF4444, 30% opacity, 150ms) flashes across the slot tray. A small tooltip appears: "All probe slots active. Evict one to place a new probe." The cursor changes to a probe icon with a small "X" overlay.

### Audio Design

**Probe Deploy:** A clean sonar ping — a single sine wave at ~800Hz, 200ms duration, with a slight reverb tail (500ms). Pitched slightly differently for each unit color (blue = 780Hz, green = 830Hz, gold = 880Hz, red = 920Hz) so the player can tell by sound which unit they probed without looking at the slot tray.

**Probe Eviction:** A descending three-note motif — 600Hz → 450Hz → 300Hz, each note 100ms, slight detuning on the last note to create a "dissolution" feel. Quiet (50% volume of the deploy sound). It should feel like releasing, not like punishment.

**Slot Full Rejection:** A dull, muted thud — a heavily low-passed kick drum (~120Hz, 80ms). Not a buzzer or alarm. The feeling should be "this is full" not "you did something wrong."

**Fix Explorer Confidence Boost:** When the Fix Explorer reports high confidence due to probe data, a small ascending chime plays (C5 → E5 → G5, arpeggiated over 300ms). This positively reinforces good probe placement. The player hears this and thinks "my probes paid off."

### Color Coding for Probe Data Panels

- **Active/healthy state data:** Cool blue (#1A1A2E) background, white text, cyan (#00D4FF) highlights on key values
- **Warning state data (buffer > 80%):** Dark amber (#2E2A1A) background, warm yellow (#FFD700) highlights
- **Critical state data (buffer full, signals dropped):** Dark red (#2E1A1A) background, red (#FF4444) highlights on dropped signals
- **Destroyed unit:** Black (#0A0A0A) background with a diagonal hatch pattern, gray text reading "[DESTROYED — no state]"
- **Empty/idle state:** Warm amber (#2E2618) background, muted text, a subtle horizontal line pattern suggesting emptiness

### The Eviction Micro-Moment

The eviction interaction deserves special attention because it's the emotional core of the mechanic. When a player drags a probe off the slot tray:

1. **Drag start (0ms):** The diamond lifts slightly (2px upward, scale 1.05x). The connecting line to the timeline stretches and thins.
2. **Drag in progress (0-300ms):** The side panel associated with this probe begins to dim (opacity 100% → 50%). A ghost afterimage of the data remains. The other filled diamonds scoot apart slightly to show the gap.
3. **Drop on empty space / trash (300ms):** The shatter animation plays. The panel collapses. The timeline probe point fades to a gray dot (it was here, but the data is gone). The gray dot remains for the session as a "tombstone" — the player can see *where* they previously probed, even though the data is gone. This is a small quality-of-life feature that helps players track their investigation history.
4. **Cancel (drop back on slot tray):** The diamond settles back with a gentle bounce. Panel returns to full opacity. A small relief.

The tombstone dots on the timeline are crucial: they turn the 2-slot constraint from a memory challenge into a visible history. The player can see "I already checked tick 30 on the Striker, and tick 28 on the Scout — what haven't I checked?" This transforms the eviction mechanic from pure loss into *progressive elimination*, which feels much better.

---

## Design Verdict

Probe budget is a strong mechanic that teaches a real engineering concept (cost of observability) through natural gameplay pressure. The 2 → 4 → unlimited progression is clean. The primary risk is early-game frustration with 2 slots on complex failures; this is mitigated by ensuring early missions have simple causal chains. The interaction with search budget (4.60) creates genuine strategic depth in the Inspector. The eviction micro-moment, with tombstone dots and the shatter animation, transforms a constraint into a satisfying investigation rhythm.

The TikTok clip: a player with 2 slots, scrubbing through the timeline, placing a probe, reading it, shattering it, placing on another unit, reading — then the camera cuts to their face as they realize the Relay dropped the signal. "Oh. OH. It was the Relay the whole time." The constraint made the discovery dramatic. Unlimited probes would have made it mundane.
