# 8.01 — Natural Pairings: Building Block Paradigms × Buffer Models

## The Question

Robot Uprising has two independent design axes that the player experiences simultaneously: **how they build** (building block paradigm — rules UI, hooks UI, skill UI) and **how context works** (buffer model — fixed-slot, decay, weighted, categorized, shared). Not every combination produces a good game. Some pairings amplify each other's strengths; others create cognitive overload or leave affordances invisible. This analysis maps the compatibility space.

---

## The Pairing Matrix

### Axis 1: Building Block Paradigms (Player's Construction Interface)

| Code | Paradigm | Essence |
|------|----------|---------|
| **BB-A** | Sentence Strips (Rules) + Toggle Strips (Skills) + Form-Based (Hooks) | Simple, template-first, low cognitive load |
| **BB-B** | Dropdown Grid (Rules) + Slider Panel (Skills) + Channel Palette (Hooks) | Compact, spreadsheet-like, parameter-forward |
| **BB-C** | Card Stack (Rules) + Card Tray (Skills) + Hook Slot Cards (Hooks) | Physical-metaphor, tactile, collectible |
| **BB-D** | Flow Lane (Rules) + Blueprint Schematic (Skills) + Drag-and-Wire (Hooks) | Node graph, maximum expressiveness, visual programming |
| **BB-E** | Natural Language Bar (Rules) + Expander Card (Skills) + Form-Based (Hooks) | Text-forward, expert-ergonomic |
| **BB-F** | Progressive Template (Rules) + Progressive Paradigm (Skills) + Channel Palette (Hooks) | Tutorial-native, complexity ramps with campaign |

### Axis 2: Buffer Models (How Context Windows Behave)

| Code | Model | Essence |
|------|-------|---------|
| **BM-1** | Fixed-Slot (FIFO) | Discrete slots, oldest evicted, radical simplicity |
| **BM-2** | Weighted | Variable-size entries, knapsack problem, information density trade-off |
| **BM-3** | Decay | Freshness gradient, entries fade over time, temporal dimension |
| **BM-4** | Categorized | Typed compartments, filing cabinet, allocation puzzle |
| **BM-5** | Shared | Pooled memory across units, blackboard/mesh/stigmergy variants |

---

## Tier 1: Natural Pairings (High Synergy)

### Pairing 1: "The Training Wheels" — BB-F (Progressive Template) × BM-1 (Fixed-Slot)

**Why they pair:** Both systems are designed around simplicity-first, complexity-later. Fixed-slot buffers are the easiest to understand (N slots, oldest leaves), and progressive templates prevent the cold-start problem. Together, they create the gentlest possible onboarding.

**How it works mechanically:**
- Mission 1: Player sees 3 pre-built rules on a Scout. Buffer is 6 slots, shown as 6 horizontal pips. The template handles everything. Player watches, reads Inspector, learns "context window = memory."
- Mission 3: Player can now modify templates. Buffer is still FIFO. The player's first mistake — editing a rule that floods the Scout with observations — causes buffer overflow. The 6 pips all turn red, the unit stutters. Cause and effect is crystal clear because there's only one variable (slot count) and one eviction policy (oldest goes).
- Mission 5: Factory unlocked. Progressive template reveals parameter sliders. Buffer is still fixed-slot, but now the player configures listen/ignore channels. The mental model is stable: "more channels = more data = overflow risk."

**The TikTok clip:** A beginner drags one rule out of a Scout's template. Next tick, the Scout walks into three enemies and freezes — all 6 buffer pips flash red simultaneously. The player's face in the corner cam goes from confident to horrified. Caption: "I touched ONE thing."

**Strengths:**
- Lowest possible cognitive floor
- Every failure is diagnosable from buffer state alone
- Campaign teaches buffer→rules→hooks→skills in clean sequence
- Perfect for "someone who's never played a strategy game"

**Weaknesses:**
- Fixed-slot FIFO creates a ceiling — veterans hit a point where they want finer eviction control but can't get it
- Templates may feel patronizing to experienced players by Mission 5
- No information density trade-off means Compress skill is purely about slot efficiency, not weight optimization
- Replay value limited — once you understand FIFO, there's nothing more to learn about buffers

**Interaction effects:**
- Pairs with **sealed watch** perfectly — 6 discrete pips are readable at 1x speed from the isometric view
- Inspector decision trace is maximally clear — "rule fired because slot 3 had enemy_spotted (arrived tick 8, FIFO position 3/6)"
- Context overload stun is binary and dramatic — one tick of total paralysis when the 7th entry arrives
- Compress skill is clearly valuable but not mandatory — reduces slot count, extends operational time
- Enemy noise flooding is a clear threat — each noise entry pushes one real observation out

