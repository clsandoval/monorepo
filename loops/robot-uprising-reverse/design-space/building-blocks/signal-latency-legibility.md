# 3.10b — Signal Latency Legibility: Teaching the Speed of Thought

## Overview

Signal latency — **1 tick per hop** — is the invisible tax on every architectural decision in Robot Uprising. A scout spots an enemy at tick 5. The signal reaches the relay at tick 6. The relay compresses and forwards at tick 7. The striker receives the compressed alert at tick 8. Three ticks from observation to action. At 1 second per tick, the enemy striker has moved three tiles. In a one-shot-one-kill game, three ticks is the difference between a flanking maneuver and a funeral.

This latency is **the single most important number in the game** that the player never directly sees. It's not printed anywhere. It's not a stat on a card. It emerges from the topology of the player's communication network — how many hops a signal must traverse to reach the unit that needs it. The player who understands latency builds flat, fast networks. The player who doesn't builds deep, elegant, slow networks that die before their signals arrive.

**The design challenge:** How does the player learn, internalize, predict, and optimize for a quantity that is defined by network topology rather than any single unit stat? How does the game make an invisible number viscerally legible across all three screens (Plan, Sealed Watch, Inspector)?

This is not an abstract problem. It's the difference between:
- "My striker didn't move" (opaque failure)
- "My striker received the order 3 ticks late because scout→relay→relay→striker is 4 hops" (legible failure)
- "I need to cut a hop — route the scout directly to the striker on a separate channel" (actionable insight)

---

## The Latency Legibility Spectrum

Signal latency can be communicated at six levels of directness, from "the player figures it out eventually through pain" to "the game shows a number on every wire."

### Level 0: "The School of Hard Knocks" — Zero Explicit Communication

**Philosophy:** Latency is a property of the system, not a UI element. The player discovers it by watching their units fail and asking "why didn't you act sooner?" The Inspector provides the data to answer that question, but the game never labels the answer "latency."

**How it works:** The player builds a Scout → Relay → Relay → Striker chain. Hits EXECUTE. Watches the sealed watch. The scout spots an enemy at tick 4. The striker does nothing at tick 5. Nothing at tick 6. Nothing at tick 7. At tick 8, the striker finally moves. By tick 9, the enemy has flanked and killed the striker. The player enters the Inspector, scrubs back to tick 4, clicks the scout, sees "HOOK FIRED: recon-net → signal sent." Clicks the first relay at tick 5, sees the signal in its buffer. Clicks the second relay at tick 6. Clicks the striker at tick 7 — signal arrives. Tick 8 — rule fires, striker moves. The player counts: 4 ticks from observation to action. They think: "That's too slow."

**Sensory description:** Nothing special. The sealed watch plays normally. The player notices the temporal gap between a scout's alert flash (green cell) and a striker's response only if they're paying attention. In the Inspector, the evidence exists but is spread across 4 unit inspections at 4 different ticks. The "aha" is purely cognitive — the player assembles the chain in their head.

**Strengths:**
- Zero UI clutter. Zero information overload. The battlefield stays clean.
- The discovery feels earned. When a player independently connects "4 hops = 4 ticks of delay," they understand it viscerally, not just intellectually.
- Matches TIS-100's approach: players who struggle to "visualize the machine" report breakthroughs when they stop thinking programmatically and start thinking like a circuit. The struggle IS the learning.
- No risk of players optimizing a displayed number without understanding what it means.

**Weaknesses:**
- **Most players never discover it.** Factorio's circuit network has the same problem: tick-level delays are invisible during normal gameplay, and the recommended approach is using the in-game editor's "tick once" feature for step-by-step inspection. Most Factorio players never learn to use this. The debugging UX is available but not discoverable.
- **TIS-100's visualization problem:** Players report "trouble even attempting to visualize problems" and that "it has to happen in code" because "there's no good way to depict the machine graphically to imagine how input flows." Robot Uprising's Inspector is better than TIS-100's text display, but the multi-unit, multi-tick chain still requires the player to manually reconstruct the timeline.
- **The sealed watch gap:** During the emotional first viewing, there's no visual cue connecting "scout flashed green" at tick 4 to "striker moved" at tick 8. They look like unrelated events.
- **The 60-70% silent majority:** Players who don't deeply engage with the Inspector (established in aspect 2.00b-i as a real population) will simply never encounter this concept.

**Comparable games:**
- **TIS-100:** Signal propagation delay is the core difficulty but entirely implicit. Players working on the Signal Pattern Detector report being "always too early with outputting" — a classic timing error from not internalizing pipeline delay. One successful player's advice: "think about it like an electrical circuit."
- **Factorio:** 1-tick combinator delay is documented on the wiki but invisible in-game. The community-built Cnide tool exists specifically because the base game doesn't visualize tick-level delays. The official recommendation is "pause and tick once" — functional but uninspiring.

---

### Level 1: "The Breadcrumb Trail" — Traveling Signal Visualization

**Philosophy:** The signal itself is the latency indicator. If the player can see a dot traveling along a wire and count the tiles it crosses, they can count the ticks of delay.

**How it works:** This is the Pulse Wire paradigm from 3.10 (hook visualization). During sealed watch, when a hook fires, a luminous dot spawns at the sender and travels along the wire to the receiver. The dot moves 1 tile per tick — meaning a 3-hop chain shows a dot that takes 3 visible seconds (at 1x speed) to travel from scout to striker. The player can literally watch the signal propagate and feel the delay.

**Sensory description:** The scout flashes green. A bright cyan dot appears at the scout's tile and begins gliding along the dashed wire toward the relay. It takes one full tick (one second) to cross to the relay. The dot enters the relay — a brief amber compression glow — and a new, brighter gold dot emerges heading toward the next relay. Another second. Another compression glow. A third dot, now white-hot with urgency, races toward the striker. Three seconds of visible travel. Meanwhile, the enemy striker has crept three tiles closer. The race between signal and threat plays out in real-time on the board.

