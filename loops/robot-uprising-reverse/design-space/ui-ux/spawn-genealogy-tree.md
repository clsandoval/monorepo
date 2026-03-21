# 4.12 — The Spawn Genealogy Tree: Visualizing Production Ancestry in the Inspector

**Aspect:** 4.12 — The spawn genealogy tree: how the debrief visualizes which agents spawned which, cycle-by-cycle ancestry; what information to show per spawn event (inherited buffer snapshot, spawn trigger cause, fabrication cost consumed, whether the spawn was a hook consequence or skill consequence)

**Related:** 4.04 — Debrief screen; 4.16 — Signal genealogy visualization; 4.02 — Sealed watch; 4.04a — Debrief as debugger; 2.07 — Factory/production model

---

## The Core Design Problem

The signal genealogy (4.16) answers "who talked to whom." The spawn genealogy answers a different question: **"who built whom, when, why, and with what?"** In late-game factory-vs-factory missions (8-10), the player's factory is continuously producing units from a production queue of blueprints. Each unit that appears on the board is the result of a decision chain: which blueprint was next in the queue, how much material was consumed, what triggered the production cycle, and — critically for Command agents with the `reassign` skill — whether the blueprint was modified before fabrication.

This is not a trivial display problem. In a 60-tick match with a factory producing every 4-5 ticks, the player might spawn 12-15 units. Each unit has a birth story: the blueprint it came from, the production cost paid, the tick it entered the board, its initial context window state, and the causal chain that led to its creation. Some spawns are routine (next item in queue). Some are reactive (a Command agent rerouted production in response to a battlefield event). Some are consequential — the scout that spawned at tick 32 was the scout that eventually tagged the enemy base, but only because the Command agent's hook fired at tick 28 and bumped the scout blueprint to the front of the queue.

The spawn genealogy must make these production stories **legible and traceable**. The player needs to answer: "Was my production order correct? Should I have built a relay before that striker? Did the Command agent's reassign actually help or did it waste resources?"

---

## Comparable Systems

### Factorio's Production Statistics

Factorio tracks items produced, consumed, and stored over configurable time windows. The production tab shows per-item graphs — iron plates produced per minute, circuits consumed per minute. Players use these graphs to diagnose bottlenecks: if iron plate production drops, something upstream is starving.

**What translates:** The idea that production is a *story told in numbers over time.* Robot Uprising's spawn genealogy is simpler (discrete units, not continuous flow), but the diagnostic goal is identical: "was my production pipeline healthy, and where did it choke?" Factorio's time-window selector (5s, 1m, 10m, all) maps to Robot Uprising's tick-range selector.

**What doesn't translate:** Factorio's production is continuous and parallel — dozens of assemblers producing simultaneously. Robot Uprising has one factory, one queue, sequential production. The visualization can be much simpler because the data is inherently linear.

### Dwarf Fortress Legends Mode

Dwarf Fortress's Legends mode presents a genealogical tree of every creature in the world — who was born, who died, who their parents were, what they accomplished. The tree can span hundreds of generations and thousands of entities. The navigation is a text-driven hyperlink system: click a name to see their page, which lists events, relationships, and descendants.

**What translates:** The *narrative* framing. Every unit has a biography — born at tick N from blueprint X, lived N ticks, accomplished Y, died at tick Z. The genealogy is not just a data structure; it's a collection of stories. Dwarf Fortress proves that players will read tiny biographies of entities they care about, even procedurally generated ones.

**What doesn't translate:** Scale. Dwarf Fortress has thousands of entities. Robot Uprising has 15 at most. The visualization can be much richer per-entity because there are so few to show.

### Git Commit Graphs

Git's commit graph (as rendered by `gitk`, GitHub's network view, or GitKraken) shows a directed acyclic graph of commits over time. Each commit is a node on a timeline. Branches diverge and merge. Clicking a commit shows its diff, author, message, and parent(s). The graph is read top-to-bottom (newest first) or bottom-to-top.

**What translates:** The spawn genealogy IS a commit graph. Each unit is a "commit" — a snapshot of a blueprint at a moment in time. The factory is the "repository." The production queue is the "branch." A Command agent's reassign is a "rebase" — it changed what was going to be built next. The visual language of nodes on a vertical timeline with metadata panels is directly applicable. Players who've used GitHub's network graph will immediately understand the spawn tree.

