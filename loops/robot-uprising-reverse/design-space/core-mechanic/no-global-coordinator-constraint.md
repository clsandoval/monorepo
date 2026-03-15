# 2.00f — No Global Coordinator as Design Constraint

**Aspect:** 2.00f — No global coordinator as design constraint
**Wave:** 2 (Core Mechanic Variations)
**Category:** core-mechanic

---

## The Option

What if Robot Uprising **had no Command unit at all?** What if every agent — Scout, Striker, Relay, Specialist — could only perceive and communicate with its immediate neighbors on the 8×8 grid, and all coordination had to emerge from local interactions? No omniscient manager. No centralized decision-maker. No agent that "sees the whole board." Just local rules, local signals, local context — and whatever global behavior the player can coax out of those constraints.

This is the **"No Global Coordinator"** variant: a design constraint drawn directly from TIS-100's node architecture, Boids' flocking algorithm, and Conway's Game of Life — systems where rich, complex group behavior emerges exclusively from simple, local interactions between neighbors. In Robot Uprising's vocabulary: agents only see tiles within their perception radius, only communicate via hooks to agents within physical transmission range, and have no access to a global channel bus or a Command agent's god-view.

The fundamental design question: **Does removing the global coordinator make the game MORE interesting (because coordination becomes a spatial puzzle and emergent behavior becomes the reward) or LESS interesting (because the player loses the most powerful design tool and the meta-level collapses)?**

---

## Mechanical Specification

### What Changes From the Locked Design

| Dimension | Locked Design (Command exists) | No-Coordinator Variant |
|-----------|-------------------------------|----------------------|
| **Command unit** | Exists (14 buffer, 6 hooks, `reassign`/`reroute`/`prioritize`) | Does not exist. No unit has meta-skills. |
| **Channel range** | Logical (any listener on channel X hears any sender on X) | Physical. Hook transmissions reach only units within N tiles (e.g., 3 tiles for Scouts, 5 tiles for Relays). |
| **Information scope** | A Relay can aggregate signals from the entire board if wired correctly | A Relay can only aggregate signals from units physically nearby. Board-wide awareness requires relay chains. |
| **Adaptation** | Command agent rewrites subordinate configs mid-battle | No mid-battle reconfiguration. All agent configs are static once the battle begins. Agents can only change behavior by what enters/exits their context buffer. |
| **Meta-level** | Tier 3 exists — building systems that manage systems | Tier 3 is replaced by **Tier 3-Local**: designing local interaction patterns that produce emergent global coordination without any unit "knowing" the global state. |

### The Three Locality Rules

**Rule 1: Perception is local.** Each unit type sees only its perception radius (Scout: 5 tiles, Striker: 2 tiles, Relay: 0 — stationary, blind, Specialist: 3 tiles). No unit can see the whole board. World knowledge must be assembled from fragments passed between neighbors.

**Rule 2: Communication is local.** Hook transmissions have a physical range equal to the transmitting unit's "broadcast radius." A Scout's hook payload reaches units within 3 tiles. A Relay amplifies — its broadcasts reach 5 tiles. Signals attenuate. To cross the whole 8×8 board, a message must hop through at least 2-3 relays.

**Rule 3: No reconfiguration.** No unit can modify another unit's skills, rules, hooks, or context config. What the player sets in the workbench is what each unit runs for the entire battle. Adaptation happens only through what information flows into the buffer and how rules respond to that information.

### Signal Propagation Model

In this variant, signals behave like **waves in a medium**, not like messages in a Slack channel:

- **Tick 1:** Scout at B2 detects enemy. Fires hook on `threat`. Signal reaches all units within 3 tiles of B2.
- **Tick 2:** Relay at D3 (within range) receives the signal. Its `amplify` skill re-broadcasts on `threat` with 5-tile range.
- **Tick 3:** Striker at G4 (within 5 tiles of D3) receives the amplified signal. Acts.
- **Tick 4:** If no relay covers the gap, Striker at H8 *never receives the signal at all.*

The player's job shifts from designing channel topologies to designing **relay coverage maps** — physical placement patterns that ensure signals can propagate from any detection point to any response point within acceptable tick latency.

---

## The Five Sub-Variants

### Variant A: Pure Locality (The "TIS-100 Mode")

**Every unit talks only to its four orthogonal neighbors.** No broadcast radius — a hook payload goes to units on adjacent tiles (up, down, left, right) only. Diagonal doesn't count. The grid becomes a TIS-100-style mesh of nodes passing integers to their neighbors.

**What this feels like:** Programming a distributed system at the register level. Each agent is a tiny processor. The player must design data pipelines where information flows tile-by-tile across the board. A 7-tile journey from scout to striker takes 7 ticks — an eternity in a one-shot-one-kill game.

