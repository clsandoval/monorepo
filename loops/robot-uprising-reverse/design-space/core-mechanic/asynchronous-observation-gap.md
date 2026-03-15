# 2.20 — Asynchronous Observation Gap as Core Design Pattern

**Aspect:** 2.20 — Asynchronous observation gap as core design pattern
**Wave:** 2 (Core Mechanic Variations)
**Category:** core-mechanic

---

## The Design Question

Every agent in Robot Uprising acts on **last tick's world state**. A scout at tick T=5 perceives enemies in its radius and writes observations into its buffer — but those observations describe the world at T=5, and the scout's *rules evaluate at T=5 using data from T=4 and earlier*. If the scout fires a hook to a relay, the relay receives the signal at T=6. If the relay compresses and forwards to a striker, the striker gets it at T=7. The striker acts at T=7 using data that describes the world at T=5 — **two ticks stale**.

This is Robot Uprising's equivalent of the "fog of war" — but it's fundamentally different. In StarCraft, you don't know what you can't see. In Robot Uprising, **you can't unsee what you already saw, but what you saw might already be wrong.** The fog isn't spatial — it's temporal. Every agent lives in its own slightly-out-of-date snapshot of reality, and the depth of your relay architecture determines *how far behind reality* your combat units operate.

This is the **Asynchronous Observation Gap** — the designed, irreducible delay between "something happens on the board" and "an agent acts on that information." It is not a bug. It is *the* core mechanic. Every interesting decision in the game flows from it:

- **Should I add a relay for better compression, knowing it adds 1 tick of latency?**
- **Should my striker listen directly to scouts (fast but noisy) or through relays (slow but clean)?**
- **Is a 3-tick-old compressed threat report better than a 1-tick-old raw observation?**

The locked spec defines the mechanics: 1 tick per hop, simultaneous resolution, context windows. But the spec doesn't fully articulate how this temporal fog is **communicated to the player during onboarding**, **visualized during the sealed watch**, or **taught through the inspector debrief**. That's what this analysis maps.

---

## The Three Faces of Staleness

### Face 1: Perception Lag (1 tick, universal)

Every agent's perceptions describe the world *as it was when they last observed*. Since all agents resolve simultaneously, an agent at tick T is evaluating rules against observations generated at tick T-1 (observations are generated, then rules evaluate, but the observations describe the world state at the *start* of the tick before movement resolution).

In practice: a scout observes an enemy at position D4 at tick T=10. The scout's rules fire, and it sends a hook signal saying "enemy at D4." But at T=10's resolution, the enemy might have already moved to D5. The scout's report is **born stale**.

**Player experience:** This is nearly invisible for a single unit. The 1-tick gap is small enough that observations are usually accurate enough. Players won't even notice this until they encounter fast-moving enemies or tight combat timing where "the enemy was at D4 but moved to D5 before my striker arrived" becomes a meaningful failure mode.

### Face 2: Communication Lag (1 tick per hop, architectural)

The more interesting staleness. Scout→Striker is 2 ticks. Scout→Relay→Striker is 3 ticks. Scout→Relay→Relay→Striker is 4 ticks. The player *designed* this latency by choosing the relay topology. Deeper architectures get cleaner, more compressed intelligence — but it's older.

**Player experience:** This is where the game lives. The player sees a perfectly compressed threat report arrive at their striker... just late enough that the enemy has already moved. The debrief shows: "STRIKER-B acted on intelligence from T=8. The enemy moved at T=9. STRIKER-B engaged the wrong tile at T=10." The player designed the architecture that created this delay. The fix isn't "remove the relay" — it's "design a faster path for time-critical signals."

### Face 3: Buffer Lag (variable, emergent)

Even after a signal arrives, it might not be *used* immediately. If a striker's buffer is full of low-priority observations, the incoming threat report might sit in the buffer for 1-2 ticks before the rules that match it get their turn (if eviction hasn't killed it first). Buffer pressure adds latency on top of communication latency.

**Player experience:** This is the advanced failure mode. The signal arrived on time, but was buried under noise. The debrief's buffer state view reveals: "Signal S-14 (compressed threat at D4) arrived at T=9, sat in slot 3 behind two terrain observations, and was evicted at T=10 before any rule consumed it." The signal was fast enough — the buffer was too full.

---

## How Other Games Handle Information Delay

### StarCraft: The Binary Veil

