# 2.05b — Shared Buffer Write Conflict Resolution

**Aspect:** 2.05b — Shared buffer write conflict resolution
**Wave:** 2 (Core Mechanic Variations)
**Category:** core-mechanic
**Parent:** 2.05 — Shared buffer

---

## The Design Question

When two or more units write to the same shared buffer pool on the same tick, the deterministic engine must decide: whose data lands first? In a fixed-slot FIFO buffer, insertion order matters profoundly — the entry that arrives "last" is the freshest and survives longest before eviction, while the entry that arrives "first" is oldest and gets evicted soonest. In a 6-slot shared pool where 4 entries arrive simultaneously, the difference between "first in" and "last in" could mean the difference between a critical threat observation surviving to the next tick or being immediately evicted by a teammate's terrain scan. This is the **write conflict** — not a crash or data corruption, but a subtle ordering problem that creates winners and losers within the player's own army.

The locked deterministic engine demands a resolution rule. Every tick must resolve identically given the same starting state. The question is: what rule, how visible, and how much control does the player get?

---

## Six Resolution Models

### Model A — "The Clock" (Fixed Unit-ID Ordering)

Every unit has an immutable ID assigned at spawn (ascending integers: first spawned = lowest ID). When multiple units write to a shared pool on the same tick, writes are processed in ascending ID order. The first-spawned unit's data always enters first (and thus gets evicted first under FIFO).

**Mechanical rules:**
- Unit IDs assigned sequentially by factory spawn order (1, 2, 3...)
- On each tick, all pending writes to a shared pool are sorted by unit ID ascending
- Writes execute sequentially: unit 1's observations insert, then unit 2's, then unit 3's
- Under FIFO eviction, unit 1's data is "oldest" and evicted first; the highest-ID unit's data survives longest
- Completely deterministic, completely invisible by default

**The hidden consequence:** Production queue order determines information priority. The unit you build first always has the weakest persistence in shared memory. A Scout spawned at tick 3 loses every write conflict to a Striker spawned at tick 15. This creates an unintuitive inversion: your oldest, most experienced unit has the least durable contributions to shared knowledge.

### Model B — "The Rank" (Unit-Type Priority Ordering)

Writes are ordered by unit type, with a fixed priority hierarchy: Command > Specialist > Relay > Striker > Scout. Within the same type, ties broken by unit ID (Model A fallback).

**Mechanical rules:**
- Priority ladder: Command (5) > Specialist (4) > Relay (3) > Striker (2) > Scout (1)
- All pending writes sorted by priority descending, then unit ID ascending
- Higher-priority units' data enters last → survives longest under FIFO
- Creates a clear "chain of command" for information persistence

**The design rationale:** A Command unit's assessments should matter more than a Scout's raw observations. The type hierarchy maps to military rank — officers' reports take precedence over enlisted observations. This is legible once understood, and creates a natural reason to include high-rank units in shared pools even if their direct contribution seems redundant.

### Model C — "The Microphone" (Data-Type Priority Ordering)

Writes are ordered not by who writes, but by what type of data is being written. THREAT data always enters last (survives longest), TERRAIN data enters first (evicted soonest). The signal taxonomy (2.10) determines insertion priority.

**Mechanical rules:**
- Priority by signal type: THREAT (7) > ORDER (6) > STATUS (5) > POSITION (4) > COMMS (3) > RESOURCE (2) > TERRAIN (1) > NOISE (0)
- Writes sorted by data-type priority descending, ties broken by unit ID
- A Scout's THREAT observation enters after a Relay's TERRAIN forward, regardless of unit rank
- Threat-heavy ticks create crowded high-priority insertion; noise creates rapid low-priority churn

**The design rationale:** Information importance should determine persistence, not the identity of the messenger. A Scout spotting an adjacent enemy generates more critical data than a Command unit logging a routine status check. This model respects content over hierarchy.

### Model D — "The Shuffle" (Deterministic Pseudorandom Ordering)

