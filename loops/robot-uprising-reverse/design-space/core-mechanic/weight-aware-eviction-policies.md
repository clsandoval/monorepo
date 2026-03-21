# 2.02c — Weight-Aware Eviction Policy Design Space

**Aspect:** 2.02c — Weight-aware eviction policy design space: FIFO-weight, lightest-first, heaviest-first, priority-tagged, weight-matched, random-weighted; which strategies create interesting decisions vs. degenerate ones
**Wave:** 2 (Core Mechanic Deep Dives)
**Dependencies:** 2.01 (Fixed-Slot Buffer), 2.02 (Weighted Buffer), 2.02a (Weight Value Design Space), 2.02b (Delivery Richness)

---

## The Design Question

When a unit's buffer is full and a new signal arrives, **something must go**. In 2.01 (Fixed-Slot Buffer), the answer was always FIFO — oldest entry out, no questions asked. The introduction of signal weights in 2.02 fractures that simplicity. Signals now carry a numeric priority (1-5 per the recommended model from 2.02a), and the player configures the eviction policy as part of the unit's Context Config in the Blueprint Editor. The eviction policy is the sentence: "When my buffer is full, here is how I decide what to forget."

This is not a dropdown the player selects once and forgets. The eviction policy is a **philosophical stance about memory management** — what does this unit value? Recency? Importance? Diversity? The policy shapes how the unit performs under information pressure, and because different missions create radically different information environments (a quiet patrol vs. a multi-front assault with enemy signal flooding), the right policy is situational. Players who understand eviction policies deeply will reconfigure them per-mission, per-unit, sometimes per-phase of a single mission. Players who don't will reach a ceiling around Mission 6 where their units keep "forgetting" critical signals and they can't figure out why.

The eviction policy is also one of the game's most potent teaching tools. Every policy is a real-world algorithm. Players who master Robot Uprising's eviction system have, without realizing it, internalized the vocabulary of cache replacement — LRU, LFU, priority queues, probabilistic eviction. The game doesn't name these algorithms. It lets the player feel them, then name them in the Inspector when the consequences become visible.

---

## The Full Catalog

### Policy A: FIFO (Baseline — Ignore Weight)

**Mechanical rules:** Oldest entry is evicted, regardless of weight. Identical to the 2.01 fixed-slot buffer model. Weight values are stored in the buffer but never consulted during eviction. The buffer is a conveyor belt: signals enter at one end, exit at the other, and weight is decorative metadata.

**When it's optimal:** Early campaign (Missions 1-4) before weight differentiation matters. Low-information-density missions where the buffer rarely fills. Missions where all signals are roughly equally important and recency alone determines relevance — pure patrol scenarios, for instance, where the most recent enemy sighting is always the most actionable.

**When it degenerates:** The moment the player has mixed-weight signals. A weight-5 critical threat report and a weight-1 ambient terrain ping are treated identically. The critical report gets evicted because it arrived two ticks before the terrain ping. The unit "forgets" the most important thing it knows because FIFO has no concept of importance. This is the designed frustration that drives the player to explore other policies.

**What it teaches:** FIFO teaches that recency is not the same as relevance. It is the "training wheels" policy — safe, predictable, and eventually insufficient. Players who stick with FIFO past Mission 5 are players who haven't yet felt the pain of losing high-weight data.

**Visual and audio:** Buffer entries scroll left uniformly. Eviction flash is the standard red pip from 2.01. No weight-related visual distinction during eviction — the departing entry's weight pips (dim amber through bright cyan) briefly flash as it exits, but the eviction animation is the same regardless of weight. The sound is a neutral soft click, like a card sliding out of a deck.

---

### Policy B: Lightest-First (Low Weight Evicted First)

**Mechanical rules:** When the buffer is full and a new signal arrives, the entry with the **lowest weight** is evicted. Ties broken by age (oldest of the tied entries evicted first). If the incoming signal itself has the lowest weight of anything in the buffer plus the incoming, the incoming signal is immediately evicted on arrival — it never displaces anything. This is the "bouncer at the door" edge case: a weight-1 signal arriving at a buffer where every entry is weight-3 or higher simply gets rejected.

**When it's optimal:** This is the intuitive, "correct-feeling" policy for most players. It preserves high-priority intelligence and sacrifices low-priority noise. A Relay receiving both weight-5 threat alerts and weight-1 ambient pings will maintain a buffer full of threat data. Ideal for units in decision-critical roles (Strikers choosing engagement targets, Command units maintaining situational awareness) where the cost of losing important data exceeds the cost of losing recent low-priority data.

**When it degenerates:** The "importance deadlock." If all signals in the buffer are high-weight (the player has configured every signal type to weight 4-5 because everything "seems important"), lightest-first degrades to FIFO-within-weight-tier, which approximates pure FIFO. The policy provides no benefit when the player hasn't committed to a genuine priority hierarchy. This is the designed consequence of weight inflation — a player who calls everything critical has no eviction strategy at all.

