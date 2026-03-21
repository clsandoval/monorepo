# 2.14a — Dynamic Connectivity as Emergent Gameplay

**Aspect:** When mobile agents (scouts, strikers, specialists) move in and out of relay range during execution, the information network topology changes every tick. The player's carefully designed channel architecture doesn't hold still — it breathes, fragments, reconnects, and sometimes collapses entirely based on patrol paths and unit movement. Predicting which ticks have full connectivity vs. partial becomes a first-class planning skill. Patrol-path-range intersection visualization becomes a first-class plan screen tool.

**Category:** Core Mechanic (Wave 2)
**Dependencies:** 2.14 (Spatial Routing), 2.00f (No Global Coordinator), 2.00f-i (Relay as Single Point of Failure), 3.10b (Signal Latency Legibility)

---

## The Design Problem

The locked design specifies range-limited transmissions (from the spatial routing analysis: scouts transmit 3 tiles, relays 7 tiles) and mobile units with patrol paths. A scout patrolling A1→A4→D4→D1 will drift in and out of a relay's transmission range as it walks. At tick 3, the scout is at A3 — within 3 tiles of a relay at C4. At tick 5, the scout has moved to D4 — now 1 tile from the relay, well within range. At tick 8, the scout is at D1 — 5 tiles from C4, completely out of scout transmission range, and borderline for relay reception.

This means the network topology is not a static graph the player draws in the plan phase. It is a **time-varying graph** — a different adjacency matrix at every tick. Some ticks have full connectivity (all scouts in range of their designated relays). Some ticks have partial connectivity (the east-flank scout is between relays, transmitting into dead air). Some ticks have zero connectivity (a scout deep behind enemy lines, completely alone, running on stale context).

The player doesn't control movement directly — they configure patrol paths and rules. The connectivity pattern that emerges is a *consequence* of those configurations intersecting with the spatial layout of relays. The player must reason about this intersection during planning, predict the connectivity timeline, and decide whether gaps are acceptable or need to be patched.

This is **dynamic connectivity** — and it is the mechanic that transforms relay placement from a static puzzle into a living, breathing system that rewards spatial-temporal reasoning.

---

## The Connectivity Timeline

At the mechanical level, each tick produces a **connectivity snapshot**: which units can reach which other units via direct transmission or relay chains. The sequence of snapshots across all ticks of a battle is the **connectivity timeline**.

**Key definitions:**

- **Direct link**: Unit A is within transmission range of Unit B. A can send to B this tick.
- **Relay chain**: Unit A → Relay R → Unit B. A is in range of R, R is in range of B. Total latency: 2 ticks (signal arrives at B two ticks after A transmits).
- **Connectivity window**: A contiguous run of ticks during which a particular link is active. Scout S can reach Relay R from tick 4 through tick 9 — that's a 6-tick connectivity window.
- **Blackout window**: A contiguous run of ticks during which a link is broken. The scout is out of range from tick 10 through tick 14 — a 5-tick blackout.
- **Full mesh tick**: A tick where every unit that needs to communicate can reach its designated relay chain. The entire designed architecture is online.
- **Fragmented tick**: A tick where at least one designed communication path is broken. Part of the army is deaf.
- **Dark tick**: A tick where a unit has no communication path to any relay or command unit. It is operating purely on stale context.

**The rhythm:** In a well-designed architecture, the connectivity timeline has a rhythm — windows of full connectivity punctuated by brief blackouts as scouts swing through the far end of their patrol. The player learns to read this rhythm. "My east scout goes dark for 3 ticks every patrol cycle. That's fine — the relay has a 12-slot buffer, it can hold compressed intel for 3 ticks until the scout swings back. But if an enemy appears during those 3 dark ticks, nobody on the east flank knows."

**The catastrophe:** In a poorly designed architecture, the rhythm is erratic — long blackouts, brief windows, scouts spending most of their patrol out of range. The player's plan screen showed a beautiful channel map, but on the battlefield, most of those channels are dead air most of the time. The army stumbles around half-blind, context windows filling with stale data, rules matching on outdated signals. The player watches the sealed execution and wonders why nothing is working — and the inspector reveals the answer: the architecture was designed for a static board, but the board moves.

---

## The Plan Screen Tool: Patrol-Path-Range Intersection Visualizer

This is the first-class tool that makes dynamic connectivity plannable. It lives on the plan screen, overlaid on the tactical map preview.

### What It Looks Like

The tactical map (normally a small preview in the corner of the workbench-dominant plan screen) expands to half-screen when the player activates the **Connectivity Forecast** tool — a toggle button with an icon of overlapping circles and a small clock.

**The base layer:** The 8x8 grid with terrain, spawn points, and relay positions marked. Each relay shows its transmission range as a translucent circle (or diamond, for Manhattan distance) — a soft cyan glow, like a cell tower coverage map.

**The patrol layer:** Each scout's configured patrol path is drawn as a dotted line connecting waypoints. The line is color-coded per unit (scout-1 in amber, scout-2 in teal). A small unit icon slides along the path at 1 waypoint per tick, showing the scout's predicted position at each tick. The player can scrub a **planning timeline slider** at the bottom of the map to advance or rewind the predicted positions.

