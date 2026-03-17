# The Spaghetti-to-Bus Progression as Emergent Tutorial

**Aspect ID:** 1.14b
**Wave:** 1 (Competitive Analysis) / 5 (Onboarding)
**Category:** Onboarding
**Related aspects:** 1.14 (Factorio deep dive), 5.04 (complexity ramp), 5.00a (vocabulary pacing bottleneck), 3.09 (hook chaining), 3.10 (hook visualization), 5.04a (Mission 5 wall), 5.04b (vocabulary density curve), 5.08 (community mission editor), 3.11 (hook taxonomy)

---

## The Phenomenon in Factorio

Factorio players undergo a natural architectural evolution that no tutorial teaches explicitly:

1. **Spaghetti phase** — Belts snake everywhere, inserters twist at weird angles, copper wire crosses iron plates in mid-air. Everything works. Nothing scales. The factory looks like a nervous system drawn by a toddler.
2. **Main bus phase** — A central highway of 4-wide belts carries core resources (iron, copper, steel, circuits). Production branches split off perpendicular to the bus. Clean, readable, expandable. The factory looks like a motherboard.
3. **Train/City block phase** — Self-contained production cells communicate via train logistics. Each block is a sealed module with defined inputs and outputs. The factory looks like a microservices architecture.

The critical insight: **Factorio never tells you to build a bus.** The game presents escalating challenges — more complex recipes, longer production chains, resource patches farther away — and the main bus emerges as the natural solution to the pain of spaghetti at scale. The "wall" is organic: around the oil processing tech tier (8-15 hours in), spaghetti becomes physically unmanageable. Three fluid outputs from a single refinery. Side products that back up if unconsumed. Pipes that can't overlap belts. Players hit this wall and either quit (63% of Steam players never reach oil processing) or restructure. Those who restructure discover the bus.

The train/city block transition is equally organic. As resource patches deplete, miners move farther from the factory. Belts over thousands of tiles are impractical. Trains emerge as the only viable long-distance transport. Once you have trains, you realize each production cell should be self-contained — and city blocks materialize.

**What makes this brilliant game design:**
- Each architectural style is *optimal for its era.* Spaghetti is the fastest way to bootstrap. Bus is the cleanest way to scale mid-game. City blocks are the only way to go mega. No style is "wrong" — it's wrong for the *current scale.*
- The game *creates the pain* that the next architecture solves, without ever naming the pain or the solution.
- Community vocabulary grows organically: "spaghetti," "bus," "city block" are player-coined terms for patterns that emerged from play, not from documentation.
- Experienced players watching beginners feel *nostalgia*, not contempt. "I remember my first spaghetti base" is a bonding moment, not a judgment.

---

## The Robot Uprising Equivalent: Channel Topology Evolution

Robot Uprising's hook/channel system should exhibit the same organic architectural evolution. The player doesn't build belts — they wire hooks to channels. The "factory layout" IS the communication topology. And that topology should naturally evolve through three analogous phases:

### Phase 1: "Spaghetti Hooks" (Missions 1-4)

**What it looks like:** Every unit talks to every other unit. The player's first instinct is to connect everything. Scout has a hook on `alert`. Relay listens to `alert`. Striker also listens to `alert`. The Relay compresses and sends on... `alert` again? Or a new channel? The player creates channels haphazardly: `alert`, `enemy-spotted`, `go-attack`, `help`, `move`. Five channels, eight hooks, signals flying everywhere. The channel map panel (auto-generated, read-only) looks like a plate of noodles — every unit connected to every other unit through a tangle of named pipes.

**Why it works at this scale:** With 3-4 pre-placed units on an 8×8 board, spaghetti topology is fine. Every signal reaches every unit within 2-3 ticks. Buffer sizes are generous relative to signal volume. Context overload doesn't happen because there aren't enough sources to overflow a 6-slot buffer. The player's messy wiring *succeeds*, reinforcing the behavior.

**Why it eventually breaks:** It breaks the same way Factorio spaghetti breaks — by not scaling. The pain arrives when unit count increases and signal volume explodes.

