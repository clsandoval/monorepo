# 4.105 — The Coroner's Slab: "Why Was This Signal Dropped?" Sub-Panel in Signal Genealogy

**Aspect:** 4.105 — Clicking a broken edge in the signal genealogy opens a sub-panel showing the receiving agent's buffer state at that tick — all 8 slots, their contents (signal IDs and ages), and which slot would have been displaced by the dropped signal; the most granular diagnostic view in the game; teaches that buffer-full silence is causal, not incidental

**Parent:** 4.16 — Signal Genealogy Visualization
**Siblings:** 4.15 — Probe Hooks; 4.03 — Buffer State Visualization; 3.08d — Behavior Tree Inspector View
**Related:** 2.01 — Fixed-Slot Buffer Model; 2.26 — Signal Priority Levels; 4.20 — Counterfactual Simulation; 4.67 — Probe Hook Suggestion; 8.09 — Diagnostic Layer as Teaching Arc; 4.04b — Two-Act Debrief Structure; 2.06 — Player-Configured Eviction

---

## The Coroner's Slab

Every broken edge in the signal genealogy graph is a corpse. A signal was born — stamped with a source agent, a channel, a priority tag, a tick of creation — and it traveled through the network, surviving relay hops and compression stages, only to arrive at its destination and find no room. The buffer was full. The signal died on the doorstep. The genealogy graph renders this as a broken edge: a dashed line terminating in a small red X where a solid line should have connected sender to receiver.

The broken edge tells the player *that* a signal was dropped. The Coroner's Slab tells them *why*.

This is the deepest diagnostic drill-down in Robot Uprising. Every other tool operates at the level of flows, patterns, and aggregate behavior: the signal genealogy shows network topology, the behavior tree shows decision evaluation, the buffer bar shows utilization rates. The Coroner's Slab operates at the level of individual slots. It is a forensic examination of one moment, one buffer, one failed insertion. It names every occupant of every slot, their ages and priorities, and identifies exactly which slot the incoming signal would have contested for — and lost. It is the game's equivalent of a packet capture at microsecond resolution, a core dump at a specific memory address, an autopsy report that lists time of death, cause of death, and every organ in the body.

The pedagogical purpose is precise: **buffer-full silence is causal, not incidental.** When a Striker ignores a threat alert, beginners assume the Striker's rules are wrong, or the hook was misconfigured, or the signal was never sent. The Coroner's Slab proves that the signal *was* sent, *did* arrive, and was murdered by a full buffer. The silence was not an absence of information — it was an active eviction. The buffer chose to keep what it already had over what just arrived. That choice has a reason (the eviction policy), and the reason is visible in the slot-by-slot breakdown.

Once a player has opened the Coroner's Slab and seen their critical threat alert sitting dead beside a buffer full of stale terrain observations, they never think about dropped signals the same way again. The lesson is permanent: **every drop is a decision, and every decision has a winner and a loser.**

---

## Sub-Panel Layout

The Coroner's Slab occupies a flyout panel that slides out from the right edge of the signal genealogy view. It does not replace the genealogy — it layers on top of it, anchored to the broken edge that summoned it. The broken edge remains visible behind the panel, with a thin connector line running from the red X to the panel's left border, establishing spatial continuity: "this panel is about *that* broken connection."

### Header Strip

