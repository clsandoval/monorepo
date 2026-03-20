# 2.05d — Shared Buffer + Categorized Buffer Interaction

**Aspect:** 2.05d — Shared buffer + categorized buffer interaction
**Wave:** 2 (Core Mechanic Variations)
**Category:** core-mechanic
**Parents:** 2.05 — Shared buffer, 2.04 — Categorized buffer

---

## The Design Question

The shared buffer (2.05) pools multiple units' memory into a collective resource. The categorized buffer (2.04) partitions memory into typed compartments (THREAT, POSITION, TERRAIN, COMMS). What happens when you combine them? Can a shared pool have typed compartments? Does a 20-slot collective pool get divided into 5 THREAT / 5 POSITION / 5 TERRAIN / 5 COMMS? Who decides the partition sizes — the player globally, or does each member's preference influence the collective structure?

The combination creates a **shared filing cabinet** — a collective memory organized into labeled drawers, where multiple units read from and write to the same organized structure. This is the Slack workspace with dedicated channels: #threats, #positions, #terrain, #comms. Each unit contributes to and reads from whichever channels are relevant to its role. The Scout posts primarily to #threats and #positions. The Relay posts to #comms. The Striker reads from #threats. The organizational structure IS the information architecture.

The design risk: **too many knobs.** Shared buffer configuration already involves pool capacity, membership, write priority, eviction policy. Adding categorized compartments introduces partition sizes, per-compartment eviction, overflow rules, per-member compartment access control. The configuration surface could balloon from "manageable workbench panel" to "database schema design tool." The question isn't whether the combination is mechanically interesting — it obviously is — but whether it can be made tractable for a player configuring agents in a game, not a DBA tuning a production database.

---

## Four Combination Models

### Model X1 — "The Shared Filing Cabinet" (Global Compartments)

The shared pool has globally-defined compartments, identical to a single unit's categorized buffer but scaled up. The player sets compartment sizes at pool creation time. All members read from and write to the same compartments.

