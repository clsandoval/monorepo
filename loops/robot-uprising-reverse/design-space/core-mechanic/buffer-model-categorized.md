# 2.04 — Categorized Buffer: Separate Pools for Different Info Types

## The Option

Instead of a single unified context window where all information competes for the same slots, the **categorized buffer** partitions each unit's working memory into **typed sub-pools** — separate compartments for different kinds of information. A Scout with 6 total slots might have 2 THREAT slots, 2 POSITION slots, 1 TERRAIN slot, and 1 COMMS slot. Threat data can only evict other threat data. A flood of terrain observations can never push out a critical enemy sighting.

This is the **filing cabinet model** — information sorted into labeled drawers rather than piled on a single desk. The player's job shifts from "how big is the buffer?" to "how should the buffer be organized?" — a fundamentally different design question that foregrounds information architecture over raw capacity.

### Mechanical Specification

**Sub-pool structure:**
Each unit's total buffer capacity (Scout: 6, Striker: 8, Relay: 12, Specialist: 10, Command: 14) is divided into **named compartments**, each holding a fixed number of slots. The compartments correspond to the signal taxonomy (see 2.10 — Signal Taxonomy):

| Compartment | What fills it | Default allocation (Scout, 6 slots) |
|-------------|---------------|--------------------------------------|
| THREAT | Enemy positions, danger signals, attack warnings | 2 slots |
| POSITION | Location data, movement vectors, map coordinates | 1 slot |
| TERRAIN | Environmental observations, tile properties | 1 slot |
| COMMS | Hook messages from other units, orders, status reports | 2 slots |

**Allocation is player-configurable.** During the Plan phase, the player drags dividers between compartments to resize them. The total must equal the unit's buffer capacity. A player could allocate all 6 Scout slots to THREAT (a paranoid scout that ignores everything except danger) or split 3/3 between COMMS and POSITION (a relay-dependent scout that trusts the network over its own eyes).

**Within each compartment**, eviction follows the same FIFO rule as the fixed-slot model (2.01). The oldest THREAT entry is evicted when a new THREAT arrives and the THREAT compartment is full. But critically, a full THREAT compartment does NOT evict POSITION entries — compartment boundaries are hard walls.

**What happens when a datum's compartment is full but others have space:**
This is the core design question. Six sub-models:

**Model A — "Hard Walls":** Compartment boundaries are absolute. If THREAT is full and a new threat arrives, the oldest THREAT entry is evicted. Empty POSITION slots sit idle. No cross-compartment overflow. Simplest model. The empty slots are *visible waste* — a teaching tool. The player sees "you allocated 3 TERRAIN slots but only ever use 1" and learns to reallocate.

**Model B — "Overflow Queue":** When a compartment is full, excess data spills into a shared overflow pool (1-2 extra slots). The overflow pool uses aggressive eviction (1-tick TTL — data evicted next tick regardless). Overflow is a pressure valve, not a solution. Overflow entries are visually distinct (amber border, jittering animation). The player learns that overflow = misconfiguration.

**Model C — "Soft Walls":** Compartment sizes are *preferred* allocations, not hard limits. When THREAT is full and TERRAIN has empty slots, the new threat datum can borrow a TERRAIN slot. Borrowed slots are reclaimed (LIFO) when the lending compartment needs them. Creates a dynamic, breathing buffer where compartments expand and contract. More forgiving but harder to predict.

**Model D — "Priority Cascade":** Each compartment has a priority rank (player-configured). When ANY compartment is full, it can evict from the lowest-priority compartment. If THREAT (priority 1) is full and TERRAIN (priority 4) has entries, a THREAT datum evicts the oldest TERRAIN entry. Priority ordering is the primary design decision. Creates a food chain: high-priority information eats low-priority information.

**Model E — "Dynamic Partitioning":** No fixed allocations. Instead, the player sets *minimum guarantees* per type (e.g., "always reserve at least 1 slot for THREAT"). Remaining slots are first-come-first-served. Combines guaranteed minimums with flexible remainder. The most realistic model (mirrors OS memory management with reserved and shared pools) but the hardest to reason about.

**Model F — "The Inbox":** All incoming data enters a single intake slot (the "inbox"), then the unit's sorting skill routes it to the correct compartment. If the sorting skill isn't equipped or is overwhelmed (more data than sorting throughput), data stays in the inbox and is evicted next tick. The inbox is 1-2 slots. This model makes information triage an active skill, not a passive configuration.

### What the player physically does (Plan phase)

