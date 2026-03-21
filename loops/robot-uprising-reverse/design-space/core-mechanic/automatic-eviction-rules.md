# 2.07 — Automatic Eviction with Player-Set Rules: "Always Keep Threat Data, Evict Terrain First"

**Aspect:** 2.07 — Automatic eviction with player-set rules: condition-action eviction policies rather than simple priority lists
**Wave:** 2 (Core Mechanic Variations)
**Dependencies:** 2.01 (Fixed-Slot Buffer), 2.02 (Weighted Buffer), 2.02c (Weight-Aware Eviction Policies), 3.12 (Context Config UI)

---

## The Design Question

Previous eviction analyses (2.02c) explored policies as **named presets** — FIFO, lightest-first, heaviest-first, priority-tagged. The player selects a policy from a dropdown and the engine applies it uniformly. This aspect asks: what if the eviction policy is not a preset but a **player-authored rule set**, using the same condition-action grammar the player already uses for behavioral rules?

Instead of selecting "Lightest-First" from a dropdown, the player writes:

```
WHEN buffer full AND new_entry.type == "threat":
  EVICT oldest WHERE type == "terrain"

WHEN buffer full AND new_entry.type == "command":
  EVICT oldest WHERE type != "command"

WHEN buffer full:
  EVICT oldest
```

This is **"The Eviction Rulebook"** — a secondary rule system that fires not during the unit's decision phase but during the buffer insertion phase, governing what the unit forgets rather than what the unit does. The player programs two minds: one that acts and one that remembers.

---

## Mechanical Specification

### Grammar

Eviction rules use the same condition-action structure as behavioral rules but operate on a different domain:

**Conditions** can reference:
- `new_entry.type` — the type of the incoming signal (threat, terrain, command, observation, relay, compressed)
- `new_entry.source` — the originating unit or channel
- `new_entry.weight` — the signal's weight value (1-5)
- `new_entry.age` — always 0 for incoming data (but useful in fallback rules)
- `buffer.count(type)` — how many entries of a given type currently occupy the buffer
- `buffer.oldest(type)` — age of the oldest entry of a given type
- `buffer.full` — boolean, true when no empty slots remain

**Actions** specify what to evict:
- `EVICT oldest` — FIFO fallback
- `EVICT oldest WHERE [condition]` — evict the oldest entry matching a filter
- `EVICT lightest` — evict the entry with lowest weight
- `EVICT lightest WHERE [condition]` — evict lowest-weight entry matching a filter
- `REJECT` — refuse the incoming signal entirely (it never enters the buffer)
- `COMPRESS oldest 2 WHERE [condition]` — merge two matching entries into one compressed entry (requires Compress skill equipped)

### Evaluation Order

Eviction rules are evaluated **top-to-bottom, first-match-wins**, identical to behavioral rules. When a new signal arrives and the buffer is full:

1. Engine iterates through eviction rules in order
2. First rule whose conditions match fires
3. The specified eviction (or rejection) occurs
4. The new entry is inserted
5. If no rule matches, the engine falls back to the unit's base eviction policy (FIFO by default)

A unit with no eviction rules behaves identically to 2.01's FIFO model. The rule system is purely additive.

### Slot Budget

Eviction rules consume **context config slots** — a limited resource in the Blueprint Editor. Each unit type has a fixed number of context config slots (proposed: Scout 2, Striker 2, Relay 4, Specialist 3, Command 5). Eviction rules compete for these slots with listen/ignore toggles and other context config options. A Relay with 4 config slots might allocate 2 to channel subscriptions and 2 to eviction rules — or 1 to subscriptions and 3 to eviction rules, accepting a narrower channel intake for finer memory control.

This slot competition creates a design tension absent from preset-based eviction: the player must decide whether fine-grained memory control is worth the opportunity cost.

---

## How It Interacts with the Existing Rule System

### The Two-Rule-System Architecture

The game now has two parallel rule systems operating on different timescales:

| | Behavioral Rules | Eviction Rules |
|---|---|---|
| **When they fire** | Once per tick, during Evaluate phase | On every buffer insertion, during Perceive/Receive |
| **What they read** | Buffer contents | Incoming signal + current buffer state |
| **What they produce** | An action (move, attack, transmit) | An eviction (remove entry, reject signal, compress) |
| **Evaluation order** | Top-to-bottom, first match | Top-to-bottom, first match |
| **Slot budget** | Rule slots (per unit type) | Context config slots (shared with other config) |

The shared grammar (condition-action, ordered priority, first-match-wins) means the player learns one pattern and applies it to two domains. The Inspector can render both rule types with the same visual language — highlighted condition match, arrow to action — reducing cognitive load.

### Emergent Interaction: Rules That Reference What Eviction Rules Preserve

A behavioral rule like `WHEN buffer.contains("threat", source="recon-net"): MOVE toward threat.position` only fires if a threat entry exists in the buffer. Whether that entry survives long enough to be evaluated depends on the eviction rules. The two systems form a **preservation-action pipeline**: eviction rules curate what the unit remembers, behavioral rules act on what's remembered.

This means the player can create units with dramatically different "personalities" by changing only the eviction rules while keeping behavioral rules identical. Two Strikers with the same behavioral rules — "if threat nearby, engage; if tagged enemy, pursue; else patrol" — but different eviction rules — one preserving threat data, one preserving terrain data — will behave completely differently. The threat-preserving Striker hunts enemies. The terrain-preserving Striker navigates efficiently but blunders into ambushes. Same brain, different memory. The player learns that **what you remember shapes what you do**, a lesson that maps directly to context window engineering in real AI systems.

### Risk: Combinatorial Complexity Explosion

Two interacting rule systems multiply the state space the player must reason about. A unit with 3 behavioral rules and 3 eviction rules has 9 potential interaction pairs. A Command unit with 5 behavioral rules and 5 eviction rules has 25. Players must mentally simulate: "If this eviction rule fires on tick 12, will the behavioral rule I need on tick 13 still have the data it requires?"

This is the **"Invisible Dependency"** problem — the behavioral rule doesn't reference the eviction rule directly, but it depends on the eviction rule's output (the surviving buffer contents). Debugging why a unit failed to act requires tracing backward through the eviction log first, then forward through the behavioral rules. The Inspector must make this two-phase trace visible. Without it, the player is debugging a compiler by reading the assembly output.

---

## Strengths

1. **Expressive power.** Players can implement arbitrarily complex memory strategies: "keep exactly 2 threat entries and 1 command entry, evict everything else oldest-first." No preset system can express this.

2. **Unified grammar.** Reusing the condition-action pattern from behavioral rules means no new interaction paradigm to learn. The player who understands "IF condition THEN action" for behavior already understands it for eviction.

3. **Meta-level depth.** Eviction rules are a form of meta-programming — rules about how to manage the data that other rules consume. This is exactly the "systems that build systems" depth the game wants to create.

4. **Inspectable.** Because eviction is rule-based rather than algorithmic, the Inspector can show exactly which eviction rule fired on every tick, which entry it evicted, and why. The trace is as readable as behavioral rule traces.

5. **Teaching value.** Players internalize cache replacement policy design, garbage collection strategies, and context window curation — transferable skills to real AI engineering.

## Weaknesses

1. **Cognitive overhead.** Two rule systems with invisible dependencies are harder to reason about than one rule system plus a preset dropdown. Players who struggle with behavioral rules will find eviction rules overwhelming.

2. **Slot competition.** Eviction rules consuming context config slots means players must sacrifice channel subscriptions or other config to use them. This may discourage exploration of the feature.

3. **Debugging difficulty.** Even with Inspector support, tracing a failure through two interacting rule systems is harder than tracing through one. "My Striker didn't attack" could be because (a) no behavioral rule matched, (b) the eviction rule discarded the threat data before the behavioral rule could see it, or (c) the eviction rule rejected the threat signal on arrival. Three failure modes instead of two.