**Strengths:**
- Maximum emergent complexity. When you can only talk to your neighbor, every multi-tile coordination is a genuine achievement.
- The relay becomes the most important unit in the game — it's the only way to bridge communication gaps.
- Physical board layout becomes THE primary design puzzle, not just a secondary concern.
- The "aha moment" of seeing a signal propagate across the board through a chain of relays, arriving just in time for a striker to evade, is viscerally satisfying.

**Weaknesses:**
- Potentially too slow. An 8×8 board with 1-tick signal latency per tile means worst-case 14 ticks for corner-to-corner communication. In a 50-tick mission, that's 28% of the match spent on signal propagation before any agent can respond.
- Extremely high barrier for new players. Understanding that your scout *can't just tell your striker what it saw* requires a mental model shift that may be too much for mission 1.
- Relay spam. The optimal strategy may always be "fill the board with relays to minimize signal latency," which collapses the unit-diversity puzzle.

**The TikTok clip:** Top-down view of the 8×8 board. A red flash at A1 (enemy detected). Green pulses ripple outward, tile by tile, as the signal hops through a chain of four relays. Each relay lights up, processes, re-emits. The pulse reaches a striker at H7 on tick 5. Striker pivots, eliminates the enemy on tick 6. The whole thing looks like a nervous system firing — dendrite to synapse to axon to muscle. Caption: "I didn't program the flanking maneuver. I programmed the neurons."

---

### Variant B: Broadcast Radius (The "Boids Mode")

**Each unit has a broadcast radius based on type.** Scouts: 3 tiles. Strikers: 2 tiles. Relays: 5 tiles. Specialists: 3 tiles. Hook payloads reach all listeners within broadcast radius, regardless of direction. This is the Boids vision-radius model applied to communication.

**What this feels like:** Designing radio networks. Each unit has a transmitter with limited power. Relays are cell towers. The player thinks about coverage maps, dead zones, and signal overlap. The plan-screen ghost preview shows translucent circles around each unit representing their broadcast radius — the player can see where coverage gaps exist.

**Strengths:**
- More intuitive than pure adjacency — "my scout can shout to anyone within 3 tiles" is easier to grasp than "my scout can only whisper to its immediate neighbor."
- Still creates meaningful spatial constraints. A scout at A1 and a striker at H8 are out of range. The player must design relay chains for long-distance communication.
- Broadcast overlap creates interesting emergent effects: a signal from one scout reaches two relays, which both amplify, creating a wider wave — redundancy emerges naturally from placement.
- The relay's 5-tile radius makes it a high-value target. Enemy AI can target relays to collapse the player's communication network.

**Weaknesses:**
- More complex to visualize than adjacency. The player needs to understand overlapping circles on a grid, which is geometrically messier than four-directional arrows.
- Can feel "fuzzy" — unlike TIS-100 where data flow is crisp and traceable, broadcast-radius communication has a blob-like quality.
- EM emissions (locked mechanic) become spatially complex: enemies within broadcast radius detect the signal, creating a security-vs-speed tradeoff that may overwhelm new players.

---

### Variant C: Hop-Limited Channels (The "Network TTL Mode")

**Channels are global in name but signals have a hop counter.** When a hook fires a signal on channel `threat-east`, the signal carries a TTL (time-to-live) of N hops. Each relay that forwards the signal decrements TTL by 1. When TTL hits 0, the signal dies. Players configure TTL per hook.

**What this feels like:** Network engineering. The player thinks about TTL values, relay chain depth, and the tradeoff between signal reach and latency. A TTL-3 signal can cross 3 relays. A TTL-1 signal stays local. The player uses TTL to create local and global channels from the same wiring infrastructure.