**What doesn't translate:** Git graphs have branching and merging. The spawn tree is strictly linear from the factory's perspective (one queue, one output at a time). However, if Command agents can modify blueprints before spawning, the tree gains a "modified from" relationship that introduces a second kind of edge — not a branch, but an annotation.

---

## The Visualization: "The Assembly Line"

The spawn genealogy is rendered as a vertical timeline in the Inspector's sidebar — a panel nicknamed **"The Assembly Line."** It shows every unit produced during the match, ordered by spawn tick, with rich metadata per spawn event and visual connectors showing blueprint lineage.

### Layout

The Assembly Line occupies a tab in the Inspector's right sidebar, alongside the Signal River (4.16), the Event Log, and the Context Window chart. The tab icon is a small factory silhouette with a downward arrow.

**Vertical orientation.** Time flows top-to-bottom. Each spawn event is a horizontal card — 64px tall, full panel width — showing the unit that was produced. Cards are stacked vertically with 4px gaps. A thin vertical "conveyor line" runs down the left edge of the panel, connecting all cards — a visual metaphor for the production queue feeding units into the world. The conveyor line is a 3px-wide strip in a muted steel-grey, with small chevron marks (like conveyor belt ridges) repeating every 16px.

### Per-Spawn Card Anatomy

Each card contains:

**Left zone (64x64px) — Unit identity:**
- The unit's portrait icon (scout eye, relay antenna, striker sword, etc.) at 32x32, centered vertically
- Below the icon, the unit's designation in small monospace text: `SCT-03`, `RLY-01`, `STK-02`
- A colored left border (4px wide) indicating unit type: teal for scout, amber for relay, red for striker, violet for specialist, gold for command

**Center zone (flexible width) — Spawn metadata:**
- **Line 1:** Blueprint name in bold. e.g., "Scout Alpha" or "Relay Bravo". If the blueprint was modified by a Command agent before this spawn, the name appears with a small wrench icon and an italic suffix: "Scout Alpha *(modified T28)*"
- **Line 2:** Spawn tick and cost. e.g., "T16 · 3m consumed · 47m remaining". The material cost is rendered in a warm copper color. The remaining budget is dim grey.
- **Line 3:** Spawn trigger — one of:
  - `Queue order` (routine — this was simply next in line) — rendered in neutral grey
  - `Hook: [channel-name] → [hook-name]` (a hook on the factory or a Command agent triggered production) — rendered in the channel's color with a small lightning bolt icon
  - `Skill: reassign by CMD-01` (a Command agent used the reassign skill to modify the queue) — rendered in gold with a small command icon
  - `Emergency: queue override` (a Command agent bumped this blueprint to the front) — rendered in orange-red with an exclamation mark

**Right zone (48px) — Outcome glyphs:**
- A small fate indicator: green checkmark if the unit survived to match end, red skull if it was destroyed, amber clock if it was stunned within its first 3 ticks of life (spawned into chaos)
- Below that, a tiny lifespan bar: a horizontal strip showing the unit's lifetime as a proportion of total match length. A unit that lived the entire match has a full green bar. A unit that was destroyed 2 ticks after spawning has a sliver of red.

### The Inherited Context Snapshot

Clicking a spawn card expands it downward (accordion-style, 300ms ease-out) to reveal the **inherited context snapshot** — what the unit's context window looked like at the moment of birth.

This is critical because units don't spawn with empty context windows. The factory can pre-load initial context based on the blueprint's configuration: listen filters determine what channels the unit immediately subscribes to, and any pending signals on those channels at the moment of spawn are immediately ingested. A scout spawning at tick 20 might already have 2 of its 6 context slots filled with relay broadcasts from ticks 18-19.

The expanded card shows:
- **Context window grid:** A horizontal row of slots (6 for scout, 8 for striker, etc.), each slot as a 20x20 colored square. Empty slots are dark grey with a dashed border. Filled slots are colored by source: green for observations already in range, blue for signals received at spawn, magenta for pre-loaded commands from a Command agent. Hovering a filled slot shows a tooltip with the entry's content, source, and age.
- **Listen configuration:** Below the context grid, a row of small channel badges showing which channels the unit is listening to at birth. Each badge is a rounded pill in the channel's color with the channel name in small text. Channels that already delivered a signal at spawn have a small "1" count badge.
- **Blueprint diff** (only if modified): If a Command agent modified the blueprint before this spawn, a compact diff appears — showing what changed. e.g., "Rule 3 priority: 5 → 1" or "Hook added: threat-net → evade". The diff uses green for additions, red for removals, amber for modifications — the same visual language as a code diff.