**Strengths:**
- **Signal latency becomes a race you can watch.** The dot traveling along the wire while the enemy moves toward your units creates a visceral "will it arrive in time?" tension. This is Into the Breach's core design principle (perfect information creating meaningful tension) applied to signal propagation.
- **Counting is natural.** The player doesn't need to be told "latency = 3 ticks." They see the dot travel for 3 seconds and feel the delay in their bones.
- **Works at all speed settings.** At 0.5x, the dot crawls agonizingly. At 2x, it zips. The proportional relationship between signal speed and tick speed is maintained.
- **Already partially locked.** The spec says "signal chains visible — colored dashed lines show active channel communications between units during battle." The traveling dot is a natural extension.

**Weaknesses:**
- **Passive observation, not prediction.** The player sees latency after the fact during sealed watch, but can't predict it during the plan phase. They learn by watching, not by planning.
- **Visual noise at scale.** With 8+ channels active, multiple signals traveling simultaneously create visual chaos. The cyberpunk city-traffic-at-night aesthetic is beautiful but potentially overwhelming.
- **No numeric precision.** The player can estimate "that took about 3 seconds" but never sees "latency: 3 ticks" as a concrete number to optimize.
- **Doesn't help during plan phase.** The plan screen shows static wire topology but no indication of how many ticks a signal will take to traverse the network.

---

### Level 2: "The Hop Counter" — Tick Pips on Wires

**Philosophy:** Each wire segment between units gets a visible tick pip — a tiny numbered marker showing how many ticks that segment adds to the total latency. The total chain latency is the sum of pips.

**How it works:**

*Plan screen:* Each wire in the channel map / ghost preview shows small circular pip markers at regular intervals along its length. Each pip represents 1 tick of latency. A direct Scout → Striker wire shows 1 pip (hovering reveals "1 tick"). A Scout → Relay → Striker chain shows 1 pip on the first segment and 1 pip on the second — total visible: 2 pips. The total latency for any signal path is the count of pips from source to destination. A tooltip on hover reads: "Signal path: Scout → Relay → Striker | Total latency: 2 ticks."

*Sealed watch:* The traveling signal dot passes through each pip sequentially. As the dot passes a pip, the pip briefly flares bright (like a highway mile marker flashing as a car passes). This creates a visual countdown: pip-flash, pip-flash, pip-flash, arrival.

*Inspector:* The signal genealogy view (4.16) annotates each edge with its tick cost. Hovering any signal shows "Sent: T4 | Received: T6 | Latency: 2 ticks." The critical path (longest latency chain in the network) is highlighted in amber.

**Sensory description:** On the plan screen, the wires between units are punctuated by tiny diamond-shaped pips — translucent, the same color as the channel but lighter. They sit at the midpoint of each hop. When the player hovers a wire, the pips glow brighter and a subtle "1...2...3..." count appears above each pip, left to right, showing cumulative latency. The total number pulses once at the destination unit. It looks like highway distance markers on a road map — unobtrusive at a glance, informative on inspection.

During sealed watch, each pip flares gold as the signal dot passes through it, creating a sequential flash pattern: *flash* — pause — *flash* — pause — *flash* — ARRIVE. The rhythm of the flashes IS the latency. Fast chains (1 hop) are a single quick flash-and-done. Slow chains (4 hops) are a stately series of four flashes that the player can count.

**Strengths:**
- **Predictive AND retrospective.** The plan screen pips let the player count latency before executing. The sealed watch flashes confirm it in real-time. The Inspector annotates it with precision. All three screens communicate the same concept through different lenses.
- **Supports optimization.** "My chain has 4 pips. Can I cut it to 2?" is a concrete, actionable question.
- **Scales well.** Pips on wires add minimal visual noise — they're part of the wire, not separate overlay elements.
- **Teaches through counting.** Even a player who doesn't understand "latency" can count pips and understand "more pips = slower."

**Weaknesses:**
- **Static pips don't capture dynamic latency.** If a relay unit is processing a compress skill (which might add 1 tick of processing delay beyond the 1-tick transmission delay), the pip count doesn't reflect that. Processing time and transmission time are conflated or must be distinguished visually (more complex).
- **Pips assume the Pulse Wire visualization paradigm.** Under the Subway Map paradigm (lanes along grid edges), pips would need a different visual treatment (station dots?).
- **Could over-simplify.** Some players might optimize purely for pip count (minimize hops) without understanding WHY fewer hops are better — missing the deeper lesson about information architecture tradeoffs (fewer hops = faster but louder EM, less processing).

---

### Level 3: "The ETA Overlay" — Pre-Execution Latency Predictions

**Philosophy:** Before the player hits EXECUTE, the plan screen should show predicted signal arrival times for every unit in the network. "If a scout spots an enemy at tick 1, when does each unit receive the alert?" This is the architectural equivalent of Into the Breach's attack preview — perfect information about consequences before commitment.

**How it works:**

*Plan screen:* The player presses a "Signal Preview" button (or hovers a channel in the channel map panel). The board dims. Ghost signal paths illuminate. Each unit in the channel displays a small badge: **T+1**, **T+2**, **T+3** — the number of ticks after the originating event before this unit receives the signal. The badge color shifts from green (T+1, fast) through amber (T+2-3, moderate) to red (T+4+, dangerously slow). The preview assumes worst-case latency (longest path from any potential origin point).

*Interactive mode:* The player can click any unit on the board to set it as the signal origin. The ETA badges update in real-time. "If THIS scout spots the enemy, how long before my striker knows?" Click a different scout — different latency map. This lets the player explore their network's responsiveness from every vantage point.

