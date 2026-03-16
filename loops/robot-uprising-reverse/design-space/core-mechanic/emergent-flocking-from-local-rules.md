# 2.00f-iii — Emergent Flocking from Local Rules

**Aspect:** 2.00f-iii — Can Robot Uprising units exhibit Boids-like coordinated movement through local-only perception and communication? What rule configurations produce flock-like behavior without any explicit coordination signal?
**Wave:** 2 (Core Mechanic Variations)
**Category:** core-mechanic
**Parent:** 2.00f — No Global Coordinator as Design Constraint

---

## The Core Question

Craig Reynolds' 1986 Boids algorithm proved that three local rules — **separation** (don't crowd neighbors), **alignment** (steer toward neighbors' average heading), **cohesion** (move toward neighbors' center of mass) — produce complex, lifelike flocking from zero central coordination. The question for Robot Uprising: **can the locked four-primitive system (skills, rules, hooks, context config) express these three behaviors on an 8×8 discrete grid?** And if so, does the resulting flock-like movement create interesting gameplay, or is it just a novelty?

This isn't about adding a "flock" button. It's about whether a sufficiently creative player, using only the existing configuration primitives, can wire scouts and strikers into a formation that moves, reacts, and reforms like a biological swarm — and whether the game should actively teach, reward, or showcase this emergent possibility.

---

## Boids on a Discrete Grid: The Translation Problem

Reynolds' Boids operate in continuous 2D space with floating-point velocities. Robot Uprising operates on an 8×8 grid with discrete tick-based movement — one tile per tick, four cardinal directions (or eight with diagonals). The translation is non-trivial.

### The Three Rules, Discretized

**Separation → "Don't stack."**
In continuous Boids, separation is a smooth repulsion force. On a grid, it's binary: two units on adjacent tiles either stay or one moves away. The Robot Uprising version: a rule condition like `IF adjacent_ally_count > 1 THEN move_away_from_nearest_ally`. This keeps units from clumping into a single tile cluster. On the 8×8 board, separation manifests as a minimum-distance constraint — units maintain a 1-tile gap from each other when possible.

**Alignment → "Match your neighbors' heading."**
In continuous Boids, alignment averages neighbor velocities. On a grid with discrete moves, "heading" means "which direction did my neighbors move last tick?" The Robot Uprising version requires information: a unit must know its neighbors' last movement direction, which means either (a) they can perceive it directly (within perception radius) or (b) it's transmitted via hook/channel. The rule: `IF most_neighbors_moved_north THEN prioritize_north`. This requires context window slots dedicated to tracking neighbor movement.

**Cohesion → "Stay near the group."**
In continuous Boids, cohesion steers toward center-of-mass. On a grid, the Robot Uprising version: `IF ally_density_east > ally_density_west THEN prefer_east`. The unit doesn't compute center-of-mass — it just perceives more allies in one direction and moves that way. Perception radius becomes the "flock awareness" range.

### What the Grid Does to Flocking

The discrete grid creates **quantization artifacts** that continuous Boids don't have:

- **Movement granularity.** A unit can move 0 or 1 tile per tick. No "gentle steering" — the unit either commits to a direction or stays put. This makes flocking jerky. Units don't glide into formation; they snap tile-by-tile.
- **Collision.** Two units can't occupy the same tile. In continuous Boids, units smoothly separate. On a grid, collision creates hard conflicts — one unit must yield, and the resolution order matters. The locked simultaneous-resolution tick model means both units "try to move" at once; conflicts need a tiebreaker (agent ID priority, spatial hash, etc.).
- **Limited directions.** Four cardinal directions (or eight with diagonals) versus continuous 360°. Flocking movement looks blocky, like pixel-art birds rather than fluid murmurations.
- **Small board.** 8×8 = 64 tiles. A flock of 6 scouts on a 64-tile board is already 9.4% coverage. There's barely room to flock — the flock IS the board. This constraint means flocking in Robot Uprising is inherently a tight-formation micro-tactic, not a sweeping landscape behavior.

---

## Five Flocking Configurations in the Four-Primitive System

### Configuration 1: The Perception Flock ("See and Follow")

**How it works:** Scouts (perception radius 5) can see most of the 8×8 board. Each scout has a rule: `IF I see more allies to my [direction] THEN move [direction]`. No hooks, no channels, no communication. Pure perception-driven cohesion. A second rule adds separation: `IF ally on adjacent tile THEN move opposite`. A third adds threat response: `IF enemy in perception THEN evade AND fire threat hook`.

**What primitives are used:**
- **Skills:** `patrol`, `evade` (standard scout kit)
- **Rules:** 3-4 rules ordered by priority: (1) IF enemy_visible → evade, (2) IF adjacent_ally → move_away, (3) IF ally_cluster_detected → move_toward_cluster, (4) ELSE → patrol
- **Hooks:** 1 hook on `threat` channel (fires on enemy detection)
- **Context config:** Ignores most signals; listens for `threat` only. Small buffer (6 slots) keeps things reactive.

**What emerges:** The scouts form a loose, self-organizing cloud that drifts across the board. When one scout spots an enemy, the threat hook fires, and nearby scouts scatter — but then re-coalesce once the threat passes, because the cohesion rules pull them back together. The flock doesn't split and reform around obstacles like continuous Boids would; instead, units pile up against board edges and then spread back out in a blocky cascade.

**Strengths:** Zero communication overhead. No EM emissions from flock coordination. Silent, stealthy group movement. Works even if all relays are destroyed.

**Weaknesses:** "Cohesion" based on perception is crude — scouts with a 5-tile radius already see most of the 8×8 board, so there's no real "local" constraint. The flock either sees everything (wide perception) or nothing (narrow perception). The sweet spot barely exists on a board this small.

---

### Configuration 2: The Signal Flock ("Shout and Swarm")