A seeded PRNG, initialized from the mission seed and current tick number, determines insertion order each tick. The order varies per tick but is reproducible given the same game state.

**Mechanical rules:**
- Each tick: `order = shuffle(pending_writes, seed=mission_seed XOR tick_number)`
- Insertion order changes every tick — no unit consistently wins or loses
- Perfectly deterministic (same seed + tick = same order) but appears random to the player
- Inspector can show the ordering per tick if the player cares to look

**The design rationale:** Eliminates all systemic bias. No unit type, no spawn order, no data type gets permanent priority. Feels "fair" because variance averages out over many ticks. But creates a comprehension barrier — the player can never predict whose data will stick.

### Model E — "The Speaker's Chair" (Player-Configured Priority)

The player explicitly assigns write priority per unit when configuring the shared pool during the Plan phase. Drag units up or down a priority list. Higher-priority units' data enters last (persists longest).

**Mechanical rules:**
- Shared pool configuration includes a "Write Priority" panel
- Drag-to-reorder list of all pool members
- Top of list = highest priority = data inserted last = survives longest
- Priority is static for the entire battle (no dynamic reordering)
- Visual: numbered badges (1, 2, 3...) on unit portraits in the pool config panel

**The design rationale:** Maximum player agency. The write priority list is another lever in the information architecture toolkit. Want the Scout's observations to persist? Put it at position 1. Want the Command's orders to dominate? Command at position 1. The explicit choice surfaces the hidden complexity.

### Model F — "The Hourglass" (Round-Robin Rotating Priority)

Priority rotates each tick. On tick 1, unit A writes last (highest persistence). On tick 2, unit B writes last. On tick 3, unit C. The rotation is deterministic and visible via a small rotating indicator on the shared pool display.

**Mechanical rules:**
- Pool members assigned positions 0 through N-1
- On tick T: unit at position `(T mod N)` gets highest priority (writes last)
- Priority cascades: position `((T+1) mod N)` gets second highest, etc.
- A small hourglass icon on the shared pool display shows which unit currently has "the floor"
- Inspector shows the rotation history as a repeating color pattern

**The design rationale:** Fair over time (every unit gets equal turns at priority), predictable (the player can count ticks to know whose data will stick), and creates a subtle timing dimension — if you know your Scout gets priority on even ticks, you can design patrol routes to time critical observations accordingly.

---

## Player Journeys

### Journey: Marcus, 34, Backend Engineer

**Context:** Mission 7. Marcus has been using shared buffers (Model A — Blackboard) since Mission 6. He built a 3-unit squad (Scout "Lookout" + Relay "Switch" + Striker "Hammer") sharing a 20-slot pool. Under Model E (player-configured priority), he's about to discover that write order is the difference between winning and losing.

**Minute 0:00 — The Setup**
Marcus opens the Plan screen. The board shows Cebu's urban grid — tight corridors, lots of cover. His shared pool config panel sits on the right, showing three unit portraits stacked vertically: Lookout (Scout), Switch (Relay), Hammer (Striker). A thin numbered column reads "1, 2, 3" beside them — write priority, top to bottom. Currently: Lookout (1st), Switch (2nd), Hammer (3rd). No particular thought given to the order; he dragged them in the order he built them. The pool capacity bar at the top reads "20 slots" in cool blue. A small tooltip hovers when Marcus mouses over the priority list: "Units higher in this list keep their data longer in the shared pool."

**Minute 0:30 — The First Run**
Marcus hits EXECUTE. Sealed watch begins. The squad moves through narrow streets. Lookout patrols ahead, perception radius lighting up a 5-tile circle in translucent cyan. Two enemies appear at the edge of perception. Lookout writes THREAT observations to the shared pool — the pool bar ticks up, two new red-bordered entries appearing at the bottom of the translucent pool overlay floating above the squad. Switch simultaneously receives hook messages from another squad — COMMS entries in cyan. The pool bar jumps to 14/20. Hammer sees nothing (narrow perception) and contributes no data. On the next tick, Lookout spots two more enemies. Four entries queue up. The pool hits 18/20. Then Lookout spots a flanking group — three more THREAT entries arrive simultaneously with Switch forwarding two COMMS. Five entries for two slots. The pool overflows. The entire squad freezes — the stun animation kicks in, all three units crackling with amber sparks, the pool overlay flashing red, a harsh electronic grind sound. The flanking enemies move in. Hammer, stunned, cannot engage. Adjacent striker. One-shot kill. Hammer is gone. Then Switch. Then Lookout. Squad wiped in two ticks.

