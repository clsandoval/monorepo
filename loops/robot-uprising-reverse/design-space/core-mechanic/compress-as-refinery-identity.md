# 2.02d — Compress as Refinery: Skill Identity and the Relay Tax

**Aspect:** 2.02d — The "compress as refinery" skill identity: if weight makes compress essential, does the Relay become mandatory? Diversity implications; alternative weight-reduction skills; weight management as a skill category
**Wave:** 2 (Core Mechanic Deep Dives)
**Dependencies:** 2.01 (Fixed-Slot Buffer), 2.02 (Weighted Buffer), 2.02a (Weight Value Design Space), 2.02b (Delivery Richness), 2.02c (Weight-Aware Eviction), 2.00f-i (Relay as SPOF)

---

## The Mechanic: "The Relay Tax"

### The Problem Statement

In the weighted buffer model (2.02), signals carry weight — a location ping weighs 1 slot, a tagged threat memo weighs 2, a structured dossier weighs 3-4. Weight changes everything about buffer economics. A Scout's 6-slot buffer that once held 6 stripped signals now holds 2 structured dossiers and is already full. A Relay's 12-slot buffer receiving tagged signals from two Scouts fills in three ticks instead of six. The math is simple and punishing: higher-fidelity signals mean faster buffer saturation.

Compress is the only skill in the locked design that reduces signal weight. A Relay running compress takes three incoming signals and produces one compressed output at roughly half the total weight. Three weight-2 tagged signals (6 slots consumed) become one weight-3 compressed signal (3 slots consumed). That is a 50% space savings. In a world where buffer space is the most constrained resource in the game, compress is not a convenience — it is oxygen.

This creates the **Relay Tax**: every army composition that wants to use weighted signals above stripped delivery must include at least one Relay. Not because the player chose a Relay-centric strategy, but because the math demands it. The Relay stops being a strategic choice and becomes a mandatory infrastructure cost, like building a supply depot in StarCraft before you can make more marines. The question is whether that mandatory infrastructure cost creates interesting decisions — or whether it flattens army composition into a solved pattern.

### The Degenerate Pattern

The worst-case scenario plays out like this. The player learns weighted signals in Mission 5. By Mission 6, they discover that tagged and structured signals fill buffers twice as fast. By Mission 7, they learn compress. By Mission 8, every army they build starts with the same skeleton: 1 Relay minimum, 2 Relays for any army with more than 4 combat units. The Relay is never the *interesting* part of the composition. It is the plumbing. Players who skip Relays lose. Players who include them feel taxed.

The production queue meta degrades. Instead of "what units do I want to build?", the question becomes "how many Relays do I need to support the units I actually want?" The Relay cost — 5 minerals, a production slot, a tile on the board — is dead weight. It does not fight, does not scout, does not hack. It sits there and compresses. The army's combat effectiveness per mineral spent drops with every Relay added.

This is the **mandatory support role** problem. Every MOBA has it. Every MMO raid has it. Someone has to play the healer. The question is whether playing the healer is fun.

---

## Five Alternative Designs

### Design A: Compress as One of Many Weight-Management Skills

Distribute weight management across the skill catalog. Compress remains on the Relay but is joined by:

- **Distill** (Specialist skill): Extracts one high-priority field from a weighted signal, discarding the rest. A weight-4 structured dossier becomes a weight-1 stripped ping containing only the field the Specialist's rule specifies (e.g., "keep only position"). Specialist already has `hack` and `extract` — distill extends the information-manipulation identity.
- **Summarize** (Command skill): Merges N signals about the same topic into one summary signal. Three separate "enemy at E5" reports from three ticks become one "persistent threat at E5, confidence: high" summary at weight-2. Command already has `reassign`, `reroute`, `prioritize` — summarize extends the meta-coordination identity.
- **Shed** (Scout skill): Voluntarily drops the heaviest signal in own buffer, freeing weight capacity. The Scout sacrifices depth for agility. Scout's identity is speed and lightness — shed makes that literal.