**How it works:** Each scout fires a `heartbeat` hook every tick, broadcasting its position on the `flock-net` channel. Every scout listens on `flock-net`. Their rules interpret the incoming heartbeat signals: `IF received heartbeat from direction [X] AND no heartbeat from direction [Y] THEN move toward [X]`. The flock holds together because every member constantly broadcasts "I'm here," and every member steers toward the densest signal source.

**What primitives are used:**
- **Skills:** `patrol`, `evade`
- **Rules:** (1) IF enemy_visible → evade + fire `threat`, (2) IF heartbeat_density_high_in_direction → move_toward, (3) IF heartbeat_count < 2 → move_toward_last_known_heartbeat_direction, (4) ELSE → patrol_waypoint
- **Hooks:** 2 hooks — `heartbeat` (fires every tick, channel `flock-net`) and `threat` (fires on enemy detection, channel `alert`)
- **Context config:** Listens on `flock-net` and `alert`. Buffer fills fast with heartbeat signals; eviction priority set to `oldest_first` so only the most recent heartbeats inform decisions. Buffer size 6 means at most 6 heartbeats retained — the unit "remembers" at most 6 neighbors.

**What emerges:** A chatty, tight swarm. Scouts cluster around the densest heartbeat source, creating a self-reinforcing ball — the more scouts in one place, the stronger the "move here" signal, pulling in stragglers. Threat signals cause the whole flock to scatter simultaneously (every scout hears `alert` from every other scout), then re-form.

The crucial emergent moment: **flock splitting.** When an obstacle or enemy divides the flock, each sub-group forms its own heartbeat cluster. The two sub-flocks operate independently until they drift back within heartbeat range and merge. This splitting-and-reforming behavior — one of the hallmarks of natural flocking that Reynolds specifically highlighted — emerges naturally from the hook wiring without any explicit "split" or "merge" logic.

**Strengths:** Produces the most visually dramatic flocking behavior. The constant heartbeat signals create visible signal-chain animations during the sealed watch — green pulses rippling through the flock every tick, a glowing nervous system. Streamers would lose their minds.

**Weaknesses:** **EM nightmare.** Every scout broadcasting every tick fills the electromagnetic spectrum with noise. Enemy scouts detect the flock from across the board. The flock is stealthy in movement but deafeningly loud in signals. This creates a fascinating tradeoff: the tightest, most coordinated flock is also the easiest to detect. Loose, quiet scouts are invisible but uncoordinated. The player must choose: swarm or stealth.

Also: **buffer saturation.** With 4 scouts broadcasting heartbeats, that's 4 signals per tick entering each scout's 6-slot buffer. After 1-2 ticks, the buffer is full of heartbeats with no room for threat signals. The flock is so busy listening to itself that it can't hear anything else. This is the **"echo chamber" failure mode** — a direct parallel to real-world social media information bubbles and a genuine teachable moment about context window management.

---

### Configuration 3: The Relay-Mediated Flock ("The Shepherd")

**How it works:** Scouts don't talk to each other. Instead, a central relay collects all scout position reports, compresses them into a single `flock-vector` signal (direction and density), and broadcasts it back. Each scout listens for the relay's `flock-vector` and adjusts movement accordingly. The relay is the flock's "brain" — not a command agent with meta-skills, but a pure information hub that transforms raw data into group-level signals.

**What primitives are used:**
- **Skills (scouts):** `patrol`, `evade`
- **Skills (relay):** `compress`, `amplify`
- **Rules (scouts):** (1) IF enemy_visible → evade, (2) IF flock-vector points [direction] → move [direction], (3) ELSE → patrol
- **Hooks (scouts):** `position-report` every N ticks on `raw-flock`
- **Hooks (relay):** Listens on `raw-flock`, fires compressed `flock-vector` on `flock-orders`
- **Context config (relay):** Large buffer (12 slots), listens on `raw-flock`, evicts oldest. The relay's buffer IS the flock's collective memory.

**What emerges:** A disciplined formation that moves in coordinated waves. The relay's compression introduces a 2-tick delay (scout→relay→scout), so the flock reacts more slowly than the pure-signal flock but with more coherent, unified movement. The relay acts as a low-pass filter on the flock's impulses — individual scout jitter gets smoothed out into group-level trends.