The second degeneration: **stale critical data.** A weight-5 enemy position from tick 3 sits in the buffer through tick 40 because nothing outweighs it. But the enemy moved 30 ticks ago. The buffer is "full of important lies." Lightest-first has no concept of staleness. It preserves importance at the cost of currency. The interaction with 2.03 (Decay Buffer) addresses this directly — decay reduces weight over time, so stale critical data eventually becomes evictable. Without decay, lightest-first creates a graveyard of once-important data.

**What it teaches:** Priority hierarchies require honest differentiation. If everything is priority 5, you have no priorities. The player learns to spread weights across the 1-5 range, giving each signal type a distinct tier. This is the first step toward thinking like a systems architect: what actually matters to this unit's decision-making?

**Visual and audio:** During eviction, the departing entry's weight pips dim one by one from right to left, like a battery draining — a visual metaphor for "this was the weakest signal." The eviction flash changes color: weight-1 evictions produce a faint gray flash (barely noticeable, this was noise anyway). Weight-3 evictions produce an amber flash (you're losing something real). Weight-4 or weight-5 evictions — rare under lightest-first, but possible under the importance-deadlock degeneration — produce a bright red flash with a descending two-note chime, a warning tone that says "you just lost something critical because your weight distribution is broken."

---

### Policy C: Heaviest-First (High Weight Evicted First)

**Mechanical rules:** When the buffer is full, the entry with the **highest weight** is evicted. Ties broken by age (oldest of the tied entries evicted first). This is the contrarian policy — it discards the signals the player marked as most important.

**When it's optimal:** This policy seems absurd until you consider **information warfare.** If an enemy is flooding the channel with high-weight disinformation (2.02a discusses weight as an attack surface), heaviest-first acts as an immune response — it assumes that the loudest signals are the most suspicious and preserves the quiet, low-weight signals that are more likely to be genuine. This is the "quiet confidence" strategy: trust the whispers, suspect the shouts.

Heaviest-first also serves a narrow tactical niche: units whose primary value is **recent peripheral awareness.** A Scout whose job is to maintain a snapshot of its immediate surroundings — terrain, ambient conditions, friendly unit positions — benefits from a buffer full of lightweight recent observations rather than old heavyweight threat reports. The Scout doesn't make decisions; it just provides a current environmental picture to downstream units via hooks. Heavyweight data is for decision-makers, and this unit isn't one.

**When it degenerates:** In any normal (non-adversarial) information environment, heaviest-first is actively self-destructive. The unit systematically forgets its most important intelligence and retains noise. A Striker using heaviest-first evicts its engagement targets and retains ambient terrain data. It charges into battle knowing the color of the floor but not where the enemies are. This policy is a trap for uninformed players and a specialist tool for experts.

**What it teaches:** That eviction policy is a statement about trust. Heaviest-first teaches that "important" and "trustworthy" are different axes. In adversarial environments, the loudest signal may be a lie. This lesson maps directly to information security concepts — spam filters, intrusion detection systems, signal-to-noise ratio analysis. The player who deploys heaviest-first successfully has learned to think about adversarial information.

**Visual and audio:** Eviction animation reverses the lightest-first visual — weight pips illuminate brightly before the entry departs, a brief flare like a match being struck and discarded. The eviction flash is an inverted color: cyan instead of red, an "are you sure?" coolness. The audio is an ascending note cut short — the sound of something important being silenced. The contrast with lightest-first's descending drain is deliberate: the two policies sound like mirror images.

---

### Policy D: Priority-Tagged (Player Marks "Never Evict" Entries)

**Mechanical rules:** The player marks specific signal types as **pinned** in the Blueprint Editor. Pinned signals, once they enter the buffer, are never evicted regardless of weight or age. Eviction proceeds via lightest-first among the unpinned entries. If all remaining entries are pinned and a new signal arrives, the unit enters **context overload** — a 1-tick stun — and the incoming signal is dropped. The buffer locks completely. The player has built a system that cannot forget and therefore cannot learn.

Pinning is configured per signal type per unit, not per individual buffer entry. The player might pin "enemy sighting (close range)" and "relay threat alert," meaning any signal of those types, once received, permanently occupies its slot until the mission ends or the entry decays below dissolution threshold (if decay buffer is active).

**When it's optimal:** High-value intelligence preservation. A Command unit that must maintain awareness of specific critical threats — the boss enemy's position, the objective marker location, a time-sensitive mission parameter — uses pinned slots to guarantee this data survives buffer churn. The player is trading buffer flexibility for certainty: "I will always know where the boss is, even if it means I have fewer slots for everything else."

