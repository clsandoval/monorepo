# 4.16 — Signal Genealogy as Visualization: The Full Network Graph of Signal Propagation

**Aspect:** 4.16 — Signal genealogy as visualization: the full network graph of signal propagation across all agents for a given tick range; legibility at 5 vs. 15 agents; comparable: network traffic analyzers, dependency trees, call graphs in profilers.

**Related:** 4.04a — Debrief as debugger; 4.66 — Signal genealogy as pre-ranking source; 4.15 — Probe hooks; 4.20 — Counterfactual simulation; 4.04 — Debrief screen

---

## The Core Concept

The signal genealogy graph is the Inspector's "network traffic view" — a visualization that answers the question: **who talked to whom, when, carrying what, and did it arrive?** Every signal emitted by every agent during a match has a birth (hook fires), a journey (channel propagation, relay forwarding, potential compression), and a fate (delivered into a context window slot, evicted before processing, or dropped because the target was destroyed). The genealogy graph renders this entire communication history as an interactive network diagram.

This is not a simple line-between-two-nodes display. It is a temporal graph — the network's topology changes every tick. A scout that was broadcasting at tick 10 might be dead by tick 15. A relay that was idle at tick 20 might become the central routing hub at tick 25. The genealogy must show both the spatial relationships (who connects to whom) and the temporal evolution (how those connections change over the life of the match).

The design challenge is **legibility at scale.** Five agents produce a comprehensible web. Fifteen agents — the late-game factory-vs-factory scenario — produce a hairball. The visualization must degrade gracefully, providing both the zoomed-out "am I looking at a healthy network or a tangled mess?" gestalt and the zoomed-in "what exactly did RELAY-C receive at tick 52?" detail.

---

## Comparable Systems: What Exists in the Wild

### Wireshark Flow Graphs

Wireshark's Statistics > Flow Graph view is the closest direct analog. It renders packet flows as a sequence diagram: vertical columns represent hosts (IP addresses), and horizontal arrows between columns represent individual packets flowing from sender to receiver. Time runs top-to-bottom. Each arrow is labeled with protocol details and packet metadata.

**What translates:** The sender/receiver column layout with directional arrows maps cleanly to agents-as-columns and signals-as-arrows. Wireshark's "click any packet to highlight it in the main capture" pattern is exactly the click-to-inspect cross-linking the Inspector needs. The color-coding by protocol (TCP blue, UDP green, DNS yellow) maps to color-coding by channel name.

**What doesn't translate:** Wireshark handles hundreds of hosts and thousands of packets — its flow graph becomes an unreadable wall of arrows at scale. Robot Uprising has at most 15 agents and perhaps 200 signals in a 60-tick match, so the raw volume is manageable. But Wireshark's strictly linear time axis (top-to-bottom scroll) would force the player to scrub through a tall column — the game's tick scrubber on the board already handles temporal navigation better.

### D3 Force-Directed Graphs

Force-directed layouts from D3.js (and tools like Gephi and Cytoscape.js) render networks as physics simulations: nodes repel each other, edges act as springs, and the layout settles into a configuration where heavily-connected nodes cluster together and sparsely-connected nodes drift to the periphery. The result is an organic, readable layout for networks up to about 50 nodes.

**What translates:** The physics-based layout naturally reveals network structure — a relay with six connections pulls toward the center, an isolated scout drifts to the edge. This communicates "who is important in this network" without any explicit ranking. Hovering a node to highlight its edges (and dim everything else) is the standard interaction pattern and maps directly to agent selection.

**What doesn't translate:** Force-directed layouts are spatial but not temporal. They show the network at one moment, not how it evolves. The game needs both. Also, force-directed layouts are non-deterministic — the same data produces slightly different layouts each time, which undermines the player's spatial memory ("RELAY-C was in the upper-right last time I looked").

### Chrome DevTools Flame Charts

Chrome's Performance tab renders function execution as a flame chart: the x-axis is time, the y-axis is call depth. Wide bars represent long-running functions. Nested bars represent callees. The entire execution history is visible at a glance — you can see spikes (expensive operations), gaps (idle time), and nesting depth (call stack complexity).

**What translates:** The flame chart's ability to show both macro-structure (the overall shape of the execution) and micro-detail (clicking a bar to see the exact function name and duration) is the dual-scale legibility the genealogy needs. The color-coding by category (scripting = yellow, rendering = purple, painting = green) maps to channel color-coding. The summary panel at the bottom (click a bar, see its full details) maps to the signal detail tooltip.

**What doesn't translate:** Flame charts are inherently hierarchical (caller/callee), while signal networks are peer-to-peer (any agent can signal any other). The y-axis as call depth has no natural analog in a flat agent network. But the x-axis-as-time pattern is directly applicable.

