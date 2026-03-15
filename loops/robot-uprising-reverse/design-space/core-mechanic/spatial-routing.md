# Spatial Routing as Mechanic Layer

**Aspect:** 2.14 — Spatial routing as mechanic layer
**Wave:** 2 (Core Mechanic Variations)
**Category:** core-mechanic

---

## The Design Question

In Robot Uprising, the player configures agent attention systems — skills, rules, hooks, context — in the workbench. But the **battlefield is an 8x8 grid**, and agents occupy physical positions on that grid. The question: **how much does physical position matter for information flow?**

At one extreme: channels are global. Every agent listening on `east-net` receives every signal on `east-net`, regardless of where they are on the board. Position matters for perception (scouts see nearby enemies) and combat (strikers must be adjacent to kill), but information routing is purely logical — a channel topology problem, not a geography problem.

At the other extreme: channels are strictly local. A hook transmission only reaches listeners within a certain range. A scout at A1 can't transmit to a relay at H8. The player must design not just the *wiring* (who talks to whom) but the *layout* (where each agent physically stands) to make that wiring actually function. Relay placement becomes a spatial puzzle layered on top of the configuration puzzle.

The locked design sits between these extremes. Signal latency is 1 tick per hop. EM emissions from hook transmissions are detectable. But it's not fully specified whether channels have **range limits**. This analysis maps the full space of how spatial constraints create (or don't create) gameplay around information routing.

---

## The Six Models

### Model 1: Global Channels (No Spatial Constraint)

**Mechanic:** Any agent on channel X can hear any other agent on channel X, regardless of board position. The only spatial cost is the locked 1-tick-per-hop latency — but "hops" are logical (through relay chains), not physical (across tiles).

**How it works:**
- Scout at A1 detects enemy. Fires hook on `threat-east`.
- Relay at H8 listens on `threat-east`, receives signal next tick. Compresses, forwards on `strike-orders`.
- Striker at D4 listens on `strike-orders`, receives compressed signal the tick after that.
- Total latency: 2 ticks (scout→relay→striker). Physical distance: irrelevant.

**What the player optimizes:** Pure channel topology. The wiring diagram. Buffer sizing. Eviction priorities. The spatial board is relevant for scouting coverage and combat positioning, but the *information architecture* is a separate, parallel puzzle.

**Strengths:**
- Simplest mental model. "Channels are like Slack channels — everyone in the channel sees everything."
- Lower floor. Beginners don't need to think about relay placement AND channel wiring simultaneously.
- Clean separation of concerns: spatial = combat/scouting, logical = information routing.
- Ghost previews in the plan screen can focus on perception radii and patrol paths, not transmission range circles.

**Weaknesses:**
- Relays lose half their identity. If a relay at any position can reach any listener, why is "stationary" a meaningful constraint? Stationary only means "can't dodge," not "must be placed strategically."
- No spatial tension in information routing. The board becomes a scouting/combat game with a separate config puzzle layered on top. The two systems don't interact.
- EM emissions become a pure "cost of doing business" — noisy but not geographically focused. Enemies detect *that* you're transmitting, but not *where the transmission originates relative to the listener*.
- The "relay chain" concept feels arbitrary. Why route through a relay if the scout could just transmit directly to the striker?

**The TikTok clip:** Hard to make spatial routing visually interesting because there's nothing spatial about it. The clip would be about the *channel activity* — flashing signal lines — but those lines go everywhere simultaneously.

---

### Model 2: Range-Limited Channels (Hard Cutoff)

**Mechanic:** Each hook transmission has a **maximum range** (measured in tiles, Manhattan distance or Euclidean). Signals only reach listeners within that range. Beyond range = signal lost, no partial delivery.

**Proposed ranges by unit type:**

| Unit | Transmission Range | Rationale |
|------|-------------------|-----------|
| Scout | 3 tiles | Small antenna, mobile — trades range for speed |
| Striker | 2 tiles | Minimal comms, focused on combat |
| Relay | 7 tiles | *This is why relays exist* — they bridge distances |
| Specialist | 4 tiles | Mid-range, versatile |
| Command | 5 tiles | Strong signal but stationary — must be placed centrally |

**How it works:**
- Scout at B2 detects enemy at C3. Fires on `threat-east` with range 3.
- Relay at D4 (distance: 4 tiles Manhattan from B2) — **out of range**. Signal lost.
- Relay at C4 (distance: 3 tiles) — **in range**. Receives signal. Amplifies (range boost from `amplify` skill?), forwards on `strike-orders` with range 7.
- Striker at G6 (distance: 6 tiles from C4) — **in range**. Receives compressed orders.

**What the player optimizes:** Agent placement becomes the primary spatial puzzle. The player must position relays to bridge gaps between scouts (who roam) and strikers (who need orders). The board becomes a **network topology problem** — placing nodes to ensure coverage, with each relay as a critical link in the chain.

**The relay placement mini-game:** On the plan screen, when the player drags a relay's position, ghost lines show which other agents are within transmission range. A red X appears over agents that are too far. The player adjusts positions until the channel map shows full connectivity. This is the core spatial puzzle — and it happens BEFORE execution.

**Strengths:**
- Relays become critical infrastructure. Placement matters enormously. Losing a relay mid-battle doesn't just remove a compression node — it severs the network.
- Creates a map-reading skill. Veterans see the 8x8 board and immediately know "relay at D4, relay at E6 gives full coverage of the east flank."
- Relay destruction becomes dramatic. A striker killing a relay doesn't just remove one unit — it creates a communication blackout for every agent that depended on that link.
- EM emissions become **geographically meaningful**. A relay at D4 transmitting is detectable by enemies near D4. Louder architecture = bigger target = spatial vulnerability.
- Forces interesting positioning trade-offs: place the relay centrally for best coverage, but that's also where combat happens. Place it in a corner for safety, but coverage suffers.