**The sensory experience of spaghetti hooks working:**
The plan screen's channel map panel shows 5 channels, each a horizontal bar with unit icons clustered on both sides. Colored dashed lines connect emitters to listeners — cyan, amber, pink, lime, white — crossing and overlapping like a crayon drawing. During sealed watch, the 8×8 board erupts with colored flashes on every tick. Green signal-delivery flashes on 3 of 4 units simultaneously. The player watches their chaotic wiring *work* — units respond, threats are engaged, the mission succeeds. The spaghetti *feels good* because it's alive. Every tile pulses.

**The sensory experience of spaghetti hooks failing (later):**
Mission 5+, factory producing 6 units. The channel map panel is now unreadable — 8 channels, 14 hook connections, lines crossing in every direction. During sealed watch, the board is a seizure of colored flashes. Three relays all fire on the same tick, flooding `alert` with redundant signals. A striker's 8-slot buffer fills with three copies of the same threat report from three different relays. Context overload. The striker stuns for 1 tick — sparking, jittering. An enemy striker moves adjacent. Elimination. The player watches their architecture eat itself. The Inspector reveals the cause: buffer slots 3, 4, and 5 all contain the same observation, forwarded through three different paths. Three hops, three copies, one dead striker.

### Phase 2: "The Bus" — Hierarchical Channel Architecture (Missions 5-7)

**What the player discovers:** Not every unit should listen to every channel. Channels should be layered: raw observations flow on low-level channels, processed intelligence flows on high-level channels. Relays are the bus — they sit between scouts (producers) and strikers (consumers), compressing and filtering.

**The Robot Uprising "bus" pattern:**
```
Scout hooks:
  ON_OBSERVE → emit on "raw-recon"

Relay rules:
  IF buffer contains raw-recon signal → activate COMPRESS skill
Relay hooks:
  ON_SKILL(compress) → emit on "intel"

Striker context config:
  LISTEN: ["intel"]
  IGNORE: ["raw-recon"]
```

The key architectural move: **strikers stop listening to raw channels.** They only consume processed intelligence from relays. This is exactly analogous to a Factorio main bus — raw ore feeds smelters (relays), smelters output plates onto the bus (intel channel), assemblers (strikers) consume from the bus. Raw ore never touches the assembler.

**What triggers the transition:** The same thing that triggers Factorio's bus transition — *pain at scale.* The player hits a mission where spaghetti hooks cause context overload on combat units. The debrief's Inspector shows buffer slots filled with redundant raw data. The player thinks: "I need to filter this." They redesign: scouts emit raw observations, relays compress them, strikers only listen to compressed intel. The channel map panel transforms from a crayon drawing to a clean left-to-right flow diagram. Fewer lines. Clear directionality. The player feels the same satisfaction as straightening a Factorio bus for the first time.

**The sensory experience of the bus topology:**
The plan screen's channel map panel now shows a clean three-tier flow. Left column: scouts with outgoing cyan lines to `raw-recon`. Middle column: relays, each with an incoming cyan line and an outgoing amber line to `intel`. Right column: strikers, each with a single incoming amber line. The lines don't cross. The topology looks like an org chart. During sealed watch, the signal flow is *legible*: tick 5, green flash on scout (observation). Tick 6, cyan dashed line from scout to relay (raw signal). Tick 7, relay tile glows briefly (compression processing). Tick 8, amber dashed line from relay to striker (compressed intel). Tick 9, striker moves. The cascade is visible as a left-to-right wave. The player can *read* the battlefield by watching signal flow direction.

### Phase 3: "City Blocks" — Modular Multi-Channel Architectures (Missions 8-10)

**What the player discovers:** A single "intel" bus doesn't scale when there are multiple threat types, multiple flanks, and multiple objectives. The player begins creating domain-specific channel clusters — each a self-contained communication module handling one concern.

**The Robot Uprising "city block" pattern:**
```
North Flank Module:
  Scout-N → "north-raw" → Relay-N → "north-intel" → Striker-N

South Flank Module:
  Scout-S → "south-raw" → Relay-S → "south-intel" → Striker-S

Command Module:
  Command agent listens to BOTH "north-intel" and "south-intel"
  Command hooks: ON_RECEIVE("north-intel") with high-threat → emit "priority-north"
  Command hooks: ON_RECEIVE("south-intel") with high-threat → emit "priority-south"

Reserve Module:
  Reserve Striker listens to BOTH "priority-north" and "priority-south"
  Rules: IF priority-north AND NOT priority-south → move north
         IF priority-south AND NOT priority-north → move south
         IF BOTH → move toward nearest threat (spatial rule)
```

