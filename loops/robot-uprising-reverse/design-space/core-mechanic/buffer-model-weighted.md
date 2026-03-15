# 2.02 — Weighted Buffer: Variable-Size Entries in Fixed-Capacity Memory

## The Option

Instead of every piece of information occupying exactly one slot (as in the fixed-slot FIFO model, 2.01), a **weighted buffer** assigns each datum a **size cost** measured in abstract "weight units." A unit's buffer has a fixed **capacity** (e.g., Scout = 12 weight units, Striker = 16, Relay = 24, Specialist = 20, Command = 28), but different data types consume different amounts of that capacity:

| Data Type | Weight | Example |
|-----------|--------|---------|
| Simple ping | 1 | "Enemy at D4" — bare coordinate |
| Observation | 2 | "Enemy striker at D4, facing NE, tagged" — position + metadata |
| Hook message (stripped) | 1 | Channel name + signal type only |
| Hook message (tagged) | 2 | Channel + type + source + priority color |
| Hook message (structured) | 3 | Full field-selected payload with metadata |
| Compressed report | 2 | Output of compress skill — summarized multi-observation |
| Raw reconnaissance dump | 4 | Full perception sweep with terrain + enemy + ally data |
| Command directive | 3 | Reassign/reroute/prioritize instruction with target + parameters |
| Extract payload | 5 | Full enemy config fragment pulled by Specialist hack |

The buffer is no longer a linear array of N identical slots. It's a **capacity budget** — a knapsack. The player configures what kinds of information their units receive and process, knowing that richer information costs more memory space. A Scout with 12 capacity units can hold twelve simple pings, six observations, four structured hook messages, or — critically — some mix that totals ≤12.

### Mechanical Specification

**Capacity as continuous resource:**
- Each unit type has a fixed **capacity** (not slot count) — a single number representing total weight budget
- Each datum entering the buffer has a **weight** determined by its type and content
- Current **fill** = sum of all datum weights in the buffer
- **Headroom** = capacity − fill = weight units available for new data
- When new data arrives and its weight exceeds headroom, the buffer must **evict** enough existing data to make room

**Eviction under weight pressure:**
The fundamental new decision: when a 4-weight reconnaissance dump arrives at a buffer with only 2 units of headroom, the system must evict data totaling at least 2 weight. This creates **eviction cascades** not present in fixed-slot:

- **FIFO-weight:** Evict oldest data first, regardless of weight, until enough capacity is freed. A single heavy arrival might evict 3-4 lightweight pings.
- **Lightest-first:** Evict the cheapest data first (preserve expensive/detailed entries). Pings die before reports.
- **Heaviest-first:** Evict the most expensive data first (preserve breadth over depth). Reports die before pings.
- **Weight-proportional:** Evict data whose weight matches the incoming data's type — "like replaces like."
- **Player-configured priority:** The player assigns priority tiers; lowest-priority data evicted first regardless of weight.

**The knapsack moment:**
Every tick, the buffer faces a micro-knapsack problem: given current contents and incoming data with various weights, what combination of evictions minimizes information loss while respecting capacity? In the fixed-slot model, this is trivial (drop oldest). In the weighted model, it's a genuine optimization problem — and the player is the one who designs the heuristic through eviction policy configuration.

**What the player configures (Plan phase):**
- **Listen/ignore toggles** (same as fixed-slot) — but now with weight awareness. Ignoring a channel that sends heavy structured messages frees proportionally more capacity than ignoring a lightweight ping channel.
- **Signal weight preferences:** For each incoming channel, the player can request "stripped" (weight 1), "tagged" (weight 2), or "full" (weight 3) delivery — trading information richness for buffer efficiency. This is the **compression-at-reception** decision.
- **Eviction policy:** Choose from the eviction strategies above. This is a meaningful new decision surface not present in fixed-slot.
- **Weight budget allocation:** Optionally, the player can "reserve" capacity for specific data types (e.g., "always keep 4 weight units free for emergency signals"). Reserved capacity cannot be filled by other data types — a defensive measure against buffer flooding.

### Why Weight Creates Richer Decisions Than Fixed Slots

**The information density tradeoff:**
In the fixed-slot model, every piece of data is equal. A bare "enemy at D4" ping and a detailed 5-field reconnaissance payload both cost one slot. This is elegant but unrealistic — and misses a rich design vein. In real AI systems, context windows treat all tokens equally, but practitioners know that a 500-token function call definition "costs" more than a 3-token user message. The weighted buffer makes this cost **explicit and actionable.**

