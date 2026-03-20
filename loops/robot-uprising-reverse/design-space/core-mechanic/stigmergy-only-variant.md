# 2.05e — Stigmergy-Only Variant: Hooks Disabled, Communication Only Through Tile Marks

**Aspect:** 2.05e — Stigmergy-only variant (Model F as primary coordination): a game mode or mission where hooks are disabled and units can ONLY communicate through tile marks — pure environmental coordination
**Wave:** 2 (Core Mechanic Variations)
**Category:** core-mechanic

---

## The Design Question

Model F from the shared buffer analysis (2.05) introduces **stigmergy** — communication through environmental marks, like ant pheromone trails. Units leave colored marks on tiles; other units read those marks through their perception system. No direct unit-to-unit communication. No hooks. No channels. No signals flying across the board. Just marks on the ground.

What if this isn't just a model variant, but a **game mode or special mission** where hooks are completely disabled and stigmergy is the ONLY coordination mechanism? The player must solve problems using environmental communication alone — a fundamentally different design challenge that strips the game to its most primitive coordination layer.

This is the **ant colony** version of Robot Uprising. No phone calls. No radio. Just breadcrumbs.

---

## The Mechanics of Stigmergy

### Tile Marks

A unit with the appropriate skill (any unit type can mark, but Scouts and Specialists are most natural) can place a **mark** on its current tile. A mark has:

- **Type** (player-configured from a small vocabulary): THREAT, SAFE, RESOURCE, PATH, AVOID, CUSTOM_1, CUSTOM_2
- **Intensity** (1-3): How "loud" the mark is. Higher intensity persists longer and is visible from farther away.
- **Color** (auto-assigned by type): Red for THREAT, green for SAFE, blue for RESOURCE, yellow for PATH, purple for AVOID, white for CUSTOM
- **Age** (0-N ticks since placement): Marks decay. Intensity 1 marks last 5 ticks. Intensity 2 marks last 10 ticks. Intensity 3 marks last 20 ticks. After decay, marks dissolve.

### Mark Perception

Units perceive marks within their perception radius, just like they perceive enemies and terrain. A mark within range generates an observation entry in the unit's buffer: `{source: tile, type: MARK, payload: {mark_type, intensity, age, position}}`. This means mark perception COMPETES with other observations for buffer space — a battlefield covered in marks can flood a unit's context window just like a battlefield covered in enemies.

### Mark-Based Rules

Rules can reference mark data:

- `WHEN mark_type(THREAT) AND mark_age < 5 THEN evade_toward(mark_position)` — avoid recent threat marks
- `WHEN mark_type(PATH) THEN move_along(mark_direction)` — follow path breadcrumbs
- `WHEN mark_type(SAFE) AND mark_intensity > 1 THEN patrol_near(mark_position)` — cluster near strongly-marked safe zones
- `WHEN no_marks_visible THEN explore` — no information means go find some

### The Dual-Use with Tagging

Marks on tiles are distinct from tags on units/enemies. Tags mark entities; stigmergy marks mark locations. But they interact: a Scout that tags an enemy on tile D4 could ALSO mark tile D4 as THREAT. Other units see the mark even if the tagged enemy has moved. The mark says "danger WAS here." The tag says "danger IS on that enemy." Temporal vs. spatial information.

---

## Why a Stigmergy-Only Mode?

### 1. It Teaches the Fundamentals

Hooks, channels, and direct signal chains are powerful but can mask poor positional design. A player who builds elaborate hook topologies might never learn that spatial positioning and movement patterns matter. Stigmergy-only forces the player to think SPATIALLY — where units are, where they've been, what trail they leave. This is the foundation that hook-based play builds on.

### 2. It Creates a Radically Different Challenge

In normal play, a Scout sees an enemy and instantly broadcasts on a hook channel. The Striker receives the signal 1-2 ticks later. In stigmergy-only, the Scout sees an enemy, marks the tile, and then... waits. Another unit must WALK to that tile (or within perception range of it) to see the mark. Information travels at the SPEED OF MOVEMENT, not the speed of signal propagation. This transforms the game from a communication-design challenge into a patrol-route-design challenge.

### 3. It's a Natural Constraint Mission

The 10-mission campaign already has missions with specific constraints (Missions 1-4 restrict primitives). A stigmergy-only mission fits perfectly into the "constraint as teacher" pattern. Mission X: "HOOK BUS: OFFLINE. Communication subsystem damaged. Agents must coordinate through environmental markers only." The boot log frames it as a system failure the player must work around.