### The Synthesis: "The Signal River"

The genealogy visualization combines elements from all three comparables:

- **From Wireshark:** Agents as persistent vertical columns, signals as directional arrows between them, color-coded by channel.
- **From D3 force graphs:** An alternate "topology view" mode where agents are positioned by connectivity density, with edge thickness encoding signal volume.
- **From flame charts:** A time axis that shows macro-structure at a glance, with click-to-zoom for micro-detail.

The primary view is nicknamed **"The Signal River"** — a horizontal timeline where agents are stacked as horizontal swim lanes (like Wireshark columns rotated 90 degrees), and signals flow left-to-right as colored arcs between lanes. Time runs left-to-right, matching the board's timeline scrubber. The river metaphor: signals are water, agents are riverbanks, channels are tributaries. A healthy network looks like a flowing river. A broken network looks like a dam — signals pile up on one side, nothing flows through.

---

## The Two Modes

### Mode 1: River View (Default)

**Layout:** The panel occupies the right sidebar of the Inspector (Zone B or Zone C, replacing or tabbing alongside the event log). Horizontal orientation. Time runs left-to-right, synced to the board's tick scrubber.

Each agent is a horizontal swim lane — a 24px-tall strip spanning the full width of the panel. Lanes are stacked vertically, ordered by unit type (scouts at top, relays in middle, strikers below, command at bottom), with a 2px gap between lanes. Each lane has the agent's icon and name at the left edge (e.g., the eye icon and "SCOUT-A"), rendered in the agent's team color.

Signals appear as curved arcs between lanes. An arc originates at the sender's lane at the tick it was emitted (x-position = tick number), curves upward or downward to reach the receiver's lane, and terminates at the tick it was received (1 tick later for direct, 2+ ticks for relayed). The arc's color matches the channel color — each channel is assigned a consistent hue from a palette (teal, coral, gold, lavender, lime, pink). The arc's opacity is 80% by default, fading to 20% for signals that were evicted before being processed (they "died in transit" visually). A small dot at the arc's termination point indicates fate: a solid circle (signal delivered and used in a decision), a hollow circle (delivered but not used), or a red X (dropped — target dead, buffer full, filtered out).

**The scrubber sync:** A vertical "playhead" line — thin, bright white, 1px — tracks the current tick position from the board's timeline scrubber. As the player scrubs ticks on the board, the playhead sweeps across the river view. Arcs that cross the playhead glow brighter — these are the signals "in flight" at the current tick. The playhead creates a cross-section of the network at any given moment.

**Zoom behavior:** Default zoom shows the entire match timeline (all ticks compressed to fit the panel width). Mouse wheel zooms in, expanding the x-axis so individual ticks are wider and arcs become more distinct. At maximum zoom, each tick occupies about 60px of horizontal space, and individual signal labels become readable (truncated payload text appears along the arc). Double-clicking an arc zooms to fit its source and destination ticks in the panel.

**The density bar:** At the top of the river view, a thin (8px tall) heatmap strip shows signal density per tick — ticks with many simultaneous signals glow brighter (white-hot), quiet ticks are dim blue. This is the macro-structure at a glance: spikes indicate communication bursts (a scout detected something and triggered a chain), valleys indicate quiet periods (units patrolling, no contacts). The density bar is the "flame chart summary" — it tells the player where to look before they zoom in.

### Mode 2: Topology View (Toggle)

A small toggle button in the panel header — an icon showing interconnected dots — switches from river view to topology view. The toggle animates: swim lanes collapse inward, agents rise from their lanes and settle into a force-directed layout (300ms transition). The topology view shows the network as a spatial graph:

**Layout:** Agents are circular nodes (32px diameter), positioned by a spring-physics simulation where agents with more signal connections pull closer together and agents with fewer connections drift apart. The layout is deterministic — seeded by unit type and spawn order, so the same match always produces the same topology. Edges between nodes represent channels, with edge thickness proportional to total signal volume on that channel during the selected tick range. Edge color matches channel color.

**Temporal control:** A small range slider at the bottom of the topology panel lets the player select a tick range (e.g., ticks 15-30). The topology recalculates to show only signals within that range. Dragging the range window left and right animates the topology — nodes drift closer or farther as their communication patterns change. This creates a "breathing" effect: the network contracts when agents are actively coordinating (many signals = strong springs pulling nodes together) and expands during quiet periods.

**Scale indicators:** Each node shows a tiny signal volume sparkline — a 24px-wide micro-chart showing the node's signal in/out volume over the match. A node that was a heavy communicator early but went silent later shows a sparkline that drops off. A node that ramped up communication mid-match shows a rising sparkline. At a glance, the player sees not just who connects to whom but how their communication patterns evolved.