### Conveyor Connections

The vertical conveyor line connecting cards has additional visual information:

- **Idle gaps:** Between consecutive spawn cards, the conveyor line shows the number of ticks between spawns as a small label centered on the line. e.g., "4 ticks" between a card at T16 and a card at T20. Long idle gaps (more than 8 ticks) cause the conveyor line to turn from steel-grey to amber, with a subtle pulsing animation — visual indication that the factory was idle for too long (either out of resources or nothing in queue).
- **Queue reorder markers:** If the production queue was reordered between two spawns (by a Command agent or hook), a small shuffle icon appears on the conveyor line at the tick the reorder happened. Clicking the icon shows a before/after of the queue order.

### Cross-Linking with the Board

Clicking a spawn card highlights the corresponding unit on the board (at the tick it spawned) with a bright cyan ring and a brief spawn animation replay — the unit materializing from the factory tile with a burst of cyan particles. The timeline scrubber snaps to the spawn tick. This lets the player jump from "what was built" to "where it appeared and what happened next" in one click.

Conversely, clicking any unit on the board and opening its inspector panel shows a small "Born: T16 from Scout Alpha" link at the top of the unit's context window display. Clicking that link scrolls the Assembly Line panel to the corresponding spawn card and expands it.

---

## Three Display Density Modes

### Compact Mode: "The Receipt"

For quick scanning. Each spawn event is a single line — no cards, no expansion. The panel shows a vertical list:

```
T08  SCT-01  Scout Alpha      3m  Queue     ✓ [████████░░]
T12  RLY-01  Relay Bravo      5m  Queue     ✓ [██████████]
T16  STK-01  Striker Gamma    8m  Queue     ☠ [███░░░░░░░]
T20  SCT-02  Scout Alpha*     3m  Hook      ✓ [████████░░]
T24  CMD-01  Command Delta   10m  Queue     ✓ [██████████]
T28  STK-02  Striker Gamma    8m  Reassign  ☠ [██░░░░░░░░]
```

Each line: tick, designation, blueprint name (* if modified), cost, trigger type, fate glyph, lifespan bar as text. Monospace font, tight 20px line height. The asterisk on "Scout Alpha*" is a hyperlink — hovering shows the modification diff as a tooltip.

### Standard Mode: "The Conveyor" (Default)

The full card layout described above. Each spawn is a 64px card on the conveyor line. Click to expand for inherited context and blueprint diffs.

### Expanded Mode: "The Dossier"

Every card is pre-expanded, showing full inherited context snapshots, blueprint diffs, and additionally:
- The unit's **first 3 ticks of life** rendered as a micro-timeline: three small board snapshots (48x48px each) showing where the unit went and what it did in its first moments of existence. This answers "did this unit do anything useful immediately after spawning, or did it stand still and get killed?"
- A **lifetime summary stat line**: "Lived 28 ticks. Sent 4 signals. Tagged 2 enemies. Destroyed 1 enemy."

---

## Interaction Effects

### With Signal Genealogy (4.16)

The spawn genealogy and signal genealogy are complementary but orthogonal views. The signal genealogy shows communication between existing units. The spawn genealogy shows where those units came from. Together, they answer the full question: "Was the right unit built at the right time, and once built, did it communicate effectively?"

A cross-link mode allows clicking a unit in the spawn genealogy to highlight all of that unit's signal arcs in the signal river view — showing the communication footprint of each production decision. "RELAY-01 was built at tick 12 and immediately became the central routing hub" becomes visible as a spawn card at T12 with a dense cluster of signal arcs originating from the relay's swim lane starting at T13.

### With Counterfactual Simulation (4.20)

The spawn genealogy becomes the launch point for production counterfactuals: "What if I had built a relay at T16 instead of a striker?" The player right-clicks a spawn card and selects "What if different blueprint?" — which opens the counterfactual panel with the spawn tick pre-selected and the production queue editable. This is the "factory rewind" — not rewinding combat, but rewinding production decisions.

### With the Plan Screen

After the debrief, the player returns to the Plan screen to modify their architecture. The spawn genealogy's findings should directly inform plan changes. A "carry to plan" button at the bottom of the Assembly Line panel highlights production queue issues: "Your factory was idle for 12 ticks (T35-T47) — consider cheaper blueprints to maintain throughput." These are not prescriptive (the game doesn't tell you what to build), but diagnostic (the game tells you where your production pipeline had problems).