**The Divider Interface:**
The context window is visualized as a horizontal bar divided into colored sections. Each section represents a compartment:
- **THREAT:** Red section with ⚠ icon
- **POSITION:** Blue section with 📍 icon
- **TERRAIN:** Green section with 🌿 icon
- **COMMS:** Cyan section with 📡 icon

The player grabs the **divider handles** between sections and drags left or right to resize. Each section shows its current allocation as a number (e.g., "2/6"). As the player drags, the sections smoothly resize with a satisfying elastic snap when releasing on integer boundaries. Drag a divider all the way to collapse a compartment to 0 — that type of information will be entirely ignored (with an amber warning: "This unit will discard all TERRAIN data").

The divider handle is a **glowing pip** that brightens on hover, emits a soft click when grabbed, and leaves a brief trail when dragged. The total bar length is fixed — expanding one section always shrinks an adjacent one. The mechanical feel is a **slider bank**, like a DJ mixing board where you balance four channels.

**Preset configurations** are available as one-click templates:
- **Balanced:** Equal allocation (1-2 per type)
- **Paranoid:** Heavy THREAT, minimal everything else
- **Network Node:** Heavy COMMS, minimal perception types
- **Scout Sweep:** Heavy POSITION + TERRAIN, minimal COMMS
- **Custom:** Player's own divider positions

**The "Test Card" preview:**
When hovering over a compartment, a tooltip shows a sample datum of that type ("THREAT: Enemy Striker at D4, tick 12, urgency HIGH") with its visual appearance in the buffer bar. This previews what kind of data will live in each compartment.

### How it creates interesting decisions

**The allocation puzzle:** With 6 Scout slots and 4 data types, the player can't give every type a comfortable allocation. Every slot assigned to TERRAIN is a slot NOT assigned to THREAT. This creates genuine tension:
- A Scout deep in enemy territory needs more THREAT slots
- A Scout near the relay needs more COMMS slots for message forwarding
- A Scout patrolling unfamiliar terrain needs POSITION/TERRAIN for navigation

**The "empty drawer" signal:** Visible empty slots in a compartment are diagnostic gold. If a Scout's 2 TERRAIN slots are always empty, the player wasted capacity — those slots should be THREAT or COMMS. The categorized buffer makes misallocation visible in a way the unified buffer never does. In the unified model, waste is hidden — a slot used by terrain data might be "wasting" space that would be better used for threats, but there's no visual signal.

**The asymmetric pressure problem:** Different mission types create different data pressure. A mission with many enemies floods THREAT. A mission with complex terrain floods TERRAIN. The player must anticipate data pressure from the mission briefing — a form of pre-mission planning that doesn't exist in the unified model.

**The "wrong drawer" frustration (intended):** In Model A (Hard Walls), the player will encounter the moment where a critical threat datum arrives, THREAT is full, and TERRAIN has 2 empty slots sitting uselessly idle. This frustration is the teaching moment: "I need to reallocate." If the player switches to Model C (Soft Walls) later in the campaign, the relief is palpable — and then the new complexity of predicting borrowed-slot reclamation creates the next layer of mastery.

### Strengths

1. **Makes information architecture literally visible.** The colored compartments are a spatial metaphor for data organization. Players can SEE how their unit's mind is structured. This is the most didactically powerful buffer model for teaching "information architecture matters."

2. **Creates a new decision axis orthogonal to buffer size.** In the fixed-slot model, the only question is "how big is the buffer?" In the categorized model, the question is "how should the buffer be organized?" — a qualitatively different and richer design problem.

3. **Natural difficulty ramp.** Model A (Hard Walls) is simple enough for Mission 1. Model D (Priority Cascade) adds priority ordering as a new mechanic. Model E (Dynamic Partitioning) is an expert tool. The sub-models ARE the difficulty curve.

4. **Diagnosis through visible patterns.** During Inspector debrief, the compartment fill history tells a clear story: "Your COMMS compartment was always full while TERRAIN was always empty — you over-allocated TERRAIN and starved your comms network." The unified buffer can't produce this insight without additional analysis tools.

5. **Maps directly to real-world patterns.** Memory pools, prioritized queues, QoS traffic shaping, Kubernetes resource requests/limits — the categorized buffer teaches software engineering concepts through gameplay. A player who masters Model D has internalized priority-based resource scheduling.

### Weaknesses

1. **Cognitive overhead at configuration time.** The divider interface adds a configuration step that doesn't exist in the unified model. With 5 unit types × 4+ data types × potentially different allocations per unit, the configuration space explodes. Risk of "slider fatigue" (see 2.10 Signal Taxonomy, Model D "The Spectrum").