4. **Degenerate strategy: over-specification.** A player who writes 5 eviction rules covering every signal type has effectively built a static buffer layout — slot 1 is always threat, slot 2 is always command, etc. This rigidity removes the dynamic quality that makes the buffer interesting. The buffer becomes a filing cabinet rather than working memory.

5. **Tutorial burden.** Introducing eviction rules requires a dedicated mission (or at least a dedicated boot log section). The concept "your unit has rules about what to forget" is abstract and requires concrete demonstration via failure-then-fix.

---

## Interaction Effects

### With Weighted Buffer (2.02)

Eviction rules can reference `new_entry.weight` and `buffer.lightest`, making weight a first-class citizen in eviction decisions. This subsumes the simple lightest-first preset from 2.02c — the player can write `EVICT lightest` as a one-rule eviction policy that replicates the preset exactly. But they can also write `EVICT lightest WHERE type != "command"` — lightest-first but never evict commands. The preset system becomes a special case of the rule system.

### With Decay Buffer (2.03)

Decay reduces entry weight over time. Eviction rules that reference weight will interact with decay: an entry that was weight-5 when it arrived is weight-2 after 10 ticks of decay. The eviction rule `EVICT lightest` will now target decayed entries over fresh ones. The player who understands this interaction can build units with "natural forgetting" — old data decays in weight and eventually gets evicted by weight-based rules, without any explicit age-based eviction.

### With Categorized Buffer (2.04)