**When it degenerates:** Pin addiction. The player pins too many signal types, leaving only 1-2 unpinned slots for dynamic information. The unit becomes an archive — perfect recall of pinned data, completely blind to everything else. New signals arrive and hit a wall of pinned entries. Context overload triggers repeatedly. The unit spends every other tick stunned, a twitching monument to the player's inability to prioritize.

The second degeneration is subtler: **stale pinned data.** A pinned enemy position from tick 5 stays in the buffer at tick 80. The enemy has long since moved. The pinned entry is guaranteed-preserved garbage. Without decay buffer interaction, pinning creates permanent lies.

**What it teaches:** That guarantees have costs. Pinning is a resource — every pinned slot is one less dynamic slot. The player learns to pin sparingly and to unpin when conditions change. This maps to database design (reserved memory, pinned cache pages, write-ahead log guarantees) and to personal information management (the difference between archiving and hoarding).

**Visual and audio:** Pinned entries display a small lock icon in the buffer bar, rendered as a tiny padlock silhouette overlaid on the entry's color block. During eviction, the eviction scanner sweeps across the buffer left to right and visibly skips pinned entries — a brief brightening of the lock icon as the scanner passes, accompanied by a quiet metallic click-click of the lock holding. Unpinned entries dim and prepare for departure; pinned entries stay lit. When context overload triggers from an all-pinned buffer, the entire buffer bar flashes white-hot and the unit's tile pulses with a low, throbbing bass tone — the sound of a system that has jammed itself.

---

### Policy E: Weight-Matched (Evict Entry Closest in Weight to Incoming)

**Mechanical rules:** When a new signal arrives at a full buffer, the system evicts the entry whose weight is **closest to the incoming signal's weight.** Ties broken by age. The intuition: incoming data replaces its nearest equivalent, preserving the overall weight distribution of the buffer. A weight-3 incoming signal evicts the existing weight-3 (or weight-2 or weight-4, whichever is numerically closest). The buffer maintains diversity across the weight spectrum.

**When it's optimal:** Architectures where the unit needs to maintain a balanced view — some high-priority threats, some medium-priority context, some low-priority ambient awareness. Weight-matched eviction is the "biodiversity" policy: it prevents any single weight tier from dominating the buffer. A Relay receiving mixed traffic from multiple sources benefits from weight-matched because it needs to compress and forward a representative sample of all signal types, not just the loudest ones.

**When it degenerates:** Weight-matched eviction can produce deeply unintuitive behavior. A weight-5 critical threat alert arrives. The buffer contains one weight-5 entry (the previous critical alert) and five weight-1 ambient pings. Weight-matched evicts the existing weight-5 entry — the one piece of important data — because it's the closest match to the incoming weight-5. The player watches their unit replace an important signal with a different important signal rather than discarding one of the five ambient pings. The buffer stays full of noise with a single rotating critical slot.

This is the "replacement paradox." The player intended to accumulate critical data, but weight-matched treats new critical data as a replacement for old critical data rather than an addition. The policy maintains weight diversity by sacrificing weight accumulation. Players who want to stockpile high-weight intelligence need lightest-first, not weight-matched.

**What it teaches:** That "fairness" in resource allocation is not always optimal. Weight-matched is the "equal representation" policy, and it teaches that equal representation can be worse than prioritization when the stakes are asymmetric. This maps to real-world resource allocation debates — bandwidth allocation (equal vs. priority), CPU scheduling (fair-share vs. priority queues), even organizational decision-making (consensus vs. triage).

**Visual and audio:** During eviction, a thin connecting line briefly flashes between the incoming signal and the about-to-be-evicted entry, colored by their shared weight tier — a visual "these are the same kind of thing." The eviction flash color matches the incoming signal's weight pips. The audio is a brief two-tone chord: the evicted entry's note and the incoming entry's note sounding simultaneously, slightly dissonant, implying replacement. When the replacement paradox fires (high-weight replacing high-weight while low-weight survives), the surviving low-weight entries briefly pulse with a faint gold outline — a visual "I survived that?" that experienced players learn to watch for.

---

### Policy F: Random-Weighted (Probabilistic Eviction Inversely Proportional to Weight)

**Mechanical rules:** Each buffer entry has an eviction probability inversely proportional to its weight. Weight-1 entries have a 5/15 (33.3%) chance of selection. Weight-5 entries have a 1/15 (6.7%) chance. The exact formula: `P(evict entry_i) = (max_weight + 1 - weight_i) / sum_of_all_inverse_weights`. A random number generator (seeded per-tick for deterministic replay) selects the victim. High-weight entries are unlikely to be evicted but not guaranteed safe. Low-weight entries are likely to be evicted but not guaranteed doomed.