2. **Compartment misfit problem.** The signal taxonomy must be stable and comprehensive. If a datum doesn't clearly fit any compartment (is an enemy relay sighting a THREAT or a POSITION?), the system creates confusion. Classification ambiguity (see 2.10a) becomes a gameplay friction point rather than an interesting decision.

3. **Compartment count × unit types = combinatorial explosion.** 4 compartments × 5 unit types = 20 allocation decisions before battle even starts. For a Command unit with 14 slots and 4 compartments, the allocation space is enormous. Template presets mitigate this but don't eliminate it.

4. **Interferes with the "context overload → stun" mechanic.** The locked spec says context overload → 1 tick stun. With categorized buffers, overload happens per-compartment. If THREAT is full (2/2) and a new threat arrives, does the unit stun? Or does it only stun when ALL compartments are full? Per-compartment stun is too frequent (every specialized unit will stun constantly in its primary type). Full-buffer-only stun undermines the model's per-type pressure.

5. **The "solved allocation" risk.** For each unit type and mission type, there may be an objectively optimal allocation. If mission briefings give enough information, experienced players will converge on the same divider positions every time. The allocation decision becomes rote rather than interesting.

6. **Competes with eviction policy for design space.** Player-configured eviction (2.06, 2.07) already gives the player control over what stays and what goes. Categorized compartments are a DIFFERENT answer to the SAME question: "how do I protect important data from being evicted by less important data?" Having both systems (categorized compartments AND custom eviction rules) may be redundant and confusing.

### Interaction Effects

**With the signal taxonomy (2.10):** The categorized buffer REQUIRES a well-defined signal taxonomy. Model F "The Living Language" (progressive type unlock) pairs naturally — as new types unlock, new compartments appear in the buffer UI. But the taxonomy must be stable; if types change or multiply, compartment allocations become invalid. The "UNKNOWN" type from 2.10 is especially problematic — does it get its own compartment, or is it a catch-all for unclassifiable data?

**With rules language (3.05):** Categorized buffers enable type-scoped rule conditions: "IF THREAT compartment has ≥2 entries → engage nearest." This is more readable than "IF buffer contains ≥2 entries of type THREAT." The compartment is a named scope that rules can reference directly. But it also means rule conditions are coupled to compartment names — renaming compartments breaks rules.

**With hook taxonomy (3.08):** Hook payloads now need a type tag that determines which compartment they enter. If a hook sends a COMMS-typed message but the receiving unit has 0 COMMS slots, the message is immediately discarded. This creates a new failure mode: "the relay is sending me data my buffer literally cannot store." Visible in Inspector as a red flash on the zero-sized compartment.

**With the fixed-slot model (2.01):** These models are mutually exclusive for a given unit. However, a HYBRID is possible: Missions 1-4 use fixed-slot (simple), Mission 5 introduces compartments as a factory-era upgrade. The transition could be the Mission 5 "subsystem online" moment: the buffer bar splits into colored sections with a satisfying snap, and the boot log prints: `CONTEXT SUBSYSTEM: Categorized memory pools initialized. Organizing incoming data by type.`

**With context overload/stun:** Requires a design decision. Best option: **aggregate overflow**. Individual compartments evict internally (oldest out). Stun triggers only when total incoming data across ALL types exceeds total buffer capacity in a single tick. This preserves the per-type organization benefit while keeping the stun mechanic meaningful and rare enough to be dramatic.

**With the Relay compress skill:** Compress becomes more nuanced — it can compress within a type or across types. "Compress all POSITION entries into one summary" is a type-scoped compression that makes the Scout's POSITION compartment more efficient. This is richer than generic compression on a unified buffer.

**With Inspector debrief (locked):** The Inspector gets a new visualization: the **compartment timeline chart**. Instead of a single context-fill sparkline, there are 4 stacked colored sparklines showing per-type fill over all ticks. The moment where "THREAT was maxed while COMMS was empty" is immediately visible. This is one of the categorized buffer's strongest selling points — it makes diagnosis dramatically more visual and specific.

### Comparable Games/Media

**Operating system memory management:** The categorized buffer is directly analogous to memory zones in operating systems (DMA zone, normal zone, high memory zone in Linux). Each zone serves different purposes and has independent allocation/eviction. When one zone is exhausted while another has free pages, the kernel faces the same "borrow or refuse?" decision as Models A-F above.

**Factorio logistics networks:** Factorio's logistic network has separate request/provide/storage/buffer chests. Each type serves a different role in the logistics chain. Players learn to balance chest types — too many storage chests means requested items never arrive; too many requester chests means the network is saturated. The "wrong chest type" problem maps to "wrong compartment allocation."