**Weaknesses:**
- Hard cutoffs feel binary and potentially frustrating. "Why can't my scout at distance 4 talk to a relay with range 3? It's ONE tile too far."
- Mobile agents (scouts, strikers) create dynamic connectivity. A scout that patrols into range can transmit; one tick later, it patrols out of range and can't. This makes the system harder to reason about.
- Complexity spike. The player must now manage two spatial systems simultaneously: perception coverage (where scouts can see) AND transmission coverage (where signals can reach). For beginners, this might be overwhelming.
- Ghost preview clutter. Each agent now has TWO circles: perception range (what it sees) and transmission range (who it can talk to). The plan screen risks becoming a mess of overlapping circles.

**The TikTok clip:** A relay dies. Instantly, three agents on the east flank go dark — their buffer bars stop filling, they start acting on stale data, the scout keeps detecting threats but the signals vanish into nothing. The striker charges the wrong direction because its last order was 8 ticks stale. The entire flank collapses — not from combat, but from a severed communication link. "When the relay dies, everything dies."

---

### Model 3: Signal Attenuation (Soft Falloff)

**Mechanic:** Signals degrade over distance. Instead of a hard range cutoff, signals lose **fidelity** as they travel farther. A 1-tile transmission arrives at full fidelity. A 5-tile transmission arrives degraded — fewer details, lower priority in the buffer, or partial data.

**How fidelity works:**
- Full fidelity (1-2 tiles): Complete signal. "Enemy scout at C3, heading south, buffer 40% full."
- Degraded (3-4 tiles): Partial signal. "Enemy detected, approximate location C-sector."
- Minimal (5-6 tiles): Bare ping. "Activity detected, east."
- Beyond 6 tiles: Nothing arrives.

**What fidelity affects:**
- **Buffer slots consumed.** A full-fidelity signal takes 2 slots (detailed). A degraded signal takes 1 slot (summary). A minimal ping takes 1 slot but is low-priority for eviction.
- **Rule matching.** Rules that check for specific conditions ("IF enemy_type = striker") only match full-fidelity signals. Rules with broad conditions ("IF threat_detected") match any fidelity.
- **Decision quality.** An agent acting on a full-fidelity signal can target precisely. An agent acting on a degraded signal heads to the right sector but might miss the exact tile. An agent acting on a minimal ping just knows *something* is there.

**What the player optimizes:** The gradient. Short relay chains produce crisp, actionable data. Long chains produce fuzzy, suggestive data. The player decides: do I invest in a dense relay network for perfect information, or accept degraded signals from a sparser network and write rules that handle ambiguity?

**Strengths:**
- No frustrating hard cutoff. Signals always get *somewhere* if there's a listener within 6 tiles. The question is quality, not existence.
- Creates a rich decision space around **rule authoring**. Rules must handle varying signal fidelity: "IF detailed threat, engage precisely. IF vague threat, patrol toward sector. IF bare ping, hold position and wait for confirmation." This is EXACTLY the kind of layered decision-making that teaches transferable AI engineering skills.
- Relay placement becomes about *quality*, not just connectivity. A relay at distance 2 from the scout gives it full-fidelity input to compress. A relay at distance 5 gets degraded input — garbage in, garbage out.
- The relay's `compress` skill gains new depth. Compressing a full-fidelity signal produces a reliable summary. Compressing a degraded signal produces guesswork. The relay's position determines the *quality* of its compression.
- Teaches a real-world concept: **information degrades over distance and through processing**. This is a genuine principle of distributed systems, sensor networks, and military intelligence.

**Weaknesses:**
- Significantly more complex than Models 1 or 2. The player must now understand fidelity as a dimension of every signal, not just presence/absence.
- Buffer visualization becomes harder. Each slot now has a fidelity indicator — not just "occupied" but "occupied with what quality of data?"
- Debugging is harder. "Why did my striker go to D5 instead of C3?" Because it received a degraded signal that said "C-sector" not "C3." Traceable, but requires understanding fidelity.
- Risk of "always build dense networks" as a dominant strategy. If full-fidelity is always better, there's no reason NOT to pack relays tightly. The counter-pressure would need to come from: relay cost, EM emissions from dense networks, or enemy targeting of relay clusters.

**The TikTok clip:** Side-by-side comparison. Left panel: dense relay network, crisp signals, striker nails the target. Right panel: same config, one relay removed, degraded signals cascade through the chain, striker arrives two tiles off, misses, gets flanked. Same agents, same rules, different relay placement. "Distance isn't just time. Distance is truth."

---

### Model 4: Relay-Only Bridging (Hybrid)

**Mechanic:** Direct agent-to-agent communication is **always global** within a channel. BUT: the locked 1-tick-per-hop latency applies to logical hops, and **relays are the only way to reduce total latency and add processing** (compression, filtering, amplification). Spatial constraint enters through the relay's **perception range for retransmission** — a relay can only forward what it receives, and what it receives depends on who is within its reception range.

Wait — this gets circular. Let me reframe:

**The Relay Reception Radius model:**
- All agents can **transmit** globally on a channel (any listener anywhere receives the raw signal).
- Relays have a **reception radius** (e.g., 5 tiles). They only pick up signals from agents within this radius.
- Non-relay agents (scouts, strikers, specialists, commands) receive all signals on their channels regardless of distance.
- The relay is the **only unit with spatially-constrained reception**.

**Why this works:**
- Scouts transmit globally. Every striker on the channel hears the scout's raw signal. But a relay at the midpoint only hears the scout IF the scout is within 5 tiles.
- If the relay hears the scout, it compresses/filters and retransmits on a different channel. Now strikers get BOTH the raw signal (from the scout, global) AND the processed signal (from the relay, global).
- The spatial constraint is: **where you place the relay determines what information it can process.** Not whether the raw signal reaches the end point — it always does. But whether the relay can intercept it and add value.

**What the player optimizes:** Relay placement as a **processing topology** problem. The relay doesn't bridge a gap (signals are global). It provides a service — compression, filtering, amplification — but only for signals that originate within its reception radius. Placing a relay near the east scouts means east intel gets compressed. Placing it near the west scouts means west intel gets compressed. You can't cover everything.

**Strengths:**
- Clean mental model: "Signals are global. Relays add value locally." Easy to teach.
- Preserves the relay's identity without making beginners worry about connectivity. A beginner's config works (scout → striker on the same channel, global). Relay placement is an optimization, not a prerequisite.
- Creates a natural difficulty curve: Mission 1-4 don't need relays at all (signals are global). Mission 5+ introduces relays as a way to manage information overload — and NOW placement matters.
- No hard cutoffs, no fidelity gradient. The constraint is elegant: relays hear locally, everything else is global.