**What this changes:** The Relay Tax disappears. Players who want weight management can get it from Relays, Specialists, Commands, or Scouts — each with different tradeoffs. Relays compress (lossy, batch). Specialists distill (targeted, surgical). Commands summarize (semantic, contextual). Scouts shed (brute force, fast). The choice of weight-management strategy becomes a genuine composition decision rather than a forced infrastructure cost.

**The risk:** Skill bloat. Each new skill needs a UI representation, a tutorial introduction, an interaction matrix entry with every other skill. The 12-skill base (locked) becomes 15. The skill interaction matrix grows from 144 cells to 225.

### Design B: Self-Compress (Units Compress Their Own Buffer)

Every unit type gains access to a passive self-compress ability. When active, the unit spends one tick action to compress its own buffer — reducing the total weight of all buffered signals by 30%. The tick spent compressing is a tick not spent perceiving, moving, engaging, or transmitting.

**What it feels like in sealed watch:** The unit's sprite pauses. Its buffer bar flickers — the colored segments shimmer, shrink slightly, and settle into tighter positions. A faint crystallization sound, like ice forming on glass. The unit skipped a beat of awareness to reorganize its memory. For one tick, it was blind, deaf, and still. The enemies moved. The battlefield changed. But now its buffer has room.

**The tradeoff architecture:** Self-compress creates a tempo cost. A Striker that self-compresses every 4 ticks has 75% of its normal combat output. A Scout that self-compresses loses one tick of perception per cycle — that is one tick where an enemy could pass through its vision cone undetected. The player is not paying a composition tax (forced Relay). They are paying a tempo tax (reduced throughput per unit). The decision moves from "which units to build" to "when should each unit pause to clean house."

**The risk:** Micro-optimization hell. If self-compress timing matters, players will spend hours fine-tuning the exact tick interval for each unit. The Plan phase becomes a spreadsheet exercise. The sealed watch becomes a metronome: compress, act, act, act, compress, act, act, act. Rhythmic but potentially tedious.

### Design C: Auto-Compress Threshold

Buffers automatically compress when they reach a configurable fullness threshold. The player sets the threshold in the Blueprint Editor — 60%, 70%, 80%, 90%, or off. When the buffer crosses the threshold, the unit automatically spends its next available tick on self-compression. No Relay needed. No manual skill activation. The buffer manages itself.

**The configuration surface:** In the Blueprint Editor, each unit's buffer panel shows a horizontal slider: "Auto-compress at: [OFF | 60% | 70% | 80% | 90%]." A ghost overlay on the buffer bar shows where the threshold sits — a thin red line across the bar. During sealed watch, when a unit's buffer crosses the line, the bar pulses amber for one tick, the segments compress, and the unit resumes.

**The design tension:** Low threshold (60%) means frequent compression, lots of spare room, but heavy tempo cost — the unit compresses every few ticks. High threshold (90%) means rare compression, buffers often near-full, risky but minimal tempo loss. "Off" means no auto-compress — pure FIFO eviction of lowest-weight signals, same as the base game. The threshold becomes a *risk dial*: how close to the edge do you want your units to live?