**When it's optimal:** Long missions (80+ ticks) where the law of large numbers smooths out individual unlucky evictions. Over many ticks, random-weighted produces a buffer that statistically favors high-weight data while maintaining the possibility of surprise — a low-weight observation that happens to survive long enough to become relevant. Random-weighted is the "probabilistic hedge" — it mostly does the right thing and occasionally does something interesting.

For competitive play (Gauntlet mode), random-weighted adds a thin layer of variance that makes matches non-identical even with the same configs. Two runs of the same matchup produce slightly different buffer states, testing whether the player's architecture is robust to probabilistic memory or brittle against it.

**When it degenerates:** Variance anxiety. The player watches a weight-5 critical threat report get randomly evicted (6.7% chance, but it happens) and loses the mission because of it. The Inspector shows the eviction was random — no strategic logic, just bad luck. The player feels cheated. "I did everything right and the RNG killed me." This is the fundamental tension of any probabilistic system in a deterministic-core game: Robot Uprising's locked spec promises full determinism and inspectability, and random-weighted introduces a controlled randomness that the player can see in replay but cannot prevent.

Mitigation: because the random seed is deterministic per-tick, the replay is fully reproducible. The Inspector shows the exact probability each entry had and which was selected. "This entry had a 6.7% eviction chance and the roll was 0.042 — unlucky." The player can diagnose randomness even if they cannot prevent it. But the emotional experience of losing to probability is different from losing to a systematic flaw, and some players will refuse random-weighted entirely.

**What it teaches:** Probability vs. certainty in system design. Random-weighted teaches that probabilistic guarantees are weaker than deterministic ones but more flexible. A system that "probably keeps important data" works most of the time; a system that "always keeps important data" (lightest-first) works all of the time but has its own failure modes (stale data accumulation). The player who switches between random-weighted and lightest-first depending on mission length and variance tolerance has learned a genuine principle of systems engineering.

**Visual and audio:** During eviction, all buffer entries briefly display their eviction probability as a translucent overlay — a percentage rendered in tiny text, or more naturally, a dimming effect proportional to eviction chance. Low-weight entries go quite dim (likely to be selected). High-weight entries barely dim at all. Then the selected entry flashes and departs. The audio is a soft roulette-wheel spin — a descending series of clicks that slows and stops on the evicted entry. When a high-weight entry is randomly selected (the "upset"), the roulette sound is accompanied by a brief low-frequency thud, a visceral "that shouldn't have happened" bass hit that the player feels as much as hears.

---

### Policy G: Age-Weight Product (Oldest x Lightest Evicted First)

**Mechanical rules:** Each buffer entry has an eviction score calculated as `age_in_ticks * (max_weight + 1 - weight)`. Higher score = more likely to be evicted. The entry with the highest eviction score is evicted. This formula means old low-weight entries are evicted aggressively (high age * high inverse-weight = high score), young high-weight entries are almost never evicted (low age * low inverse-weight = low score), and old high-weight entries occupy a middle ground that depends on exact values.

Example: a weight-1 entry aged 10 ticks has score `10 * 5 = 50`. A weight-5 entry aged 10 ticks has score `10 * 1 = 10`. A weight-3 entry aged 30 ticks has score `30 * 3 = 90`. The 30-tick-old medium-weight entry is evicted first — it's old enough and weak enough to score highest.

**When it's optimal:** This is the policy that most closely resembles real-world cache algorithms (specifically, a simplified approximation of ARC or LIRS). It naturally handles both the "stale critical data" problem (old important data gradually becomes evictable as its age multiplier grows) and the "fresh noise" problem (new low-weight data survives briefly because its age multiplier is low, giving it a chance to be useful before eviction). Age-weight product is the "mature" policy — the one that players discover last and adopt when they understand both the recency-relevance tension and the weight-importance axis simultaneously.

**When it degenerates:** The math becomes opaque. A player staring at the Inspector trying to understand why a specific entry was evicted must mentally compute `age * (6 - weight)` for every buffer entry to reconstruct the eviction logic. This is cognitively expensive compared to lightest-first ("oh, it was the lowest weight") or FIFO ("oh, it was the oldest"). The degeneration is not strategic but comprehension-based: the policy is powerful but hard to reason about during iterative debugging.

Second degeneration: weight-5 data becomes nearly permanent. A weight-5 entry's eviction score grows at rate `1 * age` — it takes 50 ticks for a weight-5 entry to match the eviction score of a weight-1 entry at 10 ticks. In short missions (30 ticks), weight-5 data is effectively pinned without the explicit pin mechanic. The policy collapses toward lightest-first when mission length is shorter than `max_weight^2`.

**What it teaches:** Multi-variable optimization. The player learns that a single metric (weight or age) is insufficient for good memory management — the interaction between two variables produces better outcomes than either alone. This maps directly to cache replacement algorithms (LRU considers age only, LFU considers frequency only, ARC combines both) and to decision theory more broadly (decisions with multiple competing criteria require weighted scoring, not single-axis ranking).