If the buffer has typed partitions (N slots for threats, M slots for terrain), eviction rules operate within each partition independently. The eviction rule `EVICT oldest WHERE type == "terrain"` only searches the terrain partition. This makes eviction rules more predictable (smaller search space) but also more rigid (the player has already committed to a partition scheme). The two systems — partitions and eviction rules — are partially redundant. The partition says "keep at most 3 threat entries." The eviction rule says "when evicting, prefer terrain over threat." If both are present, the partition constraint wins (it's structural) and eviction rules operate within the remaining flexibility.

### With Compress Skill (Relay)

The `COMPRESS` action in eviction rules bridges the gap between eviction and skill systems. A Relay with the Compress skill equipped could have an eviction rule: `WHEN buffer.count("threat") > 3: COMPRESS oldest 2 WHERE type == "threat"`. Instead of evicting a threat entry, it merges the two oldest threat entries into a single compressed entry, freeing one slot while preserving information density. This turns the Relay's buffer management into an active, rule-driven process rather than a passive skill trigger.

### With Information Warfare (Enemy Signal Flooding)

Enemy flooding tactics (sending weight-5 disinformation to fill player buffers) interact powerfully with eviction rules. A player who anticipates flooding can write: `WHEN new_entry.source == "enemy" AND new_entry.weight > 3: REJECT`. This is a firewall — high-weight signals from enemy sources are refused entry. Without eviction rules, the player's only defense against flooding is reducing channel subscriptions (closing the door entirely). With eviction rules, the player can filter at the signal level (checking IDs at the door).

---

## Comparable Games/Media

### Factorio: Circuit Network Conditions

Factorio's circuit network lets players write conditions like "IF iron ore > 500: enable belt" — condition-action rules that govern logistics. Robot Uprising's eviction rules occupy the same design space: conditions about data state that trigger management actions. Factorio players who master circuit conditions report the same arc this system targets: initial confusion, then an "aha" moment when they realize conditions can express any logic, then obsessive optimization. The difference is that Factorio conditions operate on a global state (item counts across the factory), while eviction rules operate on a per-unit local state (buffer contents). This locality makes Robot Uprising's version more tractable — you're debugging one unit's memory, not an entire factory's logistics.

### Gladiabots: Layered Behavior Trees

Gladiabots uses visual behavior trees where players define branching condition-action logic. The key lesson: Gladiabots initially overwhelmed players with full tree complexity, then simplified to a "basic mode" with preset behaviors and an "advanced mode" with full trees. Robot Uprising should follow this pattern — eviction presets (FIFO, lightest-first) as the basic mode, eviction rules as the advanced mode. Players who never touch eviction rules still have a functional game. Players who discover them unlock a new dimension.

### Screeps: Programmatic Memory Management

In Screeps, players write JavaScript that manages creep memory directly — `creep.memory.target = null` to forget, conditional checks before storing. Robot Uprising's eviction rules are a visual, constrained version of this pattern. Screeps' lesson: players who manage memory well dominate. Players who don't get creeps that waste CPU re-discovering information they already had. The same dynamic should apply here — units with well-tuned eviction rules make better decisions because they remember the right things.

---

## Sensory Description

### Blueprint Editor: The Eviction Rules Panel

The eviction rules live in the **Context Config** section of the Blueprint Editor, below the channel toggles and buffer capacity bar. The section header reads "Memory Policy" in small caps, with a brain icon rendered in dim cyan that brightens when hovered.

Each eviction rule is a **horizontal card** — 40px tall, spanning the full width of the config panel. The card has two halves, divided by a thin vertical line:

- **Left half (condition):** A sentence fragment rendered in monospace font on a dark slate background. `WHEN buffer full AND new_entry.type == "threat"` — keywords highlighted in amber (`WHEN`, `AND`), field references in cyan (`buffer`, `new_entry.type`), literal values in white (`"threat"`).

- **Right half (action):** The eviction instruction on a slightly darker background. `EVICT oldest WHERE type == "terrain"` — `EVICT` in a warning orange, the target descriptor in white, `WHERE` in amber, the filter in cyan.

Between the halves, a thin animated arrow pulses left-to-right in a slow heartbeat rhythm — condition flows to action. The arrow is dim grey when the rule is dormant, brightening to white when the player hovers to inspect.

**Drag handles** on the left edge of each card allow reordering. When dragged, the card lifts with a subtle shadow, other cards spread apart with a 150ms spring animation, and the insertion point glows with a thin cyan line. Dropping the card produces a soft mechanical *click* — the sound of a policy being locked into place.

**Empty rule slots** appear as dashed-outline rectangles with a centered "+" icon in dim grey. Clicking opens a **rule builder flyout** — the same condition-action composer used for behavioral rules, but with the eviction-specific vocabulary (buffer state, entry attributes, EVICT/REJECT/COMPRESS actions). The flyout slides in from the right with a 200ms ease-out, its background slightly darker than the main panel, a subtle visual frame that says "you're building something inside something."

**The fallback rule** — the last rule in the list — has a special visual treatment: its left half reads `ELSE` in dim amber on a darker background, and its right half shows the default eviction policy (`EVICT oldest`). This fallback cannot be deleted or reordered. It is the safety net. Its card has rounded bottom corners and a thin bottom border in dark grey, visually terminating the rule list.

### Sealed Watch: Eviction Rule Firing

During battle, when an eviction rule fires, the affected unit's context bar (the tiny horizontal pip strip at the bottom of its tile) produces a **targeted flash**. The evicted entry's pip flares the color associated with the eviction rule that fired — a customizable tint the player sets in the Blueprint Editor (defaulting to a muted amber). The flash is brief (200ms) and directional — the pip shrinks toward the left (older end) and vanishes, while the new entry's pip appears on the right with a subtle bloom.

When a `REJECT` action fires, the effect is different: the unit's tile border briefly flashes a cool blue — the color of refusal — and a tiny "X" glyph appears above the unit for 300ms, then fades. No pip changes because no buffer modification occurred. The sound is a soft two-note descending tone — *dink-donk* — like a door closing. Players learn to associate this sound with "my unit refused something," which is either reassuring (the firewall worked) or alarming (the firewall blocked something it shouldn't have).