This is a microservices architecture. Each flank module is a self-contained cell with defined inputs (enemy positions in its sector) and outputs (processed intel on a named channel). The command module aggregates across cells. Reserve forces respond to command-level signals, not raw intel. No module knows or cares about the internals of any other module.

**What triggers the transition:** Mission 8-10 complexity. Multiple enemy spawners on different board edges. Factory vs. factory battles where the player must manage offense and defense simultaneously. A single "intel" channel can't distinguish between "enemy approaching from north" and "enemy approaching from south." The player needs *spatial partitioning* of their information architecture — the same need that drives Factorio players from a single bus to city blocks.

**The sensory experience of city block topology:**
The plan screen's channel map panel is now a structured diagram with visible clusters. Two boxes labeled "NORTH" and "SOUTH," each containing a scout→relay→striker chain with internal channel lines. A "COMMAND" box sits above, with incoming lines from both clusters and outgoing lines to a "RESERVE" box. The diagram looks like an actual system architecture diagram. It IS an actual system architecture diagram — the game vocabulary maps 1:1.

During sealed watch, the player can track two independent signal cascades flowing simultaneously — north-flank signals moving in cool blue tones, south-flank signals in warm amber. When the command agent fires a priority signal, a bright white pulse radiates from the center of the board. The reserve striker snaps to action. The player watches a distributed system coordinate in real time. This is the "I'm managing smart autonomous systems" feeling the game is chasing.

---

## Designing the Walls That Motivate Architectural Evolution

The Factorio progression happens because the game *creates unavoidable pain* at each architecture's scale limit. Robot Uprising must do the same — and the tool for creating that pain is already in the design: **context overload.**

### Wall 1: "The Noise Floor" (Triggers Spaghetti → Bus)

**Mission design:** A mission with 5-6 units, 2 enemy types, and a confined board area. The player's instinct is to wire everything to everything (their successful spaghetti from Missions 1-4). But signal volume is now high enough that every unit's buffer fills within 3-4 ticks. Strikers stun from overload. Scouts report the same enemy three times through three different paths. The mission is *winnable* with spaghetti — but barely, and only if the player also configures listen/ignore filters tightly.

**The pain:** The Inspector reveals that 60% of buffer contents are redundant. Three copies of the same threat report, arriving through three different paths. The player sees the waste viscerally — context window slots burning on duplicate data while time-critical new observations get evicted.

**The solution the player discovers:** "My strikers don't need raw scout data. They need processed intelligence. The relay should do the processing." This is the bus moment. The player redesigns: scouts→relay→strikers, with strikers ignoring raw channels. Buffer utilization drops from 95% to 40%. The striker never stuns again.

**Why this works as emergent teaching:** The game doesn't say "build a hierarchical topology." It creates a situation where hierarchical topology is the obvious response to visible pain. The player invents the pattern themselves and feels smart for doing so. This is Factorio's genius applied to information architecture.

**Comparable game moment:** Factorio's oil processing wall. Before oil, you can belt everything anywhere. After oil, fluids don't go on belts, cracking creates unwanted byproducts that back up if you don't handle them, and suddenly your layout matters. The solution (dedicated fluid processing area feeding into the main bus) emerges from the constraints, not from a tutorial.

### Wall 2: "The Single Point of Failure" (Triggers Bus → City Blocks)

**Mission design:** A mission with enemies attacking from two directions simultaneously. The player's bus architecture routes all intel through a single relay. Enemy scouts detect the relay's EM emissions (a mechanic from the emissions model). A targeted strike eliminates the relay. Instantly, every striker on the board goes dark — no more processed intel, buffers empty, units fall back to default behavior (which is useless without context). Cascade failure. The player watches their entire army become headless because they had *one* relay processing *all* intelligence.

**The pain:** The Inspector shows the moment of failure: tick 14, relay eliminated. Tick 15 onward, every striker's buffer is empty. Every rule evaluates to "no match" because the conditions reference intel data that no longer arrives. The army stands still while enemies close in.