**Into the Breach's implied categorization:** Into the Breach doesn't have buffers, but the player's attention is categorized: enemy attacks (red highlighting), environmental hazards (amber), friendly movement (green), objective status (gold). The color-coding IS a perceptual categorization. Robot Uprising's categorized buffer makes this implicit attention management explicit and configurable.

**Kubernetes resource requests and limits:** K8s pods specify resource requests (minimum guaranteed) and limits (maximum allowed). Model E (Dynamic Partitioning) is functionally identical — minimum guarantees per type with flexible remainder. Players who understand compartment minimums have internalized Kubernetes resource scheduling.

**Email folders vs. single inbox:** The categorized buffer is the email folder approach — separate folders for Work, Personal, Newsletters, Alerts. The unified buffer is Gmail's single inbox with labels. Different organizational philosophies for the same problem. Some people swear by folders; some by a single stream with good search. The game could let the player choose their philosophy.

**Network QoS (Quality of Service):** Network routers categorize traffic into priority classes (voice, video, data, best-effort) with guaranteed bandwidth per class. Model D (Priority Cascade) IS QoS — high-priority traffic classes can borrow bandwidth from low-priority ones. An engineer who configures Robot Uprising's Priority Cascade has practiced network QoS design.

### Sensory Description

**Plan screen — the divider interface:**
The context window appears as a horizontal **glass tube** below the unit's portrait in the workbench. The tube is segmented by glowing vertical dividers — thin lines of white light that pulse softly when hovered. Each segment is tinted with its compartment color: THREAT segments glow a warm, insistent red; POSITION segments shimmer cool blue with tiny coordinate grid lines barely visible in the glass; TERRAIN segments pulse organic green with fractal leaf patterns; COMMS segments crackle cyan with miniature signal wave animations rippling through the glass.

When the player grabs a divider, it brightens to white-gold and emits a soft **magnetic click** — the sound of a precision instrument engaging. Dragging left or right smoothly resizes the adjacent compartments. The numbers inside each section (e.g., "2") slide and resize in real-time. When a compartment shrinks to 0, it collapses with a tiny **hiss** sound and the section's color fades to dark gray with a dashed outline — the ghost of what was there. When released on a valid position, the divider settles with a satisfying **thunk**, like a drawer sliding into place.

**Sealed Watch — compartment fill bars:**
Each unit on the battlefield shows its context bar as **stacked colored pips** rather than a single bar. A Scout with allocation 2-1-1-2 shows: 2 red pips, 1 blue pip, 1 green pip, 2 cyan pips. As data fills compartments, pips light up from left to right within each color group. A full compartment's pips pulse brighter. An empty compartment's pips are dim but visible.

When a datum arrives and its compartment is already full (triggering internal eviction), the oldest pip in that color group **flickers and dims** while the new pip **brightens** at the end — a tiny, rapid swap animation. When a datum arrives but its compartment has zero allocation (type ignored), a brief **amber spark** appears above the unit — data rejected, visible to the attentive player.

When aggregate overflow triggers a stun, ALL pips flash white simultaneously, then scatter into static noise for 1 tick — the unit's categorized mind dissolving into chaos before reforming.

**Inspector — compartment timeline:**
The context fill chart is no longer a single sparkline. It's a **stacked area chart** — four colored layers showing per-type fill over all ticks, stacked on top of each other. THREAT (red) at the bottom, COMMS (cyan) at the top. The chart reveals patterns invisible in the unified model: "THREAT spiked at tick 12 while COMMS dropped to zero — the relay was destroyed." Hovering over any point shows the exact contents of each compartment at that tick, with individual datum details in a flyout panel.

The divider allocation is shown as horizontal dashed lines on the chart — the "capacity ceiling" for each type. When a type's fill touches its ceiling, the line glows brighter. When it exceeds the ceiling (in Soft Walls or Priority Cascade models), the overflow area is rendered in a diagonal hash pattern — visibly "borrowed" space.

**Audio vocabulary:**
- **Divider grab:** Magnetic click, 1200Hz, 50ms
- **Divider drag:** Smooth glass-on-glass slide, pitch rises as compartment grows
- **Divider release:** Thunk, 400Hz, 80ms — heavier for larger compartments
- **Compartment collapse (to 0):** Hiss + tiny pop, like sealing a vacuum tube
- **Compartment expand (from 0):** Whoosh + chime, like opening a valve
- **Internal eviction:** Soft paper shuffle, 30ms
- **Type-rejected datum (amber spark):** Tiny electrical zap, 2000Hz, 20ms
- **Aggregate stun:** White noise burst + all four type-tones playing simultaneously as a dissonant chord, resolving to silence

---

## Player Journeys

### Journey: Mei, 24, CS student with data structures knowledge