### With Command Agent Design

The spawn genealogy is where Command agents prove their value. A Command agent that never triggers a queue reorder or blueprint modification is visible in the genealogy as wasted resources — every spawn card says "Queue order" in grey, and the 10m cost of the Command agent was spent for nothing. Conversely, a Command agent that correctly bumps a striker blueprint to the front at T28 (because a hook detected the enemy base was exposed) creates a dramatic narrative in the genealogy: the "Emergency: queue override" spawn card at T28, the modified blueprint with an added "prioritize-base" rule, the striker that spawns and destroys the enemy base 4 ticks later. The genealogy makes the Command agent's contribution *visible and evaluable.*

---

## Strengths

- **Production becomes debuggable.** Without the genealogy, production decisions are fire-and-forget — you set the queue and never think about it again. The genealogy makes production a first-class diagnostic surface, elevating it from "set and forget" to "tune and optimize."
- **Command agents become legible.** The Command agent's value proposition (10m cost, highest maintenance) is abstract during planning. The genealogy makes it concrete: here are the specific moments where your Command agent intervened, here's what it changed, here's whether that change helped. This is the Command agent's performance review.
- **Narrative emerges.** Each unit has a birth story. Players will remember "the scout that was emergency-spawned at T28 and won the game" the way chess players remember "the knight sacrifice on move 23." Production becomes dramatic.
- **Directly actionable.** Unlike signal genealogy (which is diagnostic but requires interpretation), spawn genealogy produces clear next steps: "I need more cheap units early" or "my Command agent's reassign hook is triggering too late."

## Weaknesses

- **Irrelevant for Missions 1-4.** Pre-placed unit missions have no production. The panel would be empty or show a static "Units pre-deployed" message. The feature only becomes meaningful at Mission 5.
- **Low drama in simple matches.** If the player uses a simple queue (Scout, Relay, Striker, repeat) and never uses a Command agent, every spawn card says "Queue order" and the genealogy is a flat list of routine events. The visualization is most powerful when production is dynamic, but many players will never reach that complexity.
- **Screen real estate competition.** The Inspector sidebar already hosts Signal River, Event Log, Context Chart, and Decision Trace. Adding the Assembly Line as another tab increases tab count. Risk of "too many tabs, never check them all" syndrome.
- **Blueprint diff complexity.** If a Command agent makes multiple modifications to a blueprint over the course of a match, the diff display per spawn card can become noisy. Needs a collapse/expand strategy for complex diffs.

---

## Sensory Description

The Assembly Line panel slides in from the right when its tab is selected, with a mechanical sound — a ratcheting conveyor motor starting up, low and rhythmic. The steel-grey conveyor line renders first, drawing itself top-to-bottom like a zipper being pulled. Then spawn cards materialize along the conveyor, each one sliding in from the right with a soft metallic "clunk" — like a part arriving on a conveyor belt. The cards appear in chronological order, top to bottom, with 50ms stagger between each.

The unit portraits on each card glow faintly in their type color — teal scouts pulse gently, amber relays emit a warm glow, red strikers have a hard-edged shimmer. The cost numbers in copper color look like stamped metal — slightly embossed, catching light. The fate glyphs at right are crisp: green checkmarks have a subtle shine, red skulls are matte and still, amber clocks tick once per second.

When you click a card to expand it, the accordion opens with a sound like a blueprint being unrolled on a metal table — a papery rustle with a metallic undertone. The inherited context grid appears slot by slot, left to right, each slot flipping from dark grey to its filled color with a 30ms stagger. Empty slots settle with dashed borders that pulse once, slowly, like a heartbeat. The blueprint diff (when present) types itself out character by character over 200ms, green additions and red deletions appearing like a terminal printout.

The idle gap warnings on the conveyor line pulse in amber — a slow, rhythmic throb like a caution light on a factory floor. The shuffle icons for queue reorders spin once when they appear, then settle into a static state. Clicking a shuffle icon triggers a brief card-shuffle animation — the spawn cards below the reorder point slide left and back, as if the queue physically rearranged.

The overall palette is industrial: steel grey, copper, matte black card backgrounds with 1px borders in unit-type colors. The typography is monospace for designations and tick numbers, sans-serif for names and descriptions. The feeling is a factory foreman's clipboard — organized, utilitarian, every mark meaningful.