When a `COMPRESS` action fires, two pips on the context bar slide toward each other and merge into a single brighter pip — a tiny animation that reads as "two became one." A faint shimmer runs along the merged pip for 500ms. The sound is a soft crystalline *tink*, like two glass beads touching.

### Inspector: Eviction Rule Trace

In the Inspector, clicking a unit and scrubbing to any tick shows the **eviction log** alongside the behavioral rule trace. The eviction log appears as a collapsible section above the behavioral rule trace, headed "Memory Decisions" in small caps.

Each eviction event is a row showing:
- **Tick number** in a dim grey circle
- **Incoming signal** — type, source, weight, rendered as a compact pill
- **Rule that fired** — the rule card from the Blueprint Editor, miniaturized, with the matching condition highlighted in bright amber
- **What was evicted** — the departing entry rendered as a fading pill sliding leftward
- **Buffer state after** — a miniature context bar showing the new composition

The eviction trace and behavioral trace are visually linked: hovering over a behavioral rule that references buffer contents highlights the eviction events that shaped those contents. A faint cyan thread connects the eviction event that preserved a threat entry to the behavioral rule that acted on it. The player sees the causal chain: "this entry survived because of that eviction rule, and then this behavioral rule used it to decide to attack." The thread is the aha-moment conduit — the visual proof that memory management and decision-making are the same system.

---

## Player Journeys

#### Journey: Daniela, 28, Data Engineer

**Context:** Mission 6. Daniela has completed the tutorial arc (Missions 1-4) and the factory introduction (Mission 5). She's comfortable with behavioral rules and has used FIFO and lightest-first presets. This mission introduces enemy Relays that flood her units' channels with high-weight disinformation. Her first attempt failed — her Strikers acted on false threat data and charged into ambushes.

**Minute 0:00 — The Post-Mortem**
Daniela opens the Inspector from her last failed run. She clicks her lead Striker and scrubs to tick 14, where it charged east into an empty corridor and got flanked. The behavioral rule trace shows: `WHEN buffer.contains("threat"): MOVE toward threat.position` — it fired correctly. She looks at the buffer state at tick 14: slot 3 holds a threat entry with weight 5, source "enemy-relay-alpha," position E7. She frowns. "E7 was empty. That's fake data." She scrubs back to tick 12: the threat entry arrived from a channel her Striker listens to. The source is the enemy Relay, not her own Scout. Her Striker can't tell the difference — it just sees "threat at E7, weight 5" and acts.

**Minute 1:30 — Discovering the Eviction Rule Panel**
Daniela returns to the Plan screen and opens her Striker's blueprint. She navigates to the Context Config section. Below the channel toggles and buffer bar, she notices the "Memory Policy" section — two dashed-outline empty slots with "+" icons, and a fallback rule reading `ELSE: EVICT oldest`. She hovers over the "+" and a tooltip reads: "Add a memory rule — control what your unit keeps and forgets." She clicks.

**Minute 2:00 — Building the First Eviction Rule**
The rule builder flyout slides in from the right. The left panel shows available conditions: `new_entry.type`, `new_entry.source`, `new_entry.weight`, `buffer.count()`, `buffer.full`. The right panel shows available actions: `EVICT oldest`, `EVICT lightest`, `REJECT`, `COMPRESS`. Daniela's eyes widen — she recognizes the condition-action format from behavioral rules. She drags `new_entry.source` into the condition area and types "enemy" into the source filter. She selects `REJECT` as the action. The completed rule reads: `WHEN new_entry.source == "enemy": REJECT`. She clicks "Add" and the rule appears as a horizontal card in the Memory Policy section, with `WHEN` and `new_entry.source` highlighted in amber and cyan.

**Minute 3:00 — Testing the Firewall**
She hits EXECUTE. The sealed watch plays out. At tick 12, her lead Striker's tile flashes cool blue and a tiny "X" appears above it — the reject sound plays, *dink-donk*. Her Striker ignores the false threat data. It continues patrolling based on real Scout observations. It engages the actual enemy at D4 on tick 18. Mission complete.