**What this changes:** The Relay Tax is replaced by a per-unit configuration decision. Every unit pays its own compression cost in tempo. Relays still exist and still have compress — but Relay compress is *better* (50% reduction vs. 30% for self-compress, and the Relay doesn't sacrifice combat or perception because it has neither). The Relay becomes the *premium* weight management solution rather than the *only* one. Players who can afford a Relay get better compression. Players who cannot still have a viable path.

### Design D: Weight Decay

Signal weights naturally decrease by 1 per tick after arrival. A weight-4 structured dossier becomes weight-3 after one tick, weight-2 after two, weight-1 after three, and weight-0 (auto-evicted) after four. No unit action required. No skill needed. Time itself manages weight.

**What it feels like:** The buffer bar's segments slowly fade. A thick, saturated blue block (structured signal, weight-4) dims over ticks — first to a medium blue (weight-3), then a pale blue (weight-2), then a faint outline (weight-1), then gone. The buffer is a tide pool. Signals wash in heavy and evaporate. Old intelligence literally weighs less because the battlefield has moved on.

**The metaphor:** This is TTL (Time To Live) applied to weight instead of presence. In real network systems, packets have TTLs. In LLM context windows, older tokens have less attention weight (in some architectures). Weight decay makes the game's memory model feel organic — information is freshest when it arrives and degrades naturally.

**The risk:** Weight decay makes structured signals (the heaviest, richest signals) the most ephemeral. A weight-4 dossier auto-evicts in 4 ticks. A weight-1 stripped ping lasts indefinitely (weight can't decay below 1). This inverts the intended value hierarchy: the richest signals become the most transient, while the cheapest signals persist. Players might learn that investing in structured delivery is pointless because the data expires before it can be acted on.

### Design E: Spread Weight Management Across Unit Types

Rather than new skills, modify existing skills to have weight-management side effects. Every unit type's existing skills get a secondary weight interaction:

- **Scout — Recon (existing):** Observations the Scout generates from its own perception are always weight-1, regardless of the information density. The Scout is a lightweight sensor — its outputs are inherently compact. This does not reduce incoming signal weight, but it means Scout-generated data never contributes to buffer bloat downstream.
- **Striker — Engage (existing):** When a Striker successfully engages an enemy, all signals referencing that enemy in the Striker's buffer are reduced to weight-0 and auto-evicted. "Threat eliminated, memory freed." The Striker literally forgets enemies it has killed.
- **Specialist — Extract (existing):** The extract skill already pulls targeted data from a source. Add a side effect: extracted data arrives at weight-1 regardless of the source signal's original weight. The Specialist is a precision instrument — it takes only what it needs.
- **Command — Prioritize (existing):** When Command prioritizes a signal, all non-prioritized signals in the Command's buffer lose 1 weight. Prioritization is not just about making one thing important — it is about making everything else less important.

**What this changes:** No new skills. No new UI surface. Weight management emerges from existing mechanics. The player discovers weight reduction as a *side effect* of good play rather than as a dedicated system to learn. The Relay's compress remains the most powerful dedicated compression tool, but every unit contributes something to the weight economy.

---

## The Skill Category Concept: "Information Logistics"

All five alternatives point toward the same deeper insight: weight management is not one skill — it is a **category** of skills. The game already has implicit categories (combat: engage, evade; perception: recon, scan; communication: transmit, relay). Weight management deserves formal recognition as "information logistics" — the class of skills concerned with managing the size, shape, and lifecycle of data within the system.

Information logistics skills answer the question: *"Given that my buffers are finite and signals have weight, how do I ensure the right information survives long enough to be useful?"*

Formally categorizing this creates design space for future skills:
- **Archive:** Move a signal to long-term storage (special 2-slot reserve) at reduced weight but inaccessible to rules. Insurance against eviction.
- **Fragment:** Split a heavy signal into two lighter signals. The inverse of compress. Useful when rules need to match on different fields of the same observation.
- **Prioritize-and-purge:** Mark one signal as critical (weight locked, immune to decay) and evict the three lowest-weight signals. Nuclear option for buffer emergencies.

---

## Player Journeys

#### Journey: Sana, 22, Competitive Card Game Player (MTG, Legends of Runeterra)

**Context:** Mission 8 — full factory combat, weighted buffers, all unit types available. Sana has been optimizing army compositions since Mission 5. She treats the production queue like a deck list: exact ratios matter. She plays on PC, spreadsheet open on second monitor tracking mineral costs and buffer throughput per composition.

**Minute 0:00 — The Meta Discovery**

Sana's spreadsheet has a column labeled "Relay Tax." She has calculated that every army needs 1 Relay per 4 combat units to maintain buffer health with tagged delivery. Her current composition: 2 Scouts, 1 Relay, 3 Strikers, 1 Specialist, 1 Command. The Relay costs 5 minerals and occupies a tile near center board. She has colored the Relay row red in her spreadsheet. "Dead weight," she mutters. "Five minerals for a unit that can't fight, can't move, can't scout."

She stares at the production queue. Eight unit slots. One is always Relay. She cannot imagine a composition without it. She has tried — raw Scouts and Strikers without compression — and the buffer bars red-line by tick 15. Strikers drown in uncompressed signals and start chasing stale targets. The army disintegrates.

**Minute 1:30 — The Heresy**

Sana opens a blank blueprint: Specialist-Lean. She gives it the `extract` skill configured to pull only position data from incoming signals. If Design E's weight-reduction side effect is in play, every extracted datum arrives at weight-1 regardless of source weight. She replaces the Relay with a second Specialist. The Specialists sit mid-board, not as stationary compressors but as mobile data refiners. They move, they hack, they extract — and as a side effect, they reduce the weight of information flowing through them.

She removes the Relay from the production queue. The spreadsheet updates: combat effectiveness per mineral jumps 18%. Total buffer throughput drops 12% — but the Specialists compensate by producing cleaner, lighter signals that downstream Strikers can actually use.

**Minute 3:00 — The Sealed Watch**

She hits EXECUTE. The first 20 ticks are tense. Without a dedicated Relay, signal compression is distributed. The two Specialists extract and forward, extract and forward. Their buffer bars show a mix of green observations and yellow processed signals — they are simultaneously perceiving and processing. The Strikers' bars are healthier than expected: mostly weight-1 extracted position data, cycling fast, no red-lining.

Tick 22: an enemy cluster forms at D6. Both Scouts report it. Both Specialists extract position data and forward. Both Strikers converge. The coordination works — not through a centralized Relay hub, but through distributed extraction. The signal chain is messier, the channel map is a web instead of a clean tree, but the army responds.

Tick 30: Sana wins. She screenshots the channel map — no Relay node in the graph. She posts to the game's Discord: "Relay-free comp, M8 clear. The tax is optional."

**UI Annotations:**
- Specialist extract animation: the unit's antenna dips toward incoming signal, a thin yellow beam connects to the buffer bar, the heavy signal visually "melts" into a compact pip as weight is stripped away
- No-Relay channel map: web topology instead of star topology — more edges, no central hub, visually messier but with no single point of failure

---

#### Journey: Rodrigo, 38, Systems Administrator (Linux, Ansible, Terraform)

**Context:** Mission 9 — the penultimate mission. Rodrigo has been playing with weighted buffers since Mission 5 and has developed a strict philosophy: Relays are infrastructure, like load balancers. You do not question whether you need a load balancer. You plan for how many. He runs 3 Relays in every composition. His architectures look like data center diagrams.

**Minute 0:00 — The Compression Pipeline**

Rodrigo's board looks like a server rack drawn by an architect. Three Relays in a diagonal line from B2 to D4, each listening to different channel sets. Relay-Alpha handles `recon-north` and `recon-south`. Relay-Beta handles `threat-net` and `status`. Relay-Gamma handles `orders-echo` (the Command's redistributed signals). Each Relay compresses its inputs and forwards on a dedicated output channel. The Strikers listen only to the compressed output channels. Clean separation of concerns. Zero crosstalk.

The buffer bars during sealed watch are beautiful. The Relays' 12-slot bars cycle in a steady rhythm: blue segments fill from the right (incoming signals), yellow segments appear in the middle (compressed outputs), and the left edge evicts cleanly with only occasional amber flashes. No red-lining. The pipeline is balanced.

**Minute 2:00 — The Weight Spike**

Mission 9 introduces a new enemy type that generates structured observation data — weight-4 signals, the heaviest in the game. When Rodrigo's Scouts spot the new enemy, each observation devours 4 of the Scout's 6 buffer slots. The Scouts immediately start red-lining. They forward these heavy observations to the Relays. Relay-Alpha receives two weight-4 signals per tick. That is 8 slots of its 12-slot buffer consumed in a single tick. The Relay's compression pipeline chokes — compress needs three signals to fire, but two weight-4 signals already consume 67% of the buffer. Before the third signal arrives, the first is evicted.

The buffer bars tell the story: Relay-Alpha's bar is suddenly almost entirely thick blue blocks — the visual weight of the signals is visible in how much bar space each one consumes. The yellow compressed segments disappear. The left edge strobes red. The pipeline has collapsed.

Rodrigo leans forward. "That's a bandwidth spike. The pipe isn't big enough for the payload." He pauses. "I need to shed weight upstream."

**Minute 3:30 — The Upstream Solution**

In Plan, Rodrigo reconfigures the Scouts. Instead of forwarding raw observations of the heavy enemy type, he switches their delivery richness (2.02b) for `recon-north` to tagged (weight-2) instead of structured (weight-4). The Scouts lose detail — they no longer report the enemy's full dossier, just type and position — but the weight halves. The Relays can breathe again.

But Rodrigo wants the full data somewhere. He adds a Specialist with `extract`, configured to observe the heavy enemies directly and send structured data on a separate channel — `priority-intel` — listened to only by the Command. The Command's 14-slot buffer can absorb the weight-4 signals, and its `prioritize` skill ensures they do not clog the decision pipeline.

He has built a tiered architecture: lightweight data for tactical units (Scouts → Relays → Strikers), heavyweight data for strategic awareness (Specialist → Command). The Relays handle volume. The Command handles depth. Separation of concerns, applied to signal weight.

**Minute 5:00 — The Inspector Validation**

After a successful run, Rodrigo opens the Inspector and examines Relay-Alpha at tick 15. The buffer shows 12 slots: eight weight-2 tagged signals, two weight-3 compressed outputs, two empty slots. Healthy. He compares to the failed run: eight slots consumed by two weight-4 signals, zero compressed outputs, constant eviction. The delta is visible at a glance — the buffer visualization makes weight tangible.

He opens the Command's buffer at the same tick: 14 slots, three weight-4 structured dossiers from the Specialist (12 slots consumed), two weight-1 heartbeat pings. Near-full but not overflowing. The Command has the deep intelligence. The Strikers have the fast intelligence. The architecture works because weight management is distributed across the composition — not concentrated in the Relays alone.

**UI Annotations:**
- Weight-4 signal in buffer bar: visually four times wider than a weight-1 signal, creating an immediate gut-feel for how much space it consumes — you can *see* the buffer being eaten
- Relay compression rhythm: during healthy operation, the compress animation is a metronomic pulse — three blue segments slide left, merge with a soft crunch sound like compacting snow, and one yellow segment appears. During overload, the rhythm breaks — segments pile up, the crunch sound stutters and fails, segments are evicted before the merge completes

---

#### Journey: Tomoko, 16, First Strategy Game (Came from Stardew Valley and Animal Crossing)

**Context:** Mission 7 — weighted buffers just introduced two missions ago. Tomoko does not think in systems diagrams or server architectures. She thinks in personalities. Her Scouts are named Pepper and Salt. Her Relay is Postman. Her Strikers are Sword and Shield. She plays on Switch in handheld mode, curled up on the couch.

**Minute 0:00 — Postman Is Tired**

Tomoko notices Postman's buffer bar during sealed watch. It has been flickering amber for three missions, but she did not know what it meant. This mission, the bar is doing something new: the left edge is pulsing red every tick, and the colored segments look... fat. Thicker than she remembers. In Mission 4, the segments were uniform thin lines. Now some are double-wide, some triple.

"Postman, are you okay?" she whispers to the screen. The Relay sits motionless at C3 while its buffer bar strobe-lights. The Strikers downstream — Sword and Shield — are moving erratically, engaging one enemy then breaking off to chase another. Their buffer bars are all blue but flashing too.

**Minute 1:00 — The Inspector Discovery**

She enters the Inspector and taps Postman at tick 12. The buffer display shows 12 slots, but only 4 signals fit — each one is a wide block labeled "weight: 3" or "weight: 4." Below the buffer, six evicted signals are ghosted out with red X marks. Tomoko scrolls through the evicted signals. "These are from Pepper! Postman didn't even get to read them before they got pushed out."

She taps one of the surviving signals — a weight-4 structured dossier from Salt. The detail panel shows twelve lines of data: enemy type, position, speed, direction, threat level, last engagement history. Tomoko stares. "That's a whole story about one enemy. But it's so big it's pushing everything else out."

She taps a weight-1 stripped signal from three ticks ago — it is in the eviction graveyard. "This was a simple 'enemy spotted' from Pepper. But it got crushed by Salt's big reports."

**Minute 2:00 — The Intuitive Fix**

Tomoko does not know about delivery richness configuration or weight management skills. She does not open a spreadsheet. She looks at the problem through her own lens: Salt is writing novels, and Postman's mailbag is too small for novels.

She goes to Salt's blueprint and looks at the hooks. Salt is sending structured signals — the "Dossier" tier. She taps through the delivery options and sees "Stripped" and "Tagged." She switches Salt to Tagged. The tooltip says: "Less detail, lighter signal." She does not fully understand weight math. She just knows lighter sounds like it will fit better in Postman's bag.

She runs again. Postman's buffer bar changes immediately. The segments are thinner — weight-2 instead of weight-4. More of them fit. The left edge stops flashing red by tick 8. Sword and Shield settle into coordinated behavior — their buffer bars cycling steady blue, no more erratic chasing.

**Minute 3:30 — The Emotional Payoff**

Tomoko watches the rest of the sealed watch with her hands folded. Postman's buffer bar pulses in a gentle rhythm — blue segments in, yellow segments out, no red. The compress animation fires every few ticks: three blue blocks slide together, there is a soft chime like a music box note, and one yellow block appears. It is satisfying in the way that organizing a drawer is satisfying. Postman is not tired anymore.

She wins the mission. In the debrief, she hovers over Postman's stats: "Signals compressed: 47. Signals evicted: 3." She compares to the failed run: "Signals compressed: 11. Signals evicted: 34." The numbers tell the story: when the signals were light enough for Postman to handle, Postman did its job. When they were too heavy, Postman drowned.

She renames Postman to "Postman (Strong Now)" in the blueprint editor and moves on.

**UI Annotations:**
- Weight visualization for non-technical players: the thickness of buffer bar segments is the primary signal. No numbers needed — a fat block that eats half the bar is visibly problematic. A thin strip that barely registers is visibly light.
- Compress animation emotional design: the three-to-one merge should feel like tidying, not like industrial processing. Soft chime, not mechanical crunch. The sound shifts based on compression health: a clear bell when the Relay is operating within capacity, a strained wheeze when near overload.

---

## Strengths and Weaknesses

### If Relay Compress Remains the Only Weight-Management Mechanism

**Strengths:**
- Clean mental model. One unit does one thing. Players know exactly where to go for weight management.
- The Relay's identity is sharp and clear. It is the information logistics unit. Period.
- Production queue decision is simple: "Do I need compression? Then build a Relay."
- Creates a natural "infrastructure vs. combat" resource tension that mirrors real systems design.

**Weaknesses:**
- Army composition diversity collapses. Every viable army includes 1-3 Relays. The solved meta is obvious by Mission 8.
- The Relay Tax punishes experimentation. Trying a zero-Relay composition is not "creative" — it is "wrong."
- Relay as mandatory infrastructure makes Relay-as-SPOF (2.00f-i) even more severe. If the Relay is mandatory and the Relay is fragile, every army has a structural vulnerability that cannot be designed away.
- Players who enjoy combat-forward play styles are forced into logistics play they did not choose.
- The production queue loses one slot to a mandatory unit, reducing meaningful composition decisions from 8 to 7 (or 6, with two Relays).

### If Weight Management Is Distributed (Designs A/E)

**Strengths:**
- Army composition diversity explodes. Zero-Relay, mono-Relay, triple-Relay, and Specialist-centric compositions are all viable.
- Each unit type gains a weight-management identity, making every unit feel like a participant in the information economy.
- The Relay shifts from mandatory to premium — the best compressor, but not the only one.
- Relay-as-SPOF becomes a risk-reward choice rather than an unavoidable vulnerability.

**Weaknesses:**
- Complexity increases. More skills to learn, more interactions to track, more configuration surface in the Blueprint Editor.
- The Relay's identity blurs. If everyone can manage weight, what makes the Relay special?
- Balance becomes harder. Five units with weight-management abilities create exponentially more interaction patterns.

### If Auto-Systems Handle It (Designs C/D)

**Strengths:**
- Lowest cognitive load. The player does not need to understand weight management as a system — the game handles it.
- Smooth onboarding. New players do not hit the "Relay Tax" wall in Mission 7.
- Preserves full production queue for interesting composition decisions.

**Weaknesses:**
- Removes a strategic dimension. If buffers auto-manage weight, there is one fewer axis of mastery.
- Weight decay (Design D) undermines structured signals, warping the delivery richness (2.02b) design space.
- Auto-compress threshold (Design C) adds a configuration parameter that feels divorced from the game's fiction. "Set your auto-compress threshold" is a settings menu, not a gameplay decision.

---

## Interaction Effects

### Relay Unit Identity
If compress is the Relay's *only* unique value and compress becomes mandatory, the Relay ceases to be a character in the player's army and becomes a tax receipt. Designs A and E restore the Relay's identity by making it the *best* compressor without making it the *only* one. The Relay becomes the specialist's choice — players who invest in Relay-centric architectures get superior compression, but players who distribute weight management across their army get flexibility. The Relay's filter and amplify skills gain importance as differentiators.

### Production Queue Meta
The production queue has 8 slots (locked). Every mandatory unit reduces meaningful choice. If Relays are mandatory, the effective queue is 6-7 slots. If Relays are optional-but-premium, all 8 slots are genuine decisions. This directly impacts the feeling of "building your army" — the conveyor belt should feel like a menu of possibilities, not a checklist of requirements.

### Delivery Richness (2.02b)
Delivery richness lets players choose stripped/tagged/structured per channel. If compress is the only weight management tool, structured delivery becomes a luxury only Relay-backed armies can afford. This creates a two-tier meta: Relay armies use structured signals (deep intelligence), non-Relay armies are forced into stripped signals (shallow intelligence). Distributed weight management (Designs A/E) breaks this coupling — any composition can afford some structured delivery because every unit contributes to weight management.

### Eviction Policies (2.02c)
Weight-aware eviction and weight management are deeply intertwined. If lightest-first eviction is in play, weight management determines which signals survive. If heaviest-first eviction is in play, weight management determines which signals do not overcrowd the buffer. The eviction policy and the weight management strategy must be designed in concert. A game with lightest-first eviction and no weight management tools other than compress would make Relays doubly mandatory — the only way to create light signals that survive eviction.

### Command Agent Meta-Level
The Command unit operates at a meta-level — managing other units rather than perceiving or fighting directly. If weight management is distributed (Design E, where `prioritize` reduces non-prioritized signal weight), the Command gains an information logistics role that complements its existing coordination role. The Command becomes the army's memory manager as well as its coordinator. This deepens the Command's identity without adding new skills.

### Army Composition Diversity
The core question: does the game have 1 viable army archetype (the Relay-backed standard composition) or 4-5 (Relay-heavy centralized, Specialist-distributed, Command-managed, hybrid, Relay-free lightweight)? Distributed weight management targets 4-5 archetypes. Mandatory Relay compress targets 1-2 (centralized with varying Relay counts).

---

## Comparable Games

### Factorio — Inserters and Logistics as Mandatory Infrastructure
Factorio's inserters are the closest analog to the Relay Tax. You cannot build a factory without inserters. They move items between machines. They are not optional. They are not exciting. They are infrastructure. But Factorio makes inserters interesting through variety (basic, fast, stack, filter, long) and through optimization puzzles (inserter swing time, stack size bonuses, throughput per belt lane). The "inserter tax" is real — every build starts with inserters — but the tax creates decisions rather than eliminating them. Robot Uprising's Relay could follow this model: mandatory but varied (compress, filter, amplify as different Relay configurations creating different optimization puzzles).

### StarCraft — Supply Depots
Every Terran player builds supply depots. Every Protoss player builds pylons. Every Zerg player builds overlords. Supply infrastructure is mandatory. But supply buildings are not inert — depots lower for unit pathing, pylons power buildings and warp-in units, overlords detect cloaked enemies. The mandatory infrastructure has secondary utility. If the Relay is mandatory, it must have secondary utility beyond compress — and it does (filter, amplify). The question is whether filter and amplify are interesting enough to make the Relay feel like a supply depot (boring but necessary) or like a pylon (essential AND tactically rich).

### MOBA Support Role — League of Legends, Dota 2
In MOBAs, the support role is mandatory. A team without a support loses. Supports provide vision, healing, crowd control — infrastructure that enables carries to deal damage. The support role is the least popular role in every MOBA. Riot Games has spent a decade trying to make support "feel good." Their most successful approach: give supports agency through playmaking (engaging, saving allies with clutch abilities, controlling objectives). The lesson for Robot Uprising: if the Relay is mandatory, it needs moments of playmaking — a perfectly timed compress that saves a downstream Striker from buffer overload, visible and dramatic in sealed watch. The Relay must not be invisible plumbing.

### MMO Healing Meta — World of Warcraft, Final Fantasy XIV
Every raid needs healers. Healer scarcity is a persistent problem. FFXIV's solution: make healers deal damage between healing, giving them an active damage rotation that makes downtime engaging. The analog for Robot Uprising: if the Relay is mandatory, its non-compress ticks should feel active, not idle. Filter and amplify should fire visibly, with their own animations and sound design, making the Relay's sealed watch presence as engaging as the Striker's combat.

### Oxygen Not Included — Power Grid as Mandatory Infrastructure
ONI requires power infrastructure before any advanced building functions. Generators, wires, transformers — all mandatory, all consuming space and resources. But ONI makes power infrastructure a *puzzle*: heat management, circuit overloading, backup generators. The mandatory infrastructure creates optimization problems that are themselves fun. If compress is mandatory, the optimization of compress (timing, input selection, output routing) should be a puzzle worth solving.

---

## Sensory Design: What Compress Looks, Sounds, and Feels Like

### The Compress Animation — "The Fold"

Three signals approach from the right edge of the Relay's buffer bar. They are colored blocks — blue for received hooks, green for observations passed through — each with visible thickness proportional to their weight. They slide left along the bar, approaching the compress zone: a subtle indentation in the middle of the bar, marked by two thin chevron lines pointing inward like a gentle vise.

When three signals enter the compress zone simultaneously, the animation fires. The three blocks slow. The chevron lines pulse once — a faint amber glow. The blocks slide toward each other, overlapping, their colors blending. Blue and green merge into a warm yellow. The three separate outlines dissolve into one. The combined block is visibly shorter and denser — the same color intensity compressed into less space. A thin gold ring appears around the compressed block for one tick, then fades. The block slides left into the processed portion of the buffer, now a single yellow segment where three colored segments used to be.

### The Sound — "Compact Snow"

The compress sound is layered. First: a soft intake, like a breath drawn through teeth — the three signals being gathered. Then: a compression sound, like packing a snowball. Not mechanical, not digital. Organic and tactile. Dense and brief — 200ms total. The pitch corresponds to the weight reduction achieved: compressing three weight-2 signals into one weight-3 produces a medium-pitched crunch. Compressing three weight-1 signals into one weight-1 produces a higher, lighter tap. Compressing three weight-4 signals (if the Relay can even hold them) produces a deep, strained groan — the sound of compressing something almost too heavy to compress.

When compression fails (buffer too full, signals evicted before compression fires), the sound is a dry rasp — the intake breath without the satisfying crunch. An incomplete action. Players who hear repeated dry rasps know the Relay is choking before they see the red-lining.

### The Board-Level Read

From zoomed out (full 8x8 board visible), the Relay's compression activity is visible as a rhythmic pulse at the Relay's tile position. Healthy compression: a steady amber pulse every 3-4 ticks, like a heartbeat. Overloaded compression: rapid, irregular flickers, like a fluorescent light about to burn out. No compression (idle or broken): the tile is still, no pulse. The player scanning the board can read compression health at a glance without inspecting individual buffer bars.

### The Inspector View — "The Funnel"

In the Inspector, selecting the Relay and expanding the compress skill shows a real-time funnel diagram: three input signals on the left, one output signal on the right, connected by converging lines that pass through a narrow neck. The input signals show their original weight, type, and source. The output signal shows its compressed weight and a "contents" summary. Below the funnel, a throughput meter shows "Compression rate: X signals/tick" and "Dropped before compress: Y signals/tick." When Y exceeds X, the meter turns red. This is the Relay's vital signs monitor.