*Channel-specific:* Each channel gets its own ETA overlay (toggled via the channel map panel). The `recon-net` channel might show fast latency (T+1 to T+2 across the network) while the `command-net` channel shows slower latency (T+3 to T+4, because it routes through relays for compression).

**Sensory description:** The player clicks "Signal Preview" in the channel map panel. The board transitions: tiles desaturate to 30% opacity, a soft scan-line sweeps left to right (like a radar ping), and each unit fades in a circular badge — a small disc with a number inside. The scout shows "T+0" in white (origin). The nearest relay shows "T+1" in fresh green. The far relay shows "T+2" in warm amber. The striker in the corner shows "T+3" in burnt orange. A tooltip on hover: "STRIKER-A receives recon-net signals 3 ticks after origin event. Fastest path: SCOUT-B → RELAY-A → RELAY-C → STRIKER-A." The board looks like a heatmap of response time — cool greens clustered near scouts, warming to oranges at the network's extremities. Dead spots (units not on this channel) show no badge, making communication gaps immediately visible.

A soft, low-pitched pulse plays once per badge tier as they appear — a quick *pip* for T+0, a slightly lower *pip-pip* for T+1, descending in pitch. The badges furthest from the origin pulse the slowest, creating an auditory sense of distance.

**Strengths:**
- **Into the Breach-level perfect information.** Into the Breach's entire design philosophy is "show the player exactly what will happen so their decisions are meaningful." Showing signal ETAs before execution applies the same principle to information architecture. The player can't be surprised by "my striker was too slow" because the ETA overlay warned them.
- **Drives optimization.** The red T+4 badge on the striker is a tangible problem to solve. "How do I get that number lower?" The player might add a direct channel, reposition a relay, or use a compressed signal to reduce processing time. The badge gives them a target.
- **Spatial reasoning.** The heatmap-style visualization turns abstract network topology into spatial geography. "My network is fast in the center and slow at the edges" is visible at a glance.
- **Addresses Factorio's biggest gap.** Factorio's circuit network has no equivalent — players must manually calculate combinator chain delays. The in-game editor's "tick once" is a debugging tool, not a planning tool. Robot Uprising's ETA overlay would be the planning tool Factorio players always wanted.

**Weaknesses:**
- **Assumes static topology.** The ETA overlay shows latency for the current board layout. But during execution, units move: scouts patrol, enemies push in, relays might be destroyed. The actual latency at tick 20 might differ from the tick-0 prediction. The overlay could give false confidence.
- **Complexity explosion.** With 5 channels and 8 units, showing all ETA overlays simultaneously is visual chaos. Channel-specific toggling helps but adds interaction cost.
- **Processing delay is hard to predict.** If a relay uses `compress` before forwarding (adding 1 tick of processing time to the 1 tick of transmission), should the ETA reflect that? Compress only fires conditionally — the relay might pass through without compressing. The ETA would need to show best-case and worst-case, adding complexity.
- **Could discourage deep architectures.** If "minimize the red badges" becomes the meta, players might avoid multi-relay chains entirely. But deep architectures have advantages (compression, filtering, error correction) that shallow ones lack. The ETA overlay could create a false "flat is always better" heuristic.

---

### Level 4: "The Latency Budget" — Explicit Latency as a Resource

**Philosophy:** Latency is not just a consequence — it's a resource to be spent deliberately. The game surfaces a per-channel "latency budget" that the player can see and compare against the enemy's threat speed.

**How it works:**

*Threat speed reference:* The plan screen displays enemy unit speeds (from mission briefing): "Enemy Scout: 1 tile/tick. Enemy Striker: 1 tile/tick." The player's signal latency is compared against how fast the enemy can close distance.

*Budget calculation:* For each channel, the game computes: "If an enemy appears at maximum detection range (perception radius), how many ticks does this channel need to deliver a response signal? How many ticks before the enemy reaches lethal range?" The difference is the **latency margin**: positive = safe, zero = just-in-time, negative = too slow.

*Budget display:* A compact panel in the workbench shows:

```
Channel: recon-net
  Signal path: 3 hops (3 ticks)
  Threat closure: 5 ticks (Scout perception 5 − Striker adjacency 1 = 4 tiles @ 1 tile/tick)
  Latency margin: +1 tick ✓

Channel: command-net
  Signal path: 5 hops (5 ticks)
  Threat closure: 4 ticks
  Latency margin: −1 tick ✗ DANGER
```

**Sensory description:** In the workbench's channel map panel, each channel row includes a tiny horizontal bar — a "latency thermometer." The bar is divided into two segments: a cyan portion showing signal travel time and a magenta portion showing threat closure time. If the cyan bar is shorter than the magenta bar, the bar glows green — signal arrives before threat. If cyan exceeds magenta, the overflow segment pulses red — signal arrives after the threat. The ratio is immediately intuitive: more cyan than magenta = too slow.

When the player adjusts their network (adds a relay, reroutes a channel), the latency thermometers update in real-time. Adding a relay to a fast channel visibly extends the cyan bar. Removing a hop shrinks it. The player can see, in real-time, how each architectural change affects their race against the enemy.

A subtle audio cue plays when a latency margin goes negative: a descending two-note chime, like a warning klaxon softened for a workbench environment. When a margin goes positive: a quick ascending chirp. The workbench hums with these micro-sounds as the player experiments.

