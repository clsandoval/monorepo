# 2.05c — Enemy-Targeted Shared Buffer Attacks

**Aspect:** 2.05c — Enemy-targeted shared buffer attacks
**Wave:** 2 (Core Mechanic Variations)
**Category:** core-mechanic
**Parent:** 2.05 — Shared buffer

---

## The Design Question

Shared buffers concentrate knowledge — and concentrated knowledge is a concentrated target. The existing counter-intelligence mechanic (2.16) explores generic information warfare (wiretaps, echo chambers, false flags). But shared buffers create *specific* vulnerabilities that don't exist with private buffers. A noise bomb that fills one Scout's 6-slot private buffer is annoying. The same noise bomb targeting a 20-slot shared pool stunts an entire squad simultaneously. This aspect explores the offensive toolkit for attacking shared memory specifically: what attacks exist, how do they work mechanically, and what counter-architectures do they demand?

The core tension: **shared buffers' greatest strength (zero-latency intra-squad coordination) is also their greatest weakness (single point of catastrophic failure).** Every attack here exploits that concentration. The player must learn to balance the power of shared knowledge against the risk of shared vulnerability — a lesson that maps directly to real-world distributed systems architecture (centralized databases vs. distributed stores, monoliths vs. microservices).

---

## Five Attack Types

### Attack 1 — "The Noise Bomb" (Volume Overload)

The enemy generates a burst of garbage data targeting the shared pool, filling it to capacity and triggering a squad-wide stun.

**Mechanical rules:**
- An enemy Specialist unit uses the "hack" skill to inject N entries of NOISE-type data into a targeted shared pool
- N is determined by the Specialist's hack power: base 4 entries, +2 per additional Specialist in range
- The NOISE entries have no useful content — they're random garbage formatted as valid data (preventing simple type-based filtering)
- If the shared pool was at 15/20 capacity and 6 NOISE entries arrive, the pool hits 21/20 — overflow, squad-wide stun for 1 tick
- Even if the pool doesn't overflow, NOISE entries evict legitimate data under FIFO, degrading the squad's intelligence
- The Noise Bomb is detectable: the attacking Specialist emits a strong EM pulse (double normal hack emission) during the attack tick. A vigilant architecture can detect the pulse and prepare.

**Counter-architectures:**
- **Context config filtering**: Configure the shared pool to IGNORE the NOISE type entirely. But this is brittle — real enemies can label their noise as THREAT or POSITION to bypass type filters.
- **Buffer headroom**: Maintain a buffer utilization below 70% (leave 6+ empty slots in a 20-slot pool). The "headroom rule" absorbs noise bursts without overflowing. Cost: reduced effective capacity.
- **EM early warning**: A Scout's perception detects the Specialist's EM pulse before the attack lands. If a hook fires on "EM_DETECTED → FLUSH_POOL" (clearing all entries older than 2 ticks), the pool has room for the incoming noise without overflowing. The noise replaces recently flushed entries, not critical intelligence.
- **Pool segmentation**: Split the squad's shared pool into two smaller pools (sub-squads of 2+1). A noise bomb hits one pool, not both. But this sacrifices zero-latency communication within the full squad.

### Attack 2 — "The Poison Pill" (Targeted Disinformation)

The enemy injects false but correctly-typed data into the shared pool — fake THREAT positions, fabricated ORDER signals, spoofed POSITION data that looks legitimate.

**Mechanical rules:**
- An enemy Specialist uses "hack" to inject 1-3 entries of correctly-typed data with false content
- Example: a THREAT entry claiming "enemy at E4" when no enemy is there, causing the Striker to waste movement chasing a phantom
- Poison pills are indistinguishable from legitimate data in the buffer display — same type, same format, no visual indicator (unless the player has authentication configured)
- The false data persists until evicted or until a unit's own perception contradicts it
- Contradiction detection: if a Scout is at E4 and sees no enemy, a rule can compare perception ("no enemy at E4") against buffer contents ("THREAT: enemy at E4") and flag the discrepancy