StarCraft's fog of war is spatial and binary. You either see a tile or you don't. When a scouting unit leaves an area, the last-known state is displayed in grey. Buildings remain visible at their last-known health; units vanish entirely. The "stale data" is the grey ghost of the building you scouted 3 minutes ago — it might be destroyed, might be upgraded, might have spawned 20 units you can't see.

**What translates:** The concept of "ghost" information — showing something that *was* true — directly maps to Robot Uprising's signal age mechanic. A 5-tick-old observation should feel like StarCraft's grey fog: still somewhat informative, but increasingly unreliable.

**What doesn't:** StarCraft's fog is spatial (you lack vision of a *place*). Robot Uprising's gap is temporal (you have vision but it's *old*). This distinction is crucial for the feel. StarCraft says "I don't know what's over there." Robot Uprising says "I know what was there 3 ticks ago, but the world has moved on."

### Into the Breach: The Anti-Gap

Into the Breach shows you *exactly* what the enemy will do next turn. Perfect information. Zero observation gap. Every enemy telegraphs its attack before executing. The tension comes from not having enough actions to address every threat, not from uncertainty about what the threats are.

**What translates:** Into the Breach's visual language for displaying intent (red squares, attack arrows, damage numbers on tiles) provides a template for how Robot Uprising could display the *age* of information. If Into the Breach says "this WILL happen," Robot Uprising needs a visual language for "this WAS true N ticks ago."