**The solution the player discovers:** "I can't have a single relay handling everything. I need separate relay chains for each sector, so losing one doesn't kill the rest." This is the city block moment — modular, independent communication cells with redundancy built in.

**Why this works:** The game doesn't say "build redundant relay chains." It kills the player's relay and lets them experience the cascade failure. The Inspector makes the cause-and-effect chain undeniable. The player's next design has two relays, each handling a sector. The architecture evolves.

**Comparable game moment:** Factorio's first biter attack destroying a critical belt junction. The entire factory starves because one belt tile was destroyed. The player learns to build redundant supply paths and dedicated military outposts — not because a tutorial said so, but because they watched their factory die from a single point of failure.

### Wall 3: "The Coordination Ceiling" (Triggers City Blocks → Meta-Architecture)

**Mission design:** Missions 8-10, full factory vs. factory. The player has modular channel architectures per sector. But the enemy adapts — shifting attack vectors, feinting north to draw resources, then striking south. The player's static sector assignments can't respond fast enough. The reserve system (a striker listening to both sectors) is overwhelmed — it can only be in one place.

**The pain:** The player needs *dynamic reallocation* — units shifting between sectors based on real-time threat assessment. But their static channel wiring can't do this. A striker hardwired to "north-intel" can't respond to southern threats.

**The solution the player discovers:** The Command agent's `reassign` and `reroute` skills. A Command agent can dynamically change which channels a subordinate unit listens to mid-battle. The player builds a meta-layer: the Command agent watches both sectors, detects which is under heavier attack, and reroutes reserve forces dynamically. This is the "factory that builds the factory" — the meta-level the game's pitch calls out.

**Why this works:** The player has organically arrived at the need for dynamic orchestration. They've outgrown static wiring the same way Factorio players outgrow static belt layouts and discover logistics bots. The Command agent isn't introduced as "the next thing to learn" — it's introduced as "the answer to the pain you're currently feeling."

---

## The Three Architectures Compared