**Minute 4:30 — The Over-Correction**
Daniela feels clever. She adds the same reject rule to all her units. On Mission 7, she discovers the enemy has learned to route disinformation through captured neutral Relays — the source reads "neutral-relay" not "enemy." Her blanket reject rule misses these. She returns to the Blueprint Editor and realizes she needs a more sophisticated rule: `WHEN new_entry.weight > 4 AND buffer.count("threat") > 2: REJECT`. This says: "if I already have 2 threat entries and a very heavy new one arrives, be suspicious." She's now thinking about information trust models.

**Minute 6:00 — Resolution**
Daniela stares at her two eviction rules and three behavioral rules. She traces the interaction mentally: "Eviction rule 1 rejects direct enemy signals. Eviction rule 2 rejects suspiciously heavy threats when I already have enough threat data. Behavioral rule 1 acts on surviving threat data." She realizes she's built a spam filter. She grins. "This is just email filtering." She's internalized adversarial information management without anyone naming the concept.

**UI Annotations:**
- Memory Policy section: Bottom of Context Config panel, below channel toggles. Dark charcoal background, cyan header icon.
- Rule builder flyout: Slides from right, 300px wide. Condition picker left, action picker right, "Add" button bottom-right.
- Reject visual: Blue tile border flash (200ms), "X" glyph above unit (300ms fade), *dink-donk* audio.
- Inspector eviction trace: Collapsible "Memory Decisions" section above behavioral trace. Cyan thread linking eviction preservation to behavioral rule usage.

---

#### Journey: Marcus, 16, High School Student, Minecraft Veteran

**Context:** Mission 5. Marcus has breezed through the tutorial missions. He understands behavioral rules but has never thought about eviction — he's been running on FIFO default and it's been fine. Mission 5 introduces the factory and multi-unit coordination. His production queue produces Scouts and Strikers that communicate via the "recon-net" channel. His Strikers' 8-slot buffers fill up within 10 ticks because they're listening to recon-net (Scout observations) AND generating their own perception data. FIFO evicts everything uniformly. His Strikers keep forgetting Scout threat reports because their own terrain observations push them out.

**Minute 0:00 — The Frustration**
Marcus watches the sealed watch. Tick 8: his Scout spots an enemy at B3 and broadcasts on recon-net. Tick 10: the signal reaches Striker-1. Tick 12: Striker-1's buffer is full of its own terrain observations from ticks 10-12. The Scout's threat report from tick 8 has been evicted — pushed out by three terrain entries. Striker-1 wanders past B3 without engaging. Marcus groans. "Why does it keep forgetting?!"

**Minute 1:00 — Inspector Discovery**
He opens the Inspector, clicks Striker-1, and scrubs to tick 12. The buffer state shows 8 entries: 6 terrain observations (ticks 7-12), 1 friendly position, 1 channel noise. The "Memory Decisions" section shows a grey row for each eviction: `ELSE: EVICT oldest` fired on ticks 10, 11, and 12, each time evicting the oldest entry. The Scout's threat report (inserted at tick 10) was evicted at tick 12 — it survived only 2 ticks. Marcus sees the problem: FIFO doesn't know that the threat report is more important than terrain.

**Minute 2:30 — First Eviction Rule**
Marcus returns to Plan and opens Striker-1's context config. He sees the empty Memory Policy slots. He clicks "+" and builds: `WHEN buffer full AND new_entry.type == "terrain": EVICT oldest WHERE type == "terrain"`. This says: "when a terrain observation arrives and the buffer is full, evict the oldest terrain entry — not the oldest entry overall." Terrain replaces terrain. Threat data, command data, and Scout reports survive.