---

## Player Journeys

#### Journey: Marcus, 31, Software Engineer and Factorio Veteran

**Context:** Mission 7, second attempt. First attempt failed because his army ran out of units in the late game — the factory was idle for long stretches while he had resources. He suspects his production queue was too expensive (all strikers, 8m each, factory could only produce one every 6 ticks).

**Minute 0:00 — Seal Break**
The sealed watch ends. Marcus watches the final tick replay — his last striker destroyed, enemy base still standing at half the board away. The battlefield freezes. The Inspector materializes. He sees the familiar tabs: Signal River, Event Log, Context Chart. But this time he notices the fourth tab he'd been ignoring — the factory icon with the downward arrow. He clicks it.

**Minute 0:15 — The Assembly Line Opens**
The conveyor line draws itself top-to-bottom. Eight spawn cards materialize with staggered metallic clunks. Marcus immediately sees the problem. The conveyor line between cards has large tick-gap labels: "6 ticks", "6 ticks", "7 ticks", "6 ticks". The gaps are all amber, pulsing. His factory was spending 6-7 ticks on every unit because strikers cost 8m and the factory's production rate couldn't keep up with the queue. He has eight expensive units and massive idle time between each.

**Minute 0:30 — Reading the Receipt**
He switches to Compact mode. The list crystallizes:
```
T06  STK-01  Striker Alpha    8m  Queue  ☠ [██░░░░░░░░]
T12  STK-02  Striker Alpha    8m  Queue  ☠ [████░░░░░░]
T18  STK-03  Striker Alpha    8m  Queue  ☠ [██████░░░░]
T24  STK-04  Striker Alpha    8m  Queue  ✓ [████████░░]
T30  STK-05  Striker Alpha    8m  Queue  ☠ [███░░░░░░░]
T36  STK-06  Striker Alpha    8m  Queue  ☠ [██░░░░░░░░]
T42  STK-07  Striker Alpha    8m  Queue  ☠ [█░░░░░░░░░]
T48  STK-08  Striker Alpha    8m  Queue  ☠ [█░░░░░░░░░]
```
Every line is identical. Eight strikers, all from the same blueprint, all from "Queue" trigger. No hooks, no reassigns, no Command agent involvement. The lifespan bars tell the real story: later strikers are dying faster and faster. STK-07 and STK-08 lived only 1-2 ticks each — spawning directly into enemy-controlled territory with no scout intel. The skulls stack up in red on the right column. Marcus mutters: "I'm just feeding them into a grinder."

**Minute 1:00 — The Insight**
He clicks STK-07's card to expand it. The inherited context snapshot shows: 0 of 8 context slots filled. The unit spawned with an empty context window — no signals, no observations, nothing. It didn't know where enemies were, didn't know the battlefield state, had no relay data to act on. It spawned blind and walked into an ambush. Marcus realizes: he has no scouts feeding intel, no relays compressing data, nothing for these strikers to act on. His production queue is a one-note mistake.

**Minute 1:30 — Return to Plan**
He clicks "Carry to Plan." The diagnostic summary appears: "Factory idle 58% of match time. All 8 units from single blueprint. No intel infrastructure. Suggestion: diversify production queue." Marcus exits to the Plan screen, rebuilds his queue: Scout, Relay, Striker, Scout, Striker. Cheaper units first to establish information flow, then strikers that can actually use the intel.

**UI Annotations:**
- Assembly Line tab: factory icon with downward arrow, rightmost tab in Inspector sidebar
- Compact mode toggle: three horizontal lines icon in panel header, cycling through Receipt/Conveyor/Dossier
- Idle gap warnings: amber pulsing labels on conveyor line between cards, text reads "6 ticks" centered
- Lifespan bars: 48px wide, proportional fill, green for survived, red for destroyed
- "Carry to Plan" button: bottom of Assembly Line panel, copper-colored, arrow icon pointing left

---

#### Journey: Priya, 24, First Strategy Game, Currently on Mission 6

**Context:** Mission 6 introduces the Command agent. Priya has been using scouts and relays effectively since Mission 5 but has never seen a Command agent before. The boot log for Mission 6 introduced the concept of reassigning and rerouting. She added a Command agent to her production queue but isn't sure what it's doing.