**Context:** Mission 5, just unlocked the factory. Previous missions used fixed-slot buffers. The boot log just printed: "CONTEXT SUBSYSTEM: Categorized memory pools initialized. Organizing incoming data by type." The buffer bar on her Scout blueprint has split into four colored sections.

**Minute 0:00 — The Split**
Mei sees the Scout's context window in the workbench. Yesterday it was a single bar of 6 gray slots. Now it's 4 colored segments with tiny divider handles between them. The default allocation reads: THREAT 2 | POSITION 1 | TERRAIN 1 | COMMS 2. She hovers over the THREAT section — a tooltip shows a sample datum: "Enemy Striker at D4, tick 12, urgency HIGH." She hovers over TERRAIN — "Open ground at C3, no cover." She thinks: "Oh, it's like a HashMap with fixed-size buckets."

**Minute 0:15 — First Drag**
She grabs the divider between THREAT and POSITION. The handle brightens, the magnetic click sounds. She drags right, expanding THREAT to 3 and shrinking POSITION to 0. The POSITION section collapses with a hiss — a dashed outline remains, ghostly blue. An amber warning appears: "This unit will discard all POSITION data." She thinks: "That's fine, the relay will tell it where to go." She releases. Thunk.

**Minute 0:45 — The Relay Question**
She moves to her Relay blueprint (12 slots). The Relay has no perception — it only receives hook messages. The TERRAIN and POSITION compartments are wasted on it. She collapses both to 0 (hiss, hiss), expanding COMMS to 8 and THREAT to 4. The Relay is now a pure message router with a generous threat awareness. She equips the compress skill and thinks about how compress will work across types: "Does compress merge 3 THREAT entries into 1 THREAT summary? That would free 2 THREAT slots." She checks the compress skill tooltip — a micro-scenario shows exactly this, three red threat pips merging into one bright red pip. "Yes!"

**Minute 1:30 — Pre-Mission Allocation Strategy**
The mission briefing mentions "dense enemy patrols in the eastern corridor." Mei decides:
- Scouts: THREAT 3, COMMS 2, POSITION 1, TERRAIN 0 (collapsing terrain — scouts report threats, not scenery)
- Relay: THREAT 2, COMMS 10, POSITION 0, TERRAIN 0 (message hub, minimal threat awareness for self-preservation)
- Striker: THREAT 4, COMMS 4, POSITION 0, TERRAIN 0 (needs threat data to engage, needs comms for orders)

She hits EXECUTE. The dividers lock in place. The sealed watch begins.

**Minute 3:00 — The Inspector Revelation**
Her scouts survived but one striker was overwhelmed. In the Inspector, she opens the compartment timeline for the dead striker. The stacked area chart shows: THREAT (red) was maxed at 4/4 from tick 8 onward. COMMS (cyan) was nearly empty — only 1/4 used. She hovers over tick 12: the THREAT compartment held 4 enemy positions, but the striker only had rules for "engage nearest." It couldn't prioritize. Meanwhile, COMMS had 3 empty slots doing nothing while THREAT was overflowing.

She thinks: "I need Soft Walls for the striker. Let it borrow COMMS slots for threat overflow when the situation is dire." She realizes this is exactly the same insight as Kubernetes pod resource limits — guaranteed minimums with burstable capacity. She grins.

**Minute 4:00 — The "I'll text my professor" moment**
She screenshots the compartment timeline chart — the clean visual of THREAT maxed while COMMS sat empty — and sends it to her OS professor with the caption: "I finally understand memory zones. This game's buffer is literally /proc/buddyinfo."

**UI Annotations:**
- **Divider handle:** 4px wide glowing pip between compartments, brightens to white-gold on hover
- **Compartment tooltip:** Sample datum with type icon + description, 300ms hover delay
- **Collapse warning:** Amber text below buffer bar, 12px, fades after 3 seconds
- **Inspector compartment timeline:** Stacked area chart, 400px wide × 200px tall, horizontal tick axis, vertical slot-count axis

---

### Journey: Dayo, 17, Nigerian high school student, first strategy game

**Context:** Mission 3 (still in pre-factory tutorial). The categorized buffer was just introduced via boot log: "Your units can now organize their memory. Threats in one drawer, messages in another." Dayo has never played a strategy game before. He's on his phone in portrait mode.

**Minute 0:00 — The New UI**
Dayo's Scout blueprint now shows a bar with four colored segments. He's confused — yesterday the buffer was just gray slots. He taps the bar. A tutorial overlay appears with a ghost hand animation: the hand grabs a divider, drags it, and the segments resize. Text reads: "Drag dividers to decide how your scout organizes its thoughts."