**Counter-architectures:**
- **Perception-buffer cross-check**: Rules that compare direct perception against shared pool claims. "IF I see position X AND pool says THREAT at X AND I see no threat THEN mark pool entry as SUSPECT." Requires the verifying unit to be at the claimed position — expensive but reliable.
- **Source tagging**: If entries in the shared pool carry source metadata (which unit wrote them), the player can add rules: "IGNORE entries from unknown sources." But enemy hack injects entries with spoofed source tags, so this only works if authentication is implemented.
- **Authentication skill**: A locked skill (Mission 8+) that cryptographically signs entries. Only entries signed by authenticated units are trusted. Unsigned entries are quarantined in a separate sub-pool. The Specialist's "extract" skill can crack authentication given enough buffer space — creating an arms race.
- **Staleness heuristic**: Fresh perception data always overrides older pool entries. If the pool contains "enemy at E4, age 3 ticks" and the Scout's live perception shows "no enemy at E4, age 0 ticks," the fresher data wins. This defense is automatic under decay buffers (2.03) but requires explicit rules under FIFO.

### Attack 3 — "The Cache Flood" (Sustained Pressure)

Instead of a single burst, the enemy maintains continuous low-level noise injection into the shared pool, keeping it perpetually near capacity. No single tick overflows, but the pool has no headroom and any spike in legitimate data causes a stun.

**Mechanical rules:**
- One or more enemy Specialists inject 1-2 NOISE entries per tick into the target pool
- The pool runs at 85-95% capacity permanently — never overflowing but always on the edge
- Legitimate data from the squad's own units competes with the noise for the remaining 1-3 slots
- Any spike (Scout enters a target-rich area, Relay receives a burst of hook messages) pushes the pool over
- The attack is harder to detect than a Noise Bomb — the EM emissions from 1-2 hack entries per tick are low, blending into normal background noise

**Counter-architectures:**
- **Eviction priority**: Configure the pool's eviction policy to prioritize NOISE/UNKNOWN types for eviction. Noise entries get evicted first, legitimate data persists. But this requires accurate type classification — mislabeled noise survives.
- **Active defense — "The Janitor"**: A Relay in the shared pool configured with a rule: "IF pool_utilization > 80% AND oldest_entry.age > 2 THEN evict oldest." The Relay acts as a garbage collector, proactively clearing stale data to maintain headroom. Costs one action per tick.
- **Pool quarantine**: Entries from external sources (hack-injected) enter a quarantine sub-pool (2-3 slots) that doesn't count toward the main pool's capacity. Quarantined entries are reviewed by a filter skill before being admitted. But this creates a processing bottleneck at the quarantine boundary.

### Attack 4 — "The Splitter" (Squad Fragmentation)

The enemy kills the physical nexus of the shared pool — the Relay or Command unit hosting it. Under hub-and-spoke (Model B) or tiered (Model E), this destroys the shared pool entirely. Under blackboard (Model A), killing any squad member reduces pool capacity by that unit's contribution.

**Mechanical rules:**
- **Hub-and-spoke (Model B)**: Killing the hub unit destroys the shared cache completely. All spoke units revert to private-buffer-only mode. Immediate information fragmentation.
- **Blackboard (Model A)**: Killing a squad member reduces pool capacity by their buffer contribution (adjusted by pooling coefficient). A 20-slot pool (from 26 raw capacity × 0.8) losing a Scout (6 raw slots) shrinks to `floor((26-6) × 0.8) = 16` slots. If the pool held 18 entries at the time of death, instant overflow — squad stun + 2 entries evicted.
- **Tiered (Model E)**: Killing a squad-level member removes them from the squad pool and potentially isolates lower-tier pools from the platoon tier.
- The enemy's targeting AI (or in PvP, the opponent's Striker config) can be designed to prioritize units that are part of shared pools — visually identifiable by the pool connection lines during sealed watch.