**Visual and audio:** The buffer bar displays a subtle heat-map overlay during eviction: entries with high eviction scores glow warm (amber to red), entries with low scores stay cool (blue to neutral). The gradient shifts every tick as ages increase, creating a slow visual tide sweeping from right to left — newer entries arrive cool on the right, warm over time, and eventually glow hot enough to be evicted from the left. The audio for age-weight eviction is a slow, ticking metronome that accelerates as the entry's score climbs, ending in a crisp snap when the entry is evicted. The metronome gives the eviction a sense of inevitability — not sudden death but a measured countdown.

---

## Player Journeys

#### Journey: Lucia, 16, First Strategy Game

**Context:** Mission 6 — the first mission where the player explicitly configures eviction policy. Lucia has completed Missions 1-5 using FIFO (the only available policy until now). She plays on her phone during the bus ride home from school, earbuds in, volume low. She has never played anything more strategic than Candy Crush, but the boot log narrative hooked her two weeks ago and she hasn't missed a session.

**Minute 0:00 — The Boot Log**
The mission briefing terminal scrolls: `SUBSYSTEM: memory_management // PRIORITY OVERRIDE AVAILABLE // new protocol: choose what to forget.` The last line blinks twice. Lucia reads it, brow furrowed. She's used to the boot logs being cryptic-but-cool. "Choose what to forget" is different. It's almost personal.

The Plan screen loads. Two Scouts, one Relay, one Striker. Pre-wired hooks. The Context Config panel on the Relay shows a new dropdown she hasn't seen before: **Eviction Policy**, currently set to `FIFO (default)`. The dropdown has three options available — FIFO, Lightest-First, and Age-Weight Product. The others are grayed out with a lock icon and the text `Unlocked in later missions`.

**Minute 0:30 — Ignorance**
Lucia leaves everything on FIFO and hits EXECUTE. The mission has two enemy waves — a light wave at tick 10 and a heavy wave at tick 30. The first wave goes fine. Her Relay compresses intel from the Scouts, forwards to the Striker, enemy engaged. But at tick 25, the Scouts spot the second wave approaching. The Relay receives weight-4 early-warning signals. Then tick 30 hits: the heavy wave arrives and the Scouts flood the Relay with weight-1 close-range observations (lots of enemies, lots of data). The Relay's buffer fills. FIFO evicts the oldest entries — including the weight-4 early-warning signals that arrived at tick 25. The Striker, downstream, never learns that the second wave has a flanking element because that data was evicted before compress could process it. The Striker walks into an ambush.

**Minute 2:00 — The Inspector**
Lucia taps the Relay at tick 31. The buffer shows 12 slots, all weight-1 close-range observations. Below the buffer, ghost entries show the evicted weight-4 signals in faded red. The tooltip reads: `Evicted: weight-4 early-warning (age: 6 ticks). Policy: FIFO — oldest first, weight ignored.` "Weight ignored." Lucia reads it twice. She scrolls down to the eviction log and sees a column of weight-1 entries surviving while weight-4 entries are marked with red crosses.

She mutters something her seatmate can't hear over the bus noise.

**Minute 3:00 — The Switch**
Back in Plan. Lucia taps the Relay's Context Config. Changes Eviction Policy from FIFO to Lightest-First. The dropdown animation plays: the FIFO conveyor-belt icon morphs into a weight-scale icon. A tutorial tooltip appears: "Lightest-First: when the buffer is full, the lowest-weight signal is forgotten first. Important signals survive longer." She hits EXECUTE.

This time, tick 30 hits. The observation flood arrives. The Relay's buffer fills. Lightest-first engages. Weight-1 observations are evicted to make room for new arrivals. The weight-4 early-warning signals from tick 25 survive. Compress fires, processes the early warning, forwards to the Striker. The Striker repositions. The flanking element is met head-on. Mission success.

**Minute 5:00 — The Lesson She Doesn't Name**
Lucia doesn't know the term "priority queue." She doesn't know she just implemented LFU-style eviction. What she knows is: "the important stuff shouldn't get pushed out by the unimportant stuff." She configures Lightest-First on all her units and moves to Mission 7. Two missions later, she'll hit the stale-critical-data problem and discover Age-Weight Product. But for now, the insight is clean and satisfying, and the bus has reached her stop.

---

#### Journey: Marcus, 34, Site Reliability Engineer

**Context:** Mission 9 — a Gauntlet qualification match against an opponent config that uses aggressive signal flooding. Marcus plays on PC, second monitor showing Grafana dashboards from work. He drinks coffee that went cold an hour ago. He has been playing Robot Uprising for three weeks and recognizes eviction policy as "just cache replacement with a skin on it." He's here to test whether heaviest-first actually works against adversarial flooding.