**Mechanical rules:**
- Shared pool capacity = sum of members × pooling coefficient (e.g., 20 slots for a 3-unit squad)
- Player divides 20 slots into compartments: e.g., 6 THREAT / 4 POSITION / 4 TERRAIN / 6 COMMS
- All members' THREAT observations go into the shared THREAT compartment
- All members' COMMS hook messages go into the shared COMMS compartment
- Each compartment has its own FIFO eviction (oldest THREAT evicted when THREAT is full; COMMS overflow doesn't touch THREAT slots)
- Compartment boundaries follow whatever sub-model the player has unlocked (Hard Walls, Overflow Queue, Soft Walls, Priority Cascade — see 2.04)

**Configuration surface:** Pool membership + 4 compartment sizes (constrained to sum to pool capacity) + per-compartment eviction policy + compartment boundary model. Six configuration decisions. Manageable if the compartment-size UI is a simple drag-divider interface (same as individual categorized buffers, just larger scale).

**The "shared filing cabinet" visual:** The pool overlay during sealed watch shows a horizontal bar divided into colored segments — red (THREAT), blue (POSITION), green (TERRAIN), cyan (COMMS). Each segment fills from left to right as entries arrive. The bar looks like a collective version of the individual context bar, but wider and floating above the squad formation. When one compartment overflows while others have space, the overflow compartment flashes amber while the underutilized compartments show visible empty space — the "wasted drawer" visual that teaches reallocation.

### Model X2 — "The Subscription" (Per-Member Compartment Access)

The shared pool has global compartments, but each member unit subscribes to specific compartments. A Scout might write to THREAT and POSITION but only read from COMMS. A Striker reads from THREAT but never writes. Subscription controls create a role-based access model.

**Mechanical rules:**
- Global compartments defined as in X1
- Each member has a **subscription profile**: which compartments they READ from, which they WRITE to
- Configurable per-member in the Plan phase via a matrix: rows = members, columns = compartments, cells = R (read), W (write), RW (both), or — (no access)
- A Scout configured as W:THREAT, W:POSITION, R:COMMS only writes observations to THREAT and POSITION, and only reads hook messages from COMMS. It never sees TERRAIN data and never writes COMMS.
- The subscription model reduces noise: units only see data relevant to their role
- But it can create information silos: if the Striker only reads THREAT and a critical ORDER entry in COMMS says "retreat," the Striker never sees it

**Configuration surface:** Pool membership + compartment sizes + per-member subscription matrix (N members × 4 compartments × 3 access modes = 12N configuration cells for a 3-unit squad). This is 36 cells for 3 members. The UI needs careful design to avoid overwhelming the player.

**The matrix UI:** A small grid in the pool config panel. Rows: unit portraits. Columns: compartment type icons (skull for THREAT, compass for POSITION, tree for TERRAIN, antenna for COMMS). Each cell shows a badge: green "RW" (full access), blue "R" (read-only), orange "W" (write-only), or grey "—" (no access). Click to cycle through modes. Default: all RW (identical to X1). The player narrows access as they learn which units need which data. A preset button: "Role Template" auto-configures Scouts to W:THREAT/W:POSITION/R:COMMS, Strikers to R:THREAT/R:COMMS, Relays to RW:COMMS/R:all-others.

### Model X3 — "The Curator" (Per-Compartment Write Authority)

Instead of general subscriptions, each compartment has a designated **curator** — one unit with exclusive write authority. Other units can read but not write. The curator is responsible for what enters their compartment.

**Mechanical rules:**
- Global compartments defined as in X1
- Each compartment has exactly one curator (a unit designated as its exclusive writer)
- All other pool members can read from any compartment but cannot write to curated compartments
- The curator decides (via its rules and skills) what to write. A Scout curating THREAT writes its own observations. A Relay curating COMMS processes hook messages and writes filtered summaries.
- Non-curated compartments (if any) are open-write (any member can contribute)
- If the curator is killed, the compartment becomes read-only (frozen in its last state) or open-write (configurable)

**Why this model exists:** Eliminates write conflicts entirely within curated compartments. Only one unit writes to THREAT, so there's no ordering question. The Scout IS the THREAT authority. The Relay IS the COMMS authority. This maps to the microservices pattern: each service owns its own data store. No shared writes, no conflicts, clear ownership.

**Configuration surface:** Pool membership + compartment sizes + curator assignment per compartment (dropdown of member units). Four configuration decisions beyond the base pool. Simpler than X2's full matrix.

### Model X4 — "The Graduated Knobs" (Progressive Complexity)

Start with X1 (global compartments, simple), unlock X2 (subscriptions) at Mission 8, offer X3 (curators) as a Gauntlet-level optimization. The player never sees more than their current complexity tier.

**Mechanical rules:**
- Mission 6-7: X1 only. Shared pools have global compartments. All members read/write all compartments. The configuration is: compartment sizes + eviction policy. Two decisions beyond basic pool setup.
- Mission 8-9: X2 unlocked via boot log ("Your subsystems can now specialize their attention within the collective memory. Not every voice needs every channel."). The subscription matrix appears, initially defaulting to all-RW. Players who ignore it get X1 behavior. Players who tune it get role-based access.
- Mission 10/Gauntlet: X3 unlocked. Curator assignment becomes available. Expert players who want to eliminate write conflicts can designate authorities per compartment.

**Why progressive:** The combination of shared + categorized is genuinely complex. Dumping all three models (X1 + X2 + X3) on a player at Mission 6 would be overwhelming. The graduated approach respects the locked campaign's complexity ramp and teaches one concept per mission phase. X1 is "shared pool with organization." X2 is "who sees what." X3 is "who owns what." Each concept builds on the last.

---

## Player Journeys

### Journey: Mei-Lin, 24, CS Student

**Context:** Mission 7. Mei-Lin has been using shared pools (uncategorized) since Mission 6. She just unlocked categorized buffers for individual units. The game now offers categorized shared pools (X1 — global compartments). She has a 3-unit squad: Scout "Vanguard," Relay "Central," Striker "Apex."

**Minute 0:00 — The Disorganized Pool**
Mei-Lin opens the shared pool config. The pool overlay shows 18 slots (unpartitioned) — a jumble of colored entries: red THREAT, blue POSITION, cyan COMMS, green TERRAIN, all mixed together. She's been having problems: the Striker's rules can't find THREAT data quickly because it's buried among TERRAIN observations and COMMS forwards. The Striker occasionally misses threats because its rule evaluates the first matching entry in the pool, and by the time it reaches a THREAT entry, it's already chosen a low-priority TERRAIN response. She hovers over the pool config and sees a new button: "Organize Pool" with a small grid icon. She clicks.

**Minute 0:20 — The Partition Interface**
A horizontal bar appears, representing 18 slots. Four colored sections are suggested by default: 5 THREAT (red) / 4 POSITION (blue) / 3 TERRAIN (green) / 6 COMMS (cyan). Drag handles between sections — small diamond-shaped grips. She grabs the THREAT-POSITION boundary and drags right, expanding THREAT to 7 and shrinking POSITION to 2. She drags the TERRAIN-COMMS boundary left, expanding COMMS to 7 and shrinking TERRAIN to 2. Her reasoning: "Threats and communications matter most. Position and terrain are nice-to-have." The bar now reads: 7 THREAT / 2 POSITION / 2 TERRAIN / 7 COMMS. A small warning icon appears on the POSITION section: "Low allocation: units may miss spatial data." She accepts the warning.

**Minute 0:45 — The Organized Battle**
EXECUTE. Sealed watch. The pool overlay now shows four distinct colored bands instead of a jumbled mix. THREAT entries (red) fill from left to right in their dedicated section. COMMS entries (cyan) fill their section independently. Tick 5: the Scout spots 3 enemies and 2 terrain features. The 3 THREAT entries slide into the red band (now 3/7 full). The 2 TERRAIN entries hit the green band — but it only has 2 slots, so both fill it instantly. A new terrain observation arrives on tick 6: the green band flashes amber briefly as the oldest terrain entry is evicted to make room. Meanwhile, the red band has 4 empty slots. The "wasted space" is visible — red band is half empty while green band is overflowing.

Mei-Lin watches the Striker's behavior change. Previously, it sometimes chose terrain-based responses over threat responses because terrain entries were closer to the "top" of the mixed pool. Now, the Striker's rule "IF THREAT in buffer THEN engage" specifically reads from the THREAT compartment. It finds threat data immediately, every tick, because THREAT data is separated from noise. The Striker engages three enemies in succession — clean, decisive, no hesitation. Mei-Lin smiles: "It's like putting files in the right folders instead of dumping everything on the desktop."

**Minute 1:30 — The Allocation Lesson**
Tick 12: two enemies appear from the south. The Scout turns to observe. New POSITION data about the southern approach needs to enter the pool — but POSITION has only 2 slots, both occupied by stale northern coordinates. The new southern positions evict the old northern ones. The Relay, reading POSITION to update its routing, suddenly sees coordinates flip from north to south. Its route calculation stutters — it was mid-way through a northern relay chain and the position data it relied on just vanished. The Relay sends the Striker north based on stale hook data, while the real threat is south. A near-miss — the Striker arrives north, finds nothing, the southern enemies advance. Mei-Lin realizes: "2 POSITION slots isn't enough. I need the pool to remember both north AND south simultaneously." Back to Plan. She adjusts: 6 THREAT / 4 POSITION / 2 TERRAIN / 6 COMMS. The extra POSITION slots let the pool hold multiple directional references concurrently. On re-execution, the Relay maintains both northern and southern awareness.

**UI Annotations:**
- **Partition bar**: Horizontal strip (full width of pool config panel), divided into colored sections. Drag handles (8px diamond grips) between sections, gold highlight on hover. Magnetic snap at integer slot values. Section labels showing slot count (e.g., "7" in the red section).
- **Warning icons**: Small amber triangle with "!" on sections below 3 slots. Tooltip: "Low allocation: units may miss [type] data."
- **Sealed watch pool overlay**: Four colored horizontal bands, each filling independently from left to right. Empty slots rendered as faint dashed outlines within each band. Overflowing compartment flashes amber.

---

### Journey: Dr. Amara, 41, DevOps Lead

**Context:** Mission 9. Amara has unlocked X2 (subscription model). She manages a 5-unit squad with a 30-slot shared categorized pool. She's about to discover that access control prevents information overload.

**Minute 0:00 — The Noisy Pool Problem**
Amara's 5-unit squad (2 Scouts, Relay, Specialist, Command) shares a 30-slot pool partitioned: 8 THREAT / 6 POSITION / 4 TERRAIN / 8 COMMS / 4 ORDER. All members have full RW access to all compartments (default). The problem: both Scouts write to THREAT simultaneously (write conflict — addressed by 2.05b), the Relay writes COMMS forwards that the Scouts never read, and the Command writes ORDER entries that only the Striker and Relay need. Every unit's rules evaluate against ALL compartments, meaning the Command unit — with its 14-slot individual evaluation capacity — is processing 30 slots of shared data every tick. Its rule evaluation is slow (the engine processes all matching entries sequentially), and by the time it reaches the relevant ORDER compartment, 22 entries from THREAT/POSITION/TERRAIN/COMMS have been evaluated and dismissed. It's like a CEO reading every email in the company before getting to the executive briefing.

**Minute 0:30 — The Subscription Matrix**
Amara opens the pool config. Below the partition bar, a new panel has appeared: "Access Control." A grid: 5 rows (unit portraits), 5 columns (compartment type icons). All cells show green "RW." She starts configuring:

| Unit | THREAT | POSITION | TERRAIN | COMMS | ORDER |
|------|--------|----------|---------|-------|-------|
| Scout-A | **W** | **W** | W | R | R |
| Scout-B | **W** | **W** | W | R | R |
| Relay | R | — | — | **RW** | R |
| Specialist | R | R | — | R | R |
| Command | R | R | — | R | **RW** |

She clicks each cell to cycle: RW → R → W → — → RW. Scouts write observations (THREAT, POSITION, TERRAIN) but only read COMMS and ORDER (they need to follow orders and hear messages but shouldn't write to those compartments). The Relay is the communications authority (RW on COMMS, read-only on THREAT for forwarding decisions). The Command owns ORDER (RW) and reads everything else. The Specialist reads broadly but writes nothing to the shared pool — it has its own private buffer for hack/extract operations.

**Minute 1:00 — The Clean Architecture**
EXECUTE. The pool overlay now shows different units' contributions landing in different compartments. Scout-A's THREAT entries slide into the red band from the left (a small "A" icon on each). Scout-B's from the right (small "B" icon). They never collide in COMMS or ORDER — those compartments only accept entries from their designated writers. The Command unit's rule evaluation is dramatically faster: instead of scanning all 30 slots, it evaluates only the compartments it reads from — THREAT (8) + POSITION (6) + COMMS (8) + ORDER (4) = 26 slots. But more importantly, the ORDER compartment is clean: only the Command's own entries, no Scout observations or Relay forwards cluttering the decision space.

The Relay processes COMMS efficiently: its rules evaluate only its read compartments, and it writes compressed summaries back to COMMS. The COMMS compartment becomes a clean, curated communication channel — not a dumping ground for raw data.

Amara watches the sealed watch with satisfaction. Units respond faster (fewer irrelevant entries to evaluate), THREAT data is pure (only Scout observations, no noise), and ORDER data is authoritative (only Command writes). She recognizes the pattern from work: "This is RBAC for robot brains. Role-based access control. Each unit sees and writes only what its role requires."

**Minute 1:45 — The Unintended Silo**
But there's a problem. On tick 14, the Specialist detects an enemy Specialist attempting to hack the pool (Mirror attack — 2.05c). The Specialist's "extract" skill identifies the intrusion. It generates a STATUS entry: "Pool intrusion detected at F5." But the Specialist has no write access to any shared compartment — its entire row is read-only. The STATUS entry has nowhere to go. It sits in the Specialist's private buffer, visible only to the Specialist. The Command unit, which should respond to intrusion alerts, never sees it. The enemy Specialist successfully extracts 3 entries undetected.

Amara discovers this in the Inspector. She traces the Specialist's STATUS entry: generated at tick 14, never written to shared pool (access denied — no W permission). She adds a targeted exception: Specialist gets W access to a new STATUS compartment (she carves 2 slots from TERRAIN, creating a 5th compartment). Now the Specialist can report intrusions. She's learned that over-restricting write access creates blind spots — the same lesson as over-scoping microservice permissions in production.

**UI Annotations:**
- **Access control matrix**: 5×5 grid below the partition bar. Each cell 48×48px. Unit portrait in row header. Compartment icon in column header. Cell shows colored badge: green "RW", blue "R", orange "W", grey "—". Click to cycle. Hover preview: "Scout-A can write to THREAT but cannot read from THREAT" (for W-only cells).
- **Compartment source icons**: During sealed watch, entries in the pool show a tiny unit icon (8px) in their lower-right corner indicating which unit wrote them. Only visible when zoomed in (hover) or in Inspector.

---

### Journey: Tomás, 16, Mobile Gamer

**Context:** Mission 7, first encounter with categorized shared pools. Tomás plays on his phone during his commute. He has 4 minutes before his stop. He needs to configure a shared categorized pool for a 2-unit squad (Scout + Striker) quickly.

**Minute 0:00 — The Quick Setup**
Tomás opens the pool config on his phone (portrait mode). The partition bar stretches across the screen width. Below it, a "Quick Setup" button with a magic wand icon. He taps it. Three preset options appear as cards:

1. **"Balanced"** — Equal distribution (3/3/3/3 for 12 slots). Icon: four equal colored bars.
2. **"Combat Focus"** — Heavy THREAT + COMMS, minimal POSITION/TERRAIN (5/2/1/4). Icon: red and cyan bars dominating.
3. **"Recon Focus"** — Heavy POSITION + TERRAIN, minimal THREAT/COMMS (2/4/4/2). Icon: blue and green bars dominating.

Tomás taps "Combat Focus." The partition bar snaps to the preset with a satisfying click animation. He tweaks one boundary: drags COMMS down by 1 slot, expands THREAT by 1 (6/2/1/3). Total time: 8 seconds.

**Minute 0:15 — The 4-Minute Battle**
EXECUTE. The battle runs. The pool overlay is compact on mobile — a thin horizontal bar at the top of the screen, colored sections clearly visible even at phone size. The Striker reads THREAT data cleanly, engages two enemies. The Scout's POSITION data (2 slots) flips between observed positions — tight but functional. Victory at tick 18.

**Minute 0:30 — The Quick Debrief**
Inspector on mobile: swipe-to-scrub timeline, tap-to-inspect. Tomás taps the pool bar. A card expands showing compartment utilization: THREAT peaked at 5/6 (83%), POSITION was at 2/2 (100%) for 12 of 18 ticks (constantly full — potential data loss). A suggestion appears: "POSITION was at capacity 67% of the time. Consider adding 1 slot." Tomás notes this for next time. His stop arrives. He pockets the phone. Total session: 3 minutes 45 seconds.

**UI Annotations:**
- **Mobile partition bar**: Full screen width (minus 16px padding), 48px tall. Compartment colors are bold and saturated for visibility. Drag handles are 16px circles (touch-friendly). Section labels centered in each segment.
- **Quick Setup presets**: Three horizontally-scrollable cards (160px wide × 80px tall), each showing a miniature partition bar and a name. Tap to apply with 200ms snap animation.
- **Mobile utilization suggestion**: Small amber card below the pool detail, showing "POSITION: 67% full capacity" with a "+1" button to quick-adjust.

---

## The Knob Problem — Analysis

The core risk of combining shared + categorized is configuration explosion:

| Model | Config Decisions | Player Actions in Plan Phase |
|-------|-----------------|------------------------------|
| Shared only (2.05) | Pool membership, capacity, eviction | 3 decisions |
| Categorized only (2.04) | Compartment sizes, boundary model, eviction per type | 4-6 decisions per unit |
| X1 (shared filing cabinet) | Pool membership, capacity, eviction, compartment sizes, boundary model | 5-7 decisions |
| X2 (subscription) | X1 + per-member access matrix (N × 4 cells) | 5-7 + 12N decisions |
| X3 (curator) | X1 + per-compartment curator assignment | 5-7 + 4 decisions |

**X1 is tractable.** It adds only compartment configuration to the existing shared pool setup — the same drag-divider interface used for individual categorized buffers, applied at squad scale. The cognitive leap from "organize one unit's memory" to "organize the squad's memory" is natural.

**X2 is the danger zone.** A 5-unit squad with 5 compartment types creates a 25-cell matrix. Even with presets and defaults, the matrix is intimidating. It should be strictly optional — the default (all RW) gives X1 behavior, and only players who actively want fine-grained control should encounter the matrix.

**X3 is elegant.** Four dropdown menus (one per compartment), each selecting a curator from the member list. It eliminates write conflicts within curated compartments, which is a significant simplification. The constraint (one writer per compartment) is restrictive but clear.

**Recommendation: X4 (graduated) with X1 as the default experience, X3 as the Mission 9+ optimization, and X2 as a Gauntlet-only expert tool.** Most players will use X1 and be perfectly well-served. X3 offers a clean optimization for advanced players who want to eliminate write conflicts. X2 is the database-admin-level tool for Gauntlet competitors who need maximum control.

---

## Interaction Effects with Locked Decisions

**Categorized buffer models (2.04):** The six sub-models (Hard Walls, Overflow Queue, Soft Walls, Priority Cascade, Dynamic Partitioning, Inbox) all apply directly to shared categorized pools. A shared pool with Soft Walls means THREAT data can borrow TERRAIN slots — at squad scale. A shared pool with Priority Cascade means THREAT data (highest priority) can evict TERRAIN (lowest) — across all members simultaneously. The sub-model choice has amplified consequences at shared scale.

**Write conflicts (2.05b):** Categorized compartments partially solve write conflicts. Under X3 (curator model), there are no write conflicts within curated compartments — only one unit writes. Under X2, restricting write access means fewer units compete for the same compartment. Under X1, write conflicts still exist within each compartment but are limited to data of the same type (only THREAT writers conflict in the THREAT compartment).

**Signal taxonomy (2.10):** The compartment types must align with the signal taxonomy. If the taxonomy has 8 content types (THREAT, TERRAIN, POSITION, ORDER, STATUS, RESOURCE, NOISE, UNKNOWN), the player could create up to 8 compartments. But 8 compartments in an 18-slot pool averages 2.25 slots each — too fragmented. The practical ceiling is 4-5 compartments per pool, meaning the player must group related signal types (POSITION + TERRAIN → "SPATIAL", ORDER + STATUS → "COMMAND"). This grouping decision is itself a design choice with consequences.

**One-shot-one-kill:** Compartment allocation determines survival. If the THREAT compartment is too small and a critical enemy observation is evicted, a Striker might miss an adjacent enemy and die. If the ORDER compartment is too small and a retreat order is lost, units stay in a kill zone. Compartment sizing is a life-or-death decision, not a convenience optimization.

---

## Comparable Games and Systems

**Slack (workspace channels):** The most direct analog. A shared workspace with named channels (#general, #alerts, #random). Members subscribe to channels they care about. Channel noise is isolated — a flood in #random doesn't affect #alerts. Slack's "mute channel" feature maps directly to the subscription model's "—" (no access) setting.

**Kubernetes (resource quotas + namespaces):** K8s namespaces partition cluster resources into isolated pools. Each namespace has CPU/memory quotas. Pods within a namespace compete for namespace resources but can't steal from other namespaces. Compartment sizing in X1 IS resource quota configuration.

**Factorio (logistics chests):** Logistics chests can be filtered to accept only specific item types. A "requester chest" asks for specific items from the logistics network — analogous to a unit subscribed to read from specific compartments. The filter interface (click item slots to set filter) is almost identical to the compartment access matrix.

**Redis (databases):** Redis offers 16 numbered databases within a single instance. Each database is an isolated keyspace. Selecting a database number before read/write operations is functionally identical to compartment access control. The "SELECT 0" command maps to "read from THREAT compartment."

---

## Sensory Description

**The organized pool overlay** (sealed watch): Where an uncategorized pool shows a single horizontal bar of mixed colors, the categorized pool shows distinct bands — red THREAT on the left, blue POSITION next, green TERRAIN, cyan COMMS on the right. A thin silver divider line separates each band, with a small type icon (skull, compass, tree, antenna) centered above each. Entries within each band are sorted by freshness (newest glows brighter). The overall effect is a stained-glass window — distinct colored panels telling different stories simultaneously. When one compartment fills while others are empty, the full compartment's icon pulses amber while the empty compartments show gentle dashed outlines where entries could be — the visible potential, unused.

**The subscription matrix UI**: The grid appears on a dark slate background (the workbench's panel texture). Each cell contains a small badge — green for RW (full circle), blue for R (open eye), orange for W (pen), grey for no access (empty circle). Clicking a cell plays a brief tactile click (different pitch per mode: green=highest, blue=medium, orange=low, grey=muted). Cycling through modes animates the badge morphing: circle → eye → pen → empty → circle, each transition 150ms with a subtle rotation. When the player has configured a non-default matrix (not all RW), the panel header shows a small lock icon indicating "access controls active."

**The curator assignment**: When X3 is active, each compartment's type icon in the pool overlay gains a small portrait badge — the face of the unit that curates it. The Scout's tiny portrait appears on the THREAT icon. The Relay's portrait on the COMMS icon. When the curator writes an entry, it slides in from the curator's portrait badge, as if emerging from the authority figure's approval. When a non-curator attempts to write (due to misconfiguration), the entry bounces off the compartment boundary with a dull *thock* and falls away as particles — visually and aurally rejected. In the Inspector, rejected write attempts appear as red entries with a strikethrough line.