---

### Pairing 2: "The Engineer's Desk" — BB-D (Flow Lane / Node Graph) × BM-4 (Categorized)

**Why they pair:** Both systems are about explicit spatial organization of information. The flow lane lets players wire logic visually; the categorized buffer lets them allocate memory visually. The player who thinks "I want THREAT data to flow to this rule node" is the same player who thinks "I want 3 slots reserved for THREAT data." Visual + visual = coherent mental model.

**How it works mechanically:**
- The plan screen shows a node graph (left) wired to a buffer allocation panel (right). Condition nodes pull from specific compartments. A "THREAT detected" condition node has a visible wire leading to the THREAT compartment of the buffer visualization. The player can see: "This rule fires when slot 1 or 2 of my THREAT compartment has data."
- Dragging the compartment divider (resizing THREAT from 2→3 slots) updates the flow lane's capacity annotations in real-time. The condition node now shows "3 possible inputs" instead of 2.
- Empty compartments are visible as grey dashed outlines in the buffer panel, and the corresponding condition nodes in the flow lane glow amber to indicate "this rule can never fire — no data will reach it."

**The TikTok clip:** A veteran drags the COMMS compartment divider to zero. Every hook-related node in their flow graph goes grey simultaneously. They grin — they just built a communication-deaf striker that runs on pure perception. The text: "who needs friends when you have eyes."

**Strengths:**
- Maximum transparency — every data flow is visible, every allocation decision has visible consequences
- The "empty drawer" signal from categorized buffers maps directly to "dead node" highlighting in the flow lane
- Supports the deepest optimization gameplay — wiring + allocation creates a 2D puzzle surface
- Naturally teaches real distributed systems concepts (typed message queues, reserved capacity)
- Streamable and spectatable — viewers can see the architecture without understanding the rules

**Weaknesses:**
- Highest cognitive floor of any pairing. Requires understanding nodes, wires, compartments, dividers simultaneously
- Screen real estate pressure — flow lane + buffer panel + board preview may not fit without tabs or scrolling
- Not accessible to beginners — this is a Mission 7+ paradigm at earliest
- Configuration time per unit increases dramatically (15-30 seconds vs. 5-10 for simpler pairings)
- Risk of "Factorio spaghetti" — complex architectures become unreadable even to their creator

**Interaction effects:**
- Inspector replay becomes extraordinary — frozen flow graph with highlighted active paths at each tick
- Channel palette (hooks) becomes redundant — the flow lane already visualizes channel connections
- Command agent's reassign/reroute skills gain maximum legibility — watching a node graph reconfigure mid-battle
- Context overload in categorized buffers triggers per-compartment, which the flow lane shows as individual node warnings rather than total unit stun — potentially confusing during sealed watch
- Compress skill must declare input/output types — compresses 3 THREAT entries into 1 THREAT entry (stays in compartment)

---

### Pairing 3: "The Darkroom" — BB-A (Sentence Strips) × BM-3 (Decay)

**Why they pair:** Sentence strips are the simplest construction paradigm ("WHEN enemy_spotted → DO engage"). Decay buffers add a single new dimension — time. Together they create a game about *timing* without overwhelming the player with spatial complexity. The question shifts from "what's in my buffer?" to "how fresh is my information?"

**How it works mechanically:**
- Rules are simple sentence strips: "WHEN enemy_spotted (freshness > 0.5) → DO engage." The freshness threshold is a small slider embedded in the condition token — the only parameter beyond the basic WHEN/DO structure.
- The buffer visualization shows slots fading from vivid green (fresh) to ghostly translucent (stale) to gone. No compartments, no weights — just slots and time.
- A Scout's 6-slot buffer after 10 ticks shows: slot 1 at 0.8 freshness (recent observation), slots 2-3 at 0.4 (aging signals), slots 4-6 empty (entries decayed away). The rule "WHEN enemy_spotted (freshness > 0.5) → DO engage" would fire on slot 1 but ignore slots 2-3 — the enemy was there 6 ticks ago, but is that still true?

**The TikTok clip:** A relay unit's buffer pips slowly fade from green to amber to transparent, one by one, like candles going out. The unit stands perfectly still, staring into empty memory. The text: "she forgets."