**Strengths:**
- **Contextualizes latency against threat.** Raw hop count (Level 2) tells the player "3 ticks." The latency budget tells them "3 ticks, but the enemy needs 4 ticks to reach you, so you're fine." Context makes the number meaningful.
- **Drives architectural decisions.** A red-pulsing latency bar is a problem to solve. The player isn't just minimizing latency — they're making it sufficient for the specific tactical situation. This mirrors real-world SLA design: "99th percentile response time must be under 200ms" is more useful than "minimize latency."
- **Teaches tradeoff thinking.** Some channels CAN be slow. The `command-net` might have 5-hop latency, but if it only carries non-urgent administrative signals, that's fine. The latency budget helps the player distinguish "critical path" (scout→striker, time-sensitive) from "background processing" (command restructuring, latency-tolerant).
- **Elegant integration with locked spec.** The mission briefing already provides enemy data. The perception radius is a locked stat. The math is straightforward.

**Weaknesses:**
- **Over-simplifies dynamic situations.** Threat closure time depends on enemy position, which changes every tick. The budget shows a snapshot worst-case, which might be misleading if enemies approach from multiple angles.
- **Could become a crutch.** If the game tells players exactly how much latency they can afford, they might never develop the intuition to estimate it themselves. The budget could replace understanding with compliance.
- **Complexity ceiling.** With 5 channels, 8 units, and multiple enemy types, the budget panel could become an overwhelming spreadsheet. Needs progressive disclosure.
- **Processing delay problem persists.** Same as Level 3 — skills like `compress` add variable processing time that's hard to budget precisely.

---

### Level 5: "The Latency Ruler" — Interactive Topological Distance Tool

**Philosophy:** Give the player a direct measurement tool. Click unit A, click unit B, see the shortest signal path and its tick cost — like a ruler measuring communication distance across the network.

**How it works:**

*Plan screen tool:* A "Measure Latency" tool in the workbench toolbar (hotkey: L). The player clicks a source unit, then a destination unit. The game highlights the shortest signal path between them (using existing channel topology) with a bright line, annotated with hop-by-hop tick costs and a total. If no path exists (units share no channel), a red "NO PATH" indicator appears with a dashed line showing where a connection would need to go.

*Drag-and-hold variant:* The player clicks and holds on a unit, then drags to another unit. During the drag, a real-time "rubber band" line follows the cursor, and as it passes near other units, the hop count updates dynamically. This lets the player explore the network topology by dragging through it.

*Multi-path display:* If multiple paths exist between two units (through different relays or channels), all paths are shown with their respective costs, and the shortest is highlighted in green while others are shown in amber. The player can see redundancy and choose whether the alternate paths are worth maintaining.

**Sensory description:** The player selects the Measure tool — the cursor transforms into a small rangefinder icon with two dots connected by a line. They click SCOUT-A. A subtle glow surrounds the scout, and thin translucent arcs extend outward showing 1-hop reach (T+1 radius in green), 2-hop reach (T+2 radius in amber), 3-hop reach (T+3 radius in soft red) — concentric signal wavefronts painted over the board like a topographical map of communication distance. The player's gaze follows the wavefronts. Their striker sits in the amber T+2 zone. A relay just outside the green T+1 zone could be repositioned to bring the striker into green. The wavefronts make the optimization physically visible.

When the player then clicks STRIKER-A, the wavefronts collapse into a single highlighted path: SCOUT-A → RELAY-B → STRIKER-A. The path glows with sequential pip-flash animation (echo of the sealed watch traveling dot). A tooltip reads: "Signal latency: 2 ticks via RELAY-B. Alternate: SCOUT-A → RELAY-C → RELAY-D → STRIKER-A (3 ticks)." A soft dual-tone chime plays — the first note for the source, the second (higher) for the destination, with the interval between them proportional to the hop count. 2-hop = quick interval. 4-hop = slow, drawn-out interval. The player hears latency as musical tempo.

**Strengths:**
- **Active learning.** The player isn't passively observing latency — they're measuring it. The act of clicking, dragging, and reading results creates stronger encoding than watching numbers appear.
- **The wavefront visualization is the killer feature.** Showing concentric "signal reach at T+1, T+2, T+3" transforms the abstract network into a spatial field. The player can literally see which units are "close" (in communication terms) and which are "far" — even if they're physically adjacent on the board. Two units next to each other that share no channel show as infinitely distant. The wavefront makes the invisible communication topology tangible.
- **Path comparison drives architecture.** Seeing two paths (2 ticks vs. 3 ticks) side by side prompts the question "do I need the slower path?" This naturally teaches redundancy vs. efficiency tradeoffs.
- **Low implementation cost.** It's a graph traversal BFS displayed as a board overlay. The data is already computed for signal routing.

**Weaknesses:**
- **Tool mode is a context switch.** The player has to explicitly activate the Measure tool, use it, then switch back to building. This friction means casual players might forget it exists.
- **Only useful during planning.** No sealed watch or Inspector equivalent (though the wavefront could appear as an Inspector overlay at a specific tick).
- **Doesn't capture dynamic changes.** Same as other levels — units move during battle, changing the effective topology. The plan-phase measurement reflects initial positions only.

---

### Level 6: "The Latency-Aware Inspector" — Post-Battle Chain Analysis

**Philosophy:** The Inspector already shows decision traces and context window state per unit per tick. Extend it to show complete signal chains with latency annotated end-to-end, making post-battle latency analysis a natural part of the debrief workflow.

**How it works:**

*Signal chain timeline:* When the player clicks a unit in the Inspector and selects a decision trace entry ("Rule 3 fired: MOVE toward threat"), the Inspector shows the complete information chain that led to that decision:

```
T4: SCOUT-B observes ENEMY-3 at (E,4)
    → HOOK: ON_OBSERVE → recon-net
T5: RELAY-A receives signal in slot 3/12
    → SKILL: compress → recon-net-compressed
T6: STRIKER-A receives compressed signal in slot 2/8
    → RULE 3 matches: IF compressed_threat THEN move_toward
T7: STRIKER-A moves to (D,5)

Total chain: 3 ticks (T4 → T7)
```