A Scout configured for lightweight pings (weight 1 each) can hold 12 pieces of information in its 12-unit buffer. A Scout configured to receive full structured hook messages (weight 3 each) can hold only 4. Same unit, same buffer, radically different information architecture. The player is choosing between **breadth** (many cheap signals, wide but shallow awareness) and **depth** (few rich signals, narrow but detailed knowledge).

**The compression skill becomes essential, not optional:**
In fixed-slot, compress is useful but not critical — it reduces slot count by merging entries. In weighted buffer, compress is **transformative**: it takes three 2-weight observations (6 total weight) and produces one 2-weight compressed report, freeing 4 weight units. The compress skill's value scales directly with how heavy the incoming data is. A Relay running compress on a stream of 4-weight recon dumps is doing 4× the capacity work of a Relay compressing 1-weight pings.

**Enemy information warfare gains a new axis:**
In fixed-slot, enemy flooding means "fill slots with junk." In weighted buffer, enemies can flood with **heavy junk** — sending 5-weight decoy signals that each displace 5 weight units of real data. Alternatively, enemies can flood with **many lightweight pings** that individually seem cheap but collectively consume capacity through sheer volume. The player must defend against both attack vectors differently: weight-based filtering for heavy junk, rate limiting for ping floods.

### Visual Representation: The Capacity Thermometer

The buffer bar from fixed-slot (2.01) transforms from a row of equal-width segments into a **proportional fill bar** — a horizontal thermometer where each datum occupies visual width proportional to its weight.

**Visual design:**
- The bar is a single horizontal strip, total width representing full capacity (12 units for Scout, 28 for Command)
- Each datum is a colored rectangle whose **width is proportional to its weight** — a 1-weight ping is a thin sliver, a 5-weight extract is a wide block
- Colors follow the same scheme as fixed-slot: 🟢 green for observations, 🔵 blue for hook messages, 🟡 amber for self-generated, 🔴 red for enemy-sourced
- **Brightness encodes age:** newest entries glow brightly, older entries dim toward 60% opacity
- **The gap:** Remaining headroom is shown as a dark void at the right end of the bar. When headroom is large, the void is wide and comfortable — dark charcoal with subtle breathing animation. When headroom is small (< 20%), the void narrows and the bar's border shifts from default gray to amber. When headroom = 0, the entire bar pulses red for 1 tick.
- **Eviction flash:** When data is evicted, the evicted block collapses inward with a 200ms crush animation — the block squeezes to zero width while adjacent blocks slide to fill the gap. A tiny white particle burst marks the eviction point, subtler than fixed-slot's full-slot flash.
- **Weight labels on hover (Inspector only):** In the Inspector, hovering over any block in the capacity bar shows a tooltip: `"Observation (weight 2) — Enemy striker at D4, facing NE — age: 3 ticks"`

**Audio cues:**
- Lightweight data entering: soft digital *tick* (like a key click)
- Heavy data entering (weight ≥ 4): deeper *thunk* with subtle bass — you can hear the weight
- Eviction: muted paper-tear sound, pitch proportional to evicted weight (higher pitch for light, lower for heavy — losing something big sounds heavier)
- Capacity warning (< 20% headroom): ambient low hum joins the unit's audio, like a hard drive spinning under load
- Capacity full: sharp electronic *snap*, then 1-tick stunned jitter with electrical crackling

### Six Sub-Models of Weighted Buffer

#### Model A: "The Knapsack" — Pure Weight Budget

Every data type has a fixed, immutable weight. The player manages capacity purely through reception configuration (which channels, which delivery richness) and eviction policy. No in-battle weight manipulation.

**Strengths:** Simplest weighted variant. Clear planning decisions. Weight costs are learnable and predictable.
**Weaknesses:** No emergent weight strategies. The compress skill's interaction with weight is static — always the same input/output ratio.

#### Model B: "The Negotiated Weight" — Dynamic Weight Through Processing

Skills can **change the weight** of data in the buffer. Compress reduces weight (3 observations at weight 2 each → 1 report at weight 2). Filter can strip fields from structured messages, reducing their weight from 3 to 1 in-place. Amplify can *increase* weight by enriching a signal with additional metadata before forwarding.

**Strengths:** Weight becomes a dynamic resource that the player's skill configuration actively manages. Creates a "refinery" feel — raw heavy data enters, processing skills reduce it, lightweight refined signals exit.
**Weaknesses:** Weight changes during execution are harder to predict. Inspector must show weight transformations explicitly.