**Minute 1:15 — The Debrief**
Inspector. Marcus scrubs to the overflow tick. He clicks the shared pool to see its state. Twenty entries, ordered by insertion time. He notices: Lookout's THREAT observations are at positions 1-8 (oldest, entered first). Switch's COMMS forwards are at positions 9-16. The two entries that pushed the pool over were Switch's COMMS — routine status updates from the other squad, not urgent at all. Lookout's critical threat data had already been partially evicted to make room for Switch's lower-priority messages, because Lookout, being priority position 1, had its data inserted first. The COMMS that arrived "after" the THREAT data (due to Switch being priority 2) pushed out Lookout's earlier observations. Marcus's eyes widen. "Wait — first priority means first evicted?"

**Minute 2:00 — The Fix**
Back to Plan. Marcus drags Lookout from position 1 to position 3 — the bottom. Now Lookout's observations enter the pool LAST, meaning they're the freshest and survive longest. He drags Switch to position 1 — Relay COMMS enter first, get evicted first. The hierarchy now matches information importance: tactical observations persist, routine comms churn. He re-executes. This time, when the flood hits, Switch's old COMMS get evicted first, Lookout's THREAT data persists, Hammer reads the threat in time, engages the flanking enemy. Squad survives. Marcus grins: "It's a message queue with consumer priority. Of course."

**UI Annotations:**
- **Priority list**: Vertical stack of unit portraits, 48px each, numbered 1-3 in a narrow column. Drag handle (three horizontal lines) on the left edge of each portrait. Drop zones highlighted in gold when dragging.
- **Pool overlay**: Translucent panel floating above squad during sealed watch, showing 20 slots as horizontal stripes colored by data type. Red border on THREAT, cyan on COMMS, blue on POSITION. Entries animate in from the bottom (newest) and slide up as they age.
- **Overflow**: Pool overlay flashes red twice, entries spill out the top as scattered particles, harsh electronic grind (250ms), then stun crackling on all squad members (continuous amber sparks for 1 tick).

---

### Journey: Anika, 14, First-Time Strategy Player

**Context:** Mission 6, first encounter with shared buffers. Anika built a simple 2-unit shared pool (Scout + Striker) using the tutorial's suggestion. The game uses Model A (fixed unit-ID ordering) — the default that's invisible to new players.

**Minute 0:00 — The Invisible Problem**
Anika's Scout (ID 1, spawned first) and Striker (ID 2, spawned second) share a 12-slot pool (6+8=14, minus pooling tax = 12). She hits EXECUTE on the Ifugao rice terrace map. The Scout patrols, spots enemies, writes observations. The Striker follows, receiving the Scout's data from the shared pool. Everything works smoothly for 8 ticks — the pool comfortably holds data, the Striker reads threat positions and engages correctly. Anika thinks shared pools are easy.

**Minute 0:45 — The Confusing Failure**
Tick 9. Three enemies converge from different directions. The Scout generates 5 THREAT entries. The Striker's own narrow perception adds 2 more. Seven entries in one tick into a pool that had 8 occupied slots. Total: 15 entries, 12 capacity. Three entries must be evicted. Under FIFO, the three oldest entries go — and those are the Scout's earliest observations (entered first because Scout has ID 1). The evicted data included the position of an enemy approaching from the east. The Striker, now reading only the most recent data, sees enemies north and south but not east. It moves to engage north. The eastern enemy flanks. One-shot kill on the Striker. Anika frowns: "But the Scout SAW that enemy! Why didn't the Striker know?"