**Minute 0:00 — Post-Match Confusion**
The sealed watch was chaotic. Priya saw units appearing from her factory, but she noticed something odd — at one point, two scouts appeared in a row even though her queue was Scout, Relay, Striker, Command. She thought it was a bug. The match ended in a narrow victory. She enters the Inspector and clicks the Assembly Line tab, curious about the production order.

**Minute 0:15 — Discovering the Override**
The conveyor renders twelve spawn cards. She scrolls through them in Standard mode. The first four are normal:
- T06 SCT-01 Scout Alpha — Queue order (grey)
- T10 RLY-01 Relay Bravo — Queue order (grey)
- T14 STK-01 Striker Gamma — Queue order (grey)
- T20 CMD-01 Command Delta — Queue order (grey)

Then the pattern breaks:
- T24 SCT-02 Scout Alpha — **Skill: reassign by CMD-01** (gold text, command icon)

She blinks. The Command agent changed the production queue. She clicks the card. The expanded view shows a blueprint diff: "No modifications — blueprint unchanged." So the Command agent didn't change the scout's design — it bumped the scout to the front of the queue. Why?

**Minute 0:45 — Tracing the Cause**
She clicks the cross-link icon on the spawn card, which highlights CMD-01 on the board and snaps the timeline to T23 — one tick before the reassign. She opens CMD-01's decision trace in the main Inspector panel. Rule 2 matched: "IF threat-count > 3 AND scout-count < 2 THEN reassign: prioritize scout." The Command agent detected that three enemies were visible and only one scout was alive, so it pulled a scout blueprint to the front of the queue.

**Minute 1:15 — The Aha Moment**
She scrolls further down the Assembly Line. At T32, another unusual spawn:
- T32 STK-02 Striker Gamma* — **Hook: threat-net → emergency-strike** (coral channel color, lightning bolt)

The asterisk catches her eye. She clicks to expand. The blueprint diff shows: "Rule added: prioritize-tagged-enemies (priority 1)." The factory built a striker, but the hook modified the blueprint first — adding a rule that makes this striker go straight for tagged enemies instead of following normal patrol behavior. The inherited context snapshot shows 3 of 8 slots already filled: two threat signals from the relay and one tag marker from the scout. This striker spawned with a mission — it knew where to go before it took its first step.

She cross-links to the board. The timeline shows STK-02 spawning at T32, moving directly toward two tagged enemies, and destroying both by T36. The modified striker was a heat-seeking missile, pre-loaded with target data.

**Minute 1:45 — Understanding the Command Agent**
Priya scrolls through the rest of the Assembly Line. The Command agent triggered three queue modifications total — two scout prioritizations and one modified striker. She compares the "Queue order" spawns with the Command-triggered spawns. The Command-triggered units all have richer inherited context (2-3 slots filled vs. 0-1 for queue-order units) and higher survival rates (all three survived, while two queue-order units were destroyed). The Command agent earned its 10m cost.

She returns to the Plan screen with a new understanding: the Command agent isn't just a passive observer. Its rules determine WHEN and HOW production adapts to battlefield conditions. She starts tweaking CMD-01's rules with more confidence.

**UI Annotations:**
- Skill trigger label: gold text with command icon (small crown glyph), reads "Skill: reassign by CMD-01"
- Hook trigger label: channel-colored text with lightning bolt, reads "Hook: threat-net → emergency-strike"
- Blueprint diff: green text for additions, indented under the expanded card, monospace font
- Cross-link icon: small chain-link glyph at right edge of spawn card, clicking snaps board timeline and highlights the relevant unit
- Modified blueprint asterisk: appears after blueprint name, italic suffix shows modification tick

---

#### Journey: Daniel, 42, Into the Breach Completionist, Mission 9

**Context:** Mission 9 is full factory-vs-factory. Daniel's architecture is sophisticated: a Command agent with 6 hooks monitoring different channels, three blueprint variants (scout, relay, striker), and a production queue that's designed to be dynamically reordered by the Command agent. His first attempt was a 90-tick slugfest that ended in defeat. He's in the debrief trying to understand why his production fell apart in the late game.

**Minute 0:00 — Expanded Mode Deep Dive**
Daniel immediately opens the Assembly Line and switches to Expanded mode — the Dossier. He wants every detail. The panel fills with rich spawn cards, each pre-expanded to show inherited context snapshots, blueprint diffs, and first-3-tick micro-timelines. He has 18 units spawned across 90 ticks.