#### Model C: "The Tetris Buffer" — Spatial Grid Instead of Linear Capacity

The buffer is represented as a **2D grid** (e.g., Scout = 3×4 = 12 cells, Command = 4×7 = 28 cells). Each datum is a **shaped block** — a 1×1 square for a ping, a 1×2 rectangle for an observation, an L-shape for a structured message, a 2×2 square for a recon dump. Data must fit contiguously. **Fragmentation** is possible — the buffer has enough total capacity but data can't fit because of gaps between existing blocks.

This is the **Resident Evil 4 attaché case** as a real-time information management system. The player doesn't manually arrange blocks (it's automatic during execution), but they configure **packing strategies** that determine how the auto-packer arranges incoming data: left-aligned, gravity-pack, defragment-on-eviction.

**Strengths:** Viscerally legible — the 2D grid makes buffer state instantly readable at a glance. Fragmentation creates a new failure mode that's visually dramatic (buffer looks half-empty but can't accept a 2×2 block). Creates the "inventory Tetris" satisfaction when a well-configured packer maintains clean layouts.
**Weaknesses:** Significantly more complex than linear capacity. Auto-packing algorithms need careful design to avoid feeling random. The 2D grid takes more screen space than a thin bar. May be too cute for a game about information architecture — the spatial metaphor maps to physical inventory, not to how information works in real systems.

#### Model D: "The Token Budget" — LLM-Native Metaphor

Lean into the 1:1 vocabulary mapping with real AI systems. The buffer capacity is measured in **tokens** — the exact same word used in LLM context windows. Each datum has a token count based on its complexity. The player sees "Context Window: 847/1200 tokens" instead of abstract weight units.

**Strengths:** Maximum vocabulary transfer to real AI engineering. Players literally learn to think about context window token budgets. "My Scout is running at 92% token utilization" is a sentence that works in both the game and a real system.
**Weaknesses:** Numbers are larger and less intuitive than small weight values (1-5). "847 tokens" is harder to reason about at a glance than "9/12 weight." The abstraction may feel too dry for players without AI background. Risks making the game feel like a dashboard rather than a game.

#### Model E: "The Stratified Budget" — Weight Tiers With Automatic Promotion

Data enters at its natural weight. Over time, unaccessed data **compresses automatically** — a 4-weight recon dump that hasn't been evaluated by any rule for 3 ticks is automatically compressed to a 2-weight summary, then to a 1-weight ping after 5 more ticks. Data "decays" in richness as it ages, naturally freeing capacity for fresh information.

**Strengths:** Elegant merger of weighted buffer with decay buffer (2.03). Creates natural information lifecycle without player configuration. Old data doesn't suddenly vanish — it gracefully degrades. The Inspector can show the decay stages as visual fading (full color → muted → faint outline).
**Weaknesses:** Players have less control over what gets preserved. The automatic compression might destroy information the player wanted to keep. Interaction with the compress skill is unclear — does compress reset the decay timer? Does manually compressed data decay differently from auto-decayed data?

#### Model F: "The Priority-Weighted Hybrid" — Weight Modifies Eviction Resistance

Each datum has both a **weight** (capacity cost) and a **priority** (eviction resistance). Heavy data isn't automatically more or less likely to be evicted — priority is a separate axis the player configures. A 5-weight extract with high priority is the last thing evicted; a 5-weight extract with low priority is the first. Weight determines how much *room* eviction frees; priority determines eviction *order*.

**Strengths:** Maximum strategic depth — two independent axes create a 2D decision space for every piece of data. The player who masters priority × weight configuration has a genuinely deep optimization surface. Maps to real engineering (critical vs. verbose logs, hot vs. cold cache tiers).
**Weaknesses:** Two-axis configuration is significantly harder to learn than one. The UI must present both dimensions clearly — a single bar can't encode both weight and priority without visual clutter. Risk of overwhelming new players.

---

## Player Journeys

### Journey: Mei, 19, Computer Science Student

**Context:** Mission 5, first factory mission. Mei has played Missions 1-4 with fixed-slot buffers and understands basic buffer management. She's just unlocked the factory and is building her first blueprint from scratch. The weighted buffer model is introduced via a boot log entry: "SUBSYSTEM UPDATE: Context window upgrade — signal fidelity now variable. Heavier signals carry more data but consume more memory."