**Strengths:**
- Emotional resonance — "memories fade" is universally understood, no gaming literacy needed
- Creates a unique "freshness addiction" failure mode — setting thresholds too high means the unit ignores all data older than 2 ticks
- Compress skill gains narrative depth — compressing a signal resets its freshness, literally "refreshing a memory"
- Natural difficulty curve — early missions have slow decay (0.05/tick), late missions crank it up (0.15/tick)
- Beautiful in Inspector — freshness sparklines show sawtooth patterns when preserve-hooks are active

**Weaknesses:**
- Decay rate per data type is a hidden system — player can't configure it without understanding type taxonomy
- Visual readability at isometric scale — can players distinguish 0.4 opacity from 0.6 opacity on tiny buffer pips?
- Ghost data problem — a 0.11 freshness entry still occupies a slot but is functionally useless. Waste isn't visible until Inspector
- Rule freshness thresholds add a configuration axis that sentence strips were designed to avoid

**Interaction effects:**
- Sealed watch becomes a time-lapse of forgetting — dramatic, melancholic, distinctive
- Enemy noise flooding becomes about *refresh* — not just filling slots but resetting decay timers on junk data
- Signal latency (1 tick/hop) compounds with decay — a 4-hop signal arrives with freshness already at 0.6
- Context overload mechanic changes — instead of hard overflow, units gradually lose coherence as everything fades. Stun could trigger when all entries drop below 0.2 simultaneously ("complete memory loss")
- The preserve hook action becomes a critical skill — "keep this memory alive" as an active choice

---

## Tier 2: Functional Pairings (Compatible, Not Synergistic)

### Pairing 4: "The Card Collector" — BB-C (Card Stack) × BM-2 (Weighted)

**Why it works:** Cards have natural stats (weight, cost, rarity). Weighted buffer entries have natural stats (size, priority). The metaphor aligns — equipping a "heavy" rule card that processes rich data at weight-3 entries feels like equipping a legendary item in an RPG. The knapsack problem of weighted buffers maps to the deck-building constraint of "I can only carry 6 cards."

**How it plays:**
- Each rule card shows its "memory cost" — how much buffer weight it consumes when processing. A simple "WHEN enemy → ENGAGE" costs 2 weight to evaluate (reads one observation). A complex "WHEN enemy AND ally_nearby AND NOT buffer_full → ENGAGE with flank" costs 5 weight to evaluate (reads three entries).
- Skill cards show weight throughput — Compress transforms 3×weight-2 entries into 1×weight-2, a net savings of 4 weight.
- The plan screen feels like building a deck for a card game: card tray on the right, weight budget shown as a bar that fills as you equip cards.

**The TikTok clip:** Player drags a legendary "Master Compress" card onto a Relay, and the weight budget bar drops by 8 — suddenly there's room for two more skill cards. The player pumps their fist. Card game energy.

**Strengths:**
- Appeals to MTG/Hearthstone/Slay the Spire audience directly
- Weight becomes a natural "mana cost" equivalent — universally understood in card game terms
- Collection/unlock progression feels natural — new cards with better weight efficiency
- Information density trade-off is tangible: "do I want the cheap ping card or the expensive recon dump card?"

**Weaknesses:**
- Card metaphor may obscure the engineering lesson — weight isn't really "mana," it's token count
- Collectible-card progression conflicts with Zachtronics ethos (all tools available, skill is the gate)
- Weight optimization becomes deck-building optimization — familiar but less novel
- Inspector must translate card language back into buffer mechanics for diagnosis

**Interaction effects:**
- Blueprint Codex becomes a card collection screen naturally
- Production queue as "deck order" — first card built first
- Gauntlet becomes a "tournament" with "meta" builds — card game competitive language applies
- Seasonal modifiers as "banned/restricted list" — card game players immediately understand

---

### Pairing 5: "The Dashboard" — BB-B (Dropdown Grid) × BM-3 (Decay)

**Why it works:** Both are data-dense, parameter-forward interfaces. The dropdown grid is a spreadsheet; decay adds a time column. Together they create a monitoring dashboard feel — the game feels like operating a control center, not playing a game. This resonates with the "managing smart autonomous systems" fantasy.

**How it plays:**
- The plan screen is a spreadsheet: columns for CONDITION, QUALIFIER (includes freshness threshold dropdown), ACTION. Skill configuration is a parameter grid below. Buffer visualization is a time-series chart.
- The player reads the decay forecast chart: "At current signal rate, Scout's observation freshness drops below 0.5 at tick 8. Rule 'engage on enemy' will stop firing by tick 9." They adjust the freshness threshold dropdown from 0.5 to 0.3 to extend the rule's effective lifespan.
- Inspector becomes a full telemetry dashboard — sparklines, decay curves, threshold crossings highlighted.