The chain is displayed as a vertical timeline with unit icons, tick markers, and connecting arrows. Each arrow is annotated with "+1 tick (transmission)" or "+1 tick (processing)."

*Latency comparison view:* The Inspector can overlay multiple signal chains simultaneously. "Show me all signals that reached STRIKER-A." The player sees 5 chains of varying length — some 2 ticks, some 4 ticks, one that arrived too late (marked in red: "Arrived T12, STRIKER-A eliminated T11"). The late signals are the lesson: this chain was too slow.

*Counterfactual latency:* "What if this signal had taken a direct path?" The Inspector shows the hypothetical: "Direct SCOUT-B → STRIKER-A: 1 tick (would have arrived T5 instead of T7). STRIKER-A would have moved 2 ticks earlier. Enemy would not have reached lethal range." This is the "near-miss" concept applied to signal routing.

**Sensory description:** In the Inspector sidebar, the signal chain view renders as a stepped timeline — imagine a waterfall chart turned sideways. Each step is a unit icon on the left, a horizontal bar spanning the tick range during which that unit held the signal, and a downward arrow to the next unit. The bars are colored by the channel's assigned color (cyan for recon-net, gold for command-net). The gaps between bars — the transmission ticks — are shown as thin white dashed lines labeled "+1t." Where a skill processes the signal (compress, filter), the bar thickens slightly and shows a small skill icon.

The late-arrival signal chain has its final bar terminating in a red X with a skull icon — the unit was eliminated before the signal could be acted upon. A faint red ghost line extends rightward showing "would have arrived here" if the unit had survived. This ghost line is the diagnostic: the player sees that 2 fewer hops would have saved the unit.

The audio for the signal chain view is a sequence of soft ticks — one per hop in the chain — played at the actual inter-tick interval when the player scrubs through the timeline. A 3-hop chain produces three evenly spaced ticks. The late-arrival chain produces the same ticks, then a discordant buzz on the final red X. The rhythm of the ticks IS the latency, heard rather than counted.

**Strengths:**
- **Integrates with existing Inspector flow.** The player is already clicking units and reading decision traces. The signal chain is a natural extension of "why did this unit act this way?"
- **Retrospective precision.** Unlike the plan-phase tools (Levels 3-5), the Inspector shows what actually happened — including dynamic factors like unit movement, relay destruction, and processing delays that couldn't be predicted.
- **Counterfactual drives learning.** "Your striker died because the signal was 2 ticks late" + "a direct path would have been 2 ticks faster" = "I need a direct scout-to-striker channel for urgent threats." The lesson writes itself.
- **Emotional resonance with the two-act structure.** The player first watches the sealed watch and feels the emotional beat of "my striker died." Then in the Inspector, they discover WHY — the signal chain was too long. The emotional punch of the sealed watch gives weight to the analytical discovery in the Inspector. The two-act structure makes latency matter.

**Weaknesses:**
- **Post-hoc only.** The player learns from failure, not from prevention. This is valuable but doesn't help them plan better networks in advance (unless combined with plan-phase tools).
- **Cognitive load.** Signal chains across 5+ units with branching paths could become overwhelming. Needs aggressive visual simplification for complex networks.
- **The "too much data" problem.** A single battle might generate 50+ signal chains. Which ones matter? The Inspector needs filtering: "Show me only chains that arrived after the destination unit was eliminated" (late signals) or "Show me only chains longer than 3 ticks" (slow paths).

---

## The Recommended Hybrid: "The Latency Language"

**No single level is sufficient.** The player needs to encounter latency at multiple points in their workflow, through multiple sensory channels, with increasing precision as they gain expertise. The recommended approach is a progressive disclosure system called **"The Latency Language"** — a coherent vocabulary of latency indicators that builds across the 10-mission campaign.

### Stage 1: Feel It (Missions 1-3)
**Level 1 only.** Traveling signal dots in sealed watch. The player sees signals moving and unconsciously registers "that took a while." No numbers, no overlays, no tools. The dots do the teaching.

*What the player internalizes:* "Signals take time to travel. Longer chains take more time."

### Stage 2: Count It (Missions 4-5)
**Level 1 + Level 2.** Hop counter pips appear on wires in the plan screen. The first time a pip appears, a brief boot log entry: `[SIGNAL_ANALYSIS] > calculating propagation delay... 1 hop = 1 tick. Annotating topology.` The player can now count pips before executing.

*What the player internalizes:* "Each hop costs 1 tick. I can count them."

### Stage 3: Measure It (Missions 5-7)
**Levels 1-2 + Level 5.** The Latency Ruler tool unlocks in the workbench (Mission 5, with factory introduction). The wavefront overlay is available on hover. Boot log: `[TOPOLOGY_ANALYZER] > latency measurement tool calibrated. Select source → destination for propagation analysis.`

*What the player internalizes:* "I can measure the communication distance between any two units. Some units are far from each other even if they're physically close."

### Stage 4: Predict It (Missions 6-8)
**Levels 1-5 + Level 3.** The ETA overlay unlocks. The player can now see predicted signal arrival times before executing. Boot log: `[PREDICTIVE_ROUTING] > signal ETA computation enabled. Overlay shows estimated arrival tick per unit.`

*What the player internalizes:* "I can predict exactly when information will reach each unit. My network has fast zones and slow zones."

### Stage 5: Budget It (Missions 8-10)
**All levels + Level 4.** The latency budget panel appears. Threat closure time is calculated. Latency margins are displayed. The player is now making explicit SLA-style decisions: "This channel needs to be under 3 ticks. This one can be 5."

*What the player internalizes:* "Latency is relative to threat speed. Some latency is acceptable. Architecture is about matching communication speed to threat speed."