**The intersection layer:** Where a patrol path enters a relay's transmission range, the path line turns solid and bright. Where it exits range, the line returns to dotted and dim. The transition points are marked with small diamonds — entry diamonds (green, solid) and exit diamonds (red, hollow). These diamonds are the critical moments: "tick 7, scout enters relay range" and "tick 12, scout exits relay range."

**The connectivity bar:** Below the map, a horizontal bar spans all predicted ticks (say, 40 ticks for a typical battle). Each tick is a thin vertical stripe. Green stripe = full mesh (all designed links active). Amber stripe = partial (at least one link broken but primary chains intact). Red stripe = critical (a unit with no communication path at all). The bar looks like a DNA barcode — dense green with periodic amber and red gaps. The player's goal is to minimize red, tolerate amber, and ensure green covers the ticks that matter most (early-battle scouting, mid-battle engagement, late-battle coordination).

**The hover detail:** Hovering over any tick on the connectivity bar highlights the corresponding unit positions on the map and draws active links as solid cyan lines, broken links as dashed red lines. The player can see exactly which connections exist at that tick and which don't. Hovering over a red stripe shows which unit is isolated and why — "Scout-1 at D1, nearest relay at C4, distance 5 tiles, scout range 3 — out of range."

### The Scrubber Experience

The planning timeline scrubber is not just informational — it's the primary tool for diagnosing and fixing connectivity problems. The player drags the scrubber and watches unit icons slide along patrol paths, relay range circles stay fixed, and the intersection highlights flicker on and off. It is a **time-lapse of the network topology** compressed into a draggable slider.

When the player sees a red stripe, they scrub to that tick, see which unit is dark, and then have several options:

1. **Adjust the patrol path.** Drag the scout's waypoints closer to the relay. Trade scouting coverage for connectivity.
2. **Move the relay.** Drag the relay position to extend coverage toward the patrol's far end. Trade centrality for reach.
3. **Add a second relay.** Place a relay at the far end of the patrol route, creating a handoff — the scout is always in range of at least one relay. Expensive but reliable.
4. **Shorten the patrol.** Reduce the patrol loop so the scout never leaves range. Trade scouting depth for constant connectivity.
5. **Accept the gap.** Some blackouts are tolerable. If the far end of the patrol is a low-threat area, 3 ticks of darkness might be acceptable. The player makes a conscious risk assessment.

Each adjustment updates the connectivity bar in real-time. The player iterates: adjust, scrub, check, adjust again. The planning loop tightens until the connectivity timeline looks acceptable.

---

## How It Creates Interesting Decisions

### The Coverage-Connectivity Tradeoff