**Strengths:**
- Elegant hybrid. Preserves the channel-name abstraction (players don't think about physical distance) while creating spatial constraints (TTL limits reach).
- Creates a natural information hierarchy: TTL-1 for local chatter, TTL-3 for critical alerts. The player explicitly designs how far each signal should travel.
- Teachable in stages: mission 1 has TTL=∞ (global channels). Mission 3 introduces TTL limits. The constraint appears after the player understands the baseline.
- Maps directly to real networking concepts (IP TTL, DNS hops), reinforcing the "vocabulary is 1:1 with real engineering" goal.

**Weaknesses:**
- Adds a configuration dimension (TTL per hook) that may feel like busywork. Each hook now has: event trigger, channel name, payload, AND TTL.
- Debugging becomes harder: "why didn't my striker receive the signal?" could be a buffer problem, a channel problem, OR a TTL-expired problem. Three failure modes instead of two.
- The metaphor is slightly leaky: in real networks, TTL is about loop prevention, not range limitation. Players who know networking may be confused by the repurposed concept.

---

### Variant D: Emergent Coordination via Tagging (The "Ant Colony Mode")

**No direct inter-agent communication at all.** Agents cannot send signals to each other. Instead, they interact through the **board** — tagging tiles with information markers (like pheromone trails). A scout that detects an enemy tags the tile with a `threat` marker. A striker that passes through a tile reads its markers. Coordination happens through the environment, not through direct messaging.

**What this feels like:** Ant colony optimization. Agents leave traces on the board. Other agents follow traces. The board IS the shared memory. The player designs what markers each agent type leaves and what markers each agent type responds to. The workbench replaces hook configuration with **marker configuration**: "Scout writes THREAT markers. Striker follows THREAT markers. Relay writes PATH-SAFE markers."

**Strengths:**
- Deeply unintuitive and therefore deeply teachable. The "aha" moment when a player realizes their scouts are leaving breadcrumb trails that their strikers follow *without ever communicating directly* is a profound emergent-systems insight.
- Board state becomes information-rich. The 8×8 grid isn't just terrain — it's a constantly-evolving information landscape. The player can see the "pheromone map" in the debrief inspector: heatmaps of marker density, trails showing information flow through space.
- No EM emissions problem. Since agents don't broadcast signals, there's no electromagnetic noise to detect. Stealth becomes the default.
- Scales beautifully with army size. 2 scouts leave thin trails. 10 scouts create rich, overlapping information landscapes. Emergence scales with population.

**Weaknesses:**
- Timing is terrible. A scout tags a tile at tick 5. A striker reaches that tile at tick 12. The information is 7 ticks old. In a one-shot-one-kill game, 7-tick-old threat data points at empty air.
- No compression or filtering. Hooks allow relays to compress, filter, and amplify signals. Tile markers are raw — whatever the scout wrote, whoever reads the tile gets it verbatim. No intelligence in the communication layer.
- The locked design's hook/channel/relay architecture is completely replaced, which contradicts the spec.
- Very hard to debug. "Why did my striker go to F7?" "Because there was a THREAT marker there." "Who put it there?" "A scout, 8 ticks ago." "Which scout?" "You can't tell — markers don't carry author metadata." The diagnostic chain is broken.

---

### Variant E: Hybrid — Local Communication + Global Awareness Sacrifice (The "Fog of War Mode")

**Communication is local (Variant B broadcast radius), but the player HAS a Command unit — however, the Command unit is also subject to locality.** The Command agent has no perception of its own (stationary, blind) and only knows what is reported to it via local relays. Its `reassign`/`reroute`/`prioritize` commands also have limited range — they can only affect units within 5 tiles.

**What this feels like:** Being a general who only knows what their messengers tell them. The Command agent is powerful but partially blind. The player must design a **courier network** — relays that carry battlefield reports to the Command agent and carry the Command agent's orders back out to the field.

**Strengths:**
- Preserves the meta-level (Tier 3 design) while creating spatial constraints around it. The player still builds "systems that manage systems" — but the management has latency and coverage limits.
- Creates dramatic moments: the Command agent receives a threat report 3 ticks late, issues a reroute order, but the order arrives 2 ticks after the striker was already eliminated. The player watches the sealed phase and realizes their courier network was too slow. The failure is *spatial*, not logical.
- Historically accurate metaphor: every real military command structure suffers from communication latency. The "fog of war" isn't just about what you can't see — it's about what you learn too late.
- Preserves all locked mechanics (hooks, channels, Command unit, production queue) while adding locality as a constraint layer on top.

**Weaknesses:**
- Complexity. The player must now design: (1) individual agent configs, (2) channel topology, (3) physical relay placement for coverage, (4) Command agent rules, AND (5) courier network to/from the Command agent. Five simultaneous design dimensions may exceed cognitive budget.
- The Command agent becomes useless if isolated. A single enemy unit that destroys the relay chain to the Command agent effectively decapitates the army. This might be too swingy for campaign missions but interesting for Gauntlet PvP.
- Blur between Variant B and the locked design. If the broadcast radii are generous enough, this is effectively the locked design with a slight spatial tax. The variant only becomes distinct when radii are tight enough to create real dead zones.

---

## Player Journeys

### Journey: Kai, 14, Minecraft Redstone Builder

**Context:** Mission 5 (factory introduction). Kai has completed missions 1-4 with pre-placed units and understands rules, hooks, and context. This is his first time placing units himself via the production queue. The mission uses Variant B (broadcast radius).

**Minute 0:00 — The Empty Board**
The plan screen loads. 8×8 grid on the left, workbench on the right. Unlike missions 1-4, the board shows only the player's base (bottom-left corner, a glowing data center built into rice terraces) and three enemy spawner positions (top-right quadrant). No pre-placed units. The production queue is an empty conveyor belt at the bottom.

Kai's eyes go to the workbench. Three blueprint slots are unlocked: Scout, Relay, Striker. Each has the familiar slot layout — skills, rules, hooks, context config. But there's a new overlay he hasn't seen before: a translucent circle around each unit's portrait in the workbench header. Scout: a cyan circle labeled "3" (broadcast radius). Relay: a wider circle labeled "5." Striker: a tiny circle labeled "2."

**Minute 0:45 — The Ghost Preview Discovery**
Kai drags a Scout blueprint onto the production queue. On the board preview, a ghost unit appears at the factory with a translucent cyan circle showing its 3-tile broadcast radius. He drags a Relay next. Its ghost circle (5 tiles) overlaps the Scout's. He drags a Striker. Its circle is tiny — barely covers adjacent tiles.

He thinks: "The striker can barely hear anything." He hovers over the Striker's broadcast radius indicator. A tooltip reads: "BROADCAST RADIUS: 2 tiles. This unit's hook signals reach units within 2 tiles. Increase range by routing signals through Relays."

**Minute 1:30 — The Coverage Gap**
Kai adds two more scouts and a second relay to the production queue. On the board preview, ghost units fan out from the factory in their patrol paths (configured in the Scout's rules). The broadcast circles move with them. He can see a gap — the northeast corner of the board has no coverage. A subtle red tint marks tiles where no unit's broadcast circle reaches.

"I need another relay there." He adds a third relay to the queue. The ghost for this relay appears along its programmed path. Its 5-tile circle fills the gap. The red tint disappears. The board preview now shows a quilt of overlapping cyan circles — full coverage.

**Minute 3:00 — The First Battle**
He hits EXECUTE. The sealed watch begins. Tick clock at the top. Units spawn and fan out. His scouts patrol, blue circles pulsing faintly around them (the broadcast visualization in sealed watch mode — subtle concentric rings that pulse outward when a hook fires).

**Tick 8:** Scout at C6 detects an enemy. A green flash — hook fires on `threat`. The green pulse ripples outward in a 3-tile circle. The relay at D4 catches it. The relay glows briefly, compresses the signal, re-broadcasts — a second green pulse, this one wider (5-tile radius). The striker at F5 catches the amplified signal.

**Tick 10:** The striker pivots toward the threat. Kai leans forward. "It worked. The relay passed the message."

**Tick 14:** An enemy appears at H2 — the far corner, outside any broadcast circle. No scout sees it. No relay covers it. It advances unopposed. Kai's striker at F5 is busy with the first threat.

**Tick 18:** The uncovered enemy reaches his factory. Red flash. Factory takes damage.

"I left a hole." The sealed watch ends. Kai immediately wants to go back to the plan screen and add coverage to H2. The spatial gap was *visible* — he could see exactly where his network failed. The failure was legible.

**UI Annotations:**
- **Broadcast circles:** Translucent colored rings in ghost preview (plan screen) and subtle animated pulses in sealed watch. Cyan for player units, red for detected enemy emissions.
- **Coverage gap indicator:** Tiles not covered by any broadcast radius tinted pale red in plan-screen preview. Disappears when a unit's ghost circle covers the tile.
- **Signal propagation animation:** Green concentric rings expanding from the transmitting unit, fading at broadcast radius edge. When a relay re-broadcasts, a second set of rings emerges centered on the relay, visually larger.

---

### Journey: Priya, 32, Staff Software Engineer (Distributed Systems)

**Context:** Mission 8 (full system, factory vs factory). Priya has mastered the campaign through mission 7, using relay chains extensively. She's a distributed systems engineer IRL — she thinks in terms of consensus, partitioning, and failure modes. This mission uses Variant E (local communication + local Command agent).

**Minute 0:00 — The Architecture Sketch**
Before touching the workbench, Priya opens a physical notebook. She sketches the 8×8 grid. Marks the player base (A1) and enemy base (H8). Draws relay positions: D3, D6, E4. Draws lines between them showing broadcast coverage. Labels the Command agent at B2 — close to the base, within relay range of D3.

She's designing a **star topology** with the Command agent at the hub: scouts report to the nearest relay → relays forward to Command → Command issues reroute orders → orders propagate back through relays → strikers receive updated instructions.

She mutters: "Latency budget. Scout→Relay: 1 tick. Relay→Command: 1 tick. Command processes: 1 tick. Command→Relay: 1 tick. Relay→Striker: 1 tick. Minimum response time: 5 ticks from detection to striker action." She writes "5-tick RTT" on her sketch.

**Minute 2:00 — The Partition Scenario**
She configures the Command agent's rules: "If context contains `threat-count ≥ 3`, then `reroute(channel:patrol-east, target:STRIKER-B)` — pull striker B to the threatened sector." She configures a fallback: "If context contains `relay-D3-silent` (no signal from relay D3 for 3 ticks), then `prioritize(all-strikers, eviction:oldest-first)` — assume we've lost contact with the east sector, switch all strikers to defensive posture."

She's programming **partition tolerance** into her army. If a relay gets destroyed, the Command agent detects the silence and adapts. She thinks: "This is literally the CAP theorem. I can't have Consistency (all units see the same state), Availability (all units can act), and Partition tolerance (the network can split) at the same time. In this game, partitions are physical — an enemy destroys a relay and the network splits."

**Minute 5:00 — The Battle**
She hits EXECUTE. The sealed watch unfolds. Her star topology holds for the first 20 ticks. Signals flow smoothly: scout→relay→command→relay→striker, green pulses rippling back and forth across the board like a heartbeat.

**Tick 22:** Enemy specialist targets relay D3. Red flash — relay destroyed. The neat star topology fractures. Command agent at B2 still receives from relay D6 (close enough) but has no coverage in the east sector.

**Tick 25:** Command's rule fires: "relay-D3-silent → 3 ticks of silence detected." It issues the defensive reroute. But the order can only reach strikers within 5 tiles of the Command agent's broadcast radius. Striker-A at C4 receives the order and pivots. Striker-B at G5 is out of range. It never gets the order. It keeps patrolling, oblivious to the network partition.

**Tick 30:** Striker-B walks into an ambush. Eliminated. Priya watches, heart sinking, because she *knows exactly what happened.* The partition. The unreachable striker. The message that never arrived.

**Tick 45:** She wins the mission anyway — the defensive pivot saved enough of her army. But Striker-B's death was preventable with a different relay placement.

**In the Inspector (Minute 8:00):**
She scrubs to tick 22. Clicks the destroyed relay. Sees its last buffer state — full of threat reports it was about to forward. Clicks Striker-B. Sees its buffer at tick 25: completely unaware of the Command's reroute order. The "decision trace" shows: "Rule 2 matched (patrol-east). No higher-priority data in buffer." The striker didn't know it should stop patrolling because the information never reached it.

Priya grins. "This is the game I wanted." She goes back to the plan screen and redesigns: a **mesh topology** with redundant relay coverage, so that destroying one relay doesn't partition the network.

**UI Annotations:**
- **Command range circle:** Gold translucent ring around Command agent in ghost preview. Shows which units can receive its orders.
- **Network partition indicator (Inspector):** When a relay is destroyed, the Inspector's timeline shows a red "PARTITION" marker at that tick. Clicking it highlights which units were cut off from the Command agent.
- **Signal genealogy in Inspector:** Clicking any signal in a unit's buffer shows the full path it traveled — which relays it hopped through, how many ticks each hop took, and where the chain broke.

---

### Journey: Marcus, 58, Retired Teacher, First Strategy Game

**Context:** Mission 2 (tutorial — teaching rules). Marcus has never played a strategy game. His grandson installed this on his tablet. The game uses Variant C (hop-limited channels) but mission 2 hasn't introduced TTL yet — all channels are global (TTL=∞). The constraint is coming in mission 4.

**Minute 0:00 — The Familiar Board**
Marcus sees the 8×8 board from mission 1. Two pre-placed units: a scout at B3 and a striker at F5. The mission briefing (boot log style) reads:

```
> SUBSYSTEM: rule-engine v0.2
> STATUS: online
> NOTE: Your units share a common frequency.
>       What SCOUT-A reports, STRIKER-B hears.
>       This will not always be true.
>       For now: one voice, all ears.
```

Marcus taps the scout. The workbench shows its rules and a single hook: `ON enemy_detected → SEND on channel "alert"`. The hook has a small badge: "∞" — meaning infinite range. He doesn't know what it means yet, but it's there for later reference.

**Minute 0:30 — Success With Global Channels**
He configures a simple rule for the striker: "IF buffer contains alert → MOVE toward alert source." He hits EXECUTE. The scout detects an enemy, sends the alert — green flash — and the striker immediately pivots and eliminates the threat. Marcus smiles. "That was easy."

**Mission 4 (three missions later):**

**Minute 0:00 — The Boot Log Warning**
```
> SUBSYSTEM: signal-propagation v0.4
> WARNING: signal attenuation detected.
>          Transmissions no longer reach all units.
>          Each signal carries a HOP LIMIT.
>          SCOUT-A can broadcast 3 hops.
>          RELAY-C can boost to 5 hops.
>          Without relays, distant units hear nothing.
```

Marcus sees that the "∞" badge on the scout's hook has changed to "3." The workbench shows a new field on each hook: **Hop Limit** — a number spinner that defaults to 3 for scouts, 5 for relays, 2 for strikers.

**Minute 1:00 — The First Failure**
He runs the same configuration from mission 2. Scout detects enemy. Green flash — but the pulse fades after 3 tiles. The striker at F5 (4 tiles away) never receives the signal. Its buffer stays empty. The striker stands still while the enemy advances.

Marcus frowns. "Why didn't it get the message?" He taps the striker in the debrief. The context window display shows: empty. "No signals received this mission." He taps the scout. Its hook shows: "SENT on alert, hop limit: 3. Reached: 0 listeners."

**Minute 2:00 — The Relay Insight**
The mission hint panel (subtle, bottom of screen) shows a pulsing icon. Marcus taps it. "TIP: Place RELAY-C between SCOUT-A and STRIKER-B. Relays extend signal range." He goes back to the plan screen. A pre-placed relay sits at D4 — between the scout and striker. He configures the relay: listen on `alert`, amplify and re-send on `alert`.

He hits EXECUTE again. Scout fires signal (3 hops). Relay at D4 catches it (within 3 tiles). Relay amplifies and re-sends (5 hops). Striker at F5 catches the amplified signal (within 5 tiles of the relay). Striker acts.

Marcus watches the signal hop: green flash at scout, green pulse → relay catches it, second green pulse (wider) → striker catches it. The visual tells the story: the relay bridged the gap. He murmurs: "Oh, it's like a cell tower."

**UI Annotations:**
- **Hop limit badge:** Small number badge on each hook in the workbench. "3" for scout hooks, "5" for relay hooks, "2" for striker hooks. "∞" when unlimited (tutorial missions).
- **Signal attenuation animation:** Green pulse circle that fades/shrinks as it reaches its hop limit. At hop limit, the circle border turns from solid green to dashed, then disappears. Visually communicates "the signal ran out of energy."
- **Relay bridge animation:** When a relay catches and re-sends a signal, a distinct visual: the relay icon brightens, a brief amber glow (processing), then a NEW green pulse emits from the relay, visibly wider than the incoming one. The player sees the relay as an active amplifier, not a passive pipe.

---

## Strengths and Weaknesses (Cross-Variant)

### Strengths of No-Coordinator Design

1. **Spatial reasoning becomes primary.** The board isn't just where combat happens — it's where *information flows*. Every relay placement is a network engineering decision. The 8×8 grid becomes a communication topology puzzle layered on top of a tactical puzzle. This is genuinely novel in strategy games.

2. **Emergent behavior is maximized.** When agents can only see their neighbors, complex coordination that emerges from local rules feels like magic. The player programs "cells" and watches an "organism" emerge. This is the Boids/Life feeling — the gap between "I understand every piece" and "I didn't predict the whole" is maximized.

3. **Relay becomes the star unit.** In the locked design, the relay is useful but not essential — global channels work without relays. In no-coordinator variants, the relay is CRITICAL. It's the neuron, the cell tower, the supply chain hub. Relay placement becomes the core strategic decision. This gives the relay a clearer identity and a more dramatic role.

4. **Network destruction becomes a real tactic.** If the enemy can identify and destroy a key relay, the player's entire communication network partitions. This creates dramatic moments in the sealed watch: the relay falls, half the army goes dark, the surviving units try to coordinate with degraded information. The player watches helplessly as their distributed system suffers a network split.

5. **Maps directly to real distributed systems concepts.** Broadcast radius = network range. TTL = packet hop limit. Relay chains = routing infrastructure. Network partition = consensus failure. The game's educational transfer to real engineering is STRONGEST in this variant.

### Weaknesses of No-Coordinator Design

1. **Cognitive overload.** The locked design already asks the player to manage skills, rules, hooks, context config, production queue, AND channel topology. Adding spatial communication constraints is a seventh dimension. The breadth-first learning curve may be too steep for missions 1-4.

2. **Latency tax.** Every relay hop costs 1 tick. In a 50-tick mission, a 5-hop relay chain means 5 ticks of response time. In a one-shot-one-kill game, 5 ticks is an eternity. The player may feel punished for having a large, well-organized army simply because the communication overhead is too high.

3. **Relay spam meta.** If communication is the bottleneck, the dominant strategy may always be "produce as many relays as possible." This collapses the unit-diversity puzzle. Why build a specialist when you need another relay to maintain coverage?

4. **Debugging complexity.** In the locked design, "why didn't my striker act?" has two possible answers: wrong rule or wrong buffer state. In the no-coordinator variant, there's a third: "the signal didn't reach it." Debugging now requires understanding the physical signal path AND the logical channel path. The Inspector needs a signal-path-tracing tool on top of everything else.

5. **Meta-level regression.** The locked design's Tier 3 (systems that manage systems) is one of Robot Uprising's most distinctive promises. Removing the Command agent removes the most direct expression of this meta-level. Variant E preserves it with locality constraints, but pure no-coordinator variants (A, B, D) sacrifice the meta-level entirely in exchange for emergence.

---

## Interaction Effects

### With Locked Mechanics

- **Context overload (locked):** In no-coordinator variants, context overload becomes MORE dangerous because there's no Command agent to issue "flush your buffer" orders. Units that overload are stunned for 1 tick AND can't receive the corrective command that would prevent future overloads. Overload cascades — one stunned relay means a communication gap, which means other units don't receive warnings, which means they also overload.

- **EM emissions (locked):** Broadcast radius creates a natural tradeoff: wider broadcast = faster communication but louder EM noise. The enemy can detect your relay positions from their emissions. In Variant B, the relay's 5-tile broadcast is a 5-tile detection beacon. Stealth architectures might use Variant A (adjacency only) to minimize EM footprint, accepting slower communication for lower visibility.

- **Factory production (locked):** The production queue gains a spatial dimension. The player must not only decide WHAT to build but WHERE each unit will be needed for communication coverage. A striker produced after a relay is destroyed might need to serve double duty as a combat unit AND an emergency signal repeater.

- **One-shot-one-kill (locked):** This constraint makes relay destruction devastating. One lucky enemy striker adjacent to your relay → instant kill → network partition. The player must decide: protect relays with defensive strikers (reducing offensive power) or accept network fragility (reducing information quality). A genuine strategic dilemma.

### With Other Design-Space Options

- **Building blocks: node-graph paradigm** — The plan screen becomes a literal network diagram. Each unit is a node. Broadcast radius determines which nodes can wire to which. The player physically draws connections between units that are within range. Nodes outside range can't be directly wired. This is the most natural match for no-coordinator designs.

- **Campaign: mission-design-robustness-scenarios** — Missions can be designed around network topology challenges. "Enemy rush" missions test whether the player's relay network can propagate alerts fast enough. "Decapitation" missions feature enemies that target relays specifically. "Fog" missions have terrain that blocks signal propagation (jungle tiles reduce broadcast radius by 2).

- **Aesthetics: signal chains visible (locked)** — In the sealed watch, colored dashed lines between units show active signal paths. In no-coordinator variants, these lines become the MOST important visual element. The player watches their relay network light up like a nervous system. When a relay dies, the lines snap — the visual reads as "communication severed."

---

## Comparable Games and Media

### TIS-100 (Zachtronics, 2015)
The foundational reference. TIS-100's 12-node mesh with adjacency-only communication IS Variant A. Every TIS-100 puzzle is fundamentally about routing data through a network of constrained nodes. The key lesson: **the routing IS the puzzle.** Players spend more time thinking about how to move data between nodes than about what each node computes. Robot Uprising's no-coordinator variant would likely have the same property — relay placement and signal routing become the primary design challenge, with individual agent configuration as secondary.

### Boids / Reynolds' Flocking (1986)
Three rules (separation, alignment, cohesion), local perception only, no global coordinator, yet the flock moves with stunning coherence. The lesson for Robot Uprising: **local rules can produce globally coherent behavior when the rules are well-tuned.** The player's job in Variant B is tuning broadcast radii and hook configurations so that local interactions produce coordinated army movement — not by programming the coordination directly, but by creating the conditions for it to emerge.

### Conway's Game of Life (1970)
Four rules, local neighbors only, Turing-complete emergent behavior. The lesson: **the simplest local rules can produce infinite complexity.** The risk is also clear: Life's behavior is notoriously hard to predict. A player who configures local rules in Robot Uprising may be unable to predict what their army will do, even though they understand every rule. This is exciting (emergence!) and frustrating (un-debuggable!) in equal measure.

### Gladiabots (GFX47, 2015-present)
Gladiabots uses **team tags** as a form of global coordination (any bot can read any team tag) and **local tags** as individual memory. The lesson: even in a game about programming robot behavior, the developer found that SOME global communication was necessary for satisfying gameplay. Pure locality may be too harsh.

### Screeps (2016)
Screeps gives players full JavaScript control over creeps in a persistent world. Communication between creeps is local (they can only access room-level state) but players can implement global coordination through code. The lesson: **locality creates the NEED for relay infrastructure**, which becomes a game within the game. Screeps players who build good communication systems outperform those who only optimize individual creep behavior.

### Ant colonies (real-world)
The Variant D (pheromone/tagging) model directly references ant colony optimization. Ants have no central coordinator — they communicate through chemical trails on the environment. The lesson: **environmental communication scales with population** and creates self-reinforcing patterns (more ants on a good path → stronger trail → more ants follow). The weakness: pheromone trails are slow, noisy, and can create pathological feedback loops (ant mills, where ants follow each other in circles).

---

## Sensory Description

### Plan Screen (Variant B — Broadcast Radius)

The workbench takes the right two-thirds of the screen. The 8×8 board preview fills the left third. Each ghost unit on the board preview emanates a soft translucent circle — **scout circles are cool cyan**, 3 tiles wide, with a faint pulse at the edge like sonar. **Relay circles are warm amber**, 5 tiles wide, steady and solid — they feel reliable, like streetlights. **Striker circles are tight crimson**, barely extending beyond the unit's tile, a reminder that strikers are listeners, not speakers.

Where circles overlap, the intersection brightens slightly — a pale white-green that reads as "covered by multiple units." The coverage map is immediately legible: bright areas have redundant communication, dim areas have single coverage, and tiles with NO circle coverage glow a subtle **desaturated pink** — dead zones.

As the player drags a relay ghost to a new position in the production queue preview, the amber circle slides across the board in real-time. Dead zones vanish as the circle covers them. The player can SEE the network healing.

### Sealed Watch (Network Partition Event)

**Tick 22.** The relay at D3 shares a tile with an enemy striker. **Red flash** — combat. The relay's amber tile outline snaps to grey. A brief animation: the amber broadcast circle that was pulsing outward from D3 contracts rapidly inward like a deflating balloon, then pops — a shower of amber pixels that scatter and fade. The signal lines (dashed colored lines between units) that passed through D3 snap one by one, each with a tiny white spark at the break point. The sound: a clean, high-pitched **snap** — like a guitar string breaking. Then silence in that sector.

Units that were connected through D3 continue operating, but their context bars (tiny colored pips at the bottom of each tile) stop updating. The pips freeze — no new information flowing in. Over the next 2-3 ticks, the color of the frozen pips fades from bright to dim, signaling **stale data**. The army in the east sector is alive but deaf and blind, operating on memory.

### Inspector (Signal Trace)

The player clicks a striker that failed to respond to a threat. The sidebar shows the decision trace:

```
Tick 25: Rule 2 matched → PATROL-EAST
  Context window: [slot 1: patrol-east waypoint (age: 14 ticks)]
                  [slot 2: (empty)]
                  [slot 3: (empty)]
                  [slot 4: (empty)]
  ⚠ Expected signal: "threat-east" from RELAY-D3
  ⚠ Signal status: NEVER RECEIVED
  ⚠ Reason: RELAY-D3 destroyed at tick 22. Signal path severed.
```

The "NEVER RECEIVED" line glows amber. Tapping it opens the **signal trace view**: a miniature board overlay showing the intended signal path as a dotted gold line from SCOUT-A → RELAY-D3 → STRIKER-B. The line reaches RELAY-D3 and hits a red X. A tooltip: "Relay destroyed. Signal could not propagate beyond this point."

The player taps "Show alternative paths." The board shows whether any other relay could have bridged the gap. In this case: no. The path was singular. The lesson is clear: **redundant relay coverage would have saved this striker.**

---

## Recommendation for Robot Uprising

**Variant E (Hybrid — Local Communication + Local Command)** is the strongest option for the locked design. Here's why:

1. It preserves the meta-level (Command agent, Tier 3 design) which is one of Robot Uprising's most distinctive features.
2. It adds spatial constraints that create the relay-placement puzzle without removing any existing mechanics.
3. It can be introduced gradually: missions 1-4 use global channels (∞ range), mission 5 introduces broadcast radius with the factory, missions 6-7 introduce the locality-constrained Command agent.
4. It maps cleanly to real distributed systems concepts, reinforcing the educational transfer goal.
5. It creates dramatic sealed-watch moments (network partitions, communication delays) that are viscerally legible.

However, **Variant B (Broadcast Radius) as a standalone** is the cleanest option if the Command agent is ever removed. And **Variant C (Hop-Limited TTL)** is the best option if channels must remain logical rather than physical.

The critical design tension: **locality makes the relay essential, but relay-dependency makes the army fragile.** The game must ensure that relay-heavy architectures aren't strictly dominant (enemy AI should exploit relay-dependent architectures) and that relay-light architectures remain viable (close-range striker swarms that don't need long-distance communication).

---

## New Aspects Discovered

- **2.00f-i — Relay as single point of failure: network resilience design.** How does the player protect critical relays? Dedicated defender strikers, redundant relay paths, relay self-defense skills? The "network resilience" design puzzle.
- **2.00f-ii — Signal attenuation as terrain modifier.** Jungle tiles reduce broadcast radius by 2. City tiles amplify by 1. Terrain becomes a communication infrastructure variable, not just a movement/combat variable.
- **2.00f-iii — Emergent flocking from local rules: can Robot Uprising units exhibit Boids-like coordinated movement through local-only perception and communication?** What rule configurations produce flock-like behavior without any explicit coordination signal?
- **2.00f-iv — The "courier problem" in Variant E: designing the relay network specifically to service the Command agent.** The relay chain from battlefield to Command and back as a first-class design challenge. Courier network optimization as mid-campaign teaching sequence.
- **2.00f-v — Pheromone trails as optional Specialist skill: hybrid between Variant D (tile-marking) and the locked design.** Specialists could have a "mark" skill that tags tiles with information, enabling local-information-sharing without requiring hook channels. A complementary communication mode alongside hooks.