**Minute 0:00 — The Hypothesis**
Marcus has studied the opponent's uploaded config in the community workshop. The opponent runs three Scouts that spam weight-5 disinformation on open channels — false enemy positions designed to flood downstream units. Marcus's Relay currently uses lightest-first, which means the weight-5 disinformation is treated as the most important data in the buffer. The Relay preserves the lies and evicts the truth.

Marcus opens the Blueprint Editor. Relay-Alpha's Context Config. He changes Eviction Policy to Heaviest-First. The dropdown icon morphs from a weight scale to an inverted weight scale — heavy side up, light side down. The tooltip reads: "Heaviest-First: highest-weight signals evicted first. Use when you suspect loud signals are disinformation." Marcus grins. "Yeah, that's the use case."

**Minute 1:30 — The Counter**
EXECUTE. The match begins. Enemy Scouts advance, spraying weight-5 signals on channels Marcus's Relay listens to. Under lightest-first, these would have filled the buffer and been preserved indefinitely. Under heaviest-first, they're evicted first. Marcus's Relay maintains a buffer of weight-1 and weight-2 genuine observations from his own Scouts — quiet, trustworthy, low-weight signals that his own architecture generates honestly.

The Relay compresses the genuine observations. Forwards to the Striker. The Striker engages the real enemies, ignoring the phantom targets from the disinformation flood. The opponent's flooding strategy accomplishes nothing. Marcus leans back. "Cache poisoning, meet cache invalidation."

**Minute 4:00 — The Cost**
But Marcus's architecture has a problem. His own Scouts occasionally generate genuine weight-4 signals — close-range threat assessments when enemies are within 2 tiles. Under heaviest-first, these weight-4 signals are evicted before the weight-1 ambient pings. His Relay correctly distrusts the enemy's weight-5 disinformation but also distrusts his own units' high-priority warnings. At tick 42, a genuine close-range enemy approaches, his Scout generates a weight-4 threat alert, the Relay evicts it in favor of weight-1 terrain observations, and the Striker doesn't react until the enemy is adjacent.

In the Inspector, Marcus sees the eviction: his own weight-4 signal, marked with a red cross, while weight-1 terrain pings survive below it. The tooltip: `Evicted: weight-4 threat-assessment (source: Scout-Alpha, friendly). Policy: Heaviest-First.`

"Friendly fire," he says to no one. He opens a notepad. Writes: "Heaviest-first is a blunt instrument. Need per-source trust, not blanket weight inversion." He spends the next twenty minutes sketching a hybrid: heaviest-first for signals from channels that carry enemy data, lightest-first for signals from trusted internal channels. He opens two Relay blueprints — one filtering external channels with heaviest-first, one processing internal channels with lightest-first — and chains them. Two Relays doing the job of one, but with differentiated trust policies.

This is the architecture that qualifies him for Gauntlet Silver tier.

---

#### Journey: Professor Adaora, 55, Computer Science Educator

**Context:** Preparing a lecture demonstration for her Introduction to Operating Systems class. She has been using Robot Uprising for two weeks to find a teaching example for page replacement algorithms. She plays on her office PC, projector connected, lecture notes open in a split window. The classroom is empty — it's 7 PM and she's rehearsing.

**Minute 0:00 — The Mapping**
Adaora has prepared a custom mission with a Scout (6-slot buffer) receiving a controlled stream of signals with known weights and arrival times. She has calculated, on paper, the eviction behavior of each policy given this exact input sequence. Her lecture slide shows the mapping:

| Robot Uprising Policy | OS Algorithm | Key Property |
|---|---|---|
| FIFO | FIFO Page Replacement | Suffers Belady's anomaly |
| Lightest-First | LFU (Least Frequently Used) | Starves infrequently-accessed pages |
| Heaviest-First | (No direct analog) | Adversarial trust inversion |
| Priority-Tagged | Pinned/Wired Pages | Reduces available frame pool |
| Random-Weighted | Random Replacement | Surprisingly competitive at scale |
| Age-Weight Product | Aging Algorithm / ARC | Multi-criteria approximation |

She runs each policy in sequence, recording the buffer state at each tick. For FIFO, she notes the moment a high-weight critical signal is evicted by a trivial low-weight observation — "This is Belady's anomaly made visceral. The student doesn't need to imagine page faults. They can see the signal disappear and watch the unit fail."

**Minute 8:00 — The Discovery**
Adaora switches to weight-matched eviction — a policy she initially dismissed as niche. She runs the controlled input sequence. At tick 14, a weight-3 signal arrives. The buffer contains entries of weights [5, 4, 3, 2, 1, 1]. Weight-matched evicts the existing weight-3 entry — the closest match. The buffer becomes [5, 4, (new)3, 2, 1, 1]. The weight distribution is preserved.