**Minute 0:00 — The Weight Reveal**
Mei opens the blueprint editor for her first custom Scout. The Context Config section looks different from the tutorial missions — instead of "Buffer: 6 slots," she sees "Context Window: 12 capacity" with a horizontal bar divided into faint gridlines. Below the capacity number, a small legend shows data types with weight icons: a feather (weight 1) next to "Ping," a small box (weight 2) next to "Observation," a heavy box (weight 3) next to "Structured Signal."

She hovers over the capacity bar. A tooltip reads: "Your scout can hold 12 units of information. Light signals take less space. Heavy signals carry more detail."

**Minute 0:45 — The Channel Weight Decision**
Mei adds a hook listening on the "recon-net" channel. A new dropdown appears she hasn't seen before: **Delivery Richness** — three options presented as icons: a feather (Stripped, weight 1), a tag (Tagged, weight 2), and a full envelope (Structured, weight 3). Each option has a one-line description beneath:
- *Stripped*: "Channel name + type only. Light, fast, forgettable."
- *Tagged*: "Includes source and priority. Balanced."
- *Structured*: "Full payload with all fields. Heavy but complete."

Mei selects Structured because she wants her Scout to have all the information. The capacity bar's preview updates — faint ghost blocks appear showing projected buffer utilization based on expected traffic. The bar looks... mostly full. A tiny amber warning text appears: "Projected utilization: ~85% at typical traffic."

She pauses. Switches to Tagged. The projected utilization drops to ~60%. She can *see* the difference — fewer, thinner ghost blocks in the preview, more dark void on the right. She thinks: "So I'm choosing between knowing everything and having room to breathe."

**Minute 1:30 — The First Sealed Watch**
Mei hits EXECUTE. The sealed watch begins. Her Scout moves through the jungle terrain, and she watches the capacity thermometer below its tile. Each tick, thin green observation slivers (weight 1-2) slide into the bar from the right. When a hook message arrives from her Relay, a blue block appears — visibly wider than the green slivers. The bar fills proportionally, and Mei can see the information's *heft* by watching block widths.

At tick 8, her Scout enters a crowded area — three enemies within perception range plus two incoming hook messages. The bar jumps from 60% to 95% in a single tick. Two green slivers at the left end collapse with tiny white sparkle bursts — evicted to make room. Mei winces. "It ate the old observations to fit the new ones."

At tick 12, a heavy structured message (weight 3) arrives from the Relay. The bar is at 90%. The system evicts three lightweight pings (total weight 3) to make room for one message. Mei watches three thin blocks dissolve in rapid succession to make room for a single wide blue block. The visual drama of "one big thing ate three small things" is immediate.

**Minute 3:00 — The Aha Moment**
After the battle (a loss — her Scout got stunned from buffer overflow), Mei enters the Inspector. She clicks her Scout and scrubs to tick 12. The capacity bar is frozen at 100%. She sees the three evicted pings highlighted in red ghost outlines, and the incoming structured message that replaced them. The decision trace reads: "Rule 3 evaluated: buffer contained [tagged msg from recon-net] — MATCHED. Action: signal 'threat' on strike-net."

Mei realizes: the heavy structured message contained exactly the data Rule 3 needed. If she'd chosen Stripped delivery (weight 1), the message would have been lighter — but it wouldn't have had the fields Rule 3 required. She needed the weight 3 version. But carrying it cost three pings she might also have needed.

She goes back to the Plan screen and changes her Scout's second channel to Stripped delivery. "I need one rich channel for threat data and one cheap channel for positioning pings. Not everything needs to be full-fat." She's discovering **information architecture as resource allocation** — the core feeling the game is designed to transmit.

**UI Annotations:**
- **Delivery Richness dropdown:** Three-icon selector (feather/tag/envelope) below each channel toggle, with real-time capacity preview update
- **Capacity thermometer preview:** Ghost blocks in plan screen showing projected utilization based on expected traffic patterns from mission intel
- **Eviction cascade animation:** Rapid left-to-right dissolution of multiple thin blocks when one heavy block arrives, total animation 400ms
- **Inspector weight tooltip:** Hovering over any block shows weight, data type, source, tick created, and whether any rule evaluated this datum

---

### Journey: Diego, 31, Backend Engineer, Factorio Veteran

**Context:** Mission 7, Command agent introduction. Diego has been playing for 4 hours. He runs three Scouts feeding into two Relays feeding into a Striker squad. He understands weight budgets intuitively from real-world API rate limiting. He's just unlocked the Command unit and is building his first command architecture.