The panel header is a dark strip (the game's standard `#1a1a2e` dark indigo) containing:

- **Victim signal identity:** Signal ID (e.g., `SIG-0347`), source agent icon and name (e.g., Scout-A), channel name (e.g., `threat-net`), signal type (e.g., `ENEMY_POSITION`), priority tag (URGENT / NORMAL / LOW with corresponding color pip), and tick of arrival.
- **Receiving agent identity:** Agent icon and name (e.g., Striker-B), unit class, buffer capacity (e.g., "8 slots").
- **Verdict line:** A single sentence in amber monospace text: `DROPPED: buffer full, no evictable slot at priority LOW or below.` or `DROPPED: all 8 slots occupied by NORMAL or higher priority signals.` The verdict is generated from the eviction policy evaluation — it states the mechanical reason in plain language.

### The Slot Table

Below the header, the panel's primary content: a vertical table of all buffer slots at the exact tick of the drop. For a Striker with 8 slots, this is 8 rows. Each row represents one occupied slot and contains:

| Column | Content | Width |
|--------|---------|-------|
| **Slot #** | Index 0-7, where 0 = oldest | 24px |
| **Signal ID** | Truncated ID (e.g., `SIG-0291`) | 72px |
| **Source** | Agent icon + abbreviated name | 64px |
| **Type** | Signal type icon + label (e.g., `TERRAIN`, `ENEMY_POS`) | 80px |
| **Priority** | Color pip (red/white/grey for URGENT/NORMAL/LOW) + label | 56px |
| **Age** | Ticks since creation, rendered as `+Nt` (e.g., `+12t`) | 40px |
| **Channel** | Channel name in monospace | 64px |

The table is compact — 8 rows at 28px height each = 224px total. It fits comfortably in the flyout without scrolling for any standard unit type (Scout 6, Striker 8, Relay 12, Command 14 — Command's 14 rows at 28px = 392px, still within a 480px panel).

### The Contested Slot Highlight

One row in the table is highlighted: the slot that would have been displaced if the dropped signal had won the eviction contest. This is the **contested slot** — the oldest, lowest-priority entry in the buffer, the one the eviction policy evaluated as the weakest occupant. The highlight is a thin amber border around the entire row, with a small amber gavel icon in the left margin. The gavel says: "this is the slot that was judged, and it won."

If the dropped signal had lower priority than every buffer occupant, no row is highlighted as contested. Instead, a footer note reads: `No contestable slot — all occupants at NORMAL or higher priority. Incoming signal (LOW) could not displace any entry.` This teaches the priority eviction mechanic directly: the signal didn't just fail to fit — it was *outranked* by everything already present.

If the dropped signal had equal priority to the contested slot but lost the age tiebreaker (the occupant was newer), the contested row's highlight includes a small annotation: `Same priority (NORMAL). Tiebreaker: occupant age +3t < incoming age +7t. Newer signal retained.` This teaches the secondary eviction rule.

### The Ghost Entry

At the bottom of the slot table, below a thin dashed line, a single ghost row renders the dropped signal itself in the same columnar format but at 50% opacity with a red X overlaid. This is the "body on the slab" — the signal that didn't make it in. The ghost row's position below the table is deliberate: it never occupied a slot, so it is rendered *outside* the buffer, looking in.

The ghost row has one additional column not present in the occupied rows:

| Column | Content |
|--------|---------|
| **Would-Have-Displaced** | Arrow pointing to the contested slot row, or `NONE — outranked` |

### The What-If Footer

Below the ghost entry, a small interactive footer:

- **"What if this signal had arrived 1 tick earlier?"** — A link that scrubs the genealogy to tick N-1 and re-evaluates the buffer state. If the buffer had a free slot at that tick, the footer displays: `At tick [N-1], slot [X] was empty. Signal would have been received.` This teaches temporal sensitivity — the difference between a successful signal and a dropped signal can be a single tick.
- **"What if buffer had 1 more slot?"** — A hypothetical that adds a virtual 9th slot to the display, showing the signal successfully inserted. The virtual slot renders with a dashed green border — "this slot doesn't exist, but if it did, the signal would live here." This teaches the player to consider buffer capacity as a design lever.
- **"Add probe hook for next match"** — A one-click action (interaction with 4.15 and 4.67) that instruments the receiving agent with a probe hook triggered at this tick in the next match. The probe will capture the full buffer state, giving the player persistent data to compare across configuration changes.

---

## How It Teaches Causality

The Coroner's Slab enforces a causal chain that most players would otherwise skip:

1. **Effect observed:** Striker-B didn't engage the enemy. (Player notices during sealed watch.)
2. **Proximate cause:** Striker-B's rules never matched "IF ENEMY_POSITION THEN ENGAGE" because ENEMY_POSITION was not in the buffer. (Visible in the behavior tree inspector.)
3. **Root cause:** ENEMY_POSITION signal *was sent* but *was dropped* on arrival because the buffer was full of stale terrain observations. (Visible only in the Coroner's Slab.)
4. **Actionable fix:** Reduce terrain observation ingestion (configure perception filtering), increase buffer priority thresholds (make threat signals URGENT so they displace terrain), or increase Scout refresh rate so threat signals arrive when the buffer has room.

Without the Coroner's Slab, players typically stop at step 2 and conclude "my rules are wrong" or "the hook is broken." They edit rules that were fine, rewire hooks that were working, and the problem persists because the *buffer* was the bottleneck, not the logic. The Slab forces step 3 into visibility. The dropped signal's ghost row, sitting below the full buffer table with its red X, is an accusation: your logic was right, your network was right, your buffer was the killer.

This is the game's deepest expression of its core thesis: **attention is finite, and managing what gets attended to is the real challenge.** The Coroner's Slab puts a face on every victim of that finiteness.

---

## Player Journeys

#### Journey: Rosa, 24, Electrical Engineering Student

**Context:** Mission 9, "Blackout Corridor." Rosa's 4-agent squad must navigate a narrow corridor where relay range is limited. She has a Scout-A feeding threat data to Striker-B via a Relay-C intermediary. In the sealed watch, Striker-B walked straight into an ambush at tick 34 — it did not react to the three enemies waiting at the corridor exit. Rosa has entered Act 2 debrief and opened the signal genealogy.

**Minute 0:00 — The Broken Edge**
The signal genealogy renders as a directed graph overlaid on the battlefield. Rosa sees the familiar solid blue lines connecting Scout-A to Relay-C to Striker-B. But at tick 34, the line from Relay-C to Striker-B is not solid. It is a dashed grey line terminating in a small red X, three-quarters of the way to Striker-B's node. The X pulses once, slowly, like a dying heartbeat. Rosa has seen broken edges before in earlier missions but never investigated one. She hovers the broken edge. A tooltip: `Signal SIG-0347 (ENEMY_POSITION) from Relay-C dropped at Striker-B, tick 34. Click to inspect.`

She clicks.

**Minute 0:18 — The Slab Opens**
The Coroner's Slab slides in from the right. The animation takes 300ms — the panel emerges from behind the edge of the genealogy view like a drawer being pulled open. A soft mechanical sound, like a filing cabinet sliding on rails, accompanies it. The broken edge remains visible behind the panel's translucent left border, with a thin amber connector line running from the red X to the panel header.

The header reads: `SIG-0347 | Source: Relay-C | Channel: threat-net | Type: ENEMY_POSITION | Priority: NORMAL | Arrived: tick 34`. Below: `Receiving: Striker-B | Class: Striker | Buffer: 8/8 slots occupied`. The verdict line glows amber: `DROPPED: buffer full. Contested slot 0 (TERRAIN, +11t, LOW) — but eviction policy is FIFO, and slot 0 age (+11t) > incoming age (+2t). Incoming signal lost age tiebreaker under current policy.`

Rosa reads the verdict twice. She does not understand it yet. She looks down at the slot table.

**Minute 0:45 — Reading the Buffer**
Eight rows. Eight occupied slots. Rosa scans the Type column:

| Slot | Type | Priority | Age |
|------|------|----------|-----|
| 0 | TERRAIN | LOW | +11t |
| 1 | TERRAIN | LOW | +9t |
| 2 | TERRAIN | LOW | +8t |
| 3 | FRIENDLY_POS | LOW | +7t |
| 4 | TERRAIN | LOW | +6t |
| 5 | TERRAIN | LOW | +5t |
| 6 | AMBIENT_NOISE | LOW | +4t |
| 7 | FRIENDLY_POS | LOW | +2t |

Every single slot is LOW priority. Every single signal is either terrain observations or friendly position pings. Not a single threat signal in the entire buffer. Rosa's face changes. The dropped signal — ENEMY_POSITION, priority NORMAL — should have displaced any of these. She looks at the contested slot row: slot 0 is highlighted with the amber gavel. The annotation reads: `Eviction policy: FIFO. Slot 0 is oldest (+11t). Under current policy, FIFO does not consider priority — only age. Incoming signal age (+2t) is newer than slot 0 occupant (+11t), but FIFO evicts oldest-first on overflow, not on demand. Buffer was already full when signal arrived; no overflow eviction triggered because insertion order placed ENEMY_POSITION after the buffer was saturated.`

Below the table, the ghost row: `SIG-0347 | Relay-C | ENEMY_POSITION | NORMAL | +2t | threat-net` in faded red, with the red X. The "Would-Have-Displaced" column reads: `Slot 0 (TERRAIN, +11t) — if priority-aware eviction were configured.`

*Rosa's internal monologue: "The buffer is full of garbage. Eleven-tick-old terrain data. And my threat alert couldn't get in because FIFO doesn't care about priority. It just cares about order. I need priority-aware eviction — or I need to stop listening to terrain observations entirely."*

**Minute 1:30 — The What-If**
She clicks "What if this signal had arrived 1 tick earlier?" The genealogy scrubs to tick 33. The panel recalculates: `At tick 33, slot 7 was empty. Signal SIG-0347 would have been received in slot 7.` A green checkmark appears on the ghost row — the signal is alive in this hypothetical. The difference between ambush and engagement was one tick of arrival time.

She clicks "What if buffer had 1 more slot?" A virtual 9th row appears at the bottom of the slot table with a dashed green border: `SIG-0347 | Relay-C | ENEMY_POSITION | NORMAL | +2t | threat-net`. The signal lives. But Rosa knows Striker-B's buffer is fixed at 8 — this is a what-if, not a solution.

She clicks "Add probe hook for next match." A small confirmation badge appears: `Probe hook added: Striker-B @ tick 34 trigger. Will capture full buffer state in next match debrief.`

**Minute 2:15 — The Fix**
Rosa exits the Coroner's Slab and opens Striker-B's configuration in the workbench. She sees the problem clearly now: Striker-B is listening on `terrain-net` and `status-net` in addition to `threat-net`. Terrain observations and friendly position pings are flooding the buffer. She unchecks `terrain-net` and `status-net` — Striker-B will now only receive signals on `threat-net`. She re-runs the battle. At tick 34, the signal arrives, the buffer has room, and Striker-B engages the ambush before it springs.

**UI Annotations:**
- **Broken edge tooltip:** Appears on hover over any dashed/X-terminated edge in genealogy. 200ms delay. Shows signal ID, source, type, and drop reason in one line. Click to open Coroner's Slab.
- **Amber connector line:** 1px line from the red X to the panel's left border. Animates on panel open — draws from X to panel over 200ms, like a thread being pulled taut. Fades if the player scrolls the genealogy.
- **Ghost row red X:** 16px vector X, rendered in `#e85d4a` (the game's error red), centered over the ghost row. Pulses slowly (2-second cycle, 70%-100% opacity) to draw the eye downward after reading the slot table.

---

#### Journey: Danilo, 31, DevOps Engineer

**Context:** Mission 14, "Signal Flood." Danilo has built an aggressive relay architecture — three Relay agents forming a mesh network. Every agent listens on every channel. His Command agent has a 14-slot buffer but is still dropping signals. He has already opened the behavior tree inspector and confirmed that Command's rules are correct. The rules reference signals that should be in the buffer but aren't. He opens the signal genealogy and sees a cluster of broken edges — five of them, all terminating at Command between ticks 40-45.

**Minute 0:00 — The Cluster of Corpses**
Five broken edges, five red X marks, clustered around Command's node in the genealogy graph like bullet holes. Danilo has never seen this many drops on a single agent. He clicks the first one: tick 40, signal from Relay-A, type `COMPRESSED_INTEL`, priority NORMAL.

**Minute 0:12 — Slot Table at Scale**
The Coroner's Slab opens. Fourteen rows. Command's full 14-slot buffer. Danilo scans the source column: Relay-A, Relay-B, Relay-C, Relay-A, Relay-B, Relay-C, Relay-A... all three relays are feeding Command constantly. The type column: `COMPRESSED_INTEL`, `COMPRESSED_INTEL`, `COMPRESSED_INTEL`, `ENEMY_POSITION`, `COMPRESSED_INTEL`... twelve of the fourteen slots are `COMPRESSED_INTEL` — compressed signals from the relay mesh. The relay mesh is so efficient at forwarding that it is drowning Command in compressed intelligence packages.

The contested slot (slot 0) is a `COMPRESSED_INTEL` from Relay-B, age +6t, priority NORMAL. The dropped signal is also `COMPRESSED_INTEL`, priority NORMAL, age +1t. The verdict: `DROPPED: buffer full. Incoming signal (NORMAL, +1t) could not displace slot 0 (NORMAL, +6t) under FIFO. Same priority; FIFO retains older entries.`

*Danilo: "My relay mesh is too good. It's generating more compressed intel than Command can consume. Fourteen slots and they're all full of relay output. This is a throughput problem — I need Command to process and discard faster, or I need the relays to throttle."*

**Minute 0:45 — Clicking Through the Cluster**
He closes the first Slab and clicks the second broken edge: tick 41, Relay-C, `ENEMY_POSITION`, priority URGENT. This one is different. The slot table shows the same 14 compressed intel entries — but this signal is URGENT, not NORMAL. The contested slot is slot 0, priority NORMAL. The verdict: `DROPPED: buffer full. Incoming signal (URGENT, +0t) had higher priority than slot 0 (NORMAL, +6t), BUT eviction policy is FIFO — priority not consulted. URGENT signal treated as NORMAL under current eviction configuration.`

Danilo stares at the verdict. The signal was URGENT. It should have displaced a NORMAL entry. But his eviction policy is FIFO — it doesn't check priority. An URGENT threat alert died because the eviction policy was too simple.

**Minute 1:20 — The Priority Revelation**
He clicks "What if buffer had 1 more slot?" The ENEMY_POSITION signal appears in virtual slot 14 — green border, alive. But that's not the real fix. He needs priority-aware eviction, not a bigger buffer. He opens Command's configuration. Under eviction policy, he switches from FIFO to PRIORITY_THEN_AGE. Under this policy, when the buffer is full and an URGENT signal arrives, the lowest-priority, oldest signal is evicted first. He re-runs.

The five broken edges at Command become two. The URGENT signals now displace LOW entries. The NORMAL signals still contend with each other. Danilo has halved his drop rate with a one-setting change — a change he would never have found without the Coroner's Slab showing him that priority was being ignored.

**Minute 2:30 — The Remaining Drops**
He clicks one of the two remaining broken edges. The Slab shows all 14 slots at NORMAL priority — the URGENT signals claimed slots, but the buffer is still full of NORMAL compressed intel. The dropped signal is also NORMAL. No priority advantage. Danilo realizes the remaining drops require a structural fix: he needs to reduce relay output volume, add a COMPRESS cooldown, or filter which channels Command listens to. He opens the relay configurations and adds a 2-tick cooldown to the COMPRESS skill on all three relays, reducing their output rate by half. Re-run: zero broken edges at Command.

**UI Annotations:**
- **Broken-edge cluster detection:** When 3+ broken edges terminate at the same agent within a 5-tick window, the genealogy groups them with a faint red halo around the agent's node. Hovering the halo: `5 signals dropped at Command, ticks 40-45. Click any to inspect.`
- **Verdict line priority callout:** When the dropped signal's priority is higher than the contested slot but eviction policy ignores priority, the verdict renders the word "BUT" in bright amber with a small warning triangle. This is the Slab's most important teaching annotation — it says "your policy left performance on the table."
- **Sequential Slab navigation:** When multiple broken edges exist at the same agent, small left/right arrows appear in the Slab header. Click to cycle through drops without closing and reopening the panel. The header updates; the slot table re-renders with a 150ms crossfade.

---

#### Journey: Maricel, 38, High School CS Teacher, First Encounter with the Slab

**Context:** Mission 7, "The Relay Chain." Maricel's squad has a simple architecture: Scout-A observes, sends to Relay-B, Relay-B forwards to Striker-C. This is the first mission where signal dropping is mechanically possible — previous missions had oversized buffers that never filled. The mission briefing mentioned "buffer capacity constraints" but Maricel skimmed it. Striker-C failed to engage at tick 22, and she has no idea why.

**Minute 0:00 — Finding the Broken Edge**
Maricel opens the signal genealogy for the first time. She sees the three-node graph: Scout-A arrow Relay-B arrow Striker-C. Solid blue lines. She scrubs the timeline. At tick 22, the line from Relay-B to Striker-C changes. It was solid at tick 21. At tick 22, it becomes dashed with a red X. Maricel pauses. She has not seen this before.

She hovers the dashed line. Tooltip: `Signal SIG-0189 (ENEMY_POSITION) from Relay-B dropped at Striker-C, tick 22. Click to inspect.` The word "dropped" is unfamiliar in this context. She clicks.

**Minute 0:15 — First Impressions of the Slab**
The panel slides open. Maricel sees the header — she reads the verdict line first, because it is amber and monospace and draws the eye: `DROPPED: buffer full. All 8 slots occupied. Lowest-priority slot (slot 0, TERRAIN, LOW, +14t) could not be evicted under FIFO — eviction occurs only on overflow insertion, and insertion order was exhausted.`

She does not fully parse this. She looks at the slot table. Eight rows. She reads them top to bottom like a spreadsheet. Slot 0: TERRAIN, LOW, +14t. Slot 1: TERRAIN, LOW, +12t. Slot 2: TERRAIN, LOW, +10t. She notices the pattern — all terrain, all LOW, all old. Ages counting down: +14, +12, +10, +9, +8, +6, +5, +3. She scrolls to the ghost row at the bottom. ENEMY_POSITION, NORMAL, +1t. A freshly created threat signal, one tick old, sitting dead below a buffer full of ancient terrain data.

*Maricel: "Oh. The buffer was full of old stuff and the important signal couldn't get in. That's... that's like when students' working memory is full of distracting thoughts and they can't absorb new information."*

The pedagogical metaphor lands. The buffer-as-attention-span analogy, which the game has been building since mission 1, crystallizes in this moment. Maricel understands not just the mechanic but the *metaphor*. Buffer-full silence is not a bug — it is the game's central lesson about how attention systems fail.

**Minute 1:00 — Exploring the What-Ifs**
She clicks "What if this signal had arrived 1 tick earlier?" The panel recalculates. `At tick 21, slot 7 was occupied by TERRAIN (+2t). Buffer was 8/8. Signal would also have been dropped.` She clicks again. Tick 20: also full, also dropped. Tick 19: also full. She keeps clicking backward. Tick 15: `Slot 6 was empty. Signal would have been received in slot 6.` Between tick 15 and tick 22, the buffer was continuously full. Seven ticks of saturation.

She clicks "What if buffer had 1 more slot?" The virtual 9th slot appears. ENEMY_POSITION lives. But the real insight is upstream: why is the buffer full of terrain data?

**Minute 1:45 — The Upstream Investigation**
Maricel closes the Slab and examines Striker-C's configuration. She sees: Striker-C listens on `terrain-net`, `status-net`, and `threat-net`. The terrain observations from Striker-C's own perception are filling the buffer every tick — Striker-C has a perception radius of 3 tiles and generates 4-5 terrain observations per tick. These self-generated observations are consuming all 8 slots before any relayed signals can arrive.

She opens the channel configuration and unchecks `terrain-net`. She also reduces Striker-C's active perception channels — the Striker doesn't need to observe terrain, it needs to receive threat data from the Scout via Relay. She re-runs. Tick 22: the signal arrives, the buffer has room, Striker-C engages.

**Minute 2:30 — The Ah-Ha Return**
Maricel re-opens the Coroner's Slab on the original replay (it persists in the debrief history). She looks at the slot table again, now understanding what she's seeing. Eight terrain observations, ages +14 to +3. Her Striker was blind to the world because it was staring at the ground. She screenshots the slot table — she plans to use it in her CS class to teach about context window limitations in LLMs. The game's metaphor has become her teaching tool.

**UI Annotations:**
- **First-encounter tooltip:** On the player's first broken edge hover (tracked by a session flag), the tooltip includes an additional line: `Signals can be dropped when an agent's buffer is full. Inspect to see why.` This line does not appear on subsequent hovers — it teaches once and then gets out of the way.
- **Backward scrub in What-If:** The "1 tick earlier" button is a repeatable action — each click steps back one tick and re-evaluates. The panel tracks the sequence and shows a small timeline strip: `Tick 22: DROPPED | Tick 21: DROPPED | Tick 20: DROPPED | ... | Tick 15: RECEIVED`. The strip renders as a horizontal bar of red and green pips, giving the player a visual sense of how long the buffer has been saturated.
- **Screenshot affordance:** A small camera icon in the Slab header. Click to save the current panel state as a PNG to the player's clipboard/screenshot folder. The screenshot includes the header, slot table, ghost row, and verdict — a self-contained forensic report.

---

## Strengths

**Maximum diagnostic resolution.** No other tool in the game shows individual buffer slot contents at a specific tick. The behavior tree inspector shows rule evaluation; the buffer bar shows utilization rate; the signal genealogy shows network topology. The Coroner's Slab shows the actual data — signal IDs, ages, priorities, sources — at the resolution of one slot, one tick, one drop event. For players debugging coordination failures, this is the tool that ends the investigation.

**Teaches the causal chain explicitly.** The verdict line, the contested slot highlight, the ghost row — every element of the Slab is designed to make the causal chain visible: signal arrived, buffer was full, eviction was attempted, eviction failed, signal died. Players cannot misattribute the failure to rules or hooks when the Slab is showing them that the signal never entered the buffer. The attribution is forced: the buffer is the bottleneck.

**Natural entry point into advanced mechanics.** The Slab's verdict line often reveals that the player's eviction policy is suboptimal — "FIFO does not consider priority" — which naturally leads the player to explore priority-aware eviction (2.26), configurable eviction policies (2.06), and buffer partitioning. The Slab is a diagnostic tool that doubles as a feature-discovery mechanism: it shows the player what their current configuration cannot do, motivating them to learn what alternative configurations can.

**The What-If footer bridges diagnosis and action.** Most diagnostic tools are pure observation. The Slab includes three actionable exits: temporal scrub, hypothetical buffer expansion, and probe hook placement. Each exit converts a diagnostic finding into a next step — reducing the gap between "I understand the problem" and "I know what to try."

**Scales across unit types.** The slot table renders correctly for 6-slot Scouts, 8-slot Strikers, 12-slot Relays, and 14-slot Command agents. The layout is parametric — it does not assume a fixed slot count. This means the Slab works for every unit in the game, including any future unit types with different buffer sizes.

---

## Weaknesses and Tradeoffs

**Information density may overwhelm beginners.** The Slab shows 8-14 rows of detailed signal metadata. Players encountering it for the first time (Maricel's journey) must parse signal IDs, source agents, types, priorities, ages, and channels simultaneously. This is a lot of new vocabulary in one panel. Some players will close the Slab immediately and revert to trial-and-error debugging.

**Mitigation:** The verdict line at the top summarizes the finding in plain language. Players who read only the verdict still learn the core lesson ("buffer full, signal dropped"). The slot table is additional detail for players who want it. The first-encounter tooltip primes the player with a one-sentence explanation before they open the Slab.

**Only accessible from broken edges.** The Slab requires a broken edge in the genealogy graph. If a player suspects buffer pressure but no signals were dropped (the buffer is full but all signals happened to arrive when a slot was free), the Slab cannot be opened. The buffer state visualization (4.16 / 4.03) covers this case, but the Slab's forensic detail is only available at drop events.

**Mitigation:** The buffer state panel (4.03) provides a less granular but always-available view of buffer contents. The Slab is the specialist tool; the buffer panel is the generalist tool. Together they cover the full diagnostic spectrum.

**The "What if buffer had 1 more slot?" hypothetical can mislead.** Players might conclude that the fix is always "bigger buffer" when the real fix is often "fewer incoming signals" or "better eviction policy." The hypothetical shows that a larger buffer would have helped *in this specific instance* but does not account for cascading effects (a larger buffer might just delay the drop by one tick, not prevent it).

**Mitigation:** The hypothetical virtual slot renders with a dashed border and a small annotation: `Hypothetical only. Actual buffer size is fixed at [N] for [unit class].` This frames it as a thought experiment, not a recommendation.

**Requires the signal genealogy to be open.** The Slab is a sub-panel of the genealogy view, not accessible from the buffer state panel or the behavior tree inspector. A player who is debugging in the BT inspector and discovers that a signal is missing from the buffer cannot jump directly to the Slab — they must switch to the genealogy view, find the broken edge, and click it. This is a two-step navigation where one step would be ideal.

**Mitigation:** Buffer query octagon nodes in the BT inspector (3.08d) that reference signals not present in the buffer could show a small "dropped?" link. Clicking the link switches to the genealogy view and auto-opens the Slab for the corresponding broken edge, if one exists.

---

## Interaction Effects

**Signal genealogy (4.16).** The Slab is a child of the genealogy. The genealogy shows the network graph; the Slab shows the forensic detail of one edge in that graph. The interaction is strictly hierarchical: genealogy provides the spatial context (which agents, which signals, which tick), the Slab provides the slot-level detail. The broken-edge cluster detection (halo around agents with multiple drops) is a genealogy-level feature that directs players toward the Slab. The Slab's sequential navigation arrows (left/right to cycle through drops) keep the player in the Slab once they've entered, avoiding the need to return to the genealogy for each drop.

**Buffer state visualization (4.03 / 4.16).** The Slab's slot table is a frozen snapshot of the buffer at one tick. The buffer state panel (4.03) shows the buffer's evolution over time via timeline scrubbing. The two views are complementary: the buffer panel shows "what was in the buffer across the battle," the Slab shows "what was in the buffer at the exact moment this signal died." Clicking a slot in the Slab could highlight that slot in the buffer panel's timeline, showing when the occupying signal entered and how long it survived before being evicted itself.

**Probe hooks (4.15).** The Slab's "Add probe hook" footer action converts a retrospective finding into a prospective instrument. This is a key interaction: the player discovers a drop in the current debrief, places a probe hook, runs the next match with the probe active, and returns to the debrief with a persistent buffer snapshot at the same tick. The probe data can then be compared with the new match's buffer state — did the configuration change fix the drop? The Slab becomes the starting point of a diagnostic cycle: discover drop, instrument, re-run, verify.

**Behavior tree inspector (3.08d).** The BT inspector shows rule evaluation; the Slab shows buffer contents. When a rule's condition references a signal type not in the buffer (e.g., `BUFFER_HAS(ENEMY_POSITION)` evaluates false), the BT inspector shows the condition as red. The Slab explains *why* it's red — the signal was dropped. A bidirectional link between the BT inspector's red condition node and the Slab's ghost row would close the diagnostic loop: "this condition failed because this signal was dropped because the buffer was full of these entries."

**Priority system (2.26).** The Slab's verdict line explicitly names the priority comparison that determined the drop. When the dropped signal is URGENT and the buffer contains only LOW entries but the eviction policy ignores priority, the verdict is a direct teaching moment for the priority system: "your priority tags exist but your eviction policy doesn't use them." This interaction drives adoption of priority-aware eviction — a mechanic that might otherwise go unnoticed until much later in the campaign.

**Counterfactual simulation (4.20).** After opening the Slab and understanding a drop, the player could branch into a counterfactual fork: "what if I had configured priority-aware eviction?" The counterfactual simulation would re-run the battle with the changed eviction policy, and the player could then open the Slab at the same tick in the forked timeline to see whether the signal survived. The Slab in the forked timeline would show the signal successfully inserted — the slot table with the threat signal present and the oldest terrain observation evicted. Comparing the two Slabs (original: dropped; fork: received) is a before-after diagnostic that validates the fix without a full re-run.

---

## Comparable Games and Media

**Wireshark packet inspector.** The closest real-world analog. Wireshark captures network traffic and lets users click any packet to see its full structure — headers, payload, flags, checksums. The Coroner's Slab is Wireshark for signal drops: click a broken edge (a dropped packet), see the buffer state (the receiving interface's queue), understand why the packet was rejected (buffer full, priority too low). The key difference: Wireshark is a professional tool requiring networking knowledge; the Slab must be readable by a player who has never debugged a network.

**Git merge conflict viewer.** A merge conflict shows two versions of a file side by side, with the conflict zone highlighted. The Slab shows the buffer (the "current version") and the dropped signal (the "incoming version") with the contested slot (the "conflict zone") highlighted. The player must resolve the conflict by changing the configuration — the same mental model as resolving a merge conflict by editing the file.

**Factorio logistics network alerts.** When a logistics network drops items because buffer chests are full, Factorio shows a small alert icon on the chest and a count of dropped items. The Slab is a much deeper version of this: not just "items were dropped" but "here is every item in the chest, and here is the item that couldn't fit, and here is which item would have been displaced." Factorio's alert is a notification; the Slab is a forensic report.

**Chrome DevTools Network tab — failed requests.** When a network request fails in Chrome DevTools, clicking it shows headers, response body (if any), and error reason. The Slab follows the same pattern: clicking a failed signal delivery shows metadata, buffer contents, and eviction reason. The DevTools model of "click the red row to see why it failed" translates directly to "click the broken edge to see why it was dropped."

**Medical autopsy reports.** The naming is deliberate. An autopsy determines cause of death by examining the body in context — all organs present, the specific organ that failed, the mechanism of failure. The Slab examines the buffer in context — all slots present, the specific slot that was contested, the eviction mechanism that rejected the incoming signal. The "Coroner's Slab" name reinforces this metaphor and gives the tool a memorable identity that players will reference in discussions: "I opened the Slab on that drop and found out the buffer was full of noise."

---

## Sensory Description

### Opening the Slab

The player clicks a broken edge. The red X on the broken edge brightens from its slow pulse to a full-intensity flare — `#e85d4a` at 100% for 200ms. Simultaneously, a horizontal line begins drawing itself from the X toward the right edge of the screen, rendered in amber (`#d4a853`), 1px thick, animated over 250ms. The line reaches the right edge and the Coroner's Slab panel slides in from behind it — the panel emerges over 300ms with a subtle deceleration curve (ease-out-cubic), as though pulled by the amber thread.

The sound: a low mechanical slide, like a steel drawer on precision bearings. Two octaves below the UI's standard click sounds. Duration: 300ms, matching the slide animation. The sound has a faint metallic resonance at the end — the drawer reaching its stop.

### The Slot Table

The table renders row by row, top to bottom, with a 40ms stagger per row. Each row fades in from 0% to 100% opacity. For an 8-slot Striker buffer, the full table is visible in 320ms. For a 14-slot Command buffer, 560ms.

Each row's background is the game's standard dark surface (`#1e1e32`) with a 1px bottom border in faint indigo (`#2a2a4e`). The slot number is rendered in dim monospace (`#6e6e8a`), left-aligned. The signal type icon is a small 16px sprite — colored by signal category: green for observation, blue for received message, amber for processed signal. The priority pip is a 6px circle: red for URGENT, white for NORMAL, dim grey for LOW. The age column renders in monospace with the `+Nt` format, where the number's color shifts from white (recent, +0t to +3t) through amber (+4t to +8t) to dim red (+9t and above). This color gradient teaches signal freshness at a glance — old signals are visually decaying.

### The Contested Slot

The contested slot row has a 2px amber border (`#d4a853`) on all four sides, pulsing slowly (1.5-second cycle, 60%-100% opacity). The amber gavel icon sits in the row's left margin — a 14px icon depicting a small gavel, rendered in amber with a slight glow. The gavel does not animate; it is static, judicial, final. On hover, the gavel tooltip reads: `This slot was evaluated for eviction. It survived.`

If the contested slot's occupant has a lower priority than the dropped signal but survived due to the eviction policy ignoring priority, the gavel icon gains a small amber exclamation mark: a 6px triangle with a `!` rendered to its upper right. This micro-annotation says "something unusual happened here" — the expected eviction did not occur.

### The Ghost Row

Below the table, separated by a 1px dashed line (`#3a3a5e`), the ghost row renders at 50% opacity. The signal type icon is desaturated. The text is rendered in the game's muted error color (`#e85d4a` at 50% opacity — effectively a dim salmon). The red X is centered over the row, 16px, fully opaque — the one element at full intensity in the ghost row. The X rotates 0 degrees — it does not animate. It is still. The signal is dead; stillness communicates finality.

A faint dotted line connects the ghost row's "Would-Have-Displaced" arrow to the contested slot row above, drawn in the same dim salmon. The arrow is a small 8px chevron pointing upward. This visual thread says: "this signal tried to take that slot and failed."

### The What-If Footer

The three interactive links render below the ghost row in the game's standard link style: underlined text in cyan (`#5ec4d4`), 12px. On hover, the underline thickens from 1px to 2px and the text brightens to white. On click, a small loading spinner (4 frames, 200ms total) appears to the right of the link while the genealogy scrubs or the hypothetical calculates. The results appear inline, below the link, in a small text block with a left border in green (for "would have been received") or red (for "still dropped").

### Closing the Slab

Click the X in the panel header, or click anywhere on the genealogy graph outside the panel. The panel slides right over 250ms (ease-in-cubic — accelerating away, the inverse of its opening deceleration). The amber connector line retracts from the panel edge back to the broken-edge X over 200ms. The X returns to its slow pulse. The sound: the mechanical slide in reverse, slightly faster, with a soft click at the end — the drawer closing.

---

## New Aspects Discovered

- **4.106 — Cumulative drop heatmap overlay on genealogy:** A toggle that colors every edge in the signal genealogy by total drop count across the full battle. High-drop edges render in deep red; zero-drop edges render in solid blue. The heatmap shows systemic bottlenecks — not just individual drops but persistent network chokepoints where signals consistently die. Interaction with the Coroner's Slab: clicking a red-hot edge opens the Slab at the tick of the most recent drop, with a small timeline strip showing all drop ticks for that edge.

- **4.107 — Drop cascade visualization:** When a dropped signal at Agent A would have been relayed to Agent B, and Agent B's behavior depended on that signal, the genealogy could render a "cascade" — a branching tree of downstream effects originating from one drop. The cascade shows: "SIG-0347 was dropped at Striker-B. If received, Striker-B would have relayed to Command. Command's Rule 3 would have matched. Command would have sent a reroute signal to Striker-C." The cascade is hypothetical — it requires counterfactual evaluation — but it converts a single drop into a visible chain of consequences.

- **4.108 — Buffer pressure timeline in Slab:** A small sparkline chart in the Slab header showing the receiving agent's buffer utilization (occupied slots / total slots) across the last 20 ticks leading up to the drop. The sparkline shows whether the drop was a spike (buffer suddenly filled) or chronic (buffer has been full for many ticks). This temporal context helps the player distinguish between "one bad tick" and "persistent overload" without leaving the Slab.

---

*Aspect 4.105 fully documented. ~3,000 words. 3 full player journeys. 3 new aspects discovered.*