### Stage 6: Diagnose It (All missions, deepening over time)
**Level 6.** The Inspector's signal chain view is always available but becomes more valuable as the player's network grows more complex. Early missions show simple 1-2 hop chains. Late missions show branching multi-hop networks with counterfactual analysis.

---

## Player Journeys

### Journey: Mika, 14, First-Time Strategy Player

**Context:** Mission 2. Has only a scout and a striker. Just learned hooks in Mission 1. The scout has a hook: ON_OBSERVE → send on `alert`. The striker listens on `alert`.

**Minute 0:00 — Plan Screen**
Mika sees her two units on the 8×8 board. A thin cyan dashed line connects the scout to the striker — her `alert` channel. She hasn't noticed the line before; it appeared when she wired the hook last mission. No pips on the wire yet (those unlock at Mission 4). She hits EXECUTE.

**Minute 0:05 — Sealed Watch, Tick 1-3**
The board is quiet. Her scout patrols the upper rows. An enemy striker spawns at (H,1). The scout turns toward it — Mika sees the scout's perception radius (a faint cyan circle) overlap the enemy's tile.

**Minute 0:08 — Sealed Watch, Tick 4**
The scout spots the enemy. The cell flashes green. A bright cyan dot appears at the scout's tile and begins sliding along the dashed line toward the striker. Mika's eyes track the dot. It takes one full second to reach the striker. The dot arrives. The striker's context bar gains a new pip.

**Minute 0:09 — Sealed Watch, Tick 5**
The striker evaluates its rules. Rule 1 matches: IF threat_nearby THEN engage. The striker moves toward the enemy. But the enemy has also moved one tile closer. They're now 2 tiles apart.

**Minute 0:12 — Sealed Watch, Tick 6**
Striker moves to adjacent tile. Enemy is adjacent. Striker eliminates enemy. MISSION COMPLETE.

**Minute 0:15 — Reflection**
Mika doesn't consciously think "that signal took 1 tick." But she SAW the dot travel. She felt the delay. When Mission 3 introduces a relay in the chain, she'll see the dot take TWO seconds to travel through the relay, and she'll feel the difference. The seed is planted.

**UI Annotations:**
- Signal dot: 6px diameter, channel color, soft glow, moves at 1 tile per tick (1 tile per second at 1x speed)
- Wire: thin dashed line, 30% opacity at rest, brightens to 80% during signal transit
- No numbers, no labels, no overlays at this stage — just the moving dot

---

### Journey: Derek, 31, Software Engineer, Factorio Veteran

**Context:** Mission 6. Just got the factory. Has a 4-unit network: Scout → Relay-A → Relay-B → Striker. Channel: `intel`. He's been frustrated that his striker "always reacts late."

**Minute 0:00 — Plan Screen**
Derek looks at his workbench. He's just unlocked the Latency Ruler tool (the wavefront overlay). He hovers over SCOUT-A. Concentric arcs bloom outward from the scout: a green ring encompassing RELAY-A (T+1), an amber ring reaching RELAY-B (T+2), and a soft red ring touching STRIKER-A (T+3). The striker sits in the T+3 zone — red.

Derek stares. "Three ticks. The enemy moves three tiles in three ticks. If the scout spots someone at max range (5 tiles away), the striker only has 2 tiles of margin."

**Minute 0:30 — Plan Screen, Experimenting**
He drags RELAY-B closer to the striker. The wavefront updates — STRIKER-A is still T+3 (same hop count). He realizes: proximity doesn't change hop count. The delay is topological, not spatial.

He opens the channel map panel. The `intel` channel shows: SCOUT-A → RELAY-A → RELAY-B → STRIKER-A. Three arrows. Three hops. He needs to cut a hop.

**Minute 1:00 — Plan Screen, Redesign**
Derek creates a new channel: `fast-alert`. He adds a hook to SCOUT-A: ON_THREAT → send on `fast-alert`. He subscribes STRIKER-A to `fast-alert`. Now SCOUT-A talks to STRIKER-A directly for urgent threats (1 hop) while the detailed `intel` channel still goes through relays for processed data (3 hops).

He hovers SCOUT-A again with the Latency Ruler. The wavefront now shows STRIKER-A in the green T+1 ring via `fast-alert`. The `intel` path still shows T+3, but that's fine — `intel` carries processed data, not urgent alerts.

**Minute 1:30 — Plan Screen, Satisfied**
Derek murmurs "dual-path architecture" — a pattern he recognizes from his microservices work. Critical alerts on a fast path. Detailed telemetry on a slow, processed path. He hits EXECUTE.

**Minute 1:35 — Sealed Watch**
Tick 4: Scout spots enemy. TWO dots fire simultaneously — a bright red dot on `fast-alert` racing directly to the striker (1 hop), and a cyan dot on `intel` traveling the longer relay chain. The red dot arrives at tick 5. The striker moves immediately. The cyan dot is still in transit through RELAY-A. By the time the processed intel arrives at tick 7, the striker has already eliminated the threat.

Derek grins. The visual confirmation — fast dot arriving first, slow dot still traveling — validates his architecture instantly.

**Minute 3:00 — Inspector**
In the Inspector, Derek clicks the striker's decision at tick 5. The signal chain view shows: "SCOUT-A (T4) → fast-alert → STRIKER-A (T5). Latency: 1 tick." Below it, the slower chain: "SCOUT-A (T4) → intel → RELAY-A (T5) → RELAY-B (T6) → STRIKER-A (T7). Latency: 3 ticks. ⚠ Arrived after action taken."

The "arrived after action taken" annotation confirms: the dual-path architecture worked. The fast path drove the decision. The slow path arrived as supplementary context.