**Minute 3:30 — The Aha Moment**
He hits EXECUTE. Tick 8: Scout spots enemy at B3. Tick 10: Striker-1 receives the report. Ticks 10-14: terrain observations arrive but each one evicts the oldest terrain entry, not the Scout report. The Scout report persists in the buffer. Tick 15: behavioral rule `WHEN buffer.contains("threat"): MOVE toward threat.position` fires. Striker-1 moves toward B3. Tick 17: engagement. Kill. Marcus pumps his fist. "YES. It remembered!"

**Minute 5:00 — The Refinement**
Emboldened, Marcus adds a second rule: `WHEN buffer full AND new_entry.type == "command": EVICT oldest WHERE type != "command"`. Command signals are sacred — to make room, evict anything that isn't a command. He's building a priority hierarchy: commands > threats > terrain. Not by assigning weight values, but by writing rules about what replaces what. He's discovered that the eviction rules ARE the priority system — more expressive than a simple 1-5 weight scale because they can express conditional priorities.

**Minute 6:30 — Resolution**
Marcus has two eviction rules and the ELSE fallback. His Striker's memory now has structure: terrain is disposable, threats are preserved, commands are sacred. He opens the Inspector after the next run and sees the eviction trace — amber-highlighted rule matches, fading terrain pips, persistent threat pips. He says to no one: "It's like telling it what's important." He doesn't know the term "cache replacement policy" but he's designed one.

**UI Annotations:**
- FIFO eviction in Inspector: Grey rows showing `ELSE: EVICT oldest`, no rule highlight (fallback behavior).
- Custom eviction rule firing: Amber-highlighted condition, arrow pulsing to action. Evicted pip flares amber and shrinks left. Preserved entries glow briefly brighter — subtle reinforcement that the rule protected them.
- Rule builder for type-based conditions: Dropdown for `new_entry.type` showing all signal types (threat, terrain, command, observation, relay, compressed) as colored pills matching the context bar pip colors.

---

#### Journey: Priya, 34, ML Engineer, Factorio 2000+ Hours

**Context:** Mission 8. Priya is deep in the endgame. She's running a multi-agent architecture with Scouts, Relays, Strikers, and a Command unit. Her Command unit (14-slot buffer, 5 config slots) is the brain of her army. She's allocated 2 config slots to channel subscriptions (recon-net, command-bus), 3 to eviction rules. Her Command unit's job is to aggregate intelligence from Scouts, issue orders to Strikers, and manage the production queue. It receives 4-8 signals per tick from multiple Scouts and needs to maintain a rolling tactical picture without drowning in stale data.

**Minute 0:00 — The Architecture Session**
Priya stares at her Command unit's eviction rules, which she's been iterating on for three missions:

```
Rule 1: WHEN new_entry.type == "threat" AND buffer.count("threat") > 4:
          COMPRESS oldest 2 WHERE type == "threat"
Rule 2: WHEN new_entry.type == "terrain":
          EVICT oldest WHERE type == "terrain"
Rule 3: WHEN buffer full AND new_entry.weight < 2:
          REJECT
ELSE:    EVICT oldest
```

Rule 1 is the crown jewel: when a new threat arrives and the buffer already has more than 4 threat entries, the two oldest threats are compressed into one summary entry, freeing a slot. The Command unit maintains a compressed intelligence picture rather than raw observations. Rule 2 treats terrain as expendable. Rule 3 rejects low-weight noise — ambient pings, redundant position updates.

**Minute 1:00 — The Cascade Insight**
Priya realizes her Relays already compress Scout data before forwarding it to Command. So Command receives pre-compressed threat summaries (weight 3-4) from Relays. When Rule 1 fires and compresses two already-compressed entries, it creates a **double-compressed** summary — four original Scout observations condensed into one buffer slot. She opens the Inspector and traces the information chain: Scout observes enemy at A2 (tick 5) → Scout hook sends on recon-net (tick 5) → Relay receives on recon-net (tick 7, latency) → Relay compresses three recon-net observations into one summary (tick 7) → Relay forwards compressed summary on command-bus (tick 7) → Command receives on command-bus (tick 9, latency) → Command's Rule 1 compresses two such summaries into one (tick 9). Four original observations, one buffer slot. Priya traces the cyan thread in the Inspector from the Scout's original observation through Relay compression through Command compression to the behavioral rule that issued orders based on it. Six nodes in the causal chain. She screenshots it.