---

## Legibility at Scale

### 5 Agents (Missions 1-4, Tutorial)

With five agents, both views are trivially readable:

**River view:** Five swim lanes, well-separated. Arcs between lanes are distinct — even with 50 signals over 30 ticks, there is abundant whitespace. Every arc is individually traceable from source to destination. The density bar shows clear spikes and valleys. No scrolling needed; the entire match fits in the panel.

**Topology view:** Five nodes arranged in a clean pentagon or diamond. Edges are clearly labeled. The force-directed layout converges instantly. The player can see the entire network structure at a glance — "SCOUT-A talks to RELAY-C, which forwards to STRIKER-A and STRIKER-B."

**Design note:** At this scale, the genealogy view risks being underwhelming — so few signals that the visualization looks empty. The solution: more generous spacing, larger arc curves, and animated signal "particles" that travel along arcs when the player scrubs through ticks. The particles give a sense of motion and life even when the data is sparse.

### 10 Agents (Missions 5-7, Factory Phase)

Ten agents is the transition zone where naive visualizations start to break:

**River view:** Ten swim lanes stack into about 240px of vertical space. Arcs between non-adjacent lanes (e.g., scout at lane 1 to striker at lane 8) create long curves that cross intermediate lanes. With 100+ signals, arcs begin to overlap. The solution is **channel filtering** — a small legend at the top of the panel shows all active channels with color swatches and toggle buttons. Clicking a channel name hides all arcs on that channel, letting the player isolate "show me only recon-net signals" or "show me only command-override signals." The filtered-out arcs fade to 5% opacity rather than disappearing completely, preserving the sense of overall density.

**Topology view:** Ten nodes produce a readable graph with the spring layout — the physics simulation naturally separates clusters. A group of scouts and their relay form one cluster; a command agent and its strikers form another. The topology reveals the network's modular structure — are the player's agents organized into functional groups, or is everything connected to everything in an unstructured mesh?

**Design note:** At ten agents, the "cluster glow" becomes useful. When the topology view detects that a group of 3+ nodes are all interconnected (a clique), it draws a subtle translucent background behind them — a soft colored blob (like a cloud). This makes functional groups immediately visible without requiring the player to trace individual edges.

### 15 Agents (Missions 8-10, Factory vs. Factory)

Fifteen agents with potentially 300+ signals over 60+ ticks is the hairball scenario. The naive river view becomes a thicket of overlapping arcs. The naive topology view becomes a tangled web. The visualization must not just degrade gracefully — it must actively help the player make sense of complexity.

**River view adaptations:**

- **Lane grouping:** Instead of 15 individual lanes, agents are grouped by unit type into collapsible lane groups. All scouts share a lane group (click to expand into individual lanes), all relays share a lane group, etc. Collapsed groups show aggregate signal volume as a shaded bar rather than individual arcs. The player expands only the groups they care about — "show me what the relays were doing" while scouts and strikers remain collapsed.

- **Signal bundling:** When multiple signals flow between the same two agents on the same channel within a 3-tick window, they are bundled into a single thick arc with a count badge ("x4"). This reduces visual clutter by 60-70% in dense matches. Clicking a bundled arc expands it into individual arcs (with a smooth fan-out animation — the thick arc splits into thin strands).