He tries it. Grabs the first divider (between red THREAT and blue POSITION). Drags right — the red section grows, blue shrinks. A number updates: "3 | 0 | 1 | 2." He releases. Thunk. He thinks: "Okay, so I'm choosing what it cares about more."

**Minute 0:30 — The Preset Discovery**
Below the divider bar, he sees four small icons: ⚔ (Paranoid), 🔄 (Balanced), 📡 (Network Node), 🗺 (Scout Sweep). He taps ⚔ — the dividers snap to THREAT 4, POSITION 1, TERRAIN 0, COMMS 1. The tooltip says: "Focused on threats. Ignores terrain. Minimal communication." He taps 📡 — snap to THREAT 1, POSITION 0, TERRAIN 0, COMMS 5. "Focused on receiving messages. Very little personal awareness."

He thinks: "This is like choosing what to pay attention to in class. If I focus on the teacher, I miss the chat. If I focus on the chat, I miss the lesson." He settles on Balanced (1-2-1-2). Safe.

**Minute 1:00 — The Mission (Sealed Watch)**
The mission has a single enemy striker approaching from the east and a cluster of jungle terrain tiles in the center. Dayo's Scout moves west, its 6-pip context bar visible at the bottom of its tile. He watches the pips: 1 red pip lights up (enemy spotted), 2 blue pips light up (position data from movement), 1 green pip lights up (terrain observation). The COMMS pips stay dark — there's no relay yet.

At tick 8, the enemy striker gets close. The Scout sees 3 enemies (scout + 2 strikers). But THREAT only has 1 slot — the second and third threat data arrive and the oldest threat is evicted. The red pip flickers rapidly: incoming → evict → incoming → evict. The Scout's rule fires on the FIRST threat it sees (the original scout, not the closer striker). It evades... toward the strikers.

Dayo watches his Scout walk into danger. "No no no NO." The Scout is eliminated.

**Minute 2:00 — The Debrief Aha**
In the Inspector, he clicks his dead Scout. The compartment timeline shows: THREAT (red) peaked at 1/1 from tick 4 onward — perpetually full, constantly evicting. POSITION (blue) was at 2/2 from tick 6 — also full but stable. TERRAIN (green) sat at 0/1 the entire mission — completely unused.

A diagnostic annotation appears (amber text with Codex link): "This unit's THREAT compartment was full when critical threat data arrived. Consider: allocating more slots to THREAT, or fewer to unused types."

Dayo looks at the green TERRAIN bar — flat zero the entire mission. He wasted a slot. He goes back to the Plan screen, collapses TERRAIN to 0, expands THREAT to 2. Replays. The Scout now holds 2 enemy positions simultaneously, its rule correctly targets the nearest striker, and it evades in the right direction.

He texts his friend: "This game just taught me about priorities. I was literally wasting my scout's brain on grass."

**Minute 3:30 — The Victory Realization**
On the successful replay's Inspector, the compartment timeline shows a clean pattern: THREAT 2/2 (fully utilized), POSITION 2/2 (useful navigation data), COMMS 2/2 (relay messages flowing). Zero waste. He screenshots the before/after timelines. The difference is stark — the "wasted green" is gone, replaced by used red.

**UI Annotations:**
- **Tutorial overlay:** Ghost hand animation, 2s loop, semi-transparent backdrop, tap-to-dismiss
- **Preset icons:** 24×24 icons in a row below the divider bar, tap-to-apply with snap animation
- **Context bar pips on battlefield:** 3px tall colored rectangles below unit tile, grouped by type color
- **Inspector diagnostic annotation:** Amber text with blue Codex link icon, appears on first debrief of a failed unit with full compartment

---

### Journey: Dr. Kiran, 45, site reliability engineer, Factorio veteran (800+ hours)

**Context:** Mission 8, deep in the campaign. She's using Model D (Priority Cascade) and building a complex 5-unit architecture with a Command agent. She's been playing for two weeks and has mastered compartment allocation across all unit types. Tonight she's tackling the toughest mission so far: an enemy that floods noise signals to overload her network.

**Minute 0:00 — The Architecture Design**
Kiran's workbench shows 5 blueprints. She's allocated compartments with surgical precision:
- Scout Alpha: THREAT 3, POSITION 1, TERRAIN 0, COMMS 2 — Priority: THREAT > COMMS > POSITION
- Scout Beta: THREAT 1, POSITION 3, TERRAIN 0, COMMS 2 — Priority: POSITION > COMMS > THREAT
- Relay: THREAT 1, COMMS 9, POSITION 1, TERRAIN 1 — Priority: COMMS > THREAT > POSITION > TERRAIN
- Striker: THREAT 5, COMMS 3, POSITION 0, TERRAIN 0 — Priority: THREAT > COMMS
- Command: THREAT 2, COMMS 10, POSITION 1, TERRAIN 1 — Priority: COMMS > THREAT > POSITION > TERRAIN

