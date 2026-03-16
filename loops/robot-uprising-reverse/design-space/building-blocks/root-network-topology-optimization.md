# 3.19a-ii — Root Network Topology Optimization: The Spatial Puzzle of Rooted Unit Placement

## Overview

When a player roots a unit using the Seed Pod mechanic (Model D from 3.19a), they're making an irreversible spatial commitment on the 8×8 grid. One rooted unit is a tactical choice. Two or three rooted units form a *network topology* — and the spatial relationships between those nodes determine signal latency, coverage overlap, defensive vulnerability, and EM emission profiles. This document explores root network topology as a standalone spatial puzzle layer: a game-within-the-game that rewards players who think about the grid as an infrastructure layout problem, not just a battlefield.

The core insight: **root placement is network architecture expressed as geography.** Where you root a relay determines who hears what, how fast, and how loudly. This makes every root decision simultaneously a tactical choice (unit positioning), an infrastructure choice (signal routing), and an economic choice (forward production placement). The game's spatial dimension stops being "where do my units fight" and becomes "where do I build my information highways."

---

## The Design Space: Six Topology Paradigms

### Paradigm 1: "The Star" — Central Hub with Peripheral Spokes

**Shape:** One rooted relay at or near the center of the board (D4/D5/E4/E5). Mobile units radiate outward like spokes. All signals route through the center.

**How it works mechanically:**
- Central relay with compress + amplify + 4 hook slots = the information backbone
- Rooted at D4 (center), perception is irrelevant (relay has none), but signal *reception* covers every unit within hook reach
- Mobile scouts at board edges send observations to the central relay via channel `recon-net`
- Central relay compresses, filters, and re-broadcasts on `threat-net` to strikers
- Every signal passes through one node: latency is always exactly 2 hops (scout→relay→striker)

**Signal latency analysis:**
- Scout at A1 → relay at D4: 1 tick (hook transmission)
- Relay at D4 → striker at H8: 1 tick (hook transmission)
- Total: 2 ticks for any scout→striker communication
- But: ALL signals bottleneck through one relay. At tick 15, if three scouts all report simultaneously, the relay's buffer (12 slots) receives 3 signals in one tick. If each observation is 2-3 slots, the relay is at 50-75% capacity from one tick of input.