**The emergent risk:** Kill the relay, kill the flock. The moment the relay is destroyed, scouts lose all coordination signals. They revert to individual patrol behavior, scattering across the board. This is **the single-point-of-failure** problem (2.00f-i) manifested as gameplay: the enemy learns to target the relay, and the player must protect it. A second relay provides redundancy but splits the flock into two sub-groups (each following its own relay's vector), which can cause the formation to oscillate between two attractors.

**Strengths:** Cleanest implementation. Uses the locked primitive system exactly as designed. The relay's compress skill does real work (turning N position signals into 1 vector). Produces the most legible flocking in the Inspector — the player can see the raw signals, the compression, and the resulting vector in a clear causal chain.

**Weaknesses:** Not truly emergent. This is a designed flock, not an emergent one. The player explicitly wired the relay as a flock coordinator. The behavior is predictable, debuggable, and intentional. It lacks the surprise factor of Configurations 1 and 2, where flock-like behavior appears without anyone designing for it.

---

### Configuration 4: The Stigmergic Flock ("Leave Breadcrumbs")

**How it works:** This uses the tagging mechanic (locked). Scouts tag tiles they've visited. Other scouts have a rule: `IF current tile is tagged by ally THEN prefer_untagged_adjacent_tile`. This creates natural spreading — scouts avoid each other's trails, producing exploration behavior that looks like separation. A complementary rule: `IF adjacent tile is tagged by ally within last 3 ticks THEN move toward it` — creating cohesion toward recent ally activity. Together, these produce a flock that spreads to explore but stays within a "freshness radius" of each other.

**What primitives are used:**
- **Skills:** `patrol`, `evade`, plus tagging (locked mechanic)
- **Rules:** (1) IF enemy_visible → evade, (2) IF current_tile tagged_by_ally → prefer_untagged, (3) IF adjacent_tile recently_tagged → prefer that direction, (4) ELSE → patrol
- **Hooks:** 1 hook on `threat` for enemy detection (minimal communication)
- **Context config:** Minimal signal listening. Most context slots used for local tile-tag observations.

**What emerges:** The scouts form a loose, exploratory cloud that maintains spacing through "negative pheromones" (avoid visited tiles) while staying near each other through "positive pheromones" (follow recent tags). The cloud expands to cover the board, then collapses when scouts run out of fresh tiles and start following each other's trails in circles. This oscillation between expansion and contraction looks organic and unpredictable.

**Strengths:** Near-silent. Almost no hook usage, minimal EM emissions. Perfectly suited for stealth-oriented missions. The flocking emerges from environmental modification, not from communication — a genuine ant-colony-optimization pattern that teaches a fundamentally different coordination paradigm from the channel-based approaches.

**Weaknesses:** Tag decay timing is critical. If tags last too long, the board fills up and separation fails (everything is tagged). If tags decay too fast, cohesion fails (nothing is tagged). The player must tune tag persistence, which is a hidden difficulty parameter. Also, the tagging mechanic's interaction with the locked "tagging boosts resource income" feature creates a confusing dual-purpose: are scouts tagging for flock coordination or for resource generation? The answer is "both," which is either elegant or confusing.

---

### Configuration 5: The Hybrid Flock ("Whisper Network")

**How it works:** Combines perception-based separation with hook-based cohesion and relay-mediated threat response. Scouts separate based on visual perception (local rule, no communication). They cohere through low-frequency heartbeats (1 heartbeat every 3 ticks instead of every tick, on a dedicated `whisper` channel). When any scout detects a threat, the signal routes through a relay that amplifies it to the whole flock. Three coordination layers at three communication costs.

**What primitives are used:**
- **Skills:** `patrol`, `evade`
- **Rules:** (1) IF enemy_visible → evade + fire `threat`, (2) IF amplified_threat_received → move_toward_threat_source (striker behavior: move to engage; scout behavior: move away), (3) IF adjacent_ally → move_away (separation), (4) IF whisper_density_east > whisper_density_west → prefer_east (cohesion), (5) ELSE → patrol
- **Hooks:** `heartbeat` on `whisper` (fires every 3 ticks), `threat` on `alert`
- **Context config:** Listens on `whisper` and `alert`. Eviction: `alert` signals never evicted (high priority), `whisper` signals evicted oldest-first. Buffer size 6: 2 slots reserved for alerts, 4 for whispers.

**What emerges:** The most naturalistic flocking. Scouts maintain spacing through perception (instant, free). They drift toward each other through whispers (slow, cheap). They react to threats through the relay (fast, loud). The three layers operate at different speeds, creating a layered motion profile: instant micro-adjustments (separation), slow macro-drift (cohesion), fast emergency response (threat relay). This mirrors how real bird flocks operate — local collision avoidance happens faster than group heading changes, which happen faster than predator response.

The **3-tick heartbeat interval** is the key innovation. It dramatically reduces EM noise compared to Configuration 2's every-tick broadcast. The flock is 3× quieter, but cohesion is 3× slower to respond. In a 50-tick mission, the flock gets ~16 cohesion updates — enough to maintain rough formation but not enough for tight clustering. The result is a loose, organic cloud rather than a rigid ball. This looks more like real flocking than any other configuration.

**Strengths:** Best noise-to-coordination ratio. Teaches layered system design (different subsystems operating at different frequencies — a real-world engineering principle). Produces the most visually appealing movement on the sealed watch. The Inspector debrief shows three distinct signal layers that the player can toggle independently.

**Weaknesses:** Five rules and two hooks is a significant configuration investment for scout units. With limited rule and hook slots, dedicating this many to flock behavior leaves little room for mission-specific skills. The flock is beautiful but may not be *useful* — coordinated movement is only valuable if the mission rewards group positioning, and many missions may reward dispersed coverage more than flocking.

---

## Why Flocking Matters (Or Doesn't) for Robot Uprising

### The Case For: "The Murmuration Moment"

The strongest argument for flocking in Robot Uprising is **the screenshot.** A flock of 6 scouts moving in coordinated formation across the isometric battlefield — splitting around an obstacle, reforming on the other side, scattering when a threat appears, re-coalescing when it passes — is *visually spectacular.* It's the kind of moment that makes someone watching a stream say "wait, those aren't scripted?" and then download the game.

The second argument is **pedagogical.** Flocking from local rules is a cornerstone of emergence education. If a player can produce Boids-like behavior using only Robot Uprising's four primitives, they have internalized a deep truth about distributed systems: complex global behavior can arise from simple local interactions. This is the game's entire thesis, manifested in a single, visually stunning behavior pattern.

### The Case Against: "Pretty but Pointless"

The counter-argument: on an 8×8 board, flocking is a luxury the player can rarely afford. Scouts are expensive (3 minerals each). A flock of 4 scouts costs 12 minerals — enough for a scout, a relay, a striker, and a specialist. Why would a player invest in a scout flock when a diverse army is strictly better?

Flocking also conflicts with the game's core information-architecture challenge. The interesting puzzle is *what information flows where and how fast*, not *whether units move in pretty patterns.* Flocking is a movement behavior; Robot Uprising is an information behavior game. The intersection exists (flock-based scouting coverage patterns are a form of distributed sensing), but it's narrow.

### The Resolution: Flocking as Emergent Discovery, Not Taught Mechanic

The design answer: **don't teach flocking. Let players discover it.** A player who independently discovers that their scout configuration produces flock-like movement gets the "I didn't program this!" moment that defines the game's emotional core. A tutorial that says "now make your scouts flock" strips the magic.

Instead, design **mission scenarios where distributed sensing is rewarded** — a large board area to scout, enemies that appear from random directions, no clear "optimal patrol path." In these scenarios, a player who stumbles onto a flocking configuration has a genuine tactical advantage: their scouts cover more ground, react to threats faster, and recover from losses better than a rigid patrol-path configuration.

The **Blueprint Codex** can contain a hint. Under the Scout entry, a flavor text line: *"Field operators report that large scout deployments sometimes exhibit coordinated movement patterns that were never explicitly programmed. The mechanism is not fully understood."* This plants the seed without spoiling the discovery.

---

## Sensory Description: What Flocking Looks and Feels Like

**On the sealed watch:** The board displays 4-6 scout units, each a 👁 icon on the isometric grid. At tick 1, they're scattered across the bottom two rows near the player's base. By tick 5, they've begun to drift — not along rigid patrol paths, but in a loose cloud that breathes outward and inward. The movement looks like a school of fish viewed from above: each unit makes small, individual adjustments, but the group has a collective heading.

When the cloud approaches a terrain obstacle (a ridge line of terrace tiles cutting diagonally across the board), it splits. Two scouts drift north of the ridge, three drift south. For 4-5 ticks, the sub-groups move independently. Then, as they clear the obstacle, the whisper-channel heartbeats pull them back together — the two northern scouts curve south, the three southern scouts pause, and by tick 15 the cloud has reformed on the far side. The reunion isn't crisp; it's gradual, organic, a bit messy. One straggler takes 2 extra ticks to catch up.

**Signal visuals during flocking:** Every 3 ticks, tiny green pulses emanate from each scout — the whisper heartbeats. The pulses are small, dim, short-lived compared to threat signals. They create a gentle bioluminescent effect, like fireflies in the jungle biome. On the city biome, the whispers look like brief fiber-optic flickers between units. The overall effect: the flock is visibly alive, breathing with information, even when nothing dramatic is happening.

**The scatter moment:** An enemy scout appears at tile E4. The nearest player scout detects it, fires a `threat` hook. The signal routes through a nearby relay, which amplifies it. In the next tick, all scouts receive the amplified threat. The flock *explodes* outward — each scout's evade skill fires simultaneously, and the tight cloud becomes a ring expanding away from E4. Red flash on E4 (combat zone). The enemy scout is tagged for the strikers. The scouts, now scattered, begin the slow 3-tick heartbeat process of re-coalescing. Over the next 10 ticks, the ring contracts back into a cloud, now slightly offset from its original position. The scatter-reform cycle took about 12 ticks — nearly a quarter of a 50-tick mission. Dramatic, but expensive.

**Audio:** The heartbeat whispers could have a subtle audio signature — a soft, rhythmic pulse like distant sonar pings, pitched to the number of active scouts (4 scouts = 4-note chord, each note slightly detuned). When the flock scatters, the chord breaks into individual pings, spatially distributed across the stereo field. When they reform, the pings converge back into a chord. The player learns to *hear* flock cohesion — a tight chord means tight formation, scattered pings mean broken flock. Experienced players would recognize flock state by ear alone, eyes free to watch something else.

---

## Player Journeys

### Journey: Mia, 16, First Strategy Game (Discovery Through Accident)

**Context:** Mission 3. Mia has unlocked hooks and channels. She has 4 scouts and 2 strikers, pre-placed. She's been assigning rigid patrol paths (waypoints), and her scouts keep running into enemies at the same spots and dying. She wants them to "spread out more."

**Minute 0:00 — The Frustration**
Mia stares at the plan screen. The 8×8 board shows her 4 scouts placed in a line along row 2. Each has a simple patrol rule: move right until edge, then move left. They march in lockstep, and enemies at E5 pick them off because they arrive at E2 in a predictable pattern. The workbench shows each scout's rules: just the patrol waypoints. She's thinking: "I need them to not all go to the same place."

**Minute 1:00 — The Tinkering**
She opens Scout-A's blueprint. She sees the hook slots — two dashed outlines, both empty. She drags a `position-report` hook into one slot, creating channel `my-scouts`. She doesn't know exactly what this will do, but the tooltip says "broadcasts your position to all listeners on this channel." She configures all 4 scouts to fire `position-report` on `my-scouts` and listen on `my-scouts`.

Now she needs a rule that uses the position data. She creates a rule: `IF received position-report from direction [same as my heading] THEN change heading to [perpendicular]`. She's trying to make scouts "dodge" when they detect another scout ahead of them. She doesn't think of this as flocking. She thinks of it as collision avoidance.

She hits EXECUTE.

**Minute 2:30 — The Sealed Watch**
The tick clock starts. Her 4 scouts begin moving right, per their patrol rule. On tick 2, Scout-B sends a position report. Scout-A, directly behind Scout-B, receives it: "Scout-B is in the direction I'm heading." Rule fires: Scout-A turns north. On tick 3, Scout-C receives Scout-B's report AND Scout-A's new report. Scout-C turns south. By tick 5, the 4 scouts have spread into a loose diamond formation — two heading right, one drifting north, one drifting south.

Mia leans forward. "Wait. They're actually... spreading out?"

The diamond holds for 3-4 ticks, then deforms as scouts hit edges and reverse. The reversal creates new "heading conflicts" → more dodging → the diamond reforms, slightly shifted. The scouts are *exploring the board* in a coordinated pattern that Mia never explicitly programmed.

**Minute 3:30 — The Enemy Encounter**
An enemy appears at F6. Scout-A (nearest, at E3) spots it and fires a `threat` hook (from her earlier mission 2 setup). Scouts scatter — not because of a "scatter" command, but because Scout-A's position suddenly changes (evade skill), which triggers heading-conflict rules in the other scouts. The flock deforms around the threat, then re-coalesces on the other side.

Mia's mouth is open. She did NOT program a scatter-and-reform behavior. She programmed collision avoidance. The flocking is emergent.

**Minute 5:00 — The Inspector**
Debrief. Mia scrubs through the timeline. She clicks on Scout-C at tick 5. The decision trace shows: "Rule matched: IF received position-report from heading direction THEN turn perpendicular. Context: Scout-A position-report received (slot 2), Scout-B position-report received (slot 1)." She traces the chain backward: Scout-C turned south because Scout-A turned north because Scout-B was ahead. A causal chain she can follow, but the *result* — a diamond formation — was not in any individual rule.

**Minute 6:00 — The Realization**
Mia opens her Blueprint Codex. Under Scout, she reads the flavor text: *"Field operators report that large scout deployments sometimes exhibit coordinated movement patterns that were never explicitly programmed."* She grins. She opens the next mission. She wants more scouts.

**UI Annotations:**
- **Position-report hook config:** Dropdown for channel name (she types `my-scouts`), toggle for broadcast frequency (every tick by default). Compact single line in the hook slot.
- **Rule creation:** She drags a condition from the condition palette ("received signal from direction matching my heading") and drops it onto a new rule row. Then drags an action ("change heading to perpendicular"). The rule row animates to show the condition→action pair.
- **Sealed watch diamond formation:** No special UI element marks the flock. It just IS — the units naturally moving in a pattern. The only visual cue is the signal pulses between scouts every tick, a subtle green sparkle network.

---

### Journey: Alex, 34, Senior DevOps Engineer (Deliberate Flock Architecture)

**Context:** Mission 7. Alex has the full toolkit — factory, command agent, all unit types. He's designing a reconnaissance architecture for a large urban (Cebu) map with many sight-line blockers. He wants scouts that dynamically cover the map without centralized path assignment.

**Minute 0:00 — The Design Phase**
Alex opens the workbench with a blank scout blueprint. He's thinking explicitly about Boids — he's read Reynolds' paper. He starts mapping the three rules:

1. **Separation:** Rule 1 — `IF adjacent_ally_count > 0 THEN move_away_from_nearest_ally`. Priority: highest. Prevents clumping.
2. **Cohesion:** Rule 4 — `IF whisper_density in [direction] > threshold THEN prefer [direction]`. Priority: lowest. Gentle drift toward the group.
3. **Alignment:** He pauses. How does a Robot Uprising scout know its neighbors' heading? There's no `neighbor_heading` condition. He'd need scouts to broadcast their heading in hook signals. He creates a custom hook: `heading-report` on channel `whisper`, fired every 3 ticks, payload includes current heading. Rule 3: `IF most_recent heading-reports indicate [direction] THEN prefer [direction]`.

He also adds threat response as Rule 2 (above alignment, below separation): `IF threat_received THEN evade`. Four rules, two hooks (heading-report, threat), context config with whisper and alert channels, oldest-first eviction.

**Minute 3:00 — The Production Queue**
Alex queues 6 scouts in the factory conveyor belt. He's calculated: 6 scouts × 3 minerals = 18 minerals. The passive income rate means they'll all be built by tick 15. He also queues 2 strikers and 1 relay. The relay will amplify threat signals; the strikers will respond to amplified threats. The scouts are the sensing flock; the strikers are the response force.

In the conveyor belt, the 6 scout icons line up left-to-right, followed by the relay, followed by the strikers. Cost preview shows 18 + 5 + 16 = 39 minerals. He has 45 to spend. Tight budget.

**Minute 5:00 — The Sealed Watch**
Factory starts producing. Tick 1: first scout emerges. By tick 6, all 6 scouts are on the board, clustered near the factory at row 1. The factory is in the bottom-left corner of the Cebu city grid.

Ticks 7-12: The separation rule fires first. Scouts push apart. But they're still near the factory, so cohesion pulls them back. For a few ticks, the flock oscillates — expand, contract, expand, contract — until the patrol fallback rule (Rule 5) starts moving them northward. The oscillation dampens as the flock drifts away from the spawn point.

Tick 15: The flock has settled into a loose hexagonal formation (as close as an 8×8 grid allows). Six scouts, roughly 2 tiles apart, drifting north through Cebu's urban grid. Signal line buildings block perception but not hook transmissions (city terrain rule). The scouts can't see around corners, but they can whisper through walls. The whisper-mediated cohesion holds even when individual scouts lose visual contact behind buildings.

Tick 22: The flock encounters a cluster of 3 enemies at row 5. Two scouts spot enemies simultaneously. Both fire threat hooks. The relay (now built, stationed at row 2) receives and amplifies. The flock scatters — separation rule fires hard, pushing scouts away from the threat zone. The 2 strikers (built at ticks 13-14, now at row 3) receive the amplified threat and begin advancing.

Tick 25: Strikers reach row 5, eliminate 2 enemies. The third enemy retreats. The scout flock, now scattered across rows 3-6 in a ring around the former threat zone, begins re-coalescing via whisper heartbeats. Over ticks 26-32, the ring contracts into a cloud again.

Alex watches the re-formation with satisfaction. He didn't program the ring scatter. He didn't program the re-coalescence. He programmed three local rules and a heartbeat signal. The rest is emergence.

**Minute 8:00 — The Inspector**
Alex opens the Inspector and enables the "signal overlay" — all whisper and threat signals drawn as lines on the board. The whisper network looks like a web of faint green threads connecting the 6 scouts, pulsing every 3 ticks. The threat signals are bright red lines from scouts to relay to strikers. He toggles between "whisper only" and "threat only" views to see the two networks independently.

He clicks on Scout-3 at tick 22 (the scatter moment). The decision trace shows: Rule 2 (`IF threat_received`) matched, action: evade north. Context window: slot 1 = threat signal from Scout-1, slot 2 = threat signal from Scout-5, slot 3 = whisper from Scout-2 (3 ticks old), slots 4-6 = stale whispers evicted. The threat signals displaced the whisper cohesion data, causing the scout to react purely to the threat with no cohesion pull. This is correct behavior — the rule priority ensures threat response overrides flock cohesion.

He opens the context window chart for Scout-3. The sparkline shows a steady green (whisper-filled) baseline from ticks 7-21, then a sharp red spike at tick 22 (threat signals flooding the buffer), then a gradual return to green as whispers refill post-scatter. The chart is a visual EKG of the flock's information state — calm, spike, recovery.

**Minute 10:00 — The Iteration**
Alex notices that the re-coalescence took 7 ticks (25-32). Too slow — by tick 32, a new enemy wave arrives and the flock isn't ready. He goes back to the workbench. He changes the whisper interval from 3 ticks to 2 ticks. This will speed up cohesion but increase EM noise. He calculates: 6 scouts × 1 signal every 2 ticks = 3 signals per tick hitting the EM space. Acceptable. He also adds a 5th rule below patrol: `IF no whisper received for 4+ ticks THEN move toward factory` — a "lost scout" fallback that prevents isolated scouts from drifting into enemy territory alone.

He hits EXECUTE again. This iteration, the re-coalescence takes 5 ticks. Better.

**UI Annotations:**
- **Signal overlay toggle:** Three buttons in Inspector sidebar — "All Signals" / "Whisper Only" / "Threats Only". Each shows/hides the corresponding signal lines on the board. Lines are colored per channel: green for whisper, red for threat, blue for others.
- **Context window chart (scout):** Horizontal sparkline below the unit portrait in the Inspector click-to-inspect panel. X-axis = ticks, Y-axis = buffer fill (0-6 slots). Color-coded by signal type: green = whisper, red = threat, gray = observation. The chart pulses gently when hovered, revealing exact values per tick.
- **Whisper interval config:** In the hook editor, a dropdown next to the heartbeat hook: "Fire every: [1/2/3/5] ticks". Default is "every tick." Tooltip: "Lower intervals improve coordination but increase EM noise."

---

### Journey: Kai, 28, Twitch Streamer and Zachtronics Veteran (The Content Creator Moment)

**Context:** Mission 9. Kai is streaming their first attempt at the penultimate mission — a massive enemy wave assault on the player's base. They've been building hierarchical command architectures all campaign. Chat has been telling them to "try the flock strat" for weeks. Kai is skeptical ("flocking is for birds, not for war machines") but chat has been donating bits with flock emojis.

**Minute 0:00 — Chat Demands**
Kai opens the workbench. Chat is spamming "🐦🐦🐦 FLOCK STRAT 🐦🐦🐦." Kai says: "Fine. Fine! Let's see if your bird strategy can beat Mission 9. I'm going to make 8 scouts with Boids rules and NO command agent. Pure emergence. If this works, I'll eat my keyboard."

**Minute 2:00 — The All-In Build**
Kai designs the scout blueprint with the Hybrid Flock configuration (Configuration 5 from above). 5 rules, 2 hooks. They also design a minimal striker blueprint (2 rules: IF threat_amplified → engage, ELSE → hold_position) and a relay (compress + amplify on threat and whisper channels). Production queue: 8 scouts, 2 relays, 4 strikers. Total: 24 + 10 + 32 = 66 minerals. The mission gives 70. Almost no budget for mistakes.

Chat: "no command agent?!" / "madlad" / "this is going to be beautiful or a disaster" / "probably both"

Kai hits EXECUTE.

**Minute 3:00 — The Sealed Watch (The Moment)**
Tick 1-10: Factory produces scouts. They emerge one by one and immediately begin flocking — separation pushes them apart, whisper heartbeats pull them into loose formation. By tick 10, 6 scouts are on the board in a shifting, breathing cloud near the center. Chat is quiet. The green whisper pulses between scouts create a faintly glowing mesh on the dark cyberpunk Cebu map.

Tick 15: The first enemy wave appears from the north. 6 enemy strikers. The flock detects them — two scouts spot enemies simultaneously. Threat signals fire through the relay. **The flock splits.** 4 scouts scatter south and west. 2 scouts hold north, still within perception range of the enemies, continuing to feed threat data. The player's strikers (now built) advance toward the threat data.

Kai: "Wait. Did they just... split into a forward observation team and a retreat group? I didn't—" They look at chat, eyes wide. "I didn't program that. I did NOT program that."

Chat: "EMERGENT BEHAVIOR" / "the boids are THINKING" / "clip it clip it clip it"

Tick 20: The strikers engage the enemy wave. Combat. Red flashes. 3 enemies eliminated. The 2 forward scouts evade just in time, ducking behind a city building. The remaining 3 enemies pursue. The 4 retreated scouts, now re-coalescing near the base, detect the pursuing enemies from the south side and fire new threat data. The strikers, having eliminated their first targets, receive the new threat and pivot.

Tick 28: Second engagement. All enemies eliminated. The scout flock, scattered across 4 rows of the board, begins the slow whisper-mediated re-coalescence. Green pulses ripple outward every 2 ticks. The mesh reforms.

Kai is standing up. "Chat. CHAT. They ran a pincer movement. They did forward observation with fire-and-maneuver coverage. That's actual military doctrine. From BOIDS RULES."

Chat is melting. Clip already has 200 views.

**Minute 6:00 — The Inspector (The Breakdown)**
Kai opens the Inspector and scrubs to tick 15, the split moment. They enable signal overlay. The screen fills with green whisper threads connecting all scouts, and bright red threat lines from the two forward scouts through the relay to the strikers.

They click on Scout-E (one of the 2 that held north). Decision trace: "Rule 1: IF enemy_visible → evade. Action: move south. Rule 3: IF adjacent_ally → move_away. NOT MATCHED (no adjacent ally). Rule 4: IF whisper_density south > whisper_density north → prefer south. MATCHED but lower priority than Rule 1's evade action, which already moved south."

Kai explains to chat: "So Scout-E stayed north because its evade direction happened to be south — it was trying to run, but it was already the northernmost scout, so 'south' meant 'move one tile south,' which was still north of everyone else. It LOOKED like brave forward observation. It was actually panicked retreat that didn't go far enough." Laughter. "The emergent behavior is literally an accident that looks intentional. This is PEAK agentic engineering."

**Minute 8:00 — The Clip**
The TikTok-ready clip: top-down view of 8 scouts flowing across the cyberpunk city grid. Green whisper mesh pulsing. Enemy wave appears. Flock splits — half scatter, half hold. Strikers advance through the gap. Red combat flashes. Flock reforms. 15 seconds. Caption: "I programmed collision avoidance. They invented military doctrine."

**UI Annotations:**
- **Stream overlay:** The sealed watch view is clean enough for streaming — tick clock at top, unit icons on the isometric grid, signal pulses visible but not cluttered. Streamers can enable a "signal density overlay" that shows flock cohesion as a translucent heat cloud (blue = tight flock, transparent = scattered).
- **Clip moment:** The flock split at tick 15 is identifiable by the signal mesh visibly tearing — green threads stretch and snap as scouts separate beyond whisper range, then new threads form as sub-groups establish their own local meshes.

---

### Journey: Priya, 42, Systems Architect, Accessibility: Low Vision (Audio-First Flock Monitoring)

**Context:** Mission 6. Priya uses a high-contrast display mode with enlarged unit icons. She has difficulty tracking multiple small units simultaneously but excellent auditory processing. She's building her first multi-scout deployment.

**Minute 0:00 — Audio Setup**
Priya has the game's audio mode set to "Enhanced Spatial." Each unit type has a distinct audio signature. Scouts emit a soft sonar ping at their whisper frequency. She's configured 4 scouts with the Signal Flock (Configuration 2) — heartbeat every tick on `flock-net`. At the audio layer, this means 4 pings per tick, spatially positioned in her headphones based on the scouts' board positions.

**Minute 1:30 — The Sealed Watch (Listening)**
She hits EXECUTE. The tick clock starts with a soft metronome click. Tick 1: a single ping, center-left (Scout-A near the factory). Tick 2: two pings, slightly separated (Scout-A and Scout-B). By tick 6, four pings per tick, forming a chord. The pings are tuned to slightly different pitches (Scout-A = C4, Scout-B = D4, Scout-C = E4, Scout-D = F4). When clustered, they form a consonant chord. As they separate, the spatial panning spreads the notes across the stereo field.

Priya listens. The chord is tight — all four scouts are near each other. The spatial spread is narrow. She knows from the sound alone that the flock is cohesive.

Tick 12: The pings spread wider in the stereo field. Scouts are separating. The chord becomes more open, more ambient. Tick 15: One ping suddenly jumps to the far right — Scout-D has drifted to the board's east edge. The chord loses a note from the center. Priya frowns. "Scout-D is drifting."

Tick 18: A sharp, dissonant tone — the threat audio. A low buzzing hum enters from the north. Priya's hands grip the desk. The flock chord breaks apart: pings scatter across the stereo field. Then, gradually, they converge again. The chord rebuilds, slightly different (Scout-D is now in a different position). Priya exhales. "They reformed."

**Minute 4:00 — The Inspector (Audio Replay)**
In the Inspector, Priya scrubs the timeline. The audio replays in sync — she can hear the flock's history. She scrubs to tick 15 where Scout-D drifted. She clicks Scout-D. The screen reader announces: "Scout-D, tick 15. Rule matched: patrol waypoint. Context window: 4 of 6 slots filled. Whisper signals: 2 (Scout-A, Scout-C). No whisper from Scout-B — out of range." She understands: Scout-D lost cohesion because Scout-B's heartbeat didn't reach it — a dead zone in the whisper network. She needs to increase the heartbeat interval or reposition the deployment.

**Minute 5:30 — The Fix**
Back in the workbench, she adjusts Scout-D's context config: increase listen priority on `flock-net` so whisper signals are never evicted. She also adds a "lost scout" fallback rule: `IF no whisper received for 3 ticks THEN reverse heading`. This should prevent drift.

**UI Annotations:**
- **Spatial audio ping:** Each scout emits a soft, pitched ping at its heartbeat frequency. Pitch = scout identity. Pan position = board x-coordinate. Volume = board y-coordinate (closer to player base = louder). The composite sound of all scouts forms an audio portrait of flock state.
- **Flock cohesion audio indicator:** An optional low-frequency drone whose pitch tracks average inter-scout distance. Tight flock = high drone. Scattered = low drone. Can be toggled independently of individual pings.
- **Screen reader integration:** Inspector click-to-inspect reads full context state, signal sources, and rule match chain. Timeline scrubber audio playback replays all spatial audio in sync.

---

## Interaction Effects

### With Signal Latency (Locked: 1 tick per hop)
Signal latency creates the fundamental tension in every flock configuration. Heartbeat signals are 1 tick old when received. On a fast-moving board, 1-tick-old position data points to where a scout WAS, not where it IS. This inherent staleness means flocking in Robot Uprising is always slightly behind real-time — units follow ghosts of each other's positions. On an 8×8 board at 1 tile/tick, the error is 1 tile (12.5% of the board width). Enough to matter; not enough to break flocking.

### With EM Emissions (Locked: hooks emit detectable noise)
Flocking is fundamentally a noise-vs-coordination tradeoff. More communication = tighter flock = louder signal. The enemy benefits from player flocking because it makes scouts detectable. This creates a game-theory layer: the player wants flocking for coverage efficiency, but the enemy AI can exploit the EM noise to locate and target the flock. Missions designed around stealth scouting punish flocking; missions designed around overwhelming force reward it.

### With One-Shot-One-Kill (Locked)
A tight flock is a target-rich environment. One enemy striker adjacent to a 3-scout cluster eliminates one scout per tick — the flock dissolves in 3 ticks. Separation rules are therefore not optional; they're survival. The flocking configurations that enforce minimum 2-tile spacing between units are strictly better than tight-cluster configurations in a one-shot-one-kill system. This is why Configuration 5 (Hybrid Flock) with its perception-based instant separation layer works best — it reacts before the enemy can close distance.

### With Buffer Model (Locked: fixed-size context window)
Flocking competes with mission data for buffer space. A scout's 6-slot buffer can hold either (a) 4 whisper heartbeats + 2 observations, or (b) 6 observations. Flocking literally reduces a scout's awareness of the world. This is the "echo chamber" problem: a well-coordinated flock of scouts that can't actually scout because their buffers are full of each other's heartbeats. The design solution is Configuration 5's 3-tick heartbeat — slow enough to leave buffer space for actual reconnaissance.

### With Tagging (Locked: universal primitive)
Configuration 4 (Stigmergic Flock) directly uses the tagging mechanic for coordination. This creates an interesting dual-use tension: tiles tagged for flock navigation also boost resource income. The flock's exploration pattern becomes the player's resource map. This is either elegant (scouts naturally find and tag resource-rich areas while flocking) or degenerate (scouts re-visit already-tagged tiles to maintain flock cohesion, generating income without actual scouting).

### With Campaign Progression (Locked: 10 missions)
Flocking requires multiple scouts (minimum 3 for meaningful behavior). Pre-placed missions (1-4) have exactly the right unit count for whatever the tutorial teaches. Flocking only becomes possible at Mission 5 (factory unlock) when the player can produce arbitrary numbers of scouts. It becomes practical at Mission 6-7 when factory efficiency improves. It peaks at Mission 8-10 when full-scale battles justify scout swarms. This means flocking is a mid-to-late-game discovery — perfectly timed for the "expertise reward" emotional arc.

---

## Comparable Games

### Boids (Craig Reynolds, 1986)
The original. Three rules, infinite emergence. Robot Uprising's discrete grid and fixed-size buffer create meaningful departures from the continuous-space Boids model. The key lesson: flocking doesn't require complex agents — it requires the right simple rules in the right interaction topology.

### AI War (Arcen Games, 2009)
Chris Park's design uses three intelligence layers: strategic, sub-commander, and individual-unit. The sub-commander layer is "completely emergent" — individual units doing what's best for themselves while considering group state. This is exactly the architecture that Robot Uprising's flock configurations produce: individual scouts following local rules that produce emergent group behavior. AI War proves this works at commercial scale.

### Gladiabots (GFX47, 2017)
Sébastien Dubois reports being "astonished by players' creativity" — players creating behaviors he didn't anticipate, including emergent group movement from simple behavior graphs. Robot Uprising should expect the same: players will discover flocking before designers document it. The Gladiabots lesson: design the primitives to be composable, then get out of the way.

### Pikmin (Nintendo, 2001)
Pikmin's swarm follows the player-character with implicit Boids-like behavior (separation + follow-leader). The emotional payload — a cloud of creatures that feels alive — is exactly what Robot Uprising's scout flock should evoke. The difference: Pikmin's flock is hardcoded; Robot Uprising's is player-configured. The player BUILDS the Pikmin swarm from primitives.

### Half-Life (Valve, 1998)
Used literal Boids code (named "boid" in game files) for the flying creatures on Xen. Demonstrates that even in an action game, flock behavior reads as "alive" and "intelligent" to players, creating atmosphere that scripted paths cannot match.

---

## The TikTok Clip

**Setup:** Split-screen. Left: the workbench, showing 5 simple rules in a scout blueprint (separation, cohesion, alignment, threat, patrol). Right: the sealed watch battlefield.

**0-5 seconds:** The rules scroll in, one by one. Simple text. Nothing complex. A caption appears: "I gave my robots 5 rules."

**5-10 seconds:** Cut to the sealed watch. 8 scouts emerge from the factory. They cluster. Then separate. Then drift into formation. Green whisper pulses create a mesh of light between them. They flow across the board like a school of fish.

**10-12 seconds:** Enemy wave appears. The flock splits. Half scatter. Half hold. Strikers advance through the gap.

**12-15 seconds:** Red flashes. Enemies eliminated. The flock reforms. The mesh of light re-weaves.

**Caption:** "They invented flanking. I only taught them to stay apart."

---

## New Aspects Discovered

- **2.00f-iii-a — Flock size scaling analysis:** How does flock behavior change from 3 scouts to 6 to 12? Is there a minimum viable flock size? A maximum before the 8×8 board is too crowded? The sweet spot as a function of board size and unit perception radius.
- **2.00f-iii-b — Anti-flock enemy tactics:** How should enemy AI exploit player flocking? AoE disruption signals, target-the-relay, EM-based flock tracking, noise flooding to break whisper networks. The flock as a designed vulnerability.
- **2.00f-iii-c — Flock + Command agent hybrid:** Can a Command agent dynamically switch between hierarchical control and flock mode? "Release the flock" as a meta-level skill — the Command agent removes its own authority and lets local rules take over. The transition moment as gameplay.
- **2.00f-iii-d — Flock visualization design for sealed watch:** Full specification of how flock cohesion is rendered — the whisper mesh, the scatter animation, the reform sequence. Should there be an explicit "flock cohesion indicator" or should it remain purely emergent and visual?
- **2.00f-iii-e — The echo chamber failure mode as tutorial moment:** Designing a mission where the player's first flock fails because buffer saturation prevents scouts from actually scouting. The debrief teaches context window management through the visceral experience of a flock that's "so busy talking to itself it forgot to look."