**What doesn't:** Into the Breach proves that perfect-information tactics games are deeply engaging. Robot Uprising deliberately introduces imperfect information — but through temporal delay, not through hidden intent. The enemy's current position IS knowable (it's on the board), but by the time your deep-relay chain learns about it, the position has changed.

### Trick of the Light (WPI thesis): Unit-Level Memory

This experimental game gave every unit (allied and enemy) its own private memory of what it has seen. Units had to physically exchange information to update each other. The player, as commander, could only know what their units collectively remembered. A unit at the far edge of the map might have critically important intelligence that no one else knows about yet.

**What translates almost perfectly:** This is Robot Uprising's model. Each agent has its own context window. Agents share information through hooks on channels. The commander (player) sees the aggregate in debrief but not during sealed watch. The "stale data" problem is literally a unit-memory-synchronization problem.

### R.U.S.E.: Deception Layered on Fog

R.U.S.E. built an entire game around information warfare. Players could deploy decoy units, jam enemy reconnaissance, decrypt enemy communications, and reveal hidden units. The fog of war was not just an obstacle — it was a *weapon*.

**What translates:** Robot Uprising's EM emissions mechanic (hooks create detectable noise) makes information warfare a literal game system. Deep relay architectures are louder. The observation gap becomes a weapon: if you can flood an enemy's channel with noise (forcing their buffers to fill with garbage), you can artificially extend their observation gap. They'll act on data that's not just old — it's *wrong*.

---

## Visualization Design: How the Gap Becomes Visible

The observation gap must be **viscerally legible** during sealed watch and analytically traceable during inspection. Here are five visualization approaches:

### Approach A: "The Fading Photograph"

**Concept:** Each observation in an agent's context window has a visual age indicator. In the unit inspector, each buffer slot shows its contents with a color temperature that shifts from **white-hot (this tick)** through **warm amber (1-2 ticks old)** to **cool blue (3-4 ticks old)** to **grey-translucent (5+ ticks old)**. The slot doesn't just show *what* the data is — its color screams *how old* the data is.

**During sealed watch:** The context bars at the bottom of each unit tile already show fill level. Add a secondary hue: a unit acting on fresh data has a context bar glowing warm white. A unit acting on stale data has a context bar tinted blue-grey. The player can see at a glance which units are operating in the present and which are living in the past.

**During inspection:** The buffer state detail view shows each slot as a card. The card's border fades from a bright cyan edge (fresh) to a dark navy edge (stale). Hovering a card shows: "Source: SCOUT-A | Channel: threat-east | Created: T=5 | Received: T=7 | Age: 3 ticks". The age number is large and color-coded.

**Sensory feel:** A unit with all-fresh data feels *alive* — bright, responsive, present. A unit operating on old data feels *sluggish* — muted, hazy, ghost-like. You can tell from across the room which units are seeing clearly and which are navigating by memory.

### Approach B: "The Timestamp Trail"

**Concept:** During sealed watch, when a unit acts (moves, attacks, transmits), a small timestamp badge briefly appears near the unit showing the age of the data that triggered the action. If STRIKER-B moves to attack based on a 3-tick-old observation, a small "T-3" badge pulses near it in amber. If it acts on fresh 1-tick data, a "T-1" badge appears in green.

**During sealed watch:** Timestamp badges appear as brief popups (0.5s) near units as they act. Green "T-1" badges are barely noticeable — everything's working. Amber "T-2" or "T-3" badges catch the eye. Red "T-4+" badges are alarm signals. A battlefield where all badges are green feels like a well-oiled machine. A battlefield where amber and red badges proliferate tells you: your architecture has a latency problem.

**During inspection:** The decision trace shows: "STRIKER-B moved to D4 at T=10. Decision was based on context entry S-14 (enemy sighting at D4, created T=7, received T=9). Data age at decision: 3 ticks. Enemy actual position at T=10: E5. Targeting error: 1 tile." The trace explicitly quantifies the cost of staleness.

**Sensory feel:** The timestamp badges create a rhythm of green flickers (good architecture) or amber/red alarms (latency problems). After a few missions, players develop an instinct: amber badges mean their relay chains are too deep or their buffer filtering isn't aggressive enough.

### Approach C: "The Signal Afterimage"

**Concept:** When a signal travels through the network, the board shows a **ghostly afterimage** of the information as it propagates. If a scout spots an enemy at D4 and hooks on `threat-east`, a faint cyan ghost appears at D4 on the relay's tile at the next tick, then on the striker's tile the tick after. But the real enemy has moved. The ghost and the reality diverge. The player watches the ghost trail behind reality.

**During sealed watch:** When a hook fires, a translucent echo of the payload appears at the receiving unit's position. For spatial data (enemy sightings), this is a ghost unit marker. For non-spatial data, it's a pulse along the channel line. The ghost persists for 1 tick after delivery, fading out. Multiple ghosts from different chains create a "timeline debris" effect — you can see the network thinking, each node living in its own temporal slice.

**During inspection:** The timeline scrubber reveals all active ghosts at any tick. Stepping through the timeline, the player can watch a ghost diverge from reality: "At T=7, the ghost says 'enemy at D4.' At T=8, the real enemy is at D5. At T=9, the ghost arrives at STRIKER-B showing D4. At T=10, STRIKER-B attacks D4. The tile is empty." The ghost visualization makes the gap tangible.

**Sensory feel:** The battlefield becomes a palimpsest of present and past. Fresh signals cast sharp shadows. Old signals cast blurry, fading traces. A well-designed architecture has ghosts that closely track reality (short chains, fast paths). A poorly designed one has ghosts drifting away from their targets like untethered balloons. The visual is haunting, beautiful, and immediately communicative.

### Approach D: "The Clock Offset"

**Concept:** Each unit displays a tiny clock face or tick counter showing *which tick's data it's currently operating on*. If the global tick is T=10 and STRIKER-B is acting on T=7 data, STRIKER-B's clock shows "T=7" — three ticks behind the world. The clock offset is the observation gap, rendered as a literal time difference.

**During sealed watch:** A small clock icon under each unit shows its "perceived tick." Units with current data show the same tick as the global clock. Units behind show a lower number in a warning color. The difference between the global tick and the unit's perceived tick is the observation gap, displayed as a number. When the whole army is in sync (clocks aligned), the formation feels precise. When clocks diverge, the formation feels ragged — each unit living in its own timezone.

**During inspection:** The clock offset is charted over time. A sparkline shows each unit's offset per tick. Spikes (sudden increases in offset) correspond to moments when new intelligence was delayed — maybe a relay was destroyed, or a buffer was overloaded. The chart becomes a diagnostic of architectural health.

**Sensory feel:** The clocks ticking at different rates create an anxious, slightly vertiginous feeling — like watching a room full of clocks that aren't synchronized. The player feels the temporal fragmentation of their network.

### Approach E: "The Confidence Meter" (Recommended Hybrid)

**Concept:** Combine the emotional impact of the fading photograph (Approach A) with the diagnostic precision of the timestamp trail (Approach B) and the narrative drama of the signal afterimage (Approach C). The confidence meter synthesizes data age, buffer freshness, and signal chain depth into a single per-unit metric: **how much can this unit trust its own information?**

**During sealed watch:** Each unit has a confidence arc — a thin semicircle below its icon that fills from left (low confidence/stale) to right (high confidence/fresh). The arc glows green when the unit's average data age is ≤1 tick, shifts to amber at 2-3 ticks, and turns red at 4+ ticks. The arc subtly pulses when a new signal arrives (momentary brightening). When a unit acts on stale data that leads to a targeting miss, the arc flickers and the unit hesitates visually (a 0.2s stutter in its snap-to-grid movement). The audience can feel the moment a unit's confidence fails it.

**During inspection:** The confidence meter breaks down into its components: average observation age, freshest data point, stalest data point, percentage of buffer that's >2 ticks old. A sparkline of confidence over all ticks shows the unit's "perception health" — did it maintain good situational awareness or gradually fall behind?

**Signal afterimages (from Approach C)** appear only in the inspector, as an opt-in overlay layer called "Signal Trails." Toggle it on, and the board shows the ghost traces of every signal as it propagated through the network. Toggle it off for a clean tactical view.

**Timestamp badges (from Approach B)** appear only for critical moments: when a unit acts on data ≥3 ticks old, or when a targeting miss occurs due to stale data. Not on every action — only when the gap *costs something*.

---

## Onboarding: Teaching the Gap

The observation gap cannot be taught by explaining it. It must be *experienced, felt, and then explained*. Here's how the gap enters the player's consciousness across the campaign:

### Mission 1: The Invisible Gap

The first mission is designed so that the observation gap **never matters**. Enemies are slow, the board is small, and pre-placed units have direct perception. The 1-tick perception lag exists but never causes a visible problem. The player learns rules, context windows, and basic mechanics without encountering temporal confusion.

**Design purpose:** Establish the baseline. When the gap does matter (Mission 3), the player has a "before" to compare against.

### Mission 3: "The Ghost Report" (First Gap Encounter)

Mission 3 introduces hooks. A scout hooks to a striker on channel `threat-east`. The mission is designed with a **fast-moving enemy** that changes position frequently. The scout spots the enemy at D4, hooks the sighting, but by the time the striker receives the signal (2 ticks later), the enemy has moved to D6. The striker attacks D4. Empty tile. The player wins anyway (the mission is still easy), but the **miss** is visible and confusing.

**The boot log plants the seed:** Before Mission 3, the boot log mentions: "Signal propagation: 1 tick per hop. Signal fidelity: decreasing with age." The player reads this but doesn't fully grasp it yet.

**The debrief teaches it:** After the sealed watch, the inspector shows the decision trace for the striker's missed attack. The trace highlights: "Data age at decision: 2 ticks. Enemy moved during propagation." The inspector's signal trail overlay (Approach C) shows the ghost diverging from reality. The player has their first "aha" moment: **the information was old**.

### Mission 4: The Designed Failure

Mission 4 introduces a scenario where the observation gap **causes a loss** if the player doesn't address it. A fast enemy scout flanks around the player's defensive line. The player's scout detects it, but the 2-tick relay chain delay means the striker repositions too late. The flanking enemy reaches the base.

**The fix is upstream:** The debrief suggests (through the decision trace) that the striker could have received the intelligence faster if it listened directly on the scout's channel — skipping the relay, getting noisy raw data but getting it *fast*. The player learns: **speed vs. quality is a real trade-off, and the observation gap is the cost of quality.**

### Mission 5+: The Gap as Design Language

By Mission 5, the player is consciously managing the observation gap. They know that deeper relay chains = older data. They're making choices: "This striker needs real-time data, so I'll wire it directly to the scout. This command unit can tolerate stale data because it's making strategic decisions, not tactical ones."

The gap has become a *vocabulary*. "How stale is this signal path?" is a question the player asks naturally.

---

## Player Journeys

### Journey 1: Mei-Lin, 28, Data Engineer (First Gap Encounter — Mission 3)

**Context:** Mei-Lin has completed Missions 1-2. She understands context windows, basic rules, and unit types. This is her first time configuring hooks between units. She's playing after work, still in problem-solving mode from her day job.

**Minute 0:00 — Plan Screen**
Mei-Lin sees the workbench with two pre-placed units: SCOUT-A (bottom-left) and STRIKER-B (center-right). The mission brief says: "Eliminate the enemy scout before it reaches your base." She notices the hook slot on SCOUT-A is highlighted with a glowing outline — the boot log just taught her about hooks.

She drags a hook into SCOUT-A's hook slot. A text field appears: "Channel name." She types `threat`. A second dropdown asks: "Trigger: ON_DETECT." She selects it. The hook config reads: "When SCOUT-A detects an enemy → send on `threat`."

On STRIKER-B, she toggles the context config to listen on `threat`. A faint dashed line appears on the minimap connecting SCOUT-A to STRIKER-B through the channel label "threat" in small cyan text.

She hits EXECUTE.

**Minute 0:30 — Sealed Watch (T=1–T=4)**
The board animates. SCOUT-A patrols left to right. An enemy scout (🤖) appears at tile G2, moving south. SCOUT-A's perception radius (faint circle around it) touches the enemy at T=3. A green cell flash pulses at SCOUT-A — detection. A thin cyan dashed line shoots from SCOUT-A toward STRIKER-B — signal sent on `threat`.

STRIKER-B's context bar gains a new pip (the threat signal arriving at T=4). STRIKER-B turns toward G2 and moves one tile closer.

**Minute 1:00 — Sealed Watch (T=5–T=8)**
But the enemy scout has moved. At T=4 it was at G2. By T=5 it's at G4 (fast mover, 2 tiles/tick). STRIKER-B is heading toward G2 — where the enemy *was*. At T=6, STRIKER-B reaches G2. The tile is empty. The enemy is at G6. STRIKER-B's confidence arc (the thin semicircle below its icon) has shifted from green to amber.

SCOUT-A detects the enemy again at G4 (at T=5). New signal sent. STRIKER-B receives it at T=6. But by T=7, the enemy has moved again. STRIKER-B is chasing a ghost. The sealed watch ends with the enemy scout slipping past and reaching the base at T=10. Mission failed.

**Minute 1:30 — Emotional Beat**
Mei-Lin frowns. The striker was heading the right direction. It just... kept going to the wrong tile. "It's like it's reading yesterday's newspaper," she mutters. The sealed watch ends. She notices STRIKER-B's confidence arc is solidly amber for the entire second half.

**Minute 2:00 — Inspector (Debrief)**
The inspector materializes. Mei-Lin clicks STRIKER-B. The decision trace lights up:

> T=5: Rule matched: "IF threat in context → MOVE toward threat source"
> Context entry used: S-07 (enemy at G2, created T=3, received T=4, age: **2 ticks**)
> Enemy actual position at T=5: **G4** (moved 2 tiles south)
> Targeting error: **2 tiles**

The "age: 2 ticks" label is amber. Mei-Lin hovers it. A tooltip says: "This signal was 2 ticks old when STRIKER-B used it. The enemy moved 2 tiles during that time."

She toggles on the Signal Trails overlay. A ghost marker appears at G2 — translucent, fading — while the real enemy icon sits at G4. The ghost trails behind reality, tick by tick. The divergence is visible as a growing gap between the ghost's path and the enemy's actual path.

"The data was too old," Mei-Lin says. She gets it. She hits RETRY.

**Minute 3:00 — Second Attempt (Plan Screen)**
This time, Mei-Lin removes STRIKER-B's channel listen on `threat`. Instead, she gives STRIKER-B its own perception — realizing that for fast targets, direct vision is better than relayed intelligence. Or she wires the scout to send more frequently. Or she repositions the striker closer to the expected enemy path to reduce the tiles-of-error from stale data.

The observation gap has taught her the first lesson: **freshness matters. Architecture has a latency cost.**

**UI Annotations:**
- Confidence arc: thin 4px semicircle below unit icon, green→amber→red gradient, subtle pulse on signal arrival
- Signal trail overlay: toggled via eye icon in inspector sidebar, renders translucent ghost markers along signal paths
- Decision trace age label: inline badge after "age:" showing ticks, color-coded (green ≤1, amber 2-3, red 4+)
- Targeting error line: thin red dashed line in inspector from where the unit went to where the enemy actually was

---

### Journey 2: Marcus, 35, StarCraft Veteran (Exploiting the Gap — Mission 7)

**Context:** Marcus has completed 6 missions. He understands relay chains, compression, channel topology, and the factory system. He's about to face a mission where the *enemy* exploits the observation gap against *him*. Marcus streams to 40 viewers on Twitch.

**Minute 0:00 — Plan Screen**
Mission 7: "Signal Flood." The brief warns: "Enemy units will attempt to overload your communication networks." Marcus has a factory producing scouts, relays, and strikers. He designs his standard architecture: scouts on the perimeter, relays in the center, strikers on standby.

His relay chain is Scout→Relay-A→Relay-B→Striker, compressing twice for clean intelligence. He knows this adds 3 ticks of latency but trusts the compression to filter noise. He types channel names: `eyes-east`, `filtered-east`, `strike-orders`. His channel map panel shows the topology as a clean left-to-right pipeline.

He hits EXECUTE.

**Minute 1:00 — Sealed Watch (T=1–T=15)**
The first 10 ticks are normal. Scouts detect enemies, signals flow through the relay chain, strikers engage with 3-tick-old but well-compressed intelligence. Marcus's stream chat says "clean runs gg."

At T=12, the enemy does something new. Three enemy units move into SCOUT-A's perception radius simultaneously, then scatter in different directions. SCOUT-A fires three hook signals on `eyes-east` in one tick. RELAY-A receives all three at T=13. Its buffer (12 slots) absorbs them fine, but its compress skill can only process one signal per tick. The other two sit in the buffer.

At T=14, two MORE enemy signals arrive while RELAY-A is still compressing the first batch. RELAY-A's buffer is filling fast. Its context bar shifts from green to amber. The confidence arc dims.

**Minute 1:30 — Sealed Watch (T=15–T=20)**
The enemy keeps sending units through the scout's perception — not attacking, just *appearing and disappearing*. Marcus's scout is generating 3-5 observations per tick. The relay chain is drowning. RELAY-A's buffer overflows at T=17 — **context overload**. A visible jitter/spark effect plays on RELAY-A. It's stunned for 1 tick. The compress output from T=17 is *lost*. A gap in the intelligence pipeline.

RELAY-B, downstream, gets no signal at T=18. STRIKER-A gets no orders at T=19. For one tick, the striker is blind.

At T=20, a real enemy striker (not a feint) rushes in from the east. SCOUT-A detects it immediately. But the relay chain is still recovering from the flood. By the time the "real threat" signal reaches STRIKER-A, it's 4 ticks old. The enemy striker is already adjacent. One-shot kill. STRIKER-A eliminated.

Marcus's chat erupts: "THEY BAITED THE RELAY" "observation gap diff" "get flooded lmao"

**Minute 2:00 — Inspector**
Marcus scrubs the timeline. He clicks RELAY-A at T=17 — the overload tick. The buffer state shows all 12 slots full: 5 enemy sightings (positions already stale), 3 compressed outputs queued, 2 channel acknowledgments, 2 observations from T=16. The overload trigger is visible: "Tick T=17: 4 new observations + 2 hook messages = 6 arrivals, 0 free slots. Context overload triggered."

He toggles the Signal Trails overlay. A cascade of ghost markers floods the east side of the board — dozens of translucent echoes from the feint units. The real threat's signal is barely visible among them, arriving late and buried.

"They used the observation gap as a weapon," Marcus tells his stream. "The feints weren't trying to kill me. They were trying to make my relay chain *slow*. And it worked."

**Minute 3:00 — Redesign**
Marcus redesigns. He adds a **priority filter** on RELAY-A: "Drop observations older than 2 ticks. Only compress signals tagged as 'striker-class'." He adds a second, parallel relay chain — a "fast path" that bypasses compression entirely for high-priority signals. The fast path is noisier (more EM emissions) but the data arrives 2 ticks sooner.

He's learned: **the observation gap is an attack surface. Deeper chains are exploitable. Redundant fast paths are insurance.**

**UI Annotations:**
- Context overload: 1-tick stun, sparking/jittering sprite, context bar flashes red, all buffer slots pulse once then compact
- Signal flood: rapid succession of green cell flashes (detection) overwhelming one area
- EM emissions: faint orange halo around transmitting units, larger halo = more transmissions
- Fast path vs. deep path: in the channel map panel, parallel routes shown as two lines between same endpoints, labeled with latency ("2 ticks" vs "4 ticks")

---

### Journey 3: Aisha, 14, First Strategy Game (Learning the Gap — Missions 1-4 Arc)

**Context:** Aisha has never played a strategy game. She picked up Robot Uprising because her cousin showed her a TikTok of someone's relay chain overloading and said "it's like group chat but for robots." She's playing on a tablet, touching and dragging.

**Minute 0:00 — Mission 1 (No Gap)**
The board has one pre-placed scout and one striker. Enemies are slow (1 tile per 2 ticks). The scout sees an enemy and Aisha watches the context bar fill with an observation. The rules are pre-configured: "If enemy detected → move toward." The striker moves. Enemy eliminated. Aisha touches the enemy tile and it flashes red. "Cool," she says.

She doesn't know the observation gap exists. It's 1 tick, the enemy barely moves, and the striker has direct perception anyway. Everything feels instantaneous.

**Minute 5:00 — Mission 2 (Still No Gap)**
More units, more rules. Aisha drags rule priorities. She learns that the first matching rule fires. She puts "evade if enemy adjacent" above "move toward threat." Her scout dodges an enemy. She feels clever.

The observation gap is still invisible. All her units have direct perception. No hooks yet.

**Minute 15:00 — Mission 3 (The Gap Appears)**
The boot log scrolls: "SUBSYSTEM INITIALIZED: Hook Communication. Signal propagation: 1 tick per hop." Aisha reads it but it doesn't click yet.

She configures her first hook: scout detects → send on `alert`. Striker listens on `alert`. She hits EXECUTE.

The scout spots a fast enemy. Signal fires. The striker turns toward the enemy's *old position*. Aisha watches the striker run to an empty tile. "Wait, why did it go there? The enemy moved!"

She's confused but not frustrated — the mission is forgiving. She wins anyway because there's a second, slower enemy that the striker catches easily. But the memory of the first miss stays.

In the inspector, she clicks the striker. The decision trace says: "Age: 2 ticks." She doesn't fully understand yet, but she sees the number. She taps the Signal Trails toggle by accident. Ghost markers appear. "Oh! That's where the robot *thought* the enemy was!" She drags the timeline scrubber. The ghost stays put while the real enemy moves. "It's like... the message was too slow."

**Minute 20:00 — Mission 4 (The Gap Costs Her)**
Mission 4 has the designed failure: a flanking enemy that the relay chain can't track fast enough. Aisha loses. She frowns. Opens the inspector. Signal Trails are on by default now (the game remembered her toggle).

She watches the ghost diverge from reality. The striker chasing the ghost. The enemy slipping past. She says: "The robots are too slow at talking to each other."

She goes back to the plan screen. She removes the relay from the chain and wires the scout directly to the striker. The signal is noisier — more data, less compressed — but it's 1 tick faster. She retries. This time the striker catches the flanker.

Aisha doesn't use the words "observation gap" or "latency." But she understands the concept: **messages take time, and time matters when things move fast.**

**UI Annotations:**
- Boot log: monospace text scrolling in a terminal-style panel, cyan text on dark background, "Signal propagation: 1 tick per hop" highlighted in amber
- Signal Trails toggle: eye icon in inspector sidebar, persists across sessions once activated
- Ghost markers: translucent unit icons at 40% opacity, no outline, fading at edges, slowly pulsing
- Timeline scrubber: horizontal slider below the board, tick marks as evenly spaced pips, draggable thumb, ghost and real positions update as player scrubs

---

## Interaction Effects

### With Buffer Model (2.01)
The observation gap and buffer model create a compounding failure mode: stale data fills buffer slots that could hold fresh data. A unit drowning in old observations has both a *quality* problem (stale data) and a *capacity* problem (no room for fresh data). FIFO eviction helps (oldest ejected first), but in a flood scenario, even FIFO can't save you — new stale data replaces old stale data, and nothing is fresh.

### With Hook Semantics (3.09)
Hook chaining multiplies the gap. If hooks can cascade (fire-and-forward in the same tick), the gap is partially compressed. If they're strictly delayed (1 tick per hop), the gap scales linearly with chain depth. The chaining model directly determines the "cost" of architectural depth. The recommended "Progressive Chaining" model (3.09, Option F) means early missions have large gaps (no chaining) that shrink as hot-mode chaining unlocks — teaching the gap's cost before giving tools to mitigate it.

### With Spatial Routing (2.14)
If channels have range limits, the observation gap becomes *spatial* as well as temporal. A scout far from a relay adds physical distance to the latency equation. The gap becomes: communication hops + physical distance + buffer processing time. This makes relay *placement* matter for latency, not just relay *existence*.

### With Information Warfare (Enemy Flooding)
The observation gap is the primary attack surface for information warfare. Enemy strategies that exploit the gap: (1) **Feint flooding** — generate many observations to overload relay chains, burying real threats in noise. (2) **Position flickering** — move in and out of scout perception rapidly, generating contradictory observations that confuse downstream rules. (3) **Timing attacks** — time real attacks to coincide with moments when the relay chain is processing a flood, maximizing the effective gap.

### With Tagging System
Tags persist on the board independently of the observation gap. A tagged enemy remains tagged regardless of how stale the observer's data is. This makes tagging a *partial antidote* to the gap: "I may not know where the enemy is right now, but my tag is still on it, and any unit that can see the tag has current data." Tagging creates a persistent, spatial source of truth that doesn't degrade with relay chain depth.

---

## The TikTok Clip

**The 15-second clip:** Split screen. Left side: a well-designed architecture with 1-hop paths. Right side: the same mission with a 4-hop deep relay chain. On the left, the striker snaps to the enemy's position — crisp, precise, immediate. On the right, the striker moves to where the enemy *was three ticks ago* — an empty tile. The enemy is already behind it. The striker turns, too late. Caption: "your architecture has lag."

Second variant: A relay chain overloading in slow motion. The buffer bar fills green, then amber, then red. Sparks fly. The relay jitters. The signal line goes dark. Downstream, the striker stands motionless, waiting for orders that will never come. Caption: "when the group chat is too active and your brain stops working."

---

## Comparable Games and Media

| Game/Reference | Relevant Mechanic | Lesson for Robot Uprising |
|---|---|---|
| StarCraft fog of war | Binary visibility, grey ghost buildings | "Ghost data" visual language — show *what was known*, fading over time |
| Into the Breach | Perfect information, telegraphed attacks | The *contrast*: Robot Uprising is anti-Breach. Uncertainty from temporal delay, not hidden intent |
| Trick of the Light (WPI) | Per-unit private memory, physical info exchange | Direct architectural precedent. Each agent's context window IS private memory |
| R.U.S.E. | Information warfare (decoys, jamming, decryption) | EM emissions + buffer flooding = info warfare. The gap is a weapon |
| Factorio logistics network | Item transport delay, throughput bottlenecks | Relay chains are logistics networks for information, not items. Same optimization patterns (parallel paths, priority lanes, throughput balancing) |
| Real-world network engineering | Latency, jitter, packet loss, bufferbloat | The game's mechanics are 1:1 with real network concepts. The observation gap IS network latency |
| Battlestar Galactica (TV) | FTL communication delay, acting on old intelligence | Dramatic tension of "the fleet jumped 30 minutes ago, but we're acting on their last known position" |
| Submarine warfare | Sonar contacts going stale, bearing-only tracking | Tracking a target with decreasing confidence as data ages — pure observation gap gameplay |

---

## Open Questions

1. **Should the observation gap be numerically displayed during sealed watch, or only in the inspector?** Showing "T-3" badges during the sealed emotional phase might make it too analytical. But hiding it entirely means the player can't *feel* the gap until debrief.

2. **Can the enemy's observation gap be exploited by the player?** If enemy units also have relay chains with latency, the player could design fast-moving scouts that outrun enemy intelligence. "I move faster than their observation loop" as a viable strategy.

3. **Is there a minimum viable gap?** At 1 tick perception lag and 1 hop = 1 tick, the minimum gap for any relayed intelligence is 2 ticks. Is that enough to feel meaningful on an 8x8 board where units move 1-2 tiles per tick? Or does the gap need to be artificially widened (e.g., 2 ticks per hop) for slower-paced missions?

4. **Should the gap be quantified as a first-class metric in the plan screen?** A "Maximum Signal Latency" readout in the channel map panel showing the longest path in your topology. The player can see "my deepest chain is 4 hops = 4 ticks" before executing. This makes the gap plannable, not just diagnosable.

---

## New Aspects Discovered

- **2.20a — Confidence meter as a first-class unit stat:** Full design of the per-unit confidence metric — calculation formula (weighted average of buffer entry ages), display in plan screen preview, use as a rule condition ("IF confidence < 50% → fallback to patrol"), and how the player learns to read and optimize for it
- **2.20b — Enemy observation gap as exploitable weakness:** Design of player strategies that outrun enemy intelligence — fast scouts that reposition before enemy relay chains update, "stealth through speed" as a tactic distinct from EM silence, asymmetric gap exploitation
- **2.20c — Maximum Signal Latency readout in the plan screen channel map:** A real-time topology analysis showing the longest signal path in the player's architecture, with a warning threshold; how this diagnostic shifts from hidden (missions 1-4) to visible (mission 5+) to optimized (missions 8-10)
- **2.20d — The "observation gap budget" as a design constraint per mission:** Mission designers set a target maximum observation gap; if the player's architecture exceeds it, the mission becomes significantly harder; the gap budget as an implicit difficulty dial that teaches tighter architecture without explicit difficulty settings
- **2.20e — Temporal fog vs. spatial fog: the philosophical design distinction:** A cross-cutting analysis comparing Robot Uprising's temporal uncertainty model with traditional spatial fog of war; what each model teaches the player, what each makes visceral, and why Robot Uprising's choice is core to the "you're an AI, not a general" identity