### 4. It References Real Biology

Ant colonies — among the most successful coordination systems in nature — operate purely through stigmergy. No ant sends a "message" to another ant. They leave pheromone trails. Other ants follow the trails. The trails reinforce with more traffic. Paths emerge. Robot Uprising can teach this biological principle through gameplay.

---

## Six Design Approaches for the Stigmergy-Only Variant

### Approach A — "The Blackout Mission" (Single Campaign Mission)

One mission (likely Mission 4 or an optional side mission) disables hooks entirely. The player has pre-placed units that must coordinate using only marks and movement. The mission is designed to be completable with stigmergy alone — a smaller board, fewer enemies, forgiving timing.

**Strengths:** Low risk. One mission. Players who hate it move on. Players who love it discover a new dimension.
**Weaknesses:** One mission isn't enough to fully explore stigmergy. Players might cheese it with pure combat (ignore coordination entirely).

### Approach B — "The Ant Colony Mode" (Post-Campaign Gauntlet Modifier)

A Gauntlet doctrine (2.00h's Constraint Ratchet) that disables hooks for any mission. Players can opt into it for extra challenge/reward. Pairs well with other constraint doctrines (e.g., "Whisperer" reduces EM + disables hooks = pure stealth stigmergy).

**Strengths:** Replayable. Optional. Combines with other doctrines for layered challenge.
**Weaknesses:** Players who never try the Gauntlet never experience stigmergy. Missing the teaching opportunity.

### Approach C — "The Pheromone Campaign" (Parallel Campaign Track)

An alternate 5-mission mini-campaign (unlocked after completing the main campaign) where ALL missions use stigmergy-only. This mini-campaign introduces stigmergy gradually:

1. **Marking basics:** One Scout, marks visible, follow-the-trail puzzle
2. **Mark types:** Multiple mark types, filter by type
3. **Mark decay:** Intensity/persistence management, refreshing trails
4. **Mark-based formation:** Units self-organize using mark density (swarm behavior)
5. **Stigmergy vs. signal army:** The player's stigmergy army faces an enemy that uses hook-based coordination. Pure environmental coordination vs. direct communication.

**Strengths:** Full teaching arc. Dedicated space to explore stigmergy deeply. The final mission creates a fascinating asymmetric matchup.
**Weaknesses:** Substantial content investment. Might feel like a detour from the main game.

### Approach D — "The Hybrid Integration" (Stigmergy as Always-Available Secondary Channel)

Stigmergy is always available alongside hooks. Marks are a universal skill all units possess. Some missions encourage stigmergy for specific purposes (marking patrol routes, danger zones) while hooks handle real-time coordination. The player learns to use BOTH.

**Strengths:** No artificial constraint. Players discover stigmergy organically when hooks are insufficient (e.g., when a relay dies and hook chains break, marks become the fallback).
**Weaknesses:** Players might never use stigmergy if hooks are always available. The "fallback" use case is reactive, not proactive.

### Approach E — "The Swarm Doctrine" (Stigmergy for Mass Units, Hooks for Elites)

A mid-campaign design pattern where cheap mass-produced units (Scouts) use stigmergy exclusively (no hook slots) while expensive elite units (Command, Relay) use hooks. The player designs two tiers: a stigmergy-based sensor swarm and a hook-based command layer. Information flows up from swarm marks to elite perception.

**Strengths:** Creates a beautiful two-tier architecture. Teaches the difference between decentralized (stigmergy) and centralized (hooks) coordination. Natural unit-type differentiation.
**Weaknesses:** Changes the locked unit stats (Scouts currently have 2 hook slots). Would require a special variant or game mode.

### Approach F — "The Progressive Integration" (RECOMMENDED)

Stigmergy is introduced as a UNIVERSAL SKILL in Mission 4 alongside hooks. The boot log frames it as an alternative communication primitive: "ENVIRONMENTAL INTERFACE: ONLINE. I can mark the world itself. Leave traces of what I've learned for my future selves to find." Missions 4-5 include objectives that reward stigmergy (patrol route marking for resource tagging bonuses). Mission 7 has a "Blackout" phase where hooks fail mid-battle and stigmergy becomes the emergency fallback. The Gauntlet offers "Ant Colony" doctrine for pure stigmergy challenge.

**Strengths:** Full integration into the main campaign. No separate mode needed. Players experience stigmergy in context. The "Blackout" phase creates a memorable dramatic moment.
**Weaknesses:** Adds complexity to an already complex game. Mission 4 is already teaching hooks — adding stigmergy simultaneously might overload.

---

## Sensory Design

### Tile Marks Visual Language

Marks are rendered as **bioluminescent ground patterns** — glowing shapes on the tile surface that evoke both digital HUD elements and natural bioluminescence (fitting the SE Asian cyberpunk aesthetic).

- **THREAT mark:** Pulsing red triangle, pointed upward like a warning sign. Edges sharpen at intensity 3. As the mark ages, the glow dims from hot red to cool amber to faint orange before dissolving in a slow fade.
- **SAFE mark:** Steady green circle, soft glow. Intensity 3 adds a gentle pulse like a heartbeat. Aging: green dims to muted sage to pale grey.
- **RESOURCE mark:** Blue diamond with inner sparkle. Intensity 3 has visible particles rising like data crystals growing from the tile.
- **PATH mark:** Yellow arrow pointing in the direction the marking unit was facing. Multiple overlapping PATH marks on the same tile create brighter, thicker arrows — the trail reinforces itself. A heavily-trafficked path GLOWS.
- **AVOID mark:** Purple X. Simple. Unmistakable. Ages to lavender.

### Mark Decay Visualization

As marks age, they go through a visual lifecycle:
1. **Fresh (0-2 ticks):** Full intensity glow, sharp edges, saturated color
2. **Recent (3-5 ticks):** Slightly dimmed, edges soften, color begins to desaturate
3. **Aging (6-10 ticks):** Noticeably faded, edges dissolve into particles, muted color
4. **Stale (11-15 ticks):** Barely visible, ghostly outline, near-grey
5. **Dissolved (16+ ticks):** Gone. A brief sparkle of particles marks the moment of dissolution.

### Audio Design

- **Mark placed:** A soft "plop" sound — like dropping a glowing pebble into still water. Pitch varies by mark type (THREAT = low, SAFE = high, PATH = mid).
- **Mark perceived:** A quiet "ping" when a unit first enters perception range of a mark. Like sonar. Pitch matches the mark type.
- **Trail reinforcement:** When a unit walks along PATH marks, a gentle rhythmic "tap-tap-tap" of footsteps on glowing ground. The taps get louder on heavily-trafficked paths.
- **Mark dissolution:** A descending whisper — "shhh" — as the glow fades to nothing. Barely audible unless the player is focused on that tile.
- **Mass dissolution:** When many marks expire simultaneously (e.g., after a long tick gap), a soft sighing chord. The battlefield's memory fading.

---

## Three Player Journeys

### Journey: Mika, 14, First-Time Strategy Gamer (Manila)

**Context:** Mission 4. Mika has learned basic rules and just encountered hooks in the previous mission. Now the boot log introduces marking.

**Minute 0:00 — The Introduction**
The boot log reads: "ENVIRONMENTAL INTERFACE: ONLINE. Not all communication requires a connection. Sometimes, the message IS the world. I can mark what I see. Others can read what I've marked. Like leaving notes on a map." Mika sees a new skill in the Scout's workbench: MARK. It has a dropdown for mark type (THREAT, SAFE, PATH) and an intensity slider (1-3).

**Minute 1:00 — The First Mark**
Mika configures a rule: `WHEN enemy_detected THEN mark(THREAT, intensity=2)`. She places the Scout on the board preview and sees a tiny red triangle appear on the Scout's current tile — a ghost preview of what the mark would look like. She drags the Scout to a different tile; the ghost mark follows. "So wherever the Scout goes, if it sees an enemy, it leaves a red mark."

**Minute 3:00 — The Patrol Route**
The Scout patrols its route during sealed watch. It spots an enemy at tick 4 and marks tile C5 with a red THREAT triangle. The glow is bright — intensity 2, fresh. Two ticks later, the Striker enters perception range of C5. A soft ping sounds. The Striker's buffer gains an entry: "MARK: THREAT at C5, age 2, intensity 2." The Striker's rule `WHEN mark_type(THREAT) AND mark_age < 5 THEN move_toward(mark_position)` fires. The Striker heads to C5.

Mika watches the Striker follow the Scout's mark. "It's like the Scout left a note and the Striker found it!" She doesn't know the word "stigmergy." She just experienced it.

**Minute 5:00 — The Trail**
Mika adds PATH marks to the Scout's config: `WHEN moving THEN mark(PATH, intensity=1)`. Now the Scout leaves a trail of yellow arrows wherever it walks. The trail forms a visible patrol route on the board — a golden breadcrumb path winding through the grid. After 5 ticks, the oldest marks begin to fade. The trail is ephemeral. It shows where the Scout HAS BEEN, not where it IS. The path glows brightest near the Scout's current position and fades to ghosts far behind.

"It's like... Hansel and Gretel. Except the breadcrumbs glow and then they disappear." She decides to increase the intensity to 2 (lasting 10 ticks). The trail stays visible longer. But now PATH marks are competing with THREAT marks for her Striker's buffer space. She needs to configure the Striker to filter: listen to THREAT marks, ignore PATH marks. She just discovered the fundamental stigmergy design tension: more marks = more information = more noise.

**Minute 8:00 — The Aha Moment**
The Inspector shows the Striker's buffer during the engagement. Slots 1-3: THREAT mark data. Slots 4-6: PATH mark data (useless to the Striker). The Striker only has 8 slots total. Three slots wasted on irrelevant breadcrumbs. "The notes are filling up its brain with directions it doesn't need!" She reconfigures: Striker's context config now ignores PATH marks. Next run, the Striker's buffer stays clean — only THREAT data. It engages faster.

**UI Annotations:**
- MARK skill: icon is a glowing handprint, dropdown for type with colored swatches, intensity slider 1-3
- Tile marks: bioluminescent ground patterns, red triangle for THREAT, yellow arrow for PATH
- Trail visualization: connected yellow arrows forming a visible patrol route, brightness gradient from recent to old
- Buffer slot view: mark entries show the mark icon + position + age

---

### Journey: Derek, 38, DevOps Engineer (Portland)

**Context:** Mission 7 "Blackout" phase. Derek has been using hooks extensively. Mid-battle, the boot log announces: "WARNING: HOOK BUS FAILURE. External interference detected. Switching to environmental communication only." All hook connections go dark. Signal lines on the board fade from cyan to grey.

**Minute 0:00 — The Crisis**
Derek's army is mid-engagement. His Scouts were broadcasting enemy positions on the "threat" channel. His Relay was compressing and forwarding to Strikers. The Command agent was coordinating production. All of that just STOPPED. The board goes eerily quiet — no signal lines, no channel activity indicators. Just units standing on tiles, suddenly isolated.

"It's a network outage," Derek mutters. His Twitch chat is panicking: "THE HOOKS ARE DOWN" "HIS WHOLE ARCHITECTURE IS HOOKS" "RIP."

**Minute 1:00 — The Fallback**
But Derek configured stigmergy marks as a backup during the workbench phase (he read a tooltip that said "Environmental marks persist even during hook failures"). His Scouts have a secondary rule: `WHEN enemy_detected AND hook_bus_down THEN mark(THREAT, intensity=3)`. The `hook_bus_down` condition is a system variable that activates during the Blackout phase. The Scouts immediately start dropping THREAT marks.

The board transforms. Where cyan signal lines used to crisscross the grid, red bioluminescent triangles begin blooming on tiles where Scouts detect enemies. The visual shift is dramatic — from a wired network to a marked landscape. Chat: "HE HAD A FALLBACK" "THE MARKS ARE LIKE FLARES" "IT'S A COMPLETELY DIFFERENT GAME."

**Minute 3:00 — The Speed Problem**
The marks work, but SLOWLY. In hook mode, a Scout's observation reached the Striker in 2 ticks (Scout → Relay → Striker, 1 tick per hop). In stigmergy mode, the Scout marks a tile, and the Striker must WALK within perception range of that tile to read it. If the Striker is 4 tiles away, that's 4 ticks of movement before it even sees the mark — plus the mark might be several ticks old by then. Total latency: 4-6 ticks vs. 2 ticks. The information is three times slower.

Derek rethinks his positioning. He moves Strikers closer to likely engagement zones, reducing the distance to potential marks. He configures PATH marks from Scouts to create visible patrol corridors — the Strikers follow the trails like ants following pheromone paths. The army reconfigures from a hub-and-spoke architecture (Relay at center, everyone connected by hooks) to a **swarm architecture** (everyone following trails, clustering near threat marks).

**Minute 7:00 — The Emergent Swarm Behavior**
Something beautiful happens. Two Scouts both mark the same cluster of enemies from different angles. The tile has two overlapping THREAT marks at high intensity. The combined visual is a bright, pulsing red — almost like an alarm beacon. Strikers, perceiving the intensified marks, converge from two directions. They pincer the enemy group — not because Derek programmed a pincer maneuver, but because two Scouts independently confirmed the same location, reinforcing the signal, and the Strikers' rules led them along the shortest paths.

"THAT'S ANT BEHAVIOR!" someone in chat shouts. "THEY'RE DOING DOUBLE CONFIRMATION THROUGH PHEROMONE INTENSITY!" Derek: "I didn't program a pincer. The marks just... made it happen."

**Minute 10:00 — The Restoration**
The boot log announces: "HOOK BUS: RESTORED. Switching to full communication mode." Signal lines reappear on the board. The marks remain, now supplementary. Derek's army operates in dual mode — hooks for fast coordination, marks for spatial awareness.

In the Inspector, Derek compares the hook-only phase, the stigmergy-only phase, and the dual-mode phase. The stigmergy phase shows slower response times but more distributed, resilient behavior. No single point of failure — when marks are the medium, destroying a Relay doesn't cut any communication. Every unit is both transmitter and receiver through the environment itself.

**UI Annotations:**
- Hook failure: signal lines fade from cyan to grey with a descending hum, "HOOK BUS FAILURE" text in amber
- Mark emergence: red triangles blooming on tiles as Scouts activate fallback marking
- Dual-mark reinforcement: overlapping marks create brighter, wider glow patterns
- Restoration: signal lines snap back to cyan, marks persist as ground layer beneath signal lines

---

### Journey: Dr. Reyes, 48, Biology Professor (Quezon City)

**Context:** Post-campaign Gauntlet. Dr. Reyes has completed the main campaign and is trying the "Ant Colony" doctrine — all hooks disabled, stigmergy only.

**Minute 0:00 — The Experiment**
Dr. Reyes selects the "Ant Colony" doctrine from the Gauntlet modifier list. The description: "HOOK BUS: PERMANENTLY OFFLINE. Your agents communicate only through environmental marks. Design a coordination system that emerges from individual behavior — like a real ant colony." She teaches entomology. She's been waiting for this.

**Minute 2:00 — The Colony Design**
She configures 3 Scouts with different mark strategies:
- Scout 1 ("Forager"): Marks THREAT when enemies spotted, marks RESOURCE when near allied factory
- Scout 2 ("Pathfinder"): Marks PATH everywhere it moves, creating a permanent trail network
- Scout 3 ("Sentinel"): Marks AVOID when in danger, marks SAFE when area is clear

The Strikers are configured to: approach THREAT marks, avoid AVOID marks, follow PATH marks when idle. The Relay (no hooks, but still has compress skill) is configured to approach clusters of marks and consolidate them — reading multiple marks and placing a single high-intensity SUMMARY mark that Strikers prioritize.

"I'm building an ant colony," she tells her partner. "The Scouts are workers leaving pheromone trails. The Relay is doing stigmergic computation — reading the environment and writing back a processed signal. The Strikers are soldiers following the strongest scent."

**Minute 6:00 — The Emergence**
During sealed watch, the board comes alive with bioluminescent marks. Yellow PATH arrows trace the Scouts' patrol routes, creating a visible nervous system across the grid. Red THREAT triangles bloom at enemy positions. Green SAFE circles mark cleared areas. The Relay moves between mark clusters, reading and writing SUMMARY marks (bright cyan diamonds) at strategic positions.

The Strikers follow the marks like ants. They don't know where the enemies are — they know where the MARKS are. The marks form a gradient: dense red near enemies, fading to yellow paths, to green safe zones. The Strikers flow along the gradient toward the red, engage, and then the area gets marked SAFE. The pattern repeats. An emergent search-and-destroy loop, with zero direct communication between any units.

Dr. Reyes is beaming. "This is EXACTLY how army ants work. Individual ants have no concept of 'the army.' They follow pheromone gradients. The army-level behavior — flanking, pincer movements, bridging — emerges from individual responses to local chemical signals. My robots are doing the same thing."

**Minute 10:00 — The Limitation Discovery**
The enemy deploys a noise unit that floods an area with false marks (enemy marks look different — angular, red-orange — but still occupy buffer space when perceived). Dr. Reyes' Scouts perceive both their own marks and enemy marks. Their buffers fill with mixed information. The gradient becomes unreliable — false THREAT marks lead Strikers into ambushes.

"Ah," she says. "Chemical warfare. In real ant colonies, enemy ants can disrupt pheromone trails by depositing their own chemicals. My agents need authentication — a way to distinguish their marks from enemy marks." She configures a rule: `WHEN mark_source = enemy THEN mark(AVOID, intensity=3)`. The Scouts start counter-marking enemy deception with AVOID warnings. A co-evolutionary arms race between mark systems.

"This is my entire career in a game. Chemical ecology as game mechanics." She screenshots the board — a beautiful gradient of glowing marks in six colors, forming visible flow patterns across the grid — and posts it to her department's group chat.

**Minute 15:00 — The Verdict**
In the Inspector, Dr. Reyes traces the mark propagation over time. She can see the trails form, the gradients develop, the Strikers follow the gradient, the enemy counter-marks, the defensive re-marking. It's a time-lapse of an information ecosystem evolving in real-time on an 8x8 grid.

"For my Ecological Modeling course," she says, "this is better than NetLogo. The students can SEE the stigmergy happening. They can DESIGN the agents that produce it. They can WATCH the emergent patterns and then DIAGNOSE them in the Inspector. I'm assigning this as a lab exercise."

**UI Annotations:**
- Ant Colony doctrine: amber badge in top-left, "HOOKS: OFFLINE" crossed-out signal icon
- Mark gradient: board shows layered bioluminescent patterns, density visible as brightness
- Enemy marks: angular shapes in red-orange, distinct from player's rounded shapes
- Inspector mark replay: time-lapse showing marks appearing, reinforcing, decaying, and forming flow patterns

---

## Interaction Effects

### Stigmergy × Signal Latency
Stigmergy's "latency" is movement speed, not tick count. A mark placed on tile C5 is instantly visible to any unit within perception range of C5. But a unit 5 tiles away must travel 5 ticks to read it. This creates a fundamentally different information propagation model — geographic distance IS latency. In hook mode, latency is measured in hops (1 tick per relay). In stigmergy mode, latency is measured in tiles (1 tick per movement step). The two models create different optimal architectures: hooks favor depth (relay chains compress information), stigmergy favors coverage (distributed patrols maximize mark freshness).

### Stigmergy × Context Overload
Marks perceived through the perception system compete for buffer space with enemy observations. A battlefield saturated with marks can cause overload just as easily as a battlefield saturated with enemies. The player must balance mark density against buffer pressure — placing too many marks overwhelms their own units. This self-limiting property is elegant: the system naturally caps its own information throughput.

### Stigmergy × EM Emissions
Marks are SILENT. They generate zero EM emissions. A stigmergy-only army is invisible to EM detection — the stealthiest possible coordination model. This creates a powerful stealth incentive: "Ant Colony" doctrine armies are undetectable through EM scanning. The trade-off: they're slower to coordinate, but they're ghosts.

### Stigmergy × Enemy Information Warfare
Marks are VISIBLE to enemies. An enemy Scout that enters perception range of player marks can read them — revealing patrol routes, threat assessments, and safe zones. Stigmergy creates an espionage vulnerability: the player's communication network is literally written on the ground for anyone to read. Counter-measures: CUSTOM marks with player-defined semantics (the enemy can see the mark but doesn't know what it means), or high-decay marks that dissolve before enemies arrive.

### Stigmergy × Tagging
Marks on tiles complement tags on enemies. A comprehensive intelligence picture uses BOTH: "enemy unit X is tagged at tile D4" (tag says WHO) + "tile D4 is marked THREAT" (mark says WHERE was dangerous). Tags move with enemies; marks stay on tiles. Together they create temporal + spatial awareness. In stigmergy-only mode, tags become the only entity-level tracking mechanism.

---

## The TikTok Clip

Time-lapse of a stigmergy battle. The board starts dark. Scouts begin patrolling, leaving yellow PATH arrows that trace glowing trails across the grid. Red THREAT triangles bloom where enemies are spotted. Strikers flow along the trails toward the red clusters. The board becomes a living organism of bioluminescent patterns — flowing, pulsing, fading, reinforcing. Caption: "No radio. No signals. Just breadcrumbs and instinct. This is how ants conquered the world."