**Weaknesses:**
- Relay destruction is less dramatic. Losing a relay doesn't sever communications — it just removes processing. Agents still get raw signals; they're just uncompressed and unfiltered.
- The "why do I need a relay?" question is harder to answer for beginners. If signals are global, why not just wire scouts directly to strikers? Answer: buffer overflow. But the player needs to EXPERIENCE buffer overflow before they understand why compression matters.
- Less visually dramatic. No "blackout zone" when a relay dies. Just... slightly worse signal quality.

**The TikTok clip:** A player places two relays — one near the east scouts, one near the west scouts. East relay compresses east intel beautifully. West relay filters west noise. Then an enemy striker punches through and kills the east relay. East scouts keep screaming on `east-net`, but now raw uncompressed signals flood the strikers' buffers. Buffer overflow. Missed orders. The east flank crumbles not from silence, but from *noise*. "The relay didn't connect them. It kept them sane."

---

### Model 5: Emission-Radius Coupling (Stealth vs. Range Tradeoff)

**Mechanic:** Transmission range is directly proportional to EM emission radius. Want to transmit farther? Your signal is louder, detectable from farther away. Short-range transmissions are quiet. The player chooses a **broadcast power** per hook: higher power = more range = more detectable.

**Proposed power levels:**

| Power | Transmission Range | Emission Radius | Energy Cost |
|-------|-------------------|-----------------|-------------|
| Whisper | 2 tiles | 1 tile | 0.5e/tick |
| Normal | 4 tiles | 3 tiles | 1e/tick |
| Shout | 7 tiles | 6 tiles | 2e/tick |
| Broadcast | Global | Global | 4e/tick |

**How it works:**
- A scout whispers on `threat-east` — only agents within 2 tiles hear it, but enemies can only detect the emission within 1 tile.
- A relay shouts on `strike-orders` — agents within 7 tiles hear it, but enemies detect it from 6 tiles away.
- A command broadcasts on `all-units` — everyone hears it, but every enemy on the board knows exactly where the command unit is.

**What the player optimizes:** The **stealth/reach tradeoff** per hook, per agent. A network of whispering scouts and relays is nearly invisible but requires dense placement. A broadcasting command is powerful but paints a target on itself.

**Strengths:**
- Deeply tactical. Every hook configuration has a stealth dimension. Players who min/max range vs. emission radius create distinctive playstyles.
- Creates a "loud vs. quiet" architecture identity. Some players build tight whisper-networks with densely packed relays. Others build sparse broadcast networks and accept the emissions risk.
- EM emissions become a first-class mechanic, not a side effect. The player controls emission intensity per hook.
- Energy cost creates resource pressure. Shouting is expensive. Whispering is cheap. Dense whisper-nets cost more in relays but less in energy.
- Synergizes beautifully with information warfare. Enemy agents could jam high-power signals more easily (bigger emission = easier to target with countermeasures).

**Weaknesses:**
- Four power levels × multiple hooks per agent = combinatorial explosion of configuration choices. This might overwhelm beginners.
- "Just always use Normal" is a likely default strategy that avoids the decision entirely. The stealth/range tradeoff needs to be **viscerally enforced** — enemies must punish loud architectures aggressively for Whisper to feel worth the placement cost.
- Testing all power combinations in the workbench is tedious. The plan screen needs visual feedback for each power level — different-sized circles for each hook.
- Mission design must consistently reward quiet architectures to prevent "Shout everything" from being dominant.

**The TikTok clip:** Split screen. Left: a player's dense whisper-network. Relays packed tight, barely any emissions, enemies wander blind. Right: same map, different player, broadcasting everything. Enemies converge on the command unit, which lights up like a beacon on the EM overlay. Scouts report the swarm incoming, but it's too late — the command's position was betrayed by its own signals. "Loud architecture is dead architecture."

---

### Model 6: Terrain-Modified Routing (Environmental Layer)

**Mechanic:** The 8x8 board has **terrain types** that affect signal propagation. Certain tiles block, degrade, or amplify signals passing through them.

**Terrain signal effects:**

| Terrain | Signal Effect | Visual |
|---------|--------------|--------|
| Open ground | Normal propagation | Light tile |
| Dense cover | Blocks signals (line of sight required) | Dark foliage tile |
| High ground | +2 range bonus for transmissions from this tile | Elevated tile |
| Water | Signals cross but take +1 tick latency | Blue tile |
| Metal structure | Reflects/amplifies — no degradation passing through | Metallic tile |
| Jammer field | Reduces all signal range by 2 within radius | Pulsing red tile |

**How it works:**
- A scout on high ground at B2 transmits on `threat-east`. Its range is boosted by +2 — signals reach farther from elevated positions.
- A relay behind dense cover at D4 can't receive signals that must pass through the cover tile at C3. The player must route around the obstacle or place the relay in line-of-sight.
- An enemy jammer field around F5 reduces all signal ranges by 2 within its area. The player's relay at F4 can barely reach anyone. The jammer doesn't destroy agents — it destroys their communication.

**What the player optimizes:** Agent placement in relation to terrain. The board isn't just 64 equivalent tiles — it's a signal-propagation landscape. High ground is precious for relays. Dense cover protects units but blocks comms. The player reads the board not just for combat advantage but for **communication advantage**.

**Strengths:**
- Deeply tactical per-mission. Each map's terrain creates a unique routing puzzle. Mission 3's board might have a wall of dense cover dividing east from west, requiring a relay on high ground at the center to bridge comms.
- Terrain is immediately legible. Players understand "walls block signals" from real life. The mental model transfers instantly.
- Creates mission variety through map design. Same units, same rules, different terrain = completely different spatial puzzle.
- Synergizes with Into the Breach's grid-based clarity. Terrain effects on signals are as readable as Into the Breach's environmental hazards.
- Enemy jammer fields introduce spatial information warfare. The enemy doesn't just fight your units — it fights your *communications infrastructure* by controlling terrain.

