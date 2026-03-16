# 2.05 — Shared Buffer: Group of Units Shares a Collective Memory Pool

**Aspect:** 2.05 — Shared buffer
**Wave:** 2 (Core Mechanic Variations)
**Category:** core-mechanic

---

## The Design Question

Every other buffer model (2.01 fixed-slot, 2.02 weighted, 2.03 decay, 2.04 categorized) assumes each unit has its own **private** context window. The shared buffer model asks: what if some or all units pool their working memory into a **collective resource** — a shared knowledge base that multiple units read from and write to simultaneously?

This is the **blackboard pattern** made playable. In real AI engineering, shared memory is one of the fundamental coordination primitives — from Screeps' `Memory` object (a global JSON store that all creeps read/write) to the classic blackboard architecture where specialist agents post partial solutions to a common workspace. In Robot Uprising, a shared buffer would mean that a Scout's observations don't just fill its own 6-slot context window — they enter a communal pool that a Striker, Relay, and Command unit all draw from.

The core tension: **shared memory enables zero-latency coordination** (no hooks needed, no signal delay, everyone sees everything instantly) **but creates contention, noise, and a single point of catastrophic failure.** The architectural question for the player becomes: how much do you share, with whom, and at what cost?

---

## Six Models for Shared Buffers

### Model A — "The Blackboard" (Full Shared Pool)

All units in a designated group contribute to and read from a single large buffer. Individual unit buffers are eliminated entirely. A 3-unit squad (Scout + Striker + Relay) with individual buffers of 6 + 8 + 12 = 26 slots instead shares a single 26-slot communal pool.

**How it works:**
- During the Plan phase, the player assigns units to **squads** (groups of 2-5 units)
- Each squad has a single shared buffer whose capacity = sum of member capacities (possibly with a pooling tax — see below)
- All members' perceptions, hook receptions, and internal state write to the shared buffer
- All members' rules evaluate against the shared buffer contents
- Eviction follows whatever policy is configured (FIFO, priority, weighted — orthogonal to the sharing model)

**The pooling tax:** To prevent shared buffers from being strictly superior to individual ones, a squad's shared capacity could be less than the sum of members. A **pooling coefficient** of 0.8 means the 3-unit squad above gets `floor(26 × 0.8) = 20` shared slots instead of 26. Six slots of capacity are lost to coordination overhead — the "cost of communication."

