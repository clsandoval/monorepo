# 2.23 — Echo Suppression as Agent Mechanic

## The Option

When a signal propagates through a peer-to-peer mesh network, the same signal can arrive at a destination **multiple times through different paths**. Scout-Alpha detects a threat and sends it on recon-net. Relay-A receives it and forwards on strike-net. Relay-B also receives it and forwards on strike-net. Striker-Bravo now receives two identical threat reports — consuming two buffer slots for one piece of information. In a buffer-constrained game, duplicates are poison.

Echo suppression is the mechanic of **deduplicating signals** within the agent communication architecture. It transforms a hidden failure mode (silent buffer waste from duplicate signals) into an explicit design dimension that the player must manage.

### Signal Identity Model

Every signal in the game carries an implicit identity composed of:
- **Source agent ID** — which agent originally generated the signal (not who forwarded it)
- **Tick timestamp** — which tick the signal was generated
- **Signal type** — the semantic content category (threat, terrain, resource, status)
- **Content hash** — a fingerprint of the signal's actual data

Two signals are "echoes" (duplicates) if they share the same source + tick + type. Content hash provides additional specificity: the same scout detecting the same enemy on the same tick from a slightly different angle might produce two signals with identical source/tick/type but different content — these are "near-duplicates" where deduplication is desirable but lossy.

### Five Design Positions

**Position A — "No Suppression" (Duplicates Are the Player's Problem)**
The game provides no built-in deduplication. If a signal arrives twice, it consumes two buffer slots. The player must design architectures that avoid creating duplicate paths — or accept the buffer cost. This is the purest expression of the "architecture is the game" thesis: mesh topologies are powerful but costly, tree topologies are clean but fragile.

**Position B — "Automatic Suppression" (Duplicates Never Reach the Buffer)**
The system silently drops any signal whose source+tick+type matches a signal already in the buffer. The player never sees duplicates. This simplifies the game but removes a design dimension — mesh topologies become strictly superior to trees (multiple paths with no duplication cost).

**Position C — "Suppression as Skill" (Relay Deduplicate Skill)**
A new skill — **deduplicate** — available to Relay units. When enabled, the relay checks incoming signals against its buffer and drops matches. This consumes one of the relay's skill slots and adds 1 tick of processing latency (same as compress). The player must choose: deduplicate (clean signals, latency cost, skill slot cost) or raw forward (noisy signals, no latency, skill slot free for compress/filter/amplify).

**Position D — "TTL Decay" (Signals Have a Hop Limit)**
Each signal carries a **TTL (time-to-live)** counter that decrements with each hop. When TTL reaches 0, the signal is dropped. The player configures TTL per hook — short TTL prevents echoes by limiting propagation distance, long TTL allows deep chain routing but risks echo loops. This creates a natural echo suppression mechanism: duplicates arriving via longer paths have lower TTL and are dropped first by eviction priority.

**Position E — "Configurable Deduplication Rules" (Recommended)**
The player configures deduplication behavior per unit through the context config panel:
- **Accept all** — no deduplication (default for new players, simplest)
- **Drop exact matches** — suppress signals with identical source+tick+type already in buffer
- **Drop near-matches** — suppress signals with identical source+tick (regardless of type)
- **First-arrival-wins** — once a signal from source X about topic Y is in the buffer, all subsequent signals from X about Y are dropped until the original is evicted

These rules appear as a dropdown in the context config section of the blueprint editor, under a "Deduplication" header. The default is "Accept all" — echoes pass through. The player discovers the need for deduplication when mesh topologies create visible buffer waste in the Inspector.

### Teaching Sequence

**Missions 1-4:** No echo problem. Hand-configured units use tree topologies (scout → relay → striker). No branching paths, no duplicates.

**Mission 5:** First blueprint mission. Player creates multiple scouts on the same channel. If two scouts detect the same enemy simultaneously, the relay receives two identical signals. The relay's buffer shows duplicate entries. The Inspector highlights duplicates with a subtle repeating icon (two overlapping squares). The player notices buffer waste but can solve it by adjusting patrol routes (scouts cover different sectors, don't double-detect).

**Mission 7:** Pressure test with constrained resources. The player builds a mesh topology for redundancy (two relays, cross-linked channels). Echoes become a real problem — signals bouncing between relays create feedback-like loops. Buffer waste is now 20-30% of capacity. The boot log introduces deduplication: "MODULE: Signal deduplication — CAPABILITY: Suppress duplicate observations already present in context window."