**Strengths:**
- Speaks directly to the SRE/DevOps audience — "this is Grafana for robots"
- Maximum information density per pixel
- Spreadsheet familiarity lowers learning curve for data-oriented players
- Decay forecasting creates a unique pre-battle optimization phase
- Career mode analytics (cross-match patterns) feel like natural extensions

**Weaknesses:**
- Least visually appealing pairing — spreadsheets aren't TikTok material
- Completely alienates non-technical audience
- "Fun" is buried under "useful" — risk of feeling like work
- Touch/controller adaptation is painful — dropdown grids need mouse precision

**Interaction effects:**
- Campaign map feels disconnected — Philippine archipelago beauty vs. spreadsheet workbench jarring
- Boot log narrative voice conflicts — poetic diegetic intro followed by dropdown grid
- Sealed watch emotional beat undermined — hard to feel awe when you've been staring at a spreadsheet
- But: Inspector phase is OUTSTANDING. This is the pairing where Inspector truly shines as an analytical tool

---

### Pairing 6: "The Terrain Game" — BB-A (Sentence Strips) × BM-5 (Shared / Stigmergy)

**Why it works:** Simple rules + map-based shared memory turns the game into a spatial puzzle. Instead of configuring complex per-unit buffers, the player configures simple rules and then places units to create information territories. The board IS the buffer.

**How it plays (Stigmergy variant):**
- Rules are simple: "WHEN tile_marked_enemy → DO engage." No buffer allocation, no decay rates.
- Units tag tiles they can see. Tagged tiles glow cyan (fresh) → amber (fading) → dark (expired, 5 ticks).
- The player's job is positioning: place scouts where they create overlapping sight lines. Place relays at intersections to amplify marks. Place strikers where marks converge.
- The plan screen shows a ghost overlay of mark coverage. Bright areas = well-observed. Dark gaps = blind spots. The player drags unit spawn positions to maximize coverage.

**The TikTok clip:** Birds-eye view of the 8x8 board. Tick by tick, tile marks spread outward from a Scout like ripples in water. Then a second Scout's ripples overlap — the intersection tiles glow brighter. A Striker waiting in that bright zone engages an enemy the moment it enters the lit area. Satisfying.

**Strengths:**
- The board becomes the primary interface, not the workbench — more accessible, more visual
- Emergent behavior from simple rules + spatial positioning — exactly the "watch your architecture work" fantasy
- Marks are visible to enemies — creates a stealth/territory trade-off on the visible board
- Natural for touch devices — tap to place, watch marks spread
- Teaches distributed systems through space (pheromone trails, sensor networks)

**Weaknesses:**
- Per-unit buffer configuration becomes vestigial — most decisions are about positioning, not wiring
- Hooks become less important (units communicate through terrain, not channels)
- Command agent's reroute/reassign skills don't translate well to stigmergy
- Harder to teach context window concept — marks on tiles aren't obviously "memory"
- The meta-level (systems that build systems) becomes harder to reach — stigmergy is emergent, not engineered