**Minute 0:00 — The Command Unit's Fat Budget**
Diego opens the Command unit blueprint. Capacity: 28. He whistles. The capacity bar is enormous compared to his Scouts' thin strips. The boot log entry reads: "COMMAND SUBSYSTEM ONLINE. Extended context window: 28 capacity units. Six hook slots. You have room to think — use it."

He starts wiring hooks. The Command unit needs to listen to: recon-net (threat reports from Scouts), relay-status (compression reports from Relays), strike-status (engagement results from Strikers), logistics (production queue updates), and meta-status (its own performance metrics). Five channels. He selects Structured (weight 3) for recon-net and relay-status — the Command needs full detail. Tagged (weight 2) for strike-status and logistics. Stripped (weight 1) for meta-status.

The capacity preview calculates: 3+3+2+2+1 = 11 weight per tick at full traffic. With 28 capacity, that's ~2.5 ticks of backlog. The preview bar shows comfortable headroom. Diego nods. "Good retention depth."

**Minute 1:30 — Weight Budget as Capacity Planning**
Diego opens a rules panel and starts configuring the Command's behavior. Rule 1: "IF recon-net contains threat tagged 'high' AND strike-status shows idle striker → reassign striker to threat quadrant." This rule needs both a weight-3 recon message and a weight-2 strike status in the buffer simultaneously. If either gets evicted before the rule evaluates, the rule can't match.

He thinks about it like a service's memory allocation: "I need these two signals to coexist in the buffer for at least one evaluation cycle." He opens the eviction policy config — a new panel he hasn't seen before. Four options presented as named strategies with one-line descriptions:

- **FIFO** (🕐): "Oldest first, regardless of weight. Simple, predictable."
- **Lightest-first** (🪶): "Cheap data evicted first. Preserves expensive signals longer."
- **Priority-tagged** (⭐): "Evict by priority tier. You choose what matters."
- **Weight-matched** (⚖️): "Like replaces like. Heavy signals only evicted by heavier signals."

Diego selects Priority-tagged. He assigns priority tiers: recon-net = HIGH, relay-status = HIGH, strike-status = MEDIUM, logistics = LOW, meta-status = LOW. Now his Command will sacrifice logistics pings and meta-status before touching the recon and relay data it needs for critical decision rules.

**Minute 3:00 — The Sealed Watch — Weight Under Pressure**
Battle begins. Diego's Command sits in the back, capacity bar slowly filling. At tick 5, normal operations — the bar hovers at ~60%, a comfortable mix of blue and green blocks of varying widths. The Command issues reassignment orders (visible as outgoing amber pulses on its hook connections).

At tick 14, the enemy launches a coordinated assault. All three Scouts report simultaneously — three weight-3 structured messages hit the Command's buffer. Plus two Relays forward compressed reports (weight 2 each). Total incoming: 9+4 = 13 weight in a single tick. The buffer jumps from 60% to over 100%.

The eviction cascade fires. Priority-tagged policy kicks in: three weight-1 meta-status pings dissolve first (3 freed), then two weight-2 logistics messages (4 freed). Seven weight freed, but 13 incoming. The bar pulses amber, then red. Two more evictions — the oldest MEDIUM strike-status messages — crush inward to make room. The Command processes, issues a reassignment, and the bar settles at 92%.

Diego watches the capacity thermometer through the rest of the battle. The Command never hits 100% again — the initial spike was a one-time event as the enemy's coordinated attack flooded all channels simultaneously. His priority configuration held. The right data survived.

**Minute 5:30 — Inspector Deep Dive**
In the Inspector, Diego scrubs to tick 14. He clicks the Command unit and sees the capacity bar frozen at the crisis moment. Each block is labeled with weight and priority:
```
[recon-net:3w ⭐H] [recon-net:3w ⭐H] [recon-net:3w ⭐H]
[relay-stat:2w ⭐H] [relay-stat:2w ⭐H]
[strike-stat:2w ★M] [strike-stat:2w ★M]
[meta:1w ○L] ← EVICTED
[logistics:2w ○L] ← EVICTED
```

The decision trace shows: "Rule 1 evaluated: recon-net HIGH threat at E3 FOUND, strike-status idle striker FOUND → MATCH → reassign Striker-2 to E3." The two signals that needed to coexist *did* coexist because priority-tagged eviction protected them both. Diego feels the satisfaction of a well-designed system surviving its first stress test. It's the same feeling as watching a Factorio factory handle a demand spike without backing up.