**UI Annotations:**
- Wavefront overlay: concentric arcs, green (T+1) → amber (T+2-3) → red (T+4+), 40% opacity, centered on selected unit
- Channel map: hop count displayed per channel (e.g., "intel: 3 hops")
- Dual-channel signals: different channel colors on simultaneous dots, visible race during sealed watch
- Inspector signal chain: vertical timeline, unit icons, "+1t" labels on arrows, "arrived after action" amber warning

---

### Journey: Abuela Rosa, 62, Retired Nurse, First Video Game

**Context:** Mission 4. Has been playing with her grandson Tomás who set up the game. She has a Scout, a Relay, and a Striker. The relay compresses scout reports before forwarding to the striker.

**Minute 0:00 — Plan Screen**
Rosa sees tiny diamond pips on the wires (just unlocked this mission). One pip between Scout and Relay. One pip between Relay and Striker. She doesn't know what they mean. She hovers over the wire between Scout and Relay — a tooltip appears: "1 hop — signal arrives 1 tick later." She hovers the other wire: "1 hop — signal arrives 1 tick later."

She asks Tomás: "What's a tick?"

Tomás: "One second. Each tick is one second."

Rosa looks at the board. Two pips total. Two seconds from scout seeing something to striker knowing about it. She nods. "Like calling someone on the phone, and they pick up on the second ring."

**Minute 0:20 — Sealed Watch, Tick 3**
The scout spots an enemy. Green flash. Cyan dot begins traveling. Rosa watches the dot slide from scout to relay — one pip flashes gold as the dot passes it. "One ring," she says. The dot enters the relay, pauses briefly (compress), exits as a brighter dot heading to the striker. The second pip flashes. "Two rings."

**Minute 0:23 — Sealed Watch, Tick 5**
The striker receives the signal and moves. But the enemy has moved two tiles closer during the "two rings." Rosa watches, concerned. The striker and enemy converge — the striker eliminates the enemy just in time.

**Minute 0:30 — Post-Battle**
Rosa enters the Inspector. Tomás shows her how to click the striker. She sees the signal chain: "Scout (T3) → Relay (T4) → Striker (T5). Total: 2 ticks." She traces the timeline with her finger on the screen. "Two seconds. The relay is like the nurse's station — the doctor doesn't hear the patient directly, the nurse takes the message. But that takes time."

**Minute 1:00 — Next Attempt**
Rosa adds a second hook on the scout: ON_THREAT (urgent) → send directly to striker on a new `emergency` channel. She labels the channel "code blue" — her hospital terminology. Tomás laughs. The hop count drops to 1. "One ring for emergencies," she says. "Two rings for everything else."

**UI Annotations:**
- Pip tooltip: plain language "1 hop — signal arrives 1 tick later" (not "latency: 1t")
- Pip flash: gold flash as signal dot passes, creating countable visual events
- Inspector signal chain: linear, minimal, timestamped — readable without gaming literacy
- Channel naming: player-typed names appear in all UI — "code blue" shows everywhere Rosa sees this channel

---

### Journey: Kwame, 28, Twitch Streamer, Diamond Gauntlet Rank

**Context:** Mission 9. Complex 12-unit army with 6 channels. He's preparing a Gauntlet-winning architecture and stream-tuning his latency.

**Minute 0:00 — Plan Screen**
Kwame has the full latency toolkit. He toggles the ETA overlay for his `recon-net` channel. The board lights up with badges: his frontline scouts show T+0 (origins), his relay hub shows T+1, his striker pair shows T+2, his command unit shows T+3. The latency budget panel shows:

```
recon-net: 2 ticks → Margin: +2 ✓
command-net: 4 ticks → Margin: −1 ✗ DANGER
alert-net: 1 tick → Margin: +3 ✓✓
```

"Chat, look at the command-net. Minus one. If the enemy rushes the east side, my command unit finds out too late to reroute. I need to cut a hop."

**Minute 0:30 — Plan Screen, Live Optimization**
Kwame uses the Latency Ruler to measure SCOUT-C → COMMAND-A. The wavefront shows T+4 — four hops through two relays and a filter node. He restructures: removes one relay from the chain and adds a direct `command-fast` channel from scout to command (raw, unfiltered).

The latency budget updates in real-time. `command-fast`: 2 ticks. Margin: +1. The red DANGER text fades to green. Chat reacts: "CLEAN. That's a two-hop command path." Kwame: "But now command gets raw data, no compression. Bigger context load. Let's see if the buffer can handle it."

**Minute 1:00 — Sealed Watch**
The battle plays. At tick 8, three enemies converge on the east flank. SCOUT-C fires on `command-fast`. Two seconds later — exactly as predicted — COMMAND-A receives the alert and fires reassign, rerouting STRIKER-B from the west to the east. The command signal propagates through `command-net` (the old slow path) and STRIKER-B acknowledges at tick 13. Total: 5 ticks from observation to striker response. Close, but it works.

"Chat, the old architecture would've been 6 ticks there. That one hop I cut? That's the difference between the striker arriving in time and arriving to a funeral."

**Minute 2:00 — Inspector, Stream Content**
Kwame opens the Inspector and pulls up the full signal chain for the east-flank engagement. He overlays the actual chain (5 ticks) with the counterfactual old architecture (6 ticks, shown as a ghost chain in amber). "See that? One extra tick. And the enemy was at lethal range at tick 13. My striker arrived tick 13. One tick margin. Old architecture, the striker arrives tick 14 — one tick too late. Dead."

Chat explodes. Kwame clips it: "This is why latency matters. One hop. One tick. One kill."

**UI Annotations:**
- ETA overlay: per-channel toggle, badge colors green/amber/red, tooltip with full path
- Latency budget panel: compact table, color-coded margins, real-time updates on architecture changes
- Latency ruler: wavefront overlay, click-to-measure, multi-path display
- Inspector counterfactual: ghost chain overlay in amber, side-by-side actual vs. hypothetical timing
- All tools available simultaneously — expert players use them fluidly without switching modes