**Weaknesses:**
- Adds significant complexity to the plan screen. Every tile now has signal-propagation properties the player must learn and read.
- Ghost previews become extremely complex. A relay's effective range depends on surrounding terrain — the ghost circle becomes an irregular shape based on line-of-sight calculations.
- Risk of "just put everything on high ground" dominant strategy. Counter: high ground has no cover, units there are exposed to enemy fire.
- Mission-specific terrain means the player's spatial skills don't fully transfer between missions. A layout that works on one map fails on another — which is either interesting variety or frustrating inconsistency.

**The TikTok clip:** The player positions a relay on the one high-ground tile in the center of the map. Ghost preview shows its range cone expanding — covering the entire east flank. Execute. The relay becomes a glowing hub of compressed intel, channeling scout reports to strikers with perfect efficiency. Then an enemy specialist reaches the high ground, destroys the relay, and occupies the tile. Suddenly the relay's replacement, built at ground level, has half the range. The network fragments. "Control the hill, control the conversation."

---

## Interaction Matrix: Spatial Routing × Other Systems

| Other System | Model 1 (Global) | Model 2 (Range) | Model 3 (Attenuation) | Model 4 (Relay Reception) | Model 5 (Emission) | Model 6 (Terrain) |
|---|---|---|---|---|---|---|
| **Buffer overflow** | Happens from too many signals on a channel (config problem) | Happens from relay death creating raw signal floods | Happens from degraded signals consuming slots inefficiently | Happens when relay dies and raw signals flood | Happens when power mismatch creates partial delivery | Happens when terrain change reroutes signals through unexpected paths |
| **EM emissions** | Global emissions — detectable from anywhere | Emissions originate from transmitter's position, range = emission radius | Same as Model 2 but intensity varies with power needed | Relay emissions are local; scout emissions are global | **Core integration** — emission IS range | Terrain modifies emission propagation too |
| **Relay identity** | Compression/filter node only | Bridge + processor | Quality amplifier | Local processor | Power router | Terrain-adapted router |
| **Plan screen complexity** | Low (perception circles only) | Medium (perception + transmission circles) | High (fidelity gradient overlays) | Low-medium (relay reception circles only) | High (per-hook power circles) | High (terrain overlay + modified range shapes) |
| **Mission 1 tutorial** | Trivially simple | Must explain range on first mission | Too complex for tutorial | Clean: "relays hear nearby" | Must explain power levels early | Must explain terrain on first mission |
| **Command agent value** | Manages channel topology only | Central placement maximizes range coverage | Central placement = higher fidelity input | Central placement = hears more relays | Chooses power levels for subordinates | Placed on high ground for network visibility |
| **Combat drama** | Relay death = lost processing | Relay death = **communication blackout** (most dramatic) | Relay death = quality degradation | Relay death = lost processing | Relay death = coverage gap + emission hole | Relay death + terrain loss = double loss |
| **Skill transfer** | Pub/sub messaging | Network topology, coverage analysis | Signal processing, information quality | Service mesh, sidecar pattern | RF engineering, stealth networking | Environmental routing, line-of-sight physics |

---

## Recommended Combinations

### "The Progressive Reveal" (Models 1 → 4 → 2)

**Missions 1-4:** Global channels (Model 1). The player learns channel topology without spatial pressure. "Channels are Slack channels."

**Missions 5-7:** Relay reception radius (Model 4). Relays are introduced, and their LOCAL reception creates the first spatial dimension. "Relays hear nearby." The player discovers that relay placement determines what gets compressed.

**Missions 8-10:** Full range limits (Model 2) OR emission coupling (Model 5). The spatial constraint extends to ALL agents. Scouting coverage, relay placement, and command positioning all become intertwined spatial puzzles.

This progressive reveal mirrors the mission arc's pedagogical structure: concepts first, factory second, full complexity last.

### "The Stealth Campaign" (Model 5 throughout)