**UI Annotations:**
- **Eviction policy selector:** Four named strategies with icons, one-line descriptions, and "Preview eviction order" button that shows a ranked list of current buffer contents in eviction order
- **Priority tier badges:** Star icons (⭐ HIGH, ★ MEDIUM, ○ LOW) displayed as small overlay badges on each block in the capacity bar
- **Tick 14 crisis visualization:** Capacity bar border flashing red→amber→settling to green across 3 ticks as eviction cascade resolves
- **Inspector capacity snapshot:** Frozen bar with full weight/priority/status annotations, evicted blocks shown as red dashed outlines

---

### Journey: Sofia, 52, Retired Librarian, Never Played a Strategy Game

**Context:** Mission 2, second tutorial mission. Sofia is learning the basics. The boot log has just introduced the concept of "memory" for units. She doesn't know what a buffer is in computer science. The game uses "context window" language exclusively.

**Minute 0:00 — The Bookshelf Metaphor**
Sofia's screen shows a single pre-placed Scout with a brief boot log entry: "Your scout has a memory — think of it as a small bookshelf. Some books are thin (a quick note), some are thick (a detailed report). The shelf holds 12 books' worth of thickness."

The capacity bar appears below the Scout's tile in the preview, but it's styled differently for the tutorial: the bar is rendered as a **literal bookshelf** — a horizontal wooden shelf with small book spines of varying widths. Empty space on the shelf is visible dark wood. The metaphor is immediate and tangible.

**Minute 0:30 — Watching Weight Happen**
Sofia hits EXECUTE. The Scout moves through Mission 2's simple terrain. Each tick, thin green "book spines" slide onto the shelf from the right — observations of the terrain. They're thin, barely noticeable. The shelf feels spacious.

At tick 3, the Scout spots an enemy. A thicker red-bordered book slides onto the shelf — an observation with more detail (weight 2 instead of 1). Sofia notices it's wider. She doesn't think "weight 2 versus weight 1." She thinks "that one took up more room, like a thick book."

At tick 6, a hook message arrives from a pre-placed Relay — a structured battle report (weight 3). It's the widest block yet, a fat blue book spine that takes up noticeable shelf space. Sofia watches the shelf go from half-empty to two-thirds full in one tick. She intuits the cost without understanding the mechanics: "Reports take up more room than notes."

**Minute 1:15 — The First Eviction**
At tick 9, the shelf is nearly full. A new thick observation (weight 2) arrives. Two thin books at the left end of the shelf — the oldest ones — gently slide off the left edge and dissolve with a soft *shff* sound, like a book sliding off a table. The new thick book slides in from the right. Sofia watches two small things leave to make room for one larger thing.

She doesn't need to understand eviction algorithms. She understands bookshelves. "The shelf got full, so the oldest notes fell off to make room for the new report." The metaphor carries the entire mechanic.

**Minute 2:00 — The Tutorial Prompt**
After the sealed watch, a gentle prompt appears: "Your scout's bookshelf is only so wide. Thick reports carry more detail but take more room. Thin notes carry less but you can hold more of them. In the next mission, you'll choose how detailed your incoming messages should be."

Sofia nods. She already understands the tradeoff. She's been managing bookshelves for 30 years.

**UI Annotations:**
- **Tutorial bookshelf skin:** The capacity bar is rendered with a wood-grain texture and book-spine visual metaphor for Missions 1-3. By Mission 4, it transitions to the standard tech-styled thermometer. The metaphor scaffolds understanding before the abstract representation takes over.
- **Gentle eviction animation:** Books slide off the left edge of the shelf with a slow, non-alarming animation. No red flash, no particle burst — just a quiet departure. The alarming visual vocabulary (red pulses, spark bursts) is introduced later when the stakes are higher.
- **Weight as visual width:** No numbers, no weight labels in the tutorial. The ONLY weight signal is the visual width of book spines. Thin = small info. Wide = big info. Numbers appear in Mission 4.

---

## Strengths

1. **Richer decision surface:** Every channel subscription, every delivery richness setting, every eviction policy choice is a meaningful decision with cascading consequences. The fixed-slot model has one decision per channel (listen/ignore). The weighted model adds richness (stripped/tagged/structured) and priority (eviction order) — tripling the decision space.

2. **Natural information architecture vocabulary:** "This signal is too heavy for my Scout's budget" maps directly to real engineering decisions about API payload sizes, log verbosity levels, cache entry sizes, and LLM token costs. The vocabulary transfer to real-world systems is stronger than fixed-slot.