The fundamental tension: scouts need to patrol **wide** to cover more board area (detecting enemies early, tagging resource nodes), but wide patrols take them **far from relays**, creating blackout windows. A scout that stays within relay range at all times is a scout that only covers a 3-tile radius around the relay — barely more than the relay could see itself if it had perception (which it doesn't).

The player is always choosing: how much connectivity am I willing to sacrifice for how much coverage? This is a **slider, not a switch** — every patrol path modification shifts the ratio. Veterans learn to find the sweet spot for each mission: aggressive scouting with planned blackouts on open maps, tight connectivity on defensive missions where information latency kills.

### The Relay Handoff Pattern

Advanced players discover the **handoff**: two relays positioned so that a scout's patrol path crosses from one relay's range into the other's. The scout is always in range of at least one relay, but never in range of both simultaneously. The scout's hooks broadcast on a shared channel, and both relays listen and forward. The downstream striker receives from whichever relay is active.

The planning tool visualizes this beautifully: the patrol path is solid-bright through Relay-A's circle, then brief overlap (both solid — the handoff zone), then solid-bright through Relay-B's circle. The connectivity bar shows unbroken green. The cost is two relays instead of one, but the benefit is zero blackout on a wide patrol.

This is an emergent strategy — the game never teaches it explicitly. The player discovers it by dragging relay positions and watching the connectivity bar turn green. The inspector, after a successful mission using the handoff pattern, reveals why it worked: "Scout-1 transmitted to Relay-A on ticks 1-8, transmitted to Relay-B on ticks 7-15, handoff overlap on ticks 7-8 ensured no signal gap."

### The Burst-Transmit Gambit

When a scout knows (from its context) that it's about to exit relay range, it can fire multiple hook transmissions in a single tick — dumping everything it has observed into the channel before going dark. This front-loads information delivery into the last connectivity tick, giving the relay a burst of data to process during the blackout.

The player configures this by adding a rule: `IF relay_range_edge → transmit_all_context`. The scout's context window empties in one burst. The relay receives a flood — potentially overwhelming its own buffer if not configured with enough capacity. The player must balance burst size against relay buffer headroom.

**The EM cost:** Burst transmissions are loud. A scout dumping 6 context slots in one tick generates 6x the normal EM signature. Every enemy unit within detection range hears the burst. It's a beacon saying "scout here, about to go dark, this is where the patrol path swings wide." Smart enemy configurations (in later missions) learn to exploit burst patterns — waiting for the burst, then rushing the gap.

### Connectivity-Aware Rule Writing

Players learn to write rules that account for connectivity state. Instead of "IF enemy_spotted → transmit on threat-east," a veteran writes:

- Rule 1: `IF enemy_spotted AND in_relay_range → transmit on threat-east` (normal report)
- Rule 2: `IF enemy_spotted AND NOT in_relay_range → store_in_context(priority: critical)` (buffer it for later)
- Rule 3: `IF in_relay_range AND context_contains(priority: critical) → transmit on threat-east` (dump stored intel when back in range)

This three-rule pattern creates a **store-and-forward** scout — it remembers what it saw during blackout and transmits when connectivity resumes. The cost is context window space: stored intel occupies buffer slots, potentially evicting other observations. The player must configure eviction priorities to protect stored intel from being evicted by routine observations.

The inspector reveals this pattern after battles: "Scout-1 spotted enemy at tick 9 (blackout). Stored in context slot 4 (priority: critical). Re-entered relay range at tick 12. Transmitted stored intel on threat-east. Relay received at tick 13. Striker received at tick 14. Engagement at tick 16." The 7-tick delay (scout spotted enemy at 9, striker engaged at 16) is the cost of the blackout — and the player can read exactly where each tick went.

---

## Strengths

- **Teaches real distributed systems thinking.** Network partitions, store-and-forward protocols, handoff patterns — these are actual concepts from distributed computing, experienced as gameplay rather than lecture. A player who masters dynamic connectivity has intuition about CAP theorem tradeoffs without ever hearing the term.
- **Creates a planning meta-game.** The connectivity forecast tool gives veterans a deep planning puzzle beyond "which skills to equip." Optimizing patrol-relay geometry is a spatial optimization problem with clear visual feedback and satisfying iteration loops.
- **Generates dramatic moments.** A scout spotting an enemy during a blackout window — frantically storing the observation, racing back toward relay range, the player watching the sealed execution knowing the information is trapped — is a heart-pounding scenario that emerges naturally from the mechanics.
- **Rewards mission replay.** The same mission with different patrol-relay configurations produces different connectivity timelines, which produce different battle outcomes. The replay is in the planning, not the execution.
- **Scales with player skill.** Beginners keep scouts close to relays (simple, safe, limited coverage). Intermediates learn to tolerate blackouts. Veterans master handoffs, burst transmits, and store-and-forward patterns.

## Weaknesses

- **Cognitive load in planning.** Reasoning about time-varying network topology is hard. The connectivity forecast tool helps, but some players will find the scrubber overwhelming, especially when managing 3-4 scouts with different patrol paths simultaneously. The tool must be optional — the game should be playable (if suboptimally) without it.
- **Execution opacity.** During sealed watch, the player can't see the connectivity state. They see units moving and signals flashing, but they can't see "this signal was lost because the scout was out of range." The drama of blackouts only becomes visible in the inspector, after the emotional sealed watch. This is by design (sealed watch is for feeling, inspector is for understanding), but it means first-time players won't understand why their scouts seem unresponsive.
- **Patrol path determinism.** If patrol paths are fully deterministic, the connectivity timeline is fully predictable — the planning tool shows exactly what will happen. This removes the surprise of "unexpected blackout" but also removes a source of emergent drama. The locked "invisible randomization" spec suggests some variance within constraints, which helps: the scout's patrol might vary by +/- 1 tile, making the connectivity timeline probabilistic rather than certain at the margins.
- **Complexity ceiling for later missions.** With 5+ scouts, 3+ relays, and patrol paths crossing and overlapping, the connectivity timeline becomes a dense tangle. The tool must handle this gracefully — perhaps showing per-channel connectivity bars rather than a single aggregate, so the player can diagnose one communication path at a time.

---

## Interaction Effects

- **Relay as Single Point of Failure (2.00f-i):** Dynamic connectivity amplifies the SPOF problem. A relay that is the sole bridge for a scout during a narrow connectivity window — destroy it during that window and the scout's stored intel is trapped forever. The handoff pattern is both a connectivity solution and a SPOF mitigation.
- **EM Emissions Model:** Burst transmits at range boundaries create EM hotspots at predictable locations. Enemy configurations that detect EM can learn to ambush at patrol turnaround points — the loudest, most predictable moments in the connectivity cycle.
- **Context Overload:** Burst transmits risk overloading relay buffers. A scout dumping 6 entries into a relay that already has 10/12 slots filled triggers overload → relay stunned for 1 tick → relay can't forward signals → downstream units go dark for an extra tick. The burst intended to prevent information loss causes information loss through a different mechanism.
- **Signal Latency:** The store-and-forward pattern adds latency on top of the existing 1-tick-per-hop latency. A scout that stores intel for 3 blackout ticks, then transmits through a relay chain, delivers information 5+ ticks after the original observation. In a one-shot-one-kill game, 5-tick-old intel about enemy position might be worse than no intel — the enemy has moved, and the striker charges to an empty tile.
- **Plan Screen Layout:** The connectivity forecast tool needs significant screen real estate. It competes with the workbench for space. The "expand tactical map to half-screen" interaction needs to feel fluid — probably a toggle or a keyboard shortcut (Tab?) that slides the workbench right and the map left, with a smooth animation.

---

## Comparable Games

- **Into the Breach:** Perfect information, but the player must reason about future states — "if I move here, the enemy will target there." Dynamic connectivity is the same cognitive skill applied to information flow rather than combat positioning. The connectivity forecast tool is Robot Uprising's equivalent of Into the Breach's damage preview arrows.
- **XCOM (Long War):** Overwatch traps and line-of-sight management. Soldiers moving into and out of cover, flanking angles opening and closing as units reposition. The dynamic nature of "who can see whom" is analogous to "who can transmit to whom."
- **Factorio:** Belt throughput varies as inserters activate and deactivate, production chains back up and clear. The rhythm of a Factorio factory — bursts of activity, brief stalls, throughput graphs oscillating — is the same rhythm as a dynamic connectivity timeline. Factorio players who learn to read throughput graphs will immediately understand the connectivity bar.
- **Screeps:** Players program units in JavaScript, and communication between creeps depends on proximity and room boundaries. The "room edge" in Screeps — where creeps transitioning between rooms lose contact with creeps in the previous room — is a hard version of the relay range boundary.
- **StarCraft (Sensor Towers and Overlords):** Mobile detection (overlords) drifting in and out of useful positions. A mispositioned overlord means a surprise dark templar wipe. The visceral "I didn't see it coming because my detection wasn't where it needed to be" is exactly the feeling of a scout going dark at the wrong tick.

---

## Sensory Description

### The Plan Screen Connectivity Forecast

The tactical map glows softly when the Connectivity Forecast is active — the grid lines dim to charcoal, terrain fades to 40% opacity, and the relay range circles bloom into view as soft cyan halos with gently pulsing edges. Each relay's circle has a slight gradient: bright at center, fading toward the edge, making the range boundary feel like a signal strength falloff rather than a hard wall.

Patrol paths appear as chains of small diamonds (waypoints) connected by lines. Inside relay range, the line is a bright, warm amber — confident, connected. Outside relay range, the line turns to a thin, cool grey dash — fading, uncertain. The transition point where the line changes color has a small animated sparkle: green flash when entering range (connection established), red flash when exiting (connection lost).

The connectivity bar at the bottom hums with activity. Green stripes glow steadily, like status LEDs on healthy servers. Amber stripes pulse gently — a heartbeat of concern. Red stripes flash sharply, once per second — an alarm, a gap in the network. Hovering over a red stripe dims the entire map except for the isolated unit, which pulses bright white against the darkened board, alone and screaming for attention.

The scrubber handle is a vertical line of white light. Dragging it feels weighty — there's a slight snap-to-tick behavior, like scrubbing through video frames. Each tick advance produces a tiny click sound (like a relay switching) and the unit icons slide one step along their paths. The range circles stay fixed. The intersection highlights flicker. The player is watching the future unfold, one tick at a time, looking for the moment the network breaks.

### The Sealed Watch — Connectivity in Action

During execution, the player can't see range circles or connectivity state. But connectivity makes itself *felt* through signal chain visualizations. When a scout transmits and a relay receives, a thin cyan line zips from scout to relay — a data packet rendered as a brief streak of light. When the scout is in range, these lines fire reliably, every tick or every few ticks, a steady pulse of information flowing through the network.

When the scout exits range, the lines stop. There's no explicit "connection lost" indicator — just *absence*. The relay stops receiving. The striker stops getting orders. The scout keeps moving, alone in the dark, its context bar slowly filling with unshared observations. The unit's tile has a subtle visual shift: a faint static overlay, like a TV losing signal, barely perceptible but enough to convey isolation to attentive players.

When the scout re-enters range and fires a burst transmission, the screen lights up: multiple cyan lines fire simultaneously from the scout to the relay, a sudden flare of data after silence. If the relay handles it cleanly, the lines streak onward to the striker. If the relay overloads — too many signals at once — the relay's tile flashes amber, sparks jitter around its sprite, and the forwarding lines stutter and die for one tick. The relay recovers, but the burst cost one tick of downstream silence.

The whole rhythm is visible to the attentive player: pulse... pulse... pulse... silence... silence... silence... BURST... stutter... pulse... pulse. The network breathes. The player, watching sealed, can't intervene — but they can *read* it, and they start planning the next attempt in their head before the battle even ends.

### The Inspector — Reading the Connectivity Timeline

In the inspector, the connectivity timeline is fully exposed. The scrubber from the plan screen returns, but now it shows what *actually happened* rather than what was *predicted*. The connectivity bar is rendered with surgical precision: each tick stripe is annotated with the exact set of active links. Clicking a tick shows the board state with all range circles, all active links (solid cyan), all broken links (dashed red), and each unit's context window contents at that moment.

The "aha" moment lives here. The player scrubs to the tick where things went wrong, sees the scout at position D1, sees the relay at C4, sees the dashed red line between them, sees the scout's context window holding a critical enemy sighting with nowhere to send it. They scrub forward: the scout moves to D2... D3... C3 — the line turns solid. The scout transmits. But 5 ticks have passed. The enemy has moved. The striker charges the wrong tile. The player exhales and thinks: "I need to shorten that patrol, or add a relay at E2."

---

## Player Journeys

### Journey: Dani, 23, Mobile Game Player (Casual)

**Context:** Mission 3 (tutorial phase, pre-placed units). Dani has learned context windows and basic rules. This mission introduces hooks and channels for the first time. Two scouts, one relay, one striker — all pre-placed. The mission objective: detect and eliminate two enemy scouts crossing the board.

**Minute 0:00 — The New Tool**
Dani opens the plan screen. The workbench shows two scout blueprints and a relay blueprint, pre-configured with hooks. This is the first time hooks have appeared. A boot log message glows in the upper left: "COMMUNICATION SUBSYSTEM ONLINE. Channels detected: threat-east. Signal range: limited by transmission power. Monitor coverage." Dani reads it, half-understanding. The tactical map preview is in the bottom-left corner — an 8x8 grid showing two scouts (amber dots) at B2 and F2, a relay (cyan dot) at D4, and a striker (red dot) at D6. The scouts have patrol paths drawn as dotted amber lines: Scout-1 patrols B2→B5→E5→E2→B2. Scout-2 patrols F2→F5→C5→C2→F2.

**Minute 0:30 — Noticing the Glow**
Dani notices the relay at D4 has a faint cyan circle around it — its transmission range, shown by default since this mission introduces spatial communication. The circle covers roughly a 7-tile radius. Both scouts' patrol paths mostly fall inside this circle, but Scout-1's path at B2 (the starting position) is right at the edge. Dani doesn't think much of it. The workbench shows the pre-configured hooks: each scout broadcasts on `threat-east` when it spots an enemy, and the relay forwards compressed signals on `strike-orders` to the striker.

**Minute 1:00 — First Execute**
Dani hits EXECUTE. The sealed watch begins. Tick clock appears at the top. Units snap into position. The first few ticks are quiet — scouts move along their patrol paths, cyan signal lines occasionally zipping from scouts to relay as they report "all clear." The network is humming.

**Minute 1:30 — The Silence**
Around tick 8, Scout-1 reaches position B2 — the far corner of its patrol. Dani notices something: the cyan signal lines from Scout-1 stop appearing. The scout is still moving, still scanning, but no lines connect it to the relay. Dani doesn't understand why. Meanwhile, an enemy scout appears at A3 — right next to Scout-1's position. Scout-1's context bar fills with a bright entry (enemy detected!), but no signal line fires. The relay doesn't react. The striker doesn't move. The enemy scout walks past, uncontested.

**Minute 2:00 — The Other Scout Saves It**
Scout-2, still within relay range, spots the enemy at C4 on tick 12 — four ticks later. Signal fires to relay, relay forwards to striker, striker engages at tick 14. The enemy is eliminated, but it's late. The second enemy, undetected, reaches the base at tick 18. Mission fails.

**Minute 2:30 — The Inspector Revelation**
The inspector opens. Dani clicks Scout-1 at tick 8 and sees the context window: slot 3 holds "ENEMY AT A3 — priority: high." But the decision trace shows: "Hook: transmit on threat-east → FAILED: no receiver in range." The word "range" is highlighted in amber. Dani scrubs to tick 7 — the signal line is active. Tick 8 — gone. The scout moved one tile and lost contact. Dani mutters "oh, it's like WiFi range..."

**Minute 3:00 — The Fix**
Back on the plan screen, Dani adjusts Scout-1's patrol path. She drags the B2 waypoint to C2 — one tile closer to the relay. The connectivity forecast isn't available in mission 3 (it's a later unlock), but the relay range circle on the map makes it clear: C2 is inside the cyan glow, B2 is on the edge. She re-executes. This time, Scout-1 stays in range throughout its patrol. The enemy at A3 is detected at tick 8, signal reaches the striker by tick 10, engagement at tick 11. Mission complete.

**Minute 3:30 — The Tradeoff Realization**
Dani notices that by pulling Scout-1's patrol inward, it no longer covers the A-column at all. If enemies had spawned at A1 or A5, they'd be invisible. She thinks: "I need a bigger range, or another relay..." The mission debrief shows a stat: "Network uptime: 100% (improved from 78%)." Dani nods. She's starting to understand: coverage vs. connectivity. You can't have both with one relay.

**UI Annotations:**
- **Relay range circle**: Soft cyan glow, always visible on plan screen during mission 3, radius ~7 tiles centered on relay position, fades at edges
- **Signal line (active)**: Thin cyan streak from transmitter to receiver, appears for 0.3 seconds then fades, pulses every tick during active communication
- **Signal line (failed)**: Not shown during sealed watch — absence is the indicator. Inspector shows dashed red line with "NO RECEIVER IN RANGE" label
- **Context entry (undelivered)**: In inspector, the stored observation glows amber instead of the normal cool blue, with a small "unsent" tag

---

### Journey: Marcus, 31, Software Engineer (Intermediate)

**Context:** Mission 6 (factory phase). Marcus has beaten the tutorial missions and understands hooks, channels, and relay placement. This mission gives him a factory, blueprints, and a larger board with 3 planned scouts, 2 relays, and 2 strikers. The Connectivity Forecast tool unlocks for the first time. The mission objective: destroy an enemy factory on the far side of the board while defending his own.

**Minute 0:00 — The New Tool**
The boot log reads: "NETWORK ANALYSIS MODULE ONLINE. Connectivity Forecast available. Predict network topology across tick timeline. Activate: [Tab] or click the overlapping-circles icon." Marcus hits Tab. The tactical map slides from the corner to half-screen, the workbench compresses to the right half. The board dims to a deep charcoal. Relay range circles bloom: Relay-A at C3 (cyan circle, 7-tile radius) and Relay-B at F5 (cyan circle, 7-tile radius). The circles overlap slightly around D4-E4 — a coverage seam.

**Minute 0:45 — Drawing Patrol Paths**
Marcus configures Scout-1 to patrol the west flank: A1→A4→D4→D1. As he drags waypoints, the patrol line appears on the map. Inside Relay-A's range, the line is bright amber. At the A1 waypoint — 4 tiles from Relay-A — the line turns grey-dashed. A red diamond appears at the transition point between A2 and A1: "Exit range, tick ~4." The connectivity bar at the bottom shows its first red stripe. Marcus grimaces.

He configures Scout-2 for the east flank: H1→H4→E4→E1. Same issue: H1 is outside Relay-B's range. Red stripes appear on the east side of the connectivity bar. Scout-3 gets a center patrol: C1→C4→F4→F1 — entirely within the relay overlap zone. Its connectivity bar segment is solid green.

**Minute 2:00 — The Handoff Discovery**
Marcus stares at the two red gaps. He could shorten the patrols, but then the flanks are blind. He could add relays, but that's 10 minerals he needs for strikers. He drags Relay-A one tile west, to B3. The west relay circle shifts — now covering A2 and A3, but no longer overlapping with Relay-B. Scout-1's line turns mostly amber... but a new red gap appears in the center where the relays no longer overlap. Scout-3's connectivity breaks.

Marcus drags Relay-A back to C3. He thinks. Then he tries something: he adds a third relay at A3, deep in the west flank. It costs 5 minerals. Scout-1's patrol path now passes through *both* Relay-A (C3) and the new Relay-C (A3). The west segment of the connectivity bar turns green — the scout is always in range of at least one relay. Marcus has discovered the handoff pattern without anyone teaching it to him.

He checks the cost: 15 minerals for three relays vs. 10 for two. He checks the connectivity bar: all green except for a brief amber stripe where Scout-2 hits H1 on the east flank. He decides the east gap is acceptable — it's only 2 ticks, and the east flank is closest to his base where the striker can respond quickly anyway.

**Minute 3:30 — Channel Wiring for Handoff**
Marcus realizes the handoff requires both Relay-A and Relay-C to forward on the same downstream channel. He opens Scout-1's hook config: transmit on `west-intel`. Opens Relay-A: listen `west-intel`, compress, forward on `strike-west`. Opens Relay-C: listen `west-intel`, compress, forward on `strike-west`. Both relays forward to the same channel. The striker listens on `strike-west` and receives from whichever relay is in range of the scout at that tick.

But wait — during the handoff overlap (ticks 7-8 of the patrol cycle), *both* relays receive and forward the same signal. The striker gets duplicate messages. Marcus adds a deduplication rule to the striker blueprint: `IF context_contains(duplicate_signal) → evict_oldest_copy`. This prevents the striker's 8-slot buffer from filling with redundant intel during handoff ticks. The connectivity bar stays green. The cost is one rule slot on the striker blueprint — a real cost, given the limited slots.

**Minute 5:00 — Execute and Verify**
Marcus hits EXECUTE. The sealed watch unfolds. The west flank hums: Scout-1 patrols its loop, signal lines zipping to Relay-A, then seamlessly switching to Relay-C as the scout swings west, then back to Relay-A on the return. The handoff is invisible unless you watch closely — the line just always exists, changing which relay it targets. The east flank has a brief gap at H1 — two ticks of silence — but no enemy appears during those ticks. The mission succeeds.

**Minute 6:00 — Inspector Verification**
In the inspector, Marcus clicks the connectivity timeline. He sees the handoff in data: "Scout-1 → Relay-A: ticks 1-6, 13-18, 25-30..." and "Scout-1 → Relay-C: ticks 5-12, 17-24, 29-36..." with overlap on ticks 5-6, 13, 17-18, etc. The deduplication rule fired 8 times — 8 duplicate messages caught and evicted. Marcus nods: the system works. He screenshots the connectivity timeline for his mental library of patterns. "Three relays, handoff, dedup rule. Got it."

**UI Annotations:**
- **Connectivity Forecast toggle (Tab)**: Slides tactical map to 50% screen width with 300ms ease-out animation, darkens terrain, reveals range circles and patrol overlays
- **Planning timeline scrubber**: Horizontal slider spanning 40 predicted ticks, snaps to integer tick values with a subtle click sound, unit icons animate along patrol paths as scrubber moves
- **Connectivity bar (green)**: Thin horizontal stripe, steady soft green glow, no animation — stable
- **Connectivity bar (amber)**: Gentle pulse at 1Hz, amber-gold color, conveys "degraded but functional"
- **Connectivity bar (red)**: Sharp flash at 2Hz, warning red, conveys "unit isolated"
- **Relay range circle**: Translucent cyan, radial gradient (bright center, fading edge), stays fixed as scrubber moves
- **Patrol path (in range)**: 3px solid amber line, connects waypoint diamonds
- **Patrol path (out of range)**: 1px dashed grey line, same waypoint diamonds but dimmed
- **Entry/exit diamonds**: 8px diamonds at transition points — green-filled for entry, red-hollow for exit, appear with a brief scale-up animation when the patrol path is first drawn

---

### Journey: Reina, 28, Factorio Veteran (Expert)

**Context:** Mission 9 (penultimate mission, full factory vs. factory). Reina has mastered handoffs, burst transmits, and store-and-forward. She runs five scouts, three relays, a command unit, and a rolling production queue of strikers. The enemy factory is aggressive, producing fast enemy scouts that jam her communication channels with EM noise. The mission objective: destroy the enemy factory before her network is overwhelmed.

**Minute 0:00 — The War Room**
Reina opens the Connectivity Forecast immediately — she hasn't looked at a plan screen without it since mission 6. The board is complex: Relay-A at C3, Relay-B at F3, Relay-C at D6 (deep position, near the enemy half). Command unit at D2 (rear, protected). Five scout patrol paths crisscross the board in interlocking loops, color-coded: amber, teal, magenta, lime, white. The connectivity bar is dense with information — she's looking at 60 predicted ticks of a longer battle.

The bar is mostly green, with three amber patches (known handoff transition ticks where one scout briefly has single-relay coverage instead of double) and one red patch: Scout-5 (white) has a deep patrol behind enemy lines that takes it completely out of all relay range for ticks 22-28. Seven ticks of total darkness.

**Minute 1:00 — The Store-and-Forward Configuration**
Reina configures Scout-5 with the store-and-forward rule set she's perfected over previous missions:

- Rule 1: `IF enemy_spotted AND in_relay_range → transmit on deep-intel` (immediate report)
- Rule 2: `IF enemy_spotted AND NOT in_relay_range → store(priority: critical, tag: deep-recon)` (buffer it)
- Rule 3: `IF in_relay_range AND context_has(tag: deep-recon) → burst_transmit on deep-intel` (dump everything on reconnect)
- Rule 4: `IF context_fill > 80% AND has(tag: deep-recon, count > 3) → compress_oldest(deep-recon)` (self-compress to avoid overload)

Rule 4 is the expert touch: the scout compresses its own stored observations if the buffer gets too full during the blackout, so the burst transmit on reconnection doesn't overflow the relay. Scout-5 has a 6-slot buffer. During 7 dark ticks, it might accumulate 4-5 observations. Rule 4 compresses them into 2 slots. The burst transmit sends 2 compressed entries instead of 5 raw ones — the relay at Relay-C (12-slot buffer, currently averaging 7 slots used) can absorb the burst without overloading.

**Minute 2:30 — The EM Trap**
Reina knows from mission 8 that the enemy AI detects burst transmissions and routes interceptors to the emission source. Scout-5's burst at tick 28 (when it re-enters Relay-C's range) will be loud — 2 compressed entries is still 2x normal EM output. She checks the map: Relay-C is at D6, near the enemy half. If the enemy detects the burst and traces it to Relay-C's vicinity, they might send a striker to destroy the relay — and Relay-C is her only deep-field node.

Reina adds a decoy hook to Scout-3 (lime, patrolling the center): at tick 27, Scout-3 fires a dummy transmission on a throwaway channel called `noise-west`. The dummy transmission generates EM noise at C4 — two tiles west of Relay-C. The enemy AI (if it's pattern-matching on EM spikes) should vector toward C4 instead of D6. Scout-3's transmission costs one hook slot and one context entry to generate, but it creates a 1-tick EM diversion.

The connectivity bar doesn't change — the decoy doesn't affect real signal routing. But Reina makes a mental note: "tick 27, decoy fires at C4. Tick 28, Scout-5 bursts at D6. If the enemy takes the bait, Relay-C survives."

**Minute 4:00 — The Adaptive Patrol Emergency**
Reina notices something while scrubbing the timeline. At tick 35, the enemy factory is predicted to have spawned 4 enemy scouts (based on its known production rate from the mission briefing). Those enemy scouts will be patrolling the D-E columns — right through Relay-C's position. If an enemy scout reaches D6, Relay-C is destroyed (one-shot, one-kill, relays have no combat skills).

She needs a striker near D6 by tick 35. But her striker production queue has Striker-3 spawning at tick 30, and it takes 5 ticks to move from the factory at D1 to D6. That's tick 35 — exactly on time, assuming the striker moves directly there. She adds a rule to Striker-3: `IF tick > 29 → move_toward(D6)`. A hard-coded rush to defend the deep relay.

But this burns Striker-3's rules slot — it can't carry a normal engagement rule. Reina configures it as a pure relay defender: `Rule 1: IF tick > 29 → move_toward(D6). Rule 2: IF enemy_adjacent → engage.` Two rules, minimal flexibility, maximum focus. The striker exists to keep Relay-C alive. She names the blueprint "Relay Guardian" and adds it to the production queue at position 3.

**Minute 5:30 — Final Connectivity Check**
Reina scrubs the full timeline one last time. The connectivity bar: green from ticks 1-21, amber at 22 (Scout-5 entering blackout, but other scouts maintain coverage elsewhere), red from 22-28 (Scout-5 dark — acceptable, store-and-forward configured), amber at 28-29 (burst transmit and relay processing), green from 30-55 (full network, Relay Guardian in position by tick 35, decoy hiding Relay-C's location). She nods. The red stripe is planned, managed, and mitigated. The amber patches are handoff transitions. The green is coverage.

She hits EXECUTE.

**Minute 6:00 — The Sealed Watch Payoff**
The battle unfolds. The first 20 ticks are a machine: scouts pulsing signals to relays, relays compressing and forwarding, strikers engaging enemies with precision. At tick 22, Scout-5 disappears behind enemy lines. The signal lines from that scout go quiet. Reina watches, hands gripping the desk edge. She knows the scout is seeing things — enemy positions, factory output, patrol patterns — and storing them in a 6-slot buffer, compressing as it goes.

Tick 27: a flash of EM from C4 — the decoy fires. An enemy striker pivots west toward the false signal.

Tick 28: Scout-5 re-enters Relay-C's range at E6. Two bright cyan streaks fire from the scout to Relay-C — the burst. Relay-C's context bar spikes from 7/12 to 9/12, then starts compressing. Forwarded intel reaches the command unit at D2 by tick 30. The command unit, with its 14-slot buffer and `prioritize` skill, evaluates the deep-recon intel and reroutes Striker-1 toward the enemy factory.

Tick 35: Relay Guardian arrives at D6 just as an enemy scout rounds the corner at E6. The striker engages — enemy eliminated. Relay-C survives. The network holds.

Tick 42: Striker-1 reaches the enemy factory. Breach skill activates. Factory destroyed. Mission complete.

**Minute 7:30 — The Inspector Deep Dive**
Reina opens the inspector and goes straight to the connectivity timeline. She scrubs to tick 22-28 — the blackout. Scout-5's context window log shows: tick 22: store(enemy_at_F7, priority: critical). Tick 23: store(enemy_at_F6, priority: critical). Tick 24: store(factory_output_rate: 3/tick, priority: critical). Tick 25: Rule 4 fires — compress oldest two entries into "enemy_patrol_F6-F7" (1 slot). Tick 26: store(enemy_factory_position: G7, priority: critical). Buffer at 4/6 — healthy. Tick 28: burst transmit — 3 entries sent, 2 compressed + 1 raw. Relay-C receives, context spikes 7→10/12, within safe margin.

She clicks the EM overlay: tick 27 shows a bright spot at C4 (decoy) and a smaller spot at E6 (Scout-5's burst at tick 28 hasn't happened yet). Tick 28 shows two spots: C4 fading, E6 bright. The enemy striker that pivoted to C4 is now 3 tiles from the actual burst location — the decoy worked. Reina grins. She notes for next time: "Stagger the decoy 2 ticks before burst, not 1. Give the enemy more time to commit to the false trail."

**UI Annotations:**
- **EM overlay (inspector)**: Heatmap layer on the board, warm orange-red spots at emission sources, intensity proportional to EM output, fades over 3 ticks — shows how EM signatures decay
- **Store-and-forward context entries**: In inspector context window detail, stored-but-unsent entries have a small orange clock icon (waiting to transmit), entries successfully transmitted have a green checkmark, compressed entries show a small "2→1" merge indicator
- **Burst transmit visualization**: Multiple signal lines firing simultaneously from one unit, fanning out from the unit tile like a starburst, each line slightly offset to avoid overlap, amber-gold color (hotter than normal cyan — conveying intensity)
- **Relay Guardian arrival**: Striker snapping to grid position adjacent to relay, brief shield-flash animation on the relay tile (cyan ring expands and fades), conveying "this relay is now defended"
- **Deep patrol path (out of all range)**: In connectivity forecast, segments of a patrol path that are outside ALL relay ranges render in pulsing red dash instead of static grey dash — "danger zone" visual treatment

---

## The TikTok Clip

Fifteen seconds. A scout patrolling the edge of the board spots three enemies — the context bar lights up with red entries. It tries to transmit: nothing. The signal line sparks and dies. The scout is alone, out of range, its buffer filling with urgent intel it can't share. Five ticks of silence on the connectivity bar — a flat red line. Then the scout turns the corner of its patrol, slides back into relay range, and FIRES — three compressed bursts streak across the board to the relay, the relay lights up, forwards to two strikers, both pivot simultaneously toward the enemy cluster. The board erupts in coordinated precision. Cut to the connectivity bar: red stripe → green stripe → enemy eliminated markers. Text overlay: **"Your army is only as smart as its signal range."**

---

## Design Recommendations

1. **Introduce dynamic connectivity gradually.** Mission 3 should show the basic range problem (Dani's journey). The Connectivity Forecast tool should unlock at mission 5 or 6 when the factory gives the player enough units to create real topology. Store-and-forward rules should be discoverable by mission 7-8, not taught explicitly.

2. **The Connectivity Forecast must be optional but rewarding.** Casual players should be able to ignore it and still complete missions (with suboptimal connectivity). Veterans should find it indispensable. The tool should never be required to progress — but missions should be noticeably easier when it's used well.

3. **The connectivity bar should persist in the inspector.** The same visual language (green/amber/red stripes) should appear in both the plan screen (predicted) and the inspector (actual), so the player can compare forecast vs. reality. Discrepancies between predicted and actual connectivity (caused by enemy actions disrupting patrol paths) become a learning moment.

4. **Burst transmit should have escalating EM cost.** Sending 1 entry = 1x EM. Sending 3 entries in one tick = 5x EM (superlinear). This prevents the degenerate strategy of "just burst everything every time you re-enter range" and forces the player to decide what's worth the EM risk.

5. **Enemy AI should exploit connectivity gaps in later missions.** By mission 8-9, enemy configurations should detect player patrol patterns and time attacks to coincide with blackout windows — forcing the player to either close the gaps or develop defensive patterns for dark ticks. This is the game teaching network resilience through adversarial pressure rather than tutorial text.
