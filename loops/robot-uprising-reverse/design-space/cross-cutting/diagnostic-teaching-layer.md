# 8.09 — The Diagnostic Layer as Teaching Mechanic

## The Option

Robot Uprising's diagnostic tools are not debugging utilities bolted onto the game — they ARE the game's primary teaching system. The Inspector sidebar, probe hooks, signal genealogy, and diagnostic ring form a unified diagnostic layer that teaches information architecture by making the invisible visible. This cross-cutting synthesis examines how these four tools work as a single pedagogical system, how they scale across the three-screen loop, and where the boundaries between always-on, opt-in, and expert-only should fall.

### The Unified Diagnostic Model

The four diagnostic tools share a single underlying data model: the **simulation log** — a per-tick, per-unit record of context window state, rule evaluations, signals sent/received, EM emissions, and actions taken. Every diagnostic tool is a *view* into this log, optimized for a different question:

| Tool | Question It Answers | When Available | Complexity Tier |
|------|---------------------|----------------|-----------------|
| **Inspector Sidebar** | "What happened and why?" | Act 2 (debrief) | Progressive (grows with campaign) |
| **Probe Hooks** | "What will happen at this specific point?" | Plan phase (placed), Debrief (read) | Intermediate (unlocks M5+) |
| **Signal Genealogy** | "How did this signal get here?" | Act 2 (debrief) | Advanced (unlocks M7+) |
| **Diagnostic Ring** | "Is my architecture healthy right now?" | Always-on (reduced in Sealed Watch) | Passive (grows automatically) |

The key design insight: these tools are introduced *in the order a real engineer would need them*. First you ask "what happened?" (Inspector). Then you instrument specific components (probes). Then you trace data flow (genealogy). Finally you build monitoring dashboards (ring). This is the progression from `console.log` debugging to structured observability — and the game teaches it through play, not lecture.

### The Inspector Sidebar: "The Autopsy Table"

The Inspector is the game's central diagnostic surface. It appears in Act 2 of the two-act debrief (after the emotional Sealed Watch, before the next Plan phase). The sidebar occupies the right third of the screen when a unit is selected on the board.

**What it shows (progressive disclosure across campaign):**