**Minute 3:00 — The Optimization Loop**
Priya notices that her Command unit's Rule 3 (`REJECT` weight < 2) is occasionally rejecting Relay heartbeat signals — low-weight pings that confirm the Relay is alive. When a Relay is destroyed and its heartbeats stop, the Command unit doesn't notice because it's been rejecting them. She needs a more nuanced rule: `WHEN new_entry.type == "heartbeat" AND buffer.count("heartbeat") > 1: EVICT oldest WHERE type == "heartbeat"`. Keep exactly one heartbeat per Relay, evict old heartbeats when new ones arrive. But she's out of config slots — she has 3 eviction rules and needs a 4th.

**Minute 4:00 — The Trade-Off**
Priya weighs her options. She can: (a) drop Rule 2 (terrain eviction) and add the heartbeat rule, relying on the ELSE fallback to handle terrain; (b) drop Rule 3 (noise rejection) and accept more buffer churn from low-weight data; (c) unsubscribe from a channel, freeing a config slot for a 4th eviction rule but losing a data source. She chooses (c) — she unsubscribes from recon-net on the Command unit, since Relays already forward filtered recon data on command-bus. The raw recon-net data was redundant. She adds the heartbeat preservation rule.

**Minute 5:30 — The Meta-Realization**
Priya leans back. She's spent 5 minutes optimizing one unit's memory management. Not its combat behavior, not its positioning, not its skills — its **forgetting policy**. And it was the most engaging 5 minutes she's had in the game. She thinks about her day job — tuning context windows for LLM agents, deciding what to include in prompts, managing token budgets. "This is literally the same problem," she says. "Fixed context, competing priorities, compression as a survival strategy." She opens her notes app and writes: "Robot Uprising eviction rules = prompt engineering as gameplay."

**Minute 7:00 — Resolution**
Priya's optimized Command unit runs Mission 8 flawlessly. The Inspector shows a buffer that's always 80-90% full, never overloading, with a mix of compressed threat summaries, fresh command acknowledgments, and exactly one heartbeat per active Relay. The context efficiency chart (a sparkline in the Inspector sidebar) is a steady green line — never amber, never red. She's built an information system that breathes. She wants Mission 9.

**UI Annotations:**
- Command unit config: 5 config slots. 2 channel subscriptions (colored pills with checkmarks), 3 eviction rule cards stacked vertically, ELSE fallback at bottom with rounded corners.
- COMPRESS action visual: Two pips on context bar slide toward each other, merge with a crystalline *tink*. The merged pip is brighter and has a subtle inner glow indicating compressed data.
- Config slot trade-off: When all slots are occupied, adding a new eviction rule grays out the "+" button with a tooltip: "No config slots available. Remove a rule or channel subscription to add." The scarcity is visible — empty dashed slots vs. filled solid cards.
- Inspector cascade trace: Cyan threads connecting Scout → Relay → Command, each compression step marked with a small diamond node on the thread. Hovering a diamond shows a tooltip: "Compressed from 3 entries to 1" with before/after buffer snapshots.

---

## The TikTok Clip

The 15-second clip: A Striker charges into an ambush — enemy signals flash on its context bar, it freezes (overloaded), dies. Cut to the Blueprint Editor. The player drags an eviction rule into the Memory Policy panel: `WHEN enemy signal AND already have 3 threats: REJECT`. Smash cut to the same battle. Same moment. The Striker's tile flashes blue — *dink-donk* — the enemy signal bounces off. The Striker turns, engages the real threat, kills it. Text overlay: **"Teach it what to forget."** The clip captures the promise: you're not controlling the unit, you're shaping its mind. The eviction rule is the visible lever. The behavioral change is the satisfying payoff.