**Coverage analysis on 8×8:**
- A relay at D4 with 4 hook slots can listen on 4 channels. If each channel represents a sector (NW, NE, SW, SE), every tile on the board is covered by exactly one channel.
- Perception radius is irrelevant for rooted relays (they don't observe — they process).
- The "star" topology has zero redundancy: if the center relay dies, the entire network collapses. No signal reaches any striker.

**EM emission profile:**
- One rooted relay = double EM emission (rooted bonus) + all hook transmissions centralized = a massive electromagnetic beacon at D4
- Enemy AI reads the star's center like a bullseye. Every enemy striker paths toward D4.
- Counter: root the relay behind defensive terrain, assign striker escorts

**Strengths:**
- Simplest mental model — one hub, everything routes through it
- Minimum latency (2 hops for any communication)
- Easy to diagnose in Inspector (all signals visible at one node)
- Teaches the hub-and-spoke pattern used in real network architecture

**Weaknesses:**
- Single point of failure (relay death = total communication blackout)
- EM concentration makes center an obvious target
- Buffer saturation at high unit counts (12 slots can't absorb 6 scouts reporting simultaneously)
- Doesn't scale past ~8 mobile units without context overload at the hub

**Comparable:** Classic client-server architecture. Every web request routes through one load balancer. Works until the load balancer dies.

---

### Paradigm 2: "The Mesh" — Multiple Rooted Units With Overlapping Coverage

**Shape:** 2-3 rooted relays at distributed positions (e.g., C3, F3, D6), each covering a sector, with overlapping zones where any relay can pick up signals from adjacent sectors.

**How it works mechanically:**
- Three relays rooted at C3, F3, and D6 create a triangle of coverage
- Each relay listens on sector-specific channels plus one shared `emergency` channel
- Scouts in the overlap zone (tiles near D4-E4) are heard by two relays simultaneously
- Strikers subscribe to their nearest relay's output channel, creating regional command zones
- If one relay dies, adjacent relays already cover ~40% of the dead relay's zone

**Signal latency analysis:**
- Scout at A1 → nearest relay (C3): 1 tick
- Relay C3 → striker at B5: 1 tick
- Total: 2 ticks for same-sector communication (same as star)
- Cross-sector: scout at A1 → relay C3 → relay F3 → striker at H2: 3 ticks (relay-to-relay hop adds 1 tick)
- The mesh trades same-sector speed (identical to star) for cross-sector latency (1 tick penalty)

**Coverage analysis on 8×8:**
```
  A  B  C  D  E  F  G  H
8 [       D6 zone        ]
7 [    D6 zone           ]
6 [   D6●zone            ]
5 [ C3     overlap    F3 ]
4 [ C3  overlap zone  F3 ]
3 [ C3●  zone      F3●  ]
2 [ C3 zone      F3 zone]
1 [C3             F3     ]

● = rooted relay position
```
- Tiles near D4-E4 are in the "golden triangle" — heard by all three relays
- Edge tiles (A1, H1, A8, H8) are served by exactly one relay
- The mesh has partial redundancy: losing one relay degrades, not destroys

**EM emission profile:**
- Three rooted relays = three separate EM sources, each at double emission
- Total network EM is higher than the star (3 relays × 2× vs. 1 relay × 2×)
- But the emission is *distributed* — enemy AI doesn't see one bullseye, it sees three targets
- This can actually help defensively: enemy strikers split their attention between three targets instead of converging on one

**Strengths:**
- Fault-tolerant — any single relay loss is survivable
- Distributes buffer load across 3 nodes (each handles ~2 scouts instead of all 6)
- Cross-sector intelligence sharing through relay-to-relay hops
- Teaches distributed systems, redundancy, and the CAP theorem

**Weaknesses:**
- Higher total resource cost (3 relays × 5m = 15m vs. 5m for single relay, plus 3 × 2e/tick upkeep)
- Cross-sector communication is slower (3 hops vs. 2)
- More complex to configure (each relay needs different channel subscriptions)
- The "triangle" positions are not always viable (terrain, enemy spawners may block optimal placement)

**Comparable:** Mesh networking (Wi-Fi mesh routers). Each node handles local traffic and forwards cross-network requests. Resilient but latent.

---

### Paradigm 3: "The Spine" — Linear Chain Along a Corridor

**Shape:** 2-3 rooted relays in a line (e.g., B4, D4, F4), creating a communication backbone along one axis of the board.

**How it works mechanically:**
- Relays form a signal pipeline: information flows west→east (or vice versa) through sequential hops
- Each relay compresses information from its local zone before passing it down the line
- The spine acts like a fiber optic cable: high-bandwidth, directional, fragile
- Scout observations enter the spine at the nearest relay and travel to the Command unit at one end

**Signal latency analysis:**
- Scout at A4 → relay B4: 1 tick
- Relay B4 → relay D4: 1 tick
- Relay D4 → relay F4: 1 tick
- Relay F4 → striker at H4: 1 tick
- Total: 4 ticks for end-to-end communication (worst case)
- But each relay compresses, so the final message is highly processed — less raw data, more refined intelligence
- The spine's latency is its cost; its compression pipeline is its value

**The compression cascade:**
- Relay at B4: receives raw scout observations, compresses to threat-level summary
- Relay at D4: receives B4's compressed summary + its own sector observations, filters redundancies, compresses further
- Relay at F4: receives D4's double-compressed intelligence, adds priority tagging, broadcasts final signal
- Each hop reduces data volume but adds processing delay
- This IS a real-world data pipeline: sensor → edge compute → aggregation → decision

**Strengths:**
- Maximum compression — information is refined at every hop
- Teaches pipeline architecture, MapReduce concepts
- Easy to understand spatially (left to right, like reading)
- Works well on boards with terrain corridors (jungle paths, city streets)

**Weaknesses:**
- Maximum latency (4 ticks end-to-end vs. 2 for star/mesh)
- Single chain failure cascades — losing D4 (middle) splits the network in two
- Information only flows one direction efficiently (east scouts get stale intelligence about the west)
- Vulnerable to enemy "spine snapping" — target the middle relay to bisect the network

**Comparable:** Submarine fiber optic cables. High bandwidth, high latency, catastrophic if cut. The SEA-ME-WE 3 cable outage pattern.

---

### Paradigm 4: "The Picket Fence" — Rooted Scouts as Observation Posts

**Shape:** Instead of rooting relays, root scouts at forward positions to create a permanent perception network.

**How it works mechanically:**
- Rooted scouts at C2, C5, C7 create a forward observation line
- Each rooted scout has permanent perception (Wide: 5 tiles) anchored to its position
- Rooted scout gets +2 buffer (from root bonus) = 8 buffer, rivaling a striker
- The scout can't patrol or evade anymore, but observe-in-place + hook means it continuously reports everything in its cone
- Mobile relays behind the picket line aggregate and compress scout data

**Coverage analysis on 8×8:**
```
  A  B  C  D  E  F  G  H
8          ◎
7       ●5◎◎◎
6       ◎◎◎◎◎
5    ●5◎◎◎◎
4    ◎◎◎◎◎
3    ◎◎◎
2 ●5◎◎◎◎
1 ◎◎◎◎

● = rooted scout (perception radius 5)
◎ = observed tile
```
- Three rooted scouts cover approximately 30 of 64 tiles permanently
- The eastern half of the board is unobserved — but that's likely enemy territory where you send disposable mobile scouts anyway
- Rooted scouts see the *approach lanes* — any enemy entering the western half is detected immediately

**EM emission profile:**
- Rooted scouts emit less than rooted relays (scouts have 2 hook slots vs. relay's 4, and scout observation is passive — only hook *transmissions* emit)
- A picket fence is *quieter* than a star or mesh relay network
- The stealth advantage: enemy AI might not detect rooted scouts if they're configured with minimal hook use (observe-and-store rather than observe-and-broadcast)

**Strengths:**
- Permanent early warning system — no more "I didn't see the enemy coming"
- Lower EM profile than relay-based topologies
- The rooted scout's +2 buffer means it can hold more observations before overload
- Teaches "sensor placement" — a real military and security concept

**Weaknesses:**
- Scouts are fragile — one-shot-one-kill + stationary = easy targets
- No compression or filtering at the observation point (raw data floods the relay network)
- Uses scout slots for infrastructure instead of mobile reconnaissance
- Doesn't help with signal *processing* — only with signal *generation*

**Comparable:** Military picket lines, radar early-warning stations, IoT sensor networks. The DEW Line (Distant Early Warning) along the Arctic during the Cold War.

---

### Paradigm 5: "The Fortress" — Rooted Units Clustered Around Base

**Shape:** All rooted units within 2 tiles of the player's base, creating a heavily defended production zone.

**How it works mechanically:**
- Rooted relay at base-adjacent tile: processes all signals without any transit delay
- Rooted scout at base-adjacent tile: permanent perception covering the base approach
- Rooted specialist at base-adjacent tile: permanent hack/extract capability on nearby enemies
- Mobile units are entirely offense-focused — they don't need to defend because the base is self-defending
- Production from rooted units spawns at forward positions (the root *is* the forward spawn, but here it's near base)

**The defensive posture:**
- Base at A1 (example). Rooted relay at B1, rooted scout at A2, rooted specialist at B2
- Scout at A2 sees anything approaching from rows 1-6 on columns A-E
- Relay at B1 processes scout data instantly (1-hop, adjacent)
- Specialist at B2 hacks approaching enemies (reveal their context window contents)
- The "fortress" leaks no intelligence to the front — all processing stays within 2 tiles of base

**Strengths:**
- Maximum base security (enemy can't sneak-attack the factory)
- Minimum signal latency for base defense (everything is adjacent)
- Production decisions informed by perfect local intelligence
- Simple to configure (all rooted units share the same local channels)

**Weaknesses:**
- Zero forward presence — mobile units operate blind until they report back (3-4 tick latency)
- The entire rooted network is within blast radius of a single enemy striker push
- Wastes the forward-spawn advantage of root (spawning at base is what the factory already does)
- Teaches a defensive playstyle that doesn't scale — "turtle" strategies are effective early but fail against factory-vs-factory missions

**Comparable:** Tower defense games. The "deathball" in StarCraft. Factorio players who never expand beyond their starting area.

---

### Paradigm 6: "The Asymmetric Web" — Mixed-Type Rooted Units in Specialized Positions

**Shape:** Different unit types rooted at positions that maximize their unique capabilities: relays at signal junctions, scouts at perception-critical positions, specialists at hack-range positions near enemy spawners.

**How it works mechanically:**
- Rooted relay at D4 (central signal hub — processes all cross-board communication)
- Rooted scout at F7 (forward observation — watches enemy spawner at H8)
- Rooted specialist at E3 (hack range — can hack any enemy passing through E1-G5)
- Each rooted unit serves a different architectural purpose; the topology isn't symmetric
- Channel design matches the asymmetry: `perimeter-watch` (scout→relay), `threat-intel` (relay→strikers), `enemy-context` (specialist→command)

**Signal latency analysis:**
- Scout at F7 detects enemy at G8: 1 tick to observe
- Scout hooks to relay at D4 via `perimeter-watch`: 1 tick
- Relay compresses and hooks to strikers via `threat-intel`: 1 tick
- Total: 3 ticks from detection to striker awareness
- Specialist at E3 hacks enemy at F3 (within range): 1 tick to extract
- Specialist hooks to command via `enemy-context`: 1 tick
- Total: 2 ticks from hack to command awareness
- The asymmetry means different information paths have different latencies — the architecture has *heterogeneous timing*

**Strengths:**
- Maximum capability utilization — every rooted unit does what its type does best
- Teaches the "right tool for the right job" principle in network architecture
- Creates the most interesting Inspector visualizations (multiple signal types, multiple paths)
- Highest strategic ceiling — the number of viable asymmetric configurations is enormous

**Weaknesses:**
- Most complex to configure — each rooted unit has different channels, rules, and hooks
- No redundancy (each capability exists at exactly one position)
- Requires deep understanding of all unit types to place optimally
- The asymmetry means no two missions use the same topology — players can't memorize layouts

**Comparable:** Real-world network architecture with specialized nodes — DNS servers, CDN edge nodes, API gateways, database clusters, each positioned for its role.

---

## The Topology Optimization Puzzle

### What Makes This a Game

The spatial placement decision becomes a genuine puzzle because of intersecting constraints:

1. **Terrain.** Mountains block line-of-sight. Jungle tiles slow movement but don't block signals. Urban tiles provide cover. Water tiles are impassable. The terrain on each mission's board creates different optimal topologies — what worked on Ifugao's terraces won't work on Manila's megacity.

2. **Enemy spawner location.** Knowing where enemies appear determines where observation posts need to be. If the enemy spawner is at H8, a rooted scout at F7 is gold. If there are two spawners at H1 and H8, the picket fence needs to cover both approaches.

3. **Resource node placement.** Rooted units permanently tag adjacent tiles. If a resource node is at D4, rooting there generates permanent income. The economic pull of resource nodes distorts the "optimal for signals" topology toward "optimal for income."

4. **EM emission budget.** Every rooted unit adds to the total EM signature. More roots = more noise = more enemy attention. The player must balance network quality against stealth. Three rooted relays is a better network but a louder one.

5. **Unit slot limits.** Rooting a unit consumes it permanently. The player has limited production capacity — every rooted unit is one fewer mobile combatant. Root three relays and you might not have enough strikers to protect them.

### The Topology Planning Tool

**Plan Screen Enhancement: The Root Planner**

When the player selects a unit with the `root` skill, the Plan screen board preview transforms into a topology planning overlay:

- **Coverage cones:** Translucent colored regions showing what each potential root position would observe (for scouts) or reach (for relays via hook range). The player drags the unit's ghost to different tiles and watches the coverage shift in real-time.
- **Latency numbers:** Small digit badges on each tile showing "ticks from here to base" and "ticks from here to nearest striker." The player sees the signal timing consequences of each position.
- **EM heat map:** Tiles glow warmer (amber→red) the more EM emission a root at that position would generate. Tiles near other rooted units glow hottest (overlapping EM fields).
- **Coverage overlap visualization:** Where two rooted units' coverage areas overlap, the overlap zone glows brighter — showing redundancy (good for fault tolerance, costly for EM).
- **Dead zones:** Tiles that NO rooted unit can cover are dimly highlighted in gray with a dashed border — "here be dragons" areas where the player is blind.

**Sensory:** The topology planner feels like a satellite view. The board zooms out slightly (90% scale), colors desaturate except for the coverage overlays, and a faint grid hum replaces the normal workbench ambient. Dragging a unit ghost across tiles produces soft tonal shifts — lower pitch when coverage overlaps with existing roots (redundancy), higher pitch when covering new ground (expansion). When the player finds a position where coverage neatly fills a dead zone, the tile briefly flashes gold and emits a satisfying *click* — a puzzle-piece-snapping-into-place sound. Releasing the unit ghost plays a gentle descending tone as the coverage overlay locks into position.

---

## Player Journeys

### Journey 1: Rosa, 62, Retired Electrical Engineer

**Context:** Mission 7. Rosa has completed missions 1-6. She has unlocked the factory, used basic relay configurations, and just learned about the root skill from Mission 6's boot log. She's never played an RTS but spent 35 years designing power grid relay networks. The board is Palawan (jungle terrain, river bisecting the map, enemy spawner at H5).

**Minute 0:00 — The Topology Aha**

Rosa opens the Plan screen. Board preview shows Palawan: dense jungle on the western half (tiles A1-D8), a river running down column E (impassable except at E4 bridge), and open terrain on the eastern half (F1-H8). Enemy spawner at H5 glows red. Her factory is at A4.

She selects her relay blueprint. The relay has compress + filter, 4 hook slots, buffer 12. She sees the `root` skill is now available — a new amber skill icon with a downward arrow. She hovers over it. The animated tooltip fires: a mini-scenario where a relay sinks into a tile, root tendrils spread, and a "PERMANENT" label pulses in red.

"Permanent," she murmurs. "Like pouring a foundation."

**Minute 0:45 — The Coverage Game**

Rosa drags the relay ghost onto the board preview. The Root Planner activates: translucent blue circles appear showing hook reception range. She places the ghost at D4 — just west of the river bridge. The blue circle covers most of the western half. But the eastern half is dark gray. Dead zone.

She remembers the river is impassable. Signals cross water, but the rooted relay at D4 can only receive hooks from units on either side — it just can't *see* across the river (relay has no perception). She needs scouts on the east side sending signals back.

She moves the ghost to E4 — the bridge tile. The coverage circle shifts, now straddling both banks. But E4 is the only crossing point. Any enemy striker heading west *must* cross E4. Rooting a relay on the bridge is putting the relay's body in the kill zone.

"That's like putting a transformer on the highway," she says. "Good coverage, bad survivability."

**Minute 1:30 — The Split Network Decision**

Rosa decides on a mesh topology — she's designed enough substations to know that redundancy beats optimization. She drags the relay ghost to C4 (west bank, safe behind jungle) and notes the coverage. Then she opens a second relay blueprint and ghosts it to G4 (east bank, open terrain but near the enemy approach).

The Root Planner shows overlapping coverage at the E4 bridge — both relays can hear signals from the bridge area. The overlap zone glows bright blue. Dead zones at the corners (A1, A8, H1, H8) show as gray.

She notices the EM heat map: C4 shows modest amber (one relay, moderate emission). G4 shows deeper amber (exposed position means enemy can detect it from farther away). The combined EM display at G4 pulses — it's dangerously visible.

"G4 needs protection," she says. "Or I root it somewhere less exposed." She moves the ghost to F5 — behind a jungle tile. EM drops slightly. Coverage shrinks slightly. Trade-off accepted.

**Minute 2:15 — The Latency Calculation**

Rosa hovers over a tile near the enemy spawner (G6). Small latency badges appear: "2 ticks to F5-relay, 3 ticks to C4-relay, 4 ticks to base." She nods — 2-tick warning on the east approach. She checks the west approach (B3): "1 tick to C4-relay, 3 ticks to F5-relay, 2 ticks to base." Reasonable.

She calculates in her head: if an enemy crosses the bridge at E4, both relays hear it in 1 tick (the bridge is in both coverage zones). Strikers subscribed to *either* relay get the alert in 2 ticks. That's the same as a central star, but with redundancy. If F5-relay dies, C4-relay still covers the west. If C4-relay dies, F5-relay still covers the east approach to the bridge.

"Dual feed," she says. "Like a loop network. No single-contingency loss."

**Minute 3:00 — The Execute Moment**

Rosa commits both root positions. She configures channels: `east-watch` (east scouts → F5 relay), `west-watch` (west scouts → C4 relay), `threat-bridge` (both relays → all strikers, fired only when bridge-area activity detected). She assigns two strikers to patrol west of the bridge, one to patrol east.

She hits EXECUTE. During Sealed Watch, she watches her relays root. The 3-tick animation plays: C4-relay sinks into jungle, teal circuit tendrils winding through bamboo. F5-relay roots in grassland, tendrils spreading clean across open ground. Both emit a deep resonant *thoom* that she feels in her chest.

Three ticks later, enemy scouts appear at H5. Her rooted scout at G7 (she also rooted a scout — the picket fence inspiration) detects them immediately. Signal flashes green through `east-watch` to F5-relay. F5-relay compresses and fires on `threat-bridge`. Both strikers near the bridge receive the alert.

"The network works," she says. "Just like the real thing."

**Minute 5:30 — The Inspector Revelation**

After the battle (victory — the mesh topology held even when one scout was killed), Rosa enters Inspector. She clicks the C4-relay and sees its signal timeline: a steady stream of west-side observations, each compressed. She clicks F5-relay: more active, handling east-side combat signals plus relaying bridge alerts. The context window chart shows F5 was at 80% capacity during the peak engagement — close to overload, but the filter skill dropped low-priority observations before it tipped.

She scrubs to tick 22, when the enemy striker pushed toward the bridge. The signal chain visualization lights up: scout at G7 → F5-relay → `threat-bridge` → both strikers, total 3 ticks. Her west striker reached the bridge at tick 25 — one tick before the enemy. The topology worked with exactly 1 tick of margin.

"One tick," she says. "If I'd rooted F5 one tile farther east, the latency would have been 4 ticks. The striker would have arrived late. That's the difference between two positions on a 64-tile board."

**UI Annotations:**
- Root Planner: activates on ghost-drag of root-capable unit to board preview. Full-board overlay.
- Coverage circles: translucent, unit-type-colored (blue for relay, green for scout, purple for specialist)
- Latency badges: white digits in small rounded rectangles, appear on hover per tile
- EM heat map: continuous gradient from transparent (low) to amber (medium) to red (high)
- Overlap zones: brighter saturation of the coverage color where circles intersect
- Dead zones: gray tiles with dashed white border, visible only when Root Planner is active

---

### Journey 2: Kwame, 28, DevOps Engineer & Twitch Streamer

**Context:** Mission 9 (factory vs. factory). Kwame has completed 8 missions and streams every session to ~400 viewers. He's playing the Manila megacity board — dense urban grid with tall buildings blocking perception in rows 3-6, open plaza at D4-E5, and two enemy spawners at G1 and G8 (pincer threat). His chat is active.

**Minute 0:00 — The Architecture Pitch**

"Okay chat, this is the factory vs. factory mission. Two enemy spawners. Manila board. The city center is a kill box — tall buildings everywhere. If I go star topology..." He drags a relay ghost to D4. Coverage overlay shows the relay can *receive* signals through buildings (hooks aren't line-of-sight), but his scouts' *perception* is blocked by buildings in rows 3-6. "See? The relay can hear, but my scouts can't see through the skyscrapers. I need scouts ON the rooftops."

Chat: "root the scouts on the buildings 🏗️" "PICKET FENCE" "mesh mesh mesh"

**Minute 0:30 — The Three-Layer Cake**

Kwame designs what he calls "The Three-Layer Cake":

- **Layer 1 (Perception):** Two rooted scouts at C3 and F6 — on top of the tallest buildings, with perception cutting through the urban canyon. These are forward eyes.
- **Layer 2 (Processing):** One rooted relay at D5 — central plaza, receiving from both scouts and compressing for the striker force.
- **Layer 3 (Action):** Mobile strikers spawning from both the base AND the rooted relay's forward position.

"Three layers. Sensors, compute, action. Like a Kubernetes cluster with dedicated node pools."

He ghosts all three positions. The Root Planner shows: scouts at C3 and F6 cover approximately 40 tiles between them (with overlap at D4-E5 plaza). The relay at D5 is in the overlap zone — it receives from both scouts without any dead sector. The EM heat map is concentrated around the plaza — three rooted units within 3 tiles of each other.

"Chat, look at the EM. The plaza is glowing like a Christmas tree. Every enemy within 8 tiles knows exactly where my network is."

Chat: "spread them out" "nah commit to the plaza deathball" "EM doesn't matter if your strikers kill first"

**Minute 1:30 — The EM Gamble**

Kwame decides to accept the EM risk. "I'm going offense. If they can see me, I see them first. The scouts are rooted with +2 buffer — that's buffer 8 each. They can hold observations for 4 ticks before overload. And the relay at D5 has compress + filter + amplify — it's a processing beast."

He configures the channels:
- `north-eye` (C3 scout → D5 relay)
- `south-eye` (F6 scout → D5 relay)
- `killbox` (D5 relay → all strikers)
- `emergency` (any unit can fire, all units listen — panic button)

"Four channels. Clean architecture. The relay is the only node with 4 hook slots, so it's the only unit that can handle all four."

**Minute 2:30 — The Root Ceremony**

He hits EXECUTE. During Sealed Watch, the three root animations play in sequence (each unit roots on the tick it's produced from the factory). C3 scout roots first — tendrils spreading through urban concrete, neon signs flickering as the root network draws power. Then D5 relay — the plaza tiles illuminate with circuit traces, the largest root spread in the game (relay's rooting animation is wider than a scout's). Finally F6 scout — rooting into a skyscraper foundation, tendrils climbing the building face like ivy.

"Chat, look at that. The city is wired. Manila has internet now."

Chat lights up: "MANILA HAS WIFI" "cyberpunk infrastructure speedrun" "this is literally setting up cell towers"

**Minute 4:00 — The Stress Test**

Enemy units from G1 (north spawner) enter the board. C3 rooted scout detects them at tick 8. Green signal flash through `north-eye` to D5 relay. Relay compresses: "3 enemy strikers, approaching E2, ETA tile D3 in 4 ticks." Signal fires on `killbox`. Kwame's mobile strikers at B4 receive the alert at tick 10 and begin intercepting.

Simultaneously, enemy units from G8 (south spawner) appear. F6 rooted scout detects them at tick 9. Green flash through `south-eye`. Relay compresses both signals at tick 10 — but this means the relay's buffer receives `north-eye` signal AND `south-eye` signal in the same tick. Buffer at 6/12 after one tick of dual input. The compress skill fires, reducing both to compact summaries. Buffer drops to 4/12.

"The relay held," Kwame says. "Dual feed compressed in one tick. That's why I picked D5 — it's equidistant from both scouts so the signals arrive within one tick of each other. If the relay was at C4, the north signal would arrive first, get processed, and the south signal would hit a half-compressed buffer. Timing matters."

Chat: "signal phase alignment" "this man is optimizing for clock skew" "Network Engineer: The Game"

**Minute 6:00 — The Kill**

Enemy strikers reach the plaza. Three from the north, two from the south. Kwame's mobile strikers are already positioned — they received the alert 4 ticks ago and moved to intercept at D3 and E6 (the chokepoints where urban corridors enter the plaza). Red cell flashes as both engagements resolve: 3 enemy strikers eliminated (one-shot-one-kill works both ways — Kwame's strikers were in position first).

But one enemy slips through — it bypassed the E6 chokepoint via F5 (an alley his scouts couldn't see through). It reaches the D5 relay. Adjacent. One-shot-one-kill.

The relay dies. The `killbox` channel goes silent. Kwame's surviving strikers lose their intel feed.

"THE RELAY!" Kwame shouts. "One unit got through and I lost the whole processing layer! The sensors are still alive but there's nothing to compress the data!"

Chat: "SINGLE POINT OF FAILURE" "should have meshed" "F in chat for D5" "this is why you run replicas"

**Minute 7:00 — The Aftermath (Inspector)**

In Inspector, Kwame scrubs to the tick the relay died. The signal visualization shows: C3 scout fires `north-eye` — the signal reaches D5 but D5 is destroyed. The signal has no destination. A red "UNDELIVERED" marker appears on the channel line. F6 scout fires `south-eye` — same result. Both scouts are shouting into a void.

"Look at this. The scouts are still rooted, still observing, still firing hooks. But the relay is dead. The signals have nowhere to go. This is a P0 production incident. My monitoring is up but my log aggregator is down."

He clicks the C3 scout's context window. It's at 8/8 — full. Every tick it observes, the data has nowhere to go (it can only hook to `north-eye` which has no listener), so observations stack in the local buffer until overload. At tick 45, the scout enters context overload — stunned, jittering, sparking. A rooted unit in overload can't even observe. The permanent sensor is blind.

"The cascade failure. Scout's buffer fills because the relay is dead. Scout overloads. Scout goes blind. My thousand-material investment in a rooted sensor network is completely dark because one enemy striker hit one relay."

Chat: "this is the Redis incident all over again" "single point of failure NEVER AGAIN" "mesh or death"

**UI Annotations:**
- Root ceremony: staggered rooting animations play in factory production order
- Urban rooting: circuit tendrils interact with building geometry (climb walls, thread through windows)
- Dual signal arrival: relay buffer visualization shows two signals arriving in same tick, compress resolving before next tick
- Relay death: `killbox` channel line turns gray, `UNDELIVERED` marker appears on subsequent signal attempts
- Cascade overload: rooted unit enters overload (jitter, spark) with `BUFFER FULL — NO LISTENER` annotation in Inspector

---

### Journey 3: Tomás, 16, First Strategy Game

**Context:** Mission 6, first time encountering both the factory and the root skill. Tomás plays Fortnite and Minecraft. He's never thought about network topology. The board is Ifugao (rice terraces — staircase terrain with water channels, gentle height variation, enemy spawner at H1). His base is at A8 (top-left).

**Minute 0:00 — The Root Discovery**

Tomás opens the Plan screen. He's just unlocked the factory (Mission 5) and now Mission 6's boot log introduces the root skill. The boot log text appears in teal monospace:

```
> SUBSYSTEM: FORWARD DEPLOYMENT
> STATUS: ONLINE
> New skill available: ROOT
> ROOT anchors a unit permanently to a tile.
> The unit cannot move. The unit cannot retreat.
> The unit becomes infrastructure.
> Recommendation: ROOT transforms agents into architecture.
```

"Becomes infrastructure?" Tomás says. He doesn't know what this means. He taps the root skill in the blueprint editor. The animated tooltip plays: a unit sinks into a tile, glowing tendrils spread, a "PERMANENT" label pulses. The tooltip's 5-tick scenario shows the rooted unit receiving signals and spawning a new unit from its position.

"Oh, it's like placing a building in Fortnite. But you can't break it."

**Minute 0:30 — The Obvious Move**

Tomás has one relay and two scouts in his loadout. The boot log suggested rooting is for relays ("transforms agents into architecture" — relays ARE infrastructure). He drags the relay ghost to the board.

The Root Planner activates. Tomás doesn't fully understand the coverage circles, but he notices the latency badges. He drags the relay ghost around the board, watching the numbers change.

- Relay at A7 (near base): latency badges show "1 tick to base" everywhere nearby, but "4 ticks to enemy spawner approach."
- Relay at D4 (center): latency badges show "2 ticks to base" and "2 ticks to enemy approach." Everything is balanced.
- Relay at G2 (near enemy): latency badges show "1 tick to enemy" but "4 ticks to base."

"The middle is 2 everywhere. That feels right." He places the ghost at D4. The EM heat map is mild — single relay, not too loud. No dead zones visible near the terraces. Coverage circle stretches across most of the board.

**Minute 1:00 — The Lock-In Moment**

Tomás hits EXECUTE. He doesn't root the relay during the planning phase — root happens during battle when the unit reaches its position. The relay spawns from the factory at A8, moves toward D4 (medium speed — relay is stationary once produced? No — relay is stationary from the start. Wait.)

Actually, relays are stationary (Speed: Static in the locked spec). So a relay placed in the production queue deploys at the factory position (A8), and it's already static. To root at D4, the relay would need to be *carried* somehow, or the rooting position would need to be selected pre-battle.

**Design question this reveals:** How do stationary units reach their root positions? Options:

1. **Pre-placed in Plan Screen:** The player places rooted units directly on the board during planning, before EXECUTE. No movement required. The root position IS the spawn position.
2. **Factory teleport:** Rooted units "deploy" directly to their selected tile (narrative: the factory drops them via drone/airdrop).
3. **Escort mechanic:** A mobile unit must escort the relay to position, then the relay roots. Adds latency and risk.
4. **Root-on-spawn:** The factory builds the unit directly at the root location (forward production).

Tomás is confused. He placed the ghost at D4, but the relay spawned at A8. He can't move it. The relay sits at A8, doing nothing useful — it's a static unit receiving signals only from units near the base.

"Wait... it can't move? How do I get it to the middle?"

He reads the skill description again. "Root anchors a unit permanently to a tile." He re-reads the boot log. Nothing about how to get the relay TO the tile.

**Minute 1:45 — The Discovery**

Tomás clicks the relay's tile in Plan Screen. A small "DEPLOY POSITION" button appears — he can set where the relay will be placed when it's produced. He clicks D4. The ghost snaps to D4 with a soft *click*. The production queue shows the relay icon with a small D4 coordinate label.

"Oh! I pick where it goes before the battle. Okay."

He re-executes. This time, the relay appears directly at D4 during Sealed Watch. The rooting animation plays: tendrils spread through the rice terrace channels, cyan circuits mixing with flowing water. *Thoom.*

"Whoa. That's so cool."

**Minute 2:30 — The First Network**

His scouts patrol the eastern half. They spot enemies approaching from H1. Signal flashes through the relay at D4. His striker receives the alert 2 ticks later. The timing works perfectly — the star topology is sufficient for Mission 6's moderate difficulty.

Tomás doesn't think about topology. He doesn't know the word "topology." But he's built one — a star with a central relay and mobile peripherals. He's done network architecture without ever hearing the term.

**Minute 4:00 — The Inspector Realization**

In Inspector, Tomás clicks the rooted relay at D4. He sees every signal that passed through it — 23 observations compressed and forwarded over 40 ticks. The context window chart shows a gentle sawtooth: input arrives, compress fires, buffer drops, repeat.

"It's like a mailroom," he says. "Everything comes here and gets sorted."

He doesn't know it yet, but Mission 7 will break his star topology. The oscillation problem from the thermostat (3.19a-i) will combine with the single-relay bottleneck — too many signals, one relay, context overload. He'll need a mesh. He'll discover it by failing.

**UI Annotations:**
- Deploy position selector: appears when clicking a stationary unit tile in Plan screen. Shows available deploy tiles with cost modifiers.
- Coordinate label: small alphanumeric badge (e.g., "D4") on production queue icons for pre-placed units
- Boot log ROOT introduction: 6 lines, teal monospace, subsystem initialization format
- Rice terrace rooting: unique visual — tendrils follow water channels between terraces, mixing cyan circuits with irrigation patterns
- First-time star topology: player builds canonical star without knowing the concept — the game teaches through doing

---

### Journey 4: Mei-Ling, 34, Competitive Player (Mission 10 — Final Boss)

**Context:** Mission 10 — Taal Volcano. Full factory vs. factory. Enemy has its own rooted units. The board has volcanic terrain: lava tiles (impassable, block hooks), obsidian tiles (traversable but reduce perception by 2), and vents (every 10 ticks, a vent erupts and destroys everything on adjacent tiles). Enemy base at H1, player base at A8. Mei-Ling has optimized topologies for every previous mission. She's here to win.

**Minute 0:00 — The Constraint Map**

Mei-Ling opens the Root Planner immediately. She doesn't look at the board as a battlefield first — she looks at it as a topology constraint graph.

"Lava at E4-E5 — splits the board. Can't route hooks through lava. Vents at C3 and F6 — can't root there, unit dies every 10 ticks. Obsidian corridor from D2 to D7 — reduced perception means scouts rooted on obsidian see 3 tiles instead of 5."

She maps the constraints mentally:
- Eastern half (F-H columns): accessible but exposed, near enemy spawner
- Western half (A-D columns): defensible, near player base, but requires crossing lava gap for east-side operations
- The D-column obsidian corridor is the only safe north-south route on the western half
- The F-column is the eastern equivalent, but within enemy EM detection range

**Minute 0:45 — The Dual-Spine Design**

"Mesh won't work — lava blocks hooks at E4-E5. I need two independent spines, one per side, linked by a bridge relay that can transmit around the lava."

She designs:
- **West spine:** Rooted relay at B5 (safe, central western position). Rooted scout at D7 (watches the obsidian corridor and the lava gap).
- **East spine:** Rooted relay at G3 (aggressive forward position, close to enemy base). Rooted specialist at F5 (hack range covers enemy approach routes, just north of the lava).
- **Bridge:** No physical bridge — she wires a hook from D7-scout through `cross-board` channel. The signal must travel: D7 scout → B5 relay → (hook around lava via channel, which isn't blocked by lava because channels are named pipes, not physical — wait, does lava block hook transmissions?)

**Design question this reveals:** Do hook signals have physical constraints? The locked spec says "1 tick per hop" and hooks are "fire-and-forget triggers wired to named channels." Channels are named pipes — they're logical, not physical. So lava shouldn't block them. But the EM emission model implies physical detection range. This creates an asymmetry: signals aren't blocked by terrain, but EM noise IS detectable through terrain.

Mei-Ling resolves: "Signals go through lava. EM goes through lava. But units can't walk through lava. So the topology constraint isn't 'can signals cross' but 'can I protect the relay that crosses.'" She places B5 relay in the safe western zone and wires it to receive east-side signals directly. The relay doesn't need to be near the signal *source* — it just needs to be on the right channel.

"The relay at B5 listens on `east-intel` AND `west-intel`. Both sides feed into one processor. It's a VPN tunnel — the data crosses the lava gap through the channel layer."

**Minute 2:00 — The Vent Hedge**

She checks vent positions. C3 erupts every 10 ticks. If she roots anything within 1 tile of C3, it dies at tick 10 (or 20, or 30...). She marks a 2-tile exclusion zone around each vent.

But the exclusion zones overlap with the obsidian corridor (D column). The only safe rooting position in the corridor is D7 — outside vent blast range of both C3 and F6.

"D7 is the keystone. If the enemy figures that out and sends strikers to D7, my topology collapses."

She adds a striker patrol route along the D-column to protect the rooted scout. The striker's rules: "IF tagged enemy within 2 tiles of D7, THEN engage. ELSE patrol D-column."

"That striker is a bodyguard for infrastructure. It doesn't fight the war — it protects the network."

**Minute 3:30 — The Mirror Match**

During Sealed Watch, she sees the enemy's rooted units appear. The enemy AI has rooted its own relay at F3 and a scout at E7. The enemy is running a *reversed* star topology — their hub is on the eastern side, just as hers is on the western side. The lava gap creates a natural demilitarized zone.

"It's a mirror," she says. "Two stars on opposite sides of a lava DMZ. Whoever breaches the other's side first wins the intelligence war."

The battle becomes a chess match of rooted infrastructure. Her specialist at F5 hacks the enemy relay at F3, revealing its channel configuration. She now knows which channels the enemy uses — and can plan her striker approach to avoid the enemy's perception coverage.

"I see their topology. They can't see mine — my relays are on the safe side of the lava. Information asymmetry. That's the win condition."

**Minute 8:00 — The Decisive Moment**

Tick 35. Her strikers push through the obsidian corridor, approach the enemy base. The enemy's rooted scout at E7 detects them — but Mei-Ling's specialist at F5 has been jamming the enemy's hook on `enemy-alert` for the last 5 ticks (using a hypothetical advanced hack variant). The enemy relay at F3 never receives the alert. The enemy strikers don't intercept.

Her two strikers reach the enemy base. Adjacent. One-shot-one-kill applies to bases too (or the base has hit points that two strikers can drain in 2 ticks — mission-specific rule). Battle over.

"GG. The topology won that game. My infrastructure was protected, theirs was exposed. Root placement was the whole game."

**UI Annotations:**
- Vent exclusion zone: pulsing amber circles around vent tiles, visible in Root Planner
- Lava tiles: red-orange glow, marked with "IMPASSABLE" in Root Planner, but hook channels shown crossing them (logical, not physical)
- Enemy rooted units: appear during Sealed Watch with red-tinted root tendrils, enemy coverage circles visible in Inspector post-battle
- Hack reveal: when specialist hacks enemy relay, the enemy's channel configuration appears as a ghost overlay on the Inspector board

---

## Interaction Effects

### With Signal Latency (3.10b)
Root placement directly determines signal latency. Every tile of distance between a rooted relay and a mobile unit adds potential hops. The Root Planner's latency badges make this concrete — players SEE the tick costs of different positions. The latency legibility system (Levels 0-6 from 3.10b) naturally integrates with topology planning.

### With EM Emissions (Locked)
Rooted units emit double EM. Topology design is constrained by the EM budget — more roots = louder network. The "dark network" strategy (minimal hooks, stealth topology) from 3.08 interacts with rooting: a rooted unit that never fires hooks emits less than one that constantly transmits, creating a tension between root-as-sensor and root-as-processor.

### With Context Overload (Locked)
Hub topologies (star, spine) concentrate buffer load on single nodes. Context overload at the hub cascades to every unit depending on that hub's output. Mesh topologies distribute load but require more total buffer capacity. The topology choice IS the overload management strategy.

### With Self-Replication (3.19a)
Model D (Seed Pod) defines rooting. Model A (Blueprint Printer) + rooting = a Command unit that orders production from forward bases. The topology question becomes: "which forward base produces which unit type?" Production routing adds another dimension to the topology puzzle.

### With Terrain (Campaign Boards)
Each of the 10 campaign boards creates different topology constraints: Ifugao's water channels (root tendrils follow irrigation), Palawan's river (natural network bisection), Manila's skyscrapers (perception blocking), Taal's lava (impassable zones and vent exclusion areas). Optimal topology varies per mission — players can't memorize one layout.

### With the Inspector (Locked)
The Inspector becomes a network monitoring dashboard when rooted units exist. Signal flow visualization shows which paths are active, which are congested, which are dead. The topology is visible as a permanent overlay — rooted units don't move, so their connections form stable lines that persist across the entire battle timeline.

---

## Comparable Games

### Factorio: Power Grid Layout
Factorio's electrical network requires placing power poles within range of each other to create connected grids. Players optimize pole placement to minimize cost while covering all machines. The "electricity coverage overlay" (green area around poles) is directly comparable to the Root Planner's coverage circles. Factorio players spend hours optimizing pole layout — it's a spatial puzzle within the logistics puzzle.

### StarCraft: Pylon Placement
Protoss players place pylons to power buildings and units. Each pylon has a power field. Overlapping fields provide redundancy — if one pylon dies, buildings in the overlap zone stay powered. Pylon placement is a topology optimization puzzle: minimize pylons while maximizing redundant coverage. The "pylon rush" — aggressive forward pylon placement for proxy production — maps directly to aggressive root placement.

### XCOM 2: Relay Network
XCOM 2's strategic layer requires building communication relays to contact resistance cells in distant regions. Each relay has a communication range. Players optimize relay placement to reach all regions with minimum investment — a direct spatial coverage puzzle.

### Into the Breach: Building Protection
Into the Breach doesn't have network topology, but its "protect buildings at specific positions" creates a spatial constraint puzzle. The player must position mechs to shield specific tiles, and the geometry of the grid determines which configurations are viable. The mental model (spatial constraints → positioning optimization) transfers directly.

### Mesh Networking (Real World)
Wi-Fi mesh networking (Google Nest, Eero, etc.) requires placing nodes to cover a home while avoiding dead zones. The placement is a consumer-level topology puzzle: coverage vs. node count vs. wall interference. Robot Uprising's root placement is exactly this puzzle with added adversarial pressure.

---

## Sensory Design

### The Root Planner
- **Activation:** Board dims 15%, grid lines brighten to white, ambient audio shifts to a low electronic hum (like standing inside a data center)
- **Coverage circles:** Translucent, color-matched to unit type (blue/relay, green/scout, purple/specialist), with soft pulsing edges
- **Latency badges:** Rounded white rectangles with serif digits, appearing on hover with a 150ms fade-in, positioned at tile center
- **EM heat map:** Continuous gradient overlay — transparent at baseline, warm amber at 50% EM budget, pulsing red at 75%+, with actual numeric EM values on hover
- **Dead zones:** Gray tiles with animated dashed borders (marching ants pattern), opacity 30%
- **Overlap zones:** Additive blending of overlapping coverage colors — blue + green = teal, blue + blue = bright blue
- **Position snapping:** When dragging a unit ghost to a tile, the ghost snaps to center with a soft mechanical *click* (like a circuit board component seating into a socket)
- **Optimal position discovery:** When a ghost position covers the last dead zone or fills a coverage gap, the tile flashes gold for 400ms with a clear, bright *ding* — the "puzzle piece" sound

### Root Animation Variations by Terrain
- **Rice terrace (Ifugao):** Tendrils follow irrigation channels, water glows cyan as circuits integrate
- **Jungle (Palawan):** Tendrils wind through tree roots, bioluminescent glow spreading through undergrowth
- **Urban (Manila/Cebu):** Tendrils climb through building foundations, neon signs flicker as power is redirected
- **Volcanic (Taal):** Tendrils glow orange-red, cracking through obsidian, cooling to cyan once rooted
- **Beach (Batanes):** Tendrils spread through sand, shells and coral incorporating into the circuit pattern

### Audio
- **Root Planner hum:** Low C (65 Hz) drone, slightly digital, reminiscent of a transformer room
- **Coverage expansion tone:** When dragging to a new tile, a soft tone plays proportional to new-tiles-covered (more coverage = higher pitch)
- **EM warning tone:** Above 60% EM budget, a subtle warbling tone enters the hum — gradually more insistent
- **Root ceremony:** The locked 3-tick *thoom* from 3.19a, but the pitch varies by terrain (deep bass for volcanic, resonant mid for urban, flowing chord for terrace)
- **Network collapse:** When a rooted relay dies, all connected signal lines emit a descending electronic wail — a power-down sound, like a server rack losing power row by row

---

## The TikTok Clip

**"The Mesh vs. The Star"** — Split screen. Left side: a player builds a star topology, one central relay, everything routes through it. It works beautifully for 30 ticks. Then one enemy striker reaches the relay. BOOM. Total network collapse. Every unit goes dark. Cascade overload. Defeat.

Right side: same board, same enemy composition. Player builds a mesh — three relays forming a triangle. An enemy reaches one relay. It dies. The other two relays absorb the load. Coverage shrinks but doesn't collapse. Strikers still receive alerts through the surviving nodes. Victory.

Text overlay: **"Why distributed systems engineers love this game."**

---

## New Aspects Discovered

1. **3.19a-ii-a — The Root Planner as first spatial reasoning tool:** Detailed UX design of the coverage/latency/EM overlay system as a standalone feature that teaches spatial thinking before the player even roots a unit. How does the Root Planner interact with the board preview in Plan Screen? When does it activate (always visible vs. unit-ghost-drag-only)?

2. **3.19a-ii-b — Terrain-specific root bonuses and penalties:** Beyond cosmetic animation differences, do certain terrains grant mechanical bonuses to rooted units? (Rice terrace root = +1 buffer from water cooling? Urban root = -1 perception from building interference? Volcanic root = risk of vent destruction?) Terrain as topology constraint vs. terrain as topology modifier.

3. **3.19a-ii-c — Enemy topology recognition as a player skill:** In factory-vs-factory missions (8-10), the enemy has its own rooted units forming its own topology. Can the player learn to READ the enemy's topology from EM emissions and scout observations? "That EM pattern looks like a star — take out the center" as an advanced tactical skill.

4. **3.19a-ii-d — Dynamic re-rooting or root migration:** Since root is permanent, what happens when the topology becomes suboptimal mid-battle? The player can't adapt. Is there a "sacrifice and re-root" mechanic (destroy your own rooted unit to reclaim the slot)? Or is the permanence the entire point — commit to your architecture before the battle and live with it?

5. **3.19a-ii-e — The topology pattern library (Blueprint Codex integration):** Named topology patterns (Star, Mesh, Spine, Picket Fence, Fortress, Asymmetric Web) as entries in the Blueprint Codex. Can players save and share topology templates for specific boards? "Here's my Manila mesh — copy it." Community-driven topology meta.