3. **Compression skill becomes central:** Compress goes from "nice to have" to "essential infrastructure" — it's the skill that converts heavy raw data into lightweight processed intelligence. The Relay unit's identity as an information refinery becomes mechanically meaningful, not just thematic.

4. **Enemy information warfare gains depth:** Enemies can attack with heavy signals (few but expensive, displacing important data) or light signal floods (cheap but numerous, filling capacity through volume). Defending against both requires different configurations — weight-based filtering for the first, rate limiting for the second.

5. **Visual drama:** The proportional capacity bar creates more visual variety and drama than equal-width slots. A single heavy eviction (one fat block crushing two thin ones) tells a story. The fixed-slot model's evictions all look the same.

## Weaknesses

1. **Cognitive load increase:** Players must now track weight per data type, capacity per unit, eviction policy, and delivery richness. This is 3-4 additional configuration dimensions compared to fixed-slot. For new players, this may overwhelm before it enriches.

2. **Predictability loss:** In fixed-slot, a player can count: "My Scout has 6 slots, it receives ~3 data per tick, so it retains ~2 ticks of history." In weighted buffer, the same calculation requires knowing the weight distribution of incoming data, which varies by mission and enemy behavior. Harder to plan, harder to debug.

3. **Inspector complexity:** The Inspector must now show weight values, eviction policy decisions, capacity timelines, and weight transformations (for dynamic weight models). The fixed-slot Inspector is a simple slot-by-slot readout. The weighted Inspector risks becoming a dashboard.

4. **Tutorial burden:** The fixed-slot model can be taught in Mission 1 with zero abstraction — "your unit remembers 6 things." The weighted model requires teaching "things have different sizes" as an additional concept before the player can reason about buffer behavior. This pushes the concept ceiling earlier.

5. **The Tetris distraction:** If weight differences are too large (1 vs 5), players may fixate on weight optimization as the primary challenge rather than information architecture. The game becomes "how do I pack my buffer efficiently?" instead of "what should my agents pay attention to?" — a subtle but critical shift away from the core fantasy.

## Interaction Effects

**With hook taxonomy (3.08):** The tagged payload model (M2) naturally maps to weight 2, while structured (M3) maps to weight 3. The hook taxonomy's progressive payload revelation becomes a progressive weight revelation — players learn that richer hooks cost more buffer.

**With compression skill (3.01/3.03):** Compress becomes the game's most strategically important skill. In fixed-slot, it's one of twelve skills. In weighted buffer, it's THE skill that determines buffer efficiency. Risk: compress may become mandatory, reducing build diversity.

**With spatial routing (2.14):** Signal attenuation over distance could interact with weight — signals that travel further could arrive at reduced weight (detail lost in transit), creating a distance-as-compression effect.

**With sealed watch (locked):** The proportional capacity bar is more visually dramatic than equal-width slots, creating stronger sealed watch spectacle. But it's also harder to read at battlefield zoom levels — the variable widths may blur together on small units.

**With fixed-slot buffer (2.01):** The two models are **mutually exclusive** at the base level but could coexist as a progression: fixed-slot for Missions 1-4 (tutorial simplicity), weighted buffer unlocked at Mission 5 with the factory (complexity matches the system upgrade). The boot log reads: "CONTEXT WINDOW UPGRADE: Signal fidelity now variable. Your memory is wider but some books are thicker."

**With eviction policies (2.06/2.07):** The weighted model makes eviction policy a **much** more consequential choice. In fixed-slot with FIFO, eviction policy is trivial. In weighted, the eviction policy determines whether one heavy eviction or three light evictions occur, fundamentally changing what data survives.

**With the meta-level (command agents):** Command agents with weight budgets become information capacity planners. A Command's reassign skill could include "change subordinate delivery richness" — dynamically upgrading a Scout from Stripped to Structured when a threat is detected, then downgrading back to Stripped when the threat passes. Information richness as a managed resource across the army.

## Comparable Games & Media

**Resident Evil 4 — Attaché Case:** The most famous "variable-size inventory" in gaming. Items occupy different grid footprints (1×1 herbs, 1×3 rifles, 2×2 grenades). The satisfaction of a well-packed case is legendary. Robot Uprising's weighted buffer is the *information equivalent* — data of different sizes packed into limited capacity. The key difference: RE4 lets you manually arrange items; Robot Uprising's arrangement is automatic based on configured policy. The player designs the packing algorithm, not the arrangement.