**Minute 0:20 — The Production Curve**
He scans the cards top to bottom, watching the resource numbers. Early game (T6-T30): costs are manageable, "47m remaining", "39m remaining", "31m remaining" — steady decline but sustainable. Mid game (T30-T50): the Command agent starts triggering overrides. He sees three "Emergency: queue override" cards in a row at T34, T38, T42 — the Command agent panic-building strikers in response to enemy pushes. Each costs 8m. By T42, remaining budget reads "6m remaining" in red text (the display turns from copper to warning red below 10m).

**Minute 0:45 — The Starvation Point**
At T46, the conveyor line goes amber. A large gap: "12 ticks" in pulsing amber text. The factory went idle because there wasn't enough material for the next item in queue (a 10m Command agent). For twelve ticks, nothing was built. Daniel counts: twelve ticks of factory idle time in a 90-tick match is 13% of the game with zero production output. When production resumed at T58, only a scout (3m) could be afforded.

He clicks the queue reorder marker at T33. The before/after shows: original queue was Scout → Relay → Striker (cyclical). The Command agent rearranged it to Striker → Striker → Striker. Three consecutive 8m units drained his economy.

**Minute 1:15 — Diagnosing the Command Agent**
Daniel opens CMD-01's spawn card (T20, cost 10m). The inherited context shows 4 of 14 slots filled with initial battlefield data. He cross-links to the board and replays the Command agent's decision trace from T30 to T42. The "emergency-strike" hook fired every time an enemy entered a 3-tile radius of the base. Three enemies approached in sequence, triggering three striker overrides. The hook's trigger condition was too broad — it treated every nearby enemy as an emergency, even when the previous striker hadn't finished its engagement yet.

**Minute 1:45 — The First-3-Tick Micro-Timelines**
He examines the micro-timelines on the three emergency strikers (STK-03, STK-04, STK-05). STK-03's micro-timeline shows it spawning, moving toward an enemy, and engaging. Good. STK-04's micro-timeline shows it spawning into a tile already occupied by STK-03, both units now stacked on the same target. Redundant. STK-05's micro-timeline shows it spawning, finding no nearby enemies (STK-03 already handled it), and wandering north with an empty context window. Complete waste of 8m.

The lifespan bars confirm it: STK-03 lived 22 ticks and destroyed 2 enemies. STK-04 lived 18 ticks and destroyed 0 enemies (always arrived second). STK-05 lived 12 ticks and destroyed 0 enemies (wandered into an ambush). The Command agent's override was correct once and wasteful twice.

**Minute 2:15 — The Fix**
Daniel right-clicks the STK-04 spawn card and selects "What if different blueprint?" The counterfactual panel opens with T38 pre-selected. He replaces the striker blueprint with a relay. The simulation suggests the relay would have boosted signal coverage during the mid-game push, allowing existing strikers to coordinate better instead of spawning redundant ones.

He returns to the Plan screen with three changes: (1) add a cooldown to the Command agent's emergency-strike hook — "IF last-striker-spawn > 8 ticks ago" condition added, (2) swap the third production queue slot from striker to relay, (3) reduce the Command agent's buffer from 14 to 10 slots to free up resources.

**UI Annotations:**
- Expanded/Dossier mode: all cards pre-opened, first-3-tick micro-timelines as three 48x48 board snapshots in a horizontal row below the inherited context grid
- Resource warning: cost text turns from copper to red when remaining budget drops below 10m
- Queue reorder marker: shuffle icon on conveyor line, clicking shows before/after queue state in a small popover
- "What if different blueprint?" context menu: appears on right-click of any spawn card, opens counterfactual panel with spawn tick and queue state pre-loaded
- Micro-timeline snapshots: 48x48px board crops centered on the spawned unit's position, showing its tile and immediate neighbors, with movement arrows overlay

---

## The TikTok Clip

A 15-second clip showing the Assembly Line in Expanded mode: the camera slowly scrolls down the conveyor of spawn cards. Early cards are green-checked, routine, healthy. Then three emergency-override cards in rapid succession — red text, lightning bolts, warning icons. The conveyor line turns amber. A 12-tick idle gap throbs. The last few cards show desperate, underequipped units with tiny lifespan bars. The production story is the war story: prosperity, panic, starvation, defeat. The visual alone tells you what went wrong, even without reading a single word. Cut to the player dragging blueprints in the Plan screen, rebuilding the queue. Text overlay: "Debug your factory. Win the war."