She examines the priority cascade configuration. Each unit has a priority ordering she's set via drag-reorder — the same interaction as rule priority. The mission briefing warns: "Enemy employs signal flooding. Expect high-volume noise on detected channels." She adjusts: on the Relay, she adds a 5th compartment — NOISE — with 0 slots and lowest priority. Any incoming noise-typed data will be immediately discarded (the compartment exists but has zero capacity). The NOISE compartment appears as a dark gray collapsed section with a dashed outline and a 🚫 icon.

She thinks: "This is literally iptables DROP. I'm writing firewall rules for my relay's brain."

**Minute 1:30 — The Priority Cascade in Action (Sealed Watch)**
The battle starts. Enemy scouts flood the field with NOISE signals. Kiran watches her Relay's context bar: the COMMS section fills rapidly (9 cyan pips lit). On tick 6, a critical THREAT signal arrives from Scout Alpha. The Relay's THREAT compartment is full (1/1). Under Priority Cascade, the THREAT datum (priority 1) looks for space in lower-priority compartments. TERRAIN (priority 4) has 1 entry. The THREAT datum evicts the TERRAIN entry — the green pip dims, and the red pip brightens in the TERRAIN section's space (shown as a red pip with a green border — "borrowed" slot).

On tick 8, the enemy floods 6 NOISE signals simultaneously. The NOISE compartment has 0 slots — all 6 are immediately discarded. Six tiny amber sparks burst above the Relay. The Relay doesn't even flinch. Kiran whispers: "Dropped."

On tick 10, the enemy escalates — they send noise disguised as COMMS (type spoofing, see 2.10d). The Relay's COMMS compartment, already at 9/9 with real data, begins evicting legitimate messages to make room for spoofed ones. Kiran sees the cyan pips flickering — real messages being replaced by enemy noise that LOOKS like comms.

**Minute 3:00 — The Inspector Deep Dive**
Her Relay survived but the Striker missed a critical engage order (evicted by spoofed comms). In the Inspector, the compartment timeline tells the story clearly: COMMS (cyan) was saturated from tick 6, but the COMPOSITION of the cyan area changes — legitimate messages (solid cyan) are gradually replaced by spoofed noise (cyan with red diagonal hatching). By tick 10, 7 of 9 COMMS slots held spoofed data.

She hovers over tick 10: each COMMS entry shows its source. The spoofed entries have source "ENEMY_RELAY_3" but type "COMMS" — they passed the type check but came from an enemy. She realizes she needs the Specialist's "authenticate" skill to verify signal provenance before accepting into COMMS compartments. The fix isn't more slots or different priority — it's adding source verification to the intake pipeline.

She says to herself: "I need input validation on my message bus. This game IS my job."

**Minute 5:00 — The Redesign**
Back in the Plan screen, she adds a Specialist unit between the Scouts and the Relay. The Specialist has the "authenticate" skill, which verifies signal sources before forwarding. Unauthenticated signals are dropped. She adjusts the Specialist's compartments: COMMS 6 (intake buffer for authentication), THREAT 2, POSITION 1, TERRAIN 1. The Specialist acts as a firewall between the hostile network and her trusted relay chain.

She re-executes. The Specialist catches 100% of the spoofed signals — its COMMS compartment fills with enemy noise, the authenticate skill drops them, and only verified signals reach the Relay. The Striker receives the engage order on time. Mission complete.

She thinks: "I just built a DMZ with an intrusion detection system. In a game about robots. On my lunch break."

**UI Annotations:**
- **Priority ordering:** Vertical list of compartment names with drag handles (identical to rule priority reordering), displayed in a flyout panel when clicking a ⚙ icon on the buffer bar
- **Borrowed slot visual:** Pip rendered in the borrowing type's color with a thin border in the lending type's color
- **NOISE 🚫 compartment:** Collapsed section with 🚫 icon, dark gray, dashed outline, zero-capacity tooltip
- **Spoofed entry visual in Inspector:** Entry rendered with diagonal red hatching over the type color
- **Source verification in datum detail:** Each entry shows "Source: SCOUT_ALPHA (verified ✓)" or "Source: ENEMY_RELAY_3 (unverified ⚠)"

---

### Journey: Tomás, 14, Philippine student, plays on phone during jeepney commute

**Context:** Mission 3, first encounter with categorized buffers. He's on a budget Android phone in portrait mode. He has 15 minutes before his stop.