**Interaction effects:**
- Campaign map → battlefield terrain becomes crucial — biome affects mark persistence?
- Signal latency concept changes — marks are instantaneous (they're on the tile), so the 1-tick-per-hop rule bends
- Inspector shows mark heatmap replay instead of per-unit buffer timeline — fundamentally different analysis
- EM emissions from hooks become EM emissions from marks — every mark is detectable
- Enemy counter-strategy: "mark erasure" — enemy units that walk through your marks and clear them

---

## Tier 3: Antagonistic Pairings (High Friction)

### Pairing 7: "The Overload" — BB-D (Flow Lane) × BM-2 (Weighted) × BM-4 (Categorized)

**Why they clash:** Each system independently requires significant cognitive investment. Flow lane demands understanding nodes, wires, and dataflow. Weighted buffers demand understanding variable-size entries and knapsack math. Categorized compartments demand understanding type allocation. Together, the player must simultaneously reason about: which compartment does this data go to, how much does it weigh, what's the eviction priority, and how does it flow through my node graph? This is configuration paralysis.

**The failure mode:** A new player opens the plan screen. On the left: a node graph with 8 nodes and 12 wires. On the right: a buffer visualization with 4 colored compartments, each showing weight bars with variable-width entries. The player needs to: (1) understand the rule logic in the graph, (2) understand which compartments feed which nodes, (3) understand that entries have different weights, (4) understand how weight interacts with compartment capacity. They close the game.

**When it might work:** A "Mastery Mode" unlocked after completing the campaign with simpler pairings. The audience is someone who has already internalized buffer mechanics and wants the full engineering simulation. Think: TIS-100 players who deliberately seek the hardest Zachtronics game.

---

### Pairing 8: "The Identity Crisis" — BB-C (Card Stack) × BM-5 (Shared / Stigmergy)

**Why they clash:** Cards are about per-unit identity — MY deck, MY hand, MY build. Shared buffers dissolve unit identity — memory is collective, actions emerge from the group. The player building a "card deck" for one unit discovers that the unit's buffer is actually a shared pool, and their carefully curated cards interact with everyone else's data in unpredictable ways. The individual optimization of deck-building conflicts with the collective dynamics of shared memory.

**The dissonance:** "I built this Scout with a perfect 6-card deck" → but the Scout's shared pool is contaminated by a Relay's compressed signals and a Command agent's directives. The deck metaphor promises control; the shared buffer delivers chaos.

---

## The Campaign Progression Pairing

The most powerful approach may be **progressive pairing** — different pairings at different campaign stages:

| Campaign Phase | Building Block | Buffer Model | Why |
|---------------|---------------|-------------|-----|
| Missions 1-3 | BB-F (Progressive Template) | BM-1 (Fixed-Slot) | Zero cognitive overhead. Learn rules-as-templates, buffer-as-slots. |
| Mission 4 | BB-A (Sentence Strips) | BM-1 (Fixed-Slot) | First "real" rule authoring. Buffer stays simple to isolate the new skill. |
| Mission 5 | BB-A (Sentence Strips) | BM-4 (Categorized, Hard Walls) | Factory introduction. New axis: buffer allocation. Sentence strips stay familiar. |
| Missions 6-7 | BB-B (Dropdown Grid) | BM-3 (Decay) | Freshness thresholds via dropdown. Command agent parameter density needs grid. |
| Missions 8-9 | BB-D (Flow Lane) | BM-4 (Categorized, Soft Walls) | Full visual programming. Compartments visible in graph. Maximum depth. |
| Mission 10 | BB-D (Flow Lane) | BM-3 (Decay) + BM-4 (Categorized) | Final boss. Full complexity. Both temporal and spatial buffer management. |
| Gauntlet | Player choice | Player choice | Unlock all paradigms and models. Self-select difficulty. |

This "Progressive Pairing" approach means the game teaches TWO independent complexity ramps simultaneously — the building block paradigm evolving alongside the buffer model — but never increases both at the same time. Each mission either introduces a new construction tool OR a new buffer mechanic, not both.

---

## Player Journeys

### Journey: Mika, 14, Manila — First-time gamer, Mission 3 → Mission 5 transition

**Context:** Mika has completed Missions 1-3 using progressive templates and fixed-slot buffers. She's comfortable with "when enemy spotted, evade" sentence strips. She's about to hit Mission 5 where the factory unlocks and buffer model shifts to categorized.

**Minute 0:00 — The Factory Shock**
Mission 5 boot log plays. "PRODUCTION SUBSYSTEM ONLINE. BLUEPRINT ARCHITECTURE ENABLED. CONTEXT ALLOCATION: MANUAL." Mika reads the new text scrolling in dot-matrix cyan. Her previous missions had pre-placed units — now she sees an empty board with a glowing factory in the corner.

The workbench has changed. Instead of one unit's rules, she sees a blueprint panel with tabs: SCOUT, STRIKER, RELAY. She clicks SCOUT.

**Minute 0:30 — The New Buffer Panel**
The familiar 6-pip buffer bar is gone. In its place: a glass tube divided into colored sections. Red (THREAT: 2 slots), blue (POSITION: 1 slot), green (TERRAIN: 1 slot), cyan (COMMS: 2 slots). A tooltip appears on hover: "Your Scout's context window is organized by type. Drag dividers to reallocate."

Mika's sentence strips are still there — the construction paradigm hasn't changed. "WHEN enemy_spotted → DO evade" still looks the same. But now a small colored dot appears next to "enemy_spotted" — red, indicating it reads from the THREAT compartment.

She thinks: "So enemy_spotted uses the red slots. And I have two of those. What if I see three enemies?"

**Minute 1:15 — The Divider Experiment**
Mika drags the divider between THREAT and POSITION. THREAT grows to 3, POSITION shrinks to 0. The POSITION section collapses with a gentle squeeze animation. On her sentence strip, the condition "resource_nearby" — which reads from POSITION — flashes amber with a warning icon: "⚠ 0 slots allocated."

She drags it back. She tries allocating all 6 slots to THREAT. Every non-THREAT condition goes amber. She laughs — it's like those sliding puzzles where you can't have everything.

**Minute 2:00 — First Deploy**
She keeps the default allocation and hits EXECUTE. The factory produces Scouts. On the sealed watch, each Scout's buffer bar now shows the colored sections — tiny but visible. She watches a Scout approach two enemies. Both observations fill the THREAT compartment (2/2). A third enemy appears. The Scout's THREAT section flashes — but instead of pushing into COMMS, the third observation is rejected. A small amber spark above the Scout.

In the debrief Inspector, she clicks the Scout. The categorized buffer view shows the frozen state: 2/2 THREAT (enemy_alpha, enemy_beta), 0/1 POSITION, 0/1 TERRAIN, 1/2 COMMS (relay signal). The third enemy observation shows as a red dashed outline — "rejected: THREAT compartment full."

She thinks: "If I'd given THREAT 3 slots, the Scout would have seen all three enemies. But then I'd lose a COMMS slot..." She hits retry. The sentence strips are unchanged — only the divider moves. One new variable at a time.

**Minute 4:00 — The Aha Moment**
On her third retry, Mika has THREAT at 3, COMMS at 2, TERRAIN at 1, POSITION at 0. Her Scouts see all enemies but can't detect resources. She loses because her Strikers can't find the enemy base — they never get position data. She opens Inspector and sees the POSITION compartment empty across all ticks. "Zero slots allocated to POSITION. Zero position data received. Strikers patrolled randomly."

The filing cabinet metaphor clicks. She needs a little bit of everything — or she needs specialized Scouts (THREAT-heavy) and Relays (COMMS-heavy). Different units, different allocations. That's what blueprints are for.

**UI Annotations:**
- Buffer panel: Glass tube with colored sections, draggable divider handles snap to integer positions
- Sentence strip condition dots: Small colored circles (2px) indicating which compartment the condition reads from
- Amber spark: 4-frame animation (12×12px) above unit when data is rejected due to compartment being full
- Inspector rejected-entry: Red dashed outline where the entry would have been, with tooltip showing full entry details

---

### Journey: Diego, 31, Cebu — Software engineer, Mission 8, "The Engineer's Desk" pairing

**Context:** Diego has been playing with progressive pairings throughout the campaign. Mission 8 introduces the flow lane paradigm alongside categorized buffers with soft walls. He builds distributed systems professionally and has been waiting for this.

**Minute 0:00 — The Paradigm Shift**
Boot log: "DECISION ARCHITECTURE VISUALIZATION: ENABLED. FLOW GRAPH RENDERING ACTIVE." The workbench transforms. Where sentence strips used to be, a canvas appears with nodes and connection points. Diego's existing rules are auto-translated: each sentence strip becomes a condition node (left) wired to an action node (right).

On the right side, the categorized buffer panel now shows soft-wall dividers — dashed lines instead of solid, indicating that data can overflow between compartments when needed. A small label: "Soft allocation — overflow permitted when adjacent compartment has capacity."

**Minute 0:45 — First Wire**
Diego drags a wire from a "THREAT detected" condition node to an "ENGAGE" action node. A glowing cyan line appears between them. He notices the wire passes through a buffer compartment indicator — a small colored junction showing that this rule's data path flows through the THREAT compartment. He drags another wire from a "COMMS received" condition to a "REROUTE" action. This wire routes through the COMMS compartment.

He's building a circuit diagram for his Scout's brain.

**Minute 2:00 — The Overflow Discovery**
Diego builds an aggressive configuration: 4 THREAT slots, 1 COMMS, 1 TERRAIN (soft walls). He expects THREAT to overflow into TERRAIN when he encounters 5 enemies. He hits EXECUTE.

In the sealed watch, his Scout encounters a swarm. The THREAT section fills to 4/4, then — with a subtle elastic animation — a fifth THREAT entry slides into the TERRAIN section. The TERRAIN section's border wavers, its green tint mixing with red. The terrain entry that was there is gently pushed aside, demoted to a ghost outline.

In Inspector, the flow graph is frozen at tick 14. The "TERRAIN check" condition node is greyed out with a small ⚠: "Compartment borrowed by THREAT overflow." The wire from that node goes dark. His patrol logic stopped working because his threat processing stole its memory.

Diego grins. This is exactly like a Java heap where garbage collection pauses affect real-time threads. He adds a MIN-1 guarantee to TERRAIN — one slot can never be borrowed.

**Minute 4:00 — The Compound Architecture**
He builds a Command agent with 14 buffer slots, 6 hook slots, and the flow lane looks like a proper system diagram. Condition nodes fan into Boolean AND/OR gates (small triangular nodes). Outputs route through action nodes with priority annotations. The buffer panel shows 5 compartments with guaranteed minimums and soft overflow rules.

He screenshots it and posts to Discord: "My Command agent's decision architecture. Yes, that's a priority inversion guard." Twenty responses in an hour.

**UI Annotations:**
- Flow lane canvas: Infinite scroll, pinch-to-zoom, node auto-layout with manual override
- Buffer compartment junctions: Small colored diamonds (8×8px) on wires indicating which compartment the data path flows through
- Soft wall divider: Dashed line with small expand arrow icons, elastic animation on overflow
- Overflow visualization: Entry slides across compartment boundary with 200ms transition, border color blends
- Guaranteed minimum badge: Small lock icon (🔒) on compartment header when MIN > 0

---

### Journey: Prof. Adaora, 52, Lagos — CS professor, evaluating for curriculum use

**Context:** Adaora has been watching her students play Missions 1-4 with the Training Wheels pairing (BB-F × BM-1). She's at a faculty meeting discussing whether to adopt Robot Uprising for her "Operating Systems: Memory Management" module. She opens Mission 6 to evaluate the decay buffer model.

**Minute 0:00 — The Pedagogical Question**
Adaora opens the plan screen. She's been using sentence strips, which she likes — they map to the pseudocode she writes on whiteboards. The buffer panel now shows a new element: a freshness gradient. Each slot has a small opacity indicator. A tooltip reads: "Data freshness decreases each tick. Stale entries are removed when freshness drops below threshold."

She thinks: "This is cache invalidation. My students struggle with this concept for weeks. Let me see how the game teaches it."

**Minute 0:30 — The Freshness Slider**
She hovers over a sentence strip condition: "WHEN enemy_spotted → DO engage." A small slider appears below the condition: "Freshness threshold: 0.5." She adjusts it to 0.8, then 0.2, watching the board ghost update. At 0.8, the Scout's engagement range shrinks — it only acts on very fresh data, meaning close and recent observations. At 0.2, the engagement range extends far — the Scout acts on stale data, potentially engaging where an enemy used to be 8 ticks ago.

She murmurs: "This is TTL configuration. And the students will discover it through play."

**Minute 2:00 — The Inspector Revelation**
She runs a battle and opens Inspector. The freshness sparkline shows a sawtooth wave — freshness jumps to 1.0 when a new observation arrives, then declines at 0.10/tick. She clicks a specific tick where the Scout froze. The decision trace reads:

```
Tick 14 — Scout BANTAY-1
Rule 1: WHEN enemy_spotted (freshness > 0.5) → DO engage
  ✗ Slot 1: enemy_alpha (freshness 0.38) — BELOW THRESHOLD
  ✗ Slot 2: enemy_beta (freshness 0.22) — BELOW THRESHOLD
  No rule matched. Action: IDLE.
```

The Scout knew enemies were nearby — the data was in its buffer — but the information was too old to trust. Adaora leans back. "This is stale read detection. My students will understand this in five minutes. It takes me three lectures."

**Minute 3:30 — The Curriculum Decision**
She configures a Relay with the Compress skill and the Preserve hook. Compress resets freshness to 1.0 on its output. Preserve refreshes an ally's buffer entry. She watches the Inspector: compressed signals arrive at the Striker with freshness 1.0, while raw observations arrive at 0.6 after hop latency. The Striker always trusts compressed data over raw observations — not because of a priority rule, but because compressed data is fresher.

"This teaches students that data processing pipelines add value through freshness renewal, not just compression. The system is teaching cache warming strategies." She writes in her evaluation notes: "Adopt for OS module. Missions 1-4 teach FIFO eviction. Missions 5-7 teach TTL and cache invalidation. Missions 8-10 teach priority-based eviction and garbage collection. The game covers my entire syllabus."

**UI Annotations:**
- Freshness slider: Inline below condition token, 0.0–1.0 range, color shifts from red (low threshold = trusting) to blue (high threshold = paranoid)
- Sparkline: 60px × 20px SVG in Inspector sidebar, green (fresh) → amber (aging) → red (stale), sawtooth wave pattern
- Decision trace: Monospace text panel in Inspector, each rule shows slot evaluations with freshness values and threshold comparison result

---

## Discovered Aspects

This cross-cutting analysis reveals several unexplored regions:

1. **8.01a — Progressive pairing campaign pacing:** Exact mission-by-mission breakdown of which paradigm and buffer model are active, with transition moments designed as boot log events. How does the player experience a paradigm SHIFT mid-campaign? Does the workbench transform in a single boot log, or gradually across missions?

2. **8.01b — Pairing-specific Inspector layouts:** Each pairing demands different Inspector tools. Flow Lane needs frozen graph with active highlights. Decay needs freshness sparklines. Categorized needs compartment timeline. How does the Inspector adapt when the pairing changes across the campaign?

3. **8.01c — Gauntlet pairing selection as competitive expression:** In Gauntlet (post-campaign PvP), players choose their own pairing. Do they declare it publicly? Does choosing "Flow Lane + Categorized" signal mastery? Is there a matchmaking rating per pairing? The pairing itself becomes a strategic choice.

4. **8.01d — Pairing-specific sealed watch readability:** Each buffer model produces different visual noise on the isometric board. Fixed-slot = clean discrete pips. Decay = fading opacity (potentially illegible). Weighted = variable-width bars (noisy). Categorized = colored sections (busy). Which pairings are readable at 2x speed during sealed watch?

5. **8.01e — The "Stigmergy Fork" — a fundamentally different game:** Pairing 6 (Sentence Strips × Shared/Stigmergy) produces a game so different from the locked design that it's essentially an alternate universe. The board replaces the workbench as primary interface. Should this exist as a game mode, a mission variant, or a spin-off?

---

## Comparable Games / Media

| Game | Pairing Equivalent | What It Teaches Us |
|------|-------------------|-------------------|
| **Gladiabots** | BB-A (Sentence Strips) × BM-1 (Fixed-Slot) | Gladiabots uses priority-ordered IF/THEN rules with no buffer mechanic. Adding even simple buffers on top of this paradigm creates a fundamentally richer game. |
| **Factorio** | BB-D (Flow Lane) × BM-2 (Weighted) | Factorio's belt system is a visual flow paradigm with throughput (weight) concerns. Players learn to read the factory as a diagram. The flow lane pairing captures this. |
| **Opus Magnum** | BB-B (Dropdown Grid) × BM-1 (Fixed-Slot) | Opus Magnum's instruction editor is a compact grid. The optimization histograms work because the mechanics are simple enough to compare. Simple pairings enable histogram comparison. |
| **Slay the Spire** | BB-C (Card Stack) × BM-2 (Weighted) | Card energy costs map to weighted buffer entries. Deck-building as knapsack optimization. The card metaphor makes weight feel natural. |
| **Into the Breach** | BB-F (Progressive Template) × BM-1 (Fixed-Slot) | Into the Breach's perfect-information design works because mechanics are fully transparent. The Training Wheels pairing achieves the same: every variable is visible, every outcome is predictable. |
| **Screeps** | BB-E (Natural Language) × BM-3 (Decay) | Screeps players write JavaScript with garbage-collected memory. The text-forward paradigm + temporal buffer management is what Screeps players already do, wrapped in a game UI. |

---

## Sensory Comparison Table

| Pairing | Plan Screen Feel | Sealed Watch Feel | Inspector Feel | Audio Signature |
|---------|-----------------|-------------------|---------------|-----------------|
| Training Wheels (BB-F × BM-1) | Clean notebook, wide margins, large print | Board game — discrete clicks, clean snaps | Simple autopsy — "here's what happened" | Wooden block placement sounds, quiet hum |
| Engineer's Desk (BB-D × BM-4) | Circuit board schematic, dense but organized | Mission control — data feeds, blinking lights | Flight data recorder — every signal traced | Electronic hum, relay clicks, wire connection *zzzt* |
| Darkroom (BB-A × BM-3) | Photographer's light table, images fading | Time-lapse of seasons — things bloom and fade | Paleontologist's lab — examining what remains | Soft reverb on all sounds, trailing echoes, warmth |
| Card Collector (BB-C × BM-2) | Card shop table, sleeves and playmats | Arena floor — cards slapping down each tick | Trophy case — stats on every card played | Card shuffles, chip stacks, foil crinkling |
| Dashboard (BB-B × BM-3) | Bloomberg terminal, dense grids, live data | Radar screen — blips aging in real-time | Telemetry dashboard — sparklines everywhere | Keyboard clicks, notification chimes, printer whir |
| Terrain Game (BB-A × BM-5) | Garden planner — where to plant, what grows | Ant colony — pheromone trails spreading | Archaeologist's site — digging through layers | Nature sounds, water drops, soil settling, wind |