- **Heat lanes:** Each lane background shifts from dark (#0A1A2A) to warm amber based on the agent's signal activity density. An agent that received 40 signals glows warm; an agent that received 3 signals stays dark. At a glance across 15 lanes, the player sees "which lanes are hot" — a heat map embedded in the swim lanes.

**Topology view adaptations:**

- **Hierarchical clustering:** At 15 nodes, force-directed layout alone produces a readable graph but the edge count can obscure structure. The topology switches to a hierarchical layout when cluster detection finds clear groups: cluster nodes into bubbles (with labels like "Recon Cluster" and "Strike Cluster"), show inter-cluster edges as thick trunk lines, and allow clicking a cluster to expand it into its constituent nodes.

- **Edge opacity by recency:** In a 60-tick match, showing all edges simultaneously creates a hairball. Edges fade based on temporal distance from the currently selected tick range — edges from recent ticks are bright, edges from distant ticks are nearly invisible. The player scrubs the range selector and watches the network "light up" and "dim" as communication patterns shift over time.

- **The "Backbone" filter:** A single toggle that shows only the top 30% of edges by signal volume, hiding low-traffic connections. This reveals the network's backbone — the primary communication pathways — without the noise of one-off signals. The toggle is labeled "Show backbone only" and uses a thicker, brighter rendering for surviving edges.

---

## Signal Detail: What You See When You Click

Clicking any arc (river view) or edge (topology view) opens a signal detail popover — a floating panel (280px wide, variable height) anchored to the arc/edge. The popover shows:

- **Signal ID:** A short hash (e.g., "S-047") for reference
- **Channel:** Name and color swatch (e.g., "recon-net" with a teal dot)
- **Source:** Agent icon + name + "at tick 23" (clickable — switches inspector to source agent at that tick)
- **Destination:** Agent icon + name + "received tick 24" (clickable — switches inspector to destination agent at tick 24)
- **Payload:** The actual signal content — the observation, threat report, or command that was transmitted. Rendered as the same format used in the context window slot view. For compressed signals (processed by a relay's compress skill), shows both the original and compressed versions with a "compressed by RELAY-C" annotation.
- **Fate:** One of three outcomes with an icon and explanation:
  - Solid green circle: "Delivered — entered slot 3 of STRIKER-A's context window"
  - Hollow gray circle: "Delivered but unused — present in context window but no rule evaluated it"
  - Red X: "Dropped — STRIKER-A's context window was full (evicted before processing)" or "Dropped — STRIKER-A was eliminated at tick 22"
- **Chain ancestry:** If this signal was derived from an earlier signal (e.g., a relay received SCOUT-A's observation and forwarded a compressed version), the ancestry is shown as a mini tree: "Original: S-031 from SCOUT-A → Compressed: S-047 from RELAY-C → Destination: STRIKER-A." Each ancestor signal is clickable, navigating the genealogy view to show that signal's arc.

The chain ancestry is the "genealogy" in "signal genealogy" — the ability to trace a piece of information backward through every relay and transformation it passed through, from its original source (a scout's observation) to its final destination (a striker's decision input). This is the call stack of the signal world.

---

## Interaction with Other Inspector Tools

### Board Sync

When the player hovers over an arc in the river view, the corresponding signal is visualized on the board: a colored dashed line draws between the source and destination units at their positions during that tick. This mirrors the sealed watch's signal chain visualization but allows the player to explore any tick, not just the current one.

### Decision Trace Cross-Reference

The decision trace (in the unit inspector panel) shows "SLOT 4: SCOUT-A: threat@E5." This slot entry arrived via a signal. Clicking the slot reference in the decision trace highlights the corresponding arc in the genealogy view and scrolls/zooms the river to center on it. The reverse also works: clicking an arc that was delivered to a specific unit highlights the corresponding slot in that unit's context window view (if the unit inspector is showing that agent).

### Density Bar as Navigation

The density bar at the top of the river view is clickable. Clicking a spike in the density bar scrubs the board's timeline to that tick and zooms the river view to center on that tick. This lets the player rapidly navigate to "interesting moments" — communication bursts that likely correspond to battlefield events (enemy contact, signal chains firing, coordinated attacks).

---

## Strengths and Weaknesses

### Strengths

- **Root-cause tracing:** The genealogy graph is the only tool that shows the complete lifecycle of information — from observation to transmission to reception to decision. When the player asks "why didn't my striker react?", the genealogy shows the exact point where the information chain broke: the relay's buffer was full at tick 34, the warning signal was evicted at tick 35, and the striker never received it.

- **Architecture validation:** The topology view shows whether the player's intended communication architecture is actually working as designed. If the player built a hub-and-spoke network (all scouts report to one relay), the topology view should show a star pattern. If it shows a tangled mesh instead, something is misconfigured.

- **Temporal patterns:** The river view's density bar reveals communication rhythms — regular pulses (scouts reporting every N ticks), bursts (enemy contact triggering chains), and silences (agents stunned, destroyed, or out of range). These patterns are invisible in the unit-by-unit inspector but obvious in the aggregate view.

- **The 15-second TikTok clip:** A player scrubs through a match in the river view. Signals flow as colored arcs. A sudden burst of arcs — a cascade of recon signals — ripples from left to right across the lanes. Then a gap: a relay goes dark (destroyed). Downstream lanes go silent. The player watches information die in real-time. Cuts to the topology view: a node disappears, and the network fractures into two disconnected clusters. Cut to the player's face: realization.

### Weaknesses

- **Cognitive load at scale:** Even with bundling, filtering, and clustering, 15 agents with 300 signals is a lot of visual information. Players who don't understand the tool will see noise. The tool requires learning — it is not self-explanatory on first encounter.

- **Screen real estate competition:** The genealogy panel competes for space with the unit inspector, the decision trace, the event log, and the context window chart. On a 1920x1080 screen, something has to shrink or become a tab. The genealogy works best as a full-width panel, but the inspector also wants full width.

- **Temporal vs. spatial tension:** The river view excels at showing temporal patterns but obscures spatial relationships (which agents are physically near each other on the board). The topology view shows spatial relationships but compresses time into a range slider. Neither view shows both dimensions simultaneously.

---

## Interaction Effects

- **With debrief-as-debugger (4.04a):** The genealogy view is the Inspector's "network tab" — it completes the Chrome DevTools analogy. The debugger has a call stack (decision trace), a variable inspector (context window view), and now a network monitor (signal genealogy).

- **With pre-ranking transparency (4.58/4.66):** The cross-tool link from aspect 4.66 makes the genealogy discoverable — players find it by clicking "active at tick 52" in the pre-ranking drawer rather than hunting for a panel toggle.

- **With counterfactual simulation (4.20):** The genealogy can show a ghosted "what-if" overlay — a second set of arcs (drawn in a dotted style, lower opacity) showing how signals would have propagated if the player had made a different blueprint change. The original genealogy in solid arcs, the counterfactual in dotted arcs, side by side in the same river view.

- **With sealed watch (locked):** The sealed watch shows colored dashed lines for active signal chains during battle. The genealogy is the "recorded replay" version of those lines — persistent, scrubable, and annotated with payload and fate data that the sealed watch's real-time rendering cannot show.

---

## Sensory Description

### River View — Visual Language

The river view's background is deep ocean blue (#0A1A2A) — dark enough that colored arcs pop vividly. Swim lanes are separated by hairline borders (#1A3A5A, 1px) that create a subtle grid without competing with the signal arcs. Agent labels at the left edge glow in their team color — teal for player units, muted red for enemy units (if enemy signals are shown via a toggle).

Signal arcs use Bezier curves — they bulge outward from the sender's lane before curving to the receiver's lane, creating a ribbonlike flow. Arcs going "downward" (sender above receiver) curve right; arcs going "upward" curve left. This prevents arcs in opposite directions from overlapping. Each arc's stroke width is 2px for single signals, scaling up to 6px for bundled signals. The channel color palette is carefully chosen for distinctness on the dark background: teal (#4ECDC4), coral (#FF6B6B), gold (#FFD93D), lavender (#B8A9E8), lime (#A8E6CF), rose (#FFB3B3).

The playhead line is pure white (#FFFFFF) with a soft 4px glow (box-shadow), making it visible against all arc colors. As it sweeps across arcs, the arcs "light up" — their opacity jumps from 50% to 100% and a brief particle effect (a tiny dot of the arc's color) travels along the arc at the intersection point, giving a sense of "the signal is passing through right now."

The density bar at top uses a cool-to-warm gradient: deep blue (#0A1A2A) for zero signals, through teal, through amber, to white-hot (#FFFFFF) for maximum density. The bar has a subtle inner glow that makes high-density regions look like they are radiating heat.

### Topology View — Visual Language

The topology background matches the river view (#0A1A2A). Agent nodes are circular with a 2px bright border in the agent's team color and a darker filled interior. Nodes pulse gently (a 3-second breathing animation on the border opacity, 80% to 100% and back) to suggest liveness. Selected nodes pulse faster and brighter.

Edges are straight lines with slight transparency (70% opacity). Active edges (signals in flight during the selected tick range) are bright and full-width. Historical edges (signals from outside the selected range) are dim and thinner. When the player drags the range slider, edges fade in and out smoothly — the network "breathes" as communication patterns shift.

Cluster backgrounds (the translucent blobs behind closely-connected groups) use the dominant channel color of the group at 15% opacity — just enough to create a visual boundary without obscuring edges. Labels float above clusters in small uppercase monospace text ("RECON GROUP", "STRIKE GROUP").

### Audio Cues (Subtle)

- Hovering an arc produces a soft "ping" at a pitch corresponding to the channel — higher pitch for recon channels, lower pitch for command channels. A cascade of hovers across multiple arcs produces a melody that encodes the signal pattern.
- Switching from river to topology view: a soft "crystallize" sound — like ice forming — as lanes collapse into nodes.
- Clicking a signal detail popover: a short "data unpack" click, like a file opening.

---

## Player Journeys

### Journey 1: Maya, 16, High School Student, First Encounter

**Context:** Mission 3 (tutorial — hooks). Maya has 3 pre-placed units: SCOUT-A, RELAY-C, and STRIKER-A. She just watched a match where STRIKER-A failed to engage an enemy that walked right past it. She is frustrated and confused. She has used the unit inspector once before (Mission 2) but has never seen the genealogy view.

**Minute 0:00 — Entering the Inspector**

The sealed watch ends. The two-act debrief transitions to the Inspector. The board freezes at the final tick. Maya sees the familiar board on the left, the empty "Click any unit to inspect" prompt on the right. She clicks STRIKER-A.

The unit inspector fills in: context window slots (8 slots, only 2 occupied at the end), decision trace (last action: "patrol — no threats in context"), event log. Maya scrolls through the event log and notices something: almost no signals received. Just two entries across the entire match. She thinks: "Wait, the scout saw the enemy. Why didn't the striker get the message?"

**Minute 0:45 — Discovering the Genealogy Tab**

Above the event log, Maya notices a small tab bar she hadn't explored: "Inspector | Signals." (The genealogy view is introduced as a tab in Mission 3's post-match hint text — a small tooltip arrow pointing at the tab says "NEW: See how signals flowed between your units.") She clicks "Signals."

The panel transitions: the event log slides down and the river view slides up. Five swim lanes — but only three are populated (SCOUT-A, RELAY-C, STRIKER-A). The density bar at top shows two small spikes around ticks 8 and 15. A handful of teal arcs flow from SCOUT-A's lane to RELAY-C's lane. But between RELAY-C and STRIKER-A — nothing. A visible gap. The STRIKER-A lane is empty. A flat, dark strip.

Maya stares at the gap. The absence is louder than any data. "Nothing got through to the striker."

**Minute 1:15 — Tracing the Break**

Maya clicks one of the teal arcs from SCOUT-A to RELAY-C. The signal detail popover appears: "S-012 | Channel: recon-net | SCOUT-A at tick 8 → RELAY-C at tick 9. Payload: threat detected at E5. Fate: Delivered — entered slot 2 of RELAY-C's context window." So the relay received the scout's report. But nothing went onward.

Maya scrubs the board timeline to tick 9. The playhead sweeps across the river view. She sees the arc from SCOUT-A to RELAY-C light up as the playhead crosses it. But on RELAY-C's lane, nothing departs. She clicks RELAY-C on the board to switch the unit inspector to RELAY-C at tick 9.

The decision trace shows: "ACTION: idle — no hooks fired." Maya checks RELAY-C's hooks: it has a hook on channel "recon-net" (listen), but no hook configured to transmit on any channel. The relay was listening but had no outbound hook. It received the scout's report and did nothing with it. The information entered the relay and died there.

**Minute 2:00 — The Insight**

Maya's eyes widen. She switches back to the "Signals" tab and sees the picture clearly now: teal arcs flowing into RELAY-C, nothing flowing out. RELAY-C is a dead end. The genealogy view made the architectural failure visible as negative space — the absence of arcs where arcs should be.

She mentally notes: "I need to add an outbound hook to the relay — listen on recon-net, transmit on strike-net." She exits the Inspector and enters the Plan screen, already knowing exactly what to change.

**UI Annotations:**
- **Signals tab:** Small tab in the Inspector panel header, icon is three dots connected by lines, label "Signals." Introduced in Mission 3 with a tooltip highlight.
- **Empty swim lane:** STRIKER-A's lane is completely dark — no arcs, no activity dots. The contrast with SCOUT-A's populated lane creates an immediate visual "something is missing" signal.
- **Signal detail popover:** Anchored to the clicked arc with a small triangle pointer. 280px wide. Background #0F2030 with 1px #2A4A6A border. Closes on click-away or Escape.

---

### Journey 2: David, 29, Software Engineer, Mid-Campaign Diagnosis

**Context:** Mission 7 (command agent + production tuning). David has 11 units on the field: 3 scouts, 2 relays, 4 strikers, 1 specialist, and 1 command unit. He watched a match where his forces initially performed well but collapsed in the mid-game — strikers stopped responding to threats and stood idle while enemies flanked his base. He suspects a communication bottleneck but cannot identify where.

**Minute 0:00 — Opening the River View**

David goes straight to the Signals tab in the Inspector. The river view renders 11 swim lanes — scouts at the top (3 teal lanes), relays in the middle (2 lanes), strikers below (4 lanes), specialist and command at the bottom. The density bar at top tells a story immediately: a healthy plateau of activity from ticks 1-25, then a sharp spike at tick 26, then a rapid dropoff to near-zero by tick 30. The match ran 45 ticks. The last 15 ticks are almost silent.

David thinks: "Something happened at tick 26 that killed communication. Let me find out what."

**Minute 0:30 — Zooming into the Spike**

David clicks the spike in the density bar. The board scrubs to tick 26. The river view zooms in to show ticks 22-30 in detail. He sees a burst of coral-colored arcs (the "threat-alert" channel) flooding from all three scouts simultaneously — they all detected enemies entering their perception range at nearly the same time. The arcs converge on RELAY-A, which is receiving signals from all three scouts at once.

David counts the arcs landing on RELAY-A's lane at ticks 25-27: nine signals in three ticks. RELAY-A has a context window of 12 slots. He clicks RELAY-A's lane at tick 27 and checks the context window view — all 12 slots occupied, with the "pulsing amber" eviction indicator on 4 slots simultaneously. RELAY-A is at capacity.

**Minute 1:15 — The Cascade Failure**

David scrubs forward to tick 28. In the river view, he sees something critical: the arcs leaving RELAY-A (forwarding to strikers via the "strike-cmd" channel) thin out dramatically. At ticks 23-25, RELAY-A was forwarding 2-3 signals per tick. At tick 28, it forwards zero. He clicks the swim lane and sees the decision trace: "ACTION: idle — context overload (stunned for 1 tick)." RELAY-A's context window overflowed. It was stunned. For one tick, it forwarded nothing.

But that one tick mattered. David scrubs to tick 29 — RELAY-A recovers, but the damage is done. He switches to topology view and selects the tick range 28-35. The topology shows RELAY-A as a node with weakened edges — the signals it forwarded after recovery were stale (the original threat observations were 3-4 ticks old by the time they reached strikers). In the river view, he can see the arcs arriving at striker lanes marked with hollow circles — "delivered but unused" — because the threat data was too old for the strikers' rules to act on. (Their rules check "if threat report age < 2 ticks.")

David switches to topology view for the full match range. He sees the problem architecturally: RELAY-A is the only node connecting the scout cluster to the strike cluster. It is a single point of failure — a star topology where one overloaded node brings down the entire network. RELAY-B exists but is configured on a different channel, serving only the specialist. The topology view makes this painfully clear: RELAY-A has 7 edges; RELAY-B has 2.

**Minute 2:30 — Redesigning the Architecture**

David takes a mental screenshot of the topology view. He knows what to do: split the load. Route 2 scouts through RELAY-A and 1 scout through RELAY-B. Create a shared "strike-cmd" channel that both relays transmit on. Change the topology from a single star to a redundant mesh. He exits the Inspector, opens the Plan screen, and rewires the hooks.

Before executing, he mentally simulates: "With the load split, neither relay should exceed 6-7 signals in a burst. No overload, no stun, no cascade failure." He hits EXECUTE.

**UI Annotations:**
- **Density bar clickable spike:** The spike at tick 26 is rendered as a bright amber-white peak in the density bar. Clicking it is equivalent to clicking a tick in the timeline — the board scrubs and the river view centers on it.
- **Topology single-point-of-failure:** RELAY-A is visually pulled to the center of the topology by its many edges, while RELAY-B drifts to the periphery with its two thin edges. The asymmetry is immediately legible — one node is overloaded, the other is underutilized.
- **Stale signal indicators:** Arcs that arrive with age > 2 ticks have a dashed stroke pattern (instead of solid), visually encoding "this information is old." Paired with the hollow-circle "unused" fate marker, the player sees both that the signal arrived late and that it was ignored.

---

### Journey 3: Reina, 34, Data Analyst, Late-Game System Architect

**Context:** Mission 9 (factory vs. factory). Reina has 15 units — the maximum complexity scenario. She just watched a grueling 72-tick match that she won, but barely. She wants to understand why her network was resilient in the early game but degraded in the late game when she lost 2 relays. She is an expert player who has used the genealogy view extensively.

**Minute 0:00 — Full River View with Filters**

Reina opens the Signals tab. Fifteen swim lanes fill the panel. With 72 ticks and approximately 280 signals, the river view at default zoom is dense — a thick weave of colored arcs. But Reina knows how to read it. She first checks the density bar: steady activity from ticks 1-40, a spike at tick 41-43 (a major engagement), a dip at tick 44-48 (she lost RELAY-A and RELAY-B in the engagement), then erratic, sparse activity from tick 49-72.

She clicks the channel filter legend and deselects all channels except "recon-net" — the scout-to-relay reporting channel. The river view simplifies dramatically: only teal arcs remain. She can now see the recon network in isolation.

**Minute 0:30 — Comparing Before and After**

Reina selects the tick range 10-40 in the density bar (click and drag to set a range). The river view highlights arcs within this range and dims everything else. She sees a healthy pattern: three scout lanes sending regular teal arcs to two relay lanes, spaced every 3-4 ticks. Even distribution. The density bar shows a steady heartbeat pattern — peaks at regular intervals as scouts report.

She drags the range to ticks 44-72. The pattern transforms. Two relay lanes are now dark — labeled with red "ELIMINATED T43" and "ELIMINATED T44" markers. The remaining teal arcs from scouts have nowhere to go. Some arcs terminate in red X marks (relay destroyed, signal dropped). A few arcs redirect to the command unit's lane (the command unit had a fallback "recon-net" listener), but the command unit's lane is already busy with command-channel traffic. She sees amber eviction warnings stacking up on the command unit's lane.

Reina nods — she can see the failure mode. When the relays died, the scouts' reports flooded the command unit, competing with its command-channel traffic for context window space. The recon data was lower priority than command data, so it was evicted first. The command unit kept issuing orders but had no battlefield awareness to base them on. "Blind command" — orders without intelligence.

**Minute 1:30 — Topology Evolution**

Reina switches to topology view and uses the range slider to animate the network. She drags slowly from tick 1 to tick 72 and watches the topology breathe:

- Ticks 1-15: A clean two-cluster topology. Recon cluster (scouts + relays) on the left, strike cluster (strikers + command) on the right. Two thick edges connect the clusters (RELAY-A and RELAY-B bridging recon to command).
- Ticks 16-40: The clusters tighten as communication volume increases. RELAY-A and RELAY-B pull toward the center, becoming bridge nodes. The topology looks healthy — two bridge nodes provide redundancy.
- Ticks 41-43: The engagement burst. A flurry of edges appears. Both clusters pull together into a tight ball of interconnected nodes. Maximum coordination.
- Tick 44: RELAY-A disappears. Its node vanishes (with a brief red flash). Edges connected to it are severed — they snap like cut rubber bands, with the remaining endpoint springing back. The recon cluster wobbles — scouts that were connected through RELAY-A now have dangling edges.
- Tick 45: RELAY-B disappears. The recon cluster fully detaches from the strike cluster. Two disconnected sub-graphs float apart — scouts on one side, strikers and command on the other. No bridge.
- Ticks 46-72: The disconnected topology persists. The recon cluster generates signals that go nowhere (dangling edges with red X terminators). The strike cluster operates on stale data, gradually degrading.

Reina watches the disconnection happen three times, scrubbing the range slider back and forth. Each time, the moment the clusters separate is viscerally clear — the topology view splits into two islands with empty space between them. She thinks: "I need relay redundancy. Three relays, not two. Or a fallback mesh topology where scouts can directly signal the nearest striker if all relays are down."

**Minute 3:00 — The Backbone View**

Reina enables the "Show backbone only" filter. The topology strips away low-volume edges, showing only the primary communication pathways. With this filter, the late-game topology is stark: after tick 44, the backbone is two disconnected components with zero cross-edges. The metric displayed in the corner confirms: "Network connectivity: 2 components (disconnected)." Before tick 44: "Network connectivity: 1 component (connected)."

She toggles backbone off and re-enables all channels. The full river view returns. She zooms out to the full match and studies the overall shape: a healthy flowing river from left to right that fractures into separate streams at the 2/3 mark. The visual metaphor is perfect — a river that splits into disconnected tributaries.

Reina exits the Inspector with a clear architectural plan: add a third relay positioned behind the front line (survivable), add fallback hooks to scouts that allow direct-to-striker signaling on a "recon-emergency" channel if no relay acknowledges within 2 ticks, and increase the command unit's context window priority for recon data so it doesn't evict battlefield intelligence during a crisis.

**UI Annotations:**
- **Channel filter deselect all:** Right-clicking the channel legend header shows "Select none / Select all." This power-user shortcut is not tutorialized — players discover it through exploration.
- **Range selection in density bar:** Click-drag on the density bar sets a highlight range. The selected range has a brighter background (#1A3A5A vs. #0A1A2A). Arcs outside the range dim to 15% opacity. The range is synced between river and topology views.
- **Topology disconnect animation:** When a node is eliminated, its disappearance is not instant. It shrinks (200ms), turns red, then fades (100ms). Edges connected to it snap with a small particle burst at the break point — tiny fragments of the edge color scatter outward. The surviving nodes spring apart as the force simulation recalculates without the removed node's gravitational pull.
- **Network connectivity metric:** A small text readout in the bottom-left corner of the topology view shows "Components: 1 (connected)" or "Components: 2 (disconnected)" in real-time as the range slider moves. When the metric changes from 1 to 2, the text briefly flashes red.
- **Backbone filter toggle:** A small bone icon in the topology header. Active state: the icon glows and non-backbone edges fade to 5% opacity. The threshold (top 30% of edges by volume) is not configurable — simplicity over flexibility for this filter.

---

## The TikTok Clip

A 15-second clip: the topology view animates through a full match in fast-forward. Nodes pulse, edges brighten and dim, the network breathes. Then — two nodes flash red and vanish. The network fractures. Two clusters drift apart. The music drops. Cut to the player rewiring hooks in the Plan screen. Cut to the next match's topology view: three relay nodes in the center, the network holds. The clusters stay connected. The music swells. Text overlay: "Design the network. Watch it live. Watch it die. Fix it."