She pauses. Runs the sequence again with a different arrival pattern. Weight-matched consistently maintains a diverse buffer. She writes in her lecture notes: "Weight-matched eviction is the 'biodiversity preservation' algorithm — it sacrifices depth within a weight class to maintain representation across classes. No OS analog I know of. Ask the class if they can think of one."

She runs the full 50-tick sequence for all seven policies, comparing buffer states at tick 50. FIFO and lightest-first produce nearly identical buffers (all high-weight data). Heaviest-first produces the inverse (all low-weight data). Priority-tagged produces a rigid mixture of pinned and recently-evicted. Random-weighted produces a statistically-favored-but-variable mix. Age-weight product produces the most balanced buffer. Weight-matched produces the most diverse buffer.

She saves the replay for tomorrow's 9 AM lecture. Her slide deck now has seven animated buffer visualizations, each labeled with the OS algorithm it teaches. She closes the game at 8:30 PM, satisfied, and notices the boot log on the title screen: `SUBSYSTEM: pedagogy // CURRICULUM DETECTED // this unit is teaching other units how to learn.` She laughs out loud in the empty office.

---

## Strengths and Weaknesses — Cross-Policy Comparison

| Policy | Preserves importance | Handles staleness | Handles adversarial | Cognitive load | Inspector readability | Early-game suitability | Late-game ceiling |
|--------|---------------------|-------------------|--------------------|--------------|--------------------|----------------------|------------------|
| FIFO | No | Yes (natural) | No | Minimal | Excellent | Best | Low |
| Lightest-First | Yes | No | No | Low | Good | Good | Medium |
| Heaviest-First | No | Yes (incidental) | Yes | Medium | Good (inverted) | Poor | Niche-high |
| Priority-Tagged | Partial (pinned only) | No (stale pins) | No | Medium-high | Good (locks visible) | Poor | Medium |
| Weight-Matched | Moderate (diverse) | Moderate | Moderate | High | Moderate | Poor | High |
| Random-Weighted | Statistical | Statistical | Statistical | Low (set and forget) | Moderate (probability) | Poor | Medium-high |
| Age-Weight Product | Yes (with decay) | Yes (age factor) | No | High | Poor (math) | Poor | Highest |

---

## Interaction Effects

### Buffer Size (2.01)

Small buffers (Scout, 6 slots) amplify the impact of eviction policy. A single bad eviction in a 6-slot buffer loses 16.7% of the unit's working memory. In a 14-slot Command buffer, the same bad eviction loses 7.1%. This means eviction policy matters most for small units and least for large ones — which creates a natural teaching gradient. Players first feel eviction pain on their Scouts (small, exposed, high information flow), then refine policies on Relays and Strikers, and finally configure Command units last (large buffers, less pressure, more forgiving of suboptimal policies).

### Signal Richness (2.02b)

Structured signals (3-4 buffer slots) interact with eviction policy in a non-obvious way: a single structured eviction frees 3-4 slots, which might prevent multiple subsequent lightest-first evictions. A buffer under lightest-first that evicts one structured weight-2 signal instead of three stripped weight-1 signals loses more data volume but gains more free space. The "cost per eviction" changes with signal size, and policies that are optimal for uniform-size buffers may not be optimal for mixed-richness buffers.

### Compress Skill

Compress reduces weight and consolidates multiple signals into one. Under lightest-first, compressed output (lower weight than inputs) is more vulnerable to eviction — the act of compression makes data more forgettable. This creates a tension: compress saves buffer space but reduces eviction priority. Under age-weight product, the interaction is healthier: compressed data is newer (age resets on compression) and lighter (lower weight), producing a moderate eviction score that naturally places compressed data in the middle of the priority hierarchy. The choice of eviction policy determines whether compress is a net benefit (age-weight product) or a net risk (lightest-first) to data preservation.

### Information Warfare (Enemy Flooding)

Enemy signal flooding is the primary motivator for heaviest-first and random-weighted policies. Without flooding, lightest-first dominates. With flooding, the meta shifts: players must decide whether to trust weight as a quality signal (lightest-first) or distrust weight as a manipulation vector (heaviest-first). This makes eviction policy a **metagame decision** — the right policy depends on what your opponent is doing, not just what your units need. Information warfare transforms eviction policy from a PvE optimization puzzle into a PvP strategic read.

### The Teaching Curve

The recommended unlock sequence:
- **Mission 1-4:** FIFO only. Player learns buffer fundamentals without eviction complexity.
- **Mission 5:** Lightest-first unlocked. The "choose what to forget" boot log. Player experiences the FIFO-to-priority transition.
- **Mission 6-7:** Age-weight product unlocked. Player encounters stale-critical-data problem with lightest-first.
- **Mission 8:** Priority-tagged unlocked. Player learns pinning for boss-fight intelligence preservation.
- **Mission 9:** Heaviest-first and random-weighted unlocked. First adversarial mission. Player experiments with counter-flooding.
- **Mission 10:** Weight-matched unlocked. Full toolkit available. Gauntlet-ready.