**Why it's interesting:**
- Eliminates signal latency between squad members (the Scout's observation is immediately available to the Striker — no hook, no channel, no 1-tick delay)
- Creates a **contention problem**: 3 units dumping observations into one pool means the buffer fills 3× faster. A Scout seeing 4 enemies and a Relay receiving 6 hook messages = 10 entries per tick into a 20-slot pool. Half the pool refreshes every tick.
- Context overload becomes a **squad-level event**. When the shared buffer overflows, ALL members are stunned for 1 tick, not just one unit. A noise bomb that fills the shared pool takes out the entire squad.

**The player's design space:** Instead of configuring individual context windows, the player is designing a **shared information architecture** — who contributes what, who reads what, what gets evicted first. The squad's shared buffer IS the squad's collective mind.

### Model B — "The Hub-and-Spoke" (Central Cache + Private Buffers)

Each unit retains its own private buffer, but a designated hub unit (typically Relay or Command) maintains a **shared cache** that other units can query. Units choose what to publish to the cache and what to read from it.

**How it works:**
- Each unit has its normal individual buffer (Scout: 6, Striker: 8, etc.)
- A hub unit (Relay or Command) additionally hosts a **shared cache** — extra slots (4-8) that any connected unit can read
- Publishing: A unit with a "publish" skill or hook can copy one of its buffer entries to the shared cache. This costs 1 tick and the entry occupies one cache slot
- Reading: Any unit connected to the hub can spend 1 tick to query the cache and copy one entry to its own buffer
- The cache has its own eviction policy (configurable by the player)
- Physical proximity matters: units must be within a certain range of the hub to access the cache (Relay: radius 3, Command: radius 5)

**Why it's interesting:**
- Preserves individual buffer management (the existing system works unchanged)
- Adds a **voluntary sharing layer** — the player decides what's worth caching
- Creates a natural bottleneck at the hub: destroy the Relay and the cache is gone
- The 1-tick publish/read latency means the cache is faster than multi-hop hook chains but not instant like Model A
- Cache contention is manageable: only published data enters, not raw perception floods

### Model C — "The Mesh" (Peer-to-Peer Buffer Sharing)

Any unit can directly read from any adjacent unit's buffer. No central hub, no special shared pool. Adjacency = buffer visibility.

**How it works:**
- Each unit has its own buffer (unchanged)
- A unit with the "share" or "peer" skill can, during its evaluation step, query the buffer of any unit within 1 tile (orthogonal adjacency)
- The querying unit sees the neighbor's buffer as read-only
- Rules can reference neighbor buffer contents: "IF adjacent-ally.buffer CONTAINS threat-data AND own.buffer LACKS threat-data THEN move-toward-threat"
- Reading a neighbor's buffer is free (no tick cost) but the data is NOT copied — it's only available during that one evaluation step. To persist neighbor data, the unit must use a "memorize" action to copy one entry to its own buffer (costs one action this tick)

**Why it's interesting:**
- Emergent formations: units that stay adjacent share awareness naturally. A tight cluster of Scout + Striker becomes a de facto shared-mind pair. Spreading out = information isolation.
- No architectural overhead: no shared pool to configure, no hub to protect. The sharing IS the positioning.
- Creates a **proximity incentive** that directly conflicts with the tactical incentive to spread out for map coverage. The player must balance information sharing (cluster) vs. perception coverage (spread).
- Trivially simple to teach: "units next to each other can see what each other sees"

### Model D — "The Broadcast Pool" (Write-Only Shared + Private Read)

A shared buffer exists but units can only **write** to it, not read from it directly. Instead, the shared pool's contents are automatically broadcast to all connected units' private buffers at the start of each tick (filling buffer slots like hook messages).

**How it works:**
- A shared broadcast pool exists (capacity: configurable, 4-10 slots)
- Any unit with a "publish" hook can write entries to the pool
- At the start of each tick, the pool's current contents are broadcast to every connected unit as hook-like messages (each entry fills one buffer slot per receiving unit)
- The pool itself persists until entries are evicted (FIFO or priority)
- Broadcasting is simultaneous with regular hook delivery

**Why it's interesting:**
- Combines shared writing with private reading — each unit still manages its own buffer
- The broadcast creates **guaranteed information baseline**: every unit in the network starts each tick with the same shared context entries in their buffer
- But those broadcast entries compete with local observations and hook messages for buffer space — a Scout near enemies might have its broadcast entries immediately evicted by fresh perception data
- The player's design question becomes: how many broadcast entries can each unit type afford to receive without drowning?

### Model E — "The Tiered Pool" (Hierarchical Shared Memory)

Multiple shared buffers at different hierarchy levels: squad-level (2-3 units), platoon-level (5-8 units), army-level (all units). Higher tiers have larger capacity but greater access latency.

**How it works:**
- **Squad pool** (2-3 units sharing): 4-6 slots, 0-tick access latency (instant)
- **Platoon pool** (5-8 units sharing): 8-12 slots, 1-tick access latency
- **Army pool** (all units): 14-20 slots, 2-tick access latency
- A Command unit's "prioritize" skill promotes entries up the hierarchy (squad → platoon → army)
- A Relay's "amplify" skill copies entries from a higher tier to a lower tier (army → squad)
- Each tier has independent eviction policies

**Why it's interesting:**
- Maps directly to real organizational communication patterns (team chat vs. department channel vs. company-wide announcement)
- Creates a natural information degradation gradient: detailed local awareness + delayed global awareness
- The hierarchy IS the player's army organization. How you partition squads and platoons determines your information architecture.
- Command units justify their high cost by being the only ones who can move data between tiers

### Model F — "The Stigmergy Pool" (Environment-Based Shared Memory)

Units don't share buffers directly. Instead, they **tag map tiles** with data that other units can read. The game board IS the shared memory.

**How it works:**
- Any unit can spend an action to "mark" a tile with one datum (e.g., "enemy seen here at tick 12", "danger zone", "rally point")
- Marks persist on the tile for N ticks (configurable, default 5) then decay
- Any unit on or adjacent to a marked tile automatically receives the mark as a buffer entry
- Multiple marks can stack on a tile (up to 3)
- Marks are visible to enemies with perception (a strategic cost — shared knowledge is also broadcast to opponents)
- The Specialist's "extract" skill can read enemy marks

**Why it's interesting:**
- Based on stigmergy — the biological coordination mechanism used by ants (pheromone trails). Ants don't talk to each other; they modify the environment and others respond.
- Information is **spatial** — it exists at a location, not in a unit. Destroying a unit doesn't destroy its knowledge; it's on the map.
- Creates a **fog of information** on the board itself. Tiles glow with stale marks, fade as marks expire, pile up in contested areas.
- Enemy visibility of marks means shared knowledge has an espionage cost — the more you mark, the more the enemy knows about your knowledge.

---

## Interaction Effects

### With Hook/Channel System
Shared buffers potentially **replace** hooks for intra-group communication. If a squad shares a blackboard (Model A), Scouts don't need hooks to tell Strikers about threats — the observation is already in the shared pool. This means:
- Hook slots become **inter-group** communication only (between squads)
- Channel architecture shifts from "every unit wired to every other" to "groups internally coherent, bridges between groups"
- The emit EM noise mechanic becomes less relevant for intra-group comms (shared buffers might be silent) or could be rebalanced so shared pools generate a constant low-level noise proportional to their size

### With Context Overload
Shared buffers dramatically change the overload dynamic:
- **Model A** (full pool): Overload is catastrophic — entire squad stunned simultaneously. A noise bomb targeting the shared pool is a squad-wipe weapon.
- **Model B** (hub): Overload of the hub's cache doesn't stun spoke units, only the hub itself. But losing the cache degrades the whole group's awareness.
- **Model F** (stigmergy): No buffer overload from marks — they're on the map, not in units. But a unit on a heavily-marked tile gets flooded with mark data, creating indirect overload.

### With Signal Latency
The locked 1-tick-per-hop latency is one of Robot Uprising's core mechanics. Shared buffers partially circumvent this:
- **Model A**: Zero latency within squad (observations are instantly shared). This is powerful — and needs a cost.
- **Model C**: Zero latency for adjacent units only. Latency returns the moment units separate.
- **Model E**: Tiered latency that the player explicitly designs. The best of both worlds, but complex.

The game could charge for shared-buffer speed: a pooling tax (Model A loses 20% capacity), a noise penalty (shared pools are louder for enemy detection), or a resilience cost (shared pools are a single target).

### With One-Shot-One-Kill
In a game where any adjacent striker kills instantly, shared buffers create a devastating vulnerability: kill one member of a shared-pool squad, and the pool shrinks (capacity reduced by that unit's contribution). Kill the hub in a hub-and-spoke setup, and the cache vanishes. The enemy's targeting priority shifts from "kill the strongest unit" to "kill the unit that breaks the information architecture."

### With Tagging
Model F (stigmergy) turns tagging into a dual-purpose mechanic: map control (resource income) AND information sharing (tile marks). This elegant overlap means controlling territory is literally controlling your army's shared knowledge base. Losing a tagged zone means losing both income and information infrastructure.

---

## Comparable Games & Media

### Screeps: Global Memory Object
Screeps gives every player a single `Memory` object (2MB JSON store) accessible by all creeps. Players design their own data structures within it — task queues, room plans, threat assessments. The key lesson: **unrestricted shared memory becomes a design problem, not a solution.** Advanced Screeps players spend as much time designing their memory schema as their creep logic. Robot Uprising could capture this by making shared buffer organization a first-class design decision.

Screeps also has **memory segments** (100 segments × 100KB, only 10 accessible per tick) — an explicit capacity and bandwidth limitation that forces players to prioritize what's in hot memory vs. cold storage. This maps to Robot Uprising's tiered pool (Model E).

### StarCraft: Shared Vision
In StarCraft, allied units automatically share vision (fog of war). This is a binary shared buffer: you either see everything your ally sees, or nothing. Robot Uprising's shared buffers could be StarCraft's shared vision made **granular and configurable** — not "see everything" but "share these specific data types with these specific allies."

### Gladiabots: Shared AI Priorities
Gladiabots lets players program robots with behavior trees that implicitly share targeting priorities through group-level commands. The "focus fire" mechanic is a simple shared buffer: all units in a group target the same enemy, effectively sharing a "priority target" datum. Robot Uprising's Model D (broadcast pool) is this mechanic generalized to arbitrary information types.

### Ants (Stigmergy in Nature)
Ant colonies coordinate millions of individuals with zero direct communication. Each ant deposits pheromones on the ground that evaporate over time. Other ants sense pheromone concentrations and adjust behavior accordingly. Stronger trails = more ants following = stronger trails (positive feedback). Model F directly captures this. The game design question is whether pheromone trails (tile marks) create the same emergent intelligence in Robot Uprising that they do in nature.

### Blackboard Architecture in Game AI
The blackboard pattern (Hearsay-II, 1980) is a standard AI architecture where specialist agents post partial solutions to a shared workspace. Modern game AI uses it extensively for squad coordination (enemies sharing intel about player position). Robot Uprising would be unique in **exposing the blackboard to the player as a configurable system** rather than hiding it as an AI implementation detail.

---

## Sensory Description

### Model A — The Blackboard (Visual Treatment)

The shared buffer renders as a **floating panel between the squad's units** — a translucent rectangle hovering above the midpoint of the squad formation on the isometric grid. It pulses with a soft cyan glow when entries are being written, amber when above 70% capacity, angry pulsing red when approaching overload.

Each entry in the shared pool is a tiny horizontal bar inside the panel, color-coded by source unit: **teal for Scout contributions, crimson for Striker, gold for Relay, violet for Specialist, white for Command.** When an entry is evicted, its bar slides left and dissolves into particles. When a new entry arrives, a thin beam of light arcs from the contributing unit to the panel as the new bar slides in from the right.

During overload, the panel **cracks** — jagged lightning-bolt fracture lines appear across its surface, all connected units show the stunned jitter animation simultaneously, and a low grinding buzz plays. The panel flashes white, then all entries below the eviction threshold dissolve at once in a cascade of falling particles. The panel seals back up (crack lines fade) and the buzz subsides into silence.

In the Inspector, clicking the shared pool panel opens a detailed view: each entry as a full card with source, channel, age, and a "used by" annotation showing which unit(s) evaluated this entry in their rules this tick. Entries that no unit evaluated are dimmed — **dead information**, occupying shared space but contributing nothing. The player quickly learns: dead entries in a shared pool are worse than dead entries in a private buffer, because they're wasting everyone's capacity.

### Model C — The Mesh (Visual Treatment)

No visible shared panel. Instead, when units are adjacent, thin **gossamer threads** stretch between their tile edges — wispy, almost invisible lines that glow brighter when data is being read. A Scout and Striker standing side by side show 2-3 threads between them, each thread briefly flashing when the Striker's rules reference the Scout's buffer contents.

When units separate (move more than 1 tile apart), the threads stretch, thin, and snap with a soft *tink* sound — like a guitar string breaking. The moment of disconnection is viscerally clear. When they reconnect (move adjacent again), new threads grow between them, initially dim, brightening as rules begin referencing shared data again.

In a tight 4-unit formation, the gossamer threads form a dense web — a visible neural network of shared awareness. When the formation breaks (units scatter to avoid an enemy striker), threads snap in rapid succession — *tink-tink-tink-tink* — and each unit is suddenly alone with only its own buffer. The transition from collective intelligence to individual isolation is the sound of breaking threads.

### Model F — Stigmergy (Visual Treatment)

Map tiles with marks glow from within. A fresh mark (just placed) emits a bright cyan pulse that ripples outward one tile in all directions — a visual "ping" that any unit on adjacent tiles will notice. As the mark ages, its glow shifts from cyan through green to a fading amber, becoming dimmer each tick until it fades completely at expiration.

Multiple marks on the same tile create stacked glow layers — a tile with 3 marks at different ages shows stratified light, like geological layers: bright cyan on top, green in the middle, fading amber below. Heavily-marked areas of the map look like bioluminescent reefs — concentrated knowledge infrastructure glowing in the battlefield darkness.

When an enemy unit passes through a marked tile, the marks briefly flicker crimson (enemy detected the information), creating a visual warning to the player: your intel is exposed. The Specialist's "extract" skill, when reading enemy marks, shows a vampiric drain animation — red energy flowing from the tile up into the Specialist's buffer bar.

---

## Player Journeys

### Journey: Marcus, 34, Backend Engineer

**Context:** Mission 6 (factory introduced). Marcus has completed the tutorial arc and is experimenting with multi-unit coordination for the first time. He's used hooks for everything so far and is frustrated by signal latency causing his Strikers to arrive 2 ticks late.

**Minute 0:00 — The Latency Problem**
Marcus stares at the debrief Inspector from his last failed run. He clicks on his Striker unit and scrubs to tick 14. The decision trace shows: "Rule: IF threat-in-range THEN engage. Buffer contents: [threat-at-C4, received tick 12, via recon-net channel]." The threat was at C4 on tick 10. The Scout saw it. The hook fired on tick 10. The Relay received on tick 11. The Striker received on tick 12. Two ticks of latency. By tick 14 when the Striker arrived at C4, the enemy had moved to E6. Marcus mutters "two ticks late, every time."

**Minute 1:30 — Discovering Shared Buffers**
Marcus opens the Plan screen and notices a new tooltip on the squad panel: "Squad Buffer: assign units to share a collective context window." He drags his Scout and Striker into a squad. The individual buffer bars (6 and 8 slots) merge into a single bar: 11 slots (14 × 0.8 pooling coefficient — the 20% tax is shown as a grayed-out section with a tooltip: "coordination overhead"). His two hook connections between Scout and Striker dim out automatically — they're redundant now.

**Minute 2:30 — The First Shared Run**
Marcus hits EXECUTE. The battlefield shows his Scout and Striker moving together, the floating shared buffer panel between them glowing softly. Tick 5: the Scout spots an enemy at D4. A teal bar appears in the shared panel instantly. The Striker's rule fires on the same tick — "IF threat-in-range THEN engage." Zero latency. The Striker moves toward D4 immediately. Marcus leans forward: "Oh. That's fast."

**Minute 3:30 — The Catastrophe**
Tick 12: the enemy spawns three units near the squad. The Scout generates 4 observations. A hook message arrives from a distant Relay. The shared pool is at 10/11 slots. Five new entries arrive. Eviction cascade: the panel flashes amber, four entries evict rapidly. But then tick 13: another perception flood. The panel cracks — 12 entries trying to fit in 11 slots. Both Scout and Striker show the stunned jitter. The enemy Striker walks up and eliminates Marcus's stunned Striker. Marcus slams the desk. "The shared buffer got them BOTH killed."

**Minute 5:00 — The Design Lesson**
In the Inspector, Marcus clicks the shared panel at tick 12. He sees: 6 entries from Scout perception, 3 from hook messages, 2 from Striker perception. The Scout was dumping everything it saw — Marcus never configured filters. In a private buffer, the Scout's flood would only stun the Scout. In the shared pool, the Scout's flood stunned the Striker too. Marcus realizes: **in shared buffers, every unit's noise is everyone's problem.** He goes back to Plan and adds listen/ignore filters: the shared pool ignores terrain data, only accepts threat and position signals. Capacity budget: much more manageable.

**Minute 7:00 — The Refined Architecture**
Second run. Scout + Striker squad, filtered shared pool. Distant Relay with private buffer connected via hooks. The squad handles local threats instantly (zero-latency shared awareness). The Relay provides longer-range intel with the normal 1-tick delay but doesn't pollute the squad's shared pool. Marcus watches the shared panel stay cool blue throughout the battle. The Scout spots, the Striker reacts same-tick, the squad flows like a single organism. Marcus grins. "This is what I've been trying to build with hooks this whole time."

**UI Annotations:**
- Squad panel: drag-to-assign unit grouping in Plan screen, showing merged capacity with tax
- Shared buffer bar: floating isometric panel between squad members, color-coded by source
- Overload visual: panel crack + simultaneous squad stun + grinding audio
- Filter config: per-squad signal type toggles (accept/ignore) in shared pool settings

---

### Journey: Priya, 16, First Strategy Game

**Context:** Mission 3 (pre-factory, learning hooks). Priya has never played a strategy game. She's been placing individual units and just learned hooks in Mission 2. The game introduces shared buffers as an alternative to hooks.

**Minute 0:00 — The Boot Log**
The boot log scrolls: "SUBSYSTEM INITIALIZED: Collective Memory Module. Agents assigned to the same squad share a single context window. What one sees, all know. Warning: shared awareness, shared vulnerability." Priya reads "what one sees, all know" and thinks of a group chat. That makes sense.

**Minute 0:30 — The Tutorial Setup**
Mission 3 has 2 pre-placed units: a Scout and a Striker. The tutorial prompt says: "Last mission, you wired hooks between these units. This mission, try something different: drag both units into the SQUAD panel to share their context window." A pulsing gold arrow points to the squad panel. Priya drags both units in. The individual buffer bars merge. A tooltip appears: "Shared context window: 11 slots. What the Scout observes, the Striker sees instantly."

**Minute 1:30 — The "Aha" Comparison**
The mission has two phases. Phase 1: Scout and Striker in a squad (shared buffer). The Scout spots an enemy, the Striker reacts same-tick. A sparkle effect on the shared panel and a satisfying *ching* sound mark the instant share. Phase 2: the tutorial separates them — "Now try WITHOUT shared context." The Scout spots an enemy but the Striker just stands there. A text bubble appears: "The Striker doesn't know about the enemy — it can't see the Scout's observations anymore." Priya reconnects them via hook (learned last mission). Now there's a 1-tick delay. She watches the Scout spot at tick 5, the Striker react at tick 6. The tutorial overlays: "Hooks: 1 tick delay. Shared context: instant. But shared context has risks..."

**Minute 3:00 — The Designed Overload**
The tutorial spawns a wave of 6 enemies near the squad. The shared panel fills rapidly — teal bars flooding in. The panel cracks. Both units stun. An enemy walks through and tags the mission objective. Tutorial text: "When the shared context overflows, BOTH units are stunned. In a shared squad, one unit's noise becomes everyone's problem." A comparison panel slides in: "Hooks: overload only stuns the receiving unit. Shared context: overload stuns the whole squad."

**Minute 4:30 — Priya's Choice**
The tutorial resets and asks: "For this mission, will you use shared context (fast but fragile) or hooks (slow but safe)?" Two big buttons. Priya picks shared context because "fast" sounds better. She succeeds on the second try after learning to keep the squad away from dense enemy clusters. She feels clever — she found the strategy that worked with the tool she chose.

**UI Annotations:**
- Tutorial squad panel: large, centered, with animated drag-target zones
- Comparison overlay: side-by-side "Shared Context" vs. "Hooks" with pros/cons
- Phase separation: tutorial physically separates units to demonstrate the difference
- Choice moment: explicit binary choice with no wrong answer — both paths beatable

---

### Journey: Tomoko, 42, Factorio Veteran (1200+ hours)

**Context:** Mission 8 (full system, factory vs. factory). Tomoko has been min-maxing her army composition. She's discovered that mixed shared/private buffer architectures let her build specialized information tiers. She's designing a three-tier architecture using Model E (hierarchical shared memory).

**Minute 0:00 — The Architecture Blueprint**
Tomoko's Plan screen shows her army: 3 squads of 2 (Scout+Striker each), 1 Relay platoon hub, 1 Command army hub. She opens the hierarchy editor — a nested tree view showing:
```
ARMY POOL (18 slots, 2-tick latency) — managed by COMMAND-1
├── PLATOON ALPHA (10 slots, 1-tick latency) — managed by RELAY-1
│   ├── SQUAD-1: Scout-1 + Striker-1 (shared: 11 slots, instant)
│   └── SQUAD-2: Scout-2 + Striker-2 (shared: 11 slots, instant)
└── PLATOON BRAVO (10 slots, 1-tick latency) — managed by RELAY-2
    └── SQUAD-3: Scout-3 + Striker-3 (shared: 11 slots, instant)
```

**Minute 1:00 — Configuring Promotion Rules**
Tomoko clicks RELAY-1 and configures its "promote" skill: "IF squad-pool entry is tagged HIGH-PRIORITY THEN copy to platoon pool." She clicks COMMAND-1: "IF platoon-pool entry is tagged STRATEGIC THEN copy to army pool." Information flows upward: squad → platoon → army. Each promotion adds 1 tick of latency but makes the information available to more units.

She then configures demotion: COMMAND-1's "broadcast" pushes army-pool entries tagged ORDERS down to all platoon pools. RELAY-1 pushes platoon-pool entries tagged TACTICAL down to all squad pools. Orders flow downward. Intel flows upward. The hierarchy is a designed communication structure — not just a grouping, but a pipeline.

**Minute 3:00 — The Stress Test**
Tomoko hits EXECUTE. Tick 4: Scout-1 spots 3 enemies approaching from the north. Three teal bars appear in SQUAD-1's shared pool. Striker-1 reacts instantly (zero-latency squad sharing). Scout-1's hook tags the observation HIGH-PRIORITY. Tick 5: RELAY-1's promote skill copies the threat to PLATOON ALPHA's pool. Scout-2 and Striker-2 in SQUAD-2 now see the threat (1-tick delay from platoon pool). Tick 6: RELAY-1 tags the platoon entry STRATEGIC. Tick 7: COMMAND-1 promotes to army pool. PLATOON BRAVO (SQUAD-3) now sees the northern threat — 3 ticks after the Scout first spotted it.

Tomoko watches the information cascade ripple through her hierarchy: instant at squad level, 1 tick at platoon, 3 ticks at army. She mutters "that's exactly how corporate communication works."

**Minute 5:00 — The Enemy Targets the Hub**
Tick 15: An enemy Specialist hacks RELAY-1. The platoon pool goes dark — all 10 entries lost. SQUAD-1 and SQUAD-2 still have their local shared pools (those are intact) but can no longer communicate with each other or with the army pool. They're islands. COMMAND-1 still has the army pool with stale data from before the hack. Tomoko watches her coordinated northern defense collapse into two independent squads making local decisions with no strategic context. The enemy pushes through the gap between the now-uncoordinated squads.

**Minute 7:00 — The Redesign**
In the Inspector, Tomoko identifies the single point of failure: RELAY-1. She redesigns: adds a second Relay (RELAY-1B) as a backup platoon hub with a mirrored pool. She configures a hook between the two Relays: if one goes dark, the other takes over. Her hierarchy now has redundancy. Cost: one extra Relay (5 minerals + 2 energy/tick). Worth it for resilience.

She also notices that SQUAD-3 received the northern threat 3 ticks late via the army pool. She adds a direct hook from RELAY-1 to RELAY-2 for HIGH-PRIORITY entries — bypassing the army pool for urgent threats. Now critical intel reaches PLATOON BRAVO in 2 ticks instead of 3, at the cost of one hook slot on each Relay.

**Minute 9:00 — The Satisfaction**
Third run. The enemy targets RELAY-1 again. RELAY-1B seamlessly takes over. The platoon pool blinks out for 1 tick then reappears under the backup Relay's management. The squads barely notice. Tomoko pumps her fist. She's designed a **fault-tolerant information architecture** — and the game rewarded her for it. This is the Factorio feeling: building systems that handle failure gracefully.

**UI Annotations:**
- Hierarchy editor: nested tree view with capacity/latency annotations per tier
- Promote/demote skills: drag-and-drop priority tagging in skill config panel
- Information cascade: colored pulses flowing through hierarchy lines during Sealed Watch
- Hub failure: pool panel flickers, goes dark, connected units' awareness bars dim
- Redundancy: backup hub activates with a brief golden flash, pool reappears

---

## Strengths

1. **Zero-latency intra-group awareness** — the main selling point. Squads that share a pool act as a single organism. This creates the "smart autonomous systems" feeling the game spec demands.
2. **Architectural vulnerability as gameplay** — shared pools create meaningful targets. "Destroy the hub" or "overload the squad" become enemy strategies the player must defend against.
3. **Natural complexity scaling** — beginners use one big squad (simple). Veterans build hierarchical tiered architectures (complex). The mechanic scales without needing separate systems.
4. **Teaches real distributed systems concepts** — shared memory, contention, single points of failure, redundancy, hierarchical caching. The vocabulary transfers directly to real engineering.
5. **Reduces hook wiring for local communication** — frees hook slots for inter-group bridges, simplifying the most common case (nearby units sharing intel) while keeping hooks for the hard case (long-range coordination).

## Weaknesses

1. **Contention complexity** — shared buffers introduce write conflicts, eviction cascades affecting multiple units, and hard-to-predict overload scenarios. Beginners may find it harder to debug than private buffers.
2. **Reduces hook/channel importance** — if squads share pools automatically, the hook system (a core locked mechanic) becomes less central. The game risks making hooks feel vestigial for intra-group communication.
3. **Catastrophic failure mode** — squad-level stun from shared overload is dramatic but potentially frustrating. A single noise bomb wiping an entire squad feels more like "bullshit" than "I should have designed better" — especially for new players.
4. **UI complexity for hierarchical models** — Model E (tiered) requires visualizing multiple nested pools with different latencies and capacities. The hierarchy editor could become its own mini-game, distracting from the battlefield.
5. **Balance challenge** — if zero-latency sharing is too strong, every player uses it and hooks become irrelevant. If the pooling tax is too harsh, nobody uses it. Finding the right balance requires extensive playtesting.

---

## The TikTok Clip

A 4-unit squad moves in tight formation across the isometric battlefield. The shared buffer panel floats between them, glowing cool blue. A Scout at the front spots an enemy — a teal bar zips into the panel. In the same tick, the Striker at the rear pivots and charges toward the threat. No delay. No signal. They just *know*. The shared panel pulses cyan. Then the enemy spawns a noise bomb — the panel cracks, all four units jitter simultaneously, lightning-bolt fractures across the shared pool. One by one they recover, the panel seals, and they resume their synchronized dance. Caption: "When your squad shares a brain, everything is faster — until the brain breaks."

---

## Discovered Aspects

- **2.05a** — Shared buffer pooling tax calibration: what's the right capacity reduction coefficient (0.7? 0.8? 0.9?) and should it scale with squad size?
- **2.05b** — Shared buffer write conflict resolution: when two units write to the shared pool on the same tick, who goes first? Deterministic ordering vs. priority-based vs. random?
- **2.05c** — Enemy-targeted shared buffer attacks: noise bombs, hack-the-pool, poison-the-cache — offensive tactics specifically designed to exploit shared memory vulnerabilities
- **2.05d** — Shared buffer + categorized buffer interaction: can a shared pool use typed compartments (Model A × 2.04)? Does that create too many configuration knobs?
- **2.05e** — Stigmergy-only variant (Model F as primary coordination): a game mode or mission where hooks are disabled and units can ONLY communicate through tile marks — pure environmental coordination