**Mission 8+:** Deduplication as tactical choice. Enemy noise flooding makes mesh topologies attractive (redundancy against relay destruction), but mesh creates echoes. The player balances redundancy against echo cost.

---

## Player Journeys

#### Journey: Marcus, 42, DevOps engineer, Mission 7 (Pressure Test)

**Context:** Marcus built a redundant relay mesh in Mission 6 after losing a mission when his single relay was destroyed. His two relays cross-link: Relay-A forwards to Relay-B and vice versa, both forward to the striker channel. It's robust — kill one relay and the other continues. But Mission 7's constrained resources make buffer efficiency critical.

**Minute 0:00 — The Echo Discovery**
Plan screen. Marcus's mesh architecture: 3 scouts on recon-net, 2 relays (both listen on recon-net, both forward on strike-net, each also forwards to the other on relay-sync). Ghost units show the channel wiring — a web of colored lines connecting the relays to each other and to everything else. Marcus hits EXECUTE.

**Minute 0:30 — The Sealed Watch**
The battle unfolds. Scouts detect enemies and signal on recon-net. Both relays receive. Both relays forward on strike-net. The striker receives **two identical threat reports** — one from each relay. Its buffer shows: [threat-north, threat-north, objective, signal-from-relay-A, signal-from-relay-B]. Two of eight slots consumed by the same information. Worse: Relay-A forwards to Relay-B on relay-sync. Relay-B receives the signal it already has and forwards it again on strike-net. The striker now has **three copies** of the same threat. The buffer bar on the striker pulses amber.

**Minute 1:30 — The Inspector Reveals**
Inspector: striker's context window chart shows rapid filling. The click-to-inspect panel reveals the contents: at tick 6, three identical threat-north entries from different forwarding paths. A small icon — two overlapping cyan squares — marks the duplicates. The action trace shows the striker evaluated all three but only acted on the first. The other two were pure buffer waste.

Marcus traces the signal genealogy: Scout-Alpha generated the signal at tick 3. It arrived at Relay-A at tick 4 and Relay-B at tick 4. Relay-A forwarded to strike-net at tick 5 AND to relay-sync at tick 5. Relay-B received the relay-sync copy at tick 6, forwarded it on strike-net at tick 7. The striker received three copies at ticks 5, 5, and 7.

**Minute 2:30 — The Deduplication Config**
Marcus opens the striker blueprint's context config. Under the filter/eviction section, he finds a new option: "Deduplication: [Accept all ▼]". He changes it to "Drop exact matches." The tooltip explains: "Signals matching an existing entry (same source, same tick, same type) will be dropped on arrival."

He also configures the relays: "Drop exact matches" on both. This prevents the relay-sync echo loop — when Relay-B receives a signal from Relay-A that originated from Scout-Alpha, and Relay-B already has that signal from recon-net directly, the duplicate is dropped.

**Minute 3:30 — The Clean Mesh**
Execute. Same mesh topology, but now deduplication prevents buffer waste. The striker receives one copy of each threat signal. Relay-sync still provides redundancy — if Relay-A is destroyed, Relay-B still receives via recon-net directly. The mesh's robustness is preserved; its echo cost is eliminated.

**Minute 4:30 — The Tradeoff Moment**
Marcus notices a subtlety in the Inspector: "Drop exact matches" dropped a signal at tick 12 that looked like a duplicate (same source, same tick, same type) but had a slightly different content — the scout had moved one tile between generating the first and second observation, producing two signals about the same enemy from different angles. The first included the enemy's facing direction; the second didn't. "Drop exact matches" kept the first and dropped the second. In this case, that was fine. But what if the second had additional information?

He switches to "First-arrival-wins" on the striker. Now only one signal per source per topic is kept, regardless of exact match. More aggressive deduplication, slightly more information loss. The tradeoff is visible in the Inspector's deduplication panel: "3 signals suppressed, 1 had unique content."

**Minute 6:00 — Resolution**
The mesh architecture runs clean. Buffer utilization dropped from 87% to 52%. Zero stuns. The deduplication rules are the difference between a wasteful mesh and an efficient one. Marcus mutters: "I just implemented an event bus with deduplication. This is literally my Kafka consumer group config."