**Diablo II — Grid Inventory:** Multi-cell items in a fixed grid created the "inventory Tetris" genre. Diablo's progression toward simplification (D2's variable cells → D3's uniform 1×2 → D4's single-slot) warns that variable sizing adds friction that players eventually resist. Robot Uprising must ensure weight creates meaningful decisions, not tedious management.

**Path of Exile — Stash Tabs:** PoE maintained Diablo II's variable-size inventory and built an entire economy around stash management. Tab organization IS the endgame for many players. The lesson: variable-size storage can become the game's deepest optimization layer if given enough tools (sorting, filtering, categorization).

**Factorio — Logistics Networks:** Factorio's logistic robots carry items of uniform size, but storage chests have filter configurations that determine what they accept. The planning layer (which chest accepts what) is analogous to the weighted buffer's reception configuration (which channel, at what richness).

**Real LLM Context Windows:** The direct real-world analogue. Claude's 200K context window treats all tokens equally, but practitioners know that a 500-token system prompt "costs" more than a 3-token response. The weighted buffer makes this cost visible and manageable — a game mechanic built from the exact engineering reality the game teaches.

**Escape from Tarkov — Backpack System:** EFT's nested container system (backpacks inside backpacks, each with grid space) creates a weight-and-volume puzzle under extreme time pressure. The lesson: variable-size storage creates genuine tension when the pressure is real. Robot Uprising's sealed watch provides the temporal pressure; the weighted buffer provides the spatial constraint.

## Sensory Description

**Plan screen:** The workbench's Context Config section shows the capacity bar as a wide horizontal strip with a brushed-metal texture. Empty capacity is rendered as dark glass with a subtle circuit-board pattern visible underneath — like looking through a window into the unit's empty mind. As the player configures channels and delivery richness, ghost blocks materialize on the bar, colored and sized according to projected traffic. The bar feels alive with potential information, waiting to be filled.

**Sealed watch:** The capacity thermometer below each unit pulses with activity. Thin slivers slide in smoothly; wide blocks arrive with a noticeable visual *weight*, like a heavy package being placed on a conveyor belt. The ambient audio layer includes a soft "capacity hum" — a low-frequency drone that rises in pitch as utilization increases. At 80%, the hum becomes a whine. At 100%, it clips into distortion for one tick before the stun animation fires.

**Inspector:** The capacity bar freezes into a museum display. Each block is outlined with clean borders and labeled with a small weight badge (a circle containing the number). Blocks glow when the mouse approaches them, and clicking one expands it into a full datum view: type, weight, source, channel, tick created, tick received, and whether any rule evaluated it. The timeline scrubber shows the capacity bar at every tick, and scrubbing forward/backward animates blocks entering and exiting with satisfying slide-and-crush animations.

**The TikTok clip:** A Command unit's capacity bar during a coordinated assault. Five heavy signals arrive simultaneously. The bar erupts — three lightweight pings get crushed in rapid succession, their white particle bursts like popcorn. A fat red enemy signal pushes in from the right, physically shoving existing data leftward. The Command processes, fires a reassignment, and the bar settles. Caption: "When your AI's brain literally gets squeezed by enemy intel." 15 seconds of pure information warfare drama, no explanation needed.

## New Aspects Discovered

- **2.02a — Weight value design space:** What's the right weight range? 1-3 (simple, ternary decisions) vs. 1-5 (more granular, harder to balance) vs. 1-10 (full spectrum, simulation-heavy); weight inflation across campaign missions
- **2.02b — Delivery richness as progressive unlock:** The stripped/tagged/structured trichotomy introduced per-channel; when does this unlock (Mission 3? Mission 5?); how does the boot log frame the concept ("You can choose how much your agents remember about each message")
- **2.02c — Weight-aware eviction policy design space:** Deep exploration of all eviction strategies under weight (FIFO-weight, lightest-first, heaviest-first, priority-tagged, weight-matched, random-weighted); which strategies create interesting decisions vs. degenerate ones
- **2.02d — The "compress as refinery" skill identity:** If weight makes compress essential, does the Relay become mandatory in every viable army? Diversity implications; alternative weight-reduction skills; weight management as a skill category rather than one skill's job
- **2.02e — Tutorial progression from fixed-slot to weighted:** Designing the Mission 1-4 → Mission 5 transition from simple slots to weighted capacity; the "bookshelf upgrade" moment; how to avoid invalidating lessons learned in the fixed-slot tutorial