---

## Interaction Effects

### × Hook Chaining (3.09)
If chaining is enabled (same-tick cascade), latency calculation becomes more complex. A same-tick chain adds zero latency (scout → relay → striker in 1 tick if all chains fire within the tick). A delayed chain adds 1 tick per hop (locked spec). The latency tools must distinguish between "transmission delay" (1 tick per hop) and "cascade delay" (0 ticks for hot chains, 1 tick per evaluation for cold chains). The ETA overlay would need to show two numbers: best-case (all hot chains) and worst-case (all cold chains).

### × EM Emissions
Flat, fast networks (fewer hops) produce less EM noise per signal but require more direct hooks (more hooks = more EM sources). Deep, slow networks (more hops, relay processing) produce fewer source emissions but each hop adds an emission event. The latency budget should eventually surface EM cost alongside latency cost — "cutting this hop saves 1 tick but adds 1 direct hook emission." The tradeoff between speed and stealth is the deepest architectural decision in the game.

### × Context Overload
A signal that arrives 3 ticks late might fill a buffer slot that's already at capacity. If the receiving unit's context window is full, the late signal triggers eviction — or worse, overload stun. Late signals don't just miss the action window; they can actively harm the receiving unit. The signal chain view in the Inspector should flag: "Signal arrived T7, but STRIKER-A's buffer was full at T7 — signal caused eviction of [PATROL_DATA, age: 2 ticks]."

### × Campaign Pacing (5.04b Vocabulary Density)
"Latency" is a Category B term (new behavior of familiar system — the player already understands "signals take time" from watching dots travel, now they're learning to measure it). The term should be introduced at Mission 4-5, well after the player has felt the phenomenon. The Latency Ruler unlock at Mission 5 is the "naming what you already know" moment — pure Category A when it arrives.

### × One-Shot-One-Kill
In a game with HP bars, 2 ticks of extra latency means 2 extra hits — unfortunate but recoverable. In a one-shot-one-kill game, 1 tick of extra latency can mean permanent unit loss. This amplifies the importance of latency legibility dramatically. The player MUST understand latency because the margin for error is zero. The latency budget's threat-closure calculation is most meaningful in this context.

### × Audio Identity Per Channel (6.02d)
If each channel has a unique sonic motif, then signal latency becomes audible as rhythm. A 1-hop chain: *ting* (send) — pause — *TING* (arrive). A 3-hop chain: *ting* — pause — *tong* — pause — *tang* — pause — *TING*. The inter-motif spacing IS the latency. Players who learn to hear the rhythm can diagnose latency by ear during sealed watch without any visual overlay. This is the "hear my relay is overloaded because the whoops are too fast" pattern from the Screeps audio design space.

### × Mobile / Touch Adaptation
The Latency Ruler's wavefront overlay works well on touch — long-press a unit to see its latency wavefronts. The ETA overlay badges need to be large enough to read on mobile (minimum 24px diameter). The signal chain view in the Inspector needs horizontal scrolling for chains longer than 3 hops on portrait orientation. The hop counter pips need to be larger on mobile (8px vs. 4px on desktop).

---

## Comparable Games

### Into the Breach — The Gold Standard for Consequence Preview
Into the Breach shows you exactly what will happen before you act. Every enemy attack is telegraphed. Every consequence is previewed. "You can check the order events will happen in to see if an environmental factor will kill an enemy before it attacks." The ETA overlay (Level 3) applies the same principle: show the player exactly when signals will arrive before they execute. Into the Breach proves players WANT this information and will use it well.

### TIS-100 — The Cautionary Tale of Implicit Latency
TIS-100 makes signal propagation delay the core difficulty but provides zero visualization. Players report "trouble even attempting to visualize problems" and that "it has to happen in code." One player found success by thinking about it "like an electrical circuit" — a cognitive frame shift the game doesn't help with. Robot Uprising must avoid this: the game should help players build the circuit-thinking frame, not require them to discover it independently.

### Factorio — The External Tool Demand Signal
Factorio's circuit network has tick-level delays that are invisible during normal gameplay. The community built Cnide (an external Circuit Network IDE) specifically to visualize tick-by-tick signal propagation. The official game recommendation is "use the editor's tick-once keybinding." When the community builds external tools to solve a visualization problem, that's a design signal: the information should be in-game. Robot Uprising's Latency Ruler is the tool Factorio players wish they had.

### SpaceChem — Pipeline Buffering as Emergent Latency
SpaceChem players discovered that pipe length between reactors acts as a throughput buffer — longer pipes absorb timing mismatches between fast and slow reactors. This is accidental context window design: the pipe IS the buffer, and its length IS the latency. Robot Uprising's relay chains serve the same function deliberately. The difference: SpaceChem's buffering is discovered accidentally; Robot Uprising should make it legible intentionally.

---

## The TikTok Clip

**"One Hop, One Kill."** Split screen: left shows the plan screen with a T+4 latency path highlighted in red. The player cuts two relays, dropping to T+2. Right shows the sealed watch — the enemy approaches. The fast signal dot races ahead. The striker intercepts with exactly 0 ticks of margin. Text overlay: "Two hops saved. One life saved." 15 seconds. The latency number is the drama.

**Alt clip: "The Funeral Was 1 Tick Away."** Inspector view. Signal chain shows T+3 arrival. Enemy at lethal range at T+3. Counterfactual overlay: old architecture at T+4. Text: "If I hadn't cut that relay..." The amber ghost chain extends one tick past the kill. The margin was 1 tick. The architecture change was the difference. 10 seconds. Pure tension from a number.