**UI Annotations:**
- **Deduplication dropdown**: In context config section of blueprint editor, below the listen/ignore toggles. Four options in dropdown. Default "Accept all" for backwards compatibility.
- **Duplicate indicator in Inspector**: Two overlapping cyan squares icon next to buffer entries that match another entry. Hover shows: "Duplicate of entry from [source] at tick [N]."
- **Deduplication stats in channel metrics**: "recon-net: 14 signals sent, 3 suppressed by deduplication, 11 delivered."

---

#### Journey: Aira, 15, first strategy game, Mission 5 (Assembly Line)

**Context:** Aira just unlocked the factory. She's building her first blueprints by copying what worked in Missions 1-4. She creates two scouts because "more eyes is better." Both scouts patrol overlapping areas.

**Minute 0:00 — The Double Vision**
Plan screen. Two Scout-Alpha blueprints with identical configs. Both patrol the same sector (Aira hasn't learned sector division yet). Both have hooks: on_detect → send on recon-net. Relay-Main listens on recon-net, forwards on strike-net. Striker-Bravo listens on strike-net.

**Minute 0:30 — The Sealed Watch**
Both scouts detect the same enemy at tick 4. Both send on recon-net. The relay receives two identical signals and forwards both on strike-net. The striker's buffer suddenly has two entries about the same enemy. Its context bar jumps from 2/8 to 4/8 in one tick. "Why did it go yellow so fast?"

**Minute 1:00 — The Inspector**
Aira clicks the striker in the Inspector. Buffer at tick 5: [threat-east (from Scout-1), threat-east (from Scout-2), patrol-route, empty, empty, empty, empty, empty]. She sees the two overlapping-squares icon. "Oh, it's the same enemy. Both scouts saw it." She drags the timeline forward. At tick 8, four more duplicates arrive — the scouts detected again. Buffer: 6/8. Amber zone.

**Minute 1:30 — The Intuitive Fix**
Aira doesn't know about deduplication settings yet. Her intuitive response: "I should make them patrol different areas so they don't see the same thing." She adjusts patrol rules: Scout-1 patrols north, Scout-2 patrols south. This eliminates most duplicates by preventing double-detection.

**Minute 2:30 — The Boot Log (Mission 7)**
Two missions later, the boot log introduces deduplication. Aira reads: "MODULE: Signal deduplication — CAPABILITY: Suppress duplicate observations already present in context window." She opens the context config on her relay and changes to "Drop exact matches." A tooltip animates: a 3-tick micro-scenario showing two identical signals arriving at a relay, one passing through and one dissolving. "So it just ignores the copy? Like my email spam filter!"

**Minute 3:30 — Resolution**
With deduplication enabled, Aira rebuilds the overlapping patrol. Both scouts covering the same area now provides redundancy (if one is destroyed, the other continues) without buffer waste. She's learned the difference between **redundancy** (good — multiple paths) and **waste** (bad — duplicate data consuming limited capacity).

**UI Annotations:**
- **Animated tooltip for deduplication**: A 3-tick micro-scenario in the context config panel. Two identical signals approach a unit. First enters the buffer (green glow). Second hits, matches, and dissolves into particles (amber poof). The buffer shows only one entry. Plays on hover over the deduplication dropdown.
- **Overlapping-squares icon**: 12x12px cyan icon with two offset squares. Appears next to buffer entries in the Inspector that have a matching entry. Universal visual language for "duplicate."

---

#### Journey: Kwame, 28, streamer, Mission 9 (Arms Race)

**Context:** Kwame is building a complex mesh architecture for the factory-vs-factory mission. He's using redundant relays, cross-linked channels, and a command agent monitoring everything. Chat is warning him about "echo loops."

**Minute 0:00 — The Deliberate Mesh**
Plan screen. Kwame's architecture is a full mesh: 4 scouts, 2 relays (cross-linked), 3 strikers, 1 command agent. Every scout sends on recon-net. Both relays listen on recon-net, forward on strike-net, and sync with each other on relay-sync. The command agent listens on all channels. Channel map shows a dense web of connections. Chat: "echo city" "rip your buffers" "dedup dedup dedup."

**Minute 0:30 — The Echo Experiment**
Kwame deliberately runs the mesh WITHOUT deduplication first. "Let's see how bad it gets, chat." Execute. Sealed watch: the first enemy detection generates a cascade. Scout-1 sends on recon-net (1 signal). Both relays receive (2 deliveries). Both relays forward on strike-net (2 signals). Both relays sync on relay-sync (2 signals). Each relay receives the sync (2 more deliveries). Each relay forwards the sync copy on strike-net (2 more signals). Strikers receive 4 copies of the original detection. The command agent receives 6 copies across its channels.

The buffer bars on every unit spike amber simultaneously. The command agent, with its 14-slot buffer, fills halfway from one enemy detection. Chat is counting: "6 COPIES" "ONE ENEMY SIX SIGNALS" "your relay is a xerox machine."

**Minute 1:30 — The Dedup Sweep**
Inspector: command agent buffer at tick 5 shows 8/14 slots consumed, 6 of which are duplicates. Kwame opens each blueprint and sets deduplication to "Drop exact matches" on relays and "First-arrival-wins" on the command agent. He also adds a rule on each relay: "do not forward signals already forwarded this tick" — this prevents the relay-sync → strike-net re-forwarding.

**Minute 2:30 — The Clean Mesh**
Execute. Same topology, deduplication active. One enemy detection generates: Scout-1 sends (1 signal). Both relays receive (2). Relay-A forwards on strike-net (1 signal) and relay-sync (1 signal). Relay-B drops the strike-net forward (duplicate of Relay-A's forward, same source+tick+type already forwarded). Relay-B drops the relay-sync signal (duplicate already in buffer from recon-net). Strikers receive 1 copy. Command receives 1 copy.

Buffer utilization drops from 57% to 21%. Chat: "CLEAN" "that's a 63% reduction" "dedup diff is insane." Kwame shows the before/after debrief side by side. "Deduplication is the difference between a mesh that works and a mesh that chokes on its own traffic."

**Minute 4:00 — The Edge Case**
Kwame's deduplication has a cost: when Relay-A is destroyed at tick 18, Relay-B's "First-arrival-wins" config means it already dropped signals that came through Relay-A earlier. The duplicate path that would have provided redundancy was suppressed. For 2 ticks after Relay-A's death, the strikers receive no signals until new detections flow directly through Relay-B.

Chat catches it: "dedup killed your redundancy for 2 ticks." Kwame adjusts: he changes the relay dedup to "Drop exact matches" instead of "First-arrival-wins." Now only truly identical signals are dropped — signals from different sources about the same topic both pass through. Relay-B still has its own direct-from-recon-net copy even after Relay-A dies.

**Minute 5:30 — Resolution**
The final architecture balances deduplication with redundancy. "Drop exact matches" eliminates the echo loop without sacrificing the mesh's resilience. Chat votes on the best dedup setting with channel points. "This is literally the distributed systems consistency vs. availability tradeoff. Chat, we're learning CAP theorem."

**UI Annotations:**
- **Echo count overlay**: A toggle in the Inspector that shows a number badge on each signal in the buffer indicating how many duplicates were suppressed. "×3 suppressed" on a signal means three copies were dropped.
- **Before/after split**: The Inspector can show two runs side by side (from Run History). Kwame uses this to show the mesh without dedup vs. with dedup — dramatically different buffer charts.

---

## Strengths

- **Teaches a real distributed systems concept.** Signal deduplication in mesh networks is a fundamental distributed systems challenge (idempotency, exactly-once delivery, dedup keys). The game makes it visceral.
- **Creates meaningful topology tradeoffs.** Without echo suppression, mesh topologies are strictly worse than trees (same redundancy, more buffer waste). With echo suppression, mesh becomes viable but requires configuration. This enriches the architectural design space.
- **Progressive complexity.** Tree topologies in early missions have no echo problem. Mesh topologies in late missions introduce it. The mechanic scales with the player's sophistication.
- **Emergent from locked mechanics.** Buffer constraints + multi-path channel routing + fire-and-forget semantics naturally produce echoes. Deduplication is the solution to a problem the locked design inherently creates.

## Weaknesses

- **Complexity cost.** Deduplication rules add another configuration dimension to an already complex blueprint editor. Some players may find it overwhelming.
- **Invisible problem.** Echoes are silent — the player sees buffer fill faster than expected but may not identify duplicates as the cause without Inspector investigation. The overlapping-squares icon helps, but only in the Inspector (post-execution).
- **Risk of "always on."** If "Drop exact matches" has no downside, players will enable it universally and the mechanic becomes a tax (something you must do) rather than a choice (something you weigh). The tradeoff with redundancy (Position E discussion in Kwame's journey) is essential.
- **Scope creep potential.** Signal identity, TTL, and deduplication rules could balloon into a complex subsystem that distracts from the core game. Position E (configurable rules) must be kept to 3-4 options maximum.

## Interaction Effects

- **Channels (locked):** Channels create the multi-path routing that produces echoes. The channel system IS the echo generator. Deduplication is the channel system's counterpart.
- **Compress skill (locked):** Compress reduces buffer contents but doesn't deduplicate — it randomly halves, which might keep a duplicate and drop a unique. Deduplication + compress are complementary: dedup first (remove copies), then compress (reduce volume).
- **Relay as hub (locked):** Relays are natural deduplication points in the architecture. A relay that deduplicates before forwarding cleans the signal stream for all downstream listeners. This reinforces the relay's role as the "infrastructure" unit.
- **Context overload stun (locked):** Echoes accelerate buffer fill, increasing stun frequency. Deduplication reduces stun risk — making it a defensive mechanic as well as an efficiency one.
- **2.21 Context efficiency asymmetry:** Deduplication is an efficiency tool. Lean architectures that also deduplicate are extremely efficient. Fat architectures that don't deduplicate waste capacity on copies. This amplifies the efficiency asymmetry.
- **2.22 AI adversary configs:** An adversarial AI could learn to exploit mesh architectures by targeting the deduplication timing — destroying a relay right after dedup has suppressed its redundant copies, creating a brief information blackout.
- **EM emissions (locked):** Deduplication reduces the number of forwarded signals, which reduces EM emissions. Clean mesh = quiet mesh. Another efficiency benefit.

## Comparable Games/Media

- **TCP/IP networking:** TCP's sequence numbers and ACK-based deduplication is the real-world analog. Robot Uprising's signal identity (source + tick + type) maps to TCP's sequence numbering. The game teaches network protocol concepts through play.
- **Apache Kafka:** Consumer group deduplication, idempotent producers, exactly-once semantics. Kafka's design decisions around duplicate handling map directly to the five design positions.
- **Factorio:** Circuit network signals can create feedback loops when combinators read their own output. Players learn to use pulse mode vs. toggle mode to prevent signal echo. Same fundamental problem, different representation.
- **Screeps:** Inter-room messaging has no built-in deduplication. Players build their own message ID systems and dedup logic. The community-developed patterns could inform Robot Uprising's built-in options.

## Sensory Description

Echoes are **visually subtle but aurally distinct**. In the sealed watch, a signal arriving at a unit produces a brief green flash on the tile and a soft ping. When an echo arrives — a duplicate of a signal already in the buffer — the flash is **amber instead of green** and the ping has a **hollow, metallic quality** — the same note but with the resonance stripped out, like tapping an empty can instead of a full one. The player hears the difference before they see it in the buffer.

When deduplication suppresses an echo, the arriving signal produces a brief **dissolving particle animation** — tiny cyan pixels scatter outward from the unit's tile and fade in 200ms. No sound. The silence IS the sound of deduplication working. In a mesh architecture with heavy echo suppression, the board is dotted with these silent dissolutions — little bursts of suppressed redundancy.

In the Inspector, the deduplication story is **clinical and precise**. The buffer contents panel shows suppressed entries as **ghosted rows** — present in the signal history but rendered at 30% opacity with a strikethrough. Hovering a ghosted entry highlights the surviving entry it was a duplicate of, connected by a thin amber dashed line. The deduplication stats panel shows a simple bar: "Delivered: 23 | Suppressed: 7 | Ratio: 77%." The ratio is the architecture's deduplication efficiency — lower is better. A 50% ratio means half of all signals were wasted copies.

The context window chart shows deduplication as **negative space**. With dedup off, the chart fills faster (steeper incline, higher peaks). With dedup on, the same battle produces a shallower, calmer chart. The difference between the two charts — the vertical gap — is the echo cost that deduplication eliminated. The player sees their architecture's efficiency improvement as literal white space between the two curves.