If emission coupling is introduced early (Mission 1: your scout's signal was detected because you used Normal power — try Whisper), the entire campaign becomes a stealth-routing game. This creates a distinctive identity but raises the tutorial complexity.

### "The Terrain Puzzle" (Model 6 throughout)

If terrain effects are built into every mission, map design becomes the primary variety axis. Each mission's unique terrain creates a new routing puzzle. This is closest to Into the Breach's approach — same units, same rules, different puzzle each time.

---

## Player Journeys

### Journey: Mei, 19, Computer Science Student

**Context:** Mission 3 — Blind Spots. Hand-configured mission with 6 units: 2 scouts, 2 relays, 2 strikers. First mission where relay placement matters. Playing with Model 2 (range-limited channels).

**Minute 0:00 — Plan Screen Opens**

Mei sees the 8x8 board on the left. Six units are pre-placed: scouts at B2 and B7, relays at D4 and D5, strikers at F3 and F6. On the right, the workbench shows the relay at D4 selected. Its config panel shows 4 hook slots — two occupied: `listen: threat-east, send: strike-orders`. Below the config, a stats block reads "Transmission Range: 7 tiles."

On the board, faint blue concentric circles radiate from D4 — the relay's range. Scouts at B2 (distance: 4 tiles) and B7 (distance: 5) are both within range, shown by blue dots at their positions. Strikers at F3 (distance: 3) and F6 (distance: 4) are also within range.

Mei thinks: "Everything's connected. Let me just hit execute."

**Minute 0:15 — The Trap**

Mei presses EXECUTE. Sealed watch begins. Tick 1: scouts begin patrol routes. Scout-B2 heads east toward enemy territory. Scout-B7 heads south. Tick 4: Scout-B2 has moved to E2 — still within relay range at D4 (distance: 3). It detects an enemy at F1 and fires on `threat-east`. The relay at D4 receives, compresses, forwards on `strike-orders`. Striker-F3 receives and moves to engage. Green flash at D4 — signal delivered.

Tick 7: Scout-B7 has patrolled south to B3, then east to D3, then... to **G3**. Distance from relay D4: 5 tiles. Still barely in range. But its patrol continues — tick 8, it's at **H3**. Distance: 6 tiles. The relay's range is 7, so... still fine. Tick 9: H4. Distance: 6. Fine. Tick 10: H5. Distance: 5. Fine.

But then the enemy flanks from the west. An enemy appears at A5. Scout-B7 is all the way at H5 — too far to detect it. The relay at D4 is too far from A5 to help. The western flank is completely dark.

**Minute 1:30 — Sealed Watch Ends**

Both strikers are destroyed. The eastern threat was handled, but the western flank had zero coverage after tick 6.

**Minute 1:45 — Inspector**

Mei opens the inspector. Clicks the relay at D4. The queue depth chart shows steady green (low buffer, efficient). Channel metrics: `threat-east: 4 signals received, 4 compressed, 4 forwarded. threat-west: 0 signals received.` She realizes: the second scout patrolled so far east that nothing was watching the west.

She clicks the scout at B7 (now destroyed). Its patrol path is highlighted: B7 → B3 → D3 → G3 → H3 → H5. A red range circle shows the relay at D4 — the scout left its range at tick 8. After that, any detections on the scout's channel went nowhere because... wait. The signals ARE global in this config. She re-reads.

No — this is Model 2. The scout's transmission range is 3 tiles. From H5, the scout CAN detect enemies (perception range 5), but it can't transmit to the relay at D4 (distance: 6 > scout's range 3). The scout was screaming into void.

**Minute 2:30 — The Insight**

Mei drags the second relay from D5 to B5 on the plan screen. Now the western relay covers A1-F5. She adjusts the scout-B7's patrol to stay within the western sector. Ghost preview confirms: at every point in the patrol, the scout is within 3 tiles of the relay at B5. The relay at B5 is within 7 tiles of both strikers.

She re-runs. This time, the western scout detects the flank attack at A5, transmits to the nearby relay, which forwards to the strikers. Both flanks covered.

**Minute 4:00 — Resolution**

Mei thinks: "The wiring was fine. The *placement* was wrong. The relay wasn't positioned to hear the scout."

**UI Annotations:**
- **Range circles:** Faint blue concentric rings from each agent, radius = transmission range. Solid blue for perception range. Dashed blue for transmission range. Color-coded: green dots on agents within range, red dots on agents outside range.
- **Patrol path ghost:** When a scout's patrol is defined, a dotted line shows the full patrol route on the board. Points where the scout leaves relay range are marked with a red ⚠.
- **Channel metrics panel:** In the inspector sidebar, each channel shows signal counts at each node. "0 signals received" highlighted in amber as a warning.

---

### Journey: David, 42, Logistics Manager (No Strategy Game Experience)

**Context:** Mission 5 — Assembly Line. First blueprint mission. David is using Model 4 (relay reception radius). He just learned factory basics and is creating his first blueprint set.

**Minute 0:00 — The Overwhelm**

David's plan screen shows the base at A4. The workbench panel has three blueprints: Scout (from mission 2), Striker (from mission 2), and a new blank Relay blueprint. The production queue (conveyor belt at the bottom) shows Scout → Striker → Scout → Striker repeating.

He knows scouts detect enemies and strikers fight them. He's not sure what the relay does. The relay blueprint panel shows skills: `compress`, `filter`, `amplify`. Hook slots: 4. A tooltip on the relay icon reads: "Stationary unit. Processes nearby signals."

He hovers over "nearby" and a tooltip explains: "Relays can only receive signals from agents within 5 tiles." He thinks: "So it's like a cell tower. It has to be close enough to hear."

**Minute 1:00 — First Attempt (No Relays)**

David sets the production queue to all scouts and strikers. Hits execute. The sealed watch runs. His scouts detect enemies and transmit on `threat-net`. His strikers listen on `threat-net` and receive the raw signals globally (non-relay agents receive globally in Model 4). The strikers' buffers fill quickly — raw, uncompressed signals from three scouts, every tick. Buffer bars turn amber, then red. Signals start getting evicted. A striker charges toward a threat that was evicted from its buffer mid-route, then stops, confused, pivots to a newer signal.

The battle is chaotic. Strikers jerk between targets. One striker destroys an enemy; two others waste ticks chasing ghosts from evicted signals.

**Minute 2:30 — Inspector Reveals**

In the debrief, David clicks a striker. Its buffer state at tick 15 shows 8/8 slots full — three raw scout signals from this tick, two from last tick (stale), one from three ticks ago (very stale), and two slots of self-generated observations. The queue depth chart is solid red from tick 8 onward.

Channel metrics: `threat-net: 47 signals transmitted, 47 received by each striker, 31 evicted from strikers.` The problem is obvious: too much raw data.

**Minute 3:00 — Adding the Relay**

David goes back to the plan screen. He adds a Relay blueprint. Gives it hooks: `listen: threat-net`, `send: orders-net`. Enables the `compress` skill. Now scouts transmit on `threat-net` (globally), the relay receives (from scouts within 5 tiles), compresses 3 scout reports into 1 summary, and forwards on `orders-net`. Strikers now listen on `orders-net` instead of `threat-net`.

But where does the relay go? David places it at D4 — the board center. Ghost preview shows a 5-tile reception radius circle. Two of his three scouts spawn near the east side; the third patrols the west. At the patrol's western extreme (A-column), the scout is 3 tiles from D4 — within range. At the eastern extreme (G-column), the scouts are also within range. The center position covers everything.

**Minute 4:30 — Execute Again**

This time, the sealed watch is different. Scouts transmit raw data. The relay at D4 receives signals from scouts within its radius, compresses them, and forwards clean summaries on `orders-net`. Strikers receive 1 compressed signal instead of 3 raw ones. Buffer bars stay green. Strikers move purposefully. Two enemies destroyed without confusion.

Then a scout patrols to H2 — distance 6 from relay D4. Out of relay reception range. The scout detects an enemy at H1 and transmits on `threat-net`. The relay at D4 doesn't hear it (too far). No compression. The raw signal goes directly to the strikers on `threat-net`... but wait, David changed the strikers to listen on `orders-net`, not `threat-net`.

The scout's signal reaches nobody. The enemy at H1 approaches unopposed.

**Minute 5:30 — The Routing Gap**

In the debrief, David sees it: the relay only hears scouts within 5 tiles. When the scout went too far east, its signals fell outside the relay's reception radius. And because the strikers were rewired to `orders-net`, the raw `threat-net` signal had no listeners.

Solution: either add a second relay covering the eastern edge, or have strikers listen on BOTH channels (which uses a hook slot on each striker).

**Minute 7:00 — Resolution**

David adds a second relay at F4, reception radius covering E-H columns. Now both relays compress local scout data and forward on `orders-net`. Full coverage.

He thinks: "It's like having two regional managers instead of one. Each relay handles their area's scouts." The logistics metaphor clicks.

**UI Annotations:**
- **Relay reception radius:** A warm amber circle (distinct from perception blue). Pulsing gently. Scouts within it have a small antenna icon overlay.
- **"No listeners" warning:** When a channel has transmitters but no receivers, the channel map panel shows a yellow ⚠ icon. Hovering shows "threat-net: 1 transmitter (Scout-3), 0 listeners."
- **Buffer bar progression:** Thin horizontal bar at bottom of each unit tile. Segments: bright green (fresh), dim green (1 tick old), amber (2+ ticks old), red (3+ ticks old). Pulsing when full.

---

### Journey: Katya, 31, Senior Software Engineer

**Context:** Mission 9 — Arms Race. Factory vs. factory. Playing with Model 5 (emission-radius coupling). Katya has mastered whisper/normal/shout power levels and is building a stealth architecture to counter an aggressive enemy factory.

**Minute 0:00 — Reading the Board**

Katya's base is at A4. Enemy base at H5. The board is open — no terrain modifiers (pure Model 5, no terrain interaction). She has 45 material and 15 energy/tick budget.

Her existing architecture (from mission 8): 2 scouts on `east-net` (Normal power, range 4, emission 3), 1 relay at D4 on `east-net`→`strike-net` (Normal, range 4), 2 strikers on `strike-net` (Whisper, range 2, emission 1).

She reviews the enemy's last mission performance in the debrief archive. Enemy scouts had detected her relay at D4 by tick 12 — the relay's Normal-power emission was visible from 3 tiles away. An enemy striker targeted and destroyed it by tick 18.

**Minute 0:45 — The Stealth Redesign**

Katya switches her entire architecture to Whisper power. Scouts: Whisper (range 2, emission 1). Relay: Whisper (range 2, emission 1). Problem: with range 2, the scout at B2 can only reach the relay at D4 if it stays within 2 tiles — effectively tiles C3, C4, C5, D3, D5, E3, E4, E5. That's a tiny operating area for a patrol.

She redesigns. Moves the relay to C3 — closer to the scouts' patrol routes. But now the relay can only reach strikers within 2 tiles. Striker at F3 is 5 tiles away — out of range. She'd need a **relay chain**: relay at C3 (hears scouts) → relay at E3 (hears relay at C3) → striker at F3 (hears relay at E3).

Cost check: 3 relays × 5 material = 15 material. Plus 2 scouts (6), 2 strikers (16). Total: 37 material. Within budget. Energy: 3 relays × 2e = 6e, 2 scouts × 1e = 2e, 2 strikers × 3e = 6e. Total: 14e/tick. Just under budget.

But the entire network whispers. Emission radius: 1 tile per agent. Enemy scouts (perception 5) would need to be within 1 tile to detect any emissions. Her network is nearly invisible.

**Minute 2:00 — The Tradeoff**

Katya realizes the weakness: latency. Scout → Relay C3 → Relay E3 → Striker = 3 hops = 3 ticks. With the enemy factory producing aggressive strikers, 3 ticks of latency means her strikers might receive threat data about an enemy that moved 3 tiles since detection.

She considers a hybrid: scouts at Whisper, relays at Normal (range 4, emission 3), strikers at Whisper. Now the relay chain is shorter: scout → relay at D4 (Normal range covers D4 from scout at B2, distance 4 ≤ range 4) → striker at F3 (Normal range covers F3 from D4, distance 3 ≤ range 4). 2 hops, 2 ticks. But the relays emit at radius 3, making them detectable.

She decides: **one loud relay, everything else whispers.** The relay is the sacrificial node — detectable, but replaceable. If the enemy destroys it, the factory builds another. The relay is consumable infrastructure.

**Minute 3:30 — Execute**

She places the relay at D4 (Normal power), queues relay as second production item (after scouts), and hits execute. The sealed watch unfolds:

Ticks 1-5: Scouts whisper-patrol the east. Emissions: invisible (radius 1). The relay at D4 receives scout whispers (within range 4) and retransmits on `strike-net` at Normal power (range 4, emission 3). Strikers receive orders cleanly.

Tick 8: An enemy scout at F6 (perception 5) detects the relay's emission at D4 (emission radius 3, distance from F6 to D4 = 4 tiles — just outside emission radius). The relay is safe. But the enemy scout moves to F5 at tick 9 (distance 3) — now within emission radius. The enemy scout fires on its channel. Enemy striker inbound.

Tick 12: Enemy striker reaches D4. Destroys the relay. The `strike-net` channel goes dark.

Tick 13: Katya's factory produces a new relay. It spawns at A4 (base), assigned to the D4 position. It begins moving... but wait. Relays are **stationary**. The new relay spawns and stays at A4.

Katya's face: "Oh no."

The new relay at A4 is 5 tiles from the nearest scout at C2. With Normal power (range 4), the scout's whisper (range 2) can't reach the relay. The scout would need to be within 2 tiles of A4. The entire east network is severed — not because of channel config, but because the new relay spawned at the wrong position and can't move.

**Minute 4:00 — The Realization**

In the debrief, Katya understands: relay placement isn't just a plan-phase decision. It's a **production logistics** decision. Where relays spawn matters. If the base is at A4 and the network needs a relay at D4, the relay must be placed there during planning. A replacement relay from the factory spawns at the base — it can't walk to D4.

For mission 10, she designs around this: relays are **disposable but pre-positioned**. She places TWO relays at D4 during planning (one active, one backup). Or she designs the network so any relay position works — distributed architecture vs. centralized hub.

**Minute 5:30 — Resolution**

Katya restructures to a mesh: three relays at C3, D4, E5. Each relays to the others. If one dies, the remaining two maintain partial coverage. More expensive, but resilient. She also adds a Command agent at B4 whose `reroute` skill can reassign surviving relays to cover the dead relay's channels mid-battle.

She thinks: "This is a distributed systems problem. Single point of failure, automatic failover, mesh networking. This game is teaching me things I use at work."

**UI Annotations:**
- **Power level indicator:** Each hook in the config panel has a small speaker icon: one arc (Whisper), two arcs (Normal), three arcs (Shout), four arcs + pulse (Broadcast). Hovering shows range and emission radius.
- **Emission overlay:** Toggle in plan screen. Shows red-tinted circles for every agent's emission radius. Overlap zones glow brighter. "Enemy perception: 5 tiles" marked as a dashed red circle around known enemy positions.
- **Relay spawn position warning:** When a relay is queued in production, a ghost relay appears at the base position. If the base is far from the relay's optimal position, an amber ⚠ appears: "Relay spawns at base. Relays are stationary."

---

### Journey: Tomás, 15, Minecraft Redstone Builder

**Context:** Mission 6 — Chain of Command. First command agent mission. Playing with Model 6 (terrain-modified routing). The map has a ridge of high ground tiles at D4-D5 and a dense cover wall at E3-E6.

**Minute 0:00 — The Terrain Map**

Tomás sees the 8x8 board. Most tiles are open ground (light tan). But tiles D4 and D5 are elevated — a brighter color with a subtle upward arrow icon. Tiles E3, E4, E5, E6 are dense cover — dark green with a foliage icon. A tooltip on the cover tile reads: "Dense Cover: blocks signal propagation. Agents behind cover cannot transmit through it."

The board is divided: west half (A-D) is where his base and scouts operate. East half (E-H) is enemy territory. The cover wall at column E blocks signals from crossing.

His units: 2 scouts (west), 1 relay on the ridge at D4, 1 striker (east, behind enemy lines from last mission's breach), 1 command agent at B4. New this mission: the command agent can `reassign` and `reroute`.

**Minute 0:30 — The Signal Blockade**

Tomás tries his standard config: scouts detect enemies, relay at D4 compresses and forwards to the striker at F3. Ghost preview shows the problem immediately. A red X appears on the signal line from D4 to F3. Hovering: "Signal path blocked by Dense Cover at E4."

The relay at D4 can transmit west (clear path) but NOT east (cover wall blocks). The striker at F3 is isolated — it can receive signals from sources east of the cover wall, but nothing from the relay.

Tomás thinks: "It's like Minecraft — the redstone signal can't pass through obsidian. I need to go around."

**Minute 1:00 — High Ground Advantage**

He notices D5 is also high ground. Tooltip: "High Ground: +2 tile transmission range from this tile." The relay at D4 has base range 7. From high ground: range 9. But the cover wall is at E3-E6 — the signal still can't pass through.

He tests: what if the relay transmits from D4 to D2 (south of the wall, open ground), then through E2, F2 (below the wall) to reach F3? But signals don't path-find. They propagate in a radius. The cover at E3-E6 blocks any straight-line path from D4 to anything east of E3-E6.

He needs a **relay south of the wall** — at E2 or E7 (above or below the wall). He places a second relay at E2. Signal path: D4 → D3 (open) → E2 (open, south of wall) → F2 (open) → F3 (striker). The ghost preview shows green — full connectivity through the gap below the wall.

**Minute 2:00 — The Command Agent's Role**

The command agent at B4 has `reroute` skill. Tomás configures a rule: "IF relay at E2 destroyed, reroute `strike-net` through E7." He doesn't know if an enemy will destroy E2 specifically, but the wall forces all communications through two chokepoints (E2 and E7). If either gap relay dies, the command agent switches to the other.

This is the first time Tomás uses a command agent to manage *network topology* rather than unit behavior. He's excited — "It's like a Minecraft hopper system that switches paths when one gets blocked."

**Minute 3:00 — Execute**

Sealed watch. The relay chain works: D4 → E2 → striker at F3. The striker engages enemies east of the wall. Tick 8: an enemy specialist reaches E2 and destroys the gap relay. The `strike-net` channel to the east goes dark.

Tick 9: The command agent at B4 detects the relay loss (its rules check for signal timeout on `strike-net`). It fires `reroute`, switching the backup relay at E7 to take over `strike-net` forwarding. Tick 10: the northern gap relay at E7 picks up the broadcast from D4 and forwards to the striker. One tick of blackout, then restored.

Tomás pumps his fist. "The command agent fixed it automatically!"

**Minute 4:30 — Resolution**

In the debrief, Tomás sees the one-tick gap in the striker's buffer — tick 9, no signals received. The command agent's reroute log shows the switch at tick 9.5 (processed, effective tick 10). The striker missed one tick of data. On that tick, an enemy moved to G4 — the striker didn't know, and took a suboptimal path at tick 10. But the recovery was fast enough to salvage the mission.

Tomás wants to reduce the gap to zero. He configures BOTH gap relays to listen on `strike-net` simultaneously — redundant coverage. If E2 dies, E7 is already receiving. No reroute needed. But this uses extra hook slots on E7 and means E7's buffer fills faster (receiving signals it might not need to forward).

**UI Annotations:**
- **Terrain signal overlay:** Toggle in plan screen. Cover tiles show a hatched red pattern. High ground tiles show upward blue arrows. Signal lines are drawn from relay positions; lines that intersect cover tiles turn red and show ✕.
- **Gap visualization:** When cover creates a wall, the two gap positions (above and below) are highlighted with a subtle pulsing blue outline — "signal chokepoints."
- **Command reroute log:** In the inspector, the command agent's action history shows "Tick 9: REROUTE strike-net from relay-E2 to relay-E7. Trigger: signal_timeout(strike-net, 2 ticks)."

---

## Comparable Games

### Into the Breach — Spatial Constraint as Core Language
Into the Breach's entire game is spatial. Every mechanic references the grid: movement, attack range, push direction, environmental hazards. The grid IS the game's vocabulary. Robot Uprising's spatial routing would similarly make the grid matter for information, not just combat. Into the Breach proves players can read complex grid interactions at a glance when the visual language is clear.

### Screeps — Network Topology as Endgame
In Screeps, high-level players build relay networks of creeps that transfer resources and information across rooms. Room boundaries create natural signal cutoffs (you can't directly observe an adjacent room without a creep in it). Players who master inter-room logistics dominate. Robot Uprising's spatial routing is this same skill in miniature — on an 8x8 grid instead of a world map.

### Factorio — Throughput Geography
Factorio's belts, inserters, and logistics networks are fundamentally spatial. A well-designed factory has short belt paths (low latency), minimal intersection (no congestion), and redundant supply lines (fault tolerance). Robot Uprising's relay placement maps directly to Factorio's logistics design — where you put the node determines the network's efficiency.

### StarCraft — Map Control as Information Control
In StarCraft, map control provides information: watch towers, creep spread, overlord positioning. A player who controls the map *sees more*. Robot Uprising's spatial routing literalizes this — relay placement IS map control for information. Losing a map position doesn't just lose territory; it loses communication capacity.

### Slay the Spire — Topology of Relics (Weak Analogy)
Slay the Spire's relics modify how information (cards) flows through the player's deck. Some relics are "global" (always active), others are "positional" (first card played, last card drawn). The spatial routing models in Robot Uprising parallel this: some are global (Model 1), some are positional (Models 2-6). But the analogy is weak because Slay the Spire's space is abstract (deck order) not physical (grid tiles).

---

## Sensory Description: What Each Model Looks Like

### Model 1 (Global) — "The Internet"
Signals are thin white lines that snap into existence between transmitter and receiver, regardless of distance. They appear for one frame, then fade. The board is covered in a web of fading lines — chaotic, fast, everywhere. It looks like watching network packet traces in Wireshark. No directionality, no weight, just rapid pulses of connectivity. Sound: soft digital chirps, rapid and overlapping, like a modem handshake played at 4x speed.

### Model 2 (Range-Limited) — "The Radio Net"
Signals are bright arcs that travel visibly from transmitter to receiver across the grid — you can see the signal hop from tile to tile, taking one frame per tile, leaving a fading trail. Signals that reach the edge of range dim to nothing and vanish with a soft static fizzle. The board shows glowing trails converging on relays and radiating from them — a star pattern centered on each relay. Sound: clean tones for successful delivery, static crackle for out-of-range attempts.

### Model 3 (Attenuation) — "The Fog"
Signals leave the transmitter as bright, sharp pulses — vivid white with a colored tint per channel. As they travel, the pulse softens: dimmer, blurrier, the tint fading toward grey. By the time a degraded signal reaches a distant receiver, it's a pale ghost of the original — barely visible, almost transparent. Full-fidelity signals arrive as crisp bright flashes. Degraded signals arrive as soft, diffuse glows. Sound: full-fidelity = clear bell tone; degraded = muffled bell through cotton; minimal = distant whisper.

### Model 4 (Relay Reception) — "The Satellite Dish"
Relays have a visible warm amber circle — their reception radius. It pulses gently, like sonar. When a scout's signal enters the circle, a bright line connects scout to relay for one frame. The relay processes (compression animation: signal enters as three lines, exits as one thicker line). Then the relay broadcasts globally — thin white lines to all listeners (Model 1 style). The contrast is vivid: local amber reception circle → global white broadcast. Sound: amber circle hums at low frequency; successful reception = satisfying click; broadcast = high-pitched ping.

### Model 5 (Emission-Radius) — "The Radar"
Each transmitting agent emits a visible red emission ring that expands outward from their position at signal speed, like sonar. Whisper: a tiny ripple (2 tiles), barely visible. Normal: a medium ring (4 tiles), clearly legible. Shout: a large ring (7 tiles) that washes across the board. Broadcast: the entire board flashes red for one frame. Enemy agents within the emission radius get a small red exclamation mark — "detected!" The board becomes a sonar display of overlapping red ripples. Dense whisper-networks: gentle, subtle ripples. Broadcast architectures: constant red pulses. Sound: whisper = soft exhale; normal = radio static burst; shout = alarm klaxon, muted; broadcast = emergency siren.

### Model 6 (Terrain) — "The Canyon"
Signals travel as visible arcs, but they interact with terrain. A signal hitting dense cover splatters — bright fragments scatter and dissipate (blocked). A signal crossing water slows visibly — the arc droops and stretches. A signal from high ground launches with extra brightness and reach — a spotlight effect. Metal structures reflect signals with a metallic flash — the arc bounces. Jammer fields are visible as a pulsing red dome; signals entering the dome dim and shrink. Sound: blocked signal = dull thud against cover; water crossing = underwater gurgle; high ground = soaring whistle; jammer = electronic buzzing that intensifies near the center.

---

## New Aspects Discovered

Through this analysis, the following new aspects should be added to the frontier:

1. **2.14a — Dynamic connectivity as emergent gameplay:** When mobile agents (scouts) move in and out of relay range during execution, the information network topology changes every tick. How should the plan screen help players predict which ticks have full connectivity vs. partial? Patrol-path-range intersection visualization as a first-class plan screen tool.

2. **2.14b — Relay chain latency vs. range tradeoff:** With range-limited models, players face a choice: short relay chains (low latency, limited coverage) vs. long relay chains (high latency, full coverage). Is there an optimal relay density for an 8x8 grid? Mathematical analysis of coverage vs. latency for different relay counts and ranges.

3. **2.14c — Relay destruction as the primary loss condition:** In range-limited models, destroying a relay can sever an entire flank's communication. Should relay destruction be MORE dramatic than scout or striker destruction? A "communication blackout" visual effect. Interaction with the sealed watch emotional beat.

4. **2.14d — Factory-spawned relay positioning problem:** Relays are stationary. The factory spawns units at the base. A replacement relay spawns at the base position, not the destroyed relay's position. How does the player handle relay replacement? Pre-positioned backup relays, or a "deploy to position" mechanic for stationary units?

5. **2.14e — Terrain-as-mission-identity:** If terrain modifies signal routing (Model 6), each mission's terrain creates a unique routing puzzle. How many distinct terrain archetypes exist? The "wall," the "moat," the "island," the "corridor." How does terrain-based mission variety interact with the existing mission arc structure?