**Counter-architectures:**
- **Redundant hubs**: Deploy two Relays in a hub-and-spoke pool. If one dies, the other takes over (requires a "failover" hook: ON_UNIT_DESTROYED → PROMOTE_BACKUP_HUB). Expensive (two Relay costs) but survivable.
- **Distributed mesh (Model C)**: Avoid hub-and-spoke entirely. Peer-to-peer adjacency sharing has no single point of failure — killing one unit just reduces the mesh, doesn't destroy it.
- **Bodyguard formation**: Surround the hub with defensive units (Strikers configured to engage anyone approaching the hub). The "fortress" pattern from 2.00f-i. Effective but predictable.
- **Decoy hub**: Deploy a Relay with high EM emissions but no actual shared pool connections — an empty target. The real pool runs on a quieter, less obvious unit. Requires EM management (the decoy must look more important than the real hub).

### Attack 5 — "The Mirror" (Pool Espionage)

The enemy reads the contents of the shared pool, gaining intelligence about the player's army awareness and decision-making state.

**Mechanical rules:**
- An enemy Specialist uses "extract" to read N entries from the targeted shared pool (N = Specialist's extraction power, base 3)
- The extracted entries are copied to the enemy's intelligence system — they now know what the player's squad knows
- The extraction is silent unless the player has "intrusion detection" configured (a hook that fires when the pool is read by a non-member)
- Under stigmergy (Model F), extraction is free — tile marks are visible to any unit with perception. No hack needed. The entire board IS the enemy's intelligence source.

**Counter-architectures:**
- **Intrusion detection hook**: ON_POOL_READ → ALERT_COMMAND. The Command unit receives notice that the pool was compromised and can trigger a "change plans" response (reroute hooks, modify patrol paths, update orders).
- **Encryption skill** (late game): Pool entries are encrypted; extraction yields ciphertext. The enemy Specialist must spend additional buffer space and time to decrypt. Encryption adds 1 tick latency to all pool reads (even friendly ones) — the cost of security.
- **Ephemeral pool**: Configure the pool's eviction to be aggressive (entries decay to 0 after 2 ticks). Even if extracted, the intelligence is stale almost immediately. But this sacrifices the pool's long-term memory function.

---

## Player Journeys

### Journey: Sofia, 28, Cybersecurity Analyst

**Context:** Mission 9. Sofia has been building shared-pool-heavy architectures since Mission 6. She's about to face an enemy with Specialist units specifically configured to attack shared memory. This is her first encounter with targeted pool attacks.

**Minute 0:00 — The Confident Setup**
Sofia's Plan screen shows her signature "Trident" formation: three squads of 3 units each, each sharing a 16-slot blackboard pool. The squads are color-coded: blue (forward recon), green (mid-field relay), red (strike force). Each pool shows healthy capacity bars in cool blue. She's proud of the architecture — zero-latency coordination within squads, hook bridges between squads for cross-squad comms. She hits EXECUTE, confident.

**Minute 0:30 — The First Hit**
Sealed watch, tick 8. Blue squad's pool overlay suddenly flashes amber — utilization jumps from 60% to 95% in a single tick. Sofia watches, tense. She can't interact. A small EM burst icon appears at tile D3 — an enemy Specialist. Tick 9: the pool flashes red. Overflow. All three blue squad members freeze in stun animation — amber sparks, jittering sprites, the harsh electronic grind. The enemy Striker at C3 moves adjacent to the stunned Scout. One-shot kill. The pool shrinks (Scout's contribution lost), but it's already overflowing — the remaining two units stay stunned for another tick as eviction cascades. The enemy Striker kills the Relay. Then the last blue squad member. Three ticks, three kills. An entire squad wiped by a single noise bomb.

**Minute 1:00 — The Cascade**
The blue squad's death sends shockwaves through Sofia's architecture. The hook bridges from blue to green squad go silent — no more forward recon data. Green squad's pool starts filling with stale data (no fresh THREAT updates from the now-dead Scout). Red squad, depending on green for targeting data, begins making decisions based on increasingly outdated intelligence. The enemy, having eliminated the forward eyes, advances through the unmonitored corridor. By tick 15, Sofia's entire information architecture has degraded — not from direct damage to green or red, but from the cascading intelligence gap created by blue's destruction.

**Minute 1:30 — The Desperate Adaptation**
Sofia watches green squad attempt to compensate. The Relay in green squad receives stale data from its own Scout (still alive) but has no coverage of the northern corridor where blue used to patrol. A rule in the green Scout fires: "IF signal_age(THREAT, blue-channel) > 5 THEN expand_patrol." The Scout starts moving north to cover the gap. But it's too slow — the enemy is already through. Red squad's Striker engages an enemy it didn't see coming. One-shot kill, but the Striker also walked into an enemy flanker's zone. Mutual destruction. Sofia's army is halved by tick 20, all from a single noise bomb on tick 8.

**Minute 2:00 — The Post-Mortem**
Inspector. Sofia scrubs to tick 8, clicks the blue pool. She sees the noise entries — 6 garbage NOISE entries injected by the enemy Specialist, filling slots 11-16. Her legitimate data occupied slots 1-10. Combined: 16 entries in a 16-slot pool — technically not overflow. But on tick 9, the Scout generated 2 new observations, bringing the total to 18. Overflow. She traces the EM burst: the Specialist was detectable at tick 7 (EM spike visible in the EM overlay), but her blue squad had no EM-detection hook. She had no early warning. She opens her workbench with fire in her eyes: "I need a firewall. And a backup pool. And EM monitoring. This is incident response."

**UI Annotations:**
- **EM burst indicator**: Red concentric rings emanating from the attacking Specialist's tile, visible for 500ms during the attack tick. Color: angry red-orange, pulsing.
- **Pool overflow cascade**: Pool overlay flashes red (200ms on, 100ms off, 3 cycles), entries spill out the top as red particles, the pool border cracks like glass (procedural crack animation), stun sparks on all squad members.
- **Cascade visualization in Inspector**: When viewing the tick where blue squad dies, a "Cascade Impact" overlay shows dashed lines from the dead squad to green and red squads, with timestamps showing when each downstream squad began receiving stale data. The lines pulse amber at the staleness threshold.

---

### Journey: Kai, 11, Minecraft Builder

**Context:** Mission 8. Kai has been using a simple 2-unit shared pool (Scout + Striker). An enemy Specialist just injected a Poison Pill — a fake THREAT entry claiming "enemy at G2" when no enemy exists there.

**Minute 0:00 — The Wild Goose Chase**
Sealed watch. Kai's Striker receives the fake THREAT from the shared pool. Its rule says "IF THREAT in buffer THEN move-toward-threat." The Striker turns and marches toward G2 — away from the real enemies at B5. Kai watches, confused: "Why is it going THERE? There's nothing there!" The Scout, still patrolling, spots real enemies at B5 and writes THREAT entries to the pool. But the Striker is already 4 tiles away, moving in the wrong direction. By the time it turns around (reading the fresh B5 THREAT data on the next tick), the real enemies have advanced to B3 — adjacent to the Scout. One-shot kill on the Scout. Now the Striker is alone, with a pool full of a dead Scout's stale observations and one fake entry that sent it on a goose chase.

**Minute 0:45 — The "Aha" in Inspector**
Kai scrubs to the tick where the fake THREAT appeared. He clicks the pool entry: "THREAT: enemy at G2, Source: UNKNOWN, Age: 0." He clicks the real THREAT entries: "THREAT: enemy at B5, Source: Scout, Age: 0." The fake entry has "Source: UNKNOWN" — it was injected, not generated by his own units. Kai's eyes go wide: "The enemy LIED to my robots!" He looks at the Striker's decision trace: "Rule matched: IF THREAT THEN move-toward. Context entry used: 'enemy at G2' (UNKNOWN source)." The rule didn't check the source. It trusted any THREAT data blindly. Kai says to himself: "I need a rule that only trusts data from MY units."

**Minute 1:30 — The Trust Rule**
Back in Plan. Kai adds a new rule to the Striker: "IF THREAT AND source IS Scout THEN move-toward-threat." Below it, a lower-priority fallback: "IF THREAT AND source IS UNKNOWN THEN HOLD." The Striker will now move toward threats only if a known Scout reported them. Unknown-source threats are acknowledged (not ignored — the unit holds position defensively) but not acted upon aggressively. Kai re-executes. This time, the fake THREAT arrives, the Striker checks the source, finds "UNKNOWN," and holds. The real THREAT from the Scout arrives, source verified, and the Striker engages correctly. Kai grins: "It's like checking if a message is from a real person or a spam bot."

**UI Annotations:**
- **Source metadata in Inspector**: Each pool entry's detail panel shows a "Source" field with the originating unit's icon and name. Entries from non-squad-members show a red "?" icon and "UNKNOWN" label.
- **Trust rule construction**: In the workbench rule editor, the condition pill "source IS [unit]" appears as a teal badge with a small shield icon. The condition "source IS UNKNOWN" appears with a red shield.

---

### Journey: Datu, 38, Network Security Engineer

**Context:** Mission 10, Gauntlet preparation. Datu has faced all attack types and is building a comprehensive defense-in-depth architecture against shared pool attacks.

**Minute 0:00 — The Layered Defense**
Plan screen. Datu's architecture shows three concentric defensive layers around his primary 24-slot shared pool (5-unit squad: 2 Scouts, Relay, Specialist, Command):

Layer 1 — **EM Perimeter**: Both Scouts have hooks configured with ON_EM_SPIKE → ALERT_POOL. Any EM burst within their perception radius triggers an immediate pool alert. The alert enters the pool as a high-priority STATUS entry: "EM spike detected at [position]."

Layer 2 — **Quarantine Buffer**: The Relay hosts a 4-slot quarantine sub-pool. All entries from external sources (hack-injected) land in quarantine first. The Relay's "filter" skill runs a validation check: entries whose content contradicts any Scout's current perception are flagged as SUSPECT and discarded. Valid entries are promoted to the main pool after a 1-tick delay.

Layer 3 — **Authentication**: The Command unit's "prioritize" skill stamps all outgoing and internal pool entries with a cryptographic tag (a simple hash of source-ID + tick-number). Entries without valid tags are automatically routed to quarantine. Enemy-injected entries lack valid tags and are caught at this layer.

**Minute 0:45 — The Defense Test**
Sealed watch. Tick 5: an enemy Specialist attempts a Noise Bomb — 6 NOISE entries targeted at the pool. Layer 1 fires first: Scout-A detects the EM burst, hook fires, STATUS entry "EM spike at F3" enters the pool instantly. The Command unit reads this and its rule fires: "IF EM_SPIKE detected THEN set_pool_mode LOCKDOWN." In LOCKDOWN mode, the pool rejects all external entries for 3 ticks. The 6 NOISE entries bounce off the locked pool. A visual: the pool overlay briefly shows a steel-grey border (lockdown indicator), the noise entries appear as red packets bouncing off the border and scattering into particles. A sharp metallic *clang* for each rejected entry.

Tick 8: the enemy tries a Poison Pill instead — a single, carefully crafted THREAT entry. LOCKDOWN has expired. The entry reaches the pool. Layer 3 checks the authentication tag — no valid tag. The entry is routed to quarantine. The Relay's filter skill compares the claimed position ("enemy at D6") against Scout-B's current perception of D6 — Scout-B is adjacent to D6 and sees no enemy. The entry is flagged SUSPECT and discarded. A small amber "X" flashes on the quarantine slot, then the slot empties. Datu watches with satisfaction.

Tick 12: the enemy deploys a Mirror attack — a Specialist extracts 3 entries from the pool. Layer 2's intrusion detection hook fires: ON_POOL_READ by non-member → ALERT_COMMAND. The Command receives "Pool read by enemy at E4." Its rule fires: "IF pool_compromised THEN reroute_hooks AND modify_patrol." All hook channels are reassigned to new names (breaking any wiretaps), and Scouts shift to alternative patrol routes. The old intelligence is now stale — even if the enemy read it, the army's plans have changed. Datu built a system that responds to breach by changing the plan, not just defending the wall.

**Minute 1:30 — The Adaptive Enemy**
But the Mission 10 enemy is smart. Tick 18: instead of attacking the pool directly, the enemy kills Scout-A (the EM detector). Layer 1 is halved. Tick 20: kills Scout-B. Layer 1 is gone. No more EM detection. Tick 22: another Noise Bomb. No EM alert this time — the Command doesn't know to lock down. The noise enters the pool. Layer 3's authentication catches some (no valid tags), routing to quarantine. But the quarantine has 4 slots and 6 entries arrive — quarantine overflows, 2 entries bypass directly into the main pool. The filter skill on the Relay processes one per tick — it can only validate 1 entry per tick against its own limited perception. The unfiltered noise entry triggers a false THREAT response in the Striker. Datu's defense held for 17 ticks but eventually degraded as the enemy systematically dismantled the outer layers. The lesson: defense in depth works, but the depth is finite, and the enemy will test every layer.

**UI Annotations:**
- **Lockdown visual**: Pool overlay border shifts from translucent blue to opaque steel-grey, with small padlock icon at top-left. Rejected entries bounce off with metallic *clang* SFX and scatter into red particles.
- **Quarantine sub-pool**: Shown as a smaller, amber-bordered rectangle attached to the bottom of the main pool overlay. Entries in quarantine have a dashed amber border. When validated and promoted, they slide up into the main pool with a soft *ding*. When discarded, they flash red and dissolve.
- **Authentication tag**: In Inspector, authenticated entries show a small green checkmark next to the source icon. Unauthenticated entries show a red "?" shield. The tag hash is visible on hover as a 6-character hex code.

---

## Strengths and Weaknesses

**Strengths of the shared buffer attack system:**
- Creates a natural arms race between offensive and defensive information architecture, directly mirroring real cybersecurity (offense → defense → better offense → better defense)
- Makes shared buffers a meaningful risk/reward tradeoff, not just a strictly-better coordination mechanism
- The five attack types map to real security concepts: DDoS (Noise Bomb), social engineering (Poison Pill), sustained probing (Cache Flood), physical destruction (Splitter), espionage (Mirror)
- Each attack has multiple viable counter-architectures, creating a rich design space for defensive configurations
- The cascading failure from blue-squad destruction (Sofia's journey) teaches distributed systems resilience concepts

**Weaknesses of the shared buffer attack system:**
- Five attack types + multiple counters per attack = very high cognitive load, especially for players still learning basic buffer management
- Risk of "mandatory defense" — if pool attacks are too strong, every shared pool REQUIRES a full defense stack, reducing build variety
- Authentication and encryption add complexity that may not fit the visual/tactile workbench ethos (hashing is abstract, hard to make tangible)
- Enemy AI complexity: designing enemies that choose the right attack for the right situation is significant engineering work
- The "layer by layer dismantlement" pattern (Datu's journey) could feel frustrating if there's no viable endgame defense

---

## Interaction Effects with Locked Decisions

**One-shot-one-kill:** Pool attacks that stun the whole squad for even 1 tick are devastating. An adjacent enemy one-shots a stunned unit. A noise bomb + adjacent Striker is a guaranteed kill. This makes pool defense life-or-death, not optional optimization.

**Hook system:** Pool attacks interact with hooks in two ways: (1) hooks can be the delivery mechanism for pool-targeted attacks (enemy hooks injecting data into the pool via channel hijacking), and (2) hooks are the primary defense mechanism (EM detection, intrusion alerts, lockdown triggers). The hook architecture IS the immune system.

**Factory production:** If the enemy develops pool attack capability in later missions, the player's production queue must include defensive units (EM-scanning Scouts, filter Relays, quarantine capacity). This shifts the production economy — not just "build attackers" but "build defenders for the knowledge infrastructure."

**Inspector:** Pool attacks are some of the most dramatic events to inspect. The Inspector's event log shows the attack, the pool state change, the cascade effects. The decision trace shows which rule failed to catch the fake data. Pool attacks create the richest Inspector experiences because they affect multiple units simultaneously.

---

## Comparable Games and Systems

**Invisible Inc. (alarm system):** The alarm level rises each turn, sending increasingly dangerous responses. The player balances speed against stealth. Pool attacks create a similar escalating pressure — the longer you run shared pools, the more the enemy learns to attack them.

**Slay the Spire (status effects):** Enemies apply debuffs (Vulnerable, Weak, Frail) that degrade the player's capabilities. Pool attacks function similarly — they degrade the army's cognitive capabilities rather than physical ones. "Your army is confused" rather than "your army is damaged."

**StarCraft (feedback/EMP):** High Templar's Feedback and Ghost's EMP drain energy from enemy spellcasters, removing their ability to use abilities. Pool attacks drain or corrupt knowledge rather than energy, but the strategic role is identical: disable the opponent's information advantage.

**Real-world cybersecurity:** DDoS attacks (noise bomb), data injection (poison pill), APTs (cache flood), physical destruction (splitter), espionage (mirror) — each attack type has a direct real-world analog. The game's defensive stack (EM detection, quarantine, authentication, intrusion detection) maps to firewalls, DMZs, TLS, and IDS respectively.

---

## Sensory Description

**Noise bomb impact:** The enemy Specialist crouches, antenna extending (a rapid telescoping animation, 200ms). A red shockwave ripples outward from the Specialist's tile — concentric rings expanding at 2 tiles/second, fading to transparent at the edge. When the wave reaches a shared pool member, the pool overlay shudders violently (2px random offset per frame for 400ms), entries scramble (briefly rearranging in random order before settling), and the NOISE entries fade in from static — each one a TV-snow-textured stripe that resolves into a garbled, unreadable entry. The sound: a harsh digital screech (white noise burst, 300ms, through a low-pass filter that gives it a "punchy" quality), followed by the familiar stun crackling if the pool overflows.

**Poison pill insertion:** Silent. No visual on the attacking Specialist (the poison is stealthy). In the pool overlay, a new entry appears normally — correct type color, correct format, no distinguishing marks. Only in the Inspector, after the battle, can the player see the "Source: UNKNOWN" tag and the red "?" shield. The poison pill is invisible during sealed watch, making it the most insidious attack. The absence of visual spectacle IS the design — you don't know you've been poisoned until you investigate why your Striker went the wrong way.

**Quarantine filtering (Datu's defense):** Incoming external entries hit the quarantine zone with a dull *thud* (low-frequency, padded impact, 100ms). The entry sits in the amber-bordered quarantine slot, pulsing slowly. The Relay's filter icon glows as it processes — a small scanning line sweeps across the entry (left to right, 500ms). If valid: the scanning line turns green, the entry slides upward into the main pool with a gentle *ding* (C major, bell timbre). If suspect: the scanning line turns red, a small "X" stamps onto the entry, it flashes amber twice, then dissolves into downward-falling particles with a soft descending *whomp*.