**Minute 0:00 — The Tutorial Moment**
The boot log scrolls: "Subsystem update: your units can now sort their memories into categories. Threats. Positions. Terrain. Messages." The workbench updates — his Scout's buffer bar splits into four colored sections. On his small phone screen, the sections are compact but readable — each shows a tiny icon (⚠ 📍 🌿 📡) and a number.

A ghost hand animation shows dragging a divider. Tomás tries it with his thumb. The divider is large enough for touch — a 44px hit target with generous padding. He drags THREAT from 2 to 3, watching POSITION shrink from 1 to 0. The collapse hiss plays through his earbuds. The amber warning text is large enough to read: "Ignores POSITION data."

He taps the "Balanced" preset icon. Snap — back to defaults. He taps "Paranoid." Snap — heavy THREAT. He grins. This is like choosing a loadout in a shooter.

**Minute 0:45 — Quick Match**
He picks "Paranoid" (THREAT 4, POSITION 1, TERRAIN 0, COMMS 1) and hits EXECUTE. The sealed watch shows his Scout aggressively tracking enemies — its THREAT pips are always lit. But at tick 6, a relay message arrives with coordinates. The COMMS compartment is full (1/1). The relay message evicts... but there's only 1 slot. The next relay message evicts the first. The Scout never holds a relay message long enough to act on it.

The Scout engages the nearest enemy (THREAT data is abundant) but walks into a trap — two enemies were flanking, and the relay was warning about it. The Scout didn't process the warning because COMMS was too small to hold it alongside the previous message.

**Minute 1:30 — Quick Fix**
He failed. Goes back. Switches from Paranoid to Balanced. His Scout now has 2 COMMS slots — enough to hold the relay warning alongside the previous message. The rule "IF COMMS contains FLANK_WARNING → evade toward base" fires correctly. The Scout retreats. Mission complete.

He learned: "Paranoid isn't always better. You need to listen too." He pockets his phone as the jeepney reaches his stop. Total play time: 4 minutes.

**UI Annotations:**
- **Touch target:** Divider handles are 44px wide (iOS HIG minimum), with 8px padding on each side
- **Preset icons:** 32×32, displayed in a horizontal row, tap-to-apply with haptic feedback
- **Portrait mode layout:** Buffer bar spans full width of the workbench panel, compartment labels are icons only (no text) to save space
- **One-handed reachability:** Divider handles are in the lower 60% of the screen, within comfortable thumb reach

---

## The Sub-Model Recommendation

For Robot Uprising's 10-mission campaign, the recommended progression is:

| Mission | Buffer Model | Teaching Moment |
|---------|-------------|-----------------|
| 1-3 | Fixed-slot (2.01) | Baseline — learn what a buffer IS |
| 4 | Categorized, Model A (Hard Walls) | "Your buffer can now organize" — first allocation decision |
| 5-6 | Categorized, Model A + presets | Factory era — presets reduce cognitive load during factory learning |
| 7 | Categorized, Model D (Priority Cascade) | Priority ordering as new mechanic — "important data can push out unimportant data" |
| 8-9 | Model D + authentication/spoofing challenges | Information warfare — types can be spoofed, trust becomes a design problem |
| 10 | Full expression (player chooses A/C/D/E) | Mastery — the player picks their philosophy |

**Model B (Overflow Queue) and Model F (The Inbox)** are reserved for Gauntlet modifiers — special conditions that change the buffer model for competitive variety.

---

## New Aspects Discovered

1. **2.04a — Compartment allocation templates as community content:** Shareable divider presets per unit type per mission; "Mei's Mission 8 Relay allocation" as a community artifact; interaction with Config Code format (7.03a)

2. **2.04b — Dynamic compartment count across campaign:** Starting with 2 types (THREAT/COMMS) in Mission 3, expanding to 4 types by Mission 5, allowing custom types by Mission 9; the compartment count itself as a progression mechanic

3. **2.04c — Compartment overflow visualization in Sealed Watch:** How to render the moment a full compartment evicts — the rapid pip flicker needs to be readable at 1x speed on a phone screen; interaction with tile-scale sprite readability (6.01b-v)

4. **2.04d — Categorized buffer vs. custom eviction rules: the redundancy problem:** Formal analysis of whether compartments and eviction policies are complementary or competing mechanics; can one system do both jobs? Should the game pick one? Interaction with eviction policy aspects (2.06, 2.07)

5. **2.04e — The "wrong drawer" diagnostic in Inspector:** Designing the Inspector annotation that fires when a datum is discarded because its compartment has 0 slots while other compartments are empty; the "you told it to ignore this" moment as a teaching beat