**Minute 1:30 — The Inspector Discovery**
In the Inspector, Anika clicks on the shared pool at tick 9. She sees the 12 entries, colored by type. A tooltip on each shows "Source: Scout, Age: 0 ticks" or "Source: Striker, Age: 0 ticks." She notices all the Scout's entries have lower slot numbers (entered first) and the Striker's have higher slot numbers (entered later). She scrubs to tick 10. Three entries evicted — all Scout entries. A small thought bubble appears above the pool: "Oldest entries removed. Scout's data entered before Striker's data this tick." Anika doesn't fully understand the implications yet, but she remembers the order matters. She'll encounter the same pattern again in Mission 7, where the boot log names it: "When voices speak at the same time, the system hears them in order. The first voice heard is the first forgotten."

**Minute 2:15 — The Partial Understanding**
Anika retries. She can't change write priority (it's Model A, invisible). But she adjusts: she gives the Scout the "compress" skill, which reduces its raw observations into denser, higher-priority entries. Fewer entries from the Scout means less data competing for pool space. The compressed threat summary, though still entered first, contains more information per slot. The eastern enemy's position is captured in the compressed entry. The Striker reads it. Engagement succeeds. Anika learns that data quality (compression) can compensate for ordering disadvantage — an architectural lesson she'll formalize later when player-configured priority unlocks.

**UI Annotations:**
- **Shared pool in Inspector**: Click the pool icon (translucent rectangle above squad) to expand a detail panel showing all slots numbered 1-12, each with a colored stripe (data type), source icon (Scout eye or Striker sword), and age counter. Evicted slots flash amber and dissolve upward.
- **Boot log hint**: Mission 7 boot log contains the "first voice heard" passage, appearing as terminal text scrolling upward in the narrative intro. Green monospace font on dark background.

---

### Journey: Dr. Priya, 42, Distributed Systems Researcher

**Context:** Mission 9. Priya has been playing since launch, deeply understands all buffer models. She's experimenting with Model F (round-robin rotating priority) in a 4-unit shared pool: Scout-A, Scout-B, Relay, Striker. She wants to exploit the rotation for tactical timing.