---

## Comparable Games and Systems

### OS Page Replacement Algorithms
FIFO, LRU, LFU, Clock, ARC, and Random replacement are the direct ancestors of Robot Uprising's eviction policies. The key insight borrowed: **no single algorithm is optimal for all workloads.** FIFO suffers Belady's anomaly. LFU starves cold pages. LRU fails under scanning workloads. ARC adapts but adds complexity. Robot Uprising translates this into: no single eviction policy is optimal for all missions, and the player's job is to match policy to workload.

### Cache Eviction (LRU/LFU/ARC)
Redis, Memcached, and CDN cache layers face the identical problem at scale. The "hot key" problem (a single high-traffic key evicting everything else) maps to the "heavy signal" problem in Robot Uprising. ARC's adaptive recency/frequency balance is the real-world equivalent of age-weight product. Players who internalize Robot Uprising's eviction mechanics have a conceptual framework for understanding cache performance in production systems.

### Factorio Logistics Priority
Factorio's logistics network uses priority flags on chests and inserters to determine which items move first. The system is coarser than Robot Uprising's (binary priority vs. 1-5 weight) but the strategic dynamic is identical: when the network is saturated, priority determines what flows and what stalls. Factorio players who build priority-based logistics systems have already solved the Robot Uprising eviction problem in a different domain.

### Card Game Discard Mechanics
Magic: The Gathering's hand-size limit (7 cards, discard to 7 at end of turn) forces the same decision: when your hand is full, what do you discard? Experienced players know that the "right" discard depends on the game state — sometimes you discard the expensive card because you need the cheap one this turn; sometimes you hold the expensive card because it wins in three turns. This is exactly the lightest-first vs. age-weight product tension: do you keep the important thing (lightest-first) or the thing that's most useful right now given its age and importance combined (age-weight product)?

### Into the Breach Consequence Preview
Into the Breach shows the player exactly what will happen before they commit to a move. Robot Uprising's Inspector provides this retrospectively — the player sees what eviction did after the fact. The tension between these models (preview vs. post-mortem) is deliberate: Robot Uprising's sealed watch phase prevents mid-execution intervention, making eviction policy a pre-commitment decision that the player must reason about in advance. The Inspector teaches; the sealed watch tests.

---

## Sensory Design: The Eviction Moment

The buffer bar is the game's pulse monitor for memory health. Each eviction policy has a distinct visual and auditory signature, designed so that experienced players can identify which policy a unit is running purely from watching and listening to its buffer bar during sealed watch.

**The eviction scanner:** When eviction triggers, a thin horizontal line sweeps across the buffer bar from left (oldest) to right (newest). The scanner is the visual cue that eviction is happening. Under FIFO, the scanner barely appears — it stops immediately at position 0 (always evict oldest). Under lightest-first, the scanner sweeps to the lowest-weight entry and pauses there, the entry dimming before departure. Under age-weight product, the scanner sweeps slowly, and entries heat-shift from cool to warm as the scanner evaluates their eviction scores.

**The departure animation:** The evicted entry shrinks vertically (top and bottom edges collapsing toward center), fades to translucent, and slides leftward off the buffer bar edge. Its weight pips flash once — a brief memorial. The speed of the departure animation varies by policy: FIFO departures are quick and unceremonious. Lightest-first departures are slower for higher-weight entries (visual emphasis: "you're losing something important"). Heaviest-first departures are fast regardless (the policy doesn't hesitate). Random-weighted departures have a brief "roulette spin" pre-animation where all entries flicker before the selected one departs.

**The overload stun:** When eviction cannot proceed (all entries pinned under priority-tagged, or incoming signal rejected under specific conditions), the unit enters context overload. The buffer bar goes solid white for 200ms, then resolves to a static pattern of alternating bright and dim segments. The unit's sprite freezes mid-animation. A low-frequency bass pulse plays — two beats, like a heartbeat stopping. On the second beat, the unit resumes. The stun is exactly one tick, but the audio makes it feel longer. Players who hear the double-beat during sealed watch learn to dread it: somewhere in their architecture, a unit just locked up.

**The ghost trail:** Evicted entries leave a faint afterimage below the buffer bar — a row of translucent, desaturated blocks that persist for 3 ticks before fading completely. The ghost trail is purely cosmetic during sealed watch (it provides no actionable information until the Inspector), but it gives the buffer bar a sense of history. A unit under heavy eviction pressure accumulates a dense ghost trail, the translucent remnants piling up and overlapping like leaves on a forest floor. During quiet periods, the ghost trail fades to nothing. The visual rhythm of ghost trail density is the game's ambient indicator of buffer health — thick ghosts mean heavy churn, no ghosts mean stable memory.