- **Mission 1-2**: Minimal — context window state (which slots are filled, what's in them), single-sentence action summary ("Scout moved to C4 based on patrol rule"). The context window is rendered as a vertical stack of rectangular slots, each showing a colored tag (green for observation, cyan for signal, amber for command) and a 2-3 word content label. Empty slots are dashed outlines. This is enough to answer "why did my scout go there instead of here?"

- **Mission 3-4**: Decision trace added. The sidebar gains a "WHY" section below the context window. For each tick, it shows: which rule matched, what context entries the rule examined, and whether alternative rules were considered. The decision trace is rendered as an indented tree — the matched rule highlighted in bright white, considered-but-rejected rules in dim grey with a red X showing which condition failed. This teaches the connection between context window contents and behavioral decisions.

- **Mission 5-6**: Channel metrics added. A new tab in the sidebar shows per-channel message volume, delivery success rate, and average latency. Each channel is a horizontal bar with a sparkline showing activity over time. Failed deliveries (dropped due to full context window) are marked with small red X marks on the sparkline. This teaches that signal architecture has measurable performance characteristics.

- **Mission 7-8**: Signal genealogy link. Clicking any signal in the event log opens the signal genealogy panel (see below). The sidebar gains a "TRACE" button next to each context window entry — clicking it highlights the full signal path that delivered this data, from originating unit through all relays to the current unit.

- **Mission 9-10**: Full diagnostic suite. EM emission overlay, counterfactual simulation access, career stats integration, and all advanced features from the competitive mode. The sidebar is now a full diagnostic workstation.

**The sidebar's sensory identity**: dark navy background (#1a1a2e), teal accent lines (#00bcd4) for player data, amber (#ffc107) for warnings, crimson (#dc143c) for failures. Text in DM Sans at 13px. Context window slots rendered as 20px-tall bars with 2px spacing. The whole panel has a subtle scanline texture at 5% opacity — enough to suggest a diagnostic terminal without interfering with readability.

### Probe Hooks: "The Oscilloscope"

Probe hooks are special-purpose hooks that capture diagnostic data without affecting gameplay. A player adds a probe to a specific unit's context window, rule evaluation, or hook trigger. During the next execution, the probe captures a snapshot of that element's state at every tick. In debrief, the probe data appears as a detailed timeline — a miniature time-series chart showing the probed value's evolution across the match.

**How probes are created:**
In the Plan screen workbench, each configurable element (rule, hook, context slot) has a small magnifying glass icon (12px, 30% opacity, 60% on hover). Clicking the icon attaches a probe — the icon fills to 100% opacity and gains a subtle pulse animation. A probe costs **one hook slot** on the unit (the probe IS a hook — it fires on every tick and captures state). This cost is real: probing a scout with only 2 hook slots means sacrificing one slot that could carry a gameplay hook.

**What probes capture:**
- **Context window probe**: Full buffer snapshot at every tick — all slots, their contents, their age, and whether they were referenced by any rule evaluation. Rendered in debrief as a heatmap — ticks on the x-axis, slots on the y-axis, color showing content type (green/cyan/amber/red), brightness showing reference frequency.
- **Rule evaluation probe**: Which rules fired at each tick, which conditions matched, which context entries were consulted. Rendered as a binary grid — ticks vs. rules, cells colored green (matched+fired), amber (matched but preempted by higher priority), grey (not matched).
- **Hook trigger probe**: Every hook firing — tick, trigger event, payload, channel, delivery result. Rendered as a sparse timeline with colored dots (green=delivered, red=dropped, amber=delayed).

**The cost-of-observability tradeoff:**
Probes consume hook slots. A Scout with 2 hook slots that places a probe has only 1 slot remaining for actual gameplay hooks. A Relay with 4 slots can afford probes more easily. A Command agent with 6 slots can instrument extensively. This mirrors real engineering: logging and monitoring consume resources (CPU, memory, network bandwidth). The player must decide *how much observability they can afford* — a direct teaching of the observability/overhead tradeoff from production systems.

**Auto-strip before Gauntlet deployment:**
Probes are automatically removed when a configuration is submitted to the Gauntlet competitive queue. This prevents players from wasting hook slots on diagnostics in competitive play. The stripping is visible — a brief animation of magnifying glass icons dissolving — and the freed hook slots remain empty (not auto-filled). This teaches that debugging instrumentation and production deployment are different configurations.

**The probe as teaching tool:**
The probe's power is in *showing what the player didn't configure*. A context window probe reveals buffer entries the player never explicitly created — observations from perception, signals from other units, evicted entries replaced by newer data. The player sees the emergent behavior of their architecture at the most granular level. A typical probe revelation: "I didn't know my relay was receiving 4 scout reports per tick — no wonder it overloaded at tick 12."

### Signal Genealogy: "The Family Tree"

The signal genealogy is a directed graph showing the complete provenance of any signal — from its originating event (a scout observation, an enemy movement, a resource change) through every relay, compression, and forwarding step to its final destination (a unit's context window where it influenced a decision). The genealogy answers the question every engineer eventually asks: "Where did this data come from, and how did it get here?"

**Visual design:**
The genealogy renders as a horizontal flow diagram, left-to-right. Nodes are unit icons (Scout/Relay/Striker/etc.) with tick numbers. Edges are colored lines showing the signal type (green for observation, cyan for processed, amber for compressed). Edge labels show the transformation applied at each hop — "raw observation → compress → filter → deliver."

When a signal passes through a relay's compress skill, the edge thickness changes — a thick edge (raw, multi-slot) narrows to a thin edge (compressed, 1 slot). This is the visual signature of information compression — literally watching data get smaller as it flows through the network.

**Broken edges:**
The most diagnostic feature. When a signal was *sent* but *not received* (because the receiver's context window was full), the edge renders as a dashed red line ending in a small X. Clicking the broken edge opens a sub-panel showing the receiver's full context window at that tick — all slots, their contents, and which slot *would have been* evicted if the eviction priority had been different. This is the most granular diagnostic view in the game, and it teaches that "silence is not absence of signal — it's context window management failure."

**Cross-unit genealogy:**
The genealogy can span multiple units. A scout observation at tick 5 becomes a relay signal at tick 6 (1-tick latency), then a compressed signal at tick 7, delivered to a striker at tick 8. The genealogy shows this 4-tick, 3-unit chain as a continuous flow. The player can see that their striker's tick-8 decision was based on data that was already 3 ticks old — direct teaching of **signal staleness** and **end-to-end latency**.

### The Diagnostic Ring: "The Vital Signs Monitor"

The diagnostic ring is a subtle, always-on ambient display that provides at-a-glance health information for the player's architecture. It appears as a thin (4px) ring around the board during all three screens, but with different content:

- **Plan screen**: The ring shows projected architecture complexity — number of channels (colored segments), estimated EM footprint (ring brightness), and hook density (segment spacing). A healthy architecture shows a few evenly-spaced segments in cool tones. An overengineered architecture shows many tightly-packed bright segments, pulsing amber.

- **Sealed Watch**: The ring is reduced to a single-color breathing gradient showing aggregate context window utilization across all units. Cool blue when buffers are healthy; amber when average fill exceeds 75%; red pulse when any unit overloads. This is the only diagnostic information available during sealed watch — a deliberate concession to the "no tools" philosophy that provides emotional context without analytical detail.

- **Inspector**: The ring expands with detailed per-unit health segments. Each unit gets a segment showing its context window fill (height), signal activity (brightness), and rule evaluation success rate (hue — green for rules matching, amber for mismatches). The ring becomes a peripheral-vision dashboard that lets the player monitor all units while inspecting one in detail.

**The ring as teaching tool:**
The ring's value is in *peripheral pattern recognition*. Over time, players learn to read the ring without focusing on it — they notice "the ring went amber during tick 8-12" and instinctively know to investigate that window. This teaches the real engineering skill of *monitoring dashboard design* — what information should be visible at a glance, what should require deliberate investigation, and how to set appropriate alert thresholds.

### The Teaching Arc: How the Four Tools Build on Each Other

The diagnostic layer follows a deliberate pedagogical sequence:

**Phase 1 (M1-4): "Learn to read"**
Only the Inspector sidebar (basic) and the diagnostic ring (ambient). The player learns to read context window state and rule evaluations. The ring provides subconscious pattern recognition. No probes, no genealogy — the player doesn't need them yet because architectures are simple (pre-placed units, few hooks).

**Phase 2 (M5-6): "Learn to instrument"**
Probe hooks unlock. The factory introduces multi-unit architectures complex enough that the basic Inspector isn't sufficient — the player can't track all units simultaneously. Probes let them focus diagnostic attention on specific components. The cost-of-observability tradeoff begins: "I could add a probe to my relay, but that costs a hook slot."

**Phase 3 (M7-8): "Learn to trace"**
Signal genealogy unlocks. Multi-hop signal chains (scout → relay → command → striker) are now common. The genealogy answers questions the Inspector alone can't: "The striker received stale data — where did the delay happen?" The genealogy's broken edges reveal buffer-full signal drops that were previously invisible.

**Phase 4 (M9-10): "Learn to monitor"**
The diagnostic ring reaches full functionality. The player has enough experience to read peripheral health indicators. The full diagnostic suite — Inspector + probes + genealogy + ring — works together as a unified system. The player is now doing what a real SRE does: monitoring dashboards, instrumenting suspicious components, tracing data flows, and reading detailed logs.

## Player Journeys

#### Journey: Marcus, 42, SRE at a cloud infrastructure company

**Context:** Mission 7, first encounter with signal genealogy. Marcus has been using the Inspector since Mission 1 and added his first probe in Mission 5. His architecture has grown complex — a 3-relay mesh network processing scout data for 2 strikers coordinated by a Command agent.

**Minute 0:00 — The Invisible Failure**
Sealed watch. Marcus watches his architecture execute. Everything looks nominal until tick 14 — his eastern striker freezes for a tick (context overload stun), then resumes with wrong behavior. Instead of flanking the enemy cluster, it retreats. Marcus's diagnostic ring went amber at tick 12 but he was focused on the western flank. The match ends in partial failure — enemies eliminated but one resource node lost.

**Minute 0:30 — The Inspector Tells Part of the Story**
Act 2 debrief. Marcus clicks the eastern striker at tick 14. Inspector sidebar shows: context window was full (8/8 slots), new signal arrived, oldest entry evicted — but the evicted entry was the original flank command from the Command agent. The replacement was a lower-priority scout observation. Rule evaluation: the flank rule couldn't fire because its required context entry (the flank command) had been evicted. The retreat rule fired as fallback.

Marcus understands *what* happened: eviction killed the flank command. But he doesn't know *why* the context window was full. At Mission 7, a new button appears in the Inspector sidebar: "TRACE" next to each context entry.

**Minute 1:30 — The Genealogy Reveals the Root Cause**
Marcus clicks TRACE on the scout observation that displaced the flank command. The signal genealogy panel opens — a horizontal flow diagram. The observation originated from Scout-B at tick 10 (4 ticks old!), passed through Relay-A (compressed at tick 11), then through Relay-B (filtered at tick 12), arrived at the striker at tick 13 — and was written into the context window at tick 14, evicting the flank command.

The genealogy shows the full 4-tick, 3-unit chain. Marcus's eyes widen. "The observation was already stale when it arrived. It traveled through TWO relays when it only needed ONE — Relay-B didn't need to forward it, the striker was in Relay-A's direct range."

He traces the blue line backward. Relay-B forwarded the signal because it had a hook configured to relay ALL signals on the "intel" channel — including signals already headed for their destination via a shorter path. The signal took a detour through an unnecessary relay, arriving 2 ticks later than the direct path, and the delayed arrival happened to coincide with the flank command's critical window.

"This is a routing loop," Marcus says. "I've debugged this exact pattern in our production Kafka cluster. Duplicate messages because a consumer was also a producer on the same topic."

**Minute 3:00 — The Fix**
Marcus adds a filter to Relay-B's hook: "only forward signals NOT already tagged as 'direct-delivery.'" He adds a "direct-delivery" tag to Relay-A's forwarding hook (since Relay-A is the striker's intended source). The signal genealogy preview in Plan mode shows the observation now taking the direct A→striker path (2 ticks) instead of the A→B→striker path (3 ticks).

He also places a probe on the striker's context window for the next run — he wants to verify the eviction pattern has changed. The probe costs one hook slot (striker has 2), leaving only one for gameplay. "Worth it," he decides. "One run of diagnostic data, then I'll remove the probe."

**UI Annotations:**
- TRACE button: small teal magnifying glass, 16px, appears next to each context window entry in Inspector sidebar
- Signal genealogy panel: opens as 400px-wide overlay on the left side, pushing the board right; horizontal flow diagram with unit icons as nodes
- Broken edge: dashed red line with X terminus, hover shows receiving buffer state tooltip
- Relay-to-relay duplicate path: highlighted in amber when genealogy shows signal arriving via multiple paths

#### Journey: Anika, 14, first-timer completing her first probe placement in Mission 5

**Context:** Mission 5, factory introduction. Anika has been playing for 4 hours across Missions 1-4. She's comfortable with the Inspector sidebar (basic) and has noticed the diagnostic ring changing color during sealed watch. This is her first mission with the factory — and the first time she'll place a probe hook.

**Minute 0:00 — The Factory Overwhelm**
Mission 5 opens with the boot log introducing the factory and blueprints. Anika builds her first blueprint — a Scout with 2 hook slots configured for patrol and alert. She builds a second — a Striker with engage and breach. She connects them with a hook channel called "enemies." She queues them in the production order: Scout first, Striker second.

First execution: the Scout deploys, patrols, spots enemies, broadcasts on "enemies." The Striker deploys 3 ticks later, receives the signal, moves to engage... and arrives too late. The enemies have moved. The stale signal led the Striker to an empty tile.

**Minute 1:00 — The Diagnostic Prompt**
In the Inspector, Anika clicks her Striker at the tick where it moved to the wrong tile. The sidebar shows the context window: one entry — a signal from "enemies" channel, received at tick 5, containing position data from the Scout's tick-3 observation. The decision trace shows Rule 1 matched: "IF enemies channel has data THEN engage nearest." The data was 2 ticks stale.

A small tooltip appears next to the context window entry: "Want to capture more detail? [Place a probe]" This is the boot log's introduction to probes — a contextual prompt that appears only when the player is looking at diagnostic data that a probe would clarify.

**Minute 1:30 — The First Probe**
Anika clicks the prompt. The Plan screen opens with her Scout blueprint focused. The magnifying glass icon next to the Scout's context window pulses gently — "click to place a probe here." She clicks. The icon fills to full opacity and begins breathing. A tooltip appears: "Probe placed. This will capture your Scout's context window state at every tick during the next execution. Cost: 1 hook slot."

Anika notices her Scout now has only 1 hook slot available (it had 2; one is now the probe). Her "enemies" alert hook still works. She executes again.

**Minute 2:30 — The Probe Revelation**
In the post-match debrief, a new panel appears: "Probe Results — Scout Context Window." It's a heatmap — ticks on the x-axis (20 ticks total), context window slots on the y-axis (6 slots). Each cell is colored by content type. Anika sees:
- Slots 1-3 are filled with green (observations from patrol) within the first 5 ticks
- Slot 4 fills with an observation at tick 6 that she recognizes — that's the enemy position her Scout saw
- Slots 5-6 fill with MORE observations at ticks 7-8 as the Scout continues patrolling
- At tick 9, slot 4's observation (the enemy position) is evicted — replaced by a newer patrol observation

"The enemy position got pushed out!" Anika says. She can see the exact tick where the critical information was lost. The probe showed her something the basic Inspector couldn't — the *temporal dynamics* of the context window. The static snapshot showed "stale data"; the probe timeline shows "fresh data arrived and pushed out the important data."

**Minute 3:30 — The Connection**
Anika realizes: the Scout is observing too many things. Its 6-slot context window fills with patrol observations, and the enemy sighting gets evicted before the Striker can act on it. She needs either a larger buffer (can't change, locked per unit type) or better filtering (she can do this via context config — ignore low-priority patrol observations, keep high-priority enemy sightings).

She adjusts the Scout's context config: set "enemy observation" to HIGH eviction priority (last to be evicted) and "terrain observation" to LOW eviction priority (first to be evicted). On the next execution, the probe shows the enemy sighting persisting in the context window while terrain observations cycle through the remaining slots. The Striker receives fresh enemy position data and eliminates the target.

Anika removes the probe — she doesn't need it anymore, and she wants the hook slot back for a second gameplay hook she's planning. "I'll probe again if something breaks," she says, unconsciously adopting the engineering practice of temporary instrumentation.

**UI Annotations:**
- Probe heatmap: rendered in a 300x200px panel with tick numbers along bottom, slot numbers along left, cells 12x15px with 1px gap, hover shows full content
- Eviction event: cell border flashes red for 200ms when content is evicted, new content slides in from right
- Probe icon: 12px magnifying glass, 30% opacity default, 60% hover, 100% active with 3-second breathing animation

#### Journey: Dr. Priya, 38, ML researcher using Robot Uprising for a guest lecture on observability

**Context:** Dr. Priya is preparing a 50-minute guest lecture for a graduate systems engineering course. She's using Robot Uprising Mission 8 as a demonstration platform. She's Diamond III in Gauntlet and knows the game deeply.

**Minute 0:00 — The Lecture Setup**
Priya projects her screen to 40 students. She has a Mission 8 replay loaded — a complex architecture with 2 relays, 3 scouts, 2 strikers, and a Command agent. She's pre-placed probes on the Command agent and one relay.

"Today we're talking about observability," she says. "I'm going to show you a distributed system that processes signals, makes decisions, and fails in ways that are invisible without the right tools. The only difference between this and your production Kafka cluster is that this one has cute robot sprites."

**Minute 2:00 — The Four Layers**
She walks through each diagnostic tool:

1. **Diagnostic ring**: "This is your Grafana dashboard. Peripheral, always-on, pattern-over-detail. When it goes amber, you know something is wrong. You don't know what."

2. **Inspector sidebar**: "This is your application logs. You pick a component, you read its state at a point in time. Good for 'what happened' — bad for 'why.'"

3. **Probe hooks**: "This is your custom instrumentation — OpenTelemetry traces, structured logging, Datadog custom metrics. It costs resources to run. You don't instrument everything; you instrument what you suspect."

4. **Signal genealogy**: "This is distributed tracing. Jaeger, Zipkin, AWS X-Ray. You trace a request from origin to destination through every service it touched. This is where you find the routing loop, the dropped message, the stale cache."

A student raises her hand: "The game literally has the same four layers as our production monitoring stack?"

Priya smiles. "Same four layers, same tradeoffs. The game just teaches them in 10 hours instead of 10 years."

**Minute 10:00 — The Live Demonstration**
Priya scrubs to tick 22 in the replay — a moment where the Command agent makes a surprising reassignment decision. She clicks the Command agent in the Inspector. The sidebar shows its context window: 14 slots, 12 filled, 2 empty. The decision trace shows Rule 7 matched: "IF threat_level > HIGH AND eastern_sector undefended THEN reassign striker_beta to eastern_sector."

"Where did 'threat_level > HIGH' come from?" she asks the class.

She clicks TRACE on the threat_level context entry. The signal genealogy opens. The threat data originated from Scout-A at tick 18 (observation of 3 enemy units), was compressed by Relay-B at tick 19 (3 observations compressed to 1 summary), forwarded to Command at tick 20. The genealogy shows a clean 3-hop chain with compression at the relay.

"Now look at the compression step," Priya says. The genealogy edge from Relay-B shows the transformation: 3 entries → 1 entry, tagged "threat_level=HIGH." She clicks the relay's probe data at tick 19. The probe shows Relay-B's full context window — all 12 slots — with the 3 scout observations arriving simultaneously, the compress skill activating, and the output signal being generated.

"The relay is doing semantic compression," a student says. "It's reducing three raw observations to one categorical assessment."

"Exactly," Priya says. "And what happens if the relay is destroyed?" She scrubs forward to tick 25 where an enemy striker eliminates Relay-B. She shows the Command agent's context window at tick 26: the threat_level entry from tick 20 is still there but now 6 ticks old. No new compression is arriving. The genealogy shows a broken edge — Scout-A is still sending observations, but without Relay-B they have no path to Command.

"Single point of failure in the signal path," another student says. "Same thing that happened when our Redis cache went down last week."

**UI Annotations:**
- Probe data overlay: when a probed unit is selected in Inspector, the probe timeline appears as a secondary panel below the sidebar, with synchronized tick cursor (clicking a tick in either panel updates both)
- Genealogy compression edge: thick-to-thin edge transition at relay nodes, with tooltip showing input/output slot count
- Broken edge post-destruction: the edge animates from solid to dashed to invisible over 3 ticks after the relay unit is eliminated, representing the last signals draining from the pipeline

## Strengths and Weaknesses

**Strengths:**
- The four tools form a natural pedagogical progression that mirrors real engineering observability maturity
- Probe hooks' hook-slot cost creates a genuine resource tradeoff — diagnostics are not free, just like real instrumentation
- Signal genealogy's broken edges reveal the most common failure mode (buffer-full signal drops) in a visually intuitive way
- The diagnostic ring provides passive pattern recognition that builds intuition over time without requiring active attention
- Every tool maps directly to a real engineering concept (logs, traces, metrics, dashboards), making the teaching transfer explicit

**Weaknesses:**
- Four overlapping diagnostic tools risk confusion about which tool to use when — players may reach for the wrong tool and get frustrated
- Probe hook cost means diagnostic data is least available for the units that need it most (Scouts with only 2 hook slots)
- Signal genealogy for complex architectures (8+ units, 4+ channels) can produce graphs too dense to read on screen
- The diagnostic ring's subtle visual treatment may be overlooked entirely by action-focused players

## Interaction Effects

- **Inspector universal substrate (8.03b)**: The diagnostic layer builds on the Inspector's single-simulation-log data model. All four tools read the same log.
- **Sealed watch purity (locked)**: Only the diagnostic ring is visible during sealed watch, and in reduced form. The deliberate information asymmetry between watch (emotional) and debrief (analytical) is preserved.
- **Blueprint Codex (locked)**: Probe results and genealogy diagrams can be saved as Codex entries, creating a diagnostic reference library.
- **Two-act debrief (4.04b)**: The diagnostic layer is exclusively an Act 2 feature. Act 1 (Sealed Watch) shows only the ring. The temporal separation between emotional and analytical processing is load-bearing.
- **Vocabulary claim (8.08)**: The diagnostic layer's 1:1 mapping to real engineering tools (logs/traces/metrics/dashboards) is the strongest evidence for the game's vocabulary claim. Every diagnostic interaction uses real engineering vocabulary.
- **Probe hook suggestion (4.67)**: The pre-ranking transparency panel suggests probe placements — connecting the competitive diagnostic tools to the teaching-layer probes.
- **Context overload (locked)**: The diagnostic layer's primary teaching target is context window management. Every tool contributes to making overload causes visible.

## Comparable Games

- **Factorio**: No built-in diagnostic layer. Community built Bottleneck mod (highlights underperforming inserters), FNEI (recipe browser), and Rate Calculator (throughput projection). Robot Uprising builds these tools into the game from the start — the diagnostic layer IS the game, not a mod.
- **Gladiabots**: Community-developed "debugging sub-AI" pattern — a condition-only behavior tree at the root that makes current sensing state visible in the log. Robot Uprising's probe hooks formalize this community workaround as a first-class mechanic.
- **Screeps**: `console.log` as primary diagnostic tool. Memory inspector available but crude. Players build their own monitoring dashboards. Robot Uprising provides structured diagnostics that Screeps players have to build from scratch.
- **Into the Breach**: Perfect information — no diagnostics needed because everything is visible. The polar opposite of Robot Uprising's design, where information is hidden by default and diagnostics reveal it progressively.
- **Zachtronics (Shenzhen I/O, TIS-100)**: Step-through execution with per-node state inspection. The closest precedent to Robot Uprising's Inspector, but without signal tracing or probe hooks — Zachtronics debuggers show state, not provenance.

## Sensory Description

The diagnostic layer at full power in Mission 9, Act 2 debrief: the board sits center-left, isometric tiles showing the Taal volcano map in muted tones (warm colors desaturated during Inspector mode). The diagnostic ring encircles the board — a thin 4px ring divided into 8 segments, one per active unit. Most segments glow cool blue (healthy); one segment pulses amber (the relay that overloaded at tick 18).

Marcus clicks the relay. The Inspector sidebar slides in from the right — dark navy panel with teal accents, context window slots rendered as horizontal bars. The 12 slots show: 10 occupied (dense activity), 2 empty. A red pulse on slot 8 marks the overloaded tick. The decision trace below shows rules that fired and rules that couldn't fire due to missing context.

He clicks TRACE on slot 3 — a compressed signal from Scout-A. The signal genealogy opens as an overlay: a horizontal flow from Scout-A (tick 14, green observation node) through the relay (tick 15, cyan compress node, edge thins) to Striker-B (tick 16, delivered). Below it, a second branch — Scout-B's observation at tick 14, same relay, same tick — the edge is dashed red, ending in an X. The relay couldn't accept Scout-B's signal because it was processing Scout-A's. The broken edge pulses gently, inviting inspection.

He clicks the broken edge. A sub-panel opens showing the relay's buffer at tick 15: all 12 slots, content labels, age counters. Slot 12 — the one that would have received Scout-B's signal — is occupied by a 4-tick-old terrain observation that should have been evicted. The eviction priority was misconfigured: terrain observations had MEDIUM priority instead of LOW.

The probe data for the relay shows a heatmap below the sidebar — 30 ticks across, 12 slots down. The pattern is clear: slots 1-8 cycle rapidly (healthy), slots 9-12 accumulate stale data (amber, then red as they age). The probe reveals the systemic pattern that the single-tick Inspector snapshot couldn't show.

Marcus adjusts the eviction priority. The genealogy preview in Plan mode shows both scout signals now reaching the relay — no broken edges. The diagnostic ring, which he'll watch peripherally during the next sealed watch, will confirm the fix by staying blue through the critical tick-14-18 window.

The sound of it all: the TRACE button makes a soft "click" like plugging in a diagnostic cable. The genealogy panel slides in with a quiet whoosh of rushing data. Broken edges make a barely-audible low hum — a signal that exists but can't arrive. The probe heatmap, when scrolled, produces faint ticking sounds synchronized to tick numbers — the heartbeat of the system rendered as audio.