| Dimension | Spaghetti | Bus | City Blocks |
|-----------|-----------|-----|-------------|
| **Factorio analog** | Belts everywhere | Main bus with branches | Train-based city blocks |
| **Channel topology** | All-to-all, ad hoc names | Layered: raw→processed, directional flow | Modular clusters with defined interfaces |
| **Buffer utilization** | High (redundant signals) | Medium (filtered, compressed) | Low per-unit (each unit gets only relevant data) |
| **Context overload risk** | High | Medium | Low |
| **Relay dependency** | Optional (signals go direct) | Critical (relays are the bus) | Distributed (one relay per module) |
| **Single point of failure** | None (everything's redundant by chaos) | High (bus relay is critical) | Low (each module independent) |
| **EM emissions** | High (many hooks firing) | Medium (fewer, targeted hooks) | Optimizable per module |
| **Legibility in sealed watch** | Chaotic signal flashes everywhere | Clean left-to-right flow | Multiple parallel cascades, color-coded |
| **Channel map readability** | Spaghetti of crossing lines | Clean three-tier diagram | Clustered boxes with defined interfaces |
| **When it's optimal** | 3-4 units, low signal volume | 5-8 units, moderate complexity | 8+ units, multi-vector threats |
| **Missions where it works** | M1-4 (pre-placed units) | M5-7 (factory, single front) | M8-10 (full system, multi-front) |
| **Player skill required** | None (default behavior) | Medium (understands filtering) | High (understands modularity + command) |

---

## Player Journeys

### Journey: Sofia, 28, UX Designer, First Strategy Game

**Context:** Mission 6, just unlocked factory in Mission 5. Her Mission 1-4 configs were spaghetti — every unit on `alert`, `move`, `help`. They worked. Her Mission 5 attempt failed twice from context overload.

**Minute 0:00 — Plan Screen, Third Attempt**
Sofia stares at her workbench. Six blueprint slots, three active. Her Scout blueprint has two hooks: `ON_OBSERVE → emit "alert"` and `ON_THREAT → emit "danger"`. Her Relay has `ON_RECEIVE → compress → emit "alert"`. Her Striker listens to both `alert` and `danger`. The channel map panel on the right shows a tangled web — five channels, twelve connections, lines crossing everywhere. She scowls. "This looks like my first wireframe sketches in college."

**Minute 0:45 — The Redesign Moment**
She thinks about what went wrong last time. Opens the Inspector from her previous failed run (it's still available). Clicks on the dead Striker. Buffer state at tick 9: slot 1 = raw scout observation (enemy at D4), slot 2 = same observation compressed by Relay, slot 3 = raw scout observation (enemy at D5, same group), slot 4 = same compressed by Relay, slot 5 = noise from environment, slot 6 = another raw duplicate, slot 7 = her own movement echo, slot 8 = OVERLOAD. Red pulse. Stun.

She realizes: "The Striker doesn't need the raw stuff. It only needs what the Relay already compressed." She goes back to the Plan screen. Opens the Striker blueprint's Context Config section. Under "Listen," she unchecks `"alert"` and `"danger"`. Only `"intel"` remains — a new channel she creates by typing it into the Relay's outgoing hook. The Relay now compresses raw alerts and emits on `"intel"`.

**Minute 2:00 — Channel Map Transformation**
The channel map panel updates in real time. Half the lines disappear. The remaining connections form a clear left-to-right flow: Scouts on the left emit cyan lines to `raw` channels. Relay in the middle catches those, emits amber lines to `intel`. Strikers on the right receive only amber. Sofia literally says "oh" out loud. The map looks like a proper UX flow diagram now.

**Minute 3:30 — EXECUTE**
Sealed watch begins. The board is calmer this time. Scout spots enemy at tick 3 — green flash. Cyan dashed line to Relay at tick 4. Relay glows briefly (compressing). Amber line to Striker at tick 5. Striker moves. No overload. No stun. The cascade flows left to right like a conveyor belt. Sofia watches the clean signal flow and feels the same satisfaction she gets when a design system comes together.

**Minute 5:00 — Mission Success**
All enemies eliminated by tick 22. Inspector reveals: Striker buffer utilization peaked at 50%. Zero overload events. Context window chart is a calm green line. Sofia leans back. She just reinvented the data pipeline. She doesn't know the computer science term. She doesn't need to.

**UI Annotations:**
- Channel map panel: right-side read-only diagram, auto-generated from hook configurations. Lines are colored by channel, thickness indicates signal volume. Crossing lines are visually de-emphasized (thin, low opacity) while clean flows are prominent.
- Context Config listen/ignore: toggle switches per channel name in the blueprint editor. Unchecking a channel grays out its line in the channel map immediately.
- Inspector buffer state: each slot is a horizontal row showing content type icon (📡 signal, 👁 observation, 🔇 noise), source unit tag, tick received, and whether it was used in a rule match (green checkmark or gray X).

---

### Journey: Marcus, 34, Backend Engineer, Factorio Veteran (400 hours)

**Context:** Mission 8, first factory vs. factory mission. He built a clean bus architecture in Mission 6 — single relay, filtered channels. It's served him well. He expects it to work here.

**Minute 0:00 — Plan Screen**
Marcus reviews the battlefield preview. Two enemy spawners — one north (A1), one south (A8). His factory is at H4. He needs to defend two fronts. His current setup: two Scouts (one assigned north patrol, one south), one Relay (center), two Strikers. All scouts emit on `recon`. Relay compresses everything onto `intel`. Both Strikers listen to `intel`.

He thinks: "Same as my Factorio bus. One central processing line. Should work." He hits EXECUTE.

**Minute 1:30 — Sealed Watch: The Cascade Failure**
Everything is fine until tick 11. Both enemy fronts attack simultaneously. North scout reports two threats. South scout reports two threats. Four signals arrive at the Relay on the same tick. Relay compresses and emits four intel signals. Both Strikers receive all four. Their 8-slot buffers absorb the signals, but now their rules evaluate ambiguously: "move toward nearest threat" triggers on TWO threat reports from opposite directions. Striker-1 moves north. Striker-2 moves south. The center is undefended.

Tick 14: an enemy scout flanks center. No one detects it — both player Scouts are at the north and south edges. The enemy scout tags the player's Relay. Tick 16: enemy Striker, guided by the tag, eliminates the Relay. The amber `intel` lines on the board go dark. Both Strikers' buffers stop receiving. By tick 18, their context windows are stale. They stand still, rules evaluating empty buffers. The enemy closes in from both sides.

Marcus watches his bus architecture die exactly the way a Factorio main bus dies when biters break through the wall and eat the smelter column.

**Minute 3:00 — Inspector: The Postmortem**
He clicks the Relay. Eliminated tick 16. He clicks the timeline scrubber, steps back to tick 14. The enemy scout was at E4 — two tiles from the relay, inside its zero-perception radius. No one saw it coming because both scouts were at the board edges. The channel map at tick 16 shows the moment of failure: the Relay node goes from amber (active) to gray (eliminated). Every downstream connection dies.

Marcus mutters: "Single point of failure. Same mistake as running one belt line to the smelter array in my first Factorio base."

**Minute 4:00 — The Redesign**
He splits his architecture. Two independent modules:

**North Module:** Scout-N → `north-raw` → Relay-N → `north-intel` → Striker-N
**South Module:** Scout-S → `south-raw` → Relay-S → `south-intel` → Striker-S

Each relay only handles its sector's data. If one relay dies, the other sector keeps operating. He adds a Channel: `emergency` — both Relays listen for the other Relay's elimination event. If Relay-N dies, Relay-S picks up the north-raw channel as fallback (slower, but not dead).

The channel map panel transforms. Two clean parallel flows instead of one central funnel. It looks like... city blocks. Marcus grins.

**Minute 6:00 — Second Run**
Sealed watch. Same enemy double-attack at tick 11. This time, each sector handles its own threats independently. North signals stay in the north pipeline. South signals stay in the south pipeline. No cross-contamination. No ambiguous targeting. Both Strikers engage their assigned threats without confusion.

Tick 14: enemy scout flanks center again. But this time, Relay-N's hook detects the EM emission from the enemy scout's communication — the emissions model reveals flankers. Relay-N emits on `emergency`. Striker-N reroutes to intercept. The flanker is eliminated at tick 16. Both relays survive.

Marcus watches his modular architecture absorb the exact attack that killed his bus. He thinks: "This is exactly what happened when I switched from a main bus to city blocks in my 200-hour Factorio save."

**UI Annotations:**
- Channel map clustering: when channels form clear modules (all connections within a group, few connections between groups), the auto-layout algorithm clusters them into visual boxes with subtle background tinting. The player doesn't create the boxes — the system detects modularity and renders it.
- Emergency channel: displayed as a dashed red line in the channel map, visually distinct from regular signal flow. During sealed watch, emergency signals flash with a brighter, wider pulse.
- Relay elimination event: the relay tile dims, a brief static-burst animation plays, and all outgoing signal lines from that relay dissolve over 0.3 seconds. The visual of connections "going dark" makes the cascade failure viscerally legible.

---

### Journey: Aiko, 16, High School Student, Plays Mobile Games Mainly

**Context:** Mission 5, just unlocked the factory. First time building blueprints. Her Mission 1-4 configs were minimal — she used default settings where possible and only changed one thing per mission as the boot log suggested. She doesn't know what "topology" means.

**Minute 0:00 — Plan Screen, First Factory Mission**
Aiko sees the workbench for the first time with the production queue at the bottom — a horizontal conveyor belt strip with blueprint icons she can drag. She has three blueprint templates unlocked: Scout, Relay, Striker. The mission briefing (boot log) says: `FACTORY_MODULE: ONLINE. Produce units. Destroy enemy spawner at A1.` No instructions about HOW to wire them. The boot log just says the factory exists.

She drags Scout into the first production slot. Then Striker. Then another Striker. No Relay — she doesn't feel like she needs one yet. She opens the Scout blueprint. Two hook slots. She types `alert` into the first hook's channel field (the same channel name she's been using since Mission 3). She opens the Striker blueprint. Under Context Config, she toggles `alert` to LISTEN. Everything talks to everything on one channel. Pure spaghetti. She hits EXECUTE.

**Minute 2:00 — Sealed Watch: It Works (Barely)**
Three units spawn over 6 ticks. Scout goes north, spots enemies. Signal on `alert`. Both Strikers receive it. They both move toward the same enemy. One engages, one arrives a tick late. Redundant targeting. The second enemy approaches from the east. Neither Striker sees it — they're both in the northwest corner chasing the first target. Scout reports the eastern enemy on `alert`. Both Strikers get the signal, but their buffers are already half-full from the northern engagement's observations. The eastern signal sits in queue. One Striker reroutes. It arrives just in time.

Mission succeeds at tick 34, but it was sloppy. Two Strikers chasing one enemy while another enemy flanked. Aiko notices: "Why did they both go the same way?"

**Minute 4:00 — Inspector: The Aha**
She clicks Striker-2. Buffer at tick 8: slot 1 = enemy at B2 (from Scout), slot 2 = same enemy at B2 (from Striker-1's own observation, re-broadcast on `alert`). Both slots are the same enemy. Striker-2's rule — "IF buffer contains threat → move toward nearest threat" — triggered on the B2 data because it arrived first. The eastern enemy's signal arrived at slot 5 on tick 10, two ticks later.

Aiko doesn't think in terms of "hierarchical topology." She thinks: "The Strikers are copying each other's homework." She goes back to the Plan screen.

**Minute 5:30 — The Intuitive Fix**
She doesn't build a "bus." She does something simpler: she creates a second channel. `left-side` and `right-side`. She assigns Scout to patrol the middle and emit on both channels, but configures Striker-1 to LISTEN only to `left-side` and Striker-2 only to `right-side`. Then she adds a crude rule to the Scout: "IF enemy is west of E-column → emit on `left-side`, IF east → emit on `right-side`."

This isn't a bus. It's a spatial partition — closer to city blocks than a hierarchical relay chain. Aiko arrived at modularity from a completely different direction than Marcus. She didn't think about "processing layers." She thought about "splitting the classroom into groups."

**Minute 7:00 — Second Run**
Sealed watch. Scout spots both enemies. Northern enemy → signal on `left-side` to Striker-1. Eastern enemy → signal on `right-side` to Striker-2. Each Striker gets only one signal. No redundancy. No confusion. They split and engage simultaneously. Mission succeeds at tick 26, eight ticks faster.

Aiko feels clever. She invented spatial channel partitioning without anyone teaching her. Later, when she encounters the Relay's compress skill, she'll add relays to each partition, naturally arriving at the full bus architecture. But the foundational insight — *don't send everything to everyone* — was hers.

**UI Annotations:**
- Channel name text field: free-form input in the hook configuration panel. Typing a new name auto-creates the channel. The field shows a small colored dot (auto-assigned color) next to the channel name.
- Spatial partitioning not visually supported: the plan screen shows no "left" or "right" zones — the player must mentally map channel names to board regions. This is a design tension: should the plan screen offer spatial channel assignment tools, or should this remain a player-invented concept?
- Inspector's buffer replay: stepping through ticks shows each slot filling in real time, with a gentle "pop" animation when a new entry arrives. Entries that influenced a rule decision glow green. Entries that were present but unused are dimly lit. Entries that overflowed are shown as a brief red flash at the buffer's edge.

---

## Interaction Effects

### With Hook Chaining (3.09)
If hooks can chain (Approach B — same-tick cascading), the bus architecture becomes more powerful: Scout observes → hook fires → signal to Relay → Relay's hook fires (same tick) → compressed intel to Striker → Striker acts. The three-unit cascade resolves in a single tick instead of three. This makes bus architecture *dramatically more responsive* than spaghetti, widening the gap between architectures and making the transition more rewarding. Without chaining, the bus still works but the latency savings are smaller.

### With Context Overload (Locked Mechanic)
Context overload is *the wall.* Without the "1 tick stun when buffer fills" mechanic, spaghetti has no scaling penalty. The player could wire everything to everything forever. Context overload creates the organic pain that drives architectural evolution. The stun duration (1 tick) is calibrated precisely: painful enough to notice in a one-shot-one-kill game, but survivable enough that the player's first spaghetti attempt doesn't instantly fail.

### With the Emissions Model
Emissions punish deep architectures (more hooks = more EM noise = more detectable). This creates a counter-pressure against the bus and city block transitions: more structured architectures have more hook activations. The player must balance architectural clarity against stealth. This is a sophistication layer that arrives in later missions — Missions 8-10 force players to optimize their city blocks for low emissions, adding a new dimension to the same architectural progression.

### With the Inspector (Locked)
The Inspector is what makes this progression *learnable.* Without the Inspector's ability to show buffer contents, rule match traces, and signal genealogy, the player can't diagnose WHY their spaghetti failed. The two-act debrief structure (sealed watch → Inspector) means the player first *feels* the failure (emotional), then *understands* it (analytical). This emotional→analytical sequence mirrors Factorio's experience: first you watch your factory starve (emotional), then you zoom in and trace which belt is backed up (analytical).

### With the Channel Map Panel
The channel map panel is the plan screen's "minimap of your architecture." As the player evolves from spaghetti to bus to city blocks, the channel map panel should visually reward cleaner architectures. A spaghetti map looks chaotic (crossing lines, overlapping colors). A bus map looks clean (parallel flows, directional). A city block map looks modular (clustered boxes with thin inter-cluster connections). The map itself becomes a quality signal — the player learns to read their own architecture's health from its visual shape, the same way Factorio players learn to eyeball a factory's health from its bird's-eye view.

### With the Community Mission Editor (5.08)
Community missions can be designed to specifically target architectural weaknesses. A mission labeled "spaghetti killer" floods the board with redundant signals. A "bus breaker" includes a relay-hunting enemy. A "city block stress test" attacks from five directions simultaneously. Community-authored walls accelerate the architectural progression for players who engage with user-generated content.

---

## Comparable Games Beyond Factorio

| Game | Architectural Evolution | Trigger Mechanism | Teaching Method |
|------|------------------------|-------------------|-----------------|
| **Factorio** | Spaghetti → Bus → City Blocks | Resource scaling, production chain complexity | Pain (factory starvation) → fix → satisfaction |
| **Screeps** | Direct control → Role systems → Swarm intelligence | CPU budget constraints, multi-room management | Code hits CPU cap → must optimize → refactor |
| **SpaceChem** | Brute-force molecule paths → Synchronized dual-reactor chains | Reactor count limits, throughput requirements | Puzzle won't fit in space → must restructure |
| **Shapez** | Unprocessed belts → Splitter arrays → Compact module stacks | Shape complexity, belt throughput limits | Output rate too low → observe bottleneck → redesign |
| **Oxygen Not Included** | One big room → Dedicated rooms → Sealed systems | Gas mixing, temperature management, germ spread | Colony collapse from uncontrolled gas → sealed rooms emerge |
| **Robot Uprising** | Spaghetti hooks → Bus (relay hierarchy) → City blocks (modular sectors) | Context overload, single points of failure, multi-front attacks | Inspector reveals buffer waste → redesign → cleaner topology |

---

## The TikTok Clip

**15-second version:** Split screen. Left: "ATTEMPT 1" — spaghetti channel map, chaotic sealed watch with flashing signals, unit stuns, cascade failure. Right: "ATTEMPT 2" — clean bus channel map, smooth left-to-right signal cascade, no stuns, victory. Both from the same mission. The before/after of discovering the bus. Caption: "my first robot architecture vs. after I discovered information routing." Every engineer, every Factorio player, every student who's ever refactored spaghetti code *feels* this clip.

---

## Open Questions

1. **Should the channel map panel explicitly detect and label architectural patterns?** E.g., "Your topology is: star" or "Your topology is: hierarchical bus." This would accelerate learning but might feel prescriptive. Factorio never tells you you've built a bus.
2. **Should there be missions that specifically reward spaghetti?** A mission where all-to-all connectivity is optimal (small scale, high redundancy needed) would validate the beginner architecture and prevent it from feeling like a mistake.
3. **How does the Relay's stationary nature interact with city block evolution?** Factorio's buses are made of moveable belts. Robot Uprising's relays are fixed once spawned. This means relay placement during the plan phase IS the architectural decision — you can't reroute a bus after hitting EXECUTE.
4. **Does the progression need to be explicit or purely emergent?** Factorio's is purely emergent — no tutorial mentions buses. But Robot Uprising has a boot log and Inspector that could subtly hint at architectural patterns. The balance between "player discovers it themselves" and "the game points toward it" is a core design tension.
5. **Can a player succeed with spaghetti the entire game?** In Factorio, spaghetti can launch the rocket — it's just harder. In Robot Uprising, should spaghetti be viable for all 10 missions (hard mode), or should later missions make it mechanically impossible (forcing the architectural transition)?