**Minute 0:00 — The Timing Architecture**
Plan screen. Priya examines the shared pool config. A circular diagram shows four unit icons arranged in a ring with a gold arrow pointing at one — the current "speaker." Below it, a table: "Tick 1: Scout-A has the floor. Tick 2: Scout-B. Tick 3: Relay. Tick 4: Striker. Tick 5: Scout-A again..." Priya designs her Scout patrol routes to align with their priority ticks. Scout-A patrols the northern corridor and is configured to use its highest-value observations on even ticks (when it doesn't have the floor, its data is less persistent — so it should observe less critical areas on those ticks). Scout-B covers the south with the inverse pattern. The Relay processes and forwards on tick 3 (its floor tick), when its compressed signals will persist longest. The Striker acts on tick 4, when its engagement decisions — informed by the freshest data in the pool — get maximum persistence for post-action status updates.

**Minute 0:45 — The Rotation in Action**
Sealed watch. The hourglass icon on the shared pool overlay shows a tiny rotating arrow, cycling through four colored segments (cyan for Scout-A, teal for Scout-B, purple for Relay, red for Striker). On tick 1, the arrow points to cyan — Scout-A has the floor. Scout-A's patrol hits the northern choke point, spots two enemies. Its THREAT data enters the pool last, survives. Scout-B's concurrent observation from the south enters first, vulnerable to eviction. On tick 2, the arrow rotates to teal — Scout-B's turn. Scout-B's data now persists; Scout-A's new entries enter first. The rhythm is visible as a subtle color pulse in the pool overlay — whichever unit has the floor, their data entries glow slightly brighter.

**Minute 1:15 — The Timing Exploit**
Tick 7. Scout-A has the floor again (tick 7 mod 4 = 3... wait, Priya counts: tick 1=Scout-A, tick 5=Scout-A, tick 9=Scout-A — every 4 ticks). She planned Scout-A's patrol to reach the critical forward observation post on tick 9, when it has the floor. Sure enough, tick 9: Scout-A reaches the choke, spots the enemy commander, writes a high-value THREAT entry that persists because it entered last. The Striker, reading the pool on tick 10, finds the commander's position in slot 12 (freshest data), engages successfully. Priya nods: "I synchronized the observation rhythm with the write rotation. It's a phase-locked loop."

**Minute 2:00 — The Anti-Pattern**
But Priya's rotation-aware design has a fragility. On tick 13, an enemy noise bomb floods the shared pool with garbage data. The rotation says Relay has the floor — but the Relay had nothing important to write this tick. The noise bomb entries, coming from external hook injection, bypass the rotation entirely (they're not "writes from pool members" — they're external injections). All four units' legitimate data gets buried under noise. Priya realizes: round-robin protects against internal contention but not against external attacks. She needs the counter-intelligence firewall (2.16) to filter noise at the pool boundary, not just the rotation to order legitimate writes.

**UI Annotations:**
- **Rotation indicator**: Small circular diagram (32px diameter) attached to the shared pool overlay. Four colored segments, gold arrow rotating clockwise one segment per tick. Tooltip on hover: "Tick 9: Scout-A has priority (writes persist longest)."
- **Priority glow**: During sealed watch, entries from the floor-holding unit have a subtle gold border (1px, 30% opacity) distinguishing them from other entries.
- **Noise bomb visual**: External injections appear as glitching, static-filled entries (TV snow texture) with no source icon — just a red "?" marker.

---

## Strengths and Weaknesses

| Dimension | Model A (Clock) | Model B (Rank) | Model C (Microphone) | Model D (Shuffle) | Model E (Speaker's Chair) | Model F (Hourglass) |
|-----------|----------------|----------------|---------------------|-------------------|--------------------------|---------------------|
| Determinism | Perfect | Perfect | Perfect | Perfect (seeded) | Perfect | Perfect |
| Player legibility | Low (hidden) | Medium (intuitive hierarchy) | Medium (content-aware) | Very low (appears random) | High (explicit) | Medium-high (visible rotation) |
| Player agency | Zero | Zero | Zero | Zero | Maximum | Indirect (timing) |
| Cognitive load | Zero (invisible) | Low | Medium (learn type priority) | Zero (ignore it) | Medium (another config) | Low-medium |
| Exploit potential | Spawn-order gaming | Type-composition gaming | Data-type gaming | None (fair) | Intentional | Timing optimization |
| Teaching value | Low (too hidden) | Medium (hierarchy concept) | High (content > identity) | Low (noise) | Highest (explicit architecture) | High (phase-locking, scheduling) |
| One-more-knob risk | None | None | None | None | High (config fatigue) | Low |

**Strengths of player-configured priority (Model E):**
- Makes the hidden complexity visible and actionable
- Teaches message queue consumer priority — a directly transferable engineering concept
- Creates a distinct design decision ("who matters most in this squad?") that reinforces the information architecture theme
- Pairs naturally with the categorized buffer (2.04) — priority ordering by content type when Model C is layered on top

**Weaknesses of player-configured priority (Model E):**
- Another configuration knob in an already knob-heavy game
- Static priority can't adapt to changing battle conditions (a Scout's data might be critical early and irrelevant late)
- Optimal priority is often obvious (Scout > Relay > Striker for shared awareness), reducing the interesting decision space

**Recommended hybrid: Model A default + Model E unlock at Mission 8.**
Early missions use invisible Clock ordering (Model A), which is simple and creates organic learning moments through failure. Mission 8's boot log introduces write priority as a configurable parameter, unlocking Model E. Advanced players in the Gauntlet can further unlock Model F (round-robin) as a Doctrine modifier. Model C (data-type priority) could be a filter layer on top of any other model — signal type breaks ties within whatever primary ordering is active.

---

## Interaction Effects with Locked Decisions

**8x8 grid:** Small board means squads cluster in tight 2-3 tile areas. Write conflicts happen nearly every tick because shared pool members are always close enough to generate simultaneous observations of the same enemies. The small board amplifies the write conflict problem — larger boards would space units out and reduce simultaneous writes.

**Tick-based resolution:** All writes are truly simultaneous (no sub-tick ordering from movement speed or initiative). The resolution model IS the only ordering mechanism. In a real-time game, write conflicts would be resolved by actual timing; in a tick-based game, the resolution model is a design choice, not a physical consequence.

**One-shot-one-kill:** Write priority can be life-or-death. If a critical threat observation is evicted due to write ordering, a Striker might not see an adjacent enemy and die instantly. The lethality of the game makes write conflicts high-stakes — not a subtle optimization but a potential squad wipe trigger.

**Signal latency (1 tick per hop):** Shared buffers bypass signal latency (zero-latency intra-squad), which makes write ordering the primary bottleneck. Without latency as a pacing mechanism, write ordering becomes the main source of information delay and loss within shared pools.

**EM emissions:** Write conflicts are silent — they don't generate additional EM noise. But the shared pool itself may emit noise proportional to its size (per 2.05), and more write contention means more data churn, which could be detected as elevated EM activity.

---

## Comparable Games and Systems

**Database write conflicts (real-world):** PostgreSQL uses MVCC (multi-version concurrency control) where simultaneous writes create version chains. Redis uses single-threaded execution for guaranteed ordering. Kafka uses partition-level ordering with configurable consumer group priority. Robot Uprising's shared buffer is closest to a single-partition Kafka topic where the producer ordering determines consumer visibility.

**Screeps (Memory object):** Screeps' global Memory object is written by all creeps in tick order (spawn order). Community strategy: structure spawn order to prioritize important creeps' memory writes. Direct precedent for Model A.

**Factorio (inserter priority):** When multiple inserters target the same chest, insertion order follows entity ID (creation order). Factorio players learn to build inserters in specific orders to control priority. Identical pattern to Model A, similarly hidden from new players.

**Into the Breach (simultaneous damage):** When multiple attacks hit the same tick, damage is resolved in grid-order (left-to-right, top-to-bottom). Players exploit this by positioning units to control resolution order. The spatial ordering is more visible than ID-based ordering.

**TIS-100 (port communication):** When multiple nodes write to the same port, the earliest-numbered node wins. Deadlocks possible. Players learn node addressing as a fundamental constraint. The "whose write lands" question is central to many TIS-100 puzzles.

---

## Sensory Description

**The moment of conflict** (visible under Model E or F): When two units write to the shared pool simultaneously, their data entries appear as colored packets sliding toward the pool from opposite directions. They meet at the pool boundary. The higher-priority unit's packet slides in smoothly, landing with a soft crystalline *tink*. The lower-priority unit's packet hesitates for a fraction of a second (50ms pause), then slides in after, landing with a softer, slightly muffled version of the same sound — audibly "behind" the first. Under Model F, the floor-holding unit's packet has a faint gold trail as it enters.

**The eviction cascade**: When the pool is near capacity and conflicting writes arrive, the oldest entries (often the lower-priority unit's recent contributions) begin to fade — their colored stripes in the pool overlay desaturate over 200ms, then slide upward and dissolve into faint particles. A descending two-note chime (major second interval, piano timbre) marks each eviction. If three or more entries evict in rapid succession, the individual chimes merge into a descending glissando — the sound of knowledge draining away.

**The Inspector write-order view**: In the Inspector, the player can toggle a "Write Order" overlay on the shared pool timeline. Each tick shows incoming writes as stacked arrows, color-coded by source unit, with a thin gold line marking the insertion boundary. Arrows above the line entered "later" (higher priority, persist longer). Arrows below entered "earlier" (lower priority, evicted sooner). The gold line shifts position across ticks under Model F, creating a visible sine-wave pattern in the timeline.
